"use client";

import { useEffect, useRef } from "react";

type N = { x: number; y: number; z: number; label?: string; flash: number; px: number; py: number; s: number };
type P = { a: number; b: number; t: number; v: number; hue: string };

const labels = [
  "research_agent", "playwright.click()", "langfuse.trace", "rag.retrieve", "n8n.webhook", "eval.faithfulness 0.94",
  "crm.upsert", "langsmith.run", "tool: web_search", "guardrail ✓", "supervisor", "page.fill()", "rerank top-8",
  "slack.notify", "cost $0.009",
];
const hues = ["255,92,92", "96,165,250", "52,211,153", "255,190,120"];

/**
 * A slowly turning 3D constellation of agents. Packets of work travel along the links and make nodes flash
 * when they land, a living diagram of agents, tools and traces talking to each other. Pauses off-screen.
 */
export function AgentMesh({ className = "", paused = false }: { className?: string; paused?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  // read inside the loop so toggling pause never rebuilds the scene
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1, raf = 0, visible = true, last = performance.now(), spawnAcc = 0;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    // Fibonacci sphere: evenly spread nodes.
    const COUNT = 46;
    const nodes: N[] = Array.from({ length: COUNT }, (_, i) => {
      const y = 1 - (i / (COUNT - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = i * 2.399963;
      return { x: Math.cos(th) * r, y, z: Math.sin(th) * r, flash: 0, px: 0, py: 0, s: 1, label: i % 3 === 0 ? labels[(i / 3) % labels.length] : undefined };
    });
    const edges: [number, number][] = [];
    nodes.forEach((n, i) => {
      const near = nodes
        .map((m, j) => ({ j, d: (m.x - n.x) ** 2 + (m.y - n.y) ** 2 + (m.z - n.z) ** 2 }))
        .filter((o) => o.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 3);
      near.forEach(({ j }) => i < j && edges.push([i, j]));
    });
    const packets: P[] = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (!visible || pausedRef.current || document.hidden) {
        last = now;
        return;
      }
      const dt = Math.min(50, now - last) / 1000;
      last = now;
      mouse.x += (mouse.tx - mouse.x) * 0.03;
      mouse.y += (mouse.ty - mouse.y) * 0.03;

      const R = Math.min(w * 0.46, h * 0.62);
      const cx = w / 2, cy = h * 0.52;
      const rotY = (reduce ? 0 : now / 26000) + mouse.x * 0.35;
      const rotX = -0.32 + mouse.y * 0.18;
      const cY = Math.cos(rotY), sY = Math.sin(rotY), cX = Math.cos(rotX), sX = Math.sin(rotX);

      for (const n of nodes) {
        const x1 = n.x * cY - n.z * sY;
        const z1 = n.x * sY + n.z * cY;
        const y2 = n.y * cX - z1 * sX;
        const z2 = n.y * sX + z1 * cX;
        const persp = 1.9 / (2.6 - z2);
        n.px = cx + x1 * R * persp;
        n.py = cy + y2 * R * persp;
        n.s = (z2 + 1) / 2; // 0 = far, 1 = near
        n.flash = Math.max(0, n.flash - dt * 1.6);
      }

      ctx.clearRect(0, 0, w, h);
      // links
      for (const [a, b] of edges) {
        const A = nodes[a], B = nodes[b];
        const depth = (A.s + B.s) / 2;
        ctx.strokeStyle = `rgba(255,255,255,${0.035 + depth * 0.09})`;
        ctx.lineWidth = 0.6 + depth * 0.6;
        ctx.beginPath();
        ctx.moveTo(A.px, A.py);
        ctx.lineTo(B.px, B.py);
        ctx.stroke();
      }

      // spawn + move packets
      spawnAcc += dt;
      while (!reduce && spawnAcc > 0.14) {
        spawnAcc -= 0.14;
        const [a, b] = edges[(Math.random() * edges.length) | 0];
        const flip = Math.random() < 0.5;
        packets.push({ a: flip ? b : a, b: flip ? a : b, t: 0, v: 0.45 + Math.random() * 0.7, hue: hues[(Math.random() * hues.length) | 0] });
      }
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.t += dt * p.v;
        const A = nodes[p.a], B = nodes[p.b];
        if (p.t >= 1) {
          B.flash = 1;
          packets.splice(i, 1);
          continue;
        }
        const x = A.px + (B.px - A.px) * p.t, y = A.py + (B.py - A.py) * p.t;
        const tx = A.px + (B.px - A.px) * Math.max(0, p.t - 0.18), ty = A.py + (B.py - A.py) * Math.max(0, p.t - 0.18);
        const depth = A.s + (B.s - A.s) * p.t;
        const g = ctx.createLinearGradient(tx, ty, x, y);
        g.addColorStop(0, `rgba(${p.hue},0)`);
        g.addColorStop(1, `rgba(${p.hue},${0.35 + depth * 0.6})`);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1 + depth * 1.4;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.fillStyle = `rgba(${p.hue},${0.5 + depth * 0.5})`;
        ctx.beginPath();
        ctx.arc(x, y, 1 + depth * 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // nodes (far first)
      const order = [...nodes].sort((a, b) => a.s - b.s);
      ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
      for (const n of order) {
        const r = 1.4 + n.s * 2.6 + n.flash * 3;
        if (n.flash > 0.02) {
          ctx.fillStyle = `rgba(255,92,92,${n.flash * 0.16})`;
          ctx.beginPath();
          ctx.arc(n.px, n.py, r * 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = n.flash > 0.3 ? `rgba(255,170,150,${0.6 + n.s * 0.4})` : `rgba(255,255,255,${0.25 + n.s * 0.65})`;
        ctx.beginPath();
        ctx.arc(n.px, n.py, r, 0, Math.PI * 2);
        ctx.fill();
        if (n.label && n.s > 0.45) {
          ctx.fillStyle = `rgba(255,255,255,${(n.s - 0.45) * 0.9 + n.flash * 0.4})`;
          ctx.fillText(n.label, n.px + r + 6, n.py + 4);
        }
      }
    };

    const onMove = (e: PointerEvent) => {
      mouse.tx = e.clientX / window.innerWidth - 0.5;
      mouse.ty = e.clientY / window.innerHeight - 0.5;
    };
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting));
    io.observe(canvas);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={ref} className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden />;
}

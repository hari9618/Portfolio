"use client";

import { useEffect, useRef } from "react";

type Star = { x: number; y: number; z: number; r: number; tw: number; sp: number; hue: number };
type Shoot = { x: number; y: number; vx: number; vy: number; life: number };

/**
 * Canvas starfield: depth-layered twinkling stars with mouse parallax and the occasional
 * shooting star. Pauses when off-screen so it costs nothing while you read further down.
 */
export function Starfield({ density = 1, className = "", paused = false }: { density?: number; className?: string; paused?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1, raf = 0, visible = true;
    let stars: Star[] = [];
    const shoots: Shoot[] = [];
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.floor(((w * h) / 2600) * density);
      stars = Array.from({ length: n }, () => {
        const z = Math.random();
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          z,
          r: z * 1.25 + 0.2,
          tw: Math.random() * Math.PI * 2,
          sp: 0.6 + Math.random() * 2.2,
          // mostly white, some warm (coral/amber) and some cool (sky) like the reference sky
          hue: Math.random() < 0.12 ? 18 + Math.random() * 25 : Math.random() < 0.25 ? 205 : -1,
        };
      });
    };

    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      if (!visible || pausedRef.current || document.hidden) return;
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      ctx.clearRect(0, 0, w, h);
      const time = t / 1000;
      for (const s of stars) {
        const px = s.x + mouse.x * s.z * 18;
        const py = s.y + mouse.y * s.z * 12 - (reduce ? 0 : (time * 2 * s.z) % h);
        const yy = ((py % h) + h) % h;
        const a = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(s.tw + time * s.sp)) * (0.35 + s.z * 0.65);
        ctx.beginPath();
        ctx.fillStyle = s.hue < 0 ? `rgba(255,255,255,${a})` : `hsla(${s.hue},95%,72%,${a})`;
        ctx.arc(px, yy, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (s.r > 1.25) {
          ctx.beginPath();
          ctx.fillStyle = s.hue < 0 ? `rgba(255,255,255,${a * 0.12})` : `hsla(${s.hue},95%,65%,${a * 0.18})`;
          ctx.arc(px, yy, s.r * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (!reduce && Math.random() < 0.006 && shoots.length < 2) {
        shoots.push({ x: Math.random() * w * 0.8, y: Math.random() * h * 0.35, vx: 7 + Math.random() * 4, vy: 2.5 + Math.random() * 2, life: 1 });
      }
      for (let i = shoots.length - 1; i >= 0; i--) {
        const s = shoots[i];
        const g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 14, s.y - s.vy * 14);
        g.addColorStop(0, `rgba(255,255,255,${s.life})`);
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 14, s.y - s.vy * 14);
        ctx.stroke();
        s.x += s.vx;
        s.y += s.vy;
        s.life -= 0.018;
        if (s.life <= 0) shoots.splice(i, 1);
      }
    };

    const onMove = (e: PointerEvent) => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting));
    io.observe(canvas);
    const ro = new ResizeObserver(build);
    ro.observe(canvas);
    build();
    raf = requestAnimationFrame(draw);
    window.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [density]);

  return <canvas ref={ref} className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden />;
}

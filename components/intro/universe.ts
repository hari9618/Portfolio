// Canvas engine for the cinematic intro. One requestAnimationFrame loop draws a deterministic storyboard:
// darkness -> layered stars -> a network that wires itself node by node -> an agent pipeline firing ->
// signals converging on a core -> a synchronising pulse -> a calm, dimmed field for the name reveal.
// Timeline seconds are shared with the score in lib/cinematic-audio.ts (CUE).

import { CUE } from "@/lib/cinematic-audio";

export type Cue = "name" | "title" | "sweep" | "emerge" | "exit" | "done";
export const CUE_AT: Record<Cue, number> = { name: 4.5, title: 5.55, sweep: 6.3, emerge: 7.2, exit: 7.45, done: 9.3 };

type Star = { x: number; y: number; z: number; r: number; tw: number; sp: number; appear: number; tint: number };
type Node = {
  x: number; y: number; z: number; label?: string; appear: number; flash: number; active: number;
  px: number; py: number; d: number;
};
type Edge = { a: number; b: number; start: number; bend: number; pipe: boolean };
type Signal = { a: number; b: number; t0: number; dur: number; tint: number; toCore?: boolean; arrive?: () => void; e?: Edge | null };

const TINTS = ["255,255,255", "255,96,92", "128,170,255", "52,211,153"]; // white, coral, muted blue, rare green

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (v: number) => 1 - Math.pow(1 - clamp(v), 3);
const fadeIn = (t: number, start: number, len: number) => ease((t - start) / len);

function sprite(rgb: string, size = 64) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grd.addColorStop(0, `rgba(${rgb},1)`);
  grd.addColorStop(0.18, `rgba(${rgb},0.55)`);
  grd.addColorStop(0.5, `rgba(${rgb},0.12)`);
  grd.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grd;
  g.fillRect(0, 0, size, size);
  return c;
}

export class IntroUniverse {
  t = 0; // wall timeline (drives cues; pauses with the tab because rAF does)
  private st = 0; // signal clock: equals t until the reveal, then slows so the field calms down
  private raf = 0;
  private last = 0;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private stars: Star[] = [];
  private nodes: Node[] = [];
  private edges: Edge[] = [];
  private queued: Signal[] = [];
  private signals: Signal[] = [];
  private spawnAcc = 0;
  private coreBoost = 0;
  private mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  private sprites: HTMLCanvasElement[] = [];
  private fired = new Set<Cue>();
  private ctx: CanvasRenderingContext2D;
  private rand = rng(20261017);

  constructor(private canvas: HTMLCanvasElement, private opts: { mobile: boolean; onCue: (c: Cue) => void }) {
    this.ctx = canvas.getContext("2d")!;
    this.sprites = TINTS.map((t) => sprite(t));
    this.resize();
    this.build();
  }

  // ---------- scene construction ----------
  private build() {
    const R = this.rand;
    const m = this.opts.mobile;
    const area = (this.w * this.h) / (1440 * 900);

    // Stars: three depth layers, each star fades in somewhere in 0.8 - 2.0 s.
    const layers = m ? [[220, 0.15], [90, 0.5], [18, 0.95]] : [[Math.round(560 * area), 0.15], [Math.round(210 * area), 0.5], [Math.round(46 * area), 0.95]];
    for (const [count, z] of layers) {
      for (let i = 0; i < count; i++) {
        const zz = z + (R() - 0.5) * 0.2;
        this.stars.push({
          x: (R() * 2 - 1) * 1.15, y: (R() * 2 - 1) * 1.15, z: zz,
          r: zz < 0.3 ? 0.35 + R() * 0.45 : zz < 0.7 ? 0.6 + R() * 0.6 : 1 + R() * 0.9,
          tw: R() * Math.PI * 2, sp: 0.5 + R() * 1.8,
          appear: 0.8 + Math.pow(R(), 1.4) * 1.2,
          tint: R() < 0.08 ? 1 : R() < 0.18 ? 2 : 0,
        });
      }
    }

    // First light: a few brighter stars that appear one by one in the first second.
    for (let i = 0; i < (m ? 4 : 7); i++) {
      this.stars.push({ x: (R() * 2 - 1) * 0.9, y: (R() * 2 - 1) * 0.8, z: 0.9, r: 1.5 + R() * 0.8, tw: R() * 6, sp: 0.4 + R() * 0.6, appear: 0.55 + i * 0.13, tint: i === 3 ? 2 : 0 });
    }

    // Agents: a labelled ring around the core (the pipeline sweeps around it), plus quiet unlabelled nodes.
    const pipeline = m
      ? ["research", "retrieve", "rerank", "reason", "tool.call", "execute"]
      : ["research", "search", "retrieve", "rerank", "reason", "tool.call", "execute"];
    const others = m ? ["memory", "eval"] : ["browser", "memory", "planner", "eval", "guardrail", "crm.upsert", "summarize"];
    const labels = [...pipeline, ...others];
    const startAng = -Math.PI * 0.86;
    labels.forEach((label, i) => {
      const isPipe = i < pipeline.length;
      const ang = isPipe ? startAng + i * (m ? 0.52 : 0.4) : startAng + pipeline.length * (m ? 0.52 : 0.4) + 0.3 + (i - pipeline.length) * ((Math.PI * 2 - pipeline.length * (m ? 0.52 : 0.4) - 0.6) / Math.max(1, others.length - 1));
      const rad = 0.62 + R() * 0.2;
      this.nodes.push({ x: Math.cos(ang) * rad, y: Math.sin(ang) * rad, z: 0.55 + R() * 0.4, label, appear: 9, flash: 0, active: 0, px: 0, py: 0, d: 1 });
    });
    const plain = m ? 16 : 40;
    for (let i = 0; i < plain; i++) {
      let x = 0, y = 0;
      do {
        const ang = R() * Math.PI * 2;
        const rad = 0.3 + Math.sqrt(R()) * 0.95;
        x = Math.cos(ang) * rad;
        y = Math.sin(ang) * rad;
      } while (Math.hypot(x, y) < 0.3);
      this.nodes.push({ x, y, z: 0.2 + R() * 0.7, appear: 9, flash: 0, active: 0, px: 0, py: 0, d: 1 });
    }

    // Links: two nearest neighbours each, plus the pipeline chain.
    const key = new Set<string>();
    const add = (a: number, b: number, pipe = false) => {
      const k = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (key.has(k)) return;
      key.add(k);
      this.edges.push({ a, b, start: 9, bend: (R() - 0.5) * 0.35, pipe });
    };
    this.nodes.forEach((n, i) => {
      this.nodes
        .map((o, j) => ({ j, d: Math.hypot(o.x - n.x, o.y - n.y) }))
        .filter((o) => o.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2)
        .forEach(({ j }) => add(i, j));
    });
    for (let i = 0; i < pipeline.length - 1; i++) add(i, i + 1, true);

    // Reveal order: breadth-first from the node nearest the centre, so the network grows outward.
    const adj = this.nodes.map(() => [] as number[]);
    this.edges.forEach((e, k) => { adj[e.a].push(k); adj[e.b].push(k); });
    const anchors = m ? [[-0.5, -0.45], [0.5, 0.45], [0.45, -0.5]] : [[-0.62, -0.3], [0.6, -0.4], [0.42, 0.55], [-0.45, 0.55]];
    const seeds = anchors.map(([ax, ay]) => {
      let best = 0;
      this.nodes.forEach((n, i) => { if (Math.hypot(n.x - ax, n.y - ay) < Math.hypot(this.nodes[best].x - ax, this.nodes[best].y - ay)) best = i; });
      return best;
    });
    const order: number[] = [];
    const seenE = new Set<number>(), seenN = new Set<number>(seeds);
    const q = [...seeds];
    while (q.length) {
      const n = q.shift()!;
      for (const k of adj[n]) {
        if (seenE.has(k)) continue;
        seenE.add(k);
        order.push(k);
        const o = this.edges[k].a === n ? this.edges[k].b : this.edges[k].a;
        if (!seenN.has(o)) { seenN.add(o); q.push(o); }
      }
    }
    this.edges.forEach((_, k) => !seenE.has(k) && order.push(k));
    seeds.forEach((s, i) => (this.nodes[s].appear = 1.3 + i * 0.14));
    order.forEach((k, i) => {
      const e = this.edges[k];
      e.start = e.pipe ? 2.35 + (this.edges.filter((x) => x.pipe).indexOf(e)) * 0.05 : 1.5 + (i / order.length) * 1.55 + R() * 0.08;
      for (const n of [e.a, e.b]) this.nodes[n].appear = Math.min(this.nodes[n].appear, e.start + (n === e.a ? 0 : 0.4));
    });
    this.nodes.forEach((n) => { if (n.label) n.appear = Math.min(n.appear, 2.3); });

    // Scripted signals: the pipeline hop chain (synced to the score), then convergence waves into the core.
    for (let i = 0; i < pipeline.length - 1; i++) {
      const arrive = CUE.hops[i];
      this.queued.push({ a: i, b: i + 1, t0: arrive - 0.26, dur: 0.26, tint: 1, arrive: () => { this.nodes[i + 1].active = 1; this.nodes[i + 1].flash = 0.9; } });
    }
    this.queued.push({ a: 0, b: 0, t0: CUE.hops[0] - 0.3, dur: 0.01, tint: 1, arrive: () => { this.nodes[0].active = 1; this.nodes[0].flash = 0.9; } });
    const labelled = labels.map((_, i) => i);
    CUE.converge.forEach((arrive, w) => {
      labelled.filter((i) => i % CUE.converge.length === w).forEach((i, k) => {
        this.queued.push({ a: i, b: -1, t0: arrive - 0.5 + k * 0.03, dur: 0.5, tint: w === 3 ? 0 : 1, toCore: true, arrive: () => { this.coreBoost = Math.min(1.6, this.coreBoost + 0.35); } });
      });
    });
    this.queued.sort((a, b) => a.t0 - b.t0);
  }

  // ---------- lifecycle ----------
  resize = () => {
    this.dpr = Math.min(window.devicePixelRatio || 1, this.opts.mobile ? 1.5 : 2);
    this.w = this.canvas.clientWidth || window.innerWidth;
    this.h = this.canvas.clientHeight || window.innerHeight;
    this.canvas.width = this.w * this.dpr;
    this.canvas.height = this.h * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  };
  setMouse(x: number, y: number) {
    this.mouse.tx = x;
    this.mouse.ty = y;
  }
  start() {
    this.last = performance.now();
    const loop = (now: number) => {
      this.raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.step(dt);
      this.draw();
    };
    this.raf = requestAnimationFrame(loop);
  }
  stop() {
    cancelAnimationFrame(this.raf);
  }
  /** Jump the storyboard (used by "skip"). */
  jump(t: number) {
    this.t = Math.max(this.t, t);
    this.st = Math.max(this.st, Math.min(t, 4.6));
  }

  // ---------- simulation ----------
  private step(dt: number) {
    this.t += dt;
    const slow = this.t < 4.6 ? 1 : Math.max(0.32, 1 - (this.t - 4.6) * 0.75);
    this.st += dt * slow;
    for (const [cue, at] of Object.entries(CUE_AT) as [Cue, number][]) {
      if (!this.fired.has(cue) && this.t >= at) {
        this.fired.add(cue);
        this.opts.onCue(cue);
      }
    }
    this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.04;
    this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.04;
    this.coreBoost = Math.max(0, this.coreBoost - dt * 0.9);
    for (const n of this.nodes) {
      n.flash = Math.max(0, n.flash - dt * 1.4);
      n.active = Math.max(0, n.active - dt * 0.35);
    }
    if (this.st >= 4.55 && this.st - dt * slow < 4.55) this.nodes.forEach((n) => (n.flash = Math.max(n.flash, 0.85 * n.z)));

    while (this.queued.length && this.queued[0].t0 <= this.st) {
      const s = this.queued.shift()!;
      s.e = s.toCore ? null : this.edgeOf(s.a, s.b);
      this.signals.push(s);
    }

    // ambient traffic between revealed nodes: busy while agents work, sparse after the reveal
    const rate = (this.st < 2.2 ? 0 : this.st < 4.6 ? 7 : 2.2) * (this.opts.mobile ? 0.5 : 1);
    this.spawnAcc += dt * slow * rate;
    while (this.spawnAcc >= 1) {
      this.spawnAcc -= 1;
      const live = this.edges.filter((e) => e.start + 0.45 <= this.st);
      if (!live.length) break;
      const e = live[(this.rand() * live.length) | 0];
      const flip = this.rand() < 0.5;
      const r = this.rand();
      this.signals.push({ a: flip ? e.b : e.a, b: flip ? e.a : e.b, t0: this.st, dur: 0.7 + this.rand() * 0.9, tint: r < 0.5 ? 0 : r < 0.8 ? 1 : r < 0.96 ? 2 : 3, e });
    }
    for (let i = this.signals.length - 1; i >= 0; i--) {
      const s = this.signals[i];
      if (this.st >= s.t0 + s.dur) {
        if (!s.toCore && s.b >= 0) this.nodes[s.b].flash = Math.max(this.nodes[s.b].flash, 0.45);
        s.arrive?.();
        this.signals.splice(i, 1);
      }
    }
  }

  private edgeOf(a: number, b: number) {
    return this.edges.find((x) => (x.a === a && x.b === b) || (x.a === b && x.b === a)) ?? null;
  }

  // ---------- rendering ----------
  private project() {
    const { w, h, mouse } = this;
    const push = 1 + 0.04 * ease(this.t / 9) + (this.t > CUE_AT.exit ? Math.pow(this.t - CUE_AT.exit, 2) * 0.06 : 0);
    const sx = (w / 2) * (this.opts.mobile ? 0.98 : 0.86) * push;
    const sy = (h / 2) * (this.opts.mobile ? 0.62 : 0.8) * push;
    for (const n of this.nodes) {
      const par = (n.z - 0.5) * 34;
      n.px = w / 2 + n.x * sx + mouse.x * par;
      n.py = h / 2 + n.y * sy + mouse.y * par * 0.7;
      n.d = n.z;
    }
    return { sx, sy, push };
  }

  private curvePoint(a: Node, b: Node, bend: number, p: number) {
    const mx = (a.px + b.px) / 2, my = (a.py + b.py) / 2;
    const cx = mx + (b.py - a.py) * bend, cy = my - (b.px - a.px) * bend;
    const u = 1 - p;
    return [u * u * a.px + 2 * u * p * cx + p * p * b.px, u * u * a.py + 2 * u * p * cy + p * p * b.py];
  }

  private corePoint(a: Node, p: number) {
    const { w, h } = this;
    const cx = w / 2, cy = h / 2;
    const ctrlX = (a.px + cx) / 2 + (cy - a.py) * 0.25, ctrlY = (a.py + cy) / 2 - (cx - a.px) * 0.25;
    const u = 1 - p;
    return [u * u * a.px + 2 * u * p * ctrlX + p * p * cx, u * u * a.py + 2 * u * p * ctrlY + p * p * cy];
  }

  private draw() {
    const { ctx, w, h, t, st, mouse } = this;
    const { push } = this.project();
    ctx.clearRect(0, 0, w, h);
    const netA = (t < 4.6 ? 1 : 1 - 0.5 * ease((t - 4.6) / 1.4)) * (t > CUE_AT.exit ? 1 - ease((t - CUE_AT.exit) / 1.6) : 1);

    // stars
    for (const s of this.stars) {
      const a = fadeIn(t, s.appear, 0.7);
      if (a <= 0) continue;
      const twinkle = 0.55 + 0.45 * Math.sin(s.tw + t * s.sp);
      const alpha = a * twinkle * (0.25 + s.z * 0.75);
      const x = w / 2 + s.x * (w / 2) * push * (0.9 + s.z * 0.15) - t * 2.2 * s.z + mouse.x * s.z * 18;
      const y = h / 2 + s.y * (h / 2) * push * (0.9 + s.z * 0.15) + mouse.y * s.z * 12;
      if (s.r < 0.8) {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = s.tint ? `rgb(${TINTS[s.tint]})` : "#fff";
        ctx.fillRect(x, y, s.r * 1.6, s.r * 1.6);
      } else {
        const size = s.r * 7;
        ctx.globalAlpha = alpha * 0.9;
        ctx.drawImage(this.sprites[s.tint], x - size / 2, y - size / 2, size, size);
      }
    }
    ctx.globalAlpha = 1;

    // links: each draws itself from A toward B, as a gentle curve
    for (const e of this.edges) {
      if (st < e.start) continue;
      const p = ease((st - e.start) / 0.45);
      const A = this.nodes[e.a], B = this.nodes[e.b];
      const depth = (A.d + B.d) / 2;
      const hot = e.pipe ? Math.max(this.nodes[e.a].active, this.nodes[e.b].active) : 0;
      ctx.strokeStyle = hot > 0.05 ? `rgba(255,110,100,${(0.12 + hot * 0.4) * netA})` : `rgba(210,220,255,${(0.035 + depth * 0.1 + (e.pipe ? 0.06 : 0)) * netA})`;
      ctx.lineWidth = 0.5 + depth * 0.7 + (e.pipe ? 0.3 : 0);
      ctx.beginPath();
      const segs = 14;
      for (let k = 0; k <= segs; k++) {
        const [x, y] = this.curvePoint(A, B, e.bend, (k / segs) * p);
        k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    }

    // core: a small point of light inside faint concentric rings
    const coreA = fadeIn(st, 3.5, 1) * (t > 4.9 ? 1 - 0.45 * ease((t - 4.9) / 1.2) : 1) * netA;
    if (coreA > 0) {
      const cx = w / 2, cy = h / 2;
      const k = this.opts.mobile ? 0.7 : 1;
      const glow = (60 + this.coreBoost * 50) * k;
      ctx.globalAlpha = coreA * (0.55 + this.coreBoost * 0.3);
      ctx.drawImage(this.sprites[0], cx - glow, cy - glow, glow * 2, glow * 2);
      ctx.globalAlpha = coreA * 0.22;
      ctx.drawImage(this.sprites[1], cx - glow * 1.3, cy - glow * 1.3, glow * 2.6, glow * 2.6);
      ctx.globalAlpha = 1;
      [16, 30, 52, 84].forEach((r, i) => {
        ctx.strokeStyle = `rgba(255,255,255,${(0.1 - i * 0.018) * coreA})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.arc(cx, cy, r * k * (1 + this.coreBoost * 0.04), 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.save();
      ctx.setLineDash([1.5, 9]);
      ctx.lineDashOffset = -st * 14;
      ctx.strokeStyle = `rgba(255,140,120,${0.22 * coreA})`;
      ctx.beginPath();
      ctx.arc(cx, cy, 118 * k, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // synchronisation pulse: one soft ring travelling outward
    if (st >= 4.55 && st < 6.4) {
      const p = (st - 4.55) / 1.85;
      ctx.strokeStyle = `rgba(255,255,255,${0.22 * (1 - p) * netA})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(w / 2, h / 2, p * w * 0.62, p * h * 0.62, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // signals: glowing heads with short trails
    for (const s of this.signals) {
      const p = clamp((st - s.t0) / s.dur);
      if (s.dur < 0.02) continue;
      const A = this.nodes[s.a];
      const e = s.e;
      const B = s.toCore ? A : this.nodes[s.b];
      const pt = (q: number) =>
        s.toCore ? this.corePoint(A, q)
        : e ? (e.a === s.a ? this.curvePoint(A, B, e.bend, q) : this.curvePoint(B, A, e.bend, 1 - q))
        : [A.px + (B.px - A.px) * q, A.py + (B.py - A.py) * q];
      const [x, y] = pt(p);
      const [tx, ty] = pt(Math.max(0, p - 0.16));
      const tint = TINTS[s.tint];
      const depth = A.d;
      ctx.strokeStyle = `rgba(${tint},${(0.25 + depth * 0.45) * netA})`;
      ctx.lineWidth = 1 + depth;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(x, y);
      ctx.stroke();
      const size = 10 + depth * 10;
      ctx.globalAlpha = (0.6 + depth * 0.4) * netA;
      ctx.drawImage(this.sprites[s.tint], x - size / 2, y - size / 2, size, size);
      ctx.globalAlpha = 1;
    }

    // agents
    ctx.font = `${this.opts.mobile ? 9 : 11}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
    ctx.textBaseline = "middle";
    for (const n of this.nodes) {
      const a = fadeIn(st, n.appear, 0.5) * netA;
      if (a <= 0) continue;
      const birth = 1 - ease((st - n.appear) / 0.5);
      const r = (n.label ? 2.2 : 1.2) + n.d * 1.4 + n.flash * 2.5 + birth * 2;
      const halo = r * (n.label ? 7 : 5) + n.flash * 18;
      ctx.globalAlpha = a * (0.35 + n.flash * 0.6 + n.active * 0.4);
      ctx.drawImage(this.sprites[n.active > 0.2 || n.flash > 0.5 ? 1 : 0], n.px - halo / 2, n.py - halo / 2, halo, halo);
      ctx.globalAlpha = a;
      ctx.fillStyle = n.active > 0.2 ? "#ffd3cc" : "#f4f6ff";
      ctx.beginPath();
      ctx.arc(n.px, n.py, r * 0.55, 0, Math.PI * 2);
      ctx.fill();
      if (n.label) {
        const la = a * (0.32 + n.active * 0.65 + n.flash * 0.25);
        ctx.globalAlpha = la;
        ctx.fillStyle = n.active > 0.2 ? "#ffb4a8" : "#dfe4f5";
        const left = n.px < w / 2;
        ctx.textAlign = left ? "right" : "left";
        ctx.fillText(n.label, n.px + (left ? -12 : 12), n.py);
      }
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = "left";
  }
}

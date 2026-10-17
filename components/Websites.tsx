"use client";

import { motion, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Bot, Check, Gauge, Globe2, Search, Smartphone, Sparkles } from "lucide-react";
import { useRef } from "react";
import { Reveal } from "./Reveal";

const film = [0.16, 1, 0.3, 1] as const;

/* ---------- three miniature websites, built in HTML so they stay crisp at any depth ---------- */

function Chrome({ url, children, tone }: { url: string; children: React.ReactNode; tone: string }) {
  return (
    <div className="h-full w-full overflow-hidden rounded-[18px] border border-white/15" style={{ background: tone, boxShadow: "0 40px 80px -30px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.12)" }}>
      <div className="flex items-center gap-2 border-b border-black/10 bg-black/25 px-3 py-2">
        <span className="flex gap-1">{["#ff5f57", "#febc2e", "#28c840"].map((c) => <span key={c} className="h-2 w-2 rounded-full" style={{ background: c }} />)}</span>
        <span className="mx-auto rounded-md bg-black/25 px-3 py-0.5 font-mono text-[9px] text-white/70">{url}</span>
      </div>
      {children}
    </div>
  );
}

function SiteSaas() {
  return (
    <Chrome url="northwind.ai" tone="linear-gradient(160deg,#0f1020,#1a1240 60%,#2a0f2e)">
      <div className="relative h-full px-6 pt-6">
        <div className="flex items-center justify-between text-[9px] text-white/70">
          <span className="font-semibold text-white">◆ Northwind</span>
          <span className="flex gap-3"><span>Product</span><span>Pricing</span><span>Docs</span></span>
          <span className="rounded-full bg-white px-2 py-0.5 text-[8px] font-semibold text-black">Start free</span>
        </div>
        <div className="mt-7 text-center">
          <div className="mx-auto w-fit rounded-full border border-white/15 px-2 py-0.5 text-[7px] text-white/60">✦ New: AI agents for finance teams</div>
          <div className="mt-3 font-serif text-[30px] leading-[1] text-white">Close your books <span className="italic text-[#ff8a7a]">in hours.</span></div>
          <div className="mx-auto mt-2 max-w-[260px] text-[8.5px] leading-relaxed text-white/55">Reconciliation, approvals and reporting handled by agents your auditors will love.</div>
          <div className="mt-3 flex justify-center gap-2 text-[8px]">
            <span className="rounded-full bg-[#ff5c5c] px-3 py-1 font-semibold text-white">Book a demo</span>
            <span className="rounded-full border border-white/20 px-3 py-1 text-white/80">Watch video</span>
          </div>
        </div>
        <div className="mx-auto mt-5 grid max-w-[330px] grid-cols-3 gap-2">
          {[["-62%", "close time"], ["3.1x", "throughput"], ["99.4%", "match rate"]].map(([v, l]) => (
            <div key={l} className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-center">
              <div className="font-serif text-[15px] italic text-white">{v}</div>
              <div className="text-[7px] uppercase tracking-wider text-white/45">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </Chrome>
  );
}

function SiteCafe() {
  return (
    <Chrome url="brewandbloom.in" tone="linear-gradient(170deg,#2a1a10,#1a120c)">
      <div className="grid h-full grid-cols-[1.1fr_1fr]">
        <div className="px-5 pt-6">
          <div className="text-[9px] tracking-[0.3em] text-[#e8c89a]">BREW & BLOOM</div>
          <div className="mt-5 font-serif text-[26px] leading-[1.02] text-[#f6e9d6]">Slow coffee, <span className="italic text-[#e8a87c]">fresh</span> flowers.</div>
          <div className="mt-2 text-[8.5px] leading-relaxed text-[#f6e9d6]/60">Hyderabad&apos;s quietest corner. Order ahead and skip the line.</div>
          <div className="mt-3 flex gap-2 text-[8px]">
            <span className="rounded-full bg-[#e8a87c] px-3 py-1 font-semibold text-[#2a1a10]">Order online</span>
            <span className="rounded-full border border-[#f6e9d6]/25 px-3 py-1 text-[#f6e9d6]/80">Reserve</span>
          </div>
          <div className="mt-4 flex gap-1 text-[#e8c89a]">{"★★★★★".split("").map((s, i) => <span key={i} className="text-[9px]">{s}</span>)}<span className="ml-1 text-[8px] text-[#f6e9d6]/50">4.9 · 1,240 reviews</span></div>
        </div>
        <div className="relative m-3 overflow-hidden rounded-xl" style={{ background: "radial-gradient(circle at 40% 35%, #e8a87c 0, #8a4b2a 35%, #3a1f12 70%)" }}>
          <div className="absolute left-1/2 top-[44%] h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-[6px] border-[#f6e9d6]/85 bg-[#4a2716]" style={{ boxShadow: "inset 0 0 0 10px #6b3a1f" }} />
          <div className="absolute bottom-3 left-3 rounded-lg bg-black/40 px-2 py-1 text-[8px] text-[#f6e9d6]">Today&apos;s pour · Ethiopian Guji</div>
        </div>
      </div>
    </Chrome>
  );
}

function SiteClinic() {
  return (
    <Chrome url="aurumdental.com" tone="linear-gradient(170deg,#f5f7fb,#e7edf6)">
      <div className="h-full px-6 pt-5 text-[#10203a]">
        <div className="flex items-center justify-between text-[9px]">
          <span className="font-semibold">Aurum Dental</span>
          <span className="flex gap-3 text-[#10203a]/60"><span>Treatments</span><span>Doctors</span><span>Contact</span></span>
        </div>
        <div className="mt-6 grid grid-cols-[1.2fr_1fr] gap-4">
          <div>
            <div className="text-[25px] font-semibold leading-[1.05] tracking-tight">Smiles, <span className="font-serif italic text-[#2563eb]">without</span> the wait.</div>
            <div className="mt-2 text-[8.5px] leading-relaxed text-[#10203a]/60">Book in 30 seconds. Our AI assistant answers insurance questions 24/7.</div>
            <div className="mt-3 w-fit rounded-full bg-[#2563eb] px-3 py-1 text-[8px] font-semibold text-white">Book appointment</div>
          </div>
          <div className="rounded-xl bg-white p-2.5 shadow-[0_10px_30px_-12px_rgba(16,32,58,0.35)]">
            <div className="text-[8px] font-semibold">Ask Aurum ✦</div>
            <div className="mt-1.5 rounded-lg bg-[#eef3ff] p-1.5 text-[7.5px]">Do you take Star Health?</div>
            <div className="mt-1 rounded-lg bg-[#2563eb] p-1.5 text-[7.5px] text-white">Yes, cashless for cleanings and fillings. Want a slot tomorrow?</div>
          </div>
        </div>
      </div>
    </Chrome>
  );
}

/* ---------- the 3D stage ---------- */

function Stage() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scrollRot = useTransform(scrollYProgress, [0, 1], [16, -12]);
  const mx = useMotionValue(0), my = useMotionValue(0);
  const idle = useMotionValue(0);
  useAnimationFrame((t) => idle.set(Math.sin(t / 2600) * 9));
  const rotY = useSpring(useTransform([mx, idle], ([m, i]) => (m as number) * 16 + (i as number)), { stiffness: 50, damping: 16 });
  const rotX = useSpring(useTransform([my, scrollRot], ([m, s]) => (m as number) * -10 + (s as number)), { stiffness: 50, damping: 16 });

  const onMove = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const layers = [
    { C: SiteClinic, x: "-30%", y: "-20%", z: -220, r: -6 },
    { C: SiteCafe, x: "28%", y: "-26%", z: -120, r: 5 },
    { C: SiteSaas, x: "0%", y: "6%", z: 60, r: 0 },
  ];
  const chips = [
    { I: Gauge, t: "Lighthouse 98", x: "-46%", y: "40%", z: 180 },
    { I: Search, t: "SEO ready", x: "44%", y: "-44%", z: 220 },
    { I: Bot, t: "AI chat built in", x: "46%", y: "44%", z: 160 },
    { I: Smartphone, t: "Mobile-first", x: "-48%", y: "-50%", z: 140 },
  ];

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={() => { mx.set(0); my.set(0); }} className="relative h-[360px] scale-[0.74] sm:h-[560px] sm:scale-100" style={{ perspective: "1600px" }}>
      <div className="absolute left-1/2 top-1/2 h-[70%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,92,92,0.16),rgba(90,100,220,0.1)_55%,transparent)] blur-2xl" />
      <motion.div className="absolute inset-0" style={{ rotateY: rotY, rotateX: rotX, transformStyle: "preserve-3d" }}>
        {layers.map(({ C, x, y, z, r }, i) => (
          <div key={i} className="absolute" style={{ left: `calc(50% + ${x})`, top: `calc(50% + ${y})`, transform: "translate(-50%, -50%)", transformStyle: "preserve-3d" }}>
            <motion.div
              className="h-[230px] w-[340px] sm:h-[300px] sm:w-[470px]"
              initial={{ opacity: 0, z: z - 300, rotateZ: r }}
              whileInView={{ opacity: 1, z, rotateZ: r }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.6, delay: 0.15 * i, ease: film }}
            >
              <C />
            </motion.div>
          </div>
        ))}
        {chips.map(({ I, t, x, y, z }, i) => (
          <div key={t} className="absolute hidden sm:block" style={{ left: `calc(50% + ${x})`, top: `calc(50% + ${y})`, transform: "translate(-50%, -50%)", transformStyle: "preserve-3d" }}>
            <motion.div
              initial={{ opacity: 0, z: z + 200 }}
              whileInView={{ opacity: 1, z }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, delay: 0.6 + i * 0.12, ease: film }}
            >
              <span className="flex animate-floaty items-center gap-2 whitespace-nowrap rounded-full border border-white/15 bg-[#0c0d12]/90 px-3.5 py-2 text-[12px] font-medium text-white/85 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)]" style={{ animationDelay: `${i * 0.7}s` }}>
                <I className="h-3.5 w-3.5 text-coral" /> {t}
              </span>
            </motion.div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/* ---------- 48-hour plan with a scroll-filled rail ---------- */

const plan = [
  { h: "Hour 0", t: "Brief call", d: "30 minutes on your business, audience and what the site must do." },
  { h: "Hour 4", t: "Design direction", d: "Look, layout and copy outline, approved by you the same day." },
  { h: "Hour 16", t: "Build", d: "Next.js + Tailwind, animations, responsive on every screen." },
  { h: "Hour 36", t: "Content, SEO & AI", d: "Pages written, SEO and analytics wired, AI chat trained on your info." },
  { h: "Hour 48", t: "Live", d: "On your domain, fast and secure, with 30 days of fixes included." },
];

const included = [
  "Custom premium design", "Next.js + Tailwind", "Smooth animations & 3D", "Mobile-first & responsive",
  "SEO + Google Analytics", "Contact forms + WhatsApp", "AI chat assistant", "Hosting on Vercel",
  "Optional CMS for edits", "30 days of free fixes",
];

function Plan() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.55"] });
  const fill = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  return (
    <div ref={ref} className="relative pl-8">
      <div className="absolute bottom-2 left-[7px] top-2 w-px bg-white/10" />
      <motion.div className="absolute left-[7px] top-2 w-px bg-gradient-to-b from-coral to-coral/30" style={{ height: fill }} />
      <div className="space-y-7">
        {plan.map((p, i) => (
          <motion.div key={p.h} initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7, delay: i * 0.05, ease: film }} className="relative">
            <span className="absolute -left-8 top-1 grid h-[15px] w-[15px] place-items-center rounded-full border border-coral/60 bg-bg">
              <span className="h-1.5 w-1.5 rounded-full bg-coral" />
            </span>
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-coral">{p.h}</div>
            <div className="mt-1 text-[17px] font-semibold tracking-tight">{p.t}</div>
            <p className="mt-1 text-[14px] leading-relaxed text-white/55">{p.d}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function Websites() {
  return (
    <section id="websites" className="relative overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-x-0 top-0 -z-10 h-full bg-[radial-gradient(50%_40%_at_50%_30%,rgba(90,100,220,0.07),transparent_70%)]" />
      <div className="page">
        <Reveal className="text-center">
          <p className="eyebrow mb-4 inline-flex items-center gap-2"><Globe2 className="h-3.5 w-3.5" /> Websites for your business · live in 48 hours</p>
          <h2 className="h-display mx-auto max-w-[1000px] text-[2.5rem] sm:text-6xl md:text-[4.6rem]">
            A premium website for your business, <span className="serif-i text-coral">live in 2 days.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-[16.5px] leading-relaxed text-muted">
            Designed, built and deployed in 48 hours: fast, animated sites with SEO and an AI assistant built in, so your
            business looks as sharp online as the work you do.
          </p>
        </Reveal>

        <Reveal className="mt-10">
          <Stage />
        </Reveal>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <Plan />
          <Reveal delay={0.1}>
            <div className="card p-7 sm:p-9">
              <div className="mb-5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">
                <Sparkles className="h-4 w-4 text-coral" /> What&apos;s included
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {included.map((x) => (
                  <li key={x} className="flex items-center gap-2.5 text-[14.5px] text-white/80">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-coral/40 text-coral"><Check className="h-3 w-3" /></span>
                    {x}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-white/[0.07] pt-7">
                <a href="#contact" className="btn-primary">Launch my website in 48h <ArrowRight className="h-4 w-4" /></a>
                <span className="font-mono text-[11px] text-white/40">Landing pages, business sites, portfolios</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Starfield } from "./Starfield";

/** Cinematic night-sky band: milky way over a mountain ridge at first light, with parallax layers. */
export function Banner() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const sky = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const far = useTransform(scrollYProgress, [0, 1], ["6%", "-2%"]);
  const near = useTransform(scrollYProgress, [0, 1], ["12%", "-4%"]);

  return (
    <section className="py-10">
      <div className="page">
        <div ref={ref} className="relative isolate h-[440px] overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#03050a] sm:h-[520px]">
          <motion.div style={{ y: sky }} className="absolute -inset-[12%] -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_100%,#3b1a12_0%,#14111f_40%,#05070d_75%)]" />
            {/* milky way */}
            <div className="absolute left-[55%] top-[38%] h-[30%] w-[120%] -translate-x-1/2 -translate-y-1/2 -rotate-[18deg] bg-[radial-gradient(closest-side,rgba(110,160,235,0.62),rgba(40,80,150,0.18)_55%,transparent)] blur-3xl" />
            <div className="absolute left-[50%] top-[40%] h-[14%] w-[34%] -translate-x-1/2 -translate-y-1/2 -rotate-[18deg] bg-[radial-gradient(closest-side,rgba(255,200,150,0.75),rgba(255,130,90,0.15)_60%,transparent)] blur-2xl" />
            <Starfield density={2.6} />
          </motion.div>

          {/* first-light glow on the horizon */}
          <div className="absolute inset-x-0 bottom-[18%] -z-10 h-[45%] bg-[radial-gradient(55%_60%_at_50%_100%,rgba(255,120,80,0.55),rgba(190,40,56,0.12)_55%,transparent_80%)]" />

          <motion.svg style={{ y: far }} viewBox="0 0 1200 300" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 -z-10 h-[55%] w-full" aria-hidden>
            <defs>
              <linearGradient id="ridgeFar" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#2a1a24" />
                <stop offset="1" stopColor="#0a0a10" />
              </linearGradient>
            </defs>
            <path d="M0 170 L80 128 L150 150 L230 96 L310 140 L390 110 L470 150 L560 88 L640 132 L720 104 L800 146 L880 92 L960 136 L1050 108 L1130 142 L1200 120 L1200 300 L0 300 Z" fill="url(#ridgeFar)" />
          </motion.svg>
          <motion.svg style={{ y: near }} viewBox="0 0 1200 300" preserveAspectRatio="none" className="absolute inset-x-0 -bottom-[4%] -z-10 h-[50%] w-full" aria-hidden>
            <path d="M0 190 C 90 150, 160 170, 240 140 S 380 180, 470 150 S 620 110, 700 160 S 860 190, 950 140 S 1110 160, 1200 130 L1200 300 L0 300 Z" fill="#050508" />
          </motion.svg>

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-7 sm:p-12">
            <p className="eyebrow mb-4 text-white/70">My approach</p>
            <p className="max-w-3xl text-[1.7rem] font-medium leading-tight tracking-tight sm:text-[2.6rem]">
              Pick one workflow that&apos;s costing you. I build the agent.{" "}
              <span className="serif-i text-coral">Your team owns it.</span>
            </p>
            <a href="#live" className="mt-6 inline-flex items-center gap-1 text-sm text-white/75 hover:text-white">
              Watch a live run →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

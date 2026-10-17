"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";

// Words light up one by one as you scroll past, the same treatment as the reference's "What we do".
const words: { t: string; serif?: boolean }[] = [
  { t: "I" }, { t: "take" }, { t: "repetitive", serif: true }, { t: "work", serif: true }, { t: "off" }, { t: "your" },
  { t: "team" }, { t: "with" }, { t: "agents," }, { t: "automations" }, { t: "and" }, { t: "headless" }, { t: "browsers," },
  { t: "and" }, { t: "I" }, { t: "prove", serif: true }, { t: "it", serif: true }, { t: "works", serif: true },
  { t: "with", serif: true }, { t: "evals", serif: true }, { t: "and", serif: true }, { t: "traces.", serif: true },
];

function W({ w, i, p }: { w: (typeof words)[number]; i: number; p: MotionValue<number> }) {
  const start = i / words.length;
  const opacity = useTransform(p, [start, start + 1.5 / words.length], [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className={`mr-[0.25em] inline-block ${w.serif ? "serif-i text-white/90" : ""}`}>
      {w.t}
    </motion.span>
  );
}

export function Statement() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  return (
    <section className="relative pb-8 pt-28 sm:pb-10 sm:pt-36">
      <div className="absolute inset-x-0 top-0 -z-10 h-full bg-[radial-gradient(60%_50%_at_50%_0%,rgba(255,255,255,0.03),transparent)]" />
      <div ref={ref} className="page">
        <p className="eyebrow-muted mb-6">— What I do</p>
        <h2 className="h-display max-w-[980px] text-[2.3rem] sm:text-5xl md:text-[4.1rem]">
          {words.map((w, i) => (
            <W key={i} w={w} i={i} p={scrollYProgress} />
          ))}
        </h2>
      </div>
    </section>
  );
}

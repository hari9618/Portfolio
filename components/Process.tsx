"use client";

import { motion } from "framer-motion";
import { Gauge, KeyRound, Rocket, Search } from "lucide-react";
import { loop } from "@/lib/content";
import { Reveal } from "./Reveal";

const icons = { search: Search, rocket: Rocket, gauge: Gauge, key: KeyRound } as const;

export function Process() {
  return (
    <section id="process" className="relative py-24 sm:py-32">
      <div className="page">
        <Reveal>
          <p className="eyebrow mb-4">How I work</p>
          <h2 className="h-display text-[2.4rem] sm:text-5xl md:text-[3.6rem]">
            The Ship <span className="serif-i">Loop</span>
          </h2>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-muted">
            Most AI projects stall in pilot purgatory: endless demos and nothing that ships. I take every engagement through
            the same four steps, and you own what I build.
          </p>
        </Reveal>

        <div className="relative mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <div className="absolute left-0 right-0 top-[52px] hidden h-px bg-gradient-to-r from-transparent via-coral/40 to-transparent lg:block" />
          {loop.map((s, i) => {
            const I = icons[s.icon as keyof typeof icons];
            return (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.8, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="card card-hover p-7"
              >
                <div className="mb-8 flex items-start justify-between">
                  <span className="icon-chip">
                    <I className="h-4 w-4" />
                  </span>
                  <span className="font-mono text-4xl font-light text-white/[0.12]">{s.n}</span>
                </div>
                <h3 className="text-2xl font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{s.body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

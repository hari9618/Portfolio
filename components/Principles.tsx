"use client";

import { motion } from "framer-motion";
import { principles } from "@/lib/content";

export function Principles() {
  return (
    <section className="relative py-24">
      <div className="page">
        <p className="eyebrow-muted mb-10">In my words · how I think about AI systems</p>
        <div className="grid gap-5 md:grid-cols-3">
          {principles.map((p, i) => (
            <motion.figure
              key={p.who}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="card flex flex-col p-7"
            >
              <span className="font-serif text-5xl leading-none text-coral">“</span>
              <blockquote className="mt-2 text-[16.5px] leading-relaxed text-white/90">{p.quote}</blockquote>
              <figcaption className="mt-8 border-t border-white/[0.07] pt-5">
                <div className="text-sm font-semibold">{p.who}</div>
                <div className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-white/45">{p.tag}</div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

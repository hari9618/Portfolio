"use client";

import { motion } from "framer-motion";
import { T, toolGroups } from "@/lib/tools";
import { SectionHead } from "./Reveal";
import { ToolMark } from "./ToolChip";

export function Stack() {
  return (
    <section id="stack" className="relative py-24 sm:py-32">
      <div className="page">
        <SectionHead
          eyebrow="Tools & tech stack"
          title={
            <>
              The AI engineer&apos;s <span className="serif-i">toolbox</span>
            </>
          }
          aside={
            <p className="max-w-sm text-[15px] leading-relaxed text-muted">
              Models, agents, retrieval, evals, automation, voice and cloud. I pick by trade-off, not by hype, and fit
              into whatever you already run.
            </p>
          }
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {toolGroups.map((g, i) => (
            <motion.div
              key={g.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: (i % 2) * 0.08 }}
              className="card card-hover p-7"
            >
              <div className="mb-5 flex items-baseline justify-between gap-4">
                <div>
                  <h3 className="text-[1.1rem] font-semibold tracking-tight">{g.title}</h3>
                  <p className="mt-1 text-[13px] text-white/45">{g.blurb}</p>
                </div>
                <span className="font-mono text-[11px] text-white/30">{String(g.tools.length).padStart(2, "0")}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {g.tools.map((id) => (
                  <span
                    key={id}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-[13px] text-white/80 transition-colors hover:border-white/25 hover:text-white"
                  >
                    <ToolMark tool={T[id]} size={15} />
                    {T[id].name}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

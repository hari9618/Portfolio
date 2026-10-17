"use client";

import { motion } from "framer-motion";
import { Briefcase, GraduationCap, MapPin } from "lucide-react";
import { education, experience } from "@/lib/content";
import { Reveal } from "./Reveal";

export function Experience() {
  return (
    <section id="experience" className="relative py-24 sm:py-32">
      <div className="page grid gap-12 lg:grid-cols-[0.8fr_1.6fr]">
        <Reveal className="lg:sticky lg:top-32 lg:self-start">
          <p className="eyebrow mb-4">Experience</p>
          <h2 className="h-display text-[2.4rem] sm:text-5xl">
            Building &amp; shipping <span className="serif-i text-coral">AI, daily.</span>
          </h2>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-muted">
            I build and ship AI agents and RAG systems, evaluate them, automate the workflows around them, and keep them observable and cheap to run.
          </p>
        </Reveal>

        <div className="space-y-5">
          {experience.map((e) => (
            <Reveal key={e.org}>
              <article className="card relative overflow-hidden p-7 sm:p-9">
                <div className="absolute right-0 top-0 h-40 w-40 bg-[radial-gradient(closest-side,rgba(255,92,92,0.15),transparent)]" />
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="icon-chip"><Briefcase className="h-4 w-4" /></span>
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight">{e.role}</h3>
                      <a href={e.href} target="_blank" rel="noreferrer" className="text-[15px] text-coral hover:underline">
                        {e.org}
                      </a>
                    </div>
                  </div>
                  <div className="text-right font-mono text-[11px] text-white/50">
                    <div>{e.period}</div>
                    <div className="mt-1 flex items-center justify-end gap-1"><MapPin className="h-3 w-3" />{e.place}</div>
                  </div>
                </div>
                <ul className="mt-7 space-y-3.5">
                  {e.points.map((p, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.06 }}
                      className="flex gap-3 text-[14.5px] leading-relaxed text-white/75"
                    >
                      <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
                      {p}
                    </motion.li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}

          <div className="grid gap-5 sm:grid-cols-2">
            {education.map((ed, i) => (
              <Reveal key={ed.title} delay={i * 0.08}>
                <article className="card h-full p-7">
                  <span className="icon-chip mb-5"><GraduationCap className="h-4 w-4" /></span>
                  <div className="font-mono text-[11px] text-white/45">{ed.period}</div>
                  <h3 className="mt-2 text-[1.05rem] font-semibold leading-snug tracking-tight">{ed.title}</h3>
                  <div className="text-[14px] text-coral">{ed.org}</div>
                  <p className="mt-3 text-[13.5px] leading-relaxed text-muted">{ed.note}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

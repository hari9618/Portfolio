"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { caseStudies, moreProjects, profile } from "@/lib/content";
import { GithubIcon } from "./BrandIcons";
import { Reveal, SectionHead } from "./Reveal";

export function Work() {
  return (
    <section id="work" className="relative py-24 sm:py-32">
      <div className="page">
        <SectionHead
          eyebrow="Proof"
          title={
            <>
              Shipped <span className="serif-i">work</span>, measured in numbers.
            </>
          }
          aside={
            <a href={profile.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-white/60 transition hover:text-white">
              All repositories <ArrowUpRight className="h-4 w-4" />
            </a>
          }
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          {caseStudies.map((c, i) => (
            <motion.article
              key={c.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: (i % 2) * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="card card-hover group flex flex-col p-7 sm:p-9"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-coral">{c.sector}</p>
                <a
                  href={c.links[0].href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${c.title}`}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 text-white/70 transition-all duration-300 group-hover:rotate-45 group-hover:border-coral/60 group-hover:text-coral"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
              <h3 className="mt-3 text-[1.45rem] font-semibold leading-snug tracking-tight sm:text-[1.6rem]">{c.title}</h3>
              <p className="mt-4 text-[14.5px] leading-relaxed text-muted">{c.body}</p>

              <div className="mt-7 grid grid-cols-3 gap-4 border-t border-white/[0.07] pt-6">
                {c.stats.map((s) => (
                  <div key={s.label}>
                    <div className="serif-i text-[2rem] leading-none sm:text-[2.4rem]">{s.value}</div>
                    <div className="mt-2 font-mono text-[10px] uppercase leading-snug tracking-[0.12em] text-white/45">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap gap-1.5">
                {c.stack.map((t) => (
                  <span key={t} className="rounded-full border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-[11.5px] text-white/60">
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-auto flex gap-5 pt-7 text-sm">
                {c.links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-white/70 transition hover:text-coral">
                    {l.label} <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </motion.article>
          ))}
        </div>

        <Reveal className="mt-20">
          <div className="mb-8 flex items-end justify-between">
            <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              More things I&apos;ve <span className="serif-i text-coral">built</span>
            </h3>
            <span className="eyebrow-muted hidden sm:block">{moreProjects.length} more on GitHub</span>
          </div>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {moreProjects.map((p, i) => (
            <motion.a
              key={p.title}
              href={p.href}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.06 }}
              className="card card-hover group flex flex-col p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <GithubIcon className="h-4 w-4 text-white/45" />
                <div className="flex items-center gap-2">
                  {p.live && (
                    <span className="flex items-center gap-1 rounded-full bg-ok/10 px-2 py-0.5 font-mono text-[10px] text-ok">
                      <span className="h-1.5 w-1.5 rounded-full bg-ok" /> live
                    </span>
                  )}
                  <ArrowUpRight className="h-4 w-4 text-white/40 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-coral" />
                </div>
              </div>
              <h4 className="text-[1.05rem] font-semibold tracking-tight">{p.title}</h4>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{p.body}</p>
              <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-5 font-mono text-[10.5px] text-white/45">
                {p.stack.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

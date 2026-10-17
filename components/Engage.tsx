"use client";

import { motion } from "framer-motion";
import { ArrowRight, Building2, Check, Download, Handshake } from "lucide-react";
import { profile } from "@/lib/content";
import { Reveal } from "./Reveal";

const paths = [
  {
    Icon: Building2,
    kicker: "For recruiters & hiring managers",
    title: "Hire me full-time",
    body: "An AI engineer who already ships production agents, RAG and LLM-Ops, and brings Claude Code fluency that speeds up the whole team.",
    points: [
      "Multi-agent systems in LangGraph, end to end",
      "Hybrid RAG with Ragas-measured quality",
      "Langfuse / LangSmith observability & cost control",
      "Remote, or on-site in Hyderabad",
    ],
    cta: { label: "Download résumé", href: profile.resume, Icon: Download, download: true },
  },
  {
    Icon: Handshake,
    kicker: "For founders & teams",
    title: "Freelance & contracts",
    body: "Start with a pilot, not a big contract. I scope one workflow, ship it in weeks with measured results, and you own the code.",
    points: [
      "Audit: map and cost your workflows",
      "Pilot: one agent or automation, live",
      "Evals + dashboards included",
      "You own it, with a runbook and handover",
    ],
    cta: { label: "Start a project", href: "#contact", Icon: ArrowRight, download: false },
  },
];

export function Engage() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="page">
        <Reveal>
          <p className="eyebrow mb-4">Engagement model</p>
          <h2 className="h-display text-[2.4rem] sm:text-5xl md:text-[3.6rem]">
            Two ways to <span className="serif-i text-coral">work together.</span>
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          {paths.map((p, i) => (
            <motion.article
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="card card-hover flex flex-col p-8 sm:p-10"
            >
              <span className="icon-chip mb-6"><p.Icon className="h-4 w-4" /></span>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">{p.kicker}</p>
              <h3 className="mt-2 text-[1.9rem] font-semibold tracking-tight">{p.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{p.body}</p>
              <ul className="mt-7 space-y-3">
                {p.points.map((pt) => (
                  <li key={pt} className="flex items-center gap-3 text-[14.5px] text-white/80">
                    <span className="grid h-5 w-5 place-items-center rounded-full border border-coral/40 text-coral"><Check className="h-3 w-3" /></span>
                    {pt}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-9">
                <a href={p.cta.href} {...(p.cta.download ? { download: true } : {})} className={i === 0 ? "btn-primary" : "btn-ghost"}>
                  {p.cta.label} <p.cta.Icon className="h-4 w-4" />
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

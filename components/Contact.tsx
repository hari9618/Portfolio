"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Copy, Download, Mail, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";
import { profile } from "@/lib/content";
import { GithubIcon, LinkedinIcon } from "./BrandIcons";

const promises = [
  "30 minutes. No sales deck.",
  "A build-or-buy call and a target cost per run, in writing",
  "An eval rubric drafted live on your messiest workflow",
  "Usually a reply within 24 hours",
];

export function Contact() {
  const [copied, setCopied] = useState(false);
  const mailto = `mailto:${profile.email}?subject=${encodeURIComponent("Let's build an AI agent")}&body=${encodeURIComponent(
    "Hi Hari,\n\nThe workflow I'd like to automate is:\n\nTimeline:\nFull-time / freelance:\n",
  )}`;

  return (
    <section id="contact" className="relative py-24 sm:py-32">
      <div className="page">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[32px] border border-coral/25 px-6 py-16 text-center sm:px-12 sm:py-20"
          style={{
            background: "radial-gradient(120% 90% at 50% 0%, #2a0b0e 0%, #14080a 45%, #0a0607 100%)",
            boxShadow: "0 0 120px -30px rgba(255,92,92,0.45), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <div className="dot-grid absolute inset-0 opacity-40" />
          <div className="relative">
            <p className="mb-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-coral">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-coral" /> Taking on new roles &amp; projects
            </p>
            <h2 className="font-serif text-[2.8rem] italic leading-[1] tracking-[-0.02em] sm:text-[4.4rem] md:text-[5.2rem]">
              One workflow.
              <br />
              <span className="text-coral">A 30-min call.</span>
              <br />
              An agent you own.
            </h2>
            <p className="mx-auto mt-7 max-w-xl text-[16px] leading-relaxed text-white/70">
              Bring the workflow that&apos;s hurting most, or the AI role you&apos;re hiring for. By the end of the call you&apos;ll know
              exactly what I&apos;d build, how we&apos;d measure it and what it would cost to run.
            </p>
            <div className="mx-auto mt-9 grid max-w-2xl gap-3 text-left text-[14px] text-white/75 sm:grid-cols-2">
              {promises.map((p) => (
                <div key={p} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
                  {p}
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <a href={mailto} className="btn-primary">
                <Mail className="h-4 w-4" /> Email me <ArrowRight className="h-4 w-4" />
              </a>
              <a href={profile.phoneHref} className="btn-ghost">
                <Phone className="h-4 w-4" /> Call {profile.phone}
              </a>
              <a href={profile.resume} download className="btn-ghost">
                <Download className="h-4 w-4" /> Download résumé
              </a>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-white/[0.08] pt-8 text-sm text-white/60">
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(profile.email);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1600);
                }}
                className="inline-flex items-center gap-2 transition hover:text-white"
              >
                <Copy className="h-4 w-4" /> {copied ? "Copied!" : profile.email}
              </button>
              <a href={profile.phoneHref} className="inline-flex items-center gap-2 transition hover:text-white">
                <Phone className="h-4 w-4" /> {profile.phone}
              </a>
              <a href={profile.whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition hover:text-white">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition hover:text-white">
                <LinkedinIcon /> LinkedIn
              </a>
              <a href={profile.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition hover:text-white">
                <GithubIcon /> GitHub
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

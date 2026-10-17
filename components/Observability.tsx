"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { Activity, AlertTriangle, ArrowRight, BellRing, CheckCircle2, Coins, GitBranch, Gauge, ScanSearch, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { T } from "@/lib/tools";
import { Reveal } from "./Reveal";
import { ToolMark } from "./ToolChip";

const features = [
  { I: ScanSearch, t: "Trace every LLM call", d: "Prompts, tool calls, retrieved chunks, latency and tokens for every span, in Langfuse or LangSmith." },
  { I: Gauge, t: "End-to-end evals", d: "Golden datasets, Ragas metrics and LLM-as-judge scoring across the whole agent, not one prompt." },
  { I: ShieldCheck, t: "Validation & guardrails", d: "Schema checks, grounding and PII filters that block a bad answer before it ships." },
  { I: GitBranch, t: "Regression gates in CI", d: "Every prompt or model change is re-scored. If quality drops, the release stops." },
  { I: Coins, t: "Cost & token tracking", d: "Cost per run, per user and per feature, with the cache and routing wins measured." },
  { I: BellRing, t: "Alerts that matter", d: "Slack alerts on drift, hallucination spikes, latency and spend, before customers notice." },
];

type Row = { id: string; name: string; ms: number; tok: number; cost: number; score: number; flag?: string };
const pool: Omit<Row, "id">[] = [
  { name: "support_agent.answer", ms: 1840, tok: 2210, cost: 0.0061, score: 0.96 },
  { name: "rag.retrieve+generate", ms: 2420, tok: 3105, cost: 0.0088, score: 0.93 },
  { name: "lead_agent.enrich", ms: 3120, tok: 1980, cost: 0.0054, score: 0.91 },
  { name: "contract_qa.answer", ms: 2960, tok: 4012, cost: 0.0112, score: 0.42, flag: "ungrounded claim · blocked" },
  { name: "voice_agent.turn", ms: 640, tok: 410, cost: 0.0009, score: 0.97 },
  { name: "sql_agent.query", ms: 1510, tok: 1290, cost: 0.0031, score: 0.95 },
  { name: "browser_agent.step", ms: 2280, tok: 1720, cost: 0.0047, score: 0.92 },
];

function Dashboard() {
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box, { margin: "-80px" });
  const [rows, setRows] = useState<Row[]>(() => pool.slice(0, 5).map((r, i) => ({ ...r, id: `r${i}` })));
  const [n, setN] = useState(18342);
  const [spark, setSpark] = useState<number[]>(() => Array.from({ length: 28 }, (_, i) => 40 + Math.sin(i / 2) * 12 + (i % 5) * 3));

  const k = useRef(5); // survives the section scrolling in and out of view, so rows never repeat back-to-back
  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => {
      const next = pool[k.current % pool.length];
      k.current += 1;
      setRows((r) => [{ ...next, id: `r${k.current}`, ms: Math.round(next.ms * (0.85 + Math.random() * 0.3)) }, ...r].slice(0, 5));
      setN((v) => v + 3 + Math.floor(Math.random() * 6));
      setSpark((s) => [...s.slice(1), 30 + Math.random() * 40]);
    }, 1400);
    return () => clearInterval(id);
  }, [inView]);

  const max = Math.max(...spark);
  const path = spark.map((v, i) => `${i === 0 ? "M" : "L"}${(i / (spark.length - 1)) * 100} ${100 - (v / max) * 85}`).join(" ");

  return (
    <div
      ref={box}
      className="relative overflow-hidden rounded-[26px] border border-white/[0.1]"
      style={{
        background: "radial-gradient(90% 60% at 80% 0%, rgba(52,211,153,0.09), transparent 60%), radial-gradient(70% 60% at 0% 100%, rgba(190,40,56,0.14), transparent 60%), #08090b",
        boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.06), 0 40px 90px -40px rgba(52,211,153,0.25)",
      }}
    >
      <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-3">
        <span className="flex gap-1.5">{[0, 1, 2].map((i) => <span key={i} className="h-2.5 w-2.5 rounded-full bg-white/15" />)}</span>
        <div className="flex gap-1 rounded-full bg-white/[0.04] p-1 font-mono text-[11px]">
          {["Traces", "Evals", "Cost"].map((t, i) => (
            <span key={t} className={`rounded-full px-3 py-1 ${i === 0 ? "bg-white/10 text-white" : "text-white/45"}`}>{t}</span>
          ))}
        </div>
        <span className="ml-auto flex items-center gap-1.5 font-mono text-[11px] text-ok"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ok" /> live</span>
      </div>

      <div className="grid grid-cols-2 gap-px bg-white/[0.06] sm:grid-cols-4">
        {[
          { l: "LLM calls today", v: n.toLocaleString(), c: "text-white" },
          { l: "p95 latency", v: "2.4s", c: "text-white" },
          { l: "cost today", v: `$${(n * 0.0049).toFixed(2)}`, c: "text-white" },
          { l: "faithfulness", v: "0.94", c: "text-ok" },
        ].map((k) => (
          <div key={k.l} className="bg-[#08090b] px-5 py-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{k.l}</div>
            <div className={`serif-i mt-1 text-[1.9rem] leading-none tabular-nums ${k.c}`}>{k.v}</div>
          </div>
        ))}
      </div>

      <div className="px-5 pt-4">
        <div className="mb-1 flex justify-between font-mono text-[10px] text-white/40"><span>calls / min</span><span>last 30 min</span></div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-16 w-full">
          <defs>
            <linearGradient id="obsFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#34d399" stopOpacity="0.35" />
              <stop offset="1" stopColor="#34d399" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${path} L100 100 L0 100 Z`} fill="url(#obsFill)" />
          <path d={path} fill="none" stroke="#34d399" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>

      <div className="px-5 pb-5 pt-3">
        <div className="mb-2 grid grid-cols-[1fr_64px_64px_70px] gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white/35 sm:grid-cols-[1fr_70px_70px_70px_80px]">
          <span>trace</span><span className="text-right">latency</span><span className="hidden text-right sm:block">tokens</span><span className="text-right">cost</span><span className="text-right">eval</span>
        </div>
        <div className="space-y-1.5">
          <AnimatePresence initial={false}>
            {rows.map((r) => (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, y: -14, backgroundColor: "rgba(255,255,255,0.08)" }}
                animate={{ opacity: 1, y: 0, backgroundColor: r.flag ? "rgba(255,92,92,0.08)" : "rgba(255,255,255,0.02)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
                className={`grid grid-cols-[1fr_64px_64px_70px] items-center gap-2 rounded-lg border px-3 py-2 font-mono text-[11.5px] sm:grid-cols-[1fr_70px_70px_70px_80px] ${r.flag ? "border-coral/30" : "border-white/[0.05]"}`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-white/80">{r.name}</span>
                  {r.flag && <span className="flex items-center gap-1 text-[10px] text-coral"><AlertTriangle className="h-3 w-3" />{r.flag}</span>}
                </span>
                <span className="text-right text-white/55">{(r.ms / 1000).toFixed(2)}s</span>
                <span className="hidden text-right text-white/55 sm:block">{r.tok.toLocaleString()}</span>
                <span className="text-right text-white/55">${r.cost.toFixed(4)}</span>
                <span className={`flex items-center justify-end gap-1 text-right ${r.score >= 0.9 ? "text-ok" : "text-coral"}`}>
                  {r.score >= 0.9 ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                  {r.score.toFixed(2)}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export function Observability() {
  return (
    <section id="observability" className="relative overflow-hidden py-24 sm:py-32">
      <div className="absolute left-1/2 top-24 -z-10 h-[600px] w-[1100px] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(52,211,153,0.07),transparent)]" />
      <div className="page">
        <Reveal>
          <p className="eyebrow mb-4 flex items-center gap-2"><Activity className="h-3.5 w-3.5" /> Agent observability · evaluation · validation</p>
          <h2 className="h-display max-w-[980px] text-[2.5rem] sm:text-6xl md:text-[4.4rem]">
            Let&apos;s monitor <span className="serif-i text-coral">every LLM call</span> you make.
          </h2>
          <p className="mt-6 max-w-2xl text-[16.5px] leading-relaxed text-muted">
            I don&apos;t only build agents. I run <span className="text-white">end-to-end evaluation and monitoring as a service</span> for the
            agents you already have in production. Traces, cost, latency, quality scores and alerts live in Langfuse or LangSmith,
            with validation gates that stop a wrong answer before a customer ever sees it.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {features.map(({ I, t, d }, i) => (
              <motion.div
                key={t}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: i * 0.06 }}
                className="group flex gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 transition-colors hover:border-white/[0.16] hover:bg-white/[0.04]"
              >
                <span className="icon-chip shrink-0"><I className="h-4 w-4" /></span>
                <span>
                  <span className="block text-[15.5px] font-semibold tracking-tight">{t}</span>
                  <span className="mt-1 block text-[13.5px] leading-relaxed text-white/55">{d}</span>
                </span>
              </motion.div>
            ))}
          </div>

          <Reveal delay={0.1} className="lg:sticky lg:top-28">
            <Dashboard />
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                {(["langfuse", "langsmith", "ragas", "phoenix", "wandb", "guardrails"] as const).map((id) => (
                  <span key={id} className="flex items-center gap-2 text-[13px] text-white/55">
                    <ToolMark tool={T[id]} size={15} /> {T[id].name}
                  </span>
                ))}
              </div>
              <a href="#contact" className="btn-primary">
                Get your LLM calls monitored <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-3 font-mono text-[11px] text-white/35">Illustrative dashboard. Your real one runs on your own Langfuse or LangSmith project.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

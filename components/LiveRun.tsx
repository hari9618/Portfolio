"use client";

import { useInView } from "framer-motion";
import { Activity, Bot, CheckCircle2, Database, Info, Mail, Sparkles, UserCheck, Webhook, Workflow } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "./Reveal";

type Id = "trigger" | "orch" | "research" | "action" | "comms" | "human" | "done";
type Status = "idle" | "run" | "done";
type NodeDef = { id: Id; label: string; x: number; y: number; Icon: typeof Bot; detail: string; running: string };

// A representative lead-to-meeting workflow, laid out like the reference's order-exceptions run.
const nodes: NodeDef[] = [
  { id: "trigger", label: "Trigger", x: 13, y: 46, Icon: Webhook, detail: "lead #L-20481", running: "webhook received" },
  { id: "orch", label: "Orchestrator", x: 35.5, y: 46, Icon: Bot, detail: "3 agents sent", running: "planning…" },
  { id: "research", label: "Research agent", x: 58.5, y: 20, Icon: Database, detail: "14 sources", running: "enriching…" },
  { id: "action", label: "Action agent", x: 58.5, y: 46, Icon: Workflow, detail: "CRM updated", running: "writing to CRM…" },
  { id: "comms", label: "Comms agent", x: 58.5, y: 72, Icon: Mail, detail: "draft ready", running: "drafting…" },
  { id: "human", label: "Human approval", x: 82, y: 46, Icon: UserCheck, detail: "approved · 1 edit", running: "awaiting review" },
  { id: "done", label: "Resolved", x: 82, y: 72, Icon: Sparkles, detail: "4.2s · $0.009", running: "closing…" },
];
const edges: [Id, Id][] = [
  ["trigger", "orch"], ["orch", "research"], ["orch", "action"], ["orch", "comms"],
  ["research", "human"], ["action", "human"], ["comms", "human"], ["human", "done"],
];
const pos = Object.fromEntries(nodes.map((n) => [n.id, n])) as Record<Id, NodeDef>;

// Script: per beat, which nodes are running / finished, the tool-call counter and the log line.
const beats: { run: Id[]; done: Id[]; tools: number; log: string }[] = [
  { run: ["trigger"], done: [], tools: 0, log: "trigger · new inbound lead from website form" },
  { run: ["orch"], done: ["trigger"], tools: 0, log: "orchestrator · plan → research, crm update, outreach draft" },
  { run: ["research", "action", "comms"], done: ["trigger", "orch"], tools: 3, log: "3 agents running in parallel · web_search, hubspot, gmail" },
  { run: ["research", "comms"], done: ["trigger", "orch", "action"], tools: 5, log: "action agent · lead scored 82 · CRM record updated" },
  { run: ["comms"], done: ["trigger", "orch", "action", "research"], tools: 7, log: "research agent · 14 sources · every claim cited" },
  { run: ["human"], done: ["trigger", "orch", "action", "research", "comms"], tools: 8, log: "human gate · outbound email waiting for approval" },
  { run: ["done"], done: ["trigger", "orch", "action", "research", "comms", "human"], tools: 9, log: "approved with 1 edit · email sent · meeting link attached" },
  { run: [], done: ["trigger", "orch", "action", "research", "comms", "human", "done"], tools: 9, log: "run closed · 9 tool calls · $0.009 · 4.2s · ✓ resolved" },
];

export function LiveRun() {
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box, { margin: "-120px" });
  const [beat, setBeat] = useState(-1);
  const [runs, setRuns] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => {
      setBeat((b) => {
        if (b >= beats.length + 1) {
          setRuns((r) => r + 1);
          return 0;
        }
        return b + 1;
      });
    }, 1150);
    return () => clearInterval(id);
  }, [inView]);

  const cur = beat >= 0 ? beats[Math.min(beat, beats.length - 1)] : null;
  const status = (id: Id): Status => (cur?.run.includes(id) ? "run" : cur?.done.includes(id) ? "done" : "idle");
  const closed = beat >= beats.length - 1;

  return (
    <section id="live" className="relative py-24 sm:py-32">
      <div className="page">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <p className="eyebrow mb-4 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-pulseRing rounded-full bg-coral" />
                <span className="relative h-2 w-2 rounded-full bg-coral" />
              </span>
              Live · multi-agent run
            </p>
            <h2 className="h-display text-[2.4rem] sm:text-5xl md:text-[3.6rem]">
              Watch the agents work,
              <br />
              <span className="serif-i text-coral">node by node.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[12px] text-white/60">
              <span className="flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-coral" /> p95 2.4s</span>
              <span className="text-white/20">·</span>
              <span>cost/run $0.009</span>
              <span className="text-white/20">·</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-ok" /> 0.94 faith.</span>
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-12">
          <div
            ref={box}
            className="relative overflow-hidden rounded-[28px] border border-white/[0.1]"
            style={{
              background: "radial-gradient(90% 70% at 50% 0%, rgba(120,20,28,0.22), rgba(10,8,9,0.96) 60%), #0a0809",
              boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.06), 0 40px 80px -40px rgba(190,40,56,0.35)",
            }}
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-3 w-3 rounded-full bg-white/15" />
                ))}
              </div>
              <span className="hidden font-mono text-[12px] text-white/50 sm:block">workflow · lead_to_meeting · prod-ap-south-1</span>
              <span className="flex items-center gap-1.5 font-mono text-[12px] text-coral">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-coral" /> streaming
              </span>
            </div>

            {/* Desktop: spatial graph */}
            <div className="dot-grid relative hidden h-[420px] lg:block">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
                {edges.map(([a, b]) => {
                  const A = pos[a], B = pos[b];
                  const lit = status(a) !== "idle" && status(b) !== "idle";
                  const flowing = status(b) === "run";
                  const d =
                    A.x === B.x
                      ? `M${A.x} ${A.y + 8} L${B.x} ${B.y - 8}`
                      : `M${A.x + 10} ${A.y} C ${(A.x + B.x) / 2} ${A.y}, ${(A.x + B.x) / 2} ${B.y}, ${B.x - 10} ${B.y}`;
                  return (
                    <path
                      key={`${a}-${b}`}
                      d={d}
                      fill="none"
                      vectorEffect="non-scaling-stroke"
                      stroke={lit ? "#b4232f" : "rgb(255 255 255 / 0.08)"}
                      strokeWidth={lit ? 1.4 : 1}
                      strokeDasharray={flowing ? "5 5" : undefined}
                      style={{ animation: flowing ? "dash 0.7s linear infinite" : undefined, transition: "stroke .4s" }}
                    />
                  );
                })}
              </svg>
              {nodes.map((n) => (
                <GraphNode key={n.id} n={n} s={status(n.id)} />
              ))}
            </div>

            {/* Mobile: vertical pipeline */}
            <div className="grid gap-2 p-4 lg:hidden">
              {nodes.map((n) => (
                <MobileNode key={n.id} n={n} s={status(n.id)} />
              ))}
            </div>

            <div className="flex flex-col gap-3 border-t border-white/[0.06] px-6 py-4 font-mono text-[12.5px] sm:flex-row sm:items-center sm:justify-between">
              <div className="min-h-[20px] text-white/70">
                <span className="mr-1.5 text-white/35">›</span>
                {cur ? cur.log : "waiting for a trigger…"}
              </div>
              <div className="flex shrink-0 items-baseline gap-6 text-[11px] uppercase tracking-[0.18em] text-white/45">
                <span>
                  tool calls <b className="serif-i ml-2 text-xl normal-case tracking-normal text-white">{String(cur?.tools ?? 0).padStart(4, "0")}</b>
                </span>
                <span>
                  runs closed <b className="serif-i ml-2 text-xl normal-case tracking-normal text-white">{String(runs + (closed ? 1 : 0)).padStart(2, "0")}</b>
                </span>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-5 flex flex-col justify-between gap-3 font-mono text-[12px] text-white/45 sm:flex-row">
          <span className="flex items-center gap-2">
            <Info className="h-3.5 w-3.5 shrink-0" /> Representative run of a lead-to-meeting agent. Every outbound action passes a human gate.
          </span>
          <a href="#contact" className="text-coral hover:underline">
            Run this on your workflow →
          </a>
        </div>
      </div>
    </section>
  );
}

function StatusIcon({ s }: { s: Status }) {
  if (s === "run")
    return <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-[1.5px] border-coral/25 border-t-coral" />;
  if (s === "done") return <CheckCircle2 className="h-[18px] w-[18px] shrink-0 text-ok" />;
  return <span className="h-4 w-4 shrink-0 rounded-full border border-white/20" />;
}

function GraphNode({ n, s }: { n: NodeDef; s: Status }) {
  const { Icon } = n;
  return (
    <div
      className={`absolute flex w-[228px] -translate-x-1/2 -translate-y-1/2 items-center gap-3 rounded-[20px] border px-3.5 py-3 transition-all duration-500 ${
        s === "run"
          ? "border-coral/50 bg-[#1b0c0e] shadow-[0_0_44px_-10px_rgba(255,92,92,0.7)]"
          : s === "done"
            ? "border-white/[0.1] bg-[#0f1211]"
            : "border-white/[0.07] bg-[#0e0d0e]"
      }`}
      style={{ left: `${n.x}%`, top: `${n.y}%` }}
    >
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors duration-500 ${
          s === "idle" ? "bg-white/[0.04] text-white/45" : "bg-ok/10 text-ok"
        }`}
      >
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-semibold tracking-tight">{n.label}</span>
        <span className={`mt-0.5 block truncate font-mono text-[11px] ${s === "idle" ? "text-white/30" : s === "run" ? "text-coral" : "text-ok/90"}`}>
          {s === "idle" ? "waiting" : s === "run" ? n.running : n.detail}
        </span>
      </span>
      <StatusIcon s={s} />
    </div>
  );
}

function MobileNode({ n, s }: { n: NodeDef; s: Status }) {
  const { Icon } = n;
  return (
    <div className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition-all duration-500 ${s === "run" ? "border-coral/50 bg-coral/[0.07]" : s === "done" ? "border-ok/20" : "border-white/[0.07]"}`}>
      <Icon className={`h-4 w-4 ${s === "idle" ? "text-white/40" : "text-ok"}`} />
      <span className="flex-1 text-[13px] font-medium">{n.label}</span>
      <span className={`truncate font-mono text-[10px] ${s === "run" ? "text-coral" : "text-white/45"}`}>{s === "idle" ? "waiting" : s === "run" ? n.running : n.detail}</span>
      <StatusIcon s={s} />
    </div>
  );
}

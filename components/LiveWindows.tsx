"use client";

import { Bot, Check, MousePointer2, Sheet, Slack, Webhook } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

/** Shared clock for a looping micro-animation: returns a tick index that wraps at `len`. */
export function useLoop(len: number, ms = 100) {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT((v) => (v + 1) % len), ms);
    return () => clearInterval(id);
  }, [len, ms]);
  return t;
}

export function GlassWindow({ title, badge, children, className = "" }: { title: string; badge?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0b0c10]/[0.88] ${className}`}
      style={{ boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.07), 0 30px 60px -20px rgb(0 0 0 / 0.7)" }}
    >
      <div className="flex items-center gap-2 border-b border-white/[0.07] px-3 py-2">
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-2 w-2 rounded-full bg-white/15" />
          ))}
        </span>
        <span className="truncate font-mono text-[10px] text-white/50">{title}</span>
        <span className="ml-auto">{badge}</span>
      </div>
      {children}
    </div>
  );
}

const Live = ({ text = "live", tone = "coral" }: { text?: string; tone?: "coral" | "ok" }) => (
  <span className={`flex items-center gap-1 font-mono text-[9px] ${tone === "ok" ? "text-ok" : "text-coral"}`}>
    <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${tone === "ok" ? "bg-ok" : "bg-coral"}`} /> {text}
  </span>
);

/** Playwright bot logging into a portal, then extracting rows. One loop is 10 s. */
export function PlaywrightWindow({ big = false }: { big?: boolean }) {
  const t = useLoop(100, 100); // 0..99 => 10 s
  const email = "ops@acme.com";
  const typedEmail = email.slice(0, Math.max(0, Math.min(email.length, t - 10)));
  const typedPw = "•".repeat(Math.max(0, Math.min(10, t - 28)));
  const pressed = t >= 44 && t < 47;
  const loggedIn = t >= 48;
  const rowsDone = loggedIn ? Math.min(6, Math.floor((t - 52) / 4)) : 0;

  // cursor keyframes (percent of the body box)
  const cur = t < 10 ? { x: 80, y: 85 } : t < 26 ? { x: 30, y: 30 } : t < 42 ? { x: 30, y: 53 } : t < 48 ? { x: 50, y: 77 } : { x: 88, y: 18 + rowsDone * 11 };
  const rows = [
    ["INV-1041", "$1,280", "paid"], ["INV-1042", "$860", "due"], ["INV-1043", "$2,410", "paid"],
    ["INV-1044", "$390", "paid"], ["INV-1045", "$1,975", "due"], ["INV-1046", "$640", "paid"],
  ];

  return (
    <GlassWindow title={loggedIn ? "vendor-portal.com/invoices" : "vendor-portal.com/login"} badge={<Live text="headless" />}>
      <div className={`relative ${big ? "h-[300px] p-6" : "h-[176px] p-3.5"}`}>
        {!loggedIn ? (
          <div className="space-y-2.5">
            <div className={`font-semibold text-white/85 ${big ? "text-[15px]" : "text-[11px]"}`}>Sign in to Vendor Portal</div>
            {[typedEmail, typedPw].map((v, i) => (
              <div key={i} className={`rounded-md border px-2.5 font-mono text-white/80 ${big ? "py-2.5 text-[13px]" : "py-1.5 text-[10px]"} ${(i === 0 && t >= 10 && t < 26) || (i === 1 && t >= 26 && t < 44) ? "border-sky/70" : "border-white/10"}`}>
                {v || <span className="text-white/25">{i ? "password" : "email"}</span>}
                {((i === 0 && t >= 10 && t < 26) || (i === 1 && t >= 26 && t < 44)) && <span className="animate-blink">|</span>}
              </div>
            ))}
            <div className={`rounded-md bg-coral text-center font-semibold text-white transition-transform ${big ? "py-2.5 text-[13px]" : "py-1.5 text-[10px]"} ${pressed ? "scale-95 brightness-90" : ""}`}>Sign in</div>
          </div>
        ) : (
          <div className={`font-mono ${big ? "text-[12.5px]" : "text-[9.5px]"}`}>
            <div className="mb-1.5 flex justify-between text-white/40"><span>invoice</span><span>amount</span><span>status</span></div>
            {rows.map((r, i) => (
              <div key={r[0]} className={`flex justify-between rounded px-1 py-[3px] transition-colors duration-300 ${i < rowsDone ? "bg-ok/10 text-white/85" : "text-white/45"}`}>
                <span>{r[0]}</span><span>{r[1]}</span><span className={r[2] === "due" ? "text-coral" : ""}>{r[2]}</span>
              </div>
            ))}
          </div>
        )}
        <MousePointer2
          className="pointer-events-none absolute h-4 w-4 fill-white text-black drop-shadow transition-all duration-700 ease-out"
          style={{ left: `${cur.x}%`, top: `${cur.y}%` }}
        />
      </div>
      <div className={`flex items-center justify-between border-t border-white/[0.07] px-3 py-1.5 font-mono text-white/45 ${big ? "text-[11px]" : "text-[9px]"}`}>
        <span>playwright · chromium</span>
        <span className={rowsDone >= 6 ? "text-ok" : ""}>{rowsDone >= 6 ? "✓ 312 rows → CRM" : loggedIn ? `extracting ${rowsDone}/6…` : "page.fill()"}</span>
      </div>
    </GlassWindow>
  );
}

/** Langfuse-style trace: spans grow in sequence, tokens and cost tick up, eval score lands at the end. */
export function TraceWindow() {
  const t = useLoop(80, 100);
  const spans = [
    { l: "agent.run", x: 0, w: 100, c: "bg-white/25" },
    { l: "retrieve", x: 4, w: 24, c: "bg-sky/70" },
    { l: "rerank", x: 28, w: 10, c: "bg-sky/50" },
    { l: "llm.generate", x: 38, w: 40, c: "bg-coral/80" },
    { l: "tool.crm", x: 78, w: 12, c: "bg-ok/70" },
    { l: "eval.judge", x: 90, w: 10, c: "bg-[#fbbf24]/80" },
  ];
  const p = Math.min(1, t / 60);
  return (
    <GlassWindow title="langfuse · trace 8f2c…" badge={<Live text="tracing" tone="ok" />}>
      <div className="space-y-1.5 p-3.5 font-mono text-[9.5px]">
        {spans.map((s) => {
          const vis = Math.max(0, Math.min(s.w, p * 100 - s.x));
          return (
            <div key={s.l} className="flex items-center gap-2">
              <span className="w-16 shrink-0 truncate text-white/55">{s.l}</span>
              <div className="relative h-2.5 flex-1 rounded-sm bg-white/[0.04]">
                <div className={`absolute top-0 h-full rounded-sm ${s.c}`} style={{ left: `${s.x}%`, width: `${vis}%` }} />
              </div>
            </div>
          );
        })}
        <div className="flex justify-between border-t border-white/[0.07] pt-2 text-white/50">
          <span>{Math.round(p * 2184).toLocaleString()} tok</span>
          <span>${(p * 0.0092).toFixed(4)}</span>
          <span className={p >= 1 ? "text-ok" : ""}>{p >= 1 ? "faith 0.94 ✓" : "scoring…"}</span>
        </div>
      </div>
    </GlassWindow>
  );
}

/** Streaming agent log. */
export function AgentLogWindow() {
  const lines = [
    { a: "supervisor", m: "plan → research, enrich, notify", c: "text-white/80" },
    { a: "research", m: "web_search · 14 sources", c: "text-sky" },
    { a: "rag", m: "hybrid retrieve · top-8 reranked", c: "text-sky" },
    { a: "action", m: "crm.upsert(lead) ✓", c: "text-ok" },
    { a: "guardrail", m: "grounding check passed", c: "text-ok" },
    { a: "comms", m: "email drafted → human review", c: "text-coral" },
  ];
  const t = useLoop(lines.length * 8 + 10, 140);
  const n = Math.min(lines.length, Math.floor(t / 8) + 1);
  return (
    <GlassWindow title="agents · run #4821" badge={<Live />}>
      <div className="h-[132px] space-y-1 p-3.5 font-mono text-[9.5px]">
        {lines.slice(0, n).map((l, i) => (
          <div key={i} className="truncate">
            <span className="text-white/35">›</span> <span className="text-white/60">{l.a}</span> <span className={l.c}>{l.m}</span>
          </div>
        ))}
      </div>
    </GlassWindow>
  );
}

/** n8n-style flow with a token travelling node to node, and an execution counter. */
export function FlowWindow() {
  const t = useLoop(40, 100);
  const step = Math.floor(t / 10);
  const nodes = [
    { I: Webhook, l: "Webhook" },
    { I: Bot, l: "AI Agent" },
    { I: Sheet, l: "Sheets" },
    { I: Slack, l: "Slack" },
  ];
  const [runs, setRuns] = useState(1284);
  useEffect(() => {
    if (t === 39) setRuns((r) => r + 1);
  }, [t]);
  return (
    <GlassWindow title="n8n · lead-intake" badge={<Live text="active" tone="ok" />}>
      <div className="relative flex items-center justify-between px-4 py-5">
        <div className="absolute left-8 right-8 top-[38px] h-px bg-white/10" />
        <div className="absolute left-8 top-[38px] h-px bg-gradient-to-r from-coral/0 to-coral transition-all duration-1000 ease-linear" style={{ width: `${(Math.min(step, 3) / 3) * 78}%` }} />
        {nodes.map(({ I, l }, i) => (
          <div key={l} className="relative z-10 flex flex-col items-center gap-1.5">
            <span className={`grid h-9 w-9 place-items-center rounded-xl border transition-all duration-500 ${step >= i ? "border-coral/60 bg-coral/15 text-coral" : "border-white/10 bg-white/[0.03] text-white/45"}`}>
              {step > i ? <Check className="h-4 w-4" /> : <I className="h-4 w-4" />}
            </span>
            <span className="font-mono text-[8.5px] text-white/50">{l}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between border-t border-white/[0.07] px-3 py-1.5 font-mono text-[9px] text-white/45">
        <span>executions</span>
        <span className="text-white/75">{runs.toLocaleString()}</span>
      </div>
    </GlassWindow>
  );
}

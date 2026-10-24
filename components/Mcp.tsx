"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { Activity, ArrowRight, Cloud, Laptop, Plug, ShieldCheck, Wrench } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { T, type Tool } from "@/lib/tools";
import { Reveal } from "./Reveal";
import { ToolMark } from "./ToolChip";

// AI clients on the left, your tools on the right, one MCP server in the middle.
// Positions are percentages of the diagram box, so the same layout works at every width.
const clients: { tool: Tool; y: number }[] = [
  { tool: T.claude, y: 16 },
  { tool: { name: "Cursor", color: "#F4F4F5", mono: "Cu" }, y: 38.5 },
  { tool: { name: "VS Code", color: "#3B9CFF", mono: "VS" }, y: 61.5 },
  { tool: T.langgraph, y: 84 },
];
const tools: { tool: Tool; y: number }[] = [
  { tool: T.hubspot, y: 10 },
  { tool: T.postgres, y: 26 },
  { tool: T.slack, y: 42 },
  { tool: T.notion, y: 58 },
  { tool: T.github, y: 74 },
  { tool: T.sheets, y: 90 },
];
const X = { client: 11, hub: 50, tool: 89 };

type Call = { c: number; t: number; name: string; args: string; result: string; gate?: string };
const calls: Call[] = [
  { c: 0, t: 0, name: "crm.search_contacts", args: '{ stage: "lead", city: "Hyderabad" }', result: "12 contacts · 184 ms" },
  { c: 3, t: 1, name: "db.query", args: '{ sql: "SELECT … LIMIT 50" }', result: "50 rows · read-only · 96 ms" },
  { c: 1, t: 4, name: "github.create_issue", args: '{ title: "Fix login timeout" }', result: "issue #482 opened · 312 ms", gate: "write · approved by you" },
  { c: 2, t: 3, name: "docs.search", args: '{ q: "refund policy" }', result: "3 pages · 141 ms" },
  { c: 0, t: 2, name: "slack.post_message", args: '{ channel: "#sales", text: "…" }', result: "posted · 220 ms", gate: "write · approved by you" },
  { c: 3, t: 5, name: "sheets.append_row", args: '{ sheet: "Leads", row: […] }', result: "row 1,204 added · 158 ms" },
];
const STEP = 2600; // ms per tool call

function Node({ tool, x, y, active, side }: { tool: Tool; x: number; y: number; active: boolean; side: "l" | "r" }) {
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
      <div
        className={`flex items-center gap-2 rounded-full border px-2 py-1.5 transition-all duration-500 sm:px-3 ${
          active ? "border-coral/50 bg-[#1a0f10] shadow-[0_0_24px_-4px_rgba(255,92,92,0.45)]" : "border-white/[0.1] bg-[#0b0c10]"
        } ${side === "r" ? "flex-row-reverse sm:flex-row" : ""}`}
      >
        <ToolMark tool={tool} size={16} />
        <span className={`hidden whitespace-nowrap text-[12px] font-medium sm:inline ${active ? "text-white" : "text-white/60"}`}>{tool.name}</span>
      </div>
    </div>
  );
}

function Diagram() {
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box, { margin: "-80px" });
  const reduce = useReducedMotion();
  const [k, setK] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setK((v) => v + 1), STEP);
    return () => clearInterval(id);
  }, [inView]);

  const call = calls[k % calls.length];
  const cy = clients[call.c].y;
  const ty = tools[call.t].y;
  // the last few calls, newest first, for the log underneath
  const log = Array.from({ length: Math.min(k + 1, 4) }, (_, i) => ({ ...calls[(k - i) % calls.length], key: k - i }));

  return (
    <div
      ref={box}
      className="relative overflow-hidden rounded-[26px] border border-white/[0.1]"
      style={{
        background: "radial-gradient(60% 50% at 50% 45%, rgba(255,92,92,0.09), transparent 70%), radial-gradient(60% 60% at 100% 100%, rgba(96,165,250,0.07), transparent 60%), #08090b",
        boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.06), 0 40px 90px -40px rgba(255,92,92,0.25)",
      }}
    >
      <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-3 font-mono text-[11px] text-white/45">
        <span className="flex gap-1.5">{[0, 1, 2].map((i) => <span key={i} className="h-2.5 w-2.5 rounded-full bg-white/15" />)}</span>
        mcp · tool calls
        <span className="ml-auto flex items-center gap-1.5 text-ok"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ok" /> live</span>
      </div>

      <div className="flex justify-between px-5 pt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
        <span>AI apps &amp; agents</span>
        <span>your tools</span>
      </div>

      <div className="relative mx-2 aspect-[5/6] sm:mx-4 sm:aspect-[16/10]">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
          {clients.map((n, i) => (
            <line key={`c${i}`} x1={X.client} y1={n.y} x2={X.hub} y2={50} vectorEffect="non-scaling-stroke"
              stroke={i === call.c ? "rgba(255,92,92,0.7)" : "rgba(255,255,255,0.09)"} strokeWidth={i === call.c ? 1.4 : 1} strokeDasharray={i === call.c ? "none" : "3 4"}
              style={{ transition: "stroke 0.5s" }} />
          ))}
          {tools.map((n, i) => (
            <line key={`t${i}`} x1={X.hub} y1={50} x2={X.tool} y2={n.y} vectorEffect="non-scaling-stroke"
              stroke={i === call.t ? "rgba(255,92,92,0.7)" : "rgba(255,255,255,0.09)"} strokeWidth={i === call.t ? 1.4 : 1} strokeDasharray={i === call.t ? "none" : "3 4"}
              style={{ transition: "stroke 0.5s" }} />
          ))}
        </svg>

        {/* the request travels client -> server -> tool, and the result comes back the same way */}
        {!reduce && inView && (
          <motion.span
            key={k}
            aria-hidden
            className="absolute z-10 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
            initial={{ left: `${X.client}%`, top: `${cy}%`, backgroundColor: "#ff5c5c", opacity: 0 }}
            animate={{
              left: [`${X.client}%`, `${X.hub}%`, `${X.tool}%`, `${X.hub}%`, `${X.client}%`],
              top: [`${cy}%`, "50%", `${ty}%`, "50%", `${cy}%`],
              backgroundColor: ["#ff5c5c", "#ff5c5c", "#34d399", "#34d399", "#34d399"],
              opacity: [0, 1, 1, 1, 0],
            }}
            transition={{ duration: (STEP - 300) / 1000, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}
            style={{ boxShadow: "0 0 14px 3px currentColor", color: "rgba(255,120,120,0.6)" }}
          />
        )}

        {clients.map((n, i) => <Node key={n.tool.name} tool={n.tool} x={X.client} y={n.y} active={i === call.c} side="l" />)}
        {tools.map((n, i) => <Node key={n.tool.name} tool={n.tool} x={X.tool} y={n.y} active={i === call.t} side="r" />)}

        {/* the MCP server */}
        <div className="absolute left-1/2 top-1/2 z-20 w-[44%] -translate-x-1/2 -translate-y-1/2 sm:w-[30%]">
          <div className="absolute -inset-3 animate-pulse rounded-[22px] bg-coral/10 blur-xl" />
          <div className="relative rounded-2xl border border-coral/35 bg-[#0d0b0c] p-3 text-center sm:p-4" style={{ boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.07)" }}>
            <div className="mx-auto grid h-9 w-9 place-items-center rounded-xl bg-coral/15 ring-1 ring-coral/30">
              <Plug className="h-4 w-4 text-coral" />
            </div>
            <div className="mt-2 text-[13px] font-semibold tracking-tight">your-mcp-server</div>
            <div className="mt-0.5 font-mono text-[9.5px] text-white/40 sm:text-[10px]">6 tools · OAuth · audit log</div>
            <motion.div
              key={k}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mt-2 truncate rounded-md bg-white/[0.05] px-2 py-1 font-mono text-[10px] text-coral sm:text-[10.5px]"
            >
              {call.name}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.07] px-5 py-4 font-mono text-[11px] sm:text-[11.5px]">
        <div className="space-y-2">
          {log.map((l, i) => (
            <motion.div
              key={l.key}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: i === 0 ? 1 : 0.45 - i * 0.08, y: 0 }}
              transition={{ duration: 0.4 }}
              className="min-w-0"
            >
              <div className="truncate text-white/80">
                <span className="text-coral">→</span> tools/call <span className="text-sky">{l.name}</span> <span className="text-white/40">{l.args}</span>
              </div>
              <div className="truncate text-white/55">
                <span className="text-ok">←</span> {l.result}
                {l.gate && <span className="ml-2 rounded bg-white/[0.06] px-1.5 py-px text-[10px] text-white/50">{l.gate}</span>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

const features = [
  { I: Wrench, t: "Custom MCP servers", d: "Your APIs, databases and internal tools wrapped as typed MCP tools, in Python or TypeScript." },
  { I: Laptop, t: "Works with every AI app", d: "One server, many clients: Claude, Claude Code, Cursor, VS Code and your own LangGraph agents." },
  { I: ShieldCheck, t: "Secure by default", d: "OAuth, scoped read-only access, human approval for anything that writes, and a full audit log." },
  { I: Activity, t: "Traced and tested", d: "Every tool call traced in Langfuse, with evals that check the agent picks the right tool." },
  { I: Cloud, t: "Local or remote", d: "stdio for your laptop, Streamable HTTP for your team, deployed on AWS, Cloudflare or Vercel." },
];

// FastMCP: the official Python SDK's high-level server API.
const code: { t: string; c: string }[][] = [
  [{ t: "from ", c: "text-[#c792ea]" }, { t: "mcp.server.fastmcp ", c: "text-white/80" }, { t: "import ", c: "text-[#c792ea]" }, { t: "FastMCP", c: "text-sky" }],
  [],
  [{ t: "mcp", c: "text-white" }, { t: " = ", c: "text-white/80" }, { t: "FastMCP", c: "text-sky" }, { t: "(", c: "text-white/80" }, { t: '"acme-crm"', c: "text-[#c3e88d]" }, { t: ")", c: "text-white/80" }],
  [],
  [{ t: "@mcp.tool()", c: "text-[#f78c6c]" }],
  [{ t: "def ", c: "text-[#c792ea]" }, { t: "search_contacts", c: "text-sky" }, { t: "(stage: ", c: "text-white/80" }, { t: "str", c: "text-[#ffcb6b]" }, { t: ", city: ", c: "text-white/80" }, { t: "str", c: "text-[#ffcb6b]" }, { t: ") -> ", c: "text-white/80" }, { t: "list", c: "text-[#ffcb6b]" }, { t: ":", c: "text-white/80" }],
  [{ t: '    """Find CRM contacts by pipeline stage and city."""', c: "text-[#c3e88d]" }],
  [{ t: "    return ", c: "text-[#c792ea]" }, { t: "crm.search(stage=stage, city=city, limit=", c: "text-white/80" }, { t: "50", c: "text-[#f78c6c]" }, { t: ")", c: "text-white/80" }],
  [],
  [{ t: "mcp", c: "text-white" }, { t: ".run(transport=", c: "text-white/80" }, { t: '"streamable-http"', c: "text-[#c3e88d]" }, { t: ")  ", c: "text-white/80" }, { t: "# any MCP client can connect", c: "text-white/35" }],
];

const atlasTools = ["web_search", "sec_filing_excerpt", "stock_quote", "company_news"];

export function Mcp() {
  return (
    <section id="mcp" className="relative overflow-hidden py-24 sm:py-32">
      <div className="absolute left-0 top-32 -z-10 h-[560px] w-[820px] bg-[radial-gradient(closest-side,rgba(255,92,92,0.07),transparent)]" />
      <div className="page">
        <Reveal>
          <p className="eyebrow mb-4 flex items-center gap-2"><Plug className="h-3.5 w-3.5" /> MCP · Model Context Protocol · custom servers</p>
          <h2 className="h-display max-w-[1000px] text-[2.5rem] sm:text-6xl md:text-[4.4rem]">
            Your tools, <span className="serif-i text-coral">plugged into AI.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-[16.5px] leading-relaxed text-muted">
            MCP is the open standard that lets AI assistants and agents use real tools. I build{" "}
            <span className="text-white">custom MCP servers</span> that connect Claude, Cursor and your own agents to your CRM, database,
            docs and internal APIs, so AI can look things up and take action inside your business, safely and with every call on record.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:items-start">
          <Reveal>
            <Diagram />
            <p className="mt-3 font-mono text-[11px] text-white/35">Illustrative. Your server exposes exactly the tools and permissions you choose.</p>
          </Reveal>

          <div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {features.map(({ I, t, d }, i) => (
                <motion.div
                  key={t}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.6, delay: i * 0.06 }}
                  className={`flex gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 transition-colors hover:border-white/[0.16] hover:bg-white/[0.04] ${i === features.length - 1 ? "sm:col-span-2 lg:col-span-1" : ""}`}
                >
                  <span className="icon-chip shrink-0"><I className="h-4 w-4" /></span>
                  <span>
                    <span className="block text-[15.5px] font-semibold tracking-tight">{t}</span>
                    <span className="mt-1 block text-[13.5px] leading-relaxed text-white/55">{d}</span>
                  </span>
                </motion.div>
              ))}
            </div>
            <a href="#contact" className="btn-primary mt-6">
              Connect my tools to AI <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-10">
          <Reveal className="overflow-hidden rounded-2xl border border-white/[0.1] bg-[#07080b]">
            <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-2.5 font-mono text-[11px] text-white/45">
              <span className="flex gap-1.5">{[0, 1, 2].map((i) => <span key={i} className="h-2.5 w-2.5 rounded-full bg-white/15" />)}</span>
              server.py
              <span className="ml-auto text-white/30">Python · official MCP SDK</span>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-[1.75] sm:text-[12.5px]">
              {code.map((line, li) => (
                <div key={li} className="whitespace-pre">
                  <span className="mr-4 inline-block w-4 select-none text-right text-white/20">{li + 1}</span>
                  {line.map((s, si) => <span key={si} className={s.c}>{s.t}</span>)}
                </div>
              ))}
            </pre>
          </Reveal>

          <Reveal delay={0.1} className="card flex flex-col p-6">
            <p className="eyebrow-muted">Already in production</p>
            <h3 className="mt-3 text-[1.35rem] font-semibold leading-snug tracking-tight">
              Atlas ships its research tools as <span className="serif-i text-coral">an MCP server.</span>
            </h3>
            <p className="mt-3 text-[14px] leading-relaxed text-white/55">
              The same tools Atlas&apos;s agents use for web search, SEC filings, stock quotes and company news are exposed over MCP, so
              Claude Desktop, Cursor or any MCP client can discover and call them.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {atlasTools.map((t) => (
                <span key={t} className="rounded-full border border-white/[0.09] bg-white/[0.03] px-3 py-1 font-mono text-[11.5px] text-white/70">{t}</span>
              ))}
            </div>
            <a href="https://github.com/hari9618/atlas-agentic-research" target="_blank" rel="noreferrer" className="mt-auto inline-flex items-center gap-1.5 pt-6 text-[13.5px] font-medium text-white/80 transition hover:text-white">
              See the code on GitHub <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

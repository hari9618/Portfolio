"use client";

import { motion, useInView } from "framer-motion";
import { Bot, CalendarClock, CheckCircle2, Database, FlaskConical, MousePointerClick } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "./Reveal";
import { PlaywrightWindow } from "./LiveWindows";

// Each line: [indent, tokens] with lightweight syntax colouring.
const code: { t: string; c: string }[][] = [
  [{ t: "const ", c: "text-[#c792ea]" }, { t: "browser", c: "text-white" }, { t: " = await ", c: "text-[#c792ea]" }, { t: "chromium", c: "text-sky" }, { t: ".launch({ headless: ", c: "text-white/80" }, { t: "true", c: "text-[#f78c6c]" }, { t: " });", c: "text-white/80" }],
  [{ t: "const ", c: "text-[#c792ea]" }, { t: "page", c: "text-white" }, { t: " = await ", c: "text-[#c792ea]" }, { t: "browser", c: "text-sky" }, { t: ".newPage();", c: "text-white/80" }],
  [{ t: "await ", c: "text-[#c792ea]" }, { t: "page", c: "text-sky" }, { t: ".goto(", c: "text-white/80" }, { t: "'https://vendor-portal.com'", c: "text-[#c3e88d]" }, { t: ");", c: "text-white/80" }],
  [{ t: "await ", c: "text-[#c792ea]" }, { t: "page", c: "text-sky" }, { t: ".getByLabel(", c: "text-white/80" }, { t: "'Email'", c: "text-[#c3e88d]" }, { t: ").fill(env.USER);", c: "text-white/80" }],
  [{ t: "await ", c: "text-[#c792ea]" }, { t: "page", c: "text-sky" }, { t: ".getByRole(", c: "text-white/80" }, { t: "'button'", c: "text-[#c3e88d]" }, { t: ", { name: ", c: "text-white/80" }, { t: "'Sign in'", c: "text-[#c3e88d]" }, { t: " }).click();", c: "text-white/80" }],
  [{ t: "const ", c: "text-[#c792ea]" }, { t: "rows", c: "text-white" }, { t: " = await ", c: "text-[#c792ea]" }, { t: "page", c: "text-sky" }, { t: ".locator(", c: "text-white/80" }, { t: "'table tr'", c: "text-[#c3e88d]" }, { t: ").allInnerTexts();", c: "text-white/80" }],
  [{ t: "await ", c: "text-[#c792ea]" }, { t: "crm", c: "text-sky" }, { t: ".upsert(rows);  ", c: "text-white/80" }, { t: "// 312 invoices synced, nobody touched a mouse", c: "text-white/35" }],
];
const lineEnds = code.reduce<number[]>((acc, l) => [...acc, (acc.at(-1) ?? 0) + l.reduce((m, s) => m + s.t.length, 0)], []);
const totalChars = lineEnds.at(-1)!;

function TypedCode() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setN((v) => (v >= totalChars + 60 ? 0 : v + 3)), 30);
    return () => clearInterval(id);
  }, [inView]);
  let left = n;
  const cursorLine = Math.max(0, lineEnds.findIndex((e) => e >= n));
  return (
    <div ref={ref} className="overflow-hidden rounded-2xl border border-white/[0.1] bg-[#07080b]" style={{ boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.06)" }}>
      <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-2.5 font-mono text-[11px] text-white/45">
        <span className="flex gap-1.5">{[0, 1, 2].map((i) => <span key={i} className="h-2.5 w-2.5 rounded-full bg-white/15" />)}</span>
        sync-invoices.spec.ts
        <span className="ml-auto text-ok">● scheduled · every 15 min</span>
      </div>
      <pre className="min-h-[218px] overflow-x-auto p-4 font-mono text-[12px] leading-[1.75] sm:text-[12.5px]">
        {code.map((line, li) => (
          <div key={li} className="whitespace-pre">
            <span className="mr-4 inline-block w-4 select-none text-right text-white/20">{li + 1}</span>
            {line.map((s, si) => {
              const show = s.t.slice(0, Math.max(0, left));
              left -= s.t.length;
              return <span key={si} className={s.c}>{show}</span>;
            })}
            {li === (n > totalChars ? code.length - 1 : cursorLine) && <span className="animate-blink text-coral">▋</span>}
          </div>
        ))}
      </pre>
    </div>
  );
}

const tests = [
  ["login flow", "1.2s"], ["checkout · card + UPI", "2.4s"], ["invoice export (CSV)", "1.8s"],
  ["role permissions", "0.9s"], ["search + filters", "1.1s"], ["mobile viewport", "2.0s"],
];

function TestRunner() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-80px" });
  const [k, setK] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setK((v) => (v + 1) % (tests.length + 4)), 650);
    return () => clearInterval(id);
  }, [inView]);
  const done = Math.min(k, tests.length);
  return (
    <div ref={ref} className="rounded-2xl border border-white/[0.1] bg-[#07080b] p-4 font-mono text-[12px]">
      <div className="mb-3 flex items-center justify-between text-white/45">
        <span>$ npx playwright test --project=chromium</span>
        <span className="text-white/30">CI · GitHub Actions</span>
      </div>
      <div className="space-y-1.5">
        {tests.map(([name, ms], i) => (
          <div key={name} className={`flex items-center gap-2 transition-opacity duration-300 ${i < done ? "opacity-100" : i === done ? "opacity-60" : "opacity-20"}`}>
            {i < done ? <CheckCircle2 className="h-3.5 w-3.5 text-ok" /> : <span className="h-3.5 w-3.5 animate-spin rounded-full border border-white/20 border-t-coral" style={{ animationPlayState: i === done ? "running" : "paused" }} />}
            <span className="text-white/75">{name}</span>
            <span className="ml-auto text-white/35">{i < done ? ms : ""}</span>
          </div>
        ))}
      </div>
      <div className={`mt-3 border-t border-white/[0.07] pt-3 ${done === tests.length ? "text-ok" : "text-white/40"}`}>
        {done === tests.length ? "✓ 48 passed · 0 flaky · report uploaded" : `running ${done}/${tests.length}…`}
      </div>
    </div>
  );
}

const uses = [
  { I: Database, t: "Scraping & data extraction", d: "Pull prices, listings, reports and leads from sites with no API, on a schedule." },
  { I: MousePointerClick, t: "Back-office bots", d: "Log in, fill forms, download invoices, update portals: the clicking your team does every day." },
  { I: Bot, t: "Browser agents", d: "An LLM plans each step and Playwright executes it, for tasks that change every time." },
  { I: FlaskConical, t: "Automated E2E testing", d: "Playwright suites in CI that test every release on Chromium, Firefox, WebKit and mobile." },
  { I: CalendarClock, t: "Runs 24/7, headless", d: "Scheduled, retried and monitored, with screenshots and traces when anything breaks." },
];

export function BrowserAutomation() {
  return (
    <section id="automation" className="relative overflow-hidden py-24 sm:py-32">
      <div className="absolute right-0 top-40 -z-10 h-[520px] w-[760px] bg-[radial-gradient(closest-side,rgba(46,173,51,0.08),transparent)]" />
      <div className="page">
        <Reveal>
          <p className="eyebrow mb-4">Playwright · headless browsers · automated testing</p>
          <h2 className="h-display max-w-[1000px] text-[2.5rem] sm:text-6xl md:text-[4.4rem]">
            Headless browsers that <span className="serif-i text-coral">do the clicking.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-[16.5px] leading-relaxed text-muted">
            Your team spends hours logging into portals, copying tables and re-testing the same pages. I hand that repetitive work
            to <span className="text-white">Playwright bots and browser agents</span> that run headless and on schedule, and to test suites
            that check every release before your users do.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Reveal className="space-y-6">
            <TypedCode />
            <TestRunner />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative">
              <div className="absolute -inset-6 -z-10 rounded-[40px] bg-[radial-gradient(closest-side,rgba(96,165,250,0.12),transparent)] blur-xl" />
              <PlaywrightWindow big />
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {uses.map(({ I, t, d }, i) => (
                <motion.div
                  key={t}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  className={`rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 ${i === uses.length - 1 ? "sm:col-span-2" : ""}`}
                >
                  <div className="flex items-center gap-2 text-[14.5px] font-semibold tracking-tight"><I className="h-4 w-4 text-coral" />{t}</div>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/55">{d}</p>
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

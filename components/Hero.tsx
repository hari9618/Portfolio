"use client";

import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { Activity, ArrowDown, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { heroRotating, profile } from "@/lib/content";
import { useIntro } from "@/lib/intro";
import { T } from "@/lib/tools";
import { AgentMesh } from "./AgentMesh";
import { AgentLogWindow, FlowWindow, PlaywrightWindow, TraceWindow } from "./LiveWindows";
import { Starfield } from "./Starfield";
import { ToolMark } from "./ToolChip";

const ease = [0.22, 1, 0.36, 1] as const;

/** Rotating phrase whose container width glides to fit each phrase, so the centred line never jumps. */
function Rotator() {
  const [i, setI] = useState(0);
  const [widths, setWidths] = useState<number[]>([]);
  const measure = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const read = () => {
      const kids = measure.current?.children;
      if (kids) setWidths(Array.from(kids, (k) => (k as HTMLElement).offsetWidth));
    };
    read();
    document.fonts?.ready.then(read);
    window.addEventListener("resize", read);
    const id = setInterval(() => setI((v) => (v + 1) % heroRotating.length), 2300);
    return () => {
      clearInterval(id);
      window.removeEventListener("resize", read);
    };
  }, []);
  return (
    <>
      <span ref={measure} aria-hidden className="pointer-events-none invisible absolute left-0 top-0 whitespace-nowrap">
        {heroRotating.map((w) => (
          <span key={w} className="absolute whitespace-nowrap">{w}</span>
        ))}
      </span>
      <motion.span className="relative inline-block h-[1.3em] overflow-hidden align-top" animate={{ width: widths[i] ?? "auto" }} transition={{ duration: 0.5, ease }}>
        <AnimatePresence initial={false}>
          <motion.span
            key={heroRotating[i]}
            initial={{ y: "100%", opacity: 0, filter: "blur(4px)" }}
            animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
            exit={{ y: "-100%", opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.5, ease }}
            className="absolute left-0 top-0 whitespace-nowrap leading-[1.3] text-coral"
          >
            {heroRotating[i]}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </>
  );
}

function Word({ children, delay, className = "" }: { children: React.ReactNode; delay: number; className?: string }) {
  return (
    // large blur -> sharp, with a slight upward settle (the camera "arrives" at the headline)
    <motion.span
      className={`inline-block pb-[0.14em] align-bottom will-change-transform ${className}`}
      initial={{ opacity: 0, y: "0.32em", filter: "blur(12px)", scale: 1.03 }}
      animate={{ opacity: 1, y: "0em", filter: "blur(0px)", scale: 1, transitionEnd: { filter: "none" } }}
      transition={{ duration: 1.4, delay, ease }}
    >
      {children}
    </motion.span>
  );
}

/** A floating "live system" window with depth-based mouse parallax and a gentle bob. */
function Float({ children, className, depth, delay }: { children: React.ReactNode; className: string; depth: number; delay: number }) {
  const mx = useMotionValue(0), my = useMotionValue(0);
  const x = useSpring(useTransform(mx, (v) => v * depth), { stiffness: 60, damping: 18 });
  const y = useSpring(useTransform(my, (v) => v * depth), { stiffness: 60, damping: 18 });
  useEffect(() => {
    const on = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", on);
    return () => window.removeEventListener("pointermove", on);
  }, [mx, my]);
  return (
    <motion.div style={{ x, y }} className={`absolute z-10 hidden xl:block ${className}`}>
      {/* far windows grow in from behind, near ones settle in from in front of the glass */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: depth < 0 ? 0.82 : 1.14, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
        transition={{ duration: 1.6, delay, ease }}
      >
        <div className="animate-floaty" style={{ animationDelay: `${delay}s`, animationDuration: `${6 + Math.abs(depth) / 10}s` }}>{children}</div>
      </motion.div>
    </motion.div>
  );
}

const heroTools = ["playwright", "langgraph", "n8n", "langfuse", "langsmith", "ragas", "openai", "aws"] as const;

export function Hero() {
  const { entered, playing } = useIntro();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const fade = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const meshScale = useTransform(scrollYProgress, [0, 1], [1, 1.25]);

  return (
    <section ref={ref} id="top" className="relative isolate min-h-[100svh] overflow-hidden">
      {/* backdrop: deep space, a crimson horizon glow (reference palette) and a cool core */}
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(120%_80%_at_50%_110%,#2a0c12_0%,#120a12_30%,#06070c_62%,#040406_100%)]" />
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(45%_40%_at_50%_45%,rgba(60,110,200,0.16),transparent_70%)]" />
      <div className="absolute inset-0 -z-20">
        <Starfield density={0.9} paused={playing && !entered} />
      </div>
      <motion.div style={{ scale: meshScale }} className="absolute inset-0 -z-10 opacity-45 sm:opacity-100 [mask-image:radial-gradient(60%_55%_at_50%_50%,rgba(0,0,0,0.25),black_75%)]">
        <AgentMesh paused={playing && !entered} />
      </motion.div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-b from-transparent to-bg" />

      {entered && (
        <>
          <Float className="left-[3%] top-[17%] w-[268px]" depth={-26} delay={2.1}><PlaywrightWindow /></Float>
          <Float className="right-[3%] top-[15%] w-[262px]" depth={-18} delay={2.3}><TraceWindow /></Float>
          <Float className="bottom-[13%] left-[5%] w-[262px]" depth={20} delay={2.45}><AgentLogWindow /></Float>
          <Float className="bottom-[15%] right-[5%] w-[262px]" depth={28} delay={2.6}><FlowWindow /></Float>

          <motion.div style={{ y: contentY, opacity: fade }} className="page relative z-20 flex min-h-[100svh] flex-col items-center justify-center pb-16 pt-28 text-center">
            <motion.a
              href="#contact"
              initial={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
              transition={{ duration: 1, delay: 0.3, ease }}
              className="pill mb-8 border-white/15 bg-black/40 backdrop-blur-md hover:border-white/30"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-pulseRing rounded-full bg-ok" />
                <span className="relative h-2 w-2 rounded-full bg-ok" />
              </span>
              {profile.first} · AI Engineer · open to full-time &amp; freelance
            </motion.a>

            <h1 className="font-serif text-[3.4rem] leading-[0.92] tracking-[-0.025em] sm:text-[5.4rem] md:text-[6.6rem] lg:text-[7.4rem]">
              <Word delay={0.5}>Automate</Word> <Word delay={0.6}>the</Word> <Word delay={0.7}>work.</Word>
              <br />
              <Word delay={0.9} className="italic text-coral">Prove</Word> <Word delay={1.0} className="italic text-coral">it</Word>{" "}
              <Word delay={1.1} className="italic text-coral">works.</Word>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.35, ease }}
              className="relative mt-7 text-lg font-medium leading-[1.3] tracking-tight text-white/90 sm:text-2xl"
            >
              I build <Rotator />
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.5, ease }}
              className="mt-4 max-w-[640px] text-[15px] leading-relaxed text-white/65 sm:text-[17px]"
            >
              Agents, RAG, n8n workflows and headless Playwright browsers that take repetitive work off your team. Then I
              monitor every LLM call with <span className="text-white">Langfuse</span> and <span className="text-white">LangSmith</span> and run
              end-to-end evals, so you know it&apos;s right before your customers do.
            </motion.p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <motion.a href="#services" className="btn-primary" initial={{ opacity: 0, y: 14, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.9, delay: 1.7, ease }}>
                See what I ship <ArrowDown className="h-4 w-4" />
              </motion.a>
              <motion.a href="#observability" className="btn-ghost" initial={{ opacity: 0, y: 14, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.9, delay: 1.82, ease }}>
                <Activity className="h-4 w-4 text-coral" /> Monitor my LLM calls <ArrowRight className="h-4 w-4" />
              </motion.a>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              {heroTools.map((id, i) => (
                <motion.span
                  key={id}
                  className="flex items-center gap-2 text-[13px] text-white/50"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 2 + i * 0.06, ease }}
                >
                  <ToolMark tool={T[id]} size={15} /> {T[id].name}
                </motion.span>
              ))}
            </div>

            <motion.a
              href="#services"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3 }}
              className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-white/35 sm:flex"
            >
              scroll
              <span className="relative h-9 w-[1px] overflow-hidden bg-white/10">
                <span className="absolute inset-x-0 top-0 h-3 animate-[scrollcue_1.8s_ease-in-out_infinite] bg-coral" />
              </span>
            </motion.a>
          </motion.div>
        </>
      )}
    </section>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { armLateStart, audioAllowed, playIntroScore, stopIntroScore } from "@/lib/cinematic-audio";
import { useIntro } from "@/lib/intro";
import { CUE_AT, IntroUniverse, type Cue } from "./universe";

const film = [0.16, 1, 0.3, 1] as const; // long, calm deceleration
const NAME = "HARI KRISHNA";

/**
 * The opening sequence: ~9 s, once per browser session. Visuals run on a canvas engine (./universe);
 * typography and atmosphere are layered on top. Sound is always on: the score starts immediately when the
 * browser allows it, otherwise on the visitor's first click, tap or key press, in sync with the timeline.
 */
export function CinematicIntro() {
  const { playing, setEntered, finish, run } = useIntro();
  if (!playing) return null;
  return <Sequence key={run} setEntered={setEntered} finish={finish} />;
}

// Events that count as a user activation for autoplay (touch only activates on release).
const GESTURES = ["pointerdown", "pointerup", "touchend", "click", "keydown"] as const;

function Sequence({ setEntered, finish }: { setEntered: (v: boolean) => void; finish: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<IntroUniverse | null>(null);
  const [cues, setCues] = useState<Set<Cue>>(new Set());
  const [mobile, setMobile] = useState(false);
  const started = useRef(false);
  const has = (c: Cue) => cues.has(c);

  const onCue = useCallback(
    (c: Cue) => {
      setCues((s) => new Set(s).add(c));
      if (c === "emerge") setEntered(true);
      if (c === "done") finish();
    },
    [setEntered, finish],
  );

  // engine lifecycle
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    setMobile(isMobile);
    document.documentElement.style.overflow = "hidden";
    const u = new IntroUniverse(canvas.current!, { mobile: isMobile, onCue });
    engine.current = u;
    u.start();
    const onResize = () => u.resize();
    const onMove = (e: PointerEvent) => u.setMouse(e.clientX / window.innerWidth - 0.5, e.clientY / window.innerHeight - 0.5);
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove);
    return () => {
      u.stop();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.style.overflow = "";
    };
  }, [onCue]);

  useEffect(() => {
    if (cues.has("exit")) document.documentElement.style.overflow = "";
  }, [cues]);

  // sound: play straight away if the browser allows it, otherwise on the first gesture anywhere
  const startScore = useCallback(() => {
    if (started.current) return;
    const t = engine.current?.t ?? 0;
    if (t > CUE_AT.exit) return;
    started.current = true;
    playIntroScore(t, window.innerWidth < 768 ? 0.75 : 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    audioAllowed().then((ok) => !cancelled && ok && startScore());
    const onGesture = (e: Event) => {
      if ((e.target as HTMLElement)?.closest?.("[data-intro-skip]")) return;
      startScore();
    };
    GESTURES.forEach((g) => window.addEventListener(g, onGesture, { passive: true }));
    return () => {
      cancelled = true;
      GESTURES.forEach((g) => window.removeEventListener(g, onGesture));
    };
  }, [startScore]);

  // The score is longer than the visuals: it keeps ringing under the hero and ends on its own.
  // If the browser kept the intro silent, the first click on the hero plays the impact and chord.
  useEffect(() => () => { if (!started.current) armLateStart(); }, []);

  const skip = () => {
    if (started.current) stopIntroScore(1.2);
    else started.current = true; // skipping means "get me in": don't play the late start either
    engine.current?.jump(CUE_AT.emerge);
  };

  const exiting = has("exit");

  return (
    <motion.div
      className="intro-overlay fixed inset-0 z-[100] overflow-hidden bg-[#020206]"
      role="dialog"
      aria-label="Intro: Hari Krishna, AI Engineer"
      animate={exiting ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 1.7, ease: film }}
      style={{ pointerEvents: exiting ? "none" : "auto" }}
    >
      {/* atmosphere: the 'heaven' layer, a celestial glow, faint volumetric shafts, warm undertone */}
      <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.6, delay: 0.9 }}
        style={{ background: "radial-gradient(38% 34% at 50% 50%, rgba(92,104,210,0.16), rgba(40,40,110,0.07) 45%, transparent 72%)" }} />
      <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: has("name") ? 1 : 0.6 }} transition={{ duration: 2.4, delay: 1.6 }}
        style={{ background: "radial-gradient(70% 45% at 50% 108%, rgba(255,92,92,0.09), transparent 70%)" }} />
      <motion.div className="pointer-events-none absolute inset-0 overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 3, delay: 2 }}>
        {[-18, 4, 22].map((l, i) => (
          <div key={i} className="intro-shaft absolute top-[-30%] h-[160%] w-[22vw]"
            style={{ left: `${30 + l}%`, transform: `rotate(${14 + i * 4}deg)`, animationDelay: `${i * -4}s`,
              background: "linear-gradient(90deg, transparent, rgba(190,200,255,0.022) 30%, rgba(200,210,255,0.05) 50%, rgba(190,200,255,0.022) 70%, transparent)" }} />
        ))}
      </motion.div>

      <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden />

      {/* backlight that blooms behind the name */}
      <motion.div className="pointer-events-none absolute left-1/2 top-1/2 h-[55vh] w-[90vw] -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0, scale: 0.85 }} animate={has("name") ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }} transition={{ duration: 2.4, ease: film }}
        style={{ background: "radial-gradient(closest-side, rgba(255,236,220,0.07), rgba(120,130,255,0.04) 55%, transparent 80%)" }} />

      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(85% 75% at 50% 50%, transparent 55%, rgba(0,0,0,0.75) 100%)" }} />

      {/* title block */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
        <h1 aria-label="Hari Krishna" className="relative select-none font-serif text-[#f6f2ec]" style={{ fontSize: mobile ? "clamp(2.6rem, 14vw, 4.2rem)" : "clamp(3rem, 9.4vw, 9.2rem)", lineHeight: 1, letterSpacing: "0.035em" }}>
          <span aria-hidden className="relative inline-block whitespace-nowrap">
            {NAME.split("").map((ch, i) => {
              const mid = (NAME.length - 1) / 2;
              return (
                <motion.span
                  key={i}
                  className="inline-block will-change-transform"
                  initial={{ opacity: 0, x: `${(i - mid) * 0.13}em`, y: "0.12em", filter: `blur(${mobile ? 6 : 12}px)`, scale: 1.05 }}
                  animate={has("name") ? { opacity: 1, x: "0em", y: "0em", filter: "blur(0px)", scale: 1, transitionEnd: { filter: "none" } } : undefined}
                  transition={{ duration: 1.7, delay: Math.abs(i - mid) * 0.05, ease: film }}
                  style={{ textShadow: "0 0 42px rgba(255,255,255,0.08)" }}
                >
                  {ch === " " ? "\u00A0" : ch}
                </motion.span>
              );
            })}
            {/* cinematic light pass: a highlight clipped to the letters, travelling once across */}
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0 whitespace-nowrap"
              initial={{ backgroundPosition: "130% 0", opacity: 0 }}
              animate={has("sweep") ? { backgroundPosition: "-40% 0", opacity: [0, 1, 1, 0] } : undefined}
              transition={{ duration: 1.6, ease: [0.45, 0, 0.2, 1] }}
              style={{
                backgroundImage: "linear-gradient(100deg, transparent 38%, rgba(255,250,242,0.0) 42%, rgba(255,250,242,0.95) 50%, rgba(255,214,200,0.0) 58%, transparent 62%)",
                backgroundSize: "260% 100%",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {NAME}
            </motion.span>
          </span>
        </h1>

        <motion.div
          className="mt-6 flex items-center gap-4 sm:mt-8 sm:gap-6"
          initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
          animate={has("title") ? { opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } } : undefined}
          transition={{ duration: 1.2, ease: film }}
        >
          <motion.span className="h-px w-10 origin-right bg-gradient-to-l from-coral/80 to-transparent sm:w-20" initial={{ scaleX: 0 }} animate={has("title") ? { scaleX: 1 } : undefined} transition={{ duration: 1.4, delay: 0.2, ease: film }} />
          <span className="font-sans text-[13px] font-medium uppercase tracking-[0.55em] text-white/85 sm:text-[17px] sm:tracking-[0.62em]">AI&nbsp;Engineer</span>
          <motion.span className="h-px w-10 origin-left bg-gradient-to-r from-coral/80 to-transparent sm:w-20" initial={{ scaleX: 0 }} animate={has("title") ? { scaleX: 1 } : undefined} transition={{ duration: 1.4, delay: 0.2, ease: film }} />
        </motion.div>
        <motion.p
          className="mt-4 font-mono text-[10px] uppercase tracking-[0.42em] text-white/40 sm:text-[11px]"
          initial={{ opacity: 0, y: 8 }}
          animate={has("title") ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 1.1, delay: 0.45, ease: film }}
        >
          Gen AI · Agents · Automation
        </motion.p>
      </div>

      {/* film letterbox */}
      <motion.div className="absolute inset-x-0 top-0 h-[7vh] bg-black" initial={{ y: 0 }} animate={exiting ? { y: "-100%" } : { y: 0 }} transition={{ duration: 1.4, ease: film }} />
      <motion.div className="absolute inset-x-0 bottom-0 h-[7vh] bg-black" initial={{ y: 0 }} animate={exiting ? { y: "100%" } : { y: 0 }} transition={{ duration: 1.4, ease: film }} />

      {/* progress hairline */}
      <motion.div className="absolute bottom-[7vh] left-0 h-px origin-left bg-gradient-to-r from-transparent via-coral/70 to-coral/0"
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: CUE_AT.exit, ease: "linear" }} style={{ width: "100%" }} />

      {/* controls */}
      <AnimatePresence>
        {!exiting && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 1.2, duration: 0.8 }}
            className="absolute inset-x-0 bottom-[7vh] flex items-center justify-end px-5 pb-4 sm:px-8">
            <button data-intro-skip onClick={skip} className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/45 transition hover:text-white/85">
              Skip intro →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

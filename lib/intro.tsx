"use client";

import { MotionConfig } from "framer-motion";
import { createContext, useCallback, useContext, useLayoutEffect, useState, type ReactNode } from "react";

export const SEEN_KEY = "hk-intro-seen"; // sessionStorage: intro plays once per browser session
export const SOUND_KEY = "hk-sound"; // localStorage: "on" | "off" (default on)

type Intro = {
  /** The cinematic intro overlay is running. */
  playing: boolean;
  /** The portfolio UI may emerge (set near the end of the intro, or immediately when skipped). */
  entered: boolean;
  setEntered: (v: boolean) => void;
  finish: () => void;
  replay: () => void;
  sound: boolean;
  setSound: (v: boolean) => void;
  /** Bumps on every replay so the intro remounts from zero. */
  run: number;
};

const Ctx = createContext<Intro>({
  playing: false, entered: true, setEntered: () => {}, finish: () => {}, replay: () => {}, sound: true, setSound: () => {}, run: 0,
});

function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

export function IntroProvider({ children }: { children: ReactNode }) {
  const [playing, setPlaying] = useState(true);
  const [entered, setEntered] = useState(false);
  const [sound, setSoundState] = useState(true);
  const [run, setRun] = useState(0);

  // Decide before paint: returning visitors in this session and reduced-motion users skip straight in.
  useLayoutEffect(() => {
    safe(() => localStorage.removeItem(SOUND_KEY), undefined); // sound is always on now; forget old "off" choices
    const seen = safe(() => sessionStorage.getItem(SEEN_KEY), null) === "1";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduce) {
      setPlaying(false);
      setEntered(true);
    }
  }, []);

  const finish = useCallback(() => {
    safe(() => sessionStorage.setItem(SEEN_KEY, "1"), undefined);
    document.documentElement.classList.add("intro-seen");
    setPlaying(false);
    setEntered(true);
  }, []);

  const replay = useCallback(() => {
    safe(() => sessionStorage.removeItem(SEEN_KEY), undefined);
    document.documentElement.classList.remove("intro-seen");
    window.scrollTo({ top: 0 });
    setEntered(false);
    setRun((r) => r + 1);
    setPlaying(true);
  }, []);

  const setSound = useCallback((v: boolean) => {
    safe(() => localStorage.setItem(SOUND_KEY, v ? "on" : "off"), undefined);
    setSoundState(v);
  }, []);

  return (
    <Ctx.Provider value={{ playing, entered, setEntered, finish, replay, sound, setSound, run }}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </Ctx.Provider>
  );
}

export const useIntro = () => useContext(Ctx);

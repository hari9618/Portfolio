"use client";

import { RotateCcw } from "lucide-react";
import { useIntro } from "@/lib/intro";

/** Footer control: replay the cinematic intro (the click itself unlocks audio, so the replay has sound). */
export function IntroControls() {
  const { replay } = useIntro();
  return (
    <button
      onClick={replay}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-white/55 transition hover:border-white/30 hover:text-white"
    >
      <RotateCcw className="h-3.5 w-3.5" /> Replay intro
    </button>
  );
}

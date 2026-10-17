import { marqueeRows, T } from "@/lib/tools";
import { ToolChip } from "./ToolChip";

const mask = "linear-gradient(to right, transparent, black 10%, black 90%, transparent)";

/** Two counter-scrolling rows of brand chips inside a glass pill, after the reference's stack strip. */
export function Marquee() {
  return (
    <section className="relative overflow-hidden bg-bg py-16">
      <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
        Drops into the stack you already run
      </p>
      <div className="mt-8 space-y-3">
        {marqueeRows.map((row, r) => (
          <div
            key={r}
            className="relative mx-auto max-w-6xl overflow-hidden rounded-full border border-white/[0.07] bg-white/[0.015] py-3 backdrop-blur"
            style={{ maskImage: mask, WebkitMaskImage: mask, boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.05)" }}
          >
            <div
              className="flex w-max items-center gap-3 px-3 hover:[animation-play-state:paused]"
              style={{ animation: `marquee ${r ? 70 : 60}s linear infinite${r ? " reverse" : ""}` }}
            >
              {[...row, ...row].map((id, i) => (
                <ToolChip key={`${id}-${i}`} tool={T[id]} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

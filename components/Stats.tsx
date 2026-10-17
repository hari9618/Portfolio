"use client";

import { animate, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { stats } from "@/lib/content";

function Count({ to, decimals = 0 }: { to: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 2, ease: [0.22, 1, 0.36, 1], onUpdate: setV });
    return () => c.stop();
  }, [inView, to]);
  return <span ref={ref}>{v.toFixed(decimals)}</span>;
}

export function Stats() {
  return (
    <section className="relative border-y border-white/[0.06] py-16">
      <div className="page grid grid-cols-2 gap-y-10 md:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="px-2 text-center md:border-l md:border-white/[0.06] md:first:border-l-0">
            <div className="serif-i text-[2.8rem] leading-none text-white sm:text-[3.4rem]">
              {s.prefix}
              <Count to={s.value} decimals={s.decimals} />
              {s.suffix}
            </div>
            <div className="mx-auto mt-3 max-w-[160px] font-mono text-[10.5px] uppercase leading-snug tracking-[0.14em] text-white/45">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

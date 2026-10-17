"use client";

import { useState } from "react";
import { Reveal } from "./Reveal";

function Slider({
  label, value, set, min, max, step = 1, fmt,
}: {
  label: string; value: number; set: (v: number) => void; min: number; max: number; step?: number; fmt: (v: number) => string;
}) {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <label className="block">
      <div className="mb-3 flex items-baseline justify-between text-[14px]">
        <span className="text-white/70">{label}</span>
        <span className="font-mono text-white">{fmt(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => set(Number(e.target.value))}
        style={{ ["--fill" as string]: `${fill}%` }}
      />
    </label>
  );
}

export function QuickMath() {
  const [hours, setHours] = useState(10);
  const [people, setPeople] = useState(3);
  const [rate, setRate] = useState(25);
  const [share, setShare] = useState(60);

  const monthlyHours = Math.round(hours * people * 4.33 * (share / 100));
  const yearly = Math.round(monthlyHours * 12 * rate);

  return (
    <section className="relative py-24 sm:py-32">
      <div className="page">
        <div className="card grid overflow-hidden lg:grid-cols-2">
          <div className="p-8 sm:p-12">
            <Reveal>
              <p className="eyebrow mb-4">Quick math</p>
              <h2 className="h-display text-[2.2rem] sm:text-5xl">
                What could an agent <span className="serif-i text-coral">give back?</span>
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">
                Drag the sliders for one repetitive workflow your team runs today. The estimate is deliberately conservative.
                We&apos;d confirm the real number in the audit.
              </p>
            </Reveal>
            <div className="mt-10 space-y-8">
              <Slider label="Hours per person, per week" value={hours} set={setHours} min={1} max={40} fmt={(v) => `${v} h`} />
              <Slider label="People doing it" value={people} set={setPeople} min={1} max={25} fmt={(v) => `${v}`} />
              <Slider label="Loaded hourly cost" value={rate} set={setRate} min={5} max={120} fmt={(v) => `$${v}`} />
              <Slider label="Share an agent can automate" value={share} set={setShare} min={20} max={90} step={5} fmt={(v) => `${v}%`} />
            </div>
          </div>
          <div className="relative flex flex-col justify-center border-t border-white/[0.06] bg-[radial-gradient(80%_80%_at_70%_30%,rgba(255,92,92,0.16),transparent_70%)] p-8 sm:p-12 lg:border-l lg:border-t-0">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">Hours back every month</div>
            <div className="serif-i mt-2 text-[4.5rem] leading-none sm:text-[6rem]">{monthlyHours.toLocaleString()}</div>
            <div className="mt-10 font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">Cost returned per year</div>
            <div className="serif-i mt-2 text-[3.2rem] leading-none text-coral sm:text-[4.2rem]">${yearly.toLocaleString()}</div>
            <p className="mt-8 max-w-sm text-[13px] leading-relaxed text-white/45">
              Hours × people × 4.33 weeks × automation share. It leaves out the quality gains: fewer errors, faster responses and
              happier operators.
            </p>
            <a href="#contact" className="btn-primary mt-8 w-fit">Let&apos;s find your workflow</a>
          </div>
        </div>
      </div>
    </section>
  );
}

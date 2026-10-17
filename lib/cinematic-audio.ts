// Intro score, synthesized live with the Web Audio API in the spirit of the classic cinema logo openers:
// a murmuring cloud of voices wanders, converges in one long glide onto a huge D-major chord spread over six
// octaves (timed to HARI KRISHNA), swells, holds under the hero and decays over ~19 s.
// Browsers only start audio after a user gesture, so callers start it from a gesture and pass the current
// timeline position as `offset`: anything already in the past is skipped and continuous layers pick up mid-way.
// To use a recorded score later, set INTRO_SCORE_URL to a file in /public and it will be played instead.

export const INTRO_SCORE_URL: string | null = null;

/** Timeline marks shared with the visuals (components/intro). Seconds. */
export const CUE = {
  hops: [2.88, 3.1, 3.32, 3.54, 3.76, 3.98], // agent pipeline activations
  converge: [3.7, 4.0, 4.25, 4.45],
  glide: 2.6, // the voice cloud starts converging
  impact: 4.65, // HARI KRISHNA
  accent: 5.7, // AI ENGINEER
  sweep: 6.25, // light pass
  peak: 7.4, // chord at full brightness, portfolio emerging
  hold: 12, // chord starts to decay
  end: 19,
};

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let fileEl: HTMLAudioElement | null = null;
let live: AudioScheduledSourceNode[] = [];

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function impulse(c: BaseAudioContext, seconds: number, decay: number) {
  const len = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}

function noiseBuffer(c: BaseAudioContext, seconds: number, brown = false) {
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * seconds), c.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.5;
    } else d[i] = w;
  }
  return buf;
}

/**
 * Schedule the score on any context. `t0` is the context time for timeline zero; `offset` is the timeline
 * position to start from. Returns the started sources so they can be stopped early.
 */
export function scheduleScore(c: BaseAudioContext, out: AudioNode, t0: number, offset = 0, intensity = 1) {
  const src: AudioScheduledSourceNode[] = [];
  const at = (s: number) => t0 + Math.max(0, s - offset);
  const future = (s: number) => s >= offset - 0.05;
  const small = intensity < 1; // phones: fewer voices
  const R = rng(4651);

  /** Exponential envelope through timeline points; starts from the value at `offset`. */
  const env = (g: AudioParam, points: [number, number][]) => {
    let startV = 0.0001;
    for (let i = 0; i < points.length - 1; i++) {
      const [s0, v0] = points[i], [s1, v1] = points[i + 1];
      if (offset >= s0 && offset < s1) startV = v0 * Math.pow(v1 / v0, (offset - s0) / (s1 - s0));
    }
    if (offset >= points[points.length - 1][0]) startV = 0.0001;
    g.setValueAtTime(Math.max(0.0001, startV * intensity), at(offset));
    for (const [s, v] of points) if (s > offset) g.exponentialRampToValueAtTime(Math.max(0.0001, v * intensity), at(s));
  };

  const bus = c.createGain();
  bus.connect(out);
  const verb = c.createConvolver();
  verb.buffer = impulse(c, 6.5, 2.2);
  const wet = c.createGain();
  wet.gain.value = 0.5;
  verb.connect(wet).connect(bus);

  // ---- 1. Sub foundation: rumble that swells into the hit, then a D1 drone under the chord ----
  {
    const g = c.createGain();
    env(g.gain, [[0.2, 0.0001], [2.4, 0.3], [4.6, 0.45], [7.4, 0.32], [CUE.hold, 0.26], [CUE.end, 0.0001]]);
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 180;
    lp.connect(g).connect(bus);
    for (const [f, a] of [[36.71, 0.55], [55, 0.22], [73.42, 0.12]] as const) {
      const o = c.createOscillator();
      o.frequency.value = f;
      const og = c.createGain();
      og.gain.value = a;
      o.connect(og).connect(lp);
      o.start(at(offset));
      o.stop(at(CUE.end));
      src.push(o);
    }
    const n = c.createBufferSource();
    n.buffer = noiseBuffer(c, CUE.end, true);
    const ng = c.createGain();
    ng.gain.value = 0.7;
    n.connect(ng).connect(lp);
    n.start(at(offset), Math.min(offset, CUE.end - 1));
    n.stop(at(CUE.end));
    src.push(n);
  }

  // ---- 2. The voice cloud: random wandering pitches that glide onto a six-octave D major chord ----
  {
    const targets = [36.71, 73.42, 110, 146.83, 185, 220, 293.66, 369.99, 440, 587.33, 739.99, 880, 1174.66, 1479.98];
    const voices = small ? 18 : 30;
    const cloud = c.createGain();
    env(cloud.gain, [[0.4, 0.0001], [2.6, 0.25], [4.65, 0.62], [CUE.peak, 1], [CUE.hold, 0.85], [CUE.end, 0.0001]]);
    const bright = c.createBiquadFilter(); // dark murmur that opens up to a bright, glorious chord
    bright.type = "lowpass";
    bright.Q.value = 0.5;
    bright.frequency.setValueAtTime(offset < 4.65 ? 700 : 5200, at(offset));
    if (future(4.65)) bright.frequency.exponentialRampToValueAtTime(2600, at(4.65));
    if (future(CUE.peak)) bright.frequency.exponentialRampToValueAtTime(7000, at(CUE.peak));
    bright.frequency.exponentialRampToValueAtTime(1400, at(CUE.end));
    bright.connect(cloud);
    cloud.connect(bus);
    cloud.connect(verb);

    for (let i = 0; i < voices; i++) {
      const target = targets[i % targets.length] * Math.pow(2, ((R() - 0.5) * 10) / 1200); // a few cents of chorus
      const start = 180 + R() * 240;
      const o = c.createOscillator();
      o.type = "sawtooth";
      const f = o.frequency;
      if (offset < CUE.glide) {
        f.setValueAtTime(start, at(offset));
        for (let k = 1; k <= 3; k++) {
          const s = offset + ((CUE.glide - offset) * k) / 4;
          f.exponentialRampToValueAtTime(start * (0.8 + R() * 0.45), at(s)); // wander
        }
        f.exponentialRampToValueAtTime(start * (0.9 + R() * 0.2), at(CUE.glide));
      } else if (offset < CUE.impact) {
        f.setValueAtTime(start + (target - start) * ((offset - CUE.glide) / (CUE.impact - CUE.glide)), at(offset));
      } else f.setValueAtTime(target, at(offset));
      if (offset < CUE.impact) f.exponentialRampToValueAtTime(target, at(CUE.impact + 0.25)); // the convergence
      // high voices sit lower in the mix, low ones carry the weight
      const vg = c.createGain();
      vg.gain.value = (target < 120 ? 0.075 : target < 400 ? 0.055 : 0.032) * (small ? 1.25 : 1);
      const pan = c.createStereoPanner();
      pan.pan.value = (i % 2 ? 1 : -1) * (0.15 + R() * 0.75);
      o.connect(vg).connect(pan).connect(bright);
      o.start(at(offset));
      o.stop(at(CUE.end));
      src.push(o);
    }
  }

  const tone = (s: number, f: number, gain: number, len: number, type: OscillatorType = "sine", toVerb = true) => {
    if (!future(s)) return;
    const o = c.createOscillator();
    o.type = type;
    o.frequency.value = f;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, at(s));
    g.gain.exponentialRampToValueAtTime(gain * intensity, at(s) + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, at(s) + len);
    o.connect(g);
    g.connect(bus);
    if (toVerb) g.connect(verb);
    o.start(at(s));
    o.stop(at(s) + len + 0.05);
    src.push(o);
  };

  // ---- 3. Neural activations: one quiet ping per agent hop (kept from the visual sync) ----
  [587.33, 698.46, 880, 1046.5, 1174.66, 1396.91].forEach((f, i) => tone(CUE.hops[i], f, 0.035, 0.7));

  // ---- 4. Convergence pulses: sub thumps as signals reach the core ----
  CUE.converge.forEach((s, i) => {
    if (!future(s)) return;
    const o = c.createOscillator();
    o.frequency.setValueAtTime(70, at(s));
    o.frequency.exponentialRampToValueAtTime(40, at(s) + 0.3);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, at(s));
    g.gain.exponentialRampToValueAtTime((0.25 + i * 0.08) * intensity, at(s) + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, at(s) + 0.4);
    o.connect(g).connect(bus);
    o.start(at(s));
    o.stop(at(s) + 0.45);
    src.push(o);
  });

  // ---- 5. Whoosh riser into the hit: band sweep plus a reverse-cymbal swell ----
  if (offset < CUE.impact) {
    const from = Math.max(offset, 2.9);
    for (const [type, f0, f1, peak] of [["bandpass", 260, 6400, 0.32], ["highpass", 3000, 9000, 0.12]] as const) {
      const n = c.createBufferSource();
      n.buffer = noiseBuffer(c, 2.2);
      const flt = c.createBiquadFilter();
      flt.type = type;
      flt.Q.value = type === "bandpass" ? 4 : 0.7;
      flt.frequency.setValueAtTime(f0, at(from));
      flt.frequency.exponentialRampToValueAtTime(f1, at(CUE.impact));
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, at(from));
      g.gain.exponentialRampToValueAtTime(peak * intensity, at(CUE.impact - 0.03));
      g.gain.exponentialRampToValueAtTime(0.0001, at(CUE.impact + 0.08));
      const pan = c.createStereoPanner();
      pan.pan.setValueAtTime(-0.6, at(from));
      pan.pan.linearRampToValueAtTime(0.6, at(CUE.impact));
      n.connect(flt).connect(g).connect(pan);
      pan.connect(bus);
      pan.connect(verb);
      n.start(at(from));
      n.stop(at(CUE.impact + 0.12));
      src.push(n);
    }
  }

  // ---- 6. IMPACT on the name: sub drop, body boom, cymbal crash, long bloom ----
  if (future(CUE.impact)) {
    const s = CUE.impact;
    const sub = c.createOscillator();
    sub.frequency.setValueAtTime(90, at(s));
    sub.frequency.exponentialRampToValueAtTime(28, at(s) + 3);
    const sg = c.createGain();
    sg.gain.setValueAtTime(0.0001, at(s));
    sg.gain.exponentialRampToValueAtTime(1.3 * intensity, at(s) + 0.012);
    sg.gain.exponentialRampToValueAtTime(0.0001, at(s) + 4);
    sub.connect(sg).connect(bus);
    sub.start(at(s));
    sub.stop(at(s) + 4.1);
    src.push(sub);

    tone(s, 55, 0.6, 2.2, "triangle"); // body
    tone(s + 0.01, 110, 0.18, 3.2, "triangle");

    const crash = c.createBufferSource();
    crash.buffer = noiseBuffer(c, 3.5);
    const hp = c.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 4200;
    const cg = c.createGain();
    cg.gain.setValueAtTime(0.22 * intensity, at(s));
    cg.gain.exponentialRampToValueAtTime(0.0001, at(s) + 3.2);
    crash.connect(hp).connect(cg);
    cg.connect(bus);
    cg.connect(verb);
    crash.start(at(s));
    src.push(crash);

    const thump = c.createBufferSource();
    thump.buffer = noiseBuffer(c, 0.8);
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 700;
    const tg = c.createGain();
    tg.gain.setValueAtTime(0.7 * intensity, at(s));
    tg.gain.exponentialRampToValueAtTime(0.0001, at(s) + 0.7);
    thump.connect(lp).connect(tg);
    tg.connect(bus);
    tg.connect(verb);
    thump.start(at(s));
    src.push(thump);
  }

  // ---- 7. AI ENGINEER: FM bell accent and its octave ----
  if (future(CUE.accent)) {
    const s = CUE.accent;
    const car = c.createOscillator();
    car.frequency.value = 1174.66;
    const mod = c.createOscillator();
    mod.frequency.value = 1174.66 * 1.4;
    const idx = c.createGain();
    idx.gain.setValueAtTime(700, at(s));
    idx.gain.exponentialRampToValueAtTime(1, at(s) + 2.4);
    mod.connect(idx).connect(car.frequency);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, at(s));
    g.gain.exponentialRampToValueAtTime(0.09 * intensity, at(s) + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, at(s) + 4);
    car.connect(g);
    g.connect(verb);
    g.connect(bus);
    car.start(at(s));
    mod.start(at(s));
    car.stop(at(s) + 4.1);
    mod.stop(at(s) + 4.1);
    src.push(car, mod);
  }

  // ---- 8. Light pass: a wide stereo air sweep, left to right ----
  if (future(CUE.sweep)) {
    const n = c.createBufferSource();
    n.buffer = noiseBuffer(c, 2);
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 1.2;
    bp.frequency.setValueAtTime(2500, at(CUE.sweep));
    bp.frequency.exponentialRampToValueAtTime(9000, at(CUE.sweep) + 1.6);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, at(CUE.sweep));
    g.gain.exponentialRampToValueAtTime(0.09 * intensity, at(CUE.sweep) + 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, at(CUE.sweep) + 1.8);
    const pan = c.createStereoPanner();
    pan.pan.setValueAtTime(-0.9, at(CUE.sweep));
    pan.pan.linearRampToValueAtTime(0.9, at(CUE.sweep) + 1.6);
    n.connect(bp).connect(g).connect(pan).connect(verb);
    n.start(at(CUE.sweep));
    src.push(n);
  }

  // ---- 9. Shimmer as the portfolio appears: soft high chord tones blooming in the reverb ----
  [[7.3, 1174.66], [7.55, 1479.98], [7.8, 1760], [8.1, 2349.32]].forEach(([s, f]) => tone(s, f, 0.022, 5));

  return src;
}

function context() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.9;
    // glue + safety limiter: loud and full, never clipping
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.knee.value = 8;
    comp.ratio.value = 5;
    comp.attack.value = 0.004;
    comp.release.value = 0.25;
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -2;
    limiter.knee.value = 0;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.001;
    limiter.release.value = 0.1;
    master.connect(comp).connect(limiter).connect(ctx.destination);
  }
  return ctx;
}

/** True when the browser will let us make sound right now (no gesture needed). */
export async function audioAllowed() {
  const c = context();
  if (!c) return false;
  if (c.state === "running") return true;
  try {
    await Promise.race([c.resume(), new Promise((r) => setTimeout(r, 150))]);
  } catch {
    /* blocked */
  }
  return (c.state as AudioContextState) === "running"; // state may have changed during the await
}

/** Start the intro score from timeline position `offset` (call from a user gesture when possible). */
export function playIntroScore(offset = 0, intensity = 1) {
  disarmLateStart();
  stopIntroScore(0);
  if (INTRO_SCORE_URL) {
    fileEl = new Audio(INTRO_SCORE_URL);
    fileEl.currentTime = offset;
    fileEl.volume = Math.min(1, intensity);
    fileEl.play().catch(() => {});
    return;
  }
  const c = context();
  if (!c || !master) return;
  c.resume();
  master.gain.cancelScheduledValues(c.currentTime);
  master.gain.setValueAtTime(0.9, c.currentTime);
  live = scheduleScore(c, master, c.currentTime + 0.03, offset, intensity);
}

/** Fade out and stop whatever is playing. */
export function stopIntroScore(fade = 0.6) {
  if (fileEl) {
    const el = fileEl;
    fileEl = null;
    el.pause();
  }
  if (!ctx || !master || !live.length) return;
  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(master.gain.value, now);
  master.gain.linearRampToValueAtTime(0.0001, now + Math.max(0.01, fade));
  const old = live;
  live = [];
  setTimeout(() => old.forEach((s) => { try { s.stop(); } catch { /* already stopped */ } }), fade * 1000 + 50);
}

// If the visitor never clicked during the intro (so the browser kept it silent), their first click or tap on
// the hero plays the big moment: the impact and the chord. Clicks further down the page never trigger it.
const LATE = ["pointerdown", "pointerup", "touchend", "keydown"] as const;
let lateHandler: (() => void) | null = null;

export function armLateStart() {
  if (lateHandler || typeof window === "undefined") return;
  lateHandler = () => {
    const onHero = window.scrollY < window.innerHeight * 0.8;
    disarmLateStart();
    if (onHero) playIntroScore(CUE.impact - 0.15, window.innerWidth < 768 ? 0.75 : 0.9);
  };
  LATE.forEach((e) => window.addEventListener(e, lateHandler!, { passive: true }));
}

function disarmLateStart() {
  if (!lateHandler) return;
  LATE.forEach((e) => window.removeEventListener(e, lateHandler!));
  lateHandler = null;
}

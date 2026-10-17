// Intro sound effects (no music), synthesized with the Web Audio API and synced to the visuals:
// soft air as the universe appears, a quiet tick for each agent that activates, a short whoosh, one clean
// low hit on HARI KRISHNA, a small chime on AI ENGINEER and an airy shimmer for the light pass. ~7 s, subtle.
// Browsers only start audio after a user gesture, so callers start it from a gesture and pass the current
// timeline position as `offset`: effects already in the past are skipped.

/** Timeline marks shared with the visuals (components/intro). Seconds. */
export const CUE = {
  hops: [2.88, 3.1, 3.32, 3.54, 3.76, 3.98], // agent pipeline activations
  converge: [3.7, 4.0, 4.25, 4.45],
  impact: 4.65, // HARI KRISHNA
  accent: 5.6, // AI ENGINEER
  sweep: 6.3, // light pass
  end: 8,
};

const LEVEL = 0.55; // overall loudness: present, never loud

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let live: AudioScheduledSourceNode[] = [];

function noiseBuffer(c: BaseAudioContext, seconds: number) {
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * seconds), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

function impulse(c: BaseAudioContext, seconds: number) {
  const len = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.5);
  }
  return buf;
}

export function scheduleScore(c: BaseAudioContext, out: AudioNode, t0: number, offset = 0, intensity = 1) {
  const src: AudioScheduledSourceNode[] = [];
  const at = (s: number) => t0 + Math.max(0, s - offset);
  const future = (s: number) => s >= offset - 0.05;

  const bus = c.createGain();
  bus.gain.value = LEVEL * intensity;
  bus.connect(out);
  const room = c.createConvolver(); // short, small space: a touch of depth, no hall
  room.buffer = impulse(c, 1.2);
  const roomGain = c.createGain();
  roomGain.gain.value = 0.18;
  room.connect(roomGain).connect(bus);

  /** Filtered noise with an attack/decay envelope, optionally sweeping its filter and pan. */
  const air = (s: number, len: number, peakAt: number, gain: number, type: BiquadFilterType, f0: number, f1: number, pan0 = 0, pan1 = 0) => {
    if (!future(s + len)) return;
    const st = Math.max(s, offset);
    const n = c.createBufferSource();
    n.buffer = noiseBuffer(c, len + 0.1);
    const f = c.createBiquadFilter();
    f.type = type;
    f.Q.value = type === "bandpass" ? 1.2 : 0.7;
    f.frequency.setValueAtTime(f0, at(s));
    f.frequency.exponentialRampToValueAtTime(f1, at(s + len));
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, at(st));
    if (s + peakAt > st) g.gain.exponentialRampToValueAtTime(gain, at(s + peakAt));
    g.gain.exponentialRampToValueAtTime(0.0001, at(s + len));
    const p = c.createStereoPanner();
    p.pan.setValueAtTime(pan0, at(s));
    p.pan.linearRampToValueAtTime(pan1, at(s + len));
    n.connect(f).connect(g).connect(p);
    p.connect(bus);
    p.connect(room);
    n.start(at(st));
    n.stop(at(s + len) + 0.05);
    src.push(n);
  };

  /** A short sine/triangle tone with a fast attack and natural decay. */
  const ping = (s: number, f: number, gain: number, len: number, type: OscillatorType = "sine", pan = 0) => {
    if (!future(s)) return;
    const o = c.createOscillator();
    o.type = type;
    o.frequency.value = f;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, at(s));
    g.gain.exponentialRampToValueAtTime(gain, at(s) + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, at(s) + len);
    const p = c.createStereoPanner();
    p.pan.value = pan;
    o.connect(g).connect(p);
    p.connect(bus);
    p.connect(room);
    o.start(at(s));
    o.stop(at(s) + len + 0.05);
    src.push(o);
  };

  // 1. The universe appears: a soft band of air that slowly opens up (0.8 -> 4.6 s).
  air(0.8, 3.9, 3.2, 0.08, "bandpass", 300, 1400, -0.3, 0.3);

  // 2. Agents activate: one quiet tick per pipeline hop, panned across the stereo field.
  [880, 987.77, 1108.73, 1174.66, 1318.51, 1479.98].forEach((f, i) => ping(CUE.hops[i], f, 0.06, 0.25, "sine", -0.6 + i * 0.24));

  // 3. Signals converge: a short, smooth whoosh into the name.
  air(3.95, 0.75, 0.68, 0.24, "lowpass", 700, 7000, -0.5, 0.5);

  // 4. HARI KRISHNA: one clean low hit (no crash, no boom tail).
  if (future(CUE.impact)) {
    const s = CUE.impact;
    const o = c.createOscillator();
    o.frequency.setValueAtTime(82, at(s));
    o.frequency.exponentialRampToValueAtTime(42, at(s) + 0.6);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, at(s));
    g.gain.exponentialRampToValueAtTime(0.85, at(s) + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, at(s) + 1.1);
    o.connect(g).connect(bus);
    o.start(at(s));
    o.stop(at(s) + 1.15);
    src.push(o);
    air(s, 0.35, 0.005, 0.22, "lowpass", 1200, 300); // soft body
    ping(s + 0.01, 293.66, 0.05, 1.4, "triangle"); // a low D so the hit has a tone, not just a thud
  }

  // 5. AI ENGINEER: a small two-note chime.
  ping(CUE.accent, 1174.66, 0.05, 1.1, "sine", -0.15);
  ping(CUE.accent + 0.09, 1760, 0.03, 1.0, "sine", 0.15);

  // 6. Light pass: an airy shimmer travelling left to right across the name.
  air(CUE.sweep, 1.2, 0.5, 0.045, "highpass", 5000, 9000, -0.8, 0.8);

  return src;
}

function context() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 1;
    const limiter = ctx.createDynamicsCompressor(); // safety only
    limiter.threshold.value = -6;
    limiter.knee.value = 0;
    limiter.ratio.value = 12;
    limiter.attack.value = 0.002;
    limiter.release.value = 0.15;
    master.connect(limiter).connect(ctx.destination);
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

/** Start the intro sound effects from timeline position `offset` (call from a user gesture when possible). */
export function playIntroScore(offset = 0, intensity = 1) {
  stopIntroScore(0);
  const c = context();
  if (!c || !master) return;
  c.resume();
  master.gain.cancelScheduledValues(c.currentTime);
  master.gain.setValueAtTime(1, c.currentTime);
  live = scheduleScore(c, master, c.currentTime + 0.03, offset, intensity);
}

/** Fade out and stop whatever is playing. */
export function stopIntroScore(fade = 0.4) {
  if (!ctx || !master || !live.length) return;
  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(master.gain.value, now);
  master.gain.linearRampToValueAtTime(0.0001, now + Math.max(0.01, fade));
  const old = live;
  live = [];
  setTimeout(() => old.forEach((s) => { try { s.stop(); } catch { /* already stopped */ } }), fade * 1000 + 50);
}

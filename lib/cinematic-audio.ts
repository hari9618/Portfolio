// Intro sonic logo, synthesized with the Web Audio API and synced to the visuals. Modelled on how the best
// brand intros work (Netflix, YouTube, HBO): one short signature with a two-part arc in a single key and
// sound family, not a stack of unrelated effects.
//   stars      near silence, a faint air bed
//   agents     soft plucks climbing a D-major pentatonic, one per activated agent: the motif builds
//   converge   a reverse swell that "breathes in" exactly to the name
//   NAME       a soft low hit that blooms into a warm D chord and rings out (~3 s)
//   TITLE      a bright two-note bell payoff (A -> D, a rising fourth)
// Browsers only start audio after a user gesture, so callers start it from a gesture and pass the current
// timeline position as `offset`: sounds already in the past are skipped.

/** Timeline marks shared with the visuals (components/intro). Seconds. */
export const CUE = {
  hops: [2.88, 3.1, 3.32, 3.54, 3.76, 3.98], // agent pipeline activations
  converge: [3.7, 4.0, 4.25, 4.45],
  impact: 4.65, // HARI KRISHNA
  accent: 5.6, // AI ENGINEER
  sweep: 6.3, // light pass
  end: 8,
};

const LEVEL = 0.6; // overall loudness: present, never loud

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
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
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
  const room = c.createConvolver(); // a soft, medium space so the bloom has somewhere to ring
  room.buffer = impulse(c, 2.2);
  const roomGain = c.createGain();
  roomGain.gain.value = 0.28;
  room.connect(roomGain).connect(bus);

  const send = (n: AudioNode, wet = true) => {
    n.connect(bus);
    if (wet) n.connect(room);
  };

  /** Filtered noise with an attack/decay envelope, optionally sweeping its filter and pan. */
  const air = (s: number, len: number, peakAt: number, gain: number, type: BiquadFilterType, f0: number, f1: number, pan0 = 0, pan1 = 0, cut = false) => {
    if (!future(s + len)) return;
    const st = Math.max(s, offset);
    const n = c.createBufferSource();
    n.buffer = noiseBuffer(c, len + 0.1);
    const f = c.createBiquadFilter();
    f.type = type;
    f.Q.value = type === "bandpass" ? 1.1 : 0.7;
    f.frequency.setValueAtTime(f0, at(s));
    f.frequency.exponentialRampToValueAtTime(f1, at(s + len));
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, at(st));
    if (s + peakAt > st) g.gain.exponentialRampToValueAtTime(gain, at(s + peakAt));
    if (cut) g.gain.linearRampToValueAtTime(0.0001, at(s + len)); // a swell that stops dead on the downbeat
    else g.gain.exponentialRampToValueAtTime(0.0001, at(s + len));
    const p = c.createStereoPanner();
    p.pan.setValueAtTime(pan0, at(s));
    p.pan.linearRampToValueAtTime(pan1, at(s + len));
    n.connect(f).connect(g).connect(p);
    send(p);
    n.start(at(st));
    n.stop(at(s + len) + 0.05);
    src.push(n);
  };

  /** A soft mallet pluck: triangle body plus a quiet octave, rounded off by a closing lowpass. */
  const pluck = (s: number, f: number, gain: number, pan: number) => {
    if (!future(s)) return;
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(3200, at(s));
    lp.frequency.exponentialRampToValueAtTime(700, at(s) + 0.4);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, at(s));
    g.gain.exponentialRampToValueAtTime(gain, at(s) + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, at(s) + 0.9);
    const p = c.createStereoPanner();
    p.pan.value = pan;
    lp.connect(g).connect(p);
    send(p);
    for (const [mult, type, lvl] of [[1, "triangle", 1], [2, "sine", 0.25]] as const) {
      const o = c.createOscillator();
      o.type = type;
      o.frequency.value = f * mult;
      const v = c.createGain();
      v.gain.value = lvl;
      o.connect(v).connect(lp);
      o.start(at(s));
      o.stop(at(s) + 0.95);
      src.push(o);
    }
  };

  /** A bell: a sine with inharmonic partials that die away first, so it sounds struck, not beeped. */
  const bell = (s: number, f: number, gain: number, len: number, pan: number) => {
    if (!future(s)) return;
    const p = c.createStereoPanner();
    p.pan.value = pan;
    send(p);
    for (const [ratio, lvl, decay] of [[1, 1, len], [2.76, 0.18, len * 0.35], [5.4, 0.06, len * 0.15]] as const) {
      const o = c.createOscillator();
      o.frequency.value = f * ratio;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, at(s));
      g.gain.exponentialRampToValueAtTime(gain * lvl, at(s) + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, at(s) + decay);
      o.connect(g).connect(p);
      o.start(at(s));
      o.stop(at(s) + decay + 0.05);
      src.push(o);
    }
  };

  // 1. Stars: a faint bed of air so the silence feels like space, not a dead page.
  air(0.6, 4.05, 3.4, 0.055, "bandpass", 220, 900, -0.3, 0.3);

  // 2. Agents activate: soft plucks climbing the motif's scale (D E F# A B D), panned left to right.
  [293.66, 329.63, 369.99, 440, 493.88, 587.33].forEach((f, i) => pluck(CUE.hops[i], f, 0.07, -0.55 + i * 0.22));

  // 3. Converge: a reverse swell that breathes in and stops exactly on the name.
  air(3.9, CUE.impact - 3.9, CUE.impact - 3.9 - 0.02, 0.32, "bandpass", 500, 5200, 0.4, 0, true);

  // 4. HARI KRISHNA, the signature: a soft low hit that blooms into a warm D chord and rings out.
  if (future(CUE.impact)) {
    const s = CUE.impact;
    const kick = c.createOscillator();
    kick.frequency.setValueAtTime(72, at(s));
    kick.frequency.exponentialRampToValueAtTime(40, at(s) + 0.5);
    const kg = c.createGain();
    kg.gain.setValueAtTime(0.0001, at(s));
    kg.gain.exponentialRampToValueAtTime(0.7, at(s) + 0.008);
    kg.gain.exponentialRampToValueAtTime(0.0001, at(s) + 0.9);
    kick.connect(kg);
    send(kg, false);
    kick.start(at(s));
    kick.stop(at(s) + 0.95);
    src.push(kick);
    air(s, 0.3, 0.004, 0.08, "lowpass", 1400, 250); // a little felt on the hit

    // the bloom: detuned saws behind a filter that opens on the hit, then slowly closes as it rings out
    const ring = 3.1;
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.Q.value = 0.6;
    lp.frequency.setValueAtTime(260, at(s));
    lp.frequency.exponentialRampToValueAtTime(2400, at(s) + 0.32);
    lp.frequency.exponentialRampToValueAtTime(420, at(s) + ring);
    const bloom = c.createGain();
    bloom.gain.setValueAtTime(0.0001, at(s));
    bloom.gain.exponentialRampToValueAtTime(1, at(s) + 0.06);
    bloom.gain.setTargetAtTime(0.0001, at(s) + 0.5, ring / 3.6);
    lp.connect(bloom);
    send(bloom);
    const chord: [number, number, number][] = [ // [Hz, level, pan]: D2 D3 A3 D4 F#4 E5
      [73.42, 0.05, 0], [146.83, 0.04, -0.2], [220, 0.03, 0.25], [293.66, 0.026, -0.35], [369.99, 0.02, 0.4], [659.25, 0.012, -0.1],
    ];
    for (const [f, lvl, pan] of chord) {
      const p = c.createStereoPanner();
      p.pan.value = pan;
      p.connect(lp);
      for (const cents of [-7, 7]) {
        const o = c.createOscillator();
        o.type = "sawtooth";
        o.frequency.value = f;
        o.detune.value = cents;
        const v = c.createGain();
        v.gain.value = lvl;
        o.connect(v).connect(p);
        o.start(at(s));
        o.stop(at(s) + ring + 0.3);
        src.push(o);
      }
    }
  }

  // 5. AI ENGINEER, the payoff: a bright rising fourth on a bell (A5 -> D6).
  bell(CUE.accent, 880, 0.07, 1.6, -0.15);
  bell(CUE.accent + 0.16, 1174.66, 0.075, 2, 0.15);

  // 6. Light pass: a faint airy shimmer travelling left to right across the name.
  air(CUE.sweep, 1.1, 0.45, 0.03, "highpass", 5000, 9000, -0.8, 0.8);

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

/** Start the intro sonic logo from timeline position `offset` (call from a user gesture when possible). */
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

// Intro music, synthesized live with the Web Audio API: a smooth, modern tech-launch track in D major at
// 136 BPM, locked to the intro's visual timeline. Warm pad -> soft arpeggio -> heartbeat kick as the agent
// pipeline fires -> the drop on HARI KRISHNA (clean bass, full chord, pumping groove, short melody) -> the
// groove carries the portfolio in and fades out by ~20 s. Close and polished: echo instead of a big hall.
// Browsers only start audio after a user gesture, so callers start it from a gesture and pass the current
// timeline position as `offset`: notes already in the past are skipped and held notes pick up mid-way.
// To use a recorded track later, set INTRO_SCORE_URL to a file in /public and it will be played instead.

export const INTRO_SCORE_URL: string | null = null;

const BPM = 136;
const BEAT = 60 / BPM; // 0.441 s
const BAR = BEAT * 4; // 1.765 s
const E8 = BEAT / 2; // eighth note
const BAR0 = 4.65 - BAR * 2; // grid origin, so the drop lands on a downbeat at 4.65 s

/** Timeline marks shared with the visuals (components/intro). Seconds. */
export const CUE = {
  hops: [0, 1, 2, 3, 4, 5].map((i) => BAR0 + BAR + i * E8), // agent pipeline activations, on the eighth-note grid
  converge: [3.7, 4.0, 4.25, 4.45],
  impact: BAR0 + BAR * 2, // 4.65: HARI KRISHNA, the drop
  accent: BAR0 + BAR * 2 + BEAT * 2, // AI ENGINEER
  build: BAR0 + BAR, // kick enters
  end: 20.5,
};

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let fileEl: HTMLAudioElement | null = null;
let live: AudioScheduledSourceNode[] = [];

const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

// One chord per bar. [bass midi, pad midi notes]
const PRE: [number, number[]] = [47, [62, 66, 69, 73]]; // Bm9 colour under the darkness
const BARS: [number, number[]][] = [
  [43, [55, 59, 62, 66]], // Gmaj7       (bar 0, 1.13 s)
  [45, [57, 62, 64, 69]], // Asus4       (bar 1, kick enters)
  [38, [50, 57, 62, 64, 66, 69]], // Dadd9 (bar 2, the drop)
  [47, [59, 62, 66, 69]], // Bm7
  [43, [55, 59, 62, 66, 71]], // Gmaj9
  [45, [57, 61, 64, 69]], // A
  [38, [50, 57, 62, 66, 69]], // D
  [43, [55, 59, 62, 66]], // Gmaj7 (fading)
  [38, [50, 57, 62, 66]], // D (tail)
];
// Melody after the drop: [bar, beat, midi, beats]
const MELODY: [number, number, number, number][] = [
  [2, 0, 78, 1.5], [2, 1.5, 76, 0.5], [2, 2, 74, 2],
  [3, 0, 81, 2], [3, 2.5, 78, 1.5],
  [4, 0, 79, 1], [4, 1, 78, 1], [4, 2, 76, 1], [4, 3, 74, 1],
  [5, 0, 76, 3], [5, 3, 73, 1],
  [6, 0, 74, 4],
];

function impulse(c: BaseAudioContext, seconds: number, decay: number) {
  const len = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}

function noiseBuffer(c: BaseAudioContext, seconds: number) {
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * seconds), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

/**
 * Schedule the track on any context. `t0` is the context time for timeline zero; `offset` is the timeline
 * position to start from. Returns the started sources so they can be stopped early.
 */
export function scheduleScore(c: BaseAudioContext, out: AudioNode, t0: number, offset = 0, intensity = 1) {
  const src: AudioScheduledSourceNode[] = [];
  const at = (s: number) => t0 + Math.max(0, s - offset);
  const barAt = (b: number) => BAR0 + b * BAR;
  const drop = CUE.impact;

  // ---------- mix bus: overall arc (fade in, full after the drop, long fade out) ----------
  const mix = c.createGain();
  const arc: [number, number][] = [[0, 0.0001], [1.1, 0.5], [CUE.build, 0.72], [drop, 1], [barAt(7), 0.9], [barAt(8), 0.75], [barAt(9) + 0.8, 0.45], [CUE.end, 0.0001]];
  {
    let v = 0.0001;
    for (let i = 0; i < arc.length - 1; i++) {
      const [s0, v0] = arc[i], [s1, v1] = arc[i + 1];
      if (offset >= s0 && offset < s1) v = v0 * Math.pow(v1 / v0, (offset - s0) / (s1 - s0));
    }
    mix.gain.setValueAtTime(Math.max(0.0001, v * intensity), at(offset));
    arc.forEach(([s, val], i) => {
      if (s <= offset) return;
      const v = Math.max(0.0001, val * intensity);
      // the very last fade is linear: exponential fades to silence sound like a sudden drop-off
      if (i === arc.length - 1) mix.gain.linearRampToValueAtTime(v, at(s));
      else mix.gain.exponentialRampToValueAtTime(v, at(s));
    });
  }
  mix.connect(out);

  // small, warm room (not a hall)
  const room = c.createConvolver();
  room.buffer = impulse(c, 1.8, 3.2);
  const roomGain = c.createGain();
  roomGain.gain.value = 0.22;
  room.connect(roomGain).connect(mix);

  // stereo ping-pong echo, dotted-eighth, for the arp and melody
  const echoIn = c.createGain();
  const dl = c.createDelay(1), dr = c.createDelay(1);
  dl.delayTime.value = BEAT * 0.75;
  dr.delayTime.value = BEAT * 0.75;
  const fb = c.createGain();
  fb.gain.value = 0.32;
  const echoTone = c.createBiquadFilter();
  echoTone.type = "lowpass";
  echoTone.frequency.value = 3800;
  const merge = c.createChannelMerger(2);
  const echoOut = c.createGain();
  echoOut.gain.value = 0.3;
  echoIn.connect(dl);
  dl.connect(dr);
  dr.connect(echoTone).connect(fb).connect(dl);
  dl.connect(merge, 0, 0);
  dr.connect(merge, 0, 1);
  merge.connect(echoOut).connect(mix);

  // sidechain-style pump: pad and bass breathe with the kick after the drop
  const pump = c.createGain();
  pump.gain.setValueAtTime(1, at(offset));
  for (let b = 0; barAt(0) + b * BEAT < barAt(7); b++) {
    const s = barAt(0) + b * BEAT;
    if (s < drop || s < offset) continue;
    pump.gain.setTargetAtTime(0.42, at(s), 0.008);
    pump.gain.setTargetAtTime(1, at(s) + 0.05, 0.1);
  }
  pump.connect(mix);

  // ---------- pad: soft detuned triangles + a whisper of saw, through a filter that opens into the drop ----------
  const padFilter = c.createBiquadFilter();
  padFilter.type = "lowpass";
  padFilter.Q.value = 0.7;
  const pf: [number, number][] = [[0, 600], [CUE.build, 1100], [drop - 0.05, 2600], [drop + BAR, 3400], [CUE.end, 1200]];
  {
    const cur = pf.reduce((v, [s, f]) => (s <= offset ? f : v), 600);
    padFilter.frequency.setValueAtTime(cur, at(offset));
    for (const [s, f] of pf) if (s > offset) padFilter.frequency.exponentialRampToValueAtTime(f, at(s));
  }
  const padGain = c.createGain();
  padGain.gain.value = 0.9;
  padFilter.connect(padGain);
  padGain.connect(pump);
  padGain.connect(room);

  const hold = (s: number, e: number, f: number, type: OscillatorType, gain: number, dest: AudioNode, atk: number, rel: number, detune = 0, pan = 0) => {
    if (e + rel <= offset) return;
    const start = Math.max(s, offset);
    const o = c.createOscillator();
    o.type = type;
    o.frequency.value = f;
    o.detune.value = detune;
    const g = c.createGain();
    const p = c.createStereoPanner();
    p.pan.value = pan;
    const atkEnd = s + atk;
    g.gain.setValueAtTime(start > atkEnd ? gain : 0.0001, at(start));
    if (start <= atkEnd) g.gain.exponentialRampToValueAtTime(gain, at(atkEnd));
    g.gain.setValueAtTime(gain, at(Math.max(e, start)));
    g.gain.exponentialRampToValueAtTime(0.0001, at(Math.max(e, start)) + rel);
    o.connect(g).connect(p).connect(dest);
    o.start(at(start));
    o.stop(at(Math.max(e, start)) + rel + 0.05);
    src.push(o);
  };

  const chord = (s: number, e: number, notes: number[], soft: boolean, rel = 0.7) => {
    notes.forEach((m, i) => {
      const pan = ((i / Math.max(1, notes.length - 1)) - 0.5) * 0.9;
      const g = (soft ? 0.03 : 0.042) * (m < 55 ? 1.2 : 1);
      hold(s, e, hz(m), "triangle", g, padFilter, soft ? 0.9 : 0.08, rel, -7, pan);
      hold(s, e, hz(m), "triangle", g, padFilter, soft ? 0.9 : 0.08, rel, 7, -pan);
      hold(s, e, hz(m), "sawtooth", g * 0.18, padFilter, soft ? 0.9 : 0.08, rel, 0, pan * 0.5);
    });
  };

  chord(0.15, barAt(0), PRE[1], true);
  BARS.forEach(([, notes], b) => {
    const last = b === BARS.length - 1; // the final D chord rings out instead of stopping
    chord(barAt(b), last ? barAt(b + 1) + 0.6 : barAt(b + 1), notes, b < 2, last ? 3.2 : 0.7);
  });

  // ---------- bass: round sine + triangle, entering with the kick; eighth-note pulse after the drop ----------
  BARS.forEach(([root], b) => {
    const s = barAt(b), e = barAt(b + 1);
    if (b === 0) return; // no bass in the first bar: space
    if (s < drop) {
      hold(s, e - 0.05, hz(root), "sine", 0.32, pump, 0.4, 0.3);
    } else {
      for (let k = 0; k < 8; k++) {
        const ns = s + k * E8;
        if (ns >= barAt(8)) break;
        hold(ns, ns + E8 * 0.8, hz(root), "sine", 0.34, pump, 0.01, 0.06);
        hold(ns, ns + E8 * 0.8, hz(root + 12), "triangle", 0.07, pump, 0.01, 0.06);
      }
    }
  });

  // ---------- arpeggio: soft plucks on the eighth-note grid, getting brighter towards the drop ----------
  const pluck = (s: number, m: number, g: number, bright: number) => {
    if (s < offset) return;
    const o = c.createOscillator();
    o.type = "triangle";
    o.frequency.value = hz(m);
    const o2 = c.createOscillator();
    o2.type = "sine";
    o2.frequency.value = hz(m + 12);
    const f = c.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(bright, at(s));
    f.frequency.exponentialRampToValueAtTime(500, at(s) + 0.35);
    const vg = c.createGain();
    vg.gain.setValueAtTime(0.0001, at(s));
    vg.gain.exponentialRampToValueAtTime(g * intensity, at(s) + 0.005);
    vg.gain.exponentialRampToValueAtTime(0.0001, at(s) + 0.5);
    const g2 = c.createGain();
    g2.gain.value = 0.25;
    o.connect(f);
    o2.connect(g2).connect(f);
    f.connect(vg);
    vg.connect(mix);
    vg.connect(echoIn);
    o.start(at(s));
    o2.start(at(s));
    o.stop(at(s) + 0.55);
    o2.stop(at(s) + 0.55);
    src.push(o, o2);
  };
  const shape = [0, 1, 2, 3, 2, 1, 2, 3];
  for (let b = 0; b < 8; b++) {
    const notes = BARS[b][1].filter((m) => m >= 55).slice(0, 4).map((m) => m + 12);
    for (let k = 0; k < 8; k++) {
      const s = barAt(b) + k * E8;
      const m = notes[shape[k] % notes.length];
      const before = s < drop;
      const g = before ? 0.05 + 0.05 * Math.max(0, (s - barAt(0)) / (drop - barAt(0))) : 0.075;
      pluck(s, m, b >= 7 ? g * 0.6 : g, before ? 1400 + 2600 * ((s - barAt(0)) / (drop - barAt(0))) : 4200);
    }
  }

  // ---------- drums: soft kick (heartbeat, then groove), gentle offbeat hats, a clap on 2 & 4 after the drop ----------
  const kick = (s: number, g: number) => {
    if (s < offset) return;
    const o = c.createOscillator();
    o.frequency.setValueAtTime(140, at(s));
    o.frequency.exponentialRampToValueAtTime(48, at(s) + 0.11);
    const vg = c.createGain();
    vg.gain.setValueAtTime(0.0001, at(s));
    vg.gain.exponentialRampToValueAtTime(g * intensity, at(s) + 0.004);
    vg.gain.exponentialRampToValueAtTime(0.0001, at(s) + 0.42);
    o.connect(vg).connect(mix);
    o.start(at(s));
    o.stop(at(s) + 0.45);
    src.push(o);
  };
  const noiseHit = (s: number, g: number, type: BiquadFilterType, freq: number, len: number, toRoom = false) => {
    if (s < offset) return;
    const n = c.createBufferSource();
    n.buffer = noiseBuffer(c, len + 0.05);
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = type === "bandpass" ? 1.4 : 0.7;
    const vg = c.createGain();
    vg.gain.setValueAtTime(g * intensity, at(s));
    vg.gain.exponentialRampToValueAtTime(0.0001, at(s) + len);
    n.connect(f).connect(vg).connect(mix);
    if (toRoom) vg.connect(room);
    n.start(at(s));
    src.push(n);
  };
  for (let b = 1; b < 8; b++) {
    for (let q = 0; q < 4; q++) {
      const s = barAt(b) + q * BEAT;
      const afterDrop = s >= drop;
      if (!afterDrop && q % 2 === 1 && b === 1) continue; // heartbeat: half-time in the build bar
      kick(s, afterDrop ? (b === 7 ? 0.55 : 0.85) : 0.5);
      if (afterDrop) {
        noiseHit(s + E8, 0.05, "highpass", 8500, 0.05); // offbeat hat
        if (q % 2 === 1) noiseHit(s, 0.14, "bandpass", 1600, 0.16, true); // soft clap
      }
    }
  }

  // ---------- transition into the drop: filtered swell + reverse-cymbal style air ----------
  if (offset < drop) {
    const from = Math.max(offset, CUE.build + BEAT * 2);
    const n = c.createBufferSource();
    n.buffer = noiseBuffer(c, drop - from + 0.2);
    const f = c.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(900, at(from));
    f.frequency.exponentialRampToValueAtTime(9000, at(drop));
    const vg = c.createGain();
    vg.gain.setValueAtTime(0.0001, at(from));
    vg.gain.exponentialRampToValueAtTime(0.09 * intensity, at(drop - 0.02));
    vg.gain.exponentialRampToValueAtTime(0.0001, at(drop + 0.05));
    n.connect(f).connect(vg).connect(mix);
    n.start(at(from));
    n.stop(at(drop + 0.1));
    src.push(n);
  }

  // ---------- the drop: a clean, strong low hit under the name (no crash, no hall) ----------
  if (offset <= drop + 0.02) {
    const o = c.createOscillator();
    o.frequency.setValueAtTime(75, at(drop));
    o.frequency.exponentialRampToValueAtTime(38, at(drop) + 0.9);
    const vg = c.createGain();
    vg.gain.setValueAtTime(0.0001, at(drop));
    vg.gain.exponentialRampToValueAtTime(0.75 * intensity, at(drop) + 0.01);
    vg.gain.exponentialRampToValueAtTime(0.0001, at(drop) + 1.3);
    o.connect(vg).connect(mix);
    o.start(at(drop));
    o.stop(at(drop) + 1.35);
    src.push(o);
  }

  // ---------- melody: a soft bell-flute line after the drop, with echo ----------
  const lead = (s: number, beats: number, m: number, g: number) => {
    if (s + 0.1 < offset) return;
    const st = Math.max(s, offset);
    const len = beats * BEAT;
    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.value = hz(m);
    const mod = c.createOscillator();
    mod.frequency.value = hz(m) * 2;
    const idx = c.createGain();
    idx.gain.setValueAtTime(hz(m) * 0.9, at(st));
    idx.gain.exponentialRampToValueAtTime(hz(m) * 0.05, at(st) + 0.4);
    mod.connect(idx).connect(o.frequency);
    const vib = c.createOscillator();
    vib.frequency.value = 5;
    const vibAmt = c.createGain();
    vibAmt.gain.value = 3;
    vib.connect(vibAmt).connect(o.detune);
    const vg = c.createGain();
    vg.gain.setValueAtTime(0.0001, at(st));
    vg.gain.exponentialRampToValueAtTime(g * intensity, at(st) + 0.02);
    vg.gain.exponentialRampToValueAtTime(g * 0.5 * intensity, at(st) + len * 0.7);
    vg.gain.exponentialRampToValueAtTime(0.0001, at(st) + len + 0.25);
    o.connect(vg);
    vg.connect(mix);
    vg.connect(echoIn);
    vg.connect(room);
    for (const x of [o, mod, vib]) {
      x.start(at(st));
      x.stop(at(st) + len + 0.3);
      src.push(x);
    }
  };
  MELODY.forEach(([b, beat, m, beats]) => lead(barAt(b) + beat * BEAT, beats, m, 0.085));
  // AI ENGINEER: a bright bell on beat 3 of the drop bar
  lead(CUE.accent, 3, 86, 0.04);

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
    comp.threshold.value = -18;
    comp.knee.value = 12;
    comp.ratio.value = 3;
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
    if (onHero) playIntroScore(CUE.build, window.innerWidth < 768 ? 0.75 : 0.9);
  };
  LATE.forEach((e) => window.addEventListener(e, lateHandler!, { passive: true }));
}

function disarmLateStart() {
  if (!lateHandler) return;
  LATE.forEach((e) => window.removeEventListener(e, lateHandler!));
  lateHandler = null;
}

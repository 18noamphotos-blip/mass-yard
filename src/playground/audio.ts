let ctx: AudioContext | null = null;
let lastHit = 0;

function context(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

export function unlockAudio() {
  const audio = context();
  if (audio && audio.state === "suspended") void audio.resume();
}

export function playThud(speed: number) {
  const audio = context();
  if (!audio || audio.state !== "running") return;
  const now = performance.now();
  if (now - lastHit < 42) return;
  lastHit = now;

  const t = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  const filter = audio.createBiquadFilter();
  osc.type = "triangle";
  const start = 70 + Math.random() * 50 + Math.min(speed, 8) * 6;
  osc.frequency.setValueAtTime(start, t);
  osc.frequency.exponentialRampToValueAtTime(36, t + 0.09);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(420, t);
  const volume = Math.min(0.18, 0.03 + speed * 0.012);
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(audio.destination);
  osc.start(t);
  osc.stop(t + 0.15);
}

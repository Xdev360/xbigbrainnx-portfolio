// Sound and touch feedback.
// Sound is OFF by default and only turns on when the visitor asks (nav toggle).
// For now sounds are synthesised with Web Audio (tiny, no files, no licences).
// Later: swap `play()` to a Howler sprite at /sound/ui.mp3 with the same names.

export type Sfx = 'click' | 'tick' | 'pop' | 'success' | 'miss' | 'toggle';

const KEY = 'sound';
let ctx: AudioContext | null = null;

export const soundOn = (): boolean => {
  try { return localStorage.getItem(KEY) === 'on'; } catch { return false; }
};

export const setSound = (on: boolean) => {
  try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch {}
  document.documentElement.dataset.sound = on ? 'on' : 'off';
  window.dispatchEvent(new CustomEvent('sound-change', { detail: on }));
  if (on) play('toggle');
};

const audio = () => (ctx ??= new (window.AudioContext || (window as any).webkitAudioContext)());

// Slight random pitch so repeats never sound robotic.
const vary = (f: number) => f * (0.96 + Math.random() * 0.08);

function blip(freq: number, dur: number, type: OscillatorType, gain: number, slideTo?: number) {
  const a = audio();
  const o = a.createOscillator();
  const g = a.createGain();
  const t = a.currentTime;
  o.type = type;
  o.frequency.setValueAtTime(vary(freq), t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(vary(slideTo), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export function play(name: Sfx) {
  if (!soundOn()) return;
  switch (name) {
    case 'click':   blip(1800, 0.03, 'square', 0.03); break;
    case 'tick':    blip(2600, 0.02, 'sine', 0.04); break;
    case 'toggle':  blip(900, 0.06, 'triangle', 0.06, 1400); break;
    case 'pop':     blip(500, 0.09, 'sine', 0.09, 1100); break;
    case 'success': blip(660, 0.08, 'triangle', 0.06); setTimeout(() => blip(990, 0.12, 'triangle', 0.06), 70); break;
    case 'miss':    blip(320, 0.14, 'sine', 0.06, 180); break;
  }
}

// Android-only in practice; iOS Safari ignores navigator.vibrate.
export function buzz(pattern: number | number[] = 8) {
  if (!soundOn()) return; // touch follows the same opt-in as sound
  try { navigator.vibrate?.(pattern); } catch {}
}

/* ═══════════════════════════════════════════════════════════════════════════
   FIGURE PRIMITIVES — scales, deterministic texture, path helpers.
   Replaces a chart library: every figure in FiscalScope is hand-drawn SVG and
   needs nothing more than linear mapping plus honest tick generation.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Linear scale d0..d1 → r0..r1, with an inverse and a clamped variant. */
export function linear([d0, d1], [r0, r1]) {
  const span = d1 - d0 || 1;
  const fn = v => r0 + ((v - d0) / span) * (r1 - r0);
  fn.invert = p => d0 + ((p - r0) / (r1 - r0 || 1)) * span;
  fn.clamped = v => fn(Math.min(Math.max(v, Math.min(d0, d1)), Math.max(d0, d1)));
  fn.domain = [d0, d1];
  fn.range = [r0, r1];
  return fn;
}

/** "Nice" ticks at 1/2/5 × 10ⁿ, at most `count` of them. */
export function ticks(d0, d1, count = 5) {
  const raw = (d1 - d0) / Math.max(1, count);
  const mag = Math.pow(10, Math.floor(Math.log10(Math.abs(raw) || 1)));
  const norm = raw / mag;
  const step = (norm >= 5 ? 10 : norm >= 2 ? 5 : norm >= 1 ? 2 : 1) * mag;
  const out = [];
  for (let v = Math.ceil(d0 / step) * step; v <= d1 + step * 1e-6; v += step) {
    out.push(Math.round(v * 1e6) / 1e6);
  }
  return out;
}

/**
 * Deterministic pseudo-random in [0,1) — lieflat-charts' `rnd`.
 * Figures must screenshot identically on every reload, so `Math.random()`
 * is never used for mark texture.
 */
export const rnd = (i, k) => Math.abs(((i * 73856093) ^ (k * 19349663)) % 1000) / 1000;

/** Polyline path through [x, y] pairs. */
export function polyline(points) {
  if (!points.length) return '';
  return 'M' + points.map(([x, y]) => `${round(x)} ${round(y)}`).join(' L ');
}

/** Rounded to 2dp — keeps the emitted SVG small and diff-friendly. */
export const round = n => Math.round(n * 100) / 100;

/**
 * Countable marks for a quantity: how many units fit, and the index of every
 * fifth one (which carries the counting dot, per the Lupi grammar).
 * Rounding never invents a unit: the remainder is returned so a figure can
 * declare it honestly in its note.
 */
export function units(value, unit) {
  const n = Math.max(0, Math.floor(Math.abs(value) / unit));
  return { n, remainder: Math.abs(value) - n * unit };
}

/** Evenly spaced positions for n marks inside [a, b] with a small inset. */
export function spread(n, a, b, inset = 0) {
  const lo = a + inset;
  const hi = b - inset;
  if (n <= 1) return n === 1 ? [(lo + hi) / 2] : [];
  const step = (hi - lo) / (n - 1);
  return Array.from({ length: n }, (_, i) => lo + i * step);
}

/** Clamp helper used by drag interactions. */
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

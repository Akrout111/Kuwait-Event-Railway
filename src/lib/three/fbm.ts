/**
 * Multi-octave sine noise for organic motion
 * Ported from the Golden Geometric Visions reference
 */

export function fbm(t: number, s = 0): number {
  return (
    Math.sin(t + s) * 0.38 +
    Math.sin(t * 2.37 + s * 1.73) * 0.27 +
    Math.sin(t * 4.13 + s * 0.31) * 0.17 +
    Math.sin(t * 7.29 + s * 2.41) * 0.1 +
    Math.sin(t * 11.07 + s * 3.67) * 0.05 +
    Math.sin(t * 16.3 + s * 5.1) * 0.03
  );
}

/** Deterministic PRNG — Mulberry32 seeded */
export function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

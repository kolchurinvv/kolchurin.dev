/**
 * mulberry32 — small, fast, deterministic PRNG.
 * Used everywhere in the bento layout for reproducibility.
 */
export function mulberry32(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randomInt(rng: () => number, lo: number, hi: number): number {
  return Math.floor(rng() * (hi - lo)) + lo
}

export function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const out = arr.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomInt(rng, 0, i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

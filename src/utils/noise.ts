// Noise utilities for procedural generation

/**
 * Simple 1D hash function
 */
export function hash1d(n: number): number {
  n = (n << 13) ^ n;
  return (n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff;
}

/**
 * 1D value noise
 */
export function noise1d(x: number): number {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return lerp(hash1d(i) / 0x7fffffff, hash1d(i + 1) / 0x7fffffff, u);
}

/**
 * 2D hash function
 */
export function hash2d(x: number, y: number): number {
  let n = x + y * 57;
  n = (n << 13) ^ n;
  return (n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff;
}

/**
 * 2D value noise
 */
export function noise2d(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  
  const a = hash2d(ix, iy) / 0x7fffffff;
  const b = hash2d(ix + 1, iy) / 0x7fffffff;
  const c = hash2d(ix, iy + 1) / 0x7fffffff;
  const d = hash2d(ix + 1, iy + 1) / 0x7fffffff;
  
  const x1 = lerp(a, b, ux);
  const x2 = lerp(c, d, ux);
  return lerp(x1, x2, uy);
}

/**
 * 3D hash function
 */
export function hash3d(x: number, y: number, z: number): number {
  let n = x + y * 57 + z * 113;
  n = (n << 13) ^ n;
  return (n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff;
}

/**
 * 3D value noise
 */
export function noise3d(x: number, y: number, z: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fy = y - iy;
  const fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const uz = fz * fz * (3 - 2 * fz);
  
  const a = hash3d(ix, iy, iz) / 0x7fffffff;
  const b = hash3d(ix + 1, iy, iz) / 0x7fffffff;
  const c = hash3d(ix, iy + 1, iz) / 0x7fffffff;
  const d = hash3d(ix + 1, iy + 1, iz) / 0x7fffffff;
  const e = hash3d(ix, iy, iz + 1) / 0x7fffffff;
  const f = hash3d(ix + 1, iy, iz + 1) / 0x7fffffff;
  const g = hash3d(ix, iy + 1, iz + 1) / 0x7fffffff;
  const h = hash3d(ix + 1, iy + 1, iz + 1) / 0x7fffffff;
  
  const x1 = lerp(a, b, ux);
  const x2 = lerp(c, d, ux);
  const x3 = lerp(e, f, ux);
  const x4 = lerp(g, h, ux);
  
  const y1 = lerp(x1, x2, uy);
  const y2 = lerp(x3, x4, uy);
  
  return lerp(y1, y2, uz);
}

/**
 * Fractal Brownian Motion (fBm) - 1D
 */
export function fbm1d(x: number, octaves: number = 6, persistence: number = 0.5, lacunarity: number = 2): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxValue = 0;
  
  for (let i = 0; i < octaves; i++) {
    value += noise1d(x * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }
  
  return value / maxValue;
}

/**
 * Fractal Brownian Motion (fBm) - 2D
 */
export function fbm2d(x: number, y: number, octaves: number = 6, persistence: number = 0.5, lacunarity: number = 2): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxValue = 0;
  
  for (let i = 0; i < octaves; i++) {
    value += noise2d(x * frequency, y * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }
  
  return value / maxValue;
}

/**
 * Fractal Brownian Motion (fBm) - 3D
 */
export function fbm3d(x: number, y: number, z: number, octaves: number = 6, persistence: number = 0.5, lacunarity: number = 2): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxValue = 0;
  
  for (let i = 0; i < octaves; i++) {
    value += noise3d(x * frequency, y * frequency, z * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }
  
  return value / maxValue;
}

/**
 * Lerp utility
 */
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

/**
 * Smoothstep
 */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Clamp
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Random float in range
 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Random int in range
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Seeded random generator (mulberry32)
 */
export function createSeededRandom(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate simplex-like noise using fBm
 */
export function simplexNoise2d(x: number, y: number): number {
  // Simplified simplex-like noise using rotated fBm
  return fbm2d(x, y, 4, 0.5, 2);
}

/**
 * Generate curl noise for flow fields
 */
export function curlNoise2d(x: number, y: number, scale: number = 1): { x: number; y: number } {
  const eps = 0.001;
  const n = (x: number, y: number) => fbm2d(x * scale, y * scale);
  
  const dx = n(x + eps, y) - n(x - eps, y);
  const dy = n(x, y + eps) - n(x, y - eps);
  
  return { x: dy, y: -dx };
}
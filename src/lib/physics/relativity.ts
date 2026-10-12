import { C } from './constants';

/** β = v/c must satisfy 0 ≤ β < 1 for a massive object. */
export function assertSubluminal(v: number, c: number = C.c) {
  if (!(Math.abs(v) < c)) throw new RangeError('A massive object must travel slower than c');
}

/** Lorentz factor γ = 1/√(1 − v²/c²) */
export function gamma(v: number, c: number = C.c) {
  assertSubluminal(v, c);
  const b = v / c;
  return 1 / Math.sqrt(1 - b * b);
}
/** γ from β directly (β in [0,1)) */
export const gammaFromBeta = (beta: number) => {
  if (!(beta >= 0 && beta < 1)) throw new RangeError('β must be in [0, 1)');
  return 1 / Math.sqrt(1 - beta * beta);
};
/** Speed (as fraction of c) giving a particular γ ≥ 1 */
export const betaFromGamma = (g: number) => {
  if (!(g >= 1)) throw new RangeError('γ ≥ 1');
  return Math.sqrt(1 - 1 / (g * g));
};

/** Dilated time t = t0 / √(1 − v²/c²) — t0 is proper time (measured in the clock's rest frame). */
export const dilatedTime = (t0: number, v: number, c: number = C.c) => t0 * gamma(v, c);
/** Contracted length l = l0 √(1 − v²/c²) — l0 is proper length (measured in the object's rest frame). */
export const contractedLength = (l0: number, v: number, c: number = C.c) => l0 / gamma(v, c);
/** Relativistic momentum p = m0 v / √(1 − v²/c²) */
export const relMomentum = (m0: number, v: number, c: number = C.c) => m0 * v * gamma(v, c);
export const classicalMomentum = (m0: number, v: number) => m0 * v;
/** E = mc² */
export const restEnergy = (m: number, c: number = C.c) => m * c * c;
export const massFromEnergy = (E: number, c: number = C.c) => E / (c * c);
/** Total relativistic energy E = γmc² and kinetic energy (γ − 1)mc² — supplementary beyond syllabus formulae */
export const totalEnergy = (m0: number, v: number, c: number = C.c) => gamma(v, c) * m0 * c * c;
export const relKinetic = (m0: number, v: number, c: number = C.c) => (gamma(v, c) - 1) * m0 * c * c;

/**
 * Relativity of simultaneity: two events simultaneous in frame S at positions x1, x2 (t = 0)
 * occur at t' = −γ v x / c² in frame S' moving at +v. Returns Δt' = t2' − t1'.
 */
export const simultaneityOffset = (x1: number, x2: number, v: number, c: number = C.c) => (-gamma(v, c) * v * (x2 - x1)) / (c * c);

/** Muon example data (commonly quoted): proper mean lifetime 2.2 μs. */
export const MUON_LIFETIME = 2.2e-6;

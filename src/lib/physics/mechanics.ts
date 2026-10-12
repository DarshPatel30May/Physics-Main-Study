import { C, rad } from './constants';

/* ------------------------------------------------------------------ */
/* Projectile motion (no air resistance, constant g, flat ground y=0)  */
/* ------------------------------------------------------------------ */

export interface ProjectileInput {
  /** launch speed (m/s) */
  u: number;
  /** launch angle above horizontal (degrees) */
  angleDeg: number;
  /** launch height above landing level (m), >= 0 */
  h0: number;
  /** gravitational acceleration magnitude (m/s^2), > 0 */
  g: number;
}

export interface ProjectileState {
  t: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  v: number;
  /** direction of velocity, degrees above horizontal */
  dirDeg: number;
  ax: number;
  ay: number;
}

export interface ProjectileResult {
  ux: number;
  uy: number;
  /** time to reach the highest point (0 if launched at or below horizontal) */
  tPeak: number;
  /** highest point above landing level */
  maxHeight: number;
  /** time when y returns to 0 */
  tFlight: number;
  range: number;
  vxFinal: number;
  vyFinal: number;
  vFinal: number;
  /** final direction, degrees (negative = below horizontal) */
  finalDirDeg: number;
  at: (t: number) => ProjectileState;
}

export function projectile({ u, angleDeg, h0, g }: ProjectileInput): ProjectileResult {
  if (!(g > 0)) throw new RangeError('g must be positive');
  if (u < 0) throw new RangeError('launch speed cannot be negative');
  if (h0 < 0) throw new RangeError('launch height must be at or above landing level');
  const th = rad(angleDeg);
  const ux = u * Math.cos(th);
  const uy = u * Math.sin(th);
  // y(t) = h0 + uy t - g t^2 / 2 = 0  ->  positive root
  const tFlight = (uy + Math.sqrt(uy * uy + 2 * g * h0)) / g;
  const tPeak = uy > 0 ? uy / g : 0;
  const maxHeight = uy > 0 ? h0 + (uy * uy) / (2 * g) : h0;
  const vyFinal = uy - g * tFlight;
  const vFinal = Math.hypot(ux, vyFinal);
  const at = (tRaw: number): ProjectileState => {
    const t = Math.min(Math.max(tRaw, 0), tFlight);
    const vy = uy - g * t;
    return {
      t,
      x: ux * t,
      y: h0 + uy * t - 0.5 * g * t * t,
      vx: ux,
      vy,
      v: Math.hypot(ux, vy),
      dirDeg: (Math.atan2(vy, ux) * 180) / Math.PI,
      ax: 0,
      ay: -g,
    };
  };
  return {
    ux,
    uy,
    tPeak,
    maxHeight,
    tFlight,
    range: ux * tFlight,
    vxFinal: ux,
    vyFinal,
    vFinal,
    finalDirDeg: (Math.atan2(vyFinal, ux) * 180) / Math.PI,
    at,
  };
}

/** Special case: launch and landing at the same height. R = u^2 sin(2θ)/g */
export const levelRange = (u: number, angleDeg: number, g: number = C.g) => (u * u * Math.sin(2 * rad(angleDeg))) / g;
export const levelTimeOfFlight = (u: number, angleDeg: number, g: number = C.g) => (2 * u * Math.sin(rad(angleDeg))) / g;
export const levelMaxHeight = (u: number, angleDeg: number, g: number = C.g) => (u * Math.sin(rad(angleDeg))) ** 2 / (2 * g);

/**
 * Projectile with linear air drag (a = -k v), integrated numerically.
 * Used only to illustrate the limitation of the no-air-resistance model.
 */
export function projectileWithDrag(input: ProjectileInput, k: number, dt = 0.002): { x: number; y: number }[] {
  const th = rad(input.angleDeg);
  let vx = input.u * Math.cos(th);
  let vy = input.u * Math.sin(th);
  let x = 0;
  let y = input.h0;
  const pts = [{ x, y }];
  for (let i = 0; i < 200000; i++) {
    // semi-implicit Euler is adequate for a qualitative comparison curve
    vx += -k * vx * dt;
    vy += (-input.g - k * vy) * dt;
    x += vx * dt;
    y += vy * dt;
    if (y < 0) {
      pts.push({ x, y: 0 });
      break;
    }
    if (i % 10 === 0) pts.push({ x, y });
  }
  return pts;
}

/* ------------------------------------------------------------------ */
/* Equations of uniformly accelerated motion                           */
/* ------------------------------------------------------------------ */
export const suvat = {
  v: (u: number, a: number, t: number) => u + a * t,
  s: (u: number, a: number, t: number) => u * t + 0.5 * a * t * t,
  v2: (u: number, a: number, s: number) => u * u + 2 * a * s,
};

/* ------------------------------------------------------------------ */
/* Uniform circular motion                                             */
/* ------------------------------------------------------------------ */
export interface CircularResult {
  v: number;
  omega: number;
  T: number;
  f: number;
  ac: number;
  Fc: number;
}

/** From mass (kg), speed (m/s) and radius (m). */
export function circular(m: number, v: number, r: number): CircularResult {
  if (!(r > 0)) throw new RangeError('radius must be positive');
  if (v < 0) throw new RangeError('speed is a magnitude');
  const T = v > 0 ? (2 * Math.PI * r) / v : Infinity;
  return { v, omega: v / r, T, f: v > 0 ? 1 / T : 0, ac: (v * v) / r, Fc: (m * v * v) / r };
}

/** Banked track design speed (no friction needed): tanθ = v²/(rg) */
export const bankedDesignSpeed = (r: number, bankDeg: number, g: number = C.g) => Math.sqrt(r * g * Math.tan(rad(bankDeg)));
export const bankAngleFor = (v: number, r: number, g: number = C.g) => (Math.atan((v * v) / (r * g)) * 180) / Math.PI;
/** Flat bend: maximum speed before sliding when friction alone supplies F_c */
export const flatBendMaxSpeed = (mu: number, r: number, g: number = C.g) => Math.sqrt(mu * g * r);

/**
 * Banked track with friction: required friction force (positive = down the slope)
 * for a car of mass m travelling at v. Resolving horizontally/vertically:
 * N sinθ + f cosθ = mv²/r, N cosθ − f sinθ = mg
 */
export function bankedForces(m: number, v: number, r: number, bankDeg: number, g: number = C.g) {
  const th = rad(bankDeg);
  const Fc = (m * v * v) / r;
  const N = m * g * Math.cos(th) + Fc * Math.sin(th);
  const f = Fc * Math.cos(th) - m * g * Math.sin(th);
  return { N, f, Fc, weight: m * g };
}

/** Conical pendulum (mass on string in horizontal circle): string angle from vertical. */
export function conicalPendulum(m: number, L: number, angleDeg: number, g: number = C.g) {
  const th = rad(angleDeg);
  const r = L * Math.sin(th);
  const T = (m * g) / Math.cos(th); // tension
  const v = Math.sqrt(g * r * Math.tan(th));
  const period = (2 * Math.PI * r) / v;
  return { r, tension: T, v, period, Fc: T * Math.sin(th) };
}

/** Torque magnitude τ = r F sinθ (θ between r and F). */
export const torque = (r: number, F: number, angleDeg: number) => r * F * Math.sin(rad(angleDeg));

/* ------------------------------------------------------------------ */
/* Gravitation                                                         */
/* ------------------------------------------------------------------ */
export const gravForce = (M: number, m: number, r: number, G: number = C.G) => (G * M * m) / (r * r);
export const fieldStrength = (M: number, r: number, G: number = C.G) => (G * M) / (r * r);
export const orbitalSpeed = (M: number, r: number, G: number = C.G) => Math.sqrt((G * M) / r);
export const orbitalPeriod = (M: number, r: number, G: number = C.G) => 2 * Math.PI * Math.sqrt((r * r * r) / (G * M));
export const radiusFromPeriod = (M: number, T: number, G: number = C.G) => Math.cbrt((G * M * T * T) / (4 * Math.PI * Math.PI));
export const escapeSpeed = (M: number, r: number, G: number = C.G) => Math.sqrt((2 * G * M) / r);
export const gravPE = (M: number, m: number, r: number, G: number = C.G) => (-G * M * m) / r;
export const orbitalKE = (M: number, m: number, r: number, G: number = C.G) => (G * M * m) / (2 * r);
export const orbitalTotalE = (M: number, m: number, r: number, G: number = C.G) => (-G * M * m) / (2 * r);
/** Energy that must be supplied to move a satellite from circular orbit r1 to r2. */
export const orbitTransferEnergy = (M: number, m: number, r1: number, r2: number, G: number = C.G) =>
  orbitalTotalE(M, m, r2, G) - orbitalTotalE(M, m, r1, G);

/** Geostationary orbital radius for Earth using a sidereal day (86 164 s). */
export const geostationaryRadius = (M: number = C.ME, G: number = C.G) => radiusFromPeriod(M, 86164, G);

/* Two-body orbit integrator (central mass fixed), velocity-Verlet: symplectic, conserves energy well. */
export interface OrbitState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  t: number;
}

export function orbitStep(s: OrbitState, GM: number, dt: number): OrbitState {
  const acc = (x: number, y: number) => {
    const r3 = Math.pow(x * x + y * y, 1.5);
    return [(-GM * x) / r3, (-GM * y) / r3];
  };
  const [ax, ay] = acc(s.x, s.y);
  const vxh = s.vx + 0.5 * ax * dt;
  const vyh = s.vy + 0.5 * ay * dt;
  const x = s.x + vxh * dt;
  const y = s.y + vyh * dt;
  const [ax2, ay2] = acc(x, y);
  return { x, y, vx: vxh + 0.5 * ax2 * dt, vy: vyh + 0.5 * ay2 * dt, t: s.t + dt };
}

/** Orbital elements of an orbit from a state vector (bound orbits only). */
export function orbitElements(s: OrbitState, GM: number) {
  const r = Math.hypot(s.x, s.y);
  const v2 = s.vx * s.vx + s.vy * s.vy;
  const energy = v2 / 2 - GM / r; // specific energy
  const hz = s.x * s.vy - s.y * s.vx; // specific angular momentum
  const a = -GM / (2 * energy);
  const e = Math.sqrt(Math.max(0, 1 + (2 * energy * hz * hz) / (GM * GM)));
  const bound = energy < 0;
  const T = bound ? 2 * Math.PI * Math.sqrt((a * a * a) / GM) : Infinity;
  return { energy, h: hz, a, e, bound, T, rPeri: bound ? a * (1 - e) : NaN, rApo: bound ? a * (1 + e) : NaN };
}

/** Planetary data (NASA Planetary Fact Sheet): semi-major axis (AU) and sidereal period (years). */
export const PLANETS = [
  { name: 'Mercury', a: 0.387, T: 0.241, colour: '#a8a29e' },
  { name: 'Venus', a: 0.723, T: 0.615, colour: '#facc15' },
  { name: 'Earth', a: 1.0, T: 1.0, colour: '#38bdf8' },
  { name: 'Mars', a: 1.524, T: 1.881, colour: '#f87171' },
  { name: 'Jupiter', a: 5.203, T: 11.86, colour: '#fdba74' },
  { name: 'Saturn', a: 9.537, T: 29.45, colour: '#fde68a' },
  { name: 'Uranus', a: 19.19, T: 84.0, colour: '#67e8f9' },
  { name: 'Neptune', a: 30.07, T: 164.8, colour: '#818cf8' },
];

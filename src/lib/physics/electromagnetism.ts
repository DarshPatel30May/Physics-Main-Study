import { C, rad } from './constants';

export type Vec3 = [number, number, number];

export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const scale = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k];
export const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const norm = (a: Vec3) => Math.hypot(a[0], a[1], a[2]);

/* ------------------------- Electric fields ------------------------- */
export const fieldBetweenPlates = (V: number, d: number) => V / d;
export const electricForce = (q: number, E: number) => q * E;
export const workByField = (q: number, V: number) => q * V;
/** Speed gained by a particle accelerated from rest through potential difference V (non-relativistic). */
export const speedFromPD = (q: number, V: number, m: number) => Math.sqrt((2 * Math.abs(q * V)) / m);

/** Coulomb field of a point charge at (x,y) from charge at (cx,cy) — used for field-line drawing. */
export function pointChargeField(q: number, cx: number, cy: number, x: number, y: number): [number, number] {
  const dx = x - cx;
  const dy = y - cy;
  const r2 = dx * dx + dy * dy;
  const r = Math.sqrt(r2);
  if (r < 1e-9) return [0, 0];
  const k = (C.k * q) / (r2 * r);
  return [k * dx, k * dy];
}

/**
 * Parallel-plate deflection: particle enters midway with horizontal speed vx, plates length L,
 * field E pointing in +y. Returns vertical acceleration and displacement on leaving the plates.
 */
export function plateDeflection(q: number, m: number, E: number, vx: number, L: number) {
  const ay = (q * E) / m; // sign carries: negative charge accelerates opposite to E
  const t = L / vx;
  return { ay, t, dy: 0.5 * ay * t * t, vyExit: ay * t, exitAngleDeg: (Math.atan2(ay * t, vx) * 180) / Math.PI };
}

/* ------------------------- Magnetic forces ------------------------- */
/** |F| = q v B sinθ */
export const magneticForceOnCharge = (q: number, v: number, B: number, angleDeg: number) =>
  Math.abs(q) * v * B * Math.sin(rad(angleDeg));
/** Lorentz force vector F = q(E + v × B) */
export const lorentz = (q: number, v: Vec3, E: Vec3, B: Vec3): Vec3 => scale(add(E, cross(v, B)), q);
/** Radius of circular path in a uniform B (v ⟂ B). */
export const cyclotronRadius = (m: number, v: number, q: number, B: number) => (m * v) / (Math.abs(q) * B);
export const cyclotronPeriod = (m: number, q: number, B: number) => (2 * Math.PI * m) / (Math.abs(q) * B);
/** Velocity selector: undeflected when qE = qvB */
export const selectorSpeed = (E: number, B: number) => E / B;

/**
 * Boris integrator for a charged particle in uniform E and B (exact gyration phase for pure B,
 * standard for plasma simulation; energy is conserved in a pure magnetic field).
 */
export function borisStep(pos: Vec3, vel: Vec3, qm: number, E: Vec3, B: Vec3, dt: number): { pos: Vec3; vel: Vec3 } {
  const half = (qm * dt) / 2;
  const vMinus = add(vel, scale(E, half));
  const t = scale(B, half);
  const t2 = dot(t, t);
  const vPrime = add(vMinus, cross(vMinus, t));
  const s = scale(t, 2 / (1 + t2));
  const vPlus = add(vMinus, cross(vPrime, s));
  const vNew = add(vPlus, scale(E, half));
  return { pos: add(pos, scale(vNew, dt)), vel: vNew };
}

/* ------------------------- Conductors ------------------------- */
/** F = l I B sinθ, θ between conductor (current direction) and B */
export const forceOnConductor = (l: number, I: number, B: number, angleDeg: number) => l * I * B * Math.sin(rad(angleDeg));
/** Force per unit length between long parallel wires (attractive if currents in same direction). */
export const parallelWireForcePerLength = (I1: number, I2: number, r: number) => (C.mu0 * I1 * I2) / (2 * Math.PI * r);
export const wireField = (I: number, r: number) => (C.mu0 * I) / (2 * Math.PI * r);
export const solenoidField = (N: number, I: number, L: number) => (C.mu0 * N * I) / L;
/** Torque on a coil: τ = n I A B sinθ, θ between the coil's normal (area vector) and B. */
export const coilTorque = (n: number, I: number, A: number, B: number, angleDeg: number) =>
  n * I * A * B * Math.sin(rad(angleDeg));

/* ------------------------- Induction ------------------------- */
/** Φ = B A cosθ, θ between B and the normal to the area. */
export const flux = (B: number, A: number, angleDeg: number) => B * A * Math.cos(rad(angleDeg));
/** Average induced emf ε = −N ΔΦ/Δt */
export const inducedEmf = (N: number, dPhi: number, dt: number) => (-N * dPhi) / dt;
/** Rotating coil generator: ε(t) = N B A ω sin(ωt) when Φ = BA cos(ωt). */
export const generatorEmf = (N: number, B: number, A: number, omega: number, t: number) =>
  N * B * A * omega * Math.sin(omega * t);

/** Numerical derivative of a sampled flux series -> emf series, ε = -N dΦ/dt (central differences). */
export function emfFromFlux(phi: number[], dt: number, N: number): number[] {
  const n = phi.length;
  const out = new Array<number>(n).fill(0);
  for (let i = 0; i < n; i++) {
    const a = phi[Math.max(0, i - 1)];
    const b = phi[Math.min(n - 1, i + 1)];
    const span = (Math.min(n - 1, i + 1) - Math.max(0, i - 1)) * dt;
    out[i] = span > 0 ? (-N * (b - a)) / span : 0;
  }
  return out;
}

/**
 * Flux through a circular loop (radius a) from a bar magnet modelled as a point magnetic dipole
 * (moment m, A m²) on the loop's axis at distance z. By reciprocity Φ = m·B_loop/I, giving
 * Φ = μ0 m a² / (2 (a² + z²)^{3/2}). A simplified model: a real bar magnet is not a point dipole.
 */
export const dipoleFluxThroughLoop = (m: number, a: number, z: number) =>
  (C.mu0 * m * a * a) / (2 * Math.pow(a * a + z * z, 1.5));

/* ------------------------- Transformers & transmission ------------------------- */
export function idealTransformer(Vp: number, Np: number, Ns: number, Ip?: number) {
  const Vs = (Vp * Ns) / Np;
  const Is = Ip !== undefined ? (Vp * Ip) / Vs : undefined;
  return { Vs, Is, ratio: Ns / Np, type: Ns > Np ? 'step-up' : Ns < Np ? 'step-down' : 'isolation' } as const;
}

/** Transmission: deliver power P at line voltage V through line resistance R. */
export function transmissionLoss(P: number, V: number, R: number) {
  const I = P / V;
  const loss = I * I * R;
  return { I, loss, fraction: loss / P, voltageDrop: I * R };
}

/* ------------------------- DC motor back emf ------------------------- */
/** Simple DC motor: I = (V − ε_back)/R, ε_back = kω. Returns current and torque constant form. */
export function dcMotor(V: number, R: number, k: number, omega: number) {
  const back = k * omega;
  const I = (V - back) / R;
  return { back, I, torque: k * I, pIn: V * I, pMech: back * I, pHeat: I * I * R };
}

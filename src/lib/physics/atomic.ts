import { C } from './constants';

/** Rydberg equation 1/λ = R (1/nf² − 1/ni²); returns λ in metres. Requires ni > nf ≥ 1. */
export function rydbergWavelength(nf: number, ni: number, R: number = C.R) {
  if (!(Number.isInteger(nf) && Number.isInteger(ni) && nf >= 1 && ni > nf)) {
    throw new RangeError('Need integers with ni > nf ≥ 1');
  }
  return 1 / (R * (1 / (nf * nf) - 1 / (ni * ni)));
}

/** Bohr energy level for hydrogen (eV): E_n = −13.6/n² (Bohr model; not on the NESA formula sheet). */
export const bohrEnergyEV = (n: number) => -13.6 / (n * n);

/** Photon energy (J) for a transition, via E = hc/λ with λ from Rydberg (keeps data-sheet consistency). */
export const transitionEnergyJ = (nf: number, ni: number) => (C.h * C.c) / rydbergWavelength(nf, ni);

export const SERIES: Record<number, string> = { 1: 'Lyman (UV)', 2: 'Balmer (visible/near-UV)', 3: 'Paschen (IR)', 4: 'Brackett (IR)', 5: 'Pfund (IR)' };

/** de Broglie wavelength λ = h / (m v) */
export const deBroglie = (m: number, v: number) => C.h / (m * v);
/** Electron accelerated from rest through V volts (non-relativistic): λ = h / √(2 m e V) */
export const electronWavelengthFromV = (V: number) => C.h / Math.sqrt(2 * C.me * C.e * V);
/** Heisenberg Δx Δp ≥ h/4π — supplementary (not a syllabus formula) */
export const minMomentumUncertainty = (dx: number) => C.h / (4 * Math.PI * dx);

/** Bohr radius of orbit n (m) — used for the de Broglie standing-wave picture. */
export const bohrRadius = (n: number) => 5.29e-11 * n * n;

/**
 * Hydrogen radial probability density P(r) = r²|R_nl(r)|² (r in units of a0), normalised so ∫P dr = 1.
 * Supplementary — supports the probability-cloud visual only.
 */
export function radialProbability(n: number, l: number, r: number): number {
  const e = Math.exp;
  switch (`${n}${l}`) {
    case '10':
      return 4 * r * r * e(-2 * r);
    case '20':
      return (r * r * (2 - r) ** 2 * e(-r)) / 8;
    case '21':
      return (r ** 4 * e(-r)) / 24;
    case '30': {
      const R = (2 / (3 * Math.sqrt(3))) * (1 - (2 * r) / 3 + (2 * r * r) / 27) * e(-r / 3);
      return r * r * R * R;
    }
    case '31': {
      const R = (8 / (27 * Math.sqrt(6))) * r * (1 - r / 6) * e(-r / 3);
      return r * r * R * R;
    }
    default:
      return 0;
  }
}

/**
 * Rutherford (Geiger–Marsden) scattering: integrate an alpha particle's trajectory under Coulomb
 * repulsion from a fixed gold nucleus. Units: distances in fm, energies in MeV.
 * Returns trajectory points and final deflection angle (deg).
 */
export function rutherfordTrajectory(impactParamFm: number, keMeV: number, Z = 79, startFm = 3000) {
  // k q1 q2 in MeV·fm: 1.44 MeV fm × z1 z2 (alpha z = 2)
  const kqq = 1.44 * 2 * Z;
  const mAlpha = 3727.4; // MeV/c^2; units: distance fm, time fm/c, speeds as fractions of c
  const v0 = Math.sqrt((2 * keMeV) / mAlpha); // non-relativistic
  // start far away on the incoming asymptote (correct for the potential energy there)
  let x = -startFm;
  let y = impactParamFm;
  const vStart = Math.sqrt(v0 * v0 - (2 * kqq) / (mAlpha * Math.hypot(x, y)));
  let vx = vStart;
  let vy = 0;
  const acc = (px: number, py: number) => {
    const r = Math.hypot(px, py);
    const a = kqq / (mAlpha * r * r * r);
    return [a * px, a * py];
  };
  const pts: [number, number][] = [[x, y]];
  let [ax, ay] = acc(x, y);
  for (let i = 0; i < 200000; i++) {
    const r = Math.hypot(x, y);
    const dt = (0.004 * r) / v0; // adaptive step: small near the nucleus
    // velocity Verlet
    vx += 0.5 * ax * dt;
    vy += 0.5 * ay * dt;
    x += vx * dt;
    y += vy * dt;
    [ax, ay] = acc(x, y);
    vx += 0.5 * ax * dt;
    vy += 0.5 * ay * dt;
    if (i % 3 === 0) pts.push([x, y]);
    if (Math.hypot(x, y) > startFm) break;
  }
  pts.push([x, y]);
  return { pts, deflectionDeg: (Math.atan2(vy, vx) * 180) / Math.PI };
}

/** Analytic Rutherford deflection: tan(θ/2) = k q1 q2 / (2 K b) */
export const rutherfordAngleDeg = (impactParamFm: number, keMeV: number, Z = 79) =>
  (2 * Math.atan((1.44 * 2 * Z) / (2 * keMeV * impactParamFm)) * 180) / Math.PI;

/** Distance of closest approach for a head-on collision: d = k q1 q2 / K (fm) */
export const closestApproachFm = (keMeV: number, Z = 79) => (1.44 * 2 * Z) / keMeV;

/** Thomson e/m: v = E/B (velocity selector), r = mv/(qB) → q/m = E/(B² r) */
export const thomsonChargeToMass = (E: number, B: number, r: number) => E / (B * B * r);
/** Millikan: balanced drop q E = m g → q = m g d / V */
export const millikanCharge = (m: number, V: number, d: number, g: number = C.g) => (m * g * d) / V;

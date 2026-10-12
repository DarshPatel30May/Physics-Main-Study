import { C } from './constants';

/** Decay constant λ = ln2 / t½ */
export const decayConstant = (halfLife: number) => Math.LN2 / halfLife;
export const halfLifeFromLambda = (lambda: number) => Math.LN2 / lambda;
/** N_t = N0 e^{−λt} */
export const remaining = (N0: number, lambda: number, t: number) => N0 * Math.exp(-lambda * t);
/** Time for N0 → N: t = ln(N0/N)/λ */
export const timeToDecay = (N0: number, N: number, lambda: number) => Math.log(N0 / N) / lambda;
/** Activity A = λN (Bq) — not on the formula sheet but follows from the decay law */
export const activity = (lambda: number, N: number) => lambda * N;

/** Masses of neutral atoms (u) — AME2020 atomic mass evaluation, 6 d.p. */
export const ATOMIC_MASS: Record<string, number> = {
  n: 1.008665,
  'H-1': 1.007825,
  'H-2': 2.014102,
  'H-3': 3.016049,
  'He-3': 3.016029,
  'He-4': 4.002603,
  'Li-6': 6.015123,
  'Li-7': 7.016003,
  'Be-9': 9.012183,
  'C-12': 12.0,
  'C-14': 14.003242,
  'N-14': 14.003074,
  'O-16': 15.994915,
  'Fe-56': 55.934936,
  'Kr-92': 91.926173,
  'Ba-141': 140.914403,
  'Rn-222': 222.017578,
  'Ra-226': 226.025410,
  'Th-234': 234.043601,
  'U-235': 235.043928,
  'U-238': 238.050787,
};

/** Mass of the electron in u (from data-sheet values m_e / u) */
export const ELECTRON_U = C.me / C.u;

export interface Nuclide {
  symbol: string;
  Z: number;
  A: number;
}

export function parseNuclide(key: string): Nuclide {
  if (key === 'n') return { symbol: 'n', Z: 0, A: 1 };
  const [symbol, a] = key.split('-');
  const Z = ELEMENTS.indexOf(symbol) + 1;
  return { symbol, Z, A: Number(a) };
}

/**
 * Mass defect using atomic masses: Δm = Z·m(¹H) + N·m_n − M_atom.
 * (Electron masses cancel because ¹H atoms carry Z electrons.)
 */
export function massDefectU(Z: number, A: number, atomicMassU: number) {
  const N = A - Z;
  return Z * ATOMIC_MASS['H-1'] + N * ATOMIC_MASS.n - atomicMassU;
}

/** Mass defect using bare nucleon masses (HSC-style when given nucleus mass in kg). */
export const massDefectKg = (Z: number, N: number, nucleusMassKg: number) => Z * C.mp + N * C.mn - nucleusMassKg;

export const uToMeV = (mU: number) => mU * C.uMeV;
export const kgToJ = (mKg: number) => mKg * C.c * C.c;
export const MeVToJ = (MeV: number) => MeV * 1e6 * C.eV;

export function bindingEnergy(Z: number, A: number, atomicMassU: number) {
  const dm = massDefectU(Z, A, atomicMassU);
  const MeV = uToMeV(dm);
  return { massDefectU: dm, MeV, perNucleon: MeV / A, J: MeVToJ(MeV) };
}

/** Q-value of a reaction from atomic masses (u): Q = (Σm_reactants − Σm_products) c² */
export function qValue(reactants: string[], products: string[]) {
  const sum = (l: string[]) => l.reduce((s, k) => s + (ATOMIC_MASS[k] ?? NaN), 0);
  const dm = sum(reactants) - sum(products);
  return { dmU: dm, MeV: uToMeV(dm) };
}

/**
 * Binding energy per nucleon (MeV) for selected nuclides — computed from AME2020 masses and
 * rounded to 3 d.p. (IAEA Nuclear Data Services). Used for the binding-energy curve.
 */
export const BE_PER_NUCLEON: { name: string; A: number; Z: number; be: number }[] = [
  { name: 'H-2', A: 2, Z: 1, be: 1.112 },
  { name: 'H-3', A: 3, Z: 1, be: 2.827 },
  { name: 'He-3', A: 3, Z: 2, be: 2.573 },
  { name: 'He-4', A: 4, Z: 2, be: 7.074 },
  { name: 'Li-6', A: 6, Z: 3, be: 5.332 },
  { name: 'Li-7', A: 7, Z: 3, be: 5.606 },
  { name: 'Be-9', A: 9, Z: 4, be: 6.463 },
  { name: 'B-11', A: 11, Z: 5, be: 6.928 },
  { name: 'C-12', A: 12, Z: 6, be: 7.68 },
  { name: 'N-14', A: 14, Z: 7, be: 7.476 },
  { name: 'O-16', A: 16, Z: 8, be: 7.976 },
  { name: 'Ne-20', A: 20, Z: 10, be: 8.032 },
  { name: 'Mg-24', A: 24, Z: 12, be: 8.261 },
  { name: 'Si-28', A: 28, Z: 14, be: 8.448 },
  { name: 'S-32', A: 32, Z: 16, be: 8.493 },
  { name: 'Ca-40', A: 40, Z: 20, be: 8.551 },
  { name: 'Fe-56', A: 56, Z: 26, be: 8.79 },
  { name: 'Ni-62', A: 62, Z: 28, be: 8.795 },
  { name: 'Kr-84', A: 84, Z: 36, be: 8.717 },
  { name: 'Zr-90', A: 90, Z: 40, be: 8.71 },
  { name: 'Sn-120', A: 120, Z: 50, be: 8.505 },
  { name: 'Ba-138', A: 138, Z: 56, be: 8.393 },
  { name: 'W-184', A: 184, Z: 74, be: 8.005 },
  { name: 'Au-197', A: 197, Z: 79, be: 7.916 },
  { name: 'Pb-208', A: 208, Z: 82, be: 7.868 },
  { name: 'U-235', A: 235, Z: 92, be: 7.591 },
  { name: 'U-238', A: 238, Z: 92, be: 7.57 },
];

export type DecayMode = 'alpha' | 'beta-' | 'beta+' | 'gamma' | 'stable';

export interface Isotope {
  key: string;
  name: string;
  Z: number;
  A: number;
  mode: DecayMode;
  /** half-life in seconds (Infinity for stable) */
  halfLife: number;
  halfLifeText: string;
  use: string;
}

const Y = 365.25 * 24 * 3600;
const D = 24 * 3600;

/** Half-lives from NNDC/IAEA evaluated data (rounded). */
export const ISOTOPES: Isotope[] = [
  { key: 'H-3', name: 'Tritium', Z: 1, A: 3, mode: 'beta-', halfLife: 12.32 * Y, halfLifeText: '12.3 y', use: 'Self-powered exit signs; fusion fuel research.' },
  { key: 'C-12', name: 'Carbon-12', Z: 6, A: 12, mode: 'stable', halfLife: Infinity, halfLifeText: 'stable', use: 'Defines the unified atomic mass unit.' },
  { key: 'C-14', name: 'Carbon-14', Z: 6, A: 14, mode: 'beta-', halfLife: 5730 * Y, halfLifeText: '5730 y', use: 'Radiocarbon dating of once-living material.' },
  { key: 'F-18', name: 'Fluorine-18', Z: 9, A: 18, mode: 'beta+', halfLife: 109.8 * 60, halfLifeText: '110 min', use: 'PET imaging tracer (FDG).' },
  { key: 'Na-22', name: 'Sodium-22', Z: 11, A: 22, mode: 'beta+', halfLife: 2.6 * Y, halfLifeText: '2.6 y', use: 'Positron source for laboratory studies.' },
  { key: 'P-32', name: 'Phosphorus-32', Z: 15, A: 32, mode: 'beta-', halfLife: 14.3 * D, halfLifeText: '14.3 d', use: 'Biochemical tracer.' },
  { key: 'K-40', name: 'Potassium-40', Z: 19, A: 40, mode: 'beta-', halfLife: 1.25e9 * Y, halfLifeText: '1.25 × 10⁹ y', use: 'Potassium–argon dating; natural radioactivity in bananas and the body.' },
  { key: 'Fe-56', name: 'Iron-56', Z: 26, A: 56, mode: 'stable', halfLife: Infinity, halfLifeText: 'stable', use: 'Near the peak of the binding-energy curve.' },
  { key: 'Co-60', name: 'Cobalt-60', Z: 27, A: 60, mode: 'beta-', halfLife: 5.27 * Y, halfLifeText: '5.27 y', use: 'Gamma source (after β⁻ decay) for radiotherapy and sterilisation.' },
  { key: 'Sr-90', name: 'Strontium-90', Z: 38, A: 90, mode: 'beta-', halfLife: 28.8 * Y, halfLifeText: '28.8 y', use: 'Fission product; thickness gauges.' },
  { key: 'Tc-99m', name: 'Technetium-99m', Z: 43, A: 99, mode: 'gamma', halfLife: 6.01 * 3600, halfLifeText: '6.0 h', use: 'Most widely used medical imaging isotope (ANSTO produces Mo-99/Tc-99m).' },
  { key: 'I-131', name: 'Iodine-131', Z: 53, A: 131, mode: 'beta-', halfLife: 8.02 * D, halfLifeText: '8.02 d', use: 'Thyroid treatment.' },
  { key: 'Cs-137', name: 'Caesium-137', Z: 55, A: 137, mode: 'beta-', halfLife: 30.1 * Y, halfLifeText: '30.1 y', use: 'Fission product; industrial gauges.' },
  { key: 'Pb-208', name: 'Lead-208', Z: 82, A: 208, mode: 'stable', halfLife: Infinity, halfLifeText: 'stable', use: 'End point of the thorium decay series.' },
  { key: 'Po-210', name: 'Polonium-210', Z: 84, A: 210, mode: 'alpha', halfLife: 138.4 * D, halfLifeText: '138 d', use: 'Alpha emitter studied in early radioactivity research.' },
  { key: 'Rn-222', name: 'Radon-222', Z: 86, A: 222, mode: 'alpha', halfLife: 3.82 * D, halfLifeText: '3.82 d', use: 'Natural radioactive gas from uranium decay.' },
  { key: 'Ra-226', name: 'Radium-226', Z: 88, A: 226, mode: 'alpha', halfLife: 1600 * Y, halfLifeText: '1600 y', use: 'Historic radiation source studied by the Curies.' },
  { key: 'Th-234', name: 'Thorium-234', Z: 90, A: 234, mode: 'beta-', halfLife: 24.1 * D, halfLifeText: '24.1 d', use: 'Daughter of U-238 alpha decay.' },
  { key: 'U-235', name: 'Uranium-235', Z: 92, A: 235, mode: 'alpha', halfLife: 7.04e8 * Y, halfLifeText: '7.04 × 10⁸ y', use: 'Fissile with slow neutrons — nuclear reactor fuel.' },
  { key: 'U-238', name: 'Uranium-238', Z: 92, A: 238, mode: 'alpha', halfLife: 4.468e9 * Y, halfLifeText: '4.47 × 10⁹ y', use: 'Most abundant uranium isotope; radiometric dating of rocks.' },
  { key: 'Am-241', name: 'Americium-241', Z: 95, A: 241, mode: 'alpha', halfLife: 432.2 * Y, halfLifeText: '432 y', use: 'Smoke detectors (sealed source).' },
];

export const ELEMENTS = [
  'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca',
  'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr', 'Rb', 'Sr', 'Y', 'Zr',
  'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn', 'Sb', 'Te', 'I', 'Xe', 'Cs', 'Ba', 'La', 'Ce', 'Pr', 'Nd',
  'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb', 'Lu', 'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg',
  'Tl', 'Pb', 'Bi', 'Po', 'At', 'Rn', 'Fr', 'Ra', 'Ac', 'Th', 'Pa', 'U', 'Np', 'Pu', 'Am', 'Cm',
];

/** Daughter nuclide after a decay (conserving A and charge). */
export function daughter(Z: number, A: number, mode: DecayMode): { Z: number; A: number } {
  switch (mode) {
    case 'alpha':
      return { Z: Z - 2, A: A - 4 };
    case 'beta-':
      return { Z: Z + 1, A };
    case 'beta+':
      return { Z: Z - 1, A };
    default:
      return { Z, A };
  }
}

/**
 * Approximate line of beta stability from the semi-empirical mass formula:
 * Z_stable ≈ A / (1.98 + 0.0155 A^{2/3}). A smooth approximation, not exact data.
 */
export const stableZ = (A: number) => A / (1.98 + 0.0155 * Math.pow(A, 2 / 3));

/**
 * Deterministic seeded PRNG (mulberry32) so decay simulations are reproducible.
 */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stochastic decay: each undecayed nucleus decays in step dt with probability 1 − e^{−λ dt}. */
export function stochasticDecayStep(alive: boolean[], lambda: number, dt: number, rand: () => number) {
  const p = 1 - Math.exp(-lambda * dt);
  let decays = 0;
  for (let i = 0; i < alive.length; i++) {
    if (alive[i] && rand() < p) {
      alive[i] = false;
      decays++;
    }
  }
  return decays;
}

/** Check conservation of nucleon number (A) and charge (Z) in a nuclear equation. */
export interface Particle {
  label: string;
  Z: number;
  A: number;
}
export function checkConservation(left: Particle[], right: Particle[]) {
  const s = (l: Particle[], k: 'Z' | 'A') => l.reduce((t, p) => t + p[k], 0);
  return { A: s(left, 'A') === s(right, 'A'), Z: s(left, 'Z') === s(right, 'Z'), AL: s(left, 'A'), AR: s(right, 'A'), ZL: s(left, 'Z'), ZR: s(right, 'Z') };
}

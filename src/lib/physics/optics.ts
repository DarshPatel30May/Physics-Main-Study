import { C, rad } from './constants';

export const waveSpeed = (f: number, lambda: number) => f * lambda;
export const photonEnergyFromF = (f: number) => C.h * f;
export const photonEnergyFromLambda = (lambda: number) => (C.h * C.c) / lambda;
export const joulesToEV = (J: number) => J / C.eV;

/* ----------------------- Interference & diffraction ----------------------- */

/** Fringe spacing (small-angle approximation): Δy = λL/d */
export const fringeSpacing = (lambda: number, L: number, d: number) => (lambda * L) / d;
/** Angle (deg) of the m-th bright fringe/principal maximum d sinθ = mλ, or NaN if |mλ/d| > 1 */
export const brightAngleDeg = (m: number, lambda: number, d: number) => {
  const s = (m * lambda) / d;
  return Math.abs(s) > 1 ? NaN : (Math.asin(s) * 180) / Math.PI;
};
/** Dark fringe (double slit): d sinθ = (m + ½)λ */
export const darkAngleDeg = (m: number, lambda: number, d: number) => {
  const s = ((m + 0.5) * lambda) / d;
  return Math.abs(s) > 1 ? NaN : (Math.asin(s) * 180) / Math.PI;
};
/** Highest order that can physically exist: m ≤ d/λ */
export const maxOrder = (lambda: number, d: number) => Math.floor(d / lambda + 1e-12);

const sinc = (x: number) => (Math.abs(x) < 1e-9 ? 1 : Math.sin(x) / x);

/** Single-slit (Fraunhofer) intensity relative to centre: I/I0 = sinc²(π a sinθ / λ) — supplementary */
export const singleSlitIntensity = (thetaRad: number, a: number, lambda: number) => {
  const beta = (Math.PI * a * Math.sin(thetaRad)) / lambda;
  return sinc(beta) ** 2;
};
/** Single-slit minima: a sinθ = mλ (m = ±1, ±2 …) */
export const singleSlitMinAngleDeg = (m: number, a: number, lambda: number) => {
  const s = (m * lambda) / a;
  return Math.abs(s) > 1 ? NaN : (Math.asin(s) * 180) / Math.PI;
};

/**
 * Double-slit intensity including single-slit envelope (slit width a, separation d):
 * I/I0 = cos²(π d sinθ / λ) · sinc²(π a sinθ / λ)
 */
export const doubleSlitIntensity = (thetaRad: number, d: number, lambda: number, a = 0) => {
  const phase = (Math.PI * d * Math.sin(thetaRad)) / lambda;
  const env = a > 0 ? singleSlitIntensity(thetaRad, a, lambda) : 1;
  return Math.cos(phase) ** 2 * env;
};

/** N-slit grating intensity relative to principal maximum: [sin(Nφ)/(N sinφ)]², φ = π d sinθ / λ */
export const gratingIntensity = (thetaRad: number, d: number, lambda: number, N: number) => {
  const phi = (Math.PI * d * Math.sin(thetaRad)) / lambda;
  const s = Math.sin(phi);
  if (Math.abs(s) < 1e-9) return 1;
  return (Math.sin(N * phi) / (N * s)) ** 2;
};

/** Path difference to a screen point (exact geometry). */
export function pathDifference(d: number, L: number, y: number) {
  const r1 = Math.hypot(L, y - d / 2);
  const r2 = Math.hypot(L, y + d / 2);
  return r2 - r1;
}

/** Malus' law I = Imax cos²θ */
export const malus = (Imax: number, angleDeg: number) => Imax * Math.cos(rad(angleDeg)) ** 2;

/* ----------------------- Blackbody ----------------------- */
/** Wien's law λmax = b / T */
export const wienPeak = (T: number) => C.b / T;
export const wienTemp = (lambdaMax: number) => C.b / lambdaMax;
/** Planck spectral radiance B_λ(λ,T) (W sr^-1 m^-3) — supplementary, uses CODATA k_B */
export function planck(lambda: number, T: number) {
  const a = (2 * C.h * C.c * C.c) / Math.pow(lambda, 5);
  const x = (C.h * C.c) / (lambda * C.kB * T);
  if (x > 700) return 0;
  return a / Math.expm1(x);
}
/** Rayleigh–Jeans classical prediction B_λ = 2 c k T / λ⁴ — diverges at short λ (UV catastrophe) */
export const rayleighJeans = (lambda: number, T: number) => (2 * C.c * C.kB * T) / Math.pow(lambda, 4);

/* ----------------------- Photoelectric effect ----------------------- */
export interface PhotoelectricResult {
  photonEnergyJ: number;
  photonEnergyEV: number;
  thresholdF: number;
  emitted: boolean;
  kMaxJ: number;
  kMaxEV: number;
  stoppingV: number;
  vMax: number;
}

/** f in Hz, work function φ in eV. */
export function photoelectric(f: number, workFunctionEV: number): PhotoelectricResult {
  const phiJ = workFunctionEV * C.eV;
  const E = C.h * f;
  const k = E - phiJ;
  const emitted = k > 0;
  const kMaxJ = emitted ? k : 0;
  return {
    photonEnergyJ: E,
    photonEnergyEV: E / C.eV,
    thresholdF: phiJ / C.h,
    emitted,
    kMaxJ,
    kMaxEV: kMaxJ / C.eV,
    stoppingV: kMaxJ / C.e,
    vMax: Math.sqrt((2 * kMaxJ) / C.me),
  };
}

/**
 * Photocurrent model (qualitative, labelled as simplified): saturation current proportional to
 * photon arrival rate (intensity) when f > f0. With applied (anode) potential V:
 * - V ≥ 0: all emitted electrons collected (saturation) — idealised
 * - −V0 < V < 0: fraction reaching anode falls linearly in this simplified model
 * - V ≤ −V0: zero current
 */
export function photocurrent(f: number, workFunctionEV: number, intensity: number, V: number) {
  const r = photoelectric(f, workFunctionEV);
  if (!r.emitted) return 0;
  const Isat = intensity; // arbitrary units
  if (V >= 0) return Isat;
  if (V <= -r.stoppingV) return 0;
  return Isat * (1 + V / r.stoppingV);
}

/** Common metal work functions (eV) — representative values (CRC Handbook ranges vary with surface). */
export const METALS = [
  { name: 'Caesium', phi: 2.1 },
  { name: 'Potassium', phi: 2.3 },
  { name: 'Sodium', phi: 2.3 },
  { name: 'Calcium', phi: 2.9 },
  { name: 'Magnesium', phi: 3.7 },
  { name: 'Zinc', phi: 4.3 },
  { name: 'Copper', phi: 4.7 },
  { name: 'Platinum', phi: 5.6 },
];

/* ----------------------- EM spectrum ----------------------- */
export interface SpectrumBand {
  id: string;
  name: string;
  /** wavelength range in metres [short, long] */
  lambda: [number, number];
  colour: string;
  sources: string;
  uses: string;
  properties: string;
  example: string;
}

/** Band boundaries are conventional and approximate; neighbouring regions overlap. */
export const SPECTRUM: SpectrumBand[] = [
  {
    id: 'radio',
    name: 'Radio waves',
    lambda: [1e-1, 1e4],
    colour: '#ef4444',
    sources: 'Oscillating currents in antennas; astronomical sources such as pulsars.',
    uses: 'AM/FM broadcasting, radio astronomy (e.g. CSIRO Parkes "Murriyang"), RFID.',
    properties: 'Long wavelengths diffract around buildings and hills; low photon energy, non-ionising.',
    example: 'An FM station at 100 MHz broadcasts with λ = 3.0 m.',
  },
  {
    id: 'micro',
    name: 'Microwaves',
    lambda: [1e-3, 1e-1],
    colour: '#f97316',
    sources: 'Magnetrons, klystrons; the cosmic microwave background.',
    uses: 'Wi-Fi, mobile phones, radar, microwave ovens (2.45 GHz), satellite links.',
    properties: 'Pass through the atmosphere well; absorbed by water molecules (heating).',
    example: 'Wi-Fi at 2.4 GHz has λ ≈ 12.5 cm.',
  },
  {
    id: 'ir',
    name: 'Infrared',
    lambda: [7e-7, 1e-3],
    colour: '#eab308',
    sources: 'Warm objects — thermal radiation from bodies near room temperature peaks here.',
    uses: 'Thermal imaging, remote controls, optical-fibre communication (~1550 nm).',
    properties: 'Strongly absorbed by greenhouse gases; felt as radiant heat.',
    example: 'A human at 310 K emits most strongly near 9.3 μm (Wien’s law).',
  },
  {
    id: 'visible',
    name: 'Visible light',
    lambda: [4e-7, 7e-7],
    colour: '#22c55e',
    sources: 'The Sun (peak ≈ 500 nm), hot filaments, LEDs, atomic transitions.',
    uses: 'Vision, photography, spectroscopy, photosynthesis.',
    properties: 'The narrow band (~400–700 nm) human eyes detect; photon energy ≈ 1.8–3.1 eV.',
    example: 'Red hydrogen-alpha line: λ = 656 nm.',
  },
  {
    id: 'uv',
    name: 'Ultraviolet',
    lambda: [1e-8, 4e-7],
    colour: '#8b5cf6',
    sources: 'The Sun, mercury-vapour lamps, very hot stars.',
    uses: 'Sterilisation, fluorescence, vitamin D synthesis; the UV Index used in Australia.',
    properties: 'Higher-energy UV is ionising and damages DNA; mostly absorbed by ozone.',
    example: 'UV-B (280–315 nm) causes sunburn.',
  },
  {
    id: 'xray',
    name: 'X-rays',
    lambda: [1e-11, 1e-8],
    colour: '#3b82f6',
    sources: 'Rapidly decelerated electrons (X-ray tubes), synchrotrons such as the Australian Synchrotron.',
    uses: 'Medical imaging, CT scans, crystallography, airport security.',
    properties: 'Ionising; penetrate soft tissue but are absorbed more by bone.',
    example: 'A 0.1 nm X-ray photon has energy ≈ 12 keV.',
  },
  {
    id: 'gamma',
    name: 'Gamma rays',
    lambda: [1e-14, 1e-11],
    colour: '#06b6d4',
    sources: 'Nuclear transitions (radioactive decay), annihilation, astrophysical jets.',
    uses: 'Radiotherapy, sterilising medical equipment, PET (511 keV annihilation photons).',
    properties: 'Highest photon energy; very penetrating and strongly ionising.',
    example: 'Positron–electron annihilation gives two 511 keV photons.',
  },
];

/** Approximate sRGB colour for a visible wavelength (nm) — standard piecewise approximation for display only. */
export function wavelengthToRGB(nm: number): string {
  let r = 0;
  let g = 0;
  let b = 0;
  if (nm >= 380 && nm < 440) {
    r = -(nm - 440) / 60;
    b = 1;
  } else if (nm < 490) {
    g = (nm - 440) / 50;
    b = 1;
  } else if (nm < 510) {
    g = 1;
    b = -(nm - 510) / 20;
  } else if (nm < 580) {
    r = (nm - 510) / 70;
    g = 1;
  } else if (nm < 645) {
    r = 1;
    g = -(nm - 645) / 65;
  } else if (nm <= 780) {
    r = 1;
  }
  let f = 0;
  if (nm >= 380 && nm < 420) f = 0.3 + (0.7 * (nm - 380)) / 40;
  else if (nm >= 420 && nm <= 700) f = 1;
  else if (nm > 700 && nm <= 780) f = 0.3 + (0.7 * (780 - nm)) / 80;
  const c = (x: number) => Math.round(255 * Math.pow(x * f, 0.8));
  return `rgb(${c(r)}, ${c(g)}, ${c(b)})`;
}

/** Approximate colour of a blackbody at temperature T (K) for display (Planck integrated over rough RGB bands). */
export function blackbodyColour(T: number): string {
  const band = (l1: number, l2: number) => {
    let s = 0;
    for (let l = l1; l <= l2; l += 10) s += planck(l * 1e-9, T);
    return s;
  };
  const r = band(580, 700);
  const g = band(490, 580);
  const b = band(400, 490);
  const m = Math.max(r, g, b);
  const f = (x: number) => Math.round(255 * Math.pow(x / m, 0.6));
  return `rgb(${f(r)}, ${f(g)}, ${f(b)})`;
}

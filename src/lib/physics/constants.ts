/**
 * Physical constants.
 * Values marked `sheet` follow the NESA Physics data sheet (the values provided in the HSC
 * examination). Others come from CODATA 2018 (NIST) and are used only for supplementary
 * visualisations, never for exam-style answers.
 */
export const C = {
  /** Earth's gravitational acceleration near the surface (m s^-2) — sheet */
  g: 9.8,
  /** Universal gravitational constant (N m^2 kg^-2) — sheet */
  G: 6.67e-11,
  /** Mass of Earth (kg) — sheet */
  ME: 6.0e24,
  /** Radius of Earth (m) — sheet */
  RE: 6.371e6,
  /** Speed of light in a vacuum (m s^-1) — sheet */
  c: 3.0e8,
  /** Planck constant (J s) — sheet */
  h: 6.626e-34,
  /** Elementary charge magnitude (C) — sheet lists electron charge as -1.602e-19 C */
  e: 1.602e-19,
  /** Electron mass (kg) — sheet */
  me: 9.109e-31,
  /** Proton mass (kg) — sheet */
  mp: 1.673e-27,
  /** Neutron mass (kg) — sheet */
  mn: 1.675e-27,
  /** Unified atomic mass unit (kg) — sheet */
  u: 1.661e-27,
  /** Energy equivalent of 1 u (MeV) — sheet (931.5 MeV/c^2) */
  uMeV: 931.5,
  /** 1 electron volt in joules — sheet */
  eV: 1.602e-19,
  /** Permeability of free space (N A^-2) — sheet */
  mu0: 4 * Math.PI * 1e-7,
  /** Permittivity of free space (C^2 N^-1 m^-2) — sheet */
  eps0: 8.854e-12,
  /** Rydberg constant (m^-1) — sheet */
  R: 1.097e7,
  /** Wien's displacement constant (m K) — sheet */
  b: 2.898e-3,
  /** Speed of sound in air (m s^-1) — sheet */
  vSound: 340,
  /** Boltzmann constant (J K^-1) — CODATA, supplementary (blackbody curves only) */
  kB: 1.380649e-23,
  /** Stefan–Boltzmann constant (W m^-2 K^-4) — CODATA, supplementary */
  sigma: 5.670374e-8,
  /** Coulomb constant 1/(4 pi eps0) (N m^2 C^-2) */
  k: 1 / (4 * Math.PI * 8.854e-12),
  /** Mass of the Sun (kg) — NASA fact sheet, supplementary */
  MSun: 1.989e30,
  /** Astronomical unit (m) — IAU 2012 definition */
  AU: 1.495978707e11,
  /** Mass of the Moon (kg) — NASA fact sheet */
  MMoon: 7.35e22,
  /** Radius of the Moon (m) */
  RMoon: 1.737e6,
} as const;

export type ConstantKey = keyof typeof C;

export interface DataSheetEntry {
  name: string;
  symbol: string;
  value: string;
  key?: ConstantKey;
}

/** Display list of the examination data-sheet constants. */
export const DATA_SHEET: DataSheetEntry[] = [
  { name: 'Charge on electron', symbol: 'q_e', value: '-1.602 \\times 10^{-19}\\ \\text{C}', key: 'e' },
  { name: 'Mass of electron', symbol: 'm_e', value: '9.109 \\times 10^{-31}\\ \\text{kg}', key: 'me' },
  { name: 'Mass of neutron', symbol: 'm_n', value: '1.675 \\times 10^{-27}\\ \\text{kg}', key: 'mn' },
  { name: 'Mass of proton', symbol: 'm_p', value: '1.673 \\times 10^{-27}\\ \\text{kg}', key: 'mp' },
  { name: 'Speed of sound in air', symbol: '', value: '340\\ \\text{m s}^{-1}', key: 'vSound' },
  { name: "Earth's gravitational acceleration", symbol: 'g', value: '9.8\\ \\text{m s}^{-2}', key: 'g' },
  { name: 'Speed of light', symbol: 'c', value: '3.00 \\times 10^{8}\\ \\text{m s}^{-1}', key: 'c' },
  { name: 'Electric permittivity of free space', symbol: '\\varepsilon_0', value: '8.854 \\times 10^{-12}\\ \\text{A}^2\\text{s}^4\\text{kg}^{-1}\\text{m}^{-3}', key: 'eps0' },
  { name: 'Magnetic permeability of free space', symbol: '\\mu_0', value: '4\\pi \\times 10^{-7}\\ \\text{N A}^{-2}', key: 'mu0' },
  { name: 'Universal gravitational constant', symbol: 'G', value: '6.67 \\times 10^{-11}\\ \\text{N m}^2\\text{kg}^{-2}', key: 'G' },
  { name: 'Mass of Earth', symbol: 'M_E', value: '6.0 \\times 10^{24}\\ \\text{kg}', key: 'ME' },
  { name: 'Radius of Earth', symbol: 'r_E', value: '6.371 \\times 10^{6}\\ \\text{m}', key: 'RE' },
  { name: 'Planck constant', symbol: 'h', value: '6.626 \\times 10^{-34}\\ \\text{J s}', key: 'h' },
  { name: 'Rydberg constant', symbol: 'R', value: '1.097 \\times 10^{7}\\ \\text{m}^{-1}', key: 'R' },
  { name: 'Unified atomic mass unit', symbol: 'u', value: '1.661 \\times 10^{-27}\\ \\text{kg} = 931.5\\ \\text{MeV}/c^2', key: 'u' },
  { name: 'Electron volt', symbol: '1\\ \\text{eV}', value: '1.602 \\times 10^{-19}\\ \\text{J}', key: 'eV' },
  { name: 'Density of water', symbol: '\\rho', value: '1.00 \\times 10^{3}\\ \\text{kg m}^{-3}' },
  { name: 'Specific heat capacity of water', symbol: 'c', value: '4.18 \\times 10^{3}\\ \\text{J kg}^{-1}\\text{K}^{-1}' },
  { name: "Wien's displacement constant", symbol: 'b', value: '2.898 \\times 10^{-3}\\ \\text{m K}', key: 'b' },
];

export const deg = (rad: number) => (rad * 180) / Math.PI;
export const rad = (degrees: number) => (degrees * Math.PI) / 180;

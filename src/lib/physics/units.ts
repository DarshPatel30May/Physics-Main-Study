import { C } from './constants';

export interface UnitDef {
  id: string;
  label: string;
  /** multiply a value in this unit by `toSI` to get SI */
  toSI: number;
  /** optional offset (not needed for current quantities) */
}

export interface QuantityDef {
  id: string;
  name: string;
  si: string;
  /** dimensional formula in base SI units */
  dimensions: string;
  units: UnitDef[];
}

export const QUANTITIES: QuantityDef[] = [
  {
    id: 'length',
    name: 'Length',
    si: 'm',
    dimensions: '[L]',
    units: [
      { id: 'm', label: 'm', toSI: 1 },
      { id: 'km', label: 'km', toSI: 1e3 },
      { id: 'cm', label: 'cm', toSI: 1e-2 },
      { id: 'mm', label: 'mm', toSI: 1e-3 },
      { id: 'um', label: 'μm', toSI: 1e-6 },
      { id: 'nm', label: 'nm', toSI: 1e-9 },
      { id: 'pm', label: 'pm', toSI: 1e-12 },
      { id: 'fm', label: 'fm', toSI: 1e-15 },
      { id: 'AU', label: 'AU', toSI: C.AU },
      { id: 'ly', label: 'light-year', toSI: 9.4607e15 },
      { id: 'pc', label: 'parsec', toSI: 3.0857e16 },
    ],
  },
  {
    id: 'mass',
    name: 'Mass',
    si: 'kg',
    dimensions: '[M]',
    units: [
      { id: 'kg', label: 'kg', toSI: 1 },
      { id: 'g', label: 'g', toSI: 1e-3 },
      { id: 'mg', label: 'mg', toSI: 1e-6 },
      { id: 't', label: 'tonne', toSI: 1e3 },
      { id: 'u', label: 'u (atomic mass unit)', toSI: C.u },
    ],
  },
  {
    id: 'time',
    name: 'Time',
    si: 's',
    dimensions: '[T]',
    units: [
      { id: 's', label: 's', toSI: 1 },
      { id: 'ms', label: 'ms', toSI: 1e-3 },
      { id: 'us', label: 'μs', toSI: 1e-6 },
      { id: 'ns', label: 'ns', toSI: 1e-9 },
      { id: 'min', label: 'min', toSI: 60 },
      { id: 'h', label: 'h', toSI: 3600 },
      { id: 'd', label: 'day', toSI: 86400 },
      { id: 'y', label: 'year (365.25 d)', toSI: 365.25 * 86400 },
    ],
  },
  {
    id: 'speed',
    name: 'Speed',
    si: 'm s⁻¹',
    dimensions: '[L][T]⁻¹',
    units: [
      { id: 'mps', label: 'm/s', toSI: 1 },
      { id: 'kmh', label: 'km/h', toSI: 1 / 3.6 },
      { id: 'kms', label: 'km/s', toSI: 1e3 },
      { id: 'c', label: 'c (fraction of light speed)', toSI: C.c },
    ],
  },
  {
    id: 'angle',
    name: 'Angle',
    si: 'rad',
    dimensions: 'dimensionless',
    units: [
      { id: 'rad', label: 'rad', toSI: 1 },
      { id: 'deg', label: 'degree', toSI: Math.PI / 180 },
      { id: 'rev', label: 'revolution', toSI: 2 * Math.PI },
    ],
  },
  {
    id: 'energy',
    name: 'Energy',
    si: 'J',
    dimensions: '[M][L]²[T]⁻²',
    units: [
      { id: 'J', label: 'J', toSI: 1 },
      { id: 'kJ', label: 'kJ', toSI: 1e3 },
      { id: 'MJ', label: 'MJ', toSI: 1e6 },
      { id: 'eV', label: 'eV', toSI: C.eV },
      { id: 'keV', label: 'keV', toSI: 1e3 * C.eV },
      { id: 'MeV', label: 'MeV', toSI: 1e6 * C.eV },
      { id: 'kWh', label: 'kWh', toSI: 3.6e6 },
    ],
  },
  {
    id: 'frequency',
    name: 'Frequency',
    si: 'Hz',
    dimensions: '[T]⁻¹',
    units: [
      { id: 'Hz', label: 'Hz', toSI: 1 },
      { id: 'kHz', label: 'kHz', toSI: 1e3 },
      { id: 'MHz', label: 'MHz', toSI: 1e6 },
      { id: 'GHz', label: 'GHz', toSI: 1e9 },
      { id: 'THz', label: 'THz', toSI: 1e12 },
      { id: 'rpm', label: 'rpm (rev/min)', toSI: 1 / 60 },
    ],
  },
  {
    id: 'area',
    name: 'Area',
    si: 'm²',
    dimensions: '[L]²',
    units: [
      { id: 'm2', label: 'm²', toSI: 1 },
      { id: 'cm2', label: 'cm²', toSI: 1e-4 },
      { id: 'mm2', label: 'mm²', toSI: 1e-6 },
    ],
  },
  {
    id: 'magnetic',
    name: 'Magnetic flux density',
    si: 'T',
    dimensions: '[M][T]⁻²[I]⁻¹',
    units: [
      { id: 'T', label: 'T', toSI: 1 },
      { id: 'mT', label: 'mT', toSI: 1e-3 },
      { id: 'uT', label: 'μT', toSI: 1e-6 },
      { id: 'G', label: 'gauss', toSI: 1e-4 },
    ],
  },
  {
    id: 'charge',
    name: 'Charge',
    si: 'C',
    dimensions: '[I][T]',
    units: [
      { id: 'C', label: 'C', toSI: 1 },
      { id: 'uC', label: 'μC', toSI: 1e-6 },
      { id: 'nC', label: 'nC', toSI: 1e-9 },
      { id: 'e', label: 'e (elementary charges)', toSI: C.e },
    ],
  },
];

export function convert(value: number, quantityId: string, fromId: string, toId: string) {
  const q = QUANTITIES.find((x) => x.id === quantityId);
  if (!q) throw new Error(`Unknown quantity ${quantityId}`);
  const from = q.units.find((u) => u.id === fromId);
  const to = q.units.find((u) => u.id === toId);
  if (!from || !to) throw new Error('Unknown unit');
  return (value * from.toSI) / to.toSI;
}

/** Mass ↔ energy equivalence helper (kg ↔ J, u ↔ MeV). */
export const kgToJ = (m: number) => m * C.c * C.c;
export const uToMeV = (m: number) => m * C.uMeV;

export const PREFIXES = [
  { p: 'T', name: 'tera', exp: 12 },
  { p: 'G', name: 'giga', exp: 9 },
  { p: 'M', name: 'mega', exp: 6 },
  { p: 'k', name: 'kilo', exp: 3 },
  { p: 'c', name: 'centi', exp: -2 },
  { p: 'm', name: 'milli', exp: -3 },
  { p: 'μ', name: 'micro', exp: -6 },
  { p: 'n', name: 'nano', exp: -9 },
  { p: 'p', name: 'pico', exp: -12 },
  { p: 'f', name: 'femto', exp: -15 },
];

/** Derived SI units expressed in base units — used for dimensional-analysis display. */
export const DERIVED_UNITS = [
  { unit: 'N', name: 'newton', base: 'kg m s⁻²', from: 'F = ma' },
  { unit: 'J', name: 'joule', base: 'kg m² s⁻²', from: 'W = Fs' },
  { unit: 'W', name: 'watt', base: 'kg m² s⁻³', from: 'P = W/t' },
  { unit: 'C', name: 'coulomb', base: 'A s', from: 'q = It' },
  { unit: 'V', name: 'volt', base: 'kg m² s⁻³ A⁻¹', from: 'V = W/q' },
  { unit: 'T', name: 'tesla', base: 'kg s⁻² A⁻¹', from: 'F = qvB' },
  { unit: 'Wb', name: 'weber', base: 'kg m² s⁻² A⁻¹', from: 'Φ = BA' },
  { unit: 'Hz', name: 'hertz', base: 's⁻¹', from: 'f = 1/T' },
  { unit: 'Bq', name: 'becquerel', base: 's⁻¹', from: 'A = λN' },
  { unit: 'N m', name: 'newton metre (torque)', base: 'kg m² s⁻²', from: 'τ = rF sinθ (not written as J)' },
  { unit: 'V m⁻¹', name: 'volt per metre', base: 'N C⁻¹ = kg m s⁻³ A⁻¹', from: 'E = V/d = F/q' },
];

/* ---------- Dimensional analysis: exponent vectors [M, L, T, I, Θ] ---------- */
export type Dim = [number, number, number, number, number];
export const DIM: Record<string, Dim> = {
  m: [0, 1, 0, 0, 0],
  kg: [1, 0, 0, 0, 0],
  s: [0, 0, 1, 0, 0],
  A: [0, 0, 0, 1, 0],
  K: [0, 0, 0, 0, 1],
  N: [1, 1, -2, 0, 0],
  J: [1, 2, -2, 0, 0],
  W: [1, 2, -3, 0, 0],
  C: [0, 0, 1, 1, 0],
  V: [1, 2, -3, -1, 0],
  T: [1, 0, -2, -1, 0],
  Wb: [1, 2, -2, -1, 0],
  Hz: [0, 0, -1, 0, 0],
  'm/s': [0, 1, -1, 0, 0],
  'm/s2': [0, 1, -2, 0, 0],
};
export const dimMul = (a: Dim, b: Dim, sign = 1): Dim => a.map((x, i) => x + sign * b[i]) as Dim;
export const dimEq = (a: Dim, b: Dim) => a.every((x, i) => Math.abs(x - b[i]) < 1e-9);
export function dimToString(d: Dim) {
  const names = ['kg', 'm', 's', 'A', 'K'];
  const sup = (n: number) =>
    n === 1 ? '' : String(n).replace(/-/g, '⁻').replace(/\d/g, (c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(c)]);
  const parts = d.map((e, i) => (e === 0 ? '' : `${names[i]}${sup(e)}`)).filter(Boolean);
  return parts.length ? parts.join(' ') : 'dimensionless';
}

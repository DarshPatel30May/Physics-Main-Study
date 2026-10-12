import { describe, it, expect } from 'vitest';
import { convert, DIM, dimMul, dimEq } from '../units';
import { linearFit, flagAnomalies, percentError, sig } from '../stats';
import { C } from '../constants';

describe('unit conversion', () => {
  it('common HSC conversions', () => {
    expect(convert(72, 'speed', 'kmh', 'mps')).toBeCloseTo(20, 12);
    expect(convert(500, 'length', 'nm', 'm')).toBeCloseTo(5e-7, 20);
    expect(convert(1, 'energy', 'eV', 'J')).toBeCloseTo(C.eV, 30);
    expect(convert(1, 'energy', 'MeV', 'J')).toBeCloseTo(1.602e-13, 25);
    expect(convert(180, 'angle', 'deg', 'rad')).toBeCloseTo(Math.PI, 12);
    expect(convert(2.4, 'frequency', 'GHz', 'Hz')).toBeCloseTo(2.4e9, 0);
    expect(convert(250, 'mass', 'g', 'kg')).toBeCloseTo(0.25, 12);
  });
  it('dimensional analysis: qvB has units of newtons; BA has units of Wb', () => {
    const qvB = dimMul(dimMul(DIM.C, DIM['m/s']), DIM.T);
    expect(dimEq(qvB, DIM.N)).toBe(true);
    expect(dimEq(dimMul(DIM.T, dimMul(DIM.m, DIM.m)), DIM.Wb)).toBe(true);
  });
});

describe('data analysis', () => {
  it('exact line fit', () => {
    const f = linearFit([1, 2, 3, 4], [3, 5, 7, 9])!;
    expect(f.m).toBeCloseTo(2, 12);
    expect(f.c).toBeCloseTo(1, 12);
    expect(f.r2).toBeCloseTo(1, 12);
  });
  it('flags but does not remove an anomaly', () => {
    const xs = [1, 2, 3, 4, 5, 6, 7];
    const ys = [2.1, 3.9, 6.05, 8.0, 15, 12.1, 13.95];
    const flags = flagAnomalies(xs, ys);
    expect(flags[4]).toBe(true);
    expect(flags.filter(Boolean).length).toBe(1);
    expect(ys.length).toBe(7);
  });
  it('percent error and formatting', () => {
    expect(percentError(9.6, 9.8)).toBeCloseTo(2.04, 2);
    expect(sig(0.000123, 3)).toBe('1.23 × 10⁻⁴');
    expect(sig(-4.6, 2)).toBe('−4.6');
  });
});

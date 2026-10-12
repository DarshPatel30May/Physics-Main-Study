import { describe, it, expect } from 'vitest';
import {
  fringeSpacing, brightAngleDeg, darkAngleDeg, maxOrder, singleSlitIntensity, singleSlitMinAngleDeg,
  doubleSlitIntensity, gratingIntensity, pathDifference, malus, wienPeak, planck, photoelectric, photocurrent,
  photonEnergyFromLambda, SPECTRUM, rayleighJeans,
} from '../optics';
import { C } from '../constants';

describe('interference and diffraction', () => {
  it('fringe spacing λL/d', () => {
    expect(fringeSpacing(550e-9, 2, 0.25e-3)).toBeCloseTo(4.4e-3, 12);
  });
  it('grating maxima and impossible orders', () => {
    const d = 1 / 600e3;
    expect(brightAngleDeg(2, 500e-9, d)).toBeCloseTo(36.87, 2);
    expect(maxOrder(500e-9, d)).toBe(3);
    expect(brightAngleDeg(4, 500e-9, d)).toBeNaN();
  });
  it('double-slit intensity: maxima at bright angles, zeros at dark angles', () => {
    const d = 5e-6, l = 600e-9;
    const b = (brightAngleDeg(1, l, d) * Math.PI) / 180;
    const k = (darkAngleDeg(0, l, d) * Math.PI) / 180;
    expect(doubleSlitIntensity(b, d, l)).toBeCloseTo(1, 9);
    expect(doubleSlitIntensity(k, d, l)).toBeCloseTo(0, 9);
  });
  it('exact path difference ≈ d sinθ for distant screens', () => {
    const d = 1e-4, L = 2, y = 0.01;
    expect(pathDifference(d, L, y)).toBeCloseTo(d * Math.sin(Math.atan(y / L)), 9);
  });
  it('single slit: zero at a sinθ = λ, central max = 1', () => {
    const a = 2e-6, l = 500e-9;
    expect(singleSlitIntensity(0, a, l)).toBe(1);
    const t1 = (singleSlitMinAngleDeg(1, a, l) * Math.PI) / 180;
    expect(singleSlitIntensity(t1, a, l)).toBeCloseTo(0, 9);
  });
  it('grating intensity: principal maxima = 1', () => {
    const d = 2e-6, l = 500e-9;
    const t = (brightAngleDeg(1, l, d) * Math.PI) / 180;
    expect(gratingIntensity(t, d, l, 50)).toBeCloseTo(1, 6);
  });
  it("Malus' law", () => {
    expect(malus(100, 60)).toBeCloseTo(25, 9);
    expect(malus(100, 90)).toBeCloseTo(0, 9);
  });
});

describe('blackbody', () => {
  it('Sun (5772 K) peaks near 502 nm', () => {
    expect(wienPeak(5772) * 1e9).toBeCloseTo(502, 0);
  });
  it('numerical Planck peak agrees with Wien within 0.5%', () => {
    const T = 4000;
    let best = 0, bestL = 0;
    for (let l = 100e-9; l < 3000e-9; l += 0.5e-9) {
      const B = planck(l, T);
      if (B > best) { best = B; bestL = l; }
    }
    expect(Math.abs(bestL - wienPeak(T)) / wienPeak(T)).toBeLessThan(0.005);
  });
  it('Rayleigh–Jeans agrees at long wavelength but diverges at short', () => {
    expect(rayleighJeans(1e-3, 3000) / planck(1e-3, 3000)).toBeCloseTo(1, 1);
    expect(rayleighJeans(200e-9, 3000) / planck(200e-9, 3000)).toBeGreaterThan(1e6);
  });
});

describe('photoelectric effect', () => {
  it('no emission below threshold regardless of intensity', () => {
    const r = photoelectric(4e14, 2.3);
    expect(r.emitted).toBe(false);
    expect(r.kMaxJ).toBe(0);
    expect(photocurrent(4e14, 2.3, 100, 0)).toBe(0);
  });
  it('K_max = hf − φ and V0 = K/e', () => {
    const r = photoelectric(6e14, 2.1);
    expect(r.kMaxEV).toBeCloseTo((C.h * 6e14) / C.eV - 2.1, 9);
    expect(r.stoppingV).toBeCloseTo(r.kMaxEV, 9);
    expect(r.thresholdF).toBeCloseTo((2.1 * C.eV) / C.h, 0);
  });
  it('intensity raises current, not K_max', () => {
    expect(photocurrent(8e14, 2.1, 2, 0)).toBe(2 * photocurrent(8e14, 2.1, 1, 0));
    expect(photocurrent(8e14, 2.1, 5, -photoelectric(8e14, 2.1).stoppingV)).toBe(0);
  });
});

describe('EM spectrum data', () => {
  it('bands are ordered by wavelength and visible is 400–700 nm', () => {
    const vis = SPECTRUM.find((b) => b.id === 'visible')!;
    expect(vis.lambda).toEqual([4e-7, 7e-7]);
    for (let i = 1; i < SPECTRUM.length; i++) expect(SPECTRUM[i].lambda[0]).toBeLessThan(SPECTRUM[i - 1].lambda[0]);
  });
  it('visible photon energies ≈ 1.8–3.1 eV', () => {
    expect(photonEnergyFromLambda(700e-9) / C.eV).toBeCloseTo(1.77, 1);
    expect(photonEnergyFromLambda(400e-9) / C.eV).toBeCloseTo(3.1, 1);
  });
});

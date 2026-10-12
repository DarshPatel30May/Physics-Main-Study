import { describe, it, expect } from 'vitest';
import {
  lorentz, borisStep, cyclotronRadius, cyclotronPeriod, plateDeflection, fieldBetweenPlates, speedFromPD,
  forceOnConductor, parallelWireForcePerLength, wireField, solenoidField, coilTorque, flux, inducedEmf,
  idealTransformer, transmissionLoss, emfFromFlux, dipoleFluxThroughLoop, generatorEmf, dcMotor, selectorSpeed,
  type Vec3,
} from '../electromagnetism';
import { C } from '../constants';

describe('force directions (sign of charge matters)', () => {
  it('positive charge moving +x in B out of page (+z) is pushed −y', () => {
    const F = lorentz(1, [1, 0, 0], [0, 0, 0], [0, 0, 1]);
    expect(F).toEqual([0, -1, 0].map((x) => x + 0) as Vec3);
  });
  it('electron in the same situation is pushed +y (opposite)', () => {
    const F = lorentz(-1, [1, 0, 0], [0, 0, 0], [0, 0, 1]);
    expect(F[1]).toBe(1);
  });
  it('negative charge is pushed opposite to E', () => {
    const F = lorentz(-C.e, [0, 0, 0], [0, 1000, 0], [0, 0, 0]);
    expect(F[1]).toBeLessThan(0);
  });
  it('velocity parallel to B gives no magnetic force', () => {
    const F = lorentz(C.e, [0, 0, 5], [0, 0, 0], [0, 0, 1]);
    expect(Math.hypot(...F)).toBe(0);
  });
});

describe('charged particles in fields', () => {
  it('Boris integrator reproduces r = mv/qB and conserves speed in pure B', () => {
    const m = C.me, q = -C.e, B = 1e-3, v = 1e6;
    const r = cyclotronRadius(m, v, q, B);
    const T = cyclotronPeriod(m, q, B);
    let pos: Vec3 = [0, 0, 0];
    let vel: Vec3 = [v, 0, 0];
    let maxDist = 0;
    const n = 2000;
    for (let i = 0; i < n; i++) {
      ({ pos, vel } = borisStep(pos, vel, q / m, [0, 0, 0], [0, 0, B], T / n));
      maxDist = Math.max(maxDist, Math.hypot(pos[0], pos[1]));
      expect(Math.hypot(...vel)).toBeCloseTo(v, 3);
    }
    expect(Math.abs(maxDist - 2 * r) / (2 * r)).toBeLessThan(1e-3);
    // returns to start after one period
    expect(Math.hypot(pos[0], pos[1]) / r).toBeLessThan(1e-2);
  });
  it('velocity selector: balanced particle goes straight', () => {
    const E = 2e4, B = 0.01;
    const v = selectorSpeed(E, B);
    let pos: Vec3 = [0, 0, 0];
    let vel: Vec3 = [v, 0, 0];
    // E along +y, B along +z: qE (+y) and q v×B = q v(x̂×ẑ) = −y → cancel
    for (let i = 0; i < 1000; i++) ({ pos, vel } = borisStep(pos, vel, C.e / C.mp, [0, E, 0], [0, 0, B], 1e-9));
    expect(Math.abs(pos[1])).toBeLessThan(1e-9);
  });
  it('parallel plates: E = V/d and parabolic deflection', () => {
    expect(fieldBetweenPlates(100, 0.02)).toBe(5000);
    const d = plateDeflection(-C.e, C.me, 5000, 1e7, 0.05);
    expect(d.ay).toBeLessThan(0);
    expect(d.dy).toBeCloseTo(0.5 * d.ay * (0.05 / 1e7) ** 2, 12);
  });
  it('speed from p.d.: electron through 100 V ≈ 5.93 × 10⁶ m/s', () => {
    expect(speedFromPD(C.e, 100, C.me) / 5.93e6).toBeCloseTo(1, 2);
  });
});

describe('conductors and motors', () => {
  it('F = lIB sinθ: max at 90°, zero at 0°', () => {
    expect(forceOnConductor(0.5, 3, 0.2, 90)).toBeCloseTo(0.3, 12);
    expect(forceOnConductor(0.5, 3, 0.2, 0)).toBeCloseTo(0, 12);
  });
  it('ampere definition (pre-2019): 1 A, 1 m → 2 × 10⁻⁷ N/m', () => {
    expect(parallelWireForcePerLength(1, 1, 1)).toBeCloseTo(2e-7, 18);
  });
  it('wire and solenoid fields', () => {
    expect(wireField(10, 0.05)).toBeCloseTo(4e-5, 15);
    expect(solenoidField(400, 3, 0.2)).toBeCloseTo(7.54e-3, 5);
  });
  it('coil torque: max when plane ∥ B (normal ⟂ B)', () => {
    expect(coilTorque(100, 1.5, 2e-3, 0.25, 90)).toBeCloseTo(0.075, 12);
    expect(coilTorque(100, 1.5, 2e-3, 0.25, 0)).toBeCloseTo(0, 12);
  });
  it('DC motor: back emf reduces current as speed rises; power balance', () => {
    const slow = dcMotor(12, 2, 0.05, 0);
    const fast = dcMotor(12, 2, 0.05, 200);
    expect(slow.I).toBe(6);
    expect(fast.I).toBe(1);
    expect(fast.pIn).toBeCloseTo(fast.pMech + fast.pHeat, 12);
  });
});

describe('induction and transformers', () => {
  it('flux and Faraday', () => {
    expect(flux(0.4, 0.01, 60)).toBeCloseTo(2e-3, 12);
    expect(inducedEmf(200, -5e-3, 0.05)).toBeCloseTo(20, 12);
  });
  it('numerical emf from a linear flux ramp is constant = −N dΦ/dt', () => {
    const phi = Array.from({ length: 50 }, (_, i) => 0.002 * i); // dΦ/dt = 0.2 Wb/s with dt = 0.01
    const emf = emfFromFlux(phi, 0.01, 10);
    emf.forEach((e) => expect(e).toBeCloseTo(-2, 9));
  });
  it('generator emf leads flux by 90° (zero emf at maximum flux)', () => {
    expect(generatorEmf(100, 0.5, 0.01, 100, 0)).toBeCloseTo(0, 12);
    expect(generatorEmf(100, 0.5, 0.01, 100, Math.PI / 200)).toBeCloseTo(50, 9);
  });
  it('dipole flux is symmetric and peaks at the coil', () => {
    const a = 0.03;
    expect(dipoleFluxThroughLoop(1, a, 0.05)).toBeCloseTo(dipoleFluxThroughLoop(1, a, -0.05), 15);
    expect(dipoleFluxThroughLoop(1, a, 0)).toBeGreaterThan(dipoleFluxThroughLoop(1, a, 0.01));
  });
  it('ideal transformer', () => {
    const t = idealTransformer(240, 1000, 50, 0.5);
    expect(t.Vs).toBe(12);
    expect(t.Is).toBe(10);
    expect(t.type).toBe('step-down');
  });
  it('transmission at higher voltage reduces loss by V² ratio', () => {
    const lo = transmissionLoss(1e6, 11e3, 5);
    const hi = transmissionLoss(1e6, 330e3, 5);
    expect(lo.loss / hi.loss).toBeCloseTo(900, 6);
  });
});

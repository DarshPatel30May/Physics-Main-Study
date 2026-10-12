import { describe, it, expect } from 'vitest';
import {
  projectile, levelRange, levelTimeOfFlight, levelMaxHeight, circular, bankedDesignSpeed, bankedForces,
  conicalPendulum, torque, gravForce, fieldStrength, orbitalSpeed, orbitalPeriod, radiusFromPeriod, escapeSpeed,
  gravPE, orbitalKE, orbitalTotalE, orbitTransferEnergy, geostationaryRadius, orbitStep, orbitElements, PLANETS,
  projectileWithDrag, flatBendMaxSpeed,
} from '../mechanics';
import { C } from '../constants';

const rel = (a: number, b: number) => Math.abs(a - b) / Math.max(Math.abs(b), 1e-30);

describe('projectile motion', () => {
  it('matches level-ground analytic results (u = 20 m/s, 30°)', () => {
    const p = projectile({ u: 20, angleDeg: 30, h0: 0, g: 9.8 });
    expect(p.tFlight).toBeCloseTo(2.0408, 3);
    expect(p.range).toBeCloseTo((400 * Math.sin(Math.PI / 3)) / 9.8, 6);
    expect(p.maxHeight).toBeCloseTo(100 / 19.6, 6);
    expect(p.range).toBeCloseTo(levelRange(20, 30), 9);
    expect(p.tFlight).toBeCloseTo(levelTimeOfFlight(20, 30), 9);
    expect(p.maxHeight).toBeCloseTo(levelMaxHeight(20, 30), 9);
    // symmetric: lands at same speed, mirrored angle
    expect(p.vFinal).toBeCloseTo(20, 9);
    expect(p.finalDirDeg).toBeCloseTo(-30, 9);
  });

  it('handles a horizontal launch from a height (unequal heights)', () => {
    const p = projectile({ u: 10, angleDeg: 0, h0: 20, g: 9.8 });
    const t = Math.sqrt(40 / 9.8);
    expect(p.tFlight).toBeCloseTo(t, 9);
    expect(p.range).toBeCloseTo(10 * t, 9);
    expect(p.maxHeight).toBe(20);
    expect(p.vFinal).toBeCloseTo(Math.sqrt(100 + 2 * 9.8 * 20), 9);
    // special-case formula would wrongly predict zero range here
    expect(levelRange(10, 0)).toBeCloseTo(0, 9);
  });

  it('launched upward from a height: lands later than level case', () => {
    const p = projectile({ u: 15, angleDeg: 40, h0: 10, g: 9.8 });
    expect(p.at(p.tFlight).y).toBeCloseTo(0, 9);
    expect(p.tFlight).toBeGreaterThan(levelTimeOfFlight(15, 40));
  });

  it('conserves mechanical energy along the path and keeps vx constant', () => {
    const p = projectile({ u: 25, angleDeg: 55, h0: 3, g: 9.8 });
    const e0 = 0.5 * 25 * 25 + 9.8 * 3;
    for (let i = 0; i <= 20; i++) {
      const s = p.at((i / 20) * p.tFlight);
      expect(0.5 * s.v * s.v + 9.8 * s.y).toBeCloseTo(e0, 8);
      expect(s.vx).toBeCloseTo(p.ux, 12);
      expect(s.ay).toBe(-9.8);
    }
  });

  it('maximum range on level ground is at 45° and complementary angles match', () => {
    expect(levelRange(20, 30)).toBeCloseTo(levelRange(20, 60), 9);
    expect(levelRange(20, 45)).toBeGreaterThan(levelRange(20, 44));
    expect(levelRange(20, 45)).toBeGreaterThan(levelRange(20, 46));
  });

  it('rejects invalid input', () => {
    expect(() => projectile({ u: 10, angleDeg: 30, h0: 0, g: 0 })).toThrow();
    expect(() => projectile({ u: -1, angleDeg: 30, h0: 0, g: 9.8 })).toThrow();
    expect(() => projectile({ u: 1, angleDeg: 30, h0: -2, g: 9.8 })).toThrow();
  });

  it('air drag shortens the range (qualitative model)', () => {
    const pts = projectileWithDrag({ u: 20, angleDeg: 45, h0: 0, g: 9.8 }, 0.1);
    expect(pts[pts.length - 1].x).toBeLessThan(levelRange(20, 45));
  });
});

describe('circular motion', () => {
  it('computes centripetal quantities', () => {
    const c = circular(2, 4, 2);
    expect(c.ac).toBe(8);
    expect(c.Fc).toBe(16);
    expect(c.omega).toBe(2);
    expect(c.T).toBeCloseTo(Math.PI, 12);
    expect(c.f).toBeCloseTo(1 / Math.PI, 12);
  });
  it('banked track needs no friction at the design speed', () => {
    const v = bankedDesignSpeed(80, 20);
    const f = bankedForces(1000, v, 80, 20);
    expect(f.f).toBeCloseTo(0, 6);
    // faster than design: friction must act down the slope (positive)
    expect(bankedForces(1000, v + 5, 80, 20).f).toBeGreaterThan(0);
    expect(bankedForces(1000, v - 5, 80, 20).f).toBeLessThan(0);
  });
  it('flat bend friction limit', () => {
    expect(flatBendMaxSpeed(0.5, 40)).toBeCloseTo(Math.sqrt(0.5 * 9.8 * 40), 12);
  });
  it('conical pendulum: tension components balance weight and give F_c', () => {
    const p = conicalPendulum(0.5, 1.2, 30);
    expect(p.tension * Math.cos(Math.PI / 6)).toBeCloseTo(0.5 * 9.8, 9);
    expect(p.Fc).toBeCloseTo((0.5 * p.v * p.v) / p.r, 9);
  });
  it('torque = rF sinθ', () => {
    expect(torque(0.3, 50, 90)).toBeCloseTo(15, 12);
    expect(torque(0.3, 50, 0)).toBeCloseTo(0, 12);
    expect(torque(0.3, 50, 30)).toBeCloseTo(7.5, 12);
  });
});

describe('gravitation', () => {
  it('surface g of Earth from data-sheet values ≈ 9.86 N/kg', () => {
    expect(fieldStrength(C.ME, C.RE)).toBeCloseTo(9.86, 2);
    expect(gravForce(C.ME, 1, C.RE)).toBeCloseTo(fieldStrength(C.ME, C.RE), 12);
  });
  it('inverse-square: doubling r quarters F', () => {
    expect(gravForce(1e24, 1e3, 2e7) / gravForce(1e24, 1e3, 1e7)).toBeCloseTo(0.25, 12);
  });
  it('orbital speed, period and Kepler III are consistent', () => {
    const r = 7e6;
    const v = orbitalSpeed(C.ME, r);
    const T = orbitalPeriod(C.ME, r);
    expect((2 * Math.PI * r) / T).toBeCloseTo(v, 6);
    expect(radiusFromPeriod(C.ME, T)).toBeCloseTo(r, 3);
    expect(r ** 3 / T ** 2).toBeCloseTo((C.G * C.ME) / (4 * Math.PI ** 2), 0);
  });
  it('geostationary radius ≈ 4.22 × 10⁷ m', () => {
    expect(rel(geostationaryRadius(), 4.22e7)).toBeLessThan(0.005);
  });
  it('escape speed from Earth ≈ 11.2 km/s and equals √2 × orbital speed', () => {
    expect(rel(escapeSpeed(C.ME, C.RE), 1.12e4)).toBeLessThan(0.005);
    expect(escapeSpeed(C.ME, 7e6) / orbitalSpeed(C.ME, 7e6)).toBeCloseTo(Math.SQRT2, 12);
  });
  it('orbital energies: K = −U/2, E = U/2, transfer energy positive outward', () => {
    const U = gravPE(C.ME, 1000, 7e6);
    expect(orbitalKE(C.ME, 1000, 7e6)).toBeCloseTo(-U / 2, 0);
    expect(orbitalTotalE(C.ME, 1000, 7e6)).toBeCloseTo(U / 2, 0);
    expect(orbitTransferEnergy(C.ME, 1000, 7e6, 1.4e7)).toBeCloseTo(1.4295e10, -7);
  });
  it('velocity-Verlet keeps a circular orbit circular for one period', () => {
    const GM = C.G * C.ME;
    const r = 7e6;
    const v = Math.sqrt(GM / r);
    const T = 2 * Math.PI * Math.sqrt(r ** 3 / GM);
    let s = { x: r, y: 0, vx: 0, vy: v, t: 0 };
    const n = 4000;
    for (let i = 0; i < n; i++) {
      s = orbitStep(s, GM, T / n);
      expect(rel(Math.hypot(s.x, s.y), r)).toBeLessThan(1e-5);
    }
    expect(Math.hypot(s.x - r, s.y)).toBeLessThan(r * 2e-3);
  });
  it('elliptical orbit: energy conserved and elements correct', () => {
    const GM = C.G * C.ME;
    const r = 7e6;
    const v = Math.sqrt(GM / r) * 1.2; // faster than circular -> ellipse, r is perigee
    let s = { x: r, y: 0, vx: 0, vy: v, t: 0 };
    const el = orbitElements(s, GM);
    expect(el.bound).toBe(true);
    expect(el.rPeri).toBeCloseTo(r, 0);
    expect(el.e).toBeCloseTo(1.2 ** 2 - 1, 6); // e = v²r/GM − 1 at perigee
    const E0 = el.energy;
    for (let i = 0; i < 20000; i++) s = orbitStep(s, GM, el.T / 20000);
    expect(rel(orbitElements(s, GM).energy, E0)).toBeLessThan(1e-6);
  });
  it('planet data obeys Kepler III (T² ∝ a³) within 1%', () => {
    for (const p of PLANETS) expect(rel(p.T * p.T, p.a ** 3)).toBeLessThan(0.01);
  });
});

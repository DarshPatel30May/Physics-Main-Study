import { describe, it, expect } from 'vitest';
import { gamma, gammaFromBeta, betaFromGamma, dilatedTime, contractedLength, relMomentum, restEnergy, simultaneityOffset } from '../relativity';
import { rydbergWavelength, bohrEnergyEV, deBroglie, electronWavelengthFromV, radialProbability, rutherfordTrajectory, rutherfordAngleDeg, closestApproachFm, thomsonChargeToMass, millikanCharge } from '../atomic';
import {
  decayConstant, remaining, timeToDecay, bindingEnergy, ATOMIC_MASS, BE_PER_NUCLEON, qValue, daughter,
  checkConservation, stochasticDecayStep, mulberry32, stableZ, massDefectKg,
} from '../nuclear';
import { C } from '../constants';

describe('special relativity', () => {
  it('γ(0.6c) = 1.25, γ(0.8c) = 5/3', () => {
    expect(gamma(0.6 * C.c)).toBeCloseTo(1.25, 12);
    expect(gammaFromBeta(0.8)).toBeCloseTo(5 / 3, 12);
    expect(betaFromGamma(1.25)).toBeCloseTo(0.6, 12);
  });
  it('rejects v ≥ c', () => {
    expect(() => gamma(C.c)).toThrow();
    expect(() => gammaFromBeta(1)).toThrow();
  });
  it('muon example: 2.2 μs at 0.995c → ≈ 22 μs', () => {
    expect(dilatedTime(2.2e-6, 0.995 * C.c) * 1e6).toBeCloseTo(22.0, 0);
  });
  it('length contraction and momentum', () => {
    expect(contractedLength(50, 0.8 * C.c)).toBeCloseTo(30, 9);
    expect(relMomentum(C.me, 0.8 * C.c)).toBeCloseTo((C.me * 0.8 * C.c) / 0.6, 30);
    expect(restEnergy(1e-3)).toBeCloseTo(9e13, 0);
  });
  it('simultaneity offset: front event happens earlier in moving frame', () => {
    expect(simultaneityOffset(0, 1000, 0.6 * C.c)).toBeLessThan(0);
  });
});

describe('atomic physics', () => {
  it('Balmer H-alpha ≈ 656 nm, H-beta ≈ 486 nm', () => {
    expect(rydbergWavelength(2, 3) * 1e9).toBeCloseTo(656.3, 0);
    expect(rydbergWavelength(2, 4) * 1e9).toBeCloseTo(486.2, 0);
    expect(() => rydbergWavelength(3, 2)).toThrow();
  });
  it('Rydberg photon energy matches Bohr level difference within 0.5%', () => {
    const fromR = (C.h * C.c) / rydbergWavelength(2, 3) / C.eV;
    const fromBohr = bohrEnergyEV(3) - bohrEnergyEV(2);
    expect(Math.abs(fromR - fromBohr) / fromBohr).toBeLessThan(0.005);
  });
  it('electron through 100 V has λ ≈ 0.123 nm (both routes agree)', () => {
    const v = Math.sqrt((2 * C.e * 100) / C.me);
    expect(deBroglie(C.me, v)).toBeCloseTo(electronWavelengthFromV(100), 20);
    expect(electronWavelengthFromV(100) * 1e9).toBeCloseTo(0.1227, 3);
  });
  it('hydrogen radial probability densities are normalised', () => {
    for (const [n, l] of [[1, 0], [2, 0], [2, 1], [3, 0], [3, 1]]) {
      let s = 0;
      for (let r = 0; r < 80; r += 0.001) s += radialProbability(n, l, r) * 0.001;
      expect(s).toBeCloseTo(1, 3);
    }
  });
  it('1s most probable radius is the Bohr radius (r = a0)', () => {
    let best = 0, rb = 0;
    for (let r = 0.01; r < 5; r += 0.001) {
      const p = radialProbability(1, 0, r);
      if (p > best) { best = p; rb = r; }
    }
    expect(rb).toBeCloseTo(1, 2);
  });
  it('Rutherford trajectory deflection matches analytic formula within 3%', () => {
    for (const b of [20, 50, 100]) {
      const num = rutherfordTrajectory(b, 5).deflectionDeg;
      const ana = rutherfordAngleDeg(b, 5);
      expect(Math.abs(num - ana) / ana).toBeLessThan(0.03);
    }
    expect(closestApproachFm(5)).toBeCloseTo(45.5, 1);
  });
  it('Thomson q/m and Millikan', () => {
    expect(thomsonChargeToMass(2e4, 1e-3, 0.114) / 1.75e11).toBeCloseTo(1, 1);
    expect(millikanCharge(3.2e-15, 1200, 0.012) / (2 * C.e)).toBeCloseTo(1, 1);
  });
});

describe('nuclear physics', () => {
  it('decay law: one half-life halves N', () => {
    const l = decayConstant(10);
    expect(remaining(1000, l, 10)).toBeCloseTo(500, 9);
    expect(remaining(1000, l, 30)).toBeCloseTo(125, 9);
    expect(timeToDecay(1000, 250, l)).toBeCloseTo(20, 9);
  });
  it('He-4 binding energy ≈ 28.3 MeV, Fe-56 ≈ 8.79 MeV/nucleon', () => {
    expect(bindingEnergy(2, 4, ATOMIC_MASS['He-4']).MeV).toBeCloseTo(28.3, 1);
    expect(bindingEnergy(26, 56, ATOMIC_MASS['Fe-56']).perNucleon).toBeCloseTo(8.79, 2);
    expect(bindingEnergy(92, 235, ATOMIC_MASS['U-235']).perNucleon).toBeCloseTo(7.59, 2);
  });
  it('binding-energy table agrees with mass table where both exist (±0.02 MeV)', () => {
    for (const row of BE_PER_NUCLEON) {
      const m = ATOMIC_MASS[row.name];
      if (m === undefined) continue;
      expect(Math.abs(bindingEnergy(row.Z, row.A, m).perNucleon - row.be)).toBeLessThan(0.02);
    }
  });
  it('D–T fusion releases 17.6 MeV', () => {
    expect(qValue(['H-2', 'H-3'], ['He-4', 'n']).MeV).toBeCloseTo(17.6, 1);
  });
  it('U-235 fission (n + U-235 → Ba-141 + Kr-92 + 3n) releases ≈ 173 MeV', () => {
    const q = qValue(['n', 'U-235'], ['Ba-141', 'Kr-92', 'n', 'n', 'n']).MeV;
    expect(q).toBeGreaterThan(165);
    expect(q).toBeLessThan(180);
  });
  it('alpha decay of U-238 releases ≈ 4.27 MeV', () => {
    expect(qValue(['U-238'], ['Th-234', 'He-4']).MeV).toBeCloseTo(4.27, 1);
  });
  it('He-4 mass defect from data-sheet nucleon masses', () => {
    expect(massDefectKg(2, 2, 6.645e-27)).toBeCloseTo(5.1e-29, 30);
  });
  it('daughters conserve A and Z', () => {
    expect(daughter(92, 238, 'alpha')).toEqual({ Z: 90, A: 234 });
    expect(daughter(6, 14, 'beta-')).toEqual({ Z: 7, A: 14 });
    expect(daughter(9, 18, 'beta+')).toEqual({ Z: 8, A: 18 });
    const c = checkConservation([{ label: 'U', Z: 92, A: 238 }], [{ label: 'Th', Z: 90, A: 234 }, { label: 'α', Z: 2, A: 4 }]);
    expect(c.A && c.Z).toBe(true);
  });
  it('seeded stochastic decay follows the exponential law statistically', () => {
    const rand = mulberry32(42);
    const alive = new Array(20000).fill(true);
    const l = decayConstant(1);
    for (let i = 0; i < 100; i++) stochasticDecayStep(alive, l, 0.01, rand);
    const left = alive.filter(Boolean).length;
    // expected 10000 after one half-life; σ ≈ 71
    expect(Math.abs(left - 10000)).toBeLessThan(400);
  });
  it('line of stability: N/Z rises from ≈1 for light to ≈1.5 for heavy nuclei', () => {
    const z40 = stableZ(40);
    expect((40 - z40) / z40).toBeLessThan(1.2);
    const z208 = stableZ(208);
    expect((208 - z208) / z208).toBeGreaterThan(1.4);
  });
});

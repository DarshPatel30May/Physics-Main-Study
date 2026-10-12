import { describe, it, expect } from 'vitest';
import { FORMULAS } from '@/content/formulas';

/**
 * Every predefined rearrangement is validated by substitution: solving for each variable and
 * substituting back into the primary form must reproduce the primary quantity.
 */
describe('formula library rearrangements', () => {
  it('has unique ids', () => {
    const ids = FORMULAS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  for (const f of FORMULAS) {
    describe(f.id, () => {
      it('provides a rearrangement for every variable', () => {
        for (const v of f.vars) expect(f.solve[v.key], `${f.id} missing ${v.key}`).toBeDefined();
      });
      const primary = f.vars[0].key;
      it('default values are self-consistent (within 2%)', () => {
        const vals = Object.fromEntries(f.vars.map((v) => [v.key, v.def]));
        const p = f.solve[primary].fn(vals);
        expect(Number.isFinite(p)).toBe(true);
        expect(Math.abs(p - vals[primary])).toBeLessThanOrEqual(Math.abs(vals[primary]) * 0.02 + 1e-12);
      });
      for (const v of f.vars) {
        if (v.key === primary) continue;
        it(`round-trips when solving for ${v.key}`, () => {
          const vals: Record<string, number> = Object.fromEntries(f.vars.map((x) => [x.key, x.def]));
          vals[primary] = f.solve[primary].fn(vals); // make inputs exactly consistent
          const x = f.solve[v.key].fn(vals);
          expect(Number.isFinite(x)).toBe(true);
          const back = f.solve[primary].fn({ ...vals, [v.key]: x });
          expect(Math.abs(back - vals[primary])).toBeLessThanOrEqual(Math.abs(vals[primary]) * 1e-6 + 1e-12);
        });
      }
    });
  }
});

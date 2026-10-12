import { describe, it, expect } from 'vitest';
import { SECTIONS, ALL_DOT_POINTS } from '@/content/syllabus';
import { ALL_CONCEPTS } from '@/content/modules';
import { FORMULAS, formulaById } from '@/content/formulas';
import { QUESTIONS, checkNumeric, type ShortAnswer, type MCQ } from '@/content/questions';
import { SIMS, simById } from '@/content/sims';
import { TEMPLATES } from '@/content/solver';
import { FLASHCARDS } from '@/content/flashcards';
import { mulberry32 } from '@/lib/physics/nuclear';
import { C } from '@/lib/physics/constants';

describe('syllabus coverage matrix', () => {
  it('every dot point is covered by at least one lesson concept', () => {
    for (const dp of ALL_DOT_POINTS) {
      const n = ALL_CONCEPTS.filter((c) => c.dotPoints.includes(dp.id)).length;
      expect(n, dp.id).toBeGreaterThan(0);
    }
  });
  it('every dot point links to at least one existing simulation', () => {
    for (const dp of ALL_DOT_POINTS) {
      expect(dp.sims.length, dp.id).toBeGreaterThan(0);
      for (const s of dp.sims) expect(simById(s), `${dp.id} → ${s}`).toBeDefined();
    }
  });
  it('all formula links resolve', () => {
    for (const dp of ALL_DOT_POINTS) for (const f of dp.formulas) expect(formulaById(f), `${dp.id} → ${f}`).toBeDefined();
  });
  it('every dot point has practice (question or flashcard)', () => {
    for (const dp of ALL_DOT_POINTS) {
      const q = QUESTIONS.some((x) => x.dotPoints.includes(dp.id));
      const fc = FLASHCARDS.some((f) => ALL_CONCEPTS.some((c) => `fc-${c.id}` === f.id && c.dotPoints.includes(dp.id)));
      expect(q || fc, dp.id).toBe(true);
    }
  });
  it('concepts reference real dot points, sections and sims', () => {
    const ids = new Set(ALL_DOT_POINTS.map((d) => d.id));
    const secs = new Set(SECTIONS.map((s) => s.id));
    for (const c of ALL_CONCEPTS) {
      expect(secs.has(c.section), c.id).toBe(true);
      for (const d of c.dotPoints) expect(ids.has(d), `${c.id} → ${d}`).toBe(true);
      if (c.sim) expect(simById(c.sim), `${c.id} → ${c.sim}`).toBeDefined();
    }
  });
  it('formula sections exist', () => {
    const secs = new Set(SECTIONS.map((s) => s.id));
    for (const f of FORMULAS) expect(secs.has(f.section), f.id).toBe(true);
  });
  it('has one simulation entry per id', () => {
    expect(new Set(SIMS.map((s) => s.id)).size).toBe(SIMS.length);
  });
});

describe('question bank integrity', () => {
  it('ids are unique and dot points exist', () => {
    const ids = new Set(ALL_DOT_POINTS.map((d) => d.id));
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(QUESTIONS.length);
    for (const q of QUESTIONS) for (const d of q.dotPoints) expect(ids.has(d), `${q.id} → ${d}`).toBe(true);
  });
  it('every MCQ has four options and exactly one correct answer', () => {
    for (const q of QUESTIONS.filter((x): x is MCQ => x.kind === 'mcq')) {
      expect(q.options.length, q.id).toBe(4);
      expect(q.options.filter((o) => o.correct).length, q.id).toBe(1);
    }
  });
  it('short-answer criteria add up to the marks', () => {
    for (const q of QUESTIONS.filter((x): x is ShortAnswer => x.kind === 'sa')) {
      expect(q.criteria.reduce((s, c) => s + c.marks, 0), q.id).toBe(q.marks);
    }
  });
  it('balances modules (≥ 15 MCQ and ≥ 8 short answers each)', () => {
    for (const m of [5, 6, 7, 8]) {
      expect(QUESTIONS.filter((q) => q.module === m && q.kind === 'mcq').length).toBeGreaterThanOrEqual(15);
      expect(QUESTIONS.filter((q) => q.module === m && q.kind === 'sa').length).toBeGreaterThanOrEqual(8);
    }
  });

  // Independent recomputation of numeric short-answer solutions
  const recompute: Record<string, number> = {
    'q5-sa1': (18 ** 2 * Math.sin((70 * Math.PI) / 180)) / 9.8,
    'q5-sa2': Math.hypot(12, Math.sqrt(2 * 9.8 * 30)),
    'q5-sa4': (Math.atan(625 / (120 * 9.8)) * 180) / Math.PI,
    'q5-sa5': (4 * Math.PI ** 2 * 9.38e6 ** 3) / (C.G * (7.66 * 3600) ** 2),
    'q5-sa7': (C.G * C.ME * 1000) / C.RE,
    'q6-sa1': (C.me * Math.sqrt((2 * C.e * 150) / C.me)) / (C.e * 2e-3),
    'q6-sa3': ((C.mu0 * 15 * 25) / (2 * Math.PI * 0.04)) * 2,
    'q6-sa5': (2e8 / 3.3e5) ** 2 * 4,
    'q6-sa6': (12 * 3) / 240,
    'q6-sa8': 80 * 1.2 * 1.2e-3 * 0.35 * Math.sin((60 * Math.PI) / 180),
    'q7-sa1': ((1e-3 / 300) * Math.sin((21.1 * Math.PI) / 180)) / 2,
    'q7-sa3': (C.h * C.c) / 250e-9 / C.eV - 4.3,
    'q7-sa5': 0.98 * C.c * (2.2e-6 / Math.sqrt(1 - 0.98 ** 2)),
    'q7-sa6': C.b / 400e-9,
    'q7-sa8': 3.85e26 / C.c ** 2,
    'q8-sa1': (((662.9 - 656.3) / 656.3) * 3e5) / 70,
    'q8-sa3': (C.h * C.c) / (1 / (C.R * (1 / 4 - 1 / 16))) / C.eV,
    'q8-sa5': C.h / Math.sqrt(2 * C.me * C.e * 54),
    'q8-sa6': 400 * Math.exp((-Math.LN2 / 8.02) * 20),
    'q8-sa7': (226.02541 - 222.017578 - 4.002603) * 931.5,
  };
  for (const [id, val] of Object.entries(recompute)) {
    it(`${id} stored answer matches independent calculation`, () => {
      const q = QUESTIONS.find((x) => x.id === id) as ShortAnswer;
      expect(q?.numeric).toBeDefined();
      expect(Math.abs(q.numeric!.answer - val) / Math.abs(val)).toBeLessThan(0.01);
      expect(checkNumeric(q, val, q.numeric!.unit).correct).toBe(true);
    });
  }
  it('numeric checker diagnoses unit, sign and factor errors', () => {
    const q = QUESTIONS.find((x) => x.id === 'q6-sa5') as ShortAnswer;
    expect(checkNumeric(q, 1.469e6, 'W').correct).toBe(true);
    expect(checkNumeric(q, 1.469e3, 'W').error).toBe('units');
    expect(checkNumeric(q, -1.469e6, 'W').error).toBe('sign');
    expect(checkNumeric(q, 1.469e6, 'J').error).toBe('units');
    expect(checkNumeric(q, 2.938e6, 'W').error).toBe('formula');
  });
});

describe('problem solver templates', () => {
  for (const tpl of TEMPLATES) {
    it(`${tpl.id}: generates valid, unambiguous instances`, () => {
      for (let seed = 1; seed <= 40; seed++) {
        const p = tpl.generate(mulberry32(seed));
        expect(Number.isFinite(p.answer), `${tpl.id} seed ${seed}`).toBe(true);
        expect(p.formulaOptions.filter((o) => o.correct).length).toBe(1);
        expect(p.rearrangeOptions.filter((o) => o.correct).length).toBe(1);
        expect(p.interpretOptions.filter((o) => o.correct).length).toBe(1);
        for (const m of p.mistakes) {
          // a diagnosed mistake must not be accepted as correct
          expect(Math.abs(m.value - p.answer) > Math.abs(p.answer) * p.tol, `${tpl.id} seed ${seed}: ${m.message}`).toBe(true);
        }
        if (p.conversion) expect(Number.isFinite(p.conversion.answer)).toBe(true);
      }
    });
  }
  it('covers all 18 required problem types', () => {
    expect(TEMPLATES.length).toBeGreaterThanOrEqual(18);
  });
});

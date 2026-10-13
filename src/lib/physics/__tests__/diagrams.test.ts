import { describe, expect, it } from 'vitest';
import { DIAGRAMS } from '@/components/diagrams';
import { ALL_CONCEPTS, MODULE_CONTENT } from '@/content/modules';
import { TEMPLATES } from '@/content/solver';
import { QUESTIONS } from '@/content/questions';
import { mulberry32 } from '@/lib/physics/nuclear';

describe('static diagrams', () => {
  it('every diagram referenced by lessons, revision, questions and solver exists', () => {
    const ids = new Set<string>();
    ALL_CONCEPTS.forEach((c) => c.diagram && ids.add(c.diagram));
    Object.values(MODULE_CONTENT).forEach((m) => m.quick.diagrams.forEach((d) => ids.add(d)));
    QUESTIONS.forEach((q) => q.figure?.kind === 'diagram' && ids.add(q.figure.id));
    TEMPLATES.forEach((t) => ids.add(t.generate(mulberry32(1)).diagram));
    const missing = [...ids].filter((id) => !DIAGRAMS[id]);
    expect(missing).toEqual([]);
  });
  it('every diagram renders an element with a title and caption', () => {
    for (const [id, d] of Object.entries(DIAGRAMS)) {
      expect(d.title.length, id).toBeGreaterThan(3);
      expect(d.caption.length, id).toBeGreaterThan(10);
      expect(d.render(), id).toBeTruthy();
    }
  });
});

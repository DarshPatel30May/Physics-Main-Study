import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, FlaskConical, PlayCircle, X } from 'lucide-react';
import type { Concept } from '@/content/types';
import { useStore } from '@/lib/store';
import { SimLoader } from '@/sims/registry';
import { simById } from '@/content/sims';
import { BookmarkButton, Callout, Chip, RichText, Tex } from './ui';
import { Diagram } from './diagrams';

const conceptKey = (id: string) => `concept:${id}`;

function Para({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <div className="label mb-0.5">{label}</div>
      <p className="leading-relaxed">
        <RichText text={text} />
      </p>
    </div>
  );
}

/** One lesson card. Text adapts to the learning mode (standard / beginner / visual / exam). */
export function ConceptLesson({ c, moduleId }: { c: Concept; moduleId: string }) {
  const { prefs, progress, toggleProgress } = useStore();
  const [showSim, setShowSim] = useState(false);
  const mode = prefs.mode;
  const done = !!progress[conceptKey(c.id)];
  const sim = c.sim ? simById(c.sim) : undefined;

  return (
    <article id={c.id} className="card scroll-mt-24 p-5">
      <header className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-xl font-semibold">{c.title}</h3>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {c.dotPoints.map((d) => (
              <Link key={d} to={`/syllabus#${d}`} className="chip hover:border-accent" title="Open in the syllabus explorer">
                {d}
              </Link>
            ))}
            {c.supplementary && <Chip tone="warn">Beyond the syllabus</Chip>}
          </div>
        </div>
        <div className="flex gap-2 print:hidden">
          <button className={`btn !py-1 text-xs ${done ? '!border-good/60 text-good' : ''}`} onClick={() => toggleProgress(conceptKey(c.id))} aria-pressed={done}>
            {done ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />} {done ? 'Studied' : 'Mark studied'}
          </button>
          <BookmarkButton bm={{ id: `concept:${c.id}`, kind: 'concept', title: c.title, href: `/module/${moduleId}#${c.id}` }} />
        </div>
      </header>

      <div className={`grid grid-cols-1 gap-5 ${c.diagram ? 'lg:grid-cols-[1.25fr_1fr]' : ''}`}>
        <div className="space-y-3 text-[15px]">
          {mode === 'beginner' && (
            <>
              <p className="rounded-xl bg-accent/10 p-3 leading-relaxed">
                <RichText text={c.beginner} />
              </p>
              <Para label="What it means" text={c.what} />
              {c.example && <Para label="Everyday example" text={c.example} />}
            </>
          )}
          {mode === 'exam' && (
            <>
              <div className="rounded-xl border border-accent/40 bg-accent/5 p-3">
                <div className="label mb-0.5">Exam-standard statement</div>
                <p className="leading-relaxed">
                  <RichText text={c.exam} />
                </p>
              </div>
              <Para label="How it is examined" text={c.hsc} />
            </>
          )}
          {mode === 'standard' && (
            <>
              <Para label="What" text={c.what} />
              <Para label="How" text={c.how} />
              <Para label="Why" text={c.why} />
              {c.example && <Para label="Example" text={c.example} />}
              {c.evidence && <Para label="Evidence & history" text={c.evidence} />}
              <Para label="In the HSC" text={c.hsc} />
            </>
          )}
          {mode === 'visual' && <p className="text-sm text-muted">{c.what}</p>}

          {c.math && c.math.length > 0 && (
            <div className="space-y-1 rounded-xl border border-line bg-panel2/40 px-3 py-2">
              {c.math.map((m) => (
                <Tex key={m} block>
                  {m}
                </Tex>
              ))}
            </div>
          )}

          {c.misconception && mode !== 'visual' && (
            <Callout kind="warn" title="Common misconception">
              <p>
                <span className="line-through decoration-bad/60">{c.misconception.wrong}</span>
              </p>
              <p className="mt-1">
                <strong>Correct:</strong> {c.misconception.right}
              </p>
            </Callout>
          )}
        </div>
        {c.diagram && <Diagram id={c.diagram} />}
      </div>

      {sim && (
        <div className="mt-4 print:hidden">
          {showSim ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="label">Simulation · {sim.title}</div>
                <div className="flex gap-2">
                  <Link to={`/lab/${sim.id}`} className="btn !py-1 text-xs">
                    <FlaskConical className="h-3.5 w-3.5" /> Open full screen
                  </Link>
                  <button className="btn !py-1 text-xs" onClick={() => setShowSim(false)}>
                    <X className="h-3.5 w-3.5" /> Close
                  </button>
                </div>
              </div>
              <SimLoader id={sim.id} compact />
            </div>
          ) : (
            <button className="btn" onClick={() => setShowSim(true)}>
              <PlayCircle className="h-4 w-4 text-accent" /> Explore: {sim.title}
            </button>
          )}
        </div>
      )}
    </article>
  );
}

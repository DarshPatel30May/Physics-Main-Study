import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calculator } from 'lucide-react';
import { FORMULAS, formulaById, type Formula } from '@/content/formulas';
import { sectionById, ALL_DOT_POINTS } from '@/content/syllabus';
import { useStore } from '@/lib/store';
import { BookmarkButton, Callout, Chip, ModuleBadge, NumberField, RichText, Tex, parseNum } from '@/components/ui';
import { FormulaCalculator } from '@/components/FormulaCalculator';
import NotFound from './NotFound';

export default function FormulaDetail() {
  const { id } = useParams();
  const f = id ? formulaById(id) : undefined;
  if (!f) return <NotFound />;
  return <FormulaView key={f.id} f={f} />;
}

function FormulaView({ f }: { f: Formula }) {
  const { recordAttempt } = useStore();
  const [ans, setAns] = useState('');
  const [checked, setChecked] = useState<null | boolean>(null);
  const [showSol, setShowSol] = useState(false);
  const dps = ALL_DOT_POINTS.filter((d) => d.formulas.includes(f.id));
  const related = FORMULAS.filter((x) => x.section === f.section && x.id !== f.id).slice(0, 6);

  const check = () => {
    const v = parseNum(ans);
    const tol = f.practice.tol ?? 0.02;
    const ok = Number.isFinite(v) && Math.abs(v - f.practice.answer) <= Math.abs(f.practice.answer) * tol;
    setChecked(ok);
    recordAttempt({ qid: `formula:${f.id}`, source: 'formula', module: f.module, section: f.section, skill: 'calculation', correct: ok, error: ok ? undefined : Number.isFinite(v) && Math.abs(-v - f.practice.answer) <= Math.abs(f.practice.answer) * tol ? 'sign' : 'calculation' });
  };

  return (
    <div className="space-y-6">
      <Link to="/formulas" className="btn">
        <ArrowLeft className="h-4 w-4" /> Formula Centre
      </Link>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap gap-1.5">
            <ModuleBadge m={f.module} />
            <Chip>{sectionById(f.section)?.title ?? f.section}</Chip>
            {f.onSheet ? <Chip tone="good">On formulae sheet</Chip> : <Chip>Not on formulae sheet</Chip>}
            {f.prereq && <Chip>Year 11 prerequisite</Chip>}
            {f.supplementary && <Chip tone="warn">Supplementary — beyond the syllabus</Chip>}
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">{f.name}</h1>
        </div>
        <BookmarkButton bm={{ id: `formula:${f.id}`, kind: 'formula', title: f.name, href: `/formulas/${f.id}` }} />
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="card p-6">
          <Tex block className="text-2xl sm:text-3xl">
            {f.tex}
          </Tex>
          <p className="prose-block mt-4">{f.interpretation}</p>
        </div>
        <div className="card p-5">
          <div className="label mb-2">Variables and SI units</div>
          <table className="w-full text-sm">
            <tbody>
              {f.vars.map((v) => (
                <tr key={v.key} className="border-t border-line first:border-0">
                  <td className="w-12 py-1.5">
                    <Tex>{v.symbol}</Tex>
                  </td>
                  <td className="py-1.5">{v.name}</td>
                  <td className="num py-1.5 text-right text-muted">{v.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <section className="card p-5">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <Calculator className="h-5 w-5 text-accent" /> Calculator
        </h2>
        <FormulaCalculator f={f} />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-2 text-lg font-semibold">Conditions of use</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {f.conditions.map((c) => (
              <li key={c}>
                <RichText text={c} />
              </li>
            ))}
          </ul>
          <h3 className="mb-1 mt-4 font-semibold">Common errors</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {f.errors.map((c) => (
              <li key={c}>
                <RichText text={c} />
              </li>
            ))}
          </ul>
        </section>
        <section className="card p-5">
          <h2 className="mb-2 text-lg font-semibold">Worked example</h2>
          <p className="text-sm">
            <RichText text={f.example.q} />
          </p>
          <ol className="mt-2 space-y-1">
            {f.example.steps.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="num mt-1 text-xs text-muted">{i + 1}.</span>
                <Tex block>{s}</Tex>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-sm font-semibold">
            Answer: <RichText text={f.example.answer} />
          </p>
        </section>
      </div>

      <section className="card p-5">
        <h2 className="mb-2 text-lg font-semibold">Practice question</h2>
        <p className="text-sm">
          <RichText text={f.practice.q} />
        </p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div className="w-60">
            <NumberField label="Your answer" unit={f.practice.unit} value={ans} onChange={(s) => { setAns(s); setChecked(null); }} />
          </div>
          <button className="btn btn-primary" onClick={check} disabled={!ans.trim()}>
            Check
          </button>
          <button className="btn" onClick={() => setShowSol((s) => !s)}>
            {showSol ? 'Hide' : 'Show'} solution
          </button>
        </div>
        <div aria-live="polite">
          {checked !== null && (
            <p className={`mt-3 text-sm font-semibold ${checked ? 'text-good' : 'text-bad'}`}>{checked ? 'Correct — well done.' : 'Not quite. Check your rearrangement, units and substitution.'}</p>
          )}
        </div>
        {showSol && (
          <div className="mt-3">
            <Callout kind="model" title="Solution">
              <RichText text={f.practice.solution} />
            </Callout>
          </div>
        )}
      </section>

      {(dps.length > 0 || related.length > 0) && (
        <section className="grid gap-4 lg:grid-cols-2">
          {dps.length > 0 && (
            <div className="card p-5">
              <div className="label mb-2">Syllabus dot points</div>
              <ul className="space-y-1.5 text-sm">
                {dps.map((d) => (
                  <li key={d.id} className="flex gap-2">
                    <Link to={`/syllabus#${d.id}`} className="num shrink-0 text-xs text-accent hover:underline">
                      {d.id}
                    </Link>
                    <RichText text={d.text} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          {related.length > 0 && (
            <div className="card p-5">
              <div className="label mb-2">Related formulas</div>
              <ul className="space-y-2">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link to={`/formulas/${r.id}`} className="flex items-center justify-between gap-3 hover:text-accent">
                      <span className="text-sm">{r.name}</span>
                      <Tex className="text-sm">{r.tex}</Tex>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

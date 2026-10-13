import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Lightbulb, RefreshCw, XCircle } from 'lucide-react';
import { TEMPLATES, UNSUPPORTED, templateById, type Choice, type ProblemInstance, type ProblemTemplate } from '@/content/solver';
import { FORMULAS, formulaById } from '@/content/formulas';
import { mulberry32 } from '@/lib/physics/nuclear';
import { useStore } from '@/lib/store';
import { Callout, Chip, ModuleBadge, NumberField, Select, Tex, parseNum } from '@/components/ui';
import { Diagram } from '@/components/diagrams';
import { FormulaCalculator } from '@/components/FormulaCalculator';
import { sigTex } from '@/lib/physics/stats';
import { PageHeader, shuffle } from './shared';

const STEPS = ['Understand', 'Knowns', 'Diagram', 'Formula', 'Rearrange', 'Units', 'Calculate', 'Interpret'];

export default function Solver() {
  const { id } = useParams();
  const nav = useNavigate();
  const tpl = id ? templateById(id) : undefined;

  return (
    <div className="space-y-6">
      <PageHeader kicker="Problem Solver" title="Step-by-step physics tutor">
        Work through a problem in eight steps: understand it, list knowns, draw a diagram, pick and rearrange the formula, convert units, calculate and interpret. Wrong answers are diagnosed (formula, units, sign or calculation). No AI — every problem type is built from validated physics.
      </PageHeader>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
        <nav aria-label="Problem types" className="card h-fit p-2">
          <div className="lg:hidden">
            <Select label="Problem type" value={tpl?.id ?? ''} options={[{ value: '', label: 'Choose…' }, ...TEMPLATES.map((t) => ({ value: t.id, label: `M${t.module} · ${t.title}` })), { value: 'custom', label: 'Any formula (custom)' }]} onChange={(v) => nav(v ? `/solver/${v}` : '/solver')} />
          </div>
          <ul className="hidden space-y-0.5 lg:block">
            {TEMPLATES.map((t) => (
              <li key={t.id}>
                <Link to={`/solver/${t.id}`} aria-current={t.id === tpl?.id ? 'page' : undefined} className={`flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm ${t.id === tpl?.id ? 'bg-panel2 font-semibold ring-1 ring-line' : 'text-muted hover:text-ink'}`}>
                  <ModuleBadge m={t.module}>{t.module}</ModuleBadge>
                  <span>{t.title}</span>
                </Link>
              </li>
            ))}
            <li>
              <Link to="/solver/custom" className={`flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm ${id === 'custom' ? 'bg-panel2 font-semibold ring-1 ring-line' : 'text-muted hover:text-ink'}`}>
                <Chip>any</Chip> <span>Any formula (custom problem)</span>
              </Link>
            </li>
          </ul>
        </nav>
        <div>
          {tpl ? (
            <Tutor key={tpl.id} tpl={tpl} />
          ) : id === 'custom' ? (
            <Custom />
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {TEMPLATES.map((t) => (
                  <Link key={t.id} to={`/solver/${t.id}`} className="card flex items-center justify-between gap-2 p-4 hover:border-accent/60">
                    <div>
                      <ModuleBadge m={t.module} />
                      <div className="mt-1 font-semibold">{t.title}</div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted" />
                  </Link>
                ))}
              </div>
              <Unsupported />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Unsupported() {
  return (
    <Callout kind="info" title="What the solver does not attempt">
      <p>So that it never invents an answer, the tutor only generates problem types whose physics it can verify. It does not handle:</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {UNSUPPORTED.map((u) => (
          <li key={u}>{u}</li>
        ))}
      </ul>
      <p className="mt-2">
        For other single-formula problems use the <Link to="/solver/custom" className="text-accent underline">custom formula mode</Link>.
      </p>
    </Callout>
  );
}

function Custom() {
  const [fid, setFid] = useState(FORMULAS[0].id);
  const f = formulaById(fid)!;
  return (
    <div className="space-y-4">
      <div className="card space-y-4 p-5">
        <h2 className="text-lg font-semibold">Custom problem — any formula</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          <li>Read the question and identify the unknown.</li>
          <li>List the known values and convert them to SI units (use the Units Lab if needed).</li>
          <li>Choose the relationship below and select the unknown — the rearrangement is shown.</li>
          <li>Enter the knowns. Check the result is physically reasonable and give units and appropriate significant figures.</li>
        </ol>
        <Select label="Relationship" value={fid} options={FORMULAS.map((x) => ({ value: x.id, label: `M${x.module} · ${x.name}` }))} onChange={setFid} />
        <Tex block className="text-xl">
          {f.tex}
        </Tex>
        <FormulaCalculator key={f.id} f={f} />
        <div className="text-sm">
          <div className="label mb-1">Check the conditions</div>
          <ul className="list-disc space-y-0.5 pl-5">
            {f.conditions.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </div>
      <Unsupported />
    </div>
  );
}

function ChoiceStep({ options, seed, onDone, done }: { options: Choice[]; seed: number; onDone: (firstTry: boolean) => void; done: boolean }) {
  const order = useMemo(() => shuffle(options, mulberry32(seed)), [options, seed]);
  const [picked, setPicked] = useState<number[]>([]);
  return (
    <div className="space-y-2">
      {order.map((o, i) => {
        const was = picked.includes(i);
        return (
          <button
            key={i}
            disabled={done || was}
            onClick={() => {
              const next = [...picked, i];
              setPicked(next);
              if (o.correct) onDone(next.length === 1);
            }}
            className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${was ? (o.correct ? 'border-good bg-good/10' : 'border-bad/60 bg-bad/5') : done && o.correct ? 'border-good bg-good/10' : 'border-line hover:border-accent/60'}`}
          >
            <span className="mt-0.5 shrink-0">{was ? o.correct ? <CheckCircle2 className="h-5 w-5 text-good" /> : <XCircle className="h-5 w-5 text-bad" /> : <span className="block h-5 w-5 rounded-full border border-line" />}</span>
            <span className="min-w-0 flex-1">
              <Tex>{o.tex}</Tex>
              {(was || (done && o.correct)) && <span className={`mt-1 block text-sm ${o.correct ? 'text-good' : 'text-muted'}`}>{o.why}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function TextChoice({ options, seed, onDone, done }: { options: string[]; seed: number; onDone: (firstTry: boolean) => void; done: boolean }) {
  const order = useMemo(() => shuffle(options.map((t, i) => ({ t, correct: i === 0 })), mulberry32(seed)), [options, seed]);
  const [picked, setPicked] = useState<number[]>([]);
  return (
    <div className="flex flex-wrap gap-2">
      {order.map((o, i) => {
        const was = picked.includes(i);
        return (
          <button
            key={o.t}
            disabled={done || was}
            onClick={() => {
              const next = [...picked, i];
              setPicked(next);
              if (o.correct) onDone(next.length === 1);
            }}
            className={`rounded-xl border px-3 py-2 text-sm ${was ? (o.correct ? 'border-good bg-good/10 text-good' : 'border-bad/60 text-bad line-through') : done && o.correct ? 'border-good bg-good/10' : 'border-line hover:border-accent/60'}`}
          >
            {o.t}
          </button>
        );
      })}
    </div>
  );
}

function Tutor({ tpl }: { tpl: ProblemTemplate }) {
  const { prefs, recordAttempt } = useStore();
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9));
  const p: ProblemInstance = useMemo(() => tpl.generate(mulberry32(seed)), [tpl, seed]);
  const [step, setStep] = useState(0);
  const [doneSteps, setDoneSteps] = useState<Record<number, boolean>>({});
  const [conv, setConv] = useState('');
  const [convMsg, setConvMsg] = useState<string | null>(null);
  const [ans, setAns] = useState('');
  const [result, setResult] = useState<null | { ok: boolean; msg: string }>(null);
  const [tries, setTries] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [hints, setHints] = useState(prefs.mode === 'beginner' || prefs.difficulty <= 1);
  const [firstTryCount, setFirstTryCount] = useState(0);

  const reset = () => {
    setSeed(Math.floor(Math.random() * 1e9));
    setStep(0);
    setDoneSteps({});
    setConv('');
    setConvMsg(null);
    setAns('');
    setResult(null);
    setTries(0);
    setReveal(false);
    setFirstTryCount(0);
  };
  const complete = (s: number, firstTry = true) => {
    setDoneSteps((d) => ({ ...d, [s]: true }));
    if (firstTry) setFirstTryCount((n) => n + 1);
  };

  const checkConv = () => {
    if (!p.conversion) return;
    const v = parseNum(conv);
    const ok = Number.isFinite(v) && Math.abs(v - p.conversion.answer) <= Math.abs(p.conversion.answer) * 0.02;
    if (ok) {
      setConvMsg('Correct.');
      complete(5);
    } else {
      const lg = Number.isFinite(v) && v !== 0 ? Math.log10(Math.abs(v / p.conversion.answer)) : NaN;
      setConvMsg(Number.isFinite(lg) && Math.abs(lg - Math.round(lg)) < 0.01 ? `Off by a factor of 10^${Math.round(lg)} — check the prefix.` : 'Not quite — check the conversion.');
    }
  };

  const checkAnswer = () => {
    const v = parseNum(ans);
    const n = tries + 1;
    setTries(n);
    if (!Number.isFinite(v)) {
      setResult({ ok: false, msg: 'Enter a number (e.g. 3.2e-19).' });
      return;
    }
    const ok = Math.abs(v - p.answer) <= Math.abs(p.answer) * p.tol;
    if (ok) {
      setResult({ ok: true, msg: 'Correct!' });
      complete(6, n === 1);
      recordAttempt({ qid: `solver:${tpl.id}`, source: 'solver', module: tpl.module, section: tpl.section, skill: 'solver', correct: n === 1 });
      return;
    }
    const m = p.mistakes.find((mk) => Math.abs(v - mk.value) <= Math.abs(mk.value) * 0.02);
    let msg = m?.message;
    let type = m?.type;
    if (!msg && Math.abs(-v - p.answer) <= Math.abs(p.answer) * p.tol) {
      msg = 'Right magnitude, wrong sign — check your sign convention.';
      type = 'sign';
    }
    if (!msg) {
      const lg = Math.log10(Math.abs(v / p.answer));
      if (Math.abs(lg - Math.round(lg)) < 0.01 && Math.round(lg) !== 0) {
        msg = `Off by a factor of 10^${Math.round(lg)} — check unit conversions and prefixes.`;
        type = 'units';
      }
    }
    setResult({ ok: false, msg: msg ?? 'Not quite. Re-check the substitution and calculator entry (degrees mode, brackets, powers of ten).' });
    if (n === 1) recordAttempt({ qid: `solver:${tpl.id}`, source: 'solver', module: tpl.module, section: tpl.section, skill: 'solver', correct: false, error: type ?? 'calculation' });
  };

  const allDone = doneSteps[7];
  const canNext = step === 1 || step === 2 || (step === 5 && !p.conversion) || doneSteps[step];

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <ModuleBadge m={tpl.module} />
            <h2 className="mt-1 text-xl font-semibold">{tpl.title}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={hints} onChange={(e) => setHints(e.target.checked)} /> Show hints
            </label>
            <button className="btn" onClick={reset}>
              <RefreshCw className="h-4 w-4" /> New numbers
            </button>
          </div>
        </div>
        <p className="mt-3 text-[15px] leading-relaxed">{p.text}</p>
      </div>

      <ol className="flex gap-1 overflow-x-auto pb-1" aria-label="Steps">
        {STEPS.map((s, i) => (
          <li key={s}>
            <button
              onClick={() => i <= step && setStep(i)}
              disabled={i > step}
              aria-current={i === step ? 'step' : undefined}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1 text-xs ${i === step ? 'border-accent bg-accent/10 font-semibold' : doneSteps[i] || i < step ? 'border-good/50 text-good' : 'border-line text-muted'}`}
            >
              <span className="num">{i + 1}</span> {s}
            </button>
          </li>
        ))}
      </ol>

      <div className="card space-y-4 p-5" aria-live="polite">
        {step === 0 && (
          <>
            <h3 className="font-semibold">1 · What is the question asking for?</h3>
            {hints && <p className="text-sm text-muted">Hint: {p.situation}</p>}
            <TextChoice key={seed} options={p.unknownOptions} seed={seed + 1} done={!!doneSteps[0]} onDone={(f) => complete(0, f)} />
            {doneSteps[0] && (
              <p className="text-sm">
                Unknown: <Tex>{p.unknown.sym}</Tex> — {p.unknown.label} ({p.unknown.unit}).
              </p>
            )}
          </>
        )}
        {step === 1 && (
          <>
            <h3 className="font-semibold">2 · List the known quantities and assumptions</h3>
            <table className="w-full text-sm">
              <tbody>
                {p.given.map((g) => (
                  <tr key={g.sym + g.label} className="border-t border-line first:border-0">
                    <td className="w-16 py-1.5">
                      <Tex>{g.sym}</Tex>
                    </td>
                    <td className="py-1.5">{g.label}</td>
                    <td className="num py-1.5 text-right">
                      {g.display ?? <Tex>{sigTex(g.value, 4)}</Tex>} {g.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div>
              <div className="label mb-1">Assumptions</div>
              <ul className="list-disc space-y-0.5 pl-5 text-sm">
                {p.assumptions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h3 className="font-semibold">3 · Draw a diagram</h3>
            <p className="text-sm">{p.diagramNote}</p>
            <Diagram id={p.diagram} className="max-w-lg" />
          </>
        )}
        {step === 3 && (
          <>
            <h3 className="font-semibold">4 · Choose the relationship</h3>
            <ChoiceStep key={seed} options={p.formulaOptions} seed={seed + 2} done={!!doneSteps[3]} onDone={(f) => complete(3, f)} />
          </>
        )}
        {step === 4 && (
          <>
            <h3 className="font-semibold">5 · Rearrange for the unknown</h3>
            <ChoiceStep key={seed} options={p.rearrangeOptions} seed={seed + 3} done={!!doneSteps[4]} onDone={(f) => complete(4, f)} />
          </>
        )}
        {step === 5 && (
          <>
            <h3 className="font-semibold">6 · Convert to SI units</h3>
            {p.conversion ? (
              <>
                <p className="text-sm">{p.conversion.prompt}</p>
                <div className="flex flex-wrap items-end gap-3">
                  <div className="w-60">
                    <NumberField label="Value" unit={p.conversion.unit} value={conv} onChange={(s) => { setConv(s); setConvMsg(null); }} />
                  </div>
                  <button className="btn btn-primary" onClick={checkConv} disabled={!conv.trim() || !!doneSteps[5]}>
                    Check
                  </button>
                  {!doneSteps[5] && (
                    <button className="btn" onClick={() => { setConv(String(p.conversion!.answer)); setConvMsg(`Answer: ${p.conversion!.answer.toExponential(3)} ${p.conversion!.unit}`); complete(5, false); }}>
                      Show me
                    </button>
                  )}
                </div>
                {convMsg && <p className={`text-sm ${doneSteps[5] ? 'text-good' : 'text-bad'}`}>{convMsg}</p>}
              </>
            ) : (
              <p className="text-sm">All the given values are already in SI units — no conversion needed. Always check this step: prefixes (k, m, μ, n) are the most common source of lost marks.</p>
            )}
          </>
        )}
        {step === 6 && (
          <>
            <h3 className="font-semibold">7 · Substitute and calculate</h3>
            <Tex block>{p.substitution}</Tex>
            {hints && !doneSteps[6] && <p className="text-sm text-muted">Hint: substitute into your rearranged formula, keep unrounded values until the end, and check your calculator is in degrees mode.</p>}
            <div className="flex flex-wrap items-end gap-3">
              <div className="w-64">
                <NumberField label={p.unknown.label} tex={p.unknown.sym} unit={p.unit} value={ans} onChange={(s) => { setAns(s); setResult(null); }} />
              </div>
              <button className="btn btn-primary" onClick={checkAnswer} disabled={!ans.trim() || !!doneSteps[6]}>
                Check
              </button>
              {tries >= 2 && !doneSteps[6] && (
                <button className="btn" onClick={() => { setReveal(true); complete(6, false); }}>
                  Show working
                </button>
              )}
            </div>
            {result && (
              <p className={`flex items-start gap-2 text-sm ${result.ok ? 'text-good' : 'text-bad'}`}>
                {result.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <XCircle className="mt-0.5 h-4 w-4" />} {result.msg}
              </p>
            )}
            {(doneSteps[6] || reveal) && (
              <div className="rounded-xl border border-line bg-panel2/40 p-3">
                <div className="label mb-1">Working</div>
                {p.intermediate.map((x) => (
                  <Tex key={x} block>
                    {x}
                  </Tex>
                ))}
              </div>
            )}
          </>
        )}
        {step === 7 && (
          <>
            <h3 className="font-semibold">8 · Interpret and verify</h3>
            <ChoiceStep key={seed} options={p.interpretOptions} seed={seed + 4} done={!!doneSteps[7]} onDone={(f) => complete(7, f)} />
            {doneSteps[7] && (
              <div>
                <div className="label mb-1">Verify</div>
                <ul className="space-y-1 text-sm">
                  {p.verify.map((v) => (
                    <li key={v}>{v}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
          <button className="btn" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            Back
          </button>
          {step < 7 ? (
            <button className="btn btn-primary" disabled={!canNext} onClick={() => { setDoneSteps((d) => ({ ...d, [step]: true })); setStep((s) => s + 1); }}>
              Next step <ChevronRight className="h-4 w-4" />
            </button>
          ) : allDone ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted">
                <Lightbulb className="mr-1 inline h-4 w-4 text-warn" />
                {firstTryCount >= 6 ? 'Excellent — try it without hints next time.' : 'Try another set of numbers to consolidate.'}
              </span>
              <button className="btn btn-primary" onClick={reset}>
                <RefreshCw className="h-4 w-4" /> Another problem
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock, ExternalLink, Flag, RefreshCw, XCircle } from 'lucide-react';
import { QUESTIONS, checkNumeric, type MCQ, type Question, type ShortAnswer, type ErrorType } from '@/content/questions';
import { EXAM_SPEC, REFERENCES } from '@/content/references';
import { sectionById } from '@/content/syllabus';
import { mulberry32 } from '@/lib/physics/nuclear';
import { useStore } from '@/lib/store';
import { Callout, Chip, ModuleBadge, RichText, Select, Tabs, Toggle, parseNum } from '@/components/ui';
import { ERROR_LABEL, PageHeader, QuestionFigure, shuffle } from './shared';

type Tab = 'practice' | 'mock' | 'overview';
const DIFF_LABEL: Record<number, string> = { 1: 'Beginner', 2: 'Medium', 3: 'Hard', 4: 'HSC' };
const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export default function ExamCentre() {
  const [params] = useSearchParams();
  const [tab, setTab] = useState<Tab>(params.get('mock') ? 'mock' : 'practice');
  return (
    <div className="space-y-6">
      <PageHeader kicker="HSC Exam Centre" title="Practise like it’s the real paper">
        Section I multiple-choice and Section II short-answer practice with adaptive difficulty, numeric marking (value, unit, sign and tolerance), indicative marking criteria and model answers, plus a full-length mock examination.
      </PageHeader>
      <Tabs<Tab>
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'practice', label: 'Practice' },
          { id: 'mock', label: 'Mock exam' },
          { id: 'overview', label: 'Exam format & past papers' },
        ]}
      />
      {tab === 'practice' && <Practice />}
      {tab === 'mock' && <Mock />}
      {tab === 'overview' && <Overview />}
    </div>
  );
}

function Overview() {
  const papers = REFERENCES.filter((r) => r.org === 'NESA');
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="card p-5">
        <h2 className="text-lg font-semibold">2026 HSC Physics examination</h2>
        <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            ['Total', `${EXAM_SPEC.totalMarks} marks`],
            ['Writing', EXAM_SPEC.writingTime],
            ['Reading', EXAM_SPEC.readingTime],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-line p-3">
              <dt className="text-xs text-muted">{k}</dt>
              <dd className="font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
        <ul className="mt-3 space-y-2 text-sm">
          {EXAM_SPEC.sections.map((s) => (
            <li key={s.name}>
              <strong>
                {s.name} — {s.marks} marks.
              </strong>{' '}
              {s.desc}
            </li>
          ))}
        </ul>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
          {EXAM_SPEC.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </div>
      <div className="space-y-4">
        <div className="card p-5">
          <h2 className="text-lg font-semibold">Official past papers</h2>
          <p className="mt-1 text-sm text-muted">Past HSC papers and marking guidelines are © NESA and are not reproduced here. Use the official links:</p>
          <ul className="mt-3 space-y-2 text-sm">
            {papers.map((r) => (
              <li key={r.url}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-accent hover:underline">
                  {r.title} <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <div className="text-xs text-muted">{r.use}</div>
              </li>
            ))}
          </ul>
        </div>
        <Callout kind="warn" title="About the marking on this site">
          Numeric answers are checked automatically. Written answers are self-marked against indicative criteria and a model answer. Key terms are shown only as a prompt — matching words cannot reproduce how NESA markers judge a response, so always mark honestly against the criteria.
        </Callout>
        <Link to="/progress" className="btn">
          View your performance and recommendations →
        </Link>
      </div>
    </div>
  );
}

/* ---------------------------------- Practice ---------------------------------- */

function Practice() {
  const [params, setParams] = useSearchParams();
  const { prefs, setPrefs, attempts } = useStore();
  const qParam = params.get('q');
  const dpParam = params.get('dp');
  const [mod, setMod] = useState<string>(params.get('module') ?? 'all');
  const [kind, setKind] = useState<'all' | 'mcq' | 'sa'>('all');
  const [current, setCurrent] = useState<Question | undefined>(() => (qParam ? QUESTIONS.find((q) => q.id === qParam) : undefined));
  const [n, setN] = useState(0);

  const pool = useMemo(
    () => QUESTIONS.filter((q) => (mod === 'all' || String(q.module) === mod) && (kind === 'all' || q.kind === kind) && (!dpParam || q.dotPoints.includes(dpParam))),
    [mod, kind, dpParam],
  );

  const next = () => {
    if (!pool.length) return setCurrent(undefined);
    const done = new Set(attempts.map((a) => a.qid));
    const rand = mulberry32(Date.now() & 0xffffffff);
    const target = prefs.difficulty;
    const score = (q: Question) => Math.abs(q.difficulty - target) * 10 + (done.has(q.id) ? 5 : 0) + (q.id === current?.id ? 100 : 0) + rand();
    const best = [...pool].sort((a, b) => score(a) - score(b))[0];
    setCurrent(best);
    setN((x) => x + 1);
    if (qParam) {
      params.delete('q');
      setParams(params, { replace: true });
    }
  };

  useEffect(() => {
    if (!current || !pool.includes(current)) {
      if (!qParam) next();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool]);

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <aside className="card h-fit space-y-3 p-4">
        <Select label="Module" value={mod} options={[{ value: 'all', label: 'All modules' }, { value: '5', label: 'Module 5' }, { value: '6', label: 'Module 6' }, { value: '7', label: 'Module 7' }, { value: '8', label: 'Module 8' }]} onChange={setMod} />
        <Select label="Question type" value={kind} options={[{ value: 'all', label: 'Both sections' }, { value: 'mcq', label: 'Section I — multiple choice' }, { value: 'sa', label: 'Section II — short answer' }]} onChange={(v) => setKind(v)} />
        <Select label="Difficulty" value={String(prefs.difficulty)} options={[1, 2, 3, 4].map((d) => ({ value: String(d), label: DIFF_LABEL[d] }))} onChange={(v) => setPrefs({ difficulty: Number(v) })} />
        <Toggle label="Adaptive difficulty" checked={prefs.adaptive} onChange={(v) => setPrefs({ adaptive: v })} />
        <p className="text-xs text-muted">Adaptive: three correct in a row moves you up a level; two wrong in a row moves you down.</p>
        {dpParam && (
          <p className="text-xs">
            Filtered to dot point <span className="num text-accent">{dpParam}</span>.{' '}
            <button className="underline" onClick={() => { params.delete('dp'); setParams(params); }}>
              Clear
            </button>
          </p>
        )}
        <p className="text-xs text-muted">{pool.length} questions match.</p>
      </aside>
      <div>
        {current ? (
          <div className="space-y-3">
            <QuestionCard key={`${current.id}-${n}`} q={current} source={current.kind} />
            <div className="flex justify-end">
              <button className="btn btn-primary" onClick={next}>
                Next question <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <p className="text-muted">No questions match these filters.</p>
        )}
      </div>
    </div>
  );
}

function QHeader({ q }: { q: Question }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <ModuleBadge m={q.module} />
      <Chip>{q.kind === 'mcq' ? 'Section I · 1 mark' : `Section II · ${q.marks} mark${q.marks > 1 ? 's' : ''}`}</Chip>
      <Chip tone={q.difficulty >= 4 ? 'warn' : 'default'}>{DIFF_LABEL[q.difficulty]}</Chip>
      <span className="text-xs text-muted">{sectionById(q.section)?.title}</span>
    </div>
  );
}

/** A practice question with immediate feedback; records one attempt. */
export function QuestionCard({ q, source }: { q: Question; source: 'mcq' | 'sa' }) {
  return q.kind === 'mcq' ? <MCQCard q={q} /> : <SACard q={q} source={source} />;
}

function MCQCard({ q }: { q: MCQ }) {
  const { recordAttempt } = useStore();
  const [picked, setPicked] = useState<number | null>(null);
  const correctIdx = q.options.findIndex((o) => o.correct);
  const submit = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const ok = i === correctIdx;
    recordAttempt({ qid: q.id, source: 'mcq', module: q.module, section: q.section, skill: q.skill, correct: ok, error: ok ? undefined : (q.options[i].error ?? 'concept') });
  };
  return (
    <article className="card space-y-4 p-5">
      <QHeader q={q} />
      <p className="text-[15px] leading-relaxed">
        <RichText text={q.stem} />
      </p>
      {q.figure && <QuestionFigure fig={q.figure} />}
      <div className="space-y-2" role="radiogroup" aria-label="Options">
        {q.options.map((o, i) => {
          const state = picked === null ? 'idle' : i === correctIdx ? 'correct' : i === picked ? 'wrong' : 'idle';
          return (
            <button
              key={i}
              role="radio"
              aria-checked={picked === i}
              disabled={picked !== null}
              onClick={() => submit(i)}
              className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${state === 'correct' ? 'border-good bg-good/10' : state === 'wrong' ? 'border-bad bg-bad/10' : 'border-line hover:border-accent/60'}`}
            >
              <span className="num grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line text-xs font-bold">{LETTERS[i]}</span>
              <span className="min-w-0 flex-1">
                <RichText text={o.text} />
                {picked !== null && (i === picked || i === correctIdx) && <span className={`mt-1 block text-sm ${i === correctIdx ? 'text-good' : 'text-bad'}`}>{o.why}</span>}
              </span>
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <Callout kind="model" title={picked === correctIdx ? 'Correct' : `Answer: ${LETTERS[correctIdx]}`}>
          <RichText text={q.solution} />
          {picked !== correctIdx && q.options[picked].error && <p className="mt-1 text-xs">Error type: {ERROR_LABEL[q.options[picked].error!]}</p>}
        </Callout>
      )}
    </article>
  );
}

function SACard({ q, source }: { q: ShortAnswer; source: 'mcq' | 'sa' }) {
  const { recordAttempt } = useStore();
  const [val, setVal] = useState('');
  const [unit, setUnit] = useState(q.numeric?.unit ?? '');
  const [numRes, setNumRes] = useState<null | ReturnType<typeof checkNumeric>>(null);
  const [text, setText] = useState('');
  const [reveal, setReveal] = useState(false);
  const [ticks, setTicks] = useState<boolean[]>(() => q.criteria.map(() => false));
  const [recorded, setRecorded] = useState(false);
  const self = q.criteria.reduce((s, c, i) => s + (ticks[i] ? c.marks : 0), 0);
  const usedTerms = (q.keyTerms ?? []).filter((t) => text.toLowerCase().includes(t.toLowerCase()));

  const checkNum = () => {
    const r = checkNumeric(q, parseNum(val), unit);
    setNumRes(r);
    if (!recorded) {
      recordAttempt({ qid: q.id, source: source === 'mcq' ? 'mcq' : 'sa', module: q.module, section: q.section, skill: q.skill, correct: r.correct, error: r.error });
      setRecorded(true);
    }
  };
  const recordSelf = () => {
    if (recorded) return;
    const ok = self >= Math.ceil(q.marks * 0.6);
    let error: ErrorType | undefined;
    if (!ok) error = q.skill === 'investigation' ? 'skills' : q.skill === 'graph' ? 'graph' : q.skill === 'calculation' ? 'calculation' : 'concept';
    recordAttempt({ qid: q.id, source: 'sa', module: q.module, section: q.section, skill: q.skill, correct: ok, error });
    setRecorded(true);
  };

  return (
    <article className="card space-y-4 p-5">
      <QHeader q={q} />
      <p className="text-[15px] leading-relaxed">
        <RichText text={q.stem} />
      </p>
      {q.figure && <QuestionFigure fig={q.figure} />}
      {q.numeric && (
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="font-medium">Answer</span>
            <input className="input mt-1 w-48" inputMode="decimal" value={val} onChange={(e) => { setVal(e.target.value); setNumRes(null); }} placeholder="e.g. 3.2e-19" />
          </label>
          <label className="text-sm">
            <span className="font-medium">Unit</span>
            <input className="input mt-1 w-32" value={unit} onChange={(e) => { setUnit(e.target.value); setNumRes(null); }} placeholder="e.g. m s^-1" />
          </label>
          <button className="btn btn-primary" onClick={checkNum} disabled={!val.trim()}>
            Check number
          </button>
        </div>
      )}
      {numRes && (
        <p className={`flex items-start gap-2 text-sm ${numRes.correct ? 'text-good' : 'text-bad'}`} aria-live="polite">
          {numRes.correct ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <XCircle className="mt-0.5 h-4 w-4" />} {numRes.message}
          {numRes.error && <span className="text-muted">({ERROR_LABEL[numRes.error]})</span>}
        </p>
      )}
      <label className="block text-sm">
        <span className="font-medium">{q.numeric ? 'Working / explanation' : 'Your response'}</span>
        <textarea className="input mt-1 h-32" value={text} onChange={(e) => setText(e.target.value)} placeholder="Write your answer as you would in the exam…" />
      </label>
      {!reveal ? (
        <button className="btn" onClick={() => setReveal(true)}>
          Show marking criteria and model answer
        </button>
      ) : (
        <div className="space-y-3">
          <div className="rounded-xl border border-line p-3">
            <div className="label mb-2">Indicative criteria — tick what your answer shows</div>
            <ul className="space-y-1.5">
              {q.criteria.map((c, i) => (
                <li key={i}>
                  <label className="flex items-start gap-2 text-sm">
                    <input type="checkbox" className="mt-1" checked={ticks[i]} disabled={recorded && !q.numeric} onChange={(e) => setTicks((t) => t.map((x, j) => (j === i ? e.target.checked : x)))} />
                    <span>
                      <span className="num font-semibold">{c.marks}</span> — <RichText text={c.text} />
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="num text-sm font-semibold">
                Self-mark: {self} / {q.marks}
              </span>
              {!q.numeric && (
                <button className="btn !py-1 text-xs" onClick={recordSelf} disabled={recorded}>
                  {recorded ? 'Recorded' : 'Record my mark'}
                </button>
              )}
            </div>
          </div>
          <Callout kind="model" title="Model answer">
            <RichText text={q.model} />
          </Callout>
          {q.keyTerms && q.keyTerms.length > 0 && (
            <p className="text-xs text-muted">
              Terms strong responses often use: {q.keyTerms.map((t) => (usedTerms.includes(t) ? `✓ ${t}` : t)).join(' · ')}. This is a prompt only — using words is not the same as earning marks.
            </p>
          )}
        </div>
      )}
    </article>
  );
}

/* ---------------------------------- Mock exam ---------------------------------- */

interface Paper {
  seed: number;
  mcq: string[];
  sa: string[];
  started: number;
}

function buildPaper(seed: number): Paper {
  const rand = mulberry32(seed);
  const mcqAll = QUESTIONS.filter((q): q is MCQ => q.kind === 'mcq');
  const mcq: string[] = [];
  ([5, 6, 7, 8] as const).forEach((m) => shuffle(mcqAll.filter((q) => q.module === m), rand).slice(0, 5).forEach((q) => mcq.push(q.id)));
  const saAll = QUESTIONS.filter((q): q is ShortAnswer => q.kind === 'sa');
  const big = shuffle(saAll.filter((q) => q.marks >= 7), rand).slice(0, 2);
  const chosen = [...big];
  let total = big.reduce((s, q) => s + q.marks, 0);
  // round-robin through modules for balance
  const byMod = ([5, 6, 7, 8] as const).map((m) => shuffle(saAll.filter((q) => q.module === m && !big.includes(q)), rand));
  let added = true;
  while (added && total < 80) {
    added = false;
    for (const list of byMod) {
      const i = list.findIndex((q) => total + q.marks <= 80);
      if (i >= 0) {
        const [q] = list.splice(i, 1);
        chosen.push(q);
        total += q.marks;
        added = true;
      }
    }
  }
  chosen.sort((a, b) => a.module - b.module || a.marks - b.marks);
  return { seed, mcq, sa: chosen.map((q) => q.id), started: Date.now() };
}

const DURATION = (3 * 60 + 5) * 60 * 1000;

function Mock() {
  const { recordAttempt } = useStore();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [mcqAns, setMcqAns] = useState<Record<string, number>>({});
  const [saNum, setSaNum] = useState<Record<string, { v: string; u: string }>>({});
  const [saText, setSaText] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [selfMarks, setSelfMarks] = useState<Record<string, boolean[]>>({});
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!paper || submitted) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [paper, submitted]);

  const left = paper ? Math.max(0, paper.started + DURATION - now) : DURATION;
  useEffect(() => {
    if (paper && !submitted && left === 0) setSubmitted(true);
  }, [left, paper, submitted]);

  const mcqs = paper ? paper.mcq.map((id) => QUESTIONS.find((q) => q.id === id) as MCQ) : [];
  const sas = paper ? paper.sa.map((id) => QUESTIONS.find((q) => q.id === id) as ShortAnswer) : [];
  const saTotal = sas.reduce((s, q) => s + q.marks, 0);

  const mcqScore = mcqs.filter((q) => mcqAns[q.id] !== undefined && q.options[mcqAns[q.id]].correct).length;
  const saScore = sas.reduce((s, q) => s + q.criteria.reduce((t, c, i) => t + (selfMarks[q.id]?.[i] ? c.marks : 0), 0), 0);

  const start = () => {
    setPaper(buildPaper(Math.floor(Math.random() * 1e9)));
    setMcqAns({});
    setSaNum({});
    setSaText({});
    setSelfMarks({});
    setSubmitted(false);
    setNow(Date.now());
  };

  const submit = () => {
    if (!window.confirm('Submit the paper for marking?')) return;
    setSubmitted(true);
    mcqs.forEach((q) => {
      const a = mcqAns[q.id];
      const ok = a !== undefined && !!q.options[a].correct;
      recordAttempt({ qid: q.id, source: 'mock', module: q.module, section: q.section, skill: q.skill, correct: ok, error: ok ? undefined : a === undefined ? 'concept' : (q.options[a].error ?? 'concept') });
    });
    const auto: Record<string, boolean[]> = {};
    sas.forEach((q) => {
      if (q.numeric) {
        const r = checkNumeric(q, parseNum(saNum[q.id]?.v ?? ''), saNum[q.id]?.u ?? '');
        recordAttempt({ qid: q.id, source: 'mock', module: q.module, section: q.section, skill: q.skill, correct: r.correct, error: r.error });
        // pre-tick the final-answer criterion only when the numeric answer is right; the rest is self-marked
        auto[q.id] = q.criteria.map((_, i) => r.correct && i === q.criteria.length - 1);
      } else auto[q.id] = q.criteria.map(() => false);
    });
    setSelfMarks(auto);
  };

  if (!paper)
    return (
      <div className="card max-w-2xl space-y-3 p-6">
        <h2 className="text-xl font-semibold">Full-length mock examination</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>Section I: 20 multiple-choice questions (5 per module), 20 marks.</li>
          <li>Section II: short-answer questions totalling up to 80 marks, including the longest extended-response items available.</li>
          <li>Timer: 3 hours 5 minutes (writing time plus reading time). The paper auto-submits when time runs out.</li>
          <li>Multiple choice and numeric answers are marked automatically; written answers are self-marked against indicative criteria.</li>
        </ul>
        <p className="text-xs text-muted">Questions are original practice items written for this site, not NESA past-paper questions.</p>
        <button className="btn btn-primary" onClick={start}>
          Start mock exam
        </button>
      </div>
    );

  const hh = Math.floor(left / 3600000);
  const mm = Math.floor((left % 3600000) / 60000);
  const ss = Math.floor((left % 60000) / 1000);

  return (
    <div className="space-y-6">
      <div className="sticky top-14 z-20 -mx-1 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-panel/95 px-4 py-2 backdrop-blur">
        <span className="num flex items-center gap-2 font-semibold">
          <Clock className="h-4 w-4 text-accent" /> {submitted ? 'Submitted' : `${hh}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')} left`}
        </span>
        <span className="text-sm text-muted">
          {Object.keys(mcqAns).length}/20 MC answered · Section II {saTotal} marks
        </span>
        {submitted ? (
          <span className="num font-semibold">
            Score: {mcqScore + saScore} / {20 + saTotal}
          </span>
        ) : (
          <button className="btn btn-primary !py-1" onClick={submit}>
            <Flag className="h-4 w-4" /> Submit
          </button>
        )}
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Section I — 20 marks</h2>
        {mcqs.map((q, k) => {
          const a = mcqAns[q.id];
          return (
            <div key={q.id} className="card p-4">
              <div className="flex gap-2">
                <span className="num font-semibold">{k + 1}.</span>
                <div className="min-w-0 flex-1 space-y-2">
                  <RichText text={q.stem} />
                  {q.figure && <QuestionFigure fig={q.figure} />}
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {q.options.map((o, i) => (
                      <label key={i} className={`flex cursor-pointer items-start gap-2 rounded-lg border p-2 text-sm ${submitted && o.correct ? 'border-good bg-good/10' : submitted && a === i ? 'border-bad bg-bad/10' : a === i ? 'border-accent bg-accent/10' : 'border-line'}`}>
                        <input type="radio" name={q.id} className="mt-1" checked={a === i} disabled={submitted} onChange={() => setMcqAns((s) => ({ ...s, [q.id]: i }))} />
                        <span>
                          <span className="num mr-1 font-semibold">{LETTERS[i]}</span>
                          <RichText text={o.text} />
                        </span>
                      </label>
                    ))}
                  </div>
                  {submitted && (
                    <p className="text-sm text-muted">
                      <RichText text={q.solution} />
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Section II — {saTotal} marks</h2>
        {sas.map((q, k) => (
          <div key={q.id} className="card space-y-2 p-4">
            <div className="flex items-baseline justify-between gap-2">
              <span className="num font-semibold">Question {21 + k}</span>
              <span className="num text-sm text-muted">
                {q.marks} mark{q.marks > 1 ? 's' : ''}
              </span>
            </div>
            <RichText text={q.stem} />
            {q.figure && <QuestionFigure fig={q.figure} />}
            {q.numeric && (
              <div className="flex flex-wrap gap-2">
                <input className="input w-44" aria-label="Numeric answer" placeholder="answer" value={saNum[q.id]?.v ?? ''} disabled={submitted} onChange={(e) => setSaNum((s) => ({ ...s, [q.id]: { v: e.target.value, u: s[q.id]?.u ?? '' } }))} />
                <input className="input w-28" aria-label="Unit" placeholder="unit" value={saNum[q.id]?.u ?? ''} disabled={submitted} onChange={(e) => setSaNum((s) => ({ ...s, [q.id]: { v: s[q.id]?.v ?? '', u: e.target.value } }))} />
              </div>
            )}
            <textarea className="input h-28" aria-label="Response" value={saText[q.id] ?? ''} disabled={submitted} onChange={(e) => setSaText((s) => ({ ...s, [q.id]: e.target.value }))} />
            {submitted && (
              <div className="space-y-2 rounded-xl border border-line p-3">
                {q.numeric && (
                  <p className="text-sm">
                    Numeric check: {checkNumeric(q, parseNum(saNum[q.id]?.v ?? ''), saNum[q.id]?.u ?? '').message}
                  </p>
                )}
                <div className="label">Self-mark against the criteria</div>
                {q.criteria.map((c, i) => (
                  <label key={i} className="flex items-start gap-2 text-sm">
                    <input type="checkbox" className="mt-1" checked={!!selfMarks[q.id]?.[i]} onChange={(e) => setSelfMarks((s) => ({ ...s, [q.id]: q.criteria.map((_, j) => (j === i ? e.target.checked : !!s[q.id]?.[j])) }))} />
                    <span>
                      <span className="num font-semibold">{c.marks}</span> — <RichText text={c.text} />
                    </span>
                  </label>
                ))}
                <Callout kind="model" title="Model answer">
                  <RichText text={q.model} />
                </Callout>
              </div>
            )}
          </div>
        ))}
      </section>
      {submitted && (
        <div className="card flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <div className="num text-2xl font-semibold">
              {mcqScore + saScore} / {20 + saTotal}
            </div>
            <div className="text-sm text-muted">
              Section I: {mcqScore}/20 · Section II (self-marked): {saScore}/{saTotal}
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/progress" className="btn">
              See recommendations
            </Link>
            <button className="btn btn-primary" onClick={start}>
              New mock exam
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

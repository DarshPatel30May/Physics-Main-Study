import { lazy, Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckSquare, FlaskConical, Printer, Square, Target, GraduationCap, ScrollText } from 'lucide-react';
import { sectionsFor } from '@/content/syllabus';
import { MODULE_CONTENT } from '@/content/modules';
import { FORMULAS } from '@/content/formulas';
import { SIMS } from '@/content/sims';
import { TEMPLATES } from '@/content/solver';
import { useStore } from '@/lib/store';
import { Callout, Chip, Disclosure, ModuleBadge, RichText, Tex, modText } from '@/components/ui';
import { ConceptLesson } from '@/components/ConceptLesson';
import { FormulaCalculator } from '@/components/FormulaCalculator';
import { Diagram } from '@/components/diagrams';
import { MOD_BG, ProgressBar, dpKey, moduleFromParam, moduleProgress } from './shared';
import NotFound from './NotFound';

const ConceptMap = lazy(() => import('@/components/ConceptMap'));

const PARTS = [
  ['overview', 'A', 'Overview'],
  ['syllabus', 'B', 'Syllabus'],
  ['lessons', 'C', 'Lessons'],
  ['formulas', 'D', 'Formulas'],
  ['simulations', 'E', 'Simulations'],
  ['experiments', 'F', 'Experiments'],
  ['hsc', 'G', 'HSC application'],
  ['revision', 'H', 'Quick revision'],
] as const;

function PartTitle({ id, letter, title, children }: { id: string; letter: string; title: string; children?: React.ReactNode }) {
  return (
    <div id={id} className="mb-4 scroll-mt-24">
      <div className="flex items-baseline gap-3">
        <span className="num grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-panel2 text-sm font-bold ring-1 ring-line">{letter}</span>
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">{title}</h2>
      </div>
      {children && <p className="prose-block ml-11 mt-1 max-w-3xl text-muted">{children}</p>}
    </div>
  );
}

export default function ModulePage() {
  const { id } = useParams();
  const meta = moduleFromParam(id);
  const { progress, toggleProgress, prefs } = useStore();
  if (!meta) return <NotFound />;
  const content = MODULE_CONTENT[meta.no];
  const sections = sectionsFor(meta.no);
  const formulas = FORMULAS.filter((f) => f.module === meta.no);
  const sims = SIMS.filter((s) => s.module === meta.no);
  const templates = TEMPLATES.filter((t) => t.module === meta.no);
  const p = moduleProgress(progress, meta.no);
  const visual = prefs.mode === 'visual';

  return (
    <div className="space-y-14">
      {/* -------- A. Overview -------- */}
      <section aria-labelledby="overview">
        <div className="relative overflow-hidden rounded-3xl border border-line bg-panel p-6 sm:p-8">
          <div aria-hidden className={`pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full ${MOD_BG[meta.no]} opacity-20 blur-3xl`} />
          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <ModuleBadge m={meta.no} />
              <div className="flex gap-2 print:hidden">
                <Link to={`/module/${meta.id}/print`} className="btn">
                  <Printer className="h-4 w-4" /> Printable notes
                </Link>
              </div>
            </div>
            <h1 id="overview" className="mt-3 scroll-mt-24 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {meta.title}
            </h1>
            <p className="mt-1 text-lg text-muted">{meta.short}</p>
            <div className="mt-4 flex max-w-md items-center gap-3">
              <ProgressBar pct={p.pct} colour={MOD_BG[meta.no]} label="Syllabus checklist progress" />
              <span className="num shrink-0 text-xs text-muted">
                {p.done}/{p.total} dot points
              </span>
            </div>
          </div>
        </div>

        <nav aria-label="Module sections" className="sticky top-14 z-20 -mx-1 mt-4 overflow-x-auto bg-bg/85 px-1 py-2 backdrop-blur print:hidden">
          <ul className="flex gap-1.5">
            {PARTS.map(([pid, l, t]) => (
              <li key={pid}>
                <a href={`#${pid}`} onClick={(e) => { e.preventDefault(); document.getElementById(pid)?.scrollIntoView({ behavior: 'smooth' }); }} className="chip whitespace-nowrap hover:border-accent">
                  <span className="num font-bold">{l}</span> {t}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="card space-y-4 p-5">
            <PartTitle id="overview-detail" letter="A" title="Module overview" />
            <p className="prose-block leading-relaxed">{meta.focus}</p>
            <div>
              <div className="label mb-2">Inquiry questions</div>
              <ol className="space-y-2">
                {sections.map((s, i) => (
                  <li key={s.id} className="flex gap-3">
                    <span className={`num mt-0.5 text-sm font-bold ${modText(meta.no)}`}>IQ{i + 1}</span>
                    <div>
                      <div className="text-xs text-muted">{s.title}</div>
                      <q className="italic">{s.inquiry}</q>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-2 text-[11px] text-muted">Inquiry questions: NSW Physics Stage 6 Syllabus (2017) © NESA.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="card p-5">
              <div className="label mb-2">Learning objectives</div>
              <ul className="list-disc space-y-1.5 pl-5 text-sm">
                {meta.objectives.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </div>
            <div className="card p-5">
              <div className="label mb-1">Syllabus outcome</div>
              <p className="text-sm">
                <span className="num font-semibold">{meta.outcome.code}</span> — {meta.outcome.text}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* -------- B. Syllabus breakdown -------- */}
      <section>
        <PartTitle id="syllabus" letter="B" title="Syllabus breakdown">
          Tick each dot point once you can explain it confidently. Dot points are paraphrased — check the official syllabus wording.
        </PartTitle>
        <div className="space-y-4">
          {sections.map((s) => (
            <div key={s.id} className="card p-5">
              <h3 className="font-semibold">{s.title}</h3>
              <q className="text-sm italic text-muted">{s.inquiry}</q>
              <ul className="mt-3 space-y-2">
                {s.dotPoints.map((d) => {
                  const on = !!progress[dpKey(d.id)];
                  const lessons = content.concepts.filter((c) => c.dotPoints.includes(d.id));
                  return (
                    <li key={d.id} className="flex gap-3 rounded-lg p-1.5 hover:bg-panel2/50">
                      <button onClick={() => toggleProgress(dpKey(d.id))} aria-pressed={on} aria-label={`Mark ${d.id} as understood`} className={`mt-0.5 shrink-0 ${on ? 'text-good' : 'text-muted'}`}>
                        {on ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                      </button>
                      <div className="min-w-0 flex-1 text-sm">
                        <span className={on ? 'text-muted' : ''}>
                          <RichText text={d.text} />
                        </span>
                        {d.practical && (
                          <span className="ml-2">
                            <Chip tone="accent">Practical</Chip>
                          </span>
                        )}
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
                          {lessons.map((c) => (
                            <a key={c.id} href={`#${c.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(c.id)?.scrollIntoView({ behavior: 'smooth' }); }} className="text-accent hover:underline">
                              {c.title}
                            </a>
                          ))}
                          {d.sims.map((sid) => (
                            <Link key={sid} to={`/lab/${sid}`} className="text-muted hover:text-ink">
                              ▶ {SIMS.find((x) => x.id === sid)?.title ?? sid}
                            </Link>
                          ))}
                        </div>
                      </div>
                      <span className="num hidden shrink-0 text-[11px] text-muted sm:block">{d.id}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* -------- C. Lessons -------- */}
      <section>
        <PartTitle id="lessons" letter="C" title="Concept lessons">
          {prefs.mode === 'beginner'
            ? 'Beginner mode: simpler language first, then the key idea.'
            : prefs.mode === 'exam'
              ? 'Exam mode: concise HSC-standard statements and how each idea is examined.'
              : 'What it is, how it works and why — with diagrams, maths and a simulation for each idea.'}
        </PartTitle>
        <div className="space-y-10">
          {sections.map((s) => (
            <div key={s.id}>
              <h3 className={`mb-3 text-sm font-semibold uppercase tracking-wider ${modText(meta.no)}`}>{s.title}</h3>
              <div className="space-y-4">
                {content.concepts
                  .filter((c) => c.section === s.id)
                  .map((c) => (
                    <ConceptLesson key={c.id} c={c} moduleId={meta.id} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* -------- D. Formulas -------- */}
      <section>
        <PartTitle id="formulas" letter="D" title="Formulas">
          Every relationship used in this module. Open a calculator to solve for any variable, or the full formula page for worked examples and practice.
        </PartTitle>
        <div className="grid gap-3 md:grid-cols-2">
          {formulas.map((f) => (
            <div key={f.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold">{f.name}</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {f.onSheet ? <Chip tone="good">On formulae sheet</Chip> : <Chip>Not on sheet</Chip>}
                    {f.prereq && <Chip>Year 11</Chip>}
                    {f.supplementary && <Chip tone="warn">Supplementary</Chip>}
                  </div>
                </div>
                <Link to={`/formulas/${f.id}`} className="text-xs text-accent hover:underline">
                  Details →
                </Link>
              </div>
              <Tex block className="my-2 text-lg">
                {f.tex}
              </Tex>
              {!visual && <p className="prose-block text-sm text-muted">{f.interpretation}</p>}
              <div className="mt-3 print:hidden">
                <Disclosure title="Calculator">
                  <FormulaCalculator f={f} compact />
                </Disclosure>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* -------- E. Simulations -------- */}
      <section>
        <PartTitle id="simulations" letter="E" title="Simulations">
          Change the variables, predict first, then check. Each simulation shows its assumptions and limitations.
        </PartTitle>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {sims.map((s) => (
            <Link key={s.id} to={`/lab/${s.id}`} className="card group p-4 transition hover:border-accent/60">
              <div className="flex items-center justify-between">
                <FlaskConical className={`h-5 w-5 ${modText(meta.no)}`} aria-hidden />
                <Chip tone={s.model === 'quantitative' ? 'good' : 'default'}>{s.model}</Chip>
              </div>
              <div className="mt-2 font-semibold group-hover:text-accent">{s.title}</div>
              <p className="text-sm text-muted">{s.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* -------- F. Experiments -------- */}
      <section>
        <PartTitle id="experiments" letter="F" title="Experiments and evidence">
          Practical investigations you are expected to understand, and the historical experiments that shaped the theory.
        </PartTitle>
        <div className="grid gap-3 lg:grid-cols-2">
          {content.experiments.map((e) => (
            <div key={e.title} className="card p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Chip tone={e.kind === 'practical' ? 'accent' : 'warn'}>{e.kind === 'practical' ? 'Practical' : 'Historical'}</Chip>
                {e.who && <span className="text-xs text-muted">{e.who}</span>}
              </div>
              <h3 className="mt-2 font-semibold">{e.title}</h3>
              <p className="mt-1 text-sm">
                <strong>Aim:</strong> {e.aim}
              </p>
              <div className="mt-3 space-y-2">
                <Disclosure title="Method">
                  <ol className="list-decimal space-y-1 pl-5">
                    {e.method.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ol>
                </Disclosure>
                <Disclosure title="Observations, conclusion and limitations">
                  <p>
                    <strong>Observations:</strong> {e.observations}
                  </p>
                  <p className="mt-2">
                    <strong>Conclusion:</strong> {e.conclusion}
                  </p>
                  <p className="mt-2">
                    <strong>Limitations:</strong> {e.limitations}
                  </p>
                </Disclosure>
              </div>
            </div>
          ))}
        </div>
        <Link to="/working-scientifically" className="btn mt-4 inline-flex">
          <ScrollText className="h-4 w-4" /> Plan and analyse investigations in the Working Scientifically centre
        </Link>
      </section>

      {/* -------- G. HSC application -------- */}
      <section>
        <PartTitle id="hsc" letter="G" title="HSC application">
          How this module is typically examined, and the mistakes that cost marks.
        </PartTitle>
        <div className="grid gap-4 md:grid-cols-2">
          {(
            [
              ['Common question types', content.hsc.questionTypes],
              ['Typical calculations', content.hsc.typicalCalcs],
              ['Exam techniques', content.hsc.techniques],
              ['Common errors', content.hsc.commonErrors],
            ] as const
          ).map(([t, items]) => (
            <div key={t} className="card p-5">
              <div className="label mb-2">{t}</div>
              <ul className="list-disc space-y-1.5 pl-5 text-sm">
                {items.map((x) => (
                  <li key={x}>
                    <RichText text={x} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to={`/exam?module=${meta.no}`} className="btn btn-primary">
            <GraduationCap className="h-4 w-4" /> Practise Module {meta.no} questions
          </Link>
          {templates.slice(0, 4).map((t) => (
            <Link key={t.id} to={`/solver/${t.id}`} className="btn">
              <Target className="h-4 w-4" /> {t.title}
            </Link>
          ))}
        </div>
      </section>

      {/* -------- H. Quick revision -------- */}
      <section>
        <PartTitle id="revision" letter="H" title="Quick revision" />
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            <Callout kind="tip" title="30-second summary">
              {content.quick.summary30}
            </Callout>
            <div className="card p-5">
              <div className="label mb-2">Key takeaways</div>
              <ul className="list-disc space-y-1.5 pl-5 text-sm">
                {content.quick.takeaways.map((t) => (
                  <li key={t}>
                    <RichText text={t} />
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-5">
              <div className="label mb-2">Misconceptions to avoid</div>
              <ul className="space-y-2 text-sm">
                {content.quick.misconceptions.map((m) => (
                  <li key={m.wrong}>
                    <div className="text-bad">✗ {m.wrong}</div>
                    <div className="text-good">✓ {m.right}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="space-y-4">
            <div className="card p-5">
              <div className="label mb-2">Essential equations</div>
              <div className="grid gap-1 sm:grid-cols-2">
                {content.quick.equations.map((e) => (
                  <Tex key={e} block className="text-sm">
                    {e}
                  </Tex>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {content.quick.diagrams.map((d) => (
                <Diagram key={d} id={d} showCaption={false} />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6">
          <div className="label mb-2">Concept map</div>
          <Suspense fallback={<div className="grid h-[460px] place-items-center rounded-xl border border-line text-sm text-muted">Loading concept map…</div>}>
            <ConceptMap map={content.conceptMap} colour={meta.colour} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}

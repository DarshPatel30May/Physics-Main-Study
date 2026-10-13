import { Link } from 'react-router-dom';
import { MODULES, SECTIONS, ALL_DOT_POINTS } from '@/content/syllabus';
import { MODULE_CONTENT } from '@/content/modules';
import { TEMPLATES } from '@/content/solver';
import { useStore, type Attempt } from '@/lib/store';
import { Callout, ModuleBadge } from '@/components/ui';
import { ERROR_LABEL, EmptyState, MOD_BG, PageHeader, ProgressBar, accuracy, conceptKey, moduleProgress } from './shared';

const ERROR_TIP: Record<string, string> = {
  concept: 'Revisit the lesson and its misconception box, then explain the idea aloud in two sentences without notes.',
  formula: 'Check the conditions of use on each formula page — e.g. R = u² sin 2θ/g only for level ground.',
  calculation: 'Write the rearranged formula before substituting, keep unrounded values, and check your calculator is in degrees.',
  units: 'Convert every value to SI before substituting. Watch km, nm, μs, MHz, cm² and eV.',
  sign: 'Choose and state a sign convention (e.g. up positive) and keep it for every quantity.',
  graph: 'Read axes and units first; identify what the gradient and area represent in the Graph Lab.',
  skills: 'Review validity, reliability, accuracy and error types in the Working Scientifically centre.',
};

function Bar({ label, items, colour = 'bg-accent' }: { label: string; items: Attempt[]; colour?: string }) {
  const a = accuracy(items);
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="num text-muted">{a === null ? '—' : `${a}% (${items.length})`}</span>
      </div>
      <div className="mt-1">
        <ProgressBar pct={a ?? 0} colour={colour} label={`${label} accuracy`} />
      </div>
    </div>
  );
}

export default function Progress() {
  const { attempts, progress } = useStore();
  const errors = attempts.filter((a) => !a.correct && a.error);
  const errCounts = Object.entries(
    errors.reduce<Record<string, number>>((m, a) => ((m[a.error!] = (m[a.error!] ?? 0) + 1), m), {}),
  ).sort((a, b) => b[1] - a[1]);

  const sectionStats = SECTIONS.map((s) => {
    const items = attempts.filter((a) => a.section === s.id);
    return { s, items, acc: accuracy(items) };
  });
  const weak = sectionStats.filter((x) => x.items.length >= 2 && (x.acc ?? 100) < 65).sort((a, b) => (a.acc ?? 0) - (b.acc ?? 0));
  const untouched = sectionStats.filter((x) => x.items.length === 0);
  const recent = attempts.slice(-20);
  const conceptsDone = MODULES.map((m) => {
    const cs = MODULE_CONTENT[m.no].concepts;
    return { m, done: cs.filter((c) => progress[conceptKey(c.id)]).length, total: cs.length };
  });

  return (
    <div className="space-y-6">
      <PageHeader kicker="Progress" title="Performance and recommendations">
        Tracked by module, subtopic and error type from your practice questions, solver problems and mock exams. Data stays in this browser.
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {MODULES.map((m) => {
          const p = moduleProgress(progress, m.no);
          const c = conceptsDone.find((x) => x.m.no === m.no)!;
          const items = attempts.filter((a) => a.module === m.no);
          return (
            <div key={m.id} className="card space-y-3 p-4">
              <div className="flex items-center justify-between">
                <ModuleBadge m={m.no} />
                <Link to={`/module/${m.id}`} className="text-xs text-accent hover:underline">
                  Open →
                </Link>
              </div>
              <div className="font-semibold">{m.title}</div>
              <div>
                <div className="flex justify-between text-xs text-muted">
                  <span>Dot points ticked</span>
                  <span className="num">
                    {p.done}/{p.total}
                  </span>
                </div>
                <ProgressBar pct={p.pct} colour={MOD_BG[m.no]} />
              </div>
              <div>
                <div className="flex justify-between text-xs text-muted">
                  <span>Lessons studied</span>
                  <span className="num">
                    {c.done}/{c.total}
                  </span>
                </div>
                <ProgressBar pct={c.total ? Math.round((c.done / c.total) * 100) : 0} colour={MOD_BG[m.no]} />
              </div>
              <Bar label="Question accuracy" items={items} colour={MOD_BG[m.no]} />
            </div>
          );
        })}
      </div>

      {attempts.length === 0 ? (
        <EmptyState title="No attempts yet" to="/exam" cta="Start practising">
          Answer some questions in the Exam Centre or Problem Solver and your performance breakdown and recommendations will appear here.
        </EmptyState>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="card space-y-3 p-5">
              <h2 className="text-lg font-semibold">By subtopic</h2>
              {sectionStats
                .filter((x) => x.items.length)
                .map((x) => (
                  <Bar key={x.s.id} label={`M${x.s.module} · ${x.s.title}`} items={x.items} colour={MOD_BG[x.s.module]} />
                ))}
            </div>
            <div className="space-y-4">
              <div className="card space-y-3 p-5">
                <h2 className="text-lg font-semibold">Error types</h2>
                {errCounts.length ? (
                  errCounts.map(([e, n]) => (
                    <div key={e}>
                      <div className="flex justify-between text-sm">
                        <span>{ERROR_LABEL[e] ?? e}</span>
                        <span className="num text-muted">{n}</span>
                      </div>
                      <ProgressBar pct={Math.round((n / errors.length) * 100)} colour="bg-bad" />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted">No errors recorded — excellent.</p>
                )}
              </div>
              <div className="card p-5">
                <h2 className="text-lg font-semibold">Last {recent.length} attempts</h2>
                <div className="mt-2 flex flex-wrap gap-1" aria-label="Recent results">
                  {recent.map((a, i) => (
                    <span key={i} title={`${a.qid}: ${a.correct ? 'correct' : 'incorrect'}`} className={`h-4 w-4 rounded ${a.correct ? 'bg-good' : 'bg-bad'}`} />
                  ))}
                </div>
                <p className="num mt-2 text-sm text-muted">Overall: {accuracy(attempts)}% of {attempts.length}</p>
              </div>
            </div>
          </div>

          <div className="card space-y-4 p-5">
            <h2 className="text-lg font-semibold">Recommendations</h2>
            {weak.length > 0 && (
              <div>
                <div className="label mb-2">Focus on these subtopics</div>
                <ul className="space-y-2 text-sm">
                  {weak.slice(0, 4).map((x) => {
                    const tpl = TEMPLATES.find((t) => t.section === x.s.id);
                    return (
                      <li key={x.s.id} className="rounded-xl border border-line p-3">
                        <span className="font-semibold">{x.s.title}</span> — {x.acc}% from {x.items.length} attempts.{' '}
                        <Link to={`/module/m${x.s.module}#lessons`} className="text-accent hover:underline">
                          Re-read the lessons
                        </Link>
                        {tpl && (
                          <>
                            {' · '}
                            <Link to={`/solver/${tpl.id}`} className="text-accent hover:underline">
                              Guided problem: {tpl.title}
                            </Link>
                          </>
                        )}
                        {' · '}
                        <Link to={`/exam?module=${x.s.module}`} className="text-accent hover:underline">
                          More practice
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {errCounts[0] && (
              <Callout kind="tip" title={`Most common error: ${ERROR_LABEL[errCounts[0][0]]}`}>
                {ERROR_TIP[errCounts[0][0]]}
              </Callout>
            )}
            {untouched.length > 0 && (
              <div className="text-sm">
                <div className="label mb-1">Not yet practised</div>
                {untouched.map((x) => x.s.title).join(' · ')}
              </div>
            )}
            {weak.length === 0 && <p className="text-sm text-muted">No weak subtopics yet (fewer than 65% from at least two attempts). Raise the difficulty or try a mock exam.</p>}
          </div>
        </>
      )}
      <p className="text-xs text-muted">
        {ALL_DOT_POINTS.filter((d) => progress[`dp:${d.id}`]).length} of {ALL_DOT_POINTS.length} dot points ticked across all modules.
      </p>
    </div>
  );
}

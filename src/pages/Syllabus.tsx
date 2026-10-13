import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Square } from 'lucide-react';
import { MODULES, SECTIONS, SOURCE_NOTE } from '@/content/syllabus';
import { conceptsForDotPoint } from '@/content/modules';
import { QUESTIONS } from '@/content/questions';
import { simById } from '@/content/sims';
import { formulaById } from '@/content/formulas';
import { useStore } from '@/lib/store';
import { Chip, RichText, Tabs, Tex } from '@/components/ui';
import { PageHeader, dpKey } from './shared';

type View = 'explorer' | 'matrix';
type Filter = 'all' | '5' | '6' | '7' | '8';

export default function Syllabus() {
  const { progress, toggleProgress } = useStore();
  const [view, setView] = useState<View>('explorer');
  const [mod, setMod] = useState<Filter>('all');
  const sections = SECTIONS.filter((s) => mod === 'all' || String(s.module) === mod);
  const qCount = useMemo(() => {
    const m: Record<string, number> = {};
    QUESTIONS.forEach((q) => q.dotPoints.forEach((d) => (m[d] = (m[d] ?? 0) + 1)));
    return m;
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader kicker="Syllabus explorer" title="NSW Physics Stage 6 — Modules 5 to 8">
        Every inquiry question and content dot point, mapped to its lesson, visualisation, formulas and practice questions. Tick dot points as you master them.
      </PageHeader>
      <div className="flex flex-wrap gap-3">
        <Tabs<View> value={view} onChange={setView} tabs={[{ id: 'explorer', label: 'Explorer' }, { id: 'matrix', label: 'Coverage matrix' }]} />
        <Tabs<Filter> value={mod} onChange={setMod} tabs={[{ id: 'all', label: 'All' }, { id: '5', label: 'M5' }, { id: '6', label: 'M6' }, { id: '7', label: 'M7' }, { id: '8', label: 'M8' }]} />
      </div>

      {view === 'explorer' ? (
        MODULES.filter((m) => mod === 'all' || String(m.no) === mod).map((m) => (
          <section key={m.id} className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">
              Module {m.no}: {m.title}
            </h2>
            {sections
              .filter((s) => s.module === m.no)
              .map((s) => (
                <div key={s.id} className="card p-5">
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm">
                    <span className="label mr-1">Inquiry question</span>
                    <q className="italic">{s.inquiry}</q>
                  </p>
                  <ul className="mt-3 space-y-3">
                    {s.dotPoints.map((d) => {
                      const on = !!progress[dpKey(d.id)];
                      const lessons = conceptsForDotPoint(d.id);
                      return (
                        <li key={d.id} id={d.id} className="scroll-mt-24 rounded-xl border border-line p-3 target:border-accent target:bg-accent/5">
                          <div className="flex gap-3">
                            <button onClick={() => toggleProgress(dpKey(d.id))} aria-pressed={on} aria-label={`Mark ${d.id} as understood`} className={`mt-0.5 shrink-0 ${on ? 'text-good' : 'text-muted'}`}>
                              {on ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                            </button>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="num text-xs text-muted">{d.id}</span>
                                {d.practical && <Chip tone="accent">Practical</Chip>}
                              </div>
                              <p className="mt-0.5 text-sm">
                                <RichText text={d.text} />
                              </p>
                              {d.relationships && d.relationships.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-x-4 text-sm">
                                  {d.relationships.map((r) => (
                                    <Tex key={r}>{r}</Tex>
                                  ))}
                                </div>
                              )}
                              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                                {lessons.map((c) => (
                                  <Link key={c.id} to={`/module/m${m.no}#${c.id}`} className="text-accent hover:underline">
                                    Lesson: {c.title}
                                  </Link>
                                ))}
                                {d.sims.map((id) => (
                                  <Link key={id} to={`/lab/${id}`} className="text-m7 hover:underline">
                                    Sim: {simById(id)?.title ?? id}
                                  </Link>
                                ))}
                                {d.formulas.map((id) => (
                                  <Link key={id} to={`/formulas/${id}`} className="text-muted hover:text-ink">
                                    ƒ {formulaById(id)?.name ?? id}
                                  </Link>
                                ))}
                                {(qCount[d.id] ?? 0) > 0 && (
                                  <Link to={`/exam?dp=${d.id}`} className="text-good hover:underline">
                                    {qCount[d.id]} practice question{qCount[d.id] > 1 ? 's' : ''}
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
          </section>
        ))
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-panel2/60 text-left text-xs text-muted">
              <tr>
                <th className="px-3 py-2">Dot point</th>
                <th className="px-3 py-2">Lesson</th>
                <th className="px-3 py-2">Visualisation</th>
                <th className="px-3 py-2">Formulas</th>
                <th className="px-3 py-2">Practice</th>
                <th className="px-3 py-2">Done</th>
              </tr>
            </thead>
            <tbody>
              {sections.flatMap((s) =>
                s.dotPoints.map((d) => {
                  const lessons = conceptsForDotPoint(d.id);
                  return (
                    <tr key={d.id} className="border-t border-line align-top">
                      <td className="max-w-md px-3 py-2">
                        <a href={`#${d.id}`} onClick={(e) => { e.preventDefault(); setView('explorer'); setTimeout(() => document.getElementById(d.id)?.scrollIntoView({ behavior: 'smooth' }), 50); }} className="num text-xs text-accent hover:underline">
                          {d.id}
                        </a>
                        <div className="line-clamp-2 text-xs">
                          <RichText text={d.text} />
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs">{lessons.length ? lessons.map((c) => <div key={c.id}><Link to={`/module/m${s.module}#${c.id}`} className="hover:text-accent">{c.title}</Link></div>) : <span className="text-bad">—</span>}</td>
                      <td className="px-3 py-2 text-xs">{d.sims.length ? d.sims.map((id) => <div key={id}><Link to={`/lab/${id}`} className="hover:text-accent">{simById(id)?.title ?? id}</Link></div>) : <span className="text-muted">—</span>}</td>
                      <td className="px-3 py-2 text-xs">{d.formulas.length ? d.formulas.map((id) => <div key={id}><Link to={`/formulas/${id}`} className="hover:text-accent">{formulaById(id)?.name ?? id}</Link></div>) : <span className="text-muted">qualitative</span>}</td>
                      <td className="num px-3 py-2 text-xs">{qCount[d.id] ?? 0}</td>
                      <td className="px-3 py-2">{progress[dpKey(d.id)] ? <CheckSquare className="h-4 w-4 text-good" /> : <Square className="h-4 w-4 text-muted" />}</td>
                    </tr>
                  );
                }),
              )}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-muted">{SOURCE_NOTE}</p>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { HISTORY, type HistoryEntry } from '@/content/history';
import { BookmarkButton, ModuleBadge, Tabs } from '@/components/ui';
import { PageHeader } from './shared';

type Thread = 'all' | HistoryEntry['thread'];
const THREADS: { id: Thread; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'gravity', label: 'Gravity & motion' },
  { id: 'electromagnetism', label: 'Electromagnetism' },
  { id: 'light', label: 'Light' },
  { id: 'relativity', label: 'Relativity' },
  { id: 'atom', label: 'The atom' },
  { id: 'nucleus', label: 'Nucleus & particles' },
  { id: 'cosmos', label: 'Cosmos' },
];
const DOT: Record<number, string> = { 5: 'bg-m5', 6: 'bg-m6', 7: 'bg-m7', 8: 'bg-m8' };

export default function Timeline() {
  const [thread, setThread] = useState<Thread>('all');
  const list = useMemo(() => [...HISTORY].filter((h) => thread === 'all' || h.thread === thread).sort((a, b) => a.year - b.year), [thread]);
  return (
    <div>
      <PageHeader kicker="Scientific discoveries" title="How evidence changed our models">
        Key experiments and ideas from Galileo to the Higgs boson. Each entry shows the evidence, why it mattered and which earlier model it replaced or refined. Dates refer to key publications or experiments; most discoveries involved many contributors.
      </PageHeader>
      <div className="mb-6">
        <Tabs<Thread> value={thread} onChange={setThread} tabs={THREADS} size="sm" />
      </div>
      <ol className="relative ml-3 border-l-2 border-line">
        {list.map((h) => (
          <li key={h.id} id={h.id} className="relative mb-6 scroll-mt-24 pl-6">
            <span className={`absolute -left-[9px] top-2 h-4 w-4 rounded-full ring-4 ring-bg ${DOT[h.module]}`} aria-hidden />
            <div className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="num text-sm font-semibold text-accent">{h.when}</div>
                  <h2 className="text-lg font-semibold">{h.who}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <ModuleBadge m={h.module} />
                  <BookmarkButton bm={{ id: `history:${h.id}`, kind: 'history', title: `${h.who} (${h.when})`, href: `/timeline#${h.id}` }} />
                </div>
              </div>
              <p className="mt-2 font-medium">{h.discovery}</p>
              <dl className="mt-3 grid gap-3 text-sm md:grid-cols-3">
                <div>
                  <dt className="label">Evidence</dt>
                  <dd className="mt-0.5">{h.evidence}</dd>
                </div>
                <div>
                  <dt className="label">Significance</dt>
                  <dd className="mt-0.5">{h.significance}</dd>
                </div>
                <div>
                  <dt className="label">How the model changed</dt>
                  <dd className="mt-0.5">{h.modelChange}</dd>
                </div>
              </dl>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, Search } from 'lucide-react';
import { SIMS, type SimCategory } from '@/content/sims';
import type { ModuleNo } from '@/content/formulas';
import { Chip, ModuleBadge, Tabs, modText } from '@/components/ui';
import { PageHeader } from './shared';

type Filter = 'all' | `${ModuleNo}`;
const CATS: SimCategory[] = ['Mechanics', 'Electromagnetism', 'Light', 'Modern Physics'];

export default function Lab() {
  const [mod, setMod] = useState<Filter>('all');
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return SIMS.filter((s) => (mod === 'all' || String(s.module) === mod) && (!t || `${s.title} ${s.blurb}`.toLowerCase().includes(t)));
  }, [mod, q]);

  return (
    <div>
      <PageHeader kicker="Physics Lab" title="Interactive simulations">
        {SIMS.length} simulations covering every module. Each one states whether it is a quantitative model (calculated from the physics) or a conceptual visualisation, with its assumptions and limitations.
      </PageHeader>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Tabs<Filter>
          value={mod}
          onChange={setMod}
          tabs={[
            { id: 'all', label: 'All' },
            { id: '5', label: 'Module 5' },
            { id: '6', label: 'Module 6' },
            { id: '7', label: 'Module 7' },
            { id: '8', label: 'Module 8' },
          ]}
        />
        <label className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <span className="sr-only">Filter simulations</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <input className="input !pl-9" placeholder="Filter simulations…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
      </div>
      {CATS.map((cat) => {
        const items = list.filter((s) => s.category === cat);
        if (!items.length) return null;
        return (
          <section key={cat} className="mb-8">
            <h2 className="mb-3 text-lg font-semibold">{cat}</h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((s) => (
                <Link key={s.id} to={`/lab/${s.id}`} className="card group flex flex-col p-4 transition hover:-translate-y-0.5 hover:border-accent/60">
                  <div className="flex items-center justify-between gap-2">
                    <FlaskConical className={`h-5 w-5 ${modText(s.module)}`} aria-hidden />
                    <div className="flex gap-1">
                      <ModuleBadge m={s.module}>M{s.module}</ModuleBadge>
                      <Chip tone={s.model === 'quantitative' ? 'good' : 'default'}>{s.model}</Chip>
                    </div>
                  </div>
                  <div className="mt-2 font-semibold group-hover:text-accent">{s.title}</div>
                  <p className="mt-0.5 text-sm text-muted">{s.blurb}</p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
      {!list.length && <p className="text-muted">No simulations match “{q}”.</p>}
    </div>
  );
}

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { FORMULAS } from '@/content/formulas';
import { sectionById } from '@/content/syllabus';
import { Chip, ModuleBadge, Tabs, Tex, Toggle } from '@/components/ui';
import { PageHeader } from './shared';

type Filter = 'all' | '5' | '6' | '7' | '8';

export default function FormulaCentre() {
  const [mod, setMod] = useState<Filter>('all');
  const [q, setQ] = useState('');
  const [sheetOnly, setSheetOnly] = useState(false);
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return FORMULAS.filter(
      (f) =>
        (mod === 'all' || String(f.module) === mod) &&
        (!sheetOnly || f.onSheet) &&
        (!t || `${f.name} ${f.interpretation} ${f.vars.map((v) => v.name).join(' ')}`.toLowerCase().includes(t)),
    );
  }, [mod, q, sheetOnly]);

  const groups = useMemo(() => {
    const m = new Map<string, typeof list>();
    list.forEach((f) => m.set(f.section, [...(m.get(f.section) ?? []), f]));
    return [...m.entries()];
  }, [list]);

  return (
    <div>
      <PageHeader kicker="Formula Centre" title="Every formula, explained">
        {FORMULAS.length} relationships with notation, variables, SI units, conditions, a worked example, a calculator that solves for any variable, common errors and a practice question. Formulas marked “On formulae sheet” appear on the NESA Physics formulae sheet.
      </PageHeader>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Tabs<Filter>
          value={mod}
          onChange={setMod}
          tabs={[
            { id: 'all', label: 'All' },
            { id: '5', label: 'M5' },
            { id: '6', label: 'M6' },
            { id: '7', label: 'M7' },
            { id: '8', label: 'M8' },
          ]}
        />
        <label className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <span className="sr-only">Filter formulas</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <input className="input !pl-9" placeholder="Search by name or variable…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <Toggle label="Formulae sheet only" checked={sheetOnly} onChange={setSheetOnly} />
      </div>
      {groups.map(([sid, fs]) => (
        <section key={sid} className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <ModuleBadge m={fs[0].module}>M{fs[0].module}</ModuleBadge> {sectionById(sid)?.title ?? sid}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {fs.map((f) => (
              <Link key={f.id} to={`/formulas/${f.id}`} className="card group flex flex-col p-4 transition hover:border-accent/60">
                <div className="text-sm font-semibold group-hover:text-accent">{f.name}</div>
                <Tex block className="my-3 text-lg">
                  {f.tex}
                </Tex>
                <div className="mt-auto flex flex-wrap gap-1">
                  {f.onSheet ? <Chip tone="good">On formulae sheet</Chip> : <Chip>Not on sheet</Chip>}
                  {f.prereq && <Chip>Year 11</Chip>}
                  {f.supplementary && <Chip tone="warn">Supplementary</Chip>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
      {!list.length && <p className="text-muted">No formulas match.</p>}
    </div>
  );
}

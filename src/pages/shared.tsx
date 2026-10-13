import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { MODULES, ALL_DOT_POINTS, type ModuleMeta } from '@/content/syllabus';
import type { ModuleNo } from '@/content/formulas';
import type { Attempt } from '@/lib/store';
import { Graph } from '@/components/Graph';
import { Diagram } from '@/components/diagrams';
import type { Figure } from '@/content/questions';

/** Progress keys: dot points ticked in a syllabus checklist. */
export const dpKey = (id: string) => `dp:${id}`;
/** Progress keys: lesson concepts marked as studied. */
export const conceptKey = (id: string) => `concept:${id}`;

export function moduleFromParam(id?: string): ModuleMeta | undefined {
  if (!id) return undefined;
  return MODULES.find((m) => m.id === id || String(m.no) === id);
}

export function moduleProgress(progress: Record<string, boolean>, m: ModuleNo) {
  const dps = ALL_DOT_POINTS.filter((d) => d.module === m);
  const done = dps.filter((d) => progress[dpKey(d.id)]).length;
  return { done, total: dps.length, pct: dps.length ? Math.round((done / dps.length) * 100) : 0 };
}

export function PageHeader({ kicker, title, children, actions }: { kicker?: string; title: string; children?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {kicker && <div className="label mb-1">{kicker}</div>}
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {children && <div className="prose-block mt-2 max-w-3xl text-muted">{children}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2 print:hidden">{actions}</div>}
    </header>
  );
}

export function ProgressBar({ pct, colour = 'bg-accent', label }: { pct: number; colour?: string; label?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className={`h-full rounded-full ${colour} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export const MOD_BG: Record<ModuleNo, string> = { 5: 'bg-m5', 6: 'bg-m6', 7: 'bg-m7', 8: 'bg-m8' };
export const MOD_BORDER: Record<ModuleNo, string> = { 5: 'border-m5/50', 6: 'border-m6/50', 7: 'border-m7/50', 8: 'border-m8/50' };

/** Renders a question figure (plot or static diagram). */
export function QuestionFigure({ fig }: { fig: Figure }) {
  if (fig.kind === 'diagram') return <Diagram id={fig.id} className="max-w-md" />;
  const xs = Array.from(new Set(fig.series.flatMap((s) => s.points.map((p) => p[0])))).sort((a, b) => a - b);
  const data = xs.map((x) => {
    const row: Record<string, number | null> = { x };
    fig.series.forEach((s, i) => {
      const p = s.points.find((q) => q[0] === x);
      row[`s${i}`] = p ? p[1] : null;
    });
    return row;
  });
  return (
    <div className="max-w-lg rounded-xl border border-line p-2">
      <Graph
        data={data}
        xKey="x"
        series={fig.series.map((s, i) => ({ key: `s${i}`, label: s.label ?? `series ${i + 1}`, dashed: s.dashed, dot: true }))}
        xLabel={fig.xLabel}
        yLabel={fig.yLabel}
        xDomain={[0, fig.xMax ?? 'auto']}
        yDomain={[fig.yMin ?? 0, fig.yMax ?? 'auto']}
        legend={fig.series.length > 1}
        height={220}
      />
    </div>
  );
}

export const ERROR_LABEL: Record<string, string> = {
  concept: 'Conceptual misunderstanding',
  formula: 'Wrong formula or relationship',
  calculation: 'Calculation / substitution',
  units: 'Units or prefixes',
  sign: 'Sign or direction',
  graph: 'Graph interpretation',
  skills: 'Working Scientifically skills',
};

export function accuracy(attempts: Attempt[]) {
  if (!attempts.length) return null;
  return Math.round((attempts.filter((a) => a.correct).length / attempts.length) * 100);
}

export function EmptyState({ title, children, to, cta }: { title: string; children?: ReactNode; to?: string; cta?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line p-8 text-center">
      <div className="font-semibold">{title}</div>
      {children && <div className="mx-auto mt-1 max-w-md text-sm text-muted">{children}</div>}
      {to && cta && (
        <Link to={to} className="btn btn-primary mt-4 inline-flex">
          {cta}
        </Link>
      )}
    </div>
  );
}

/** Seeded shuffle (Fisher–Yates) for reproducible question orders. */
export function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function download(filename: string, text: string, type = 'text/csv') {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

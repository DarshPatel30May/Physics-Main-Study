import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { GRAPHS } from '@/content/graphs';
import { STARS } from '@/content/stars';
import { Graph } from '@/components/Graph';
import { BookmarkButton, Callout, ModuleBadge, Select, Slider, Stat } from '@/components/ui';
import { PageHeader } from './shared';
import NotFound from './NotFound';

/** Linear interpolation of series `key` at x (data sorted by xKey ascending). */
function interp(data: Record<string, number | null>[], xKey: string, key: string, x: number): number {
  for (let i = 0; i < data.length - 1; i++) {
    const a = data[i];
    const b = data[i + 1];
    const xa = a[xKey] as number;
    const xb = b[xKey] as number;
    if ((x >= xa && x <= xb) || (x <= xa && x >= xb)) {
      const ya = a[key];
      const yb = b[key];
      if (ya == null || yb == null) return NaN;
      return xb === xa ? ya : ya + ((yb - ya) * (x - xa)) / (xb - xa);
    }
  }
  return NaN;
}

/** Trapezium-rule area under series `key` between x1 and x2. */
function area(data: Record<string, number | null>[], xKey: string, key: string, x1: number, x2: number): number {
  const lo = Math.min(x1, x2);
  const hi = Math.max(x1, x2);
  const n = 400;
  let s = 0;
  for (let i = 0; i < n; i++) {
    const xa = lo + ((hi - lo) * i) / n;
    const xb = lo + ((hi - lo) * (i + 1)) / n;
    const ya = interp(data, xKey, key, xa);
    const yb = interp(data, xKey, key, xb);
    if (!Number.isFinite(ya) || !Number.isFinite(yb)) return NaN;
    s += ((ya + yb) / 2) * (xb - xa);
  }
  return x2 >= x1 ? s : -s;
}

export default function GraphLab() {
  const { id } = useParams();
  const nav = useNavigate();
  const g = id ? GRAPHS.find((x) => x.id === id) : GRAPHS[0];
  if (!g) return <NotFound />;
  return <GraphView key={g.id} id={g.id} onPick={(v) => nav(`/graphs/${v}`)} />;
}

function GraphView({ id, onPick }: { id: string; onPick: (id: string) => void }) {
  const g = GRAPHS.find((x) => x.id === id)!;
  const [params, setParams] = useState<Record<string, number>>(() => Object.fromEntries(g.params.map((p) => [p.key, p.def])));
  const built = useMemo(() => g.build(params), [g, params]);
  const isHR = g.id === 'hr';
  const sorted = useMemo(() => [...built.data].sort((a, b) => (a[built.xKey] as number) - (b[built.xKey] as number)), [built]);
  const xs = sorted.map((d) => d[built.xKey] as number).filter(Number.isFinite);
  const xMin = xs.length ? xs[0] : 0;
  const xMax = xs.length ? xs[xs.length - 1] : 1;
  const [seriesKey, setSeriesKey] = useState(built.series[0]?.key ?? '');
  const [f1, setF1] = useState(0.25);
  const [f2, setF2] = useState(0.75);
  const linearX = (built.xScale ?? 'linear') === 'linear' && (built.yScale ?? 'linear') === 'linear' && !isHR;
  const x1 = xMin + (xMax - xMin) * f1;
  const x2 = xMin + (xMax - xMin) * f2;
  const y1 = interp(sorted, built.xKey, seriesKey, x1);
  const y2 = interp(sorted, built.xKey, seriesKey, x2);
  const grad = (y2 - y1) / (x2 - x1);
  const ar = area(sorted, built.xKey, seriesKey, x1, x2);

  return (
    <div className="space-y-6">
      <PageHeader kicker="Graph Lab" title={g.title} actions={<BookmarkButton bm={{ id: `graph:${g.id}`, kind: 'graph', title: g.title, href: `/graphs/${g.id}` }} />}>
        Change the parameters and watch the shape respond. Use the gradient and area tools to connect each graph to the physics.
      </PageHeader>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
        <nav aria-label="Graphs" className="card h-fit p-2">
          <div className="lg:hidden">
            <Select label="Choose a graph" value={g.id} options={GRAPHS.map((x) => ({ value: x.id, label: `M${x.module} · ${x.title}` }))} onChange={onPick} />
          </div>
          <ul className="hidden space-y-0.5 lg:block">
            {GRAPHS.map((x) => (
              <li key={x.id}>
                <Link to={`/graphs/${x.id}`} aria-current={x.id === g.id ? 'page' : undefined} className={`flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm ${x.id === g.id ? 'bg-panel2 font-semibold ring-1 ring-line' : 'text-muted hover:text-ink'}`}>
                  <ModuleBadge m={x.module}>{x.module}</ModuleBadge>
                  <span>{x.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-4">
          <div className="card p-4">
            {isHR ? (
              <Graph
                data={[]}
                xKey="x"
                series={[]}
                scatter={[{ name: 'stars', data: STARS.map((s) => ({ x: s.T, y: s.L })) }]}
                xLabel={g.xLabel}
                yLabel={g.yLabel}
                xScale="log"
                yScale="log"
                reversedX
                xDomain={[2500, 40000]}
                yDomain={[1e-4, 1e6]}
                xTicks={[30000, 20000, 10000, 6000, 4000, 3000]}
                yTicks={[1e-4, 1e-2, 1, 1e2, 1e4, 1e6]}
                xFormat={(v) => v.toLocaleString('en-AU')}
                yFormat={(v) => (v >= 1 ? v.toLocaleString('en-AU') : String(v))}
                height={380}
              />
            ) : (
              <Graph
                data={built.data}
                xKey={built.xKey}
                series={built.series}
                xLabel={g.xLabel}
                yLabel={g.yLabel}
                xDomain={built.xDomain}
                yDomain={built.yDomain}
                xScale={built.xScale}
                yScale={built.yScale}
                reversedX={built.reversedX}
                refX={[...(built.refX ?? []), ...(linearX ? [{ x: x1, label: 'x₁' }, { x: x2, label: 'x₂' }] : [])]}
                refY={built.refY}
                dots={[...(built.dots ?? []), ...(linearX && Number.isFinite(y1) && Number.isFinite(y2) ? [{ x: x1, y: y1 }, { x: x2, y: y2 }] : [])]}
                legend={built.series.length > 1}
                height={360}
              />
            )}
            {built.readout && <p className="num mt-2 text-sm text-muted">{built.readout}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="card space-y-3 p-5">
              <div className="label">Parameters</div>
              {g.params.length ? (
                g.params.map((p) => <Slider key={p.key} label={p.label} unit={p.unit} min={p.min} max={p.max} step={p.step} value={params[p.key]} onChange={(v) => setParams((s) => ({ ...s, [p.key]: v }))} />)
              ) : (
                <p className="text-sm text-muted">This graph plots fixed reference data.</p>
              )}
              {linearX && built.series.length > 0 && (
                <div className="space-y-3 border-t border-line pt-3">
                  <div className="label">Gradient and area tool</div>
                  {built.series.length > 1 && <Select label="Series" value={seriesKey} options={built.series.map((s) => ({ value: s.key, label: s.label }))} onChange={setSeriesKey} />}
                  <Slider label="x₁" min={0} max={1} step={0.01} value={f1} onChange={setF1} format={() => x1.toPrecision(3)} />
                  <Slider label="x₂" min={0} max={1} step={0.01} value={f2} onChange={setF2} format={() => x2.toPrecision(3)} />
                  <div className="grid grid-cols-2 gap-2">
                    <Stat label="Gradient Δy/Δx (secant)" value={grad} />
                    <Stat label="Area under curve x₁→x₂" value={ar} />
                  </div>
                  <p className="text-[11px] text-muted">Gradient of the chord between the two points; area by the trapezium rule (regions below the axis count as negative).</p>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <Callout kind="info" title="Relationship">
                {g.relationship}
              </Callout>
              {g.gradient && (
                <Callout kind="tip" title="Gradient means">
                  {g.gradient}
                </Callout>
              )}
              {g.area && (
                <Callout kind="tip" title="Area means">
                  {g.area}
                </Callout>
              )}
              <Callout kind="warn" title="Limitations">
                {g.limitations}
              </Callout>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

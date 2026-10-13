import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, Download, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { WS_OUTCOMES } from '@/content/syllabus';
import { INVESTIGATIONS, type Investigation } from '@/content/investigations';
import { mulberry32 } from '@/lib/physics/nuclear';
import { flagAnomalies, linearFit, sig } from '@/lib/physics/stats';
import { Graph } from '@/components/Graph';
import { Callout, Chip, Disclosure, ModuleBadge, Select, Stat, Tabs, Toggle } from '@/components/ui';
import { PageHeader, download } from './shared';

type Tab = 'skills' | 'builder' | 'analysis';

const SKILLS: { title: string; body: string; tips: string[] }[] = [
  { title: 'Validity', body: 'An investigation is valid if it actually tests the hypothesis: one independent variable is changed, the dependent variable is measured appropriately, and all other variables are controlled.', tips: ['Name the controlled variables AND how each is controlled.', 'A method can be reliable but not valid (e.g. consistently measuring the wrong thing).'] },
  { title: 'Reliability', body: 'Results are reliable if repeating the measurement gives consistent values. Reliability is improved by repeat trials and averaging, and is judged by the spread of the repeats.', tips: ['Repeating improves reliability, NOT accuracy.', 'Quote the spread (e.g. half-range) as the uncertainty of an average.'] },
  { title: 'Accuracy', body: 'A result is accurate if it is close to the accepted (true) value. Systematic errors reduce accuracy and are not reduced by repetition.', tips: ['Compare with an accepted value using percentage difference.', 'Calibrate instruments and check for zero errors.'] },
  { title: 'Random vs systematic error', body: 'Random errors scatter results either side of the true value (reduced by repeats). Systematic errors shift all results in one direction (reduced by better method or calibration).', tips: ['Reaction time with a stopwatch: mostly random.', 'An uncalibrated scale that reads 0.2 g high: systematic.', 'Systematic error shows up as a non-zero intercept on a graph that should pass through the origin.'] },
  { title: 'Uncertainty', body: 'Absolute uncertainty from an instrument is often half the smallest division (analogue) or ± the last digit (digital). For repeats use half the range. Percentage uncertainties add when quantities are multiplied or divided.', tips: ['Uncertainty of xⁿ: n × percentage uncertainty of x.', 'Do not quote more significant figures than the data justify.'] },
  { title: 'Linearising data', body: 'Rearrange the expected relationship into the form y = mx + c, then plot transformed variables so a straight line results. The gradient (and intercept) give physical quantities.', tips: ['T² vs r³ for Kepler’s third law.', 'K_max vs f for the photoelectric effect (gradient h).', 'ln N vs t for decay (gradient −λ).'] },
  { title: 'Anomalous results', body: 'An anomaly lies well away from the trend. It should be identified, explained if possible, and repeated — never silently deleted. Report whether it was excluded from the line of best fit and why.', tips: ['This site flags anomalies but never removes them for you.'] },
  { title: 'Risk assessment', body: 'Identify each hazard, the risk it poses, and a specific control measure. Generic statements such as “be careful” are not risk controls.', tips: ['Hazard → risk → control.', 'High voltage, lasers, hot objects, heavy masses and projectiles are common physics hazards.'] },
];

function gauss(rand: () => number) {
  const u = Math.max(rand(), 1e-12);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export default function WorkingScientifically() {
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>(params.get('inv') ? 'builder' : 'skills');
  return (
    <div className="space-y-6">
      <PageHeader kicker="Working Scientifically" title="Investigate like a scientist">
        Skills for the HSC Working Scientifically outcomes, an investigation builder for key practicals, and a data analysis tool with regression, uncertainty and anomaly flagging.
      </PageHeader>
      <Tabs<Tab>
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'skills', label: 'Skills' },
          { id: 'builder', label: 'Investigation builder' },
          { id: 'analysis', label: 'Data analysis tool' },
        ]}
      />
      {tab === 'skills' && <Skills />}
      {tab === 'builder' && <Builder initial={params.get('inv') ?? INVESTIGATIONS[0].id} onPick={(id) => setParams({ inv: id }, { replace: true })} />}
      {tab === 'analysis' && <Analysis />}
    </div>
  );
}

function Skills() {
  return (
    <div className="space-y-6">
      <div className="card p-5">
        <div className="label mb-2">Year 12 Working Scientifically outcomes</div>
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {WS_OUTCOMES.map((o) => (
            <li key={o.code} className="rounded-xl border border-line p-3 text-sm">
              <span className="num font-semibold text-accent">{o.code}</span> · <span className="font-semibold">{o.skill}</span>
              <p className="mt-0.5 text-muted">A student {o.text}.</p>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-muted">Outcomes: NSW Physics Stage 6 Syllabus (2017) © NESA.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {SKILLS.map((s) => (
          <div key={s.title} className="card p-5">
            <h3 className="font-semibold">{s.title}</h3>
            <p className="mt-1 text-sm">{s.body}</p>
            <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-muted">
              {s.tips.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function makeData(inv: Investigation, seed: number): { points: [number, number][]; simulated: boolean; source: string } {
  if (inv.data) return { points: inv.data.points, simulated: false, source: inv.data.source };
  const rand = mulberry32(seed);
  return {
    points: inv.xs.map((x) => [x, inv.model(x) * (1 + inv.noise * gauss(rand))]),
    simulated: true,
    source: `Simulated: model values with ${Math.round(inv.noise * 100)}% random (Gaussian) error — not real experimental results.`,
  };
}

function Builder({ initial, onPick }: { initial: string; onPick: (id: string) => void }) {
  const [id, setId] = useState(INVESTIGATIONS.some((i) => i.id === initial) ? initial : INVESTIGATIONS[0].id);
  const inv = INVESTIGATIONS.find((i) => i.id === id)!;
  const [seed, setSeed] = useState(7);
  const d = useMemo(() => makeData(inv, seed), [inv, seed]);
  const lx = d.points.map((p) => inv.linearise.fx(p[0]));
  const ly = d.points.map((p) => (inv.linearise.fy ? inv.linearise.fy(p[1]) : p[1]));
  const fit = linearFit(lx, ly);
  const flags = flagAnomalies(lx, ly);
  const lo = Math.min(...lx);
  const hi = Math.max(...lx);
  const fitLine = fit ? [lo, hi].map((x) => ({ x, y: fit.m * x + fit.c })) : [];

  const parts: [string, React.ReactNode][] = [
    ['1. Inquiry question', inv.question],
    ['2. Hypothesis', inv.hypothesis],
    [
      '3. Variables',
      <ul key="v" className="space-y-0.5">
        <li><strong>Independent:</strong> {inv.variables.independent}</li>
        <li><strong>Dependent:</strong> {inv.variables.dependent}</li>
        <li><strong>Controlled:</strong> {inv.variables.controlled.join('; ')}</li>
      </ul>,
    ],
    ['4. Equipment', <ul key="e" className="list-disc pl-5">{inv.equipment.map((x) => <li key={x}>{x}</li>)}</ul>],
    ['5. Method', <ol key="m" className="list-decimal pl-5">{inv.method.map((x) => <li key={x}>{x}</li>)}</ol>],
    [
      '6. Risk assessment',
      <table key="r" className="w-full text-sm">
        <thead><tr className="text-left text-xs text-muted"><th className="pr-2">Hazard</th><th>Control</th></tr></thead>
        <tbody>{inv.risks.map((r) => <tr key={r.hazard} className="border-t border-line"><td className="py-1 pr-2">{r.hazard}</td><td className="py-1">{r.control}</td></tr>)}</tbody>
      </table>,
    ],
    ['7. Expected results', inv.expected],
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full max-w-md">
          <Select label="Investigation" value={id} options={INVESTIGATIONS.map((i) => ({ value: i.id, label: `M${i.module} · ${i.title}` }))} onChange={(v) => { setId(v); onPick(v); }} />
        </div>
        <ModuleBadge m={inv.module} />
        {inv.dotPoints.map((dp) => <Chip key={dp}>{dp}</Chip>)}
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {parts.map(([t, body]) => (
          <div key={t} className="card p-4">
            <div className="label mb-1">{t}</div>
            <div className="text-sm">{body}</div>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="label">8. Results table</div>
          <div className="flex gap-2">
            {d.simulated && (
              <button className="btn !py-1 text-xs" onClick={() => setSeed((s) => s + 1)}>
                <RefreshCw className="h-3.5 w-3.5" /> New simulated run
              </button>
            )}
            <button className="btn !py-1 text-xs" onClick={() => download(`${inv.id}.csv`, `${inv.table.x} (${inv.table.xUnit}),${inv.table.y} (${inv.table.yUnit})\n${d.points.map((p) => p.join(',')).join('\n')}`)}>
              <Download className="h-3.5 w-3.5" /> CSV
            </button>
          </div>
        </div>
        <p className={`mt-1 text-xs ${d.simulated ? 'text-warn' : 'text-muted'}`}>{d.source}</p>
        <div className="mt-3 overflow-x-auto">
          <table className="num w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="py-1 pr-3">{inv.table.x} ({inv.table.xUnit})</th>
                <th className="py-1 pr-3">{inv.table.y} ({inv.table.yUnit})</th>
                <th className="py-1 pr-3">{inv.linearise.xLabel}</th>
                <th className="py-1 pr-3">{inv.linearise.yLabel ?? inv.table.y}</th>
                <th className="py-1">Flag</th>
              </tr>
            </thead>
            <tbody>
              {d.points.map((p, i) => (
                <tr key={i} className={`border-t border-line ${flags[i] ? 'bg-warn/10' : ''}`}>
                  <td className="py-1 pr-3">{sig(p[0], 3)}</td>
                  <td className="py-1 pr-3">{sig(p[1], 3)}</td>
                  <td className="py-1 pr-3">{sig(lx[i], 3)}</td>
                  <td className="py-1 pr-3">{sig(ly[i], 3)}</td>
                  <td className="py-1">{flags[i] ? <span className="text-warn">possible anomaly</span> : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <div className="label mb-2">9. Raw data</div>
          <Graph data={[]} xKey="x" series={[]} scatter={[{ name: 'data', data: d.points.map((p) => ({ x: p[0], y: p[1] })) }]} xLabel={`${inv.table.x} (${inv.table.xUnit})`} yLabel={`${inv.table.y} (${inv.table.yUnit})`} height={260} />
        </div>
        <div className="card p-4">
          <div className="label mb-2">Linearised graph with line of best fit</div>
          <Graph data={fitLine} xKey="x" series={[{ key: 'y', label: 'best fit' }]} scatter={[{ name: 'data', data: lx.map((x, i) => ({ x, y: ly[i] })) }]} xLabel={inv.linearise.xLabel} yLabel={inv.linearise.yLabel ?? `${inv.table.y} (${inv.table.yUnit})`} height={260} />
          {fit && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              <Stat label="gradient" value={`${sig(fit.m, 3)} ± ${sig(fit.seM, 2)}`} />
              <Stat label="intercept" value={`${sig(fit.c, 3)} ± ${sig(fit.seC, 2)}`} />
              <Stat label="R²" value={fit.r2.toFixed(4)} />
            </div>
          )}
          <p className="mt-2 text-sm">{inv.linearise.gradientMeaning}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="card p-4">
          <div className="label mb-1">10. Analysis</div>
          <p className="text-sm">{inv.analysis}</p>
        </div>
        <div className="card p-4">
          <div className="label mb-1">11. Conclusion (model answer)</div>
          <p className="text-sm">{inv.conclusion}</p>
          {d.simulated && <p className="mt-1 text-xs text-muted">Your simulated run will differ slightly — base your own conclusion on your fit values.</p>}
        </div>
        <div className="card p-4">
          <div className="label mb-1">12. Limitations</div>
          <ul className="list-disc space-y-0.5 pl-5 text-sm">{inv.limitations.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
        <div className="card p-4">
          <div className="label mb-1">Improvements</div>
          <ul className="list-disc space-y-0.5 pl-5 text-sm">{inv.improvements.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
      </div>
    </div>
  );
}

type Transform = 'x' | 'x2' | 'x3' | 'inv' | 'inv2' | 'sqrt' | 'ln' | 'sin' | 'cos2';
const TRANSFORMS: { value: Transform; label: string; f: (v: number) => number }[] = [
  { value: 'x', label: 'v (none)', f: (v) => v },
  { value: 'x2', label: 'v²', f: (v) => v * v },
  { value: 'x3', label: 'v³', f: (v) => v ** 3 },
  { value: 'inv', label: '1/v', f: (v) => 1 / v },
  { value: 'inv2', label: '1/v²', f: (v) => 1 / (v * v) },
  { value: 'sqrt', label: '√v', f: (v) => Math.sqrt(v) },
  { value: 'ln', label: 'ln v', f: (v) => Math.log(v) },
  { value: 'sin', label: 'sin v (v in °)', f: (v) => Math.sin((v * Math.PI) / 180) },
  { value: 'cos2', label: 'cos² v (v in °)', f: (v) => Math.cos((v * Math.PI) / 180) ** 2 },
];

interface Row {
  x: string;
  y: string;
}

const SAMPLE: Row[] = [
  { x: '0.20', y: '0.90' },
  { x: '0.40', y: '1.27' },
  { x: '0.60', y: '1.55' },
  { x: '0.80', y: '1.80' },
  { x: '1.00', y: '2.01' },
  { x: '1.20', y: '2.70' },
  { x: '1.40', y: '2.37' },
];

function Analysis() {
  const [rows, setRows] = useState<Row[]>(SAMPLE);
  const [xName, setXName] = useState('pendulum length l (m)');
  const [yName, setYName] = useState('period T (s)');
  const [tx, setTx] = useState<Transform>('x');
  const [ty, setTy] = useState<Transform>('x2');
  const [exclude, setExclude] = useState<Record<number, boolean>>({});
  const [throughOrigin, setThroughOrigin] = useState(false);
  const [paste, setPaste] = useState('');

  const parsed = rows.map((r) => ({ x: Number(r.x), y: Number(r.y) }));
  const fx = TRANSFORMS.find((t) => t.value === tx)!.f;
  const fy = TRANSFORMS.find((t) => t.value === ty)!.f;
  const pts = parsed.map((p, i) => ({ i, X: fx(p.x), Y: fy(p.y) })).filter((p) => Number.isFinite(p.X) && Number.isFinite(p.Y));
  const flags = flagAnomalies(pts.map((p) => p.X), pts.map((p) => p.Y));
  const used = pts.filter((p) => !exclude[p.i]);
  const fit = linearFit(used.map((p) => p.X), used.map((p) => p.Y));
  const mOrigin = used.length ? used.reduce((s, p) => s + p.X * p.Y, 0) / used.reduce((s, p) => s + p.X * p.X, 0) : NaN;
  const xs = pts.map((p) => p.X);
  const lo = Math.min(0, ...xs);
  const hi = Math.max(...xs);
  const line = fit ? [lo, hi].map((x) => ({ x, y: throughOrigin ? mOrigin * x : fit.m * x + fit.c })) : [];
  const xLabel = `${TRANSFORMS.find((t) => t.value === tx)!.label.replace('v', xName.split(' ')[0] ?? 'x').replace(' (none)', '')}`;
  const yLabel = `${TRANSFORMS.find((t) => t.value === ty)!.label.replace('v', yName.split(' ')[0] ?? 'y').replace(' (none)', '')}`;

  const importPaste = () => {
    const out: Row[] = [];
    paste
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .forEach((l) => {
        const [a, b] = l.split(/[,\t;]\s*|\s+/);
        if (a !== undefined && b !== undefined && Number.isFinite(Number(a)) && Number.isFinite(Number(b))) out.push({ x: a, y: b });
      });
    if (out.length) {
      setRows(out);
      setExclude({});
      setPaste('');
    }
  };

  const exportCsv = () => {
    const header = `${xName},${yName},${xLabel},${yLabel},anomaly_flag,excluded_from_fit`;
    const body = parsed
      .map((_, i) => {
        const k = pts.findIndex((q) => q.i === i);
        return [rows[i].x, rows[i].y, k >= 0 ? pts[k].X : '', k >= 0 ? pts[k].Y : '', k >= 0 && flags[k] ? 'yes' : 'no', exclude[i] ? 'yes' : 'no'].join(',');
      })
      .join('\n');
    const summary = fit ? `\n\n# fit,${throughOrigin ? `y = m x (origin), m = ${mOrigin}` : `y = m x + c, m = ${fit.m} ± ${fit.seM}, c = ${fit.c} ± ${fit.seC}, R2 = ${fit.r2}`}` : '';
    download('data-analysis.csv', `${header}\n${body}${summary}`);
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
      <div className="card space-y-3 p-5">
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="text-sm">
            <span className="font-medium">x quantity (unit)</span>
            <input className="input mt-1" value={xName} onChange={(e) => setXName(e.target.value)} />
          </label>
          <label className="text-sm">
            <span className="font-medium">y quantity (unit)</span>
            <input className="input mt-1" value={yName} onChange={(e) => setYName(e.target.value)} />
          </label>
        </div>
        <div className="max-h-80 overflow-y-auto">
          <table className="num w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="py-1">#</th>
                <th className="py-1">x</th>
                <th className="py-1">y</th>
                <th className="py-1">Fit</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const k = pts.findIndex((q) => q.i === i);
                const flagged = k >= 0 && flags[k];
                return (
                  <tr key={i} className={flagged ? 'bg-warn/10' : ''}>
                    <td className="pr-1 text-xs text-muted">{i + 1}</td>
                    <td className="py-0.5 pr-1">
                      <input aria-label={`x value row ${i + 1}`} className="input !py-1" value={r.x} onChange={(e) => setRows((s) => s.map((q, j) => (j === i ? { ...q, x: e.target.value } : q)))} />
                    </td>
                    <td className="py-0.5 pr-1">
                      <input aria-label={`y value row ${i + 1}`} className="input !py-1" value={r.y} onChange={(e) => setRows((s) => s.map((q, j) => (j === i ? { ...q, y: e.target.value } : q)))} />
                    </td>
                    <td className="text-center">
                      <input type="checkbox" aria-label={`Include row ${i + 1} in fit`} checked={!exclude[i]} onChange={(e) => setExclude((s) => ({ ...s, [i]: !e.target.checked }))} />
                    </td>
                    <td>
                      <button className="p-1 text-muted hover:text-bad" aria-label={`Delete row ${i + 1}`} onClick={() => { setRows((s) => s.filter((_, j) => j !== i)); setExclude({}); }}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn !py-1 text-xs" onClick={() => setRows((s) => [...s, { x: '', y: '' }])}>
            <Plus className="h-3.5 w-3.5" /> Add row
          </button>
          <button className="btn !py-1 text-xs" onClick={exportCsv}>
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
          <button className="btn !py-1 text-xs" onClick={() => { setRows([{ x: '', y: '' }]); setExclude({}); }}>
            Clear
          </button>
        </div>
        <Disclosure title="Paste data (two columns)">
          <textarea className="input h-28 font-mono" value={paste} onChange={(e) => setPaste(e.target.value)} placeholder={'0.2, 0.90\n0.4, 1.27'} aria-label="Paste two columns of numbers" />
          <button className="btn mt-2 !py-1 text-xs" onClick={importPaste} disabled={!paste.trim()}>
            Import
          </button>
        </Disclosure>
      </div>
      <div className="space-y-4">
        <div className="card space-y-3 p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <Select label="Plot on x-axis" value={tx} options={TRANSFORMS.map((t) => ({ value: t.value, label: t.label.replace('v', 'x') }))} onChange={setTx} />
            <Select label="Plot on y-axis" value={ty} options={TRANSFORMS.map((t) => ({ value: t.value, label: t.label.replace('v', 'y') }))} onChange={setTy} />
            <div className="flex items-end pb-1">
              <Toggle label="Force through origin" checked={throughOrigin} onChange={setThroughOrigin} />
            </div>
          </div>
          <Graph data={line} xKey="x" series={[{ key: 'y', label: 'line of best fit' }]} scatter={[{ name: 'data', data: pts.map((p) => ({ x: p.X, y: p.Y })) }]} xLabel={xLabel} yLabel={yLabel} height={280} />
          {fit ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="gradient m" value={throughOrigin ? sig(mOrigin, 4) : `${sig(fit.m, 4)} ± ${sig(fit.seM, 2)}`} />
              <Stat label="intercept c" value={throughOrigin ? '0 (forced)' : `${sig(fit.c, 3)} ± ${sig(fit.seC, 2)}`} />
              <Stat label="R²" value={fit.r2.toFixed(4)} />
              <Stat label="points in fit" value={String(used.length)} />
            </div>
          ) : (
            <p className="text-sm text-muted">Enter at least two valid points.</p>
          )}
          {flags.some(Boolean) && (
            <Callout kind="warn" title="Possible anomalies flagged">
              <p>
                Row(s) {pts.filter((_, k) => flags[k]).map((p) => p.i + 1).join(', ')} lie more than 2.5 residual standard deviations from the trend of the other points. They are highlighted, not removed. Check the measurement or repeat it; if you exclude a point from the fit (untick “Fit”), state this and justify it in your report.
              </p>
            </Callout>
          )}
          <p className="flex gap-2 text-xs text-muted">
            <AlertTriangle className="h-4 w-4 shrink-0" /> Uncertainties shown are standard errors from least-squares regression. For HSC reports you may also use max/min gradient lines through error bars.
          </p>
        </div>
        <Callout kind="tip" title="Example: pendulum">
          For T = 2π√(l/g), plot T² (y) against l (x). The gradient is 4π²/g, so g = 4π²/m. Try it with the sample data — row 6 is a deliberately suspect reading.
          {fit && tx === 'x' && ty === 'x2' && <span className="num mt-1 block">g ≈ 4π²/m = {sig((4 * Math.PI * Math.PI) / (throughOrigin ? mOrigin : fit.m), 3)} m s⁻²</span>}
        </Callout>
      </div>
    </div>
  );
}

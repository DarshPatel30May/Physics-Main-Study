import { useRef, useState } from 'react';
import { SimShell, GraphCard } from '@/components/SimShell';
import { Slider, Stat, Callout } from '@/components/ui';
import { Graph } from '@/components/Graph';
import { Arrow, Label } from '@/components/svg';
import { useAnimationFrame } from '@/lib/hooks';
import { useSimSettings } from '@/lib/store';
import { C } from '@/lib/physics/constants';
import { mulberry32 } from '@/lib/physics/nuclear';

const RHO = 886; // oil density (kg m⁻³)
const ETA = 1.8e-5; // viscosity of air (Pa s)
const D = 0.01; // plate separation (m)
const W = 520;
const H = 320;
const DEFAULTS = { V: 400 };

function newDrop(r: () => number) {
  const radius = (0.6 + r() * 0.8) * 1e-6;
  const n = 1 + Math.floor(r() * 6);
  return { radius, n, mass: (4 / 3) * Math.PI * radius ** 3 * RHO };
}

export default function MillikanSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('millikan', DEFAULTS);
  const rand = useRef(mulberry32(11));
  const [drop, setDrop] = useState(() => newDrop(rand.current));
  const [y, setY] = useState(0.5); // position between plates (0 bottom, 1 top)
  const [records, setRecords] = useState<number[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const q = drop.n * C.e;
  const Fe = (q * s.V) / D;
  const Fg = drop.mass * C.g;
  const vTerm = (Fe - Fg) / (6 * Math.PI * ETA * drop.radius); // Stokes drag balance (m/s, + up)
  useAnimationFrame((dt) => setY((p) => Math.min(0.97, Math.max(0.03, p + (vTerm * dt * 5) / (D * 0.2)))), true, ref);
  const Vbal = (drop.mass * C.g * D) / q;
  const balanced = Math.abs(s.V - Vbal) / Vbal < 0.01;
  const qMeasured = (drop.mass * C.g * D) / s.V;

  const hist = Array.from({ length: 30 }, (_, i) => {
    const qq = (i + 0.5) * 0.25;
    return { q: qq, count: records.filter((r) => r / 1e-19 >= i * 0.25 && r / 1e-19 < (i + 1) * 0.25).length };
  });

  return (
    <SimShell
      id="millikan"
      compact={compact}
      onReset={() => {
        reset();
        setRecords([]);
        setDrop(newDrop(rand.current));
      }}
      controls={
        <>
          <Slider label="Plate voltage" tex="V" value={s.V} min={0} max={2000} step={1} unit="V" hint="Plates 1.0 cm apart; top plate positive" onChange={(V) => set({ V })} />
          <Slider label="Fine adjust" value={s.V} min={Math.max(0, Math.round(Vbal) - 40)} max={Math.round(Vbal) + 40} step={0.1} unit="V" onChange={(V) => set({ V })} />
          <button className="btn-primary w-full" disabled={!balanced} onClick={() => setRecords((r) => [...r, qMeasured])}>
            {balanced ? 'Record charge' : 'Balance the drop to record'}
          </button>
          <button className="btn w-full" onClick={() => { setDrop(newDrop(rand.current)); setY(0.5); }}>
            New oil drop
          </button>
          {records.length > 0 && (
            <div className="text-xs">
              <div className="label mb-1">Recorded charges (× 10⁻¹⁹ C)</div>
              <div className="num flex flex-wrap gap-1">
                {records.map((r, i) => (
                  <span key={i} className="chip">{(r / 1e-19).toFixed(2)}</span>
                ))}
              </div>
            </div>
          )}
        </>
      }
      readouts={
        <>
          <Stat label="drop radius" value={drop.radius * 1e6} unit="μm" />
          <Stat label="drop mass" tex="m = \tfrac43\pi r^3\rho" value={drop.mass} unit="kg" />
          <Stat label="weight mg" value={Fg} unit="N" />
          <Stat label="electric force qV/d" value={Fe} unit="N" />
          <Stat label="drop motion" value={balanced ? 'stationary ✓' : vTerm > 0 ? 'rising' : 'falling'} tone={balanced ? 'text-good' : ''} />
          <Stat label="charge if balanced q = mgd/V" value={qMeasured} unit="C" tone="text-accent" />
          <Stat label="q / e" value={qMeasured / C.e} />
        </>
      }
      graphs={
        <GraphCard title="Histogram of recorded charges" note="Charges cluster at whole-number multiples of e = 1.6 × 10⁻¹⁹ C: charge is quantised.">
          <Graph data={hist} xKey="q" xLabel="q (× 10⁻¹⁹ C)" yLabel="number of drops" series={[{ key: 'count', label: 'count', dot: true }]} refX={[1, 2, 3, 4, 5, 6].map((k) => ({ x: (k * C.e) / 1e-19 }))} height={200} />
        </GraphCard>
      }
      below={<Callout kind="model" title="Millikan’s result (1909–1913)">Every charge measured was an integer multiple of a smallest charge, e ≈ 1.6 × 10⁻¹⁹ C. Combined with Thomson’s e/m, this gave the electron’s mass ≈ 9.1 × 10⁻³¹ kg — about 1/1836 of a hydrogen atom.</Callout>}
      formulas={['qE = mg', 'E = \\dfrac{V}{d}\\ \\Rightarrow\\ q = \\dfrac{mgd}{V}']}
      explanation={
        <>
          <p>Tiny oil drops pick up charge from friction or ionising radiation. Between charged plates, a drop experiences an upward electric force qE and its weight mg. Adjust V until the drop hangs still: then qV/d = mg.</p>
          <p>Each drop carries an unknown whole number of extra electrons. Record several drops and compare the charges.</p>
        </>
      }
      prediction={{
        q: 'A balanced drop picks up one more electron. What happens if V is unchanged?',
        options: ['It stays still', 'It rises', 'It falls', 'It reverses charge'],
        answer: 1,
        explain: 'More negative charge (with the top plate positive) means a larger upward electric force qE.',
      }}
      assumptions={['Oil density 886 kg m⁻³; drop mass from its radius (Millikan found it from terminal velocity).', 'Stokes’ drag sets the drift speed; buoyancy neglected.', 'Each drop carries 1–6 extra electrons (randomly chosen, hidden).']}
      limitations={['Drift speeds are scaled for visibility.', 'Real experiments must handle evaporation, Brownian motion and the dependence of air viscosity on drop size.']}
    >
      <div ref={ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Oil drop between charged plates">
          <rect x={60} y={40} width={400} height={10} className="fill-bad" />
          <rect x={60} y={270} width={400} height={10} className="fill-m5" />
          <Label x={470} y={50} size={12} weight={700} className="fill-bad">+{s.V.toFixed(1)} V</Label>
          <Label x={470} y={280} size={12} weight={700} className="fill-m5">0 V</Label>
          <circle cx={260} cy={270 - y * 220} r={8} className="fill-m7" />
          <Arrow x1={260} y1={270 - y * 220} x2={260} y2={270 - y * 220 - Math.min(60, (Fe / Fg) * 30)} className="text-good" label="qE" />
          <Arrow x1={260} y1={270 - y * 220} x2={260} y2={270 - y * 220 + 30} className="text-m7" label="mg" labelOffset={[6, 12]} />
          <Label x={12} y={H - 10} size={11} className="fill-muted">Viewed through the microscope: find V where the drop stops moving.</Label>
        </svg>
      </div>
    </SimShell>
  );
}

import { useMemo } from 'react';
import { SimShell, GraphCard } from '@/components/SimShell';
import { Slider, Stat, Toggle, Callout } from '@/components/ui';
import { Graph } from '@/components/Graph';
import { Label } from '@/components/svg';
import { useSimSettings } from '@/lib/store';
import { malus } from '@/lib/physics/optics';

const DEFAULTS = { I0: 100, a1: 0, a2: 60, middle: false, aMid: 45 };
const W = 600;
const H = 240;

function Polariser({ x, angle, label }: { x: number; angle: number; label: string }) {
  return (
    <g>
      <ellipse cx={x} cy={110} rx={22} ry={70} className="fill-m6/15 stroke-m6" />
      <line x1={x - 60 * Math.sin((angle * Math.PI) / 180) * 0.33} y1={110 - 60 * Math.cos((angle * Math.PI) / 180)} x2={x + 60 * Math.sin((angle * Math.PI) / 180) * 0.33} y2={110 + 60 * Math.cos((angle * Math.PI) / 180)} className="stroke-m6" strokeWidth={3} />
      <Label x={x} y={200} anchor="middle" size={11}>
        {label} ({angle}°)
      </Label>
    </g>
  );
}

function EArrow({ x, angle, amp }: { x: number; angle: number; amp: number }) {
  const L = 45 * amp;
  const dx = L * Math.sin((angle * Math.PI) / 180) * 0.33;
  const dy = L * Math.cos((angle * Math.PI) / 180);
  return <line x1={x - dx} y1={110 - dy} x2={x + dx} y2={110 + dy} className="stroke-m7" strokeWidth={3} strokeLinecap="round" />;
}

export default function PolarisationSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('polarisation', DEFAULTS);
  const I1 = s.I0 / 2;
  const Imid = s.middle ? malus(I1, s.aMid - s.a1) : I1;
  const lastAxis = s.middle ? s.aMid : s.a1;
  const I2 = malus(Imid, s.a2 - lastAxis);
  const data = useMemo(() => Array.from({ length: 181 }, (_, i) => ({ t: i, I: malus(1, i) })), []);
  const rel = s.a2 - lastAxis;

  return (
    <SimShell
      id="polarisation"
      compact={compact}
      onReset={reset}
      controls={
        <>
          <Slider label="Unpolarised intensity" tex="I_0" value={s.I0} min={10} max={200} step={5} unit="W m⁻²" onChange={(I0) => set({ I0 })} />
          <Slider label="Polariser angle" value={s.a1} min={0} max={180} step={1} unit="°" onChange={(a1) => set({ a1 })} />
          <Toggle label="Insert a middle polariser" checked={s.middle} onChange={(middle) => set({ middle })} />
          {s.middle && <Slider label="Middle polariser angle" value={s.aMid} min={0} max={180} step={1} unit="°" onChange={(aMid) => set({ aMid })} />}
          <Slider label="Analyser angle" value={s.a2} min={0} max={180} step={1} unit="°" onChange={(a2) => set({ a2 })} />
        </>
      }
      readouts={
        <>
          <Stat label="after polariser (½I₀)" value={I1} unit="W m⁻²" />
          {s.middle && <Stat label="after middle polariser" value={Imid} unit="W m⁻²" />}
          <Stat label="angle between last two axes" value={`${rel}°`} />
          <Stat label="transmitted intensity" value={I2} unit="W m⁻²" tone="text-accent" />
          <Stat label="fraction of I₀" value={`${((100 * I2) / s.I0).toFixed(1)}%`} />
        </>
      }
      graphs={
        <GraphCard title="Malus’ law: I/I_max vs angle between axes" note="A graph of I vs cos²θ is a straight line through the origin with gradient I_max.">
          <Graph data={data} xKey="t" xLabel="θ (°)" yLabel="I / I_max" series={[{ key: 'I', label: 'cos²θ' }]} dots={[{ x: ((rel % 180) + 180) % 180, y: malus(1, rel) }]} yDomain={[0, 1]} height={200} />
        </GraphCard>
      }
      below={
        <Callout kind="tip" title="Why polarisation matters">
          Only transverse waves can be polarised — so polarisation was key evidence that light is a transverse wave, consistent with Maxwell’s EM waves. Surprise: crossed polarisers block all light, but inserting a third polariser at 45° between them lets light through (I₀/8)!
        </Callout>
      }
      formulas={['I = I_{max}\\cos^2\\theta', 'I_1 = \\tfrac12 I_0\\ \\text{(unpolarised → polariser)}']}
      explanation={
        <>
          <p>Unpolarised light has electric-field oscillations in all directions perpendicular to travel. A polariser transmits only the component along its axis, so the light becomes plane-polarised and its intensity halves.</p>
          <p>A second polariser (analyser) transmits E cos θ of the field; intensity ∝ E², giving I = I_max cos²θ.</p>
        </>
      }
      prediction={{
        q: 'Two polarisers are crossed (90°). A third is slipped between them at 45°. What happens?',
        options: ['Still dark', 'Some light gets through', 'Brighter than with no polarisers', 'Light changes colour'],
        answer: 1,
        explain: 'I = ½I₀ × cos²45° × cos²45° = I₀/8 — the middle polariser rotates the polarisation direction.',
      }}
      assumptions={['Ideal polarisers (100% transmission along the axis, 0% across).', 'Monochromatic light at normal incidence.']}
      limitations={['Real polarisers transmit a little at 90° and absorb some light along the axis.', 'Perspective drawing of E-field vectors is schematic.']}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Light passing through polarisers">
        <line x1={20} y1={110} x2={W - 20} y2={110} className="stroke-line" />
        {/* unpolarised: many directions */}
        {[0, 30, 60, 90, 120, 150].map((a) => (
          <EArrow key={a} x={70} angle={a} amp={1} />
        ))}
        <Label x={70} y={200} anchor="middle" size={11}>
          unpolarised
        </Label>
        <Polariser x={170} angle={s.a1} label="polariser" />
        <EArrow x={250} angle={s.a1} amp={Math.sqrt(I1 / s.I0) * 1.2} />
        {s.middle && (
          <>
            <Polariser x={330} angle={s.aMid} label="middle" />
            <EArrow x={400} angle={s.aMid} amp={Math.sqrt(Imid / s.I0) * 1.2} />
          </>
        )}
        <Polariser x={s.middle ? 470 : 400} angle={s.a2} label="analyser" />
        <EArrow x={s.middle ? 545 : 490} angle={s.a2} amp={Math.sqrt(I2 / s.I0) * 1.2} />
        <circle cx={s.middle ? 575 : 545} cy={110} r={14} className="fill-m7" opacity={Math.min(1, I2 / (s.I0 / 2) + 0.05)} />
        <Label x={12} y={22} size={11} className="fill-muted">
          Orange bars: electric-field oscillation direction and amplitude (∝ √I)
        </Label>
      </svg>
    </SimShell>
  );
}

import { useMemo } from 'react';
import { SimShell, GraphCard } from '@/components/SimShell';
import { Slider, Stat, Callout } from '@/components/ui';
import { Graph } from '@/components/Graph';
import { Arrow, Label } from '@/components/svg';
import { useSimSettings } from '@/lib/store';

const DEFAULTS = { rot: 0, L: 11, v: 30 };
const W = 560;
const H = 320;
const LAMBDA = 550e-9;
const C0 = 3e8;

function Fringes({ shift, label }: { shift: number; label: string }) {
  return (
    <div>
      <div className="mb-1 text-xs font-semibold">{label}</div>
      <div className="relative h-10 w-full overflow-hidden rounded bg-black">
        <div className="absolute inset-y-0 -left-10 right-0" style={{ background: 'repeating-linear-gradient(90deg, #111 0px, #fbbf24 10px, #111 20px)', transform: `translateX(${shift * 20}px)` }} />
        <div className="absolute inset-y-0 left-1/2 w-px bg-red-500" />
      </div>
    </div>
  );
}

export default function MichelsonSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('michelson', DEFAULTS);
  // aether prediction: total shift on rotating 90° is ΔN = 2Lv²/(λc²); as a function of angle the shift ∝ cos 2φ
  const dN = (2 * s.L * (s.v * 1e3) ** 2) / (LAMBDA * C0 * C0);
  const predicted = (dN / 2) * Math.cos((2 * s.rot * Math.PI) / 180);
  const data = useMemo(() => Array.from({ length: 91 }, (_, i) => ({ a: i * 4, pred: (dN / 2) * Math.cos((2 * i * 4 * Math.PI) / 180), obs: 0 })), [dN]);
  const ang = (s.rot * Math.PI) / 180;
  const cx = 250;
  const cy = 170;
  const rotP = (x: number, y: number) => ({ x: cx + (x - cx) * Math.cos(ang) - (y - cy) * Math.sin(ang), y: cy + (x - cx) * Math.sin(ang) + (y - cy) * Math.cos(ang) });
  const src = rotP(80, 170);
  const m1 = rotP(420, 170);
  const m2 = rotP(250, 30);
  const det = rotP(250, 300);

  return (
    <SimShell
      id="michelson"
      compact={compact}
      onReset={reset}
      controls={
        <>
          <Slider label="Rotate the apparatus" value={s.rot} min={0} max={360} step={1} unit="°" onChange={(rot) => set({ rot })} />
          <Slider label="Effective arm length" tex="L" value={s.L} min={1} max={20} step={0.5} unit="m" hint="Michelson–Morley used ~11 m via multiple reflections" onChange={(L) => set({ L })} />
          <Slider label="Assumed Earth speed through the aether" tex="v" value={s.v} min={0} max={60} step={1} unit="km s⁻¹" onChange={(v) => set({ v })} />
        </>
      }
      readouts={
        <>
          <Stat label="predicted shift for 90° rotation" tex="\Delta N = 2Lv^2/\lambda c^2" value={dN} unit="fringes" tone="text-m7" />
          <Stat label="predicted shift now (relative)" value={predicted} unit="fringes" />
          <Stat label="observed shift" value="≈ 0 (< 0.02)" tone="text-good" />
        </>
      }
      graphs={
        <GraphCard title="Fringe shift vs rotation angle" note="The aether hypothesis predicts a cos 2φ variation; Michelson and Morley observed no shift beyond experimental uncertainty.">
          <Graph data={data} xKey="a" xLabel="rotation (°)" yLabel="fringe shift" series={[{ key: 'pred', label: 'predicted (aether)', dashed: true }, { key: 'obs', label: 'observed' }]} refX={[{ x: s.rot }]} legend height={210} />
        </GraphCard>
      }
      below={
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Fringes shift={predicted} label="What the aether model predicts you would see" />
            <Fringes shift={0} label="What was observed (fringes did not move)" />
          </div>
          <Callout kind="model" title="Significance">
            The null result gave no evidence for an aether or for light’s speed depending on Earth’s motion. It is consistent with Einstein’s postulate that c is the same for all inertial observers, although Einstein said it was not his main motivation. Lorentz and FitzGerald proposed length contraction to explain it within the aether model.
          </Callout>
        </div>
      }
      formulas={['\\Delta N \\approx \\dfrac{2Lv^2}{\\lambda c^2}\\ \\text{(predicted, supplementary)}']}
      explanation={
        <>
          <p>A beam splitter sends light along two perpendicular arms; mirrors return both beams, which recombine to form interference fringes. If light travelled through a stationary aether, the trip along the direction of Earth’s motion would take a different time from the trip across it.</p>
          <p>Rotating the apparatus would swap the arms’ roles and shift the fringes by about 0.4 fringe. No such shift was seen, in any orientation or season.</p>
        </>
      }
      prediction={{
        q: 'If an aether existed, what should happen to the fringes as the interferometer is rotated?',
        options: ['Nothing', 'They shift back and forth', 'They disappear', 'They change colour'],
        answer: 1,
        explain: 'The time difference between the arms would change with orientation, shifting the fringes. None was observed.',
      }}
      assumptions={['λ = 550 nm; the aether model treats light like a wave in a medium moving relative to Earth.']}
      limitations={['Schematic diagram; real apparatus floated on mercury and used multiple reflections.', 'The predicted-shift formula is a first-order approximation.']}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Michelson interferometer">
        <Arrow x1={470} y1={60} x2={540} y2={60} className="text-bad" label="assumed aether wind" labelOffset={[-120, -10]} dashed />
        <line x1={src.x} y1={src.y} x2={cx} y2={cy} className="stroke-m7" strokeWidth={3} />
        <line x1={cx} y1={cy} x2={m1.x} y2={m1.y} className="stroke-m7" strokeWidth={3} />
        <line x1={cx} y1={cy} x2={m2.x} y2={m2.y} className="stroke-m7" strokeWidth={3} opacity={0.8} />
        <line x1={cx} y1={cy} x2={det.x} y2={det.y} className="stroke-m7" strokeWidth={3} strokeDasharray="6 4" />
        <rect x={cx - 18} y={cy - 3} width={36} height={6} className="fill-accent" transform={`rotate(${45 + s.rot} ${cx} ${cy})`} />
        <rect x={m1.x - 4} y={m1.y - 22} width={8} height={44} className="fill-m5" transform={`rotate(${s.rot} ${m1.x} ${m1.y})`} />
        <rect x={m2.x - 22} y={m2.y - 4} width={44} height={8} className="fill-m5" transform={`rotate(${s.rot} ${m2.x} ${m2.y})`} />
        <circle cx={src.x} cy={src.y} r={10} className="fill-m7" />
        <rect x={det.x - 14} y={det.y - 8} width={28} height={16} rx={3} className="fill-muted" />
        <Label x={src.x} y={src.y + 26} anchor="middle" size={11}>source</Label>
        <Label x={cx + 24} y={cy - 14} size={11}>beam splitter</Label>
        <Label x={m1.x} y={m1.y + 36} anchor="middle" size={11}>mirror 1</Label>
        <Label x={m2.x + 30} y={m2.y + 4} size={11}>mirror 2</Label>
        <Label x={det.x + 20} y={det.y + 4} size={11}>detector (fringes)</Label>
      </svg>
    </SimShell>
  );
}

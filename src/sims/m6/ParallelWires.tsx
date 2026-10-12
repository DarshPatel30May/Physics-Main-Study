import { SimShell, GraphCard } from '@/components/SimShell';
import { Slider, Stat, Toggle, Callout } from '@/components/ui';
import { Graph, sample } from '@/components/Graph';
import { Arrow, Label, FieldMark } from '@/components/svg';
import { useSimSettings } from '@/lib/store';
import { parallelWireForcePerLength, wireField } from '@/lib/physics/electromagnetism';

const DEFAULTS = { I1: 10, I2: 10, rcm: 5, same: true, l: 1 };
const W = 560;
const H = 320;

export default function ParallelWiresSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('parallel-wires', DEFAULTS);
  const r = s.rcm / 100;
  const Fl = parallelWireForcePerLength(s.I1, s.I2, r);
  const B1at2 = wireField(s.I1, r);
  const data = sample((x) => ({ F: parallelWireForcePerLength(s.I1, s.I2, x / 100) * 1e6 }), 1, 20, 100, 'r');
  const cx = W / 2;
  const cy = H / 2;
  const sep = 40 + s.rcm * 14;
  const x1 = cx - sep / 2;
  const x2 = cx + sep / 2;
  const attract = s.same;
  const fpx = Math.min(80, 15 + Fl * 1e5);

  return (
    <SimShell
      id="parallel-wires"
      compact={compact}
      onReset={reset}
      controls={
        <>
          <Slider label="Current in wire 1" tex="I_1" value={s.I1} min={1} max={50} step={1} unit="A" onChange={(I1) => set({ I1 })} />
          <Slider label="Current in wire 2" tex="I_2" value={s.I2} min={1} max={50} step={1} unit="A" onChange={(I2) => set({ I2 })} />
          <Slider label="Separation" tex="r" value={s.rcm} min={1} max={20} step={0.5} unit="cm" onChange={(rcm) => set({ rcm })} />
          <Slider label="Length considered" tex="l" value={s.l} min={0.1} max={5} step={0.1} unit="m" onChange={(l) => set({ l })} />
          <Toggle label="Currents in the same direction" checked={s.same} onChange={(same) => set({ same })} />
        </>
      }
      readouts={
        <>
          <Stat label="B from wire 1 at wire 2" tex="\mu_0 I_1/2\pi r" value={B1at2} unit="T" />
          <Stat label="force per metre" tex="F/l" value={Fl} unit="N m⁻¹" tone="text-good" />
          <Stat label="force on length l" tex="F" value={Fl * s.l} unit="N" />
          <Stat label="interaction" value={attract ? 'attract' : 'repel'} tone={attract ? 'text-good' : 'text-bad'} />
        </>
      }
      graphs={
        <GraphCard title="Force per metre vs separation" note="F/l ∝ 1/r (not 1/r²) for long straight wires.">
          <Graph data={data} xKey="r" xLabel="r (cm)" yLabel="F/l (μN m⁻¹)" series={[{ key: 'F', label: 'F/l' }]} dots={[{ x: s.rcm, y: Fl * 1e6 }]} height={200} />
        </GraphCard>
      }
      below={
        <Callout kind="info" title="The ampere and Newton’s third law">
          From 1948 to 2019 the ampere was defined as the current which, in two infinitely long parallel wires 1 m apart in vacuum, produces a force of 2 × 10⁻⁷ N per metre. (Since 2019 the SI fixes the elementary charge instead, but this relationship still holds.) The two wires always feel forces of equal size in opposite directions — even when I₁ ≠ I₂ — a Newton’s third-law pair.
        </Callout>
      }
      formulas={['\\dfrac{F}{l} = \\dfrac{\\mu_0 I_1 I_2}{2\\pi r}', 'B = \\dfrac{\\mu_0 I}{2\\pi r}']}
      explanation={
        <>
          <p>Each wire produces circular magnetic field lines around it (right-hand grip rule). The other wire sits in that field and experiences a motor-effect force.</p>
          <p>Currents in the same direction attract; opposite directions repel.</p>
        </>
      }
      prediction={{
        q: 'Wire 1 carries 10 A and wire 2 carries 30 A (same direction). Which wire feels the larger force?',
        options: ['Wire 1', 'Wire 2', 'Equal forces', 'Neither feels a force'],
        answer: 2,
        explain: 'Each force is μ₀I₁I₂l/(2πr) — the same expression for both wires (Newton’s third law).',
      }}
      assumptions={['Infinitely long, straight, parallel wires (l ≫ r).', 'Wires in vacuum/air (μ₀).']}
      limitations={['Real experiments (current balance) use finite wires — end effects reduce the force.', 'Field circles are schematic (spacing ∝ 1/r).']}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="End view of two parallel current-carrying wires">
        {[24, 44, 70, 104].map((rr) => (
          <g key={rr}>
            <circle cx={x1} cy={cy} r={rr} fill="none" className="stroke-m6/40" strokeDasharray="4 4" />
            <circle cx={x2} cy={cy} r={rr} fill="none" className="stroke-m6/40" strokeDasharray="4 4" />
          </g>
        ))}
        <FieldMark x={x1} y={cy} into r={14} className="text-m7" />
        <FieldMark x={x2} y={cy} into={s.same} r={14} className="text-m7" />
        <Label x={x1} y={cy - 22} anchor="middle" size={11}>I₁ = {s.I1} A</Label>
        <Label x={x2} y={cy - 22} anchor="middle" size={11}>I₂ = {s.I2} A</Label>
        <Arrow x1={x1 + (attract ? 16 : -16)} y1={cy + 34} x2={x1 + (attract ? 16 + fpx : -16 - fpx)} y2={cy + 34} className="text-good" label="F" />
        <Arrow x1={x2 + (attract ? -16 : 16)} y1={cy + 34} x2={x2 + (attract ? -16 - fpx : 16 + fpx)} y2={cy + 34} className="text-good" label="F" />
        <line x1={x1} y1={cy + 70} x2={x2} y2={cy + 70} className="stroke-muted" />
        <Label x={cx} y={cy + 86} anchor="middle" size={11} className="fill-muted">r = {s.rcm} cm</Label>
        <Label x={12} y={H - 12} className="fill-muted" size={11}>
          End view (⊗ into page, ⊙ out of page). Dashed circles: magnetic field lines of each wire.
        </Label>
      </svg>
    </SimShell>
  );
}

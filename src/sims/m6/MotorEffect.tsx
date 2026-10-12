import { SimShell, GraphCard } from '@/components/SimShell';
import { Slider, Stat, Tabs, Select, Callout } from '@/components/ui';
import { Graph, sample } from '@/components/Graph';
import { Arrow, Label, FieldMark } from '@/components/svg';
import { useSimSettings } from '@/lib/store';
import { C, rad } from '@/lib/physics/constants';
import { forceOnConductor, coilTorque } from '@/lib/physics/electromagnetism';

const DEFAULTS = { tab: 'wire' as 'wire' | 'swing' | 'coil', I: 5, B: 0.2, lcm: 20, angle: 90, dirIn: true, mg: 10, n: 20, wcm: 8, hcm: 5, coilAng: 90 };
const W = 560;
const H = 340;

export default function MotorEffectSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('motor-effect', DEFAULTS);
  const l = s.lcm / 100;
  const F = forceOnConductor(l, s.I, s.B, s.angle);
  const Fmax = l * s.I * s.B;
  const data = sample((a) => ({ F: forceOnConductor(l, s.I, s.B, a) }), 0, 180, 90, 'a');

  // swing: wire of mass m hanging on light leads; equilibrium deflection tan φ = F/(mg)
  const m = s.mg / 1000;
  const Feff = s.tab === 'swing' ? Fmax : F; // the hanging wire is perpendicular to B
  const phi = Math.atan(Feff / (m * C.g));
  // End view with B vertically UP (+y). Current into page (−z): F ∝ (−z) × (+y) = +x (right).
  // Current out of page (+z): F ∝ (+z) × (+y) = −x (left).
  const fRight = s.dirIn;

  const A = (s.wcm / 100) * (s.hcm / 100);
  const tau = coilTorque(s.n, s.I, A, s.B, s.coilAng);
  const tauData = sample((a) => ({ tau: coilTorque(s.n, s.I, A, s.B, a) }), 0, 360, 120, 'a');

  const view = () => {
    if (s.tab === 'wire') {
      const th = rad(s.angle);
      const cx = W / 2;
      const cy = H / 2;
      const L = 150;
      const sz = 6 + 22 * (F / Math.max(Fmax, 1e-9));
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Top view: straight wire at an angle to a uniform magnetic field">
          <rect x={10} y={40} width={40} height={H - 80} rx={6} className="fill-bad" />
          <rect x={W - 50} y={40} width={40} height={H - 80} rx={6} className="fill-m5" />
          <Label x={30} y={H / 2 + 6} anchor="middle" size={18} weight={700} className="fill-white">N</Label>
          <Label x={W - 30} y={H / 2 + 6} anchor="middle" size={18} weight={700} className="fill-white">S</Label>
          {Array.from({ length: 7 }, (_, i) => (
            <Arrow key={i} x1={60} y1={60 + i * 37} x2={W - 60} y2={60 + i * 37} className="text-m6/50" width={1.2} head={7} />
          ))}
          <line x1={cx - L * Math.cos(th)} y1={cy + L * Math.sin(th)} x2={cx + L * Math.cos(th)} y2={cy - L * Math.sin(th)} className="stroke-m7" strokeWidth={7} strokeLinecap="round" />
          <Arrow x1={cx - 50 * Math.cos(th)} y1={cy + 50 * Math.sin(th)} x2={cx + 50 * Math.cos(th)} y2={cy - 50 * Math.sin(th)} className="text-ink" label="I" width={2.5} />
          {F > 1e-9 && <FieldMark x={cx + 60} y={cy + 50} into r={sz} className="text-good" />}
          <Label x={cx + 60 + sz + 6} y={cy + 54} className="fill-good" size={12} weight={600}>
            {F > 1e-9 ? `F = ${F.toFixed(3)} N into the page` : 'F = 0 (I ∥ B)'}
          </Label>
          <Label x={12} y={H - 12} className="fill-muted" size={11}>
            Top view. θ = {s.angle}° between I and B. F = lIB sin θ — perpendicular to both (right-hand palm rule).
          </Label>
        </svg>
      );
    }
    if (s.tab === 'swing') {
      const px = W / 2;
      const py = 40;
      const Lp = 200;
      const sgn = fRight ? 1 : -1;
      const wx = px + sgn * Lp * Math.sin(phi);
      const wy = py + Lp * Math.cos(phi);
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="End view: hanging wire deflected sideways by the motor-effect force">
          {Array.from({ length: 9 }, (_, i) => (
            <Arrow key={i} x1={60 + i * 55} y1={H - 20} x2={60 + i * 55} y2={60} className="text-m6/40" width={1.2} head={7} />
          ))}
          <Label x={W - 70} y={56} className="fill-m6" size={12} weight={600}>B ↑</Label>
          <line x1={px - 80} y1={py} x2={px + 80} y2={py} className="stroke-ink" strokeWidth={3} />
          <line x1={px} y1={py} x2={px} y2={py + Lp} className="stroke-line" strokeDasharray="4 4" />
          <line x1={px} y1={py} x2={wx} y2={wy} className="stroke-ink" strokeWidth={1.5} />
          <FieldMark x={wx} y={wy} into={s.dirIn} r={12} className="text-m7" />
          {Feff > 1e-9 && <Arrow x1={wx} y1={wy} x2={wx + sgn * Math.min(120, 30 + 60 * (Feff / (m * C.g)))} y2={wy} className="text-good" label="F" />}
          <Arrow x1={wx} y1={wy} x2={wx} y2={wy + 50} className="text-m7" label="mg" labelOffset={[6, 14]} />
          <Label x={12} y={H - 30} className="fill-muted" size={11}>
            End view: current {s.dirIn ? 'into (⊗)' : 'out of (⊙)'} the page, B upwards → force to the {fRight ? 'right' : 'left'}.
          </Label>
          <Label x={12} y={H - 12} className="fill-muted" size={11}>
            Equilibrium: tan φ = F/(mg) → φ = {((phi * 180) / Math.PI).toFixed(1)}°. Reverse I or B and the wire swings the other way.
          </Label>
        </svg>
      );
    }
    // coil
    const cx = W / 2;
    const cy = H / 2;
    const th = rad(s.coilAng); // angle between normal and B
    const half = 110;
    // end view: coil seen edge-on as a line; plane makes angle (90° - θ) with B
    const planeAng = Math.PI / 2 - th;
    const ax = cx + half * Math.cos(planeAng);
    const ay = cy - half * Math.sin(planeAng);
    const bx = cx - half * Math.cos(planeAng);
    const by = cy + half * Math.sin(planeAng);
    const fLen = 70;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="End view of a rectangular coil in a magnetic field with forces on each side">
        {Array.from({ length: 6 }, (_, i) => (
          <Arrow key={i} x1={40} y1={50 + i * 50} x2={W - 40} y2={50 + i * 50} className="text-m6/40" width={1.2} head={7} />
        ))}
        <line x1={ax} y1={ay} x2={bx} y2={by} className="stroke-m7" strokeWidth={4} />
        <circle cx={cx} cy={cy} r={4} className="fill-muted" />
        <FieldMark x={ax} y={ay} into r={11} className="text-ink" />
        <FieldMark x={bx} y={by} into={false} r={11} className="text-ink" />
        {/* side A current into page: F = (−z)×(+x) = −y (down); side B out of page: +y (up) */}
        <Arrow x1={ax} y1={ay} x2={ax} y2={ay + fLen} className="text-good" label="F" />
        <Arrow x1={bx} y1={by} x2={bx} y2={by - fLen} className="text-good" label="F" />
        <Arrow x1={cx} y1={cy} x2={cx + 60 * Math.cos(planeAng + Math.PI / 2)} y2={cy - 60 * Math.sin(planeAng + Math.PI / 2)} className="text-accent" label="normal" dashed />
        <Label x={12} y={H - 30} className="fill-muted" size={11}>
          Equal and opposite forces on the two long sides form a couple. The perpendicular distance between their lines of action
        </Label>
        <Label x={12} y={H - 12} className="fill-muted" size={11}>
          is largest when the coil’s plane is parallel to B (θ = 90° from the normal) → maximum torque; zero when the plane is ⟂ B.
        </Label>
      </svg>
    );
  };

  return (
    <SimShell
      id="motor-effect"
      compact={compact}
      onReset={reset}
      controls={
        <>
          <Tabs size="sm" value={s.tab} onChange={(tab) => set({ tab })} tabs={[{ id: 'wire', label: 'Wire at angle' }, { id: 'swing', label: 'Hanging wire' }, { id: 'coil', label: 'Coil & torque' }]} />
          <Slider label="Current" tex="I" value={s.I} min={0} max={20} step={0.5} unit="A" onChange={(I) => set({ I })} />
          <Slider label="Magnetic flux density" tex="B" value={s.B} min={0} max={1} step={0.01} unit="T" onChange={(B) => set({ B })} />
          {s.tab !== 'coil' && <Slider label="Length in field" tex="l" value={s.lcm} min={1} max={50} step={1} unit="cm" onChange={(lcm) => set({ lcm })} />}
          {s.tab === 'wire' && <Slider label="Angle between I and B" tex="\theta" value={s.angle} min={0} max={180} step={1} unit="°" onChange={(angle) => set({ angle })} />}
          {s.tab === 'swing' && (
            <>
              <Select label="Current direction" value={s.dirIn ? 'in' : 'out'} onChange={(v) => set({ dirIn: v === 'in' })} options={[{ value: 'in', label: 'Into the page ⊗' }, { value: 'out', label: 'Out of the page ⊙' }]} />
              <Slider label="Wire mass" tex="m" value={s.mg} min={2} max={50} step={1} unit="g" onChange={(mg) => set({ mg })} />
            </>
          )}
          {s.tab === 'coil' && (
            <>
              <Slider label="Turns" tex="n" value={s.n} min={1} max={200} step={1} onChange={(n) => set({ n })} />
              <Slider label="Coil width" value={s.wcm} min={1} max={20} step={0.5} unit="cm" onChange={(wcm) => set({ wcm })} />
              <Slider label="Coil length" value={s.hcm} min={1} max={20} step={0.5} unit="cm" onChange={(hcm) => set({ hcm })} />
              <Slider label="Angle between B and coil’s normal" tex="\theta" value={s.coilAng} min={0} max={180} step={1} unit="°" onChange={(coilAng) => set({ coilAng })} />
            </>
          )}
        </>
      }
      readouts={
        s.tab === 'coil' ? (
          <>
            <Stat label="area" tex="A" value={A} unit="m²" />
            <Stat label="force on each long side" value={s.I * s.n * (s.hcm / 100) * s.B} unit="N" />
            <Stat label="torque" tex="\tau" value={tau} unit="N m" tone="text-accent" />
            <Stat label="maximum torque nIAB" value={s.n * s.I * A * s.B} unit="N m" />
          </>
        ) : (
          <>
            <Stat label="force" tex="F = lIB\sin\theta" value={Feff} unit="N" tone="text-good" />
            <Stat label="maximum force (θ = 90°)" value={Fmax} unit="N" />
            {s.tab === 'swing' && <Stat label="deflection angle" tex="\phi" value={`${((phi * 180) / Math.PI).toFixed(1)}°`} />}
            {s.tab === 'swing' && <Stat label="weight mg" value={m * C.g} unit="N" />}
          </>
        )
      }
      graphs={
        s.tab === 'coil' ? (
          <GraphCard title="Torque vs angle (no commutator)" note="Torque changes sign after the coil passes θ = 180°: without a commutator the coil would oscillate rather than rotate continuously.">
            <Graph data={tauData} xKey="a" xLabel="θ (°)" yLabel="τ (N m)" series={[{ key: 'tau', label: 'τ' }]} dots={[{ x: s.coilAng, y: tau }]} refY={[{ y: 0 }]} height={200} />
          </GraphCard>
        ) : (
          <GraphCard title="Force vs angle between current and field" note="Maximum at 90° (I ⟂ B); zero at 0° and 180° (I ∥ B).">
            <Graph data={data} xKey="a" xLabel="θ (°)" yLabel="F (N)" series={[{ key: 'F', label: 'F' }]} dots={[{ x: s.angle, y: F }]} height={200} />
          </GraphCard>
        )
      }
      below={<Callout kind="warn" title="Use conventional current">The right-hand palm rule uses conventional current (positive → negative). Electrons in the wire move the other way; the force on the wire is the same either way because q and v both reverse.</Callout>}
      formulas={['F = lI_{\\perp}B = lIB\\sin\\theta', '\\tau = nIA_{\\perp}B = nIAB\\sin\\theta']}
      explanation={
        <>
          <p>A current is moving charge, so a current-carrying wire in a magnetic field experiences a force — the motor effect. Only the component of the current perpendicular to B contributes.</p>
          <p>In the hanging-wire view the wire settles where the magnetic force, its weight and the tension balance: a real measurement method for the force.</p>
        </>
      }
      prediction={{
        q: 'A wire carrying current is rotated until it lies parallel to the magnetic field. What happens to the force?',
        options: ['It doubles', 'It is maximum', 'It becomes zero', 'It reverses'],
        answer: 2,
        explain: 'sin 0° = 0 — no component of current perpendicular to B, so no force.',
      }}
      assumptions={['Uniform magnetic field confined between the poles.', 'Straight, rigid conductor; leads outside the field.', 'Hanging wire: light leads, equilibrium position shown.']}
      limitations={['Field from the current itself is ignored.', 'Real magnet fields weaken near the pole edges.']}
    >
      {view()}
    </SimShell>
  );
}

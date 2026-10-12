import { useRef, useState } from 'react';
import { SimShell, Playback, GraphCard } from '@/components/SimShell';
import { Slider, Stat, Tabs, Select, Callout } from '@/components/ui';
import { Graph } from '@/components/Graph';
import { Arrow, Label, FieldGrid } from '@/components/svg';
import { useAnimationFrame } from '@/lib/hooks';
import { useSimSettings } from '@/lib/store';
import { C } from '@/lib/physics/constants';

type Tab = 'magnet' | 'rod' | 'circuit';
const DEFAULTS = {
  tab: 'magnet' as Tab,
  speed: 0.5,
  N: 200,
  strength: 2,
  acm: 3,
  nLeading: true,
  motion: 'pass' as 'pass' | 'push',
  B: 0.5,
  Lr: 0.2,
  R: 2,
  v0: 2,
  rodMass: 0.05,
  rodMode: 'release' as 'release' | 'constant',
};
const W = 560;
const H = 300;
const HIST = 300;

const fluxAt = (mDip: number, a: number, z: number) => (C.mu0 * mDip * a * a) / (2 * Math.pow(a * a + z * z, 1.5));
const dFluxDz = (mDip: number, a: number, z: number) => (C.mu0 * mDip * a * a * -3 * z) / (2 * Math.pow(a * a + z * z, 2.5));

export default function InductionSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('induction', DEFAULTS);
  const [playing, setPlaying] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1);
  const ref = useRef<HTMLDivElement>(null);

  /* ---------- magnet & coil state ---------- */
  const [t, setT] = useState(0);
  const hist = useRef<{ t: number; phi: number; emf: number }[]>([]);
  const a = s.acm / 100;
  const mDip = s.strength * (s.nLeading ? 1 : -1); // dipole along +x when N leads (moving right)
  const span = 0.3;
  const magnetX = (tt: number): { x: number; v: number } => {
    if (s.motion === 'pass') {
      const T = (2 * span) / s.speed;
      const ph = tt % T;
      return { x: -span + s.speed * ph, v: s.speed };
    }
    // push in, hold, pull out, hold
    const T1 = span / s.speed;
    const cycle = 4 * T1;
    const ph = tt % cycle;
    if (ph < T1) return { x: -span + s.speed * ph, v: s.speed };
    if (ph < 2 * T1) return { x: 0, v: 0 };
    if (ph < 3 * T1) return { x: -s.speed * (ph - 2 * T1), v: -s.speed };
    return { x: -span, v: 0 };
  };
  const mag = magnetX(t);
  const phi = fluxAt(mDip, a, mag.x);
  const dphidt = dFluxDz(mDip, a, mag.x) * mag.v;
  const emf = -s.N * dphidt;

  /* ---------- moving rod state ---------- */
  const [rod, setRod] = useState({ x: 0.05, v: s.v0, t: 0, energy: 0 });
  const rodHist = useRef<{ t: number; v: number; emf: number; I: number }[]>([]);
  const rodEmf = s.B * s.Lr * rod.v;
  const rodI = rodEmf / s.R;
  const rodF = s.B * rodI * s.Lr;

  /* ---------- nearby circuit ---------- */
  const [sw, setSw] = useState(false);
  const [circ, setCirc] = useState({ I: 0, t: 0, dIdt: 0 });
  const circHist = useRef<{ t: number; I: number; emf: number }[]>([]);
  const Vb = 6;
  const Rp = 3;
  const Lp = 0.5;
  const M = 0.1;

  useAnimationFrame(
    (dtReal) => {
      const dt = dtReal * simSpeed;
      if (s.tab === 'magnet') {
        const nt = t + dt;
        const m2 = magnetX(nt);
        const p2 = fluxAt(mDip, a, m2.x);
        const e2 = -s.N * dFluxDz(mDip, a, m2.x) * m2.v;
        hist.current.push({ t: nt, phi: p2 * 1e6, emf: e2 * 1e3 });
        if (hist.current.length > HIST) hist.current.shift();
        setT(nt);
      } else if (s.tab === 'rod') {
        let { x, v, t: tt, energy } = rod;
        const n = 20;
        const h = dt / n;
        for (let i = 0; i < n; i++) {
          const I = (s.B * s.Lr * v) / s.R;
          const Fm = s.B * I * s.Lr; // opposes motion
          energy += I * I * s.R * h;
          if (s.rodMode === 'release') v -= (Fm / s.rodMass) * h;
          x += v * h;
          tt += h;
        }
        if (x > 0.5) {
          rodHist.current = [];
          setRod({ x: 0.05, v: s.v0, t: 0, energy: 0 });
        } else {
          rodHist.current.push({ t: tt, v, emf: s.B * s.Lr * v, I: (s.B * s.Lr * v) / s.R });
          if (rodHist.current.length > HIST) rodHist.current.shift();
          setRod({ x, v, t: tt, energy });
        }
      } else {
        const target = sw ? Vb / Rp : 0;
        const tau = Lp / Rp;
        const I = target + (circ.I - target) * Math.exp(-dt / tau);
        const dIdt = (I - circ.I) / Math.max(dt, 1e-6);
        const nt = circ.t + dt;
        circHist.current.push({ t: nt, I, emf: -M * dIdt });
        if (circHist.current.length > HIST) circHist.current.shift();
        setCirc({ I, t: nt, dIdt });
      }
    },
    playing,
    ref,
  );

  const restartAll = () => {
    setT(0);
    hist.current = [];
    setRod({ x: 0.05, v: s.v0, t: 0, energy: 0 });
    rodHist.current = [];
    setCirc({ I: 0, t: 0, dIdt: 0 });
    setSw(false);
    circHist.current = [];
  };

  /* ---------- drawing: magnet & coil ---------- */
  const magnetView = () => {
    const cx = W / 2;
    const cy = H / 2 - 10;
    const k = 600; // px per metre
    const mx = cx + mag.x * k;
    const coilR = Math.max(18, a * 1400);
    const loops = Math.min(12, Math.max(3, Math.round(s.N / 40)));
    const sig = Math.abs(dphidt) > 1e-7;
    const frontUp = dphidt > 0; // flux along +x increasing → induced B along −x → front current up
    const leftPole = !sig ? '' : frontUp ? 'N' : 'S'; // induced dipole −x when increasing → N at left end
    const rightPole = !sig ? '' : frontUp ? 'S' : 'N';
    const approaching = mag.x < 0 ? mag.v > 0 : mag.v < 0;
    const leadingPole = s.nLeading ? 'N' : 'S';
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Bar magnet moving through a coil connected to a galvanometer">
        {/* coil */}
        {Array.from({ length: loops }, (_, i) => {
          const x = cx - 40 + (80 * i) / Math.max(1, loops - 1);
          return (
            <g key={i}>
              <ellipse cx={x} cy={cy} rx={8} ry={coilR} fill="none" className="stroke-m7" strokeWidth={2} opacity={0.35} />
              <path d={`M${x},${cy - coilR} A8,${coilR} 0 0,1 ${x},${cy + coilR}`} fill="none" className="stroke-m7" strokeWidth={2.5} />
              {sig && i % 2 === 0 && <Arrow x1={x + 9} y1={cy + (frontUp ? 10 : -10)} x2={x + 9} y2={cy + (frontUp ? -12 : 12)} className="text-good" width={1.6} head={6} />}
            </g>
          );
        })}
        <Label x={cx - 52} y={cy - coilR - 8} anchor="middle" size={14} weight={700} className={leftPole === 'N' ? 'fill-bad' : 'fill-m5'}>
          {leftPole}
        </Label>
        <Label x={cx + 52} y={cy - coilR - 8} anchor="middle" size={14} weight={700} className={rightPole === 'N' ? 'fill-bad' : 'fill-m5'}>
          {rightPole}
        </Label>
        {/* galvanometer */}
        <line x1={cx - 40} y1={cy + coilR} x2={cx - 40} y2={H - 40} className="stroke-muted" />
        <line x1={cx + 40} y1={cy + coilR} x2={cx + 40} y2={H - 40} className="stroke-muted" />
        <line x1={cx - 40} y1={H - 40} x2={cx - 22} y2={H - 40} className="stroke-muted" />
        <line x1={cx + 22} y1={H - 40} x2={cx + 40} y2={H - 40} className="stroke-muted" />
        <circle cx={cx} cy={H - 40} r={22} className="fill-panel stroke-muted" />
        <line x1={cx} y1={H - 30} x2={cx + 18 * Math.sin(Math.max(-1.2, Math.min(1.2, emf * 40)))} y2={H - 30 - 18 * Math.cos(Math.max(-1.2, Math.min(1.2, emf * 40)))} className="stroke-bad" strokeWidth={2} />
        <Label x={cx} y={H - 8} anchor="middle" size={10} className="fill-muted">G</Label>
        {/* magnet */}
        <g transform={`translate(${mx}, ${cy})`}>
          <rect x={-60} y={-12} width={60} height={24} className={s.nLeading ? 'fill-m5' : 'fill-bad'} />
          <rect x={0} y={-12} width={60} height={24} className={s.nLeading ? 'fill-bad' : 'fill-m5'} />
          <Label x={-30} y={5} anchor="middle" size={12} weight={700} className="fill-white">{s.nLeading ? 'S' : 'N'}</Label>
          <Label x={30} y={5} anchor="middle" size={12} weight={700} className="fill-white">{s.nLeading ? 'N' : 'S'}</Label>
        </g>
        {mag.v !== 0 && <Arrow x1={mx - 30} y1={cy - 34} x2={mx - 30 + Math.sign(mag.v) * 50} y2={cy - 34} className="text-accent" label="v" />}
        <Label x={12} y={20} size={12} weight={600} className={sig ? 'fill-good' : 'fill-muted'}>
          {!sig
            ? 'No change in flux → no emf, no current'
            : approaching
              ? `${leadingPole} pole approaching: flux increasing → coil’s near end becomes ${leadingPole} (repels)`
              : `Magnet receding: flux decreasing → coil’s near end attracts the magnet`}
        </Label>
      </svg>
    );
  };

  const rodView = () => {
    const x0 = 70;
    const k = 800;
    const rx = x0 + rod.x * k;
    const top = 70;
    const bot = 230;
    const anticlockwise = true; // B into page, rod moving right: I in rod flows up (q v × B: (+x)×(−z) = +y)
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Conducting rod sliding on rails in a magnetic field">
        <FieldGrid x={x0} y={top} w={W - x0 - 20} h={bot - top} into step={34} />
        <line x1={x0} y1={top} x2={W - 10} y2={top} className="stroke-ink" strokeWidth={3} />
        <line x1={x0} y1={bot} x2={W - 10} y2={bot} className="stroke-ink" strokeWidth={3} />
        <rect x={x0 - 14} y={(top + bot) / 2 - 26} width={14} height={52} className="fill-m7" />
        <Label x={x0 - 40} y={(top + bot) / 2 + 4} size={11}>R</Label>
        <line x1={rx} y1={top - 8} x2={rx} y2={bot + 8} className="stroke-m5" strokeWidth={6} />
        {rodI > 1e-4 && <Arrow x1={rx + 12} y1={bot - 30} x2={rx + 12} y2={top + 30} className="text-good" label="I" />}
        <Arrow x1={rx} y1={bot + 30} x2={rx + Math.min(80, 20 * rod.v)} y2={bot + 30} className="text-accent" label="v" />
        {rodF > 1e-5 && <Arrow x1={rx} y1={top - 25} x2={rx - Math.min(90, 15 + rodF * 200)} y2={top - 25} className="text-bad" label="F = BIL" labelOffset={[-60, -6]} />}
        <Label x={12} y={H - 12} className="fill-muted" size={11}>
          Current flows {anticlockwise ? 'anticlockwise' : 'clockwise'} around the circuit (up through the rod). The force on the rod opposes its motion — Lenz’s law.
        </Label>
      </svg>
    );
  };

  const circuitView = () => {
    const kick = circHist.current.length ? circHist.current[circHist.current.length - 1].emf : 0;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Two coils: switching current in one induces emf in the other">
        {/* primary */}
        <rect x={60} y={90} width={150} height={110} rx={8} fill="none" className="stroke-muted" />
        {Array.from({ length: 7 }, (_, i) => (
          <ellipse key={i} cx={150 + i * 10} cy={145} rx={5} ry={32} fill="none" className="stroke-m7" strokeWidth={2} />
        ))}
        <Label x={60} y={80} size={11}>Primary: 6 V battery + switch</Label>
        <line x1={60} y1={145} x2={40} y2={145} className="stroke-muted" />
        <line x1={sw ? 40 : 30} y1={sw ? 120 : 110} x2={40} y2={145} className="stroke-ink" strokeWidth={2} />
        <circle cx={40} cy={120} r={3} className="fill-ink" />
        {/* secondary */}
        {Array.from({ length: 7 }, (_, i) => (
          <ellipse key={i} cx={300 + i * 10} cy={145} rx={5} ry={32} fill="none" className="stroke-m6" strokeWidth={2} />
        ))}
        <rect x={290} y={90} width={150} height={110} rx={8} fill="none" className="stroke-muted" />
        <circle cx={480} cy={145} r={24} className="fill-panel stroke-muted" />
        <line x1={480} y1={158} x2={480 + 20 * Math.sin(Math.max(-1.2, Math.min(1.2, kick * 0.6)))} y2={158 - 20 * Math.cos(Math.max(-1.2, Math.min(1.2, kick * 0.6)))} className="stroke-bad" strokeWidth={2} />
        <line x1={440} y1={145} x2={456} y2={145} className="stroke-muted" />
        <Label x={300} y={80} size={11}>Secondary + galvanometer</Label>
        <Label x={12} y={H - 30} className="fill-muted" size={11}>
          {Math.abs(kick) > 0.05 ? 'Current in the primary is changing → changing flux links the secondary → emf induced.' : 'Steady (or zero) primary current → constant flux → no induced emf.'}
        </Label>
        <Label x={12} y={H - 12} className="fill-muted" size={11}>
          Primary current I = {circ.I.toFixed(2)} A. Switch on/off and watch the galvanometer kick in opposite directions.
        </Label>
      </svg>
    );
  };

  const hdata = hist.current.map((h) => ({ t: h.t, phi: h.phi, emf: h.emf }));
  const rdata = rodHist.current.map((h) => ({ t: h.t, v: h.v, emf: h.emf, I: h.I }));
  const cdata = circHist.current.map((h) => ({ t: h.t, I: h.I, emf: h.emf }));

  return (
    <SimShell
      id="induction"
      compact={compact}
      onReset={() => {
        reset();
        restartAll();
      }}
      controls={
        <>
          <Tabs size="sm" value={s.tab} onChange={(tab) => { set({ tab }); restartAll(); }} tabs={[{ id: 'magnet', label: 'Magnet & coil' }, { id: 'rod', label: 'Moving rod' }, { id: 'circuit', label: 'Nearby circuit' }]} />
          <Playback playing={playing} setPlaying={setPlaying} speed={simSpeed} setSpeed={setSimSpeed} onReset={restartAll} />
          {s.tab === 'magnet' && (
            <>
              <Select label="Magnet motion" value={s.motion} onChange={(motion) => { set({ motion }); restartAll(); }} options={[{ value: 'pass', label: 'Pass through at constant speed' }, { value: 'push', label: 'Push in, hold, pull out' }]} />
              <Select label="Magnet direction" value={s.nLeading ? 'N' : 'S'} onChange={(v) => set({ nLeading: v === 'N' })} options={[{ value: 'N', label: 'North pole leading' }, { value: 'S', label: 'South pole leading' }]} />
              <Slider label="Magnet speed" tex="v" value={s.speed} min={0.1} max={2} step={0.05} unit="m s⁻¹" onChange={(speed) => set({ speed })} />
              <Slider label="Number of turns" tex="N" value={s.N} min={10} max={500} step={10} onChange={(N) => set({ N })} />
              <Slider label="Magnet strength (dipole moment)" value={s.strength} min={0.5} max={5} step={0.1} unit="A m²" onChange={(strength) => set({ strength })} />
              <Slider label="Coil radius" value={s.acm} min={1} max={6} step={0.5} unit="cm" onChange={(acm) => set({ acm })} />
            </>
          )}
          {s.tab === 'rod' && (
            <>
              <Select label="Mode" value={s.rodMode} onChange={(rodMode) => { set({ rodMode }); restartAll(); }} options={[{ value: 'release', label: 'Push then release (free)' }, { value: 'constant', label: 'Pulled at constant speed' }]} />
              <Slider label="Initial speed" tex="v_0" value={s.v0} min={0.5} max={5} step={0.1} unit="m s⁻¹" onChange={(v0) => set({ v0 })} />
              <Slider label="Magnetic flux density" tex="B" value={s.B} min={0.1} max={1.5} step={0.05} unit="T" onChange={(B) => set({ B })} />
              <Slider label="Rod length (rail spacing)" tex="L" value={s.Lr} min={0.05} max={0.4} step={0.01} unit="m" onChange={(Lr) => set({ Lr })} />
              <Slider label="Circuit resistance" tex="R" value={s.R} min={0.2} max={10} step={0.1} unit="Ω" onChange={(R) => set({ R })} />
            </>
          )}
          {s.tab === 'circuit' && (
            <button className={sw ? 'btn-primary w-full' : 'btn w-full'} onClick={() => setSw((x) => !x)}>
              Switch is {sw ? 'CLOSED — click to open' : 'OPEN — click to close'}
            </button>
          )}
        </>
      }
      readouts={
        s.tab === 'magnet' ? (
          <>
            <Stat label="flux through one turn" tex="\Phi" value={phi} unit="Wb" />
            <Stat label="rate of change" tex="d\Phi/dt" value={dphidt} unit="Wb s⁻¹" />
            <Stat label="induced emf" tex="\varepsilon = -N\,d\Phi/dt" value={emf} unit="V" tone="text-good" />
            <Stat label="flux linkage" tex="N\Phi" value={s.N * phi} unit="Wb-turns" />
          </>
        ) : s.tab === 'rod' ? (
          <>
            <Stat label="speed" tex="v" value={rod.v} unit="m s⁻¹" />
            <Stat label="emf" tex="\varepsilon = BLv" value={rodEmf} unit="V" tone="text-good" />
            <Stat label="current" tex="I = \varepsilon/R" value={rodI} unit="A" />
            <Stat label="opposing force" tex="F = BIL" value={rodF} unit="N" tone="text-bad" />
            <Stat label="heat dissipated so far" value={rod.energy} unit="J" />
            {s.rodMode === 'release' && <Stat label="KE lost so far" value={0.5 * s.rodMass * (s.v0 ** 2 - rod.v ** 2)} unit="J" />}
          </>
        ) : (
          <>
            <Stat label="primary current" value={circ.I} unit="A" />
            <Stat label="dI/dt" value={circ.dIdt} unit="A s⁻¹" />
            <Stat label="secondary emf = −M dI/dt" value={-M * circ.dIdt} unit="V" tone="text-good" />
          </>
        )
      }
      graphs={
        s.tab === 'magnet' ? (
          <>
            <GraphCard title="Magnetic flux vs time" note="Flux peaks as the magnet passes through the coil.">
              <Graph data={hdata} xKey="t" xLabel="t (s)" yLabel="Φ (μWb)" series={[{ key: 'phi', label: 'Φ' }]} height={190} />
            </GraphCard>
            <GraphCard title="Induced emf vs time" note="ε = −N × gradient of Φ–t: zero at the flux peak; opposite signs entering and leaving.">
              <Graph data={hdata} xKey="t" xLabel="t (s)" yLabel="ε (mV)" series={[{ key: 'emf', label: 'ε' }]} refY={[{ y: 0 }]} height={190} />
            </GraphCard>
          </>
        ) : s.tab === 'rod' ? (
          <>
            <GraphCard title="Rod speed vs time" note={s.rodMode === 'release' ? 'Exponential slowing: kinetic energy → electrical energy → heat (energy conservation).' : 'Constant speed requires a constant applied force equal to BIL.'}>
              <Graph data={rdata} xKey="t" xLabel="t (s)" yLabel="v (m s⁻¹)" series={[{ key: 'v', label: 'v' }]} height={190} />
            </GraphCard>
            <GraphCard title="Induced emf and current vs time">
              <Graph data={rdata} xKey="t" xLabel="t (s)" yLabel="ε (V), I (A)" series={[{ key: 'emf', label: 'ε' }, { key: 'I', label: 'I' }]} legend height={190} />
            </GraphCard>
          </>
        ) : (
          <>
            <GraphCard title="Primary current vs time">
              <Graph data={cdata} xKey="t" xLabel="t (s)" yLabel="I (A)" series={[{ key: 'I', label: 'I_primary' }]} height={190} />
            </GraphCard>
            <GraphCard title="Secondary emf vs time" note="emf only while the primary current changes; switching off gives the opposite sign.">
              <Graph data={cdata} xKey="t" xLabel="t (s)" yLabel="ε (V)" series={[{ key: 'emf', label: 'ε_secondary' }]} refY={[{ y: 0 }]} height={190} />
            </GraphCard>
          </>
        )
      }
      below={
        <Callout kind="tip" title="Lenz’s law = conservation of energy">
          The induced current always produces effects that oppose the change causing it. Pushing a magnet into a coil, or a rod along rails, therefore requires work — and that work becomes the electrical energy dissipated in the circuit. If the induced current helped the motion, energy would be created from nothing.
        </Callout>
      }
      formulas={['\\Phi = BA\\cos\\theta', '\\varepsilon = -N\\dfrac{\\Delta\\Phi}{\\Delta t}', '\\varepsilon = BLv\\ \\text{(moving rod)}']}
      explanation={
        <>
          <p>An emf is induced only while the flux through the coil is changing. Faster motion, more turns or a stronger magnet give a larger emf. The emf is zero when the magnet is at the centre — the flux is maximum there but momentarily not changing.</p>
          <p>Green arrows show the induced (conventional) current on the front of the coil; the letters show the magnetic pole the coil develops at each end.</p>
        </>
      }
      prediction={{
        q: 'A magnet is held still inside a coil. What does the galvanometer read?',
        options: ['A large steady current', 'A small steady current', 'Zero', 'It oscillates'],
        answer: 2,
        explain: 'No change in flux → no emf → no current, however strong the magnet.',
      }}
      assumptions={['Magnet modelled as a point magnetic dipole on the coil axis; each turn links the same flux.', 'Rod tab: frictionless rails, resistance concentrated in R, uniform B.', 'Nearby circuit: primary inductance 0.5 H, resistance 3 Ω, mutual inductance 0.1 H (illustrative).']}
      limitations={['Real coils have length; turns at different positions link different flux.', 'The self-induced back emf of the secondary coil is neglected.', 'Galvanometer needle deflection is qualitative.']}
    >
      <div ref={ref}>
        {s.tab === 'magnet' && magnetView()}
        {s.tab === 'rod' && rodView()}
        {s.tab === 'circuit' && circuitView()}
      </div>
    </SimShell>
  );
}

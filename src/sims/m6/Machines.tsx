import { useRef, useState } from 'react';
import { SimShell, Playback, GraphCard } from '@/components/SimShell';
import { Slider, Stat, Select, Callout } from '@/components/ui';
import { Graph, sample } from '@/components/Graph';
import { Arrow, Label, FieldMark } from '@/components/svg';
import { useAnimationFrame } from '@/lib/hooks';
import { useSimSettings } from '@/lib/store';

type Tab = 'dcmotor' | 'acgen' | 'dcgen' | 'compare' | 'induction' | 'braking';
const DEFAULTS = { tab: 'dcmotor' as Tab, V: 12, load: 0.02, f: 2, N: 100, B: 0.3, Acm2: 50, slipLoad: 0.3, plate: 'solid' as 'solid' | 'slotted' | 'none' };
const W = 560;
const H = 320;

/** End view of a rotating coil: B to the right; angle = angle of coil normal from B (rad). */
function CoilEndView({ angle, currentSign, showForces, label, commutator }: { angle: number; currentSign: number; showForces: boolean; label: string; commutator: 'split' | 'slip' }) {
  const cx = 230;
  const cy = 150;
  const R = 95;
  // coil plane is perpendicular to its normal
  const planeAng = angle + Math.PI / 2;
  const ax = cx + R * Math.cos(planeAng);
  const ay = cy - R * Math.sin(planeAng);
  const bx = cx - R * Math.cos(planeAng);
  const by = cy + R * Math.sin(planeAng);
  // side A carries current INTO page when currentSign > 0
  const aInto = currentSign > 0;
  // force on side with current into page (−z) in B (+x): (−z)×(+x) = −y → down the page (screen +y)
  const fA = aInto ? 1 : -1;
  const show = Math.abs(currentSign) > 1e-6;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={label}>
      <rect x={20} y={40} width={36} height={220} rx={6} className="fill-bad" />
      <rect x={404} y={40} width={36} height={220} rx={6} className="fill-m5" />
      <Label x={38} y={155} anchor="middle" size={16} weight={700} className="fill-white">N</Label>
      <Label x={422} y={155} anchor="middle" size={16} weight={700} className="fill-white">S</Label>
      {Array.from({ length: 6 }, (_, i) => (
        <Arrow key={i} x1={64} y1={60 + i * 38} x2={396} y2={60 + i * 38} className="text-m6/30" width={1} head={6} />
      ))}
      <line x1={ax} y1={ay} x2={bx} y2={by} className="stroke-m7" strokeWidth={5} />
      <circle cx={cx} cy={cy} r={5} className="fill-muted" />
      {show ? <FieldMark x={ax} y={ay} into={aInto} r={12} className="text-ink" /> : <circle cx={ax} cy={ay} r={10} className="fill-line" />}
      {show ? <FieldMark x={bx} y={by} into={!aInto} r={12} className="text-ink" /> : <circle cx={bx} cy={by} r={10} className="fill-line" />}
      {showForces && show && (
        <>
          <Arrow x1={ax} y1={ay} x2={ax} y2={ay + fA * 55} className="text-good" label="F" />
          <Arrow x1={bx} y1={by} x2={bx} y2={by - fA * 55} className="text-good" label="F" />
        </>
      )}
      {/* commutator / slip-ring schematic */}
      <g transform="translate(490, 150)">
        {commutator === 'split' ? (
          <g transform={`rotate(${(-angle * 180) / Math.PI})`}>
            <path d="M0,-30 A30,30 0 0,1 0,30" fill="none" className="stroke-m7" strokeWidth={8} />
            <path d="M0,30 A30,30 0 0,1 0,-30" fill="none" className="stroke-m8" strokeWidth={8} />
          </g>
        ) : (
          <>
            <circle r={30} fill="none" className="stroke-m7" strokeWidth={6} />
            <circle r={18} fill="none" className="stroke-m8" strokeWidth={6} />
          </>
        )}
        <rect x={-6} y={-48} width={12} height={12} className="fill-muted" />
        <rect x={-6} y={36} width={12} height={12} className="fill-muted" />
        <Label x={0} y={-56} anchor="middle" size={10} className="fill-muted">brushes</Label>
        <Label x={0} y={70} anchor="middle" size={10} className="fill-muted">{commutator === 'split' ? 'split ring' : 'slip rings'}</Label>
      </g>
      <Label x={12} y={H - 10} className="fill-muted" size={11}>
        End view. ⊗/⊙ = current into/out of the page in each long side. B points N → S.
      </Label>
    </svg>
  );
}

export default function MachinesSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('machines', DEFAULTS);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const ref = useRef<HTMLDivElement>(null);

  /* ---------- DC motor model (radial-field approximation: τ = kI, ε_back = kω) ---------- */
  const k = 0.05; // N m A⁻¹ (= V s rad⁻¹)
  const Rm = 1.5;
  const J = 2e-4;
  const bFric = 2e-5;
  const [motor, setMotor] = useState({ w: 0, ang: 0, t: 0 });
  const motorHist = useRef<{ t: number; w: number; I: number; e: number }[]>([]);
  const Im = (s.V - k * motor.w) / Rm;

  /* ---------- generators ---------- */
  const [gen, setGen] = useState({ ang: 0, t: 0 });
  const A = s.Acm2 / 1e4;
  const omegaG = 2 * Math.PI * s.f;
  const peak = s.N * s.B * A * omegaG;

  /* ---------- induction motor ---------- */
  const [ind, setInd] = useState({ field: 0, rotor: 0 });
  const slip = Math.min(0.95, Math.max(0.01, s.slipLoad));

  /* ---------- braking pendulum ---------- */
  const [pend, setPend] = useState({ th: 1.0, w: 0, t: 0 });
  const pendHist = useRef<{ t: number; th: number }[]>([]);
  const damp = s.plate === 'solid' ? 1.6 : s.plate === 'slotted' ? 0.25 : 0.02;

  const restart = () => {
    setMotor({ w: 0, ang: 0, t: 0 });
    motorHist.current = [];
    setGen({ ang: 0, t: 0 });
    setPend({ th: 1.0, w: 0, t: 0 });
    pendHist.current = [];
  };

  useAnimationFrame(
    (dtReal) => {
      const dt = dtReal * speed;
      if (s.tab === 'dcmotor') {
        let { w, ang, t } = motor;
        const n = 50;
        const h = dt / n;
        for (let i = 0; i < n; i++) {
          const I = (s.V - k * w) / Rm;
          const tau = k * I - s.load * Math.sign(w || 1) - bFric * w;
          w = Math.max(0, w + (tau / J) * h);
          t += h;
        }
        ang += w * dt * 0.02; // visual rotation slowed 50× so it can be followed
        motorHist.current.push({ t, w: (w * 60) / (2 * Math.PI), I: (s.V - k * w) / Rm, e: k * w });
        if (motorHist.current.length > 400) motorHist.current.shift();
        setMotor({ w, ang, t });
      } else if (s.tab === 'acgen' || s.tab === 'dcgen' || s.tab === 'compare') {
        setGen((g) => ({ ang: g.ang + omegaG * dt * 0.25, t: g.t + dt * 0.25 }));
      } else if (s.tab === 'induction') {
        setInd((x) => ({ field: x.field + 1.5 * dt, rotor: x.rotor + 1.5 * (1 - slip) * dt }));
      } else if (s.tab === 'braking') {
        let { th, w, t } = pend;
        const n = 20;
        const h = dt / n;
        for (let i = 0; i < n; i++) {
          // eddy braking acts only while the plate passes through the field (|θ| < 0.35 rad)
          const inField = Math.abs(th) < 0.35 ? 1 : 0;
          const a = (-9.8 / 0.5) * Math.sin(th) - damp * inField * w * 6;
          w += a * h;
          th += w * h;
          t += h;
        }
        pendHist.current.push({ t, th: (th * 180) / Math.PI });
        if (pendHist.current.length > 500) pendHist.current.shift();
        setPend({ th, w, t });
      }
    },
    playing,
    ref,
  );

  const genAng = gen.ang;
  const emfNow = peak * Math.sin(genAng);
  const genData = sample((t) => {
    const e = peak * Math.sin(omegaG * t);
    return { ac: e, dc: Math.abs(e), phi: s.N * s.B * A * Math.cos(omegaG * t) * 100 };
  }, 0, 2 / s.f, 200, 't');

  const view = () => {
    switch (s.tab) {
      case 'dcmotor': {
        // with split-ring commutator the current reverses each half turn so torque is one-way
        const a = motor.ang % (2 * Math.PI);
        // counterclockwise torque requires side A's current OUT of the page while sin(a) > 0
        const sign = Math.sin(a) >= 0 ? -1 : 1;
        return <CoilEndView angle={a} currentSign={Im > 0 ? sign : 0} showForces label="DC motor end view with split-ring commutator" commutator="split" />;
      }
      case 'acgen':
        return <CoilEndView angle={genAng} currentSign={-Math.sin(genAng)} showForces={false} label="AC generator: coil rotating in a magnetic field with slip rings" commutator="slip" />;
      case 'dcgen':
        return <CoilEndView angle={genAng} currentSign={-Math.sin(genAng)} showForces={false} label="DC generator: coil with split-ring commutator" commutator="split" />;
      case 'induction': {
        const cx = W / 2;
        const cy = H / 2;
        const Bang = ind.field;
        return (
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="AC induction motor: rotating stator field and squirrel-cage rotor">
            {[0, 1, 2].map((p) => {
              const ang = (p * 2 * Math.PI) / 3;
              const strength = Math.cos(Bang - ang);
              return (
                <g key={p}>
                  {[0, Math.PI].map((off) => (
                    <rect key={off} x={cx + 125 * Math.cos(ang + off) - 16} y={cy - 125 * Math.sin(ang + off) - 16} width={32} height={32} rx={6} className={['fill-m7', 'fill-m6', 'fill-m8'][p]} opacity={0.3 + 0.7 * Math.abs(strength)} />
                  ))}
                </g>
              );
            })}
            <circle cx={cx} cy={cy} r={95} fill="none" className="stroke-line" strokeWidth={2} />
            {Array.from({ length: 12 }, (_, i) => {
              const ang = ind.rotor + (i * Math.PI) / 6;
              return <circle key={i} cx={cx + 75 * Math.cos(ang)} cy={cy - 75 * Math.sin(ang)} r={6} className="fill-muted" />;
            })}
            <circle cx={cx} cy={cy} r={75} fill="none" className="stroke-muted" strokeWidth={3} />
            <Arrow x1={cx} y1={cy} x2={cx + 105 * Math.cos(Bang)} y2={cy - 105 * Math.sin(Bang)} className="text-accent" label="B (rotating)" width={3} />
            <Label x={12} y={H - 28} className="fill-muted" size={11}>
              Three stator coil pairs fed with AC 120° out of phase → a magnetic field of constant size that rotates.
            </Label>
            <Label x={12} y={H - 10} className="fill-muted" size={11}>
              Rotor bars (grey) turn at {((1 - slip) * 100).toFixed(0)}% of the field speed (slip {(slip * 100).toFixed(0)}%). Relative motion → induced currents → torque.
            </Label>
          </svg>
        );
      }
      case 'braking': {
        const px = W / 2;
        const py = 30;
        const L = 200;
        const bx = px + L * Math.sin(pend.th);
        const by = py + L * Math.cos(pend.th);
        return (
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Metal plate pendulum swinging through a magnetic field">
            {s.plate !== 'none' && (
              <>
                <rect x={px - 60} y={py + L - 30} width={36} height={70} className="fill-bad" opacity={0.7} />
                <rect x={px + 24} y={py + L - 30} width={36} height={70} className="fill-m5" opacity={0.7} />
              </>
            )}
            <line x1={px - 50} y1={py} x2={px + 50} y2={py} className="stroke-ink" strokeWidth={3} />
            <line x1={px} y1={py} x2={bx} y2={by} className="stroke-ink" strokeWidth={2} />
            <g transform={`translate(${bx}, ${by}) rotate(${(-pend.th * 180) / Math.PI})`}>
              <rect x={-26} y={-6} width={52} height={40} rx={3} className="fill-m7" />
              {s.plate === 'slotted' && [-15, -5, 5, 15].map((x) => <rect key={x} x={x - 1.5} y={6} width={3} height={28} className="fill-bg" />)}
            </g>
            <Label x={12} y={H - 28} className="fill-muted" size={11}>
              {s.plate === 'none' ? 'No magnet: the pendulum swings freely (tiny air resistance).' : s.plate === 'solid' ? 'Solid plate: large eddy currents oppose the motion through the field — strong braking.' : 'Slotted plate: slots break up the eddy-current loops — weak braking.'}
            </Label>
            <Label x={12} y={H - 10} className="fill-muted" size={11}>
              Kinetic energy → electrical energy (eddy currents) → heat in the plate.
            </Label>
          </svg>
        );
      }
      default:
        return (
          <div className="overflow-x-auto p-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="p-2">Feature</th>
                  <th className="p-2">DC motor</th>
                  <th className="p-2">AC generator</th>
                  <th className="p-2">DC generator</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Energy conversion', 'Electrical → kinetic (rotational)', 'Kinetic → electrical', 'Kinetic → electrical'],
                  ['Physics principle', 'Motor effect (F = lIB)', 'Electromagnetic induction (Faraday)', 'Electromagnetic induction (Faraday)'],
                  ['Connection to circuit', 'Split-ring commutator + brushes', 'Slip rings + brushes', 'Split-ring commutator + brushes'],
                  ['Role of the connector', 'Reverses current each half turn → torque always the same way', 'Keeps each coil end on the same ring → alternating output', 'Reverses connections each half turn → output never changes sign'],
                  ['Lenz’s law appears as', 'Back emf opposing the supply', 'Opposing torque (harder to turn when current is drawn)', 'Opposing torque'],
                ].map((r) => (
                  <tr key={r[0]} className="border-t border-line align-top">
                    {r.map((c, i) => (
                      <td key={i} className={`p-2 ${i === 0 ? 'font-semibold' : ''}`}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-muted">A motor and a generator are the same device run in reverse: a spinning motor generates back emf; a generator delivering current experiences a motor-effect force opposing its rotation.</p>
          </div>
        );
    }
  };

  const mData = motorHist.current.map((h) => ({ t: h.t, rpm: h.w, I: h.I, e: h.e }));
  const pData = pendHist.current.map((h) => ({ t: h.t, th: h.th }));
  const torqueSlip = sample((x) => ({ T: (2 * x * 0.2) / (x * x + 0.04) }), 0, 1, 100, 's');

  return (
    <SimShell
      id="machines"
      compact={compact}
      onReset={() => {
        reset();
        restart();
      }}
      controls={
        <>
          <Select
            label="Machine"
            value={s.tab}
            onChange={(tab) => {
              set({ tab });
              restart();
            }}
            options={[
              { value: 'dcmotor', label: 'DC motor & back emf' },
              { value: 'acgen', label: 'AC generator (slip rings)' },
              { value: 'dcgen', label: 'DC generator (commutator)' },
              { value: 'compare', label: 'Motor vs generator comparison' },
              { value: 'induction', label: 'AC induction motor' },
              { value: 'braking', label: 'Electromagnetic braking' },
            ]}
          />
          {s.tab !== 'compare' && <Playback playing={playing} setPlaying={setPlaying} speed={speed} setSpeed={setSpeed} onReset={restart} />}
          {s.tab === 'dcmotor' && (
            <>
              <Slider label="Supply voltage" tex="V" value={s.V} min={1} max={24} step={0.5} unit="V" onChange={(V) => set({ V })} />
              <Slider label="Load torque" value={s.load} min={0} max={0.3} step={0.005} unit="N m" onChange={(load) => set({ load })} />
            </>
          )}
          {(s.tab === 'acgen' || s.tab === 'dcgen') && (
            <>
              <Slider label="Rotation frequency" tex="f" value={s.f} min={0.5} max={10} step={0.5} unit="Hz" onChange={(f) => set({ f })} />
              <Slider label="Turns" tex="N" value={s.N} min={10} max={500} step={10} onChange={(N) => set({ N })} />
              <Slider label="Flux density" tex="B" value={s.B} min={0.05} max={1} step={0.05} unit="T" onChange={(B) => set({ B })} />
              <Slider label="Coil area" tex="A" value={s.Acm2} min={10} max={200} step={5} unit="cm²" onChange={(Acm2) => set({ Acm2 })} />
            </>
          )}
          {s.tab === 'induction' && <Slider label="Mechanical load (sets slip)" value={s.slipLoad} min={0.02} max={0.9} step={0.01} onChange={(slipLoad) => set({ slipLoad })} />}
          {s.tab === 'braking' && (
            <Select label="Plate" value={s.plate} onChange={(plate) => { set({ plate }); restart(); }} options={[{ value: 'solid', label: 'Solid metal plate' }, { value: 'slotted', label: 'Slotted metal plate' }, { value: 'none', label: 'No magnet' }]} />
          )}
        </>
      }
      readouts={
        s.tab === 'dcmotor' ? (
          <>
            <Stat label="speed" value={(motor.w * 60) / (2 * Math.PI)} unit="rpm" />
            <Stat label="back emf" tex="\varepsilon = k\omega" value={k * motor.w} unit="V" />
            <Stat label="current" tex="I = (V-\varepsilon)/R" value={Im} unit="A" tone="text-bad" />
            <Stat label="input power VI" value={s.V * Im} unit="W" />
            <Stat label="mechanical power εI" value={k * motor.w * Im} unit="W" tone="text-good" />
            <Stat label="heat I²R" value={Im * Im * Rm} unit="W" />
          </>
        ) : s.tab === 'acgen' || s.tab === 'dcgen' ? (
          <>
            <Stat label="angular velocity" tex="\omega" value={omegaG} unit="rad s⁻¹" />
            <Stat label="peak emf NBAω" value={peak} unit="V" tone="text-accent" />
            <Stat label="instantaneous emf" value={s.tab === 'dcgen' ? Math.abs(emfNow) : emfNow} unit="V" />
            <Stat label="output frequency" value={s.f} unit="Hz" />
          </>
        ) : s.tab === 'induction' ? (
          <>
            <Stat label="slip" value={`${(slip * 100).toFixed(0)}%`} />
            <Stat label="rotor speed / field speed" value={1 - slip} />
            <Stat label="relative torque" value={(2 * slip * 0.2) / (slip * slip + 0.04)} />
          </>
        ) : s.tab === 'braking' ? (
          <>
            <Stat label="angle" value={`${((pend.th * 180) / Math.PI).toFixed(1)}°`} />
            <Stat label="braking" value={s.plate === 'solid' ? 'strong' : s.plate === 'slotted' ? 'weak' : 'none'} />
          </>
        ) : undefined
      }
      graphs={
        s.tab === 'dcmotor' ? (
          <>
            <GraphCard title="Start-up: speed vs time" note="Speed rises until back emf limits the current to what the load needs.">
              <Graph data={mData} xKey="t" xLabel="t (s)" yLabel="speed (rpm)" series={[{ key: 'rpm', label: 'speed' }]} height={190} />
            </GraphCard>
            <GraphCard title="Current and back emf vs time" note="Large start-up current (no back emf); current falls as back emf builds.">
              <Graph data={mData} xKey="t" xLabel="t (s)" yLabel="I (A), ε (V)" series={[{ key: 'I', label: 'I' }, { key: 'e', label: 'back emf' }]} legend height={190} />
            </GraphCard>
          </>
        ) : s.tab === 'acgen' || s.tab === 'dcgen' ? (
          <GraphCard title={s.tab === 'acgen' ? 'AC output: emf vs time' : 'DC output: emf vs time (pulsating DC)'} note="emf is maximum when the coil’s plane is parallel to B (flux zero but changing fastest).">
            <Graph data={genData} xKey="t" xLabel="t (s)" yLabel="emf (V); NΦ×100 (Wb)" series={[{ key: s.tab === 'acgen' ? 'ac' : 'dc', label: 'emf' }, { key: 'phi', label: 'flux linkage × 100', dashed: true }]} refY={[{ y: 0 }]} legend height={220} />
          </GraphCard>
        ) : s.tab === 'induction' ? (
          <GraphCard title="Torque vs slip (illustrative)" note="Zero slip → no relative motion → no induced current → no torque.">
            <Graph data={torqueSlip} xKey="s" xLabel="slip" yLabel="relative torque" series={[{ key: 'T', label: 'τ' }]} dots={[{ x: slip, y: (2 * slip * 0.2) / (slip * slip + 0.04) }]} height={200} />
          </GraphCard>
        ) : s.tab === 'braking' ? (
          <GraphCard title="Pendulum angle vs time">
            <Graph data={pData} xKey="t" xLabel="t (s)" yLabel="θ (°)" series={[{ key: 'th', label: 'θ' }]} refY={[{ y: 0 }]} height={200} />
          </GraphCard>
        ) : undefined
      }
      below={
        s.tab === 'dcmotor' ? (
          <Callout kind="tip" title="Energy conservation in the motor">
            V I = ε I + I²R: input electrical power = mechanical power (back emf × current) + heating. With no load the motor speeds up until back emf almost equals the supply voltage. A jammed motor has ε = 0 and draws I = V/R = {(s.V / Rm).toFixed(1)} A.
          </Callout>
        ) : (
          <Callout kind="info">Brushes are spring-loaded carbon blocks that maintain sliding electrical contact with the rotating commutator or slip rings.</Callout>
        )
      }
      formulas={['\\tau = nIAB\\sin\\theta', '\\varepsilon = NBA\\omega\\sin\\omega t', 'I = \\dfrac{V - \\varepsilon_{back}}{R}', '\\varepsilon = -N\\dfrac{\\Delta\\Phi}{\\Delta t}']}
      explanation={
        <>
          <p>A DC motor uses the motor effect: opposite sides of the coil carry opposite currents, so the forces form a couple. The split-ring commutator reverses the coil current every half turn so the torque keeps turning it the same way.</p>
          <p>Generators use induction: rotating the coil changes the flux through it. Slip rings deliver alternating output; a commutator flips the connections to give pulsating DC.</p>
        </>
      }
      prediction={{
        q: 'A DC motor is running with no load. A heavy load is suddenly attached. What happens to the current?',
        options: ['Decreases', 'Increases', 'Stays the same', 'Reverses'],
        answer: 1,
        explain: 'The motor slows, back emf (∝ speed) falls, so I = (V − ε)/R increases to supply the extra torque.',
      }}
      assumptions={['DC motor: radial-field approximation (torque = kI, back emf = kω) with k = 0.050 N m A⁻¹, R = 1.5 Ω.', 'Generators: uniform B, constant angular velocity, open circuit (emf shown).', 'Induction motor and braking views are conceptual models.']}
      limitations={['Coil rotation in the motor animation is slowed 50× so it can be followed.', 'Induction-motor torque–slip curve is a simplified shape, not a specific machine.', 'Braking pendulum uses an illustrative damping coefficient.']}
    >
      <div ref={ref}>{view()}</div>
    </SimShell>
  );
}

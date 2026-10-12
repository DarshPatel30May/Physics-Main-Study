import { useMemo, useRef, useState } from 'react';
import { SimShell, Playback, GraphCard } from '@/components/SimShell';
import { Slider, Stat, Tabs, NumberField, parseNum, Callout, Tex } from '@/components/ui';
import { Graph } from '@/components/Graph';
import { Arrow, Label } from '@/components/svg';
import { useAnimationFrame } from '@/lib/hooks';
import { useSimSettings } from '@/lib/store';
import { C } from '@/lib/physics/constants';
import { gammaFromBeta } from '@/lib/physics/relativity';
import { sig, sigTex } from '@/lib/physics/stats';

type Tab = 'clock' | 'simul' | 'calc' | 'muon' | 'emc2';
const DEFAULTS = { tab: 'clock' as Tab, beta: 0.6, t0: '1', l0: '100', m0: '9.109e-31', alt: 15, mass: '1' };
const W = 560;
const H = 300;
const CPX = 160; // speed of light on screen (px/s)

export default function RelativitySim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('relativity', DEFAULTS);
  const [playing, setPlaying] = useState(true);
  const [t, setT] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useAnimationFrame((dt) => setT((x) => x + dt), playing, ref);
  const b = Math.min(0.9999, Math.max(0, s.beta));
  const g = gammaFromBeta(b);

  const restart = () => setT(0);

  /* ---------------- light clocks ---------------- */
  const clockView = () => {
    const hClock = 110;
    const tickRest = (2 * hClock) / CPX; // proper tick (round trip)
    const tickMoving = tickRest * g;
    const phaseA = (t % tickRest) / tickRest;
    const phaseB = (t % tickMoving) / tickMoving;
    const yA = phaseA < 0.5 ? 2 * phaseA * hClock : (2 - 2 * phaseA) * hClock;
    const yB = phaseB < 0.5 ? 2 * phaseB * hClock : (2 - 2 * phaseB) * hClock;
    const xB = (60 + b * CPX * t) % (W - 120);
    const ticksA = Math.floor(t / tickRest);
    const ticksB = Math.floor(t / tickMoving);
    // trace of B's photon path over the last tick
    const pts: string[] = [];
    for (let i = 0; i <= 30; i++) {
      const tt = t - (i / 30) * tickMoving;
      if (tt < 0) break;
      const ph = (tt % tickMoving) / tickMoving;
      const y = ph < 0.5 ? 2 * ph * hClock : (2 - 2 * ph) * hClock;
      const x = (60 + b * CPX * tt) % (W - 120);
      if (x > xB + 1) break;
      pts.push(`${i ? 'L' : 'M'}${(x + 100).toFixed(1)},${(250 - y).toFixed(1)}`);
    }
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Two light clocks: one at rest and one moving; the moving clock ticks more slowly">
        <g>
          <rect x={30} y={250 - hClock - 6} width={60} height={6} className="fill-m5" />
          <rect x={30} y={250} width={60} height={6} className="fill-m5" />
          <circle cx={60} cy={250 - yA} r={5} className="fill-m7" />
          <Label x={60} y={280} anchor="middle" size={11}>at rest: {ticksA} ticks</Label>
        </g>
        <line x1={110} y1={20} x2={110} y2={290} className="stroke-line" />
        <g>
          <rect x={xB + 100 - 30} y={250 - hClock - 6} width={60} height={6} className="fill-m6" />
          <rect x={xB + 100 - 30} y={250} width={60} height={6} className="fill-m6" />
          <path d={pts.join(' ')} fill="none" className="stroke-m7" strokeDasharray="3 3" />
          <circle cx={xB + 100} cy={250 - yB} r={5} className="fill-m7" />
          <Arrow x1={xB + 100 + 34} y1={180} x2={xB + 100 + 34 + 30} y2={180} className="text-accent" label={`${b}c`} />
          <Label x={Math.min(W - 80, xB + 100)} y={280} anchor="middle" size={11}>moving: {ticksB} ticks</Label>
        </g>
        <Label x={12} y={20} size={11} className="fill-muted">
          Viewed from the lab frame. Both photons travel at the same speed c; the moving clock’s photon follows a longer diagonal path.
        </Label>
      </svg>
    );
  };

  /* ---------------- simultaneity ---------------- */
  const simulView = () => {
    const L = 360; // train length in lab frame (px)
    const x0 = 100;
    const T = (L / 2 / CPX) * 2.2;
    const tt = t % T;
    const trainX = x0 + b * CPX * tt;
    const r = CPX * tt; // light pulse radius from the strike points
    const midGround = x0 + L / 2;
    const obsTrain = trainX + L / 2;
    // times when each pulse reaches the train observer (lab frame)
    const tFront = L / 2 / (CPX * (1 + b));
    const tBack = L / 2 / (CPX * (1 - b));
    const gotFront = tt >= tFront;
    const gotBack = tt >= tBack;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Einstein's train thought experiment for relativity of simultaneity">
        <line x1={0} y1={210} x2={W} y2={210} className="stroke-muted" strokeWidth={2} />
        <rect x={trainX} y={150} width={L} height={50} rx={6} className="fill-m5" opacity={0.3} />
        <circle cx={obsTrain} cy={170} r={8} className={gotFront && !gotBack ? 'fill-bad' : 'fill-m6'} />
        <Label x={obsTrain} y={145} anchor="middle" size={11}>train observer</Label>
        <circle cx={midGround} cy={235} r={8} className="fill-good" />
        <Label x={midGround} y={262} anchor="middle" size={11}>platform observer</Label>
        <Label x={x0} y={232} anchor="middle" size={14}>⚡</Label>
        <Label x={x0 + L} y={232} anchor="middle" size={14}>⚡</Label>
        <circle cx={x0} cy={180} r={Math.min(r, 600)} fill="none" className="stroke-m7" opacity={0.7} />
        <circle cx={x0 + L} cy={180} r={Math.min(r, 600)} fill="none" className="stroke-m7" opacity={0.7} />
        <Arrow x1={trainX + L - 60} y1={130} x2={trainX + L - 20} y2={130} className="text-accent" label={`${b}c`} />
        <Label x={12} y={22} size={11} className="fill-muted">
          Lab (platform) frame: lightning strikes both ends of the train simultaneously.
        </Label>
        <Label x={12} y={40} size={11} className={gotFront && !gotBack ? 'fill-bad' : 'fill-muted'}>
          {gotFront && !gotBack ? 'Train observer has seen the FRONT flash first → in her frame the front strike happened first.' : gotFront && gotBack ? 'Platform observer saw both at once; the train observer saw the front flash first.' : 'Light pulses travelling at c…'}
        </Label>
      </svg>
    );
  };

  /* ---------------- calculators ---------------- */
  const t0 = parseNum(s.t0);
  const l0 = parseNum(s.l0);
  const m0 = parseNum(s.m0);
  const v = b * C.c;
  const gData = useMemo(() => Array.from({ length: 200 }, (_, i) => {
    const x = (i / 199) * 0.995;
    return { b: x, g: 1 / Math.sqrt(1 - x * x), p: x / Math.sqrt(1 - x * x), pc: x };
  }), []);

  /* ---------------- muons ---------------- */
  const tau = 2.2e-6;
  const H0 = s.alt * 1e3;
  const tTravel = H0 / v;
  const survClassical = Math.exp(-tTravel / tau);
  const survRel = Math.exp(-tTravel / (g * tau));
  const muonView = () => (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Muons travelling from the upper atmosphere to the ground">
      <rect x={0} y={260} width={W} height={40} className="fill-m8" opacity={0.3} />
      <Label x={20} y={280} size={11}>Earth’s surface</Label>
      <line x1={100} y1={30} x2={100} y2={260} className="stroke-muted" strokeDasharray="4 4" />
      <Label x={110} y={40} size={11}>{s.alt} km (Earth frame)</Label>
      <rect x={300} y={260 - 230 / g} width={60} height={230 / g} className="fill-m6" opacity={0.25} />
      <Label x={330} y={255 - 230 / g} anchor="middle" size={11}>{(s.alt / g).toFixed(2)} km</Label>
      <Label x={330} y={285} anchor="middle" size={11}>muon frame</Label>
      {Array.from({ length: 20 }, (_, i) => (
        <circle key={i} cx={160 + (i % 10) * 9} cy={40 + ((t * 60 + i * 23) % 220)} r={3} className="fill-m7" opacity={Math.exp(-((t * 60 + i * 23) % 220) / 220 * (tTravel / (g * tau)))} />
      ))}
      <Label x={W - 12} y={40} anchor="end" size={12} weight={600} className="fill-good">
        Surviving to ground: {(survRel * 100).toPrecision(3)}%
      </Label>
      <Label x={W - 12} y={60} anchor="end" size={12} className="fill-bad">
        Classical prediction: {survClassical < 1e-4 ? survClassical.toExponential(1) : (survClassical * 100).toPrecision(3) + '%'}
      </Label>
    </svg>
  );

  /* ---------------- E = mc² ---------------- */
  const mass = parseNum(s.mass);
  const examples = [
    { name: 'Electron–positron annihilation', dm: 2 * C.me, E: 2 * C.me * C.c * C.c, note: 'all rest mass → two 511 keV photons' },
    { name: 'Sun, each second', dm: 3.85e26 / (C.c * C.c), E: 3.85e26, note: '≈ 0.7% of the mass of the H that fuses' },
    { name: 'Fission of 1 kg of U-235', dm: 8.2e13 / (C.c * C.c), E: 8.2e13, note: '≈ 0.1% of the mass' },
    { name: 'Burning 1 kg of petrol', dm: 4.6e7 / (C.c * C.c), E: 4.6e7, note: '≈ 5 × 10⁻¹⁰ kg — unmeasurably small' },
  ];

  return (
    <SimShell
      id="relativity"
      compact={compact}
      onReset={() => {
        reset();
        restart();
      }}
      controls={
        <>
          <Tabs
            size="sm"
            value={s.tab}
            onChange={(tab) => {
              set({ tab });
              restart();
            }}
            tabs={[
              { id: 'clock', label: 'Light clock' },
              { id: 'simul', label: 'Simultaneity' },
              { id: 'calc', label: 'Calculators' },
              { id: 'muon', label: 'Muons' },
              { id: 'emc2', label: 'E = mc²' },
            ]}
          />
          {(s.tab === 'clock' || s.tab === 'simul' || s.tab === 'muon') && <Playback playing={playing} setPlaying={setPlaying} onReset={restart} />}
          {s.tab !== 'emc2' && <Slider label="Speed" tex="\beta = v/c" value={s.beta} min={0} max={s.tab === 'muon' ? 0.9999 : 0.99} step={s.tab === 'muon' ? 0.0001 : 0.01} onChange={(beta) => set({ beta })} />}
          {s.tab === 'calc' && (
            <>
              <NumberField label="proper time" tex="t_0" value={s.t0} onChange={(t0v) => set({ t0: t0v })} unit="s" invalid={!(t0 > 0)} />
              <NumberField label="proper length" tex="l_0" value={s.l0} onChange={(l0v) => set({ l0: l0v })} unit="m" invalid={!(l0 > 0)} />
              <NumberField label="rest mass" tex="m_0" value={s.m0} onChange={(m0v) => set({ m0: m0v })} unit="kg" invalid={!(m0 > 0)} />
            </>
          )}
          {s.tab === 'muon' && <Slider label="Altitude where muons are produced" value={s.alt} min={5} max={20} step={0.5} unit="km" onChange={(alt) => set({ alt })} />}
          {s.tab === 'emc2' && <NumberField label="mass converted" tex="m" value={s.mass} onChange={(mass2) => set({ mass: mass2 })} unit="kg" invalid={!(mass > 0)} />}
        </>
      }
      readouts={
        s.tab === 'emc2' ? (
          <>
            <Stat label="energy E = mc²" value={mass * C.c * C.c} unit="J" tone="text-accent" />
            <Stat label="in MeV" value={(mass * C.c * C.c) / (1e6 * C.eV)} unit="MeV" />
            <Stat label="equivalent years of NSW electricity (≈ 2.4 × 10¹⁷ J/yr)" value={(mass * C.c * C.c) / 2.4e17} />
          </>
        ) : (
          <>
            <Stat label="Lorentz factor" tex="\gamma" value={g} n={4} tone="text-accent" />
            {s.tab === 'calc' && <Stat label="dilated time" tex="t = \gamma t_0" value={g * t0} unit="s" />}
            {s.tab === 'calc' && <Stat label="contracted length" tex="l = l_0/\gamma" value={l0 / g} unit="m" />}
            {s.tab === 'calc' && <Stat label="relativistic momentum" tex="p = \gamma m_0 v" value={g * m0 * v} unit="kg m s⁻¹" />}
            {s.tab === 'calc' && <Stat label="classical momentum" tex="m_0 v" value={m0 * v} unit="kg m s⁻¹" />}
            {s.tab === 'calc' && <Stat label="rest energy" tex="m_0c^2" value={m0 * C.c * C.c} unit="J" />}
            {s.tab === 'calc' && <Stat label="kinetic energy (γ−1)m₀c² — suppl." value={(g - 1) * m0 * C.c * C.c} unit="J" />}
            {s.tab === 'clock' && <Stat label="moving clock tick ÷ rest tick" value={g} n={4} />}
            {s.tab === 'muon' && <Stat label="travel time (Earth frame)" value={tTravel * 1e6} unit="μs" />}
            {s.tab === 'muon' && <Stat label="dilated mean lifetime γτ" value={g * tau * 1e6} unit="μs" />}
            {s.tab === 'muon' && <Stat label="atmosphere thickness in muon frame" value={s.alt / g} unit="km" />}
          </>
        )
      }
      graphs={
        s.tab === 'calc' ? (
          <>
            <GraphCard title="Lorentz factor vs speed" note="γ is nearly 1 below ~0.1c, then rises steeply, tending to infinity as v → c.">
              <Graph data={gData} xKey="b" xLabel="v/c" yLabel="γ" series={[{ key: 'g', label: 'γ' }]} dots={[{ x: b, y: g }]} yDomain={[0, 10]} height={210} />
            </GraphCard>
            <GraphCard title="Momentum: classical vs relativistic" note="Relativistic momentum → ∞ as v → c: no finite force can accelerate a mass to c.">
              <Graph data={gData} xKey="b" xLabel="v/c" yLabel="p / (m₀c)" series={[{ key: 'p', label: 'relativistic γm₀v' }, { key: 'pc', label: 'classical m₀v', dashed: true }]} yDomain={[0, 8]} legend height={210} />
            </GraphCard>
          </>
        ) : undefined
      }
      below={
        s.tab === 'emc2' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="p-2">Process</th>
                  <th className="p-2">Energy released</th>
                  <th className="p-2">Mass converted Δm = E/c²</th>
                  <th className="p-2">Note</th>
                </tr>
              </thead>
              <tbody className="num">
                {examples.map((e) => (
                  <tr key={e.name} className="border-t border-line">
                    <td className="p-2 font-sans">{e.name}</td>
                    <td className="p-2">{sig(e.E)} J</td>
                    <td className="p-2">{sig(e.dm)} kg</td>
                    <td className="p-2 font-sans text-muted">{e.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : s.tab === 'muon' ? (
          <Callout kind="model" title="Two frames, one outcome">
            Earth frame: the muon’s clock runs slow (time dilation), so its mean life is γτ = {(g * tau * 1e6).toFixed(1)} μs — long enough to reach the ground. Muon frame: the muon’s lifetime is the proper 2.2 μs, but the atmosphere rushing past is length-contracted to {(s.alt / g).toFixed(2)} km. Both frames agree on how many muons reach the ground.
          </Callout>
        ) : (
          <Callout kind="warn" title="Proper time and proper length">
            Proper time t₀ is measured by a clock at rest relative to the events (both events at the same place in that frame). Proper length l₀ is measured in the object’s rest frame. Effects are reciprocal: each inertial observer measures the other’s clocks running slow.
          </Callout>
        )
      }
      formulas={['t = \\dfrac{t_0}{\\sqrt{1 - v^2/c^2}}', 'l = l_0\\sqrt{1 - \\dfrac{v^2}{c^2}}', 'p_v = \\dfrac{m_0 v}{\\sqrt{1 - v^2/c^2}}', 'E = mc^2']}
      explanation={
        <>
          <p>Einstein’s postulates — the laws of physics are the same in all inertial frames and c is the same for all inertial observers — force measurements of time and length to depend on the observer’s frame.</p>
          <p>
            In the light clock, the moving photon travels a longer path at the same speed c, so each tick takes longer: <Tex>{'t = \\gamma t_0'}</Tex>. Nothing “breaks” in the moving clock — in its own frame it ticks normally.
          </p>
        </>
      }
      prediction={{
        q: 'A spaceship passes at 0.8c. By what factor do Earth observers measure its clocks running slow?',
        options: ['0.8', '1.25', '1.67', '0.6'],
        answer: 2,
        explain: 'γ = 1/√(1 − 0.64) = 1/0.6 ≈ 1.67.',
      }}
      assumptions={['Inertial (non-accelerating) frames.', 'Massive objects: v < c.', 'Muon proper mean lifetime 2.2 μs; muons travel straight down at constant speed.']}
      limitations={['Animations show the lab-frame view; the light-clock speeds are to scale relative to c on screen.', 'Muon example ignores production at a range of altitudes and energy loss in the atmosphere.', 'Kinetic energy (γ−1)m₀c² is supplementary to the syllabus.']}
    >
      <div ref={ref}>
        {s.tab === 'clock' && clockView()}
        {s.tab === 'simul' && simulView()}
        {s.tab === 'muon' && muonView()}
        {s.tab === 'calc' && (
          <div className="grid gap-3 p-4 sm:grid-cols-3">
            <div className="rounded-xl border border-line p-3">
              <div className="label">Time dilation</div>
              <Tex block>{`t = ${sig(g, 4)} \\times ${s.t0}\\,\\text{s} = ${sig(g * t0)}\\,\\text{s}`}</Tex>
            </div>
            <div className="rounded-xl border border-line p-3">
              <div className="label">Length contraction</div>
              <Tex block>{`l = \\dfrac{${s.l0}\\,\\text{m}}{${sig(g, 4)}} = ${sig(l0 / g)}\\,\\text{m}`}</Tex>
            </div>
            <div className="rounded-xl border border-line p-3">
              <div className="label">Momentum ratio</div>
              <Tex block>{`\\dfrac{p_{rel}}{p_{class}} = \\gamma = ${sig(g, 4)}`}</Tex>
            </div>
          </div>
        )}
        {s.tab === 'emc2' && (
          <div className="p-4">
            <Tex block>{`E = mc^2 = (${s.mass})(3.00\\times10^8)^2 = ${sigTex(mass * C.c * C.c)}\\ \\text{J}`}</Tex>
          </div>
        )}
      </div>
    </SimShell>
  );
}

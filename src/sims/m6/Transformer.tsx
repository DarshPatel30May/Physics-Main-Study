import { useRef, useState } from 'react';
import { SimShell, GraphCard } from '@/components/SimShell';
import { Slider, Stat, Tabs, Toggle, Select, Callout } from '@/components/ui';
import { Graph, sample } from '@/components/Graph';
import { Arrow, Label } from '@/components/svg';
import { useAnimationFrame } from '@/lib/hooks';
import { useSimSettings } from '@/lib/store';
import { transmissionLoss } from '@/lib/physics/electromagnetism';

const DEFAULTS = { tab: 'transformer' as 'transformer' | 'grid', Vp: 240, Np: 1000, Ns: 50, Rload: 4, ideal: true, laminated: true, linkage: 98, Pmw: 200, Vline: 330, Rline: 5 };
const W = 560;
const H = 300;
const LINE_V = [11, 33, 66, 132, 220, 330, 500];

export default function TransformerSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('transformer', DEFAULTS);
  const [phase, setPhase] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useAnimationFrame((dt) => setPhase((p) => (p + dt * 2 * Math.PI * 0.5) % (2 * Math.PI)), true, ref);

  // ---- transformer model ----
  const k = s.ideal ? 1 : s.linkage / 100; // flux linkage fraction
  const VsIdeal = (s.Vp * s.Ns) / s.Np;
  const Rw = s.ideal ? 0 : 0.02 * (s.Ns / 50); // secondary winding resistance (illustrative)
  const Vs = (k * VsIdeal * s.Rload) / (s.Rload + Rw);
  const Is = Vs / s.Rload;
  const Pout = Vs * Is;
  const copper = Is * Is * Rw * (s.ideal ? 0 : 2); // primary + secondary approx.
  const coreFrac = s.ideal ? 0 : s.laminated ? 0.01 : 0.08; // eddy + hysteresis as fraction of output (illustrative)
  const core = coreFrac * Pout;
  const leakage = s.ideal ? 0 : ((1 - k * k) / (k * k)) * Pout * 0.2;
  const Pin = Pout + copper + core + leakage;
  const Ip = Pin / s.Vp;
  const eff = (100 * Pout) / Pin;
  const type = s.Ns > s.Np ? 'Step-up' : s.Ns < s.Np ? 'Step-down' : 'Isolation (1:1)';

  const wave = sample((t) => ({ Vp: s.Vp * Math.SQRT2 * Math.sin(2 * Math.PI * 50 * t), Vs: Vs * Math.SQRT2 * Math.sin(2 * Math.PI * 50 * t) }), 0, 0.04, 200, 't');

  // ---- transmission ----
  const P = s.Pmw * 1e6;
  const tl = transmissionLoss(P, s.Vline * 1e3, s.Rline);
  const lossData = LINE_V.map((v) => ({ V: v, loss: (transmissionLoss(P, v * 1e3, s.Rline).fraction * 100) }));

  const turnsDraw = (n: number) => Math.max(2, Math.min(14, Math.round(n / 80)));
  const fluxGlow = Math.sin(phase);

  const transformerView = () => (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Transformer with primary and secondary coils on an iron core">
      <rect x={150} y={50} width={260} height={190} rx={8} fill="none" className="stroke-muted" strokeWidth={26} opacity={s.laminated || s.ideal ? 0.75 : 0.95} />
      {(s.laminated || s.ideal) &&
        Array.from({ length: 8 }, (_, i) => <rect key={i} x={137 + i * 3.2} y={37} width={0.8} height={216} className="fill-bg" opacity={0.6} />)}
      {/* flux arrows circulating in the core */}
      {[0, 1, 2, 3].map((i) => {
        const dir = fluxGlow >= 0 ? 1 : -1;
        const pts = [
          [280, 50],
          [410, 145],
          [280, 240],
          [150, 145],
        ][i];
        const angle = [0, 90, 180, 270][i];
        const len = 26 * Math.abs(fluxGlow);
        const rad = (angle * Math.PI) / 180;
        return <Arrow key={i} x1={pts[0]} y1={pts[1]} x2={pts[0] + dir * len * Math.cos(rad)} y2={pts[1] + dir * len * Math.sin(rad)} className="text-accent" width={2} head={6} />;
      })}
      {Array.from({ length: turnsDraw(s.Np) }, (_, i) => (
        <ellipse key={`p${i}`} cx={150} cy={90 + (i * 110) / turnsDraw(s.Np)} rx={22} ry={5} fill="none" className="stroke-m7" strokeWidth={2.5} />
      ))}
      {Array.from({ length: turnsDraw(s.Ns) }, (_, i) => (
        <ellipse key={`s${i}`} cx={410} cy={90 + (i * 110) / turnsDraw(s.Ns)} rx={22} ry={5} fill="none" className="stroke-m6" strokeWidth={2.5} />
      ))}
      <Label x={60} y={150} anchor="middle" size={12} weight={600}>
        Primary
      </Label>
      <Label x={60} y={168} anchor="middle" size={11} className="fill-muted">
        {s.Np} turns
      </Label>
      <Label x={60} y={186} anchor="middle" size={11} className="fill-muted">
        {s.Vp} V AC
      </Label>
      <Label x={500} y={150} anchor="middle" size={12} weight={600}>
        Secondary
      </Label>
      <Label x={500} y={168} anchor="middle" size={11} className="fill-muted">
        {s.Ns} turns
      </Label>
      <Label x={500} y={186} anchor="middle" size={11} className="fill-muted">
        {Vs.toFixed(1)} V AC
      </Label>
      <Label x={280} y={150} anchor="middle" size={11} className="fill-accent">
        changing flux Φ
      </Label>
      <Label x={12} y={H - 10} className="fill-muted" size={11}>
        {type} transformer. {s.ideal ? 'Ideal: all flux links both coils; no losses.' : `Real: ${s.linkage}% flux linkage, ${s.laminated ? 'laminated' : 'solid'} core.`}
      </Label>
    </svg>
  );

  const sankey = () => {
    const total = Pin;
    const wOf = (x: number) => Math.max(1.5, (x / total) * 120);
    const items = [
      { n: 'Useful output', v: Pout, c: 'fill-good' },
      { n: 'Resistive heating (I²R)', v: copper, c: 'fill-bad' },
      { n: 'Eddy currents & hysteresis', v: core, c: 'fill-m7' },
      { n: 'Incomplete flux linkage', v: leakage, c: 'fill-m6' },
    ];
    let y = 30;
    return (
      <svg viewBox="0 0 560 220" className="h-auto w-full" role="img" aria-label="Energy-flow (Sankey) diagram for the transformer">
        <rect x={20} y={30} width={60} height={120} className="fill-accent" opacity={0.8} />
        <Label x={50} y={170} anchor="middle" size={11}>
          Input {Pin.toFixed(0)} W
        </Label>
        {items.map((it) => {
          const h = wOf(it.v);
          const y0 = y;
          y += h;
          const ty = 30 + items.indexOf(it) * 45;
          return (
            <g key={it.n}>
              <path d={`M80,${y0} C220,${y0} 220,${ty} 360,${ty} L360,${ty + h} C220,${ty + h} 220,${y0 + h} 80,${y0 + h} Z`} className={it.c} opacity={0.55} />
              <Label x={368} y={ty + Math.max(10, h / 2 + 4)} size={11}>
                {it.n}: {it.v.toFixed(it.v < 10 ? 2 : 0)} W ({((100 * it.v) / total).toFixed(1)}%)
              </Label>
            </g>
          );
        })}
      </svg>
    );
  };

  const gridView = () => {
    const stages = [
      { x: 40, label: 'Power station', sub: '23 kV generator' },
      { x: 150, label: 'Step-up', sub: `→ ${s.Vline} kV` },
      { x: 300, label: 'Transmission lines', sub: `I = ${tl.I.toFixed(0)} A` },
      { x: 420, label: 'Substation', sub: 'step-down → 11 kV' },
      { x: 520, label: 'Pole transformer', sub: '→ 230 V homes' },
    ];
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Power grid from generator through step-up and step-down transformers to homes">
        <line x1={40} y1={150} x2={520} y2={150} className="stroke-m7" strokeWidth={Math.max(1.5, Math.min(14, tl.I / 150))} opacity={0.8} />
        {stages.map((st) => (
          <g key={st.label}>
            <rect x={st.x - 32} y={120} width={64} height={60} rx={8} className="fill-panel2 stroke-line" />
            <Label x={st.x} y={110} anchor="middle" size={11} weight={600}>
              {st.label}
            </Label>
            <Label x={st.x} y={200} anchor="middle" size={10} className="fill-muted">
              {st.sub}
            </Label>
          </g>
        ))}
        <Label x={12} y={H - 30} className="fill-muted" size={11}>
          Line thickness ∝ current. Higher transmission voltage → smaller current → much smaller I²R loss.
        </Label>
        <Label x={12} y={H - 12} className={tl.fraction > 0.1 ? 'fill-bad' : 'fill-good'} size={12} weight={600}>
          Loss in lines: {(tl.loss / 1e6).toFixed(3)} MW = {(tl.fraction * 100).toFixed(2)}% of {s.Pmw} MW
        </Label>
      </svg>
    );
  };

  return (
    <SimShell
      id="transformer"
      compact={compact}
      onReset={reset}
      controls={
        <>
          <Tabs size="sm" value={s.tab} onChange={(tab) => set({ tab })} tabs={[{ id: 'transformer', label: 'Transformer' }, { id: 'grid', label: 'Transmission' }]} />
          {s.tab === 'transformer' ? (
            <>
              <Slider label="Primary voltage (RMS)" tex="V_p" value={s.Vp} min={6} max={11000} step={1} unit="V" onChange={(Vp) => set({ Vp })} />
              <Slider label="Primary turns" tex="N_p" value={s.Np} min={10} max={5000} step={10} onChange={(Np) => set({ Np })} />
              <Slider label="Secondary turns" tex="N_s" value={s.Ns} min={10} max={5000} step={10} onChange={(Ns) => set({ Ns })} />
              <Slider label="Load resistance" tex="R" value={s.Rload} min={1} max={1000} step={1} unit="Ω" onChange={(Rload) => set({ Rload })} />
              <Toggle label="Ideal transformer" checked={s.ideal} onChange={(ideal) => set({ ideal })} />
              {!s.ideal && (
                <>
                  <Toggle label="Laminated core" checked={s.laminated} onChange={(laminated) => set({ laminated })} />
                  <Slider label="Flux linkage" value={s.linkage} min={85} max={100} step={1} unit="%" onChange={(linkage) => set({ linkage })} />
                </>
              )}
            </>
          ) : (
            <>
              <Slider label="Power delivered" tex="P" value={s.Pmw} min={10} max={1000} step={10} unit="MW" onChange={(Pmw) => set({ Pmw })} />
              <Select label="Transmission voltage" value={String(s.Vline)} onChange={(v) => set({ Vline: Number(v) })} options={LINE_V.map((v) => ({ value: String(v), label: `${v} kV` }))} />
              <Slider label="Total line resistance" tex="R" value={s.Rline} min={0.5} max={20} step={0.5} unit="Ω" onChange={(Rline) => set({ Rline })} />
            </>
          )}
        </>
      }
      readouts={
        s.tab === 'transformer' ? (
          <>
            <Stat label="type" value={type} />
            <Stat label="turns ratio" tex="N_s/N_p" value={s.Ns / s.Np} />
            <Stat label="secondary voltage" tex="V_s" value={Vs} unit="V" tone="text-accent" />
            <Stat label="secondary current" tex="I_s" value={Is} unit="A" />
            <Stat label="primary current" tex="I_p" value={Ip} unit="A" />
            <Stat label="output power" value={Pout} unit="W" />
            <Stat label="input power" value={Pin} unit="W" />
            <Stat label="efficiency" tex="\eta" value={`${eff.toFixed(1)}%`} tone={eff > 99.9 ? 'text-good' : 'text-warn'} />
          </>
        ) : (
          <>
            <Stat label="line current" tex="I = P/V" value={tl.I} unit="A" />
            <Stat label="power lost" tex="I^2R" value={tl.loss} unit="W" tone="text-bad" />
            <Stat label="fraction lost" value={`${(tl.fraction * 100).toFixed(3)}%`} />
            <Stat label="voltage drop along line" tex="IR" value={tl.voltageDrop} unit="V" />
          </>
        )
      }
      graphs={
        s.tab === 'transformer' ? (
          <>
            <GraphCard title="Primary and secondary voltages (50 Hz AC)" note="Same frequency; amplitude scaled by N_s/N_p.">
              <Graph data={wave} xKey="t" xLabel="t (s)" yLabel="V (V)" series={[{ key: 'Vp', label: 'V_p' }, { key: 'Vs', label: 'V_s' }]} legend height={200} />
            </GraphCard>
            <GraphCard title="Energy flow">{sankey()}</GraphCard>
          </>
        ) : (
          <GraphCard title="Percentage of power lost vs transmission voltage" note="Loss ∝ 1/V²: raising V tenfold cuts the loss a hundredfold.">
            <Graph data={lossData} xKey="V" xLabel="transmission voltage (kV)" yLabel="loss (%)" series={[{ key: 'loss', label: 'loss', dot: true }]} xScale="log" yScale="log" xDomain={[10, 600]} yDomain={['auto', 'auto']} dots={[{ x: s.Vline, y: tl.fraction * 100 }]} height={220} />
          </GraphCard>
        )
      }
      below={
        s.tab === 'transformer' ? (
          <Callout kind="model" title="Real transformers: limitations and fixes">
            Incomplete flux linkage → closed soft-iron core, coils wound on top of each other. Resistive heating → thick, low-resistance copper windings and cooling oil/fins. Eddy currents → thin laminations insulated from each other. (Loss percentages here are illustrative, chosen to show trends.)
          </Callout>
        ) : (
          <Callout kind="info">NSW’s transmission network operates at 500 kV, 330 kV and 132 kV; local distribution uses 11 kV, stepped down to 230 V (single phase) at street transformers.</Callout>
        )
      }
      formulas={['\\dfrac{V_p}{V_s} = \\dfrac{N_p}{N_s}', 'V_pI_p = V_sI_s\\ \\text{(ideal)}', 'P_{loss} = I^2R', '\\eta = \\dfrac{P_{out}}{P_{in}}']}
      explanation={
        <>
          <p>An alternating current in the primary creates a changing magnetic flux in the iron core. The same changing flux passes through the secondary and induces an emf in every turn, so the voltage ratio equals the turns ratio.</p>
          <p>Energy is conserved: stepping the voltage up steps the current down. A transformer cannot work on steady DC — there would be no change in flux.</p>
        </>
      }
      prediction={{
        q: 'An ideal step-up transformer doubles the voltage. What happens to the current?',
        options: ['Doubles', 'Halves', 'Unchanged', 'Quadruples'],
        answer: 1,
        explain: 'V_pI_p = V_sI_s — power cannot increase, so current halves.',
      }}
      assumptions={['Sinusoidal 50 Hz AC; RMS values shown.', 'Resistive load.', 'Ideal mode: perfect flux linkage, zero winding resistance and core losses.']}
      limitations={['Real-mode loss values are illustrative estimates, not a full circuit model.', 'Transmission model treats the line as a pure resistance (no reactance or corona losses).']}
    >
      <div ref={ref}>{s.tab === 'transformer' ? transformerView() : gridView()}</div>
    </SimShell>
  );
}

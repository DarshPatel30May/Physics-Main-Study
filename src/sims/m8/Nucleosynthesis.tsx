import { useRef, useState } from 'react';
import { SimShell, Playback } from '@/components/SimShell';
import { Stat, Tabs, Callout, Tex } from '@/components/ui';
import { Arrow, Label } from '@/components/svg';
import { useAnimationFrame } from '@/lib/hooks';
import { useSimSettings } from '@/lib/store';
import { qValue, ATOMIC_MASS } from '@/lib/physics/nuclear';
import { C } from '@/lib/physics/constants';

type Tab = 'pp' | 'cno' | 'origins';
const DEFAULTS = { tab: 'pp' as Tab };
const W = 600;
const H = 320;

const PP_STEPS = [
  { tex: '{}^1_1\\text{H} + {}^1_1\\text{H} \\rightarrow {}^2_1\\text{H} + {}^0_{+1}e + \\nu_e', note: 'Two protons fuse; one turns into a neutron (weak interaction), emitting a positron and a neutrino. Very slow — the bottleneck.' },
  { tex: '{}^2_1\\text{H} + {}^1_1\\text{H} \\rightarrow {}^3_2\\text{He} + \\gamma', note: 'Deuterium captures a proton, forming helium-3 and a gamma-ray photon.' },
  { tex: '{}^3_2\\text{He} + {}^3_2\\text{He} \\rightarrow {}^4_2\\text{He} + 2\\,{}^1_1\\text{H}', note: 'Two helium-3 nuclei (each from steps 1–2) fuse to helium-4, releasing two protons.' },
  { tex: '\\text{Net: } 4\\,{}^1_1\\text{H} \\rightarrow {}^4_2\\text{He} + 2\\,{}^0_{+1}e + 2\\nu_e + 2\\gamma', note: 'About 26.7 MeV released per helium-4 (≈ 0.7% of the mass), including positron annihilation energy.' },
];
const CNO_STEPS = [
  '{}^{12}\\text{C} + p \\rightarrow {}^{13}\\text{N} + \\gamma',
  '{}^{13}\\text{N} \\rightarrow {}^{13}\\text{C} + e^+ + \\nu_e',
  '{}^{13}\\text{C} + p \\rightarrow {}^{14}\\text{N} + \\gamma',
  '{}^{14}\\text{N} + p \\rightarrow {}^{15}\\text{O} + \\gamma',
  '{}^{15}\\text{O} \\rightarrow {}^{15}\\text{N} + e^+ + \\nu_e',
  '{}^{15}\\text{N} + p \\rightarrow {}^{12}\\text{C} + {}^4\\text{He}',
];
const ORIGINS = [
  { src: 'Big Bang nucleosynthesis', els: 'H, He, traces of Li', when: '3–20 minutes', colour: 'fill-accent' },
  { src: 'Main-sequence & giant stars (fusion)', els: 'He, C, N, O (triple-alpha: 3 ⁴He → ¹²C)', when: 'Stellar lifetimes', colour: 'fill-m7' },
  { src: 'Massive stars (C, Ne, O, Si burning)', els: 'O to Fe, Ni', when: 'Final stages (days–years)', colour: 'fill-bad' },
  { src: 'Supernovae & neutron-star mergers (r-process)', els: 'Many elements heavier than Fe: e.g. Au, Pt, U', when: 'Explosive events', colour: 'fill-m6' },
  { src: 'Asymptotic giant branch stars (s-process)', els: 'e.g. Sr, Ba, Pb', when: 'Late low/medium-mass stars', colour: 'fill-m8' },
  { src: 'Cosmic-ray spallation', els: 'Li, Be, B', when: 'Throughout galactic history', colour: 'fill-muted' },
];

export default function NucleosynthesisSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('nucleosynthesis', DEFAULTS);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const acc = useRef(0);
  const ref = useRef<HTMLDivElement>(null);
  const n = s.tab === 'pp' ? PP_STEPS.length : CNO_STEPS.length;
  useAnimationFrame(
    (dt) => {
      acc.current += dt;
      if (acc.current > 2.2) {
        acc.current = 0;
        setStep((x) => (x + 1) % n);
      }
    },
    playing && s.tab !== 'origins',
    ref,
  );
  const q = qValue(['H-1', 'H-1', 'H-1', 'H-1'], ['He-4']); // atomic masses: includes e⁺ annihilation energy
  const frac = q.dmU / (4 * ATOMIC_MASS['H-1']);

  const ppView = () => (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Proton–proton chain">
      {[
        { x: 60, y: 60, l: 'p', c: 'fill-bad' },
        { x: 100, y: 60, l: 'p', c: 'fill-bad' },
        { x: 60, y: 200, l: 'p', c: 'fill-bad' },
        { x: 100, y: 200, l: 'p', c: 'fill-bad' },
      ].map((p, i) => (
        <g key={i} opacity={step === 0 || step === 3 ? 1 : 0.4}>
          <circle cx={p.x} cy={p.y} r={14} className={p.c} />
          <Label x={p.x} y={p.y + 4} anchor="middle" size={11} className="fill-white" weight={700}>{p.l}</Label>
        </g>
      ))}
      <Arrow x1={125} y1={60} x2={185} y2={60} className="text-muted" />
      <Arrow x1={125} y1={200} x2={185} y2={200} className="text-muted" />
      <g opacity={step >= 0 ? 1 : 0.3}>
        <circle cx={215} cy={60} r={18} className="fill-m6" />
        <Label x={215} y={64} anchor="middle" size={10} className="fill-white" weight={700}>²H</Label>
        <circle cx={215} cy={200} r={18} className="fill-m6" />
        <Label x={215} y={204} anchor="middle" size={10} className="fill-white" weight={700}>²H</Label>
        <Label x={215} y={32} anchor="middle" size={10} className="fill-muted">+ e⁺ + ν</Label>
        <Label x={215} y={236} anchor="middle" size={10} className="fill-muted">+ e⁺ + ν</Label>
      </g>
      <Arrow x1={238} y1={60} x2={298} y2={60} className="text-muted" label="+p" labelOffset={[-30, -8]} />
      <Arrow x1={238} y1={200} x2={298} y2={200} className="text-muted" label="+p" labelOffset={[-30, -8]} />
      <g opacity={step >= 1 ? 1 : 0.3}>
        <circle cx={325} cy={60} r={20} className="fill-m7" />
        <Label x={325} y={64} anchor="middle" size={10} className="fill-white" weight={700}>³He</Label>
        <circle cx={325} cy={200} r={20} className="fill-m7" />
        <Label x={325} y={204} anchor="middle" size={10} className="fill-white" weight={700}>³He</Label>
        <Label x={325} y={32} anchor="middle" size={10} className="fill-muted">+ γ</Label>
        <Label x={325} y={240} anchor="middle" size={10} className="fill-muted">+ γ</Label>
      </g>
      <Arrow x1={348} y1={70} x2={430} y2={120} className="text-muted" />
      <Arrow x1={348} y1={190} x2={430} y2={140} className="text-muted" />
      <g opacity={step >= 2 ? 1 : 0.3}>
        <circle cx={460} cy={130} r={26} className="fill-m8" />
        <Label x={460} y={135} anchor="middle" size={12} className="fill-white" weight={700}>⁴He</Label>
        <Label x={500} y={100} size={10} className="fill-muted">+ 2p (recycled)</Label>
      </g>
      <Label x={20} y={H - 14} size={11} className="fill-muted">
        Step {step + 1} of {PP_STEPS.length}. Particle sizes are schematic.
      </Label>
    </svg>
  );

  const cnoView = () => {
    const cx = W / 2;
    const cy = H / 2;
    const R = 110;
    const nuclei = ['¹²C', '¹³N', '¹³C', '¹⁴N', '¹⁵O', '¹⁵N'];
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="CNO cycle">
        <circle cx={cx} cy={cy} r={R} fill="none" className="stroke-line" strokeDasharray="4 4" />
        {nuclei.map((nn, i) => {
          const a = -Math.PI / 2 + (i * 2 * Math.PI) / 6;
          const x = cx + R * Math.cos(a);
          const y = cy + R * Math.sin(a);
          return (
            <g key={nn}>
              <circle cx={x} cy={y} r={22} className={i === step ? 'fill-accent' : 'fill-m6'} opacity={i === step ? 1 : 0.6} />
              <Label x={x} y={y + 4} anchor="middle" size={11} className="fill-white" weight={700}>{nn}</Label>
            </g>
          );
        })}
        <Label x={cx} y={cy - 6} anchor="middle" size={12} weight={600}>C acts as a catalyst</Label>
        <Label x={cx} y={cy + 12} anchor="middle" size={11} className="fill-muted">net: 4p → ⁴He + 2e⁺ + 2ν</Label>
        <Label x={20} y={H - 14} size={11} className="fill-muted">Dominant in main-sequence stars hotter/more massive than ~1.3 M☉ (core T ≳ 17 million K).</Label>
      </svg>
    );
  };

  return (
    <SimShell
      id="nucleosynthesis"
      compact={compact}
      onReset={() => {
        reset();
        setStep(0);
      }}
      controls={
        <>
          <Tabs size="sm" value={s.tab} onChange={(tab) => { set({ tab }); setStep(0); }} tabs={[{ id: 'pp', label: 'pp chain' }, { id: 'cno', label: 'CNO cycle' }, { id: 'origins', label: 'Element origins' }]} />
          {s.tab !== 'origins' && <Playback playing={playing} setPlaying={setPlaying} onReset={() => setStep(0)} />}
          {s.tab !== 'origins' && (
            <div className="flex gap-2">
              <button className="btn flex-1" onClick={() => setStep((x) => (x - 1 + n) % n)}>Previous step</button>
              <button className="btn flex-1" onClick={() => setStep((x) => (x + 1) % n)}>Next step</button>
            </div>
          )}
        </>
      }
      readouts={
        <>
          <Stat label="mass of 4 ¹H atoms" value={4 * ATOMIC_MASS['H-1']} unit="u" n={7} />
          <Stat label="mass of ⁴He atom" value={ATOMIC_MASS['He-4']} unit="u" n={7} />
          <Stat label="mass defect" value={q.dmU} unit="u" n={4} />
          <Stat label="energy released" tex="E = \Delta m c^2" value={q.MeV} unit="MeV" tone="text-accent" />
          <Stat label="fraction of mass converted" value={`${(frac * 100).toFixed(2)}%`} />
          <Stat label="energy per kg of H" value={(frac * C.c * C.c)} unit="J kg⁻¹" />
        </>
      }
      below={
        s.tab === 'pp' ? (
          <div className="space-y-2">
            <Tex block>{PP_STEPS[step].tex}</Tex>
            <p className="text-sm">{PP_STEPS[step].note}</p>
          </div>
        ) : s.tab === 'cno' ? (
          <div className="grid gap-x-6 sm:grid-cols-2">
            {CNO_STEPS.map((t, i) => (
              <div key={i} className={`rounded-lg px-2 ${i === step ? 'bg-accent/10' : ''}`}>
                <Tex block>{t}</Tex>
              </div>
            ))}
          </div>
        ) : (
          <Callout kind="info" title="Why fusion stops at iron">
            Binding energy per nucleon peaks near iron-56 and nickel-62. Fusing nuclei lighter than iron releases energy; fusing iron absorbs energy. A massive star’s iron core therefore cannot support itself, collapses and triggers a supernova. Heavier elements are built mainly by neutron capture (s- and r-processes).
          </Callout>
        )
      }
      formulas={['E = \\Delta mc^2', '4\\,{}^1\\text{H} \\rightarrow {}^4\\text{He} + 2e^+ + 2\\nu_e + 26.7\\ \\text{MeV}']}
      explanation={
        <>
          <p>In the core of a main-sequence star, temperatures of millions of kelvin give nuclei enough kinetic energy to overcome their electrostatic repulsion and fuse. The products are more tightly bound, so their mass is less: the difference is released as energy (E = Δmc²).</p>
          <p>Sun-like stars mainly use the proton–proton chain; hotter, more massive stars mainly use the CNO cycle, in which carbon nuclei act as catalysts.</p>
        </>
      }
      prediction={{
        q: 'In the CNO cycle, what happens to the carbon-12 nucleus overall?',
        options: ['It is converted to nitrogen', 'It is used up', 'It is regenerated at the end of the cycle', 'It becomes oxygen'],
        answer: 2,
        explain: 'Carbon-12 is consumed in the first step and released in the last: it is a catalyst.',
      }}
      assumptions={['Energy from atomic masses (AME2020); using atomic masses automatically includes positron-annihilation energy.']}
      limitations={['Diagrams are schematic; reaction rates and branch ratios (pp-II, pp-III) are not shown.', 'Element-origin summary simplifies a complex, active research area.']}
    >
      <div ref={ref}>
        {s.tab === 'pp' && ppView()}
        {s.tab === 'cno' && cnoView()}
        {s.tab === 'origins' && (
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Where elements come from">
            {ORIGINS.map((o, i) => (
              <g key={o.src}>
                <rect x={20} y={20 + i * 48} width={14} height={34} rx={3} className={o.colour} />
                <Label x={44} y={34 + i * 48} size={12} weight={600}>{o.src}</Label>
                <Label x={44} y={50 + i * 48} size={11} className="fill-muted">{o.els} · {o.when}</Label>
              </g>
            ))}
          </svg>
        )}
      </div>
    </SimShell>
  );
}

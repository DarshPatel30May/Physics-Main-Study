import { useMemo, useRef, useState } from 'react';
import { SimShell, Playback, GraphCard } from '@/components/SimShell';
import { Slider, Stat, Tabs, Callout } from '@/components/ui';
import { Graph } from '@/components/Graph';
import { Arrow, Label } from '@/components/svg';
import { useAnimationFrame } from '@/lib/hooks';
import { useSimSettings } from '@/lib/store';
import { linearFit } from '@/lib/physics/stats';
import { mulberry32 } from '@/lib/physics/nuclear';

const EPOCHS = [
  { t: 1e-12, label: 'Quark–gluon plasma', T: '~10¹⁵ K', text: 'Photons energetic enough to create (and annihilate) quark–antiquark and lepton pairs: E = mc² works in both directions.' },
  { t: 1e-6, label: 'Hadron era', T: '~10¹² K', text: 'Quarks combine into protons and neutrons. Most particle–antiparticle pairs annihilate; a tiny excess of matter (~1 in 10⁹) survives.' },
  { t: 1, label: 'Lepton era', T: '~10¹⁰ K', text: 'Photons can no longer make electron–positron pairs (need ≥ 1.02 MeV); pairs annihilate, leaving the excess electrons. Neutrinos decouple.' },
  { t: 180, label: 'Big Bang nucleosynthesis', T: '~10⁹ K', text: 'From ~3 to 20 minutes, protons and neutrons fuse into deuterium, helium-4 and traces of lithium: ≈ 75% H, 25% He by mass.' },
  { t: 1.2e13, label: 'Recombination (380 000 years)', T: '~3000 K', text: 'Electrons combine with nuclei to form neutral atoms. Photons travel freely: the cosmic microwave background (now 2.7 K).' },
  { t: 6e15, label: 'First stars (~100–200 Myr)', T: '—', text: 'Gravity collapses gas clouds; fusion begins making heavier elements (C, O, … up to Fe).' },
  { t: 2.9e17, label: 'Sun forms (≈ 9.2 Gyr)', T: '—', text: 'The Solar System forms from gas enriched by earlier generations of stars and supernovae.' },
  { t: 4.35e17, label: 'Today (13.8 Gyr)', T: '2.7 K CMB', text: 'The Universe is still expanding; the CMB has cooled to 2.725 K.' },
];

const sup = (n: number) => String(n).replace('-', '⁻').replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]);

const DEFAULTS = { tab: 'timeline' as 'timeline' | 'hubble', epoch: 3, H0true: 70 };
const W = 640;
const H = 220;

export default function BigBangSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('big-bang', DEFAULTS);
  const [scale, setScale] = useState(1);
  const [playing, setPlaying] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  useAnimationFrame((dt) => setScale((x) => (x > 2.4 ? 1 : x + dt * 0.25)), playing && s.tab === 'hubble', ref);

  const tmin = -13;
  const tmax = 18;
  const X = (t: number) => 30 + ((Math.log10(t) - tmin) / (tmax - tmin)) * (W - 60);
  const ep = EPOCHS[s.epoch];

  // simulated galaxy sample (illustrative — not real survey data)
  const galaxies = useMemo(() => {
    const r = mulberry32(2024);
    return Array.from({ length: 24 }, () => {
      const d = 10 + r() * 390;
      return { d, v: s.H0true * d + (r() - 0.5) * 2 * 600 };
    });
  }, [s.H0true]);
  const fit = linearFit(galaxies.map((g) => g.d), galaxies.map((g) => g.v));
  const data = galaxies.map((g) => ({ d: g.d, v: g.v, fit: fit ? fit.m * g.d + fit.c : null })).sort((a, b) => a.d - b.d);
  const age = fit ? 3.086e19 / fit.m / 3.156e7 / 1e9 : NaN;

  const dots = useMemo(() => {
    const r = mulberry32(5);
    return Array.from({ length: 40 }, () => ({ x: (r() - 0.5) * 200, y: (r() - 0.5) * 120 }));
  }, []);

  return (
    <SimShell
      id="big-bang"
      compact={compact}
      onReset={() => {
        reset();
        setScale(1);
      }}
      controls={
        <>
          <Tabs size="sm" value={s.tab} onChange={(tab) => set({ tab })} tabs={[{ id: 'timeline', label: 'Cosmic timeline' }, { id: 'hubble', label: 'Hubble’s law' }]} />
          {s.tab === 'timeline' ? (
            <div className="space-y-1">
              {EPOCHS.map((e, i) => (
                <button key={e.label} onClick={() => set({ epoch: i })} className={`btn w-full !justify-start text-xs ${i === s.epoch ? '!border-accent text-accent' : ''}`}>
                  {e.label}
                </button>
              ))}
            </div>
          ) : (
            <>
              <Playback playing={playing} setPlaying={setPlaying} onReset={() => setScale(1)} />
              <Slider label="H₀ used to generate the sample" value={s.H0true} min={50} max={90} step={1} unit="km s⁻¹ Mpc⁻¹" onChange={(H0true) => set({ H0true })} />
            </>
          )}
        </>
      }
      readouts={
        s.tab === 'timeline' ? (
          <>
            <Stat label="time after Big Bang" value={ep.t < 3.15e7 ? `${ep.t} s` : `${(ep.t / 3.156e16).toPrecision(3)} Gyr`} />
            <Stat label="temperature" value={ep.T} />
            <Stat label="pair-production threshold (e⁻e⁺)" value="2mₑc² = 1.02 MeV" />
            <Stat label="pair-production threshold (pp̄)" value="2mₚc² = 1.88 GeV" />
          </>
        ) : (
          <>
            <Stat label="fitted H₀ (gradient)" value={fit?.m ?? NaN} unit="km s⁻¹ Mpc⁻¹" tone="text-accent" />
            <Stat label="uncertainty in gradient" value={fit?.seM ?? NaN} unit="km s⁻¹ Mpc⁻¹" />
            <Stat label="Hubble time 1/H₀" value={age} unit="billion years" />
            <Stat label="R²" value={fit?.r2 ?? NaN} />
          </>
        )
      }
      graphs={
        s.tab === 'hubble' ? (
          <GraphCard title="Recession velocity vs distance (simulated sample)" note="Each point = a galaxy (illustrative data with random peculiar velocities). Gradient of the best-fit line = H₀.">
            <Graph data={data} xKey="d" xLabel="distance (Mpc)" yLabel="v (km s⁻¹)" series={[{ key: 'v', label: 'galaxies', dot: true }, { key: 'fit', label: 'best fit', dashed: true }]} legend height={240} />
          </GraphCard>
        ) : undefined
      }
      below={
        s.tab === 'timeline' ? (
          <Callout kind="model" title={ep.label}>
            {ep.text}
          </Callout>
        ) : (
          <Callout kind="info" title="Hubble’s evidence (1929)">
            Distances from Cepheid variables (Henrietta Leavitt’s period–luminosity relationship) and velocities from spectral redshifts (Vesto Slipher, Milton Humason) showed v ∝ d. Every galaxy sees the others receding — like dots on an inflating balloon — so there is no centre: space itself is expanding.
          </Callout>
        )
      }
      formulas={['E = mc^2', 'v = H_0 d', 'z = \\dfrac{\\Delta\\lambda}{\\lambda_0} \\approx \\dfrac{v}{c}']}
      explanation={
        <>
          <p>As the early Universe expanded it cooled. Once typical photon energies fell below 2mc² for a particle, photons could no longer create that particle–antiparticle pair, and the surviving matter “froze out”: first nucleons, then light nuclei, then neutral atoms.</p>
          <p>The time axis is logarithmic — each tick is ten times longer than the last.</p>
        </>
      }
      prediction={{
        q: 'Galaxy A is twice as far away as galaxy B. How does its recession speed compare?',
        options: ['Half', 'The same', 'Twice', 'Four times'],
        answer: 2,
        explain: 'v = H₀d: recession speed is proportional to distance.',
      }}
      assumptions={['Standard hot Big Bang (ΛCDM) timeline; times and temperatures are order-of-magnitude.', 'Hubble data are SIMULATED from v = H₀d plus random scatter — not real observations.']}
      limitations={['Inflation and the earliest epochs are beyond the syllabus and omitted.', 'At large distances v = H₀d needs relativistic corrections.']}
    >
      <div ref={ref}>
        {s.tab === 'timeline' ? (
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Logarithmic timeline of the early Universe">
            <defs>
              <linearGradient id="cool" x1="0" x2="1">
                <stop offset="0" stopColor="#fde68a" />
                <stop offset="0.5" stopColor="#f97316" />
                <stop offset="0.8" stopColor="#7c3aed" />
                <stop offset="1" stopColor="#0f172a" />
              </linearGradient>
            </defs>
            <rect x={30} y={90} width={W - 60} height={24} rx={12} fill="url(#cool)" />
            {[-12, -9, -6, -3, 0, 3, 6, 9, 12, 15, 18].map((e) => (
              <g key={e}>
                <line x1={X(10 ** e)} y1={116} x2={X(10 ** e)} y2={122} className="stroke-muted" />
                <Label x={X(10 ** e)} y={136} anchor="middle" size={9} className="fill-muted">
                  {`10${sup(e)} s`}
                </Label>
              </g>
            ))}
            {EPOCHS.map((e, i) => (
              <g key={e.label} onClick={() => set({ epoch: i })} className="cursor-pointer">
                <line x1={X(e.t)} y1={i % 2 ? 60 : 150} x2={X(e.t)} y2={i % 2 ? 90 : 114} className={i === s.epoch ? 'stroke-accent' : 'stroke-muted'} strokeWidth={i === s.epoch ? 2.5 : 1} />
                <circle cx={X(e.t)} cy={102} r={i === s.epoch ? 7 : 4} className={i === s.epoch ? 'fill-accent' : 'fill-ink'} />
                <Label x={X(e.t)} y={i % 2 ? 54 : 166} anchor="middle" size={10} weight={i === s.epoch ? 700 : 500}>
                  {e.label.split(' (')[0]}
                </Label>
              </g>
            ))}
            <Label x={30} y={200} size={11} className="fill-muted">
              Hot, dense, radiation-dominated → cool, matter-dominated. Time after the Big Bang (log scale).
            </Label>
          </svg>
        ) : (
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Expanding grid of galaxies: each sees the others receding">
            {dots.map((d, i) => (
              <circle key={i} cx={W / 2 + d.x * scale} cy={H / 2 + d.y * scale * 0.8} r={4} className={i === 0 ? 'fill-accent' : 'fill-m7'} />
            ))}
            {dots.slice(1, 8).map((d, i) => (
              <Arrow key={i} x1={W / 2 + dots[0].x * scale} y1={H / 2 + dots[0].y * scale * 0.8} x2={W / 2 + d.x * scale} y2={H / 2 + d.y * scale * 0.8} className="text-accent/40" width={1} head={5} />
            ))}
            <Label x={12} y={20} size={11} className="fill-muted">
              Expansion stretches all separations by the same factor ({scale.toFixed(2)}×): distant galaxies move away faster.
            </Label>
          </svg>
        )}
      </div>
    </SimShell>
  );
}

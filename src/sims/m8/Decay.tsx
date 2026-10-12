import { useMemo, useRef, useState } from 'react';
import { SimShell, Playback, GraphCard } from '@/components/SimShell';
import { Stat, Tabs, Select, Callout } from '@/components/ui';
import { Graph } from '@/components/Graph';
import { Arrow, Label } from '@/components/svg';
import { useAnimationFrame } from '@/lib/hooks';
import { useSimSettings } from '@/lib/store';
import { ISOTOPES, mulberry32, stochasticDecayStep, decayConstant } from '@/lib/physics/nuclear';

type Tab = 'sim' | 'radiation';
const N0 = 400;
const DEFAULTS = { tab: 'sim' as Tab, iso: 'I-131', seed: 1 };
const COLS = 25;

export default function DecaySim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('decay', DEFAULTS);
  const iso = ISOTOPES.find((i) => i.key === s.iso && i.mode !== 'stable') ?? ISOTOPES[11];
  const [alive, setAlive] = useState<boolean[]>(() => new Array(N0).fill(true));
  const [t, setT] = useState(0); // in half-lives
  const [hist, setHist] = useState<{ t: number; N: number }[]>([{ t: 0, N: N0 }]);
  const [playing, setPlaying] = useState(false);
  const rand = useRef(mulberry32(s.seed));
  const ref = useRef<HTMLDivElement>(null);
  const lambda = decayConstant(1); // per half-life

  const restart = (seed = s.seed) => {
    rand.current = mulberry32(seed);
    setAlive(new Array(N0).fill(true));
    setT(0);
    setHist([{ t: 0, N: N0 }]);
  };

  useAnimationFrame(
    (dt) => {
      // use current closure values (no side effects inside state updaters)
      const step = dt * 0.5; // half-lives per second
      const next = [...alive];
      stochasticDecayStep(next, lambda, step, rand.current);
      const nt = t + step;
      setAlive(next);
      setT(nt);
      setHist([...hist.slice(-400), { t: nt, N: next.filter(Boolean).length }]);
      if (nt > 6) setPlaying(false);
    },
    playing,
    ref,
  );

  const N = alive.filter(Boolean).length;
  const theory = useMemo(() => Array.from({ length: 121 }, (_, i) => ({ t: i * 0.05, Nth: N0 * Math.pow(0.5, i * 0.05) })), []);
  const merged = useMemo(() => {
    const rows: Record<string, number | null>[] = theory.map((x) => ({ t: x.t, Nth: x.Nth, N: null }));
    hist.forEach((h) => rows.push({ t: h.t, Nth: null, N: h.N }));
    return rows.sort((a, b) => (a.t as number) - (b.t as number));
  }, [hist, theory]);

  return (
    <SimShell
      id="decay"
      compact={compact}
      onReset={() => {
        reset();
        restart(1);
      }}
      controls={
        <>
          <Tabs size="sm" value={s.tab} onChange={(tab) => set({ tab })} tabs={[{ id: 'sim', label: 'Decay simulation' }, { id: 'radiation', label: 'α, β, γ' }]} />
          {s.tab === 'sim' && (
            <>
              <Playback playing={playing} setPlaying={setPlaying} onReset={() => restart()} />
              <Select label="Isotope" value={s.iso} onChange={(isoK) => { set({ iso: isoK }); restart(); }} options={ISOTOPES.filter((i) => i.mode !== 'stable').map((i) => ({ value: i.key, label: `${i.name} (t½ = ${i.halfLifeText}, ${i.mode})` }))} />
              <button className="btn w-full" onClick={() => { const seed = s.seed + 1; set({ seed }); restart(seed); }}>
                New random sample (different seed)
              </button>
            </>
          )}
        </>
      }
      readouts={
        s.tab === 'sim' ? (
          <>
            <Stat label="elapsed" value={`${t.toFixed(2)} t½`} />
            <Stat label="elapsed (real time)" value={`${(t * iso.halfLife / 86400).toPrecision(3)} days`} />
            <Stat label="undecayed (simulated)" value={N} />
            <Stat label="predicted N₀e^(−λt)" value={N0 * Math.pow(0.5, t)} tone="text-accent" />
            <Stat label="decay constant" tex="\lambda = \ln 2/t_{1/2}" value={Math.LN2 / iso.halfLife} unit="s⁻¹" />
            <Stat label="decay mode" value={iso.mode} />
          </>
        ) : undefined
      }
      graphs={
        s.tab === 'sim' ? (
          <GraphCard title="Undecayed nuclei vs time" note="Random individual decays (points) follow the exponential law (line) more closely as N grows; small samples fluctuate.">
            <Graph data={merged} xKey="t" xLabel="time (half-lives)" yLabel="N" series={[{ key: 'Nth', label: 'N₀e^(−λt)', dashed: true }, { key: 'N', label: 'simulation' }]} xDomain={[0, 6]} yDomain={[0, N0]} legend height={220} />
          </GraphCard>
        ) : undefined
      }
      below={
        s.tab === 'sim' ? (
          <Callout kind="info" title={`${iso.name}`}>
            {iso.use} Half-life {iso.halfLifeText}. Each nucleus has the same probability of decaying per unit time; which one decays next is random and unaffected by temperature, pressure or chemistry.
          </Callout>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="p-2">Property</th>
                  <th className="p-2">Alpha (α)</th>
                  <th className="p-2">Beta-minus (β⁻)</th>
                  <th className="p-2">Gamma (γ)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Nature', 'Helium-4 nucleus ⁴₂He', 'Electron ⁰₋₁e (+ antineutrino)', 'High-energy photon'],
                  ['Charge', '+2e', '−e', '0'],
                  ['Mass', '≈ 4 u', '≈ 1/1836 u', '0'],
                  ['Change to nucleus', 'A − 4, Z − 2', 'A same, Z + 1 (n → p)', 'none (energy only)'],
                  ['Typical speed', '~5% of c', 'up to ~99% of c', 'c'],
                  ['Ionising ability', 'Very high', 'Moderate', 'Low'],
                  ['Penetration', 'Stopped by paper / skin', 'Stopped by a few mm of aluminium', 'Reduced by thick lead / concrete'],
                  ['Deflection in B field', 'Slight (heavy, +)', 'Strong, opposite to α', 'None'],
                ].map((r) => (
                  <tr key={r[0]} className="border-t border-line">
                    {r.map((c, i) => (
                      <td key={i} className={`p-2 ${i === 0 ? 'font-semibold' : ''}`}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-1 text-xs text-muted">β⁺ decay (positron emission) converts a proton into a neutron: A same, Z − 1. Radiation safety: time, distance and shielding.</p>
          </div>
        )
      }
      formulas={['N_t = N_0e^{-\\lambda t}', '\\lambda = \\dfrac{\\ln 2}{t_{1/2}}', 'A = \\lambda N']}
      explanation={
        <>
          <p>Each grey square is an undecayed nucleus; it turns dark when it decays. Every nucleus has the same chance of decaying in each time interval, so the number remaining halves every half-life on average.</p>
          <p>Because decay is random, the simulated curve scatters around the smooth exponential prediction — the law becomes exact only for very large numbers of nuclei.</p>
        </>
      }
      prediction={{
        q: 'A sample has 400 undecayed nuclei. About how many remain after 2 half-lives?',
        options: ['0', '100', '200', '300'],
        answer: 1,
        explain: '400 → 200 → 100 (on average; random fluctuations of ±10 or so are expected).',
      }}
      assumptions={['Each nucleus decays independently with constant probability (seeded random numbers for reproducibility).', 'Daughter nuclei are stable (not counted).', 'Time shown in half-lives; the real-time equivalent uses the isotope’s half-life.']}
      limitations={['400 nuclei is tiny compared with real samples (~10²⁰), so fluctuations look large.', 'Decay chains (radioactive daughters) are not modelled.']}
    >
      <div ref={ref}>
        {s.tab === 'sim' ? (
          <svg viewBox={`0 0 ${COLS * 14 + 20} ${(N0 / COLS) * 14 + 20}`} className="mx-auto h-auto w-full max-w-lg" role="img" aria-label={`${N} of ${N0} nuclei undecayed`}>
            {alive.map((a, i) => (
              <rect key={i} x={10 + (i % COLS) * 14} y={10 + Math.floor(i / COLS) * 14} width={11} height={11} rx={2} className={a ? 'fill-m7' : 'fill-line'} opacity={a ? 0.9 : 0.5} />
            ))}
          </svg>
        ) : (
          <svg viewBox="0 0 560 280" className="h-auto w-full" role="img" aria-label="Penetrating power of alpha, beta and gamma radiation">
            {[
              { y: 60, label: 'α', stop: 160, cls: 'text-bad' },
              { y: 140, label: 'β', stop: 290, cls: 'text-m5' },
              { y: 220, label: 'γ', stop: 470, cls: 'text-m7' },
            ].map((r) => (
              <g key={r.label}>
                <Arrow x1={40} y1={r.y} x2={r.stop} y2={r.y} className={r.cls} width={3} label={r.label} labelOffset={[-r.stop + 20, -8]} />
              </g>
            ))}
            <rect x={160} y={30} width={6} height={230} className="fill-muted" />
            <rect x={290} y={30} width={16} height={230} className="fill-m6" opacity={0.6} />
            <rect x={470} y={30} width={40} height={230} className="fill-ink" opacity={0.6} />
            <Label x={163} y={276} anchor="middle" size={11}>paper</Label>
            <Label x={298} y={276} anchor="middle" size={11}>aluminium (mm)</Label>
            <Label x={490} y={276} anchor="middle" size={11}>lead (cm)</Label>
            <Label x={520} y={220} size={10} className="fill-muted">reduced</Label>
          </svg>
        )}
      </div>
    </SimShell>
  );
}

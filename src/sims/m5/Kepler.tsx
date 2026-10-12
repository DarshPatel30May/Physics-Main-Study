import { useMemo, useRef, useState } from 'react';
import { SimShell, Playback, GraphCard } from '@/components/SimShell';
import { Slider, Stat, Select, Tex } from '@/components/ui';
import { Graph } from '@/components/Graph';
import { Label } from '@/components/svg';
import { useAnimationFrame } from '@/lib/hooks';
import { useSimSettings } from '@/lib/store';
import { PLANETS } from '@/lib/physics/mechanics';
import { C } from '@/lib/physics/constants';

const CENTRAL = {
  sun: { name: 'Sun', M: C.MSun },
  earth: { name: 'Earth', M: C.ME },
  jupiter: { name: 'Jupiter', M: 1.898e27 },
};
type Cen = keyof typeof CENTRAL;
const DEFAULTS = { central: 'sun' as Cen, rAU: 2.5 };
const W = 560;
const H = 380;

export default function KeplerSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('kepler', DEFAULTS);
  const [t, setT] = useState(0); // years
  const [playing, setPlaying] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  useAnimationFrame((dt) => setT((x) => x + dt * 0.4), playing, ref);

  const M = CENTRAL[s.central].M;
  const r = s.rAU * C.AU * (s.central === 'sun' ? 1 : s.central === 'earth' ? 1e-3 : 1e-2);
  const T = 2 * Math.PI * Math.sqrt(r ** 3 / (C.G * M));
  const k = (C.G * M) / (4 * Math.PI ** 2);

  const data = useMemo(() => {
    const line = [0.2, 50].map((a) => ({ a, Tline: a ** 1.5 }));
    return [...PLANETS.map((p) => ({ a: p.a, T: p.T, Tline: null as number | null })), ...line.map((l) => ({ a: l.a, T: null as number | null, Tline: l.Tline }))].sort((x, y) => x.a - y.a);
  }, []);

  const inner = PLANETS.slice(0, 5);
  const cx = W / 2;
  const cy = H / 2;
  const scale = (a: number) => 30 + Math.sqrt(a) * 70; // compressed radial scale for display

  return (
    <SimShell
      id="kepler"
      compact={compact}
      onReset={() => {
        reset();
        setT(0);
      }}
      controls={
        <>
          <Playback playing={playing} setPlaying={setPlaying} onReset={() => setT(0)} />
          <div className="rounded-xl border border-line p-3 text-sm">
            <div className="label mb-2">Kepler III calculator</div>
            <Select label="Central body" value={s.central} onChange={(central) => set({ central })} options={Object.entries(CENTRAL).map(([kk, v]) => ({ value: kk as Cen, label: v.name }))} />
            <div className="mt-2">
              <Slider label="Orbital radius" tex="r" value={s.rAU} min={0.1} max={10} step={0.1} unit={s.central === 'sun' ? 'AU' : s.central === 'earth' ? '× 1.5 × 10⁸ m' : '× 1.5 × 10⁹ m'} onChange={(rAU) => set({ rAU })} />
            </div>
          </div>
        </>
      }
      readouts={
        <>
          <Stat label="orbital radius" tex="r" value={r} unit="m" />
          <Stat label="period" tex="T" value={T} unit="s" />
          <Stat label="period" value={T / (365.25 * 86400)} unit="years" />
          <Stat label="r³/T² (constant)" value={k} unit="m³ s⁻²" tone="text-accent" />
        </>
      }
      graphs={
        <>
          <GraphCard title="Orbital period vs semi-major axis (log–log, real data)" note="On log–log axes the planets lie on a straight line of gradient 3/2: T ∝ a^{3/2}. Data: NASA Planetary Fact Sheet.">
            <Graph data={data} xKey="a" xLabel="a (AU)" yLabel="T (years)" xScale="log" yScale="log" xDomain={[0.2, 50]} yDomain={[0.05, 400]} series={[{ key: 'T', label: 'planets', dot: true }, { key: 'Tline', label: 'T = a^1.5', dashed: true }]} legend height={240} />
          </GraphCard>
          <GraphCard title="Check: r³/T² for each planet (AU³ yr⁻²)">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="py-1">Planet</th>
                  <th>a (AU)</th>
                  <th>T (yr)</th>
                  <th>a³/T²</th>
                </tr>
              </thead>
              <tbody className="num">
                {PLANETS.map((p) => (
                  <tr key={p.name} className="border-t border-line">
                    <td className="py-1 font-sans">{p.name}</td>
                    <td>{p.a}</td>
                    <td>{p.T}</td>
                    <td>{(p.a ** 3 / p.T ** 2).toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GraphCard>
        </>
      }
      formulas={['\\dfrac{r^3}{T^2} = \\dfrac{GM}{4\\pi^2}', 'v = \\dfrac{2\\pi r}{T}']}
      explanation={
        <>
          <p>For every body orbiting the same central mass, r³/T² has the same value GM/4π². It comes from equating gravity with the centripetal force: GMm/r² = m(2πr/T)²/r.</p>
          <p>The constant depends only on the central mass — so measuring a moon’s orbit lets astronomers “weigh” its planet.</p>
          <p>
            <Tex>{'\\text{Kepler I: ellipses with the Sun at a focus.}\\quad\\text{Kepler II: equal areas in equal times.}'}</Tex>
          </p>
        </>
      }
      prediction={{
        q: 'Jupiter is about 5.2 times further from the Sun than Earth. Roughly how long is its year?',
        options: ['5.2 years', '27 years', '12 years', '2.3 years'],
        answer: 2,
        explain: 'T = a^{3/2} = 5.2^{1.5} ≈ 11.9 years.',
      }}
      assumptions={['Orbiting body’s mass ≪ central mass.', 'Animation uses circular orbits at the planets’ semi-major axes.']}
      limitations={['Planet orbits are slightly elliptical; animation distances use a compressed (square-root) scale so all five fit.', 'Angular speeds in the animation are to scale relative to each other.']}
    >
      <div ref={ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Inner planets orbiting the Sun with relative periods to scale">
          <circle cx={cx} cy={cy} r={12} className="fill-m7" />
          {inner.map((p) => {
            const R = scale(p.a);
            const ang = (2 * Math.PI * t) / p.T;
            return (
              <g key={p.name}>
                <circle cx={cx} cy={cy} r={R} fill="none" className="stroke-line" />
                <circle cx={cx + R * Math.cos(ang)} cy={cy - R * Math.sin(ang)} r={p.name === 'Jupiter' ? 8 : 5} fill={p.colour} />
                <Label x={cx + R * Math.cos(ang) + 8} y={cy - R * Math.sin(ang) - 6} size={10}>
                  {p.name}
                </Label>
              </g>
            );
          })}
          <Label x={12} y={H - 10} className="fill-muted" size={11}>
            t = {t.toFixed(2)} Earth years · inner planets complete orbits far more quickly
          </Label>
        </svg>
      </div>
    </SimShell>
  );
}

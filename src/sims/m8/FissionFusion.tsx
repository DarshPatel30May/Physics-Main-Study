import { useRef, useState } from 'react';
import { SimShell, Playback, GraphCard } from '@/components/SimShell';
import { Slider, Stat, Tabs, Callout, Tex } from '@/components/ui';
import { Graph } from '@/components/Graph';
import { useAnimationFrame } from '@/lib/hooks';
import { useSimSettings } from '@/lib/store';
import { mulberry32, qValue } from '@/lib/physics/nuclear';
import { C } from '@/lib/physics/constants';

type Tab = 'chain' | 'compare';
const DEFAULTS = { tab: 'chain' as Tab, absorb: 0.6, nPer: 2.5 };
const W = 560;
const H = 320;
const GRID = 18;

interface Neutron {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export default function FissionFusionSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('fission-fusion', DEFAULTS);
  const [playing, setPlaying] = useState(false);
  const [, setTick] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const rand = useRef(mulberry32(3));
  const nuclei = useRef<boolean[]>(new Array(GRID * 10).fill(true));
  const neutrons = useRef<Neutron[]>([]);
  const history = useRef<{ t: number; n: number; fissions: number }[]>([]);
  const time = useRef(0);
  const fissions = useRef(0);
  // effective multiplication factor: neutrons per fission × fraction NOT absorbed by control rods
  const k = s.nPer * (1 - s.absorb);

  const start = () => {
    rand.current = mulberry32(3);
    nuclei.current = new Array(GRID * 10).fill(true);
    neutrons.current = [{ x: 10, y: H / 2, vx: 160, vy: 0 }];
    history.current = [];
    time.current = 0;
    fissions.current = 0;
    setTick((t) => t + 1);
  };

  const pos = (i: number) => ({ x: 60 + (i % GRID) * 27, y: 30 + Math.floor(i / GRID) * 27 });

  useAnimationFrame(
    (dt) => {
      const R = rand.current;
      const born: Neutron[] = [];
      neutrons.current = neutrons.current.filter((nn) => {
        nn.x += nn.vx * dt;
        nn.y += nn.vy * dt;
        if (nn.x < 0 || nn.x > W || nn.y < 0 || nn.y > H) return false;
        // absorption by control rods (probability per unit path, tuned so the fraction absorbed ≈ s.absorb per generation)
        if (R() < s.absorb * dt * 2.2) return false;
        for (let i = 0; i < nuclei.current.length; i++) {
          if (!nuclei.current[i]) continue;
          const p = pos(i);
          if (Math.abs(p.x - nn.x) < 9 && Math.abs(p.y - nn.y) < 9) {
            nuclei.current[i] = false;
            fissions.current++;
            const count = Math.floor(s.nPer) + (R() < s.nPer % 1 ? 1 : 0);
            for (let j = 0; j < count; j++) {
              const a = R() * 2 * Math.PI;
              born.push({ x: p.x, y: p.y, vx: 160 * Math.cos(a), vy: 160 * Math.sin(a) });
            }
            return false;
          }
        }
        return true;
      });
      neutrons.current.push(...born);
      if (neutrons.current.length > 600) neutrons.current.length = 600;
      time.current += dt;
      history.current.push({ t: time.current, n: neutrons.current.length, fissions: fissions.current });
      if (history.current.length > 400) history.current.shift();
      if (neutrons.current.length === 0 && time.current > 0.5) setPlaying(false);
      setTick((t) => t + 1);
    },
    playing,
    ref,
  );

  const dt = qValue(['H-2', 'H-3'], ['He-4', 'n']);
  const fis = qValue(['n', 'U-235'], ['Ba-141', 'Kr-92', 'n', 'n', 'n']);
  const perKgFusion = (dt.MeV * 1e6 * C.eV) / ((2.014102 + 3.016049) * C.u);
  const perKgFission = (fis.MeV * 1e6 * C.eV) / (235.043928 * C.u);

  return (
    <SimShell
      id="fission-fusion"
      compact={compact}
      onReset={() => {
        reset();
        start();
        setPlaying(false);
      }}
      controls={
        <>
          <Tabs size="sm" value={s.tab} onChange={(tab) => set({ tab })} tabs={[{ id: 'chain', label: 'Chain reaction' }, { id: 'compare', label: 'Fission vs fusion' }]} />
          {s.tab === 'chain' && (
            <>
              <Playback
                playing={playing}
                setPlaying={(v) => {
                  if (v && neutrons.current.length === 0) start();
                  setPlaying(v);
                }}
                onReset={() => {
                  start();
                  setPlaying(false);
                }}
              />
              <Slider label="Neutrons released per fission" value={s.nPer} min={1} max={3} step={0.1} onChange={(nPer) => set({ nPer })} />
              <Slider label="Fraction of neutrons absorbed by control rods" value={s.absorb} min={0} max={0.9} step={0.01} onChange={(absorb) => set({ absorb })} />
            </>
          )}
        </>
      }
      readouts={
        s.tab === 'chain' ? (
          <>
            <Stat label="multiplication factor k (approx.)" value={k} tone={Math.abs(k - 1) < 0.08 ? 'text-good' : k > 1 ? 'text-bad' : 'text-muted'} />
            <Stat label="regime" value={k > 1.08 ? 'supercritical (uncontrolled)' : k < 0.92 ? 'subcritical (dies out)' : 'critical (controlled)'} />
            <Stat label="free neutrons" value={neutrons.current.length} />
            <Stat label="fissions so far" value={fissions.current} />
            <Stat label="energy released" value={fissions.current * fis.MeV} unit="MeV" />
          </>
        ) : (
          <>
            <Stat label="D–T fusion Q-value" value={dt.MeV} unit="MeV" tone="text-accent" />
            <Stat label="U-235 fission Q-value" value={fis.MeV} unit="MeV" tone="text-accent" />
            <Stat label="fusion energy per kg of fuel" value={perKgFusion} unit="J kg⁻¹" />
            <Stat label="fission energy per kg of U-235" value={perKgFission} unit="J kg⁻¹" />
          </>
        )
      }
      graphs={
        s.tab === 'chain' ? (
          <GraphCard title="Free neutrons vs time" note="k > 1 grows exponentially (uncontrolled); k ≈ 1 stays steady (controlled reactor); k < 1 dies out.">
            <Graph data={history.current} xKey="t" xLabel="time (s, simulation)" yLabel="neutrons" series={[{ key: 'n', label: 'free neutrons' }]} height={200} />
          </GraphCard>
        ) : undefined
      }
      below={
        s.tab === 'chain' ? (
          <div className="grid gap-3 md:grid-cols-2">
            <Callout kind="model" title="Controlled vs uncontrolled chain reactions">
              In a reactor, a moderator (e.g. water or graphite) slows neutrons so U-235 can capture them, and control rods (e.g. boron or cadmium) absorb neutrons to keep, on average, exactly one neutron from each fission causing another (k = 1). If k {'>'} 1 the reaction grows exponentially.
            </Callout>
            <Callout kind="info" title="Where does the energy come from?">
              The fission fragments have greater binding energy per nucleon than U-235, so the products have less total mass. The mass defect (≈ 0.19 u) appears as ≈ 170–200 MeV, mostly the kinetic energy of the fragments.
            </Callout>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Tex block>{'{}^1_0n + {}^{235}_{92}\\text{U} \\rightarrow {}^{141}_{56}\\text{Ba} + {}^{92}_{36}\\text{Kr} + 3\\,{}^1_0n'}</Tex>
            <Tex block>{'{}^2_1\\text{H} + {}^3_1\\text{H} \\rightarrow {}^4_2\\text{He} + {}^1_0n'}</Tex>
            <table className="mt-2 w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="p-2">Feature</th>
                  <th className="p-2">Fission</th>
                  <th className="p-2">Fusion</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Process', 'Heavy nucleus splits into two medium nuclei', 'Light nuclei join to form a heavier nucleus'],
                  ['Why energy is released', 'Products have higher BE per nucleon (move right → left towards Fe)', 'Product has much higher BE per nucleon (move left → right towards Fe)'],
                  ['Energy per reaction', '≈ 200 MeV', '≈ 17.6 MeV (D–T)'],
                  ['Energy per kg of fuel', '≈ 8 × 10¹³ J', '≈ 3.4 × 10¹⁴ J (D–T)'],
                  ['Conditions', 'Slow neutrons, critical mass/geometry', '~10⁸ K and confinement (stars: gravity; reactors: magnetic fields)'],
                  ['Products', 'Radioactive fission products', 'Helium; neutron activation of structures'],
                  ['Current use', 'Nuclear power stations (not in Australia); OPAL research reactor at ANSTO', 'The Sun; experimental reactors such as ITER'],
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
          </div>
        )
      }
      formulas={['E = \\Delta mc^2', 'k = \\dfrac{\\text{neutrons causing fission (generation } n+1)}{\\text{neutrons (generation } n)}']}
      explanation={
        <>
          <p>A slow neutron is absorbed by a U-235 nucleus, which splits and releases 2–3 neutrons and energy. Each new neutron can cause another fission — a chain reaction.</p>
          <p>Adjust the control-rod absorption: the reaction can die out, stay steady, or grow rapidly.</p>
        </>
      }
      prediction={{
        q: 'Each fission releases 2.5 neutrons on average. What fraction must be absorbed for a steady (critical) reaction?',
        options: ['0.25', '0.4', '0.6', '0.9'],
        answer: 2,
        explain: 'Need 2.5 × (1 − f) = 1, so f = 0.6.',
      }}
      assumptions={['Conceptual model: neutrons travel straight; each collision with a nucleus causes fission.', 'Q-values computed from AME2020 atomic masses.']}
      limitations={['Not a reactor-physics model — no moderation, geometry, delayed neutrons or leakage physics. Educational illustration only.', 'Nucleus count is tiny; the grid empties quickly.']}
    >
      <div ref={ref}>
        {s.tab === 'chain' ? (
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Chain reaction among uranium nuclei">
            {nuclei.current.map((a, i) => {
              const p = pos(i);
              return <circle key={i} cx={p.x} cy={p.y} r={8} className={a ? 'fill-m8' : 'fill-line'} opacity={a ? 0.85 : 0.35} />;
            })}
            {neutrons.current.map((nn, i) => (
              <circle key={i} cx={nn.x} cy={nn.y} r={2.5} className="fill-ink" />
            ))}
            <text x={12} y={H - 8} fontSize={11} className="fill-muted">Green: U-235 nuclei · grey: fissioned · dots: neutrons. Press Play to fire the first neutron.</text>
          </svg>
        ) : (
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            <div className="rounded-xl border border-line p-3 text-center">
              <div className="label">Fission</div>
              <div className="mt-2 text-3xl">⚛ → ⚛ + ⚛ + 3n</div>
            </div>
            <div className="rounded-xl border border-line p-3 text-center">
              <div className="label">Fusion</div>
              <div className="mt-2 text-3xl">²H + ³H → ⁴He + n</div>
            </div>
          </div>
        )}
      </div>
    </SimShell>
  );
}

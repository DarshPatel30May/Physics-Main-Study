import { useMemo, useRef, useState } from 'react';
import { SimShell, Playback, GraphCard } from '@/components/SimShell';
import { Slider, Stat, Select, Callout } from '@/components/ui';
import { Graph, sample } from '@/components/Graph';
import { Label } from '@/components/svg';
import { useAnimationFrame } from '@/lib/hooks';
import { useSimSettings } from '@/lib/store';
import { C } from '@/lib/physics/constants';
import { escapeSpeed } from '@/lib/physics/mechanics';

const BODIES = {
  earth: { name: 'Earth', M: C.ME, R: C.RE },
  moon: { name: 'Moon', M: C.MMoon, R: C.RMoon },
  mars: { name: 'Mars', M: 6.42e23, R: 3.39e6 },
  jupiter: { name: 'Jupiter', M: 1.898e27, R: 6.99e7 },
  sun: { name: 'Sun', M: C.MSun, R: 6.96e8 },
};
type BodyKey = keyof typeof BODIES;
const DEFAULTS = { body: 'earth' as BodyKey, frac: 0.8, m: 1000 };
const W = 560;
const H = 300;

export default function EscapeSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('escape', DEFAULTS);
  const b = BODIES[s.body];
  const GM = C.G * b.M;
  const vesc = escapeSpeed(b.M, b.R);
  const v0 = s.frac * vesc;
  const E = 0.5 * s.m * v0 * v0 - (GM * s.m) / b.R;
  const escapes = E >= 0;
  const rMax = escapes ? Infinity : 1 / (1 / b.R - (v0 * v0) / (2 * GM));

  const [state, setState] = useState({ r: b.R, v: v0, t: 0 });
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const restart = () => setState({ r: b.R, v: v0, t: 0 });
  const key = `${s.body}-${s.frac}`;
  const lastKey = useRef(key);
  if (lastKey.current !== key) {
    lastKey.current = key;
    setState({ r: b.R, v: v0, t: 0 });
  }

  const tScale = Math.sqrt(b.R ** 3 / GM); // natural time unit
  useAnimationFrame(
    (dt) => {
      setState((st) => {
        let { r, v, t } = st;
        const total = dt * tScale * 0.8;
        const n = 200;
        const h = total / n;
        for (let i = 0; i < n; i++) {
          const a1 = -GM / (r * r);
          v += a1 * h * 0.5;
          r += v * h;
          const a2 = -GM / (r * r);
          v += a2 * h * 0.5;
        }
        t += total;
        if (r <= b.R) {
          setPlaying(false);
          return { r: b.R, v: 0, t };
        }
        if (r > 12 * b.R) {
          setPlaying(false);
        }
        return { r, v, t };
      });
    },
    playing,
    ref,
  );

  const data = useMemo(
    () =>
      sample(
        (x) => ({ U: (-GM * s.m) / (x * b.R) / 1e9, E: E / 1e9 }),
        1,
        10,
        200,
        'r',
      ),
    [GM, s.m, b.R, E],
  );

  const px = (r: number) => 60 + ((r / b.R - 1) / 11) * (W - 100);
  return (
    <SimShell
      id="escape"
      compact={compact}
      onReset={() => {
        reset();
        restart();
        setPlaying(false);
      }}
      controls={
        <>
          <Playback playing={playing} setPlaying={(v) => { if (v && (state.r > 12 * b.R || state.v === 0)) restart(); setPlaying(v); }} onReset={() => { restart(); setPlaying(false); }} />
          <Select label="Body" value={s.body} onChange={(body) => set({ body })} options={Object.entries(BODIES).map(([k, v]) => ({ value: k as BodyKey, label: v.name }))} />
          <Slider label="Launch speed ÷ escape speed" value={s.frac} min={0.1} max={1.3} step={0.01} onChange={(frac) => set({ frac })} />
          <Slider label="Probe mass" tex="m" value={s.m} min={100} max={10000} step={100} unit="kg" onChange={(m) => set({ m })} />
        </>
      }
      readouts={
        <>
          <Stat label="escape speed" tex="v_{esc}" value={vesc} unit="m s⁻¹" tone="text-accent" />
          <Stat label="launch speed" tex="v_0" value={v0} unit="m s⁻¹" />
          <Stat label="U at surface" tex="U" value={(-GM * s.m) / b.R} unit="J" />
          <Stat label="total energy" tex="E = K + U" value={E} unit="J" tone={escapes ? 'text-good' : 'text-bad'} />
          <Stat label="max distance" value={escapes ? '∞ (escapes)' : rMax / b.R} unit={escapes ? '' : 'body radii'} />
          <Stat label="energy to escape" tex="GMm/r" value={(GM * s.m) / b.R} unit="J" />
        </>
      }
      graphs={
        <GraphCard title="Potential well: U(r) and total energy E" note="If E < 0 the probe is bound: it stops where U = E and falls back. If E ≥ 0 it escapes.">
          <Graph data={data} xKey="r" xLabel="r (body radii)" yLabel="energy (GJ)" series={[{ key: 'U', label: 'U = −GMm/r' }, { key: 'E', label: 'E = K + U', dashed: true }]} refY={[{ y: 0 }]} refX={escapes ? [] : [{ x: rMax / b.R, label: 'turning point' }]} legend height={230} />
        </GraphCard>
      }
      below={<Callout kind="info">Escape speed is independent of the probe’s mass and (ignoring air resistance) of launch direction. Doubling the mass doubles both K and U, so the threshold is unchanged.</Callout>}
      formulas={['v_{esc} = \\sqrt{\\dfrac{2GM}{r}}', 'U = -\\dfrac{GMm}{r}', '\\tfrac12 mv_{esc}^2 - \\dfrac{GMm}{r} = 0']}
      explanation={
        <>
          <p>A probe launched upward slows as it climbs because gravity does negative work. It escapes only if its kinetic energy can pay the whole “depth” of the potential well, GMm/r — i.e. total energy E ≥ 0.</p>
          <p>Below escape speed it reaches a maximum distance where all K has become U, then falls back.</p>
        </>
      }
      prediction={{
        q: 'A probe is launched at exactly 70% of escape speed. Does it reach twice the planet’s radius from the centre?',
        options: ['No, it stops below that', 'Yes, it rises to about 1.96 R', 'It escapes', 'It orbits'],
        answer: 1,
        explain: 'r_max = R/(1 − 0.7²) = R/0.51 ≈ 1.96R — just short of 2R.',
      }}
      assumptions={['Vertical (radial) launch, unpowered after launch.', 'No air resistance; body does not rotate.', 'Point masses; other bodies ignored.']}
      limitations={['Real launches are powered and use orbital mechanics rather than a single “cannon shot”.', 'Atmospheric drag would make the required speed higher.', 'Animation time is scaled to the body’s natural time unit.']}
    >
      <div ref={ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Radial launch from a planet">
          <circle cx={30} cy={H / 2} r={30} className="fill-m5" opacity={0.85} />
          <Label x={30} y={H / 2 + 50} anchor="middle" size={11}>
            {b.name}
          </Label>
          {[2, 4, 6, 8, 10, 12].map((n) => (
            <g key={n}>
              <line x1={px(n * b.R)} y1={H / 2 - 30} x2={px(n * b.R)} y2={H / 2 + 30} className="stroke-line" />
              <Label x={px(n * b.R)} y={H / 2 + 46} anchor="middle" size={10} className="fill-muted">
                {n}R
              </Label>
            </g>
          ))}
          {!escapes && <line x1={px(rMax)} y1={H / 2 - 40} x2={px(rMax)} y2={H / 2 + 40} className="stroke-bad" strokeDasharray="4 3" />}
          <circle cx={Math.min(W - 10, px(state.r))} cy={H / 2} r={7} className="fill-accent" />
          <Label x={12} y={22} className={escapes ? 'fill-good' : 'fill-bad'} size={12} weight={600}>
            {escapes ? 'E ≥ 0: the probe escapes to infinity' : `E < 0: bound — rises to ${(rMax / b.R).toFixed(2)} R then falls back`}
          </Label>
          <Label x={12} y={H - 12} className="fill-muted" size={11}>
            r = {(state.r / b.R).toFixed(2)} R · v = {(state.v / 1e3).toFixed(2)} km s⁻¹
          </Label>
        </svg>
      </div>
    </SimShell>
  );
}

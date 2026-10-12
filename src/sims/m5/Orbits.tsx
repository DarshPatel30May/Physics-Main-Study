import { useMemo, useRef, useState } from 'react';
import { SimShell, Playback, GraphCard } from '@/components/SimShell';
import { Slider, Stat, Toggle, Callout } from '@/components/ui';
import { Graph } from '@/components/Graph';
import { Arrow, Label } from '@/components/svg';
import { useAnimationFrame } from '@/lib/hooks';
import { useSimSettings } from '@/lib/store';
import { C } from '@/lib/physics/constants';
import { orbitStep, orbitElements, type OrbitState } from '@/lib/physics/mechanics';

const DEFAULTS = { altKm: 2000, factor: 1, sectors: true, vectors: true, mass: 1000 };
const W = 560;
const H = 420;
const GM = C.G * C.ME;

interface Sample {
  t: number;
  r: number;
  v: number;
  K: number;
  U: number;
}

export default function OrbitsSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('orbits', DEFAULTS);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [, setTick] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const r0 = C.RE + s.altKm * 1e3;
  const vCirc = Math.sqrt(GM / r0);
  const init = (): OrbitState => ({ x: r0, y: 0, vx: 0, vy: vCirc * s.factor, t: 0 });
  const st = useRef<OrbitState>(init());
  const trail = useRef<{ x: number; y: number; t: number }[]>([]);
  const samples = useRef<Sample[]>([]);
  const key = `${s.altKm}-${s.factor}`;
  const lastKey = useRef(key);
  if (lastKey.current !== key) {
    lastKey.current = key;
    st.current = init();
    trail.current = [];
    samples.current = [];
  }

  const el = useMemo(() => orbitElements(init(), GM), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const Tref = el.bound ? el.T : 2 * Math.PI * Math.sqrt(r0 ** 3 / GM);
  const warp = Tref / 10; // one orbit ≈ 10 s at 1×

  useAnimationFrame(
    (dt) => {
      let remaining = dt * speed * warp;
      const h = Tref / 3000;
      let n = 0;
      while (remaining > 0 && n < 20000) {
        const step = Math.min(h, remaining);
        st.current = orbitStep(st.current, GM, step);
        remaining -= step;
        n++;
      }
      const p = st.current;
      const r = Math.hypot(p.x, p.y);
      if (r < C.RE) {
        // crashed — restart
        st.current = init();
        trail.current = [];
        samples.current = [];
      }
      trail.current.push({ x: p.x, y: p.y, t: p.t });
      if (trail.current.length > 1500) trail.current.shift();
      const v = Math.hypot(p.vx, p.vy);
      samples.current.push({ t: p.t, r: r / 1e3, v: v / 1e3, K: (0.5 * s.mass * v * v) / 1e9, U: (-GM * s.mass) / r / 1e9 });
      if (samples.current.length > 600) samples.current.shift();
      if (!el.bound && r > 30 * r0) {
        st.current = init();
        trail.current = [];
        samples.current = [];
      }
      setTick((t) => t + 1);
    },
    playing,
    ref,
  );

  const p = st.current;
  const r = Math.hypot(p.x, p.y);
  const v = Math.hypot(p.vx, p.vy);
  const a = GM / (r * r);
  const extent = el.bound ? Math.max(el.rApo, r0) : r0 * 4;
  const k = 175 / extent;
  const cx = W / 2 + (el.bound ? (el.a * el.e * k) / 2 : 0);
  const cy = H / 2;
  const X = (x: number) => cx + x * k;
  const Y = (y: number) => cy - y * k;

  // Kepler's 2nd law: wedges for equal time intervals
  const wedges = (() => {
    if (!s.sectors || !el.bound || trail.current.length < 3) return [] as string[];
    const dt = el.T / 12;
    const pts = trail.current;
    const tEnd = pts[pts.length - 1].t;
    const out: string[] = [];
    for (let i = 0; i < 12; i += 2) {
      const t1 = tEnd - (i + 1) * dt;
      const t0 = tEnd - (i + 2) * dt;
      const seg = pts.filter((q) => q.t >= t0 && q.t <= t1);
      if (seg.length < 2) continue;
      out.push(`M${X(0)},${Y(0)} ` + seg.map((q) => `L${X(q.x).toFixed(1)},${Y(q.y).toFixed(1)}`).join(' ') + ' Z');
    }
    return out;
  })(); // recomputed each frame

  const path = trail.current.map((q, i) => `${i ? 'L' : 'M'}${X(q.x).toFixed(1)},${Y(q.y).toFixed(1)}`).join(' ');
  const vk = 60 / (vCirc * 1.5);
  const K = 0.5 * s.mass * v * v;
  const U = (-GM * s.mass) / r;
  const E = K + U;
  const Emax = Math.abs((-GM * s.mass) / C.RE);
  const bar = (val: number) => (Math.abs(val) / Emax) * 120;

  const graphData = samples.current.map((q) => ({ t: q.t / 60, r: q.r, v: q.v, K: q.K, U: q.U, E: q.K + q.U }));

  return (
    <SimShell
      id="orbits"
      compact={compact}
      onReset={() => {
        reset();
        st.current = init();
        trail.current = [];
        samples.current = [];
      }}
      controls={
        <>
          <Playback
            playing={playing}
            setPlaying={setPlaying}
            speed={speed}
            setSpeed={setSpeed}
            onReset={() => {
              st.current = init();
              trail.current = [];
              samples.current = [];
            }}
          />
          <Slider label="Starting altitude" tex="h" value={s.altKm} min={200} max={40000} step={100} unit="km" onChange={(altKm) => set({ altKm })} />
          <Slider label="Launch speed ÷ circular speed" value={s.factor} min={0.7} max={1.5} step={0.01} onChange={(factor) => set({ factor })} hint="1 = circular · < 1 or > 1 = ellipse · ≥ √2 ≈ 1.414 = escape" />
          <Slider label="Satellite mass" tex="m" value={s.mass} min={100} max={5000} step={100} unit="kg" onChange={(mass) => set({ mass })} />
          <Toggle label="Kepler’s 2nd law sectors" checked={s.sectors} onChange={(sectors) => set({ sectors })} />
          <Toggle label="Velocity & acceleration vectors" checked={s.vectors} onChange={(vectors) => set({ vectors })} />
          <div className="rounded-xl border border-line p-3">
            <div className="label mb-2">Energy (current)</div>
            {[
              { n: 'K', val: K, c: 'bg-good' },
              { n: 'U', val: U, c: 'bg-m6' },
              { n: 'E', val: E, c: E < 0 ? 'bg-accent' : 'bg-bad' },
            ].map((e) => (
              <div key={e.n} className="mb-1 flex items-center gap-2 text-xs">
                <span className="w-4 font-semibold">{e.n}</span>
                <div className="relative h-3 flex-1 rounded bg-panel2">
                  <div className="absolute top-0 h-3 w-px bg-muted" style={{ left: '50%' }} />
                  <div className={`absolute top-0 h-3 rounded ${e.c}`} style={e.val >= 0 ? { left: '50%', width: `${Math.min(50, bar(e.val) / 2.4)}%` } : { right: '50%', width: `${Math.min(50, bar(e.val) / 2.4)}%` }} />
                </div>
                <span className="num w-20 text-right">{(e.val / 1e9).toFixed(2)} GJ</span>
              </div>
            ))}
          </div>
        </>
      }
      readouts={
        <>
          <Stat label="orbital radius" tex="r" value={r / 1e3} unit="km" />
          <Stat label="speed" tex="v" value={v} unit="m s⁻¹" />
          <Stat label="acceleration" tex="a = GM/r^2" value={a} unit="m s⁻²" />
          <Stat label="circular speed at start" value={vCirc} unit="m s⁻¹" />
          <Stat label="escape speed at start" value={Math.SQRT2 * vCirc} unit="m s⁻¹" />
          <Stat label="period" tex="T" value={el.bound ? el.T / 60 : '— (unbound)'} unit={el.bound ? 'min' : ''} />
          <Stat label="eccentricity" tex="e" value={el.e} />
          <Stat label="total energy" tex="E" value={E} unit="J" tone={E < 0 ? 'text-accent' : 'text-bad'} />
        </>
      }
      graphs={
        <>
          <GraphCard title="Distance from Earth’s centre vs time">
            <Graph data={graphData} xKey="t" xLabel="t (min)" yLabel="r (km)" series={[{ key: 'r', label: 'r' }]} height={190} />
          </GraphCard>
          <GraphCard title="Speed vs time" note="Fastest at perigee, slowest at apogee (Kepler’s 2nd law).">
            <Graph data={graphData} xKey="t" xLabel="t (min)" yLabel="v (km s⁻¹)" series={[{ key: 'v', label: 'v' }]} height={190} />
          </GraphCard>
          <GraphCard title="Energy vs time" note="K and U trade off; total E stays constant (no drag).">
            <Graph data={graphData} xKey="t" xLabel="t (min)" yLabel="energy (GJ)" series={[{ key: 'K', label: 'K' }, { key: 'U', label: 'U' }, { key: 'E', label: 'E' }]} legend height={190} />
          </GraphCard>
        </>
      }
      below={
        <Callout kind="model" title="Circular vs elliptical orbits">
          A circular orbit is the special case e = 0 (launch speed exactly √(GM/r)). Real orbits are generally ellipses; r³/T² = GM/4π² still holds with r replaced by the semi-major axis a = {(el.bound ? el.a / 1e3 : NaN).toFixed(0)} km.
        </Callout>
      }
      formulas={['F = \\dfrac{GMm}{r^2} = \\dfrac{mv^2}{r}\\ (\\text{circular})', 'v = \\sqrt{\\dfrac{GM}{r}}', '\\dfrac{r^3}{T^2} = \\dfrac{GM}{4\\pi^2}', 'U = -\\dfrac{GMm}{r},\\ E = -\\dfrac{GMm}{2r}']}
      explanation={
        <>
          <p>Gravity always points to Earth’s centre. In a circular orbit it is perpendicular to the velocity and only changes the direction — the satellite accelerates continuously while its speed stays constant.</p>
          <p>In an elliptical orbit gravity has a component along the velocity: the satellite speeds up falling towards perigee (U → K) and slows climbing to apogee (K → U). Equal shaded areas are swept in equal times.</p>
        </>
      }
      prediction={{
        q: 'A satellite is given slightly MORE than circular speed. Where is it fastest on the resulting orbit?',
        options: ['At the starting point (perigee)', 'At the far point (apogee)', 'Everywhere the same', 'It immediately escapes'],
        answer: 0,
        explain: 'Extra speed raises the far side of the orbit; the start becomes perigee — the closest and fastest point.',
      }}
      assumptions={['Two-body problem: Earth fixed, satellite mass ≪ Earth mass.', 'Point masses; no atmospheric drag.', 'Numerical model: velocity-Verlet integration (energy conserved to < 10⁻⁶).']}
      limitations={['Ignores Moon/Sun perturbations and Earth’s oblateness.', 'Time is accelerated: one orbit ≈ 10 s at 1×.', 'Orbits that intersect Earth restart automatically.']}
    >
      <div ref={ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Orbit of a satellite around Earth">
          {wedges.map((d, i) => (
            <path key={i} d={d} className="fill-m7" opacity={0.18} />
          ))}
          <path d={path} fill="none" className="stroke-accent" strokeWidth={1.8} />
          <circle cx={X(0)} cy={Y(0)} r={Math.max(4, C.RE * k)} className="fill-m5" opacity={0.85} />
          <Label x={X(0)} y={Y(0) + 4} anchor="middle" size={11} weight={700} className="fill-white">
            Earth
          </Label>
          <circle cx={X(p.x)} cy={Y(p.y)} r={6} className="fill-ink" />
          {s.vectors && (
            <>
              <Arrow x1={X(p.x)} y1={Y(p.y)} x2={X(p.x) + p.vx * vk} y2={Y(p.y) - p.vy * vk} className="text-accent" label="v" />
              <Arrow x1={X(p.x)} y1={Y(p.y)} x2={X(p.x) - (p.x / r) * 40} y2={Y(p.y) + (p.y / r) * 40} className="text-bad" label="a, F_g" labelOffset={[4, 14]} />
            </>
          )}
          <Label x={12} y={20} className="fill-muted" size={11}>
            {el.bound ? (Math.abs(el.e) < 0.005 ? 'Circular orbit' : `Elliptical orbit, e = ${el.e.toFixed(3)}`) : 'Unbound — escape trajectory (E ≥ 0)'}
          </Label>
          <Label x={12} y={H - 10} className="fill-muted" size={11}>
            Earth radius drawn to scale. Shaded wedges: equal time intervals (T/12).
          </Label>
        </svg>
      </div>
    </SimShell>
  );
}

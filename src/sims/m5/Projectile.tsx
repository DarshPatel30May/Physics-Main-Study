import { useMemo, useRef, useState } from 'react';
import { SimShell, Playback, GraphCard } from '@/components/SimShell';
import { Slider, Toggle, Stat, Tex, Select } from '@/components/ui';
import { Graph, sample } from '@/components/Graph';
import { Arrow, Label } from '@/components/svg';
import { useAnimationFrame } from '@/lib/hooks';
import { useSimSettings } from '@/lib/store';
import { projectile, projectileWithDrag, levelRange } from '@/lib/physics/mechanics';
import { sigTex } from '@/lib/physics/stats';

const DEFAULTS = { u: 20, angle: 45, h0: 0, g: 9.8, vectors: true, trail: true, calcs: true, drag: false };
const W = 640;
const H = 340;
const M = 36;

const PLANETS = [
  { value: '9.8', label: 'Earth (9.8 m s⁻²)' },
  { value: '1.62', label: 'Moon (1.62 m s⁻²)' },
  { value: '3.71', label: 'Mars (3.71 m s⁻²)' },
  { value: '24.8', label: 'Jupiter (24.8 m s⁻²)' },
];

export default function ProjectileSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('projectile', DEFAULTS);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const ref = useRef<HTMLDivElement>(null);

  const p = useMemo(() => projectile({ u: s.u, angleDeg: s.angle, h0: s.h0, g: s.g }), [s.u, s.angle, s.h0, s.g]);
  const st = p.at(t);

  useAnimationFrame(
    (dt) => {
      setT((prev) => {
        const next = prev + dt * speed;
        if (next >= p.tFlight) {
          setPlaying(false);
          return p.tFlight;
        }
        return next;
      });
    },
    playing,
    ref,
  );

  const change = (patch: Partial<typeof DEFAULTS>) => {
    set(patch);
    setT(0);
    setPlaying(false);
  };

  // same scale on both axes so the drawn path has its true shape
  const spanX = Math.max(p.range, 1);
  const spanY = Math.max(p.maxHeight, 1);
  const k = Math.min((W - 2 * M) / spanX, (H - 2 * M) / spanY);
  const X = (x: number) => M + x * k;
  const Y = (y: number) => H - M - y * k;

  const path = useMemo(() => {
    const n = 120;
    return Array.from({ length: n + 1 }, (_, i) => {
      const q = p.at((i / n) * p.tFlight);
      return `${i ? 'L' : 'M'}${X(q.x).toFixed(1)},${Y(q.y).toFixed(1)}`;
    }).join(' ');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p, k]);
  const trail = useMemo(() => {
    const n = 80;
    return Array.from({ length: n + 1 }, (_, i) => {
      const q = p.at((i / n) * t);
      return `${i ? 'L' : 'M'}${X(q.x).toFixed(1)},${Y(q.y).toFixed(1)}`;
    }).join(' ');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p, t, k]);
  const dragPath = useMemo(() => {
    if (!s.drag) return '';
    return projectileWithDrag({ u: s.u, angleDeg: s.angle, h0: s.h0, g: s.g }, 0.08)
      .map((q, i) => `${i ? 'L' : 'M'}${X(q.x).toFixed(1)},${Y(q.y).toFixed(1)}`)
      .join(' ');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.drag, s.u, s.angle, s.h0, s.g, k]);

  const vk = 70 / Math.max(s.u, 5); // px per m/s for vectors

  const data = useMemo(
    () =>
      sample(
        (tt) => {
          const q = p.at(tt);
          return { x: q.x, y: q.y, vx: q.vx, vy: q.vy, ax: 0, ay: -s.g };
        },
        0,
        p.tFlight,
        120,
        't',
      ),
    [p, s.g],
  );
  const refT = [{ x: st.t, colour: undefined as string | undefined }];

  const peak = p.at(p.tPeak);
  const levelR = s.h0 === 0 ? levelRange(s.u, s.angle, s.g) : null;

  return (
    <SimShell
      id="projectile"
      compact={compact}
      onReset={() => {
        reset();
        setT(0);
        setPlaying(false);
      }}
      controls={
        <>
          <Playback
            playing={playing}
            setPlaying={(v) => {
              if (v && t >= p.tFlight) setT(0);
              setPlaying(v);
            }}
            speed={speed}
            setSpeed={setSpeed}
            onReset={() => {
              setT(0);
              setPlaying(false);
            }}
          />
          <Slider label="Time" tex="t" value={Number(st.t.toFixed(2))} min={0} max={Number(p.tFlight.toFixed(2)) || 0.01} step={0.01} unit="s" onChange={(v) => { setPlaying(false); setT(v); }} />
          <Slider label="Launch speed" tex="u" value={s.u} min={1} max={40} step={0.5} unit="m s⁻¹" onChange={(v) => change({ u: v })} colourVar="--accent" />
          <Slider label="Launch angle" tex="\theta" value={s.angle} min={0} max={90} step={1} unit="°" onChange={(v) => change({ angle: v })} />
          <Slider label="Launch height" tex="h_0" value={s.h0} min={0} max={50} step={1} unit="m" onChange={(v) => change({ h0: v })} />
          <Select label="Gravitational acceleration g" value={String(s.g)} options={PLANETS} onChange={(v) => change({ g: Number(v) })} />
          <div className="grid grid-cols-2 gap-2">
            <Toggle label="Vectors" checked={s.vectors} onChange={(v) => set({ vectors: v })} />
            <Toggle label="Trajectory" checked={s.trail} onChange={(v) => set({ trail: v })} />
            <Toggle label="Calculations" checked={s.calcs} onChange={(v) => set({ calcs: v })} />
            <Toggle label="Air drag (compare)" checked={s.drag} onChange={(v) => set({ drag: v })} />
          </div>
        </>
      }
      readouts={
        <>
          <Stat label="horizontal velocity" tex="v_x" value={st.vx} unit="m s⁻¹" />
          <Stat label="vertical velocity" tex="v_y" value={st.vy} unit="m s⁻¹" />
          <Stat label="speed" tex="|v|" value={st.v} unit="m s⁻¹" />
          <Stat label="direction" value={`${st.dirDeg.toFixed(1)}°`} />
          <Stat label="max height (above ground)" tex="h_{max}" value={p.maxHeight} unit="m" tone="text-m7" />
          <Stat label="time of flight" tex="t_f" value={p.tFlight} unit="s" />
          <Stat label="range" tex="R" value={p.range} unit="m" tone="text-accent" />
          <Stat label="final speed" tex="v_f" value={p.vFinal} unit="m s⁻¹" />
        </>
      }
      graphs={
        <>
          <GraphCard title="Displacement–time" note="x rises linearly (constant v_x); y is a parabola (constant a_y).">
            <Graph data={data} xKey="t" xLabel="t (s)" yLabel="displacement (m)" series={[{ key: 'x', label: 'x' }, { key: 'y', label: 'y' }]} refX={refT} legend height={200} />
          </GraphCard>
          <GraphCard title="Velocity–time" note="Gradient of v_y–t = a_y = −g; area under v–t = displacement.">
            <Graph data={data} xKey="t" xLabel="t (s)" yLabel="velocity (m s⁻¹)" series={[{ key: 'vx', label: 'v_x' }, { key: 'vy', label: 'v_y' }]} refX={refT} refY={[{ y: 0 }]} legend height={200} />
          </GraphCard>
          <GraphCard title="Acceleration–time" note="a_x = 0 and a_y = −g throughout — even at the top.">
            <Graph data={data} xKey="t" xLabel="t (s)" yLabel="acceleration (m s⁻²)" series={[{ key: 'ax', label: 'a_x' }, { key: 'ay', label: 'a_y' }]} refX={refT} yDomain={[-Math.ceil(s.g + 2), 2]} legend height={200} />
          </GraphCard>
        </>
      }
      below={
        s.calcs ? (
          <div className="grid gap-x-8 gap-y-1 text-sm md:grid-cols-2">
            <div>
              <div className="label mb-1">Step-by-step (up = positive)</div>
              <Tex block>{`u_x = u\\cos\\theta = ${s.u}\\cos${s.angle}^\\circ = ${sigTex(p.ux)}\\ \\text{m s}^{-1}`}</Tex>
              <Tex block>{`u_y = u\\sin\\theta = ${s.u}\\sin${s.angle}^\\circ = ${sigTex(p.uy)}\\ \\text{m s}^{-1}`}</Tex>
              <Tex block>{`-h_0 = u_y t - \\tfrac12 g t^2 \\Rightarrow t_f = \\frac{u_y + \\sqrt{u_y^2 + 2gh_0}}{g} = ${sigTex(p.tFlight)}\\ \\text{s}`}</Tex>
            </div>
            <div>
              <Tex block>{`R = u_x t_f = ${sigTex(p.ux)} \\times ${sigTex(p.tFlight)} = ${sigTex(p.range)}\\ \\text{m}`}</Tex>
              <Tex block>{`h_{max} = h_0 + \\frac{u_y^2}{2g} = ${sigTex(p.maxHeight)}\\ \\text{m}`}</Tex>
              <Tex block>{`v_f = \\sqrt{u_x^2 + v_{y,f}^2} = ${sigTex(p.vFinal)}\\ \\text{m s}^{-1}\\ \\text{at } ${sigTex(p.finalDirDeg)}^\\circ`}</Tex>
              {levelR !== null && <div className="mt-1 text-xs text-muted">Check: level-ground formula R = u² sin 2θ / g = {levelR.toFixed(2)} m ✓ (valid only because h₀ = 0).</div>}
              {s.h0 > 0 && <div className="mt-1 text-xs text-warn">h₀ &gt; 0: the level-ground formulas do not apply — the vertical quadratic is solved instead.</div>}
            </div>
          </div>
        ) : undefined
      }
      formulas={['\\Delta x = u_x t', '\\Delta y = u_y t + \\tfrac12 a_y t^2', 'v_y = u_y + a_y t', 'v_y^2 = u_y^2 + 2a_y\\Delta y']}
      explanation={
        <>
          <p>The horizontal velocity never changes because no horizontal force acts. Gravity changes only the vertical velocity, by −g every second.</p>
          <p>At the highest point v_y = 0 but v_x is unchanged, so the speed is at its minimum — not zero. Launching from a height increases the flight time and range; the best angle then falls below 45°.</p>
        </>
      }
      prediction={{
        q: 'Two balls are launched at 30° and 60° with the same speed from ground level. Which lands further away?',
        options: ['30°', '60°', 'They land at the same place', 'It depends on g'],
        answer: 2,
        explain: 'sin(2 × 30°) = sin(2 × 60°), so complementary angles give equal ranges on level ground (for any g).',
      }}
      assumptions={['No air resistance (except the optional comparison curve).', 'Uniform gravitational field; g constant.', 'Launch and landing measured from the ground (y = 0).', 'Projectile treated as a point particle (no spin).']}
      limitations={['Real projectiles experience drag, which reduces range and height and makes the path asymmetric.', 'The drag curve uses a simple linear-drag model (a = −kv, k = 0.08 s⁻¹) for qualitative comparison only.', 'Earth’s curvature and rotation are ignored (fine for short ranges).']}
    >
      <div ref={ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Projectile trajectory: range ${p.range.toFixed(1)} m, max height ${p.maxHeight.toFixed(1)} m`}>
          <defs>
            <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" className="[stop-color:rgb(var(--accent))]" stopOpacity="0.06" />
              <stop offset="1" className="[stop-color:rgb(var(--accent))]" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect x={0} y={0} width={W} height={H} fill="url(#sky)" />
          {/* ground and launch platform */}
          <line x1={0} y1={Y(0)} x2={W} y2={Y(0)} className="stroke-muted" strokeWidth={1.5} />
          {s.h0 > 0 && <rect x={M - 30} y={Y(s.h0)} width={30} height={Y(0) - Y(s.h0)} className="fill-line" />}
          {/* scale bar */}
          {(() => {
            const nice = [1, 2, 5, 10, 20, 50, 100][[1, 2, 5, 10, 20, 50, 100].findIndex((n) => n * k > 60)] ?? 100;
            return (
              <g>
                <line x1={W - 20 - nice * k} y1={20} x2={W - 20} y2={20} className="stroke-muted" strokeWidth={2} />
                <Label x={W - 20 - (nice * k) / 2} y={14} anchor="middle" className="fill-muted" size={11}>
                  {nice} m
                </Label>
              </g>
            );
          })()}
          {s.trail && <path d={path} fill="none" className="stroke-muted" strokeWidth={1.3} strokeDasharray="5 5" />}
          {s.drag && <path d={dragPath} fill="none" className="stroke-bad" strokeWidth={1.5} strokeDasharray="2 4" />}
          <path d={trail} fill="none" className="stroke-accent" strokeWidth={2.5} />
          {/* max height & range markers */}
          {p.uy > 0 && (
            <g>
              <line x1={X(peak.x)} y1={Y(peak.y)} x2={X(peak.x)} y2={Y(0)} className="stroke-m7" strokeDasharray="3 3" />
              <Label x={X(peak.x) + 4} y={Y(peak.y) - 6} className="fill-m7" size={11}>
                h_max = {p.maxHeight.toFixed(1)} m
              </Label>
            </g>
          )}
          <Label x={X(p.range)} y={Y(0) + 16} anchor="middle" className="fill-accent" size={11}>
            R = {p.range.toFixed(1)} m
          </Label>
          {/* projectile */}
          <circle cx={X(st.x)} cy={Y(st.y)} r={7} className="fill-ink" />
          {s.vectors && (
            <g>
              <Arrow x1={X(st.x)} y1={Y(st.y)} x2={X(st.x) + st.vx * vk} y2={Y(st.y)} className="text-m5" label="vₓ" title="horizontal velocity" />
              <Arrow x1={X(st.x)} y1={Y(st.y)} x2={X(st.x)} y2={Y(st.y) - st.vy * vk} className="text-m7" label="v_y" title="vertical velocity" />
              <Arrow x1={X(st.x)} y1={Y(st.y)} x2={X(st.x) + st.vx * vk} y2={Y(st.y) - st.vy * vk} className="text-accent" label="v" width={2.5} title="resultant velocity" />
              <Arrow x1={X(st.x) - 14} y1={Y(st.y)} x2={X(st.x) - 14} y2={Y(st.y) + 32} className="text-bad" label="g" labelOffset={[-14, 10]} width={1.8} title="acceleration due to gravity" />
            </g>
          )}
          <Label x={10} y={H - 8} className="fill-muted" size={11}>
            t = {st.t.toFixed(2)} s · x = {st.x.toFixed(1)} m · y = {st.y.toFixed(1)} m
          </Label>
        </svg>
      </div>
    </SimShell>
  );
}

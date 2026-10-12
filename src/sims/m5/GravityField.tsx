import { useMemo } from 'react';
import { SimShell, GraphCard } from '@/components/SimShell';
import { Slider, Stat, Toggle, Select, Callout } from '@/components/ui';
import { Graph, sample } from '@/components/Graph';
import { Arrow, Label } from '@/components/svg';
import { useSimSettings } from '@/lib/store';
import { C } from '@/lib/physics/constants';

const BODIES = {
  earth: { name: 'Earth', M: C.ME, R: C.RE, colour: 'fill-m5' },
  moon: { name: 'Moon', M: C.MMoon, R: C.RMoon, colour: 'fill-muted' },
  mars: { name: 'Mars', M: 6.42e23, R: 3.39e6, colour: 'fill-bad' },
  jupiter: { name: 'Jupiter', M: 1.898e27, R: 6.99e7, colour: 'fill-m7' },
};
type BodyKey = keyof typeof BODIES;
const DEFAULTS = { body: 'earth' as BodyKey, massScale: 1, m: 100, probeR: 2, probeAng: 40, vectors: true };
const W = 560;
const H = 380;

export default function GravityFieldSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('gravity-field', DEFAULTS);
  const b = BODIES[s.body];
  const M = b.M * s.massScale;
  const r = s.probeR * b.R; // probe distance from centre (m)
  const g = (C.G * M) / (r * r);
  const F = g * s.m;
  const gSurf = (C.G * M) / (b.R * b.R);

  const cx = W / 2;
  const cy = H / 2;
  const Rpx = 46; // planet radius in px
  const pxPerR = Rpx; // 1 planet radius = 46 px
  const ang = (s.probeAng * Math.PI) / 180;
  const ppx = cx + s.probeR * pxPerR * Math.cos(ang);
  const ppy = cy - s.probeR * pxPerR * Math.sin(ang);

  const grid = useMemo(() => {
    const out: { x: number; y: number; dx: number; dy: number; mag: number }[] = [];
    for (let x = 20; x < W; x += 40) {
      for (let y = 20; y < H; y += 40) {
        const dx = cx - x;
        const dy = cy - y;
        const d = Math.hypot(dx, dy) / pxPerR; // in planet radii
        if (d < 1.2) continue;
        out.push({ x, y, dx: dx / Math.hypot(dx, dy), dy: dy / Math.hypot(dx, dy), mag: 1 / (d * d) });
      }
    }
    return out;
  }, [cx, cy, pxPerR]);

  const data = useMemo(() => sample((x) => ({ g: (C.G * M) / (x * b.R) ** 2, F: ((C.G * M) / (x * b.R) ** 2) * s.m }), 1, 8, 140, 'r'), [M, b.R, s.m]);

  return (
    <SimShell
      id="gravity-field"
      compact={compact}
      onReset={reset}
      controls={
        <>
          <Select label="Central body" value={s.body} onChange={(body) => set({ body })} options={Object.entries(BODIES).map(([k, v]) => ({ value: k as BodyKey, label: v.name }))} />
          <Slider label="Mass multiplier" value={s.massScale} min={0.25} max={4} step={0.25} unit={`× M(${b.name})`} onChange={(massScale) => set({ massScale })} />
          <Slider label="Test mass" tex="m" value={s.m} min={1} max={1000} step={1} unit="kg" onChange={(m) => set({ m })} />
          <Slider label="Probe distance from centre" tex="r" value={s.probeR} min={1} max={5} step={0.05} unit="planet radii" onChange={(probeR) => set({ probeR })} />
          <Slider label="Probe direction" value={s.probeAng} min={0} max={360} step={5} unit="°" onChange={(probeAng) => set({ probeAng })} />
          <Toggle label="Field vectors" checked={s.vectors} onChange={(vectors) => set({ vectors })} />
        </>
      }
      readouts={
        <>
          <Stat label="distance from centre" tex="r" value={r} unit="m" />
          <Stat label="altitude" tex="h = r - R" value={r - b.R} unit="m" />
          <Stat label="field strength" tex="g" value={g} unit="N kg⁻¹" tone="text-accent" />
          <Stat label="force on test mass" tex="F" value={F} unit="N" />
          <Stat label="surface g" value={gSurf} unit="N kg⁻¹" />
          <Stat label="g / g_surface" value={g / gSurf} />
        </>
      }
      graphs={
        <>
          <GraphCard title="Field strength vs distance" note="Inverse-square: at 2R, g is ¼ of its surface value; at 3R, 1/9.">
            <Graph data={data} xKey="r" xLabel="r (planet radii)" yLabel="g (N kg⁻¹)" series={[{ key: 'g', label: 'g' }]} dots={[{ x: s.probeR, y: g }]} height={210} />
          </GraphCard>
          <GraphCard title="Gravitational force vs distance" note="F = GMm/r² — doubles if m doubles; the area under F–r is the work needed to move the mass outwards.">
            <Graph data={data} xKey="r" xLabel="r (planet radii)" yLabel="F (N)" series={[{ key: 'F', label: 'F' }]} dots={[{ x: s.probeR, y: F }]} height={210} />
          </GraphCard>
        </>
      }
      below={<Callout kind="warn" title="Altitude vs orbital radius">Always measure r from the centre of the planet: r = R + altitude. Using the altitude alone is one of the most common HSC errors.</Callout>}
      formulas={['F = \\dfrac{GMm}{r^2}', 'g = \\dfrac{F}{m} = \\dfrac{GM}{r^2}']}
      explanation={
        <>
          <p>The field points radially inwards everywhere. Field lines spread out with distance, so the field weakens as 1/r². The field strength depends only on the central mass and the distance — not on the test mass placed there.</p>
          <p>The force on the test mass is F = mg; both the planet and the test mass feel this same size force (Newton’s third law).</p>
        </>
      }
      prediction={{
        q: 'You move from the surface (r = R) to r = 3R. What happens to g?',
        options: ['Falls to 1/3', 'Falls to 1/9', 'Falls to 1/6', 'Stays the same'],
        answer: 1,
        explain: 'g ∝ 1/r²: tripling r reduces g by 3² = 9.',
      }}
      assumptions={['Spherically symmetric central body; probe outside it.', 'Test mass too small to disturb the field.', 'Masses and radii from the NESA data sheet (Earth) and NASA fact sheets (others).']}
      limitations={['Field arrows are scaled for visibility (length ∝ g, capped near the surface).', 'Inside the planet g decreases towards zero — not modelled.', 'Planetary rotation (which slightly reduces apparent weight) is ignored.']}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Radial gravitational field of ${b.name}`}>
        {[2, 3, 4, 5].map((k) => (
          <circle key={k} cx={cx} cy={cy} r={k * pxPerR} fill="none" className="stroke-line" strokeDasharray="3 5" />
        ))}
        {s.vectors &&
          grid.map((a, i) => {
            const L = Math.min(22, 26 * a.mag + 4);
            return <Arrow key={i} x1={a.x - (a.dx * L) / 2} y1={a.y - (a.dy * L) / 2} x2={a.x + (a.dx * L) / 2} y2={a.y + (a.dy * L) / 2} className="text-accent/60" width={1.2} head={5} />;
          })}
        <circle cx={cx} cy={cy} r={Rpx} className={b.colour} opacity={0.85} />
        <Label x={cx} y={cy + 4} anchor="middle" size={12} weight={700} className="fill-white">
          {b.name}
        </Label>
        <line x1={cx} y1={cy} x2={ppx} y2={ppy} className="stroke-muted" strokeDasharray="4 3" />
        <circle cx={ppx} cy={ppy} r={7} className="fill-ink" />
        <Arrow x1={ppx} y1={ppy} x2={ppx + ((cx - ppx) / Math.hypot(cx - ppx, cy - ppy)) * Math.min(80, 10 + 60 / (s.probeR * s.probeR))} y2={ppy + ((cy - ppy) / Math.hypot(cx - ppx, cy - ppy)) * Math.min(80, 10 + 60 / (s.probeR * s.probeR))} className="text-bad" label="F" width={2.5} />
        <Label x={ppx + 10} y={ppy - 12} size={11}>
          g = {g.toFixed(2)} N kg⁻¹
        </Label>
        <Label x={12} y={H - 10} className="fill-muted" size={11}>
          Dashed circles: 2R, 3R, 4R, 5R from the centre.
        </Label>
      </svg>
    </SimShell>
  );
}

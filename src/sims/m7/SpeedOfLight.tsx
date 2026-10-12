import { useMemo, useRef, useState } from 'react';
import { SimShell, GraphCard } from '@/components/SimShell';
import { Slider, Stat, Callout } from '@/components/ui';
import { Graph } from '@/components/Graph';
import { Label } from '@/components/svg';
import { useAnimationFrame } from '@/lib/hooks';
import { useSimSettings } from '@/lib/store';

const C_TRUE = 299792458;
const DEFAULTS = { f: 12.6, teeth: 720, dkm: 8.633 };
const W = 560;
const H = 260;

/** Fraction of returning light transmitted by a toothed wheel (equal tooth and gap widths). */
function transmitted(f: number, teeth: number, d: number) {
  const phase = (f * teeth * 2 * d) / C_TRUE; // number of tooth-periods the wheel turns during the round trip
  const frac = phase - Math.floor(phase);
  return Math.abs(1 - 2 * frac);
}

export default function SpeedOfLightSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('speed-of-light', DEFAULTS);
  const [rot, setRot] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useAnimationFrame((dt) => setRot((r) => r + dt * s.f * 0.05 * 360), true, ref); // visual rotation slowed 20×
  const d = s.dkm * 1e3;
  const T = transmitted(s.f, s.teeth, d);
  const fBlock = C_TRUE / (4 * d * s.teeth);
  const data = useMemo(() => Array.from({ length: 301 }, (_, i) => {
    const f = (i / 300) * 4 * fBlock;
    return { f, T: transmitted(f, s.teeth, d) };
  }), [fBlock, s.teeth, d]);
  const cMeasured = 4 * d * s.teeth * s.f;

  return (
    <SimShell
      id="speed-of-light"
      compact={compact}
      onReset={reset}
      controls={
        <>
          <Slider label="Wheel rotation rate" tex="f" value={s.f} min={0.5} max={60} step={0.1} unit="rev s⁻¹" onChange={(f) => set({ f })} />
          <Slider label="Number of teeth" tex="N" value={s.teeth} min={100} max={1000} step={10} onChange={(teeth) => set({ teeth })} />
          <Slider label="Distance to mirror" tex="d" value={s.dkm} min={1} max={20} step={0.1} unit="km" onChange={(dkm) => set({ dkm })} />
          <button className="btn w-full" onClick={() => set({ f: Number(fBlock.toFixed(2)) })}>
            Jump to first blocking rate
          </button>
        </>
      }
      readouts={
        <>
          <Stat label="returned light" value={`${(T * 100).toFixed(0)}%`} tone={T < 0.1 ? 'text-bad' : 'text-good'} />
          <Stat label="round-trip time 2d/c" value={(2 * d) / C_TRUE} unit="s" />
          <Stat label="first blocking rate" value={fBlock} unit="rev s⁻¹" />
          <Stat label="c from your setting if blocked" tex="c = 4dNf" value={cMeasured} unit="m s⁻¹" tone={T < 0.05 ? 'text-accent' : ''} />
        </>
      }
      graphs={
        <GraphCard title="Returned light vs rotation rate" note="First dark point when the wheel turns half a tooth-spacing during the round trip: t = 1/(2Nf) = 2d/c → c = 4dNf.">
          <Graph data={data} xKey="f" xLabel="rotation rate f (rev s⁻¹)" yLabel="fraction returned" series={[{ key: 'T', label: 'transmitted' }]} dots={[{ x: s.f, y: T }]} yDomain={[0, 1]} height={200} />
        </GraphCard>
      }
      below={
        <Callout kind="info" title="From measurement to definition">
          Fizeau (1849) used about 720 teeth and a mirror 8.6 km away, obtaining c ≈ 3.13 × 10⁸ m s⁻¹. Modern measurements were so precise that in 1983 the speed of light was FIXED at exactly 299 792 458 m s⁻¹, and the metre is now defined as the distance light travels in 1/299 792 458 of a second — tying length to time, which atomic clocks measure extremely precisely.
        </Callout>
      }
      formulas={['c = \\dfrac{2d}{t}', 't = \\dfrac{1}{2Nf}\\ \\Rightarrow\\ c = 4dNf']}
      explanation={
        <>
          <p>Light passes through a gap in the spinning wheel, travels to a distant mirror and returns. If, during the round trip, the wheel has turned so that a tooth now blocks the path, the observer sees darkness.</p>
          <p>Measuring the rotation rate at the first dark point gives the travel time, and hence c.</p>
        </>
      }
      prediction={{
        q: 'If the mirror were moved twice as far away, what rotation rate would first block the light?',
        options: ['Twice as fast', 'Half as fast', 'The same', 'Four times as fast'],
        answer: 1,
        explain: 'The round trip takes twice as long, so the wheel only needs to turn half as fast to move half a tooth spacing.',
      }}
      assumptions={['Teeth and gaps are equal widths.', 'Light travels at the modern value of c in air.']}
      limitations={['The wheel’s on-screen rotation is slowed 20× and the light path is schematic.', 'Fizeau’s real difficulty was judging the faint minimum by eye — his result was ~4% high.']}
    >
      <div ref={ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Fizeau toothed-wheel apparatus">
          <g transform={`translate(110, 130) rotate(${rot})`}>
            <circle r={70} className="fill-line" />
            {Array.from({ length: 36 }, (_, i) => (
              <rect key={i} x={-4} y={-82} width={8} height={14} className="fill-muted" transform={`rotate(${i * 10})`} />
            ))}
            <circle r={8} className="fill-ink" />
          </g>
          <line x1={20} y1={50} x2={110} y2={50} className="stroke-m7" strokeWidth={3} />
          <line x1={110} y1={50} x2={W - 40} y2={50} className="stroke-m7" strokeWidth={3} opacity={0.9} />
          <line x1={W - 40} y1={56} x2={110} y2={56} className="stroke-m7" strokeWidth={3} opacity={Math.max(0.1, T)} strokeDasharray="6 4" />
          <rect x={W - 36} y={30} width={10} height={44} className="fill-m5" />
          <Label x={W - 30} y={24} anchor="middle" size={11}>
            mirror
          </Label>
          <Label x={(110 + W - 40) / 2} y={40} anchor="middle" size={11} className="fill-muted">
            d = {s.dkm} km (not to scale)
          </Label>
          <circle cx={30} cy={56} r={10} className="fill-m7" opacity={Math.max(0.1, T)} />
          <Label x={30} y={84} anchor="middle" size={11}>
            observer
          </Label>
          <Label x={12} y={H - 10} className={T < 0.1 ? 'fill-bad' : 'fill-muted'} size={12} weight={600}>
            {T < 0.1 ? 'Returning light blocked by a tooth — dark!' : `Returning light: ${(T * 100).toFixed(0)}% passes through a gap`}
          </Label>
        </svg>
      </div>
    </SimShell>
  );
}

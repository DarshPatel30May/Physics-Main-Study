import { useMemo } from 'react';
import { SimShell, GraphCard } from '@/components/SimShell';
import { Slider, Stat, Toggle, Callout } from '@/components/ui';
import { Graph } from '@/components/Graph';
import { Label } from '@/components/svg';
import { useSimSettings } from '@/lib/store';
import { brightAngleDeg, gratingIntensity, maxOrder, wavelengthToRGB } from '@/lib/physics/optics';

const DEFAULTS = { lam: 550, lines: 300, order: 1, white: false };
const W = 560;
const H = 340;

export default function GratingSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('grating', DEFAULTS);
  const lam = s.lam * 1e-9;
  const d = 1e-3 / s.lines;
  const mMax = maxOrder(lam, d);
  const th = brightAngleDeg(s.order, lam, d);
  const data = useMemo(
    () =>
      Array.from({ length: 1201 }, (_, i) => {
        const t = -90 + (180 * i) / 1200;
        return { t, I: gratingIntensity((t * Math.PI) / 180, d, lam, 12) };
      }),
    [d, lam],
  );
  const ox = 70;
  const oy = H / 2;
  const R = 250;
  const orders = Array.from({ length: 2 * mMax + 1 }, (_, i) => i - mMax);

  return (
    <SimShell
      id="grating"
      compact={compact}
      onReset={reset}
      controls={
        <>
          <Slider label="Wavelength" tex="\lambda" value={s.lam} min={400} max={700} step={5} unit="nm" onChange={(l) => set({ lam: l })} />
          <Slider label="Lines per millimetre" tex="N" value={s.lines} min={50} max={1200} step={10} unit="mm⁻¹" onChange={(lines) => set({ lines })} />
          <Slider label="Order to inspect" tex="m" value={s.order} min={0} max={5} step={1} onChange={(order) => set({ order })} />
          <Toggle label="White light (400–700 nm)" checked={s.white} onChange={(white) => set({ white })} />
        </>
      }
      readouts={
        <>
          <Stat label="grating spacing" tex="d = 1/N" value={d} unit="m" />
          <Stat label="highest possible order" tex="m \le d/\lambda" value={mMax} tone="text-accent" />
          <Stat label={`angle of order ${s.order}`} tex="\theta" value={Number.isNaN(th) ? `none: mλ/d = ${((s.order * lam) / d).toFixed(2)} > 1` : `${th.toFixed(2)}°`} tone={Number.isNaN(th) ? 'text-bad' : ''} />
          <Stat label="sin θ = mλ/d" value={(s.order * lam) / d} />
        </>
      }
      graphs={
        <GraphCard title="Intensity vs angle (12-slit model)" note="Real gratings have thousands of slits: maxima become extremely sharp and bright.">
          <Graph data={data} xKey="t" xLabel="θ (°)" yLabel="relative intensity" series={[{ key: 'I', label: 'I' }]} yDomain={[0, 1]} height={200} />
        </GraphCard>
      }
      below={
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="p-1">Order m</th>
                {orders.filter((m) => m >= 0).map((m) => (
                  <th key={m} className="p-1">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody className="num">
              <tr className="border-t border-line">
                <td className="p-1 font-sans">θ (°)</td>
                {orders.filter((m) => m >= 0).map((m) => (
                  <td key={m} className="p-1">{brightAngleDeg(m, lam, d).toFixed(2)}</td>
                ))}
              </tr>
            </tbody>
          </table>
          <Callout kind="info">For white light, each order (m ≥ 1) becomes a spectrum with violet nearest the centre and red furthest out (red has the longest λ). Higher-order spectra can overlap.</Callout>
        </div>
      }
      formulas={['d\\sin\\theta = m\\lambda', 'd = \\dfrac{1}{N}', 'm_{max} \\le \\dfrac{d}{\\lambda}']}
      explanation={
        <>
          <p>A diffraction grating is many equally spaced slits. Light from adjacent slits reinforces only where the path difference is a whole number of wavelengths, giving sharp, bright principal maxima.</p>
          <p>Because sin θ cannot exceed 1, only orders with m ≤ d/λ exist.</p>
        </>
      }
      prediction={{
        q: 'You replace a 300 lines/mm grating with a 600 lines/mm grating. What happens to the first-order angle?',
        options: ['Decreases', 'Increases (about doubles in sin θ)', 'Unchanged', 'First order disappears'],
        answer: 1,
        explain: 'd halves, so sin θ = λ/d doubles — maxima spread further apart (and fewer orders exist).',
      }}
      assumptions={['Normal incidence; monochromatic light unless white light selected.', 'Far-field geometry.']}
      limitations={['Ray diagram is schematic (angles are true; distances are not).', 'Relative brightness of orders is not modelled.']}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Diffraction grating with diffracted beams at the principal maxima">
        <rect x={ox - 4} y={oy - 110} width={8} height={220} className="fill-muted" />
        {Array.from({ length: 22 }, (_, i) => (
          <rect key={i} x={ox - 4} y={oy - 108 + i * 10} width={8} height={3} className="fill-bg" />
        ))}
        <line x1={10} y1={oy} x2={ox} y2={oy} stroke={s.white ? '#fff' : wavelengthToRGB(s.lam)} strokeWidth={4} />
        <path d={`M${ox + R},${oy - 160} A${R},${R} 0 0,1 ${ox + R},${oy + 160}`} fill="none" className="stroke-line" />
        {s.white
          ? orders.flatMap((m) =>
              [400, 450, 500, 550, 600, 650, 700].map((nm) => {
                const t = brightAngleDeg(m, nm * 1e-9, d);
                if (Number.isNaN(t) || Math.abs(t) > 80) return null;
                const r = (t * Math.PI) / 180;
                return <line key={`${m}-${nm}`} x1={ox} y1={oy} x2={ox + R * Math.cos(r)} y2={oy - R * Math.sin(r)} stroke={wavelengthToRGB(nm)} strokeWidth={m === 0 ? 3 : 1.6} opacity={0.85} />;
              }),
            )
          : orders.map((m) => {
              const t = brightAngleDeg(m, lam, d);
              if (Number.isNaN(t)) return null;
              const r = (t * Math.PI) / 180;
              return (
                <g key={m}>
                  <line x1={ox} y1={oy} x2={ox + R * Math.cos(r)} y2={oy - R * Math.sin(r)} stroke={wavelengthToRGB(s.lam)} strokeWidth={m === s.order || m === -s.order ? 3 : 1.5} opacity={m === s.order || m === -s.order ? 1 : 0.6} />
                  <Label x={ox + (R + 14) * Math.cos(r)} y={oy - (R + 14) * Math.sin(r) + 4} size={10} anchor="middle">
                    m={m}
                  </Label>
                </g>
              );
            })}
        <Label x={12} y={H - 10} className="fill-muted" size={11}>
          Beams drawn at the true diffraction angles. Orders beyond m = {mMax} cannot exist (sin θ would exceed 1).
        </Label>
      </svg>
    </SimShell>
  );
}

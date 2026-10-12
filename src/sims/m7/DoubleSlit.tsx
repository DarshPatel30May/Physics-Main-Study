import { useCallback, useMemo, useRef, useState } from 'react';
import { SimShell, Playback, GraphCard } from '@/components/SimShell';
import { Slider, Stat, Toggle, Callout } from '@/components/ui';
import { Graph } from '@/components/Graph';
import { useAnimationFrame } from '@/lib/hooks';
import { useSimSettings } from '@/lib/store';
import { doubleSlitIntensity, fringeSpacing, wavelengthToRGB, pathDifference } from '@/lib/physics/optics';
import WaveCanvas, { parseRGB } from './WaveCanvas';

const DEFAULTS = { lam: 600, dmm: 0.25, L: 1.5, amm: 0.05, envelope: true, ymm: 0 };
const CW = 560;
const CH = 300;

export default function DoubleSlitSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('double-slit', DEFAULTS);
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  useAnimationFrame((dt) => setPhase((p) => p + dt * 6), playing, ref);

  const lam = s.lam * 1e-9;
  const d = s.dmm * 1e-3;
  const a = s.amm * 1e-3;
  const dy = fringeSpacing(lam, s.L, d);
  const Ymax = 20e-3; // ±20 mm of screen
  const I = useCallback((y: number) => doubleSlitIntensity(Math.atan(y / s.L), d, lam, s.envelope ? Math.min(a, d * 0.95) : 0), [s.L, d, lam, a, s.envelope]);
  const data = useMemo(() => Array.from({ length: 801 }, (_, i) => {
    const y = -Ymax + (2 * Ymax * i) / 800;
    return { y: y * 1e3, I: I(y) };
  }), [I]);

  // visual (not to scale) wave picture
  const rgbStr = wavelengthToRGB(s.lam);
  const rgb = parseRGB(rgbStr);
  const lamPx = 9 + (10 * (s.lam - 400)) / 300;
  const dPx = 24 + (s.dmm - 0.05) * 90;
  const sources = useMemo(() => [CH / 2 - dPx / 2, CH / 2 + dPx / 2], [dPx]);
  const screenFn = useCallback((py: number) => I(((py - CH / 2) / (CH / 2)) * Ymax), [I]);

  const y = s.ymm * 1e-3;
  const pd = pathDifference(d, s.L, y);
  const order = pd / lam;
  const nearest = Math.round(order * 2) / 2;
  const kind = Math.abs(order - Math.round(order)) < 0.08 ? `bright (m = ${Math.round(order)})` : Math.abs(order - Math.round(order - 0.5) - 0.5) < 0.08 ? 'dark' : 'intermediate';

  return (
    <SimShell
      id="double-slit"
      compact={compact}
      onReset={reset}
      controls={
        <>
          <Playback playing={playing} setPlaying={setPlaying} />
          <Slider label="Wavelength" tex="\lambda" value={s.lam} min={400} max={700} step={5} unit="nm" onChange={(lam2) => set({ lam: lam2 })} />
          <Slider label="Slit separation" tex="d" value={s.dmm} min={0.05} max={1} step={0.01} unit="mm" onChange={(dmm) => set({ dmm })} />
          <Slider label="Slit–screen distance" tex="L" value={s.L} min={0.5} max={3} step={0.1} unit="m" onChange={(L) => set({ L })} />
          <Toggle label="Include single-slit envelope" checked={s.envelope} onChange={(envelope) => set({ envelope })} />
          {s.envelope && <Slider label="Slit width" tex="a" value={s.amm} min={0.01} max={0.2} step={0.005} unit="mm" onChange={(amm) => set({ amm })} />}
          <Slider label="Point on screen" tex="y" value={s.ymm} min={-20} max={20} step={0.05} unit="mm" onChange={(ymm) => set({ ymm })} />
        </>
      }
      readouts={
        <>
          <Stat label="fringe spacing" tex="\Delta y = \lambda L/d" value={dy * 1e3} unit="mm" tone="text-accent" />
          <Stat label="path difference at y" value={pd * 1e9} unit="nm" />
          <Stat label="path difference / λ" value={order} />
          <Stat label="this point is" value={kind} tone={kind.startsWith('bright') ? 'text-good' : kind === 'dark' ? 'text-bad' : ''} />
          <Stat label="angle of 1st maximum" value={(Math.asin(Math.min(1, lam / d)) * 180) / Math.PI} unit="°" />
          <Stat label="nearest half-order" value={nearest} />
        </>
      }
      graphs={
        <GraphCard title="Intensity on the screen" note="Bright fringes where d sin θ = mλ; dark where d sin θ = (m + ½)λ. Dashed line: the point selected above.">
          <Graph data={data} xKey="y" xLabel="position on screen y (mm)" yLabel="relative intensity" series={[{ key: 'I', label: 'I/I₀' }]} refX={[{ x: s.ymm }]} yDomain={[0, 1]} height={220} />
        </GraphCard>
      }
      below={
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <div className="label mb-1">Screen (±20 mm)</div>
            <div className="h-10 w-full rounded" style={{ background: `linear-gradient(90deg, ${data.filter((_, i) => i % 8 === 0).map((p) => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${p.I.toFixed(3)})`).join(',')})`, backgroundColor: '#000' }} />
          </div>
          <Callout kind="info" title="Interference vs diffraction">
            Each slit diffracts light (spreads it out); the two diffracted waves then interfere. The fine fringes come from two-slit interference; the broad envelope comes from single-slit diffraction.
          </Callout>
        </div>
      }
      formulas={['d\\sin\\theta = m\\lambda\\ \\text{(bright)}', 'd\\sin\\theta = (m + \\tfrac12)\\lambda\\ \\text{(dark)}', '\\Delta y = \\dfrac{\\lambda L}{d}']}
      explanation={
        <>
          <p>Coherent light diffracts through both slits. Where waves from the two slits arrive in phase (path difference mλ) they reinforce — bright fringes; where they arrive half a wavelength out of step they cancel — dark fringes.</p>
          <p>Fringes spread out with longer wavelength or larger screen distance, and squeeze together when the slits are further apart.</p>
        </>
      }
      prediction={{
        q: 'You change from red (650 nm) to blue (450 nm) light. What happens to the fringe spacing?',
        options: ['Increases', 'Decreases', 'Unchanged', 'Fringes disappear'],
        answer: 1,
        explain: 'Δy = λL/d — shorter wavelength gives closer fringes.',
      }}
      assumptions={['Monochromatic, coherent light; far-field (Fraunhofer) geometry.', 'Graph uses exact angles; Δy = λL/d is the small-angle result.']}
      limitations={['The animated wave picture is NOT to scale: real slit separations are hundreds of wavelengths. It shows trends, not exact fringe positions.', 'Intensity graph ignores the 1/r fall-off across the screen.']}
    >
      <div ref={ref}>
        <WaveCanvas width={CW} height={CH} sources={sources} barrierX={140} lambdaPx={lamPx} phase={phase} rgb={rgb} screen={screenFn} />
        <div className="px-3 py-1 text-xs text-muted">Wave picture not to scale — the screen strip on the right uses the true intensity for your settings.</div>
      </div>
    </SimShell>
  );
}

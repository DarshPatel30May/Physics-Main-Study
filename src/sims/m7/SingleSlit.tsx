import { useCallback, useMemo, useRef, useState } from 'react';
import { SimShell, Playback, GraphCard } from '@/components/SimShell';
import { Slider, Stat, Callout } from '@/components/ui';
import { Graph } from '@/components/Graph';
import { useAnimationFrame } from '@/lib/hooks';
import { useSimSettings } from '@/lib/store';
import { singleSlitIntensity, singleSlitMinAngleDeg, wavelengthToRGB } from '@/lib/physics/optics';
import WaveCanvas, { parseRGB } from './WaveCanvas';

const DEFAULTS = { lam: 550, aum: 20, L: 1.5 };
const CW = 560;
const CH = 300;

export default function SingleSlitSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('single-slit', DEFAULTS);
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  useAnimationFrame((dt) => setPhase((p) => p + dt * 6), playing, ref);
  const lam = s.lam * 1e-9;
  const a = s.aum * 1e-6;
  const th1 = singleSlitMinAngleDeg(1, a, lam);
  const width = Number.isNaN(th1) ? Infinity : 2 * s.L * Math.tan((th1 * Math.PI) / 180);
  const Ymax = Math.min(0.5, Math.max(0.02, Number.isFinite(width) ? width * 2.5 : 0.5));
  const I = useCallback((y: number) => singleSlitIntensity(Math.atan(y / s.L), a, lam), [a, lam, s.L]);
  const data = useMemo(() => Array.from({ length: 601 }, (_, i) => {
    const y = -Ymax + (2 * Ymax * i) / 600;
    return { y: y * 1e3, I: I(y) };
  }), [I, Ymax]);
  const rgb = parseRGB(wavelengthToRGB(s.lam));
  const lamPx = 9 + (10 * (s.lam - 400)) / 300;
  const aPx = 8 + s.aum * 1.6;
  const sources = useMemo(() => Array.from({ length: 9 }, (_, i) => CH / 2 - aPx / 2 + (aPx * i) / 8), [aPx]);
  const screenFn = useCallback((py: number) => I(((py - CH / 2) / (CH / 2)) * Ymax), [I, Ymax]);

  return (
    <SimShell
      id="single-slit"
      compact={compact}
      onReset={reset}
      controls={
        <>
          <Playback playing={playing} setPlaying={setPlaying} />
          <Slider label="Slit width" tex="a" value={s.aum} min={1} max={100} step={0.5} unit="μm" onChange={(aum) => set({ aum })} />
          <Slider label="Wavelength" tex="\lambda" value={s.lam} min={400} max={700} step={5} unit="nm" onChange={(l) => set({ lam: l })} />
          <Slider label="Slit–screen distance" tex="L" value={s.L} min={0.5} max={3} step={0.1} unit="m" onChange={(L) => set({ L })} />
        </>
      }
      readouts={
        <>
          <Stat label="first minimum angle" tex="a\sin\theta = \lambda" value={Number.isNaN(th1) ? 'none (a < λ)' : `${th1.toFixed(2)}°`} />
          <Stat label="central maximum width" value={Number.isFinite(width) ? width * 1e3 : '—'} unit="mm" tone="text-accent" />
          <Stat label="a / λ" value={a / lam} />
        </>
      }
      graphs={
        <GraphCard title="Diffraction pattern intensity" note="Central maximum is twice as wide as the side maxima, which are much fainter (≈ 4.5%, 1.6%…).">
          <Graph data={data} xKey="y" xLabel="position on screen (mm)" yLabel="relative intensity" series={[{ key: 'I', label: 'I/I₀' }]} yDomain={[0, 1]} height={220} />
        </GraphCard>
      }
      below={<Callout kind="model" title="Syllabus note">The syllabus requires a qualitative analysis of diffraction. The intensity formula I/I₀ = [sin β / β]², β = πa sin θ/λ, and minima a sin θ = mλ are supplementary — they let the simulation draw the pattern accurately.</Callout>}
      formulas={['a\\sin\\theta = m\\lambda\\ \\ (m = \\pm1, \\pm2, \\ldots)\\ \\text{minima}']}
      explanation={
        <>
          <p>Light spreads out after passing through a narrow slit. By Huygens’ principle each point in the slit is a source of wavelets; these interfere, producing a bright central band and fainter side bands.</p>
          <p>Narrow the slit (or increase the wavelength) and the pattern spreads out. A wide slit (a ≫ λ) gives little spreading — which is why diffraction of light is hard to notice in everyday life.</p>
        </>
      }
      prediction={{
        q: 'You halve the slit width. What happens to the width of the central bright band?',
        options: ['Halves', 'Doubles', 'Unchanged', 'Quadruples'],
        answer: 1,
        explain: 'sin θ = λ/a — halving a doubles the angle (for small angles), so the central band doubles in width.',
      }}
      assumptions={['Fraunhofer (far-field) diffraction; monochromatic light.', 'Slit much longer than its width (1D pattern).']}
      limitations={['Wave picture is not to scale and uses 9 wavelet sources.', 'Near-field (Fresnel) effects are ignored.']}
    >
      <div ref={ref}>
        <WaveCanvas width={CW} height={CH} sources={sources} barrierX={140} lambdaPx={lamPx} phase={phase} rgb={rgb} screen={screenFn} />
      </div>
    </SimShell>
  );
}

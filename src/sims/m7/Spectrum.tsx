import { lazy, Suspense, useState } from 'react';
import { SimShell } from '@/components/SimShell';
import { Slider, Stat, Toggle } from '@/components/ui';
import { Label } from '@/components/svg';
import { useSimSettings } from '@/lib/store';
import { SPECTRUM, wavelengthToRGB } from '@/lib/physics/optics';
import { C } from '@/lib/physics/constants';
import { sig } from '@/lib/physics/stats';
import { useThemeColours } from '@/lib/hooks';

const EMWave3D = lazy(() => import('./EMWave3D'));
const DEFAULTS = { logL: -6.3, show3d: true };
const W = 640;
const LMIN = -14;
const LMAX = 4;

export default function SpectrumSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('spectrum', DEFAULTS);
  const [paused, setPaused] = useState(false);
  const c = useThemeColours();
  const lam = 10 ** s.logL;
  const f = C.c / lam;
  const E = (C.h * C.c) / lam;
  const band = SPECTRUM.find((b) => lam >= b.lambda[0] && lam < b.lambda[1]) ?? (lam >= 1e4 ? SPECTRUM[0] : SPECTRUM[SPECTRUM.length - 1]);
  const X = (logl: number) => 20 + ((LMAX - logl) / (LMAX - LMIN)) * (W - 40); // long wavelengths on the left
  const nm = lam * 1e9;

  return (
    <SimShell
      id="spectrum"
      compact={compact}
      onReset={reset}
      controls={
        <>
          <Slider label="Wavelength (log scale)" tex="\lambda" value={s.logL} min={LMIN} max={LMAX} step={0.02} format={() => `${sig(lam, 3)} m`} onChange={(logL) => set({ logL })} />
          <div className="grid grid-cols-2 gap-1.5">
            {SPECTRUM.map((b) => (
              <button key={b.id} className={`btn !justify-start text-xs ${band.id === b.id ? '!border-accent text-accent' : ''}`} onClick={() => set({ logL: (Math.log10(b.lambda[0]) + Math.log10(b.lambda[1])) / 2 })}>
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: b.colour }} />
                {b.name}
              </button>
            ))}
          </div>
          <Toggle label="3D EM wave" checked={s.show3d} onChange={(show3d) => set({ show3d })} />
        </>
      }
      readouts={
        <>
          <Stat label="wavelength" tex="\lambda" value={lam} unit="m" />
          <Stat label="frequency" tex="f = c/\lambda" value={f} unit="Hz" />
          <Stat label="photon energy" tex="E = hf" value={E} unit="J" />
          <Stat label="photon energy" value={E / C.eV} unit="eV" tone="text-accent" />
          <Stat label="region" value={band.name} />
          <Stat label="ionising?" value={E / C.eV > 10 ? 'yes (≳ 10 eV)' : 'no'} tone={E / C.eV > 10 ? 'text-bad' : 'text-good'} />
        </>
      }
      below={
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 text-sm">
            <div className="label">{band.name}</div>
            <p>
              <span className="font-semibold">Range: </span>
              {sig(band.lambda[0], 2)} m – {sig(band.lambda[1], 2)} m · {sig(C.c / band.lambda[1], 2)} – {sig(C.c / band.lambda[0], 2)} Hz
            </p>
            <p>
              <span className="font-semibold">Sources: </span>
              {band.sources}
            </p>
            <p>
              <span className="font-semibold">Properties: </span>
              {band.properties}
            </p>
            <p>
              <span className="font-semibold">Uses: </span>
              {band.uses}
            </p>
            <p>
              <span className="font-semibold">Example: </span>
              {band.example}
            </p>
            <p className="text-xs text-muted">Band boundaries are conventional and approximate; neighbouring regions overlap (e.g. X-rays and gamma rays are distinguished by their source).</p>
          </div>
          {s.show3d && (
            <div>
              <Suspense fallback={<div className="grid h-60 place-items-center text-sm text-muted">Loading 3D view…</div>}>
                <EMWave3D colourE={c.accent} colourB={c.m6} paused={paused} />
              </Suspense>
              <button className="btn mt-1" onClick={() => setPaused((p) => !p)}>
                {paused ? 'Resume wave' : 'Pause wave'}
              </button>
            </div>
          )}
        </div>
      }
      formulas={['c = f\\lambda', 'E = hf = \\dfrac{hc}{\\lambda}', 'c = \\dfrac{1}{\\sqrt{\\mu_0\\varepsilon_0}}']}
      explanation={
        <>
          <p>All electromagnetic waves are transverse oscillations of electric and magnetic fields travelling at c = 3.00 × 10⁸ m s⁻¹ in a vacuum. They differ only in frequency (and so wavelength and photon energy).</p>
          <p>The scale is logarithmic: each tick is a factor of 10. Visible light occupies a tiny slice (≈ 400–700 nm).</p>
        </>
      }
      prediction={{
        q: 'Which has the greater speed in a vacuum: radio waves or gamma rays?',
        options: ['Radio waves', 'Gamma rays', 'Equal speeds', 'Depends on the source'],
        answer: 2,
        explain: 'All EM waves travel at c in a vacuum; only f, λ and photon energy differ.',
      }}
      assumptions={['Values are for EM waves in a vacuum (≈ air).', 'Photon energy E = hf with h from the data sheet.']}
      limitations={['Band edges are conventions, not physical boundaries.', 'The 3D wave is a schematic of a plane-polarised wave (amplitudes not to scale).']}
    >
      <svg viewBox={`0 0 ${W} 190`} className="h-auto w-full" role="img" aria-label="Logarithmic electromagnetic spectrum">
        <defs>
          <linearGradient id="vis" x1="1" x2="0">
            {[400, 450, 500, 550, 600, 650, 700].map((l, i) => (
              <stop key={l} offset={i / 6} stopColor={wavelengthToRGB(l)} />
            ))}
          </linearGradient>
        </defs>
        {SPECTRUM.map((b) => {
          const x1 = X(Math.log10(b.lambda[1]));
          const x2 = X(Math.log10(b.lambda[0]));
          return (
            <g key={b.id} onClick={() => set({ logL: (Math.log10(b.lambda[0]) + Math.log10(b.lambda[1])) / 2 })} className="cursor-pointer">
              <rect x={x1} y={40} width={x2 - x1} height={44} fill={b.id === 'visible' ? 'url(#vis)' : b.colour} opacity={b.id === band.id ? 0.95 : 0.45} />
              <Label x={(x1 + x2) / 2} y={34} anchor="middle" size={10} className={b.id === band.id ? 'fill-ink' : 'fill-muted'} weight={b.id === band.id ? 700 : 500}>
                {b.id === 'visible' ? 'Vis' : b.name.split(' ')[0]}
              </Label>
            </g>
          );
        })}
        {Array.from({ length: LMAX - LMIN + 1 }, (_, i) => LMIN + i).map((e) => (
          <g key={e}>
            <line x1={X(e)} y1={84} x2={X(e)} y2={90} className="stroke-muted" />
            {e % 2 === 0 && (
              <Label x={X(e)} y={102} anchor="middle" size={9} className="fill-muted">
                10{e < 0 ? '⁻' : ''}
                {String(Math.abs(e))
                  .split('')
                  .map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)])
                  .join('')}
              </Label>
            )}
          </g>
        ))}
        <Label x={W - 20} y={118} anchor="end" size={10} className="fill-muted">
          wavelength (m) — shorter →
        </Label>
        <Label x={20} y={118} size={10} className="fill-muted">
          ← lower frequency, lower photon energy
        </Label>
        <line x1={X(s.logL)} y1={30} x2={X(s.logL)} y2={92} className="stroke-ink" strokeWidth={2} />
        <polygon points={`${X(s.logL)},92 ${X(s.logL) - 6},102 ${X(s.logL) + 6},102`} className="fill-ink" />
        {/* wave drawing whose drawn wavelength shrinks logarithmically */}
        {(() => {
          const px = 10 + (s.logL - LMIN) * 3.2; // drawn wavelength (px) grows with log λ
          const pts = Array.from({ length: 300 }, (_, i) => {
            const x = 20 + (i / 299) * (W - 40);
            return `${i ? 'L' : 'M'}${x.toFixed(1)},${(155 + 16 * Math.sin((2 * Math.PI * x) / px)).toFixed(1)}`;
          }).join(' ');
          return <path d={pts} fill="none" stroke={nm >= 380 && nm <= 750 ? wavelengthToRGB(nm) : band.colour} strokeWidth={2} />;
        })()}
        <Label x={20} y={185} size={10} className="fill-muted">
          Schematic wave (drawn wavelength shrinks with λ; not to scale)
        </Label>
      </svg>
    </SimShell>
  );
}

import { useMemo, useState } from 'react';
import { SimShell } from '@/components/SimShell';
import { Slider, Stat, Tabs, Select, Callout } from '@/components/ui';
import { Label } from '@/components/svg';
import { useSimSettings } from '@/lib/store';
import { planck, wavelengthToRGB, wienPeak } from '@/lib/physics/optics';
import { ELEMENT_LINES, FRAUNHOFER } from './spectralLines';

type Tab = 'sources' | 'identify' | 'stellar';
const DEFAULTS = { tab: 'sources' as Tab, source: 'H', T: 5800, v: 0, rot: 0, dense: false };
const W = 640;
const L0 = 380;
const L1 = 750;
const X = (nm: number) => 20 + ((nm - L0) / (L1 - L0)) * (W - 40);

export function SpectrumStrip({ y, h, kind, lines, T, shift = 0, width = 1.2, label }: { y: number; h: number; kind: 'continuous' | 'emission' | 'absorption'; lines: { nm: number; s: number }[]; T?: number; shift?: number; width?: number; label: string }) {
  const id = `g${label.replace(/\W/g, '')}${y}`;
  const peak = T ? planck(wienPeak(T), T) : 1;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" x2="1">
          {Array.from({ length: 38 }, (_, i) => {
            const nm = L0 + (i / 37) * (L1 - L0);
            const bright = T ? Math.min(1, (planck(nm * 1e-9, T) / peak) * 1.1 + 0.15) : 1;
            return <stop key={i} offset={i / 37} stopColor={wavelengthToRGB(nm)} stopOpacity={kind === 'emission' ? 0 : bright} />;
          })}
        </linearGradient>
      </defs>
      <rect x={20} y={y} width={W - 40} height={h} className="fill-black" />
      <rect x={20} y={y} width={W - 40} height={h} fill={`url(#${id})`} />
      {kind !== 'continuous' &&
        lines.map((l, i) => {
          const nm = l.nm * (1 + shift);
          if (nm < L0 || nm > L1) return null;
          return <rect key={i} x={X(nm) - (width * (0.6 + l.s)) / 2} y={y} width={width * (0.6 + l.s)} height={h} fill={kind === 'emission' ? wavelengthToRGB(nm) : '#000'} opacity={kind === 'emission' ? 0.35 + 0.65 * l.s : 0.55 + 0.45 * l.s} />;
        })}
      <Label x={20} y={y - 5} size={11} weight={600}>
        {label}
      </Label>
    </g>
  );
}

export function SpectrumAxis({ y }: { y: number }) {
  return (
    <g>
      {[400, 450, 500, 550, 600, 650, 700, 750].map((nm) => (
        <g key={nm}>
          <line x1={X(nm)} y1={y} x2={X(nm)} y2={y + 5} className="stroke-muted" />
          <Label x={X(nm)} y={y + 16} anchor="middle" size={9} className="fill-muted">
            {nm}
          </Label>
        </g>
      ))}
      <Label x={W - 20} y={y + 28} anchor="end" size={10} className="fill-muted">
        wavelength (nm)
      </Label>
    </g>
  );
}

export default function SpectroscopySim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('spectroscopy', DEFAULTS);
  const [mystery, setMystery] = useState(() => Object.keys(ELEMENT_LINES)[Math.floor(Math.random() * 5)]);
  const [guess, setGuess] = useState<string | null>(null);
  const solar = useMemo(() => FRAUNHOFER.map((f) => ({ nm: f.nm, s: 0.8 })), []);

  // stellar absorption lines: hydrogen strongest near 10 000 K, Ca II/Na/metals strongest in cool stars (qualitative)
  const hStrength = Math.exp(-(((s.T - 9500) / 4000) ** 2));
  const metal = Math.max(0, Math.min(1, (7000 - s.T) / 3500));
  const heStrength = Math.max(0, Math.min(1, (s.T - 15000) / 15000));
  const stellarLines = [
    ...ELEMENT_LINES.H.lines.map((l) => ({ nm: l.nm, s: hStrength * l.s })),
    ...ELEMENT_LINES.Na.lines.slice(0, 2).map((l) => ({ nm: l.nm, s: metal })),
    { nm: 393.4, s: metal },
    { nm: 396.8, s: metal },
    { nm: 527.0, s: metal * 0.6 },
    { nm: 518.4, s: metal * 0.6 },
    ...ELEMENT_LINES.He.lines.map((l) => ({ nm: l.nm, s: heStrength * l.s * 0.8 })),
  ].filter((l) => l.s > 0.05);
  const z = s.v / 3e5;
  const broad = 1.2 + s.rot / 20 + (s.dense ? 1.5 : 0);

  return (
    <SimShell
      id="spectroscopy"
      compact={compact}
      onReset={reset}
      controls={
        <>
          <Tabs size="sm" value={s.tab} onChange={(tab) => set({ tab })} tabs={[{ id: 'sources', label: 'Sources' }, { id: 'identify', label: 'Identify' }, { id: 'stellar', label: 'Stellar spectra' }]} />
          {s.tab === 'sources' && (
            <Select label="Discharge-tube gas" value={s.source} onChange={(source) => set({ source })} options={Object.entries(ELEMENT_LINES).map(([k, v]) => ({ value: k, label: v.name }))} />
          )}
          {s.tab === 'identify' && (
            <>
              <p className="text-sm">An unknown gas is excited in a discharge tube. Compare its emission lines with the reference spectra and identify it.</p>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(ELEMENT_LINES).map(([k, v]) => (
                  <button key={k} onClick={() => setGuess(k)} className={`btn text-xs ${guess === k ? (k === mystery ? '!border-good text-good' : '!border-bad text-bad') : ''}`}>
                    {v.name}
                  </button>
                ))}
              </div>
              {guess && <p className={`text-sm font-semibold ${guess === mystery ? 'text-good' : 'text-bad'}`}>{guess === mystery ? 'Correct — every line matches.' : 'Not a match — compare line positions carefully.'}</p>}
              <button className="btn w-full" onClick={() => { setMystery(Object.keys(ELEMENT_LINES)[Math.floor(Math.random() * 5)]); setGuess(null); }}>
                New unknown gas
              </button>
            </>
          )}
          {s.tab === 'stellar' && (
            <>
              <Slider label="Surface temperature" tex="T" value={s.T} min={3000} max={30000} step={100} unit="K" onChange={(T) => set({ T })} />
              <Slider label="Radial (translational) velocity" value={s.v} min={-3000} max={3000} step={50} unit="km s⁻¹" hint="+ = receding (redshift), − = approaching (blueshift)" onChange={(v) => set({ v })} />
              <Slider label="Rotation (line broadening)" value={s.rot} min={0} max={200} step={5} unit="km s⁻¹" onChange={(rot) => set({ rot })} />
              <Select label="Atmosphere density" value={s.dense ? 'dense' : 'thin'} onChange={(v) => set({ dense: v === 'dense' })} options={[{ value: 'thin', label: 'Low density (giant) — narrow lines' }, { value: 'dense', label: 'High density (main sequence) — broader lines' }]} />
            </>
          )}
        </>
      }
      readouts={
        s.tab === 'stellar' ? (
          <>
            <Stat label="peak wavelength (Wien)" value={wienPeak(s.T) * 1e9} unit="nm" />
            <Stat label="Doppler shift Δλ/λ ≈ v/c" value={z} />
            <Stat label="Hα observed at" value={656.28 * (1 + z)} unit="nm" tone={s.v > 0 ? 'text-bad' : s.v < 0 ? 'text-m5' : ''} />
            <Stat label="dominant lines" value={s.T > 15000 ? 'He' : s.T > 7500 ? 'H (Balmer)' : 'Ca⁺, Na, metals'} />
          </>
        ) : undefined
      }
      below={
        <Callout kind="model" title="What spectra tell us">
          Element identification: each element’s line pattern is unique. Temperature: the peak of the continuum and which lines are strongest. Radial velocity: all lines shift by Δλ/λ ≈ v/c. Rotation: one limb approaches and the other recedes, broadening every line. Density: higher pressure broadens lines (main-sequence dwarfs), so luminous giants show narrower lines.
        </Callout>
      }
      formulas={['E = hf = \\dfrac{hc}{\\lambda}', '\\lambda_{max} = \\dfrac{b}{T}', '\\dfrac{\\Delta\\lambda}{\\lambda_0} \\approx \\dfrac{v}{c}']}
      explanation={
        <>
          <p>A hot dense solid (incandescent filament) emits a continuous spectrum. A hot, low-pressure gas emits only specific wavelengths (bright lines). Sunlight shows a continuous spectrum crossed by dark absorption lines from cooler gas in the Sun’s atmosphere (and Earth’s).</p>
          <p>Line wavelengths are fixed by each element’s energy levels, so spectra identify elements — in the lab and in stars.</p>
        </>
      }
      prediction={{
        q: 'A star’s hydrogen lines are all shifted to longer wavelengths. What can you conclude?',
        options: ['It is cooler', 'It is moving away from us', 'It contains less hydrogen', 'It is rotating faster'],
        answer: 1,
        explain: 'A uniform shift to longer λ (redshift) indicates recession; temperature changes line strengths, not positions.',
      }}
      assumptions={['Line wavelengths from NIST (air values).', 'Stellar line strengths vary qualitatively with temperature.']}
      limitations={['Stellar spectra here are simplified conceptual models — real spectra contain thousands of lines.', 'Doppler formula Δλ/λ ≈ v/c is the low-speed approximation.']}
    >
      <svg viewBox={`0 0 ${W} 300`} className="h-auto w-full" role="img" aria-label="Spectra display">
        {s.tab === 'sources' && (
          <>
            <SpectrumStrip y={30} h={40} kind="continuous" lines={[]} T={2800} label="Incandescent filament (≈ 2800 K) — continuous" />
            <SpectrumStrip y={105} h={40} kind="emission" lines={ELEMENT_LINES[s.source].lines} label={`${ELEMENT_LINES[s.source].name} discharge tube — emission lines`} />
            <SpectrumStrip y={180} h={40} kind="absorption" lines={solar} T={5800} label="Reflected sunlight — continuous with Fraunhofer absorption lines" />
            {FRAUNHOFER.filter((f) => f.nm > L0 && f.nm < L1).map((f) => (
              <Label key={f.label} x={X(f.nm)} y={232} anchor="middle" size={9} className="fill-muted">
                {f.label}
              </Label>
            ))}
            <SpectrumAxis y={250} />
          </>
        )}
        {s.tab === 'identify' && (
          <>
            <SpectrumStrip y={20} h={34} kind="emission" lines={ELEMENT_LINES[mystery].lines} label="Unknown gas" />
            {Object.entries(ELEMENT_LINES).map(([k, v], i) => (
              <SpectrumStrip key={k} y={80 + i * 36} h={16} kind="emission" lines={v.lines} label={v.name} />
            ))}
            <SpectrumAxis y={262} />
          </>
        )}
        {s.tab === 'stellar' && (
          <>
            <SpectrumStrip y={30} h={50} kind="absorption" lines={stellarLines} T={s.T} shift={z} width={broad} label={`Star: T = ${s.T} K, v = ${s.v} km s⁻¹`} />
            <SpectrumStrip y={120} h={24} kind="absorption" lines={stellarLines} T={s.T} label="Same star at rest (laboratory wavelengths)" width={broad} />
            {[656.28, 486.13, 434.05].map((nm) => (
              <line key={nm} x1={X(nm)} y1={144} x2={X(nm * (1 + z))} y2={80} className="stroke-accent" strokeDasharray="3 3" />
            ))}
            <SpectrumAxis y={160} />
            <Label x={20} y={215} size={11} className="fill-muted">
              Dashed lines link each laboratory line to its observed (shifted) position.
            </Label>
          </>
        )}
      </svg>
    </SimShell>
  );
}

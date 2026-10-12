import { SimShell } from '@/components/SimShell';
import { Stat, Tabs, Callout } from '@/components/ui';
import { Arrow, Label } from '@/components/svg';
import { useSimSettings } from '@/lib/store';
import { SPECTRAL_CLASSES } from '@/content/stars';
import { SpectrumStrip, SpectrumAxis } from '@/sims/m7/Spectroscopy';
import { ELEMENT_LINES } from '@/sims/m7/spectralLines';
import { wienPeak } from '@/lib/physics/optics';

type Tab = 'kirchhoff' | 'classes' | 'composition';
const DEFAULTS = { tab: 'kirchhoff' as Tab, cls: 'G' };
const W = 640;

/** Qualitative absorption-line strengths for each spectral class. */
function linesFor(cls: string) {
  const T = { O: 35000, B: 18000, A: 9000, F: 6800, G: 5600, K: 4300, M: 3200 }[cls] ?? 5800;
  const h = Math.exp(-(((T - 9500) / 4500) ** 2));
  const metal = Math.max(0, Math.min(1, (7500 - T) / 3500));
  const he = Math.max(0, Math.min(1, (T - 12000) / 15000));
  const tio = cls === 'M' ? 1 : cls === 'K' ? 0.3 : 0;
  const lines = [
    ...ELEMENT_LINES.H.lines.map((l) => ({ nm: l.nm, s: h * l.s })),
    ...ELEMENT_LINES.He.lines.map((l) => ({ nm: l.nm, s: he * l.s * 0.8 })),
    { nm: 393.4, s: metal },
    { nm: 396.8, s: metal },
    { nm: 589.0, s: metal * 0.8 },
    { nm: 589.6, s: metal * 0.8 },
    { nm: 527.0, s: metal * 0.6 },
    { nm: 518.4, s: metal * 0.6 },
    ...[476.1, 495.4, 516.7, 544.8, 615.9, 705.4].map((nm) => ({ nm, s: tio })), // TiO band heads (schematic)
  ].filter((l) => l.s > 0.05);
  return { T, lines };
}

const COMPOSITION = [
  { el: 'Hydrogen', mass: 73.8, colour: 'bg-m5' },
  { el: 'Helium', mass: 24.9, colour: 'bg-m7' },
  { el: 'Oxygen', mass: 0.6, colour: 'bg-bad' },
  { el: 'Carbon', mass: 0.2, colour: 'bg-muted' },
  { el: 'Neon, iron, nitrogen & others', mass: 0.5, colour: 'bg-m6' },
];

export default function StellarSpectraSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('stellar-spectra', DEFAULTS);
  const cur = SPECTRAL_CLASSES.find((c) => c.cls === s.cls) ?? SPECTRAL_CLASSES[4];
  const { T } = linesFor(s.cls);

  return (
    <SimShell
      id="stellar-spectra"
      compact={compact}
      onReset={reset}
      controls={
        <>
          <Tabs size="sm" value={s.tab} onChange={(tab) => set({ tab })} tabs={[{ id: 'kirchhoff', label: 'Three spectra' }, { id: 'classes', label: 'OBAFGKM' }, { id: 'composition', label: 'Composition' }]} />
          {s.tab === 'classes' && (
            <div className="grid grid-cols-7 gap-1">
              {SPECTRAL_CLASSES.map((c) => (
                <button key={c.cls} onClick={() => set({ cls: c.cls })} className={`btn !px-0 font-display text-lg ${s.cls === c.cls ? '!border-accent' : ''}`} style={{ color: c.colour }}>
                  {c.cls}
                </button>
              ))}
            </div>
          )}
        </>
      }
      readouts={
        s.tab === 'classes' ? (
          <>
            <Stat label="class" value={cur.cls} />
            <Stat label="temperature range" value={cur.range} />
            <Stat label="peak wavelength (typical)" value={wienPeak(T) * 1e9} unit="nm" />
            <Stat label="examples" value={cur.example} />
          </>
        ) : undefined
      }
      below={
        s.tab === 'classes' ? (
          <Callout kind="info" title={`Class ${cur.cls}: key lines`}>
            {cur.lines} Classification depends on which lines are strong — controlled mainly by surface temperature, not composition (Cecilia Payne-Gaposchkin, 1925).
          </Callout>
        ) : s.tab === 'composition' ? (
          <Callout kind="model" title="How we know">
            Line strengths in the solar spectrum, interpreted with atomic physics (ionisation and excitation at the Sun’s temperature), give the abundances. Values: present-day solar photosphere, by mass (Asplund et al. 2009, rounded).
          </Callout>
        ) : (
          <Callout kind="tip" title="Kirchhoff’s laws of spectroscopy">
            1) A hot, dense object emits a continuous spectrum. 2) A hot, low-density gas emits bright lines. 3) A cooler gas in front of a continuous source absorbs the same wavelengths it would emit, producing dark lines. A star’s photosphere gives the continuum; its cooler atmosphere gives the absorption lines.
          </Callout>
        )
      }
      formulas={['E = hf = E_i - E_f', '\\lambda_{max} = \\dfrac{b}{T}']}
      explanation={
        <>
          <p>Electrons in atoms occupy discrete energy levels, so atoms emit or absorb only photons with matching energies. The same element produces emission lines (hot gas) and absorption lines (cool gas in front of a hotter source) at identical wavelengths.</p>
          <p>Stars are classified by the pattern of absorption lines, which depends mainly on temperature: hydrogen lines peak in A stars; ionised helium in O stars; metals and molecules in cool K and M stars.</p>
        </>
      }
      prediction={{
        q: 'Why are hydrogen lines weak in both very hot (O) and cool (M) stars?',
        options: ['Those stars contain little hydrogen', 'In O stars H is ionised; in M stars few electrons are in n = 2', 'The lines are hidden by dust', 'Hydrogen only exists in A stars'],
        answer: 1,
        explain: 'Balmer absorption needs electrons in n = 2. Too hot → ionised; too cool → nearly all in n = 1. All stars are mostly hydrogen.',
      }}
      assumptions={['Line wavelengths from NIST; strengths are qualitative.', 'TiO bands drawn schematically as single lines.']}
      limitations={['Real stellar spectra contain thousands of lines and depend on gravity and composition as well as temperature.', 'Continuum shape uses an ideal blackbody.']}
    >
      <svg viewBox={`0 0 ${W} 300`} className="h-auto w-full" role="img" aria-label="Stellar spectra">
        {s.tab === 'kirchhoff' && (
          <>
            <SpectrumStrip y={30} h={36} kind="continuous" lines={[]} T={6000} label="1. Continuous (hot, dense: stellar photosphere / filament)" />
            <SpectrumStrip y={100} h={36} kind="emission" lines={ELEMENT_LINES.H.lines} label="2. Emission lines (hot, thin hydrogen gas — e.g. a nebula)" />
            <SpectrumStrip y={170} h={36} kind="absorption" lines={ELEMENT_LINES.H.lines} T={9000} label="3. Absorption lines (cooler hydrogen in front of a hotter continuous source)" />
            <SpectrumAxis y={212} />
            <Arrow x1={330} y1={146} x2={330} y2={168} className="text-muted" />
            <Label x={340} y={160} size={10} className="fill-muted">same wavelengths</Label>
          </>
        )}
        {s.tab === 'classes' && (
          <>
            {SPECTRAL_CLASSES.map((c, i) => {
              const L = linesFor(c.cls);
              return <SpectrumStrip key={c.cls} y={18 + i * 36} h={18} kind="absorption" lines={L.lines} T={L.T} label={`${c.cls} (${c.range})${c.cls === s.cls ? '  ◀' : ''}`} />;
            })}
            <SpectrumAxis y={270} />
          </>
        )}
        {s.tab === 'composition' && (
          <g>
            <Label x={20} y={30} size={13} weight={600}>
              The Sun’s composition by mass
            </Label>
            {COMPOSITION.map((c, i) => (
              <g key={c.el}>
                <Label x={20} y={70 + i * 42} size={12}>
                  {c.el}
                </Label>
                <foreignObject x={240} y={56 + i * 42} width={360} height={20}>
                  <div className="h-4 w-full rounded bg-panel2">
                    <div className={`h-4 rounded ${c.colour}`} style={{ width: `${Math.max(1, c.mass)}%` }} />
                  </div>
                </foreignObject>
                <Label x={620} y={70 + i * 42} anchor="end" size={12} className="fill-muted">
                  {c.mass}%
                </Label>
              </g>
            ))}
          </g>
        )}
      </svg>
    </SimShell>
  );
}

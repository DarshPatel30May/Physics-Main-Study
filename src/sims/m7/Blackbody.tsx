import { useMemo } from 'react';
import { SimShell, GraphCard } from '@/components/SimShell';
import { Slider, Stat, Toggle, Callout } from '@/components/ui';
import { Graph } from '@/components/Graph';
import { useSimSettings } from '@/lib/store';
import { planck, rayleighJeans, wienPeak, blackbodyColour } from '@/lib/physics/optics';
import { C } from '@/lib/physics/constants';

const DEFAULTS = { T: 5800, T2: 4000, rj: true, compare: true };
const EXAMPLES = [
  { name: 'Human body', T: 310 },
  { name: 'Incandescent filament', T: 2800 },
  { name: 'Betelgeuse', T: 3600 },
  { name: 'Sun', T: 5772 },
  { name: 'Sirius A', T: 9940 },
  { name: 'Rigel', T: 12100 },
];

export default function BlackbodySim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('blackbody', DEFAULTS);
  const peak = planck(wienPeak(s.T), s.T);
  const lMax = Math.max(3000, wienPeak(Math.min(s.T, s.T2)) * 1e9 * 3);
  const data = useMemo(
    () =>
      Array.from({ length: 401 }, (_, i) => {
        const l = 50 + ((lMax - 50) * i) / 400;
        return {
          l,
          B: planck(l * 1e-9, s.T) / peak,
          B2: s.compare ? planck(l * 1e-9, s.T2) / peak : null,
          RJ: s.rj ? Math.min(rayleighJeans(l * 1e-9, s.T) / peak, 5) : null,
        };
      }),
    [s.T, s.T2, s.rj, s.compare, peak, lMax],
  );
  // total power per area ∝ T⁴ (Stefan–Boltzmann, supplementary)
  const ratio = (s.T / s.T2) ** 4;

  return (
    <SimShell
      id="blackbody"
      compact={compact}
      onReset={reset}
      controls={
        <>
          <Slider label="Temperature" tex="T" value={s.T} min={1000} max={15000} step={50} unit="K" onChange={(T) => set({ T })} />
          <Toggle label="Compare a second temperature" checked={s.compare} onChange={(compare) => set({ compare })} />
          {s.compare && <Slider label="Second temperature" tex="T_2" value={s.T2} min={1000} max={15000} step={50} unit="K" onChange={(T2) => set({ T2 })} />}
          <Toggle label="Show classical prediction (Rayleigh–Jeans)" checked={s.rj} onChange={(rj) => set({ rj })} />
          <div className="grid grid-cols-2 gap-1.5">
            {EXAMPLES.map((e) => (
              <button key={e.name} className="btn text-xs" onClick={() => set({ T: e.T })}>
                {e.name} ({e.T} K)
              </button>
            ))}
          </div>
        </>
      }
      readouts={
        <>
          <Stat label="peak wavelength" tex="\lambda_{max} = b/T" value={wienPeak(s.T) * 1e9} unit="nm" tone="text-accent" />
          <Stat label="peak photon energy" value={(C.h * C.c) / wienPeak(s.T) / C.eV} unit="eV" />
          {s.compare && <Stat label="second peak" value={wienPeak(s.T2) * 1e9} unit="nm" />}
          {s.compare && <Stat label="power ratio (∝ T⁴)" value={ratio} />}
          <div className="rounded-xl border border-line p-2">
            <div className="text-[11px] text-muted">approximate colour</div>
            <div className="mt-1 h-6 rounded" style={{ background: blackbodyColour(s.T) }} />
          </div>
        </>
      }
      graphs={
        <GraphCard title="Spectral radiance vs wavelength (normalised to the peak at T)" note="Visible band ≈ 400–700 nm (dashed). The classical curve agrees at long λ but rises without limit at short λ — the ultraviolet catastrophe.">
          <Graph
            data={data}
            xKey="l"
            xLabel="wavelength (nm)"
            yLabel="relative intensity"
            series={[{ key: 'B', label: `${s.T} K (Planck)` }, ...(s.compare ? [{ key: 'B2', label: `${s.T2} K (Planck)` }] : []), ...(s.rj ? [{ key: 'RJ', label: 'Rayleigh–Jeans (classical)', dashed: true }] : [])]}
            refX={[{ x: 400, label: '400' }, { x: 700, label: '700' }, { x: wienPeak(s.T) * 1e9, label: 'λmax' }]}
            yDomain={[0, 1.6]}
            legend
            height={280}
          />
        </GraphCard>
      }
      below={
        <Callout kind="model" title="Planck’s quantum hypothesis (1900)">
          Planck could only reproduce the measured curves by assuming the oscillators in the walls of a blackbody could only gain or lose energy in packets E = hf. At high frequency each packet is large, so few are emitted — the curve turns down instead of diverging. Einstein (1905) later proposed that light itself is quantised.
        </Callout>
      }
      formulas={['\\lambda_{max} = \\dfrac{b}{T}', 'E = hf', 'B_\\lambda = \\dfrac{2hc^2}{\\lambda^5}\\dfrac{1}{e^{hc/\\lambda kT} - 1}\\ \\text{(supplementary)}']}
      explanation={
        <>
          <p>A blackbody absorbs all radiation and emits a continuous spectrum that depends only on temperature. Hotter bodies emit more at every wavelength and their peak shifts to shorter wavelength (Wien’s law).</p>
          <p>Stars approximate blackbodies, so their colour reveals their surface temperature.</p>
        </>
      }
      prediction={{
        q: 'A star’s temperature doubles. What happens to its peak wavelength?',
        options: ['Doubles', 'Halves', 'Quarters', 'Unchanged'],
        answer: 1,
        explain: 'λ_max = b/T, so doubling T halves λ_max.',
      }}
      assumptions={['Ideal blackbody emitter.', 'Planck curve uses CODATA k_B (supplementary); λ_max uses the data-sheet b.']}
      limitations={['Real stars deviate from blackbody curves because of absorption lines and atmospheric structure.', 'The colour swatch is an approximate sRGB rendering.']}
    >
      <div className="grid h-24 place-items-center" style={{ background: `radial-gradient(circle, ${blackbodyColour(s.T)} 0%, transparent 70%)` }}>
        <span className="rounded bg-black/40 px-2 py-0.5 text-xs text-white">Glow of a {s.T} K blackbody (approximate)</span>
      </div>
    </SimShell>
  );
}

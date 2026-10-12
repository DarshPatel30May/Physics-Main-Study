import { useMemo } from 'react';
import { SimShell, GraphCard } from '@/components/SimShell';
import { Slider, Stat, Tabs, Callout } from '@/components/ui';
import { Graph } from '@/components/Graph';
import { Label } from '@/components/svg';
import { useSimSettings } from '@/lib/store';
import { radialProbability, minMomentumUncertainty } from '@/lib/physics/atomic';
import { mulberry32 } from '@/lib/physics/nuclear';
import { C } from '@/lib/physics/constants';

type Tab = 'cloud' | 'compare' | 'uncertainty';
const ORBITALS = [
  { id: '10', label: '1s', n: 1, l: 0 },
  { id: '20', label: '2s', n: 2, l: 0 },
  { id: '21', label: '2p', n: 2, l: 1 },
  { id: '30', label: '3s', n: 3, l: 0 },
  { id: '31', label: '3p', n: 3, l: 1 },
];
const DEFAULTS = { tab: 'cloud' as Tab, orb: '10', dxpm: 100 };
const W = 360;

/** Sample electron positions from |ψ|² (radial distribution × angular part for p orbitals). */
function sampleCloud(n: number, l: number, count: number) {
  const r = mulberry32(n * 10 + l);
  const rmax = n * n * 4 + 6;
  let pmax = 0;
  for (let x = 0; x < rmax; x += 0.01) pmax = Math.max(pmax, radialProbability(n, l, x));
  const pts: [number, number][] = [];
  let guard = 0;
  while (pts.length < count && guard < count * 400) {
    guard++;
    const rr = r() * rmax;
    if (r() * pmax > radialProbability(n, l, rr)) continue;
    // direction: uniform for s; for p_z weight cos²θ (θ from vertical axis)
    const phi = r() * 2 * Math.PI;
    const cosT = 2 * r() - 1;
    if (l === 1 && r() > cosT * cosT) continue;
    const sinT = Math.sqrt(1 - cosT * cosT);
    // project onto the x–z plane for display
    pts.push([rr * sinT * Math.cos(phi), rr * cosT]);
  }
  return { pts, rmax };
}

export default function QuantumAtomSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('quantum-atom', DEFAULTS);
  const o = ORBITALS.find((x) => x.id === s.orb) ?? ORBITALS[0];
  const cloud = useMemo(() => sampleCloud(o.n, o.l, 2500), [o.n, o.l]);
  const radial = useMemo(() => Array.from({ length: 300 }, (_, i) => {
    const r = (i / 299) * cloud.rmax;
    return { r, P: radialProbability(o.n, o.l, r) };
  }), [o.n, o.l, cloud.rmax]);
  const peak = radial.reduce((a, b) => (b.P > a.P ? b : a));
  const scale = W / 2 / cloud.rmax;
  const dx = s.dxpm * 1e-12;
  const dp = minMomentumUncertainty(dx);
  const dv = dp / C.me;

  // wave packet for uncertainty view: width ∝ Δx; momentum spread ∝ 1/Δx
  const sigma = s.dxpm / 12;
  const packet = Array.from({ length: 300 }, (_, i) => {
    const x = (i - 150) * 0.6;
    return { x, psi: Math.exp(-(x * x) / (2 * sigma * sigma)) * Math.cos(1.2 * x) };
  });
  const momentum = Array.from({ length: 200 }, (_, i) => {
    const k = (i - 100) * 0.03 + 1.2;
    return { k, A: Math.exp(-((k - 1.2) ** 2) * sigma * sigma * 0.5) };
  });

  return (
    <SimShell
      id="quantum-atom"
      compact={compact}
      onReset={reset}
      controls={
        <>
          <Tabs size="sm" value={s.tab} onChange={(tab) => set({ tab })} tabs={[{ id: 'cloud', label: 'Orbitals' }, { id: 'compare', label: 'Bohr vs QM' }, { id: 'uncertainty', label: 'Uncertainty' }]} />
          {s.tab === 'cloud' && (
            <div className="flex flex-wrap gap-1">
              {ORBITALS.map((x) => (
                <button key={x.id} onClick={() => set({ orb: x.id })} className={`btn ${s.orb === x.id ? '!border-accent text-accent' : ''}`}>
                  {x.label}
                </button>
              ))}
            </div>
          )}
          {s.tab === 'uncertainty' && <Slider label="Position uncertainty" tex="\Delta x" value={s.dxpm} min={10} max={500} step={5} unit="pm" onChange={(dxpm) => set({ dxpm })} />}
        </>
      }
      readouts={
        s.tab === 'cloud' ? (
          <>
            <Stat label="orbital" value={o.label} />
            <Stat label="energy (hydrogen)" value={-13.6 / (o.n * o.n)} unit="eV" />
            <Stat label="most probable radius" value={peak.r} unit="a₀" tone="text-accent" />
            <Stat label="Bohr orbit radius n²a₀" value={o.n * o.n} unit="a₀" />
          </>
        ) : s.tab === 'uncertainty' ? (
          <>
            <Stat label="minimum Δp = h/4πΔx" value={dp} unit="kg m s⁻¹" />
            <Stat label="electron Δv" value={dv} unit="m s⁻¹" tone="text-accent" />
          </>
        ) : undefined
      }
      graphs={
        s.tab === 'cloud' ? (
          <GraphCard title="Radial probability density P(r)" note="Probability of finding the electron at distance r (a₀ = Bohr radius = 5.29 × 10⁻¹¹ m). Nodes are where P = 0.">
            <Graph data={radial} xKey="r" xLabel="r (a₀)" yLabel="P(r)" series={[{ key: 'P', label: 'P(r)' }]} refX={[{ x: o.n * o.n, label: 'Bohr' }]} height={220} />
          </GraphCard>
        ) : s.tab === 'uncertainty' ? (
          <>
            <GraphCard title="Wave packet in position (schematic)">
              <Graph data={packet} xKey="x" xLabel="x (arb.)" yLabel="ψ" series={[{ key: 'psi', label: 'ψ' }]} height={180} />
            </GraphCard>
            <GraphCard title="Spread of momentum components" note="Narrower in x ⇒ wider in p.">
              <Graph data={momentum} xKey="k" xLabel="p (arb.)" yLabel="amplitude" series={[{ key: 'A', label: '|φ(p)|' }]} height={180} />
            </GraphCard>
          </>
        ) : undefined
      }
      below={
        s.tab === 'compare' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="p-2">Feature</th>
                  <th className="p-2">Bohr model (1913)</th>
                  <th className="p-2">Quantum mechanical model (Schrödinger, 1926)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Electron description', 'Particle on a definite circular orbit', 'Wave function ψ; |ψ|² = probability density'],
                  ['Quantisation', 'Imposed (mvr = nh/2π)', 'Arises naturally from standing-wave solutions'],
                  ['Position', 'Exact radius rₙ = n²a₀', 'Spread out; most probable radius only'],
                  ['Atoms explained', 'Hydrogen (one electron)', 'All atoms; chemistry and the periodic table'],
                  ['Spectra', 'Hydrogen line wavelengths', 'Wavelengths, intensities, fine structure (with spin)'],
                  ['Quantum numbers', 'n only', 'n, l, mₗ (and spin mₛ)'],
                ].map((r) => (
                  <tr key={r[0]} className="border-t border-line">
                    {r.map((c, i) => (
                      <td key={i} className={`p-2 ${i === 0 ? 'font-semibold' : ''}`}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : s.tab === 'uncertainty' ? (
          <Callout kind="warn" title="Supplementary content">
            Heisenberg’s uncertainty principle (ΔxΔp ≥ h/4π) is not an examinable syllabus formula, but it explains why electrons cannot follow definite orbits: confining an electron to an atom (Δx ≈ 10⁻¹⁰ m) gives Δv ≈ {(minMomentumUncertainty(1e-10) / C.me).toExponential(1)} m s⁻¹.
          </Callout>
        ) : (
          <Callout kind="warn" title="A probability distribution, not a trajectory">
            Each dot is one possible measured position. The electron does not move along a path between the dots. Orbitals are not tiny planetary orbits.
          </Callout>
        )
      }
      formulas={['P(r) = r^2|R_{nl}(r)|^2', '\\Delta x\\,\\Delta p \\ge \\dfrac{h}{4\\pi}\\ \\text{(supplementary)}']}
      explanation={
        <>
          <p>Schrödinger treated the electron in an atom as a three-dimensional standing matter wave. The allowed solutions (orbitals) have fixed energies — explaining quantisation — and |ψ|² gives the probability of finding the electron in each region.</p>
          <p>The 1s cloud is densest near the nucleus, but the most probable distance is exactly the Bohr radius — showing how Bohr’s model captured part of the truth.</p>
        </>
      }
      prediction={{
        q: 'In the quantum model, where is the electron in a hydrogen atom in its ground state?',
        options: ['On a circular orbit of radius a₀', 'At a definite but unknown point', 'Described only by a probability distribution', 'At the nucleus'],
        answer: 2,
        explain: 'The quantum model gives probabilities; a measurement yields a position, but there is no path between measurements.',
      }}
      assumptions={['Exact hydrogen radial functions (n ≤ 3); p orbitals shown as p_z (projected onto a plane).', 'Uncertainty wave packets are schematic.']}
      limitations={['A 2D projection of a 3D distribution.', 'Electron spin and multi-electron effects not shown.']}
    >
      {s.tab === 'cloud' ? (
        <svg viewBox={`0 0 ${W} ${W}`} className="mx-auto h-auto w-full max-w-md" role="img" aria-label={`${o.label} orbital probability cloud`}>
          <rect width={W} height={W} className="fill-black" />
          {cloud.pts.map((p, i) => (
            <circle key={i} cx={W / 2 + p[0] * scale} cy={W / 2 - p[1] * scale} r={1} fill="#22d3ee" opacity={0.55} />
          ))}
          <circle cx={W / 2} cy={W / 2} r={2.5} fill="#f87171" />
          <circle cx={W / 2} cy={W / 2} r={o.n * o.n * scale} fill="none" stroke="#fbbf24" strokeDasharray="3 4" opacity={0.7} />
          <Label x={10} y={W - 10} size={10} className="fill-white">
            Dashed: Bohr orbit radius n²a₀ for comparison. Field of view {(2 * cloud.rmax).toFixed(0)} a₀.
          </Label>
        </svg>
      ) : s.tab === 'compare' ? (
        <div className="grid grid-cols-2 gap-2 p-3">
          <svg viewBox="0 0 200 200" className="h-auto w-full" role="img" aria-label="Bohr orbit">
            <circle cx={100} cy={100} r={60} fill="none" stroke="#fbbf24" strokeWidth={2} />
            <circle cx={160} cy={100} r={6} fill="#4d8dff" />
            <circle cx={100} cy={100} r={4} fill="#f87171" />
            <text x={100} y={190} textAnchor="middle" fontSize={11} className="fill-ink">Bohr: definite orbit</text>
          </svg>
          <svg viewBox="0 0 200 200" className="h-auto w-full" role="img" aria-label="Quantum probability cloud">
            {sampleCloud(1, 0, 600).pts.map((p, i) => (
              <circle key={i} cx={100 + p[0] * 13} cy={100 - p[1] * 13} r={1} fill="#22d3ee" opacity={0.6} />
            ))}
            <circle cx={100} cy={100} r={3} fill="#f87171" />
            <text x={100} y={190} textAnchor="middle" fontSize={11} className="fill-ink">QM: probability cloud</text>
          </svg>
        </div>
      ) : (
        <div className="p-4 text-sm">
          A tightly localised wave (small Δx) must be built from many wavelengths — and since p = h/λ, many momenta. Try shrinking Δx and watch the momentum spread grow.
        </div>
      )}
    </SimShell>
  );
}

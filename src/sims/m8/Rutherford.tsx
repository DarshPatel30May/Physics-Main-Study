import { useMemo } from 'react';
import { SimShell, GraphCard } from '@/components/SimShell';
import { Slider, Stat, Select, Callout, Toggle } from '@/components/ui';
import { Graph } from '@/components/Graph';
import { Label } from '@/components/svg';
import { useSimSettings } from '@/lib/store';
import { rutherfordTrajectory, rutherfordAngleDeg, closestApproachFm } from '@/lib/physics/atomic';

const TARGETS = { gold: { name: 'Gold (Z = 79)', Z: 79 }, silver: { name: 'Silver (Z = 47)', Z: 47 }, aluminium: { name: 'Aluminium (Z = 13)', Z: 13 } };
type T = keyof typeof TARGETS;
const DEFAULTS = { target: 'gold' as T, ke: 5, thomson: false };
const W = 560;
const H = 380;

export default function RutherfordSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('rutherford', DEFAULTS);
  const Z = TARGETS[s.target].Z;
  const dmin = closestApproachFm(s.ke, Z);
  const span = 260; // fm shown
  const k = (W - 40) / (2 * span);
  const cx = W / 2;
  const cy = H / 2;
  const bs = [-120, -80, -50, -30, -18, -10, -5, -2, 2, 5, 10, 18, 30, 50, 80, 120];
  const trajectories = useMemo(() => bs.map((b) => ({ b, ...rutherfordTrajectory(b, s.ke, Z, 600) })), [s.ke, Z]); // eslint-disable-line react-hooks/exhaustive-deps
  const hist = useMemo(() => {
    // angular distribution from many impact parameters uniformly spread over an area (weight ∝ b)
    const bins = Array.from({ length: 18 }, (_, i) => ({ a: i * 10 + 5, n: 0 }));
    for (let b = 0.5; b <= 400; b += 0.5) {
      const th = rutherfordAngleDeg(b, s.ke, Z);
      const i = Math.min(17, Math.floor(th / 10));
      bins[i].n += b; // area weighting
    }
    const total = bins.reduce((t, x) => t + x.n, 0);
    return bins.map((x) => ({ a: x.a, frac: Math.max(1e-6, x.n / total) }));
  }, [s.ke, Z]);
  const over90 = hist.filter((h) => h.a > 90).reduce((t, h) => t + h.frac, 0);

  return (
    <SimShell
      id="rutherford"
      compact={compact}
      onReset={reset}
      controls={
        <>
          <Select label="Target foil" value={s.target} onChange={(target) => set({ target })} options={Object.entries(TARGETS).map(([kk, v]) => ({ value: kk as T, label: v.name }))} />
          <Slider label="Alpha kinetic energy" tex="K" value={s.ke} min={2} max={10} step={0.1} unit="MeV" onChange={(ke) => set({ ke })} />
          <Toggle label="Compare: Thomson (plum-pudding) prediction" checked={s.thomson} onChange={(thomson) => set({ thomson })} />
        </>
      }
      readouts={
        <>
          <Stat label="closest approach (head-on)" tex="d = kq_1q_2/K" value={dmin} unit="fm" tone="text-accent" />
          <Stat label="closest approach" value={dmin * 1e-15} unit="m" />
          <Stat label="fraction scattered > 90° (in this window)" value={over90} />
          <Stat label="gold atom radius ≈" value="1.4 × 10⁻¹⁰ m" />
        </>
      }
      graphs={
        <GraphCard title="Distribution of scattering angles (log scale)" note="Most alphas are deflected only slightly, but a small fraction scatter through large angles — impossible if positive charge were spread through the atom.">
          <Graph data={hist} xKey="a" xLabel="scattering angle (°)" yLabel="fraction of alphas" series={[{ key: 'frac', label: 'Coulomb (nuclear) model', dot: true }]} yScale="log" yDomain={[1e-6, 1]} height={210} />
        </GraphCard>
      }
      below={
        <div className="grid gap-3 md:grid-cols-2">
          <Callout kind="model" title="Conclusions (Rutherford, 1911)">
            The atom is mostly empty space (most alphas pass straight through). Its positive charge and nearly all its mass are concentrated in a tiny nucleus — less than ~10⁻¹⁴ m across, about 10⁴ times smaller than the atom — which strongly repels the rare alphas that come close.
          </Callout>
          {s.thomson && <Callout kind="warn" title="Thomson model prediction">With positive charge spread through the whole atom (~10⁻¹⁰ m), the electric field is never strong enough to deflect a 5 MeV alpha by more than a small fraction of a degree. Back-scattering would essentially never happen.</Callout>}
        </div>
      }
      formulas={['d_{min} = \\dfrac{kq_1q_2}{K}\\ \\text{(supplementary)}', '\\tan\\dfrac{\\theta}{2} = \\dfrac{kq_1q_2}{2Kb}\\ \\text{(supplementary)}']}
      explanation={
        <>
          <p>Each alpha particle (charge +2e) is repelled by the nucleus (charge +Ze) with an inverse-square Coulomb force. The closer its initial line of approach (impact parameter b) to the nucleus, the larger the deflection.</p>
          <p>Only alphas aimed almost directly at the nucleus are back-scattered — which is why such events are rare.</p>
        </>
      }
      prediction={{
        q: 'If the alpha energy is increased, what happens to the distance of closest approach?',
        options: ['Increases', 'Decreases', 'Unchanged', 'Becomes zero'],
        answer: 1,
        explain: 'More kinetic energy lets the alpha climb further into the Coulomb repulsion before stopping: d = kq₁q₂/K.',
      }}
      assumptions={['Point-charge nucleus fixed in place; Coulomb repulsion only (no nuclear force).', 'Non-relativistic alpha particles; trajectories integrated numerically (agree with Rutherford’s formula to < 3%).']}
      limitations={['Electrons are ignored (their effect on alphas is negligible).', 'At very small distances the strong nuclear force would modify scattering (not reached at these energies for gold).', 'Real foils contain many atoms; multiple scattering is ignored.']}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Alpha particle trajectories near a nucleus">
        <rect x={0} y={0} width={W} height={H} className="fill-black" opacity={0.85} />
        {trajectories.map((tr) => (
          <path
            key={tr.b}
            d={tr.pts.filter((p) => Math.abs(p[0]) < span * 1.1 && Math.abs(p[1]) < span).map((p, i) => `${i ? 'L' : 'M'}${(cx + p[0] * k).toFixed(1)},${(cy - p[1] * k).toFixed(1)}`).join(' ')}
            fill="none"
            stroke={Math.abs(tr.deflectionDeg) > 90 ? '#f87171' : '#fbbf24'}
            strokeWidth={1.4}
            opacity={0.9}
          />
        ))}
        {s.thomson &&
          [-100, -50, 0, 50, 100].map((b) => <line key={b} x1={20} y1={cy - b * k} x2={W - 20} y2={cy - b * k - 0.5} stroke="#a78bfa" strokeDasharray="5 5" strokeWidth={1.2} />)}
        <circle cx={cx} cy={cy} r={Math.max(3, 7.4 * k)} fill="#22d3ee" />
        <circle cx={cx} cy={cy} r={dmin * k} fill="none" stroke="#22d3ee" strokeDasharray="3 3" opacity={0.6} />
        <Label x={cx + 10} y={cy - 10} size={10} className="fill-white">nucleus (+{Z}e)</Label>
        <Label x={12} y={20} size={11} className="fill-white">Scale: {span * 2} fm across. Red = deflected by more than 90°.</Label>
        <Label x={12} y={H - 10} size={11} className="fill-white">Dashed circle: closest approach for a head-on collision ({dmin.toFixed(1)} fm).</Label>
      </svg>
    </SimShell>
  );
}

import { SimShell } from '@/components/SimShell';
import { Callout } from '@/components/ui';
import { Label } from '@/components/svg';
import { useSimSettings } from '@/lib/store';

const MODELS = [
  {
    id: 'thomson',
    name: 'Thomson “plum pudding” model',
    who: 'J. J. Thomson',
    year: '1904',
    context: 'Electrons had just been discovered (1897); atoms are neutral, so positive charge must exist somewhere.',
    proposal: 'Electrons embedded in a uniform sphere of positive charge.',
    evidence: 'Cathode-ray experiments: universal negative particles with tiny mass.',
    achievements: 'First model with internal structure; explained electrical neutrality and the existence of electrons.',
    limitations: 'Predicted only tiny alpha deflections — contradicted by Geiger–Marsden large-angle scattering.',
    why: 'Large-angle alpha scattering demanded concentrated positive charge.',
  },
  {
    id: 'rutherford',
    name: 'Rutherford nuclear model',
    who: 'Ernest Rutherford (data from Geiger & Marsden)',
    year: '1911',
    context: 'Alpha particles from radium were available as atomic “probes”.',
    proposal: 'Tiny, dense, positive nucleus containing almost all the mass; electrons orbit far away; atom mostly empty space.',
    evidence: 'Most alphas pass through gold foil; ~1 in 8000 deflected > 90°.',
    achievements: 'Explained scattering quantitatively; introduced the nucleus.',
    limitations: 'Orbiting (accelerating) electrons should radiate and spiral into the nucleus; could not explain line spectra; did not account for all of the nuclear mass (neutron unknown until 1932).',
    why: 'Atomic stability and discrete line spectra needed explaining.',
  },
  {
    id: 'bohr',
    name: 'Bohr model',
    who: 'Niels Bohr',
    year: '1913',
    context: 'Planck and Einstein had introduced energy quanta; Balmer/Rydberg formulas described hydrogen’s lines.',
    proposal: 'Electrons occupy stationary orbits of fixed energy and do not radiate; photons are emitted/absorbed in transitions (hf = ΔE); angular momentum is quantised (mvr = nh/2π).',
    evidence: 'Reproduced hydrogen’s spectrum and the Rydberg constant; Franck–Hertz experiment (1914) confirmed discrete energy levels.',
    achievements: 'Explained atomic stability and hydrogen line spectra.',
    limitations: 'Only works for one-electron atoms; cannot predict line intensities or fine/Zeeman splitting; quantisation imposed without explanation; mixes classical orbits with quantum rules.',
    why: 'Multi-electron atoms and finer spectral details required a fully quantum theory.',
  },
  {
    id: 'qm',
    name: 'Quantum mechanical model',
    who: 'de Broglie, Schrödinger, Heisenberg, Born, Pauli and others',
    year: '1924–1927',
    context: 'de Broglie proposed matter waves; electron diffraction confirmed them (1927).',
    proposal: 'Electrons are described by wave functions solving Schrödinger’s equation; |ψ|² gives the probability of finding the electron (orbitals). Energy quantisation arises naturally.',
    evidence: 'Electron diffraction; accurate predictions of spectra, chemical bonding and the periodic table.',
    achievements: 'Explains multi-electron atoms, line intensities, fine structure (with relativity and spin) and chemistry.',
    limitations: 'Electrons have no definite paths; predictions are probabilistic. Still being extended (e.g. quantum electrodynamics).',
    why: 'Current accepted model — refined, not replaced.',
  },
];

const DEFAULTS = { m: 'thomson' };
const W = 280;
const H = 220;

function ModelPicture({ id }: { id: string }) {
  const cx = W / 2;
  const cy = H / 2;
  switch (id) {
    case 'thomson':
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Plum pudding model">
          <circle cx={cx} cy={cy} r={90} className="fill-bad" opacity={0.3} />
          {[[-40, -30], [30, -50], [50, 20], [-20, 40], [-60, 10], [10, -5], [20, 60]].map(([x, y], i) => (
            <circle key={i} cx={cx + x} cy={cy + y} r={8} className="fill-m5" />
          ))}
          <Label x={cx} y={H - 4} anchor="middle" size={10} className="fill-muted">uniform + charge with embedded electrons</Label>
        </svg>
      );
    case 'rutherford':
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Rutherford nuclear model">
          {[50, 75, 95].map((r) => <ellipse key={r} cx={cx} cy={cy} rx={r} ry={r * 0.6} fill="none" className="stroke-line" />)}
          <circle cx={cx} cy={cy} r={4} className="fill-bad" />
          {[[50, 0], [-75 * 0.7, 75 * 0.6 * 0.7], [0, -95 * 0.6]].map(([x, y], i) => <circle key={i} cx={cx + x} cy={cy + y} r={6} className="fill-m5" />)}
          <Label x={cx} y={H - 4} anchor="middle" size={10} className="fill-muted">tiny nucleus (not to scale — really ~10⁴× smaller)</Label>
        </svg>
      );
    case 'bohr':
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Bohr model with energy levels">
          {[1, 2, 3].map((n) => <circle key={n} cx={cx} cy={cy} r={n * n * 10 + 12} fill="none" className="stroke-m7" strokeDasharray="4 3" />)}
          <circle cx={cx} cy={cy} r={6} className="fill-bad" />
          <circle cx={cx + 52} cy={cy} r={6} className="fill-m5" />
          <path d={`M${cx + 92},${cy - 10} L${cx + 52},${cy - 4}`} className="stroke-good" strokeWidth={2} />
          <Label x={cx + 98} y={cy - 14} size={10} className="fill-good">photon hf = ΔE</Label>
          <Label x={cx} y={H - 4} anchor="middle" size={10} className="fill-muted">allowed orbits n = 1, 2, 3 (radius ∝ n²)</Label>
        </svg>
      );
    default:
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Quantum mechanical electron cloud">
          {Array.from({ length: 500 }, (_, i) => {
            const u = ((i * 9301 + 49297) % 233280) / 233280;
            const v = ((i * 4133 + 7919) % 1000) / 1000;
            const r = -Math.log(1 - u * 0.98) * 22;
            const a = v * 2 * Math.PI;
            return <circle key={i} cx={cx + r * Math.cos(a)} cy={cy + r * Math.sin(a)} r={1.4} className="fill-accent" opacity={0.7} />;
          })}
          <circle cx={cx} cy={cy} r={3} className="fill-bad" />
          <Label x={cx} y={H - 4} anchor="middle" size={10} className="fill-muted">probability cloud (1s orbital), not a path</Label>
        </svg>
      );
  }
}

export default function AtomicModelsSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('atomic-models', DEFAULTS);
  const idx = MODELS.findIndex((m) => m.id === s.m);
  const m = MODELS[Math.max(0, idx)];
  return (
    <SimShell
      id="atomic-models"
      compact={compact}
      onReset={reset}
      controls={
        <div className="space-y-1.5">
          {MODELS.map((mm, i) => (
            <button key={mm.id} onClick={() => set({ m: mm.id })} className={`btn w-full !justify-start text-left ${mm.id === m.id ? '!border-accent text-accent' : ''}`}>
              <span className="num w-10 text-xs text-muted">{mm.year.slice(0, 4)}</span>
              {i + 1}. {mm.name}
            </button>
          ))}
        </div>
      }
      below={
        <div className="grid gap-3 md:grid-cols-2">
          <Callout kind="model" title="Chadwick and the neutron (1932)">
            Rutherford’s nucleus had a puzzle: helium’s mass is ~4 u but its charge is only +2e. Chadwick bombarded beryllium with alphas, producing a penetrating neutral radiation that knocked protons out of paraffin wax. Applying conservation of momentum and energy to collisions with hydrogen and nitrogen nuclei, he showed it consisted of neutral particles with mass ≈ that of a proton: neutrons. ⁴₂He + ⁹₄Be → ¹²₆C + ¹₀n.
          </Callout>
          <Callout kind="tip" title="How science progresses">
            Each model explained the evidence of its time and was replaced (or refined) when new evidence could not be explained. Models are judged by their predictions, not by how intuitive they are.
          </Callout>
        </div>
      }
      explanation={
        <p>Step through the models to see the evidence for each, what it achieved, and why a newer model was needed.</p>
      }
      prediction={{
        q: 'Which observation could the Bohr model explain but the Rutherford model could not?',
        options: ['Large-angle alpha scattering', 'The discrete line spectrum of hydrogen', 'The existence of electrons', 'Spectra of multi-electron atoms'],
        answer: 1,
        explain: 'Quantised energy levels explain hydrogen’s discrete lines. Multi-electron spectra defeated Bohr’s model too.',
      }}
      assumptions={['Diagrams are schematic, not to scale.']}
      limitations={['Historical summaries simplify the work of many contributors.']}
    >
      <div className="grid gap-4 p-4 md:grid-cols-[280px_1fr]">
        <ModelPicture id={m.id} />
        <div className="space-y-2 text-sm">
          <h4 className="text-lg font-semibold">{m.name}</h4>
          <div className="text-muted">
            {m.who} · {m.year}
          </div>
          {[
            ['Historical context', m.context],
            ['Main proposal', m.proposal],
            ['Experimental evidence', m.evidence],
            ['Achievements', m.achievements],
            ['Limitations', m.limitations],
            ['Why a newer model was needed', m.why],
          ].map(([k, v]) => (
            <p key={k}>
              <span className="font-semibold">{k}: </span>
              {v}
            </p>
          ))}
        </div>
      </div>
    </SimShell>
  );
}

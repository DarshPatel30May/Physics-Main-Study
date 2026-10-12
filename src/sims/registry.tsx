import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react';

type SimComponent = LazyExoticComponent<ComponentType<{ compact?: boolean }>>;

/** Lazy-loaded simulation components: each sim is its own chunk, loaded on demand. */
export const SIM_COMPONENTS: Record<string, SimComponent> = {
  projectile: lazy(() => import('./m5/Projectile')),
  circular: lazy(() => import('./m5/Circular')),
  torque: lazy(() => import('./m5/Torque')),
  'gravity-field': lazy(() => import('./m5/GravityField')),
  orbits: lazy(() => import('./m5/Orbits')),
  kepler: lazy(() => import('./m5/Kepler')),
  satellites: lazy(() => import('./m5/Satellites')),
  escape: lazy(() => import('./m5/Escape')),

  'field-lab': lazy(() => import('./m6/FieldLab')),
  'motor-effect': lazy(() => import('./m6/MotorEffect')),
  'parallel-wires': lazy(() => import('./m6/ParallelWires')),
  induction: lazy(() => import('./m6/Induction')),
  transformer: lazy(() => import('./m6/Transformer')),
  machines: lazy(() => import('./m6/Machines')),

  spectrum: lazy(() => import('./m7/Spectrum')),
  'speed-of-light': lazy(() => import('./m7/SpeedOfLight')),
  spectroscopy: lazy(() => import('./m7/Spectroscopy')),
  'newton-huygens': lazy(() => import('./m7/NewtonHuygens')),
  'double-slit': lazy(() => import('./m7/DoubleSlit')),
  'single-slit': lazy(() => import('./m7/SingleSlit')),
  grating: lazy(() => import('./m7/Grating')),
  polarisation: lazy(() => import('./m7/Polarisation')),
  blackbody: lazy(() => import('./m7/Blackbody')),
  photoelectric: lazy(() => import('./m7/Photoelectric')),
  michelson: lazy(() => import('./m7/Michelson')),
  relativity: lazy(() => import('./m7/Relativity')),

  'big-bang': lazy(() => import('./m8/BigBang')),
  'hr-diagram': lazy(() => import('./m8/HRDiagram')),
  'stellar-spectra': lazy(() => import('./m8/StellarSpectra')),
  nucleosynthesis: lazy(() => import('./m8/Nucleosynthesis')),
  'cathode-rays': lazy(() => import('./m8/CathodeRays')),
  millikan: lazy(() => import('./m8/Millikan')),
  rutherford: lazy(() => import('./m8/Rutherford')),
  'atomic-models': lazy(() => import('./m8/AtomicModels')),
  hydrogen: lazy(() => import('./m8/Hydrogen')),
  'matter-waves': lazy(() => import('./m8/MatterWaves')),
  'quantum-atom': lazy(() => import('./m8/QuantumAtom')),
  decay: lazy(() => import('./m8/Decay')),
  'nuclear-lab': lazy(() => import('./m8/NuclearLab')),
  'fission-fusion': lazy(() => import('./m8/FissionFusion')),
  particles: lazy(() => import('./m8/Particles')),
};

export function SimLoader({ id, compact }: { id: string; compact?: boolean }) {
  const C = SIM_COMPONENTS[id];
  if (!C) return <div className="card p-4 text-sm text-muted">Simulation “{id}” not found.</div>;
  return (
    <Suspense fallback={<div className="card grid h-64 place-items-center text-sm text-muted">Loading simulation…</div>}>
      <C compact={compact} />
    </Suspense>
  );
}

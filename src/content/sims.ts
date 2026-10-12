import type { ModuleNo } from './formulas';

export type SimCategory = 'Mechanics' | 'Electromagnetism' | 'Light' | 'Modern Physics';

export interface SimMeta {
  id: string;
  title: string;
  module: ModuleNo;
  category: SimCategory;
  blurb: string;
  /** model fidelity label shown on the simulation */
  model: 'quantitative' | 'conceptual';
}

export const SIMS: SimMeta[] = [
  { id: 'projectile', title: 'Projectile Motion Simulator', module: 5, category: 'Mechanics', blurb: 'Launch speed, angle, height and g — with vectors, v–t, s–t and a–t graphs.', model: 'quantitative' },
  { id: 'circular', title: 'Circular Motion Simulator', module: 5, category: 'Mechanics', blurb: 'Mass, speed, radius and ω — plus flat bends, strings and banked tracks.', model: 'quantitative' },
  { id: 'torque', title: 'Torque Explorer', module: 5, category: 'Mechanics', blurb: 'Apply a force to a spanner: lever arm, angle and rotation.', model: 'quantitative' },
  { id: 'gravity-field', title: 'Gravitational Field Explorer', module: 5, category: 'Mechanics', blurb: 'Field lines, g at any point, and F–r and g–r graphs.', model: 'quantitative' },
  { id: 'orbits', title: 'Orbital Motion Simulator', module: 5, category: 'Mechanics', blurb: 'Circular and elliptical orbits from a numerical integrator, with energy bars and Kepler’s second law.', model: 'quantitative' },
  { id: 'kepler', title: 'Kepler’s Third Law', module: 5, category: 'Mechanics', blurb: 'Real planetary data on log–log axes and an r³/T² calculator.', model: 'quantitative' },
  { id: 'satellites', title: 'LEO vs Geostationary', module: 5, category: 'Mechanics', blurb: 'Compare orbits to scale; orbital speed and period calculators.', model: 'quantitative' },
  { id: 'escape', title: 'Escape Velocity & Potential Well', module: 5, category: 'Mechanics', blurb: 'U = −GMm/r, orbital energy and escape speed for any body.', model: 'quantitative' },

  { id: 'field-lab', title: 'Electric & Magnetic Field Laboratory', module: 6, category: 'Electromagnetism', blurb: 'Point-charge field lines; particles in uniform E, B and crossed fields; force-direction explorer.', model: 'quantitative' },
  { id: 'motor-effect', title: 'Motor Effect Simulator', module: 6, category: 'Electromagnetism', blurb: 'Wire in a field: current, B, length and angle with force vectors.', model: 'quantitative' },
  { id: 'parallel-wires', title: 'Parallel Wires', module: 6, category: 'Electromagnetism', blurb: 'Attraction and repulsion; F/l and the ampere.', model: 'quantitative' },
  { id: 'induction', title: 'Electromagnetic Induction Laboratory', module: 6, category: 'Electromagnetism', blurb: 'Magnet and coil: flux–time and emf–time graphs, Lenz’s law current direction.', model: 'quantitative' },
  { id: 'transformer', title: 'Transformer & Power Grid', module: 6, category: 'Electromagnetism', blurb: 'Turns ratio, energy flow, losses and high-voltage transmission.', model: 'quantitative' },
  { id: 'machines', title: 'Motor & Generator Explorer', module: 6, category: 'Electromagnetism', blurb: 'DC motor, AC/DC generators, back emf, induction motor and magnetic braking.', model: 'quantitative' },

  { id: 'spectrum', title: 'Electromagnetic Spectrum Explorer', module: 7, category: 'Light', blurb: 'Logarithmic spectrum with wavelength, frequency and photon energy; 3D EM wave.', model: 'quantitative' },
  { id: 'speed-of-light', title: 'Measuring the Speed of Light (Fizeau)', module: 7, category: 'Light', blurb: 'Toothed-wheel method: find the rotation rate that blocks the returning light.', model: 'quantitative' },
  { id: 'spectroscopy', title: 'Spectroscopy Lab', module: 7, category: 'Light', blurb: 'Discharge-tube, filament and solar spectra; Doppler shift and line broadening.', model: 'conceptual' },
  { id: 'newton-huygens', title: 'Newton vs Huygens', module: 7, category: 'Light', blurb: 'Compare predictions of the corpuscular and wave models for refraction.', model: 'conceptual' },
  { id: 'double-slit', title: 'Young’s Double-Slit Simulator', module: 7, category: 'Light', blurb: 'Wavefronts, path difference, fringe pattern and intensity graph.', model: 'quantitative' },
  { id: 'single-slit', title: 'Single-Slit Diffraction', module: 7, category: 'Light', blurb: 'Slit width and wavelength vs diffraction pattern.', model: 'quantitative' },
  { id: 'grating', title: 'Diffraction Grating', module: 7, category: 'Light', blurb: 'Principal maxima, allowed orders and angles; white-light spectra.', model: 'quantitative' },
  { id: 'polarisation', title: 'Polarisation & Malus’ Law', module: 7, category: 'Light', blurb: 'Rotate polarisers and measure transmitted intensity.', model: 'quantitative' },
  { id: 'blackbody', title: 'Blackbody Radiation', module: 7, category: 'Light', blurb: 'Planck curves, Wien’s law and the ultraviolet catastrophe.', model: 'quantitative' },
  { id: 'photoelectric', title: 'Photoelectric Effect Simulator', module: 7, category: 'Light', blurb: 'Frequency, intensity, metal and voltage — K_max, threshold and current.', model: 'quantitative' },
  { id: 'michelson', title: 'Michelson–Morley Interferometer', module: 7, category: 'Light', blurb: 'Predicted aether fringe shift vs the observed null result.', model: 'conceptual' },
  { id: 'relativity', title: 'Special Relativity Explorer', module: 7, category: 'Light', blurb: 'Light clock, simultaneity, γ graph, calculators, momentum and E = mc².', model: 'quantitative' },

  { id: 'big-bang', title: 'Big Bang & Hubble Expansion', module: 8, category: 'Modern Physics', blurb: 'Cosmic timeline and a Hubble-law explorer.', model: 'conceptual' },
  { id: 'hr-diagram', title: 'Interactive H–R Diagram', module: 8, category: 'Modern Physics', blurb: 'Real stars, regions, stellar evolution pathways by mass.', model: 'quantitative' },
  { id: 'stellar-spectra', title: 'Stellar Spectra & Classification', module: 8, category: 'Modern Physics', blurb: 'Continuous, emission and absorption spectra; OBAFGKM classes.', model: 'conceptual' },
  { id: 'nucleosynthesis', title: 'Stellar Fusion & Nucleosynthesis', module: 8, category: 'Modern Physics', blurb: 'pp chain, CNO cycle and element formation timeline.', model: 'conceptual' },
  { id: 'cathode-rays', title: 'Cathode Rays & Thomson’s q/m', module: 8, category: 'Modern Physics', blurb: 'Balance E and B fields to find the charge-to-mass ratio.', model: 'quantitative' },
  { id: 'millikan', title: 'Millikan Oil-Drop Experiment', module: 8, category: 'Modern Physics', blurb: 'Balance a drop and discover charge quantisation.', model: 'quantitative' },
  { id: 'rutherford', title: 'Rutherford Scattering', module: 8, category: 'Modern Physics', blurb: 'Alpha trajectories past a gold nucleus (Coulomb model).', model: 'quantitative' },
  { id: 'atomic-models', title: 'Atomic Model Explorer', module: 8, category: 'Modern Physics', blurb: 'Thomson → Rutherford → Bohr → quantum mechanical: evidence and limitations.', model: 'conceptual' },
  { id: 'hydrogen', title: 'Hydrogen Energy Levels & Spectrum', module: 8, category: 'Modern Physics', blurb: 'Click transitions to see photon energy and wavelength.', model: 'quantitative' },
  { id: 'matter-waves', title: 'Matter Waves Explorer', module: 8, category: 'Modern Physics', blurb: 'de Broglie calculator, electron diffraction and standing-wave orbits.', model: 'quantitative' },
  { id: 'quantum-atom', title: 'Quantum Atom & Uncertainty', module: 8, category: 'Modern Physics', blurb: 'Probability clouds from |ψ|², Bohr vs QM, Heisenberg visual.', model: 'quantitative' },
  { id: 'decay', title: 'Radioactive Decay Simulator', module: 8, category: 'Modern Physics', blurb: 'Random decay of nuclei vs N = N₀e^(−λt); α, β, γ comparison.', model: 'quantitative' },
  { id: 'nuclear-lab', title: 'Nuclear Physics Laboratory', module: 8, category: 'Modern Physics', blurb: 'Isotopes, stability, binding-energy curve, mass defect and equation balancing.', model: 'quantitative' },
  { id: 'fission-fusion', title: 'Fission & Fusion', module: 8, category: 'Modern Physics', blurb: 'Chain reactions (controlled vs uncontrolled) and fusion energy.', model: 'conceptual' },
  { id: 'particles', title: 'Particle Physics Explorer', module: 8, category: 'Modern Physics', blurb: 'Standard Model chart, quark builder, forces, accelerators, detectors, timeline.', model: 'conceptual' },
];

export const simById = (id: string) => SIMS.find((s) => s.id === id);

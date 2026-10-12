import type { ModuleNo } from './formulas';

export interface HistoryEntry {
  id: string;
  year: number;
  /** display year text (e.g. "1609–1619") */
  when: string;
  who: string;
  discovery: string;
  evidence: string;
  significance: string;
  modelChange: string;
  module: ModuleNo;
  /** model/theme thread for "how explanations changed" view */
  thread: 'gravity' | 'electromagnetism' | 'light' | 'relativity' | 'atom' | 'nucleus' | 'cosmos';
}

/**
 * Historical summaries are deliberately cautious: most discoveries involved many contributors,
 * and dates refer to key publications or experiments.
 */
export const HISTORY: HistoryEntry[] = [
  {
    id: 'galileo-projectiles', year: 1638, when: '1638', who: 'Galileo Galilei',
    discovery: 'Projectile paths are parabolic: uniform horizontal motion combined with uniformly accelerated fall.',
    evidence: 'Inclined-plane experiments on accelerated motion; analysis published in Two New Sciences (1638).',
    significance: 'Introduced the independence of perpendicular motions — the foundation of projectile analysis.',
    modelChange: 'Replaced Aristotelian ideas that projectiles needed a continuing “impetus” to move.', module: 5, thread: 'gravity',
  },
  {
    id: 'kepler', year: 1609, when: '1609–1619', who: 'Johannes Kepler (using Tycho Brahe’s data)',
    discovery: 'Three laws of planetary motion: elliptical orbits, equal areas in equal times, T² ∝ r³.',
    evidence: 'Decades of precise naked-eye positional measurements of Mars by Tycho Brahe.',
    significance: 'First accurate quantitative description of planetary orbits.',
    modelChange: 'Replaced perfect circular orbits (Copernicus, Ptolemy) with ellipses — empirical laws awaiting a cause.', module: 5, thread: 'gravity',
  },
  {
    id: 'newton-gravity', year: 1687, when: '1687', who: 'Isaac Newton',
    discovery: 'Laws of motion and universal gravitation, F = GMm/r².',
    evidence: 'Explained Kepler’s laws, the Moon’s orbit (“Moon test”) and falling objects with one law.',
    significance: 'Unified terrestrial and celestial mechanics.',
    modelChange: 'Gravity became a universal force; Kepler’s laws became consequences of it.', module: 5, thread: 'gravity',
  },
  {
    id: 'newton-light', year: 1704, when: '1704', who: 'Isaac Newton',
    discovery: 'Corpuscular (particle) model of light; white light is a mixture of colours.',
    evidence: 'Prism experiments; straight-line propagation and sharp shadows.',
    significance: 'Dominated optics for about a century due to Newton’s authority.',
    modelChange: 'Predicted light travels faster in denser media — later shown false.', module: 7, thread: 'light',
  },
  {
    id: 'huygens', year: 1690, when: '1678–1690', who: 'Christiaan Huygens',
    discovery: 'Wave model: every point on a wavefront is a source of secondary wavelets.',
    evidence: 'Explained reflection, refraction and double refraction geometrically.',
    significance: 'Basis for later explanations of diffraction and interference.',
    modelChange: 'Offered an alternative to Newton’s corpuscles; predicted slower light in denser media.', module: 7, thread: 'light',
  },
  {
    id: 'cavendish', year: 1798, when: '1798', who: 'Henry Cavendish',
    discovery: 'Measured the gravitational attraction between lead spheres with a torsion balance.',
    evidence: 'Tiny measurable twist of a fibre caused by nearby masses.',
    significance: 'Allowed G — and hence Earth’s mass and density — to be determined.',
    modelChange: 'Confirmed gravity acts between all masses, even in the laboratory.', module: 5, thread: 'gravity',
  },
  {
    id: 'young', year: 1801, when: '1801–1803', who: 'Thomas Young',
    discovery: 'Interference of light (double-slit experiment).',
    evidence: 'Alternating bright and dark fringes; measured wavelengths of colours.',
    significance: 'Strong evidence for the wave nature of light.',
    modelChange: 'Began the shift from Newton’s particle model to a wave model.', module: 7, thread: 'light',
  },
  {
    id: 'malus', year: 1808, when: '1808–1809', who: 'Étienne-Louis Malus',
    discovery: 'Polarisation of light by reflection; intensity through an analyser ∝ cos²θ.',
    evidence: 'Observed reflected sunlight through a calcite crystal at different orientations.',
    significance: 'Polarisation later showed light waves are transverse.',
    modelChange: 'Required that the wave model involve transverse oscillations.', module: 7, thread: 'light',
  },
  {
    id: 'fresnel', year: 1818, when: '1815–1819', who: 'Augustin-Jean Fresnel (with François Arago)',
    discovery: 'Mathematical wave theory of diffraction; prediction and observation of the Poisson (Arago) spot.',
    evidence: 'A bright spot at the centre of a circular obstacle’s shadow, as the wave theory predicted.',
    significance: 'Won the French Academy prize and convinced most physicists of the wave model.',
    modelChange: 'Wave model became dominant; Fresnel proposed light waves are transverse.', module: 7, thread: 'light',
  },
  {
    id: 'oersted-ampere', year: 1820, when: '1820', who: 'Hans Christian Ørsted; André-Marie Ampère',
    discovery: 'Electric currents produce magnetic fields; parallel currents exert forces on each other.',
    evidence: 'A compass needle deflected near a current; measured forces between current-carrying wires.',
    significance: 'First link between electricity and magnetism; basis of the motor effect and the (former) ampere definition.',
    modelChange: 'Electricity and magnetism were no longer separate phenomena.', module: 6, thread: 'electromagnetism',
  },
  {
    id: 'faraday', year: 1831, when: '1821–1831', who: 'Michael Faraday (independently, Joseph Henry)',
    discovery: 'Electromagnetic rotation (first motor, 1821) and electromagnetic induction (1831).',
    evidence: 'Galvanometer deflection only while magnetic flux through a coil was changing.',
    significance: 'Basis of generators, transformers and the electricity grid; introduced the field concept.',
    modelChange: 'Fields became physical entities, not just mathematical conveniences.', module: 6, thread: 'electromagnetism',
  },
  {
    id: 'lenz', year: 1834, when: '1834', who: 'Heinrich Lenz',
    discovery: 'The direction of an induced current opposes the change producing it.',
    evidence: 'Experiments on induced current directions.',
    significance: 'Later recognised as a consequence of energy conservation.',
    modelChange: 'Added direction to Faraday’s law (the minus sign).', module: 6, thread: 'electromagnetism',
  },
  {
    id: 'fizeau-foucault', year: 1849, when: '1849–1862', who: 'Hippolyte Fizeau; Léon Foucault',
    discovery: 'Terrestrial measurements of the speed of light; light is slower in water than in air (Foucault, 1850).',
    evidence: 'Toothed-wheel and rotating-mirror methods.',
    significance: 'Decisive evidence against Newton’s corpuscular prediction.',
    modelChange: 'Strengthened the wave model; provided the value of c that Maxwell compared with theory.', module: 7, thread: 'light',
  },
  {
    id: 'kirchhoff-bunsen', year: 1859, when: '1859–1860', who: 'Gustav Kirchhoff & Robert Bunsen',
    discovery: 'Each element has a characteristic line spectrum; laws of emission and absorption.',
    evidence: 'Flame and spark spectra; explained the Sun’s dark Fraunhofer lines as absorption.',
    significance: 'Founded spectroscopy and stellar chemical analysis.',
    modelChange: 'Spectral lines became fingerprints of atoms — later explained by quantised energy levels.', module: 7, thread: 'atom',
  },
  {
    id: 'maxwell', year: 1865, when: '1861–1865', who: 'James Clerk Maxwell',
    discovery: 'Unified theory of electromagnetism predicting EM waves travelling at 1/√(μ₀ε₀).',
    evidence: 'Calculated speed matched measured speed of light.',
    significance: 'Light identified as an electromagnetic wave; unified electricity, magnetism and optics.',
    modelChange: 'Light = EM wave; but still assumed a medium (aether).', module: 7, thread: 'light',
  },
  {
    id: 'hertz', year: 1887, when: '1886–1888', who: 'Heinrich Hertz',
    discovery: 'Produced and detected radio waves; noticed UV light aided sparking (photoelectric effect).',
    evidence: 'Spark-gap transmitter and receiver; showed reflection, refraction, polarisation, speed ≈ c.',
    significance: 'Confirmed Maxwell’s predictions; enabled radio.',
    modelChange: 'EM-wave model of light experimentally established.', module: 7, thread: 'light',
  },
  {
    id: 'michelson-morley', year: 1887, when: '1887', who: 'Albert Michelson & Edward Morley',
    discovery: 'No detectable motion of Earth through the aether (null result).',
    evidence: 'Interferometer fringes did not shift as the apparatus rotated.',
    significance: 'Undermined the aether hypothesis; later consistent with Einstein’s constant c.',
    modelChange: 'Triggered attempts (Lorentz, FitzGerald) to explain the null result, then relativity.', module: 7, thread: 'relativity',
  },
  {
    id: 'thomson', year: 1897, when: '1897', who: 'J. J. Thomson',
    discovery: 'Cathode rays are negatively charged particles with a universal charge-to-mass ratio — the electron.',
    evidence: 'Deflection in crossed electric and magnetic fields.',
    significance: 'Atoms contain smaller particles.',
    modelChange: 'Indivisible-atom model replaced by the “plum pudding” model.', module: 8, thread: 'atom',
  },
  {
    id: 'planck', year: 1900, when: '1900', who: 'Max Planck',
    discovery: 'Blackbody spectrum explained by quantised oscillator energy E = hf.',
    evidence: 'Precise blackbody measurements (Lummer, Pringsheim, Rubens, Kurlbaum) disagreed with classical theory.',
    significance: 'Beginning of quantum theory; resolved the ultraviolet catastrophe.',
    modelChange: 'Energy exchange between matter and radiation is discrete.', module: 7, thread: 'light',
  },
  {
    id: 'einstein-1905', year: 1905, when: '1905', who: 'Albert Einstein',
    discovery: 'Photon explanation of the photoelectric effect; special relativity; E = mc².',
    evidence: 'Lenard’s photoelectric observations; Michelson–Morley null result; Maxwell’s equations.',
    significance: 'Light quanta (photons); time and space are relative; mass–energy equivalence.',
    modelChange: 'Absolute time abandoned; light treated as quanta as well as waves.', module: 7, thread: 'relativity',
  },
  {
    id: 'millikan', year: 1909, when: '1909–1913', who: 'Robert Millikan (with Harvey Fletcher)',
    discovery: 'Electric charge is quantised; e ≈ 1.6 × 10⁻¹⁹ C.',
    evidence: 'Oil drops suspended in an electric field carried integer multiples of e.',
    significance: 'With Thomson’s q/m, gave the electron mass.',
    modelChange: 'Confirmed the electron as a discrete particle with fixed charge.', module: 8, thread: 'atom',
  },
  {
    id: 'geiger-marsden', year: 1911, when: '1909–1911', who: 'Hans Geiger, Ernest Marsden; Ernest Rutherford',
    discovery: 'Large-angle alpha scattering → nuclear model of the atom.',
    evidence: '~1 in 8000 alphas scattered by more than 90° from gold foil.',
    significance: 'Atom is mostly empty space with a tiny massive nucleus.',
    modelChange: 'Plum-pudding model replaced by Rutherford’s nuclear model.', module: 8, thread: 'atom',
  },
  {
    id: 'bohr', year: 1913, when: '1913', who: 'Niels Bohr',
    discovery: 'Quantised electron energy levels in hydrogen; photon emission hf = ΔE.',
    evidence: 'Reproduced the Balmer/Rydberg formula for hydrogen’s spectrum.',
    significance: 'Explained atomic stability and line spectra for hydrogen.',
    modelChange: 'Nuclear model + quantisation; limited to one-electron atoms.', module: 8, thread: 'atom',
  },
  {
    id: 'leavitt-hubble', year: 1929, when: '1912–1929', who: 'Henrietta Leavitt; Vesto Slipher; Edwin Hubble & Milton Humason',
    discovery: 'Galaxies recede with velocity proportional to distance (v = H₀d).',
    evidence: 'Cepheid period–luminosity distances; spectral redshifts of galaxies.',
    significance: 'Evidence for an expanding Universe.',
    modelChange: 'Static universe abandoned; led towards the Big Bang model.', module: 8, thread: 'cosmos',
  },
  {
    id: 'de-broglie', year: 1924, when: '1924', who: 'Louis de Broglie',
    discovery: 'Matter has wave properties: λ = h/mv.',
    evidence: 'Theoretical symmetry argument; confirmed by electron diffraction (1927).',
    significance: 'Explained Bohr’s quantisation as standing waves.',
    modelChange: 'Particles acquire wave nature — wave–particle duality for matter.', module: 8, thread: 'atom',
  },
  {
    id: 'payne', year: 1925, when: '1925', who: 'Cecilia Payne-Gaposchkin',
    discovery: 'Stars are composed overwhelmingly of hydrogen and helium.',
    evidence: 'Applied ionisation theory to stellar spectral-line strengths.',
    significance: 'Showed spectral classes reflect temperature, not composition differences.',
    modelChange: 'Overturned the assumption that stars had Earth-like composition.', module: 8, thread: 'cosmos',
  },
  {
    id: 'heisenberg-schrodinger', year: 1926, when: '1925–1927', who: 'Werner Heisenberg; Erwin Schrödinger; Max Born',
    discovery: 'Quantum mechanics: matrix mechanics, the wave equation, probability interpretation, uncertainty principle.',
    evidence: 'Reproduced hydrogen spectrum and extended to multi-electron atoms.',
    significance: 'Current model of the atom.',
    modelChange: 'Definite orbits replaced by orbitals (probability distributions).', module: 8, thread: 'atom',
  },
  {
    id: 'davisson-germer', year: 1927, when: '1927', who: 'Clinton Davisson & Lester Germer; George Paget Thomson',
    discovery: 'Electron diffraction from crystals and thin foils.',
    evidence: 'Diffraction maxima at angles predicted by λ = h/mv.',
    significance: 'Confirmed de Broglie’s matter waves.',
    modelChange: 'Wave–particle duality established for matter.', module: 8, thread: 'atom',
  },
  {
    id: 'chadwick', year: 1932, when: '1932', who: 'James Chadwick',
    discovery: 'The neutron.',
    evidence: 'Neutral radiation from alpha–beryllium reactions ejected protons; momentum analysis gave m ≈ m_p.',
    significance: 'Explained isotopes and nuclear mass; enabled fission research.',
    modelChange: 'Nucleus = protons + neutrons.', module: 8, thread: 'nucleus',
  },
  {
    id: 'anderson', year: 1932, when: '1932–1936', who: 'Carl Anderson (positron, muon with Seth Neddermeyer)',
    discovery: 'Positron (antimatter) and muon in cosmic rays.',
    evidence: 'Cloud-chamber tracks curving in magnetic fields.',
    significance: 'Confirmed Dirac’s antimatter prediction; revealed particles beyond p, n, e.',
    modelChange: 'The particle “zoo” began to grow.', module: 8, thread: 'nucleus',
  },
  {
    id: 'bethe', year: 1938, when: '1938–1939', who: 'Hans Bethe (and Carl Friedrich von Weizsäcker)',
    discovery: 'Proton–proton chain and CNO cycle as stellar energy sources.',
    evidence: 'Nuclear reaction rates matched stellar luminosities and temperatures.',
    significance: 'Explained how stars shine.',
    modelChange: 'Stars powered by fusion, consistent with E = mc².', module: 8, thread: 'cosmos',
  },
  {
    id: 'fission', year: 1938, when: '1938–1939', who: 'Otto Hahn & Fritz Strassmann; Lise Meitner & Otto Frisch',
    discovery: 'Nuclear fission of uranium.',
    evidence: 'Barium found among products of neutron-irradiated uranium; Meitner and Frisch explained it as splitting.',
    significance: 'Led to nuclear reactors (and weapons).',
    modelChange: 'Heavy nuclei can split, releasing energy predicted by the binding-energy curve.', module: 8, thread: 'nucleus',
  },
  {
    id: 'cmb', year: 1965, when: '1965', who: 'Arno Penzias & Robert Wilson',
    discovery: 'Cosmic microwave background radiation.',
    evidence: 'Uniform microwave noise from all directions, matching a ~3 K blackbody.',
    significance: 'Strong evidence for a hot Big Bang.',
    modelChange: 'Big Bang model favoured over the steady-state model.', module: 8, thread: 'cosmos',
  },
  {
    id: 'quarks', year: 1968, when: '1964–1968', who: 'Murray Gell-Mann & George Zweig (theory); SLAC–MIT experiments',
    discovery: 'Quark model; deep inelastic scattering reveals point-like constituents in protons.',
    evidence: 'Electrons scattered through large angles from protons.',
    significance: 'Protons and neutrons are not fundamental.',
    modelChange: 'Hadrons understood as quark composites — basis of the Standard Model.', module: 8, thread: 'nucleus',
  },
  {
    id: 'hafele-keating', year: 1971, when: '1971', who: 'Joseph Hafele & Richard Keating',
    discovery: 'Time dilation measured with atomic clocks on aircraft.',
    evidence: 'Flown clocks differed from ground clocks as relativity predicted.',
    significance: 'Direct macroscopic test of time dilation.',
    modelChange: 'Strengthened confidence in special (and general) relativity.', module: 7, thread: 'relativity',
  },
  {
    id: 'higgs', year: 2012, when: '2012', who: 'ATLAS and CMS collaborations, CERN',
    discovery: 'Higgs boson observed at the Large Hadron Collider.',
    evidence: 'Excess of events near 125 GeV in multiple decay channels.',
    significance: 'Completed the Standard Model’s predicted particle content.',
    modelChange: 'Confirmed the mechanism giving mass to W and Z bosons; Standard Model still incomplete (gravity, dark matter).', module: 8, thread: 'nucleus',
  },
];

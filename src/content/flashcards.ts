import type { ModuleNo } from './formulas';
import { FORMULAS } from './formulas';
import { ALL_CONCEPTS } from './modules';

export interface Flashcard {
  id: string;
  module: ModuleNo;
  section: string;
  kind: 'definition' | 'formula' | 'fact' | 'misconception';
  front: string;
  /** back text; may contain LaTeX between $…$ */
  back: string;
  tex?: string;
}

const EXTRA: Flashcard[] = [
  { id: 'fc-x5-1', module: 5, section: 'm5-projectile', kind: 'fact', front: 'At the top of a projectile’s path, which velocity component is zero?', back: 'Only the vertical component v_y. The horizontal component is unchanged.' },
  { id: 'fc-x5-2', module: 5, section: 'm5-projectile', kind: 'fact', front: 'Which launch angle gives maximum range on level ground (no air resistance)?', back: '45°. Complementary angles (e.g. 30° and 60°) give equal ranges.' },
  { id: 'fc-x5-3', module: 5, section: 'm5-gravity', kind: 'fact', front: 'Altitude vs orbital radius?', back: 'Orbital radius r = planet radius + altitude. Always use r (centre to centre) in gravitation formulas.' },
  { id: 'fc-x5-4', module: 5, section: 'm5-gravity', kind: 'fact', front: 'Period and altitude of a geostationary orbit?', back: 'T = 1 sidereal day (≈ 23 h 56 min); r ≈ 4.22 × 10⁷ m, altitude ≈ 35 800 km, above the equator.' },
  { id: 'fc-x5-5', module: 5, section: 'm5-gravity', kind: 'fact', front: 'Why is gravitational potential energy negative?', back: 'Zero is defined at infinite separation; work must be done ON the object to move it there, so all bound positions have U < 0.' },
  { id: 'fc-x6-1', module: 6, section: 'm6-fields', kind: 'fact', front: 'Right-hand palm rule (positive charge)', back: 'Fingers = B, thumb = v (or conventional I), palm pushes = F. Reverse F for negative charges.' },
  { id: 'fc-x6-2', module: 6, section: 'm6-fields', kind: 'fact', front: 'Symbols ⊗ and ⊙ on a field diagram?', back: '⊗ = into the page (tail of an arrow); ⊙ = out of the page (tip of an arrow).' },
  { id: 'fc-x6-3', module: 6, section: 'm6-induction', kind: 'fact', front: 'Three ways to change magnetic flux', back: 'Change B, change the area A, or change the orientation θ (rotate the coil).' },
  { id: 'fc-x6-4', module: 6, section: 'm6-applications', kind: 'fact', front: 'Slip rings vs split-ring commutator', back: 'Slip rings: AC output (generators) — constant connection to each coil end. Split ring: reverses connections every half-turn — keeps DC motor torque in one direction / gives DC output from a generator.' },
  { id: 'fc-x6-5', module: 6, section: 'm6-induction', kind: 'fact', front: 'Why do transformers need AC?', back: 'Only a changing current produces a changing flux in the core, which induces an emf in the secondary.' },
  { id: 'fc-x7-1', module: 7, section: 'm7-spectrum', kind: 'fact', front: 'Order the EM spectrum by increasing frequency', back: 'Radio → microwave → infrared → visible → ultraviolet → X-ray → gamma.' },
  { id: 'fc-x7-2', module: 7, section: 'm7-quantum', kind: 'fact', front: 'Photoelectric effect: what does intensity control?', back: 'The number of photoelectrons per second (photocurrent) — NOT their maximum kinetic energy.' },
  { id: 'fc-x7-3', module: 7, section: 'm7-relativity', kind: 'fact', front: 'Who measures proper time?', back: 'The observer for whom both events happen at the same place (the clock’s rest frame).' },
  { id: 'fc-x7-4', module: 7, section: 'm7-relativity', kind: 'fact', front: 'Evidence for time dilation (list 3)', back: 'Cosmic-ray muons reaching Earth’s surface; Hafele–Keating atomic clocks; longer lifetimes of fast particles in accelerators (also cosmological supernova time-stretching).' },
  { id: 'fc-x7-5', module: 7, section: 'm7-wave', kind: 'fact', front: 'Interference vs diffraction', back: 'Diffraction: spreading of waves through an aperture/around an obstacle. Interference: superposition of waves from coherent sources producing maxima and minima.' },
  { id: 'fc-x8-1', module: 8, section: 'm8-origins', kind: 'fact', front: 'Spectral classes from hottest to coolest', back: 'O, B, A, F, G, K, M (“Oh Be A Fine Girl/Guy, Kiss Me”). The Sun is G2.' },
  { id: 'fc-x8-2', module: 8, section: 'm8-origins', kind: 'fact', front: 'H–R diagram axes', back: 'Vertical: luminosity (or absolute magnitude), logarithmic. Horizontal: surface temperature DECREASING to the right (or spectral class O→M).' },
  { id: 'fc-x8-3', module: 8, section: 'm8-nucleus', kind: 'fact', front: 'Alpha, beta, gamma: ionising ability and penetration', back: 'Ionising: α > β > γ. Penetration: γ > β > α (α stopped by paper, β by a few mm Al, γ reduced by thick lead).' },
  { id: 'fc-x8-4', module: 8, section: 'm8-deep', kind: 'fact', front: 'Quark charges', back: 'u, c, t: +⅔e. d, s, b: −⅓e. Antiquarks have opposite charges.' },
  { id: 'fc-x8-5', module: 8, section: 'm8-deep', kind: 'fact', front: 'Fundamental forces and carriers', back: 'Strong — gluons; electromagnetic — photon; weak — W⁺, W⁻, Z⁰; gravity — not in the Standard Model (hypothetical graviton).' },
  { id: 'fc-x8-6', module: 8, section: 'm8-structure', kind: 'fact', front: 'Who showed charge is quantised?', back: 'Millikan (oil-drop experiment, 1909–1913): all charges were integer multiples of 1.6 × 10⁻¹⁹ C.' },
];

/** Concept definition cards (exam-standard), formula cards and extra fact/misconception cards. */
export const FLASHCARDS: Flashcard[] = [
  ...ALL_CONCEPTS.map((c) => ({
    id: `fc-${c.id}`,
    module: Number(c.section[1]) as ModuleNo,
    section: c.section,
    kind: 'definition' as const,
    front: c.title,
    back: c.exam,
  })),
  ...FORMULAS.map((f) => ({
    id: `fc-f-${f.id}`,
    module: f.module,
    section: f.section,
    kind: 'formula' as const,
    front: `Formula: ${f.name}`,
    back: f.interpretation,
    tex: f.tex,
  })),
  ...ALL_CONCEPTS.filter((c) => c.misconception).map((c) => ({
    id: `fc-m-${c.id}`,
    module: Number(c.section[1]) as ModuleNo,
    section: c.section,
    kind: 'misconception' as const,
    front: `True or false? “${c.misconception!.wrong}”`,
    back: `False. ${c.misconception!.right}`,
  })),
  ...EXTRA,
];

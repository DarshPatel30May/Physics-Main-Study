/**
 * Visible spectral lines (air wavelengths, nm) from the NIST Atomic Spectra Database (strong lines;
 * relative strengths approximate, for display only).
 */
export const ELEMENT_LINES: Record<string, { name: string; lines: { nm: number; s: number }[] }> = {
  H: { name: 'Hydrogen', lines: [{ nm: 656.28, s: 1 }, { nm: 486.13, s: 0.6 }, { nm: 434.05, s: 0.35 }, { nm: 410.17, s: 0.2 }, { nm: 397.01, s: 0.12 }] },
  He: { name: 'Helium', lines: [{ nm: 388.86, s: 0.4 }, { nm: 447.15, s: 0.6 }, { nm: 471.31, s: 0.3 }, { nm: 492.19, s: 0.3 }, { nm: 501.57, s: 0.6 }, { nm: 587.56, s: 1 }, { nm: 667.82, s: 0.6 }, { nm: 706.52, s: 0.5 }] },
  Na: { name: 'Sodium', lines: [{ nm: 588.99, s: 1 }, { nm: 589.59, s: 0.9 }, { nm: 568.82, s: 0.15 }, { nm: 498.28, s: 0.1 }] },
  Hg: { name: 'Mercury', lines: [{ nm: 404.66, s: 0.6 }, { nm: 435.83, s: 1 }, { nm: 546.07, s: 0.9 }, { nm: 576.96, s: 0.5 }, { nm: 579.07, s: 0.5 }] },
  Ne: {
    name: 'Neon',
    lines: [585.25, 588.19, 594.48, 603.0, 607.43, 609.62, 614.31, 616.36, 621.73, 626.65, 633.44, 638.3, 640.22, 650.65, 659.9, 692.95, 703.24].map((nm, i) => ({ nm, s: i === 12 || i === 0 ? 1 : 0.55 })),
  },
};

/** Prominent Fraunhofer absorption lines in sunlight (A and B are due to O₂ in Earth's atmosphere). */
export const FRAUNHOFER = [
  { label: 'A', nm: 759.4, who: 'O₂ (terrestrial)' },
  { label: 'B', nm: 686.7, who: 'O₂ (terrestrial)' },
  { label: 'C', nm: 656.3, who: 'H (Hα)' },
  { label: 'D₁', nm: 589.6, who: 'Na' },
  { label: 'D₂', nm: 589.0, who: 'Na' },
  { label: 'E', nm: 527.0, who: 'Fe' },
  { label: 'b', nm: 518.4, who: 'Mg' },
  { label: 'F', nm: 486.1, who: 'H (Hβ)' },
  { label: 'G', nm: 430.8, who: 'Fe/CH' },
  { label: 'H', nm: 396.8, who: 'Ca⁺' },
  { label: 'K', nm: 393.4, who: 'Ca⁺' },
];

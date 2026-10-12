export interface Reference {
  org: string;
  title: string;
  url: string;
  use: string;
}

/**
 * Authoritative sources consulted. NESA pages moved to nsw.gov.au in 2024; if a link changes,
 * search the NESA site for “Physics Stage 6 syllabus”.
 */
export const REFERENCES: Reference[] = [
  { org: 'NESA', title: 'Physics Stage 6 Syllabus (2017)', url: 'https://www.nsw.gov.au/education-and-training/nesa/curriculum/science/physics-stage-6-2017', use: 'Authoritative content framework, inquiry questions and outcomes for the 2026 HSC.' },
  { org: 'NESA', title: 'Physics — assessment and reporting (exam specifications, formulae and data sheet)', url: 'https://www.nsw.gov.au/education-and-training/nesa/curriculum/science/physics-stage-6-2017/assessment-and-reporting', use: 'Exam structure; official formulae sheet, data sheet and periodic table.' },
  { org: 'NESA', title: 'HSC exam papers and marking guidelines (all courses)', url: 'https://www.nsw.gov.au/education-and-training/nesa/curriculum/hsc-exam-papers', use: 'Official past papers, marking guidelines and notes from the marking centre.' },
  { org: 'NIST', title: 'CODATA fundamental physical constants', url: 'https://physics.nist.gov/cuu/Constants/', use: 'Reference values for constants used beyond the data sheet (e.g. Boltzmann constant).' },
  { org: 'NIST', title: 'Atomic Spectra Database', url: 'https://www.nist.gov/pml/atomic-spectra-database', use: 'Wavelengths of spectral lines (H, He, Na, Hg).' },
  { org: 'NASA', title: 'Planetary Fact Sheet', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/', use: 'Planetary orbital radii and periods; Mars, Moon data.' },
  { org: 'NASA', title: 'Imagine the Universe — the electromagnetic spectrum', url: 'https://imagine.gsfc.nasa.gov/science/toolbox/emspectrum1.html', use: 'EM spectrum regions and applications.' },
  { org: 'ESA', title: 'Planck mission — cosmic microwave background', url: 'https://www.esa.int/Science_Exploration/Space_Science/Planck', use: 'CMB evidence for the Big Bang.' },
  { org: 'CERN', title: 'The Standard Model', url: 'https://home.cern/science/physics/standard-model', use: 'Particles, forces and accelerator evidence (Higgs boson).' },
  { org: 'IAEA', title: 'Nuclear Data Services (Live Chart of Nuclides)', url: 'https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html', use: 'Half-lives, decay modes and atomic masses (AME2020).' },
  { org: 'ANSTO', title: 'Nuclear medicine and the OPAL reactor', url: 'https://www.ansto.gov.au/', use: 'Australian applications of radioisotopes (Mo-99/Tc-99m).' },
  { org: 'CSIRO', title: 'Parkes radio telescope (Murriyang)', url: 'https://www.csiro.au/en/about/facilities-collections/atnf', use: 'Radio astronomy context for the EM spectrum.' },
  { org: 'Australian Synchrotron (ANSTO)', title: 'How the synchrotron works', url: 'https://www.ansto.gov.au/facilities/australian-synchrotron', use: 'Particle accelerator application in Australia.' },
  { org: 'Bureau of Meteorology', title: 'Satellite imagery (Himawari geostationary satellite)', url: 'http://www.bom.gov.au/australia/satellite/', use: 'Real-world geostationary satellite use.' },
];

/** NESA 2026 HSC Physics examination structure (from the published exam specifications). */
export const EXAM_SPEC = {
  totalMarks: 100,
  writingTime: '3 hours',
  readingTime: '5 minutes',
  sections: [
    { name: 'Section I', marks: 20, desc: 'Objective-response (multiple-choice) questions.' },
    { name: 'Section II', marks: 80, desc: 'Short-answer questions — approximately 20–25 items, some in parts; at least two items worth 7–9 marks.' },
  ],
  notes: [
    'Questions assess Modules 5–8 with approximately equal weighting.',
    'Working Scientifically skills are assessed throughout the paper, integrated with content.',
    'A formulae sheet, data sheet and periodic table are provided.',
  ],
};

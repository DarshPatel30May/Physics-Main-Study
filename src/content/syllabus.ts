/**
 * NSW Physics Stage 6 Syllabus (NESA, 2017) — Year 12 Modules 5–8.
 *
 * Inquiry questions are quoted verbatim from the syllabus (© NSW Education Standards Authority),
 * reproduced for study purposes with attribution. Content dot points are PARAPHRASED summaries,
 * not the official wording — always check the official syllabus document.
 */
import type { ModuleNo } from './formulas';

export interface DotPoint {
  id: string;
  /** paraphrased summary of the content requirement */
  text: string;
  /** relationships named in the dot point (LaTeX) */
  relationships?: string[];
  /** a practical investigation is required */
  practical?: boolean;
  sims: string[];
  formulas: string[];
}

export interface SyllabusSection {
  id: string;
  module: ModuleNo;
  title: string;
  /** exact NESA inquiry question */
  inquiry: string;
  dotPoints: DotPoint[];
}

export interface ModuleMeta {
  no: ModuleNo;
  id: 'm5' | 'm6' | 'm7' | 'm8';
  title: string;
  short: string;
  colour: 'm5' | 'm6' | 'm7' | 'm8';
  outcome: { code: string; text: string };
  /** paraphrase of the official content focus */
  focus: string;
  summary: string;
  objectives: string[];
}

export const SOURCE_NOTE =
  'Inquiry questions quoted from the NSW Physics Stage 6 Syllabus (2017) © NSW Education Standards Authority. Dot points are paraphrased for revision — refer to the official syllabus for the authoritative wording.';

export const WS_OUTCOMES = [
  { code: 'PH12-1', skill: 'Questioning and predicting', text: 'develops and evaluates questions and hypotheses for scientific investigation' },
  { code: 'PH12-2', skill: 'Planning investigations', text: 'designs and evaluates investigations in order to obtain primary and secondary data and information' },
  { code: 'PH12-3', skill: 'Conducting investigations', text: 'conducts investigations to collect valid and reliable primary and secondary data and information' },
  { code: 'PH12-4', skill: 'Processing data and information', text: 'selects and processes appropriate qualitative and quantitative data and information using a range of appropriate media' },
  { code: 'PH12-5', skill: 'Analysing data and information', text: 'analyses and evaluates primary and secondary data and information' },
  { code: 'PH12-6', skill: 'Problem solving', text: 'solves scientific problems using primary and secondary data, critical thinking skills and scientific processes' },
  { code: 'PH12-7', skill: 'Communicating', text: 'communicates scientific understanding using suitable language and terminology for a specific audience or purpose' },
];

export const MODULES: ModuleMeta[] = [
  {
    no: 5,
    id: 'm5',
    title: 'Advanced Mechanics',
    short: 'Projectiles, circular motion & gravity',
    colour: 'm5',
    outcome: {
      code: 'PH12-12',
      text: 'describes and analyses qualitatively and quantitatively circular motion and motion in a gravitational field, in particular, the projected motion of bodies on Earth and the orbital motion of bodies in space, including satellites',
    },
    focus:
      'Extends Newtonian mechanics into two dimensions. Students model projectiles by treating horizontal and vertical motion independently, analyse the net inward force needed for circular motion, and use Newton’s Law of Universal Gravitation and energy in radial fields to explain and predict the orbits of planets and satellites.',
    summary: 'How forces and energy explain the curved paths of thrown objects, cars on bends and satellites in orbit.',
    objectives: [
      'Resolve projectile motion into independent components and derive range, height and time of flight.',
      'Identify the real forces that provide the net centripetal force in different situations.',
      'Apply a_c = v²/r, F_c = mv²/r, v = 2πr/T, ω = Δθ/t and τ = rF sin θ.',
      'Use F = GMm/r² and g = GM/r² to predict forces and field strengths.',
      'Relate Kepler’s laws, orbital speed and period, and orbital energy (U = −GMm/r).',
      'Explain escape velocity and the energy required to change orbits.',
    ],
  },
  {
    no: 6,
    id: 'm6',
    title: 'Electromagnetism',
    short: 'Fields, motor effect & induction',
    colour: 'm6',
    outcome: {
      code: 'PH12-13',
      text: 'explains and analyses the electric and magnetic interactions due to charged particles and currents and evaluates their effect both qualitatively and quantitatively',
    },
    focus:
      'Examines how charged particles and current-carrying conductors interact with electric and magnetic fields. Students analyse forces and trajectories in uniform fields, the motor effect, Faraday’s and Lenz’s laws, transformers and power distribution, and the operation of motors and generators using conservation of energy.',
    summary: 'How electric and magnetic fields push charges and currents — and how moving magnets make electricity.',
    objectives: [
      'Analyse charged particles in uniform electric fields (E = V/d, F = qE, W = qV).',
      'Analyse charged particles in uniform magnetic fields (F = qvB sin θ) and compare with circular motion.',
      'Apply F = lIB sin θ and the force between parallel wires to define the ampere.',
      'Describe how flux changes (Φ = BA cos θ) and apply Faraday’s and Lenz’s laws.',
      'Analyse ideal and real transformers and high-voltage transmission.',
      'Explain DC motors, back emf, AC/DC generators, AC induction motors and magnetic braking.',
    ],
  },
  {
    no: 7,
    id: 'm7',
    title: 'The Nature of Light',
    short: 'EM waves, wave & quantum models, relativity',
    colour: 'm7',
    outcome: {
      code: 'PH12-14',
      text: 'describes and analyses evidence for the properties of light and evaluates the implications of this evidence for modern theories of physics in the contemporary world',
    },
    focus:
      'Traces how models of light changed in response to evidence: Maxwell’s electromagnetic theory, interference, diffraction and polarisation supporting a wave model, blackbody radiation and the photoelectric effect requiring quanta, and the constancy of the speed of light leading to special relativity.',
    summary: 'What light is — and how experiments forced physicists to rethink waves, particles, space and time.',
    objectives: [
      'Explain Maxwell’s unification of electricity and magnetism and his prediction of EM waves and c.',
      'Use spectra to identify elements and to infer stellar temperature, motion, density and composition.',
      'Analyse interference and diffraction using d sin θ = mλ, and polarisation using Malus’ law.',
      'Evaluate the evidence for Newton’s and Huygens’ models of light.',
      'Analyse blackbody radiation (Wien’s law) and the photoelectric effect (K_max = hf − φ).',
      'Apply Einstein’s postulates, time dilation, length contraction, relativistic momentum and E = mc².',
    ],
  },
  {
    no: 8,
    id: 'm8',
    title: 'From the Universe to the Atom',
    short: 'Stars, atoms, nuclei & particles',
    colour: 'm8',
    outcome: {
      code: 'PH12-15',
      text: 'explains and analyses the evidence supporting the relationship between astronomical events and the nucleosynthesis of atoms and relates these to the development of the current model of the atom',
    },
    focus:
      'Connects the formation of matter after the Big Bang and in stars with the experimental evidence for atomic structure. Students analyse stellar spectra and the H–R diagram, the discoveries of the electron, nucleus and neutron, quantised energy levels and matter waves, nuclear decay, fission and fusion, and the Standard Model.',
    summary: 'From the Big Bang and starlight to electrons, nuclei and quarks — and the evidence behind each model.',
    objectives: [
      'Describe how radiation became matter after the Big Bang and the evidence for expansion.',
      'Explain emission, absorption and continuous spectra; classify stars and use the H–R diagram.',
      'Describe the proton–proton chain and CNO cycle; relate E = mc² to stellar energy.',
      'Evaluate experiments revealing the electron (cathode rays, Thomson, Millikan), the nucleus and the neutron.',
      'Apply the Rydberg equation, E = hf and λ = h/mv; assess the Bohr model; describe Schrödinger’s contribution.',
      'Analyse radioactive decay and half-life; calculate energy from mass defect in fission and fusion.',
      'Describe the Standard Model and the role of particle accelerators.',
    ],
  },
];

export const SECTIONS: SyllabusSection[] = [
  /* ------------------------------ Module 5 ------------------------------ */
  {
    id: 'm5-projectile',
    module: 5,
    title: 'Projectile Motion',
    inquiry: 'How can models that are used to explain projectile motion be used to analyse and make predictions?',
    dotPoints: [
      {
        id: 'm5-pm-1',
        text: 'Analyse projectile motion by resolving it into horizontal and vertical components, assuming constant vertical acceleration due to gravity and no air resistance.',
        sims: ['projectile'],
        formulas: ['components', 'proj-dx', 'proj-dy', 'proj-vy'],
      },
      {
        id: 'm5-pm-2',
        text: 'Use the projectile model to derive quantitative relationships between initial velocity, launch angle, maximum height, time of flight, final velocity, launch height and horizontal range.',
        sims: ['projectile'],
        formulas: ['max-height', 'tof-level', 'level-range', 'proj-vy2'],
      },
      {
        id: 'm5-pm-3',
        text: 'Conduct a practical investigation collecting primary data to validate the derived projectile relationships.',
        practical: true,
        sims: ['projectile'],
        formulas: ['proj-dx', 'proj-dy'],
      },
      {
        id: 'm5-pm-4',
        text: 'Solve problems, build models and make quantitative predictions using the equations of motion for uniformly accelerated and constant rectilinear motion.',
        relationships: ['v = u + at', 's = ut + \\tfrac12 at^2', 'v^2 = u^2 + 2as'],
        sims: ['projectile'],
        formulas: ['suvat-v', 'suvat-s', 'suvat-v2'],
      },
    ],
  },
  {
    id: 'm5-circular',
    module: 5,
    title: 'Circular Motion',
    inquiry: 'Why do objects move in circles?',
    dotPoints: [
      {
        id: 'm5-cm-1',
        text: 'Investigate and evaluate how centripetal force, mass, speed and radius are related for an object in uniform circular motion.',
        practical: true,
        sims: ['circular'],
        formulas: ['Fc'],
      },
      {
        id: 'm5-cm-2',
        text: 'Analyse the forces on objects in uniform circular motion — e.g. cars on flat bends, masses on strings and objects on banked tracks.',
        sims: ['circular'],
        formulas: ['Fc', 'banked'],
      },
      {
        id: 'm5-cm-3',
        text: 'Solve problems and make quantitative predictions about uniform circular motion using the stated relationships.',
        relationships: ['a_c = \\dfrac{v^2}{r}', 'v = \\dfrac{2\\pi r}{T}', 'F_c = \\dfrac{mv^2}{r}', '\\omega = \\dfrac{\\Delta\\theta}{t}'],
        sims: ['circular'],
        formulas: ['ac', 'v-period', 'Fc', 'omega', 'v-omega'],
      },
      {
        id: 'm5-cm-4',
        text: 'Investigate the relationship between total energy and the work done on an object in uniform circular motion.',
        sims: ['circular'],
        formulas: ['work', 'ke'],
      },
      {
        id: 'm5-cm-5',
        text: 'Investigate how the rotation of mechanical systems relates to the applied torque.',
        relationships: ['\\tau = r_{\\perp}F = rF\\sin\\theta'],
        sims: ['torque'],
        formulas: ['torque'],
      },
    ],
  },
  {
    id: 'm5-gravity',
    module: 5,
    title: 'Motion in Gravitational Fields',
    inquiry: 'How does the force of gravity determine the motion of planets and satellites?',
    dotPoints: [
      {
        id: 'm5-gf-1',
        text: 'Apply Newton’s Law of Universal Gravitation to find the force between two objects, investigate factors affecting gravitational field strength, and predict field strength at any point, including at a planet’s surface.',
        relationships: ['F = \\dfrac{GMm}{r^2}', 'g = \\dfrac{GM}{r^2}'],
        sims: ['gravity-field'],
        formulas: ['grav-F', 'grav-g'],
      },
      {
        id: 'm5-gf-2',
        text: 'Investigate the orbits of planets and artificial satellites using the relationships between gravitational force, centripetal force and acceleration, mass, orbital radius, orbital velocity and period.',
        sims: ['orbits', 'satellites'],
        formulas: ['orbital-v', 'v-period', 'Fc'],
      },
      {
        id: 'm5-gf-3',
        text: 'Predict orbital properties of planets and satellites — including near-Earth and geostationary orbits — and relate them to their uses.',
        sims: ['satellites'],
        formulas: ['kepler3', 'orbital-v'],
      },
      {
        id: 'm5-gf-4',
        text: 'Investigate how Kepler’s Laws relate to the forces on, and total energy of, planets in circular and non-circular orbits.',
        relationships: ['v = \\dfrac{2\\pi r}{T}', '\\dfrac{r^3}{T^2} = \\dfrac{GM}{4\\pi^2}'],
        sims: ['orbits', 'kepler'],
        formulas: ['kepler3', 'v-period'],
      },
      {
        id: 'm5-gf-5',
        text: 'Derive and apply gravitational force and potential energy in radial fields: escape velocity, potential and total energy of an orbiting body, energy changes between orbits, and Kepler’s Laws.',
        relationships: ['v_{esc} = \\sqrt{\\dfrac{2GM}{r}}', 'U = -\\dfrac{GMm}{r}', 'U + K = -\\dfrac{GMm}{2r}'],
        sims: ['escape', 'orbits'],
        formulas: ['escape', 'grav-U', 'orbit-E'],
      },
    ],
  },

  /* ------------------------------ Module 6 ------------------------------ */
  {
    id: 'm6-fields',
    module: 6,
    title: 'Charged Particles, Conductors and Electric and Magnetic Fields',
    inquiry: 'What happens to stationary and moving charged particles when they interact with an electric or magnetic field?',
    dotPoints: [
      {
        id: 'm6-cp-1',
        text: 'Investigate and quantitatively analyse charged particles in uniform electric fields: the field between parallel plates, acceleration of the charge, and the work done on it.',
        relationships: ['E = \\dfrac{V}{d}', 'F = qE', 'W = qV', 'W = qEd', 'K = \\tfrac12 mv^2'],
        sims: ['field-lab'],
        formulas: ['E-Vd', 'F-qE', 'W-qV', 'ke'],
      },
      {
        id: 'm6-cp-2',
        text: 'Model the trajectories of charged particles in electric fields and compare them with projectiles in a gravitational field.',
        sims: ['field-lab', 'projectile'],
        formulas: ['F-qE', 'proj-dy'],
      },
      {
        id: 'm6-cp-3',
        text: 'Analyse charged particles in uniform magnetic fields, including acceleration perpendicular to the field and the force on the charge.',
        relationships: ['F = qv_{\\perp}B = qvB\\sin\\theta'],
        sims: ['field-lab'],
        formulas: ['F-qvB', 'r-mvqB'],
      },
      {
        id: 'm6-cp-4',
        text: 'Compare charged particles moving in magnetic fields with charges in electric fields and with other examples of uniform circular motion.',
        sims: ['field-lab', 'circular'],
        formulas: ['r-mvqB', 'Fc', 'selector'],
      },
    ],
  },
  {
    id: 'm6-motor',
    module: 6,
    title: 'The Motor Effect',
    inquiry: 'Under what circumstances is a force produced on a current-carrying conductor in a magnetic field?',
    dotPoints: [
      {
        id: 'm6-me-1',
        text: 'Investigate the force on a current-carrying conductor in a uniform magnetic field to establish when the force is maximum, when it is zero, and how the directions of force, field and current are related.',
        relationships: ['F = lI_{\\perp}B = lIB\\sin\\theta'],
        sims: ['motor-effect'],
        formulas: ['F-lIB'],
      },
      {
        id: 'm6-me-2',
        text: 'Conduct a quantitative investigation of the interaction between two parallel current-carrying wires.',
        practical: true,
        sims: ['parallel-wires'],
        formulas: ['parallel-wires'],
      },
      {
        id: 'm6-me-3',
        text: 'Analyse the force between parallel current-carrying wires and relate it to the SI definition of the ampere and to Newton’s Third Law.',
        relationships: ['\\dfrac{F}{l} = \\dfrac{\\mu_0 I_1 I_2}{2\\pi r}'],
        sims: ['parallel-wires'],
        formulas: ['parallel-wires', 'B-wire'],
      },
    ],
  },
  {
    id: 'm6-induction',
    module: 6,
    title: 'Electromagnetic Induction',
    inquiry: 'How are electric and magnetic fields related?',
    dotPoints: [
      {
        id: 'm6-ei-1',
        text: 'Describe how magnetic flux can change.',
        relationships: ['\\Phi = B_{\\parallel}A = BA\\cos\\theta'],
        sims: ['induction'],
        formulas: ['flux'],
      },
      {
        id: 'm6-ei-2',
        text: 'Analyse examples of Faraday’s and Lenz’s laws with reference to energy transfers — emf from relative motion of magnets, straight conductors, metal plates and solenoids, and from relative movement or changing current in a nearby circuit.',
        relationships: ['\\varepsilon = -N\\dfrac{\\Delta\\Phi}{\\Delta t}'],
        sims: ['induction', 'machines'],
        formulas: ['faraday', 'flux'],
      },
      {
        id: 'm6-ei-3',
        text: 'Analyse quantitatively the operation of ideal transformers.',
        relationships: ['\\dfrac{V_p}{V_s} = \\dfrac{N_p}{N_s}', 'V_pI_p = V_sI_s'],
        sims: ['transformer'],
        formulas: ['transformer-V', 'transformer-P'],
      },
      {
        id: 'm6-ei-4',
        text: 'Evaluate the limitations of the ideal transformer model and strategies to improve efficiency, including incomplete flux linkage, resistive heating and eddy currents.',
        sims: ['transformer'],
        formulas: ['efficiency', 'power-loss'],
      },
      {
        id: 'm6-ei-5',
        text: 'Analyse applications of step-up and step-down transformers, including energy distribution by high-voltage transmission lines.',
        sims: ['transformer'],
        formulas: ['power-VI', 'power-loss', 'transformer-V'],
      },
    ],
  },
  {
    id: 'm6-applications',
    module: 6,
    title: 'Applications of the Motor Effect',
    inquiry: 'How has knowledge about the Motor Effect been applied to technological advances?',
    dotPoints: [
      {
        id: 'm6-am-1',
        text: 'Investigate a simple DC motor: the function of its components, production of torque and the effects of back emf.',
        relationships: ['\\tau = nIA_{\\perp}B = nIAB\\sin\\theta'],
        sims: ['machines'],
        formulas: ['coil-torque'],
      },
      {
        id: 'm6-am-2',
        text: 'Analyse the operation of simple DC and AC generators and AC induction motors.',
        sims: ['machines'],
        formulas: ['faraday', 'flux'],
      },
      {
        id: 'm6-am-3',
        text: 'Relate Lenz’s Law to conservation of energy and apply energy conservation to DC motors and magnetic braking.',
        sims: ['machines', 'induction'],
        formulas: ['faraday', 'power-VI'],
      },
    ],
  },

  /* ------------------------------ Module 7 ------------------------------ */
  {
    id: 'm7-spectrum',
    module: 7,
    title: 'Electromagnetic Spectrum',
    inquiry: 'What is light?',
    dotPoints: [
      {
        id: 'm7-em-1',
        text: 'Investigate Maxwell’s contribution to classical electromagnetism: unifying electricity and magnetism, predicting electromagnetic waves and predicting their speed.',
        sims: ['spectrum'],
        formulas: ['wave-eq'],
      },
      {
        id: 'm7-em-2',
        text: 'Describe how electromagnetic waves are produced and propagate, relating this qualitatively to Maxwell’s predictions.',
        sims: ['spectrum'],
        formulas: ['wave-eq'],
      },
      {
        id: 'm7-em-3',
        text: 'Investigate historical and contemporary methods of measuring the speed of light, and its present role in defining time and distance.',
        practical: true,
        sims: ['speed-of-light'],
        formulas: ['wave-eq'],
      },
      {
        id: 'm7-em-4',
        text: 'Investigate spectra produced by discharge tubes, reflected sunlight and incandescent filaments.',
        practical: true,
        sims: ['spectroscopy'],
        formulas: ['E-hc-lambda'],
      },
      {
        id: 'm7-em-5',
        text: 'Investigate how spectroscopy identifies elements.',
        sims: ['spectroscopy'],
        formulas: ['E-hc-lambda'],
      },
      {
        id: 'm7-em-6',
        text: 'Investigate how stellar spectra reveal surface temperature, rotational and translational velocity, density and chemical composition.',
        sims: ['spectroscopy', 'blackbody'],
        formulas: ['wien'],
      },
    ],
  },
  {
    id: 'm7-wave',
    module: 7,
    title: 'Light: Wave Model',
    inquiry: 'What evidence supports the classical wave model of light and what predictions can be made using this model?',
    dotPoints: [
      {
        id: 'm7-wm-1',
        text: 'Conduct investigations to analyse the diffraction of light qualitatively.',
        practical: true,
        sims: ['single-slit'],
        formulas: [],
      },
      {
        id: 'm7-wm-2',
        text: 'Conduct investigations to analyse interference of light qualitatively and quantitatively using double slits and diffraction gratings.',
        practical: true,
        relationships: ['d\\sin\\theta = m\\lambda'],
        sims: ['double-slit', 'grating'],
        formulas: ['grating', 'fringe-spacing'],
      },
      {
        id: 'm7-wm-3',
        text: 'Analyse the experimental evidence that supported the models of light proposed by Newton and Huygens.',
        sims: ['newton-huygens'],
        formulas: [],
      },
      {
        id: 'm7-wm-4',
        text: 'Conduct quantitative investigations of plane polarisation using Malus’ Law and evaluate the significance of polarisation for the model of light.',
        practical: true,
        relationships: ['I = I_{max}\\cos^2\\theta'],
        sims: ['polarisation'],
        formulas: ['malus'],
      },
    ],
  },
  {
    id: 'm7-quantum',
    module: 7,
    title: 'Light: Quantum Model',
    inquiry: 'What evidence supports the particle model of light and what are the implications of this evidence for the development of the quantum model of light?',
    dotPoints: [
      {
        id: 'm7-qm-1',
        text: 'Analyse the experimental evidence about blackbody radiation, including Wien’s Law and Planck’s contribution to a changed model of light.',
        relationships: ['\\lambda_{max} = \\dfrac{b}{T}'],
        sims: ['blackbody'],
        formulas: ['wien', 'E-hf'],
      },
      {
        id: 'm7-qm-2',
        text: 'Investigate the photoelectric-effect evidence that was inconsistent with the wave model of light.',
        practical: true,
        sims: ['photoelectric'],
        formulas: ['photoelectric'],
      },
      {
        id: 'm7-qm-3',
        text: 'Analyse the photoelectric effect in metals using conservation of energy and the photon model of light.',
        relationships: ['K_{max} = hf - \\phi'],
        sims: ['photoelectric'],
        formulas: ['photoelectric', 'E-hf', 'stopping'],
      },
    ],
  },
  {
    id: 'm7-relativity',
    module: 7,
    title: 'Light and Special Relativity',
    inquiry: 'How does the behaviour of light affect concepts of time, space and matter?',
    dotPoints: [
      {
        id: 'm7-sr-1',
        text: 'Analyse and evaluate the evidence confirming or denying Einstein’s two postulates: the speed of light in vacuum is an absolute constant, and all inertial frames of reference are equivalent.',
        sims: ['michelson', 'relativity'],
        formulas: [],
      },
      {
        id: 'm7-sr-2',
        text: 'Investigate evidence from thought experiments and experimental validation for time dilation and length contraction, and analyse situations such as cosmic-ray muons, atomic clocks (Hafele–Keating), particle accelerators and cosmological observations.',
        relationships: ['t = \\dfrac{t_0}{\\sqrt{1 - \\frac{v^2}{c^2}}}', 'l = l_0\\sqrt{1 - \\frac{v^2}{c^2}}'],
        sims: ['relativity'],
        formulas: ['time-dilation', 'length-contraction', 'gamma'],
      },
      {
        id: 'm7-sr-3',
        text: 'Describe the consequences and applications of relativistic momentum, including why massive objects cannot reach the speed of light.',
        relationships: ['p_v = \\dfrac{m_0 v}{\\sqrt{1 - \\frac{v^2}{c^2}}}'],
        sims: ['relativity'],
        formulas: ['rel-momentum'],
      },
      {
        id: 'm7-sr-4',
        text: 'Use E = mc² to calculate energy released when mass is converted to energy — e.g. the Sun, particle–antiparticle annihilation and combustion of conventional fuels.',
        relationships: ['E = mc^2'],
        sims: ['relativity'],
        formulas: ['emc2'],
      },
    ],
  },

  /* ------------------------------ Module 8 ------------------------------ */
  {
    id: 'm8-origins',
    module: 8,
    title: 'Origins of the Elements',
    inquiry: 'What evidence is there for the origins of the elements?',
    dotPoints: [
      {
        id: 'm8-oe-1',
        text: 'Investigate the processes that transformed radiation into matter after the Big Bang.',
        sims: ['big-bang'],
        formulas: ['emc2'],
      },
      {
        id: 'm8-oe-2',
        text: 'Investigate the evidence that led Hubble to the discovery of the expansion of the Universe.',
        sims: ['big-bang', 'spectroscopy'],
        formulas: ['hubble'],
      },
      {
        id: 'm8-oe-3',
        text: 'Analyse and apply Einstein’s mass–energy equivalence and relate it to nuclear reactions in stars.',
        sims: ['nucleosynthesis'],
        formulas: ['emc2', 'binding-u'],
      },
      {
        id: 'm8-oe-4',
        text: 'Account for emission and absorption spectra and compare them with a continuous blackbody spectrum.',
        sims: ['stellar-spectra', 'blackbody'],
        formulas: ['E-hc-lambda', 'wien'],
      },
      {
        id: 'm8-oe-5',
        text: 'Investigate the key features of stellar spectra and how they are used to classify stars.',
        sims: ['stellar-spectra'],
        formulas: ['wien'],
      },
      {
        id: 'm8-oe-6',
        text: 'Investigate the Hertzsprung–Russell diagram and use it to determine a star’s characteristics and evolutionary stage, surface temperature, colour and luminosity.',
        sims: ['hr-diagram'],
        formulas: ['wien'],
      },
      {
        id: 'm8-oe-7',
        text: 'Investigate nucleosynthesis reactions in Main Sequence and post-Main Sequence stars, including the proton–proton chain and the CNO cycle.',
        sims: ['nucleosynthesis'],
        formulas: ['binding-u'],
      },
    ],
  },
  {
    id: 'm8-structure',
    module: 8,
    title: 'Structure of the Atom',
    inquiry: 'How is it known that atoms are made up of protons, neutrons and electrons?',
    dotPoints: [
      {
        id: 'm8-sa-1',
        text: 'Investigate, assess and model the experimental evidence for the existence and properties of the electron: early cathode-ray experiments, Thomson’s charge-to-mass experiment and Millikan’s oil-drop experiment.',
        sims: ['cathode-rays', 'millikan'],
        formulas: ['thomson', 'millikan', 'selector'],
      },
      {
        id: 'm8-sa-2',
        text: 'Investigate, assess and model the evidence for the nuclear model of the atom: the Geiger–Marsden experiment, Rutherford’s atomic model and Chadwick’s discovery of the neutron.',
        sims: ['rutherford', 'atomic-models'],
        formulas: [],
      },
    ],
  },
  {
    id: 'm8-quantum',
    module: 8,
    title: 'Quantum Mechanical Nature of the Atom',
    inquiry: 'How is it known that classical physics cannot explain the properties of the atom?',
    dotPoints: [
      {
        id: 'm8-qa-1',
        text: 'Assess the limitations of the Rutherford and Bohr atomic models.',
        sims: ['atomic-models'],
        formulas: [],
      },
      {
        id: 'm8-qa-2',
        text: 'Investigate line emission spectra to examine the Balmer series in hydrogen.',
        practical: true,
        sims: ['hydrogen'],
        formulas: ['rydberg'],
      },
      {
        id: 'm8-qa-3',
        text: 'Relate the quantised energy levels of hydrogen and conservation of energy to its line emission spectrum.',
        relationships: ['E = hf', 'E = \\dfrac{hc}{\\lambda}', '\\dfrac{1}{\\lambda} = R\\left(\\dfrac{1}{n_f^2} - \\dfrac{1}{n_i^2}\\right)'],
        sims: ['hydrogen'],
        formulas: ['rydberg', 'E-hf', 'E-hc-lambda', 'bohr-levels'],
      },
      {
        id: 'm8-qa-4',
        text: 'Investigate de Broglie’s matter waves and the experimental evidence that developed the relationship λ = h/mv.',
        relationships: ['\\lambda = \\dfrac{h}{mv}'],
        sims: ['matter-waves'],
        formulas: ['debroglie'],
      },
      {
        id: 'm8-qa-5',
        text: 'Analyse Schrödinger’s contribution to the current model of the atom.',
        sims: ['quantum-atom'],
        formulas: [],
      },
    ],
  },
  {
    id: 'm8-nucleus',
    module: 8,
    title: 'Properties of the Nucleus',
    inquiry: 'How can the energy of the atomic nucleus be harnessed?',
    dotPoints: [
      {
        id: 'm8-pn-1',
        text: 'Analyse the spontaneous decay of unstable nuclei and the properties of the alpha, beta and gamma radiation emitted.',
        sims: ['decay', 'nuclear-lab'],
        formulas: [],
      },
      {
        id: 'm8-pn-2',
        text: 'Examine the half-life model of radioactive decay and make quantitative predictions about the activity or amount of a sample.',
        relationships: ['N_t = N_0e^{-\\lambda t}', '\\lambda = \\dfrac{\\ln 2}{t_{1/2}}'],
        sims: ['decay'],
        formulas: ['decay', 'half-life', 'activity'],
      },
      {
        id: 'm8-pn-3',
        text: 'Model and explain nuclear fission, including controlled and uncontrolled chain reactions, and account for the energy released.',
        sims: ['fission-fusion'],
        formulas: ['binding-u', 'emc2'],
      },
      {
        id: 'm8-pn-4',
        text: 'Analyse relationships representing conservation of mass–energy in spontaneous and artificial nuclear transmutations: alpha decay, induced reactions, fission and fusion.',
        sims: ['nuclear-lab', 'fission-fusion'],
        formulas: ['binding-u', 'mass-defect'],
      },
      {
        id: 'm8-pn-5',
        text: 'Account for the release of energy in nuclear fusion.',
        sims: ['fission-fusion', 'nuclear-lab'],
        formulas: ['binding-u'],
      },
      {
        id: 'm8-pn-6',
        text: 'Predict the energy released in nuclear decays and transmutations (including fission and fusion) using conservation of energy, mass defect, binding energy and E = mc².',
        relationships: ['E = mc^2'],
        sims: ['nuclear-lab'],
        formulas: ['mass-defect', 'binding-u', 'emc2'],
      },
    ],
  },
  {
    id: 'm8-deep',
    module: 8,
    title: 'Deep Inside the Atom',
    inquiry: 'How is it known that human understanding of matter is still incomplete?',
    dotPoints: [
      {
        id: 'm8-da-1',
        text: 'Analyse evidence suggesting that protons and neutrons are not fundamental, and that subatomic particles other than protons, neutrons and electrons exist.',
        sims: ['particles'],
        formulas: [],
      },
      {
        id: 'm8-da-2',
        text: 'Investigate the Standard Model of matter: quarks and the quark composition of hadrons, leptons, and the fundamental forces.',
        sims: ['particles'],
        formulas: [],
      },
      {
        id: 'm8-da-3',
        text: 'Investigate how particle accelerators work and their role in obtaining evidence that tests or validates theories, including the Standard Model.',
        sims: ['particles'],
        formulas: ['emc2', 'r-mvqB'],
      },
    ],
  },
];

export const ALL_DOT_POINTS = SECTIONS.flatMap((s) => s.dotPoints.map((d) => ({ ...d, section: s.id, module: s.module })));
export const sectionsFor = (m: ModuleNo) => SECTIONS.filter((s) => s.module === m);
export const moduleMeta = (m: ModuleNo | string) => MODULES.find((x) => x.no === m || x.id === m);
export const sectionById = (id: string) => SECTIONS.find((s) => s.id === id);

import { PLANETS } from '@/lib/physics/mechanics';

/**
 * Virtual investigations for the Working Scientifically centre. Simulated data are generated
 * from the physical model plus clearly-labelled random measurement error — they are NOT real
 * experimental results.
 */
export interface Investigation {
  id: string;
  title: string;
  module: 5 | 6 | 7 | 8;
  dotPoints: string[];
  question: string;
  hypothesis: string;
  variables: { independent: string; dependent: string; controlled: string[] };
  equipment: string[];
  method: string[];
  risks: { hazard: string; control: string }[];
  expected: string;
  table: { x: string; y: string; xUnit: string; yUnit: string };
  /** x values used for the simulated data */
  xs: number[];
  /** model value of y at x */
  model: (x: number) => number;
  /** relative standard deviation of simulated random error */
  noise: number;
  /** real secondary data (overrides simulated data) with its source */
  data?: { points: [number, number][]; source: string };
  /** graph to draw: transformation for linearisation */
  linearise: { xLabel: string; fx: (x: number) => number; yLabel?: string; fy?: (y: number) => number; gradientMeaning: string };
  analysis: string;
  conclusion: string;
  limitations: string[];
  improvements: string[];
}

export const INVESTIGATIONS: Investigation[] = [
  {
    id: 'inv-projectile',
    title: 'Projectile range vs launch angle',
    module: 5,
    dotPoints: ['m5-pm-3'],
    question: 'How does launch angle affect the horizontal range of a projectile launched at constant speed on level ground?',
    hypothesis: 'If launch angle is varied, range will follow R = u² sin 2θ/g, peaking at 45°.',
    variables: { independent: 'Launch angle θ (°)', dependent: 'Horizontal range R (m)', controlled: ['Launcher setting (launch speed)', 'Launch and landing height', 'Ball mass and size'] },
    equipment: ['Spring projectile launcher with protractor', 'Ball', 'Carbon paper and A3 paper', 'Tape measure', 'Video camera or light gate (to measure u)'],
    method: ['Measure launch speed with a light gate at the muzzle.', 'Set angle; launch onto carbon paper; record range from launch point.', 'Repeat three times per angle; average.', 'Repeat for 15°–75° in 10° steps.'],
    risks: [{ hazard: 'Projectile striking a person', control: 'Clear the firing zone; wear safety glasses; never aim at people.' }],
    expected: 'Range increases to a maximum near 45° then decreases; complementary angles give similar ranges.',
    table: { x: 'θ', y: 'R', xUnit: '°', yUnit: 'm' },
    xs: [15, 25, 35, 45, 55, 65, 75],
    model: (x) => (6.0 ** 2 * Math.sin((2 * x * Math.PI) / 180)) / 9.8,
    noise: 0.03,
    linearise: { xLabel: 'sin 2θ', fx: (x) => Math.sin((2 * x * Math.PI) / 180), gradientMeaning: 'Gradient = u²/g → u = √(g × gradient).' },
    analysis: 'Plot R against sin 2θ. A straight line through the origin supports the model; the gradient gives u²/g.',
    conclusion: 'The relationship is linear with gradient ≈ 3.67 m (u ≈ 6.0 m s⁻¹), supporting the ideal projectile model within uncertainty.',
    limitations: ['Air resistance shortens ranges slightly (systematic).', 'Launch point slightly above landing surface.', 'Variation in launcher speed (random).'],
    improvements: ['Measure u for every launch.', 'Use video analysis for range and angle.', 'Increase repeats to reduce random error.'],
  },
  {
    id: 'inv-centripetal',
    title: 'Centripetal force vs speed (whirling bung)',
    module: 5,
    dotPoints: ['m5-cm-1'],
    question: 'How does the centripetal force needed to keep a mass in circular motion depend on its speed?',
    hypothesis: 'If radius and mass are constant, F_c will be proportional to v² (F_c = mv²/r).',
    variables: { independent: 'Hanging weight F (N)', dependent: 'Speed v (m s⁻¹), from period', controlled: ['Bung mass (0.020 kg)', 'Radius (0.50 m)', 'Same string'] },
    equipment: ['Rubber bung on string', 'Glass/plastic tube', 'Slotted masses', 'Paper clip marker', 'Stopwatch or phone video'],
    method: ['Set radius with the paper clip.', 'Hang a known weight; whirl so the clip stays just below the tube.', 'Time 20 revolutions; T = time/20; v = 2πr/T.', 'Repeat for five different hanging weights.'],
    risks: [{ hazard: 'Bung flying off', control: 'Check knots; safety glasses; clear space.' }],
    expected: 'Larger hanging weights require faster rotation.',
    table: { x: 'F', y: 'v²', xUnit: 'N', yUnit: 'm² s⁻²' },
    xs: [0.2, 0.4, 0.6, 0.8, 1.0],
    model: (F) => (F * 0.5) / 0.02,
    noise: 0.05,
    linearise: { xLabel: 'F (N)', fx: (x) => x, gradientMeaning: 'Gradient of v² vs F = r/m.' },
    analysis: 'Plot v² against F; a straight line through the origin shows F ∝ v². Gradient = r/m = 25 m kg⁻¹.',
    conclusion: 'Linear relationship confirms F_c = mv²/r.',
    limitations: ['String not horizontal (bung’s weight).', 'Friction at the tube.', 'Reaction time in timing.'],
    improvements: ['Time more revolutions.', 'Use a lighter bung relative to hanging mass.', 'Use video analysis.'],
  },
  {
    id: 'inv-orbits',
    title: 'Kepler’s third law with planetary data (secondary data)',
    module: 5,
    dotPoints: ['m5-gf-4'],
    question: 'Do the planets of the Solar System obey r³ ∝ T²?',
    hypothesis: 'If gravity provides the centripetal force, r³/T² will be constant for all planets.',
    variables: { independent: 'T² (y²)', dependent: 'r³ (AU³)', controlled: ['Same central body (Sun)'] },
    equipment: ['NASA Planetary Fact Sheet data', 'Spreadsheet'],
    method: ['Collect semi-major axis and orbital period for each planet.', 'Calculate T² and r³.', 'Plot r³ vs T².'],
    risks: [{ hazard: 'None (secondary data)', control: 'Use reliable sources (NASA) and cite them.' }],
    expected: 'A straight line through the origin with gradient 1 AU³ y⁻².',
    table: { x: 'T²', y: 'r³', xUnit: 'y²', yUnit: 'AU³' },
    xs: PLANETS.map((p) => p.T * p.T),
    model: (x) => x,
    noise: 0.0,
    data: { points: PLANETS.map((p) => [p.T * p.T, p.a ** 3] as [number, number]), source: 'NASA Planetary Fact Sheet (semi-major axis, sidereal period)' },
    linearise: { xLabel: 'T² (y²)', fx: (x) => x, gradientMeaning: 'Gradient = GM_Sun/4π² (in AU³ y⁻² this is 1).' },
    analysis: 'A straight-line fit through the origin with gradient ≈ 1 shows r³/T² is constant.',
    conclusion: 'Kepler’s third law holds for the planets.',
    limitations: ['Uses rounded published values.', 'Assumes planet mass ≪ Sun mass.'],
    improvements: ['Include dwarf planets/moons of Jupiter to test generality.'],
  },
  {
    id: 'inv-wires',
    title: 'Force between parallel wires vs current',
    module: 6,
    dotPoints: ['m6-me-2'],
    question: 'How does the force between two parallel current-carrying wires depend on the current (same current in both)?',
    hypothesis: 'If separation and length are constant, F will be proportional to I² (F = μ₀I²l/2πr).',
    variables: { independent: 'Current I (A)', dependent: 'Force F (N), from balance reading', controlled: ['Separation r = 0.010 m', 'Wire length l = 0.30 m', 'Same wires'] },
    equipment: ['Two straight conductors', 'Electronic balance (0.001 g)', 'Low-voltage high-current supply', 'Ammeter', 'Rheostat'],
    method: ['Place one wire on the balance and fix the other directly above.', 'Zero the balance; switch on briefly; record mass change.', 'Convert to force (F = Δm g).', 'Repeat for currents 2–10 A.'],
    risks: [{ hazard: 'Wires overheating / burns', control: 'Short current pulses; allow cooling; do not touch wires.' }],
    expected: 'Force increases rapidly with current; reversing one current reverses the force direction.',
    table: { x: 'I', y: 'F', xUnit: 'A', yUnit: 'N' },
    xs: [2, 4, 6, 8, 10],
    model: (I) => (4e-7 * Math.PI * I * I * 0.3) / (2 * Math.PI * 0.01),
    noise: 0.06,
    linearise: { xLabel: 'I² (A²)', fx: (x) => x * x, gradientMeaning: 'Gradient = μ₀l/(2πr) → μ₀ = 2πr × gradient / l.' },
    analysis: 'Plot F against I²; a straight line through the origin confirms F ∝ I₁I₂.',
    conclusion: 'The gradient gives μ₀ ≈ 4π × 10⁻⁷ N A⁻² within uncertainty.',
    limitations: ['Very small forces near the balance resolution.', 'Heating changes resistance and current.', 'Wires not perfectly parallel/infinite.'],
    improvements: ['Use longer wires or more turns (current balance).', 'Shield from draughts.'],
  },
  {
    id: 'inv-induction',
    title: 'Induced emf vs magnet speed',
    module: 6,
    dotPoints: ['m6-ei-2'],
    question: 'How does the peak emf induced in a coil depend on the speed of a magnet passing through it?',
    hypothesis: 'If the magnet’s speed increases, the peak emf will increase proportionally (ε ∝ ΔΦ/Δt).',
    variables: { independent: 'Magnet speed v (m s⁻¹), set by drop height', dependent: 'Peak emf (V)', controlled: ['Same magnet and coil', 'Same orientation'] },
    equipment: ['Coil (e.g. 400 turns)', 'Bar magnet', 'Data logger/voltage sensor', 'Clear tube to guide the magnet'],
    method: ['Drop the magnet from measured heights through the coil.', 'Record peak emf with the data logger.', 'Calculate speed at the coil: v = √(2gh).'],
    risks: [{ hazard: 'Falling magnet', control: 'Use a cushioned landing; keep fingers clear.' }],
    expected: 'Peak emf increases with speed; the second peak (exit) has opposite sign (Lenz).',
    table: { x: 'v', y: 'ε_peak', xUnit: 'm s⁻¹', yUnit: 'V' },
    xs: [0.5, 1.0, 1.5, 2.0, 2.5],
    model: (v) => 0.12 * v,
    noise: 0.05,
    linearise: { xLabel: 'v (m s⁻¹)', fx: (x) => x, gradientMeaning: 'Gradient ∝ N × (dΦ/dz) — depends on coil and magnet.' },
    analysis: 'A linear ε vs v graph shows emf ∝ rate of change of flux.',
    conclusion: 'Faster relative motion → faster flux change → larger emf (Faraday).',
    limitations: ['Magnet may tilt.', 'Data logger sampling rate may miss the true peak.'],
    improvements: ['Use a higher sampling rate.', 'Use a guide tube.'],
  },
  {
    id: 'inv-malus',
    title: 'Malus’ law',
    module: 7,
    dotPoints: ['m7-wm-4'],
    question: 'How does the intensity of polarised light through an analyser depend on the angle between their axes?',
    hypothesis: 'Intensity will follow I = I_max cos²θ.',
    variables: { independent: 'Angle θ (°)', dependent: 'Light intensity (lux)', controlled: ['Light source distance and brightness', 'Same polarisers', 'Dark room'] },
    equipment: ['LED light source', 'Two polarising filters', 'Rotating mount with protractor', 'Light sensor/data logger'],
    method: ['Align polariser and analyser (θ = 0).', 'Record intensity every 10° to 90°.', 'Subtract background reading.'],
    risks: [{ hazard: 'Hot lamp', control: 'Use an LED source.' }],
    expected: 'Intensity falls from maximum to near zero at 90°.',
    table: { x: 'θ', y: 'I', xUnit: '°', yUnit: 'lux' },
    xs: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90],
    model: (t) => 500 * Math.cos((t * Math.PI) / 180) ** 2,
    noise: 0.03,
    linearise: { xLabel: 'cos²θ', fx: (x) => Math.cos((x * Math.PI) / 180) ** 2, gradientMeaning: 'Gradient = I_max.' },
    analysis: 'Plot I vs cos²θ: a straight line through the origin with gradient I_max confirms Malus’ law.',
    conclusion: 'Data support Malus’ law; light behaves as a transverse wave.',
    limitations: ['Polarisers not ideal (non-zero at 90°).', 'Background light.', 'Angle reading ±2°.'],
    improvements: ['Darken room; subtract background; finer angle steps.'],
  },
  {
    id: 'inv-photoelectric',
    title: 'Stopping voltage vs frequency (determining h)',
    module: 7,
    dotPoints: ['m7-qm-2', 'm7-qm-3'],
    question: 'How does the stopping voltage of photoelectrons depend on light frequency?',
    hypothesis: 'eV₀ = hf − φ, so V₀ vs f is linear with gradient h/e.',
    variables: { independent: 'Frequency f (Hz) — LED/filter colours', dependent: 'Stopping voltage V₀ (V)', controlled: ['Same photocell', 'Same intensity setting'] },
    equipment: ['Photocell (vacuum phototube)', 'Set of filters or LEDs of known wavelength', 'Variable reverse voltage supply', 'Sensitive ammeter/electrometer'],
    method: ['Illuminate the photocell with one wavelength.', 'Increase reverse voltage until the photocurrent just reaches zero: V₀.', 'Repeat for each wavelength; convert λ to f.'],
    risks: [{ hazard: 'UV exposure', control: 'Use visible/near-UV LEDs with shielding; avoid looking at sources.' }],
    expected: 'Higher frequency gives a larger stopping voltage; no current below threshold.',
    table: { x: 'f', y: 'V₀', xUnit: 'Hz', yUnit: 'V' },
    xs: [5.2e14, 5.8e14, 6.4e14, 7.0e14, 7.5e14],
    model: (f) => (6.626e-34 * f - 2.1 * 1.602e-19) / 1.602e-19,
    noise: 0.04,
    linearise: { xLabel: 'f (Hz)', fx: (x) => x, gradientMeaning: 'Gradient = h/e → h = e × gradient; x-intercept = f₀.' },
    analysis: 'Fit V₀ vs f; h = e × gradient ≈ 6.6 × 10⁻³⁴ J s; φ = −e × y-intercept.',
    conclusion: 'Linear relationship confirms Einstein’s photoelectric equation.',
    limitations: ['Filters pass a band of wavelengths.', 'Contact potential shifts the intercept.', 'Small currents hard to measure.'],
    improvements: ['Use narrow-band filters; electrometer amplifier.'],
  },
  {
    id: 'inv-halflife',
    title: 'Modelling half-life (dice)',
    module: 8,
    dotPoints: ['m8-pn-2'],
    question: 'Does a random “decay” process produce exponential decay with a constant half-life?',
    hypothesis: 'If each die has a 1/6 chance of “decaying” per throw, N will fall exponentially with half-life ≈ 3.8 throws.',
    variables: { independent: 'Throw number t', dependent: 'Dice remaining N', controlled: ['Same type of dice', 'Same decay rule (remove sixes)'] },
    equipment: ['200 dice', 'Tray'],
    method: ['Throw all dice; remove sixes; count remaining.', 'Repeat with the remaining dice for 15 throws.', 'Pool class results.'],
    risks: [{ hazard: 'None significant', control: 'A safe model — no radioactive sources are used.' }],
    expected: 'N decreases by about 1/6 each throw — an exponential curve.',
    table: { x: 't', y: 'N', xUnit: 'throws', yUnit: 'dice' },
    xs: [0, 2, 4, 6, 8, 10, 12, 14],
    model: (t) => 200 * Math.pow(5 / 6, t),
    noise: 0.05,
    linearise: { xLabel: 't (throws)', fx: (x) => x, yLabel: 'ln N', fy: (y) => Math.log(y), gradientMeaning: 'Gradient of ln N vs t = −λ = ln(5/6) ≈ −0.182; t½ = ln 2/λ.' },
    analysis: 'A graph of ln N against t is linear with gradient −λ; t½ = ln2/λ ≈ 3.8 throws.',
    conclusion: 'Random individual events produce predictable exponential decay.',
    limitations: ['Small numbers → large random fluctuations.', 'Dice may not be fair.'],
    improvements: ['Use more dice or pool class data; use a computer simulation for large N.'],
  },
];

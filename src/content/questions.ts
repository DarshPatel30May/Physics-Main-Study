import type { ModuleNo } from './formulas';

/** Kind of error a wrong answer reveals — used for performance tracking. */
export type ErrorType = 'concept' | 'formula' | 'calculation' | 'units' | 'sign' | 'graph' | 'skills';
export type Skill = 'concept' | 'calculation' | 'graph' | 'diagram' | 'investigation';
/** 1 Beginner · 2 Medium · 3 Hard · 4 HSC examination difficulty */
export type Difficulty = 1 | 2 | 3 | 4;

export interface PlotFigure {
  kind: 'plot';
  xLabel: string;
  yLabel: string;
  series: { points: [number, number][]; label?: string; dashed?: boolean }[];
  xMax?: number;
  yMax?: number;
  yMin?: number;
}
export interface DiagramFigure {
  kind: 'diagram';
  id: string;
}
export type Figure = PlotFigure | DiagramFigure;

export interface MCQ {
  id: string;
  kind: 'mcq';
  module: ModuleNo;
  section: string;
  dotPoints: string[];
  difficulty: Difficulty;
  skill: Skill;
  stem: string;
  figure?: Figure;
  options: { text: string; correct?: boolean; error?: ErrorType; why: string }[];
  solution: string;
}

export interface Criterion {
  marks: number;
  text: string;
}

export interface ShortAnswer {
  id: string;
  kind: 'sa';
  module: ModuleNo;
  section: string;
  dotPoints: string[];
  difficulty: Difficulty;
  skill: Skill;
  marks: number;
  stem: string;
  figure?: Figure;
  /** numeric answer (SI or stated unit) */
  numeric?: { answer: number; unit: string; tol?: number; alt?: { unit: string; answer: number }[] };
  criteria: Criterion[];
  model: string;
  /** terms a strong response usually includes — guidance only, not a marking key */
  keyTerms?: string[];
}

export type Question = MCQ | ShortAnswer;

const RAW_QUESTIONS: Question[] = [
  /* ============================== MODULE 5 ============================== */
  {
    id: 'q5-01', kind: 'mcq', module: 5, section: 'm5-projectile', dotPoints: ['m5-pm-1'], difficulty: 1, skill: 'concept',
    stem: 'A ball is thrown horizontally from the top of a cliff. Ignoring air resistance, which quantity remains constant during its flight?',
    options: [
      { text: 'Its horizontal velocity', correct: true, why: 'No horizontal force acts, so u_x is constant.' },
      { text: 'Its vertical velocity', error: 'concept', why: 'Gravity accelerates the ball downwards, so v_y increases in magnitude.' },
      { text: 'Its speed', error: 'concept', why: 'Speed = √(v_x² + v_y²) increases as v_y grows.' },
      { text: 'Its kinetic energy', error: 'concept', why: 'GPE converts to KE as it falls, so KE increases.' },
    ],
    solution: 'Only gravity acts (vertically), so the horizontal component of velocity is unchanged.',
  },
  {
    id: 'q5-02', kind: 'mcq', module: 5, section: 'm5-projectile', dotPoints: ['m5-pm-4', 'm5-pm-2'], difficulty: 2, skill: 'calculation',
    stem: 'A marble rolls off a horizontal bench 1.25 m high at 2.0 m s⁻¹. How far from the base of the bench does it land?',
    options: [
      { text: '1.0 m', correct: true, why: 't = √(2 × 1.25/9.8) = 0.505 s; Δx = 2.0 × 0.505 = 1.0 m.' },
      { text: '0.51 m', error: 'formula', why: 'This is the fall time in seconds, not the horizontal distance.' },
      { text: '2.5 m', error: 'formula', why: 'Multiplying speed by height has no physical meaning.' },
      { text: '0.26 m', error: 'calculation', why: 'This uses t² instead of t.' },
    ],
    solution: 'Vertical: 1.25 = ½(9.8)t² → t = 0.505 s. Horizontal: Δx = u_x t = 2.0 × 0.505 ≈ 1.0 m.',
  },
  {
    id: 'q5-03', kind: 'mcq', module: 5, section: 'm5-projectile', dotPoints: ['m5-pm-1'], difficulty: 2, skill: 'concept',
    stem: 'At the highest point of its trajectory, what is the acceleration of a projectile (no air resistance)?',
    options: [
      { text: '9.8 m s⁻² downwards', correct: true, why: 'Gravity acts throughout the flight.' },
      { text: 'Zero', error: 'concept', why: 'Only v_y is zero momentarily; the acceleration is still g.' },
      { text: '9.8 m s⁻² upwards', error: 'sign', why: 'Gravity always points down.' },
      { text: 'Less than 9.8 m s⁻² because it is slower', error: 'concept', why: 'g does not depend on speed.' },
    ],
    solution: 'The only force is weight, so a = g = 9.8 m s⁻² downwards at every point, including the top.',
  },
  {
    id: 'q5-04', kind: 'mcq', module: 5, section: 'm5-projectile', dotPoints: ['m5-pm-2'], difficulty: 3, skill: 'concept',
    stem: 'Two identical balls are launched on level ground with the same speed, one at 30° and one at 60° above horizontal. Which statement is correct?',
    options: [
      { text: 'They have the same range, but the 60° ball is in the air longer.', correct: true, why: 'sin 60° = sin 120°, so ranges match; u_y is larger at 60°.' },
      { text: 'The 60° ball travels further because it is in the air longer.', error: 'concept', why: 'Its horizontal velocity is smaller, which exactly compensates.' },
      { text: 'They have the same time of flight and the same range.', error: 'concept', why: 'Time of flight depends on u sin θ, which differs.' },
      { text: 'The 30° ball reaches a greater height.', error: 'concept', why: 'H ∝ sin²θ, larger for 60°.' },
    ],
    solution: 'R = u² sin 2θ / g gives equal ranges for complementary angles; t = 2u sin θ/g is larger for 60°.',
  },
  {
    id: 'q5-05', kind: 'mcq', module: 5, section: 'm5-projectile', dotPoints: ['m5-pm-1'], difficulty: 2, skill: 'graph',
    stem: 'A ball is launched upwards at an angle. Taking up as positive, which graph shows its vertical velocity v_y against time until it lands at launch height?',
    figure: {
      kind: 'plot', xLabel: 't (s)', yLabel: 'v_y (m s⁻¹)', yMin: -12, yMax: 12, xMax: 2.2,
      series: [{ points: [[0, 10], [2.04, -10]], label: 'Graph P' }, { points: [[0, 10], [1.02, 0], [2.04, 10]], label: 'Graph Q', dashed: true }],
    },
    options: [
      { text: 'Graph P: a straight line with constant negative gradient crossing zero at the highest point', correct: true, why: 'v_y = u_y − gt is linear with gradient −g.' },
      { text: 'Graph Q: v_y falls to zero then rises again', error: 'graph', why: 'That describes speed (magnitude), not signed velocity.' },
      { text: 'A horizontal line, because velocity is constant', error: 'concept', why: 'That is v_x, not v_y.' },
      { text: 'A parabola, because the path is a parabola', error: 'graph', why: 'The path y(x) is parabolic; v_y(t) is linear.' },
    ],
    solution: 'Constant acceleration −g gives a straight v_y–t graph with gradient −9.8 m s⁻², crossing zero at the top and ending at −u_y.',
  },
  {
    id: 'q5-06', kind: 'mcq', module: 5, section: 'm5-circular', dotPoints: ['m5-cm-2'], difficulty: 1, skill: 'concept',
    stem: 'A car travels around a flat, horizontal roundabout at constant speed. Which force provides the centripetal force?',
    options: [
      { text: 'Static friction between the tyres and the road', correct: true, why: 'Friction acts towards the centre on a flat road.' },
      { text: 'The car’s weight', error: 'concept', why: 'Weight is vertical; it cannot point towards the centre of a horizontal circle.' },
      { text: 'A centrifugal force', error: 'concept', why: 'No outward force exists in an inertial frame.' },
      { text: 'The engine’s driving force', error: 'concept', why: 'That acts forwards (tangentially), not towards the centre.' },
    ],
    solution: 'On a flat road, only friction can act horizontally towards the centre of the bend.',
  },
  {
    id: 'q5-07', kind: 'mcq', module: 5, section: 'm5-circular', dotPoints: ['m5-cm-1', 'm5-cm-3'], difficulty: 3, skill: 'calculation',
    stem: 'An object in uniform circular motion has its speed doubled and its radius halved. By what factor does the required centripetal force change?',
    options: [
      { text: '8', correct: true, why: 'F ∝ v²/r = 2²/(½) = 8.' },
      { text: '4', error: 'calculation', why: 'This ignores the change in radius.' },
      { text: '2', error: 'formula', why: 'v must be squared.' },
      { text: '1', error: 'formula', why: 'The changes do not cancel.' },
    ],
    solution: 'F_c = mv²/r → (2v)²/(r/2) = 8v²/r.',
  },
  {
    id: 'q5-08', kind: 'mcq', module: 5, section: 'm5-circular', dotPoints: ['m5-cm-3'], difficulty: 3, skill: 'calculation',
    stem: 'A 0.50 kg mass moves in a horizontal circle of radius 0.80 m at 2.0 revolutions per second. Ignoring gravity, what is the tension in the string?',
    options: [
      { text: '63 N', correct: true, why: 'v = 2πrf = 10.05 m s⁻¹; F = mv²/r = 63 N.' },
      { text: '3.9 N', error: 'formula', why: 'This treats 2.0 as the period instead of the frequency.' },
      { text: '6.3 N', error: 'formula', why: 'v has not been squared.' },
      { text: '126 N', error: 'calculation', why: 'This uses the diameter in v = 2πr/T.' },
    ],
    solution: 'T = 1/f = 0.50 s. v = 2π(0.80)/0.50 = 10.05 m s⁻¹. F = 0.50 × 10.05²/0.80 ≈ 63 N.',
  },
  {
    id: 'q5-09', kind: 'mcq', module: 5, section: 'm5-circular', dotPoints: ['m5-cm-2'], difficulty: 3, skill: 'concept',
    stem: 'A car travels around a banked curve faster than its design speed. Which statement describes the friction force on the car?',
    figure: { kind: 'diagram', id: 'banked-track' },
    options: [
      { text: 'Friction acts down the slope, adding to the inward force.', correct: true, why: 'More F_c is needed than N sin θ alone can supply.' },
      { text: 'Friction acts up the slope.', error: 'concept', why: 'That happens below the design speed.' },
      { text: 'There is no friction because the track is banked.', error: 'concept', why: 'Friction is zero only at exactly the design speed.' },
      { text: 'Friction acts outwards, balancing the centripetal force.', error: 'concept', why: 'The net force must point inwards.' },
    ],
    solution: 'Above the design speed the car tends to slide up the bank, so friction acts down the slope; its horizontal component adds to N sin θ.',
  },
  {
    id: 'q5-10', kind: 'mcq', module: 5, section: 'm5-circular', dotPoints: ['m5-cm-5'], difficulty: 2, skill: 'calculation',
    stem: 'A 30 N force is applied to a spanner 0.40 m from the nut, at 30° to the handle. What is the torque on the nut?',
    options: [
      { text: '6.0 N m', correct: true, why: 'τ = rF sin θ = 0.40 × 30 × 0.5.' },
      { text: '10 N m', error: 'formula', why: 'This uses cos θ.' },
      { text: '12 N m', error: 'formula', why: 'This ignores the angle.' },
      { text: '75 N m', error: 'formula', why: 'Dividing F by r is incorrect.' },
    ],
    solution: 'τ = rF sin θ = (0.40)(30) sin 30° = 6.0 N m.',
  },
  {
    id: 'q5-11', kind: 'mcq', module: 5, section: 'm5-gravity', dotPoints: ['m5-gf-1'], difficulty: 2, skill: 'calculation',
    stem: 'At an altitude equal to one Earth radius above the surface, the gravitational field strength is approximately:',
    options: [
      { text: '2.5 N kg⁻¹', correct: true, why: 'r doubles, so g falls to ¼ of 9.8.' },
      { text: '4.9 N kg⁻¹', error: 'formula', why: 'This assumes g ∝ 1/r rather than 1/r².' },
      { text: '9.8 N kg⁻¹', error: 'concept', why: 'g decreases with distance from the centre.' },
      { text: '0 N kg⁻¹', error: 'concept', why: 'Gravity does not vanish at altitude.' },
    ],
    solution: 'Distance from Earth’s centre = 2r_E, so g = 9.8/2² ≈ 2.5 N kg⁻¹.',
  },
  {
    id: 'q5-12', kind: 'mcq', module: 5, section: 'm5-gravity', dotPoints: ['m5-gf-5'], difficulty: 3, skill: 'concept',
    stem: 'A satellite is moved from a low circular orbit to a higher circular orbit. Which row describes the changes?',
    options: [
      { text: 'Kinetic energy decreases; total energy increases', correct: true, why: 'K = GMm/2r falls; E = −GMm/2r becomes less negative.' },
      { text: 'Kinetic energy increases; total energy increases', error: 'concept', why: 'Higher orbits are slower.' },
      { text: 'Kinetic energy decreases; total energy decreases', error: 'sign', why: 'E is negative and becomes less negative — it increases.' },
      { text: 'Kinetic energy unchanged; potential energy increases', error: 'concept', why: 'Orbital speed depends on r.' },
    ],
    solution: 'v = √(GM/r) decreases, so K decreases. U and E = −GMm/2r both increase (towards zero), so energy must be supplied.',
  },
  {
    id: 'q5-13', kind: 'mcq', module: 5, section: 'm5-gravity', dotPoints: ['m5-gf-4'], difficulty: 3, skill: 'calculation',
    stem: 'Satellite A orbits a planet at radius r with period T. Satellite B orbits the same planet at radius 4r. What is B’s period?',
    options: [
      { text: '8T', correct: true, why: 'T ∝ r^{3/2} = 4^{1.5} = 8.' },
      { text: '4T', error: 'formula', why: 'T is not proportional to r.' },
      { text: '16T', error: 'formula', why: 'This uses T ∝ r².' },
      { text: '2T', error: 'formula', why: 'This uses T ∝ √r.' },
    ],
    solution: 'Kepler III: T² ∝ r³ → T_B = T(4)^{3/2} = 8T.',
  },
  {
    id: 'q5-14', kind: 'mcq', module: 5, section: 'm5-gravity', dotPoints: ['m5-gf-5'], difficulty: 4, skill: 'calculation',
    stem: 'How much energy must be supplied to move a 500 kg satellite from a circular orbit of radius 7.0 × 10⁶ m to one of radius 1.4 × 10⁷ m around Earth?',
    options: [
      { text: '7.1 × 10⁹ J', correct: true, why: 'ΔE = (GMm/2)(1/r₁ − 1/r₂).' },
      { text: '1.4 × 10¹⁰ J', error: 'formula', why: 'This is ΔU only — it omits the decrease in kinetic energy.' },
      { text: '−7.1 × 10⁹ J', error: 'sign', why: 'Energy must be supplied, so the change is positive.' },
      { text: '2.9 × 10¹⁰ J', error: 'calculation', why: 'Factor-of-two error in the wrong direction.' },
    ],
    solution: 'ΔE = −GMm/2r₂ − (−GMm/2r₁) = (6.67 × 10⁻¹¹)(6.0 × 10²⁴)(500)/2 × (1/7.0 × 10⁶ − 1/1.4 × 10⁷) ≈ 7.1 × 10⁹ J.',
  },
  {
    id: 'q5-15', kind: 'mcq', module: 5, section: 'm5-projectile', dotPoints: ['m5-pm-3'], difficulty: 2, skill: 'investigation',
    stem: 'A student investigates how launch angle affects the range of a projectile. Which change would most improve the VALIDITY of the investigation?',
    options: [
      { text: 'Keep the launcher setting and launch height constant while changing only the angle', correct: true, why: 'Controlling variables ensures the test measures what it intends.' },
      { text: 'Repeat each launch five times', error: 'skills', why: 'Repetition improves reliability, not validity.' },
      { text: 'Measure the range with a tape graduated in millimetres', error: 'skills', why: 'This improves precision of measurement.' },
      { text: 'Use a different ball for each angle', error: 'skills', why: 'This adds an uncontrolled variable.' },
    ],
    solution: 'Validity requires that only the independent variable changes; controlling launch speed and height achieves this.',
  },
  {
    id: 'q5-16', kind: 'mcq', module: 5, section: 'm5-gravity', dotPoints: ['m5-gf-5'], difficulty: 4, skill: 'calculation',
    stem: 'Planet X has twice the mass and twice the radius of Earth. Compared with Earth, the escape velocity from its surface is:',
    options: [
      { text: 'the same', correct: true, why: 'v_esc ∝ √(M/r) = √(2/2) = 1.' },
      { text: 'twice as large', error: 'formula', why: 'Radius increase offsets mass increase.' },
      { text: '√2 times as large', error: 'calculation', why: 'Only the mass change was included.' },
      { text: 'half as large', error: 'formula', why: 'Check the proportionality: v ∝ √(M/r).' },
    ],
    solution: 'v_esc = √(2GM/r) ∝ √(M/r); doubling both leaves it unchanged.',
  },
  {
    id: 'q5-sa1', kind: 'sa', module: 5, section: 'm5-projectile', dotPoints: ['m5-pm-2'], difficulty: 2, skill: 'calculation', marks: 3,
    stem: 'A soccer ball is kicked from the ground at 18 m s⁻¹ at 35° above the horizontal and lands on level ground. Calculate its horizontal range (m).',
    numeric: { answer: 31.07, unit: 'm', tol: 0.02 },
    criteria: [
      { marks: 1, text: 'Resolves velocity or finds time of flight (t = 2u sin θ/g = 2.11 s).' },
      { marks: 1, text: 'Uses Δx = u_x t (u_x = 14.7 m s⁻¹) or R = u² sin 2θ/g correctly.' },
      { marks: 1, text: 'Correct answer with unit: ≈ 31 m.' },
    ],
    model: 'u_x = 18 cos 35° = 14.74 m s⁻¹; u_y = 18 sin 35° = 10.32 m s⁻¹. Time of flight t = 2u_y/g = 2.107 s. Range = u_x t = 14.74 × 2.107 ≈ 31 m.',
  },
  {
    id: 'q5-sa2', kind: 'sa', module: 5, section: 'm5-projectile', dotPoints: ['m5-pm-2', 'm5-pm-4'], difficulty: 3, skill: 'calculation', marks: 4,
    stem: 'A stone is thrown horizontally at 12 m s⁻¹ from the top of a 30 m vertical cliff. Calculate the speed with which it hits the water below (m s⁻¹).',
    numeric: { answer: 27.06, unit: 'm s⁻¹', tol: 0.02 },
    criteria: [
      { marks: 1, text: 'Finds final vertical velocity: v_y² = 0 + 2(9.8)(30) → v_y = 24.2 m s⁻¹.' },
      { marks: 1, text: 'Recognises v_x = 12 m s⁻¹ is unchanged.' },
      { marks: 1, text: 'Combines components with Pythagoras.' },
      { marks: 1, text: 'Correct answer ≈ 27 m s⁻¹.' },
    ],
    model: 'v_y = √(2 × 9.8 × 30) = 24.25 m s⁻¹ (down). v_x = 12 m s⁻¹. v = √(12² + 24.25²) ≈ 27 m s⁻¹ (at tan⁻¹(24.25/12) = 64° below horizontal).',
  },
  {
    id: 'q5-sa3', kind: 'sa', module: 5, section: 'm5-circular', dotPoints: ['m5-cm-2'], difficulty: 2, skill: 'concept', marks: 3,
    stem: 'A passenger in a car turning a sharp corner on a flat road feels as though they are “thrown outwards”. Explain this experience using Newton’s laws.',
    criteria: [
      { marks: 1, text: 'States the passenger tends to continue in a straight line (inertia / Newton’s first law).' },
      { marks: 1, text: 'States a net inward (centripetal) force is needed to change their direction, provided by the seat/door/seatbelt.' },
      { marks: 1, text: 'Explains there is no real outward force; the car turns inward relative to the passenger.' },
    ],
    model: 'By Newton’s first law the passenger tends to keep moving in a straight line (tangent to the curve). The car turns towards the centre, so the door or seat must push the passenger inwards to provide the centripetal force (Newton’s second law, F = mv²/r). The sensation of being pushed outward is the passenger’s inertia relative to the turning car — there is no outward “centrifugal” force acting in the road’s frame.',
    keyTerms: ['inertia', 'straight line', 'centripetal', 'net force', 'towards the centre', 'no outward force'],
  },
  {
    id: 'q5-sa4', kind: 'sa', module: 5, section: 'm5-circular', dotPoints: ['m5-cm-2'], difficulty: 3, skill: 'calculation', marks: 3,
    stem: 'A section of road with radius 120 m is to be banked so that cars travelling at 25 m s⁻¹ need no friction. Calculate the required banking angle (°).',
    numeric: { answer: 27.99, unit: '°', tol: 0.02 },
    criteria: [
      { marks: 1, text: 'Resolves the normal force: N sin θ = mv²/r and N cos θ = mg.' },
      { marks: 1, text: 'Obtains tan θ = v²/(rg) = 625/1176.' },
      { marks: 1, text: 'θ ≈ 28°.' },
    ],
    model: 'tan θ = v²/(rg) = 25²/(120 × 9.8) = 0.531, so θ = 28°.',
  },
  {
    id: 'q5-sa5', kind: 'sa', module: 5, section: 'm5-gravity', dotPoints: ['m5-gf-4'], difficulty: 3, skill: 'calculation', marks: 3,
    stem: 'Phobos orbits Mars with an orbital radius of 9.38 × 10⁶ m and a period of 7.66 hours. Use these data to calculate the mass of Mars (kg).',
    numeric: { answer: 6.42e23, unit: 'kg', tol: 0.02 },
    criteria: [
      { marks: 1, text: 'Converts the period to seconds (2.758 × 10⁴ s).' },
      { marks: 1, text: 'Rearranges Kepler III: M = 4π²r³/(GT²).' },
      { marks: 1, text: 'M ≈ 6.4 × 10²³ kg.' },
    ],
    model: 'T = 7.66 × 3600 = 2.758 × 10⁴ s. M = 4π²(9.38 × 10⁶)³/[(6.67 × 10⁻¹¹)(2.758 × 10⁴)²] ≈ 6.4 × 10²³ kg.',
  },
  {
    id: 'q5-sa6', kind: 'sa', module: 5, section: 'm5-gravity', dotPoints: ['m5-gf-3'], difficulty: 3, skill: 'concept', marks: 5,
    stem: 'Compare the orbital properties of low-Earth-orbit (LEO) satellites and geostationary satellites, and relate these properties to their uses.',
    criteria: [
      { marks: 2, text: 'Correctly compares altitude/radius, speed and period (LEO: few hundred km, ~7.7 km s⁻¹, ~90 min; geostationary: ~36 000 km altitude, ~3.1 km s⁻¹, 24 h (sidereal day), equatorial).' },
      { marks: 2, text: 'Relates properties to uses (geostationary: fixed position for communications/weather, fixed dishes; LEO: high resolution imaging, low latency, ISS).' },
      { marks: 1, text: 'Uses correct physics reasoning (Kepler III / v = √(GM/r)).' },
    ],
    model: 'From v = √(GM/r) and T² ∝ r³, LEO satellites (altitude ~200–2000 km) move fast (~7.7 km s⁻¹) with short periods (~90 min), so they pass over many regions — ideal for high-resolution Earth observation and low-latency communication, but each satellite is visible only briefly. Geostationary satellites orbit above the equator at r ≈ 4.2 × 10⁷ m (altitude ~36 000 km) with T equal to Earth’s rotation period, so they stay above one point — ideal for weather monitoring and broadcasting with fixed ground antennas, but their large distance limits image resolution and adds signal delay.',
    keyTerms: ['period', 'altitude', 'radius', 'equator', 'Kepler', 'resolution', 'fixed position', 'speed'],
  },
  {
    id: 'q5-sa7', kind: 'sa', module: 5, section: 'm5-gravity', dotPoints: ['m5-gf-5'], difficulty: 3, skill: 'calculation', marks: 3,
    stem: 'Calculate the minimum energy that must be given to a 1000 kg probe at rest on Earth’s surface for it to escape Earth’s gravitational field (ignore air resistance and Earth’s rotation) (J).',
    numeric: { answer: 6.28e10, unit: 'J', tol: 0.02 },
    criteria: [
      { marks: 1, text: 'Recognises the total energy must reach zero: E = −U = GMm/r.' },
      { marks: 1, text: 'Correct substitution with r = r_E.' },
      { marks: 1, text: '≈ 6.3 × 10¹⁰ J.' },
    ],
    model: 'Required energy = 0 − U = GMm/r = (6.67 × 10⁻¹¹)(6.0 × 10²⁴)(1000)/(6.371 × 10⁶) ≈ 6.3 × 10¹⁰ J (equivalent to giving it v_esc ≈ 11.2 km s⁻¹).',
  },
  {
    id: 'q5-sa8', kind: 'sa', module: 5, section: 'm5-projectile', dotPoints: ['m5-pm-3', 'm5-pm-2'], difficulty: 4, skill: 'investigation', marks: 7,
    stem: 'A student uses a launcher (measured launch speed 6.0 m s⁻¹) on level ground and records ranges: 20° → 2.25 m; 30° → 3.05 m; 45° → 3.50 m; 60° → 3.00 m; 70° → 2.20 m. Evaluate the investigation and the extent to which the data support the projectile model. Include a quantitative comparison.',
    figure: {
      kind: 'plot', xLabel: 'launch angle (°)', yLabel: 'range (m)', xMax: 90, yMax: 4.5, yMin: 0,
      series: [
        { points: [[20, 2.25], [30, 3.05], [45, 3.5], [60, 3.0], [70, 2.2]], label: 'measured' },
        { points: Array.from({ length: 19 }, (_, i) => [i * 5, (36 * Math.sin((2 * i * 5 * Math.PI) / 180)) / 9.8] as [number, number]), label: 'model', dashed: true },
      ],
    },
    criteria: [
      { marks: 2, text: 'Calculates model predictions (e.g. R(45°) = 3.67 m; R(30°) = R(60°) = 3.18 m) and compares with data (measured ≈ 4–6% lower).' },
      { marks: 2, text: 'Identifies that the trend (max near 45°, symmetry of complementary angles) supports the model.' },
      { marks: 2, text: 'Explains systematic discrepancy (air resistance, launch height above ground, speed measurement) and evaluates validity/reliability (single trials, number of angles).' },
      { marks: 1, text: 'Suggests specific improvements (repeat trials, video analysis, more angles, plot R vs sin 2θ).' },
    ],
    model: 'The model R = u² sin 2θ/g predicts 2.36 m (20°), 3.18 m (30°), 3.67 m (45°), 3.18 m (60°), 2.36 m (70°). The data show a maximum at 45° and near-equal ranges for complementary angles (30°/60°, 20°/70°), qualitatively supporting the model. However every measured range is about 4–7% below prediction — a systematic error, consistent with air resistance or the launch speed being overestimated. Reliability is limited because only one trial per angle is recorded, and the slightly asymmetric values (3.05 vs 3.00 m) may be random error. Validity depends on keeping the launch speed and height constant. Improvements: repeat each angle 3–5 times and average, measure the launch speed for each launch with a light gate or video, include more angles, and plot R against sin 2θ — the gradient should equal u²/g (3.67 m).',
    keyTerms: ['systematic', 'air resistance', 'reliability', 'validity', 'repeat', 'gradient', 'sin 2θ', 'percentage'],
  },

  /* ============================== MODULE 6 ============================== */
  {
    id: 'q6-01', kind: 'mcq', module: 6, section: 'm6-fields', dotPoints: ['m6-cp-1'], difficulty: 1, skill: 'concept',
    stem: 'An electron is between two horizontal parallel plates. The top plate is positive and the bottom plate negative. In which direction is the electric force on the electron?',
    figure: { kind: 'diagram', id: 'parallel-plates' },
    options: [
      { text: 'Upwards, towards the positive plate', correct: true, why: 'E points down (+ to −); a negative charge feels a force opposite to E.' },
      { text: 'Downwards, in the direction of the field', error: 'sign', why: 'That would be the force on a positive charge.' },
      { text: 'Horizontally, perpendicular to the field', error: 'concept', why: 'Electric force is parallel (or antiparallel) to E.' },
      { text: 'There is no force unless the electron moves', error: 'concept', why: 'Electric fields act on stationary charges.' },
    ],
    solution: 'The field points from + to − (downwards). F = qE with q negative gives an upward force.',
  },
  {
    id: 'q6-02', kind: 'mcq', module: 6, section: 'm6-fields', dotPoints: ['m6-cp-1'], difficulty: 2, skill: 'calculation',
    stem: 'Parallel plates 2.5 mm apart are connected to a 500 V supply. What is the electric field strength between them?',
    options: [
      { text: '2.0 × 10⁵ V m⁻¹', correct: true, why: 'E = V/d = 500/0.0025.' },
      { text: '200 V m⁻¹', error: 'units', why: 'mm were not converted to m.' },
      { text: '1250 V m⁻¹', error: 'formula', why: 'This multiplies V and d.' },
      { text: '5.0 × 10⁻⁶ V m⁻¹', error: 'formula', why: 'This is d/V.' },
    ],
    solution: 'E = V/d = 500/(2.5 × 10⁻³) = 2.0 × 10⁵ V m⁻¹.',
  },
  {
    id: 'q6-03', kind: 'mcq', module: 6, section: 'm6-fields', dotPoints: ['m6-cp-1'], difficulty: 2, skill: 'calculation',
    stem: 'An electron is accelerated from rest through a potential difference of 2.0 kV. What kinetic energy does it gain?',
    options: [
      { text: '3.2 × 10⁻¹⁶ J', correct: true, why: 'K = qV = 1.602 × 10⁻¹⁹ × 2000.' },
      { text: '2000 J', error: 'units', why: '2000 eV, not 2000 J.' },
      { text: '1.6 × 10⁻¹⁹ J', error: 'formula', why: 'That is 1 eV.' },
      { text: '6.4 × 10⁻¹⁶ J', error: 'calculation', why: 'Factor-of-two error.' },
    ],
    solution: 'W = qV = (1.602 × 10⁻¹⁹)(2.0 × 10³) = 3.2 × 10⁻¹⁶ J (= 2.0 keV).',
  },
  {
    id: 'q6-04', kind: 'mcq', module: 6, section: 'm6-fields', dotPoints: ['m6-cp-3'], difficulty: 2, skill: 'diagram',
    stem: 'A proton moves to the right across a page through a uniform magnetic field directed INTO the page. What is the direction of the magnetic force on it at that instant?',
    figure: { kind: 'diagram', id: 'right-hand-rule' },
    options: [
      { text: 'Towards the top of the page', correct: true, why: 'F = qv × B: (+x) × (−z) = +y.' },
      { text: 'Towards the bottom of the page', error: 'sign', why: 'That is the force on an electron.' },
      { text: 'Into the page', error: 'concept', why: 'Magnetic force is perpendicular to B.' },
      { text: 'To the left', error: 'concept', why: 'Magnetic force is perpendicular to v.' },
    ],
    solution: 'Right-hand palm rule: fingers into page (B), thumb right (v), palm faces up → force towards the top of the page.',
  },
  {
    id: 'q6-05', kind: 'mcq', module: 6, section: 'm6-fields', dotPoints: ['m6-cp-3', 'm6-cp-4'], difficulty: 3, skill: 'concept',
    stem: 'Why does a uniform magnetic field not change the kinetic energy of a charged particle moving through it?',
    options: [
      { text: 'The magnetic force is always perpendicular to the particle’s velocity, so it does no work.', correct: true, why: 'W = Fs cos 90° = 0.' },
      { text: 'Magnetic fields only act on stationary charges.', error: 'concept', why: 'They act only on moving charges.' },
      { text: 'The magnetic force is too small to matter.', error: 'concept', why: 'It can be large — but it is perpendicular to motion.' },
      { text: 'The magnetic force is parallel to the field.', error: 'concept', why: 'It is perpendicular to B and v.' },
    ],
    solution: 'Because F ⟂ v, no work is done, so speed and kinetic energy are constant; only direction changes.',
  },
  {
    id: 'q6-06', kind: 'mcq', module: 6, section: 'm6-fields', dotPoints: ['m6-cp-4'], difficulty: 3, skill: 'calculation',
    stem: 'A proton and an alpha particle enter the same uniform magnetic field with the same speed, perpendicular to the field. What is the ratio r_α : r_p of their path radii?',
    options: [
      { text: '2 : 1', correct: true, why: 'r = mv/(qB): mass ×4, charge ×2 → radius ×2.' },
      { text: '1 : 2', error: 'formula', why: 'The ratio is inverted.' },
      { text: '4 : 1', error: 'formula', why: 'Charge also doubles.' },
      { text: '1 : 1', error: 'concept', why: 'Mass and charge do not cancel equally.' },
    ],
    solution: 'r ∝ m/q; for alpha m/q = 4/2 = 2 times that of a proton.',
  },
  {
    id: 'q6-07', kind: 'mcq', module: 6, section: 'm6-motor', dotPoints: ['m6-me-1'], difficulty: 2, skill: 'calculation',
    stem: 'A 0.20 m length of wire carries 5.0 A at 30° to a uniform 0.40 T magnetic field. What is the force on the wire?',
    options: [
      { text: '0.20 N', correct: true, why: 'F = lIB sin θ = 0.20 × 5.0 × 0.40 × 0.5.' },
      { text: '0.35 N', error: 'formula', why: 'This uses cos 30°.' },
      { text: '0.40 N', error: 'formula', why: 'This ignores the angle.' },
      { text: '2.0 N', error: 'calculation', why: 'Arithmetic error.' },
    ],
    solution: 'F = lIB sin θ = (0.20)(5.0)(0.40)(sin 30°) = 0.20 N.',
  },
  {
    id: 'q6-08', kind: 'mcq', module: 6, section: 'm6-motor', dotPoints: ['m6-me-3'], difficulty: 2, skill: 'concept',
    stem: 'Two long parallel wires carry currents of 2 A and 6 A in the same direction. Which statement is correct?',
    options: [
      { text: 'They attract with forces of equal magnitude.', correct: true, why: 'Like currents attract; Newton’s third law pair.' },
      { text: 'They repel with forces of equal magnitude.', error: 'concept', why: 'Same-direction currents attract.' },
      { text: 'They attract; the force on the 2 A wire is three times larger.', error: 'concept', why: 'Both forces are μ₀I₁I₂l/2πr.' },
      { text: 'There is no force because the currents differ.', error: 'concept', why: 'Any two currents interact.' },
    ],
    solution: 'F/l = μ₀I₁I₂/(2πr) on each wire; the forces are an action–reaction pair and attractive for parallel currents.',
  },
  {
    id: 'q6-09', kind: 'mcq', module: 6, section: 'm6-motor', dotPoints: ['m6-me-3'], difficulty: 3, skill: 'calculation',
    stem: 'The current in each of two parallel wires is doubled and their separation is also doubled. The force per unit length between them becomes:',
    options: [
      { text: 'twice as large', correct: true, why: '(2 × 2)/2 = 2.' },
      { text: 'four times as large', error: 'formula', why: 'The separation change was ignored.' },
      { text: 'unchanged', error: 'formula', why: 'I₁I₂ quadruples while r only doubles.' },
      { text: 'half as large', error: 'formula', why: 'Check F ∝ I₁I₂/r.' },
    ],
    solution: 'F/l ∝ I₁I₂/r → (2 × 2)/2 = 2.',
  },
  {
    id: 'q6-10', kind: 'mcq', module: 6, section: 'm6-induction', dotPoints: ['m6-ei-1'], difficulty: 2, skill: 'concept',
    stem: 'A flat coil starts with its plane perpendicular to a uniform magnetic field and is rotated 90° until its plane is parallel to the field. The magnetic flux through the coil:',
    options: [
      { text: 'decreases from a maximum to zero', correct: true, why: 'θ (normal to B) goes from 0° to 90°; Φ = BA cos θ.' },
      { text: 'increases from zero to a maximum', error: 'concept', why: 'θ is measured from the normal, not the plane.' },
      { text: 'stays constant because B is constant', error: 'concept', why: 'Orientation changes the flux.' },
      { text: 'reverses direction', error: 'concept', why: 'That would require rotation beyond 90°.' },
    ],
    solution: 'Plane ⟂ B means normal ∥ B (θ = 0, maximum flux). Plane ∥ B means θ = 90°, so Φ = 0.',
  },
  {
    id: 'q6-11', kind: 'mcq', module: 6, section: 'm6-induction', dotPoints: ['m6-ei-2'], difficulty: 3, skill: 'concept',
    stem: 'The north pole of a bar magnet is pushed towards one end of a coil connected to a galvanometer. According to Lenz’s law, the end of the coil nearest the magnet becomes:',
    figure: { kind: 'diagram', id: 'lenz-coil' },
    options: [
      { text: 'a north pole, repelling the approaching magnet', correct: true, why: 'The induced field opposes the increasing flux.' },
      { text: 'a south pole, attracting the magnet', error: 'concept', why: 'That would aid the change — violating energy conservation.' },
      { text: 'unmagnetised, as the magnet is not inside the coil', error: 'concept', why: 'The flux through the coil is still changing.' },
      { text: 'a north pole only when the magnet stops', error: 'concept', why: 'A stationary magnet gives no changing flux.' },
    ],
    solution: 'Increasing flux from an approaching N pole induces a current whose field opposes the increase: a N pole facing the magnet.',
  },
  {
    id: 'q6-12', kind: 'mcq', module: 6, section: 'm6-induction', dotPoints: ['m6-ei-3'], difficulty: 2, skill: 'calculation',
    stem: 'An ideal transformer steps 240 V down to 12 V. The primary coil has 800 turns. How many turns does the secondary have?',
    options: [
      { text: '40', correct: true, why: 'N_s = 800 × 12/240.' },
      { text: '16 000', error: 'formula', why: 'The ratio is inverted.' },
      { text: '20', error: 'calculation', why: 'Arithmetic error.' },
      { text: '400', error: 'calculation', why: 'Check the ratio 12/240 = 1/20.' },
    ],
    solution: 'N_s = N_p(V_s/V_p) = 800 × (12/240) = 40.',
  },
  {
    id: 'q6-13', kind: 'mcq', module: 6, section: 'm6-induction', dotPoints: ['m6-ei-4'], difficulty: 3, skill: 'concept',
    stem: 'Why are transformer cores made from thin, insulated laminations of soft iron?',
    figure: { kind: 'diagram', id: 'laminated-core' },
    options: [
      { text: 'To reduce eddy currents and the heating they cause', correct: true, why: 'Insulation breaks up eddy current loops.' },
      { text: 'To increase the resistance of the windings', error: 'concept', why: 'Windings should have low resistance.' },
      { text: 'To make the core lighter', error: 'concept', why: 'Mass is not the design reason.' },
      { text: 'To produce a DC output', error: 'concept', why: 'Transformers do not rectify.' },
    ],
    solution: 'Changing flux induces eddy currents in the core. Thin insulated laminations increase the resistance to these loops, reducing I²R heating.',
  },
  {
    id: 'q6-14', kind: 'mcq', module: 6, section: 'm6-applications', dotPoints: ['m6-am-1'], difficulty: 3, skill: 'concept',
    stem: 'A DC motor is jammed so that its armature cannot rotate. Compared with normal running, the current through the motor is:',
    options: [
      { text: 'much larger, because there is no back emf', correct: true, why: 'I = (V − ε_back)/R with ε_back = 0.' },
      { text: 'zero, because the coil is not moving', error: 'concept', why: 'The supply still drives current through the coil.' },
      { text: 'the same, because the supply voltage is unchanged', error: 'concept', why: 'Back emf normally reduces the current.' },
      { text: 'smaller, because there is no back emf', error: 'concept', why: 'Back emf opposes the supply; removing it increases current.' },
    ],
    solution: 'Back emf depends on rotation; with no rotation the full supply voltage drives current through the low coil resistance, so I is large (risk of overheating).',
  },
  {
    id: 'q6-15', kind: 'mcq', module: 6, section: 'm6-applications', dotPoints: ['m6-am-2'], difficulty: 2, skill: 'graph',
    stem: 'A coil rotates at constant speed in a uniform magnetic field and is connected to the external circuit through slip rings. Which describes the output emf?',
    figure: {
      kind: 'plot', xLabel: 't (ms)', yLabel: 'emf (V)', xMax: 40, yMin: -12, yMax: 12,
      series: [{ points: Array.from({ length: 81 }, (_, i) => [i * 0.5, 10 * Math.sin((2 * Math.PI * i * 0.5) / 20)] as [number, number]), label: 'output' }],
    },
    options: [
      { text: 'A sinusoidal alternating emf', correct: true, why: 'Slip rings keep the same connection to each coil end, so the emf reverses each half-turn.' },
      { text: 'A steady DC emf', error: 'concept', why: 'A single rotating coil cannot give steady DC.' },
      { text: 'Pulsating DC that never changes sign', error: 'concept', why: 'That needs a split-ring commutator.' },
      { text: 'Zero, because the flux is constant', error: 'concept', why: 'Rotation continuously changes the flux.' },
    ],
    solution: 'Φ = BA cos ωt so ε = NBAω sin ωt; slip rings deliver this alternating emf unchanged.',
  },
  {
    id: 'q6-16', kind: 'mcq', module: 6, section: 'm6-induction', dotPoints: ['m6-ei-2'], difficulty: 4, skill: 'graph',
    stem: 'The graph shows the flux through a 50-turn coil. What is the magnitude of the induced emf between t = 0 and t = 0.20 s, and between 0.20 s and 0.40 s?',
    figure: {
      kind: 'plot', xLabel: 't (s)', yLabel: 'Φ (Wb)', xMax: 0.4, yMin: 0, yMax: 0.05,
      series: [{ points: [[0, 0], [0.2, 0.04], [0.4, 0.04]] }],
    },
    options: [
      { text: '10 V, then 0 V', correct: true, why: '|ε| = NΔΦ/Δt = 50 × 0.04/0.20 = 10 V; flat graph → 0.' },
      { text: '0.2 V, then 0 V', error: 'formula', why: 'N was omitted.' },
      { text: '10 V, then 10 V', error: 'graph', why: 'A constant flux induces no emf.' },
      { text: '0 V, then 10 V', error: 'graph', why: 'emf depends on the gradient, not the value, of Φ.' },
    ],
    solution: 'emf = −N × gradient of Φ–t. Gradient = 0.20 Wb s⁻¹ then 0, so |ε| = 10 V then 0 V.',
  },
  {
    id: 'q6-sa1', kind: 'sa', module: 6, section: 'm6-fields', dotPoints: ['m6-cp-1', 'm6-cp-3'], difficulty: 3, skill: 'calculation', marks: 4,
    stem: 'An electron is accelerated from rest through 150 V, then enters a uniform 2.0 mT magnetic field at right angles. Calculate the radius of its circular path (m).',
    numeric: { answer: 0.02065, unit: 'm', tol: 0.02 },
    criteria: [
      { marks: 1, text: 'Uses qV = ½mv² to find v = 7.26 × 10⁶ m s⁻¹.' },
      { marks: 1, text: 'Equates qvB = mv²/r (or uses r = mv/qB).' },
      { marks: 1, text: 'Correct substitution with B in tesla.' },
      { marks: 1, text: 'r ≈ 2.1 × 10⁻² m.' },
    ],
    model: 'v = √(2qV/m) = √(2 × 1.602 × 10⁻¹⁹ × 150/9.109 × 10⁻³¹) = 7.26 × 10⁶ m s⁻¹. r = mv/(qB) = (9.109 × 10⁻³¹ × 7.26 × 10⁶)/(1.602 × 10⁻¹⁹ × 2.0 × 10⁻³) ≈ 2.1 × 10⁻² m.',
  },
  {
    id: 'q6-sa2', kind: 'sa', module: 6, section: 'm6-fields', dotPoints: ['m6-cp-4', 'm6-cp-2'], difficulty: 3, skill: 'concept', marks: 4,
    stem: 'Compare the motion of an electron entering (a) a uniform electric field and (b) a uniform magnetic field, in each case with velocity perpendicular to the field.',
    criteria: [
      { marks: 1, text: 'Electric field: constant force parallel/antiparallel to E → parabolic path (like a projectile).' },
      { marks: 1, text: 'Electric field: speed/KE changes because the field does work.' },
      { marks: 1, text: 'Magnetic field: force ⟂ v → uniform circular motion, r = mv/qB.' },
      { marks: 1, text: 'Magnetic field: speed/KE constant (no work); identifies a similarity (e.g. force ∝ q, opposite deflection for opposite charges).' },
    ],
    model: 'In a uniform electric field the electron experiences a constant force qE opposite to the field, so it accelerates uniformly in that direction while its perpendicular velocity is unchanged — a parabolic path, like a projectile; its speed and kinetic energy increase as the field does work on it. In a uniform magnetic field the force qvB is always perpendicular to its velocity, so it moves in a circle of radius r = mv/(qB) at constant speed — the field does no work. In both cases the force is proportional to the charge, and a proton would deflect the opposite way.',
    keyTerms: ['parabola', 'circle', 'perpendicular', 'work', 'constant speed', 'r = mv/qB', 'opposite to the field'],
  },
  {
    id: 'q6-sa3', kind: 'sa', module: 6, section: 'm6-motor', dotPoints: ['m6-me-3'], difficulty: 2, skill: 'calculation', marks: 2,
    stem: 'Two parallel wires 4.0 cm apart carry currents of 15 A and 25 A. Calculate the magnitude of the force on a 2.0 m length of either wire (N).',
    numeric: { answer: 3.75e-3, unit: 'N', tol: 0.02 },
    criteria: [
      { marks: 1, text: 'Correct substitution into F/l = μ₀I₁I₂/(2πr) with r = 0.040 m.' },
      { marks: 1, text: 'Multiplies by l = 2.0 m: F ≈ 3.8 × 10⁻³ N.' },
    ],
    model: 'F/l = (4π × 10⁻⁷)(15)(25)/(2π × 0.040) = 1.875 × 10⁻³ N m⁻¹; F = 1.875 × 10⁻³ × 2.0 ≈ 3.8 × 10⁻³ N.',
  },
  {
    id: 'q6-sa4', kind: 'sa', module: 6, section: 'm6-applications', dotPoints: ['m6-am-3', 'm6-ei-2'], difficulty: 3, skill: 'concept', marks: 4,
    stem: 'A magnet is dropped through a vertical copper coil connected to a resistor. Explain, with reference to Lenz’s law and conservation of energy, why the magnet’s acceleration is less than g while it passes through the coil.',
    criteria: [
      { marks: 1, text: 'Changing flux through the coil induces an emf and current (Faraday).' },
      { marks: 1, text: 'Induced current produces a magnetic field opposing the change (repels approaching / attracts receding magnet).' },
      { marks: 1, text: 'This upward magnetic force opposes motion, so a < g.' },
      { marks: 1, text: 'Energy: some GPE becomes electrical energy (heat in resistor) instead of KE; if the current aided the motion energy would be created.' },
    ],
    model: 'As the magnet falls, the flux through the coil changes, inducing an emf and current (Faraday’s law). By Lenz’s law the current’s magnetic field opposes the change — the coil repels the approaching magnet and attracts it as it leaves — so there is an upward force on the magnet and its acceleration is less than g. This is required by conservation of energy: part of the magnet’s gravitational potential energy is transformed into electrical energy and then heat in the resistor, so less becomes kinetic energy. If the induced current aided the fall, kinetic and electrical energy would both increase from nothing.',
    keyTerms: ['flux', 'induced current', 'oppose', 'Lenz', 'conservation of energy', 'heat', 'Faraday'],
  },
  {
    id: 'q6-sa5', kind: 'sa', module: 6, section: 'm6-induction', dotPoints: ['m6-ei-5'], difficulty: 3, skill: 'calculation', marks: 3,
    stem: 'A power station delivers 200 MW at 330 kV through transmission lines with a total resistance of 4.0 Ω. Calculate the power lost in the lines (W).',
    numeric: { answer: 1.469e6, unit: 'W', tol: 0.02 },
    criteria: [
      { marks: 1, text: 'I = P/V = 2.00 × 10⁸/3.30 × 10⁵ = 606 A.' },
      { marks: 1, text: 'Uses P_loss = I²R.' },
      { marks: 1, text: '≈ 1.5 × 10⁶ W (≈ 0.73% of output).' },
    ],
    model: 'I = P/V = 2.00 × 10⁸/3.30 × 10⁵ = 606 A. P_loss = I²R = 606² × 4.0 ≈ 1.5 × 10⁶ W.',
  },
  {
    id: 'q6-sa6', kind: 'sa', module: 6, section: 'm6-induction', dotPoints: ['m6-ei-3'], difficulty: 2, skill: 'calculation', marks: 2,
    stem: 'An ideal transformer has 1200 primary turns and 60 secondary turns. The primary is connected to 240 V AC and the secondary supplies a current of 3.0 A. Calculate the primary current (A).',
    numeric: { answer: 0.15, unit: 'A', tol: 0.02 },
    criteria: [
      { marks: 1, text: 'V_s = 240 × 60/1200 = 12 V.' },
      { marks: 1, text: 'I_p = V_sI_s/V_p = 0.15 A.' },
    ],
    model: 'V_s = 12 V. Power conservation: I_p = (12 × 3.0)/240 = 0.15 A.',
  },
  {
    id: 'q6-sa7', kind: 'sa', module: 6, section: 'm6-applications', dotPoints: ['m6-am-2'], difficulty: 4, skill: 'concept', marks: 5,
    stem: 'Explain how an AC induction motor produces a torque on its rotor, and why the rotor always turns slightly slower than the rotating magnetic field.',
    figure: { kind: 'diagram', id: 'induction-motor' },
    criteria: [
      { marks: 1, text: 'Stator coils with AC produce a rotating magnetic field.' },
      { marks: 1, text: 'Relative motion between field and rotor bars changes flux → induced emf/currents in the rotor (Faraday).' },
      { marks: 1, text: 'Induced currents in the magnetic field experience forces (motor effect) → torque.' },
      { marks: 1, text: 'Lenz: forces act to reduce relative motion, so the rotor follows the field.' },
      { marks: 1, text: 'If rotor matched field speed there would be no relative motion, no induced current, no torque → slip.' },
    ],
    model: 'AC supplied to the stator coils produces a magnetic field that rotates around the motor. Because the field moves relative to the squirrel-cage rotor, the flux through the loops formed by the rotor bars changes, inducing emfs and currents in them (Faraday’s law). These currents sit in the magnetic field, so they experience forces (the motor effect, F = lIB) that produce a torque. By Lenz’s law the forces act to reduce the relative motion, so the rotor turns in the same direction as the rotating field. If the rotor ever reached the field’s speed there would be no relative motion, no change in flux, no induced current and no torque — so under load it always runs slightly slower (slip).',
    keyTerms: ['rotating magnetic field', 'stator', 'induced', 'relative motion', 'motor effect', 'Lenz', 'slip', 'torque'],
  },
  {
    id: 'q6-sa8', kind: 'sa', module: 6, section: 'm6-applications', dotPoints: ['m6-am-1'], difficulty: 4, skill: 'calculation', marks: 3,
    stem: 'A rectangular coil of 80 turns, 3.0 cm × 4.0 cm, carries 1.2 A in a uniform 0.35 T magnetic field. The PLANE of the coil makes an angle of 30° with the field. Calculate the torque on the coil (N m).',
    numeric: { answer: 0.03492, unit: 'N m', tol: 0.02 },
    criteria: [
      { marks: 1, text: 'Area A = 1.2 × 10⁻³ m².' },
      { marks: 1, text: 'Uses the angle between the coil’s normal and B: 60° (or plane angle with cos 30°).' },
      { marks: 1, text: 'τ ≈ 3.5 × 10⁻² N m.' },
    ],
    model: 'A = 0.030 × 0.040 = 1.2 × 10⁻³ m². The normal makes 60° with B. τ = nIAB sin 60° = 80 × 1.2 × 1.2 × 10⁻³ × 0.35 × 0.866 ≈ 3.5 × 10⁻² N m (equivalently nIAB cos 30°).',
  },

  /* ============================== MODULE 7 ============================== */
  {
    id: 'q7-01', kind: 'mcq', module: 7, section: 'm7-spectrum', dotPoints: ['m7-em-2'], difficulty: 1, skill: 'concept',
    stem: 'In an electromagnetic wave travelling through a vacuum, the electric and magnetic fields are:',
    figure: { kind: 'diagram', id: 'em-wave' },
    options: [
      { text: 'perpendicular to each other and to the direction of travel', correct: true, why: 'EM waves are transverse with E ⟂ B ⟂ v.' },
      { text: 'parallel to each other and to the direction of travel', error: 'concept', why: 'That would be longitudinal.' },
      { text: 'perpendicular to each other but one is along the direction of travel', error: 'concept', why: 'Both are transverse.' },
      { text: 'out of phase by 90°', error: 'concept', why: 'In a vacuum they oscillate in phase.' },
    ],
    solution: 'EM waves are transverse: oscillating E and B fields are mutually perpendicular and perpendicular to the propagation direction.',
  },
  {
    id: 'q7-02', kind: 'mcq', module: 7, section: 'm7-spectrum', dotPoints: ['m7-em-2'], difficulty: 2, skill: 'calculation',
    stem: 'What is the wavelength of radio waves from a 98.5 MHz FM station?',
    options: [
      { text: '3.05 m', correct: true, why: 'λ = c/f = 3.00 × 10⁸/98.5 × 10⁶.' },
      { text: '0.328 m', error: 'formula', why: 'This is f/c (×10⁸ scale error).' },
      { text: '3.05 × 10⁻⁶ m', error: 'units', why: 'MHz = 10⁶ Hz, not Hz.' },
      { text: '2.96 × 10¹⁶ m', error: 'formula', why: 'This is c × f.' },
    ],
    solution: 'λ = c/f = (3.00 × 10⁸)/(98.5 × 10⁶) = 3.05 m.',
  },
  {
    id: 'q7-03', kind: 'mcq', module: 7, section: 'm7-spectrum', dotPoints: ['m7-em-1'], difficulty: 2, skill: 'concept',
    stem: 'Which prediction of Maxwell’s theory provided the strongest link between electromagnetism and light?',
    options: [
      { text: 'Electromagnetic waves travel at 1/√(μ₀ε₀), equal to the measured speed of light', correct: true, why: 'This numerical agreement identified light as an EM wave.' },
      { text: 'Light is made of photons', error: 'concept', why: 'That was Einstein (1905).' },
      { text: 'Light slows down in water', error: 'concept', why: 'That is wave-model evidence from Foucault, not Maxwell’s prediction.' },
      { text: 'A changing magnetic field induces a current', error: 'concept', why: 'That is Faraday’s law (1831).' },
    ],
    solution: 'Maxwell calculated the speed of EM waves from electrical and magnetic constants and found it matched c.',
  },
  {
    id: 'q7-04', kind: 'mcq', module: 7, section: 'm7-wave', dotPoints: ['m7-wm-2'], difficulty: 3, skill: 'calculation',
    stem: 'Light of wavelength 600 nm falls on a grating with 500 lines per mm. What is the highest order maximum that can be observed?',
    options: [
      { text: '3', correct: true, why: 'd = 2.0 × 10⁻⁶ m; d/λ = 3.33 → m = 3.' },
      { text: '4', error: 'calculation', why: 'Rounding up gives sin θ > 1, impossible.' },
      { text: '833', error: 'units', why: 'Lines per mm were not converted to spacing.' },
      { text: '1', error: 'calculation', why: 'Higher orders exist.' },
    ],
    solution: 'd = 1/(5.00 × 10⁵ m⁻¹) = 2.0 × 10⁻⁶ m. m ≤ d/λ = 3.33, so m_max = 3.',
  },
  {
    id: 'q7-05', kind: 'mcq', module: 7, section: 'm7-wave', dotPoints: ['m7-wm-2'], difficulty: 2, skill: 'calculation',
    stem: 'In a double-slit experiment the slit separation is halved and the screen distance is doubled. The fringe spacing:',
    options: [
      { text: 'increases by a factor of 4', correct: true, why: 'Δy = λL/d → (2)/(½) = 4.' },
      { text: 'is unchanged', error: 'formula', why: 'Both changes increase Δy.' },
      { text: 'doubles', error: 'calculation', why: 'Only one change was included.' },
      { text: 'decreases by a factor of 4', error: 'formula', why: 'Δy ∝ L/d.' },
    ],
    solution: 'Δy = λL/d ∝ L/d → (2L)/(d/2) = 4 times.',
  },
  {
    id: 'q7-06', kind: 'mcq', module: 7, section: 'm7-wave', dotPoints: ['m7-wm-4'], difficulty: 3, skill: 'calculation',
    stem: 'Unpolarised light of intensity 80 W m⁻² passes through two ideal polarisers whose axes are at 60° to each other. What is the transmitted intensity?',
    figure: { kind: 'diagram', id: 'polariser' },
    options: [
      { text: '10 W m⁻²', correct: true, why: '80 → 40 (first polariser) → 40 cos²60° = 10.' },
      { text: '20 W m⁻²', error: 'concept', why: 'Malus’ law was applied to unpolarised light.' },
      { text: '40 W m⁻²', error: 'formula', why: 'The analyser was ignored.' },
      { text: '20 W m⁻² (40 cos 60°)', error: 'formula', why: 'Intensity uses cos², not cos.' },
    ],
    solution: 'First polariser: I = ½(80) = 40 W m⁻². Second: I = 40 cos²60° = 10 W m⁻².',
  },
  {
    id: 'q7-07', kind: 'mcq', module: 7, section: 'm7-wave', dotPoints: ['m7-wm-3'], difficulty: 3, skill: 'concept',
    stem: 'Which experimental result supported Huygens’ wave model over Newton’s corpuscular model of light?',
    options: [
      { text: 'Light travels more slowly in water than in air.', correct: true, why: 'Newton’s model predicted a faster speed in denser media.' },
      { text: 'Light reflects with angle of incidence equal to angle of reflection.', error: 'concept', why: 'Both models explain reflection.' },
      { text: 'Light travels in straight lines and casts sharp shadows.', error: 'concept', why: 'This was used to support Newton’s model.' },
      { text: 'Light can eject electrons from metals.', error: 'concept', why: 'This supports a particle (photon) model.' },
    ],
    solution: 'Foucault (1850) measured a lower speed of light in water, as the wave model predicted.',
  },
  {
    id: 'q7-08', kind: 'mcq', module: 7, section: 'm7-quantum', dotPoints: ['m7-qm-1'], difficulty: 2, skill: 'calculation',
    stem: 'The spectrum of a star peaks at 290 nm. Its surface temperature is approximately:',
    options: [
      { text: '1.0 × 10⁴ K', correct: true, why: 'T = b/λ = 2.898 × 10⁻³/290 × 10⁻⁹.' },
      { text: '1.0 × 10⁻² K', error: 'units', why: 'nm not converted to m.' },
      { text: '8.4 × 10² K', error: 'formula', why: 'Incorrect rearrangement.' },
      { text: '5800 K', error: 'concept', why: 'That is the Sun, which peaks near 500 nm.' },
    ],
    solution: 'T = b/λ_max = (2.898 × 10⁻³)/(2.90 × 10⁻⁷) ≈ 1.0 × 10⁴ K.',
  },
  {
    id: 'q7-09', kind: 'mcq', module: 7, section: 'm7-quantum', dotPoints: ['m7-qm-1'], difficulty: 2, skill: 'graph',
    stem: 'What was the “ultraviolet catastrophe”?',
    figure: { kind: 'diagram', id: 'blackbody-curves' },
    options: [
      { text: 'Classical theory predicted blackbody intensity increasing without limit at short wavelengths', correct: true, why: 'Rayleigh–Jeans B ∝ T/λ⁴ diverges.' },
      { text: 'Hot objects emit dangerous amounts of UV radiation', error: 'concept', why: 'It was a failure of theory, not a hazard.' },
      { text: 'UV light could not eject photoelectrons', error: 'concept', why: 'UV readily ejects photoelectrons.' },
      { text: 'Measured blackbody curves had no peak', error: 'graph', why: 'Measured curves do peak; theory failed to predict this.' },
    ],
    solution: 'Classical (wave/equipartition) theory predicted infinite energy at short wavelengths; experiment showed a peak and fall-off. Planck’s quantisation resolved it.',
  },
  {
    id: 'q7-10', kind: 'mcq', module: 7, section: 'm7-quantum', dotPoints: ['m7-qm-2', 'm7-qm-3'], difficulty: 3, skill: 'concept',
    stem: 'Light above the threshold frequency shines on a metal. The intensity is doubled while the frequency is unchanged. What happens?',
    options: [
      { text: 'The number of photoelectrons per second doubles; K_max is unchanged.', correct: true, why: 'More photons, same energy per photon.' },
      { text: 'K_max doubles.', error: 'concept', why: 'K_max depends only on frequency.' },
      { text: 'The threshold frequency halves.', error: 'concept', why: 'f₀ = φ/h is a property of the metal.' },
      { text: 'The stopping voltage doubles.', error: 'concept', why: 'V₀ = K_max/e, unchanged.' },
    ],
    solution: 'Doubling intensity doubles the photon arrival rate, so twice as many electrons are emitted, each with the same maximum energy hf − φ.',
  },
  {
    id: 'q7-11', kind: 'mcq', module: 7, section: 'm7-quantum', dotPoints: ['m7-qm-3'], difficulty: 3, skill: 'graph',
    stem: 'A graph of maximum photoelectron kinetic energy (y-axis, J) against frequency (x-axis, Hz) is a straight line. What do the gradient and x-intercept represent?',
    figure: { kind: 'diagram', id: 'kmax-graph' },
    options: [
      { text: 'Gradient = Planck’s constant; x-intercept = threshold frequency', correct: true, why: 'K_max = hf − φ.' },
      { text: 'Gradient = work function; x-intercept = Planck’s constant', error: 'graph', why: 'φ is the magnitude of the y-intercept.' },
      { text: 'Gradient = threshold frequency; x-intercept = work function', error: 'graph', why: 'Compare with y = mx + c.' },
      { text: 'Gradient depends on the metal; x-intercept = h', error: 'graph', why: 'The gradient is the same for all metals.' },
    ],
    solution: 'K_max = hf − φ has the form y = mx + c with m = h, c = −φ, x-intercept f₀ = φ/h.',
  },
  {
    id: 'q7-12', kind: 'mcq', module: 7, section: 'm7-quantum', dotPoints: ['m7-qm-3'], difficulty: 3, skill: 'calculation',
    stem: 'Photons of energy 3.0 eV strike a metal with work function 2.3 eV. What is the stopping voltage?',
    options: [
      { text: '0.70 V', correct: true, why: 'K_max = 0.70 eV → V₀ = 0.70 V.' },
      { text: '5.3 V', error: 'sign', why: 'The work function must be subtracted.' },
      { text: '1.1 × 10⁻¹⁹ V', error: 'units', why: 'Energy in J is not voltage.' },
      { text: '3.0 V', error: 'concept', why: 'Part of the photon energy is needed to release the electron.' },
    ],
    solution: 'K_max = 3.0 − 2.3 = 0.70 eV, so V₀ = 0.70 V.',
  },
  {
    id: 'q7-13', kind: 'mcq', module: 7, section: 'm7-relativity', dotPoints: ['m7-sr-2'], difficulty: 3, skill: 'concept',
    stem: 'Muons created in the upper atmosphere travel towards Earth at 0.99c. Which observer measures the muon’s proper lifetime?',
    options: [
      { text: 'An observer moving with the muon', correct: true, why: 'Proper time is measured in the frame where the events (creation, decay) occur at the same place.' },
      { text: 'An observer on Earth’s surface', error: 'concept', why: 'For Earth, creation and decay happen at different places.' },
      { text: 'Both observers, since lifetimes are absolute', error: 'concept', why: 'Time intervals depend on the frame.' },
      { text: 'Neither observer', error: 'concept', why: 'The muon frame measures proper time.' },
    ],
    solution: 'In the muon’s rest frame, it is created and decays at the same location — so that frame measures proper time t₀.',
  },
  {
    id: 'q7-14', kind: 'mcq', module: 7, section: 'm7-relativity', dotPoints: ['m7-sr-2'], difficulty: 2, skill: 'calculation',
    stem: 'A spacecraft with proper length 100 m passes Earth at 0.80c. What length do Earth observers measure?',
    options: [
      { text: '60 m', correct: true, why: 'l = 100√(1 − 0.64) = 60 m.' },
      { text: '167 m', error: 'formula', why: 'Moving lengths contract, not expand.' },
      { text: '80 m', error: 'formula', why: 'This multiplies by v/c.' },
      { text: '36 m', error: 'calculation', why: 'The square root was omitted.' },
    ],
    solution: 'l = l₀√(1 − v²/c²) = 100 × 0.60 = 60 m.',
  },
  {
    id: 'q7-15', kind: 'mcq', module: 7, section: 'm7-relativity', dotPoints: ['m7-sr-3'], difficulty: 4, skill: 'concept',
    stem: 'Why can a massive particle never be accelerated to the speed of light?',
    options: [
      { text: 'Its relativistic momentum (and energy) would become infinite, requiring infinite work.', correct: true, why: 'p = γm₀v → ∞ as v → c.' },
      { text: 'Its mass becomes zero at the speed of light.', error: 'concept', why: 'Rest mass is invariant.' },
      { text: 'Air resistance always limits its speed.', error: 'concept', why: 'This applies even in a vacuum.' },
      { text: 'Time stops for the observer accelerating it.', error: 'concept', why: 'The observer’s own time is unaffected.' },
    ],
    solution: 'As v → c, γ → ∞, so p = γm₀v and the energy needed grow without bound; no finite force can reach c.',
  },
  {
    id: 'q7-16', kind: 'mcq', module: 7, section: 'm7-relativity', dotPoints: ['m7-sr-4'], difficulty: 3, skill: 'calculation',
    stem: 'An electron and a positron, both at rest, annihilate. What is the total energy released?',
    figure: { kind: 'diagram', id: 'annihilation' },
    options: [
      { text: '1.64 × 10⁻¹³ J', correct: true, why: 'E = 2m_ec².' },
      { text: '8.2 × 10⁻¹⁴ J', error: 'calculation', why: 'Only one particle’s mass was included.' },
      { text: '2.7 × 10⁻²² J', error: 'formula', why: 'c was not squared.' },
      { text: '0 J — matter and antimatter cancel', error: 'concept', why: 'Mass is converted into photon energy.' },
    ],
    solution: 'E = (2 × 9.109 × 10⁻³¹)(3.00 × 10⁸)² = 1.64 × 10⁻¹³ J (two 0.511 MeV photons).',
  },
  {
    id: 'q7-sa1', kind: 'sa', module: 7, section: 'm7-wave', dotPoints: ['m7-wm-2'], difficulty: 2, skill: 'calculation', marks: 3,
    stem: 'A diffraction grating has 300 lines per mm. The second-order maximum for a monochromatic source is observed at 21.1°. Calculate the wavelength (m).',
    numeric: { answer: 6.0e-7, unit: 'm', tol: 0.02, alt: [{ unit: 'nm', answer: 600 }] },
    criteria: [
      { marks: 1, text: 'd = 1/(3.00 × 10⁵) = 3.33 × 10⁻⁶ m.' },
      { marks: 1, text: 'Rearranges d sin θ = mλ with m = 2.' },
      { marks: 1, text: 'λ ≈ 6.0 × 10⁻⁷ m.' },
    ],
    model: 'd = 3.33 × 10⁻⁶ m. λ = d sin θ / m = 3.33 × 10⁻⁶ × sin 21.1°/2 ≈ 6.0 × 10⁻⁷ m (600 nm).',
  },
  {
    id: 'q7-sa2', kind: 'sa', module: 7, section: 'm7-wave', dotPoints: ['m7-wm-2', 'm7-wm-3'], difficulty: 2, skill: 'concept', marks: 3,
    stem: 'Explain how the results of Young’s double-slit experiment support the wave model of light.',
    figure: { kind: 'diagram', id: 'double-slit' },
    criteria: [
      { marks: 1, text: 'Describes the observed pattern of alternating bright and dark fringes.' },
      { marks: 1, text: 'Explains fringes by superposition: constructive (path difference mλ) and destructive ((m + ½)λ) interference.' },
      { marks: 1, text: 'States particles would produce only two bright bands — interference is a wave property.' },
    ],
    model: 'Light passing through two narrow slits produces a series of equally spaced bright and dark fringes. Where the path difference from the slits is a whole number of wavelengths the waves arrive in phase and interfere constructively (bright); where it is a half-integer number they cancel (dark). Particles travelling in straight lines would produce only two bright bands behind the slits; interference is uniquely a wave phenomenon, so the result supports the wave model.',
    keyTerms: ['interference', 'path difference', 'constructive', 'destructive', 'superposition', 'coherent', 'fringes'],
  },
  {
    id: 'q7-sa3', kind: 'sa', module: 7, section: 'm7-quantum', dotPoints: ['m7-qm-3'], difficulty: 3, skill: 'calculation', marks: 3,
    stem: 'Ultraviolet light of wavelength 250 nm shines on zinc (work function 4.3 eV). Calculate the maximum kinetic energy of the emitted photoelectrons (eV).',
    numeric: { answer: 0.663, unit: 'eV', tol: 0.03, alt: [{ unit: 'J', answer: 1.062e-19 }] },
    criteria: [
      { marks: 1, text: 'E = hc/λ = 7.95 × 10⁻¹⁹ J = 4.96 eV.' },
      { marks: 1, text: 'Applies K_max = hf − φ with consistent units.' },
      { marks: 1, text: 'K_max ≈ 0.66 eV (1.1 × 10⁻¹⁹ J).' },
    ],
    model: 'E = hc/λ = (6.626 × 10⁻³⁴ × 3.00 × 10⁸)/(250 × 10⁻⁹) = 7.95 × 10⁻¹⁹ J = 4.96 eV. K_max = 4.96 − 4.3 = 0.66 eV ≈ 1.1 × 10⁻¹⁹ J.',
  },
  {
    id: 'q7-sa4', kind: 'sa', module: 7, section: 'm7-quantum', dotPoints: ['m7-qm-2', 'm7-qm-1', 'm7-wm-3'], difficulty: 4, skill: 'concept', marks: 7,
    stem: 'Evaluate the extent to which experimental evidence from the 19th and early 20th centuries supported wave and particle models of light.',
    criteria: [
      { marks: 2, text: 'Wave evidence: Young’s interference, Fresnel/Poisson spot diffraction, Foucault’s slower speed in water, polarisation (transverse), Maxwell/Hertz EM waves.' },
      { marks: 2, text: 'Particle evidence: blackbody radiation & UV catastrophe → Planck quanta; photoelectric effect observations explained by Einstein’s photons.' },
      { marks: 2, text: 'Explains WHY each piece of evidence supports one model (e.g. threshold frequency inconsistent with wave energy ∝ intensity).' },
      { marks: 1, text: 'Makes a judgement: neither model alone explains all evidence → wave–particle duality / complementary models.' },
    ],
    model: 'Through the 1800s the wave model became dominant: Young’s double-slit interference (1801) and Fresnel’s diffraction theory — dramatically confirmed by the Poisson/Arago spot — could not be explained by Newton’s corpuscles; Foucault showed light is slower in water, contradicting Newton’s prediction; polarisation showed light is a transverse wave; and Maxwell’s theory, confirmed by Hertz, identified light as an EM wave travelling at c. However, the wave model failed for blackbody radiation (the ultraviolet catastrophe), which Planck resolved by quantising energy (E = hf), and for the photoelectric effect: the threshold frequency, instantaneous emission and K_max depending on frequency but not intensity contradict a continuous wave, but are explained by Einstein’s photons (K_max = hf − φ), confirmed by Millikan. Overall the evidence supports wave behaviour in propagation and particle behaviour in energy exchange — neither model is complete, leading to wave–particle duality.',
    keyTerms: ['interference', 'diffraction', 'polarisation', 'Maxwell', 'UV catastrophe', 'Planck', 'photoelectric', 'threshold', 'duality', 'judgement'],
  },
  {
    id: 'q7-sa5', kind: 'sa', module: 7, section: 'm7-relativity', dotPoints: ['m7-sr-2'], difficulty: 4, skill: 'calculation', marks: 4,
    stem: 'Muons have a proper mean lifetime of 2.2 μs. A muon travels at 0.98c relative to Earth. Calculate the average distance it travels in Earth’s frame before decaying (m).',
    numeric: { answer: 3251, unit: 'm', tol: 0.02 },
    criteria: [
      { marks: 1, text: 'γ = 1/√(1 − 0.98²) = 5.03.' },
      { marks: 1, text: 'Dilated lifetime t = γt₀ = 11.1 μs.' },
      { marks: 1, text: 'd = vt with v = 0.98 × 3.00 × 10⁸.' },
      { marks: 1, text: 'd ≈ 3.3 × 10³ m (vs 650 m classically).' },
    ],
    model: 'γ = 1/√(1 − 0.9604) = 5.03. t = 5.03 × 2.2 μs = 11.1 μs. d = 0.98 × 3.00 × 10⁸ × 11.1 × 10⁻⁶ ≈ 3.3 × 10³ m — about five times the classical estimate of 647 m.',
  },
  {
    id: 'q7-sa6', kind: 'sa', module: 7, section: 'm7-quantum', dotPoints: ['m7-qm-1', 'm7-em-6'], difficulty: 1, skill: 'calculation', marks: 2,
    stem: 'The intensity of radiation from a star peaks at 400 nm. Calculate its surface temperature (K).',
    numeric: { answer: 7245, unit: 'K', tol: 0.02 },
    criteria: [
      { marks: 1, text: 'Uses Wien’s law T = b/λ_max with λ in metres.' },
      { marks: 1, text: 'T ≈ 7.2 × 10³ K.' },
    ],
    model: 'T = 2.898 × 10⁻³/400 × 10⁻⁹ ≈ 7.2 × 10³ K.',
  },
  {
    id: 'q7-sa7', kind: 'sa', module: 7, section: 'm7-relativity', dotPoints: ['m7-sr-1'], difficulty: 3, skill: 'concept', marks: 4,
    stem: 'Describe the Michelson–Morley experiment and explain its significance for Einstein’s theory of special relativity.',
    figure: { kind: 'diagram', id: 'michelson' },
    criteria: [
      { marks: 1, text: 'Purpose: detect Earth’s motion through the aether (aether wind).' },
      { marks: 1, text: 'Method: interferometer splits light into perpendicular paths; recombined to form fringes; apparatus rotated.' },
      { marks: 1, text: 'Result: no significant fringe shift (null result).' },
      { marks: 1, text: 'Significance: no evidence for aether; consistent with c being the same in all directions/frames — Einstein’s second postulate.' },
    ],
    model: 'Michelson and Morley aimed to detect Earth’s motion through the hypothesised luminiferous aether. Their interferometer split a light beam into two perpendicular arms, reflected each back, and recombined them to form interference fringes. If light moved at different speeds relative to Earth along and across the aether wind, rotating the apparatus should shift the fringes. No significant shift was observed. The null result provided no evidence for the aether and is consistent with the speed of light being the same in all directions and for all inertial observers — the basis of Einstein’s second postulate.',
    keyTerms: ['aether', 'interferometer', 'fringe', 'null result', 'rotated', 'constant speed of light', 'postulate'],
  },
  {
    id: 'q7-sa8', kind: 'sa', module: 7, section: 'm7-relativity', dotPoints: ['m7-sr-4'], difficulty: 2, skill: 'calculation', marks: 2,
    stem: 'The Sun radiates energy at a rate of 3.85 × 10²⁶ W. Calculate the mass the Sun loses each second as a result (kg).',
    numeric: { answer: 4.278e9, unit: 'kg', tol: 0.02 },
    criteria: [
      { marks: 1, text: 'Uses m = E/c² with E = 3.85 × 10²⁶ J in one second.' },
      { marks: 1, text: '≈ 4.3 × 10⁹ kg.' },
    ],
    model: 'm = E/c² = 3.85 × 10²⁶/(3.00 × 10⁸)² ≈ 4.3 × 10⁹ kg each second.',
  },

  /* ============================== MODULE 8 ============================== */
  {
    id: 'q8-01', kind: 'mcq', module: 8, section: 'm8-origins', dotPoints: ['m8-oe-6'], difficulty: 1, skill: 'graph',
    stem: 'On a conventional Hertzsprung–Russell diagram, surface temperature:',
    figure: { kind: 'diagram', id: 'hr-diagram' },
    options: [
      { text: 'increases from right to left', correct: true, why: 'Hot O/B stars are on the left.' },
      { text: 'increases from left to right', error: 'graph', why: 'The axis is reversed by convention.' },
      { text: 'increases from bottom to top', error: 'graph', why: 'The vertical axis is luminosity.' },
      { text: 'is not shown', error: 'graph', why: 'Temperature (or spectral class) is the horizontal axis.' },
    ],
    solution: 'The H–R diagram plots temperature decreasing to the right (spectral classes O B A F G K M from left to right).',
  },
  {
    id: 'q8-02', kind: 'mcq', module: 8, section: 'm8-origins', dotPoints: ['m8-oe-6'], difficulty: 2, skill: 'graph',
    stem: 'A star lies in the upper-right region of the H–R diagram. Which description best fits it?',
    options: [
      { text: 'Cool, very luminous and very large — a red giant or supergiant', correct: true, why: 'High L with low T requires a large surface area.' },
      { text: 'Hot, faint and small — a white dwarf', error: 'graph', why: 'White dwarfs are lower left.' },
      { text: 'A main-sequence star like the Sun', error: 'graph', why: 'The main sequence runs diagonally.' },
      { text: 'Hot and luminous — a blue giant', error: 'graph', why: 'Hot stars are on the left.' },
    ],
    solution: 'Upper right = low temperature but high luminosity → enormous radius: red giants/supergiants.',
  },
  {
    id: 'q8-03', kind: 'mcq', module: 8, section: 'm8-origins', dotPoints: ['m8-oe-4'], difficulty: 2, skill: 'concept',
    stem: 'Dark absorption lines in a star’s spectrum are produced when:',
    options: [
      { text: 'cooler gas in the star’s atmosphere absorbs photons of specific energies from the continuous spectrum', correct: true, why: 'Electrons absorb exactly ΔE = hf.' },
      { text: 'the star emits no light at those wavelengths because it is too cold', error: 'concept', why: 'Lines arise from absorption, not temperature limits.' },
      { text: 'dust between Earth and the star blocks all colours equally', error: 'concept', why: 'That would not give sharp lines.' },
      { text: 'electrons fall to lower energy levels', error: 'concept', why: 'That produces emission lines.' },
    ],
    solution: 'Atoms in the cooler outer layers absorb photons whose energies match their energy-level differences, removing those wavelengths.',
  },
  {
    id: 'q8-04', kind: 'mcq', module: 8, section: 'm8-origins', dotPoints: ['m8-oe-2'], difficulty: 3, skill: 'calculation',
    stem: 'A galaxy is receding at 21 000 km s⁻¹. Taking H₀ = 70 km s⁻¹ Mpc⁻¹, its distance is approximately:',
    options: [
      { text: '300 Mpc', correct: true, why: 'd = v/H₀ = 21 000/70.' },
      { text: '1.5 × 10⁶ Mpc', error: 'formula', why: 'This multiplies v and H₀.' },
      { text: '0.0033 Mpc', error: 'formula', why: 'This is H₀/v.' },
      { text: '3.0 × 10⁵ Mpc', error: 'units', why: 'km s⁻¹ was converted to m s⁻¹ on one side only.' },
    ],
    solution: 'd = v/H₀ = 21 000/70 = 300 Mpc.',
  },
  {
    id: 'q8-05', kind: 'mcq', module: 8, section: 'm8-origins', dotPoints: ['m8-oe-7'], difficulty: 2, skill: 'concept',
    stem: 'The CNO cycle is the dominant hydrogen-fusion process in:',
    options: [
      { text: 'main-sequence stars more massive than the Sun, with hotter cores', correct: true, why: 'Higher Coulomb barrier needs higher temperature.' },
      { text: 'all main-sequence stars, including the Sun', error: 'concept', why: 'The Sun mainly uses the pp chain.' },
      { text: 'white dwarfs', error: 'concept', why: 'White dwarfs have no fusion.' },
      { text: 'the first minutes after the Big Bang', error: 'concept', why: 'No C, N or O existed then.' },
    ],
    solution: 'The CNO cycle requires higher temperatures (~> 1.7 × 10⁷ K), so it dominates in hotter, more massive stars.',
  },
  {
    id: 'q8-06', kind: 'mcq', module: 8, section: 'm8-structure', dotPoints: ['m8-sa-1'], difficulty: 2, skill: 'concept',
    stem: 'Which finding from Thomson’s 1897 experiments was most significant for atomic structure?',
    options: [
      { text: 'Cathode-ray particles had the same charge-to-mass ratio regardless of the cathode metal.', correct: true, why: 'This showed a universal constituent of all atoms.' },
      { text: 'Cathode rays are electromagnetic waves.', error: 'concept', why: 'They were shown to be charged particles.' },
      { text: 'The electron’s charge is 1.6 × 10⁻¹⁹ C.', error: 'concept', why: 'That was Millikan.' },
      { text: 'Atoms have a small dense nucleus.', error: 'concept', why: 'That was Rutherford.' },
    ],
    solution: 'A constant q/m for all materials meant electrons are found in every atom — the atom is divisible.',
  },
  {
    id: 'q8-07', kind: 'mcq', module: 8, section: 'm8-structure', dotPoints: ['m8-sa-1'], difficulty: 3, skill: 'investigation',
    stem: 'In an oil-drop experiment, charges of 3.2, 4.8 and 8.0 (× 10⁻¹⁹ C) are measured on different drops. These results:',
    options: [
      { text: 'are consistent with charge being quantised in units of 1.6 × 10⁻¹⁹ C', correct: true, why: 'They are 2e, 3e and 5e.' },
      { text: 'show charge is quantised in units of 3.2 × 10⁻¹⁹ C', error: 'skills', why: '4.8 is not a multiple of 3.2.' },
      { text: 'show charge is continuous', error: 'concept', why: 'All values are integer multiples of e.' },
      { text: 'prove each drop carries one electron', error: 'concept', why: 'They carry 2, 3 and 5 elementary charges.' },
    ],
    solution: 'The greatest common factor is 1.6 × 10⁻¹⁹ C: the values are 2e, 3e and 5e.',
  },
  {
    id: 'q8-08', kind: 'mcq', module: 8, section: 'm8-structure', dotPoints: ['m8-sa-2'], difficulty: 2, skill: 'concept',
    stem: 'In the Geiger–Marsden experiment, a very small fraction of alpha particles were scattered through angles greater than 90°. This showed that:',
    figure: { kind: 'diagram', id: 'gold-foil' },
    options: [
      { text: 'the positive charge and most of the mass of an atom are concentrated in a tiny nucleus', correct: true, why: 'Only a concentrated charge gives a field strong enough to reverse an alpha.' },
      { text: 'the atom is a uniform sphere of positive charge with embedded electrons', error: 'concept', why: 'That is Thomson’s model, which predicts only small deflections.' },
      { text: 'electrons orbit in fixed energy levels', error: 'concept', why: 'That is Bohr’s later model.' },
      { text: 'alpha particles are negatively charged', error: 'concept', why: 'Alpha particles are positive.' },
    ],
    solution: 'Large deflections need a very strong repulsive field from concentrated positive charge — a small, massive nucleus.',
  },
  {
    id: 'q8-09', kind: 'mcq', module: 8, section: 'm8-structure', dotPoints: ['m8-sa-2'], difficulty: 3, skill: 'concept',
    stem: 'Chadwick ruled out gamma radiation as the identity of the penetrating neutral radiation from beryllium because:',
    options: [
      { text: 'gamma photons could not transfer enough momentum to eject protons from paraffin with the observed energies', correct: true, why: 'Collision analysis required a massive neutral particle.' },
      { text: 'the radiation was deflected by a magnetic field', error: 'concept', why: 'It was not deflected — it was neutral.' },
      { text: 'gamma rays cannot travel through metal', error: 'concept', why: 'Gamma rays are very penetrating.' },
      { text: 'the radiation had a negative charge', error: 'concept', why: 'It was neutral.' },
    ],
    solution: 'Applying conservation of momentum and energy to the recoiling protons and nitrogen nuclei required a neutral particle with mass ≈ m_p.',
  },
  {
    id: 'q8-10', kind: 'mcq', module: 8, section: 'm8-quantum', dotPoints: ['m8-qa-3'], difficulty: 3, skill: 'calculation',
    stem: 'What is the wavelength of the photon emitted when a hydrogen electron falls from n = 5 to n = 2?',
    options: [
      { text: '434 nm', correct: true, why: '1/λ = R(1/4 − 1/25).' },
      { text: '656 nm', error: 'calculation', why: 'That is n = 3 → 2.' },
      { text: '95 nm', error: 'formula', why: 'This uses n_f = 1.' },
      { text: '2.30 × 10⁶ m', error: 'formula', why: 'This is 1/λ, not λ.' },
    ],
    solution: '1/λ = 1.097 × 10⁷(0.25 − 0.04) = 2.30 × 10⁶ m⁻¹ → λ = 4.34 × 10⁻⁷ m.',
  },
  {
    id: 'q8-11', kind: 'mcq', module: 8, section: 'm8-quantum', dotPoints: ['m8-qa-4'], difficulty: 3, skill: 'calculation',
    stem: 'What is the de Broglie wavelength of an electron moving at 1.0 × 10⁶ m s⁻¹?',
    options: [
      { text: '7.3 × 10⁻¹⁰ m', correct: true, why: 'λ = h/mv = 6.626 × 10⁻³⁴/(9.109 × 10⁻³¹ × 10⁶).' },
      { text: '4.0 × 10⁻¹³ m', error: 'formula', why: 'The proton mass was used.' },
      { text: '6.6 × 10⁻⁴⁰ m', error: 'formula', why: 'Mass was omitted.' },
      { text: '1.4 × 10⁹ m', error: 'formula', why: 'This is mv/h.' },
    ],
    solution: 'λ = h/(mv) = 7.3 × 10⁻¹⁰ m — comparable to atomic spacings, so electrons diffract from crystals.',
  },
  {
    id: 'q8-12', kind: 'mcq', module: 8, section: 'm8-quantum', dotPoints: ['m8-qa-1'], difficulty: 2, skill: 'concept',
    stem: 'Which is a limitation of the Bohr model of the atom?',
    options: [
      { text: 'It could not account for the spectra of atoms with more than one electron.', correct: true, why: 'It only works for hydrogen-like atoms.' },
      { text: 'It could not explain the hydrogen line spectrum.', error: 'concept', why: 'That was its major success.' },
      { text: 'It had no nucleus.', error: 'concept', why: 'It built on Rutherford’s nucleus.' },
      { text: 'It predicted electrons spiral into the nucleus.', error: 'concept', why: 'That was Rutherford’s problem, which Bohr addressed.' },
    ],
    solution: 'Bohr’s model successfully predicted hydrogen’s lines but failed for multi-electron atoms, line intensities and fine/Zeeman splitting.',
  },
  {
    id: 'q8-13', kind: 'mcq', module: 8, section: 'm8-nucleus', dotPoints: ['m8-pn-2'], difficulty: 2, skill: 'calculation',
    stem: 'What fraction of a radioactive sample remains undecayed after three half-lives?',
    figure: { kind: 'diagram', id: 'decay-curve' },
    options: [
      { text: '1/8', correct: true, why: '(½)³.' },
      { text: '1/3', error: 'concept', why: 'Decay is exponential, not linear.' },
      { text: '1/6', error: 'calculation', why: 'Halves multiply, they do not add.' },
      { text: '0', error: 'concept', why: 'Exponential decay never reaches exactly zero.' },
    ],
    solution: 'Each half-life halves the remaining amount: ½ × ½ × ½ = 1/8.',
  },
  {
    id: 'q8-14', kind: 'mcq', module: 8, section: 'm8-nucleus', dotPoints: ['m8-pn-1'], difficulty: 3, skill: 'concept',
    stem: 'Carbon-14 (Z = 6) undergoes β⁻ decay. The daughter nucleus is:',
    options: [
      { text: 'nitrogen-14 (Z = 7)', correct: true, why: 'n → p + e⁻ + ν̄: Z + 1, A unchanged.' },
      { text: 'boron-14 (Z = 5)', error: 'sign', why: 'That would be β⁺ decay.' },
      { text: 'carbon-13 (Z = 6)', error: 'concept', why: 'Beta decay does not change A.' },
      { text: 'beryllium-10 (Z = 4)', error: 'concept', why: 'That would be alpha decay.' },
    ],
    solution: '¹⁴₆C → ¹⁴₇N + ⁰₋₁e + ν̄_e. A and charge are conserved.',
  },
  {
    id: 'q8-15', kind: 'mcq', module: 8, section: 'm8-nucleus', dotPoints: ['m8-pn-4', 'm8-pn-5'], difficulty: 3, skill: 'graph',
    stem: 'The graph of binding energy per nucleon against mass number peaks near iron-56. This explains why:',
    figure: { kind: 'diagram', id: 'be-curve' },
    options: [
      { text: 'both fission of heavy nuclei and fusion of light nuclei release energy', correct: true, why: 'Both move products towards higher BE per nucleon.' },
      { text: 'only fusion releases energy', error: 'graph', why: 'Fission of heavy nuclei also increases BE per nucleon.' },
      { text: 'iron is the most radioactive element', error: 'concept', why: 'High BE/A means very stable.' },
      { text: 'heavy nuclei have the highest binding energy per nucleon', error: 'graph', why: 'BE/A decreases beyond iron.' },
    ],
    solution: 'Reactions that increase binding energy per nucleon reduce total mass and release energy — fusion below Fe, fission above Fe.',
  },
  {
    id: 'q8-16', kind: 'mcq', module: 8, section: 'm8-deep', dotPoints: ['m8-da-2'], difficulty: 2, skill: 'concept',
    stem: 'A proton consists of which quarks, and what is its total charge?',
    options: [
      { text: 'uud; +1e', correct: true, why: '+⅔ + ⅔ − ⅓ = +1.' },
      { text: 'udd; +1e', error: 'calculation', why: 'udd = 0 (a neutron).' },
      { text: 'uuu; +2e', error: 'concept', why: 'That is the Δ⁺⁺ baryon.' },
      { text: 'ud̄; +1e', error: 'concept', why: 'That is a π⁺ meson.' },
    ],
    solution: 'Up = +⅔e, down = −⅓e: uud gives +1e.',
  },
  {
    id: 'q8-17', kind: 'mcq', module: 8, section: 'm8-deep', dotPoints: ['m8-da-2'], difficulty: 3, skill: 'concept',
    stem: 'Which statement correctly describes mesons?',
    options: [
      { text: 'They are hadrons consisting of a quark–antiquark pair.', correct: true, why: 'e.g. π⁺ = ud̄.' },
      { text: 'They are leptons with mass between electrons and protons.', error: 'concept', why: 'The name originally suggested this, but mesons are hadrons.' },
      { text: 'They consist of three quarks.', error: 'concept', why: 'Those are baryons.' },
      { text: 'They are force carriers of the electromagnetic interaction.', error: 'concept', why: 'That is the photon.' },
    ],
    solution: 'Hadrons divide into baryons (qqq) and mesons (qq̄).',
  },
  {
    id: 'q8-18', kind: 'mcq', module: 8, section: 'm8-nucleus', dotPoints: ['m8-pn-6', 'm8-pn-5'], difficulty: 4, skill: 'calculation',
    stem: 'For ²H + ³H → ⁴He + n, the masses are 2.014102 u, 3.016049 u, 4.002603 u and 1.008665 u. What energy is released?',
    options: [
      { text: '17.6 MeV', correct: true, why: 'Δm = 0.018883 u × 931.5 MeV/u.' },
      { text: '0.0189 MeV', error: 'formula', why: 'Δm in u has not been converted.' },
      { text: '−17.6 MeV', error: 'sign', why: 'Energy is released — products are lighter.' },
      { text: '2.8 × 10⁻²⁸ MeV', error: 'units', why: 'Unit confusion between kg and MeV.' },
    ],
    solution: 'Δm = (2.014102 + 3.016049) − (4.002603 + 1.008665) = 0.018883 u. E = 0.018883 × 931.5 = 17.6 MeV.',
  },
  {
    id: 'q8-sa1', kind: 'sa', module: 8, section: 'm8-origins', dotPoints: ['m8-oe-2', 'm7-em-6'], difficulty: 3, skill: 'calculation', marks: 4,
    stem: 'The H-alpha line (656.3 nm in the laboratory) is observed at 662.9 nm in the spectrum of a galaxy. Using H₀ = 70 km s⁻¹ Mpc⁻¹, estimate the galaxy’s distance (Mpc).',
    numeric: { answer: 43.1, unit: 'Mpc', tol: 0.03 },
    criteria: [
      { marks: 1, text: 'z = Δλ/λ₀ = 6.6/656.3 = 0.0101.' },
      { marks: 1, text: 'v = zc ≈ 3.0 × 10⁶ m s⁻¹ = 3.0 × 10³ km s⁻¹.' },
      { marks: 1, text: 'd = v/H₀ with consistent units.' },
      { marks: 1, text: 'd ≈ 43 Mpc.' },
    ],
    model: 'z = (662.9 − 656.3)/656.3 = 0.0101. v ≈ zc = 0.0101 × 3.00 × 10⁵ km s⁻¹ = 3.0 × 10³ km s⁻¹. d = v/H₀ = 3017/70 ≈ 43 Mpc. The redshift means the galaxy is receding — evidence of expansion.',
  },
  {
    id: 'q8-sa2', kind: 'sa', module: 8, section: 'm8-structure', dotPoints: ['m8-sa-1'], difficulty: 3, skill: 'concept', marks: 5,
    stem: 'Describe how Thomson determined the charge-to-mass ratio of cathode-ray particles, and explain the significance of his results.',
    figure: { kind: 'diagram', id: 'velocity-selector' },
    criteria: [
      { marks: 1, text: 'Crossed E and B fields adjusted so beam is undeflected: qE = qvB → v = E/B.' },
      { marks: 1, text: 'E field (or B field) alone used to deflect the beam; deflection/radius measured.' },
      { marks: 1, text: 'Combines to obtain q/m (e.g. q/m = E/(B²r)).' },
      { marks: 1, text: 'q/m same for all cathode materials and ~1800× hydrogen ion.' },
      { marks: 1, text: 'Significance: electrons are universal subatomic particles; atoms are divisible → plum-pudding model.' },
    ],
    model: 'Thomson passed cathode rays between parallel plates (E field) inside a magnetic field perpendicular to it. He adjusted the fields until the beam was undeflected, so qE = qvB and v = E/B. With the magnetic field alone the beam followed a circular arc of radius r = mv/(qB) (or with E alone he measured the deflection). Combining gives q/m = E/(B²r) ≈ 1.76 × 10¹¹ C kg⁻¹. The ratio was the same for every cathode material and gas and about 1800 times greater than that of hydrogen ions, suggesting a tiny, negatively charged particle common to all atoms — the electron. Atoms were therefore divisible, leading to his plum-pudding model.',
    keyTerms: ['crossed fields', 'v = E/B', 'radius', 'q/m', 'same for all', 'electron', 'universal', 'plum pudding'],
  },
  {
    id: 'q8-sa3', kind: 'sa', module: 8, section: 'm8-quantum', dotPoints: ['m8-qa-3'], difficulty: 2, skill: 'calculation', marks: 2,
    stem: 'Calculate the energy (in eV) of the photon emitted when an electron in a hydrogen atom drops from n = 4 to n = 2.',
    numeric: { answer: 2.55, unit: 'eV', tol: 0.02, alt: [{ unit: 'J', answer: 4.09e-19 }] },
    criteria: [
      { marks: 1, text: 'Uses Rydberg (λ = 486 nm) then E = hc/λ, or E_n = −13.6/n².' },
      { marks: 1, text: 'E ≈ 2.55 eV (4.09 × 10⁻¹⁹ J).' },
    ],
    model: '1/λ = 1.097 × 10⁷(1/4 − 1/16) → λ = 486 nm. E = hc/λ = 4.09 × 10⁻¹⁹ J = 2.55 eV. (Check: −0.85 − (−3.40) = 2.55 eV.)',
  },
  {
    id: 'q8-sa4', kind: 'sa', module: 8, section: 'm8-quantum', dotPoints: ['m8-qa-1', 'm8-qa-5'], difficulty: 3, skill: 'concept', marks: 4,
    stem: 'Assess the limitations of Bohr’s model of the atom and explain how Schrödinger’s work addressed them.',
    criteria: [
      { marks: 2, text: 'Limitations: only hydrogen/one-electron; no explanation of line intensities, fine/Zeeman splitting; quantisation assumed not explained; mixes classical orbits with quantum rules.' },
      { marks: 1, text: 'Schrödinger: wave equation for electron wave functions; quantisation arises naturally; |ψ|² gives probability (orbitals).' },
      { marks: 1, text: 'Judgement: quantum-mechanical model extends to multi-electron atoms; replaces definite orbits with probability distributions.' },
    ],
    model: 'Bohr’s model explained the hydrogen spectrum but only worked for one-electron atoms; it could not predict relative line intensities or the splitting of lines (fine structure, Zeeman effect), assumed rather than explained the quantisation of angular momentum, and inconsistently combined classical orbits with quantum jumps. Schrödinger treated the electron as a matter wave described by a wave function satisfying his wave equation. Quantised energy levels emerge naturally as allowed standing-wave solutions, and |ψ|² gives the probability of finding the electron in a region (orbitals) instead of a definite path. The model applies to multi-electron atoms and chemical bonding, making it far more successful than Bohr’s.',
    keyTerms: ['hydrogen only', 'multi-electron', 'intensities', 'Zeeman', 'wave function', 'probability', 'orbital', 'naturally'],
  },
  {
    id: 'q8-sa5', kind: 'sa', module: 8, section: 'm8-quantum', dotPoints: ['m8-qa-4'], difficulty: 3, skill: 'calculation', marks: 3,
    stem: 'In the Davisson–Germer experiment electrons were accelerated from rest through 54 V. Calculate their de Broglie wavelength (m).',
    numeric: { answer: 1.669e-10, unit: 'm', tol: 0.02, alt: [{ unit: 'nm', answer: 0.1669 }] },
    criteria: [
      { marks: 1, text: 'Uses qV = ½mv² (v = 4.36 × 10⁶ m s⁻¹) or p = √(2meV).' },
      { marks: 1, text: 'Substitutes into λ = h/mv.' },
      { marks: 1, text: 'λ ≈ 1.67 × 10⁻¹⁰ m.' },
    ],
    model: 'v = √(2 × 1.602 × 10⁻¹⁹ × 54/9.109 × 10⁻³¹) = 4.36 × 10⁶ m s⁻¹. λ = h/(mv) = 6.626 × 10⁻³⁴/(9.109 × 10⁻³¹ × 4.36 × 10⁶) ≈ 1.67 × 10⁻¹⁰ m — matching the spacing of atoms in the nickel crystal.',
  },
  {
    id: 'q8-sa6', kind: 'sa', module: 8, section: 'm8-nucleus', dotPoints: ['m8-pn-2'], difficulty: 3, skill: 'calculation', marks: 3,
    stem: 'A sample of iodine-131 (half-life 8.02 days) has an activity of 400 MBq. Calculate its activity after 20 days (MBq).',
    numeric: { answer: 71.0, unit: 'MBq', tol: 0.02 },
    criteria: [
      { marks: 1, text: 'λ = ln 2/8.02 = 0.0864 day⁻¹.' },
      { marks: 1, text: 'A = A₀e^{−λt}.' },
      { marks: 1, text: 'A ≈ 71 MBq.' },
    ],
    model: 'λ = 0.693/8.02 = 0.0864 day⁻¹. A = 400e^{−0.0864 × 20} = 400 × 0.178 ≈ 71 MBq.',
  },
  {
    id: 'q8-sa7', kind: 'sa', module: 8, section: 'm8-nucleus', dotPoints: ['m8-pn-6', 'm8-pn-4'], difficulty: 4, skill: 'calculation', marks: 3,
    stem: 'Radium-226 (226.025410 u) alpha decays to radon-222 (222.017578 u). The mass of a helium-4 atom is 4.002603 u. Calculate the energy released (MeV).',
    numeric: { answer: 4.871, unit: 'MeV', tol: 0.02 },
    criteria: [
      { marks: 1, text: 'Writes ²²⁶₈₈Ra → ²²²₈₆Rn + ⁴₂He.' },
      { marks: 1, text: 'Δm = 0.005229 u.' },
      { marks: 1, text: 'E = 0.005229 × 931.5 ≈ 4.87 MeV.' },
    ],
    model: 'Δm = 226.025410 − (222.017578 + 4.002603) = 0.005229 u. E = 0.005229 × 931.5 ≈ 4.87 MeV, shared mainly as kinetic energy of the alpha particle.',
  },
  {
    id: 'q8-sa8', kind: 'sa', module: 8, section: 'm8-deep', dotPoints: ['m8-da-1', 'm8-da-3'], difficulty: 4, skill: 'concept', marks: 5,
    stem: 'Analyse the evidence that protons and neutrons are not fundamental particles, and explain the role of particle accelerators in obtaining this evidence.',
    criteria: [
      { marks: 1, text: 'Deep inelastic scattering: high-energy electrons scattered at large angles from protons → point-like charged constituents.' },
      { marks: 1, text: 'Relates high energy to short de Broglie wavelength / resolving small structure.' },
      { marks: 1, text: 'Additional evidence: large number of hadrons discovered; neutron’s magnetic moment.' },
      { marks: 1, text: 'Accelerators: electric fields accelerate, magnetic fields steer/focus; detectors measure products.' },
      { marks: 1, text: 'Links evidence to the quark model (uud, udd) and Standard Model predictions verified at accelerators.' },
    ],
    model: 'At SLAC (1968) electrons accelerated to ~20 GeV were scattered from protons. Far more were scattered through large angles than expected for a uniform proton — just as Geiger–Marsden revealed the nucleus, this revealed point-like charged constituents (quarks). High energies are needed because the probe’s de Broglie wavelength (λ = h/p) must be smaller than the structure being resolved. The discovery of many hadrons in accelerator collisions and the neutron’s non-zero magnetic moment also implied internal charged structure. Accelerators use electric fields to accelerate charged particles and magnetic fields to steer and focus them; detectors track the products. These results support the quark model (proton = uud, neutron = udd) within the Standard Model.',
    keyTerms: ['deep inelastic', 'scattering', 'quarks', 'de Broglie', 'electric field', 'magnetic field', 'detector', 'hadrons'],
  },
];

/** Deterministic option order per question (FNV-1a hash of the id seeds a Fisher–Yates shuffle). */
function seededShuffle<T>(arr: T[], key: string): T[] {
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 0x01000193) >>> 0;
  const rand = () => {
    h = (h + 0x6d2b79f5) >>> 0;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const QUESTIONS: Question[] = RAW_QUESTIONS.map((q) => (q.kind === 'mcq' ? { ...q, options: seededShuffle(q.options, q.id) } : q));

export const mcqs = () => QUESTIONS.filter((q): q is MCQ => q.kind === 'mcq');
export const shortAnswers = () => QUESTIONS.filter((q): q is ShortAnswer => q.kind === 'sa');

/**
 * Numeric answer checking: relative tolerance on value, plus unit matching and sign.
 * Returns a diagnosis used for performance tracking.
 */
export function checkNumeric(q: ShortAnswer, value: number, unit: string): { correct: boolean; error?: ErrorType; message: string } {
  const n = q.numeric!;
  const norm = (u: string) => u.replace(/\s+/g, '').replace(/\^/g, '').replace(/−/g, '-').replace(/⁻¹/g, '-1').replace(/⁻²/g, '-2').replace(/²/g, '2').replace(/μ/g, 'u').replace(/°|deg/g, 'deg').toLowerCase();
  const options = [{ unit: n.unit, answer: n.answer }, ...(n.alt ?? [])];
  const tol = n.tol ?? 0.02;
  const match = options.find((o) => norm(o.unit) === norm(unit));
  if (!Number.isFinite(value)) return { correct: false, error: 'calculation', message: 'Enter a number (scientific notation like 3.2e-19 is fine).' };
  if (!match) {
    const any = options.find((o) => Math.abs(value - o.answer) <= Math.abs(o.answer) * tol);
    return { correct: false, error: 'units', message: any ? 'Your number matches, but the unit is missing or incorrect.' : `Check the unit — expected ${options.map((o) => o.unit).join(' or ')}.` };
  }
  const target = match.answer;
  if (Math.abs(value - target) <= Math.abs(target) * tol) return { correct: true, message: 'Correct!' };
  if (Math.abs(-value - target) <= Math.abs(target) * tol) return { correct: false, error: 'sign', message: 'The magnitude is right but the sign is wrong — check your sign convention.' };
  const ratio = Math.abs(value / target);
  const lg = Math.log10(ratio);
  if (Math.abs(lg - Math.round(lg)) < 0.01 && Math.round(lg) !== 0) return { correct: false, error: 'units', message: `Off by a factor of 10^${Math.round(lg)} — check unit conversions and prefixes (km, nm, μs, MHz…).` };
  if (Math.abs(ratio - 2) < 0.03 || Math.abs(ratio - 0.5) < 0.015) return { correct: false, error: 'formula', message: 'Off by a factor of 2 — check for a missing ½ or factor of 2 (e.g. diameter vs radius, ½mv², 2u sin θ).' };
  return { correct: false, error: 'calculation', message: 'Not quite. Re-check your substitution and calculation, then try again.' };
}

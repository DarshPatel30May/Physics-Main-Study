import { C, rad } from '@/lib/physics/constants';
import { sig, sigTex } from '@/lib/physics/stats';
import { ATOMIC_MASS } from '@/lib/physics/nuclear';
import type { ErrorType } from './questions';
import type { ModuleNo } from './formulas';

export interface Given {
  sym: string;
  label: string;
  value: number;
  unit: string;
  /** shown value (as stated in the question, possibly non-SI) */
  display?: string;
}

export interface Choice {
  tex: string;
  correct?: boolean;
  why: string;
}

export interface Mistake {
  value: number;
  type: ErrorType;
  message: string;
}

export interface ProblemInstance {
  text: string;
  situation: string;
  given: Given[];
  unknown: { sym: string; label: string; unit: string };
  /** options for identifying the unknown (step 1) */
  unknownOptions: string[];
  assumptions: string[];
  diagram: string;
  diagramNote: string;
  formulaOptions: Choice[];
  rearrangeOptions: Choice[];
  /** SI conversion check (step 5) */
  conversion?: { prompt: string; answer: number; unit: string };
  substitution: string;
  intermediate: string[];
  answer: number;
  unit: string;
  tol: number;
  mistakes: Mistake[];
  interpretOptions: Choice[];
  verify: string[];
}

export interface ProblemTemplate {
  id: string;
  title: string;
  module: ModuleNo;
  section: string;
  generate: (rand: () => number) => ProblemInstance;
}

const pick = (rand: () => number, min: number, max: number, step = 1) => min + Math.floor(rand() * ((max - min) / step + 1)) * step;
const choose = <T,>(rand: () => number, arr: T[]) => arr[Math.floor(rand() * arr.length)];
const t = (x: number, n = 3) => sigTex(x, n);

const RAW_TEMPLATES: ProblemTemplate[] = [
  {
    id: 'projectile',
    title: 'Projectile motion (launch from a height)',
    module: 5,
    section: 'm5-projectile',
    generate: (rand) => {
      const u = pick(rand, 10, 24, 2);
      const th = pick(rand, 20, 50, 5);
      const h = pick(rand, 10, 40, 5);
      const g = C.g;
      const ux = u * Math.cos(rad(th));
      const uy = u * Math.sin(rad(th));
      const tf = (uy + Math.sqrt(uy * uy + 2 * g * h)) / g;
      const R = ux * tf;
      const level = (u * u * Math.sin(rad(2 * th))) / g;
      const ignoreUy = ux * Math.sqrt((2 * h) / g);
      const radiansMode = u * Math.cos(th) * ((u * Math.sin(th) + Math.sqrt((u * Math.sin(th)) ** 2 + 2 * g * h)) / g);
      return {
        text: `A ball is kicked from the edge of a ${h} m high cliff with a velocity of ${u} m s⁻¹ at ${th}° above the horizontal. How far from the base of the cliff does it land? (Ignore air resistance.)`,
        situation: 'Projectile launched upwards from a height, landing below the launch point.',
        given: [
          { sym: 'u', label: 'launch speed', value: u, unit: 'm s⁻¹' },
          { sym: '\\theta', label: 'launch angle', value: th, unit: '°' },
          { sym: 'h', label: 'height of cliff', value: h, unit: 'm' },
          { sym: 'a_y', label: 'vertical acceleration (up +)', value: -g, unit: 'm s⁻²' },
        ],
        unknown: { sym: '\\Delta x', label: 'horizontal range from the base of the cliff', unit: 'm' },
        unknownOptions: ['Horizontal range', 'Maximum height', 'Time of flight only', 'Launch speed'],
        assumptions: ['No air resistance.', 'g = 9.8 m s⁻² downwards, constant.', 'Landing point is h below the launch point (Δy = −h).'],
        diagram: 'projectile-components',
        diagramNote: 'Set up axes with up as positive. The ball rises first, then falls past launch height down to Δy = −h.',
        formulaOptions: [
          { tex: '\\Delta y = u_y t + \\tfrac12 a_y t^2 \\text{ then } \\Delta x = u_x t', correct: true, why: 'Unequal launch/landing heights: find t from the vertical motion, then use it horizontally.' },
          { tex: 'R = \\dfrac{u^2\\sin2\\theta}{g}', why: 'Only valid when launch and landing heights are equal.' },
          { tex: 'v_y^2 = u_y^2 + 2a_y\\Delta y', why: 'Gives the final vertical velocity, not the range, on its own.' },
          { tex: 'F = ma', why: 'Forces are not needed — kinematics is sufficient.' },
        ],
        rearrangeOptions: [
          { tex: 't = \\dfrac{u_y + \\sqrt{u_y^2 + 2gh}}{g}', correct: true, why: 'Positive root of −h = u_y t − ½gt².' },
          { tex: 't = \\dfrac{2u\\sin\\theta}{g}', why: 'Level-ground time of flight — ignores the cliff.' },
          { tex: 't = \\sqrt{\\dfrac{2h}{g}}', why: 'Ignores the initial upward velocity.' },
          { tex: 't = \\dfrac{h}{u_y}', why: 'Treats vertical motion as constant velocity.' },
        ],
        substitution: `u_x = ${u}\\cos${th}^\\circ = ${t(ux)},\\ u_y = ${u}\\sin${th}^\\circ = ${t(uy)}`,
        intermediate: [
          `t = \\dfrac{${t(uy)} + \\sqrt{${t(uy)}^2 + 2(9.8)(${h})}}{9.8} = ${t(tf)}\\ \\text{s}`,
          `\\Delta x = u_x t = ${t(ux)} \\times ${t(tf)} = ${t(R)}\\ \\text{m}`,
        ],
        answer: R,
        unit: 'm',
        tol: 0.02,
        mistakes: [
          { value: level, type: 'formula', message: 'You used R = u² sin 2θ/g, which only applies when launch and landing heights are equal.' },
          { value: ignoreUy, type: 'concept', message: 'You used t = √(2h/g), ignoring the ball’s initial upward velocity.' },
          { value: radiansMode, type: 'units', message: 'Your calculator appears to be in radians mode — switch to degrees.' },
        ],
        interpretOptions: [
          { tex: `\\text{The ball lands } ${t(R)}\\text{ m horizontally from the base of the cliff.}`, correct: true, why: 'Δx is horizontal displacement from the launch point (directly above the base).' },
          { tex: '\\text{The ball travels this distance along its curved path.}', why: 'Δx is the horizontal displacement, not the path length.' },
          { tex: '\\text{This is the maximum height reached.}', why: 'Height is vertical, not horizontal.' },
        ],
        verify: [
          `Units: m s⁻¹ × s = m ✓`,
          `Magnitude: larger than the level-ground range (${sig(level)} m) because the ball falls an extra ${h} m ✓`,
          'Sign: positive — the ball moves away from the cliff ✓',
          'Assumption check: air resistance would make the real range shorter.',
        ],
      };
    },
  },
  {
    id: 'circular',
    title: 'Circular motion (car on a flat bend)',
    module: 5,
    section: 'm5-circular',
    generate: (rand) => {
      const m = pick(rand, 800, 1600, 100);
      const r = pick(rand, 20, 80, 5);
      const v = pick(rand, 8, 20, 1);
      const F = (m * v * v) / r;
      return {
        text: `A ${m} kg car travels around a flat, horizontal bend of radius ${r} m at a constant ${v} m s⁻¹. What friction force must the road provide?`,
        situation: 'Uniform circular motion on a flat road; friction provides the centripetal force.',
        given: [
          { sym: 'm', label: 'mass of car', value: m, unit: 'kg' },
          { sym: 'r', label: 'radius of bend', value: r, unit: 'm' },
          { sym: 'v', label: 'speed', value: v, unit: 'm s⁻¹' },
        ],
        unknown: { sym: 'F_c', label: 'friction force (= net centripetal force)', unit: 'N' },
        unknownOptions: ['Friction force needed', 'Car’s acceleration along the road', 'Normal force', 'Period of one lap'],
        assumptions: ['Constant speed (uniform circular motion).', 'Road is horizontal: friction is the only horizontal force towards the centre.'],
        diagram: 'fbd-car-bend',
        diagramNote: 'Weight (down) and normal force (up) balance. Friction acts horizontally towards the centre of the bend.',
        formulaOptions: [
          { tex: 'F_c = \\dfrac{mv^2}{r}', correct: true, why: 'Newton’s second law for circular motion.' },
          { tex: 'F = mg', why: 'Weight is vertical, balanced by the normal force.' },
          { tex: 'F = \\dfrac{GMm}{r^2}', why: 'Gravitation between bodies is irrelevant here.' },
          { tex: 'a_c = \\dfrac{v^2}{r}', why: 'Gives the acceleration, but you still need F = ma.' },
        ],
        rearrangeOptions: [
          { tex: 'F_c = \\dfrac{mv^2}{r}', correct: true, why: 'Already in the required form.' },
          { tex: 'F_c = \\dfrac{mv}{r}', why: 'v must be squared.' },
          { tex: 'F_c = mv^2r', why: 'Divide by r, don’t multiply.' },
        ],
        substitution: `F_c = \\dfrac{(${m})(${v})^2}{${r}}`,
        intermediate: [`F_c = ${t(F)}\\ \\text{N}`],
        answer: F,
        unit: 'N',
        tol: 0.02,
        mistakes: [
          { value: (m * v) / r, type: 'formula', message: 'You did not square the speed.' },
          { value: (m * v * v) / (2 * r), type: 'calculation', message: 'You used the diameter instead of the radius (or halved the result).' },
          { value: m * 9.8, type: 'concept', message: 'That is the car’s weight — friction must provide mv²/r, not mg.' },
        ],
        interpretOptions: [
          { tex: '\\text{Static friction of this size acts towards the centre of the bend.}', correct: true, why: 'Friction is the real force providing F_c.' },
          { tex: '\\text{An outward centrifugal force of this size acts on the car.}', why: 'No outward force acts in the road’s frame.' },
          { tex: '\\text{Friction acts backwards, opposing the car’s motion.}', why: 'At constant speed the needed friction is sideways (radial).' },
        ],
        verify: ['Units: kg m² s⁻² / m = kg m s⁻² = N ✓', 'Magnitude: compare with weight mg — if F > μmg (μ ≈ 0.7 dry road) the car would skid.', 'Direction: towards the centre ✓'],
      };
    },
  },
  {
    id: 'orbital',
    title: 'Orbital mechanics (period of a satellite)',
    module: 5,
    section: 'm5-gravity',
    generate: (rand) => {
      const hkm = pick(rand, 300, 2000, 50);
      const r = C.RE + hkm * 1e3;
      const T = 2 * Math.PI * Math.sqrt(r ** 3 / (C.G * C.ME));
      const Talt = 2 * Math.PI * Math.sqrt((hkm * 1e3) ** 3 / (C.G * C.ME));
      return {
        text: `A satellite orbits Earth in a circular orbit at an altitude of ${hkm} km. Calculate its orbital period in seconds.`,
        situation: 'Circular orbit: gravity provides the centripetal force (Kepler’s third law).',
        given: [
          { sym: 'h', label: 'altitude', value: hkm * 1e3, unit: 'm', display: `${hkm} km` },
          { sym: 'M_E', label: 'mass of Earth', value: C.ME, unit: 'kg' },
          { sym: 'r_E', label: 'radius of Earth', value: C.RE, unit: 'm' },
          { sym: 'G', label: 'gravitational constant', value: C.G, unit: 'N m² kg⁻²' },
        ],
        unknown: { sym: 'T', label: 'orbital period', unit: 's' },
        unknownOptions: ['Orbital period', 'Orbital speed', 'Escape velocity', 'Altitude'],
        assumptions: ['Circular orbit.', 'Satellite mass ≪ Earth’s mass.', 'Earth is spherically symmetric.'],
        diagram: 'newton-cannon',
        diagramNote: 'The orbital radius is measured from Earth’s centre: r = r_E + altitude.',
        formulaOptions: [
          { tex: '\\dfrac{r^3}{T^2} = \\dfrac{GM}{4\\pi^2}', correct: true, why: 'Kepler’s third law links r and T directly.' },
          { tex: 'v_{esc} = \\sqrt{\\dfrac{2GM}{r}}', why: 'Escape velocity is not the orbital period.' },
          { tex: 'g = \\dfrac{GM}{r^2}', why: 'Gives field strength, not period.' },
          { tex: 'T = \\dfrac{2\\pi r}{v}\\ \\text{with } v = 7.9\\ \\text{km s}^{-1}', why: '7.9 km s⁻¹ is only for orbits at Earth’s surface.' },
        ],
        rearrangeOptions: [
          { tex: 'T = 2\\pi\\sqrt{\\dfrac{r^3}{GM}}', correct: true, why: 'Square root of 4π²r³/GM.' },
          { tex: 'T = \\sqrt{\\dfrac{GM}{4\\pi^2r^3}}', why: 'Inverted — this has units of s⁻¹.' },
          { tex: 'T = \\dfrac{4\\pi^2 r^3}{GM}', why: 'This is T², not T.' },
        ],
        conversion: { prompt: `Find the orbital radius r = r_E + h in metres (h = ${hkm} km).`, answer: r, unit: 'm' },
        substitution: `T = 2\\pi\\sqrt{\\dfrac{(${t(r, 4)})^3}{(6.67\\times10^{-11})(6.0\\times10^{24})}}`,
        intermediate: [`T = ${t(T)}\\ \\text{s} \\approx ${t(T / 60)}\\ \\text{min}`],
        answer: T,
        unit: 's',
        tol: 0.02,
        mistakes: [
          { value: Talt, type: 'concept', message: 'You used the altitude as the orbital radius — add Earth’s radius.' },
          { value: (4 * Math.PI ** 2 * r ** 3) / (C.G * C.ME), type: 'formula', message: 'You found T² — take the square root.' },
          { value: T / 60, type: 'units', message: 'That looks like minutes — the question asks for seconds.' },
        ],
        interpretOptions: [
          { tex: `\\text{The satellite completes one orbit every } ${t(T / 60)}\\text{ minutes.}`, correct: true, why: 'Period = time for one revolution.' },
          { tex: '\\text{The satellite is geostationary.}', why: 'Geostationary satellites have T ≈ 86 164 s at much higher altitude.' },
          { tex: '\\text{A heavier satellite would have a shorter period.}', why: 'Satellite mass cancels.' },
        ],
        verify: ['Units: √(m³/(N m² kg⁻² × kg)) = √(s²) = s ✓', 'Magnitude: low-Earth orbits take ~90–130 min ✓', 'Satellite mass not needed ✓'],
      };
    },
  },
  {
    id: 'grav-field',
    title: 'Gravitational field strength at altitude',
    module: 5,
    section: 'm5-gravity',
    generate: (rand) => {
      const body = choose(rand, [
        { name: 'Earth', M: C.ME, R: C.RE },
        { name: 'Mars', M: 6.42e23, R: 3.39e6 },
        { name: 'the Moon', M: C.MMoon, R: C.RMoon },
      ]);
      const hkm = pick(rand, 200, 3000, 100);
      const r = body.R + hkm * 1e3;
      const g = (C.G * body.M) / (r * r);
      return {
        text: `Calculate the gravitational field strength at an altitude of ${hkm} km above ${body.name} (mass ${sig(body.M)} kg, radius ${sig(body.R, 4)} m).`,
        situation: 'Radial gravitational field outside a spherical body.',
        given: [
          { sym: 'M', label: `mass of ${body.name}`, value: body.M, unit: 'kg' },
          { sym: 'R', label: `radius of ${body.name}`, value: body.R, unit: 'm' },
          { sym: 'h', label: 'altitude', value: hkm * 1e3, unit: 'm', display: `${hkm} km` },
        ],
        unknown: { sym: 'g', label: 'gravitational field strength', unit: 'N kg⁻¹' },
        unknownOptions: ['Gravitational field strength', 'Gravitational force', 'Orbital speed', 'Escape velocity'],
        assumptions: ['Spherically symmetric body.', 'Point outside the body.'],
        diagram: 'radial-field',
        diagramNote: 'Field lines point radially inwards; they spread out, so g weakens with distance (inverse square).',
        formulaOptions: [
          { tex: 'g = \\dfrac{GM}{r^2}', correct: true, why: 'Field strength = force per unit mass.' },
          { tex: 'F = \\dfrac{GMm}{r^2}', why: 'Needs a test mass m and gives force.' },
          { tex: 'g = \\dfrac{GM}{r}', why: 'Missing the square.' },
        ],
        rearrangeOptions: [
          { tex: 'g = \\dfrac{GM}{(R + h)^2}', correct: true, why: 'r is measured from the centre.' },
          { tex: 'g = \\dfrac{GM}{h^2}', why: 'Altitude is not the distance from the centre.' },
          { tex: 'g = \\dfrac{GM}{R^2 + h^2}', why: '(R + h)² ≠ R² + h².' },
        ],
        conversion: { prompt: `Find r = R + h in metres.`, answer: r, unit: 'm' },
        substitution: `g = \\dfrac{(6.67\\times10^{-11})(${t(body.M)})}{(${t(r, 4)})^2}`,
        intermediate: [`g = ${t(g)}\\ \\text{N kg}^{-1}`],
        answer: g,
        unit: 'N kg⁻¹',
        tol: 0.02,
        mistakes: [
          { value: (C.G * body.M) / (hkm * 1e3) ** 2, type: 'concept', message: 'You used the altitude instead of the distance from the centre.' },
          { value: (C.G * body.M) / r, type: 'formula', message: 'You forgot to square r.' },
          { value: (C.G * body.M) / (body.R * body.R + (hkm * 1e3) ** 2), type: 'calculation', message: '(R + h)² is not R² + h².' },
        ],
        interpretOptions: [
          { tex: `\\text{A 1 kg mass there experiences a gravitational force of } ${t(g)}\\text{ N (free-fall acceleration } ${t(g)}\\text{ m s}^{-2}).`, correct: true, why: 'g is force per unit mass = free-fall acceleration.' },
          { tex: '\\text{Objects at this altitude are weightless because } g \\approx 0.', why: 'g is still significant.' },
        ],
        verify: ['Units: N m² kg⁻² × kg / m² = N kg⁻¹ ✓', `Magnitude: less than the surface value ${sig((C.G * body.M) / body.R ** 2)} N kg⁻¹ ✓`],
      };
    },
  },
  {
    id: 'charge-B',
    title: 'Charged particle accelerated then curved in a magnetic field',
    module: 6,
    section: 'm6-fields',
    generate: (rand) => {
      const p = choose(rand, [
        { name: 'an electron', m: C.me, q: C.e },
        { name: 'a proton', m: C.mp, q: C.e },
      ]);
      const V = pick(rand, 100, 2000, 100);
      const BmT = pick(rand, 2, 50, 2);
      const B = BmT * 1e-3;
      const v = Math.sqrt((2 * p.q * V) / p.m);
      const r = (p.m * v) / (p.q * B);
      const other = p.m === C.me ? C.mp : C.me;
      return {
        text: `${p.name[0].toUpperCase() + p.name.slice(1)} is accelerated from rest through a potential difference of ${V} V and then enters a uniform ${BmT} mT magnetic field at right angles. Calculate the radius of its path.`,
        situation: 'Electric field does work (qV = ½mv²); magnetic force provides centripetal force (qvB = mv²/r).',
        given: [
          { sym: 'V', label: 'accelerating p.d.', value: V, unit: 'V' },
          { sym: 'B', label: 'magnetic flux density', value: B, unit: 'T', display: `${BmT} mT` },
          { sym: 'm', label: 'particle mass', value: p.m, unit: 'kg' },
          { sym: 'q', label: 'charge magnitude', value: p.q, unit: 'C' },
        ],
        unknown: { sym: 'r', label: 'radius of circular path', unit: 'm' },
        unknownOptions: ['Radius of the path', 'Speed only', 'Force on the particle', 'Period of rotation'],
        assumptions: ['Starts from rest; non-relativistic speeds.', 'Uniform B, perpendicular to v.', 'Gravity negligible.'],
        diagram: 'b-circle',
        diagramNote: 'Inside the field the magnetic force is always perpendicular to the velocity, so the particle moves in a circle at constant speed.',
        formulaOptions: [
          { tex: 'qV = \\tfrac12mv^2 \\text{ and } qvB = \\dfrac{mv^2}{r}', correct: true, why: 'Energy gives v, then circular-motion force balance gives r.' },
          { tex: 'F = qE', why: 'No electric field inside the magnetic region.' },
          { tex: 'r = \\dfrac{mv}{qB} \\text{ with } v = V', why: 'V is a potential difference, not a speed.' },
        ],
        rearrangeOptions: [
          { tex: 'v = \\sqrt{\\dfrac{2qV}{m}},\\quad r = \\dfrac{mv}{qB}', correct: true, why: 'Correct rearrangements of both equations.' },
          { tex: 'v = \\dfrac{2qV}{m},\\quad r = \\dfrac{qB}{mv}', why: 'Missing square root; r inverted.' },
          { tex: 'v = \\sqrt{\\dfrac{qV}{2m}},\\quad r = \\dfrac{mv}{qB}', why: 'Factor of 2 misplaced.' },
        ],
        conversion: { prompt: `Convert ${BmT} mT to tesla.`, answer: B, unit: 'T' },
        substitution: `v = \\sqrt{\\dfrac{2(${t(p.q, 4)})(${V})}{${t(p.m, 4)}}} = ${t(v)}\\ \\text{m s}^{-1}`,
        intermediate: [`r = \\dfrac{(${t(p.m, 4)})(${t(v)})}{(${t(p.q, 4)})(${t(B)})} = ${t(r)}\\ \\text{m}`],
        answer: r,
        unit: 'm',
        tol: 0.02,
        mistakes: [
          { value: r * 1e-3, type: 'units', message: 'B was left in mT — convert to tesla first.' },
          { value: (other * Math.sqrt((2 * p.q * V) / other)) / (p.q * B), type: 'concept', message: 'You used the wrong particle mass (electron vs proton).' },
          { value: (p.m * ((2 * p.q * V) / p.m)) / (p.q * B), type: 'formula', message: 'You forgot the square root when finding v.' },
        ],
        interpretOptions: [
          { tex: `\\text{The particle moves in a circle of radius } ${t(r)}\\text{ m at constant speed.}`, correct: true, why: 'Magnetic force does no work.' },
          { tex: '\\text{The particle speeds up as it circles.}', why: 'Magnetic force ⟂ v: no work, constant speed.' },
        ],
        verify: ['Units: kg (m s⁻¹)/(C T) = m ✓', `Speed check: v = ${sig(v)} m s⁻¹ < 0.1c, so the non-relativistic formula is reasonable ✓`, 'A proton curves much less than an electron at the same p.d. (larger m).'],
      };
    },
  },
  {
    id: 'motor',
    title: 'Motor effect (force on a wire)',
    module: 6,
    section: 'm6-motor',
    generate: (rand) => {
      const lcm = pick(rand, 10, 60, 5);
      const I = pick(rand, 2, 12, 1);
      const B = pick(rand, 10, 80, 5) / 100;
      const th = pick(rand, 20, 70, 10);
      const F = (lcm / 100) * I * B * Math.sin(rad(th));
      return {
        text: `A straight wire of length ${lcm} cm carries a current of ${I} A at ${th}° to a uniform magnetic field of ${B.toFixed(2)} T. Calculate the magnitude of the force on the wire.`,
        situation: 'Motor effect on a straight conductor at an angle to the field.',
        given: [
          { sym: 'l', label: 'length in field', value: lcm / 100, unit: 'm', display: `${lcm} cm` },
          { sym: 'I', label: 'current', value: I, unit: 'A' },
          { sym: 'B', label: 'magnetic flux density', value: B, unit: 'T' },
          { sym: '\\theta', label: 'angle between wire and B', value: th, unit: '°' },
        ],
        unknown: { sym: 'F', label: 'force on the wire', unit: 'N' },
        unknownOptions: ['Force on the wire', 'Magnetic flux', 'Induced emf', 'Torque'],
        assumptions: ['Uniform field.', 'Straight wire, all within the field.'],
        diagram: 'motor-effect',
        diagramNote: 'Only the current component perpendicular to B contributes. Force is perpendicular to both I and B (right-hand palm rule).',
        formulaOptions: [
          { tex: 'F = lIB\\sin\\theta', correct: true, why: 'Motor-effect force.' },
          { tex: 'F = qvB\\sin\\theta', why: 'For a single moving charge.' },
          { tex: '\\tau = nIAB\\sin\\theta', why: 'Torque on a coil, not force on a wire.' },
        ],
        rearrangeOptions: [
          { tex: 'F = lIB\\sin\\theta', correct: true, why: 'Already isolated.' },
          { tex: 'F = lIB\\cos\\theta', why: 'θ is between the wire and B, so use sin θ.' },
          { tex: 'F = \\dfrac{IB}{l}\\sin\\theta', why: 'Multiply by l.' },
        ],
        conversion: { prompt: `Convert ${lcm} cm to metres.`, answer: lcm / 100, unit: 'm' },
        substitution: `F = (${lcm / 100})(${I})(${B.toFixed(2)})\\sin${th}^\\circ`,
        intermediate: [`F = ${t(F)}\\ \\text{N}`],
        answer: F,
        unit: 'N',
        tol: 0.02,
        mistakes: [
          { value: (lcm / 100) * I * B * Math.cos(rad(th)), type: 'formula', message: 'You used cos θ — the angle is between the wire and the field, so use sin θ.' },
          { value: (lcm / 100) * I * B, type: 'formula', message: 'You ignored the angle (that would be the maximum force at 90°).' },
          { value: lcm * I * B * Math.sin(rad(th)), type: 'units', message: 'Length must be in metres, not centimetres.' },
        ],
        interpretOptions: [
          { tex: `\\text{A force of } ${t(F)}\\text{ N acts perpendicular to both the wire and the field.}`, correct: true, why: 'Direction from the right-hand palm rule.' },
          { tex: '\\text{The force acts along the wire.}', why: 'F ⟂ I and F ⟂ B.' },
        ],
        verify: ['Units: m × A × T = m A (N A⁻¹ m⁻¹) = N ✓', `Less than the maximum lIB = ${sig((lcm / 100) * I * B)} N ✓`],
      };
    },
  },
  {
    id: 'flux',
    title: 'Magnetic flux through a tilted loop',
    module: 6,
    section: 'm6-induction',
    generate: (rand) => {
      const s = pick(rand, 5, 30, 1);
      const B = pick(rand, 5, 90, 5) / 100;
      const plane = pick(rand, 10, 80, 10);
      const A = (s / 100) ** 2;
      const thN = 90 - plane;
      const Phi = B * A * Math.cos(rad(thN));
      return {
        text: `A square loop of side ${s} cm lies in a uniform ${B.toFixed(2)} T magnetic field. The PLANE of the loop makes an angle of ${plane}° with the field lines. Calculate the magnetic flux through the loop.`,
        situation: 'Flux through a loop at an angle; θ must be measured from the normal.',
        given: [
          { sym: 's', label: 'side length', value: s / 100, unit: 'm', display: `${s} cm` },
          { sym: 'B', label: 'flux density', value: B, unit: 'T' },
          { sym: '\\alpha', label: 'angle between plane and B', value: plane, unit: '°' },
        ],
        unknown: { sym: '\\Phi', label: 'magnetic flux', unit: 'Wb' },
        unknownOptions: ['Magnetic flux', 'Induced emf', 'Force on the loop', 'Magnetic flux density'],
        assumptions: ['Uniform field over the loop.'],
        diagram: 'flux-angle',
        diagramNote: 'θ in Φ = BA cos θ is the angle between B and the NORMAL to the loop: θ = 90° − (angle to the plane).',
        formulaOptions: [
          { tex: '\\Phi = BA\\cos\\theta', correct: true, why: 'Definition of flux.' },
          { tex: '\\varepsilon = -N\\dfrac{\\Delta\\Phi}{\\Delta t}', why: 'For induced emf, not flux.' },
          { tex: 'F = lIB\\sin\\theta', why: 'Motor effect — not relevant.' },
        ],
        rearrangeOptions: [
          { tex: `\\Phi = BA\\cos(90^\\circ - ${plane}^\\circ) = BA\\sin${plane}^\\circ`, correct: true, why: 'Convert the plane angle to the normal angle.' },
          { tex: `\\Phi = BA\\cos${plane}^\\circ`, why: 'This uses the plane angle as if it were measured from the normal.' },
          { tex: '\\Phi = BA', why: 'Only true when B is perpendicular to the plane.' },
        ],
        conversion: { prompt: `Area of the loop in m² (side ${s} cm).`, answer: A, unit: 'm²' },
        substitution: `\\Phi = (${B.toFixed(2)})(${t(A)})\\cos${thN}^\\circ`,
        intermediate: [`\\Phi = ${t(Phi)}\\ \\text{Wb}`],
        answer: Phi,
        unit: 'Wb',
        tol: 0.02,
        mistakes: [
          { value: B * A * Math.cos(rad(plane)), type: 'concept', message: 'You measured θ from the plane of the loop — it must be from the normal.' },
          { value: B * s * s * Math.cos(rad(thN)), type: 'units', message: 'The area must be in m² (cm² ÷ 10⁴).' },
          { value: B * A, type: 'formula', message: 'You ignored the angle.' },
        ],
        interpretOptions: [
          { tex: `\\text{The loop links } ${t(Phi)}\\text{ Wb; rotating it to face the field would increase this to } ${t(B * A)}\\text{ Wb.}`, correct: true, why: 'Maximum flux when the plane is perpendicular to B.' },
          { tex: '\\text{An emf is induced because there is flux.}', why: 'Only a CHANGING flux induces an emf.' },
        ],
        verify: ['Units: T m² = Wb ✓', `Less than BA = ${sig(B * A)} Wb ✓`],
      };
    },
  },
  {
    id: 'induction',
    title: 'Electromagnetic induction (average emf)',
    module: 6,
    section: 'm6-induction',
    generate: (rand) => {
      const N = pick(rand, 50, 500, 50);
      const A = pick(rand, 10, 100, 10) / 1e4;
      const B1 = pick(rand, 10, 80, 10) / 100;
      const B2 = 0;
      const dt = pick(rand, 5, 50, 5) / 100;
      const emf = (N * A * (B1 - B2)) / dt;
      return {
        text: `A ${N}-turn coil of area ${(A * 1e4).toFixed(0)} cm² is perpendicular to a ${B1.toFixed(2)} T magnetic field. The field is reduced uniformly to zero in ${dt.toFixed(2)} s. Calculate the magnitude of the average induced emf.`,
        situation: 'Changing B through a fixed coil — Faraday’s law.',
        given: [
          { sym: 'N', label: 'turns', value: N, unit: '' },
          { sym: 'A', label: 'area', value: A, unit: 'm²', display: `${(A * 1e4).toFixed(0)} cm²` },
          { sym: 'B_1', label: 'initial B', value: B1, unit: 'T' },
          { sym: 'B_2', label: 'final B', value: 0, unit: 'T' },
          { sym: '\\Delta t', label: 'time', value: dt, unit: 's' },
        ],
        unknown: { sym: '|\\varepsilon|', label: 'average induced emf', unit: 'V' },
        unknownOptions: ['Average induced emf', 'Final flux', 'Induced current', 'Force on the coil'],
        assumptions: ['Field perpendicular to the coil (θ = 0 from normal).', 'Uniform rate of change.'],
        diagram: 'lenz-coil',
        diagramNote: 'Lenz’s law: as the flux decreases, the induced current produces a field in the SAME direction as the original field, opposing the decrease.',
        formulaOptions: [
          { tex: '\\varepsilon = -N\\dfrac{\\Delta\\Phi}{\\Delta t},\\ \\Phi = BA', correct: true, why: 'Faraday’s law with flux.' },
          { tex: 'V_p/V_s = N_p/N_s', why: 'Transformer relation — no second coil here.' },
          { tex: '\\varepsilon = NBA', why: 'Missing the rate of change.' },
        ],
        rearrangeOptions: [
          { tex: '|\\varepsilon| = \\dfrac{NA|B_2 - B_1|}{\\Delta t}', correct: true, why: 'ΔΦ = AΔB since A and θ are constant.' },
          { tex: '|\\varepsilon| = \\dfrac{A|B_2 - B_1|}{\\Delta t}', why: 'Forgot N.' },
          { tex: '|\\varepsilon| = NAB_1\\Delta t', why: 'Divide by Δt.' },
        ],
        conversion: { prompt: `Convert the area ${(A * 1e4).toFixed(0)} cm² to m².`, answer: A, unit: 'm²' },
        substitution: `|\\varepsilon| = \\dfrac{(${N})(${t(A)})(${B1.toFixed(2)} - 0)}{${dt.toFixed(2)}}`,
        intermediate: [`|\\varepsilon| = ${t(emf)}\\ \\text{V}`],
        answer: emf,
        unit: 'V',
        tol: 0.02,
        mistakes: [
          { value: emf / N, type: 'formula', message: 'You forgot to multiply by the number of turns N.' },
          { value: emf * 1e4, type: 'units', message: 'Area must be in m² (cm² ÷ 10⁴).' },
          { value: N * A * B1 * dt, type: 'formula', message: 'Divide by Δt (rate of change), don’t multiply.' },
        ],
        interpretOptions: [
          { tex: `\\text{An average emf of } ${t(emf)}\\text{ V is induced while the field changes; it becomes zero once B is steady.}`, correct: true, why: 'Only a changing flux induces an emf.' },
          { tex: '\\text{The emf continues after the field reaches zero.}', why: 'No change → no emf.' },
        ],
        verify: ['Units: T m² s⁻¹ = Wb s⁻¹ = V ✓', 'A faster change (smaller Δt) would give a larger emf ✓'],
      };
    },
  },
  {
    id: 'transformer',
    title: 'Ideal transformer (primary current)',
    module: 6,
    section: 'm6-induction',
    generate: (rand) => {
      const Vp = choose(rand, [240, 230, 11000, 415]);
      const Np = pick(rand, 400, 2400, 200);
      const Ns = pick(rand, 20, 200, 20);
      const Is = pick(rand, 1, 10, 1);
      const Vs = (Vp * Ns) / Np;
      const Ip = (Vs * Is) / Vp;
      return {
        text: `An ideal transformer has ${Np} primary turns and ${Ns} secondary turns. The primary is connected to ${Vp} V AC and the secondary supplies ${Is} A to a load. Calculate the current in the primary coil.`,
        situation: 'Ideal transformer: voltage ratio from turns; power conserved.',
        given: [
          { sym: 'V_p', label: 'primary voltage', value: Vp, unit: 'V' },
          { sym: 'N_p', label: 'primary turns', value: Np, unit: '' },
          { sym: 'N_s', label: 'secondary turns', value: Ns, unit: '' },
          { sym: 'I_s', label: 'secondary current', value: Is, unit: 'A' },
        ],
        unknown: { sym: 'I_p', label: 'primary current', unit: 'A' },
        unknownOptions: ['Primary current', 'Secondary voltage only', 'Efficiency', 'Number of secondary turns'],
        assumptions: ['Ideal: 100% efficient, complete flux linkage.'],
        diagram: 'transformer',
        diagramNote: 'Same changing flux links both coils, so emf per turn is equal; power in = power out.',
        formulaOptions: [
          { tex: '\\dfrac{V_p}{V_s} = \\dfrac{N_p}{N_s}\\ \\text{and}\\ V_pI_p = V_sI_s', correct: true, why: 'Two steps: voltage, then current from power.' },
          { tex: 'P_{loss} = I^2R', why: 'No resistance given; ideal transformer.' },
          { tex: '\\varepsilon = -N\\dfrac{\\Delta\\Phi}{\\Delta t}', why: 'Underlying principle, but no flux data given.' },
        ],
        rearrangeOptions: [
          { tex: 'V_s = V_p\\dfrac{N_s}{N_p},\\quad I_p = \\dfrac{V_sI_s}{V_p}', correct: true, why: 'Correct rearrangements.' },
          { tex: 'V_s = V_p\\dfrac{N_p}{N_s},\\quad I_p = \\dfrac{V_sI_s}{V_p}', why: 'Turns ratio inverted.' },
          { tex: 'I_p = I_s\\dfrac{N_s}{N_p}\\cdot\\dfrac{N_s}{N_p}', why: 'Ratio applied twice.' },
        ],
        substitution: `V_s = ${Vp}\\times\\dfrac{${Ns}}{${Np}} = ${t(Vs)}\\ \\text{V}`,
        intermediate: [`I_p = \\dfrac{(${t(Vs)})(${Is})}{${Vp}} = ${t(Ip)}\\ \\text{A}`],
        answer: Ip,
        unit: 'A',
        tol: 0.02,
        mistakes: [
          { value: (Is * Np) / Ns, type: 'formula', message: 'The turns ratio is inverted — a step-down transformer has a SMALLER primary current.' },
          { value: Vs, type: 'concept', message: 'That is the secondary voltage, not the primary current.' },
        ],
        interpretOptions: [
          { tex: '\\text{Stepping voltage down steps current up: the primary current is smaller than the secondary current.}', correct: Ns < Np, why: 'Power conservation.' },
          { tex: '\\text{Stepping voltage up steps current down: the primary current is larger than the secondary current.}', correct: Ns > Np, why: 'Power conservation.' },
          { tex: '\\text{The transformer increases the total power.}', why: 'Power out ≤ power in.' },
        ],
        verify: ['Units: V A / V = A ✓', `Power check: V_pI_p = ${sig(Vp * Ip)} W = V_sI_s ✓`],
      };
    },
  },
  {
    id: 'interference',
    title: 'Double-slit interference (fringe spacing)',
    module: 7,
    section: 'm7-wave',
    generate: (rand) => {
      const lam = pick(rand, 450, 680, 10);
      const dmm = pick(rand, 10, 50, 5) / 100;
      const L = pick(rand, 10, 30, 1) / 10;
      const dy = (lam * 1e-9 * L) / (dmm * 1e-3);
      return {
        text: `Light of wavelength ${lam} nm passes through two slits ${dmm.toFixed(2)} mm apart. The screen is ${L.toFixed(1)} m away. Calculate the spacing between adjacent bright fringes.`,
        situation: 'Young’s double slit, small angles.',
        given: [
          { sym: '\\lambda', label: 'wavelength', value: lam * 1e-9, unit: 'm', display: `${lam} nm` },
          { sym: 'd', label: 'slit separation', value: dmm * 1e-3, unit: 'm', display: `${dmm.toFixed(2)} mm` },
          { sym: 'L', label: 'slit–screen distance', value: L, unit: 'm' },
        ],
        unknown: { sym: '\\Delta y', label: 'fringe spacing', unit: 'm' },
        unknownOptions: ['Fringe spacing', 'Angle of first maximum', 'Wavelength', 'Number of fringes'],
        assumptions: ['Coherent monochromatic light.', 'Small angles (L ≫ Δy).'],
        diagram: 'double-slit',
        diagramNote: 'Bright fringes where path difference = mλ. For small angles sin θ ≈ tan θ = y/L.',
        formulaOptions: [
          { tex: '\\Delta y = \\dfrac{\\lambda L}{d}', correct: true, why: 'Small-angle result of d sin θ = mλ.' },
          { tex: 'E = hf', why: 'Photon energy — not needed.' },
          { tex: 'I = I_{max}\\cos^2\\theta', why: 'Malus’ law is for polarisers.' },
        ],
        rearrangeOptions: [
          { tex: '\\Delta y = \\dfrac{\\lambda L}{d}', correct: true, why: 'Already isolated.' },
          { tex: '\\Delta y = \\dfrac{d L}{\\lambda}', why: 'λ and d swapped.' },
          { tex: '\\Delta y = \\dfrac{\\lambda d}{L}', why: 'L and d swapped.' },
        ],
        conversion: { prompt: `Convert ${lam} nm to metres.`, answer: lam * 1e-9, unit: 'm' },
        substitution: `\\Delta y = \\dfrac{(${lam}\\times10^{-9})(${L.toFixed(1)})}{${dmm.toFixed(2)}\\times10^{-3}}`,
        intermediate: [`\\Delta y = ${t(dy)}\\ \\text{m}`],
        answer: dy,
        unit: 'm',
        tol: 0.02,
        mistakes: [
          { value: (dmm * 1e-3 * L) / (lam * 1e-9), type: 'formula', message: 'λ and d are swapped.' },
          { value: dy * 1e3, type: 'units', message: 'Check mm → m conversion of d.' },
        ],
        interpretOptions: [
          { tex: `\\text{Adjacent bright fringes are } ${t(dy * 1e3)}\\text{ mm apart on the screen.}`, correct: true, why: 'Δy is the distance between neighbouring maxima.' },
          { tex: '\\text{This is the width of the slits.}', why: 'Δy is on the screen.' },
        ],
        verify: ['Units: m × m / m = m ✓', 'Magnitude: millimetre-scale fringes are typical for visible light ✓'],
      };
    },
  },
  {
    id: 'grating',
    title: 'Diffraction grating (angle of a maximum)',
    module: 7,
    section: 'm7-wave',
    generate: (rand) => {
      let lines = 0, lam = 0, m = 0, s = 2;
      while (s >= 0.95) {
        lines = choose(rand, [100, 200, 300, 500, 600]);
        lam = pick(rand, 420, 680, 20);
        m = pick(rand, 1, 3, 1);
        s = (m * lam * 1e-9) / (1e-3 / lines);
      }
      const d = 1e-3 / lines;
      const th = (Math.asin(s) * 180) / Math.PI;
      return {
        text: `Light of wavelength ${lam} nm is incident normally on a grating with ${lines} lines per mm. At what angle is the order m = ${m} maximum?`,
        situation: 'Diffraction grating principal maxima.',
        given: [
          { sym: 'N', label: 'lines per mm', value: lines, unit: 'mm⁻¹' },
          { sym: '\\lambda', label: 'wavelength', value: lam * 1e-9, unit: 'm', display: `${lam} nm` },
          { sym: 'm', label: 'order', value: m, unit: '' },
        ],
        unknown: { sym: '\\theta', label: 'angle of the maximum', unit: '°' },
        unknownOptions: ['Angle of the maximum', 'Fringe spacing', 'Grating spacing only', 'Wavelength'],
        assumptions: ['Normal incidence.', 'Monochromatic light.'],
        diagram: 'grating',
        diagramNote: 'Maxima occur where adjacent slits differ in path by a whole number of wavelengths: d sin θ = mλ.',
        formulaOptions: [
          { tex: 'd\\sin\\theta = m\\lambda', correct: true, why: 'Grating equation.' },
          { tex: '\\Delta y = \\dfrac{\\lambda L}{d}', why: 'Small-angle only and needs L.' },
          { tex: '\\lambda_{max} = \\dfrac{b}{T}', why: 'Wien’s law is unrelated.' },
        ],
        rearrangeOptions: [
          { tex: '\\theta = \\sin^{-1}\\!\\left(\\dfrac{m\\lambda}{d}\\right),\\ d = \\dfrac{1}{N}', correct: true, why: 'd is the reciprocal of lines per metre.' },
          { tex: '\\theta = \\sin^{-1}(m\\lambda N_{mm})', why: 'Lines per mm must be converted to per metre.' },
          { tex: '\\theta = \\dfrac{m\\lambda}{d}', why: 'Missing inverse sine.' },
        ],
        conversion: { prompt: `Find the grating spacing d in metres (${lines} lines per mm).`, answer: d, unit: 'm' },
        substitution: `\\sin\\theta = \\dfrac{(${m})(${lam}\\times10^{-9})}{${t(d)}} = ${t(s)}`,
        intermediate: [`\\theta = \\sin^{-1}(${t(s)}) = ${t(th)}^\\circ`],
        answer: th,
        unit: '°',
        tol: 0.015,
        mistakes: [
          { value: Math.asin(s), type: 'units', message: 'That is in radians — give the answer in degrees.' },
          { value: (s * 180) / Math.PI, type: 'formula', message: 'You forgot the inverse sine (small-angle approximation is not valid here).' },
        ],
        interpretOptions: [
          { tex: `\\text{The order-}${m}\\text{ maximum appears at } ${t(th)}^\\circ\\text{ on each side of the central maximum.}`, correct: true, why: 'Maxima are symmetric.' },
          { tex: '\\text{Only one maximum exists, on one side.}', why: 'Patterns are symmetric about the centre.' },
        ],
        verify: [`sin θ = ${sig(s)} ≤ 1 ✓ (the order exists)`, `Maximum possible order here: ${Math.floor(d / (lam * 1e-9))}`],
      };
    },
  },
  {
    id: 'photon',
    title: 'Photon energy',
    module: 7,
    section: 'm7-quantum',
    generate: (rand) => {
      const lam = pick(rand, 200, 900, 10);
      const EJ = (C.h * C.c) / (lam * 1e-9);
      const EeV = EJ / C.eV;
      return {
        text: `Calculate the energy, in electron-volts, of a photon of wavelength ${lam} nm.`,
        situation: 'Photon energy from wavelength.',
        given: [
          { sym: '\\lambda', label: 'wavelength', value: lam * 1e-9, unit: 'm', display: `${lam} nm` },
          { sym: 'h', label: 'Planck constant', value: C.h, unit: 'J s' },
          { sym: 'c', label: 'speed of light', value: C.c, unit: 'm s⁻¹' },
        ],
        unknown: { sym: 'E', label: 'photon energy', unit: 'eV' },
        unknownOptions: ['Photon energy', 'Frequency only', 'Momentum', 'Intensity'],
        assumptions: ['Light in vacuum (c = 3.00 × 10⁸ m s⁻¹).'],
        diagram: 'em-wave',
        diagramNote: 'Shorter wavelength → higher frequency → higher photon energy.',
        formulaOptions: [
          { tex: 'E = hf,\\ c = f\\lambda \\Rightarrow E = \\dfrac{hc}{\\lambda}', correct: true, why: 'Combine Planck relation and wave equation.' },
          { tex: 'E = mc^2', why: 'Photons have no rest mass.' },
          { tex: 'K = \\tfrac12mv^2', why: 'Not for photons.' },
        ],
        rearrangeOptions: [
          { tex: 'E\\ (\\text{eV}) = \\dfrac{hc}{\\lambda e}', correct: true, why: 'Divide joules by e to get eV.' },
          { tex: 'E = \\dfrac{h\\lambda}{c}', why: 'Inverted.' },
          { tex: 'E\\ (\\text{eV}) = \\dfrac{hc}{\\lambda}\\times e', why: 'Divide by e, don’t multiply.' },
        ],
        conversion: { prompt: `Convert ${lam} nm to metres.`, answer: lam * 1e-9, unit: 'm' },
        substitution: `E = \\dfrac{(6.626\\times10^{-34})(3.00\\times10^8)}{${lam}\\times10^{-9}} = ${t(EJ)}\\ \\text{J}`,
        intermediate: [`E = \\dfrac{${t(EJ)}}{1.602\\times10^{-19}} = ${t(EeV)}\\ \\text{eV}`],
        answer: EeV,
        unit: 'eV',
        tol: 0.02,
        mistakes: [
          { value: EJ, type: 'units', message: 'That is in joules — divide by 1.602 × 10⁻¹⁹ to convert to eV.' },
          { value: EeV * 1e-9, type: 'units', message: 'nm was not converted to m.' },
        ],
        interpretOptions: [
          { tex: `\\text{Each photon carries } ${t(EeV)}\\text{ eV, regardless of the beam’s intensity.}`, correct: true, why: 'Energy per photon depends only on f (or λ).' },
          { tex: '\\text{A brighter beam has more energetic photons.}', why: 'Brighter = more photons, same energy each.' },
        ],
        verify: ['Visible photons are ~1.8–3.1 eV; UV higher; IR lower ✓', 'Units: J s × m s⁻¹ / m = J ✓'],
      };
    },
  },
  {
    id: 'photoelectric',
    title: 'Photoelectric effect (maximum kinetic energy)',
    module: 7,
    section: 'm7-quantum',
    generate: (rand) => {
      const metal = choose(rand, [
        { name: 'caesium', phi: 2.1 },
        { name: 'potassium', phi: 2.3 },
        { name: 'calcium', phi: 2.9 },
        { name: 'zinc', phi: 4.3 },
      ]);
      const Emin = metal.phi + 0.3;
      const lamMax = Math.floor((C.h * C.c) / (Emin * C.eV) / 1e-9 / 10) * 10;
      const lam = pick(rand, Math.max(150, lamMax - 200), lamMax, 10);
      const E = (C.h * C.c) / (lam * 1e-9) / C.eV;
      const K = E - metal.phi;
      return {
        text: `Light of wavelength ${lam} nm shines on ${metal.name} (work function ${metal.phi} eV). Calculate the maximum kinetic energy of the photoelectrons in eV.`,
        situation: 'One photon → one electron; energy conservation.',
        given: [
          { sym: '\\lambda', label: 'wavelength', value: lam * 1e-9, unit: 'm', display: `${lam} nm` },
          { sym: '\\phi', label: 'work function', value: metal.phi, unit: 'eV' },
        ],
        unknown: { sym: 'K_{max}', label: 'maximum kinetic energy of photoelectrons', unit: 'eV' },
        unknownOptions: ['Maximum kinetic energy', 'Number of photoelectrons', 'Threshold wavelength', 'Intensity'],
        assumptions: ['Single-photon absorption.', 'Clean metal surface.'],
        diagram: 'photoelectric-setup',
        diagramNote: 'Photon energy pays the work function; the remainder is the fastest electrons’ kinetic energy.',
        formulaOptions: [
          { tex: 'K_{max} = hf - \\phi', correct: true, why: 'Einstein’s photoelectric equation.' },
          { tex: 'K_{max} = hf + \\phi', why: 'φ must be subtracted — it is energy lost escaping.' },
          { tex: 'K = \\tfrac12mv^2 \\text{ only}', why: 'v is unknown.' },
        ],
        rearrangeOptions: [
          { tex: 'K_{max} = \\dfrac{hc}{\\lambda e} - \\phi\\ \\ (\\text{all in eV})', correct: true, why: 'Same units on both terms.' },
          { tex: 'K_{max} = \\dfrac{hc}{\\lambda} - \\phi\\ \\ (\\text{J minus eV})', why: 'Mixing units.' },
        ],
        substitution: `hf = \\dfrac{hc}{\\lambda} = ${t(E)}\\ \\text{eV}`,
        intermediate: [`K_{max} = ${t(E)} - ${metal.phi} = ${t(K)}\\ \\text{eV}`],
        answer: K,
        unit: 'eV',
        tol: 0.03,
        mistakes: [
          { value: E + metal.phi, type: 'sign', message: 'Subtract the work function, don’t add it.' },
          { value: E, type: 'concept', message: 'That is the photon energy — the electron loses φ escaping the metal.' },
          { value: K * C.eV, type: 'units', message: 'That is in joules — give the answer in eV.' },
        ],
        interpretOptions: [
          { tex: `\\text{The fastest photoelectrons have } ${t(K)}\\text{ eV; a stopping voltage of } ${t(K)}\\text{ V would stop them.}`, correct: true, why: 'eV₀ = K_max.' },
          { tex: '\\text{All photoelectrons have exactly this energy.}', why: 'This is the maximum; most have less.' },
        ],
        verify: ['K_max > 0, so emission occurs ✓', `Threshold wavelength = hc/φ ≈ ${sig((C.h * C.c) / (metal.phi * C.eV) / 1e-9)} nm — λ is shorter ✓`],
      };
    },
  },
  {
    id: 'relativity',
    title: 'Special relativity (time dilation)',
    module: 7,
    section: 'm7-relativity',
    generate: (rand) => {
      const beta = pick(rand, 50, 99, 1) / 100;
      const t0 = pick(rand, 1, 20, 1) / 10;
      const gam = 1 / Math.sqrt(1 - beta * beta);
      const tt = gam * t0;
      return {
        text: `A clock on a spacecraft travelling at ${beta.toFixed(2)}c relative to Earth ticks ${t0.toFixed(1)} μs between two flashes (measured on the spacecraft). What time interval does an Earth observer measure between the flashes, in μs?`,
        situation: 'Time dilation — proper time is measured on the spacecraft (both flashes at the same place there).',
        given: [
          { sym: 't_0', label: 'proper time', value: t0, unit: 'μs' },
          { sym: 'v', label: 'speed', value: beta * C.c, unit: 'm s⁻¹', display: `${beta.toFixed(2)}c` },
        ],
        unknown: { sym: 't', label: 'dilated time measured on Earth', unit: 'μs' },
        unknownOptions: ['Dilated time (Earth frame)', 'Proper time', 'Contracted length', 'Momentum'],
        assumptions: ['Inertial frames (constant velocity).'],
        diagram: 'light-clock',
        diagramNote: 'In Earth’s frame the light in the moving clock travels a longer diagonal path at the same c — so the tick takes longer.',
        formulaOptions: [
          { tex: 't = \\dfrac{t_0}{\\sqrt{1 - v^2/c^2}}', correct: true, why: 'Time dilation.' },
          { tex: 'l = l_0\\sqrt{1 - v^2/c^2}', why: 'Length contraction.' },
          { tex: 'E = mc^2', why: 'Not relevant.' },
        ],
        rearrangeOptions: [
          { tex: 't = \\gamma t_0,\\ \\gamma = \\dfrac{1}{\\sqrt{1 - \\beta^2}}', correct: true, why: 'Multiply proper time by γ ≥ 1.' },
          { tex: 't = \\dfrac{t_0}{\\gamma}', why: 'That gives a shorter time — dilated time is longer.' },
          { tex: 't = t_0\\sqrt{1 - \\beta^2}', why: 'Same error: time would shrink.' },
        ],
        substitution: `\\gamma = \\dfrac{1}{\\sqrt{1 - ${beta.toFixed(2)}^2}} = ${t(gam, 4)}`,
        intermediate: [`t = ${t(gam, 4)} \\times ${t0.toFixed(1)}\\ \\mu\\text{s} = ${t(tt)}\\ \\mu\\text{s}`],
        answer: tt,
        unit: 'μs',
        tol: 0.02,
        mistakes: [
          { value: t0 / gam, type: 'concept', message: 'You divided by γ — the moving clock is measured to run SLOW, so Earth measures a LONGER interval.' },
          { value: t0 / (1 - beta * beta), type: 'formula', message: 'You forgot the square root in γ.' },
          { value: tt * 1e-6, type: 'units', message: 'Give the answer in μs as asked.' },
        ],
        interpretOptions: [
          { tex: `\\text{Earth observers measure the spacecraft clock running slow by a factor of } ${t(gam, 3)}.`, correct: true, why: 'Time dilation is measured by the frame relative to which the clock moves.' },
          { tex: '\\text{The astronauts feel time passing slowly.}', why: 'In their own frame time passes normally.' },
        ],
        verify: ['t > t₀ ✓ (dilated time is always longer)', 'γ ≥ 1 ✓'],
      };
    },
  },
  {
    id: 'atomic',
    title: 'Atomic energy transitions (Rydberg)',
    module: 8,
    section: 'm8-quantum',
    generate: (rand) => {
      const nf = choose(rand, [1, 2, 2, 2, 3]);
      const ni = pick(rand, nf + 1, nf + 4, 1);
      const inv = C.R * (1 / nf ** 2 - 1 / ni ** 2);
      const lam = 1 / inv;
      return {
        text: `An electron in a hydrogen atom drops from n = ${ni} to n = ${nf}. Calculate the wavelength of the emitted photon in nm.`,
        situation: 'Hydrogen line spectrum — Rydberg equation.',
        given: [
          { sym: 'n_i', label: 'initial level', value: ni, unit: '' },
          { sym: 'n_f', label: 'final level', value: nf, unit: '' },
          { sym: 'R', label: 'Rydberg constant', value: C.R, unit: 'm⁻¹' },
        ],
        unknown: { sym: '\\lambda', label: 'wavelength of photon', unit: 'nm' },
        unknownOptions: ['Wavelength of the emitted photon', 'Energy of the initial level', 'Ionisation energy', 'Frequency of the electron’s orbit'],
        assumptions: ['Hydrogen (one-electron) atom.'],
        diagram: 'bohr-levels',
        diagramNote: `A downward transition emits a photon of energy E_${ni} − E_${nf}. Series: ${nf === 1 ? 'Lyman (UV)' : nf === 2 ? 'Balmer (visible)' : 'Paschen (IR)'}.`,
        formulaOptions: [
          { tex: '\\dfrac{1}{\\lambda} = R\\left(\\dfrac{1}{n_f^2} - \\dfrac{1}{n_i^2}\\right)', correct: true, why: 'Rydberg equation.' },
          { tex: '\\lambda = \\dfrac{h}{mv}', why: 'de Broglie wavelength of a particle.' },
          { tex: 'd\\sin\\theta = m\\lambda', why: 'Grating equation.' },
        ],
        rearrangeOptions: [
          { tex: '\\lambda = \\left[R\\left(\\dfrac{1}{n_f^2} - \\dfrac{1}{n_i^2}\\right)\\right]^{-1}', correct: true, why: 'Take the reciprocal.' },
          { tex: '\\lambda = R\\left(\\dfrac{1}{n_f^2} - \\dfrac{1}{n_i^2}\\right)', why: 'That is 1/λ.' },
          { tex: '\\lambda = \\left[R\\left(\\dfrac{1}{n_i^2} - \\dfrac{1}{n_f^2}\\right)\\right]^{-1}', why: 'Gives a negative wavelength.' },
        ],
        substitution: `\\dfrac{1}{\\lambda} = 1.097\\times10^7\\left(\\dfrac{1}{${nf}^2} - \\dfrac{1}{${ni}^2}\\right) = ${t(inv, 4)}\\ \\text{m}^{-1}`,
        intermediate: [`\\lambda = ${t(lam)}\\ \\text{m} = ${t(lam * 1e9)}\\ \\text{nm}`],
        answer: lam * 1e9,
        unit: 'nm',
        tol: 0.015,
        mistakes: [
          { value: inv * 1e9, type: 'formula', message: 'You did not take the reciprocal (that’s 1/λ).' },
          { value: -lam * 1e9, type: 'sign', message: 'n_f and n_i swapped — the lower level is n_f.' },
          { value: lam, type: 'units', message: 'That’s in metres — convert to nm.' },
        ],
        interpretOptions: [
          { tex: `\\text{Hydrogen emits a } ${t(lam * 1e9)}\\text{ nm photon in the ${nf === 1 ? 'ultraviolet (Lyman)' : nf === 2 ? 'Balmer' : 'infrared (Paschen)'} series.}`, correct: true, why: 'Series is set by n_f.' },
          { tex: '\\text{The electron absorbs this photon.}', why: 'A downward transition emits a photon.' },
        ],
        verify: ['λ positive ✓', nf === 2 ? 'Balmer lines lie between 365 and 656 nm ✓' : 'Check the series range (Lyman < 122 nm; Paschen > 820 nm).'],
      };
    },
  },
  {
    id: 'half-life',
    title: 'Half-life and radioactive decay',
    module: 8,
    section: 'm8-nucleus',
    generate: (rand) => {
      const iso = choose(rand, [
        { name: 'iodine-131', th: 8.02, unit: 'days' },
        { name: 'technetium-99m', th: 6.01, unit: 'hours' },
        { name: 'cobalt-60', th: 5.27, unit: 'years' },
        { name: 'phosphorus-32', th: 14.3, unit: 'days' },
      ]);
      const A0 = pick(rand, 100, 900, 50);
      const tt = Math.round(iso.th * (pick(rand, 12, 45, 1) / 10) * 10) / 10;
      const lam = Math.LN2 / iso.th;
      const A = A0 * Math.exp(-lam * tt);
      return {
        text: `A sample of ${iso.name} (half-life ${iso.th} ${iso.unit}) has an activity of ${A0} kBq. Calculate its activity after ${tt} ${iso.unit}.`,
        situation: 'Exponential decay of activity.',
        given: [
          { sym: 'A_0', label: 'initial activity', value: A0, unit: 'kBq' },
          { sym: 't_{1/2}', label: 'half-life', value: iso.th, unit: iso.unit },
          { sym: 't', label: 'time elapsed', value: tt, unit: iso.unit },
        ],
        unknown: { sym: 'A', label: 'activity after time t', unit: 'kBq' },
        unknownOptions: ['Activity after time t', 'Decay constant only', 'Number of half-lives', 'Initial activity'],
        assumptions: ['Large number of nuclei (statistical law).', 'No other source of the isotope.'],
        diagram: 'decay-curve',
        diagramNote: 'Activity halves every half-life; the curve is exponential, never reaching zero.',
        formulaOptions: [
          { tex: 'A = A_0e^{-\\lambda t},\\ \\lambda = \\dfrac{\\ln2}{t_{1/2}}', correct: true, why: 'Decay law applies to activity as well as N.' },
          { tex: 'A = A_0\\left(1 - \\dfrac{t}{2t_{1/2}}\\right)', why: 'Decay is exponential, not linear.' },
          { tex: 'E = mc^2', why: 'Not relevant.' },
        ],
        rearrangeOptions: [
          { tex: 'A = A_0\\exp\\!\\left(-\\dfrac{\\ln2}{t_{1/2}}t\\right)', correct: true, why: 'Substitute λ.' },
          { tex: 'A = A_0\\exp\\!\\left(-\\dfrac{t_{1/2}}{\\ln2}t\\right)', why: 'λ inverted.' },
        ],
        substitution: `\\lambda = \\dfrac{0.693}{${iso.th}} = ${t(lam)}\\ \\text{${iso.unit.slice(0, -1)}}^{-1}`,
        intermediate: [`A = ${A0}e^{-${t(lam)}\\times${tt}} = ${t(A)}\\ \\text{kBq}`],
        answer: A,
        unit: 'kBq',
        tol: 0.02,
        mistakes: [
          { value: A0 * (1 - tt / (2 * iso.th)), type: 'concept', message: 'Decay is exponential — not a linear decrease.' },
          { value: A0 * Math.pow(10, -lam * tt), type: 'formula', message: 'You used 10^x instead of e^x.' },
          { value: A0 - A, type: 'concept', message: 'That is the activity that has been LOST, not what remains.' },
        ],
        interpretOptions: [
          { tex: `\\text{After } ${t(tt / iso.th, 2)}\\text{ half-lives, about } ${t((100 * A) / A0, 2)}\\%\\text{ of the original activity remains.}`, correct: true, why: '(½)^n remains.' },
          { tex: '\\text{The sample will be completely gone after two half-lives.}', why: 'One quarter remains after two half-lives.' },
        ],
        verify: [`(½)^(t/t½) = ${sig(Math.pow(0.5, tt / iso.th))} ✓ matches A/A₀`, 'Units of λ and t match ✓'],
      };
    },
  },
  {
    id: 'mass-defect',
    title: 'Mass defect (atomic masses)',
    module: 8,
    section: 'm8-nucleus',
    generate: (rand) => {
      const nuc = choose(rand, [
        { key: 'He-4', Z: 2, A: 4, name: 'helium-4' },
        { key: 'C-12', Z: 6, A: 12, name: 'carbon-12' },
        { key: 'O-16', Z: 8, A: 16, name: 'oxygen-16' },
        { key: 'Fe-56', Z: 26, A: 56, name: 'iron-56' },
        { key: 'Li-7', Z: 3, A: 7, name: 'lithium-7' },
      ]);
      const M = ATOMIC_MASS[nuc.key];
      const mH = ATOMIC_MASS['H-1'];
      const mn = ATOMIC_MASS.n;
      const N = nuc.A - nuc.Z;
      const dm = nuc.Z * mH + N * mn - M;
      return {
        text: `The atomic mass of ${nuc.name} is ${M.toFixed(6)} u. Using m(¹H) = ${mH} u and m_n = ${mn} u, calculate its mass defect in u.`,
        situation: 'Mass defect from atomic masses (electron masses cancel using ¹H).',
        given: [
          { sym: 'Z', label: 'protons', value: nuc.Z, unit: '' },
          { sym: 'N', label: 'neutrons', value: N, unit: '' },
          { sym: 'M', label: 'atomic mass', value: M, unit: 'u' },
        ],
        unknown: { sym: '\\Delta m', label: 'mass defect', unit: 'u' },
        unknownOptions: ['Mass defect', 'Mass number', 'Binding energy per nucleon', 'Number of neutrons'],
        assumptions: ['Atomic masses used; Z electron masses in Z ¹H atoms cancel those of the atom.'],
        diagram: 'be-curve',
        diagramNote: 'The bound nucleus is lighter than its separated nucleons — the difference is the mass defect.',
        formulaOptions: [
          { tex: '\\Delta m = Zm(^1\\text{H}) + Nm_n - M_{atom}', correct: true, why: 'Total separated mass minus bound mass.' },
          { tex: '\\Delta m = M_{atom} - (Zm_p + Nm_n)', why: 'Sign reversed: Δm should be positive.' },
          { tex: 'A = Z + N', why: 'Mass number, not mass defect.' },
        ],
        rearrangeOptions: [
          { tex: '\\Delta m = Zm(^1\\text{H}) + (A - Z)m_n - M', correct: true, why: 'N = A − Z.' },
          { tex: '\\Delta m = A\\,m_n - M', why: 'Protons and neutrons have different masses.' },
        ],
        substitution: `\\Delta m = ${nuc.Z}(${mH}) + ${N}(${mn}) - ${M.toFixed(6)}`,
        intermediate: [`\\Delta m = ${dm.toFixed(6)}\\ \\text{u}`],
        answer: dm,
        unit: 'u',
        tol: 0.01,
        mistakes: [
          { value: -dm, type: 'sign', message: 'Sign reversed — the separated nucleons have MORE mass.' },
          { value: nuc.A * mn - M, type: 'concept', message: 'You treated all nucleons as neutrons.' },
          { value: dm * C.uMeV, type: 'units', message: 'That looks like MeV — the question asks for u.' },
        ],
        interpretOptions: [
          { tex: `\\text{Binding ${nuc.name} releases the energy equivalent of } ${dm.toFixed(5)}\\text{ u} \\approx ${t(dm * C.uMeV)}\\text{ MeV.}`, correct: true, why: 'E = Δmc² (931.5 MeV/u).' },
          { tex: '\\text{The nucleus has more mass than its separate nucleons.}', why: 'It has less.' },
        ],
        verify: ['Δm > 0 ✓', `Keep 6 d.p. — Δm is a small difference of large numbers.`],
      };
    },
  },
  {
    id: 'binding',
    title: 'Binding energy per nucleon',
    module: 8,
    section: 'm8-nucleus',
    generate: (rand) => {
      const nuc = choose(rand, [
        { key: 'He-4', Z: 2, A: 4, name: 'helium-4' },
        { key: 'C-12', Z: 6, A: 12, name: 'carbon-12' },
        { key: 'O-16', Z: 8, A: 16, name: 'oxygen-16' },
        { key: 'Fe-56', Z: 26, A: 56, name: 'iron-56' },
        { key: 'U-235', Z: 92, A: 235, name: 'uranium-235' },
        { key: 'U-238', Z: 92, A: 238, name: 'uranium-238' },
      ]);
      const M = ATOMIC_MASS[nuc.key];
      const dm = nuc.Z * ATOMIC_MASS['H-1'] + (nuc.A - nuc.Z) * ATOMIC_MASS.n - M;
      const BE = dm * C.uMeV;
      const per = BE / nuc.A;
      return {
        text: `The mass defect of ${nuc.name} is ${dm.toFixed(6)} u. Calculate its binding energy per nucleon in MeV.`,
        situation: 'Binding energy from mass defect, then divide by A.',
        given: [
          { sym: '\\Delta m', label: 'mass defect', value: dm, unit: 'u' },
          { sym: 'A', label: 'mass number', value: nuc.A, unit: '' },
        ],
        unknown: { sym: 'E_B/A', label: 'binding energy per nucleon', unit: 'MeV' },
        unknownOptions: ['Binding energy per nucleon', 'Total binding energy', 'Mass defect', 'Q-value of a reaction'],
        assumptions: ['1 u ≡ 931.5 MeV/c² (data sheet).'],
        diagram: 'be-curve',
        diagramNote: 'Binding energy per nucleon peaks near iron-56 (≈ 8.8 MeV).',
        formulaOptions: [
          { tex: 'E_B = \\Delta m \\times 931.5\\ \\text{MeV u}^{-1}', correct: true, why: 'Mass–energy equivalence in nuclear units.' },
          { tex: 'E = hf', why: 'Photon energy.' },
          { tex: 'E_B = \\Delta m\\,c^2 \\text{ with } \\Delta m \\text{ in u}', why: 'Must convert u to kg if using c².' },
        ],
        rearrangeOptions: [
          { tex: '\\dfrac{E_B}{A} = \\dfrac{931.5\\,\\Delta m}{A}', correct: true, why: 'Divide total binding energy by the number of nucleons.' },
          { tex: '\\dfrac{E_B}{A} = 931.5\\,\\Delta m\\,A', why: 'Divide by A.' },
        ],
        substitution: `E_B = ${dm.toFixed(6)} \\times 931.5 = ${t(BE, 4)}\\ \\text{MeV}`,
        intermediate: [`\\dfrac{E_B}{A} = \\dfrac{${t(BE, 4)}}{${nuc.A}} = ${t(per, 3)}\\ \\text{MeV}`],
        answer: per,
        unit: 'MeV',
        tol: 0.01,
        mistakes: [
          { value: BE, type: 'formula', message: 'That is the TOTAL binding energy — divide by A.' },
          { value: dm / nuc.A, type: 'units', message: 'Convert u to MeV (× 931.5).' },
        ],
        interpretOptions: [
          { tex: `\\text{On average, } ${t(per, 3)}\\text{ MeV is needed to remove each nucleon from ${nuc.name}.}`, correct: true, why: 'BE/A measures stability.' },
          { tex: '\\text{This energy is stored in the nucleus and released when it splits apart.}', why: 'Binding energy must be SUPPLIED to separate nucleons.' },
        ],
        verify: ['All nuclei except H-1 lie between ~1 and 8.8 MeV per nucleon ✓', nuc.key === 'Fe-56' ? 'Fe-56 is near the peak ✓' : 'Compare with the peak (Fe-56, 8.79 MeV).'],
      };
    },
  },
];

/**
 * Drop any "mistake" whose value happens to coincide with the correct answer for the generated
 * numbers (e.g. sin θ ≈ θ at small angles), so a correct response is never flagged as an error.
 */
export const TEMPLATES: ProblemTemplate[] = RAW_TEMPLATES.map((tpl) => ({
  ...tpl,
  generate: (rand) => {
    const p = tpl.generate(rand);
    return { ...p, mistakes: p.mistakes.filter((m) => Math.abs(m.value - p.answer) > Math.abs(p.answer) * p.tol) };
  },
}));

export const templateById = (id: string) => TEMPLATES.find((x) => x.id === id);

/** Problems the solver deliberately does not attempt — shown so it never invents answers. */
export const UNSUPPORTED = [
  'Projectiles with air resistance (requires numerical modelling beyond the HSC course).',
  'Non-uniform electric or magnetic fields, or particles entering fields at oblique angles (helical paths) with time-varying fields.',
  'Relativistic kinetic energy and velocity addition (beyond the syllabus formulae).',
  'Multi-electron atomic spectra (no simple formula — the Bohr/Rydberg model only applies to hydrogen).',
  'Reactor criticality calculations or anything involving the design of nuclear devices.',
];

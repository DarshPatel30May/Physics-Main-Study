import type { ModuleNo } from './formulas';
import { C } from '@/lib/physics/constants';
import { projectile } from '@/lib/physics/mechanics';
import { doubleSlitIntensity, singleSlitIntensity, planck, rayleighJeans, wienPeak } from '@/lib/physics/optics';
import { dipoleFluxThroughLoop, emfFromFlux } from '@/lib/physics/electromagnetism';
import { BE_PER_NUCLEON } from '@/lib/physics/nuclear';
import { STARS } from './stars';

export interface GraphParam {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  def: number;
  unit: string;
}

export interface BuiltGraph {
  data: Record<string, number | null>[];
  xKey: string;
  series: { key: string; label: string; dashed?: boolean; dot?: boolean }[];
  xDomain?: [number | 'auto', number | 'auto'];
  yDomain?: [number | 'auto', number | 'auto'];
  xScale?: 'linear' | 'log';
  yScale?: 'linear' | 'log';
  reversedX?: boolean;
  refX?: { x: number; label?: string }[];
  refY?: { y: number; label?: string }[];
  dots?: { x: number; y: number; label?: string }[];
  readout?: string;
}

export interface GraphDef {
  id: string;
  title: string;
  module: ModuleNo;
  xLabel: string;
  yLabel: string;
  relationship: string;
  gradient?: string;
  area?: string;
  limitations: string;
  params: GraphParam[];
  build: (p: Record<string, number>) => BuiltGraph;
}

const lin = (x0: number, x1: number, n: number) => Array.from({ length: n + 1 }, (_, i) => x0 + ((x1 - x0) * i) / n);
const logspace = (x0: number, x1: number, n: number) => lin(Math.log10(x0), Math.log10(x1), n).map((e) => 10 ** e);

export const GRAPHS: GraphDef[] = [
  {
    id: 'kinematics',
    title: 'Position, velocity and acceleration vs time (vertical motion)',
    module: 5,
    xLabel: 't (s)',
    yLabel: 'y (m), v (m s⁻¹), a (m s⁻²)',
    relationship: 'For a ball thrown straight up: y is a parabola, v_y is a straight line of gradient −g, and a is constant at −g.',
    gradient: 'Gradient of y–t = velocity; gradient of v–t = acceleration (−g).',
    area: 'Area under v–t = displacement (areas below the axis are negative).',
    limitations: 'Ignores air resistance; up is positive.',
    params: [{ key: 'u', label: 'initial vertical velocity', min: 0, max: 30, step: 1, def: 15, unit: 'm s⁻¹' }],
    build: ({ u }) => {
      const T = Math.max((2 * u) / C.g, 0.5);
      return {
        data: lin(0, T, 100).map((t) => ({ t, y: u * t - 0.5 * C.g * t * t, v: u - C.g * t, a: -C.g })),
        xKey: 't',
        series: [{ key: 'y', label: 'y (m)' }, { key: 'v', label: 'v (m s⁻¹)' }, { key: 'a', label: 'a (m s⁻²)', dashed: true }],
        refY: [{ y: 0 }],
        readout: `Top reached at t = ${(u / C.g).toFixed(2)} s, h = ${((u * u) / (2 * C.g)).toFixed(2)} m`,
      };
    },
  },
  {
    id: 'trajectories',
    title: 'Projectile trajectories for different launch angles',
    module: 5,
    xLabel: 'x (m)',
    yLabel: 'y (m)',
    relationship: 'Paths are parabolas. On level ground, 45° gives the maximum range and complementary angles share a range.',
    limitations: 'No air resistance; equal launch and landing heights.',
    params: [{ key: 'u', label: 'launch speed', min: 5, max: 30, step: 1, def: 20, unit: 'm s⁻¹' }],
    build: ({ u }) => {
      const angles = [15, 30, 45, 60, 75];
      const R = (u * u) / C.g;
      const xs = lin(0, R * 1.02, 120);
      const data = xs.map((x) => {
        const row: Record<string, number | null> = { x };
        for (const a of angles) {
          const p = projectile({ u, angleDeg: a, h0: 0, g: C.g });
          const t = x / p.ux;
          const y = p.uy * t - 0.5 * C.g * t * t;
          row[`a${a}`] = y >= -1e-9 ? y : null;
        }
        return row;
      });
      return { data, xKey: 'x', series: angles.map((a) => ({ key: `a${a}`, label: `${a}°` })), yDomain: [0, 'auto'], readout: `Max range (45°) = ${R.toFixed(1)} m` };
    },
  },
  {
    id: 'centripetal',
    title: 'Centripetal force vs speed and radius',
    module: 5,
    xLabel: 'v (m s⁻¹)',
    yLabel: 'F_c (N)',
    relationship: 'F_c = mv²/r: a parabola against v (straight line against v²). Larger radius → smaller force at the same speed.',
    gradient: 'Plotting F_c against v² gives a straight line with gradient m/r.',
    limitations: 'Uniform circular motion only.',
    params: [
      { key: 'm', label: 'mass', min: 0.1, max: 5, step: 0.1, def: 1, unit: 'kg' },
      { key: 'r', label: 'radius', min: 0.5, max: 5, step: 0.5, def: 1, unit: 'm' },
    ],
    build: ({ m, r }) => ({
      data: lin(0, 10, 100).map((v) => ({ v, F: (m * v * v) / r, F2: (m * v * v) / (2 * r) })),
      xKey: 'v',
      series: [{ key: 'F', label: `r = ${r} m` }, { key: 'F2', label: `r = ${2 * r} m`, dashed: true }],
    }),
  },
  {
    id: 'gravity-r',
    title: 'Gravitational force and field strength vs distance',
    module: 5,
    xLabel: 'r (Earth radii)',
    yLabel: 'g (N kg⁻¹)',
    relationship: 'g = GM/r² — an inverse-square curve: doubling r quarters g. Inside a uniform planet g would fall linearly to zero (not shown — outside only).',
    area: 'Area under F–r between r₁ and r₂ = work done against gravity = ΔU.',
    limitations: 'Outside a spherically symmetric body only.',
    params: [{ key: 'M', label: 'planet mass', min: 0.1, max: 3, step: 0.1, def: 1, unit: '× M_E' }],
    build: ({ M }) => ({
      data: lin(1, 8, 140).map((x) => ({ r: x, g: (C.G * M * C.ME) / (x * C.RE) ** 2 })),
      xKey: 'r',
      series: [{ key: 'g', label: 'g' }],
      dots: [{ x: 2, y: (C.G * M * C.ME) / (2 * C.RE) ** 2, label: '¼ of surface' }],
    }),
  },
  {
    id: 'flux-emf',
    title: 'Magnetic flux and induced emf vs time (magnet through coil)',
    module: 6,
    xLabel: 't (s)',
    yLabel: 'Φ (μWb), ε (mV)',
    relationship: 'emf = −N × gradient of the Φ–t graph. Maximum emf occurs where flux changes fastest; emf is zero at the flux peak. Entering and leaving give opposite emf signs (Lenz).',
    gradient: 'Gradient of Φ–t = rate of change of flux, ΔΦ/Δt.',
    area: 'Area under ε–t = −NΔΦ (net zero for a complete pass).',
    limitations: 'Magnet modelled as a point dipole moving at constant speed along the coil axis.',
    params: [
      { key: 'v', label: 'magnet speed', min: 0.2, max: 3, step: 0.1, def: 1, unit: 'm s⁻¹' },
      { key: 'N', label: 'turns', min: 50, max: 1000, step: 50, def: 200, unit: '' },
    ],
    build: ({ v, N }) => {
      const T = 0.4 / v;
      const n = 240;
      const dt = (2 * T) / n;
      const ts = lin(-T, T, n);
      const phi = ts.map((t) => dipoleFluxThroughLoop(1, 0.02, v * t));
      const emf = emfFromFlux(phi, dt, N);
      return {
        data: ts.map((t, i) => ({ t, phi: phi[i] * 1e6, emf: emf[i] * 1e3 })),
        xKey: 't',
        series: [{ key: 'phi', label: 'Φ (μWb)' }, { key: 'emf', label: 'ε (mV)' }],
        refY: [{ y: 0 }],
        readout: `Peak emf ≈ ${(Math.max(...emf) * 1e3).toFixed(1)} mV`,
      };
    },
  },
  {
    id: 'ac-generator',
    title: 'AC generator: flux and emf vs time',
    module: 6,
    xLabel: 't (s)',
    yLabel: 'Φ (mWb), ε (V)',
    relationship: 'Φ = BA cos ωt and ε = NBAω sin ωt: emf is 90° out of phase with flux. Faster rotation increases both the amplitude and frequency of the emf.',
    gradient: 'ε = −N × gradient of Φ–t.',
    limitations: 'Uniform field, constant angular velocity, ideal coil.',
    params: [
      { key: 'f', label: 'rotation frequency', min: 1, max: 10, step: 1, def: 2, unit: 'Hz' },
      { key: 'N', label: 'turns', min: 10, max: 200, step: 10, def: 50, unit: '' },
    ],
    build: ({ f, N }) => {
      const B = 0.2;
      const A = 0.01;
      const w = 2 * Math.PI * f;
      return {
        data: lin(0, 1, 300).map((t) => ({ t, phi: B * A * Math.cos(w * t) * 1e3, emf: N * B * A * w * Math.sin(w * t) })),
        xKey: 't',
        series: [{ key: 'phi', label: 'Φ (mWb)', dashed: true }, { key: 'emf', label: 'ε (V)' }],
        refY: [{ y: 0 }],
        readout: `Peak emf = NBAω = ${(N * B * A * w).toFixed(2)} V (B = 0.20 T, A = 0.010 m²)`,
      };
    },
  },
  {
    id: 'interference',
    title: 'Double-slit interference intensity',
    module: 7,
    xLabel: 'y on screen (mm)',
    yLabel: 'relative intensity',
    relationship: 'cos² fringes (spacing λL/d) modulated by the single-slit diffraction envelope.',
    limitations: 'Fraunhofer (far-field) model; coherent monochromatic light.',
    params: [
      { key: 'lam', label: 'wavelength', min: 400, max: 700, step: 10, def: 600, unit: 'nm' },
      { key: 'd', label: 'slit separation', min: 0.1, max: 1, step: 0.05, def: 0.25, unit: 'mm' },
      { key: 'a', label: 'slit width', min: 0.02, max: 0.1, step: 0.01, def: 0.05, unit: 'mm' },
    ],
    build: ({ lam, d, a }) => {
      const L = 1;
      return {
        data: lin(-15, 15, 600).map((y) => {
          const th = Math.atan((y * 1e-3) / L);
          return { y, I: doubleSlitIntensity(th, d * 1e-3, lam * 1e-9, a * 1e-3), env: singleSlitIntensity(th, a * 1e-3, lam * 1e-9) };
        }),
        xKey: 'y',
        series: [{ key: 'I', label: 'intensity' }, { key: 'env', label: 'single-slit envelope', dashed: true }],
        readout: `Fringe spacing λL/d = ${((lam * 1e-9 * L) / (d * 1e-3) * 1e3).toFixed(2)} mm (L = 1.0 m)`,
      };
    },
  },
  {
    id: 'diffraction',
    title: 'Single-slit diffraction intensity',
    module: 7,
    xLabel: 'θ (°)',
    yLabel: 'relative intensity',
    relationship: 'Central maximum twice as wide as the side maxima; minima at a sin θ = mλ. Narrower slits spread the pattern.',
    limitations: 'Supplementary quantitative model (the syllabus requires qualitative analysis).',
    params: [
      { key: 'a', label: 'slit width', min: 1, max: 10, step: 0.5, def: 3, unit: 'μm' },
      { key: 'lam', label: 'wavelength', min: 400, max: 700, step: 10, def: 550, unit: 'nm' },
    ],
    build: ({ a, lam }) => ({
      data: lin(-40, 40, 500).map((t) => ({ t, I: singleSlitIntensity((t * Math.PI) / 180, a * 1e-6, lam * 1e-9) })),
      xKey: 't',
      series: [{ key: 'I', label: 'I/I₀' }],
      readout: `First minimum at θ = ${((Math.asin(Math.min(1, (lam * 1e-9) / (a * 1e-6))) * 180) / Math.PI).toFixed(1)}°`,
    }),
  },
  {
    id: 'blackbody',
    title: 'Blackbody radiation curves',
    module: 7,
    xLabel: 'λ (nm)',
    yLabel: 'spectral radiance (relative)',
    relationship: 'Hotter bodies emit more at every wavelength and peak at shorter wavelengths (λ_max = b/T). The classical Rayleigh–Jeans prediction diverges at short λ.',
    area: 'Total area under the curve ∝ T⁴ (Stefan–Boltzmann law — supplementary).',
    limitations: 'Ideal blackbodies; stars only approximate this.',
    params: [{ key: 'T', label: 'temperature', min: 2500, max: 10000, step: 100, def: 5800, unit: 'K' }],
    build: ({ T }) => {
      const norm = planck(wienPeak(T), T);
      return {
        data: lin(100, 2500, 300).map((l) => ({
          l,
          B: planck(l * 1e-9, T) / norm,
          B2: planck(l * 1e-9, T * 0.75) / norm,
          RJ: Math.min(rayleighJeans(l * 1e-9, T) / norm, 3),
        })),
        xKey: 'l',
        series: [{ key: 'B', label: `${T} K` }, { key: 'B2', label: `${Math.round(T * 0.75)} K` }, { key: 'RJ', label: 'classical (RJ)', dashed: true }],
        yDomain: [0, 2],
        refX: [{ x: wienPeak(T) * 1e9, label: 'λmax' }],
        readout: `λmax = b/T = ${(wienPeak(T) * 1e9).toFixed(0)} nm`,
      };
    },
  },
  {
    id: 'photoelectric',
    title: 'Photoelectric effect: K_max vs frequency',
    module: 7,
    xLabel: 'f (× 10¹⁴ Hz)',
    yLabel: 'K_max (eV)',
    relationship: 'Straight lines of gradient h for every metal; x-intercept = threshold frequency f₀; y-intercept = −φ.',
    gradient: 'Gradient = h (6.63 × 10⁻³⁴ J s, or 4.14 × 10⁻¹⁵ eV s).',
    limitations: 'Below f₀ no electrons are emitted, so the physical graph is zero there (dashed extension shows the intercept).',
    params: [{ key: 'phi', label: 'work function', min: 1.5, max: 5.5, step: 0.1, def: 2.3, unit: 'eV' }],
    build: ({ phi }) => {
      const f0 = (phi * C.eV) / C.h / 1e14;
      return {
        data: lin(0, 20, 200).map((f) => {
          const k = (C.h * f * 1e14) / C.eV - phi;
          return { f, K: k >= 0 ? k : null, ext: k < 0 ? k : null, Cs: Math.max(0, (C.h * f * 1e14) / C.eV - 2.1) };
        }),
        xKey: 'f',
        series: [{ key: 'K', label: `φ = ${phi} eV` }, { key: 'ext', label: 'extrapolation', dashed: true }, { key: 'Cs', label: 'caesium (2.1 eV)', dashed: true }],
        refY: [{ y: 0 }],
        refX: [{ x: f0, label: 'f₀' }],
        readout: `Threshold f₀ = φ/h = ${f0.toFixed(2)} × 10¹⁴ Hz`,
      };
    },
  },
  {
    id: 'lorentz',
    title: 'Lorentz factor vs speed',
    module: 7,
    xLabel: 'v/c',
    yLabel: 'γ',
    relationship: 'γ ≈ 1 for everyday speeds and rises steeply towards infinity as v → c: massive objects cannot reach c.',
    limitations: 'Inertial frames; v < c.',
    params: [{ key: 'b', label: 'marker speed', min: 0, max: 0.99, step: 0.01, def: 0.8, unit: 'c' }],
    build: ({ b }) => ({
      data: lin(0, 0.995, 200).map((x) => ({ x, g: 1 / Math.sqrt(1 - x * x), p: x / Math.sqrt(1 - x * x), pc: x })),
      xKey: 'x',
      series: [{ key: 'g', label: 'γ' }, { key: 'p', label: 'p/(m₀c) relativistic', dashed: true }, { key: 'pc', label: 'p/(m₀c) classical', dashed: true }],
      yDomain: [0, 10],
      dots: [{ x: b, y: 1 / Math.sqrt(1 - b * b), label: `γ = ${(1 / Math.sqrt(1 - b * b)).toFixed(3)}` }],
    }),
  },
  {
    id: 'hr',
    title: 'Hertzsprung–Russell diagram',
    module: 8,
    xLabel: 'surface temperature (K) — decreasing →',
    yLabel: 'luminosity (L☉, log scale)',
    relationship: 'Main sequence runs from hot, luminous (upper left) to cool, dim (lower right). Giants upper right; white dwarfs lower left.',
    limitations: 'Approximate literature values; star properties vary between sources.',
    params: [],
    build: () => ({
      data: STARS.map((s) => ({ T: s.T, L: s.L })),
      xKey: 'T',
      series: [{ key: 'L', label: 'stars', dot: true }],
      xScale: 'log',
      yScale: 'log',
      reversedX: true,
      xDomain: [2500, 40000],
      yDomain: [1e-4, 1e6],
    }),
  },
  {
    id: 'decay',
    title: 'Radioactive decay curve',
    module: 8,
    xLabel: 't (half-lives)',
    yLabel: 'N/N₀',
    relationship: 'N = N₀e^(−λt): halves every half-life. ln N vs t is a straight line of gradient −λ.',
    gradient: 'Gradient of N–t = −activity (A = λN); on ln N–t the gradient is −λ.',
    limitations: 'Statistical law — exact only for large N.',
    params: [{ key: 'th', label: 'half-life', min: 1, max: 10, step: 0.5, def: 2, unit: 's' }],
    build: ({ th }) => ({
      data: lin(0, 6 * th, 200).map((t) => ({ t: t / th, N: Math.exp((-Math.LN2 * t) / th), lnN: -Math.LN2 * (t / th) })),
      xKey: 't',
      series: [{ key: 'N', label: 'N/N₀' }],
      yDomain: [0, 1],
      dots: [1, 2, 3].map((n) => ({ x: n, y: 0.5 ** n, label: `${0.5 ** n}` })),
      readout: `λ = ln 2/t½ = ${(Math.LN2 / th).toFixed(3)} s⁻¹`,
    }),
  },
  {
    id: 'binding',
    title: 'Binding energy per nucleon',
    module: 8,
    xLabel: 'mass number A',
    yLabel: 'BE/A (MeV)',
    relationship: 'Rises steeply for light nuclei, peaks near Fe-56/Ni-62 (≈ 8.8 MeV), then falls slowly. Fusion (left) and fission (right) both move towards the peak and release energy.',
    limitations: 'Selected nuclides from AME2020 masses; He-4 lies above the smooth trend.',
    params: [],
    build: () => ({
      data: BE_PER_NUCLEON.map((b) => ({ A: b.A, be: b.be })),
      xKey: 'A',
      series: [{ key: 'be', label: 'BE/A', dot: true }],
      yDomain: [0, 9.5],
      dots: [
        { x: 56, y: 8.79, label: 'Fe-56' },
        { x: 4, y: 7.07, label: 'He-4' },
        { x: 235, y: 7.59, label: 'U-235' },
      ],
    }),
  },
  {
    id: 'hubble',
    title: 'Hubble diagram (model)',
    module: 8,
    xLabel: 'distance (Mpc)',
    yLabel: 'recession velocity (km s⁻¹)',
    relationship: 'v = H₀d: a straight line through the origin; gradient = H₀. 1/H₀ estimates the age of the Universe.',
    gradient: 'Gradient = H₀ (km s⁻¹ Mpc⁻¹).',
    limitations: 'Illustrative straight line — not a dataset. Real data scatter due to peculiar velocities; H₀ measurements range ~67–73.',
    params: [{ key: 'H', label: 'H₀', min: 50, max: 90, step: 1, def: 70, unit: 'km s⁻¹ Mpc⁻¹' }],
    build: ({ H }) => ({
      data: lin(0, 500, 50).map((d) => ({ d, v: H * d })),
      xKey: 'd',
      series: [{ key: 'v', label: `v = ${H}d` }],
      readout: `1/H₀ ≈ ${((3.086e19 / H) / 3.156e7 / 1e9).toFixed(1)} billion years`,
    }),
  },
  {
    id: 'energy-orbit',
    title: 'Orbital energy vs radius',
    module: 5,
    xLabel: 'r (Earth radii)',
    yLabel: 'energy (× 10¹⁰ J)',
    relationship: 'For a 1000 kg satellite: U = −GMm/r, K = GMm/2r, E = −GMm/2r. Raising the orbit increases U and E but decreases K.',
    limitations: 'Circular orbits around Earth; zero of U at infinity.',
    params: [{ key: 'm', label: 'satellite mass', min: 100, max: 5000, step: 100, def: 1000, unit: 'kg' }],
    build: ({ m }) => ({
      data: lin(1, 10, 150).map((x) => {
        const r = x * C.RE;
        const GMm = C.G * C.ME * m;
        return { r: x, U: -GMm / r / 1e10, K: GMm / (2 * r) / 1e10, E: -GMm / (2 * r) / 1e10 };
      }),
      xKey: 'r',
      series: [{ key: 'U', label: 'U' }, { key: 'K', label: 'K' }, { key: 'E', label: 'E = U + K', dashed: true }],
      refY: [{ y: 0 }],
    }),
  },
  {
    id: 'malus',
    title: 'Malus’ law',
    module: 7,
    xLabel: 'θ (°)',
    yLabel: 'I/I_max',
    relationship: 'I = I_max cos²θ: maximum when the axes align, zero when crossed (90°).',
    limitations: 'Ideal polarisers; incident light already plane-polarised.',
    params: [],
    build: () => ({
      data: lin(0, 180, 180).map((t) => ({ t, I: Math.cos((t * Math.PI) / 180) ** 2 })),
      xKey: 't',
      series: [{ key: 'I', label: 'cos²θ' }],
      yDomain: [0, 1],
    }),
  },
];

export const graphById = (id: string) => GRAPHS.find((g) => g.id === id);
export { logspace };

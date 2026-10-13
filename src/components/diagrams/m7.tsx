import { Arrow, Label, MiniAxes } from '../svg';
import type { DiagramDef } from './types';
import { planck, wienPeak } from '@/lib/physics/optics';

const VB = '0 0 320 200';

export const M7_DIAGRAMS: Record<string, DiagramDef> = {
  'em-wave': {
    title: 'Electromagnetic wave',
    caption: 'Oscillating E and B fields are perpendicular to each other and to the direction of travel, and in phase.',
    render: () => {
      const e = Array.from({ length: 121 }, (_, i) => `${i ? 'L' : 'M'}${30 + i * 2.2},${100 - 55 * Math.sin((i / 120) * 4 * Math.PI)}`).join(' ');
      const b = Array.from({ length: 121 }, (_, i) => {
        const x = 30 + i * 2.2;
        const a = 40 * Math.sin((i / 120) * 4 * Math.PI);
        return `${i ? 'L' : 'M'}${x - a * 0.5},${100 + a * 0.35}`;
      }).join(' ');
      return (
        <svg viewBox={VB}>
          <Arrow x1={20} y1={100} x2={310} y2={100} className="text-muted" label="c" />
          <path d={e} fill="none" className="stroke-accent" strokeWidth={2} />
          <path d={b} fill="none" className="stroke-m6" strokeWidth={2} />
          <Label x={40} y={30} size={11} className="fill-accent">E (vertical)</Label>
          <Label x={40} y={180} size={11} className="fill-m6">B (horizontal, ⟂ E)</Label>
          <line x1={62} y1={100} x2={62} y2={45} className="stroke-muted" strokeDasharray="2 3" />
          <Label x={150} y={196} size={10} className="fill-muted">λ = distance between successive crests</Label>
        </svg>
      );
    },
  },
  fizeau: {
    title: 'Fizeau’s toothed-wheel method (1849)',
    caption: 'Light passes a gap, reflects from a distant mirror and returns. At the right rotation rate a tooth blocks it: c = 4dNf.',
    render: () => (
      <svg viewBox={VB}>
        <circle cx={70} cy={100} r={45} className="fill-line" />
        {Array.from({ length: 16 }, (_, i) => (
          <rect key={i} x={67} y={48} width={6} height={10} className="fill-muted" transform={`rotate(${i * 22.5} 70 100)`} />
        ))}
        <line x1={70} y1={52} x2={300} y2={52} className="stroke-m7" strokeWidth={2.5} />
        <rect x={300} y={35} width={8} height={34} className="fill-m5" />
        <Label x={210} y={44} size={11}>d ≈ 8.6 km</Label>
        <Label x={250} y={90} size={10}>distant mirror</Label>
        <Label x={20} y={180} size={10} className="fill-muted">rotating toothed wheel</Label>
      </svg>
    ),
  },
  'spectra-types': {
    title: 'Continuous, emission and absorption spectra',
    caption: 'Hot dense source → continuous. Hot thin gas → bright lines. Cool gas in front of a continuous source → dark lines at the same wavelengths.',
    render: () => {
      const lines = [410, 434, 486, 656];
      const X = (nm: number) => 20 + ((nm - 380) / 370) * 280;
      const grad = (id: string) => (
        <linearGradient id={id} x1="0" x2="1">
          {['#7c3aed', '#3b82f6', '#22c55e', '#eab308', '#f97316', '#ef4444'].map((c, i) => <stop key={c} offset={i / 5} stopColor={c} />)}
        </linearGradient>
      );
      return (
        <svg viewBox={VB}>
          <defs>{grad('rb1')}{grad('rb2')}</defs>
          <rect x={20} y={20} width={280} height={30} fill="url(#rb1)" />
          <Label x={20} y={15} size={10}>continuous</Label>
          <rect x={20} y={85} width={280} height={30} className="fill-black" />
          {lines.map((l) => (
            <rect key={l} x={X(l) - 1.5} y={85} width={3} height={30} fill={l > 600 ? '#ef4444' : l > 480 ? '#22d3ee' : '#7c3aed'} />
          ))}
          <Label x={20} y={80} size={10}>emission (hydrogen)</Label>
          <rect x={20} y={150} width={280} height={30} fill="url(#rb2)" />
          {lines.map((l) => (
            <rect key={l} x={X(l) - 1.5} y={150} width={3} height={30} className="fill-black" />
          ))}
          <Label x={20} y={145} size={10}>absorption (hydrogen)</Label>
        </svg>
      );
    },
  },
  'doppler-lines': {
    title: 'Doppler shift of spectral lines',
    caption: 'A receding star’s lines shift to longer wavelengths (redshift); an approaching star’s to shorter (blueshift). Δλ/λ ≈ v/c.',
    render: () => {
      const X = (nm: number) => 20 + ((nm - 380) / 370) * 280;
      return (
        <svg viewBox={VB}>
          {[
            { y: 30, shift: 0, l: 'laboratory' },
            { y: 90, shift: 18, l: 'receding (redshift)' },
            { y: 150, shift: -14, l: 'approaching (blueshift)' },
          ].map((r) => (
            <g key={r.l}>
              <rect x={20} y={r.y} width={280} height={24} className="fill-panel2" />
              {[434, 486, 656].map((nm) => (
                <rect key={nm} x={X(nm) + r.shift - 1.5} y={r.y} width={3} height={24} className="fill-ink" />
              ))}
              <Label x={20} y={r.y - 4} size={10}>{r.l}</Label>
            </g>
          ))}
        </svg>
      );
    },
  },
  huygens: {
    title: 'Huygens’ principle',
    caption: 'Every point on a wavefront is a source of secondary wavelets; the new wavefront is their common tangent.',
    render: () => (
      <svg viewBox={VB}>
        <line x1={80} y1={20} x2={80} y2={180} className="stroke-accent" strokeWidth={2} />
        {[35, 65, 95, 125, 155].map((y) => (
          <path key={y} d={`M80,${y - 30} A30,30 0 0,1 80,${y + 30}`} fill="none" className="stroke-m7" strokeDasharray="3 3" />
        ))}
        <line x1={110} y1={20} x2={110} y2={180} className="stroke-accent" strokeWidth={2} />
        <Arrow x1={130} y1={100} x2={180} y2={100} className="text-muted" label="travel" />
        <Label x={40} y={196} size={10} className="fill-muted">wavefront</Label>
        <Label x={115} y={196} size={10} className="fill-muted">new wavefront</Label>
      </svg>
    ),
  },
  diffraction: {
    title: 'Diffraction through a gap',
    caption: 'Spreading is significant when the gap is comparable to the wavelength; a wide gap gives little spreading.',
    render: () => (
      <svg viewBox={VB}>
        {[30, 50, 70].map((x) => (
          <line key={x} x1={x} y1={20} x2={x} y2={180} className="stroke-accent" />
        ))}
        <rect x={95} y={10} width={8} height={80} className="fill-muted" />
        <rect x={95} y={110} width={8} height={80} className="fill-muted" />
        {[25, 45, 65, 85].map((r) => (
          <path key={r} d={`M103,${100 - r} A${r},${r} 0 0,1 103,${100 + r}`} fill="none" className="stroke-accent" />
        ))}
        <Label x={200} y={100} size={11}>narrow gap: waves spread out</Label>
      </svg>
    ),
  },
  'double-slit': {
    title: 'Young’s double slit',
    caption: 'Bright fringe where path difference = mλ; dark where it is (m + ½)λ. Fringe spacing Δy = λL/d.',
    render: () => (
      <svg viewBox={VB}>
        <rect x={60} y={10} width={6} height={70} className="fill-muted" />
        <rect x={60} y={90} width={6} height={20} className="fill-muted" />
        <rect x={60} y={120} width={6} height={70} className="fill-muted" />
        <line x1={66} y1={85} x2={280} y2={50} className="stroke-m7" />
        <line x1={66} y1={115} x2={280} y2={50} className="stroke-m7" />
        <line x1={280} y1={10} x2={280} y2={190} className="stroke-ink" strokeWidth={3} />
        {[-3, -2, -1, 0, 1, 2, 3].map((m) => (
          <rect key={m} x={282} y={100 + m * 25 - 4} width={14} height={8} className="fill-m7" opacity={1 - Math.abs(m) * 0.2} />
        ))}
        <Label x={40} y={104} size={11}>d</Label>
        <Label x={170} y={196} size={11}>L</Label>
        <Label x={300} y={54} size={10}>P</Label>
        <Label x={90} y={30} size={10} className="fill-muted">path difference = d sin θ</Label>
      </svg>
    ),
  },
  grating: {
    title: 'Diffraction grating',
    caption: 'Many equally spaced slits give sharp principal maxima at d sin θ = mλ. Longer wavelengths are diffracted more.',
    render: () => (
      <svg viewBox={VB}>
        <rect x={60} y={20} width={6} height={160} className="fill-muted" />
        {Array.from({ length: 15 }, (_, i) => (
          <rect key={i} x={60} y={24 + i * 10.5} width={6} height={3} className="fill-bg" />
        ))}
        <line x1={10} y1={100} x2={60} y2={100} className="stroke-ink" strokeWidth={3} />
        {[
          [0, '#e5e7eb', 'm = 0'],
          [20, '#7c3aed', 'm = 1 violet'],
          [33, '#ef4444', 'm = 1 red'],
          [-20, '#7c3aed', ''],
          [-33, '#ef4444', ''],
        ].map(([a, c, l]) => {
          const r = ((a as number) * Math.PI) / 180;
          return (
            <g key={String(a)}>
              <line x1={66} y1={100} x2={66 + 230 * Math.cos(r)} y2={100 - 230 * Math.sin(r)} stroke={c as string} strokeWidth={2} />
              {l && <Label x={66 + 200 * Math.cos(r) - 20} y={100 - 200 * Math.sin(r) - 6} size={10}>{l as string}</Label>}
            </g>
          );
        })}
      </svg>
    ),
  },
  polariser: {
    title: 'Polariser and analyser',
    caption: 'The first polariser halves unpolarised intensity. The analyser transmits I = I_max cos²θ.',
    render: () => (
      <svg viewBox={VB}>
        <line x1={10} y1={100} x2={310} y2={100} className="stroke-line" />
        {[0, 45, 90, 135].map((a) => (
          <line key={a} x1={40 - 20 * Math.sin((a * Math.PI) / 180) * 0.4} y1={100 - 20 * Math.cos((a * Math.PI) / 180)} x2={40 + 20 * Math.sin((a * Math.PI) / 180) * 0.4} y2={100 + 20 * Math.cos((a * Math.PI) / 180)} className="stroke-m7" strokeWidth={2} />
        ))}
        <ellipse cx={110} cy={100} rx={14} ry={55} className="fill-m6/10 stroke-m6" />
        <line x1={110} y1={50} x2={110} y2={150} className="stroke-m6" strokeWidth={2} />
        <line x1={170} y1={75} x2={170} y2={125} className="stroke-m7" strokeWidth={2} />
        <ellipse cx={230} cy={100} rx={14} ry={55} className="fill-m6/10 stroke-m6" />
        <line x1={218} y1={60} x2={242} y2={140} className="stroke-m6" strokeWidth={2} />
        <line x1={285} y1={88} x2={291} y2={112} className="stroke-m7" strokeWidth={2} />
        <Label x={20} y={180} size={10}>unpolarised I₀</Label>
        <Label x={95} y={180} size={10}>polariser</Label>
        <Label x={150} y={30} size={10}>½I₀</Label>
        <Label x={210} y={180} size={10}>analyser at θ</Label>
        <Label x={262} y={60} size={10}>½I₀cos²θ</Label>
      </svg>
    ),
  },
  'blackbody-curves': {
    title: 'Blackbody radiation curves',
    caption: 'Hotter bodies emit more at every wavelength, and their peak shifts to shorter λ (λ_max = b/T). Classical theory diverged at short λ.',
    render: () => {
      const Ts = [6000, 5000, 4000];
      const norm = planck(wienPeak(6000), 6000);
      return (
        <svg viewBox={VB}>
          <MiniAxes x={30} y={15} w={280} h={160} xLabel="λ" yLabel="intensity" />
          {Ts.map((T, k) => (
            <path
              key={T}
              d={Array.from({ length: 100 }, (_, i) => {
                const l = 100 + i * 20;
                return `${i ? 'L' : 'M'}${30 + i * 2.7},${175 - (planck(l * 1e-9, T) / norm) * 150}`;
              }).join(' ')}
              fill="none"
              stroke={['#60a5fa', '#fbbf24', '#ef4444'][k]}
              strokeWidth={2}
            />
          ))}
          <path d="M45,20 C55,120 90,160 300,172" fill="none" className="stroke-muted" strokeDasharray="5 4" />
          <Label x={120} y={40} size={10} className="fill-muted">6000 K, 5000 K, 4000 K</Label>
          <Label x={50} y={30} size={10} className="fill-muted">classical (UV catastrophe)</Label>
        </svg>
      );
    },
  },
  'photoelectric-setup': {
    title: 'Photoelectric effect apparatus',
    caption: 'Photons eject electrons from the cathode; a reverse voltage V₀ just stops the fastest ones: eV₀ = K_max = hf − φ.',
    render: () => (
      <svg viewBox={VB}>
        <rect x={40} y={30} width={240} height={110} rx={50} fill="none" className="stroke-line" strokeWidth={2} />
        <rect x={70} y={50} width={8} height={70} className="fill-muted" />
        <rect x={240} y={50} width={8} height={70} className="fill-muted" />
        {[60, 85, 110].map((y) => (
          <path key={y} d={`M10,${y - 20} q5,-5 10,0 t10,0 t10,0 t10,0 t10,0`} fill="none" className="stroke-m6" strokeWidth={2} transform={`rotate(25 10 ${y - 20})`} />
        ))}
        {[70, 90, 100].map((y) => (
          <Arrow key={y} x1={82} y1={y} x2={140} y2={y} className="text-accent" label="e⁻" width={1.5} />
        ))}
        <line x1={74} y1={120} x2={74} y2={170} className="stroke-muted" />
        <line x1={244} y1={120} x2={244} y2={170} className="stroke-muted" />
        <line x1={74} y1={170} x2={244} y2={170} className="stroke-muted" />
        <circle cx={160} cy={170} r={12} className="fill-panel stroke-muted" />
        <Label x={160} y={174} anchor="middle" size={10}>A</Label>
        <Label x={60} y={140} size={10}>cathode</Label>
        <Label x={232} y={140} size={10}>anode</Label>
      </svg>
    ),
  },
  'kmax-graph': {
    title: 'K_max against frequency',
    caption: 'Straight line: gradient = h (same for all metals), x-intercept = f₀, y-intercept = −φ.',
    render: () => (
      <svg viewBox={VB}>
        <MiniAxes x={40} y={10} w={270} h={120} xLabel="f" yLabel="K_max" />
        <line x1={40} y1={130} x2={310} y2={130} className="stroke-muted" />
        <line x1={110} y1={130} x2={290} y2={30} className="stroke-accent" strokeWidth={2} />
        <line x1={40} y1={169} x2={110} y2={130} className="stroke-accent" strokeDasharray="4 4" />
        <line x1={170} y1={130} x2={300} y2={58} className="stroke-m7" strokeWidth={2} />
        <Label x={100} y={146} size={11}>f₀</Label>
        <Label x={8} y={172} size={11}>−φ</Label>
        <Label x={200} y={60} size={11} className="fill-accent">gradient = h</Label>
        <Label x={250} y={100} size={10} className="fill-m7">metal with larger φ</Label>
      </svg>
    ),
  },
  michelson: {
    title: 'Michelson–Morley interferometer',
    caption: 'A beam splitter sends light along two perpendicular arms; recombined beams form fringes. No fringe shift was observed on rotation.',
    render: () => (
      <svg viewBox={VB}>
        <circle cx={30} cy={110} r={8} className="fill-m7" />
        <line x1={38} y1={110} x2={150} y2={110} className="stroke-m7" strokeWidth={2} />
        <rect x={136} y={107} width={28} height={6} className="fill-accent" transform="rotate(45 150 110)" />
        <line x1={150} y1={110} x2={280} y2={110} className="stroke-m7" strokeWidth={2} />
        <rect x={280} y={92} width={6} height={36} className="fill-m5" />
        <line x1={150} y1={110} x2={150} y2={20} className="stroke-m7" strokeWidth={2} />
        <rect x={132} y={14} width={36} height={6} className="fill-m5" />
        <line x1={150} y1={110} x2={150} y2={180} className="stroke-m7" strokeDasharray="5 3" strokeWidth={2} />
        <rect x={140} y={180} width={20} height={12} className="fill-muted" />
        <Label x={168} y={96} size={10}>beam splitter</Label>
        <Label x={170} y={190} size={10}>detector</Label>
        <Label x={250} y={145} size={10}>mirror</Label>
      </svg>
    ),
  },
  'inertial-frames': {
    title: 'Inertial frames of reference',
    caption: 'A frame moving at constant velocity relative to another. No experiment inside a closed inertial frame can detect its uniform motion.',
    render: () => (
      <svg viewBox={VB}>
        <line x1={20} y1={160} x2={300} y2={160} className="stroke-muted" strokeWidth={2} />
        <rect x={120} y={100} width={150} height={50} rx={8} className="fill-m5" opacity={0.3} />
        <Arrow x1={200} y1={90} x2={260} y2={90} className="text-accent" label="v (constant)" />
        <circle cx={60} cy={140} r={8} className="fill-good" />
        <circle cx={190} cy={128} r={8} className="fill-m6" />
        <Label x={40} y={185} size={10}>frame S (platform)</Label>
        <Label x={150} y={185} size={10}>frame S′ (train)</Label>
      </svg>
    ),
  },
  simultaneity: {
    title: 'Relativity of simultaneity (Einstein’s train)',
    caption: 'Strikes simultaneous for the platform observer are not simultaneous for the train observer, who meets the front flash first.',
    render: () => (
      <svg viewBox={VB}>
        <line x1={10} y1={150} x2={310} y2={150} className="stroke-muted" strokeWidth={2} />
        <rect x={60} y={100} width={200} height={40} rx={6} className="fill-m5" opacity={0.3} />
        <Label x={60} y={92} anchor="middle" size={16}>⚡</Label>
        <Label x={260} y={92} anchor="middle" size={16}>⚡</Label>
        <circle cx={160} cy={118} r={7} className="fill-m6" />
        <circle cx={160} cy={170} r={7} className="fill-good" />
        <Arrow x1={170} y1={60} x2={220} y2={60} className="text-accent" label="v" />
        <Label x={175} y={124} size={9}>train observer</Label>
        <Label x={175} y={176} size={9}>platform observer</Label>
      </svg>
    ),
  },
  'light-clock': {
    title: 'Light clock and time dilation',
    caption: 'Seen from a frame where the clock moves, light travels a longer diagonal path at the same speed c, so the tick takes longer: t = γt₀.',
    render: () => (
      <svg viewBox={VB}>
        <rect x={30} y={30} width={40} height={6} className="fill-m5" />
        <rect x={30} y={160} width={40} height={6} className="fill-m5" />
        <Arrow x1={50} y1={160} x2={50} y2={38} className="text-m7" label="ct₀/2" />
        <Label x={20} y={190} size={10}>clock’s rest frame</Label>
        {[120, 200, 280].map((x, i) => (
          <g key={x}>
            <rect x={x - 20} y={i === 1 ? 30 : 160} width={40} height={6} className="fill-m6" opacity={0.6} />
          </g>
        ))}
        <Arrow x1={120} y1={160} x2={200} y2={38} className="text-m7" label="ct/2" />
        <Arrow x1={200} y1={38} x2={280} y2={160} className="text-m7" />
        <Arrow x1={120} y1={180} x2={200} y2={180} className="text-accent" label="vt/2" labelOffset={[-40, 14]} />
        <Label x={150} y={20} size={10}>seen from the lab frame</Label>
      </svg>
    ),
  },
  'length-contraction': {
    title: 'Length contraction',
    caption: 'A moving object is measured shorter along its direction of motion: l = l₀√(1 − v²/c²). Perpendicular dimensions are unchanged.',
    render: () => (
      <svg viewBox={VB}>
        <rect x={40} y={40} width={240} height={40} rx={10} className="fill-m5" opacity={0.6} />
        <Label x={160} y={66} anchor="middle" size={11}>at rest: proper length l₀</Label>
        <rect x={100} y={120} width={120} height={40} rx={10} className="fill-m6" opacity={0.6} />
        <Label x={160} y={146} anchor="middle" size={11}>moving at 0.87c: l = l₀/2</Label>
        <Arrow x1={230} y1={140} x2={290} y2={140} className="text-accent" label="v" />
      </svg>
    ),
  },
  annihilation: {
    title: 'Electron–positron annihilation',
    caption: 'All rest mass becomes energy: two 511 keV gamma photons travelling in opposite directions (conserving momentum).',
    render: () => (
      <svg viewBox={VB}>
        <circle cx={120} cy={100} r={10} className="fill-m5" />
        <circle cx={200} cy={100} r={10} className="fill-bad" />
        <Label x={120} y={104} anchor="middle" size={11} className="fill-white">e⁻</Label>
        <Label x={200} y={104} anchor="middle" size={11} className="fill-white">e⁺</Label>
        <path d="M160,100 q8,-8 16,-16 t16,-16 t16,-16" fill="none" className="stroke-m7" strokeWidth={2} transform="translate(0,-20)" />
        <path d="M160,100 q-8,8 -16,16 t-16,16 t-16,16" fill="none" className="stroke-m7" strokeWidth={2} transform="translate(0,20)" />
        <Label x={220} y={30} size={11}>γ (511 keV)</Label>
        <Label x={60} y={185} size={11}>γ (511 keV)</Label>
      </svg>
    ),
  },
};

import { Arrow, Label, FieldMark, FieldGrid } from '../svg';
import type { DiagramDef } from './types';

const VB = '0 0 320 200';

export const M6_DIAGRAMS: Record<string, DiagramDef> = {
  'parallel-plates': {
    title: 'Uniform electric field between parallel plates',
    caption: 'E = V/d points from + to −. A positive charge is pushed along E; an electron is pushed opposite to E.',
    render: () => (
      <svg viewBox={VB}>
        <rect x={40} y={30} width={240} height={8} className="fill-bad" />
        <rect x={40} y={162} width={240} height={8} className="fill-m5" />
        <Label x={286} y={38} size={13} weight={700} className="fill-bad">+</Label>
        <Label x={286} y={170} size={13} weight={700} className="fill-m5">−</Label>
        {[70, 110, 150, 190, 230, 260].map((x) => (
          <Arrow key={x} x1={x} y1={42} x2={x} y2={158} className="text-accent/50" width={1.2} head={6} />
        ))}
        <circle cx={100} cy={100} r={7} className="fill-bad" />
        <Arrow x1={100} y1={100} x2={100} y2={135} className="text-good" label="F (+q)" />
        <circle cx={200} cy={100} r={7} className="fill-m5" />
        <Arrow x1={200} y1={100} x2={200} y2={65} className="text-good" label="F (e⁻)" />
        <Label x={12} y={104} size={11}>d</Label>
      </svg>
    ),
  },
  'right-hand-rule': {
    title: 'Right-hand palm rule',
    caption: 'Fingers: B. Thumb: v (positive charge) or conventional current I. Palm: force F. Reverse F for negative charges.',
    render: () => (
      <svg viewBox={VB}>
        <FieldGrid x={20} y={20} w={170} h={160} into step={34} />
        <circle cx={105} cy={100} r={8} className="fill-bad" />
        <Arrow x1={105} y1={100} x2={170} y2={100} className="text-accent" label="v" />
        <Arrow x1={105} y1={100} x2={105} y2={40} className="text-good" label="F" />
        <Label x={22} y={192} size={10} className="fill-muted">B into page ⊗; proton moving right</Label>
        <Arrow x1={215} y1={150} x2={295} y2={150} className="text-m6" label="B (fingers)" labelOffset={[-70, 16]} />
        <Arrow x1={215} y1={150} x2={215} y2={70} className="text-accent" label="v / I (thumb)" />
        <Arrow x1={215} y1={150} x2={255} y2={115} className="text-good" label="F (palm)" />
      </svg>
    ),
  },
  'b-circle': {
    title: 'Charged particle in a uniform magnetic field',
    caption: 'F ⟂ v at every point → uniform circular motion with r = mv/(qB). Opposite charges curve oppositely.',
    render: () => (
      <svg viewBox={VB}>
        <FieldGrid x={0} y={0} w={320} h={200} into step={36} />
        <circle cx={120} cy={100} r={55} fill="none" className="stroke-m7" strokeWidth={2} />
        <circle cx={120} cy={155} r={7} className="fill-bad" />
        <Arrow x1={120} y1={155} x2={165} y2={155} className="text-accent" label="v" />
        <Arrow x1={120} y1={155} x2={120} y2={120} className="text-good" label="F" />
        <circle cx={250} cy={100} r={22} fill="none" className="stroke-m5" strokeWidth={2} strokeDasharray="4 3" />
        <Label x={232} y={140} size={10}>electron: smaller r,</Label>
        <Label x={232} y={152} size={10}>opposite sense</Label>
      </svg>
    ),
  },
  'velocity-selector': {
    title: 'Velocity selector (crossed E and B fields)',
    caption: 'Electric force qE and magnetic force qvB are opposite; only particles with v = E/B pass undeflected.',
    render: () => (
      <svg viewBox={VB}>
        <rect x={60} y={40} width={200} height={8} className="fill-bad" />
        <rect x={60} y={152} width={200} height={8} className="fill-m5" />
        <FieldGrid x={60} y={50} w={200} h={100} into step={30} />
        <line x1={10} y1={100} x2={310} y2={100} className="stroke-m7" strokeWidth={2.5} />
        <circle cx={160} cy={100} r={7} className="fill-bad" />
        <Arrow x1={160} y1={100} x2={160} y2={135} className="text-good" label="qE" />
        <Arrow x1={160} y1={100} x2={160} y2={65} className="text-m6" label="qvB" />
        <Label x={10} y={190} size={10} className="fill-muted">(positive particle, E down, B into page)</Label>
      </svg>
    ),
  },
  'motor-effect': {
    title: 'Motor effect: force on a current-carrying conductor',
    caption: 'F = lIB sin θ, perpendicular to both I and B. Here I ⟂ B, so F is maximum.',
    render: () => (
      <svg viewBox={VB}>
        <rect x={10} y={40} width={34} height={120} rx={4} className="fill-bad" />
        <rect x={276} y={40} width={34} height={120} rx={4} className="fill-m5" />
        <Label x={27} y={105} anchor="middle" size={14} weight={700} className="fill-white">N</Label>
        <Label x={293} y={105} anchor="middle" size={14} weight={700} className="fill-white">S</Label>
        {[60, 90, 120, 150].map((y) => (
          <Arrow key={y} x1={50} y1={y} x2={270} y2={y} className="text-m6/40" width={1} head={6} />
        ))}
        <FieldMark x={160} y={100} into r={14} className="text-m7" />
        <Arrow x1={160} y1={100} x2={160} y2={165} className="text-good" label="F" />
        <Label x={176} y={92} size={10}>I into page, B → : F = lIB down</Label>
      </svg>
    ),
  },
  'parallel-wires': {
    title: 'Forces between parallel currents',
    caption: 'Currents in the same direction attract; opposite directions repel. Forces are equal and opposite.',
    render: () => (
      <svg viewBox={VB}>
        <FieldMark x={110} y={100} into r={12} className="text-m7" />
        <FieldMark x={210} y={100} into r={12} className="text-m7" />
        {[25, 45].map((r) => (
          <g key={r}>
            <circle cx={110} cy={100} r={r} fill="none" className="stroke-m6/40" />
            <circle cx={210} cy={100} r={r} fill="none" className="stroke-m6/40" />
          </g>
        ))}
        <Arrow x1={124} y1={100} x2={160} y2={100} className="text-good" label="F" labelOffset={[-4, -8]} />
        <Arrow x1={196} y1={100} x2={162} y2={100} className="text-good" />
        <Label x={90} y={175} size={11}>same direction → attract</Label>
      </svg>
    ),
  },
  'flux-angle': {
    title: 'Magnetic flux through a tilted loop',
    caption: 'Φ = BA cos θ, with θ between B and the NORMAL to the loop. Tilting the loop reduces the flux.',
    render: () => (
      <svg viewBox={VB}>
        {[40, 70, 100, 130, 160].map((y) => (
          <Arrow key={y} x1={20} y1={y} x2={300} y2={y} className="text-m6/40" width={1} head={6} />
        ))}
        <ellipse cx={160} cy={100} rx={22} ry={70} transform="rotate(30 160 100)" fill="none" className="stroke-m7" strokeWidth={3} />
        <Arrow x1={160} y1={100} x2={220} y2={65} className="text-accent" label="normal" />
        <Arrow x1={160} y1={100} x2={230} y2={100} className="text-m6" label="B" labelOffset={[4, 14]} />
        <Label x={180} y={95} size={11}>θ</Label>
      </svg>
    ),
  },
  'lenz-coil': {
    title: 'Lenz’s law: north pole approaching a coil',
    caption: 'The flux increases, so the induced current makes the near end of the coil a north pole, repelling the magnet.',
    render: () => (
      <svg viewBox={VB}>
        <rect x={20} y={88} width={50} height={24} className="fill-m5" />
        <rect x={70} y={88} width={50} height={24} className="fill-bad" />
        <Label x={45} y={105} anchor="middle" size={11} className="fill-white" weight={700}>S</Label>
        <Label x={95} y={105} anchor="middle" size={11} className="fill-white" weight={700}>N</Label>
        <Arrow x1={60} y1={70} x2={110} y2={70} className="text-accent" label="v" />
        {[170, 185, 200, 215, 230].map((x) => (
          <ellipse key={x} cx={x} cy={100} rx={6} ry={32} fill="none" className="stroke-m7" strokeWidth={2} />
        ))}
        <Label x={152} y={60} size={13} weight={700} className="fill-bad">N</Label>
        <Arrow x1={140} y1={140} x2={120} y2={140} className="text-good" label="repulsion" labelOffset={[-30, 16]} />
        <Label x={176} y={160} size={10} className="fill-muted">induced current</Label>
      </svg>
    ),
  },
  'eddy-brake': {
    title: 'Eddy-current (magnetic) braking',
    caption: 'A conductor moving through a field has looping eddy currents induced; their forces oppose the motion.',
    render: () => (
      <svg viewBox={VB}>
        <rect x={60} y={50} width={200} height={100} rx={6} className="fill-m7" opacity={0.5} />
        <circle cx={160} cy={100} r={36} fill="none" className="stroke-m6" strokeDasharray="4 3" />
        <FieldMark x={160} y={100} into r={10} className="text-m6" />
        <path d="M120,80 a20,20 0 1,1 0,40" fill="none" className="stroke-good" strokeWidth={2} />
        <path d="M200,120 a20,20 0 1,1 0,-40" fill="none" className="stroke-good" strokeWidth={2} />
        <Arrow x1={60} y1={170} x2={130} y2={170} className="text-accent" label="motion" />
        <Arrow x1={260} y1={30} x2={200} y2={30} className="text-bad" label="braking force" labelOffset={[-80, -6]} />
      </svg>
    ),
  },
  transformer: {
    title: 'Transformer',
    caption: 'AC in the primary makes a changing flux in the iron core; the same changing flux induces an emf in the secondary. V_p/V_s = N_p/N_s.',
    render: () => (
      <svg viewBox={VB}>
        <rect x={80} y={30} width={160} height={140} rx={6} fill="none" className="stroke-muted" strokeWidth={18} />
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse key={`p${i}`} cx={80} cy={55 + i * 12} rx={16} ry={4} fill="none" className="stroke-m7" strokeWidth={2} />
        ))}
        {Array.from({ length: 4 }, (_, i) => (
          <ellipse key={`s${i}`} cx={240} cy={75 + i * 14} rx={16} ry={4} fill="none" className="stroke-m6" strokeWidth={2} />
        ))}
        <Label x={20} y={104} size={11}>V_p, N_p</Label>
        <Label x={262} y={104} size={11}>V_s, N_s</Label>
        <Arrow x1={140} y1={30} x2={180} y2={30} className="text-accent" label="Φ" labelOffset={[-10, -8]} />
        <Label x={110} y={195} size={10} className="fill-muted">step-down shown (N_s &lt; N_p)</Label>
      </svg>
    ),
  },
  'laminated-core': {
    title: 'Laminated transformer core',
    caption: 'Thin insulated layers break up eddy-current loops, reducing heating losses.',
    render: () => (
      <svg viewBox={VB}>
        <rect x={30} y={50} width={110} height={100} className="fill-muted" opacity={0.7} />
        <circle cx={85} cy={100} r={30} fill="none" className="stroke-bad" strokeWidth={3} />
        <Label x={30} y={170} size={11}>solid core: large eddy currents</Label>
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={180 + i * 11} y={50} width={8} height={100} className="fill-muted" opacity={0.7} />
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <ellipse key={i} cx={184 + i * 11} cy={100} rx={2.5} ry={30} fill="none" className="stroke-bad" strokeWidth={1} />
        ))}
        <Label x={180} y={170} size={11}>laminated: tiny eddy currents</Label>
      </svg>
    ),
  },
  'power-grid': {
    title: 'Electricity transmission',
    caption: 'Step-up to high voltage → small current → low I²R loss in the lines → step-down for consumers.',
    render: () => (
      <svg viewBox={VB}>
        {[
          [20, 'Generator', '23 kV'],
          [90, 'Step-up', '330 kV'],
          [170, 'Lines', 'low I'],
          [240, 'Step-down', '11 kV → 230 V'],
        ].map(([x, a, b]) => (
          <g key={a as string}>
            <rect x={x as number} y={80} width={60} height={40} rx={6} className="fill-panel2 stroke-line" />
            <Label x={(x as number) + 30} y={98} anchor="middle" size={10} weight={600}>{a}</Label>
            <Label x={(x as number) + 30} y={112} anchor="middle" size={9} className="fill-muted">{b}</Label>
          </g>
        ))}
        <line x1={80} y1={100} x2={90} y2={100} className="stroke-m7" strokeWidth={6} />
        <line x1={150} y1={100} x2={170} y2={100} className="stroke-m7" strokeWidth={1.5} />
        <line x1={230} y1={100} x2={240} y2={100} className="stroke-m7" strokeWidth={1.5} />
        <Label x={20} y={160} size={10} className="fill-muted">line thickness ∝ current</Label>
      </svg>
    ),
  },
  'dc-motor': {
    title: 'DC motor (end view)',
    caption: 'Forces on opposite sides of the coil form a couple (torque). The split-ring commutator reverses the current every half turn so the coil keeps turning the same way.',
    render: () => (
      <svg viewBox={VB}>
        <rect x={10} y={40} width={34} height={120} rx={4} className="fill-bad" />
        <rect x={236} y={40} width={34} height={120} rx={4} className="fill-m5" />
        <Label x={27} y={105} anchor="middle" size={14} weight={700} className="fill-white">N</Label>
        <Label x={253} y={105} anchor="middle" size={14} weight={700} className="fill-white">S</Label>
        {[55, 85, 115, 145].map((y) => (
          <Arrow key={y} x1={50} y1={y} x2={230} y2={y} className="text-m6/30" width={1} head={6} />
        ))}
        <line x1={90} y1={100} x2={190} y2={100} className="stroke-m7" strokeWidth={4} />
        <FieldMark x={90} y={100} into={false} r={10} className="text-ink" />
        <FieldMark x={190} y={100} into r={10} className="text-ink" />
        <Arrow x1={90} y1={100} x2={90} y2={50} className="text-good" label="F" />
        <Arrow x1={190} y1={100} x2={190} y2={150} className="text-good" label="F" />
        <path d="M290,80 a20,20 0 0,0 0,40" fill="none" className="stroke-m7" strokeWidth={6} />
        <path d="M296,80 a20,20 0 0,1 0,40" fill="none" className="stroke-m8" strokeWidth={6} />
        <Label x={250} y={190} size={10} className="fill-muted">split ring</Label>
        <Label x={60} y={190} size={10} className="fill-muted">coil plane ∥ B: maximum torque</Label>
      </svg>
    ),
  },
  'back-emf': {
    title: 'Back emf in a DC motor',
    caption: 'As the motor speeds up, its back emf rises and the current I = (V − ε)/R falls.',
    render: () => (
      <svg viewBox={VB}>
        <path d="M30,170 C80,60 150,40 300,35" fill="none" className="stroke-accent" strokeWidth={2} />
        <path d="M30,30 C70,120 150,150 300,155" fill="none" className="stroke-bad" strokeWidth={2} />
        <line x1={30} y1={180} x2={300} y2={180} className="stroke-muted" />
        <line x1={30} y1={180} x2={30} y2={20} className="stroke-muted" />
        <Label x={220} y={30} size={11} className="fill-accent">back emf (speed)</Label>
        <Label x={220} y={148} size={11} className="fill-bad">current</Label>
        <Label x={260} y={196} size={10} className="fill-muted">time</Label>
      </svg>
    ),
  },
  generator: {
    title: 'AC generator output',
    caption: 'ε = NBAω sin ωt. Maximum emf when the coil plane is parallel to B (flux zero, changing fastest).',
    render: () => {
      const s = Array.from({ length: 101 }, (_, i) => `${i ? 'L' : 'M'}${30 + i * 2.7},${100 - 60 * Math.sin((i / 100) * 4 * Math.PI)}`).join(' ');
      const c = Array.from({ length: 101 }, (_, i) => `${i ? 'L' : 'M'}${30 + i * 2.7},${100 - 40 * Math.cos((i / 100) * 4 * Math.PI)}`).join(' ');
      return (
        <svg viewBox={VB}>
          <line x1={30} y1={100} x2={300} y2={100} className="stroke-muted" />
          <path d={c} fill="none" className="stroke-m6" strokeDasharray="5 3" />
          <path d={s} fill="none" className="stroke-accent" strokeWidth={2} />
          <Label x={240} y={30} size={11} className="fill-accent">emf (slip rings → AC)</Label>
          <Label x={240} y={190} size={11} className="fill-m6">flux</Label>
        </svg>
      );
    },
  },
  'induction-motor': {
    title: 'AC induction motor',
    caption: 'Stator coils produce a rotating magnetic field; it induces currents in the squirrel-cage rotor, which then experiences a torque and follows (with slip).',
    render: () => (
      <svg viewBox={VB}>
        <circle cx={160} cy={100} r={80} fill="none" className="stroke-line" strokeWidth={10} />
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i * Math.PI) / 3;
          return <rect key={i} x={160 + 80 * Math.cos(a) - 10} y={100 + 80 * Math.sin(a) - 10} width={20} height={20} rx={4} className={['fill-m7', 'fill-m6', 'fill-m8'][i % 3]} />;
        })}
        <circle cx={160} cy={100} r={45} fill="none" className="stroke-muted" strokeWidth={3} />
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i * Math.PI) / 5;
          return <circle key={i} cx={160 + 45 * Math.cos(a)} cy={100 + 45 * Math.sin(a)} r={4} className="fill-muted" />;
        })}
        <Arrow x1={160} y1={100} x2={210} y2={60} className="text-accent" label="B rotating" />
      </svg>
    ),
  },
};

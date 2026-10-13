import { Arrow, Label, MiniAxes } from '../svg';
import type { DiagramDef } from './types';

const VB = '0 0 320 200';

export const M5_DIAGRAMS: Record<string, DiagramDef> = {
  'projectile-components': {
    title: 'Resolving projectile velocity into components',
    caption: 'u_x stays constant; u_y decreases by g each second. Time links the two components.',
    render: () => {
      const pts = Array.from({ length: 41 }, (_, i) => {
        const t = (i / 40) * 2.04;
        return `${i ? 'L' : 'M'}${(30 + 17.3 * t * 7).toFixed(1)},${(170 - (10 * t - 4.9 * t * t) * 12).toFixed(1)}`;
      }).join(' ');
      return (
        <svg viewBox={VB}>
          <line x1={20} y1={170} x2={310} y2={170} className="stroke-muted" />
          <path d={pts} fill="none" className="stroke-muted" strokeDasharray="4 4" />
          <Arrow x1={30} y1={170} x2={100} y2={130} className="text-accent" label="u" />
          <Arrow x1={30} y1={170} x2={100} y2={170} className="text-m5" label="uₓ = u cos θ" labelOffset={[4, 14]} />
          <Arrow x1={30} y1={170} x2={30} y2={130} className="text-m7" label="u_y = u sin θ" labelOffset={[-20, -6]} />
          <Label x={48} y={162} size={11}>θ</Label>
          <Arrow x1={153} y1={110} x2={203} y2={110} className="text-m5" label="vₓ" />
          <Label x={150} y={98} size={10} className="fill-muted">top: v_y = 0</Label>
          <Arrow x1={250} y1={150} x2={300} y2={150} className="text-m5" label="vₓ" labelOffset={[2, -6]} />
          <Arrow x1={250} y1={150} x2={250} y2={190} className="text-m7" label="v_y" />
          <Arrow x1={200} y1={60} x2={200} y2={90} className="text-bad" label="g" />
        </svg>
      );
    },
  },
  'projectile-air': {
    title: 'Effect of air resistance on a trajectory',
    caption: 'Drag reduces range and maximum height, and makes the descent steeper than the ascent.',
    render: () => {
      const ideal = Array.from({ length: 41 }, (_, i) => {
        const x = (i / 40) * 260;
        return `${i ? 'L' : 'M'}${30 + x},${170 - (x * (260 - x)) / 520}`;
      }).join(' ');
      return (
        <svg viewBox={VB}>
          <line x1={20} y1={170} x2={310} y2={170} className="stroke-muted" />
          <path d={ideal} fill="none" className="stroke-accent" strokeWidth={2} />
          <path d="M30,170 C90,70 160,70 210,170" fill="none" className="stroke-bad" strokeWidth={2} strokeDasharray="6 3" />
          <Label x={170} y={60} size={11} className="fill-accent">no air resistance (parabola)</Label>
          <Label x={120} y={190} size={11} className="fill-bad">with air resistance</Label>
        </svg>
      );
    },
  },
  'ucm-vectors': {
    title: 'Velocity and acceleration in uniform circular motion',
    caption: 'v is tangential; a_c (and the net force) point towards the centre. |v| is constant but its direction changes.',
    render: () => (
      <svg viewBox={VB}>
        <circle cx={160} cy={100} r={70} fill="none" className="stroke-line" strokeWidth={1.5} />
        <circle cx={160} cy={100} r={3} className="fill-muted" />
        {[0, 120, 240].map((d) => {
          const a = (d * Math.PI) / 180;
          const x = 160 + 70 * Math.cos(a);
          const y = 100 - 70 * Math.sin(a);
          return (
            <g key={d}>
              <circle cx={x} cy={y} r={6} className="fill-m5" />
              <Arrow x1={x} y1={y} x2={x - 40 * Math.sin(a)} y2={y - 40 * Math.cos(a)} className="text-accent" label="v" />
              <Arrow x1={x} y1={y} x2={x - 30 * Math.cos(a)} y2={y + 30 * Math.sin(a)} className="text-bad" label="a_c" labelOffset={[-8, 14]} />
            </g>
          );
        })}
      </svg>
    ),
  },
  'fbd-string': {
    title: 'Free-body diagram: mass on a string (conical pendulum)',
    caption: 'Only two real forces act: tension T and weight mg. Their resultant (horizontal) is the centripetal force.',
    render: () => (
      <svg viewBox={VB}>
        <line x1={100} y1={20} x2={220} y2={20} className="stroke-ink" strokeWidth={3} />
        <line x1={160} y1={20} x2={230} y2={130} className="stroke-ink" />
        <line x1={160} y1={20} x2={160} y2={130} className="stroke-line" strokeDasharray="3 3" />
        <ellipse cx={160} cy={130} rx={70} ry={14} fill="none" className="stroke-line" strokeDasharray="4 4" />
        <circle cx={230} cy={130} r={9} className="fill-m5" />
        <Arrow x1={230} y1={130} x2={194} y2={74} className="text-m6" label="T" />
        <Arrow x1={230} y1={130} x2={230} y2={185} className="text-m7" label="mg" />
        <Arrow x1={230} y1={130} x2={190} y2={130} className="text-bad" label="F_net" dashed labelOffset={[-40, -6]} />
        <Label x={166} y={50} size={11}>θ</Label>
      </svg>
    ),
  },
  'banked-track': {
    title: 'Car on a banked track (at the design speed)',
    caption: 'Resolve N: N cos θ balances mg; N sin θ provides the centripetal force. tan θ = v²/(rg).',
    render: () => (
      <svg viewBox={VB}>
        <polygon points="20,180 300,80 300,190 20,190" className="fill-line" opacity={0.6} />
        <g transform="rotate(-19.65 160 130)">
          <rect x={130} y={112} width={60} height={22} rx={5} className="fill-m5" />
        </g>
        <Arrow x1={160} y1={124} x2={135} y2={54} className="text-m6" label="N" />
        <Arrow x1={160} y1={124} x2={160} y2={184} className="text-m7" label="mg" />
        <Arrow x1={160} y1={124} x2={135} y2={124} className="text-bad" label="N sin θ" dashed labelOffset={[-60, -4]} />
        <Arrow x1={160} y1={124} x2={160} y2={54} className="text-m6" dashed label="N cos θ" labelOffset={[4, 10]} />
        <Label x={40} y={172} size={11}>θ</Label>
        <Label x={20} y={20} size={11} className="fill-muted">← centre of the bend</Label>
      </svg>
    ),
  },
  'torque-spanner': {
    title: 'Torque on a spanner',
    caption: 'τ = rF sin θ = r⊥F. Only the perpendicular component of F (or the perpendicular distance) matters.',
    render: () => (
      <svg viewBox={VB}>
        <circle cx={50} cy={120} r={14} className="fill-line" />
        <line x1={50} y1={120} x2={260} y2={120} className="stroke-m5" strokeWidth={12} strokeLinecap="round" />
        <Arrow x1={230} y1={120} x2={270} y2={50} className="text-bad" label="F" />
        <Arrow x1={230} y1={120} x2={230} y2={50} className="text-accent" label="F⊥ = F sin θ" dashed labelOffset={[-90, -4]} />
        <line x1={50} y1={120} x2={230} y2={120} className="stroke-m7" strokeDasharray="4 3" />
        <Label x={130} y={146} size={11} className="fill-m7">r</Label>
        <Label x={240} y={110} size={11}>θ</Label>
        <Label x={30} y={155} size={11} className="fill-muted">pivot</Label>
      </svg>
    ),
  },
  'inverse-square': {
    title: 'Inverse-square law',
    caption: 'The same field lines spread over 4× the area at twice the distance, so F and g fall to ¼.',
    render: () => (
      <svg viewBox={VB}>
        <circle cx={40} cy={100} r={14} className="fill-m5" />
        {[-1, 0, 1].map((k) => (
          <line key={k} x1={54} y1={100} x2={300} y2={100 + k * 75} className="stroke-accent" opacity={0.5} />
        ))}
        <rect x={120} y={75} width={6} height={50} className="fill-m7" />
        <rect x={210} y={50} width={6} height={100} className="fill-m7" />
        <Label x={110} y={145} size={11}>r: area A</Label>
        <Label x={200} y={170} size={11}>2r: area 4A</Label>
        <Label x={20} y={30} size={12} weight={600}>F ∝ 1/r²</Label>
      </svg>
    ),
  },
  'radial-field': {
    title: 'Radial gravitational field',
    caption: 'Field lines point to the centre; their spacing increases with distance, showing g weakening as 1/r².',
    render: () => (
      <svg viewBox={VB}>
        <circle cx={160} cy={100} r={30} className="fill-m5" opacity={0.85} />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * Math.PI) / 6;
          return <Arrow key={i} x1={160 + 95 * Math.cos(a)} y1={100 + 95 * Math.sin(a)} x2={160 + 36 * Math.cos(a)} y2={100 + 36 * Math.sin(a)} className="text-accent" width={1.4} head={6} />;
        })}
        <Label x={160} y={104} anchor="middle" size={11} className="fill-white" weight={700}>M</Label>
        <Label x={10} y={190} size={11} className="fill-muted">r = R + altitude (measured from the centre)</Label>
      </svg>
    ),
  },
  'newton-cannon': {
    title: 'Newton’s cannon: orbit as continuous free fall',
    caption: 'Faster horizontal launches land further away; fast enough, the projectile falls around the Earth — an orbit.',
    render: () => (
      <svg viewBox={VB}>
        <circle cx={160} cy={110} r={70} className="fill-m5" opacity={0.7} />
        <rect x={155} y={30} width={10} height={12} className="fill-ink" />
        <path d="M165,38 Q200,40 205,70" fill="none" className="stroke-m7" />
        <path d="M165,38 Q240,40 228,110" fill="none" className="stroke-m7" />
        <circle cx={160} cy={110} r={80} fill="none" className="stroke-accent" strokeDasharray="5 4" />
        <Arrow x1={165} y1={30} x2={210} y2={30} className="text-accent" label="v" />
        <Label x={250} y={180} size={11} className="fill-accent">circular orbit</Label>
      </svg>
    ),
  },
  'kepler-ellipse': {
    title: 'Kepler’s first and second laws',
    caption: 'Ellipse with the Sun at one focus. Equal areas are swept in equal times, so the planet moves fastest at perihelion.',
    render: () => (
      <svg viewBox={VB}>
        <ellipse cx={160} cy={100} rx={130} ry={75} fill="none" className="stroke-line" strokeWidth={1.5} />
        <circle cx={160 - 70} cy={100} r={9} className="fill-m7" />
        <path d={`M90,100 L30,100 A130,75 0 0,1 40,68 Z`} className="fill-m7" opacity={0.3} />
        <path d={`M90,100 L250,46 A130,75 0 0,1 285,85 Z`} className="fill-m7" opacity={0.3} />
        <Label x={30} y={130} size={10}>perihelion (fast)</Label>
        <Label x={230} y={30} size={10}>aphelion (slow)</Label>
        <Label x={90} y={125} anchor="middle" size={10}>Sun at focus</Label>
      </svg>
    ),
  },
  'potential-well': {
    title: 'Gravitational potential energy well',
    caption: 'U = −GMm/r rises towards zero at infinity. A bound orbit has E < 0; escape needs E ≥ 0.',
    render: () => {
      const pts = Array.from({ length: 60 }, (_, i) => {
        const r = 1 + i * 0.15;
        return `${i ? 'L' : 'M'}${(40 + (r - 1) * 28).toFixed(1)},${(40 + 130 / r).toFixed(1)}`;
      }).join(' ');
      return (
        <svg viewBox={VB}>
          <MiniAxes x={40} y={20} w={270} h={20} xLabel="r" yLabel="U = 0" />
          <path d={pts} fill="none" className="stroke-m6" strokeWidth={2} />
          <line x1={40} y1={120} x2={140} y2={120} className="stroke-accent" strokeDasharray="5 3" />
          <Label x={145} y={124} size={10} className="fill-accent">{'E < 0: bound (turning point)'}</Label>
          <Label x={60} y={185} size={10} className="fill-muted">surface</Label>
        </svg>
      );
    },
  },
};

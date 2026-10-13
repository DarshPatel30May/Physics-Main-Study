import type { DiagramDef } from './types';
import { M5_DIAGRAMS } from './m5';
import { M6_DIAGRAMS } from './m6';
import { M7_DIAGRAMS } from './m7';
import { M8_DIAGRAMS } from './m8';
import { Arrow, Label } from '../svg';

const EXTRA: Record<string, DiagramDef> = {
  'fbd-car-bend': {
    title: 'Car on a flat bend',
    caption: 'Weight and normal force balance vertically; static friction provides the net inward (centripetal) force.',
    render: () => (
      <svg viewBox="0 0 320 200">
        <line x1={20} y1={150} x2={300} y2={150} className="stroke-muted" strokeWidth={2} />
        <rect x={120} y={110} width={80} height={36} rx={6} className="fill-m5" opacity={0.85} />
        <Arrow x1={160} y1={128} x2={160} y2={60} className="text-m6" label="N" />
        <Arrow x1={160} y1={128} x2={160} y2={190} className="text-m7" label="mg" />
        <Arrow x1={160} y1={146} x2={70} y2={146} className="text-good" label="f (friction)" labelOffset={[-40, -8]} />
        <Label x={20} y={30} size={11} className="fill-muted">← centre of the bend (rear view)</Label>
      </svg>
    ),
  },
};

export const DIAGRAMS: Record<string, DiagramDef> = { ...M5_DIAGRAMS, ...M6_DIAGRAMS, ...M7_DIAGRAMS, ...M8_DIAGRAMS, ...EXTRA };

export function Diagram({ id, showCaption = true, className = '' }: { id: string; showCaption?: boolean; className?: string }) {
  const d = DIAGRAMS[id];
  if (!d) return null;
  return (
    <figure className={`rounded-xl border border-line bg-bg/40 p-2 ${className}`} role="group" aria-label={d.title}>
      <div className="[&>svg]:h-auto [&>svg]:w-full" role="img" aria-label={d.title}>
        {d.render()}
      </div>
      {showCaption && (
        <figcaption className="mt-1 px-1 text-xs text-muted">
          <span className="font-semibold text-ink">{d.title}.</span> {d.caption}
        </figcaption>
      )}
    </figure>
  );
}

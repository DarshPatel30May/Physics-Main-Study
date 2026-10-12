import { useId, type ReactNode } from 'react';

/** Arrow from (x1,y1) to (x2,y2). Colour via CSS class (e.g. "stroke-m5 fill-m5" applied to group). */
export function Arrow({
  x1, y1, x2, y2, className = 'text-ink', width = 2, head = 8, label, labelOffset = [6, -6], dashed, title,
}: {
  x1: number; y1: number; x2: number; y2: number; className?: string; width?: number; head?: number;
  label?: ReactNode; labelOffset?: [number, number]; dashed?: boolean; title?: string;
}) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 0.5) return null;
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  const h = Math.min(head, len * 0.6);
  const bx = x2 - ux * h;
  const by = y2 - uy * h;
  const px = -uy * h * 0.45;
  const py = ux * h * 0.45;
  return (
    <g className={className}>
      {title && <title>{title}</title>}
      <line x1={x1} y1={y1} x2={bx} y2={by} stroke="currentColor" strokeWidth={width} strokeDasharray={dashed ? '5 4' : undefined} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${bx + px},${by + py} ${bx - px},${by - py}`} fill="currentColor" />
      {label && (
        <text x={x2 + labelOffset[0]} y={y2 + labelOffset[1]} fill="currentColor" fontSize={12} fontWeight={600} fontFamily="IBM Plex Sans, sans-serif">
          {label}
        </text>
      )}
    </g>
  );
}

export function Label({ x, y, children, className = 'fill-ink', size = 12, anchor = 'start', weight = 500, italic }: { x: number; y: number; children: ReactNode; className?: string; size?: number; anchor?: 'start' | 'middle' | 'end'; weight?: number; italic?: boolean }) {
  return (
    <text x={x} y={y} className={className} fontSize={size} textAnchor={anchor} fontWeight={weight} fontStyle={italic ? 'italic' : undefined} fontFamily="IBM Plex Sans, sans-serif">
      {children}
    </text>
  );
}

/** "Into the page" (⊗) and "out of page" (⊙) markers. */
export function FieldMark({ x, y, into, r = 6, className = 'text-m6' }: { x: number; y: number; into: boolean; r?: number; className?: string }) {
  return (
    <g className={className}>
      <circle cx={x} cy={y} r={r} fill="none" stroke="currentColor" strokeWidth={1.2} />
      {into ? (
        <>
          <line x1={x - r * 0.6} y1={y - r * 0.6} x2={x + r * 0.6} y2={y + r * 0.6} stroke="currentColor" strokeWidth={1.2} />
          <line x1={x - r * 0.6} y1={y + r * 0.6} x2={x + r * 0.6} y2={y - r * 0.6} stroke="currentColor" strokeWidth={1.2} />
        </>
      ) : (
        <circle cx={x} cy={y} r={r * 0.25} fill="currentColor" />
      )}
    </g>
  );
}

export function FieldGrid({ x, y, w, h, into, step = 32, className }: { x: number; y: number; w: number; h: number; into: boolean; step?: number; className?: string }) {
  const marks: ReactNode[] = [];
  for (let i = x + step / 2; i < x + w; i += step) for (let j = y + step / 2; j < y + h; j += step) marks.push(<FieldMark key={`${i}-${j}`} x={i} y={j} into={into} r={5} className={className} />);
  return <g opacity={0.55}>{marks}</g>;
}

/** Responsive SVG wrapper with a figure caption for accessibility. */
export function Figure({ w, h, children, title, caption, className = '' }: { w: number; h: number; children: ReactNode; title: string; caption?: ReactNode; className?: string }) {
  const id = useId();
  return (
    <figure className={className}>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-labelledby={id}>
        <title id={id}>{title}</title>
        {children}
      </svg>
      {caption && <figcaption className="mt-1 text-center text-xs text-muted">{caption}</figcaption>}
    </figure>
  );
}

/** Simple axes for schematic graphs inside diagrams. */
export function MiniAxes({ x, y, w, h, xLabel, yLabel }: { x: number; y: number; w: number; h: number; xLabel: string; yLabel: string }) {
  return (
    <g>
      <Arrow x1={x} y1={y + h} x2={x + w} y2={y + h} className="text-muted" width={1.5} head={7} />
      <Arrow x1={x} y1={y + h} x2={x} y2={y} className="text-muted" width={1.5} head={7} />
      <Label x={x + w} y={y + h + 16} anchor="end" className="fill-muted" size={11}>
        {xLabel}
      </Label>
      <Label x={x - 6} y={y - 4} className="fill-muted" size={11}>
        {yLabel}
      </Label>
    </g>
  );
}

export function Glow({ id }: { id: string }) {
  return (
    <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  );
}

import { memo, useId, useMemo, useState, type ReactNode } from 'react';
import katex from 'katex';
import { Bookmark as BookmarkIcon, BookmarkCheck, ChevronDown, Info, AlertTriangle, Lightbulb, FlaskConical } from 'lucide-react';
import { useStore, type Bookmark } from '@/lib/store';
import { sig } from '@/lib/physics/stats';

/* ------------------------------ Maths ------------------------------ */
export const Tex = memo(function Tex({ children, block = false, className = '' }: { children: string; block?: boolean; className?: string }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(children, { throwOnError: false, displayMode: block, strict: 'ignore' });
    } catch {
      return children;
    }
  }, [children, block]);
  return block ? (
    <div className={`overflow-x-auto ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
  );
});

/** Renders text containing inline $…$ LaTeX segments. */
export function RichText({ text, className = '' }: { text: string; className?: string }) {
  const parts = text.split(/(\$[^$]+\$)/g);
  return (
    <span className={className}>
      {parts.map((p, i) => (p.startsWith('$') && p.endsWith('$') ? <Tex key={i}>{p.slice(1, -1)}</Tex> : <span key={i}>{p}</span>))}
    </span>
  );
}

/* ------------------------------ Layout ------------------------------ */
export function Card({ children, className = '', as: As = 'div', ...rest }: { children: ReactNode; className?: string; as?: 'div' | 'section' | 'article'; id?: string }) {
  return (
    <As className={`card p-4 sm:p-5 ${className}`} {...rest}>
      {children}
    </As>
  );
}

export function SectionTitle({ kicker, title, children, id }: { kicker?: string; title: string; children?: ReactNode; id?: string }) {
  return (
    <div className="mb-4 scroll-mt-24" id={id}>
      {kicker && <div className="label mb-1">{kicker}</div>}
      <h2 className="text-2xl font-semibold sm:text-[1.7rem]">{title}</h2>
      {children && <div className="mt-1 max-w-3xl text-muted">{children}</div>}
    </div>
  );
}

const MOD_TEXT: Record<number, string> = { 5: 'text-m5', 6: 'text-m6', 7: 'text-m7', 8: 'text-m8' };
const MOD_BG: Record<number, string> = { 5: 'bg-m5/10 border-m5/40', 6: 'bg-m6/10 border-m6/40', 7: 'bg-m7/10 border-m7/40', 8: 'bg-m8/10 border-m8/40' };
export const modText = (m: number) => MOD_TEXT[m] ?? 'text-accent';
export const modVar = (m: number) => `--m${m}`;

export function ModuleBadge({ m, children }: { m: number; children?: ReactNode }) {
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${MOD_BG[m]} ${MOD_TEXT[m]}`}>{children ?? `Module ${m}`}</span>;
}

export function Chip({ children, tone = 'default', title }: { children: ReactNode; tone?: 'default' | 'good' | 'warn' | 'accent' | 'bad'; title?: string }) {
  const tones = {
    default: '',
    good: 'border-good/40 text-good bg-good/10',
    warn: 'border-warn/40 text-warn bg-warn/10',
    bad: 'border-bad/40 text-bad bg-bad/10',
    accent: 'border-accent/40 text-accent bg-accent/10',
  };
  return (
    <span className={`chip ${tones[tone]}`} title={title}>
      {children}
    </span>
  );
}

export function Callout({ kind = 'info', title, children }: { kind?: 'info' | 'warn' | 'tip' | 'model'; title?: string; children: ReactNode }) {
  const map = {
    info: { Icon: Info, cls: 'border-accent/40 bg-accent/5', ic: 'text-accent' },
    warn: { Icon: AlertTriangle, cls: 'border-warn/50 bg-warn/5', ic: 'text-warn' },
    tip: { Icon: Lightbulb, cls: 'border-good/40 bg-good/5', ic: 'text-good' },
    model: { Icon: FlaskConical, cls: 'border-m6/40 bg-m6/5', ic: 'text-m6' },
  }[kind];
  return (
    <div className={`flex gap-3 rounded-xl border p-3 text-sm ${map.cls}`}>
      <map.Icon className={`mt-0.5 h-4 w-4 shrink-0 ${map.ic}`} aria-hidden />
      <div className="min-w-0">
        {title && <div className="mb-0.5 font-semibold">{title}</div>}
        <div className="text-ink/90">{children}</div>
      </div>
    </div>
  );
}

export function Disclosure({ title, children, defaultOpen = false, icon }: { title: ReactNode; children: ReactNode; defaultOpen?: boolean; icon?: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className="rounded-xl border border-line">
      <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        {icon}
        <span className="flex-1">{title}</span>
        <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open && (
        <div id={id} className="border-t border-line px-3 py-3 text-sm">
          {children}
        </div>
      )}
    </div>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange, size = 'md' }: { tabs: { id: T; label: ReactNode }[]; value: T; onChange: (v: T) => void; size?: 'sm' | 'md' }) {
  return (
    <div role="tablist" className="flex flex-wrap gap-1 rounded-xl border border-line bg-panel2/60 p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={`rounded-lg px-3 ${size === 'sm' ? 'py-1 text-xs' : 'py-1.5 text-sm'} font-medium transition ${value === t.id ? 'bg-panel text-ink shadow-sm ring-1 ring-line' : 'text-muted hover:text-ink'}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------ Controls ------------------------------ */
export function Slider({
  label, value, min, max, step = 1, unit, onChange, format, tex, hint, colourVar,
}: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (v: number) => void;
  format?: (v: number) => string; tex?: string; hint?: string; colourVar?: string;
}) {
  const id = useId();
  const shown = format ? format(value) : Number.isInteger(step) ? String(value) : value.toFixed(Math.max(0, -Math.floor(Math.log10(step))));
  return (
    <div className="space-y-0.5">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <label htmlFor={id} className="font-medium">
          {tex ? <Tex>{tex}</Tex> : null} {label}
        </label>
        <span className="num text-xs text-muted">
          {shown}
          {unit ? ` ${unit}` : ''}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={colourVar ? ({ ['--slider' as string]: `var(${colourVar})` } as React.CSSProperties) : undefined}
        aria-valuetext={`${shown}${unit ? ' ' + unit : ''}`}
      />
      {hint && <div className="text-[11px] text-muted">{hint}</div>}
    </div>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer select-none items-center gap-2 text-sm">
      <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${checked ? 'bg-accent' : 'bg-line'}`}>
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </span>
      {label}
    </label>
  );
}

export function Select<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <select id={id} className="input font-sans" value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function NumberField({ label, value, onChange, unit, tex, invalid }: { label: string; value: string; onChange: (v: string) => void; unit?: string; tex?: string; invalid?: boolean }) {
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="flex items-baseline gap-1 text-sm font-medium">
        {tex && <Tex>{tex}</Tex>} <span className="text-muted">{label}</span>
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          inputMode="decimal"
          className={`input ${invalid ? 'border-bad' : ''}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={invalid}
          placeholder="e.g. 3.2e-19"
        />
        {unit && <span className="num shrink-0 text-xs text-muted">{unit}</span>}
      </div>
    </div>
  );
}

/** Parse a user-entered number: accepts 3.2e-19, 3.2×10^-19, 3.2 x 10^-19, commas, unicode minus. */
export function parseNum(s: string): number {
  const t = s
    .trim()
    .replace(/,/g, '')
    .replace(/−/g, '-')
    .replace(/\s*[x×*]\s*10\s*\^\s*\(?\s*([+-]?\d+)\s*\)?/i, 'e$1')
    .replace(/\s+/g, '');
  if (t === '') return NaN;
  return Number(t);
}

/* ------------------------------ Readouts ------------------------------ */
export function Stat({ label, value, unit, tex, tone, n = 3 }: { label: string; value: number | string; unit?: string; tex?: string; tone?: string; n?: number }) {
  return (
    <div className="rounded-xl border border-line bg-panel2/50 px-3 py-2">
      <div className="text-[11px] font-medium text-muted">
        {tex && <Tex>{tex}</Tex>} {label}
      </div>
      <div className={`num text-base font-semibold ${tone ?? ''}`}>
        {typeof value === 'number' ? sig(value, n) : value}
        {unit && <span className="ml-1 text-xs font-normal text-muted">{unit}</span>}
      </div>
    </div>
  );
}

export function BookmarkButton({ bm, className = '' }: { bm: Bookmark; className?: string }) {
  const { isBookmarked, toggleBookmark } = useStore();
  const on = isBookmarked(bm.id);
  return (
    <button
      className={`btn !px-2 ${on ? '!border-accent/60 text-accent' : ''} ${className}`}
      onClick={() => toggleBookmark(bm)}
      aria-pressed={on}
      title={on ? 'Remove bookmark' : 'Bookmark'}
    >
      {on ? <BookmarkCheck className="h-4 w-4" /> : <BookmarkIcon className="h-4 w-4" />}
      <span className="sr-only">{on ? 'Remove bookmark' : 'Add bookmark'}</span>
    </button>
  );
}

/** Shows the right text for the current learning mode. */
export function useModeText() {
  const { prefs } = useStore();
  return prefs.mode;
}

import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Pause, Play, RotateCcw, Gauge, HelpCircle, ListChecks, AlertTriangle, Sigma, BookOpen } from 'lucide-react';
import { simById } from '@/content/sims';
import { BookmarkButton, Card, ModuleBadge, Tex, Chip } from './ui';
import { useStore } from '@/lib/store';

export interface Prediction {
  q: string;
  options: string[];
  answer: number;
  explain: string;
}

export function PredictionPrompt({ p }: { p: Prediction }) {
  const [choice, setChoice] = useState<number | null>(null);
  return (
    <div className="rounded-xl border border-m7/40 bg-m7/5 p-3 text-sm">
      <div className="mb-2 flex items-center gap-2 font-semibold">
        <HelpCircle className="h-4 w-4 text-m7" aria-hidden /> Predict first
      </div>
      <p className="mb-2">{p.q}</p>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {p.options.map((o, i) => (
          <button
            key={i}
            onClick={() => setChoice(i)}
            className={`rounded-lg border px-2.5 py-1.5 text-left transition ${
              choice === null ? 'border-line hover:border-m7/60' : i === p.answer ? 'border-good bg-good/10' : choice === i ? 'border-bad bg-bad/10' : 'border-line opacity-60'
            }`}
          >
            {o}
          </button>
        ))}
      </div>
      {choice !== null && (
        <p className="mt-2 text-sm">
          <span className={choice === p.answer ? 'font-semibold text-good' : 'font-semibold text-bad'}>{choice === p.answer ? 'Correct. ' : 'Not quite. '}</span>
          {p.explain} <span className="text-muted">Now test it with the simulation.</span>
        </p>
      )}
    </div>
  );
}

export function Playback({ playing, setPlaying, speed, setSpeed, onReset, extra }: { playing: boolean; setPlaying: (v: boolean) => void; speed?: number; setSpeed?: (v: number) => void; onReset?: () => void; extra?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button className="btn-primary" onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause' : 'Play'}>
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        {playing ? 'Pause' : 'Play'}
      </button>
      {onReset && (
        <button className="btn" onClick={onReset}>
          <RotateCcw className="h-4 w-4" /> Restart
        </button>
      )}
      {setSpeed && speed !== undefined && (
        <div className="flex items-center gap-1 rounded-lg border border-line p-0.5" role="group" aria-label="Playback speed">
          <Gauge className="ml-1 h-4 w-4 text-muted" aria-hidden />
          {[0.1, 0.25, 0.5, 1, 2].map((s) => (
            <button key={s} onClick={() => setSpeed(s)} className={`rounded-md px-1.5 py-0.5 text-xs ${speed === s ? 'bg-accent text-white dark:text-slate-950' : 'text-muted hover:text-ink'}`} aria-pressed={speed === s}>
              {s}×
            </button>
          ))}
        </div>
      )}
      {extra}
    </div>
  );
}

export interface SimShellProps {
  id: string;
  /** main visual */
  children: ReactNode;
  controls: ReactNode;
  readouts?: ReactNode;
  graphs?: ReactNode;
  formulas?: string[];
  explanation: ReactNode;
  prediction?: Prediction;
  assumptions: string[];
  limitations: string[];
  onReset: () => void;
  toolbar?: ReactNode;
  /** compact = embedded inside a module page */
  compact?: boolean;
  below?: ReactNode;
}

export function SimShell({ id, children, controls, readouts, graphs, formulas = [], explanation, prediction, assumptions, limitations, onReset, toolbar, compact, below }: SimShellProps) {
  const meta = simById(id);
  const { prefs } = useStore();
  const visual = prefs.mode === 'visual';
  return (
    <Card className="!p-0 overflow-hidden" as="section">
      <header className="flex flex-wrap items-center gap-2 border-b border-line bg-panel2/40 px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {meta && <ModuleBadge m={meta.module} />}
            {meta && (
              <Chip tone={meta.model === 'quantitative' ? 'accent' : 'warn'} title={meta.model === 'quantitative' ? 'Outputs computed from the stated physical equations' : 'Simplified educational visualisation — qualitative, not to scale'}>
                {meta.model === 'quantitative' ? 'Quantitative model' : 'Conceptual model'}
              </Chip>
            )}
          </div>
          <h3 className="mt-1 text-lg font-semibold">
            {compact && meta ? (
              <Link to={`/lab/${id}`} className="hover:text-accent">
                {meta.title}
              </Link>
            ) : (
              meta?.title
            )}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {toolbar}
          <button className="btn" onClick={onReset} title="Reset all parameters">
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
          {meta && <BookmarkButton bm={{ id: `sim:${id}`, kind: 'sim', title: meta.title, href: `/lab/${id}` }} />}
        </div>
      </header>

      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-3">
          <div className="overflow-hidden rounded-xl border border-line bg-bg/60">{children}</div>
          {readouts && <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">{readouts}</div>}
        </div>
        <aside className="space-y-4" aria-label="Simulation controls">
          {controls}
        </aside>
      </div>

      {graphs && <div className="grid gap-4 border-t border-line p-4 md:grid-cols-2 xl:grid-cols-3">{graphs}</div>}
      {below && <div className="border-t border-line p-4">{below}</div>}

      <div className="grid gap-4 border-t border-line p-4 md:grid-cols-2">
        <div className="space-y-3">
          {formulas.length > 0 && (
            <div>
              <div className="label mb-1 flex items-center gap-1">
                <Sigma className="h-3.5 w-3.5" /> Relevant relationships
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-1">
                {formulas.map((f) => (
                  <Tex key={f} block>
                    {f}
                  </Tex>
                ))}
              </div>
            </div>
          )}
          {!visual && (
            <div className="prose-block text-sm">
              <div className="label mb-1 flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" /> What is happening
              </div>
              <div className="space-y-2 text-ink/90">{explanation}</div>
            </div>
          )}
          {prediction && <PredictionPrompt p={prediction} />}
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <div className="label mb-1 flex items-center gap-1">
              <ListChecks className="h-3.5 w-3.5" /> Assumptions
            </div>
            <ul className="list-disc space-y-0.5 pl-5 text-ink/90">
              {assumptions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="label mb-1 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" /> Limitations
            </div>
            <ul className="list-disc space-y-0.5 pl-5 text-ink/90">
              {limitations.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function GraphCard({ title, children, note }: { title: string; children: ReactNode; note?: ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="mb-1 text-sm font-semibold">{title}</div>
      {children}
      {note && <div className="mt-1 text-xs text-muted">{note}</div>}
    </div>
  );
}

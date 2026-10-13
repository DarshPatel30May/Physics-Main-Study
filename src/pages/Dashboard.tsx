import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Calculator, ChartLine, FlaskConical, GraduationCap, Microscope, Repeat, Target, History, Ruler, ListTree } from 'lucide-react';
import { MODULES, ALL_DOT_POINTS } from '@/content/syllabus';
import { MODULE_CONTENT } from '@/content/modules';
import { SIMS } from '@/content/sims';
import { FORMULAS } from '@/content/formulas';
import { QUESTIONS } from '@/content/questions';
import { FLASHCARDS } from '@/content/flashcards';
import { useStore } from '@/lib/store';
import { MOD_BG, MOD_BORDER, ProgressBar, accuracy, moduleProgress } from './shared';
import { ModuleBadge } from '@/components/ui';
import { MODES } from '@/components/Layout';

const ICON = { 5: '🪐', 6: '🧲', 7: '💡', 8: '⚛️' } as const;

const TOOLS = [
  { to: '/lab', label: 'Physics Lab', desc: `${SIMS.length} interactive simulations`, icon: FlaskConical },
  { to: '/formulas', label: 'Formula Centre', desc: `${FORMULAS.length} formulas with calculators`, icon: BookOpen },
  { to: '/solver', label: 'Problem Solver', desc: 'Step-by-step tutor with mistake diagnosis', icon: Target },
  { to: '/graphs', label: 'Graph Lab', desc: 'Interpret gradients, areas and shapes', icon: ChartLine },
  { to: '/rearrange', label: 'Rearrange', desc: 'Validated rearrangements of every formula', icon: Calculator },
  { to: '/units', label: 'Units Lab', desc: 'Conversions and dimensional analysis', icon: Ruler },
  { to: '/working-scientifically', label: 'Working Scientifically', desc: 'Investigations and data analysis', icon: Microscope },
  { to: '/timeline', label: 'Discoveries', desc: 'How evidence changed our models', icon: History },
  { to: '/exam', label: 'HSC Exam Centre', desc: 'Adaptive practice and mock exams', icon: GraduationCap },
  { to: '/flashcards', label: 'Flashcards', desc: `${FLASHCARDS.length} spaced-repetition cards`, icon: Repeat },
  { to: '/syllabus', label: 'Syllabus Explorer', desc: 'Coverage matrix for every dot point', icon: ListTree },
];

export default function Dashboard() {
  const { progress, attempts, cards, prefs, setPrefs, bookmarks } = useStore();
  const totalDone = ALL_DOT_POINTS.filter((d) => progress[`dp:${d.id}`]).length;
  const acc = accuracy(attempts);
  const now = Date.now();
  const due = FLASHCARDS.filter((c) => (cards[c.id]?.due ?? 0) <= now).length;

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-line bg-panel p-6 sm:p-10">
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/3 h-60 w-60 rounded-full bg-m6/20 blur-3xl" />
        <div className="relative max-w-3xl">
          <div className="label mb-2">NSW HSC Physics · 2026 · Stage 6 Syllabus (2017)</div>
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            See the physics. <span className="text-accent">Then explain it.</span>
          </h1>
          <p className="prose-block mt-3 max-w-2xl text-lg text-muted">
            Interactive lessons, simulations and exam practice for Modules 5–8 — Advanced Mechanics, Electromagnetism, The Nature of Light and From the Universe to the Atom.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link to="/module/m5" className="btn btn-primary">
              Start with Module 5 <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/exam" className="btn">
              Practise HSC questions
            </Link>
          </div>
        </div>
        <dl className="relative mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['Dot points ticked', `${totalDone} / ${ALL_DOT_POINTS.length}`],
            ['Questions attempted', String(attempts.length)],
            ['Accuracy', acc === null ? '—' : `${acc}%`],
            ['Flashcards due', String(due)],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-line bg-panel2/60 px-4 py-3">
              <dt className="text-xs text-muted">{k}</dt>
              <dd className="num mt-0.5 text-xl font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="modules-h">
        <h2 id="modules-h" className="mb-4 text-2xl font-semibold">
          Modules
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {MODULES.map((m) => {
            const p = moduleProgress(progress, m.no);
            const c = MODULE_CONTENT[m.no];
            const sims = SIMS.filter((s) => s.module === m.no).length;
            const qs = QUESTIONS.filter((q) => q.module === m.no).length;
            return (
              <Link key={m.id} to={`/module/${m.id}`} className={`card group relative overflow-hidden border-l-4 p-5 transition hover:-translate-y-0.5 ${MOD_BORDER[m.no]}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <ModuleBadge m={m.no} />
                    <h3 className="mt-2 font-display text-2xl font-semibold">{m.title}</h3>
                    <p className="text-sm text-muted">{m.short}</p>
                  </div>
                  <span className="text-3xl" aria-hidden>
                    {ICON[m.no]}
                  </span>
                </div>
                <p className="prose-block mt-3 text-sm">{m.summary}</p>
                <div className="mt-4 flex items-center gap-3">
                  <ProgressBar pct={p.pct} colour={MOD_BG[m.no]} label={`Module ${m.no} progress`} />
                  <span className="num shrink-0 text-xs text-muted">{p.pct}%</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                  <span>{c.concepts.length} lessons</span>
                  <span>{sims} simulations</span>
                  <span>{qs} questions</span>
                  <span>{c.experiments.length} experiments</span>
                </div>
                <ArrowRight className="absolute bottom-5 right-5 h-5 w-5 text-muted transition group-hover:translate-x-1 group-hover:text-ink" aria-hidden />
              </Link>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="mode-h" className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="card p-5">
          <h2 id="mode-h" className="text-lg font-semibold">
            Learning mode
          </h2>
          <p className="text-sm text-muted">Switch at any time — your progress, bookmarks and settings are kept.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-4">
            {MODES.map((m) => (
              <button key={m.id} onClick={() => setPrefs({ mode: m.id })} aria-pressed={prefs.mode === m.id} className={`rounded-xl border p-3 text-left transition ${prefs.mode === m.id ? 'border-accent bg-accent/10' : 'border-line hover:border-muted'}`}>
                <div className="text-sm font-semibold">{m.label}</div>
                <div className="text-xs text-muted">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <h2 className="text-lg font-semibold">Bookmarks</h2>
          {bookmarks.length ? (
            <ul className="mt-2 space-y-1 text-sm">
              {bookmarks.slice(-5).reverse().map((b) => (
                <li key={b.id}>
                  <Link className="text-accent hover:underline" to={b.href}>
                    {b.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">Use the bookmark icon on lessons, formulas and simulations to save them here.</p>
          )}
          <Link to="/bookmarks" className="mt-3 inline-block text-sm text-accent hover:underline">
            All bookmarks →
          </Link>
        </div>
      </section>

      <section aria-labelledby="tools-h">
        <h2 id="tools-h" className="mb-4 text-2xl font-semibold">
          Study tools
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {TOOLS.map((t) => (
            <Link key={t.to} to={t.to} className="card flex items-start gap-3 p-4 transition hover:border-accent/60">
              <t.icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
              <div>
                <div className="font-semibold">{t.label}</div>
                <div className="text-xs text-muted">{t.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

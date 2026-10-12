import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Atom, BookOpen, Bookmark, Calculator, ChartLine, ClipboardCheck, FlaskConical, GraduationCap, History, Layers, LayoutDashboard,
  Menu, Moon, Printer, Repeat, Ruler, Search, Sun, Target, X, Microscope, ListTree, Info, Orbit, Magnet, Lightbulb, Sparkles,
} from 'lucide-react';
import { useStore, type Mode } from '@/lib/store';
import { search, type SearchItem } from '@/lib/search';

const NAV: { group: string; items: { to: string; label: string; icon: ReactNode; colour?: string }[] }[] = [
  {
    group: 'Learn',
    items: [
      { to: '/', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
      { to: '/module/m5', label: 'M5 Advanced Mechanics', icon: <Orbit className="h-4 w-4" />, colour: 'text-m5' },
      { to: '/module/m6', label: 'M6 Electromagnetism', icon: <Magnet className="h-4 w-4" />, colour: 'text-m6' },
      { to: '/module/m7', label: 'M7 Nature of Light', icon: <Lightbulb className="h-4 w-4" />, colour: 'text-m7' },
      { to: '/module/m8', label: 'M8 Universe to Atom', icon: <Atom className="h-4 w-4" />, colour: 'text-m8' },
      { to: '/syllabus', label: 'Syllabus Explorer', icon: <ListTree className="h-4 w-4" /> },
    ],
  },
  {
    group: 'Tools',
    items: [
      { to: '/lab', label: 'Physics Lab', icon: <FlaskConical className="h-4 w-4" /> },
      { to: '/formulas', label: 'Formula Centre', icon: <BookOpen className="h-4 w-4" /> },
      { to: '/rearrange', label: 'Rearrange Formulas', icon: <Calculator className="h-4 w-4" /> },
      { to: '/units', label: 'Unit Converter', icon: <Ruler className="h-4 w-4" /> },
      { to: '/solver', label: 'Problem Solver', icon: <Target className="h-4 w-4" /> },
      { to: '/graphs', label: 'Graph Lab', icon: <ChartLine className="h-4 w-4" /> },
      { to: '/working-scientifically', label: 'Working Scientifically', icon: <Microscope className="h-4 w-4" /> },
      { to: '/timeline', label: 'Discoveries Timeline', icon: <History className="h-4 w-4" /> },
    ],
  },
  {
    group: 'Revise',
    items: [
      { to: '/exam', label: 'HSC Exam Centre', icon: <GraduationCap className="h-4 w-4" /> },
      { to: '/flashcards', label: 'Flashcards', icon: <Repeat className="h-4 w-4" /> },
      { to: '/progress', label: 'Progress', icon: <ClipboardCheck className="h-4 w-4" /> },
      { to: '/bookmarks', label: 'Bookmarks', icon: <Bookmark className="h-4 w-4" /> },
      { to: '/about', label: 'Data Sheet & Sources', icon: <Info className="h-4 w-4" /> },
    ],
  },
];

export const MODES: { id: Mode; label: string; desc: string }[] = [
  { id: 'standard', label: 'Standard', desc: 'Full explanations' },
  { id: 'beginner', label: 'Beginner', desc: 'Simpler language, smaller steps' },
  { id: 'visual', label: 'Visual', desc: 'Diagrams & formulas, minimal text' },
  { id: 'exam', label: 'Exam', desc: 'Concise HSC definitions & practice' },
];

function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const results: SearchItem[] = q ? search(q, 40) : [];

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 10);
      setActive(0);
    }
  }, [open]);

  if (!open) return null;
  const go = (r: SearchItem) => {
    navigate(r.href);
    onClose();
    setQ('');
  };
  return (
    <div className="no-print fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[10vh] backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-label="Search">
      <div className="card w-full max-w-2xl overflow-hidden !p-0" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <Search className="h-5 w-5 text-muted" aria-hidden />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
              if (e.key === 'ArrowDown') setActive((a) => Math.min(results.length - 1, a + 1));
              if (e.key === 'ArrowUp') setActive((a) => Math.max(0, a - 1));
              if (e.key === 'Enter' && results[active]) go(results[active]);
            }}
            className="w-full bg-transparent text-base outline-none placeholder:text-muted"
            placeholder="Search lessons, formulas, simulations, questions…"
            aria-label="Search the study guide"
          />
          <button className="btn !px-2" onClick={onClose} aria-label="Close search">
            <X className="h-4 w-4" />
          </button>
        </div>
        <ul className="max-h-[60vh] overflow-y-auto p-2" role="listbox">
          {q && results.length === 0 && <li className="p-4 text-sm text-muted">No results for “{q}”.</li>}
          {!q && <li className="p-4 text-sm text-muted">Try “escape velocity”, “Lenz”, “photoelectric”, “half-life”, “banked track”…</li>}
          {results.map((r, i) => (
            <li key={`${r.kind}-${r.id}`} role="option" aria-selected={i === active}>
              <button onClick={() => go(r)} onMouseEnter={() => setActive(i)} className={`flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left ${i === active ? 'bg-panel2' : ''}`}>
                <span className={`chip mt-0.5 shrink-0 ${r.module ? `text-m${r.module}` : ''}`}>{r.kind}</span>
                <span className="min-w-0 text-sm">{r.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const { prefs, setPrefs } = useStore();
  const [menu, setMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const loc = useLocation();

  useEffect(() => setMenu(false), [loc.pathname]);
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === '/' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, []);

  const nav = (
    <nav aria-label="Main" className="space-y-5">
      {NAV.map((g) => (
        <div key={g.group}>
          <div className="label mb-1.5 px-3">{g.group}</div>
          <ul className="space-y-0.5">
            {g.items.map((it) => (
              <li key={it.to}>
                <NavLink
                  to={it.to}
                  end={it.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm transition ${isActive ? 'bg-panel2 font-semibold text-ink ring-1 ring-line' : 'text-muted hover:bg-panel2/60 hover:text-ink'}`
                  }
                >
                  <span className={it.colour ?? ''}>{it.icon}</span>
                  {it.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-panel focus:p-2">
        Skip to content
      </a>
      {/* Top bar */}
      <header className="no-print sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-3 sm:px-5">
          <button className="btn !px-2 lg:hidden" onClick={() => setMenu(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center gap-2" aria-label="HSC Physics home">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent/30 to-m6/30 ring-1 ring-line">
              <Sparkles className="h-4 w-4 text-accent" aria-hidden />
            </span>
            <span className="hidden font-display text-lg font-semibold leading-none sm:block">
              HSC Physics <span className="text-accent">2026</span>
            </span>
          </Link>
          <button onClick={() => setSearchOpen(true)} className="ml-2 flex flex-1 items-center gap-2 rounded-lg border border-line bg-panel px-3 py-1.5 text-left text-sm text-muted hover:border-accent/50 sm:max-w-md" aria-label="Search (Ctrl+K)">
            <Search className="h-4 w-4" aria-hidden />
            <span className="flex-1 truncate">Search…</span>
            <kbd className="hidden rounded border border-line px-1.5 text-[10px] sm:inline">Ctrl K</kbd>
          </button>
          <div className="hidden items-center gap-1 rounded-lg border border-line bg-panel p-0.5 md:flex" role="radiogroup" aria-label="Learning mode">
            {MODES.map((m) => (
              <button
                key={m.id}
                role="radio"
                aria-checked={prefs.mode === m.id}
                title={m.desc}
                onClick={() => setPrefs({ mode: m.id })}
                className={`rounded-md px-2 py-1 text-xs font-medium ${prefs.mode === m.id ? 'bg-accent text-white dark:text-slate-950' : 'text-muted hover:text-ink'}`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <select className="input !w-auto font-sans md:hidden" value={prefs.mode} onChange={(e) => setPrefs({ mode: e.target.value as Mode })} aria-label="Learning mode">
            {MODES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          <button className="btn !px-2" onClick={() => window.print()} title="Print / save as PDF" aria-label="Print or save as PDF">
            <Printer className="h-4 w-4" />
          </button>
          <button className="btn !px-2" onClick={() => setPrefs({ theme: prefs.theme === 'dark' ? 'light' : 'dark' })} aria-label={`Switch to ${prefs.theme === 'dark' ? 'light' : 'dark'} theme`}>
            {prefs.theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <div className="flex">
        <aside className="no-print sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r border-line px-3 py-5 lg:block">
          {nav}
          <div className="mt-6 px-3 text-[11px] leading-relaxed text-muted">
            <Layers className="mb-1 h-3.5 w-3.5" aria-hidden />
            NSW Physics Stage 6 (2017 syllabus) · Modules 5–8 · for the 2026 HSC. Independent study resource — not an official NESA product.
          </div>
        </aside>

        {menu && (
          <div className="no-print fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMenu(false)} />
            <div className="absolute left-0 top-0 h-full w-72 overflow-y-auto border-r border-line bg-bg p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-display text-lg font-semibold">Menu</span>
                <button className="btn !px-2" onClick={() => setMenu(false)} aria-label="Close menu">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {nav}
            </div>
          </div>
        )}

        <main id="main" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { load, save } from './storage';
import type { ErrorType, Skill } from '@/content/questions';
import type { ModuleNo } from '@/content/formulas';

export type Mode = 'standard' | 'beginner' | 'visual' | 'exam';
export type Theme = 'dark' | 'light';

export interface Prefs {
  theme: Theme;
  mode: Mode;
  /** adaptive difficulty 1–4 */
  difficulty: number;
  adaptive: boolean;
}

export interface Bookmark {
  id: string;
  kind: 'concept' | 'formula' | 'sim' | 'question' | 'history' | 'graph';
  title: string;
  href: string;
}

export interface Attempt {
  qid: string;
  source: 'mcq' | 'sa' | 'solver' | 'formula' | 'mock';
  module: ModuleNo;
  section: string;
  skill: Skill | 'solver';
  correct: boolean;
  error?: ErrorType;
  at: number;
}

export interface CardState {
  box: number;
  due: number;
}

interface Store {
  prefs: Prefs;
  setPrefs: (p: Partial<Prefs>) => void;
  progress: Record<string, boolean>;
  toggleProgress: (id: string, value?: boolean) => void;
  bookmarks: Bookmark[];
  toggleBookmark: (b: Bookmark) => void;
  isBookmarked: (id: string) => boolean;
  attempts: Attempt[];
  recordAttempt: (a: Omit<Attempt, 'at'>) => void;
  cards: Record<string, CardState>;
  reviewCard: (id: string, known: boolean) => void;
  resetAll: () => void;
}

const defaultPrefs = (): Prefs => {
  let dark = true;
  try {
    dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    /* default dark */
  }
  return { theme: dark ? 'dark' : 'light', mode: 'standard', difficulty: 2, adaptive: true };
};

const Ctx = createContext<Store | null>(null);

/** Leitner intervals (days) by box. */
const INTERVALS = [0, 1, 2, 4, 8, 16];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefsState] = useState<Prefs>(() => load('prefs', defaultPrefs()));
  const [progress, setProgress] = useState<Record<string, boolean>>(() => load('progress', {}));
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => load('bookmarks', []));
  const [attempts, setAttempts] = useState<Attempt[]>(() => load('attempts', []));
  const [cards, setCards] = useState<Record<string, CardState>>(() => load('cards', {}));

  useEffect(() => save('prefs', prefs), [prefs]);
  useEffect(() => save('progress', progress), [progress]);
  useEffect(() => save('bookmarks', bookmarks), [bookmarks]);
  useEffect(() => save('attempts', attempts), [attempts]);
  useEffect(() => save('cards', cards), [cards]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', prefs.theme === 'dark');
    root.classList.toggle('mode-visual', prefs.mode === 'visual');
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute('content', prefs.theme === 'dark' ? '#090d18' : '#f6f5f0');
  }, [prefs.theme, prefs.mode]);

  const setPrefs = useCallback((p: Partial<Prefs>) => setPrefsState((s) => ({ ...s, ...p })), []);

  const toggleProgress = useCallback((id: string, value?: boolean) => {
    setProgress((s) => ({ ...s, [id]: value ?? !s[id] }));
  }, []);

  const toggleBookmark = useCallback((b: Bookmark) => {
    setBookmarks((s) => (s.some((x) => x.id === b.id) ? s.filter((x) => x.id !== b.id) : [...s, b]));
  }, []);
  const isBookmarked = useCallback((id: string) => bookmarks.some((b) => b.id === id), [bookmarks]);

  const recordAttempt = useCallback(
    (a: Omit<Attempt, 'at'>) => {
      setAttempts((s) => [...s.slice(-1999), { ...a, at: Date.now() }]);
      // adaptive difficulty: move up after 3 correct in a row, down after 2 wrong in a row
      setPrefsState((p) => {
        if (!p.adaptive) return p;
        const recent = [...attempts.slice(-4), { ...a, at: 0 }];
        const last3 = recent.slice(-3);
        const last2 = recent.slice(-2);
        if (last3.length === 3 && last3.every((x) => x.correct)) return { ...p, difficulty: Math.min(4, p.difficulty + 1) };
        if (last2.length === 2 && last2.every((x) => !x.correct)) return { ...p, difficulty: Math.max(1, p.difficulty - 1) };
        return p;
      });
    },
    [attempts],
  );

  const reviewCard = useCallback((id: string, known: boolean) => {
    setCards((s) => {
      const cur = s[id] ?? { box: 0, due: 0 };
      const box = known ? Math.min(INTERVALS.length - 1, cur.box + 1) : 0;
      return { ...s, [id]: { box, due: Date.now() + INTERVALS[box] * 86400000 } };
    });
  }, []);

  const resetAll = useCallback(() => {
    setProgress({});
    setBookmarks([]);
    setAttempts([]);
    setCards({});
  }, []);

  const value = useMemo(
    () => ({ prefs, setPrefs, progress, toggleProgress, bookmarks, toggleBookmark, isBookmarked, attempts, recordAttempt, cards, reviewCard, resetAll }),
    [prefs, setPrefs, progress, toggleProgress, bookmarks, toggleBookmark, isBookmarked, attempts, recordAttempt, cards, reviewCard, resetAll],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore outside provider');
  return s;
}

/** Per-simulation persistent settings (localStorage), with reset to defaults. */
export function useSimSettings<T extends object>(simId: string, defaults: T): [T, (p: Partial<T>) => void, () => void] {
  const [state, setState] = useState<T>(() => load(`sim.${simId}`, defaults));
  useEffect(() => save(`sim.${simId}`, state), [simId, state]);
  const update = useCallback((p: Partial<T>) => setState((s) => ({ ...s, ...p })), []);
  const reset = useCallback(() => setState(defaults), [defaults]);
  return [state, update, reset];
}

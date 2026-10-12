import { ALL_CONCEPTS } from '@/content/modules';
import { FORMULAS } from '@/content/formulas';
import { SIMS } from '@/content/sims';
import { HISTORY } from '@/content/history';
import { SECTIONS, MODULES } from '@/content/syllabus';
import { QUESTIONS } from '@/content/questions';
import { INVESTIGATIONS } from '@/content/investigations';
import { TEMPLATES } from '@/content/solver';
import { GRAPHS } from '@/content/graphs';

export interface SearchItem {
  id: string;
  kind: 'Lesson' | 'Formula' | 'Simulation' | 'Discovery' | 'Syllabus' | 'Question' | 'Investigation' | 'Solver' | 'Graph' | 'Module' | 'Page';
  title: string;
  text: string;
  href: string;
  module?: number;
}

const PAGES: SearchItem[] = [
  { id: 'p-lab', kind: 'Page', title: 'Physics Lab', text: 'all simulations interactive', href: '/lab' },
  { id: 'p-formulas', kind: 'Page', title: 'Formula Centre', text: 'formula library calculators', href: '/formulas' },
  { id: 'p-rearrange', kind: 'Page', title: 'Formula Rearrangement Tool', text: 'rearrange solve unknown variable substitution', href: '/rearrange' },
  { id: 'p-units', kind: 'Page', title: 'Unit Conversion Laboratory', text: 'convert km m nm eV J MeV km/h degrees radians prefixes dimensional analysis', href: '/units' },
  { id: 'p-solver', kind: 'Page', title: 'Step-by-step Problem Solver', text: 'tutor hints worked solution', href: '/solver' },
  { id: 'p-graphs', kind: 'Page', title: 'Graph Laboratory', text: 'graphs gradient area', href: '/graphs' },
  { id: 'p-ws', kind: 'Page', title: 'Working Scientifically Centre', text: 'validity reliability accuracy precision uncertainty error hypothesis variables risk data analysis', href: '/working-scientifically' },
  { id: 'p-timeline', kind: 'Page', title: 'Scientific Discoveries Timeline', text: 'history scientists experiments', href: '/timeline' },
  { id: 'p-exam', kind: 'Page', title: 'HSC Exam Centre', text: 'practice multiple choice short answer mock exam past papers performance', href: '/exam' },
  { id: 'p-flash', kind: 'Page', title: 'Flashcards', text: 'revision spaced repetition', href: '/flashcards' },
  { id: 'p-syllabus', kind: 'Page', title: 'Syllabus Explorer & Coverage Matrix', text: 'dot points inquiry questions checklist', href: '/syllabus' },
  { id: 'p-data', kind: 'Page', title: 'Data sheet & sources', text: 'constants data sheet references NESA', href: '/about' },
];

let cache: SearchItem[] | null = null;

export function searchIndex(): SearchItem[] {
  if (cache) return cache;
  cache = [
    ...MODULES.map((m) => ({ id: `mod-${m.id}`, kind: 'Module' as const, title: `Module ${m.no}: ${m.title}`, text: `${m.summary} ${m.focus}`, href: `/module/${m.id}`, module: m.no })),
    ...ALL_CONCEPTS.map((c) => ({
      id: c.id,
      kind: 'Lesson' as const,
      title: c.title,
      text: `${c.what} ${c.how} ${c.exam}`,
      href: `/module/m${c.section[1]}#${c.id}`,
      module: Number(c.section[1]),
    })),
    ...FORMULAS.map((f) => ({ id: f.id, kind: 'Formula' as const, title: f.name, text: `${f.interpretation} ${f.vars.map((v) => v.name).join(' ')}`, href: `/formulas/${f.id}`, module: f.module })),
    ...SIMS.map((s) => ({ id: s.id, kind: 'Simulation' as const, title: s.title, text: s.blurb, href: `/lab/${s.id}`, module: s.module })),
    ...HISTORY.map((h) => ({ id: h.id, kind: 'Discovery' as const, title: `${h.who} (${h.when})`, text: `${h.discovery} ${h.evidence}`, href: `/timeline#${h.id}`, module: h.module })),
    ...SECTIONS.flatMap((s) =>
      s.dotPoints.map((d) => ({ id: d.id, kind: 'Syllabus' as const, title: `${s.title}: ${d.text.slice(0, 70)}…`, text: `${d.text} ${s.inquiry}`, href: `/syllabus#${d.id}`, module: s.module })),
    ),
    ...QUESTIONS.map((q) => ({ id: q.id, kind: 'Question' as const, title: q.stem.slice(0, 90) + (q.stem.length > 90 ? '…' : ''), text: q.stem, href: `/exam?q=${q.id}`, module: q.module })),
    ...INVESTIGATIONS.map((i) => ({ id: i.id, kind: 'Investigation' as const, title: i.title, text: `${i.question} ${i.hypothesis}`, href: `/working-scientifically?inv=${i.id}`, module: i.module })),
    ...TEMPLATES.map((t) => ({ id: `solver-${t.id}`, kind: 'Solver' as const, title: `Solve: ${t.title}`, text: t.title, href: `/solver/${t.id}`, module: t.module })),
    ...GRAPHS.map((g) => ({ id: `graph-${g.id}`, kind: 'Graph' as const, title: g.title, text: `${g.relationship} ${g.xLabel} ${g.yLabel}`, href: `/graphs/${g.id}`, module: g.module })),
    ...PAGES,
  ];
  return cache;
}

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');

/** Token-based scoring: title matches weigh more; every query token must appear somewhere. */
export function search(query: string, limit = 30): SearchItem[] {
  const q = norm(query).trim();
  if (!q) return [];
  const tokens = q.split(/\s+/).filter(Boolean);
  const scored: { item: SearchItem; score: number }[] = [];
  for (const item of searchIndex()) {
    const title = norm(item.title);
    const body = norm(item.text);
    let score = 0;
    let ok = true;
    for (const t of tokens) {
      const inTitle = title.includes(t);
      const inBody = body.includes(t);
      if (!inTitle && !inBody) {
        ok = false;
        break;
      }
      score += inTitle ? (title.startsWith(t) ? 6 : 4) : 1;
    }
    if (!ok) continue;
    if (title.includes(q)) score += 5;
    if (item.kind === 'Lesson' || item.kind === 'Simulation' || item.kind === 'Formula') score += 1;
    scored.push({ item, score });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((s) => s.item);
}

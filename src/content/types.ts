import type { ModuleNo } from './formulas';

export interface Concept {
  id: string;
  section: string;
  title: string;
  dotPoints: string[];
  /** What it means (1–2 sentences) */
  what: string;
  /** How it works */
  how: string;
  /** Why it happens */
  why: string;
  /** Mathematical representation (LaTeX) */
  math?: string[];
  /** static diagram id (see components/diagrams) */
  diagram?: string;
  /** interactive simulation id */
  sim?: string;
  /** everyday example */
  example?: string;
  /** experimental evidence / historical context */
  evidence?: string;
  /** How it may appear in an HSC question */
  hsc: string;
  /** simpler explanation for Beginner mode */
  beginner: string;
  /** concise HSC-standard definition for Exam mode */
  exam: string;
  misconception?: { wrong: string; right: string };
  /** beyond the syllabus requirements */
  supplementary?: boolean;
}

export interface Experiment {
  title: string;
  kind: 'practical' | 'historical';
  who?: string;
  aim: string;
  method: string[];
  observations: string;
  conclusion: string;
  limitations: string;
  dotPoints: string[];
}

export interface ModuleContent {
  module: ModuleNo;
  concepts: Concept[];
  experiments: Experiment[];
  hsc: { questionTypes: string[]; commonErrors: string[]; typicalCalcs: string[]; techniques: string[] };
  quick: {
    takeaways: string[];
    summary30: string;
    equations: string[];
    diagrams: string[];
    misconceptions: { wrong: string; right: string }[];
  };
  conceptMap: { nodes: { id: string; label: string; x: number; y: number; kind?: 'core' | 'law' | 'app' }[]; edges: [string, string, string?][] };
}

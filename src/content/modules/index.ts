import type { ModuleNo } from '../formulas';
import type { ModuleContent, Concept } from '../types';
import { M5 } from './m5';
import { M6 } from './m6';
import { M7 } from './m7';
import { M8 } from './m8';

export const MODULE_CONTENT: Record<ModuleNo, ModuleContent> = { 5: M5, 6: M6, 7: M7, 8: M8 };
export const ALL_CONCEPTS: Concept[] = [M5, M6, M7, M8].flatMap((m) => m.concepts);
export const conceptById = (id: string) => ALL_CONCEPTS.find((c) => c.id === id);
export const conceptsForDotPoint = (dp: string) => ALL_CONCEPTS.filter((c) => c.dotPoints.includes(dp));

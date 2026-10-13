import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, RotateCcw, X } from 'lucide-react';
import { FLASHCARDS } from '@/content/flashcards';
import { useStore } from '@/lib/store';
import { Chip, ModuleBadge, RichText, Tabs, Tex, Toggle } from '@/components/ui';
import { EmptyState, PageHeader } from './shared';

type Filter = 'all' | '5' | '6' | '7' | '8';

export default function Flashcards() {
  const { cards, reviewCard } = useStore();
  const [mod, setMod] = useState<Filter>('all');
  const [dueOnly, setDueOnly] = useState(true);
  const [flipped, setFlipped] = useState(false);
  const [session, setSession] = useState(0);
  const [skipped, setSkipped] = useState<string[]>([]);

  const now = useMemo(() => Date.now(), [session]); // eslint-disable-line react-hooks/exhaustive-deps
  const pool = FLASHCARDS.filter((c) => mod === 'all' || String(c.module) === mod);
  const due = pool.filter((c) => (cards[c.id]?.due ?? 0) <= now && !skipped.includes(c.id));
  const queue = (dueOnly ? due : pool.filter((c) => !skipped.includes(c.id))).sort((a, b) => (cards[a.id]?.box ?? 0) - (cards[b.id]?.box ?? 0));
  const card = queue[0];
  const boxes = [0, 1, 2, 3, 4, 5].map((b) => pool.filter((c) => (cards[c.id]?.box ?? 0) === b).length);

  const answer = (known: boolean) => {
    if (!card) return;
    reviewCard(card.id, known);
    setSkipped((s) => [...s, card.id]);
    setFlipped(false);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader kicker="Flashcards" title="Spaced repetition">
        Cards you know move up a box and come back after longer gaps (1, 2, 4, 8, 16 days). Cards you miss return to box 0. Progress is saved in this browser.
      </PageHeader>
      <div className="flex flex-wrap items-center gap-3">
        <Tabs<Filter> value={mod} onChange={(v) => { setMod(v); setSkipped([]); setFlipped(false); }} tabs={[{ id: 'all', label: 'All' }, { id: '5', label: 'M5' }, { id: '6', label: 'M6' }, { id: '7', label: 'M7' }, { id: '8', label: 'M8' }]} />
        <Toggle label="Due cards only" checked={dueOnly} onChange={(v) => { setDueOnly(v); setSkipped([]); }} />
        <span className="text-sm text-muted">{queue.length} in queue · {due.length} due</span>
      </div>
      <div className="grid grid-cols-6 gap-1 text-center text-[11px]">
        {boxes.map((n, b) => (
          <div key={b} className="rounded-lg border border-line py-1.5">
            <div className="num text-base font-semibold">{n}</div>
            <div className="text-muted">box {b}</div>
          </div>
        ))}
      </div>
      {card ? (
        <div>
          <AnimatePresence mode="wait">
            <motion.button
              key={card.id + String(flipped)}
              initial={{ rotateX: -80, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              exit={{ rotateX: 80, opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setFlipped((f) => !f)}
              className="card flex min-h-[260px] w-full flex-col items-center justify-center gap-4 p-8 text-center"
              aria-label={flipped ? 'Show question' : 'Show answer'}
            >
              <div className="flex gap-1.5">
                <ModuleBadge m={card.module} />
                <Chip>{card.kind}</Chip>
              </div>
              {!flipped ? (
                <div className="text-xl font-semibold">
                  <RichText text={card.front} />
                </div>
              ) : (
                <div className="space-y-3 text-lg">
                  {card.tex && <Tex block>{card.tex}</Tex>}
                  <RichText text={card.back} />
                </div>
              )}
              <span className="text-xs text-muted">{flipped ? 'Answer' : 'Tap or press to reveal'}</span>
            </motion.button>
          </AnimatePresence>
          <div className="mt-4 flex justify-center gap-3">
            <button className="btn !border-bad/50 text-bad" onClick={() => answer(false)} disabled={!flipped}>
              <X className="h-4 w-4" /> Didn’t know
            </button>
            <button className="btn !border-good/50 text-good" onClick={() => answer(true)} disabled={!flipped}>
              <Check className="h-4 w-4" /> Knew it
            </button>
          </div>
        </div>
      ) : (
        <EmptyState title={dueOnly ? 'No cards due — nice work!' : 'Deck complete for this session'}>
          <button className="btn mt-3" onClick={() => { setSkipped([]); setSession((s) => s + 1); setDueOnly(false); }}>
            <RotateCcw className="h-4 w-4" /> Review all cards anyway
          </button>
        </EmptyState>
      )}
    </div>
  );
}

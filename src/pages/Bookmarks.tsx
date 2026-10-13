import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Chip } from '@/components/ui';
import { EmptyState, PageHeader } from './shared';

const LABEL = { concept: 'Lesson', formula: 'Formula', sim: 'Simulation', question: 'Question', history: 'Discovery', graph: 'Graph' } as const;

export default function Bookmarks() {
  const { bookmarks, toggleBookmark } = useStore();
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader kicker="Bookmarks" title="Saved for later">
        Bookmarks are stored in this browser.
      </PageHeader>
      {bookmarks.length ? (
        <ul className="space-y-2">
          {[...bookmarks].reverse().map((b) => (
            <li key={b.id} className="card flex items-center justify-between gap-3 p-3">
              <Link to={b.href} className="flex min-w-0 items-center gap-3 hover:text-accent">
                <Chip>{LABEL[b.kind]}</Chip>
                <span className="truncate font-medium">{b.title}</span>
              </Link>
              <button className="btn !px-2" onClick={() => toggleBookmark(b)} aria-label={`Remove bookmark ${b.title}`}>
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="No bookmarks yet" to="/module/m5" cta="Browse Module 5">
          Use the bookmark button on lessons, formulas, simulations, graphs and discoveries.
        </EmptyState>
      )}
    </div>
  );
}

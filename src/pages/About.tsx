import { ExternalLink } from 'lucide-react';
import { DATA_SHEET } from '@/lib/physics/constants';
import { REFERENCES, EXAM_SPEC } from '@/content/references';
import { SOURCE_NOTE } from '@/content/syllabus';
import { useStore } from '@/lib/store';
import { Callout, Tex } from '@/components/ui';
import { PageHeader } from './shared';

export default function About() {
  const { resetAll } = useStore();
  return (
    <div className="space-y-6">
      <PageHeader kicker="Reference" title="Data sheet, sources and notes" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr]">
        <section className="card overflow-x-auto p-5">
          <h2 className="mb-3 text-lg font-semibold">Data sheet values used in calculations</h2>
          <table className="w-full text-sm">
            <tbody>
              {DATA_SHEET.map((d) => (
                <tr key={d.name} className="border-t border-line first:border-0">
                  <td className="py-1.5 pr-2">{d.name}</td>
                  <td className="py-1.5 pr-2">{d.symbol && <Tex>{d.symbol}</Tex>}</td>
                  <td className="py-1.5 text-right">
                    <Tex>{d.value}</Tex>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-muted">Values follow the NESA Physics data sheet. Always use the values on the sheet supplied in your examination.</p>
        </section>
        <div className="space-y-4">
          <section className="card p-5">
            <h2 className="mb-2 text-lg font-semibold">HSC examination structure</h2>
            <p className="text-sm">
              {EXAM_SPEC.totalMarks} marks · {EXAM_SPEC.writingTime} writing time · {EXAM_SPEC.readingTime} reading time
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {EXAM_SPEC.sections.map((s) => (
                <li key={s.name}>
                  <strong>{s.name}</strong> ({s.marks} marks): {s.desc}
                </li>
              ))}
            </ul>
            <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-muted">
              {EXAM_SPEC.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </section>
          <Callout kind="warn" title="Important">
            <p>{SOURCE_NOTE}</p>
            <p className="mt-2">This is an independent study resource, not an official NESA publication. Self-marking criteria and model answers are guides only — they do not replicate official NESA marking.</p>
            <p className="mt-2">Nuclear physics content is theoretical and educational only.</p>
          </Callout>
        </div>
      </div>
      <section className="card p-5">
        <h2 className="mb-3 text-lg font-semibold">Sources</h2>
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {REFERENCES.map((r) => (
            <li key={r.url} className="rounded-xl border border-line p-3 text-sm">
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-accent hover:underline">
                {r.org}: {r.title} <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <p className="mt-0.5 text-muted">{r.use}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="card p-5">
        <h2 className="mb-2 text-lg font-semibold">Your data</h2>
        <p className="text-sm text-muted">Progress, bookmarks, attempts, flashcard boxes and simulation settings are stored only in this browser (localStorage). Nothing is sent to a server.</p>
        <button
          className="btn mt-3 !border-bad/50 text-bad"
          onClick={() => {
            if (window.confirm('Reset all progress, bookmarks, attempts and flashcards? This cannot be undone.')) resetAll();
          }}
        >
          Reset all progress
        </button>
      </section>
    </div>
  );
}

import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { sectionsFor, SOURCE_NOTE } from '@/content/syllabus';
import { MODULE_CONTENT } from '@/content/modules';
import { FORMULAS } from '@/content/formulas';
import { RichText, Tex } from '@/components/ui';
import { Diagram } from '@/components/diagrams';
import { moduleFromParam } from './shared';
import NotFound from './NotFound';

/** Condensed, print-friendly notes for one module (use the browser’s “Save as PDF”). */
export default function PrintNotes() {
  const { id } = useParams();
  const meta = moduleFromParam(id);
  if (!meta) return <NotFound />;
  const content = MODULE_CONTENT[meta.no];
  const sections = sectionsFor(meta.no);
  const formulas = FORMULAS.filter((f) => f.module === meta.no);

  return (
    <div className="print-notes mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 print:hidden">
        <Link to={`/module/${meta.id}`} className="btn">
          <ArrowLeft className="h-4 w-4" /> Back to module
        </Link>
        <button className="btn btn-primary" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Print / save as PDF
        </button>
      </div>

      <header className="border-b border-line pb-4">
        <div className="label">HSC Physics 2026 · Revision notes</div>
        <h1 className="font-display text-3xl font-semibold">
          Module {meta.no}: {meta.title}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {meta.outcome.code} — {meta.outcome.text}
        </p>
      </header>

      <section className="mt-6 break-inside-avoid">
        <h2 className="text-xl font-semibold">30-second summary</h2>
        <p className="mt-1">{content.quick.summary30}</p>
      </section>

      {sections.map((s) => (
        <section key={s.id} className="mt-8">
          <h2 className="border-b border-line pb-1 text-xl font-semibold">{s.title}</h2>
          <p className="mt-2 text-sm italic">Inquiry question: “{s.inquiry}”</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {s.dotPoints.map((d) => (
              <li key={d.id}>
                <RichText text={d.text} />
              </li>
            ))}
          </ul>
          {content.concepts
            .filter((c) => c.section === s.id)
            .map((c) => (
              <article key={c.id} className="mt-5 break-inside-avoid">
                <h3 className="font-semibold">{c.title}</h3>
                <div className={`mt-1 grid gap-4 ${c.diagram ? 'sm:grid-cols-[1.4fr_1fr] print:grid-cols-[1.4fr_1fr]' : ''}`}>
                  <div className="space-y-1.5 text-sm">
                    <p>
                      <strong>Definition:</strong> <RichText text={c.exam} />
                    </p>
                    <p>
                      <strong>How:</strong> <RichText text={c.how} />
                    </p>
                    <p>
                      <strong>Why:</strong> <RichText text={c.why} />
                    </p>
                    {c.math?.map((m) => (
                      <Tex key={m} block>
                        {m}
                      </Tex>
                    ))}
                    {c.misconception && (
                      <p className="text-xs">
                        <strong>Avoid:</strong> {c.misconception.wrong} → {c.misconception.right}
                      </p>
                    )}
                  </div>
                  {c.diagram && <Diagram id={c.diagram} />}
                </div>
              </article>
            ))}
        </section>
      ))}

      <section className="mt-10">
        <h2 className="border-b border-line pb-1 text-xl font-semibold">Formulas</h2>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted">
              <th className="py-1 pr-2">Relationship</th>
              <th className="py-1 pr-2">Formula</th>
              <th className="py-1">On sheet</th>
            </tr>
          </thead>
          <tbody>
            {formulas.map((f) => (
              <tr key={f.id} className="break-inside-avoid border-t border-line">
                <td className="py-1.5 pr-2">{f.name}</td>
                <td className="py-1.5 pr-2">
                  <Tex>{f.tex}</Tex>
                </td>
                <td className="py-1.5">{f.onSheet ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-10 break-inside-avoid">
        <h2 className="border-b border-line pb-1 text-xl font-semibold">Key takeaways</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {content.quick.takeaways.map((t) => (
            <li key={t}>
              <RichText text={t} />
            </li>
          ))}
        </ul>
        <h3 className="mt-4 font-semibold">Common errors</h3>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
          {content.hsc.commonErrors.map((t) => (
            <li key={t}>
              <RichText text={t} />
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-10 border-t border-line pt-3 text-[11px] text-muted">{SOURCE_NOTE}</p>
    </div>
  );
}

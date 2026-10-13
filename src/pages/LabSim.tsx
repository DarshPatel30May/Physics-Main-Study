import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { SIMS, simById } from '@/content/sims';
import { ALL_DOT_POINTS } from '@/content/syllabus';
import { ALL_CONCEPTS } from '@/content/modules';
import { SimLoader } from '@/sims/registry';
import { BookmarkButton, Chip, ModuleBadge, RichText } from '@/components/ui';
import NotFound from './NotFound';

export default function LabSim() {
  const { id } = useParams();
  const sim = id ? simById(id) : undefined;
  if (!sim) return <NotFound />;
  const i = SIMS.indexOf(sim);
  const prev = SIMS[(i - 1 + SIMS.length) % SIMS.length];
  const next = SIMS[(i + 1) % SIMS.length];
  const dps = ALL_DOT_POINTS.filter((d) => d.sims.includes(sim.id));
  const lessons = ALL_CONCEPTS.filter((c) => c.sim === sim.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link to="/lab" className="btn">
          <ArrowLeft className="h-4 w-4" /> All simulations
        </Link>
        <div className="flex gap-2">
          <Link to={`/lab/${prev.id}`} className="btn" title={prev.title}>
            <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline">{prev.title}</span>
          </Link>
          <Link to={`/lab/${next.id}`} className="btn" title={next.title}>
            <span className="hidden sm:inline">{next.title}</span> <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap gap-1.5">
            <ModuleBadge m={sim.module} />
            <Chip>{sim.category}</Chip>
            <Chip tone={sim.model === 'quantitative' ? 'good' : 'default'}>{sim.model === 'quantitative' ? 'Quantitative model' : 'Conceptual visualisation'}</Chip>
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">{sim.title}</h1>
          <p className="prose-block mt-1 max-w-3xl text-muted">{sim.blurb}</p>
        </div>
        <BookmarkButton bm={{ id: `sim:${sim.id}`, kind: 'sim', title: sim.title, href: `/lab/${sim.id}` }} />
      </header>
      <SimLoader key={sim.id} id={sim.id} />
      {(dps.length > 0 || lessons.length > 0) && (
        <section className="card p-5">
          <div className="label mb-2">Syllabus links</div>
          <ul className="space-y-1.5 text-sm">
            {dps.map((d) => (
              <li key={d.id} className="flex gap-2">
                <Link to={`/syllabus#${d.id}`} className="num shrink-0 text-xs text-accent hover:underline">
                  {d.id}
                </Link>
                <RichText text={d.text} />
              </li>
            ))}
          </ul>
          {lessons.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <span className="text-muted">Lessons:</span>
              {lessons.map((c) => (
                <Link key={c.id} to={`/module/m${c.section.slice(1, 2)}#${c.id}`} className="text-accent hover:underline">
                  {c.title}
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

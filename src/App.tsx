import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const ModulePage = lazy(() => import('./pages/ModulePage'));
const PrintNotes = lazy(() => import('./pages/PrintNotes'));
const Lab = lazy(() => import('./pages/Lab'));
const LabSim = lazy(() => import('./pages/LabSim'));
const FormulaCentre = lazy(() => import('./pages/FormulaCentre'));
const FormulaDetail = lazy(() => import('./pages/FormulaDetail'));
const Rearrange = lazy(() => import('./pages/Rearrange'));
const Units = lazy(() => import('./pages/Units'));
const Solver = lazy(() => import('./pages/Solver'));
const GraphLab = lazy(() => import('./pages/GraphLab'));
const WorkingScientifically = lazy(() => import('./pages/WorkingScientifically'));
const Timeline = lazy(() => import('./pages/Timeline'));
const ExamCentre = lazy(() => import('./pages/ExamCentre'));
const Flashcards = lazy(() => import('./pages/Flashcards'));
const Syllabus = lazy(() => import('./pages/Syllabus'));
const Bookmarks = lazy(() => import('./pages/Bookmarks'));
const Progress = lazy(() => import('./pages/Progress'));
const About = lazy(() => import('./pages/About'));
const NotFound = lazy(() => import('./pages/NotFound'));

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <Layout>
      <ScrollToTop />
      <Suspense fallback={<div className="grid h-64 place-items-center text-muted">Loading…</div>}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/module/:id" element={<ModulePage />} />
          <Route path="/module/:id/print" element={<PrintNotes />} />
          <Route path="/lab" element={<Lab />} />
          <Route path="/lab/:id" element={<LabSim />} />
          <Route path="/formulas" element={<FormulaCentre />} />
          <Route path="/formulas/:id" element={<FormulaDetail />} />
          <Route path="/rearrange" element={<Rearrange />} />
          <Route path="/units" element={<Units />} />
          <Route path="/solver" element={<Solver />} />
          <Route path="/solver/:id" element={<Solver />} />
          <Route path="/graphs" element={<GraphLab />} />
          <Route path="/graphs/:id" element={<GraphLab />} />
          <Route path="/working-scientifically" element={<WorkingScientifically />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/exam" element={<ExamCentre />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/syllabus" element={<Syllabus />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

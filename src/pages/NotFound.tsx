import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-20 text-center">
      <div className="num text-6xl font-bold text-accent">404</div>
      <h1 className="mt-2 font-display text-3xl font-semibold">Page not found</h1>
      <p className="mt-2 text-muted">That page doesn’t exist. Try the search (Ctrl + K) or head back to the dashboard.</p>
      <Link to="/" className="btn btn-primary mt-6 inline-flex">
        Back to dashboard
      </Link>
    </div>
  );
}

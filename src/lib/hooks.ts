import { useEffect, useRef, useState, type RefObject } from 'react';

/** True while the element is (at least partly) on screen. */
export function useInView<T extends Element>(ref: RefObject<T>, rootMargin = '100px') {
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return inView;
}

function usePageVisible() {
  const [visible, setVisible] = useState(() => (typeof document === 'undefined' ? true : document.visibilityState !== 'hidden'));
  useEffect(() => {
    const on = () => setVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);
  return visible;
}

/**
 * requestAnimationFrame loop that calls cb(dt in seconds). Runs only while `running`, the element
 * is in view and the tab is visible. dt is clamped to avoid huge jumps after pauses.
 */
export function useAnimationFrame(cb: (dt: number) => void, running: boolean, ref?: RefObject<Element>) {
  const cbRef = useRef(cb);
  cbRef.current = cb;
  const dummy = useRef<Element>(null);
  const inView = useInView(ref ?? dummy);
  const visible = usePageVisible();
  const active = running && visible && (ref ? inView : true);
  useEffect(() => {
    if (!active) return;
    let id = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      cbRef.current(dt);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [active]);
  return active;
}

/** Reads theme colours (as concrete rgb() strings) for libraries that cannot use CSS variables. */
export function useThemeColours() {
  const read = () => {
    const cs = typeof window === 'undefined' ? null : getComputedStyle(document.documentElement);
    const get = (n: string, fb: string) => {
      const v = cs?.getPropertyValue(`--${n}`).trim();
      return v ? `rgb(${v.split(/\s+/).join(',')})` : fb;
    };
    return {
      ink: get('ink', '#e4e9f3'),
      muted: get('muted', '#94a0b8'),
      line: get('line', '#28344e'),
      panel: get('panel', '#0f1524'),
      accent: get('accent', '#22d3ee'),
      m5: get('m5', '#4d8dff'),
      m6: get('m6', '#a78bfa'),
      m7: get('m7', '#fbbf24'),
      m8: get('m8', '#34d399'),
      good: get('good', '#4ade80'),
      bad: get('bad', '#f87171'),
      warn: get('warn', '#facc15'),
    };
  };
  const [c, setC] = useState(read);
  useEffect(() => {
    const mo = new MutationObserver(() => setC(read()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);
  return c;
}

export function useMediaQuery(q: string) {
  const [m, setM] = useState(() => (typeof window === 'undefined' ? false : window.matchMedia(q).matches));
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [q]);
  return m;
}

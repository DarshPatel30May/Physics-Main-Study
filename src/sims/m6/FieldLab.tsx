import { useMemo, useRef, useState } from 'react';
import { SimShell, Playback } from '@/components/SimShell';
import { Slider, Stat, Tabs, Select, Callout, Tex } from '@/components/ui';
import { Arrow, Label, FieldGrid } from '@/components/svg';
import { useAnimationFrame } from '@/lib/hooks';
import { useSimSettings } from '@/lib/store';
import { C } from '@/lib/physics/constants';
import { borisStep, cross, type Vec3 } from '@/lib/physics/electromagnetism';

type Tab = 'efield' | 'E' | 'B' | 'cross' | 'dir';
const PARTICLES = {
  electron: { name: 'Electron', q: -C.e, m: C.me, vUnit: 1e6, vLabel: '× 10⁶ m s⁻¹' },
  proton: { name: 'Proton', q: C.e, m: C.mp, vUnit: 1e5, vLabel: '× 10⁵ m s⁻¹' },
  alpha: { name: 'Alpha particle', q: 2 * C.e, m: 6.645e-27, vUnit: 1e5, vLabel: '× 10⁵ m s⁻¹' },
  positron: { name: 'Positron', q: C.e, m: C.me, vUnit: 1e6, vLabel: '× 10⁶ m s⁻¹' },
};
type PKey = keyof typeof PARTICLES;
const PRESETS = ['single+', 'single-', 'dipole', 'like', 'plates'] as const;
type Preset = (typeof PRESETS)[number];

const DEFAULTS = {
  tab: 'efield' as Tab,
  preset: 'dipole' as Preset,
  q1: 1,
  q2: 1,
  particle: 'electron' as PKey,
  qMult: 1,
  v: 8,
  V: 100,
  BmT: 1,
  Bout: false,
  pitchAngle: 90,
  Ecross: 2,
  vDir: 0,
  bDir: 4,
  sign: 1,
};
const W = 560;
const H = 360;

/* ---------------- Electric field lines for point charges ---------------- */
interface Q {
  x: number;
  y: number;
  q: number;
}
function chargesFor(p: Preset, q1: number, q2: number): Q[] {
  switch (p) {
    case 'single+':
      return [{ x: W / 2, y: H / 2, q: q1 }];
    case 'single-':
      return [{ x: W / 2, y: H / 2, q: -q1 }];
    case 'dipole':
      return [
        { x: W / 2 - 100, y: H / 2, q: q1 },
        { x: W / 2 + 100, y: H / 2, q: -q2 },
      ];
    case 'like':
      return [
        { x: W / 2 - 100, y: H / 2, q: q1 },
        { x: W / 2 + 100, y: H / 2, q: q2 },
      ];
    default:
      return [];
  }
}
function field(qs: Q[], x: number, y: number): [number, number] {
  let ex = 0;
  let ey = 0;
  for (const c of qs) {
    const dx = x - c.x;
    const dy = y - c.y;
    const r2 = dx * dx + dy * dy + 1;
    const r3 = r2 * Math.sqrt(r2);
    ex += (c.q * dx) / r3;
    ey += (c.q * dy) / r3;
  }
  return [ex, ey];
}
function traceLines(qs: Q[]): string[] {
  const lines: string[] = [];
  const pos = qs.filter((c) => c.q > 0);
  const sources = pos.length ? pos : qs; // all-negative: trace backwards from negatives
  const dirSign = pos.length ? 1 : -1;
  for (const c of sources) {
    const n = Math.round(10 * Math.abs(c.q));
    for (let i = 0; i < n; i++) {
      const a = (2 * Math.PI * (i + 0.5)) / n;
      let x = c.x + 14 * Math.cos(a);
      let y = c.y + 14 * Math.sin(a);
      let d = `M${x.toFixed(1)},${y.toFixed(1)}`;
      for (let k = 0; k < 400; k++) {
        const [ex, ey] = field(qs, x, y);
        const m = Math.hypot(ex, ey) || 1;
        const hx = x + (dirSign * 2 * ex) / m;
        const hy = y + (dirSign * 2 * ey) / m;
        const [ex2, ey2] = field(qs, hx, hy);
        const m2 = Math.hypot(ex2, ey2) || 1;
        x += (dirSign * 4 * ex2) / m2;
        y += (dirSign * 4 * ey2) / m2;
        if (x < -20 || x > W + 20 || y < -20 || y > H + 20) break;
        if (qs.some((o) => o !== c && Math.hypot(x - o.x, y - o.y) < 10)) break;
        d += ` L${x.toFixed(1)},${y.toFixed(1)}`;
      }
      lines.push(d);
    }
  }
  return lines;
}

const AXES: { label: string; v: Vec3; tex: string }[] = [
  { label: '+x (right)', v: [1, 0, 0], tex: '+\\hat x' },
  { label: '−x (left)', v: [-1, 0, 0], tex: '-\\hat x' },
  { label: '+y (up the page)', v: [0, 1, 0], tex: '+\\hat y' },
  { label: '−y (down the page)', v: [0, -1, 0], tex: '-\\hat y' },
  { label: 'into the page (⊗)', v: [0, 0, -1], tex: '\\otimes' },
  { label: 'out of the page (⊙)', v: [0, 0, 1], tex: '\\odot' },
];

export default function FieldLab({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('field-lab', DEFAULTS);
  const [probe, setProbe] = useState<{ x: number; y: number } | null>({ x: W / 2, y: H / 2 - 80 });
  const [playing, setPlaying] = useState(true);
  const [pt, setPt] = useState<{ pos: Vec3; vel: Vec3; trail: [number, number][] } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const P = PARTICLES[s.particle];
  const q = P.q * s.qMult;
  const v0 = s.v * P.vUnit;

  const charges = useMemo(() => chargesFor(s.preset, s.q1, s.q2), [s.preset, s.q1, s.q2]);
  const lines = useMemo(() => (s.preset === 'plates' ? [] : traceLines(charges)), [charges, s.preset]);

  /* -------- uniform E between plates (analytic) -------- */
  const plates = { L: 0.1, d: 0.04 };
  const E = s.V / plates.d;
  const aE = (q * E) / P.m; // +ve = towards the + plate? Field points from top(+) to bottom(−): y-down; take +y up.
  // Field E points DOWN (top plate positive). Force on q: F_y = −qE (upwards positive).
  const ay = (-q * E) / P.m;
  const tPlates = plates.L / v0;
  const yExit = 0.5 * ay * tPlates * tPlates;
  const hits = Math.abs(yExit) > plates.d / 2;
  const tHit = hits ? Math.sqrt((plates.d / 2) / Math.abs(ay)) : tPlates;

  /* -------- uniform B (Boris integration, scaled region) -------- */
  const B = (s.BmT * 1e-3) * (s.Bout ? 1 : -1); // z component: out of page positive
  const pitch = (s.pitchAngle * Math.PI) / 180;
  const vPerp = v0 * Math.sin(pitch);
  const vPar = v0 * Math.cos(pitch);
  const rB = (P.m * vPerp) / (Math.abs(q) * Math.abs(B));
  const TB = (2 * Math.PI * P.m) / (Math.abs(q) * Math.abs(B));
  // region size: fixed per particle using default parameters so radius changes are visible
  const regionM = useMemo(() => {
    const rDef = (P.m * 8 * P.vUnit) / (Math.abs(P.q) * 1e-3);
    return rDef * 2.2;
  }, [P]);

  /* -------- crossed fields -------- */
  const Ecr = s.Ecross * 1e4 * (s.particle === 'electron' || s.particle === 'positron' ? 1 : 0.1);
  const Bcr = 1e-3 * (s.particle === 'electron' || s.particle === 'positron' ? 2 : 2);
  const vSel = Ecr / Bcr;

  const startParticle = () => {
    if (s.tab === 'B') setPt({ pos: [0, 0, 0], vel: [vPerp, 0, vPar], trail: [] });
    else if (s.tab === 'cross') setPt({ pos: [0, 0, 0], vel: [v0, 0, 0], trail: [] });
  };
  const key = `${s.tab}-${s.particle}-${s.qMult}-${s.v}-${s.BmT}-${s.Bout}-${s.pitchAngle}-${s.Ecross}`;
  const lastKey = useRef('');
  if (lastKey.current !== key) {
    lastKey.current = key;
    if (s.tab === 'B') setPt({ pos: [0, 0, 0], vel: [vPerp, 0, vPar], trail: [] });
    else if (s.tab === 'cross') setPt({ pos: [0, 0, 0], vel: [v0, 0, 0], trail: [] });
    else setPt(null);
  }

  useAnimationFrame(
    (dt) => {
      if (!pt) return;
      const span = s.tab === 'B' ? TB : 0.2 / Math.max(v0, 1);
      const simDt = (dt * span) / (s.tab === 'B' ? 3 : 2);
      const n = 40;
      let { pos, vel } = pt;
      const Ef: Vec3 = s.tab === 'cross' ? [0, -Ecr, 0] : [0, 0, 0];
      const Bf: Vec3 = s.tab === 'cross' ? [0, 0, -Bcr] : [0, 0, B];
      for (let i = 0; i < n; i++) ({ pos, vel } = borisStep(pos, vel, q / P.m, Ef, Bf, simDt / n));
      const trail = [...pt.trail, [pos[0], pos[1]] as [number, number]].slice(-800);
      const out = s.tab === 'B' ? Math.hypot(pos[0], pos[1]) > regionM * 2.6 : pos[0] > 0.2 || Math.abs(pos[1]) > 0.05;
      setPt(out ? { pos: [0, 0, 0], vel: s.tab === 'B' ? [vPerp, 0, vPar] : [v0, 0, 0], trail: [] } : { pos, vel, trail });
    },
    playing && (s.tab === 'B' || s.tab === 'cross'),
    ref,
  );

  /* -------- force direction explorer -------- */
  const vD = AXES[s.vDir].v;
  const bD = AXES[s.bDir].v;
  const fD = cross(vD, bD).map((x) => x * s.sign) as Vec3;
  const fIdx = AXES.findIndex((a) => a.v.every((x, i) => Math.abs(x - fD[i]) < 1e-9));

  const particleSelect = (
    <Select label="Particle" value={s.particle} onChange={(particle) => set({ particle })} options={Object.entries(PARTICLES).map(([k, v]) => ({ value: k as PKey, label: v.name }))} />
  );

  const visual = () => {
    if (s.tab === 'efield') {
      const [ex, ey] = probe ? field(charges, probe.x, probe.y) : [0, 0];
      const mag = Math.hypot(ex, ey);
      return (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full cursor-crosshair"
          role="img"
          aria-label="Electric field lines around point charges; click to place a positive test charge"
          onClick={(e) => {
            const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
            setProbe({ x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H });
          }}
        >
          {s.preset === 'plates' ? (
            <g>
              <rect x={80} y={70} width={400} height={10} className="fill-bad" />
              <rect x={80} y={280} width={400} height={10} className="fill-m5" />
              <Label x={490} y={80} size={14} weight={700} className="fill-bad">+</Label>
              <Label x={490} y={290} size={14} weight={700} className="fill-m5">−</Label>
              {Array.from({ length: 9 }, (_, i) => (
                <Arrow key={i} x1={110 + i * 42} y1={84} x2={110 + i * 42} y2={276} className="text-accent/70" width={1.3} head={7} />
              ))}
              <Label x={20} y={H - 12} className="fill-muted" size={11}>
                Uniform field: equally spaced, parallel lines from + to −. E = V/d everywhere between the plates.
              </Label>
            </g>
          ) : (
            <g>
              {lines.map((d, i) => (
                <path key={i} d={d} fill="none" className="stroke-accent/60" strokeWidth={1.2} />
              ))}
              {charges.map((c, i) => (
                <g key={i}>
                  <circle cx={c.x} cy={c.y} r={13} className={c.q > 0 ? 'fill-bad' : 'fill-m5'} />
                  <Label x={c.x} y={c.y + 5} anchor="middle" size={16} weight={700} className="fill-white">
                    {c.q > 0 ? '+' : '−'}
                  </Label>
                </g>
              ))}
              <Label x={12} y={H - 12} className="fill-muted" size={11}>
                Lines start on + and end on −; closer lines = stronger field. Click anywhere to place a +1 test charge.
              </Label>
            </g>
          )}
          {probe && s.preset !== 'plates' && mag > 0 && (
            <g>
              <circle cx={probe.x} cy={probe.y} r={5} className="fill-good" />
              <Arrow x1={probe.x} y1={probe.y} x2={probe.x + (ex / mag) * Math.min(70, 8 + 3e5 * mag)} y2={probe.y + (ey / mag) * Math.min(70, 8 + 3e5 * mag)} className="text-good" label="F on +q" />
              <Arrow x1={probe.x} y1={probe.y} x2={probe.x - (ex / mag) * Math.min(50, 8 + 2e5 * mag)} y2={probe.y - (ey / mag) * Math.min(50, 8 + 2e5 * mag)} className="text-m6" label="F on −q" dashed labelOffset={[-50, 14]} />
            </g>
          )}
          {probe && s.preset === 'plates' && (
            <g>
              <circle cx={probe.x} cy={probe.y} r={5} className="fill-good" />
              <Arrow x1={probe.x} y1={probe.y} x2={probe.x} y2={probe.y + 40} className="text-good" label="F on +q" />
              <Arrow x1={probe.x} y1={probe.y} x2={probe.x} y2={probe.y - 40} className="text-m6" label="F on −q" dashed />
            </g>
          )}
        </svg>
      );
    }
    if (s.tab === 'E') {
      const sx = (W - 120) / plates.L;
      const sy = 220 / plates.d;
      const X0 = 60;
      const Y0 = H / 2;
      const pts = Array.from({ length: 60 }, (_, i) => {
        const t = (i / 59) * tHit;
        return `${i ? 'L' : 'M'}${(X0 + v0 * t * sx).toFixed(1)},${(Y0 - 0.5 * ay * t * t * sy).toFixed(1)}`;
      }).join(' ');
      const after = !hits
        ? `M${X0 + plates.L * sx},${Y0 - yExit * sy} L${X0 + plates.L * sx + 60},${Y0 - (yExit + ay * tPlates * (60 / sx / v0)) * sy}`
        : '';
      const exitX = X0 + v0 * tHit * sx;
      const exitY = Y0 - 0.5 * ay * tHit * tHit * sy;
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Charged particle deflected between parallel plates">
          <rect x={X0} y={Y0 - 110 - 8} width={plates.L * sx} height={8} className="fill-bad" />
          <rect x={X0} y={Y0 + 110} width={plates.L * sx} height={8} className="fill-m5" />
          <Label x={X0 + plates.L * sx + 6} y={Y0 - 110} size={13} weight={700} className="fill-bad">+{s.V} V</Label>
          <Label x={X0 + plates.L * sx + 6} y={Y0 + 120} size={13} weight={700} className="fill-m5">0 V</Label>
          {Array.from({ length: 8 }, (_, i) => (
            <Arrow key={i} x1={X0 + 20 + i * 55} y1={Y0 - 106} x2={X0 + 20 + i * 55} y2={Y0 + 106} className="text-accent/30" width={1} head={6} />
          ))}
          <Label x={X0 + 4} y={Y0 - 92} className="fill-accent" size={11}>E (down)</Label>
          <path d={pts + ' ' + after} fill="none" className="stroke-m7" strokeWidth={2.5} />
          <circle cx={exitX} cy={exitY} r={6} className={q < 0 ? 'fill-m5' : 'fill-bad'} />
          <Arrow x1={exitX} y1={exitY} x2={exitX} y2={exitY - Math.sign(ay) * 40} className="text-good" label="F = qE" />
          <Label x={12} y={22} size={12} weight={600} className={hits ? 'fill-bad' : 'fill-good'}>
            {hits ? `Hits the ${ay > 0 ? 'positive (top)' : 'negative (bottom)'} plate after ${(v0 * tHit * 100).toFixed(1)} cm` : `Exits deflected ${(yExit * 1000).toFixed(1)} mm ${yExit > 0 ? 'up' : 'down'}`}
          </Label>
          <Label x={12} y={H - 10} className="fill-muted" size={11}>
            Parabolic path — like a projectile, but the “gravity” here is qE/m = {Math.abs(aE).toExponential(2)} m s⁻² (≈ {(Math.abs(aE) / 9.8).toExponential(1)} g).
          </Label>
        </svg>
      );
    }
    if (s.tab === 'B') {
      const k = 150 / regionM;
      const cx = 140;
      const cy = H / 2 + 20;
      const path = pt?.trail.map((p, i) => `${i ? 'L' : 'M'}${(cx + p[0] * k).toFixed(1)},${(cy - p[1] * k).toFixed(1)}`).join(' ') ?? '';
      const pos = pt?.pos ?? [0, 0, 0];
      const vel = pt?.vel ?? [vPerp, 0, vPar];
      const F = cross(vel, [0, 0, B]).map((x) => x * q) as Vec3;
      const fm = Math.hypot(F[0], F[1]) || 1;
      const vm = Math.hypot(vel[0], vel[1]) || 1;
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Charged particle moving in a uniform magnetic field">
          <FieldGrid x={0} y={0} w={W} h={H} into={!s.Bout} step={40} />
          <path d={path} fill="none" className="stroke-m7" strokeWidth={2.5} />
          <circle cx={cx + pos[0] * k} cy={cy - pos[1] * k} r={7} className={q < 0 ? 'fill-m5' : 'fill-bad'} />
          <Arrow x1={cx + pos[0] * k} y1={cy - pos[1] * k} x2={cx + pos[0] * k + (vel[0] / vm) * 45} y2={cy - pos[1] * k - (vel[1] / vm) * 45} className="text-accent" label="v" />
          <Arrow x1={cx + pos[0] * k} y1={cy - pos[1] * k} x2={cx + pos[0] * k + (F[0] / fm) * 45} y2={cy - pos[1] * k - (F[1] / fm) * 45} className="text-good" label="F" />
          <rect x={8} y={8} width={250} height={22} rx={6} className="fill-panel" opacity={0.85} />
          <Label x={16} y={24} size={12} weight={600}>
            B {s.Bout ? 'out of page (⊙)' : 'into page (⊗)'} · r = {(rB * 100).toPrecision(3)} cm
          </Label>
          {s.pitchAngle !== 90 && (
            <Label x={12} y={H - 26} className="fill-warn" size={11}>
              v has a component along B ({(vPar / 1e6).toFixed(2)} × 10⁶ m s⁻¹, into/out of the page): the 3D path is a helix; this view shows its circular projection.
            </Label>
          )}
          <Label x={12} y={H - 10} className="fill-muted" size={11}>
            Speed is constant: |v| = {(Math.hypot(...(pt?.vel ?? [v0, 0, 0])) / 1e6).toFixed(3)} × 10⁶ m s⁻¹ — the magnetic force does no work.
          </Label>
        </svg>
      );
    }
    if (s.tab === 'cross') {
      const sx = (W - 80) / 0.2;
      const sy = 120 / 0.05;
      const path = pt?.trail.map((p, i) => `${i ? 'L' : 'M'}${(40 + p[0] * sx).toFixed(1)},${(H / 2 - p[1] * sy).toFixed(1)}`).join(' ') ?? '';
      const ratio = v0 / vSel;
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Velocity selector: crossed electric and magnetic fields">
          <FieldGrid x={40} y={H / 2 - 120} w={W - 80} h={240} into step={36} />
          <rect x={40} y={H / 2 - 128} width={W - 80} height={8} className="fill-bad" />
          <rect x={40} y={H / 2 + 120} width={W - 80} height={8} className="fill-m5" />
          <line x1={20} y1={H / 2} x2={W - 20} y2={H / 2} className="stroke-muted" strokeDasharray="4 4" />
          <path d={path} fill="none" className="stroke-m7" strokeWidth={2.5} />
          <Label x={12} y={22} size={12} weight={600} className={Math.abs(ratio - 1) < 0.02 ? 'fill-good' : 'fill-warn'}>
            {Math.abs(ratio - 1) < 0.02 ? 'v = E/B: forces balance — undeflected' : ratio > 1 ? 'v > E/B: magnetic force wins' : 'v < E/B: electric force wins'}
          </Label>
          <Label x={12} y={H - 10} className="fill-muted" size={11}>
            E = {Ecr.toExponential(2)} V m⁻¹ (down), B = {(Bcr * 1e3).toFixed(1)} mT (into page) → selected speed E/B = {vSel.toExponential(3)} m s⁻¹
          </Label>
        </svg>
      );
    }
    // force direction explorer — oblique projection
    const O = { x: W / 2 - 40, y: H / 2 + 30 };
    const proj = (v: Vec3, L = 110) => ({ x: O.x + v[0] * L - v[2] * L * 0.45, y: O.y - v[1] * L + v[2] * L * 0.3 });
    const vEnd = proj(vD);
    const bEnd = proj(bD);
    const fEnd = proj(fD);
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="3D force direction explorer">
        {AXES.slice(0, 6).filter((_, i) => i % 2 === 0).map((a) => {
          const e = proj(a.v, 140);
          const e2 = proj(a.v.map((x) => -x) as Vec3, 140);
          return <line key={a.label} x1={e2.x} y1={e2.y} x2={e.x} y2={e.y} className="stroke-line" strokeDasharray="3 4" />;
        })}
        <Label x={proj([1, 0, 0], 150).x} y={proj([1, 0, 0], 150).y} size={10} className="fill-muted">+x</Label>
        <Label x={proj([0, 1, 0], 150).x} y={proj([0, 1, 0], 150).y} size={10} className="fill-muted">+y</Label>
        <Label x={proj([0, 0, 1], 150).x - 14} y={proj([0, 0, 1], 150).y + 4} size={10} className="fill-muted">out (+z)</Label>
        <Arrow x1={O.x} y1={O.y} x2={vEnd.x} y2={vEnd.y} className="text-accent" label="v" width={3} />
        <Arrow x1={O.x} y1={O.y} x2={bEnd.x} y2={bEnd.y} className="text-m6" label="B" width={3} />
        {fIdx >= 0 ? <Arrow x1={O.x} y1={O.y} x2={fEnd.x} y2={fEnd.y} className="text-good" label="F" width={3.5} /> : <Label x={O.x + 10} y={O.y + 20} className="fill-good" size={12} weight={600}>F = 0 (v ∥ B)</Label>}
        <circle cx={O.x} cy={O.y} r={8} className={s.sign > 0 ? 'fill-bad' : 'fill-m5'} />
        <Label x={O.x} y={O.y + 4} anchor="middle" size={12} weight={700} className="fill-white">{s.sign > 0 ? '+' : '−'}</Label>
        <Label x={12} y={H - 10} className="fill-muted" size={11}>
          F = q(v × B). For a negative charge the force is reversed. Oblique 3D view.
        </Label>
      </svg>
    );
  };

  return (
    <SimShell
      id="field-lab"
      compact={compact}
      onReset={() => {
        reset();
        setPt(null);
        lastKey.current = '';
      }}
      controls={
        <>
          <Tabs
            size="sm"
            value={s.tab}
            onChange={(tab) => set({ tab })}
            tabs={[
              { id: 'efield', label: 'E field lines' },
              { id: 'E', label: 'Uniform E' },
              { id: 'B', label: 'Uniform B' },
              { id: 'cross', label: 'E × B' },
              { id: 'dir', label: 'Force direction' },
            ]}
          />
          {s.tab === 'efield' && (
            <>
              <Select
                label="Arrangement"
                value={s.preset}
                onChange={(preset) => set({ preset })}
                options={[
                  { value: 'single+', label: 'Single positive charge' },
                  { value: 'single-', label: 'Single negative charge' },
                  { value: 'dipole', label: 'Dipole (+ and −)' },
                  { value: 'like', label: 'Two like charges (+ +)' },
                  { value: 'plates', label: 'Parallel plates' },
                ]}
              />
              {s.preset !== 'plates' && <Slider label="Charge 1 magnitude" value={s.q1} min={0.5} max={3} step={0.5} unit="units" onChange={(q1) => set({ q1 })} />}
              {(s.preset === 'dipole' || s.preset === 'like') && <Slider label="Charge 2 magnitude" value={s.q2} min={0.5} max={3} step={0.5} unit="units" onChange={(q2) => set({ q2 })} />}
            </>
          )}
          {(s.tab === 'E' || s.tab === 'B' || s.tab === 'cross') && (
            <>
              {(s.tab === 'B' || s.tab === 'cross') && <Playback playing={playing} setPlaying={setPlaying} onReset={startParticle} />}
              {particleSelect}
              <Slider label="Charge multiplier" value={s.qMult} min={1} max={3} step={1} unit={`× ${P.q > 0 ? '+' : '−'}e`} onChange={(qMult) => set({ qMult })} />
              <Slider label="Initial speed" tex="v" value={s.v} min={1} max={20} step={0.5} unit={P.vLabel} onChange={(v) => set({ v })} />
            </>
          )}
          {s.tab === 'E' && <Slider label="Plate p.d. (top +)" tex="V" value={s.V} min={0} max={500} step={5} unit="V" hint="Plates 10 cm long, 4.0 cm apart" onChange={(V) => set({ V })} />}
          {s.tab === 'B' && (
            <>
              <Slider label="Magnetic flux density" tex="B" value={s.BmT} min={0.2} max={5} step={0.1} unit="mT" onChange={(BmT) => set({ BmT })} />
              <Select label="B direction" value={s.Bout ? 'out' : 'in'} onChange={(v) => set({ Bout: v === 'out' })} options={[{ value: 'in', label: 'Into the page ⊗' }, { value: 'out', label: 'Out of the page ⊙' }]} />
              <Slider label="Angle between v and B" tex="\theta" value={s.pitchAngle} min={10} max={90} step={5} unit="°" onChange={(pitchAngle) => set({ pitchAngle })} />
            </>
          )}
          {s.tab === 'cross' && <Slider label="Electric field" tex="E" value={s.Ecross} min={0.5} max={5} step={0.1} unit={s.particle === 'electron' || s.particle === 'positron' ? '× 10⁴ V m⁻¹' : '× 10³ V m⁻¹'} onChange={(Ecross) => set({ Ecross })} />}
          {s.tab === 'dir' && (
            <>
              <Select label="Velocity direction" value={String(s.vDir)} onChange={(v) => set({ vDir: Number(v) })} options={AXES.map((a, i) => ({ value: String(i), label: a.label }))} />
              <Select label="Magnetic field direction" value={String(s.bDir)} onChange={(v) => set({ bDir: Number(v) })} options={AXES.map((a, i) => ({ value: String(i), label: a.label }))} />
              <Select label="Charge" value={String(s.sign)} onChange={(v) => set({ sign: Number(v) })} options={[{ value: '1', label: 'Positive (e.g. proton)' }, { value: '-1', label: 'Negative (e.g. electron)' }]} />
            </>
          )}
        </>
      }
      readouts={
        s.tab === 'E' ? (
          <>
            <Stat label="field" tex="E = V/d" value={E} unit="V m⁻¹" />
            <Stat label="force" tex="F = qE" value={Math.abs(q * E)} unit="N" />
            <Stat label="acceleration" tex="a" value={Math.abs(ay)} unit="m s⁻²" />
            <Stat label="time in field" value={tHit} unit="s" />
            <Stat label="vertical deflection" value={hits ? (Math.sign(ay) * plates.d) / 2 : yExit} unit="m" />
            <Stat label="KE gained = qEΔy" value={Math.abs(q * E * (hits ? plates.d / 2 : yExit))} unit="J" />
          </>
        ) : s.tab === 'B' ? (
          <>
            <Stat label="force" tex="qvB\sin\theta" value={Math.abs(q) * v0 * Math.abs(B) * Math.sin(pitch)} unit="N" />
            <Stat label="radius" tex="r = mv_\perp/qB" value={rB} unit="m" />
            <Stat label="period" tex="T = 2\pi m/qB" value={TB} unit="s" />
            <Stat label="kinetic energy (constant)" value={0.5 * P.m * v0 * v0} unit="J" />
          </>
        ) : s.tab === 'cross' ? (
          <>
            <Stat label="electric force qE" value={Math.abs(q * Ecr)} unit="N" />
            <Stat label="magnetic force qvB" value={Math.abs(q * v0 * Bcr)} unit="N" />
            <Stat label="selected speed E/B" value={vSel} unit="m s⁻¹" tone="text-accent" />
            <Stat label="your speed" value={v0} unit="m s⁻¹" />
          </>
        ) : s.tab === 'dir' ? (
          <>
            <Stat label="force direction" value={fIdx >= 0 ? AXES[fIdx].label : 'none — v ∥ B'} tone="text-good" />
          </>
        ) : undefined
      }
      below={
        s.tab === 'dir' ? (
          <div className="grid gap-3 md:grid-cols-2">
            <Callout kind="tip" title="Right-hand palm rule (positive charge / conventional current)">
              Fingers point along B, thumb along v (or I). Your palm pushes in the direction of F. For a negative charge (electron), the force is in the opposite direction — use the rule then reverse it.
            </Callout>
            <Callout kind="info" title="Cross product">
              <Tex>{'\\vec F = q\\,\\vec v \\times \\vec B'}</Tex> — F is perpendicular to both v and B; magnitude qvB sin θ.
            </Callout>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            <Callout kind="info" title="Electric vs magnetic forces">
              Electric: acts on stationary and moving charges, along E (opposite for −), can change speed (does work). Magnetic: acts only on moving charges, perpendicular to v and B, never changes speed (no work).
            </Callout>
            <Callout kind="warn" title="Conventional current vs electron flow">
              Field and force rules are stated for positive charges / conventional current. Electrons move opposite to conventional current and experience the opposite force.
            </Callout>
          </div>
        )
      }
      formulas={['E = \\dfrac{V}{d},\\ F = qE,\\ W = qV', 'F = qvB\\sin\\theta', 'r = \\dfrac{mv}{qB}', 'v = \\dfrac{E}{B}\\ \\text{(velocity selector)}']}
      explanation={
        <>
          <p>Between parallel plates, a charge feels a constant force qE — it follows a parabola, just like a projectile. Negative charges accelerate towards the positive plate, opposite to E.</p>
          <p>In a magnetic field the force is always perpendicular to the velocity, so the particle moves in a circle of radius mv/(qB) at constant speed. Opposite charges curve in opposite senses.</p>
        </>
      }
      prediction={{
        q: 'An electron and a proton enter the same magnetic field with the same speed. Which curves more tightly?',
        options: ['The proton', 'The electron', 'Same radius, opposite directions', 'Neither curves'],
        answer: 1,
        explain: 'r = mv/(qB): the electron’s mass is ~1836 times smaller, so its radius is ~1836 times smaller — and it curves the opposite way.',
      }}
      assumptions={['Uniform fields with sharp edges; edge effects ignored.', 'Non-relativistic speeds; gravity negligible.', 'Field-line tab uses a 2D Coulomb model (charges in arbitrary units).']}
      limitations={['Field-line density is approximate in 2D.', 'B-field region size is fixed per particle type so radius changes are visible; values shown are exact for the stated inputs.', 'Velocity-selector values are illustrative magnitudes.']}
    >
      <div ref={ref}>{visual()}</div>
    </SimShell>
  );
}


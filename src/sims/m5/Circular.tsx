import { useMemo, useRef, useState } from 'react';
import { SimShell, Playback, GraphCard } from '@/components/SimShell';
import { Slider, Stat, Tabs, Toggle, Callout } from '@/components/ui';
import { Graph, sample } from '@/components/Graph';
import { Arrow, Label } from '@/components/svg';
import { useAnimationFrame } from '@/lib/hooks';
import { useSimSettings } from '@/lib/store';
import { circular, bankedForces, bankedDesignSpeed, conicalPendulum, flatBendMaxSpeed } from '@/lib/physics/mechanics';
import { C } from '@/lib/physics/constants';

type Mode = 'ucm' | 'bend' | 'string' | 'banked';
const DEFAULTS = { mode: 'ucm' as Mode, m: 2, v: 4, r: 2, useOmega: false, w: 2, mu: 0.6, bank: 20, Ls: 1.2, angle: 35, vectors: true };
const W = 560;
const H = 360;

export default function CircularSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('circular', DEFAULTS);
  const [phi, setPhi] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const ref = useRef<HTMLDivElement>(null);

  const v = s.useOmega ? s.w * s.r : s.v;
  const c = useMemo(() => circular(s.m, v, s.r), [s.m, v, s.r]);
  // flat-bend: car leaves the circle if required friction exceeds μmg
  const vmaxFlat = flatBendMaxSpeed(s.mu, s.r);
  const skid = s.mode === 'bend' && v > vmaxFlat;
  const [skidPos, setSkidPos] = useState<{ x: number; y: number; vx: number; vy: number } | null>(null);

  const cone = conicalPendulum(s.m, s.Ls, s.angle);
  const omega = s.mode === 'string' ? cone.v / cone.r : c.omega;

  useAnimationFrame(
    (dt) => {
      const d = dt * speed;
      if (skid) {
        setSkidPos((p) => {
          if (!p) {
            const x = s.r * Math.cos(phi);
            const y = s.r * Math.sin(phi);
            return { x, y, vx: -v * Math.sin(phi), vy: v * Math.cos(phi) };
          }
          const nx = p.x + p.vx * d;
          const ny = p.y + p.vy * d;
          if (Math.hypot(nx, ny) > s.r * 2.2) return null; // restart lap
          return { ...p, x: nx, y: ny };
        });
        if (skidPos === null) setPhi((p) => p + omega * d);
      } else {
        setPhi((p) => (p + omega * d) % (2 * Math.PI * 1000));
      }
    },
    playing,
    ref,
  );

  const data = useMemo(() => sample((vv) => ({ F: (s.m * vv * vv) / s.r }), 0, Math.max(10, v * 1.5), 100, 'v'), [s.m, s.r, v]);
  const dataR = useMemo(() => sample((rr) => ({ F: (s.m * v * v) / rr }), 0.5, 10, 100, 'r'), [s.m, v]);

  const banked = bankedForces(s.m * 500, v, s.r * 10, s.bank); // car scale for banked
  const vDesign = bankedDesignSpeed(s.r * 10, s.bank);

  // ---------- top-view geometry ----------
  const cx = W / 2;
  const cy = H / 2;
  const R = 130;
  const px = cx + R * Math.cos(phi);
  const py = cy - R * Math.sin(phi);
  const tx = -Math.sin(phi);
  const ty = -Math.cos(phi); // screen coords (y down)
  const vLen = Math.min(110, 18 * v);
  const aLen = Math.min(110, 8 * c.ac);

  const topView = (label: string, forceLabel: string) => (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Top view of an object in uniform circular motion">
      <circle cx={cx} cy={cy} r={R} fill="none" className="stroke-line" strokeWidth={s.mode === 'bend' ? 34 : 1.5} strokeOpacity={s.mode === 'bend' ? 0.5 : 1} />
      <circle cx={cx} cy={cy} r={3} className="fill-muted" />
      <line x1={cx} y1={cy} x2={px} y2={py} className="stroke-muted" strokeDasharray="4 4" />
      <Label x={(cx + px) / 2 + 6} y={(cy + py) / 2 - 6} className="fill-muted" size={11}>
        r = {s.r} m
      </Label>
      {skid && skidPos ? (
        <g>
          <circle cx={cx + (skidPos.x / s.r) * R} cy={cy - (skidPos.y / s.r) * R} r={11} className="fill-bad" />
          <Label x={12} y={22} className="fill-bad" size={13} weight={700}>
            Skid! Needs {c.Fc.toFixed(0)} N but max friction μmg = {(s.mu * s.m * C.g).toFixed(0)} N → leaves along a tangent
          </Label>
        </g>
      ) : (
        <g>
          {s.mode === 'bend' ? <rect x={px - 13} y={py - 8} width={26} height={16} rx={4} className="fill-m5" transform={`rotate(${(-phi * 180) / Math.PI + 90} ${px} ${py})`} /> : <circle cx={px} cy={py} r={11} className="fill-m5" />}
          {s.vectors && (
            <>
              <Arrow x1={px} y1={py} x2={px + tx * vLen} y2={py + ty * vLen} className="text-accent" label="v" width={2.5} title="tangential velocity" />
              <Arrow x1={px} y1={py} x2={px + ((cx - px) / R) * aLen} y2={py + ((cy - py) / R) * aLen} className="text-bad" label={forceLabel} width={2.5} labelOffset={[6, 14]} title="net inward (centripetal) force and acceleration" />
            </>
          )}
        </g>
      )}
      <Label x={12} y={H - 12} className="fill-muted" size={11}>
        {label}
      </Label>
    </svg>
  );

  const stringView = () => {
    const ox = W / 2;
    const oy = 50;
    const Lpx = 220;
    const th = (s.angle * Math.PI) / 180;
    const rpx = Lpx * Math.sin(th);
    const hpx = Lpx * Math.cos(th);
    const bx = ox + rpx * Math.cos(phi);
    const by = oy + hpx + 0.28 * rpx * Math.sin(phi);
    const T = cone.tension;
    const sc = 60 / Math.max(T, s.m * C.g);
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Conical pendulum: mass on a string moving in a horizontal circle">
        <line x1={ox - 60} y1={oy} x2={ox + 60} y2={oy} className="stroke-ink" strokeWidth={3} />
        <ellipse cx={ox} cy={oy + hpx} rx={rpx} ry={0.28 * rpx} fill="none" className="stroke-line" strokeDasharray="4 4" />
        <line x1={ox} y1={oy} x2={ox} y2={oy + hpx} className="stroke-muted" strokeDasharray="3 3" />
        <line x1={ox} y1={oy} x2={bx} y2={by} className="stroke-ink" strokeWidth={1.5} />
        <circle cx={bx} cy={by} r={11} className="fill-m5" />
        {s.vectors && (
          <>
            <Arrow x1={bx} y1={by} x2={bx + ((ox - bx) / Math.hypot(ox - bx, oy - by)) * T * sc} y2={by + ((oy - by) / Math.hypot(ox - bx, oy - by)) * T * sc} className="text-m6" label="T" />
            <Arrow x1={bx} y1={by} x2={bx} y2={by + s.m * C.g * sc} className="text-m7" label="mg" labelOffset={[6, 12]} />
            <Arrow x1={bx} y1={by} x2={bx + Math.sign(ox - bx) * cone.Fc * sc} y2={by} className="text-bad" label="F_net" dashed labelOffset={[-10, -10]} />
          </>
        )}
        <Label x={ox + 8} y={oy + 40} className="fill-muted" size={11}>
          θ = {s.angle}°
        </Label>
        <Label x={12} y={H - 30} className="fill-muted" size={11}>
          Vertical: T cos θ = mg (balanced). Horizontal: T sin θ = mv²/r provides the centripetal force.
        </Label>
        <Label x={12} y={H - 12} className="fill-muted" size={11}>
          Side view (perspective). Tension T = {T.toFixed(1)} N, r = {cone.r.toFixed(2)} m, v = {cone.v.toFixed(2)} m s⁻¹.
        </Label>
      </svg>
    );
  };

  const bankView = () => {
    const th = (s.bank * Math.PI) / 180;
    const cx2 = W / 2;
    const cy2 = 230;
    const car = { x: cx2, y: cy2 };
    const n = { x: -Math.sin(th), y: -Math.cos(th) }; // normal direction (screen)
    const down = { x: -Math.cos(th), y: Math.sin(th) }; // down-slope (towards centre on left)
    const sc = 90 / (s.m * 500 * C.g);
    const f = banked.f; // positive = down the slope
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Cross-section of a car on a banked track with force vectors">
        <polygon points={`${cx2 - 230 * Math.cos(th)},${cy2 + 230 * Math.sin(th) + 12} ${cx2 + 230 * Math.cos(th)},${cy2 - 230 * Math.sin(th) + 12} ${cx2 + 230 * Math.cos(th)},${H} ${cx2 - 230 * Math.cos(th)},${H}`} className="fill-line" opacity={0.6} />
        <g transform={`rotate(${-s.bank} ${car.x} ${car.y})`}>
          <rect x={car.x - 40} y={car.y - 18} width={80} height={26} rx={6} className="fill-m5" />
          <circle cx={car.x - 24} cy={car.y + 10} r={8} className="fill-ink" />
          <circle cx={car.x + 24} cy={car.y + 10} r={8} className="fill-ink" />
        </g>
        <Arrow x1={30} y1={60} x2={110} y2={60} className="text-bad" label="towards centre" labelOffset={[-90, -8]} dashed />
        <Arrow x1={110} y1={60} x2={30} y2={60} className="text-bad" />
        {s.vectors && (
          <>
            <Arrow x1={car.x} y1={car.y} x2={car.x + n.x * banked.N * sc} y2={car.y + n.y * banked.N * sc} className="text-m6" label="N" />
            <Arrow x1={car.x} y1={car.y} x2={car.x} y2={car.y + s.m * 500 * C.g * sc} className="text-m7" label="mg" labelOffset={[6, 14]} />
            {Math.abs(f) > 1 && (
              <Arrow x1={car.x} y1={car.y + 4} x2={car.x + down.x * f * sc} y2={car.y + 4 + down.y * f * sc} className="text-good" label={f > 0 ? 'f (down slope)' : 'f (up slope)'} labelOffset={[-40, 18]} />
            )}
            <Arrow x1={car.x} y1={car.y - 60} x2={car.x - banked.Fc * sc} y2={car.y - 60} className="text-bad" label="F_net = mv²/r" dashed labelOffset={[-60, -8]} />
          </>
        )}
        <Label x={12} y={H - 30} className="fill-muted" size={11}>
          Design speed for θ = {s.bank}°, r = {s.r * 10} m: v = √(rg tan θ) = {vDesign.toFixed(1)} m s⁻¹. You: {v.toFixed(1)} m s⁻¹.
        </Label>
        <Label x={12} y={H - 12} className="fill-muted" size={11}>
          {Math.abs(v - vDesign) < 0.3 ? 'At the design speed: no friction needed — N sin θ alone provides F_c.' : v > vDesign ? 'Faster than design speed: friction acts DOWN the slope.' : 'Slower than design speed: friction acts UP the slope.'}
        </Label>
      </svg>
    );
  };

  return (
    <SimShell
      id="circular"
      compact={compact}
      onReset={() => {
        reset();
        setPhi(0);
        setSkidPos(null);
      }}
      toolbar={null}
      controls={
        <>
          <Tabs
            size="sm"
            value={s.mode}
            onChange={(m) => {
              set({ mode: m });
              setSkidPos(null);
            }}
            tabs={[
              { id: 'ucm', label: 'Uniform' },
              { id: 'bend', label: 'Flat bend' },
              { id: 'string', label: 'String' },
              { id: 'banked', label: 'Banked' },
            ]}
          />
          <Playback playing={playing} setPlaying={setPlaying} speed={speed} setSpeed={setSpeed} />
          {s.mode !== 'string' && (
            <>
              <Slider label="Mass" tex="m" value={s.m} min={0.1} max={10} step={0.1} unit={s.mode === 'banked' ? '(× 500 kg)' : 'kg'} onChange={(v2) => set({ m: v2 })} />
              <Toggle label="Control by angular velocity ω" checked={s.useOmega} onChange={(b) => set({ useOmega: b })} />
              {s.useOmega ? (
                <Slider label="Angular velocity" tex="\omega" value={s.w} min={0.2} max={8} step={0.1} unit="rad s⁻¹" onChange={(w) => set({ w })} />
              ) : (
                <Slider label="Speed" tex="v" value={s.v} min={0.5} max={s.mode === 'banked' ? 40 : 15} step={0.5} unit="m s⁻¹" onChange={(v2) => { set({ v: v2 }); setSkidPos(null); }} />
              )}
              <Slider label="Radius" tex="r" value={s.r} min={0.5} max={10} step={0.5} unit={s.mode === 'banked' ? '(× 10 m)' : 'm'} onChange={(r) => { set({ r }); setSkidPos(null); }} />
            </>
          )}
          {s.mode === 'bend' && <Slider label="Coefficient of friction" tex="\mu" value={s.mu} min={0.05} max={1} step={0.05} onChange={(mu) => { set({ mu }); setSkidPos(null); }} />}
          {s.mode === 'banked' && <Slider label="Bank angle" tex="\theta" value={s.bank} min={0} max={45} step={1} unit="°" onChange={(bank) => set({ bank })} />}
          {s.mode === 'string' && (
            <>
              <Slider label="Mass" tex="m" value={s.m} min={0.1} max={5} step={0.1} unit="kg" onChange={(m) => set({ m })} />
              <Slider label="String length" tex="L" value={s.Ls} min={0.3} max={2} step={0.1} unit="m" onChange={(Ls) => set({ Ls })} />
              <Slider label="String angle from vertical" tex="\theta" value={s.angle} min={5} max={75} step={1} unit="°" onChange={(angle) => set({ angle })} />
            </>
          )}
          <Toggle label="Show vectors" checked={s.vectors} onChange={(b) => set({ vectors: b })} />
        </>
      }
      readouts={
        s.mode === 'string' ? (
          <>
            <Stat label="tension" tex="T" value={cone.tension} unit="N" />
            <Stat label="radius" tex="r" value={cone.r} unit="m" />
            <Stat label="speed" tex="v" value={cone.v} unit="m s⁻¹" />
            <Stat label="period" tex="T_p" value={cone.period} unit="s" />
            <Stat label="net inward force" tex="F_c" value={cone.Fc} unit="N" tone="text-bad" />
          </>
        ) : (
          <>
            <Stat label="speed" tex="v" value={v} unit="m s⁻¹" />
            <Stat label="angular velocity" tex="\omega" value={c.omega} unit="rad s⁻¹" />
            <Stat label="period" tex="T" value={c.T} unit="s" />
            <Stat label="frequency" tex="f" value={c.f} unit="Hz" />
            <Stat label="centripetal accel." tex="a_c" value={c.ac} unit="m s⁻²" />
            <Stat label="net inward force" tex="F_c" value={s.mode === 'banked' ? banked.Fc : c.Fc} unit="N" tone="text-bad" />
            {s.mode === 'bend' && <Stat label="max friction μmg" value={s.mu * s.m * C.g} unit="N" tone={skid ? 'text-bad' : 'text-good'} />}
            {s.mode === 'bend' && <Stat label="max speed √(μgr)" value={vmaxFlat} unit="m s⁻¹" />}
            {s.mode === 'banked' && <Stat label="design speed" value={vDesign} unit="m s⁻¹" />}
            {s.mode === 'banked' && <Stat label="friction needed" value={banked.f} unit="N" />}
          </>
        )
      }
      graphs={
        s.mode !== 'string' ? (
          <>
            <GraphCard title="F_c against speed (r, m fixed)" note="Parabola: doubling v quadruples F_c. A graph of F_c vs v² is a straight line of gradient m/r.">
              <Graph data={data} xKey="v" xLabel="v (m s⁻¹)" yLabel="F_c (N)" series={[{ key: 'F', label: 'F_c' }]} dots={[{ x: v, y: c.Fc }]} height={200} />
            </GraphCard>
            <GraphCard title="F_c against radius (v, m fixed)" note="Inverse relationship: doubling r halves F_c.">
              <Graph data={dataR} xKey="r" xLabel="r (m)" yLabel="F_c (N)" series={[{ key: 'F', label: 'F_c' }]} dots={[{ x: s.r, y: c.Fc }]} height={200} />
            </GraphCard>
          </>
        ) : undefined
      }
      below={
        <Callout kind="tip" title="Work and energy">
          The net inward force is always perpendicular to the velocity, so it does no work (W = Fs cos 90° = 0). Kinetic energy ½mv² = {(0.5 * s.m * v * v).toFixed(2)} J stays constant.
        </Callout>
      }
      formulas={['a_c = \\dfrac{v^2}{r}', 'F_c = \\dfrac{mv^2}{r}', 'v = \\dfrac{2\\pi r}{T}', '\\omega = \\dfrac{\\Delta\\theta}{t},\\ v = \\omega r', '\\tan\\theta = \\dfrac{v^2}{rg}']}
      explanation={
        <>
          <p>The velocity is tangential; the net force and acceleration point to the centre. “Centripetal force” is the name for that resultant — supplied by friction (flat bend), tension (string) or the normal force’s horizontal component (banked track).</p>
          <p>If the available inward force is too small (e.g. friction on an icy bend), the object cannot follow the circle and moves off along a tangent — not outwards.</p>
        </>
      }
      prediction={{
        q: 'A car on a flat bend doubles its speed. How much more friction does it need?',
        options: ['The same', 'Twice as much', 'Four times as much', 'Half as much'],
        answer: 2,
        explain: 'F_c ∝ v², so doubling v quadruples the required friction — why speed limits on bends matter.',
      }}
      assumptions={['Uniform circular motion (constant speed).', 'Objects treated as point masses.', 'Flat bend: friction is the only horizontal force; banked track: friction only when away from design speed.', 'Conical pendulum: massless, inextensible string; no air resistance.']}
      limitations={['Real tyres can slip partially (kinetic vs static friction).', 'The banked-track diagram uses a 500 kg × m car scale and r × 10 m to give realistic road values.', 'Vertical circles (non-uniform motion) are not modelled.']}
    >
      <div ref={ref}>
        {s.mode === 'ucm' && topView('Top view. v is tangential; the net force (and a_c) points to the centre.', 'F_c, a_c')}
        {s.mode === 'bend' && topView('Top view of a car on a flat horizontal bend. Friction provides F_c.', 'f = F_c')}
        {s.mode === 'string' && stringView()}
        {s.mode === 'banked' && bankView()}
      </div>
    </SimShell>
  );
}

import { useRef, useState } from 'react';
import { SimShell, Playback } from '@/components/SimShell';
import { Slider, Stat, Tabs, Callout } from '@/components/ui';
import { Arrow, Label } from '@/components/svg';
import { useAnimationFrame } from '@/lib/hooks';
import { useSimSettings } from '@/lib/store';
import { torque } from '@/lib/physics/mechanics';
import { C } from '@/lib/physics/constants';

const DEFAULTS = { tab: 'spanner' as 'spanner' | 'seesaw', r: 0.3, F: 40, angle: 90, m1: 3, d1: 1.2, m2: 2, d2: 1.5 };
const W = 560;
const H = 320;

export default function TorqueSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('torque', DEFAULTS);
  const [rot, setRot] = useState(0);
  const [omega, setOmega] = useState(0);
  const [tilt, setTilt] = useState(0);
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const tau = torque(s.r, s.F, s.angle);
  const tauCW = s.m2 * C.g * s.d2; // right side (clockwise)
  const tauACW = s.m1 * C.g * s.d1; // left side (anticlockwise)
  const net = tauACW - tauCW;

  useAnimationFrame(
    (dt) => {
      if (s.tab === 'spanner') {
        // illustrative: angular acceleration proportional to torque (fixed moment of inertia 0.5 kg m²)
        const I = 0.5;
        setOmega((w) => w + (tau / I) * dt * 0.05);
        setRot((r) => r + omega * dt);
      } else {
        setTilt((t) => Math.max(-14, Math.min(14, t + Math.sign(-net) * (Math.abs(net) > 0.01 ? 20 : 0) * dt)));
      }
    },
    playing,
    ref,
  );

  const restart = () => {
    setRot(0);
    setOmega(0);
    setTilt(0);
  };

  // spanner geometry (pixels)
  const px = 160;
  const py = 170;
  const Lpx = 300;
  const handleAng = rot; // radians, rotating the spanner anticlockwise when τ > 0
  const hx = Math.cos(handleAng);
  const hy = -Math.sin(handleAng);
  const ax = px + hx * s.r * (Lpx / 0.5);
  const ay = py + hy * s.r * (Lpx / 0.5);
  const fAng = handleAng + (s.angle * Math.PI) / 180;
  const fLen = s.F * 1.6;
  const fx = Math.cos(fAng);
  const fy = -Math.sin(fAng);
  const perp = s.F * Math.sin((s.angle * Math.PI) / 180);
  const par = s.F * Math.cos((s.angle * Math.PI) / 180);
  const rPerp = s.r * Math.sin((s.angle * Math.PI) / 180);
  // foot of perpendicular from pivot onto the force's line of action
  const t0 = (px - ax) * fx + (py - ay) * fy;
  const footX = ax + fx * t0;
  const footY = ay + fy * t0;

  return (
    <SimShell
      id="torque"
      compact={compact}
      onReset={() => {
        reset();
        restart();
        setPlaying(false);
      }}
      controls={
        <>
          <Tabs size="sm" value={s.tab} onChange={(tab) => { set({ tab }); restart(); }} tabs={[{ id: 'spanner', label: 'Spanner' }, { id: 'seesaw', label: 'See-saw balance' }]} />
          <Playback playing={playing} setPlaying={setPlaying} onReset={restart} />
          {s.tab === 'spanner' ? (
            <>
              <Slider label="Distance from pivot" tex="r" value={s.r} min={0.05} max={0.5} step={0.01} unit="m" onChange={(r) => set({ r })} />
              <Slider label="Applied force" tex="F" value={s.F} min={0} max={100} step={1} unit="N" onChange={(F) => set({ F })} />
              <Slider label="Angle between r and F" tex="\theta" value={s.angle} min={0} max={180} step={1} unit="°" onChange={(angle) => set({ angle })} />
            </>
          ) : (
            <>
              <Slider label="Left mass" tex="m_1" value={s.m1} min={0.5} max={10} step={0.5} unit="kg" onChange={(m1) => set({ m1 })} />
              <Slider label="Left distance" tex="d_1" value={s.d1} min={0.2} max={2} step={0.1} unit="m" onChange={(d1) => set({ d1 })} />
              <Slider label="Right mass" tex="m_2" value={s.m2} min={0.5} max={10} step={0.5} unit="kg" onChange={(m2) => set({ m2 })} />
              <Slider label="Right distance" tex="d_2" value={s.d2} min={0.2} max={2} step={0.1} unit="m" onChange={(d2) => set({ d2 })} />
            </>
          )}
        </>
      }
      readouts={
        s.tab === 'spanner' ? (
          <>
            <Stat label="torque" tex="\tau" value={tau} unit="N m" tone="text-accent" />
            <Stat label="perpendicular force" tex="F_\perp" value={perp} unit="N" />
            <Stat label="parallel force (no turning)" tex="F_\parallel" value={par} unit="N" />
            <Stat label="moment arm" tex="r_\perp" value={rPerp} unit="m" />
          </>
        ) : (
          <>
            <Stat label="anticlockwise torque" value={tauACW} unit="N m" />
            <Stat label="clockwise torque" value={tauCW} unit="N m" />
            <Stat label="net torque" value={Math.abs(net)} unit={`N m ${Math.abs(net) < 0.01 ? '(balanced)' : net > 0 ? 'anticlockwise' : 'clockwise'}`} tone={Math.abs(net) < 0.01 ? 'text-good' : 'text-bad'} />
          </>
        )
      }
      below={
        <Callout kind="info" title="Link to Module 6">
          The same idea gives the torque on a motor coil: τ = nIAB sin θ — each side of the coil feels a force, and the pair of forces acting on opposite sides of the axis produces a turning effect.
        </Callout>
      }
      formulas={['\\tau = r_{\\perp}F = rF\\sin\\theta', '\\Sigma\\tau_{cw} = \\Sigma\\tau_{acw}\\ \\text{(rotational equilibrium)}']}
      explanation={
        <>
          <p>Only the force component perpendicular to the lever arm turns the spanner. The parallel component pulls along the handle through the pivot and produces no torque.</p>
          <p>Equivalently, torque = force × perpendicular distance from the pivot to the line of action (the moment arm, dashed). A system rotates faster and faster while there is a net torque; it is balanced (no angular acceleration) when clockwise and anticlockwise torques are equal.</p>
        </>
      }
      prediction={{
        q: 'You push on the spanner with the same force but along the handle (θ = 0°). What happens?',
        options: ['Maximum turning', 'Half the turning', 'No turning', 'It turns the other way'],
        answer: 2,
        explain: 'sin 0° = 0: a force through the pivot has zero moment arm, so τ = 0.',
      }}
      assumptions={['Rigid, massless spanner/beam; frictionless pivot.', 'Forces act at a single point.', 'See-saw: weights act at the stated distances.']}
      limitations={['The spanner’s spin rate is illustrative: angular acceleration ∝ τ (rotational dynamics beyond the syllabus formulae).', 'The see-saw tilt is shown qualitatively and stops at a limit.']}
    >
      <div ref={ref}>
        {s.tab === 'spanner' ? (
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Spanner with torque ${tau.toFixed(1)} N m`}>
            <circle cx={px} cy={py} r={18} className="fill-line" />
            <polygon points={hexPts(px, py, 10, rot)} className="fill-muted" />
            <line x1={px} y1={py} x2={px + hx * Lpx} y2={py + hy * Lpx} className="stroke-m5" strokeWidth={16} strokeLinecap="round" opacity={0.8} />
            <circle cx={ax} cy={ay} r={5} className="fill-ink" />
            <line x1={px} y1={py} x2={footX} y2={footY} className="stroke-m7" strokeDasharray="5 4" strokeWidth={1.5} />
            <line x1={ax - fx * 200} y1={ay - fy * 200} x2={ax + fx * 200} y2={ay + fy * 200} className="stroke-line" strokeDasharray="2 5" />
            <Label x={(px + footX) / 2 + 6} y={(py + footY) / 2} className="fill-m7" size={11}>
              r⊥
            </Label>
            <Arrow x1={ax} y1={ay} x2={ax + fx * fLen} y2={ay + fy * fLen} className="text-bad" label="F" width={3} />
            <Arrow x1={ax} y1={ay} x2={ax + Math.cos(handleAng + Math.PI / 2) * perp * 1.6} y2={ay - Math.sin(handleAng + Math.PI / 2) * perp * 1.6} className="text-accent" label="F⊥" dashed />
            <Arrow x1={ax} y1={ay} x2={ax + hx * par * 1.6} y2={ay + hy * par * 1.6} className="text-muted" label="F∥" dashed />
            <Label x={px - 30} y={py + 40} className="fill-muted" size={11}>
              pivot (nut)
            </Label>
            <Label x={12} y={H - 12} className="fill-muted" size={11}>
              τ = rF sin θ = {s.r.toFixed(2)} × {s.F} × sin {s.angle}° = {tau.toFixed(2)} N m {tau > 0.01 ? '(anticlockwise)' : ''}
            </Label>
          </svg>
        ) : (
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="See-saw with two masses">
            <polygon points={`${W / 2 - 22},${230} ${W / 2 + 22},${230} ${W / 2},${190}`} className="fill-muted" />
            <g transform={`rotate(${tilt} ${W / 2} 190)`}>
              <rect x={W / 2 - 240} y={182} width={480} height={10} rx={4} className="fill-m5" />
              <rect x={W / 2 - s.d1 * 110 - 18} y={182 - 12 - s.m1 * 4} width={36} height={12 + s.m1 * 4} rx={4} className="fill-m7" />
              <rect x={W / 2 + s.d2 * 110 - 18} y={182 - 12 - s.m2 * 4} width={36} height={12 + s.m2 * 4} rx={4} className="fill-m6" />
              <Label x={W / 2 - s.d1 * 110} y={182 - 20 - s.m1 * 4} anchor="middle" size={11}>
                {s.m1} kg
              </Label>
              <Label x={W / 2 + s.d2 * 110} y={182 - 20 - s.m2 * 4} anchor="middle" size={11}>
                {s.m2} kg
              </Label>
            </g>
            <Label x={12} y={H - 30} className="fill-muted" size={11}>
              Anticlockwise: {s.m1} × 9.8 × {s.d1} = {tauACW.toFixed(1)} N m · Clockwise: {s.m2} × 9.8 × {s.d2} = {tauCW.toFixed(1)} N m
            </Label>
            <Label x={12} y={H - 12} className={Math.abs(net) < 0.01 ? 'fill-good' : 'fill-bad'} size={12} weight={600}>
              {Math.abs(net) < 0.01 ? 'Balanced: net torque is zero.' : `Unbalanced: net torque ${Math.abs(net).toFixed(1)} N m ${net > 0 ? 'anticlockwise' : 'clockwise'} — press Play.`}
            </Label>
          </svg>
        )}
      </div>
    </SimShell>
  );
}

function hexPts(cx: number, cy: number, r: number, rot: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = rot + (i * Math.PI) / 3;
    return `${cx + r * Math.cos(a)},${cy - r * Math.sin(a)}`;
  }).join(' ');
}

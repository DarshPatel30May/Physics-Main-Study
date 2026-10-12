import { useRef, useState } from 'react';
import { SimShell, Playback } from '@/components/SimShell';
import { Slider, Stat } from '@/components/ui';
import { Arrow, Label } from '@/components/svg';
import { useAnimationFrame } from '@/lib/hooks';
import { useSimSettings } from '@/lib/store';

const DEFAULTS = { inc: 45, n: 1.33 };
const W = 300;
const H = 280;

export default function NewtonHuygensSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('newton-huygens', DEFAULTS);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  useAnimationFrame((dt) => setT((x) => (x + dt * 0.35) % 1), playing, ref);

  const th1 = (s.inc * Math.PI) / 180;
  const th2 = Math.asin(Math.sin(th1) / s.n);
  const iy = H / 2; // interface (air above, water below)
  const hitX = W / 2;

  // Newton: corpuscle speeds up in water (v_water = n c); Huygens: slows (v = c / n)
  const ray = (speedWater: number) => {
    const L1 = 130; // path length in air (px)
    const tHit = 0.5;
    if (t < tHit) {
      const d = L1 * (1 - t / tHit);
      return { x: hitX - d * Math.sin(th1), y: iy - d * Math.cos(th1) };
    }
    const d = ((t - tHit) / tHit) * L1 * speedWater;
    return { x: hitX + d * Math.sin(th2), y: iy + d * Math.cos(th2) };
  };
  const pN = ray(s.n);
  const pH = ray(1 / s.n);

  const panel = (title: string, p: { x: number; y: number }, speed: number, wave: boolean) => (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={title}>
      <rect x={0} y={iy} width={W} height={H - iy} className="fill-m5" opacity={0.15} />
      <line x1={0} y1={iy} x2={W} y2={iy} className="stroke-m5" />
      <line x1={hitX} y1={20} x2={hitX} y2={H - 20} className="stroke-line" strokeDasharray="4 4" />
      <line x1={hitX - 130 * Math.sin(th1)} y1={iy - 130 * Math.cos(th1)} x2={hitX} y2={iy} className="stroke-muted" />
      <line x1={hitX} y1={iy} x2={hitX + 130 * Math.sin(th2)} y2={iy + 130 * Math.cos(th2)} className="stroke-muted" />
      {wave ? (
        // wavefronts perpendicular to the ray, spaced by λ (shorter in water)
        Array.from({ length: 7 }, (_, i) => {
          const tt = ((t + i / 7) % 1);
          const L1 = 130;
          const tHit = 0.5;
          let x: number, y: number, ang: number;
          if (tt < tHit) {
            const d = L1 * (1 - tt / tHit);
            x = hitX - d * Math.sin(th1);
            y = iy - d * Math.cos(th1);
            ang = th1;
          } else {
            const d = ((tt - tHit) / tHit) * L1 * speed;
            x = hitX + d * Math.sin(th2);
            y = iy + d * Math.cos(th2);
            ang = th2;
          }
          const hx = 26 * Math.cos(ang);
          const hy = -26 * Math.sin(ang);
          return <line key={i} x1={x - hx} y1={y - hy} x2={x + hx} y2={y + hy} className="stroke-m7" strokeWidth={2} />;
        })
      ) : (
        <circle cx={p.x} cy={p.y} r={6} className="fill-m7" />
      )}
      {!wave && p.y > iy && <Arrow x1={hitX} y1={iy + 6} x2={hitX} y2={iy + 40} className="text-bad" label="attraction" labelOffset={[4, 10]} />}
      <Label x={10} y={18} size={12} weight={600}>
        {title}
      </Label>
      <Label x={10} y={iy - 6} size={10} className="fill-muted">
        air
      </Label>
      <Label x={10} y={iy + 16} size={10} className="fill-muted">
        water (n = {s.n})
      </Label>
      <Label x={10} y={H - 8} size={10} className="fill-muted">
        speed in water = {speed > 1 ? `${speed.toFixed(2)}c (faster)` : `${speed.toFixed(2)}c (slower)`}
      </Label>
    </svg>
  );

  return (
    <SimShell
      id="newton-huygens"
      compact={compact}
      onReset={reset}
      controls={
        <>
          <Playback playing={playing} setPlaying={setPlaying} />
          <Slider label="Angle of incidence" value={s.inc} min={5} max={80} step={1} unit="°" onChange={(inc) => set({ inc })} />
          <Slider label="Refractive index of water" tex="n" value={s.n} min={1.1} max={1.8} step={0.01} onChange={(n) => set({ n })} />
        </>
      }
      readouts={
        <>
          <Stat label="angle of refraction (both models)" value={`${((th2 * 180) / Math.PI).toFixed(1)}°`} />
          <Stat label="Newton predicts v_water" value={`${s.n.toFixed(2)}c`} tone="text-bad" />
          <Stat label="Huygens predicts v_water" value={`${(1 / s.n).toFixed(2)}c`} tone="text-good" />
          <Stat label="Foucault (1850) measured" value="slower in water" tone="text-good" />
        </>
      }
      below={
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="p-2">Evidence</th>
                <th className="p-2">Newton (corpuscles)</th>
                <th className="p-2">Huygens (waves)</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Straight-line propagation, sharp shadows', 'Explained ✓ (main argument)', 'Needed λ ≪ obstacle size'],
                ['Reflection', 'Explained ✓ (elastic bounce)', 'Explained ✓ (wavelets)'],
                ['Refraction', 'Explained ✓ — but predicts faster light in water', 'Explained ✓ — predicts slower light in water'],
                ['Speed in water (Foucault, 1850)', '✗ contradicted', '✓ confirmed'],
                ['Diffraction & interference (Young, Fresnel)', '✗ not explained', '✓ explained'],
                ['Polarisation (Malus)', 'Ad hoc “sides” of corpuscles', '✓ if waves are transverse'],
              ].map((r) => (
                <tr key={r[0]} className="border-t border-line">
                  {r.map((c, i) => (
                    <td key={i} className={`p-2 ${i === 0 ? 'font-semibold' : ''}`}>
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
      formulas={['n_1\\sin\\theta_1 = n_2\\sin\\theta_2', '\\text{Newton: } \\dfrac{\\sin\\theta_1}{\\sin\\theta_2} = \\dfrac{v_2}{v_1}', '\\text{Huygens: } \\dfrac{\\sin\\theta_1}{\\sin\\theta_2} = \\dfrac{v_1}{v_2}']}
      explanation={
        <>
          <p>Both models reproduce the observed bending towards the normal. Newton explained it with a short-range attraction of corpuscles towards the denser medium — increasing their perpendicular velocity, so light should travel FASTER in water.</p>
          <p>Huygens’ wavefronts bend because the part entering water first slows down — so light should travel SLOWER in water. The models make opposite, testable predictions.</p>
        </>
      }
      prediction={{
        q: 'Which measurement could decide between the two models of refraction?',
        options: ['The angle of refraction', 'The speed of light in water', 'The colour of light', 'The brightness of reflected light'],
        answer: 1,
        explain: 'Both models give the same angles; they disagree about the speed in water. Foucault (1850) found light slower in water — supporting waves.',
      }}
      assumptions={['Refraction from air (n ≈ 1) into water.', 'Animations are schematic (relative speeds to scale).']}
      limitations={['Newton’s actual explanation was more nuanced; this is the standard textbook summary.', 'The modern view: light is neither purely corpuscular nor purely wave-like (Module 7 quantum model).']}
    >
      <div ref={ref} className="grid grid-cols-1 gap-2 p-2 sm:grid-cols-2">
        {panel('Newton: corpuscle', pN, s.n, false)}
        {panel('Huygens: wavefronts', pH, 1 / s.n, true)}
      </div>
    </SimShell>
  );
}

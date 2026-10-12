import { useRef, useState } from 'react';
import { SimShell, Playback } from '@/components/SimShell';
import { Slider, Stat } from '@/components/ui';
import { Label } from '@/components/svg';
import { useAnimationFrame } from '@/lib/hooks';
import { useSimSettings } from '@/lib/store';
import { C } from '@/lib/physics/constants';
import { orbitalPeriod, orbitalSpeed, geostationaryRadius } from '@/lib/physics/mechanics';

const DEFAULTS = { customKm: 8000 };
const W = 560;
const H = 440;

const ORBITS = [
  { name: 'ISS (LEO)', altKm: 420, colour: 'fill-good', stroke: 'stroke-good', use: 'Crewed research; ~16 orbits per day.' },
  { name: 'GPS (MEO)', altKm: 20200, colour: 'fill-m6', stroke: 'stroke-m6', use: 'Navigation constellation; T ≈ 12 h.' },
  { name: 'Geostationary', altKm: (geostationaryRadius() - C.RE) / 1e3, colour: 'fill-m7', stroke: 'stroke-m7', use: 'Weather (Himawari), TV, communications: fixed above the equator.' },
];

export default function SatellitesSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('satellites', DEFAULTS);
  const [t, setT] = useState(0); // seconds of simulated time
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const ref = useRef<HTMLDivElement>(null);
  useAnimationFrame((dt) => setT((x) => x + dt * speed * 3600), playing, ref); // 1 s real = 1 h simulated at 1×

  const rGeo = geostationaryRadius();
  const k = 195 / rGeo;
  const cx = W / 2;
  const cy = H / 2;
  const earthRot = (2 * Math.PI * t) / 86164;
  const all = [...ORBITS, { name: 'Your satellite', altKm: s.customKm, colour: 'fill-accent', stroke: 'stroke-accent', use: '' }];

  const rc = C.RE + s.customKm * 1e3;
  return (
    <SimShell
      id="satellites"
      compact={compact}
      onReset={() => {
        reset();
        setT(0);
      }}
      controls={
        <>
          <Playback playing={playing} setPlaying={setPlaying} speed={speed} setSpeed={setSpeed} onReset={() => setT(0)} />
          <Slider label="Your satellite’s altitude" tex="h" value={s.customKm} min={200} max={40000} step={100} unit="km" onChange={(customKm) => set({ customKm })} />
          <div className="rounded-xl border border-line p-3 text-sm">
            <div className="label mb-2">Comparison</div>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-muted">
                  <th>Orbit</th>
                  <th>alt. (km)</th>
                  <th>v (km/s)</th>
                  <th>T (h)</th>
                </tr>
              </thead>
              <tbody className="num">
                {all.map((o) => {
                  const r = C.RE + o.altKm * 1e3;
                  return (
                    <tr key={o.name} className="border-t border-line">
                      <td className="py-1 font-sans">{o.name}</td>
                      <td>{o.altKm.toFixed(0)}</td>
                      <td>{(orbitalSpeed(C.ME, r) / 1e3).toFixed(2)}</td>
                      <td>{(orbitalPeriod(C.ME, r) / 3600).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      }
      readouts={
        <>
          <Stat label="orbital radius r = R_E + h" value={rc} unit="m" />
          <Stat label="orbital speed" tex="v" value={orbitalSpeed(C.ME, rc)} unit="m s⁻¹" />
          <Stat label="period" tex="T" value={orbitalPeriod(C.ME, rc) / 3600} unit="h" />
          <Stat label="g at orbit" value={(C.G * C.ME) / rc ** 2} unit="N kg⁻¹" />
          <Stat label="geostationary radius" value={rGeo} unit="m" tone="text-m7" />
          <Stat label="geostationary altitude" value={(rGeo - C.RE) / 1e3} unit="km" tone="text-m7" />
        </>
      }
      formulas={['v = \\sqrt{\\dfrac{GM}{r}}', 'T = 2\\pi\\sqrt{\\dfrac{r^3}{GM}}', 'r_{geo} = \\sqrt[3]{\\dfrac{GMT^2}{4\\pi^2}},\\ T = 86\\,164\\ \\text{s}']}
      explanation={
        <>
          <p>Low-Earth-orbit satellites move fast (≈ 7.7 km s⁻¹) and complete an orbit in about 90 minutes — great for high-resolution imaging and low signal delay, but each is overhead only briefly.</p>
          <p>A geostationary satellite orbits above the equator, in the direction of Earth’s rotation, with a period of one sidereal day (23 h 56 min). Kepler’s third law fixes its radius at ≈ 4.22 × 10⁷ m. Watch the red marker on Earth: the geostationary satellite stays above it.</p>
        </>
      }
      prediction={{
        q: 'Could a satellite be geostationary at 1000 km altitude by firing engines to slow it down?',
        options: ['Yes, if it slows to match Earth’s rotation', 'No — without engines it would fall to a lower orbit, and its period at that altitude is fixed (~105 min)', 'Yes, over the poles', 'Only for light satellites'],
        answer: 1,
        explain: 'For a free orbit, r fixes T (Kepler III). Only one radius gives T = 1 sidereal day.',
      }}
      assumptions={['Circular orbits in a single plane (shown face-on, viewed from above the North Pole).', 'Distances and Earth’s size drawn to the same scale.']}
      limitations={['GPS orbits are actually inclined at 55°; the ISS at 51.6°. Only geostationary orbits must lie in the equatorial plane.', 'Time is accelerated: 1 s on screen = 1 h × speed setting.']}
    >
      <div ref={ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="LEO, MEO and geostationary orbits drawn to scale around Earth">
          {all.map((o) => {
            const r = C.RE + o.altKm * 1e3;
            const R = r * k;
            const ang = (2 * Math.PI * t) / orbitalPeriod(C.ME, r);
            return (
              <g key={o.name}>
                <circle cx={cx} cy={cy} r={R} fill="none" className={o.stroke} strokeOpacity={0.5} strokeDasharray={o.name === 'Your satellite' ? '4 4' : undefined} />
                <circle cx={cx + R * Math.cos(ang)} cy={cy - R * Math.sin(ang)} r={5} className={o.colour} />
                <Label x={cx + R * Math.cos(ang) + 8} y={cy - R * Math.sin(ang) - 6} size={10}>
                  {o.name}
                </Label>
              </g>
            );
          })}
          <circle cx={cx} cy={cy} r={C.RE * k} className="fill-m5" opacity={0.85} />
          <circle cx={cx + C.RE * k * Math.cos(earthRot)} cy={cy - C.RE * k * Math.sin(earthRot)} r={3} className="fill-bad" />
          <Label x={12} y={H - 10} className="fill-muted" size={11}>
            Elapsed: {(t / 3600).toFixed(1)} h · red dot = a point on the equator rotating with Earth
          </Label>
        </svg>
      </div>
    </SimShell>
  );
}

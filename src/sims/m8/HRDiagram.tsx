import { useMemo, useRef, useState } from 'react';
import { SimShell, Playback } from '@/components/SimShell';
import { Stat, Select, Toggle, Callout } from '@/components/ui';
import { Label } from '@/components/svg';
import { useAnimationFrame } from '@/lib/hooks';
import { useSimSettings } from '@/lib/store';
import { STARS, SPECTRAL_CLASSES } from '@/content/stars';
import { blackbodyColour } from '@/lib/physics/optics';

const W = 600;
const H = 440;
const PAD = { l: 60, r: 20, t: 20, b: 50 };
const TMAX = 40000;
const TMIN = 2400;
const LMIN = 1e-4;
const LMAX = 1e6;
const X = (T: number) => PAD.l + ((Math.log10(TMAX) - Math.log10(T)) / (Math.log10(TMAX) - Math.log10(TMIN))) * (W - PAD.l - PAD.r);
const Y = (L: number) => PAD.t + ((Math.log10(LMAX) - Math.log10(L)) / (Math.log10(LMAX) - Math.log10(LMIN))) * (H - PAD.t - PAD.b);

/** Schematic evolutionary tracks (T in K, L in L☉) — qualitative paths, not stellar-model output. */
const TRACKS = {
  low: {
    name: '1 M☉ (Sun-like)',
    pts: [
      { T: 4000, L: 5, stage: 'Protostar (contracting)' },
      { T: 5772, L: 1, stage: 'Main sequence (H → He in core, ~10 Gyr)' },
      { T: 4800, L: 3, stage: 'Subgiant' },
      { T: 4000, L: 1000, stage: 'Red giant (H shell burning)' },
      { T: 4800, L: 50, stage: 'Horizontal branch (He core burning)' },
      { T: 3500, L: 3000, stage: 'Asymptotic giant branch' },
      { T: 100000, L: 3000, stage: 'Planetary nebula ejected' },
      { T: 20000, L: 0.01, stage: 'White dwarf (cooling, no fusion)' },
    ],
  },
  high: {
    name: '15 M☉ (massive)',
    pts: [
      { T: 30000, L: 20000, stage: 'Main sequence (CNO cycle, ~10 Myr)' },
      { T: 20000, L: 40000, stage: 'Blue supergiant' },
      { T: 3500, L: 60000, stage: 'Red supergiant (fusion up to Fe)' },
      { T: 3500, L: 60000, stage: 'Core collapse → supernova → neutron star (or black hole for higher masses)' },
    ],
  },
};
const DEFAULTS = { track: 'none' as 'none' | 'low' | 'high', radii: true, selected: 'Sun' };

export default function HRDiagramSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('hr-diagram', DEFAULTS);
  const [k, setK] = useState(0);
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useAnimationFrame((dt) => setK((x) => (x + dt * 0.4) % 1), playing && s.track !== 'none', ref);

  const star = STARS.find((x) => x.name === s.selected) ?? STARS[0];
  const R = Math.sqrt(star.L) / (star.T / 5772) ** 2; // R/R☉ from L ∝ R²T⁴

  const ms = useMemo(() => {
    // approximate main-sequence ridge (L ≈ (T/5772)^7.5 near the Sun, flattening for hot stars)
    const pts: string[] = [];
    for (let lt = Math.log10(3000); lt <= Math.log10(35000); lt += 0.02) {
      const T = 10 ** lt;
      const L = Math.min(5e5, (T / 5772) ** (T < 10000 ? 7 : 5.2) * (T < 10000 ? 1 : (10000 / 5772) ** 1.8));
      pts.push(`${pts.length ? 'L' : 'M'}${X(T).toFixed(1)},${Y(Math.max(L, LMIN)).toFixed(1)}`);
    }
    return pts.join(' ');
  }, []);

  const track = s.track === 'none' ? null : TRACKS[s.track];
  const idx = track ? Math.min(track.pts.length - 1, Math.floor(k * track.pts.length)) : 0;

  return (
    <SimShell
      id="hr-diagram"
      compact={compact}
      onReset={() => {
        reset();
        setK(0);
      }}
      controls={
        <>
          <Select label="Inspect a star" value={s.selected} onChange={(selected) => set({ selected })} options={STARS.map((x) => ({ value: x.name, label: `${x.name} (${x.type})` }))} />
          <Select label="Show evolution of a star" value={s.track} onChange={(t) => { set({ track: t }); setK(0); }} options={[{ value: 'none', label: 'None' }, { value: 'low', label: TRACKS.low.name }, { value: 'high', label: TRACKS.high.name }]} />
          {s.track !== 'none' && <Playback playing={playing} setPlaying={setPlaying} onReset={() => setK(0)} />}
          <Toggle label="Lines of constant radius" checked={s.radii} onChange={(radii) => set({ radii })} />
        </>
      }
      readouts={
        <>
          <Stat label="star" value={star.name} />
          <Stat label="spectral class" value={star.cls} />
          <Stat label="surface temperature" value={star.T} unit="K" />
          <Stat label="luminosity" value={star.L} unit="L☉" />
          <Stat label="radius (from L ∝ R²T⁴)" value={R} unit="R☉" />
          <Stat label="type / stage" value={star.type} tone="text-accent" />
        </>
      }
      below={
        <div className="grid gap-3 md:grid-cols-2">
          <Callout kind="info" title={star.name}>
            {star.note}
          </Callout>
          {track ? (
            <Callout kind="model" title={`${track.name}: ${track.pts[idx].stage}`}>
              Schematic evolutionary path (qualitative). Different masses follow different paths: low-mass stars end as white dwarfs; massive stars explode as supernovae leaving neutron stars or black holes.
            </Callout>
          ) : (
            <Callout kind="tip" title="Reading the diagram">
              Temperature increases to the LEFT. Up = more luminous. Moving up at constant temperature means a larger star (giants); moving down means smaller (white dwarfs).
            </Callout>
          )}
        </div>
      }
      formulas={['\\lambda_{max} = \\dfrac{b}{T}', 'L \\propto R^2T^4\\ \\text{(supplementary)}']}
      explanation={
        <>
          <p>The H–R diagram plots luminosity against surface temperature. About 90% of stars lie on the main sequence, where they fuse hydrogen in their cores; position along it is set mainly by mass (hot, luminous, massive upper left; cool, dim, low-mass lower right).</p>
          <p>Giants and supergiants are cool but very luminous, so they must be huge. White dwarfs are hot but faint, so they must be tiny.</p>
        </>
      }
      prediction={{
        q: 'Two stars have the same surface temperature, but one is 10 000 times more luminous. What must be true?',
        options: ['It is closer to Earth', 'It has a radius about 100 times larger', 'It is hotter inside', 'It is younger'],
        answer: 1,
        explain: 'L ∝ R²T⁴ — at equal T, 10⁴ times the luminosity needs 10² times the radius.',
      }}
      assumptions={['Star data are approximate literature values; sources differ by up to tens of percent.', 'Luminosity in solar units, log scale; temperature log scale, decreasing to the right.']}
      limitations={['Main-sequence ridge and evolutionary tracks are schematic, not computed stellar models.', 'Real H–R diagrams show scatter, binaries and observational uncertainty.']}
    >
      <div ref={ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Hertzsprung–Russell diagram">
          <rect x={PAD.l} y={PAD.t} width={W - PAD.l - PAD.r} height={H - PAD.t - PAD.b} className="fill-black" opacity={0.85} />
          {SPECTRAL_CLASSES.map((c) => (
            <g key={c.cls}>
              <rect x={X(Math.min(c.Tmax, TMAX))} y={PAD.t} width={X(c.Tmin) - X(Math.min(c.Tmax, TMAX))} height={8} fill={c.colour} opacity={0.8} />
              <Label x={(X(c.Tmin) + X(Math.min(c.Tmax, TMAX))) / 2} y={PAD.t + 22} anchor="middle" size={11} weight={700} className="fill-white">
                {c.cls}
              </Label>
            </g>
          ))}
          {[1e-4, 1e-2, 1, 1e2, 1e4, 1e6].map((L) => (
            <g key={L}>
              <line x1={PAD.l - 4} y1={Y(L)} x2={W - PAD.r} y2={Y(L)} className="stroke-white" opacity={0.08} />
              <Label x={PAD.l - 6} y={Y(L) + 4} anchor="end" size={10} className="fill-muted">
                {L >= 1 ? L.toLocaleString('en-AU') : L}
              </Label>
            </g>
          ))}
          {[30000, 20000, 10000, 6000, 4000, 3000].map((T) => (
            <g key={T}>
              <line x1={X(T)} y1={PAD.t} x2={X(T)} y2={H - PAD.b + 4} className="stroke-white" opacity={0.08} />
              <Label x={X(T)} y={H - PAD.b + 16} anchor="middle" size={10} className="fill-muted">
                {T.toLocaleString('en-AU')}
              </Label>
            </g>
          ))}
          <Label x={(W + PAD.l) / 2} y={H - 10} anchor="middle" size={11}>
            surface temperature (K) — hotter on the left
          </Label>
          <text x={16} y={H / 2} transform={`rotate(-90 16 ${H / 2})`} textAnchor="middle" fontSize={11} className="fill-ink">
            luminosity (L☉)
          </text>
          {s.radii &&
            [0.01, 1, 100].map((Rr) => {
              const pts = [TMAX, TMIN].map((T) => ({ T, L: Rr * Rr * (T / 5772) ** 4 }));
              return (
                <g key={Rr}>
                  <line x1={X(pts[0].T)} y1={Y(Math.min(LMAX, Math.max(LMIN, pts[0].L)))} x2={X(pts[1].T)} y2={Y(Math.min(LMAX, Math.max(LMIN, pts[1].L)))} className="stroke-white" strokeDasharray="4 6" opacity={0.3} />
                  <Label x={X(9000)} y={Y(Math.min(LMAX, Math.max(LMIN, Rr * Rr * (9000 / 5772) ** 4))) - 4} size={9} className="fill-muted">
                    {Rr} R☉
                  </Label>
                </g>
              );
            })}
          <path d={ms} fill="none" className="stroke-white" strokeWidth={26} opacity={0.08} strokeLinecap="round" />
          <Label x={X(9000)} y={Y(40) + 30} size={11} className="fill-white" weight={600}>
            Main sequence
          </Label>
          <Label x={X(4200)} y={Y(2e4)} size={11} className="fill-white" weight={600}>
            Supergiants
          </Label>
          <Label x={X(4600)} y={Y(300)} size={11} className="fill-white" weight={600}>
            Giants
          </Label>
          <Label x={X(22000)} y={Y(0.0015)} size={11} className="fill-white" weight={600}>
            White dwarfs
          </Label>
          {STARS.map((st) => (
            <g key={st.name} onClick={() => set({ selected: st.name })} className="cursor-pointer">
              <circle cx={X(st.T)} cy={Y(st.L)} r={st.name === s.selected ? 8 : 5} fill={blackbodyColour(st.T)} stroke={st.name === s.selected ? '#22d3ee' : 'none'} strokeWidth={2} />
              {(st.name === s.selected || ['Sun', 'Betelgeuse', 'Sirius B', 'Proxima Centauri', 'Rigel'].includes(st.name)) && (
                <Label x={X(st.T) + 9} y={Y(st.L) + 4} size={10} className="fill-white">
                  {st.name}
                </Label>
              )}
            </g>
          ))}
          {track && (
            <g>
              <path d={track.pts.slice(0, idx + 1).map((p, i) => `${i ? 'L' : 'M'}${X(Math.min(TMAX, p.T))},${Y(p.L)}`).join(' ')} fill="none" className="stroke-accent" strokeWidth={2} strokeDasharray="5 3" />
              <circle cx={X(Math.min(TMAX, track.pts[idx].T))} cy={Y(track.pts[idx].L)} r={7} className="fill-accent" />
            </g>
          )}
        </svg>
      </div>
    </SimShell>
  );
}

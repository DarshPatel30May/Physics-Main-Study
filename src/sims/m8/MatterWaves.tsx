import { useMemo, useRef, useState } from 'react';
import { SimShell, Playback } from '@/components/SimShell';
import { Slider, Stat, Tabs, Select, Callout } from '@/components/ui';
import { Label } from '@/components/svg';
import { useAnimationFrame } from '@/lib/hooks';
import { useSimSettings } from '@/lib/store';
import { C } from '@/lib/physics/constants';
import { deBroglie } from '@/lib/physics/atomic';

const PARTICLES = {
  electron: { name: 'Electron', m: C.me, q: C.e },
  proton: { name: 'Proton', m: C.mp, q: C.e },
  neutron: { name: 'Neutron', m: C.mn, q: 0 },
  alpha: { name: 'Alpha particle', m: 6.645e-27, q: 2 * C.e },
  ball: { name: 'Cricket ball (0.16 kg)', m: 0.16, q: 0 },
  person: { name: 'Person (60 kg)', m: 60, q: 0 },
};
type P = keyof typeof PARTICLES;
type Tab = 'calc' | 'diffraction' | 'orbit';
const DEFAULTS = { tab: 'calc' as Tab, particle: 'electron' as P, useV: true, V: 54, logv: 6, Vdiff: 3000, n: 3, nFrac: 3 };
const W = 560;
const H = 320;

export default function MatterWavesSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('matter-waves', DEFAULTS);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  useAnimationFrame((dt) => setT((x) => x + dt), playing, ref);
  const p = PARTICLES[s.particle];
  const charged = p.q > 0;
  const v = charged && s.useV ? Math.sqrt((2 * p.q * s.V) / p.m) : 10 ** s.logv;
  const lam = deBroglie(p.m, v);

  // electron diffraction through polycrystalline graphite (G. P. Thomson-style rings)
  const lamE = C.h / Math.sqrt(2 * C.me * C.e * s.Vdiff);
  const dSpacings = [2.13e-10, 1.23e-10]; // graphite lattice spacings (m)
  const Ls = 0.14; // foil–screen distance (m)
  const rings = dSpacings.map((d) => Ls * Math.tan(2 * Math.asin(lamE / (2 * d))));

  const ringsPx = rings.map((r) => r * 2000); // 2000 px per metre of screen
  const comparisons = useMemo(
    () => [
      { name: 'Atom spacing in a crystal', size: 2e-10 },
      { name: 'Visible light wavelength', size: 5e-7 },
      { name: 'Atomic nucleus', size: 1e-14 },
    ],
    [],
  );

  const orbitView = () => {
    const cx = W / 2;
    const cy = H / 2;
    const R = 100;
    const n = s.nFrac;
    const closes = Math.abs(n - Math.round(n)) < 0.01;
    const pts = Array.from({ length: 721 }, (_, i) => {
      const a = (i / 720) * 2 * Math.PI;
      const rr = R + 22 * Math.sin(n * a) * Math.cos(3 * t);
      return `${i ? 'L' : 'M'}${(cx + rr * Math.cos(a)).toFixed(1)},${(cy - rr * Math.sin(a)).toFixed(1)}`;
    }).join(' ');
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Electron standing wave around a Bohr orbit">
        <circle cx={cx} cy={cy} r={R} fill="none" className="stroke-line" strokeDasharray="4 4" />
        <circle cx={cx} cy={cy} r={6} className="fill-bad" />
        <path d={pts} fill="none" className={closes ? 'stroke-accent' : 'stroke-bad'} strokeWidth={2.5} />
        <Label x={12} y={22} size={12} weight={600} className={closes ? 'fill-good' : 'fill-bad'}>
          {closes ? `n = ${Math.round(n)}: whole number of wavelengths fits — standing wave (allowed orbit)` : `${n.toFixed(2)} wavelengths: the wave does not join up — destructive (not allowed)`}
        </Label>
        <Label x={12} y={H - 10} size={11} className="fill-muted">de Broglie’s picture: 2πr = nλ ⇒ mvr = nh/2π (Bohr’s quantisation condition). A historical model, not the modern orbital picture.</Label>
      </svg>
    );
  };

  return (
    <SimShell
      id="matter-waves"
      compact={compact}
      onReset={reset}
      controls={
        <>
          <Tabs size="sm" value={s.tab} onChange={(tab) => set({ tab })} tabs={[{ id: 'calc', label: 'λ = h/mv' }, { id: 'diffraction', label: 'Electron diffraction' }, { id: 'orbit', label: 'Standing waves' }]} />
          {s.tab === 'calc' && (
            <>
              <Select label="Particle" value={s.particle} onChange={(particle) => set({ particle })} options={Object.entries(PARTICLES).map(([k, x]) => ({ value: k as P, label: x.name }))} />
              {charged && (
                <Select label="Set speed by" value={s.useV ? 'V' : 'v'} onChange={(x) => set({ useV: x === 'V' })} options={[{ value: 'V', label: 'Accelerating voltage' }, { value: 'v', label: 'Speed directly' }]} />
              )}
              {charged && s.useV ? (
                <Slider label="Accelerating voltage" tex="V" value={s.V} min={1} max={10000} step={1} unit="V" onChange={(V) => set({ V })} />
              ) : (
                <Slider label="Speed (log scale)" tex="v" value={s.logv} min={-2} max={7.4} step={0.01} format={(x) => (10 ** x).toExponential(2)} unit="m s⁻¹" onChange={(logv) => set({ logv })} />
              )}
            </>
          )}
          {s.tab === 'diffraction' && (
            <>
              <Playback playing={playing} setPlaying={setPlaying} />
              <Slider label="Accelerating voltage" tex="V" value={s.Vdiff} min={500} max={10000} step={50} unit="V" onChange={(Vdiff) => set({ Vdiff })} />
            </>
          )}
          {s.tab === 'orbit' && (
            <>
              <Playback playing={playing} setPlaying={setPlaying} />
              <Slider label="Wavelengths around the orbit" tex="n" value={s.nFrac} min={1} max={8} step={0.05} onChange={(nFrac) => set({ nFrac })} />
            </>
          )}
        </>
      }
      readouts={
        s.tab === 'calc' ? (
          <>
            <Stat label="speed" tex="v" value={v} unit="m s⁻¹" />
            <Stat label="momentum" tex="p = mv" value={p.m * v} unit="kg m s⁻¹" />
            <Stat label="de Broglie wavelength" tex="\lambda = h/mv" value={lam} unit="m" tone="text-accent" />
            {v > 0.1 * C.c && <Stat label="warning" value="v > 0.1c: relativistic correction needed" tone="text-warn" />}
          </>
        ) : s.tab === 'diffraction' ? (
          <>
            <Stat label="electron wavelength" value={lamE * 1e12} unit="pm" tone="text-accent" />
            <Stat label="inner ring radius" value={rings[0] * 1e3} unit="mm" />
            <Stat label="outer ring radius" value={rings[1] * 1e3} unit="mm" />
          </>
        ) : (
          <>
            <Stat label="n (whole number → allowed)" value={s.nFrac} />
          </>
        )
      }
      below={
        s.tab === 'calc' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="p-1">Compare λ with…</th>
                  <th className="p-1">size</th>
                  <th className="p-1">λ / size</th>
                  <th className="p-1">diffraction noticeable?</th>
                </tr>
              </thead>
              <tbody className="num">
                {comparisons.map((c) => (
                  <tr key={c.name} className="border-t border-line">
                    <td className="p-1 font-sans">{c.name}</td>
                    <td className="p-1">{c.size.toExponential(0)} m</td>
                    <td className="p-1">{(lam / c.size).toExponential(2)}</td>
                    <td className="p-1 font-sans">{lam / c.size > 0.01 && lam / c.size < 100 ? 'yes' : 'no'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-1 text-xs text-muted">Wave effects are observable only when λ is comparable to the size of the gap or obstacle — why we never see a cricket ball diffract.</p>
          </div>
        ) : s.tab === 'diffraction' ? (
          <Callout kind="model" title="Experimental evidence (1927)">
            Davisson and Germer fired 54 eV electrons at a nickel crystal and found a strong reflection peak at 50°, matching d sin θ = λ with λ = h/mv = 0.167 nm. G. P. Thomson passed electrons through thin metal foils and saw rings like X-ray powder patterns. Particles showed wave interference — confirming de Broglie.
          </Callout>
        ) : (
          <Callout kind="info">Schrödinger later replaced this one-dimensional picture with three-dimensional standing waves (orbitals).</Callout>
        )
      }
      formulas={['\\lambda = \\dfrac{h}{mv}', 'qV = \\tfrac12mv^2 \\Rightarrow \\lambda = \\dfrac{h}{\\sqrt{2mqV}}', '2\\pi r = n\\lambda']}
      explanation={
        <>
          <p>de Broglie (1924) proposed that, like light, matter has both wave and particle properties: every particle has a wavelength λ = h/mv. For everyday objects λ is absurdly small; for electrons it is about the spacing of atoms in a crystal.</p>
          <p>Higher accelerating voltages give faster electrons with shorter wavelengths — so diffraction rings shrink.</p>
        </>
      }
      prediction={{
        q: 'You increase the accelerating voltage on an electron beam. What happens to its diffraction rings?',
        options: ['They get larger', 'They get smaller', 'They disappear', 'No change'],
        answer: 1,
        explain: 'Larger V → larger momentum → shorter λ → smaller diffraction angles.',
      }}
      assumptions={['Non-relativistic momentum p = mv (adequate below ~0.1c).', 'Diffraction rings use graphite spacings 0.213 nm and 0.123 nm, screen 14 cm from the foil.']}
      limitations={['Diffraction picture is a conceptual rendering of ring positions, not intensity.', 'Standing-wave orbits are de Broglie’s historical model.']}
    >
      <div ref={ref}>
        {s.tab === 'calc' && (
          <svg viewBox={`0 0 ${W} 200`} className="h-auto w-full" role="img" aria-label="Matter wave">
            <path d={Array.from({ length: 400 }, (_, i) => `${i ? 'L' : 'M'}${(20 + i * 1.3).toFixed(1)},${(100 + 40 * Math.sin(i / Math.max(2, Math.min(60, 4 + Math.log10(lam * 1e12 + 1) * 10)) - t * 4) * Math.exp(-(((i - 200) / 110) ** 2))).toFixed(1)}`).join(' ')} fill="none" className="stroke-accent" strokeWidth={2.5} />
            <Label x={20} y={190} size={11} className="fill-muted">Wave packet sketch (schematic): λ = {lam.toExponential(3)} m</Label>
          </svg>
        )}
        {s.tab === 'diffraction' && (
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Electron diffraction rings">
            <rect x={W / 2 - 150} y={10} width={300} height={300} rx={150} className="fill-black" />
            {ringsPx.map((r, i) => (
              <circle key={i} cx={W / 2} cy={160} r={r} fill="none" stroke="#4ade80" strokeWidth={4} opacity={0.75 - i * 0.2} />
            ))}
            <circle cx={W / 2} cy={160} r={6} fill="#4ade80" />
            <Label x={12} y={H - 10} size={11} className="fill-muted">Fluorescent screen of an electron diffraction tube (graphite target).</Label>
          </svg>
        )}
        {s.tab === 'orbit' && orbitView()}
      </div>
    </SimShell>
  );
}

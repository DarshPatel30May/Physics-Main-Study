import { useMemo, useRef, useState } from 'react';
import { SimShell, Playback, GraphCard } from '@/components/SimShell';
import { Slider, Stat, Select, Callout } from '@/components/ui';
import { Graph } from '@/components/Graph';
import { Label } from '@/components/svg';
import { useAnimationFrame } from '@/lib/hooks';
import { useSimSettings } from '@/lib/store';
import { photoelectric, photocurrent, METALS, wavelengthToRGB } from '@/lib/physics/optics';
import { C } from '@/lib/physics/constants';
import { mulberry32 } from '@/lib/physics/nuclear';

const DEFAULTS = { f14: 7, intensity: 50, metal: 'Sodium', V: 0 };
const W = 560;
const H = 300;

interface Electron {
  x: number;
  y: number;
  vx: number;
  vy: number;
  born: number;
}
interface Photon {
  x: number;
  y: number;
}

export default function PhotoelectricSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('photoelectric', DEFAULTS);
  const [playing, setPlaying] = useState(true);
  const [, setTick] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const rand = useRef(mulberry32(7));
  const electrons = useRef<Electron[]>([]);
  const photons = useRef<Photon[]>([]);
  const collected = useRef<number[]>([]);
  const acc = useRef(0);

  const phi = METALS.find((m) => m.name === s.metal)?.phi ?? 2.3;
  const f = s.f14 * 1e14;
  const r = photoelectric(f, phi);
  const lamNm = (C.c / f) * 1e9;
  const visible = lamNm >= 380 && lamNm <= 750;
  const colour = visible ? wavelengthToRGB(lamNm) : lamNm < 380 ? '#a78bfa' : '#f87171';
  const I = photocurrent(f, phi, s.intensity / 50, s.V);

  // geometry
  const cathodeX = 120;
  const anodeX = 440;

  useAnimationFrame(
    (dt) => {
      const R = rand.current;
      // photons arrive at a rate ∝ intensity
      acc.current += (s.intensity / 100) * 40 * dt;
      while (acc.current >= 1) {
        photons.current.push({ x: 0, y: 70 + R() * 160 });
        acc.current -= 1;
      }
      photons.current.forEach((p) => (p.x += 600 * dt));
      photons.current = photons.current.filter((p) => {
        if (p.x >= cathodeX) {
          // one photon → at most one electron, and only if hf > φ
          if (r.emitted) {
            const k = R() * r.kMaxJ; // electrons emerge with a spread of energies up to K_max
            const speed = Math.sqrt((2 * k) / C.me);
            const vis = 40 + (speed / 1e6) * 160;
            const ang = (R() - 0.5) * 0.8;
            electrons.current.push({ x: cathodeX + 4, y: p.y, vx: vis * Math.cos(ang), vy: vis * Math.sin(ang), born: performance.now() });
          }
          return false;
        }
        return true;
      });
      // retarding/accelerating field between plates: a = qV/(m d) in screen units (scaled)
      const accel = (s.V / 3) * 120; // + V accelerates electrons towards anode
      electrons.current.forEach((e) => {
        e.vx += accel * dt;
        e.x += e.vx * dt;
        e.y += e.vy * dt;
      });
      const now = performance.now();
      electrons.current = electrons.current.filter((e) => {
        if (e.x >= anodeX) {
          collected.current.push(now);
          return false;
        }
        return e.x > cathodeX - 2 && e.y > 40 && e.y < H - 40;
      });
      collected.current = collected.current.filter((t) => now - t < 1000);
      if (electrons.current.length > 400) electrons.current.splice(0, electrons.current.length - 400);
      setTick((t) => t + 1);
    },
    playing,
    ref,
  );

  const ivData = useMemo(() => Array.from({ length: 121 }, (_, i) => {
    const V = -4 + (i / 120) * 6;
    return { V, I: photocurrent(f, phi, s.intensity / 50, V), I2: photocurrent(f, phi, (2 * s.intensity) / 50, V) };
  }), [f, phi, s.intensity]);
  const kfData = useMemo(() => Array.from({ length: 121 }, (_, i) => {
    const ff = (i / 120) * 20;
    const k = (C.h * ff * 1e14) / C.eV - phi;
    return { f: ff, K: k > 0 ? k : 0 };
  }), [phi]);

  const statements = [
    { ok: r.emitted, text: r.emitted ? `hf = ${r.photonEnergyEV.toFixed(2)} eV > φ = ${phi} eV → photoelectrons are emitted immediately.` : `hf = ${r.photonEnergyEV.toFixed(2)} eV < φ = ${phi} eV → NO photoelectrons, however intense the light (single-photon model).` },
    { ok: true, text: `Increasing frequency increases K_max (now ${r.kMaxEV.toFixed(2)} eV).` },
    { ok: true, text: r.emitted ? `Increasing intensity at this frequency increases the emission rate (current), not K_max.` : 'Increasing intensity below threshold still gives zero current.' },
  ];

  return (
    <SimShell
      id="photoelectric"
      compact={compact}
      onReset={() => {
        reset();
        electrons.current = [];
        photons.current = [];
      }}
      controls={
        <>
          <Playback playing={playing} setPlaying={setPlaying} />
          <Slider label="Light frequency" tex="f" value={s.f14} min={3} max={16} step={0.1} unit="× 10¹⁴ Hz" hint={`λ = ${lamNm.toFixed(0)} nm (${visible ? 'visible' : lamNm < 380 ? 'ultraviolet' : 'infrared'})`} onChange={(f14) => set({ f14 })} />
          <Slider label="Intensity (photons per second)" value={s.intensity} min={0} max={100} step={1} unit="%" onChange={(intensity) => set({ intensity })} />
          <Select label="Metal (work function)" value={s.metal} onChange={(metal) => set({ metal })} options={METALS.map((m) => ({ value: m.name, label: `${m.name} (φ = ${m.phi} eV)` }))} />
          <Slider label="Anode voltage" tex="V" value={s.V} min={-4} max={2} step={0.05} unit="V" hint="Negative = retarding (stopping) voltage" onChange={(V) => set({ V })} />
          <button className="btn w-full" onClick={() => set({ V: -Number(r.stoppingV.toFixed(2)) })} disabled={!r.emitted}>
            Set V to −V₀ (stopping voltage)
          </button>
        </>
      }
      readouts={
        <>
          <Stat label="photon energy" tex="hf" value={r.photonEnergyEV} unit="eV" />
          <Stat label="threshold frequency" tex="f_0 = \phi/h" value={r.thresholdF} unit="Hz" />
          <Stat label="max kinetic energy" tex="K_{max}" value={r.kMaxEV} unit="eV" tone="text-accent" />
          <Stat label="stopping voltage" tex="V_0" value={r.stoppingV} unit="V" />
          <Stat label="max electron speed" value={r.vMax} unit="m s⁻¹" />
          <Stat label="photocurrent (relative)" value={I} tone={I > 0 ? 'text-good' : 'text-bad'} />
        </>
      }
      graphs={
        <>
          <GraphCard title="Current vs anode voltage" note="Saturation current ∝ intensity; the cut-off voltage −V₀ depends only on frequency (both intensities share it).">
            <Graph data={ivData} xKey="V" xLabel="anode voltage V (V)" yLabel="photocurrent (rel.)" series={[{ key: 'I', label: 'current intensity' }, { key: 'I2', label: 'double intensity', dashed: true }]} refX={[{ x: s.V }]} legend height={210} />
          </GraphCard>
          <GraphCard title="K_max vs frequency" note="Gradient = h; x-intercept = f₀; extend the line to the y-axis to find −φ.">
            <Graph data={kfData} xKey="f" xLabel="f (× 10¹⁴ Hz)" yLabel="K_max (eV)" series={[{ key: 'K', label: 'K_max' }]} dots={[{ x: s.f14, y: r.kMaxEV }]} refX={[{ x: r.thresholdF / 1e14, label: 'f₀' }]} height={210} />
          </GraphCard>
        </>
      }
      below={
        <div className="grid gap-2 md:grid-cols-3">
          {statements.map((st, i) => (
            <Callout key={i} kind={st.ok ? 'tip' : 'warn'}>
              {st.text}
            </Callout>
          ))}
        </div>
      }
      formulas={['K_{max} = hf - \\phi', 'f_0 = \\dfrac{\\phi}{h}', 'eV_0 = K_{max}', 'E = hf']}
      explanation={
        <>
          <p>Each photon transfers all its energy hf to one electron. If hf exceeds the work function φ, the electron can escape with up to K_max = hf − φ. Brighter light means more photons per second — more electrons — but not faster ones.</p>
          <p>The classical wave model predicted that brighter light of any frequency would eventually eject electrons and give them more energy. Neither happens.</p>
        </>
      }
      prediction={{
        q: 'Red light (4.5 × 10¹⁴ Hz) on sodium (φ = 2.3 eV) gives no electrons. What will doubling the intensity do?',
        options: ['Eject slow electrons', 'Eject fast electrons', 'Still no electrons', 'Eject electrons after a delay'],
        answer: 2,
        explain: 'hf = 1.86 eV < 2.3 eV for every photon — more photons cannot help in the single-photon model.',
      }}
      assumptions={['One photon is absorbed by one electron (single-photon process).', 'Clean metal surface; representative work functions.', 'Photocurrent model: saturation ∝ intensity; linear fall-off to zero at −V₀ (simplified).']}
      limitations={['Real I–V curves are smoother (contact potentials, electron energy distribution).', 'Electron speeds on screen are scaled; photon count is illustrative.', 'Multi-photon absorption (very intense lasers) is outside the standard model.']}
    >
      <div ref={ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Phototube: light ejects electrons from a metal cathode towards an anode">
          <rect x={60} y={40} width={440} height={H - 80} rx={30} fill="none" className="stroke-line" strokeWidth={2} />
          <rect x={cathodeX - 10} y={60} width={10} height={180} className="fill-muted" />
          <Label x={cathodeX - 5} y={258} anchor="middle" size={11}>cathode ({s.metal})</Label>
          <rect x={anodeX} y={60} width={10} height={180} className="fill-muted" />
          <Label x={anodeX + 5} y={258} anchor="middle" size={11}>anode ({s.V >= 0 ? '+' : ''}{s.V.toFixed(2)} V)</Label>
          {photons.current.map((p, i) => (
            <path key={i} d={`M${p.x - 14},${p.y} q3.5,-5 7,0 t7,0`} fill="none" stroke={colour} strokeWidth={2} />
          ))}
          {electrons.current.map((e, i) => (
            <circle key={i} cx={e.x} cy={e.y} r={3} className="fill-accent" />
          ))}
          <Label x={12} y={22} size={11} className="fill-muted">
            Wavy lines: photons ({visible ? 'colour of light' : lamNm < 380 ? 'UV, drawn violet' : 'IR, drawn red'}). Dots: photoelectrons.
          </Label>
          <Label x={W - 12} y={22} anchor="end" size={12} weight={600} className={collected.current.length ? 'fill-good' : 'fill-muted'}>
            Ammeter: {collected.current.length} e⁻/s (sample)
          </Label>
        </svg>
      </div>
    </SimShell>
  );
}

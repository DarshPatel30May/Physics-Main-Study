import { SimShell } from '@/components/SimShell';
import { Stat, Toggle, Callout, Tex } from '@/components/ui';
import { Arrow, Label } from '@/components/svg';
import { useSimSettings } from '@/lib/store';
import { bohrEnergyEV, rydbergWavelength, SERIES } from '@/lib/physics/atomic';
import { C } from '@/lib/physics/constants';
import { wavelengthToRGB } from '@/lib/physics/optics';
import { sigTex } from '@/lib/physics/stats';

const DEFAULTS = { ni: 3, nf: 2, absorb: false };
const W = 600;
const H = 380;
const NMAX = 6;
const Y = (E: number) => 30 + ((E - 0) / -13.6) * 300; // E in eV, 0 at top

export default function HydrogenSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('hydrogen', DEFAULTS);
  const ni = Math.max(s.ni, s.nf + 1);
  const lam = rydbergWavelength(s.nf, ni);
  const E = (C.h * C.c) / lam;
  const nm = lam * 1e9;
  const visible = nm >= 380 && nm <= 750;
  const colour = visible ? wavelengthToRGB(nm) : nm < 380 ? '#a78bfa' : '#f87171';
  const balmer = [3, 4, 5, 6].map((n) => rydbergWavelength(2, n) * 1e9);

  return (
    <SimShell
      id="hydrogen"
      compact={compact}
      onReset={reset}
      controls={
        <>
          <div>
            <div className="label mb-1">Upper level n_i</div>
            <div className="flex flex-wrap gap-1">
              {[2, 3, 4, 5, 6].map((n) => (
                <button key={n} disabled={n <= s.nf} className={`btn !px-2.5 ${ni === n ? '!border-accent text-accent' : ''}`} onClick={() => set({ ni: n })}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="label mb-1">Lower level n_f</div>
            <div className="flex flex-wrap gap-1">
              {[1, 2, 3, 4].map((n) => (
                <button key={n} className={`btn !px-2.5 ${s.nf === n ? '!border-accent text-accent' : ''}`} onClick={() => set({ nf: n, ni: Math.max(s.ni, n + 1) })}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          <Toggle label="Show as absorption (upward transition)" checked={s.absorb} onChange={(absorb) => set({ absorb })} />
        </>
      }
      readouts={
        <>
          <Stat label="series" value={SERIES[s.nf]} />
          <Stat label="energy of level n_i" value={bohrEnergyEV(ni)} unit="eV" />
          <Stat label="energy of level n_f" value={bohrEnergyEV(s.nf)} unit="eV" />
          <Stat label="photon energy" value={E / C.eV} unit="eV" tone="text-accent" />
          <Stat label="photon energy" value={E} unit="J" />
          <Stat label="wavelength" value={nm} unit="nm" />
          <Stat label="frequency" value={C.c / lam} unit="Hz" />
          <Stat label="region" value={visible ? 'visible' : nm < 380 ? 'ultraviolet' : 'infrared'} />
        </>
      }
      below={
        <div className="grid gap-3 md:grid-cols-2">
          <div className="text-sm">
            <div className="label mb-1">Working (Rydberg equation)</div>
            <Tex block>{`\\frac{1}{\\lambda} = 1.097\\times10^7\\left(\\frac{1}{${s.nf}^2} - \\frac{1}{${ni}^2}\\right) = ${sigTex(1 / lam, 4)}\\ \\text{m}^{-1}`}</Tex>
            <Tex block>{`\\lambda = ${sigTex(lam, 4)}\\ \\text{m},\\quad E = \\frac{hc}{\\lambda} = ${sigTex(E, 3)}\\ \\text{J} = ${sigTex(E / C.eV, 3)}\\ \\text{eV}`}</Tex>
          </div>
          <Callout kind="info" title="Balmer series (n_f = 2)">
            The four visible hydrogen lines: {balmer.map((b) => b.toFixed(1)).join(', ')} nm (red Hα, blue-green Hβ, violet Hγ, Hδ). Ionisation energy from n = 1 is 13.6 eV.
          </Callout>
        </div>
      }
      formulas={['\\dfrac{1}{\\lambda} = R\\left(\\dfrac{1}{n_f^2} - \\dfrac{1}{n_i^2}\\right)', 'E = hf = \\dfrac{hc}{\\lambda}', 'E_n = -\\dfrac{13.6\\ \\text{eV}}{n^2}']}
      explanation={
        <>
          <p>Hydrogen’s electron can only have certain energies. When it drops from a higher level to a lower level, it emits one photon carrying exactly the energy difference (conservation of energy). Absorbing a photon of the same energy raises it back up.</p>
          <p>Because the levels are fixed, hydrogen emits only specific wavelengths — a line spectrum. Transitions to n = 1 are ultraviolet (Lyman), to n = 2 visible (Balmer), to n = 3 infrared (Paschen).</p>
        </>
      }
      prediction={{
        q: 'Which transition emits the shortest wavelength: 3→2, 4→2 or 2→1?',
        options: ['3 → 2', '4 → 2', '2 → 1', 'All equal'],
        answer: 2,
        explain: '2→1 has the biggest energy gap (10.2 eV), so the highest frequency and shortest wavelength (122 nm, UV).',
      }}
      assumptions={['Hydrogen (one electron), Bohr energy levels; Rydberg constant from the data sheet.']}
      limitations={['Fine structure and the intensities of lines are not modelled.', 'Level spacing drawn to scale in energy; orbit sizes are not shown (the quantum model has no fixed orbits).']}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Hydrogen energy level diagram">
        {Array.from({ length: NMAX }, (_, i) => i + 1).map((n) => (
          <g key={n}>
            <line x1={80} y1={Y(bohrEnergyEV(n))} x2={420} y2={Y(bohrEnergyEV(n))} className={n === ni || n === s.nf ? 'stroke-accent' : 'stroke-muted'} strokeWidth={n === ni || n === s.nf ? 2.5 : 1.2} />
            <Label x={70} y={Y(bohrEnergyEV(n)) + 4} anchor="end" size={11}>n = {n}</Label>
            <Label x={430} y={Y(bohrEnergyEV(n)) + 4} size={10} className="fill-muted">{bohrEnergyEV(n).toFixed(2)} eV</Label>
          </g>
        ))}
        <line x1={80} y1={Y(0)} x2={420} y2={Y(0)} className="stroke-line" strokeDasharray="4 4" />
        <Label x={430} y={Y(0) + 4} size={10} className="fill-muted">0 eV (ionised)</Label>
        {s.absorb ? (
          <Arrow x1={250} y1={Y(bohrEnergyEV(s.nf))} x2={250} y2={Y(bohrEnergyEV(ni))} className="text-good" width={3} label="absorbs" />
        ) : (
          <Arrow x1={250} y1={Y(bohrEnergyEV(ni))} x2={250} y2={Y(bohrEnergyEV(s.nf))} className="text-bad" width={3} label="emits" />
        )}
        <path d={`M262,${(Y(bohrEnergyEV(ni)) + Y(bohrEnergyEV(s.nf))) / 2} q8,-8 16,0 t16,0 t16,0 t16,0`} fill="none" stroke={colour} strokeWidth={3} />
        <Label x={340} y={(Y(bohrEnergyEV(ni)) + Y(bohrEnergyEV(s.nf))) / 2 + 4} size={11} weight={600}>
          {nm.toFixed(1)} nm
        </Label>
        {/* Balmer spectrum strip */}
        <rect x={470} y={40} width={110} height={300} className="fill-black" />
        {balmer.map((b) => (
          <rect key={b} x={470} y={40 + ((750 - b) / 370) * 300} width={110} height={3} fill={wavelengthToRGB(b)} opacity={s.nf === 2 && Math.abs(b - nm) < 0.5 ? 1 : 0.6} />
        ))}
        <Label x={525} y={32} anchor="middle" size={10}>Balmer lines</Label>
        <Label x={525} y={356} anchor="middle" size={10} className="fill-muted">380–750 nm</Label>
      </svg>
    </SimShell>
  );
}

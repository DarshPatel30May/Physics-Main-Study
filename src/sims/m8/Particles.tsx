import { useState } from 'react';
import { SimShell } from '@/components/SimShell';
import { Stat, Select, Callout } from '@/components/ui';
import { Arrow, Label } from '@/components/svg';
import { useSimSettings } from '@/lib/store';

type Tab = 'model' | 'builder' | 'forces' | 'detector' | 'accelerator' | 'timeline';
const DEFAULTS = { tab: 'model' as Tab };

/** Standard Model particles — masses from the Particle Data Group (rounded). */
const SM = [
  { s: 'u', name: 'up', group: 'quark', gen: 1, charge: '+⅔', mass: '2.2 MeV/c²', found: 1968, note: 'Inside protons and neutrons; evidence from deep inelastic scattering (SLAC).' },
  { s: 'c', name: 'charm', group: 'quark', gen: 2, charge: '+⅔', mass: '1.27 GeV/c²', found: 1974, note: 'J/ψ meson discovered simultaneously at SLAC and Brookhaven.' },
  { s: 't', name: 'top', group: 'quark', gen: 3, charge: '+⅔', mass: '173 GeV/c²', found: 1995, note: 'Heaviest known fundamental particle (Fermilab).' },
  { s: 'd', name: 'down', group: 'quark', gen: 1, charge: '−⅓', mass: '4.7 MeV/c²', found: 1968, note: 'Inside protons (uud) and neutrons (udd).' },
  { s: 's', name: 'strange', group: 'quark', gen: 2, charge: '−⅓', mass: '93 MeV/c²', found: 1968, note: 'Strange particles (kaons) observed in cosmic rays from 1947.' },
  { s: 'b', name: 'bottom', group: 'quark', gen: 3, charge: '−⅓', mass: '4.18 GeV/c²', found: 1977, note: 'Upsilon meson (Fermilab).' },
  { s: 'e', name: 'electron', group: 'lepton', gen: 1, charge: '−1', mass: '0.511 MeV/c²', found: 1897, note: 'J. J. Thomson’s cathode rays.' },
  { s: 'μ', name: 'muon', group: 'lepton', gen: 2, charge: '−1', mass: '105.7 MeV/c²', found: 1936, note: 'Found in cosmic rays (Anderson & Neddermeyer).' },
  { s: 'τ', name: 'tau', group: 'lepton', gen: 3, charge: '−1', mass: '1.777 GeV/c²', found: 1975, note: 'SLAC (Perl).' },
  { s: 'νe', name: 'electron neutrino', group: 'lepton', gen: 1, charge: '0', mass: '< 1 eV/c²', found: 1956, note: 'Predicted by Pauli (1930) to save energy conservation in β decay; detected by Cowan & Reines.' },
  { s: 'νμ', name: 'muon neutrino', group: 'lepton', gen: 2, charge: '0', mass: '< 1 eV/c²', found: 1962, note: 'Brookhaven.' },
  { s: 'ντ', name: 'tau neutrino', group: 'lepton', gen: 3, charge: '0', mass: '< 1 eV/c²', found: 2000, note: 'DONUT experiment, Fermilab.' },
  { s: 'g', name: 'gluon', group: 'boson', gen: 0, charge: '0', mass: '0', found: 1979, note: 'Carrier of the strong force (three-jet events, DESY).' },
  { s: 'γ', name: 'photon', group: 'boson', gen: 0, charge: '0', mass: '0', found: 1905, note: 'Carrier of the electromagnetic force (Einstein 1905; Compton 1923).' },
  { s: 'Z', name: 'Z boson', group: 'boson', gen: 0, charge: '0', mass: '91.2 GeV/c²', found: 1983, note: 'Weak force carrier (CERN UA1/UA2).' },
  { s: 'W', name: 'W bosons', group: 'boson', gen: 0, charge: '±1', mass: '80.4 GeV/c²', found: 1983, note: 'Weak force carriers; mediate beta decay (CERN).' },
  { s: 'H', name: 'Higgs boson', group: 'higgs', gen: 0, charge: '0', mass: '125 GeV/c²', found: 2012, note: 'Associated with the field that gives W, Z and fermions mass (ATLAS & CMS, CERN).' },
];

const QUARKS: Record<string, number> = { u: 2 / 3, d: -1 / 3, s: -1 / 3, c: 2 / 3, b: -1 / 3, t: 2 / 3 };
const HADRONS: { q: string; name: string; type: string }[] = [
  { q: 'uud', name: 'proton (p)', type: 'baryon' },
  { q: 'udd', name: 'neutron (n)', type: 'baryon' },
  { q: 'uuu', name: 'Δ⁺⁺', type: 'baryon' },
  { q: 'ddd', name: 'Δ⁻', type: 'baryon' },
  { q: 'uds', name: 'Λ⁰ (lambda)', type: 'baryon' },
  { q: 'uus', name: 'Σ⁺ (sigma)', type: 'baryon' },
  { q: 'sss', name: 'Ω⁻ (omega) — predicted by Gell-Mann, found 1964', type: 'baryon' },
  { q: 'ud̄', name: 'π⁺ (pion)', type: 'meson' },
  { q: 'dū', name: 'π⁻ (pion)', type: 'meson' },
  { q: 'uū', name: 'π⁰ (mixture of uū and dd̄)', type: 'meson' },
  { q: 'dd̄', name: 'π⁰ (mixture of uū and dd̄)', type: 'meson' },
  { q: 'us̄', name: 'K⁺ (kaon)', type: 'meson' },
  { q: 'sū', name: 'K⁻ (kaon)', type: 'meson' },
  { q: 'cc̄', name: 'J/ψ', type: 'meson' },
  { q: 'bb̄', name: 'Υ (upsilon)', type: 'meson' },
];

const FORCES = [
  { name: 'Strong', carrier: 'gluons', acts: 'quarks (and gluons)', range: '~10⁻¹⁵ m', rel: '1', note: 'Binds quarks into hadrons; residual strong force binds nucleons in nuclei.' },
  { name: 'Electromagnetic', carrier: 'photon', acts: 'charged particles', range: 'infinite (∝ 1/r²)', rel: '10⁻²', note: 'Atoms, chemistry, light.' },
  { name: 'Weak', carrier: 'W⁺, W⁻, Z⁰', acts: 'quarks and leptons', range: '~10⁻¹⁸ m', rel: '10⁻⁶', note: 'Beta decay; changes quark flavour (d → u). Powers the first step of the pp chain.' },
  { name: 'Gravity', carrier: '(graviton — hypothetical)', acts: 'all mass–energy', range: 'infinite (∝ 1/r²)', rel: '10⁻³⁹', note: 'NOT part of the Standard Model.' },
];

const TIMELINE = [
  [1897, 'Electron (Thomson)'],
  [1911, 'Nucleus (Rutherford)'],
  [1919, 'Proton identified (Rutherford)'],
  [1932, 'Neutron (Chadwick); positron (Anderson)'],
  [1936, 'Muon (cosmic rays)'],
  [1947, 'Pion and kaons (cosmic rays)'],
  [1956, 'Electron neutrino detected'],
  [1964, 'Quark model proposed (Gell-Mann, Zweig); Ω⁻ found'],
  [1968, 'Deep inelastic scattering: quarks inside protons (SLAC)'],
  [1974, 'Charm quark (J/ψ)'],
  [1983, 'W and Z bosons (CERN)'],
  [1995, 'Top quark (Fermilab)'],
  [2012, 'Higgs boson (CERN LHC)'],
] as const;

const W = 600;
const H = 300;

export default function ParticlesSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('particles', DEFAULTS);
  const [sel, setSel] = useState(SM[0]);
  const [picks, setPicks] = useState<string[]>(['u', 'u', 'd']);
  const [anti, setAnti] = useState(false);
  const comp = anti ? `${picks[0]}${picks[1]}̄` : picks.join('');
  const charge = anti ? (QUARKS[picks[0]] ?? 0) - (QUARKS[picks[1]] ?? 0) : picks.reduce((t, q) => t + (QUARKS[q] ?? 0), 0);
  const sortStr = (x: string) => x.split('').sort().join('');
  const match = HADRONS.find((h) => (anti ? h.q === comp : h.type === 'baryon' && sortStr(h.q) === sortStr(comp)));
  const fmtCharge = (c: number) => {
    const r = Math.round(c * 3);
    return r % 3 === 0 ? `${r / 3 > 0 ? '+' : ''}${r / 3}` : `${r > 0 ? '+' : '−'}${Math.abs(r)}/3`;
  };

  const tabView = () => {
    switch (s.tab) {
      case 'model':
        return (
          <div className="grid gap-4 p-3 lg:grid-cols-[1fr_260px]">
            <div className="grid grid-cols-5 gap-1.5">
              {[0, 1, 2].map((row) =>
                [
                  ...(row === 0 ? [SM[0], SM[1], SM[2], SM[12], SM[16]] : row === 1 ? [SM[3], SM[4], SM[5], SM[13], null] : [SM[6], SM[7], SM[8], SM[14], null]),
                ].map((p, i) =>
                  p ? (
                    <button key={`${row}-${i}`} onClick={() => setSel(p)} className={`rounded-xl border p-2 text-left transition ${sel === p ? 'border-accent ring-1 ring-accent' : 'border-line'} ${p.group === 'quark' ? 'bg-m6/10' : p.group === 'lepton' ? 'bg-m8/10' : p.group === 'boson' ? 'bg-m7/10' : 'bg-bad/10'}`}>
                      <div className="font-display text-2xl leading-none">{p.s}</div>
                      <div className="mt-1 text-[10px] text-muted">{p.name}</div>
                      <div className="num text-[10px]">{p.charge}</div>
                    </button>
                  ) : (
                    <div key={`${row}-${i}`} />
                  ),
                ),
              )}
              {[SM[9], SM[10], SM[11], SM[15]].map((p) => (
                <button key={p.s} onClick={() => setSel(p)} className={`rounded-xl border p-2 text-left ${sel === p ? 'border-accent ring-1 ring-accent' : 'border-line'} ${p.group === 'lepton' ? 'bg-m8/10' : 'bg-m7/10'}`}>
                  <div className="font-display text-2xl leading-none">{p.s}</div>
                  <div className="mt-1 text-[10px] text-muted">{p.name}</div>
                  <div className="num text-[10px]">{p.charge}</div>
                </button>
              ))}
            </div>
            <div className="space-y-2 text-sm">
              <div className="font-display text-3xl">{sel.s}</div>
              <div className="font-semibold capitalize">{sel.name}</div>
              <div className="chip">{sel.group === 'higgs' ? 'scalar boson' : sel.group}</div>
              <p>Charge: {sel.charge} e · Mass: {sel.mass}{sel.gen ? ` · Generation ${sel.gen}` : ''}</p>
              <p>Observed: {sel.found}</p>
              <p className="text-muted">{sel.note}</p>
            </div>
          </div>
        );
      case 'builder':
        return (
          <div className="space-y-3 p-4 text-sm">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={anti} onChange={(e) => { setAnti(e.target.checked); setPicks(e.target.checked ? ['u', 'd'] : ['u', 'u', 'd']); }} />
                Meson (quark + antiquark)
              </label>
            </div>
            <div className="flex flex-wrap gap-3">
              {(anti ? [0, 1] : [0, 1, 2]).map((i) => (
                <div key={i}>
                  <div className="label mb-1">{anti ? (i === 0 ? 'quark' : 'antiquark') : `quark ${i + 1}`}</div>
                  <div className="flex gap-1">
                    {Object.keys(QUARKS).map((q) => (
                      <button key={q} onClick={() => setPicks((p) => p.map((x, j) => (j === i ? q : x)))} className={`btn !px-2 font-display ${picks[i] === q ? '!border-accent text-accent' : ''}`}>
                        {q}
                        {anti && i === 1 ? '̄' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <Stat label="composition" value={comp} />
              <Stat label="total charge" value={`${fmtCharge(charge)} e`} tone="text-accent" />
              <Stat label="particle" value={match ? match.name : 'not a common hadron (or not in this list)'} />
            </div>
            <p className="text-xs text-muted">Baryons (3 quarks) have baryon number +1 and are fermions; mesons (quark + antiquark) have baryon number 0 and are bosons. Quarks are never observed alone (confinement).</p>
          </div>
        );
      case 'forces':
        return (
          <div className="overflow-x-auto p-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="p-2">Force</th>
                  <th className="p-2">Carrier</th>
                  <th className="p-2">Acts on</th>
                  <th className="p-2">Range</th>
                  <th className="p-2">Relative strength</th>
                  <th className="p-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {FORCES.map((f) => (
                  <tr key={f.name} className="border-t border-line align-top">
                    <td className="p-2 font-semibold">{f.name}</td>
                    <td className="p-2">{f.carrier}</td>
                    <td className="p-2">{f.acts}</td>
                    <td className="p-2">{f.range}</td>
                    <td className="num p-2">{f.rel}</td>
                    <td className="p-2 text-muted">{f.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              <Callout kind="info" title="Leptons vs hadrons">
                Leptons (electron, muon, tau, neutrinos) are fundamental and do not feel the strong force. Hadrons (baryons and mesons) are made of quarks and do feel it.
              </Callout>
              <Callout kind="warn" title="Understanding is incomplete">
                The Standard Model omits gravity, does not explain dark matter or dark energy, and needed extending for neutrino masses.
              </Callout>
            </div>
          </div>
        );
      case 'detector':
        return (
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Layers of a general-purpose particle detector with particle signatures">
            {[
              { r: 40, c: '#64748b', l: 'Tracker (curved tracks in B field: momentum & charge)' },
              { r: 70, c: '#22d3ee', l: 'EM calorimeter (stops e±, γ)' },
              { r: 100, c: '#fbbf24', l: 'Hadron calorimeter (stops p, n, π)' },
              { r: 130, c: '#a78bfa', l: 'Muon chambers (only muons reach here)' },
            ].reverse().map((L) => (
              <circle key={L.r} cx={150} cy={H / 2} r={L.r} fill={L.c} opacity={0.18} stroke={L.c} />
            ))}
            <path d={`M150,${H / 2} q30,-10 60,-40`} fill="none" stroke="#f87171" strokeWidth={2} />
            <path d={`M150,${H / 2} q30,10 55,45`} fill="none" stroke="#4ade80" strokeWidth={2} />
            <line x1={150} y1={H / 2} x2={150} y2={H / 2 - 120} stroke="#fbbf24" strokeWidth={2} strokeDasharray="4 3" />
            <path d={`M150,${H / 2} q-40,5 -140,30`} fill="none" stroke="#a78bfa" strokeWidth={2} />
            {[
              { y: 40, c: '#64748b', l: 'Tracker — curved tracks in a magnetic field: momentum (r = p/qB) & sign of charge' },
              { y: 80, c: '#22d3ee', l: 'Electromagnetic calorimeter — absorbs electrons and photons' },
              { y: 120, c: '#fbbf24', l: 'Hadron calorimeter — absorbs protons, neutrons, pions' },
              { y: 160, c: '#a78bfa', l: 'Muon chambers — muons penetrate everything else' },
              { y: 200, c: '#94a3b8', l: 'Neutrinos escape undetected → inferred from “missing” momentum' },
            ].map((L) => (
              <g key={L.y}>
                <rect x={300} y={L.y - 10} width={12} height={12} fill={L.c} />
                <Label x={318} y={L.y} size={10}>{L.l}</Label>
              </g>
            ))}
            <Label x={12} y={H - 10} size={10} className="fill-muted">Schematic cross-section (e.g. ATLAS, CMS). Not to scale.</Label>
          </svg>
        );
      case 'accelerator':
        return (
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Linear accelerator feeding a synchrotron ring">
            {Array.from({ length: 6 }, (_, i) => (
              <rect key={i} x={30 + i * 32} y={H / 2 - 10} width={20 + i * 2} height={20} rx={3} className="fill-m7" opacity={0.7} />
            ))}
            <Label x={30} y={H / 2 + 34} size={10}>linac: electric fields between drift tubes accelerate charged particles</Label>
            <Arrow x1={240} y1={H / 2} x2={300} y2={H / 2} className="text-accent" />
            <circle cx={420} cy={H / 2} r={110} fill="none" className="stroke-accent" strokeWidth={3} />
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * 2 * Math.PI;
              return <rect key={i} x={420 + 110 * Math.cos(a) - 7} y={H / 2 - 110 * Math.sin(a) - 7} width={14} height={14} className="fill-m5" transform={`rotate(${(-a * 180) / Math.PI} ${420 + 110 * Math.cos(a)} ${H / 2 - 110 * Math.sin(a)})`} />;
            })}
            <rect x={420 - 10} y={H / 2 + 104} width={20} height={14} className="fill-bad" />
            <Label x={420} y={H / 2 + 5} anchor="middle" size={10}>synchrotron ring</Label>
            <Label x={420} y={H / 2 + 20} anchor="middle" size={9} className="fill-muted">blue: bending magnets (r = p/qB)</Label>
            <Label x={420} y={H / 2 + 34} anchor="middle" size={9} className="fill-muted">red: RF cavity (electric field kicks)</Label>
            <Label x={12} y={22} size={11} className="fill-muted">Electric fields accelerate; magnetic fields steer and focus. B is ramped up as momentum rises to keep r constant.</Label>
          </svg>
        );
      default:
        return (
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Timeline of particle discoveries">
            <line x1={30} y1={H / 2} x2={W - 30} y2={H / 2} className="stroke-muted" strokeWidth={2} />
            {TIMELINE.map(([y, l], i) => {
              const x = 30 + ((y - 1890) / (2020 - 1890)) * (W - 60);
              const up = i % 2 === 0;
              return (
                <g key={y}>
                  <circle cx={x} cy={H / 2} r={5} className="fill-accent" />
                  <line x1={x} y1={H / 2} x2={x} y2={up ? H / 2 - 30 - (i % 4) * 18 : H / 2 + 30 + (i % 4) * 18} className="stroke-line" />
                  <Label x={x} y={up ? H / 2 - 36 - (i % 4) * 18 : H / 2 + 44 + (i % 4) * 18} anchor="middle" size={9}>
                    {y}: {l.length > 30 ? l.slice(0, 30) + '…' : l}
                  </Label>
                </g>
              );
            })}
          </svg>
        );
    }
  };

  return (
    <SimShell
      id="particles"
      compact={compact}
      onReset={reset}
      controls={
        <Select
          label="View"
          value={s.tab}
          onChange={(tab) => set({ tab })}
          options={[
            { value: 'model', label: 'Standard Model chart' },
            { value: 'builder', label: 'Quark composition builder' },
            { value: 'forces', label: 'Forces; leptons vs hadrons' },
            { value: 'detector', label: 'Particle detector' },
            { value: 'accelerator', label: 'Particle accelerator' },
            { value: 'timeline', label: 'Discovery timeline' },
          ]}
        />
      }
      below={
        <Callout kind="model" title="Observed vs theoretical vs simplified">
          All 17 Standard Model particles shown have been observed experimentally (quarks only inside hadrons). The graviton is hypothetical. Diagrams of detectors and accelerators are simplified educational sketches.
        </Callout>
      }
      formulas={['r = \\dfrac{p}{qB}', 'E = mc^2', '\\lambda = \\dfrac{h}{p}']}
      explanation={
        <>
          <p>The Standard Model describes all known matter with 6 quarks and 6 leptons (plus their antiparticles), forces carried by gauge bosons, and the Higgs boson.</p>
          <p>Evidence comes from particle accelerators: high-energy collisions convert kinetic energy into new particles (E = mc²), and short de Broglie wavelengths probe tiny structures.</p>
        </>
      }
      prediction={{
        q: 'A particle is made of a strange quark and an anti-up quark (sū). What is its charge?',
        options: ['+1', '−1', '0', '+⅓'],
        answer: 1,
        explain: 's (−⅓) + ū (−⅔) = −1: this is the K⁻ meson.',
      }}
      assumptions={['Masses rounded from Particle Data Group values; neutrino masses are upper limits.']}
      limitations={['Colour charge, spin and antiparticles are summarised, not modelled.', 'Hadron list is not exhaustive.']}
    >
      {tabView()}
    </SimShell>
  );
}

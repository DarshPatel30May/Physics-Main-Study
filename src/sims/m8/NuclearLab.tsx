import { useMemo, useState } from 'react';
import { SimShell, GraphCard } from '@/components/SimShell';
import { Stat, Select, Callout, Tex, NumberField, parseNum } from '@/components/ui';
import { Graph } from '@/components/Graph';
import { Label } from '@/components/svg';
import { useSimSettings } from '@/lib/store';
import { ISOTOPES, ELEMENTS, daughter, ATOMIC_MASS, BE_PER_NUCLEON, bindingEnergy, parseNuclide, stableZ, mulberry32 } from '@/lib/physics/nuclear';
import { C } from '@/lib/physics/constants';

type Tab = 'isotopes' | 'stability' | 'binding' | 'defect' | 'balance';
const DEFAULTS = { tab: 'isotopes' as Tab, iso: 'C-14', nuc: 'He-4' };

const sym = (Z: number) => (Z === 0 ? 'n' : ELEMENTS[Z - 1] ?? '?');
const nuclideTex = (A: number, Z: number, s?: string) => `{}^{${A}}_{${Z}}\\text{${s ?? sym(Z)}}`;

/** Balancing practice: real reactions; one single particle is hidden. [A, Z, symbol, count] */
type Part = readonly [number, number, string, number];
const REACTIONS: { left: Part[]; right: Part[]; name: string }[] = [
  { left: [[238, 92, 'U', 1]], right: [[234, 90, 'Th', 1], [4, 2, 'He', 1]], name: 'Alpha decay of uranium-238' },
  { left: [[14, 6, 'C', 1]], right: [[14, 7, 'N', 1], [0, -1, 'e', 1]], name: 'Beta-minus decay of carbon-14 (plus an antineutrino)' },
  { left: [[18, 9, 'F', 1]], right: [[18, 8, 'O', 1], [0, 1, 'e', 1]], name: 'Beta-plus decay of fluorine-18 (plus a neutrino)' },
  { left: [[1, 0, 'n', 1], [235, 92, 'U', 1]], right: [[141, 56, 'Ba', 1], [92, 36, 'Kr', 1], [1, 0, 'n', 3]], name: 'Fission of uranium-235' },
  { left: [[2, 1, 'H', 1], [3, 1, 'H', 1]], right: [[4, 2, 'He', 1], [1, 0, 'n', 1]], name: 'D–T fusion' },
  { left: [[4, 2, 'He', 1], [9, 4, 'Be', 1]], right: [[12, 6, 'C', 1], [1, 0, 'n', 1]], name: 'Chadwick’s neutron discovery (1932)' },
  { left: [[4, 2, 'He', 1], [14, 7, 'N', 1]], right: [[17, 8, 'O', 1], [1, 1, 'H', 1]], name: 'Rutherford’s first artificial transmutation (1919)' },
  { left: [[226, 88, 'Ra', 1]], right: [[222, 86, 'Rn', 1], [4, 2, 'He', 1]], name: 'Alpha decay of radium-226' },
];

export default function NuclearLabSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('nuclear-lab', DEFAULTS);
  const iso = ISOTOPES.find((i) => i.key === s.iso) ?? ISOTOPES[2];
  const d = daughter(iso.Z, iso.A, iso.mode);
  const emitted = iso.mode === 'alpha' ? nuclideTex(4, 2, 'He') : iso.mode === 'beta-' ? '{}^{\\;0}_{-1}e + \\bar\\nu_e' : iso.mode === 'beta+' ? '{}^{0}_{+1}e + \\nu_e' : '\\gamma';

  // mass defect calculator
  const nucKey = s.nuc;
  const nuc = parseNuclide(nucKey);
  const M = ATOMIC_MASS[nucKey];
  const be = bindingEnergy(nuc.Z, nuc.A, M);

  // balancing practice
  const [rIdx, setRIdx] = useState(0);
  const [hide, setHide] = useState<{ side: 'left' | 'right'; i: number }>({ side: 'right', i: 1 });
  const [ansA, setAnsA] = useState('');
  const [ansZ, setAnsZ] = useState('');
  const [checked, setChecked] = useState<null | boolean>(null);
  const R = REACTIONS[rIdx];
  const hidden = R[hide.side][hide.i];
  const nextReaction = () => {
    const r = mulberry32((Date.now() % 100000) + rIdx)();
    const i = (rIdx + 1 + Math.floor(r * (REACTIONS.length - 1))) % REACTIONS.length;
    const RR = REACTIONS[i];
    const options = (['left', 'right'] as const).flatMap((side) => RR[side].map((p, j) => ({ side, j, single: p[3] === 1 }))).filter((o) => o.single);
    const pick = options[Math.floor(r * 997) % options.length];
    setRIdx(i);
    setHide({ side: pick.side, i: pick.j });
    setAnsA('');
    setAnsZ('');
    setChecked(null);
  };
  const partTex = (p: Part) => (p[2] === 'e' ? `{}^{${p[0]}}_{${p[1] > 0 ? '+' : ''}${p[1]}}e` : nuclideTex(p[0], p[1], p[2]));
  const showSide = (side: 'left' | 'right') =>
    R[side].map((p, i) => (side === hide.side && i === hide.i ? '\\boxed{\\;?\\;}' : `${p[3] > 1 ? `${p[3]}\\,` : ''}${partTex(p)}`)).join(' + ');

  // stability chart data
  const band = useMemo(() => Array.from({ length: 120 }, (_, i) => {
    const A = 2 + i * 2;
    const Z = stableZ(A);
    return { Z, N: A - Z };
  }), []);
  const W = 520;
  const H = 360;
  const sx = (Z: number) => 50 + (Z / 100) * (W - 70);
  const sy = (N: number) => H - 40 - (N / 150) * (H - 60);

  const beData = BE_PER_NUCLEON.map((b) => ({ A: b.A, be: b.be }));

  return (
    <SimShell
      id="nuclear-lab"
      compact={compact}
      onReset={reset}
      controls={
        <>
          <Select
            label="Tool"
            value={s.tab}
            onChange={(tab) => set({ tab })}
            options={[
              { value: 'isotopes', label: 'Isotope explorer' },
              { value: 'stability', label: 'Nuclear stability (N vs Z)' },
              { value: 'binding', label: 'Binding energy per nucleon' },
              { value: 'defect', label: 'Mass defect calculator' },
              { value: 'balance', label: 'Balance nuclear equations' },
            ]}
          />
          {(s.tab === 'isotopes' || s.tab === 'stability') && (
            <Select label="Isotope" value={s.iso} onChange={(isoK) => set({ iso: isoK })} options={ISOTOPES.map((i) => ({ value: i.key, label: `${i.name} (${i.halfLifeText})` }))} />
          )}
          {s.tab === 'defect' && (
            <Select label="Nuclide" value={s.nuc} onChange={(nucK) => set({ nuc: nucK })} options={Object.keys(ATOMIC_MASS).filter((k) => k !== 'n' && k !== 'H-1').map((k) => ({ value: k, label: k }))} />
          )}
          {s.tab === 'balance' && (
            <>
              <NumberField label="mass number A of the missing particle" value={ansA} onChange={setAnsA} />
              <NumberField label="atomic number Z (charge) of the missing particle" value={ansZ} onChange={setAnsZ} />
              <button
                className="btn-primary w-full"
                onClick={() => setChecked(parseNum(ansA) === hidden[0] && parseNum(ansZ) === hidden[1])}
              >
                Check
              </button>
              <button className="btn w-full" onClick={nextReaction}>
                New reaction
              </button>
            </>
          )}
        </>
      }
      readouts={
        s.tab === 'isotopes' || s.tab === 'stability' ? (
          <>
            <Stat label="protons Z" value={iso.Z} />
            <Stat label="neutrons N" value={iso.A - iso.Z} />
            <Stat label="mass number A" value={iso.A} />
            <Stat label="N/Z" value={(iso.A - iso.Z) / iso.Z} />
            <Stat label="half-life" value={iso.halfLifeText} />
            <Stat label="decay mode" value={iso.mode} tone="text-accent" />
          </>
        ) : s.tab === 'defect' ? (
          <>
            <Stat label="atomic mass" value={M} unit="u" n={7} />
            <Stat label="mass defect" tex="\Delta m" value={be.massDefectU} unit="u" n={5} />
            <Stat label="binding energy" value={be.MeV} unit="MeV" tone="text-accent" />
            <Stat label="binding energy" value={be.J} unit="J" />
            <Stat label="per nucleon" value={be.perNucleon} unit="MeV" />
          </>
        ) : undefined
      }
      graphs={
        s.tab === 'binding' ? (
          <GraphCard title="Binding energy per nucleon vs mass number" note="Peak near Fe-56/Ni-62 (≈ 8.8 MeV). Fusion of light nuclei and fission of heavy nuclei both move towards the peak — releasing energy. Data: AME2020 (selected nuclides).">
            <Graph data={beData} xKey="A" xLabel="mass number A" yLabel="BE per nucleon (MeV)" series={[{ key: 'be', label: 'BE/A', dot: true }]} dots={[{ x: 56, y: 8.79, label: 'Fe-56' }, { x: 4, y: 7.07, label: 'He-4' }, { x: 235, y: 7.59, label: 'U-235' }]} yDomain={[0, 9.5]} height={260} />
          </GraphCard>
        ) : undefined
      }
      below={
        s.tab === 'isotopes' ? (
          <div className="space-y-2">
            <Tex block>{iso.mode === 'stable' ? `${nuclideTex(iso.A, iso.Z)}\\ \\text{is stable}` : iso.mode === 'gamma' ? `${nuclideTex(iso.A, iso.Z)}^{m} \\rightarrow ${nuclideTex(iso.A, iso.Z)} + \\gamma` : `${nuclideTex(iso.A, iso.Z)} \\rightarrow ${nuclideTex(d.A, d.Z)} + ${emitted}`}</Tex>
            <Callout kind="info" title={iso.name}>{iso.use} Check: A and Z (charge) balance on both sides.</Callout>
          </div>
        ) : s.tab === 'defect' ? (
          <div className="space-y-1 text-sm">
            <Tex block>{`\\Delta m = Z\\,m(^1\\text{H}) + N\\,m_n - M = ${nuc.Z}(1.007825) + ${nuc.A - nuc.Z}(1.008665) - ${M.toFixed(6)} = ${be.massDefectU.toFixed(6)}\\ \\text{u}`}</Tex>
            <Tex block>{`E_B = ${be.massDefectU.toFixed(6)} \\times 931.5 = ${be.MeV.toFixed(2)}\\ \\text{MeV},\\quad \\frac{E_B}{A} = ${be.perNucleon.toFixed(3)}\\ \\text{MeV}`}</Tex>
            <p className="text-xs text-muted">Atomic masses (AME2020) include electrons; using m(¹H) rather than m_p makes the electron masses cancel. In kg: Δm × 1.661 × 10⁻²⁷ = {(be.massDefectU * C.u).toExponential(3)} kg.</p>
          </div>
        ) : s.tab === 'balance' ? (
          <div className="space-y-2">
            <div className="text-sm font-semibold">{R.name}</div>
            <Tex block>{`${showSide('left')} \\rightarrow ${showSide('right')}`}</Tex>
            {checked !== null && (
              <p className={`text-sm font-semibold ${checked ? 'text-good' : 'text-bad'}`}>
                {checked ? `Correct — the missing particle is ${partTex(hidden).replace(/[{}\\]|text/g, '')}: nucleon number and charge are conserved.` : 'Not balanced: make the top numbers (A) and bottom numbers (Z) add up to the same totals on both sides.'}
              </p>
            )}
          </div>
        ) : s.tab === 'stability' ? (
          <Callout kind="model" title="The band of stability">
            Light stable nuclei have N ≈ Z; heavy stable nuclei need more neutrons (N/Z ≈ 1.5 for lead) to offset proton–proton repulsion. Nuclei above the band (too many neutrons) tend to β⁻ decay; below it (too many protons) β⁺ decay or electron capture; very heavy nuclei alpha decay. The curve shown is a smooth approximation from the semi-empirical mass formula.
          </Callout>
        ) : (
          <Callout kind="tip">Binding energy is the energy needed to separate a nucleus into its nucleons — equivalently, the energy released when it formed (E = Δmc²).</Callout>
        )
      }
      formulas={['\\Delta m = Zm_p + Nm_n - m_{nucleus}', 'E = \\Delta mc^2', 'E\\,(\\text{MeV}) = 931.5\\,\\Delta m\\,(\\text{u})']}
      explanation={
        <>
          <p>Isotopes of an element have the same number of protons but different numbers of neutrons. Whether a nucleus is stable depends on its neutron-to-proton ratio and size.</p>
          <p>In every nuclear reaction, nucleon number A and charge Z are conserved, and so is total mass–energy: any decrease in mass is released as energy.</p>
        </>
      }
      prediction={{
        q: 'Carbon-14 has too many neutrons for stability. Which decay do you expect?',
        options: ['Alpha', 'Beta-minus', 'Beta-plus', 'None'],
        answer: 1,
        explain: 'β⁻ decay converts a neutron into a proton, lowering N/Z: ¹⁴C → ¹⁴N + e⁻ + ν̄.',
      }}
      assumptions={['Atomic masses and half-lives from AME2020 / NNDC (rounded).', 'Stability curve: semi-empirical approximation Z ≈ A/(1.98 + 0.0155A^{2/3}).']}
      limitations={['Only selected nuclides are included.', 'Binding-energy plot joins discrete nuclides with a line for readability.']}
    >
      {s.tab === 'stability' ? (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Chart of neutron number against proton number with the band of stability">
          <line x1={sx(0)} y1={sy(0)} x2={sx(100)} y2={sy(100)} className="stroke-line" strokeDasharray="4 4" />
          <Label x={sx(78)} y={sy(80) - 6} size={10} className="fill-muted">N = Z</Label>
          <path d={band.map((b, i) => `${i ? 'L' : 'M'}${sx(b.Z).toFixed(1)},${sy(b.N).toFixed(1)}`).join(' ')} fill="none" className="stroke-good" strokeWidth={10} opacity={0.25} />
          {ISOTOPES.map((i) => (
            <g key={i.key} onClick={() => set({ iso: i.key })} className="cursor-pointer">
              <circle cx={sx(i.Z)} cy={sy(i.A - i.Z)} r={i.key === s.iso ? 7 : 4.5} className={i.mode === 'stable' ? 'fill-good' : i.mode === 'alpha' ? 'fill-m7' : i.mode === 'beta-' ? 'fill-m5' : i.mode === 'beta+' ? 'fill-bad' : 'fill-m6'} stroke={i.key === s.iso ? 'currentColor' : 'none'} />
            </g>
          ))}
          <line x1={sx(0)} y1={sy(0)} x2={sx(100)} y2={sy(0)} className="stroke-muted" />
          <line x1={sx(0)} y1={sy(0)} x2={sx(0)} y2={sy(150)} className="stroke-muted" />
          <Label x={sx(50)} y={H - 10} anchor="middle" size={11}>proton number Z</Label>
          <text x={14} y={H / 2} transform={`rotate(-90 14 ${H / 2})`} textAnchor="middle" fontSize={11} className="fill-ink">neutron number N</text>
          <Label x={sx(2)} y={24} size={10} className="fill-muted">● stable ● α ● β⁻ ● β⁺ ● γ (colours: green, gold, blue, red, violet)</Label>
        </svg>
      ) : (
        <div className="grid place-items-center p-6 text-center">
          <div className="font-display text-5xl">
            <Tex>{s.tab === 'defect' ? nuclideTex(nuc.A, nuc.Z) : s.tab === 'balance' ? '\\text{A and Z balance}' : s.tab === 'binding' ? '\\text{BE}/A' : nuclideTex(iso.A, iso.Z)}</Tex>
          </div>
          <div className="mt-2 text-sm text-muted">{s.tab === 'isotopes' ? `${iso.name}: ${iso.Z} protons, ${iso.A - iso.Z} neutrons` : ''}</div>
        </div>
      )}
    </SimShell>
  );
}

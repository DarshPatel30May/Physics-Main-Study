import { Arrow, Label, MiniAxes } from '../svg';
import type { DiagramDef } from './types';
import { STARS } from '@/content/stars';
import { BE_PER_NUCLEON } from '@/lib/physics/nuclear';
import { blackbodyColour } from '@/lib/physics/optics';

const VB = '0 0 320 200';

export const M8_DIAGRAMS: Record<string, DiagramDef> = {
  'cosmic-timeline': {
    title: 'From radiation to matter',
    caption: 'As the Universe expanded and cooled: pair production and annihilation → quarks form nucleons → nucleosynthesis (H, He) → recombination (atoms, CMB).',
    render: () => (
      <svg viewBox={VB}>
        <defs>
          <linearGradient id="ct" x1="0" x2="1">
            <stop offset="0" stopColor="#fde68a" />
            <stop offset="0.6" stopColor="#f97316" />
            <stop offset="1" stopColor="#1e1b4b" />
          </linearGradient>
        </defs>
        <rect x={20} y={80} width={280} height={20} rx={10} fill="url(#ct)" />
        {[
          [30, 'pairs γ ⇄ particle + antiparticle'],
          [100, 'p, n form'],
          [160, 'BBN: H, He'],
          [240, 'atoms + CMB'],
        ].map(([x, l], i) => (
          <g key={i}>
            <line x1={x as number} y1={100} x2={x as number} y2={i % 2 ? 140 : 60} className="stroke-muted" />
            <Label x={x as number} y={i % 2 ? 154 : 50} anchor="middle" size={9}>{l as string}</Label>
          </g>
        ))}
        <Label x={20} y={190} size={10} className="fill-muted">hot, dense → cool (time increasing →)</Label>
      </svg>
    ),
  },
  'hubble-graph': {
    title: 'Hubble’s law',
    caption: 'Recession velocity is proportional to distance: v = H₀d. The gradient is the Hubble constant.',
    render: () => (
      <svg viewBox={VB}>
        <MiniAxes x={40} y={10} w={270} h={160} xLabel="distance" yLabel="recession v" />
        <line x1={40} y1={170} x2={290} y2={30} className="stroke-accent" strokeWidth={2} />
        {[[70, 150], [100, 140], [130, 120], [160, 105], [190, 90], [220, 70], [250, 60], [270, 45]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={4} className="fill-m7" />
        ))}
        <Label x={200} y={40} size={11} className="fill-accent">gradient = H₀</Label>
      </svg>
    ),
  },
  'pp-chain': {
    title: 'Proton–proton chain',
    caption: '4 ¹H → ⁴He + 2e⁺ + 2ν + energy (≈ 26.7 MeV). The dominant fusion process in Sun-like stars.',
    render: () => (
      <svg viewBox={VB}>
        {[[30, 40], [30, 70], [30, 130], [30, 160]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={9} className="fill-bad" />
        ))}
        <circle cx={100} cy={55} r={11} className="fill-m6" />
        <circle cx={100} cy={145} r={11} className="fill-m6" />
        <circle cx={170} cy={55} r={13} className="fill-m7" />
        <circle cx={170} cy={145} r={13} className="fill-m7" />
        <circle cx={250} cy={100} r={16} className="fill-m8" />
        <Label x={100} y={59} anchor="middle" size={9} className="fill-white">²H</Label>
        <Label x={100} y={149} anchor="middle" size={9} className="fill-white">²H</Label>
        <Label x={170} y={59} anchor="middle" size={9} className="fill-white">³He</Label>
        <Label x={170} y={149} anchor="middle" size={9} className="fill-white">³He</Label>
        <Label x={250} y={104} anchor="middle" size={10} className="fill-white">⁴He</Label>
        <Arrow x1={42} y1={55} x2={86} y2={55} className="text-muted" />
        <Arrow x1={42} y1={145} x2={86} y2={145} className="text-muted" />
        <Arrow x1={113} y1={55} x2={155} y2={55} className="text-muted" label="+p" labelOffset={[-28, -6]} />
        <Arrow x1={113} y1={145} x2={155} y2={145} className="text-muted" label="+p" labelOffset={[-28, -6]} />
        <Arrow x1={184} y1={62} x2={236} y2={92} className="text-muted" />
        <Arrow x1={184} y1={138} x2={236} y2={108} className="text-muted" />
        <Label x={262} y={140} size={9}>+ 2p</Label>
        <Label x={60} y={196} size={9} className="fill-muted">+e⁺ + ν each · +γ each</Label>
      </svg>
    ),
  },
  'spectral-classes': {
    title: 'Stellar spectral classes',
    caption: 'O B A F G K M: from hottest (blue) to coolest (red). Classification uses which absorption lines are strong.',
    render: () => (
      <svg viewBox={VB}>
        {['O', 'B', 'A', 'F', 'G', 'K', 'M'].map((c, i) => {
          const T = [35000, 18000, 9000, 6800, 5600, 4300, 3200][i];
          return (
            <g key={c}>
              <circle cx={30 + i * 43} cy={90} r={18} fill={blackbodyColour(T)} />
              <Label x={30 + i * 43} y={96} anchor="middle" size={14} weight={700} className="fill-black">{c}</Label>
              <Label x={30 + i * 43} y={130} anchor="middle" size={9} className="fill-muted">{T.toLocaleString('en-AU')} K</Label>
            </g>
          );
        })}
        <Arrow x1={290} y1={170} x2={30} y2={170} className="text-muted" label="hotter" labelOffset={[0, -8]} />
      </svg>
    ),
  },
  'hr-diagram': {
    title: 'Hertzsprung–Russell diagram',
    caption: 'Luminosity vs surface temperature (decreasing to the right). Main sequence diagonal; giants upper right; white dwarfs lower left.',
    render: () => {
      const X = (T: number) => 30 + ((Math.log10(40000) - Math.log10(T)) / (Math.log10(40000) - Math.log10(2400))) * 280;
      const Y = (L: number) => 10 + ((6 - Math.log10(L)) / 10) * 170;
      return (
        <svg viewBox={VB}>
          <rect x={30} y={10} width={280} height={170} className="fill-black" />
          <path d={`M${X(30000)},${Y(3e4)} Q${X(8000)},${Y(30)} ${X(3000)},${Y(0.002)}`} fill="none" className="stroke-white" strokeWidth={14} opacity={0.12} />
          {STARS.map((s) => (
            <circle key={s.name} cx={X(s.T)} cy={Y(s.L)} r={3.5} fill={blackbodyColour(s.T)} />
          ))}
          <Label x={X(9000)} y={Y(1)} size={9} className="fill-white">main sequence</Label>
          <Label x={X(4500)} y={Y(3e4)} size={9} className="fill-white">supergiants</Label>
          <Label x={X(4500)} y={Y(300)} size={9} className="fill-white">giants</Label>
          <Label x={X(25000)} y={Y(0.003)} size={9} className="fill-white">white dwarfs</Label>
          <Label x={170} y={196} anchor="middle" size={10} className="fill-muted">temperature (hot ← → cool)</Label>
          <text x={14} y={95} transform="rotate(-90 14 95)" textAnchor="middle" fontSize={10} className="fill-muted">luminosity</text>
        </svg>
      );
    },
  },
  'stellar-lifecycle': {
    title: 'Stellar life cycles depend on mass',
    caption: 'Low-mass: main sequence → red giant → planetary nebula → white dwarf. High-mass: → red supergiant → supernova → neutron star or black hole.',
    render: () => (
      <svg viewBox={VB}>
        <Label x={10} y={100} size={10}>nebula →</Label>
        <Label x={60} y={100} size={10}>protostar →</Label>
        <Arrow x1={120} y1={95} x2={150} y2={55} className="text-muted" />
        <Arrow x1={120} y1={100} x2={150} y2={145} className="text-muted" />
        <Label x={152} y={50} size={10}>main seq. → red giant → PN → white dwarf</Label>
        <Label x={152} y={150} size={10}>massive MS → red supergiant</Label>
        <Label x={152} y={166} size={10}>→ supernova → neutron star / black hole</Label>
        <Label x={152} y={30} size={9} className="fill-muted">≲ 8 M☉</Label>
        <Label x={152} y={186} size={9} className="fill-muted">≳ 8 M☉</Label>
      </svg>
    ),
  },
  'cathode-ray-tube': {
    title: 'Cathode-ray tube',
    caption: 'Electrons from the cathode are accelerated to the anode; deflection plates and coils bend the beam, revealing negative charge.',
    render: () => (
      <svg viewBox={VB}>
        <ellipse cx={160} cy={100} rx={150} ry={60} fill="none" className="stroke-line" strokeWidth={2} />
        <rect x={20} y={85} width={8} height={30} className="fill-m5" />
        <rect x={60} y={80} width={4} height={14} className="fill-muted" />
        <rect x={60} y={106} width={4} height={14} className="fill-muted" />
        <rect x={130} y={70} width={60} height={5} className="fill-bad" />
        <rect x={130} y={125} width={60} height={5} className="fill-m5" />
        <path d="M28,100 L130,100 Q170,100 200,80 L300,50" fill="none" className="stroke-accent" strokeWidth={2} />
        <Label x={12} y={140} size={9}>cathode −</Label>
        <Label x={50} y={140} size={9}>anode +</Label>
        <Label x={140} y={62} size={9} className="fill-bad">+ plate</Label>
        <Label x={230} y={40} size={9}>beam bends towards + plate</Label>
      </svg>
    ),
  },
  millikan: {
    title: 'Millikan’s oil-drop experiment',
    caption: 'When the drop is stationary, qE = mg, so q = mgd/V. All charges were whole-number multiples of e.',
    render: () => (
      <svg viewBox={VB}>
        <rect x={60} y={30} width={200} height={8} className="fill-bad" />
        <rect x={60} y={162} width={200} height={8} className="fill-m5" />
        <circle cx={160} cy={100} r={7} className="fill-m7" />
        <Arrow x1={160} y1={100} x2={160} y2={55} className="text-good" label="qE" />
        <Arrow x1={160} y1={100} x2={160} y2={145} className="text-m7" label="mg" />
        <Label x={270} y={38} size={10}>+V</Label>
        <Label x={270} y={170} size={10}>0 V</Label>
        <Label x={30} y={104} size={10}>d</Label>
      </svg>
    ),
  },
  'gold-foil': {
    title: 'Geiger–Marsden (gold foil) experiment',
    caption: 'Most alphas pass straight through; a few are deflected through large angles by the tiny, dense, positive nucleus.',
    render: () => (
      <svg viewBox={VB}>
        <rect x={10} y={88} width={30} height={24} className="fill-muted" />
        <Label x={10} y={130} size={9}>α source</Label>
        <line x1={160} y1={20} x2={160} y2={180} className="stroke-m7" strokeWidth={3} />
        {[80, 90, 110, 120].map((y) => (
          <line key={y} x1={40} y1={y} x2={300} y2={y} className="stroke-accent" opacity={0.6} />
        ))}
        <path d="M40,100 L156,100 L60,60" fill="none" className="stroke-bad" strokeWidth={2} />
        <path d="M40,96 L160,96 L290,40" fill="none" className="stroke-bad" strokeWidth={1.5} />
        <Label x={165} y={196} size={9}>gold foil</Label>
        <Label x={220} y={40} size={9}>rare large deflection</Label>
        <Label x={40} y={52} size={9}>very rare back-scatter</Label>
      </svg>
    ),
  },
  chadwick: {
    title: 'Chadwick’s discovery of the neutron',
    caption: 'α + Be gives neutral radiation that knocks protons out of paraffin with high energy — explained by neutral particles of mass ≈ m_p.',
    render: () => (
      <svg viewBox={VB}>
        <rect x={10} y={88} width={30} height={24} className="fill-muted" />
        <Label x={8} y={128} size={9}>Po (α)</Label>
        <Arrow x1={40} y1={100} x2={90} y2={100} className="text-bad" label="α" />
        <rect x={92} y={80} width={20} height={40} className="fill-m6" />
        <Label x={92} y={134} size={9}>Be</Label>
        <Arrow x1={112} y1={100} x2={190} y2={100} className="text-muted" label="neutral radiation" labelOffset={[-90, -8]} dashed />
        <rect x={192} y={80} width={24} height={40} className="fill-m7" />
        <Label x={186} y={134} size={9}>paraffin</Label>
        <Arrow x1={216} y1={100} x2={300} y2={100} className="text-bad" label="protons" />
      </svg>
    ),
  },
  'bohr-levels': {
    title: 'Hydrogen energy levels',
    caption: 'Electrons occupy quantised levels E_n = −13.6/n² eV. A downward transition emits a photon with hf = E_i − E_f.',
    render: () => {
      const Y = (n: number) => 20 + (13.6 / (n * n)) * 12;
      return (
        <svg viewBox={VB}>
          {[1, 2, 3, 4, 5].map((n) => (
            <g key={n}>
              <line x1={40} y1={Y(n)} x2={240} y2={Y(n)} className="stroke-muted" />
              <Label x={10} y={Y(n) + 4} size={9}>n = {n}</Label>
              <Label x={248} y={Y(n) + 4} size={9} className="fill-muted">{(-13.6 / (n * n)).toFixed(2)} eV</Label>
            </g>
          ))}
          <Arrow x1={80} y1={Y(3)} x2={80} y2={Y(2)} className="text-bad" />
          <Arrow x1={110} y1={Y(4)} x2={110} y2={Y(2)} className="text-m5" />
          <Arrow x1={150} y1={Y(2)} x2={150} y2={Y(1)} className="text-m6" />
          <Label x={60} y={Y(2) - 30} size={9}>Balmer (to n = 2)</Label>
          <Label x={160} y={Y(1) - 20} size={9}>Lyman (UV)</Label>
        </svg>
      );
    },
  },
  'model-timeline': {
    title: 'Development of atomic models',
    caption: 'Each model explained the evidence of its time; new evidence led to new models.',
    render: () => (
      <svg viewBox={VB}>
        <line x1={20} y1={100} x2={300} y2={100} className="stroke-muted" strokeWidth={2} />
        {[
          [40, 'Thomson 1904'],
          [110, 'Rutherford 1911'],
          [180, 'Bohr 1913'],
          [260, 'Quantum 1926'],
        ].map(([x, l]) => (
          <g key={l as string}>
            <circle cx={x as number} cy={100} r={8} className="fill-accent" />
            <Label x={x as number} y={128} anchor="middle" size={9}>{l as string}</Label>
          </g>
        ))}
        <Label x={20} y={60} size={9} className="fill-muted">evidence: e/m → α scattering → line spectra → electron diffraction</Label>
      </svg>
    ),
  },
  'standing-orbit': {
    title: 'de Broglie standing waves on orbits',
    caption: 'Allowed orbits fit a whole number of wavelengths: 2πr = nλ, giving mvr = nh/2π.',
    render: () => (
      <svg viewBox={VB}>
        <circle cx={160} cy={100} r={60} fill="none" className="stroke-line" strokeDasharray="3 3" />
        <path
          d={Array.from({ length: 361 }, (_, i) => {
            const a = (i * Math.PI) / 180;
            const r = 60 + 12 * Math.sin(4 * a);
            return `${i ? 'L' : 'M'}${160 + r * Math.cos(a)},${100 - r * Math.sin(a)}`;
          }).join(' ')}
          fill="none"
          className="stroke-accent"
          strokeWidth={2}
        />
        <circle cx={160} cy={100} r={4} className="fill-bad" />
        <Label x={240} y={180} size={10}>n = 4</Label>
      </svg>
    ),
  },
  'orbital-cloud': {
    title: 'Orbitals are probability clouds',
    caption: 'The quantum model gives the probability of finding the electron in each region — not a path.',
    render: () => (
      <svg viewBox={VB}>
        {Array.from({ length: 450 }, (_, i) => {
          const u = ((i * 7919) % 10007) / 10007;
          const v = ((i * 104729) % 1009) / 1009;
          const r = -Math.log(1 - u * 0.98) * 18;
          return <circle key={i} cx={160 + r * Math.cos(v * 6.283)} cy={100 + r * Math.sin(v * 6.283)} r={1.3} className="fill-accent" opacity={0.6} />;
        })}
        <circle cx={160} cy={100} r={3} className="fill-bad" />
      </svg>
    ),
  },
  'radiation-penetration': {
    title: 'Penetration of α, β and γ radiation',
    caption: 'α stopped by paper; β by a few mm of aluminium; γ reduced (not completely stopped) by thick lead or concrete.',
    render: () => (
      <svg viewBox={VB}>
        <Arrow x1={20} y1={50} x2={90} y2={50} className="text-bad" label="α" labelOffset={[-70, -6]} />
        <Arrow x1={20} y1={100} x2={170} y2={100} className="text-m5" label="β" labelOffset={[-150, -6]} />
        <Arrow x1={20} y1={150} x2={290} y2={150} className="text-m7" label="γ" labelOffset={[-270, -6]} />
        <rect x={92} y={25} width={4} height={150} className="fill-muted" />
        <rect x={172} y={25} width={12} height={150} className="fill-m6" opacity={0.6} />
        <rect x={250} y={25} width={30} height={150} className="fill-ink" opacity={0.6} />
        <Label x={82} y={190} size={9}>paper</Label>
        <Label x={160} y={190} size={9}>aluminium</Label>
        <Label x={250} y={190} size={9}>lead</Label>
      </svg>
    ),
  },
  'decay-curve': {
    title: 'Radioactive decay curve',
    caption: 'N halves every half-life: N = N₀e^(−λt). After n half-lives (½)ⁿ remains.',
    render: () => (
      <svg viewBox={VB}>
        <MiniAxes x={40} y={10} w={270} h={160} xLabel="t" yLabel="N" />
        <path d={Array.from({ length: 101 }, (_, i) => `${i ? 'L' : 'M'}${40 + i * 2.6},${170 - 150 * Math.pow(0.5, i / 25)}`).join(' ')} fill="none" className="stroke-accent" strokeWidth={2} />
        {[1, 2, 3].map((n) => (
          <g key={n}>
            <line x1={40 + n * 65} y1={170} x2={40 + n * 65} y2={170 - 150 * Math.pow(0.5, n)} className="stroke-muted" strokeDasharray="3 3" />
            <Label x={40 + n * 65} y={186} anchor="middle" size={9}>{n}t½</Label>
          </g>
        ))}
        <Label x={46} y={24} size={9}>N₀</Label>
      </svg>
    ),
  },
  'chain-reaction': {
    title: 'Fission chain reaction',
    caption: 'Each fission releases 2–3 neutrons that can cause further fissions. Control rods absorb neutrons to keep k ≈ 1.',
    render: () => (
      <svg viewBox={VB}>
        <circle cx={40} cy={100} r={12} className="fill-m8" />
        {[
          [120, 50],
          [120, 100],
          [120, 150],
        ].map(([x, y], i) => (
          <g key={i}>
            <Arrow x1={52} y1={100} x2={x - 14} y2={y} className="text-muted" width={1.2} />
            <circle cx={x} cy={y} r={12} className="fill-m8" />
            {[-20, 0, 20].map((d) => (
              <Arrow key={d} x1={x + 12} y1={y} x2={x + 70} y2={y + d} className="text-muted" width={1} head={5} />
            ))}
          </g>
        ))}
        <rect x={250} y={20} width={8} height={160} className="fill-ink" opacity={0.5} />
        <Label x={232} y={196} size={9}>control rod</Label>
        <Label x={20} y={130} size={9}>U-235</Label>
      </svg>
    ),
  },
  'be-curve': {
    title: 'Binding energy per nucleon',
    caption: 'Peaks near iron-56. Fusion (light nuclei) and fission (heavy nuclei) both increase binding energy per nucleon, releasing energy.',
    render: () => {
      const X = (A: number) => 30 + (A / 240) * 280;
      const Y = (b: number) => 180 - (b / 9) * 165;
      return (
        <svg viewBox={VB}>
          <MiniAxes x={30} y={10} w={280} h={170} xLabel="A" yLabel="BE/A" />
          <path d={[...BE_PER_NUCLEON].sort((p, q) => p.A - q.A).map((b, i) => `${i ? 'L' : 'M'}${X(b.A)},${Y(b.be)}`).join(' ')} fill="none" className="stroke-accent" strokeWidth={2} />
          <circle cx={X(56)} cy={Y(8.79)} r={4} className="fill-m7" />
          <Label x={X(56)} y={Y(8.79) - 8} anchor="middle" size={9}>Fe-56</Label>
          <Arrow x1={X(8)} y1={Y(5)} x2={X(40)} y2={Y(7.6)} className="text-good" label="fusion" />
          <Arrow x1={X(235)} y1={Y(7.2)} x2={X(130)} y2={Y(7.9)} className="text-good" label="fission" labelOffset={[-10, 16]} />
        </svg>
      );
    },
  },
  'deep-inelastic': {
    title: 'Deep inelastic scattering',
    caption: 'High-energy electrons scattering off point-like charges inside protons revealed quarks (SLAC, 1968).',
    render: () => (
      <svg viewBox={VB}>
        <circle cx={180} cy={100} r={50} className="fill-m6" opacity={0.2} />
        {[[165, 85], [195, 90], [180, 120]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={7} className={i === 2 ? 'fill-m5' : 'fill-bad'} />
        ))}
        <Arrow x1={20} y1={88} x2={160} y2={88} className="text-accent" label="e⁻ (20 GeV)" labelOffset={[-120, -8]} />
        <Arrow x1={165} y1={85} x2={260} y2={20} className="text-accent" />
        <Label x={232} y={170} size={10}>proton: uud</Label>
      </svg>
    ),
  },
  'standard-model': {
    title: 'The Standard Model',
    caption: '6 quarks, 6 leptons, 4 gauge bosons and the Higgs boson. Gravity is not included.',
    render: () => {
      const cells = [
        ['u', 'c', 't', 'g'],
        ['d', 's', 'b', 'γ'],
        ['e', 'μ', 'τ', 'Z'],
        ['νe', 'νμ', 'ντ', 'W'],
      ];
      return (
        <svg viewBox={VB}>
          {cells.map((row, r) =>
            row.map((c, k) => (
              <g key={c}>
                <rect x={20 + k * 58} y={10 + r * 45} width={52} height={40} rx={6} className={k === 3 ? 'fill-m7/20' : r < 2 ? 'fill-m6/20' : 'fill-m8/20'} />
                <Label x={46 + k * 58} y={36 + r * 45} anchor="middle" size={14} weight={600}>{c}</Label>
              </g>
            )),
          )}
          <rect x={256} y={10} width={52} height={40} rx={6} className="fill-bad/20" />
          <Label x={282} y={36} anchor="middle" size={14} weight={600}>H</Label>
          <Label x={256} y={80} size={9} className="fill-muted">quarks</Label>
          <Label x={256} y={95} size={9} className="fill-muted">leptons</Label>
          <Label x={256} y={110} size={9} className="fill-muted">bosons</Label>
        </svg>
      );
    },
  },
  accelerator: {
    title: 'Particle accelerator',
    caption: 'Electric fields accelerate charged particles; magnetic fields bend (r = p/qB) and focus them into collisions.',
    render: () => (
      <svg viewBox={VB}>
        <circle cx={190} cy={100} r={75} fill="none" className="stroke-accent" strokeWidth={3} />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          return <rect key={i} x={190 + 75 * Math.cos(a) - 6} y={100 - 75 * Math.sin(a) - 6} width={12} height={12} className="fill-m5" />;
        })}
        {Array.from({ length: 4 }, (_, i) => (
          <rect key={i} x={20 + i * 22} y={94} width={16} height={12} className="fill-m7" />
        ))}
        <Arrow x1={105} y1={100} x2={115} y2={100} className="text-accent" />
        <Label x={20} y={130} size={9}>linac (E fields)</Label>
        <Label x={160} y={104} size={9}>magnets (B)</Label>
      </svg>
    ),
  },
};


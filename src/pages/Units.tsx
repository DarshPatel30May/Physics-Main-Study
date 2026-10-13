import { useMemo, useState } from 'react';
import { CheckCircle2, Plus, Trash2, XCircle } from 'lucide-react';
import { QUANTITIES, convert, PREFIXES, DERIVED_UNITS, DIM, dimMul, dimEq, dimToString, type Dim } from '@/lib/physics/units';
import { Callout, NumberField, Select, Tabs, parseNum } from '@/components/ui';
import { sig } from '@/lib/physics/stats';
import { PageHeader } from './shared';

type Tab = 'convert' | 'dims' | 'reference';
interface Term {
  unit: string;
  power: number;
}

const UNIT_KEYS = Object.keys(DIM);
const ZERO: Dim = [0, 0, 0, 0, 0];
const combine = (terms: Term[]): Dim => terms.reduce<Dim>((d, t) => dimMul(d, DIM[t.unit].map((x) => x * t.power) as Dim), ZERO);

const PRESETS: { name: string; lhs: Term[]; rhs: Term[]; note: string }[] = [
  { name: 'F = qvB → is C × m/s × T a newton?', lhs: [{ unit: 'N', power: 1 }], rhs: [{ unit: 'C', power: 1 }, { unit: 'm/s', power: 1 }, { unit: 'T', power: 1 }], note: 'Yes: the tesla is defined so that qvB gives newtons.' },
  { name: 'v = √(GM/r): (N m² kg⁻² × kg / m)^½', lhs: [{ unit: 'm/s', power: 2 }], rhs: [{ unit: 'N', power: 1 }, { unit: 'm', power: 1 }, { unit: 'kg', power: -1 }], note: 'G M/r has units N m kg⁻¹ = m² s⁻², i.e. (speed)².' },
  { name: 'E = hf → J s × Hz is a joule?', lhs: [{ unit: 'J', power: 1 }], rhs: [{ unit: 'J', power: 1 }, { unit: 's', power: 1 }, { unit: 'Hz', power: 1 }], note: 'Hz = s⁻¹ so J s × s⁻¹ = J.' },
  { name: 'Φ = BA → T m² is a weber?', lhs: [{ unit: 'Wb', power: 1 }], rhs: [{ unit: 'T', power: 1 }, { unit: 'm', power: 2 }], note: 'Yes, 1 Wb = 1 T m².' },
  { name: 'emf = ΔΦ/Δt → Wb/s is a volt?', lhs: [{ unit: 'V', power: 1 }], rhs: [{ unit: 'Wb', power: 1 }, { unit: 's', power: -1 }], note: 'Yes, 1 V = 1 Wb s⁻¹.' },
  { name: 'Common error: a = v²/r written as v/r²', lhs: [{ unit: 'm/s2', power: 1 }], rhs: [{ unit: 'm/s', power: 1 }, { unit: 'm', power: -2 }], note: 'Dimensional analysis catches the wrong formula: m s⁻¹ m⁻² ≠ m s⁻².' },
];

function TermEditor({ terms, setTerms, label }: { terms: Term[]; setTerms: (t: Term[]) => void; label: string }) {
  return (
    <div className="space-y-2">
      <div className="label">{label}</div>
      {terms.map((t, i) => (
        <div key={i} className="flex items-center gap-2">
          <select aria-label={`${label} unit ${i + 1}`} className="input !w-28" value={t.unit} onChange={(e) => setTerms(terms.map((x, j) => (j === i ? { ...x, unit: e.target.value } : x)))}>
            {UNIT_KEYS.map((u) => (
              <option key={u} value={u}>
                {u.replace('m/s2', 'm s⁻²').replace('m/s', 'm s⁻¹')}
              </option>
            ))}
          </select>
          <span className="text-muted">^</span>
          <input aria-label={`${label} power ${i + 1}`} type="number" step={0.5} className="input !w-20" value={t.power} onChange={(e) => setTerms(terms.map((x, j) => (j === i ? { ...x, power: Number(e.target.value) || 0 } : x)))} />
          <button className="p-1 text-muted hover:text-bad" aria-label="Remove term" onClick={() => setTerms(terms.filter((_, j) => j !== i))}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button className="btn !py-1 text-xs" onClick={() => setTerms([...terms, { unit: 'm', power: 1 }])}>
        <Plus className="h-3.5 w-3.5" /> Add unit
      </button>
      <div className="num text-sm">= {dimToString(combine(terms))}</div>
    </div>
  );
}

export default function Units() {
  const [tab, setTab] = useState<Tab>('convert');
  const [qid, setQid] = useState(QUANTITIES[0].id);
  const q = QUANTITIES.find((x) => x.id === qid)!;
  const [from, setFrom] = useState(q.units[1]?.id ?? q.units[0].id);
  const [to, setTo] = useState(q.units[0].id);
  const [val, setVal] = useState('1');
  const [lhs, setLhs] = useState<Term[]>(PRESETS[0].lhs);
  const [rhs, setRhs] = useState<Term[]>(PRESETS[0].rhs);
  const [note, setNote] = useState(PRESETS[0].note);

  const n = parseNum(val);
  const out = useMemo(() => {
    try {
      return convert(n, qid, from, to);
    } catch {
      return NaN;
    }
  }, [n, qid, from, to]);
  const same = dimEq(combine(lhs), combine(rhs));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader kicker="Units lab" title="Conversions and dimensional analysis">
        Convert between units used in HSC Physics, and check whether an equation is dimensionally consistent — a fast way to catch a wrong formula.
      </PageHeader>
      <Tabs<Tab> value={tab} onChange={setTab} tabs={[{ id: 'convert', label: 'Convert' }, { id: 'dims', label: 'Dimensional analysis' }, { id: 'reference', label: 'Prefixes & derived units' }]} />
      {tab === 'convert' && (
        <div className="card grid gap-4 p-5 md:grid-cols-2">
          <div className="space-y-3">
            <Select label="Quantity" value={qid} options={QUANTITIES.map((x) => ({ value: x.id, label: `${x.name} (SI: ${x.si})` }))} onChange={(v) => { const nq = QUANTITIES.find((x) => x.id === v)!; setQid(v); setFrom(nq.units[1]?.id ?? nq.units[0].id); setTo(nq.units[0].id); }} />
            <NumberField label="Value" value={val} onChange={setVal} invalid={!Number.isFinite(n)} />
            <div className="grid grid-cols-2 gap-3">
              <Select label="From" value={from} options={q.units.map((u) => ({ value: u.id, label: u.label }))} onChange={setFrom} />
              <Select label="To" value={to} options={q.units.map((u) => ({ value: u.id, label: u.label }))} onChange={setTo} />
            </div>
          </div>
          <div className="flex flex-col justify-center rounded-xl border border-line bg-panel2/40 p-5" aria-live="polite">
            <div className="label">Result</div>
            <div className="num mt-1 text-2xl font-semibold">
              {Number.isFinite(out) ? sig(out, 5) : '—'} <span className="text-base text-muted">{q.units.find((u) => u.id === to)?.label}</span>
            </div>
            <div className="mt-3 text-sm text-muted">
              Factor: 1 {q.units.find((u) => u.id === from)?.label} = {sig(convert(1, qid, from, to), 6)} {q.units.find((u) => u.id === to)?.label}
            </div>
            <div className="mt-1 text-xs text-muted">Dimensions: {q.dimensions}</div>
          </div>
        </div>
      )}
      {tab === 'dims' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button key={p.name} className="chip hover:border-accent" onClick={() => { setLhs(p.lhs); setRhs(p.rhs); setNote(p.note); }}>
                {p.name}
              </button>
            ))}
          </div>
          <div className="card grid gap-6 p-5 md:grid-cols-2">
            <TermEditor label="Left-hand side" terms={lhs} setTerms={(t) => { setLhs(t); setNote(''); }} />
            <TermEditor label="Right-hand side" terms={rhs} setTerms={(t) => { setRhs(t); setNote(''); }} />
          </div>
          <div className={`flex items-start gap-2 rounded-xl border p-4 ${same ? 'border-good/60 bg-good/10' : 'border-bad/60 bg-bad/10'}`} aria-live="polite">
            {same ? <CheckCircle2 className="h-5 w-5 text-good" /> : <XCircle className="h-5 w-5 text-bad" />}
            <div className="text-sm">
              <div className="font-semibold">{same ? 'Dimensionally consistent' : 'Not consistent — the two sides have different base units'}</div>
              {note && <div className="mt-0.5">{note}</div>}
              <div className="mt-1 text-xs text-muted">Consistency is necessary but not sufficient: dimensionless factors such as ½ or 2π cannot be checked this way.</div>
            </div>
          </div>
        </div>
      )}
      {tab === 'reference' && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card p-5">
            <div className="label mb-2">SI prefixes</div>
            <table className="w-full text-sm">
              <tbody>
                {PREFIXES.map((p) => (
                  <tr key={p.p} className="border-t border-line first:border-0">
                    <td className="num py-1 font-semibold">{p.p}</td>
                    <td className="py-1">{p.name}</td>
                    <td className="num py-1 text-right">
                      10<sup>{p.exp}</sup>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card p-5">
            <div className="label mb-2">Derived units in base SI units</div>
            <table className="w-full text-sm">
              <tbody>
                {DERIVED_UNITS.map((d) => (
                  <tr key={d.unit} className="border-t border-line first:border-0">
                    <td className="num py-1 font-semibold">{d.unit}</td>
                    <td className="py-1">{d.name}</td>
                    <td className="num py-1">{d.base}</td>
                    <td className="py-1 text-xs text-muted">{d.from}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Callout kind="tip" title="Conversions that cost marks">
            <ul className="list-disc space-y-1 pl-5">
              <li>Squared and cubed units: 1 cm² = 10⁻⁴ m², 1 cm³ = 10⁻⁶ m³.</li>
              <li>eV ↔ J: multiply by 1.602 × 10⁻¹⁹.</li>
              <li>km/h ↔ m/s: divide by 3.6.</li>
              <li>Altitude → orbital radius: add Earth’s radius (6.371 × 10⁶ m).</li>
              <li>Lines per mm → grating spacing: d = 10⁻³/N m.</li>
            </ul>
          </Callout>
        </div>
      )}
    </div>
  );
}

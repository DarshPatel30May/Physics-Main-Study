import { SimShell } from '@/components/SimShell';
import { Slider, Stat, Callout, Toggle } from '@/components/ui';
import { Label, FieldGrid } from '@/components/svg';
import { useSimSettings } from '@/lib/store';
import { C } from '@/lib/physics/constants';
import { sig } from '@/lib/physics/stats';

const DEFAULTS = { Va: 2000, Vp: 200, BmT: 0.3, Eon: true, Bon: true };
const W = 600;
const H = 300;
const D = 0.02; // plate separation (m)
const LREG = 0.08; // field region length (m)

export default function CathodeRaysSim({ compact }: { compact?: boolean }) {
  const [s, set, reset] = useSimSettings('cathode-rays', DEFAULTS);
  const qm = C.e / C.me;
  const v = Math.sqrt(2 * qm * s.Va);
  const E = s.Eon ? s.Vp / D : 0;
  const B = s.Bon ? s.BmT * 1e-3 : 0;
  // top plate positive: electron pushed UP by E (force qE upward magnitude); magnetic force (B into page, v → +x)
  // on an electron: F = −e v × B = −e (x̂ × −ẑ) v B = −e v B ŷ → DOWN. So E and B forces oppose.
  const aNet = qm * (E - v * B); // + = up
  const t = LREG / v;
  const balanced = s.Eon && s.Bon && Math.abs(E - v * B) / Math.max(E, 1) < 0.02;
  const rOnlyB = B > 0 ? v / (qm * B) : Infinity;

  // path for drawing (scaled)
  const sx = 380 / LREG;
  const sy = 1500;
  const pts: string[] = [];
  const X0 = 150;
  const Y0 = H / 2;
  const n = 60;
  let hit = false;
  for (let i = 0; i <= n; i++) {
    const tt = (i / n) * t;
    let x: number;
    let y: number;
    if (s.Bon && !s.Eon) {
      // circular arc downward (B only)
      const th = (v * tt) / rOnlyB;
      x = rOnlyB * Math.sin(th);
      y = -(rOnlyB - rOnlyB * Math.cos(th));
    } else {
      x = v * tt;
      y = 0.5 * aNet * tt * tt;
    }
    if (Math.abs(y) > D / 2) {
      hit = true;
      pts.push(`L${(X0 + x * sx).toFixed(1)},${(Y0 - Math.sign(y) * (D / 2) * sy).toFixed(1)}`);
      break;
    }
    pts.push(`${i ? 'L' : 'M'}${(X0 + x * sx).toFixed(1)},${(Y0 - y * sy).toFixed(1)}`);
  }
  const qmMeasured = balanced ? E / (B * B * rOnlyB) : NaN;

  return (
    <SimShell
      id="cathode-rays"
      compact={compact}
      onReset={reset}
      controls={
        <>
          <Slider label="Accelerating voltage" tex="V_a" value={s.Va} min={500} max={5000} step={50} unit="V" onChange={(Va) => set({ Va })} />
          <Toggle label="Electric field (plates)" checked={s.Eon} onChange={(Eon) => set({ Eon })} />
          {s.Eon && <Slider label="Plate voltage (top +)" tex="V_p" value={s.Vp} min={0} max={1000} step={5} unit="V" hint="Plates 2.0 cm apart" onChange={(Vp) => set({ Vp })} />}
          <Toggle label="Magnetic field (coils)" checked={s.Bon} onChange={(Bon) => set({ Bon })} />
          {s.Bon && <Slider label="Magnetic flux density (into page)" tex="B" value={s.BmT} min={0} max={3} step={0.01} unit="mT" onChange={(BmT) => set({ BmT })} />}
          <button className="btn w-full" onClick={() => set({ Eon: true, Bon: true, BmT: Number(((s.Vp / D / v) * 1e3).toFixed(2)) })}>
            Balance the beam (set B = E/v)
          </button>
        </>
      }
      readouts={
        <>
          <Stat label="electron speed" tex="v = \sqrt{2eV_a/m}" value={v} unit="m s⁻¹" />
          <Stat label="electric field" tex="E = V/d" value={E} unit="V m⁻¹" />
          <Stat label="electric force (up)" value={C.e * E} unit="N" />
          <Stat label="magnetic force (down)" value={C.e * v * B} unit="N" />
          <Stat label="status" value={balanced ? 'balanced: v = E/B' : hit ? 'beam hits a plate' : 'deflected'} tone={balanced ? 'text-good' : ''} />
          <Stat label="radius with B only" tex="r = mv/eB" value={rOnlyB} unit="m" />
          <Stat label="q/m from E/(B²r)" value={balanced ? qmMeasured : 'balance first'} unit={balanced ? 'C kg⁻¹' : ''} tone="text-accent" />
          <Stat label="accepted e/mₑ" value={qm} unit="C kg⁻¹" />
        </>
      }
      below={
        <div className="grid gap-3 md:grid-cols-2">
          <Callout kind="model" title="Thomson’s method (1897)">
            Step 1: adjust E and B until the beam is undeflected → qE = qvB → v = E/B = {sig(s.Vp / D / Math.max(B, 1e-9))} m s⁻¹. Step 2: switch off E; with B alone the beam follows a circle r = mv/(qB). Combining: q/m = E/(B²r). Thomson found the same q/m for every cathode metal and gas — about 1800× that of hydrogen ions.
          </Callout>
          <Callout kind="info" title="Evidence that cathode rays are particles">
            Cast sharp shadows (straight lines) · turn a paddle wheel (carry momentum) · deflected by E and B fields towards the positive plate (negative charge) · same properties for every cathode material.
          </Callout>
        </div>
      }
      formulas={['qE = qvB \\Rightarrow v = \\dfrac{E}{B}', 'r = \\dfrac{mv}{qB}', '\\dfrac{q}{m} = \\dfrac{E}{B^2 r}']}
      explanation={
        <>
          <p>Electrons accelerated by the anode enter a region with crossed electric and magnetic fields. The electric force pushes them towards the positive plate (up); the magnetic force (B into the page) pushes them down.</p>
          <p>When the forces balance, the beam goes straight — revealing the speed v = E/B independent of q and m.</p>
        </>
      }
      prediction={{
        q: 'The beam is balanced. You double the accelerating voltage. What happens?',
        options: ['Still balanced', 'Deflects towards the positive plate', 'Deflects downwards (magnetic force wins)', 'The beam stops'],
        answer: 2,
        explain: 'Faster electrons (v increases by √2) feel a larger magnetic force qvB; the electric force qE is unchanged.',
      }}
      assumptions={['Uniform fields confined to the 8 cm region; electrons start from rest at the cathode.', 'Non-relativistic speeds (v < 0.15c here); gravity negligible.']}
      limitations={['Vertical deflection is exaggerated for visibility.', 'Real tubes have fringing fields at the plate edges.']}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Thomson's cathode-ray tube with crossed electric and magnetic fields">
        <ellipse cx={W / 2} cy={H / 2} rx={W / 2 - 10} ry={H / 2 - 40} fill="none" className="stroke-line" strokeWidth={2} />
        <rect x={30} y={H / 2 - 30} width={12} height={60} className="fill-m5" />
        <Label x={36} y={H / 2 + 48} anchor="middle" size={10}>cathode −</Label>
        <rect x={120} y={H / 2 - 30} width={6} height={22} className="fill-muted" />
        <rect x={120} y={H / 2 + 8} width={6} height={22} className="fill-muted" />
        <Label x={123} y={H / 2 + 48} anchor="middle" size={10}>anode +</Label>
        <line x1={42} y1={H / 2} x2={X0} y2={H / 2} className="stroke-accent" strokeWidth={2.5} />
        {s.Bon && <FieldGrid x={X0} y={H / 2 - (D / 2) * 1500} w={LREG * sx} h={D * 1500} into step={26} />}
        <rect x={X0} y={H / 2 - (D / 2) * 1500 - 6} width={LREG * sx} height={6} className={s.Eon ? 'fill-bad' : 'fill-muted'} />
        <rect x={X0} y={H / 2 + (D / 2) * 1500} width={LREG * sx} height={6} className={s.Eon ? 'fill-m5' : 'fill-muted'} />
        <path d={pts.join(' ')} fill="none" className="stroke-accent" strokeWidth={2.5} />
        <Label x={X0} y={H / 2 - (D / 2) * 1500 - 12} size={10} className="fill-bad">+ {s.Eon ? s.Vp : 0} V</Label>
        <Label x={12} y={22} size={11} className="fill-muted">Deflection exaggerated ×{(1500 / sx).toFixed(0)} vertically.</Label>
      </svg>
    </SimShell>
  );
}

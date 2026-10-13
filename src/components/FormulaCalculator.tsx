import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react';
import { genericChecks, type Formula } from '@/content/formulas';
import { NumberField, Tex, parseNum } from './ui';
import { sig, sigTex } from '@/lib/physics/stats';

/**
 * Calculator for a formula: choose the unknown, enter the other values, and the
 * pre-validated rearrangement (not symbolic string manipulation) computes the result.
 */
export function FormulaCalculator({ f, compact = false }: { f: Formula; compact?: boolean }) {
  const solvable = Object.keys(f.solve);
  const [unknown, setUnknown] = useState<string>(solvable[0]);
  const [inputs, setInputs] = useState<Record<string, string>>(() => Object.fromEntries(f.vars.map((v) => [v.key, String(v.def)])));

  const result = useMemo(() => {
    const vals: Record<string, number> = {};
    const bad: string[] = [];
    for (const v of f.vars) {
      if (v.key === unknown) continue;
      const n = parseNum(inputs[v.key] ?? '');
      if (!Number.isFinite(n)) bad.push(v.key);
      vals[v.key] = n;
    }
    if (bad.length) return { bad, value: NaN, warnings: [] as string[] };
    const value = f.solve[unknown].fn(vals);
    const all = { ...vals, [unknown]: value };
    return { bad, value, warnings: genericChecks(f, all, unknown) };
  }, [f, inputs, unknown]);

  const uv = f.vars.find((v) => v.key === unknown)!;
  const r = f.solve[unknown];

  return (
    <div className={`grid gap-4 ${compact ? '' : 'lg:grid-cols-[1fr_1fr]'}`}>
      <div className="space-y-3">
        <div>
          <div className="label mb-1.5">Solve for</div>
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Unknown quantity">
            {solvable.map((k) => {
              const v = f.vars.find((x) => x.key === k)!;
              return (
                <button key={k} role="radio" aria-checked={unknown === k} onClick={() => setUnknown(k)} className={`chip !px-3 !py-1 ${unknown === k ? '!border-accent !bg-accent/15 text-ink' : ''}`} title={v.name}>
                  <Tex>{v.symbol}</Tex>
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {f.vars
            .filter((v) => v.key !== unknown)
            .map((v) => (
              <NumberField key={v.key} tex={v.symbol} label={v.name} unit={v.unit} value={inputs[v.key] ?? ''} invalid={result.bad.includes(v.key)} onChange={(s) => setInputs((p) => ({ ...p, [v.key]: s }))} />
            ))}
        </div>
        <button className="btn !py-1 text-xs" onClick={() => setInputs(Object.fromEntries(f.vars.map((v) => [v.key, String(v.def)])))}>
          <RotateCcw className="h-3.5 w-3.5" /> Reset values
        </button>
      </div>
      <div className="space-y-3 rounded-xl border border-line bg-panel2/40 p-4" aria-live="polite">
        <div className="label">Rearranged</div>
        <Tex block>{r.tex}</Tex>
        {r.note && <p className="text-xs text-muted">{r.note}</p>}
        <div className="label pt-2">Result</div>
        {result.bad.length ? (
          <p className="text-sm text-bad">Enter a valid number for every input (e.g. 3.2e-19 or 3.2 × 10^-19).</p>
        ) : (
          <>
            <div className="flex flex-wrap items-baseline gap-2">
              <Tex className="text-lg">{`${uv.symbol} = ${Number.isFinite(result.value) ? sigTex(result.value, 4) : '\\text{no real solution}'}`}</Tex>
              {Number.isFinite(result.value) && <span className="num text-sm text-muted">{uv.unit}</span>}
            </div>
            <div className="num text-xs text-muted">= {sig(result.value, 6)}</div>
            {result.warnings.length ? (
              <ul className="space-y-1">
                {result.warnings.map((w) => (
                  <li key={w} className="flex gap-2 text-sm text-warn">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {w}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="flex gap-2 text-sm text-good">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Physically reasonable for these inputs.
              </p>
            )}
          </>
        )}
        <p className="text-[11px] text-muted">Angles in degrees. Values are SI unless a unit says otherwise. Check significant figures against your data.</p>
      </div>
    </div>
  );
}

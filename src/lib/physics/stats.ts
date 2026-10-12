/** Least-squares linear regression y = m x + c with standard errors. */
export interface Fit {
  m: number;
  c: number;
  r2: number;
  seM: number;
  seC: number;
  residuals: number[];
  /** standard deviation of residuals */
  sRes: number;
  n: number;
}

export function linearFit(xs: number[], ys: number[]): Fit | null {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return null;
  let sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (let i = 0; i < n; i++) {
    sx += xs[i];
    sy += ys[i];
    sxx += xs[i] * xs[i];
    sxy += xs[i] * ys[i];
  }
  const den = n * sxx - sx * sx;
  if (Math.abs(den) < 1e-300) return null;
  const m = (n * sxy - sx * sy) / den;
  const c = (sy - m * sx) / n;
  const yMean = sy / n;
  let ssRes = 0, ssTot = 0;
  const residuals: number[] = [];
  for (let i = 0; i < n; i++) {
    const r = ys[i] - (m * xs[i] + c);
    residuals.push(r);
    ssRes += r * r;
    ssTot += (ys[i] - yMean) ** 2;
  }
  const dof = Math.max(1, n - 2);
  const s2 = ssRes / dof;
  const xMean = sx / n;
  const sxxc = sxx - n * xMean * xMean;
  return {
    m,
    c,
    r2: ssTot > 0 ? 1 - ssRes / ssTot : 1,
    seM: n > 2 ? Math.sqrt(s2 / sxxc) : NaN,
    seC: n > 2 ? Math.sqrt(s2 * (1 / n + (xMean * xMean) / sxxc)) : NaN,
    residuals,
    sRes: Math.sqrt(s2),
    n,
  };
}

/** Line forced through the origin y = m x (useful when theory predicts zero intercept). */
export function originFit(xs: number[], ys: number[]) {
  let sxy = 0, sxx = 0;
  for (let i = 0; i < xs.length; i++) {
    sxy += xs[i] * ys[i];
    sxx += xs[i] * xs[i];
  }
  return sxx > 0 ? sxy / sxx : NaN;
}

/**
 * Flag (never remove) points whose residual exceeds k standard deviations of the residuals
 * computed WITHOUT that point (leave-one-out), so a single outlier cannot mask itself.
 */
export function flagAnomalies(xs: number[], ys: number[], k = 2.5): boolean[] {
  const n = xs.length;
  if (n < 4) return new Array(n).fill(false);
  return xs.map((_, i) => {
    const xo = xs.filter((__, j) => j !== i);
    const yo = ys.filter((__, j) => j !== i);
    const f = linearFit(xo, yo);
    if (!f || !(f.sRes > 0)) return false;
    const r = ys[i] - (f.m * xs[i] + f.c);
    return Math.abs(r) > k * f.sRes;
  });
}

export const mean = (a: number[]) => a.reduce((s, x) => s + x, 0) / a.length;
export function stdDev(a: number[]) {
  if (a.length < 2) return 0;
  const m = mean(a);
  return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1));
}
/** Half-range uncertainty for repeated measurements: (max − min)/2 */
export const halfRange = (a: number[]) => (Math.max(...a) - Math.min(...a)) / 2;
export const percentError = (measured: number, accepted: number) => (Math.abs(measured - accepted) / Math.abs(accepted)) * 100;
export const percentUncertainty = (abs: number, value: number) => (Math.abs(abs) / Math.abs(value)) * 100;

/** Format a number to n significant figures with scientific notation where appropriate. */
export function sig(x: number, n = 3): string {
  if (!Number.isFinite(x)) return x > 0 ? '∞' : x < 0 ? '−∞' : '—';
  if (x === 0) return '0';
  const a = Math.abs(x);
  if (a >= 1e-3 && a < 1e5) {
    const s = Number(x.toPrecision(n));
    return String(s).replace('-', '−');
  }
  const [mant, exp] = x.toExponential(n - 1).split('e');
  return `${mant.replace('-', '−')} × 10${toSup(Number(exp))}`;
}
function toSup(n: number) {
  return String(n).replace(/-/g, '⁻').replace(/\+/g, '').replace(/\d/g, (c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(c)]);
}
/** LaTeX version of sig() */
export function sigTex(x: number, n = 3): string {
  if (!Number.isFinite(x)) return '\\infty';
  if (x === 0) return '0';
  const a = Math.abs(x);
  if (a >= 1e-3 && a < 1e5) return String(Number(x.toPrecision(n)));
  const [mant, exp] = x.toExponential(n - 1).split('e');
  return `${mant}\\times10^{${Number(exp)}}`;
}

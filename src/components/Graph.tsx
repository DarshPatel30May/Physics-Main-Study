import { CartesianGrid, Legend, Line, LineChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Scatter, ComposedChart, Tooltip, XAxis, YAxis } from 'recharts';
import { useThemeColours } from '@/lib/hooks';
import { sig } from '@/lib/physics/stats';

export interface Series {
  key: string;
  label: string;
  colour?: string;
  dashed?: boolean;
  dot?: boolean;
}

export interface GraphProps {
  data: Record<string, number | null>[];
  xKey: string;
  series: Series[];
  xLabel: string;
  yLabel: string;
  height?: number;
  xDomain?: [number | 'auto' | 'dataMin', number | 'auto' | 'dataMax'];
  yDomain?: [number | 'auto' | 'dataMin', number | 'auto' | 'dataMax'];
  xScale?: 'linear' | 'log';
  yScale?: 'linear' | 'log';
  refX?: { x: number; label?: string; colour?: string }[];
  refY?: { y: number; label?: string; colour?: string }[];
  dots?: { x: number; y: number; colour?: string; label?: string }[];
  legend?: boolean;
  xTicks?: number[];
  reversedX?: boolean;
  xFormat?: (v: number) => string;
  yFormat?: (v: number) => string;
  /** points drawn as scatter (data analysis) */
  scatter?: { data: { x: number; y: number }[]; colour?: string; name: string }[];
}

const fmt = (v: number) => (typeof v === 'number' ? sig(v, 3) : String(v));

/** Line chart with physically labelled axes; animations disabled so live sims stay in sync. */
export function Graph({
  data, xKey, series, xLabel, yLabel, height = 220, xDomain = ['auto', 'auto'], yDomain = ['auto', 'auto'], xScale = 'linear', yScale = 'linear',
  refX = [], refY = [], dots = [], legend, xTicks, reversedX, xFormat = fmt, yFormat = fmt, scatter,
}: GraphProps) {
  const c = useThemeColours();
  const palette = [c.accent, c.m7, c.m6, c.m8, c.m5, c.bad];
  const Chart = scatter ? ComposedChart : LineChart;
  return (
    <div className="w-full" role="img" aria-label={`Graph of ${yLabel} against ${xLabel}`}>
      <ResponsiveContainer width="100%" height={height}>
        <Chart data={data} margin={{ top: 8, right: 16, bottom: 28, left: 12 }}>
          <CartesianGrid stroke={c.line} strokeOpacity={0.6} strokeDasharray="3 3" />
          <XAxis
            dataKey={xKey}
            type="number"
            domain={xDomain}
            scale={xScale}
            allowDataOverflow
            reversed={reversedX}
            ticks={xTicks}
            tickFormatter={xFormat}
            stroke={c.muted}
            tick={{ fontSize: 11, fill: c.muted }}
            label={{ value: xLabel, position: 'insideBottom', offset: -16, fill: c.ink, fontSize: 12 }}
          />
          <YAxis
            type="number"
            domain={yDomain}
            scale={yScale}
            allowDataOverflow
            tickFormatter={yFormat}
            stroke={c.muted}
            width={58}
            tick={{ fontSize: 11, fill: c.muted }}
            label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 4, fill: c.ink, fontSize: 12, style: { textAnchor: 'middle' } }}
          />
          <Tooltip
            contentStyle={{ background: c.panel, border: `1px solid ${c.line}`, borderRadius: 10, fontSize: 12 }}
            labelStyle={{ color: c.ink }}
            labelFormatter={(v) => `${xLabel}: ${fmt(Number(v))}`}
            formatter={(v: number, name: string) => [fmt(v), name]}
          />
          {legend && <Legend verticalAlign="top" height={24} wrapperStyle={{ fontSize: 12 }} />}
          {refX.map((r, i) => (
            <ReferenceLine key={`x${i}`} x={r.x} stroke={r.colour ?? c.muted} strokeDasharray="4 4" label={r.label ? { value: r.label, fill: r.colour ?? c.muted, fontSize: 11, position: 'top' } : undefined} />
          ))}
          {refY.map((r, i) => (
            <ReferenceLine key={`y${i}`} y={r.y} stroke={r.colour ?? c.muted} strokeDasharray="4 4" label={r.label ? { value: r.label, fill: r.colour ?? c.muted, fontSize: 11, position: 'insideTopRight' } : undefined} />
          ))}
          {series.map((s, i) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.colour ?? palette[i % palette.length]}
              strokeWidth={2}
              strokeDasharray={s.dashed ? '6 4' : undefined}
              dot={s.dot ? { r: 3 } : false}
              isAnimationActive={false}
              connectNulls={false}
            />
          ))}
          {scatter?.map((s) => <Scatter key={s.name} name={s.name} data={s.data} dataKey="y" fill={s.colour ?? c.m7} isAnimationActive={false} />)}
          {dots.map((d, i) => (
            <ReferenceDot key={`d${i}`} x={d.x} y={d.y} r={5} fill={d.colour ?? c.accent} stroke={c.panel} label={d.label ? { value: d.label, fill: c.ink, fontSize: 11, position: 'top' } : undefined} />
          ))}
        </Chart>
      </ResponsiveContainer>
    </div>
  );
}

/** Sample a function into chart data. */
export function sample(f: (x: number) => Record<string, number | null>, x0: number, x1: number, n = 200, key = 'x') {
  const out: Record<string, number | null>[] = [];
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    out.push({ [key]: x, ...f(x) });
  }
  return out;
}

export function sampleLog(f: (x: number) => Record<string, number | null>, x0: number, x1: number, n = 200, key = 'x') {
  const out: Record<string, number | null>[] = [];
  const a = Math.log10(x0);
  const b = Math.log10(x1);
  for (let i = 0; i <= n; i++) {
    const x = Math.pow(10, a + ((b - a) * i) / n);
    out.push({ [key]: x, ...f(x) });
  }
  return out;
}

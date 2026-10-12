import { useEffect, useRef } from 'react';

interface Props {
  width: number;
  height: number;
  /** source positions (canvas px) on the barrier */
  sources: number[];
  barrierX: number;
  lambdaPx: number;
  phase: number;
  rgb: [number, number, number];
  /** draw the screen intensity strip on the right */
  screen?: (y: number) => number;
}

/**
 * Renders superposed circular waves (Huygens wavelets) from point sources on a barrier,
 * with incident plane waves on the left. Low-resolution canvas for performance.
 */
export default function WaveCanvas({ width, height, sources, barrierX, lambdaPx, phase, rgb, screen }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const scale = 2; // render at half resolution
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const w = Math.floor(width / scale);
    const h = Math.floor(height / scale);
    const img = ctx.createImageData(w, h);
    const k = (2 * Math.PI) / lambdaPx;
    const n = sources.length;
    for (let j = 0; j < h; j++) {
      const y = j * scale;
      for (let i = 0; i < w; i++) {
        const x = i * scale;
        let amp = 0;
        if (x < barrierX) {
          amp = Math.cos(k * x - phase);
        } else {
          for (let s = 0; s < n; s++) {
            const dx = x - barrierX;
            const dy = y - sources[s];
            const r = Math.sqrt(dx * dx + dy * dy) + 1;
            amp += Math.cos(k * (barrierX + r) - phase) / Math.sqrt(r / 20 + 1);
          }
          amp /= Math.max(1, n * 0.6);
        }
        const v = Math.max(0, Math.min(1, 0.5 + 0.5 * amp));
        const idx = (j * w + i) * 4;
        img.data[idx] = rgb[0] * v;
        img.data[idx + 1] = rgb[1] * v;
        img.data[idx + 2] = rgb[2] * v;
        img.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    // barrier
    ctx.fillStyle = '#64748b';
    const bx = Math.floor(barrierX / scale);
    ctx.fillRect(bx - 1, 0, 3, h);
    ctx.fillStyle = '#000';
    for (const s of sources) ctx.fillRect(bx - 1, Math.floor(s / scale) - 1, 3, 3);
    if (screen) {
      for (let j = 0; j < h; j++) {
        const I = screen(j * scale);
        ctx.fillStyle = `rgb(${Math.round(rgb[0] * I)},${Math.round(rgb[1] * I)},${Math.round(rgb[2] * I)})`;
        ctx.fillRect(w - 8, j, 8, 1);
      }
    }
  }, [width, height, sources, barrierX, lambdaPx, phase, rgb, screen]);
  return <canvas ref={ref} width={Math.floor(width / scale)} height={Math.floor(height / scale)} className="h-auto w-full [image-rendering:auto]" aria-hidden />;
}

export function parseRGB(s: string): [number, number, number] {
  const m = s.match(/(\d+),\s*(\d+),\s*(\d+)/);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : [255, 255, 255];
}

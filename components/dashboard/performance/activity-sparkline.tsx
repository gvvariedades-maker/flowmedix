'use client';

import { useId, useMemo } from 'react';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DiaEstudo, Periodo } from './types';

type Trend = 'up' | 'down' | 'flat';

const SPARK_W = 128;
const SPARK_H = 36;
const PAD = 2;

/** Compara a 1ª metade vs a 2ª do período (±10% = estável). */
export function computeActivityTrend(counts: number[]): {
  trend: Trend;
  deltaPct: number | null;
} {
  if (counts.length < 4) return { trend: 'flat', deltaPct: null };

  const mid = Math.floor(counts.length / 2);
  const first = counts.slice(0, mid).reduce((a, b) => a + b, 0);
  const second = counts.slice(mid).reduce((a, b) => a + b, 0);

  if (first === 0 && second === 0) return { trend: 'flat', deltaPct: null };
  if (first === 0) {
    return { trend: second > 0 ? 'up' : 'flat', deltaPct: null };
  }

  const deltaPct = Math.round(((second - first) / first) * 100);
  if (Math.abs(deltaPct) < 10) return { trend: 'flat', deltaPct };
  return { trend: deltaPct > 0 ? 'up' : 'down', deltaPct };
}

function buildSparkPaths(counts: number[]) {
  const n = counts.length;
  if (n === 0) return { line: '', area: '' };

  const max = Math.max(...counts, 1);
  const points = counts.map((c, i) => {
    const x = PAD + (i / Math.max(n - 1, 1)) * (SPARK_W - PAD * 2);
    const y = SPARK_H - PAD - (c / max) * (SPARK_H - PAD * 2);
    return { x, y };
  });

  const line = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ');
  const last = points[points.length - 1]!;
  const first = points[0]!;
  const area = `${line} L${last.x.toFixed(1)},${SPARK_H - PAD} L${first.x.toFixed(1)},${SPARK_H - PAD} Z`;
  return { line, area };
}

const TREND_COPY: Record<
  Trend,
  { label: string; className: string; Icon: typeof TrendingUp }
> = {
  up: {
    label: 'Em alta',
    className: 'text-[var(--color-success-text)]',
    Icon: TrendingUp,
  },
  down: {
    label: 'Em queda',
    className: 'text-[var(--color-danger)]',
    Icon: TrendingDown,
  },
  flat: {
    label: 'Estável',
    className: 'text-slate-500',
    Icon: Minus,
  },
};

type Props = {
  serie: DiaEstudo[];
  periodo: Periodo;
  className?: string;
};

/**
 * Leitura de tendência dos últimos N dias (serie30dias).
 * SVG inline — sem biblioteca de gráficos.
 */
export function ActivitySparkline({ serie, periodo, className }: Props) {
  const gradId = useId().replace(/:/g, '');
  const dados = useMemo(() => serie.slice(-periodo), [serie, periodo]);
  const counts = useMemo(() => dados.map((d) => d.count), [dados]);
  const { trend, deltaPct } = useMemo(() => computeActivityTrend(counts), [counts]);
  const { line, area } = useMemo(() => buildSparkPaths(counts), [counts]);
  const { label, className: trendClass, Icon } = TREND_COPY[trend];

  if (counts.length === 0 || counts.every((c) => c === 0)) return null;

  const deltaLabel =
    deltaPct != null && Math.abs(deltaPct) >= 10
      ? `${deltaPct > 0 ? '+' : ''}${deltaPct}%`
      : null;

  const ariaLabel = [
    `Tendência dos últimos ${periodo} dias: ${label.toLowerCase()}`,
    deltaLabel ? `(${deltaLabel} vs. metade anterior)` : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cn('flex min-w-0 items-center gap-3', className)}
      role="img"
      aria-label={ariaLabel}
    >
      <svg
        width={SPARK_W}
        height={SPARK_H}
        viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
        className="shrink-0 overflow-visible"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-success)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-success)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {area ? <path d={area} fill={`url(#${gradId})`} /> : null}
        {line ? (
          <path
            d={line}
            fill="none"
            stroke="var(--color-success)"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
      </svg>
      <div className="min-w-0">
        <p className={cn('flex items-center gap-1 text-xs font-semibold', trendClass)}>
          <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden strokeWidth={2.25} />
          <span>{label}</span>
          {deltaLabel ? (
            <span className="tabular-nums font-medium opacity-80">{deltaLabel}</span>
          ) : null}
        </p>
        <p className="mt-0.5 text-[10px] font-medium text-slate-500">
          vs. metade anterior do período
        </p>
      </div>
    </div>
  );
}

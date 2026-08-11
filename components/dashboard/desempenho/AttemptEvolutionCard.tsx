'use client';

import { useId, useMemo } from 'react';
import { Clock, Crosshair, Timer } from 'lucide-react';
import { ScoreCard } from '@/components/ui/score-card';
import {
  formatDesempenhoDate,
  formatDesempenhoDurationMs,
  formatDesempenhoPct,
} from '@/components/dashboard/desempenho/formatDesempenho';
import type { AttemptSeriesData } from '@/lib/desempenho/types';
import { cn } from '@/lib/utils';

const SPARK_W = 220;
const SPARK_H = 48;
const PAD = 3;

function buildPctSparkPaths(percentuals: Array<number | null>) {
  const points = percentuals
    .map((pct, i) => {
      if (pct === null) return null;
      const x = PAD + (i / Math.max(percentuals.length - 1, 1)) * (SPARK_W - PAD * 2);
      const y = SPARK_H - PAD - (pct / 100) * (SPARK_H - PAD * 2);
      return { x, y };
    })
    .filter((p): p is { x: number; y: number } => p != null);

  if (points.length === 0) return { line: '', area: '' };

  const line = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ');
  const last = points[points.length - 1]!;
  const first = points[0]!;
  const area = `${line} L${last.x.toFixed(1)},${SPARK_H - PAD} L${first.x.toFixed(1)},${SPARK_H - PAD} Z`;
  return { line, area };
}

type Props = {
  series: AttemptSeriesData;
  className?: string;
};

/**
 * Dobra P4 no placar: evolução diária de % + tempo médio + acerto na 1ª tentativa.
 * Esconde-se quando a flag EE está off (fallback P0).
 */
export function AttemptEvolutionCard({ series, className }: Props) {
  const gradId = useId().replace(/:/g, '');

  const pctSeries = useMemo(
    () => series.daily.map((d) => d.percentual),
    [series.daily],
  );
  const { line, area } = useMemo(() => buildPctSparkPaths(pctSeries), [pctSeries]);
  const hasSpark = series.daily.some((d) => d.attempts > 0);

  if (!series.available && series.unavailableReason === 'flag_off') {
    return null;
  }

  if (!series.available && series.unavailableReason === 'error') {
    return null;
  }

  if (series.available && series.unavailableReason === 'empty') {
    return (
      <section
        aria-label="Evolução de tentativas"
        className={cn('metric-card space-y-2 p-5', className)}
      >
        <h2 className="text-sm font-semibold text-slate-900">Evolução (ledger)</h2>
        <p className="text-xs text-muted-foreground">
          Ainda não há tentativas instrumentadas neste período. Continue praticando — a série
          aparece conforme as respostas forem gravadas no Evidence Engine.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label="Evolução de tentativas"
      className={cn('space-y-3', className)}
    >
      <div className="metric-card space-y-3 p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Evolução do % de acerto</h2>
            <p className="text-xs text-muted-foreground">
              Série diária a partir do ledger de tentativas (prática regular).
            </p>
          </div>
          {series.coberturaParcial && series.dadosDesde ? (
            <p
              className="rounded-md bg-[var(--color-warning-dim)] px-2 py-1 text-[11px] font-medium text-slate-700"
              role="status"
            >
              Dados a partir de {formatDesempenhoDate(series.dadosDesde)} — cobertura parcial
              do histórico antigo.
            </p>
          ) : series.dadosDesde ? (
            <p className="text-[11px] text-muted-foreground">
              Desde {formatDesempenhoDate(series.dadosDesde)}
            </p>
          ) : null}
        </div>

        {hasSpark ? (
          <div
            className="flex items-end gap-3"
            role="img"
            aria-label={`Evolução diária de acerto em ${series.daily.filter((d) => d.attempts > 0).length} dias com prática`}
          >
            <svg
              width={SPARK_W}
              height={SPARK_H}
              viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
              className="max-w-full shrink-0 overflow-visible"
              aria-hidden
            >
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {area ? <path d={area} fill={`url(#${gradId})`} /> : null}
              {line ? (
                <path
                  d={line}
                  fill="none"
                  stroke="var(--color-brand)"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}
            </svg>
            <p className="pb-1 text-[11px] text-muted-foreground">
              {series.totalEvents} tentativa{series.totalEvents === 1 ? '' : 's'} ·{' '}
              {series.distinctQuestions} questão
              {series.distinctQuestions === 1 ? '' : 'ões'}
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Sem pontos no período selecionado.</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <ScoreCard
          label="Tempo médio"
          value={formatDesempenhoDurationMs(series.tempoMedioMs)}
          icon={Timer}
          variant="brand"
        />
        <ScoreCard
          label="Acerto na 1ª tentativa"
          value={formatDesempenhoPct(series.firstAttemptAccuracyPct)}
          icon={Crosshair}
          variant={
            series.firstAttemptAccuracyPct != null && series.firstAttemptAccuracyPct >= 70
              ? 'success'
              : 'warning'
          }
        />
        <ScoreCard
          label="Tentativas / questão"
          value={
            series.attemptsPerQuestionAvg != null
              ? String(series.attemptsPerQuestionAvg).replace('.', ',')
              : '—'
          }
          icon={Clock}
          variant="brand"
        />
      </div>
    </section>
  );
}

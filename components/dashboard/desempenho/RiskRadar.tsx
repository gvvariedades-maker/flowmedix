import { cn } from '@/lib/utils';
import type { RiskBandPerformance } from '@/lib/desempenho/types';
import {
  desempenhoPctTone,
  formatDesempenhoPct,
} from '@/components/dashboard/desempenho/formatDesempenho';

type Props = {
  riskBands: RiskBandPerformance[];
};

const BAR_TONE_CLASS = {
  neutral: 'bg-slate-300',
  danger: 'bg-[var(--color-danger)]',
  warning: 'bg-[var(--color-warning)]',
  success: 'bg-[var(--color-success)]',
} as const;

const PCT_TONE_CLASS = {
  neutral: 'text-slate-700',
  danger: 'text-[var(--color-danger-text)]',
  warning: 'text-[var(--color-warning-text)]',
  success: 'text-[var(--color-success-text)]',
} as const;

/**
 * Faixas de incidência típicas de prova TE (alta incidência/protocolo, clínico crítico, etc.).
 */
export function RiskRadar({ riskBands }: Props) {
  const bands = riskBands.filter(
    (band) => band.riskBandId !== 'outros' || band.respondidas > 0,
  );

  if (bands.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Sem dados de faixa no filtro atual.</p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {bands.map((band) => {
        const tone = desempenhoPctTone(band.percentual, band.amostraSuficiente);
        const barWidth =
          band.amostraSuficiente && band.percentual !== null ? band.percentual : 0;

        return (
          <div
            key={band.riskBandId}
            className="metric-card flex flex-col gap-3 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">{band.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {band.respondidas} respondidas · cobertura {band.coberturaPct}%
                </p>
              </div>
              <p
                className={cn(
                  'font-display text-xl font-bold tabular-nums',
                  PCT_TONE_CLASS[tone],
                )}
              >
                {band.amostraSuficiente
                  ? formatDesempenhoPct(band.percentual)
                  : band.respondidas > 0
                    ? `${band.acertos}/${band.respondidas}`
                    : '—'}
              </p>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-slate-100"
              role="presentation"
              aria-hidden
            >
              <div
                className={cn('h-full rounded-full transition-[width]', BAR_TONE_CLASS[tone])}
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

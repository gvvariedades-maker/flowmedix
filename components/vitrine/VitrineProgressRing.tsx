'use client';

import { ProgressRing } from '@/components/ui/progress-ring';
import { VITRINE_BRAND_HEX, vitrineBrand } from '@/lib/vitrine/vitrineBrand';
import { resolveAcertoDisplay } from '@/lib/vitrine/resolveAcertoDisplay';
import { cn } from '@/lib/utils';

type VitrineProgressRingProps = {
  acertos: number;
  respondidas: number;
  total: number;
  percentual: number;
  size?: number;
  strokeWidth?: number;
};

export function VitrineProgressRing({
  acertos,
  respondidas,
  total,
  percentual,
  size = 120,
  strokeWidth = 14,
}: VitrineProgressRingProps) {
  const display = resolveAcertoDisplay({
    acertos,
    totalResolvidas: respondidas,
    totalQuestoes: total,
    percentual,
  });
  const coberturaCompleta = display.coberturaPct >= 100 && total > 0;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <ProgressRing
        value={display.ringValue}
        size={size}
        strokeWidth={strokeWidth}
        variant={coberturaCompleta || display.tone === 'success' ? 'success' : 'brand'}
        strokeColor={
          coberturaCompleta || display.tone === 'success' ? undefined : VITRINE_BRAND_HEX
        }
      />
      <div
        className="absolute inset-0 flex select-none flex-col items-center justify-center px-2"
        aria-hidden
      >
        <span
          className={cn(
            'leading-none font-bold tabular-nums',
            display.tone === 'muted' && 'text-slate-500',
            display.tone === 'brand' && 'text-slate-900',
            display.tone === 'success' && 'text-[var(--color-success-text)]',
          )}
          style={{
            fontSize:
              display.amostraSuficiente || respondidas === 0
                ? size >= 120
                  ? '1.5rem'
                  : '1.1rem'
                : size >= 120
                  ? '1.05rem'
                  : '0.85rem',
          }}
        >
          {display.label}
        </span>
        {respondidas > 0 ? (
          <span className="mt-1 text-center text-[0.55rem] font-medium uppercase tracking-wide text-slate-500 sm:text-[0.6rem]">
            {display.amostraSuficiente ? 'de acerto' : 'amostra baixa'}
          </span>
        ) : null}
        {coberturaCompleta ? (
          <span
            className={cn(
              'mt-0.5 text-[0.5rem] font-semibold uppercase tracking-wide',
              vitrineBrand.text,
            )}
          >
            Completo
          </span>
        ) : null}
      </div>
    </div>
  );
}

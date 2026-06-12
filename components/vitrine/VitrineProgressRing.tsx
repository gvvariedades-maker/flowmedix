'use client';

import { ProgressRing } from '@/components/ui/progress-ring';

type VitrineProgressRingProps = {
  trabalhadas: number;
  total: number;
  size?: number;
  strokeWidth?: number;
};

export function VitrineProgressRing({
  trabalhadas,
  total,
  size = 120,
  strokeWidth = 14,
}: VitrineProgressRingProps) {
  const todas = trabalhadas === total && total > 0;
  const value = total > 0 ? (trabalhadas / total) * 100 : 0;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <ProgressRing
        value={value}
        size={size}
        strokeWidth={strokeWidth}
        variant={todas ? 'success' : 'brand'}
      />
      <div className="absolute inset-0 flex select-none flex-col items-center justify-center">
        <span
          className="leading-none font-bold tabular-nums text-slate-900"
          style={{ fontSize: size >= 120 ? '1.5rem' : '1.1rem' }}
        >
          {trabalhadas}
        </span>
        <span className="mt-1 text-[0.55rem] font-medium uppercase tracking-wide text-slate-500 sm:text-[0.6rem]">
          de {total}
        </span>
        {todas ? (
          <span className="mt-0.5 text-[0.5rem] font-semibold uppercase tracking-wide text-green-600">
            Completo
          </span>
        ) : null}
      </div>
    </div>
  );
}

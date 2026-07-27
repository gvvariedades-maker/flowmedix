'use client';

/**
 * UI de convicção — Evidence Engine Fase 1 (Lote 8).
 * Renderizada só na coorte técnica (ver lib/evidence/convictionGate.ts).
 * Spec §1.5, §4.2: Chutei / Entre duas / Tenho certeza → chute / entre_duas / certeza.
 */

import { useId } from 'react';
import { cn } from '@/lib/utils';
import type { EvidenceConviction } from '@/lib/evidence/types';

export type ConvictionChoice = Exclude<EvidenceConviction, 'unknown'>;

const CONVICTION_OPTIONS: ReadonlyArray<{ value: ConvictionChoice; label: string }> = [
  { value: 'chute', label: 'Chutei' },
  { value: 'entre_duas', label: 'Entre duas' },
  { value: 'certeza', label: 'Tenho certeza' },
];

export type ConvictionSelectorProps = {
  onSelect: (conviction: ConvictionChoice) => void;
  disabled?: boolean;
  className?: string;
};

/**
 * Três botões — radiogroup acessível. Sem estado de seleção interno:
 * o caller decide o próximo passo (ex.: confirmar resposta) em `onSelect`.
 */
export function ConvictionSelector({ onSelect, disabled, className }: ConvictionSelectorProps) {
  const labelId = useId();

  return (
    <div className={cn('flex w-full max-w-xl flex-col items-center gap-2', className)}>
      <p id={labelId} className="text-xs font-semibold text-slate-600">
        Qual foi o seu nível de convicção nessa resposta?
      </p>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3"
      >
        {CONVICTION_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={false}
            disabled={disabled}
            onClick={() => onSelect(option.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:border-sky-400 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

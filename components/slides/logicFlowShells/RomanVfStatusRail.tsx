'use client';

import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type RomanVfItemStatus = 'verdadeira' | 'falsa' | 'neutra';

const DEFAULT_ROMANS = ['I', 'II', 'III'] as const;

const STATUS_CLASS: Record<RomanVfItemStatus, string> = {
  verdadeira: 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300/60',
  falsa: 'bg-rose-300/90 text-rose-50 line-through opacity-80',
  neutra: 'border-2 border-slate-200 bg-white text-slate-800 shadow-sm',
};

export interface RomanVfStatusRailProps {
  status: Record<'I' | 'II' | 'III', RomanVfItemStatus>;
  romans?: readonly ('I' | 'II' | 'III')[];
  className?: string;
}

/**
 * Trilho I–III para V/F (Tb / Adolescente weave): V = verde+✓, F = riscado, neutro = pendente.
 * Status vem do JSON parseado — 0 hardcode de gabarito.
 */
export function RomanVfStatusRail({
  status,
  romans = DEFAULT_ROMANS,
  className,
}: RomanVfStatusRailProps) {
  return (
    <div
      className={cn('flex flex-wrap justify-center gap-3', className)}
      role="list"
      aria-label="Afirmativas V/F"
    >
      {romans.map((roman) => {
        const st = status[roman] ?? 'neutra';
        return (
          <span
            key={roman}
            role="listitem"
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-xl font-body text-sm font-black transition-all md:h-12 md:w-12',
              STATUS_CLASS[st],
            )}
          >
            {roman}
            {st === 'verdadeira' ? (
              <Check className="ml-0.5 h-3.5 w-3.5" strokeWidth={3} aria-hidden />
            ) : null}
            {st === 'falsa' ? <X className="ml-0.5 h-3.5 w-3.5" strokeWidth={3} aria-hidden /> : null}
          </span>
        );
      })}
    </div>
  );
}

/**
 * Acumula status I–III a partir de passos com `roman` + `status` até o índice ativo.
 */
export function romanVfStatusFromSteps(
  steps: Array<{ roman?: 'I' | 'II' | 'III' | null; status: RomanVfItemStatus }>,
  activeStepIndex: number,
): Record<'I' | 'II' | 'III', RomanVfItemStatus> {
  const out: Record<'I' | 'II' | 'III', RomanVfItemStatus> = {
    I: 'neutra',
    II: 'neutra',
    III: 'neutra',
  };
  const max = Math.min(activeStepIndex, steps.length - 1);
  for (let i = 0; i <= max; i++) {
    const step = steps[i];
    if (step?.roman && step.status !== 'neutra') {
      out[step.roman] = step.status;
    }
  }
  return out;
}

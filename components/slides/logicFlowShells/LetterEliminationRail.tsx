'use client';

import { cn } from '@/lib/utils';

const DEFAULT_LETTERS = ['A', 'B', 'C', 'D', 'E'] as const;

export type LetterEliminationStep = {
  letter?: string | null;
  kind: string;
};

/** Kinds que riscam letra no trilho (MCQ + catch-up PNI + PT eliminar_letra + Z threshold). */
const ELIMINATE_KINDS = new Set([
  'eliminate',
  'catchup_eliminate',
  'eliminar_letra',
  'threshold',
]);

/** Kinds que marcam a letra vencedora. */
const LOCATE_KINDS = new Set(['locate', 'gabarito', 'mark']);

/**
 * Deriva letras eliminadas + gabarito a partir de passos parseados
 * (Mulher / PNI / PT / eliminação MCQ).
 * eliminate* / eliminar_letra / threshold → risca; locate / gabarito / mark → vencedora.
 */
export function letterEliminationFromSteps(
  steps: LetterEliminationStep[],
  activeStepIndex: number,
  isComplete: boolean,
): { eliminated: Set<string>; winnerLetter: string | null } {
  const eliminated = new Set<string>();
  const max = Math.min(activeStepIndex, steps.length - 1);
  for (let i = 0; i <= max; i++) {
    const step = steps[i];
    if (step?.letter && ELIMINATE_KINDS.has(step.kind)) {
      eliminated.add(step.letter.toUpperCase());
    }
  }

  let winnerLetter: string | null = null;
  for (let i = steps.length - 1; i >= 0; i--) {
    const step = steps[i];
    if (step?.letter && LOCATE_KINDS.has(step.kind)) {
      winnerLetter = step.letter.toUpperCase();
      break;
    }
  }

  return { eliminated, winnerLetter };
}

/**
 * Adapta papéis PT (eliminar_letra / gabarito / …) para o trilho A–E.
 * `extractLetter` cobre `A: …`; fallback pega letra solta em “Gabarito B”.
 */
export function letterStepsFromPtRoles(
  steps: string[],
  inferRole: (step: string) => string,
  extractLetter: (step: string) => string | null,
): LetterEliminationStep[] {
  return steps.map((step) => {
    const role = inferRole(step);
    let letter = extractLetter(step);
    if (!letter && (role === 'gabarito' || role === 'validar_letra')) {
      letter =
        step.match(/\bgabarito\s+([A-E])\b/i)?.[1]?.toUpperCase() ??
        step.match(/\bmarque\s+([A-E])\b/i)?.[1]?.toUpperCase() ??
        step.match(/\b([A-E])\b/)?.[1]?.toUpperCase() ??
        null;
    }
    return { letter: letter ?? undefined, kind: role };
  });
}

export interface LetterEliminationRailProps {
  eliminated: Set<string>;
  winnerLetter?: string | null;
  isComplete?: boolean;
  letters?: readonly string[];
  className?: string;
}

/** Trilho A–E: eliminadas riscadas; gabarito em verde ao completar. */
export function LetterEliminationRail({
  eliminated,
  winnerLetter = null,
  isComplete = false,
  letters = DEFAULT_LETTERS,
  className,
}: LetterEliminationRailProps) {
  return (
    <div
      className={cn('flex flex-wrap justify-center gap-2', className)}
      role="list"
      aria-label="Alternativas"
    >
      {letters.map((letter) => {
        const isEliminated = eliminated.has(letter);
        const isWinner = Boolean(isComplete && winnerLetter === letter);
        return (
          <span
            key={letter}
            role="listitem"
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl font-body text-sm font-black transition-all',
              isWinner
                ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300/60'
                : isEliminated
                  ? 'bg-rose-200/80 text-rose-400 line-through opacity-60'
                  : 'border-2 border-slate-200 bg-white text-slate-800 shadow-sm',
            )}
          >
            {letter}
          </span>
        );
      })}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, HelpCircle } from 'lucide-react';
import {
  CLITIC_QUIZ_CHOICES,
  type CliticQuizChoice,
} from '@/lib/slides/transferQuiz';

type TransferCliticQuizProps = {
  promptDetail: string;
  expected: CliticQuizChoice;
  onAnswered: (choice: CliticQuizChoice, correct: boolean) => void;
  revealedExplanation?: string;
};

/**
 * Quiz ativo: escolha pró/ên/meso antes de revelar a explicação.
 */
export function TransferCliticQuiz({
  promptDetail,
  expected,
  onAnswered,
  revealedExplanation,
}: TransferCliticQuizProps) {
  const prefersReducedMotion = useReducedMotion();
  const [selected, setSelected] = useState<CliticQuizChoice | null>(null);
  const answered = selected !== null;
  const isCorrect = selected === expected;

  const handlePick = (choice: CliticQuizChoice) => {
    if (answered) return;
    setSelected(choice);
    onAnswered(choice, choice === expected);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2.5">
        <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-amber-800">
            Transferência — classifique antes de ver a resposta
          </p>
          {promptDetail ? (
            <p className="mt-1 font-body text-sm font-semibold leading-relaxed text-slate-900">
              {promptDetail}
            </p>
          ) : null}
          <p className="mt-1.5 font-body text-xs text-amber-900/80">
            O pronome fica antes, dentro ou depois do verbo?
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" role="group" aria-label="Classificação pronominal">
        {CLITIC_QUIZ_CHOICES.map((choice) => {
          const isSelected = selected === choice.id;
          const showResult = answered && isSelected;
          const ok = choice.id === expected;
          return (
            <button
              key={choice.id}
              type="button"
              disabled={answered}
              onClick={() => handlePick(choice.id)}
              className={`min-h-[44px] rounded-xl border px-3 py-2.5 font-display text-sm font-bold transition-colors ${
                !answered
                  ? 'border-slate-200 bg-white text-slate-900 hover:border-sky-300 hover:bg-sky-50'
                  : showResult && ok
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                    : showResult && !ok
                      ? 'border-rose-300 bg-rose-50 text-rose-900'
                      : ok
                        ? 'border-emerald-200 bg-emerald-50/60 text-emerald-800'
                        : 'border-slate-100 bg-slate-50 text-slate-400'
              }`}
            >
              {choice.label}
            </button>
          );
        })}
      </div>

      {answered && revealedExplanation ? (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl border px-3 py-2.5 ${
            isCorrect
              ? 'border-emerald-200 bg-emerald-50/90'
              : 'border-amber-200 bg-amber-50/90'
          }`}
        >
          <p className="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-800">
            <Check className="h-3.5 w-3.5" aria-hidden />
            {isCorrect ? 'Acertou — o trilho exige' : 'O trilho exige'}
          </p>
          <p className="mt-1 font-body text-sm leading-relaxed text-slate-900">
            {revealedExplanation}
          </p>
        </motion.div>
      ) : null}
    </div>
  );
}

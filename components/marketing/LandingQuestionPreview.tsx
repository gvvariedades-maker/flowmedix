'use client';

import { Scissors } from 'lucide-react';
import { landingDemoQuestao } from '@/lib/landingDemoQuestao';
import { LandingDemoJourneyChip } from '@/components/marketing/LandingDemoJourneyChip';
import {
  buildQuestionExamDetailLine,
  buildQuestionHeaderChips,
  buildQuestionSubjectLine,
  stripLeadingQuestionEnumeration,
} from '@/lib/questionHeader';
import { cn } from '@/lib/utils';

const QUESTION_TYPO = 'text-[11px] leading-snug font-medium md:font-normal';

/**
 * Preview estático da tela de questão (mesmo visual editorial do player).
 * Sem interação — uso em molduras da landing.
 */
export function LandingQuestionPreview({ className }: { className?: string }) {
  const meta = landingDemoQuestao.meta;
  const instruction = stripLeadingQuestionEnumeration(
    landingDemoQuestao.question_data.instruction,
  );
  const subjectLine = buildQuestionSubjectLine(meta);
  const chips = buildQuestionHeaderChips(meta);
  const examDetailLine = buildQuestionExamDetailLine(meta);
  const options = landingDemoQuestao.question_data.options;

  return (
    <div
      className={cn('pointer-events-none flex min-h-[420px] select-none flex-col bg-white', className)}
      aria-hidden
    >
      <LandingDemoJourneyChip />
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-3 py-2">
        <span className="text-[10px] font-semibold text-slate-500">Vitrine</span>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-semibold tabular-nums text-slate-600">
          2/124
        </span>
      </div>

      <div className="border-b border-slate-200 bg-slate-50 px-3 py-2.5">
        {subjectLine ? (
          <p className="border-l-[3px] border-[#22c55e] pl-2 text-[11px] font-semibold leading-snug text-slate-900">
            {subjectLine}
          </p>
        ) : null}
        {chips.length > 0 ? (
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            {chips.map((chip) => (
              <span
                key={chip.id}
                className={cn(
                  'rounded-md border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide',
                  chip.tone === 'banca'
                    ? 'border-sky-200 bg-sky-50 text-sky-800'
                    : 'border-slate-200 bg-white text-slate-600',
                )}
              >
                {chip.label}
              </span>
            ))}
            {examDetailLine ? (
              <span className="text-[8px] text-slate-500">{examDetailLine}</span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="flex-1 overflow-hidden px-3 pt-2.5">
        <p className={cn(QUESTION_TYPO, 'text-slate-900 line-clamp-5')}>{instruction}</p>

        <div className="mt-2.5 space-y-1.5">
          {options.map((opt) => {
            const isSelected = opt.id === 'C';
            return (
              <div key={opt.id} className="flex items-center gap-1">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center text-slate-500">
                  <Scissors size={12} strokeWidth={2} aria-hidden />
                </span>
                <div
                  className={cn(
                    'flex min-h-[36px] flex-1 items-center gap-2 rounded-lg border px-2 py-1.5',
                    isSelected
                      ? 'border-sky-400 bg-sky-50 ring-1 ring-sky-200'
                      : 'border-slate-200 bg-white',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold',
                      isSelected
                        ? 'bg-sky-600 text-white'
                        : 'border border-slate-300 bg-slate-50 text-slate-800',
                    )}
                  >
                    {opt.id}
                  </span>
                  <span
                    className={cn(
                      QUESTION_TYPO,
                      'min-w-0 flex-1',
                      isSelected ? 'font-semibold text-sky-950' : 'text-slate-900',
                    )}
                  >
                    {opt.text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-200 px-3 py-2">
        <div className="mx-auto flex h-8 max-w-[200px] items-center justify-center rounded-full bg-[#22c55e] text-[10px] font-bold text-slate-900">
          Confirmar Resposta
        </div>
      </div>
    </div>
  );
}

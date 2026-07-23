'use client';

import { useCallback, useEffect, useState, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Filter, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { useDangerZoneCompareReveal } from './dangerZoneReveal';
import type { DangerZoneItem } from './DangerZone';
import {
  inferFunnelStage,
  stageBadge,
  stageChips,
  type PtCraseChip,
} from '@/lib/slides/ptCraseSlideUtils';
import {
  inferCraseQuizAnswer,
  isTransferDangerItem,
} from '@/lib/slides/transferQuiz';
import { useReverseStudyCompletionGate } from '@/components/lesson/ReverseStudyCompletionGate';
import { TransferCraseQuiz } from './TransferCraseQuiz';

const CHIP_STYLES: Record<PtCraseChip['tone'], string> = {
  amber: 'bg-amber-100/90 text-amber-900 ring-amber-300/50',
  rose: 'bg-rose-100/90 text-rose-900 ring-rose-300/50',
  emerald: 'bg-emerald-100/90 text-emerald-900 ring-emerald-300/50',
  slate: 'bg-slate-100/90 text-slate-800 ring-slate-300/50',
};

function extractLetter(label: string): string | null {
  const match = label.match(/^([A-E])\b/);
  return match ? match[1].toUpperCase() : null;
}

function ChipsRow({ chips, revealed }: { chips: PtCraseChip[]; revealed: boolean }) {
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <span
          key={chip.label}
          className={`rounded-lg px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wide ring-1 ${
            revealed ? CHIP_STYLES.emerald : CHIP_STYLES[chip.tone]
          }`}
        >
          {chip.label}
        </span>
      ))}
    </div>
  );
}

function LetterBadge({ letter }: { letter: string }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 font-display text-lg font-black text-white shadow-sm">
      {letter}
    </div>
  );
}

function TrapCard({
  index,
  item,
  isRevealed,
  onReveal,
  prefersReducedMotion,
}: {
  index: number;
  item: DangerZoneItem;
  isRevealed: boolean;
  onReveal: () => void;
  prefersReducedMotion: boolean | null;
}) {
  const label = item.label || item.title || `Pegadinha ${index + 1}`;
  const letter = extractLetter(label);
  const trapText = item.detail || item.description || '';
  const correctText = typeof item.correct === 'string' ? item.correct.trim() : '';
  const stage = inferFunnelStage(`${label} ${trapText} ${correctText}`);
  const chips = stageChips(stage);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!isRevealed) onReveal();
    }
  };

  return (
    <motion.button
      type="button"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: prefersReducedMotion ? 0 : index * 0.06 }}
      onClick={() => !isRevealed && onReveal()}
      onKeyDown={handleKeyDown}
      aria-expanded={isRevealed}
      className={`w-full overflow-hidden rounded-[1.25rem] border text-left transition-all ${
        isRevealed
          ? 'border-emerald-300/80 bg-gradient-to-br from-white via-emerald-50/50 to-white shadow-md'
          : 'border-rose-200/80 bg-white/95 shadow-sm hover:border-rose-300'
      }`}
    >
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          {letter ? <LetterBadge letter={letter} /> : null}
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wide text-rose-700">
              {stageBadge(stage)} · pegadinha
            </p>
            <p className="mt-1 font-display text-sm font-bold text-slate-900">
              {label.replace(/^[A-E]\s*[—–-]\s*/, '')}
            </p>
            {trapText ? (
              <p className="mt-1 line-clamp-2 font-body text-sm text-slate-600">{trapText}</p>
            ) : null}
          </div>
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
              isRevealed ? 'bg-emerald-500 text-white' : 'bg-rose-100 text-rose-600'
            }`}
          >
            {isRevealed ? (
              <Check className="h-4 w-4" strokeWidth={3} />
            ) : (
              <X className="h-4 w-4" strokeWidth={3} />
            )}
          </span>
        </div>

        <ChipsRow chips={chips} revealed={isRevealed} />

        {isRevealed && correctText ? (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-3 py-2"
          >
            <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-800">
              O funil exige
            </p>
            <p className="mt-1 font-body text-sm leading-relaxed text-emerald-900">{correctText}</p>
          </motion.div>
        ) : !isRevealed ? (
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-rose-500/80">
            Toque para ver o que o funil exige →
          </span>
        ) : null}
      </div>
    </motion.button>
  );
}

function TransferTrapCard({
  index,
  item,
  onReveal,
  onQuizAnswered,
  prefersReducedMotion,
}: {
  index: number;
  item: DangerZoneItem;
  onReveal: () => void;
  onQuizAnswered: () => void;
  prefersReducedMotion: boolean | null;
}) {
  const label = item.label || item.title || 'Transferência';
  const trapText = item.detail || item.description || '';
  const correctText = typeof item.correct === 'string' ? item.correct.trim() : '';
  const quizAnswer = inferCraseQuizAnswer(correctText);
  const [quizDone, setQuizDone] = useState(false);

  if (!quizAnswer) {
    return (
      <TrapCard
        index={index}
        item={item}
        isRevealed={quizDone}
        onReveal={() => {
          setQuizDone(true);
          onReveal();
          onQuizAnswered();
        }}
        prefersReducedMotion={prefersReducedMotion}
      />
    );
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: prefersReducedMotion ? 0 : index * 0.06 }}
      className="w-full overflow-hidden rounded-[1.25rem] border border-amber-300/80 bg-gradient-to-br from-white via-amber-50/40 to-white p-4 shadow-sm"
    >
      <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-wide text-amber-800">
        {label} · aplicação
      </p>
      <TransferCraseQuiz
        promptDetail={trapText}
        expected={quizAnswer}
        revealedExplanation={quizDone ? correctText : undefined}
        onAnswered={() => {
          setQuizDone(true);
          onReveal();
          onQuizAnswered();
        }}
      />
    </motion.div>
  );
}

interface DangerZonePtCraseTrapArenaProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
  compareRevealMode?: LogicFlowRevealMode;
}

export function DangerZonePtCraseTrapArena({
  content,
  items,
  theme,
  footerRule,
  compareRevealMode = 'tap',
}: DangerZonePtCraseTrapArenaProps) {
  const prefersReducedMotion = useReducedMotion();
  const { revealItem, isItemRevealed } = useDangerZoneCompareReveal(
    items.length,
    compareRevealMode,
  );
  const { satisfy } = useReverseStudyCompletionGate();

  const allRevealed = items.every((_, index) => isItemRevealed(index));

  useEffect(() => {
    if (allRevealed) {
      satisfy('danger_zone_all_revealed');
    }
  }, [allRevealed, satisfy]);

  const reveal = useCallback(
    (index: number) => {
      revealItem(index);
    },
    [revealItem],
  );

  const handleQuizAnswered = useCallback(() => {
    satisfy('transfer_quiz');
    satisfy('transfer_revealed');
  }, [satisfy]);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-25`} />

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col gap-4">
        {content ? (
          <div className="flex items-center justify-center gap-2 rounded-full border border-amber-200/80 bg-white/85 px-4 py-2 shadow-sm">
            <Filter className="h-4 w-4 text-amber-700" aria-hidden />
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-900">
              {content}
            </p>
          </div>
        ) : null}

        <div className="flex flex-col gap-3">
          {items.map((item, index) => {
            const label = item.label || item.title || '';
            const detail = item.detail || item.description || '';
            if (isTransferDangerItem(label, detail)) {
              return (
                <TransferTrapCard
                  key={index}
                  index={index}
                  item={item}
                  onReveal={() => reveal(index)}
                  onQuizAnswered={handleQuizAnswered}
                  prefersReducedMotion={prefersReducedMotion}
                />
              );
            }
            return (
              <TrapCard
                key={index}
                index={index}
                item={item}
                isRevealed={isItemRevealed(index)}
                onReveal={() => reveal(index)}
                prefersReducedMotion={prefersReducedMotion}
              />
            );
          })}
        </div>

        {footerRule ? (
          <p
            className={`rounded-xl border border-amber-200/80 bg-white/90 px-4 py-3 text-center font-body text-sm italic leading-relaxed text-amber-900/90 shadow-sm ${theme.textSecondary}`}
          >
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}

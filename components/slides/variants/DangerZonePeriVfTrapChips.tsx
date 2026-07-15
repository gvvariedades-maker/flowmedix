'use client';

import { useCallback, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, ListChecks, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { useDangerZoneCompareReveal } from './dangerZoneReveal';
import type { DangerZoneItem } from './DangerZone';
import {
  inferPeriVfChip,
  inferPeriVfItem,
  PERI_VF_ITEMS,
  type PeriVfItem,
} from '@/lib/slides/perioperatoriaSlideUtils';

function VfChip({ verdict, revealed }: { verdict: 'V' | 'F'; revealed: boolean }) {
  const isTrue = verdict === 'V';
  return (
    <span
      className={`rounded-lg px-2.5 py-1 font-display text-xs font-black tabular-nums transition-all duration-300 ${
        revealed
          ? isTrue
            ? 'bg-emerald-500 text-white ring-2 ring-emerald-300/60'
            : 'bg-rose-500 text-white ring-2 ring-rose-300/60'
          : 'bg-slate-100 text-slate-500 ring-2 ring-slate-200/60'
      }`}
    >
      {verdict}
    </span>
  );
}

function ItemChipRail({
  trapItem,
  correctItem,
  trapVerdict,
  correctVerdict,
  revealed,
}: {
  trapItem: PeriVfItem | null;
  correctItem: PeriVfItem | null;
  trapVerdict: 'V' | 'F' | null;
  correctVerdict: 'V' | 'F' | null;
  revealed: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between gap-1 rounded-xl border border-violet-200/80 bg-violet-50/50 px-2 py-2"
      aria-hidden
    >
      {PERI_VF_ITEMS.map((item) => {
        const isTrap = trapItem === item;
        const isCorrect = correctItem === item;
        const showTrap = isTrap && !revealed;
        const showCorrect = isCorrect && revealed;

        return (
          <div
            key={item}
            className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-0.5 py-1 transition-all duration-300 ${
              showTrap
                ? 'bg-rose-200/90 ring-2 ring-rose-400/60'
                : showCorrect
                  ? 'bg-emerald-200/90 ring-2 ring-emerald-400/60'
                  : 'bg-white/60 opacity-60'
            }`}
          >
            <span
              className={`font-mono text-[10px] font-black ${
                showTrap ? 'text-rose-900' : showCorrect ? 'text-emerald-900' : 'text-slate-500'
              }`}
            >
              {item}
            </span>
            {showTrap && trapVerdict ? <VfChip verdict={trapVerdict} revealed={false} /> : null}
            {showCorrect && correctVerdict ? <VfChip verdict={correctVerdict} revealed /> : null}
          </div>
        );
      })}
    </div>
  );
}

function extractLetterFromLabel(label: string): string | null {
  const match = label.match(/^Letra\s+([A-E])\b/i);
  return match?.[1]?.toUpperCase() ?? null;
}

function LetterBadge({ letter }: { letter: string }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-violet-500 font-display text-lg font-black text-white shadow-sm">
      {letter}
    </div>
  );
}

function TrapChipCard({
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
  const letter = extractLetterFromLabel(label);
  const trapText = item.detail || item.description || '';
  const correctText = typeof item.correct === 'string' ? item.correct.trim() : '';

  const trapItem = inferPeriVfItem(label, trapText);
  const correctItem = inferPeriVfItem(label, correctText);
  const trapVerdict = inferPeriVfChip(trapText);
  const correctVerdict = inferPeriVfChip(correctText);
  const hasRail =
    (trapItem !== 'geral' && trapItem !== 'combo') || (correctItem !== 'geral' && correctItem !== 'combo');

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isRevealed) onReveal();
    }
  };

  return (
    <button
      type="button"
      onClick={() => !isRevealed && onReveal()}
      onKeyDown={handleKeyDown}
      aria-pressed={isRevealed}
      className={`w-full text-left transition-transform duration-200 ${
        !isRevealed ? 'hover:scale-[1.01]' : ''
      }`}
    >
      <div
        className={`overflow-hidden rounded-2xl border shadow-sm ${
          isRevealed
            ? 'border-emerald-200/80 border-l-[3px] border-l-emerald-400/80 bg-gradient-to-br from-white via-emerald-50/40 to-emerald-50/70'
            : 'border-rose-200/80 border-l-[3px] border-l-rose-400/80 bg-gradient-to-br from-white via-rose-50/40 to-rose-50/70'
        }`}
      >
        <div className="grid grid-rows-[auto_auto_minmax(0,1fr)_auto] gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            {letter ? (
              <LetterBadge letter={letter} />
            ) : (
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  isRevealed ? 'bg-emerald-100/90 text-emerald-700' : 'bg-rose-100/90 text-rose-700'
                }`}
              >
                {isRevealed ? (
                  <Check className="h-5 w-5" strokeWidth={3} aria-hidden />
                ) : (
                  <X className="h-5 w-5" strokeWidth={2.5} aria-hidden />
                )}
              </span>
            )}
            <span
              className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${
                isRevealed ? 'bg-emerald-100/90 text-emerald-800' : 'bg-rose-100/90 text-rose-800'
              }`}
            >
              {isRevealed ? 'V/F corrigido' : `erro #${index + 1}`}
            </span>
          </div>

          {hasRail ? (
            <ItemChipRail
              trapItem={trapItem !== 'geral' && trapItem !== 'combo' ? trapItem : null}
              correctItem={correctItem !== 'geral' && correctItem !== 'combo' ? correctItem : null}
              trapVerdict={trapVerdict}
              correctVerdict={correctVerdict}
              revealed={isRevealed}
            />
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-violet-200/70 bg-violet-50/60 px-3 py-2">
              <ListChecks className="h-4 w-4 shrink-0 text-violet-700" aria-hidden />
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-violet-800">
                julgamento V/F
              </span>
            </div>
          )}

          <div className="min-h-0">
            <p className="line-clamp-2 font-display text-sm font-extrabold uppercase tracking-wide text-slate-900">
              {label}
            </p>
            <p className="mt-1.5 line-clamp-2 font-body text-sm font-semibold leading-snug text-slate-700">
              {trapText}
            </p>
          </div>

          {isRevealed ? (
            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-t border-emerald-200/60 pt-2 font-body text-sm font-bold leading-snug text-emerald-900"
            >
              {correctText || '—'}
            </motion.p>
          ) : (
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-rose-500/80">
              Toque para revelar o julgamento correto →
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

interface DangerZonePeriVfTrapChipsProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
  compareRevealMode?: LogicFlowRevealMode;
}

export function DangerZonePeriVfTrapChips({
  content,
  items,
  theme,
  footerRule,
  compareRevealMode = 'auto',
}: DangerZonePeriVfTrapChipsProps) {
  const prefersReducedMotion = useReducedMotion();
  const { revealItem, isItemRevealed, isTapMode } = useDangerZoneCompareReveal(
    items.length,
    compareRevealMode,
  );

  const handleReveal = useCallback(
    (index: number) => {
      if (isTapMode) revealItem(index);
    },
    [isTapMode, revealItem],
  );

  if (items.length === 0) return null;

  const revealedCount = items.filter((_, i) => isItemRevealed(i)).length;
  const allRevealed = revealedCount >= items.length;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 flex flex-col">
        {content ? (
          <div className="mb-4 flex justify-center">
            <div className={`rounded-full border px-5 py-2.5 ${theme.borderColor} ${theme.iconBg}`}>
              <p
                className={`font-display text-center text-xs font-extrabold uppercase tracking-[0.12em] md:text-sm ${theme.iconText}`}
              >
                {content}
              </p>
            </div>
          </div>
        ) : null}

        <p className="mb-4 flex justify-center">
          <span
            className={`inline-flex items-center gap-2 rounded-full border bg-white/80 px-3 py-1.5 text-xs ${theme.borderColor}`}
          >
            <span className={`font-body ${theme.textSecondary}`}>Itens corrigidos:</span>
            <strong className={`font-mono text-sm font-black tabular-nums ${theme.iconText}`}>
              {revealedCount}
            </strong>
            <span className={`font-body ${theme.textSecondary}`}>/ {items.length}</span>
          </span>
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <TrapChipCard
                index={index}
                item={item}
                isRevealed={isItemRevealed(index)}
                onReveal={() => handleReveal(index)}
                prefersReducedMotion={prefersReducedMotion}
              />
            </motion.div>
          ))}
        </div>

        {footerRule ? (
          <div
            className={`mt-6 rounded-xl border px-4 py-3 md:px-5 md:py-4 ${theme.borderColor} ${theme.iconBg}`}
          >
            <p
              className={`font-body text-center text-sm font-semibold leading-relaxed md:text-base ${theme.textSecondary}`}
            >
              {footerRule}
            </p>
          </div>
        ) : null}

        {allRevealed ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl border border-violet-200/80 bg-violet-50/80 px-4 py-3 text-center"
          >
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-violet-800">
              {isTapMode
                ? 'Perioperatório dominado — julgue I · II · III antes da letra'
                : 'Revise cada afirmativa V/F antes da prova'}
            </span>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}

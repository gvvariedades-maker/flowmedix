'use client';

import { useCallback, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Hand, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { useDangerZoneCompareReveal } from './dangerZoneReveal';
import type { DangerZoneItem } from './DangerZone';
import { inferCriancaTrapCategory, type CriancaDomain } from '@/lib/slides/criancaSlideUtils';

interface CriancaTrapArenaProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
  compareRevealMode?: LogicFlowRevealMode;
  domain: CriancaDomain;
}

function extractLetterFromLabel(label: string): string | null {
  const match = label.match(/^Letra\s+([A-E])\b/i);
  return match?.[1]?.toUpperCase() ?? null;
}

function TrapCard({
  index,
  item,
  isRevealed,
  onReveal,
  prefersReducedMotion,
  domain,
}: {
  index: number;
  item: DangerZoneItem;
  isRevealed: boolean;
  onReveal: () => void;
  prefersReducedMotion: boolean | null;
  domain: CriancaDomain;
}) {
  const label = item.label || item.title || `Pegadinha ${index + 1}`;
  const letter = extractLetterFromLabel(label);
  const trapText = item.detail || item.description || '';
  const correctText = typeof item.correct === 'string' ? item.correct.trim() : '';
  const { trap, correct } = inferCriancaTrapCategory(label, trapText, correctText, domain);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onReveal();
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
      className={`group relative w-full overflow-hidden rounded-2xl border text-left shadow-md transition-all duration-300 ${
        isRevealed
          ? 'border-emerald-300/80 bg-gradient-to-br from-emerald-50 via-white to-cyan-50'
          : 'border-rose-200/80 bg-gradient-to-br from-rose-50 via-white to-orange-50/80 hover:shadow-lg'
      }`}
    >
      <div className="grid min-h-[140px] grid-rows-[auto_1fr_auto] gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {letter ? (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-cyan-500 font-display text-sm font-black text-white">
                {letter}
              </div>
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                <X className="h-5 w-5" />
              </span>
            )}
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-600">
              {isRevealed ? 'Revelado' : `Armadilha ${index + 1}`}
            </span>
          </div>
          <span
            className={`rounded-full px-2 py-0.5 font-mono text-[8px] font-black uppercase ${
              isRevealed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}
          >
            {isRevealed ? trap : 'Toque'}
          </span>
        </div>

        <div className="space-y-2">
          {!isRevealed ? (
            <>
              <p className="font-display text-xs font-bold uppercase text-rose-900">{label}</p>
              <p className="font-body text-sm leading-relaxed text-slate-600">{trapText}</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-1 font-mono text-[9px] font-bold uppercase text-rose-800">
                <Hand className="h-3 w-3" aria-hidden />
                Toque para revelar
              </span>
            </>
          ) : (
            <>
              <div className="flex items-start gap-2 rounded-xl border border-rose-200/60 bg-rose-50/80 p-2">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                <p className="font-body text-sm text-rose-900">{trapText || trap}</p>
              </div>
              <div className="flex items-start gap-2 rounded-xl border border-emerald-200/60 bg-emerald-50/80 p-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <p className="font-body text-sm font-semibold text-emerald-900">{correctText || correct}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.button>
  );
}

export function CriancaTrapArena({ content, items, theme, footerRule, compareRevealMode, domain }: CriancaTrapArenaProps) {
  const reduceMotion = useReducedMotion();
  const { revealItem, isItemRevealed, isTapMode } = useDangerZoneCompareReveal(items.length, compareRevealMode);
  const allRevealed = items.every((_, index) => isItemRevealed(index));

  if (!items || items.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-25`} />
      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-3">
        {content ? (
          <h3 className={`text-center font-display text-sm font-black uppercase tracking-wide ${theme.textPrimary}`}>
            {content}
          </h3>
        ) : null}

        <div className="flex flex-col gap-3">
          {items.map((item, index) => (
            <TrapCard
              key={index}
              index={index}
              item={item}
              isRevealed={isItemRevealed(index)}
              onReveal={() => {
                if (isTapMode) revealItem(index);
              }}
              prefersReducedMotion={reduceMotion}
              domain={domain}
            />
          ))}
        </div>

        {!allRevealed ? (
          <p className="text-center font-mono text-[9px] font-bold uppercase tracking-widest text-cyan-700/80">
            Arena pediátrica — revele cada pegadinha
          </p>
        ) : null}

        {footerRule ? (
          <p className={`rounded-xl border px-4 py-3 text-center font-body text-sm italic ${theme.borderColor} ${theme.iconBg} ${theme.textSecondary}`}>
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}

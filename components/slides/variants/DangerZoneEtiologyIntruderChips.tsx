'use client';

import { useCallback, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { useDangerZoneCompareReveal } from './dangerZoneReveal';
import type { DangerZoneItem } from './DangerZone';
import {
  ETIOLOGY_KINGDOM_SLOTS,
  etiologyKingdomLabel,
  inferEtiologyIntruderKingdoms,
  type EtiologyKingdom,
} from '@/lib/slides/etiologySlideUtils';

const KINGDOM_DOT: Record<EtiologyKingdom, string> = {
  bacteria: 'bg-emerald-500',
  virus: 'bg-rose-500',
  protozoan: 'bg-amber-500',
  fungus: 'bg-violet-500',
  command: 'bg-orange-400',
  pattern: 'bg-sky-400',
  general: 'bg-slate-400',
};

function KingdomIntruderRail({
  intruders,
  revealed,
}: {
  intruders: EtiologyKingdom[];
  revealed: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between gap-1 rounded-xl border border-orange-200/70 bg-orange-50/40 px-2 py-2"
      aria-hidden
    >
      {ETIOLOGY_KINGDOM_SLOTS.map((slot) => {
        const isIntruder = intruders.includes(slot);
        const show = isIntruder && !revealed;
        const dim = !isIntruder || revealed;
        return (
          <div
            key={slot}
            className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-0.5 py-1 transition-all ${
              show ? 'bg-rose-200/90 ring-2 ring-rose-400/60' : dim ? 'opacity-45' : ''
            }`}
          >
            <div className={`h-2 w-2 rounded-full ${KINGDOM_DOT[slot]}`} />
            <span className="font-mono text-[7px] font-bold uppercase text-slate-600 md:text-[8px]">
              {etiologyKingdomLabel(slot).slice(0, 5)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function IntruderChipCard({
  index,
  item,
  isRevealed,
  onReveal,
}: {
  index: number;
  item: DangerZoneItem;
  isRevealed: boolean;
  onReveal: () => void;
}) {
  const label = item.label || item.title || `Pegadinha ${index + 1}`;
  const trapText = item.detail || item.description || '';
  const correctText = typeof item.correct === 'string' ? item.correct.trim() : '';
  const { intruder } = inferEtiologyIntruderKingdoms(label, trapText, correctText);

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
      className={`w-full text-left transition-transform ${!isRevealed ? 'hover:scale-[1.01]' : ''}`}
    >
      <div
        className={`overflow-hidden rounded-2xl border shadow-sm ${
          isRevealed
            ? 'border-emerald-200/80 border-l-[3px] border-l-emerald-400 bg-gradient-to-br from-white via-emerald-50/40 to-emerald-50/70'
            : 'border-rose-200/80 border-l-[3px] border-l-rose-400 bg-gradient-to-br from-white via-rose-50/40 to-rose-50/70'
        }`}
      >
        <div className="grid gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                isRevealed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}
            >
              {isRevealed ? (
                <Check className="h-5 w-5" strokeWidth={3} aria-hidden />
              ) : (
                <X className="h-5 w-5" strokeWidth={2.5} aria-hidden />
              )}
            </span>
            <span className="font-display text-xs font-bold uppercase tracking-wide text-slate-800 md:text-sm">
              {label}
            </span>
          </div>

          {intruder.length > 0 && (
            <KingdomIntruderRail intruders={intruder} revealed={isRevealed} />
          )}

          <p className="font-body text-sm text-slate-700">{trapText}</p>

          {isRevealed && correctText && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-3 py-2 font-body text-sm font-medium text-emerald-900"
            >
              {correctText}
            </motion.p>
          )}

          {!isRevealed && (
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-rose-600">
              Toque para revelar o intruso
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

interface DangerZoneEtiologyIntruderChipsProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
  compareRevealMode?: LogicFlowRevealMode;
}

export function DangerZoneEtiologyIntruderChips({
  content,
  items,
  theme,
  footerRule,
  compareRevealMode = 'tap',
}: DangerZoneEtiologyIntruderChipsProps) {
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

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-25`} />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-3">
        {content && (
          <div className="rounded-xl border border-rose-200/70 bg-white/90 px-4 py-3 text-center shadow-sm">
            <p className="font-display text-sm font-black uppercase tracking-wide text-rose-900 md:text-base">
              {content}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {items.map((item, index) => (
            <IntruderChipCard
              key={`${item.label}-${index}`}
              index={index}
              item={item}
              isRevealed={isItemRevealed(index)}
              onReveal={() => handleReveal(index)}
            />
          ))}
        </div>

        {footerRule && (
          <p className="text-center font-body text-xs font-medium text-rose-900/70">{footerRule}</p>
        )}
      </div>
    </div>
  );
}

'use client';

import { useCallback, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Hand } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { useDangerZoneCompareReveal } from './dangerZoneReveal';
import type { DangerZoneItem } from './DangerZone';
import {
  ITU_BUNDLE_RAIL_SLOTS,
  inferItuBundleViolation,
  ituBundleSlotLabel,
  type ItuBundleSlot,
} from '@/lib/slides/ituCateterSlideUtils';

function BundleViolationRail({
  violated,
  restored,
  revealed,
}: {
  violated: ItuBundleSlot[];
  restored: ItuBundleSlot[];
  revealed: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between gap-1 rounded-xl border border-lime-200/70 bg-lime-50/40 px-2 py-2"
      aria-hidden
    >
      {ITU_BUNDLE_RAIL_SLOTS.map((slot) => {
        const isViolated = violated.includes(slot);
        const isRestored = restored.includes(slot);
        const showTrap = isViolated && !revealed;
        const showOk = isRestored && revealed;
        return (
          <div
            key={slot}
            className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-0.5 py-1 transition-all ${
              showTrap
                ? 'bg-rose-200/90 ring-2 ring-rose-400/60'
                : showOk
                  ? 'bg-emerald-200/90 ring-2 ring-emerald-400/50'
                  : 'opacity-45'
            }`}
          >
            <div
              className={`h-2 w-2 rounded-full ${
                showTrap ? 'bg-rose-500' : showOk ? 'bg-emerald-500' : 'bg-lime-400'
              }`}
            />
            <span className="font-mono text-[7px] font-bold uppercase text-slate-600 md:text-[8px]">
              {ituBundleSlotLabel(slot).slice(0, 6)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function TrapCard({
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
  const { violated, restored } = inferItuBundleViolation(label, trapText, correctText);

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
      className={`w-full text-left transition-transform ${!isRevealed ? 'cursor-pointer hover:scale-[1.01]' : ''}`}
    >
      <div
        className={`overflow-hidden rounded-2xl border shadow-sm ${
          isRevealed
            ? 'border-emerald-200/80 border-l-[3px] border-l-emerald-400 bg-gradient-to-br from-white via-emerald-50/40 to-emerald-50/70'
            : 'border-rose-200/80 border-l-[3px] border-l-rose-400 bg-gradient-to-br from-white via-rose-50/40 to-rose-50/70 ring-2 ring-rose-200/60 animate-pulse'
        }`}
      >
        <div className="grid gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <span className="font-display text-sm font-black text-slate-900">{label}</span>
            {!isRevealed ? (
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-rose-100 px-2 py-1 font-mono text-[9px] font-bold uppercase text-rose-700">
                <Hand className="h-3 w-3 animate-pulse" aria-hidden />
                Toque aqui
              </span>
            ) : (
              <Check className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
            )}
          </div>

          <BundleViolationRail violated={violated} restored={restored} revealed={isRevealed} />

          <div className="grid gap-2 md:grid-cols-2">
            <div className="rounded-xl border border-rose-200/60 bg-rose-50/50 p-3">
              <div className="mb-1 flex items-center gap-1">
                <X className="h-3.5 w-3.5 text-rose-600" aria-hidden />
                <span className="font-mono text-[9px] font-bold uppercase text-rose-700">Pegadinha</span>
              </div>
              <p className="font-body text-xs leading-relaxed text-slate-700 md:text-sm">{trapText}</p>
            </div>
            {isRevealed && correctText && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-xl border border-emerald-200/60 bg-emerald-50/50 p-3"
              >
                <div className="mb-1 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                  <span className="font-mono text-[9px] font-bold uppercase text-emerald-700">Correto</span>
                </div>
                <p className="font-body text-xs leading-relaxed text-slate-700 md:text-sm">{correctText}</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

interface DangerZoneItuCatheterTrapProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
  revealMode?: LogicFlowRevealMode;
}

export function DangerZoneItuCatheterTrap({
  content,
  items,
  theme,
  footerRule,
  revealMode = 'tap',
}: DangerZoneItuCatheterTrapProps) {
  const { revealItem, isItemRevealed } = useDangerZoneCompareReveal(items.length, revealMode);

  const handleReveal = useCallback(
    (index: number) => {
      revealItem(index);
    },
    [revealItem],
  );

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-3">
        {content && (
          <h3 className="text-center font-display text-sm font-black uppercase tracking-wide text-rose-900 md:text-base">
            {content}
          </h3>
        )}

        <div className="flex items-center justify-center gap-2 rounded-xl border border-rose-200/80 bg-rose-50/80 px-3 py-2">
          <Hand className="h-4 w-4 shrink-0 text-rose-600 animate-pulse" aria-hidden />
          <p className="font-mono text-[10px] font-bold uppercase tracking-wide text-rose-900 md:text-[11px]">
            Toque em cada card pulsante para revelar a correção
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {items.map((item, index) => (
            <TrapCard
              key={`${item.label ?? index}-${index}`}
              index={index}
              item={item}
              isRevealed={isItemRevealed(index)}
              onReveal={() => handleReveal(index)}
            />
          ))}
        </div>

        {footerRule && (
          <p className="mt-auto text-center font-mono text-[10px] font-bold uppercase tracking-widest text-lime-800/70">
            {footerRule}
          </p>
        )}
      </div>
    </div>
  );
}

'use client';

import { useCallback, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, HeartPulse, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { useDangerZoneCompareReveal } from './dangerZoneReveal';
import type { DangerZoneItem } from './DangerZone';
import {
  IST_ROUTE_SLOTS,
  inferIstTrapRoutes,
  istRouteLabel,
  type IstRoute,
} from '@/lib/slides/istSlideUtils';

function RouteRail({
  trapRoutes,
  correctRoutes,
  revealed,
}: {
  trapRoutes: IstRoute[];
  correctRoutes: IstRoute[];
  revealed: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between gap-1 rounded-xl border border-purple-200/80 bg-purple-50/50 px-2 py-2"
      aria-hidden
    >
      {IST_ROUTE_SLOTS.map((route) => {
        const isTrap = trapRoutes.includes(route);
        const isCorrect = correctRoutes.includes(route);
        const showTrap = isTrap && !revealed;
        const showCorrect = isCorrect && revealed;

        return (
          <div
            key={route}
            className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-0.5 py-1 transition-all duration-300 ${
              showTrap
                ? 'bg-rose-200/90 ring-2 ring-rose-400/60'
                : showCorrect
                  ? 'bg-emerald-200/90 ring-2 ring-emerald-400/60'
                  : 'bg-white/60 opacity-60'
            }`}
          >
            <span
              className={`font-mono text-[8px] font-black uppercase tracking-wide ${
                showTrap ? 'text-rose-900' : showCorrect ? 'text-emerald-900' : 'text-slate-500'
              }`}
            >
              {istRouteLabel(route)}
            </span>
          </div>
        );
      })}
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
  const trapText = item.detail || item.description || '';
  const correctText = typeof item.correct === 'string' ? item.correct.trim() : '';
  const { trapRoutes, correctRoutes, hasRail } = inferIstTrapRoutes(label, trapText, correctText);

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
            <span
              className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${
                isRevealed ? 'bg-emerald-100/90 text-emerald-800' : 'bg-rose-100/90 text-rose-800'
              }`}
            >
              {isRevealed ? 'rota correta' : `erro #${index + 1}`}
            </span>
          </div>

          {hasRail ? (
            <RouteRail trapRoutes={trapRoutes} correctRoutes={correctRoutes} revealed={isRevealed} />
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-purple-200/70 bg-purple-50/60 px-3 py-2">
              <HeartPulse className="h-4 w-4 shrink-0 text-purple-700" aria-hidden />
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-purple-800">
                risco IST
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
              Toque para revelar a rota correta →
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

interface DangerZoneIstTrapChipsProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
  compareRevealMode?: LogicFlowRevealMode;
}

export function DangerZoneIstTrapChips({
  content,
  items,
  theme,
  footerRule,
  compareRevealMode = 'auto',
}: DangerZoneIstTrapChipsProps) {
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

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 flex flex-col">
        {content ? (
          <div className="mb-4 flex justify-center">
            <div className={`rounded-full border px-5 py-2.5 ${theme.borderColor} ${theme.iconBg}`}>
              <p className={`font-display text-center text-sm font-extrabold uppercase tracking-wide ${theme.textPrimary}`}>
                {content}
              </p>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {items.map((item, index) => (
            <TrapChipCard
              key={index}
              index={index}
              item={item}
              isRevealed={isItemRevealed(index)}
              onReveal={() => handleReveal(index)}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>

        {footerRule ? (
          <p
            className={`mt-4 rounded-xl border px-4 py-3 text-center font-body text-sm font-medium italic leading-relaxed ${theme.borderColor} bg-white/80 ${theme.textSecondary}`}
          >
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}

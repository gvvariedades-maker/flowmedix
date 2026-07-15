'use client';

import { useCallback, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Wind, Hand, Check, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { useDangerZoneCompareReveal } from './dangerZoneReveal';
import type { DangerZoneItem } from './DangerZone';
import { inferTbTransmissionTrap, type TbTransmissionMode } from '@/lib/slides/tuberculoseSlideUtils';

function TransmissionRail({ mode, revealed }: { mode: TbTransmissionMode; revealed: boolean }) {
  const aerossolActive = mode === 'aerossol' || (mode === 'falso' && !revealed);
  const contatoActive = mode === 'contato' || (mode === 'falso' && revealed);

  return (
    <div className="flex items-center justify-center gap-3 rounded-xl border border-orange-200/70 bg-orange-50/40 px-3 py-2">
      <div
        className={`flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-all ${
          aerossolActive && !revealed ? 'bg-sky-200/90 ring-2 ring-sky-400/60' : revealed && mode !== 'falso' ? 'bg-sky-100/80' : 'opacity-50'
        }`}
      >
        <Wind className="h-5 w-5 text-sky-700" aria-hidden />
        <span className="font-mono text-[8px] font-bold uppercase text-sky-900">Aerossóis</span>
      </div>
      <span className="font-bold text-slate-400">vs</span>
      <div
        className={`flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-all ${
          mode === 'falso' && !revealed
            ? 'bg-rose-200/90 ring-2 ring-rose-400/60'
            : contatoActive && revealed
              ? 'line-through opacity-60'
              : 'opacity-50'
        }`}
      >
        <Hand className="h-5 w-5 text-rose-500" aria-hidden />
        <span className="font-mono text-[8px] font-bold uppercase text-rose-700">Contato pele</span>
      </div>
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
  const mode = inferTbTransmissionTrap(label, trapText, correctText);

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

          <TransmissionRail mode={mode} revealed={isRevealed} />

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
              Toque para revelar a via correta
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

interface DangerZoneTbTransmissionTrapProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
  compareRevealMode?: LogicFlowRevealMode;
}

export function DangerZoneTbTransmissionTrap({
  content,
  items,
  theme,
  footerRule,
  compareRevealMode = 'tap',
}: DangerZoneTbTransmissionTrapProps) {
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
            <TrapCard
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

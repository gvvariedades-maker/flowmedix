'use client';

import { useCallback, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { DoorClosed, DoorOpen, Footprints, Hand } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { useDangerZoneCompareReveal } from './dangerZoneReveal';
import type { DangerZoneItem } from './DangerZone';
import {
  consentGatePathLabel,
  inferConsentGatePath,
  type ConsentGatePath,
} from '@/lib/slides/adolescentSlideUtils';

const PATH_COLORS: Record<
  ConsentGatePath,
  { closed: string; open: string; corridor: string; text: string }
> = {
  acolher: {
    closed: 'from-rose-100 to-rose-50 border-rose-300/80',
    open: 'from-emerald-50 to-sky-50 border-emerald-300/80',
    corridor: 'bg-gradient-to-r from-emerald-400/20 via-sky-300/30 to-cyan-300/20',
    text: 'text-sky-900',
  },
  proteger: {
    closed: 'from-rose-100 to-orange-50 border-rose-300/80',
    open: 'from-indigo-50 to-sky-50 border-indigo-300/80',
    corridor: 'bg-gradient-to-r from-indigo-400/20 via-sky-300/30 to-indigo-200/20',
    text: 'text-indigo-900',
  },
  vincular: {
    closed: 'from-rose-100 to-pink-50 border-rose-300/80',
    open: 'from-blue-50 to-cyan-50 border-blue-300/80',
    corridor: 'bg-gradient-to-r from-blue-400/20 via-cyan-300/30 to-teal-300/20',
    text: 'text-blue-900',
  },
  orientar: {
    closed: 'from-rose-100 to-amber-50 border-rose-300/80',
    open: 'from-teal-50 to-lime-50 border-teal-300/80',
    corridor: 'bg-gradient-to-r from-teal-400/20 via-lime-300/30 to-emerald-300/20',
    text: 'text-teal-900',
  },
};

function ConsentGateCard({
  index,
  item,
  isOpen,
  onOpen,
  prefersReducedMotion,
}: {
  index: number;
  item: DangerZoneItem;
  isOpen: boolean;
  onOpen: () => void;
  prefersReducedMotion: boolean | null;
}) {
  const label = item.label || item.title || `Porta ${index + 1}`;
  const trapText = item.detail || item.description || '';
  const correctText = typeof item.correct === 'string' ? item.correct.trim() : '';
  const { trapPath, correctPath } = inferConsentGatePath(label, trapText, correctText);
  const closedPalette = PATH_COLORS[trapPath];
  const openPalette = PATH_COLORS[correctPath];

  return (
    <button
      type="button"
      onClick={() => !isOpen && onOpen()}
      aria-expanded={isOpen}
      className={`group relative w-full overflow-hidden rounded-2xl border text-left shadow-md transition-all duration-500 ${
        isOpen
          ? `bg-gradient-to-br ${openPalette.open}`
          : `bg-gradient-to-br ${closedPalette.closed} hover:shadow-lg`
      }`}
    >
      <div className="grid min-h-[168px] grid-rows-[auto_1fr_auto] gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {isOpen ? (
              <DoorOpen className="h-6 w-6 text-emerald-600" aria-hidden />
            ) : (
              <DoorClosed className="h-6 w-6 text-rose-600" aria-hidden />
            )}
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-600">
              {isOpen ? 'Porta aberta' : `Porta ${index + 1} — fechada`}
            </span>
          </div>
          <span
            className={`rounded-full px-2 py-0.5 font-mono text-[8px] font-black uppercase tracking-wide ${
              isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}
          >
            {isOpen ? consentGatePathLabel(correctPath) : consentGatePathLabel(trapPath)}
          </span>
        </div>

        <div className={`relative overflow-hidden rounded-xl ${isOpen ? openPalette.corridor : 'bg-rose-50/50'} p-3`}>
          {!isOpen ? (
            <>
              <p className="font-display text-sm font-extrabold uppercase tracking-wide text-rose-900 line-clamp-2">
                {label}
              </p>
              <p className="mt-1.5 font-body text-sm font-medium leading-snug text-rose-800/90 line-clamp-2">
                {trapText}
              </p>
            </>
          ) : (
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-2"
            >
              <Footprints className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
              <div>
                <p className={`font-body text-sm font-bold leading-snug ${openPalette.text}`}>{correctText}</p>
                <p className="mt-1 font-mono text-[8px] font-bold uppercase tracking-widest text-emerald-700/80">
                  Caminho ético — {consentGatePathLabel(correctPath)}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        <span className="flex min-h-[40px] items-center justify-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-sky-700">
          {!isOpen ? (
            <>
              <Hand className="h-3.5 w-3.5 shrink-0 text-rose-500" aria-hidden />
              Toque na porta para abrir
            </>
          ) : (
            'Conduta revelada'
          )}
        </span>
      </div>
    </button>
  );
}

interface DangerZoneAdolescentConsentGateProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
  compareRevealMode?: LogicFlowRevealMode;
}

export function DangerZoneAdolescentConsentGate({
  content,
  items,
  theme,
  footerRule,
  compareRevealMode = 'auto',
}: DangerZoneAdolescentConsentGateProps) {
  const prefersReducedMotion = useReducedMotion();
  const { revealItem, isItemRevealed, isTapMode } = useDangerZoneCompareReveal(
    items.length,
    compareRevealMode,
  );

  const handleOpen = useCallback(
    (index: number) => {
      if (isTapMode) revealItem(index);
    },
    [isTapMode, revealItem],
  );

  const openedCount = items.filter((_, i) => isItemRevealed(i)).length;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 flex flex-col">
        {content ? (
          <div className="mb-4 flex flex-col items-center gap-2">
            <div className={`rounded-full border px-5 py-2.5 ${theme.borderColor} ${theme.iconBg}`}>
              <p className={`font-display text-center text-sm font-extrabold uppercase tracking-wide ${theme.textPrimary}`}>
                {content}
              </p>
            </div>
            <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-sky-700/80">
              {openedCount}/{items.length} portas abertas
            </p>
            <p className="flex items-center justify-center gap-1.5 font-body text-xs text-sky-800/90">
              <Hand className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Toque em cada porta fechada para ver a conduta correta
            </p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {items.map((item, index) => (
            <ConsentGateCard
              key={index}
              index={index}
              item={item}
              isOpen={isItemRevealed(index)}
              onOpen={() => handleOpen(index)}
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

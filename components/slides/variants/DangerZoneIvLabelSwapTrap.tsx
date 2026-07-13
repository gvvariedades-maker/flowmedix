'use client';

import { useCallback, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Droplets, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { useDangerZoneCompareReveal } from './dangerZoneReveal';
import type { DangerZoneItem } from './DangerZone';
import {
  extractIvComplicationSlots,
  inferIvLabelSwapSlot,
  ivLabelSwapSlotLabel,
  type IvLabelSwapSlot,
} from '@/lib/slides/puncaoFlebiteSlideUtils';

const COMPLICATIONS: { id: IvLabelSwapSlot; short: string }[] = [
  { id: 'infiltracao', short: 'INF' },
  { id: 'flebite', short: 'FLE' },
  { id: 'hematoma', short: 'HEM' },
  { id: 'extravasamento', short: 'EXT' },
  { id: 'esclerose', short: 'ESC' },
];

function inferSwapSlots(
  label: string,
  detail: string,
  correct: string,
): { trapSlots: IvLabelSwapSlot[]; correctSlots: IvLabelSwapSlot[]; hasRail: boolean } {
  const trapText = `${label} ${detail}`.toLowerCase();
  const correctText = correct.toLowerCase();
  const slot = inferIvLabelSwapSlot(label, detail, correct);

  if (slot === 'transferencia') {
    return { trapSlots: [], correctSlots: [], hasRail: false };
  }

  let trapSlots = extractIvComplicationSlots(trapText);
  let correctSlots = extractIvComplicationSlots(correctText);

  if (trapSlots.length === 0 && /letra|alternativa/.test(trapText)) {
    trapSlots = [slot];
  }
  if (correctSlots.length === 0 && correctText.length > 0) {
    correctSlots = extractIvComplicationSlots(correctText);
    if (correctSlots.length === 0) correctSlots = [slot];
  }

  return {
    trapSlots,
    correctSlots,
    hasRail: trapSlots.length > 0 || correctSlots.length > 0,
  };
}

function ComplicationRail({
  trapSlots,
  correctSlots,
  revealed,
}: {
  trapSlots: IvLabelSwapSlot[];
  correctSlots: IvLabelSwapSlot[];
  revealed: boolean;
}) {
  return (
    <div className="flex items-stretch justify-between gap-1 rounded-xl border border-indigo-200/80 bg-indigo-50/50 p-1.5">
      {COMPLICATIONS.map((c) => {
        const isTrap = trapSlots.includes(c.id);
        const isCorrect = correctSlots.includes(c.id);
        const showTrap = isTrap && !revealed;
        const showCorrect = isCorrect && revealed;

        return (
          <div
            key={c.id}
            className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 transition-all duration-300 ${
              showTrap
                ? 'bg-rose-200/90 ring-2 ring-rose-400/50'
                : showCorrect
                  ? 'bg-emerald-200/90 ring-2 ring-emerald-400/50'
                  : 'bg-white/70 opacity-55'
            }`}
          >
            <span
              className={`font-mono text-[9px] font-black ${
                showTrap ? 'text-rose-900' : showCorrect ? 'text-emerald-900' : 'text-slate-500'
              }`}
            >
              {c.short}
            </span>
            <span className="hidden font-mono text-[6px] uppercase text-slate-500 sm:inline">
              {ivLabelSwapSlotLabel(c.id).slice(0, 4)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function parseTrapLabel(label: string): { letter?: string; title: string } {
  const match = label.match(/^Letra\s+([A-E])\s*[—–-]\s*(.+)$/i);
  if (match) return { letter: match[1].toUpperCase(), title: match[2].trim() };
  return { title: label };
}

function TrapTitle({ label }: { label: string }) {
  const { letter, title } = parseTrapLabel(label);
  return (
    <div className="flex items-start gap-2.5">
      {letter ? (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900/90 font-mono text-xs font-black text-white">
          {letter}
        </span>
      ) : null}
      <p className="min-w-0 flex-1 font-body text-sm font-bold leading-snug text-slate-900">{title}</p>
    </div>
  );
}

function LabelSwapCard({
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
  const { trapSlots, correctSlots, hasRail } = inferSwapSlots(label, trapText, correctText);
  const isTransfer = inferIvLabelSwapSlot(label, trapText, correctText) === 'transferencia';

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
      className={`w-full min-h-[44px] text-left transition-transform duration-200 ${!isRevealed ? 'hover:scale-[1.01]' : ''}`}
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
                <X className="h-5 w-5" strokeWidth={3} aria-hidden />
              )}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${
                isRevealed ? 'bg-emerald-100/90 text-emerald-800' : 'bg-rose-100/90 text-rose-800'
              }`}
            >
              {isRevealed ? 'rótulo certo' : isTransfer ? 'transferência' : `troca #${index + 1}`}
            </span>
          </div>

          {hasRail && !isTransfer ? (
            <ComplicationRail trapSlots={trapSlots} correctSlots={correctSlots} revealed={isRevealed} />
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2">
              <Droplets className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden />
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-700">
                {isTransfer ? 'padrão de banca' : 'mecanismo × rótulo'}
              </span>
            </div>
          )}

          <div className="min-h-0">
            <TrapTitle label={label} />
            <p className="mt-2 line-clamp-3 font-body text-sm font-medium leading-relaxed text-slate-600">
              {trapText}
            </p>
          </div>

          {isRevealed ? (
            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-t border-emerald-200/60 pt-2 font-body text-sm font-semibold leading-relaxed text-emerald-900"
            >
              {correctText || '—'}
            </motion.p>
          ) : (
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-rose-500/80">
              Toque para ver o rótulo correto →
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

interface DangerZoneIvLabelSwapTrapProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
  compareRevealMode?: LogicFlowRevealMode;
}

export function DangerZoneIvLabelSwapTrap({
  content,
  items,
  theme,
  footerRule,
  compareRevealMode = 'tap',
}: DangerZoneIvLabelSwapTrapProps) {
  const reduceMotion = useReducedMotion();
  const { revealItem: reveal, isItemRevealed: isRevealed } = useDangerZoneCompareReveal(
    items.length,
    compareRevealMode,
  );

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-3.5">
        <div className="flex flex-col gap-1.5">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-indigo-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-indigo-900 shadow-sm">
            <Droplets className="h-3 w-3" aria-hidden />
            IV Label Swap
          </span>
          {content ? (
            <p className="font-body text-sm font-semibold leading-snug text-slate-800">{content}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          {items.map((item, index) => (
            <LabelSwapCard
              key={index}
              index={index}
              item={item}
              isRevealed={isRevealed(index)}
              onReveal={() => reveal(index)}
              prefersReducedMotion={reduceMotion}
            />
          ))}
        </div>

        {footerRule ? (
          <p
            className={`rounded-xl border px-4 py-3 text-center font-body text-sm font-medium italic leading-relaxed ${theme.borderColor} bg-white/80 ${theme.textSecondary}`}
          >
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}

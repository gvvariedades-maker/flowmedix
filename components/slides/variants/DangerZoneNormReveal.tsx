'use client';

import { useCallback, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Scale, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { useDangerZoneCompareReveal } from './dangerZoneReveal';
import type { DangerZoneItem } from './DangerZone';

type NormCategory = 'identificacao' | 'integridade' | 'acesso' | 'veracidade' | 'privativa' | 'transferencia';

const NORM_LABEL: Record<NormCategory, string> = {
  identificacao: 'identificação',
  integridade: 'integridade',
  acesso: 'acesso ao prontuário',
  veracidade: 'veracidade',
  privativa: 'privativa SAE',
  transferencia: 'transferência',
};

const NORM_STYLES: Record<NormCategory, { trap: string; reveal: string; chip: string }> = {
  identificacao: {
    trap: 'bg-fuchsia-100/90 text-fuchsia-900',
    reveal: 'bg-fuchsia-50 text-fuchsia-950',
    chip: 'border-fuchsia-200/80 bg-fuchsia-50/80',
  },
  integridade: {
    trap: 'bg-amber-100/90 text-amber-900',
    reveal: 'bg-amber-50 text-amber-950',
    chip: 'border-amber-200/80 bg-amber-50/80',
  },
  acesso: {
    trap: 'bg-indigo-100/90 text-indigo-900',
    reveal: 'bg-indigo-50 text-indigo-950',
    chip: 'border-indigo-200/80 bg-indigo-50/80',
  },
  veracidade: {
    trap: 'bg-rose-100/90 text-rose-900',
    reveal: 'bg-rose-50 text-rose-950',
    chip: 'border-rose-200/80 bg-rose-50/80',
  },
  privativa: {
    trap: 'bg-violet-100/90 text-violet-900',
    reveal: 'bg-violet-50 text-violet-950',
    chip: 'border-violet-200/80 bg-violet-50/80',
  },
  transferencia: {
    trap: 'bg-slate-200/90 text-slate-800',
    reveal: 'bg-slate-50 text-slate-900',
    chip: 'border-slate-200/80 bg-slate-50/80',
  },
};

function inferNormCategory(label: string, detail: string): NormCategory {
  const text = `${label} ${detail}`.toLowerCase();
  if (/carimbo|nome legível|identific|código de ética citado/.test(text)) return 'identificacao';
  if (/lápis|rasura|integridade/.test(text)) return 'integridade';
  if (/prontuário|médico e enfermeiro|técnico.*nunca|acesso/.test(text)) return 'acesso';
  if (/não executado|fictício|terceirizado|intercorrência/.test(text)) return 'veracidade';
  if (/diagnóstico|anotação com|privativo|generalizar/.test(text)) return 'privativa';
  return 'transferencia';
}

function parseTrapLabel(label: string): { letter?: string; title: string } {
  const match = label.match(/^Letra\s+([A-E])\s*[—–-]\s*(.+)$/i);
  if (match) {
    return { letter: match[1].toUpperCase(), title: match[2].trim() };
  }
  return { title: label };
}

function TrapTitle({ label }: { label: string }) {
  const { letter, title } = parseTrapLabel(label);
  return (
    <div className="flex items-start gap-2.5">
      {letter ? (
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900/90 font-mono text-xs font-black text-white"
          aria-hidden
        >
          {letter}
        </span>
      ) : null}
      <p className="min-w-0 flex-1 font-body text-sm font-bold leading-snug tracking-normal text-slate-900">
        {title}
      </p>
    </div>
  );
}

function NormChip({ category, revealed }: { category: NormCategory; revealed: boolean }) {
  const styles = NORM_STYLES[category];
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${styles.chip}`}
      aria-hidden
    >
      <Scale className="h-4 w-4 shrink-0 text-violet-700" />
      <span
        className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${
          revealed ? 'bg-emerald-100/90 text-emerald-800' : styles.trap
        }`}
      >
        {revealed ? `cofen · ${NORM_LABEL[category]}` : `viola ${NORM_LABEL[category]}`}
      </span>
    </div>
  );
}

function NormRevealCard({
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
  const category = inferNormCategory(label, trapText);

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
                <X className="h-5 w-5" strokeWidth={3} aria-hidden />
              )}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${
                isRevealed ? 'bg-emerald-100/90 text-emerald-800' : 'bg-rose-100/90 text-rose-800'
              }`}
            >
              {isRevealed ? 'norma corrigida' : `pegadinha #${index + 1}`}
            </span>
          </div>

          <NormChip category={category} revealed={isRevealed} />

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
              Toque para ver a norma →
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

interface DangerZoneNormRevealProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
  compareRevealMode?: LogicFlowRevealMode;
}

export function DangerZoneNormReveal({
  content,
  items,
  theme,
  footerRule,
  compareRevealMode = 'auto',
}: DangerZoneNormRevealProps) {
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
                className={`font-body text-center text-xs font-semibold leading-snug md:text-sm ${theme.iconText}`}
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
            <span className={`font-body ${theme.textSecondary}`}>Normas revisadas:</span>
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
              <NormRevealCard
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
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-violet-900">
              {isTapMode
                ? 'Registro dominado — diagnóstico + evolução = enfermeiro'
                : 'Revise COFEN 358 antes da prova'}
            </span>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};

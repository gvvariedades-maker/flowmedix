'use client';

import { useCallback, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Pill, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { useDangerZoneCompareReveal } from './dangerZoneReveal';
import type { DangerZoneItem } from './DangerZone';

type FarmacoSlot = 'cinetica' | 'dinamica' | 'meia-vida' | 'dose';

const FARMACO_RAIL: { id: FarmacoSlot; label: string; tag: string }[] = [
  { id: 'cinetica', label: 'PK', tag: 'ADME' },
  { id: 'dinamica', label: 'PD', tag: 'ação' },
  { id: 'meia-vida', label: 't½', tag: '50%' },
  { id: 'dose', label: 'dose', tag: 'ataque' },
];

function extractFarmacoSlots(text: string): FarmacoSlot[] {
  const lower = text.toLowerCase();
  const found = new Set<FarmacoSlot>();
  if (/farmacocinética|farmacocinetica|cinética|cinetica|\badme\b|absorção|metabolismo|excreção/.test(lower)) {
    found.add('cinetica');
  }
  if (/farmacodinâmica|farmacodinamica|dinâmica|dinamica|mecanismo|receptor|efeito/.test(lower)) {
    found.add('dinamica');
  }
  if (/meia-vida|meia vida|t½|50%|100%|eliminar 100|concentração/.test(lower)) {
    found.add('meia-vida');
  }
  if (/dose de ataque|manutenção|manutencao|posologia/.test(lower)) {
    found.add('dose');
  }
  if (/trocar cinética|inverter.*dinâmica|cinética e dinâmica/.test(lower)) {
    found.add('cinetica');
    found.add('dinamica');
  }
  if (/eliminar 100|100% da dose/.test(lower)) found.add('meia-vida');
  return [...found];
}

function inferFarmacoSlots(
  label: string,
  detail: string,
  correct: string,
): { trapSlots: FarmacoSlot[]; correctSlots: FarmacoSlot[]; hasRail: boolean } {
  const trapText = `${label} ${detail}`.toLowerCase();
  const correctText = correct.toLowerCase();

  if (/dose de ataque|conduta|não define meia-vida/.test(trapText + correctText)) {
    if (/dose de ataque|condutas/.test(trapText)) {
      return { trapSlots: ['dose'], correctSlots: ['meia-vida'], hasRail: true };
    }
  }

  let trapSlots = extractFarmacoSlots(trapText);
  let correctSlots = extractFarmacoSlots(correctText);

  if (/trocar cinética|inverter/.test(trapText)) trapSlots = ['dinamica'];
  if (/meia-vida = eliminação|eliminar 100|100%/.test(trapText)) trapSlots = ['meia-vida'];
  if (/confundir com dose/.test(trapText)) trapSlots = ['dose'];

  if (/cinética = adme|adme/.test(correctText) && correctSlots.length === 0) correctSlots = ['cinetica'];
  if (/dinâmica = ação|ação no organismo/.test(correctText) && correctSlots.length === 0) {
    correctSlots = ['dinamica'];
  }
  if (/50%|queda de 50/.test(correctText) && correctSlots.length === 0) correctSlots = ['meia-vida'];
  if (/farmacocinético/.test(correctText) && correctSlots.length === 0) correctSlots = ['cinetica'];

  return {
    trapSlots,
    correctSlots,
    hasRail: trapSlots.length > 0 || correctSlots.length > 0,
  };
}

function FarmacoRail({
  trapSlots,
  correctSlots,
  revealed,
}: {
  trapSlots: FarmacoSlot[];
  correctSlots: FarmacoSlot[];
  revealed: boolean;
}) {
  return (
    <div className="flex items-stretch justify-between gap-1 rounded-xl border border-violet-200/80 bg-violet-50/50 p-1.5">
      {FARMACO_RAIL.map((slot) => {
        const isTrap = trapSlots.includes(slot.id);
        const isCorrect = correctSlots.includes(slot.id);
        const showTrap = isTrap && !revealed;
        const showCorrect = isCorrect && revealed;

        return (
          <div
            key={slot.id}
            className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 transition-all duration-300 ${
              showTrap
                ? 'bg-rose-200/90 ring-2 ring-rose-400/50'
                : showCorrect
                  ? 'bg-emerald-200/90 ring-2 ring-emerald-400/50'
                  : 'bg-white/70 opacity-55'
            }`}
          >
            <span
              className={`font-mono text-[10px] font-black ${
                showTrap ? 'text-rose-900' : showCorrect ? 'text-emerald-900' : 'text-slate-500'
              }`}
            >
              {slot.label}
            </span>
            <span className="font-mono text-[7px] uppercase text-slate-500">{slot.tag}</span>
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

function FarmacoTrapCard({
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
  const { trapSlots, correctSlots, hasRail } = inferFarmacoSlots(label, trapText, correctText);

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
      className={`w-full text-left transition-transform duration-200 ${!isRevealed ? 'hover:scale-[1.01]' : ''}`}
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
              {isRevealed ? 'conceito certo' : `pegadinha #${index + 1}`}
            </span>
          </div>

          {hasRail ? (
            <FarmacoRail trapSlots={trapSlots} correctSlots={correctSlots} revealed={isRevealed} />
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2">
              <Pill className="h-4 w-4 shrink-0 text-slate-600" aria-hidden />
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-700">
                definição trocada
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
              Toque para ver o conceito certo →
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

interface DangerZoneFarmacoTrapProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
  compareRevealMode?: LogicFlowRevealMode;
}

export function DangerZoneFarmacoTrap({
  content,
  items,
  theme,
  footerRule,
  compareRevealMode = 'auto',
}: DangerZoneFarmacoTrapProps) {
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
            <span className={`font-body ${theme.textSecondary}`}>Conceitos corrigidos:</span>
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
              <FarmacoTrapCard
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
              {isTapMode ? 'PK · PD · t½ dominados' : 'Revise cinética, dinâmica e meia-vida antes da prova'}
            </span>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}

'use client';

import { useCallback, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, FlaskConical, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { useDangerZoneCompareReveal } from './dangerZoneReveal';
import type { DangerZoneItem } from './DangerZone';

type PrepSlot = 'id' | 'site' | 'temp' | 'waste' | 'phase';

const PREP_CHAIN: { id: PrepSlot; label: string; tag: string }[] = [
  { id: 'id', label: 'ID', tag: 'etiqueta' },
  { id: 'site', label: 'Coleta', tag: 'acesso' },
  { id: 'temp', label: '2–8°C', tag: 'frio' },
  { id: 'waste', label: 'Descarte', tag: 'segregar' },
  { id: 'phase', label: 'Pré', tag: 'analítica' },
];

function extractPrepSlots(text: string): PrepSlot[] {
  const lower = text.toLowerCase();
  const found = new Set<PrepSlot>();
  if (/identifica|etiqueta|pedido|paciente/.test(lower)) found.add('id');
  if (/mediana|cubital|cefálica|punção|veia|acesso venoso/.test(lower)) found.add('site');
  if (/refrigera|2\s*°c|8\s*°c|gelo|temperatura|frio/.test(lower)) found.add('temp');
  if (/perfurocortante|segrega|descarte|gaze|luva|resíduo|infectante/.test(lower)) found.add('waste');
  if (/pré-analítica|pre-analitica|acondicionamento|transporte|coleta e envio/.test(lower)) {
    found.add('phase');
  }
  if (/analítica|equipamento|leitura do/.test(lower) && !/pré-analítica|pre-analitica/.test(lower)) {
    found.add('phase');
  }
  return [...found];
}

function inferPrepSlots(
  label: string,
  detail: string,
  correct: string,
): { trapSlots: PrepSlot[]; correctSlots: PrepSlot[]; hasRail: boolean } {
  const trapText = `${label} ${detail}`.toLowerCase();
  const correctText = correct.toLowerCase();

  if (/trocar a fase|analítica pela|equipamento/.test(trapText)) {
    return { trapSlots: ['phase'], correctSlots: ['phase'], hasRail: true };
  }

  let trapSlots = extractPrepSlots(trapText);
  let correctSlots = extractPrepSlots(correctText);

  if (/cefálica|substituir mediana/.test(trapText)) trapSlots = ['site'];
  if (/ignorar.*2|faixa de 2|manter frio/.test(trapText)) trapSlots = ['temp'];
  if (/juntar resíduo|misturar luva|gazes e perfuro|recipiente dos perfuro/.test(trapText)) {
    trapSlots = ['waste'];
  }

  if (/mediana cubital|via preferida/.test(correctText)) correctSlots = ['site'];
  if (/2\s*°c.*8\s*°c|transporte refrigerado/.test(correctText)) correctSlots = ['temp'];
  if (/recipiente próprio|segregação/.test(correctText)) correctSlots = ['waste'];
  if (/pré-analítico|punção, acondicionamento/.test(correctText)) correctSlots = ['phase', 'site'];

  if (correctSlots.length === 0 && trapSlots.length > 0) {
    const all = PREP_CHAIN.map((s) => s.id).filter((id) => !trapSlots.includes(id));
    correctSlots = all.slice(0, 2);
  }

  return {
    trapSlots,
    correctSlots,
    hasRail: trapSlots.length > 0 || correctSlots.length > 0,
  };
}

function PrepRail({
  trapSlots,
  correctSlots,
  revealed,
}: {
  trapSlots: PrepSlot[];
  correctSlots: PrepSlot[];
  revealed: boolean;
}) {
  return (
    <div className="flex items-stretch justify-between gap-1 rounded-xl border border-sky-200/80 bg-sky-50/50 p-1.5">
      {PREP_CHAIN.map((slot) => {
        const isTrap = trapSlots.includes(slot.id);
        const isCorrect = correctSlots.includes(slot.id);
        const showTrap = isTrap && !revealed;
        const showCorrect = isCorrect && revealed;

        return (
          <div
            key={slot.id}
            className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-0.5 py-1.5 transition-all duration-300 ${
              showTrap
                ? 'bg-rose-200/90 ring-2 ring-rose-400/50'
                : showCorrect
                  ? 'bg-emerald-200/90 ring-2 ring-emerald-400/50'
                  : 'bg-white/70 opacity-55'
            }`}
          >
            <span
              className={`font-mono text-[9px] font-black leading-tight ${
                showTrap ? 'text-rose-900' : showCorrect ? 'text-emerald-900' : 'text-slate-500'
              }`}
            >
              {slot.label}
            </span>
            <span className="text-center font-mono text-[6px] uppercase leading-tight text-slate-500">
              {slot.tag}
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

function LabPrepTrapCard({
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
  const { trapSlots, correctSlots, hasRail } = inferPrepSlots(label, trapText, correctText);

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
              {isRevealed ? 'Corrigido' : 'Pegadinha'}
            </span>
          </div>

          {hasRail ? (
            <PrepRail trapSlots={trapSlots} correctSlots={correctSlots} revealed={isRevealed} />
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2">
              <FlaskConical className="h-4 w-4 shrink-0 text-sky-600" aria-hidden />
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-700">
                pré-analítica
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
              Toque para ver a conduta certa →
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

interface DangerZoneLabPrepTrapProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
  compareRevealMode?: LogicFlowRevealMode;
}

export function DangerZoneLabPrepTrap({
  content,
  items,
  theme,
  footerRule,
  compareRevealMode = 'auto',
}: DangerZoneLabPrepTrapProps) {
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

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 flex flex-col">
        {content ? (
          <div className="mb-4 flex justify-center">
            <div className={`rounded-full border px-5 py-2.5 ${theme.borderColor} ${theme.iconBg}`}>
              <p className={`font-body text-center text-xs font-semibold leading-snug md:text-sm ${theme.iconText}`}>
                {content}
              </p>
            </div>
          </div>
        ) : null}

        <p className="mb-4 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-white/80 px-3 py-1.5 text-xs">
            <span className="font-body text-slate-600">Elos corrigidos:</span>
            <strong className="font-mono text-sm font-black tabular-nums text-sky-700">
              {revealedCount}
            </strong>
            <span className="font-body text-slate-600">/ {items.length}</span>
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
              <LabPrepTrapCard
                index={index}
                item={item}
                isRevealed={isItemRevealed(index)}
                onReveal={() => handleReveal(index)}
                prefersReducedMotion={prefersReducedMotion}
              />
            </motion.div>
          ))}
        </div>

        {footerRule?.trim() ? (
          <p className={`mt-5 text-center font-body text-xs leading-relaxed md:text-sm ${theme.textSecondary}`}>
            {footerRule.trim()}
          </p>
        ) : null}
      </div>
    </div>
  );
}

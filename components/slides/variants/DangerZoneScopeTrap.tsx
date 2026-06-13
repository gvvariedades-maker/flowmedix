'use client';

import { useCallback, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Scale, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { useDangerZoneCompareReveal } from './dangerZoneReveal';
import type { DangerZoneItem } from './DangerZone';

type ScopeBlock = 'acoes' | 'esferas' | 'gestao' | 'fundacoes';

const BLOCKS: { id: ScopeBlock; label: string; full: string }[] = [
  { id: 'acoes', label: 'A+S', full: 'Ações e serviços' },
  { id: 'esferas', label: '3E', full: '3 esferas' },
  { id: 'gestao', label: 'D+I', full: 'Direta + indireta' },
  { id: 'fundacoes', label: 'FND', full: 'Fundações' },
];

function extractBlocks(text: string): ScopeBlock[] {
  const lower = text.toLowerCase();
  const found = new Set<ScopeBlock>();
  if (/ações e serviços|ações \+ serviços|art\.?\s*4|sentido amplo|não só hospital|não restringe/.test(lower)) {
    found.add('acoes');
  }
  if (/três esferas|união|estados e munic|esferas|todos os níveis/.test(lower)) {
    found.add('esferas');
  }
  if (/direta e indireta|direta \+ indireta|administração indireta/.test(lower)) {
    found.add('gestao');
  }
  if (/fundações|fundações mantidas/.test(lower)) {
    found.add('fundacoes');
  }
  if (/hospital|serviços hospitalares/.test(lower)) found.add('acoes');
  if (/atenção básica|aps/.test(lower)) found.add('acoes');
  if (/média\/alta|média e alta/.test(lower)) found.add('esferas');
  if (/só direta|administração direta/.test(lower)) found.add('gestao');
  return [...found];
}

function inferScopeSlots(
  label: string,
  detail: string,
  correct: string,
): { trapBlocks: ScopeBlock[]; correctBlocks: ScopeBlock[]; hasRail: boolean } {
  const trapText = `${label} ${detail}`.toLowerCase();
  const correctText = correct.toLowerCase();

  if (/confundir cf|8\.142|privado|alternativa “menor”|menos exagerada/.test(trapText + correctText)) {
    return { trapBlocks: [], correctBlocks: [], hasRail: false };
  }

  let trapBlocks = extractBlocks(trapText);
  let correctBlocks = extractBlocks(correctText);

  if (/letra a|hospital/.test(trapText)) trapBlocks = ['acoes'];
  if (/letra b|atenção básica|aps/.test(trapText)) trapBlocks = ['acoes', 'esferas'];
  if (/letra d|média\/alta|só direta/.test(trapText)) trapBlocks = ['gestao', 'esferas'];
  if (/letra e|pesquisa|insumos/.test(trapText)) trapBlocks = ['acoes'];

  if (correctBlocks.length === 0) {
    correctBlocks = ['acoes', 'esferas', 'gestao', 'fundacoes'];
  }

  return {
    trapBlocks,
    correctBlocks,
    hasRail: trapBlocks.length > 0 || correctBlocks.length > 0,
  };
}

function ScopeBlockRail({
  trapBlocks,
  correctBlocks,
  revealed,
}: {
  trapBlocks: ScopeBlock[];
  correctBlocks: ScopeBlock[];
  revealed: boolean;
}) {
  return (
    <div className="flex items-stretch justify-between gap-1 rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-1.5">
      {BLOCKS.map((block) => {
        const isTrap = trapBlocks.includes(block.id);
        const isCorrect = correctBlocks.includes(block.id);
        const showTrap = isTrap && !revealed;
        const showCorrect = isCorrect && revealed;

        return (
          <div
            key={block.id}
            className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 transition-all duration-300 ${
              showTrap
                ? 'bg-rose-200/90 ring-2 ring-rose-400/50'
                : showCorrect
                  ? 'bg-emerald-200/90 ring-2 ring-emerald-400/50'
                  : 'bg-white/70 opacity-55'
            }`}
            title={block.full}
          >
            <span
              className={`font-mono text-[9px] font-black tabular-nums ${
                showTrap ? 'text-rose-900' : showCorrect ? 'text-emerald-900' : 'text-slate-500'
              }`}
            >
              {block.label}
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
      <p className="min-w-0 flex-1 font-body text-sm font-bold leading-snug tracking-normal text-slate-900">
        {title}
      </p>
    </div>
  );
}

function ScopeTrapCard({
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
  const { trapBlocks, correctBlocks, hasRail } = inferScopeSlots(label, trapText, correctText);

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
              {isRevealed ? 'art. 4º completo' : `recorte #${index + 1}`}
            </span>
          </div>

          {hasRail ? (
            <ScopeBlockRail trapBlocks={trapBlocks} correctBlocks={correctBlocks} revealed={isRevealed} />
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2">
              <Scale className="h-4 w-4 shrink-0 text-slate-600" aria-hidden />
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-700">
                transferência de prova
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
              Toque para ver o art. 4º inteiro →
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

interface DangerZoneScopeTrapProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
  compareRevealMode?: LogicFlowRevealMode;
}

export function DangerZoneScopeTrap({
  content,
  items,
  theme,
  footerRule,
  compareRevealMode = 'auto',
}: DangerZoneScopeTrapProps) {
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
              <p className={`font-body text-center text-xs font-semibold leading-snug md:text-sm ${theme.iconText}`}>
                {content}
              </p>
            </div>
          </div>
        ) : null}

        <p className="mb-4 flex justify-center">
          <span
            className={`inline-flex items-center gap-2 rounded-full border bg-white/80 px-3 py-1.5 text-xs ${theme.borderColor}`}
          >
            <span className={`font-body ${theme.textSecondary}`}>Recortes corrigidos:</span>
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
              <ScopeTrapCard
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
            className="mt-4 rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-3 text-center"
          >
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-900">
              {isTapMode ? 'Art. 4º dominado — A+S · 3E · D+I · FND' : 'Revise os 4 blocos antes da prova'}
            </span>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};

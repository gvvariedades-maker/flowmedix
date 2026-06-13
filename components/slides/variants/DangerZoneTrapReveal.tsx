'use client';

import { useCallback, useState, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { getCompareCorrectColumnTitle } from '@/lib/slides/goldenRuleTypography';
import type { DangerZoneBulletStyle } from '../core/dangerZoneLayout';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { useDangerZoneCompareReveal } from './dangerZoneReveal';
import type { DangerZoneItem } from './DangerZone';

function TrapRevealFlipCard({
  index,
  label,
  trapText,
  correctText,
  isFlipped,
  onFlip,
  prefersReducedMotion,
}: {
  index: number;
  label: string;
  trapText: string;
  correctText: string;
  isFlipped: boolean;
  onFlip: () => void;
  prefersReducedMotion: boolean | null;
}) {
  const backTitle = getCompareCorrectColumnTitle(label, correctText);
  const backFaceLabel =
    backTitle === 'Resposta certa' ? 'Resposta certa' : 'Resposta correta';

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isFlipped) onFlip();
    }
  };

  if (prefersReducedMotion) {
    return (
      <button
        type="button"
        onClick={() => !isFlipped && onFlip()}
        onKeyDown={handleKeyDown}
        aria-pressed={isFlipped}
        className={`flex min-h-[148px] w-full flex-col justify-between rounded-2xl border border-white/5 p-4 text-left shadow-md transition-transform duration-200 hover:scale-[1.01] ${
          isFlipped ? 'bg-emerald-800' : 'bg-rose-900'
        }`}
      >
        {!isFlipped ? (
          <>
            <div className="flex items-start justify-between gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
                <X className="h-5 w-5 text-white" strokeWidth={3} aria-hidden />
              </span>
              <span className="rounded-full bg-black/25 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-white/90">
                ERRO
              </span>
            </div>
            <div className="mt-3">
              <p className="font-display text-sm font-extrabold uppercase tracking-wide text-white">
                {label}
              </p>
              <p className="mt-2 font-body text-sm font-semibold leading-relaxed text-white/90">
                {trapText}
              </p>
            </div>
            <span className="mt-3 font-mono text-[9px] font-bold uppercase tracking-widest text-white/70">
              Toque para revelar →
            </span>
          </>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
                <Check className="h-5 w-5 text-white" strokeWidth={3} aria-hidden />
              </span>
              <span className="rounded-full bg-black/25 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-white/90">
                {backFaceLabel}
              </span>
            </div>
            <p className="mt-3 font-body text-sm font-bold leading-relaxed text-white">
              {correctText || '—'}
            </p>
          </>
        )}
      </button>
    );
  }

  return (
    <div
      className="min-h-[148px] w-full cursor-pointer [perspective:1000px]"
      onClick={() => !isFlipped && onFlip()}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-pressed={isFlipped}
      aria-label={isFlipped ? `Pegadinha ${label} revelada` : `Revelar correção da pegadinha ${label}`}
    >
      <div
        className={`relative h-full min-h-[148px] w-full transition-transform duration-500 [transform-style:preserve-3d] ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        <div className="absolute inset-0 flex flex-col justify-between rounded-2xl border border-rose-800/40 bg-rose-900 p-4 shadow-md [backface-visibility:hidden]">
          <div className="flex items-start justify-between gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
              <X className="h-5 w-5 text-white" strokeWidth={3} aria-hidden />
            </span>
            <span className="rounded-full bg-black/25 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-white/90">
              ERRO #{index + 1}
            </span>
          </div>
          <div className="my-2 min-h-0 flex-1">
            <p className="font-display text-sm font-extrabold uppercase tracking-wide text-white">
              {label}
            </p>
            <p className="mt-2 line-clamp-4 font-body text-sm font-semibold leading-relaxed text-white/90">
              {trapText}
            </p>
          </div>
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-white/70">
            Toque para virar →
          </span>
        </div>

        <div className="absolute inset-0 flex flex-col justify-between rounded-2xl border border-emerald-900/40 bg-emerald-800 p-4 shadow-md [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="flex items-start justify-between gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
              <Check className="h-5 w-5 text-white" strokeWidth={3} aria-hidden />
            </span>
            <span className="rounded-full bg-black/25 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-white/90">
              {backFaceLabel}
            </span>
          </div>
          <p className="line-clamp-6 font-body text-sm font-bold leading-relaxed text-white">
            {correctText || '—'}
          </p>
        </div>
      </div>
    </div>
  );
}

interface DangerZoneTrapRevealProps {
  content: string;
  items: DangerZoneItem[];
  footerRule?: string;
  bulletStyle?: DangerZoneBulletStyle;
  compareRevealMode?: LogicFlowRevealMode;
}

export function DangerZoneTrapReveal({
  content,
  items,
  footerRule,
  compareRevealMode = 'auto',
}: DangerZoneTrapRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const { revealItem, isTapMode } = useDangerZoneCompareReveal(
    items.length,
    compareRevealMode,
  );
  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(() => new Set());

  const handleFlip = useCallback(
    (index: number) => {
      if (isTapMode) {
        revealItem(index);
      }
      setFlippedIndices((prev) => {
        const next = new Set(prev);
        next.add(index);
        return next;
      });
    },
    [isTapMode, revealItem],
  );

  const flippedCount = flippedIndices.size;
  const allFlipped = flippedCount >= items.length;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto bg-slate-900 p-4 md:p-6">
      {content ? (
        <div className="mb-4 flex justify-center">
          <div className="rounded-full border border-rose-700/50 bg-slate-800 px-5 py-2.5">
            <p className="font-display text-center text-xs font-extrabold uppercase tracking-[0.12em] text-rose-100 md:text-sm">
              {content}
            </p>
          </div>
        </div>
      ) : null}

      <p className="mb-4 flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-800/80 px-3 py-1.5 text-xs">
          <span className="font-body text-slate-400">Revelados:</span>
          <strong className="font-mono text-sm font-black tabular-nums text-rose-300">
            {flippedCount}
          </strong>
          <span className="font-body text-slate-500">/ {items.length}</span>
        </span>
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
        {items.map((item, index) => {
          const trapText = item.detail || item.description || '';
          const correctText = typeof item.correct === 'string' ? item.correct.trim() : '';
          const label = item.label || item.title || `Ponto ${index + 1}`;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <TrapRevealFlipCard
                index={index}
                label={label}
                trapText={trapText}
                correctText={correctText}
                isFlipped={flippedIndices.has(index)}
                onFlip={() => handleFlip(index)}
                prefersReducedMotion={prefersReducedMotion}
              />
            </motion.div>
          );
        })}
      </div>

      {footerRule ? (
        <div className="mt-6 rounded-xl border border-slate-700/60 bg-slate-800/90 px-4 py-3 md:px-5 md:py-4">
          <p className="font-body text-center text-sm font-semibold leading-relaxed text-amber-200/90 md:text-base">
            {footerRule}
          </p>
        </div>
      ) : null}

      {allFlipped ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-xl border border-emerald-900/50 bg-emerald-800/90 px-4 py-3 text-center"
        >
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-white">
            {isTapMode ? 'Todas as armadilhas mapeadas' : 'Domínio ativado — revise antes da prova'}
          </span>
        </motion.div>
      ) : null}
    </div>
  );
}

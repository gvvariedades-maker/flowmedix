'use client';

import { useCallback, useState, type KeyboardEvent, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { getCompareBackFaceLabel } from '@/lib/slides/goldenRuleTypography';
import type { ThemeColors } from '../core/themeGenerator';
import type { DangerZoneBulletStyle } from '../core/dangerZoneLayout';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { useDangerZoneCompareReveal } from './dangerZoneReveal';
import type { DangerZoneItem } from './DangerZone';

const TRAP_FACE =
  'border border-rose-200/80 border-l-[3px] border-l-rose-400/80 bg-gradient-to-br from-white via-rose-50/50 to-rose-50/80 shadow-sm';
const TRAP_ICON = 'bg-rose-100/90 text-rose-700';
const TRAP_BADGE = 'bg-rose-100/90 text-rose-800';
const TRAP_TITLE = 'text-slate-900';
const TRAP_BODY = 'text-slate-700';

const CORRECT_FACE =
  'border border-emerald-200/80 border-l-[3px] border-l-emerald-400/80 bg-gradient-to-br from-white via-emerald-50/50 to-emerald-50/80 shadow-sm';
const CORRECT_ICON = 'bg-emerald-100/90 text-emerald-700';
const CORRECT_BADGE = 'bg-emerald-100/90 text-emerald-800';
const CORRECT_BODY = 'text-emerald-900';

const CARD_MIN_H = 'min-h-[11rem] sm:min-h-[12.5rem]';

function TrapFaceGrid({
  header,
  body,
  footer,
  className,
}: {
  header: ReactNode;
  body: ReactNode;
  footer?: ReactNode;
  className: string;
}) {
  return (
    <div
      className={`grid h-full grid-rows-[auto_minmax(0,1fr)_auto] gap-2 rounded-2xl p-4 ${className}`}
    >
      <div className="shrink-0">{header}</div>
      <div className="min-h-0 overflow-hidden">{body}</div>
      {footer ? <div className="shrink-0 pt-1">{footer}</div> : <div aria-hidden className="h-0" />}
    </div>
  );
}

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
  const backFaceLabel = getCompareBackFaceLabel(label, correctText);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isFlipped) onFlip();
    }
  };

  const trapHeader = (
    <div className="flex items-start justify-between gap-2">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${TRAP_ICON}`}>
        <X className="h-5 w-5" strokeWidth={3} aria-hidden />
      </span>
      <span
        className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${TRAP_BADGE}`}
      >
        ERRO #{index + 1}
      </span>
    </div>
  );

  const trapBody = (
    <>
      <p
        className={`line-clamp-2 font-display text-sm font-extrabold uppercase tracking-wide ${TRAP_TITLE}`}
      >
        {label}
      </p>
      <p className={`mt-1.5 line-clamp-3 font-body text-sm font-semibold leading-snug ${TRAP_BODY}`}>
        {trapText}
      </p>
    </>
  );

  const trapFooter = (
    <span className="block font-mono text-[9px] font-bold uppercase tracking-widest text-rose-500/80">
      Toque para virar →
    </span>
  );

  const correctHeader = (
    <div className="flex items-start justify-between gap-2">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${CORRECT_ICON}`}>
        <Check className="h-5 w-5" strokeWidth={3} aria-hidden />
      </span>
      <span
        className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${CORRECT_BADGE}`}
      >
        {backFaceLabel}
      </span>
    </div>
  );

  const correctBody = (
    <p className={`line-clamp-5 font-body text-sm font-bold leading-snug ${CORRECT_BODY}`}>
      {correctText || '—'}
    </p>
  );

  if (prefersReducedMotion) {
    return (
      <button
        type="button"
        onClick={() => !isFlipped && onFlip()}
        onKeyDown={handleKeyDown}
        aria-pressed={isFlipped}
        className={`w-full text-left transition-transform duration-200 hover:scale-[1.01] ${CARD_MIN_H} ${
          isFlipped ? CORRECT_FACE : TRAP_FACE
        }`}
      >
        {isFlipped ? (
          <TrapFaceGrid header={correctHeader} body={correctBody} className="h-full" />
        ) : (
          <TrapFaceGrid header={trapHeader} body={trapBody} footer={trapFooter} className="h-full" />
        )}
      </button>
    );
  }

  return (
    <div
      className={`w-full cursor-pointer [perspective:1000px] ${CARD_MIN_H}`}
      onClick={() => !isFlipped && onFlip()}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-pressed={isFlipped}
      aria-label={isFlipped ? `Pegadinha ${label} revelada` : `Revelar correção da pegadinha ${label}`}
    >
      <div
        className={`relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${CARD_MIN_H} ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        <div className="absolute inset-0 [backface-visibility:hidden]">
          <TrapFaceGrid
            header={trapHeader}
            body={trapBody}
            footer={trapFooter}
            className={`h-full ${TRAP_FACE}`}
          />
        </div>

        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <TrapFaceGrid
            header={correctHeader}
            body={correctBody}
            className={`h-full ${CORRECT_FACE}`}
          />
        </div>
      </div>
    </div>
  );
}

interface DangerZoneTrapRevealProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
  bulletStyle?: DangerZoneBulletStyle;
  compareRevealMode?: LogicFlowRevealMode;
}

export function DangerZoneTrapReveal({
  content,
  items,
  theme,
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
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 flex flex-col">
        {content ? (
          <div className="mb-4 flex justify-center">
            <div
              className={`rounded-full border px-5 py-2.5 ${theme.borderColor} ${theme.iconBg}`}
            >
              <p
                className={`font-display text-center text-xs font-extrabold uppercase tracking-[0.12em] md:text-sm ${theme.iconText}`}
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
            <span className={`font-body ${theme.textSecondary}`}>Revelados:</span>
            <strong className={`font-mono text-sm font-black tabular-nums ${theme.iconText}`}>
              {flippedCount}
            </strong>
            <span className={`font-body ${theme.textSecondary}`}>/ {items.length}</span>
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

        {allFlipped ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-3 text-center"
          >
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-800">
              {isTapMode ? 'Todas as armadilhas mapeadas' : 'Domínio ativado — revise antes da prova'}
            </span>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}

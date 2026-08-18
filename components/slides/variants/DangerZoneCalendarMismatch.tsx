'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CalendarX, Check, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import type { DangerZoneItem } from './DangerZone';
import { BoardChrome, CategoryStrip, PolarityPanel } from '../primitives';
import { cn } from '@/lib/utils';
import {
  isPniCatchUpCorpus,
  PNI_MONTH_SLOTS,
  pniMonthLabel,
} from '@/lib/slides/pniSlideUtils';

function extractMonths(text: string): number[] {
  const lower = text.toLowerCase();
  const found = new Set<number>();
  if (/ao nascer|nascimento|neonatal/.test(lower)) found.add(0);
  for (const match of lower.matchAll(/(\d+)\s*(?:º|o)?\s*m[eê]s/g)) {
    const n = Number.parseInt(match[1], 10);
    if ((PNI_MONTH_SLOTS as readonly number[]).includes(n)) found.add(n);
  }
  if (/3-5-12|3 · 5 · 12|3, 5 e 12/.test(lower)) {
    found.add(3);
    found.add(5);
    found.add(12);
  }
  if (/2, 4 e 12|2 · 4 · 12|2 e 4 meses/.test(lower)) {
    found.add(2);
    found.add(4);
    if (/12/.test(lower)) found.add(12);
  }
  if (/2, 4 e 6|2-4-6|2, 4 e 6 meses/.test(lower)) {
    found.add(2);
    found.add(4);
    found.add(6);
  }
  return [...found];
}

function inferCalendarSlots(
  label: string,
  detail: string,
  correct: string,
): { trapMonths: number[]; correctMonths: number[]; hasRail: boolean } {
  const trapText = `${label} ${detail}`.toLowerCase();
  const correctText = correct.toLowerCase();

  if (/acwy|atraso|catch-up|pular dose|esperar próximo|transferência|cart[aã]o perdido/.test(trapText + correctText)) {
    return { trapMonths: [], correctMonths: [], hasRail: false };
  }

  let trapMonths = extractMonths(`${label} ${detail}`);
  let correctMonths = extractMonths(correct);

  if (trapMonths.length === 0 && /3\s*m/.test(trapText)) trapMonths = [3];
  if (/bcg/.test(trapText) && trapMonths.includes(3)) {
    correctMonths = correctMonths.length > 0 ? correctMonths : [0];
  }
  if (/rotav/.test(trapText) && trapMonths.includes(3)) {
    correctMonths = correctMonths.length > 0 ? correctMonths : [2, 4];
  }
  if (/pneumo/.test(trapText) && trapMonths.includes(3)) {
    correctMonths = correctMonths.length > 0 ? correctMonths : [2, 4, 12];
  }
  if (/difteria|pentavalente|dtp/.test(trapText) && trapMonths.includes(3)) {
    correctMonths = correctMonths.length > 0 ? correctMonths : [2, 4, 6];
  }
  if (/meningo|men c/.test(trapText) && !/acwy/.test(trapText)) {
    if (trapMonths.length === 0 && /3/.test(trapText)) trapMonths = [3];
    if (correctMonths.length === 0) correctMonths = [3, 5, 12];
  }
  if (/3ª dose/.test(trapText)) {
    trapMonths = [3];
    correctMonths = correctMonths.length > 0 ? correctMonths : [6];
  }

  return {
    trapMonths,
    correctMonths,
    hasRail: trapMonths.length > 0 || correctMonths.length > 0,
  };
}

function MonthRail({
  trapMonths,
  correctMonths,
}: {
  trapMonths: number[];
  correctMonths: number[];
}) {
  return (
    <div
      className="flex items-center justify-between gap-0.5 rounded-xl border border-lime-300 bg-lime-50 px-2 py-1.5"
      aria-hidden
    >
      {PNI_MONTH_SLOTS.map((month) => {
        const isTrap = trapMonths.includes(month);
        const isCorrect = correctMonths.includes(month);
        return (
          <div
            key={month}
            className={cn(
              'flex min-w-0 flex-1 flex-col items-center rounded-md px-0.5 py-1',
              isTrap && 'bg-rose-200 ring-1 ring-rose-400',
              isCorrect && 'bg-emerald-200 ring-1 ring-emerald-500',
              !isTrap && !isCorrect && 'bg-white/70 opacity-50',
            )}
          >
            <span
              className={cn(
                'font-mono text-[9px] font-black tabular-nums',
                isTrap ? 'text-rose-900' : isCorrect ? 'text-emerald-900' : 'text-slate-500',
              )}
            >
              {pniMonthLabel(month)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function extractLetterFromLabel(label: string): string | null {
  const match = label.match(/^Letra\s+([A-E])\b/i);
  return match?.[1]?.toUpperCase() ?? null;
}

function isTransferItem(label: string): boolean {
  return /transfer|similares/i.test(label);
}

function shortTrapTitle(label: string, letter: string | null): string {
  if (!letter) return label;
  return label.replace(new RegExp(`^Letra\\s+${letter}\\s*[—–-]\\s*`, 'i'), '').trim() || label;
}

function TrapRow({
  index,
  item,
  prefersReducedMotion,
  compact,
}: {
  index: number;
  item: DangerZoneItem;
  prefersReducedMotion: boolean | null;
  compact: boolean;
}) {
  const label = item.label || item.title || `Pegadinha ${index + 1}`;
  const letter = extractLetterFromLabel(label);
  const trapText = item.detail || item.description || '';
  const correctText = typeof item.correct === 'string' ? item.correct.trim() : '';
  const { trapMonths, correctMonths, hasRail } = inferCalendarSlots(label, trapText, correctText);
  const title = shortTrapTitle(label, letter);

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: prefersReducedMotion ? 0 : index * 0.03 }}
    >
      <PolarityPanel tone="exception" emphasized={!!letter} className="!gap-2">
        <div className="flex items-center gap-2.5">
          {letter ? (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 font-body text-lg font-black text-white shadow-sm">
              {letter}
            </span>
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <CalendarX className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <CategoryStrip label={`Erro #${index + 1}`} tone="exception" className="mb-1 self-start" />
            <p className="font-body text-sm font-bold leading-snug text-slate-900 md:text-[15px]">
              {title}
            </p>
          </div>
        </div>

        {!compact && hasRail ? (
          <MonthRail trapMonths={trapMonths} correctMonths={correctMonths} />
        ) : null}

        {trapText ? (
          <p className="flex items-start gap-1.5 font-body text-sm leading-snug text-rose-800">
            <X className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={3} aria-hidden />
            <span>{trapText}</span>
          </p>
        ) : null}
        {correctText ? (
          <p className="flex items-start gap-1.5 rounded-xl bg-emerald-50 px-3 py-2.5 font-body text-sm font-semibold leading-snug text-emerald-900 ring-1 ring-emerald-200 md:text-[15px]">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" strokeWidth={3} aria-hidden />
            <span>{correctText}</span>
          </p>
        ) : null}
      </PolarityPanel>
    </motion.div>
  );
}

function TransferBanner({
  item,
  prefersReducedMotion,
}: {
  item: DangerZoneItem;
  prefersReducedMotion: boolean | null;
}) {
  const label = item.label || item.title || 'Transferência';
  const trapText = item.detail || item.description || '';
  const correctText = typeof item.correct === 'string' ? item.correct.trim() : '';
  const title = label.replace(/^Transferência\s*[—–-]?\s*/i, '').trim() || label;

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <PolarityPanel tone="transfer" emphasized className="!gap-2">
        <div className="flex items-center gap-2">
          <CategoryStrip label="Transferência" tone="transfer" />
        </div>
        <p className="font-body text-base font-bold leading-snug text-slate-900">{title}</p>
        {trapText ? (
          <p className="font-body text-sm leading-snug text-amber-900">{trapText}</p>
        ) : null}
        {correctText ? (
          <p className="flex items-start gap-1.5 rounded-xl bg-amber-50/80 px-3 py-2.5 font-body text-sm font-semibold leading-snug text-amber-950 ring-1 ring-amber-200 md:text-[15px]">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" strokeWidth={3} aria-hidden />
            <span>{correctText}</span>
          </p>
        ) : null}
      </PolarityPanel>
    </motion.div>
  );
}

interface DangerZoneCalendarMismatchProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
  compareRevealMode?: LogicFlowRevealMode;
}

/** Arena aberta Glance OS — traps em lista; transferência fora do grid. */
export function DangerZoneCalendarMismatch({
  content,
  items,
  theme,
  footerRule,
}: DangerZoneCalendarMismatchProps) {
  const prefersReducedMotion = useReducedMotion();
  const corpus = useMemo(
    () =>
      `${content} ${items.map((i) => `${i.label ?? ''} ${i.detail ?? ''} ${i.correct ?? ''}`).join(' ')}`,
    [content, items],
  );
  const catchUpMode = isPniCatchUpCorpus(corpus);

  const traps = items.filter((item) => !isTransferItem(item.label || item.title || ''));
  const transfers = items.filter((item) => isTransferItem(item.label || item.title || ''));

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.35}
      eyebrow={catchUpMode ? 'ARMADILHA — CATCH-UP' : 'ARMADILHA — CALENDÁRIO'}
      title={content || undefined}
      titleClassName="text-sm font-bold uppercase tracking-wide text-rose-900 md:text-base"
      footerRule={footerRule}
      footerLabel={footerRule ? 'TRANSFERÊNCIA' : undefined}
      maxWidth="3xl"
      className="gap-3"
    >
      <div className="flex flex-col gap-2.5">
        {traps.map((item, index) => (
          <TrapRow
            key={`trap-${index}`}
            index={index}
            item={item}
            prefersReducedMotion={prefersReducedMotion}
            compact={catchUpMode}
          />
        ))}
      </div>

      {transfers.length > 0 ? (
        <div className="flex flex-col gap-2.5 border-t border-amber-200/70 pt-3">
          {transfers.map((item, index) => (
            <TransferBanner
              key={`transfer-${index}`}
              item={item}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>
      ) : null}
    </BoardChrome>
  );
}

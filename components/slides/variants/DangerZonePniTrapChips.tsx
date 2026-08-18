'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import type { DangerZoneItem } from './DangerZone';
import {
  inferIntervalChips,
  inferPniTrapSlots,
  pniMonthLabel,
  PNI_MONTH_SLOTS,
  type PniChipColor,
  type PniIntervalChip,
} from '@/lib/slides/pniSlideUtils';
import { BoardChrome, CategoryStrip, PolarityPanel } from '../primitives';
import { cn } from '@/lib/utils';

const CHIP_STYLES: Record<PniChipColor, string> = {
  lime: 'bg-lime-200 text-lime-950 ring-lime-400/60',
  sky: 'bg-sky-200 text-sky-950 ring-sky-400/60',
  amber: 'bg-amber-200 text-amber-950 ring-amber-400/60',
  teal: 'bg-teal-200 text-teal-950 ring-teal-400/60',
  emerald: 'bg-emerald-200 text-emerald-950 ring-emerald-400/60',
};

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

function IntervalChipsRow({ chips }: { chips: PniIntervalChip[] }) {
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {chips.map((chip) => (
        <span
          key={chip.label}
          className={cn(
            'rounded-md px-2 py-0.5 font-mono text-[10px] font-black tabular-nums ring-1',
            CHIP_STYLES[chip.color],
          )}
        >
          {chip.label}
        </span>
      ))}
    </div>
  );
}

function extractLetterFromLabel(label: string): string | null {
  const match = label.match(/^Letra\s+([A-E])\b/i);
  return match?.[1]?.toUpperCase() ?? null;
}

function isTransferItem(label: string): boolean {
  return /similares|transfer/i.test(label);
}

function TrapChipCard({
  index,
  item,
  prefersReducedMotion,
}: {
  index: number;
  item: DangerZoneItem;
  prefersReducedMotion: boolean | null;
}) {
  const label = item.label || item.title || `Pegadinha ${index + 1}`;
  const letter = extractLetterFromLabel(label);
  const trapText = item.detail || item.description || '';
  const correctText = typeof item.correct === 'string' ? item.correct.trim() : '';
  const transfer = isTransferItem(label);
  const { trapMonths, correctMonths, chips, hasRail, hasChips } = inferPniTrapSlots(
    label,
    trapText,
    correctText,
  );
  const fallbackChips =
    chips.length > 0 ? chips : inferIntervalChips(`${label} ${trapText} ${correctText}`);

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: prefersReducedMotion ? 0 : index * 0.04 }}
    >
      <PolarityPanel tone={transfer ? 'transfer' : 'exception'} emphasized={!transfer && !!letter}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {letter ? (
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 font-body text-lg font-black text-white shadow-sm">
                {letter}
              </span>
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
                <X className="h-4 w-4" strokeWidth={3} aria-hidden />
              </span>
            )}
            <CategoryStrip
              label={transfer ? 'Transferência' : `Erro #${index + 1}`}
              tone={transfer ? 'transfer' : 'exception'}
            />
          </div>
          {fallbackChips[0] ? (
            <span
              className={cn(
                'rounded-md px-2 py-0.5 font-mono text-[10px] font-black ring-1',
                CHIP_STYLES[fallbackChips[0].color],
              )}
            >
              {fallbackChips[0].label}
            </span>
          ) : null}
        </div>

        {hasRail ? <MonthRail trapMonths={trapMonths} correctMonths={correctMonths} /> : null}
        {hasChips || fallbackChips.length > 1 ? (
          <IntervalChipsRow chips={(hasChips ? chips : fallbackChips).slice(0, 3)} />
        ) : null}

        <p className="font-body text-sm font-bold leading-snug text-slate-900">{label}</p>
        {trapText ? (
          <p className="flex items-start gap-1.5 font-body text-xs leading-snug text-rose-800">
            <X className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={3} aria-hidden />
            <span>{trapText}</span>
          </p>
        ) : null}
        {correctText ? (
          <p className="flex items-start gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-2 font-body text-sm font-semibold leading-snug text-emerald-900 ring-1 ring-emerald-200">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" strokeWidth={3} aria-hidden />
            <span>{correctText}</span>
          </p>
        ) : null}
      </PolarityPanel>
    </motion.div>
  );
}

interface DangerZonePniTrapChipsProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
  compareRevealMode?: LogicFlowRevealMode;
}

/** Arena aberta Glance OS — ✗ pegadinha + ✔ regra, punch + chips. */
export function DangerZonePniTrapChips({
  content,
  items,
  theme,
  footerRule,
}: DangerZonePniTrapChipsProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.35}
      eyebrow="ARMADILHA PNI"
      title={content || undefined}
      titleClassName="text-sm font-bold uppercase tracking-wide text-rose-900 md:text-base"
      footerRule={footerRule}
      footerLabel={footerRule ? 'TRANSFERÊNCIA' : undefined}
      maxWidth="3xl"
    >
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {items.map((item, index) => (
          <TrapChipCard
            key={index}
            index={index}
            item={item}
            prefersReducedMotion={prefersReducedMotion}
          />
        ))}
      </div>
    </BoardChrome>
  );
}

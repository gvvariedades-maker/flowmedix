'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { DangerZoneItem } from './DangerZone';
import { isPniExcetoExceptionItem } from '@/lib/slides/pniSlideUtils';
import { BoardChrome, CategoryStrip, PolarityPanel, type BoardTone } from '../primitives';
import { cn } from '@/lib/utils';

interface DangerZonePniExcetoCompareProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
}

function isTransferItem(label: string): boolean {
  return /similares|transfer/i.test(label);
}

function extractLetter(label: string): string | null {
  return label.match(/^Letra\s+([A-E])\b/i)?.[1]?.toUpperCase() ?? null;
}

function shortTitle(label: string, letter: string | null): string {
  if (!letter) return label.replace(/^Transferência\s*[—–-]?\s*/i, '').trim() || label;
  return label.replace(new RegExp(`^Letra\\s+${letter}\\s*[—–-]\\s*`, 'i'), '').trim() || label;
}

function rowTone(exception: boolean, transfer: boolean): BoardTone {
  if (exception) return 'exception';
  if (transfer) return 'transfer';
  return 'ok';
}

/** EXCETO/INCORRETA PNI — lista glanceable: manter × exceção com letra; transferência fora. */
export function DangerZonePniExcetoCompare({
  content,
  items,
  theme,
  footerRule,
}: DangerZonePniExcetoCompareProps) {
  const reduceMotion = useReducedMotion();

  const { keeps, exceptions, transfers } = useMemo(() => {
    const rows = items.map((item, index) => {
      const label = item.label || item.title || `Item ${index + 1}`;
      const detail = item.detail || item.description || '';
      const correct = typeof item.correct === 'string' ? item.correct.trim() : '';
      const letter = extractLetter(label);
      const transfer = isTransferItem(label);
      const exception = !transfer && isPniExcetoExceptionItem(label, correct);
      return { label, detail, correct, letter, exception, transfer };
    });
    return {
      keeps: rows.filter((r) => !r.exception && !r.transfer),
      exceptions: rows.filter((r) => r.exception),
      transfers: rows.filter((r) => r.transfer),
    };
  }, [items]);

  if (items.length === 0) return null;

  const renderRow = (
    row: {
      label: string;
      detail: string;
      correct: string;
      letter: string | null;
      exception: boolean;
      transfer: boolean;
    },
    i: number,
  ) => {
    const tone = rowTone(row.exception, row.transfer);
    return (
      <motion.div
        key={`${row.label}-${i}`}
        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduceMotion ? 0 : i * 0.03 }}
      >
        <PolarityPanel tone={tone} emphasized={row.exception || row.transfer} className="!gap-2">
          <div className="flex items-center gap-2.5">
            {row.letter ? (
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-body text-lg font-black text-white shadow-sm',
                  row.exception ? 'bg-rose-600' : 'bg-emerald-600',
                )}
              >
                {row.letter}
              </span>
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <CategoryStrip
                label={row.exception ? 'Exceção' : row.transfer ? 'Transferência' : 'Manter'}
                tone={tone}
                className="mb-1 self-start"
              />
              <p className="font-body text-sm font-bold leading-snug text-slate-900 md:text-[15px]">
                {shortTitle(row.label, row.letter)}
              </p>
            </div>
            {row.exception ? (
              <X className="h-5 w-5 shrink-0 text-rose-600" strokeWidth={3} aria-hidden />
            ) : (
              <Check className="h-5 w-5 shrink-0 text-emerald-600" strokeWidth={3} aria-hidden />
            )}
          </div>
          {row.detail ? (
            <p className="flex items-start gap-1.5 font-body text-sm leading-snug text-rose-800/90">
              {row.exception ? (
                <X className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={3} aria-hidden />
              ) : null}
              <span className={row.exception ? undefined : 'text-slate-600'}>{row.detail}</span>
            </p>
          ) : null}
          {row.correct ? (
            <p
              className={cn(
                'rounded-xl px-3 py-2.5 font-body text-sm font-semibold leading-snug ring-1 md:text-[15px]',
                row.exception
                  ? 'bg-rose-50 text-rose-950 ring-rose-200'
                  : row.transfer
                    ? 'bg-amber-50 text-amber-950 ring-amber-200'
                    : 'bg-emerald-50 text-emerald-950 ring-emerald-200',
              )}
            >
              {row.correct}
            </p>
          ) : null}
        </PolarityPanel>
      </motion.div>
    );
  };

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.35}
      eyebrow="ARMADILHA — INCORRETA / EXCETO"
      title={content || undefined}
      titleClassName="text-sm font-bold uppercase tracking-wide text-rose-900 md:text-base"
      footerRule={footerRule}
      footerLabel={footerRule ? 'TRANSFERÊNCIA' : undefined}
      maxWidth="3xl"
      className="gap-3"
    >
      <div className="flex flex-col gap-2.5">
        {keeps.map((row, i) => renderRow(row, i))}
      </div>

      {exceptions.length > 0 ? (
        <div className="flex flex-col gap-2.5 border-t border-rose-200/80 pt-3">
          {exceptions.map((row, i) => renderRow(row, i + keeps.length))}
        </div>
      ) : null}

      {transfers.length > 0 ? (
        <div className="flex flex-col gap-2.5 border-t border-amber-200/70 pt-3">
          {transfers.map((row, i) => renderRow(row, i + keeps.length + exceptions.length))}
        </div>
      ) : null}
    </BoardChrome>
  );
}

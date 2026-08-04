'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { DangerZoneItem } from './DangerZone';
import { BoardChrome, PolarityPanel, boardTone, type BoardTone } from '../primitives';

interface DangerZoneAdolescentExcetoCompareProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
}

function isExceptionItem(label: string, correct: string): boolean {
  const t = `${label} ${correct}`.toLowerCase();
  return /letra d|exce[cç][aã]o|jarg[aã]o|rebuscad|barreira|incorreta/.test(t);
}

function isTransferItem(label: string): boolean {
  return /similares|transfer/i.test(label);
}

function rowTone(exception: boolean, transfer: boolean): BoardTone {
  if (exception) return 'exception';
  if (transfer) return 'transfer';
  return 'ok';
}

/** EXCETO compare aberto — sem portas; A–C acolhem, D afasta. */
export function DangerZoneAdolescentExcetoCompare({
  content,
  items,
  theme,
  footerRule,
}: DangerZoneAdolescentExcetoCompareProps) {
  const reduceMotion = useReducedMotion();

  const rows = useMemo(
    () =>
      items.map((item, index) => {
        const label = item.label || item.title || `Item ${index + 1}`;
        const detail = item.detail || item.description || '';
        const correct = typeof item.correct === 'string' ? item.correct.trim() : '';
        return {
          label,
          detail,
          correct,
          exception: isExceptionItem(label, correct),
          transfer: isTransferItem(label),
        };
      }),
    [items],
  );

  if (items.length === 0) return null;

  return (
    <BoardChrome
      theme={theme}
      title={content || undefined}
      titleClassName="text-sm md:text-base"
      eyebrow="Compare — conduta × exceção"
      footerLabel="Transferência"
      footerRule={footerRule}
    >
      <div className="flex flex-col gap-2.5">
        {rows.map((row, i) => {
          const bad = row.exception;
          const tone = rowTone(row.exception, row.transfer);
          const t = boardTone(tone);
          return (
            <motion.div
              key={i}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : i * 0.03 }}
            >
              <PolarityPanel tone={tone} className="rounded-2xl" emphasized={bad}>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    {row.label}
                  </p>
                  {bad ? (
                    <X className={`h-4 w-4 shrink-0 ${t.columnLabel}`} aria-hidden />
                  ) : (
                    <Check className={`h-4 w-4 shrink-0 ${t.columnLabel}`} aria-hidden />
                  )}
                </div>
                {row.detail ? (
                  <p className="font-body text-xs leading-relaxed text-slate-700">{row.detail}</p>
                ) : null}
                {row.correct ? (
                  <p
                    className={`mt-2 rounded-lg bg-white/70 px-2.5 py-2 font-body text-sm font-semibold leading-snug ${t.text}`}
                  >
                    {row.correct}
                  </p>
                ) : null}
              </PolarityPanel>
            </motion.div>
          );
        })}
      </div>
    </BoardChrome>
  );
}

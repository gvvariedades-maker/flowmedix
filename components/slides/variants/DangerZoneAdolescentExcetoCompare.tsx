'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { DangerZoneItem } from './DangerZone';

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
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-5">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-30`} />

      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col gap-3">
        {content ? (
          <h2 className="text-center font-display text-sm font-black uppercase tracking-wide text-slate-900 md:text-base">
            {content}
          </h2>
        ) : null}

        <p className="text-center font-mono text-[10px] font-bold uppercase tracking-widest text-sky-700/90">
          Compare — conduta × exceção
        </p>

        <div className="flex flex-col gap-2.5">
          {rows.map((row, i) => {
            const bad = row.exception;
            return (
              <motion.div
                key={i}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : i * 0.03 }}
                className={`rounded-2xl border-2 p-3 ${
                  bad
                    ? 'border-rose-400 bg-rose-50/95'
                    : row.transfer
                      ? 'border-amber-300 bg-amber-50/90'
                      : 'border-emerald-300 bg-emerald-50/90'
                }`}
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    {row.label}
                  </p>
                  {bad ? (
                    <X className="h-4 w-4 shrink-0 text-rose-600" aria-hidden />
                  ) : (
                    <Check className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  )}
                </div>
                {row.detail ? (
                  <p className="font-body text-xs leading-relaxed text-slate-700">{row.detail}</p>
                ) : null}
                {row.correct ? (
                  <p
                    className={`mt-2 rounded-lg px-2.5 py-2 font-body text-sm font-semibold leading-snug ${
                      bad ? 'bg-white/70 text-rose-950' : 'bg-white/70 text-emerald-950'
                    }`}
                  >
                    {row.correct}
                  </p>
                ) : null}
              </motion.div>
            );
          })}
        </div>

        {footerRule ? (
          <p className="rounded-xl border border-sky-200/70 bg-sky-50/80 px-3 py-2.5 text-center font-body text-sm italic text-sky-900/85">
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}

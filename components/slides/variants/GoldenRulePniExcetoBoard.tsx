'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, Check, Pill } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import { isCalendarHotRow } from '@/lib/slides/pniSlideUtils';
import { BoardChrome, CategoryStrip, PolarityPanel } from '../primitives';
import { cn } from '@/lib/utils';

interface GoldenRulePniExcetoBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

function isMythRow(label: string, value: string): boolean {
  return /antibiótico|antibiotico|não adia|nao adia|mito/i.test(`${label} ${value}`);
}

/** Deck EXCETO PNI — linha hot do mito em destaque + regras de manter. */
export function GoldenRulePniExcetoBoard({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRulePniExcetoBoardProps) {
  const reduceMotion = useReducedMotion();

  const { hot, rest } = useMemo(() => {
    const hotIdx = rows.findIndex(
      (r) =>
        isMythRow(r.label, r.value) ||
        isCalendarHotRow(r.label, r.value, r.emphasis, r.badge),
    );
    const hotRow = hotIdx >= 0 ? rows[hotIdx] : rows[0];
    return {
      hot: hotRow,
      rest: rows.filter((r) => r !== hotRow),
    };
  }, [rows]);

  if (rows.length === 0) return null;

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.35}
      eyebrow="DECORE — CONDUTAS PNI"
      title={content || undefined}
      titleClassName="text-center font-mono text-[10px] font-bold uppercase tracking-widest text-lime-900 md:text-[11px]"
      footerRule={footerRule}
      footerLabel={footerRule ? 'FIXAÇÃO' : undefined}
      maxWidth="3xl"
      className="gap-3"
    >
      {hot ? (
        <PolarityPanel tone="exception" emphasized>
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-sm">
              <Pill className="h-6 w-6" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <CategoryStrip label="Regra que a banca testa" tone="exception" />
                <span className="rounded-full bg-rose-600 px-2 py-0.5 font-mono text-[9px] font-black uppercase text-white">
                  Hot
                </span>
              </div>
              <p className="mt-1.5 font-mono text-[10px] font-bold uppercase tracking-wide text-rose-800">
                {hot.label}
              </p>
              <p className="mt-1 font-display text-xl font-black leading-tight text-rose-900 md:text-2xl">
                NÃO ADIA
              </p>
              <p className="mt-1.5 font-body text-sm font-semibold leading-snug text-slate-800 md:text-base">
                {hot.value}
              </p>
            </div>
            <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" aria-hidden />
          </div>
        </PolarityPanel>
      ) : null}

      <div className="flex flex-col gap-2.5">
        {rest.map((row, index) => (
          <motion.div
            key={`${row.label}-${index}`}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : index * 0.04 }}
            className={cn(
              'flex items-start gap-3 rounded-2xl border border-l-[4px] border-l-emerald-500 bg-white/95 p-4 shadow-sm',
            )}
          >
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                {row.label}
              </p>
              <p className="mt-1 font-body text-sm leading-snug text-slate-800 md:text-[15px]">
                {row.value}
              </p>
            </div>
            {row.badge ? (
              <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-emerald-800">
                {row.badge}
              </span>
            ) : null}
          </motion.div>
        ))}
      </div>
    </BoardChrome>
  );
}

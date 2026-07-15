'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Hand, ShieldAlert } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import { inferTbVigilanceSlot } from '@/lib/slides/tuberculoseSlideUtils';

interface GoldenRuleTbPrecautionBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

function rowEmphasis(row: GoldenRuleRow): 'ok' | 'alert' | 'neutral' {
  const blob = `${row.label} ${row.value}`.toLowerCase();
  if (row.emphasis === 'alert' || row.badge === 'warn' || /falso|pele|errad/i.test(blob)) return 'alert';
  if (row.badge === 'ok' || row.badge === 'hot' || /compuls|baar|aeross/i.test(blob)) return 'ok';
  return 'neutral';
}

export function GoldenRuleTbPrecautionBoard({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRuleTbPrecautionBoardProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const cards = useMemo(
    () =>
      rows.map((row, index) => ({
        ...row,
        index,
        emphasis: rowEmphasis(row),
        slot: inferTbVigilanceSlot(row.label, row.value),
      })),
    [rows],
  );

  const active = cards[activeIndex];

  const toggle = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-3">
        {content && (
          <div className="rounded-xl border border-orange-200/70 bg-white/90 px-4 py-2 text-center shadow-sm">
            <p className="font-display text-sm font-black uppercase tracking-wide text-orange-900 md:text-base">
              {content}
            </p>
          </div>
        )}

        <div className="flex items-center justify-center gap-4 rounded-2xl border border-orange-200/60 bg-white/80 p-3">
          <div className="flex flex-col items-center gap-1">
            <Wind className="h-6 w-6 text-sky-600" aria-hidden />
            <span className="font-mono text-[9px] font-bold uppercase text-sky-800">Aerossóis</span>
          </div>
          <span className="font-mono text-xs font-bold text-slate-400">≠</span>
          <div className="flex flex-col items-center gap-1 opacity-50 line-through decoration-rose-400">
            <Hand className="h-6 w-6 text-rose-400" aria-hidden />
            <span className="font-mono text-[9px] font-bold uppercase text-rose-400">Só pele</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {active && (
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={`rounded-2xl border bg-white/95 p-4 shadow-md ${
                active.emphasis === 'alert'
                  ? 'border-rose-300/80 border-l-[4px] border-l-rose-500'
                  : active.emphasis === 'ok'
                    ? 'border-emerald-300/80 border-l-[4px] border-l-emerald-500'
                    : 'border-orange-200/80 border-l-[4px] border-l-orange-500'
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <ShieldAlert
                  className={`h-5 w-5 ${active.emphasis === 'alert' ? 'text-rose-600' : 'text-orange-600'}`}
                  aria-hidden
                />
                <span className="font-display text-sm font-bold text-slate-800">{active.label}</span>
              </div>
              <p className="font-body text-base font-semibold text-slate-900 md:text-lg">{active.value}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {cards.map((card) => (
            <button
              key={`${card.label}-${card.index}`}
              type="button"
              onClick={() => toggle(card.index)}
              className={`min-h-[44px] rounded-xl border px-3 py-2 text-left text-xs font-bold transition-all ${
                card.index === activeIndex
                  ? 'border-orange-400 bg-orange-50 ring-2 ring-orange-200/60'
                  : 'border-slate-200/80 bg-white/80 hover:border-orange-200'
              }`}
            >
              {card.label}
            </button>
          ))}
        </div>

        {footerRule && (
          <p className="text-center font-body text-xs font-medium text-orange-900/70">{footerRule}</p>
        )}
      </div>
    </div>
  );
}

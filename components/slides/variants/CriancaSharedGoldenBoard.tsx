'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, Hand } from 'lucide-react';
import { SlideLucideIcon } from '../core/SlideLucideIcon';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import {
  inferCriancaIconName,
  isCriancaConclusionRow,
  isCriancaHotRow,
  type CriancaDomain,
} from '@/lib/slides/criancaSlideUtils';

interface CriancaBoardGoldenRuleProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
  domain: CriancaDomain;
}

function badgeClass(badge?: string): string {
  switch (badge) {
    case 'hot':
      return 'bg-cyan-200 text-cyan-900';
    case 'warn':
      return 'bg-amber-200 text-amber-900';
    case 'ok':
      return 'bg-emerald-200 text-emerald-900';
    default:
      return 'bg-slate-200 text-slate-700';
  }
}

export function CriancaBoardGoldenRule({ content, rows, theme, footerRule, domain }: CriancaBoardGoldenRuleProps) {
  const reduceMotion = useReducedMotion();
  const visibleRows = useMemo(
    () => rows.filter((row) => !isCriancaConclusionRow(row.label ?? '', row.value ?? '')),
    [rows],
  );
  const [expandedIndex, setExpandedIndex] = useState<number | null>(() => {
    const hotIdx = visibleRows.findIndex((row) => isCriancaHotRow(row.label ?? '', row.value ?? '', row.emphasis, row.badge));
    return hotIdx >= 0 ? hotIdx : null;
  });

  const toggle = useCallback((index: number) => {
    setExpandedIndex((c) => (c === index ? null : index));
  }, []);

  if (visibleRows.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-5">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-30`} />
      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col gap-4">
        {content ? (
          <h2 className="text-center font-display text-base font-black uppercase tracking-wide text-slate-900 md:text-lg">
            {content}
          </h2>
        ) : null}

        <div className="flex flex-col items-center gap-1.5 rounded-xl border border-cyan-200/80 bg-cyan-50/90 px-4 py-3 text-center">
          <p className="flex items-center justify-center gap-2 font-body text-sm font-semibold text-cyan-950">
            <Hand className="h-4 w-4 shrink-0 text-cyan-700" aria-hidden />
            Toque em cada linha da referência
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {visibleRows.map((row, index) => {
            const expanded = expandedIndex === index;
            const hot = isCriancaHotRow(row.label ?? '', row.value ?? '', row.emphasis, row.badge);
            const iconName = inferCriancaIconName(`${row.label} ${row.value}`, domain);

            return (
              <motion.button
                key={index}
                type="button"
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : index * 0.05 }}
                onClick={() => toggle(index)}
                aria-expanded={expanded}
                className={`w-full overflow-hidden rounded-[1.25rem] border text-left shadow-sm transition-all ${
                  hot
                    ? 'border-cyan-400/90 border-l-[4px] bg-gradient-to-br from-cyan-50/90 via-white to-teal-50/70 ring-2 ring-cyan-300/30'
                    : 'border-slate-200/70 border-l-[4px] border-l-cyan-300/70 bg-white/95'
                }`}
              >
                <div className="flex items-start gap-3 p-4">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${theme.iconBg} ${theme.iconText}`}>
                    <SlideLucideIcon name={iconName} className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-xs font-extrabold uppercase tracking-wide text-cyan-950">{row.label}</span>
                      {row.badge ? (
                        <span className={`rounded-full px-2 py-0.5 font-mono text-[8px] font-bold uppercase ${badgeClass(row.badge)}`}>
                          {row.badge}
                        </span>
                      ) : null}
                    </div>
                    <p className={`mt-1 font-body text-sm leading-relaxed text-slate-700 ${expanded ? '' : 'line-clamp-2'}`}>
                      {row.value}
                    </p>
                    {!expanded ? <ChevronDown className="mt-1 h-3 w-3 text-slate-400" aria-hidden /> : null}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {footerRule ? (
          <p className={`rounded-xl border px-4 py-3 text-center font-body text-sm italic ${theme.borderColor} ${theme.iconBg} ${theme.textSecondary}`}>
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}

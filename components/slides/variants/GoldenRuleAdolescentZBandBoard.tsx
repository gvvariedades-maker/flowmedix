'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import {
  inferZBandId,
  zBandRailPosition,
  Z_RAIL_MARKERS,
} from '@/lib/slides/adolescentAntropometriaSlideUtils';

interface GoldenRuleAdolescentZBandBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

function badgeClass(badge?: string): string {
  switch (badge) {
    case 'hot':
      return 'bg-sky-200 text-sky-900';
    case 'warn':
      return 'bg-amber-200 text-amber-900';
    case 'ok':
      return 'bg-emerald-200 text-emerald-900';
    default:
      return 'bg-slate-200 text-slate-700';
  }
}

export function GoldenRuleAdolescentZBandBoard({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRuleAdolescentZBandBoardProps) {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const enriched = useMemo(
    () =>
      rows.map((row, index) => ({
        row,
        index,
        band: inferZBandId(row.label ?? '', row.value ?? ''),
        position: zBandRailPosition(inferZBandId(row.label ?? '', row.value ?? '')),
      })),
    [rows],
  );

  const activePosition = activeIndex != null ? enriched[activeIndex]?.position : null;

  const toggle = useCallback((index: number) => {
    setActiveIndex((current) => (current === index ? null : index));
  }, []);

  if (rows.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-5">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-30`} />

      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col gap-4">
        {content ? (
          <h2 className="text-center font-display text-base font-black uppercase tracking-wide text-slate-900 md:text-lg">
            {content}
          </h2>
        ) : null}

        <div className="overflow-x-auto rounded-2xl border border-sky-200/80 bg-white/90 p-3 shadow-sm">
          <div className="min-w-[280px]">
            <div className="relative mb-3 flex h-10 items-center justify-between px-1">
              <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-sky-200" />
              {Z_RAIL_MARKERS.map((marker) => {
                const lit =
                  activePosition != null && Math.abs(activePosition - marker) < 1.2;
                return (
                  <div
                    key={marker}
                    className={`relative z-10 h-3 w-3 rounded-full transition-all ${
                      lit ? 'scale-150 bg-sky-500 ring-2 ring-sky-300' : 'bg-slate-300'
                    }`}
                  />
                );
              })}
            </div>

            <div className="flex flex-col gap-2">
              {enriched.map(({ row, index }) => {
                const active = activeIndex === index;
                const highlighted = row.emphasis === 'highlight';

                return (
                  <motion.button
                    key={index}
                    type="button"
                    initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: reduceMotion ? 0 : index * 0.04 }}
                    onClick={() => toggle(index)}
                    className={`flex min-h-[44px] w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition-all ${
                      active || highlighted
                        ? 'border-sky-400 bg-sky-50 ring-2 ring-sky-300/50'
                        : 'border-slate-200/80 bg-slate-50/80 hover:bg-white'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-display text-sm font-bold text-slate-900">{row.label}</p>
                      <p className="font-mono text-xs font-semibold tabular-nums text-slate-700">{row.value}</p>
                    </div>
                    {row.badge ? (
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase ${badgeClass(row.badge)}`}
                      >
                        {row.badge}
                      </span>
                    ) : null}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {footerRule ? (
          <p className="text-center font-body text-xs font-semibold text-sky-900">{footerRule}</p>
        ) : null}
      </div>
    </div>
  );
}

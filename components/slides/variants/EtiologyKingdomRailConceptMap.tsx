'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import {
  ETIOLOGY_KINGDOM_SLOTS,
  etiologyKingdomLabel,
  inferEtiologyKingdom,
  type EtiologyKingdom,
} from '@/lib/slides/etiologySlideUtils';

export interface EtiologyConcept {
  icon: string;
  title: string;
  description: string;
}

const KINGDOM_STYLE: Record<
  EtiologyKingdom,
  { bar: string; active: string; text: string; soft: string }
> = {
  bacteria: {
    bar: 'bg-emerald-500',
    active: 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300/50',
    text: 'text-emerald-950',
    soft: 'bg-emerald-100/80',
  },
  virus: {
    bar: 'bg-rose-500',
    active: 'border-rose-500 bg-rose-50 ring-2 ring-rose-300/50',
    text: 'text-rose-950',
    soft: 'bg-rose-100/80',
  },
  protozoan: {
    bar: 'bg-amber-500',
    active: 'border-amber-500 bg-amber-50 ring-2 ring-amber-300/50',
    text: 'text-amber-950',
    soft: 'bg-amber-100/80',
  },
  fungus: {
    bar: 'bg-violet-500',
    active: 'border-violet-500 bg-violet-50 ring-2 ring-violet-300/50',
    text: 'text-violet-950',
    soft: 'bg-violet-100/80',
  },
  command: {
    bar: 'bg-orange-500',
    active: 'border-orange-500 bg-orange-50 ring-2 ring-orange-300/50',
    text: 'text-orange-950',
    soft: 'bg-orange-100/80',
  },
  pattern: {
    bar: 'bg-sky-500',
    active: 'border-sky-500 bg-sky-50 ring-2 ring-sky-300/50',
    text: 'text-sky-950',
    soft: 'bg-sky-100/80',
  },
  general: {
    bar: 'bg-slate-400',
    active: 'border-slate-400 bg-slate-50 ring-2 ring-slate-300/40',
    text: 'text-slate-800',
    soft: 'bg-slate-100/80',
  },
};

interface EtiologyKingdomRailConceptMapProps {
  concepts: EtiologyConcept[];
  theme: ThemeColors;
}

export function EtiologyKingdomRailConceptMap({
  concepts,
  theme,
}: EtiologyKingdomRailConceptMapProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const enriched = useMemo(
    () =>
      concepts.map((c) => ({
        ...c,
        kingdom: inferEtiologyKingdom(c.title, c.description),
      })),
    [concepts],
  );

  const active = enriched[activeIndex];
  const activeStyle = KINGDOM_STYLE[active?.kingdom ?? 'general'];

  const toggle = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  if (concepts.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-3">
        {/* Trilho dos 4 reinos */}
        <div className="grid grid-cols-4 gap-1.5 rounded-2xl border border-orange-200/70 bg-white/70 p-2 shadow-sm md:gap-2 md:p-3">
          {ETIOLOGY_KINGDOM_SLOTS.map((slot) => {
            const isActive = active?.kingdom === slot;
            const style = KINGDOM_STYLE[slot];
            const count = enriched.filter((e) => e.kingdom === slot).length;
            return (
              <div
                key={slot}
                className={`flex flex-col items-center gap-1 rounded-xl border px-1 py-2 transition-all duration-300 md:px-2 ${
                  isActive ? style.active : 'border-transparent bg-white/50 opacity-70'
                }`}
              >
                <div className={`h-1.5 w-full rounded-full ${style.bar}`} />
                <span className={`font-mono text-[8px] font-black uppercase tracking-wide md:text-[9px] ${style.text}`}>
                  {etiologyKingdomLabel(slot)}
                </span>
                <span className="font-mono text-[9px] text-slate-500">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Painel do conceito ativo */}
        <AnimatePresence mode="wait">
          {active && (
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={`rounded-2xl border-l-[4px] bg-gradient-to-br from-white via-white to-orange-50/30 p-4 shadow-md ${activeStyle.active}`}
            >
              <div className="mb-2 flex items-center gap-2">
                {(() => {
                  const Icon = resolveLucideIcon(active.icon);
                  return (
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${activeStyle.soft}`}>
                      <Icon className={`h-5 w-5 ${activeStyle.text}`} aria-hidden />
                    </span>
                  );
                })()}
                <span
                  className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${activeStyle.soft} ${activeStyle.text}`}
                >
                  {etiologyKingdomLabel(active.kingdom)}
                </span>
              </div>
              <h3 className={`font-display text-base font-black md:text-lg ${activeStyle.text}`}>
                {active.title}
              </h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-slate-700">{active.description}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chips — toque para trocar */}
        <div className="flex flex-wrap gap-2">
          {enriched.map((item, index) => {
            const style = KINGDOM_STYLE[item.kingdom];
            const Icon = resolveLucideIcon(item.icon);
            const selected = index === activeIndex;
            return (
              <button
                key={`${item.title}-${index}`}
                type="button"
                onClick={() => toggle(index)}
                className={`flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-xl border px-3 py-2 text-left transition-all ${
                  selected
                    ? `${style.active} scale-[1.02]`
                    : 'border-slate-200/80 bg-white/80 hover:border-orange-200'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${selected ? style.text : 'text-slate-500'}`} aria-hidden />
                <span className={`max-w-[120px] truncate text-xs font-bold ${selected ? style.text : 'text-slate-700'}`}>
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

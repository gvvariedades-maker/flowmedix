'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import {
  ITU_BUNDLE_RAIL_SLOTS,
  inferItuBundleSlot,
  ituBundleSlotLabel,
  type ItuBundleSlot,
} from '@/lib/slides/ituCateterSlideUtils';

export interface ItuBundleConcept {
  icon: string;
  title: string;
  description: string;
}

const SLOT_STYLE: Record<
  ItuBundleSlot,
  { bar: string; active: string; text: string; soft: string }
> = {
  iras: {
    bar: 'bg-lime-500',
    active: 'border-lime-500 bg-lime-50 ring-2 ring-lime-300/50',
    text: 'text-lime-950',
    soft: 'bg-lime-100/80',
  },
  meato: {
    bar: 'bg-teal-500',
    active: 'border-teal-500 bg-teal-50 ring-2 ring-teal-300/50',
    text: 'text-teal-950',
    soft: 'bg-teal-100/80',
  },
  fluxo: {
    bar: 'bg-cyan-500',
    active: 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-300/50',
    text: 'text-cyan-950',
    soft: 'bg-cyan-100/80',
  },
  fechado: {
    bar: 'bg-emerald-500',
    active: 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300/50',
    text: 'text-emerald-950',
    soft: 'bg-emerald-100/80',
  },
  posicao: {
    bar: 'bg-sky-500',
    active: 'border-sky-500 bg-sky-50 ring-2 ring-sky-300/50',
    text: 'text-sky-950',
    soft: 'bg-sky-100/80',
  },
  exceto: {
    bar: 'bg-rose-500',
    active: 'border-rose-500 bg-rose-50 ring-2 ring-rose-300/50',
    text: 'text-rose-950',
    soft: 'bg-rose-100/80',
  },
  comando: {
    bar: 'bg-amber-500',
    active: 'border-amber-500 bg-amber-50 ring-2 ring-amber-300/50',
    text: 'text-amber-950',
    soft: 'bg-amber-100/80',
  },
  gabarito: {
    bar: 'bg-orange-500',
    active: 'border-orange-500 bg-orange-50 ring-2 ring-orange-300/50',
    text: 'text-orange-950',
    soft: 'bg-orange-100/80',
  },
  geral: {
    bar: 'bg-slate-400',
    active: 'border-slate-400 bg-slate-50 ring-2 ring-slate-300/40',
    text: 'text-slate-800',
    soft: 'bg-slate-100/80',
  },
};

interface ItuClosedSystemRailConceptMapProps {
  concepts: ItuBundleConcept[];
  theme: ThemeColors;
}

export function ItuClosedSystemRailConceptMap({
  concepts,
  theme,
}: ItuClosedSystemRailConceptMapProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const enriched = useMemo(
    () =>
      concepts.map((c) => ({
        ...c,
        slot: inferItuBundleSlot(c.title, c.description),
      })),
    [concepts],
  );

  const active = enriched[activeIndex];
  const activeStyle = SLOT_STYLE[active?.slot ?? 'geral'];

  const toggle = useCallback((index: number) => setActiveIndex(index), []);

  const selectBySlot = useCallback(
    (slot: ItuBundleSlot) => {
      const idx = enriched.findIndex((e) => e.slot === slot);
      if (idx >= 0) setActiveIndex(idx);
    },
    [enriched],
  );

  if (concepts.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex items-center justify-center gap-2 rounded-xl border border-lime-200/80 bg-lime-50/90 px-3 py-2">
          <Hand className="h-4 w-4 shrink-0 text-lime-700 animate-pulse" aria-hidden />
          <p className="font-mono text-[10px] font-bold uppercase tracking-wide text-lime-900 md:text-[11px]">
            Toque nos chips ou no trilho para ver cada cuidado
          </p>
        </div>

        {/* Trilho do bundle fechado */}
        <div className="rounded-2xl border border-lime-200/70 bg-white/75 p-2 shadow-sm md:p-3">
          <p className="mb-2 text-center font-mono text-[9px] font-bold uppercase tracking-widest text-lime-800/80">
            Cadeia fechada — prevenção de ITU
          </p>
          <div className="grid grid-cols-4 gap-1.5 md:gap-2">
            {ITU_BUNDLE_RAIL_SLOTS.map((slot) => {
              const isActive = active?.slot === slot;
              const style = SLOT_STYLE[slot];
              const count = enriched.filter((e) => e.slot === slot).length;
              const isBroken = enriched.some((e) => e.slot === 'exceto') && slot === 'fechado';
              const hasItem = count > 0;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => hasItem && selectBySlot(slot)}
                  disabled={!hasItem}
                  aria-label={`Ver cuidado: ${ituBundleSlotLabel(slot)}`}
                  aria-pressed={isActive}
                  className={`flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-xl border px-1 py-2 transition-all duration-300 md:px-2 ${
                    isActive
                      ? `${style.active} ring-2 ring-offset-1`
                      : isBroken
                        ? 'border-rose-300/60 bg-rose-50/50 opacity-90'
                        : hasItem
                          ? 'border-transparent bg-white/50 opacity-75 hover:border-lime-300 hover:opacity-100'
                          : 'cursor-default border-transparent bg-white/30 opacity-40'
                  }`}
                >
                  <div className={`h-1.5 w-full rounded-full ${isBroken && !isActive ? 'bg-rose-400' : style.bar}`} />
                  <span className={`font-mono text-[8px] font-black uppercase tracking-wide md:text-[9px] ${style.text}`}>
                    {ituBundleSlotLabel(slot)}
                  </span>
                  <span className="font-mono text-[9px] text-slate-500">{count || '·'}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-2 hidden h-0.5 w-full rounded-full bg-gradient-to-r from-teal-300 via-emerald-400 to-sky-300 md:block" aria-hidden />
        </div>

        <AnimatePresence mode="wait">
          {active && (
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={`rounded-2xl border-l-[4px] bg-gradient-to-br from-white via-white to-lime-50/30 p-4 shadow-md ${activeStyle.active}`}
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
                  {ituBundleSlotLabel(active.slot)}
                </span>
              </div>
              <h3 className={`font-display text-base font-black md:text-lg ${activeStyle.text}`}>
                {active.title}
              </h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-slate-700">{active.description}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap gap-2">
          <p className="w-full text-center font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
            Chips — toque para abrir
          </p>
          {enriched.map((item, index) => {
            const style = SLOT_STYLE[item.slot];
            const Icon = resolveLucideIcon(item.icon);
            const selected = index === activeIndex;
            return (
              <button
                key={`${item.title}-${index}`}
                type="button"
                onClick={() => toggle(index)}
                aria-pressed={selected}
                aria-label={`Ver: ${item.title}`}
                className={`relative flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-xl border px-3 py-2 text-left transition-all ${
                  selected
                    ? `${style.active} scale-[1.02]`
                    : 'border-slate-200/80 bg-white/80 hover:border-lime-300 hover:shadow-sm animate-pulse'
                }`}
              >
                {!selected && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-lime-500 text-white shadow-sm">
                    <Hand className="h-2.5 w-2.5" aria-hidden />
                  </span>
                )}
                <Icon className={`h-4 w-4 shrink-0 ${selected ? style.text : 'text-slate-500'}`} aria-hidden />
                <span className={`max-w-[130px] truncate text-xs font-bold ${selected ? style.text : 'text-slate-700'}`}>
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

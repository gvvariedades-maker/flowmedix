'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Syringe } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import {
  EV_STATION_ORDER,
  evStationSlotLabel,
  inferEvStationSlot,
  type EvStationSlot,
} from '@/lib/slides/farmacoClinicoProtocolSlideUtils';

export interface EvStationConcept {
  icon: string;
  title: string;
  description: string;
}

const SLOT_BORDER: Record<EvStationSlot, string> = {
  preparo: 'border-l-violet-500',
  classe: 'border-l-purple-500',
  cenario: 'border-l-indigo-500',
  diluicao: 'border-l-fuchsia-500',
  via: 'border-l-violet-600',
  tempo: 'border-l-purple-600',
  monitor: 'border-l-emerald-500',
  geral: 'border-l-slate-400',
};

const SLOT_ORDER_INDEX: Record<EvStationSlot, number> = Object.fromEntries(
  EV_STATION_ORDER.map((slot, index) => [slot, index]),
) as Record<EvStationSlot, number>;

interface InfusaoEvStationDeckConceptMapProps {
  concepts: EvStationConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function InfusaoEvStationDeckConceptMap({
  concepts,
  theme,
  footerRule,
}: InfusaoEvStationDeckConceptMapProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const toggle = useCallback((i: number) => setExpandedIndex((c) => (c === i ? null : i)), []);

  const sortedConcepts = useMemo(() => {
    return [...concepts]
      .map((concept, originalIndex) => ({
        concept,
        originalIndex,
        slot: inferEvStationSlot(concept.title, concept.description),
      }))
      .sort(
        (a, b) =>
          (SLOT_ORDER_INDEX[a.slot] ?? 99) - (SLOT_ORDER_INDEX[b.slot] ?? 99) ||
          a.originalIndex - b.originalIndex,
      );
  }, [concepts]);

  if (sortedConcepts.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />
      <div className="relative z-10 mb-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-violet-900 shadow-sm">
          <Syringe className="h-3 w-3" aria-hidden />
          Estações — infusão EV
        </span>
      </div>
      <div className="relative z-10 flex snap-y snap-mandatory flex-col gap-2">
        {sortedConcepts.map(({ concept, slot }, index) => {
          const Icon = resolveLucideIcon(concept.icon);
          const expanded = expandedIndex === index;
          return (
            <button
              key={`${concept.title}-${index}`}
              type="button"
              onClick={() => toggle(index)}
              aria-expanded={expanded}
              className={`snap-start rounded-xl border border-slate-200/80 border-l-4 bg-white/90 p-3 text-left shadow-sm transition-all ${SLOT_BORDER[slot]} ${
                expanded ? 'ring-2 ring-violet-300/50' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  {Icon ? <Icon className="h-4 w-4 shrink-0 text-violet-700" aria-hidden /> : null}
                  <span className="font-mono text-[9px] font-bold uppercase text-violet-700">
                    {evStationSlotLabel(slot)}
                  </span>
                  <span className="truncate font-body text-sm font-bold text-slate-900">{concept.title}</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
                />
              </div>
              <AnimatePresence initial={false}>
                {expanded ? (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-2 overflow-hidden font-body text-sm leading-relaxed text-slate-600"
                  >
                    {concept.description}
                  </motion.p>
                ) : (
                  <p className="mt-1 line-clamp-2 font-body text-xs leading-relaxed text-slate-500">
                    {concept.description}
                  </p>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>
      {footerRule ? (
        <p className={`relative z-10 mt-3 rounded-xl border px-3 py-2 text-center text-sm italic ${theme.borderColor}`}>
          {footerRule}
        </p>
      ) : null}
    </div>
  );
}

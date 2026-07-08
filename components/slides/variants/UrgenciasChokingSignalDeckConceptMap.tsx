'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import {
  CHOKING_DECK_SLOTS,
  chokingDeckSlotLabel,
  inferChokingDeckSlot,
  type ChokingDeckSlot,
} from '@/lib/slides/urgenciasEngasgoSlideUtils';

export interface ChokingSignalConcept {
  icon: string;
  title: string;
  description: string;
}

const SLOT_META: Record<
  ChokingDeckSlot,
  { badge: string; badgeText: string; border: string; ring: string }
> = {
  sinal: {
    badge: 'bg-cyan-100/90',
    badgeText: 'text-cyan-900',
    border: 'border-l-cyan-500/90',
    ring: 'ring-cyan-400/30',
  },
  heimlich: {
    badge: 'bg-sky-100/90',
    badgeText: 'text-sky-900',
    border: 'border-l-sky-400/80',
    ring: 'ring-sky-300/30',
  },
  ovace: {
    badge: 'bg-blue-100/90',
    badgeText: 'text-blue-900',
    border: 'border-l-blue-400/80',
    ring: 'ring-blue-300/30',
  },
  inconsciente: {
    badge: 'bg-rose-100/90',
    badgeText: 'text-rose-900',
    border: 'border-l-rose-400/80',
    ring: 'ring-rose-300/30',
  },
  lactente: {
    badge: 'bg-teal-100/90',
    badgeText: 'text-teal-900',
    border: 'border-l-teal-400/80',
    ring: 'ring-teal-300/30',
  },
  alerta: {
    badge: 'bg-amber-100/90',
    badgeText: 'text-amber-900',
    border: 'border-l-amber-500/80',
    ring: 'ring-amber-400/35',
  },
  geral: {
    badge: 'bg-slate-100/90',
    badgeText: 'text-slate-800',
    border: 'border-l-slate-400/70',
    ring: 'ring-slate-300/25',
  },
};

interface UrgenciasChokingSignalDeckConceptMapProps {
  concepts: ChokingSignalConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function UrgenciasChokingSignalDeckConceptMap({
  concepts,
  theme,
  footerRule,
}: UrgenciasChokingSignalDeckConceptMapProps) {
  const [activeSlot, setActiveSlot] = useState<ChokingDeckSlot | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const grouped = useMemo(() => {
    const bySlot = new Map<ChokingDeckSlot, ChokingSignalConcept[]>();
    for (const concept of concepts) {
      const slot = inferChokingDeckSlot(concept.title, concept.description);
      const list = bySlot.get(slot) ?? [];
      list.push(concept);
      bySlot.set(slot, list);
    }
    return bySlot;
  }, [concepts]);

  const slotsOnDeck = CHOKING_DECK_SLOTS.filter((s) => grouped.has(s));
  const defaultSlot =
    activeSlot ??
    slotsOnDeck.find((s) => s === 'sinal') ??
    slotsOnDeck[0] ??
    inferChokingDeckSlot(concepts[0]?.title ?? '', concepts[0]?.description ?? '');

  const visibleConcepts = grouped.get(defaultSlot) ?? concepts;

  const toggleSlot = useCallback((slot: ChokingDeckSlot) => {
    setActiveSlot((current) => (current === slot ? null : slot));
    setExpandedIndex(null);
  }, []);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  }, []);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 mb-3 px-1">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-cyan-900 shadow-sm">
          <Wind className="h-3 w-3" aria-hidden />
          Choking Signal Deck
        </span>
      </div>

      {slotsOnDeck.length > 1 ? (
        <div className="relative z-10 mb-3 flex flex-wrap gap-2 px-1">
          {slotsOnDeck.map((slot) => {
            const meta = SLOT_META[slot];
            const isActive = defaultSlot === slot;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => toggleSlot(slot)}
                className={`rounded-full px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-widest transition-all ${
                  isActive
                    ? `${meta.badge} ${meta.badgeText} ring-2 ${meta.ring}`
                    : 'bg-white/80 text-slate-500 hover:bg-white'
                }`}
              >
                {chokingDeckSlotLabel(slot)}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="relative z-10 flex flex-col gap-3">
        {visibleConcepts.map((concept, index) => {
          const Icon = resolveLucideIcon(concept.icon);
          const expanded = expandedIndex === index;
          const slot = inferChokingDeckSlot(concept.title, concept.description);
          const meta = SLOT_META[slot];

          return (
            <motion.button
              key={`${defaultSlot}-${index}`}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.07 * index }}
              onClick={() => toggleExpanded(index)}
              aria-expanded={expanded}
              className={`overflow-hidden rounded-[1.25rem] border border-cyan-200/70 border-l-[3px] ${meta.border} bg-gradient-to-br from-white via-cyan-50/40 to-sky-50/70 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                expanded ? `ring-2 ${meta.ring}` : ''
              }`}
            >
              <div className="flex flex-col gap-2.5 p-4 md:p-5">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText}`}
                  >
                    <Icon size={20} />
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${meta.badge} ${meta.badgeText}`}
                  >
                    {chokingDeckSlotLabel(slot)}
                  </span>
                </div>
                <h4 className={`font-display text-sm font-extrabold uppercase tracking-wide ${theme.textPrimary}`}>
                  {concept.title}
                </h4>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={expanded ? 'open' : 'closed'}
                    animate={{ opacity: 1 }}
                    className={`font-body text-sm leading-relaxed ${theme.textSecondary} ${
                      expanded ? '' : 'line-clamp-3'
                    }`}
                  >
                    {concept.description}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.button>
          );
        })}
      </div>

      {footerRule ? (
        <p
          className={`relative z-10 mt-3 rounded-xl border px-4 py-3 text-center font-body text-sm font-medium italic leading-relaxed ${theme.borderColor} bg-white/80 ${theme.textSecondary}`}
        >
          {footerRule}
        </p>
      ) : null}
    </div>
  );
}

'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import {
  inferShockDeckSlot,
  shockDeckSlotLabel,
  SHOCK_DECK_SLOTS,
  type ShockDeckSlot,
} from '@/lib/slides/urgenciasChoqueSlideUtils';

export interface ShockTypeConcept {
  icon: string;
  title: string;
  description: string;
}

const SLOT_META: Record<
  ShockDeckSlot,
  { badge: string; badgeText: string; border: string; ring: string }
> = {
  seguranca: {
    badge: 'bg-amber-100/90',
    badgeText: 'text-amber-900',
    border: 'border-l-amber-500/90',
    ring: 'ring-amber-400/30',
  },
  eletrico: {
    badge: 'bg-yellow-100/90',
    badgeText: 'text-yellow-900',
    border: 'border-l-yellow-500/90',
    ring: 'ring-yellow-400/30',
  },
  hipovolemico: {
    badge: 'bg-rose-100/90',
    badgeText: 'text-rose-900',
    border: 'border-l-rose-400/80',
    ring: 'ring-rose-300/30',
  },
  cardiogenico: {
    badge: 'bg-red-100/90',
    badgeText: 'text-red-900',
    border: 'border-l-red-400/80',
    ring: 'ring-red-300/30',
  },
  distributivo: {
    badge: 'bg-orange-100/90',
    badgeText: 'text-orange-900',
    border: 'border-l-orange-400/80',
    ring: 'ring-orange-300/30',
  },
  alerta: {
    badge: 'bg-slate-100/90',
    badgeText: 'text-slate-800',
    border: 'border-l-slate-500/80',
    ring: 'ring-slate-400/35',
  },
  geral: {
    badge: 'bg-slate-100/90',
    badgeText: 'text-slate-800',
    border: 'border-l-slate-400/70',
    ring: 'ring-slate-300/25',
  },
};

interface UrgenciasShockTypesDeckConceptMapProps {
  concepts: ShockTypeConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function UrgenciasShockTypesDeckConceptMap({
  concepts,
  theme,
  footerRule,
}: UrgenciasShockTypesDeckConceptMapProps) {
  const [activeSlot, setActiveSlot] = useState<ShockDeckSlot | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const grouped = useMemo(() => {
    const bySlot = new Map<ShockDeckSlot, ShockTypeConcept[]>();
    for (const concept of concepts) {
      const slot = inferShockDeckSlot(concept.title, concept.description);
      const list = bySlot.get(slot) ?? [];
      list.push(concept);
      bySlot.set(slot, list);
    }
    return bySlot;
  }, [concepts]);

  const slotsOnDeck = SHOCK_DECK_SLOTS.filter((s) => grouped.has(s));
  const defaultSlot =
    activeSlot ??
    slotsOnDeck.find((s) => s === 'seguranca') ??
    slotsOnDeck[0] ??
    inferShockDeckSlot(concepts[0]?.title ?? '', concepts[0]?.description ?? '');

  const visibleConcepts = grouped.get(defaultSlot) ?? concepts;

  const toggleSlot = useCallback((slot: ShockDeckSlot) => {
    setActiveSlot((current) => (current === slot ? null : slot));
    setExpandedIndex(null);
  }, []);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  }, []);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 mb-3 flex items-center justify-between gap-2 px-1">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-amber-900 shadow-sm">
          <Zap className="h-3 w-3" aria-hidden />
          Shock Types Deck
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
                {shockDeckSlotLabel(slot)}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="relative z-10 flex flex-col gap-3">
        {visibleConcepts.map((concept, index) => {
          const Icon = resolveLucideIcon(concept.icon);
          const expanded = expandedIndex === index;
          const slot = inferShockDeckSlot(concept.title, concept.description);
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
              className={`overflow-hidden rounded-[1.25rem] border border-amber-200/70 border-l-[3px] ${meta.border} bg-gradient-to-br from-white via-amber-50/40 to-yellow-50/70 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                expanded ? `ring-2 ${meta.ring}` : ''
              }`}
            >
              <div className="flex h-full flex-col gap-2.5 p-4 md:p-5">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText}`}
                  >
                    <Icon size={20} />
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${meta.badge} ${meta.badgeText}`}
                  >
                    {shockDeckSlotLabel(slot)}
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

'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ChevronDown } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { SlideLucideIcon } from '../core/SlideLucideIcon';
import {
  inferPeriSrpaSlot,
  periSrpaSlotLabel,
  PERI_SRPA_SLOTS,
  type PeriSrpaSlot,
} from '@/lib/slides/perioperatoriaSlideUtils';

export interface PeriSrpaDeckConcept {
  icon: string;
  title: string;
  description: string;
}

const SLOT_META: Record<
  PeriSrpaSlot,
  { border: string; badge: string; badgeText: string; ring: string }
> = {
  admission: {
    border: 'border-l-violet-500/90',
    badge: 'bg-violet-100/90',
    badgeText: 'text-violet-900',
    ring: 'ring-violet-400/35',
  },
  monitoring: {
    border: 'border-l-fuchsia-500/90',
    badge: 'bg-fuchsia-100/90',
    badgeText: 'text-fuchsia-900',
    ring: 'ring-fuchsia-400/35',
  },
  aldrete: {
    border: 'border-l-purple-500/90',
    badge: 'bg-purple-100/90',
    badgeText: 'text-purple-900',
    ring: 'ring-purple-400/35',
  },
  analgesia: {
    border: 'border-l-indigo-500/90',
    badge: 'bg-indigo-100/90',
    badgeText: 'text-indigo-900',
    ring: 'ring-indigo-400/35',
  },
  exceto: {
    border: 'border-l-rose-500/90',
    badge: 'bg-rose-100/90',
    badgeText: 'text-rose-900',
    ring: 'ring-rose-400/35',
  },
  geral: {
    border: 'border-l-slate-400/80',
    badge: 'bg-slate-100/90',
    badgeText: 'text-slate-800',
    ring: 'ring-slate-300/30',
  },
};

interface PeriSrpaMonitorDeckConceptMapProps {
  concepts: PeriSrpaDeckConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function PeriSrpaMonitorDeckConceptMap({
  concepts,
  theme,
  footerRule,
}: PeriSrpaMonitorDeckConceptMapProps) {
  const [activeSlots, setActiveSlots] = useState<Set<PeriSrpaSlot>>(() => new Set(['admission']));
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const mapped = useMemo(
    () =>
      concepts.map((concept) => ({
        concept,
        slot: inferPeriSrpaSlot(concept.title, concept.description),
      })),
    [concepts],
  );

  const toggleSlot = useCallback((slot: PeriSrpaSlot) => {
    setActiveSlots((prev) => {
      const next = new Set(prev);
      if (next.has(slot)) next.delete(slot);
      else next.add(slot);
      return next;
    });
  }, []);

  if (concepts.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 mb-3 flex flex-col gap-2">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-violet-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-violet-800">
          <Activity className="h-3 w-3" aria-hidden />
          Trilho SRPA
        </span>
        <div
          className="flex flex-wrap items-center justify-center gap-1 rounded-xl border border-violet-200/80 bg-violet-50/60 px-2 py-2"
          role="tablist"
          aria-label="Slots SRPA"
        >
          {PERI_SRPA_SLOTS.map((slot) => {
            const meta = SLOT_META[slot];
            const active = activeSlots.has(slot);
            return (
              <button
                key={slot}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => toggleSlot(slot)}
                className={`rounded-full px-2 py-1 font-mono text-[9px] font-black transition-all ${
                  active
                    ? `${meta.badge} ${meta.badgeText} ring-2 ${meta.ring}`
                    : 'bg-white/40 text-slate-400 opacity-70'
                }`}
              >
                {periSrpaSlotLabel(slot)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-2">
        {mapped.map(({ concept, slot }, index) => {
          const meta = SLOT_META[slot];
          const expanded = expandedIndex === index;
          const dimmed = slot !== 'geral' && !activeSlots.has(slot);
          const isFocus = slot === 'aldrete' || slot === 'exceto';

          return (
            <motion.button
              key={index}
              type="button"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: dimmed ? 0.4 : 1, x: 0 }}
              transition={{ delay: 0.04 * index }}
              onClick={() => setExpandedIndex(expanded ? null : index)}
              aria-expanded={expanded}
              className={`w-full overflow-hidden rounded-[1.25rem] border text-left shadow-sm transition-all ${meta.border} border-l-[4px] ${
                expanded ? `ring-2 ${meta.ring}` : ''
              } ${isFocus ? 'bg-gradient-to-br from-violet-50/90 via-white to-fuchsia-50/70' : dimmed ? 'bg-white/60' : 'bg-white/95 hover:-translate-y-0.5 hover:shadow-md'}`}
            >
              <div className="flex flex-col gap-2 p-4">
                <div className="flex items-start gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.badge}`}>
                    <SlideLucideIcon name={concept.icon} className={`h-5 w-5 ${meta.badgeText}`} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <span
                      className={`mb-1 inline-block rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${meta.badge} ${meta.badgeText}`}
                    >
                      {periSrpaSlotLabel(slot)}
                    </span>
                    <p className={`font-display text-sm font-bold leading-snug ${meta.badgeText}`}>{concept.title}</p>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
                  />
                </div>
                <AnimatePresence initial={false}>
                  {expanded ? (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-left text-sm leading-relaxed text-slate-700"
                    >
                      {concept.description}
                    </motion.p>
                  ) : (
                    <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">{concept.description}</p>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>
          );
        })}
      </div>

      {footerRule ? (
        <p className="relative z-10 mt-3 text-center text-xs font-medium text-violet-800/80">{footerRule}</p>
      ) : null}
    </div>
  );
}

'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, ChevronDown } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { SlideLucideIcon } from '../core/SlideLucideIcon';
import {
  inferPeriProtocolSlot,
  periProtocolSlotLabel,
  PERI_PROTOCOL_WHO,
  type PeriProtocolSlot,
} from '@/lib/slides/perioperatoriaSlideUtils';

export interface PeriProtocolDeckConcept {
  icon: string;
  title: string;
  description: string;
}

const PROTOCOL_RAIL: PeriProtocolSlot[] = [...PERI_PROTOCOL_WHO, 'cdc', 'assepsia'];

const SLOT_META: Record<
  PeriProtocolSlot,
  { border: string; badge: string; badgeText: string; ring: string }
> = {
  signin: {
    border: 'border-l-violet-500/90',
    badge: 'bg-violet-100/90',
    badgeText: 'text-violet-900',
    ring: 'ring-violet-400/35',
  },
  timeout: {
    border: 'border-l-fuchsia-500/90',
    badge: 'bg-fuchsia-100/90',
    badgeText: 'text-fuchsia-900',
    ring: 'ring-fuchsia-400/35',
  },
  signout: {
    border: 'border-l-purple-500/90',
    badge: 'bg-purple-100/90',
    badgeText: 'text-purple-900',
    ring: 'ring-purple-400/35',
  },
  cdc: {
    border: 'border-l-indigo-500/90',
    badge: 'bg-indigo-100/90',
    badgeText: 'text-indigo-900',
    ring: 'ring-indigo-400/35',
  },
  assepsia: {
    border: 'border-l-sky-500/90',
    badge: 'bg-sky-100/90',
    badgeText: 'text-sky-900',
    ring: 'ring-sky-400/35',
  },
  geral: {
    border: 'border-l-slate-400/80',
    badge: 'bg-slate-100/90',
    badgeText: 'text-slate-800',
    ring: 'ring-slate-300/30',
  },
};

interface PeriProtocolChecklistDeckConceptMapProps {
  concepts: PeriProtocolDeckConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function PeriProtocolChecklistDeckConceptMap({
  concepts,
  theme,
  footerRule,
}: PeriProtocolChecklistDeckConceptMapProps) {
  const [activeSlots, setActiveSlots] = useState<Set<PeriProtocolSlot>>(() => new Set(['signin']));
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const mapped = useMemo(
    () =>
      concepts.map((concept) => ({
        concept,
        slot: inferPeriProtocolSlot(concept.title, concept.description),
      })),
    [concepts],
  );

  const toggleSlot = useCallback((slot: PeriProtocolSlot) => {
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
          <CheckSquare className="h-3 w-3" aria-hidden />
          WHO + CDC
        </span>
        <div
          className="flex flex-wrap items-center justify-center gap-1 rounded-xl border border-violet-200/80 bg-violet-50/60 px-2 py-2"
          role="tablist"
          aria-label="Protocolo cirúrgico"
        >
          {PROTOCOL_RAIL.map((slot) => {
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
                {periProtocolSlotLabel(slot)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {mapped.map(({ concept, slot }, index) => {
          const meta = SLOT_META[slot];
          const expanded = expandedIndex === index;
          const dimmed = slot !== 'geral' && !activeSlots.has(slot);
          const isFocus = slot === 'timeout' || slot === 'cdc';

          return (
            <motion.button
              key={index}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: dimmed ? 0.4 : 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              onClick={() => setExpandedIndex(expanded ? null : index)}
              aria-expanded={expanded}
              className={`overflow-hidden rounded-[1.25rem] border text-left shadow-sm transition-all ${meta.border} border-l-[4px] ${
                isFocus ? `ring-2 ${meta.ring} bg-gradient-to-br from-violet-50/80 via-white to-fuchsia-50/60` : 'bg-white/95'
              } ${dimmed ? 'opacity-50' : 'hover:-translate-y-0.5 hover:shadow-md'}`}
            >
              <div className="flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText}`}
                    >
                      <SlideLucideIcon name={concept.icon} size={20} />
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${meta.badge} ${meta.badgeText}`}
                    >
                      {periProtocolSlotLabel(slot)}
                    </span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
                  />
                </div>
                <h4 className={`font-body text-sm font-bold ${theme.textPrimary}`}>{concept.title}</h4>
                <AnimatePresence initial={false}>
                  <motion.p
                    key={expanded ? 'open' : 'closed'}
                    initial={{ opacity: 0.85 }}
                    animate={{ opacity: 1 }}
                    className={`font-body text-sm leading-relaxed ${theme.textSecondary} ${
                      expanded ? '' : 'line-clamp-2'
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
        <p className="relative z-10 mt-3 text-center text-xs font-medium text-violet-800/80">{footerRule}</p>
      ) : null}
    </div>
  );
}

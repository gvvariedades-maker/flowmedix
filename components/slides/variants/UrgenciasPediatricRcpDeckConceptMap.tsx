'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Baby } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import {
  inferPediatricRcpDeckSlot,
  pediatricRcpDeckSlotLabel,
  type PediatricRcpDeckSlot,
} from '@/lib/slides/urgenciasPediatricSlideUtils';

export interface PediatricRcpConcept {
  icon: string;
  title: string;
  description: string;
}

const SLOT_META: Record<
  PediatricRcpDeckSlot,
  { badge: string; badgeText: string; border: string; ring: string }
> = {
  proporcao: {
    badge: 'bg-pink-100/90',
    badgeText: 'text-pink-900',
    border: 'border-l-pink-500/90',
    ring: 'ring-pink-400/30',
  },
  profundidade: {
    badge: 'bg-rose-100/90',
    badgeText: 'text-rose-900',
    border: 'border-l-rose-400/80',
    ring: 'ring-rose-300/30',
  },
  frequencia: {
    badge: 'bg-fuchsia-100/90',
    badgeText: 'text-fuchsia-900',
    border: 'border-l-fuchsia-400/80',
    ring: 'ring-fuchsia-300/30',
  },
  retorno: {
    badge: 'bg-purple-100/90',
    badgeText: 'text-purple-900',
    border: 'border-l-purple-400/80',
    ring: 'ring-purple-300/30',
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

interface UrgenciasPediatricRcpDeckConceptMapProps {
  concepts: PediatricRcpConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function UrgenciasPediatricRcpDeckConceptMap({
  concepts,
  theme,
  footerRule,
}: UrgenciasPediatricRcpDeckConceptMapProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  }, []);

  if (concepts.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 mb-3 px-1">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-pink-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-pink-900 shadow-sm">
          <Baby className="h-3 w-3" aria-hidden />
          Pediatric RCP Deck
        </span>
      </div>

      <div className="relative z-10 flex flex-col gap-3 md:flex-row md:items-stretch md:gap-2">
        {concepts.map((concept, index) => {
          const Icon = resolveLucideIcon(concept.icon);
          const slot = inferPediatricRcpDeckSlot(concept.title, concept.description);
          const meta = SLOT_META[slot];
          const expanded = expandedIndex === index;

          return (
            <motion.button
              key={index}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.07 * index }}
              onClick={() => toggleExpanded(index)}
              aria-expanded={expanded}
              className={`min-w-0 flex-1 overflow-hidden rounded-[1.25rem] border border-pink-200/70 border-l-[3px] ${meta.border} bg-gradient-to-br from-white via-pink-50/40 to-rose-50/70 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
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
                    {pediatricRcpDeckSlotLabel(slot)}
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

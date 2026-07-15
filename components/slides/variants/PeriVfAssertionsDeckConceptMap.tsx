'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ListChecks } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import {
  inferPeriVfChip,
  inferPeriVfItem,
  periVfItemLabel,
  PERI_VF_ITEMS,
  type PeriVfItem,
} from '@/lib/slides/perioperatoriaSlideUtils';

export interface PeriVfDeckConcept {
  icon: string;
  title: string;
  description: string;
}

const ITEM_META: Record<
  PeriVfItem,
  { border: string; badge: string; badgeText: string; ring: string }
> = {
  I: {
    border: 'border-l-violet-500/90',
    badge: 'bg-violet-100/90',
    badgeText: 'text-violet-900',
    ring: 'ring-violet-400/35',
  },
  II: {
    border: 'border-l-fuchsia-500/90',
    badge: 'bg-fuchsia-100/90',
    badgeText: 'text-fuchsia-900',
    ring: 'ring-fuchsia-400/35',
  },
  III: {
    border: 'border-l-purple-500/90',
    badge: 'bg-purple-100/90',
    badgeText: 'text-purple-900',
    ring: 'ring-purple-400/35',
  },
  combo: {
    border: 'border-l-indigo-500/90',
    badge: 'bg-indigo-100/90',
    badgeText: 'text-indigo-900',
    ring: 'ring-indigo-400/35',
  },
  geral: {
    border: 'border-l-slate-400/80',
    badge: 'bg-slate-100/90',
    badgeText: 'text-slate-800',
    ring: 'ring-slate-300/30',
  },
};

function VfChip({ verdict }: { verdict: 'V' | 'F' }) {
  const isTrue = verdict === 'V';
  return (
    <span
      className={`shrink-0 rounded-lg px-2 py-1 font-display text-xs font-black tabular-nums ${
        isTrue ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
      }`}
    >
      {verdict}
    </span>
  );
}

interface PeriVfAssertionsDeckConceptMapProps {
  concepts: PeriVfDeckConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function PeriVfAssertionsDeckConceptMap({
  concepts,
  theme,
  footerRule,
}: PeriVfAssertionsDeckConceptMapProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [activeItems, setActiveItems] = useState<Set<PeriVfItem>>(() => new Set(PERI_VF_ITEMS));

  const toggleItem = useCallback((item: PeriVfItem) => {
    setActiveItems((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  }, []);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  }, []);

  if (concepts.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 mb-3 flex flex-col gap-2">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-violet-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-violet-800">
          <ListChecks className="h-3 w-3" aria-hidden />
          Julgamento V/F
        </span>
        <div
          className="flex flex-wrap items-center justify-center gap-1.5 rounded-xl border border-violet-200/80 bg-violet-50/60 px-2 py-2"
          role="tablist"
          aria-label="Itens I II III"
        >
          {PERI_VF_ITEMS.map((item) => {
            const meta = ITEM_META[item];
            const active = activeItems.has(item);
            return (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => toggleItem(item)}
                className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-black transition-all ${
                  active
                    ? `${meta.badge} ${meta.badgeText} ring-2 ${meta.ring}`
                    : 'bg-white/40 text-slate-400 opacity-70'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
        {concepts.map((concept, index) => {
          const item = inferPeriVfItem(concept.title, concept.description);
          const meta = ITEM_META[item];
          const Icon = resolveLucideIcon(concept.icon);
          const expanded = expandedIndex === index;
          const dimmed = item !== 'geral' && item !== 'combo' && !activeItems.has(item);
          const vfChip = inferPeriVfChip(concept.description) ?? inferPeriVfChip(concept.title);

          return (
            <motion.button
              key={index}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: dimmed ? 0.4 : 1, y: 0 }}
              transition={{ delay: 0.06 * index }}
              onClick={() => toggleExpanded(index)}
              aria-expanded={expanded}
              className={`overflow-hidden rounded-[1.25rem] border border-slate-200/70 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md border-l-[4px] ${meta.border} ${
                vfChip ? 'bg-gradient-to-br from-white via-violet-50/40 to-fuchsia-50/50' : 'bg-white/95'
              }`}
            >
              <div className="flex flex-col gap-2 p-4 md:p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText}`}
                    >
                      <Icon size={22} />
                    </div>
                    {vfChip ? <VfChip verdict={vfChip} /> : null}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${meta.badge} ${meta.badgeText}`}
                  >
                    {periVfItemLabel(item)}
                  </span>
                </div>
                <h4 className={`font-body text-base font-bold tracking-normal md:text-lg ${theme.textPrimary}`}>
                  {concept.title}
                </h4>
                <AnimatePresence mode="wait" initial={false}>
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
                {!expanded && concept.description.length > 64 ? (
                  <span className="inline-flex items-center gap-1 self-start rounded-full bg-violet-100 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-violet-700">
                    <ChevronDown className="h-2.5 w-2.5" aria-hidden />
                    expandir
                  </span>
                ) : null}
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

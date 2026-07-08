'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ClipboardList } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import {
  inferProtocolDeckSlot,
  inferVfChipFromText,
  protocolDeckSlotLabel,
  type ProtocolDeckSlot,
} from '@/lib/slides/urgenciasProtocolSlideUtils';

export interface ProtocolRuleConcept {
  icon: string;
  title: string;
  description: string;
}

const SLOT_META: Record<
  ProtocolDeckSlot,
  { label: string; border: string; badge: string; badgeText: string; ring: string }
> = {
  comando: {
    label: 'COMANDO',
    border: 'border-l-rose-500/90',
    badge: 'bg-rose-100/90',
    badgeText: 'text-rose-900',
    ring: 'ring-rose-400/25',
  },
  vf_item: {
    label: 'V/F',
    border: 'border-l-emerald-400/90',
    badge: 'bg-emerald-100/90',
    badgeText: 'text-emerald-800',
    ring: 'ring-emerald-400/25',
  },
  protocolo: {
    label: 'PROTOCOLO',
    border: 'border-l-cyan-400/90',
    badge: 'bg-cyan-100/90',
    badgeText: 'text-cyan-900',
    ring: 'ring-cyan-400/25',
  },
  conduta: {
    label: 'CONDUTA',
    border: 'border-l-amber-400/90',
    badge: 'bg-amber-100/90',
    badgeText: 'text-amber-900',
    ring: 'ring-amber-400/25',
  },
  pegadinha: {
    label: 'PEGADINHA',
    border: 'border-l-violet-400/90',
    badge: 'bg-violet-100/90',
    badgeText: 'text-violet-900',
    ring: 'ring-violet-400/25',
  },
  geral: {
    label: 'URGÊNCIA',
    border: 'border-l-slate-400/70',
    badge: 'bg-slate-100/90',
    badgeText: 'text-slate-700',
    ring: 'ring-slate-300/25',
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

interface UrgenciasProtocolRulesDeckConceptMapProps {
  concepts: ProtocolRuleConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function UrgenciasProtocolRulesDeckConceptMap({
  concepts,
  theme,
  footerRule,
}: UrgenciasProtocolRulesDeckConceptMapProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  }, []);

  if (concepts.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 mb-3 flex items-center justify-between gap-2 px-1">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-rose-800 shadow-sm">
          <ClipboardList className="h-3 w-3" aria-hidden />
          Protocol Rules Deck
        </span>
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
        {concepts.map((concept, index) => {
          const slot = inferProtocolDeckSlot(concept.title, concept.description);
          const meta = SLOT_META[slot];
          const Icon = resolveLucideIcon(concept.icon);
          const expanded = expandedIndex === index;
          const vfChip = inferVfChipFromText(`${concept.title} ${concept.description}`);

          return (
            <motion.button
              key={index}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * index }}
              onClick={() => toggleExpanded(index)}
              aria-expanded={expanded}
              className={`overflow-hidden rounded-[1.25rem] border border-slate-200/70 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md border-l-[4px] ${meta.border} bg-white/95`}
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
                    {protocolDeckSlotLabel(slot)}
                  </span>
                </div>
                <h4 className={`font-body text-base font-bold tracking-normal md:text-lg ${theme.textPrimary}`}>
                  {concept.title}
                </h4>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={expanded ? 'open' : 'closed'}
                    className={`font-body text-sm leading-relaxed ${theme.textSecondary} ${
                      expanded ? '' : 'line-clamp-3'
                    }`}
                  >
                    {concept.description}
                  </motion.p>
                </AnimatePresence>
                {!expanded && concept.description.length > 64 ? (
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
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
        <p
          className={`relative z-10 mt-3 rounded-xl border px-4 py-3 text-center font-body text-sm font-medium italic leading-relaxed ${theme.borderColor} bg-white/80 ${theme.textSecondary}`}
        >
          {footerRule}
        </p>
      ) : null}
    </div>
  );
}

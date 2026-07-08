'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ShieldAlert } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import {
  excetoRailSlotLabel,
  inferExcetoRailSlot,
  type ExcetoRailSlot,
} from '@/lib/slides/urgenciasExcetoSlideUtils';

export interface ExcetoRailConcept {
  icon: string;
  title: string;
  description: string;
}

const SLOT_META: Record<
  ExcetoRailSlot,
  { border: string; badge: string; badgeText: string; chip: string }
> = {
  comando: {
    border: 'border-l-rose-500/90',
    badge: 'bg-rose-100/90',
    badgeText: 'text-rose-900',
    chip: 'EXCETO',
  },
  conduta_correta: {
    border: 'border-l-emerald-500/90',
    badge: 'bg-emerald-100/90',
    badgeText: 'text-emerald-800',
    chip: '✓',
  },
  excecao: {
    border: 'border-l-amber-500/90',
    badge: 'bg-amber-100/90',
    badgeText: 'text-amber-900',
    chip: '✗',
  },
  imobilizacao: {
    border: 'border-l-cyan-500/90',
    badge: 'bg-cyan-100/90',
    badgeText: 'text-cyan-900',
    chip: 'IMOB',
  },
  alerta: {
    border: 'border-l-violet-500/90',
    badge: 'bg-violet-100/90',
    badgeText: 'text-violet-900',
    chip: '!',
  },
  geral: {
    border: 'border-l-slate-400/70',
    badge: 'bg-slate-100/90',
    badgeText: 'text-slate-700',
    chip: '•',
  },
};

interface UrgenciasExcetoRailConceptMapProps {
  concepts: ExcetoRailConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function UrgenciasExcetoRailConceptMap({
  concepts,
  theme,
  footerRule,
}: UrgenciasExcetoRailConceptMapProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  }, []);

  if (concepts.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 mb-3 flex items-center gap-2 px-1">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-rose-800 shadow-sm">
          <ShieldAlert className="h-3 w-3" aria-hidden />
          EXCETO Rail
        </span>
      </div>

      <div className="relative z-10 flex flex-col gap-2.5">
        {concepts.map((concept, index) => {
          const slot = inferExcetoRailSlot(concept.title, concept.description);
          const meta = SLOT_META[slot];
          const Icon = resolveLucideIcon(concept.icon);
          const expanded = expandedIndex === index;

          return (
            <motion.button
              key={index}
              type="button"
              onClick={() => toggleExpanded(index)}
              aria-expanded={expanded}
              className={`overflow-hidden rounded-2xl border border-slate-200/70 border-l-[4px] ${meta.border} bg-white/95 text-left shadow-sm transition-all hover:shadow-md`}
            >
              <div className="flex items-start gap-3 p-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText}`}
                >
                  <Icon size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase ${meta.badge} ${meta.badgeText}`}
                    >
                      {excetoRailSlotLabel(slot)}
                    </span>
                    <span className="font-mono text-[10px] font-black text-slate-400">{meta.chip}</span>
                  </div>
                  <h4 className={`font-body text-sm font-bold ${theme.textPrimary}`}>{concept.title}</h4>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.p
                      key={expanded ? 'open' : 'closed'}
                      className={`mt-1 font-body text-sm leading-relaxed ${theme.textSecondary} ${
                        expanded ? '' : 'line-clamp-2'
                      }`}
                    >
                      {concept.description}
                    </motion.p>
                  </AnimatePresence>
                  {!expanded && concept.description.length > 72 ? (
                    <span className="mt-1 inline-flex items-center gap-1 font-mono text-[9px] font-bold uppercase text-slate-500">
                      <ChevronDown className="h-2.5 w-2.5" aria-hidden />
                      expandir
                    </span>
                  ) : null}
                </div>
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

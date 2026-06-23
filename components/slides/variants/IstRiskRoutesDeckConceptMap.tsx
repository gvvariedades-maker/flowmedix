'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import { inferIstRoute, type IstRoute } from '@/lib/slides/istSlideUtils';

export interface IstRouteConcept {
  icon: string;
  title: string;
  description: string;
}

const ROUTE_META: Record<
  IstRoute,
  { label: string; border: string; badge: string; badgeText: string; ring: string }
> = {
  sexual: {
    label: 'VIA SEXUAL',
    border: 'border-l-fuchsia-500/90',
    badge: 'bg-fuchsia-100/90',
    badgeText: 'text-fuchsia-900',
    ring: 'ring-fuchsia-400/30',
  },
  parceria: {
    label: 'PARCERIA',
    border: 'border-l-purple-500/90',
    badge: 'bg-purple-100/90',
    badgeText: 'text-purple-900',
    ring: 'ring-purple-400/30',
  },
  parenteral: {
    label: 'PARENTERAL',
    border: 'border-l-rose-500/90',
    badge: 'bg-rose-100/90',
    badgeText: 'text-rose-900',
    ring: 'ring-rose-400/30',
  },
  prevencao: {
    label: 'PREVENÇÃO',
    border: 'border-l-violet-500/90',
    badge: 'bg-violet-100/90',
    badgeText: 'text-violet-900',
    ring: 'ring-violet-400/30',
  },
  agente: {
    label: 'AGENTE',
    border: 'border-l-indigo-500/90',
    badge: 'bg-indigo-100/90',
    badgeText: 'text-indigo-900',
    ring: 'ring-indigo-400/30',
  },
  gabarito: {
    label: 'GABARITO',
    border: 'border-l-emerald-500/90',
    badge: 'bg-emerald-100/90',
    badgeText: 'text-emerald-900',
    ring: 'ring-emerald-400/35',
  },
  geral: {
    label: 'IST',
    border: 'border-l-purple-300/80',
    badge: 'bg-slate-100/90',
    badgeText: 'text-slate-700',
    ring: 'ring-purple-300/25',
  },
};

function inferVfChip(text: string): 'V' | 'F' | null {
  const lower = text.toLowerCase();
  if (/^verdadeira|^verdadeiro|\bverdadeira\b|\bverdadeiro\b/.test(lower)) return 'V';
  if (/^falsa|^falso|\bfalsa\b|\bfalso\b/.test(lower)) return 'F';
  return null;
}

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

interface IstRiskRoutesDeckConceptMapProps {
  concepts: IstRouteConcept[];
  theme: ThemeColors;
}

export function IstRiskRoutesDeckConceptMap({ concepts, theme }: IstRiskRoutesDeckConceptMapProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  }, []);

  if (concepts.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
        {concepts.map((concept, index) => {
          const route = inferIstRoute(`${concept.title} ${concept.description}`);
          const meta = ROUTE_META[route];
          const Icon = resolveLucideIcon(concept.icon);
          const expanded = expandedIndex === index;
          const hasLongText = concept.description.length > 64;
          const isFocus = route === 'gabarito';
          const vfChip = inferVfChip(concept.description);

          return (
            <motion.button
              key={index}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * index }}
              onClick={() => toggleExpanded(index)}
              aria-expanded={expanded}
              className={`overflow-hidden rounded-[1.25rem] border border-slate-200/70 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md border-l-[4px] ${meta.border} ${
                isFocus
                  ? `ring-2 ${meta.ring} bg-gradient-to-br from-white via-purple-50/40 to-fuchsia-50/50`
                  : 'bg-white/95'
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
                    {meta.label}
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
                      expanded ? '' : 'line-clamp-3'
                    }`}
                  >
                    {concept.description}
                  </motion.p>
                </AnimatePresence>
                {!expanded && hasLongText ? (
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
    </div>
  );
}

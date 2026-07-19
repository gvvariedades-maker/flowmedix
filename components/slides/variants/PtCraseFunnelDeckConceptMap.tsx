'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown, Filter } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import {
  inferFunnelStage,
  stageBadge,
  type PtCraseFunnelStage,
} from '@/lib/slides/ptCraseSlideUtils';

export interface PtCraseFunnelConcept {
  icon: string;
  title: string;
  description: string;
}

const STAGE_META: Record<
  PtCraseFunnelStage,
  {
    label: string;
    border: string;
    badge: string;
    badgeText: string;
    ring: string;
    accent: string;
  }
> = {
  definicao: {
    label: 'DEFINIÇÃO',
    border: 'border-l-amber-500/90',
    badge: 'bg-amber-100/95',
    badgeText: 'text-amber-900',
    ring: 'ring-amber-400/30',
    accent: 'from-amber-50 via-white to-amber-50/60',
  },
  teste_masculino: {
    label: 'T1 · MASC.',
    border: 'border-l-rose-400/90',
    badge: 'bg-rose-100/95',
    badgeText: 'text-rose-900',
    ring: 'ring-rose-300/30',
    accent: 'from-rose-50 via-white to-rose-50/60',
  },
  teste_verbo: {
    label: 'T2 · VERBO',
    border: 'border-l-rose-400/90',
    badge: 'bg-rose-100/95',
    badgeText: 'text-rose-900',
    ring: 'ring-rose-300/30',
    accent: 'from-rose-50 via-white to-rose-50/60',
  },
  teste_a_a: {
    label: 'T3 · a + a',
    border: 'border-l-emerald-400/90',
    badge: 'bg-emerald-100/95',
    badgeText: 'text-emerald-900',
    ring: 'ring-emerald-300/35',
    accent: 'from-emerald-50 via-white to-emerald-50/60',
  },
  teste_ao: {
    label: 'PORTÁTIL · ao',
    border: 'border-l-amber-500/90',
    badge: 'bg-amber-100/95',
    badgeText: 'text-amber-900',
    ring: 'ring-amber-400/30',
    accent: 'from-amber-50 via-white to-amber-50/60',
  },
  pegadinha: {
    label: 'PEGADINHA',
    border: 'border-l-rose-500/95',
    badge: 'bg-rose-100/95',
    badgeText: 'text-rose-900',
    ring: 'ring-rose-400/40',
    accent: 'from-rose-50 via-white to-rose-100/60',
  },
  generico: {
    label: 'FUNIL',
    border: 'border-l-slate-300/80',
    badge: 'bg-slate-100/90',
    badgeText: 'text-slate-700',
    ring: 'ring-slate-300/25',
    accent: 'from-slate-50 via-white to-slate-50/60',
  },
};

interface PtCraseFunnelDeckConceptMapProps {
  concepts: PtCraseFunnelConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function PtCraseFunnelDeckConceptMap({
  concepts,
  theme,
  footerRule,
}: PtCraseFunnelDeckConceptMapProps) {
  const reduceMotion = useReducedMotion();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpanded = useCallback(
    (index: number) => {
      setExpandedIndex((current) => (current === index ? null : index));
    },
    [],
  );

  const enriched = useMemo(
    () =>
      concepts.map((concept, index) => {
        const stage = inferFunnelStage(`${concept.title} ${concept.description}`);
        return { concept, stage, meta: STAGE_META[stage], index };
      }),
    [concepts],
  );

  if (enriched.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col gap-3">
        <div className="flex items-center justify-center gap-2 rounded-full border border-amber-200/80 bg-white/85 px-4 py-2 shadow-sm">
          <Filter className="h-4 w-4 text-amber-700" aria-hidden />
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-900">
            Funil da crase — 3 testes + portátil ao
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {enriched.map(({ concept, stage, meta, index }) => {
            const Icon = resolveLucideIcon(concept.icon || 'HelpCircle');
            const expanded = expandedIndex === index;
            const hasLongText = concept.description.length > 60;
            const isFocus = stage === 'teste_a_a' || stage === 'pegadinha' || stage === 'teste_ao';

            return (
              <motion.button
                key={index}
                type="button"
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : 0.06 * index }}
                onClick={() => toggleExpanded(index)}
                aria-expanded={expanded}
                className={`overflow-hidden rounded-[1.25rem] border border-slate-200/70 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md border-l-[4px] ${meta.border} ${
                  isFocus
                    ? `ring-2 ${meta.ring} bg-gradient-to-br ${meta.accent}`
                    : 'bg-white/95'
                }`}
              >
                <div className="flex flex-col gap-2 p-4 md:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText}`}
                    >
                      <Icon size={22} />
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${meta.badge} ${meta.badgeText}`}
                    >
                      {stageBadge(stage)}
                    </span>
                  </div>
                  <h4 className={`font-body text-base font-bold tracking-normal md:text-lg ${theme.textPrimary}`}>
                    {concept.title}
                  </h4>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.p
                      key={expanded ? 'open' : 'closed'}
                      initial={reduceMotion ? false : { opacity: 0.85 }}
                      animate={{ opacity: 1 }}
                      className={`font-body text-sm leading-relaxed ${theme.textSecondary} ${
                        expanded || reduceMotion ? '' : 'line-clamp-3'
                      }`}
                    >
                      {concept.description}
                    </motion.p>
                  </AnimatePresence>
                  {!expanded && hasLongText && !reduceMotion ? (
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-100/70 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-amber-800">
                      <ChevronDown className="h-2.5 w-2.5" aria-hidden />
                      toque para expandir
                    </span>
                  ) : null}
                </div>
              </motion.button>
            );
          })}
        </div>

        {footerRule ? (
          <p className="rounded-xl border border-amber-200/80 bg-white/90 px-4 py-3 text-center font-body text-sm italic leading-relaxed text-amber-900/90 shadow-sm">
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}

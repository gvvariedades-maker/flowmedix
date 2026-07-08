'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import {
  CINCINNATI_SIGNS,
  cincinnatiSignLabel,
  inferCincinnatiSign,
  type CincinnatiSign,
} from '@/lib/slides/urgenciasAvcSlideUtils';

export interface StrokeSignConcept {
  icon: string;
  title: string;
  description: string;
}

const SIGN_META: Record<
  CincinnatiSign,
  { badge: string; badgeText: string; border: string; ring: string; chip: string }
> = {
  face: {
    badge: 'bg-violet-100/90',
    badgeText: 'text-violet-900',
    border: 'border-l-violet-500/90',
    ring: 'ring-violet-400/30',
    chip: 'F',
  },
  arms: {
    badge: 'bg-purple-100/90',
    badgeText: 'text-purple-900',
    border: 'border-l-purple-400/80',
    ring: 'ring-purple-300/30',
    chip: 'A',
  },
  speech: {
    badge: 'bg-fuchsia-100/90',
    badgeText: 'text-fuchsia-900',
    border: 'border-l-fuchsia-400/80',
    ring: 'ring-fuchsia-300/30',
    chip: 'S',
  },
  time: {
    badge: 'bg-rose-100/90',
    badgeText: 'text-rose-900',
    border: 'border-l-rose-400/80',
    ring: 'ring-rose-300/30',
    chip: 'T',
  },
  alerta: {
    badge: 'bg-amber-100/90',
    badgeText: 'text-amber-900',
    border: 'border-l-amber-500/80',
    ring: 'ring-amber-400/35',
    chip: '!',
  },
  geral: {
    badge: 'bg-slate-100/90',
    badgeText: 'text-slate-800',
    border: 'border-l-slate-400/70',
    ring: 'ring-slate-300/25',
    chip: '•',
  },
};

interface UrgenciasStrokeSignsDeckConceptMapProps {
  concepts: StrokeSignConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function UrgenciasStrokeSignsDeckConceptMap({
  concepts,
  theme,
  footerRule,
}: UrgenciasStrokeSignsDeckConceptMapProps) {
  const [activeSign, setActiveSign] = useState<CincinnatiSign | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const grouped = useMemo(() => {
    const bySign = new Map<CincinnatiSign, StrokeSignConcept[]>();
    for (const concept of concepts) {
      const sign = inferCincinnatiSign(concept.title, concept.description);
      const list = bySign.get(sign) ?? [];
      list.push(concept);
      bySign.set(sign, list);
    }
    return bySign;
  }, [concepts]);

  const signsOnRail = CINCINNATI_SIGNS.filter((s) => grouped.has(s));
  const defaultSign =
    activeSign ??
    signsOnRail.find((s) => s === 'face') ??
    signsOnRail[0] ??
    inferCincinnatiSign(concepts[0]?.title ?? '', concepts[0]?.description ?? '');

  const visibleConcepts = grouped.get(defaultSign) ?? concepts;

  const toggleSign = useCallback((sign: CincinnatiSign) => {
    setActiveSign((current) => (current === sign ? null : sign));
    setExpandedIndex(null);
  }, []);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  }, []);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col gap-4">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-violet-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-violet-900 shadow-sm">
          <Brain className="h-3 w-3" aria-hidden />
          Cincinnati Signs Deck
        </span>

        {signsOnRail.length > 1 ? (
          <div className="flex flex-wrap items-center justify-center gap-1 rounded-xl border border-violet-200/70 bg-violet-50/50 px-2 py-2">
            {signsOnRail.map((sign, i) => {
              const meta = SIGN_META[sign];
              const isActive = defaultSign === sign;
              return (
                <div key={sign} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleSign(sign)}
                    className={`flex h-11 w-11 items-center justify-center rounded-xl font-mono text-sm font-black transition-all ${
                      isActive
                        ? `${meta.badge} ${meta.badgeText} ring-2 ${meta.ring}`
                        : 'bg-white/80 text-slate-500 hover:bg-white'
                    }`}
                  >
                    {meta.chip}
                  </button>
                  {i < signsOnRail.length - 1 ? (
                    <span className="font-mono text-[10px] text-violet-400/80" aria-hidden>
                      ·
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}

        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-violet-800/90">
          {cincinnatiSignLabel(defaultSign)}
        </p>

        <div className="flex flex-col gap-3">
          {visibleConcepts.map((concept, index) => {
            const Icon = resolveLucideIcon(concept.icon);
            const expanded = expandedIndex === index;
            const sign = inferCincinnatiSign(concept.title, concept.description);
            const meta = SIGN_META[sign];

            return (
              <motion.button
                key={`${defaultSign}-${index}`}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                onClick={() => toggleExpanded(index)}
                aria-expanded={expanded}
                className={`overflow-hidden rounded-[1.25rem] border border-violet-200/70 border-l-[3px] ${meta.border} bg-gradient-to-br from-white via-violet-50/30 to-purple-50/50 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
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
                      {meta.chip}
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
            className={`rounded-xl border px-4 py-3 text-center font-body text-sm font-medium italic leading-relaxed ${theme.borderColor} bg-white/80 ${theme.textSecondary}`}
          >
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}

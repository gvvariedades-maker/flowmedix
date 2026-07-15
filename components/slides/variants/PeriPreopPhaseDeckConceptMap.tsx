'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Scissors } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { SlideLucideIcon } from '../core/SlideLucideIcon';
import {
  inferPeriPhase,
  periPhaseLabel,
  periPhaseShort,
  PERI_PHASES,
  type PeriPhase,
} from '@/lib/slides/perioperatoriaSlideUtils';

export interface PeriPreopDeckConcept {
  icon: string;
  title: string;
  description: string;
}

const PHASE_META: Record<
  PeriPhase,
  { bar: string; ring: string; panel: string; text: string; border: string }
> = {
  pre: {
    bar: 'from-violet-400 to-violet-200',
    ring: 'ring-violet-300/60',
    panel: 'from-violet-50/95 via-white to-fuchsia-50/90',
    text: 'text-violet-900',
    border: 'border-l-violet-500/90',
  },
  intra: {
    bar: 'from-fuchsia-500 to-violet-300',
    ring: 'ring-fuchsia-400/70',
    panel: 'from-fuchsia-50/95 via-white to-violet-50/90',
    text: 'text-fuchsia-900',
    border: 'border-l-fuchsia-500/90',
  },
  pos: {
    bar: 'from-purple-400 to-violet-200',
    ring: 'ring-purple-300/60',
    panel: 'from-purple-50/95 via-white to-violet-50/90',
    text: 'text-purple-900',
    border: 'border-l-purple-500/90',
  },
  srpa: {
    bar: 'from-indigo-500 to-violet-300',
    ring: 'ring-indigo-400/60',
    panel: 'from-indigo-50/95 via-white to-violet-50/90',
    text: 'text-indigo-900',
    border: 'border-l-indigo-500/90',
  },
  geral: {
    bar: 'from-slate-400 to-slate-200',
    ring: 'ring-slate-300/50',
    panel: 'from-slate-50/95 via-white to-violet-50/80',
    text: 'text-slate-800',
    border: 'border-l-slate-400/80',
  },
};

interface PeriPreopPhaseDeckConceptMapProps {
  concepts: PeriPreopDeckConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function PeriPreopPhaseDeckConceptMap({
  concepts,
  theme,
  footerRule,
}: PeriPreopPhaseDeckConceptMapProps) {
  const grouped = useMemo(() => {
    const phases: Partial<Record<PeriPhase, PeriPreopDeckConcept[]>> = {};
    const extras: PeriPreopDeckConcept[] = [];

    for (const concept of concepts) {
      const phase = inferPeriPhase(concept.title, concept.description);
      if (phase !== 'geral') {
        phases[phase] = [...(phases[phase] ?? []), concept];
      } else {
        extras.push(concept);
      }
    }

    return { phases, extras };
  }, [concepts]);

  const phaseKeys = PERI_PHASES.filter((k) => (grouped.phases[k]?.length ?? 0) > 0);
  const defaultPhase = phaseKeys.includes('pre') ? 'pre' : phaseKeys[0] ?? 'pre';
  const [activePhase, setActivePhase] = useState<PeriPhase>(defaultPhase);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const activeConcepts =
    (grouped.phases[activePhase]?.length ?? 0) > 0
      ? grouped.phases[activePhase]!
      : grouped.extras.length > 0
        ? grouped.extras
        : concepts;
  const activeMeta = PHASE_META[activePhase];

  const selectPhase = useCallback((phase: PeriPhase) => {
    setActivePhase(phase);
    setExpandedIndex(null);
  }, []);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  }, []);

  if (concepts.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-5">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-violet-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-violet-800 shadow-sm">
            <Scissors className="h-3 w-3" aria-hidden />
            Fases perioperatórias
          </span>
          <p className="font-body text-xs font-medium text-slate-600">
            Toque cada fase para ver condutas de pré, intra, pós e SRPA
          </p>
        </div>

        {phaseKeys.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {phaseKeys.map((phase) => {
              const meta = PHASE_META[phase];
              const isActive = activePhase === phase;
              const isFocus = phase === 'srpa';
              return (
                <button
                  key={phase}
                  type="button"
                  onClick={() => selectPhase(phase)}
                  aria-label={periPhaseLabel(phase)}
                  className={`flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-2xl border px-1 py-2.5 transition-all ${
                    isActive
                      ? `border-2 bg-white shadow-lg ${meta.ring} ring-2`
                      : 'border-slate-200/90 bg-white/80 shadow-sm hover:shadow-md'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${meta.bar} font-display text-[9px] font-black text-white shadow-inner`}
                  >
                    {periPhaseShort(phase)}
                  </span>
                  <span className={`text-center font-mono text-[8px] font-bold uppercase leading-tight ${meta.text}`}>
                    {periPhaseLabel(phase)}
                    {isFocus ? ' ★' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        <AnimatePresence mode="wait">
          <motion.div
            key={activePhase}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={`overflow-hidden rounded-[1.5rem] border border-violet-200/70 bg-gradient-to-br ${activeMeta.panel} p-3 shadow-md`}
          >
            <div className="mb-2 flex items-center justify-center gap-2">
              <span className="rounded-full bg-white/80 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-violet-800">
                {periPhaseLabel(activePhase)}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {activeConcepts.map((concept, index) => {
                const phase = inferPeriPhase(concept.title, concept.description);
                const meta = PHASE_META[phase];
                const expanded = expandedIndex === index;
                const hasLongText = concept.description.length > 80;

                return (
                  <button
                    key={`${concept.title}-${index}`}
                    type="button"
                    onClick={() => toggleExpanded(index)}
                    aria-expanded={expanded}
                    className={`w-full overflow-hidden rounded-xl border text-left transition-all ${meta.border} border-l-[4px] ${
                      phase === 'srpa'
                        ? 'border-fuchsia-400/80 bg-white ring-2 ring-fuchsia-300/30'
                        : 'border-white/80 bg-white/90'
                    }`}
                  >
                    <div className="flex flex-col gap-2 p-3">
                      <div className="flex items-start gap-2">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${theme.iconBg} ${theme.iconText}`}
                        >
                          <SlideLucideIcon name={concept.icon} size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span
                            className={`mb-1 inline-block rounded-full px-2 py-0.5 font-mono text-[9px] font-bold ${meta.text} bg-white/80`}
                          >
                            {periPhaseShort(phase)}
                          </span>
                          <h4 className={`font-display text-xs font-extrabold uppercase tracking-wide ${theme.textPrimary}`}>
                            {concept.title}
                          </h4>
                          <p
                            className={`mt-1 font-body text-sm leading-relaxed ${theme.textSecondary} ${
                              expanded ? '' : 'line-clamp-2'
                            }`}
                          >
                            {concept.description}
                          </p>
                        </div>
                        {hasLongText ? (
                          <ChevronDown
                            className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
                          />
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {footerRule ? (
          <p className="text-center text-xs font-medium text-violet-800/80">{footerRule}</p>
        ) : null}
      </div>
    </div>
  );
}

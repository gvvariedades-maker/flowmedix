'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import {
  inferMentalCrisisStep,
  mentalCrisisStepLabel,
  MENTAL_CRISIS_LADDER,
  type MentalCrisisStep,
} from '@/lib/slides/saudeMentalSlideUtils';

export interface MentalCrisisConcept {
  icon: string;
  title: string;
  description: string;
}

const STEP_META: Record<
  MentalCrisisStep,
  { border: string; badge: string; badgeText: string; ring: string }
> = {
  acolhimento: {
    border: 'border-l-emerald-500',
    badge: 'bg-emerald-100/90',
    badgeText: 'text-emerald-900',
    ring: 'ring-emerald-400/40',
  },
  vinculo: {
    border: 'border-l-teal-500',
    badge: 'bg-teal-100/90',
    badgeText: 'text-teal-900',
    ring: 'ring-teal-400/40',
  },
  equipe: {
    border: 'border-l-sky-500',
    badge: 'bg-sky-100/90',
    badgeText: 'text-sky-900',
    ring: 'ring-sky-400/40',
  },
  medicacao: {
    border: 'border-l-violet-500',
    badge: 'bg-violet-100/90',
    badgeText: 'text-violet-900',
    ring: 'ring-violet-400/40',
  },
  contencao: {
    border: 'border-l-rose-500',
    badge: 'bg-rose-100/90',
    badgeText: 'text-rose-900',
    ring: 'ring-rose-400/40',
  },
  internacao: {
    border: 'border-l-amber-500',
    badge: 'bg-amber-100/90',
    badgeText: 'text-amber-900',
    ring: 'ring-amber-400/40',
  },
  geral: {
    border: 'border-l-slate-400',
    badge: 'bg-slate-100/90',
    badgeText: 'text-slate-800',
    ring: 'ring-slate-300/40',
  },
};

interface MentalCrisisSignalDeckConceptMapProps {
  concepts: MentalCrisisConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function MentalCrisisSignalDeckConceptMap({
  concepts,
  theme,
  footerRule,
}: MentalCrisisSignalDeckConceptMapProps) {
  const reduceMotion = useReducedMotion();
  const [activeStep, setActiveStep] = useState<MentalCrisisStep | null>('acolhimento');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const mapped = useMemo(
    () =>
      concepts.map((concept) => ({
        concept,
        step: inferMentalCrisisStep(concept.title, concept.description),
      })),
    [concepts],
  );

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  }, []);

  if (concepts.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div
        className="relative z-10 mb-3 flex items-center justify-between gap-0.5 rounded-xl border border-violet-200/80 bg-violet-50/50 px-2 py-2"
        role="tablist"
        aria-label="Escada de cuidado em crise"
      >
        {MENTAL_CRISIS_LADDER.map((step) => {
          const meta = STEP_META[step];
          const selected = activeStep === step;
          return (
            <button
              key={step}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveStep(step)}
              className={`flex min-w-0 flex-1 flex-col items-center rounded-lg px-0.5 py-1 transition-all ${
                selected
                  ? `${meta.badge} ${meta.badgeText} ring-2 ${meta.ring}`
                  : 'bg-white/50 text-slate-500 opacity-70'
              }`}
            >
              <span className="text-center font-mono text-[8px] font-black leading-tight sm:text-[9px]">
                {mentalCrisisStepLabel(step)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative z-10 flex flex-col gap-2">
        {mapped.map(({ concept, step }, index) => {
          const Icon = resolveLucideIcon(concept.icon);
          const meta = STEP_META[step];
          const expanded = expandedIndex === index;
          const dimmed = activeStep !== null && step !== 'geral' && step !== activeStep;

          return (
            <motion.button
              key={index}
              type="button"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: dimmed ? 0.45 : 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : index * 0.05 }}
              onClick={() => toggleExpanded(index)}
              aria-expanded={expanded}
              className={`w-full overflow-hidden rounded-[1.25rem] border text-left shadow-sm ${meta.border} border-l-[4px] ${
                expanded ? `ring-2 ${meta.ring}` : ''
              } bg-white/95`}
            >
              <div className="flex flex-col gap-2 p-4">
                <div className="flex items-start gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.badge}`}>
                    <Icon className={`h-5 w-5 ${meta.badgeText}`} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className={`mb-1 inline-block rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${meta.badge} ${meta.badgeText}`}>
                      {mentalCrisisStepLabel(step)}
                    </span>
                    <p className="font-display text-sm font-bold leading-snug text-slate-900">{concept.title}</p>
                  </div>
                </div>
                {expanded ? (
                  <p className="text-sm leading-relaxed text-slate-700">{concept.description}</p>
                ) : null}
              </div>
            </motion.button>
          );
        })}
      </div>

      {footerRule ? (
        <p className="relative z-10 mt-3 text-center text-xs font-medium text-violet-800/80">{footerRule}</p>
      ) : null}

      <div className="pointer-events-none absolute right-3 top-3 opacity-20" aria-hidden>
        <AlertTriangle className="h-16 w-16 text-violet-500" />
      </div>
    </div>
  );
}

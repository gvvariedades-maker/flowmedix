'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Baby, ChevronDown, Hand } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { SlideLucideIcon } from '../core/SlideLucideIcon';
import {
  inferLaborPhaseMarker,
  laborPhaseLabel,
  laborPhaseShort,
  type LaborPhaseSlot,
} from '@/lib/slides/mulherPartoSlideUtils';

export interface LaborDeckConcept {
  icon: string;
  title: string;
  description: string;
}

const PHASE_META: Record<
  LaborPhaseSlot,
  { bar: string; ring: string; panel: string; text: string }
> = {
  latencia: {
    bar: 'from-pink-300 to-pink-100',
    ring: 'ring-pink-300/60',
    panel: 'from-pink-50/95 via-white to-rose-50/90',
    text: 'text-pink-900',
  },
  dilatacao: {
    bar: 'from-rose-400 to-rose-200',
    ring: 'ring-rose-300/60',
    panel: 'from-rose-50/95 via-white to-orange-50/90',
    text: 'text-rose-900',
  },
  expulsivo: {
    bar: 'from-fuchsia-500 to-pink-300',
    ring: 'ring-fuchsia-400/70',
    panel: 'from-fuchsia-50/95 via-white to-pink-50/90',
    text: 'text-fuchsia-900',
  },
  dequitacao: {
    bar: 'from-violet-400 to-violet-200',
    ring: 'ring-violet-300/60',
    panel: 'from-violet-50/95 via-white to-purple-50/90',
    text: 'text-violet-900',
  },
};

interface MulherLaborPhaseDeckConceptMapProps {
  concepts: LaborDeckConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function MulherLaborPhaseDeckConceptMap({
  concepts,
  theme,
  footerRule,
}: MulherLaborPhaseDeckConceptMapProps) {
  const grouped = useMemo(() => {
    const phases: Partial<Record<LaborPhaseSlot, LaborDeckConcept[]>> = {};
    const extras: LaborDeckConcept[] = [];

    for (const concept of concepts) {
      const inferred = inferLaborPhaseMarker(concept.title, concept.description);
      const phase = inferred.phase;
      if (phase) {
        phases[phase] = [...(phases[phase] ?? []), concept];
      } else {
        extras.push(concept);
      }
    }

    return { phases, extras };
  }, [concepts]);

  const phaseKeys = (['latencia', 'dilatacao', 'expulsivo', 'dequitacao'] as const).filter(
    (k) => (grouped.phases[k]?.length ?? 0) > 0,
  );
  const defaultPhase = phaseKeys.includes('expulsivo') ? 'expulsivo' : phaseKeys[0] ?? 'expulsivo';
  const [activePhase, setActivePhase] = useState<LaborPhaseSlot>(defaultPhase);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const activeConcepts =
    (grouped.phases[activePhase]?.length ?? 0) > 0
      ? grouped.phases[activePhase]!
      : grouped.extras.length > 0
        ? grouped.extras
        : concepts;
  const activeMeta = PHASE_META[activePhase];

  const selectPhase = useCallback((phase: LaborPhaseSlot) => {
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
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-pink-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-pink-800 shadow-sm">
            <Baby className="h-3 w-3" aria-hidden />
            Fases do parto
          </span>
          <p className="flex items-center gap-1.5 font-body text-xs font-medium text-slate-600">
            <Hand className="h-3.5 w-3.5 shrink-0 text-pink-600" aria-hidden />
            Toque cada fase para ver condutas do trabalho de parto
          </p>
        </div>

        {phaseKeys.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {phaseKeys.map((phase) => {
              const meta = PHASE_META[phase];
              const isActive = activePhase === phase;
              const isFocus = phase === 'expulsivo';
              return (
                <button
                  key={phase}
                  type="button"
                  onClick={() => selectPhase(phase)}
                  aria-label={laborPhaseLabel(phase)}
                  className={`flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-2xl border px-1 py-2.5 transition-all ${
                    isActive
                      ? `border-2 bg-white shadow-lg ${meta.ring} ring-2`
                      : 'border-slate-200/90 bg-white/80 shadow-sm hover:shadow-md'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${meta.bar} font-display text-[9px] font-black text-white shadow-inner`}
                  >
                    {laborPhaseShort(phase)}
                  </span>
                  <span className={`text-center font-mono text-[8px] font-bold uppercase leading-tight ${meta.text}`}>
                    {laborPhaseLabel(phase)}
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
            className={`overflow-hidden rounded-[1.5rem] border border-pink-200/70 bg-gradient-to-br ${activeMeta.panel} p-3 shadow-md`}
          >
            <div className="mb-2 flex items-center justify-center gap-2">
              <span className="rounded-full bg-white/80 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-pink-800">
                {laborPhaseLabel(activePhase)}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {activeConcepts.map((concept, index) => {
                const marker = inferLaborPhaseMarker(concept.title, concept.description);
                const expanded = expandedIndex === index;
                const hasLongText = concept.description.length > 80;

                return (
                  <button
                    key={`${concept.title}-${index}`}
                    type="button"
                    onClick={() => toggleExpanded(index)}
                    aria-expanded={expanded}
                    className={`w-full overflow-hidden rounded-xl border text-left transition-all ${
                      marker.focus
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
                      </div>
                      {!expanded && hasLongText ? (
                        <span className="inline-flex items-center gap-1 self-start rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-slate-500">
                          <ChevronDown className="h-2.5 w-2.5" aria-hidden />
                          expandir
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {footerRule ? (
          <p
            className={`rounded-xl border px-4 py-3 text-center font-body text-sm italic leading-relaxed ${theme.borderColor} ${theme.iconBg} ${theme.textSecondary}`}
          >
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}

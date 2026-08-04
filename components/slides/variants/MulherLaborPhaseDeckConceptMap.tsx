'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { SlideLucideIcon } from '../core/SlideLucideIcon';
import {
  inferLaborPhaseMarker,
  laborPhaseLabel,
  laborPhaseShort,
  type LaborPhaseSlot,
} from '@/lib/slides/mulherPartoSlideUtils';
import { BoardChrome, CategoryStrip, ProtocolRailRow, type BoardTone } from '../primitives';

export interface LaborDeckConcept {
  icon: string;
  title: string;
  description: string;
}

const PHASE_META: Record<LaborPhaseSlot, { bar: string; ring: string }> = {
  latencia: { bar: 'from-pink-300 to-pink-100', ring: 'ring-pink-300/60' },
  dilatacao: { bar: 'from-rose-400 to-rose-200', ring: 'ring-rose-300/60' },
  expulsivo: { bar: 'from-fuchsia-500 to-pink-300', ring: 'ring-fuchsia-400/70' },
  dequitacao: { bar: 'from-violet-400 to-violet-200', ring: 'ring-violet-300/60' },
};

interface MulherLaborPhaseDeckConceptMapProps {
  concepts: LaborDeckConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

/** Deck de fases do parto — filtro por fase + ProtocolRailRow (Fábrica G2). */
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

  const selectPhase = useCallback((phase: LaborPhaseSlot) => {
    setActivePhase(phase);
    setExpandedIndex(null);
  }, []);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  }, []);

  if (concepts.length === 0) return null;

  return (
    <BoardChrome
      theme={theme}
      eyebrow="Parto · fases PNH"
      footerRule={footerRule}
      footerLabel="Transferência de prova"
      maxWidth="lg"
      washOpacity={0.35}
    >
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
                <span className="text-center font-mono text-[8px] font-bold uppercase leading-tight text-slate-700">
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
          className="flex flex-col gap-3"
        >
          <div className="flex items-center justify-center">
            <CategoryStrip label={laborPhaseLabel(activePhase)} tone="accent" />
          </div>

          {activeConcepts.map((concept, index) => {
            const marker = inferLaborPhaseMarker(concept.title, concept.description);
            const expanded = expandedIndex === index;
            const hasLongText = concept.description.length > 80;
            const tone: BoardTone = marker.focus ? 'exception' : 'accent';

            return (
              <button
                key={`${concept.title}-${index}`}
                type="button"
                onClick={() => toggleExpanded(index)}
                aria-expanded={expanded}
                className="w-full text-left"
              >
                <ProtocolRailRow
                  badge={laborPhaseShort(activePhase)}
                  title={concept.title}
                  tone={tone}
                  active={marker.focus || expanded}
                  detail={
                    <span className="flex flex-col gap-2">
                      <span className="flex items-center gap-2">
                        <SlideLucideIcon name={concept.icon} size={16} />
                        {marker.focus ? <CategoryStrip label="foco prova" tone="exception" /> : null}
                      </span>
                      <span className={expanded ? '' : 'line-clamp-3'}>{concept.description}</span>
                      {!expanded && hasLongText ? (
                        <span className="inline-flex items-center gap-1 self-start font-mono text-[9px] font-bold uppercase text-slate-500">
                          <ChevronDown className="h-2.5 w-2.5" aria-hidden />
                          expandir
                        </span>
                      ) : null}
                    </span>
                  }
                />
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </BoardChrome>
  );
}

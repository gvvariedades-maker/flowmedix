'use client';

import { useCallback, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { SlideLucideIcon } from '../core/SlideLucideIcon';
import { inferPuerperioMarker } from '@/lib/slides/mulherPuerperioSlideUtils';
import {
  BoardChrome,
  CategoryStrip,
  ProtocolRailRow,
  type BoardTone,
} from '../primitives';

export interface TimelineConcept {
  icon: string;
  title: string;
  description: string;
}

interface MulherPuerperioTimelineConceptMapProps {
  concepts: TimelineConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

/** Trilho do puerpério — ProtocolRailRow + BoardChrome (Fábrica G2). */
export function MulherPuerperioTimelineConceptMap({
  concepts,
  theme,
  footerRule,
}: MulherPuerperioTimelineConceptMapProps) {
  const reduceMotion = useReducedMotion();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  }, []);

  if (concepts.length === 0) return null;

  return (
    <BoardChrome
      theme={theme}
      eyebrow="Puerpério · 0–42 dias"
      footerRule={footerRule}
      footerLabel="Transferência de prova"
      maxWidth="2xl"
      washOpacity={0.35}
    >
      <div className="flex flex-col gap-3">
        {concepts.map((concept, index) => {
          const expanded = expandedIndex === index;
          const hasLongText = concept.description.length > 80;
          const marker = inferPuerperioMarker(concept.title, concept.description);
          const tone: BoardTone = marker.focus ? 'exception' : 'accent';

          return (
            <motion.button
              key={index}
              type="button"
              initial={reduceMotion ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: reduceMotion ? 0 : 0.05 * index }}
              onClick={() => toggleExpanded(index)}
              aria-expanded={expanded}
              className="w-full text-left"
            >
              <ProtocolRailRow
                badge={marker.label}
                title={concept.title}
                tone={tone}
                active={marker.focus || expanded}
                detail={
                  <span className="flex flex-col gap-2">
                    <span className="flex items-center gap-2">
                      <SlideLucideIcon name={concept.icon} size={16} className="shrink-0 text-pink-700" />
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
            </motion.button>
          );
        })}
      </div>
    </BoardChrome>
  );
}

'use client';

import { useCallback, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import { inferGestationMarker } from '@/lib/slides/mulherPrenatalSlideUtils';
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

interface MulherGestationTimelineConceptMapProps {
  concepts: TimelineConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

/** Trilho gestacional — ProtocolRailRow + BoardChrome (Fábrica G2). */
export function MulherGestationTimelineConceptMap({
  concepts,
  theme,
  footerRule,
}: MulherGestationTimelineConceptMapProps) {
  const reduceMotion = useReducedMotion();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  }, []);

  if (concepts.length === 0) return null;

  return (
    <BoardChrome
      theme={theme}
      eyebrow="Trilho gestacional · 0–40"
      footerRule={footerRule}
      footerLabel="Transferência de prova"
      maxWidth="2xl"
      washOpacity={0.35}
    >
      <div className="flex flex-col gap-3">
        {concepts.map((concept, index) => {
          const Icon = resolveLucideIcon(concept.icon);
          const expanded = expandedIndex === index;
          const hasLongText = concept.description.length > 80;
          const marker = inferGestationMarker(concept.title, concept.description);
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
                      {Icon ? <Icon className="h-4 w-4 shrink-0 text-pink-700" aria-hidden /> : null}
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

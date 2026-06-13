'use client';

import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';

export interface TimelineConcept {
  icon: string;
  title: string;
  description: string;
}

function inferTimelineMarker(title: string, description: string): { label: string; focus: boolean } {
  const text = `${title} ${description}`.toLowerCase();
  if (/marco da questão|questão|gabarito|3\s*º?\s*m[eê]s|3\s*meses/.test(text)) {
    return { label: '3M', focus: true };
  }
  if (/ao nascer|nascimento/.test(text)) return { label: '0', focus: false };
  if (/2\s*meses?/.test(text)) return { label: '2M', focus: false };
  if (/4\s*meses?/.test(text)) return { label: '4M', focus: false };
  if (/5\s*meses?/.test(text)) return { label: '5M', focus: false };
  if (/6\s*meses?/.test(text)) return { label: '6M', focus: false };
  if (/12\s*meses?/.test(text)) return { label: '12M', focus: false };
  if (/bcg/.test(text)) return { label: '0', focus: false };
  return { label: '•', focus: false };
}

interface VaccineTimelineConceptMapProps {
  concepts: TimelineConcept[];
  theme: ThemeColors;
}

export const VaccineTimelineConceptMap = ({ concepts, theme }: VaccineTimelineConceptMapProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  }, []);

  const getIcon = (iconName: string) => resolveLucideIcon(iconName);

  if (concepts.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 flex flex-col gap-0">
        {concepts.map((concept, index) => {
          const Icon = getIcon(concept.icon);
          const expanded = expandedIndex === index;
          const hasLongText = concept.description.length > 80;
          const marker = inferTimelineMarker(concept.title, concept.description);
          const isLast = index === concepts.length - 1;

          return (
            <div key={index} className="flex gap-3 md:gap-4">
              <div className="flex w-10 shrink-0 flex-col items-center">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full font-mono text-[10px] font-black tabular-nums ${
                    marker.focus
                      ? 'bg-lime-200/90 text-lime-900 ring-2 ring-lime-400/50'
                      : `${theme.iconBg} ${theme.iconText}`
                  }`}
                >
                  {marker.label}
                </span>
                {!isLast ? (
                  <div className="my-1 w-0.5 flex-1 min-h-[1rem] rounded-full bg-lime-300/60" aria-hidden />
                ) : null}
              </div>

              <motion.button
                type="button"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
                onClick={() => toggleExpanded(index)}
                aria-expanded={expanded}
                className={`mb-3 min-w-0 flex-1 overflow-hidden rounded-[1.25rem] border text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                  marker.focus
                    ? 'border-lime-400/80 border-l-[3px] bg-gradient-to-br from-white via-lime-50/50 to-lime-50/80 ring-2 ring-lime-400/20'
                    : 'border-slate-200/70 border-l-[3px] border-l-lime-300/70 bg-white/90'
                }`}
              >
                <div className="flex flex-col gap-2 p-4 md:p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${theme.iconBg} ${theme.iconText}`}
                    >
                      <Icon size={18} />
                    </div>
                    {marker.focus ? (
                      <span className="rounded-full bg-lime-100 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-lime-800">
                        foco prova
                      </span>
                    ) : null}
                  </div>
                  <h4 className={`font-display text-xs font-extrabold uppercase tracking-wide ${theme.textPrimary}`}>
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
                    <span className="inline-flex items-center gap-1 self-start rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
                      <ChevronDown className="h-2.5 w-2.5" aria-hidden />
                      expandir
                    </span>
                  ) : null}
                </div>
              </motion.button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

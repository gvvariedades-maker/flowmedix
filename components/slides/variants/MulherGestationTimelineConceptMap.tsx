'use client';

import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import { inferGestationMarker } from '@/lib/slides/mulherPrenatalSlideUtils';

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

export const MulherGestationTimelineConceptMap = ({
  concepts,
  theme,
  footerRule,
}: MulherGestationTimelineConceptMapProps) => {
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
          const marker = inferGestationMarker(concept.title, concept.description);
          const isLast = index === concepts.length - 1;

          return (
            <div key={index} className="flex gap-3 md:gap-4">
              <div className="flex w-10 shrink-0 flex-col items-center">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full px-1 text-center font-mono text-[9px] font-black tabular-nums leading-tight ${
                    marker.focus
                      ? 'bg-pink-200/90 text-pink-900 ring-2 ring-pink-400/50'
                      : `${theme.iconBg} ${theme.iconText}`
                  }`}
                >
                  {marker.label}
                </span>
                {!isLast ? (
                  <div className="my-1 min-h-[1rem] w-0.5 flex-1 rounded-full bg-pink-300/60" aria-hidden />
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
                    ? 'border-pink-400/80 border-l-[3px] bg-gradient-to-br from-white via-pink-50/50 to-rose-50/80 ring-2 ring-pink-400/20'
                    : 'border-slate-200/70 border-l-[3px] border-l-pink-300/70 bg-white/90'
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
                      <span className="rounded-full bg-pink-100 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-pink-800">
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
        {footerRule ? (
          <p
            className={`mt-3 rounded-xl border px-4 py-3 text-center font-body text-sm italic ${theme.borderColor} ${theme.iconBg} ${theme.textSecondary}`}
          >
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
};

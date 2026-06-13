'use client';

import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';

export interface ChainConcept {
  icon: string;
  title: string;
  description: string;
}

interface SurvivalChainConceptMapProps {
  concepts: ChainConcept[];
  theme: ThemeColors;
}

export const SurvivalChainConceptMap = ({ concepts, theme }: SurvivalChainConceptMapProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  }, []);

  const getIcon = (iconName: string) => resolveLucideIcon(iconName);

  if (concepts.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 flex flex-col gap-3 md:flex-row md:items-stretch md:gap-2">
        {concepts.map((concept, index) => {
          const Icon = getIcon(concept.icon);
          const expanded = expandedIndex === index;
          const hasLongText = concept.description.length > 72;
          const isLast = index === concepts.length - 1;

          return (
            <React.Fragment key={index}>
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.07 * index }}
                onClick={() => toggleExpanded(index)}
                aria-expanded={expanded}
                className={`min-w-0 flex-1 overflow-hidden rounded-[1.25rem] border border-rose-200/70 border-l-[3px] border-l-rose-400/80 bg-gradient-to-br from-white via-rose-50/40 to-rose-50/70 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                  expanded ? 'ring-2 ring-rose-400/25' : ''
                }`}
              >
                <div className="flex h-full flex-col gap-2.5 p-4 md:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-xs font-black tabular-nums ${theme.iconBg} ${theme.iconText}`}
                      >
                        {index + 1}
                      </span>
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText}`}
                      >
                        <Icon size={20} />
                      </div>
                    </div>
                    <span className="rounded-full bg-rose-100/90 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-rose-800">
                      elo {index + 1}
                    </span>
                  </div>

                  <h4 className={`font-display text-sm font-extrabold uppercase tracking-wide ${theme.textPrimary}`}>
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
                    <span className="mt-auto inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
                      <ChevronDown className="h-2.5 w-2.5" aria-hidden />
                      expandir
                    </span>
                  ) : null}
                </div>
              </motion.button>

              {!isLast ? (
                <div
                  className="flex shrink-0 items-center justify-center text-rose-400/70 md:flex-col"
                  aria-hidden
                >
                  <ChevronRight className="hidden h-6 w-6 md:block" />
                  <ChevronDown className="h-5 w-5 md:hidden" />
                </div>
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

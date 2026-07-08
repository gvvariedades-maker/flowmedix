'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Siren } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';

export interface EmergencyHubConcept {
  icon: string;
  title: string;
  description: string;
}

interface UrgenciasEmergencyHubConceptMapProps {
  concepts: EmergencyHubConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function UrgenciasEmergencyHubConceptMap({
  concepts,
  theme,
  footerRule,
}: UrgenciasEmergencyHubConceptMapProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  }, []);

  if (concepts.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 mb-3 px-1">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-rose-800 shadow-sm">
          <Siren className="h-3 w-3" aria-hidden />
          Emergency Hub
        </span>
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {concepts.map((concept, index) => {
          const Icon = resolveLucideIcon(concept.icon);
          const expanded = expandedIndex === index;

          return (
            <motion.button
              key={index}
              type="button"
              onClick={() => toggleExpanded(index)}
              aria-expanded={expanded}
              className="overflow-hidden rounded-2xl border border-slate-200/70 border-l-[4px] border-l-rose-400/80 bg-white/95 text-left shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex flex-col gap-2 p-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText}`}
                  >
                    <Icon size={20} />
                  </div>
                  <h4 className={`font-body text-sm font-bold ${theme.textPrimary}`}>{concept.title}</h4>
                </div>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={expanded ? 'open' : 'closed'}
                    className={`font-body text-sm leading-relaxed ${theme.textSecondary} ${
                      expanded ? '' : 'line-clamp-3'
                    }`}
                  >
                    {concept.description}
                  </motion.p>
                </AnimatePresence>
                {!expanded && concept.description.length > 64 ? (
                  <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold uppercase text-slate-500">
                    <ChevronDown className="h-2.5 w-2.5" aria-hidden />
                    expandir
                  </span>
                ) : null}
              </div>
            </motion.button>
          );
        })}
      </div>

      {footerRule ? (
        <p
          className={`relative z-10 mt-3 rounded-xl border px-4 py-3 text-center font-body text-sm font-medium italic leading-relaxed ${theme.borderColor} bg-white/80 ${theme.textSecondary}`}
        >
          {footerRule}
        </p>
      ) : null}
    </div>
  );
}

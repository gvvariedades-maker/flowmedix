'use client';

import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';

export interface VitalConcept {
  icon: string;
  title: string;
  description: string;
  correct?: string;
}

type VitalStatus = 'normal' | 'altered';

const STATUS_LABEL: Record<VitalStatus, string> = {
  normal: 'NORMAL',
  altered: 'ALTERADO',
};

const STATUS_STYLES: Record<
  VitalStatus,
  { border: string; bg: string; badge: string; badgeText: string; ring: string; term: string }
> = {
  normal: {
    border: 'border-l-emerald-400/80',
    bg: 'bg-emerald-50/70',
    badge: 'bg-emerald-100/80',
    badgeText: 'text-emerald-700',
    ring: 'ring-emerald-400/20',
    term: 'text-emerald-700',
  },
  altered: {
    border: 'border-l-amber-400/80',
    bg: 'bg-amber-50/70',
    badge: 'bg-amber-100/80',
    badgeText: 'text-amber-800',
    ring: 'ring-amber-400/20',
    term: 'text-amber-800',
  },
};

function inferVitalStatus(concept: VitalConcept): VitalStatus {
  const text = `${concept.correct || ''} ${concept.description} ${concept.title}`.toLowerCase();
  if (/taqui|bradi|febril|hipoten|hipertens|alterad|acima de \d+/.test(text)) {
    return 'altered';
  }
  return 'normal';
}

function StatusBadge({ status }: { status: VitalStatus }) {
  const styles = STATUS_STYLES[status];
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${styles.badge} ${styles.badgeText}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

interface VitalsPanelConceptMapProps {
  concepts: VitalConcept[];
  theme: ThemeColors;
}

export const VitalsPanelConceptMap = ({ concepts, theme }: VitalsPanelConceptMapProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  }, []);

  const getIcon = (iconName: string) => resolveLucideIcon(iconName);

  if (concepts.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
        {concepts.map((concept, index) => {
          const status = inferVitalStatus(concept);
          const styles = STATUS_STYLES[status];
          const Icon = getIcon(concept.icon);
          const expanded = expandedIndex === index;
          const clinicalTerm = concept.correct?.trim();
          const hasLongText = concept.description.length > 64;

          return (
            <motion.button
              key={index}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * index }}
              onClick={() => toggleExpanded(index)}
              aria-expanded={expanded}
              className={`overflow-hidden rounded-[1.25rem] border border-slate-200/70 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md border-l-[3px] ${styles.bg} ${styles.border} ${
                expanded ? `ring-2 ${styles.ring}` : ''
              }`}
            >
              <div className="flex flex-col gap-2 p-4 md:p-5">
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText}`}
                  >
                    <Icon size={22} />
                  </div>
                  <StatusBadge status={status} />
                </div>
                <h4 className={`font-body text-lg font-bold tracking-normal ${theme.textPrimary}`}>
                  {concept.title}
                </h4>
                {clinicalTerm ? (
                  <p className={`font-display text-sm font-extrabold uppercase tracking-wide ${styles.term}`}>
                    {clinicalTerm}
                  </p>
                ) : null}
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={expanded ? 'open' : 'closed'}
                    initial={{ opacity: 0.85 }}
                    animate={{ opacity: 1 }}
                    className={`font-body text-sm leading-relaxed ${theme.textSecondary} ${
                      expanded ? '' : 'line-clamp-2'
                    }`}
                  >
                    {concept.description}
                  </motion.p>
                </AnimatePresence>
                {!expanded && hasLongText ? (
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
                    <ChevronDown className="h-2.5 w-2.5" aria-hidden />
                    expandir
                  </span>
                ) : null}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

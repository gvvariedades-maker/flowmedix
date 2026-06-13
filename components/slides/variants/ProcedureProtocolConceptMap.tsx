'use client';

import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';

export interface Concept {
  icon: string;
  title: string;
  description: string;
}

type StatusKind = 'true' | 'false' | 'alert' | 'neutral';

const STATUS_LABEL: Record<StatusKind, string> = {
  true: 'VERDADEIRO',
  false: 'FALSO',
  alert: 'ATENÇÃO',
  neutral: 'SAIBA',
};

const STATUS_STYLES: Record<
  StatusKind,
  { border: string; bg: string; badge: string; badgeText: string; ring: string }
> = {
  true: {
    border: 'border-l-emerald-600',
    bg: 'bg-emerald-50',
    badge: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    ring: 'ring-emerald-500/25',
  },
  false: {
    border: 'border-l-rose-600',
    bg: 'bg-rose-50',
    badge: 'bg-rose-100',
    badgeText: 'text-rose-800',
    ring: 'ring-rose-500/25',
  },
  alert: {
    border: 'border-l-amber-500',
    bg: 'bg-amber-50',
    badge: 'bg-amber-100',
    badgeText: 'text-amber-900',
    ring: 'ring-amber-500/25',
  },
  neutral: {
    border: 'border-l-slate-400',
    bg: 'bg-slate-50',
    badge: 'bg-slate-100',
    badgeText: 'text-slate-700',
    ring: 'ring-slate-400/20',
  },
};

function inferStatus(title: string): StatusKind {
  if (/\(V\)\s*$/i.test(title) || /\bverdadeiro\b/i.test(title)) return 'true';
  if (/\(F\)\s*$/i.test(title) || /\bfalso\b/i.test(title)) return 'false';
  const lower = title.toLowerCase();
  if (/alerta|atenção|perigo|risco|parar|recuar|dispneia|cianose/.test(lower)) {
    return 'alert';
  }
  return 'neutral';
}

function StatusBadge({ status }: { status: StatusKind }) {
  const styles = STATUS_STYLES[status];
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${styles.badge} ${styles.badgeText}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

interface ProcedureProtocolConceptMapProps {
  concepts: Concept[];
  theme: ThemeColors;
}

export const ProcedureProtocolConceptMap = ({
  concepts,
  theme,
}: ProcedureProtocolConceptMapProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  }, []);

  const getIcon = (iconName: string) => resolveLucideIcon(iconName);

  if (concepts.length === 0) return null;

  const [featured, ...rest] = concepts;
  const featuredStatus = inferStatus(featured.title);
  const featuredStyles = STATUS_STYLES[featuredStatus];
  const FeaturedIcon = getIcon(featured.icon);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 flex w-full flex-1 flex-col gap-3 md:gap-4">
        {/* Card principal — sempre expandido */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`overflow-hidden rounded-[1.5rem] border border-slate-200 shadow-lg border-l-4 ${featuredStyles.bg} ${featuredStyles.border}`}
        >
          <div className="flex flex-col gap-3 p-5 md:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${theme.iconBg} ${theme.iconText} shadow-md`}>
                <FeaturedIcon size={28} />
              </div>
              <StatusBadge status={featuredStatus} />
            </div>
            <div>
              <h3 className={`font-body mb-2 text-xl font-bold tracking-normal md:text-2xl ${theme.textPrimary}`}>
                {featured.title}
              </h3>
              <p className={`font-body text-base leading-relaxed md:text-lg ${theme.textSecondary}`}>
                {featured.description}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Grid secundário — colapsável */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
            {rest.map((concept, index) => {
              const status = inferStatus(concept.title);
              const styles = STATUS_STYLES[status];
              const Icon = getIcon(concept.icon);
              const expanded = expandedIndex === index;
              const hasLongText = concept.description.length > 72;

              return (
                <motion.button
                  key={index}
                  type="button"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * (index + 1) }}
                  onClick={() => toggleExpanded(index)}
                  aria-expanded={expanded}
                  className={`overflow-hidden rounded-[1.25rem] border border-slate-200 text-left shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg border-l-[3px] ${styles.bg} ${styles.border} ${
                    expanded ? `ring-2 ${styles.ring}` : ''
                  }`}
                >
                  <div className="flex flex-col gap-2 p-4 md:p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText}`}>
                        <Icon size={22} />
                      </div>
                      <StatusBadge status={status} />
                    </div>
                    <h4 className={`font-body text-lg font-bold tracking-normal ${theme.textPrimary}`}>
                      {concept.title}
                    </h4>
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
                    {!expanded && hasLongText && (
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
                        <ChevronDown className="h-2.5 w-2.5" aria-hidden />
                        expandir
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

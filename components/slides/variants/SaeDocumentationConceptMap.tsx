'use client';

import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';

export interface SaeConcept {
  icon: string;
  title: string;
  description: string;
}

type RoleKind = 'enfermeiro' | 'equipe' | 'norma' | 'etica' | 'prova';

const ROLE_LABEL: Record<RoleKind, string> = {
  enfermeiro: 'PRIVATIVO ENF',
  equipe: 'EQUIPE',
  norma: 'NORMA / LEI',
  etica: 'ÉTICA',
  prova: 'PADRÃO PROVA',
};

const ROLE_STYLES: Record<
  RoleKind,
  { border: string; bg: string; badge: string; badgeText: string; ring: string }
> = {
  enfermeiro: {
    border: 'border-l-violet-500/90',
    bg: 'bg-violet-50/80',
    badge: 'bg-violet-100/90',
    badgeText: 'text-violet-900',
    ring: 'ring-violet-400/25',
  },
  equipe: {
    border: 'border-l-indigo-400/80',
    bg: 'bg-indigo-50/70',
    badge: 'bg-indigo-100/80',
    badgeText: 'text-indigo-900',
    ring: 'ring-indigo-400/20',
  },
  norma: {
    border: 'border-l-purple-400/80',
    bg: 'bg-purple-50/70',
    badge: 'bg-purple-100/80',
    badgeText: 'text-purple-900',
    ring: 'ring-purple-400/20',
  },
  etica: {
    border: 'border-l-fuchsia-400/80',
    bg: 'bg-fuchsia-50/70',
    badge: 'bg-fuchsia-100/80',
    badgeText: 'text-fuchsia-900',
    ring: 'ring-fuchsia-400/20',
  },
  prova: {
    border: 'border-l-slate-400/80',
    bg: 'bg-slate-50/80',
    badge: 'bg-slate-100/80',
    badgeText: 'text-slate-700',
    ring: 'ring-slate-400/20',
  },
};

function inferRole(title: string, description: string): RoleKind {
  const text = `${title} ${description}`.toLowerCase();
  if (/privativo|diagnóstico de enfermagem|evolução|avaliação de enfermagem|art\.?\s*11/.test(text)) {
    return 'enfermeiro';
  }
  if (/cofen|358|lei\s*7\.498|resolução|norma central/.test(text)) {
    return 'norma';
  }
  if (/ética|carimbo|identificação profissional|integridade do registro/.test(text)) {
    return 'etica';
  }
  if (/prontuário|técnico|auxiliar|equipe|compartilhado|anotação de enfermagem/.test(text)) {
    if (/privativo/.test(text)) return 'enfermeiro';
    return 'equipe';
  }
  if (/fepese|padrão|banca/.test(text)) return 'prova';
  return 'norma';
}

function RoleBadge({ role }: { role: RoleKind }) {
  const styles = ROLE_STYLES[role];
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${styles.badge} ${styles.badgeText}`}
    >
      {ROLE_LABEL[role]}
    </span>
  );
}

interface SaeDocumentationConceptMapProps {
  concepts: SaeConcept[];
  theme: ThemeColors;
}

export const SaeDocumentationConceptMap = ({ concepts, theme }: SaeDocumentationConceptMapProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  }, []);

  const getIcon = (iconName: string) => resolveLucideIcon(iconName);

  if (concepts.length === 0) return null;

  const [featured, ...rest] = concepts;
  const featuredRole = inferRole(featured.title, featured.description);
  const featuredStyles = ROLE_STYLES[featuredRole];
  const FeaturedIcon = getIcon(featured.icon);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 flex w-full flex-1 flex-col gap-3 md:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`overflow-hidden rounded-[1.5rem] border border-violet-200/70 shadow-md border-l-4 ${featuredStyles.bg} ${featuredStyles.border}`}
        >
          <div className="flex flex-col gap-3 p-5 md:p-6">
            <div className="flex items-start justify-between gap-3">
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${theme.iconBg} ${theme.iconText} shadow-md`}
              >
                <FeaturedIcon size={28} />
              </div>
              <RoleBadge role={featuredRole} />
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

        {rest.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
            {rest.map((concept, index) => {
              const role = inferRole(concept.title, concept.description);
              const styles = ROLE_STYLES[role];
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
                      <RoleBadge role={role} />
                    </div>
                    <h4 className={`font-body text-base font-bold tracking-normal ${theme.textPrimary}`}>
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
        ) : null}
      </div>
    </div>
  );
};

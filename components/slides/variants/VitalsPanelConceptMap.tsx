'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import { inferMeasuredVitalStatus } from '@/lib/slides/vitalsSlideUtils';

export interface VitalConcept {
  icon: string;
  title: string;
  description: string;
  correct?: string;
}

type VitalStatus = 'normal' | 'altered' | 'technique' | 'trap' | 'case';

const STATUS_LABEL: Record<VitalStatus, string> = {
  normal: 'NORMAL',
  altered: 'ALTERADO',
  technique: 'TÉCNICA',
  trap: 'PEGADINHA',
  case: 'CASO',
};

/** Paleta por status — massa colorida (barra G2), não pastel flat. */
const STATUS_STYLES: Record<
  VitalStatus,
  { border: string; bg: string; badge: string; badgeText: string; iconWrap: string; term: string }
> = {
  normal: {
    border: 'border-l-emerald-500',
    bg: 'bg-gradient-to-br from-emerald-100 via-emerald-50 to-teal-50',
    badge: 'bg-emerald-600',
    badgeText: 'text-white',
    iconWrap: 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30',
    term: 'text-emerald-900',
  },
  altered: {
    border: 'border-l-amber-500',
    bg: 'bg-gradient-to-br from-amber-100 via-orange-50 to-amber-50',
    badge: 'bg-amber-600',
    badgeText: 'text-white',
    iconWrap: 'bg-amber-600 text-white shadow-md shadow-amber-500/30',
    term: 'text-amber-950',
  },
  technique: {
    border: 'border-l-rose-500',
    bg: 'bg-gradient-to-br from-rose-100 via-pink-50 to-rose-50',
    badge: 'bg-rose-600',
    badgeText: 'text-white',
    iconWrap: 'bg-rose-600 text-white shadow-md shadow-rose-500/30',
    term: 'text-rose-950',
  },
  trap: {
    border: 'border-l-violet-500',
    bg: 'bg-gradient-to-br from-violet-100 via-fuchsia-50 to-amber-50',
    badge: 'bg-violet-700',
    badgeText: 'text-white',
    iconWrap: 'bg-violet-700 text-white shadow-md shadow-violet-500/30',
    term: 'text-violet-950',
  },
  case: {
    border: 'border-l-sky-500',
    bg: 'bg-gradient-to-br from-sky-100 via-cyan-50 to-sky-50',
    badge: 'bg-sky-600',
    badgeText: 'text-white',
    iconWrap: 'bg-sky-600 text-white shadow-md shadow-sky-500/30',
    term: 'text-sky-950',
  },
};

function inferVitalStatus(concept: VitalConcept): VitalStatus {
  const text = `${concept.correct || ''} ${concept.description} ${concept.title}`.toLowerCase();
  if (/pegadinha|armadilha|cuidado com|distrator/.test(text)) return 'trap';
  if (
    /^(cen[aá]rio|visita|caso)\b/.test(concept.title.toLowerCase()) ||
    /\b(visita domiciliar|caso cl[ií]nico|caso da prova|cen[aá]rio da prova)\b/.test(text)
  ) {
    return 'case';
  }

  // Termo clínico explícito em `correct` (golden/concept com gabarito semântico)
  if (concept.correct?.trim()) {
    if (
      /\b(taqui|bradi|febril|hipoten|hipertens|alterad|hipox)\w*/.test(concept.correct.toLowerCase()) &&
      !/\b(afebril|normo)/.test(concept.correct.toLowerCase())
    ) {
      return 'altered';
    }
    if (/\b(normo|afebril|eupne|eupn[eé]ico)\w*/.test(concept.correct.toLowerCase())) {
      return 'normal';
    }
  }

  // Interpretação: valor aferido no título → NORMAL/ALTERADO sem vazar o termo
  const measured = inferMeasuredVitalStatus(`${concept.title} ${concept.description}`);
  if (measured) return measured;

  if (/\b(taquic|bradic|febril|hipoten|hipertens|alterad)\w*/.test(text)) return 'altered';
  if (!concept.correct?.trim()) return 'technique';
  return 'normal';
}

function StatusBadge({ status }: { status: VitalStatus }) {
  const styles = STATUS_STYLES[status];
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[9px] font-black uppercase tracking-widest shadow-sm ${styles.badge} ${styles.badgeText}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

interface VitalsPanelConceptMapProps {
  concepts: VitalConcept[];
  theme: ThemeColors;
}

/** Painel SV colorido + glanceable (0 taps). */
export const VitalsPanelConceptMap = ({ concepts, theme }: VitalsPanelConceptMapProps) => {
  const getIcon = (iconName: string) => resolveLucideIcon(iconName);

  if (concepts.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-45`} />

      <div className="relative z-10 grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
        {concepts.map((concept, index) => {
          const status = inferVitalStatus(concept);
          const styles = STATUS_STYLES[status];
          const Icon = getIcon(concept.icon);
          const clinicalTerm = concept.correct?.trim();

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              className={`overflow-hidden rounded-[1.25rem] border-2 border-white/80 text-left shadow-md border-l-[5px] ${styles.bg} ${styles.border}`}
            >
              <div className="flex flex-col gap-2.5 p-4 md:p-5">
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.iconWrap}`}
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
                <p className={`font-body text-sm leading-relaxed ${theme.textSecondary}`}>
                  {concept.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

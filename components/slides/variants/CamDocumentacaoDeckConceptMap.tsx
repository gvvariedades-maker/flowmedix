'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ClipboardList } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import { inferVfChip } from '@/lib/slides/camSlideUtils';
import {
  inferCamDocumentacaoCategory,
  type CamDocumentacaoCategory,
} from '@/lib/slides/camDocumentacaoSlideUtils';

export interface CamDocumentacaoConcept {
  icon: string;
  title: string;
  description: string;
}

const CATEGORY_META: Record<
  CamDocumentacaoCategory,
  { label: string; border: string; badge: string; badgeText: string; ring: string }
> = {
  apos_administrar: {
    label: 'APÓS DOSE',
    border: 'border-l-teal-400/90',
    badge: 'bg-teal-100/90',
    badgeText: 'text-teal-800',
    ring: 'ring-teal-400/25',
  },
  antecipado: {
    label: 'ANTECIPADO',
    border: 'border-l-rose-400/90',
    badge: 'bg-rose-100/90',
    badgeText: 'text-rose-800',
    ring: 'ring-rose-400/25',
  },
  postergado: {
    label: 'POSTERGAR',
    border: 'border-l-amber-400/90',
    badge: 'bg-amber-100/90',
    badgeText: 'text-amber-900',
    ring: 'ring-amber-400/25',
  },
  registro_campo: {
    label: 'CAMPOS',
    border: 'border-l-cyan-400/90',
    badge: 'bg-cyan-100/90',
    badgeText: 'text-cyan-900',
    ring: 'ring-cyan-400/25',
  },
  pegadinha: {
    label: 'PEGADINHA',
    border: 'border-l-rose-500/90',
    badge: 'bg-rose-100/90',
    badgeText: 'text-rose-800',
    ring: 'ring-rose-400/30',
  },
  geral: {
    label: 'REGISTRO',
    border: 'border-l-slate-300/80',
    badge: 'bg-slate-100/90',
    badgeText: 'text-slate-700',
    ring: 'ring-slate-300/25',
  },
};

function VfChip({ verdict }: { verdict: 'V' | 'F' }) {
  const isTrue = verdict === 'V';
  return (
    <span
      className={`shrink-0 rounded-lg px-2 py-1 font-display text-xs font-black tabular-nums ${
        isTrue ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
      }`}
    >
      {verdict}
    </span>
  );
}

interface CamDocumentacaoDeckConceptMapProps {
  concepts: CamDocumentacaoConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function CamDocumentacaoDeckConceptMap({
  concepts,
  theme,
  footerRule,
}: CamDocumentacaoDeckConceptMapProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  }, []);

  if (concepts.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 mb-3 flex items-center gap-2 px-1">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-cyan-900 shadow-sm">
          <ClipboardList className="h-3 w-3" aria-hidden />
          Registro certo
        </span>
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
        {concepts.map((concept, index) => {
          const category = inferCamDocumentacaoCategory(`${concept.title} ${concept.description}`);
          const meta = CATEGORY_META[category];
          const Icon = resolveLucideIcon(concept.icon);
          const expanded = expandedIndex === index;
          const hasLongText = concept.description.length > 64;
          const isFocus = category === 'apos_administrar' || category === 'registro_campo';
          const vfChip = inferVfChip(`${concept.title} ${concept.description}`);

          return (
            <motion.button
              key={index}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * index }}
              onClick={() => toggleExpanded(index)}
              aria-expanded={expanded}
              className={`overflow-hidden rounded-[1.25rem] border border-slate-200/70 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md border-l-[4px] ${meta.border} ${
                isFocus
                  ? `ring-2 ${meta.ring} bg-gradient-to-br from-white via-cyan-50/40 to-teal-50/50`
                  : 'bg-white/95'
              }`}
            >
              <div className="flex flex-col gap-2 p-4 md:p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText}`}
                    >
                      <Icon size={22} />
                    </div>
                    {vfChip ? <VfChip verdict={vfChip} /> : null}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${meta.badge} ${meta.badgeText}`}
                  >
                    {meta.label}
                  </span>
                </div>
                <h4 className={`font-body text-base font-bold tracking-normal md:text-lg ${theme.textPrimary}`}>
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

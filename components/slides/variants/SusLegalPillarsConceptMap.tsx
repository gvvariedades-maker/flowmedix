'use client';

import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { SlideLucideIcon } from '../core/SlideLucideIcon';

export interface SusPillarConcept {
  icon: string;
  title: string;
  description: string;
}

type PillarKind = 'acoes' | 'esferas' | 'gestao' | 'fundacoes' | 'contexto' | 'prova' | 'norma';

const PILLAR_LABEL: Record<PillarKind, string> = {
  acoes: 'Ações + serviços',
  esferas: '3 esferas',
  gestao: 'Direta + indireta',
  fundacoes: 'Fundações',
  contexto: 'Contexto CF',
  prova: 'Padrão banca',
  norma: 'Norma / artigo',
};

const PILLAR_STYLES: Record<
  PillarKind,
  {
    border: string;
    card: string;
    iconBg: string;
    iconText: string;
    title: string;
    chip: string;
    ring: string;
  }
> = {
  acoes: {
    border: 'border-l-emerald-500',
    card: 'border-emerald-200/80 bg-gradient-to-br from-emerald-50/95 via-white to-teal-50/70',
    iconBg: 'bg-emerald-200/90',
    iconText: 'text-emerald-900',
    title: 'text-emerald-950',
    chip: 'bg-emerald-100 text-emerald-800',
    ring: 'ring-emerald-400/30',
  },
  esferas: {
    border: 'border-l-sky-500',
    card: 'border-sky-200/80 bg-gradient-to-br from-sky-50/95 via-white to-cyan-50/70',
    iconBg: 'bg-sky-200/85',
    iconText: 'text-sky-900',
    title: 'text-sky-950',
    chip: 'bg-sky-100 text-sky-800',
    ring: 'ring-sky-400/30',
  },
  gestao: {
    border: 'border-l-teal-500',
    card: 'border-teal-200/80 bg-gradient-to-br from-teal-50/95 via-white to-cyan-50/70',
    iconBg: 'bg-teal-200/85',
    iconText: 'text-teal-900',
    title: 'text-teal-950',
    chip: 'bg-teal-100 text-teal-800',
    ring: 'ring-teal-400/30',
  },
  fundacoes: {
    border: 'border-l-lime-500',
    card: 'border-lime-200/80 bg-gradient-to-br from-lime-50/95 via-white to-green-50/70',
    iconBg: 'bg-lime-200/85',
    iconText: 'text-lime-900',
    title: 'text-lime-950',
    chip: 'bg-lime-100 text-lime-800',
    ring: 'ring-lime-400/30',
  },
  contexto: {
    border: 'border-l-amber-400',
    card: 'border-amber-200/80 bg-gradient-to-br from-amber-50/90 via-white to-yellow-50/60',
    iconBg: 'bg-amber-200/85',
    iconText: 'text-amber-900',
    title: 'text-amber-950',
    chip: 'bg-amber-100 text-amber-900',
    ring: 'ring-amber-400/25',
  },
  prova: {
    border: 'border-l-orange-400',
    card: 'border-orange-200/80 bg-gradient-to-br from-orange-50/90 via-white to-amber-50/60',
    iconBg: 'bg-orange-200/85',
    iconText: 'text-orange-900',
    title: 'text-orange-950',
    chip: 'bg-orange-100 text-orange-900',
    ring: 'ring-orange-400/25',
  },
  norma: {
    border: 'border-l-emerald-600',
    card: 'border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/50',
    iconBg: 'bg-emerald-300/80',
    iconText: 'text-emerald-950',
    title: 'text-emerald-950',
    chip: 'bg-emerald-100 text-emerald-900',
    ring: 'ring-emerald-500/25',
  },
};

const CORE_PILLARS: PillarKind[] = ['acoes', 'esferas', 'gestao', 'fundacoes'];

function inferPillar(title: string, description: string): PillarKind {
  const text = `${title} ${description}`.toLowerCase();
  if (/ações \+ serviços|ações e serviços/.test(text)) return 'acoes';
  if (/três esferas|união, estados|federais, estaduais/.test(text)) return 'esferas';
  if (/direta e indireta|administração direta/.test(text)) return 'gestao';
  if (/fundações/.test(text)) return 'fundacoes';
  if (/universalidade|integralidade|art\.?\s*196|cf/.test(text)) return 'contexto';
  if (/cesgranrio|padrão|banca/.test(text)) return 'prova';
  if (/art\.?\s*4|lei orgânica|8\.080/.test(text)) return 'norma';
  return 'norma';
}

function PillarCard({
  concept,
  pillar,
  expanded,
  onToggle,
  hasLongText,
}: {
  concept: SusPillarConcept;
  pillar: PillarKind;
  expanded: boolean;
  onToggle: () => void;
  hasLongText: boolean;
}) {
  const styles = PILLAR_STYLES[pillar];
    return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      className={`h-full w-full overflow-hidden rounded-xl border text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md border-l-[4px] ${styles.card} ${styles.border} ${
        expanded ? `ring-2 ${styles.ring}` : ''
      }`}
    >
      <div className="flex h-full flex-col gap-2 p-3.5 md:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${styles.iconBg} ${styles.iconText}`}>
            <SlideLucideIcon name={concept.icon} size={18} />
          </div>
          <span className={`rounded-full px-2 py-0.5 font-mono text-[8px] font-bold uppercase tracking-widest ${styles.chip}`}>
            {PILLAR_LABEL[pillar]}
          </span>
        </div>
        <h4 className={`font-body text-sm font-bold leading-snug ${styles.title}`}>{concept.title}</h4>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={expanded ? 'open' : 'closed'}
            initial={{ opacity: 0.88 }}
            animate={{ opacity: 1 }}
            className={`font-body text-sm leading-relaxed text-slate-700 ${expanded ? '' : 'line-clamp-3'}`}
          >
            {concept.description}
          </motion.p>
        </AnimatePresence>
        {!expanded && hasLongText ? (
          <span className="mt-auto inline-flex items-center gap-1 self-start rounded-full bg-white/90 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
            <ChevronDown className="h-2.5 w-2.5" aria-hidden />
            expandir
          </span>
        ) : null}
      </div>
    </motion.button>
  );
}

interface SusLegalPillarsConceptMapProps {
  concepts: SusPillarConcept[];
  theme: ThemeColors;
}

export const SusLegalPillarsConceptMap = ({ concepts, theme }: SusLegalPillarsConceptMapProps) => {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const toggleExpanded = useCallback((key: string) => {
    setExpandedKey((current) => (current === key ? null : key));
  }, []);

  if (concepts.length === 0) return null;

  const [hero, ...rest] = concepts;
    const coreItems = rest.filter((c) => CORE_PILLARS.includes(inferPillar(c.title, c.description)));
  const supportItems = rest.filter((c) => !CORE_PILLARS.includes(inferPillar(c.title, c.description)));

  const orderedCore = CORE_PILLARS.map((pillar) =>
    coreItems.find((c) => inferPillar(c.title, c.description) === pillar),
  ).filter(Boolean) as SusPillarConcept[];

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-40`} />

      <div className="relative z-10 flex flex-col gap-3 md:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[1.5rem] border border-emerald-300/60 bg-white/95 shadow-md"
        >
          <div className="border-b border-emerald-200/80 bg-gradient-to-r from-emerald-200/80 via-teal-100/70 to-sky-100/70 px-4 py-3 md:px-5">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-900">
              Lei 8.080/1990 — Art. 4º
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {CORE_PILLARS.map((p) => (
                <span
                  key={p}
                  className={`rounded-full px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider ${PILLAR_STYLES[p].chip}`}
                >
                  {PILLAR_LABEL[p]}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 bg-gradient-to-br from-white via-emerald-50/25 to-sky-50/20 p-4 md:flex-row md:gap-4 md:p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-200/90 text-emerald-900 shadow-sm">
              <SlideLucideIcon name={hero.icon} size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-body text-lg font-bold text-emerald-950 md:text-xl">{hero.title}</h3>
              <p className="mt-1.5 font-body text-sm leading-relaxed text-slate-700 md:text-base">
                {hero.description}
              </p>
            </div>
          </div>
        </motion.div>

        {orderedCore.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
            {orderedCore.map((concept, index) => {
              const pillar = inferPillar(concept.title, concept.description);
              const key = `core-${pillar}`;
              const expanded = expandedKey === key;
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * index }}
                  className="min-h-[140px]"
                >
                  <PillarCard
                    concept={concept}
                    pillar={pillar}
                    expanded={expanded}
                    onToggle={() => toggleExpanded(key)}
                    hasLongText={concept.description.length > 80}
                  />
                </motion.div>
              );
            })}
          </div>
        ) : null}

        {supportItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {supportItems.map((concept, index) => {
              const pillar = inferPillar(concept.title, concept.description);
              const key = `support-${index}`;
              const expanded = expandedKey === key;
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <PillarCard
                    concept={concept}
                    pillar={pillar}
                    expanded={expanded}
                    onToggle={() => toggleExpanded(key)}
                    hasLongText={concept.description.length > 72}
                  />
                </motion.div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
};

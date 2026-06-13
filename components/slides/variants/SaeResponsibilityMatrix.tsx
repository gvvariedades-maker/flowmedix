'use client';

import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';

export interface SaeMatrixConcept {
  icon: string;
  title: string;
  description: string;
}

type MatrixLane = 'enfermeiro' | 'equipe' | 'norma' | 'etica' | 'prova';

const LANE_LABEL: Record<MatrixLane, string> = {
  enfermeiro: 'Enfermeiro',
  equipe: 'Equipe',
  norma: 'Norma / lei',
  etica: 'Ética e registro',
  prova: 'Padrão de prova',
};

const LANE_STYLES: Record<
  MatrixLane,
  {
    border: string;
    card: string;
    header: string;
    headerText: string;
    ring: string;
    iconBg: string;
    iconText: string;
    title: string;
    chip: string;
  }
> = {
  enfermeiro: {
    border: 'border-l-violet-500',
    card: 'border-violet-200/80 bg-gradient-to-br from-violet-50/95 via-white to-purple-50/80',
    header: 'bg-gradient-to-r from-violet-200/90 to-purple-100/90',
    headerText: 'text-violet-950',
    ring: 'ring-violet-400/35',
    iconBg: 'bg-violet-200/90',
    iconText: 'text-violet-900',
    title: 'text-violet-950',
    chip: 'bg-violet-100/90 text-violet-800',
  },
  equipe: {
    border: 'border-l-sky-500',
    card: 'border-sky-200/80 bg-gradient-to-br from-sky-50/95 via-white to-cyan-50/75',
    header: 'bg-gradient-to-r from-sky-200/85 to-cyan-100/85',
    headerText: 'text-sky-950',
    ring: 'ring-sky-400/30',
    iconBg: 'bg-sky-200/85',
    iconText: 'text-sky-900',
    title: 'text-sky-950',
    chip: 'bg-sky-100/90 text-sky-800',
  },
  norma: {
    border: 'border-l-indigo-500',
    card: 'border-indigo-200/80 bg-gradient-to-br from-indigo-50/95 via-white to-blue-50/75',
    header: 'bg-gradient-to-r from-indigo-200/85 to-blue-100/85',
    headerText: 'text-indigo-950',
    ring: 'ring-indigo-400/30',
    iconBg: 'bg-indigo-200/85',
    iconText: 'text-indigo-900',
    title: 'text-indigo-950',
    chip: 'bg-indigo-100/90 text-indigo-800',
  },
  etica: {
    border: 'border-l-rose-500',
    card: 'border-rose-200/80 bg-gradient-to-br from-rose-50/95 via-white to-pink-50/75',
    header: 'bg-gradient-to-r from-rose-200/85 to-pink-100/85',
    headerText: 'text-rose-950',
    ring: 'ring-rose-400/30',
    iconBg: 'bg-rose-200/85',
    iconText: 'text-rose-900',
    title: 'text-rose-950',
    chip: 'bg-rose-100/90 text-rose-800',
  },
  prova: {
    border: 'border-l-amber-500',
    card: 'border-amber-200/80 bg-gradient-to-br from-amber-50/95 via-white to-orange-50/75',
    header: 'bg-gradient-to-r from-amber-200/85 to-orange-100/85',
    headerText: 'text-amber-950',
    ring: 'ring-amber-400/30',
    iconBg: 'bg-amber-200/85',
    iconText: 'text-amber-900',
    title: 'text-amber-950',
    chip: 'bg-amber-100/90 text-amber-900',
  },
};

function inferLane(title: string, description: string): MatrixLane {
  const text = `${title} ${description}`.toLowerCase();
  if (/privativo|diagnóstico de enfermagem|evolução|avaliação de enfermagem|art\.?\s*11/.test(text)) {
    return 'enfermeiro';
  }
  if (/prontuário compartilhado|técnico|auxiliar|ações de cuidado|colaborativo|anotação de enfermagem/.test(text)) {
    return 'equipe';
  }
  if (/cofen|358|lei\s*7\.498|resolução/.test(text)) return 'norma';
  if (/carimbo|identificação|integridade|lápis|rasura|verídico/.test(text)) return 'etica';
  if (/fepese|padrão|banca/.test(text)) return 'prova';
  return 'norma';
}

function MatrixCard({
  concept,
  lane,
  expanded,
  onToggle,
  hasLongText,
}: {
  concept: SaeMatrixConcept;
  lane: MatrixLane;
  expanded: boolean;
  onToggle: () => void;
  hasLongText: boolean;
}) {
  const styles = LANE_STYLES[lane];
  const Icon = resolveLucideIcon(concept.icon);

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      className={`w-full overflow-hidden rounded-xl border text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md border-l-[4px] ${styles.card} ${styles.border} ${
        expanded ? `ring-2 ${styles.ring}` : ''
      }`}
    >
      <div className="flex flex-col gap-2 p-3.5 md:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-start gap-2.5">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-sm ${styles.iconBg} ${styles.iconText}`}
            >
              <Icon size={18} />
            </div>
            <h4 className={`min-w-0 flex-1 font-body text-sm font-bold leading-snug tracking-normal ${styles.title}`}>
              {concept.title}
            </h4>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[8px] font-bold uppercase tracking-widest ${styles.chip}`}
          >
            {LANE_LABEL[lane]}
          </span>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={expanded ? 'open' : 'closed'}
            initial={{ opacity: 0.88 }}
            animate={{ opacity: 1 }}
            className={`font-body text-sm leading-relaxed text-slate-700 ${expanded ? '' : 'line-clamp-2'}`}
          >
            {concept.description}
          </motion.p>
        </AnimatePresence>
        {!expanded && hasLongText ? (
          <span className="inline-flex items-center gap-1 self-start rounded-full bg-white/90 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500 shadow-sm">
            <ChevronDown className="h-2.5 w-2.5" aria-hidden />
            expandir
          </span>
        ) : null}
      </div>
    </motion.button>
  );
}

interface SaeResponsibilityMatrixProps {
  concepts: SaeMatrixConcept[];
  theme: ThemeColors;
}

export const SaeResponsibilityMatrix = ({ concepts, theme }: SaeResponsibilityMatrixProps) => {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const toggleExpanded = useCallback((key: string) => {
    setExpandedKey((current) => (current === key ? null : key));
  }, []);

  if (concepts.length === 0) return null;

  const [hero, ...rest] = concepts;
  const HeroIcon = resolveLucideIcon(hero.icon);

  const enfermeiroItems = rest.filter((c) => inferLane(c.title, c.description) === 'enfermeiro');
  const otherLanes: MatrixLane[] = ['equipe', 'norma', 'etica', 'prova'];
  const rightItems = rest.filter((c) => inferLane(c.title, c.description) !== 'enfermeiro');

  const renderLaneGroup = (lane: MatrixLane, items: SaeMatrixConcept[], keyPrefix: string) => {
    if (items.length === 0) return null;
    const styles = LANE_STYLES[lane];
    return (
      <div key={lane} className="flex flex-col gap-2">
        <div className={`rounded-lg px-3 py-1.5 shadow-sm ${styles.header}`}>
          <span className={`font-mono text-[10px] font-bold uppercase tracking-widest ${styles.headerText}`}>
            {LANE_LABEL[lane]}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {items.map((concept, index) => {
            const key = `${keyPrefix}-${lane}-${index}`;
            const expanded = expandedKey === key;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * index }}
              >
                <MatrixCard
                  concept={concept}
                  lane={lane}
                  expanded={expanded}
                  onToggle={() => toggleExpanded(key)}
                  hasLongText={concept.description.length > 72}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const rightByLane = otherLanes
    .map((lane) => ({
      lane,
      items: rightItems.filter((c) => inferLane(c.title, c.description) === lane),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-40`} />

      <div className="relative z-10 flex flex-col gap-3 md:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[1.5rem] border border-violet-300/60 bg-white/95 shadow-md"
        >
          <div className="border-b border-violet-200/80 bg-gradient-to-r from-violet-200/80 via-fuchsia-100/70 to-indigo-100/80 px-4 py-3 md:px-5">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-violet-900">
              Mnemônico de prova — privativa SAE
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-violet-600 px-2.5 py-1 font-mono text-xs font-black text-white shadow-sm">
                D
              </span>
              <span className="font-body text-sm font-bold text-violet-950">+</span>
              <span className="rounded-lg bg-fuchsia-600 px-2.5 py-1 font-mono text-xs font-black text-white shadow-sm">
                E/A
              </span>
              <span className="font-body text-sm font-bold text-violet-950">=</span>
              <span className="rounded-full bg-emerald-500 px-3 py-1 font-body text-sm font-bold text-white shadow-sm">
                Enfermeiro
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-3 bg-gradient-to-br from-white via-violet-50/30 to-indigo-50/20 p-4 md:flex-row md:items-start md:gap-4 md:p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-200/90 text-violet-900 shadow-sm">
              <HeroIcon size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className={`font-body text-lg font-bold tracking-normal text-violet-950 md:text-xl`}>
                {hero.title}
              </h3>
              <p className={`mt-1.5 font-body text-sm leading-relaxed text-slate-700 md:text-base`}>
                {hero.description}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
          <div className="flex flex-col gap-3 rounded-[1.25rem] border border-violet-300/50 bg-gradient-to-b from-violet-100/50 via-violet-50/30 to-white p-3 shadow-sm md:p-4">
            <div className="rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 px-3 py-2 shadow-sm">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-white">
                Coluna privativa — Enfermeiro
              </span>
            </div>
            {enfermeiroItems.length > 0 ? (
              renderLaneGroup('enfermeiro', enfermeiroItems, 'left')
            ) : (
              <p className="font-body text-sm text-violet-900/80">
                Diagnóstico de enfermagem e evolução/avaliação são exclusivos do enfermeiro.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 rounded-[1.25rem] border border-indigo-300/50 bg-gradient-to-b from-sky-100/40 via-indigo-50/30 to-amber-50/20 p-3 shadow-sm md:p-4">
            <div className="rounded-lg bg-gradient-to-r from-indigo-500 via-sky-600 to-cyan-600 px-3 py-2 shadow-sm">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-white">
                Coluna colaborativa — Equipe e normas
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {rightByLane.map(({ lane, items }) => renderLaneGroup(lane, items, 'right'))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';

export interface DoseEquivConcept {
  icon: string;
  title: string;
  description: string;
}

type EqSlot = 'ml-gotas' | 'ml-micro' | 'gota-micro' | 'insulina';
type ConceptKind = EqSlot | 'compare' | 'exam' | 'exception' | 'gts-min';

const EQUIV_SLOTS: {
  id: EqSlot;
  label: string;
  full: string;
  constant: string;
  tag: string;
  bar: string;
  barSoft: string;
  panelGradient: string;
  active: string;
  text: string;
  accentBorder: string;
  examTip: string;
  focus?: boolean;
}[] = [
  {
    id: 'ml-gotas',
    label: '20',
    full: '1 mL = 20 gotas',
    constant: 'gotas/mL',
    tag: 'macrogota',
    bar: 'bg-blue-500',
    barSoft: 'bg-blue-100/80',
    panelGradient: 'from-blue-50/95 via-white to-white',
    active: 'border-blue-500 bg-blue-50 ring-2 ring-blue-400/50',
    text: 'text-blue-950',
    accentBorder: 'border-l-blue-500',
    examTip: 'Letra B — constante padrão brasileira para equipo de macrogota em prova.',
    focus: true,
  },
  {
    id: 'ml-micro',
    label: '60',
    full: '1 mL = 60 microgotas',
    constant: 'micro/mL',
    tag: 'microgota',
    bar: 'bg-indigo-500',
    barSoft: 'bg-indigo-100/80',
    panelGradient: 'from-indigo-50/95 via-white to-white',
    active: 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-400/50',
    text: 'text-indigo-950',
    accentBorder: 'border-l-indigo-500',
    examTip: 'Equipo de microgotas — base para gts/min quando o enunciado citar microgota.',
  },
  {
    id: 'gota-micro',
    label: '3',
    full: '1 gota = 3 microgotas',
    constant: 'micro/gota',
    tag: 'conversão',
    bar: 'bg-violet-500',
    barSoft: 'bg-violet-100/80',
    panelGradient: 'from-violet-50/95 via-white to-white',
    active: 'border-violet-500 bg-violet-50 ring-2 ring-violet-400/50',
    text: 'text-violet-950',
    accentBorder: 'border-l-violet-500',
    examTip: 'Letras C e D erram aqui — 35 e 10 microgotas por gota são inventados; o certo é 3.',
  },
  {
    id: 'insulina',
    label: '100',
    full: 'Insulina U-100',
    constant: 'UI/mL',
    tag: 'U-100',
    bar: 'bg-sky-500',
    barSoft: 'bg-sky-100/80',
    panelGradient: 'from-sky-50/95 via-white to-white',
    active: 'border-sky-500 bg-sky-50 ring-2 ring-sky-400/50',
    text: 'text-sky-950',
    accentBorder: 'border-l-sky-500',
    examTip: 'Letra A troca 100 por 10 UI/mL — mantém o nome U-100, mas erra a concentração.',
  },
];

function inferConceptKind(title: string, description: string): ConceptKind {
  const text = `${title} ${description}`.toLowerCase();
  if (/comparativo|trio|20-60-3|20\/60\/3/.test(text)) return 'compare';
  if (/gts\/min|infusão|equipo/.test(text)) return 'gts-min';
  if (/idecan|padrão|banca/.test(text)) return 'exam';
  if (/exceç|fogem aos padrões/.test(text)) return 'exception';
  if (/insulina|u-100|\bui\b/.test(text)) return 'insulina';
  if (/1 gota.*3 micro|gota = 3|macrogota.*3/.test(text)) return 'gota-micro';
  if (/60 micro|microgotas/.test(text) && !/35/.test(text)) return 'ml-micro';
  if (/20 gotas|1 ml.*20|macrogota/.test(text)) return 'ml-gotas';
  if (/35 micro/.test(text)) return 'gota-micro';
  return 'ml-gotas';
}

interface DoseEquivalenceRailConceptMapProps {
  concepts: DoseEquivConcept[];
  theme: ThemeColors;
}

export const DoseEquivalenceRailConceptMap = ({
  concepts,
  theme,
}: DoseEquivalenceRailConceptMapProps) => {
  const [selected, setSelected] = useState<EqSlot>('ml-gotas');

  const { bySlot, shared } = useMemo(() => {
    const slots: Record<EqSlot, DoseEquivConcept[]> = {
      'ml-gotas': [],
      'ml-micro': [],
      'gota-micro': [],
      insulina: [],
    };
    const sharedItems: { kind: 'compare' | 'exam' | 'exception' | 'gts-min'; concept: DoseEquivConcept }[] =
      [];

    for (const concept of concepts) {
      const kind = inferConceptKind(concept.title, concept.description);
      if (kind === 'compare' || kind === 'exam' || kind === 'exception' || kind === 'gts-min') {
        sharedItems.push({ kind, concept });
      } else {
        slots[kind].push(concept);
      }
    }

    return { bySlot: slots, shared: sharedItems };
  }, [concepts]);

  const selectSlot = useCallback((slot: EqSlot) => {
    setSelected(slot);
  }, []);

  const activeSlot = EQUIV_SLOTS.find((s) => s.id === selected)!;
  const activeConcepts = bySlot[selected];
  const compareConcept = shared.find((s) => s.kind === 'compare')?.concept;
  const examConcept = shared.find((s) => s.kind === 'exam')?.concept;
  const exceptionConcept = shared.find((s) => s.kind === 'exception')?.concept;
  const gtsConcept = shared.find((s) => s.kind === 'gts-min')?.concept;

  const detailSections = useMemo(() => {
    const sections: { title: string; body: string; icon: string; highlight?: boolean }[] = [];

    for (const concept of activeConcepts) {
      sections.push({
        title: concept.title,
        body: concept.description,
        icon: concept.icon,
      });
    }

    if (compareConcept) {
      sections.push({
        title: compareConcept.title,
        body: compareConcept.description,
        icon: compareConcept.icon,
      });
    }

    if (gtsConcept && (selected === 'ml-gotas' || selected === 'ml-micro')) {
      sections.push({
        title: gtsConcept.title,
        body: gtsConcept.description,
        icon: gtsConcept.icon,
        highlight: true,
      });
    }

    if (exceptionConcept) {
      sections.push({
        title: exceptionConcept.title,
        body: exceptionConcept.description,
        icon: exceptionConcept.icon,
      });
    }

    if (examConcept) {
      sections.push({
        title: examConcept.title,
        body: examConcept.description,
        icon: examConcept.icon,
        highlight: selected === 'ml-gotas',
      });
    }

    return sections;
  }, [activeConcepts, compareConcept, examConcept, exceptionConcept, gtsConcept, selected]);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 flex flex-col gap-3 md:gap-4">
        <div className="rounded-2xl border border-blue-200/70 bg-white/90 px-4 py-3 shadow-sm">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-blue-800">
            Trilho de equivalências
          </p>
          <p className="font-body text-sm font-semibold text-slate-700">
            Toque cada constante — memorize 20 · 60 · 3 · U-100 antes de qualquer conta
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,11rem)_1fr] md:gap-4">
          <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-sm">
            <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
              Constantes de prova
            </p>
            {EQUIV_SLOTS.map((slot) => {
              const isActive = selected === slot.id;
              return (
                <motion.button
                  key={slot.id}
                  type="button"
                  onClick={() => selectSlot(slot.id)}
                  whileTap={{ scale: 0.98 }}
                  className={`rounded-xl border-2 p-2.5 text-left transition-shadow ${
                    isActive
                      ? `ring-2 ${slot.active}`
                      : slot.focus
                        ? 'border-blue-300/80 bg-blue-50/40'
                        : 'border-slate-200/80 bg-slate-50/50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className={`font-mono text-lg font-black tabular-nums ${slot.text}`}>
                        {slot.label}
                      </p>
                      <p className="font-body text-[10px] font-medium text-slate-600">{slot.full}</p>
                    </div>
                    {slot.focus ? (
                      <span className="rounded-full bg-blue-500 px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase text-white">
                        B
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 font-mono text-[8px] font-bold uppercase tracking-wide text-slate-500">
                    {slot.tag}
                  </p>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              className={`flex min-h-[14rem] flex-col overflow-hidden rounded-2xl border-2 bg-gradient-to-br shadow-xl ring-1 ring-black/5 ${activeSlot.panelGradient} ${activeSlot.active}`}
            >
              <div className={`border-b border-slate-200/60 px-4 py-4 md:px-5 ${activeSlot.barSoft}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-md ${activeSlot.bar} text-white`}
                    >
                      <Droplets className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <p className={`font-body text-xl font-bold leading-tight ${activeSlot.text}`}>
                        {activeSlot.full}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        {activeSlot.constant}
                      </p>
                    </div>
                  </div>
                  {activeSlot.focus && selected === 'ml-gotas' ? (
                    <span className="shrink-0 rounded-full bg-blue-500 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wide text-white shadow-sm">
                      gabarito
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-3 md:px-5 md:py-4">
                {detailSections.length > 0 ? (
                  detailSections.map((section, index) => {
                    const Icon = resolveLucideIcon(section.icon);
                    return (
                      <div
                        key={index}
                        className={`rounded-xl border border-slate-200/70 border-l-[4px] bg-white/80 p-3 shadow-sm ${activeSlot.accentBorder} ${
                          section.highlight ? 'ring-1 ring-blue-200/80' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span
                            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${activeSlot.barSoft} ${activeSlot.text}`}
                          >
                            <Icon className="h-4 w-4" aria-hidden />
                          </span>
                          <div className="min-w-0">
                            <p className="font-body text-sm font-bold text-slate-900">{section.title}</p>
                            <p className="mt-1.5 font-body text-sm leading-relaxed text-slate-700">
                              {section.body}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="font-body text-sm leading-relaxed text-slate-600">
                    Toque outra constante no trilho para ver detalhes e pegadinhas.
                  </p>
                )}

                <div className="mt-1 rounded-xl border border-blue-200/80 bg-blue-50/90 px-3.5 py-3 shadow-sm">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-600">
                    Dica de prova
                  </p>
                  <p className="mt-1 font-body text-sm font-semibold leading-relaxed text-blue-950">
                    {activeSlot.examTip}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

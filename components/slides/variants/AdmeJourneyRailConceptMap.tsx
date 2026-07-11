'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { SlideLucideIcon } from '../core/SlideLucideIcon';
import {
  inferAdmeConceptKind,
  type PkSlot,
} from '@/lib/slides/admeJourneyRailUtils';

export interface PkPdConcept {
  icon: string;
  title: string;
  description: string;
}

const PK_SLOTS: {
  id: PkSlot;
  label: string;
  full: string;
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
    id: 'cinetica',
    label: 'PK',
    full: 'Farmacocinética',
    tag: 'Corpo → fármaco',
    bar: 'bg-violet-500',
    barSoft: 'bg-violet-100/80',
    panelGradient: 'from-violet-50/95 via-white to-white',
    active: 'border-violet-500 bg-violet-50 ring-2 ring-violet-400/50',
    text: 'text-violet-950',
    accentBorder: 'border-l-violet-500',
    examTip: 'I está correta: cinética descreve ADME — o organismo processa o medicamento.',
    focus: true,
  },
  {
    id: 'dinamica',
    label: 'PD',
    full: 'Farmacodinâmica',
    tag: 'Fármaco → corpo',
    bar: 'bg-purple-500',
    barSoft: 'bg-purple-100/80',
    panelGradient: 'from-purple-50/95 via-white to-white',
    active: 'border-purple-500 bg-purple-50 ring-2 ring-purple-400/50',
    text: 'text-purple-950',
    accentBorder: 'border-l-purple-500',
    examTip: 'II está correta: dinâmica é mecanismo de ação e efeito terapêutico ou adverso.',
  },
  {
    id: 'meia-vida',
    label: 't½',
    full: 'Meia-vida',
    tag: 'Queda de 50%',
    bar: 'bg-fuchsia-500',
    barSoft: 'bg-fuchsia-100/80',
    panelGradient: 'from-fuchsia-50/95 via-white to-white',
    active: 'border-fuchsia-500 bg-fuchsia-50 ring-2 ring-fuchsia-400/50',
    text: 'text-fuchsia-950',
    accentBorder: 'border-l-fuchsia-500',
    examTip: 'III erra ao trocar 50% por 100% — pegadinha numérica clássica em farmaco.',
    focus: true,
  },
  {
    id: 'adme',
    label: 'ADME',
    full: 'Fases da cinética',
    tag: 'A · D · M · E',
    bar: 'bg-indigo-500',
    barSoft: 'bg-indigo-100/80',
    panelGradient: 'from-indigo-50/95 via-white to-white',
    active: 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-400/50',
    text: 'text-indigo-950',
    accentBorder: 'border-l-indigo-500',
    examTip: 'Absorção, Distribuição, Metabolismo e Excreção — mnemônico que ancora a cinética.',
  },
];

interface AdmeJourneyRailConceptMapProps {
  concepts: PkPdConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export const AdmeJourneyRailConceptMap = ({
  concepts,
  theme,
  footerRule,
}: AdmeJourneyRailConceptMapProps) => {
  const [selected, setSelected] = useState<PkSlot>('cinetica');

  const { bySlot, shared } = useMemo(() => {
    const slots: Record<PkSlot, PkPdConcept[]> = {
      cinetica: [],
      dinamica: [],
      'meia-vida': [],
      adme: [],
    };
    const sharedItems: { kind: 'compare' | 'exam' | 'mnemonic'; concept: PkPdConcept }[] = [];

    for (const concept of concepts) {
      const kind = inferAdmeConceptKind(concept.title, concept.description);
      if (kind === 'compare' || kind === 'exam' || kind === 'mnemonic') {
        sharedItems.push({ kind, concept });
      } else {
        slots[kind].push(concept);
      }
    }

    return { bySlot: slots, shared: sharedItems };
  }, [concepts]);

  const selectSlot = useCallback((slot: PkSlot) => {
    setSelected(slot);
  }, []);

  const activeSlot = PK_SLOTS.find((s) => s.id === selected)!;
  const activeConcepts = bySlot[selected];
  const compareConcept = shared.find((s) => s.kind === 'compare')?.concept;
  const examConcept = shared.find((s) => s.kind === 'exam')?.concept;
  const mnemonicConcept = shared.find((s) => s.kind === 'mnemonic')?.concept;

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

    if (mnemonicConcept && (selected === 'cinetica' || selected === 'dinamica')) {
      sections.push({
        title: mnemonicConcept.title,
        body: mnemonicConcept.description,
        icon: mnemonicConcept.icon,
        highlight: true,
      });
    }

    if (examConcept && selected === 'meia-vida') {
      sections.push({
        title: examConcept.title,
        body: examConcept.description,
        icon: examConcept.icon,
        highlight: true,
      });
    }

    return sections;
  }, [activeConcepts, compareConcept, examConcept, mnemonicConcept, selected]);

  const examTipText = useMemo(() => {
    if (examConcept?.description?.trim() && selected === 'meia-vida') {
      return examConcept.description;
    }
    if (mnemonicConcept?.description?.trim() && (selected === 'cinetica' || selected === 'dinamica')) {
      return mnemonicConcept.description;
    }
    if (activeConcepts.length > 0) {
      return activeSlot.examTip;
    }
    if (footerRule?.trim()) {
      return footerRule;
    }
    return '';
  }, [
    activeConcepts.length,
    activeSlot.examTip,
    examConcept?.description,
    footerRule,
    mnemonicConcept?.description,
    selected,
  ]);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 flex flex-col gap-3 md:gap-4">
        <div className="rounded-2xl border border-violet-200/70 bg-white/90 px-4 py-3 shadow-sm">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-violet-800">
            Trilho PK → PD
          </p>
          <p className="font-body text-sm font-semibold text-slate-700">
            Toque cada lente — cinética processa, dinâmica age, meia-vida cai 50%
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,11rem)_1fr] md:gap-4">
          <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-sm">
            <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
              Conceitos
            </p>
            {PK_SLOTS.map((slot) => {
              const isActive = selected === slot.id;
              const isFocus = slot.focus;
              return (
                <motion.button
                  key={slot.id}
                  type="button"
                  onClick={() => selectSlot(slot.id)}
                  whileTap={{ scale: 0.98 }}
                  className={`rounded-xl border-2 p-2.5 text-left transition-shadow ${
                    isActive
                      ? `ring-2 ${slot.active}`
                      : isFocus
                        ? 'border-violet-300/80 bg-violet-50/40'
                        : 'border-slate-200/80 bg-slate-50/50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className={`font-mono text-sm font-black ${slot.text}`}>{slot.label}</p>
                      <p className="font-body text-[10px] font-medium text-slate-600">{slot.full}</p>
                    </div>
                    {isFocus ? (
                      <span className="rounded-full bg-violet-500 px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase text-white">
                        foco
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1.5 font-mono text-[8px] font-bold uppercase tracking-wide text-slate-500">
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
                      <Activity className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <p className={`font-body text-xl font-bold leading-tight ${activeSlot.text}`}>
                        {activeSlot.full}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        {activeSlot.tag}
                      </p>
                    </div>
                  </div>
                  {selected === 'meia-vida' ? (
                    <span className="shrink-0 rounded-full bg-fuchsia-500 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wide text-white shadow-sm">
                      50% ≠ 100%
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-3 md:px-5 md:py-4">
                {detailSections.length > 0 ? (
                  detailSections.map((section, index) => {
                                        return (
                      <div
                        key={index}
                        className={`rounded-xl border border-slate-200/70 border-l-[4px] bg-white/80 p-3 shadow-sm ${activeSlot.accentBorder} ${
                          section.highlight ? 'ring-1 ring-violet-200/80' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span
                            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${activeSlot.barSoft} ${activeSlot.text}`}
                          >
                            <SlideLucideIcon name={section.icon} className="h-4 w-4" />
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
                    Toque outro conceito no trilho para comparar cinética e dinâmica.
                  </p>
                )}

                {examTipText ? (
                  <div
                    className={`mt-1 rounded-xl border px-3.5 py-3 shadow-sm ${
                      selected === 'meia-vida'
                        ? 'border-fuchsia-300/80 bg-fuchsia-50/90'
                        : 'border-violet-200/80 bg-violet-50/80'
                    }`}
                  >
                    <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-600">
                      Dica de prova
                    </p>
                    <p
                      className={`mt-1 font-body text-sm font-semibold leading-relaxed ${
                        selected === 'meia-vida' ? 'text-fuchsia-950' : 'text-violet-950'
                      }`}
                    >
                      {examTipText}
                    </p>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

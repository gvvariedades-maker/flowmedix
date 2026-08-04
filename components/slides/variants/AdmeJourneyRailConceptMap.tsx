'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { ThemeColors } from '../core/themeGenerator';
import {
  inferAdmeConceptKind,
  type PkSlot,
} from '@/lib/slides/admeJourneyRailUtils';
import {
  BoardChrome,
  ProtocolRailRow,
  AlertCallout,
  CategoryStrip,
  type BoardTone,
} from '../primitives';

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
  tone: BoardTone;
  /** Fallback sem gabarito/letra — JSON prefere quando há exam/mnemonic. */
  examTip: string;
  focus?: boolean;
}[] = [
  {
    id: 'cinetica',
    label: 'PK',
    full: 'Farmacocinética',
    tag: 'Corpo → fármaco',
    tone: 'rights',
    examTip: 'Cinética descreve ADME — o organismo processa o medicamento.',
    focus: true,
  },
  {
    id: 'dinamica',
    label: 'PD',
    full: 'Farmacodinâmica',
    tag: 'Fármaco → corpo',
    tone: 'accent',
    examTip: 'Dinâmica é mecanismo de ação e efeito terapêutico ou adverso.',
  },
  {
    id: 'meia-vida',
    label: 't½',
    full: 'Meia-vida',
    tag: 'Queda de 50%',
    tone: 'transfer',
    examTip: 'Meia-vida = queda de 50% — não confunda com 100%.',
    focus: true,
  },
  {
    id: 'adme',
    label: 'ADME',
    full: 'Fases da cinética',
    tag: 'A · D · M · E',
    tone: 'rights',
    examTip: 'Absorção, Distribuição, Metabolismo e Excreção — ancora a cinética.',
  },
];

interface AdmeJourneyRailConceptMapProps {
  concepts: PkPdConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

/** Trilho PK→PD — ProtocolRailRow + boardTokens (Onda 4). */
export const AdmeJourneyRailConceptMap = ({
  concepts,
  theme,
  footerRule,
}: AdmeJourneyRailConceptMapProps) => {
  const reduceMotion = useReducedMotion();
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
    const sections: { title: string; body: string; highlight?: boolean }[] = [];

    for (const concept of activeConcepts) {
      sections.push({
        title: concept.title,
        body: concept.description,
      });
    }

    if (compareConcept) {
      sections.push({
        title: compareConcept.title,
        body: compareConcept.description,
      });
    }

    if (mnemonicConcept && (selected === 'cinetica' || selected === 'dinamica')) {
      sections.push({
        title: mnemonicConcept.title,
        body: mnemonicConcept.description,
        highlight: true,
      });
    }

    if (examConcept && selected === 'meia-vida') {
      sections.push({
        title: examConcept.title,
        body: examConcept.description,
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
    <BoardChrome
      theme={theme}
      eyebrow="Trilho PK → PD"
      title="Toque cada lente — cinética processa, dinâmica age, meia-vida cai 50%"
      titleClassName="normal-case tracking-normal font-body text-sm font-semibold text-slate-700 md:text-sm"
      footerRule={undefined}
      maxWidth="3xl"
      washOpacity={0.35}
      className="gap-3 md:gap-4"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,11rem)_1fr] md:gap-4">
        <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-sm">
          <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
            Conceitos
          </p>
          {PK_SLOTS.map((slot) => {
            const isActive = selected === slot.id;
            return (
              <motion.button
                key={slot.id}
                type="button"
                onClick={() => selectSlot(slot.id)}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                className="w-full text-left"
              >
                <ProtocolRailRow
                  badge={slot.label}
                  title={slot.full}
                  detail={slot.tag}
                  tone={slot.tone}
                  active={isActive}
                  className={!isActive && !slot.focus ? 'opacity-80' : undefined}
                />
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            initial={reduceMotion ? false : { opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -4 }}
            className="flex min-h-[14rem] flex-col gap-2.5"
          >
            <CategoryStrip label={`${activeSlot.full} · ${activeSlot.tag}`} tone={activeSlot.tone} />

            {selected === 'meia-vida' ? (
              <AlertCallout tone="transfer">50% ≠ 100%</AlertCallout>
            ) : null}

            {detailSections.length > 0 ? (
              detailSections.map((section, index) => (
                <ProtocolRailRow
                  key={index}
                  badge={String(index + 1)}
                  title={section.title}
                  detail={section.body}
                  tone={section.highlight ? 'transfer' : activeSlot.tone}
                  active={Boolean(section.highlight)}
                />
              ))
            ) : (
              <p className="font-body text-sm leading-relaxed text-slate-600">
                Toque outro conceito no trilho para comparar cinética e dinâmica.
              </p>
            )}

            {examTipText ? (
              <AlertCallout tone={selected === 'meia-vida' ? 'transfer' : 'info'}>
                {examTipText}
              </AlertCallout>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      {footerRule ? (
        <p className="rounded-xl border border-violet-200/70 bg-violet-50/80 px-3 py-2.5 text-center font-body text-sm italic text-violet-950/90">
          {footerRule}
        </p>
      ) : null}
    </BoardChrome>
  );
};

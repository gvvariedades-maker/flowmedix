'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ThemeColors } from '../core/themeGenerator';
import {
  inferXabcdeLetter,
  xabcdeLetterLabel,
  XABCDE_LETTERS,
  type XabcdeLetter,
} from '@/lib/slides/urgenciasTraumaSlideUtils';
import {
  BoardChrome,
  ProtocolRailRow,
  CategoryStrip,
  type BoardTone,
} from '../primitives';

export interface XabcdeConcept {
  icon: string;
  title: string;
  description: string;
}

/** Tom canônico por letra — tokens do board kit (Onda 4). */
const LETTER_TONE: Record<XabcdeLetter, BoardTone> = {
  x: 'exception',
  a: 'transfer',
  b: 'warn',
  c: 'transfer',
  d: 'lime',
  e: 'teal',
  alerta: 'exception',
  geral: 'neutral',
};

const LETTER_CHIP: Record<XabcdeLetter, string> = {
  x: 'X',
  a: 'A',
  b: 'B',
  c: 'C',
  d: 'D',
  e: 'E',
  alerta: '!',
  geral: '•',
};

interface UrgenciasXabcdeRailConceptMapProps {
  concepts: XabcdeConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

/** Trilho XABCDE — ProtocolRailRow + tokens; filtro por letra (navegação no rail). */
export function UrgenciasXabcdeRailConceptMap({
  concepts,
  theme,
  footerRule,
}: UrgenciasXabcdeRailConceptMapProps) {
  const reduceMotion = useReducedMotion();
  const [activeLetter, setActiveLetter] = useState<XabcdeLetter | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const grouped = useMemo(() => {
    const byLetter = new Map<XabcdeLetter, XabcdeConcept[]>();
    for (const concept of concepts) {
      const letter = inferXabcdeLetter(concept.title, concept.description);
      const list = byLetter.get(letter) ?? [];
      list.push(concept);
      byLetter.set(letter, list);
    }
    return byLetter;
  }, [concepts]);

  const lettersOnRail = XABCDE_LETTERS.filter((l) => grouped.has(l));
  const defaultLetter =
    activeLetter ??
    lettersOnRail.find((l) => l === 'x') ??
    lettersOnRail[0] ??
    inferXabcdeLetter(concepts[0]?.title ?? '', concepts[0]?.description ?? '');

  const visibleConcepts = grouped.get(defaultLetter) ?? concepts;

  const toggleLetter = useCallback((letter: XabcdeLetter) => {
    setActiveLetter((current) => (current === letter ? null : letter));
    setExpandedIndex(null);
  }, []);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  }, []);

  return (
    <BoardChrome
      theme={theme}
      eyebrow="XABCDE · trilho de prioridade"
      footerRule={footerRule}
      maxWidth="2xl"
      washOpacity={0.35}
    >
      {lettersOnRail.length > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-1 rounded-xl border border-orange-200/70 bg-orange-50/50 px-2 py-2">
          {lettersOnRail.map((letter, i) => {
            const isActive = defaultLetter === letter;
            return (
              <div key={letter} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => toggleLetter(letter)}
                  className={`flex h-11 w-11 items-center justify-center rounded-xl font-mono text-sm font-black transition-all ${
                    isActive
                      ? 'bg-white text-slate-900 ring-2 ring-orange-400/50 shadow-sm'
                      : 'bg-white/70 text-slate-500 hover:bg-white'
                  }`}
                  aria-pressed={isActive}
                  aria-label={xabcdeLetterLabel(letter)}
                >
                  {LETTER_CHIP[letter]}
                </button>
                {i < lettersOnRail.length - 1 ? (
                  <span className="font-mono text-[10px] text-orange-400/80" aria-hidden>
                    →
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      <CategoryStrip label={xabcdeLetterLabel(defaultLetter)} tone={LETTER_TONE[defaultLetter]} />

      <div className="flex flex-col gap-2.5">
        {visibleConcepts.map((concept, index) => {
          const letter = inferXabcdeLetter(concept.title, concept.description);
          const expanded = expandedIndex === index;
          return (
            <motion.button
              key={`${defaultLetter}-${index}`}
              type="button"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : 0.04 * index }}
              onClick={() => toggleExpanded(index)}
              aria-expanded={expanded}
              className="w-full text-left"
            >
              <ProtocolRailRow
                badge={LETTER_CHIP[letter]}
                title={concept.title}
                detail={
                  <p className={expanded ? undefined : 'line-clamp-3'}>{concept.description}</p>
                }
                tone={LETTER_TONE[letter]}
                active={expanded}
              />
            </motion.button>
          );
        })}
      </div>
    </BoardChrome>
  );
}

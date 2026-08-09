'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ThemeColors } from '../core/themeGenerator';
import { BoardChrome } from '../primitives';

export interface PtClassesExcetoValueConcept {
  icon: string;
  title: string;
  description: string;
  correct?: string;
}

interface ConceptMapPtClassesExcetoValueCardsProps {
  concepts: PtClassesExcetoValueConcept[];
  theme: ThemeColors;
  footerRule?: string;
  chipLabel?: string;
  slideTitle?: string;
}

type CardSkin = {
  header: string;
  example: string;
  ring: string;
};

/** Paleta do print «classificação dos numerais» (inspiração ≠ cópia). */
const SKINS: CardSkin[] = [
  { header: 'bg-[#e11d48]', example: 'text-[#be123c]', ring: 'ring-rose-200' },
  { header: 'bg-[#2563eb]', example: 'text-[#1d4ed8]', ring: 'ring-blue-200' },
  { header: 'bg-[#7c3aed]', example: 'text-[#6d28d9]', ring: 'ring-violet-200' },
  { header: 'bg-[#ea580c]', example: 'text-[#c2410c]', ring: 'ring-orange-200' },
  { header: 'bg-[#db2777]', example: 'text-[#be185d]', ring: 'ring-pink-200' },
];

/**
 * Slide 1 valor_incorreto — cards categoria (header colorido + definição + exemplos).
 * Protocolo: label=CATEGORIA · detail=definição curta · correct=exemplos (·).
 */
export function ConceptMapPtClassesExcetoValueCards({
  concepts,
  theme,
  footerRule,
  slideTitle,
}: ConceptMapPtClassesExcetoValueCardsProps) {
  const reduceMotion = useReducedMotion();

  const cards = useMemo(
    () =>
      concepts.slice(0, 5).map((c, i) => ({
        key: `vc-${i}`,
        title: c.title.trim().toUpperCase(),
        definition: (c.description || '').replace(/^["“«]|["”»]$/g, '').trim(),
        examples: (c.correct || '')
          .split(/\s*[·|]\s*/)
          .map((p) => p.trim())
          .filter(Boolean)
          .join(' · ')
          .toUpperCase(),
        skin: SKINS[i % SKINS.length]!,
        wide: i === 4 || (concepts.length === 5 && i === 4),
      })),
    [concepts],
  );

  if (cards.length === 0) return null;

  const gridCards = cards.length === 5 ? cards.slice(0, 4) : cards;
  const wideCard = cards.length === 5 ? cards[4] : null;

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.16}
      footerRule={footerRule}
      footerLabel="TRANSFERÊNCIA"
      maxWidth="2xl"
      className="gap-3"
    >
      <h2 className="text-center font-display text-xl font-black uppercase tracking-wide text-slate-800 md:text-2xl">
        {slideTitle ? (
          slideTitle.split(/\s*[×x]\s*/).map((part, i, arr) => (
            <span key={i}>
              {i === arr.length - 1 ? (
                <span className="text-emerald-600">{part.trim()}</span>
              ) : (
                <span>
                  {part.trim()} <span className="text-slate-400">×</span>{' '}
                </span>
              )}
            </span>
          ))
        ) : (
          <>
            Classificação dos <span className="text-emerald-600">valores</span>
          </>
        )}
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {gridCards.map((card, index) => (
          <motion.article
            key={card.key}
            initial={reduceMotion ? false : { y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: reduceMotion ? 0 : Math.min(index * 0.05, 0.2) }}
            className={`overflow-hidden rounded-2xl bg-white shadow-md ring-1 ${card.skin.ring}`}
          >
            <header className={`px-3 py-2.5 ${card.skin.header}`}>
              <p className="text-center font-display text-sm font-black uppercase tracking-wide text-white md:text-base">
                {card.title}
              </p>
            </header>
            <div className="flex flex-col gap-3 px-3 py-4 text-center">
              <p className="font-display text-base font-black uppercase tracking-wide text-slate-900 md:text-lg">
                “{card.definition}”
              </p>
              {card.examples ? (
                <p
                  className={`font-body text-sm font-bold uppercase leading-snug tracking-wide ${card.skin.example}`}
                >
                  {card.examples}
                </p>
              ) : null}
            </div>
          </motion.article>
        ))}
      </div>

      {wideCard ? (
        <motion.article
          initial={reduceMotion ? false : { y: 8 }}
          animate={{ y: 0 }}
          className={`overflow-hidden rounded-2xl bg-white shadow-md ring-1 ${wideCard.skin.ring}`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-[minmax(8rem,0.7fr)_1fr]">
            <header
              className={`flex flex-col justify-center px-3 py-3 ${wideCard.skin.header}`}
            >
              <p className="font-display text-sm font-black uppercase tracking-wide text-white md:text-base">
                {wideCard.title}
              </p>
              <p className="mt-1 font-display text-base font-black uppercase text-white/95">
                “{wideCard.definition}”
              </p>
            </header>
            <div className="flex items-center px-4 py-3">
              <p
                className={`font-body text-sm font-bold uppercase leading-snug tracking-wide md:text-base ${wideCard.skin.example}`}
              >
                {wideCard.examples}
              </p>
            </div>
          </div>
        </motion.article>
      ) : null}
    </BoardChrome>
  );
}

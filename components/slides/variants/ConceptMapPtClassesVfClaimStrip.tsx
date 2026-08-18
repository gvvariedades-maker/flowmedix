'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ThemeColors } from '../core/themeGenerator';
import { BoardChrome } from '../primitives';

export interface PtClassesVfClaimConcept {
  icon: string;
  title: string;
  description: string;
  correct?: string;
}

interface ConceptMapPtClassesVfClaimStripProps {
  concepts: PtClassesVfClaimConcept[];
  theme: ThemeColors;
  footerRule?: string;
  chipLabel?: string;
  slideTitle?: string;
}

type CardSkin = {
  badge: string;
  ring: string;
  test: string;
  wash: string;
};

/** Paleta tirinha → 4 peões (gesto VF / CLASSIFICAR). */
const SKINS: CardSkin[] = [
  { badge: 'bg-teal-600', ring: 'ring-teal-200', test: 'text-teal-700', wash: 'bg-teal-50/80' },
  { badge: 'bg-violet-600', ring: 'ring-violet-200', test: 'text-violet-700', wash: 'bg-violet-50/80' },
  { badge: 'bg-rose-600', ring: 'ring-rose-200', test: 'text-rose-700', wash: 'bg-rose-50/80' },
  { badge: 'bg-amber-600', ring: 'ring-amber-200', test: 'text-amber-800', wash: 'bg-amber-50/80' },
];

function parsePiece(title: string): { n: string; piece: string } {
  const m = title.match(/^(\d+)\s*[—\-–:.]\s*(.+)$/);
  if (m) return { n: m[1]!, piece: m[2]!.trim() };
  return { n: '', piece: title.trim() };
}

/**
 * Slide 1 vf_multiclasse — strip 2×2: peça + afirmação da banca + pergunta-teste.
 * Protocolo: label=`N — PEÇA` · detail=afirmação · correct=teste (sem V/F).
 */
export function ConceptMapPtClassesVfClaimStrip({
  concepts,
  theme,
  footerRule,
  slideTitle,
}: ConceptMapPtClassesVfClaimStripProps) {
  const reduceMotion = useReducedMotion();

  const cards = useMemo(
    () =>
      concepts.slice(0, 4).map((c, i) => {
        const { n, piece } = parsePiece(c.title);
        return {
          key: `vf-${i}`,
          n: n || String(i + 1),
          piece: piece.toUpperCase(),
          claim: (c.description || '').replace(/^afirma:\s*/i, '').trim(),
          test: (c.correct || '').replace(/^teste:\s*/i, '').trim(),
          skin: SKINS[i % SKINS.length]!,
        };
      }),
    [concepts],
  );

  if (cards.length === 0) return null;

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.18}
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
                <span className="text-amber-600">{part.trim()}</span>
              ) : (
                <span>
                  {part.trim()} <span className="text-slate-400">×</span>{' '}
                </span>
              )}
            </span>
          ))
        ) : (
          <>
            Peças × <span className="text-amber-600">afirmações</span>
          </>
        )}
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {cards.map((card, index) => (
          <motion.article
            key={card.key}
            initial={false}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: reduceMotion ? 0 : Math.min(index * 0.05, 0.2) }}
            className={`overflow-hidden rounded-2xl bg-white shadow-md ring-1 ${card.skin.ring}`}
          >
            <div className="flex items-stretch">
              <div
                className={`flex w-12 shrink-0 flex-col items-center justify-center ${card.skin.badge} text-white`}
              >
                <span className="font-mono text-[10px] font-black uppercase tracking-wider opacity-90">
                  VF
                </span>
                <span className="font-display text-2xl font-black leading-none">{card.n}</span>
              </div>
              <div className={`min-w-0 flex-1 px-3 py-3 ${card.skin.wash}`}>
                <p className="font-display text-lg font-black uppercase tracking-wide text-slate-900 md:text-xl">
                  «{card.piece}»
                </p>
                {card.claim ? (
                  <p className="mt-1.5 font-body text-sm font-bold leading-snug text-slate-700">
                    Afirma: {card.claim}
                  </p>
                ) : null}
                {card.test ? (
                  <p
                    className={`mt-2 font-mono text-[11px] font-black uppercase tracking-wide ${card.skin.test}`}
                  >
                    Teste: {card.test}
                  </p>
                ) : null}
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </BoardChrome>
  );
}

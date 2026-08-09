'use client';

import { useMemo, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import { BoardChrome } from '../primitives';

interface GoldenRulePtClassesVfClaimBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
  chipLabel?: string;
  slideTitle?: string;
}

type CardSkin = {
  badge: string;
  ring: string;
  wash: string;
  accent: string;
};

/** Mesma paleta do claim-strip / claim-board (slide 1–2). */
const SKINS: CardSkin[] = [
  { badge: 'bg-teal-600', ring: 'ring-teal-200', wash: 'bg-teal-50/80', accent: 'text-teal-700' },
  {
    badge: 'bg-violet-600',
    ring: 'ring-violet-200',
    wash: 'bg-violet-50/80',
    accent: 'text-violet-700',
  },
  { badge: 'bg-rose-600', ring: 'ring-rose-200', wash: 'bg-rose-50/80', accent: 'text-rose-700' },
  {
    badge: 'bg-amber-600',
    ring: 'ring-amber-200',
    wash: 'bg-amber-50/90',
    accent: 'text-amber-800',
  },
];

function renderRich(text: string, accent: string): ReactNode {
  const parts = text.split(/(«[^»]+»|≠)/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (part.startsWith('«') && part.endsWith('»')) {
      return (
        <strong key={i} className={`font-black ${accent}`}>
          {part.slice(1, -1)}
        </strong>
      );
    }
    if (part === '≠') {
      return (
        <span
          key={i}
          className="mx-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-rose-600 px-1 font-display text-xs font-black text-white"
        >
          ≠
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

/**
 * Slide 3 vf_multiclasse — roteiro portátil 2×2 (mesma família visual do claim-strip).
 * Protocolo rows: label=PEÇA · value=regra (sem gabarito/letra).
 */
export function GoldenRulePtClassesVfClaimBoard({
  content,
  rows,
  theme,
  footerRule,
  slideTitle,
}: GoldenRulePtClassesVfClaimBoardProps) {
  const reduceMotion = useReducedMotion();

  const cards = useMemo(
    () =>
      rows.slice(0, 4).map((row, i) => ({
        key: `gr-vf-${i}`,
        n: String(i + 1),
        piece: (row.label || '').trim().toUpperCase(),
        rule: (row.value || '').trim(),
        skin: SKINS[i % SKINS.length]!,
      })),
    [rows],
  );

  if (cards.length === 0) return null;

  const title = slideTitle || content || 'ROTEIRO VF';

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.18}
      footerRule={footerRule}
      footerLabel="FIXAÇÃO"
      maxWidth="2xl"
      className="gap-3"
    >
      <h2 className="text-center font-display text-xl font-black uppercase tracking-wide text-slate-800 md:text-2xl">
        {title.split(/\s+/).map((part, i, arr) => (
          <span key={i}>
            {i === arr.length - 1 ? (
              <span className="text-amber-600">{part}</span>
            ) : (
              <span>{part} </span>
            )}
          </span>
        ))}
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
                <p className="mt-1.5 font-body text-sm font-bold leading-snug text-slate-700 md:text-[15px]">
                  {renderRich(card.rule, card.skin.accent)}
                </p>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </BoardChrome>
  );
}

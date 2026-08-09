'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { BoardChrome } from '../primitives';

interface LogicFlowPtClassesVfClaimBoardProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  /** Ignorado — board glanceable (0 taps). */
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
  chipLabel?: string;
  slideTitle?: string;
}

type VfCard = {
  key: string;
  n: string;
  piece: string;
  reason: string;
  verdict: 'V' | 'F';
};

type CardSkin = {
  badge: string;
  ring: string;
  wash: string;
};

const SKINS: CardSkin[] = [
  { badge: 'bg-teal-600', ring: 'ring-teal-200', wash: 'bg-teal-50/90' },
  { badge: 'bg-violet-600', ring: 'ring-violet-200', wash: 'bg-violet-50/90' },
  { badge: 'bg-rose-600', ring: 'ring-rose-200', wash: 'bg-rose-50/90' },
  { badge: 'bg-amber-600', ring: 'ring-amber-200', wash: 'bg-amber-50/90' },
];

function parseClaim(step: string): VfCard | null {
  const m = step.match(
    /^(\d+)\s*[·.]\s*([^—–\-]+?)\s*[—–\-]\s*(.+?)\s*→\s*([VF])\s*\.?$/i,
  );
  if (!m) return null;
  return {
    key: `vf-${m[1]}`,
    n: m[1]!,
    piece: m[2]!.trim().toUpperCase(),
    reason: m[3]!.trim().replace(/\s*=\s*/g, ' · '),
    verdict: m[4]!.toUpperCase() as 'V' | 'F',
  };
}

function extractLetter(steps: string[]): string | null {
  for (const s of steps) {
    const m =
      s.match(/\bletra\s+([A-E])\b/i) ??
      s.match(/\bgabarito:\s*letra\s+([A-E])\b/i) ??
      s.match(/\bgabarito\s+([A-E])\b/i);
    if (m) return m[1]!.toUpperCase();
  }
  return null;
}

function extractSequence(steps: string[]): string | null {
  for (const s of steps) {
    const m = s.match(/sequ[eê]ncia:\s*([VF\s–\-·,]+)/i);
    if (m) return m[1]!.replace(/\s+/g, ' ').trim().toUpperCase();
  }
  return null;
}

/**
 * Slide 2 vf_multiclasse — mesma família do claim-strip: peão + veredito V/F + letra.
 * Protocolo steps: `N · PEÇA — motivo → V|F` · Sequência · Gabarito · Em similares.
 */
export function LogicFlowPtClassesVfClaimBoard({
  steps,
  theme,
  footerRule,
  slideTitle,
}: LogicFlowPtClassesVfClaimBoardProps) {
  const reduceMotion = useReducedMotion();
  const normalized = useMemo(() => normalizeLogicFlowSteps(steps), [steps]);

  const { cards, letter, sequence, transfer } = useMemo(() => {
    const parsed: VfCard[] = [];
    let transferStep = '';
    for (const step of normalized) {
      if (/^comando|^identificar|^quest[aã]o/i.test(step)) continue;
      if (/^em similares/i.test(step)) {
        transferStep = step.replace(/^em similares:\s*/i, '').trim();
        continue;
      }
      if (/^sequ[eê]ncia|^gabarito|^eliminar/i.test(step)) continue;
      const card = parseClaim(step);
      if (card) parsed.push(card);
    }
    return {
      cards: parsed.slice(0, 4),
      letter: extractLetter(normalized),
      sequence: extractSequence(normalized),
      transfer: transferStep,
    };
  }, [normalized]);

  if (normalized.length === 0) return null;

  const seq =
    sequence ||
    cards
      .map((c) => c.verdict)
      .join(' – ');

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
          slideTitle.split(/\s*[→>]\s*/).map((part, i, arr) => (
            <span key={i}>
              {i === arr.length - 1 ? (
                <span className="text-amber-600">{part.trim()}</span>
              ) : (
                <span>
                  {part.trim()} <span className="text-slate-400">→</span>{' '}
                </span>
              )}
            </span>
          ))
        ) : (
          <>
            Trecho → <span className="text-amber-600">V/F</span>
          </>
        )}
      </h2>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {cards.map((card, index) => {
          const skin = SKINS[index % SKINS.length]!;
          const isTrue = card.verdict === 'V';
          return (
            <motion.article
              key={card.key}
              initial={false}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: reduceMotion ? 0 : Math.min(index * 0.05, 0.2) }}
              className={`overflow-hidden rounded-2xl bg-white shadow-md ring-1 ${skin.ring}`}
            >
              <div className="flex items-stretch">
                <div
                  className={`flex w-11 shrink-0 flex-col items-center justify-center ${skin.badge} text-white`}
                >
                  <span className="font-display text-xl font-black leading-none">{card.n}</span>
                </div>
                <div className={`min-w-0 flex-1 px-3 py-2.5 ${skin.wash}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-display text-base font-black uppercase tracking-wide text-slate-900 md:text-lg">
                      «{card.piece}»
                    </p>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-sm ${
                        isTrue ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      aria-label={isTrue ? 'Verdadeiro' : 'Falso'}
                    >
                      {isTrue ? (
                        <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
                      ) : (
                        <X className="h-4 w-4" strokeWidth={3} aria-hidden />
                      )}
                    </span>
                  </div>
                  <p className="mt-1 font-body text-sm font-bold leading-snug text-slate-700">
                    {card.reason}
                  </p>
                  <p
                    className={`mt-1.5 font-mono text-[11px] font-black uppercase tracking-wider ${
                      isTrue ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {card.verdict}
                  </p>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto] sm:items-stretch">
        <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
          <p className="font-mono text-[10px] font-black uppercase tracking-widest text-slate-500">
            Sequência
          </p>
          <p className="mt-1 font-display text-lg font-black tracking-wide text-slate-900 md:text-xl">
            {seq}
          </p>
          {transfer ? (
            <p className="mt-2 font-body text-xs font-semibold leading-snug text-slate-600">
              Em similares: {transfer}
            </p>
          ) : null}
        </div>
        {letter ? (
          <div className="flex min-w-[5.5rem] flex-col items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-white shadow-md">
            <p className="font-mono text-[10px] font-black uppercase tracking-widest text-emerald-100">
              Gabarito
            </p>
            <p className="font-display text-4xl font-black leading-none">{letter}</p>
          </div>
        ) : null}
      </div>
    </BoardChrome>
  );
}

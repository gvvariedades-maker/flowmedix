'use client';

import { useMemo, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { BoardChrome } from '../primitives';

interface LogicFlowPtClassesAdverbMnemonicRailProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
  chipLabel?: string;
}

type RowSkin = {
  badge: string;
  badgeText: string;
  row: string;
  accent: string;
  border: string;
};

const SKIN_BY_LETTER: Record<string, RowSkin> = {
  P: {
    badge: 'bg-emerald-500',
    badgeText: 'text-white',
    row: 'bg-emerald-50',
    accent: 'text-emerald-800',
    border: 'border-emerald-300',
  },
  F: {
    badge: 'bg-orange-500',
    badgeText: 'text-white',
    row: 'bg-orange-50',
    accent: 'text-orange-900',
    border: 'border-orange-300',
  },
  C: {
    badge: 'bg-rose-500',
    badgeText: 'text-white',
    row: 'bg-rose-50',
    accent: 'text-rose-900',
    border: 'border-rose-300',
  },
  E: {
    badge: 'bg-violet-600',
    badgeText: 'text-white',
    row: 'bg-violet-50',
    accent: 'text-violet-900',
    border: 'border-violet-300',
  },
  G: {
    badge: 'bg-sky-600',
    badgeText: 'text-white',
    row: 'bg-sky-50',
    accent: 'text-sky-900',
    border: 'border-sky-300',
  },
  T: {
    badge: 'bg-teal-600',
    badgeText: 'text-white',
    row: 'bg-teal-50',
    accent: 'text-teal-900',
    border: 'border-teal-300',
  },
};

const FALLBACK_SKINS: RowSkin[] = [
  SKIN_BY_LETTER.P!,
  SKIN_BY_LETTER.F!,
  SKIN_BY_LETTER.C!,
  SKIN_BY_LETTER.E!,
  SKIN_BY_LETTER.G!,
];

/** Núcleo pedagógico (classificar) vs trilha de prova. */
const CORE_LETTERS = new Set(['P', 'F', 'C']);

function skinFor(letter: string, index: number): RowSkin {
  return SKIN_BY_LETTER[letter] ?? FALLBACK_SKINS[index % FALLBACK_SKINS.length]!;
}

function parseStep(text: string, index: number): {
  letter: string;
  title: string;
  body: string;
  hint: string | null;
} {
  const m = text.match(/^([A-Za-zÀ-ú0-9Êê]{1,3})\s*[·.]\s*(.+)$/);
  if (m) {
    const rest = m[2]!;
    const parts = rest.split(/\s*[—–]\s*/);
    const title = (parts[0] ?? rest).trim();
    let body = parts.length > 1 ? parts.slice(1).join(' — ').trim() : '';
    // Se não houver travessão, corpo = resto sem repetir o título
    if (!body) {
      body = rest.replace(new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[—–:-]?\\s*`, 'i'), '').trim() || rest;
    }
    let hint: string | null = null;
    const hintMatch = body.match(/\(([^)]+)\)\s*$/);
    if (hintMatch) {
      hint = hintMatch[1]!;
      body = body.replace(/\s*\([^)]+\)\s*$/, '').trim();
    }
    // Dica solta tipo "−mente" no fim
    const mente = body.match(/\s([−–-]?mente)\s*$/i);
    if (!hint && mente) {
      hint = mente[1]!;
      body = body.replace(/\s[−–-]?mente\s*$/i, '').trim();
    }
    return {
      letter: m[1]!.toUpperCase(),
      title,
      body: body || title,
      hint,
    };
  }
  if (/gabarito/i.test(text)) {
    return { letter: 'G', title: 'Gabarito', body: text, hint: null };
  }
  return {
    letter: String(index + 1),
    title: 'Trilho',
    body: text,
    hint: null,
  };
}

function renderRich(text: string, accent: string): ReactNode {
  const parts = text.split(/(«[^»]+»|\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (part.startsWith('«') && part.endsWith('»')) {
      return (
        <strong key={i} className={`font-black ${accent}`}>
          {part.slice(1, -1)}
        </strong>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className={`font-black ${accent}`}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

/**
 * Slide 2 — trilho mnemônico P·F·C (+ E·G·T na prova).
 * Protocolo: `P · TÍTULO — corpo com «destaque»`
 */
export function LogicFlowPtClassesAdverbMnemonicRail({
  steps,
  theme,
  footerRule,
}: LogicFlowPtClassesAdverbMnemonicRailProps) {
  const reduceMotion = useReducedMotion();
  const rows = useMemo(() => {
    const normalized = normalizeLogicFlowSteps(steps);
    return normalized.map((step, index) => {
      const parsed = parseStep(step, index);
      return {
        ...parsed,
        skin: skinFor(parsed.letter, index),
        core: CORE_LETTERS.has(parsed.letter),
      };
    });
  }, [steps]);

  if (rows.length === 0) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <p className="font-body text-slate-400">Nenhum passo definido</p>
      </div>
    );
  }

  const coreRows = rows.filter((r) => r.core);
  const proofRows = rows.filter((r) => !r.core);
  const mnemonicCore = (coreRows.length >= 2 ? coreRows : rows.slice(0, 3)).slice(0, 3);

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.28}
      eyebrow="Estratégia de prova"
      footerRule={footerRule}
      footerLabel={footerRule ? 'TRANSFERÊNCIA' : undefined}
      maxWidth="2xl"
      className="gap-3"
    >
      <div className="text-center">
        <h2 className="font-display text-base font-black uppercase tracking-wide text-slate-900 md:text-lg">
          <span className="text-sky-800">Classificar</span>{' '}
          <span className="text-violet-700">advérbio</span>
        </h2>

        {/* Núcleo P→F→C */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wide text-slate-500">
            Núcleo:
          </span>
          {mnemonicCore.map((row, i) => (
            <div key={`core-${row.letter}-${i}`} className="flex items-center gap-1.5">
              {i > 0 ? (
                <span className="text-slate-400" aria-hidden>
                  →
                </span>
              ) : null}
              <span
                className={`inline-flex h-7 min-w-7 items-center justify-center rounded-lg px-1.5 font-display text-xs font-black ${row.skin.badge} ${row.skin.badgeText}`}
              >
                {row.letter}
              </span>
            </div>
          ))}
          {proofRows.length > 0 ? (
            <>
              <span className="mx-0.5 text-slate-300" aria-hidden>
                ·
              </span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Prova:
              </span>
              {proofRows.map((row) => (
                <span
                  key={`proof-${row.letter}`}
                  className={`inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1 font-display text-[11px] font-black ${row.skin.badge} ${row.skin.badgeText}`}
                >
                  {row.letter}
                </span>
              ))}
            </>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {rows.map((row, index) => (
          <motion.div
            key={`adv-mn-${index}`}
            initial={reduceMotion ? false : { opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: reduceMotion ? 0 : Math.min(index * 0.035, 0.2) }}
            className={`flex items-center gap-2.5 rounded-xl border px-2.5 py-2 shadow-sm md:gap-3 md:px-3 md:py-2.5 ${row.skin.row} ${row.skin.border}`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-display text-lg font-black shadow-sm md:h-11 md:w-11 md:text-xl ${row.skin.badge} ${row.skin.badgeText}`}
            >
              {row.letter}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <p className={`font-display text-xs font-black uppercase tracking-wide md:text-sm ${row.skin.accent}`}>
                  {row.title}
                </p>
                {row.hint ? (
                  <span
                    className={`rounded-md bg-white/80 px-1.5 py-0.5 font-mono text-[10px] font-bold ${row.skin.accent}`}
                  >
                    {row.hint}
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 font-body text-[12px] font-semibold leading-snug text-slate-800 md:text-[13px]">
                {renderRich(row.body, row.skin.accent)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </BoardChrome>
  );
}

'use client';

import { useMemo, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { BoardChrome } from '../primitives';

export interface PtClassesExcetoConcept {
  icon: string;
  title: string;
  description: string;
  correct?: string;
}

interface ConceptMapPtClassesExcetoRulePairsProps {
  concepts: PtClassesExcetoConcept[];
  theme: ThemeColors;
  footerRule?: string;
  chipLabel?: string;
  slideTitle?: string;
}

type RowSkin = {
  ruleBg: string;
  ruleText: string;
  line: string;
  accent: string;
  ring: string;
};

/** Paleta do print facultativo: roxo · laranja · azul. */
const SKINS: RowSkin[] = [
  {
    ruleBg: 'bg-[#7c5cbf]',
    ruleText: 'text-white',
    line: 'bg-[#7c5cbf]',
    accent: 'text-[#7c5cbf]',
    ring: 'ring-[#7c5cbf]/30',
  },
  {
    ruleBg: 'bg-[#f08a24]',
    ruleText: 'text-white',
    line: 'bg-[#f08a24]',
    accent: 'text-[#e67e22]',
    ring: 'ring-[#f08a24]/30',
  },
  {
    ruleBg: 'bg-[#4a9fe0]',
    ruleText: 'text-white',
    line: 'bg-[#4a9fe0]',
    accent: 'text-[#2980b9]',
    ring: 'ring-[#4a9fe0]/30',
  },
];

function splitPair(correct?: string): [string, string] {
  const parts = (correct || '')
    .split(/\s*[·|]\s*/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 2) return [parts[0]!, parts[1]!];
  if (parts.length === 1) return [parts[0]!, ''];
  return ['', ''];
}

function isExceptionRow(title: string, description: string): boolean {
  return /substant|exce[cç]|n[uú]cleo|nomeia|pegadinha/i.test(`${title} ${description}`);
}

/** Destaca «…» ou a/à sozinho. */
function renderExample(text: string, accent: string): ReactNode {
  const bits = text.split(/(«[^»]+»|\b[aà]\b)/gi);
  if (bits.length === 1) return text.toUpperCase();
  return bits.map((part, i) => {
    if (!part) return null;
    if ((part.startsWith('«') && part.endsWith('»')) || /^[aà]$/i.test(part)) {
      return (
        <span key={i} className={`font-black ${accent}`}>
          {part.startsWith('«') ? part.slice(1, -1).toUpperCase() : part.toUpperCase()}
        </span>
      );
    }
    return (
      <span key={i} className="text-slate-800">
        {part.toUpperCase()}
      </span>
    );
  });
}

/**
 * Slide 1 EXCETO — gesto do print «uso facultativo»:
 * regra colorida à esquerda → dois cards de exemplo à direita (✓ keep / ✗ exceção).
 */
export function ConceptMapPtClassesExcetoRulePairs({
  concepts,
  theme,
  footerRule,
  slideTitle,
}: ConceptMapPtClassesExcetoRulePairsProps) {
  const reduceMotion = useReducedMotion();
  const rows = useMemo(
    () =>
      concepts.slice(0, 3).map((c, i) => {
        const [left, right] = splitPair(c.correct);
        const exception = isExceptionRow(c.title, c.description);
        return {
          key: `r-${i}`,
          title: c.title,
          rule: c.description,
          left,
          right,
          exception,
          skin: SKINS[i % SKINS.length]!,
        };
      }),
    [concepts],
  );

  if (rows.length === 0) return null;

  return (
    <BoardChrome theme={theme} washOpacity={0.2} footerRule={footerRule} maxWidth="2xl" className="gap-3">
      {slideTitle ? (
        <h2 className="text-center font-display text-xl font-black uppercase tracking-wide text-slate-900 md:text-2xl">
          {slideTitle.split(/\s*[×x]\s*/).map((part, i, arr) => (
            <span key={i}>
              {i === arr.length - 1 ? (
                <span className="text-emerald-600">{part.trim()}</span>
              ) : (
                <span>
                  {part.trim()} <span className="text-slate-400">×</span>{' '}
                </span>
              )}
            </span>
          ))}
        </h2>
      ) : null}

      <div className="flex flex-col gap-3">
        {rows.map((row, index) => (
          <motion.div
            key={row.key}
            initial={reduceMotion ? false : { y: 8 }}
            animate={{ y: 0 }}
            transition={{ delay: reduceMotion ? 0 : Math.min(index * 0.06, 0.2) }}
            className="grid grid-cols-1 items-stretch gap-2 text-slate-900 md:grid-cols-[minmax(9.5rem,0.95fr)_12px_1fr_1fr]"
          >
            <div
              className={`flex flex-col justify-center rounded-2xl px-3 py-3 shadow-md ${row.skin.ruleBg} ${row.skin.ruleText}`}
            >
              <p className="font-mono text-[9px] font-black uppercase tracking-wider opacity-90">
                {row.title}
              </p>
              <p className="mt-1 font-display text-sm font-bold leading-snug md:text-[15px]">
                {row.rule}
              </p>
            </div>

            <div className="relative hidden md:block" aria-hidden>
              <div className={`absolute left-1/2 top-[28%] h-px w-3 -translate-x-1/2 ${row.skin.line}`} />
              <div className={`absolute left-1/2 top-[72%] h-px w-3 -translate-x-1/2 ${row.skin.line}`} />
            </div>

            {[row.left, row.right].filter(Boolean).map((ex, ei) => (
              <div
                key={`${row.key}-ex-${ei}`}
                className={`relative flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-3 text-slate-900 shadow-sm ring-1 ${row.skin.ring}`}
              >
                <p className="pr-7 font-body text-[13px] font-bold leading-snug tracking-wide text-slate-800 md:text-sm">
                  {renderExample(ex, row.skin.accent)}
                </p>
                <span
                  className={`absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-sm ${
                    row.exception ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                >
                  {row.exception ? (
                    <X className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                  ) : (
                    <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                  )}
                </span>
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    </BoardChrome>
  );
}

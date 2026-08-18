'use client';

import { useMemo, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import type { ThemeColors } from '../core/themeGenerator';
import { BoardChrome } from '../primitives';
import type { LogicFlowRevealMode } from './logicFlowReveal';

interface LogicFlowPtClassesExcetoIsolateTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  /** Ignorado — board glanceable (0 taps). */
  revealMode?: LogicFlowRevealMode;
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

/**
 * Paleta do isolate (slide 2) — teal / rose / indigo.
 * Diferente do panorama (slide 1: roxo / laranja / azul-céu).
 */
const SKINS: RowSkin[] = [
  {
    ruleBg: 'bg-teal-600',
    ruleText: 'text-white',
    line: 'bg-teal-600',
    accent: 'text-teal-700',
    ring: 'ring-teal-300/40',
  },
  {
    ruleBg: 'bg-rose-500',
    ruleText: 'text-white',
    line: 'bg-rose-500',
    accent: 'text-rose-700',
    ring: 'ring-rose-300/40',
  },
  {
    ruleBg: 'bg-indigo-600',
    ruleText: 'text-white',
    line: 'bg-indigo-600',
    accent: 'text-indigo-700',
    ring: 'ring-indigo-300/40',
  },
]

type KeepCard = { letter: string; phrase: string; hint: string };
type BoardRow = {
  key: string;
  title: string;
  rule: string;
  left: string;
  right: string;
  exception: boolean;
  skin: RowSkin;
};

function parseKeep(step: string): KeepCard | null {
  const m = step.match(
    /^manter\s+([a-e])\s*[—\-–:]\s*(.+)$/i,
  );
  if (!m) return null;
  const letter = m[1]!.toUpperCase();
  const rest = m[2]!.trim();
  const [phrasePart, ...hintParts] = rest.split(/\s*:\s*/);
  const phrase = (phrasePart || rest).replace(/^«|»$/g, '').trim();
  return { letter, phrase, hint: hintParts.join(': ').trim() };
}

function parseExceptionPhrase(step: string): string {
  const m = step.match(/^exce[cç][aã]o\s*[—\-–:]\s*(.+)$/i);
  const body = (m?.[1] || step).trim();
  const beforeColon = body.split(/\s*:\s*/)[0] || body;
  return beforeColon.replace(/^«|»$/g, '').trim();
}

function parseSimilaresRight(step: string): string {
  const body = step.replace(/^em similares:\s*/i, '').trim();
  // "de manhã (adv.) × uma tarde de verão (sub.)" → pick noun side
  const afterX = body.split(/\s*[×x]\s*/)[1] || body;
  const first = afterX.split(/\s*\/\s*/)[0] || afterX;
  return first.replace(/\([^)]*\)/g, '').replace(/[.\s]+$/g, '').trim();
}

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

function wrapPhrase(phrase: string): string {
  const t = phrase.trim();
  if (!t) return t;
  if (t.includes('«')) return t;
  return `«${t}»`;
}

function cardLabel(letter: string, phrase: string): string {
  const p = wrapPhrase(phrase);
  if (!letter) return p;
  return `${letter} — ${p}`;
}

/**
 * Slide 2 EXCETO — mesmo gesto do print (regra colorida → 2 cards).
 * Protocolo: Identificar · Manter A–D · EXCEÇÃO · Gabarito · Em similares.
 */
export function LogicFlowPtClassesExcetoIsolateTap({
  steps,
  theme,
  footerRule,
  slideTitle,
}: LogicFlowPtClassesExcetoIsolateTapProps) {
  const reduceMotion = useReducedMotion();
  const normalized = useMemo(() => normalizeLogicFlowSteps(steps), [steps]);

  const { rows, mark } = useMemo(() => {
    const keeps: KeepCard[] = [];
    let exceptionPhrase = '';
    let similaresRight = '';
    let markStep = '';

    for (const step of normalized) {
      const lower = step.toLowerCase();
      if (/^identificar|^comando|^ler o pedido|^quest[aã]o pede/i.test(step)) {
        continue; // gesto do print = só regra + pares (pedido fica no título)
      }
      if (/^gabarito|marcar letra|resposta/i.test(lower)) {
        markStep = step;
        continue;
      }
      if (/^em similares/i.test(lower)) {
        similaresRight = parseSimilaresRight(step);
        continue;
      }
      if (
        /exce[cç][aã]o|incorret[oa]|par[eê]ntese\s+erra|n[aã]o\s+[eé]/i.test(lower) &&
        !/^manter/i.test(step)
      ) {
        exceptionPhrase = parseExceptionPhrase(step);
        continue;
      }
      const keep = parseKeep(step);
      if (keep) keeps.push(keep);
    }

    const corpus = normalized.join(' ');
    const valorMode = /valor|causal|explicat|advers|comparat|incorreto/i.test(corpus);

    const boardRows: BoardRow[] = [];
    const pairRules = valorMode
      ? ['Par correto — causal / adversativo', 'Par correto — comparativo']
      : ['Locução adverbial — tempo / meio', 'Locução adverbial — modo'];

    for (let i = 0; i < Math.min(keeps.length, 4); i += 2) {
      const a = keeps[i]!;
      const b = keeps[i + 1];
      const pairIndex = Math.floor(i / 2);
      boardRows.push({
        key: `keep-${pairIndex}`,
        title: 'MANTER',
        rule:
          pairRules[pairIndex] ||
          a.hint ||
          (valorMode ? 'Par correto — manter' : 'Locução adverbial'),
        left: cardLabel(a.letter, a.phrase),
        right: b ? cardLabel(b.letter, b.phrase) : '',
        exception: false,
        skin: SKINS[pairIndex % SKINS.length]!,
      });
    }

    if (exceptionPhrase || similaresRight) {
      if (valorMode) {
        // Um card só: o par errado (sem marcar «pois» com X — contraste fica no GR/DZ).
        boardRows.push({
          key: 'exception',
          title: 'INCORRETO',
          rule: 'Parêntese errado — não é explicativo',
          left: wrapPhrase(exceptionPhrase || 'como…?'),
          right: '',
          exception: true,
          skin: SKINS[2]!,
        });
      } else {
        boardRows.push({
          key: 'exception',
          title: 'EXCEÇÃO',
          rule: 'Substantivo — sem valor adverbial',
          left: wrapPhrase(exceptionPhrase || 'núcleo nominal'),
          right: wrapPhrase(similaresRight || 'uma tarde'),
          exception: true,
          skin: SKINS[2]!,
        });
      }
    }

    return {
      rows: boardRows.slice(0, 3),
      mark: markStep,
    };
  }, [normalized]);

  if (normalized.length === 0) return null;

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.2}
      footerRule={footerRule}
      footerLabel="TRANSFERÊNCIA"
      maxWidth="2xl"
      className="gap-3"
    >
      {slideTitle ? (
        <h2 className="text-center font-display text-xl font-black uppercase tracking-wide text-teal-800 md:text-2xl">
          {slideTitle}
        </h2>
      ) : (
        <h2 className="text-center font-display text-xl font-black uppercase tracking-wide text-slate-900 md:text-2xl">
          Isolar a <span className="text-indigo-600">exceção</span>
        </h2>
      )}

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

      {mark ? (
        <p className="text-center font-mono text-[10px] font-bold uppercase tracking-wide text-emerald-700">
          {mark}
        </p>
      ) : null}
    </BoardChrome>
  );
}

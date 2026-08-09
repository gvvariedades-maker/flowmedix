'use client';

import { useMemo, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { BoardChrome, boardTone, type BoardTone } from '../primitives';

export interface PtClassesFunctionConcept {
  icon: string;
  title: string;
  description: string;
  correct?: string;
}

interface ConceptMapPtClassesFunctionDeckProps {
  concepts: PtClassesFunctionConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

type ArenaColumn = {
  title: string;
  equivalents: string[];
  examples: string[];
  rule: string;
  tone: BoardTone;
};

function splitEquivalents(raw: string): string[] {
  return raw
    .split(/\s*[·|]\s*|\n+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);
}

function sideOf(title: string): 'left' | 'right' | null {
  if (/^(L|A)\s*[·.\-–—]/i.test(title)) return 'left';
  if (/^(R|B)\s*[·.\-–—]/i.test(title)) return 'right';
  return null;
}

function stripSidePrefix(title: string): string {
  return title.replace(/^(L|R|A|B)\s*[·.\-–—]\s*/i, '').trim();
}

/** Destaca trechos «…» no exemplo (gesto do print SENÃO × SE NÃO). */
function renderExample(text: string, tone: BoardTone): ReactNode {
  const t = boardTone(tone);
  const parts = text.split(/(«[^»]+»)/g);
  if (parts.length === 1) {
    return text;
  }
  return parts.map((part, i) => {
    if (part.startsWith('«') && part.endsWith('»')) {
      return (
        <span
          key={`hl-${i}`}
          className={`font-bold underline decoration-2 underline-offset-2 ${t.columnLabel}`}
        >
          {part.slice(1, -1)}
        </span>
      );
    }
    return <span key={`tx-${i}`}>{part}</span>;
  });
}

function buildArena(concepts: PtClassesFunctionConcept[]): {
  left: ArenaColumn;
  right: ArenaColumn;
} | null {
  if (concepts.length < 2) return null;

  const headers = concepts.filter((c) => typeof c.correct === 'string' && c.correct.trim());
  const leftTone: BoardTone = 'barrier';
  const rightTone: BoardTone = 'command';

  if (headers.length >= 2) {
    const [hL, hR] = headers;
    const left: ArenaColumn = {
      title: hL.title.trim(),
      equivalents: splitEquivalents(hL.description),
      examples: [],
      rule: hL.correct!.trim(),
      tone: leftTone,
    };
    const right: ArenaColumn = {
      title: hR.title.trim(),
      equivalents: splitEquivalents(hR.description),
      examples: [],
      rule: hR.correct!.trim(),
      tone: rightTone,
    };

    const body = concepts.filter((c) => !(typeof c.correct === 'string' && c.correct.trim()));
    let auto = 0;
    for (const item of body) {
      const side = sideOf(item.title);
      const text = item.description.trim() || stripSidePrefix(item.title);
      if (!text) continue;
      if (side === 'left') left.examples.push(text);
      else if (side === 'right') right.examples.push(text);
      else if (auto % 2 === 0) {
        left.examples.push(text);
        auto += 1;
      } else {
        right.examples.push(text);
        auto += 1;
      }
    }
    return { left, right };
  }

  // Fallback: metade / metade (legado deck) → OU sem regra de rodapé por coluna
  const mid = Math.ceil(concepts.length / 2);
  const leftItems = concepts.slice(0, mid);
  const rightItems = concepts.slice(mid);
  if (rightItems.length === 0) return null;

  return {
    left: {
      title: leftItems[0]?.title.replace(/^\d+\s*[·.\-–—]\s*/, '') || 'Forma A',
      equivalents: leftItems.slice(1, 3).map((c) => c.description).filter(Boolean).slice(0, 3),
      examples: leftItems.slice(3).map((c) => c.description).filter(Boolean),
      rule: '',
      tone: leftTone,
    },
    right: {
      title: rightItems[0]?.title.replace(/^\d+\s*[·.\-–—]\s*/, '') || 'Forma B',
      equivalents: rightItems.slice(1, 3).map((c) => c.description).filter(Boolean).slice(0, 3),
      examples: rightItems.slice(3).map((c) => c.description).filter(Boolean),
      rule: '',
      tone: rightTone,
    },
  };
}

function ColumnBody({ col }: { col: ArenaColumn }) {
  const t = boardTone(col.tone);
  return (
    <div className="flex h-full flex-col gap-2.5">
      {/* EQUIVALE A */}
      <div className={`rounded-xl border-2 px-3 py-2.5 ${t.panel}`}>
        <p className={`font-mono text-[10px] font-black uppercase tracking-[0.18em] ${t.columnLabel}`}>
          Equivale a
        </p>
        <ul className="mt-1.5 space-y-0.5">
          {col.equivalents.map((eq, i) => (
            <li key={`eq-${i}`} className="font-display text-sm font-bold uppercase tracking-wide text-slate-900">
              {eq}
            </li>
          ))}
        </ul>
      </div>

      {/* Exemplos */}
      <div className="flex flex-1 flex-col gap-2">
        {col.examples.map((ex, i) => (
          <div
            key={`ex-${i}`}
            className="flex items-start gap-2.5 rounded-xl border border-slate-200/90 bg-white/90 px-3 py-2.5 shadow-sm"
          >
            <span
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${t.badge} ${t.badgeText}`}
            >
              <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
            </span>
            <p className="min-w-0 font-body text-sm font-semibold leading-snug text-slate-800">
              {renderExample(ex, col.tone)}
            </p>
          </div>
        ))}
      </div>

      {/* Regra de troca */}
      {col.rule ? (
        <div className={`rounded-xl border-2 px-3 py-2.5 ${t.border} bg-white/95`}>
          <p className="font-body text-[13px] font-semibold leading-snug text-slate-800">
            {renderExample(col.rule, col.tone)}
          </p>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Arena OU «forma × forma» — gesto do print SENÃO × SE NÃO (CLASSIFICAR).
 * Protocolo JSON: 2 itens com `correct` = cabeçalhos (label + EQUIVALE A + regra);
 * demais itens = exemplos (prefixo `L ·` / `R ·` ou alternância).
 */
export function ConceptMapPtClassesFunctionDeck({
  concepts,
  theme,
  footerRule,
}: ConceptMapPtClassesFunctionDeckProps) {
  const reduceMotion = useReducedMotion();
  const arena = useMemo(() => buildArena(concepts), [concepts]);

  if (!arena) return null;

  const { left, right } = arena;
  const leftT = boardTone(left.tone);
  const rightT = boardTone(right.tone);

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.35}
      eyebrow="Formas · teste da troca"
      footerRule={footerRule}
      footerLabel={footerRule ? 'FIXAÇÃO' : undefined}
      maxWidth="2xl"
    >
      {/* Cabeçalhos + OU */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl border-2 bg-white px-3 py-3 text-center shadow-md ${leftT.border}`}
          style={{ borderTopWidth: 6 }}
        >
          <p className={`font-display text-lg font-black uppercase tracking-wide text-slate-900 md:text-xl`}>
            {left.title}
          </p>
        </motion.div>
        <div className="flex items-center justify-center px-1">
          <span className="font-display text-sm font-black uppercase tracking-widest text-slate-500">
            OU
          </span>
        </div>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.05 }}
          className={`rounded-xl border-2 bg-white px-3 py-3 text-center shadow-md ${rightT.border}`}
          style={{ borderTopWidth: 6 }}
        >
          <p className={`font-display text-lg font-black uppercase tracking-wide text-slate-900 md:text-xl`}>
            {right.title}
          </p>
        </motion.div>
      </div>

      {/* Corpos */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.06 }}
        >
          <ColumnBody col={left} />
        </motion.div>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.1 }}
        >
          <ColumnBody col={right} />
        </motion.div>
      </div>
    </BoardChrome>
  );
}

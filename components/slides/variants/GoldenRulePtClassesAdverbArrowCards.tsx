'use client';

import { useMemo, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import { BoardChrome } from '../primitives';
import {
  IconAdverbRadiateMarks,
  IconMalMauCheck,
  IconMalMauTipTarget,
  IconMalMauWarn,
} from '../icons/pt-adverb';

interface GoldenRulePtClassesAdverbArrowCardsProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

type SideSkin = {
  border: string;
  headerBg: string;
  dashed: string;
  pill: string;
  accent: string;
  check: string;
  titleColor: string;
};

/** Paleta do print MAL × MAU — navy · red · yellow · white. */
const LEFT: SideSkin = {
  border: 'border-blue-800',
  headerBg: 'bg-blue-900',
  dashed: 'border-blue-800/50',
  pill: 'bg-blue-900',
  accent: 'text-blue-800',
  check: 'text-blue-800',
  titleColor: 'text-blue-900',
};

const RIGHT: SideSkin = {
  border: 'border-red-600',
  headerBg: 'bg-red-600',
  dashed: 'border-red-500/50',
  pill: 'bg-red-600',
  accent: 'text-red-600',
  check: 'text-red-600',
  titleColor: 'text-red-600',
};

type CardParts = {
  rule: string;
  note: string;
  example: string;
  paraphrase: string;
};

function parseCardValue(value: string): CardParts {
  const parts = value
    .split(/\s*[·|]\s*/)
    .map((p) => p.trim())
    .filter(Boolean);
  return {
    rule: parts[0] ?? value,
    note: parts[1] ?? '',
    example: parts[2] ?? '',
    paraphrase: parts[3] ?? '',
  };
}

function splitDualTitle(content: string): { left: string; right: string; joiner: string } | null {
  const raw = content.trim().replace(/^[−–—]\s*/, '-');
  const m = raw.match(/^(.+?)\s+(e|×|x)\s+(.+)$/i);
  if (!m) return null;
  const left = m[1]!.trim().replace(/^[−–—]/, '-');
  const right = m[3]!.trim();
  return { left, right, joiner: m[2]!.toLowerCase() === 'e' ? 'e' : '×' };
}

/** Destaca «…» e palavras-chave em maiúsculas curtas (BEM, BOM, MAL…). */
function renderMarked(text: string, accent: string): ReactNode {
  if (!text) return null;
  const marked = text.split(/(«[^»]+»|\b[A-ZÁÉÍÓÚÂÊÔÃÕÇ]{2,}\b)/g);
  return marked.map((part, i) => {
    if (part.startsWith('«') && part.endsWith('»')) {
      return (
        <strong
          key={i}
          className={`font-black underline decoration-2 underline-offset-[3px] ${accent}`}
        >
          {part.slice(1, -1)}
        </strong>
      );
    }
    if (/^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]{2,}$/.test(part) && part.length <= 12) {
      return (
        <strong
          key={i}
          className={`font-black underline decoration-2 underline-offset-[3px] ${accent}`}
        >
          {part}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function CompareCard({
  label,
  parts,
  skin,
  index,
  reduceMotion,
}: {
  label: string;
  parts: CardParts;
  skin: SideSkin;
  index: number;
  reduceMotion: boolean | null;
}) {
  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : 0.06 + index * 0.05 }}
      className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border-2 bg-white shadow-md ${skin.border}`}
    >
      {/* Header brushstroke — faixa sólida arredondada */}
      <div className={`relative px-3 pb-2 pt-3 ${skin.headerBg}`}>
        <div
          className="pointer-events-none absolute inset-x-2 bottom-0 h-2 rounded-b-full opacity-30"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(255,255,255,0.35) 0%, transparent 70%)',
          }}
        />
        <p className="relative text-center font-display text-base font-black uppercase tracking-wide text-white md:text-lg">
          {label}
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 px-3.5 py-3 md:px-4 md:py-3.5">
        <div>
          <p className="font-body text-[13px] font-semibold leading-snug text-slate-900 md:text-sm">
            {renderMarked(parts.rule, skin.accent)}
          </p>
          {parts.note ? (
            <p className="mt-0.5 font-body text-[11px] italic leading-snug text-slate-500 md:text-xs">
              {parts.note}
            </p>
          ) : null}
        </div>

        <div className={`border-t border-dashed ${skin.dashed}`} />

        <div className="flex flex-col gap-1.5">
          <span
            className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 font-display text-[10px] font-black uppercase tracking-wide text-white ${skin.pill}`}
          >
            Exemplo:
          </span>
          {parts.example ? (
            <div className="flex items-start gap-1.5">
              <IconMalMauCheck className={`mt-0.5 h-4 w-4 shrink-0 ${skin.check}`} title="Ok" />
              <p className="font-body text-[13px] font-semibold leading-snug text-slate-900 md:text-sm">
                {renderMarked(parts.example, skin.accent)}
              </p>
            </div>
          ) : null}
          {parts.paraphrase ? (
            <p className="pl-5 font-body text-[12px] leading-snug text-slate-600 md:text-[13px]">
              {renderMarked(parts.paraphrase, skin.accent)}
            </p>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}

/**
 * Compare A × B + dica rápida — gesto DECORE (slide 3).
 * Inspiração: print MAL × MAU (alerta amarelo · cards navy/red · faixa DICA).
 * Protocolo:
 *   content = `A e B` (título dual) · rows[0]/[1] = cards · rows[2+] = dicas
 *   value = `regra · (classe) · exemplo com «peça» · (= paráfrase)`
 * SVGs: diagrams/mal-mau-* · IconMalMauWarn/Check/TipTarget
 */
export function GoldenRulePtClassesAdverbArrowCards({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRulePtClassesAdverbArrowCardsProps) {
  const reduceMotion = useReducedMotion();

  const { cards, tips, dualTitle, plainTitle } = useMemo(() => {
    const cardRows = rows.slice(0, 2);
    const tipRows = rows.slice(2);
    const dual = content ? splitDualTitle(content) : null;
    return {
      cards: cardRows.map((row, i) => ({
        label: row.label.trim(),
        parts: parseCardValue(row.value),
        skin: i === 0 ? LEFT : RIGHT,
      })),
      tips: tipRows.map((r) => r.value.trim()).filter(Boolean),
      dualTitle: dual,
      plainTitle: (content || 'Não erre mais').trim(),
    };
  }, [content, rows]);

  if (cards.length === 0) return null;

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.18}
      footerRule={footerRule}
      footerLabel={footerRule ? 'DECORE' : undefined}
      maxWidth="2xl"
      className="gap-3.5"
    >
      {/* Alerta amarelo — NÃO ERRE MAIS! */}
      <div className="flex items-center justify-center gap-2">
        <IconMalMauWarn className="h-6 w-6 shrink-0 text-amber-400" title="Alerta" />
        <div
          className="rounded-full px-3.5 py-1 shadow-sm"
          style={{
            background:
              'linear-gradient(180deg, #fde047 0%, #facc15 55%, #eab308 100%)',
            clipPath:
              'polygon(2% 20%, 6% 8%, 14% 4%, 86% 4%, 94% 10%, 98% 22%, 98% 78%, 94% 90%, 86% 96%, 14% 96%, 6% 90%, 2% 78%)',
          }}
        >
          <p className="font-display text-[11px] font-black uppercase tracking-wide text-slate-900 md:text-xs">
            Não erre mais!
          </p>
        </div>
      </div>

      {/* Título dual — navy × red */}
      <div className="flex items-center justify-center gap-2">
        <IconAdverbRadiateMarks className="h-5 w-5 text-blue-800" title="" />
        {dualTitle ? (
          <p className="text-center font-display text-xl font-black uppercase tracking-wide md:text-2xl">
            <span className={LEFT.titleColor}>{dualTitle.left}</span>
            <span className="mx-1.5 text-slate-900">{dualTitle.joiner}</span>
            <span className={RIGHT.titleColor}>{dualTitle.right}</span>
          </p>
        ) : (
          <p className="text-center font-display text-xl font-black uppercase tracking-wide text-slate-900 md:text-2xl">
            {plainTitle}
          </p>
        )}
        <IconAdverbRadiateMarks className="h-5 w-5 scale-x-[-1] text-amber-400" title="" />
      </div>

      {/* Cards lado a lado */}
      <div
        className={`grid gap-3 ${cards.length >= 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}
      >
        {cards.map((card, index) => (
          <CompareCard
            key={`mal-mau-${index}`}
            label={card.label}
            parts={card.parts}
            skin={card.skin}
            index={index}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>

      {/* Faixa DICA RÁPIDA */}
      {tips.length > 0 ? (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.18 }}
          className="relative overflow-hidden rounded-2xl border-2 border-amber-300 px-3.5 py-3 shadow-sm md:px-4"
          style={{
            background: 'linear-gradient(180deg, #fef9c3 0%, #fde047 45%, #facc15 100%)',
          }}
        >
          <div className="flex items-start gap-2.5">
            <div className="relative mt-0.5 shrink-0">
              <IconMalMauTipTarget className="h-8 w-8 text-red-600" title="Dica" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-blue-900" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-xs font-black uppercase tracking-wide text-blue-900 md:text-sm">
                Dica rápida:
              </p>
              <ul className="mt-1.5 flex flex-col gap-1">
                {tips.map((tip, i) => (
                  <li key={`tip-${i}`} className="flex items-start gap-1.5">
                    <IconMalMauCheck
                      className="mt-0.5 h-4 w-4 shrink-0 text-blue-900"
                      title="Ok"
                    />
                    <p className="font-body text-[12px] font-semibold leading-snug text-slate-900 md:text-[13px]">
                      {renderMarked(tip, i % 2 === 0 ? LEFT.accent : RIGHT.accent)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      ) : null}
    </BoardChrome>
  );
}

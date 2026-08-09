'use client';

import { useMemo, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import { BoardChrome } from '../primitives';

interface GoldenRulePtClassesFamilyTableProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

type CardSkin = {
  header: string;
  body: string;
  /** Cor sólida do chevron (CSS). */
  chevron: string;
  rule: string;
};

/** Paleta estilo «funções do SE» — 8 skins cíclicas (sem watermark de feed). */
const SKINS: CardSkin[] = [
  { header: 'bg-slate-800', body: 'bg-slate-100/95', chevron: '#1e293b', rule: 'text-slate-800' },
  { header: 'bg-orange-500', body: 'bg-orange-50', chevron: '#f97316', rule: 'text-orange-900' },
  { header: 'bg-violet-600', body: 'bg-violet-50', chevron: '#7c3aed', rule: 'text-violet-900' },
  { header: 'bg-cyan-500', body: 'bg-cyan-50', chevron: '#06b6d4', rule: 'text-cyan-900' },
  { header: 'bg-amber-500', body: 'bg-amber-50', chevron: '#f59e0b', rule: 'text-amber-950' },
  { header: 'bg-rose-500', body: 'bg-rose-50', chevron: '#f43f5e', rule: 'text-rose-900' },
  { header: 'bg-emerald-600', body: 'bg-emerald-50', chevron: '#059669', rule: 'text-emerald-900' },
  { header: 'bg-fuchsia-600', body: 'bg-fuchsia-50', chevron: '#c026d3', rule: 'text-fuchsia-900' },
];

function parseLabel(label: string, index: number): { n: string; title: string } {
  const m = label.match(/^(\d+)\s*[.)·\-–—]\s*(.+)$/);
  if (m) return { n: m[1], title: m[2].trim() };
  return { n: String(index + 1), title: label.trim() };
}

function splitValue(value: string): { rule: string; examples: string[] } {
  const parts = value
    .split(/\s*·\s*/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return { rule: value, examples: [] };
  return { rule: parts[0], examples: parts.slice(1) };
}

function renderRich(text: string, accentClass: string): ReactNode {
  const parts = text.split(/(«[^»]+»|\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (part.startsWith('«') && part.endsWith('»')) {
      return (
        <strong key={i} className={`font-black ${accentClass}`}>
          {part.slice(1, -1)}
        </strong>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className={`font-black ${accentClass}`}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

/**
 * Grade numerada «funções / famílias» — gesto CLASSIFICAR (slide 3).
 * Inspiração: cards coloridos com faixa-título (funções do SE); conteúdo 100% do JSON.
 * Protocolo: label=`1. TÍTULO` · value=`regra · exemplo · exemplo`
 */
export function GoldenRulePtClassesFamilyTable({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRulePtClassesFamilyTableProps) {
  const reduceMotion = useReducedMotion();
  const cards = useMemo(
    () =>
      rows.map((row, index) => {
        const { n, title } = parseLabel(row.label, index);
        const { rule, examples } = splitValue(row.value);
        return {
          n,
          title,
          rule,
          examples,
          skin: SKINS[index % SKINS.length],
          hot: row.badge === 'hot',
        };
      }),
    [rows],
  );

  if (cards.length === 0) return null;

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.28}
      footerRule={footerRule}
      footerLabel={footerRule ? 'DECORE' : undefined}
      maxWidth="2xl"
      className="gap-3"
    >
      {/* Faixa-título (gesto do print) */}
      <div className="rounded-xl bg-slate-900 px-3 py-2.5 text-center shadow-md">
        <h2 className="font-display text-base font-black uppercase tracking-wide text-white md:text-lg">
          {content || 'Funções do conectivo'}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {cards.map((card, index) => {
          const skin = card.skin;
          return (
            <motion.article
              key={`pt-classes-fn-card-${index}`}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : Math.min(index * 0.03, 0.2) }}
              className={`relative overflow-hidden rounded-b-xl shadow-md ${
                card.hot ? 'ring-2 ring-amber-400/80 ring-offset-2 ring-offset-white' : ''
              }`}
            >
              {/* Header com chevron */}
              <div className={`relative flex ${skin.header}`}>
                <div className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 font-display text-xs font-black text-white">
                    {card.n}
                  </span>
                  <p className="min-w-0 font-display text-[11px] font-black uppercase leading-tight tracking-wide text-white md:text-xs">
                    {card.title}
                  </p>
                </div>
                <span
                  className="block w-3 shrink-0 self-stretch"
                  style={{
                    background: skin.chevron,
                    clipPath: 'polygon(0 0, 100% 50%, 0 100%)',
                  }}
                  aria-hidden
                />
              </div>

              <div className={`space-y-1.5 px-3 py-2.5 ${skin.body}`}>
                <p className={`font-body text-[12px] font-bold leading-snug md:text-sm ${skin.rule}`}>
                  {renderRich(card.rule, skin.rule)}
                </p>
                {card.examples.map((ex, ei) => (
                  <p
                    key={`ex-${index}-${ei}`}
                    className="font-body text-[11px] leading-snug text-slate-700 md:text-[13px]"
                  >
                    <span className="mr-1 font-mono text-[10px] font-bold text-slate-400">
                      {ei + 1}.
                    </span>
                    {renderRich(ex, skin.rule)}
                  </p>
                ))}
              </div>
            </motion.article>
          );
        })}
      </div>
    </BoardChrome>
  );
}

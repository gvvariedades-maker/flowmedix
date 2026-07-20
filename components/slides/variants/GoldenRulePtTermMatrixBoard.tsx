'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Boxes, ChevronDown, Hand } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow, GoldenRuleRowEmphasis } from './GoldenRule';
import {
  inferTermMatrixCell,
  inferTermRowBoardBadge,
  termMatrixCellBadge,
} from '@/lib/slides/ptTermMatrixSlideUtils';

const TONE_BY_EMPHASIS: Record<
  GoldenRuleRowEmphasis,
  {
    pill: string;
    pillActive: string;
    panelBg: string;
    panelBorder: string;
    panelInset: string;
    label: string;
    badge: string;
  }
> = {
  default: {
    pill: 'bg-slate-100/95 text-slate-800 border-slate-200/90',
    pillActive: 'bg-slate-200/90 text-slate-900 border-slate-300 ring-slate-300/50',
    panelBg: 'bg-slate-200/85',
    panelBorder: 'border-slate-300/90',
    panelInset: 'bg-slate-100/80 border-slate-200/70',
    label: 'text-slate-600',
    badge: 'bg-slate-200/80 text-slate-700',
  },
  highlight: {
    pill: 'bg-teal-100/95 text-teal-900 border-teal-200/90',
    pillActive: 'bg-teal-200/85 text-teal-950 border-teal-300 ring-teal-300/55',
    panelBg: 'bg-teal-200/85',
    panelBorder: 'border-teal-300/90',
    panelInset: 'bg-teal-100/75 border-teal-200/70',
    label: 'text-teal-800',
    badge: 'bg-teal-200/75 text-teal-900',
  },
  alert: {
    pill: 'bg-rose-100/95 text-rose-900 border-rose-200/90',
    pillActive: 'bg-rose-200/85 text-rose-950 border-rose-300 ring-rose-300/50',
    panelBg: 'bg-rose-200/85',
    panelBorder: 'border-rose-300/90',
    panelInset: 'bg-rose-100/75 border-rose-200/70',
    label: 'text-rose-700',
    badge: 'bg-rose-200/75 text-rose-800',
  },
  success: {
    pill: 'bg-emerald-100/95 text-emerald-900 border-emerald-200/90',
    pillActive: 'bg-emerald-200/85 text-emerald-950 border-emerald-300 ring-emerald-300/50',
    panelBg: 'bg-emerald-200/85',
    panelBorder: 'border-emerald-300/90',
    panelInset: 'bg-emerald-100/75 border-emerald-200/70',
    label: 'text-emerald-700',
    badge: 'bg-emerald-200/75 text-emerald-800',
  },
};

function defaultSelectedIndex(rows: GoldenRuleRow[]): number {
  const highlightIdx = rows.findIndex((r) => r.emphasis === 'highlight');
  if (highlightIdx >= 0) return highlightIdx;
  const successIdx = rows.findIndex((r) => r.emphasis === 'success');
  if (successIdx >= 0) return successIdx;
  return 0;
}

function inferTermHint(row: GoldenRuleRow): string {
  const cell = inferTermMatrixCell(`${row.label} ${row.value}`);
  switch (cell) {
    case 'pergunta_teste':
      return 'Portão M05: modifica verbo? modifica nome? de quê? — uma pergunta por termo.';
    case 'adj_adv':
      return 'Circunstância do verbo → adjunto adverbial (pode estar deslocado).';
    case 'adj_adn':
      return 'Característica de substantivo → adjunto adnominal.';
    case 'complemento_nominal':
      return 'Completa nome com preposição — pergunta «de quê?».';
    case 'loc_adv_tempo':
      return 'Enquanto, quando, antes → locução adverbial de tempo.';
    case 'pegadinha':
      return 'Não copie o rótulo do termo vizinho sem aplicar a pergunta-teste.';
    default:
      return 'Dois termos destacados = duas células na matriz.';
  }
}

function inferTermFixation(row: GoldenRuleRow, index: number, total: number): string {
  const emphasis = row.emphasis ?? 'default';
  if (emphasis === 'alert') return 'Se cair neste corte, a alternativa está errada.';
  if (emphasis === 'success') return 'Guarde: verbo → adv.; nome → adn.; tempo → loc. adv.';
  if (emphasis === 'highlight') return 'Pergunta M05: atalho antes de marcar a letra.';
  if (index === total - 1) return 'Última célula: volte ao portão antes de marcar.';
  return `Célula ${index + 1}/${total} — entendeu? Passe para a próxima.`;
}

interface GoldenRulePtTermMatrixBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

export function GoldenRulePtTermMatrixBoard({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRulePtTermMatrixBoardProps) {
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState(() => defaultSelectedIndex(rows));

  const selectRow = useCallback((index: number) => {
    setSelected(index);
  }, []);

  if (rows.length === 0) return null;

  const activeRow = rows[selected] ?? rows[0];
  const emphasis: GoldenRuleRowEmphasis = activeRow.emphasis ?? 'default';
  const tone = TONE_BY_EMPHASIS[emphasis];
  const activeCell = inferTermMatrixCell(`${activeRow.label} ${activeRow.value}`);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-30`} />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-3.5">
        <div className="flex flex-col gap-1.5">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-teal-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-teal-800 shadow-sm">
            <Boxes className="h-3 w-3" aria-hidden />
            Matriz de bolso
          </span>
          {content ? (
            <h2 className="font-display text-lg font-black leading-tight text-slate-900 md:text-xl">
              {content}
            </h2>
          ) : null}
          <p className="flex items-center gap-1.5 font-body text-xs font-medium text-slate-600">
            <Hand className="h-3.5 w-3.5 shrink-0 text-teal-700" aria-hidden />
            Toque cada célula da matriz
          </p>
        </div>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Células da matriz de termos">
          {rows.map((row, index) => {
            const isActive = selected === index;
            const rowEmphasis = row.emphasis ?? 'default';
            const rowTone = TONE_BY_EMPHASIS[rowEmphasis];
            return (
              <button
                key={`${row.label}-${index}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => selectRow(index)}
                className={`min-h-[44px] cursor-pointer rounded-full border px-3 py-1.5 font-body text-xs font-semibold transition-all ${
                  isActive
                    ? `${rowTone.pillActive} ring-2`
                    : `${rowTone.pill} hover:shadow-sm active:scale-[0.98]`
                }`}
              >
                {row.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {activeRow ? (
            <motion.div
              key={selected}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
              className={`overflow-hidden rounded-2xl border-2 shadow-xl ${tone.panelBorder} ${tone.panelBg}`}
            >
              <div className="border-b border-black/5 bg-white/60 px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={`font-mono text-[9px] font-extrabold uppercase tracking-widest ${tone.label}`}>
                      {termMatrixCellBadge(activeCell)}
                    </p>
                    <p className="font-display text-base font-black text-slate-900">{activeRow.label}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase ${tone.badge}`}
                  >
                    {inferTermRowBoardBadge({
                      label: activeRow.label,
                      value: activeRow.value,
                      emphasis,
                    })}
                  </span>
                </div>
              </div>
              <div className={`mx-4 my-3 rounded-xl border px-3 py-2.5 ${tone.panelInset}`}>
                <p className="font-display text-sm font-extrabold leading-snug text-slate-900">
                  {activeRow.value}
                </p>
              </div>
              <div className="space-y-2 px-4 pb-4">
                <p className="font-body text-sm leading-relaxed text-slate-800">
                  {activeRow.exam_hint ?? inferTermHint(activeRow)}
                </p>
                <p className="flex items-center gap-1 font-body text-xs font-medium text-slate-500">
                  <ChevronDown className="h-3.5 w-3.5 rotate-[-90deg]" aria-hidden />
                  {activeRow.fixation ?? inferTermFixation(activeRow, selected, rows.length)}
                </p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {footerRule ? (
          <p className="rounded-xl border border-teal-200/70 bg-white/90 px-3 py-2.5 text-center font-body text-xs italic text-teal-900/90 shadow-sm">
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}

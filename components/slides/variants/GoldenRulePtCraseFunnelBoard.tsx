'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown, Hand } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow, GoldenRuleRowEmphasis } from './GoldenRule';
import {
  inferFunnelStage,
  inferRowBoardBadge,
  stageBadge,
} from '@/lib/slides/ptCraseSlideUtils';
import {
  BoardChrome,
  PolarityPanel,
  CategoryStrip,
  type BoardTone,
} from '../primitives';

const EMPHASIS_TONE: Record<GoldenRuleRowEmphasis, BoardTone> = {
  default: 'neutral',
  highlight: 'transfer',
  alert: 'exception',
  success: 'ok',
};

function defaultSelectedIndex(rows: GoldenRuleRow[]): number {
  const successIdx = rows.findIndex((r) => r.emphasis === 'success');
  if (successIdx >= 0) return successIdx;
  const highlightIdx = rows.findIndex((r) => r.emphasis === 'highlight');
  if (highlightIdx >= 0) return highlightIdx;
  return 0;
}

function inferCraseHint(row: GoldenRuleRow): string {
  const stage = inferFunnelStage(`${row.label} ${row.value}`);
  switch (stage) {
    case 'teste_masculino':
      return 'Se a palavra for masculina, não use à (no masculino aparece ao).';
    case 'teste_verbo':
      return 'Antes de verbo (estudar, fazer…), use só a — nunca à.';
    case 'teste_a_a':
      return 'Quando tem a (liga) + a (artigo), junta e vira à / às. É aqui que a crase nasce.';
    case 'teste_ao':
      return 'Dúvida? Troque por masculino: se virar ao, no feminino é à.';
    case 'pegadinha':
      return 'Não marque à só porque «parece culto». Rode o funil antes.';
    case 'definicao':
      return 'Crase = a + a. Sem as duas letras a, não tem à.';
    default:
      return 'Pergunte sempre: tem a + a? Só então use à.';
  }
}

function inferCraseFixation(row: GoldenRuleRow, index: number, total: number): string {
  const emphasis = row.emphasis ?? 'default';
  if (emphasis === 'alert') return 'Se cair neste corte, a alternativa está errada.';
  if (emphasis === 'success') return 'Guarde este padrão: a + a → à.';
  if (emphasis === 'highlight') return 'Teste ao: atalho rápido quando a banca esconde o gênero.';
  if (index === total - 1) return 'Última etapa: volte ao topo do funil antes de marcar.';
  return `Etapa ${index + 1}/${total} — entendeu? Passe para a próxima.`;
}

interface GoldenRulePtCraseFunnelBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

/** Funil de bolso — PolarityPanel + tokens (Onda 4); mantém gesto de funil. */
export function GoldenRulePtCraseFunnelBoard({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRulePtCraseFunnelBoardProps) {
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState(() => defaultSelectedIndex(rows));

  const selectRow = useCallback((index: number) => {
    setSelected(index);
  }, []);

  if (rows.length === 0) return null;

  const activeRow = rows[selected] ?? rows[0];
  const emphasis: GoldenRuleRowEmphasis = activeRow.emphasis ?? 'default';
  const tone = EMPHASIS_TONE[emphasis];
  const activeStage = inferFunnelStage(`${activeRow.label} ${activeRow.value}`);

  return (
    <BoardChrome
      theme={theme}
      eyebrow="Funil de bolso"
      title={content ?? 'Tem a + a?'}
      titleClassName="normal-case tracking-normal text-left font-display text-lg font-black md:text-xl"
      footerRule={footerRule}
      maxWidth="lg"
      washOpacity={0.3}
    >
      <p className="flex items-center gap-1.5 font-body text-xs font-medium text-slate-600">
        <Hand className="h-3.5 w-3.5 shrink-0 text-amber-700" aria-hidden />
        Toque cada regra — Sem à ou Com à
      </p>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Estágios do funil">
        {rows.map((row, index) => {
          const isActive = selected === index;
          const rowTone = EMPHASIS_TONE[row.emphasis ?? 'default'];
          return (
            <button
              key={`${row.label}-${index}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => selectRow(index)}
              className="min-h-[44px]"
            >
              <CategoryStrip
                label={row.label}
                tone={rowTone}
                className={
                  isActive
                    ? 'px-3 py-1.5 text-xs ring-2 ring-amber-300/60'
                    : 'px-3 py-1.5 text-xs opacity-85 hover:opacity-100'
                }
              />
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
          >
            <PolarityPanel tone={tone} emphasized={emphasis === 'alert'} className="rounded-2xl">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-[9px] font-extrabold uppercase tracking-widest text-slate-600">
                    {stageBadge(activeStage)}
                  </p>
                  <p className="font-display text-base font-black text-slate-900">{activeRow.label}</p>
                </div>
                <span className="shrink-0 rounded-full bg-white/80 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-slate-700">
                  {inferRowBoardBadge({
                    label: activeRow.label,
                    value: activeRow.value,
                    emphasis,
                  })}
                </span>
              </div>
              <div className="rounded-xl border border-black/5 bg-white/70 px-3 py-2.5">
                <p className="font-display text-sm font-extrabold leading-snug text-slate-900">
                  {activeRow.value}
                </p>
              </div>
              <div className="mt-3 space-y-2">
                <p className="font-body text-sm leading-relaxed text-slate-800">
                  {activeRow.exam_hint ?? inferCraseHint(activeRow)}
                </p>
                <p className="flex items-center gap-1 font-body text-xs font-medium text-slate-500">
                  <ChevronDown className="h-3.5 w-3.5 rotate-[-90deg]" aria-hidden />
                  {activeRow.fixation ?? inferCraseFixation(activeRow, selected, rows.length)}
                </p>
              </div>
            </PolarityPanel>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </BoardChrome>
  );
}

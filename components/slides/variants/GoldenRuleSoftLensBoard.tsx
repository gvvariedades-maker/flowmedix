'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow, GoldenRuleRowBadge, GoldenRuleRowEmphasis } from './GoldenRule';
import {
  resolveSoftLensExamHint,
  resolveSoftLensFixation,
  type SoftLensHintProfile,
} from '@/lib/slides/softLensHints';

type LensTone = {
  pill: string;
  pillActive: string;
  panelBg: string;
  panelBorder: string;
  panelInset: string;
  label: string;
  badge: string;
};

const TONE_BY_EMPHASIS: Record<GoldenRuleRowEmphasis, LensTone> = {
  default: {
    pill: 'bg-slate-100/95 text-slate-800 border-slate-200/90',
    pillActive: 'bg-slate-200/90 text-slate-900 border-slate-300 ring-slate-300/50',
    panelBg: 'bg-slate-200/90',
    panelBorder: 'border-slate-300/90',
    panelInset: 'bg-slate-100/80 border-slate-200/70',
    label: 'text-slate-600',
    badge: 'bg-slate-200/80 text-slate-700',
  },
  highlight: {
    pill: 'bg-violet-100/95 text-violet-900 border-violet-200/90',
    pillActive: 'bg-violet-200/85 text-violet-950 border-violet-300 ring-violet-300/55',
    panelBg: 'bg-violet-200/85',
    panelBorder: 'border-violet-300/90',
    panelInset: 'bg-violet-100/75 border-violet-200/70',
    label: 'text-violet-700',
    badge: 'bg-violet-200/75 text-violet-800',
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
    pill: 'bg-teal-100/95 text-teal-900 border-teal-200/90',
    pillActive: 'bg-teal-200/85 text-teal-950 border-teal-300 ring-teal-300/50',
    panelBg: 'bg-teal-200/85',
    panelBorder: 'border-teal-300/90',
    panelInset: 'bg-teal-100/75 border-teal-200/70',
    label: 'text-teal-700',
    badge: 'bg-teal-200/75 text-teal-800',
  },
};

const BADGE_LABEL: Record<GoldenRuleRowBadge, string> = {
  hot: 'Cobra',
  warn: 'Pegada',
  ok: 'Decore',
  info: 'Contexto',
};

function isAnswerSummaryRow(row: GoldenRuleRow): boolean {
  return /^(resposta final|gabarito|combinação)/i.test(row.label.trim());
}

function lensRowsOnly(rows: GoldenRuleRow[]): GoldenRuleRow[] {
  return rows.filter((row) => !isAnswerSummaryRow(row));
}

function defaultSelectedIndex(rows: GoldenRuleRow[]): number {
  const lenses = lensRowsOnly(rows);
  if (lenses.length === 0) return 0;

  const successIdx = lenses.findIndex((r) => r.emphasis === 'success');
  if (successIdx >= 0) return rows.indexOf(lenses[successIdx]!);

  const alertIdx = lenses.findIndex((r) => r.emphasis === 'alert');
  if (alertIdx >= 0) return rows.indexOf(lenses[alertIdx]!);

  const highlightIdx = lenses.findIndex((r) => r.emphasis === 'highlight');
  if (highlightIdx >= 0) return rows.indexOf(lenses[highlightIdx]!);

  return rows.indexOf(lenses[0]!);
}

interface GoldenRuleSoftLensBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
  /** Perfil de inferência quando row não traz exam_hint/fixation. */
  hintProfile?: SoftLensHintProfile;
}

export function GoldenRuleSoftLensBoard({
  content,
  rows,
  theme,
  footerRule,
  hintProfile = 'none',
}: GoldenRuleSoftLensBoardProps) {
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState(() => defaultSelectedIndex(rows));

  const activeRow = rows[selected] ?? rows[0];
  const activeTone = TONE_BY_EMPHASIS[activeRow?.emphasis ?? 'default'];

  const title = content?.trim();
  const answerRow = rows.find(isAnswerSummaryRow);
  const gridRows = useMemo(
    () =>
      rows
        .map((row, index) => ({ row, index }))
        .filter(({ row }) => !isAnswerSummaryRow(row)),
    [rows],
  );

  const mnemonic = useMemo(() => {
    if (!title) return null;
    if (title.length <= 36) return title;
    return null;
  }, [title]);

  const selectRow = useCallback((index: number) => {
    setSelected(index);
  }, []);

  if (!activeRow) return null;

  return (
    <motion.div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-6">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-40`} />

      <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-5xl flex-col gap-3 md:gap-4">
        <div className="rounded-2xl border border-violet-200/70 bg-white/90 px-4 py-3 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100/90 text-violet-700">
              <Sparkles className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-violet-700">
                Regra de ouro — painel interativo
              </p>
              {title && !mnemonic ? (
                <h2 className="mt-1 font-display text-base font-extrabold uppercase leading-tight tracking-tight text-slate-900 md:text-lg">
                  {title}
                </h2>
              ) : (
                <p className="mt-1 font-body text-sm font-medium text-slate-600">
                  Toque cada lente para fixar o que a banca cobra nesta questão
                </p>
              )}
            </div>
          </div>
          {mnemonic ? (
            <div className="mt-3 rounded-xl border border-indigo-200/80 bg-gradient-to-r from-violet-100/80 via-indigo-50/90 to-blue-50/80 px-4 py-3 text-center">
              <p className="font-display text-xl font-black tracking-wide text-indigo-900 md:text-2xl">
                {mnemonic}
              </p>
            </div>
          ) : null}
        </div>

        {answerRow ? (
          <div className="rounded-2xl border-2 border-violet-300/90 bg-gradient-to-br from-violet-100/90 via-fuchsia-50/80 to-white px-4 py-3 shadow-md">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-violet-800">
              {answerRow.label}
            </p>
            <p className="mt-1 font-display text-lg font-black uppercase tracking-tight text-violet-950 md:text-xl">
              {answerRow.value}
            </p>
            {answerRow.badge ? (
              <span className="mt-2 inline-flex rounded-full bg-violet-200/80 px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide text-violet-900">
                {BADGE_LABEL[answerRow.badge]}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              role="tabpanel"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: 0.22 }}
              className={`flex w-full flex-col overflow-hidden rounded-2xl border-2 shadow-md ${activeTone.panelBorder} ${activeTone.panelBg}`}
            >
              <div className="flex flex-col gap-2.5 px-4 py-3.5 md:gap-3 md:px-5 md:py-4">
                <div>
                  <p
                    className={`font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${activeTone.label}`}
                  >
                    {activeRow.label}
                  </p>
                  <p className="mt-1 font-body text-base font-semibold leading-snug text-slate-900 md:text-lg">
                    {activeRow.value}
                  </p>
                  {activeRow.badge ? (
                    <span
                      className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide ${activeTone.badge}`}
                    >
                      {BADGE_LABEL[activeRow.badge]}
                    </span>
                  ) : null}
                </div>

                <p className="font-body text-sm leading-relaxed text-slate-800 md:text-[15px]">
                  {resolveSoftLensExamHint(activeRow, hintProfile)}
                </p>

                <div className={`rounded-xl border px-3 py-2.5 ${activeTone.panelInset}`}>
                  <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-600">
                    Fixação de prova
                  </p>
                  <p className="mt-1 font-body text-sm font-medium leading-snug text-slate-800">
                    {resolveSoftLensFixation(activeRow, hintProfile, selected, rows.length)}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="min-w-0">
            <p className="mb-2 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
              Todas as lentes — toque para alternar
            </p>
            <div
              className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4"
              role="tablist"
              aria-label="Referências de prova"
            >
              {gridRows.map(({ row, index }) => {
                const tone = TONE_BY_EMPHASIS[row.emphasis ?? 'default'];
                const isActive = selected === index;
                return (
                  <button
                    key={`${row.label}-${index}`}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => selectRow(index)}
                    className={`min-h-[4.5rem] rounded-xl border px-2.5 py-2 text-left transition-all duration-200 ${
                      isActive
                        ? `${tone.pillActive} ring-2`
                        : `${tone.pill} hover:brightness-[0.98]`
                    }`}
                  >
                    <p className="line-clamp-1 font-mono text-[9px] font-bold uppercase tracking-wide opacity-85">
                      {row.label}
                    </p>
                    <p className="mt-0.5 line-clamp-2 font-body text-[11px] font-semibold leading-snug md:text-xs">
                      {row.value}
                    </p>
                    {row.badge ? (
                      <span
                        className={`mt-1 inline-flex rounded-full px-1.5 py-0.5 font-mono text-[7px] font-bold uppercase tracking-wide ${tone.badge}`}
                      >
                        {BADGE_LABEL[row.badge]}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {footerRule ? (
          <p
            className={`rounded-xl border px-4 py-3 text-center font-body text-sm font-medium italic leading-relaxed md:text-base ${theme.borderColor} bg-white/80 ${theme.textSecondary}`}
          >
            {footerRule}
          </p>
        ) : null}
      </div>
    </motion.div>
  );
}

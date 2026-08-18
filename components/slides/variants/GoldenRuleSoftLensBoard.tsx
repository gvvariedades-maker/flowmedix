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
import {
  BoardChrome,
  LabelBodyRow,
  boardTone,
  type BoardTone,
} from '../primitives';
import { cn } from '@/lib/utils';

const BADGE_LABEL: Record<GoldenRuleRowBadge, string> = {
  hot: 'Cobra',
  warn: 'Pegada',
  ok: 'Decore',
  info: 'Contexto',
};

/** SoftLens emphasis → board kit tone (Onda 5). */
export function softLensEmphasisToTone(emphasis?: GoldenRuleRowEmphasis): BoardTone {
  switch (emphasis) {
    case 'alert':
      return 'exception';
    case 'success':
      return 'keep';
    case 'highlight':
      return 'command';
    case 'default':
      return 'warn';
    default:
      return 'neutral';
  }
}

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

/**
 * SoftLens — painel interativo de referência.
 * Onda 5: shell/rows via BoardChrome + LabelBodyRow (+ boardTone); lentes continuam com tap.
 */
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
  const activeTone = softLensEmphasisToTone(activeRow?.emphasis);
  const activeClasses = boardTone(activeTone);

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

  const examHint = resolveSoftLensExamHint(activeRow, hintProfile);
  const fixation = resolveSoftLensFixation(activeRow, hintProfile, selected, rows.length);

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.4}
      maxWidth="5xl"
      footerRule={footerRule}
      className="gap-3 md:gap-4"
    >
      <LabelBodyRow
        tone="rights"
        icon={Sparkles}
        chip="Regra de ouro — painel interativo"
        body={
          title && !mnemonic ? (
            <span className="font-display text-base font-extrabold uppercase leading-tight tracking-tight text-slate-900 md:text-lg">
              {title}
            </span>
          ) : (
            <span className="font-medium text-slate-600">
              Toque cada lente para fixar o que a banca cobra nesta questão
            </span>
          )
        }
        hint={
          mnemonic ? (
            <p className="text-center font-display text-xl font-black tracking-wide text-indigo-900 md:text-2xl">
              {mnemonic}
            </p>
          ) : undefined
        }
        className="border-violet-200/70 bg-white/90 shadow-sm"
      />

      {answerRow ? (
        <LabelBodyRow
          tone="rights"
          chip={answerRow.label}
          body={
            <span className="font-display text-lg font-black uppercase tracking-tight md:text-xl">
              {answerRow.value}
            </span>
          }
          hint={
            answerRow.badge ? (
              <span className="inline-flex rounded-full bg-violet-200/80 px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide text-violet-900">
                {BADGE_LABEL[answerRow.badge]}
              </span>
            ) : undefined
          }
          className="border-2 border-violet-300/90 bg-gradient-to-br from-violet-100/90 via-fuchsia-50/80 to-white shadow-md"
        />
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
          >
            <LabelBodyRow
              tone={activeTone}
              chip={activeRow.label}
              body={
                <span className="flex flex-col gap-2">
                  <span className="font-body text-base font-semibold leading-snug text-slate-900 md:text-lg">
                    {activeRow.value}
                  </span>
                  {activeRow.badge ? (
                    <span
                      className={cn(
                        'inline-flex w-fit rounded-full px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide',
                        activeClasses.badge,
                        activeClasses.badgeText,
                      )}
                    >
                      {BADGE_LABEL[activeRow.badge]}
                    </span>
                  ) : null}
                </span>
              }
              hint={
                <div className="flex flex-col gap-2">
                  <p className="font-body text-sm leading-relaxed text-slate-800 md:text-[15px]">
                    {examHint}
                  </p>
                  <div
                    className={cn(
                      'rounded-xl border px-3 py-2.5',
                      activeClasses.border,
                      activeClasses.bg,
                    )}
                  >
                    <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-600">
                      Fixação de prova
                    </p>
                    <p className="mt-1 font-body text-sm font-medium leading-snug text-slate-800">
                      {fixation}
                    </p>
                  </div>
                </div>
              }
              className="border-2 shadow-md"
            />
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
              const tone = softLensEmphasisToTone(row.emphasis);
              const t = boardTone(tone);
              const isActive = selected === index;
              return (
                <button
                  key={`${row.label}-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => selectRow(index)}
                  className={cn(
                    'min-h-[4.5rem] rounded-xl border-2 px-2.5 py-2 text-left transition-all duration-200',
                    t.panel,
                    isActive ? 'ring-2 ring-offset-1 ring-slate-400' : 'hover:brightness-[0.98]',
                  )}
                >
                  <p className="line-clamp-1 font-mono text-[9px] font-bold uppercase tracking-wide opacity-85">
                    {row.label}
                  </p>
                  <p className="mt-0.5 line-clamp-2 font-body text-[11px] font-semibold leading-snug md:text-xs">
                    {row.value}
                  </p>
                  {row.badge ? (
                    <span
                      className={cn(
                        'mt-1 inline-flex rounded-full px-1.5 py-0.5 font-mono text-[7px] font-bold uppercase tracking-wide',
                        t.badge,
                        t.badgeText,
                      )}
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
    </BoardChrome>
  );
}

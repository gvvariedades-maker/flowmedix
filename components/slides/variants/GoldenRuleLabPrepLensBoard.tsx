'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FlaskConical } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow, GoldenRuleRowBadge, GoldenRuleRowEmphasis } from './GoldenRule';

const BADGE_LABEL: Record<GoldenRuleRowBadge, string> = {
  hot: 'Cobra',
  warn: 'Pegada',
  ok: 'Decore',
  info: 'Contexto',
};

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
    panelBg: 'bg-slate-200/90',
    panelBorder: 'border-slate-300/90',
    panelInset: 'bg-slate-100/80 border-slate-200/70',
    label: 'text-slate-600',
    badge: 'bg-slate-200/80 text-slate-700',
  },
  highlight: {
    pill: 'bg-sky-100/95 text-sky-900 border-sky-200/90',
    pillActive: 'bg-sky-200/85 text-sky-950 border-sky-300 ring-sky-300/55',
    panelBg: 'bg-sky-200/85',
    panelBorder: 'border-sky-300/90',
    panelInset: 'bg-sky-100/75 border-sky-200/70',
    label: 'text-sky-700',
    badge: 'bg-sky-200/75 text-sky-800',
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

function defaultSelectedIndex(rows: GoldenRuleRow[]): number {
  const alertIdx = rows.findIndex((r) => r.emphasis === 'alert');
  if (alertIdx >= 0) return alertIdx;
  const successIdx = rows.findIndex((r) => r.emphasis === 'success');
  if (successIdx >= 0) return successIdx;
  return 0;
}

function inferLabHint(row: GoldenRuleRow): string {
  const text = `${row.label} ${row.value}`.toLowerCase();
  if (/^iii|descarte|perfurocortante|segrega/.test(text)) {
    return 'Pegadinha clássica: misturar gaze/luva com perfurocortante — recipiente sempre separado.';
  }
  if (/^ii|temperatura|2\s*°c|refrigera/.test(text)) {
    return 'Quando o exame pede frio, a faixa 2°C a 8°C costuma ser o critério cobrado em prova.';
  }
  if (/^i |acesso|mediana|cubital/.test(text)) {
    return 'A mediana cubital é a via de escolha frequente — a banca testa se você sabe a preferência técnica.';
  }
  if (/resposta final|i e ii/.test(text)) {
    return 'Feche o V/F: só as afirmativas verdadeiras entram no gabarito — III falsa elimina B e C.';
  }
  if (/pré-analítica|fase pré/.test(text)) {
    return 'Erros de coleta e transporte acontecem antes do laboratório analisar a amostra.';
  }
  return 'Relacione esta linha com I, II ou III antes de marcar a alternativa.';
}

function inferLabFixation(row: GoldenRuleRow, index: number, total: number): string {
  const emphasis = row.emphasis ?? 'default';
  if (emphasis === 'alert') return 'Marque como falsa — a banca repete descarte errado em coleta.';
  if (emphasis === 'success' || emphasis === 'highlight') {
    return 'Afirmativa verdadeira — entra no conjunto do gabarito.';
  }
  if (index === total - 1) return 'Última lente: volte às alternativas e elimine quem inclui III.';
  return `Lente ${index + 1}/${total} — julgue V/F antes de combinar letras.`;
}

interface GoldenRuleLabPrepLensBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

export function GoldenRuleLabPrepLensBoard({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRuleLabPrepLensBoardProps) {
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState(() => defaultSelectedIndex(rows));
  const activeRow = rows[selected] ?? rows[0];
  const activeTone = TONE_BY_EMPHASIS[activeRow?.emphasis ?? 'default'];
  const title = content?.trim();

  const selectRow = useCallback((index: number) => setSelected(index), []);

  if (!activeRow) return null;

  return (
    <motion.div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-6">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-40`} />

      <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-5xl flex-col gap-3 md:gap-4">
        <div className="rounded-2xl border border-sky-200/70 bg-white/90 px-4 py-3 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100/90 text-sky-700">
              <FlaskConical className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-sky-700">
                Pré-analítica — painel I · II · III
              </p>
              {title ? (
                <h2 className="mt-1 font-display text-base font-extrabold uppercase leading-tight tracking-tight text-slate-900 md:text-lg">
                  {title.length <= 80 ? title : `${title.slice(0, 77)}…`}
                </h2>
              ) : (
                <p className="mt-1 font-body text-sm font-medium text-slate-600">
                  Toque cada lente para julgar afirmativa por afirmativa
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
              className={`flex w-full flex-col overflow-hidden rounded-2xl border-2 shadow-md ${activeTone.panelBorder} ${activeTone.panelBg}`}
            >
              <div className="flex flex-col gap-2.5 px-4 py-3.5 md:px-5 md:py-4">
                <p className={`font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${activeTone.label}`}>
                  {activeRow.label}
                </p>
                <p className="font-body text-base font-semibold leading-snug text-slate-900 md:text-lg">
                  {activeRow.value}
                </p>
                {activeRow.badge ? (
                  <span
                    className={`inline-flex w-fit rounded-full px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase ${activeTone.badge}`}
                  >
                    {BADGE_LABEL[activeRow.badge]}
                  </span>
                ) : null}
                <p className="font-body text-sm leading-relaxed text-slate-800">{inferLabHint(activeRow)}</p>
                <div className={`rounded-xl border px-3 py-2.5 ${activeTone.panelInset}`}>
                  <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-600">
                    Fixação
                  </p>
                  <p className="mt-1 font-body text-sm font-medium text-slate-800">
                    {inferLabFixation(activeRow, selected, rows.length)}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {rows.map((row, index) => {
              const tone = TONE_BY_EMPHASIS[row.emphasis ?? 'default'];
              const isActive = selected === index;
              return (
                <button
                  key={`${row.label}-${index}`}
                  type="button"
                  onClick={() => selectRow(index)}
                  className={`min-h-[4rem] rounded-xl border px-2.5 py-2 text-left transition-all ${
                    isActive ? `${tone.pillActive} ring-2` : tone.pill
                  }`}
                >
                  <p className="line-clamp-1 font-mono text-[9px] font-bold uppercase">{row.label}</p>
                  <p className="mt-0.5 line-clamp-2 font-body text-[11px] font-semibold">{row.value}</p>
                </button>
              );
            })}
          </div>
        </div>

        {footerRule ? (
          <p
            className={`rounded-xl border px-4 py-3 text-center font-body text-sm italic ${theme.borderColor} bg-white/80 ${theme.textSecondary}`}
          >
            {footerRule}
          </p>
        ) : null}
      </div>
    </motion.div>
  );
}

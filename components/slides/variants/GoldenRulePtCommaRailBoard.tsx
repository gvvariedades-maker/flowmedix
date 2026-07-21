'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown, Hand, Pilcrow } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow, GoldenRuleRowEmphasis } from './GoldenRule';
import {
  commaStationBadge,
  inferCommaRowBoardBadge,
  inferCommaStation,
} from '@/lib/slides/ptCommaRailSlideUtils';

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
    pill: 'bg-violet-100/95 text-violet-900 border-violet-200/90',
    pillActive: 'bg-violet-200/85 text-violet-950 border-violet-300 ring-violet-300/55',
    panelBg: 'bg-violet-200/85',
    panelBorder: 'border-violet-300/90',
    panelInset: 'bg-violet-100/75 border-violet-200/70',
    label: 'text-violet-800',
    badge: 'bg-violet-200/75 text-violet-900',
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

function inferCommaHint(row: GoldenRuleRow): string {
  const station = inferCommaStation(`${row.label} ${row.value}`);
  switch (station) {
    case 'pergunta_isola':
      return 'Portão M08: a vírgula isola vocativo/aposto — ou corta sujeito|verbo?';
    case 'trilho_livre':
      return 'Núcleo do sujeito colado ao verbo: Eu farei — nunca Eu, farei.';
    case 'vocativo':
      return 'Chama o interlocutor → vírgula(s): Rita, venha cá.';
    case 'aposto':
      return 'Termo explicativo entre vírgulas — não confunda com vocativo.';
    case 'pegadinha':
      return 'Pausa na fala não autoriza vírgula entre sujeito e verbo.';
    case 'definicao':
      return 'Pontuação = isolar termos ou marcar pausas gramaticais, não orais.';
    default:
      return 'Pergunte sempre: o que a vírgula isola? Se for sujeito|verbo → tire.';
  }
}

function inferCommaFixation(row: GoldenRuleRow, index: number, total: number): string {
  const emphasis = row.emphasis ?? 'default';
  if (emphasis === 'alert') return 'Se cair neste corte, a alternativa está errada.';
  if (emphasis === 'success') return 'Guarde: vocativo/aposto → isola; sujeito|verbo → livre.';
  if (emphasis === 'highlight') return 'Pergunta M08: atalho rápido antes de marcar.';
  if (index === total - 1) return 'Última etapa: volte ao portão (o que isola?) antes de marcar.';
  return `Estação ${index + 1}/${total} — entendeu? Passe para a próxima.`;
}

interface GoldenRulePtCommaRailBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

export function GoldenRulePtCommaRailBoard({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRulePtCommaRailBoardProps) {
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState(() => defaultSelectedIndex(rows));

  const selectRow = useCallback((index: number) => {
    setSelected(index);
  }, []);

  if (rows.length === 0) return null;

  const activeRow = rows[selected] ?? rows[0];
  const emphasis: GoldenRuleRowEmphasis = activeRow.emphasis ?? 'default';
  const tone = TONE_BY_EMPHASIS[emphasis];
  const activeStation = inferCommaStation(`${activeRow.label} ${activeRow.value}`);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-30`} />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-3.5">
        <div className="flex flex-col gap-1.5">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-violet-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-violet-800 shadow-sm">
            <Pilcrow className="h-3 w-3" aria-hidden />
            Trilho de bolso
          </span>
          {content ? (
            <h2 className="font-display text-lg font-black leading-tight text-slate-900 md:text-xl">
              {content}
            </h2>
          ) : null}
          <p className="flex items-center gap-1.5 font-body text-xs font-medium text-slate-600">
            <Hand className="h-3.5 w-3.5 shrink-0 text-violet-700" aria-hidden />
            Toque cada estação do trilho
          </p>
        </div>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Estações do trilho de vírgula">
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
                    <p
                      className={`font-mono text-[9px] font-extrabold uppercase tracking-widest ${tone.label}`}
                    >
                      {commaStationBadge(activeStation)}
                    </p>
                    <p className="font-display text-base font-black text-slate-900">
                      {activeRow.label}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase ${tone.badge}`}
                  >
                    {inferCommaRowBoardBadge({
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
                  {activeRow.exam_hint ?? inferCommaHint(activeRow)}
                </p>
                <p className="flex items-center gap-1 font-body text-xs font-medium text-slate-500">
                  <ChevronDown className="h-3.5 w-3.5 rotate-[-90deg]" aria-hidden />
                  {activeRow.fixation ?? inferCommaFixation(activeRow, selected, rows.length)}
                </p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {footerRule ? (
          <p className="rounded-xl border border-violet-200/70 bg-white/90 px-3 py-2.5 text-center font-body text-xs italic text-violet-900/90 shadow-sm">
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}

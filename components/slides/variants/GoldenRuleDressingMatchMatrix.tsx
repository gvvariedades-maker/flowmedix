'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Bandage, ChevronDown, Hand } from 'lucide-react';
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
    pill: 'bg-orange-100/95 text-orange-900 border-orange-200/90',
    pillActive: 'bg-orange-200/85 text-orange-950 border-orange-300 ring-orange-300/55',
    panelBg: 'bg-orange-200/85',
    panelBorder: 'border-orange-300/90',
    panelInset: 'bg-orange-100/75 border-orange-200/70',
    label: 'text-orange-700',
    badge: 'bg-orange-200/75 text-orange-800',
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

function inferDressingHint(row: GoldenRuleRow): string {
  const text = `${row.label} ${row.value}`.toLowerCase();
  if (/^iv|massage|proeminência|proeminencia/.test(text)) {
    return 'Pegadinha clássica: massagem em proeminência óssea ou área hiperemiada — contraindicada na prevenção de LPP.';
  }
  if (/^ii|úmid|umid|seca|maceração|maceracao/.test(text)) {
    return 'Pele úmida no acamado ou gaze seca aderente — o padrão é seco perilesional e cobertura não aderente.';
  }
  if (/^i |pressão|pressao|calcanhar|alívio|alivio/.test(text)) {
    return 'Prevenção de LPP: redistribuir pressão e manter calcanhar livre de compressão direta.';
  }
  if (/^iii|sf|soro fisiológico|limpeza/.test(text)) {
    return 'SF 0,9% limpa sem citotoxicidade — álcool e iodo no leito são armadilhas frequentes.';
  }
  if (/exsudato|alginato|hidrocoloide|filme|gaze|oclusiv/.test(text)) {
    return 'Escolha a cobertura pelo exsudato: pouco → filme/hidrocoloide; moderado/alto → alginato ou gaze não aderente.';
  }
  if (/resposta final|i e iii|gabarito/.test(text)) {
    return 'Feche o V/F: só as afirmativas verdadeiras entram no gabarito — II e IV falsas eliminam alternativas.';
  }
  if (/estágio|estagio|granulação|necrose|esfacelo/.test(text)) {
    return 'Relacione estágio da ferida ao tipo de tecido e à cobertura indicada.';
  }
  return 'Relacione esta linha com I, II, III ou IV antes de marcar a alternativa.';
}

function inferDressingFixation(row: GoldenRuleRow, index: number, total: number): string {
  const emphasis = row.emphasis ?? 'default';
  if (emphasis === 'alert') return 'Marque como falsa — a banca repete conduta errada em curativos.';
  if (emphasis === 'success' || emphasis === 'highlight') {
    return 'Afirmativa verdadeira — entra no conjunto do gabarito.';
  }
  if (index === total - 1) return 'Última célula: volte às alternativas e elimine quem inclui afirmativas falsas.';
  return `Célula ${index + 1}/${total} — julgue V/F antes de combinar letras.`;
}

interface GoldenRuleDressingMatchMatrixProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

export function GoldenRuleDressingMatchMatrix({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRuleDressingMatchMatrixProps) {
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
        <div className="rounded-2xl border border-orange-200/70 bg-white/90 px-4 py-3 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100/90 text-orange-700">
              <Bandage className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-orange-700">
                Matriz exsudato × cobertura
              </p>
              {title ? (
                <h2 className="mt-1 font-display text-base font-extrabold uppercase leading-tight tracking-tight text-slate-900 md:text-lg">
                  {title.length <= 80 ? title : `${title.slice(0, 77)}…`}
                </h2>
              ) : null}
              <p className="mt-1.5 flex items-center gap-1.5 font-body text-sm font-medium text-slate-600">
                <Hand className="h-4 w-4 shrink-0 text-orange-600" aria-hidden />
                Toque cada célula abaixo para ver a explicação completa
              </p>
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
                <p className="font-body text-sm leading-relaxed text-slate-800">{inferDressingHint(activeRow)}</p>
                <div className={`rounded-xl border px-3 py-2.5 ${activeTone.panelInset}`}>
                  <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-600">Fixação</p>
                  <p className="mt-1 font-body text-sm font-medium text-slate-800">
                    {inferDressingFixation(activeRow, selected, rows.length)}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-1 py-0.5 text-orange-700/80" aria-hidden>
            <ChevronDown className={`h-4 w-4 ${reduceMotion ? '' : 'animate-bounce'}`} />
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest">Selecione uma célula</span>
            <ChevronDown className={`h-4 w-4 ${reduceMotion ? '' : 'animate-bounce'}`} />
          </div>

          <div
            className="grid grid-cols-2 gap-2 sm:grid-cols-3"
            role="tablist"
            aria-label="Afirmativas da questão"
          >
            {rows.map((row, index) => {
              const tone = TONE_BY_EMPHASIS[row.emphasis ?? 'default'];
              const isActive = selected === index;
              return (
                <button
                  key={`${row.label}-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`${row.label}: ${row.value}`}
                  onClick={() => selectRow(index)}
                  className={`min-h-[4rem] cursor-pointer rounded-xl border px-2.5 py-2 text-left transition-all ${
                    isActive
                      ? `${tone.pillActive} ring-2`
                      : `${tone.pill} hover:shadow-md hover:ring-1 hover:ring-orange-200/80 active:scale-[0.98]`
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

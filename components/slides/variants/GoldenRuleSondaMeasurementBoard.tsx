'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Bed, CheckCircle2, Droplet, Ruler, ShieldAlert, Syringe } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow, GoldenRuleRowBadge } from './GoldenRule';

function isAnswerSummaryRow(row: GoldenRuleRow): boolean {
  return /^(resposta final|gabarito|combinação)/i.test(row.label.trim());
}

const BADGE_LABEL: Record<GoldenRuleRowBadge, string> = {
  hot: 'Cobra',
  warn: 'Pegada',
  info: 'Contexto',
  ok: 'Decore',
};

function inferSimulationKind(label: string, value: string): 'nex' | 'fowler' | 'confirm' | 'vesical' | 'generic' {
  const text = `${label} ${value}`.toLowerCase();
  if (/nex|xifoide|orelha|medida/.test(text)) return 'nex';
  if (/fowler|decúbito|decubito|45|90|cabeceira|elevad/.test(text)) return 'fowler';
  if (/radiograf|raio-x|ausculta|confirma|padrão-ouro|padrao-ouro/.test(text)) return 'confirm';
  if (/foley|vesical|urina|balão|balao|svd/.test(text)) return 'vesical';
  return 'generic';
}

function SimulationPanel({ kind }: { kind: ReturnType<typeof inferSimulationKind> }) {
  if (kind === 'nex') {
    return (
      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-2xl border border-indigo-300/50 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.2),transparent_70%)]" />
        <div className="relative z-10 flex flex-col items-center gap-2 px-4 text-center">
          <Ruler className="h-10 w-10 text-indigo-300" aria-hidden />
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-200">
            Método NEX
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1 font-mono text-[10px] text-slate-300">
            <span>Nariz</span>
            <span className="text-indigo-400">→</span>
            <span>Orelha</span>
            <span className="text-indigo-400">→</span>
            <span>Xifoide</span>
          </div>
          <div className="mt-1 h-1.5 w-36 overflow-hidden rounded-full bg-slate-800">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-400 to-violet-500"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 0.8 }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (kind === 'fowler') {
    return (
      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-2xl border border-sky-300/40 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.15),transparent_70%)]" />
        <div className="relative z-10 flex flex-col items-center gap-2 px-4 text-center">
          <Bed className="h-10 w-10 text-sky-300" aria-hidden />
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-sky-200">
            Posição de Fowler
          </p>
          <div className="relative mt-1 h-12 w-28 border-b-2 border-l-2 border-slate-600">
            <motion.div
              className="absolute bottom-0 left-0 h-1 w-24 origin-left bg-sky-400"
              initial={{ rotate: 0 }}
              animate={{ rotate: -55 }}
              transition={{ type: 'spring', stiffness: 50 }}
            />
            <span className="absolute bottom-1 right-0 font-mono text-[9px] font-bold text-sky-300">45°–90°</span>
          </div>
          <p className="max-w-[220px] font-body text-[10px] text-slate-400">
            Protege a via aérea e reduz broncoaspiração na passagem
          </p>
        </div>
      </div>
    );
  }

  if (kind === 'confirm') {
    return (
      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-2xl border border-rose-400/40 bg-gradient-to-br from-slate-900 via-rose-950/40 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.12),transparent_70%)]" />
        <div className="relative z-10 flex flex-col items-center gap-2 px-4 text-center">
          <ShieldAlert className="h-10 w-10 text-rose-400" aria-hidden />
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-200">
            Confirmação segura
          </p>
          <span className="rounded-full border border-rose-400/40 bg-rose-500/15 px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide text-rose-300">
            Radiografia de abdome
          </span>
          <p className="max-w-[220px] font-body text-[10px] text-slate-400">
            Ausculta epigástrica isolada não é padrão-ouro
          </p>
        </div>
      </div>
    );
  }

  if (kind === 'vesical') {
    return (
      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-2xl border border-violet-300/40 bg-gradient-to-br from-slate-900 via-violet-950/50 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15),transparent_70%)]" />
        <div className="relative z-10 flex flex-col items-center gap-2 px-4 text-center">
          <Droplet className="h-10 w-10 text-violet-300" aria-hidden />
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-violet-200">
            Sonda vesical
          </p>
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden />
            <span>Retorno de urina → insuflar balão</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-2xl border border-indigo-300/30 bg-gradient-to-br from-slate-900 to-indigo-950">
      <div className="relative z-10 flex flex-col items-center gap-2 px-4 text-center">
        <Syringe className="h-10 w-10 text-indigo-300" aria-hidden />
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-200">
          Procedimento de sondagem
        </p>
        <p className="max-w-[220px] font-body text-[10px] text-slate-400">
          Toque cada lente para ver o parâmetro clínico
        </p>
      </div>
    </div>
  );
}

function defaultLensIndex(rows: GoldenRuleRow[]): number {
  const lenses = rows.filter((r) => !isAnswerSummaryRow(r));
  const alertIdx = lenses.findIndex((r) => r.emphasis === 'alert');
  if (alertIdx >= 0) return rows.indexOf(lenses[alertIdx]!);
  const hotIdx = lenses.findIndex((r) => r.badge === 'hot');
  if (hotIdx >= 0) return rows.indexOf(lenses[hotIdx]!);
  return rows.findIndex((r) => !isAnswerSummaryRow(r));
}

interface GoldenRuleSondaMeasurementBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

export function GoldenRuleSondaMeasurementBoard({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRuleSondaMeasurementBoardProps) {
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState(() => defaultLensIndex(rows));

  const answerRow = rows.find(isAnswerSummaryRow);
  const lensEntries = useMemo(
    () =>
      rows
        .map((row, index) => ({ row, index }))
        .filter(({ row }) => !isAnswerSummaryRow(row)),
    [rows],
  );

  const activeRow = rows[selected] ?? rows[0];
  const simKind = inferSimulationKind(activeRow?.label ?? '', activeRow?.value ?? '');

  const selectRow = useCallback((index: number) => {
    setSelected(index);
  }, []);

  if (!activeRow) return null;

  return (
    <motion.div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-6">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-5xl flex-col gap-3 md:gap-4">
        <div className="rounded-2xl border border-indigo-200/70 bg-white/95 px-4 py-3 shadow-sm">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-700">
            Simulador clínico — sondagem
          </p>
          <h2 className="mt-1 font-display text-base font-extrabold uppercase leading-tight text-slate-900 md:text-lg">
            {content?.trim() || 'Parâmetros e confirmação na prova'}
          </h2>
        </div>

        {answerRow ? (
          <div className="rounded-2xl border-2 border-indigo-300/80 bg-gradient-to-br from-indigo-50 via-white to-violet-50 px-4 py-3 shadow-md">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-800">
              {answerRow.label}
            </p>
            <p className="mt-1 font-display text-lg font-black uppercase tracking-tight text-indigo-950 md:text-xl">
              {answerRow.value}
            </p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <div className="md:col-span-5">
            <SimulationPanel kind={simKind} />
          </div>

          <div className="md:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={selected}
                role="tabpanel"
                initial={reduceMotion ? false : { opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, x: -6 }}
                transition={{ duration: 0.22 }}
                className="flex min-h-[11rem] flex-col justify-between rounded-2xl border border-indigo-200/80 bg-white/95 p-4 shadow-md md:p-5"
              >
                <div>
                  <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide text-indigo-800">
                    {activeRow.label}
                  </span>
                  <p className="mt-3 font-body text-base font-semibold leading-snug text-slate-900 md:text-lg">
                    {activeRow.value}
                  </p>
                  {activeRow.badge ? (
                    <span className="mt-2 inline-flex rounded-full bg-indigo-100 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide text-indigo-800">
                      {BADGE_LABEL[activeRow.badge]}
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-2.5">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-indigo-700">
                    Fixação de prova
                  </p>
                  <p className="mt-1 font-body text-sm leading-relaxed text-slate-700">
                    {activeRow.badge === 'warn' || activeRow.emphasis === 'alert'
                      ? 'Pegadinha clássica — a banca troca ausculta isolada por padrão-ouro ou mistura SNG com balão vesical.'
                      : activeRow.badge === 'hot'
                        ? 'Alta cobrança — memorize antes de marcar a alternativa.'
                        : 'Relacione este parâmetro com I, II e III antes de combinar letras.'}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div>
          <p className="mb-2 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
            Lentes do procedimento — toque para alternar
          </p>
          <div
            className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4"
            role="tablist"
            aria-label="Referências de sondagem"
          >
            {lensEntries.map(({ row, index }) => {
              const isActive = selected === index;
              return (
                <button
                  key={`${row.label}-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => selectRow(index)}
                  className={`min-h-[4.25rem] rounded-xl border px-2.5 py-2 text-left transition-all duration-200 ${
                    isActive
                      ? 'border-indigo-400 bg-indigo-100 ring-2 ring-indigo-300/50'
                      : 'border-slate-200 bg-white hover:border-indigo-200'
                  }`}
                >
                  <p className="line-clamp-1 font-mono text-[8px] font-bold uppercase tracking-wide text-slate-500">
                    {row.label}
                  </p>
                  <p className="mt-0.5 line-clamp-2 font-body text-[11px] font-semibold leading-snug text-slate-800">
                    {row.value}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {footerRule ? (
          <p
            className={`rounded-xl border px-4 py-3 text-center font-body text-sm font-medium italic leading-relaxed ${theme.borderColor} bg-white/80 ${theme.textSecondary}`}
          >
            {footerRule}
          </p>
        ) : null}
      </div>
    </motion.div>
  );
}

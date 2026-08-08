'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowDown,
  Brain,
  CheckCircle2,
  ClipboardList,
  GitBranch,
  Scale,
  Target,
  XCircle,
} from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import {
  cleanMentalStepBody,
  parseAdolescentMentalStep,
  type AdolescentMentalStepKind,
} from '@/lib/slides/adolescentMentalSlideUtils';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { BoardChrome } from '../primitives';
import { cn } from '@/lib/utils';

interface LogicFlowAdolescentMentalProtocolRailProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

type ParsedRow = {
  kind: AdolescentMentalStepKind;
  letter?: string;
  raw: string;
  index: number;
  body: string;
};

const JUDGE_TONES = [
  {
    panel: 'bg-emerald-50',
    ring: 'ring-emerald-200',
    iconBg: 'bg-emerald-600',
    title: 'text-[#0b3a6e]',
  },
  {
    panel: 'bg-amber-50',
    ring: 'ring-amber-200',
    iconBg: 'bg-amber-500',
    title: 'text-[#0b3a6e]',
  },
] as const;

const FLOW_TONES = [
  { panel: 'bg-sky-50', accent: 'text-[#0b3a6e]' },
  { panel: 'bg-amber-50', accent: 'text-[#0b3a6e]' },
  { panel: 'bg-orange-50', accent: 'text-[#0b3a6e]' },
  { panel: 'bg-rose-50', accent: 'text-[#0b3a6e]' },
] as const;

function titleForKind(kind: AdolescentMentalStepKind, letter?: string): string {
  switch (kind) {
    case 'judge':
      return letter ? `Julgar ${letter}` : 'Julgar asserção';
    case 'relation':
      return 'Relação I–II';
    case 'eliminate':
      return 'Eliminar distratores';
    case 'mark':
      return 'Gabarito';
    case 'transfer':
      return 'Fixação';
    case 'context':
      return 'Comando';
    default:
      return 'Passo';
  }
}

function iconForKind(kind: AdolescentMentalStepKind) {
  switch (kind) {
    case 'judge':
      return Scale;
    case 'relation':
      return GitBranch;
    case 'eliminate':
      return XCircle;
    case 'mark':
      return Target;
    case 'transfer':
      return CheckCircle2;
    case 'context':
      return ClipboardList;
    default:
      return Brain;
  }
}

function capitalizeFirst(text: string): string {
  const t = text.trim();
  if (!t) return t;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/**
 * Slide 2 mental — carrossel modular (estilo decreto/região SUS):
 * header bipartido + bloco “o que julgar” + critérios pastel + barra relação + trilho.
 * Estático: sem tap.
 */
export function LogicFlowAdolescentMentalProtocolRail({
  steps,
  theme,
  footerRule,
}: LogicFlowAdolescentMentalProtocolRailProps) {
  const reduceMotion = useReducedMotion();

  const { comando, judges, relation, flow } = useMemo(() => {
    const normalized = normalizeLogicFlowSteps(steps);
    const parsed: ParsedRow[] = normalized.map((step, index) => {
      const p = parseAdolescentMentalStep(step, index);
      return { ...p, body: cleanMentalStepBody(p.raw) };
    });

    const comando = parsed.find((p) => p.kind === 'context')?.body;
    const judges = parsed.filter((p) => p.kind === 'judge').slice(0, 2);
    const relation = parsed.find((p) => p.kind === 'relation');
    const used = new Set<number>([
      ...parsed.filter((p) => p.kind === 'context').map((p) => p.index),
      ...judges.map((p) => p.index),
      ...(relation ? [relation.index] : []),
    ]);
    const flow = parsed.filter((p) => !used.has(p.index));
    return { comando, judges, relation, flow };
  }, [steps]);

  return (
    <BoardChrome theme={theme} washOpacity={0.12} maxWidth="lg">
      {/* Header bipartido — navy / vermelho */}
      <header className="text-center">
        <h2 className="font-display text-[1.05rem] font-black uppercase leading-tight tracking-tight md:text-xl">
          <span className="text-[#0b3a6e]">Funil das asserções: </span>
          <span className="text-[#e11d2e]">ordem que a banca cobra</span>
        </h2>
      </header>

      {/* Bloco definição / comando */}
      {comando ? (
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex overflow-hidden rounded-2xl bg-sky-100/90"
        >
          <div className="flex w-14 shrink-0 items-center justify-center bg-[#0b3a6e] sm:w-16">
            <ClipboardList className="h-7 w-7 text-white" aria-hidden />
          </div>
          <div className="min-w-0 px-3 py-3 sm:px-4">
            <p className="font-display text-xs font-black uppercase tracking-wide text-[#0b3a6e] md:text-sm">
              O que julgar?
            </p>
            <p className="mt-0.5 font-body text-sm font-semibold leading-snug text-slate-800">
              {capitalizeFirst(comando)}
            </p>
          </div>
        </motion.section>
      ) : null}

      {/* Critérios I e II — blocos pastel empilhados */}
      {judges.length > 0 ? (
        <div className="relative flex flex-col gap-2">
          {judges.map((row, index) => {
            const tone = JUDGE_TONES[index % JUDGE_TONES.length]!;
            const Icon = iconForKind(row.kind);
            return (
              <motion.article
                key={`judge-${row.index}`}
                initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: reduceMotion ? 0 : index * 0.04 }}
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-3 py-3 ring-1',
                  tone.panel,
                  tone.ring,
                )}
              >
                <span
                  className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-sm',
                    tone.iconBg,
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className={cn('font-display text-xs font-black uppercase tracking-wide', tone.title)}>
                    {titleForKind(row.kind, row.letter)}
                  </p>
                  <p className="mt-0.5 font-body text-sm font-semibold leading-snug text-slate-800">
                    {row.body || '—'}
                  </p>
                </div>
              </motion.article>
            );
          })}

          {judges.length >= 2 ? (
            <span
              className="absolute -right-1 top-1/2 z-[1] flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-[#0b3a6e] font-display text-sm font-black text-white shadow-md sm:right-2"
              aria-hidden
            >
              e
            </span>
          ) : null}
        </div>
      ) : null}

      {/* Barra “Finalidade” → Relação I–II */}
      {relation ? (
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex overflow-hidden rounded-2xl"
        >
          <div className="flex w-[5.5rem] shrink-0 items-center justify-center bg-[#0b3a6e] px-2 sm:w-28">
            <p className="text-center font-display text-[11px] font-black uppercase leading-tight tracking-wide text-white sm:text-xs">
              Relação
            </p>
          </div>
          <div className="min-w-0 flex-1 bg-sky-100/90 px-3 py-3 sm:px-4">
            <p className="font-body text-sm font-semibold leading-snug text-slate-800">
              {relation.body || '—'}
            </p>
          </div>
        </motion.section>
      ) : null}

      {/* Trilho de decisão — header navy + passos com fio laranja */}
      {flow.length > 0 ? (
        <section className="space-y-2">
          <div className="rounded-2xl bg-[#0b3a6e] px-3 py-2.5 text-center shadow-sm">
            <p className="font-display text-xs font-black uppercase tracking-wide text-white md:text-sm">
              Protocolo de decisão
            </p>
          </div>

          <div className="relative pl-1">
            <div
              className="absolute bottom-4 left-[1.15rem] top-4 w-1 rounded-full bg-orange-400"
              aria-hidden
            />
            <div className="flex flex-col gap-2">
              {flow.map((row, index) => {
                const tone = FLOW_TONES[index % FLOW_TONES.length]!;
                const Icon = iconForKind(row.kind);
                const body =
                  row.body ||
                  (row.kind === 'mark' && row.letter
                    ? `Letra ${row.letter} — ambas verdadeiras, sem justificativa correta`
                    : '—');
                return (
                  <motion.article
                    key={`flow-${row.index}`}
                    initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduceMotion ? 0 : 0.05 + index * 0.035 }}
                    className="relative flex items-stretch gap-2"
                  >
                    <div className="relative z-[1] flex w-10 shrink-0 flex-col items-center justify-center">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white shadow-sm">
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      {index < flow.length - 1 ? (
                        <ArrowDown
                          className="mt-1 h-3.5 w-3.5 text-orange-500"
                          aria-hidden
                        />
                      ) : null}
                    </div>
                    <div
                      className={cn(
                        'min-w-0 flex-1 rounded-2xl px-3 py-2.5 ring-1 ring-slate-200/70',
                        tone.panel,
                      )}
                    >
                      <p
                        className={cn(
                          'font-display text-[11px] font-black uppercase tracking-wide',
                          tone.accent,
                        )}
                      >
                        {titleForKind(row.kind, row.letter)}
                      </p>
                      <p className="mt-0.5 font-body text-sm font-semibold leading-snug text-slate-800">
                        {body}
                      </p>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {footerRule ? (
        <div className="rounded-2xl border border-[#0b3a6e]/15 bg-[#0b3a6e]/[0.04] px-3 py-2.5">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#0b3a6e]">
            Dica de prova
          </p>
          <p className="mt-0.5 font-body text-xs font-semibold leading-snug text-slate-800 md:text-sm">
            {footerRule}
          </p>
        </div>
      ) : null}
    </BoardChrome>
  );
}

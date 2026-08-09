'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import {
  capitalizeFirst,
  cleanDevStepBody,
  parseAdolescentDevStep,
  type AdolescentDevStepKind,
} from '@/lib/slides/adolescentDevSlideUtils';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { BoardChrome } from '../primitives';
import { cn } from '@/lib/utils';

interface LogicFlowAdolescentDevObjectiveFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

const PAIR_TONES = [
  { dark: 'bg-[#38761D]', soft: 'bg-emerald-50' },
  { dark: 'bg-[#BF9000]', soft: 'bg-amber-50' },
  { dark: 'bg-[#3D85C6]', soft: 'bg-sky-50' },
  { dark: 'bg-[#674EA7]', soft: 'bg-violet-50' },
] as const;

function titleForKind(kind: AdolescentDevStepKind): string {
  switch (kind) {
    case 'girls':
      return 'Meninas';
    case 'boys':
      return 'Meninos';
    case 'mark':
      return 'Gabarito';
    case 'fix':
      return 'Fixação';
    case 'context':
      return 'Comando';
    default:
      return 'Critério';
  }
}

/**
 * Slide 2 desenvolvimento — estilo “Objetivos do SUS”:
 * pares label↔detail + bloco empilhado no fechamento. Estático (0 taps).
 */
export function LogicFlowAdolescentDevObjectiveFlow({
  steps,
  theme,
  footerRule,
}: LogicFlowAdolescentDevObjectiveFlowProps) {
  const reduceMotion = useReducedMotion();

  const { comando, pairs, stacked } = useMemo(() => {
    const normalized = normalizeLogicFlowSteps(steps);
    const parsed = normalized.map((step, index) => {
      const p = parseAdolescentDevStep(step, index);
      return { ...p, body: cleanDevStepBody(p.raw) };
    });
    const comando = parsed.find((p) => p.kind === 'context')?.body;
    const rest = parsed.filter((p) => p.kind !== 'context');
    const stackedKinds = new Set(['mark', 'fix']);
    const pairs = rest.filter((p) => !stackedKinds.has(p.kind));
    const stacked = rest.filter((p) => stackedKinds.has(p.kind));
    return { comando, pairs, stacked };
  }, [steps]);

  return (
    <BoardChrome theme={theme} washOpacity={0.12} maxWidth="lg">
      <header className="text-center">
        <h2 className="font-display text-lg font-black tracking-tight text-slate-900 md:text-xl">
          São <span className="uppercase">critérios</span> de atraso:
        </h2>
      </header>

      {comando ? (
        <div className="rounded-2xl bg-slate-900 px-3 py-2.5 text-center">
          <p className="font-body text-sm font-semibold leading-snug text-white">
            {capitalizeFirst(comando)}
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        {pairs.map((row, index) => {
          const tone = PAIR_TONES[index % PAIR_TONES.length]!;
          return (
            <motion.div
              key={`pair-${row.index}`}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : index * 0.04 }}
              className="grid grid-cols-1 items-center gap-0 sm:grid-cols-[minmax(7.5rem,9.5rem)_1.25rem_1fr]"
            >
              <div className={cn('rounded-2xl px-3 py-3 text-center shadow-sm', tone.dark)}>
                <p className="font-display text-sm font-black text-white">
                  {titleForKind(row.kind)}
                </p>
              </div>
              <div className="hidden items-center justify-center sm:flex" aria-hidden>
                <span className="h-px w-full bg-slate-800" />
              </div>
              <div className={cn('rounded-2xl px-3 py-3 shadow-sm ring-1 ring-black/5', tone.soft)}>
                <p className="font-body text-sm font-semibold leading-snug text-slate-900">
                  {row.body || '—'}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {stacked.map((row, index) => (
        <motion.section
          key={`stack-${row.index}`}
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.08 + index * 0.04 }}
          className="flex flex-col items-center gap-0"
        >
          <div className="w-full rounded-2xl bg-[#3D85C6] px-3 py-2.5 text-center shadow-sm">
            <p className="font-display text-sm font-black uppercase tracking-wide text-white">
              {titleForKind(row.kind)}
            </p>
          </div>
          <div className="flex h-3 w-px bg-slate-800" aria-hidden />
          <div className="w-full rounded-2xl bg-sky-50 px-3 py-3 text-center shadow-sm ring-1 ring-sky-100">
            <p className="font-body text-sm font-semibold leading-snug text-slate-900">
              {row.body ||
                (row.kind === 'mark' && row.letter
                  ? `Letra ${row.letter} — Certo`
                  : '—')}
            </p>
          </div>
        </motion.section>
      ))}

      {footerRule ? (
        <div className="rounded-2xl border border-[#3D85C6]/20 bg-[#3D85C6]/[0.06] px-3 py-2.5 text-center">
          <p className="font-body text-xs font-semibold leading-snug text-slate-800 md:text-sm">
            {footerRule}
          </p>
        </div>
      ) : null}
    </BoardChrome>
  );
}

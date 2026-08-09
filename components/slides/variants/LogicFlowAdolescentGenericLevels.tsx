'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import {
  capitalizeFirst,
  cleanGenericStepBody,
  parseAdolescentGenericStep,
  type AdolescentGenericStepKind,
} from '@/lib/slides/adolescentGenericSlideUtils';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { BoardChrome, SoftRealIcon, type SoftRealIconTone } from '../primitives';
import { cn } from '@/lib/utils';

interface LogicFlowAdolescentGenericLevelsProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

const LEVEL_META: Array<{ title: string; iconName: string; tone: string; iconTone: SoftRealIconTone }> = [
  { title: 'Atenção primária', iconName: 'Home', tone: 'bg-teal-50 ring-teal-200', iconTone: 'teal' },
  {
    title: 'Atenção secundária',
    iconName: 'Stethoscope',
    tone: 'bg-sky-50 ring-sky-200',
    iconTone: 'sky',
  },
  {
    title: 'Atenção terciária',
    iconName: 'Building2',
    tone: 'bg-indigo-50 ring-indigo-200',
    iconTone: 'indigo',
  },
];

function titleForKind(kind: AdolescentGenericStepKind, index: number): string {
  if (kind === 'mark') return 'Gabarito';
  if (kind === 'fix') return 'Fixação';
  return LEVEL_META[index]?.title ?? `Nível ${index + 1}`;
}

/**
 * Slide 2 genérico — cards empilhados estilo “Níveis de atenção”. Estático.
 */
export function LogicFlowAdolescentGenericLevels({
  steps,
  theme,
  footerRule,
}: LogicFlowAdolescentGenericLevelsProps) {
  const reduceMotion = useReducedMotion();

  const { levels, closing, summary } = useMemo(() => {
    const normalized = normalizeLogicFlowSteps(steps);
    const parsed = normalized.map((step, index) => {
      const p = parseAdolescentGenericStep(step, index);
      return { ...p, body: cleanGenericStepBody(p.raw) };
    });
    const levels = parsed.filter((p) => p.kind === 'judge' || p.kind === 'step').slice(0, 3);
    const closing = parsed.filter((p) => p.kind === 'mark' || p.kind === 'fix');
    const summary =
      footerRule ||
      levels
        .map((l, i) => `${['I', 'II', 'III'][i] ?? i + 1}`)
        .join(' · ');
    return { levels, closing, summary };
  }, [steps, footerRule]);

  return (
    <BoardChrome theme={theme} washOpacity={0.12} maxWidth="lg">
      <header className="text-center">
        <p className="font-display text-2xl font-black tracking-tight text-[#0B3A6E]">NÍVEIS</p>
        <div className="mx-auto mt-1 inline-block rounded-md bg-[#0B3A6E] px-3 py-1">
          <p className="font-display text-sm font-black uppercase tracking-wide text-white">
            de julgamento
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-2.5">
        {levels.map((row, index) => {
          const meta = LEVEL_META[index % LEVEL_META.length]!;
          return (
            <motion.article
              key={`lvl-${row.index}`}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : index * 0.04 }}
              className={cn(
                'flex items-start gap-3 rounded-2xl px-3 py-3 shadow-sm ring-1',
                meta.tone,
              )}
            >
              <SoftRealIcon name={meta.iconName} tone={meta.iconTone} size="md" />
              <div className="min-w-0">
                <p className="font-display text-xs font-black uppercase tracking-wide text-[#0B3A6E]">
                  {titleForKind(row.kind, index)}
                </p>
                <p className="mt-0.5 font-body text-sm font-semibold leading-snug text-slate-900">
                  {capitalizeFirst(row.body) || '—'}
                </p>
              </div>
            </motion.article>
          );
        })}
      </div>

      {closing.map((row) => (
        <div
          key={`close-${row.index}`}
          className="rounded-2xl bg-[#0B3A6E] px-3 py-2.5 text-center shadow-md"
        >
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-sky-200">
            {titleForKind(row.kind, 0)}
          </p>
          <p className="mt-0.5 font-display text-sm font-black text-white">
            {row.body ||
              (row.kind === 'mark' && row.letter ? `Letra ${row.letter}` : '—')}
          </p>
        </div>
      ))}

      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
        <SoftRealIcon name="CheckCircle2" tone="emerald" size="sm" />
        <p className="font-body text-sm font-semibold leading-snug text-slate-800">
          {summary}
        </p>
      </div>
    </BoardChrome>
  );
}

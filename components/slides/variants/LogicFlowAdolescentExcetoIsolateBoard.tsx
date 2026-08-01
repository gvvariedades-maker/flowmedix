'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, Hand, Target, XCircle } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import { parseAdolescentExcetoStep } from '@/lib/slides/adolescentSlideUtils';
import type { LogicFlowRevealMode } from './logicFlowReveal';

interface LogicFlowAdolescentExcetoIsolateBoardProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  /** Ignorado — board é glanceable (0 taps). Aceito para contrato do player. */
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

type ParsedStep = ReturnType<typeof parseAdolescentExcetoStep> & { key: string };

function tone(kind: ParsedStep['kind']): string {
  switch (kind) {
    case 'command':
      return 'border-sky-300 bg-sky-50 text-sky-950';
    case 'keep':
      return 'border-emerald-300 bg-emerald-50 text-emerald-950';
    case 'exception':
      return 'border-rose-300 bg-rose-50 text-rose-950';
    case 'mark':
      return 'border-sky-400 bg-sky-100 text-sky-950';
    case 'transfer':
      return 'border-amber-300 bg-amber-50 text-amber-950';
    default:
      return 'border-slate-200 bg-white text-slate-900';
  }
}

function StepCard({
  step,
  reduceMotion,
  delayIndex,
}: {
  step: ParsedStep;
  reduceMotion: boolean | null;
  delayIndex: number;
}) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : Math.min(delayIndex * 0.04, 0.2) }}
      className={`rounded-2xl border-2 p-3.5 shadow-sm md:p-4 ${tone(step.kind)}`}
    >
      <p className="font-mono text-[10px] font-bold uppercase tracking-widest opacity-80">
        {step.title}
        {step.letter ? ` · ${step.letter}` : ''}
      </p>
      <p className="mt-1.5 font-body text-sm font-semibold leading-snug md:text-base">
        {step.kind === 'exception' ? (
          <span className="inline-flex items-start gap-2">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <span>{step.text}</span>
          </span>
        ) : step.kind === 'keep' || step.kind === 'mark' ? (
          <span className="inline-flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <span>{step.text}</span>
          </span>
        ) : step.kind === 'command' ? (
          <span className="inline-flex items-start gap-2">
            <Target className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <span>{step.text}</span>
          </span>
        ) : (
          step.text
        )}
      </p>
    </motion.div>
  );
}

/**
 * Isola a EXCETO/INCORRETA em uma tela — manter × exceção, sem taps.
 * JSON continua com `steps[]`; o molde só deixa de serializar a revelação.
 */
export function LogicFlowAdolescentExcetoIsolateBoard({
  steps,
  theme,
  footerRule,
}: LogicFlowAdolescentExcetoIsolateBoardProps) {
  const reduceMotion = useReducedMotion();
  const normalized = useMemo(() => normalizeLogicFlowSteps(steps), [steps]);
  const parsed = useMemo(
    () =>
      normalized.map((step, index) => ({
        ...parseAdolescentExcetoStep(step, index),
        key: `s${index}`,
      })),
    [normalized],
  );

  const command = parsed.filter((p) => p.kind === 'command');
  const keep = parsed.filter((p) => p.kind === 'keep');
  const exception = parsed.filter((p) => p.kind === 'exception');
  const mark = parsed.filter((p) => p.kind === 'mark');
  const transfer = parsed.filter((p) => p.kind === 'transfer');
  const rest = parsed.filter(
    (p) => !['command', 'keep', 'exception', 'mark', 'transfer'].includes(p.kind),
  );

  if (normalized.length === 0) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <p className="font-body text-slate-400">Nenhum passo definido</p>
      </div>
    );
  }

  let delay = 0;
  const nextDelay = () => delay++;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-5">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-30`} />

      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col gap-3">
        <div
          role="status"
          className="flex flex-col items-center gap-1 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-center"
        >
          <p className="flex items-center justify-center gap-2 font-body text-xs font-semibold text-amber-950">
            <Hand className="h-3.5 w-3.5 shrink-0 text-amber-700" aria-hidden />
            Isolar a única conduta que afasta o adolescente
          </p>
        </div>

        {command.map((step) => (
          <StepCard key={step.key} step={step} reduceMotion={reduceMotion} delayIndex={nextDelay()} />
        ))}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-800">
              Manter (condutas certas)
            </p>
            {keep.length > 0 ? (
              keep.map((step) => (
                <StepCard
                  key={step.key}
                  step={step}
                  reduceMotion={reduceMotion}
                  delayIndex={nextDelay()}
                />
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/50 px-3 py-2 font-body text-xs text-emerald-800/80">
                Descarte as letras que acolhem / protegem.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-rose-800">
              Exceção (afasta)
            </p>
            {exception.length > 0 ? (
              exception.map((step) => (
                <StepCard
                  key={step.key}
                  step={step}
                  reduceMotion={reduceMotion}
                  delayIndex={nextDelay()}
                />
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-rose-200 bg-rose-50/50 px-3 py-2 font-body text-xs text-rose-800/80">
                A letra que afasta o adolescente fica aqui.
              </p>
            )}
          </div>
        </div>

        {rest.map((step) => (
          <StepCard key={step.key} step={step} reduceMotion={reduceMotion} delayIndex={nextDelay()} />
        ))}

        {mark.map((step) => (
          <StepCard key={step.key} step={step} reduceMotion={reduceMotion} delayIndex={nextDelay()} />
        ))}

        {transfer.map((step) => (
          <StepCard key={step.key} step={step} reduceMotion={reduceMotion} delayIndex={nextDelay()} />
        ))}

        {footerRule ? (
          <p className="rounded-xl border border-sky-200/70 bg-sky-50/80 px-3 py-2.5 text-center font-body text-sm italic text-sky-900/85">
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}

'use client';

import { useMemo, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, Syringe, Target, XCircle } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import { parsePniExcetoStep } from '@/lib/slides/pniSlideUtils';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import {
  AlertCallout,
  BoardChrome,
  PolarityPanel,
  TwoColumnBoard,
  boardEmptyPlaceholder,
  showBoardAuthoringHints,
  type BoardTone,
} from '../primitives';

interface LogicFlowPniExcetoIsolateBoardProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  /** Ignorado — board é glanceable (0 taps). Aceito para contrato do player. */
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

type ParsedStep = ReturnType<typeof parsePniExcetoStep> & { key: string };

function kindTone(kind: ParsedStep['kind']): BoardTone {
  switch (kind) {
    case 'command':
      return 'command';
    case 'keep':
      return 'keep';
    case 'exception':
      return 'exception';
    case 'mark':
      return 'lime';
    case 'transfer':
      return 'transfer';
    default:
      return 'neutral';
  }
}

function StepBody({ step }: { step: ParsedStep }): ReactNode {
  if (step.kind === 'exception') {
    return (
      <span className="inline-flex items-start gap-2">
        <XCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
        <span>{step.text}</span>
      </span>
    );
  }
  if (step.kind === 'keep' || step.kind === 'mark') {
    return (
      <span className="inline-flex items-start gap-2">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
        <span>{step.text}</span>
      </span>
    );
  }
  if (step.kind === 'command') {
    return (
      <span className="inline-flex items-start gap-2">
        <Target className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
        <span>{step.text}</span>
      </span>
    );
  }
  return step.text;
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
    >
      <PolarityPanel tone={kindTone(step.kind)} emphasized={step.kind === 'exception'}>
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest opacity-80">
          {step.title}
          {step.letter ? ` · ${step.letter}` : ''}
        </p>
        <p className="mt-1.5 font-body text-sm font-semibold leading-snug md:text-base">
          <StepBody step={step} />
        </p>
      </PolarityPanel>
    </motion.div>
  );
}

/**
 * Isola a EXCETO/INCORRETA PNI em uma tela — manter × exceção, sem taps.
 * Skin lime; JSON continua com `steps[]`; o molde só deixa de serializar a revelação.
 */
export function LogicFlowPniExcetoIsolateBoard({
  steps,
  theme,
  footerRule,
}: LogicFlowPniExcetoIsolateBoardProps) {
  const reduceMotion = useReducedMotion();
  const normalized = useMemo(() => normalizeLogicFlowSteps(steps), [steps]);
  const parsed = useMemo(
    () =>
      normalized.map((step, index) => ({
        ...parsePniExcetoStep(step, index),
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
    <BoardChrome theme={theme} footerRule={footerRule}>
      <AlertCallout tone="warn" icon={Syringe}>
        Isolar a única conduta que foge do PNI / calendário
      </AlertCallout>

      {command.map((step) => (
        <StepCard key={step.key} step={step} reduceMotion={reduceMotion} delayIndex={nextDelay()} />
      ))}

      <TwoColumnBoard
        leftTitle="Manter (esquema / conduta certa)"
        rightTitle="Exceção (foge do PNI)"
        leftTone="keep"
        rightTone="exception"
        left={
          keep.length > 0 ? (
            keep.map((step) => (
              <StepCard
                key={step.key}
                step={step}
                reduceMotion={reduceMotion}
                delayIndex={nextDelay()}
              />
            ))
          ) : showBoardAuthoringHints() ? (
            <p className={boardEmptyPlaceholder('keep')}>
              Descarte as letras alinhadas ao calendário / manual MS.
            </p>
          ) : null
        }
        right={
          exception.length > 0 ? (
            exception.map((step) => (
              <StepCard
                key={step.key}
                step={step}
                reduceMotion={reduceMotion}
                delayIndex={nextDelay()}
              />
            ))
          ) : showBoardAuthoringHints() ? (
            <p className={boardEmptyPlaceholder('exception')}>
              A letra que foge do PNI fica aqui.
            </p>
          ) : null
        }
      />

      {rest.map((step) => (
        <StepCard key={step.key} step={step} reduceMotion={reduceMotion} delayIndex={nextDelay()} />
      ))}

      {mark.map((step) => (
        <StepCard key={step.key} step={step} reduceMotion={reduceMotion} delayIndex={nextDelay()} />
      ))}

      {transfer.map((step) => (
        <StepCard key={step.key} step={step} reduceMotion={reduceMotion} delayIndex={nextDelay()} />
      ))}
    </BoardChrome>
  );
}

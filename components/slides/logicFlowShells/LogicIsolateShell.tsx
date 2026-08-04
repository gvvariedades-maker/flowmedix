'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, Target, XCircle } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import type { LogicFlowRevealMode } from '../variants/logicFlowReveal';
import {
  AlertCallout,
  BoardChrome,
  PolarityPanel,
  type BoardTone,
} from '../primitives';

export interface LogicIsolateShellProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  /** Ignorado — board glanceable (0 taps). Aceito para contrato do player. */
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
  eyebrow?: string;
  title?: string;
}

type StepKind = 'command' | 'keep' | 'exception' | 'mark' | 'neutral';

function classifyStep(step: string): StepKind {
  const lower = step.toLowerCase();
  if (/exceto|incorreta|n[aã]o\s+[eé]|errada|exce[cç][aã]o|n[aã]o fazer|proibido/.test(lower)) {
    return 'exception';
  }
  if (/gabarito|marcar|letra\s*[a-e]\b|resposta/.test(lower)) return 'mark';
  if (/comando|enunciado|ler o|identificar o pedido|quest[aã]o pede/.test(lower)) {
    return 'command';
  }
  if (/correta|deve|fazer|manter|conduta adequada|verdadeira/.test(lower)) return 'keep';
  return 'neutral';
}

function kindTone(kind: StepKind): BoardTone {
  switch (kind) {
    case 'command':
      return 'command';
    case 'keep':
      return 'keep';
    case 'exception':
      return 'exception';
    case 'mark':
      return 'command';
    default:
      return 'neutral';
  }
}

/**
 * Shell premium — board glanceable (0 taps) para EXCETO / INCORRETA.
 * Domínio-específico (Adolescente / PNI) continua nos boards bespoke;
 * este shell cobre cauda genérica e migração de *-exceto-tap-flow.
 */
export function LogicIsolateShell({
  steps,
  theme,
  footerRule,
  eyebrow = 'Isolar a exceção',
  title = 'O que a prova pede × o que sobra',
}: LogicIsolateShellProps) {
  const reduceMotion = useReducedMotion();
  const normalized = useMemo(() => normalizeLogicFlowSteps(steps), [steps]);

  const parsed = useMemo(
    () =>
      normalized.map((text, index) => ({
        key: `s-${index}`,
        text,
        kind: classifyStep(text),
      })),
    [normalized],
  );

  if (parsed.length === 0) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <p className="font-body text-slate-400">Nenhum passo definido</p>
      </div>
    );
  }

  const exception = parsed.find((p) => p.kind === 'exception');
  const command = parsed.find((p) => p.kind === 'command');

  return (
    <BoardChrome theme={theme} eyebrow={eyebrow} title={title} footerRule={footerRule} maxWidth="lg">
      <div className="flex flex-col gap-3">
          {command ? (
            <AlertCallout tone="info" icon={Target}>
              {command.text}
            </AlertCallout>
          ) : null}

          {parsed
            .filter((p) => p.kind !== 'command')
            .map((step, i) => (
              <motion.div
                key={step.key}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : i * 0.05 }}
              >
                <PolarityPanel
                  tone={kindTone(step.kind)}
                  emphasized={step.kind === 'exception'}
                >
                  <span className="inline-flex items-start gap-2 font-body text-sm leading-relaxed text-slate-800">
                    {step.kind === 'exception' ? (
                      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" aria-hidden />
                    ) : step.kind === 'keep' || step.kind === 'mark' ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
                    ) : null}
                    <span>{step.text}</span>
                  </span>
                </PolarityPanel>
              </motion.div>
            ))}

          {exception ? (
            <p className="text-center font-mono text-[10px] font-bold uppercase tracking-wide text-rose-700">
              Exceção isolada — 0 taps
            </p>
          ) : null}
      </div>
    </BoardChrome>
  );
}

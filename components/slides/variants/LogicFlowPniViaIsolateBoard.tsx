'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, Syringe, Target, XCircle } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { AlertCallout, BoardChrome, CategoryStrip, PolarityPanel } from '../primitives';

interface LogicFlowPniViaIsolateBoardProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  /** Ignorado — Glance OS 0 taps. */
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

type Kind = 'scenario' | 'eliminate' | 'mark' | 'transfer' | 'neutral';

function classify(step: string, index: number, total: number): Kind {
  const lower = step.toLowerCase();
  // Marcar vence transferência quando o mesmo step junta gabarito + similares
  if (/^marcar\s+[a-e]|marcar\s+[a-e]\b/i.test(step.trim()) || /\bmarcar\s+[a-e]\b/i.test(lower)) {
    return 'mark';
  }
  if (/^em similares|transfer/i.test(lower)) return 'transfer';
  if (/eliminar|→\s*(bcg|penta|vip|nunca|id|im|ev)/i.test(lower) || /letra\s*[bcd]/i.test(lower)) {
    return 'eliminate';
  }
  if (index === 0) return 'scenario';
  if (index === total - 1 && /similares|transfer|decore/i.test(lower)) return 'transfer';
  return 'neutral';
}

/**
 * Funil via/técnica PNI — board Glance OS (0 taps).
 * JSON mantém reveal_mode tap + ≥3 steps; o molde não serializa cliques.
 */
export function LogicFlowPniViaIsolateBoard({
  steps,
  theme,
  footerRule,
}: LogicFlowPniViaIsolateBoardProps) {
  const reduceMotion = useReducedMotion();
  const normalized = useMemo(() => normalizeLogicFlowSteps(steps), [steps]);

  const { scenario, eliminate, mark, transfer, rest } = useMemo(() => {
    const parsed = normalized.map((text, index) => ({
      key: `via-${index}`,
      text,
      kind: classify(text, index, normalized.length),
    }));
    return {
      scenario: parsed.find((p) => p.kind === 'scenario'),
      eliminate: parsed.filter((p) => p.kind === 'eliminate'),
      mark: parsed.find((p) => p.kind === 'mark'),
      transfer: parsed.find((p) => p.kind === 'transfer'),
      rest: parsed.filter((p) => p.kind === 'neutral'),
    };
  }, [normalized]);

  if (normalized.length === 0) return null;

  const footer =
    footerRule?.trim() ||
    transfer?.text ||
    'Decore a via por vacina — SCR ≠ IM';

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.35}
      eyebrow="Trilho até a via"
      title="SCR — via correta"
      titleClassName="normal-case tracking-normal font-body text-base font-bold text-slate-900 md:text-lg"
      footerLabel="Transferência"
      footerRule={footer}
      maxWidth="3xl"
      className="gap-3"
    >
      {scenario ? (
        <AlertCallout tone="info">
          <span className="inline-flex items-start gap-2">
            <Target className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{scenario.text}</span>
          </span>
        </AlertCallout>
      ) : null}

      {eliminate.length > 0 ? (
        <div className="space-y-2">
          <CategoryStrip label="Eliminar distratores" tone="exception" />
          {eliminate.map((row, i) => (
            <motion.div
              key={row.key}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : i * 0.04 }}
            >
              <PolarityPanel tone="exception">
                <div className="flex items-start gap-2">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-700" aria-hidden />
                  <p className="font-body text-sm font-semibold leading-snug text-rose-950 md:text-base">
                    {row.text}
                  </p>
                </div>
              </PolarityPanel>
            </motion.div>
          ))}
        </div>
      ) : null}

      {rest.map((row, i) => (
        <PolarityPanel key={row.key} tone="neutral">
          <p className="font-body text-sm font-semibold leading-snug text-slate-800 md:text-base">
            {row.text}
          </p>
        </PolarityPanel>
      ))}

      {mark ? (
        <PolarityPanel tone="lime" emphasized>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-lime-800" aria-hidden />
            <div>
              <CategoryStrip label="Gabarito" tone="ok" className="mb-1 self-start" />
              <p className="font-body text-sm font-bold leading-snug text-lime-950 md:text-base">
                {mark.text}
              </p>
            </div>
          </div>
        </PolarityPanel>
      ) : null}

      {!mark && !eliminate.length ? (
        <div className="flex items-center gap-2 rounded-2xl border border-lime-200 bg-lime-50 px-4 py-3">
          <Syringe className="h-5 w-5 text-lime-800" aria-hidden />
          <p className="font-body text-sm font-semibold text-lime-950">
            Funil: cenário → eliminar vias erradas → marcar subcutânea
          </p>
        </div>
      ) : null}
    </BoardChrome>
  );
}

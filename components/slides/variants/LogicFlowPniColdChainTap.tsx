'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import {
  isPniVfColdChainCorpus,
  parsePniColdChainStep,
  pniTempLabel,
} from '@/lib/slides/pniSlideUtils';
import {
  LetterEliminationRail,
  letterEliminationFromSteps,
} from '../logicFlowShells';
import { LogicFlowPniVfJuggleTap } from './LogicFlowPniVfJuggleTap';
import {
  AlertCallout,
  BoardChrome,
  CategoryStrip,
  CriticalNumber,
  PolarityPanel,
} from '../primitives';

interface LogicFlowPniColdChainTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  footerRule?: string;
}

/**
 * Rede de frio PNI Glance OS:
 * - V/F → board V/F (0 taps)
 * - MCQ temperatura → board letra + tiles (0 taps)
 */
export function LogicFlowPniColdChainTap({
  steps,
  theme,
  footerRule,
}: LogicFlowPniColdChainTapProps) {
  const reduceMotion = useReducedMotion();
  const normalized = useMemo(() => normalizeLogicFlowSteps(steps), [steps]);
  const vfMode = useMemo(() => isPniVfColdChainCorpus(normalized.join(' ')), [normalized]);
  const parsed = useMemo(
    () => normalized.map((step, index) => parsePniColdChainStep(step, index)),
    [normalized],
  );

  if (vfMode) {
    return (
      <LogicFlowPniVfJuggleTap
        steps={steps}
        theme={theme}
        footerRule={footerRule}
        accentVariant="pni"
        chipLabel="BOARD V/F — CADEIA DE FRIO"
      />
    );
  }

  const eliminateSteps = parsed.filter((s) => s.kind === 'eliminate');
  const locateStep = parsed.find((s) => s.kind === 'locate');
  const tempAnchor = parsed.find((s) => s.kind === 'temp_anchor');
  const fixationStep = parsed.find((s) => s.kind === 'fixation' || /em similares/i.test(s.text));
  const winnerLetter = locateStep?.letter?.toUpperCase() ?? null;
  const { eliminated } = letterEliminationFromSteps(parsed, parsed.length, true);
  const focusMarkers =
    tempAnchor?.markers?.length
      ? tempAnchor.markers
      : locateStep?.markers?.length
        ? locateStep.markers
        : [2, 8];

  if (normalized.length === 0) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <p className="font-body text-slate-400">Nenhum passo definido</p>
      </div>
    );
  }

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.35}
      eyebrow="BOARD — REDE DE FRIO"
      footerRule={footerRule}
      footerLabel={footerRule ? 'TRANSFERÊNCIA' : undefined}
      maxWidth="3xl"
      className="gap-2.5"
    >
      <PolarityPanel tone="keep" emphasized>
        <div className="flex items-center gap-3">
          {winnerLetter ? (
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-600 font-body text-3xl font-black text-white shadow-lg ring-2 ring-teal-300/70"
              aria-label={`Gabarito letra ${winnerLetter}`}
            >
              {winnerLetter}
            </div>
          ) : (
            <CriticalNumber
              value="2–8"
              unit="°C"
              label="PNI"
              emphasis="ok"
              className="min-w-[5rem] px-2.5 py-2"
            />
          )}
          <div className="min-w-0 flex-1">
            <CategoryStrip label="Faixa térmica" tone="keep" />
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {focusMarkers.slice(0, 4).map((m) => (
                <span
                  key={m}
                  className="rounded-md bg-teal-500 px-2 py-0.5 font-mono text-xs font-black text-white"
                >
                  {pniTempLabel(m)}°C
                </span>
              ))}
              {[...eliminated].map((letter) => (
                <span
                  key={letter}
                  className="rounded-md bg-rose-200 px-2 py-0.5 font-mono text-xs font-black text-rose-800 line-through"
                >
                  {letter}
                </span>
              ))}
            </div>
            <p className="mt-1.5 font-body text-sm font-semibold leading-snug text-slate-800">
              {locateStep
                ? locateStep.text.replace(/^Marcar\s+[A-E]\s*[—–:]?\s*/i, '')
                : (tempAnchor?.text ?? 'Temperatura positiva de conservação: 2 °C a 8 °C.')}
            </p>
          </div>
        </div>
      </PolarityPanel>

      <LetterEliminationRail
        eliminated={eliminated}
        winnerLetter={winnerLetter}
        isComplete
        className="justify-center"
      />

      {eliminateSteps.length > 0 ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {eliminateSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : index * 0.03 }}
            >
              <PolarityPanel tone="exception" className="!gap-1.5">
                <div className="flex items-center gap-2">
                  {step.letter ? (
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 font-body text-sm font-black text-white line-through">
                      {step.letter.toUpperCase()}
                    </span>
                  ) : (
                    <X className="h-4 w-4 text-rose-600" strokeWidth={3} aria-hidden />
                  )}
                  <p className="font-body text-sm font-semibold leading-snug text-rose-900">
                    {step.text
                      .replace(/^Eliminar\s+[A-E]:\s*/i, '')
                      .replace(/\s*→\s*eliminar\.?$/i, '')}
                  </p>
                </div>
              </PolarityPanel>
            </motion.div>
          ))}
        </div>
      ) : null}

      {fixationStep ? (
        <AlertCallout tone="transfer" className="!py-2">
          <span className="flex items-start gap-1.5 text-left text-xs md:text-sm">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={3} aria-hidden />
            <span>{fixationStep.text.replace(/^Em similares:\s*/i, '')}</span>
          </span>
        </AlertCallout>
      ) : null}
    </BoardChrome>
  );
}

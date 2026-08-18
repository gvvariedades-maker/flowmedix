'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import { parsePniVfStep, type ParsedPniVfStep } from '@/lib/slides/pniSlideUtils';
import { cn } from '@/lib/utils';
import {
  AlertCallout,
  BoardChrome,
  CategoryStrip,
  PolarityPanel,
  boardTone,
  type BoardTone,
} from '../primitives';

export type VfJuggleAccent =
  | 'pni'
  | 'ist'
  | 'via'
  | 'farmaco'
  | 'trabalho'
  | 'respiratorio'
  | 'cam'
  | 'biosseg'
  | 'seguranca'
  | 'peri';

const STRATEGY_CHIP_LABEL: Record<VfJuggleAccent, string> = {
  pni: 'BOARD V/F PNI',
  ist: 'BOARD V/F IST',
  via: 'BOARD V/F VIAS',
  farmaco: 'BOARD V/F FARMACO',
  trabalho: 'BOARD V/F NR-32',
  respiratorio: 'BOARD V/F ASMA/DPOC',
  cam: 'BOARD V/F MEDICAÇÃO',
  biosseg: 'BOARD V/F IRAS',
  seguranca: 'BOARD V/F NSP',
  peri: 'BOARD V/F PERI',
};

function vfAccentTone(accent: VfJuggleAccent): BoardTone {
  switch (accent) {
    case 'pni':
    case 'biosseg':
      return 'lime';
    case 'via':
    case 'cam':
    case 'respiratorio':
      return 'teal';
    case 'farmaco':
    case 'peri':
    case 'ist':
      return 'rights';
    case 'trabalho':
    case 'seguranca':
      return 'warn';
    default:
      return 'command';
  }
}

function extractAnswerLetter(text: string): string | null {
  const match =
    text.match(/\bletra\s+([A-E])\b/i) ??
    text.match(/\bmarcar\s+([A-E])\b/i) ??
    text.match(/→\s*letra\s+([A-E])\b/i) ??
    text.match(/combina[cç][aã]o\s*→\s*letra\s+([A-E])\b/i);
  return match?.[1]?.toUpperCase() ?? null;
}

function shortQuestion(step: ParsedPniVfStep): string {
  const raw = (step.question || step.text).replace(/^[IVX]+\s*[—–-]\s*/i, '');
  const cut = raw.split(/→/)[0]?.trim() ?? raw;
  return cut.length > 72 ? `${cut.slice(0, 70)}…` : cut;
}

interface LogicFlowPniVfJuggleTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  footerRule?: string;
  accentVariant?: VfJuggleAccent;
  chipLabel?: string;
}

/**
 * Hub V/F Glance OS — herói = letra; tiles V/F compactos; 0 taps.
 */
export function LogicFlowPniVfJuggleTap({
  steps,
  theme,
  footerRule,
  accentVariant = 'pni',
  chipLabel: chipLabelOverride,
}: LogicFlowPniVfJuggleTapProps) {
  const tone = vfAccentTone(accentVariant);
  const toneClasses = boardTone(tone);
  const reduceMotion = useReducedMotion();
  const normalizedSteps = useMemo(() => normalizeLogicFlowSteps(steps), [steps]);
  const parsedSteps = useMemo(
    () => normalizedSteps.map((step, index) => parsePniVfStep(step, index)),
    [normalizedSteps],
  );

  const judgementSteps = parsedSteps.filter((s) => s.kind === 'judgement' && s.judgement);
  const combineStep = parsedSteps.find((s) => s.kind === 'combine');
  const locateStep = parsedSteps.find((s) => s.kind === 'locate');
  const eliminateStep = parsedSteps.find((s) => s.kind === 'eliminate');
  const fixationStep = parsedSteps.find((s) => s.kind === 'fixation' || /em similares/i.test(s.text));

  const letter =
    (locateStep ? extractAnswerLetter(locateStep.text) : null) ??
    (combineStep ? extractAnswerLetter(combineStep.text) : null) ??
    parsedSteps.map((s) => extractAnswerLetter(s.text)).find(Boolean) ??
    null;

  const trueRomans = judgementSteps.filter((s) => s.judgement === 'true' && s.roman).map((s) => s.roman!);
  const falseRomans = judgementSteps.filter((s) => s.judgement === 'false' && s.roman).map((s) => s.roman!);

  const chipLabel = chipLabelOverride?.trim() || STRATEGY_CHIP_LABEL[accentVariant];

  if (normalizedSteps.length === 0) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <p className="font-body text-slate-400">Nenhum passo definido</p>
      </div>
    );
  }

  if (judgementSteps.length >= 2) {
    return (
      <BoardChrome
        theme={theme}
        washOpacity={0.35}
        eyebrow={chipLabel}
        footerRule={footerRule}
        footerLabel={footerRule ? 'TRANSFERÊNCIA' : undefined}
        maxWidth="xl"
        className="gap-2.5"
      >
        {/* Herói: letra + conjunto */}
        <PolarityPanel tone="keep" emphasized>
          <div className="flex items-center gap-3">
            {letter ? (
              <div
                className={cn(
                  'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-body text-3xl font-black text-white shadow-lg',
                  toneClasses.badge,
                )}
                aria-label={`Gabarito letra ${letter}`}
              >
                {letter}
              </div>
            ) : null}
            <div className="min-w-0 flex-1">
              <CategoryStrip label="Conjunto verdadeiro" tone="keep" />
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {trueRomans.map((r) => (
                  <span
                    key={r}
                    className="rounded-md bg-emerald-600 px-2 py-0.5 font-mono text-xs font-black text-white"
                  >
                    {r}
                  </span>
                ))}
                {falseRomans.map((r) => (
                  <span
                    key={r}
                    className="rounded-md bg-rose-200 px-2 py-0.5 font-mono text-xs font-black text-rose-800 line-through"
                  >
                    {r}
                  </span>
                ))}
              </div>
              {combineStep ? (
                <p className="mt-1 font-body text-xs font-semibold text-slate-700 line-clamp-2">
                  {combineStep.text}
                </p>
              ) : null}
            </div>
          </div>
        </PolarityPanel>

        <div
          className={cn(
            'grid gap-2',
            judgementSteps.length <= 2
              ? 'grid-cols-2'
              : judgementSteps.length === 3
                ? 'grid-cols-3'
                : 'grid-cols-2 sm:grid-cols-4',
          )}
        >
          {judgementSteps.map((step, i) => (
            <JudgementTile key={step.roman ?? i} step={step} index={i} reduceMotion={!!reduceMotion} />
          ))}
        </div>

        {eliminateStep ? (
          <AlertCallout tone="warn" className="!py-2">
            <span className="line-clamp-2 text-left text-xs md:text-sm">
              <span className="font-mono text-[10px] uppercase tracking-widest opacity-80">Eliminar · </span>
              {eliminateStep.text.replace(/^Eliminar\s*/i, '')}
            </span>
          </AlertCallout>
        ) : null}

        {fixationStep ? (
          <AlertCallout tone="transfer" className="!py-2">
            <span className="line-clamp-2 text-left text-xs md:text-sm">
              {fixationStep.text.replace(/^Em similares:\s*/i, '')}
            </span>
          </AlertCallout>
        ) : null}
      </BoardChrome>
    );
  }

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.35}
      eyebrow={chipLabel}
      footerRule={footerRule}
      footerLabel={footerRule ? 'TRANSFERÊNCIA' : undefined}
      maxWidth="xl"
    >
      <div className="flex flex-col gap-2">
        {parsedSteps.map((step, i) => (
          <motion.div
            key={i}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : i * 0.03 }}
          >
            <PolarityPanel tone={tone}>
              <CategoryStrip label={step.title} tone={tone} />
              <p className={cn('mt-2 font-body text-sm font-semibold leading-snug', toneClasses.text)}>
                {step.text}
              </p>
            </PolarityPanel>
          </motion.div>
        ))}
      </div>
    </BoardChrome>
  );
}

function JudgementTile({
  step,
  index,
  reduceMotion,
}: {
  step: ParsedPniVfStep;
  index: number;
  reduceMotion: boolean;
}) {
  const isTrue = step.judgement === 'true';
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : index * 0.03 }}
    >
      <PolarityPanel
        tone={isTrue ? 'keep' : 'exception'}
        emphasized={!isTrue}
        className="!p-2.5 md:!p-3"
      >
        <div className="flex items-center justify-between gap-1">
          <span className="font-mono text-sm font-black text-slate-800">
            {step.roman ?? `N${index + 1}`}
          </span>
          {isTrue ? (
            <Check className="h-4 w-4 text-emerald-700" strokeWidth={3} aria-hidden />
          ) : (
            <X className="h-4 w-4 text-rose-700" strokeWidth={3} aria-hidden />
          )}
        </div>
        <p
          className={cn(
            'mt-0.5 text-center font-body text-xl font-black',
            isTrue ? 'text-emerald-800' : 'text-rose-800',
          )}
        >
          {isTrue ? 'V' : 'F'}
        </p>
        <p className="mt-0.5 line-clamp-2 text-center font-body text-[10px] leading-snug text-slate-600">
          {shortQuestion(step)}
        </p>
      </PolarityPanel>
    </motion.div>
  );
}

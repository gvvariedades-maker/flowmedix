'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import {
  isPniCatchUpCorpus,
  parsePniCalendarStep,
  pniMonthLabel,
  type ParsedPniCalendarStep,
} from '@/lib/slides/pniSlideUtils';
import {
  AlertCallout,
  BoardChrome,
  CategoryStrip,
  CriticalNumber,
  PolarityPanel,
} from '../primitives';
import { cn } from '@/lib/utils';

interface LogicFlowPniCalendarEliminationTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  footerRule?: string;
}

function shortEliminateText(text: string, compact: boolean): string {
  const cleaned = text
    .replace(/^Testar\s+[A-E]\s*[—–-]\s*/i, '')
    .replace(/\s*→\s*eliminar\.?$/i, '')
    .trim();
  const max = compact ? 72 : 90;
  return cleaned.length > max ? `${cleaned.slice(0, max - 1)}…` : cleaned;
}

function EliminateTile({
  step,
  index,
  reduceMotion,
  compact,
}: {
  step: ParsedPniCalendarStep;
  index: number;
  reduceMotion: boolean;
  compact: boolean;
}) {
  const letter = step.letter?.toUpperCase();
  const months = step.months ?? [];

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : index * 0.03 }}
    >
      <PolarityPanel tone="exception" className={cn('h-full', compact && '!gap-1.5 !py-2.5')}>
        <div className="flex items-center gap-2.5">
          {letter ? (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-600 font-body text-lg font-black text-white line-through decoration-2 shadow-sm">
              {letter}
            </span>
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <X className="h-4 w-4" strokeWidth={3} aria-hidden />
            </span>
          )}
          <p className="min-w-0 flex-1 font-body text-sm font-semibold leading-snug text-rose-900">
            {shortEliminateText(step.text, compact)}
          </p>
          {!compact && months.length > 0 ? (
            <div className="flex shrink-0 flex-wrap justify-end gap-1">
              {months.slice(0, 3).map((m) => (
                <span
                  key={m}
                  className="rounded-md bg-sky-100 px-1.5 py-0.5 font-mono text-[9px] font-black text-sky-900 ring-1 ring-sky-200"
                >
                  {pniMonthLabel(m)}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </PolarityPanel>
    </motion.div>
  );
}

/**
 * Calendário PNI Glance OS — board 0 taps: herói (letra + mês) + tiles de eliminação.
 * Catch-up: âncora fundida no herói; lista vertical compacta.
 */
export function LogicFlowPniCalendarEliminationTap({
  steps,
  theme,
  footerRule,
}: LogicFlowPniCalendarEliminationTapProps) {
  const reduceMotion = useReducedMotion();
  const normalized = useMemo(() => normalizeLogicFlowSteps(steps), [steps]);
  const parsed = useMemo(
    () => normalized.map((step, index) => parsePniCalendarStep(step, index)),
    [normalized],
  );
  const catchUpMode = useMemo(
    () => isPniCatchUpCorpus(normalized.join(' ')),
    [normalized],
  );

  const anchorStep = parsed.find((s) => s.kind === 'anchor_age');
  const eliminateSteps = parsed.filter(
    (s) => s.kind === 'eliminate' || s.kind === 'catchup_eliminate',
  );
  const locateStep = parsed.find((s) => s.kind === 'locate');
  const fixationStep = parsed.find((s) => s.kind === 'fixation' || /em similares/i.test(s.text));
  const scenarioStep = parsed.find((s) => s.kind === 'scenario');
  const retrieveStep = parsed.find(
    (s) =>
      s.kind === 'step' &&
      /recuperar|men c|calendário|abrir|tratar como esquema/i.test(s.text) &&
      s !== anchorStep,
  );

  const winnerLetter = locateStep?.letter?.toUpperCase() ?? null;
  const focusMonths =
    (locateStep?.months && locateStep.months.length > 0
      ? locateStep.months
      : anchorStep?.months && anchorStep.months.length > 0
        ? anchorStep.months
        : catchUpMode
          ? []
          : [3]) ?? [];
  const focusMonth = focusMonths[0];

  const heroBody = catchUpMode
    ? (locateStep?.text.replace(/^Marcar\s+[A-E]\s*[—–-]?\s*/i, '') ??
      retrieveStep?.text ??
      'Vacinar pela faixa etária — cartão substituto no mesmo atendimento.')
    : locateStep
      ? locateStep.text.replace(/^Marcar\s+[A-E]\s*[—–-]?\s*/i, '')
      : (anchorStep?.text ?? 'Cruzar idade do enunciado com a linha do PNI.');

  const showSeparateAnchor =
    !catchUpMode && Boolean(scenarioStep || retrieveStep || anchorStep);

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
      eyebrow={catchUpMode ? 'BOARD — CATCH-UP PNI' : 'BOARD — CALENDÁRIO PNI'}
      footerRule={footerRule}
      footerLabel={footerRule ? 'TRANSFERÊNCIA' : undefined}
      maxWidth="3xl"
      className="gap-2.5"
    >
      <PolarityPanel tone="keep" emphasized>
        <div className="flex items-start gap-3">
          {winnerLetter ? (
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 font-body text-3xl font-black text-white shadow-lg ring-2 ring-emerald-300/70"
              aria-label={`Gabarito letra ${winnerLetter}`}
            >
              {winnerLetter}
            </div>
          ) : focusMonth != null ? (
            <CriticalNumber
              value={String(focusMonth === 0 ? 0 : focusMonth)}
              unit={focusMonth === 0 ? undefined : 'M'}
              label="FOCO"
              emphasis="alert"
              className="min-w-[4.25rem] shrink-0 px-2.5 py-2"
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <CategoryStrip label={catchUpMode ? 'Conduta catch-up' : 'Marco × vacina'} tone="keep" />
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {focusMonth != null ? (
                <span className="rounded-md bg-lime-500 px-2 py-0.5 font-mono text-xs font-black text-white">
                  {pniMonthLabel(focusMonth)}
                </span>
              ) : catchUpMode ? (
                <span className="rounded-md bg-lime-500 px-2 py-0.5 font-mono text-[10px] font-black uppercase text-white">
                  Sem cartão
                </span>
              ) : null}
              {eliminateSteps.map((s) =>
                s.letter ? (
                  <span
                    key={s.letter}
                    className="rounded-md bg-rose-200 px-2 py-0.5 font-mono text-xs font-black text-rose-800 line-through"
                  >
                    {s.letter.toUpperCase()}
                  </span>
                ) : null,
              )}
            </div>
            <p className="mt-1.5 font-body text-sm font-semibold leading-snug text-slate-800 md:text-[15px]">
              {heroBody}
            </p>
            {catchUpMode && scenarioStep ? (
              <p className="mt-1 font-body text-xs leading-snug text-slate-600">
                {scenarioStep.text.replace(/^Cenário:\s*/i, '')}
              </p>
            ) : null}
          </div>
          {winnerLetter && focusMonth != null ? (
            <CriticalNumber
              value={String(focusMonth === 0 ? 0 : focusMonth)}
              unit={focusMonth === 0 ? undefined : 'M'}
              label="PNI"
              emphasis="alert"
              className="hidden min-w-[4rem] shrink-0 px-2 py-2 sm:flex"
            />
          ) : null}
        </div>
      </PolarityPanel>

      {showSeparateAnchor ? (
        <AlertCallout tone="command" className="!py-2">
          <span className="line-clamp-2 text-left text-xs md:text-sm">
            <span className="font-mono text-[10px] uppercase tracking-widest opacity-80">
              Âncora ·{' '}
            </span>
            {(scenarioStep ?? retrieveStep ?? anchorStep)!.text}
          </span>
        </AlertCallout>
      ) : null}

      {eliminateSteps.length > 0 ? (
        <div className={cn('grid gap-2', catchUpMode ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2')}>
          {eliminateSteps.map((step, index) => (
            <EliminateTile
              key={`${step.letter ?? index}-${index}`}
              step={step}
              index={index}
              reduceMotion={!!reduceMotion}
              compact={catchUpMode}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {parsed.map((step, i) => (
            <PolarityPanel key={i} tone="command">
              <CategoryStrip label={step.title} tone="command" />
              <p className="mt-2 font-body text-sm font-semibold leading-snug text-slate-800">
                {step.text}
              </p>
            </PolarityPanel>
          ))}
        </div>
      )}

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

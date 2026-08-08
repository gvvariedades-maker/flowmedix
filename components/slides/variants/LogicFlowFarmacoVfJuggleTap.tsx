'use client';

import { useMemo, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  AlertTriangle,
  Check,
  Compass,
  Filter,
  Pill,
  Scale,
  Target,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import { parsePniVfStep, type ParsedPniVfStep } from '@/lib/slides/pniSlideUtils';
import { BoardChrome } from '../primitives';
import { cn } from '@/lib/utils';

interface LogicFlowFarmacoVfJuggleTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  footerRule?: string;
}

type SectionTone = 'violet' | 'green' | 'orange' | 'red';

const SECTION: Record<
  SectionTone,
  { box: string; pill: string; ink: string }
> = {
  violet: {
    box: 'border-violet-400 bg-violet-50/90',
    pill: 'bg-violet-600',
    ink: 'text-violet-950',
  },
  green: {
    box: 'border-emerald-400 bg-emerald-50/90',
    pill: 'bg-emerald-600',
    ink: 'text-emerald-950',
  },
  orange: {
    box: 'border-orange-400 bg-orange-50/90',
    pill: 'bg-orange-500',
    ink: 'text-orange-950',
  },
  red: {
    box: 'border-rose-400 bg-rose-50/90',
    pill: 'bg-rose-600',
    ink: 'text-rose-950',
  },
};

function extractAnswerLetter(text: string): string | null {
  const match =
    text.match(/\bletra\s+([A-E])\b/i) ??
    text.match(/\bmarcar\s+([A-E])\b/i) ??
    text.match(/→\s*letra\s+([A-E])\b/i);
  return match?.[1]?.toUpperCase() ?? null;
}

function shortClaim(step: ParsedPniVfStep): string {
  const raw = (step.question || step.text)
    .replace(/^[IVX]+\s*[—–\-:]\s*/i, '')
    .replace(/\s*→\s*(verdadeira|falsa|verdadeiro|falso).*$/i, '')
    .trim();
  return raw.length > 96 ? `${raw.slice(0, 94)}…` : raw;
}

function SectionShell({
  tone,
  title,
  icon: Icon,
  children,
  ariaLabel,
  subtitle,
}: {
  tone: SectionTone;
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  ariaLabel: string;
  subtitle?: string;
}) {
  const s = SECTION[tone];
  return (
    <section
      className={cn('relative rounded-2xl border-[2.5px] p-3 pt-4 shadow-sm md:p-4 md:pt-5', s.box)}
      aria-label={ariaLabel}
    >
      <div
        className={cn(
          'mb-3 inline-flex max-w-full flex-wrap items-center gap-2 rounded-xl px-3 py-1.5 text-white shadow-sm',
          s.pill,
        )}
      >
        <Icon className="h-4 w-4 shrink-0" aria-hidden />
        <span className="font-body text-[11px] font-bold leading-tight md:text-xs">{title}</span>
        {subtitle ? (
          <span className="rounded-md bg-white/20 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide">
            {subtitle}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/**
 * Funil V/F PK/PD — poster estático estilo EBSERH (seções coloridas).
 * Sem tap/reveal. Steps do JSON alimentam V/F, combinação e transferência.
 */
export function LogicFlowFarmacoVfJuggleTap({
  steps,
  theme,
  footerRule,
}: LogicFlowFarmacoVfJuggleTapProps) {
  const reduceMotion = useReducedMotion();

  const {
    judgements,
    trueSetStep,
    letterStep,
    fixationStep,
    letter,
    trueRomans,
    falseRomans,
  } = useMemo(() => {
    const normalized = normalizeLogicFlowSteps(steps);
    const parsed = normalized.map((step, index) => parsePniVfStep(step, index));
    const judgementSteps = parsed.filter((s) => s.kind === 'judgement' && s.judgement);
    const combines = parsed.filter((s) => s.kind === 'combine');
    const trueSet =
      combines.find((s) => /verdadeiras?\s*:/i.test(s.text)) ??
      combines.find((s) => !extractAnswerLetter(s.text)) ??
      combines[0];
    const withLetter =
      parsed.find((s) => extractAnswerLetter(s.text)) ??
      combines.find((s) => /combina/i.test(s.text));
    const fixation =
      parsed.find((s) => s.kind === 'fixation') ??
      parsed.find((s) => /em similares/i.test(s.text));
    const answer =
      (withLetter ? extractAnswerLetter(withLetter.text) : null) ??
      parsed.map((s) => extractAnswerLetter(s.text)).find(Boolean) ??
      null;

    return {
      judgements: judgementSteps,
      trueSetStep: trueSet,
      letterStep: withLetter,
      fixationStep: fixation,
      letter: answer,
      trueRomans: judgementSteps
        .filter((s) => s.judgement === 'true' && s.roman)
        .map((s) => s.roman!),
      falseRomans: judgementSteps
        .filter((s) => s.judgement === 'false' && s.roman)
        .map((s) => s.roman!),
    };
  }, [steps]);

  if (judgements.length === 0 && !trueSetStep && !letterStep) {
    return (
      <BoardChrome theme={theme} washOpacity={0.1} maxWidth="2xl" footerRule={footerRule}>
        <p className="text-center font-body text-sm text-slate-500">Nenhum passo V/F definido</p>
      </BoardChrome>
    );
  }

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.1}
      maxWidth="2xl"
      footerLabel="Transferência de prova"
      footerRule={footerRule}
    >
      {/* 1) Header azul — modelo EBSERH */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 rounded-2xl bg-[#2563eb] px-4 py-3 shadow-md"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
          <Pill className="h-5 w-5 text-white" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-blue-100">
            Board V/F · Farmaco
          </p>
          <p className="font-display text-sm font-black uppercase leading-snug tracking-wide text-white md:text-base">
            Funil I → II → III
          </p>
        </div>
      </motion.div>

      {/* 2) Roxo — julgue cada afirmativa (tudo aberto) */}
      {judgements.length > 0 ? (
        <SectionShell
          tone="violet"
          title="Essência — julgue cada afirmativa"
          icon={Scale}
          ariaLabel="Julgamento das afirmativas"
        >
          <ul className="flex flex-col gap-2.5" aria-label="Afirmativas V/F">
            {judgements.map((step, i) => {
              const isTrue = step.judgement === 'true';
              return (
                <motion.li
                  key={step.roman ?? i}
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduceMotion ? 0 : i * 0.03 }}
                  className="flex items-start gap-2.5 rounded-xl bg-white/85 px-2.5 py-2.5 shadow-sm ring-1 ring-violet-200/60"
                >
                  <span
                    className={cn(
                      'flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl text-white shadow-sm',
                      isTrue ? 'bg-emerald-600' : 'bg-rose-600',
                    )}
                  >
                    <span className="font-mono text-[10px] font-bold leading-none opacity-90">
                      {step.roman ?? `N${i + 1}`}
                    </span>
                    <span className="font-display text-base font-black leading-none">
                      {isTrue ? 'V' : 'F'}
                    </span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 font-body text-sm font-bold text-violet-950">
                      {isTrue ? (
                        <Check className="h-4 w-4 shrink-0 text-emerald-600" strokeWidth={3} aria-hidden />
                      ) : (
                        <X className="h-4 w-4 shrink-0 text-rose-600" strokeWidth={3} aria-hidden />
                      )}
                      Afirmativa {step.roman ?? i + 1}
                      <span
                        className={cn(
                          'rounded-md px-1.5 py-0.5 font-mono text-[10px] font-black uppercase',
                          isTrue
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800',
                        )}
                      >
                        {isTrue ? 'Verdadeira' : 'Falsa'}
                      </span>
                    </p>
                    <p className="mt-0.5 font-body text-xs font-medium leading-snug text-slate-700 md:text-sm">
                      {shortClaim(step)}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </SectionShell>
      ) : null}

      {/* 3) Verde — conjunto verdadeiro */}
      <SectionShell
        tone="green"
        title="Conjunto verdadeiro"
        icon={Compass}
        ariaLabel="Conjunto verdadeiro"
        subtitle="Cai em prova!"
      >
        <div className="flex flex-wrap items-center gap-2">
          {trueRomans.map((r) => (
            <span
              key={`keep-${r}`}
              className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 font-mono text-sm font-black text-white shadow-sm"
            >
              <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
              {r}
            </span>
          ))}
          {falseRomans.map((r) => (
            <span
              key={`drop-${r}`}
              className="inline-flex items-center gap-1 rounded-xl bg-rose-100 px-3 py-1.5 font-mono text-sm font-black text-rose-800 line-through ring-1 ring-rose-200"
            >
              <X className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
              {r}
            </span>
          ))}
        </div>
        {trueSetStep ? (
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-white/80 px-3 py-2 font-body text-xs font-bold leading-snug text-emerald-950 md:text-sm">
            <Filter className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
            <span>{trueSetStep.text}</span>
          </p>
        ) : trueRomans.length > 0 ? (
          <p className="mt-3 font-body text-xs font-semibold text-emerald-950 md:text-sm">
            Verdadeiras: {trueRomans.join(' e ')}.
          </p>
        ) : null}
      </SectionShell>

      {/* 4) Laranja — combinação → letra */}
      <SectionShell
        tone="orange"
        title="Combinação → alternativa"
        icon={Target}
        ariaLabel="Combinação e letra"
      >
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
          {letter ? (
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-orange-500 font-display text-3xl font-black text-white shadow-md ring-2 ring-orange-200"
              aria-label={`Gabarito letra ${letter}`}
            >
              {letter}
            </div>
          ) : null}
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="font-body text-sm font-bold text-orange-950">
              {letterStep?.text ?? 'Monte o conjunto verdadeiro e localize a letra.'}
            </p>
          </div>
        </div>
      </SectionShell>

      {/* 5) Vermelho — pegadinha / transferência */}
      {(falseRomans.length > 0 || fixationStep) && (
        <SectionShell
          tone="red"
          title="Pegadinha importante"
          icon={AlertTriangle}
          ariaLabel="Pegadinha e transferência"
        >
          <ul className="flex flex-col gap-2">
            {judgements
              .filter((s) => s.judgement === 'false')
              .map((step, i) => (
                <li
                  key={`false-${step.roman ?? i}`}
                  className="flex items-start gap-2 rounded-xl bg-white/80 px-2.5 py-2"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-600 font-display text-xs font-black text-white">
                    !
                  </span>
                  <p className="font-body text-sm font-bold leading-snug text-rose-950">
                    {step.roman ? `${step.roman}: ` : ''}
                    {shortClaim(step)}
                  </p>
                </li>
              ))}
            {fixationStep ? (
              <li className="flex items-start gap-2 rounded-xl bg-white/80 px-2.5 py-2">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" strokeWidth={3} aria-hidden />
                <p className="font-body text-sm font-semibold leading-snug text-rose-950">
                  {fixationStep.text.replace(/^Em similares:\s*/i, 'Em similares: ')}
                </p>
              </li>
            ) : null}
          </ul>
        </SectionShell>
      )}
    </BoardChrome>
  );
}

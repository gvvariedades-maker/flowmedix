'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Ban,
  Check,
  CheckCircle2,
  Filter,
  Hand,
  Target,
} from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import {
  buildPtCraseFunnelBoard,
  type PtCraseBucket,
  type PtCraseFunnelBoardModel,
  type PtCraseFunnelOption,
} from '@/lib/slides/ptCraseSlideUtils';

const BUCKET_META: Record<
  PtCraseBucket,
  {
    title: string;
    hint: string;
    Icon: typeof Ban;
    accent: string;
    pale: string;
    border: string;
    ring: string;
  }
> = {
  sem_crase: {
    title: 'Sem à',
    hint: 'Só a — funil barra',
    Icon: Ban,
    accent: 'text-rose-800',
    pale: 'bg-rose-50',
    border: 'border-rose-200',
    ring: 'ring-rose-100',
  },
  com_crase: {
    title: 'Com à',
    hint: 'Tem a + a',
    Icon: CheckCircle2,
    accent: 'text-emerald-800',
    pale: 'bg-emerald-50',
    border: 'border-emerald-200',
    ring: 'ring-emerald-100',
  },
};

const BUCKET_ORDER: PtCraseBucket[] = ['sem_crase', 'com_crase'];

const DEFAULT_POCKET_RULE =
  'Verbo pede a? Tem a + a? Só então use à. Não chute porque «parece culto».';

function BucketColumn({
  bucket,
  options,
  selectedLetter,
  answerLetter,
  enabled,
  highlighted,
  onChooseOption,
}: {
  bucket: PtCraseBucket;
  options: PtCraseFunnelOption[];
  selectedLetter: string | null;
  answerLetter: string;
  enabled: boolean;
  highlighted: boolean;
  onChooseOption: (letter: string) => void;
}) {
  const meta = BUCKET_META[bucket];
  const { Icon } = meta;
  const answered = selectedLetter !== null;

  return (
    <div
      className={`flex flex-col rounded-2xl border bg-white/95 p-2.5 shadow-sm transition-all sm:p-3 ${
        highlighted ? `border-amber-500 ring-2 ${meta.ring} shadow-md` : meta.border
      }`}
    >
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${meta.pale}`}>
          <Icon className={`h-4 w-4 ${meta.accent}`} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="font-display text-sm font-black uppercase tracking-wide text-slate-900">
            {meta.title}
          </p>
          {highlighted ? (
            <p className="font-mono text-[9px] font-bold uppercase tracking-wide text-amber-700">
              Coluna certa
            </p>
          ) : (
            <p className="font-body text-[10px] text-slate-500">{meta.hint}</p>
          )}
        </div>
      </div>

      <div className="mt-2 flex flex-1 flex-col gap-1.5">
        {options.length > 0 ? (
          options.map((option) => {
            const selected = selectedLetter === option.letter;
            const correct = option.letter === answerLetter;
            const showCorrect = answered && correct;
            const showWrong = answered && selected && !correct;
            return (
              <button
                key={option.letter}
                type="button"
                disabled={!enabled || answered}
                onClick={() => onChooseOption(option.letter)}
                aria-label={`Alternativa ${option.letter}: ${option.example}`}
                className={`group flex min-h-[56px] items-center gap-2.5 rounded-xl border px-2 py-2 text-left transition-all ${
                  !enabled
                    ? 'cursor-not-allowed border-slate-100 bg-slate-50 opacity-50'
                    : showCorrect
                      ? 'border-emerald-400 bg-emerald-50 ring-2 ring-emerald-100'
                      : showWrong
                        ? 'border-rose-300 bg-rose-50'
                        : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/60'
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-display text-lg font-black shadow-sm ${
                    showCorrect
                      ? 'bg-emerald-500 text-white'
                      : showWrong
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-900 text-white group-hover:bg-amber-700'
                  }`}
                >
                  {showCorrect ? <Check className="h-5 w-5" strokeWidth={3} aria-hidden /> : option.letter}
                </span>
                <p className="min-w-0 flex-1 font-body text-[13px] font-semibold leading-snug text-slate-800 sm:text-sm">
                  {option.example}
                </p>
              </button>
            );
          })
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-3 py-6 text-center">
            <p className="font-body text-xs text-slate-500">Sem alternativa aqui</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FusionQuestion({
  model,
  choice,
  onChoose,
}: {
  model: PtCraseFunnelBoardModel;
  choice: boolean | null;
  onChoose: (hasFusion: boolean) => void;
}) {
  const answered = choice !== null;
  const correct = choice === model.keyHasFusion;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
            <Target className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-700">
              Passo 1 · Funil
            </p>
            <p className="mt-0.5 font-body text-sm font-bold leading-snug text-slate-900 sm:text-base">
              Em <strong className="text-amber-800">«{model.keyExample}»</strong>, tem{' '}
              <strong>a + a</strong>?
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { value: true, label: 'Sim — a + a' },
            { value: false, label: 'Não' },
          ].map((opt) => {
            const selected = choice === opt.value;
            const isCorrect = opt.value === model.keyHasFusion;
            return (
              <button
                key={String(opt.value)}
                type="button"
                disabled={answered}
                onClick={() => onChoose(opt.value)}
                className={`flex min-h-[52px] items-center justify-center rounded-xl border px-3 py-2 font-display text-sm font-black transition-all sm:text-base ${
                  answered && isCorrect
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-100'
                    : selected
                      ? 'border-rose-300 bg-rose-50 text-rose-900'
                      : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-amber-300 hover:bg-amber-50'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {answered ? (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-emerald-50 px-3 py-2 text-center font-body text-sm font-semibold text-emerald-900"
          >
            {correct ? 'Acertou. ' : 'Resposta certa: '}
            Tem <strong>a + a</strong> — por isso nasce <strong>à</strong>.
          </motion.p>
        ) : null}
      </div>
    </div>
  );
}

export function LogicFlowPtCraseFunnelBoard({
  model,
  theme,
  footerRule,
}: {
  model: PtCraseFunnelBoardModel;
  theme: ThemeColors;
  footerRule?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [fusionChoice, setFusionChoice] = useState<boolean | null>(null);
  const [optionChoice, setOptionChoice] = useState<string | null>(null);

  const grouped = useMemo(
    () =>
      Object.fromEntries(
        BUCKET_ORDER.map((bucket) => [
          bucket,
          model.options.filter((option) => option.bucket === bucket),
        ]),
      ) as Record<PtCraseBucket, PtCraseFunnelOption[]>,
    [model.options],
  );

  const pocketRule = useMemo(() => {
    const fromTransfer = model.transferRule?.replace(/^Em similares:\s*/i, '').trim();
    const fromFooter = footerRule?.trim();
    if (fromTransfer) return fromTransfer;
    if (fromFooter) return fromFooter;
    return DEFAULT_POCKET_RULE;
  }, [footerRule, model.transferRule]);

  const chooseFusion = useCallback((hasFusion: boolean) => {
    setFusionChoice(hasFusion);
  }, []);

  const chooseOption = useCallback((letter: string) => {
    setOptionChoice(letter);
  }, []);

  const answeredCorrectly = optionChoice === model.answerLetter;
  const step2Ready = fusionChoice !== null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto bg-amber-50/40 p-3 md:p-4">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-10`}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col gap-3">
        <div className="text-center">
          <div className="inline-flex items-center gap-2">
            <Filter className="h-4 w-4 text-amber-700" aria-hidden />
            <h2 className="font-display text-base font-black uppercase tracking-wide text-slate-900 md:text-lg">
              Sem à · Com à
            </h2>
          </div>
          <p className="mt-1 font-body text-xs text-slate-500">
            Não chute o à — pergunte se tem a + a.
          </p>
          <div className="mx-auto mt-1.5 h-1 w-14 rounded-full bg-amber-400" />
        </div>

        <FusionQuestion model={model} choice={fusionChoice} onChoose={chooseFusion} />

        <div
          className={`rounded-2xl border p-3 transition-all ${
            step2Ready ? 'border-amber-200 bg-white shadow-sm' : 'border-slate-200 bg-slate-100/80'
          }`}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-amber-700">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-[11px] text-white">
                2
              </span>
              Qual passa?
            </span>
            <p className="flex-1 font-body text-sm font-semibold text-slate-800">
              {step2Ready ? (
                <>
                  Qual alternativa fica em <strong className="text-emerald-800">Com à</strong>?
                </>
              ) : (
                'Primeiro responda o Passo 1.'
              )}
            </p>
            {optionChoice ? (
              <motion.span
                initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 font-display text-sm font-black uppercase tracking-wide text-white shadow-sm"
              >
                <CheckCircle2 className="h-5 w-5" aria-hidden />
                Gabarito {model.answerLetter}
              </motion.span>
            ) : step2Ready ? (
              <span className="inline-flex items-center gap-1.5 font-body text-xs font-semibold text-amber-800">
                <Hand className="h-3.5 w-3.5" aria-hidden />
                Toque na letra (A–E)
              </span>
            ) : null}
          </div>
          {optionChoice && !answeredCorrectly ? (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 font-body text-xs font-semibold text-amber-900">
              Você marcou {optionChoice}. Olhe a coluna <strong>Com à</strong> — a resposta certa
              está lá.
            </p>
          ) : null}
          {optionChoice && answeredCorrectly ? (
            <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 font-body text-xs font-semibold text-emerald-900">
              Acertou a letra {model.answerLetter}: única com a + a.
            </p>
          ) : null}
        </div>

        <motion.div
          initial={false}
          animate={{ opacity: step2Ready ? 1 : 0.4 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.25 }}
          className="grid grid-cols-1 gap-2 sm:grid-cols-2"
          aria-disabled={!step2Ready}
        >
          {BUCKET_ORDER.map((bucket) => (
            <BucketColumn
              key={bucket}
              bucket={bucket}
              options={grouped[bucket]}
              selectedLetter={optionChoice}
              answerLetter={model.answerLetter}
              enabled={step2Ready}
              highlighted={step2Ready && bucket === 'com_crase'}
              onChooseOption={chooseOption}
            />
          ))}
        </motion.div>

        <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-center">
          <p className="font-body text-sm font-semibold text-amber-950">
            <span className="font-black uppercase text-amber-800">Leve isto — </span>
            {pocketRule}
          </p>
        </div>
      </div>
    </div>
  );
}

export function resolvePtCraseFunnelBoard(steps: string[]) {
  return buildPtCraseFunnelBoard(steps);
}

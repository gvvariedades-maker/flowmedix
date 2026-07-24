'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Hand,
  Search,
  Split,
  Target,
} from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import {
  buildPtCliticPositionBoard,
  type PtCliticPosition,
  type PtCliticPositionBoardModel,
  type PtCliticPositionOption,
} from '@/lib/slides/ptCliticRailSlideUtils';

const POSITION_META: Record<
  PtCliticPosition,
  {
    short: string;
    title: string;
    grammar: string;
    Icon: typeof ArrowLeft;
    accent: string;
    pale: string;
    border: string;
    ring: string;
  }
> = {
  proclise: {
    short: 'Antes',
    title: 'Antes do verbo',
    grammar: 'próclise',
    Icon: ArrowLeft,
    accent: 'text-violet-800',
    pale: 'bg-violet-50',
    border: 'border-violet-200',
    ring: 'ring-violet-100',
  },
  mesoclise: {
    short: 'Dentro',
    title: 'Dentro da forma',
    grammar: 'mesóclise',
    Icon: Split,
    accent: 'text-amber-800',
    pale: 'bg-amber-50',
    border: 'border-amber-200',
    ring: 'ring-amber-100',
  },
  enclise: {
    short: 'Depois',
    title: 'Depois do verbo',
    grammar: 'ênclise',
    Icon: ArrowRight,
    accent: 'text-cyan-900',
    pale: 'bg-cyan-50',
    border: 'border-cyan-300',
    ring: 'ring-cyan-100',
  },
};

const POSITION_ORDER: PtCliticPosition[] = ['proclise', 'mesoclise', 'enclise'];
const PRONOUNS = new Set(['me', 'te', 'se', 'nos', 'vos', 'o', 'a', 'os', 'as', 'lhe', 'lhes']);

const DEFAULT_POCKET_RULE =
  'Ache a mesma posição do modelo. Não classifique só pelo hífen.';

function plainPosition(position: PtCliticPosition): string {
  return POSITION_META[position].title.toLowerCase();
}

function ExampleStructure({
  example,
  position,
}: {
  example: string;
  position: PtCliticPosition;
}) {
  if (position === 'mesoclise') {
    const parts = example.split('-');
    if (parts.length >= 3) {
      return (
        <div className="grid grid-cols-[1fr_auto_1fr] overflow-hidden rounded-lg border border-slate-200 bg-white text-center font-mono text-[11px] font-bold text-slate-700 sm:text-xs">
          <span className="px-1.5 py-1">{parts[0]}</span>
          <span className="border-x border-cyan-200 bg-cyan-50 px-1.5 py-1 text-cyan-800">
            {parts[1]}
          </span>
          <span className="px-1.5 py-1">{parts.slice(2).join('-')}</span>
        </div>
      );
    }
  }

  if (position === 'enclise') {
    const parts = example.split('-');
    if (parts.length >= 2) {
      return (
        <div className="flex items-center gap-1 font-mono text-[11px] font-bold sm:text-xs">
          <span className="rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-slate-700">
            {parts.slice(0, -1).join('-')}
          </span>
          <span className="text-slate-400">+</span>
          <span className="rounded-lg border border-cyan-200 bg-cyan-50 px-1.5 py-1 text-cyan-800">
            {parts.at(-1)}
          </span>
        </div>
      );
    }
  }

  return (
    <p className="font-body text-[13px] font-semibold leading-snug text-slate-800 sm:text-sm">
      {example.split(/\s+/).map((word, index) => {
        const normalized = word.toLowerCase().replace(/[^\p{L}]/gu, '');
        return (
          <span
            key={`${word}-${index}`}
            className={PRONOUNS.has(normalized) ? 'font-black text-cyan-800' : undefined}
          >
            {index > 0 ? ' ' : ''}
            {word}
          </span>
        );
      })}
    </p>
  );
}

function PositionColumn({
  position,
  options,
  selectedLetter,
  answerLetter,
  enabled,
  highlighted,
  onChooseOption,
}: {
  position: PtCliticPosition;
  options: PtCliticPositionOption[];
  selectedLetter: string | null;
  answerLetter: string;
  enabled: boolean;
  highlighted: boolean;
  onChooseOption: (letter: string) => void;
}) {
  const meta = POSITION_META[position];
  const { Icon } = meta;
  const answered = selectedLetter !== null;

  return (
    <div
      className={`flex flex-col rounded-2xl border bg-white/95 p-2.5 shadow-sm transition-all sm:p-3 ${
        highlighted
          ? `border-cyan-500 ring-2 ${meta.ring} shadow-md`
          : meta.border
      }`}
    >
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${meta.pale}`}>
          <Icon className={`h-4 w-4 ${meta.accent}`} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="font-display text-xs font-black uppercase tracking-wide text-slate-900">
            {meta.title}
          </p>
          {highlighted ? (
            <p className="font-mono text-[9px] font-bold uppercase tracking-wide text-cyan-700">
              Posição do modelo
            </p>
          ) : null}
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
                className={`group flex min-h-[52px] items-center gap-2.5 rounded-xl border px-2 py-2 text-left transition-all sm:min-h-[56px] ${
                  !enabled
                    ? 'cursor-not-allowed border-slate-100 bg-slate-50 opacity-50'
                    : showCorrect
                      ? 'border-emerald-400 bg-emerald-50 ring-2 ring-emerald-100'
                      : showWrong
                        ? 'border-rose-300 bg-rose-50'
                        : 'border-slate-200 bg-white hover:border-cyan-300 hover:bg-cyan-50/60'
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-display text-lg font-black shadow-sm ${
                    showCorrect
                      ? 'bg-emerald-500 text-white'
                      : showWrong
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-900 text-white group-hover:bg-cyan-700'
                  }`}
                >
                  {showCorrect ? <Check className="h-5 w-5" strokeWidth={3} aria-hidden /> : option.letter}
                </span>
                <div className="min-w-0 flex-1">
                  <ExampleStructure example={option.example} position={position} />
                </div>
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

function ModelQuestion({
  model,
  choice,
  onChoose,
}: {
  model: PtCliticPositionBoardModel;
  choice: PtCliticPosition | null;
  onChoose: (position: PtCliticPosition) => void;
}) {
  const answered = choice !== null;
  const correct = choice === model.modelPosition;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-800">
            <Target className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-cyan-700">
              Passo 1 · Modelo
            </p>
            <p className="mt-0.5 font-body text-sm font-bold leading-snug text-slate-900 sm:text-base">
              Em <strong className="text-cyan-800">«{model.modelExample}»</strong>, onde está o
              pronome?
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {POSITION_ORDER.map((position) => {
            const selected = choice === position;
            const isCorrect = position === model.modelPosition;
            return (
              <button
                key={position}
                type="button"
                disabled={answered}
                onClick={() => onChoose(position)}
                className={`flex min-h-[52px] flex-col items-center justify-center rounded-xl border px-2 py-2 transition-all ${
                  answered && isCorrect
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-100'
                    : selected
                      ? 'border-rose-300 bg-rose-50 text-rose-900'
                      : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-cyan-300 hover:bg-cyan-50'
                }`}
              >
                <span className="font-display text-sm font-black sm:text-base">
                  {POSITION_META[position].short}
                </span>
                <span className="mt-0.5 text-center font-body text-[10px] font-medium text-slate-500 sm:text-[11px]">
                  {position === 'mesoclise' ? 'da forma' : 'do verbo'}
                </span>
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
            {correct ? 'Acertou. ' : 'Posição correta: '}
            O pronome fica <strong>{plainPosition(model.modelPosition)}</strong>.
          </motion.p>
        ) : null}
      </div>
    </div>
  );
}

export function LogicFlowPtCliticPositionBoard({
  model,
  theme,
  footerRule,
}: {
  model: PtCliticPositionBoardModel;
  theme: ThemeColors;
  footerRule?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [modelChoice, setModelChoice] = useState<PtCliticPosition | null>(null);
  const [optionChoice, setOptionChoice] = useState<string | null>(null);

  const grouped = useMemo(
    () =>
      Object.fromEntries(
        POSITION_ORDER.map((position) => [
          position,
          model.options.filter((option) => option.position === position),
        ]),
      ) as Record<PtCliticPosition, PtCliticPositionOption[]>,
    [model.options],
  );

  const pocketRule = useMemo(() => {
    const fromTransfer = model.transferRule
      ?.replace(/^Em similares:\s*/i, '')
      .trim();
    const fromFooter = footerRule?.trim();
    // Preferir regra espacial simples; evita jargão de “funções de me/se”.
    if (fromTransfer && !/fun[cç][oõ]es diferentes/i.test(fromTransfer)) {
      return fromTransfer;
    }
    if (fromFooter && !/fun[cç][oõ]es diferentes/i.test(fromFooter)) {
      return fromFooter;
    }
    return DEFAULT_POCKET_RULE;
  }, [footerRule, model.transferRule]);

  const chooseModel = useCallback((position: PtCliticPosition) => {
    setModelChoice(position);
  }, []);

  const chooseOption = useCallback((letter: string) => {
    setOptionChoice(letter);
  }, []);

  const answeredCorrectly = optionChoice === model.answerLetter;
  const step2Ready = Boolean(modelChoice);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto bg-slate-50 p-3 md:p-4">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-10`}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-3">
        <div className="text-center">
          <div className="inline-flex items-center gap-2">
            <Search className="h-4 w-4 text-cyan-700" aria-hidden />
            <h2 className="font-display text-base font-black uppercase tracking-wide text-slate-900 md:text-lg">
              Antes · dentro · depois
            </h2>
          </div>
          <p className="mt-1 font-body text-xs text-slate-500">
            Não precisa decorar o nome difícil — compare a posição.
          </p>
          <div className="mx-auto mt-1.5 h-1 w-14 rounded-full bg-cyan-400" />
        </div>

        <ModelQuestion model={model} choice={modelChoice} onChoose={chooseModel} />

        <div
          className={`rounded-2xl border p-3 transition-all ${
            step2Ready
              ? 'border-cyan-200 bg-white shadow-sm'
              : 'border-slate-200 bg-slate-100/80'
          }`}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-cyan-700">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500 text-[11px] text-white">
                2
              </span>
              Mesma posição
            </span>
            <p className="flex-1 font-body text-sm font-semibold text-slate-800">
              {step2Ready ? (
                <>
                  Qual alternativa também tem o pronome{' '}
                  <strong className="text-cyan-800">{plainPosition(model.modelPosition)}</strong>?
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
              <span className="inline-flex items-center gap-1.5 font-body text-xs font-semibold text-cyan-800">
                <Hand className="h-3.5 w-3.5" aria-hidden />
                Toque na letra (A–E)
              </span>
            ) : null}
          </div>
          {optionChoice && !answeredCorrectly ? (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 font-body text-xs font-semibold text-amber-900">
              Você marcou {optionChoice}. Olhe a coluna destacada (
              {plainPosition(model.modelPosition)}) — a resposta certa está lá.
            </p>
          ) : null}
          {optionChoice && answeredCorrectly ? (
            <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 font-body text-xs font-semibold text-emerald-900">
              Acertou a letra {model.answerLetter}: mesma posição do modelo.
            </p>
          ) : null}
        </div>

        <motion.div
          initial={false}
          animate={{ opacity: step2Ready ? 1 : 0.4 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.25 }}
          className="grid grid-cols-1 gap-2 sm:grid-cols-3"
          aria-disabled={!step2Ready}
        >
          {POSITION_ORDER.map((position) => (
            <PositionColumn
              key={position}
              position={position}
              options={grouped[position]}
              selectedLetter={optionChoice}
              answerLetter={model.answerLetter}
              enabled={step2Ready}
              highlighted={step2Ready && position === model.modelPosition}
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

export function resolvePtCliticPositionBoard(steps: string[]) {
  return buildPtCliticPositionBoard(steps);
}

'use client';

import { useMemo, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { BoardChrome } from '../primitives';

interface LogicFlowPtClassesPrepCategoryStackProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  /** Ignorado — board glanceable (0 taps). */
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
  chipLabel?: string;
  slideTitle?: string;
}

type CatSkin = {
  accent: string;
  tint: string;
};

/** Paleta do print minúscula — verde · laranja · azul · roxo (+ rose). */
const SKINS: CatSkin[] = [
  { accent: 'text-emerald-600', tint: 'bg-emerald-50' },
  { accent: 'text-orange-500', tint: 'bg-orange-50' },
  { accent: 'text-sky-600', tint: 'bg-sky-50' },
  { accent: 'text-violet-600', tint: 'bg-violet-50' },
  { accent: 'text-rose-600', tint: 'bg-rose-50' },
];

function isTransferStep(text: string): boolean {
  return /^(em similares|fixação|transfer)/i.test(text.trim());
}

function parseStep(text: string): { head: string; headRest: string; examples: string[] } {
  const parts = text.split(/\s*[·|]\s*/).map((p) => p.trim()).filter(Boolean);
  const titleRaw = (parts[0] ?? text).trim();
  const examplesRaw = parts.slice(1).join(' · ');
  const words = titleRaw.split(/\s+/).filter(Boolean);
  const head = (words[0] ?? titleRaw).toUpperCase();
  const headRest = words.slice(1).join(' ').toUpperCase();
  const examples = examplesRaw
    ? examplesRaw
        .split(/\s*,\s*/)
        .map((e) => e.trim())
        .filter(Boolean)
    : [];
  return { head, headRest, examples };
}

function renderExample(word: string, accent: string): ReactNode {
  const marked = word.split(/(«[^»]+»)/g);
  if (marked.length > 1) {
    return marked.map((part, i) =>
      part.startsWith('«') && part.endsWith('»') ? (
        <span key={i} className={`font-black underline decoration-2 underline-offset-2 ${accent}`}>
          {part.slice(1, -1)}
        </span>
      ) : (
        <span key={i}>{part}</span>
      ),
    );
  }
  if (word.length <= 1) {
    return <span className={`font-black ${accent}`}>{word}</span>;
  }
  return (
    <>
      <span className={`font-black ${accent}`}>{word[0]}</span>
      <span className="text-slate-800">{word.slice(1)}</span>
    </>
  );
}

/**
 * Slide 2 — PREPOSIÇÃO (categorias empilhadas, 0 taps).
 * Inspiração: print «letra minúscula» (card título + faixa exemplos).
 * Protocolo: `TÍTULO · ex1, ex2` · steps `Em similares:` viram faixa transferência.
 */
export function LogicFlowPtClassesPrepCategoryStack({
  steps,
  theme,
  footerRule,
  chipLabel,
  slideTitle,
}: LogicFlowPtClassesPrepCategoryStackProps) {
  const reduceMotion = useReducedMotion();
  const normalized = useMemo(() => normalizeLogicFlowSteps(steps), [steps]);

  const { sections, transfers } = useMemo(() => {
    const cats: { head: string; headRest: string; examples: string[]; skin: CatSkin }[] = [];
    const xfers: string[] = [];
    normalized.forEach((step) => {
      if (isTransferStep(step)) {
        xfers.push(step.replace(/^(em similares|fixação)\s*:\s*/i, '').trim() || step);
        return;
      }
      cats.push({ ...parseStep(step), skin: SKINS[cats.length % SKINS.length]! });
    });
    return { sections: cats, transfers: xfers };
  }, [normalized]);

  if (sections.length === 0 && transfers.length === 0) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <p className="font-body text-slate-400">Nenhum passo definido</p>
      </div>
    );
  }

  const titleLead = (chipLabel?.trim() || 'CLASSIFICA O').toUpperCase();
  const titleAccent = (slideTitle?.trim() || '«A»').toUpperCase();

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.1}
      footerRule={footerRule}
      footerLabel={footerRule ? 'TRANSFERÊNCIA' : undefined}
      maxWidth="2xl"
      className="gap-3"
    >
      <header className="flex flex-col items-center gap-0.5 text-center">
        <p className="font-display text-sm font-black uppercase tracking-wide text-slate-600 md:text-base">
          {titleLead}
        </p>
        <div className="relative mt-0.5 px-4">
          <span
            className="absolute inset-x-0 bottom-0.5 top-2 rounded-sm bg-rose-300/60"
            aria-hidden
            style={{
              clipPath:
                'polygon(2% 30%, 8% 10%, 92% 8%, 98% 28%, 96% 75%, 88% 95%, 12% 92%, 3% 70%)',
            }}
          />
          <p className="relative font-display text-2xl font-black uppercase tracking-wide text-rose-600 md:text-3xl">
            {titleAccent}
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-2.5">
        {sections.map((sec, index) => (
          <motion.section
            key={`prep-cat-${index}`}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : Math.min(index * 0.05, 0.2) }}
            className="flex flex-col items-center"
          >
            <div className="z-10 w-[94%] rounded-2xl bg-white px-3 py-2.5 text-center shadow-[0_4px_14px_rgba(15,23,42,0.1)] md:w-[90%] md:px-4">
              <p className="font-display text-sm font-black uppercase tracking-wide md:text-[15px]">
                <span className={sec.skin.accent}>{sec.head}</span>
                {sec.headRest ? <span className="text-slate-700"> {sec.headRest}</span> : null}
              </p>
            </div>

            {sec.examples.length > 0 ? (
              <div
                className={`-mt-2 w-full rounded-xl px-3 pb-2.5 pt-3.5 text-center ${sec.skin.tint}`}
              >
                <p className="font-body text-[13px] font-semibold leading-relaxed md:text-sm">
                  {sec.examples.map((ex, ei) => (
                    <span key={`${ex}-${ei}`}>
                      {ei > 0 ? <span className="text-slate-400">, </span> : null}
                      {renderExample(ex, sec.skin.accent)}
                    </span>
                  ))}
                </p>
              </div>
            ) : null}
          </motion.section>
        ))}
      </div>

      {transfers.length > 0 ? (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-center"
        >
          <p className="font-display text-[10px] font-black uppercase tracking-wide text-amber-800">
            Em similares
          </p>
          {transfers.map((t, i) => (
            <p
              key={`xf-${i}`}
              className="mt-0.5 font-body text-[12px] font-semibold leading-snug text-slate-800 md:text-[13px]"
            >
              {t}
            </p>
          ))}
        </motion.div>
      ) : null}
    </BoardChrome>
  );
}

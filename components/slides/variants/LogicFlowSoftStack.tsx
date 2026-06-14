'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { resolveLucideIcon } from '../core/lucideIcon';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';

const CARD_PALETTES = [
  {
    card: 'bg-gradient-to-br from-violet-100 via-violet-50 to-purple-100 border-violet-300/60 shadow-violet-200/40',
    tag: 'bg-violet-200/60 text-violet-800',
    ico: 'bg-violet-200/50',
  },
  {
    card: 'bg-gradient-to-br from-pink-100 via-rose-50 to-pink-100 border-pink-300/60 shadow-pink-200/40',
    tag: 'bg-pink-200/60 text-pink-800',
    ico: 'bg-pink-200/50',
  },
  {
    card: 'bg-gradient-to-br from-sky-100 via-blue-50 to-sky-100 border-sky-300/60 shadow-sky-200/40',
    tag: 'bg-sky-200/60 text-sky-800',
    ico: 'bg-sky-200/50',
  },
  {
    card: 'bg-gradient-to-br from-emerald-100 via-green-50 to-emerald-100 border-emerald-300/60 shadow-emerald-200/40',
    tag: 'bg-emerald-200/60 text-emerald-800',
  },
  {
    card: 'bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-100 border-amber-300/60 shadow-amber-200/40',
    tag: 'bg-amber-200/60 text-amber-900',
    ico: 'bg-amber-200/50',
  },
];

const STEP_TAGS = ['Fundamento', 'Exceção', 'Ponto de Virada', 'Aprofundamento', 'Síntese'];

function stepTitle(step: string, index: number): string {
  const lower = step.toLowerCase();
  if (/ler o comando|ler a afirmativa/.test(lower)) return 'Ler o comando';
  if (/gabarito|identificar gabarito|marcar letra/.test(lower)) return 'Identificar o gabarito';
  if (/testar letra|eliminar/.test(lower)) return 'Eliminar distrator';
  if (/fixação|fixar|marcar letra/.test(lower)) return 'Fixação final';
  return `Passo ${index + 1}`;
}

interface LogicFlowSoftStackProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
}

export function LogicFlowSoftStack({ steps, theme }: LogicFlowSoftStackProps) {
  const normalizedSteps = useMemo(() => normalizeLogicFlowSteps(steps), [steps]);
  const [passed, setPassed] = useState<number[]>([]);
  const [animating, setAnimating] = useState(false);

  const remaining = useMemo(
    () => normalizedSteps.map((_, i) => i).filter((i) => !passed.includes(i)),
    [normalizedSteps, passed],
  );

  const topIndex = remaining[0] ?? -1;
  const passCard = useCallback(() => {
    if (animating || topIndex < 0) return;
    setAnimating(true);
    setPassed((prev) => [...prev, topIndex]);
    setTimeout(() => setAnimating(false), 520);
  }, [animating, topIndex]);

  const undoCard = useCallback(() => {
    if (animating || passed.length === 0) return;
    setAnimating(true);
    setPassed((prev) => prev.slice(0, -1));
    setTimeout(() => setAnimating(false), 520);
  }, [animating, passed.length]);

  if (normalizedSteps.length === 0) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <p className="font-body text-slate-400">Nenhum passo definido</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
      <div className="absolute inset-0 overflow-hidden bg-[#fdf6ff]">
        <div className="absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-fuchsia-200/50 blur-[90px]" />
        <div className="absolute -right-16 top-[20%] h-80 w-80 rounded-full bg-sky-200/50 blur-[90px]" />
        <div className="absolute bottom-[10%] left-[5%] h-72 w-72 rounded-full bg-yellow-200/40 blur-[90px]" />
      </div>

      <div className="relative z-10 flex items-start justify-between px-6 pt-5">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-white/80 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-violet-700 shadow-sm">
            ✦ Soft Stack
          </span>
          <h2 className="mt-2 font-display text-2xl font-black leading-tight text-slate-900">
            Explore cada <span className="text-violet-500">passo</span>
          </h2>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl font-black text-slate-900">
            {remaining.length}
            <span className="text-lg font-bold text-violet-500">/{normalizedSteps.length}</span>
          </p>
          <p className="font-mono text-[9px] font-bold uppercase tracking-wide text-slate-400">na pilha</p>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-4">
        <div className="relative h-[270px] w-full max-w-[340px]">
          {remaining.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <span className="text-4xl">🎉</span>
              <p className="font-body text-base font-extrabold text-slate-900">Pilha concluída!</p>
              <p className="font-body text-sm text-slate-500">Você explorou todos os passos.</p>
            </div>
          ) : (
            remaining
              .slice(0, 4)
              .map((stepIndex, stackPos) => {
                const step = normalizedSteps[stepIndex];
                const palette = CARD_PALETTES[stepIndex % CARD_PALETTES.length];
                const isTop = stackPos === 0;
                const scale = 1 - stackPos * 0.04;
                const translateY = stackPos * 8;
                const icons = ['Brain', 'Lightbulb', 'Target', 'FlaskConical', 'Star'];
                const Icon = resolveLucideIcon(icons[stepIndex % icons.length]);

                return (
                  <motion.button
                    key={stepIndex}
                    type="button"
                    disabled={!isTop || animating}
                    onClick={isTop ? passCard : undefined}
                    animate={{
                      scale,
                      y: translateY,
                      opacity: stackPos >= 3 ? 0 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                    className={`absolute left-0 top-0 w-full rounded-3xl border p-6 text-left shadow-xl ${palette.card} ${
                      isTop ? 'cursor-pointer' : 'pointer-events-none'
                    }`}
                    style={{ zIndex: 10 - stackPos }}
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <span className="font-mono text-xs font-extrabold uppercase tracking-widest opacity-50">
                        {String(stepIndex + 1).padStart(2, '0')}
                      </span>
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${palette.ico ?? 'bg-white/40'}`}>
                        <Icon className="h-6 w-6 text-slate-700" aria-hidden />
                      </div>
                    </div>
                    <p className="font-body text-xl font-black leading-snug text-slate-900">
                      {stepTitle(step, stepIndex)}
                    </p>
                    {isTop ? (
                      <p className="mt-2 line-clamp-3 font-body text-sm leading-relaxed text-slate-600">{step}</p>
                    ) : null}
                    <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-3">
                      <span className={`rounded-full px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase ${palette.tag}`}>
                        {STEP_TAGS[stepIndex % STEP_TAGS.length]}
                      </span>
                      {isTop ? (
                        <span className="font-body text-[10px] font-semibold text-slate-400">toque para passar →</span>
                      ) : null}
                    </div>
                  </motion.button>
                );
              })
          )}
        </div>
      </div>

      <div className="relative z-10 flex justify-center gap-1.5 px-6 pb-2">
        {normalizedSteps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              passed.includes(i) ? 'w-2 bg-slate-200' : i === topIndex ? 'w-6 bg-violet-500' : 'w-2 bg-slate-300/60'
            }`}
          />
        ))}
      </div>

      <div className="relative z-10 flex gap-3 px-6 pb-6 pt-1">
        <button
          type="button"
          disabled={passed.length === 0 || animating}
          onClick={undoCard}
          className="rounded-2xl border border-black/10 bg-white px-4 py-3.5 font-body text-sm font-bold text-slate-500 shadow-sm disabled:opacity-35"
        >
          ↺
        </button>
        <button
          type="button"
          disabled={remaining.length === 0 || animating}
          onClick={passCard}
          className="flex-1 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 py-3.5 font-body text-sm font-bold text-white shadow-lg shadow-violet-300/40 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
        >
          {remaining.length === 0 ? 'Pilha completa ✓' : 'Próximo card →'}
        </button>
      </div>
    </div>
  );
}

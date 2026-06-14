'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FlaskConical } from 'lucide-react';
import { resolveLucideIcon } from '../core/lucideIcon';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';

const CARD_PALETTES = [
  {
    card: 'bg-gradient-to-br from-sky-100 via-sky-50 to-cyan-100 border-sky-300/60 shadow-sky-200/40',
    tag: 'bg-sky-200/60 text-sky-800',
    ico: 'bg-sky-200/50',
  },
  {
    card: 'bg-gradient-to-br from-teal-100 via-emerald-50 to-teal-100 border-teal-300/60 shadow-teal-200/40',
    tag: 'bg-teal-200/60 text-teal-800',
    ico: 'bg-teal-200/50',
  },
  {
    card: 'bg-gradient-to-br from-rose-100 via-pink-50 to-rose-100 border-rose-300/60 shadow-rose-200/40',
    tag: 'bg-rose-200/60 text-rose-800',
    ico: 'bg-rose-200/50',
  },
  {
    card: 'bg-gradient-to-br from-indigo-100 via-violet-50 to-indigo-100 border-indigo-300/60 shadow-indigo-200/40',
    tag: 'bg-indigo-200/60 text-indigo-800',
    ico: 'bg-indigo-200/50',
  },
  {
    card: 'bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-100 border-amber-300/60 shadow-amber-200/40',
    tag: 'bg-amber-200/60 text-amber-900',
    ico: 'bg-amber-200/50',
  },
];

const VF_TAGS = ['Comando', 'Afirmativa I', 'Afirmativa II', 'Afirmativa III', 'Gabarito', 'Eliminar', 'Fixação'];

function stepTitle(step: string, index: number): string {
  const lower = step.toLowerCase();
  if (/ler a questão|combinação v\/f|três afirmativas/.test(lower)) return 'Ler como V/F';
  if (/julgar i\b|afirmativa i|mediana cubital/.test(lower)) return 'Julgar I';
  if (/julgar ii\b|afirmativa ii|2\s*°c|refrigera/.test(lower)) return 'Julgar II';
  if (/julgar iii\b|afirmativa iii|perfurocortante|descarte/.test(lower)) return 'Julgar III';
  if (/montar o conjunto|i e ii apenas/.test(lower)) return 'Montar gabarito';
  if (/eliminar alternativas|incluam iii/.test(lower)) return 'Eliminar letras';
  if (/marcar [a-e]\b|marcar d/.test(lower)) return 'Marcar letra';
  if (/fixação|recipiente próprio|segregação/.test(lower)) return 'Fixação';
  return `Passo ${index + 1}`;
}

function stepTag(step: string, index: number): string {
  const lower = step.toLowerCase();
  if (/julgar i\b/.test(lower)) return 'Afirmativa I';
  if (/julgar ii\b/.test(lower)) return 'Afirmativa II';
  if (/julgar iii\b/.test(lower)) return 'Afirmativa III';
  return VF_TAGS[index % VF_TAGS.length];
}

interface LogicFlowLabVfSoftStackProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
}

export function LogicFlowLabVfSoftStack({ steps, theme }: LogicFlowLabVfSoftStackProps) {
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
      <div className="absolute inset-0 overflow-hidden bg-[#f0f9ff]">
        <div className="absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-sky-200/50 blur-[90px]" />
        <div className="absolute -right-16 top-[20%] h-80 w-80 rounded-full bg-teal-200/50 blur-[90px]" />
        <div className="absolute bottom-[10%] left-[5%] h-72 w-72 rounded-full bg-cyan-200/40 blur-[90px]" />
      </div>

      <div className="relative z-10 flex items-start justify-between px-6 pt-5">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-white/80 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-sky-700 shadow-sm">
            <FlaskConical className="h-3 w-3" aria-hidden />
            V/F Stack
          </span>
          <h2 className="mt-2 font-display text-2xl font-black leading-tight text-slate-900">
            Julgue <span className="text-sky-600">I · II · III</span>
          </h2>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl font-black text-slate-900">
            {remaining.length}
            <span className="text-lg font-bold text-sky-600">/{normalizedSteps.length}</span>
          </p>
          <p className="font-mono text-[9px] font-bold uppercase tracking-wide text-slate-400">na pilha</p>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-4">
        <div className="relative h-[270px] w-full max-w-[340px]">
          {remaining.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <span className="text-4xl">✓</span>
              <p className="font-body text-base font-extrabold text-slate-900">Raciocínio completo!</p>
              <p className="font-body text-sm text-slate-500">I e II verdadeiras · III falsa → letra D.</p>
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
                const icons = ['ClipboardList', 'Droplets', 'Thermometer', 'ShieldAlert', 'CheckCircle'];
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
                        {stepTag(step, stepIndex)}
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
              passed.includes(i) ? 'w-2 bg-slate-200' : i === topIndex ? 'w-6 bg-sky-500' : 'w-2 bg-slate-300/60'
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
          className="flex-1 rounded-2xl bg-gradient-to-r from-sky-500 to-teal-600 py-3.5 font-body text-sm font-bold text-white shadow-lg shadow-sky-300/40 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
        >
          {remaining.length === 0 ? 'Pilha completa ✓' : 'Próximo card →'}
        </button>
      </div>
    </div>
  );
}

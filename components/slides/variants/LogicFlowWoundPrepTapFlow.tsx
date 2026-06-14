'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bandage } from 'lucide-react';
import { resolveLucideIcon } from '../core/lucideIcon';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';

const CARD_PALETTES = [
  {
    card: 'bg-gradient-to-br from-orange-100 via-orange-50 to-amber-100 border-orange-300/60 shadow-orange-200/40',
    tag: 'bg-orange-200/60 text-orange-800',
    ico: 'bg-orange-200/50',
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
    card: 'bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-100 border-amber-300/60 shadow-amber-200/40',
    tag: 'bg-amber-200/60 text-amber-900',
    ico: 'bg-amber-200/50',
  },
  {
    card: 'bg-gradient-to-br from-sky-100 via-cyan-50 to-sky-100 border-sky-300/60 shadow-sky-200/40',
    tag: 'bg-sky-200/60 text-sky-800',
    ico: 'bg-sky-200/50',
  },
];

const PREP_TAGS = ['Comando', 'Afirmativa I', 'Afirmativa II', 'Afirmativa III', 'Afirmativa IV', 'Gabarito', 'Fixação'];

function stepTitle(step: string, index: number): string {
  const lower = step.toLowerCase();
  if (/ler a questão|combinação v\/f|quatro afirmativas/.test(lower)) return 'Ler como V/F';
  if (/julgar i\b|afirmativa i|pressão|pressao|calcanhar/.test(lower)) return 'Julgar I';
  if (/julgar ii\b|afirmativa ii|úmid|umid|seca|maceração/.test(lower)) return 'Julgar II';
  if (/julgar iii\b|afirmativa iii|sf|soro fisiológico|limpeza/.test(lower)) return 'Julgar III';
  if (/julgar iv\b|afirmativa iv|massage|proeminência|proeminencia/.test(lower)) return 'Julgar IV';
  if (/avaliar|estágio|estagio|ferida/.test(lower)) return 'Avaliar ferida';
  if (/limpar|sf 0|antisséptico/.test(lower)) return 'Limpar leito';
  if (/cobrir|curativo|cobertura|oclusiv/.test(lower)) return 'Escolher cobertura';
  if (/registrar|documentar|anotar/.test(lower)) return 'Registrar';
  if (/montar o conjunto|i e iii|gabarito/.test(lower)) return 'Montar gabarito';
  if (/eliminar alternativas/.test(lower)) return 'Eliminar letras';
  if (/marcar [a-e]\b/.test(lower)) return 'Marcar letra';
  if (/fixação|lpp|não massagear/.test(lower)) return 'Fixação';
  return `Passo ${index + 1}`;
}

function stepTag(step: string, index: number): string {
  const lower = step.toLowerCase();
  if (/julgar i\b/.test(lower)) return 'Afirmativa I';
  if (/julgar ii\b/.test(lower)) return 'Afirmativa II';
  if (/julgar iii\b/.test(lower)) return 'Afirmativa III';
  if (/julgar iv\b/.test(lower)) return 'Afirmativa IV';
  if (/avaliar/.test(lower)) return 'Avaliar';
  if (/limpar/.test(lower)) return 'Limpar';
  if (/cobrir/.test(lower)) return 'Cobrir';
  if (/registrar/.test(lower)) return 'Registrar';
  return PREP_TAGS[index % PREP_TAGS.length];
}

interface LogicFlowWoundPrepTapFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
}

export function LogicFlowWoundPrepTapFlow({ steps, theme }: LogicFlowWoundPrepTapFlowProps) {
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

  if (normalizedSteps.length === 0) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <p className="font-body text-slate-400">Nenhum passo definido</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
      <div className="absolute inset-0 overflow-hidden bg-[#fff7ed]">
        <div className="absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-orange-200/50 blur-[90px]" />
        <div className="absolute -right-16 top-[20%] h-80 w-80 rounded-full bg-amber-200/50 blur-[90px]" />
        <div className="absolute bottom-[10%] left-[5%] h-72 w-72 rounded-full bg-rose-200/35 blur-[90px]" />
      </div>
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-20`} />

      <div className="relative z-10 flex items-start justify-between px-6 pt-5">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-white/80 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-orange-700 shadow-sm">
            <Bandage className="h-3 w-3" aria-hidden />
            Prep Stack
          </span>
          <h2 className="mt-2 font-display text-2xl font-black leading-tight text-slate-900">
            Avaliar → <span className="text-orange-600">Cobrir</span>
          </h2>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl font-black text-slate-900">
            {remaining.length}
            <span className="text-lg font-bold text-orange-600">/{normalizedSteps.length}</span>
          </p>
          <p className="font-mono text-[9px] font-bold uppercase tracking-wide text-slate-400">na pilha</p>
        </div>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 items-stretch justify-center px-4 pb-4 md:px-6">
        <div className="relative w-full max-w-lg flex-1 min-h-[min(420px,52vh)] max-h-[min(560px,62vh)]">
          {remaining.length === 0 ? (
            <div className="flex h-full min-h-[min(420px,52vh)] flex-col items-center justify-center gap-2 text-center">
              <span className="text-5xl">✓</span>
              <p className="font-body text-lg font-extrabold text-slate-900">Raciocínio completo!</p>
              <p className="font-body text-base text-slate-500">Avaliou, limpou, cobriu e registrou.</p>
            </div>
          ) : (
            remaining.slice(0, 4).map((stepIndex, stackPos) => {
              const step = normalizedSteps[stepIndex];
              const palette = CARD_PALETTES[stepIndex % CARD_PALETTES.length];
              const isTop = stackPos === 0;
              const scale = 1 - stackPos * 0.035;
              const translateY = stackPos * 10;
              const icons = ['ClipboardList', 'Droplets', 'Bandage', 'Hand', 'CheckCircle'];
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
                  className={`absolute inset-0 flex h-full min-h-[min(420px,52vh)] flex-col rounded-3xl border p-7 text-left shadow-xl md:p-8 ${palette.card} ${
                    isTop ? 'cursor-pointer' : 'pointer-events-none'
                  }`}
                  style={{ zIndex: 10 - stackPos }}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <span className="font-mono text-sm font-extrabold uppercase tracking-widest opacity-50">
                      {String(stepIndex + 1).padStart(2, '0')}
                    </span>
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${palette.ico ?? 'bg-white/40'}`}>
                      <Icon className="h-7 w-7 text-slate-700" aria-hidden />
                    </div>
                  </div>
                  <p className="font-body text-2xl font-black leading-snug text-slate-900 md:text-3xl">
                    {stepTitle(step, stepIndex)}
                  </p>
                  {isTop ? (
                    <p className="mt-4 flex-1 font-body text-base leading-relaxed text-slate-600 md:text-lg">
                      {step}
                    </p>
                  ) : (
                    <div className="flex-1" />
                  )}
                  <div className="mt-auto flex items-center justify-between border-t border-black/5 pt-4">
                    <span className={`rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase ${palette.tag}`}>
                      {stepTag(step, stepIndex)}
                    </span>
                    {isTop ? (
                      <span className="font-body text-xs font-semibold text-slate-400 md:text-sm">toque para passar →</span>
                    ) : null}
                  </div>
                </motion.button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

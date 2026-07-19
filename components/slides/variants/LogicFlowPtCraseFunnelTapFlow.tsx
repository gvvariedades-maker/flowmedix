'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Filter } from 'lucide-react';
import { resolveLucideIcon } from '../core/lucideIcon';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import {
  extractStepLetter,
  inferFunnelStage,
  inferStepRole,
  stageBadge,
  type PtCraseFunnelStage,
  type PtCraseStepRole,
} from '@/lib/slides/ptCraseSlideUtils';

const CARD_PALETTES: Record<
  PtCraseStepRole,
  {
    card: string;
    tag: string;
    ico: string;
    accent: string;
  }
> = {
  eliminar_letra: {
    card: 'bg-gradient-to-br from-rose-100 via-rose-50 to-white border-rose-300/60 shadow-rose-200/40',
    tag: 'bg-rose-200/70 text-rose-900',
    ico: 'bg-rose-200/60',
    accent: 'text-rose-700',
  },
  validar_letra: {
    card: 'bg-gradient-to-br from-emerald-100 via-emerald-50 to-white border-emerald-300/60 shadow-emerald-200/40',
    tag: 'bg-emerald-200/70 text-emerald-900',
    ico: 'bg-emerald-200/60',
    accent: 'text-emerald-700',
  },
  gabarito: {
    card: 'bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-100 border-amber-300/70 shadow-amber-200/40',
    tag: 'bg-amber-200/70 text-amber-900',
    ico: 'bg-amber-200/60',
    accent: 'text-amber-800',
  },
  transferencia: {
    card: 'bg-gradient-to-br from-sky-100 via-sky-50 to-white border-sky-300/60 shadow-sky-200/40',
    tag: 'bg-sky-200/70 text-sky-900',
    ico: 'bg-sky-200/60',
    accent: 'text-sky-700',
  },
  generico: {
    card: 'bg-gradient-to-br from-slate-100 via-white to-slate-50 border-slate-300/60 shadow-slate-200/40',
    tag: 'bg-slate-200/70 text-slate-800',
    ico: 'bg-slate-200/60',
    accent: 'text-slate-700',
  },
};

function stepTitle(step: string, role: PtCraseStepRole): string {
  const letter = extractStepLetter(step);
  if (role === 'gabarito') return 'Gabarito do funil';
  if (role === 'transferencia') return 'Transferência para similares';
  if (letter && role === 'validar_letra') return `Letra ${letter} — passa`;
  if (letter && role === 'eliminar_letra') return `Letra ${letter} — barrada`;
  return 'Passo do funil';
}

function iconForRole(role: PtCraseStepRole, stage: PtCraseFunnelStage): string {
  if (role === 'gabarito') return 'Trophy';
  if (role === 'transferencia') return 'Repeat';
  if (role === 'validar_letra') return 'CheckCircle2';
  if (role === 'eliminar_letra') {
    if (stage === 'teste_verbo') return 'Ban';
    if (stage === 'teste_masculino') return 'XCircle';
    if (stage === 'pegadinha') return 'AlertTriangle';
    return 'X';
  }
  return 'Filter';
}

interface LogicFlowPtCraseFunnelTapFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  footerRule?: string;
}

export function LogicFlowPtCraseFunnelTapFlow({
  steps,
  theme,
  footerRule,
}: LogicFlowPtCraseFunnelTapFlowProps) {
  const reduceMotion = useReducedMotion();
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
    setTimeout(() => setAnimating(false), reduceMotion ? 0 : 480);
  }, [animating, topIndex, reduceMotion]);

  if (normalizedSteps.length === 0) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <p className="font-body text-slate-400">Nenhum passo definido</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
      <div className="absolute inset-0 overflow-hidden bg-[#fffbeb]">
        <div className="absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-amber-200/50 blur-[90px]" />
        <div className="absolute -right-16 top-[20%] h-80 w-80 rounded-full bg-yellow-200/40 blur-[90px]" />
        <div className="absolute bottom-[10%] left-[5%] h-72 w-72 rounded-full bg-orange-200/30 blur-[90px]" />
      </div>
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-15`} />

      <div className="relative z-10 flex items-start justify-between px-6 pt-5">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-white/80 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-amber-800 shadow-sm">
            <Filter className="h-3 w-3" aria-hidden />
            Funil ativo
          </span>
          <h2 className="mt-2 font-display text-2xl font-black leading-tight text-slate-900">
            Masc. → Verbo → <span className="text-amber-700">a + a</span>
          </h2>
        </div>
        <div className="text-right">
          {remaining.length === 0 ? (
            <>
              <p className="font-display text-3xl font-black text-emerald-700">
                {normalizedSteps.length}
                <span className="text-lg font-bold text-emerald-600">/{normalizedSteps.length}</span>
              </p>
              <p className="font-mono text-[9px] font-bold uppercase tracking-wide text-emerald-700/80">
                concluído
              </p>
            </>
          ) : (
            <>
              <p className="font-display text-3xl font-black text-slate-900">
                {passed.length + 1}
                <span className="text-lg font-bold text-amber-700">/{normalizedSteps.length}</span>
              </p>
              <p className="font-mono text-[9px] font-bold uppercase tracking-wide text-slate-400">
                passo · restam {remaining.length}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 items-stretch justify-center px-4 pb-4 md:px-6">
        <div className="relative w-full max-w-lg flex-1 min-h-[min(420px,52vh)] max-h-[min(560px,62vh)]">
          {remaining.length === 0 ? (
            <div className="flex h-full min-h-[min(420px,52vh)] flex-col items-center justify-center gap-2 text-center">
              <span className="text-5xl" aria-hidden>
                ✓
              </span>
              <p className="font-body text-lg font-extrabold text-slate-900">
                Funil concluído!
              </p>
              <p className="font-body text-base text-slate-500">
                Em similares: o verbo pede a? masculino/verbo? tem a+a? Só então use à.
              </p>
            </div>
          ) : (
            remaining.slice(0, 4).map((stepIndex, stackPos) => {
              const step = normalizedSteps[stepIndex];
              const role = inferStepRole(step);
              const stage = inferFunnelStage(step);
              const palette = CARD_PALETTES[role];
              const isTop = stackPos === 0;
              const scale = 1 - stackPos * 0.035;
              const translateY = stackPos * 10;
              const Icon = resolveLucideIcon(iconForRole(role, stage));
              const letter = extractStepLetter(step);

              return (
                <motion.button
                  key={stepIndex}
                  type="button"
                  disabled={!isTop || animating}
                  onClick={isTop ? passCard : undefined}
                  animate={
                    reduceMotion
                      ? { opacity: 1 }
                      : {
                          scale,
                          y: translateY,
                          opacity: stackPos >= 3 ? 0 : 1,
                        }
                  }
                  transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                  className={`absolute inset-0 flex h-full min-h-[min(420px,52vh)] flex-col rounded-3xl border p-7 text-left shadow-xl md:p-8 ${palette.card} ${
                    isTop ? 'cursor-pointer' : 'pointer-events-none'
                  }`}
                  style={{ zIndex: 10 - stackPos }}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <span className="font-mono text-sm font-extrabold uppercase tracking-widest opacity-50">
                      {String(stepIndex + 1).padStart(2, '0')}
                      {letter ? <span className={`ml-2 ${palette.accent}`}>· Letra {letter}</span> : null}
                    </span>
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${palette.ico}`}>
                      <Icon className="h-7 w-7 text-slate-700" aria-hidden />
                    </div>
                  </div>
                  <p className="font-body text-2xl font-black leading-snug text-slate-900 md:text-3xl">
                    {stepTitle(step, role)}
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
                      {stageBadge(stage)}
                    </span>
                    {isTop ? (
                      <span className="font-body text-xs font-semibold text-slate-400 md:text-sm">
                        toque para avançar o funil →
                      </span>
                    ) : null}
                  </div>
                </motion.button>
              );
            })
          )}
        </div>
      </div>

      {footerRule ? (
        <p className="relative z-10 mx-4 mb-4 rounded-xl border border-amber-200/80 bg-white/90 px-3 py-2 text-center font-body text-xs italic text-amber-900/90 shadow-sm md:mx-6">
          {footerRule}
        </p>
      ) : null}
    </div>
  );
}

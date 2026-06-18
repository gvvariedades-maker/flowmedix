'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Sparkles,
  Target,
  ThumbsUp,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFocusableIn } from '@/lib/a11y/focusable';
import {
  ONBOARDING_BANCAS,
  ONBOARDING_BANCA_ICONS,
  ONBOARDING_CARGA_HORARIA_OPTIONS,
  ONBOARDING_TOPIC_AREAS,
  ONBOARDING_TOPIC_AREA_ICONS,
  type OnboardingBanca,
  type OnboardingTopicArea,
} from '@/lib/onboarding/constants';
import { saveOnboardingPreferences } from '@/components/onboarding/useOnboardingOnAccess';

const STEPS = [
  {
    id: 'afinidade',
    eyebrow: '1 de 3',
    title: 'O que você já domina?',
    subtitle: 'Marque as matérias em que se sente mais confiante hoje.',
    icon: ThumbsUp,
  },
  {
    id: 'dificuldade',
    eyebrow: '2 de 3',
    title: 'Onde quer evoluir primeiro?',
    subtitle: 'Escolha as áreas em que sente mais insegurança — vamos priorizá-las.',
    icon: Target,
  },
  {
    id: 'bancas',
    eyebrow: '3 de 3',
    title: 'Quais bancas são seu foco?',
    subtitle: 'Selecione os órgãos e bancas dos concursos que pretende prestar.',
    icon: Sparkles,
  },
] as const;

type StepId = (typeof STEPS)[number]['id'];

function toggleSelection<T extends string>(current: T[], value: T): T[] {
  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
}

export function OnboardingOnAccess({
  isOpen,
  onComplete,
}: {
  isOpen: boolean;
  onComplete: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [afinidade, setAfinidade] = useState<OnboardingTopicArea[]>([]);
  const [dificuldade, setDificuldade] = useState<OnboardingTopicArea[]>([]);
  const [bancas, setBancas] = useState<OnboardingBanca[]>([]);
  const [cargaHoraria, setCargaHoraria] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step = STEPS[activeStep]!;
  const StepIcon = step.icon;
  const isLast = activeStep === STEPS.length - 1;

  const canAdvance =
    activeStep === 0
      ? afinidade.length > 0
      : activeStep === 1
        ? dificuldade.length > 0
        : bancas.length > 0;

  useEffect(() => {
    if (!isOpen) return;
    previousActiveElementRef.current = document.activeElement as HTMLElement | null;
    const id = window.requestAnimationFrame(() => {
      setActiveStep(0);
      setError(null);
      const first = getFocusableIn(panelRef.current)[0];
      first?.focus();
    });
    return () => {
      window.cancelAnimationFrame(id);
      previousActiveElementRef.current?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = getFocusableIn(panelRef.current);
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const active = document.activeElement as HTMLElement | null;

      if (!active || !panelRef.current?.contains(active)) {
        event.preventDefault();
        first.focus();
        return;
      }
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
        return;
      }
      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!canAdvance || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await saveOnboardingPreferences({
        topicos_afinidade: afinidade,
        topicos_dificuldade: dificuldade,
        bancas_foco: bancas,
        carga_horaria_semanal: cargaHoraria,
      });
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const stepId = step.id as StepId;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-[#010409]/80 p-3 backdrop-blur-md sm:items-center sm:p-6">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-access-title"
        aria-describedby="onboarding-access-description"
        className="glass-panel relative w-full max-w-3xl overflow-hidden border border-white/10 bg-slate-900/90 shadow-2xl outline-none"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-br from-cyan-500/20 via-transparent to-fuchsia-500/10"
          aria-hidden
        />

        <div className="relative p-5 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-200">
              <Sparkles className="h-3.5 w-3.5 text-[#00f2ff]" aria-hidden />
              Seu perfil de estudo
            </div>
            <button
              type="button"
              disabled
              className="flex h-9 w-9 shrink-0 cursor-not-allowed items-center justify-center rounded-full text-white/20"
              aria-hidden
              tabIndex={-1}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-[0.9fr_1.1fr] md:items-start">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-5 text-white shadow-inner">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10">
                <StepIcon className="h-5 w-5 text-[#00f2ff]" aria-hidden />
              </div>
              <p className="mt-6 text-xs font-black uppercase tracking-widest text-cyan-300/80">
                {step.eyebrow}
              </p>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-[#00f2ff] to-[#00ff88] transition-all"
                  style={{ width: `${((activeStep + 1) / STEPS.length) * 100}%` }}
                  aria-hidden
                />
              </div>
              <p className="mt-5 text-sm font-medium leading-relaxed text-slate-300">
                Calibramos seu simulado adaptativo com o que você declara hoje e evoluímos com seu
                desempenho real.
              </p>
            </div>

            <div className="min-w-0">
              <h2
                id="onboarding-access-title"
                className="text-balance text-2xl font-black tracking-tight text-white md:text-3xl"
              >
                <span className="text-neon-gradient">{step.title}</span>
              </h2>
              <p
                id="onboarding-access-description"
                className="mt-3 text-base font-medium leading-relaxed text-slate-300"
              >
                {step.subtitle}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {stepId === 'afinidade' || stepId === 'dificuldade'
                  ? ONBOARDING_TOPIC_AREAS.map((area) => {
                      const selected =
                        stepId === 'afinidade'
                          ? afinidade.includes(area)
                          : dificuldade.includes(area);
                      const Icon = ONBOARDING_TOPIC_AREA_ICONS[area];
                      return (
                        <button
                          key={area}
                          type="button"
                          onClick={() => {
                            if (stepId === 'afinidade') {
                              setAfinidade((current) => toggleSelection(current, area));
                            } else {
                              setDificuldade((current) => toggleSelection(current, area));
                            }
                          }}
                          aria-pressed={selected}
                          className={cn(
                            'inline-flex min-h-[44px] max-w-full items-center gap-2 rounded-2xl border px-3 py-2 text-left text-sm font-semibold transition-all',
                            selected
                              ? 'border-[#00f2ff]/50 bg-cyan-400/15 text-white shadow-[0_0_24px_rgba(0,242,255,0.12)]'
                              : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10',
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0 text-[#00f2ff]" aria-hidden />
                          <span className="min-w-0 break-words">{area}</span>
                        </button>
                      );
                    })
                  : ONBOARDING_BANCAS.map((banca) => {
                      const selected = bancas.includes(banca);
                      const Icon = ONBOARDING_BANCA_ICONS[banca];
                      return (
                        <button
                          key={banca}
                          type="button"
                          onClick={() => setBancas((current) => toggleSelection(current, banca))}
                          aria-pressed={selected}
                          className={cn(
                            'inline-flex min-h-[44px] items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-bold transition-all',
                            selected
                              ? 'border-[#00ff88]/40 bg-emerald-400/10 text-white'
                              : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10',
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0 text-[#00ff88]" aria-hidden />
                          {banca}
                        </button>
                      );
                    })}
              </div>

              {stepId === 'bancas' ? (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Carga horária semanal (opcional)
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {ONBOARDING_CARGA_HORARIA_OPTIONS.map((hours) => {
                      const selected = cargaHoraria === hours;
                      return (
                        <button
                          key={hours}
                          type="button"
                          onClick={() => setCargaHoraria(selected ? null : hours)}
                          aria-pressed={selected}
                          className={cn(
                            'min-h-[40px] rounded-xl border px-3 py-2 text-sm font-semibold transition-colors',
                            selected
                              ? 'border-amber-400/40 bg-amber-400/10 text-amber-100'
                              : 'border-white/10 text-slate-300 hover:border-white/20',
                          )}
                        >
                          {hours}h
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {error ? (
                <p className="mt-4 text-sm font-medium text-[#ff0055]" role="alert">
                  {error}
                </p>
              ) : null}

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                {activeStep > 0 ? (
                  <button
                    type="button"
                    onClick={() => setActiveStep((current) => Math.max(0, current - 1))}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold text-slate-200 transition-colors hover:bg-white/10"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
                    Voltar
                  </button>
                ) : null}

                {!isLast ? (
                  <button
                    type="button"
                    disabled={!canAdvance}
                    onClick={() => setActiveStep((current) => Math.min(STEPS.length - 1, current + 1))}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-gradient-to-r from-[#00f2ff] to-[#00ff88] px-5 py-2.5 text-sm font-black text-slate-950 transition-opacity enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Próximo
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!canAdvance || submitting}
                    onClick={() => void handleSubmit()}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-gradient-to-r from-[#00f2ff] to-[#00ff88] px-5 py-2.5 text-sm font-black text-slate-950 transition-opacity enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                        Salvando…
                      </>
                    ) : (
                      <>
                        Concluir perfil
                        <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

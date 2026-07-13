'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BrainCircuit, CheckCircle2, Sparkles, X } from 'lucide-react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const SLIDES = [
  {
    eyebrow: '1 de 4',
    title: 'Você não precisa estudar tudo antes de resolver questões',
    body: 'A questão mostra exatamente onde está sua lacuna. Em vez de estudar no escuro, você começa pelo que a banca realmente cobra.',
  },
  {
    eyebrow: '2 de 4',
    title: 'Tentar primeiro ativa sua memória',
    body: 'Quando você busca uma resposta antes de ver a explicação, o cérebro trabalha mais. Esse esforço torna o estudo mais ativo.',
  },
  {
    eyebrow: '3 de 4',
    title: 'O erro vira aprendizado',
    body: 'Depois da tentativa, o AVANT Enf mostra o diagnóstico e libera mapa, regra de ouro, fluxo lógico e zona de perigo.',
  },
  {
    eyebrow: '4 de 4',
    title: 'Pronto para o primeiro Estudo Reverso?',
    body: 'Em poucos minutos você responde, entende o raciocínio, fixa o ponto principal e encaminha sua revisão.',
  },
] as const;

function getFocusableIn(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((el) => {
    if (el.getAttribute('tabindex') === '-1') return false;
    if (el.hasAttribute('disabled')) return false;
    const style = window.getComputedStyle(el);
    if (style.visibility === 'hidden' || style.display === 'none') return false;
    return typeof el.tabIndex === 'number' && el.tabIndex >= 0;
  });
}

export function EstudoReversoWelcomeModal({
  isOpen,
  onClose,
  onSkip,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const slide = SLIDES[activeIndex]!;
  const isLast = activeIndex === SLIDES.length - 1;

  useEffect(() => {
    if (!isOpen) return;
    previousActiveElementRef.current = document.activeElement as HTMLElement | null;
    const id = window.requestAnimationFrame(() => {
      setActiveIndex(0);
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
        onClose();
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 p-3 backdrop-blur-[2px] sm:items-center sm:p-6">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="estudo-reverso-welcome-title"
        aria-describedby="estudo-reverso-welcome-description"
        className="card-elevated-lg relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl outline-none"
      >
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-br from-[rgba(34, 197, 94,0.14)] via-white to-slate-50" aria-hidden />
        <div className="relative p-5 md:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(34, 197, 94,0.35)] bg-[rgba(34, 197, 94,0.12)] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#166534]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Boas-vindas ao método
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              aria-label="Fechar introdução"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-[0.78fr_1.22fr] md:items-center">
            <div className="rounded-3xl border border-[rgba(34, 197, 94,0.35)] bg-gradient-to-br from-[#166534] to-[#2d5010] p-5 text-white shadow-md">
              <BrainCircuit className="h-9 w-9 text-[#22c55e]" aria-hidden />
              <p className="mt-8 text-xs font-black uppercase tracking-widest text-[#22c55e]/90">{slide.eyebrow}</p>
              <div className="mt-3 h-2 rounded-full bg-white/20">
                <div
                  className="h-2 rounded-full bg-[#22c55e] transition-all"
                  style={{ width: `${((activeIndex + 1) / SLIDES.length) * 100}%` }}
                  aria-hidden
                />
              </div>
              <p className="mt-4 text-sm font-semibold leading-relaxed text-white/90">
                Questão → tentativa → feedback → conceito → revisão.
              </p>
            </div>

            <div>
              <h2 id="estudo-reverso-welcome-title" className="text-balance text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
                {slide.title}
              </h2>
              <p id="estudo-reverso-welcome-description" className="mt-4 text-base font-medium leading-relaxed text-slate-600">
                {slide.body}
              </p>

              <div className="mt-6 flex gap-2" aria-label="Progresso da introdução">
                {SLIDES.map((item, index) => (
                  <button
                    key={item.eyebrow}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`h-2.5 rounded-full transition-all ${
                      index === activeIndex ? 'w-8 bg-[#22c55e]' : 'w-2.5 bg-slate-200 hover:bg-slate-300'
                    }`}
                    aria-label={`Ir para o slide ${index + 1}`}
                    aria-current={index === activeIndex ? 'step' : undefined}
                  />
                ))}
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                {activeIndex > 0 ? (
                  <button
                    type="button"
                    onClick={() => setActiveIndex((current) => Math.max(0, current - 1))}
                    className="btn-editorial-outline inline-flex items-center justify-center px-4 py-2.5 text-sm font-black"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
                    Voltar
                  </button>
                ) : null}

                {!isLast ? (
                  <button
                    type="button"
                    onClick={() => setActiveIndex((current) => Math.min(SLIDES.length - 1, current + 1))}
                    className="btn-editorial-primary inline-flex items-center justify-center px-4 py-2.5 text-sm font-black"
                  >
                    Próximo
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                  </button>
                ) : (
                  <>
                    <Link
                      href="/estudar"
                      onClick={onSkip}
                      className="btn-editorial-primary inline-flex items-center justify-center px-4 py-2.5 text-sm font-black"
                    >
                      Começar agora
                      <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                    </Link>
                    <Link
                      href="/ajuda/estudo-reverso"
                      onClick={onSkip}
                      className="btn-editorial-outline inline-flex items-center justify-center px-4 py-2.5 text-sm font-black"
                    >
                      Entender melhor o método
                    </Link>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={onSkip}
                className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition-colors hover:text-slate-900"
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden />
                Não mostrar novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCenterIfFitsScroll } from '@/lib/hooks/useCenterIfFitsScroll';

/** Controles de texto e layout extra só em viewport estreita (alinhado a `md`). */
const MAX_WIDTH_MOBILE_CONTROLS_PX = 767;

/** Escala de leitura (CSS `zoom` — reflow no WebKit/Blink, comum em mobile). */
const TEXT_SCALE_STEPS = [1, 1.12, 1.24, 1.36, 1.48] as const;

type EstudoReversoSlideZoomProps = {
  /** Reinicia escala e medição de centralização quando o slide muda */
  slideKey: number;
  children: React.ReactNode;
};

/**
 * Área do slide no estudo reverso:
 * - **Desktop:** rolagem nativa; sem toolbar de escala.
 * - **Mobile:** rolagem nativa (sem `TransformWrapper` — evita roubar toques do scroll).
 * - **Mobile:** botões A− / A+ / reset alteram `zoom` só no bloco do slide (legibilidade sem pinch).
 * - **Centralização:** via `useCenterIfFitsScroll` (centraliza quando cabe; senão alinha ao topo).
 */
export function EstudoReversoSlideZoom({ slideKey, children }: EstudoReversoSlideZoomProps) {
  const [narrowViewport, setNarrowViewport] = useState(false);
  const [textStep, setTextStep] = useState(0);

  const { scrollRef, slotRef, centerVertically } = useCenterIfFitsScroll(
    `${slideKey}-${narrowViewport ? 1 : 0}-${textStep}`
  );

  useLayoutEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MAX_WIDTH_MOBILE_CONTROLS_PX}px)`);
    const sync = () => setNarrowViewport(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useLayoutEffect(() => {
    setTextStep(0);
  }, [slideKey]);

  useEffect(() => {
    if (!narrowViewport) setTextStep(0);
  }, [narrowViewport]);

  const scale = narrowViewport ? TEXT_SCALE_STEPS[Math.min(textStep, TEXT_SCALE_STEPS.length - 1)] : 1;
  const isTextScaled = scale > 1;

  const dec = () => setTextStep((s) => Math.max(0, s - 1));
  const inc = () => setTextStep((s) => Math.min(TEXT_SCALE_STEPS.length - 1, s + 1));
  const resetScale = () => setTextStep(0);

  // Com zoom > 1 o layout pode ficar maior que a viewport: centralizar verticalmente corta topo/base.
  // Alinhar ao topo quando há escala para a rolagem mostrar o slide inteiro a partir do início.
  const justifySlot = centerVertically && !isTextScaled ? 'justify-center' : 'justify-start';

  // Sempre overflow-x-hidden: com a correção de largura (calc(100%/scale)) o conteúdo
  // se adapta à largura virtual e o zoom o expande de volta ao tamanho da viewport sem overflow.
  const scrollAreaClassName = cn(
    'relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto overscroll-y-contain touch-pan-y overflow-x-hidden'
  );

  const slotClassName = cn(
    'relative box-border flex min-h-full w-full max-w-full flex-col items-center',
    justifySlot,
    'py-3 pb-12 md:py-4 md:pb-16'
  );

  /**
   * Correção de largura para zoom:
   * Com zoom = S, os filhos veem a largura do pai (ex.: 375px).
   * Após zoom visual: 375 × S = overflow.
   * Solução: wrapper com width = 100% / S → filhos veem 375/S px e
   * após zoom aparece exatamente 375px — sem corte horizontal.
   */
  const zoomStyle: React.CSSProperties | undefined =
    scale !== 1
      ? ({ zoom: scale, width: `calc(100% / ${scale})` } as React.CSSProperties)
      : undefined;

  return (
    <div ref={scrollRef} className={scrollAreaClassName}>
      <div ref={slotRef} className={slotClassName}>
        {narrowViewport && (
          <div className="pointer-events-none absolute right-[max(0.5rem,env(safe-area-inset-right))] bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] z-[60] flex flex-col items-end gap-1">
            <div
              className="pointer-events-auto flex flex-col gap-0.5 rounded-xl border border-white/15 bg-black/55 p-1 shadow-lg backdrop-blur-md"
              role="toolbar"
              aria-label="Tamanho do texto do slide"
            >
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-lg text-white/95 transition hover:bg-white/12 active:bg-white/20 sm:h-10 sm:w-10 disabled:opacity-35"
                onClick={inc}
                disabled={textStep >= TEXT_SCALE_STEPS.length - 1}
                aria-label="Aumentar texto do slide"
              >
                <Plus size={20} strokeWidth={2.25} />
              </button>
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-lg text-white/95 transition hover:bg-white/12 active:bg-white/20 sm:h-10 sm:w-10 disabled:opacity-35"
                onClick={dec}
                disabled={textStep <= 0}
                aria-label="Diminuir texto do slide"
              >
                <Minus size={20} strokeWidth={2.25} />
              </button>
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/12 active:bg-white/20 sm:h-10 sm:w-10 disabled:opacity-35"
                onClick={resetScale}
                disabled={textStep === 0}
                aria-label="Tamanho de texto padrão"
              >
                <RotateCcw size={18} strokeWidth={2.25} />
              </button>
            </div>
            <p className="pointer-events-none max-w-[7.5rem] text-right text-[10px] leading-tight text-white/45">
              Ajuste o texto sem perder a rolagem
            </p>
          </div>
        )}

        <div
          className="box-border flex w-full min-w-0 max-w-full flex-col items-center self-stretch"
          style={zoomStyle}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

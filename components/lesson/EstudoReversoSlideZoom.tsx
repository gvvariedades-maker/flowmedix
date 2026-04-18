'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
  /** Largura real do container em px — medida com ResizeObserver para evitar
   *  ambiguidade do calc(100%/scale) quando zoom altera o contexto percentual. */
  const [containerPx, setContainerPx] = useState(0);
  const outerWrapperRef = useRef<HTMLDivElement>(null);

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

  /** Mede largura real do container externo (px absolutos, sem percentuais). */
  useLayoutEffect(() => {
    const el = outerWrapperRef.current;
    if (!el) return;
    const update = () => setContainerPx(el.offsetWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
   * Largura em pixels absolutos para o wrapper interno com zoom.
   *
   * Usar calc(100%/scale) é ambíguo: quando `zoom` está ativo o browser pode
   * resolver `100%` no contexto pós-zoom do pai, produzindo valor errado.
   * Medir com JS (offsetWidth) e usar px absolutos elimina essa ambiguidade:
   *   innerWidthPx = containerPx / scale
   *   após zoom visual: innerWidthPx × scale = containerPx → preenche exato.
   */
  const innerWidthPx = containerPx > 0 && scale !== 1 ? Math.floor(containerPx / scale) : null;

  const zoomStyle: React.CSSProperties | undefined =
    scale !== 1 && innerWidthPx !== null
      ? ({ zoom: scale, width: `${innerWidthPx}px` } as React.CSSProperties)
      : undefined;

  return (
    <div ref={scrollRef} className={scrollAreaClassName}>
      <div ref={slotRef} className={slotClassName}>
        {narrowViewport && (
          <div className="sticky top-0 z-20 w-full px-3 pb-2 pt-[max(0.25rem,env(safe-area-inset-top))]">
            <div className="mx-auto flex w-fit items-center gap-1 rounded-xl border border-white/15 bg-black/55 p-1 shadow-lg backdrop-blur-md">
              <div className="pr-1 pl-2 text-[10px] font-medium tracking-wide text-white/70">Texto</div>
              <div className="flex items-center gap-0.5" role="toolbar" aria-label="Tamanho do texto do slide">
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-white/95 transition hover:bg-white/12 active:bg-white/20 disabled:opacity-35"
                  onClick={dec}
                  disabled={textStep <= 0}
                  aria-label="Diminuir texto do slide"
                >
                  <Minus size={18} strokeWidth={2.25} />
                </button>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-white/95 transition hover:bg-white/12 active:bg-white/20 disabled:opacity-35"
                  onClick={inc}
                  disabled={textStep >= TEXT_SCALE_STEPS.length - 1}
                  aria-label="Aumentar texto do slide"
                >
                  <Plus size={18} strokeWidth={2.25} />
                </button>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/12 active:bg-white/20 disabled:opacity-35"
                  onClick={resetScale}
                  disabled={textStep === 0}
                  aria-label="Tamanho de texto padrão"
                >
                  <RotateCcw size={16} strokeWidth={2.25} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Externo: largura 100%, mede containerPx, âncora o conteúdo em x=0 */}
        <div ref={outerWrapperRef} className="w-full min-w-0 self-stretch">
          {/* Interno: px absolutos (innerWidthPx) + zoom → preenche exato sem overflow */}
          <div className="min-w-0" style={zoomStyle}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

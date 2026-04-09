'use client';

import { useLayoutEffect, useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCenterIfFitsScroll } from '@/lib/hooks/useCenterIfFitsScroll';

/** Zoom com pinça só em viewport estreita (alinhado ao `md:hidden` dos botões). */
const MAX_WIDTH_ZOOM_PX = 767;

/** Zoom máximo (evita texto excessivamente pixelado). */
const MAX_SCALE = 3;
const ZOOM_STEP = 0.15;

type EstudoReversoSlideZoomProps = {
  /** Reinicia o zoom quando o slide muda */
  slideKey: number;
  children: React.ReactNode;
};

/**
 * Área do slide no estudo reverso:
 * - **Desktop:** só rolagem nativa (roda do mouse / trackpad) — sem `TransformWrapper`, evita zoom acidental e conteúdo “preso”.
 * - **Mobile:** pinch + botões +/-; roda não dá zoom (`wheel` desligado); rolagem vertical na área quando o slide é alto.
 * - **Centralização:** verticalmente centralizado quando o conteúdo cabe; se não couber, alinha ao topo e permite rolar (topo sempre visível ao trocar slide).
 */
export function EstudoReversoSlideZoom({ slideKey, children }: EstudoReversoSlideZoomProps) {
  const [usePinchZoom, setUsePinchZoom] = useState(false);

  const { scrollRef, slotRef, centerVertically } = useCenterIfFitsScroll(
    `${slideKey}-${usePinchZoom ? 1 : 0}`
  );

  useLayoutEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MAX_WIDTH_ZOOM_PX}px)`);
    const sync = () => setUsePinchZoom(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const scrollAreaClassName =
    'relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-y-contain touch-pan-y';

  const slotClassName = cn(
    'box-border flex min-h-full w-full max-w-full flex-col items-center',
    centerVertically ? 'justify-center' : 'justify-start',
    'py-3 pb-12 md:py-4 md:pb-16'
  );

  return (
    <div ref={scrollRef} className={scrollAreaClassName}>
      <div ref={slotRef} className={slotClassName}>
        {!usePinchZoom ? (
          children
        ) : (
          <TransformWrapper
            key={slideKey}
            initialScale={1}
            minScale={1}
            maxScale={MAX_SCALE}
            limitToBounds
            centerZoomedOut
            centerOnInit
            wheel={{ disabled: true }}
            pinch={{ disabled: false }}
            doubleClick={{ mode: 'reset', animationTime: 200 }}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <div className="relative w-full min-h-0">
                <div className="pointer-events-none absolute right-[max(0.5rem,env(safe-area-inset-right))] bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] z-[60] flex flex-col items-end gap-1">
                  <div
                    className="pointer-events-auto flex flex-col gap-0.5 rounded-xl border border-white/15 bg-black/55 p-1 shadow-lg backdrop-blur-md"
                    role="toolbar"
                    aria-label="Zoom do slide"
                  >
                    <button
                      type="button"
                      className="flex h-11 w-11 items-center justify-center rounded-lg text-white/95 transition hover:bg-white/12 active:bg-white/20 sm:h-10 sm:w-10"
                      onClick={() => zoomIn(ZOOM_STEP)}
                      aria-label="Aproximar conteúdo"
                    >
                      <ZoomIn size={20} strokeWidth={2.25} />
                    </button>
                    <button
                      type="button"
                      className="flex h-11 w-11 items-center justify-center rounded-lg text-white/95 transition hover:bg-white/12 active:bg-white/20 sm:h-10 sm:w-10"
                      onClick={() => zoomOut(ZOOM_STEP)}
                      aria-label="Afastar conteúdo"
                    >
                      <ZoomOut size={20} strokeWidth={2.25} />
                    </button>
                    <button
                      type="button"
                      className="flex h-11 w-11 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/12 active:bg-white/20 sm:h-10 sm:w-10"
                      onClick={() => resetTransform(200)}
                      aria-label="Restaurar zoom original"
                    >
                      <RotateCcw size={18} strokeWidth={2.25} />
                    </button>
                  </div>
                  <p className="pointer-events-none max-w-[7.5rem] text-right text-[10px] leading-tight text-white/45">
                    Pinça com dois dedos para ampliar
                  </p>
                </div>

                <TransformComponent
                  wrapperClass="!min-h-0 !w-full !max-w-full"
                  contentClass="!flex !w-full !max-w-full !flex-col !items-center"
                >
                  {children}
                </TransformComponent>
              </div>
            )}
          </TransformWrapper>
        )}
      </div>
    </div>
  );
}

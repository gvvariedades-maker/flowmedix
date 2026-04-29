'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  getMaterialSlideLot,
  type MaterialSlideLotId,
} from '@/components/material/materialSlideLots';

/** Tamanho lógico do stage (px). A escala nunca ultrapassa o encaixe na área medida — evita corte por `overflow` + `transform`. */
const DESIGN_BASE_W = 360;
const DESIGN_BASE_H = 520;

/** Margem em relação ao `fit` máximo (1 = encosta no limite sem clip pelo scale). */
const FIT_MARGIN_WIDE = 0.988;
const FIT_MARGIN_COMPACT = 0.97;
const SCALE_MIN = 0.45;

/** Viewport compacta: um pouco mais conservador no encaixe. */
const COMPACT_VIEWPORT_MQ = '(max-width: 640px), (max-height: 520px)';

type MaterialSlidesPlayerProps = {
  selectedLot: MaterialSlideLotId;
  /** Só o slide na tela: sem moldura pesada nem faixa de título sobre o card (modal imersivo). */
  immersive?: boolean;
};

export function MaterialSlidesPlayer({ selectedLot, immersive = false }: MaterialSlidesPlayerProps) {
  const activeLot = getMaterialSlideLot(selectedLot);
  const ActiveContent = activeLot.Component;
  const [currentIndex, setCurrentIndex] = useState(0);
  const measureRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [compactViewport, setCompactViewport] = useState(false);

  const lastIndex = activeLot.count - 1;

  useEffect(() => {
    const mq = window.matchMedia(COMPACT_VIEWPORT_MQ);
    const apply = () => setCompactViewport(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((current) => (current === 0 ? lastIndex : current - 1));
  }, [lastIndex]);

  const goToNext = useCallback(() => {
    setCurrentIndex((current) => (current === lastIndex ? 0 : current + 1));
  }, [lastIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') goToPrevious();
      if (event.key === 'ArrowRight') goToNext();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious]);

  const recomputeScale = useCallback(() => {
    const el = measureRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const padX = 24;
    const padY = 28;
    const availW = Math.max(120, rect.width - padX);
    const availH = Math.max(120, rect.height - padY);
    const fit = Math.min(availW / DESIGN_BASE_W, availH / DESIGN_BASE_H);
    const margin = compactViewport ? FIT_MARGIN_COMPACT : FIT_MARGIN_WIDE;
    // Escala ≤ `fit` (com margem): evita clip pelo `transform` fora da área `overflow-hidden`.
    setScale(Math.max(SCALE_MIN, fit * margin));
  }, [compactViewport]);

  useLayoutEffect(() => {
    recomputeScale();
  }, [recomputeScale, selectedLot]);

  useEffect(() => {
    const el = measureRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => recomputeScale());
    ro.observe(el);
    return () => ro.disconnect();
  }, [recomputeScale]);

  const slideNumbers = useMemo(
    () => Array.from({ length: activeLot.count }, (_, index) => index),
    [activeLot.count],
  );

  const shellClass = immersive
    ? 'relative h-full min-h-0 overflow-hidden bg-transparent'
    : 'relative h-full min-h-0 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/55 shadow-2xl shadow-black/30';

  const navBtnBase = immersive
    ? 'border-white/15 bg-slate-950/75 opacity-80 hover:opacity-100'
    : 'border-white/10 bg-slate-950/70 hover:bg-white/10';

  return (
    <div className={shellClass}>
      {!immersive ? (
        <div className="pointer-events-none absolute left-3 right-3 top-3 z-20 mx-auto max-w-[min(100%-1.5rem,36rem)] rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 backdrop-blur-xl sm:left-5 sm:right-auto sm:top-5 sm:px-4 sm:py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#BEF264]">
            NeuroSlide de {activeLot.shortTitle} · Slide {currentIndex + 1} de {activeLot.count}
          </p>
          <h3 className="mt-1 text-sm font-black tracking-tight text-white sm:text-base">{activeLot.title}</h3>
        </div>
      ) : null}

      <div
        ref={measureRef}
        className={
          immersive
            ? 'material-player-measure flex h-full min-h-0 items-center justify-center overflow-hidden px-2 pb-[4.75rem] pt-12 sm:px-3 sm:pb-[5.25rem] sm:pt-14'
            : 'material-player-measure flex h-full min-h-0 items-center justify-center overflow-hidden p-2 pb-[4.75rem] pt-11 sm:p-4 sm:pb-[5.25rem] sm:pt-12'
        }
      >
        <div
          className="material-player-scale-root shrink-0 will-change-transform"
          style={{
            width: DESIGN_BASE_W,
            height: DESIGN_BASE_H,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          <div className="material-player-slide-frame h-full w-full min-h-0 overflow-hidden rounded-2xl">
            <ActiveContent />
          </div>
        </div>
      </div>

      <div
        role="toolbar"
        aria-label="Navegação dos slides"
        className={
          immersive
            ? 'absolute bottom-3 left-2 right-2 z-20 mx-auto flex max-w-2xl items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/80 px-2 py-2 shadow-xl backdrop-blur-md sm:bottom-4 sm:left-4 sm:right-4 sm:gap-3 sm:rounded-full sm:px-3'
            : 'absolute bottom-4 left-2 right-2 z-20 mx-auto flex max-w-2xl items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/85 px-2 py-2 shadow-xl backdrop-blur-xl sm:left-4 sm:right-4 sm:gap-3 sm:rounded-full sm:px-3'
        }
      >
        <button
          type="button"
          onClick={goToPrevious}
          className={[
            'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-200 shadow-inner ring-1 transition-all sm:h-11 sm:w-11 sm:rounded-full',
            navBtnBase,
          ].join(' ')}
          aria-label="Slide anterior"
        >
          <ChevronLeft size={22} aria-hidden />
        </button>

        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-1 sm:gap-1.5">
          {slideNumbers.map((index) => {
            const active = index === currentIndex;
            return (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={[
                  'h-2.5 shrink-0 rounded-full transition-all',
                  active ? 'w-8 bg-[#BEF264]' : 'w-2.5 bg-white/20 hover:bg-white/35',
                ].join(' ')}
                aria-label={`Ir para slide ${index + 1}`}
                aria-current={active ? 'step' : undefined}
              />
            );
          })}
        </div>

        <button
          type="button"
          onClick={goToNext}
          className={[
            'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#BEF264]/35 bg-[#BEF264] text-slate-950 shadow-lg shadow-lime-400/15 transition-all hover:bg-[#d4f879] sm:rounded-full',
            immersive ? 'opacity-95 hover:opacity-100' : '',
          ].join(' ')}
          aria-label="Próximo slide"
        >
          <ChevronRight size={22} aria-hidden />
        </button>
      </div>

      <style>{`
        .material-player-slide-frame > div {
          display: block !important;
          width: 100%;
          height: 100%;
        }

        .material-player-slide-frame > div > * {
          display: none !important;
        }

        .material-player-slide-frame > div > *:nth-child(${currentIndex + 1}) {
          display: flex !important;
          flex-direction: column;
          justify-content: flex-start;
          width: 100%;
          height: 100%;
          max-height: 100%;
          min-height: 0 !important;
          margin-inline: auto;
          box-sizing: border-box;
          overflow-x: hidden;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          padding: clamp(1.25rem, 3.5%, 2rem) clamp(1.25rem, 4%, 2rem) !important;
        }
      `}</style>
    </div>
  );
}

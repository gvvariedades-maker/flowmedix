'use client';

import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCenterIfFitsScroll } from '@/lib/hooks/useCenterIfFitsScroll';

/** Controles de texto e layout extra só em viewport estreita (alinhado a `md`). */
const MAX_WIDTH_MOBILE_CONTROLS_PX = 767;

/** Escala de leitura (CSS `zoom` — reflow no WebKit/Blink, comum em mobile). */
export const TEXT_SCALE_STEPS = [1, 1.12, 1.24, 1.36, 1.48] as const;

/** Largura lógica pré-zoom para evitar overflow horizontal após `zoom`. */
export function computeZoomInnerWidthPx(containerPx: number, scale: number): number | null {
  return containerPx > 0 && scale !== 1 ? Math.max(1, Math.floor(containerPx / scale)) : null;
}

type EstudoReversoSlideZoomContextValue = {
  slideKey: number;
  narrowViewport: boolean;
  textStep: number;
  inc: () => void;
  dec: () => void;
  resetScale: () => void;
  maxStep: number;
};

const EstudoReversoSlideZoomContext = createContext<EstudoReversoSlideZoomContextValue | null>(null);

function useEstudoReversoSlideZoomContext() {
  const ctx = useContext(EstudoReversoSlideZoomContext);
  if (!ctx) {
    throw new Error('EstudoReversoSlideZoom deve estar dentro de EstudoReversoSlideZoomProvider');
  }
  return ctx;
}

type EstudoReversoSlideZoomProviderProps = {
  /** Reinicia escala quando o slide muda */
  slideKey: number;
  children: ReactNode;
};

/**
 * Estado de zoom de texto compartilhado entre a barra superior (toolbar) e a área rolável do slide.
 */
export function EstudoReversoSlideZoomProvider({ slideKey, children }: EstudoReversoSlideZoomProviderProps) {
  const [narrowViewport, setNarrowViewport] = useState(false);
  const [textStep, setTextStep] = useState(0);

  useLayoutEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MAX_WIDTH_MOBILE_CONTROLS_PX}px)`);
    const sync = () => {
      const nextNarrow = mq.matches;
      setNarrowViewport(nextNarrow);
      if (!nextNarrow) {
        setTextStep(0);
      }
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const dec = () => setTextStep((s) => Math.max(0, s - 1));
  const inc = () => setTextStep((s) => Math.min(TEXT_SCALE_STEPS.length - 1, s + 1));
  const resetScale = () => setTextStep(0);

  const value: EstudoReversoSlideZoomContextValue = {
    slideKey,
    narrowViewport,
    textStep,
    inc,
    dec,
    resetScale,
    maxStep: TEXT_SCALE_STEPS.length - 1,
  };

  return (
    <EstudoReversoSlideZoomContext.Provider value={value}>{children}</EstudoReversoSlideZoomContext.Provider>
  );
}

/**
 * Botões A− / A+ / reset ao lado da numeração (só mobile / viewport estreita).
 * Deve ficar dentro do header fixo do modal, fora da área rolável do slide.
 */
export function EstudoReversoSlideZoomToolbar() {
  const { narrowViewport, textStep, inc, dec, resetScale, maxStep } = useEstudoReversoSlideZoomContext();

  if (!narrowViewport) return null;

  return (
    <div
      className="flex shrink-0 items-center gap-0.5 rounded-lg border border-white/15 bg-black/55 p-0.5 shadow-md backdrop-blur-md"
      role="toolbar"
      aria-label="Tamanho do texto do slide"
    >
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-md text-white/95 transition hover:bg-white/12 active:bg-white/20 disabled:opacity-35"
        onClick={dec}
        disabled={textStep <= 0}
        aria-label="Diminuir texto do slide"
      >
        <Minus size={16} strokeWidth={2.25} />
      </button>
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-md text-white/95 transition hover:bg-white/12 active:bg-white/20 disabled:opacity-35"
        onClick={inc}
        disabled={textStep >= maxStep}
        aria-label="Aumentar texto do slide"
      >
        <Plus size={16} strokeWidth={2.25} />
      </button>
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-md text-white/80 transition hover:bg-white/12 active:bg-white/20 disabled:opacity-35"
        onClick={resetScale}
        disabled={textStep === 0}
        aria-label="Tamanho de texto padrão"
      >
        <RotateCcw size={15} strokeWidth={2.25} />
      </button>
    </div>
  );
}

type EstudoReversoSlideZoomProps = {
  children: React.ReactNode;
};

/**
 * Área do slide no estudo reverso:
 * - **Desktop:** rolagem nativa; sem toolbar de escala.
 * - **Mobile:** rolagem nativa (sem `TransformWrapper` — evita roubar toques do scroll).
 * - **Mobile:** escala via contexto (toolbar no header do modal).
 * - **Centralização:** via `useCenterIfFitsScroll` (centraliza quando cabe; senão alinha ao topo).
 */
export function EstudoReversoSlideZoom({ children }: EstudoReversoSlideZoomProps) {
  const { slideKey, narrowViewport, textStep } = useEstudoReversoSlideZoomContext();
  /** Largura real do container em px — medida com ResizeObserver para evitar
   *  ambiguidade do calc(100%/scale) quando zoom altera o contexto percentual. */
  const [containerPx, setContainerPx] = useState(0);
  const outerWrapperRef = useRef<HTMLDivElement>(null);

  const scale = narrowViewport ? TEXT_SCALE_STEPS[Math.min(textStep, TEXT_SCALE_STEPS.length - 1)] : 1;
  const isTextScaled = scale > 1;

  const { scrollRef, slotRef, centerVertically } = useCenterIfFitsScroll(
    `${slideKey}-${narrowViewport ? 1 : 0}-${textStep}`
  );

  useLayoutEffect(() => {
    const el = outerWrapperRef.current;
    if (!el) return;
    const update = () => setContainerPx(el.offsetWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const justifySlot = centerVertically && !isTextScaled ? 'justify-center' : 'justify-start';

  /**
   * Sem rolagem horizontal: o bloco pré-zoom usa largura lógica menor (`floor`) para que,
   * após `zoom`, o desenho não ultrapasse a largura do container. Texto e flex/grid precisam
   * poder encolher (`min-w-0`, quebras) para não haver corte lateral.
   */
  const scrollAreaClassName = cn(
    'relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-y-contain touch-pan-y'
  );

  const slotClassName = cn(
    'relative box-border flex min-h-full w-full max-w-full flex-col items-center',
    justifySlot,
    isTextScaled ? 'py-3 pb-16 sm:pb-20' : 'py-3 pb-12 md:py-4 md:pb-16'
  );

  const innerWidthPx = computeZoomInnerWidthPx(containerPx, scale);

  const zoomStyle: React.CSSProperties | undefined =
    scale !== 1 && innerWidthPx !== null
      ? ({ zoom: scale, width: `${innerWidthPx}px`, boxSizing: 'border-box' } as React.CSSProperties)
      : undefined;

  const zoomContentClassName = cn(
    'min-w-0 max-w-full box-border',
    isTextScaled &&
      cn(
        'break-words [overflow-wrap:anywhere]',
        /** Flex/grid filhos costumam ter `min-width: auto` e impedir o encolhimento. */
        '[&_*]:min-w-0',
        '[&_img]:max-w-full [&_img]:h-auto [&_img]:object-contain',
        '[&_svg]:max-w-full [&_svg]:h-auto',
        '[&_table]:max-w-full [&_table]:table-fixed',
        '[&_pre]:max-w-full [&_pre]:whitespace-pre-wrap [&_pre]:break-all',
      ),
  );

  return (
    <div ref={scrollRef} className={scrollAreaClassName}>
      <div ref={slotRef} className={slotClassName}>
        <div ref={outerWrapperRef} className="w-full min-w-0 self-stretch">
          <div className={zoomContentClassName} style={zoomStyle}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

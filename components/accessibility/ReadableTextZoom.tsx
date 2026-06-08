'use client';

import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Controles de texto e layout extra só em viewport estreita (alinhado a `md`). */
export const MAX_WIDTH_MOBILE_CONTROLS_PX = 767;

/** Escala de leitura (CSS `zoom` — reflow no WebKit/Blink, comum em mobile). */
export const TEXT_SCALE_STEPS = [1, 1.12, 1.24, 1.36, 1.48] as const;

/** Largura lógica pré-zoom para evitar overflow horizontal após `zoom`. */
export function computeZoomInnerWidthPx(containerPx: number, scale: number): number | null {
  return containerPx > 0 && scale !== 1 ? Math.max(1, Math.floor(containerPx / scale)) : null;
}

type ReadableTextZoomContextValue = {
  contentKey: string | number;
  narrowViewport: boolean;
  textStep: number;
  inc: () => void;
  dec: () => void;
  resetScale: () => void;
  maxStep: number;
};

const ReadableTextZoomContext = createContext<ReadableTextZoomContextValue | null>(null);

export function useReadableTextZoomContext() {
  const ctx = useContext(ReadableTextZoomContext);
  if (!ctx) {
    throw new Error('ReadableTextZoom deve estar dentro de ReadableTextZoomProvider');
  }
  return ctx;
}

type ReadableTextZoomProviderProps = {
  /** Reinicia escala quando o conteúdo muda */
  contentKey: string | number;
  children: ReactNode;
};

/**
 * Estado de zoom de texto compartilhado entre toolbar e área de conteúdo.
 * Desktop (`md+`): escala sempre 1, sem toolbar.
 */
export function ReadableTextZoomProvider({ contentKey, children }: ReadableTextZoomProviderProps) {
  const [narrowViewport, setNarrowViewport] = useState(false);
  const [textStep, setTextStep] = useState(0);
  const [prevContentKey, setPrevContentKey] = useState(contentKey);

  if (contentKey !== prevContentKey) {
    setPrevContentKey(contentKey);
    setTextStep(0);
  }

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

  const value: ReadableTextZoomContextValue = {
    contentKey,
    narrowViewport,
    textStep,
    inc,
    dec,
    resetScale,
    maxStep: TEXT_SCALE_STEPS.length - 1,
  };

  return (
    <ReadableTextZoomContext.Provider value={value}>{children}</ReadableTextZoomContext.Provider>
  );
}

type ReadableTextZoomToolbarProps = {
  /** Rótulo acessível do grupo de botões (ex.: "Tamanho do texto da questão") */
  ariaLabel: string;
};

/**
 * Botões A− / A+ / reset (só mobile / viewport estreita).
 */
export function ReadableTextZoomToolbar({ ariaLabel }: ReadableTextZoomToolbarProps) {
  const { narrowViewport, textStep, inc, dec, resetScale, maxStep } = useReadableTextZoomContext();

  if (!narrowViewport) return null;

  return (
    <div
      className="flex shrink-0 items-center gap-0.5 rounded-lg border border-white/15 bg-black/55 p-0.5 shadow-md backdrop-blur-md"
      role="toolbar"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-white/95 transition hover:bg-white/12 active:bg-white/20 disabled:opacity-35"
        onClick={dec}
        disabled={textStep <= 0}
        aria-label="Diminuir texto"
      >
        <Minus size={16} strokeWidth={2.25} />
      </button>
      <button
        type="button"
        className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-white/95 transition hover:bg-white/12 active:bg-white/20 disabled:opacity-35"
        onClick={inc}
        disabled={textStep >= maxStep}
        aria-label="Aumentar texto"
      >
        <Plus size={16} strokeWidth={2.25} />
      </button>
      <button
        type="button"
        className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-white/80 transition hover:bg-white/12 active:bg-white/20 disabled:opacity-35"
        onClick={resetScale}
        disabled={textStep === 0}
        aria-label="Tamanho de texto padrão"
      >
        <RotateCcw size={15} strokeWidth={2.25} />
      </button>
    </div>
  );
}

type ReadableTextZoomContentProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Aplica escala de leitura via CSS `zoom` (sem scroll nem centralização).
 * Mede largura do container com ResizeObserver para evitar overflow horizontal.
 */
export function ReadableTextZoomContent({ children, className }: ReadableTextZoomContentProps) {
  const { narrowViewport, textStep } = useReadableTextZoomContext();
  const [containerPx, setContainerPx] = useState(0);
  const [innerHeightPx, setInnerHeightPx] = useState(0);
  // CSS `zoom` reflui o conteudo (WebKit/Blink e Firefox 126+). Em navegadores
  // sem suporte, caimos para `transform: scale` com compensacao de altura.
  const [zoomSupported, setZoomSupported] = useState(true);
  const outerWrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const scale = narrowViewport ? TEXT_SCALE_STEPS[Math.min(textStep, TEXT_SCALE_STEPS.length - 1)] : 1;
  const isTextScaled = scale > 1;

  useLayoutEffect(() => {
    setZoomSupported(
      typeof CSS !== 'undefined' &&
        typeof CSS.supports === 'function' &&
        CSS.supports('zoom', '1'),
    );
  }, []);

  useLayoutEffect(() => {
    const el = outerWrapperRef.current;
    if (!el) return;
    const update = () => {
      setContainerPx(el.offsetWidth);
      if (innerRef.current) setInnerHeightPx(innerRef.current.offsetHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (innerRef.current) ro.observe(innerRef.current);
    return () => ro.disconnect();
  }, []);

  const innerWidthPx = computeZoomInnerWidthPx(containerPx, scale);
  const useTransformFallback = scale !== 1 && innerWidthPx !== null && !zoomSupported;

  const zoomStyle: CSSProperties | undefined =
    scale !== 1 && innerWidthPx !== null
      ? useTransformFallback
        ? ({
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: `${innerWidthPx}px`,
            boxSizing: 'border-box',
          } as CSSProperties)
        : ({ zoom: scale, width: `${innerWidthPx}px`, boxSizing: 'border-box' } as CSSProperties)
      : undefined;

  // transform nao ocupa espaco de layout — reserva a altura escalada no wrapper externo.
  const outerStyle: CSSProperties | undefined =
    useTransformFallback && innerHeightPx > 0 ? { height: `${innerHeightPx * scale}px` } : undefined;

  const zoomContentClassName = cn(
    'min-w-0 max-w-full box-border',
    isTextScaled &&
      cn(
        'break-words [overflow-wrap:anywhere]',
        '[&_*]:min-w-0',
        '[&_img]:max-w-full [&_img]:h-auto [&_img]:object-contain',
        '[&_svg]:max-w-full [&_svg]:h-auto',
        '[&_table]:max-w-full [&_table]:table-fixed',
        '[&_pre]:max-w-full [&_pre]:whitespace-pre-wrap [&_pre]:break-all',
      ),
    className,
  );

  return (
    <div ref={outerWrapperRef} className="w-full min-w-0 self-stretch" style={outerStyle}>
      <div ref={innerRef} className={zoomContentClassName} style={zoomStyle}>
        {children}
      </div>
    </div>
  );
}

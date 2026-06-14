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
import { RotateCcw } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

/** Controles de texto e layout extra só em viewport estreita (alinhado a `md`). */
export const MAX_WIDTH_MOBILE_CONTROLS_PX = 767;

/** Escala de leitura (CSS `zoom` — reflow no WebKit/Blink, comum em mobile). */
export const TEXT_SCALE_STEPS = [1, 1.12, 1.24, 1.36, 1.48] as const;

export type ReadableTextZoomVariant = 'editorial' | 'cyber';

/** Largura lógica pré-zoom para evitar overflow horizontal após `zoom`. */
export function computeZoomInnerWidthPx(containerPx: number, scale: number): number | null {
  return containerPx > 0 && scale !== 1 ? Math.max(1, Math.floor(containerPx / scale)) : null;
}

function formatScaleLabel(step: number): string {
  const scale = TEXT_SCALE_STEPS[step] ?? 1;
  if (scale === 1) return 'Padrão';
  const formatted = Number.isInteger(scale) ? String(scale) : scale.toFixed(2).replace(/\.?0+$/, '');
  return `${formatted}×`;
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

type TextZoomControlsProps = {
  variant: ReadableTextZoomVariant;
  panelLabel: string;
};

function TextZoomControls({ variant, panelLabel }: TextZoomControlsProps) {
  const { textStep, inc, dec, resetScale, maxStep } = useReadableTextZoomContext();
  const isEditorial = variant === 'editorial';

  const stepBtnClass = cn(
    'flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg border text-sm font-bold transition disabled:opacity-40 disabled:pointer-events-none',
    isEditorial
      ? 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50 active:bg-slate-100'
      : 'border-white/15 bg-white/5 text-slate-100 hover:bg-white/10 active:bg-white/15',
  );

  const activeDotClass = isEditorial ? 'bg-sky-500' : 'bg-cyan-400';
  const inactiveDotClass = isEditorial ? 'bg-slate-200' : 'bg-white/20';

  return (
    <div role="toolbar" aria-label={panelLabel} className="flex min-w-[220px] flex-col gap-3">
      <p
        className={cn(
          'text-xs font-semibold',
          isEditorial ? 'text-slate-600' : 'text-slate-400',
        )}
      >
        {panelLabel}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={stepBtnClass}
          onClick={dec}
          disabled={textStep <= 0}
          aria-label="Diminuir texto"
        >
          A−
        </button>
        <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5 px-1">
          <div className="flex items-center gap-1.5" aria-hidden>
            {TEXT_SCALE_STEPS.map((_, index) => (
              <span
                key={index}
                className={cn(
                  'h-1.5 w-1.5 rounded-full transition-colors',
                  index <= textStep ? activeDotClass : inactiveDotClass,
                )}
              />
            ))}
          </div>
          <span
            className={cn(
              'text-[11px] font-semibold tabular-nums',
              isEditorial ? 'text-slate-700' : 'text-slate-300',
            )}
            aria-live="polite"
            aria-atomic="true"
          >
            {formatScaleLabel(textStep)}
          </span>
        </div>
        <button
          type="button"
          className={stepBtnClass}
          onClick={inc}
          disabled={textStep >= maxStep}
          aria-label="Aumentar texto"
        >
          A+
        </button>
      </div>
      {textStep > 0 ? (
        <button
          type="button"
          onClick={resetScale}
          className={cn(
            'flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition',
            isEditorial
              ? 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10',
          )}
        >
          <RotateCcw size={14} aria-hidden />
          Restaurar padrão
        </button>
      ) : null}
    </div>
  );
}

type ReadableTextZoomToolbarProps = {
  /** Rótulo acessível do grupo de botões (ex.: "Tamanho do texto da questão") */
  ariaLabel: string;
  /** `editorial` — player/vitrine; `cyber` — material modal escuro */
  variant?: ReadableTextZoomVariant;
};

/**
 * Botão Aa (mobile) que abre painel com A− / indicador / A+ / reset.
 */
export function ReadableTextZoomToolbar({
  ariaLabel,
  variant = 'editorial',
}: ReadableTextZoomToolbarProps) {
  const { narrowViewport, textStep } = useReadableTextZoomContext();
  const [open, setOpen] = useState(false);
  const isEditorial = variant === 'editorial';

  if (!narrowViewport) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          aria-expanded={open}
          className={cn(
            'flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full border transition-colors',
            isEditorial
              ? cn(
                  'border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 active:bg-slate-100',
                  textStep > 0 && 'border-sky-300 bg-sky-50 text-sky-800 ring-1 ring-sky-200',
                )
              : cn(
                  'rounded-xl border-white/15 bg-black/55 text-white/95 shadow-md backdrop-blur-md hover:bg-white/12 active:bg-white/20',
                  textStep > 0 && 'border-cyan-400/40 bg-cyan-950/40 text-cyan-200',
                ),
          )}
        >
          <span className="flex items-baseline font-semibold leading-none select-none" aria-hidden>
            <span className="text-[10px]">A</span>
            <span className="text-sm">a</span>
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        variant={isEditorial ? 'editorial' : 'default'}
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-auto p-3"
      >
        <TextZoomControls variant={variant} panelLabel={ariaLabel} />
      </PopoverContent>
    </Popover>
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

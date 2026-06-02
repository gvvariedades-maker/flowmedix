'use client';

import { cn } from '@/lib/utils';
import { useCenterIfFitsScroll } from '@/lib/hooks/useCenterIfFitsScroll';
import {
  ReadableTextZoomProvider,
  ReadableTextZoomToolbar,
  ReadableTextZoomContent,
  useReadableTextZoomContext,
  TEXT_SCALE_STEPS,
  computeZoomInnerWidthPx,
  MAX_WIDTH_MOBILE_CONTROLS_PX,
} from '@/components/accessibility/ReadableTextZoom';

export {
  TEXT_SCALE_STEPS,
  computeZoomInnerWidthPx,
  MAX_WIDTH_MOBILE_CONTROLS_PX,
};

type EstudoReversoSlideZoomProviderProps = {
  /** Reinicia escala quando o slide muda */
  slideKey: number;
  children: React.ReactNode;
};

/**
 * Estado de zoom de texto compartilhado entre a barra superior (toolbar) e a área rolável do slide.
 */
export function EstudoReversoSlideZoomProvider({ slideKey, children }: EstudoReversoSlideZoomProviderProps) {
  return (
    <ReadableTextZoomProvider contentKey={slideKey}>{children}</ReadableTextZoomProvider>
  );
}

/**
 * Botões A− / A+ / reset ao lado da numeração (só mobile / viewport estreita).
 * Deve ficar dentro do header fixo do modal, fora da área rolável do slide.
 */
export function EstudoReversoSlideZoomToolbar() {
  return <ReadableTextZoomToolbar ariaLabel="Tamanho do texto do slide" />;
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
  const { contentKey, narrowViewport, textStep } = useReadableTextZoomContext();

  const scale = narrowViewport ? TEXT_SCALE_STEPS[Math.min(textStep, TEXT_SCALE_STEPS.length - 1)] : 1;
  const isTextScaled = scale > 1;

  const { scrollRef, slotRef, centerVertically } = useCenterIfFitsScroll(
    `${contentKey}-${narrowViewport ? 1 : 0}-${textStep}`,
  );

  const justifySlot = centerVertically && !isTextScaled ? 'justify-center' : 'justify-start';

  const scrollAreaClassName = cn(
    'relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-y-contain touch-pan-y',
  );

  const slotClassName = cn(
    'relative box-border flex min-h-full w-full max-w-full flex-col items-center',
    justifySlot,
    isTextScaled ? 'py-3 pb-16 sm:pb-20' : 'py-3 pb-12 md:py-4 md:pb-16',
  );

  return (
    <div ref={scrollRef} className={scrollAreaClassName}>
      <div ref={slotRef} className={slotClassName}>
        <ReadableTextZoomContent>{children}</ReadableTextZoomContent>
      </div>
    </div>
  );
}

'use client';

import { cn } from '@/lib/utils';
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
 * Área do slide no estudo reverso (fullscreen):
 * - Preenche altura entre header e footer; conteúdo alinhado ao topo (sem centralização vertical).
 * - Mobile: escala via contexto (toolbar no header do modal).
 */
export function EstudoReversoSlideZoom({ children }: EstudoReversoSlideZoomProps) {
  const { narrowViewport, textStep } = useReadableTextZoomContext();

  const scale = narrowViewport ? TEXT_SCALE_STEPS[Math.min(textStep, TEXT_SCALE_STEPS.length - 1)] : 1;
  const isTextScaled = scale > 1;

  const scrollAreaClassName = cn(
    'relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-y-contain touch-pan-y',
  );

  const slotClassName = cn(
    'relative box-border flex min-h-full w-full max-w-full flex-1 flex-col items-stretch justify-start',
    isTextScaled ? 'py-3 pb-16 sm:pb-20' : 'py-2 pb-8 md:py-3 md:pb-10',
  );

  return (
    <div className={scrollAreaClassName}>
      <div className={slotClassName}>
        <ReadableTextZoomContent>{children}</ReadableTextZoomContent>
      </div>
    </div>
  );
}

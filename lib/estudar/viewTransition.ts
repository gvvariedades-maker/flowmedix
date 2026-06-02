/**
 * View Transitions API (progressive enhancement) para navegação em /estudar.
 * Sem suporte ou com prefers-reduced-motion: executa o callback direto.
 */

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  if (typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function runEstudarViewTransition(updateDom: () => void): void {
  if (typeof document === 'undefined' || prefersReducedMotion()) {
    updateDom();
    return;
  }

  const startTransition = (
    document as Document & {
      startViewTransition?: (callback: () => void | Promise<void>) => { finished: Promise<void> };
    }
  ).startViewTransition;

  if (typeof startTransition !== 'function') {
    updateDom();
    return;
  }

  try {
    startTransition.call(document, updateDom);
  } catch {
    updateDom();
  }
}

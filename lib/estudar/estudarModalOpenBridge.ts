/**
 * Sinaliza overlay @modal aberto para ancestrais do layout (ex.: DashboardShell / BottomNav).
 * `useSelectedLayoutSegment('modal')` só funciona dentro do subtree de `estudar/layout`.
 */

let overlayOpen = false;
const listeners = new Set<() => void>();

export function setEstudarModalOverlayOpen(open: boolean): void {
  if (overlayOpen === open) return;
  overlayOpen = open;
  listeners.forEach((listener) => listener());
}

export function getEstudarModalOverlayOpen(): boolean {
  return overlayOpen;
}

export function subscribeEstudarModalOverlayOpen(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Apenas testes — reset entre casos. */
export function resetEstudarModalOverlayOpenForTests(): void {
  overlayOpen = false;
  listeners.forEach((listener) => listener());
}

export const VITRINE_STATS_SEEN_STORAGE_KEY = 'avant.vitrine.statsSeen';

export const CATALOG_STATS_COUNT_UP_MS = 600;

export function hasVitrineCatalogStatsSeen(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return window.localStorage.getItem(VITRINE_STATS_SEEN_STORAGE_KEY) === '1';
  } catch {
    return true;
  }
}

export function markVitrineCatalogStatsSeen(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(VITRINE_STATS_SEEN_STORAGE_KEY, '1');
  } catch {
    /* quota / private mode */
  }
}

export function formatCatalogCount(value: number): string {
  return value.toLocaleString('pt-BR');
}

/** Interpolação ease-out cúbica (0 → 1). */
export function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export function interpolateCatalogCount(target: number, progress: number): number {
  return Math.round(target * easeOutCubic(Math.min(1, Math.max(0, progress))));
}

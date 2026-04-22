import type { ReviewItem } from '@/lib/spaced-repetition';

/** YYYY-MM-DD (UTC) — bucket diário para lembretes. */
export function chaveDiaPlano(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Id estável para um item do plano (revisão) na lista do dia.
 */
export function getPlanoItemId(item: ReviewItem): string {
  return `${item.modulo_slug}|${String(item.avant_codigo ?? '')}`;
}

export function storageKeyPlanoMarcados(userId: string, day: string): string {
  return `avant:planoDiario:marcados:v1:${userId}:${day}`;
}

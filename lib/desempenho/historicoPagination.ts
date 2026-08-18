import {
  DESEMPENHO_HISTORICO_PAGE_SIZE,
  type HistoricoResultadoFilter,
  type RecentAttempt,
} from '@/lib/desempenho/types';

export function encodeHistoricoCursor(attempt: Pick<RecentAttempt, 'createdAt' | 'id'>): string {
  return `${attempt.createdAt}|${attempt.id}`;
}

export function matchesHistoricoResultado(
  attempt: RecentAttempt,
  resultado: HistoricoResultadoFilter,
): boolean {
  if (resultado === 'todos') return true;
  if (resultado === 'acerto') return attempt.acertou;
  if (resultado === 'erro') return !attempt.acertou;
  return attempt.estudoReversoConcluido;
}

export function paginateRecentAttempts(
  attempts: readonly RecentAttempt[],
  opts: {
    cursor?: string | null;
    limit?: number;
    resultado?: HistoricoResultadoFilter;
  } = {},
): { items: RecentAttempt[]; nextCursor: string | null; total: number } {
  const limit = opts.limit ?? DESEMPENHO_HISTORICO_PAGE_SIZE;
  const resultado = opts.resultado ?? 'todos';
  const filtered = attempts.filter((attempt) => matchesHistoricoResultado(attempt, resultado));
  const sorted = [...filtered].sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id),
  );

  let start = 0;
  if (opts.cursor) {
    const idx = sorted.findIndex((attempt) => encodeHistoricoCursor(attempt) === opts.cursor);
    start = idx >= 0 ? idx + 1 : 0;
  }

  const items = sorted.slice(start, start + limit);
  const hasMore = start + items.length < sorted.length;

  return {
    items,
    nextCursor:
      hasMore && items.length > 0 ? encodeHistoricoCursor(items[items.length - 1]!) : null,
    total: sorted.length,
  };
}

export function normalizeHistoricoResultado(
  raw?: string | null,
): HistoricoResultadoFilter {
  if (raw === 'acerto' || raw === 'erro' || raw === 'reverso') return raw;
  return 'todos';
}

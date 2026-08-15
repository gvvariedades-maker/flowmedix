import {
  encodeHistoricoCursor,
  normalizeHistoricoResultado,
  paginateRecentAttempts,
} from '@/lib/desempenho/historicoPagination';
import type { RecentAttempt } from '@/lib/desempenho/types';

function attempt(partial: Partial<RecentAttempt> & Pick<RecentAttempt, 'id'>): RecentAttempt {
  return {
    moduloSlug: `slug-${partial.id}`,
    tituloAula: 'Vias de Administração',
    acertou: false,
    estudoReversoConcluido: false,
    createdAt: '2026-08-10T12:00:00.000Z',
    ...partial,
  };
}

describe('paginateRecentAttempts', () => {
  const attempts: RecentAttempt[] = [
    attempt({ id: 'a', acertou: true, createdAt: '2026-08-11T12:00:00.000Z' }),
    attempt({ id: 'b', acertou: false, estudoReversoConcluido: true, createdAt: '2026-08-10T12:00:00.000Z' }),
    attempt({ id: 'c', acertou: false, createdAt: '2026-08-09T12:00:00.000Z' }),
    attempt({ id: 'd', acertou: true, createdAt: '2026-08-08T12:00:00.000Z' }),
  ];

  it('pagina por cursor sem infinite scroll', () => {
    const page1 = paginateRecentAttempts(attempts, { limit: 2 });
    expect(page1.items.map((item) => item.id)).toEqual(['a', 'b']);
    expect(page1.nextCursor).toBe(encodeHistoricoCursor(page1.items[1]!));
    expect(page1.total).toBe(4);

    const page2 = paginateRecentAttempts(attempts, { limit: 2, cursor: page1.nextCursor });
    expect(page2.items.map((item) => item.id)).toEqual(['c', 'd']);
    expect(page2.nextCursor).toBeNull();
  });

  it('filtra acerto/erro/reverso só na lista', () => {
    expect(paginateRecentAttempts(attempts, { resultado: 'acerto' }).items.map((i) => i.id)).toEqual([
      'a',
      'd',
    ]);
    expect(paginateRecentAttempts(attempts, { resultado: 'erro' }).items.map((i) => i.id)).toEqual([
      'b',
      'c',
    ]);
    expect(paginateRecentAttempts(attempts, { resultado: 'reverso' }).items.map((i) => i.id)).toEqual([
      'b',
    ]);
  });
});

describe('normalizeHistoricoResultado', () => {
  it('descarta valor inválido', () => {
    expect(normalizeHistoricoResultado('acerto')).toBe('acerto');
    expect(normalizeHistoricoResultado('nope')).toBe('todos');
    expect(normalizeHistoricoResultado(null)).toBe('todos');
  });
});

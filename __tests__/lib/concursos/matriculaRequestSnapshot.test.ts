jest.mock('@/lib/logger', () => ({
  logger: { error: jest.fn(), warn: jest.fn() },
}));

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: jest.fn(),
}));

jest.mock('@/lib/campina/fulfillment', () => ({
  syncLegacyCampinaAcessoToMatricula: jest.fn().mockResolvedValue(false),
}));

jest.mock('react', () => {
  const actual = jest.requireActual<typeof import('react')>('react');
  return {
    ...actual,
    cache: <T extends (...args: never[]) => unknown>(fn: T): T => {
      return ((...args: never[]) => {
        const g = globalThis as typeof globalThis & {
          __avantMatriculaRequestCache?: Map<string, unknown>;
        };
        g.__avantMatriculaRequestCache ??= new Map();
        const key = JSON.stringify(args);
        if (!g.__avantMatriculaRequestCache.has(key)) {
          g.__avantMatriculaRequestCache.set(key, fn(...args));
        }
        return g.__avantMatriculaRequestCache.get(key);
      }) as T;
    },
  };
});

import { createServerSupabase } from '@/lib/supabase/server';
import { syncLegacyCampinaAcessoToMatricula } from '@/lib/campina/fulfillment';
import {
  getMatriculatedConcursos,
  userHasActiveMatricula,
} from '@/lib/concursos/entitlements';
import { listMatriculaRowsForUser } from '@/lib/concursos/matriculaRequestSnapshot';
import type { Concurso } from '@/types/database';

const mockCreateServerSupabase = createServerSupabase as jest.MockedFunction<
  typeof createServerSupabase
>;
const mockSyncLegacy = syncLegacyCampinaAcessoToMatricula as jest.MockedFunction<
  typeof syncLegacyCampinaAcessoToMatricula
>;

type SnapshotStore = Record<string, Array<Record<string, unknown>>>;

function resetRequestCache() {
  (globalThis as typeof globalThis & { __avantMatriculaRequestCache?: Map<string, unknown> })
    .__avantMatriculaRequestCache = new Map();
}

function makeConcurso(id: string): Concurso {
  return {
    id,
    slug: `slug-${id}`,
    nome: `Concurso ${id}`,
    cidade: null,
    orgao: null,
    banca: null,
    ano: 2026,
    cargo: null,
    tipo: 'geral',
    status: 'ativo',
    price_cents: 0,
    data_prova: null,
    descricao: null,
    destaque: null,
    created_at: '2026-01-01T00:00:00.000Z',
  };
}

function mockMatriculaClient(store: SnapshotStore, stats: { fetches: number }) {
  return {
    from: (table: string) => {
      if (table !== 'concurso_matriculas') {
        throw new Error(`Tabela não mockada: ${table}`);
      }
      return {
        select: () => ({
          eq: async (_column: string, userId: string) => {
            stats.fetches += 1;
            return { data: store[userId] ?? [], error: null };
          },
        }),
      };
    },
  };
}

describe('listMatriculaRowsForUser — snapshot por requisição', () => {
  let store: SnapshotStore;
  let stats: { fetches: number };

  beforeEach(() => {
    resetRequestCache();
    store = {};
    stats = { fetches: 0 };
    mockSyncLegacy.mockResolvedValue(false);
    mockCreateServerSupabase.mockResolvedValue(
      mockMatriculaClient(store, stats) as never,
    );
  });

  it('deduplica duas leituras do mesmo userId na mesma requisição', async () => {
    const concurso = makeConcurso('geral');
    store['user-a'] = [
      {
        concurso_id: concurso.id,
        status: 'ativo',
        expires_at: null,
        concurso,
      },
    ];

    const [first, second] = await Promise.all([
      listMatriculaRowsForUser('user-a'),
      listMatriculaRowsForUser('user-a'),
    ]);

    expect(stats.fetches).toBe(1);
    expect(first).toEqual(second);
    expect(first).toHaveLength(1);
  });

  it('não compartilha snapshot entre userIds diferentes no mesmo processo', async () => {
    const concursoA = makeConcurso('a');
    const concursoB = makeConcurso('b');
    store['user-a'] = [
      { concurso_id: concursoA.id, status: 'ativo', expires_at: null, concurso: concursoA },
    ];
    store['user-b'] = [
      { concurso_id: concursoB.id, status: 'ativo', expires_at: null, concurso: concursoB },
    ];

    const [rowsA, rowsB] = await Promise.all([
      listMatriculaRowsForUser('user-a'),
      listMatriculaRowsForUser('user-b'),
    ]);

    expect(stats.fetches).toBe(2);
    expect(rowsA[0]?.concurso_id).toBe('a');
    expect(rowsB[0]?.concurso_id).toBe('b');
  });

  it('fresh após snapshot negativo não reutiliza a leitura vazia', async () => {
    store['user-empty'] = [];

    const initial = await listMatriculaRowsForUser('user-empty');
    expect(initial).toEqual([]);
    expect(stats.fetches).toBe(1);

    store['user-empty'] = [
      {
        concurso_id: 'geral',
        status: 'ativo',
        expires_at: null,
        concurso: makeConcurso('geral'),
      },
    ];

    const memoized = await listMatriculaRowsForUser('user-empty');
    expect(memoized).toEqual([]);
    expect(stats.fetches).toBe(1);

    const fresh = await listMatriculaRowsForUser('user-empty', { fresh: true });
    expect(fresh).toHaveLength(1);
    expect(fresh[0]?.concurso_id).toBe('geral');
    expect(stats.fetches).toBe(2);
  });

  it('gate e shell compartilham a mesma leitura de matrícula', async () => {
    const concurso = makeConcurso('geral');
    store['user-share'] = [
      { concurso_id: concurso.id, status: 'ativo', expires_at: null, concurso },
    ];

    const [hasActive, concursos] = await Promise.all([
      userHasActiveMatricula('user-share'),
      getMatriculatedConcursos('user-share'),
    ]);

    expect(stats.fetches).toBe(1);
    expect(hasActive).toBe(true);
    expect(concursos).toEqual([concurso]);
  });
});

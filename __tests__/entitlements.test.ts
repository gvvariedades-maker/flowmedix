jest.mock('@/lib/logger', () => ({
  logger: { error: jest.fn() },
}));

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: jest.fn(),
}));

import { createServerSupabase } from '@/lib/supabase/server';
import {
  getAccessibleModuloSlugs,
  getAccessibleModulosForUser,
  userHasModuloAccess,
} from '@/lib/concursos/entitlements';

const mockCreateServerSupabase = createServerSupabase as jest.MockedFunction<
  typeof createServerSupabase
>;

type MatriculaRow = { concurso_id: string };
type ModuloRow = { id: string };
type ConcursoModuloRow = {
  modulo_id: string;
  modulos_estudo:
    | {
        id: string;
        modulo_slug: string;
        modulo_nome: string | null;
        titulo_aula: string | null;
        banca: string;
        created_at: string;
        avant_codigo: number | null;
      }
    | null;
};
type EntitlementLinkRow = { id: string };
type ModuloEstudoFullRow = NonNullable<ConcursoModuloRow['modulos_estudo']>;

function createSupabaseMock(handlers: {
  matriculas?: MatriculaRow[];
  modulosBySlug?: Record<string, ModuloRow | null>;
  modulosById?: Record<string, ModuloRow | null>;
  modulosByIds?: Record<string, ModuloEstudoFullRow>;
  concursoModulos?: ConcursoModuloRow[];
  concursoModulosPages?: ConcursoModuloRow[][];
  entitlementLinks?: EntitlementLinkRow[];
  geralConcurso?: { id: string; slug: string };
}) {
  const matriculas = [...(handlers.matriculas ?? [])];
  const modulosBySlug = handlers.modulosBySlug ?? {};
  const modulosById = handlers.modulosById ?? {};
  const modulosByIds = handlers.modulosByIds ?? {};
  const concursoModulos = handlers.concursoModulos ?? [];
  const concursoModulosPages = handlers.concursoModulosPages;
  const entitlementLinks = handlers.entitlementLinks ?? [];
  const geralConcurso = handlers.geralConcurso ?? { id: 'geral-id', slug: 'geral' };

  return {
    from: (table: string) => {
      if (table === 'concursos') {
        return {
          select: () => ({
            eq: (_column: string, value: string) => ({
              maybeSingle: async () => ({
                data: value === geralConcurso.slug ? geralConcurso : null,
                error: null,
              }),
            }),
          }),
        };
      }

      if (table === 'concurso_matriculas') {
        return {
          select: () => ({
            eq: async () => ({ data: matriculas, error: null }),
          }),
          upsert: async (row: { concurso_id: string }) => {
            if (!matriculas.some((item) => item.concurso_id === row.concurso_id)) {
              matriculas.push({ concurso_id: row.concurso_id });
            }
            return { error: null };
          },
        };
      }

      if (table === 'modulos_estudo') {
        return {
          select: () => {
            const query = {
              limit: () => query,
              eq: (column: string, value: string) => ({
                maybeSingle: async () => {
                  const modulo =
                    column === 'id' ? modulosById[value] ?? null : modulosBySlug[value] ?? null;
                  return { data: modulo, error: null };
                },
              }),
              in: (_column: string, ids: string[]) =>
                Promise.resolve({
                  data: ids
                    .map((id) => modulosByIds[id])
                    .filter((row): row is ModuloEstudoFullRow => Boolean(row)),
                  error: null,
                }),
            };
            return query;
          },
        };
      }

      if (table === 'concurso_modulos') {
        return {
          select: (columns: string) => {
            if (columns === 'id') {
              return {
                eq: () => ({
                  in: () => ({
                    limit: async () => ({ data: entitlementLinks, error: null }),
                  }),
                }),
              };
            }

            return {
              in: () => ({
                order: () => ({
                  range: async (_from: number, to: number) => {
                    if (concursoModulosPages) {
                      const pageIndex = Math.floor(to / 1000);
                      return { data: concursoModulosPages[pageIndex] ?? [], error: null };
                    }
                    return { data: concursoModulos, error: null };
                  },
                }),
              }),
            };
          },
        };
      }

      throw new Error(`Tabela não mockada: ${table}`);
    },
  };
}

function makeModuloRow(index: number): ModuloEstudoFullRow {
  const day = String((index % 28) + 1).padStart(2, '0');
  return {
    id: `mod-${index}`,
    modulo_slug: `modulo-${index}`,
    modulo_nome: `Módulo ${index}`,
    titulo_aula: null,
    banca: 'IDECAN',
    created_at: `2026-01-${day}T00:00:00.000Z`,
    avant_codigo: index,
  };
}

describe('entitlements — união de pacotes matriculados', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retorna catálogo vazio sem módulos no pacote matriculado', async () => {
    mockCreateServerSupabase.mockResolvedValue(
      createSupabaseMock({ matriculas: [], concursoModulos: [] }) as never,
    );

    await expect(getAccessibleModulosForUser('user-1')).resolves.toEqual([]);
    await expect(getAccessibleModuloSlugs('user-1')).resolves.toEqual(new Set());
    await expect(userHasModuloAccess('user-1', 'modulo-a')).resolves.toBe(false);
  });

  it('deduplica módulos repetidos em concursos diferentes', async () => {
    const sharedModulo = {
      id: 'mod-1',
      modulo_slug: 'modulo-a',
      modulo_nome: 'Módulo A',
      titulo_aula: null,
      banca: 'IDECAN',
      created_at: '2026-01-02T00:00:00.000Z',
      avant_codigo: null,
    };

    mockCreateServerSupabase.mockResolvedValue(
      createSupabaseMock({
        matriculas: [{ concurso_id: 'geral' }, { concurso_id: 'edital' }],
        concursoModulos: [
          { modulo_id: 'mod-1', modulos_estudo: sharedModulo },
          { modulo_id: 'mod-1', modulos_estudo: sharedModulo },
        ],
      }) as never,
    );

    const modulos = await getAccessibleModulosForUser('user-1');
    const slugs = await getAccessibleModuloSlugs('user-1');

    expect(modulos).toHaveLength(1);
    expect(modulos[0]?.id).toBe('mod-1');
    expect(slugs).toEqual(new Set(['modulo-a']));
  });

  it('mantém slugs alinhados ao catálogo acessível', async () => {
    const moduloA = {
      id: 'mod-1',
      modulo_slug: 'modulo-a',
      modulo_nome: 'Módulo A',
      titulo_aula: null,
      banca: 'IDECAN',
      created_at: '2026-01-02T00:00:00.000Z',
      avant_codigo: null,
    };
    const moduloB = {
      id: 'mod-2',
      modulo_slug: 'modulo-b',
      modulo_nome: 'Módulo B',
      titulo_aula: null,
      banca: 'IDECAN',
      created_at: '2026-01-01T00:00:00.000Z',
      avant_codigo: null,
    };

    mockCreateServerSupabase.mockResolvedValue(
      createSupabaseMock({
        matriculas: [{ concurso_id: 'geral' }, { concurso_id: 'edital' }],
        concursoModulos: [
          { modulo_id: 'mod-1', modulos_estudo: moduloA },
          { modulo_id: 'mod-2', modulos_estudo: moduloB },
        ],
      }) as never,
    );

    const modulos = await getAccessibleModulosForUser('user-1');
    const slugs = await getAccessibleModuloSlugs('user-1');

    expect(slugs).toEqual(new Set(modulos.map((modulo) => modulo.modulo_slug)));
  });

  it('userHasModuloAccess usa checagem pontual na união de matrículas', async () => {
    mockCreateServerSupabase.mockResolvedValue(
      createSupabaseMock({
        matriculas: [{ concurso_id: 'geral' }, { concurso_id: 'edital' }],
        modulosBySlug: { 'modulo-a': { id: 'mod-1' } },
        entitlementLinks: [{ id: 'link-1' }],
        concursoModulos: [],
      }) as never,
    );

    await expect(userHasModuloAccess('user-1', 'modulo-a')).resolves.toBe(true);
    await expect(userHasModuloAccess('user-1', 'modulo-inexistente')).resolves.toBe(false);
  });

  it('une Geral e edital com muitos vínculos sem lançar erro', async () => {
    const concursoModulos = Array.from({ length: 200 }, (_, index) => {
      const modulo = makeModuloRow(index);
      return { modulo_id: modulo.id, modulos_estudo: modulo };
    });

    mockCreateServerSupabase.mockResolvedValue(
      createSupabaseMock({
        matriculas: [{ concurso_id: 'geral' }, { concurso_id: 'edital' }],
        concursoModulos,
      }) as never,
    );

    const modulos = await getAccessibleModulosForUser('user-1');
    const slugs = await getAccessibleModuloSlugs('user-1');

    expect(modulos).toHaveLength(200);
    expect(slugs.size).toBe(200);
    expect(modulos.every((modulo) => modulo.modulo_slug && slugs.has(modulo.modulo_slug))).toBe(true);
  });

  it('pagina vínculos de concurso_modulos e deduplica entre páginas', async () => {
    const firstPage = Array.from({ length: 1000 }, (_, index) => {
      const modulo = makeModuloRow(index);
      return { modulo_id: modulo.id, modulos_estudo: modulo };
    });
    const duplicate = firstPage[0]!;
    const secondPage = [
      { modulo_id: duplicate.modulo_id, modulos_estudo: duplicate.modulos_estudo },
      ...Array.from({ length: 4 }, (_, offset) => {
        const index = 1000 + offset;
        const modulo = makeModuloRow(index);
        return { modulo_id: modulo.id, modulos_estudo: modulo };
      }),
    ];

    mockCreateServerSupabase.mockResolvedValue(
      createSupabaseMock({
        matriculas: [{ concurso_id: 'geral' }, { concurso_id: 'edital' }],
        concursoModulosPages: [firstPage, secondPage],
      }) as never,
    );

    const modulos = await getAccessibleModulosForUser('user-1');

    expect(modulos).toHaveLength(1004);
    expect(modulos.filter((modulo) => modulo.id === duplicate.modulo_id)).toHaveLength(1);
  });

  it('usa fallback em lotes quando o embed de modulos_estudo vem vazio', async () => {
    const moduloA = makeModuloRow(1);
    const moduloB = makeModuloRow(2);

    mockCreateServerSupabase.mockResolvedValue(
      createSupabaseMock({
        matriculas: [{ concurso_id: 'geral' }, { concurso_id: 'edital' }],
        concursoModulos: [
          { modulo_id: moduloA.id, modulos_estudo: null },
          { modulo_id: moduloB.id, modulos_estudo: null },
        ],
        modulosByIds: {
          [moduloA.id]: moduloA,
          [moduloB.id]: moduloB,
        },
      }) as never,
    );

    const modulos = await getAccessibleModulosForUser('user-1');

    expect(modulos).toHaveLength(2);
    expect(modulos.map((modulo) => modulo.id).sort()).toEqual([moduloA.id, moduloB.id]);
  });
});

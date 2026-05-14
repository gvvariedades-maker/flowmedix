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
  getAccessibleModulosForMatriculatedEditalPacote,
  isActiveMatriculaRow,
  matricularPorSlug,
  userHasModuloAccess,
} from '@/lib/concursos/entitlements';

const mockCreateServerSupabase = createServerSupabase as jest.MockedFunction<
  typeof createServerSupabase
>;

type MatriculaRow = {
  concurso_id: string;
  status?: string;
  expires_at?: string | null;
};
type ModuloRow = { id: string };
type ConcursoModuloRow = {
  concurso_id?: string;
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
type ConcursoFixture = {
  id: string;
  slug: string;
  nome: string;
  cidade: string | null;
  orgao: string | null;
  banca: string | null;
  ano: number | null;
  cargo: string | null;
  tipo: 'geral' | 'edital';
  status: 'rascunho' | 'ativo' | 'arquivado';
  price_cents: number | null;
  data_prova: string | null;
  created_at: string;
};

function createSupabaseMock(handlers: {
  matriculas?: MatriculaRow[];
  modulosBySlug?: Record<string, ModuloRow | null>;
  modulosById?: Record<string, ModuloRow | null>;
  modulosByIds?: Record<string, ModuloEstudoFullRow>;
  concursoModulos?: ConcursoModuloRow[];
  concursoModulosPages?: ConcursoModuloRow[][];
  entitlementLinks?: EntitlementLinkRow[];
  geralConcurso?: { id: string; slug: string };
  concursosBySlug?: Record<string, ConcursoFixture | null>;
  paidPurchases?: Record<string, boolean>;
  /** Slug real por `concursos.id` (usado em `.in('id', …)`). */
  concursoSlugById?: Record<string, string>;
  /** `tipo` por `concursos.id` em mocks de `.in('id', …)`. */
  concursoTipoById?: Record<string, 'geral' | 'edital'>;
  onMatriculaUpsert?: jest.Mock;
}) {
  const matriculaUpsert = handlers.onMatriculaUpsert ?? jest.fn().mockResolvedValue({ error: null });
  const matriculas = (handlers.matriculas ?? []).map((row) => ({
    status: 'ativo',
    expires_at: null,
    ...row,
  }));
  const modulosBySlug = handlers.modulosBySlug ?? {};
  const modulosById = handlers.modulosById ?? {};
  const modulosByIds = handlers.modulosByIds ?? {};
  const concursoModulos = handlers.concursoModulos ?? [];
  const concursoModulosPages = handlers.concursoModulosPages;
  const entitlementLinks = handlers.entitlementLinks ?? [];
  const geralConcurso = handlers.geralConcurso ?? { id: 'geral-id', slug: 'geral' };
  const concursosBySlug = handlers.concursosBySlug ?? {};
  const paidPurchases = handlers.paidPurchases ?? {};
  const concursoSlugById = handlers.concursoSlugById ?? {};
  const concursoTipoById = handlers.concursoTipoById ?? {};

  return {
    from: (table: string) => {
      if (table === 'concursos') {
        return {
          select: () => ({
            eq: (_column: string, value: string) => ({
              maybeSingle: async () => {
                if (value in concursosBySlug) {
                  return { data: concursosBySlug[value], error: null };
                }
                if (value === geralConcurso.slug) {
                  return { data: geralConcurso, error: null };
                }
                return { data: null, error: null };
              },
            }),
            in: async (_column: string, ids: string[]) => ({
              data: ids.map((id) => ({
                id,
                slug: concursoSlugById[id] ?? id,
                tipo: concursoTipoById[id] ?? (id === 'geral' ? 'geral' : 'edital'),
              })),
              error: null,
            }),
          }),
        };
      }

      if (table === 'concurso_purchases') {
        return {
          select: () => ({
            eq: (column: string, value: string) => {
              const filters: Record<string, string> = { [column]: value };
              const chain = {
                eq: (nextColumn: string, nextValue: string) => {
                  filters[nextColumn] = nextValue;
                  return chain;
                },
                limit: () => chain,
                maybeSingle: async () => {
                  const concursoId = filters.concurso_id;
                  const hasPurchase = concursoId ? paidPurchases[concursoId] === true : false;
                  return { data: hasPurchase ? { id: 'purchase-1' } : null, error: null };
                },
              };
              return chain;
            },
          }),
        };
      }

      if (table === 'concurso_matriculas') {
        return {
          select: () => ({
            eq: async () => ({ data: matriculas, error: null }),
          }),
          upsert: async (row: { concurso_id: string }) => {
            matriculaUpsert(row);
            if (!matriculas.some((item) => item.concurso_id === row.concurso_id)) {
              matriculas.push({ concurso_id: row.concurso_id, status: 'ativo', expires_at: null });
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
              in: (_column: string, ids: string[]) => {
                const idSet = new Set(ids);
                return {
                  order: () => ({
                    range: async (_from: number, to: number) => {
                      const raw = concursoModulosPages
                        ? concursoModulosPages[Math.floor(to / 1000)] ?? []
                        : concursoModulos;
                      const data = raw
                        .map((row) => ({
                          ...row,
                          concurso_id: row.concurso_id ?? matriculas[0]?.concurso_id ?? 'geral',
                        }))
                        .filter((row) => idSet.has(row.concurso_id));
                      return { data, error: null };
                    },
                  }),
                };
              },
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

describe('entitlements — matrícula ativa', () => {
  it('isActiveMatriculaRow exige status ativo e expires_at futuro ou ausente', () => {
    expect(isActiveMatriculaRow({ status: 'ativo', expires_at: null })).toBe(true);
    expect(isActiveMatriculaRow({ status: 'ativo', expires_at: '2099-01-01T00:00:00.000Z' })).toBe(
      true,
    );
    expect(isActiveMatriculaRow({ status: 'expirado', expires_at: null })).toBe(false);
    expect(isActiveMatriculaRow({ status: 'ativo', expires_at: '2020-01-01T00:00:00.000Z' })).toBe(
      false,
    );
  });
});

describe('entitlements — união de pacotes matriculados', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retorna catálogo vazio sem módulos no pacote matriculado', async () => {
    const onMatriculaUpsert = jest.fn();
    mockCreateServerSupabase.mockResolvedValue(
      createSupabaseMock({
        matriculas: [],
        concursoModulos: [],
        onMatriculaUpsert,
      }) as never,
    );

    await expect(getAccessibleModulosForUser('user-1')).resolves.toEqual([]);
    await expect(getAccessibleModuloSlugs('user-1')).resolves.toEqual(new Set());
    await expect(userHasModuloAccess('user-1', 'modulo-a')).resolves.toBe(false);
    expect(onMatriculaUpsert).not.toHaveBeenCalled();
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
          { concurso_id: 'geral', modulo_id: 'mod-1', modulos_estudo: sharedModulo },
          { concurso_id: 'edital', modulo_id: 'mod-1', modulos_estudo: sharedModulo },
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
          { concurso_id: 'geral', modulo_id: 'mod-1', modulos_estudo: moduloA },
          { concurso_id: 'edital', modulo_id: 'mod-2', modulos_estudo: moduloB },
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
      return {
        concurso_id: index < 100 ? 'geral' : 'edital',
        modulo_id: modulo.id,
        modulos_estudo: modulo,
      };
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
      return {
        concurso_id: index % 2 === 0 ? 'geral' : 'edital',
        modulo_id: modulo.id,
        modulos_estudo: modulo,
      };
    });
    const duplicate = firstPage[0]!;
    const secondPage = [
      { ...duplicate, concurso_id: duplicate.concurso_id },
      ...Array.from({ length: 4 }, (_, offset) => {
        const index = 1000 + offset;
        const modulo = makeModuloRow(index);
        return {
          concurso_id: index % 2 === 0 ? 'geral' : 'edital',
          modulo_id: modulo.id,
          modulos_estudo: modulo,
        };
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
          { concurso_id: 'geral', modulo_id: moduloA.id, modulos_estudo: null },
          { concurso_id: 'edital', modulo_id: moduloB.id, modulos_estudo: null },
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

  it('ignora matrículas expiradas ou com status inativo', async () => {
    const moduloA = {
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
        matriculas: [
          { concurso_id: 'expirado', status: 'expirado', expires_at: null },
          {
            concurso_id: 'vencido',
            status: 'ativo',
            expires_at: '2020-01-01T00:00:00.000Z',
          },
          { concurso_id: 'ativo', status: 'ativo', expires_at: null },
        ],
        modulosBySlug: { 'modulo-a': { id: 'mod-1' } },
        entitlementLinks: [{ id: 'link-1' }],
        concursoModulos: [{ concurso_id: 'ativo', modulo_id: 'mod-1', modulos_estudo: moduloA }],
      }) as never,
    );

    const modulos = await getAccessibleModulosForUser('user-1');
    const slugs = await getAccessibleModuloSlugs('user-1');

    expect(modulos).toHaveLength(1);
    expect(modulos[0]?.id).toBe('mod-1');
    expect(slugs).toEqual(new Set(['modulo-a']));
    await expect(userHasModuloAccess('user-1', 'modulo-a')).resolves.toBe(true);
  });

  it('Campina Grande 2026: não expõe módulo vinculado com banca fora de IDECAN', async () => {
    const idecan = {
      id: 'mod-i',
      modulo_slug: 'modulo-idecan',
      modulo_nome: 'A',
      titulo_aula: 'Assunto X',
      banca: 'IDECAN',
      created_at: '2026-01-01T00:00:00.000Z',
      avant_codigo: 1,
    };
    const cespe = {
      id: 'mod-c',
      modulo_slug: 'modulo-cespe',
      modulo_nome: 'B',
      titulo_aula: 'Assunto X',
      banca: 'CESPE',
      created_at: '2026-01-02T00:00:00.000Z',
      avant_codigo: 2,
    };

    mockCreateServerSupabase.mockResolvedValue(
      createSupabaseMock({
        matriculas: [{ concurso_id: 'campina-pkg-id' }],
        concursoSlugById: { 'campina-pkg-id': 'campina-grande-2026' },
        concursoModulos: [
          { concurso_id: 'campina-pkg-id', modulo_id: idecan.id, modulos_estudo: idecan },
          { concurso_id: 'campina-pkg-id', modulo_id: cespe.id, modulos_estudo: cespe },
        ],
      }) as never,
    );

    const modulos = await getAccessibleModulosForUser('user-1');

    expect(modulos).toHaveLength(1);
    expect(modulos[0]?.modulo_slug).toBe('modulo-idecan');
  });

  it('catálogo do pacote edital (vitrine) ignora módulos vinculados só ao geral', async () => {
    const moduloGeral = {
      id: 'mod-g',
      modulo_slug: 'modulo-geral',
      modulo_nome: 'Geral',
      titulo_aula: null,
      banca: 'IDECAN',
      created_at: '2026-01-01T00:00:00.000Z',
      avant_codigo: 1,
    };
    const moduloEdital = {
      id: 'mod-e',
      modulo_slug: 'modulo-edital',
      modulo_nome: 'Edital',
      titulo_aula: null,
      banca: 'IDECAN',
      created_at: '2026-01-02T00:00:00.000Z',
      avant_codigo: 2,
    };

    mockCreateServerSupabase.mockResolvedValue(
      createSupabaseMock({
        matriculas: [{ concurso_id: 'geral' }, { concurso_id: 'edital' }],
        concursoTipoById: { geral: 'geral', edital: 'edital' },
        concursoModulos: [
          { concurso_id: 'geral', modulo_id: moduloGeral.id, modulos_estudo: moduloGeral },
          { concurso_id: 'edital', modulo_id: moduloEdital.id, modulos_estudo: moduloEdital },
        ],
      }) as never,
    );

    const modulos = await getAccessibleModulosForMatriculatedEditalPacote('user-1');

    expect(modulos).toHaveLength(1);
    expect(modulos[0]?.modulo_slug).toBe('modulo-edital');
  });
});

describe('entitlements — matricularPorSlug (cadastro)', () => {
  const paidConcurso: ConcursoFixture = {
    id: 'paid-id',
    slug: 'campina-grande-2026',
    nome: 'Campina Grande 2026',
    cidade: 'Campina Grande',
    orgao: 'Prefeitura',
    banca: 'IDECAN',
    ano: 2026,
    cargo: 'Técnico de Enfermagem',
    tipo: 'edital',
    status: 'ativo',
    price_cents: 9900,
    data_prova: '2026-06-01',
    created_at: '2026-01-01T00:00:00.000Z',
  };

  const freeConcurso: ConcursoFixture = {
    ...paidConcurso,
    id: 'free-id',
    slug: 'geral',
    nome: 'Geral',
    price_cents: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('bloqueia cadastro em concurso pago sem compra confirmada', async () => {
    const onMatriculaUpsert = jest.fn();
    mockCreateServerSupabase.mockResolvedValue(
      createSupabaseMock({
        matriculas: [],
        concursosBySlug: { [paidConcurso.slug]: paidConcurso },
        paidPurchases: { [paidConcurso.id]: false },
        onMatriculaUpsert,
      }) as never,
    );

    await expect(matricularPorSlug('user-1', paidConcurso.slug, 'cadastro')).rejects.toThrow(
      'Este concurso exige compra. Conclua o pagamento antes de se matricular.',
    );
    expect(onMatriculaUpsert).not.toHaveBeenCalled();
  });

  it('permite cadastro em concurso pago com compra confirmada', async () => {
    const onMatriculaUpsert = jest.fn();
    mockCreateServerSupabase.mockResolvedValue(
      createSupabaseMock({
        matriculas: [],
        concursosBySlug: { [paidConcurso.slug]: paidConcurso },
        paidPurchases: { [paidConcurso.id]: true },
        onMatriculaUpsert,
      }) as never,
    );

    await expect(matricularPorSlug('user-1', paidConcurso.slug, 'cadastro')).resolves.toEqual(
      paidConcurso,
    );
    expect(onMatriculaUpsert).toHaveBeenCalledWith({
      user_id: 'user-1',
      concurso_id: paidConcurso.id,
      origem: 'cadastro',
    });
  });

  it('permite cadastro em concurso gratuito sem compra', async () => {
    const onMatriculaUpsert = jest.fn();
    mockCreateServerSupabase.mockResolvedValue(
      createSupabaseMock({
        matriculas: [],
        concursosBySlug: { [freeConcurso.slug]: freeConcurso },
        onMatriculaUpsert,
      }) as never,
    );

    await expect(matricularPorSlug('user-1', freeConcurso.slug, 'cadastro')).resolves.toEqual(
      freeConcurso,
    );
    expect(onMatriculaUpsert).toHaveBeenCalledWith({
      user_id: 'user-1',
      concurso_id: freeConcurso.id,
      origem: 'cadastro',
    });
  });

  it('permite cadastro em concurso pago quando já há matrícula ativa', async () => {
    const onMatriculaUpsert = jest.fn();
    mockCreateServerSupabase.mockResolvedValue(
      createSupabaseMock({
        matriculas: [{ concurso_id: paidConcurso.id, status: 'ativo', expires_at: null }],
        concursosBySlug: { [paidConcurso.slug]: paidConcurso },
        paidPurchases: { [paidConcurso.id]: false },
        onMatriculaUpsert,
      }) as never,
    );

    await expect(matricularPorSlug('user-1', paidConcurso.slug, 'cadastro')).resolves.toEqual(
      paidConcurso,
    );
    expect(onMatriculaUpsert).toHaveBeenCalledWith({
      user_id: 'user-1',
      concurso_id: paidConcurso.id,
      origem: 'cadastro',
    });
  });
});

import { CADERNO_PACKS, MINUTES_PER_QUESTAO, PACK_MAX_SIZE } from '@/lib/cadernos/packs';
import { resolvePacks, type ClonedPackNotebook } from '@/lib/cadernos/resolvePacks';
import type { ModuloEstudoListRow } from '@/lib/concursos/entitlements';

function mod(
  overrides: Partial<ModuloEstudoListRow> & Pick<ModuloEstudoListRow, 'modulo_slug'>,
): ModuloEstudoListRow {
  return {
    id: overrides.id ?? overrides.modulo_slug,
    modulo_slug: overrides.modulo_slug,
    modulo_nome: overrides.modulo_nome ?? 'Tópico',
    titulo_aula: overrides.titulo_aula ?? null,
    banca: overrides.banca ?? 'CESPE',
    created_at: overrides.created_at ?? '2026-01-01T00:00:00Z',
    avant_codigo: overrides.avant_codigo ?? null,
  };
}

function packById(id: string) {
  return CADERNO_PACKS.find((p) => p.id === id)!;
}

describe('lib/cadernos/resolvePacks', () => {
  it('filtra pack edital pela banca matriculada e some sem edital', () => {
    const modulos = [
      mod({ modulo_slug: 'e1', banca: 'CESPE', avant_codigo: 1 }),
      mod({ modulo_slug: 'e2', banca: 'CESPE', avant_codigo: 2 }),
      mod({ modulo_slug: 'e3', banca: 'CESPE', avant_codigo: 3 }),
      mod({ modulo_slug: 'e4', banca: 'CESPE', avant_codigo: 4 }),
      mod({ modulo_slug: 'e5', banca: 'CESPE', avant_codigo: 5 }),
      mod({ modulo_slug: 'f1', banca: 'FGV', avant_codigo: 6 }),
    ];

    const withEdital = resolvePacks({
      modulos,
      historico: [],
      editalBanca: 'CESPE',
      clonedByPackId: new Map(),
    });
    const editalPack = withEdital.find((p) => p.def.id === 'meu-edital');
    expect(editalPack).toBeDefined();
    expect(editalPack!.title).toBe('Meu edital — CESPE');
    expect(editalPack!.slugs.every((s) => s.startsWith('e'))).toBe(true);
    expect(editalPack!.slugs).not.toContain('f1');

    const withoutEdital = resolvePacks({
      modulos,
      historico: [],
      editalBanca: null,
      clonedByPackId: new Map(),
    });
    expect(withoutEdital.some((p) => p.def.id === 'meu-edital')).toBe(false);
  });

  it('esconde pack quando pool < minSize', () => {
    const imunDef = packById('imunizacao');
    const modulos = Array.from({ length: imunDef.minSize - 1 }, (_, i) =>
      mod({
        modulo_slug: `imun-${i}`,
        titulo_aula: 'Imunização',
        avant_codigo: i + 1,
      }),
    );

    const packs = resolvePacks({
      modulos,
      historico: [],
      editalBanca: null,
      clonedByPackId: new Map(),
    });

    expect(packs.some((p) => p.def.id === 'imunizacao')).toBe(false);
  });

  it('ordena slugs por avant_codigo asc e desempate por modulo_slug', () => {
    const modulos = [
      mod({ modulo_slug: 'z-late', titulo_aula: 'Imunização', avant_codigo: 30 }),
      mod({ modulo_slug: 'b-mid', titulo_aula: 'Imunização', avant_codigo: 10 }),
      mod({ modulo_slug: 'a-tie', titulo_aula: 'Imunização', avant_codigo: 10 }),
      mod({ modulo_slug: 'c-early', titulo_aula: 'Imunização', avant_codigo: 5 }),
      mod({ modulo_slug: 'd-null', titulo_aula: 'Imunização', avant_codigo: null }),
    ];

    const packs = resolvePacks({
      modulos,
      historico: [],
      editalBanca: null,
      clonedByPackId: new Map(),
    });
    const imun = packs.find((p) => p.def.id === 'imunizacao');
    expect(imun).toBeDefined();
    expect(imun!.slugs).toEqual(['c-early', 'a-tie', 'b-mid', 'z-late', 'd-null']);
  });

  it('resolve cta start / continue / review', () => {
    const modulos = Array.from({ length: 8 }, (_, i) =>
      mod({
        modulo_slug: `mix-${i}`,
        titulo_aula: 'Imunização',
        avant_codigo: i + 1,
      }),
    );

    const start = resolvePacks({
      modulos,
      historico: [],
      editalBanca: null,
      clonedByPackId: new Map(),
    }).find((p) => p.def.id === 'comece-10min');
    expect(start?.cta).toBe('start');
    expect(start?.clonedNotebookId).toBeNull();
    expect(start?.entrySlug).toBe('mix-0');
    expect(start?.estimatedMinutes).toBe(start!.slugs.length * MINUTES_PER_QUESTAO);

    const continueClone: ClonedPackNotebook = {
      id: 'nb-continue',
      studyEntrySlug: 'mix-3',
      studiedCount: 2,
      itemCount: 8,
    };
    const cont = resolvePacks({
      modulos,
      historico: [],
      editalBanca: null,
      clonedByPackId: new Map([['comece-10min', continueClone]]),
    }).find((p) => p.def.id === 'comece-10min');
    expect(cont?.cta).toBe('continue');
    expect(cont?.clonedNotebookId).toBe('nb-continue');
    expect(cont?.entrySlug).toBe('mix-3');

    const reviewClone: ClonedPackNotebook = {
      id: 'nb-review',
      studyEntrySlug: 'mix-0',
      studiedCount: 8,
      itemCount: 8,
    };
    const rev = resolvePacks({
      modulos,
      historico: [],
      editalBanca: null,
      clonedByPackId: new Map([['comece-10min', reviewClone]]),
    }).find((p) => p.def.id === 'comece-10min');
    expect(rev?.cta).toBe('review');
  });

  it('respeita PACK_MAX_SIZE mesmo com size maior no catálogo', () => {
    const modulos = Array.from({ length: PACK_MAX_SIZE + 5 }, (_, i) =>
      mod({
        modulo_slug: `big-${String(i).padStart(2, '0')}`,
        avant_codigo: i + 1,
      }),
    );

    // Temporarily exercise the cap via takePackSize path: mix size is 8, so also
    // assert the constant and that returned packs never exceed it.
    const packs = resolvePacks({
      modulos,
      historico: [],
      editalBanca: null,
      clonedByPackId: new Map(),
    });

    for (const pack of packs) {
      expect(pack.slugs.length).toBeLessThanOrEqual(PACK_MAX_SIZE);
      expect(pack.slugs.length).toBeLessThanOrEqual(pack.def.size);
    }
    expect(PACK_MAX_SIZE).toBe(30);
  });

  it('pack seus-erros só inclui slugs com acertou === false', () => {
    const modulos = [
      mod({ modulo_slug: 'ok-1', avant_codigo: 1 }),
      mod({ modulo_slug: 'err-1', avant_codigo: 2 }),
      mod({ modulo_slug: 'err-2', avant_codigo: 3 }),
      mod({ modulo_slug: 'err-3', avant_codigo: 4 }),
      mod({ modulo_slug: 'skip-1', avant_codigo: 5 }),
    ];

    const packs = resolvePacks({
      modulos,
      historico: [
        { modulo_slug: 'ok-1', acertou: true, estudo_reverso_concluido: true },
        { modulo_slug: 'err-1', acertou: false, estudo_reverso_concluido: true },
        { modulo_slug: 'err-2', acertou: false, estudo_reverso_concluido: false },
        { modulo_slug: 'err-3', acertou: false, estudo_reverso_concluido: null },
        { modulo_slug: 'skip-1', acertou: null, estudo_reverso_concluido: null },
      ],
      editalBanca: null,
      clonedByPackId: new Map(),
    });

    const erros = packs.find((p) => p.def.id === 'seus-erros');
    expect(erros).toBeDefined();
    expect(erros!.slugs).toEqual(['err-1', 'err-2', 'err-3']);
  });
});

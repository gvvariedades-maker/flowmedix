import { LpPageAdminCreateSchema, LpPageConfigSchema } from '@/lib/validations';
import { EMPTY_LP_CONFIG } from '@/lib/lp/formDefaults';

const validWalkthrough = { imagens: ['/lp/walkthrough/01.png'] };

describe('LpPageConfigSchema', () => {  it('aceita config mínima válida derivada do default', () => {
    const sample = {
      ...EMPTY_LP_CONFIG,
      walkthrough: validWalkthrough,
      concurso: {
        ...EMPTY_LP_CONFIG.concurso,
        cidade: 'Recife',
        banca: 'CESPE',
        nomeBanca: 'CESPE',
        orgao: 'Prefeitura',
      },
      copy: {
        ...EMPTY_LP_CONFIG.copy,
        headlinePrincipal: 'Headline teste',
        subtitulo: 'Subtítulo teste',
        dores: ['d1', 'd2', 'd3'] as [string, string, string],
        perigosBanca: ['p1', 'p2', 'p3'] as [string, string, string],
      },
    };
    expect(LpPageConfigSchema.safeParse(sample).success).toBe(true);
  });

  it('rejeita dores com menos de 3 itens', () => {
    const bad = {
      ...EMPTY_LP_CONFIG,
      copy: { ...EMPTY_LP_CONFIG.copy, dores: ['a', 'b'] },
    };
    expect(LpPageConfigSchema.safeParse(bad).success).toBe(false);
  });
});

describe('LpPageAdminCreateSchema', () => {
  it('exige path em kebab-case', () => {
    const base = {
      template_id: '00000000-0000-4000-8000-000000000001',
      path: 'recife-2026',
      internal_name: 'Recife',
      config: LpPageConfigSchema.parse({
        ...EMPTY_LP_CONFIG,
        walkthrough: validWalkthrough,
        concurso: {
          ...EMPTY_LP_CONFIG.concurso,
          cidade: 'Recife',
          banca: 'X',
          nomeBanca: 'X',
          orgao: 'Y',
        },
        copy: {
          ...EMPTY_LP_CONFIG.copy,
          headlinePrincipal: 'H',
          subtitulo: 'S',
          dores: ['1', '2', '3'],
          perigosBanca: ['1', '2', '3'],
        },
      }),
      seo: {
        title: 'T | AVANT enf',
        description: 'Desc',
      },
    };
    expect(LpPageAdminCreateSchema.safeParse(base).success).toBe(true);
    expect(LpPageAdminCreateSchema.safeParse({ ...base, path: 'Recife' }).success).toBe(false);
  });
});

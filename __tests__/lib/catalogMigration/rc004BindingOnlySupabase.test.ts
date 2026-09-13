import {
  createBindingOnlySupabaseApplySink,
  createBindingOnlySupabaseDataSource,
} from '@/lib/catalogMigration/rc004BindingOnlySupabase';

type EqCall = [column: string, value: unknown];

function mockSupabaseForCasUpdate(options: {
  selectData: { id: string }[] | null;
  selectError?: { message: string } | null;
}) {
  const eqCalls: EqCall[] = [];
  const chain: {
    eq: jest.Mock;
    select: jest.Mock;
  } = {
    eq: jest.fn((column: string, value: unknown) => {
      eqCalls.push([column, value]);
      return chain;
    }),
    select: jest.fn().mockResolvedValue({
      data: options.selectData,
      error: options.selectError ?? null,
    }),
  };

  const from = jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue(chain),
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        maybeSingle: jest.fn().mockResolvedValue({
          data: {
            id: 'row-1',
            modulo_slug: 'rc004-cas-audit-postgrest',
            titulo_aula: 'RC004 CAS Audit',
            conteudo_json: { x: 1, y: 2 },
          },
          error: null,
        }),
      }),
    }),
  });

  return { supabase: { from } as never, eqCalls, from };
}

describe('rc004BindingOnlySupabase', () => {
  it('serializa expected JSONB com JSON.stringify no filtro PostgREST eq', async () => {
    const { supabase, eqCalls } = mockSupabaseForCasUpdate({
      selectData: [{ id: 'row-1' }],
    });
    const sink = createBindingOnlySupabaseApplySink(supabase);
    const expected = { x: 1, y: 2 };

    const result = await sink.updateConteudoJsonCas({
      id: 'row-1',
      expectedConteudoJson: expected,
      nextConteudoJson: { rc004: 'bound', v: 1 },
    });

    expect(result.updated).toBe(true);
    const jsonEq = eqCalls.find(([column]) => column === 'conteudo_json');
    expect(jsonEq).toBeDefined();
    expect(typeof jsonEq![1]).toBe('string');
    expect(jsonEq![1]).toBe(JSON.stringify(expected));
  });

  it('preserva string JSON já serializada no filtro eq', async () => {
    const { supabase, eqCalls } = mockSupabaseForCasUpdate({
      selectData: [{ id: 'row-1' }],
    });
    const sink = createBindingOnlySupabaseApplySink(supabase);
    const expected = '{"y":2,"x":1}';

    await sink.updateConteudoJsonCas({
      id: 'row-1',
      expectedConteudoJson: expected,
      nextConteudoJson: { rc004: 'bound' },
    });

    const jsonEq = eqCalls.find(([column]) => column === 'conteudo_json');
    expect(jsonEq?.[1]).toBe(expected);
  });

  it('retorna updated=false quando zero rows (CAS conflict)', async () => {
    const { supabase } = mockSupabaseForCasUpdate({ selectData: [] });
    const sink = createBindingOnlySupabaseApplySink(supabase);

    const result = await sink.updateConteudoJsonCas({
      id: 'row-1',
      expectedConteudoJson: { stale: true },
      nextConteudoJson: { rc004: 'bound' },
    });

    expect(result.updated).toBe(false);
  });

  it('retorna updated=false em erro PostgREST', async () => {
    const { supabase } = mockSupabaseForCasUpdate({
      selectData: null,
      selectError: { message: 'invalid input syntax for type json' },
    });
    const sink = createBindingOnlySupabaseApplySink(supabase);

    const result = await sink.updateConteudoJsonCas({
      id: 'row-1',
      expectedConteudoJson: { x: 1 },
      nextConteudoJson: { y: 2 },
    });

    expect(result.updated).toBe(false);
    expect(result.error).toContain('invalid input syntax');
  });

  it('data source busca row por slug', async () => {
    const { supabase, from } = mockSupabaseForCasUpdate({ selectData: [] });
    const ds = createBindingOnlySupabaseDataSource(supabase);

    const row = await ds.fetchRowBySlug('rc004-cas-audit-postgrest');
    expect(from).toHaveBeenCalledWith('modulos_estudo');
    expect(row?.modulo_slug).toBe('rc004-cas-audit-postgrest');
  });
});

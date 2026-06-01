import {
  getProvaEvolucaoPorTitulo,
  normalizeTituloForEvolucao,
} from '@/lib/simulado/provaEvolucao';

describe('normalizeTituloForEvolucao', () => {
  it('normaliza trim, lower e remove sufixo de tentativa', () => {
    expect(normalizeTituloForEvolucao('  Prova IBFC — Tentativa 2  ')).toBe('prova ibfc');
    expect(normalizeTituloForEvolucao('Prova IBFC')).toBe('prova ibfc');
  });
});

describe('getProvaEvolucaoPorTitulo', () => {
  it('agrupa sessões concluídas de prova com mesmo título base', async () => {
    const supabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: [
                    {
                      id: '1',
                      titulo: 'Prova IBFC — tentativa 2',
                      modo: 'prova',
                      percentual_acerto: 72,
                      tempo_total_ms: 3_600_000,
                      concluida_em: '2026-06-02T00:00:00.000Z',
                      created_at: '2026-06-02T00:00:00.000Z',
                    },
                    {
                      id: '2',
                      titulo: 'Prova IBFC',
                      modo: 'prova',
                      percentual_acerto: 65,
                      tempo_total_ms: 4_200_000,
                      concluida_em: '2026-06-01T00:00:00.000Z',
                      created_at: '2026-06-01T00:00:00.000Z',
                    },
                    {
                      id: '3',
                      titulo: 'Treino geral',
                      filtros: { modo: 'treino' },
                      percentual_acerto: 80,
                      tempo_total_ms: 1_000_000,
                      concluida_em: '2026-06-01T00:00:00.000Z',
                      created_at: '2026-06-01T00:00:00.000Z',
                    },
                  ],
                  error: null,
                }),
              }),
            }),
          }),
        }),
      }),
    };

    const items = await getProvaEvolucaoPorTitulo(
      supabase as never,
      'user-1',
      'Prova IBFC',
      5,
    );

    expect(items).toHaveLength(2);
    expect(items[0]?.id).toBe('1');
    expect(items[1]?.id).toBe('2');
    expect(items[0]?.tempo_label).toBe('1h');
  });
});

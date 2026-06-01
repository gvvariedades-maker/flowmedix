import { buildSimuladoSessionDetail, resolveSessionMode } from '@/lib/simulado/sessionDetail';

describe('lib/simulado/sessionDetail', () => {
  it('resolveSessionMode retorna prova apenas quando filtros.modo é prova', () => {
    expect(resolveSessionMode({ modo: 'prova' })).toBe('prova');
    expect(resolveSessionMode({ modo: 'treino' })).toBe('treino');
    expect(resolveSessionMode({})).toBe('treino');
  });

  it('buildSimuladoSessionDetail monta sessão, resumo e questões', () => {
    const detail = buildSimuladoSessionDetail(
      {
        id: '11111111-1111-4111-8111-111111111111',
        status: 'aberto',
        total_questoes: 2,
        titulo: 'Treino · 2 questões',
        ritmo_meta_segundos_por_questao: null,
        prova_iniciada_em: null,
        filtros: { modo: 'treino', requested: 2 },
        created_at: '2026-05-27T00:00:00.000Z',
        concluida_em: null,
      },
      [
        {
          ordem: 1,
          modulo_slug: 'q1',
          opcao_id: 'A',
          opcao_correta_id: 'A',
          acertou: true,
          respondida_em: '2026-05-27T00:00:00.000Z',
          tempo_ms: 1000,
          modulos_estudo: {
            banca: 'FGV',
            modulo_nome: 'Urgências',
            titulo_aula: 'RCP',
          },
        },
        {
          ordem: 2,
          modulo_slug: 'q2',
          opcao_id: null,
          opcao_correta_id: null,
          acertou: null,
          respondida_em: null,
          tempo_ms: null,
          modulos_estudo: null,
        },
      ],
    );

    expect(detail.session.modo).toBe('treino');
    expect(detail.session.titulo).toBe('Treino · 2 questões');
    expect(detail.session.ritmo_meta_segundos_por_questao).toBeNull();
    expect(detail.session.prova_iniciada_em).toBeNull();
    expect(detail.resumo.respondidas).toBe(1);
    expect(detail.resumo.pendentes).toBe(1);
    expect(detail.questoes).toHaveLength(2);
    expect(detail.questoes[0]).toMatchObject({
      ordem: 1,
      respondida: true,
      acertou: true,
      meta: { banca: 'FGV', topico: 'Urgências', subtopico: 'RCP' },
    });
    expect(detail.questoes[1]).toMatchObject({
      ordem: 2,
      respondida: false,
      modulo_slug: 'q2',
    });
  });
});

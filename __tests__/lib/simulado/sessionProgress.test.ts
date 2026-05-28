import {
  buildSimuladoQuestaoRespondida,
  computeSimuladoResumo,
  extractQuestaoMetaFromModulo,
} from '@/lib/simulado/sessionProgress';

describe('lib/simulado/sessionProgress', () => {
  it('extrai meta de módulo embutido ou array', () => {
    expect(
      extractQuestaoMetaFromModulo({
        banca: 'FGV',
        modulo_nome: 'Urgências',
        titulo_aula: 'RCP',
      }),
    ).toEqual({
      banca: 'FGV',
      topico: 'Urgências',
      subtopico: 'RCP',
    });

    expect(
      extractQuestaoMetaFromModulo([
        { banca: 'CESPE', modulo_nome: 'Ética', titulo_aula: 'Deontologia' },
      ]),
    ).toEqual({
      banca: 'CESPE',
      topico: 'Ética',
      subtopico: 'Deontologia',
    });
  });

  it('calcula resumo com percentual e tempos médios', () => {
    const resumo = computeSimuladoResumo(
      [
        {
          ordem: 1,
          modulo_slug: 'q1',
          opcao_id: 'A',
          opcao_correta_id: 'A',
          acertou: true,
          respondida_em: '2026-05-27T00:00:00.000Z',
          tempo_ms: 30000,
        },
        {
          ordem: 2,
          modulo_slug: 'q2',
          opcao_id: 'B',
          opcao_correta_id: 'C',
          acertou: false,
          respondida_em: '2026-05-27T00:01:00.000Z',
          tempo_ms: 60000,
        },
        {
          ordem: 3,
          modulo_slug: 'q3',
          opcao_id: null,
          opcao_correta_id: null,
          acertou: null,
          respondida_em: null,
          tempo_ms: null,
        },
      ],
      5,
    );

    expect(resumo).toEqual({
      respondidas: 2,
      pendentes: 3,
      acertos: 1,
      erros: 1,
      percentual_acerto: 50,
      tempo_total_ms: 90000,
      tempo_medio_ms: 45000,
    });
  });

  it('oculta gabarito em prova com sessão aberta', () => {
    const questao = buildSimuladoQuestaoRespondida(
      {
        ordem: 2,
        modulo_slug: 'questao-b',
        opcao_id: 'A',
        opcao_correta_id: 'B',
        acertou: false,
        respondida_em: '2026-05-27T00:00:00.000Z',
        tempo_ms: 12000,
        modulos_estudo: { banca: 'FGV', modulo_nome: 'Urgências', titulo_aula: 'RCP' },
      },
      { sessionMode: 'prova', sessionStatus: 'aberto' },
    );

    expect(questao.acertou).toBe(false);
    expect(questao.opcao_correta_id).toBeNull();
    expect(questao.opcao_id).toBe('A');
  });

  it('revela gabarito em prova quando sessão concluída', () => {
    const questao = buildSimuladoQuestaoRespondida(
      {
        ordem: 1,
        modulo_slug: 'questao-a',
        opcao_id: 'A',
        opcao_correta_id: 'B',
        acertou: false,
        respondida_em: '2026-05-27T00:00:00.000Z',
        tempo_ms: 8000,
      },
      { sessionMode: 'prova', sessionStatus: 'concluido' },
    );

    expect(questao.acertou).toBe(false);
    expect(questao.opcao_correta_id).toBe('B');
  });
});

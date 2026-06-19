import {
  agruparDesempenhoPorEixo,
  applyAdaptiveIncentivoMessages,
  buildConclusaoIncentivos,
  buildStreakIncentivo,
  computeDominiosPegadinhas,
  computeEixosEvolucao,
  computeSemanasConsecutivasSimulado,
  resolveConclusaoMetaParams,
} from '@/lib/simulado/conclusaoMotivacional';
import type { SimuladoQuestaoItem } from '@/lib/simulado/types';

function questao(
  partial: Partial<SimuladoQuestaoItem> & {
    ordem: number;
    acertou?: boolean;
    respondida?: boolean;
    subtopico?: string;
  },
): SimuladoQuestaoItem {
  const respondida = partial.respondida !== false;
  const base = {
    ordem: partial.ordem,
    modulo_slug: partial.modulo_slug ?? `slug-${partial.ordem}`,
    meta: partial.meta ?? {
      banca: 'FGV',
      topico: 'Farmacologia',
      subtopico: partial.subtopico ?? 'Farmacodinâmica e Farmacocinética',
    },
  };

  if (!respondida) {
    return { ...base, respondida: false as const };
  }

  return {
    ...base,
    respondida: true as const,
    acertou: partial.acertou ?? true,
    opcao_id: 'A',
    opcao_correta_id: 'A',
    respondida_em: '2026-06-01T10:00:00.000Z',
    tempo_ms: 30_000,
  };
}

describe('agruparDesempenhoPorEixo', () => {
  it('calcula percentual por eixo', () => {
    const resultado = agruparDesempenhoPorEixo([
      questao({ ordem: 1, subtopico: 'Imunização', acertou: true }),
      questao({ ordem: 2, subtopico: 'Imunização', acertou: false }),
      questao({ ordem: 3, subtopico: 'Imunização', acertou: true }),
    ]);

    expect(resultado).toEqual([
      expect.objectContaining({
        eixo: 'Imunização',
        acertos: 2,
        erros: 1,
        total: 3,
        percentual_acerto: 67,
      }),
    ]);
  });
});

describe('computeEixosEvolucao', () => {
  it('destaca eixos com melhora significativa', () => {
    const evolucao = computeEixosEvolucao(
      [
        {
          eixo: 'Farmacologia',
          acertos: 3,
          erros: 1,
          total: 4,
          percentual_acerto: 75,
        },
      ],
      [
        {
          eixo: 'Farmacologia',
          acertos: 2,
          total: 5,
          percentual_acerto: 40,
        },
      ],
    );

    expect(evolucao).toHaveLength(1);
    expect(evolucao[0]).toMatchObject({
      eixo: 'Farmacologia',
      percentual_anterior: 40,
      percentual_atual: 75,
      delta_pontos: 35,
    });
    expect(evolucao[0]!.mensagem).toContain('Farmacologia');
    expect(evolucao[0]!.mensagem).toContain('40%');
    expect(evolucao[0]!.mensagem).toContain('75%');
  });

  it('ignora histórico insuficiente', () => {
    const evolucao = computeEixosEvolucao(
      [
        {
          eixo: 'Farmacologia',
          acertos: 4,
          erros: 0,
          total: 4,
          percentual_acerto: 100,
        },
      ],
      [
        {
          eixo: 'Farmacologia',
          acertos: 1,
          total: 2,
          percentual_acerto: 50,
        },
      ],
      { minHistoricoTotal: 5 },
    );

    expect(evolucao).toEqual([]);
  });
});

describe('computeDominiosPegadinhas', () => {
  it('conta acertos em eixos historicamente fracos', () => {
    const dominios = computeDominiosPegadinhas(
      [
        questao({ ordem: 1, subtopico: 'Imunização', acertou: true }),
        questao({ ordem: 2, subtopico: 'Imunização', acertou: true }),
        questao({ ordem: 3, subtopico: 'Imunização', acertou: true }),
      ],
      [
        {
          eixo: 'Imunização',
          total_questoes: 10,
          taxa_erro: 60,
        },
      ],
    );

    expect(dominios).toEqual([
      {
        eixo: 'Imunização',
        quantidade: 3,
        mensagem: 'Você dominou 3 pegadinhas que costumava errar em Imunização!',
      },
    ]);
  });
});

describe('computeSemanasConsecutivasSimulado', () => {
  it('conta semanas consecutivas a partir da semana atual', () => {
    const now = new Date('2026-06-18T12:00:00.000Z');
    const previousWeekDate = new Date(now.getTime() - 7 * 86_400_000);

    const streak = computeSemanasConsecutivasSimulado(
      [now.toISOString(), previousWeekDate.toISOString()],
      now,
    );

    expect(streak).toBe(2);
  });
});

describe('buildStreakIncentivo', () => {
  it('prioriza streak semanal', () => {
    const streak = buildStreakIncentivo({
      streak_atual_dias: 5,
      semanas_consecutivas: 3,
      meta_semanal_atingida: true,
    });

    expect(streak.badge).toBe('streak_semanas');
    expect(streak.mensagem).toContain('3 semanas');
  });

  it('celebra meta semanal quando não há streak semanal', () => {
    const streak = buildStreakIncentivo({
      streak_atual_dias: 1,
      semanas_consecutivas: 1,
      meta_semanal_atingida: true,
    });

    expect(streak.badge).toBe('meta_semanal');
  });
});

describe('buildConclusaoIncentivos', () => {
  it('monta pacote completo de incentivos', () => {
    const questoes = [
      questao({ ordem: 1, subtopico: 'Farmacologia', acertou: true }),
      questao({ ordem: 2, subtopico: 'Farmacologia', acertou: true }),
      questao({ ordem: 3, subtopico: 'Farmacologia', acertou: true }),
      questao({ ordem: 4, subtopico: 'Farmacologia', acertou: false }),
    ];

    const incentivos = buildConclusaoIncentivos({
      questoes,
      historicoEixos: [
        {
          eixo: 'Farmacologia',
          acertos: 2,
          total: 6,
          percentual_acerto: 33,
        },
      ],
      padroesErro: [
        {
          eixo: 'Imunização',
          total_questoes: 8,
          taxa_erro: 50,
        },
      ],
      streak_atual_dias: 4,
      semanas_consecutivas: 2,
      meta_semanal_atingida: false,
    });

    expect(incentivos.eixos_evolucao.length).toBeGreaterThan(0);
    expect(incentivos.streak.badge).toBe('streak_semanas');
    expect(incentivos.mensagens_destaque.length).toBeGreaterThan(0);
  });
});

describe('resolveConclusaoMetaParams', () => {
  const now = new Date('2026-06-18T12:00:00.000Z');
  const previousWeek = new Date(now.getTime() - 7 * 86_400_000);

  it('weekly: marca meta semanal e conta streak só de missões', () => {
    const result = resolveConclusaoMetaParams({
      sessionKind: 'weekly',
      sessions: [
        {
          concluida_em: now.toISOString(),
          created_at: now.toISOString(),
          filtros: { origem: 'weekly', iso_week: 25 },
        },
        {
          concluida_em: previousWeek.toISOString(),
          created_at: previousWeek.toISOString(),
          filtros: { origem: 'weekly', iso_week: 24 },
        },
        {
          concluida_em: now.toISOString(),
          created_at: now.toISOString(),
          filtros: { modo: 'prova' },
        },
      ],
      now,
    });

    expect(result.meta_semanal_atingida).toBe(true);
    expect(result.semanas_consecutivas).toBe(2);
  });

  it('diagnostico: não aplica meta semanal genérica', () => {
    const result = resolveConclusaoMetaParams({
      sessionKind: 'diagnostico',
      sessions: [
        {
          concluida_em: now.toISOString(),
          created_at: now.toISOString(),
          filtros: { tipo: 'diagnostico_inicial' },
        },
      ],
      now,
    });

    expect(result.meta_semanal_atingida).toBe(false);
    expect(result.semanas_consecutivas).toBe(0);
  });

  it('livre: mantém meta de 3 simulados em 7 dias', () => {
    const result = resolveConclusaoMetaParams({
      sessionKind: 'livre',
      sessions: Array.from({ length: 3 }, (_, index) => ({
        concluida_em: new Date(now.getTime() - index * 86_400_000).toISOString(),
        created_at: now.toISOString(),
        filtros: { modo: 'prova' },
      })),
      now,
    });

    expect(result.meta_semanal_atingida).toBe(true);
  });
});

describe('applyAdaptiveIncentivoMessages', () => {
  const baseIncentivos = buildConclusaoIncentivos({
    questoes: [questao({ ordem: 1 })],
    historicoEixos: [],
    padroesErro: [],
    streak_atual_dias: 2,
    semanas_consecutivas: 1,
    meta_semanal_atingida: true,
  });

  it('weekly: destaca missão concluída', () => {
    const result = applyAdaptiveIncentivoMessages('weekly', baseIncentivos);

    expect(result.streak.meta_semanal_atingida).toBe(true);
    expect(result.streak.badge).toBe('meta_semanal');
    expect(result.mensagens_destaque[0]).toBe('Missão da semana concluída');
    expect(result.streak.mensagem).toContain('Missão da semana concluída');
  });

  it('diagnostico: mensagem de baseline sem meta semanal', () => {
    const result = applyAdaptiveIncentivoMessages('diagnostico', baseIncentivos);

    expect(result.streak.meta_semanal_atingida).toBe(false);
    expect(result.streak.badge).toBeNull();
    expect(result.mensagens_destaque[0]).toContain('mapa de partida');
  });
});

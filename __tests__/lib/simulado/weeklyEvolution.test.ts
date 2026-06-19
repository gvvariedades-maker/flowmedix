import {
  buildWeeklyMissionEvolution,
  getPreviousIsoWeek,
} from '@/lib/simulado/weeklyEvolution';
import type { SimuladoQuestaoItem } from '@/lib/simulado/types';

const questao = (
  subtopico: string,
  acertou: boolean,
  ordem: number,
): SimuladoQuestaoItem => ({
  ordem,
  modulo_slug: `q-${ordem}`,
  respondida: true,
  meta: { banca: 'IBFC', topico: 'Procedimentos', subtopico },
  acertou,
  opcao_id: acertou ? 'A' : 'B',
  opcao_correta_id: 'A',
  respondida_em: '2026-06-01T10:00:00.000Z',
  tempo_ms: 30_000,
});

describe('getPreviousIsoWeek', () => {
  it('decrementa semana dentro do mesmo ano', () => {
    const prev = getPreviousIsoWeek(2026, 25);
    expect(prev.isoYear).toBe(2026);
    expect(prev.isoWeek).toBe(24);
  });

  it('faz rollover na semana 1', () => {
    const prev = getPreviousIsoWeek(2026, 1);
    expect(prev.isoYear).toBe(2025);
    expect(prev.isoWeek).toBeGreaterThanOrEqual(51);
  });
});

describe('buildWeeklyMissionEvolution', () => {
  it('retorna mensagem vazia na primeira missão', () => {
    const result = buildWeeklyMissionEvolution({
      isoWeekAtual: 25,
      isoWeekAnterior: null,
      percentualAtual: 70,
      percentualAnterior: null,
      currentQuestoes: [questao('Farmacologia', true, 1)],
      previousQuestoes: [],
      hasPrevious: false,
    });

    expect(result.has_previous).toBe(false);
    expect(result.mensagem_vazia).toContain('Primeira missão');
    expect(result.eixos_destaque).toHaveLength(0);
  });

  it('compara acerto global e eixos com missão anterior', () => {
    const currentQuestoes = [
      questao('Farmacologia', true, 1),
      questao('Farmacologia', true, 2),
      questao('Urgências', false, 3),
    ];
    const previousQuestoes = [
      questao('Farmacologia', true, 1),
      questao('Farmacologia', false, 2),
      questao('Urgências', false, 3),
    ];

    const result = buildWeeklyMissionEvolution({
      isoWeekAtual: 25,
      isoWeekAnterior: 24,
      percentualAtual: 67,
      percentualAnterior: 33,
      currentQuestoes,
      previousQuestoes,
      hasPrevious: true,
    });

    expect(result.has_previous).toBe(true);
    expect(result.delta_global).toBe(34);
    expect(result.iso_week_anterior).toBe(24);
    expect(result.eixos_destaque.length).toBeGreaterThan(0);
    expect(result.eixos_destaque[0]?.direction).toMatch(/up|down/);
  });
});

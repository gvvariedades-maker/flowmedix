import { applyAnswerPatch } from '@/lib/simulado/applyAnswerPatch';
import type { SimuladoSessionDetailResponse } from '@/lib/simulado/types';

const baseSession: SimuladoSessionDetailResponse = {
  session: {
    id: '44444444-4444-4444-4444-444444444444',
    status: 'aberto',
    modo: 'treino',
    titulo: '',
    ritmo_meta_segundos_por_questao: null,
    prova_iniciada_em: null,
    total_questoes: 2,
    filtros: {},
    created_at: '2026-05-27T00:00:00.000Z',
    concluida_em: null,
  },
  resumo: {
    respondidas: 0,
    pendentes: 2,
    acertos: 0,
    erros: 0,
    percentual_acerto: 0,
    tempo_total_ms: 0,
    tempo_medio_ms: 0,
  },
  questoes: [
    {
      ordem: 1,
      modulo_slug: 'q1',
      respondida: false,
      meta: { banca: 'FGV', topico: 'A', subtopico: 'B' },
    },
    {
      ordem: 2,
      modulo_slug: 'q2',
      respondida: false,
      meta: { banca: 'FGV', topico: 'A', subtopico: 'B' },
    },
  ],
};

describe('applyAnswerPatch', () => {
  it('atualiza questão, resumo e status da sessão', () => {
    const patched = applyAnswerPatch(baseSession, {
      session_status: 'aberto',
      resumo: {
        respondidas: 1,
        pendentes: 1,
        acertos: 1,
        erros: 0,
        percentual_acerto: 100,
        tempo_total_ms: 5000,
        tempo_medio_ms: 5000,
      },
      questao_atualizada: {
        ordem: 1,
        modulo_slug: 'q1',
        respondida: true,
        meta: { banca: 'FGV', topico: 'A', subtopico: 'B' },
        acertou: true,
        opcao_id: 'A',
        opcao_correta_id: 'A',
        respondida_em: '2026-05-27T00:01:00.000Z',
        tempo_ms: 5000,
      },
    });

    expect(patched.resumo.respondidas).toBe(1);
    expect(patched.questoes[0]).toMatchObject({ respondida: true, opcao_id: 'A' });
    expect(patched.questoes[1].respondida).toBe(false);
    expect(patched.session.status).toBe('aberto');
  });

  it('marca sessão concluída com concluida_em quando aplicável', () => {
    const patched = applyAnswerPatch(baseSession, {
      session_status: 'concluido',
      resumo: {
        respondidas: 2,
        pendentes: 0,
        acertos: 2,
        erros: 0,
        percentual_acerto: 100,
        tempo_total_ms: 10000,
        tempo_medio_ms: 5000,
      },
      questao_atualizada: {
        ordem: 2,
        modulo_slug: 'q2',
        respondida: true,
        meta: { banca: 'FGV', topico: 'A', subtopico: 'B' },
        acertou: true,
        opcao_id: 'B',
        opcao_correta_id: 'B',
        respondida_em: '2026-05-27T00:02:00.000Z',
        tempo_ms: 5000,
      },
    });

    expect(patched.session.status).toBe('concluido');
    expect(patched.session.concluida_em).toMatch(/^\d{4}-/);
  });
});

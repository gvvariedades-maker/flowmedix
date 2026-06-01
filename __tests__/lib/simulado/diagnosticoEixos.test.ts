import {
  agruparErrosPorEixo,
  buildDiagnosticoRodape,
  resolveDiagnosticoBancaLabel,
  resolveEixoTematico,
} from '@/lib/simulado/diagnosticoEixos';
import type { SimuladoQuestaoItem } from '@/lib/simulado/types';

function questao(
  partial: Partial<SimuladoQuestaoItem> & {
    ordem: number;
    acertou?: boolean;
    respondida?: boolean;
  },
): SimuladoQuestaoItem {
  const respondida = partial.respondida !== false;
  const base = {
    ordem: partial.ordem,
    modulo_slug: partial.modulo_slug ?? `slug-${partial.ordem}`,
    meta: partial.meta ?? {
      banca: 'FGV',
      topico: 'Urgências',
      subtopico: 'RCP',
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

describe('resolveEixoTematico', () => {
  it('prioriza subtopico sobre topico', () => {
    expect(
      resolveEixoTematico({
        banca: 'FGV',
        topico: 'Especialidades',
        subtopico: 'Saúde da Mulher',
      }),
    ).toBe('Saúde da Mulher');
  });

  it('usa topico quando subtopico ausente', () => {
    expect(
      resolveEixoTematico({
        banca: 'FGV',
        topico: 'Epidemiologia',
        subtopico: null,
      }),
    ).toBe('Epidemiologia');
  });
});

describe('agruparErrosPorEixo', () => {
  it('agrupa erros por subtopico e ordena do pior para o melhor', () => {
    const resultado = agruparErrosPorEixo([
      questao({ ordem: 1, meta: { banca: 'FGV', topico: 'A', subtopico: 'Saúde da Mulher' }, acertou: false }),
      questao({ ordem: 2, meta: { banca: 'FGV', topico: 'A', subtopico: 'Saúde da Mulher' }, acertou: false }),
      questao({ ordem: 3, meta: { banca: 'FGV', topico: 'B', subtopico: 'Epidemiologia' }, acertou: false }),
      questao({ ordem: 4, meta: { banca: 'FGV', topico: 'B', subtopico: 'Epidemiologia' }, acertou: true }),
      questao({ ordem: 5, meta: { banca: 'FGV', topico: 'C', subtopico: 'Ética' }, acertou: true }),
    ]);

    expect(resultado).toEqual([
      { eixo: 'Saúde da Mulher', erros: 2, total: 2 },
      { eixo: 'Epidemiologia', erros: 1, total: 2 },
    ]);
  });

  it('limita a 3 eixos e ignora questões não respondidas', () => {
    const resultado = agruparErrosPorEixo([
      questao({ ordem: 1, meta: { banca: null, topico: null, subtopico: 'A' }, acertou: false }),
      questao({ ordem: 2, meta: { banca: null, topico: null, subtopico: 'B' }, acertou: false }),
      questao({ ordem: 3, meta: { banca: null, topico: null, subtopico: 'C' }, acertou: false }),
      questao({ ordem: 4, meta: { banca: null, topico: null, subtopico: 'D' }, acertou: false }),
      questao({ ordem: 5, respondida: false }),
    ]);

    expect(resultado).toHaveLength(3);
    expect(resultado.every((item) => item.erros > 0)).toBe(true);
  });

  it('retorna vazio quando não há erros', () => {
    expect(
      agruparErrosPorEixo([
        questao({ ordem: 1, acertou: true }),
        questao({ ordem: 2, acertou: true }),
      ]),
    ).toEqual([]);
  });
});

describe('resolveDiagnosticoBancaLabel', () => {
  it('usa banca única do filtro da sessão', () => {
    expect(
      resolveDiagnosticoBancaLabel({ bancas: ['IDECAN'] }, [
        questao({ ordem: 1, meta: { banca: 'FGV', topico: 'A', subtopico: 'B' } }),
      ]),
    ).toBe('IDECAN');
  });

  it('infere banca dominante das questões respondidas', () => {
    expect(
      resolveDiagnosticoBancaLabel(
        {},
        [
          questao({ ordem: 1, meta: { banca: 'IDECAN', topico: 'A', subtopico: 'B' }, acertou: false }),
          questao({ ordem: 2, meta: { banca: 'IDECAN', topico: 'A', subtopico: 'C' }, acertou: false }),
          questao({ ordem: 3, meta: { banca: 'FGV', topico: 'A', subtopico: 'D' }, acertou: true }),
        ],
      ),
    ).toBe('IDECAN');
  });
});

describe('buildDiagnosticoRodape', () => {
  it('personaliza rodapé com banca quando disponível', () => {
    expect(buildDiagnosticoRodape('IDECAN')).toContain('IDECAN');
  });

  it('usa texto genérico sem banca', () => {
    expect(buildDiagnosticoRodape(null)).toBe('Esses são os eixos com mais erros neste simulado.');
  });
});

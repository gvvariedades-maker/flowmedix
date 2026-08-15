import {
  areasComPresencaNoMapa,
  pickLowestRiskBand,
  pickPriorityAreas,
  summarizeAreaMap,
} from '@/lib/desempenho/homePicks';
import type { AreaPerformance, AssuntoPerformance, RiskBandPerformance } from '@/lib/desempenho/types';
import type { GrandeAreaId, RiskBandId } from '@/lib/desempenho/taxonomiaEnfermagem';

function assunto(overrides: Partial<AssuntoPerformance> = {}): AssuntoPerformance {
  return {
    tituloAula: overrides.tituloAula ?? 'Assunto',
    canonicalSubtopico: 'Assunto',
    areaId: 'farmacologia',
    areaLabel: 'Farmacologia e Medicamentos',
    riskBandId: 'alta_incidencia_protocolo',
    disciplina: 'enfermagem',
    respondidas: 6,
    acertos: 3,
    erros: 3,
    percentual: 50,
    coberturaPct: 40,
    totalDisponivel: 15,
    ultimaPratica: null,
    amostraSuficiente: true,
    confidenceId: 'evidencia_moderada',
    errosSemReverso: 0,
    bancas: ['CPCON'],
    ...overrides,
  };
}

function area(
  areaId: GrandeAreaId,
  areaLabel: string,
  overrides: Partial<AreaPerformance> = {},
): AreaPerformance {
  const respondidas = overrides.respondidas ?? 6;
  const acertos = overrides.acertos ?? 3;
  const amostraSuficiente = overrides.amostraSuficiente ?? respondidas >= 5;
  const percentual =
    overrides.percentual !== undefined
      ? overrides.percentual
      : amostraSuficiente
        ? Math.round((acertos / respondidas) * 100)
        : null;
  return {
    areaId,
    areaLabel,
    riskBandId: 'alta_incidencia_protocolo',
    respondidas,
    acertos,
    erros: respondidas - acertos,
    percentual,
    coberturaPct: 40,
    totalDisponivel: 15,
    amostraSuficiente,
    confidenceId: amostraSuficiente ? 'evidencia_moderada' : 'tendencia_inicial',
    assuntos: [
      assunto({
        areaId,
        areaLabel,
        tituloAula: areaLabel,
        respondidas,
        acertos,
        erros: respondidas - acertos,
        percentual,
        amostraSuficiente,
      }),
    ],
    ...overrides,
  };
}

function band(
  riskBandId: RiskBandId,
  label: string,
  overrides: Partial<RiskBandPerformance> = {},
): RiskBandPerformance {
  const respondidas = overrides.respondidas ?? 6;
  const acertos = overrides.acertos ?? 3;
  const amostraSuficiente = overrides.amostraSuficiente ?? respondidas >= 5;
  return {
    riskBandId,
    label,
    respondidas,
    acertos,
    erros: respondidas - acertos,
    percentual: amostraSuficiente ? Math.round((acertos / respondidas) * 100) : null,
    coberturaPct: 40,
    totalDisponivel: 15,
    amostraSuficiente,
    confidenceId: amostraSuficiente ? 'evidencia_moderada' : 'tendencia_inicial',
    ...overrides,
  };
}

describe('pickPriorityAreas', () => {
  it('escolhe as 3 piores com amostra ≥ 5, não a ordem taxonômica', () => {
    const picked = pickPriorityAreas([
      area('fundamentos_bases', 'Fundamentos e Bases', {
        respondidas: 10,
        acertos: 9,
        percentual: 90,
      }),
      area('farmacologia', 'Farmacologia e Medicamentos', {
        respondidas: 8,
        acertos: 2,
        percentual: 25,
      }),
      area('procedimentos', 'Procedimentos de Enfermagem', {
        respondidas: 6,
        acertos: 3,
        percentual: 50,
      }),
      area('biosseguranca', 'Biossegurança e Controle de Infecção', {
        respondidas: 7,
        acertos: 2,
        percentual: 29,
      }),
      area('saude_publica', 'Saúde Pública e Epidemiologia', {
        respondidas: 12,
        acertos: 8,
        percentual: 67,
      }),
    ]);

    expect(picked.priority.map((item) => item.areaId)).toEqual([
      'farmacologia',
      'biosseguranca',
      'procedimentos',
    ]);
    expect(picked.rest.map((item) => item.areaId)).toEqual([
      'fundamentos_bases',
      'saude_publica',
    ]);
  });

  it('completa com maior volume quando não há 3 amostras suficientes', () => {
    const picked = pickPriorityAreas([
      area('farmacologia', 'Farmacologia e Medicamentos', {
        respondidas: 8,
        acertos: 2,
        percentual: 25,
        amostraSuficiente: true,
      }),
      area('procedimentos', 'Procedimentos de Enfermagem', {
        respondidas: 4,
        acertos: 1,
        percentual: null,
        amostraSuficiente: false,
      }),
      area('biosseguranca', 'Biossegurança e Controle de Infecção', {
        respondidas: 3,
        acertos: 1,
        percentual: null,
        amostraSuficiente: false,
      }),
      area('saude_publica', 'Saúde Pública e Epidemiologia', {
        respondidas: 2,
        acertos: 1,
        percentual: null,
        amostraSuficiente: false,
      }),
    ]);

    expect(picked.priority.map((item) => item.areaId)).toEqual([
      'farmacologia',
      'procedimentos',
      'biosseguranca',
    ]);
    expect(picked.rest.map((item) => item.areaId)).toEqual(['saude_publica']);
  });

  it('nunca promove área com 1 questão como prioridade', () => {
    const picked = pickPriorityAreas([
      area('farmacologia', 'Farmacologia e Medicamentos', {
        respondidas: 6,
        acertos: 2,
        percentual: 33,
      }),
      area('saude_publica', 'Saúde Pública e Epidemiologia', {
        respondidas: 5,
        acertos: 5,
        percentual: 100,
      }),
      area('doencas_transmissiveis', 'Doenças Transmissíveis', {
        respondidas: 1,
        acertos: 0,
        percentual: null,
        amostraSuficiente: false,
        confidenceId: 'dados_iniciais',
      }),
    ]);

    expect(picked.priority.map((item) => item.areaId)).toEqual([
      'farmacologia',
      'saude_publica',
    ]);
    expect(picked.rest.map((item) => item.areaId)).toEqual(['doencas_transmissiveis']);
  });

  it('empata o % pelo maior volume e depois pelo rótulo', () => {
    const picked = pickPriorityAreas([
      area('procedimentos', 'Procedimentos de Enfermagem', {
        respondidas: 5,
        acertos: 2,
        percentual: 40,
      }),
      area('biosseguranca', 'Biossegurança e Controle de Infecção', {
        respondidas: 10,
        acertos: 4,
        percentual: 40,
      }),
      area('farmacologia', 'Farmacologia e Medicamentos', {
        respondidas: 5,
        acertos: 2,
        percentual: 40,
      }),
    ]);

    expect(picked.priority.map((item) => item.areaId)).toEqual([
      'biosseguranca',
      'farmacologia',
      'procedimentos',
    ]);
    expect(picked.rest).toEqual([]);
  });
});

describe('summarizeAreaMap', () => {
  it('conta áreas visíveis e as com amostra suficiente', () => {
    const summary = summarizeAreaMap([
      area('farmacologia', 'Farmacologia e Medicamentos', { respondidas: 6 }),
      area('saude_publica', 'Saúde Pública e Epidemiologia', {
        respondidas: 1,
        amostraSuficiente: false,
        percentual: null,
      }),
      area('outros', 'Outros', {
        respondidas: 0,
        totalDisponivel: 0,
        assuntos: [assunto({ respondidas: 0, totalDisponivel: 0 })],
      }),
    ]);

    expect(summary).toEqual({ total: 2, comDiagnostico: 1 });
  });
});

describe('areasComPresencaNoMapa', () => {
  it('esconde área só com assunto vazio', () => {
    expect(
      areasComPresencaNoMapa([
        area('outros', 'Outros', {
          assuntos: [assunto({ respondidas: 0, totalDisponivel: 0 })],
        }),
      ]),
    ).toEqual([]);
  });
});

describe('pickLowestRiskBand', () => {
  it('escolhe a faixa de menor % com amostra suficiente', () => {
    const pior = pickLowestRiskBand([
      band('alta_incidencia_protocolo', 'Protocolo e rotina assistencial', {
        percentual: 70,
        acertos: 7,
        respondidas: 10,
      }),
      band('clinico_critico', 'Clínico crítico', {
        percentual: 30,
        acertos: 3,
        respondidas: 10,
      }),
      band('bases', 'Bases', { percentual: 90, acertos: 9, respondidas: 10 }),
    ]);
    expect(pior?.riskBandId).toBe('clinico_critico');
  });

  it('não afirma fraqueza com 1 questão', () => {
    expect(
      pickLowestRiskBand([
        band('outros', 'Outros', {
          respondidas: 1,
          acertos: 0,
          amostraSuficiente: false,
          percentual: null,
        }),
      ]),
    ).toBeNull();
  });
});

import {
  DEEPENING_BY_SUBTOPICO,
} from '@/lib/guidelines/deepeningPlan';
import {
  GUIDELINE_TABLES,
  SUBTOPICO_GUIDELINE_IDS,
  getGuidelineForSubtopico,
} from '@/lib/guidelines';

const CANONICAL_COUNT = 41;

describe('guideline coverage', () => {
  it('todas as 41 subtópicos canônicos têm guideline mapeada', () => {
    expect(Object.keys(SUBTOPICO_GUIDELINE_IDS).length).toBeGreaterThanOrEqual(CANONICAL_COUNT);
  });

  it('cada tabela tem pelo menos 10 entries', () => {
    for (const [, table] of Object.entries(GUIDELINE_TABLES)) {
      expect(table.entries.length).toBeGreaterThanOrEqual(10);
    }
  });

  it('subtópicos mesclados retornam guideline mesclada', () => {
    const transmissiveis = getGuidelineForSubtopico(
      'Outras Doenças e Questões Mescladas sobre Doenças Transmissíveis',
    );
    expect(transmissiveis).not.toBeNull();
    expect(transmissiveis!.entries.length).toBeGreaterThanOrEqual(40);

    const agudas = getGuidelineForSubtopico('Questões Mescladas e Outras Doenças Agudas');
    expect(agudas).not.toBeNull();
    expect(agudas!.entries.length).toBeGreaterThanOrEqual(30);
  });

  it('Imunização mescla intervalos + calendário PNI (Fase 1)', () => {
    const g = getGuidelineForSubtopico('Imunização');
    expect(g).not.toBeNull();
    expect(g!.entries.length).toBeGreaterThanOrEqual(90);
    expect(g!.id).toContain('pni');
  });

  it('Sinais Vitais atinge meta Fase 1', () => {
    const g = getGuidelineForSubtopico('Verificação de Sinais Vitais');
    expect(g?.entries.length).toBeGreaterThanOrEqual(75);
  });

  it('Urgências atinge meta Fase 1', () => {
    const g = getGuidelineForSubtopico('Urgências e Emergências');
    expect(g?.entries.length).toBeGreaterThanOrEqual(55);
  });

  it.each([
    ['Saúde da Mulher', 45],
    ['Cuidados na Administração de Medicamentos', 40],
    ['Oxigenoterapia e Cuidados Respiratórios', 35],
    ['Atenção Básica / Saúde da Família', 35],
    ['Instalação e Manejo de Sondas', 35],
    ['Coleta de Exames Laboratoriais', 35],
    ['Processo de Enfermagem', 35],
    ['Cálculo de Administração de Medicamentos e Infusões', 35],
  ] as const)('Fase 2 — %s ≥ %i entries', (subtopico, min) => {
    const g = getGuidelineForSubtopico(subtopico);
    expect(g?.entries.length).toBeGreaterThanOrEqual(min);
  });

  it.each(
    Object.entries(DEEPENING_BY_SUBTOPICO).map(([subtopico, spec]) => [
      subtopico,
      spec.target_merged_entries,
    ]),
  )('plano deepening — %s ≥ meta %i entries', (subtopico, target) => {
    const g = getGuidelineForSubtopico(subtopico);
    expect(g?.entries.length ?? 0).toBeGreaterThanOrEqual(target);
  });
});

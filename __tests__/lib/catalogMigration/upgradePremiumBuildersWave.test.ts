import coletaGolden from '@/examples/questao-premium-cpcon-coleta-amostras-vf.json';
import viasGolden from '@/examples/questao-premium-cpcon-vias-im-vf.json';
import urgenciasGolden from '@/examples/questao-premium-urgencias-rcp.json';
import oxigenoGolden from '@/examples/questao-premium-admtec-oxigenoterapia-dispositivos.json';
import respiratorioDpocGolden from '@/examples/questao-premium-cpcon-dpoc-oxigenoterapia-alvo-vf.json';
import respiratorioCorticoideGolden from '@/examples/questao-premium-idecan-respiratorio-corticoide-inalatorio-conceito.json';
import respiratorioPeakFlowGolden from '@/examples/questao-premium-fgv-respiratorio-peak-flow-zonas-vf.json';
import istsGolden from '@/examples/questao-premium-cpcon-ists-risco-transmissao-vf.json';
import calculoGolden from '@/examples/questao-premium-idecan-calculo-equivalencias-gotas.json';
import calculoCeGolden from '@/examples/questao-premium-idecan-calculo-ml-gotas-microgotas.json';
import saeGolden from '@/examples/questao-premium-fepese-anotacao-enfermagem-sae.json';
import sondasGolden from '@/examples/questao-premium-consulplan-sondagem-nasogastrica-nex.json';
import { PREMIUM_STUB_MARKERS } from '@/lib/catalogMigration/upgradePremiumHybrid';
import {
  buildColetaPremiumSlidesForFamily,
  COLETA_GOLDEN_FILE,
  isColetaSubtopico,
} from '@/lib/catalogMigration/upgradePremiumColeta';
import {
  buildViasPremiumSlidesForFamily,
  isViasSubtopico,
  VIAS_GOLDEN_FILE,
} from '@/lib/catalogMigration/upgradePremiumVias';
import {
  buildUrgenciasPremiumSlidesForFamily,
  isUrgenciasSubtopico,
  URGENCIAS_GOLDEN_FILE,
} from '@/lib/catalogMigration/upgradePremiumUrgencias';
import {
  buildOxigenoterapiaPremiumSlidesForFamily,
  isOxigenoterapiaSubtopico,
  OXIGENO_GOLDEN_FILE,
} from '@/lib/catalogMigration/upgradePremiumOxigenoterapia';
import {
  buildRespiratorioCronicoPremiumSlidesForFamily,
  isRespiratorioCronicoSubtopico,
  RESPIRATORIO_CORTICOIDE_GOLDEN_FILE,
  RESPIRATORIO_DPOC_VF_GOLDEN_FILE,
} from '@/lib/catalogMigration/upgradePremiumRespiratorioCronico';
import {
  buildIstsPremiumSlidesForFamily,
  ISTS_GOLDEN_FILE,
  isIstsSubtopico,
} from '@/lib/catalogMigration/upgradePremiumIsts';
import {
  buildCalculoPremiumSlidesForFamily,
  CALCULO_CE_GOLDEN_FILE,
  CALCULO_GOLDEN_FILE,
  isCalculoSubtopico,
} from '@/lib/catalogMigration/upgradePremiumCalculo';
import {
  buildSaePremiumSlidesForFamily,
  isSaeSubtopico,
  SAE_GOLDEN_FILE,
} from '@/lib/catalogMigration/upgradePremiumSae';
import {
  buildSondasPremiumSlidesForFamily,
  isSondasSubtopico,
  SONDAS_GOLDEN_FILE,
} from '@/lib/catalogMigration/upgradePremiumSondas';
import { upgradePremiumHybrid } from '@/lib/catalogMigration/upgradePremiumHybrid';
import { QuestaoCompletaSchema } from '@/lib/validations';

function slideText(slides: unknown): string {
  return JSON.stringify(slides).toLowerCase();
}

function assertNoStubs(slides: unknown) {
  const text = slideText(slides);
  for (const marker of PREMIUM_STUB_MARKERS) {
    expect(text).not.toContain(marker);
  }
}

function genericPayload(subtopico: string, questionData: typeof coletaGolden.question_data) {
  return {
    meta: { banca: 'Test', topico: 'Enfermagem', subtopico, ano: '2026' },
    question_data: questionData,
    reverse_study_slides: [
      { type: 'concept_map', items: [{ label: 'Ponto 1', detail: 'Relacione o tema' }] },
      { type: 'golden_rule', content: 'Regra essencial genérica' },
      { type: 'logic_flow', steps: ['Passo genérico'] },
      {
        type: 'danger_zone',
        content: 'Erros comuns',
        items: [{ label: 'Ponto 1', detail: 'Erro genérico' }],
      },
    ],
  };
}

describe('upgradePremiumColeta', () => {
  it('isColetaSubtopico reconhece nome canônico', () => {
    expect(isColetaSubtopico('Coleta de Exames Laboratoriais')).toBe(true);
    expect(isColetaSubtopico('Vias de Administração')).toBe(false);
  });

  it('buildColetaPremiumSlidesForFamily gera 4 slides sem stub', () => {
    const slides = buildColetaPremiumSlidesForFamily(
      {
        instruction: coletaGolden.question_data.instruction,
        options: coletaGolden.question_data.options,
        topico: 'Enfermagem',
        subtopico: 'Coleta de Exames Laboratoriais',
      },
      'vf',
    );
    expect(slides.map((s) => s.type)).toEqual([
      'concept_map',
      'golden_rule',
      'logic_flow',
      'danger_zone',
    ]);
    assertNoStubs(slides);
  });

  it('upgrade híbrido usa builder Coleta', () => {
    const result = upgradePremiumHybrid(
      genericPayload('Coleta de Exames Laboratoriais', coletaGolden.question_data),
    );
    expect(result.changed).toBe(true);
    expect(result.zodValid).toBe(true);
    expect(result.goldenReference).toBe(COLETA_GOLDEN_FILE);
    assertNoStubs(result.payload.reverse_study_slides);
  });
});

describe('upgradePremiumVias', () => {
  it('isViasSubtopico reconhece nome canônico', () => {
    expect(isViasSubtopico('Vias de Administração')).toBe(true);
  });

  it('buildViasPremiumSlidesForFamily gera 4 slides VF', () => {
    const slides = buildViasPremiumSlidesForFamily(
      {
        instruction: viasGolden.question_data.instruction,
        options: viasGolden.question_data.options,
        topico: 'Enfermagem',
        subtopico: 'Vias de Administração',
      },
      'vf',
    );
    expect(slides).toHaveLength(4);
    assertNoStubs(slides);
    const gr = slides[1] as { rows?: unknown[] };
    expect(gr.rows?.length).toBeGreaterThanOrEqual(3);
  });

  it('upgrade híbrido usa builder Vias', () => {
    const result = upgradePremiumHybrid(
      genericPayload('Vias de Administração', viasGolden.question_data),
    );
    expect(result.goldenReference).toBe(VIAS_GOLDEN_FILE);
    expect(result.zodValid).toBe(true);
    assertNoStubs(result.payload.reverse_study_slides);
  });

  it('questão SC com I. gera golden_rule com exam_hint nas rows', () => {
    const instruction =
      'Sobre a Administração de Medicamentos por via subcutânea, analise os itens abaixo.\nI. A longo prazo, pode causar irritação na camada gordurosa da pele.\nII. O período de absorção da droga é rápido, favorecendo grandes quantidades.\nIII. A adesão ao tratamento é facilitada.\nIV. O volume máximo permitido para essa via é de 3 mL.\nEstão CORRETOS os itens';
    const options = [
      { id: 'A', text: 'I e II, apenas.', is_correct: false },
      { id: 'B', text: 'I e III, apenas.', is_correct: true },
      { id: 'C', text: 'II e IV, apenas.', is_correct: false },
      { id: 'D', text: 'III e IV, apenas.', is_correct: false },
    ];
    const slides = buildViasPremiumSlidesForFamily(
      {
        instruction,
        options,
        topico: 'Enfermagem',
        subtopico: 'Vias de Administração',
      },
      'conceito',
    );
    const gr = slides[1] as { rows?: { exam_hint?: string; label: string }[] };
    expect(gr.rows?.some((r) => r.exam_hint && r.label.startsWith('II'))).toBe(true);
    const logic = slides[2] as { steps?: string[] };
    expect(logic.steps?.some((s) => /Julgar II/i.test(s))).toBe(true);
  });
});

describe('upgradePremiumUrgencias', () => {
  it('isUrgenciasSubtopico reconhece nome canônico', () => {
    expect(isUrgenciasSubtopico('Urgências e Emergências')).toBe(true);
  });

  it('buildUrgenciasPremiumSlidesForFamily gera slides RCP', () => {
    const slides = buildUrgenciasPremiumSlidesForFamily(
      {
        instruction: urgenciasGolden.question_data.instruction,
        options: urgenciasGolden.question_data.options,
        topico: 'Enfermagem',
        subtopico: 'Urgências e Emergências',
      },
      'protocolo',
    );
    const cm = slides[0] as { items?: { label: string }[] };
    expect(cm.items?.some((i) => i.label === 'Cadeia de sobrevivência')).toBe(true);
    const lf = slides[2] as { steps?: string[] };
    expect(lf.steps?.some((s) => s.toLowerCase().includes('pulso'))).toBe(true);
    assertNoStubs(slides);
  });

  it('upgrade híbrido usa builder Urgências', () => {
    const result = upgradePremiumHybrid(
      genericPayload('Urgências e Emergências', urgenciasGolden.question_data),
    );
    expect(result.goldenReference).toBe(URGENCIAS_GOLDEN_FILE);
    expect(result.zodValid).toBe(true);
  });
});

describe('upgradePremiumOxigenoterapia', () => {
  it('isOxigenoterapiaSubtopico reconhece nome canônico', () => {
    expect(isOxigenoterapiaSubtopico('Oxigenoterapia e Cuidados Respiratórios')).toBe(true);
  });

  it('buildOxigenoterapiaPremiumSlidesForFamily gera 4 slides', () => {
    const slides = buildOxigenoterapiaPremiumSlidesForFamily(
      {
        instruction: oxigenoGolden.question_data.instruction,
        options: oxigenoGolden.question_data.options,
        topico: 'Enfermagem',
        subtopico: 'Oxigenoterapia e Cuidados Respiratórios',
      },
      'conceito',
    );
    expect(slides).toHaveLength(4);
    assertNoStubs(slides);
    const text = slideText(slides);
    expect(text).toMatch(/cateter nasal|baixo fluxo|cna/);
  });

  it('upgrade híbrido usa builder Oxigenoterapia', () => {
    const result = upgradePremiumHybrid(
      genericPayload('Oxigenoterapia e Cuidados Respiratórios', oxigenoGolden.question_data),
    );
    expect(result.goldenReference).toBe(OXIGENO_GOLDEN_FILE);
    expect(result.zodValid).toBe(true);
  });
});

describe('upgradePremiumIsts', () => {
  it('isIstsSubtopico reconhece nome canônico', () => {
    expect(isIstsSubtopico('Infecções Sexualmente Transmissíveis (ISTs)')).toBe(true);
  });

  it('buildIstsPremiumSlidesForFamily gera 4 slides VF', () => {
    const slides = buildIstsPremiumSlidesForFamily(
      {
        instruction: istsGolden.question_data.instruction,
        options: istsGolden.question_data.options,
        topico: 'Enfermagem',
        subtopico: 'Infecções Sexualmente Transmissíveis (ISTs)',
      },
      'vf',
    );
    expect(slides).toHaveLength(4);
    assertNoStubs(slides);
    const text = slideText(slides);
    expect(text).toMatch(/parenteral|camisinha/);
  });

  it('upgrade híbrido usa builder ISTs', () => {
    const result = upgradePremiumHybrid(
      genericPayload('Infecções Sexualmente Transmissíveis (ISTs)', istsGolden.question_data),
    );
    expect(result.goldenReference).toBe(ISTS_GOLDEN_FILE);
    expect(result.zodValid).toBe(true);
  });
});

describe('upgradePremiumCalculo', () => {
  it('isCalculoSubtopico reconhece nome canônico', () => {
    expect(isCalculoSubtopico('Cálculo de Administração de Medicamentos e Infusões')).toBe(true);
  });

  it('buildCalculoPremiumSlidesForFamily gera slides de equivalência', () => {
    const slides = buildCalculoPremiumSlidesForFamily(
      {
        instruction: calculoGolden.question_data.instruction,
        options: calculoGolden.question_data.options,
        topico: 'Enfermagem',
        subtopico: 'Cálculo de Administração de Medicamentos e Infusões',
      },
      'calc',
    );
    expect(slides).toHaveLength(4);
    assertNoStubs(slides);
    const gr = slides[1] as { rows?: { label: string }[] };
    expect(gr.rows?.some((r) => r.label.includes('mL'))).toBe(true);
  });

  it('buildCalculoPremiumSlidesForFamily gera slides C/E', () => {
    const slides = buildCalculoPremiumSlidesForFamily(
      {
        instruction: calculoCeGolden.question_data.instruction,
        options: calculoCeGolden.question_data.options,
        topico: 'Enfermagem',
        subtopico: 'Cálculo de Administração de Medicamentos e Infusões',
      },
      'certo_errado',
    );
    expect(slides).toHaveLength(4);
    assertNoStubs(slides);
  });

  it('upgrade híbrido usa builder Cálculo MC e C/E', () => {
    const mc = upgradePremiumHybrid(
      genericPayload(
        'Cálculo de Administração de Medicamentos e Infusões',
        calculoGolden.question_data,
      ),
    );
    expect(mc.goldenReference).toBe(CALCULO_GOLDEN_FILE);
    expect(mc.zodValid).toBe(true);

    const ce = upgradePremiumHybrid(
      genericPayload(
        'Cálculo de Administração de Medicamentos e Infusões',
        calculoCeGolden.question_data,
      ),
    );
    expect(ce.goldenReference).toBe(CALCULO_CE_GOLDEN_FILE);
    expect(ce.zodValid).toBe(true);
  });
});

describe('upgradePremiumSae', () => {
  it('isSaeSubtopico reconhece nome canônico', () => {
    expect(isSaeSubtopico('Processo de Enfermagem')).toBe(true);
  });

  it('buildSaePremiumSlidesForFamily gera 4 slides anotação', () => {
    const slides = buildSaePremiumSlidesForFamily(
      {
        instruction: saeGolden.question_data.instruction,
        options: saeGolden.question_data.options,
        topico: 'Enfermagem',
        subtopico: 'Processo de Enfermagem',
      },
      'text_fragment',
    );
    expect(slides).toHaveLength(4);
    assertNoStubs(slides);
    const text = slideText(slides);
    expect(text).toMatch(/privativ|enfermeiro|anotação/);
  });

  it('upgrade híbrido usa builder SAE', () => {
    const result = upgradePremiumHybrid(
      genericPayload('Processo de Enfermagem', saeGolden.question_data),
    );
    expect(result.goldenReference).toBe(SAE_GOLDEN_FILE);
    expect(result.zodValid).toBe(true);
  });
});

describe('upgradePremiumSondas', () => {
  it('isSondasSubtopico reconhece nome canônico', () => {
    expect(isSondasSubtopico('Instalação e Manejo de Sondas')).toBe(true);
    expect(isSondasSubtopico('Vias de Administração')).toBe(false);
  });

  it('buildSondasPremiumSlidesForFamily gera 4 slides VF', () => {
    const slides = buildSondasPremiumSlidesForFamily(
      {
        instruction: sondasGolden.question_data.instruction,
        options: sondasGolden.question_data.options,
        topico: 'Enfermagem',
        subtopico: 'Instalação e Manejo de Sondas',
      },
      'vf',
    );
    expect(slides).toHaveLength(4);
    assertNoStubs(slides);
    const text = slideText(slides);
    expect(text).toMatch(/nex|xifoide|ausculta|fowler/);
    const dz = slides[3] as { items?: { correct?: string }[] };
    expect(dz.items?.some((i) => i.correct?.includes('radiografia'))).toBe(true);
  });

  it('upgrade híbrido usa builder Sondas', () => {
    const result = upgradePremiumHybrid(
      genericPayload('Instalação e Manejo de Sondas', sondasGolden.question_data),
    );
    expect(result.goldenReference).toBe(SONDAS_GOLDEN_FILE);
    expect(result.zodValid).toBe(true);
    assertNoStubs(result.payload.reverse_study_slides);
  });
});

describe('upgradePremiumRespiratorioCronico', () => {
  const subtopico = 'Doenças Respiratórias Crônicas (Asma, DPOC)';

  it('isRespiratorioCronicoSubtopico reconhece nome canônico', () => {
    expect(isRespiratorioCronicoSubtopico(subtopico)).toBe(true);
    expect(isRespiratorioCronicoSubtopico('Oxigenoterapia e Cuidados Respiratórios')).toBe(false);
  });

  it('buildRespiratorioCronicoPremiumSlidesForFamily gera 4 slides sem stub (VF)', () => {
    const slides = buildRespiratorioCronicoPremiumSlidesForFamily(
      {
        instruction: respiratorioDpocGolden.question_data.instruction,
        options: respiratorioDpocGolden.question_data.options,
        topico: 'Enfermagem',
        subtopico,
      },
      'vf',
    );
    expect(slides.map((s) => s.type)).toEqual([
      'concept_map',
      'golden_rule',
      'logic_flow',
      'danger_zone',
    ]);
    assertNoStubs(slides);
  });

  it('buildRespiratorioCronicoPremiumSlidesForFamily gera 4 slides sem stub (conceito)', () => {
    const slides = buildRespiratorioCronicoPremiumSlidesForFamily(
      {
        instruction: respiratorioCorticoideGolden.question_data.instruction,
        options: respiratorioCorticoideGolden.question_data.options,
        topico: 'Enfermagem',
        subtopico,
      },
      'conceito',
    );
    assertNoStubs(slides);
  });

  it('upgrade híbrido usa builder Respiratório Crônico (VF)', () => {
    const result = upgradePremiumHybrid(
      genericPayload(subtopico, respiratorioDpocGolden.question_data),
    );
    expect(result.changed).toBe(true);
    expect(result.zodValid).toBe(true);
    expect(result.goldenReference).toBe(RESPIRATORIO_DPOC_VF_GOLDEN_FILE);
    assertNoStubs(result.payload.reverse_study_slides);
  });

  it('upgrade híbrido usa builder Respiratório Crônico (conceito)', () => {
    const result = upgradePremiumHybrid(
      genericPayload(subtopico, respiratorioCorticoideGolden.question_data),
    );
    expect(result.changed).toBe(true);
    expect(result.zodValid).toBe(true);
    expect(result.goldenReference).toBe(RESPIRATORIO_CORTICOIDE_GOLDEN_FILE);
    assertNoStubs(result.payload.reverse_study_slides);
  });
});

describe('goldens permanecem válidos', () => {
  it.each([
    ['coleta', coletaGolden, 'Coleta de Exames Laboratoriais'],
    ['vias', viasGolden, 'Vias de Administração'],
    ['urgencias', urgenciasGolden, 'Urgências e Emergências'],
    ['oxigeno', oxigenoGolden, 'Oxigenoterapia e Cuidados Respiratórios'],
    ['respiratorio-dpoc', respiratorioDpocGolden, 'Doenças Respiratórias Crônicas (Asma, DPOC)'],
    ['respiratorio-peak-flow', respiratorioPeakFlowGolden, 'Doenças Respiratórias Crônicas (Asma, DPOC)'],
    ['ists', istsGolden, 'Infecções Sexualmente Transmissíveis (ISTs)'],
    ['calculo', calculoGolden, 'Cálculo de Administração de Medicamentos e Infusões'],
    ['sae', saeGolden, 'Processo de Enfermagem'],
    ['sondas', sondasGolden, 'Instalação e Manejo de Sondas'],
  ])('%s golden idempotente com force', (_name, golden, subtopico) => {
    const result = upgradePremiumHybrid(
      { ...golden, meta: { ...golden.meta, subtopico } },
      { force: true },
    );
    expect(result.zodValid).toBe(true);
    expect(QuestaoCompletaSchema.safeParse(result.payload).success).toBe(true);
    assertNoStubs(result.payload.reverse_study_slides);
  });
});

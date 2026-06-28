import {
  inferPedagogicalBranch,
  getPresentationDesign,
  getLayoutVariantForBranch,
} from '@/lib/slides/pedagogicalBranch';
import { enrichPresentationContext } from '@/components/slides/core/slidePresentation';

describe('pedagogicalBranch', () => {
  const subtopico = 'Saúde do Adolescente';

  it('infere adolescente_desenvolvimento para puberdade', () => {
    const instruction =
      'Julgue o item. A adolescência é marcada por metamorfose física. Atraso na puberdade: mamas 12-13 anos, testículos 13-14 anos.';
    expect(inferPedagogicalBranch(subtopico, instruction, [], 'certo_errado')).toBe(
      'adolescente_desenvolvimento',
    );
  });

  it('infere adolescente_antropometria para escore Z', () => {
    const instruction = 'Classificação nutricional pelo escore Z do IMC na caderneta do adolescente.';
    expect(inferPedagogicalBranch(subtopico, instruction, [], 'calc')).toBe(
      'adolescente_antropometria',
    );
  });

  it('infere adolescente_etica_sigilo para gravidez/sigilo', () => {
    const instruction = 'Sobre sigilo na consulta do adolescente gestante e escuta qualificada.';
    expect(inferPedagogicalBranch(subtopico, instruction, [])).toBe('adolescente_etica_sigilo');
  });

  it('infere adolescente_violencia_protecao para violência sexual (não sigilo)', () => {
    const instruction =
      'Em relação à violência sexual em crianças e adolescentes, é correto afirmar: notificação compulsória e rede de proteção.';
    expect(inferPedagogicalBranch(subtopico, instruction, [])).toBe('adolescente_violencia_protecao');
    const design = getPresentationDesign(subtopico, 'adolescente_violencia_protecao');
    expect(design?.conceptMap).toBe('morphological');
    expect(getLayoutVariantForBranch(subtopico, 'concept_map', 'adolescente_violencia_protecao')).toBe(
      'morphological',
    );
  });

  it('ramo desenvolvimento usa layout genérico no concept_map', () => {
    const design = getPresentationDesign(subtopico, 'adolescente_desenvolvimento');
    expect(design?.conceptMap).toBe('morphological');
    expect(getLayoutVariantForBranch(subtopico, 'concept_map', 'adolescente_desenvolvimento')).toBe(
      'morphological',
    );
  });

  it('ramo ética usa adolescent-privacy-curtain', () => {
    expect(getLayoutVariantForBranch(subtopico, 'concept_map', 'adolescente_etica_sigilo')).toBe(
      'adolescent-privacy-curtain',
    );
  });
});

describe('pedagogicalBranch — CME', () => {
  const subtopico = 'Enfermagem em Central de Material e Esterilização (CME)';

  it('infere cme_autoclave_metodos para autoclave', () => {
    const instruction = 'Parâmetros de autoclave: vapor saturado, temperatura e pressão do ciclo de esterilização.';
    expect(inferPedagogicalBranch(subtopico, instruction, [])).toBe('cme_autoclave_metodos');
    expect(getLayoutVariantForBranch(subtopico, 'golden_rule', 'cme_autoclave_metodos')).toBe(
      'reference_table',
    );
  });

  it('infere cme_preparo_limpeza para limpeza', () => {
    const instruction = 'Preparo e limpeza de instrumentais com pré-secagem antes da esterilização.';
    expect(inferPedagogicalBranch(subtopico, instruction, [])).toBe('cme_preparo_limpeza');
  });
});

describe('pedagogicalBranch — Saúde Mental', () => {
  const subtopico = 'Saúde Mental';

  it('infere mental_raps_legis para RAPS', () => {
    const instruction = 'Componentes da RAPS e Reforma Psiquiátrica conforme Portaria 3.088/2011.';
    expect(inferPedagogicalBranch(subtopico, instruction, [])).toBe('mental_raps_legis');
    expect(getLayoutVariantForBranch(subtopico, 'logic_flow', 'mental_raps_legis')).toBe('vertical');
  });

  it('infere mental_crise_caps e usa sae-decision-tap', () => {
    const instruction = 'Manejo da crise e agitação psicomotora no CAPS com contenção quando indicada.';
    expect(inferPedagogicalBranch(subtopico, instruction, [])).toBe('mental_crise_caps');
    expect(getLayoutVariantForBranch(subtopico, 'logic_flow', 'mental_crise_caps')).toBe(
      'sae-decision-tap',
    );
  });
});

describe('pedagogicalBranch — Sondas', () => {
  const subtopico = 'Instalação e Manejo de Sondas';

  it('infere sonda_instalacao_protocolo para instalação', () => {
    const instruction = 'Instalação de sonda nasogástrica com fixação adequada.';
    expect(inferPedagogicalBranch(subtopico, instruction, [])).toBe('sonda_instalacao_protocolo');
    expect(getLayoutVariantForBranch(subtopico, 'concept_map', 'sonda_instalacao_protocolo')).toBe(
      'procedure-protocol',
    );
  });

  it('infere sonda_medicao_nex para medição NEX', () => {
    const instruction = 'Medição da sonda: distância nariz–orelha–xifoide (NEX).';
    expect(inferPedagogicalBranch(subtopico, instruction, [])).toBe('sonda_medicao_nex');
  });
});

describe('enrichPresentationContext — meta da questão', () => {
  const subtopico = 'Saúde do Adolescente';
  const puberdadeInstruction =
    'Julgue o item. A adolescência é marcada por metamorfose física. Atraso na puberdade: mamas 12-13 anos.';

  it('usa pedagogical_branch da questão quando slide.meta não tem', () => {
    const ctx = enrichPresentationContext(
      { questionSlug: 'igeduc-puberdade', familyId: 'certo_errado' },
      { subtopico },
      puberdadeInstruction,
      [],
      { subtopico, pedagogical_branch: 'adolescente_desenvolvimento' },
    );
    expect(ctx.pedagogicalBranch).toBe('adolescente_desenvolvimento');
  });

  it('slide.meta.pedagogical_branch vence o da questão', () => {
    const ctx = enrichPresentationContext(
      { questionSlug: 'override-test' },
      { subtopico, pedagogical_branch: 'adolescente_etica_sigilo' },
      puberdadeInstruction,
      [],
      { subtopico, pedagogical_branch: 'adolescente_desenvolvimento' },
    );
    expect(ctx.pedagogicalBranch).toBe('adolescente_etica_sigilo');
  });
});

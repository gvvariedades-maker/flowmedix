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

  const farmacoSubtopico = 'Farmacodinâmica e Farmacocinética';

  it('infere farmaco_pk_pd_vf para assertivas I/II/III', () => {
    const instruction =
      'I - A farmacocinética descreve ADME. II - A farmacodinâmica é o efeito no organismo. III - Meia-vida elimina 100% do fármaco. Assinale a alternativa correta.';
    expect(inferPedagogicalBranch(farmacoSubtopico, instruction, [], 'vf')).toBe('farmaco_pk_pd_vf');
    const design = getPresentationDesign(farmacoSubtopico, 'farmaco_pk_pd_vf');
    expect(design?.conceptMap).toBe('adme-journey-rail');
  });

  it('infere farmaco_clinico_protocolo para omeprazol EV', () => {
    const instruction =
      'Em um paciente hospitalizado por úlcera péptica grave, que recebe Omeprazol endovenoso, marque a conduta adequada.';
    expect(inferPedagogicalBranch(farmacoSubtopico, instruction, [], 'protocolo')).toBe(
      'farmaco_clinico_protocolo',
    );
    const design = getPresentationDesign(farmacoSubtopico, 'farmaco_clinico_protocolo');
    expect(design?.conceptMap).toBe('morphological');
  });

  const imunizacaoSubtopico = 'Imunização';

  it('infere imunizacao_vf_intervalos para VF de intervalos PNI', () => {
    const instruction =
      'I - O intervalo mínimo entre doses de vacinas inativadas é de 15 dias. II - Reforço da tríplice viral pode ser feito a qualquer idade. III - BCG é contraindicada em gestantes. Assinale a correta.';
    expect(inferPedagogicalBranch(imunizacaoSubtopico, instruction, [], 'vf')).toBe(
      'imunizacao_vf_intervalos',
    );
    const design = getPresentationDesign(imunizacaoSubtopico, 'imunizacao_vf_intervalos');
    expect(design?.conceptMap).toBe('pni-rules-deck');
  });

  it('infere imunizacao_calendario para esquema vacinal por idade', () => {
    const instruction =
      'De acordo com o calendário nacional de vacinação, a primeira dose da pentavalente deve ser administrada aos 2 meses de idade.';
    expect(inferPedagogicalBranch(imunizacaoSubtopico, instruction, [], 'protocolo')).toBe(
      'imunizacao_calendario',
    );
  });

  const viasSubtopico = 'Vias de Administração';

  it('infere via_vf_absorcao para VF de absorção/biodisponibilidade', () => {
    const instruction =
      'I - A via intramuscular tem absorção mais rápida que a subcutânea para a maioria dos fármacos. II - A via oral sofre efeito de primeira passagem hepática. III - A biodisponibilidade da via retal é sempre 100%. Analise.';
    expect(inferPedagogicalBranch(viasSubtopico, instruction, [], 'vf')).toBe('via_vf_absorcao');
    const design = getPresentationDesign(viasSubtopico, 'via_vf_absorcao');
    expect(design?.conceptMap).toBe('absorption-speed-rail');
  });

  it('infere via_tecnica_admin para técnica de punção IM', () => {
    const instruction =
      'Na administração intramuscular no vasto lateral, o ângulo de inserção da agulha deve ser de 90 graus.';
    expect(inferPedagogicalBranch(viasSubtopico, instruction, [], 'protocolo')).toBe(
      'via_tecnica_admin',
    );
  });

  const calcSubtopico = 'Cálculo de Administração de Medicamentos e Infusões';

  it('infere calc_dose_equivalencia para cálculo numérico de dose', () => {
    const instruction =
      'Um frasco de insulina U-100 contém 10 mL. Quantas unidades de insulina há em 2,5 mL?';
    expect(inferPedagogicalBranch(calcSubtopico, instruction, [], 'calc')).toBe(
      'calc_dose_equivalencia',
    );
    const design = getPresentationDesign(calcSubtopico, 'calc_dose_equivalencia');
    expect(design?.conceptMap).toBe('dose-equivalence-rail');
  });

  it('infere calc_conceito para definição sem conta', () => {
    const instruction =
      'Sobre a definição de posologia e horário de administração, assinale a alternativa correta.';
    expect(inferPedagogicalBranch(calcSubtopico, instruction, [], 'conceito')).toBe(
      'calc_conceito',
    );
  });
});

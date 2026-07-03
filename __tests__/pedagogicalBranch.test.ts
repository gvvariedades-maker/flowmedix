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
    const design = getPresentationDesign(imunizacaoSubtopico, 'imunizacao_calendario');
    expect(design?.conceptMap).toBe('vaccine-timeline');
    expect(design?.goldenRule).toBe('pni-calendar-board');
    expect(design?.logicFlow).toBe('pni-calendar-elimination-tap');
    expect(design?.dangerZone).toBe('calendar-mismatch');
  });

  it('infere imunizacao_cadeia_frio para conservação e SI-PNI', () => {
    const instruction =
      'Sobre a cadeia de frio na sala de vacinação, assinale a alternativa correta quanto à conservação dos imunobiológicos no refrigerador do SI-PNI.';
    expect(inferPedagogicalBranch(imunizacaoSubtopico, instruction, [], 'conceito')).toBe(
      'imunizacao_cadeia_frio',
    );
    const design = getPresentationDesign(imunizacaoSubtopico, 'imunizacao_cadeia_frio');
    expect(design?.conceptMap).toBe('cold-chain-hub');
    expect(design?.goldenRule).toBe('pni-temperature-rail');
    expect(design?.logicFlow).toBe('pni-cold-chain-tap');
    expect(design?.dangerZone).toBe('temperature-mismatch');
  });

  it('infere imunizacao_exceto para comando INCORRETA', () => {
    const instruction = 'Sobre vacinas, é INCORRETO afirmar que:';
    expect(inferPedagogicalBranch(imunizacaoSubtopico, instruction, [], 'certo_errado')).toBe(
      'imunizacao_exceto',
    );
    const design = getPresentationDesign(imunizacaoSubtopico, 'imunizacao_exceto');
    expect(design?.dangerZone).toBe('compare');
  });

  it('PNI ramos bespoke — pacotes 4/4 distintos (calendário ≠ cadeia frio ≠ V/F intervalos)', () => {
    const cal = getPresentationDesign(imunizacaoSubtopico, 'imunizacao_calendario');
    const frio = getPresentationDesign(imunizacaoSubtopico, 'imunizacao_cadeia_frio');
    const vf = getPresentationDesign(imunizacaoSubtopico, 'imunizacao_vf_intervalos');

    expect(cal?.conceptMap).toBe('vaccine-timeline');
    expect(frio?.conceptMap).toBe('cold-chain-hub');
    expect(vf?.conceptMap).toBe('pni-rules-deck');

    expect(cal?.goldenRule).not.toBe(frio?.goldenRule);
    expect(frio?.logicFlow).not.toBe(vf?.logicFlow);
    expect(cal?.dangerZone).not.toBe(frio?.dangerZone);

    expect(new Set([cal?.conceptMap, frio?.conceptMap, vf?.conceptMap]).size).toBe(3);
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

  const respSubtopico = 'Doenças Respiratórias Crônicas (Asma, DPOC)';

  it('infere respiratorio_vf_asma_dpoc para assertivas I/II/III', () => {
    const instruction =
      'I - Na DPOC, o alvo de SpO₂ é 88–92% em retentores. II - Asma usa beta-2 de resgate. III - Oxigênio alto fluxo é rotina na asma leve. Assinale a correta.';
    expect(inferPedagogicalBranch(respSubtopico, instruction, [], 'vf')).toBe(
      'respiratorio_vf_asma_dpoc',
    );
    const design = getPresentationDesign(respSubtopico, 'respiratorio_vf_asma_dpoc');
    expect(design?.conceptMap).toBe('respiratorio-asma-dpoc-duel-deck');
  });

  it('infere respiratorio_dpoc_oxigenio para O₂ titulado DPOC', () => {
    const instruction =
      'Paciente com DPOC descompensada, SpO₂ 86%. Qual a conduta de oxigenoterapia titulada conforme protocolo?';
    expect(inferPedagogicalBranch(respSubtopico, instruction, [], 'protocolo')).toBe(
      'respiratorio_dpoc_oxigenio',
    );
    const design = getPresentationDesign(respSubtopico, 'respiratorio_dpoc_oxigenio');
    expect(design?.goldenRule).toBe('respiratorio-spo2-reference-board');
  });

  it('infere respiratorio_asma_crise para comando EXCETO na crise', () => {
    const instruction =
      'Adolescente com sibilância e dispneia na crise asmática. São cuidados imediatos, EXCETO:';
    expect(inferPedagogicalBranch(respSubtopico, instruction, [], 'conceito')).toBe(
      'respiratorio_asma_crise',
    );
    const design = getPresentationDesign(respSubtopico, 'respiratorio_asma_crise');
    expect(design?.dangerZone).toBe('compare');
  });

  it('infere respiratorio_tecnica_inalador para espaçador e MDI', () => {
    const instruction =
      'Sobre a técnica correta de uso do inalador com espaçador (MDI), assinale a alternativa correta.';
    expect(inferPedagogicalBranch(respSubtopico, instruction, [], 'conceito')).toBe(
      'respiratorio_tecnica_inalador',
    );
  });
});

describe('pedagogicalBranch — Segurança do Paciente', () => {
  const subtopico = 'Segurança do Paciente';

  it('infere sp_identificacao para dois identificadores', () => {
    const instruction =
      'A identificação segura do paciente deve utilizar pelo menos dois identificadores independentes antes de medicações.';
    expect(inferPedagogicalBranch(subtopico, instruction, [])).toBe('sp_identificacao');
    expect(getLayoutVariantForBranch(subtopico, 'golden_rule', 'sp_identificacao')).toBe(
      'reference_table',
    );
  });

  it('infere sp_prevencao_quedas para protocolo de quedas', () => {
    const instruction =
      'Paciente com pulseira de risco de queda. A avaliação do risco deve ser feita na admissão com escala adequada.';
    expect(inferPedagogicalBranch(subtopico, instruction, [])).toBe('sp_prevencao_quedas');
  });

  it('infere sp_eventos_adversos para PNSP e incidentes', () => {
    const instruction =
      'Segundo a Portaria 529/2013 do PNSP, evento adverso é lesão não intencional causada pelo cuidado.';
    expect(inferPedagogicalBranch(subtopico, instruction, [])).toBe('sp_eventos_adversos');
  });

  it('infere sp_metas_internacionais para metas JCI/OMS', () => {
    const instruction =
      'A JCI e a OMS estabeleceram seis metas internacionais de segurança do paciente. Assinale a quarta meta.';
    expect(inferPedagogicalBranch(subtopico, instruction, [])).toBe('sp_metas_internacionais');
  });
});

describe('pedagogicalBranch — Assistência Perioperatória', () => {
  const subtopico = 'Assistência Perioperatória (Inclui SRPA)';

  it('infere perioperatorio_pre_operatorio para preparo e jejum', () => {
    const instruction =
      'No pré-operatório imediato, o técnico verifica jejum e orienta o paciente sobre tricotomia.';
    expect(inferPedagogicalBranch(subtopico, instruction, [])).toBe('perioperatorio_pre_operatorio');
    expect(
      getLayoutVariantForBranch(subtopico, 'golden_rule', 'perioperatorio_pre_operatorio'),
    ).toBe('reference_table');
  });

  it('infere perioperatorio_pos_operatorio para SRPA e Aldrete', () => {
    const instruction =
      'Na SRPA, o paciente é monitorizado até atingir escore na Escala de Aldrete e Kroulik para alta.';
    expect(inferPedagogicalBranch(subtopico, instruction, [])).toBe('perioperatorio_pos_operatorio');
  });

  it('infere perioperatorio_protocolo para cirurgia segura e family protocolo', () => {
    const instruction = 'Sobre o checklist da OMS Cirurgias Seguras Salvam Vidas, assinale a correta.';
    expect(inferPedagogicalBranch(subtopico, instruction, [], 'protocolo')).toBe(
      'perioperatorio_protocolo',
    );
  });

  it('infere perioperatorio_vf para Cebraspe sem SRPA', () => {
    const instruction =
      'Julgue o item subsequente sobre práticas em centro cirúrgico recomendadas pelas associações.';
    expect(inferPedagogicalBranch(subtopico, instruction, [], 'certo_errado')).toBe(
      'perioperatorio_vf',
    );
  });

  it('infere perioperatorio_isc para infecção de sítio cirúrgico', () => {
    const instruction =
      'Segundo a ANVISA, a infecção de sítio cirúrgico é complicação evitável. Assinale a correta.';
    expect(inferPedagogicalBranch(subtopico, instruction, [])).toBe('perioperatorio_isc');
  });

  it('SRPA CPD certo/errado → perioperatorio_pos_operatorio', () => {
    const instruction =
      'Na SRPA, o técnico pode trocar o curativo do cateter peridural sob supervisão.';
    expect(inferPedagogicalBranch(subtopico, instruction, [], 'certo_errado')).toBe(
      'perioperatorio_pos_operatorio',
    );
  });
});

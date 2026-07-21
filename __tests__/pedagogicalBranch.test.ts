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

describe('pedagogicalBranch — Processo de Enfermagem / SAE', () => {
  const subtopico = 'Processo de Enfermagem';

  it('infere sae_documentacao para anotação/prontuário', () => {
    const instruction =
      'O registro adequado das informações em prontuários e documentos hospitalares é essencial.';
    expect(inferPedagogicalBranch(subtopico, instruction, [])).toBe('sae_documentacao');
    expect(getLayoutVariantForBranch(subtopico, 'concept_map', 'sae_documentacao')).toBe(
      'sae-documentation',
    );
  });

  it('infere sae_etapas para 5 etapas SAE', () => {
    const instruction =
      'O Processo de Enfermagem pode ser definido como método de trabalho com cinco etapas integradas.';
    expect(inferPedagogicalBranch(subtopico, instruction, [])).toBe('sae_etapas');
    expect(getLayoutVariantForBranch(subtopico, 'concept_map', 'sae_etapas')).toBe(
      'sae-responsibility-matrix',
    );
  });

  it('infere sae_exceto somente no enunciado EXCETO/INCORRETA', () => {
    const instruction = 'Assinale a alternativa INCORRETA sobre o Processo de Enfermagem.';
    expect(inferPedagogicalBranch(subtopico, instruction, [])).toBe('sae_exceto');
    expect(getLayoutVariantForBranch(subtopico, 'danger_zone', 'sae_exceto')).toBe('norm-reveal');
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
    expect(design?.conceptMap).toBe('infusao-ev-station-deck');
    expect(design?.goldenRule).toBe('farmaco-clinico-reference-board');
    expect(design?.logicFlow).toBe('farmaco-protocol-tap-flow');
    expect(design?.dangerZone).toBe('farmaco-clinico-trap');
  });

  it('infere farmaco_generico para meropenem INCORRETA e classificação de anestésico', () => {
    const meropenemExceto =
      'O meropenem é um antibiótico carbapenêmico. Assinale a alternativa INCORRETA sobre convulsões induzidas por meropenem.';
    expect(inferPedagogicalBranch(farmacoSubtopico, meropenemExceto, [], 'certo_errado')).toBe(
      'farmaco_generico',
    );

    const anestesicoClassificacao =
      'Qual das seguintes substâncias NÃO é classificada como um anestésico local?';
    expect(inferPedagogicalBranch(farmacoSubtopico, anestesicoClassificacao, [], 'conceito')).toBe(
      'farmaco_generico',
    );
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

  it('infere imunizacao_generico para campanha diabetes Portaria 2.048 (não calendário PNI)', () => {
    const instruction =
      'A Campanha Nacional de Detecção de Casos Suspeitos de Diabetes Mellitus será realizada em unidades básicas de saúde (Portaria nº 2.048/09). É CORRETO afirmar que o público alvo é constituído por pessoas com idade igual ou superior a:';
    const slides = [
      {
        type: 'danger_zone' as const,
        content: 'PEGADINHAS',
        items: [
          {
            label: 'Confundir com calendário',
            detail: 'Não é vacina.',
            correct: 'Campanha APS diabetes — 40 anos.',
          },
        ],
      },
    ];
    expect(inferPedagogicalBranch(imunizacaoSubtopico, instruction, slides, 'legis')).toBe(
      'imunizacao_generico',
    );
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

  it('infere via_tecnica_admin para V/F I–IV com ventroglúteo (âncora CPCON)', () => {
    const instruction =
      'Sobre administração de medicamentos pela via intramuscular (IM) analise as afirmativas a seguir:\nI- A via IM propicia a absorção de medicamentos mais lenta que a via subcutânea.\nII- Examine um músculo antes de administrar uma injeção IM ao palpar os marcos ósseos.\nIII- São cuidados importantes para minimizar a dor durante uma injeção.\nIV- O músculo ventroglúteo é o menos recomendado para todos os adultos.\nÉ CORRETO o que se afirma em:';
    expect(inferPedagogicalBranch(viasSubtopico, instruction, [], 'vf')).toBe('via_tecnica_admin');
    const design = getPresentationDesign(viasSubtopico, 'via_tecnica_admin');
    expect(design?.conceptMap).toBe('morphological');
    expect(design?.dangerZone).toBe('compare');
  });

  it('infere via_generico para EXCETO/INCORRETA', () => {
    const instruction = 'São vantagens do uso da via sublingual, exceto:';
    expect(inferPedagogicalBranch(viasSubtopico, instruction, [], 'certo_errado')).toBe(
      'via_generico',
    );
  });

  const camSubtopico = 'Cuidados na Administração de Medicamentos';

  it('infere cam_certos_vf_caso para VF I–III sobre 9 Certos', () => {
    const instruction =
      'Em relação aos cuidados na administração de medicamentos, analise as afirmativas.\n\nI - A identificação do paciente deve ser feita com pelo menos dois identificadores.\nII - Medicamentos de alto risco exigem conferência dupla.\nIII - Diante de prescrição ilegível, o profissional pode administrar se o medicamento for de uso habitual.\n\nÉ CORRETO o que se afirma em:';
    expect(inferPedagogicalBranch(camSubtopico, instruction, [], 'vf')).toBe('cam_certos_vf_caso');
    const design = getPresentationDesign(camSubtopico, 'cam_certos_vf_caso');
    expect(design?.conceptMap).toBe('cam-certos-deck');
    expect(design?.goldenRule).toBe('cam-nine-rights-board');
    expect(design?.logicFlow).toBe('cam-vf-juggle-tap');
    expect(design?.dangerZone).toBe('cam-certos-trap-arena');
  });

  it('infere cam_alto_risco para insulina e conferência dupla', () => {
    const instruction =
      'Sobre a administração de insulina regular e NPH, assinale a alternativa correta quanto à técnica de aplicação e segurança do paciente.';
    expect(inferPedagogicalBranch(camSubtopico, instruction, [], 'conceito')).toBe('cam_alto_risco');
    const design = getPresentationDesign(camSubtopico, 'cam_alto_risco');
    expect(design?.conceptMap).toBe('cam-high-risk-duo-deck');
    expect(design?.goldenRule).toBe('cam-high-risk-protocol-board');
    expect(design?.logicFlow).toBe('cam-alto-risco-elimination-tap');
    expect(design?.dangerZone).toBe('cam-high-risk-trap-arena');
  });

  it('infere cam_exceto_conduta para EXCETO preparo', () => {
    const instruction = 'São cuidados de enfermagem, no preparo de medicamentos, exceto:';
    expect(inferPedagogicalBranch(camSubtopico, instruction, [], 'certo_errado')).toBe(
      'cam_exceto_conduta',
    );
    const design = getPresentationDesign(camSubtopico, 'cam_exceto_conduta');
    expect(design?.conceptMap).toBe('cam-exceto-rail');
    expect(design?.goldenRule).toBe('cam-exceto-reference-board');
    expect(design?.logicFlow).toBe('cam-exceto-tap-flow');
    expect(design?.dangerZone).toBe('cam-exceto-trap-arena');
  });

  it('infere cam_exceto_conduta para INCORRETA entre os 9 Certos (prioridade sobre certos)', () => {
    const instruction =
      'Durante o preparo e administração de medicamentos, o técnico deve seguir os certos. Assinale a alternativa INCORRETA.';
    expect(inferPedagogicalBranch(camSubtopico, instruction, [], 'certo_errado')).toBe(
      'cam_exceto_conduta',
    );
  });

  it('infere cam_exceto_conduta para INCORRETA insulina (prioridade sobre alto risco)', () => {
    const instruction =
      'Sobre a prevenção da lipohipertrofia e a aplicação adequada da insulina, assinale a alternativa incorreta.';
    expect(inferPedagogicalBranch(camSubtopico, instruction, [], 'certo_errado')).toBe(
      'cam_exceto_conduta',
    );
  });

  it('infere cam_documentacao para V/F Registro certo', () => {
    const instruction =
      'Avalie as afirmações sobre o Registro certo (Documentação certa) na administração da medicação:\n\nI - Anotar na prescrição ou prontuário somente após administrar o medicamento.\nII - É permitido registrar a medicação antes da administração.\nIII - O registro pode ser postergado para o final do plantão.\n\nÉ CORRETO o que se afirma em:';
    expect(inferPedagogicalBranch(camSubtopico, instruction, [], 'vf')).toBe('cam_documentacao');
    const design = getPresentationDesign(camSubtopico, 'cam_documentacao');
    expect(design?.conceptMap).toBe('cam-documentacao-deck');
    expect(design?.goldenRule).toBe('cam-documentacao-board');
    expect(design?.logicFlow).toBe('cam-documentacao-vf-tap');
    expect(design?.dangerZone).toBe('cam-documentacao-trap-arena');
  });

  it('infere cam_documentacao para listagem 9 certos (São eles)', () => {
    const instruction =
      'Os "9 certos da administração de medicamentos" são empregados para alertar os profissionais. São eles:';
    expect(inferPedagogicalBranch(camSubtopico, instruction, [], 'conceito')).toBe(
      'cam_documentacao',
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

  it('infere respiratorio_generico para asma na APS (educação)', () => {
    const instruction =
      'No âmbito da Atenção Básica à Saúde, a assistência ao usuário com asma exige do técnico atuação educativa.';
    expect(inferPedagogicalBranch(respSubtopico, instruction, [], 'conceito')).toBe(
      'respiratorio_generico',
    );
  });

  it('infere respiratorio_asma_crise para semiologia pediátrica com sibilos', () => {
    const instruction = 'Nas crianças com asma a anormalidade observada com mais frequência é:';
    const slides = [
      { type: 'concept_map', items: [{ label: 'Sibilos expiratórios', detail: 'Ruído na expiração' }] },
    ];
    expect(inferPedagogicalBranch(respSubtopico, instruction, slides, 'conceito')).toBe(
      'respiratorio_asma_crise',
    );
  });
});

describe('pedagogicalBranch — Urgências e Emergências', () => {
  const urgSubtopico = 'Urgências e Emergências';

  it('infere urgencias_rcp_sbv para RCP adulto AHA', () => {
    const instruction =
      'Segundo AHA 2020, assinale a alternativa correta sobre RCP em adulto: compressões 100–120/min, 30:2 e DEA.';
    expect(inferPedagogicalBranch(urgSubtopico, instruction, [], 'protocolo')).toBe(
      'urgencias_rcp_sbv',
    );
    const design = getPresentationDesign(urgSubtopico, 'urgencias_rcp_sbv');
    expect(design?.conceptMap).toBe('urgencias-survival-chain-deck');
    expect(design?.goldenRule).toBe('urgencias-rcp-params-board');
    expect(design?.logicFlow).toBe('urgencias-rcp-tap-flow');
    expect(design?.dangerZone).toBe('urgencias-rcp-trap-arena');
  });

  it('infere urgencias_xabcde_trauma para trauma pré-hospitalar', () => {
    const instruction =
      'Sobre atendimento inicial ao trauma com XABCDE, hemorragia, fratura e queimadura no pré-hospitalar.';
    expect(inferPedagogicalBranch(urgSubtopico, instruction, [], 'protocolo')).toBe(
      'urgencias_xabcde_trauma',
    );
    const design = getPresentationDesign(urgSubtopico, 'urgencias_xabcde_trauma');
    expect(design?.conceptMap).toBe('urgencias-xabcde-rail');
    expect(design?.goldenRule).toBe('urgencias-trauma-reference-board');
    expect(design?.logicFlow).toBe('urgencias-xabcde-tap-flow');
    expect(design?.dangerZone).toBe('urgencias-trauma-trap-arena');
  });

  it('infere urgencias_avc_iam para Cincinnati', () => {
    const instruction =
      'Escala de Cincinnati para suspeita de AVC: assimetria facial, queda de braço e fala anormal.';
    expect(inferPedagogicalBranch(urgSubtopico, instruction, [])).toBe('urgencias_avc_iam');
    const design = getPresentationDesign(urgSubtopico, 'urgencias_avc_iam');
    expect(design?.conceptMap).toBe('urgencias-stroke-signs-deck');
    expect(design?.goldenRule).toBe('urgencias-cincinnati-board');
    expect(design?.logicFlow).toBe('urgencias-stroke-elimination-tap');
    expect(design?.dangerZone).toBe('urgencias-stroke-trap-arena');
  });

  it('infere urgencias_choque para acidente elétrico', () => {
    const instruction =
      'Choque elétrico: vítima presa à corrente. Qual a primeira conduta — interromper circuito antes de tocar?';
    expect(inferPedagogicalBranch(urgSubtopico, instruction, [], 'protocolo')).toBe(
      'urgencias_choque',
    );
    const design = getPresentationDesign(urgSubtopico, 'urgencias_choque');
    expect(design?.conceptMap).toBe('urgencias-shock-types-deck');
    expect(design?.goldenRule).toBe('urgencias-shock-reference-board');
    expect(design?.logicFlow).toBe('urgencias-shock-tap-flow');
    expect(design?.dangerZone).toBe('urgencias-shock-trap-arena');
  });

  it('infere urgencias_engasgo para sinal universal', () => {
    const instruction =
      'O sinal universal de engasgo é quando a pessoa leva as mãos ao pescoço em obstrução de via aérea.';
    expect(inferPedagogicalBranch(urgSubtopico, instruction, [])).toBe('urgencias_engasgo');
    const design = getPresentationDesign(urgSubtopico, 'urgencias_engasgo');
    expect(design?.conceptMap).toBe('urgencias-choking-signal-deck');
    expect(design?.goldenRule).toBe('urgencias-heimlich-board');
    expect(design?.logicFlow).toBe('urgencias-choking-tap-flow');
    expect(design?.dangerZone).toBe('urgencias-choking-trap-arena');
  });

  it('prioriza urgencias_xabcde_trauma sobre engasgo quando corpus tem XABCDE+hemorragia+imobilização', () => {
    const instruction =
      'Obstrução de via aérea total: iniciar manobra de Heimlich após falha de ventilação.';
    const slides = [
      {
        type: 'concept_map',
        footer_rule: 'XABCDE trauma — hemorragia e imobilização',
        items: [{ label: 'APH', detail: 'Trauma pré-hospitalar com esmagamento e imobilização' }],
      },
      {
        type: 'golden_rule',
        footer_rule: 'XABCDE trauma — hemorragia e imobilização',
        content: 'VAA no trauma — não confundir com engasgo isolado',
      },
    ];
    expect(inferPedagogicalBranch(urgSubtopico, instruction, slides, 'protocolo')).toBe(
      'urgencias_xabcde_trauma',
    );
  });

  it('infere urgencias_anafilaxia antes de choque quando slides citam choque refratário', () => {
    const instruction =
      'Anafilaxia em criança após dipirona: epinefrina IM na coxa. IV reservada a PCR ou hipotensão refratária.';
    const slides = [
      {
        type: 'golden_rule',
        rows: [{ label: 'IV', value: 'PCR ou choque refratário após IM + volume' }],
      },
    ];
    expect(inferPedagogicalBranch(urgSubtopico, instruction, slides, 'protocolo')).toBe(
      'urgencias_anafilaxia',
    );
  });

  it('infere urgencias_rcp_pediatrico para 15:2 pediátrico', () => {
    const instruction =
      'RCP pediátrica sem via aérea avançada: 15:2, terço do diâmetro torácico e 100–120/min.';
    expect(inferPedagogicalBranch(urgSubtopico, instruction, [], 'protocolo')).toBe(
      'urgencias_rcp_pediatrico',
    );
    const design = getPresentationDesign(urgSubtopico, 'urgencias_rcp_pediatrico');
    expect(design?.conceptMap).toBe('urgencias-pediatric-rcp-deck');
    expect(design?.goldenRule).toBe('urgencias-pediatric-params-board');
    expect(design?.logicFlow).toBe('urgencias-pediatric-tap-flow');
    expect(design?.dangerZone).toBe('urgencias-pediatric-trap-arena');
  });

  it('infere urgencias_manchester_triagem para etiquetas coloridas', () => {
    const instruction =
      'Triagem de vítimas múltiplas com etiquetas Manchester: vermelho emergência, amarelo urgente.';
    expect(inferPedagogicalBranch(urgSubtopico, instruction, [])).toBe(
      'urgencias_manchester_triagem',
    );
    const design = getPresentationDesign(urgSubtopico, 'urgencias_manchester_triagem');
    expect(design?.conceptMap).toBe('urgencias-manchester-spectrum');
    expect(design?.goldenRule).toBe('urgencias-manchester-board');
    expect(design?.logicFlow).toBe('cards');
    expect(design?.dangerZone).toBe('urgencias-manchester-trap');
  });

  it('comando EXCETO no enunciado vence IAM/Manchester/choque — urgencias_exceto_conduta', () => {
    expect(
      inferPedagogicalBranch(
        urgSubtopico,
        'Infarto agudo do miocárdio (IAM) — medidas corretas, EXCETO:',
        [],
        'protocolo',
      ),
    ).toBe('urgencias_exceto_conduta');
    expect(
      inferPedagogicalBranch(
        urgSubtopico,
        'Classificação de risco Manchester com acolhimento — objetivos, EXCETO:',
        [],
        'protocolo',
      ),
    ).toBe('urgencias_exceto_conduta');
    expect(
      inferPedagogicalBranch(
        urgSubtopico,
        'Fratura exposta com hipoperfusão — condutas adequadas, EXCETO:',
        [],
        'protocolo',
      ),
    ).toBe('urgencias_exceto_conduta');
    expect(
      inferPedagogicalBranch(
        urgSubtopico,
        'Sobre vantagens do ABCDE no trauma, assinale a alternativa INCORRETA:',
        [],
        'protocolo',
      ),
    ).toBe('urgencias_exceto_conduta');
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

describe('pedagogicalBranch — Saúde da Mulher', () => {
  const subtopico = 'Saúde da Mulher';

  it('infere mulher_prenatal para gestação e pré-natal', () => {
    const instruction =
      'Sobre pré-natal, a primeira consulta deve ocorrer no primeiro trimestre com glicemia de jejum e ácido fólico.';
    expect(inferPedagogicalBranch(subtopico, instruction, [])).toBe('mulher_prenatal');
    const design = getPresentationDesign(subtopico, 'mulher_prenatal');
    expect(design?.conceptMap).toBe('mulher-gestation-timeline');
    expect(design?.goldenRule).toBe('mulher-prenatal-board');
    expect(design?.logicFlow).toBe('mulher-prenatal-tap-flow');
    expect(design?.dangerZone).toBe('mulher-prenatal-trap-arena');
  });

  it('infere mulher_parto para trabalho de parto', () => {
    const instruction =
      'Sobre boas práticas no trabalho de parto humanizado, analise as afirmativas sobre fase expulsiva.';
    expect(inferPedagogicalBranch(subtopico, instruction, [])).toBe('mulher_parto');
    const design = getPresentationDesign(subtopico, 'mulher_parto');
    expect(design?.conceptMap).toBe('mulher-labor-phase-deck');
    expect(design?.goldenRule).toBe('mulher-parto-humanizado-board');
    expect(design?.logicFlow).toBe('mulher-labor-tap-flow');
    expect(design?.dangerZone).toBe('mulher-parto-trap-arena');
  });

  it('infere mulher_papanicolau para rastreio de colo', () => {
    const instruction =
      'Para rastreio do câncer de colo do útero, o Papanicolau deve ser realizado entre 25 e 64 anos.';
    expect(inferPedagogicalBranch(subtopico, instruction, [])).toBe('mulher_papanicolau');
    const design = getPresentationDesign(subtopico, 'mulher_papanicolau');
    expect(design?.conceptMap).toBe('mulher-screening-spectrum');
    expect(design?.goldenRule).toBe('mulher-papanicolau-board');
    expect(design?.logicFlow).toBe('mulher-screening-tap-flow');
    expect(design?.dangerZone).toBe('mulher-screening-trap-arena');
  });

  it('infere mulher_mama para rastreio de mama', () => {
    const instruction =
      'Sobre mamografia no rastreamento do câncer de mama, a faixa etária recomendada é de 50 a 69 anos.';
    expect(inferPedagogicalBranch(subtopico, instruction, [])).toBe('mulher_mama');
    const design = getPresentationDesign(subtopico, 'mulher_mama');
    expect(design?.conceptMap).toBe('mulher-mammography-spectrum');
    expect(design?.goldenRule).toBe('mulher-mama-board');
    expect(design?.logicFlow).toBe('mulher-mama-tap-flow');
    expect(design?.dangerZone).toBe('mulher-mama-trap-arena');
  });

  const puncaoSubtopico = 'Punção Venosa e Cuidados com Cateteres';

  it('infere puncao_flebite para complicação infiltração', () => {
    const instruction =
      'Ao administrar medicamentos endovenosos, você observou passagem do líquido para o tecido subcutâneo por deslocamento da agulha. Esse acidente resultou em:';
    expect(inferPedagogicalBranch(puncaoSubtopico, instruction, [], 'conceito')).toBe(
      'puncao_flebite',
    );
    const design = getPresentationDesign(puncaoSubtopico, 'puncao_flebite');
    expect(design?.conceptMap).toBe('iv-complication-tissue-layers');
    expect(design?.goldenRule).toBe('iv-differential-board');
    expect(design?.logicFlow).toBe('iv-complication-tap-flow');
    expect(design?.dangerZone).toBe('iv-label-swap-trap');
  });

  it('infere puncao_ipcs_cvc para bundle CVC', () => {
    const instruction =
      'Sobre o bundle de prevenção de ICS associada a cateter venoso central, assinale a alternativa correta quanto à barreira estéril máxima e corrente sanguínea.';
    expect(inferPedagogicalBranch(puncaoSubtopico, instruction, [], 'conceito')).toBe(
      'puncao_ipcs_cvc',
    );
    const design = getPresentationDesign(puncaoSubtopico, 'puncao_ipcs_cvc');
    expect(design?.conceptMap).toBe('iv-bundle-orbit');
    expect(design?.dangerZone).toBe('iv-bundle-break-trap');
  });

  it('infere puncao_exceto para comando EXCETO punção', () => {
    const instruction = 'São cuidados na administração endovenosa, exceto:';
    expect(inferPedagogicalBranch(puncaoSubtopico, instruction, [], 'certo_errado')).toBe(
      'puncao_exceto',
    );
  });

  it('infere puncao_dispositivo para calibre jelco', () => {
    const instruction =
      'Para infusão rápida em adulto, qual calibre de jelco (G) é mais indicado?';
    expect(inferPedagogicalBranch(puncaoSubtopico, instruction, [], 'conceito')).toBe(
      'puncao_dispositivo',
    );
  });
});

describe('inferPedagogicalBranch — História da Enfermagem', () => {
  const subtopico = 'História da Enfermagem';

  it('infere historia_nightingale para Nightingale e SUS', () => {
    const instruction =
      'Florence Nightingale é fundadora da enfermagem moderna na Guerra da Crimeia. A enfermagem brasileira surgiu apenas após o SUS em 1988.';
    expect(inferPedagogicalBranch(subtopico, instruction, [], 'vf')).toBe('historia_nightingale');
  });

  it('infere historia_comunicacao_etica para COFEN e comunicação', () => {
    const instruction =
      'O Código de Ética dos Profissionais de Enfermagem é norma do COFEN. Ruídos na comunicação impedem o receptor de decodificar a mensagem.';
    expect(inferPedagogicalBranch(subtopico, instruction, [], 'legis')).toBe(
      'historia_comunicacao_etica',
    );
  });

  it('infere historia_humanizacao para V/F humanização I–IV', () => {
    const instruction =
      'Sobre humanização na saúde:\nI - incentivar colaboração interdisciplinar.\nII - humanizar é apenas amenizar dor hospitalar.\nIII - dar lugar à palavra do usuário.';
    expect(inferPedagogicalBranch(subtopico, instruction, [], 'vf')).toBe('historia_humanizacao');
  });

  it('infere historia_generico para cauda teorias administrativas', () => {
    const instruction = 'Sobre as principais teorias administrativas na Enfermagem, assinale a alternativa correta.';
    expect(inferPedagogicalBranch(subtopico, instruction, [], 'conceito')).toBe('historia_generico');
  });
});

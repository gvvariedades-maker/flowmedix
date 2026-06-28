#!/usr/bin/env tsx
/**
 * Inferências do piloto catch-all (agente lendo enunciados).
 * Gera *-inferred.json para catalog-merge-agent-infer.
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

type InferRow = {
  modulo_slug: string;
  suggested_subtopico: string;
  confidence: number;
  keep_current: boolean;
  rationale: string;
};

const PROC_DIV: InferRow[] = [
  {
    modulo_slug: 'amauc-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563685104-6',
    suggested_subtopico: 'Segurança do Paciente',
    confidence: 0.91,
    keep_current: false,
    rationale: 'Gestão de estoque e inventário hospitalar — qualidade e segurança assistencial, não procedimento técnico de beira-leito.',
  },
  {
    modulo_slug: 'avancasp-enfermagem-nutricao-aplicada-a-enfermagem-1777102845644-6',
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.92,
    keep_current: false,
    rationale: 'Cálculo de IMC e avaliação antropométrica — promoção/prevenção nutricional; slug confirma nutrição aplicada.',
  },
  {
    modulo_slug: 'cebraspe-cespe-enfermagem-nutricao-aplicada-a-enfermagem-1777102983353-5',
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.91,
    keep_current: false,
    rationale: 'Manejo nutricional da disfagia em idoso — cuidado nutricional preventivo, não procedimento diverso genérico.',
  },
  {
    modulo_slug: 'cogeps-unioeste-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563707368-7',
    suggested_subtopico: 'História da Enfermagem',
    confidence: 0.93,
    keep_current: false,
    rationale: 'Direitos e deveres do profissional de enfermagem — ética e marco profissional, não técnica procedimental.',
  },
  {
    modulo_slug: 'fau-unicentro-enfermagem-nutricao-aplicada-a-enfermagem-1777102845644-7',
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.91,
    keep_current: false,
    rationale: 'Avaliação antropométrica como medida corporal — nutrição/promoção à saúde.',
  },
  {
    modulo_slug: 'fauel-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563923516-7',
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.95,
    keep_current: false,
    rationale: 'Empatia na relação de cuidado — comunicação em promoção à saúde; slug confirma o tema.',
  },
  {
    modulo_slug: 'fcpc-enfermagem-processo-de-enfermagem-1780004906875-4',
    suggested_subtopico: 'Urgências e Emergências',
    confidence: 0.94,
    keep_current: false,
    rationale: 'Reação transfusional aguda (calafrios, dor lombar, dispneia) — conduta de emergência imediata.',
  },
  {
    modulo_slug: 'fenix-instituto-enfermagem-processo-de-enfermagem-1780006480333-3',
    suggested_subtopico: 'Processo de Enfermagem',
    confidence: 0.91,
    keep_current: false,
    rationale: 'Balanço hídrico e aceitação alimentar — monitorização no processo de enfermagem.',
  },
  {
    modulo_slug: 'fepese-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563695950-3',
    suggested_subtopico: 'Procedimentos Diversos',
    confidence: 0.92,
    keep_current: true,
    rationale: 'Elementos da comunicação em contexto de gestão da qualidade — permanece em bucket administrativo.',
  },
  {
    modulo_slug: 'funatec-enfermagem-atencao-basica-saude-da-familia-1778968239687-0',
    suggested_subtopico: 'Atenção Básica / Saúde da Família',
    confidence: 0.95,
    keep_current: false,
    rationale: 'Comunicação terapêutica (paráfrase) na APS; slug e conteúdo confirmam atenção básica.',
  },
  {
    modulo_slug: 'fundatec-enfermagem-processo-de-enfermagem-1780006947080-1',
    suggested_subtopico: 'Procedimentos Diversos',
    confidence: 0.91,
    keep_current: true,
    rationale: 'Requisitos de quarto para radiofármacos — procedimento hospitalar específico sem subtópico canônico melhor.',
  },
  {
    modulo_slug: 'fundatec-enfermagem-processo-de-enfermagem-1780011961798-1',
    suggested_subtopico: 'Procedimentos Diversos',
    confidence: 0.92,
    keep_current: true,
    rationale: 'Posicionamento de eletrodos para ECG — técnica complementar que permanece em procedimentos diversos.',
  },
  {
    modulo_slug: 'fundepes-copeve-ufal-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563707368-0',
    suggested_subtopico: 'Segurança do Paciente',
    confidence: 0.92,
    keep_current: false,
    rationale: 'Tipos e regras de alta hospitalar — segurança do paciente e continuidade do cuidado.',
  },
  {
    modulo_slug: 'gama-enfermagem-nutricao-aplicada-a-enfermagem-1777102926437-0',
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.93,
    keep_current: false,
    rationale: 'Dietas básicas e especiais — nutrição aplicada à promoção/prevenção.',
  },
  {
    modulo_slug: 'icece-enfermagem-outros-temas-de-enfermagem-1780001440222-3',
    suggested_subtopico: 'Urgências e Emergências',
    confidence: 0.96,
    keep_current: false,
    rationale: 'HDA com choque e compatibilidade transfusiona em emergência — urgência hemodinâmica.',
  },
  {
    modulo_slug: 'idecan-enfermagem-cuidados-gerais-com-higiene-e-conforto-do-paciente-1778712184780-6',
    suggested_subtopico: 'Procedimentos Diversos',
    confidence: 0.95,
    keep_current: true,
    rationale: 'Higiene íntima masculina — procedimento de conforto/higiene; bucket correto.',
  },
  {
    modulo_slug: 'idecan-enfermagem-enfermagem-em-oncologia-1778712409051-5',
    suggested_subtopico: 'Procedimentos Diversos',
    confidence: 0.91,
    keep_current: true,
    rationale: 'Cuidado oral em quimioterapia — procedimento de suporte sem subtópico oncológico canônico.',
  },
  {
    modulo_slug: 'idecan-enfermagem-procedimentos-diversos-1778712184780-8',
    suggested_subtopico: 'Assistência Perioperatória (Inclui SRPA)',
    confidence: 0.96,
    keep_current: false,
    rationale: 'Tricotomia e cuidados pré-operatórios — assistência perioperatória.',
  },
  {
    modulo_slug: 'idecan-enfermagem-protocolos-e-diretrizes-do-ministerio-da-saude-1780067048498-1',
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.9,
    keep_current: false,
    rationale: 'Sistema Nacional de Transplantes e diretrizes do MS — política de saúde e prevenção.',
  },
  {
    modulo_slug: 'idib-enfermagem-procedimentos-diversos-1778934900821-0',
    suggested_subtopico: 'Enfermagem em Centro Cirúrgico',
    confidence: 0.96,
    keep_current: false,
    rationale: 'Pinças hemostáticas no intraoperatório — instrumentação em centro cirúrgico.',
  },
  {
    modulo_slug: 'idib-enfermagem-saude-do-idoso-1778934944659-7',
    suggested_subtopico: 'Procedimentos Diversos',
    confidence: 0.89,
    keep_current: true,
    rationale: 'Avaliação gerontogeriátrica ampla — sem subtópico canônico de idoso; permanece no catch-all.',
  },
  {
    modulo_slug: 'igeduc-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563707368-1',
    suggested_subtopico: 'Procedimentos Diversos',
    confidence: 0.93,
    keep_current: true,
    rationale: 'Estilos de liderança em gestão — tema administrativo no bucket adequado.',
  },
  {
    modulo_slug: 'igeduc-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563707368-4',
    suggested_subtopico: 'Segurança do Paciente',
    confidence: 0.91,
    keep_current: false,
    rationale: 'Provisão de recursos materiais em gestão hospitalar — gestão da qualidade/NSP.',
  },
  {
    modulo_slug: 'igeduc-enfermagem-nutricao-aplicada-a-enfermagem-1777102926437-5',
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.93,
    keep_current: false,
    rationale: 'Dieta branda — nutrição terapêutica preventiva.',
  },
  {
    modulo_slug: 'imparh-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563713110-9',
    suggested_subtopico: 'Enfermagem do Trabalho',
    confidence: 0.91,
    keep_current: false,
    rationale: 'Relacionamento interpessoal no ambiente de trabalho — saúde do trabalhador.',
  },
  {
    modulo_slug: 'instituto-aocp-geral-procedimentos-1777103510083-2',
    suggested_subtopico: 'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)',
    confidence: 0.96,
    keep_current: false,
    rationale: 'Prova do laço na suspeita de dengue — doença viral de interesse epidemiológico.',
  },
  {
    modulo_slug: 'instituto-consulpam-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563707368-6',
    suggested_subtopico: 'Segurança do Paciente',
    confidence: 0.9,
    keep_current: false,
    rationale: 'Qualidade no atendimento ao público — segurança e experiência do paciente.',
  },
  {
    modulo_slug: 'instituto-consulplan-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563707368-3',
    suggested_subtopico: 'Segurança do Paciente',
    confidence: 0.91,
    keep_current: false,
    rationale: 'Eficiência na gestão de gastos em saúde — gestão da qualidade assistencial.',
  },
  {
    modulo_slug: 'instituto-verbena-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563713110-4',
    suggested_subtopico: 'Procedimentos Diversos',
    confidence: 0.9,
    keep_current: true,
    rationale: 'Multidisciplinaridade em equipe — gestão administrativa; permanece no catch-all.',
  },
  {
    modulo_slug: 'objetiva-concursos-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563701860-6',
    suggested_subtopico: 'Processo de Enfermagem',
    confidence: 0.93,
    keep_current: false,
    rationale: 'Avaliação abrangente da dor — etapa do processo de enfermagem (avaliação).',
  },
  {
    modulo_slug: 'ufmt-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563695950-5',
    suggested_subtopico: 'Procedimentos Diversos',
    confidence: 0.89,
    keep_current: true,
    rationale: 'Trabalho em equipe em gestão — permanece em bucket administrativo.',
  },
  {
    modulo_slug: 'ufmt-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563713110-7',
    suggested_subtopico: 'Segurança do Paciente',
    confidence: 0.9,
    keep_current: false,
    rationale: 'Funções do gerenciamento (planejar, organizar, controlar, liderar) — gestão da qualidade.',
  },
  {
    modulo_slug: 'unesc-enfermagem-procedimentos-diversos-1780000535393-8',
    suggested_subtopico: 'Procedimentos Diversos',
    confidence: 0.97,
    keep_current: true,
    rationale: 'Condutas gerais na execução de procedimentos de enfermagem — tema central do bucket.',
  },
  {
    modulo_slug: 'vunesp-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563718396-3',
    suggested_subtopico: 'Procedimentos Diversos',
    confidence: 0.9,
    keep_current: true,
    rationale: 'Trabalho em equipe multiprofissional em gestão — permanece no catch-all.',
  },
  {
    modulo_slug: 'vunesp-enfermagem-nutricao-aplicada-a-enfermagem-1777102845644-1',
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.93,
    keep_current: false,
    rationale: 'Dieta pastosa — classificação de dietas terapêuticas em nutrição.',
  },
];

const DCNT: InferRow[] = [
  {
    modulo_slug: 'adm-tec-enfermagem-processo-de-enfermagem-1776056021381-4',
    suggested_subtopico: 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    confidence: 0.9,
    keep_current: true,
    rationale: 'Manejo de sintomas em paciente oncológico crônico — permanece no bucket DCNT mescladas.',
  },
  {
    modulo_slug: 'amauc-enfermagem-processo-de-enfermagem-1780001517858-1',
    suggested_subtopico: 'Urgências e Emergências',
    confidence: 0.96,
    keep_current: false,
    rationale: 'Intoxicação por organofosforados e crise colinérgica — emergência toxicológica aguda, não DCNT.',
  },
  {
    modulo_slug: 'ameosc-enfermagem-processo-de-enfermagem-1780001613305-8',
    suggested_subtopico: 'Cálculo de Administração de Medicamentos e Infusões',
    confidence: 0.95,
    keep_current: false,
    rationale: 'Cálculo de volume de insulina NPH (UI para ml) — cálculo de medicação.',
  },
  {
    modulo_slug: 'aocp-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563927625-9',
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.94,
    keep_current: false,
    rationale: 'Saneamento e prevenção de doenças diarreicas — determinação social e promoção à saúde.',
  },
  {
    modulo_slug: 'cpcon-uepb-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563946005-4',
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.93,
    keep_current: false,
    rationale: 'Prevenção primária da HAS e mudança de estilo de vida — promoção à saúde.',
  },
  {
    modulo_slug: 'fau-unicentro-enfermagem-nutricao-aplicada-a-enfermagem-1777102944034-9',
    suggested_subtopico: 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    confidence: 0.94,
    keep_current: true,
    rationale: 'Restrição de sódio na HAS — nutrição em doença crônica; bucket DCNT adequado.',
  },
  {
    modulo_slug: 'fepese-enfermagem-processo-de-enfermagem-1780008232871-8',
    suggested_subtopico: 'Saúde da Mulher',
    confidence: 0.96,
    keep_current: false,
    rationale: 'Rastreamento citopatológico (Papanicolau) — saúde da mulher, não DCNT genérico.',
  },
  {
    modulo_slug: 'fepese-enfermagem-seguranca-do-paciente-1777102678563-0',
    suggested_subtopico: 'Curativos e Manejo de Feridas',
    confidence: 0.95,
    keep_current: false,
    rationale: 'Escala dos 5 Is para risco de LPP — prevenção de lesão por pressão em curativos.',
  },
  {
    modulo_slug: 'fgv-enfermagem-processo-de-enfermagem-1780002110600-1',
    suggested_subtopico: 'Enfermagem do Trabalho',
    confidence: 0.94,
    keep_current: false,
    rationale: 'Câncer de pele por exposição solar ocupacional — saúde do trabalhador.',
  },
  {
    modulo_slug: 'fgv-enfermagem-processo-de-enfermagem-1780002110600-2',
    suggested_subtopico: 'Enfermagem do Trabalho',
    confidence: 0.95,
    keep_current: false,
    rationale: 'Síndrome do túnel do carpo por gestos repetitivos — doença relacionada ao trabalho.',
  },
  {
    modulo_slug: 'fgv-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563919067-5',
    suggested_subtopico: 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    confidence: 0.92,
    keep_current: true,
    rationale: 'Circunferência abdominal e risco metabólico — DCNT/obesidade; bucket correto.',
  },
  {
    modulo_slug: 'funatec-enfermagem-nutricao-aplicada-a-enfermagem-1777102944034-4',
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.93,
    keep_current: false,
    rationale: 'Orientação nutricional para obesidade — promoção à saúde e prevenção.',
  },
  {
    modulo_slug: 'iaupe-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563642476-8',
    suggested_subtopico: 'Urgências e Emergências',
    confidence: 0.92,
    keep_current: false,
    rationale: 'Epidemiologia do trauma e perfil de vítimas — conteúdo central é trauma/urgência.',
  },
  {
    modulo_slug: 'ibfc-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563919067-2',
    suggested_subtopico: 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    confidence: 0.96,
    keep_current: true,
    rationale: 'Fatores de risco para diabetes — tema central do bucket DCNT.',
  },
  {
    modulo_slug: 'idecan-enfermagem-doencas-cardiovasculares-e-metabolicas-cronicas-diabete-hipertensao-icc-etc-1778712315153-4',
    suggested_subtopico: 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    confidence: 0.97,
    keep_current: true,
    rationale: 'Prevenção de DCNT por alimentação saudável — bucket DCNT explícito no slug.',
  },
  {
    modulo_slug: 'idecan-enfermagem-outras-questoes-e-questoes-mescladas-sobre-doencas-cronicas-nao-transmissiveis-1778712315153-8',
    suggested_subtopico: 'Atenção Básica / Saúde da Família',
    confidence: 0.95,
    keep_current: false,
    rationale: 'Redes de atenção à saúde para doenças crônicas — modelo de APS/linha de cuidado.',
  },
  {
    modulo_slug: 'idecan-enfermagem-processo-de-enfermagem-1778712122855-5',
    suggested_subtopico: 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    confidence: 0.93,
    keep_current: true,
    rationale: 'Cuidados ao diabético hospitalizado — manejo de DCNT no bucket adequado.',
  },
  {
    modulo_slug: 'idecan-enfermagem-saude-do-idoso-1780067036141-7',
    suggested_subtopico: 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    confidence: 0.9,
    keep_current: true,
    rationale: 'Definição de idoso (60+) — permanece em DCNT/geriatria sem subtópico canônico melhor.',
  },
  {
    modulo_slug: 'idib-enfermagem-outras-questoes-e-questoes-mescladas-sobre-doencas-cronicas-nao-transmissiveis-1778934918280-6',
    suggested_subtopico: 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    confidence: 0.96,
    keep_current: true,
    rationale: 'Fisiopatologia do diabetes mellitus — DCNT central.',
  },
  {
    modulo_slug: 'igeduc-enfermagem-nutricao-aplicada-a-enfermagem-1777102813845-4',
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.9,
    keep_current: false,
    rationale: 'Fundamentos de nutrição e papel do técnico — promoção à saúde nutricional.',
  },
  {
    modulo_slug: 'igeduc-enfermagem-nutricao-aplicada-a-enfermagem-1777102926437-7',
    suggested_subtopico: 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    confidence: 0.94,
    keep_current: true,
    rationale: 'Orientação alimentar em diabetes — DCNT/diabetes no bucket correto.',
  },
  {
    modulo_slug: 'igeduc-enfermagem-nutricao-aplicada-a-enfermagem-1780000630425-0',
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.9,
    keep_current: false,
    rationale: 'Fundamentos de nutrição (duplicata temática) — promoção à saúde.',
  },
  {
    modulo_slug: 'instituto-access-enfermagem-processo-de-enfermagem-1780005797734-7',
    suggested_subtopico: 'Atenção Básica / Saúde da Família',
    confidence: 0.96,
    keep_current: false,
    rationale: 'Visita domiciliar e manejo de DM2 na APS — atenção básica.',
  },
  {
    modulo_slug: 'instituto-ibed-enfermagem-processo-de-enfermagem-1780004926596-9',
    suggested_subtopico: 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    confidence: 0.95,
    keep_current: true,
    rationale: 'Inspeção dos pés do diabético — complicação crônica do diabetes.',
  },
  {
    modulo_slug: 'legalle-enfermagem-processo-de-enfermagem-1780010585356-1',
    suggested_subtopico: 'Saúde da Mulher',
    confidence: 0.97,
    keep_current: false,
    rationale: 'Sangramento uterino anormal na pós-menopausa — ginecologia/saúde da mulher.',
  },
  {
    modulo_slug: 'legalle-enfermagem-processo-de-enfermagem-1780010594524-1',
    suggested_subtopico: 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    confidence: 0.96,
    keep_current: true,
    rationale: 'Controle glicêmico e HbA1c no diabetes — DCNT central.',
  },
  {
    modulo_slug: 'legalle-enfermagem-processo-de-enfermagem-1780010917301-0',
    suggested_subtopico: 'Saúde da Mulher',
    confidence: 0.97,
    keep_current: false,
    rationale: 'Câncer do colo do útero e HPV — rastreamento em saúde da mulher.',
  },
  {
    modulo_slug: 'ms-sarmento-enfermagem-processo-de-enfermagem-1780008219236-4',
    suggested_subtopico: 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    confidence: 0.98,
    keep_current: true,
    rationale: 'Tríade clássica do diabetes — DCNT.',
  },
  {
    modulo_slug: 'ms-sarmento-enfermagem-processo-de-enfermagem-1780008219236-9',
    suggested_subtopico: 'Saúde da Mulher',
    confidence: 0.97,
    keep_current: false,
    rationale: 'Câncer do colo e HPV — saúde da mulher.',
  },
  {
    modulo_slug: 'nao-informado-geral-promocao-a-saude-e-prevencao-de-agravos-1779563909811-0',
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.94,
    keep_current: false,
    rationale: 'Redução de sal para prevenir hipertensão — promoção à saúde.',
  },
  {
    modulo_slug: 'objetiva-concursos-enfermagem-nutricao-aplicada-a-enfermagem-1777102944034-8',
    suggested_subtopico: 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    confidence: 0.93,
    keep_current: true,
    rationale: 'Classificação de IMC/obesidade (Caderno CAB) — DCNT/obesidade.',
  },
  {
    modulo_slug: 'objetiva-concursos-enfermagem-processo-de-enfermagem-1780010566816-6',
    suggested_subtopico: 'Saúde Mental',
    confidence: 0.93,
    keep_current: false,
    rationale: 'Doença de Alzheimer e perda de memória — saúde mental/neurodegeneração.',
  },
  {
    modulo_slug: 'sc-treinamentos-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563919067-1',
    suggested_subtopico: 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    confidence: 0.96,
    keep_current: true,
    rationale: 'Autocuidado no diabetes mellitus — DCNT.',
  },
  {
    modulo_slug: 'unifil-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563927625-2',
    suggested_subtopico: 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    confidence: 0.94,
    keep_current: true,
    rationale: 'Potássio e controle pressórico na HAS — DCNT/hipertensão.',
  },
  {
    modulo_slug: 'unifil-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563946005-3',
    suggested_subtopico: 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    confidence: 0.92,
    keep_current: true,
    rationale: 'Autocuidado em doença crônica — permanece no bucket DCNT.',
  },
  {
    modulo_slug: 'unifil-enfermagem-seguranca-do-paciente-1779563443877-0',
    suggested_subtopico: 'Cuidados na Administração de Medicamentos',
    confidence: 0.94,
    keep_current: false,
    rationale: 'Técnica de aplicação de insulina — administração de medicamentos.',
  },
];

function writeInferred(outDir: string, bucket: string, batch: string, rows: InferRow[]) {
  const rel = `${outDir}/batch-${batch}-inferred.json`;
  writeFileSync(
    resolve(process.cwd(), rel),
    JSON.stringify({ batch, bucket, inferences: rows }, null, 2) + '\n',
  );
  return rel;
}

writeInferred('artifacts/reclass/procedimentos-diversos', 'Procedimentos Diversos', '01', PROC_DIV);
writeInferred(
  'artifacts/reclass/dcnt-mescladas',
  'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
  '01',
  DCNT,
);

const procMoves = PROC_DIV.filter((r) => !r.keep_current && r.confidence >= 0.9).length;
const dcntMoves = DCNT.filter((r) => !r.keep_current && r.confidence >= 0.9).length;
console.log(
  JSON.stringify(
    {
      procedimentos_diversos: { total: PROC_DIV.length, applicable_moves: procMoves },
      dcnt: { total: DCNT.length, applicable_moves: dcntMoves },
    },
    null,
    2,
  ),
);

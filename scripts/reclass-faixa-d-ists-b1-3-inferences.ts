#!/usr/bin/env tsx
/** Classificações agente — ISTs (faixa D, onda 7, lotes 01–03). HIV/sífilis/hepatites. */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

type InferRow = {
  modulo_slug: string;
  suggested_subtopico: string;
  confidence: number;
  keep_current: boolean;
  rationale: string;
};

const BUCKET = 'Infecções Sexualmente Transmissíveis (ISTs)';
const OUT = 'artifacts/reclass/faixa-d/ists';

/** Movimentações com tema dominante fora do bucket IST (HIV/sífilis/hepatites). */
const MOVES: Record<
  string,
  { suggested_subtopico: string; confidence: number; rationale: string }
> = {
  'adm-tec-enfermagem-atencao-basica-saude-da-familia-1778968077998-3': {
    suggested_subtopico: 'Atenção Básica / Saúde da Família',
    confidence: 0.93,
    rationale: 'Visita domiciliar rural — saneamento e promoção na APS.',
  },
  'adm-tec-enfermagem-processo-de-enfermagem-1776056021381-3': {
    suggested_subtopico: 'Processo de Enfermagem',
    confidence: 0.95,
    rationale: 'Deveres do paciente no SUS — ética e direitos.',
  },
  'adm-tec-enfermagem-processo-de-enfermagem-1776056129848-4': {
    suggested_subtopico: 'Processo de Enfermagem',
    confidence: 0.94,
    rationale: 'Sigilo e acesso ao prontuário — confidencialidade.',
  },
  'agirh-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563937068-0': {
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.95,
    rationale: 'Benefícios da atividade física — promoção da saúde.',
  },
  'agirh-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563937068-1': {
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.92,
    rationale: 'Comunicação e humanização nos serviços de saúde.',
  },
  'amauc-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563848614-3': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.91,
    rationale: 'Conceito de pandemia e histórico epidemiológico global.',
  },
  'amauc-enfermagem-nutricao-aplicada-a-enfermagem-1777102813845-6': {
    suggested_subtopico: 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    confidence: 0.94,
    rationale: 'Assistência de enfermagem na DRGE — hábitos e medicação.',
  },
  'amauc-enfermagem-nutricao-aplicada-a-enfermagem-1777102983353-1': {
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.91,
    rationale: 'Alimentação e nutrição como determinantes da saúde.',
  },
  'amauc-enfermagem-processo-de-enfermagem-1780002441285-5': {
    suggested_subtopico: 'Urgências e Emergências',
    confidence: 0.95,
    rationale: 'Priorização e atendimento inicial em emergência.',
  },
  'amauc-enfermagem-processo-de-enfermagem-1780005128081-4': {
    suggested_subtopico: 'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)',
    confidence: 0.96,
    rationale: 'Tuberculose — vigilância e características na APS.',
  },
  'amauc-enfermagem-processo-de-enfermagem-1780006486032-9': {
    suggested_subtopico: 'Processo de Enfermagem',
    confidence: 0.91,
    rationale: 'Trabalho em equipe multiprofissional e comunicação assistencial.',
  },
  'ameosc-enfermagem-processo-de-enfermagem-1776056158507-4': {
    suggested_subtopico: 'Processo de Enfermagem',
    confidence: 0.94,
    rationale: 'Comunicação terapêutica, plantão e registros de enfermagem.',
  },
  'ameosc-enfermagem-processo-de-enfermagem-1776056158507-5': {
    suggested_subtopico: 'Processo de Enfermagem',
    confidence: 0.94,
    rationale: 'Organização do trabalho, passagem de plantão e anotações.',
  },
  'ameosc-enfermagem-processo-de-enfermagem-1776056181857-0': {
    suggested_subtopico: 'Processo de Enfermagem',
    confidence: 0.95,
    rationale: 'Uso correto do prontuário e registros de enfermagem.',
  },
  'ameosc-enfermagem-processo-de-enfermagem-1776056181857-5': {
    suggested_subtopico: 'Processo de Enfermagem',
    confidence: 0.93,
    rationale: 'Direitos do usuário, sigilo e Ouvidoria no SUS.',
  },
  'ameosc-enfermagem-processo-de-enfermagem-1780001613305-6': {
    suggested_subtopico: 'Medidas de Prevenção e Precaução de Contato',
    confidence: 0.92,
    rationale: 'Higienização das mãos para prevenir IRAS.',
  },
  'ameosc-enfermagem-processo-de-enfermagem-1780005791580-6': {
    suggested_subtopico: 'Assistência Perioperatória (Inclui SRPA)',
    confidence: 0.95,
    rationale: 'Assistência ao paciente cirúrgico — pré/intra/pós.',
  },
  'ameosc-enfermagem-processo-de-enfermagem-1780008225255-8': {
    suggested_subtopico: 'Processo de Enfermagem',
    confidence: 0.91,
    rationale: 'Organização da unidade e responsabilidades do técnico.',
  },
  'avancasp-enfermagem-processo-de-enfermagem-1776056009428-8': {
    suggested_subtopico: 'Assistência Perioperatória (Inclui SRPA)',
    confidence: 0.94,
    rationale: 'Investigação e coleta de dados na fase pré-operatória.',
  },
  'avancasp-enfermagem-processo-de-enfermagem-1780002834059-8': {
    suggested_subtopico: 'Processo de Enfermagem',
    confidence: 0.92,
    rationale: 'Acolhimento versus triagem mecânica no atendimento.',
  },
  'avancasp-enfermagem-processo-de-enfermagem-1780003793968-8': {
    suggested_subtopico: 'Mobilização e Posicionamento do Paciente',
    confidence: 0.93,
    rationale: 'Conduta com comadre e eliminações do paciente acamado.',
  },
  'avancasp-enfermagem-processo-de-enfermagem-1780006444165-7': {
    suggested_subtopico: 'Noções de Fisiologia',
    confidence: 0.92,
    rationale: 'Hipocalemia e arritmias — distúrbio hidroeletrolítico.',
  },
  'cebraspe-cespe-enfermagem-atencao-basica-saude-da-familia-1778968144588-6': {
    suggested_subtopico: 'Atenção Básica / Saúde da Família',
    confidence: 0.91,
    rationale: 'Problemas coletivos de saúde e participação comunitária na APS.',
  },
  'cebraspe-cespe-enfermagem-processo-de-enfermagem-1780001790945-8': {
    suggested_subtopico: 'Processo de Enfermagem',
    confidence: 0.93,
    rationale: 'Gerenciamento de insumos e controle de estoque assistencial.',
  },
  'cebraspe-cespe-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563914208-0': {
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.92,
    rationale: 'Higiene e diarreia — prevenção de agravos coletivos.',
  },
  'cebraspe-cespe-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563914208-1': {
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.91,
    rationale: 'Determinantes sociais do adoecimento — saúde coletiva.',
  },
  'cebraspe-cespe-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563914208-2': {
    suggested_subtopico: 'Saúde da Criança',
    confidence: 0.94,
    rationale: 'Diarreia infantil e condições de habitação — cuidado pediátrico.',
  },
  'cetrede-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563626015-7': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.95,
    rationale: 'Notificação compulsória de cólera.',
  },
  'cev-urca-enfermagem-processo-de-enfermagem-1780006494066-8': {
    suggested_subtopico: 'Saúde Mental',
    confidence: 0.94,
    rationale: 'Assistência de enfermagem em saúde mental na APS.',
  },
  'cotec-fadenor-enfermagem-processo-de-enfermagem-1780010573104-7': {
    suggested_subtopico: 'Doenças Parasitárias e Zoonoses',
    confidence: 0.93,
    rationale: 'Acidente escorpiônico — anatomia do escorpião e veneno.',
  },
  'cpcon-uepb-enfermagem-processo-de-enfermagem-1780003261833-9': {
    suggested_subtopico: 'Atenção Básica / Saúde da Família',
    confidence: 0.92,
    rationale: 'Planejamento Estratégico Situacional na APS.',
  },
  'cpcon-uepb-enfermagem-processo-de-enfermagem-1780003654722-6': {
    suggested_subtopico: 'Saúde da Mulher',
    confidence: 0.93,
    rationale: 'DIU de cobre e contraindicações — planejamento familiar.',
  },
  'cpcon-uepb-enfermagem-processo-de-enfermagem-1780007238824-2': {
    suggested_subtopico: 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    confidence: 0.94,
    rationale: 'Demências irreversíveis em idosos em ILPI.',
  },
  'cpcon-uepb-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563937068-6': {
    suggested_subtopico: 'Saúde do Adolescente',
    confidence: 0.93,
    rationale: 'Violência contra adolescentes — sinais de suspeita.',
  },
  'decorp-enfermagem-processo-de-enfermagem-1776056158507-2': {
    suggested_subtopico: 'Processo de Enfermagem',
    confidence: 0.92,
    rationale: 'Método SBAR na passagem de plantão.',
  },
  'educa-pb-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563784564-0': {
    suggested_subtopico: 'Segurança do Paciente',
    confidence: 0.91,
    rationale: 'Classificação de grau de dano em incidentes — NSP.',
  },
  'fafipa-enfermagem-processo-de-enfermagem-1780009386446-4': {
    suggested_subtopico: 'Saúde Mental',
    confidence: 0.95,
    rationale: 'Sinais de alerta em saúde mental — mudança de rotina e suicídio.',
  },
  'fafipa-enfermagem-processo-de-enfermagem-1780009392850-1': {
    suggested_subtopico: 'Saúde da Mulher',
    confidence: 0.94,
    rationale: 'Sinais suspeitos de câncer de mama — mamografia SUS.',
  },
  'fau-unicentro-enfermagem-processo-de-enfermagem-1780002375665-1': {
    suggested_subtopico: 'Noções de Fisiologia',
    confidence: 0.91,
    rationale: 'Envelhecimento — redução da densidade óssea.',
  },
  'fau-unicentro-enfermagem-processo-de-enfermagem-1780002375665-2': {
    suggested_subtopico: 'Urgências e Emergências',
    confidence: 0.95,
    rationale: 'Objeto perfurante cravado — tamponamento vascular.',
  },
  'fau-unicentro-enfermagem-processo-de-enfermagem-1780002375665-9': {
    suggested_subtopico: 'Saúde da Mulher',
    confidence: 0.96,
    rationale: 'Rastreio citopatológico do câncer de colo de útero.',
  },
  'fau-unicentro-enfermagem-processo-de-enfermagem-1780009366805-6': {
    suggested_subtopico: 'Saúde da Mulher',
    confidence: 0.95,
    rationale: 'Papanicolau — rastreamento de lesões precursoras.',
  },
  'fauel-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563923516-6': {
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.91,
    rationale: 'Higiene bucal do cuidador — promoção da saúde.',
  },
  'fcc-enfermagem-processo-de-enfermagem-1776056140199-5': {
    suggested_subtopico: 'Processo de Enfermagem',
    confidence: 0.93,
    rationale: 'Atribuições do técnico no Processo de Enfermagem.',
  },
  'fenix-instituto-enfermagem-processo-de-enfermagem-1780001846202-5': {
    suggested_subtopico: 'Medidas de Prevenção e Precaução de Contato',
    confidence: 0.92,
    rationale: 'Técnica asséptica em exames invasivos.',
  },
  'fenix-instituto-enfermagem-processo-de-enfermagem-1780001903454-0': {
    suggested_subtopico: 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    confidence: 0.94,
    rationale: 'HAS — medidas não farmacológicas cardiovasculares.',
  },
  'fepese-enfermagem-processo-de-enfermagem-1780002217274-1': {
    suggested_subtopico: 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    confidence: 0.93,
    rationale: 'Vigilância de DCNT e fatores de risco modificáveis.',
  },
  'fgv-enfermagem-processo-de-enfermagem-1780001988576-6': {
    suggested_subtopico: 'Enfermagem do Trabalho',
    confidence: 0.95,
    rationale: 'Níveis de prevenção do enfermeiro do trabalho.',
  },
  'fgv-enfermagem-processo-de-enfermagem-1780001988576-7': {
    suggested_subtopico: 'Enfermagem do Trabalho',
    confidence: 0.94,
    rationale: 'LER/DORT — assistência ao trabalhador.',
  },
  'fgv-enfermagem-processo-de-enfermagem-1780002110600-6': {
    suggested_subtopico: 'Enfermagem do Trabalho',
    confidence: 0.94,
    rationale: 'Enfermagem e doenças ocupacionais no ambiente laboral.',
  },
  'funatec-enfermagem-processo-de-enfermagem-1776055865890-4': {
    suggested_subtopico: 'Processo de Enfermagem',
    confidence: 0.93,
    rationale: 'Diferença entre evolução e anotação de enfermagem.',
  },
  'funatec-enfermagem-processo-de-enfermagem-1776055865890-7': {
    suggested_subtopico: 'Processo de Enfermagem',
    confidence: 0.92,
    rationale: 'Finalidade da anotação de enfermagem.',
  },
  'fundatec-enfermagem-processo-de-enfermagem-1776056009428-7': {
    suggested_subtopico: 'Processo de Enfermagem',
    confidence: 0.93,
    rationale: 'Registros de enfermagem — finalidades e comunicação.',
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780006947080-6': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.94,
    rationale: 'Notificação compulsória de esporotricose (2025).',
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780007230169-4': {
    suggested_subtopico: 'Urgências e Emergências',
    confidence: 0.92,
    rationale: 'Doenças agudas do trato digestivo — abdome agudo.',
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780007230169-7': {
    suggested_subtopico: 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    confidence: 0.91,
    rationale: 'Doenças musculoesqueléticas — gota, Paget, espondilite.',
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780011956256-6': {
    suggested_subtopico: 'Urgências e Emergências',
    confidence: 0.95,
    rationale: 'APH — sinalização e segurança na cena de acidente.',
  },
  'fundepes-copeve-ufal-enfermagem-processo-de-enfermagem-1776056173194-3': {
    suggested_subtopico: 'Processo de Enfermagem',
    confidence: 0.93,
    rationale: 'Registros de enfermagem — finalidades legais e assistenciais.',
  },
  'fundepes-copeve-ufal-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563950884-5': {
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.92,
    rationale: 'História natural da doença — fases pré-clínica a sequelas.',
  },
  'furb-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563784564-7': {
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.91,
    rationale: 'Modelo História Natural das Doenças — conceito saúde-doença.',
  },
  'furb-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563868300-6': {
    suggested_subtopico: 'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)',
    confidence: 0.96,
    rationale: 'Prevenção da dengue — controle de criadouros do Aedes.',
  },
  'furb-enfermagem-processo-de-enfermagem-1776056129848-1': {
    suggested_subtopico: 'Processo de Enfermagem',
    confidence: 0.94,
    rationale: 'Finalidade do registro de enfermagem no prontuário.',
  },
  'furb-enfermagem-processo-de-enfermagem-1780011887822-7': {
    suggested_subtopico: 'Segurança do Paciente',
    confidence: 0.95,
    rationale: 'Eventos adversos — metas internacionais de segurança.',
  },
  'furb-enfermagem-processo-de-enfermagem-1780011915153-7': {
    suggested_subtopico: 'Segurança do Paciente',
    confidence: 0.94,
    rationale: 'Metas internacionais — higiene das mãos, cirurgia segura, LPP.',
  },
  'furb-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563914208-5': {
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.92,
    rationale: 'Processo saúde-doença e história natural da doença.',
  },
  'gama-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563909811-3': {
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.91,
    rationale: 'Níveis de prevenção e fatores de risco fisiológicos.',
  },
  'ibade-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563838275-7': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.93,
    rationale: 'Período de incubação na história natural da doença.',
  },
  'ibade-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563875555-1': {
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.91,
    rationale: 'Comunicação em campanha de prevenção de DST na comunidade.',
  },
  'ibam-enfermagem-nutricao-aplicada-a-enfermagem-1777102845644-0': {
    suggested_subtopico: 'Saúde do Adolescente',
    confidence: 0.93,
    rationale: 'Avaliação antropométrica do adolescente — escore Z.',
  },
  'ibfc-enfermagem-processo-de-enfermagem-1776056149404-4': {
    suggested_subtopico: 'Processo de Enfermagem',
    confidence: 0.93,
    rationale: 'Atribuições legais do técnico de enfermagem.',
  },
  'idcap-enfermagem-processo-de-enfermagem-1776056021381-6': {
    suggested_subtopico: 'Processo de Enfermagem',
    confidence: 0.92,
    rationale: 'Anamnese, exame físico e posição de Fowler.',
  },
  'idecan-enfermagem-atencao-basica-saude-da-familia-1778712418722-0': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.94,
    rationale: 'Larvicidas no controle vetorial da dengue.',
  },
  'idecan-enfermagem-atencao-basica-saude-da-familia-1778968239687-7': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.94,
    rationale: 'Larvicidas — controle químico do Aedes aegypti.',
  },
  'idecan-enfermagem-doencas-renais-e-hematologicas-cronicas-1778712315153-7': {
    suggested_subtopico: 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    confidence: 0.95,
    rationale: 'Hemofilia tipo B — fator IX e coagulação.',
  },
  'idecan-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1778712270872-0': {
    suggested_subtopico: 'Imunização',
    confidence: 0.94,
    rationale: 'Vigilância da raiva — vacinação e bloqueio de foco.',
  },
  'idecan-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1780066977710-1': {
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.91,
    rationale: 'Doenças relacionadas ao saneamento básico inadequado.',
  },
  'idecan-enfermagem-infeccoes-sexualmente-transmissiveis-ists-1778712294130-1': {
    suggested_subtopico: 'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)',
    confidence: 0.93,
    rationale: 'Candidíase vulvovaginal — fatores predisponentes na anamnese.',
  },
  'idecan-enfermagem-infeccoes-sexualmente-transmissiveis-ists-1778712294130-2': {
    suggested_subtopico: 'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)',
    confidence: 0.96,
    rationale: 'Tuberculose por Mycobacterium tuberculosis.',
  },
  'idecan-enfermagem-infeccoes-sexualmente-transmissiveis-ists-1778712294130-3': {
    suggested_subtopico: 'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)',
    confidence: 0.95,
    rationale: 'Hanseníase — agente e transmissão.',
  },
  'idecan-enfermagem-infeccoes-sexualmente-transmissiveis-ists-1778712294130-4': {
    suggested_subtopico: 'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)',
    confidence: 0.94,
    rationale: 'Transmissão da tuberculose pulmonar — precaução por gotículas.',
  },
  'idecan-enfermagem-infeccoes-sexualmente-transmissiveis-ists-1778712294130-5': {
    suggested_subtopico: 'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)',
    confidence: 0.96,
    rationale: 'Manejo clínico da dengue e sinais de alarme.',
  },
  'idecan-enfermagem-infeccoes-sexualmente-transmissiveis-ists-1778712294130-6': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.93,
    rationale: 'Vigilância epidemiológica no controle da malária.',
  },
  'idecan-enfermagem-infeccoes-sexualmente-transmissiveis-ists-1778712294130-7': {
    suggested_subtopico: 'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)',
    confidence: 0.95,
    rationale: 'Prevenção e controle da dengue — Aedes aegypti.',
  },
  'idecan-enfermagem-infeccoes-sexualmente-transmissiveis-ists-1778712304760-0': {
    suggested_subtopico: 'Doenças Parasitárias e Zoonoses',
    confidence: 0.95,
    rationale: 'Doença de Chagas — Trypanosoma cruzi e barbeiro.',
  },
  'idecan-enfermagem-infeccoes-sexualmente-transmissiveis-ists-1778712304760-1': {
    suggested_subtopico: 'Imunização',
    confidence: 0.94,
    rationale: 'Febre amarela — transmissão e vacinação.',
  },
  'idecan-enfermagem-infeccoes-sexualmente-transmissiveis-ists-1778712304760-2': {
    suggested_subtopico: 'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)',
    confidence: 0.96,
    rationale: 'Vírus dengue — sorotipos e transmissão pelo Aedes.',
  },
  'idecan-enfermagem-infeccoes-sexualmente-transmissiveis-ists-1778712304760-3': {
    suggested_subtopico: 'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)',
    confidence: 0.95,
    rationale: 'Chikungunya — arbovirose transmitida por Aedes.',
  },
  'idecan-enfermagem-infeccoes-sexualmente-transmissiveis-ists-1778712304760-4': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.92,
    rationale: 'Programa Nacional de Controle da Dengue — PNCD.',
  },
  'idecan-enfermagem-infeccoes-sexualmente-transmissiveis-ists-1778712304760-5': {
    suggested_subtopico: 'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)',
    confidence: 0.94,
    rationale: 'Vírus Zika — transmissão pelo Aedes e formas de transmissão.',
  },
  'idecan-enfermagem-infeccoes-sexualmente-transmissiveis-ists-1778712304760-6': {
    suggested_subtopico: 'Doenças Parasitárias e Zoonoses',
    confidence: 0.96,
    rationale: 'Esquistossomose — Schistosoma mansoni e caramujos.',
  },
  'idecan-enfermagem-infeccoes-sexualmente-transmissiveis-ists-1778712304760-7': {
    suggested_subtopico: 'Doenças Parasitárias e Zoonoses',
    confidence: 0.91,
    rationale: 'Zoonoses — transmissão entre animais e humanos.',
  },
  'idecan-enfermagem-infeccoes-sexualmente-transmissiveis-ists-1778712304760-8': {
    suggested_subtopico: 'Doenças Parasitárias e Zoonoses',
    confidence: 0.94,
    rationale: 'Leishmaniose visceral — órgãos acometidos.',
  },
  'idecan-enfermagem-processo-de-enfermagem-1780066909125-1': {
    suggested_subtopico: 'Processo de Enfermagem',
    confidence: 0.92,
    rationale: 'Prognóstico de enfermagem na SAE.',
  },
  'idecan-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1778712270872-3': {
    suggested_subtopico: 'Doenças Parasitárias e Zoonoses',
    confidence: 0.91,
    rationale: 'Acidentes com escorpiões — agravos ambientais.',
  },
  'idecan-enfermagem-protocolos-e-diretrizes-do-ministerio-da-saude-1780067048498-0': {
    suggested_subtopico: 'Saúde da Mulher',
    confidence: 0.93,
    rationale: 'Planejamento familiar e redução da morbimortalidade materna.',
  },
  'idib-enfermagem-atencao-basica-saude-da-familia-1778934936220-5': {
    suggested_subtopico: 'Atenção Básica / Saúde da Família',
    confidence: 0.94,
    rationale: 'Longitudinalidade na Atenção Primária à Saúde.',
  },
  'idib-enfermagem-atencao-basica-saude-da-familia-1778968194611-4': {
    suggested_subtopico: 'Atenção Básica / Saúde da Família',
    confidence: 0.94,
    rationale: 'Longitudinalidade na APS — continuidade do cuidado.',
  },
  'idib-enfermagem-processo-de-enfermagem-1778934863952-3': {
    suggested_subtopico: 'Processo de Enfermagem',
    confidence: 0.94,
    rationale: 'Planejamento da SAE — priorização de diagnósticos NANDA.',
  },
  'igecap-enfermagem-processo-de-enfermagem-1780004293191-7': {
    suggested_subtopico: 'Processo de Enfermagem',
    confidence: 0.91,
    rationale: 'Controle hídrico e registro da diurese.',
  },
  'igeduc-enfermagem-neoplasias-e-cancer-1780001148264-6': {
    suggested_subtopico: 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    confidence: 0.94,
    rationale: 'Câncer — detecção precoce e papel do técnico.',
  },
  'igeduc-enfermagem-processo-de-enfermagem-1780010559720-3': {
    suggested_subtopico: 'Atenção Básica / Saúde da Família',
    confidence: 0.92,
    rationale: 'Anotações de enfermagem na ESF/Atenção Básica.',
  },
  'igeduc-enfermagem-processo-de-enfermagem-1780010559720-4': {
    suggested_subtopico: 'Medidas de Prevenção e Precaução de Contato',
    confidence: 0.92,
    rationale: 'Técnicas assépticas e antissépticas na APS.',
  },
  'igeduc-enfermagem-processo-de-enfermagem-1780010559720-7': {
    suggested_subtopico: 'Segurança do Paciente',
    confidence: 0.93,
    rationale: 'Segurança do paciente na Atenção Básica — identificação e protocolos.',
  },
};

function shortRationale(instruction: string): string {
  const one = instruction.replace(/\s+/g, ' ').trim();
  const cut = one.length > 72 ? `${one.slice(0, 69)}…` : one;
  return `Tema IST/HIV/hepatites: ${cut}`;
}

function loadBatch(batch: string): InferRow[] {
  const rel = `${OUT}/batch-${batch}.json`;
  const data = JSON.parse(readFileSync(resolve(process.cwd(), rel), 'utf8')) as {
    items: { modulo_slug: string; instruction: string }[];
  };
  return data.items.map((item) => {
    const move = MOVES[item.modulo_slug];
    if (move) {
      return {
        modulo_slug: item.modulo_slug,
        suggested_subtopico: move.suggested_subtopico,
        confidence: move.confidence,
        keep_current: false,
        rationale: move.rationale,
      };
    }
    return {
      modulo_slug: item.modulo_slug,
      suggested_subtopico: BUCKET,
      confidence: 0.94,
      keep_current: true,
      rationale: shortRationale(item.instruction),
    };
  });
}

const BATCH01 = loadBatch('01');
const BATCH02 = loadBatch('02');
const BATCH03 = loadBatch('03');

function writeInferred(batch: string, rows: InferRow[]) {
  const rel = `${OUT}/batch-${batch}-inferred.json`;
  writeFileSync(
    resolve(process.cwd(), rel),
    JSON.stringify({ batch, bucket: BUCKET, inferences: rows }, null, 2) + '\n',
  );
  const moves = rows.filter((r) => !r.keep_current && r.confidence >= 0.9).length;
  console.log(`${BUCKET} batch-${batch}: ${rows.length} scanned, ${moves} moves (>=0.90)`);
}

const total = BATCH01.length + BATCH02.length + BATCH03.length;
if (total !== 150) {
  throw new Error(`Esperado 150 questões, obtido ${total}`);
}
if (Object.keys(MOVES).length !== 103) {
  throw new Error(`Esperado 103 movimentações, obtido ${Object.keys(MOVES).length}`);
}

writeInferred('01', BATCH01);
writeInferred('02', BATCH02);
writeInferred('03', BATCH03);

const all = [...BATCH01, ...BATCH02, ...BATCH03];
const moves = all.filter((r) => !r.keep_current && r.confidence >= 0.9);
console.log(`TOTAL: ${all.length} scanned, ${moves.length} moves (>=0.90)`);

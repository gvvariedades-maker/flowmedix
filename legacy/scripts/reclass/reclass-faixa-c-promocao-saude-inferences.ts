#!/usr/bin/env tsx
/** Classificações agente — Promoção à Saúde e Prevenção de Agravos (faixa C, onda 5). */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

type InferRow = {
  modulo_slug: string;
  suggested_subtopico: string;
  confidence: number;
  keep_current: boolean;
  rationale: string;
};

const BUCKET = 'Promoção à Saúde e Prevenção de Agravos';
const OUT = 'artifacts/reclass/faixa-c/promocao-saude';
const DCNT = 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis';
const APS = 'Atenção Básica / Saúde da Família';
const IST = 'Infecções Sexualmente Transmissíveis (ISTs)';
const PROC = 'Procedimentos Diversos';
const PE = 'Processo de Enfermagem';
const PARAS = 'Doenças Parasitárias e Zoonoses';
const EPID = 'Epidemiologia e Vigilância Epidemiológica';
const SM = 'Saúde da Mulher';
const SC = 'Saúde da Criança';
const SA = 'Saúde do Adolescente';

const BATCH01: InferRow[] = [
  { modulo_slug: 'adm-tec-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563863195-1', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'PICS e participação comunitária na promoção da saúde coletiva.' },
  { modulo_slug: 'adm-tec-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563863195-3', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Consolidação de práticas integrativas com diálogo comunitário.' },
  { modulo_slug: 'adm-tec-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563863195-4', suggested_subtopico: BUCKET, confidence: 0.94, keep_current: true, rationale: 'Impactos das PICS na saúde coletiva e atenção primária.' },
  { modulo_slug: 'adm-tec-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563914208-6', suggested_subtopico: BUCKET, confidence: 0.97, keep_current: true, rationale: 'Metodologias de educação em saúde para mudança comportamental.' },
  { modulo_slug: 'amauc-enfermagem-processo-de-enfermagem-1780005128081-2', suggested_subtopico: APS, confidence: 0.92, keep_current: false, rationale: 'ACS como agente educativo em hábitos alimentares na comunidade.' },
  { modulo_slug: 'amauc-enfermagem-processo-de-enfermagem-1780005128081-5', suggested_subtopico: BUCKET, confidence: 0.94, keep_current: true, rationale: 'Orientações de higiene bucal e prevenção pelo ACS.' },
  { modulo_slug: 'ameosc-enfermagem-processo-de-enfermagem-1780001613305-1', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Definição ampliada de saúde da OMS no processo saúde-doença.' },
  { modulo_slug: 'aocp-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563927625-9', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Saneamento básico e prevenção de agravos diarreicos.' },
  { modulo_slug: 'avancasp-enfermagem-nutricao-aplicada-a-enfermagem-1777102845644-3', suggested_subtopico: BUCKET, confidence: 0.93, keep_current: true, rationale: 'Recomendação de hidratação como hábito saudável.' },
  { modulo_slug: 'avancasp-enfermagem-nutricao-aplicada-a-enfermagem-1777102845644-6', suggested_subtopico: DCNT, confidence: 0.95, keep_current: false, rationale: 'Cálculo de IMC na avaliação antropométrica nutricional.' },
  { modulo_slug: 'cebraspe-cespe-enfermagem-nutricao-aplicada-a-enfermagem-1777102983353-5', suggested_subtopico: PROC, confidence: 0.91, keep_current: false, rationale: 'Dieta e espessantes para disfagia em idoso.' },
  { modulo_slug: 'cebraspe-cespe-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563914208-3', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Campanha de prevenção do consumo de álcool em gestantes.' },
  { modulo_slug: 'cebraspe-cespe-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563914208-4', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Estratégias multifatoriais de prevenção da obesidade.' },
  { modulo_slug: 'cetrede-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563868300-8', suggested_subtopico: SM, confidence: 0.96, keep_current: false, rationale: 'Legislação e direitos do planejamento familiar.' },
  { modulo_slug: 'contemax-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563950884-2', suggested_subtopico: PARAS, confidence: 0.91, keep_current: false, rationale: 'Prevenção de doenças infectoparasitárias em ação educativa.' },
  { modulo_slug: 'copese-ufpi-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563919067-3', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Educação em saúde na comunidade pelo ACS.' },
  { modulo_slug: 'cpcon-uepb-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563946005-4', suggested_subtopico: DCNT, confidence: 0.94, keep_current: false, rationale: 'Prevenção primária da HAS por modificação do estilo de vida.' },
  { modulo_slug: 'educa-pb-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563868300-3', suggested_subtopico: APS, confidence: 0.93, keep_current: false, rationale: 'Princípios do SUS e acesso universal na atenção básica.' },
  { modulo_slug: 'educa-pb-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563909811-7', suggested_subtopico: BUCKET, confidence: 0.94, keep_current: true, rationale: 'Medidas educativas comunitárias e participação da população.' },
  { modulo_slug: 'fau-unicentro-enfermagem-nutricao-aplicada-a-enfermagem-1777102845644-7', suggested_subtopico: PROC, confidence: 0.92, keep_current: false, rationale: 'Avaliação antropométrica como medida corporal clínica.' },
  { modulo_slug: 'fau-unicentro-enfermagem-nutricao-aplicada-a-enfermagem-1777102926437-6', suggested_subtopico: BUCKET, confidence: 0.91, keep_current: true, rationale: 'Vitamina D e exposição solar na orientação nutricional.' },
  { modulo_slug: 'fau-unicentro-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563863195-0', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Estratégias de saneamento básico e saúde coletiva.' },
  { modulo_slug: 'fau-unicentro-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563927625-0', suggested_subtopico: BUCKET, confidence: 0.93, keep_current: true, rationale: 'Tártaro e prevenção de cáries e doenças bucais.' },
  { modulo_slug: 'fau-unicentro-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563927625-1', suggested_subtopico: BUCKET, confidence: 0.94, keep_current: true, rationale: 'Medidas de prevenção de complicações bucais.' },
  { modulo_slug: 'fauel-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563923516-7', suggested_subtopico: BUCKET, confidence: 0.92, keep_current: true, rationale: 'Empatia na comunicação em ações de promoção da saúde.' },
  { modulo_slug: 'funatec-enfermagem-nutricao-aplicada-a-enfermagem-1777102944034-4', suggested_subtopico: DCNT, confidence: 0.93, keep_current: false, rationale: 'Orientação nutricional e atividade física na obesidade.' },
  { modulo_slug: 'funcepe-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563875555-3', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Exemplo de prevenção secundária nos níveis de prevenção.' },
  { modulo_slug: 'fundepes-copeve-ufal-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563950884-6', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Campos de ação da promoção da saúde e equidade.' },
  { modulo_slug: 'furb-enfermagem-processo-de-enfermagem-1780011908736-2', suggested_subtopico: BUCKET, confidence: 0.94, keep_current: true, rationale: 'Metodologias expositivas e participativas na educação em saúde.' },
  { modulo_slug: 'gama-enfermagem-nutricao-aplicada-a-enfermagem-1777102926437-0', suggested_subtopico: PROC, confidence: 0.94, keep_current: false, rationale: 'Prescrição e implementação de dietas básicas e especiais.' },
  { modulo_slug: 'gama-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563941226-6', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Distinção entre promoção da saúde e rastreamento/vacinação.' },
  { modulo_slug: 'gama-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563941226-7', suggested_subtopico: BUCKET, confidence: 0.94, keep_current: true, rationale: 'Participação comunitária e empoderamento na promoção.' },
  { modulo_slug: 'ibade-enfermagem-processo-de-enfermagem-1780005137458-1', suggested_subtopico: BUCKET, confidence: 0.93, keep_current: true, rationale: 'Ações educativas, preventivas e de promoção no SUS.' },
  { modulo_slug: 'ibade-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563875555-0', suggested_subtopico: BUCKET, confidence: 0.94, keep_current: true, rationale: 'Estratégias interdisciplinares de promoção da saúde.' },
  { modulo_slug: 'ibade-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563875555-1', suggested_subtopico: IST, confidence: 0.96, keep_current: false, rationale: 'Comunicação comunitária sobre prevenção de DSTs.' },
  { modulo_slug: 'ibade-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563875555-2', suggested_subtopico: DCNT, confidence: 0.95, keep_current: false, rationale: 'Vulnerabilidade a DCNT por dieta inadequada e sedentarismo.' },
  { modulo_slug: 'ibade-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563937068-2', suggested_subtopico: DCNT, confidence: 0.94, keep_current: false, rationale: 'Estilo de vida e prevenção de doenças crônicas.' },
  { modulo_slug: 'ibam-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563863195-8', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Metodologias pedagógicas na educação em saúde comunitária.' },
  { modulo_slug: 'ibfc-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563950884-4', suggested_subtopico: BUCKET, confidence: 0.93, keep_current: true, rationale: 'Sanitização de hortaliças na prevenção de contaminação.' },
  { modulo_slug: 'idcap-enfermagem-atencao-basica-saude-da-familia-1778968112153-4', suggested_subtopico: BUCKET, confidence: 0.92, keep_current: true, rationale: 'Medidas de prevenção de problemas bucais.' },
  { modulo_slug: 'idcap-enfermagem-nutricao-aplicada-a-enfermagem-1777102983353-0', suggested_subtopico: DCNT, confidence: 0.95, keep_current: false, rationale: 'Classificação do IMC para estado nutricional eutrófico.' },
  { modulo_slug: 'idcap-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563868300-4', suggested_subtopico: EPID, confidence: 0.92, keep_current: false, rationale: 'Desratização como controle de vetores e endemias.' },
  { modulo_slug: 'idecan-enfermagem-nutricao-aplicada-a-enfermagem-1780066961947-2', suggested_subtopico: BUCKET, confidence: 0.91, keep_current: true, rationale: 'Quantidade de sal na alimentação e prevenção de HAS.' },
  { modulo_slug: 'idecan-enfermagem-nutricao-aplicada-a-enfermagem-1780066961947-3', suggested_subtopico: BUCKET, confidence: 0.92, keep_current: true, rationale: 'Funções dos nutrientes na prevenção de doenças.' },
  { modulo_slug: 'idecan-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1778712270872-1', suggested_subtopico: BUCKET, confidence: 0.97, keep_current: true, rationale: 'Definição correta de prevenção primária.' },
  { modulo_slug: 'idecan-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1778712270872-5', suggested_subtopico: PROC, confidence: 0.91, keep_current: false, rationale: 'Higienização de equipamentos na UAN e prevenção de DTAs.' },
  { modulo_slug: 'idecan-enfermagem-protocolos-e-diretrizes-do-ministerio-da-saude-1780067048498-1', suggested_subtopico: PROC, confidence: 0.93, keep_current: false, rationale: 'Órgãos doáveis no Sistema Nacional de Transplantes.' },
  { modulo_slug: 'idib-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1778934900821-7', suggested_subtopico: BUCKET, confidence: 0.94, keep_current: true, rationale: 'Cuidados preventivos diários com saúde bucal.' },
  { modulo_slug: 'idib-enfermagem-saude-do-homem-1778934944659-5', suggested_subtopico: BUCKET, confidence: 0.91, keep_current: true, rationale: 'Prevenção e rastreamento na saúde do homem.' },
  { modulo_slug: 'igeduc-enfermagem-nutricao-aplicada-a-enfermagem-1777102813845-4', suggested_subtopico: BUCKET, confidence: 0.93, keep_current: true, rationale: 'Fundamentos de nutrição na promoção e prevenção de doenças.' },
];

const BATCH02: InferRow[] = [
  { modulo_slug: 'igeduc-enfermagem-nutricao-aplicada-a-enfermagem-1777102926437-5', suggested_subtopico: PROC, confidence: 0.94, keep_current: false, rationale: 'Indicação e características da dieta branda.' },
  { modulo_slug: 'igeduc-enfermagem-nutricao-aplicada-a-enfermagem-1780000630425-0', suggested_subtopico: BUCKET, confidence: 0.93, keep_current: true, rationale: 'Papel do técnico na orientação nutricional preventiva.' },
  { modulo_slug: 'igeduc-enfermagem-processo-de-enfermagem-1780010559720-6', suggested_subtopico: APS, confidence: 0.95, keep_current: false, rationale: 'Educação em saúde na Atenção Básica e autonomia comunitária.' },
  { modulo_slug: 'igeduc-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563909811-1', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Conceito de prevenção secundária e diagnóstico precoce.' },
  { modulo_slug: 'igeduc-enfermagem-saude-do-idoso-1780001440222-2', suggested_subtopico: BUCKET, confidence: 0.92, keep_current: true, rationale: 'Prevenção de quedas e promoção da autonomia no idoso.' },
  { modulo_slug: 'inaz-do-para-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563932216-6', suggested_subtopico: PARAS, confidence: 0.96, keep_current: false, rationale: 'Renovação de caixas dágua e prevenção de criadouros do mosquito.' },
  { modulo_slug: 'inaz-do-para-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563932216-8', suggested_subtopico: BUCKET, confidence: 0.94, keep_current: true, rationale: 'Campanhas de educação em higiene bucal comunitária.' },
  { modulo_slug: 'inaz-do-para-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563941226-0', suggested_subtopico: BUCKET, confidence: 0.93, keep_current: true, rationale: 'Abordagem educativa para hábitos de saúde bucal.' },
  { modulo_slug: 'inaz-do-para-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563941226-1', suggested_subtopico: SC, confidence: 0.93, keep_current: false, rationale: 'Programa escolar de escovação e selantes contra cárie infantil.' },
  { modulo_slug: 'inaz-do-para-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563941226-2', suggested_subtopico: BUCKET, confidence: 0.92, keep_current: true, rationale: 'Adesão ao tratamento periodontal por educação personalizada.' },
  { modulo_slug: 'inaz-do-para-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563941226-3', suggested_subtopico: SA, confidence: 0.93, keep_current: false, rationale: 'Oficinas práticas de higiene bucal para adolescentes.' },
  { modulo_slug: 'instituto-aocp-enfermagem-processo-de-enfermagem-1780004272097-7', suggested_subtopico: APS, confidence: 0.91, keep_current: false, rationale: 'Resultados esperados da Política Nacional de Humanização.' },
  { modulo_slug: 'instituto-consulplan-enfermagem-nutricao-aplicada-a-enfermagem-1777102879099-7', suggested_subtopico: DCNT, confidence: 0.95, keep_current: false, rationale: 'Cálculo de IMC na admissão na UBS.' },
  { modulo_slug: 'instituto-consulplan-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563946005-8', suggested_subtopico: BUCKET, confidence: 0.94, keep_current: true, rationale: 'Identificação do que não é ação de promoção da saúde.' },
  { modulo_slug: 'instituto-consulplan-enfermagem-teorias-em-enfermagem-1776056009428-1', suggested_subtopico: BUCKET, confidence: 0.91, keep_current: true, rationale: 'Empatia no atendimento à população em ações de saúde.' },
  { modulo_slug: 'instituto-iacp-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563961175-1', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Autocuidado e protagonismo do usuário no tratamento.' },
  { modulo_slug: 'instituto-ibed-enfermagem-processo-de-enfermagem-1780004926596-6', suggested_subtopico: PROC, confidence: 0.91, keep_current: false, rationale: 'Filosofia dos cuidados paliativos e qualidade de vida.' },
  { modulo_slug: 'instituto-verbena-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563932216-4', suggested_subtopico: BUCKET, confidence: 0.97, keep_current: true, rationale: 'Determinantes sociais da saúde segundo a OMS.' },
  { modulo_slug: 'ivin-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563937068-7', suggested_subtopico: BUCKET, confidence: 0.93, keep_current: true, rationale: 'Visita domiciliar do ACE como proteção específica.' },
  { modulo_slug: 'ivin-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563937068-8', suggested_subtopico: BUCKET, confidence: 0.94, keep_current: true, rationale: 'Saneamento básico e qualidade da água para saúde coletiva.' },
  { modulo_slug: 'ivin-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563937068-9', suggested_subtopico: BUCKET, confidence: 0.92, keep_current: true, rationale: 'Políticas educacionais em saúde, sexual e social.' },
  { modulo_slug: 'ivin-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563946005-0', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Educação popular como estratégia educativa comunitária.' },
  { modulo_slug: 'ms-sarmento-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563923516-1', suggested_subtopico: BUCKET, confidence: 0.94, keep_current: true, rationale: 'Ações essenciais de saneamento básico e qualidade de vida.' },
  { modulo_slug: 'nao-informado-geral-promocao-a-saude-e-prevencao-de-agravos-1779563909811-0', suggested_subtopico: BUCKET, confidence: 0.93, keep_current: true, rationale: 'Redução do sal como medida preventiva da hipertensão.' },
  { modulo_slug: 'nao-informado-geral-promocao-a-saude-e-prevencao-de-agravos-1779563909811-6', suggested_subtopico: BUCKET, confidence: 0.92, keep_current: true, rationale: 'Poluição ambiental como determinante da saúde humana.' },
  { modulo_slug: 'objetiva-concursos-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563914208-8', suggested_subtopico: BUCKET, confidence: 0.97, keep_current: true, rationale: 'Campos de ação da Carta de Ottawa.' },
  { modulo_slug: 'objetiva-concursos-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563941226-5', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Níveis de prevenção em saúde pública.' },
  { modulo_slug: 'objetiva-concursos-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563950884-0', suggested_subtopico: BUCKET, confidence: 0.93, keep_current: true, rationale: 'Estratégias de promoção e prevenção da anemia.' },
  { modulo_slug: 'quadrix-enfermagem-processo-de-enfermagem-1776056181857-7', suggested_subtopico: PE, confidence: 0.92, keep_current: false, rationale: 'Comunicação adequada ao paciente no cuidado de enfermagem.' },
  { modulo_slug: 'ufmt-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563937068-3', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Proteção específica como nível da prevenção primária.' },
  { modulo_slug: 'unesc-enfermagem-nutricao-aplicada-a-enfermagem-1777102944034-7', suggested_subtopico: BUCKET, confidence: 0.91, keep_current: true, rationale: 'Conceito de alimentos in natura na orientação alimentar.' },
  { modulo_slug: 'vunesp-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563713110-1', suggested_subtopico: BUCKET, confidence: 0.94, keep_current: true, rationale: 'Educação em saúde sobre atividade física na ESF.' },
  { modulo_slug: 'vunesp-enfermagem-nutricao-aplicada-a-enfermagem-1777102845644-1', suggested_subtopico: PROC, confidence: 0.94, keep_current: false, rationale: 'Características e indicação da dieta pastosa.' },
  { modulo_slug: 'vunesp-enfermagem-nutricao-aplicada-a-enfermagem-1777102983353-4', suggested_subtopico: BUCKET, confidence: 0.92, keep_current: true, rationale: 'Limite diário de sal recomendado pela OMS.' },
  { modulo_slug: 'vunesp-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563909811-5', suggested_subtopico: PARAS, confidence: 0.95, keep_current: false, rationale: 'Prevenção de acidentes com escorpião e controle ambiental.' },
];

function writeInferred(batch: string, rows: InferRow[]) {
  const rel = `${OUT}/batch-${batch}-inferred.json`;
  writeFileSync(
    resolve(process.cwd(), rel),
    JSON.stringify({ batch, bucket: BUCKET, inferences: rows }, null, 2) + '\n',
  );
  const moves = rows.filter((r) => !r.keep_current && r.confidence >= 0.9).length;
  console.log(`batch-${batch}: ${rows.length} scanned, ${moves} moves (>=0.90)`);
}

writeInferred('01', BATCH01);
writeInferred('02', BATCH02);
console.log(`${BUCKET}: ${BATCH01.length + BATCH02.length} total`);

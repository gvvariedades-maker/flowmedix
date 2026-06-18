#!/usr/bin/env tsx
/** Classificações agente — Medidas de Prevenção e Precaução de Contato (faixa D, onda 6). */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

type InferRow = {
  modulo_slug: string;
  suggested_subtopico: string;
  confidence: number;
  keep_current: boolean;
  rationale: string;
};

const BUCKET = 'Medidas de Prevenção e Precaução de Contato';
const OUT = 'artifacts/reclass/faixa-d/precaucoes-contato';

/** Movimentações com tema dominante fora de precauções padrão/contato/gotas/aerossóis. */
const MOVES: Record<
  string,
  { suggested_subtopico: string; confidence: number; rationale: string }
> = {
  'amauc-enfermagem-processo-de-enfermagem-1780001517858-8': {
    suggested_subtopico: 'Enfermagem em Centro Cirúrgico',
    confidence: 0.94,
    rationale: 'Escovação cirúrgica e degermação da equipe no centro cirúrgico.',
  },
  'amauc-enfermagem-processo-de-enfermagem-1780005128081-0': {
    suggested_subtopico:
      'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)',
    confidence: 0.93,
    rationale: 'Varicela na APS — notificação, vigilância e controle de surtos.',
  },
  'amauc-enfermagem-processo-de-enfermagem-1780006486032-6': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.97,
    rationale: 'Conceito legal e diretrizes da vigilância epidemiológica no SUS.',
  },
  'ameosc-enfermagem-atencao-basica-saude-da-familia-1778968077998-1': {
    suggested_subtopico: 'Saúde Mental',
    confidence: 0.96,
    rationale: 'Idoso com luto, isolamento social e tristeza profunda — abordagem emocional.',
  },
  'ameosc-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563858390-1': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.97,
    rationale: 'Conceitos epidemiológicos: tríade, causa insuficiente e caracterização de doenças.',
  },
  'ameosc-enfermagem-processo-de-enfermagem-1780002934000-2': {
    suggested_subtopico: 'Coleta de Exames Laboratoriais',
    confidence: 0.95,
    rationale: 'Transporte de amostras biológicas — embalagem tripla e conservação.',
  },
  'ameosc-enfermagem-processo-de-enfermagem-1780005791580-1': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.96,
    rationale: 'Notificação compulsória imediata de doença com potencial epidêmico.',
  },
  'ameosc-enfermagem-processo-de-enfermagem-1780005791580-5': {
    suggested_subtopico: 'Coleta de Exames Laboratoriais',
    confidence: 0.94,
    rationale: 'Técnica e orientação na coleta de urocultura ambulatorial.',
  },
  'ameosc-enfermagem-processo-de-enfermagem-1780008232871-0': {
    suggested_subtopico: 'Atenção Básica / Saúde da Família',
    confidence: 0.95,
    rationale: 'Princípios do SUS e planejamento assistencial na UBS.',
  },
  'ameosc-enfermagem-processo-de-enfermagem-1780008232871-3': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.92,
    rationale: 'Meningite meningocócica — notificação compulsória e vigilância epidemiológica.',
  },
  'avancasp-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563642476-0': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.96,
    rationale: 'Cálculo de incidência de anemia na população da ESF.',
  },
  'avancasp-enfermagem-processo-de-enfermagem-1780002834059-1': {
    suggested_subtopico: 'Instalação e Manejo de Sondas',
    confidence: 0.93,
    rationale: 'Requisitos técnicos do cateterismo vesical.',
  },
  'avancasp-enfermagem-processo-de-enfermagem-1780002845055-6': {
    suggested_subtopico: 'Noções de Anatomia',
    confidence: 0.97,
    rationale: 'Luxação completa versus subluxação no ombro.',
  },
  'avancasp-enfermagem-processo-de-enfermagem-1780002845055-7': {
    suggested_subtopico: 'Noções de Anatomia',
    confidence: 0.97,
    rationale: 'Estrutura de revestimento externo do músculo esquelético.',
  },
  'avancasp-enfermagem-processo-de-enfermagem-1780003137298-5': {
    suggested_subtopico: 'Coleta de Exames Laboratoriais',
    confidence: 0.92,
    rationale: 'Técnica correta na coleta de exames laboratoriais.',
  },
  'avancasp-enfermagem-processo-de-enfermagem-1780003261833-2': {
    suggested_subtopico:
      'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    confidence: 0.91,
    rationale: 'Prioridades no cuidado integral ao idoso.',
  },
  'cebraspe-cespe-enfermagem-processo-de-enfermagem-1780001742844-7': {
    suggested_subtopico: 'Enfermagem do Trabalho',
    confidence: 0.92,
    rationale: 'Perfil epidemiológico e vulnerabilidades da população caminhoneira.',
  },
  'cebraspe-cespe-enfermagem-processo-de-enfermagem-1780001742844-8': {
    suggested_subtopico: 'Enfermagem do Trabalho',
    confidence: 0.91,
    rationale: 'Uso de estimulantes entre caminhoneiros e impactos na saúde.',
  },
  'cev-urca-geral-outras-doencas-e-questoes-mescladas-sobre-doencas-transmissiveis-1777103604185-7': {
    suggested_subtopico:
      'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)',
    confidence: 0.95,
    rationale: 'Identificação precoce e controle de casos de dengue pelo ACS.',
  },
  'cotec-fadenor-enfermagem-processo-de-enfermagem-1780010573104-5': {
    suggested_subtopico:
      'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)',
    confidence: 0.94,
    rationale: 'Fluxograma de manejo clínico e hidratação na dengue.',
  },
  'cotec-fadenor-geral-outras-doencas-e-questoes-mescladas-sobre-doencas-transmissiveis-1777103502990-6': {
    suggested_subtopico:
      'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)',
    confidence: 0.96,
    rationale: 'Arboviroses transmitidas pelo Aedes aegypti — dengue, zika e chikungunya.',
  },
  'cpcon-uepb-enfermagem-processo-de-enfermagem-1780003261833-7': {
    suggested_subtopico: 'Outras Doenças e Questões Mescladas sobre Doenças Transmissíveis',
    confidence: 0.93,
    rationale: 'Doenças diarreicas agudas — agentes, transmissão e reservatórios.',
  },
  'cpcon-uepb-enfermagem-processo-de-enfermagem-1780007246385-1': {
    suggested_subtopico: 'Saúde do Adolescente',
    confidence: 0.95,
    rationale: 'Adolescente com anorexia nervosa — quadro clínico e conduta.',
  },
  'cpcon-uepb-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563863195-5': {
    suggested_subtopico: 'Enfermagem do Trabalho',
    confidence: 0.94,
    rationale: 'Hierarquia de controle de riscos — medidas coletivas versus EPI.',
  },
  'educa-pb-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563843512-6': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.95,
    rationale: 'Organização e sequência dos elos da cadeia epidemiológica.',
  },
  'educa-pb-enfermagem-processo-de-enfermagem-1780007246385-5': {
    suggested_subtopico: 'Outras Doenças e Questões Mescladas sobre Doenças Transmissíveis',
    confidence: 0.91,
    rationale: 'Doenças infectoparasitárias e medidas de prevenção na assistência.',
  },
  'educa-pb-enfermagem-processo-de-enfermagem-1780008197597-0': {
    suggested_subtopico:
      'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    confidence: 0.94,
    rationale: 'Doenças crônicas e degenerativas comuns no idoso.',
  },
  'educa-pb-enfermagem-processo-de-enfermagem-1780008197597-1': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.96,
    rationale: 'Notificação, investigação epidemiológica e medidas de controle.',
  },
  'fcpc-enfermagem-processo-de-enfermagem-1780004628956-0': {
    suggested_subtopico: 'Saúde da Criança',
    confidence: 0.95,
    rationale: 'Criança com diarreia sem sinais de alarme na unidade básica.',
  },
  'fcpc-enfermagem-processo-de-enfermagem-1780004628956-3': {
    suggested_subtopico:
      'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    confidence: 0.93,
    rationale: 'Hipoglicemia em idoso diabético em uso de glicazida.',
  },
  'fenix-instituto-enfermagem-processo-de-enfermagem-1780006471061-3': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.96,
    rationale: 'Aumento inesperado de casos novos acima do padrão — surto.',
  },
  'fgv-enfermagem-processo-de-enfermagem-1780001988576-5': {
    suggested_subtopico: 'Infecções no Contexto da Biossegurança',
    confidence: 0.93,
    rationale: 'Atribuições da Comissão de Biossegurança em Saúde (CBS).',
  },
  'fgv-enfermagem-processo-de-enfermagem-1780002110600-3': {
    suggested_subtopico: 'Enfermagem do Trabalho',
    confidence: 0.94,
    rationale: 'Investigação epidemiológica de doenças e agravos relacionados ao trabalho.',
  },
  'fundatec-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563784564-8': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.94,
    rationale: 'Elos da cadeia de transmissão das doenças infecciosas.',
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780007230169-6': {
    suggested_subtopico:
      'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    confidence: 0.93,
    rationale: 'Hepatopatia alcoólica crônica e insuficiência hepática — assistência.',
  },
  'furb-enfermagem-processo-de-enfermagem-1780011915153-3': {
    suggested_subtopico: 'Urgências e Emergências',
    confidence: 0.91,
    rationale: 'Conduta de enfermagem em epistaxe aguardando atendimento.',
  },
  'furb-enfermagem-processo-de-enfermagem-1780011915153-4': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.95,
    rationale: 'Conceito de endemicidade em epidemiologia.',
  },
  'idcap-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563868300-5': {
    suggested_subtopico: 'Doenças Parasitárias e Zoonoses',
    confidence: 0.92,
    rationale: 'Prevenção de acidentes com lagarta Lonomia obliqua.',
  },
  'idecan-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1778712242196-3': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.91,
    rationale: 'Comitê Operativo de Emergência em Saúde e gestão de desastres.',
  },
  'idecan-enfermagem-outras-questoes-e-questoes-mescladas-sobre-doencas-cronicas-nao-transmissiveis-1778712325916-0': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.93,
    rationale: 'Transição epidemiológica e desafios das DCNT no Brasil.',
  },
  'idecan-enfermagem-procedimentos-diversos-1778712203076-0': {
    suggested_subtopico: 'Procedimentos Diversos',
    confidence: 0.94,
    rationale: 'Aplicação segura de compressas quentes e frias.',
  },
  'idecan-enfermagem-processo-de-enfermagem-1778712122855-4': {
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.92,
    rationale: 'Prevenção de violências e cultura de paz na Atenção Básica.',
  },
  'idecan-enfermagem-protocolos-e-diretrizes-do-ministerio-da-saude-1778712437306-9': {
    suggested_subtopico: 'Procedimentos Diversos',
    confidence: 0.93,
    rationale: 'Função do técnico de enfermagem no serviço de hemoterapia.',
  },
  'idib-enfermagem-doencas-autoimunes-e-reumatologicas-1778934918280-4': {
    suggested_subtopico:
      'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    confidence: 0.94,
    rationale: 'Artrite reumatoide — doença crônica autoimune.',
  },
  'idib-enfermagem-procedimentos-diversos-1778934890864-9': {
    suggested_subtopico: 'Assistência Perioperatória (Inclui SRPA)',
    confidence: 0.93,
    rationale: 'Terminologia cirúrgica — esplenectomia e episiotomia.',
  },
  'idib-enfermagem-saude-do-idoso-1778934944659-6': {
    suggested_subtopico:
      'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    confidence: 0.92,
    rationale: 'Perfil epidemiológico e atenção à população idosa.',
  },
  'igeduc-enfermagem-atencao-basica-saude-da-familia-1778968028412-7': {
    suggested_subtopico: 'Atenção Básica / Saúde da Família',
    confidence: 0.94,
    rationale: 'Enfermagem em saúde coletiva — promoção, prevenção e vigilância na APS.',
  },
  'igeduc-enfermagem-atencao-basica-saude-da-familia-1780001362784-3': {
    suggested_subtopico: 'Atenção Básica / Saúde da Família',
    confidence: 0.94,
    rationale: 'Enfermagem em saúde coletiva — promoção, prevenção e vigilância na APS.',
  },
  'igeduc-enfermagem-processo-de-enfermagem-1780009392850-6': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.95,
    rationale: 'Vigilância epidemiológica, notificação e controle na ESF.',
  },
  'inaz-do-para-enfermagem-processo-de-enfermagem-1780011947286-9': {
    suggested_subtopico: 'Segurança do Paciente',
    confidence: 0.94,
    rationale: 'Prevenção de quedas no ambiente hospitalar.',
  },
  'inaz-do-para-enfermagem-processo-de-enfermagem-1780011956256-3': {
    suggested_subtopico: 'Atenção Básica / Saúde da Família',
    confidence: 0.95,
    rationale: 'Papel do técnico na Estratégia Saúde da Família e territorialização.',
  },
  'instituto-ibed-enfermagem-processo-de-enfermagem-1780004926596-3': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.96,
    rationale: 'Definição correta do conceito de incidência epidemiológica.',
  },
  'instituto-verbena-enfermagem-processo-de-enfermagem-1780002441285-2': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.95,
    rationale: 'Agravo de notificação compulsória individual em todo o território nacional.',
  },
  'instituto-verbena-enfermagem-processo-de-enfermagem-1780008210115-1': {
    suggested_subtopico: 'Saúde da Mulher',
    confidence: 0.94,
    rationale: 'Assistência à mulher no ciclo gravídico-puerperal e climatério na APS.',
  },
  'instituto-verbena-enfermagem-processo-de-enfermagem-1780008210115-4': {
    suggested_subtopico: 'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)',
    confidence: 0.93,
    rationale: 'Indicadores da OMS para monitoramento e controle da hanseníase.',
  },
  'legalle-enfermagem-processo-de-enfermagem-1780010594524-2': {
    suggested_subtopico: 'Doenças Parasitárias e Zoonoses',
    confidence: 0.95,
    rationale: 'Manifestações clínicas e sintomas da malária.',
  },
  'legalle-enfermagem-processo-de-enfermagem-1780010911471-5': {
    suggested_subtopico: 'Feridas e Queimaduras',
    confidence: 0.96,
    rationale: 'Classificação de queimadura térmica de 1º grau.',
  },
  'legalle-enfermagem-processo-de-enfermagem-1780011879977-6': {
    suggested_subtopico:
      'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)',
    confidence: 0.95,
    rationale: 'Sinais e sintomas mais comuns da influenza.',
  },
  'legalle-enfermagem-processo-de-enfermagem-1780011967989-0': {
    suggested_subtopico: 'Saúde Mental',
    confidence: 0.93,
    rationale: 'Características clínicas que sugerem crise epiléptica real.',
  },
  'lj-assessoria-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563919067-0': {
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.92,
    rationale: 'Atividades das comissões intersetoriais de políticas e programas.',
  },
  'ms-sarmento-enfermagem-processo-de-enfermagem-1780008219236-0': {
    suggested_subtopico: 'Urgências e Emergências',
    confidence: 0.94,
    rationale: 'Quadro clínico de colecistite aguda com sinal de Murphy positivo.',
  },
  'nao-informado-geral-seguranca-do-paciente-1778967789485-0': {
    suggested_subtopico: 'Enfermagem do Trabalho',
    confidence: 0.93,
    rationale: 'EPIs da equipe de enfermagem no contexto da saúde do trabalhador.',
  },
  'quadrix-enfermagem-processo-de-enfermagem-1780009294428-6': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.94,
    rationale: 'Notificação compulsória da dengue — casos suspeitos, confirmados e óbitos.',
  },
  'quadrix-enfermagem-processo-de-enfermagem-1780009294428-7': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.94,
    rationale: 'Notificação de SRAG — regras de vigilância epidemiológica.',
  },
  'quadrix-enfermagem-processo-de-enfermagem-1780009294428-8': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.93,
    rationale: 'Notificação compulsória do tétano em diferentes faixas etárias.',
  },
  'selecon-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563843512-1': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.97,
    rationale: 'Definição de epidemiologia e medidas específicas de saúde coletiva.',
  },
  'selecon-enfermagem-processo-de-enfermagem-1780009322055-5': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.96,
    rationale: 'Conceito de prevalência de hipertensão arterial.',
  },
  'unifil-enfermagem-processo-de-enfermagem-1780004469060-6': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.95,
    rationale: 'Funções e conceito da vigilância epidemiológica.',
  },
  'univali-enfermagem-processo-de-enfermagem-1780010905023-4': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.92,
    rationale: 'Responsabilidades do técnico na vigilância epidemiológica de dengue na UBS.',
  },
  'vunesp-enfermagem-processo-de-enfermagem-1780001673873-9': {
    suggested_subtopico: 'Procedimentos Diversos',
    confidence: 0.91,
    rationale: 'Higiene íntima e troca de fraldas em paciente acamado.',
  },
  'vunesp-enfermagem-processo-de-enfermagem-1780001742844-2': {
    suggested_subtopico: 'Infecções Sexualmente Transmissíveis (ISTs)',
    confidence: 0.96,
    rationale: 'Suspeita de sífilis com lesões genitais ulceradas na APS.',
  },
  'vunesp-enfermagem-processo-de-enfermagem-1780003637054-5': {
    suggested_subtopico: 'Enfermagem do Trabalho',
    confidence: 0.94,
    rationale: 'Prevenção da perda auditiva por exposição ocupacional a ruído.',
  },
};

function shortRationale(instruction: string): string {
  const one = instruction.replace(/\s+/g, ' ').trim();
  const cut = one.length > 72 ? `${one.slice(0, 69)}…` : one;
  return `Precauções padrão/contato/gotas/aerossóis: ${cut}`;
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
if (total !== 128) {
  throw new Error(`Esperado 128 questões, obtido ${total}`);
}

const allSlugs = [...BATCH01, ...BATCH02, ...BATCH03].map((r) => r.modulo_slug);
const moveSlugs = Object.keys(MOVES);
const missing = moveSlugs.filter((s) => !allSlugs.includes(s));
const extra = moveSlugs.filter((s) => allSlugs.filter((x) => x === s).length > 1);
if (missing.length > 0) {
  throw new Error(`MOVES com slug ausente no lote: ${missing.join(', ')}`);
}
if (extra.length > 0) {
  throw new Error(`MOVES com slug duplicado: ${extra.join(', ')}`);
}

writeInferred('01', BATCH01);
writeInferred('02', BATCH02);
writeInferred('03', BATCH03);

const all = [...BATCH01, ...BATCH02, ...BATCH03];
const moves = all.filter((r) => !r.keep_current && r.confidence >= 0.9);
console.log(`TOTAL: ${all.length} scanned, ${moves.length} moves (>=0.90)`);

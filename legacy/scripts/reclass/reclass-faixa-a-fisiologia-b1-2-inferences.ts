#!/usr/bin/env tsx
/**
 * Onda 8 — Noções de Fisiologia faixa A, batches 01–02 (~100 questões).
 * Gera batch-01..02-inferred.json para catalog-merge-agent-infer.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

type InferRow = {
  modulo_slug: string;
  suggested_subtopico: string;
  confidence: number;
  keep_current: boolean;
  rationale: string;
};

type BatchItem = {
  modulo_slug: string;
  instruction: string;
  textFragment?: string;
  optionsPreview?: string;
};

const BUCKET = 'Noções de Fisiologia';
const OUT = 'artifacts/reclass/faixa-a/fisiologia';
const SV = 'Verificação de Sinais Vitais';
const ANAT = 'Noções de Anatomia';
const COLETA = 'Coleta de Exames Laboratoriais';
const DCNT = 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis';
const PE = 'Processo de Enfermagem';
const PUNCAO = 'Punção Venosa e Cuidados com Cateteres';
const SCM = 'Saúde da Mulher';
const PARAS = 'Doenças Parasitárias e Zoonoses';
const MOB = 'Mobilização e Posicionamento do Paciente';
const PROC = 'Procedimentos Diversos';
const MED = 'Cuidados na Administração de Medicamentos';
const SCC = 'Saúde da Criança';
const IMUN = 'Imunização';
const VIRAL = 'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)';
const BACT = 'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)';
const PROMO = 'Promoção à Saúde e Prevenção de Agravos';

const OVERRIDES: Record<string, Omit<InferRow, 'modulo_slug'>> = {
  // batch 01 — moves
  'amauc-enfermagem-exames-laboratoriais-1779563631609-3': {
    suggested_subtopico: COLETA,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Tubo/cor para dosagem de glicose — coleta laboratorial.',
  },
  'ameosc-enfermagem-nocoes-de-fisiologia-1775448586547-7': {
    suggested_subtopico: SV,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Classificação de estados febris — terminologia de temperatura/SV.',
  },
  'ameosc-enfermagem-nocoes-de-fisiologia-1776055811481-5': {
    suggested_subtopico: PARAS,
    confidence: 0.96,
    keep_current: false,
    rationale: 'Parasito heteroxênico — parasitologia.',
  },
  'avancasp-enfermagem-nocoes-de-fisiologia-1775448615466-5': {
    suggested_subtopico: ANAT,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Músculo estabilizador da coluna — anatomia muscular.',
  },
  'cpcon-uepb-enfermagem-exames-complementares-1779563655698-2': {
    suggested_subtopico: COLETA,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Hemograma e células sanguíneas — exame laboratorial.',
  },
  'cpcon-uepb-enfermagem-exames-laboratoriais-1779563553840-7': {
    suggested_subtopico: COLETA,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Dosagens bioquímicas colorimétricas — laboratório.',
  },
  'cpcon-uepb-enfermagem-exames-laboratoriais-1779563553840-8': {
    suggested_subtopico: COLETA,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Bilirrubina total e frações — exame laboratorial.',
  },
  'cpcon-uepb-enfermagem-exames-laboratoriais-1779563613404-3': {
    suggested_subtopico: COLETA,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Prova do laço — técnica de coleta laboratorial.',
  },
  'educa-pb-enfermagem-nocoes-de-fisiologia-1775448599930-0': {
    suggested_subtopico: SV,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Definição de sinais vitais — PA/FC/FR/temperatura.',
  },
  'educa-pb-enfermagem-nocoes-de-fisiologia-1775501938701-2': {
    suggested_subtopico: MOB,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Tipos de cinesioterapia — mobilização/reabilitação.',
  },
  'fau-unicentro-enfermagem-exames-laboratoriais-1779563650975-4': {
    suggested_subtopico: COLETA,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Cistoscopia — exame complementar laboratorial.',
  },
  'fau-unicentro-enfermagem-nocoes-de-fisiologia-1775448586547-5': {
    suggested_subtopico: SV,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Valor de pressão arterial — parâmetro de SV.',
  },
  'fau-unicentro-enfermagem-nutricao-aplicada-a-enfermagem-1777102813845-7': {
    suggested_subtopico: PROMO,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Ferro e nutrição — promoção/prevenção nutricional.',
  },
  'fauel-enfermagem-nocoes-de-fisiologia-1775448615466-4': {
    suggested_subtopico: SV,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Sinais vitais como indicadores clínicos.',
  },
  'fgv-enfermagem-nocoes-de-fisiologia-1775448599930-5': {
    suggested_subtopico: SV,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Frequência respiratória normal em repouso — SV.',
  },
  'fundatec-enfermagem-exames-laboratoriais-1779563549311-7': {
    suggested_subtopico: COLETA,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Alterações de eletrólitos em exames — laboratório.',
  },
  // batch 02 — moves
  'fundatec-enfermagem-semiologia-em-enfermagem-1779563517223-7': {
    suggested_subtopico: SCM,
    confidence: 0.9,
    keep_current: false,
    rationale: 'Hipogonadismo — saúde da mulher/endócrino reprodutivo.',
  },
  'furb-enfermagem-exames-laboratoriais-1779563621885-1': {
    suggested_subtopico: COLETA,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Exame laboratorial — coleta/análises clínicas.',
  },
  'furb-enfermagem-nocoes-de-fisiologia-1776055811481-2': {
    suggested_subtopico: SV,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Locais de medição de temperatura corporal — técnica SV.',
  },
  'furb-enfermagem-nocoes-de-fisiologia-1776055986110-3': {
    suggested_subtopico: SV,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Conceitos de sinais vitais.',
  },
  'ibade-enfermagem-nocoes-de-fisiologia-1775448615466-7': {
    suggested_subtopico: PUNCAO,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Distinção veia/artéria para punção venosa.',
  },
  'ibade-enfermagem-nocoes-de-fisiologia-1775448628970-0': {
    suggested_subtopico: DCNT,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Hipertensão arterial e exames — DCNT.',
  },
  'ibade-enfermagem-nocoes-de-fisiologia-1775448628970-1': {
    suggested_subtopico: ANAT,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Parede dos túbulos renais — anatomia histológica.',
  },
  'ibade-enfermagem-nocoes-de-fisiologia-1775448628970-2': {
    suggested_subtopico: ANAT,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Medula espinhal substância cinzenta/branca — anatomia.',
  },
  'ibade-enfermagem-nocoes-de-fisiologia-1775448628970-3': {
    suggested_subtopico: ANAT,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Tecido muscular do intestino delgado — anatomia.',
  },
  'ibade-enfermagem-nocoes-de-fisiologia-1775448628970-4': {
    suggested_subtopico: PROC,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Fixador em técnica histológica — procedimento de laboratório.',
  },
  'ibade-enfermagem-nocoes-de-fisiologia-1775448628970-5': {
    suggested_subtopico: PROC,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Fixação em histologia — procedimento técnico.',
  },
  'ibade-enfermagem-nocoes-de-fisiologia-1775448628970-6': {
    suggested_subtopico: PROC,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Cortes em resinas — técnica histológica.',
  },
  'ibade-enfermagem-nocoes-de-fisiologia-1775501802332-1': {
    suggested_subtopico: PROC,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Reativo de Schiff — coloração histológica.',
  },
  'ibade-enfermagem-nocoes-de-fisiologia-1775501802332-2': {
    suggested_subtopico: PROC,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Tricômico de Masson — coloração histológica.',
  },
  'ibade-enfermagem-nocoes-de-fisiologia-1775501802332-3': {
    suggested_subtopico: PROC,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Coloração de fibras elásticas — histologia.',
  },
  'ibade-enfermagem-nocoes-de-fisiologia-1775501802332-4': {
    suggested_subtopico: PROC,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Hematoxilina e eosina — coloração histológica.',
  },
  'ibade-enfermagem-nocoes-de-fisiologia-1775501921356-0': {
    suggested_subtopico: PROC,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Métodos especiais de coloração histológica.',
  },
  'ibest-enfermagem-nocoes-de-fisiologia-1775501921356-3': {
    suggested_subtopico: ANAT,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Camadas da pele — anatomia.',
  },
  'ibest-enfermagem-nocoes-de-fisiologia-1775501938701-0': {
    suggested_subtopico: ANAT,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Células do osso — anatomia histológica.',
  },
  'ibfc-enfermagem-nocoes-de-fisiologia-1775501938701-4': {
    suggested_subtopico: SV,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Termo afebril — classificação de temperatura/SV.',
  },
  'ibfc-enfermagem-nocoes-de-fisiologia-1776055798601-5': {
    suggested_subtopico: SV,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Variações e classificação de temperatura corporal — SV.',
  },
  'idecan-enfermagem-exames-laboratoriais-1778712242196-1': {
    suggested_subtopico: PROC,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Reflexo de Babinski — exame neurológico complementar.',
  },
  'idecan-enfermagem-nocoes-de-fisiologia-1780066909125-0': {
    suggested_subtopico: DCNT,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Diabetes mellitus — DCNT.',
  },
  'idecan-enfermagem-nocoes-de-fisiologia-1780066992037-2': {
    suggested_subtopico: PARAS,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Doenças transmitidas por mosquitos — parasitárias/zoonoses.',
  },
  'idecan-enfermagem-procedimentos-diversos-1778712203076-4': {
    suggested_subtopico: PE,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Balanço hídrico e monitorização — processo de enfermagem.',
  },
  'idib-enfermagem-nocoes-de-fisiologia-1778934909266-5': {
    suggested_subtopico: PARAS,
    confidence: 0.96,
    keep_current: false,
    rationale: 'Vetor da malária — doenças parasitárias.',
  },
  'idib-enfermagem-nocoes-de-fisiologia-1778934909266-6': {
    suggested_subtopico: VIRAL,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Dengue e vetor — arbovirose viral.',
  },
  'idib-enfermagem-nocoes-de-fisiologia-1778934944659-8': {
    suggested_subtopico: PE,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Registros de enfermagem — documentação PE.',
  },
  'idib-enfermagem-nocoes-de-fisiologia-1778934944659-9': {
    suggested_subtopico: SCC,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Plaquetopenia em criança — saúde da criança.',
  },
  'idib-enfermagem-nocoes-de-fisiologia-1778934957741-0': {
    suggested_subtopico: PROC,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Armazenamento de plasma fresco — banco de sangue.',
  },
  'idib-enfermagem-nocoes-de-fisiologia-1778934957741-1': {
    suggested_subtopico: IMUN,
    confidence: 0.96,
    keep_current: false,
    rationale: 'Vacina BCG e calendário — imunização.',
  },
  'idib-enfermagem-nocoes-de-fisiologia-1778934957741-2': {
    suggested_subtopico: MED,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Erros de medicação em pediatria — cuidados medicamentosos.',
  },
  'idib-enfermagem-nocoes-de-fisiologia-1778934957741-3': {
    suggested_subtopico: SCM,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Líquido amniótico e maturidade fetal — obstetrícia.',
  },
  'idib-enfermagem-nocoes-de-fisiologia-1778934957741-4': {
    suggested_subtopico: BACT,
    confidence: 0.96,
    keep_current: false,
    rationale: 'Teste rápido para hanseníase — doença bacteriana.',
  },
};

const FISIO_CORE =
  /fisiolog|homeostase|vasodilata|vasoconstr|termorregula|hipotálamo|ventilação.*perfusão|fluxo sanguíneo|hematose|alvéol|insulina|glucagon|valva mitral|ciclo cardíaco|sístole|diástole|hipoxemia|equilíbrio hidroeletrol|hipernatremia|hiponatremia|ferro.*hemácia|hemoglobina.*oxig|transporte de oxigênio|peristáltic|soro.*isotônic|ph neutro|sinais flogístic|icterícia.*bilirrub|desidratação.*urin|grande circulação|pequena circulação|nucleotídeo|eucariót|olfato.*tálamo|pressão intrapulmonar|troca gasosa|relaxamento muscular.*calor/i;

const MOVE_RULES: { re: RegExp; label: string; conf: number; note: string }[] = [
  {
    re: /tubo.*cor.*glicose|hemograma|bilirrubina|prova do laço|exames? laboratoriais|dosagem.*colorimétric|cistoscopia|reflexo de babinski/i,
    label: COLETA,
    conf: 0.92,
    note: 'exame/coleta laboratorial',
  },
  {
    re: /sinais vitais|afebril|febrícula|normotermia|frequência respiratória.*normal|medição da temperatura.*locais|valor de pressão arterial|pressão arterial.*mmhg/i,
    label: SV,
    conf: 0.93,
    note: 'sinais vitais/temperatura/PA',
  },
  {
    re: /punção venosa|distinguir.*veia.*artéria/i,
    label: PUNCAO,
    conf: 0.94,
    note: 'acesso venoso',
  },
  {
    re: /parasito.*heteroxên|hospedeiro definitivo|vetor.*malária|malária no brasil/i,
    label: PARAS,
    conf: 0.94,
    note: 'parasitologia',
  },
  {
    re: /dengue|arbovirose|transmitidas por mosquitos/i,
    label: VIRAL,
    conf: 0.92,
    note: 'arbovirose viral',
  },
  {
    re: /diabetes mellitus|hipertensão arterial|glicose na corrente sanguínea/i,
    label: DCNT,
    conf: 0.93,
    note: 'DCNT',
  },
  {
    re: /hanseníase|mycobacterium leprae/i,
    label: BACT,
    conf: 0.95,
    note: 'hanseníase',
  },
  {
    re: /vacina bcg|calendário nacional de vacinação/i,
    label: IMUN,
    conf: 0.95,
    note: 'imunização',
  },
  {
    re: /registros de enfermagem|balanço hídrico.*monitorização/i,
    label: PE,
    conf: 0.91,
    note: 'processo de enfermagem',
  },
  {
    re: /líquido amniótico|maturidade fetal|hipogonadismo/i,
    label: SCM,
    conf: 0.91,
    note: 'saúde da mulher/obstetrícia',
  },
  {
    re: /criança.*plaqueta|pediatr.*medicação|erros de medicação em pediatria/i,
    label: SCC,
    conf: 0.91,
    note: 'saúde da criança',
  },
  {
    re: /erros de medicação|administração de medicamento/i,
    label: MED,
    conf: 0.92,
    note: 'medicamentos',
  },
  {
    re: /cinesioterapia|tipos de cinesioterapia/i,
    label: MOB,
    conf: 0.91,
    note: 'mobilização',
  },
  {
    re: /nutrição aplicada|alimentos in natura|ferro.*nutrição/i,
    label: PROMO,
    conf: 0.9,
    note: 'nutrição/promoção',
  },
  {
    re: /fixação.*histol|coloração de|hematoxilina|tricômico|reativo de schiff|técnica histológica|banco de sangue|plasma fresco congelado/i,
    label: PROC,
    conf: 0.93,
    note: 'procedimento técnico',
  },
  {
    re: /substância cinzenta|tecido muscular.*intestino|camada.*pele|células do osso|túbulos renais.*constituídos/i,
    label: ANAT,
    conf: 0.92,
    note: 'anatomia/histologia',
  },
];

function classify(item: BatchItem): Omit<InferRow, 'modulo_slug'> {
  const override = OVERRIDES[item.modulo_slug];
  if (override) return override;

  const blob = `${item.instruction} ${item.textFragment ?? ''} ${item.optionsPreview ?? ''}`;

  if (/exames-laboratoriais|exames-complementares/.test(item.modulo_slug)) {
    return {
      suggested_subtopico: COLETA,
      confidence: 0.92,
      keep_current: false,
      rationale: 'Slug de exames laboratoriais — coleta.',
    };
  }

  if (/nutricao-aplicada/.test(item.modulo_slug)) {
    return {
      suggested_subtopico: PROMO,
      confidence: 0.9,
      keep_current: false,
      rationale: 'Nutrição aplicada sem núcleo fisiológico dominante.',
    };
  }

  if (/procedimentos-diversos/.test(item.modulo_slug)) {
    return {
      suggested_subtopico: PE,
      confidence: 0.9,
      keep_current: false,
      rationale: 'Procedimento de monitorização no contexto PE.',
    };
  }

  for (const rule of MOVE_RULES) {
    if (rule.re.test(blob)) {
      return {
        suggested_subtopico: rule.label,
        confidence: rule.conf,
        keep_current: false,
        rationale: `${rule.note} — tema dominante fora de fisiologia.`,
      };
    }
  }

  if (FISIO_CORE.test(blob) || /nocoes-de-fisiologia/.test(item.modulo_slug)) {
    return {
      suggested_subtopico: BUCKET,
      confidence: 0.94,
      keep_current: true,
      rationale: 'Funções orgânicas, homeostase ou fisiologia aplicada.',
    };
  }

  if (/processo-de-enfermagem/.test(item.modulo_slug)) {
    return {
      suggested_subtopico: PE,
      confidence: 0.88,
      keep_current: false,
      rationale: 'Contexto PE sem fisiologia dominante ≥0,90.',
    };
  }

  return {
    suggested_subtopico: BUCKET,
    confidence: 0.9,
    keep_current: true,
    rationale: 'Conteúdo compatível com fisiologia ou sem destino canônico claro ≥0,90.',
  };
}

let totalMoves = 0;
let totalScanned = 0;

for (let i = 1; i <= 2; i++) {
  const batch = String(i).padStart(2, '0');
  const data = JSON.parse(
    readFileSync(resolve(process.cwd(), `${OUT}/batch-${batch}.json`), 'utf8'),
  ) as { items: BatchItem[] };

  const rows: InferRow[] = data.items.map((item) => ({
    modulo_slug: item.modulo_slug,
    ...classify(item),
  }));

  writeFileSync(
    resolve(process.cwd(), `${OUT}/batch-${batch}-inferred.json`),
    JSON.stringify({ batch, bucket: BUCKET, inferences: rows }, null, 2) + '\n',
  );

  const moves = rows.filter((r) => !r.keep_current && r.confidence >= 0.9).length;
  totalScanned += rows.length;
  totalMoves += moves;
  console.log(`batch-${batch}: ${rows.length} scanned, ${moves} moves (>=0.90)`);
}

console.log(`TOTAL: ${totalScanned} scanned, ${totalMoves} moves (>=0.90)`);

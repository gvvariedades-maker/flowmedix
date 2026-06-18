#!/usr/bin/env tsx
/**
 * Onda 8 — Cálculo de Administração de Medicamentos e Infusões, faixa B, batches 01-03 (138 questões).
 * Gera batch-01..03-inferred.json para catalog-merge-agent-infer.
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

const BUCKET = 'Cálculo de Administração de Medicamentos e Infusões';
const OUT = 'artifacts/reclass/faixa-b/calculos';

const CALC_CORE_RE =
  /(?:gotejamento|gts\/min|gotas por minuto|microgotas|mg\/kg|UI\/kg|UI de insulina|regra de tr[eê]s|volume a (?:administrar|aspirar|infundir)|dose.*(?:administrar|prescrita|receber)|aspir(?:ar|ou).*mL|mL\/h|ml\/h|mL.*(?:mg|UI)|UI.*mL|concentra[cç][aã]o.*(?:mg|UI|%|mL)|frasco.*(?:mg|UI|g)|ampola.*(?:mg|mL|UI|g)|prescrito.*(?:mg|UI|mL)|infus[aã]o.*(?:hora|minuto)|equipo.*gotas|dilu[ií].*(?:mL|ml)|quantidade de glicose|equivalente de \d+ ml em gotas|posologia.*gotas|gotas\/kg|gota\/kg|\d+ gotas|indique o (?:volume|gotejamento)|qual (?:o|a) (?:volume|dose|gotejamento)|programar a bomba|bomba de infus[aã]o.*(?:ml|mL)|apresenta[cç][aã]o.*mg\/ml|mg\/ml|UI\/ml|\d+\s*UI|\d+\s*mg\/kg|misturar.*mL.*diluente|apresenta o volume correto)/i;

const OVERRIDES: Record<string, Omit<InferRow, 'modulo_slug'>> = {
  'amauc-enfermagem-processo-de-enfermagem-1780001440222-9': {
    suggested_subtopico: 'Cuidados na Administração de Medicamentos',
    confidence: 0.93,
    keep_current: false,
    rationale: 'Monitoramento de RNI/varfarina — vigilância terapêutica, não cálculo de dose.',
  },
  'avancasp-enfermagem-processo-de-enfermagem-1780002714111-9': {
    suggested_subtopico: 'Cuidados na Administração de Medicamentos',
    confidence: 0.91,
    keep_current: false,
    rationale: 'Importância conceitual do gotejamento — segurança na administração.',
  },
  'cotec-fadenor-enfermagem-processo-de-enfermagem-1780010573104-8': {
    suggested_subtopico: 'Doenças Parasitárias e Zoonoses',
    confidence: 0.92,
    keep_current: false,
    rationale: 'Animais peçonhentos e acidentes — zoonoses/envenenamento.',
  },
  'cpcon-uepb-enfermagem-processo-de-enfermagem-1780007246385-0': {
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.92,
    keep_current: false,
    rationale: 'Atividade física no diabetes — prevenção e educação em saúde.',
  },
  'fcpc-enfermagem-processo-de-enfermagem-1780004602717-8': {
    suggested_subtopico: 'Enfermagem do Trabalho',
    confidence: 0.94,
    keep_current: false,
    rationale: 'Proteção contra radiação ionizante em hemodinâmica — saúde ocupacional.',
  },
  'fcpc-enfermagem-processo-de-enfermagem-1780004628956-2': {
    suggested_subtopico: 'Oxigenoterapia e Cuidados Respiratórios',
    confidence: 0.93,
    keep_current: false,
    rationale: 'Padrão respiratório de Kussmaul — semiologia respiratória.',
  },
  'fenix-instituto-enfermagem-processo-de-enfermagem-1780001846202-8': {
    suggested_subtopico:
      'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    confidence: 0.94,
    keep_current: false,
    rationale: 'Sinais clínicos de hiperglicemia no diabetes — DCNT.',
  },
  'fauel-enfermagem-cuidados-na-administracao-de-medicamentos-1778969633568-3': {
    suggested_subtopico: 'Cuidados na Administração de Medicamentos',
    confidence: 0.93,
    keep_current: false,
    rationale: 'Preparo e administração EV de dipirona — técnica dos certos, não cálculo.',
  },
  'fgv-enfermagem-processo-de-enfermagem-1780001988576-8': {
    suggested_subtopico: 'Enfermagem do Trabalho',
    confidence: 0.94,
    keep_current: false,
    rationale: 'Medidas de proteção contra exposição à radiação — NR/ocupacional.',
  },
  'fgv-enfermagem-processo-de-enfermagem-1780001988576-9': {
    suggested_subtopico: 'Enfermagem do Trabalho',
    confidence: 0.93,
    keep_current: false,
    rationale: 'Efeitos biológicos da radiação — saúde ocupacional/radioproteção.',
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780006976703-0': {
    suggested_subtopico: 'Farmacodinâmica e Farmacocinética',
    confidence: 0.93,
    keep_current: false,
    rationale: 'Efeitos adversos de opioides (fentanil) — farmacologia clínica.',
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780006976703-2': {
    suggested_subtopico: 'Farmacodinâmica e Farmacocinética',
    confidence: 0.94,
    keep_current: false,
    rationale: 'Neurotoxicidade do meropenem — farmacodinâmica/farmacocinética.',
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780006976703-4': {
    suggested_subtopico: 'Farmacodinâmica e Farmacocinética',
    confidence: 0.92,
    keep_current: false,
    rationale: 'Mecanismo fisiológico da vasopressina — farmacologia, não cálculo.',
  },
  'furb-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563804667-3': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.95,
    keep_current: false,
    rationale: 'Relação dose-efeito em estudos epidemiológicos — epidemiologia ambiental.',
  },
  'ibfc-geral-procedimentos-diversos-1777103988389-5': {
    suggested_subtopico: 'Procedimentos Diversos',
    confidence: 0.91,
    keep_current: false,
    rationale: 'Agrotóxicos e DL50 — toxicologia ambiental geral.',
  },
  'igeduc-enfermagem-processo-de-enfermagem-1780010917301-6': {
    suggested_subtopico: 'Cuidados na Administração de Medicamentos',
    confidence: 0.94,
    keep_current: false,
    rationale: 'Lipodistrofia e rodízio de locais na aplicação de insulina.',
  },
  'instituto-aocp-enfermagem-processo-de-enfermagem-1780003950945-7': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.96,
    keep_current: false,
    rationale: 'Indicador epidemiológico (prevalência) — não cálculo de medicação.',
  },
  'instituto-aocp-enfermagem-processo-de-enfermagem-1780004272097-1': {
    suggested_subtopico:
      'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    confidence: 0.94,
    keep_current: false,
    rationale: 'Cetoacidose diabética — complicação aguda do diabetes.',
  },
  'instituto-iacp-enfermagem-processo-de-enfermagem-1780003637054-1': {
    suggested_subtopico: 'Cuidados na Administração de Medicamentos',
    confidence: 0.95,
    keep_current: false,
    rationale: 'Sequência de aspiração de insulina NPH + Regular — técnica de preparo.',
  },
  'instituto-consulpam-enfermagem-processo-de-enfermagem-1780006486032-3': {
    suggested_subtopico: BUCKET,
    confidence: 0.94,
    keep_current: true,
    rationale: 'Volume a aspirar de ceftriaxona reconstituída — cálculo de dose.',
  },
  'legalle-enfermagem-processo-de-enfermagem-1780011887822-0': {
    suggested_subtopico:
      'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    confidence: 0.93,
    keep_current: false,
    rationale: 'Fisiopatologia e curso clínico do DM2 — DCNT.',
  },
  'objetiva-concursos-enfermagem-processo-de-enfermagem-1780010573104-0': {
    suggested_subtopico:
      'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    confidence: 0.92,
    keep_current: false,
    rationale: 'Insuficiência renal aguda — complicação/DCNT renal.',
  },
  'objetiva-concursos-enfermagem-processo-de-enfermagem-1780010573104-3': {
    suggested_subtopico: 'Cuidados na Administração de Medicamentos',
    confidence: 0.91,
    keep_current: false,
    rationale: 'Importância da conferência do cálculo — protocolo de segurança medicamentosa.',
  },
};

const MOVE_RULES: { re: RegExp; label: string; conf: number; note: string }[] = [
  {
    re: /varfarina|RNI\b|tempo de protrombina/i,
    label: 'Cuidados na Administração de Medicamentos',
    conf: 0.92,
    note: 'monitoramento anticoagulante',
  },
  {
    re: /animais pe[cç]onhentos|acidente.*(?:cobras?|escorpi)/i,
    label: 'Doenças Parasitárias e Zoonoses',
    conf: 0.91,
    note: 'animais peçonhentos',
  },
  {
    re: /atividade f[ií]sica.*diabetes/i,
    label: 'Promoção à Saúde e Prevenção de Agravos',
    conf: 0.91,
    note: 'atividade física no DM',
  },
  {
    re: /hemodin[aâ]mica|fluoroscopia|avental plumb[ií]fero|emissores de radia[cç][aã]o|efeitos biol[oó]gicos.*radia[cç]/i,
    label: 'Enfermagem do Trabalho',
    conf: 0.93,
    note: 'radiação ocupacional',
  },
  {
    re: /respira[cç][aã]o de kussmaul|respira[cç][aã]o de cheyne-stokes|respira[cç][aã]o de biot/i,
    label: 'Oxigenoterapia e Cuidados Respiratórios',
    conf: 0.92,
    note: 'padrões respiratórios',
  },
  {
    re: /poli[uú]ria.*polidipsia|cetoacidose diab[eé]tica|\bCAD\b/i,
    label: 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    conf: 0.93,
    note: 'diabetes/DCNT',
  },
  {
    re: /lipodistrofia|NPH.*Regular.*mesma seringa|sequ[eê]ncia.*aspira[cç][aã]o.*insulina/i,
    label: 'Cuidados na Administração de Medicamentos',
    conf: 0.93,
    note: 'técnica de insulina',
  },
  {
    re: /fentanil|meropenem|vasopressina|neurotoxicidade|mecanismo n[aã]o adren[eé]rgico/i,
    label: 'Farmacodinâmica e Farmacocinética',
    conf: 0.92,
    note: 'farmacologia clínica',
  },
  {
    re: /rela[cç][aã]o dose-efeito.*epidemiol|preval[eê]ncia\.|letalidade|raz[aã]o de risco|morbimortalidade/i,
    label: 'Epidemiologia e Vigilância Epidemiológica',
    conf: 0.93,
    note: 'indicadores epidemiológicos',
  },
  {
    re: /agrot[oó]xicos|\bDL\s*50\b|\bDS\s*40\b/i,
    label: 'Procedimentos Diversos',
    conf: 0.91,
    note: 'agrotóxicos',
  },
  {
    re: /insufici[eê]ncia renal aguda|\bIRA\b.*rins/i,
    label: 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    conf: 0.92,
    note: 'IRA/DCNT',
  },
  {
    re: /transfus[aã]o de concentrado de hem[aá]cias|\bCH\b.*transfus/i,
    label: 'Punção Venosa e Cuidados com Cateteres',
    conf: 0.92,
    note: 'transfusão sanguínea',
  },
  {
    re: /c[aá]lculo correto do gotejamento.*importante para|c[aá]lculo correto da dosagem.*essencial/i,
    label: 'Cuidados na Administração de Medicamentos',
    conf: 0.91,
    note: 'conceito de segurança medicamentosa',
  },
  {
    re: /preparo do medicamento de forma segura|preparar e administrar esse medicamento\?/i,
    label: 'Cuidados na Administração de Medicamentos',
    conf: 0.92,
    note: 'preparo/administração segura',
  },
  {
    re: /diabetes mellitus tipo 2.*condi[cç][aã]o metab[oó]lica|diabetes mellitus tipo 2 \(DM2\)/i,
    label: 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    conf: 0.92,
    note: 'DM2/DCNT',
  },
];

function classify(item: BatchItem): Omit<InferRow, 'modulo_slug'> {
  const override = OVERRIDES[item.modulo_slug];
  if (override) return override;

  const blob = `${item.instruction} ${item.textFragment ?? ''} ${item.optionsPreview ?? ''}`;

  for (const rule of MOVE_RULES) {
    if (rule.re.test(blob)) {
      return {
        suggested_subtopico: rule.label,
        confidence: rule.conf,
        keep_current: false,
        rationale: `${rule.note} — tema dominante fora de Cálculo de Medicamentos e Infusões.`,
      };
    }
  }

  if (CALC_CORE_RE.test(blob)) {
    return {
      suggested_subtopico: BUCKET,
      confidence: 0.94,
      keep_current: true,
      rationale: 'Cálculo de dose, diluição, gotejamento ou conversão de unidades medicamentosas.',
    };
  }

  return {
    suggested_subtopico: BUCKET,
    confidence: 0.9,
    keep_current: true,
    rationale: 'Conteúdo compatível com cálculo medicamentoso ou sem destino canônico claro ≥0,90.',
  };
}

function writeInferred(batch: string, rows: InferRow[]) {
  const rel = `${OUT}/batch-${batch}-inferred.json`;
  writeFileSync(
    resolve(process.cwd(), rel),
    JSON.stringify({ batch, bucket: BUCKET, inferences: rows }, null, 2) + '\n',
  );
  const moves = rows.filter((r) => !r.keep_current && r.confidence >= 0.9).length;
  console.log(`batch-${batch}: ${rows.length} scanned, ${moves} moves (>=0.90)`);
}

let totalMoves = 0;
let totalScanned = 0;

for (let i = 1; i <= 3; i++) {
  const batch = String(i).padStart(2, '0');
  const data = JSON.parse(
    readFileSync(resolve(process.cwd(), `${OUT}/batch-${batch}.json`), 'utf8'),
  ) as { items: BatchItem[] };

  const rows: InferRow[] = data.items.map((item) => ({
    modulo_slug: item.modulo_slug,
    ...classify(item),
  }));

  writeInferred(batch, rows);
  totalScanned += rows.length;
  totalMoves += rows.filter((r) => !r.keep_current && r.confidence >= 0.9).length;
}

console.log(`TOTAL: ${totalScanned} scanned, ${totalMoves} moves (>=0.90)`);

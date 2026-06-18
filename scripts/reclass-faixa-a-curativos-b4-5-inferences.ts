#!/usr/bin/env tsx
/**
 * Onda 8 — Curativos e Manejo de Feridas faixa A, batches 04–05 (~60 questões).
 * Classificação agente por leitura de enunciado → batch-XX-inferred.json
 *
 *   npx tsx scripts/reclass-faixa-a-curativos-b4-5-inferences.ts
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

const BUCKET = 'Curativos e Manejo de Feridas';
const OUT = 'artifacts/reclass/faixa-a/curativos';

const FQ = 'Feridas e Queimaduras';
const MOB = 'Mobilização e Posicionamento do Paciente';
const SV = 'Verificação de Sinais Vitais';
const PERI = 'Assistência Perioperatória (Inclui SRPA)';
const CC = 'Enfermagem em Centro Cirúrgico';
const PROC = 'Procedimentos Diversos';
const VIAS = 'Vias de Administração';
const EPID = 'Epidemiologia e Vigilância Epidemiológica';
const VIR = 'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)';
const ATB = 'Atenção Básica / Saúde da Família';
const SM = 'Saúde da Mulher';
const PE = 'Processo de Enfermagem';
const PROMO = 'Promoção à Saúde e Prevenção de Agravos';

const CUR_CORE_RE =
  /curativ|ferida|desbridament|exsudat|alginato|hidrocoloid|hidrogel|hidropol[ií]mero|colagenase|bota de unna|úlcera venosa|ferida operat|ferida cir[uú]rgic|retirada de pontos|t[eé]cnica ass[eé]ptic.*ferida|limpeza da ferida|limpeza de ferida|troca de curativo|cobertura.*ferida|leito da ferida|cicatriza[cç][aã]o.*ferida|esfacelo|penrose|dreno de ferida|curativo da ferida|manejo de feridas|ostomia|periestomal|colostomia.*(?:pele|bolsa|coletor)|bandagem.*ferida|atadura.*ferida|semi.?oclusiv/i;

/** Overrides manuais pós-leitura (slug → row sem modulo_slug) */
const OVERRIDES: Record<string, Omit<InferRow, 'modulo_slug'>> = {
  // batch 04
  'instituto-aocp-enfermagem-processo-de-enfermagem-1780003950945-8': {
    suggested_subtopico: VIAS,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Técnica de injeção intramuscular na região ventroglútea.',
  },
  'instituto-consulpam-enfermagem-processo-de-enfermagem-1780006486032-1': {
    suggested_subtopico: SV,
    confidence: 0.96,
    keep_current: false,
    rationale: 'Cuidados na aferição da pressão arterial.',
  },
  'instituto-verbena-enfermagem-curativos-e-manejo-de-feridas-1779269212740-4': {
    suggested_subtopico: PROC,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Imobilização de fratura de falange — procedimento ortopédico.',
  },
  'instituto-verbena-enfermagem-curativos-e-manejo-de-feridas-1779269212740-5': {
    suggested_subtopico: PROC,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Imobilização com fibra de vidro — técnica ortopédica.',
  },
  'instituto-verbena-enfermagem-curativos-e-manejo-de-feridas-1779269315587-5': {
    suggested_subtopico: PERI,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Dreno cirúrgico de Penrose no pós-operatório de apendicectomia.',
  },
  'instituto-verbena-enfermagem-curativos-e-manejo-de-feridas-1779269315587-6': {
    suggested_subtopico: CC,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Inserção de drenos cirúrgicos no ato operatório.',
  },
  'instituto-verbena-enfermagem-curativos-e-manejo-de-feridas-1779344826734-7': {
    suggested_subtopico: PERI,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Monitoramento do cuidado pós-operatório hospitalar.',
  },
  'instituto-verbena-enfermagem-processo-de-enfermagem-1780008210115-2': {
    suggested_subtopico: ATB,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Atribuições do técnico na Atenção Primária à Saúde.',
  },
  'instituto-verbena-enfermagem-processo-de-enfermagem-1780009303038-8': {
    suggested_subtopico: PE,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Evolução de enfermagem e registro assistencial.',
  },
  'instituto-verbena-enfermagem-processo-de-enfermagem-1780009303038-9': {
    suggested_subtopico: ATB,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Papel da Estratégia Saúde da Família na APS.',
  },
  'ivin-enfermagem-curativos-e-manejo-de-feridas-1779344819753-4': {
    suggested_subtopico: PERI,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Identificação e manejo de dreno no retorno do centro cirúrgico.',
  },
  'maranatha-assessoria-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563868300-1': {
    suggested_subtopico: PROMO,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Orientação preventiva de pé diabético na atenção primária.',
  },
  'ms-sarmento-enfermagem-processo-de-enfermagem-1780008219236-3': {
    suggested_subtopico: SV,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Interpretação de valores de pressão arterial na consulta.',
  },
  'objetiva-concursos-enfermagem-curativos-e-manejo-de-feridas-1779269315587-7': {
    suggested_subtopico: PROC,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Aplicação de compressas frias — agente físico, não curativo de ferida.',
  },
  'objetiva-concursos-enfermagem-curativos-e-manejo-de-feridas-1779344759089-3': {
    suggested_subtopico: MOB,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Definição e fatores de risco de lesão por pressão — prevenção.',
  },
  'quadrix-enfermagem-processo-de-enfermagem-1780009281546-6': {
    suggested_subtopico: MOB,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Prevenção e classificação de LPP — posicionamento e mobilização.',
  },
  'quadrix-enfermagem-processo-de-enfermagem-1780009294428-9': {
    suggested_subtopico: EPID,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Doenças de notificação compulsória — vigilância epidemiológica.',
  },
  'selecon-enfermagem-curativos-e-manejo-de-feridas-1779344813448-5': {
    suggested_subtopico: FQ,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Queimadura térmica de 2º grau — manejo de queimados.',
  },
  'selecon-enfermagem-processo-de-enfermagem-1780009310940-9': {
    suggested_subtopico: PE,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Conceito de processo saúde-doença no planejamento assistencial.',
  },
  'unesc-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563858390-8': {
    suggested_subtopico: EPID,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Controle de surtos de dengue — vigilância epidemiológica.',
  },
  'univali-enfermagem-curativos-e-manejo-de-feridas-1779269228428-4': {
    suggested_subtopico: SM,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Cuidados com mamas e amamentação na puérpera.',
  },
  // batch 05
  'vunesp-enfermagem-curativos-e-manejo-de-feridas-1779269305691-8': {
    suggested_subtopico: PROC,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Imobilização conservadora de fratura do cuboide.',
  },
  'vunesp-enfermagem-curativos-e-manejo-de-feridas-1779269315587-0': {
    suggested_subtopico: PROC,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Confecção de janela em gesso circular — imobilização ortopédica.',
  },
  'vunesp-enfermagem-curativos-e-manejo-de-feridas-1779269315587-1': {
    suggested_subtopico: PROC,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Gesso molhado e mole — manutenção de imobilização ortopédica.',
  },
  'vunesp-enfermagem-curativos-e-manejo-de-feridas-1779269315587-2': {
    suggested_subtopico: PROC,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Imobilização de fratura da falange proximal do polegar.',
  },
  'vunesp-enfermagem-curativos-e-manejo-de-feridas-1779344779828-3': {
    suggested_subtopico: SM,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Avaliação de ferida operatória em puérpera pós-cesariana.',
  },
  'vunesp-enfermagem-curativos-e-manejo-de-feridas-1779344779828-4': {
    suggested_subtopico: PROMO,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Educação em saúde para diabéticos na UBS — promoção.',
  },
  'vunesp-enfermagem-processo-de-enfermagem-1776055865890-0': {
    suggested_subtopico: PE,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Prescrição de enfermagem e execução de cuidados prescritos.',
  },
};

const MOVE_RULES: { re: RegExp; label: string; conf: number; note: string }[] = [
  {
    re: /aferi[cç][aã]o da press[aã]o arterial|press[aã]o arterial.*mmhg|medi[cç][aã]o.*press[aã]o arterial/i,
    label: SV,
    conf: 0.94,
    note: 'pressão arterial',
  },
  {
    re: /primeiros socorros.*queimadura|queimadura.*(?:2[°º]|segundo) grau|queimadura t[eé]rmica/i,
    label: FQ,
    conf: 0.94,
    note: 'queimaduras',
  },
  {
    re: /inje[cç][aã]o intramuscular|regi[aã]o ventrogl[uú]tea|m[uú]sculo vasto lateral/i,
    label: VIAS,
    conf: 0.93,
    note: 'via IM',
  },
  {
    re: /notifica[cç][aã]o compuls[oó]ria|doen[cç]as de notifica[cç][aã]o compuls[oó]ria|controle de surtos/i,
    label: EPID,
    conf: 0.93,
    note: 'vigilância epidemiológica',
  },
  {
    re: /dreno cir[uú]rgico|inser[cç][aã]o dos drenos|p[oó]s-operat[oó]rio mediato.*dreno|penrose/i,
    label: PERI,
    conf: 0.92,
    note: 'perioperatório/drenos',
  },
  {
    re: /imobiliza[cç][aã]o.*fratura|gesso (circular|sint[eé]tico)|confec[cç][aã]o de janela|fibra de vidro.*imobiliza/i,
    label: PROC,
    conf: 0.92,
    note: 'imobilização ortopédica',
  },
  {
    re: /compressa fria|crioterapia|termoterapia|compressa quente/i,
    label: PROC,
    conf: 0.91,
    note: 'agentes físicos',
  },
  {
    re: /(?:preven[cç][aã]o|defini[cç][aã]o).*(?:úlcera|les[aã]o) por press[aã]o|les[oõ]es por press[aã]o s[aã]o danos localizados/i,
    label: MOB,
    conf: 0.91,
    note: 'prevenção LPP',
  },
  {
    re: /estrat[eé]gia sa[uú]de da fam[ií]lia|aten[cç][aã]o prim[aá]ria.*atribui[cç][oõ]es|princ[ií]pios da aten[cç][aã]o prim[aá]ria/i,
    label: ATB,
    conf: 0.92,
    note: 'atenção básica',
  },
  {
    re: /evolu[cç][aã]o de enfermagem|prescri[cç][aã]o de enfermagem|processo sa[uú]de-doen[cç]a/i,
    label: PE,
    conf: 0.91,
    note: 'processo de enfermagem',
  },
  {
    re: /pu[eé]rpera|amamenta[cç][aã]o|cesariana.*pu[eé]rpera|mamas.*pu[eé]rpera/i,
    label: SM,
    conf: 0.93,
    note: 'saúde da mulher',
  },
  {
    re: /educa[cç][aã]o em sa[uú]de.*diab[eé]tic|grupos de educa[cç][aã]o em sa[uú]de|orienta[cç][aã]o preventiva/i,
    label: PROMO,
    conf: 0.91,
    note: 'promoção/educação',
  },
  {
    re: /dengue.*surtos|surtos de dengue/i,
    label: EPID,
    conf: 0.93,
    note: 'vigilância de surtos',
  },
];

function classify(item: BatchItem): Omit<InferRow, 'modulo_slug'> {
  const override = OVERRIDES[item.modulo_slug];
  if (override) return override;

  const blob = `${item.instruction} ${item.textFragment ?? ''} ${item.optionsPreview ?? ''}`;

  if (
    /les[aã]o por press[aã]o.*est[aá]gio|úlcera.*est[aá]gio|lpp.*(?:hidrocoloid|alginato|espuma|curativo|exsudato)/i.test(
      blob,
    )
  ) {
    return {
      suggested_subtopico: BUCKET,
      confidence: 0.94,
      keep_current: true,
      rationale: 'Escolha de curativo ou manejo de úlcera por pressão.',
    };
  }

  for (const rule of MOVE_RULES) {
    if (rule.re.test(blob) || rule.re.test(item.modulo_slug)) {
      return {
        suggested_subtopico: rule.label,
        confidence: rule.conf,
        keep_current: false,
        rationale: `${rule.note} — tema dominante fora de Curativos.`,
      };
    }
  }

  if (CUR_CORE_RE.test(blob) || item.modulo_slug.includes('curativos-e-manejo-de-feridas')) {
    return {
      suggested_subtopico: BUCKET,
      confidence: 0.94,
      keep_current: true,
      rationale: 'Técnica, cobertura ou manejo de feridas/curativos.',
    };
  }

  return {
    suggested_subtopico: BUCKET,
    confidence: 0.88,
    keep_current: true,
    rationale: 'Sem tema dominante claro fora de Curativos — manter bucket.',
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

for (const batch of ['04', '05']) {
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

if (totalScanned !== 60) {
  throw new Error(`Esperado 60 questões, obtido ${totalScanned}`);
}

console.log(JSON.stringify({ scanned: totalScanned, moves: totalMoves }, null, 2));

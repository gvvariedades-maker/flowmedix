#!/usr/bin/env tsx
/**
 * Onda 8 — Noções de Fisiologia faixa A, batches 03–04.
 * Classificação agente por leitura de enunciado → batch-XX-inferred.json
 *
 *   npx tsx scripts/reclass-faixa-a-fisiologia-b3-4-inferences.ts
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

const ANAT = 'Noções de Anatomia';
const SV = 'Verificação de Sinais Vitais';
const PE = 'Processo de Enfermagem';
const VIAS = 'Vias de Administração';
const SONDA = 'Instalação e Manejo de Sondas';
const MOB = 'Mobilização e Posicionamento do Paciente';
const COL = 'Coleta de Exames Laboratoriais';
const PROC = 'Procedimentos Diversos';
const CME = 'Enfermagem em Central de Material e Esterilização (CME)';
const BIOS = 'Infecções no Contexto da Biossegurança';
const PREC = 'Medidas de Prevenção e Precaução de Contato';
const ATB = 'Atenção Básica / Saúde da Família';
const DCNT = 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis';
const IST = 'Infecções Sexualmente Transmissíveis (ISTs)';
const VIR = 'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)';
const PARA = 'Doenças Parasitárias e Zoonoses';
const SCC = 'Saúde da Criança';
const SCM = 'Saúde da Mulher';
const EPID = 'Epidemiologia e Vigilância Epidemiológica';

/** Overrides manuais pós-leitura (slug → row sem modulo_slug) */
const OVERRIDES: Record<string, Omit<InferRow, 'modulo_slug'>> = {
  // batch 03 — idib (questões mescladas fora de fisiologia)
  'idib-enfermagem-nocoes-de-fisiologia-1778934957741-5': {
    suggested_subtopico: ATB,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Assistência de enfermagem na APS para controle da HAS.',
  },
  'idib-enfermagem-nocoes-de-fisiologia-1778934957741-6': {
    suggested_subtopico: BIOS,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Prevenção de IRAS — biossegurança e controle de infecção.',
  },
  'idib-enfermagem-nocoes-de-fisiologia-1778934957741-7': {
    suggested_subtopico: IST,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Sífilis na gestação — IST e conduta pré-natal.',
  },
  'idib-enfermagem-nocoes-de-fisiologia-1778934957741-8': {
    suggested_subtopico: SONDA,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Gastrostomia vs jejunostomia — alimentação por sonda.',
  },
  'idib-enfermagem-nocoes-de-fisiologia-1778934957741-9': {
    suggested_subtopico: CME,
    confidence: 0.96,
    keep_current: false,
    rationale: 'Funções da Central de Material e Esterilização.',
  },
  'idib-enfermagem-nocoes-de-fisiologia-1778934965770-0': {
    suggested_subtopico: SONDA,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Monitoramento de nutrição enteral — cuidado com sonda/alimentação.',
  },
  'idib-enfermagem-nocoes-de-fisiologia-1778934965770-2': {
    suggested_subtopico: VIR,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Diagnóstico laboratorial de COVID-19 em gestantes.',
  },
  'idib-enfermagem-nocoes-de-fisiologia-1778934965770-3': {
    suggested_subtopico: PROC,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Eletrocardiograma — exame complementar/procedimento.',
  },
  'idib-enfermagem-nocoes-de-fisiologia-1778934965770-4': {
    suggested_subtopico: DCNT,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Estratégias de APS para DCNT (HAS, diabetes).',
  },
  'idib-enfermagem-nocoes-de-fisiologia-1778934965770-5': {
    suggested_subtopico: SCC,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Convulsões neonatais — saúde da criança/neonatologia.',
  },
  'idib-enfermagem-nocoes-de-fisiologia-1778934965770-6': {
    suggested_subtopico: PARA,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Zoonoses e vigilância integrada — parasitárias/zoonoses.',
  },
  'ieses-enfermagem-coleta-de-exames-laboratoriais-1779563248005-8': {
    suggested_subtopico: COL,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Importância da coleta correta de materiais para exames.',
  },
  'inaz-do-para-enfermagem-nocoes-de-fisiologia-1775501938701-3': {
    suggested_subtopico: SV,
    confidence: 0.95,
    keep_current: false,
    rationale: 'FC 169 BPM — classificação de taquicardia (sinal vital).',
  },
  'instituto-consulplan-enfermagem-nocoes-de-fisiologia-1776055798601-2': {
    suggested_subtopico: MOB,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Tratamento de fraturas instáveis com gesso — imobilização.',
  },
  'instituto-consulplan-enfermagem-nocoes-de-fisiologia-1776055998470-4': {
    suggested_subtopico: MOB,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Posicionamento/decúbito no transporte de pacientes.',
  },
  'nao-informado-geral-nocoes-de-fisiologia-1775501802332-0': {
    suggested_subtopico: PROC,
    confidence: 0.9,
    keep_current: false,
    rationale: 'Fixação de tecido para histologia — técnica laboratorial especializada.',
  },
  'objetiva-concursos-enfermagem-nocoes-de-fisiologia-1775501962697-1': {
    suggested_subtopico: SV,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Valores de referência de frequência cardíaca em adultos.',
  },
  'objetiva-concursos-enfermagem-nocoes-de-fisiologia-1775501962697-4': {
    suggested_subtopico: ANAT,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Anatomia das vias aéreas superiores (nariz, conchas, meatos).',
  },
  'imparh-enfermagem-exames-laboratoriais-1779563631609-0': {
    suggested_subtopico: BUCKET,
    confidence: 0.94,
    keep_current: true,
    rationale: 'Hipernatremia — distúrbio eletrolítico/fisiologia.',
  },
  'instituto-access-enfermagem-nocoes-de-fisiologia-1775448615466-2': {
    suggested_subtopico: BUCKET,
    confidence: 0.93,
    keep_current: true,
    rationale: 'Termorregulação e controle de temperatura corporal.',
  },
  'instituto-consulplan-enfermagem-nocoes-de-fisiologia-1776055998470-5': {
    suggested_subtopico: BUCKET,
    confidence: 0.93,
    keep_current: true,
    rationale: 'Fisiologia cardíaca, ciclo cardíaco e fatores da PA.',
  },
  'instituto-consulplan-enfermagem-nocoes-de-fisiologia-1776056116422-3': {
    suggested_subtopico: BUCKET,
    confidence: 0.94,
    keep_current: true,
    rationale: 'Soluções isotônicas/hipo/hiper — osmolaridade e fisiologia.',
  },
  'selecon-enfermagem-processo-de-enfermagem-1780009310940-6': {
    suggested_subtopico: BUCKET,
    confidence: 0.93,
    keep_current: true,
    rationale: 'Fisiologia da anemia e transporte de O2 pelas hemácias.',
  },
  // batch 04
  'selecon-enfermagem-vias-de-administracao-1778968687469-0': {
    suggested_subtopico: MOB,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Posição de Sims para medicação retal e temperatura.',
  },
  'unesc-enfermagem-nocoes-de-fisiologia-1775501962697-0': {
    suggested_subtopico: SV,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Parâmetros normais de PA, FC, FR e SpO2 — sinais vitais.',
  },
  'unesc-enfermagem-nocoes-de-fisiologia-1776055811481-1': {
    suggested_subtopico: PE,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Técnicas de antropometria (altura, envergadura, maca-balança).',
  },
  'vunesp-enfermagem-vias-de-administracao-1778968768987-5': {
    suggested_subtopico: VIAS,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Via de administração da nutrição parenteral total (endovenosa).',
  },
};

const FISIO_CORE =
  /fisiolog|homeostase|homeostasis|n[eé]fron|hematopoiese|hem[aá]cia|hemoglobina|hematose|trocas gasosas|quimiorreceptor|diafragma|nervo fr[eê]nico|ilhotas de langerhans|insulina|glucagon|macronutrient|dist[uú]rbio.*(?:s[oó]dio|pot[aá]ssio|eletrol|metab[oó]lic)|hipernatremia|hipocalemia|hipercalemia|hipóxia cerebral|termorregula|circula[cç][aã]o pulmonar|d[eé]bito card[ií]aco|vasoconstri|vasodilat|sistema (?:nervoso|renal|vascular|respirat[oó]rio|musculoesquel[eé]tico)|cortisol|glicocorticoide|gasometria|pa[o2]|equil[ií]brio [aá]cido-base|reparo dos tecidos|cicatriza[cç][aã]o.*tecido|anemia.*fisiolog|transporte de ox[ií]geno|fezes ac[oó]lic|antropometria.*fisiolog/i;

const MOVE_RULES: { re: RegExp; label: string; conf: number; note: string; skipIfFisioCore?: boolean }[] = [
  {
    re: /coleta de materiais|coleta.*exames diagn[oó]sticos|import[aâ]ncia da coleta correta/i,
    label: COL,
    conf: 0.94,
    note: 'coleta laboratorial',
  },
  {
    re: /posi[cç][aã]o (?:de sims|terap[eê]utica|litot[oô]mica|fowler)|posicionamento do paciente|auxiliar o paciente a adotar posi/i,
    label: MOB,
    conf: 0.92,
    note: 'posicionamento',
  },
  {
    re: /sinais vitais|frequ[eê]ncia card[ií]aca normal|bradicardia|taquicardia|press[aã]o arterial ideal|spo2|saturação de oxig[eê]nio|aferi[cç][aã]o.*temperatura/i,
    label: SV,
    conf: 0.93,
    note: 'sinais vitais',
  },
  {
    re: /via (?:oral|retal|intramuscular|endovenosa|enteral)|nutri[cç][aã]o parenteral|\bnpt\b|vias de administra/i,
    label: VIAS,
    conf: 0.92,
    note: 'vias de administração',
  },
  {
    re: /gastrostomia|jejunostomia|nutri[cç][aã]o enteral|sonda.*aliment/i,
    label: SONDA,
    conf: 0.92,
    note: 'sondas/alimentação',
  },
  {
    re: /central de material|esteriliza[cç][aã]o.*(?:cme|materiais)|processamento.*artigos/i,
    label: CME,
    conf: 0.94,
    note: 'CME',
  },
  {
    re: /\biras\b|infec[cç][oõ]es relacionadas [àa] assist[eê]ncia|\biaas\b|precau[cç][oõ]es padr[aã]o.*infec/i,
    label: BIOS,
    conf: 0.92,
    note: 'IRAS/biossegurança',
  },
  {
    re: /s[ií]filis|\bhiv\b|infec[cç][oõ]es sexualmente transmiss/i,
    label: IST,
    conf: 0.93,
    note: 'IST',
  },
  {
    re: /covid|sars-cov|coronav[ií]rus|teste.*ant[ií]geno.*covid/i,
    label: VIR,
    conf: 0.92,
    note: 'COVID/viral',
  },
  {
    re: /zoonose|vigil[aâ]ncia.*animal|doen[cç]as parasit[aá]rias/i,
    label: PARA,
    conf: 0.93,
    note: 'zoonoses',
  },
  {
    re: /dcnt|doen[cç]as cr[oô]nicas n[aã]o transmiss|hipertens[aã]o arterial.*aps|diabetes.*aps/i,
    label: DCNT,
    conf: 0.91,
    note: 'DCNT',
  },
  {
    re: /rec[eé]m-nascido|neonat|convuls[aã]o neonatal|\blactente\b/i,
    label: SCC,
    conf: 0.92,
    note: 'saúde da criança',
    skipIfFisioCore: true,
  },
  {
    re: /eletrocardiograma|\becg\b|deriva[cç][oõ]es precordiais/i,
    label: PROC,
    conf: 0.93,
    note: 'ECG',
  },
  {
    re: /aten[cç][aã]o prim[aá]ria|aten[cç][aã]o b[aá]sica|aps\b|esf\b/i,
    label: ATB,
    conf: 0.9,
    note: 'atenção básica',
  },
  {
    re: /conchas nasais|meatos|vest[ií]bulo nasal|epit[eé]lio olfat/i,
    label: ANAT,
    conf: 0.91,
    note: 'anatomia respiratória',
  },
  {
    re: /altura recumbente|envergadura|maca-balan[cç]a|antropometria.*(?:m[eé]todo|medida|t[eé]cnica)/i,
    label: PE,
    conf: 0.9,
    note: 'antropometria no PE',
  },
];

function classify(item: BatchItem): Omit<InferRow, 'modulo_slug'> {
  const override = OVERRIDES[item.modulo_slug];
  if (override) return override;

  const blob = `${item.instruction} ${item.textFragment ?? ''} ${item.optionsPreview ?? ''}`;

  if (FISIO_CORE.test(blob) || item.modulo_slug.includes('nocoes-de-fisiologia')) {
    return {
      suggested_subtopico: BUCKET,
      confidence: 0.93,
      keep_current: true,
      rationale: 'Funções orgânicas, homeostase ou fisiologia aplicada.',
    };
  }

  for (const rule of MOVE_RULES) {
    if (rule.skipIfFisioCore && FISIO_CORE.test(blob)) continue;
    if (rule.re.test(blob) || rule.re.test(item.modulo_slug)) {
      return {
        suggested_subtopico: rule.label,
        confidence: rule.conf,
        keep_current: false,
        rationale: `${rule.note} — tema dominante fora de Fisiologia.`,
      };
    }
  }

  if (
    item.modulo_slug.includes('exames-laboratoriais') &&
    /hemograma|gasometria|pot[aá]ssio|s[oó]dio|dist[uú]rbio metab/i.test(blob)
  ) {
    return {
      suggested_subtopico: BUCKET,
      confidence: 0.91,
      keep_current: true,
      rationale: 'Interpretação fisiológica de exame laboratorial.',
    };
  }

  return {
    suggested_subtopico: BUCKET,
    confidence: 0.88,
    keep_current: true,
    rationale: 'Sem tema dominante claro fora de Fisiologia — manter bucket.',
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

for (const batch of ['03', '04']) {
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

console.log(JSON.stringify({ scanned: totalScanned, moves: totalMoves }, null, 2));

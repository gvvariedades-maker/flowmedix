#!/usr/bin/env tsx
/**
 * Onda 8 — Instalação e Manejo de Sondas faixa A, batches 01–02 (~100 questões).
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

const BUCKET = 'Instalação e Manejo de Sondas';
const OUT = 'artifacts/reclass/faixa-a/sondas';
const OXI = 'Oxigenoterapia e Cuidados Respiratórios';
const MED = 'Cuidados na Administração de Medicamentos';
const BIOS = 'Infecções no Contexto da Biossegurança';
const PROMO = 'Promoção à Saúde e Prevenção de Agravos';
const PUNCAO = 'Punção Venosa e Cuidados com Cateteres';
const URG = 'Urgências e Emergências';
const MULHER = 'Saúde da Mulher';
const ATB = 'Atenção Básica / Saúde da Família';
const COLETA = 'Coleta de Exames Laboratoriais';
const CME = 'Enfermagem em Central de Material e Esterilização (CME)';
const SEG = 'Segurança do Paciente';
const FARM = 'Farmacodinâmica e Farmacocinética';
const PERI = 'Assistência Perioperatória (Inclui SRPA)';
const PE = 'Processo de Enfermagem';
const PROC = 'Procedimentos Diversos';

const SONDA_CORE_RE =
  /sondagem|sonda nasog[aá]strica|\bSNG\b|\bSNE\b|nasoenteral|nascenteral|cateterismo vesical|sonda vesical|sondagem vesical|\bSVD\b|cateter de folley|foley|irriga[cç][aã]o vesical|enteroclisma|sondagem transpil[oó]rica|sondagem jejunal|alimenta[cç][aã]o enteral|dieta enteral|nutri[cç][aã]o enteral|terapia nutricional enteral|bal[aã]o.*cateter vesical|balonete.*foley|meato urin[aá]rio.*cateter|bolsa coletora.*urina|sonda g[aá]strica enteral|levine|kehr|sondas? digestivas?|sondas? urin[aá]rias?|dreno de t[oó]rax|dreno tor[aá]cico|drenagem vesical|cateter urin[aá]rio de demora/i;

const OVERRIDES: Record<string, Omit<InferRow, 'modulo_slug'>> = {
  'adm-tec-enfermagem-instalacao-e-manejo-de-sondas-1779344262940-8': {
    suggested_subtopico: BUCKET,
    confidence: 0.9,
    keep_current: true,
    rationale: 'Mescla cateterismo vesical e punção venosa sem tema dominante único.',
  },
  'adm-tec-enfermagem-instalacao-e-manejo-de-sondas-1779344262940-9': {
    suggested_subtopico: OXI,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Manejo de cuff do tubo endotraqueal em ventilação mecânica invasiva.',
  },
  'amauc-enfermagem-instalacao-e-manejo-de-sondas-1777102983353-2': {
    suggested_subtopico: PROMO,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Classificação de alimentos in natura e processados — promoção à saúde.',
  },
  'ameosc-enfermagem-processo-de-enfermagem-1776056181857-4': {
    suggested_subtopico: MED,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Administração segura de antibiótico intravenoso — cuidados medicamentosos.',
  },
  'ameosc-enfermagem-processo-de-enfermagem-1780001673873-1': {
    suggested_subtopico: BIOS,
    confidence: 0.94,
    keep_current: false,
    rationale: 'IRAS e custos assistenciais — infecção relacionada à assistência.',
  },
  'ameosc-enfermagem-vias-de-administracao-1776056357082-4': {
    suggested_subtopico: MED,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Terapia medicamentosa contínua e administração de medicamentos.',
  },
  'avancasp-enfermagem-instalacao-e-manejo-de-sondas-1776056561649-2': {
    suggested_subtopico: URG,
    confidence: 0.92,
    keep_current: false,
    rationale: 'AVC isquêmico e reabilitação — núcleo neurológico de urgência.',
  },
  'avancasp-enfermagem-processo-de-enfermagem-1780006444165-1': {
    suggested_subtopico: SEG,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Preparo para transporte intra-hospitalar seguro.',
  },
  'copese-uft-enfermagem-nutricao-aplicada-a-enfermagem-1777102879099-3': {
    suggested_subtopico: PROMO,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Desnutrição e desfechos clínicos — prevenção de agravos nutricionais.',
  },
  'cotec-fadenor-enfermagem-nutricao-aplicada-a-enfermagem-1777102879099-6': {
    suggested_subtopico: BUCKET,
    confidence: 0.92,
    keep_current: true,
    rationale: 'Disfagia grave com indicação de nutrição enteral por sonda.',
  },
  'cotec-fadenor-enfermagem-processo-de-enfermagem-1780002389285-3': {
    suggested_subtopico: FARM,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Velocidade de início de ação — farmacocinética/farmacodinâmica.',
  },
  'cpcon-uepb-enfermagem-instalacao-e-manejo-de-sondas-1777102813845-8': {
    suggested_subtopico: MULHER,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Nutrição na gestação — saúde da mulher/obstetrícia.',
  },
  'cpcon-uepb-enfermagem-processo-de-enfermagem-1780003868364-3': {
    suggested_subtopico: CME,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Separação de materiais para esterilização — CME.',
  },
  'fau-unicentro-enfermagem-instalacao-e-manejo-de-sondas-1776056518229-0': {
    suggested_subtopico: ATB,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Visita domiciliar da ESF após alta — atenção básica.',
  },
  'fenix-instituto-enfermagem-processo-de-enfermagem-1780006480333-1': {
    suggested_subtopico: URG,
    confidence: 0.96,
    keep_current: false,
    rationale: 'Vítima inconsciente sem respiração — prioridade de emergência/RCP.',
  },
  'fepese-enfermagem-processo-de-enfermagem-1780008241722-1': {
    suggested_subtopico: COLETA,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Exame de urina como teste de triagem — coleta laboratorial.',
  },
  'fepese-enfermagem-nutricao-aplicada-a-enfermagem-1777102983353-3': {
    suggested_subtopico: PROMO,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Possibilidades gerais de nutrição oral/enteral/parenteral — educação nutricional.',
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780007230169-5': {
    suggested_subtopico: URG,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Obstrução intestinal aguda — emergência clínica/cirúrgica.',
  },
  'gama-enfermagem-semiologia-em-enfermagem-1779563467322-7': {
    suggested_subtopico: BIOS,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Disúria pós-cateterismo — complicação infecciosa (ITU/IRAS).',
  },
};

const MOVE_RULES: { re: RegExp; label: string; conf: number; note: string; skipIfSonda?: boolean }[] = [
  {
    re: /tubo endotraqueal|press[aã]o do cuff|ventila[cç][aã]o mec[aâ]nica invasiva|aspira[cç][aã]o traqueal/i,
    label: OXI,
    conf: 0.94,
    note: 'TET/VMI',
  },
  {
    re: /infec[cç][oõ]es relacionadas [àa] assist[eê]ncia|\bIRAS\b/i,
    label: BIOS,
    conf: 0.93,
    note: 'IRAS',
    skipIfSonda: true,
  },
  {
    re: /administrar.*antibi[oó]tico intravenoso|administra[cç][aã]o segura.*medicamento|prescri[cç][aã]o m[eé]dica.*administr/i,
    label: MED,
    conf: 0.93,
    note: 'administração medicamentosa',
  },
  {
    re: /transporte intra-hospitalar/i,
    label: SEG,
    conf: 0.93,
    note: 'transporte seguro',
  },
  {
    re: /exame de urina.*triagem|teste de triagem.*urina/i,
    label: COLETA,
    conf: 0.92,
    note: 'exame urina',
  },
  {
    re: /v[ií]tima inconsciente|parada cardiorrespirat|sem movimentos respirat[oó]rios eficazes/i,
    label: URG,
    conf: 0.95,
    note: 'emergência/RCP',
  },
  {
    re: /farmacocin[eé]tica|velocidade de in[ií]cio de a[cç][aã]o/i,
    label: FARM,
    conf: 0.93,
    note: 'farmacocinética',
  },
  {
    re: /nutri[cç][aã]o.*progn[oó]stico da gesta[cç][aã]o|fundamental import[aâ]ncia.*gesta[cç][aã]o/i,
    label: MULHER,
    conf: 0.94,
    note: 'nutrição gestacional',
  },
  {
    re: /equipe de sa[uú]de da fam[ií]lia|\besf\b.*visita domiciliar|aten[cç][aã]o b[aá]sica.*domiciliar/i,
    label: ATB,
    conf: 0.92,
    note: 'ESF/APS',
  },
  {
    re: /alimentos in natura|alimenta[cç][aã]o e nutri[cç][aã]o.*alternativa correta|desnutridos t[eê]m piores desfechos/i,
    label: PROMO,
    conf: 0.91,
    note: 'nutrição geral/promoção',
  },
  {
    re: /materiais.*esteriliza[cç][aã]o|central de material|separar os materiais.*esteril/i,
    label: CME,
    conf: 0.92,
    note: 'CME/esterilização',
  },
  {
    re: /dis[uú]ria.*cateterismo|dis[uú]ria e dor perineal/i,
    label: BIOS,
    conf: 0.93,
    note: 'ITU pós-cateterismo',
  },
  {
    re: /acidente vascular cerebral|\bAVC\b isqu[eê]mico/i,
    label: URG,
    conf: 0.91,
    note: 'AVC',
    skipIfSonda: true,
  },
  {
    re: /pun[cç][aã]o venosa perif[eé]rica.*cateter venoso|t[eé]cnica ass[eé]ptica.*cateter venoso perif[eé]rico/i,
    label: PUNCAO,
    conf: 0.92,
    note: 'punção venosa',
    skipIfSonda: true,
  },
  {
    re: /p[oó]s-operat[oó]rio.*cirurgia g[aá]strica.*\bSNG\b/i,
    label: PERI,
    conf: 0.9,
    note: 'pós-operatório',
    skipIfSonda: true,
  },
  {
    re: /processo de enfermagem|registro.*prontu[aá]rio|passagem de plant[aã]o/i,
    label: PE,
    conf: 0.88,
    note: 'processo de enfermagem',
    skipIfSonda: true,
  },
];

function classify(item: BatchItem): Omit<InferRow, 'modulo_slug'> {
  const override = OVERRIDES[item.modulo_slug];
  if (override) return override;

  const blob = `${item.instruction} ${item.textFragment ?? ''} ${item.optionsPreview ?? ''}`;
  const sondaDominant = SONDA_CORE_RE.test(blob);

  if (/cateterismo vesical e pun[cç][oõ]es venosas perif[eé]ricas/i.test(blob)) {
    return {
      suggested_subtopico: BUCKET,
      confidence: 0.9,
      keep_current: true,
      rationale: 'Enunciado mescla sondagem vesical e punção venosa.',
    };
  }

  for (const rule of MOVE_RULES) {
    if (rule.skipIfSonda && sondaDominant) continue;
    if (rule.re.test(blob)) {
      return {
        suggested_subtopico: rule.label,
        confidence: rule.conf,
        keep_current: false,
        rationale: `${rule.note} — tema dominante fora de sondas.`,
      };
    }
  }

  if (sondaDominant || /instalacao-e-manejo-de-sondas/.test(item.modulo_slug)) {
    return {
      suggested_subtopico: BUCKET,
      confidence: 0.94,
      keep_current: true,
      rationale: 'SNG/SVD, nutrição enteral por sonda ou manejo de drenos/sondas.',
    };
  }

  if (/nutricao-aplicada-a-enfermagem/.test(item.modulo_slug)) {
    return {
      suggested_subtopico: PROMO,
      confidence: 0.9,
      keep_current: false,
      rationale: 'Nutrição aplicada sem foco técnico em sonda.',
    };
  }

  if (/processo-de-enfermagem/.test(item.modulo_slug)) {
    return {
      suggested_subtopico: PE,
      confidence: 0.88,
      keep_current: false,
      rationale: 'Contexto de processo de enfermagem sem procedimento de sonda dominante.',
    };
  }

  return {
    suggested_subtopico: BUCKET,
    confidence: 0.9,
    keep_current: true,
    rationale: 'Conteúdo compatível com sondas ou sem destino canônico claro ≥0,90.',
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

for (let i = 1; i <= 2; i++) {
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

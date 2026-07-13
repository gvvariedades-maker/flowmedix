#!/usr/bin/env tsx
/**
 * Onda 8 — Instalação e Manejo de Sondas faixa A, batches 03–04 (~100 questões).
 * Gera batch-03..04-inferred.json para catalog-merge-agent-infer.
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
const FISIO = 'Noções de Fisiologia';

const SONDA_CORE_RE =
  /sondagem|sonda nasog[aá]strica|\bSNG\b|\bSNE\b|nasoenteral|nascenteral|cateterismo vesical|sonda vesical|sondagem vesical|\bSVD\b|cateter de folley|foley|irriga[cç][aã]o vesical|enteroclisma|sondagem transpil[oó]rica|sondagem jejunal|alimenta[cç][aã]o enteral|dieta enteral|nutri[cç][aã]o enteral|terapia nutricional enteral|bal[aã]o.*cateter vesical|balonete.*foley|meato urin[aá]rio.*cateter|bolsa coletora.*urina|sonda g[aá]strica enteral|levine|kehr|sondas? digestivas?|sondas? urin[aá]rias?|dreno de t[oó]rax|dreno tor[aá]cico|drenagem vesical|cateter urin[aá]rio de demora/i;

const OVERRIDES: Record<string, Omit<InferRow, 'modulo_slug'>> = {
  // batch 03 — fora do slug sondas ou tema dominante distinto
  'ibade-enfermagem-processo-de-enfermagem-1780005311822-0': {
    suggested_subtopico: BIOS,
    confidence: 0.94,
    keep_current: false,
    rationale: 'IRAS por dispositivos invasivos e falha em higiene das mãos.',
  },
  'ibest-enfermagem-instalacao-e-manejo-de-sondas-1776056591416-2': {
    suggested_subtopico: OXI,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Aspiração de secreções em vias aéreas — cuidados respiratórios.',
  },
  'idecan-enfermagem-infeccoes-no-contexto-da-biosseguranca-1777102785845-4': {
    suggested_subtopico: BIOS,
    confidence: 0.95,
    keep_current: false,
    rationale: 'ITU/IRAS em paciente com SVD — infecção relacionada à assistência.',
  },
  'idecan-enfermagem-infeccoes-no-contexto-da-biosseguranca-1778712220716-2': {
    suggested_subtopico: BIOS,
    confidence: 0.95,
    keep_current: false,
    rationale: 'ITU/IRAS em paciente com SVD — infecção relacionada à assistência.',
  },
  'idecan-enfermagem-instalacao-e-manejo-de-sondas-1776056591416-4': {
    suggested_subtopico: OXI,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Aspiração de vias aéreas superiores — procedimento respiratório.',
  },
  'idecan-enfermagem-instalacao-e-manejo-de-sondas-1778712135178-8': {
    suggested_subtopico: OXI,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Aspiração de vias aéreas superiores — procedimento respiratório.',
  },
  'idecan-enfermagem-procedimentos-diversos-1778712184780-7': {
    suggested_subtopico: PROC,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Condutas pós-constatação de óbito — procedimentos diversos.',
  },
  'idesg-enfermagem-vias-de-administracao-1776056338955-4': {
    suggested_subtopico: MED,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Administração segura de medicamentos por sonda nasogástrica.',
  },
  'idib-enfermagem-cuidados-gerais-com-higiene-e-conforto-do-paciente-1778934890864-8': {
    suggested_subtopico: PROC,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Preparo do corpo após a morte — cuidados pós-óbito.',
  },
  'ieses-enfermagem-instalacao-e-manejo-de-sondas-1777102719125-0': {
    suggested_subtopico: BIOS,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Portaria 2.616/98 — definição de infecção hospitalar.',
  },
  'igeduc-enfermagem-processo-de-enfermagem-1780010917301-5': {
    suggested_subtopico: BUCKET,
    confidence: 0.92,
    keep_current: true,
    rationale: 'AVC com disfagia — nutrição/sonda enteral e prevenção de aspiração.',
  },
  'igeduc-enfermagem-processo-de-enfermagem-1780011859940-1': {
    suggested_subtopico: BUCKET,
    confidence: 0.95,
    keep_current: true,
    rationale: 'Prescrição e técnica de sondagem vesical de demora.',
  },
  'instituto-access-enfermagem-cuidados-na-administracao-de-medicamentos-1778969633568-8': {
    suggested_subtopico: MED,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Administração de medicamentos via sonda nasoenteral.',
  },
  'instituto-iacp-enfermagem-processo-de-enfermagem-1780001903454-5': {
    suggested_subtopico: BUCKET,
    confidence: 0.94,
    keep_current: true,
    rationale: 'Posicionamento para gavagem e prevenção de broncoaspiração.',
  },
  'instituto-iacp-enfermagem-processo-de-enfermagem-1780004280851-8': {
    suggested_subtopico: BUCKET,
    confidence: 0.93,
    keep_current: true,
    rationale: 'Monitoramento da nutrição enteral por gavagem.',
  },
  'selecon-enfermagem-instalacao-e-manejo-de-sondas-1776056502149-3': {
    suggested_subtopico: OXI,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Tubo endotraqueal em VM e pneumonia associada ao dispositivo.',
  },
  // batch 04
  'instituto-ibed-enfermagem-processo-de-enfermagem-1780004917460-8': {
    suggested_subtopico: BUCKET,
    confidence: 0.95,
    keep_current: true,
    rationale: 'Mensuração do comprimento da sonda nasogástrica.',
  },
  'instituto-verbena-enfermagem-processo-de-enfermagem-1780009303038-7': {
    suggested_subtopico: PROMO,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Definição conceitual de alimentação enteral — educação nutricional.',
  },
  'ms-sarmento-enfermagem-nutricao-aplicada-a-enfermagem-1777102845644-5': {
    suggested_subtopico: PROMO,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Definição de nutrição enteral — nutrição aplicada geral.',
  },
  'ms-sarmento-enfermagem-processo-de-enfermagem-1780008219236-6': {
    suggested_subtopico: PE,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Transferência de paciente e continuidade do cuidado — processo de enfermagem.',
  },
  'objetiva-concursos-enfermagem-semiologia-em-enfermagem-1779563480978-5': {
    suggested_subtopico: FISIO,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Características das eliminações intestinais — semiologia.',
  },
  'objetiva-concursos-enfermagem-instalacao-e-manejo-de-sondas-1776056668359-8': {
    suggested_subtopico: BUCKET,
    confidence: 0.91,
    keep_current: true,
    rationale: 'Obstrução pilórica com descompressão gástrica por SNG.',
  },
  'quadrix-enfermagem-procedimentos-diversos-1780000535393-7': {
    suggested_subtopico: PROC,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Cuidados ao corpo no pós-óbito — procedimentos diversos.',
  },
  'selecon-enfermagem-processo-de-enfermagem-1780009310940-8': {
    suggested_subtopico: BUCKET,
    confidence: 0.94,
    keep_current: true,
    rationale: 'Cuidados com SNG e SNE — manejo de sondas digestivas.',
  },
  'selecon-enfermagem-semiologia-em-enfermagem-1779563467322-6': {
    suggested_subtopico: BUCKET,
    confidence: 0.92,
    keep_current: true,
    rationale: 'Monitoramento de urina em paciente com sonda vesical.',
  },
  'unesc-enfermagem-nutricao-aplicada-a-enfermagem-1777102813845-5': {
    suggested_subtopico: PROMO,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Tipos de alimentação parenteral/enteral — nutrição aplicada.',
  },
  'vunesp-enfermagem-nutricao-aplicada-a-enfermagem-1777102845644-4': {
    suggested_subtopico: BUCKET,
    confidence: 0.93,
    keep_current: true,
    rationale: 'Administração de dieta por sonda nasoenteral em AVC.',
  },
  'vunesp-enfermagem-nutricao-aplicada-a-enfermagem-1777102944034-1': {
    suggested_subtopico: BUCKET,
    confidence: 0.92,
    keep_current: true,
    rationale: 'Complicações da dieta enteral em TCE — manejo de sonda.',
  },
};

const MOVE_RULES: { re: RegExp; label: string; conf: number; note: string; skipIfSonda?: boolean }[] = [
  {
    re: /tubo endotraqueal|press[aã]o do cuff|ventila[cç][aã]o mec[aâ]nica invasiva|aspira[cç][aã]o traqueal|aspira[cç][aã]o (das )?vias a[eé]reas|pneumonia associada ao dispositivo/i,
    label: OXI,
    conf: 0.94,
    note: 'TET/VMI/aspiração',
  },
  {
    re: /infec[cç][oõ]es relacionadas [àa] assist[eê]ncia|\bIRAS\b|portaria.*2\.616|infec[cç][aã]o nosocomial/i,
    label: BIOS,
    conf: 0.93,
    note: 'IRAS/biossegurança',
    skipIfSonda: true,
  },
  {
    re: /administrar.*antibi[oó]tico intravenoso|administra[cç][aã]o segura.*medicamento|prescri[cç][aã]o m[eé]dica.*administr|medicamentos? (via|por) sonda/i,
    label: MED,
    conf: 0.93,
    note: 'administração medicamentosa',
  },
  {
    re: /preparo do corpo ap[oó]s a morte|p[oó]s.?[oó]bito|constata[cç][aã]o do [oó]bito|cuidados.*corpo.*[oó]bito/i,
    label: PROC,
    conf: 0.93,
    note: 'pós-óbito',
  },
  {
    re: /transfer[eê]ncia de pacientes?|relat[oó]rio de transfer[eê]ncia|admiss[aã]o na unidade cl[ií]nica/i,
    label: PE,
    conf: 0.92,
    note: 'transferência/admissão',
    skipIfSonda: true,
  },
  {
    re: /elimina[cç][oõ]es intestinais/i,
    label: FISIO,
    conf: 0.91,
    note: 'semiologia eliminações',
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
    re: /alimentos in natura|alimenta[cç][aã]o enteral [eé] definida|desnutridos t[eê]m piores desfechos|tipos de alimenta[cç][oõ]es.*parental/i,
    label: PROMO,
    conf: 0.91,
    note: 'nutrição geral/promoção',
    skipIfSonda: true,
  },
  {
    re: /materiais.*esteriliza[cç][aã]o|central de material|separar os materiais.*esteril/i,
    label: CME,
    conf: 0.92,
    note: 'CME/esterilização',
  },
  {
    re: /dis[uú]ria.*cateterismo|pus com urina|pi[uú]ria/i,
    label: BIOS,
    conf: 0.93,
    note: 'ITU pós-cateterismo',
    skipIfSonda: true,
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

for (let i = 3; i <= 4; i++) {
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

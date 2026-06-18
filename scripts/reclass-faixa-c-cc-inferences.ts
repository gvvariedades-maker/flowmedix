#!/usr/bin/env tsx
/**
 * Onda 8 — Enfermagem em Centro Cirúrgico faixa C, batches 01-03 (145 questões).
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

const BUCKET = 'Enfermagem em Centro Cirúrgico';
const OUT = 'artifacts/reclass/faixa-c/centro-cirurgico';

const PERI = 'Assistência Perioperatória (Inclui SRPA)';
const BIOS = 'Infecções no Contexto da Biossegurança';
const CME = 'Enfermagem em Central de Material e Esterilização (CME)';
const PROC_ART = 'Processamento de Artigos e Produtos de Saúde';
const MOB = 'Mobilização e Posicionamento do Paciente';
const ANAT = 'Noções de Anatomia';
const PE = 'Processo de Enfermagem';
const CUR = 'Curativos e Manejo de Feridas';
const SONDAS = 'Instalação e Manejo de Sondas';
const APS = 'Atenção Básica / Saúde da Família';
const URG = 'Urgências e Emergências';
const SCM = 'Saúde da Mulher';
const DCNT = 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis';
const SEG = 'Segurança do Paciente';
const PROC = 'Procedimentos Diversos';
const MED = 'Cuidados na Administração de Medicamentos';

const CC_CORE_RE =
  /centro cir[uú]rgico|sala (?:cir[uú]rgica|operat[oó]ria|de opera[cç][õo]es)|campo est[eé]ril|instrumenta[cç][aã]o cir[uú]rgica|instrumentador(?:a)?|circulante|degerma[cç][aã]o|escova[cç][aã]o cir[uú]rgica|paramenta[cç][aã]o(?:\s+cir[uú]rgica)?|mes[aá] cir[uú]rgica|assepsia(?:\s+cir[uú]rgica)?|t[eé]cnica est[eé]ril|bisturi|pin[cç]a(?:s)?(?:\s+de)?|afastador|hamper|lista de verifica[cç][aã]o|cirurgia segura|sign[\s-]?in|time[\s-]?out|sign[\s-]?out|montagem (?:da mesa|da sala)|limpeza.*sala(?:\s+de)?(?:\s+cirurgia|\s+operat[oó]ria)?|zona[s]?(?:\s+limpa|\s+contaminada|\s+esterilizada)?|porte\s*(?:I{1,3}|[123IVX]+)|potencial de contamina[cç][aã]o|cirurgia\s+(?:limpa|contaminada|infectada|potencialmente)|tempos?\s+cir[uú]rgicos|di[eé]rese|hemostasia|ex[eé]rese|s[ií]ntese|antissepsia(?:\s+cir[uú]rgica)?|[áa]rea cir[uú]rgica|temperatura.*sala de cirurgia|confer[eê]ncia de (?:gazes|compressas|instrumentos)|indicador(?:es)?.*esteriliza[cç][aã]o|posi[cç][aã]o(?:es)?\s+cir[uú]rgica|dec[uú]bito\s+(?:dorsal|ventral|trendelenburg|litotomia|jackson|kraske|fowler|rose|proetz)|instrumentos?\s+cir[uú]rgicos?/i;

const OVERRIDES: Record<string, Omit<InferRow, 'modulo_slug'>> = {
  'apice-enfermagem-enfermagem-em-centro-cirurgico-1777103901265-8': {
    suggested_subtopico: ANAT,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Terminologia cirúrgica (-ectomia, -rafia) — núcleo anatomia.',
  },
  'fauel-enfermagem-enfermagem-em-centro-cirurgico-1777103887798-0': {
    suggested_subtopico: URG,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Colecistite no pronto atendimento — urgência clínica.',
  },
  'fundatec-enfermagem-enfermagem-em-centro-cirurgico-1777103825926-2': {
    suggested_subtopico: SONDAS,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Estoma/jejunostomia para alimentação — sondas/ostomias.',
  },
  'ibade-enfermagem-enfermagem-em-centro-cirurgico-1777103927465-4': {
    suggested_subtopico: DCNT,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Complicações de angioplastia — doença cardiovascular crônica.',
  },
  'idecan-enfermagem-enfermagem-em-centro-cirurgico-1780067001671-7': {
    suggested_subtopico: PE,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Definição e função do prontuário — documentação do PE.',
  },
  'instituto-consulplan-enfermagem-enfermagem-em-centro-cirurgico-1777103852550-1': {
    suggested_subtopico: BIOS,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Infecção por cateter intravenoso — IRAS/biossegurança.',
  },
  'selecon-enfermagem-enfermagem-em-centro-cirurgico-1777103837493-2': {
    suggested_subtopico: CUR,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Limpeza mecânica de ferida no curativo — manejo de feridas.',
  },
  'vunesp-enfermagem-enfermagem-em-centro-cirurgico-1777103852550-0': {
    suggested_subtopico: APS,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Orientação pré-cirúrgica na equipe de saúde da família.',
  },
  'amauc-enfermagem-processo-de-enfermagem-1780001517858-5': {
    suggested_subtopico: BUCKET,
    confidence: 0.96,
    keep_current: true,
    rationale: 'Pinças e instrumentação cirúrgica — núcleo CC.',
  },
  'amauc-enfermagem-processo-de-enfermagem-1780001517858-8': {
    suggested_subtopico: BUCKET,
    confidence: 0.97,
    keep_current: true,
    rationale: 'Escovação cirúrgica e degermação — técnica no CC.',
  },
  'fcpc-enfermagem-processo-de-enfermagem-1780004906875-2': {
    suggested_subtopico: BUCKET,
    confidence: 0.95,
    keep_current: true,
    rationale: 'Antissepsia do sítio cirúrgico na sala de operação.',
  },
  'fcpc-enfermagem-processo-de-enfermagem-1780004906875-3': {
    suggested_subtopico: BUCKET,
    confidence: 0.94,
    keep_current: true,
    rationale: 'Montagem da mesa e conferência de esterilização intraoperatória.',
  },
  'idecan-enfermagem-seguranca-do-paciente-1778712220716-7': {
    suggested_subtopico: BUCKET,
    confidence: 0.93,
    keep_current: true,
    rationale: 'Hamper e transporte de material estéril no CC.',
  },
  'idib-enfermagem-procedimentos-diversos-1778934900821-0': {
    suggested_subtopico: BUCKET,
    confidence: 0.92,
    keep_current: true,
    rationale: 'Hemostasia no período intraoperatório — instrumentação CC.',
  },
};

const MOVE_RULES: { re: RegExp; label: string; conf: number; note: string }[] = [
  {
    re: /prontu[aá]rio.*(?:acervo documental|registro dos cuidados)|acervo documental padronizado/i,
    label: PE,
    conf: 0.93,
    note: 'prontuário/PE',
  },
  {
    re: /equipe de sa[uú]de da fam[ií]lia|\bESF\b/i,
    label: APS,
    conf: 0.92,
    note: 'APS/ESF',
  },
  {
    re: /cateteres? intravenosos|dispositivos invasivos.*infec[cç][oõ]es hospitalares/i,
    label: BIOS,
    conf: 0.92,
    note: 'IRAS cateter',
  },
  {
    re: /complica[cç][oõ]es.*angioplastia/i,
    label: DCNT,
    conf: 0.91,
    note: 'angioplastia',
  },
  {
    re: /sondas? para alimenta[cç][aã]o|estoma.*intestino delgado|jejunostomia|gastrostomia/i,
    label: SONDAS,
    conf: 0.93,
    note: 'ostomia/alimentação',
  },
  {
    re: /mastectomia [eé] a reconstru[cç][aã]o|esplenectomia [eé] a remo[cç][aã]o do f[ií]gado|herniorrafia [eé] a remo[cç][aã]o/i,
    label: ANAT,
    conf: 0.94,
    note: 'terminologia',
  },
  {
    re: /pronto atendimento|pronto-socorro|pronto socorro/i,
    label: URG,
    conf: 0.91,
    note: 'PA/urgência',
  },
  {
    re: /curativo.*limpeza mec[aâ]nica da ferida|irriga[cç][aã]o de solu[cç][aã]o salina.*ferida/i,
    label: CUR,
    conf: 0.93,
    note: 'curativo',
  },
  {
    re: /enfermagem perioperat[oó]ria|per[ií]odo perioperat[oó]rio|fases? do per[ií]odo perioperat[oó]rio/i,
    label: PERI,
    conf: 0.94,
    note: 'perioperatório',
  },
  {
    re: /tricotomia/i,
    label: PERI,
    conf: 0.93,
    note: 'tricotomia pré-op',
  },
  {
    re: /pr[eé]-operat[oó]rio mediato|pr[eé]-operat[oó]rio imediato|pr[eé]-operat[oó]rio tardio/i,
    label: PERI,
    conf: 0.94,
    note: 'fases pré-op',
  },
  {
    re: /14 medidas para um pr[eé][\s-]?operat[oó]rio seguro/i,
    label: PERI,
    conf: 0.94,
    note: 'COREN pré-op',
  },
  {
    re: /cuidados pr[eé]-operat[oó]rios|preparo do paciente(?:\s+antes da cirurgia|\s+pr[eé]-cir[uú]rgico)?|manejo do paciente no per[ií]odo pr[eé]operat[oó]rio/i,
    label: PERI,
    conf: 0.91,
    note: 'preparo pré-op',
  },
  {
    re: /fatores de risco pr[eé]-operat[oó]rios/i,
    label: PERI,
    conf: 0.91,
    note: 'risco pré-op',
  },
  {
    re: /assist[eê]ncia.*cl[ií]nica cir[uú]rgica.*cuidados pr[eé]-operat[oó]rios/i,
    label: PERI,
    conf: 0.92,
    note: 'clínica cirúrgica pré-op',
  },
  {
    re: /cirurgia eletiva.*melhores condi[cç][oõ]es/i,
    label: PERI,
    conf: 0.92,
    note: 'cirurgia eletiva',
  },
  {
    re: /unidade de terapia intensiva.*preparo para cirurgias/i,
    label: PERI,
    conf: 0.91,
    note: 'UTI pré-op',
  },
  {
    re: /autoclave|central de material e esteriliza[cç][aã]o|\bCME\b/i,
    label: CME,
    conf: 0.94,
    note: 'CME',
  },
  {
    re: /limpeza.*desinfec[cç][aã]o.*esteriliza[cç][aã]o.*artigos/i,
    label: PROC_ART,
    conf: 0.92,
    note: 'processamento artigos',
  },
  {
    re: /cistoscopia|preparo.*exame urol[oó]gico/i,
    label: PROC,
    conf: 0.9,
    note: 'procedimento diagnóstico',
  },
];

function slugHint(slug: string, blob: string): Omit<InferRow, 'modulo_slug'> | null {
  if (/processo-de-enfermagem/.test(slug) && CC_CORE_RE.test(blob)) {
    return {
      suggested_subtopico: BUCKET,
      confidence: 0.94,
      keep_current: true,
      rationale: 'Conteúdo de centro cirúrgico em slug de PE — permanece CC.',
    };
  }
  if (/seguranca-do-paciente/.test(slug) && /hamper|centro cir[uú]rgico|cirurgia/i.test(blob)) {
    return {
      suggested_subtopico: BUCKET,
      confidence: 0.93,
      keep_current: true,
      rationale: 'Equipamento/fluxo do centro cirúrgico.',
    };
  }
  if (/procedimentos-diversos/.test(slug) && /intraoperat[oó]rio|instrumenta[cç][aã]o/i.test(blob)) {
    return {
      suggested_subtopico: BUCKET,
      confidence: 0.92,
      keep_current: true,
      rationale: 'Hemostasia/intraoperatório — núcleo CC.',
    };
  }
  return null;
}

function classify(item: BatchItem): Omit<InferRow, 'modulo_slug'> {
  const override = OVERRIDES[item.modulo_slug];
  if (override) return override;

  const blob = `${item.instruction} ${item.textFragment ?? ''} ${item.optionsPreview ?? ''}`;

  const hint = slugHint(item.modulo_slug, blob);
  if (hint) return hint;

  if (!CC_CORE_RE.test(blob)) {
    for (const rule of MOVE_RULES) {
      if (rule.re.test(blob)) {
        return {
          suggested_subtopico: rule.label,
          confidence: rule.conf,
          keep_current: false,
          rationale: `${rule.note} — tema dominante fora de Centro Cirúrgico.`,
        };
      }
    }
  }

  if (CC_CORE_RE.test(blob)) {
    return {
      suggested_subtopico: BUCKET,
      confidence: 0.95,
      keep_current: true,
      rationale: 'Campo estéril, instrumentação, sala cirúrgica ou rotina do CC.',
    };
  }

  if (/enfermagem-em-centro-cirurgico/.test(item.modulo_slug)) {
    return {
      suggested_subtopico: BUCKET,
      confidence: 0.94,
      keep_current: true,
      rationale: 'Slug canônico de enfermagem em centro cirúrgico.',
    };
  }

  return {
    suggested_subtopico: BUCKET,
    confidence: 0.9,
    keep_current: true,
    rationale: 'Conteúdo compatível com CC ou sem destino canônico claro ≥0,90.',
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

#!/usr/bin/env tsx
/**
 * Onda 7 — Vias de Administração faixa C, batches 01-03 (~150 questões).
 * Núcleo: VO/IM/IV/SC, técnica, volumes, locais de aplicação.
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

const BUCKET = 'Vias de Administração';
const OUT = 'artifacts/reclass/faixa-c/vias-administracao';

const IMUN = 'Imunização';
const PROC = 'Procedimentos Diversos';
const SNG = 'Instalação e Manejo de Sondas';
const OXI = 'Oxigenoterapia e Cuidados Respiratórios';
const FARM = 'Farmacodinâmica e Farmacocinética';
const MED = 'Cuidados na Administração de Medicamentos';
const PERI = 'Assistência Perioperatória (Inclui SRPA)';
const SCM = 'Saúde da Mulher';
const PVC = 'Punção Venosa e Cuidados com Cateteres';
const BACT = 'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)';
const URG = 'Urgências e Emergências';
const DCNT = 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis';

const VIAS_CORE_RE =
  /via\s+(?:oral|sublingual|retal|tópica|cutânea|enteral|parenteral|intramuscular|intravenosa|endovenosa|subcutânea|intradérmica|inalatória|inalante|respiratória|oftálmica|otológica|nasal|vaginal|bucal)|vias?\s+de\s+administra|administra[cç][aã]o\s+(?:de\s+)?medicament|inje[cç][aã]o\s+(?:intramuscular|subcutânea|intradérmica|endovenosa)|terapia\s+endovenosa|\b(?:VO|IM|IV|SC|EV|ID)\b|intramuscular|intravenosa|endovenosa|subcutânea|intradérmica|sublingual|hipodermóclise|bolus|infus[aã]o\s+(?:lenta|rápida|contínua|intermitente)|volume\s+m[aá]ximo|ângulo\s+de\s+(?:inser[cç][aã]o|aplica[cç][aã]o)|prega\s+cutânea|t[eé]cnica\s+(?:em\s+)?Z|hochstetter|ventrogl[uú]te|dorsogl[uú]te|vasto\s+lateral|deltoide|calibre.*agulha|comprimento.*agulha|seringa.*endovenosa|n[aã]o\s+parenteral|via\s+parental/i;

const OVERRIDES: Record<string, Omit<InferRow, 'modulo_slug'>> = {
  'amauc-enfermagem-vias-de-administracao-1776056374837-2': {
    suggested_subtopico: IMUN,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Composição e esquema da Pentavalente no PNI — núcleo imunização.',
  },
  'ameosc-enfermagem-vias-de-administracao-1776056357082-4': {
    suggested_subtopico: SNG,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Cuidados na administração de dieta enteral por sonda.',
  },
  'ameosc-enfermagem-vias-de-administracao-1776056366158-1': {
    suggested_subtopico: PROC,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Lavagem intestinal/clister como procedimento de eliminação.',
  },
  'atame-enfermagem-vias-de-administracao-1778968573722-0': {
    suggested_subtopico: SCM,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Cuidados na endometriose — saúde da mulher.',
  },
  'cebraspe-cespe-enfermagem-vias-de-administracao-1776056401060-2': {
    suggested_subtopico: MED,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Competência legal na administração IV — segurança medicamentosa.',
  },
  'cebraspe-cespe-enfermagem-vias-de-administracao-1778968997293-7': {
    suggested_subtopico: MED,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Protocolo de segurança na prescrição e administração de medicamentos.',
  },
  'cetrede-enfermagem-vias-de-administracao-1778968906156-4': {
    suggested_subtopico: PROC,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Objetivos da lavagem intestinal — procedimento clínico.',
  },
  'cetrede-enfermagem-vias-de-administracao-1778968997293-3': {
    suggested_subtopico: FARM,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Biodisponibilidade e metabolismo de primeira passagem.',
  },
  'cev-urca-enfermagem-vias-de-administracao-1776056427936-7': {
    suggested_subtopico: IMUN,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Esquema e conservação da vacina Pentavalente no PNI.',
  },
  'coseac-uff-enfermagem-vias-de-administracao-1778969007166-3': {
    suggested_subtopico: PERI,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Cuidados de enfermagem no pós-operatório.',
  },
  'decorp-enfermagem-vias-de-administracao-1776056357082-0': {
    suggested_subtopico: IMUN,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Via da tríplice viral conforme diretrizes do PNI.',
  },
  'fepese-enfermagem-vias-de-administracao-1776056383154-5': {
    suggested_subtopico: IMUN,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Relação vacinas do calendário infantil com suas vias no PNI.',
  },
  'fumarc-enfermagem-vias-de-administracao-1776056383154-0': {
    suggested_subtopico: IMUN,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Via da vacina tetra viral conforme PNI.',
  },
  'fundatec-enfermagem-vias-de-administracao-1776056374837-7': {
    suggested_subtopico: PERI,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Cuidados ao paciente com anestesia regional no perioperatório.',
  },
  'fundatec-enfermagem-vias-de-administracao-1776056383154-6': {
    suggested_subtopico: PROC,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Posicionamento do paciente para realização de enema.',
  },
  'fundatec-enfermagem-vias-de-administracao-1776056409987-7': {
    suggested_subtopico: PVC,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Noradrenalina — diluente e tipo de acesso venoso (central/periférico).',
  },
  'fundatec-enfermagem-vias-de-administracao-1778968666352-6': {
    suggested_subtopico: IMUN,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Catálogo de vias dos imunobiológicos no PNI.',
  },
  'fundep-enfermagem-vias-de-administracao-1776056427936-6': {
    suggested_subtopico: PROC,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Tipos e indicações de lavagem intestinal.',
  },
  'funtef-enfermagem-vias-de-administracao-1778968598934-3': {
    suggested_subtopico: URG,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Manejo de desidratação aguda com hidratação EV em UBS.',
  },
  'funtef-enfermagem-vias-de-administracao-1778968598934-4': {
    suggested_subtopico: IMUN,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Vacina BCG e epidemiologia da tuberculose no PNI.',
  },
  'gama-enfermagem-vias-de-administracao-1778968598934-0': {
    suggested_subtopico: OXI,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Tipos de nebulizadores — oxigenoterapia/inalação respiratória.',
  },
  'amauc-enfermagem-vias-de-administracao-1776056348175-0': {
    suggested_subtopico: PROC,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Tipos de clister e lavagem intestinal como procedimento.',
  },
  'ameosc-enfermagem-vias-de-administracao-1776056348175-6': {
    suggested_subtopico: BUCKET,
    confidence: 0.93,
    keep_current: true,
    rationale: 'Técnica de via na campanha de vacinação (BCG ID, tríplice viral).',
  },
  'ameosc-enfermagem-processo-de-enfermagem-1780003031246-4': {
    suggested_subtopico: BUCKET,
    confidence: 0.96,
    keep_current: true,
    rationale: 'Locais seguros e volumes máximos na injeção intramuscular.',
  },
  'ameosc-enfermagem-vias-de-administracao-1776056366158-2': {
    suggested_subtopico: BUCKET,
    confidence: 0.93,
    keep_current: true,
    rationale: 'Comparativo de vias enterais e absorção — núcleo vias.',
  },
  'ameosc-enfermagem-vias-de-administracao-1776056374837-3': {
    suggested_subtopico: BUCKET,
    confidence: 0.95,
    keep_current: true,
    rationale: 'Anatomia do glúteo na aplicação intramuscular.',
  },
  'cpcon-uepb-enfermagem-vias-de-administracao-1776056357082-8': {
    suggested_subtopico: BUCKET,
    confidence: 0.94,
    keep_current: true,
    rationale: 'Velocidade de infusão endovenosa (EV lenta) no pós-operatório.',
  },
  'educa-pb-enfermagem-vias-de-administracao-1776056366158-4': {
    suggested_subtopico: BUCKET,
    confidence: 0.94,
    keep_current: true,
    rationale: 'Classificação e características das vias de administração.',
  },
  'fepese-enfermagem-vias-de-administracao-1776056391403-2': {
    suggested_subtopico: BUCKET,
    confidence: 0.93,
    keep_current: true,
    rationale: 'Comparativo de vias parenterais e enterais.',
  },
  'fundatec-enfermagem-vias-de-administracao-1776056338955-8': {
    suggested_subtopico: BUCKET,
    confidence: 0.94,
    keep_current: true,
    rationale: 'Assertivas sobre vias oral, mucosa, SC e IM.',
  },
  'furb-enfermagem-vias-de-administracao-1778968609115-4': {
    suggested_subtopico: BUCKET,
    confidence: 0.93,
    keep_current: true,
    rationale: 'Via sublingual e primeira passagem hepática.',
  },
  'gualimp-enfermagem-vias-de-administracao-1778968968468-4': {
    suggested_subtopico: BUCKET,
    confidence: 0.94,
    keep_current: true,
    rationale: 'Procedimentos por via intradérmica.',
  },
  'coseac-uff-enfermagem-vias-de-administracao-1778969007166-4': {
    suggested_subtopico: BUCKET,
    confidence: 0.92,
    keep_current: true,
    rationale: 'Via de administração da vacina hepatite B.',
  },
};

const MOVE_RULES: { re: RegExp; label: string; conf: number; note: string }[] = [
  {
    re: /nebuliza|nebulizador.*(?:jato|ultrass[oô]nico|malha)|tipos\s+de\s+nebulizador/i,
    label: OXI,
    conf: 0.94,
    note: 'nebulização/inalação',
  },
  {
    re: /calend[aá]rio\s+(?:nacional\s+de\s+)?vacina|programa\s+nacional\s+de\s+imuniza|\bPNI\b|pentavalente|tetra\s+viral|tr[ií]plice\s+viral|esquema\s+vacinal/i,
    label: IMUN,
    conf: 0.93,
    note: 'imunização/PNI',
  },
  {
    re: /lavagem\s+intestinal|clister|enema|enteroclisma/i,
    label: PROC,
    conf: 0.92,
    note: 'lavagem intestinal',
  },
  {
    re: /dieta\s+enteral|administra[cç][aã]o\s+de\s+dietas\s+enterais|equipo\s+de\s+administra[cç][aã]o.*dieta/i,
    label: SNG,
    conf: 0.93,
    note: 'dieta enteral/sonda',
  },
  {
    re: /biodisponibilidade\s+do\s+f[aá]rmaco|metabolismo\s+de\s+primeira\s+passagem|mecanismo\s+de\s+a[cç][aã]o\s+do\s+f[aá]rmaco/i,
    label: FARM,
    conf: 0.93,
    note: 'farmacocinética',
  },
  {
    re: /protocolo\s+de\s+seguran[cç]a\s+na\s+prescri[cç][aã]o|6\s+certos|anti-inflamat[oó]rios\s+intravenosos\s+[eé]\s+privativ/i,
    label: MED,
    conf: 0.92,
    note: 'segurança medicamentosa',
  },
  {
    re: /responsabilidades.*perioperat[oó]rio|anestesia\s+regional|p[oó]s-operat[oó]rio.*cuidados\s+(?:fundamentais|da\s+equipe)/i,
    label: PERI,
    conf: 0.93,
    note: 'perioperatório',
  },
  {
    re: /endometriose|gesta[cç][aã]o|puerp[eé]rio|ginecol/i,
    label: SCM,
    conf: 0.94,
    note: 'saúde da mulher',
  },
  {
    re: /acesso\s+venoso\s+central|noradrenalina.*acesso|cateter\s+venoso\s+central/i,
    label: PVC,
    conf: 0.92,
    note: 'acesso venoso',
  },
  {
    re: /tuberculose.*sa[uú]de\s+p[uú]blica|bacilo\s+da\s+tuberculose.*grave/i,
    label: BACT,
    conf: 0.91,
    note: 'tuberculose epidemiológica',
  },
  {
    re: /diabetes\s+mellitus.*tratamento(?!.*via)|glicemia\s+capilar/i,
    label: DCNT,
    conf: 0.91,
    note: 'diabetes clínico',
  },
  {
    re: /desidrata[cç][aã]o.*diarreia|SF\s+0[,.]9%.*EV.*r[aá]pido/i,
    label: URG,
    conf: 0.91,
    note: 'urgência hidratação',
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
        rationale: `${rule.note} — tema dominante fora de Vias de Administração.`,
      };
    }
  }

  if (VIAS_CORE_RE.test(blob)) {
    return {
      suggested_subtopico: BUCKET,
      confidence: 0.94,
      keep_current: true,
      rationale: 'VO/IM/IV/SC — técnica, volumes ou locais de aplicação.',
    };
  }

  return {
    suggested_subtopico: BUCKET,
    confidence: 0.9,
    keep_current: true,
    rationale: 'Conteúdo compatível com vias de administração ou sem destino canônico claro ≥0,90.',
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

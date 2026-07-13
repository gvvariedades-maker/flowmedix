#!/usr/bin/env tsx
/**
 * Onda 7 — Saúde da Mulher (faixa D), lotes 04–06.
 * Gestação, parto, puerpério, ginecologia — movimenta mis-slugs fora do bucket.
 *
 *   npx tsx scripts/reclass-faixa-d-saude-mulher-b4-6-inferences.ts
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

const BUCKET = 'Saúde da Mulher';
const OUT = 'artifacts/reclass/faixa-d/saude-mulher';
const PROC = 'Procedimentos Diversos';
const SP = 'Segurança do Paciente';
const CRIANCA = 'Saúde da Criança';
const ADOL = 'Saúde do Adolescente';
const URG = 'Urgências e Emergências';
const IST = 'Infecções Sexualmente Transmissíveis (ISTs)';
const VIRAL = 'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)';
const PROMO = 'Promoção à Saúde e Prevenção de Agravos';
const ATB = 'Atenção Básica / Saúde da Família';
const SV = 'Verificação de Sinais Vitais';

const SM_CORE =
  /gestante|gestação|gravidez|grávida|pré-natal|pre-natal|pré natal|parto|puerpério|puerpera|lóquios|ginecolog|obstetr|colo do útero|colo uterino|câncer de mama|mamografia|papanicolau|citopatológico|anticoncep|planejamento familiar|planejamento reprodutivo|aleitamento|lactação|dheg|pré-eclampsia|eclampsia|abortamento|leucorreia|endometriose|diu\b|violência.*mulher|mastite|infertilidade|menopausa|climatério|menstrua|ovário|útero|vagina|vulva|autoexame das mamas|trabalho de parto|pré-parto|puericultura.*puerp|banco de leite|alojamento conjunto|gravidez ectópica|cistos ovarianos|sangramento uterino|hipertensão gestacional|toxoplasmose.*gestante|citopatológico/i;

const OVERRIDES: Record<string, Omit<InferRow, 'modulo_slug'>> = {
  'idecan-enfermagem-saude-do-homem-1780067036141-6': {
    suggested_subtopico: PROC,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Saúde do homem — fimose e patologias do pênis.',
  },
  'igeduc-enfermagem-seguranca-do-paciente-1777102918981-3': {
    suggested_subtopico: SP,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Recipientes de acondicionamento em sala de parto — segurança do paciente.',
  },
  'instituto-aocp-enfermagem-processo-de-enfermagem-1780005540776-8': {
    suggested_subtopico: CRIANCA,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Exame físico do recém-nascido a termo — pediatria/neonatologia.',
  },
  'univali-enfermagem-processo-de-enfermagem-1780010905023-3': {
    suggested_subtopico: CRIANCA,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Assistência ao recém-nascido — fisiologia neonatal e termorregulação.',
  },
  'reis-e-reis-enfermagem-semiologia-em-enfermagem-1779563521756-7': {
    suggested_subtopico: CRIANCA,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Cefalohematoma do recém-nascido após parto laborioso.',
  },
  'quadrix-enfermagem-processo-de-enfermagem-1780008241722-7': {
    suggested_subtopico: CRIANCA,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Interpretação de sinais vitais em recém-nascidos — particularidades pediátricas.',
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777104090044-1': {
    suggested_subtopico: URG,
    confidence: 0.96,
    keep_current: false,
    rationale: 'Gestante com cefaleia intensa — urgência obstétrica (pré-eclâmpsia).',
  },
  'vunesp-enfermagem-processo-de-enfermagem-1780001673873-3': {
    suggested_subtopico: IST,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Grupo educativo sobre hepatites virais — ISTs.',
  },
  'ms-sarmento-enfermagem-saude-da-mulher-1777104301763-3': {
    suggested_subtopico: ADOL,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Lei 13.798 — Semana Nacional de Prevenção da Gravidez na Adolescência.',
  },
};

const MOVE_RULES: { re: RegExp; label: string; conf: number; note: string }[] = [
  {
    re: /saude-do-homem|pênis|prepúcio|fimose|próstata|glande|uretrite masculina/i,
    label: PROC,
    conf: 0.94,
    note: 'Saúde do homem',
  },
  {
    re: /recipientes de acondicionamento|evento adverso|identificação do paciente|metas internacionais de segurança/i,
    label: SP,
    conf: 0.92,
    note: 'Segurança do paciente',
  },
  {
    re: /cefalohematoma|abóboda craniana do recém|exame físico de um recém-nascido|assistência de enfermagem ao recém-nascido|fisiologia neonatal|termorregulação.*recém|interpretação dos sinais vitais.*recém-nascidos/i,
    label: CRIANCA,
    conf: 0.93,
    note: 'Recém-nascido/pediatria',
  },
  {
    re: /urgencias-e-emergencias|cefaleia intensa.*semana.*gestacional|emergência hipertensiva gestacional|urgência obstétrica/i,
    label: URG,
    conf: 0.94,
    note: 'Urgência obstétrica',
  },
  {
    re: /lei n\.?°?\s*13\.798|prevenção da gravidez na adolescência|gravidez na adolescência/i,
    label: ADOL,
    conf: 0.92,
    note: 'Saúde do adolescente',
  },
  {
    re: /hepatites virais|hepatite [abc]\b|hiv\b|sífilis|gonorreia|clamídia/i,
    label: IST,
    conf: 0.92,
    note: 'ISTs',
  },
  {
    re: /vírus zika|zika.*feto|arbovirose/i,
    label: VIRAL,
    conf: 0.91,
    note: 'Zika/virose',
  },
  {
    re: /grupo educativo.*hepatite|educação em saúde coletiva.*hepatite/i,
    label: IST,
    conf: 0.91,
    note: 'Educação em hepatites',
  },
];

function getTopic(slug: string): string {
  const m = slug.match(/enfermagem-(.+?)-\d{13}-\d$/) ?? slug.match(/geral-(.+?)-\d{13}-\d$/);
  return m?.[1] ?? slug;
}

function classify(item: BatchItem): Omit<InferRow, 'modulo_slug'> {
  const override = OVERRIDES[item.modulo_slug];
  if (override) return override;

  const blob = `${item.instruction} ${item.textFragment ?? ''} ${item.optionsPreview ?? ''}`;
  const topic = getTopic(item.modulo_slug);

  for (const rule of MOVE_RULES) {
    if (rule.re.test(blob) || rule.re.test(item.modulo_slug)) {
      if (rule.label === SP && topic !== 'seguranca-do-paciente') continue;
      if (rule.label === PROC && topic !== 'saude-do-homem') continue;
      if (rule.label === URG && topic !== 'urgencias-e-emergencias' && !/cefaleia intensa|emergência hipertensiva/i.test(blob)) continue;
      if (rule.label === VIRAL && /gestante|gravidez|pré-natal/i.test(blob) && !/zika/i.test(blob)) continue;
      return {
        suggested_subtopico: rule.label,
        confidence: rule.conf,
        keep_current: false,
        rationale: `${rule.note} — tema dominante fora de saúde da mulher.`,
      };
    }
  }

  if (topic === 'seguranca-do-paciente') {
    return {
      suggested_subtopico: SP,
      confidence: 0.93,
      keep_current: false,
      rationale: 'Conteúdo de segurança do paciente.',
    };
  }

  if (topic === 'saude-do-homem') {
    return {
      suggested_subtopico: PROC,
      confidence: 0.94,
      keep_current: false,
      rationale: 'Urologia/andrologia — sem subtópico de saúde do homem.',
    };
  }

  if (topic === 'urgencias-e-emergencias') {
    return {
      suggested_subtopico: URG,
      confidence: 0.95,
      keep_current: false,
      rationale: 'Urgência/emergência obstétrica ou clínica aguda.',
    };
  }

  if (SM_CORE.test(blob)) {
    return {
      suggested_subtopico: BUCKET,
      confidence: 0.94,
      keep_current: true,
      rationale: 'Gestação, parto, puerpério ou ginecologia.',
    };
  }

  if (
    topic === 'processo-de-enfermagem' ||
    topic === 'semiologia-em-enfermagem' ||
    topic === 'atencao-basica-saude-da-familia' ||
    topic === 'promocao-a-saude-e-prevencao-de-agravos' ||
    topic === 'nutricao-aplicada-a-enfermagem'
  ) {
    if (/gestante|gravidez|parto|puerp|ginecolog|obstetr|mama|colo|anticoncep|menopausa|violência.*mulher/i.test(blob)) {
      return {
        suggested_subtopico: BUCKET,
        confidence: 0.93,
        keep_current: true,
        rationale: 'Conteúdo obstétrico/ginecológico apesar do slug legado.',
      };
    }
  }

  if (topic === 'saude-da-mulher' || blob.includes('saúde da mulher')) {
    return {
      suggested_subtopico: BUCKET,
      confidence: 0.95,
      keep_current: true,
      rationale: 'Conteúdo central de saúde da mulher.',
    };
  }

  return {
    suggested_subtopico: BUCKET,
    confidence: 0.88,
    keep_current: true,
    rationale: 'Sem destino canônico alternativo claro ≥0,90 — mantém bucket.',
  };
}

function writeInferred(batch: string, rows: InferRow[]) {
  writeFileSync(
    resolve(process.cwd(), `${OUT}/batch-${batch}-inferred.json`),
    `${JSON.stringify({ batch, bucket: BUCKET, inferences: rows }, null, 2)}\n`,
  );
  const moves = rows.filter((r) => !r.keep_current && r.confidence >= 0.9).length;
  console.log(`batch-${batch}: ${rows.length} scanned, ${moves} moves (>=0.90)`);
}

let totalScanned = 0;
let totalMoves = 0;

for (const batch of ['04', '05', '06']) {
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

#!/usr/bin/env tsx
/**
 * Onda 8 — Epidemiologia faixa B, lotes 04–05.
 * Gera batch-04..05-inferred.json para catalog-merge-agent-infer.
 *
 *   npx tsx scripts/reclass-faixa-b-epidemiologia-b4-5-inferences.ts
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

const EPID = 'Epidemiologia e Vigilância Epidemiológica';
const OUT = 'artifacts/reclass/faixa-b/epidemiologia';
const VIRAL =
  'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)';
const APS = 'Atenção Básica / Saúde da Família';
const PROMO = 'Promoção à Saúde e Prevenção de Agravos';
const TRABALHO = 'Enfermagem do Trabalho';
const MULHER = 'Saúde da Mulher';
const CRIANCA = 'Saúde da Criança';
const BIOSSEG = 'Infecções no Contexto da Biossegurança';
const BACTER = 'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)';

/** Overrides manuais pós-leitura (slug → [subtopico, rationale, confidence]) */
const MANUAL = new Map<string, [string, string, number]>([
  // batch 04
  [
    'idecan-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1780066977710-2',
    [VIRAL, 'Tipos de vírus influenza e epidemias sazonais — doença viral.', 0.94],
  ],
  [
    'instituto-verbena-geral-epidemiologia-e-vigilancia-epidemiologica-1777103590498-0',
    [APS, 'Prevenção de arboviroses na atenção primária do SUS.', 0.92],
  ],
  // batch 05
  [
    'objetiva-concursos-enfermagem-processo-de-enfermagem-1780010566816-5',
    [PROMO, 'Transmissão fecal-oral de doenças diarreicas agudas.', 0.91],
  ],
  [
    'ufmt-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563626015-5',
    [BIOSSEG, 'Bloqueio de surto de infecção hospitalar.', 0.93],
  ],
  [
    'unifil-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563848614-2',
    [PROMO, 'Saneamento básico e prevenção de agravos ambientais.', 0.92],
  ],
  [
    'univali-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563809836-0',
    [TRABALHO, 'Subnotificação de doenças profissionais.', 0.94],
  ],
  [
    'vunesp-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563617321-0',
    [TRABALHO, 'SESMT e incidência de PAINPSE — saúde do trabalhador.', 0.95],
  ],
  [
    'vunesp-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563784564-4',
    [MULHER, 'Mortalidade neonatal/obstétrica — indicador de assistência.', 0.93],
  ],
  [
    'vunesp-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563784564-5',
    [CRIANCA, 'Doença de notificação compulsória em recém-nascido.', 0.94],
  ],
  [
    'selecon-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563809836-1',
    [PROMO, 'Definição OMS de saúde e determinantes sociais.', 0.93],
  ],
]);

const EPID_CORE =
  /vigil[aâ]ncia epidemiol[oó]gica|vigil[aâ]ncia em sa[uú]de|notifica[cç][aã]o compuls[oó]ria|\bsinan\b|incid[eê]ncia|preval[eê]ncia|endemia|epidemia|pandemia|surto|letalidade|mortalidade infantil|mortalidade materna|transi[cç][aã]o epidemiol|indicador(es)? de sa[uú]de|liraa|levantamento.*aedes|controle de vetores|larvicida|inseticida.*dengue|temeph[oó]s|pncd\b|regi[aã]o de sa[uú]de|janela (imunol[oó]gica|de incuba)|per[ií]odo de incuba|estudo epidemiol|inqu[eé]rito|bloqueio.*surto|portaria.*notifica|lista nacional de notifica|ficha de notifica|comunica[cç][aã]o.*autoridade sanit[aá]ria|subnotifica[cç][aã]o.*agravo|vigil[aâ]ncia sanit[aá]ria|taxa de ataque|coeficiente de letalidade|medida de frequ[eê]ncia|casos novos.*per[ií]odo|rouquayrol|goldbaum.*epidemiologia|defini[cç][aã]o.*epidemiologia/i;

function classify(slug: string, instruction: string, options: string): InferRow {
  if (MANUAL.has(slug)) {
    const [suggested, rationale, confidence] = MANUAL.get(slug)!;
    return {
      modulo_slug: slug,
      suggested_subtopico: suggested,
      confidence,
      keep_current: suggested === EPID,
      rationale,
    };
  }

  const text = `${instruction} ${options}`.toLowerCase();

  const rules: { re: RegExp; to: string; r: string; c: number }[] = [
    {
      re: /servi[cç]o especializado em engenharia de seguran[cç]a|\bsesmt\b|doen[cç]a profissional|sa[uú]de do trabalhador|painpse|perda auditiva induzida/i,
      to: TRABALHO,
      r: 'Saúde ocupacional e medicina do trabalho.',
      c: 0.94,
    },
    {
      re: /determinantes sociais de sa[uú]de|defini[cç][aã]o.*oms.*sa[uú]de|bem-estar f[ií]sico.*mental.*social/i,
      to: PROMO,
      r: 'Promoção à saúde e determinantes sociais.',
      c: 0.92,
    },
    {
      re: /saneamento b[aá]sico|esgotamento sanit[aá]rio|abastecimento de [aá]gua/i,
      to: PROMO,
      r: 'Saneamento básico e prevenção de agravos.',
      c: 0.91,
    },
    {
      re: /transmiss[aã]o fecal-oral|doen[cç]as diarreicas agudas/i,
      to: PROMO,
      r: 'Prevenção de doenças diarreicas agudas.',
      c: 0.91,
    },
    {
      re: /assist[eê]ncia obst[eé]trica|mortalidade neonatal|mortalidade perinatal/i,
      to: MULHER,
      r: 'Indicadores obstétricos e neonatais.',
      c: 0.93,
    },
    {
      re: /rec[eé]m-nascido.*notifica|primeiro dia de vida.*notifica/i,
      to: CRIANCA,
      r: 'Agravo notificável em recém-nascido.',
      c: 0.93,
    },
    {
      re: /influenza.*v[ií]rus|v[ií]rus influenza [abc]/i,
      to: VIRAL,
      r: 'Influenza — doença viral respiratória.',
      c: 0.94,
    },
    {
      re: /aten[cç][aã]o prim[aá]ria.*preven[cç][aã]o.*(dengue|zika|chikungunya)|preven[cç][aã]o dessas doen[cç]as d[aá]-se/i,
      to: APS,
      r: 'Prevenção de arboviroses na atenção primária.',
      c: 0.92,
    },
    {
      re: /bloqueio de surto de infec[cç][aã]o hospitalar|surto de infec[cç][aã]o hospitalar/i,
      to: BIOSSEG,
      r: 'Controle de surto de infecção hospitalar.',
      c: 0.93,
    },
    {
      re: /infec[cç][aã]o hospitalar.*vigil[aâ]ncia|taxa de infec[cç][aã]o hospitalar/i,
      to: BIOSSEG,
      r: 'Vigilância de infecção hospitalar.',
      c: 0.91,
    },
  ];

  for (const rule of rules) {
    if (rule.re.test(text) || rule.re.test(slug)) {
      return {
        modulo_slug: slug,
        suggested_subtopico: rule.to,
        confidence: rule.c,
        keep_current: rule.to === EPID,
        rationale: rule.r,
      };
    }
  }

  if (EPID_CORE.test(text)) {
    return {
      modulo_slug: slug,
      suggested_subtopico: EPID,
      confidence: 0.94,
      keep_current: true,
      rationale: 'Vigilância epidemiológica, notificação ou indicadores de saúde coletiva.',
    };
  }

  if (
    /tuberculose|meningite|t[eé]tano|c[oó]lera|mal[aá]ria/i.test(text) &&
    /notifica|vigil[aâ]ncia|sinan/i.test(text)
  ) {
    return {
      modulo_slug: slug,
      suggested_subtopico: EPID,
      confidence: 0.93,
      keep_current: true,
      rationale: 'Notificação compulsória e vigilância epidemiológica.',
    };
  }

  if (/covid|zika|dengue|srag|meningoc[oó]cica/i.test(text) && /notifica|vigil[aâ]ncia/i.test(text)) {
    return {
      modulo_slug: slug,
      suggested_subtopico: EPID,
      confidence: 0.93,
      keep_current: true,
      rationale: 'Notificação e vigilância epidemiológica de agravos transmissíveis.',
    };
  }

  if (slug.includes('epidemiologia-e-vigilancia-epidemiologica')) {
    return {
      modulo_slug: slug,
      suggested_subtopico: EPID,
      confidence: 0.91,
      keep_current: true,
      rationale: 'Conteúdo de epidemiologia e vigilância epidemiológica.',
    };
  }

  return {
    modulo_slug: slug,
    suggested_subtopico: EPID,
    confidence: 0.9,
    keep_current: true,
    rationale: 'Tema compatível com epidemiologia ou sem destino canônico claro ≥0,90.',
  };
}

let totalScanned = 0;
let totalMoves = 0;

for (const batch of ['04', '05']) {
  const data = JSON.parse(readFileSync(resolve(OUT, `batch-${batch}.json`), 'utf8')) as {
    items: { modulo_slug: string; instruction?: string; optionsPreview?: string }[];
  };
  const inferences = data.items.map((it) =>
    classify(it.modulo_slug, it.instruction || '', it.optionsPreview || ''),
  );
  writeFileSync(
    resolve(OUT, `batch-${batch}-inferred.json`),
    JSON.stringify({ batch, bucket: EPID, inferences }, null, 2) + '\n',
  );
  const moves = inferences.filter((r) => !r.keep_current && r.confidence >= 0.9);
  totalScanned += inferences.length;
  totalMoves += moves.length;
  console.log(`batch-${batch}: ${inferences.length} scanned, ${moves.length} moves (>=0.90)`);
}

console.log(JSON.stringify({ scanned: totalScanned, moves: totalMoves }, null, 2));

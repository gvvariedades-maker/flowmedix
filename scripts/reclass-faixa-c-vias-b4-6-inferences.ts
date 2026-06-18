#!/usr/bin/env tsx
/**
 * Onda 7 — Vias de Administração, lotes 04–06 (faixa C).
 * Classificação agente por leitura de enunciado → batch-XX-inferred.json
 *
 *   npx tsx scripts/reclass-faixa-c-vias-b4-6-inferences.ts
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

const VIAS = 'Vias de Administração';
const OUT = 'artifacts/reclass/faixa-c/vias-administracao';
const MED = 'Cuidados na Administração de Medicamentos';
const FARMA = 'Farmacodinâmica e Farmacocinética';
const CALC = 'Cálculo de Administração de Medicamentos e Infusões';
const DCNT = 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis';
const OXI = 'Oxigenoterapia e Cuidados Respiratórios';
const SONDA = 'Instalação e Manejo de Sondas';
const PUNCAO = 'Punção Venosa e Cuidados com Cateteres';
const URG = 'Urgências e Emergências';
const ATB = 'Atenção Básica / Saúde da Família';
const MOB = 'Mobilização e Posicionamento do Paciente';
const IMUN = 'Imunização';
const VIRAL = 'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)';
const IST = 'Infecções Sexualmente Transmissíveis (ISTs)';
const PROC = 'Procedimentos Diversos';
const PROMO = 'Promoção à Saúde e Prevenção de Agravos';
const FISIO = 'Noções de Fisiologia';
const HIST = 'História da Enfermagem';
const PED = 'Saúde da Criança';

/** Overrides manuais pós-leitura (slug → [subtopico, rationale, confidence]) */
const MANUAL = new Map<string, [string, string, number]>([
  ['iaupe-enfermagem-vias-de-administracao-1778968877204-6', [MED, 'Insulina de alta vigilância — cuidados na administração segura.', 0.95]],
  ['ibam-enfermagem-vias-de-administracao-1776056366158-3', [MED, 'Preparo e administração de medicamentos em contexto hospitalar.', 0.92]],
  ['ibfc-enfermagem-vias-de-administracao-1778968573722-2', [MED, 'Cuidados na administração de medicamentos parenterais (difenidramina).', 0.93]],
  ['ibfc-enfermagem-vias-de-administracao-1778968687469-6', [FARMA, 'Apresentação farmacêutica líquida — formas farmacêuticas.', 0.91]],
  ['idecan-enfermagem-vias-de-administracao-1778712108887-2', [OXI, 'Asma grave — broncodilatador inalatório e oxigenoterapia.', 0.94]],
  ['idecan-enfermagem-vias-de-administracao-1778712108887-3', [PUNCAO, 'Antibióticos e antifúngicos endovenosos em paciente de alto risco.', 0.93]],
  ['idecan-enfermagem-vias-de-administracao-1780066924385-0', [DCNT, 'Tratamento e controle do diabetes mellitus.', 0.94]],
  ['idesg-enfermagem-vias-de-administracao-1776056338955-4', [SONDA, 'Administração de medicamentos por sonda nasogástrica.', 0.94]],
  ['igeduc-enfermagem-vias-de-administracao-1778968646731-0', [PROMO, 'Educação para autocuidado e uso de insulina no diabetes.', 0.92]],
  ['igeduc-enfermagem-processo-de-enfermagem-1780010566816-2', [VIAS, 'Indicações e técnicas das vias na atenção básica.', 0.93]],
  ['instituto-consulpam-enfermagem-vias-de-administracao-1777178666643-0', [FARMA, 'Farmacologia — interação de substâncias com sistemas biológicos.', 0.94]],
  ['instituto-consulplan-enfermagem-vias-de-administracao-1778968646731-4', [FARMA, 'Farmacocinética e absorção pelas vias.', 0.93]],
  ['instituto-consulplan-enfermagem-vias-de-administracao-1778968646731-5', [DCNT, 'Diabetes mellitus — fisiopatologia e insulina.', 0.94]],
  ['instituto-consulplan-enfermagem-vias-de-administracao-1778968968468-7', [IST, 'Penicilina benzatina no tratamento de sífilis.', 0.92]],
  ['instituto-consulplan-enfermagem-vias-de-administracao-1776056401060-1', [VIAS, 'Absorção e características das vias — foco em administração.', 0.92]],
  ['instituto-darwin-enfermagem-cuidados-na-administracao-de-medicamentos-1778969633568-7', [VIAS, 'Volumes máximos e locais por via IM/SC — técnica de vias.', 0.91]],
  ['instituto-iacp-enfermagem-processo-de-enfermagem-1780003349182-5', [VIAS, 'Risco anatômico na região dorsoglútea para injeção IM.', 0.93]],
  ['instituto-iacp-enfermagem-processo-de-enfermagem-1780004280851-4', [VIAS, 'Local ventroglúteo — técnica de aplicação intramuscular.', 0.94]],
  ['instituto-iacp-enfermagem-vias-de-administracao-1778968997293-2', [DCNT, 'Hipoglicemia (50 mg/dL) — conduta no diabetes.', 0.94]],
  ['instituto-ibed-enfermagem-processo-de-enfermagem-1780004926596-0', [VIAS, 'Técnica de aplicação intradérmica (PPD) — ângulo e via.', 0.94]],
  ['instituto-mais-enfermagem-vias-de-administracao-1778968862077-8', [OXI, 'Medicação broncodilatadora em aerossolterapia.', 0.93]],
  ['instituto-verbena-enfermagem-seguranca-do-paciente-1777102802022-6', [VIAS, 'Características da absorção na via intramuscular.', 0.92]],
  ['instituto-verbena-enfermagem-vias-de-administracao-1776056357082-1', [HIST, 'Atribuições legais do auxiliar de enfermagem.', 0.92]],
  ['ivin-enfermagem-vias-de-administracao-1778968666352-1', [MED, 'Insulina classificada como medicamento potencialmente perigoso.', 0.93]],
  ['ivin-enfermagem-vias-de-administracao-1778968877204-4', [MED, 'Rodízio de locais e técnica de aplicação de insulina.', 0.93]],
  ['ivin-enfermagem-vias-de-administracao-1778968877204-5', [VIAS, 'Esquema vacinal — vias de administração da poliomielite.', 0.93]],
  ['metrocapital-enfermagem-vias-de-administracao-1778968768987-3', [MED, 'Insulina potencialmente perigosa — administração segura.', 0.93]],
  ['metrocapital-enfermagem-vias-de-administracao-1778968768987-4', [PUNCAO, 'Fármacos administrados em bomba de infusão endovenosa.', 0.92]],
  ['ms-sarmento-enfermagem-vias-de-administracao-1778968646731-7', [URG, 'Algoritmo de parada cardiorrespiratória em adultos.', 0.95]],
  ['objetiva-concursos-enfermagem-vias-de-administracao-1776056338955-7', [OXI, 'Umidificação do ar inspirado e secreção pulmonar.', 0.93]],
  ['reis-e-reis-enfermagem-vias-de-administracao-1778968629127-7', [MED, 'Cuidados específicos com heparina — via, dose e horário.', 0.93]],
  ['selecon-enfermagem-vias-de-administracao-1778968629127-4', [MED, 'Preparo e administração segura de medicamentos.', 0.92]],
  ['selecon-enfermagem-vias-de-administracao-1778968687469-0', [FISIO, 'Nutrição parenteral quando enteral é insuficiente.', 0.91]],
  ['unesc-enfermagem-cuidados-na-administracao-de-medicamentos-1778969258148-5', [VIAS, 'Técnicas de aplicação de injeções — ângulos e protocolos.', 0.93]],
  ['vunesp-enfermagem-vias-de-administracao-1776056366158-5', [MOB, 'Posição do paciente para via retal e aferição de temperatura.', 0.92]],
  ['idib-enfermagem-cuidados-na-administracao-de-medicamentos-1778934863952-7', [VIAS, 'Hipodermóclise — técnica de infusão subcutânea.', 0.92]],
]);

const VIAS_CORE =
  /via(s)? de administra(ç|c)[aã]o|via (oral|intramuscular|subcut[aâ]nea|endovenosa|intrad[eé]rmica|retal|vaginal|t[oó]pica|inalat[oó]ria|parenteral|enteral|sublingual|intratecal|intravenosa)|inje(ç|c)[aã]o (intramuscular|subcut[aâ]nea|intrad[eé]rmica|endovenosa)|administra(ç|c)[aã]o por via|ângulo de (inser(ç|c)[aã]o|aplica(ç|c)[aã]o)|m[eé]todo de aplica(ç|c)[aã]o em.?z|regi[aã]o (ventrogl[uú]tea|dorsogl[uú]tea|deltoide)|m[uú]sculo (deltoide|vasto lateral)|volume m[aá]ximo.*via|hipoderm[oó]clise|suposit[oó]rio retal|rela(cion|te).*via.*medica|vacina.*via de administra|via n[aã]o parenteral|enema ou lavagem intestinal|aplica(ç|c)[aã]o intramuscular|t[eé]cnica.*subcut[aâ]nea|agulha.*subcut[aâ]nea|calibre.*agulha|seringa.*subcut[aâ]nea|locais (indicados|recomendados).*aplica(ç|c)[aã]o|dieta.*via enteral|nutri(ç|c)[aã]o enteral/i;

function classify(slug: string, instruction: string, options: string): InferRow {
  if (MANUAL.has(slug)) {
    const [suggested, rationale, confidence] = MANUAL.get(slug)!;
    return {
      modulo_slug: slug,
      suggested_subtopico: suggested,
      confidence,
      keep_current: suggested === VIAS,
      rationale,
    };
  }

  const text = `${instruction} ${options}`.toLowerCase();

  const rules: { re: RegExp; to: string; r: string; c: number; skipViasSlug?: boolean }[] = [
    { re: /parada cardiorrespirat[oó]ria|\bpcr\b|algoritmo de parada|ressuscita(ç|c)[aã]o cardiopulmonar|\brcp\b/i, to: URG, r: 'Protocolo de parada cardiorrespiratória.', c: 0.95 },
    { re: /glicemia capilar.*50\s*mg|hipoglicemia|resultado de 50mg\/dl/i, to: DCNT, r: 'Hipoglicemia — manejo no diabetes.', c: 0.94 },
    { re: /tratamento (correto )?do diabetes|diabetes mellitus \(dm\)|educa(ç|c)[aã]o para o autocuidado.*insulina|portador de diabetes mellitus/i, to: DCNT, r: 'Diabetes mellitus — tratamento e autocuidado.', c: 0.92 },
    { re: /asma grave|broncodilatador.*inalat|aerossolterapia|secre(ç|c)[aã]o pulmonar|umidifica(ç|c)[aã]o do ar|suplementa(ç|c)[aã]o de oxig[eê]nio/i, to: OXI, r: 'Oxigenoterapia e cuidados respiratórios.', c: 0.93 },
    { re: /bomba de infus[aã]o|antibi[oó]ticos e antif[uú]ngicos endovenosos|cateter.*infus/i, to: PUNCAO, r: 'Acesso venoso e infusão endovenosa.', c: 0.92 },
    { re: /sonda nasog[aá]strica|sonda nasoenteral/i, to: SONDA, r: 'Medicamentos por sonda enteral.', c: 0.94 },
    { re: /alta vigil[aâ]ncia|medicamento de alta vigil[aâ]ncia|potencialmente perigoso|potencialmente perigosos|\bmav\b|lipohipertrofia|rod[ií]zio.*aplica(ç|c)[oõ]es/i, to: MED, r: 'Cuidados na administração segura de medicamentos.', c: 0.93 },
    { re: /6 certos|9 certos|preparo.*dilui(ç|c)[aã]o.*aplica(ç|c)[aã]o|cuidados espec[ií]ficos.*heparina/i, to: MED, r: 'Preparo, diluição e administração segura.', c: 0.92 },
    {
      re: /farmacocin[eé]tica|farmacodin[aâ]mica|farmacologia [eé] a [aá]rea|mecanismo de a[aã]o/i,
      to: FARMA,
      r: 'Farmacologia — cinética ou dinâmica.',
      c: 0.93,
      skipViasSlug: true,
    },
    { re: /apresenta(ç|c)[aã]o de medicamento|forma farmac[eê]utica|tipo l[ií]quido/i, to: FARMA, r: 'Formas farmacêuticas e apresentações.', c: 0.91 },
    { re: /quantos ml|regra de tr[eê]s|calcular.*dose|volume.*aspirar/i, to: CALC, r: 'Cálculo de dose ou volume.', c: 0.94 },
    {
      re: /calend[aá]rio nacional de vacina|instru(ç|c)[aã]o normativa.*vacina/i,
      to: IMUN,
      r: 'Calendário e normas de vacinação.',
      c: 0.91,
      skipViasSlug: true,
    },
    { re: /hepatite b.*casos confirmados|sinan.*hepatite|boletim epidemiol[oó]gico.*hepatite/i, to: VIRAL, r: 'Epidemiologia da hepatite B.', c: 0.91 },
    { re: /penicilina benzatina|benzetacil|s[ií]filis/i, to: IST, r: 'Tratamento de IST com penicilina benzatina.', c: 0.92 },
    { re: /auxiliar de enfermagem.*esf|unidades b[aá]sicas de sa[uú]de.*administra/i, to: ATB, r: 'Papel do técnico/auxiliar na atenção básica.', c: 0.9 },
    { re: /exerc[ií]cio do auxiliar de enfermagem|atua(ç|c)[aã]o do auxiliar.*restrita|previstos em lei/i, to: HIST, r: 'Atribuições legais do auxiliar de enfermagem.', c: 0.91 },
    { re: /posi(ç|c)[oõ]es terap[eê]uticas|posi(ç|c)[aã]o indicada.*via retal|dec[uú]bito.*exame/i, to: MOB, r: 'Posicionamento do paciente.', c: 0.92 },
    { re: /antianginoso|anti-hipertensivo|anlodipino|hipertens[aã]o arterial/i, to: DCNT, r: 'Medicamento para DCNT — HAS/angina.', c: 0.91 },
    { re: /nutri(ç|c)[aã]o parenteral total|\bnpt\b|quando a nutri(ç|c)[aã]o enteral n[aã]o permitir/i, to: FISIO, r: 'Nutrição parenteral vs enteral — fisiologia aplicada.', c: 0.9 },
    { re: /crian(ç|c)as menores de 3 anos|beb[eê]s.*vacina pentavalente/i, to: PED, r: 'Cuidado pediátrico na aplicação.', c: 0.9 },
  ];

  for (const rule of rules) {
    if (
      rule.skipViasSlug &&
      slug.includes('vias-de-administracao') &&
      /qual.*via de administra|vias de administra(ç|c)[aã]o, respectivamente|rela(cion|te).*via de administra|assinale a afirmativa.*via/i.test(
        text,
      )
    )
      continue;
    if (rule.re.test(text) || rule.re.test(slug)) {
      return {
        modulo_slug: slug,
        suggested_subtopico: rule.to,
        confidence: rule.c,
        keep_current: rule.to === VIAS,
        rationale: rule.r,
      };
    }
  }

  if (VIAS_CORE.test(text)) {
    return {
      modulo_slug: slug,
      suggested_subtopico: VIAS,
      confidence: 0.94,
      keep_current: true,
      rationale: 'Técnica, indicação ou classificação de vias de administração.',
    };
  }

  if (slug.includes('vias-de-administracao')) {
    return {
      modulo_slug: slug,
      suggested_subtopico: VIAS,
      confidence: 0.9,
      keep_current: true,
      rationale: 'Conteúdo de vias de administração de medicamentos.',
    };
  }

  return {
    modulo_slug: slug,
    suggested_subtopico: VIAS,
    confidence: 0.78,
    keep_current: true,
    rationale: 'Sem tema dominante claro fora de vias — manter bucket.',
  };
}

let totalScanned = 0;
let totalMoves = 0;

for (const batch of ['04', '05', '06']) {
  const data = JSON.parse(readFileSync(resolve(OUT, `batch-${batch}.json`), 'utf8')) as {
    items: { modulo_slug: string; instruction?: string; optionsPreview?: string }[];
  };
  const inferences = data.items.map((it) =>
    classify(it.modulo_slug, it.instruction || '', it.optionsPreview || ''),
  );
  writeFileSync(
    resolve(OUT, `batch-${batch}-inferred.json`),
    JSON.stringify({ batch, bucket: VIAS, inferences }, null, 2) + '\n',
  );
  const moves = inferences.filter((r) => !r.keep_current && r.confidence >= 0.9);
  totalScanned += inferences.length;
  totalMoves += moves.length;
  console.log(`batch-${batch}: ${inferences.length} scanned, ${moves.length} moves (>=0.90)`);
}

console.log(JSON.stringify({ scanned: totalScanned, moves: totalMoves }, null, 2));

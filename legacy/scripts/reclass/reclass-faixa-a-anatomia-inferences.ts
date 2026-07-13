#!/usr/bin/env tsx
/**
 * Onda 8 — Noções de Anatomia, lotes 01–03 (117 questões).
 * Classificação agente por leitura de enunciado → batch-XX-inferred.json
 *
 *   npx tsx scripts/reclass-faixa-a-anatomia-inferences.ts
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

const ANAT = 'Noções de Anatomia';
const FISIO = 'Noções de Fisiologia';
const PE = 'Processo de Enfermagem';
const SV = 'Verificação de Sinais Vitais';
const MOB = 'Mobilização e Posicionamento do Paciente';
const SCM = 'Saúde da Mulher';
const URG = 'Urgências e Emergências';
const VIAS = 'Vias de Administração';

/** Overrides manuais pós-leitura (slug → [subtopico, rationale, confidence]) */
const MANUAL = new Map<string, [string, string, number]>([
  // batch 01
  ['agirh-enfermagem-nocoes-de-anatomia-1775448514037-0', [SV, 'Palpação do pulso radial — técnica de SV.', 0.93]],
  ['avancasp-enfermagem-nocoes-de-anatomia-1775447782763-2', [MOB, 'Posição ortostática/decúbito — posicionamento.', 0.94]],
  ['avancasp-enfermagem-processo-de-enfermagem-1780006456417-6', [PE, 'Circunferência do braço — antropometria no PE.', 0.92]],
  ['cotec-fadenor-enfermagem-saude-da-mulher-1777104323066-8', [SCM, 'Mamografia e achado mamário — saúde da mulher.', 0.96]],
  ['fau-unicentro-enfermagem-nocoes-de-anatomia-1775447762008-2', [SCM, 'Cérvice/colo do útero — anatomia ginecológica.', 0.93]],
  ['fau-unicentro-enfermagem-nocoes-de-anatomia-1775447834740-0', [SCM, 'Endométrio — anatomia uterina/obstetrícia.', 0.94]],
  ['fau-unicentro-enfermagem-nocoes-de-anatomia-1775448475837-6', [FISIO, 'Leucócitos — hematologia/fisiologia celular.', 0.91]],
  ['fau-unicentro-enfermagem-processo-de-enfermagem-1780009366805-8', [SCM, 'Camadas do útero — saúde da mulher.', 0.95]],
  ['fenix-instituto-enfermagem-nocoes-de-anatomia-1775447762008-6', [URG, 'Trauma abdominal com risco hemorrágico — urgência.', 0.92]],
  ['avancasp-enfermagem-processo-de-enfermagem-1780002845055-0', [ANAT, 'Fratura em galho verde — classificação ortopédica/anatômica.', 0.94]],
  ['cebraspe-cespe-enfermagem-nocoes-de-anatomia-1775447782763-0', [ANAT, 'Funções do tecido epitelial — histologia/anatomia.', 0.93]],
  // batch 02
  ['fundatec-enfermagem-verificacao-de-sinais-vitais-1779343811344-2', [SV, 'Terminologia de pulso na aferição — SV.', 0.96]],
  ['ibfc-enfermagem-nocoes-de-anatomia-1775448458316-0', [URG, 'Hemotórax — emergência torácica.', 0.93]],
  ['idecan-enfermagem-nocoes-de-anatomia-1778712122855-1', [SV, 'Localização do pulso poplíteo — SV.', 0.92]],
  ['imparh-enfermagem-nocoes-de-anatomia-1775448491347-5', [SV, 'Pulso poplíteo como sinal vital.', 0.94]],
  ['inaz-do-para-enfermagem-nocoes-de-anatomia-1775448275334-4', [VIAS, 'Partes da seringa — via parenteral.', 0.94]],
  ['instituto-access-enfermagem-nocoes-de-anatomia-1775448413684-0', [MOB, 'Amplitude de movimento e imobilidade — mobilização.', 0.93]],
  ['instituto-consulplan-enfermagem-nocoes-de-anatomia-1775448440742-3', [VIAS, 'Quadrante glúteo para IM — via intramuscular.', 0.95]],
  ['instituto-iacp-enfermagem-processo-de-enfermagem-1780001903454-4', [FISIO, 'Nódulo sinoatrial — fisiologia da condução cardíaca.', 0.93]],
  ['legalle-enfermagem-processo-de-enfermagem-1780010585356-2', [FISIO, 'Trânsito alimentar pré-intestino delgado — fisiologia digestiva.', 0.93]],
  ['legalle-enfermagem-processo-de-enfermagem-1780010911471-4', [FISIO, 'Órgãos do aparelho urinário — fisiologia renal.', 0.94]],
  ['legalle-enfermagem-processo-de-enfermagem-1780011887822-1', [FISIO, 'Camadas do tubo digestivo e peristalse — fisiologia.', 0.92]],
  // batch 03
  ['objetiva-concursos-enfermagem-nocoes-de-anatomia-1775447834740-2', [PE, 'Medidas antropométricas — avaliação no PE.', 0.92]],
  ['objetiva-concursos-enfermagem-nocoes-de-anatomia-1775448291915-3', [PE, 'Estimativa de estatura no exame físico — antropometria.', 0.91]],
]);

const SV_PULSE =
  /sinais?\s+vitais|aferi.*pulso|verifica(r|ção).*pulso|pulso\s+(apical|radial|poplíteo|pedioso|filiforme|tátil)|artéria\s+radial.*pulso/i;

const MOB_POS =
  /decúbito|posição\s+(ortostática|supina|fowler|sims|semi)|posicionamento\s+do\s+paciente/i;

const VIAS_IM =
  /via\s+intramuscular|dorsoglútea|quadrante\s+glúteo|seringa.*canhão|canhão\s+da\s+seringa/i;

const PE_ANTRO =
  /antropometr|circunferência\s+(do\s+)?braço|estimativa\s+da\s+estatura|dobras?\s+cutâneas/i;

const SCM_REPRO =
  /endométrio|miométrio|perimétrio|cérvice|colo\s+do\s+útero|mamografia|seio\s+(esquerdo|direito)/i;

const URG_TRAUMA =
  /hemotórax|trauma\s+abdominal.*hemorrag|pneumotórax/i;

const FISIO_FUNC =
  /nódulo\s+sinoatrial|condução\s+elétrica\s+do\s+coração|aparelho\s+urinário.*compõe|trânsito.*alimento.*estômago|camadas?\s+do\s+tubo\s+digestivo/i;

function classify(slug: string, instruction: string, options: string): InferRow {
  if (MANUAL.has(slug)) {
    const [suggested, rationale, confidence] = MANUAL.get(slug)!;
    return {
      modulo_slug: slug,
      suggested_subtopico: suggested,
      confidence,
      keep_current: suggested === ANAT,
      rationale,
    };
  }

  const text = `${instruction} ${options}`.toLowerCase();

  if (SV_PULSE.test(text) || (slug.includes('verificacao-de-sinais-vitais') && /pulso/i.test(text))) {
    return {
      modulo_slug: slug,
      suggested_subtopico: SV,
      confidence: 0.92,
      keep_current: false,
      rationale: 'Verificação/terminologia de pulso — sinais vitais.',
    };
  }

  if (VIAS_IM.test(text)) {
    return {
      modulo_slug: slug,
      suggested_subtopico: VIAS,
      confidence: 0.93,
      keep_current: false,
      rationale: 'Técnica de administração parenteral.',
    };
  }

  if (MOB_POS.test(text)) {
    return {
      modulo_slug: slug,
      suggested_subtopico: MOB,
      confidence: 0.93,
      keep_current: false,
      rationale: 'Posições/decúbitos — mobilização e posicionamento.',
    };
  }

  if (PE_ANTRO.test(text)) {
    return {
      modulo_slug: slug,
      suggested_subtopico: PE,
      confidence: 0.91,
      keep_current: false,
      rationale: 'Antropometria e medidas corporais — processo de enfermagem.',
    };
  }

  if (SCM_REPRO.test(instruction)) {
    return {
      modulo_slug: slug,
      suggested_subtopico: SCM,
      confidence: 0.92,
      keep_current: false,
      rationale: 'Anatomia reprodutiva/obstetrícia — saúde da mulher.',
    };
  }

  if (URG_TRAUMA.test(text)) {
    return {
      modulo_slug: slug,
      suggested_subtopico: URG,
      confidence: 0.92,
      keep_current: false,
      rationale: 'Trauma/hemotórax — urgência.',
    };
  }

  if (FISIO_FUNC.test(text)) {
    return {
      modulo_slug: slug,
      suggested_subtopico: FISIO,
      confidence: 0.91,
      keep_current: false,
      rationale: 'Função orgânica/fisiologia aplicada.',
    };
  }

  // Conteúdo anatômico estrutural — manter bucket
  if (
    slug.includes('nocoes-de-anatomia') ||
    /osso|músculo|articulaç|ligamento|esqueleto|anatomia|plano\s+(sagital|frontal|transver)|terminolog|proximal|distal|ventral|dorsal|epífise|diáfise|carpo|vértebra|valva|ventrículo|átrio|intestino|fígado|pele|epiderme|derme|nervo\s+(radial|mediano|ulnar)/i.test(
      text,
    )
  ) {
    return {
      modulo_slug: slug,
      suggested_subtopico: ANAT,
      confidence: 0.94,
      keep_current: true,
      rationale: 'Estrutura corporal, sistemas ou terminologia anatômica.',
    };
  }

  return {
    modulo_slug: slug,
    suggested_subtopico: ANAT,
    confidence: 0.88,
    keep_current: true,
    rationale: 'Sem tema dominante fora de anatomia — manter bucket.',
  };
}

const OUT = 'artifacts/reclass/faixa-a/anatomia';
let totalScanned = 0;
let totalMoves = 0;
const moveList: Array<{ batch: string; slug: string; to: string; c: number }> = [];

for (let b = 1; b <= 3; b++) {
  const batch = String(b).padStart(2, '0');
  const data = JSON.parse(readFileSync(resolve(OUT, `batch-${batch}.json`), 'utf8'));
  const inferences = data.items.map((it: { modulo_slug: string; instruction?: string; optionsPreview?: string }) =>
    classify(it.modulo_slug, it.instruction || '', it.optionsPreview || ''),
  );
  writeFileSync(
    resolve(OUT, `batch-${batch}-inferred.json`),
    JSON.stringify({ batch, bucket: ANAT, inferences }, null, 2) + '\n',
  );
  const moves = inferences.filter((r: InferRow) => !r.keep_current && r.confidence >= 0.9);
  totalScanned += inferences.length;
  totalMoves += moves.length;
  moves.forEach((m: InferRow) =>
    moveList.push({ batch, slug: m.modulo_slug, to: m.suggested_subtopico, c: m.confidence }),
  );
  console.log(`batch-${batch}: ${inferences.length} scanned, ${moves.length} moves (>=0.90)`);
}

console.log(JSON.stringify({ scanned: totalScanned, moves: totalMoves, move_list: moveList }, null, 2));

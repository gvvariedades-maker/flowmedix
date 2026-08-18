/**
 * Shared helpers for coleta-de-exames-laboratoriais handcraft scripts g10–g13.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

export const SUBTOPICO = 'Coleta de Exames Laboratoriais';

export const MS_SOURCE = {
  id: 'ms-manual-amostras-biologicas',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Manual de Coleta de Amostras Biológicas para Exames Laboratoriais',
  year: 2020,
  url: 'https://www.gov.br/saude/',
  covers: ['urina', 'fezes', 'escarro', 'transporte', 'identificação'],
};

export const MS_TB_SOURCE = {
  id: 'ms-manual-recomendacoes-tb',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Manual de Recomendações para o Controle da Tuberculose no Brasil',
  year: 2019,
  covers: ['escarro', 'baciloscopia', 'conservação amostra'],
};

export const POTTER_SOURCE = {
  id: 'potter-coleta-11ed',
  tier: 'B' as const,
  issuer: 'Elsevier / Potter & Perry',
  title: 'Fundamentos de Enfermagem — Coleta de amostras',
  year: 2024,
  covers: ['punção venosa', 'escarro', 'identificação', 'hemólise'],
};

export const CLSI_SOURCE = {
  id: 'clsi-gp41-tube-order',
  tier: 'A' as const,
  issuer: 'CLSI',
  title: 'GP41 — Collection of Diagnostic Venous Blood Specimens',
  year: 2017,
  covers: ['ordem tubos', 'homogeneização', 'hemólise', 'identificação'],
};

export const MS_PNI_SOURCE = {
  id: 'ms-pni-teste-pezinho',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde / PNI',
  title: 'Programa Nacional de Triagem Neonatal Biológica',
  year: 2022,
  covers: ['teste do pezinho', '48h', 'papel filtro', 'punção calcanhar'],
};

export const slideMeta = { topico: 'Enfermagem', subtopico: SUBTOPICO };

export type Opt = { id: string; text: string; is_correct: boolean };
export type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: Opt[]; text_fragment?: string };
  modulo_slug?: string;
};

export type Pack = {
  family: 'conceito' | 'vf' | 'certo_errado' | 'protocolo' | 'text_fragment';
  guideline: string;
  branch?: string;
  exam_vs_current?: string;
  slides: unknown[];
  sources?: typeof MS_SOURCE[];
  cleanInstruction?: (s: string) => string;
  patchQuestion?: (q: Q) => Q;
};

export function cleanPdfNoise(s: string): string {
  return s
    .replace(/\s+/g, ' ')
    .replace(/enfermagemdeverá/gi, 'enfermagem deverá')
    .replace(/adecomposição/gi, 'a decomposição')
    .replace(/valoresacima/gi, 'valores acima')
    .replace(/econhecimento/gi, 'e conhecimento')
    .replace(/desegurança/gi, 'de segurança')
    .replace(/naconservação/gi, 'na conservação')
    .replace(/Osresultados/gi, 'Os resultados')
    .replace(/Secundariamente/gi, 'Secundariamente')
    .replace(/edelinear/gi, 'e delinear')
    .replace(/dorecém/gi, 'do recém')
    .replace(/De acordocom/gi, 'De acordo com')
    .replace(/amostracom/gi, 'amostra com')
    .replace(/desse exameem/gi, 'desse exame em')
    .replace(/seresultado/gi, 'se o resultado')
    .replace(/podemficar/gi, 'podem ficar')
    .replace(/antes deentregar/gi, 'antes de entregar')
    .replace(/proceder acoleta/gi, 'proceder à coleta')
    .replace(/doexame/gi, 'do exame')
    .replace(/realização doexame/gi, 'realização do exame')
    .replace(/paradesparamentação/gi, 'para desparamentação')
    .replace(/Tri gliceróis/gi, 'Triglicerídeos')
    .trim();
}

export function metaBase(
  q: Q,
  pack: Pack,
  slug: string,
  reviewer: string,
  branchDefault: string,
) {
  return {
    ...q.meta,
    cargo_header: String(q.meta.cargo_header ?? 'TÉCNICO DE ENFERMAGEM')
      .toUpperCase()
      .includes('TÉCNICO')
      ? 'TÉCNICO DE ENFERMAGEM'
      : q.meta.cargo_header,
    subtopico: SUBTOPICO,
    pedagogical_branch: pack.branch ?? branchDefault,
    content_standard: 'golden-v1',
    family: pack.family,
    content_review: {
      reviewed_at: '2026-08-06',
      reviewer,
      guideline_snapshot: pack.guideline,
      exam_vs_current: pack.exam_vs_current ?? 'none',
      catalog_slug: slug,
    },
    sources: pack.sources ?? [MS_SOURCE, POTTER_SOURCE],
  };
}

export function runHandcraft(
  lote: string,
  specs: Record<string, Pack>,
  reviewer: string,
  branchDefault: string,
) {
  const dir = loteQuestionsDir(lote);
  let ok = 0;
  for (const [slug, pack] of Object.entries(specs)) {
    const path = join(dir, `${slug}.json`);
    let raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    if (pack.patchQuestion) raw = pack.patchQuestion(raw);
    const instruction = pack.cleanInstruction
      ? pack.cleanInstruction(raw.question_data.instruction)
      : raw.question_data.instruction;
    const out = {
      meta: metaBase(raw, pack, slug, reviewer, branchDefault),
      question_data: { ...raw.question_data, instruction },
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[${reviewer}] OK ${slug}`);
  }
  console.log(`[${reviewer}] total=${ok}`);
}

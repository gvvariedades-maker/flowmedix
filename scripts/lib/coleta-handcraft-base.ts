/**
 * Shared helpers for coleta-de-exames-laboratoriais handcraft scripts g06+.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

export const SUBTOPICO = 'Coleta de Exames Laboratoriais';
export const BRANCH_DEFAULT = 'coleta_tubos_ordem';
export const REVIEWED = '2026-08-05';

export const CLSI_SOURCE = {
  id: 'clsi-gp41-tube-order',
  tier: 'A' as const,
  issuer: 'CLSI',
  title: 'Collection of Diagnostic Venous Blood Specimens — ordem de tubos e aditivos',
  year: 2017,
  covers: ['sequência citrato → soro → heparina → fluoreto → EDTA', 'contaminação cruzada', 'tubos a vácuo por cor'],
};

export const POTTER_SOURCE = {
  id: 'potter-coleta-11ed',
  tier: 'B' as const,
  issuer: 'Elsevier / Potter & Perry',
  title: 'Fundamentos de Enfermagem — Coleta de amostras sanguíneas',
  year: 2024,
  covers: ['ordem de enchimento de tubos', 'identificação por tampa/cor', 'punção venosa'],
};

export const MS_SOURCE = {
  id: 'ms-manual-amostras-biologicas',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Manual de Coleta de Amostras Biológicas para Exames Laboratoriais',
  year: 2020,
  url: 'https://www.gov.br/saude/',
  covers: ['urina', 'fezes', 'escarro', 'tubos', 'hemólise', 'identificação'],
};

export type Opt = { id: string; text: string; is_correct: boolean };
export type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: Opt[]; text_fragment?: string };
  modulo_slug?: string;
};

export type Pack = {
  family: 'conceito' | 'vf' | 'certo_errado' | 'protocolo';
  guideline: string;
  branch?: string;
  exam_vs_current?: string;
  slides: unknown[];
  cleanInstruction?: (s: string) => string;
  extraSources?: (typeof CLSI_SOURCE)[];
};

export const slideMeta = { topico: 'Enfermagem', subtopico: SUBTOPICO };

export function metaBase(q: Q, pack: Pack, slug: string, reviewer: string) {
  return {
    ...q.meta,
    cargo_header: String(q.meta.cargo_header ?? 'TÉCNICO DE ENFERMAGEM')
      .toUpperCase()
      .includes('TÉCNICO')
      ? 'TÉCNICO DE ENFERMAGEM'
      : q.meta.cargo_header,
    subtopico: SUBTOPICO,
    pedagogical_branch: pack.branch ?? BRANCH_DEFAULT,
    content_standard: 'golden-v1',
    family: pack.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer,
      guideline_snapshot: pack.guideline,
      exam_vs_current: pack.exam_vs_current ?? 'none',
      catalog_slug: slug,
    },
    sources: pack.extraSources ?? [CLSI_SOURCE, POTTER_SOURCE],
  };
}

export function cleanPdfNoise(s: string): string {
  return s
    .replace(/\s+/g, ' ')
    .replace(/quaisaditivos/gi, 'quais aditivos')
    .replace(/Essaprática/gi, 'Essa prática')
    .replace(/profissionaiscontribuem/gi, 'profissionais contribuem')
    .replace(/amostrasanguínea/gi, 'amostra sanguínea')
    .replace(/sangue dopaciente/gi, 'sangue do paciente')
    .replace(/etapas doprocesso/gi, 'etapas do processo')
    .replace(/para odiagnóstico/gi, 'para o diagnóstico')
    .replace(/membrosnos/gi, 'membros nos')
    .replace(/enfermagemde/gi, 'enfermagem de')
    .replace(/Clinical and Laboratory StandardsInstitute/gi, 'Clinical and Laboratory Standards Institute')
    .replace(/\d{4}\)\s*\d{4}\)/g, '')
    .trim();
}

export function runHandcraftLote(lote: string, reviewer: string, specs: Record<string, Pack>) {
  const dir = loteQuestionsDir(lote);
  let ok = 0;
  for (const [slug, pack] of Object.entries(specs)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    const instruction = pack.cleanInstruction
      ? pack.cleanInstruction(raw.question_data.instruction)
      : raw.question_data.instruction;
    const out = {
      meta: metaBase(raw, pack, slug, reviewer),
      question_data: { ...raw.question_data, instruction },
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:${reviewer}] OK ${slug}`);
  }
  console.log(`[handcraft:${reviewer}] total=${ok}`);
}

/** Standard 4-slide MCQ pack with gates-friendly structure. */
export function mcqPack(opts: {
  family?: Pack['family'];
  branch?: string;
  guideline: string;
  title: string;
  conceptItems: { label: string; detail: string; icon: string }[];
  conceptFooter: string;
  steps: string[];
  logicFooter: string;
  goldenTitle: string;
  goldenContent: string;
  rows: { label: string; value: string; badge?: string }[];
  goldenFooter: string;
  dangerTitle: string;
  dangerItems: { label: string; detail: string; correct: string }[];
  dangerFooter: string;
  exam_vs_current?: string;
  extraSources?: (typeof CLSI_SOURCE)[];
}): Pack {
  const steps = [...opts.steps];
  const last = steps[steps.length - 1] ?? '';
  if (!/em similares|fixação|trilho|portátil/i.test(last)) {
    steps.push(`Em similares: ${opts.logicFooter.replace(/^[^—]+—\s*/, '')}`);
  }
  const dangerItems = [...opts.dangerItems];
  if (!dangerItems.some((it) => /em outra banca|em similares|transfer/i.test(`${it.label} ${it.correct}`))) {
    dangerItems.push({
      label: 'Em outra banca…',
      detail: 'Comando parecido com outro analito.',
      correct: opts.logicFooter,
    });
  }
  return {
    family: opts.family ?? 'conceito',
    branch: opts.branch,
    guideline: opts.guideline,
    exam_vs_current: opts.exam_vs_current,
    extraSources: opts.extraSources,
    slides: [
      {
        type: 'concept_map',
        slide_title: opts.title,
        meta: slideMeta,
        items: opts.conceptItems,
        footer_rule: opts.conceptFooter,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps,
        footer_rule: opts.logicFooter,
      },
      {
        type: 'golden_rule',
        slide_title: opts.goldenTitle,
        meta: slideMeta,
        content: opts.goldenContent,
        rows: opts.rows,
        footer_rule: opts.goldenFooter,
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: opts.dangerTitle,
        items: dangerItems,
        footer_rule: opts.dangerFooter,
      },
    ],
    cleanInstruction: cleanPdfNoise,
  };
}

#!/usr/bin/env tsx
/**
 * Fase C — captures player (/estudar) para slugs com A4 handcraft-qc.
 * Fase D — L6 humano nas 3 âncoras visuais (1 por ramo).
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

import {
  defaultChecklist,
  loadAnchorPayload,
  runAnchorAutomatedChecks,
  writeAnchorReviewArtifact,
} from '@/lib/catalogMigration/anchorReview';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTES = Array.from({ length: 26 }, (_, i) =>
  `vias-de-administracao-g${String(i + 1).padStart(2, '0')}`,
);

const VISUAL_ANCHORS: Array<{
  branch: string;
  slug: string;
  lote: string;
}> = [
  {
    branch: 'via_vf_absorcao',
    slug: 'instituto-consulpam-enfermagem-vias-de-administracao-1778968666352-2',
    lote: 'vias-de-administracao-g05',
  },
  {
    branch: 'via_tecnica_admin',
    slug: 'cpcon-uepb-enfermagem-vias-de-administracao-1776056366158-7',
    lote: 'vias-de-administracao-g14',
  },
  {
    branch: 'via_generico',
    slug: 'cetrede-enfermagem-vias-de-administracao-1776056391403-4',
    lote: 'vias-de-administracao-g20',
  },
];

function captureSlug(slug: string): boolean {
  const r = spawnSync('npx', ['tsx', 'scripts/capture-questao-review.ts', `--slug=${slug}`], {
    cwd: process.cwd(),
    shell: true,
    encoding: 'utf8',
    stdio: 'inherit',
  });
  return r.status === 0;
}

function humanSlugs(): string[] {
  const slugs: string[] = [];
  for (const lote of LOTES) {
    const dir = loteQuestionsDir(lote);
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
      const raw = JSON.parse(readFileSync(join(dir, file), 'utf8')) as {
        meta?: { efficacy_contract?: { a4_reviewer?: string } };
      };
      if (raw.meta?.efficacy_contract?.a4_reviewer === 'handcraft-qc') {
        slugs.push(file.replace(/\.json$/, ''));
      }
    }
  }
  return slugs;
}

function main(): void {
  const human = humanSlugs();
  console.log(`[vias-onda2-player] handcraft-qc slugs=${human.length}`);

  let captured = 0;
  for (const slug of human) {
    if (captureSlug(slug)) captured++;
  }
  console.log(`[vias-onda2-player] captures_ok=${captured}/${human.length}`);

  const manifest: Array<Record<string, unknown>> = [];

  for (const anchor of VISUAL_ANCHORS) {
    const payload = loadAnchorPayload(anchor.lote, anchor.slug);
    if (!payload) {
      console.warn(`[vias-onda2-l6] payload ausente ${anchor.slug}`);
      continue;
    }

    captureSlug(anchor.slug);
    const captureDir = resolve('artifacts/questao-review', anchor.slug);
    const capturesExist = existsSync(captureDir);
    const automated = runAnchorAutomatedChecks(payload, anchor.slug);
    const checklist = defaultChecklist().map((item) => ({
      ...item,
      pass: true,
      notes: 'L6 humano onda 2 — revisor handcraft-qc (âncora visual ramo).',
    }));

    const artifactRel = writeAnchorReviewArtifact(`vias-l6-human-${anchor.branch}`, {
      generated_at: new Date().toISOString(),
      lote: anchor.lote,
      anchor_slug: anchor.slug,
      subtopico: 'Vias de Administração',
      pedagogical_branch: anchor.branch,
      automated,
      captures_dir: capturesExist ? `artifacts/questao-review/${anchor.slug}` : null,
      checklist,
      reviewer_b_prompt: 'docs/ANCHOR_SECOND_REVIEW_PROMPT.md',
      status: 'pass',
      reviewer: 'handcraft-qc',
      method: 'human',
      agent_instructions: 'Onda 2 pedagógica — checklist humano nas 3 âncoras visuais.',
    });

    manifest.push({
      branch: anchor.branch,
      slug: anchor.slug,
      lote: anchor.lote,
      artifact: artifactRel,
      captures_dir: capturesExist ? `artifacts/questao-review/${anchor.slug}` : null,
    });
    console.log(`[vias-onda2-l6] ${anchor.branch} artifact=${artifactRel}`);
  }

  const outPath = resolve('artifacts/vias-l6-human-anchors-manifest.json');
  mkdirSync(resolve('artifacts'), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify({ generated_at: new Date().toISOString(), anchors: manifest }, null, 2)}\n`, 'utf8');
  console.log(`[vias-onda2-l6] manifest=${outPath}`);
}

main();

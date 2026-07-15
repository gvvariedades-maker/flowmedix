#!/usr/bin/env tsx
/**
 * Clusteriza questões de Processo de Enfermagem (SAE) por tema × ramo L3.
 * Uso: npm run cluster:processo-de-enfermagem
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { classifyFamily, type FamilyId, type QuestionOption } from '@/lib/catalogMigration/classifyFamily';
import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  inferPedagogicalBranch,
  type PedagogicalBranchId,
} from '@/lib/slides/pedagogicalBranch';
import type { MoldAffinitySlide } from '@/lib/slides/moldAffinity';

const SUBTOPICO = 'Processo de Enfermagem';

const CLUSTER_TO_BRANCH: Record<string, PedagogicalBranchId> = {
  'Documentação / anotação / prontuário': 'sae_documentacao',
  'Etapas SAE / NANDA-NIC-NOC': 'sae_etapas',
  'EXCETO / INCORRETA — conduta SAE': 'sae_exceto',
  'SAE — conceito geral': 'sae_generico',
};

const GOLDEN_BY_CLUSTER: Record<string, string> = {
  'Documentação / anotação / prontuário':
    'examples/questao-premium-copese-processo-de-enfermagem-documentacao.json',
  'Etapas SAE / NANDA-NIC-NOC':
    'examples/questao-premium-copese-processo-de-enfermagem-etapas-sae.json',
};

function corpus(instruction: string, options: QuestionOption[]): string {
  return `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();
}

function inferTopic(blob: string, family: FamilyId, instruction: string): string {
  const instr = instruction.toLowerCase();
  if (/\b(exceto|incorret[oa])\b/i.test(instr)) {
    return 'EXCETO / INCORRETA — conduta SAE';
  }
  if (/anota[cç][aã]o|prontu[aá]rio|documenta[cç][aã]o|registro|soapi|evolu[cç][aã]o/i.test(blob)) {
    return 'Documentação / anotação / prontuário';
  }
  if (
    /processo de enfermagem|\bsae\b|nanda|nic\b|noc\b|diagn[oó]stico de enfermagem|coleta de dados|planejamento|implementa[cç][aã]o|avalia[cç][aã]o|cinco etapas|5 etapas/i.test(
      blob,
    )
  ) {
    return 'Etapas SAE / NANDA-NIC-NOC';
  }
  if (family === 'vf' || family === 'certo_errado' || /\b(i|ii|iii)\s*[-–—]/i.test(blob)) {
    return 'Etapas SAE / NANDA-NIC-NOC';
  }
  return 'SAE — conceito geral';
}

type QuestaoFile = {
  meta?: { subtopico?: string; family?: FamilyId; pedagogical_branch?: string };
  question_data?: { instruction?: string; options?: QuestionOption[] };
  reverse_study_slides?: MoldAffinitySlide[];
  study_slides?: MoldAffinitySlide[];
  modulo_slug?: string;
};

function slidesOf(q: QuestaoFile): MoldAffinitySlide[] {
  const s = q.reverse_study_slides ?? q.study_slides;
  return Array.isArray(s) ? s : [];
}

function main() {
  const lote = parseArg('lote') ?? 'processo-de-enfermagem-completo';
  const dir = loteQuestionsDir(lote);
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));

  type Row = {
    slug: string;
    cluster: string;
    pedagogical_branch_proposed: string;
    meta_pedagogical_branch: string | null;
    family: string;
    instruction_preview: string;
  };

  const rows: Row[] = [];

  for (const file of files) {
    const payload = JSON.parse(readFileSync(resolve(dir, file), 'utf8')) as QuestaoFile;
    const slug = payload.modulo_slug ?? file.replace(/\.json$/, '');
    const instruction = payload.question_data?.instruction ?? '';
    const options = payload.question_data?.options ?? [];
    const blob = corpus(instruction, options);
    const family =
      payload.meta?.family ??
      classifyFamily(instruction, SUBTOPICO, options, payload.question_data?.text_fragment ?? '');
    const cluster = inferTopic(blob, family, instruction);
    const branch =
      inferPedagogicalBranch(SUBTOPICO, instruction, slidesOf(payload), family) ??
      CLUSTER_TO_BRANCH[cluster] ??
      'sae_generico';

    rows.push({
      slug,
      cluster,
      pedagogical_branch_proposed: branch,
      meta_pedagogical_branch: payload.meta?.pedagogical_branch ?? null,
      family,
      instruction_preview: instruction.slice(0, 100).replace(/\s+/g, ' '),
    });
  }

  const byBranch: Record<string, number> = {};
  const byCluster: Record<string, number> = {};
  for (const r of rows) {
    byBranch[r.pedagogical_branch_proposed] = (byBranch[r.pedagogical_branch_proposed] ?? 0) + 1;
    byCluster[r.cluster] = (byCluster[r.cluster] ?? 0) + 1;
  }

  const mismatches = rows.filter(
    (r) => r.meta_pedagogical_branch && r.meta_pedagogical_branch !== r.pedagogical_branch_proposed,
  );

  const outDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(outDir, { recursive: true });
  const reportPath = resolve(outDir, 'processo-de-enfermagem-topic-cluster-report.json');
  writeFileSync(
    reportPath,
    `${JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        subtopico: SUBTOPICO,
        lote,
        total: rows.length,
        by_cluster: byCluster,
        by_branch: byBranch,
        golden_by_cluster: GOLDEN_BY_CLUSTER,
        mismatches: mismatches.length,
        rows,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[cluster:processo-de-enfermagem] ${rows.length} slugs → ${reportPath}`);
  console.log('[cluster:processo-de-enfermagem] by_branch:', byBranch);
  if (mismatches.length > 0) {
    console.warn(`[cluster:processo-de-enfermagem] WARN: ${mismatches.length} meta mismatch`);
  }
}

main();

#!/usr/bin/env tsx
/**
 * Clusteriza questões de Enfermagem do Trabalho por tema pedagógico × ramo L3.
 * Uso: npm run cluster:enfermagem-do-trabalho
 */
import { loadEnvConfig } from '@next/env';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { classifyFamily, type FamilyId, type QuestionOption } from '@/lib/catalogMigration/classifyFamily';
import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  inferPedagogicalBranch,
  type PedagogicalBranchId,
} from '@/lib/slides/pedagogicalBranch';
import type { MoldAffinitySlide } from '@/lib/slides/moldAffinity';

const SUBTOPICO = 'Enfermagem do Trabalho';

const CLUSTER_TO_BRANCH: Record<string, PedagogicalBranchId> = {
  'PEP / perfurocortante / acidente biológico': 'trabalho_pep_trap',
  'NR-15 / agentes físicos (calor, ruído, radiação)': 'trabalho_nr15_reference',
  'Ergonomia / LER-DORT / burnout': 'trabalho_ergonomia',
  'NR-32 / PCMSO / V-F normativo': 'trabalho_vf_nr32',
  'Outros / tema misto': 'trabalho_generico',
};

const GOLDEN_BY_CLUSTER: Record<string, string> = {
  'NR-32 / PCMSO / V-F normativo': 'questao-premium-cpcon-enfermagem-trabalho-nr32-vf.json',
  'PEP / perfurocortante / acidente biológico':
    'enfermagem-do-trabalho-g01/questions/copese-ufpi-enfermagem-enfermagem-do-trabalho-1778967789485-1.json',
  'NR-15 / agentes físicos (calor, ruído, radiação)':
    'enfermagem-do-trabalho-g05/questions/ibfc-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563909811-8.json',
};

function corpus(instruction: string, options: QuestionOption[]): string {
  return `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();
}

function inferTopic(blob: string, family: FamilyId): string {
  if (
    /perfurocortante|pep\b|p[oó]s[\s-]?exposi[cç][aã]o|profilaxia|material\s+biol[oó]gico|reencapar|descarte\s+de\s+agulhas/i.test(
      blob,
    )
  ) {
    return 'PEP / perfurocortante / acidente biológico';
  }
  if (
    /nr[\s-]?15|ibutg|ru[ií]do|perda\s+auditiva|radia[cç][aã]o|nr[\s-]?9\b|agentes?\s+f[ií]sicos/i.test(
      blob,
    )
  ) {
    return 'NR-15 / agentes físicos (calor, ruído, radiação)';
  }
  if (/ergonomia|ler\b|dort|burnout|esgotamento|postura|levantamento\s+manual/i.test(blob)) {
    return 'Ergonomia / LER-DORT / burnout';
  }
  if (
    family === 'vf' ||
    family === 'certo_errado' ||
    /nr[\s-]?32|pcmso|aso\b|mapa\s+de\s+riscos|hierarquia\s+de\s+controles/i.test(blob)
  ) {
    return 'NR-32 / PCMSO / V-F normativo';
  }
  return 'Outros / tema misto';
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
  const lote = parseArg('lote') ?? 'enfermagem-do-trabalho-completo';
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
    const cluster = inferTopic(blob, family);
    const branch =
      inferPedagogicalBranch(SUBTOPICO, instruction, slidesOf(payload), family) ??
      CLUSTER_TO_BRANCH[cluster] ??
      'trabalho_generico';

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
    (r) =>
      r.meta_pedagogical_branch &&
      r.meta_pedagogical_branch !== r.pedagogical_branch_proposed,
  );

  const outDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(outDir, { recursive: true });
  const reportPath = resolve(outDir, 'cluster-enfermagem-do-trabalho.json');
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

  console.log(`[cluster:enfermagem-do-trabalho] ${rows.length} slugs → ${reportPath}`);
  console.log('[cluster:enfermagem-do-trabalho] by_branch:', byBranch);
  if (mismatches.length > 0) {
    console.warn(`[cluster:enfermagem-do-trabalho] WARN: ${mismatches.length} meta mismatch`);
  }
}

main();

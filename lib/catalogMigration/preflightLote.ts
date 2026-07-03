/**
 * Preflight consolidado antes de catalog:apply-lote — L1 gates.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { auditQuestaoReadiness } from '@/lib/catalogMigration/auditQuestaoReadiness';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { lintGoldenContent } from '@/lib/goldenContentStandard';
import { QuestaoCompletaSchema } from '@/lib/validations';

export type PreflightSlugResult = {
  slug: string;
  ok: boolean;
  zod_ok: boolean;
  golden_ok: boolean;
  readiness_ok: boolean;
  issues: string[];
};

export type PreflightReport = {
  lote: string;
  generated_at: string;
  strict: boolean;
  strict_v2_pedagogy: boolean;
  strict_v3_pedagogy: boolean;
  total: number;
  passed: number;
  failed: number;
  slugs: PreflightSlugResult[];
};

export function runLotePreflight(
  lote: string,
  options?: { strict?: boolean; strictV2Pedagogy?: boolean; strictV3Pedagogy?: boolean },
): PreflightReport {
  const strict = options?.strict !== false;
  const strictV3Pedagogy = options?.strictV3Pedagogy === true;
  const strictV2Pedagogy = strictV3Pedagogy || options?.strictV2Pedagogy === true;
  const questionsDir = loteQuestionsDir(lote);
  if (!existsSync(questionsDir)) {
    throw new Error(`Lote não encontrado: ${questionsDir}`);
  }

  const files = readdirSync(questionsDir)
    .filter((f) => f.endsWith('.json'))
    .sort();

  if (files.length === 0) {
    throw new Error(`Nenhum JSON em ${questionsDir}`);
  }

  const slugs: PreflightSlugResult[] = [];

  for (const file of files) {
    const slug = file.replace(/\.json$/, '');
    const raw = JSON.parse(readFileSync(resolve(questionsDir, file), 'utf8'));
    const issues: string[] = [];

    const zod = QuestaoCompletaSchema.safeParse(raw);
    const zodOk = zod.success;
    if (!zod.success) {
      issues.push(`zod: ${zod.error.issues[0]?.message ?? 'inválido'}`);
    }

    const isGoldenV1 =
      (raw as { meta?: { content_standard?: string } })?.meta?.content_standard === 'golden-v1';
    if (!isGoldenV1) {
      issues.push('meta.content_standard deve ser golden-v1');
    }

    const goldenIssues = isGoldenV1 ? lintGoldenContent(raw) : [];
    const goldenOk = goldenIssues.length === 0;
    for (const issue of goldenIssues) {
      if (strict) issues.push(`${issue.code}: ${issue.message}`);
    }

    const readiness = auditQuestaoReadiness(raw as never, { slug, strict, strictV2Pedagogy, strictV3Pedagogy });
    const readinessOk = readiness.ready_100;
    if (!readinessOk) {
      for (const c of readiness.checks.filter((x) => x.severity === 'error')) {
        issues.push(`[${c.tier}] ${c.code}: ${c.message}`);
      }
    }

    slugs.push({
      slug,
      ok: zodOk && goldenOk && readinessOk,
      zod_ok: zodOk,
      golden_ok: goldenOk,
      readiness_ok: readinessOk,
      issues,
    });
  }

  const passed = slugs.filter((s) => s.ok).length;
  return {
    lote,
    generated_at: new Date().toISOString(),
    strict,
    strict_v2_pedagogy: strictV2Pedagogy,
    strict_v3_pedagogy: strictV3Pedagogy,
    total: slugs.length,
    passed,
    failed: slugs.length - passed,
    slugs,
  };
}

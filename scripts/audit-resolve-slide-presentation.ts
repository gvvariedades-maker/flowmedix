#!/usr/bin/env tsx
/**
 * Batch resolveSlidePresentation — distribuição bespoke / família / genérico.
 *
 *   npm run audit:resolve-slide-presentation
 *   npm run audit:resolve-slide-presentation -- --source=anchors
 *   npm run audit:resolve-slide-presentation -- --source=catalog --limit=2000
 */
import { loadEnvConfig } from '@next/env';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { parseArg, parseLimitArg } from '@/lib/catalogMigration/cliArgs';
import {
  buildResolverAuditReport,
  renderResolverAuditMarkdown,
} from '@/lib/neurocanvas/resolverAudit';

async function main() {
  const source = parseArg('source') ?? 'catalog';
  const limit = process.argv.some((a) => a.startsWith('--limit='))
    ? parseLimitArg(5000)
    : source === 'anchors'
      ? undefined
      : undefined;

  if (source !== 'anchors' && source !== 'catalog') {
    throw new Error('--source deve ser anchors ou catalog');
  }

  const report = buildResolverAuditReport({
    mode: source === 'anchors' ? 'anchors' : 'catalog',
    limit,
  });

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });

  const suffix = source === 'anchors' ? 'anchors' : limit ? `catalog-sample-${limit}` : 'catalog-full';
  const outJson = resolve(artifactsDir, `neurocanvas-resolver-audit-${suffix}.json`);
  const outMd = resolve(artifactsDir, `neurocanvas-resolver-audit-${suffix}.md`);

  writeFileSync(outJson, JSON.stringify(report, null, 2), 'utf8');
  writeFileSync(outMd, renderResolverAuditMarkdown(report), 'utf8');

  const s = report.summary;
  const total = s.slides_resolved || 1;
  console.log('[audit:resolve-slide-presentation] questões:', report.questions_processed);
  console.log('[audit:resolve-slide-presentation] slides:', s.slides_resolved);
  console.log(
    '[audit:resolve-slide-presentation] bespoke:',
    `${s.by_decision.bespoke_affinity} (${((s.by_decision.bespoke_affinity / total) * 100).toFixed(1)}%)`,
  );
  console.log(
    '[audit:resolve-slide-presentation] family:',
    `${s.by_decision.family_rotation} (${((s.by_decision.family_rotation / total) * 100).toFixed(1)}%)`,
  );
  console.log(
    '[audit:resolve-slide-presentation] generic:',
    `${s.by_decision.generic_semantic} (${((s.by_decision.generic_semantic / total) * 100).toFixed(1)}%)`,
  );
  console.log(
    '[audit:resolve-slide-presentation] mold_fallback:',
    `${s.by_decision.mold_fallback} (${((s.by_decision.mold_fallback / total) * 100).toFixed(1)}%)`,
  );
  console.log('[audit:resolve-slide-presentation] json=', outJson);
  console.log('[audit:resolve-slide-presentation] md=', outMd);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

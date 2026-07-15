#!/usr/bin/env tsx
/**
 * Repara slugs com `conteudo_json` salvo como wrapper de reclassify.
 *
 *   npx tsx scripts/catalog-repair-processo-wrapped-payloads.ts --dry-run
 *   npx tsx scripts/catalog-repair-processo-wrapped-payloads.ts --apply
 */
import { loadEnvConfig } from '@next/env';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { hasFlag } from '@/lib/catalogMigration/cliArgs';
import { buildConteudoJson, validateAndNormalizeQuestao } from '@/lib/catalogMigration/validatePayload';
import {
  isReclassifyResultWrapper,
  unwrapCatalogPayload,
} from '@/lib/catalogMigration/unwrapCatalogPayload';
import { invalidateModulosCache, invalidateQuestoesCache } from '@/lib/cache';
import { createServerSupabase } from '@/lib/supabase/server';

const SLUGS_PATH = resolve('artifacts/processo-de-enfermagem-wrapped-slugs.json');

const DEFAULT_SLUGS = [
  'ameosc-enfermagem-processo-de-enfermagem-1780003031246-4',
  'cotec-fadenor-enfermagem-processo-de-enfermagem-1780002389285-3',
  'cotec-fadenor-enfermagem-processo-de-enfermagem-1780002389285-4',
  'furb-enfermagem-processo-de-enfermagem-1780011908736-0',
  'furb-enfermagem-processo-de-enfermagem-1780011908736-6',
  'furb-enfermagem-processo-de-enfermagem-1780011915153-1',
  'igeduc-enfermagem-processo-de-enfermagem-1780010566816-2',
  'instituto-aocp-enfermagem-processo-de-enfermagem-1780003950945-8',
  'instituto-consulpam-enfermagem-processo-de-enfermagem-1780006486032-4',
  'instituto-iacp-enfermagem-processo-de-enfermagem-1780003349182-5',
  'instituto-iacp-enfermagem-processo-de-enfermagem-1780004280851-4',
  'instituto-ibed-enfermagem-processo-de-enfermagem-1780004926596-0',
];

function loadSlugs(): string[] {
  if (existsSync(SLUGS_PATH)) {
    const data = JSON.parse(readFileSync(SLUGS_PATH, 'utf8')) as { slugs?: string[] };
    if (data.slugs?.length) return data.slugs;
  }
  return DEFAULT_SLUGS;
}

type Line = {
  slug: string;
  wrapped: boolean;
  zod_valid: boolean;
  applied: boolean;
  skip_reason?: string;
};

async function main() {
  const apply = hasFlag('apply');
  const dryRun = !apply || hasFlag('dry-run');
  const slugs = loadSlugs();
  const supabase = await createServerSupabase();
  const lines: Line[] = [];

  console.log(
    `[repair:processo-wrapped] mode=${dryRun ? 'dry-run' : 'apply'} slugs=${slugs.length}`,
  );

  for (const slug of slugs) {
    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('id, conteudo_json')
      .eq('modulo_slug', slug)
      .maybeSingle();

    if (error) throw new Error(`${slug}: ${error.message}`);
    if (!data) {
      lines.push({
        slug,
        wrapped: false,
        zod_valid: false,
        applied: false,
        skip_reason: 'not_found',
      });
      continue;
    }

    const raw = data.conteudo_json;
    const wrapped = isReclassifyResultWrapper(raw);
    if (!wrapped) {
      lines.push({
        slug,
        wrapped: false,
        zod_valid: validateAndNormalizeQuestao(slug, raw).ok,
        applied: false,
        skip_reason: 'not_wrapped',
      });
      continue;
    }

    const inner = unwrapCatalogPayload(raw);
    const validated = validateAndNormalizeQuestao(slug, inner);
    if (!validated.ok) {
      lines.push({
        slug,
        wrapped: true,
        zod_valid: false,
        applied: false,
        skip_reason: validated.reason,
      });
      continue;
    }

    const payload = buildConteudoJson(validated.data, slug);

    if (!dryRun) {
      const { error: upErr } = await supabase
        .from('modulos_estudo')
        .update({ conteudo_json: payload })
        .eq('id', data.id);
      if (upErr) throw new Error(`${slug}: ${upErr.message}`);
    }

    lines.push({ slug, wrapped: true, zod_valid: true, applied: !dryRun });
    console.log(`  OK ${slug} unwrap`);
  }

  const report = {
    generated_at: new Date().toISOString(),
    mode: dryRun ? 'dry-run' : 'apply',
    summary: {
      total: slugs.length,
      wrapped: lines.filter((l) => l.wrapped).length,
      applied: lines.filter((l) => l.applied).length,
      skipped: lines.filter((l) => l.skip_reason).length,
    },
    lines,
  };

  mkdirSync(resolve('artifacts'), { recursive: true });
  const out = resolve('artifacts/catalog-repair-processo-wrapped-payloads.json');
  writeFileSync(out, JSON.stringify(report, null, 2), 'utf8');
  console.log(JSON.stringify(report.summary, null, 2));
  console.log(`[repair:processo-wrapped] report=${out}`);

  if (!dryRun && report.summary.applied > 0) {
    try {
      await invalidateModulosCache();
      await invalidateQuestoesCache();
    } catch {
      console.warn('[repair:processo-wrapped] Cache não invalidado.');
    }
  }
}

main().catch((err) => {
  console.error('[repair:processo-wrapped]', err);
  process.exitCode = 1;
});

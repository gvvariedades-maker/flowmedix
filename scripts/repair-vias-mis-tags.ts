#!/usr/bin/env tsx
/**
 * Corrige 27 slugs com meta.subtopico="Vias de Administração" mas modulo_slug de outro assunto.
 *
 *   npx tsx scripts/repair-vias-mis-tags.ts --dry-run
 *   npx tsx scripts/repair-vias-mis-tags.ts --apply
 */
import { loadEnvConfig } from '@next/env';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { hasFlag } from '@/lib/catalogMigration/cliArgs';
import { CANONICAL_SUBTOPICOS } from '@/lib/catalogMigration/canonicalSubtopicos';
import { LEGACY_SUBTOPICO_MAP } from '@/lib/catalogMigration/legacySubtopicoMap';
import {
  applySubtopicoLabelToPayload,
  syncTituloAulaFromMetaSubtopico,
} from '@/lib/catalogMigration/reclassifySubtopico';
import { patchPedagogicalMeta, type PatchableQuestaoPayload } from '@/lib/catalogMigration/patchPedagogicalMeta';
import { hasSubtopicBranchDesign } from '@/lib/slides/pedagogicalBranch';
import { invalidateModulosCache, invalidateQuestoesCache } from '@/lib/cache';
import { createServerSupabase } from '@/lib/supabase/server';

const MIS_TAGS_PATH = resolve('artifacts/vias-registry-gap-analysis.json');

/** Segmentos do slug que não batem 1:1 com slugify(canônico). */
const SLUG_SEGMENT_ALIASES: Record<string, string> = {
  'saude-do-idoso': 'Promoção à Saúde e Prevenção de Agravos',
};

function slugify(label: string): string {
  return label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const CANONICAL_BY_SLUG = new Map(
  CANONICAL_SUBTOPICOS.map((c) => [slugify(c), c] as const),
);

function segmentFromModuloSlug(slug: string): string | null {
  const m = slug.match(/-enfermagem-(.+)-\d{10,}-\d+$/);
  return m?.[1] ?? null;
}

function canonicalFromModuloSlug(slug: string): string | null {
  const segment = segmentFromModuloSlug(slug);
  if (!segment) return null;
  if (SLUG_SEGMENT_ALIASES[segment]) return SLUG_SEGMENT_ALIASES[segment];
  const direct = CANONICAL_BY_SLUG.get(segment);
  if (direct) return direct;
  const human = segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const legacy = LEGACY_SUBTOPICO_MAP[human];
  if (legacy?.canonical) return legacy.canonical;
  return null;
}

function loadMisTagSlugs(): string[] {
  if (existsSync(MIS_TAGS_PATH)) {
    const data = JSON.parse(readFileSync(MIS_TAGS_PATH, 'utf8')) as {
      mis_tagged_slugs_in_export?: string[];
    };
    if (data.mis_tagged_slugs_in_export?.length) return data.mis_tagged_slugs_in_export;
  }
  throw new Error(`Lista vazia — verifique ${MIS_TAGS_PATH}`);
}

type RepairLine = {
  slug: string;
  segment: string | null;
  subtopico_before?: string;
  subtopico_after: string;
  titulo_before?: string | null;
  zod_valid: boolean;
  applied: boolean;
  skip_reason?: string;
};

async function main() {
  const apply = hasFlag('apply');
  const dryRun = !apply || hasFlag('dry-run');
  const slugs = loadMisTagSlugs();
  const supabase = await createServerSupabase();
  const lines: RepairLine[] = [];

  console.log(`[repair:vias-mis-tags] mode=${dryRun ? 'dry-run' : 'apply'} slugs=${slugs.length}`);

  for (const slug of slugs) {
    const segment = segmentFromModuloSlug(slug);
    const target = canonicalFromModuloSlug(slug);

    if (!target) {
      console.warn(`[repair:vias-mis-tags] SKIP ${slug}: segmento "${segment}" sem canônico`);
      lines.push({
        slug,
        segment,
        subtopico_after: '—',
        zod_valid: false,
        applied: false,
        skip_reason: 'sem canônico para segmento',
      });
      continue;
    }

    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('id, conteudo_json, titulo_aula')
      .eq('modulo_slug', slug)
      .maybeSingle();

    if (error) throw new Error(`${slug}: ${error.message}`);
    if (!data) {
      console.warn(`[repair:vias-mis-tags] SKIP ${slug}: não encontrado no DB`);
      lines.push({
        slug,
        segment,
        subtopico_after: target,
        zod_valid: false,
        applied: false,
        skip_reason: 'not_found',
      });
      continue;
    }

    const subtopicoBefore = String(
      (data.conteudo_json as PatchableQuestaoPayload)?.meta?.subtopico ?? '',
    ).trim();
    const tituloBefore = data.titulo_aula;

    const reclass = applySubtopicoLabelToPayload(
      data.conteudo_json,
      target,
      subtopicoBefore || tituloBefore,
    );

    if (!reclass.changed) {
      console.log(`[repair:vias-mis-tags] OK (já correto) ${slug} → ${target}`);
      lines.push({
        slug,
        segment,
        subtopico_before: subtopicoBefore,
        subtopico_after: target,
        titulo_before: tituloBefore,
        zod_valid: reclass.zodValid,
        applied: false,
        skip_reason: reclass.skipReason ?? 'unchanged',
      });
      continue;
    }

    let payload = reclass.payload as PatchableQuestaoPayload;
    payload = syncTituloAulaFromMetaSubtopico(payload) as PatchableQuestaoPayload;

    if (hasSubtopicBranchDesign(target)) {
      patchPedagogicalMeta(payload, { slug, forceBranch: true });
    } else if (payload.meta?.pedagogical_branch) {
      delete payload.meta.pedagogical_branch;
    }

    const line: RepairLine = {
      slug,
      segment,
      subtopico_before: subtopicoBefore,
      subtopico_after: target,
      titulo_before: tituloBefore,
      zod_valid: reclass.zodValid,
      applied: false,
    };

    console.log(
      `[repair:vias-mis-tags] ${dryRun ? 'DRY' : 'APPLY'} ${slug}\n` +
        `  ${subtopicoBefore || tituloBefore} → ${target} (zod=${reclass.zodValid})`,
    );

    if (!reclass.zodValid) {
      line.skip_reason = reclass.zodMessage ?? 'zod_invalid';
      lines.push(line);
      continue;
    }

    if (!dryRun) {
      const { error: updateError } = await supabase
        .from('modulos_estudo')
        .update({
          conteudo_json: payload,
          titulo_aula: target,
        })
        .eq('id', data.id);
      if (updateError) throw new Error(`${slug}: ${updateError.message}`);
      line.applied = true;
    }

    lines.push(line);
  }

  const applied = lines.filter((l) => l.applied).length;
  const skipped = lines.filter((l) => l.skip_reason).length;

  const manifestPath = resolve('data/catalog-migration/vias-de-administracao-completo/manifest.json');
  if (!dryRun && applied > 0 && existsSync(manifestPath)) {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as { slugs: string[] };
    const remove = new Set(slugs);
    const before = manifest.slugs.length;
    manifest.slugs = manifest.slugs.filter((s) => !remove.has(s));
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    console.log(
      `[repair:vias-mis-tags] manifest vias-completo: ${before} → ${manifest.slugs.length} slugs`,
    );
  }

  const out = resolve('artifacts/catalog-repair-vias-mis-tags.json');
  mkdirSync(resolve('artifacts'), { recursive: true });
  writeFileSync(
    out,
    `${JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        mode: dryRun ? 'dry-run' : 'apply',
        total: slugs.length,
        applied,
        skipped,
        lines,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
  console.log(`[repair:vias-mis-tags] applied=${applied}/${slugs.length} report=${out}`);

  if (!dryRun && applied > 0) {
    try {
      await invalidateModulosCache();
      await invalidateQuestoesCache();
    } catch (cacheErr) {
      console.warn(
        '[repair:vias-mis-tags] cache invalidation skipped:',
        cacheErr instanceof Error ? cacheErr.message : cacheErr,
      );
    }
  }

  if (lines.some((l) => l.skip_reason === 'zod_invalid' || l.skip_reason?.startsWith('sem'))) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('[repair:vias-mis-tags]', err);
  process.exitCode = 1;
});

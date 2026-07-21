#!/usr/bin/env tsx
/**
 * Reparos de drift taxonômico — Promoção à Saúde (pré-handcraft g01).
 *
 *   npm run catalog:repair-promocao-taxonomy-drift -- --dry-run
 *   npm run catalog:repair-promocao-taxonomy-drift -- --apply
 */
import { loadEnvConfig } from '@next/env';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { hasFlag } from '@/lib/catalogMigration/cliArgs';
import { applySubtopicoLabelToPayload } from '@/lib/catalogMigration/reclassifySubtopico';
import { invalidateModulosCache, invalidateQuestoesCache } from '@/lib/cache';
import { createServerSupabase } from '@/lib/supabase/server';

const PROMOCAO = 'Promoção à Saúde e Prevenção de Agravos';
const CRONICAS =
  'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis';
const PARASITARIAS = 'Doenças Parasitárias e Zoonoses';

const REPAIRS: {
  slug: string;
  subtopico: string;
  syncTituloAula: boolean;
  metaDefaults?: { banca?: string; topico?: string };
  forceMetaPatch?: boolean;
}[] = [
  {
    slug: 'idecan-enfermagem-saude-do-idoso-1778712437306-6',
    subtopico: PROMOCAO,
    syncTituloAula: false,
    metaDefaults: { banca: 'IDECAN', topico: 'Saúde Pública' },
    forceMetaPatch: true,
  },
  {
    slug: 'idecan-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1778712270872-2',
    subtopico: CRONICAS,
    syncTituloAula: true,
  },
  {
    slug: 'unifil-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563927625-2',
    subtopico: CRONICAS,
    syncTituloAula: true,
  },
  {
    slug: 'contemax-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563950884-2',
    subtopico: PARASITARIAS,
    syncTituloAula: true,
  },
  {
    slug: 'cpcon-uepb-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563946005-5',
    subtopico: PARASITARIAS,
    syncTituloAula: true,
  },
  {
    slug: 'cebraspe-cespe-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563875555-7',
    subtopico: PARASITARIAS,
    syncTituloAula: true,
  },
  {
    slug: 'cogeps-unioeste-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563946005-7',
    subtopico: PARASITARIAS,
    syncTituloAula: true,
  },
  {
    slug: 'ibade-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563875555-6',
    subtopico: PARASITARIAS,
    syncTituloAula: true,
  },
  {
    slug: 'idcap-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563868300-5',
    subtopico: PARASITARIAS,
    syncTituloAula: true,
  },
  {
    slug: 'idecan-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1778712270872-3',
    subtopico: PARASITARIAS,
    syncTituloAula: true,
  },
  {
    slug: 'idecan-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1778712270872-5',
    subtopico: PARASITARIAS,
    syncTituloAula: true,
  },
  {
    slug: 'inaz-do-para-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563932216-6',
    subtopico: PARASITARIAS,
    syncTituloAula: true,
  },
];

type RepairLine = {
  slug: string;
  subtopico_before?: string;
  subtopico_after: string;
  titulo_before?: string | null;
  titulo_after?: string | null;
  zod_valid: boolean;
  applied: boolean;
  skip_reason?: string;
};

async function main() {
  const apply = hasFlag('apply');
  const dryRun = !apply || hasFlag('dry-run');
  const supabase = await createServerSupabase();
  const lines: RepairLine[] = [];

  console.log(
    `[repair:promocao-taxonomy] mode=${dryRun ? 'dry-run' : 'apply'} slugs=${REPAIRS.length}`,
  );

  for (const { slug, subtopico, syncTituloAula, metaDefaults, forceMetaPatch } of REPAIRS) {
    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('id, conteudo_json, titulo_aula')
      .eq('modulo_slug', slug)
      .maybeSingle();

    if (error) throw new Error(`${slug}: ${error.message}`);
    if (!data) {
      console.warn(`[repair:promocao-taxonomy] SKIP ${slug}: não encontrado`);
      lines.push({
        slug,
        subtopico_after: subtopico,
        zod_valid: false,
        applied: false,
        skip_reason: 'not_found',
      });
      continue;
    }

    const beforeMeta = (data.conteudo_json as { meta?: { subtopico?: string; banca?: string; topico?: string } })
      ?.meta;
    const tituloBefore = data.titulo_aula;
    const raw = data.conteudo_json as Record<string, unknown>;
    if (metaDefaults) {
      const meta = (raw.meta && typeof raw.meta === 'object' ? { ...(raw.meta as object) } : {}) as Record<
        string,
        unknown
      >;
      if (!meta.banca && metaDefaults.banca) meta.banca = metaDefaults.banca;
      if (!meta.topico && metaDefaults.topico) meta.topico = metaDefaults.topico;
      raw.meta = meta;
    }
    const result = applySubtopicoLabelToPayload(raw, subtopico, beforeMeta?.subtopico ?? null);
    const tituloAfter = syncTituloAula ? subtopico : tituloBefore;

    const line: RepairLine = {
      slug,
      subtopico_before: beforeMeta?.subtopico,
      subtopico_after: subtopico,
      titulo_before: tituloBefore,
      titulo_after: tituloAfter,
      zod_valid: result.zodValid,
      applied: false,
      skip_reason: result.changed ? undefined : result.skipReason,
    };

    console.log(
      `[repair:promocao-taxonomy] ${dryRun ? 'DRY' : 'APPLY'} ${slug}\n` +
        `  meta.subtopico: ${beforeMeta?.subtopico ?? '(vazio)'} → ${subtopico}\n` +
        `  titulo_aula: ${tituloBefore ?? '—'} → ${tituloAfter ?? '—'}\n` +
        `  zod=${result.zodValid}${result.zodMessage ? ` (${result.zodMessage})` : ''}`,
    );

    if (!result.zodValid && !forceMetaPatch) {
      console.warn(`[repair:promocao-taxonomy] SKIP ${slug}: Zod inválido`);
    } else if (!dryRun && (result.changed || !beforeMeta?.subtopico?.trim() || forceMetaPatch)) {
      const payload = result.zodValid ? result.payload : raw;
      const meta = (payload as { meta?: Record<string, unknown> }).meta ?? {};
      meta.subtopico = subtopico;
      if (metaDefaults?.banca && !meta.banca) meta.banca = metaDefaults.banca;
      if (metaDefaults?.topico && !meta.topico) meta.topico = metaDefaults.topico;
      (payload as { meta?: Record<string, unknown> }).meta = meta;

      const slides =
        (payload as { reverse_study_slides?: unknown[] }).reverse_study_slides ??
        (payload as { study_slides?: unknown[] }).study_slides;
      if (Array.isArray(slides)) {
        for (const slide of slides) {
          if (slide && typeof slide === 'object' && 'meta' in slide) {
            const sm = (slide as { meta?: Record<string, unknown> }).meta ?? {};
            sm.subtopico = subtopico;
            (slide as { meta?: Record<string, unknown> }).meta = sm;
          }
        }
      }

      const update: { conteudo_json: unknown; titulo_aula?: string } = {
        conteudo_json: payload,
      };
      if (syncTituloAula && tituloAfter) update.titulo_aula = tituloAfter;

      const { error: updateError } = await supabase
        .from('modulos_estudo')
        .update(update)
        .eq('id', data.id);
      if (updateError) throw new Error(`${slug}: ${updateError.message}`);
      line.applied = true;
    } else if (!result.changed) {
      line.skip_reason = 'already_ok';
    }

    lines.push(line);
  }

  const out = resolve('artifacts/catalog-repair-promocao-taxonomy-drift.json');
  mkdirSync(resolve('artifacts'), { recursive: true });
  writeFileSync(
    out,
    `${JSON.stringify({ generated_at: new Date().toISOString(), mode: dryRun ? 'dry-run' : 'apply', lines }, null, 2)}\n`,
    'utf8',
  );
  console.log(`[repair:promocao-taxonomy] relatório=${out}`);

  if (!dryRun) {
    try {
      await invalidateModulosCache();
      await invalidateQuestoesCache();
    } catch (cacheErr) {
      console.warn(
        '[repair:promocao-taxonomy] cache invalidation skipped:',
        cacheErr instanceof Error ? cacheErr.message : cacheErr,
      );
    }
  }
}

main().catch((err) => {
  console.error('[repair:promocao-taxonomy]', err);
  process.exit(1);
});

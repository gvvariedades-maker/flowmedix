#!/usr/bin/env tsx
/**
 * Checklist A1–A3 executável — questão ou subtópico 100% pronto.
 *
 * Uso:
 *   npm run audit:questao-readiness -- --file=examples/questao-premium-vunesp-respiratorio-crise-asmatica-exceto.json
 *   npm run audit:questao-readiness -- --lote=respiratorio-cronico-g01
 *   npm run audit:questao-readiness -- --lote=respiratorio-cronico-g01 --slug=idecan-geral-...
 *   npm run audit:questao-readiness -- --from-supabase --slug=objetiva-concursos-...
 *   npm run audit:questao-readiness -- --from-supabase --subtopico="Doenças Respiratórias Crônicas (Asma, DPOC)"
 *   npm run audit:questao-readiness -- --subtopico="Farmacodinâmica e Farmacocinética" --lote=farmaco-completo
 *
 * Flags:
 *   --no-strict   golden lint / gabarito / drift como warn (não error)
 *   --strict-v2-pedagogy   redundância/spoiler v2 vira error (handcraft professor)
 *   --json        só imprime relatório JSON em artifacts/
 */
import { loadEnvConfig } from '@next/env';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

loadEnvConfig(process.cwd());

import {
  auditQuestaoReadiness,
  formatReadinessLine,
  summarizeSubtopicoReadiness,
  type AuditQuestaoReadinessResult,
} from '@/lib/catalogMigration/auditQuestaoReadiness';
import { hasFlag, parseArg } from '@/lib/catalogMigration/cliArgs';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { createServerSupabase } from '@/lib/supabase/server';

const PAGE_SIZE = 200;

type RegistryEntry = {
  status?: string;
  total_slugs?: number;
  handcraft_applied?: number;
};

function loadRegistryEntry(subtopico: string): RegistryEntry | undefined {
  const path = resolve(process.cwd(), 'data/catalog-migration/handcraft-registry.json');
  if (!existsSync(path)) return undefined;
  const registry = JSON.parse(readFileSync(path, 'utf8')) as {
    pacotes?: Record<string, RegistryEntry>;
  };
  const key = Object.keys(registry.pacotes ?? {}).find(
    (k) => k.toLowerCase() === subtopico.toLowerCase(),
  );
  return key ? registry.pacotes?.[key] : undefined;
}

function loadLocalTargets(): { slug: string; payload: unknown }[] {
  const file = parseArg('file');
  const lote = parseArg('lote');
  const slugFilter = parseArg('slug')?.toLowerCase();
  const targets: { slug: string; payload: unknown }[] = [];

  if (file) {
    const path = resolve(process.cwd(), file);
    const slug = file.replace(/^.*[/\\]/, '').replace(/\.json$/, '');
    targets.push({
      slug,
      payload: JSON.parse(readFileSync(path, 'utf8')),
    });
    return targets;
  }

  if (!lote) {
    throw new Error('Informe --file=, --lote= ou --from-supabase');
  }

  const dir = loteQuestionsDir(lote);
  if (!existsSync(dir)) {
    throw new Error(`Lote não encontrado: ${dir}`);
  }

  for (const f of readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .sort()) {
    const slug = f.replace(/\.json$/, '');
    if (slugFilter && !slug.toLowerCase().includes(slugFilter)) continue;
    targets.push({
      slug,
      payload: JSON.parse(readFileSync(join(dir, f), 'utf8')),
    });
  }

  return targets;
}

async function loadSupabaseTargets(): Promise<{ slug: string; payload: unknown }[]> {
  const slugFilter = parseArg('slug')?.toLowerCase();
  const subtopicoFilter = parseArg('subtopico')?.toLowerCase();
  const supabase = await createServerSupabase();
  const targets: { slug: string; payload: unknown }[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('modulo_slug, titulo_aula, conteudo_json')
      .order('modulo_slug', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) throw new Error(`Supabase: ${error.message}`);
    const batch = data ?? [];
    if (batch.length === 0) break;

    for (const row of batch) {
      const slug = String(row.modulo_slug ?? '');
      const payload = row.conteudo_json as { meta?: { subtopico?: string } };
      const sub = payload?.meta?.subtopico?.toLowerCase() ?? '';
      const titulo = String(row.titulo_aula ?? '').toLowerCase();

      if (slugFilter && !slug.toLowerCase().includes(slugFilter)) continue;
      if (
        subtopicoFilter &&
        !sub.includes(subtopicoFilter) &&
        !titulo.includes(subtopicoFilter)
      ) {
        continue;
      }

      targets.push({ slug, payload });
    }

    offset += PAGE_SIZE;
    if (batch.length < PAGE_SIZE) break;
  }

  return targets;
}

function main(): void {
  const strict = !hasFlag('no-strict');
  const strictV3Pedagogy = hasFlag('strict-v3-pedagogy');
  const strictV2Pedagogy = strictV3Pedagogy || hasFlag('strict-v2-pedagogy');
  const jsonOnly = hasFlag('json');
  const fromSupabase = hasFlag('from-supabase');

  const run = async () => {
    const targets = fromSupabase ? await loadSupabaseTargets() : loadLocalTargets();

    if (targets.length === 0) {
      console.error('[audit:questao-readiness] Nenhum alvo encontrado.');
      process.exitCode = 1;
      return;
    }

    const results: AuditQuestaoReadinessResult[] = targets.map(({ slug, payload }) =>
      auditQuestaoReadiness(payload as never, { slug, strict, strictV2Pedagogy, strictV3Pedagogy }),
    );

    const subtopico =
      parseArg('subtopico') ??
      results[0]?.subtopico ??
      (targets[0]?.payload as { meta?: { subtopico?: string } })?.meta?.subtopico;

    const registry = subtopico ? loadRegistryEntry(subtopico) : undefined;
    const summary =
      targets.length > 1 && subtopico
        ? summarizeSubtopicoReadiness(subtopico, results, registry)
        : undefined;

    const artifactsDir = resolve(process.cwd(), 'artifacts');
    mkdirSync(artifactsDir, { recursive: true });
    const outPath = resolve(artifactsDir, 'questao-readiness-audit.json');
    writeFileSync(
      outPath,
      JSON.stringify({ strict, strict_v2_pedagogy: strictV2Pedagogy, strict_v3_pedagogy: strictV3Pedagogy, scanned: results.length, summary, results }, null, 2),
      'utf8',
    );

    if (!jsonOnly) {
      for (const r of results) {
        console.log(formatReadinessLine(r));
        if (!r.ready_100) {
          for (const c of r.checks.filter((x) => x.severity === 'error')) {
            console.log(`  [${c.tier}] ${c.code}: ${c.message}`);
          }
        }
      }

      if (summary) {
        console.log('');
        console.log(
          `[audit:questao-readiness] subtópico="${summary.subtopico}" ready=${summary.ready_100}/${summary.scanned} (${summary.pct_ready}%)`,
        );
        if (summary.registry) {
          const reg = summary.registry;
          console.log(
            `[audit:questao-readiness] registry status=${reg.status} handcraft=${reg.handcraft_applied}/${reg.total_slugs} complete=${reg.complete}`,
          );
        }
        console.log(
          `[audit:questao-readiness] falhas por tier A1=${summary.tier_failures.A1} A2=${summary.tier_failures.A2} A3=${summary.tier_failures.A3}`,
        );
      }

      console.log(`[audit:questao-readiness] relatório=${outPath}`);
    } else {
      console.log(outPath);
    }

    process.exitCode = results.some((r) => !r.ready_100) ? 1 : 0;
  };

  run().catch((err) => {
    console.error('[audit:questao-readiness]', err);
    process.exitCode = 1;
  });
}

main();

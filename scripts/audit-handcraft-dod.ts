#!/usr/bin/env tsx
/**
 * Definition of Done — subtópicos handcraft golden-v1 fechados no registry.
 *
 * Uso:
 *   npm run audit:handcraft-dod
 *   npm run audit:handcraft-dod -- --subtopico="Processamento"
 *
 * Gera: artifacts/handcraft-dod-audit.json
 */
import { loadEnvConfig } from '@next/env';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  auditPremiumQuestao,
  premiumGateErrors,
} from '@/lib/catalogMigration/premiumGate';
import { createServerSupabase } from '@/lib/supabase/server';

type RegistryPacote = {
  pacote_prefix: string;
  manifest: string;
  status: string;
  total_slugs: number;
  handcraft_applied: number;
};

type RegistryFile = {
  pacotes: Record<string, RegistryPacote>;
};

type ManifestFile = { slugs?: string[] };

type SlugCheck = {
  slug: string;
  ok: boolean;
  issues: string[];
};

type SubtopicoReport = {
  subtopico: string;
  registry_status: string;
  total_slugs: number;
  handcraft_applied: number;
  manifest_slugs: number;
  supabase_found: number;
  golden_v1: number;
  four_slides: number;
  premium_gate_ok: number;
  local_json_count: number;
  slug_issues: SlugCheck[];
  pilot_sample: string[];
  pilot_min: number;
  dod_pass: boolean;
  dod_notes: string[];
};

type DodReport = {
  generated_at: string;
  subtopicos_ready: number;
  subtopicos_pass: number;
  subtopicos_fail: number;
  items: SubtopicoReport[];
};

function loadManifestSlugs(manifestPath: string): string[] {
  const full = resolve(process.cwd(), manifestPath);
  if (!existsSync(full)) return [];
  const data = JSON.parse(readFileSync(full, 'utf8')) as ManifestFile;
  return [...(data.slugs ?? [])].sort();
}

function countLocalJson(pacotePrefix: string): number {
  const root = resolve(process.cwd(), 'data/catalog-migration');
  if (!existsSync(root)) return 0;
  let count = 0;
  for (const name of readdirSync(root)) {
    if (!name.startsWith(`${pacotePrefix}-`)) continue;
    const dir = loteQuestionsDir(name);
    if (!existsSync(dir)) continue;
    count += readdirSync(dir).filter((f) => f.endsWith('.json')).length;
  }
  return count;
}

function pilotSample(slugs: string[]): { sample: string[]; min: number } {
  const min = Math.max(1, Math.ceil(slugs.length * 0.05));
  return { sample: slugs.slice(0, min), min };
}

function checkPayload(slug: string, raw: unknown): SlugCheck {
  const issues: string[] = [];
  if (!raw || typeof raw !== 'object') {
    return { slug, ok: false, issues: ['conteudo_json ausente ou inválido'] };
  }
  const payload = raw as Record<string, unknown>;
  const meta = payload.meta as Record<string, unknown> | undefined;
  if (meta?.content_standard !== 'golden-v1') {
    issues.push(`content_standard=${String(meta?.content_standard ?? 'ausente')}`);
  }
  const slides =
    (payload.reverse_study_slides as unknown[] | undefined) ??
    (payload.study_slides as unknown[] | undefined) ??
    [];
  if (slides.length !== 4) {
    issues.push(`slides=${slides.length} (esperado 4)`);
  }
  for (const issue of premiumGateErrors(payload)) {
    if (issue.severity === 'error') {
      issues.push(`${issue.code}: ${issue.message}`);
    }
  }
  const auditIssues = auditPremiumQuestao(payload).filter((i) => i.severity === 'error');
  for (const issue of auditIssues) {
    const line = `${issue.code}: ${issue.message}`;
    if (!issues.includes(line)) issues.push(line);
  }
  return { slug, ok: issues.length === 0, issues };
}

async function main() {
  const filter = parseArg('subtopico')?.toLowerCase();
  const registryPath = resolve(process.cwd(), 'data/catalog-migration/handcraft-registry.json');
  const registry = JSON.parse(readFileSync(registryPath, 'utf8')) as RegistryFile;

  const supabase = await createServerSupabase();
  const items: SubtopicoReport[] = [];

  for (const [subtopico, pacote] of Object.entries(registry.pacotes)) {
    if (filter && !subtopico.toLowerCase().includes(filter)) continue;
    if (pacote.handcraft_applied < pacote.total_slugs || pacote.total_slugs === 0) continue;

    const manifestSlugs = loadManifestSlugs(pacote.manifest);
    const notes: string[] = [];
    const slugIssues: SlugCheck[] = [];
    let supabaseFound = 0;
    let goldenV1 = 0;
    let fourSlides = 0;
    let premiumOk = 0;

    if (manifestSlugs.length !== pacote.total_slugs) {
      notes.push(
        `manifest (${manifestSlugs.length}) ≠ registry total_slugs (${pacote.total_slugs})`,
      );
    }

    const CHUNK = 40;
    for (let i = 0; i < manifestSlugs.length; i += CHUNK) {
      const chunk = manifestSlugs.slice(i, i + CHUNK);
      const { data, error } = await supabase
        .from('modulos_estudo')
        .select('modulo_slug, conteudo_json')
        .in('modulo_slug', chunk);

      if (error) throw new Error(`Supabase: ${error.message}`);

      const bySlug = new Map(
        (data ?? []).map((row) => [row.modulo_slug as string, row.conteudo_json]),
      );

      for (const slug of chunk) {
        const raw = bySlug.get(slug);
        if (raw === undefined) {
          slugIssues.push({ slug, ok: false, issues: ['slug ausente no Supabase'] });
          continue;
        }
        supabaseFound += 1;
        const check = checkPayload(slug, raw);
        if (check.ok) {
          goldenV1 += 1;
          fourSlides += 1;
          premiumOk += 1;
        } else {
          slugIssues.push(check);
          const payload = raw as Record<string, unknown>;
          const meta = payload.meta as Record<string, unknown> | undefined;
          if (meta?.content_standard === 'golden-v1') goldenV1 += 1;
          const slides =
            ((payload.reverse_study_slides as unknown[] | undefined) ??
              (payload.study_slides as unknown[] | undefined) ??
              []).length;
          if (slides === 4) fourSlides += 1;
          if (premiumGateErrors(payload).filter((i) => i.severity === 'error').length === 0) {
            premiumOk += 1;
          }
        }
      }
    }

    if (pacote.status !== 'applied') {
      notes.push(`registry status="${pacote.status}" (esperado applied)`);
    }

    const localJson = countLocalJson(pacote.pacote_prefix);
    if (localJson < pacote.total_slugs) {
      notes.push(`JSON local: ${localJson}/${pacote.total_slugs} (repo parcial — OK se Supabase OK)`);
    }

    const { sample, min } = pilotSample(manifestSlugs);
    notes.push(`Piloto humano sugerido: revisar ${min} slug(s) no player (≥5%)`);

    const dodPass =
      slugIssues.length === 0 &&
      supabaseFound === manifestSlugs.length &&
      goldenV1 === manifestSlugs.length &&
      pacote.status === 'applied';

    items.push({
      subtopico,
      registry_status: pacote.status,
      total_slugs: pacote.total_slugs,
      handcraft_applied: pacote.handcraft_applied,
      manifest_slugs: manifestSlugs.length,
      supabase_found: supabaseFound,
      golden_v1: goldenV1,
      four_slides: fourSlides,
      premium_gate_ok: premiumOk,
      local_json_count: localJson,
      slug_issues: slugIssues,
      pilot_sample: sample,
      pilot_min: min,
      dod_pass: dodPass,
      dod_notes: notes,
    });
  }

  const report: DodReport = {
    generated_at: new Date().toISOString(),
    subtopicos_ready: items.length,
    subtopicos_pass: items.filter((i) => i.dod_pass).length,
    subtopicos_fail: items.filter((i) => !i.dod_pass).length,
    items,
  };

  const outDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, 'handcraft-dod-audit.json');
  writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');

  console.log(`[audit:handcraft-dod] subtópicos=${report.subtopicos_ready} pass=${report.subtopicos_pass} fail=${report.subtopicos_fail}`);
  for (const item of items) {
    const flag = item.dod_pass ? 'PASS' : 'FAIL';
    console.log(
      `  [${flag}] ${item.subtopico}: ${item.supabase_found}/${item.manifest_slugs} OK · golden=${item.golden_v1} · gate=${item.premium_gate_ok} · status=${item.registry_status}`,
    );
    if (item.slug_issues.length > 0) {
      for (const s of item.slug_issues.slice(0, 5)) {
        console.log(`    ✗ ${s.slug}: ${s.issues.join('; ')}`);
      }
      if (item.slug_issues.length > 5) {
        console.log(`    … +${item.slug_issues.length - 5} slugs com problema`);
      }
    }
    for (const note of item.dod_notes) {
      console.log(`    · ${note}`);
    }
  }
  console.log(`[audit:handcraft-dod] relatório=${outPath}`);

  process.exitCode = report.subtopicos_fail > 0 ? 1 : 0;
}

main().catch((err) => {
  console.error('[audit:handcraft-dod]', err);
  process.exitCode = 1;
});

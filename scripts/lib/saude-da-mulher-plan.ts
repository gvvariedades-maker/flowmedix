#!/usr/bin/env tsx
/**
 * Utilitário compartilhado — planejamento de lotes Saúde da Mulher.
 */
import { existsSync, readFileSync } from 'node:fs';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

export const STRONG_BRANCHES = [
  'mulher_prenatal',
  'mulher_parto',
  'mulher_papanicolau',
  'mulher_mama',
] as const;

export const BRANCH_CLUSTER: Record<(typeof STRONG_BRANCHES)[number], string> = {
  mulher_prenatal: 'Pré-natal / gestação',
  mulher_parto: 'Parto / trabalho de parto',
  mulher_papanicolau: 'Rastreio câncer de colo',
  mulher_mama: 'Saúde da mama',
};

export type ClusterRow = {
  slug: string;
  topic: string;
  branch_id: string;
  drift: boolean;
};

export function loadExcludeSlugs(): Set<string> {
  const exclude = new Set<string>();
  const migrationRoot = resolve(process.cwd(), 'data/catalog-migration');

  const excludeDone = resolve(migrationRoot, 'saude-da-mulher-exclude-done.json');
  if (existsSync(excludeDone)) {
    const ex = JSON.parse(readFileSync(excludeDone, 'utf8')) as {
      all_exclude_from_handcraft?: string[];
    };
    for (const s of ex.all_exclude_from_handcraft ?? []) exclude.add(s);
  }

  const handcraftLoteRe = /^saude-da-mulher-g\d{2}$/;

  for (const name of readdirSync(migrationRoot)) {
    if (!handcraftLoteRe.test(name)) continue;
    const manifest = resolve(migrationRoot, name, 'manifest.json');
    if (!existsSync(manifest)) continue;
    try {
      const m = JSON.parse(readFileSync(manifest, 'utf8')) as { slugs?: string[] };
      for (const s of m.slugs ?? []) exclude.add(s);
    } catch {
      // ignore
    }
  }

  const completoManifest = resolve(migrationRoot, 'saude-da-mulher-completo/manifest.json');
  if (existsSync(completoManifest)) {
    const m = JSON.parse(readFileSync(completoManifest, 'utf8')) as {
      slugs_handcraft_applied?: string[];
    };
    for (const s of m.slugs_handcraft_applied ?? []) exclude.add(s);
  }

  return exclude;
}

export function loadClusterRows(): ClusterRow[] {
  const reportPath = resolve(process.cwd(), 'artifacts/saude-da-mulher-topic-cluster-report.json');
  if (!existsSync(reportPath)) {
    throw new Error('Rode npm run cluster:saude-da-mulher antes de planejar lotes.');
  }
  const report = JSON.parse(readFileSync(reportPath, 'utf8')) as { rows: ClusterRow[] };
  return report.rows;
}

export function slugsForBranch(rows: ClusterRow[], branchId: string, exclude: Set<string>): string[] {
  return rows
    .filter((r) => r.branch_id === branchId && !r.drift && !exclude.has(r.slug))
    .map((r) => r.slug);
}

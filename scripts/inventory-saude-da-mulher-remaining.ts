#!/usr/bin/env tsx
/**
 * Inventário — slugs Saúde da Mulher restantes vs handcraft.
 *   npx tsx scripts/inventory-saude-da-mulher-remaining.ts
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { loadClusterRows, loadExcludeSlugs } from './lib/saude-da-mulher-plan';

function loadHandcraftSlugs(): Set<string> {
  const handcraft = new Set<string>();
  const root = resolve(process.cwd(), 'data/catalog-migration');
  const re = /^saude-da-mulher-g\d{2}$/;
  for (const name of readdirSync(root)) {
    if (!re.test(name)) continue;
    const m = resolve(root, name, 'manifest.json');
    if (!existsSync(m)) continue;
    const data = JSON.parse(readFileSync(m, 'utf8')) as { slugs?: string[] };
    for (const s of data.slugs ?? []) handcraft.add(s);
  }
  return handcraft;
}

function main() {
  const completo = JSON.parse(
    readFileSync(resolve('data/catalog-migration/saude-da-mulher-completo/manifest.json'), 'utf8'),
  ) as { slugs: string[] };
  const catalog = completo.slugs;
  const handcraft = loadHandcraftSlugs();
  const exclude = loadExcludeSlugs();
  const rows = loadClusterRows();
  const rowBySlug = new Map(rows.map((r) => [r.slug, r]));

  const remaining = catalog.filter((s) => !handcraft.has(s));
  const excluded = remaining.filter((s) => exclude.has(s));
  const actionable = remaining.filter((s) => !exclude.has(s));

  type Bucket = {
    slug: string;
    branch_id: string;
    drift: boolean;
    topic: string;
    family?: string;
    recommendation: 'handcraft' | 'reclass' | 'review';
  };

  const items: Bucket[] = remaining.map((slug) => {
    const r = rowBySlug.get(slug);
    const drift = r?.drift ?? false;
    const branch = r?.branch_id ?? 'unknown';
    const topic = r?.topic ?? '—';
    let recommendation: Bucket['recommendation'] = 'handcraft';
    if (exclude.has(slug)) recommendation = 'reclass';
    else if (drift) recommendation = 'reclass';
    else if (branch === 'mulher_generico' && !topic.includes('conceito geral')) recommendation = 'review';
    else if (
      ['mulher_prenatal', 'mulher_parto', 'mulher_papanicolau', 'mulher_mama', 'mulher_puerperio', 'mulher_planejamento'].includes(
        branch,
      )
    ) {
      recommendation = 'handcraft';
    }
    return {
      slug,
      branch_id: branch,
      drift,
      topic,
      family: (r as { family?: string } | undefined)?.family,
      recommendation,
    };
  });

  const summary = {
    generated_at: new Date().toISOString(),
    catalog_total: catalog.length,
    handcraft_applied: handcraft.size,
    remaining: remaining.length,
    excluded_from_handcraft: excluded.length,
    actionable_handcraft: actionable.length,
    by_recommendation: {
      handcraft: items.filter((i) => i.recommendation === 'handcraft').length,
      reclass: items.filter((i) => i.recommendation === 'reclass').length,
      review: items.filter((i) => i.recommendation === 'review').length,
    },
    by_branch_actionable: Object.fromEntries(
      [...new Set(actionable.map((s) => rowBySlug.get(s)?.branch_id ?? 'unknown'))].map((b) => [
        b,
        actionable.filter((s) => (rowBySlug.get(s)?.branch_id ?? 'unknown') === b).length,
      ]),
    ),
    g30_proposal: {
      lote: 'saude-da-mulher-g30',
      strategy: 'handcraft residual strong-branch + review generico drift-flagged',
      slug_count: Math.min(8, actionable.length),
      slugs: actionable.slice(0, 8),
    },
    items,
  };

  const outDir = resolve('artifacts');
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, 'saude-da-mulher-remaining-inventory.json');
  writeFileSync(outPath, JSON.stringify(summary, null, 2), 'utf8');

  console.log(`[inventory:sm] catalog=${catalog.length} handcraft=${handcraft.size} remaining=${remaining.length}`);
  console.log(`[inventory:sm] excluded=${excluded.length} actionable=${actionable.length}`);
  console.log(`[inventory:sm] handcraft=${summary.by_recommendation.handcraft} reclass=${summary.by_recommendation.reclass} review=${summary.by_recommendation.review}`);
  console.log(`[inventory:sm] artifact=${outPath}`);
  console.log('[inventory:sm] g30 proposal:', summary.g30_proposal.slugs.join('\n  '));
}

main();

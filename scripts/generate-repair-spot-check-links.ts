#!/usr/bin/env tsx
/**
 * Gera página de spot-check com links /estudar/<slug> para lotes repair aplicados.
 *
 * Uso:
 *   npx tsx scripts/generate-repair-spot-check-links.ts
 *   npx tsx scripts/generate-repair-spot-check-links.ts --base=http://localhost:3000
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parseArg } from '@/lib/catalogMigration/cliArgs';

type AppliedReport = {
  lote: string;
  generated_at?: string;
  ok?: number;
  failed?: number;
  applied_slugs?: string[];
  results?: { modulo_slug: string; status: string }[];
};

function loadAppliedSlugs(artifactsDir: string): { lote: string; slugs: string[]; meta: AppliedReport }[] {
  const prefix = 'catalog-migration-';
  const suffix = '-applied.json';

  return readdirSync(artifactsDir)
    .filter((f) => f.startsWith(prefix) && f.includes('-repair-lote-') && f.endsWith(suffix))
    .sort()
    .map((file) => {
      const raw = JSON.parse(readFileSync(resolve(artifactsDir, file), 'utf8')) as AppliedReport;
      const slugs =
        raw.applied_slugs ??
        (raw.results ?? []).filter((r) => r.status === 'ok').map((r) => r.modulo_slug);
      return { lote: raw.lote ?? file.replace(prefix, '').replace(suffix, ''), slugs, meta: raw };
    });
}

function inferSubtopicoFromSlug(slug: string): string {
  const m = slug.match(/-enfermagem-(.+)-\d{10,}-\d+$/);
  if (!m) return '(slug)';
  return m[1].replace(/-/g, ' ');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function main() {
  const baseUrl = (parseArg('base') ?? 'http://localhost:3000').replace(/\/$/, '');
  const artifactsDir = resolve(process.cwd(), 'artifacts');
  const groups = loadAppliedSlugs(artifactsDir);
  const generatedAt = new Date().toISOString();

  const allSlugs = groups.flatMap((g) => g.slugs);
  const uniqueSlugs = [...new Set(allSlugs)];

  const mdLines = [
    '# Spot-check — lotes repair premium',
    '',
    `Gerado: ${generatedAt}`,
    '',
    `Base URL: \`${baseUrl}\``,
    '',
    `Total: **${uniqueSlugs.length}** questões em **${groups.length}** lotes`,
    '',
  ];

  for (const group of groups) {
    mdLines.push(`## ${group.lote} (${group.slugs.length} slugs, ok=${group.meta.ok ?? '?'})`, '');
    for (const slug of group.slugs) {
      mdLines.push(`- [${slug}](${baseUrl}/estudar/${slug})`);
    }
    mdLines.push('');
  }

  const htmlSections = groups
    .map((group) => {
      const items = group.slugs
        .map(
          (slug) =>
            `<li><a href="${baseUrl}/estudar/${escapeHtml(slug)}" target="_blank" rel="noopener">${escapeHtml(slug)}</a> <span class="hint">${escapeHtml(inferSubtopicoFromSlug(slug))}</span></li>`,
        )
        .join('\n');
      return `<section>
  <h2>${escapeHtml(group.lote)} <span class="badge">${group.slugs.length} slugs · ok ${group.meta.ok ?? '?'}</span></h2>
  <ul>${items}</ul>
</section>`;
    })
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AVANT — Spot-check repair premium</title>
  <style>
    :root { font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; }
    body { max-width: 960px; margin: 0 auto; padding: 1.5rem; }
    h1 { font-size: 1.35rem; margin-bottom: 0.25rem; }
    .meta { color: #94a3b8; font-size: 0.9rem; margin-bottom: 1.5rem; }
    section { margin-bottom: 2rem; background: #1e293b; border-radius: 12px; padding: 1rem 1.25rem; }
    h2 { font-size: 1rem; margin: 0 0 0.75rem; color: #8fe020; }
    .badge { font-size: 0.75rem; color: #94a3b8; font-weight: normal; }
    ul { list-style: none; padding: 0; margin: 0; }
    li { padding: 0.35rem 0; border-bottom: 1px solid #334155; font-size: 0.82rem; word-break: break-all; }
    li:last-child { border-bottom: none; }
    a { color: #38bdf8; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .hint { display: block; color: #64748b; font-size: 0.72rem; margin-top: 0.15rem; }
    .tip { background: #172554; border-left: 3px solid #8fe020; padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1.5rem; }
  </style>
</head>
<body>
  <h1>Spot-check — questões premium (repair)</h1>
  <p class="meta">Gerado ${escapeHtml(generatedAt)} · ${uniqueSlugs.length} questões · base <code>${escapeHtml(baseUrl)}</code></p>
  <p class="tip">Abra com <code>npm run dev</code> rodando e sessão logada. Links abrem o player em nova aba (<code>/estudar/&lt;slug&gt;</code>).</p>
  ${htmlSections}
</body>
</html>`;

  const mdPath = resolve(artifactsDir, 'premium-repair-spot-check.md');
  const htmlPath = resolve(artifactsDir, 'premium-repair-spot-check.html');
  const jsonPath = resolve(artifactsDir, 'premium-repair-spot-check.json');

  writeFileSync(mdPath, mdLines.join('\n'), 'utf8');
  writeFileSync(htmlPath, html, 'utf8');
  writeFileSync(
    jsonPath,
    JSON.stringify({ generated_at: generatedAt, base_url: baseUrl, total: uniqueSlugs.length, lotes: groups }, null, 2),
    'utf8',
  );

  console.log(`[spot-check] ${uniqueSlugs.length} slugs → ${htmlPath}`);
  console.log(`[spot-check] markdown → ${mdPath}`);
}

main();

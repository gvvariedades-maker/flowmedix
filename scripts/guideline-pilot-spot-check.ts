#!/usr/bin/env tsx
/**
 * Piloto pós-aprofundamento: amostra slugs por subtópico crítico + factcheck guideline.
 * Gera links /estudar/<slug> para revisão manual no player.
 *
 * Uso:
 *   npx tsx scripts/guideline-pilot-spot-check.ts
 *   npx tsx scripts/guideline-pilot-spot-check.ts --base=http://localhost:3000 --per-subtopico=8
 *   npx tsx scripts/guideline-pilot-spot-check.ts --include-stubs  # inclui conteúdo não migrado
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

import { runFactCheck } from '@/lib/ai/factCheck';
import { hasPremiumStubMarkers } from '@/lib/catalogMigration/premiumStubMarkers';
import { hasFlag, parseArg } from '@/lib/catalogMigration/cliArgs';
import { getGuidelineForSubtopico } from '@/lib/guidelines';
import { QuestaoCompletaSchema } from '@/lib/validations';

const CRITICAL_SUBTOPICOS = [
  'Imunização',
  'Verificação de Sinais Vitais',
  'Urgências e Emergências',
  'Saúde da Mulher',
  'Cuidados na Administração de Medicamentos',
] as const;

type Row = { modulo_slug: string; conteudo_json: unknown };

function subtopicoFromPayload(raw: unknown): string | null {
  if (!raw || typeof raw !== 'object') return null;
  const meta = (raw as Record<string, unknown>).meta;
  if (!meta || typeof meta !== 'object') return null;
  const s = (meta as Record<string, unknown>).subtopico;
  return typeof s === 'string' && s.trim() ? s.trim() : null;
}

function instructionText(raw: unknown): string {
  if (!raw || typeof raw !== 'object') return '';
  const qd = (raw as Record<string, unknown>).question_data;
  if (!qd || typeof qd !== 'object') return '';
  const inst = (qd as Record<string, unknown>).instruction;
  const opts = (qd as Record<string, unknown>).options;
  const optText =
    Array.isArray(opts) ?
      opts
        .map((o) => (o && typeof o === 'object' ? String((o as Record<string, unknown>).text ?? '') : ''))
        .join(' ')
    : '';
  return `${typeof inst === 'string' ? inst : ''} ${optText}`;
}

function pickEvenly<T>(items: T[], count: number): T[] {
  if (items.length <= count) return [...items];
  const step = items.length / count;
  return Array.from({ length: count }, (_, i) => items[Math.min(Math.floor(i * step), items.length - 1)]);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function main() {
  const baseUrl = (parseArg('base') ?? 'http://localhost:3000').replace(/\/$/, '');
  const perSubtopicoRaw = parseArg('per-subtopico');
  const perSubtopico =
    perSubtopicoRaw && Number.isFinite(Number(perSubtopicoRaw)) ?
      Math.max(1, Math.floor(Number(perSubtopicoRaw)))
    : 8;

  const premiumOnly = !hasFlag('include-stubs');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const bySubtopico = new Map<string, string[]>();
  const poolTotal = new Map<string, number>();
  const PAGE = 500;
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('modulo_slug, conteudo_json')
      .order('modulo_slug', { ascending: true })
      .range(offset, offset + PAGE - 1);

    if (error) throw new Error(error.message);
    const batch = (data ?? []) as Row[];
    if (batch.length === 0) break;

    for (const row of batch) {
      const sub = subtopicoFromPayload(row.conteudo_json);
      if (!sub || !(CRITICAL_SUBTOPICOS as readonly string[]).includes(sub)) continue;
      const slides =
        row.conteudo_json && typeof row.conteudo_json === 'object' ?
          ((row.conteudo_json as Record<string, unknown>).reverse_study_slides ??
            (row.conteudo_json as Record<string, unknown>).study_slides)
        : null;
      if (!Array.isArray(slides) || slides.length !== 4) continue;

      poolTotal.set(sub, (poolTotal.get(sub) ?? 0) + 1);
      if (premiumOnly && hasPremiumStubMarkers(slides)) continue;

      const list = bySubtopico.get(sub) ?? [];
      list.push(row.modulo_slug);
      bySubtopico.set(sub, list);
    }

    offset += PAGE;
    if (batch.length < PAGE) break;
  }

  const results: Array<{
    subtopico: string;
    slug: string;
    url: string;
    status: 'ok' | 'fail';
    issues: string[];
    guideline_entries: number;
    fact_violations: number;
  }> = [];

  for (const subtopico of CRITICAL_SUBTOPICOS) {
    const pool = bySubtopico.get(subtopico) ?? [];
    const sample = pickEvenly(pool.sort(), perSubtopico);
    const guideline = getGuidelineForSubtopico(subtopico);

    for (const slug of sample) {
      const { data, error } = await supabase
        .from('modulos_estudo')
        .select('conteudo_json')
        .eq('modulo_slug', slug)
        .single();

      const issues: string[] = [];
      if (error || !data) {
        issues.push('fetch failed');
      } else {
        const payload = data.conteudo_json;
        const parsed = QuestaoCompletaSchema.safeParse(payload);
        if (!parsed.success) issues.push(`zod:${parsed.error.issues.length}`);
        else {
          const slides = parsed.data.reverse_study_slides ?? parsed.data.study_slides ?? [];
          if (slides.length !== 4) issues.push(`slides:${slides.length}`);
          if (!premiumOnly && hasPremiumStubMarkers(slides)) issues.push('stub');
          const fc = runFactCheck(slides, guideline, {
            allowedText: instructionText(payload),
          });
          if (fc.violations.length > 0) {
            issues.push(...fc.violations.slice(0, 3));
            if (fc.violations.length > 3) issues.push(`+${fc.violations.length - 3} factcheck`);
          }
        }
      }

      results.push({
        subtopico,
        slug,
        url: `${baseUrl}/estudar/${slug}`,
        status: issues.length === 0 ? 'ok' : 'fail',
        issues,
        guideline_entries: guideline?.entries.length ?? 0,
        fact_violations: issues.filter((i) => i.startsWith('factcheck')).length,
      });
    }
  }

  const ok = results.filter((r) => r.status === 'ok').length;
  const fail = results.filter((r) => r.status === 'fail').length;
  const generatedAt = new Date().toISOString();

  const report = {
    generated_at: generatedAt,
    base_url: baseUrl,
    per_subtopico: perSubtopico,
    premium_only: premiumOnly,
    subtopicos: CRITICAL_SUBTOPICOS,
    summary: { total: results.length, ok, fail },
    pool_sizes: Object.fromEntries(
      CRITICAL_SUBTOPICOS.map((s) => [s, bySubtopico.get(s)?.length ?? 0]),
    ),
    pool_total_with_4_slides: Object.fromEntries(
      CRITICAL_SUBTOPICOS.map((s) => [s, poolTotal.get(s) ?? 0]),
    ),
    results,
  };

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  const jsonPath = resolve(artifactsDir, 'guideline-pilot-spot-check.json');
  writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');

  const mdLines = [
    '# Piloto guidelines — spot-check (subtópicos críticos)',
    '',
    `Gerado: ${generatedAt}`,
    `Base: \`${baseUrl}\``,
    `Filtro: ${premiumOnly ? 'somente premium (sem stub)' : 'todos com 4 slides'}`,
    '',
    `**${ok}/${results.length}** OK · **${fail}** com issues`,
    '',
  ];

  for (const sub of CRITICAL_SUBTOPICOS) {
    const rows = results.filter((r) => r.subtopico === sub);
    mdLines.push(
      `## ${sub} (premium ${bySubtopico.get(sub)?.length ?? 0} / total 4-slides ${poolTotal.get(sub) ?? 0}, amostra ${rows.length})`,
      '',
    );
    for (const r of rows) {
      const flag = r.status === 'ok' ? '✓' : '✗';
      mdLines.push(`- ${flag} [${r.slug}](${r.url})${r.issues.length ? ` — ${r.issues.join('; ')}` : ''}`);
    }
    mdLines.push('');
  }

  const mdPath = resolve(artifactsDir, 'guideline-pilot-spot-check.md');
  writeFileSync(mdPath, mdLines.join('\n'), 'utf8');

  const htmlSections = CRITICAL_SUBTOPICOS.map((sub) => {
    const rows = results.filter((r) => r.subtopico === sub);
    const lis = rows
      .map(
        (r) =>
          `<li class="${r.status}"><a href="${escapeHtml(r.url)}" target="_blank" rel="noreferrer">${escapeHtml(r.slug)}</a>${r.issues.length ? `<small> — ${escapeHtml(r.issues.join('; '))}</small>` : ''}</li>`,
      )
      .join('\n');
    return `<section><h2>${escapeHtml(sub)}</h2><ul>${lis}</ul></section>`;
  }).join('\n');

  const htmlPath = resolve(artifactsDir, 'guideline-pilot-spot-check.html');
  writeFileSync(
    htmlPath,
    `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"/><title>Guideline pilot spot-check</title>
<style>body{font-family:system-ui,sans-serif;max-width:960px;margin:2rem auto;padding:0 1rem}
li.fail{color:#b91c1c}li.ok{color:#15803d}small{color:#64748b}</style></head><body>
<h1>Guideline pilot — ${ok}/${results.length} OK</h1>
<p>Gerado ${generatedAt} · <a href="${baseUrl}">${baseUrl}</a></p>
${htmlSections}
</body></html>`,
    'utf8',
  );

  console.log(`[guideline-pilot] ${ok}/${results.length} OK, ${fail} fail`);
  for (const sub of CRITICAL_SUBTOPICOS) {
    const subOk = results.filter((r) => r.subtopico === sub && r.status === 'ok').length;
    const subTotal = results.filter((r) => r.subtopico === sub).length;
    console.log(
      `  ${sub}: ${subOk}/${subTotal} (premium pool ${bySubtopico.get(sub)?.length ?? 0} / total ${poolTotal.get(sub) ?? 0})`,
    );
  }
  console.log('[guideline-pilot] JSON:', jsonPath);
  console.log('[guideline-pilot] MD:', mdPath);
  console.log('[guideline-pilot] HTML:', htmlPath);

  if (fail > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

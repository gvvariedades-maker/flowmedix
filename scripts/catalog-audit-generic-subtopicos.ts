#!/usr/bin/env tsx
/**
 * Ranking de subtópicos fora dos 11 com molde premium bespoke.
 * Uso: npx tsx scripts/catalog-audit-generic-subtopicos.ts
 */

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

import { createServerSupabase } from '@/lib/supabase/server';

const PREMIUM_MOLD_SUBTOPICOS = new Set([
  'Oxigenoterapia e Cuidados Respiratórios',
  'Punção Venosa e Cuidados com Cateteres',
  'Vias de Administração',
  'Cálculo de Administração de Medicamentos e Infusões',
  'Promoção à Saúde e Prevenção de Agravos',
  'Processo de Enfermagem',
  'Imunização',
  'Urgências e Emergências',
  'Verificação de Sinais Vitais',
  'Instalação e Manejo de Sondas',
  'Cuidados na Administração de Medicamentos',
]);

type Row = { conteudo_json: unknown };

function slideCount(raw: unknown): number {
  if (!raw || typeof raw !== 'object') return 0;
  const o = raw as Record<string, unknown>;
  const reverse = o.reverse_study_slides;
  if (Array.isArray(reverse) && reverse.length > 0) return reverse.length;
  const study = o.study_slides;
  if (Array.isArray(study)) return study.length;
  return 0;
}

function subtopico(raw: unknown): string {
  if (!raw || typeof raw !== 'object') return '(sem subtópico)';
  const meta = (raw as Record<string, unknown>).meta;
  if (!meta || typeof meta !== 'object') return '(sem subtópico)';
  const s = (meta as Record<string, unknown>).subtopico;
  return typeof s === 'string' && s.trim() ? s.trim() : '(sem subtópico)';
}

async function main() {
  const supabase = await createServerSupabase();
  const PAGE = 500;
  let offset = 0;
  const bySubtopico = new Map<string, number>();
  let catalogTotal = 0;
  let genericTotal = 0;

  while (true) {
    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('conteudo_json')
      .order('modulo_slug', { ascending: true })
      .range(offset, offset + PAGE - 1);

    if (error) throw new Error(error.message);
    const batch = (data ?? []) as Row[];
    if (batch.length === 0) break;

    for (const row of batch) {
      catalogTotal += 1;
      if (slideCount(row.conteudo_json) !== 4) continue;

      const sub = subtopico(row.conteudo_json);
      if (PREMIUM_MOLD_SUBTOPICOS.has(sub)) continue;

      genericTotal += 1;
      bySubtopico.set(sub, (bySubtopico.get(sub) ?? 0) + 1);
    }

    offset += PAGE;
    if (batch.length < PAGE) break;
  }

  const ranking = [...bySubtopico.entries()]
    .map(([subtopico, count]) => ({
      subtopico,
      count,
      pct_of_generic: Number(((count / genericTotal) * 100).toFixed(1)),
      pct_of_catalog: Number(((count / catalogTotal) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.count - a.count);

  const report = {
    generated_at: new Date().toISOString(),
    catalog_total: catalogTotal,
    generic_layout_total: genericTotal,
    premium_mold_total: catalogTotal - genericTotal,
    distinct_generic_subtopicos: ranking.length,
    ranking,
    notes: [
      'Questões com 4 slides e subtópico fora dos 11 com molde premium bespoke.',
      'Layouts atuais: morphological, bridge, molecular, grid, compare, cards, etc. (themeGenerator.ts).',
    ],
  };

  const out = resolve(process.cwd(), 'artifacts/catalog-generic-subtopicos-ranking.json');
  writeFileSync(out, JSON.stringify(report, null, 2), 'utf8');

  console.log('[generic-ranking] Catálogo:', catalogTotal);
  console.log('[generic-ranking] Layout genérico:', genericTotal);
  console.log('[generic-ranking] Subtópicos distintos:', ranking.length);
  console.log('[generic-ranking] Top 10:');
  for (const row of ranking.slice(0, 10)) {
    console.log(`  ${row.count.toString().padStart(4)}  (${row.pct_of_generic}%)  ${row.subtopico}`);
  }
  console.log('[generic-ranking] Relatório:', out);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

#!/usr/bin/env tsx
/**
 * Auditoria: entries por guideline vs volume de questões no catálogo (por subtópico).
 * Uso: npx tsx scripts/audit-guideline-coverage.ts
 * Saída: artifacts/guideline-coverage-audit.json + .md
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

import {
  GUIDELINE_TABLES,
  SUBTOPICO_GUIDELINE_IDS,
  getGuidelineForSubtopico,
} from '@/lib/guidelines';

/** 41 subtópicos canônicos (CLAUDE.md §9). */
const CANONICAL_SUBTOPICOS = [
  'História da Enfermagem',
  'Noções de Anatomia',
  'Noções de Fisiologia',
  'Processo de Enfermagem',
  'Farmacodinâmica e Farmacocinética',
  'Cálculo de Administração de Medicamentos e Infusões',
  'Vias de Administração',
  'Cuidados na Administração de Medicamentos',
  'Verificação de Sinais Vitais',
  'Instalação e Manejo de Sondas',
  'Oxigenoterapia e Cuidados Respiratórios',
  'Curativos e Manejo de Feridas',
  'Punção Venosa e Cuidados com Cateteres',
  'Coleta de Exames Laboratoriais',
  'Mobilização e Posicionamento do Paciente',
  'Procedimentos Diversos',
  'Feridas e Queimaduras',
  'Processamento de Artigos e Produtos de Saúde',
  'Enfermagem em Central de Material e Esterilização (CME)',
  'Medidas de Prevenção e Precaução de Contato',
  'Infecções no Contexto da Biossegurança',
  'Segurança do Paciente',
  'Epidemiologia e Vigilância Epidemiológica',
  'Promoção à Saúde e Prevenção de Agravos',
  'Imunização',
  'Atenção Básica / Saúde da Família',
  'Infecções Sexualmente Transmissíveis (ISTs)',
  'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)',
  'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)',
  'Doenças Parasitárias e Zoonoses',
  'Outras Doenças e Questões Mescladas sobre Doenças Transmissíveis',
  'Questões Mescladas e Outras Doenças Agudas',
  'Doenças Respiratórias Crônicas (Asma, DPOC)',
  'Assistência Perioperatória (Inclui SRPA)',
  'Enfermagem em Centro Cirúrgico',
  'Urgências e Emergências',
  'Enfermagem do Trabalho',
  'Saúde Mental',
  'Saúde da Criança',
  'Saúde do Adolescente',
  'Saúde da Mulher',
] as const;

type QuestionCounts = Map<string, number>;

function loadCountsFromRegistryExport(): QuestionCounts {
  const path = resolve(process.cwd(), 'artifacts/subtopico-guideline-registry-export.json');
  if (!existsSync(path)) return new Map();
  const raw = readFileSync(path, 'utf8').replace(/^\uFEFF/, '');
  const jsonStart = raw.indexOf('{');
  if (jsonStart < 0) return new Map();
  try {
    const json = JSON.parse(raw.slice(jsonStart)) as {
      rows?: Array<{ subtopico: string; question_count: number }>;
    };
    const map = new Map<string, number>();
    for (const row of json.rows ?? []) {
      if (row.subtopico) map.set(row.subtopico.trim(), row.question_count ?? 0);
    }
    return map;
  } catch {
    return new Map();
  }
}

async function loadCountsFromCatalog(): Promise<QuestionCounts | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const PAGE = 500;
  let offset = 0;
  const map = new Map<string, number>();

  while (true) {
    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('conteudo_json')
      .order('modulo_slug', { ascending: true })
      .range(offset, offset + PAGE - 1);

    if (error) {
      console.warn('[audit] Catálogo indisponível:', error.message);
      return null;
    }

    const batch = data ?? [];
    if (batch.length === 0) break;

    for (const row of batch) {
      const raw = row.conteudo_json;
      if (!raw || typeof raw !== 'object') continue;
      const meta = (raw as Record<string, unknown>).meta;
      if (!meta || typeof meta !== 'object') continue;
      const s = (meta as Record<string, unknown>).subtopico;
      const sub = typeof s === 'string' && s.trim() ? s.trim() : '(sem subtópico)';
      map.set(sub, (map.get(sub) ?? 0) + 1);
    }

    offset += PAGE;
    if (batch.length < PAGE) break;
  }

  return map;
}

async function loadCountsFromSupabase(): Promise<QuestionCounts | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { data, error } = await supabase
    .from('subtopico_guideline_registry')
    .select('subtopico, question_count');

  if (error) {
    console.warn('[audit] Supabase indisponível:', error.message);
    return null;
  }

  const map = new Map<string, number>();
  for (const row of data ?? []) {
    if (row.subtopico) map.set(String(row.subtopico).trim(), Number(row.question_count) || 0);
  }
  return map;
}

function coverageBand(ratio: number | null): string {
  if (ratio === null) return 'sem_guideline';
  if (ratio >= 0.15) return 'adequado';
  if (ratio >= 0.08) return 'moderado';
  if (ratio >= 0.04) return 'baixo';
  return 'critico';
}

async function main() {
  const catalogCounts = await loadCountsFromCatalog();
  const registryCounts = await loadCountsFromSupabase();
  const exportCounts = loadCountsFromRegistryExport();
  const questionCounts = catalogCounts ?? registryCounts ?? exportCounts;
  const countsSource = catalogCounts
    ? 'modulos_estudo'
    : registryCounts
      ? 'subtopico_guideline_registry'
      : exportCounts.size
        ? 'registry-export'
        : 'none';

  const tableStats = Object.entries(GUIDELINE_TABLES)
    .map(([id, table]) => ({
      id,
      snapshot: table.snapshot,
      issuer: table.issuer,
      year: table.year,
      entries: table.entries.length,
    }))
    .sort((a, b) => b.entries - a.entries);

  const rows = CANONICAL_SUBTOPICOS.map((subtopico) => {
    const tableIds = SUBTOPICO_GUIDELINE_IDS[subtopico] ?? [];
    const merged = getGuidelineForSubtopico(subtopico);
    const questionCount = questionCounts.get(subtopico) ?? 0;
    const mergedEntries = merged?.entries.length ?? 0;
    const ratio = questionCount > 0 && mergedEntries > 0 ? mergedEntries / questionCount : null;

    return {
      subtopico,
      has_guideline: tableIds.length > 0,
      guideline_table_ids: tableIds,
      merged_entries: mergedEntries,
      question_count: questionCount,
      entries_per_100_questions: ratio !== null ? Number((ratio * 100).toFixed(2)) : null,
      coverage_band: coverageBand(ratio),
    };
  });

  const withGuideline = rows.filter((r) => r.has_guideline);
  const withoutGuideline = rows.filter((r) => !r.has_guideline);
  const critical = withGuideline.filter((r) => r.coverage_band === 'critico' || r.coverage_band === 'baixo');

  const report = {
    generated_at: new Date().toISOString(),
    counts_source: countsSource,
    summary: {
      canonical_subtopicos: CANONICAL_SUBTOPICOS.length,
      with_guideline: withGuideline.length,
      without_guideline: withoutGuideline.length,
      guideline_tables: tableStats.length,
      total_entries_all_tables: tableStats.reduce((s, t) => s + t.entries, 0),
      total_questions_mapped: rows.reduce((s, r) => s + r.question_count, 0),
      low_coverage_count: critical.length,
    },
    tables: tableStats,
    by_subtopico: rows.sort((a, b) => b.question_count - a.question_count),
    without_guideline: withoutGuideline.map((r) => r.subtopico),
    low_coverage_priority: critical
      .sort((a, b) => b.question_count - a.question_count)
      .slice(0, 15),
  };

  const jsonPath = resolve(process.cwd(), 'artifacts/guideline-coverage-audit.json');
  writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');

  const mdLines = [
    '# Auditoria — Guidelines × Catálogo',
    '',
    `Gerado em: ${report.generated_at}`,
    `Fonte de contagens: **${countsSource}**`,
    '',
    '## Resumo',
    '',
    `| Métrica | Valor |`,
    `|---------|------:|`,
    `| Subtópicos canônicos | ${report.summary.canonical_subtopicos} |`,
    `| Com guideline mapeada | ${report.summary.with_guideline} |`,
    `| Sem guideline | ${report.summary.without_guideline} |`,
    `| Tabelas em lib/guidelines | ${report.summary.guideline_tables} |`,
    `| Total de entries | ${report.summary.total_entries_all_tables} |`,
    `| Questões no catálogo (soma) | ${report.summary.total_questions_mapped} |`,
    `| Subtópicos com cobertura baixa/crítica | ${report.summary.low_coverage_count} |`,
    '',
    '## Por subtópico (ordenado por volume)',
    '',
    '| Subtópico | Questões | Entries | Entries/100q | Banda |',
    '|-----------|--------:|--------:|-------------:|-------|',
    ...report.by_subtopico.map(
      (r) =>
        `| ${r.subtopico} | ${r.question_count} | ${r.merged_entries} | ${r.entries_per_100_questions ?? '—'} | ${r.coverage_band} |`,
    ),
    '',
    '## Tabelas (entries por arquivo)',
    '',
    '| ID | Entries | Snapshot |',
    '|----|--------:|----------|',
    ...tableStats.map((t) => `| \`${t.id}\` | ${t.entries} | ${t.snapshot} |`),
  ];

  const mdPath = resolve(process.cwd(), 'artifacts/guideline-coverage-audit.md');
  writeFileSync(mdPath, mdLines.join('\n'), 'utf8');

  console.log('[audit] Fonte contagens:', countsSource);
  console.log('[audit] Tabelas:', report.summary.guideline_tables, '| Entries:', report.summary.total_entries_all_tables);
  console.log('[audit] Sem guideline:', withoutGuideline.map((r) => r.subtopico).join(', ') || '(nenhum)');
  console.log('[audit] Top 5 prioridade (volume × baixa cobertura):');
  for (const r of report.low_coverage_priority.slice(0, 5)) {
    console.log(`  ${r.question_count}q / ${r.merged_entries}e — ${r.subtopico}`);
  }
  console.log('[audit] JSON:', jsonPath);
  console.log('[audit] MD:', mdPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

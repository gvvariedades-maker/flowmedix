#!/usr/bin/env tsx
/**
 * Cruza inventário taxonomia × program-status × registry L3 → matriz de prioridade.
 *
 *   npm run classify:l3-matrix
 */
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { CANONICAL_SUBTOPICOS } from '@/lib/catalogMigration/canonicalSubtopicos';
import { DEFAULT_CATCH_ALL_BUCKETS } from '@/lib/catalogMigration/subtopicoInventory';
import { hasSubtopicBranchDesign } from '@/lib/slides/pedagogicalBranch';

type ProgramRow = {
  subtopico: string;
  onda?: string;
  legacy_builder?: boolean;
  in_registry?: boolean;
  pacote_prefix?: string;
  total_slugs?: number;
  handcraft_applied?: number;
  status?: string;
  production_status?: string;
  pct_handcraft?: number;
};

type InventoryLabel = { label: string; count: number };

type MatrixRow = {
  subtopico: string;
  slugs_vitrine: number;
  onda: string;
  production_status: string;
  in_registry: boolean;
  pct_handcraft: number | null;
  catch_all_rows: number;
  classify_antes_l3: 'obrigatorio' | 'recomendado' | 'nao';
  classify_motivo: string;
  l3_branch_map: boolean;
  l3_cluster_report: boolean;
  l3_briefs: number;
  proximo_trigger: string;
};

function readJson<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

function countL3Briefs(pacotePrefix?: string): number {
  if (!pacotePrefix) return 0;
  const dir = resolve(process.cwd(), 'artifacts');
  if (!existsSync(dir)) return 0;
  const prefix = `l3-brief-${pacotePrefix}-`;
  return readdirSync(dir).filter((f) => f.startsWith(prefix) && f.endsWith('.md')).length;
}

function classifyGate(
  subtopico: string,
  catchAllRows: number,
  productionStatus: string,
  inRegistry: boolean,
): Pick<MatrixRow, 'classify_antes_l3' | 'classify_motivo'> {
  const isCatchAllBucket = (DEFAULT_CATCH_ALL_BUCKETS as readonly string[]).includes(subtopico);

  if (catchAllRows > 0 && isCatchAllBucket && productionStatus !== 'production_ready') {
    return {
      classify_antes_l3: 'obrigatorio',
      classify_motivo: `${catchAllRows} slugs em bucket catch-all — inferir para subtópico específico antes de L3/handcraft`,
    };
  }

  if (catchAllRows > 0 && isCatchAllBucket && productionStatus === 'production_ready') {
    return {
      classify_antes_l3: 'recomendado',
      classify_motivo: `${catchAllRows} slugs ainda no rótulo catch-all — drenar mis-tags antes de escalar handcraft`,
    };
  }

  if (!inRegistry && catchAllRows === 0) {
    return {
      classify_antes_l3: 'nao',
      classify_motivo: 'Taxonomia limpa (sem catch-all neste rótulo); ir direto para Mapeamento L3 na Fase 0',
    };
  }

  if (inRegistry && productionStatus === 'production_ready') {
    return {
      classify_antes_l3: 'nao',
      classify_motivo: 'Pacote fechado — Classify só se repair pontual (Slug:)',
    };
  }

  return {
    classify_antes_l3: 'nao',
    classify_motivo: 'Sem drift catch-all detectado no inventário',
  };
}

function proximoTrigger(row: MatrixRow): string {
  if (row.classify_antes_l3 === 'obrigatorio') {
    return `Classify: ${row.subtopico} → Mapeamento L3: ${row.subtopico}`;
  }
  if (row.production_status === 'production_ready') {
    return 'audit:subtopico-health (ou repair Slug:)';
  }
  if (row.in_registry && row.pct_handcraft !== null && row.pct_handcraft < 100) {
    return `Mapeamento L3: ${row.subtopico} (se briefs incompletos) → Pipeline completo: ${row.subtopico}`;
  }
  if (!row.in_registry) {
    return `Mapeamento L3: ${row.subtopico} → Pipeline completo: ${row.subtopico}`;
  }
  if (row.l3_cluster_report && row.l3_briefs === 0) {
    return `Mapeamento L3: ${row.subtopico} (Fase 3b briefs pendentes)`;
  }
  return `Mapeamento L3: ${row.subtopico}`;
}

function main(): void {
  const root = process.cwd();
  const program = readJson<{ rows: ProgramRow[] }>(
    resolve(root, 'artifacts/catalog-program-status.json'),
  );
  const inventory = readJson<{
    by_titulo_aula: InventoryLabel[];
    catch_all_buckets: InventoryLabel[];
  }>(resolve(root, 'artifacts/subtopico-inventory-audit.json'));
  const registry = readJson<{ pacotes?: Record<string, { cluster_report?: string | null; pacote_prefix?: string }> }>(
    resolve(root, 'data/catalog-migration/handcraft-registry.json'),
  );

  if (!program?.rows || !inventory) {
    console.error('[classify:l3-matrix] Faltam artifacts/catalog-program-status.json ou subtopico-inventory-audit.json');
    process.exitCode = 1;
    return;
  }

  const tituloCount = new Map(inventory.by_titulo_aula.map((r) => [r.label, r.count]));
  const catchAllCount = new Map(inventory.catch_all_buckets.map((r) => [r.label, r.count]));
  const programByName = new Map(program.rows.map((r) => [r.subtopico, r]));

  const rows: MatrixRow[] = CANONICAL_SUBTOPICOS.map((subtopico) => {
    const prog = programByName.get(subtopico);
    const reg = registry?.pacotes?.[subtopico];
    const pacotePrefix = prog?.pacote_prefix ?? reg?.pacote_prefix;
    const productionStatus = prog?.production_status ?? 'none';
    const inRegistry = prog?.in_registry ?? Boolean(reg);
    const catchAllRows = catchAllCount.get(subtopico) ?? 0;
    const classify = classifyGate(subtopico, catchAllRows, productionStatus, inRegistry);

    const matrixRow: MatrixRow = {
      subtopico,
      slugs_vitrine: tituloCount.get(subtopico) ?? 0,
      onda: prog?.onda ?? '—',
      production_status: productionStatus,
      in_registry: inRegistry,
      pct_handcraft: prog?.pct_handcraft ?? null,
      catch_all_rows: catchAllRows,
      ...classify,
      l3_branch_map: hasSubtopicBranchDesign(subtopico),
      l3_cluster_report: Boolean(reg?.cluster_report),
      l3_briefs: countL3Briefs(pacotePrefix),
      proximo_trigger: '',
    };
    matrixRow.proximo_trigger = proximoTrigger(matrixRow);
    return matrixRow;
  });

  const summary = {
    total_canonicos: 41,
    total_slugs_vitrine: inventory.by_titulo_aula.reduce((n, r) => n + r.count, 0),
    catch_all_total: [...catchAllCount.values()].reduce((n, c) => n + c, 0),
    classify_obrigatorio: rows.filter((r) => r.classify_antes_l3 === 'obrigatorio').length,
    classify_recomendado: rows.filter((r) => r.classify_antes_l3 === 'recomendado').length,
    production_ready: rows.filter((r) => r.production_status === 'production_ready').length,
    sem_pacote_registry: rows.filter((r) => !r.in_registry).length,
    l3_cluster_pendente: rows.filter((r) => r.in_registry && !r.l3_cluster_report).length,
    vitrine_vazia: rows.filter((r) => r.slugs_vitrine === 0).length,
  };

  const report = {
    generated_at: new Date().toISOString(),
    sources: [
      'artifacts/subtopico-inventory-audit.json',
      'artifacts/catalog-program-status.json',
      'data/catalog-migration/handcraft-registry.json',
      'artifacts/l3-brief-*.md',
    ],
    summary,
    rows,
  };

  const artifactsDir = resolve(root, 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });
  const jsonPath = resolve(artifactsDir, 'classify-l3-priority-matrix.json');
  writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');

  const md = renderMarkdown(report);
  const mdPath = resolve(artifactsDir, 'classify-l3-priority-matrix.md');
  writeFileSync(mdPath, md, 'utf8');

  console.log('[classify:l3-matrix] summary:', JSON.stringify(summary));
  console.log(`[classify:l3-matrix] json=${jsonPath}`);
  console.log(`[classify:l3-matrix] md=${mdPath}`);
}

function renderMarkdown(report: {
  generated_at: string;
  summary: Record<string, number>;
  rows: MatrixRow[];
}): string {
  const s = report.summary;
  const lines: string[] = [
    '# Matriz Classify × L3 — 41 subtópicos',
    '',
    `Gerado em: ${report.generated_at}`,
    '',
    '## Resumo executivo',
    '',
    `| Métrica | Valor |`,
    `|---------|-------|`,
    `| Slugs na vitrine (soma titulo_aula) | ${s.total_slugs_vitrine} |`,
    `| Catch-all (titulo_aula em bucket catch-all) | ${s.catch_all_total} |`,
    `| Classify **obrigatório** antes de L3 | ${s.classify_obrigatorio} subtópicos |`,
    `| Classify **recomendado** (drenar mis-tags) | ${s.classify_recomendado} subtópicos |`,
    `| production_ready | ${s.production_ready}/41 |`,
    `| Sem pacote no registry | ${s.sem_pacote_registry} |`,
    `| Com registry mas sem cluster_report | ${s.l3_cluster_pendente} |`,
    `| Prateleiras vazias (0 slugs) | ${s.vitrine_vazia} |`,
    '',
    '## Catch-all buckets com slugs (Classify prioritário)',
    '',
  ];

  const catchAll = report.rows.filter((r) => r.catch_all_rows > 0);
  if (catchAll.length === 0) {
    lines.push('_Nenhum._');
  } else {
    lines.push('| Subtópico | Slugs catch-all | Classify | Motivo |');
    lines.push('|-----------|-----------------|----------|--------|');
    for (const r of catchAll) {
      lines.push(`| ${r.subtopico} | ${r.catch_all_rows} | ${r.classify_antes_l3} | ${r.classify_motivo} |`);
    }
  }

  lines.push('', '## Matriz completa (41 subtópicos)', '');
  lines.push(
    '| Subtópico | Slugs | Onda | Status | %HC | Classify | L3 map | Cluster | Briefs | Próximo trigger |',
  );
  lines.push(
    '|-----------|-------|------|--------|-----|----------|--------|---------|--------|-----------------|',
  );

  for (const r of report.rows) {
    const pct = r.pct_handcraft !== null ? `${r.pct_handcraft}%` : '—';
    lines.push(
      `| ${r.subtopico} | ${r.slugs_vitrine} | ${r.onda} | ${r.production_status} | ${pct} | ${r.classify_antes_l3} | ${r.l3_branch_map ? 'sim' : 'não'} | ${r.l3_cluster_report ? 'sim' : 'não'} | ${r.l3_briefs} | ${r.proximo_trigger} |`,
    );
  }

  lines.push('', '## Ordem sugerida (próximos 10)', '');
  const priority = [...report.rows]
    .filter((r) => r.production_status !== 'production_ready')
    .sort((a, b) => {
      const rank = (r: MatrixRow) =>
        r.classify_antes_l3 === 'obrigatorio' ? 0 : r.classify_antes_l3 === 'recomendado' ? 1 : 2;
      const dr = rank(a) - rank(b);
      if (dr !== 0) return dr;
      return b.slugs_vitrine - a.slugs_vitrine;
    })
    .slice(0, 10);

  let i = 1;
  for (const r of priority) {
    lines.push(`${i}. **${r.subtopico}** (${r.slugs_vitrine} slugs) — ${r.proximo_trigger}`);
    i += 1;
  }

  return lines.join('\n');
}

main();

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

import type { SupabaseClient } from '@supabase/supabase-js';

import { CATALOG_MIGRATION_ROOT, loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  auditPremiumQuestao,
  premiumGateErrors,
  type PremiumGateIssue,
} from '@/lib/catalogMigration/premiumGate';

export type PremiumAuditRow = {
  source: 'local' | 'supabase';
  lote?: string;
  slug: string;
  subtopico?: string;
  issues: PremiumGateIssue[];
};

export type PremiumCatalogAuditReport = {
  generated_at: string;
  source: 'local' | 'supabase';
  filters: {
    lotes?: string[];
    prefix?: string;
    exclude_prefixes?: string[];
    include_warn: boolean;
  };
  scanned: number;
  with_issues: number;
  error_rows: number;
  ok_rows: number;
  by_issue_code: Record<string, number>;
  by_lote_prefix: Record<string, { scanned: number; errors: number }>;
  rows: PremiumAuditRow[];
};

export type ScanLocalPremiumCatalogOptions = {
  onlyLote?: string;
  prefix?: string;
  excludePrefixes?: string[];
  includeWarn?: boolean;
  /** Limite de linhas com problema no relatório (0 = todas). */
  rowLimit?: number;
};

export type ScanSupabasePremiumCatalogOptions = {
  includeWarn?: boolean;
  maxRows?: number;
  rowLimit?: number;
  /** Filtrar por titulo_aula / subtopico parcial. */
  subtopicoContains?: string;
  /** Filtrar por modulo_slug parcial (ex.: vias-de-administracao). */
  slugContains?: string;
};

const PAGE_SIZE = 500;

function listLotes(): string[] {
  if (!existsSync(CATALOG_MIGRATION_ROOT)) return [];
  return readdirSync(CATALOG_MIGRATION_ROOT)
    .filter((name) => {
      const full = resolve(CATALOG_MIGRATION_ROOT, name);
      return statSync(full).isDirectory();
    })
    .sort();
}

function lotePrefix(lote: string): string {
  const m = lote.match(/^(.+)-lote-\d+$/);
  return m?.[1] ?? lote;
}

function shouldExcludeLote(lote: string, excludePrefixes?: string[]): boolean {
  if (!excludePrefixes?.length) return false;
  return excludePrefixes.some((p) => lote.startsWith(p));
}

function subtopicoFromPayload(raw: unknown): string | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const meta = (raw as { meta?: { subtopico?: string } }).meta;
  return meta?.subtopico?.trim() || undefined;
}

function bumpCount(map: Record<string, number>, key: string, n = 1): void {
  map[key] = (map[key] ?? 0) + n;
}

function buildReport(
  source: 'local' | 'supabase',
  scanned: number,
  rows: PremiumAuditRow[],
  filters: PremiumCatalogAuditReport['filters'],
  rowLimit: number,
): PremiumCatalogAuditReport {
  const errorRows = rows.filter((r) => r.issues.some((i) => i.severity === 'error'));
  const by_issue_code: Record<string, number> = {};
  const by_lote_prefix: Record<string, { scanned: number; errors: number }> = {};

  for (const row of rows) {
    for (const issue of row.issues) {
      if (issue.severity === 'error') bumpCount(by_issue_code, issue.code);
    }
    if (source === 'local' && row.lote) {
      const key = lotePrefix(row.lote);
      if (!by_lote_prefix[key]) by_lote_prefix[key] = { scanned: 0, errors: 0 };
      by_lote_prefix[key].errors += 1;
    }
  }

  const limitedRows = rowLimit > 0 ? rows.slice(0, rowLimit) : rows;

  return {
    generated_at: new Date().toISOString(),
    source,
    filters,
    scanned,
    with_issues: rows.length,
    error_rows: errorRows.length,
    ok_rows: scanned - new Set(errorRows.map((r) => r.slug)).size,
    by_issue_code,
    by_lote_prefix,
    rows: limitedRows,
  };
}

export function scanLocalPremiumCatalog(
  options: ScanLocalPremiumCatalogOptions = {},
): PremiumCatalogAuditReport {
  const includeWarn = options.includeWarn ?? false;
  const rowLimit = options.rowLimit ?? 0;
  let lotes = listLotes();

  if (options.onlyLote) lotes = lotes.filter((l) => l === options.onlyLote);
  if (options.prefix) lotes = lotes.filter((l) => l.startsWith(options.prefix!));
  if (options.excludePrefixes?.length) {
    lotes = lotes.filter((l) => !shouldExcludeLote(l, options.excludePrefixes));
  }

  const issueRows: PremiumAuditRow[] = [];
  let scanned = 0;

  for (const lote of lotes) {
    const dir = loteQuestionsDir(lote);
    if (!existsSync(dir)) continue;

    const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
    for (const file of files.sort()) {
      const slug = file.replace(/\.json$/, '');
      scanned += 1;
      let raw: unknown;
      try {
        raw = JSON.parse(readFileSync(resolve(dir, file), 'utf8'));
      } catch (err) {
        issueRows.push({
          source: 'local',
          lote,
          slug,
          issues: [
            {
              code: 'json_invalido',
              severity: 'error',
              message: err instanceof Error ? err.message : 'JSON inválido',
            },
          ],
        });
        continue;
      }

      const issues = auditPremiumQuestao(raw as Record<string, unknown>).filter(
        (i) => includeWarn || i.severity === 'error',
      );
      if (issues.length > 0) {
        issueRows.push({
          source: 'local',
          lote,
          slug,
          subtopico: subtopicoFromPayload(raw),
          issues,
        });
      }
    }
  }

  // recount by_lote_prefix with scanned counts
  const by_lote_prefix: Record<string, { scanned: number; errors: number }> = {};
  for (const lote of lotes) {
    const dir = loteQuestionsDir(lote);
    if (!existsSync(dir)) continue;
    const key = lotePrefix(lote);
    const count = readdirSync(dir).filter((f) => f.endsWith('.json')).length;
    if (!by_lote_prefix[key]) by_lote_prefix[key] = { scanned: 0, errors: 0 };
    by_lote_prefix[key].scanned += count;
  }
  for (const row of issueRows) {
    if (!row.lote) continue;
    const key = lotePrefix(row.lote);
    if (!by_lote_prefix[key]) by_lote_prefix[key] = { scanned: 0, errors: 0 };
    if (row.issues.some((i) => i.severity === 'error')) {
      by_lote_prefix[key].errors += 1;
    }
  }

  const report = buildReport(
    'local',
    scanned,
    issueRows,
    {
      lotes,
      prefix: options.prefix,
      exclude_prefixes: options.excludePrefixes,
      include_warn: includeWarn,
    },
    rowLimit,
  );
  report.by_lote_prefix = by_lote_prefix;
  return report;
}

export async function scanSupabasePremiumCatalog(
  supabase: SupabaseClient,
  options: ScanSupabasePremiumCatalogOptions = {},
): Promise<PremiumCatalogAuditReport> {
  const includeWarn = options.includeWarn ?? false;
  const rowLimit = options.rowLimit ?? 500;
  const maxRows = options.maxRows ?? 0;
  const subtopicoFilter = options.subtopicoContains?.trim().toLowerCase();
  const slugFilter = options.slugContains?.trim().toLowerCase();

  const issueRows: PremiumAuditRow[] = [];
  let scanned = 0;
  let offset = 0;
  const by_subtopico: Record<string, { scanned: number; errors: number }> = {};

  while (true) {
    if (maxRows > 0 && scanned >= maxRows) break;

    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('modulo_slug, titulo_aula, conteudo_json')
      .order('modulo_slug', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) throw new Error(`Falha ao ler modulos_estudo: ${error.message}`);

    const batch = data ?? [];
    if (batch.length === 0) break;

    for (const row of batch) {
      if (maxRows > 0 && scanned >= maxRows) break;

      if (slugFilter && !`${row.modulo_slug ?? ''}`.toLowerCase().includes(slugFilter)) {
        continue;
      }

      const subtopico =
        subtopicoFromPayload(row.conteudo_json) ?? row.titulo_aula ?? undefined;
      if (
        subtopicoFilter &&
        !`${subtopico ?? ''}`.toLowerCase().includes(subtopicoFilter)
      ) {
        continue;
      }

      scanned += 1;
      const groupKey = subtopico ?? '(sem subtópico)';
      if (!by_subtopico[groupKey]) by_subtopico[groupKey] = { scanned: 0, errors: 0 };
      by_subtopico[groupKey].scanned += 1;

      const gateIssues = auditPremiumQuestao(
        (row.conteudo_json ?? {}) as Record<string, unknown>,
      ).filter((i) => includeWarn || i.severity === 'error');

      if (gateIssues.length > 0) {
        issueRows.push({
          source: 'supabase',
          slug: row.modulo_slug,
          subtopico,
          issues: gateIssues,
        });
        if (gateIssues.some((i) => i.severity === 'error')) {
          by_subtopico[groupKey].errors += 1;
        }
      }
    }

    offset += PAGE_SIZE;
    if (batch.length < PAGE_SIZE) break;
  }

  const report = buildReport(
    'supabase',
    scanned,
    issueRows,
    { include_warn: includeWarn },
    rowLimit,
  );

  report.by_lote_prefix = by_subtopico;

  return report;
}

/** Atalho: só erros bloqueantes (apply-lote). */
export function hasPremiumGateErrors(payload: unknown): boolean {
  return premiumGateErrors((payload ?? {}) as Record<string, unknown>).length > 0;
}

export function printPremiumAuditSummary(
  report: PremiumCatalogAuditReport,
  label: string,
): void {
  console.log(
    `[${label}] scanned=${report.scanned} com_problema=${report.with_issues} erros=${report.error_rows} ok≈${report.scanned - report.error_rows}`,
  );

  const codes = Object.entries(report.by_issue_code).sort((a, b) => b[1] - a[1]);
  if (codes.length > 0) {
    console.log(`[${label}] por código:`);
    for (const [code, n] of codes) {
      console.log(`  ${code}: ${n}`);
    }
  }

  const prefixes = Object.entries(report.by_lote_prefix)
    .sort((a, b) => b[1].errors - a[1].errors)
    .slice(0, 15);
  if (prefixes.length > 0) {
    console.log(`[${label}] top grupos (erros / escaneados):`);
    for (const [name, stats] of prefixes) {
      if (stats.errors > 0) {
        console.log(`  ${name}: ${stats.errors} erros (${stats.scanned} escaneados)`);
      }
    }
  }

  for (const row of report.rows) {
    for (const issue of row.issues) {
      const loc = row.lote ? `${row.lote}/${row.slug}` : row.slug;
      console.log(`  [${issue.severity}] ${loc} — ${issue.code}`);
    }
  }

  if (report.error_rows === 0) {
    console.log(`[${label}] OK — nenhuma questão genérica/stub ou com molde quebrado.`);
  }
}

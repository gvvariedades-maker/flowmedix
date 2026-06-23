/**
 * Fila de revisão premium — catálogo Supabase ou relatório ai:generate local.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

import type { SupabaseClient } from '@supabase/supabase-js';

import { premiumGateErrors } from '@/lib/catalogMigration/premiumGate';
import { validateQuestaoForWrite } from '@/lib/questaoSpec';

export type ReviewQueueItem = {
  modulo_slug: string;
  titulo_aula: string | null;
  banca: string | null;
  subtopico: string | null;
  issue_count: number;
  issues: string[];
  source: 'supabase' | 'ai-report';
  ai_score?: number;
  ai_status?: string;
};

export type ReviewQueueResult = {
  generated_at: string;
  source: 'supabase' | 'ai-report';
  total_scanned: number;
  total_pending: number;
  items: ReviewQueueItem[];
  lote?: string;
};

const PAGE_SIZE = 200;
const MAX_ISSUES_PER_ITEM = 5;

type ModuloRow = {
  modulo_slug: string;
  titulo_aula: string | null;
  banca: string | null;
  conteudo_json: unknown;
};

function collectWriteIssues(payload: unknown): string[] {
  const issues: string[] = [];
  const spec = validateQuestaoForWrite(payload, { premiumGate: true, goldenLint: true });
  if (!spec.ok) {
    issues.push(...spec.errors.map((e) => `${e.layer}/${e.code}: ${e.message}`));
  }
  issues.push(...spec.warnings.map((w) => `${w.layer}/${w.code}: ${w.message}`));
  const gate = premiumGateErrors(payload as Record<string, unknown>);
  issues.push(...gate.map((g) => `premium_gate/${g.code}: ${g.message}`));
  return [...new Set(issues)];
}

function subtopicoFromPayload(raw: unknown): string | null {
  if (!raw || typeof raw !== 'object') return null;
  const meta = (raw as { meta?: { subtopico?: string } }).meta;
  return meta?.subtopico?.trim() || null;
}

function matchesSubtopico(payload: unknown, tituloAula: string | null, filter: string): boolean {
  const needle = filter.trim().toLowerCase();
  if (!needle) return true;
  const fromMeta = subtopicoFromPayload(payload)?.toLowerCase();
  if (fromMeta?.includes(needle) || needle.includes(fromMeta ?? '')) return true;
  return (tituloAula ?? '').toLowerCase().includes(needle);
}

export async function scanSupabaseReviewQueue(
  supabase: SupabaseClient,
  options: { subtopico?: string; limit?: number; offset?: number } = {},
): Promise<ReviewQueueResult> {
  const limit = Math.min(Math.max(options.limit ?? 30, 1), 100);
  const offset = Math.max(options.offset ?? 0, 0);
  const subtopicoFilter = options.subtopico?.trim() ?? '';

  const pending: ReviewQueueItem[] = [];
  let scanned = 0;
  let page = 0;

  while (pending.length < offset + limit) {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('modulo_slug, titulo_aula, banca, conteudo_json')
      .order('modulo_slug', { ascending: true })
      .range(from, to);

    if (error) throw error;
    const batch = (data ?? []) as ModuloRow[];
    if (batch.length === 0) break;

    for (const row of batch) {
      scanned += 1;
      const payload = row.conteudo_json;
      if (!matchesSubtopico(payload, row.titulo_aula, subtopicoFilter)) continue;

      const issues = collectWriteIssues(payload);
      if (issues.length === 0) continue;

      pending.push({
        modulo_slug: row.modulo_slug,
        titulo_aula: row.titulo_aula,
        banca: row.banca,
        subtopico: subtopicoFromPayload(payload) ?? row.titulo_aula,
        issue_count: issues.length,
        issues: issues.slice(0, MAX_ISSUES_PER_ITEM),
        source: 'supabase',
      });
    }

    if (batch.length < PAGE_SIZE) break;
    page += 1;
    if (page > 200) break;
  }

  const items = pending.slice(offset, offset + limit);

  return {
    generated_at: new Date().toISOString(),
    source: 'supabase',
    total_scanned: scanned,
    total_pending: pending.length,
    items,
  };
}

type AiReportResult = {
  slug: string;
  status: string;
  score?: number;
  issues?: string[];
  payload?: Record<string, unknown>;
};

type AiReportFile = {
  lote: string;
  results: AiReportResult[];
};

export function listAvailableAiReports(): string[] {
  const dir = resolve(process.cwd(), 'artifacts', 'ai-generation');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('-report.json'))
    .map((f) => f.replace(/-report\.json$/, ''))
    .sort();
}

export function loadAiReportReviewQueue(
  lote: string,
  options: { limit?: number; offset?: number; status?: 'needs_review' | 'failed' | 'all' } = {},
): ReviewQueueResult {
  const reportPath = resolve(process.cwd(), 'artifacts', 'ai-generation', `${lote}-report.json`);
  if (!existsSync(reportPath)) {
    throw new Error(`Relatório não encontrado: ${reportPath}`);
  }

  const report = JSON.parse(readFileSync(reportPath, 'utf8')) as AiReportFile;
  const statusFilter = options.status ?? 'needs_review';

  let results = report.results ?? [];
  if (statusFilter !== 'all') {
    results = results.filter((r) => r.status === statusFilter);
  } else {
    results = results.filter((r) => r.status === 'needs_review' || r.status === 'failed');
  }

  const limit = Math.min(Math.max(options.limit ?? 30, 1), 100);
  const offset = Math.max(options.offset ?? 0, 0);
  const slice = results.slice(offset, offset + limit);

  const items: ReviewQueueItem[] = slice.map((r) => ({
    modulo_slug: r.slug,
    titulo_aula: null,
    banca: null,
    subtopico:
      (r.payload?.meta as { subtopico?: string } | undefined)?.subtopico ?? null,
    issue_count: r.issues?.length ?? 0,
    issues: (r.issues ?? []).slice(0, MAX_ISSUES_PER_ITEM),
    source: 'ai-report',
    ai_score: r.score,
    ai_status: r.status,
  }));

  return {
    generated_at: new Date().toISOString(),
    source: 'ai-report',
    total_scanned: report.results?.length ?? 0,
    total_pending: results.length,
    items,
    lote,
  };
}

export async function fetchQuestaoBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<{ payload: Record<string, unknown>; titulo_aula: string | null; banca: string | null } | null> {
  const { data, error } = await supabase
    .from('modulos_estudo')
    .select('conteudo_json, titulo_aula, banca')
    .eq('modulo_slug', slug)
    .maybeSingle();

  if (error) throw error;
  if (!data?.conteudo_json || typeof data.conteudo_json !== 'object') return null;

  return {
    payload: data.conteudo_json as Record<string, unknown>,
    titulo_aula: data.titulo_aula,
    banca: data.banca,
  };
}

export function loadQuestaoFromAiReport(
  lote: string,
  slug: string,
): { payload: Record<string, unknown>; issues: string[]; ai_score?: number } | null {
  const reportPath = resolve(process.cwd(), 'artifacts', 'ai-generation', `${lote}-report.json`);
  if (!existsSync(reportPath)) return null;

  const report = JSON.parse(readFileSync(reportPath, 'utf8')) as AiReportFile;
  const hit = report.results?.find((r) => r.slug === slug);
  if (!hit?.payload) return null;

  return {
    payload: hit.payload,
    issues: hit.issues ?? [],
    ai_score: hit.score,
  };
}

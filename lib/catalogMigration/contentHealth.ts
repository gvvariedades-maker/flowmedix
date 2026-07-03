/**
 * L5 — saúde de conteúdo: error_reports + sessões por subtópico.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export type ContentHealthSlo = {
  open_p0: number;
  open_p1: number;
  open_p1_max: number;
  report_rate_max_pct: number;
  min_sessions_30d: number;
  sessions_30d: number;
  report_rate_pct: number;
};

export type ErrorReportRow = {
  id: string;
  modulo_slug: string;
  priority: string;
  status: string;
  created_at: string;
  metadata?: { meta_subtopico?: string } | null;
};

export type SubtopicoContentHealth = {
  subtopico: string;
  sessions_30d: number;
  open_reports: { p0: number; p1: number; p2: number; p3: number; total: number };
  report_rate_pct: number;
  top_reported_slugs: { slug: string; count: number }[];
  slo: ContentHealthSlo;
  pass: boolean;
  blockers: string[];
};

export type ContinuousContentHealth = SubtopicoContentHealth & {
  should_block: boolean;
  alerts: string[];
  repair_queue: { slug: string; report_count: number }[];
  stale_p0_count: number;
};

const OPEN_STATUSES = ['novo', 'triagem'] as const;

/** Report só entra no health do subtópico quando metadata.meta_subtopico casa com o pacote. */
export function reportMatchesSubtopico(
  metaSubtopico: string | undefined | null,
  subtopico: string,
): boolean {
  const metaSub = metaSubtopico?.toLowerCase().trim() ?? '';
  if (!metaSub) return false;
  const subLower = subtopico.toLowerCase();
  return metaSub.includes(subLower) || subLower.includes(metaSub);
}

export async function fetchSessions30dBySubtopico(
  supabase: SupabaseClient,
  subtopico: string,
): Promise<number> {
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const sinceIso = since.toISOString();

  const { count, error } = await supabase
    .from('historico_questoes')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', sinceIso)
    .filter('conteudo_json->meta->>subtopico', 'eq', subtopico);

  if (error) {
    const { count: fallback } = await supabase
      .from('historico_questoes')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', sinceIso);
    return fallback ?? 0;
  }
  return count ?? 0;
}

export async function fetchOpenReportsBySubtopico(
  supabase: SupabaseClient,
  subtopico: string,
): Promise<{
  byPriority: Record<string, number>;
  bySlug: Map<string, number>;
  total: number;
}> {
  const { data, error } = await supabase
    .from('error_reports')
    .select('modulo_slug, priority, metadata, status')
    .in('status', [...OPEN_STATUSES]);

  const byPriority: Record<string, number> = { p0: 0, p1: 0, p2: 0, p3: 0 };
  const bySlug = new Map<string, number>();

  if (error || !data) {
    return { byPriority, bySlug, total: 0 };
  }

  let total = 0;

  for (const row of data) {
    const meta = row.metadata as { meta_subtopico?: string } | null;
    if (!reportMatchesSubtopico(meta?.meta_subtopico, subtopico)) {
      continue;
    }
    const pri = String(row.priority ?? 'p2');
    byPriority[pri] = (byPriority[pri] ?? 0) + 1;
    total += 1;
    const slug = String(row.modulo_slug ?? '—');
    bySlug.set(slug, (bySlug.get(slug) ?? 0) + 1);
  }

  return { byPriority, bySlug, total };
}

export async function fetchOpenReportsDetailed(
  supabase: SupabaseClient,
  subtopico: string,
): Promise<ErrorReportRow[]> {
  const { data, error } = await supabase
    .from('error_reports')
    .select('id, modulo_slug, priority, status, created_at, metadata')
    .in('status', [...OPEN_STATUSES]);

  if (error || !data) return [];

  return data.filter((row) => {
    const meta = row.metadata as { meta_subtopico?: string } | null;
    return reportMatchesSubtopico(meta?.meta_subtopico, subtopico);
  }) as ErrorReportRow[];
}

export function aggregateReportsByPriority(
  reports: ErrorReportRow[],
): { byPriority: Record<string, number>; bySlug: Map<string, number>; total: number } {
  const byPriority: Record<string, number> = { p0: 0, p1: 0, p2: 0, p3: 0 };
  const bySlug = new Map<string, number>();
  let total = 0;

  for (const row of reports) {
    const pri = String(row.priority ?? 'p2');
    byPriority[pri] = (byPriority[pri] ?? 0) + 1;
    total += 1;
    const slug = String(row.modulo_slug ?? '—');
    bySlug.set(slug, (bySlug.get(slug) ?? 0) + 1);
  }

  return { byPriority, bySlug, total };
}

export function findStaleP0Reports(
  reports: ErrorReportRow[],
  hours = 24,
  now = Date.now(),
): ErrorReportRow[] {
  const cutoff = now - hours * 60 * 60 * 1000;
  return reports.filter((row) => {
    if (row.priority !== 'p0') return false;
    const created = new Date(row.created_at).getTime();
    return Number.isFinite(created) && created < cutoff;
  });
}

export function evaluateContinuousHealth(
  subtopico: string,
  sessions30d: number,
  open: { byPriority: Record<string, number>; bySlug: Map<string, number>; total: number },
  slo?: Partial<ContentHealthSlo & { p0_block_after_hours?: number }>,
  staleP0Count = 0,
): ContinuousContentHealth {
  const base = evaluateContentHealth(subtopico, sessions30d, open, slo);
  const alerts: string[] = [];
  const openP0 = open.byPriority.p0 ?? 0;
  const openP1 = open.byPriority.p1 ?? 0;

  if (openP0 > 0 && staleP0Count === 0) {
    alerts.push(`P0 abertos (${openP0}) — aguardando ${slo?.p0_block_after_hours ?? 24}h para block`);
  }
  if (openP1 > (slo?.open_p1_max ?? 2)) {
    alerts.push(`P1 alto: ${openP1} (máx ${slo?.open_p1_max ?? 2})`);
  }
  if (base.top_reported_slugs.length > 0 && base.top_reported_slugs[0]!.count >= 3) {
    alerts.push(`slug quente: ${base.top_reported_slugs[0]!.slug} (${base.top_reported_slugs[0]!.count} reports)`);
  }

  const repair_queue = base.top_reported_slugs.slice(0, 5).map(({ slug, count }) => ({
    slug,
    report_count: count,
  }));

  const should_block = staleP0Count > 0;

  return {
    ...base,
    should_block,
    alerts,
    repair_queue,
    stale_p0_count: staleP0Count,
  };
}

export function evaluateContentHealth(
  subtopico: string,
  sessions30d: number,
  open: { byPriority: Record<string, number>; bySlug: Map<string, number>; total: number },
  slo?: Partial<ContentHealthSlo>,
): SubtopicoContentHealth {
  const openP0 = open.byPriority.p0 ?? 0;
  const openP1 = open.byPriority.p1 ?? 0;
  const maxOpenP0 = slo?.open_p0 ?? 0;
  const reportRate =
    sessions30d > 0 ? Math.round((open.total / sessions30d) * 10000) / 100 : 0;

  const sloConfig: ContentHealthSlo = {
    open_p0: maxOpenP0,
    open_p1_max: slo?.open_p1_max ?? 2,
    report_rate_max_pct: slo?.report_rate_max_pct ?? 2,
    min_sessions_30d: slo?.min_sessions_30d ?? 100,
    sessions_30d: sessions30d,
    open_p1: openP1,
    report_rate_pct: reportRate,
  };

  const blockers: string[] = [];
  if (openP0 > maxOpenP0) {
    blockers.push(`P0 abertos: ${openP0} (máx ${maxOpenP0})`);
  }
  if (openP1 > sloConfig.open_p1_max) {
    blockers.push(`P1 abertos: ${openP1} (máx ${sloConfig.open_p1_max})`);
  }
  const warming = sessions30d < sloConfig.min_sessions_30d;
  if (!warming && reportRate > sloConfig.report_rate_max_pct) {
    blockers.push(
      `Taxa de reporte ${reportRate}% > ${sloConfig.report_rate_max_pct}%`,
    );
  }

  const top_reported_slugs = [...open.bySlug.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([slug, count]) => ({ slug, count }));

  return {
    subtopico,
    sessions_30d: sessions30d,
    open_reports: {
      p0: openP0,
      p1: openP1,
      p2: open.byPriority.p2 ?? 0,
      p3: open.byPriority.p3 ?? 0,
      total: open.total,
    },
    report_rate_pct: reportRate,
    top_reported_slugs,
    slo: sloConfig,
    pass: blockers.length === 0,
    blockers,
  };
}

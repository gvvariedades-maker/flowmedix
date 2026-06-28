import type { ErrorReportCategoryInput, ErrorReportPriorityInput } from '@/lib/validations';
import type { ErrorReportRow } from '@/lib/admin/errorReports';

const PRIORITY_RANK: Record<ErrorReportPriorityInput, number> = {
  p0: 0,
  p1: 1,
  p2: 2,
  p3: 3,
};

export type ErrorReportSlugGroup = {
  group_key: string;
  modulo_slug: string | null;
  reports: ErrorReportRow[];
  count: number;
  latest_at: string;
  open_count: number;
  slide_reports: number;
  categories: ErrorReportCategoryInput[];
  highest_priority: ErrorReportPriorityInput;
  latest_report: ErrorReportRow;
};

export function errorReportGroupKey(report: ErrorReportRow): string {
  const slug = report.modulo_slug?.trim();
  return slug ? slug : `no-slug:${report.id}`;
}

/** Agrupa reportes pelo mesmo `modulo_slug` (sem slug = grupo unitário). */
export function groupErrorReportsBySlug(reports: ErrorReportRow[]): ErrorReportSlugGroup[] {
  const map = new Map<string, ErrorReportRow[]>();

  for (const report of reports) {
    const key = errorReportGroupKey(report);
    const bucket = map.get(key) ?? [];
    bucket.push(report);
    map.set(key, bucket);
  }

  return Array.from(map.entries())
    .map(([group_key, items]) => {
      const sorted = [...items].sort((a, b) => b.created_at.localeCompare(a.created_at));
      const latest = sorted[0]!;
      const open_count = items.filter((r) => r.status === 'novo' || r.status === 'triagem').length;
      const slide_reports = items.filter((r) => r.category === 'slides').length;
      const categories = [...new Set(items.map((r) => r.category))];
      const highest_priority = items.reduce<ErrorReportPriorityInput>(
        (best, r) => (PRIORITY_RANK[r.priority] < PRIORITY_RANK[best] ? r.priority : best),
        'p3',
      );

      return {
        group_key,
        modulo_slug: latest.modulo_slug,
        reports: sorted,
        count: items.length,
        latest_at: latest.created_at,
        open_count,
        slide_reports,
        categories,
        highest_priority,
        latest_report: latest,
      };
    })
    .sort((a, b) => {
      if (b.open_count !== a.open_count) return b.open_count - a.open_count;
      if (b.count !== a.count) return b.count - a.count;
      return b.latest_at.localeCompare(a.latest_at);
    });
}

export function paginateErrorReportGroups(
  groups: ErrorReportSlugGroup[],
  page: number,
  pageSize: number,
): {
  groups: ErrorReportSlugGroup[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
    grouped: true;
    total_reports: number;
  };
} {
  const total = groups.length;
  const from = (page - 1) * pageSize;
  const pageGroups = groups.slice(from, from + pageSize);

  return {
    groups: pageGroups,
    pagination: {
      page,
      page_size: pageSize,
      total,
      total_pages: Math.max(1, Math.ceil(total / pageSize)),
      grouped: true,
      total_reports: groups.reduce((sum, group) => sum + group.count, 0),
    },
  };
}

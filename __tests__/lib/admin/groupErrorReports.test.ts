import {
  groupErrorReportsBySlug,
  paginateErrorReportGroups,
  type ErrorReportSlugGroup,
} from '@/lib/admin/groupErrorReports';
import type { ErrorReportRow } from '@/lib/admin/errorReports';

function makeReport(partial: Partial<ErrorReportRow> & Pick<ErrorReportRow, 'id' | 'description'>): ErrorReportRow {
  return {
    user_id: 'user-1',
    created_at: '2026-06-01T10:00:00.000Z',
    updated_at: '2026-06-01T10:00:00.000Z',
    context_type: 'lesson',
    modulo_slug: null,
    simulado_session_id: null,
    page_url: null,
    category: 'outro',
    status: 'novo',
    priority: 'p2',
    severity: null,
    metadata: {},
    admin_notes: null,
    resolved_at: null,
    resolved_by: null,
    ...partial,
  };
}

describe('groupErrorReportsBySlug', () => {
  it('agrupa reportes com o mesmo modulo_slug', () => {
    const reports = [
      makeReport({
        id: 'r1',
        modulo_slug: 'questao-a',
        created_at: '2026-06-01T10:00:00.000Z',
        category: 'slides',
      }),
      makeReport({
        id: 'r2',
        modulo_slug: 'questao-a',
        created_at: '2026-06-02T12:00:00.000Z',
        category: 'gabarito',
      }),
      makeReport({
        id: 'r3',
        modulo_slug: 'questao-b',
        created_at: '2026-06-03T08:00:00.000Z',
      }),
    ];

    const groups = groupErrorReportsBySlug(reports);

    expect(groups).toHaveLength(2);
    expect(groups[0].modulo_slug).toBe('questao-a');
    expect(groups[0].count).toBe(2);
    expect(groups[0].open_count).toBe(2);
    expect(groups[0].slide_reports).toBe(1);
    expect(groups[0].latest_report.id).toBe('r2');
    expect(groups[0].reports.map((r) => r.id)).toEqual(['r2', 'r1']);
  });

  it('mantém reportes sem slug em grupos unitários', () => {
    const reports = [
      makeReport({ id: 'r1', description: 'A' }),
      makeReport({ id: 'r2', description: 'B' }),
    ];

    const groups = groupErrorReportsBySlug(reports);
    expect(groups).toHaveLength(2);
    expect(groups.every((g) => g.count === 1)).toBe(true);
  });
});

describe('paginateErrorReportGroups', () => {
  it('pagina grupos preservando total de reports', () => {
    const groups: ErrorReportSlugGroup[] = Array.from({ length: 5 }, (_, i) => ({
      group_key: `slug-${i}`,
      modulo_slug: `slug-${i}`,
      reports: [makeReport({ id: `r${i}`, modulo_slug: `slug-${i}`, description: `d${i}` })],
      count: 1,
      latest_at: '2026-06-01T10:00:00.000Z',
      open_count: 1,
      slide_reports: 0,
      categories: ['outro'],
      highest_priority: 'p2',
      latest_report: makeReport({ id: `r${i}`, modulo_slug: `slug-${i}`, description: `d${i}` }),
    }));

    const page1 = paginateErrorReportGroups(groups, 1, 2);
    expect(page1.groups).toHaveLength(2);
    expect(page1.pagination.total).toBe(5);
    expect(page1.pagination.total_pages).toBe(3);
    expect(page1.pagination.total_reports).toBe(5);
    expect(page1.pagination.grouped).toBe(true);
  });
});

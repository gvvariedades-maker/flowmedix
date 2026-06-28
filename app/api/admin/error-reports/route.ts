import { NextRequest, NextResponse } from 'next/server';
import { groupErrorReportsBySlug, paginateErrorReportGroups } from '@/lib/admin/groupErrorReports';
import { requireAdminApi } from '@/lib/admin/requireAdmin';
import { logger } from '@/lib/logger';
import { AdminErrorReportListQuerySchema } from '@/lib/validations';
import type { z } from 'zod';

const ERROR_REPORT_SELECT =
  'id, user_id, created_at, updated_at, context_type, modulo_slug, simulado_session_id, page_url, category, status, priority, severity, description, metadata, admin_notes, resolved_at, resolved_by';

const GROUP_FETCH_CAP = 5000;

type ListQuery = z.infer<typeof AdminErrorReportListQuerySchema>;

function applyErrorReportFilters<T extends { eq: Function; gte: Function; lte: Function; or: Function }>(
  dbQuery: T,
  query: ListQuery,
): T {
  let next = dbQuery;
  if (query.status) next = next.eq('status', query.status) as T;
  if (query.priority) next = next.eq('priority', query.priority) as T;
  if (query.context_type) next = next.eq('context_type', query.context_type) as T;
  if (query.category) next = next.eq('category', query.category) as T;
  if (query.from) next = next.gte('created_at', query.from) as T;
  if (query.to) next = next.lte('created_at', query.to) as T;
  if (query.q) {
    const q = query.q.replaceAll(',', ' ').trim();
    if (q) {
      next = next.or(`description.ilike.%${q}%,modulo_slug.ilike.%${q}%`) as T;
    }
  }
  return next;
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  const queryRaw = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = AdminErrorReportListQuerySchema.safeParse(queryRaw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Parâmetros inválidos', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const query = parsed.data;
  const page = query.page;
  const pageSize = query.page_size;
  const filters = {
    status: query.status ?? null,
    priority: query.priority ?? null,
    context_type: query.context_type ?? null,
    category: query.category ?? null,
    q: query.q ?? null,
    from: query.from ?? null,
    to: query.to ?? null,
    group_by_slug: query.group_by_slug ?? false,
  };

  try {
    if (query.group_by_slug) {
      const filteredQuery = applyErrorReportFilters(
        auth.admin
          .from('error_reports')
          .select(ERROR_REPORT_SELECT)
          .order('created_at', { ascending: false }),
        query,
      );

      const { data, error } = await filteredQuery.limit(GROUP_FETCH_CAP);

      if (error) {
        logger.error('GET /api/admin/error-reports (grouped) falhou', error, {
          email: auth.email,
        });
        return NextResponse.json({ error: 'Erro ao listar reports' }, { status: 500 });
      }

      const grouped = groupErrorReportsBySlug(data ?? []);
      const { groups, pagination } = paginateErrorReportGroups(grouped, page, pageSize);

      return NextResponse.json({
        grouped: true,
        groups,
        reports: groups.map((group) => group.latest_report),
        pagination,
        filters,
      });
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let dbQuery = applyErrorReportFilters(
      auth.admin
        .from('error_reports')
        .select(ERROR_REPORT_SELECT, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to),
      query,
    );

    const { data, count, error } = await dbQuery;

    if (error) {
      logger.error('GET /api/admin/error-reports falhou', error, {
        email: auth.email,
      });
      return NextResponse.json({ error: 'Erro ao listar reports' }, { status: 500 });
    }

    return NextResponse.json({
      grouped: false,
      reports: data ?? [],
      pagination: {
        page,
        page_size: pageSize,
        total: count ?? 0,
        total_pages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
      },
      filters,
    });
  } catch (error) {
    logger.error('Erro inesperado em GET /api/admin/error-reports', error, {
      email: auth.email,
    });
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

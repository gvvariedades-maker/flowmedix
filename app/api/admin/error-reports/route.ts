import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/requireAdmin';
import { logger } from '@/lib/logger';
import { AdminErrorReportListQuerySchema } from '@/lib/validations';

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
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    let dbQuery = auth.admin
      .from('error_reports')
      .select(
        'id, user_id, created_at, updated_at, context_type, modulo_slug, simulado_session_id, page_url, category, status, priority, severity, description, metadata, admin_notes, resolved_at, resolved_by',
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(from, to);

    if (query.status) dbQuery = dbQuery.eq('status', query.status);
    if (query.priority) dbQuery = dbQuery.eq('priority', query.priority);
    if (query.context_type) dbQuery = dbQuery.eq('context_type', query.context_type);
    if (query.category) dbQuery = dbQuery.eq('category', query.category);
    if (query.from) dbQuery = dbQuery.gte('created_at', query.from);
    if (query.to) dbQuery = dbQuery.lte('created_at', query.to);
    if (query.q) {
      const q = query.q.replaceAll(',', ' ').trim();
      if (q) {
        dbQuery = dbQuery.or(`description.ilike.%${q}%,modulo_slug.ilike.%${q}%`);
      }
    }

    const { data, count, error } = await dbQuery;

    if (error) {
      logger.error('GET /api/admin/error-reports falhou', error, {
        email: auth.email,
      });
      return NextResponse.json({ error: 'Erro ao listar reports' }, { status: 500 });
    }

    return NextResponse.json({
      reports: data ?? [],
      pagination: {
        page,
        page_size: pageSize,
        total: count ?? 0,
        total_pages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
      },
      filters: {
        status: query.status ?? null,
        priority: query.priority ?? null,
        context_type: query.context_type ?? null,
        category: query.category ?? null,
        q: query.q ?? null,
        from: query.from ?? null,
        to: query.to ?? null,
      },
    });
  } catch (error) {
    logger.error('Erro inesperado em GET /api/admin/error-reports', error, {
      email: auth.email,
    });
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

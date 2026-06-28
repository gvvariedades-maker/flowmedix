import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminApi } from '@/lib/admin/requireAdmin';
import { logger } from '@/lib/logger';
import type { ErrorReportSlugAggregate } from '@/lib/admin/errorReports';

const SummaryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z.enum(['novo', 'triagem', 'resolvido', 'descartado']).optional(),
});

type ReportRowForSummary = {
  modulo_slug: string | null;
  created_at: string;
  status: string;
  category: string;
};

/** Agrega reportes por slug para priorizar correções no catálogo. */
export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  const parsed = SummaryQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Parâmetros inválidos', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { limit, status } = parsed.data;

  try {
    let dbQuery = auth.admin
      .from('error_reports')
      .select('modulo_slug, created_at, status, category')
      .not('modulo_slug', 'is', null)
      .order('created_at', { ascending: false })
      .limit(5000);

    if (status) {
      dbQuery = dbQuery.eq('status', status);
    } else {
      dbQuery = dbQuery.in('status', ['novo', 'triagem']);
    }

    const { data, error } = await dbQuery;

    if (error) {
      logger.error('GET /api/admin/error-reports/summary falhou', error, { email: auth.email });
      return NextResponse.json({ error: 'Erro ao agregar reports' }, { status: 500 });
    }

    const rows = (data ?? []) as ReportRowForSummary[];
    const map = new Map<string, ErrorReportSlugAggregate>();

    for (const row of rows) {
      const slug = row.modulo_slug?.trim();
      if (!slug) continue;

      const existing = map.get(slug);
      const isOpen = row.status === 'novo' || row.status === 'triagem';
      const isSlide = row.category === 'slides';

      if (!existing) {
        map.set(slug, {
          modulo_slug: slug,
          count: 1,
          latest_at: row.created_at,
          open_count: isOpen ? 1 : 0,
          slide_reports: isSlide ? 1 : 0,
        });
        continue;
      }

      existing.count += 1;
      if (isOpen) existing.open_count += 1;
      if (isSlide) existing.slide_reports += 1;
      if (row.created_at > existing.latest_at) existing.latest_at = row.created_at;
    }

    const bySlug = Array.from(map.values())
      .sort((a, b) => {
        if (b.open_count !== a.open_count) return b.open_count - a.open_count;
        if (b.slide_reports !== a.slide_reports) return b.slide_reports - a.slide_reports;
        return b.latest_at.localeCompare(a.latest_at);
      })
      .slice(0, limit);

    const openTotal = rows.filter((r) => r.status === 'novo' || r.status === 'triagem').length;
    const slidesOpen = rows.filter(
      (r) => r.category === 'slides' && (r.status === 'novo' || r.status === 'triagem'),
    ).length;

    return NextResponse.json({
      by_slug: bySlug,
      totals: {
        open: openTotal,
        slides_open: slidesOpen,
      },
    });
  } catch (error) {
    logger.error('Erro inesperado em GET /api/admin/error-reports/summary', error, {
      email: auth.email,
    });
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

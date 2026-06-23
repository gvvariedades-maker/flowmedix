/**
 * GET /api/admin/review-queue
 * Lista questões pendentes de revisão premium (catálogo ou relatório ai:generate).
 *
 * Query:
 *   source=supabase|ai-report (default: supabase)
 *   subtopico=Imunização
 *   lote=imunizacao-lote-01 (ai-report)
 *   limit=30&offset=0
 */
import { NextRequest, NextResponse } from 'next/server';

import {
  listAvailableAiReports,
  loadAiReportReviewQueue,
  scanSupabaseReviewQueue,
} from '@/lib/admin/reviewQueue';
import { requireAdminApi } from '@/lib/admin/requireAdmin';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  const { searchParams } = request.nextUrl;
  const source = searchParams.get('source') === 'ai-report' ? 'ai-report' : 'supabase';
  const subtopico = searchParams.get('subtopico') ?? undefined;
  const lote = searchParams.get('lote') ?? undefined;
  const limit = Number(searchParams.get('limit') ?? '30');
  const offset = Number(searchParams.get('offset') ?? '0');

  try {
    if (source === 'ai-report') {
      if (!lote) {
        return NextResponse.json({
          available_lotes: listAvailableAiReports(),
          error: 'Informe ?lote= para source=ai-report',
        }, { status: 400 });
      }
      const result = loadAiReportReviewQueue(lote, { limit, offset });
      return NextResponse.json(result);
    }

    const result = await scanSupabaseReviewQueue(auth.admin, {
      subtopico,
      limit,
      offset,
    });
    return NextResponse.json(result);
  } catch (err) {
    logger.error('review-queue list failed', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Falha na fila de revisão' },
      { status: 500 },
    );
  }
}

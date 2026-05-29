import { NextRequest, NextResponse } from 'next/server';
import { searchParamsToQueryRecord } from '@/lib/api/query-params';
import { VitrineFacetsQuerySchema } from '@/lib/validations';
import { getVitrineFacetsCached } from '@/lib/cache';
import { logger } from '@/lib/logger';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';

export async function GET(request: NextRequest) {
  try {
    if (isE2eBypassEnabled('E2E_DASHBOARD_BYPASS')) {
      return NextResponse.json(
        { bancas: ['FGV'], assuntos: ['Urgências'] },
        { headers: { 'Cache-Control': 'private, no-store' } },
      );
    }

    const auth = await getUserAndClientFromBearer(request);
    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const raw = searchParamsToQueryRecord(request.nextUrl.searchParams);
    const parsed = VitrineFacetsQuerySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { bancas } = parsed.data;
    const facets = await getVitrineFacetsCached(auth.user.id, {
      bancas,
    });

    return NextResponse.json(facets, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    logger.error('Falha em GET /api/vitrine/facets', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { searchParamsToQueryRecord } from '@/lib/api/query-params';
import { VitrineResolveQuestaoQuerySchema } from '@/lib/validations';
import { isAdminSessionEmail } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { recordPerformance } from '@/lib/metrics';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import { resolveE2eQuestaoInAssunto } from '@/lib/e2e/estudarSeed';
import {
  resolveQuestaoInAssunto,
  ResolveQuestaoInvalidAlvoError,
  ResolveQuestaoNotFoundError,
} from '@/lib/vitrine/resolveQuestao';

export async function GET(request: NextRequest) {
  const requestStartedAt = Date.now();
  const endpoint = '/api/vitrine/questao';
  const method = 'GET';

  try {
    const raw = searchParamsToQueryRecord(request.nextUrl.searchParams);
    const parsed = VitrineResolveQuestaoQuerySchema.safeParse(raw);
    if (!parsed.success) {
      recordPerformance(endpoint, method, Date.now() - requestStartedAt, false);
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { assunto, alvo, bancas } = parsed.data;

    if (isE2eBypassEnabled('E2E_DASHBOARD_BYPASS')) {
      const result = resolveE2eQuestaoInAssunto({ assunto, alvo, bancas });
      if (!result) {
        recordPerformance(endpoint, method, Date.now() - requestStartedAt, false);
        return NextResponse.json({ error: 'Questão não encontrada neste assunto' }, { status: 404 });
      }
      recordPerformance(endpoint, method, Date.now() - requestStartedAt, true);
      return NextResponse.json(result, { headers: { 'Cache-Control': 'private, no-store' } });
    }

    const auth = await getUserAndClientFromBearer(request);
    if (!auth) {
      recordPerformance(endpoint, method, Date.now() - requestStartedAt, false);
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const isAdmin = isAdminSessionEmail(auth.user.email ?? null);

    const result = await resolveQuestaoInAssunto({
      userId: auth.user.id,
      assunto,
      alvo,
      bancas,
      isAdmin,
    });

    recordPerformance(endpoint, method, Date.now() - requestStartedAt, true);
    return NextResponse.json(result, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    recordPerformance(endpoint, method, Date.now() - requestStartedAt, false);

    if (error instanceof ResolveQuestaoInvalidAlvoError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof ResolveQuestaoNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    logger.error('Falha em GET /api/vitrine/questao', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

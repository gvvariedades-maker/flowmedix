import { NextRequest, NextResponse } from 'next/server';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';
import { shouldShowConvictionUi } from '@/lib/evidence/convictionGate';
import { logger } from '@/lib/logger';
import {
  getEvidenceV1InternalEmails,
  isEvidenceV1InstrumentationEnabled,
} from '@/lib/env';

/**
 * GET /api/aluno/evidence-cohort — Evidence Engine Fase 1 (Lote 8).
 *
 * Único ponto em que o cliente descobre se está na coorte técnica de
 * convicção (spec §1.5, §1.13). Nunca aceitar essa decisão do body/props
 * do cliente — sempre derivar aqui a partir do e-mail do JWT + env.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await getUserAndClientFromBearer(request);
    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const instrumentation = isEvidenceV1InstrumentationEnabled();
    const internalEmails = getEvidenceV1InternalEmails();
    const conviction_ui = shouldShowConvictionUi({
      email: auth.user.email,
      instrumentationEnabled: instrumentation,
      internalEmails,
    });

    return NextResponse.json({ instrumentation, conviction_ui });
  } catch (error) {
    logger.error('GET /api/aluno/evidence-cohort failed', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

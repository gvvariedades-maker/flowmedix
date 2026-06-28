import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedCronRequest } from '@/lib/cron/authorizeCron';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';
import { createServerSupabase } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { SimuladoWeeklyGenerateSchema } from '@/lib/validations';
import {
  createWeeklySimuladoSession,
  generateWeeklySimuladosBatch,
} from '@/lib/simulado/weeklySimulado';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';

async function handleGenerate(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const parsed = SimuladoWeeklyGenerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Payload inválido', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { user_id: userIdInput, quantidade } = parsed.data;
  const isCron = isAuthorizedCronRequest(request);

  if (isE2eBypassEnabled('E2E_DASHBOARD_BYPASS')) {
    return NextResponse.json({
      success: true,
      mode: 'e2e',
      created: 0,
      skipped: 0,
      processed: 0,
    });
  }

  if (isCron) {
    const supabase = await createServerSupabase();
    const batch = await generateWeeklySimuladosBatch({
      supabase,
      userIds: userIdInput ? [userIdInput] : undefined,
      quantidade,
    });

    return NextResponse.json({
      success: true,
      mode: 'cron',
      ...batch,
    });
  }

  const auth = await getUserAndClientFromBearer(request);
  if (!auth) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const targetUserId = userIdInput ?? auth.user.id;
  if (targetUserId !== auth.user.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  try {
    const result = await createWeeklySimuladoSession({
      userId: targetUserId,
      userEmail: auth.user.email,
      quantidade,
    });

    if (result.reason === 'freemium_locked' && result.entitlement && !result.entitlement.allowed) {
      return NextResponse.json(
        {
          error: 'Missão semanal indisponível no plano gratuito',
          code: result.entitlement.reason,
          entitlement: result.entitlement,
        },
        { status: 402 },
      );
    }

    if (result.reason === 'empty_pool') {
      return NextResponse.json(
        { error: 'Nenhuma questão disponível para montar o simulado da semana' },
        { status: 404 },
      );
    }

    if (result.reason === 'insert_failed') {
      return NextResponse.json({ error: 'Erro ao gerar simulado da semana' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      mode: 'user',
      created: result.created,
      mission: result.mission,
    });
  } catch (error) {
    logger.error('Erro inesperado em POST /api/simulado/weekly/generate', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return handleGenerate(request);
}

export async function GET(request: NextRequest) {
  return handleGenerate(request);
}

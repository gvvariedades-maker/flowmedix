import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { CACHE_REVALIDATE_IMMEDIATE } from '@/lib/cache';
import { getUserPreferencesOnboarding } from '@/lib/onboarding/preferences';
import { logger } from '@/lib/logger';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';
import { UserPreferencesOnboardingSchema } from '@/lib/validations';

/** GET /api/aluno/preferences — status do onboarding de preferências */
export async function GET(request: NextRequest) {
  try {
    const auth = await getUserAndClientFromBearer(request);
    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const status = await getUserPreferencesOnboarding(auth.user.id);
    return NextResponse.json(status);
  } catch (error) {
    logger.error('GET /api/aluno/preferences failed', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

/** POST /api/aluno/preferences — persiste preferências do onboarding */
export async function POST(request: NextRequest) {
  try {
    const auth = await getUserAndClientFromBearer(request);
    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
    }

    const parsed = UserPreferencesOnboardingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload inválido', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const payload = parsed.data;
    const now = new Date().toISOString();

    const { data, error } = await auth.supabase
      .from('user_preferences_onboarding')
      .upsert(
        {
          user_id: auth.user.id,
          topicos_afinidade: payload.topicos_afinidade,
          topicos_dificuldade: payload.topicos_dificuldade,
          carga_horaria_semanal: payload.carga_horaria_semanal ?? null,
          bancas_foco: payload.bancas_foco,
          updated_at: now,
        },
        { onConflict: 'user_id' },
      )
      .select(
        'user_id, topicos_afinidade, topicos_dificuldade, carga_horaria_semanal, bancas_foco, created_at, updated_at',
      )
      .single();

    if (error) {
      logger.error('Falha ao salvar preferências de onboarding', error, {
        userId: auth.user.id,
      });
      return NextResponse.json({ error: 'Erro ao salvar preferências' }, { status: 500 });
    }

    revalidateTag(`user-${auth.user.id}`, CACHE_REVALIDATE_IMMEDIATE);
    revalidateTag('onboarding-preferences', CACHE_REVALIDATE_IMMEDIATE);

    return NextResponse.json(
      {
        success: true,
        completed: true,
        preferences: data,
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error('Erro inesperado em POST /api/aluno/preferences', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

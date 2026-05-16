import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { CACHE_REVALIDATE_IMMEDIATE } from '@/lib/cache';
import {
  assertCanAnswerQuestion,
  countQuestoesHojeForUser,
  getFreemiumDayBounds,
  isUserPro,
} from '@/lib/freemium';
import { logger } from '@/lib/logger';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { modulo_slug, acertou, banca, topico, subtopico } = body;

    if (!modulo_slug || acertou === undefined) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
    }

    const auth = await getUserAndClientFromBearer(request);
    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const { user, supabase } = auth;

    const gate = await assertCanAnswerQuestion(user.id);
    if (!gate.allowed) {
      return NextResponse.json(
        { limiteAtingido: true, resetEm: gate.resetEm, allowed: false },
        { status: 403 },
      );
    }

    const [recheck, isPro] = await Promise.all([
      countQuestoesHojeForUser(user.id),
      isUserPro(user.id),
    ]);
    if (!isPro && recheck >= 1) {
      const { resetEm } = getFreemiumDayBounds();
      return NextResponse.json(
        { limiteAtingido: true, resetEm: resetEm.toISOString(), allowed: false },
        { status: 403 },
      );
    }

    const { error: insertError } = await supabase.from('historico_questoes').insert({
      user_id: user.id,
      modulo_slug,
      acertou,
      banca: banca || 'DESCONHECIDA',
      topico: topico || 'Geral',
      subtopico: subtopico || topico || 'Geral',
    });

    if (insertError) {
      logger.error('Failed to register attempt via API', insertError, { userId: user.id, modulo_slug });
      return NextResponse.json({ error: 'Erro ao registrar tentativa' }, { status: 500 });
    }

    revalidateTag('historico', CACHE_REVALIDATE_IMMEDIATE);
    revalidateTag(`user-${user.id}`, CACHE_REVALIDATE_IMMEDIATE);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Unexpected error in registrar-tentativa', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

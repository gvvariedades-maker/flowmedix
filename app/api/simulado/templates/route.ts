import { NextRequest, NextResponse } from 'next/server';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';
import { createServerSupabase } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { SimuladoTemplateCreateSchema } from '@/lib/validations';
import { createSimuladoTemplate, listSimuladoTemplates } from '@/lib/simulado/templates';

export async function GET(request: NextRequest) {
  try {
    const auth = await getUserAndClientFromBearer(request);
    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createServerSupabase();
    const templates = await listSimuladoTemplates(supabase, auth.user.id);

    return NextResponse.json({ templates });
  } catch (error) {
    logger.error('Erro inesperado em GET /api/simulado/templates', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getUserAndClientFromBearer(request);
    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = SimuladoTemplateCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload inválido', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const supabase = await createServerSupabase();
    const result = await createSimuladoTemplate(supabase, auth.user.id, parsed.data);

    if (!result.template) {
      logger.error('Falha ao criar template de simulado', new Error(result.error ?? 'unknown'), {
        userId: auth.user.id,
      });
      return NextResponse.json({ error: 'Erro ao salvar configuração' }, { status: 500 });
    }

    return NextResponse.json({ success: true, template: result.template });
  } catch (error) {
    logger.error('Erro inesperado em POST /api/simulado/templates', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

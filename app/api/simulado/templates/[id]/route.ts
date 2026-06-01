import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';
import { createServerSupabase } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { deleteSimuladoTemplate } from '@/lib/simulado/templates';

const TemplateIdSchema = z.string().uuid('ID de template inválido');

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await getUserAndClientFromBearer(request);
    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id: rawId } = await params;
    const parsedId = TemplateIdSchema.safeParse(rawId);
    if (!parsedId.success) {
      return NextResponse.json({ error: 'ID de template inválido' }, { status: 400 });
    }

    const supabase = await createServerSupabase();
    const deleted = await deleteSimuladoTemplate(supabase, auth.user.id, parsedId.data);

    if (!deleted) {
      return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Erro inesperado em DELETE /api/simulado/templates/[id]', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

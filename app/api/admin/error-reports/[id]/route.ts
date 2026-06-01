import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/requireAdmin';
import { logger } from '@/lib/logger';
import { AdminErrorReportPatchSchema } from '@/lib/validations';

type RouteContext = { params: Promise<{ id: string }> };

const ErrorReportIdParamSchema = z.object({
  id: z.string().uuid('ID de report inválido'),
});

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  const paramResult = ErrorReportIdParamSchema.safeParse(await context.params);
  if (!paramResult.success) {
    return NextResponse.json({ error: paramResult.error.issues[0]?.message }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 });
  }

  const parsed = AdminErrorReportPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { id } = paramResult.data;
  const payload = parsed.data;
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (payload.status !== undefined) updateData.status = payload.status;
  if (payload.priority !== undefined) updateData.priority = payload.priority;
  if (payload.admin_notes !== undefined) updateData.admin_notes = payload.admin_notes;

  if (payload.status === 'resolvido') {
    updateData.resolved_at = new Date().toISOString();
    updateData.resolved_by = auth.user.id;
  } else if (payload.status && payload.status !== 'resolvido') {
    updateData.resolved_at = null;
    updateData.resolved_by = null;
  }

  try {
    const { data, error } = await auth.admin
      .from('error_reports')
      .update(updateData)
      .eq('id', id)
      .select(
        'id, user_id, created_at, updated_at, context_type, modulo_slug, simulado_session_id, page_url, category, status, priority, severity, description, metadata, admin_notes, resolved_at, resolved_by',
      )
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Report não encontrado' }, { status: 404 });
      }
      logger.error('PATCH /api/admin/error-reports/[id] falhou', error, {
        id,
        email: auth.email,
      });
      return NextResponse.json({ error: 'Erro ao atualizar report' }, { status: 500 });
    }

    return NextResponse.json({ report: data });
  } catch (error) {
    logger.error('Erro inesperado em PATCH /api/admin/error-reports/[id]', error, {
      id,
      email: auth.email,
    });
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/requireAdmin';
import { logger } from '@/lib/logger';
import { AdminErrorReportBulkPatchSchema } from '@/lib/validations';

const ERROR_REPORT_SELECT =
  'id, user_id, created_at, updated_at, context_type, modulo_slug, simulado_session_id, page_url, category, status, priority, severity, description, metadata, admin_notes, resolved_at, resolved_by';

/** Atualiza vários reportes de uma vez (ex.: duplicados do mesmo slug). */
export async function PATCH(request: NextRequest) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 });
  }

  const parsed = AdminErrorReportBulkPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten() },
      { status: 422 },
    );
  }

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
  } else if (payload.status !== undefined) {
    updateData.resolved_at = null;
    updateData.resolved_by = null;
  }

  try {
    const { data, error } = await auth.admin
      .from('error_reports')
      .update(updateData)
      .in('id', payload.report_ids)
      .select(ERROR_REPORT_SELECT);

    if (error) {
      logger.error('PATCH /api/admin/error-reports/bulk falhou', error, {
        email: auth.email,
        count: payload.report_ids.length,
      });
      return NextResponse.json({ error: 'Erro ao atualizar reports' }, { status: 500 });
    }

    return NextResponse.json({
      updated_count: data?.length ?? 0,
      reports: data ?? [],
    });
  } catch (error) {
    logger.error('Erro inesperado em PATCH /api/admin/error-reports/bulk', error, {
      email: auth.email,
    });
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

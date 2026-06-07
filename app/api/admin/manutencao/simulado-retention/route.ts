import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/requireAdmin';
import { isAuthorizedCronRequest } from '@/lib/cron/authorizeCron';
import { SimuladoRetentionRunSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';
import { createServerSupabase } from '@/lib/supabase/server';

async function runRetention(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    const auth = await requireAdminApi();
    if ('error' in auth) return auth.error;
  }

  const payload = await request.json().catch(() => ({}));
  const parsed = SimuladoRetentionRunSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Payload inválido', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { retention_months, reference_at } = parsed.data;

  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.rpc('simulado_run_retention', {
      p_reference: reference_at ?? undefined,
      p_retention_months: retention_months,
    });

    if (error) {
      logger.error('Falha ao executar retenção de simulados', error, {
        retentionMonths: retention_months,
        referenceAt: reference_at ?? null,
      });
      return NextResponse.json({ error: 'Erro ao executar retenção de simulados' }, { status: 500 });
    }

    const firstRow = Array.isArray(data) ? data[0] : null;

    return NextResponse.json({
      success: true,
      retention_months,
      reference_at: reference_at ?? null,
      consolidated_sessions:
        firstRow && typeof firstRow.consolidated_sessions === 'number'
          ? firstRow.consolidated_sessions
          : 0,
      deleted_respostas:
        firstRow && typeof firstRow.deleted_respostas === 'number' ? firstRow.deleted_respostas : 0,
    });
  } catch (error) {
    logger.error('Erro inesperado em manutenção de retenção de simulados', error);
    return NextResponse.json({ error: 'Erro ao executar retenção de simulados' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return runRetention(request);
}

export async function GET(request: NextRequest) {
  return runRetention(request);
}

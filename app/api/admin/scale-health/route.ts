import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/requireAdmin';
import { runScaleHealthCheck } from '@/lib/scale/healthCheck';
import { logger } from '@/lib/logger';

/**
 * GET /api/admin/scale-health
 * Agregados de escala (catálogo, JSON, histórico) — admin autenticado.
 */
export async function GET() {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  try {
    const report = await runScaleHealthCheck(auth.admin);
    const status = report.alerts.some((a) => a.level === 'critical')
      ? 'critical'
      : report.alerts.some((a) => a.level === 'warn')
        ? 'warn'
        : 'ok';

    return NextResponse.json({ status, ...report });
  } catch (error) {
    logger.error('scale-health failed', error);
    return NextResponse.json({ error: 'Falha ao coletar métricas de escala' }, { status: 500 });
  }
}

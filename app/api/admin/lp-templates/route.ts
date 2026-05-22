import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/requireAdmin';
import { listLpTemplatesForAdmin } from '@/lib/lp/pages';
import { logger } from '@/lib/logger';

export async function GET() {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  try {
    const templates = await listLpTemplatesForAdmin();
    return NextResponse.json({ templates });
  } catch (error) {
    logger.error('GET /api/admin/lp-templates', error);
    return NextResponse.json({ error: 'Erro ao listar templates' }, { status: 500 });
  }
}

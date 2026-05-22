import { NextResponse } from 'next/server';

import { requireAdminApi } from '@/lib/admin/requireAdmin';
import { listEmailTemplates } from '@/lib/email/templates';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

export async function GET() {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  try {
    const templates = await listEmailTemplates(auth.admin);
    return NextResponse.json({ templates });
  } catch (error) {
    logger.error('GET /api/admin/email-templates', error);
    return NextResponse.json({ error: 'Erro ao listar templates' }, { status: 500 });
  }
}

/**
 * API para admin invalidar cache de questões
 * Chamado após publicar questão no laboratório para que apareça na área do aluno
 */

import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/requireAdmin';
import { invalidateModulosCache, invalidateQuestoesCache } from '@/lib/cache';
import { logger } from '@/lib/logger';

export async function POST() {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  try {
    await invalidateModulosCache();
    await invalidateQuestoesCache();
    logger.info('Cache invalidado pelo admin', { email: auth.email });
    return NextResponse.json({ success: true, message: 'Cache invalidado' });
  } catch (error: unknown) {
    logger.error('Erro ao invalidar cache', error);
    return NextResponse.json(
      { error: 'Erro ao invalidar cache' },
      { status: 500 }
    );
  }
}

/**
 * API Route para Invalidação de Cache
 * 
 * Usado por webhooks do Supabase para invalidar cache quando dados são atualizados
 * 
 * Segurança: Requer autenticação via header Authorization
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  invalidateModulosCache, 
  invalidateQuestoesCache,
  invalidateFluxogramasCache,
  invalidateHistoricoCache,
  invalidateAllCache 
} from '@/lib/cache';
import { logger } from '@/lib/logger';

/**
 * Validação de webhook secret
 * Em produção: exige WEBHOOK_SECRET configurado
 * Em desenvolvimento: exige WEBHOOK_SECRET ou aceita se não configurado (apenas local)
 */
function isValidWebhook(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const webhookSecret = process.env.WEBHOOK_SECRET;

  if (process.env.NODE_ENV === 'production') {
    if (!webhookSecret) {
      return false; // Em produção, WEBHOOK_SECRET é obrigatório
    }
    return authHeader === `Bearer ${webhookSecret}`;
  }

  // Em desenvolvimento: se WEBHOOK_SECRET estiver definido, validar; senão aceitar (apenas localhost)
  if (webhookSecret) {
    return authHeader === `Bearer ${webhookSecret}`;
  }
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Validação de segurança
    if (!isValidWebhook(request)) {
      logger.warn('Invalid webhook request', { 
        hasAuth: !!request.headers.get('authorization') 
      });
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { table, event, tags } = body;

    logger.info('Cache invalidation request', { table, event, tags });

    // Invalidação baseada na tabela afetada
    if (table) {
      switch (table) {
        case 'modulos_estudo':
          await invalidateModulosCache();
          await invalidateQuestoesCache(); // Questões também são afetadas
          break;
        
        case 'historico_questoes':
          await invalidateHistoricoCache();
          break;
        
        case 'flowcharts':
        case 'exam_contents':
          await invalidateFluxogramasCache();
          break;
        
        default:
          // Invalidação completa se tabela desconhecida
          await invalidateAllCache();
      }
    } 
    // Invalidação por tags específicas
    else if (tags && Array.isArray(tags)) {
      const { revalidateTag } = await import('next/cache');
      tags.forEach((tag: string) => {
        revalidateTag(tag);
        logger.info('Cache tag invalidated', { tag });
      });
    }
    // Invalidação completa se nenhum parâmetro específico
    else {
      await invalidateAllCache();
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Cache invalidado com sucesso',
      invalidated: { table, tags } 
    });
  } catch (error: any) {
    logger.error('Cache invalidation error', error);
    return NextResponse.json(
      { error: 'Erro ao invalidar cache' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint para verificar status do cache
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Cache revalidation endpoint está ativo',
    config: {
      static: '15 minutos',
      semiStatic: '5 minutos',
      dynamic: '1 minuto',
      user: '2 minutos',
    },
  });
}

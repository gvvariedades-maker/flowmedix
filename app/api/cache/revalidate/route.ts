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
  invalidateHistoricoCache,
  invalidateHistoricoUserCache,
  invalidateVitrineFacetsCache,
  invalidateVitrinePageCache,
  invalidateAllCache,
  revalidateCache,
  type VitrineFacetsCacheFilters,
  type VitrinePageCacheFilters,
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
    const { table, event, tags, userId } = body as {
      table?: string;
      event?: string;
      tags?: string[];
      userId?: string;
      filters?: {
        page?: VitrinePageCacheFilters;
        facets?: VitrineFacetsCacheFilters;
      };
    };
    const pageFilters = body?.filters?.page as VitrinePageCacheFilters | undefined;
    const facetsFilters = body?.filters?.facets as VitrineFacetsCacheFilters | undefined;

    logger.info('Cache invalidation request', { table, event, tags, userId, pageFilters, facetsFilters });

    // Invalidação baseada na tabela afetada
    if (table) {
      switch (table) {
        case 'modulos_estudo':
          await invalidateModulosCache();
          await invalidateQuestoesCache(); // Questões também são afetadas
          if (userId) {
            await invalidateVitrinePageCache(userId, pageFilters);
            await invalidateVitrineFacetsCache(userId, facetsFilters);
          }
          break;
        
        case 'historico_questoes':
          if (userId) {
            await invalidateHistoricoUserCache(userId);
            await invalidateVitrinePageCache(userId, pageFilters);
            await invalidateVitrineFacetsCache(userId, facetsFilters);
          } else {
            await invalidateHistoricoCache();
          }
          break;

        default:
          // Invalidação completa se tabela desconhecida
          await invalidateAllCache();
      }
    } 
    // Invalidação por tags específicas
    else if (tags && Array.isArray(tags)) {
      const sanitized = tags.filter((tag): tag is string => typeof tag === 'string' && tag.length > 0);
      if (sanitized.length > 0) {
        await revalidateCache(sanitized);
      }
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

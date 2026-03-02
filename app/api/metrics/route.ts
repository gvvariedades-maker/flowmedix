/**
 * API de Métricas de Performance
 * 
 * Endpoint para consultar métricas de cache e performance
 * 
 * GET /api/metrics - Retorna todas as métricas
 * GET /api/metrics?endpoint=/estudar - Métricas de endpoint específico
 * GET /api/metrics/cache - Apenas métricas de cache
 * GET /api/metrics/performance - Apenas métricas de performance
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getAllMetrics,
  getCacheMetrics,
  getPerformanceStats,
  getQueryMetrics,
  getPerformanceMetrics,
} from '@/lib/metrics';
import { logger } from '@/lib/logger';

/**
 * Verifica se requisição é autorizada
 * Em produção: exige METRICS_SECRET configurado
 */
function isAuthorized(request: NextRequest): boolean {
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  const authHeader = request.headers.get('authorization');
  const metricsSecret = process.env.METRICS_SECRET;

  if (!metricsSecret) {
    return false; // Em produção, METRICS_SECRET é obrigatório
  }
  return authHeader === `Bearer ${metricsSecret}`;
}

export async function GET(request: NextRequest) {
  try {
    // Verificação de autorização
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const endpoint = searchParams.get('endpoint');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Retornar apenas métricas de cache
    if (type === 'cache') {
      const cacheMetrics = getCacheMetrics();
      return NextResponse.json({
        cache: cacheMetrics,
        timestamp: Date.now(),
      });
    }

    // Retornar apenas métricas de performance
    if (type === 'performance') {
      const stats = getPerformanceStats(endpoint || undefined);
      const recent = getPerformanceMetrics(endpoint || undefined, limit);
      
      return NextResponse.json({
        stats,
        recent,
        timestamp: Date.now(),
      });
    }

    // Retornar apenas métricas de queries
    if (type === 'queries') {
      const queries = getQueryMetrics();
      return NextResponse.json({
        queries,
        timestamp: Date.now(),
      });
    }

    // Retornar todas as métricas
    const allMetrics = getAllMetrics();
    
    // Se endpoint especificado, adicionar detalhes
    if (endpoint) {
      const endpointStats = getPerformanceStats(endpoint);
      const endpointRecent = getPerformanceMetrics(endpoint, limit);
      
      return NextResponse.json({
        ...allMetrics,
        endpoint: {
          path: endpoint,
          stats: endpointStats,
          recent: endpointRecent,
        },
      });
    }

    return NextResponse.json(allMetrics);
  } catch (error: any) {
    logger.error('Failed to fetch metrics', error);
    return NextResponse.json(
      { error: 'Erro ao buscar métricas' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Reset métricas (apenas desenvolvimento)
 */
export async function DELETE(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Não permitido em produção' },
      { status: 403 }
    );
  }

  const { resetMetrics } = await import('@/lib/metrics');
  resetMetrics();

  return NextResponse.json({
    success: true,
    message: 'Métricas resetadas',
  });
}

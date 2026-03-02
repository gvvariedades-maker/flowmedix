/**
 * Performance Tracker Middleware
 * 
 * Rastreia TTFB e cache hits/misses automaticamente
 */

import { NextRequest, NextResponse } from 'next/server';
import { recordPerformance, recordCacheHit, recordCacheMiss } from './metrics';
import { logger } from './logger';

interface TrackedResponse extends NextResponse {
  _cached?: boolean;
  _startTime?: number;
}

/**
 * Wrapper para funções de cache que rastreia hits/misses
 */
export function trackCache<T>(
  cacheKey: string,
  cacheFn: () => Promise<T>,
  isCached: boolean = false
): Promise<T> {
  const startTime = Date.now();
  
  return cacheFn()
    .then((result) => {
      const duration = Date.now() - startTime;
      
      if (isCached) {
        recordCacheHit(cacheKey);
      } else {
        recordCacheMiss(cacheKey);
      }
      
      logger.debug('Cache operation', {
        key: cacheKey,
        cached: isCached,
        duration,
      });
      
      return result;
    })
    .catch((error) => {
      recordCacheMiss(cacheKey);
      logger.error('Cache operation failed', error, { key: cacheKey });
      throw error;
    });
}

/**
 * Middleware para rastrear performance de rotas
 */
export function withPerformanceTracking(
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const startTime = Date.now();
    const endpoint = req.nextUrl.pathname;
    const method = req.method;

    try {
      const response = await handler(req, ...args);
      const ttfb = Date.now() - startTime;

      // Verifica se resposta veio do cache (via header customizado)
      const cached = response.headers.get('x-cache') === 'HIT';

      recordPerformance(endpoint, method, ttfb, cached);

      // Adiciona headers de performance
      response.headers.set('x-ttfb', ttfb.toString());
      response.headers.set('x-cache-status', cached ? 'HIT' : 'MISS');

      return response;
    } catch (error) {
      const ttfb = Date.now() - startTime;
      recordPerformance(endpoint, method, ttfb, false);
      throw error;
    }
  };
}

/**
 * Helper para marcar resposta como cached
 */
export function markAsCached(response: NextResponse): NextResponse {
  response.headers.set('x-cache', 'HIT');
  return response;
}

/**
 * Helper para marcar resposta como miss
 */
export function markAsMiss(response: NextResponse): NextResponse {
  response.headers.set('x-cache', 'MISS');
  return response;
}

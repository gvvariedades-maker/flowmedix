/**
 * Sistema de Métricas e Monitoramento de Performance
 * 
 * Rastreia:
 * - Cache hit/miss rate
 * - TTFB (Time To First Byte)
 * - Query reduction
 * - Performance por endpoint
 */

interface CacheMetrics {
  hits: number;
  misses: number;
  total: number;
  hitRate: number;
}

interface PerformanceMetrics {
  endpoint: string;
  method: string;
  ttfb: number;
  timestamp: number;
  cached: boolean;
}

interface QueryMetrics {
  totalQueries: number;
  cachedQueries: number;
  reduction: number;
}

// Armazenamento em memória (em produção, usar Redis ou banco)
const cacheMetrics = new Map<string, CacheMetrics>();
const performanceMetrics: PerformanceMetrics[] = [];
const queryMetrics: QueryMetrics = {
  totalQueries: 0,
  cachedQueries: 0,
  reduction: 0,
};

// Limite de métricas em memória (evitar vazamento)
const MAX_METRICS = 1000;

/**
 * Registra cache hit
 */
export function recordCacheHit(key: string) {
  const metrics = cacheMetrics.get(key) || { hits: 0, misses: 0, total: 0, hitRate: 0 };
  metrics.hits++;
  metrics.total++;
  metrics.hitRate = (metrics.hits / metrics.total) * 100;
  cacheMetrics.set(key, metrics);
}

/**
 * Registra cache miss
 */
export function recordCacheMiss(key: string) {
  const metrics = cacheMetrics.get(key) || { hits: 0, misses: 0, total: 0, hitRate: 0 };
  metrics.misses++;
  metrics.total++;
  metrics.hitRate = (metrics.hits / metrics.total) * 100;
  cacheMetrics.set(key, metrics);
}

/**
 * Registra métrica de performance
 */
export function recordPerformance(
  endpoint: string,
  method: string,
  ttfb: number,
  cached: boolean = false
) {
  performanceMetrics.push({
    endpoint,
    method,
    ttfb,
    timestamp: Date.now(),
    cached,
  });

  // Limitar tamanho do array
  if (performanceMetrics.length > MAX_METRICS) {
    performanceMetrics.shift();
  }

  // Atualizar métricas de queries
  queryMetrics.totalQueries++;
  if (cached) {
    queryMetrics.cachedQueries++;
  }
  queryMetrics.reduction = 
    queryMetrics.totalQueries > 0
      ? (queryMetrics.cachedQueries / queryMetrics.totalQueries) * 100
      : 0;
}

/**
 * Obtém métricas de cache por chave
 */
export function getCacheMetrics(key?: string): CacheMetrics | Map<string, CacheMetrics> {
  if (key) {
    return cacheMetrics.get(key) || { hits: 0, misses: 0, total: 0, hitRate: 0 };
  }
  return cacheMetrics;
}

/**
 * Obtém métricas de performance
 */
export function getPerformanceMetrics(
  endpoint?: string,
  limit: number = 100
): PerformanceMetrics[] {
  let filtered = performanceMetrics;
  
  if (endpoint) {
    filtered = performanceMetrics.filter((m) => m.endpoint === endpoint);
  }
  
  return filtered.slice(-limit);
}

/**
 * Obtém estatísticas agregadas de performance
 */
export function getPerformanceStats(endpoint?: string) {
  const metrics = getPerformanceMetrics(endpoint);
  
  if (metrics.length === 0) {
    return {
      avgTTFB: 0,
      minTTFB: 0,
      maxTTFB: 0,
      p95TTFB: 0,
      cachedRate: 0,
      totalRequests: 0,
    };
  }

  const ttfbValues = metrics.map((m) => m.ttfb).sort((a, b) => a - b);
  const cachedCount = metrics.filter((m) => m.cached).length;

  return {
    avgTTFB: ttfbValues.reduce((a, b) => a + b, 0) / ttfbValues.length,
    minTTFB: ttfbValues[0],
    maxTTFB: ttfbValues[ttfbValues.length - 1],
    p95TTFB: ttfbValues[Math.floor(ttfbValues.length * 0.95)],
    cachedRate: (cachedCount / metrics.length) * 100,
    totalRequests: metrics.length,
  };
}

/**
 * Obtém métricas de queries
 */
export function getQueryMetrics(): QueryMetrics {
  return { ...queryMetrics };
}

/**
 * Obtém todas as métricas consolidadas
 */
export function getAllMetrics() {
  const cacheStats: Record<string, CacheMetrics> = {};
  cacheMetrics.forEach((value, key) => {
    cacheStats[key] = value;
  });

  return {
    cache: cacheStats,
    performance: getPerformanceStats(),
    queries: getQueryMetrics(),
    timestamp: Date.now(),
  };
}

/**
 * Limpa métricas antigas (manter apenas últimas N horas)
 */
export function cleanOldMetrics(maxAgeHours: number = 24) {
  const maxAge = maxAgeHours * 60 * 60 * 1000;
  const cutoff = Date.now() - maxAge;

  // Limpar métricas de performance antigas
  const filtered = performanceMetrics.filter((m) => m.timestamp > cutoff);
  performanceMetrics.length = 0;
  performanceMetrics.push(...filtered);
}

/**
 * Reseta todas as métricas
 */
export function resetMetrics() {
  cacheMetrics.clear();
  performanceMetrics.length = 0;
  queryMetrics.totalQueries = 0;
  queryMetrics.cachedQueries = 0;
  queryMetrics.reduction = 0;
}

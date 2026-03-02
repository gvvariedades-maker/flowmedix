#!/usr/bin/env tsx

/**
 * Script de Análise de Performance
 * 
 * Analisa métricas de cache e performance do AVANT
 * 
 * Uso:
 *   npm run analyze:performance
 *   npm run analyze:performance -- --endpoint /estudar
 *   npm run analyze:performance -- --export
 */

import { getAllMetrics, getPerformanceStats, getQueryMetrics } from '../lib/metrics';

interface AnalysisOptions {
  endpoint?: string;
  export?: boolean;
  format?: 'json' | 'table';
}

async function analyzePerformance(options: AnalysisOptions = {}) {
  const { endpoint, format = 'table' } = options;

  console.log('\n📊 Análise de Performance - AVANT\n');
  console.log('═'.repeat(60));

  // Métricas gerais
  const allMetrics = getAllMetrics();
  const queryMetrics = getQueryMetrics();
  const performanceStats = getPerformanceStats(endpoint);

  if (format === 'json') {
    console.log(JSON.stringify(allMetrics, null, 2));
    return;
  }

  // Cache Metrics
  console.log('\n🎯 Métricas de Cache\n');
  console.log('─'.repeat(60));
  
  const cacheEntries = Object.entries(allMetrics.cache);
  if (cacheEntries.length === 0) {
    console.log('  Nenhuma métrica de cache disponível ainda.');
  } else {
    cacheEntries.forEach(([key, metrics]) => {
      const hitRate = metrics.hitRate.toFixed(2);
      const status = metrics.hitRate >= 80 ? '✅' : metrics.hitRate >= 50 ? '⚠️' : '❌';
      console.log(`  ${status} ${key}`);
      console.log(`     Hits: ${metrics.hits} | Misses: ${metrics.misses} | Hit Rate: ${hitRate}%`);
    });
  }

  // Query Reduction
  console.log('\n📉 Redução de Queries\n');
  console.log('─'.repeat(60));
  const reduction = queryMetrics.reduction.toFixed(2);
  const reductionStatus = queryMetrics.reduction >= 70 ? '✅' : queryMetrics.reduction >= 50 ? '⚠️' : '❌';
  console.log(`  ${reductionStatus} Taxa de Redução: ${reduction}%`);
  console.log(`     Total de Queries: ${queryMetrics.totalQueries}`);
  console.log(`     Queries em Cache: ${queryMetrics.cachedQueries}`);
  console.log(`     Queries ao Banco: ${queryMetrics.totalQueries - queryMetrics.cachedQueries}`);

  // Performance Stats
  console.log('\n⚡ Performance (TTFB)\n');
  console.log('─'.repeat(60));
  if (endpoint) {
    console.log(`  Endpoint: ${endpoint}`);
  }
  console.log(`  Média: ${performanceStats.avgTTFB.toFixed(2)}ms`);
  console.log(`  Mínimo: ${performanceStats.minTTFB.toFixed(2)}ms`);
  console.log(`  Máximo: ${performanceStats.maxTTFB.toFixed(2)}ms`);
  console.log(`  P95: ${performanceStats.p95TTFB.toFixed(2)}ms`);
  console.log(`  Taxa de Cache: ${performanceStats.cachedRate.toFixed(2)}%`);
  console.log(`  Total de Requisições: ${performanceStats.totalRequests}`);

  // Status Geral
  console.log('\n📈 Status Geral\n');
  console.log('─'.repeat(60));
  
  const avgHitRate = cacheEntries.length > 0
    ? cacheEntries.reduce((sum, [, m]) => sum + m.hitRate, 0) / cacheEntries.length
    : 0;
  
  const ttfbStatus = performanceStats.avgTTFB < 200 ? '✅' : performanceStats.avgTTFB < 500 ? '⚠️' : '❌';
  const hitRateStatus = avgHitRate >= 80 ? '✅' : avgHitRate >= 50 ? '⚠️' : '❌';
  const reductionStatus2 = queryMetrics.reduction >= 70 ? '✅' : queryMetrics.reduction >= 50 ? '⚠️' : '❌';

  console.log(`  ${ttfbStatus} TTFB Médio: ${performanceStats.avgTTFB.toFixed(2)}ms (meta: < 200ms)`);
  console.log(`  ${hitRateStatus} Cache Hit Rate: ${avgHitRate.toFixed(2)}% (meta: > 80%)`);
  console.log(`  ${reductionStatus2} Redução de Queries: ${queryMetrics.reduction.toFixed(2)}% (meta: > 70%)`);

  // Recomendações
  console.log('\n💡 Recomendações\n');
  console.log('─'.repeat(60));
  
  const recommendations: string[] = [];
  
  if (performanceStats.avgTTFB >= 200) {
    recommendations.push('  ⚠️  TTFB acima da meta. Considere aumentar tempo de cache ou otimizar queries.');
  }
  
  if (avgHitRate < 80) {
    recommendations.push('  ⚠️  Cache hit rate baixo. Verifique se cache está sendo usado corretamente.');
  }
  
  if (queryMetrics.reduction < 70) {
    recommendations.push('  ⚠️  Redução de queries abaixo da meta. Considere cachear mais endpoints.');
  }
  
  if (recommendations.length === 0) {
    console.log('  ✅ Todas as métricas estão dentro das metas!');
  } else {
    recommendations.forEach(rec => console.log(rec));
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`Última atualização: ${new Date(allMetrics.timestamp).toLocaleString()}\n`);

  // Export se solicitado
  if (options.export) {
    const fs = await import('fs');
    const filename = `performance-analysis-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(allMetrics, null, 2));
    console.log(`📄 Métricas exportadas para: ${filename}\n`);
  }
}

// CLI
const args = process.argv.slice(2);
const options: AnalysisOptions = {};

args.forEach((arg, index) => {
  if (arg === '--endpoint' && args[index + 1]) {
    options.endpoint = args[index + 1];
  }
  if (arg === '--export') {
    options.export = true;
  }
  if (arg === '--json') {
    options.format = 'json';
  }
});

analyzePerformance(options).catch(console.error);

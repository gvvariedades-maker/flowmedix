# Sistema de Monitoramento de Performance

## 📊 Visão Geral

O AVANT possui um sistema completo de monitoramento que rastreia:
- **Cache Hit/Miss Rate**
- **TTFB (Time To First Byte)**
- **Redução de Queries**
- **Performance por Endpoint**

## 🚀 Uso Rápido

### Ver Métricas via API

```bash
# Todas as métricas
curl http://localhost:3000/api/metrics

# Apenas cache
curl http://localhost:3000/api/metrics?type=cache

# Apenas performance
curl http://localhost:3000/api/metrics?type=performance

# Endpoint específico
curl http://localhost:3000/api/metrics?endpoint=/estudar

# Formato JSON
curl http://localhost:3000/api/metrics | jq
```

### Análise via Script

```bash
# Análise completa
npm run analyze:performance

# Análise de endpoint específico
npm run analyze:performance -- --endpoint /estudar

# Exportar métricas
npm run analyze:performance -- --export

# Formato JSON
npm run analyze:performance -- --json
```

## 📈 Métricas Disponíveis

### 1. Cache Metrics

Rastreia hits e misses por chave de cache:

```json
{
  "cache": {
    "modulos-estudo-list": {
      "hits": 150,
      "misses": 20,
      "total": 170,
      "hitRate": 88.24
    }
  }
}
```

**Meta:** Hit Rate > 80%

### 2. Performance Metrics

Rastreia TTFB e status de cache por requisição:

```json
{
  "performance": {
    "stats": {
      "avgTTFB": 145.5,
      "minTTFB": 45.2,
      "maxTTFB": 890.3,
      "p95TTFB": 320.1,
      "cachedRate": 85.2,
      "totalRequests": 1250
    }
  }
}
```

**Meta:** TTFB Médio < 200ms

### 3. Query Metrics

Rastreia redução de queries ao banco:

```json
{
  "queries": {
    "totalQueries": 1000,
    "cachedQueries": 750,
    "reduction": 75.0
  }
}
```

**Meta:** Redução > 70%

## 🔧 Integração no Código

### Rastrear Cache Hit/Miss

```typescript
import { recordCacheHit, recordCacheMiss } from '@/lib/metrics';

// Quando cache é usado
recordCacheHit('modulos-estudo-list');

// Quando cache não está disponível
recordCacheMiss('modulos-estudo-list');
```

### Rastrear Performance

```typescript
import { recordPerformance } from '@/lib/metrics';

const startTime = Date.now();
// ... código ...
const ttfb = Date.now() - startTime;

recordPerformance('/estudar', 'GET', ttfb, true); // true = cached
```

### Usar Performance Tracker

```typescript
import { withPerformanceTracking } from '@/lib/performance-tracker';

export const GET = withPerformanceTracking(async (req: NextRequest) => {
  // Sua lógica aqui
  const response = NextResponse.json({ data });
  
  // Marcar como cached se aplicável
  return markAsCached(response);
});
```

## 📊 Dashboard de Métricas (Opcional)

Crie uma página de admin para visualizar métricas:

```typescript
// app/(admin)/admin/metrics/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function MetricsPage() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetch('/api/metrics')
      .then(res => res.json())
      .then(setMetrics);
  }, []);

  // Renderizar métricas...
}
```

## 🎯 Metas de Performance

| Métrica | Meta | Status |
|---------|------|--------|
| Cache Hit Rate | > 80% | ✅/⚠️/❌ |
| TTFB Médio | < 200ms | ✅/⚠️/❌ |
| Redução de Queries | > 70% | ✅/⚠️/❌ |
| P95 TTFB | < 500ms | ✅/⚠️/❌ |

## 🔍 Análise Detalhada

### Cache Hit Rate Baixo

**Possíveis causas:**
- Cache não está sendo usado corretamente
- Tempo de revalidação muito curto
- Dados mudam muito frequentemente

**Soluções:**
- Verificar se funções de cache estão sendo chamadas
- Aumentar tempo de revalidação
- Revisar estratégia de cache

### TTFB Alto

**Possíveis causas:**
- Queries lentas ao banco
- Cache não está funcionando
- Falta de índices no banco

**Soluções:**
- Verificar índices no banco de dados
- Otimizar queries
- Aumentar uso de cache

### Redução de Queries Baixa

**Possíveis causas:**
- Poucos endpoints usando cache
- Cache sendo invalidado muito frequentemente
- Dados muito dinâmicos

**Soluções:**
- Adicionar cache a mais endpoints
- Revisar estratégia de invalidação
- Considerar cache em memória para dados de sessão

## 📝 Logs

O sistema registra automaticamente:

```typescript
logger.debug('Cache operation', {
  key: 'modulos-estudo-list',
  cached: true,
  duration: 45,
});
```

## 🔄 Limpeza Automática

Métricas antigas são automaticamente limpas após 24 horas. Para ajustar:

```typescript
import { cleanOldMetrics } from '@/lib/metrics';

// Limpar métricas com mais de 12 horas
cleanOldMetrics(12);
```

## 🚨 Alertas (Futuro)

Configure alertas para:

- Cache hit rate < 50%
- TTFB > 500ms
- Redução de queries < 50%
- Erros de invalidação de cache

## 📚 Referências

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web Vitals](https://web.dev/vitals/)
- [Cache Strategies](https://web.dev/learn-web-vitals/)

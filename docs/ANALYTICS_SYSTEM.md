# Sistema de Analytics e Insights Avançados

## Visão Geral

O Sistema de Analytics e Insights Avançados do AVANT fornece análises detalhadas do desempenho do usuário, recomendações personalizadas e sistema de revisão espaçada para otimizar o aprendizado.

## Funcionalidades

### 1. Dashboard de Analytics (`/analytics`)

Dashboard completo com visualizações interativas:

- **Cards de Estatísticas**: Total de tentativas, acertos, erros, taxa de acerto, sequência de acertos
- **Gráfico de Progresso Temporal**: Evolução de desempenho ao longo do tempo (últimos 30 dias)
- **Heatmap de Desempenho**: Visualização de calor por tópico/subtópico
- **Análise de Padrões de Erro**: Identificação de áreas problemáticas
- **Recomendações Inteligentes**: Questões sugeridas baseadas em análise de desempenho
- **Revisões Espaçadas**: Lista de questões para revisar hoje

### 2. Sistema de Recomendação Inteligente

Algoritmo de priorização baseado em:

- **Áreas Fracas**: Taxa de acerto < 70%
- **Padrões de Erro**: Tópicos com alta taxa de erro
- **Questões Não Tentadas**: Conteúdo ainda não explorado
- **Revisão Necessária**: Questões antigas que precisam revisão
- **Revisão Espaçada**: Baseado em algoritmo SM-2

### 3. Revisão Espaçada (Spaced Repetition)

Sistema baseado na curva de esquecimento de Ebbinghaus:

- **Algoritmo SM-2 Simplificado**: Calcula intervalos ótimos para revisão
- **Priorização Automática**: Questões vencidas têm maior prioridade
- **Tracking de Facilidade**: Ajusta dificuldade baseado em desempenho

## Arquitetura

### Bibliotecas Principais

```
/lib
  /analytics.ts              # Funções de análise de dados
  /recommendations.ts         # Algoritmo de recomendação
  /spaced-repetition.ts       # Sistema de revisão espaçada

/components/analytics
  /StatsCards.tsx            # Cards de estatísticas
  /ProgressChart.tsx         # Gráfico de progresso temporal
  /PerformanceHeatmap.tsx    # Heatmap de desempenho
  /ErrorPatterns.tsx         # Análise de padrões de erro
  /Recommendations.tsx       # Lista de recomendações

/app
  /(dashboard)/analytics/    # Dashboard principal
  /api/analytics/            # APIs de analytics
    /summary/route.ts
    /recommendations/route.ts
    /reviews/route.ts
```

### Cache Estratégico

Todas as queries de analytics usam cache estratégico:

- **Histórico Completo**: Cache de 2 minutos (USER)
- **Recomendações**: Cache de 5 minutos (SEMI_STATIC)
- **Revisões**: Cache de 1 minuto (DYNAMIC)

## APIs

### GET `/api/analytics/summary`

Retorna resumo completo de analytics do usuário.

**Response:**
```json
{
  "overall": {
    "total": 150,
    "acertos": 120,
    "erros": 30,
    "percentual": 80,
    "streak": 5,
    "lastAttempt": "2026-01-27T10:00:00Z"
  },
  "byTopic": [...],
  "byBanca": [...],
  "timeSeries": [...],
  "errorPatterns": [...],
  "weakAreas": [...],
  "strongAreas": [...]
}
```

### GET `/api/analytics/recommendations`

Retorna questões recomendadas.

**Query Parameters:**
- `limit` (number): Número máximo de recomendações (padrão: 10)
- `prioritizeWeakAreas` (boolean): Priorizar áreas fracas (padrão: true)
- `includeNotAttempted` (boolean): Incluir questões não tentadas (padrão: true)

**Response:**
```json
{
  "recommendations": [
    {
      "modulo_slug": "questao-123",
      "titulo_aula": "Orações Subordinadas",
      "banca": "CPCON",
      "topico": "Língua Portuguesa",
      "subtopico": "Sintaxe",
      "priority": 85,
      "reason": "Área fraca (45% de acerto)",
      "category": "weak_area"
    }
  ]
}
```

### GET `/api/analytics/reviews`

Retorna questões para revisar hoje (revisão espaçada).

**Response:**
```json
{
  "reviews": [
    {
      "modulo_slug": "questao-123",
      "topico": "Língua Portuguesa",
      "subtopico": "Sintaxe",
      "nextReview": "2026-01-27T00:00:00Z",
      "interval": 3,
      "easeFactor": 2.3,
      "repetitions": 2,
      "priority": 50
    }
  ]
}
```

## Algoritmos

### Priorização de Recomendações

Score calculado com base em:

1. **Área Fraca**: `100 - percentual` pontos
2. **Padrão de Erro**: `taxaErro * 0.8` pontos
3. **Última Tentativa**: `diasDesdeUltimaTentativa * 2` pontos (máx 50)
4. **Erros Recentes**: `errosRecentes * 20` pontos
5. **Penalidade Recente**: `-50` pontos se tentada nas últimas 24h

### Revisão Espaçada (SM-2 Simplificado)

Intervalo calculado baseado em:

- **Qualidade da Resposta** (0-5):
  - 0-2: Erro → Intervalo = 1 dia, reduz ease factor
  - 3: Dificuldade → Intervalo = atual * 1.2
  - 4-5: Bom/Perfeito → Intervalo = atual * multiplicador * ease factor

- **Ease Factor**: Ajustado baseado em desempenho (1.3 - 2.5)

## Uso

### No Dashboard

Acesse `/analytics` para ver todas as visualizações e insights.

### Programaticamente

```typescript
import { getAnalyticsSummary } from '@/lib/analytics';
import { generateRecommendations } from '@/lib/recommendations';
import { getTodayReviews } from '@/lib/spaced-repetition';

// Obter resumo completo
const summary = await getAnalyticsSummary(userId);

// Gerar recomendações
const recommendations = await generateRecommendations(userId, {
  maxRecommendations: 10,
  prioritizeWeakAreas: true,
});

// Obter revisões para hoje
const reviews = await getTodayReviews(userId);
```

## Performance

- **Cache**: Todas as queries usam cache estratégico
- **Limites**: Histórico limitado a 5000 registros para análise
- **Otimização**: Queries otimizadas com índices existentes

## Próximos Passos

- [ ] Exportação de relatórios em PDF/Excel
- [ ] Comparação com outros usuários (anônimo)
- [ ] Notificações de revisões vencidas
- [ ] Gráficos avançados com recharts (opcional)
- [ ] Análise de tendências de longo prazo

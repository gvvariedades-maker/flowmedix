# Sistema de Cache Estratégico - AVANT

## 📋 Visão Geral

O sistema de cache do AVANT utiliza o **Next.js Data Cache** (`unstable_cache`) para otimizar performance e reduzir carga no banco de dados. O cache é implementado de forma estratégica, com diferentes tempos de revalidação baseados na frequência de mudança dos dados.

## 🎯 Objetivos

- ✅ **Reduzir queries ao banco** em 70-90%
- ✅ **Melhorar tempo de resposta** (< 200ms TTFB)
- ✅ **Reduzir custos** de infraestrutura
- ✅ **Manter dados atualizados** com revalidação inteligente

## ⏱️ Estratégias de Cache

### 1. Dados Estáticos (15 minutos)
**Uso:** Dados que raramente mudam
- Fluxogramas
- Estrutura de exames

**Configuração:**
```typescript
revalidate: 900 // 15 minutos
tags: ['static']
```

### 2. Dados Semi-Estáticos (5 minutos)
**Uso:** Dados que mudam ocasionalmente
- Lista de módulos de estudo
- Questões individuais
- Navegação entre questões

**Configuração:**
```typescript
revalidate: 300 // 5 minutos
tags: ['semi-static']
```

### 3. Dados Dinâmicos (1 minuto)
**Uso:** Dados que mudam frequentemente
- Estatísticas gerais
- Agregações

**Configuração:**
```typescript
revalidate: 60 // 1 minuto
tags: ['dynamic']
```

### 4. Dados de Usuário (2 minutos)
**Uso:** Dados específicos por usuário
- Histórico de questões por usuário
- Progresso individual

**Configuração:**
```typescript
revalidate: 120 // 2 minutos
tags: ['user']
```

## 📦 Funções de Cache Disponíveis

### Módulos e Questões

```typescript
// Lista de módulos
const modulos = await getModulosEstudoCached();

// Questão por slug
const questao = await getQuestaoBySlugCached('slug-da-questao');

// Lista de questões por banca
const questoes = await getQuestoesByBancaCached('CPCON', 'Português');
```

### Histórico

```typescript
// Histórico global
const historico = await getHistoricoQuestoesCached();

// Histórico por usuário
const historicoUser = await getHistoricoQuestoesCached(userId);
```

### Fluxogramas

```typescript
// Fluxograma por assunto
const fluxograma = await getFluxogramaByAssuntoCached(assuntoId);

// Lista de fluxogramas
const fluxogramas = await getFluxogramasCached();
```

## 🔄 Invalidação de Cache

### Invalidação Manual

```typescript
import { 
  invalidateModulosCache,
  invalidateQuestoesCache,
  invalidateFluxogramasCache,
  invalidateHistoricoCache,
  invalidateAllCache 
} from '@/lib/cache';

// Invalidar cache específico
await invalidateModulosCache();

// Invalidar tudo
await invalidateAllCache();
```

### Invalidação via Webhook (Supabase)

Configure um webhook no Supabase para invalidar cache automaticamente:

**URL:** `https://seu-dominio.com/api/cache/revalidate`

**Headers:**
```
Authorization: Bearer ${WEBHOOK_SECRET}
Content-Type: application/json
```

**Body (exemplo):**
```json
{
  "table": "modulos_estudo",
  "event": "UPDATE"
}
```

**Tabelas suportadas:**
- `modulos_estudo` → Invalida módulos e questões
- `historico_questoes` → Invalida histórico
- `flowcharts` → Invalida fluxogramas
- `exam_contents` → Invalida fluxogramas

### Invalidação por Tags

```typescript
import { revalidateTag } from 'next/cache';

// Invalidar por tag específica
revalidateTag('modulos-estudo');
revalidateTag('questoes');
```

## 🔧 Configuração

### Variáveis de Ambiente

```env
# Secret para webhook de invalidação (opcional)
WEBHOOK_SECRET=seu-secret-aqui
```

### Ajustar Tempos de Cache

Edite `lib/cache.ts`:

```typescript
export const CACHE_CONFIG = {
  STATIC: {
    revalidate: 900, // Ajuste aqui (segundos)
  },
  // ...
};
```

## 📊 Monitoramento

### Logs

O sistema registra todas as operações de cache:

```typescript
logger.info('Cache hit', { key: 'modulos-estudo' });
logger.info('Cache miss', { key: 'questao-by-slug' });
logger.info('Cache invalidated', { tag: 'modulos-estudo' });
```

### Métricas Recomendadas

- **Cache Hit Rate:** % de requisições servidas do cache
- **TTFB:** Time To First Byte (deve ser < 200ms)
- **Query Reduction:** Redução de queries ao banco

## 🚀 Performance Esperada

### Antes do Cache
- **Queries por página:** 2-5 queries
- **TTFB:** 300-800ms
- **Carga no banco:** Alta

### Depois do Cache
- **Queries por página:** 0-1 queries (após warm-up)
- **TTFB:** 50-200ms
- **Carga no banco:** Redução de 70-90%

## ⚠️ Considerações Importantes

### 1. Dados Sensíveis
Cache de dados de usuário deve considerar privacidade. Use `userId` como parte da chave de cache.

### 2. Stale Data
Dados podem estar até 15 minutos desatualizados. Para dados críticos em tempo real, use invalidação via webhook.

### 3. Desenvolvimento
Em desenvolvimento, cache pode ser desabilitado ou reduzido para facilitar debugging.

### 4. Produção
Em produção, sempre configure webhooks do Supabase para invalidação automática.

## 🔍 Debugging

### Verificar Cache

```typescript
// Adicionar logs temporários
const data = await getModulosEstudoCached();
console.log('Cache data:', data);
```

### Desabilitar Cache Temporariamente

```typescript
// Comentar função cached e usar query direta
// const data = await getModulosEstudoCached();
const data = await supabase.from('modulos_estudo').select('*');
```

## 📚 Referências

- [Next.js Data Cache](https://nextjs.org/docs/app/building-your-application/caching)
- [unstable_cache API](https://nextjs.org/docs/app/api-reference/functions/unstable_cache)
- [Revalidation](https://nextjs.org/docs/app/building-your-application/caching#revalidation)

## 🎯 Próximos Passos

1. ✅ Implementar cache estratégico
2. ⏳ Configurar webhooks do Supabase
3. ⏳ Adicionar métricas de performance
4. ⏳ Implementar cache em memória para sessão
5. ⏳ Cache de imagens e assets estáticos

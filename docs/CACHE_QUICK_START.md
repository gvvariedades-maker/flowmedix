# Cache - Guia Rápido

## 🚀 Uso Básico

### Em Server Components

```typescript
import { getModulosEstudoCached } from '@/lib/cache';

export default async function Page() {
  // Cache automático - revalida a cada 5 minutos
  const modulos = await getModulosEstudoCached();
  
  return <div>{/* ... */}</div>;
}
```

### Buscar Questão por Slug

```typescript
import { getQuestaoBySlugCached } from '@/lib/cache';

const questao = await getQuestaoBySlugCached('slug-da-questao');
```

### Buscar Histórico

```typescript
import { getHistoricoQuestoesCached } from '@/lib/cache';

// Histórico global
const historico = await getHistoricoQuestoesCached();

// Histórico por usuário
const historicoUser = await getHistoricoQuestoesCached(userId);
```

## 🔄 Invalidar Cache

### Manualmente

```typescript
import { invalidateModulosCache } from '@/lib/cache';

// Após criar/atualizar módulo
await invalidateModulosCache();
```

### Via Webhook (Recomendado)

Configure no Supabase Dashboard:

**URL:** `https://seu-dominio.com/api/cache/revalidate`

**Headers:**
```
Authorization: Bearer ${WEBHOOK_SECRET}
```

**Body:**
```json
{
  "table": "modulos_estudo",
  "event": "INSERT"
}
```

## ⏱️ Tempos de Cache

- **Estáticos:** 15 minutos (fluxogramas)
- **Semi-estáticos:** 5 minutos (módulos, questões)
- **Dinâmicos:** 1 minuto (estatísticas)
- **Usuário:** 2 minutos (histórico)

## 📊 Performance

- **Redução de queries:** 70-90%
- **TTFB:** < 200ms (após warm-up)
- **Cache hit rate:** Esperado > 80%

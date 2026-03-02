# Configuração de Webhooks via SQL Editor

## 📋 Visão Geral

Este guia explica como configurar webhooks de invalidação de cache usando **SQL diretamente no Supabase**, sem precisar usar a interface gráfica.

## 🎯 Objetivo

Criar triggers SQL que automaticamente invalidam o cache quando dados são inseridos, atualizados ou deletados nas tabelas críticas.

## 🔧 Pré-requisitos

1. Acesso ao SQL Editor do Supabase
2. Permissões para criar funções e triggers
3. URL da sua aplicação (produção ou desenvolvimento)

## 📝 Passo a Passo

### 1. Executar Migration SQL

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Abra o arquivo `supabase/migrations/create_cache_webhooks.sql`
4. **Cole todo o conteúdo** no editor SQL
5. Clique em **"Run"** ou pressione `Ctrl+Enter`

### 2. Configurar Variáveis (Opcional mas Recomendado)

Após executar a migration, configure as variáveis de ambiente do banco:

#### Para Desenvolvimento Local

```sql
-- Configurar URL do webhook para desenvolvimento
ALTER DATABASE postgres SET app.webhook_url = 'http://localhost:3000';

-- Configurar secret (ou use o padrão 'dev-secret')
ALTER DATABASE postgres SET app.webhook_secret = 'dev-secret';
```

#### Para Produção

```sql
-- Substitua pela URL da sua aplicação em produção
ALTER DATABASE postgres SET app.webhook_url = 'https://seu-dominio.com';

-- Use um secret forte em produção
ALTER DATABASE postgres SET app.webhook_secret = 'seu-secret-super-seguro-aqui';
```

**⚠️ Importante:** Gere um secret forte:
```bash
openssl rand -hex 32
```

### 3. Verificar Instalação

Execute para verificar se os triggers foram criados:

```sql
SELECT 
  trigger_name, 
  event_object_table, 
  action_timing,
  event_manipulation
FROM information_schema.triggers 
WHERE trigger_name LIKE 'cache_invalidate%'
ORDER BY event_object_table, event_manipulation;
```

Você deve ver 12 triggers (3 eventos × 4 tabelas):
- `modulos_estudo`: INSERT, UPDATE, DELETE
- `historico_questoes`: INSERT, UPDATE, DELETE
- `flowcharts`: INSERT, UPDATE, DELETE
- `exam_contents`: INSERT, UPDATE, DELETE

### 4. Testar Manualmente

Teste se a função de invalidação está funcionando:

```sql
-- Testar invalidação manual
SELECT invalidate_cache_via_webhook('modulos_estudo', 'INSERT');
```

Verifique os logs da sua aplicação - deve aparecer:
```
Cache invalidated { tag: 'modulos-estudo' }
```

## 🔍 Como Funciona

### Arquitetura

1. **Trigger SQL** detecta mudança na tabela (INSERT/UPDATE/DELETE)
2. **Função `invalidate_cache_via_webhook`** é chamada
3. **Requisição HTTP** é feita para `/api/cache/revalidate`
4. **Cache é invalidado** automaticamente

### Fluxo de Dados

```
INSERT/UPDATE/DELETE na tabela
    ↓
Trigger SQL detecta mudança
    ↓
Função invalidate_cache_via_webhook()
    ↓
Requisição HTTP POST para /api/cache/revalidate
    ↓
API invalida cache correspondente
    ↓
Próxima requisição busca dados atualizados
```

## 🧪 Testar Webhook

### Via SQL

```sql
-- Inserir um registro de teste
INSERT INTO modulos_estudo (modulo_slug, banca, conteudo_json)
VALUES ('teste-webhook', 'TESTE', '{}');

-- Verificar se trigger foi executado (ver logs da aplicação)
```

### Via cURL

```bash
# Testar endpoint diretamente
curl -X POST http://localhost:3000/api/cache/revalidate \
  -H "Authorization: Bearer seu-secret-aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "table": "modulos_estudo",
    "event": "INSERT"
  }'
```

## ✅ Verificação

Após configurar, teste:

1. **Inserir um novo módulo** via SQL:
   ```sql
   INSERT INTO modulos_estudo (modulo_slug, banca, conteudo_json)
   VALUES ('teste-cache', 'TESTE', '{}');
   ```

2. **Verificar logs** da aplicação - deve aparecer:
   ```
   Cache invalidated { tag: 'modulos-estudo' }
   ```

3. **Acessar a página** de módulos - deve mostrar o novo módulo imediatamente

## 🔍 Troubleshooting

### Erro: "extension pg_net does not exist"

**Solução:** A extensão `pg_net` precisa ser habilitada. Execute:

```sql
CREATE EXTENSION IF NOT EXISTS pg_net;
```

Se ainda não funcionar, verifique se sua instância do Supabase suporta `pg_net`. Em alguns casos, pode ser necessário usar Edge Functions ao invés de SQL direto.

### Erro: "permission denied for function net.http_post"

**Solução:** A função precisa ser executada com `SECURITY DEFINER`. Verifique se a função foi criada corretamente:

```sql
SELECT proname, prosecdef 
FROM pg_proc 
WHERE proname = 'invalidate_cache_via_webhook';
```

`prosecdef` deve ser `true`.

### Webhook não está sendo chamado

1. Verifique se os triggers estão ativos:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname LIKE 'cache_invalidate%';
   ```

2. Verifique as variáveis de configuração:
   ```sql
   SHOW app.webhook_url;
   SHOW app.webhook_secret;
   ```

3. Verifique os logs do Supabase (Dashboard → Logs → Postgres Logs)

### Erro 401 na aplicação

1. Verifique se `app.webhook_secret` está configurado corretamente
2. Verifique se o secret no `.env.local` da aplicação corresponde
3. Em desenvolvimento, o webhook aceita qualquer header (verifique `isValidWebhook`)

## 🔄 Alternativa: Usar Edge Functions

Se `pg_net` não estiver disponível, você pode usar Edge Functions do Supabase:

### 1. Criar Edge Function

```typescript
// supabase/functions/invalidate-cache/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { table, event } = await req.json()
  
  const response = await fetch(`${Deno.env.get('APP_URL')}/api/cache/revalidate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('WEBHOOK_SECRET')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ table, event }),
  })
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

### 2. Modificar Triggers para Chamar Edge Function

```sql
-- Ao invés de net.http_post, chamar Edge Function
PERFORM
  net.http_post(
    url := 'https://seu-projeto.supabase.co/functions/v1/invalidate-cache',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key'),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object('table', table_name, 'event', event_type)
  );
```

## 📊 Monitoramento

### Ver Triggers Ativos

```sql
SELECT 
  schemaname,
  tablename,
  triggername,
  tgtype,
  tgenabled
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE triggername LIKE 'cache_invalidate%';
```

### Ver Logs de Execução

Os logs aparecem em:
- **Supabase Dashboard** → Logs → Postgres Logs
- Procure por: `Cache invalidation triggered`

### Desabilitar Temporariamente

```sql
-- Desabilitar trigger específico
ALTER TABLE modulos_estudo DISABLE TRIGGER cache_invalidate_modulos_insert;

-- Reabilitar
ALTER TABLE modulos_estudo ENABLE TRIGGER cache_invalidate_modulos_insert;
```

## 🔐 Segurança

### Em Produção

1. **Use HTTPS** na URL do webhook
2. **Use um secret forte** (32+ caracteres aleatórios)
3. **Limite acesso** ao endpoint `/api/cache/revalidate`
4. **Monitore tentativas** de acesso não autorizadas

### Remover Logs em Produção

Se não quiser logs no banco, remova a linha `RAISE LOG` da função:

```sql
CREATE OR REPLACE FUNCTION invalidate_cache_via_webhook(...)
AS $$
BEGIN
  -- Remover esta linha em produção:
  -- RAISE LOG 'Cache invalidation triggered: ...';
  
  PERFORM net.http_post(...);
END;
$$;
```

## 🗑️ Remover Webhooks

Se precisar remover os webhooks:

```sql
-- Remover triggers
DROP TRIGGER IF EXISTS cache_invalidate_modulos_insert ON modulos_estudo;
DROP TRIGGER IF EXISTS cache_invalidate_modulos_update ON modulos_estudo;
DROP TRIGGER IF EXISTS cache_invalidate_modulos_delete ON modulos_estudo;
-- Repetir para outras tabelas...

-- Remover funções
DROP FUNCTION IF EXISTS trigger_invalidate_cache_modulos_insert();
DROP FUNCTION IF EXISTS trigger_invalidate_cache_modulos_update();
DROP FUNCTION IF EXISTS trigger_invalidate_cache_modulos_delete();
-- Repetir para outras tabelas...

DROP FUNCTION IF EXISTS invalidate_cache_via_webhook(TEXT, TEXT);
```

## 📚 Referências

- [Supabase pg_net Extension](https://supabase.com/docs/guides/database/extensions/pg_net)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/triggers.html)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

## 🎯 Comparação: SQL vs Interface Gráfica

| Aspecto | SQL | Interface Gráfica |
|---------|-----|------------------|
| **Controle** | ✅ Total | ⚠️ Limitado |
| **Versionamento** | ✅ Sim (migrations) | ❌ Não |
| **Reprodutibilidade** | ✅ Sim | ❌ Manual |
| **Facilidade** | ⚠️ Requer SQL | ✅ Mais fácil |
| **Manutenção** | ✅ Melhor | ⚠️ Mais difícil |

## ✅ Vantagens da Abordagem SQL

1. ✅ **Versionamento:** Migrations podem ser commitadas no git
2. ✅ **Reprodutibilidade:** Mesma configuração em dev/staging/prod
3. ✅ **Controle:** Ajustes finos via SQL
4. ✅ **Manutenção:** Mais fácil de documentar e revisar

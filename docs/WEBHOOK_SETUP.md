# Configuração de Webhook do Supabase

## 📋 Visão Geral

Este guia explica como configurar webhooks no Supabase para invalidar automaticamente o cache quando dados são atualizados.

## 🎯 Objetivo

Quando dados são inseridos, atualizados ou deletados no Supabase, o webhook automaticamente invalida o cache correspondente, garantindo que os usuários sempre vejam dados atualizados.

## 🔧 Pré-requisitos

1. Acesso ao Supabase Dashboard
2. URL da sua aplicação em produção (ou localhost para desenvolvimento)
3. Secret para autenticação do webhook (definir em `.env.local`)

## 📝 Passo a Passo

> 💡 **Prefere usar SQL?** Veja o guia alternativo: [WEBHOOK_SETUP_SQL.md](./WEBHOOK_SETUP_SQL.md)

### 1. Configurar Variável de Ambiente

Adicione ao seu `.env.local`:

```env
WEBHOOK_SECRET=seu-secret-super-seguro-aqui
```

**⚠️ Importante:** Use um secret forte em produção!

### 2. Acessar Supabase Dashboard

1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Database** → **Webhooks**

### 3. Criar Webhook para `modulos_estudo`

1. Clique em **"Create a new webhook"**
2. Preencha os campos:

   **Name:** `Invalidate Cache - modulos_estudo`
   
   **Table:** `modulos_estudo`
   
   **Events:** Selecione:
   - ✅ INSERT
   - ✅ UPDATE
   - ✅ DELETE
   
   **Type:** `HTTP Request`
   
   **HTTP Method:** `POST`
   
   **HTTP URL:** 
   ```
   https://seu-dominio.com/api/cache/revalidate
   ```
   (Para desenvolvimento local: `http://localhost:3000/api/cache/revalidate`)
   
   **HTTP Headers:**
   ```
   Authorization: Bearer ${WEBHOOK_SECRET}
   Content-Type: application/json
   ```
   
   **HTTP Body:**
   ```json
   {
     "table": "modulos_estudo",
     "event": "{{event}}"
   }
   ```

3. Clique em **"Save"**

### 4. Criar Webhook para `historico_questoes`

Repita o processo acima com:

- **Name:** `Invalidate Cache - historico_questoes`
- **Table:** `historico_questoes`
- **HTTP Body:**
  ```json
  {
    "table": "historico_questoes",
    "event": "{{event}}"
  }
  ```

### 5. Criar Webhook para `flowcharts`

- **Name:** `Invalidate Cache - flowcharts`
- **Table:** `flowcharts`
- **HTTP Body:**
  ```json
  {
    "table": "flowcharts",
    "event": "{{event}}"
  }
  ```

### 6. Criar Webhook para `exam_contents`

- **Name:** `Invalidate Cache - exam_contents`
- **Table:** `exam_contents`
- **HTTP Body:**
  ```json
  {
    "table": "exam_contents",
    "event": "{{event}}"
  }
  ```

## 🧪 Testar Webhook

### Via cURL

```bash
curl -X POST http://localhost:3000/api/cache/revalidate \
  -H "Authorization: Bearer seu-secret-aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "table": "modulos_estudo",
    "event": "INSERT"
  }'
```

### Via Script

Execute o script de configuração:

```bash
npm run setup:webhook
```

Ou manualmente:

```bash
bash scripts/setup-webhook.sh
```

## ✅ Verificação

Após configurar, teste:

1. **Inserir um novo módulo** no Supabase
2. **Verificar logs** da aplicação - deve aparecer:
   ```
   Cache invalidated { tag: 'modulos-estudo' }
   ```
3. **Acessar a página** de módulos - deve mostrar o novo módulo imediatamente

## 🔍 Troubleshooting

### Webhook não está sendo chamado

1. Verifique se o webhook está **ativo** no Supabase Dashboard
2. Verifique os **logs do webhook** no Supabase (aba "Logs")
3. Verifique se a URL está correta e acessível

### Erro 401 (Não autorizado)

1. Verifique se o `WEBHOOK_SECRET` está correto
2. Verifique se o header `Authorization` está sendo enviado corretamente
3. Em desenvolvimento, o webhook aceita qualquer header (verifique `isValidWebhook`)

### Cache não está sendo invalidado

1. Verifique os logs da aplicação
2. Teste manualmente via cURL
3. Verifique se as tags de cache estão corretas

## 📊 Monitoramento

Após configurar, monitore:

1. **Logs do Supabase:** Database → Webhooks → [Seu Webhook] → Logs
2. **Logs da Aplicação:** Procure por "Cache invalidated"
3. **Métricas:** Acesse `/api/metrics` para ver estatísticas

## 🔐 Segurança

### Em Produção

1. **Use HTTPS** para o webhook URL
2. **Use um secret forte** (gerar com: `openssl rand -hex 32`)
3. **Limite acesso** ao endpoint `/api/cache/revalidate` apenas para webhooks
4. **Monitore tentativas** de acesso não autorizadas

### Em Desenvolvimento

- O webhook aceita qualquer header em desenvolvimento
- Use `localhost` ou ngrok para testar localmente

## 📚 Referências

- [Supabase Webhooks Documentation](https://supabase.com/docs/guides/database/webhooks)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## 🎯 Próximos Passos

Após configurar webhooks:

1. ✅ Monitorar métricas de cache (`/api/metrics`)
2. ✅ Analisar performance (`npm run analyze:performance`)
3. ✅ Ajustar tempos de cache conforme necessário
4. ✅ Configurar alertas para falhas de webhook

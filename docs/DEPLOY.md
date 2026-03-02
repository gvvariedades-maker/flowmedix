# 🚀 GUIA DE DEPLOY - AVANT

**Última Atualização:** 2026-01-27

---

## 📋 CHECKLIST PRÉ-DEPLOY

### 1. Variáveis de Ambiente

Certifique-se de configurar todas as variáveis no Vercel (ou seu provedor):

```bash
# Obrigatórias
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon

# Opcionais (mas recomendadas)
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
GOOGLE_API_KEY=sua-google-api-key
NODE_ENV=production
```

### 2. Validação Local

Antes de fazer deploy, valide localmente:

```bash
# Validar variáveis de ambiente
npm run validate:env

# Build de produção
npm run build

# Testes
npm run test
npm run test:e2e

# Lint
npm run lint
```

### 3. Banco de Dados

Execute as migrações no Supabase:

```sql
-- Execute no SQL Editor do Supabase:
-- 1. supabase/schema.sql
-- 2. supabase/migrations/add_indexes_critical.sql
-- 3. supabase/migrations/create_historico_questoes.sql
-- 4. supabase/migrations/create_cache_webhooks.sql
```

### 4. RLS Policies

Verifique se as políticas RLS estão configuradas corretamente no Supabase.

---

## 🚀 DEPLOY NO VERCEL

### Passo 1: Conectar Repositório

1. Acesse [Vercel Dashboard](https://vercel.com)
2. Importe seu repositório GitHub
3. Configure o projeto

### Passo 2: Variáveis de Ambiente

Adicione todas as variáveis em **Settings > Environment Variables**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (opcional)
- `GOOGLE_API_KEY` (opcional)

### Passo 3: Build Settings

**Framework Preset:** Next.js  
**Build Command:** `npm run build`  
**Output Directory:** `.next` (padrão)

### Passo 4: Deploy

1. Clique em **Deploy**
2. Aguarde o build completar
3. Verifique se não há erros

### Passo 5: Verificação Pós-Deploy

```bash
# Health Check
curl https://seu-dominio.vercel.app/api/health

# Deve retornar:
{
  "status": "ok",
  "database": "ok",
  "timestamp": "...",
  "uptime": ...
}
```

---

## 🔍 MONITORAMENTO PÓS-DEPLOY

### 1. Health Check

Configure monitoramento para `/api/health`:
- UptimeRobot
- Pingdom
- Vercel Analytics

### 2. Logs

Monitore logs no Vercel Dashboard:
- **Deployments** > Selecione deployment > **Logs**

### 3. Erros

Configure Sentry (opcional) para tracking de erros:
- Adicione `NEXT_PUBLIC_SENTRY_DSN` nas variáveis de ambiente
- Configure `lib/sentry.ts`

---

## 🔄 ROLLBACK

Se algo der errado:

1. Acesse **Deployments** no Vercel
2. Encontre o deployment anterior que funcionava
3. Clique em **"..."** > **Promote to Production**

---

## 📊 VERIFICAÇÕES PÓS-DEPLOY

- [ ] Health check retorna `200 OK`
- [ ] Página inicial carrega corretamente
- [ ] Login funciona
- [ ] Questões carregam
- [ ] APIs respondem corretamente
- [ ] Sem erros no console do navegador
- [ ] Sem erros nos logs do Vercel

---

## 🐛 TROUBLESHOOTING

### Erro: "Missing required environment variables"

**Solução:** Verifique se todas as variáveis estão configuradas no Vercel.

### Erro: "Database connection failed"

**Solução:** 
1. Verifique `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Verifique se o Supabase está acessível
3. Verifique RLS policies

### Erro: "Rate limit exceeded"

**Solução:** Normal em caso de muitos acessos. Aguarde alguns segundos.

### Build falha

**Solução:**
1. Verifique logs do build no Vercel
2. Execute `npm run build` localmente para ver erros
3. Verifique se todas as dependências estão no `package.json`

---

## 📝 NOTAS IMPORTANTES

- **Cache:** O sistema de cache usa `unstable_cache` do Next.js
- **Webhooks:** Configure webhooks no Supabase para invalidação de cache
- **Rate Limiting:** Implementado em memória (resetado a cada restart)
- **Error Boundaries:** Erros são capturados e logados automaticamente

---

## 🔗 LINKS ÚTEIS

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Health Check Endpoint](/api/health)
- [Documentação Completa](./AUDITORIA_DEPLOY.md)

---

**Pronto para produção! 🎉**

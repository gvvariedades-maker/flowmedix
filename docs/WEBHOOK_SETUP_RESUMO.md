# 🚀 Configuração de Webhooks - Resumo Rápido

## Duas Opções Disponíveis

### Opção 1: Via SQL Editor (Recomendado) ⭐

**Mais rápido e versionável!**

1. Abra `supabase/migrations/create_cache_webhooks.sql`
2. Cole no **SQL Editor** do Supabase
3. Execute
4. Configure variáveis (opcional):

```sql
ALTER DATABASE postgres SET app.webhook_url = 'https://seu-dominio.com';
ALTER DATABASE postgres SET app.webhook_secret = 'seu-secret-aqui';
```

**📖 Guia completo:** [WEBHOOK_SETUP_SQL.md](./WEBHOOK_SETUP_SQL.md)

### Opção 2: Via Interface Gráfica

1. Supabase Dashboard → Database → Webhooks
2. Criar webhook para cada tabela manualmente
3. Configurar URL, headers e body

**📖 Guia completo:** [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md)

## ✅ Qual Escolher?

| Aspecto | SQL | Interface |
|---------|-----|-----------|
| **Velocidade** | ⚡ Mais rápido | 🐌 Mais lento |
| **Versionamento** | ✅ Sim | ❌ Não |
| **Reprodutibilidade** | ✅ Sim | ❌ Não |
| **Facilidade** | ⚠️ Requer SQL | ✅ Mais fácil |

**Recomendação:** Use **SQL** se você quer versionamento e reprodutibilidade. Use **Interface** se prefere configuração visual.

## 🧪 Testar

```bash
# Testar invalidação manual
curl -X POST http://localhost:3000/api/cache/revalidate \
  -H "Authorization: Bearer seu-secret" \
  -H "Content-Type: application/json" \
  -d '{"table": "modulos_estudo", "event": "INSERT"}'
```

## 📚 Documentação Completa

- **SQL:** [WEBHOOK_SETUP_SQL.md](./WEBHOOK_SETUP_SQL.md)
- **Interface:** [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md)

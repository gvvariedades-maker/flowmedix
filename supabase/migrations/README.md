# Migrations Supabase (AVANT)

Todas as alterações de schema passam por arquivos timestamped nesta pasta. **Não** aplicar DDL só no SQL Editor sem commit correspondente.

## Convenção

```
YYYYMMDDHHMMSS_descricao_snake_case.sql
```

## Fluxo

```bash
npx supabase migration list   # local ↔ remoto
npm run db:push               # aplica pendentes no projeto linkado
```

Checklist de PR: [`docs/MIGRATIONS_PR_CHECKLIST.md`](../../docs/MIGRATIONS_PR_CHECKLIST.md).

## Reconciliar drift (local ↔ remoto)

Quando o remoto foi aplicado com timestamps diferentes (SQL Editor, branch antiga, reaplicação):

1. **Nunca** reaplicar DDL destrutivo só para “alinhar” versões.
2. Compare por **nome lógico** (`vitrine_page_includes_facets`, não só prefixo numérico).
3. **Renomeie** arquivos locais para o timestamp registrado em `supabase_migrations.schema_migrations` no remoto.
4. Duplicatas idempotentes no remoto → arquivo local no-op (`SELECT 1;`) com comentário.
5. Migration aplicada em partes no remoto → dividir arquivos locais na mesma ordem/versões.
6. Confirme: `npx supabase migration list` (colunas Local e Remote iguais) e `npm run db:push` → `Remote database is up to date`.

Runbook completo: [`docs/SUPABASE_MAINTENANCE.md`](../../docs/SUPABASE_MAINTENANCE.md#reconciliar-drift-migrations).

**Última reconciliação:** 2026-06-04 — 38 migrations alinhadas ao projeto `ozgouenqrofnvgrlgfwd`.

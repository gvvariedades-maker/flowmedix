# C5 — Runbook DROP FSRS (`spaced_review_*` + `fsrs_persist_review`)

**Data classificação:** 2026-07-30  
**Modo desta sessão:** migration + código preparados; **DDL remoto NÃO aplicado** (MCP read-only + invariante ADR).

## Classificação dos dados (banco primário)

| Objeto | Qtd | email | Conclusão |
|--------|-----|-------|-----------|
| spaced_review_cards | 1 | fsrs-mvp-smoke@avant.test | Resíduo de **smoke/beta** (não aluno pagante) |
| spaced_review_logs | 2 | fsrs-mvp-smoke@avant.test | Idem (cold_practice + scheduled_review) |

Natureza: **teste interno** do loop #73. Backup ainda obrigatório antes do DROP.

## Staging

Estado de staging separado: **ainda indeterminado**.

## Backup (obrigatório antes do DROP)

```sql
CREATE TABLE IF NOT EXISTS public._backup_spaced_review_cards_20260730 AS
SELECT * FROM public.spaced_review_cards;

CREATE TABLE IF NOT EXISTS public._backup_spaced_review_logs_20260730 AS
SELECT * FROM public.spaced_review_logs;

SELECT count(*) FROM public._backup_spaced_review_cards_20260730;
SELECT count(*) FROM public._backup_spaced_review_logs_20260730;
```

Esperado: 1 e 2.

## Aplicar migration

Arquivo: `supabase/migrations/20260730120000_drop_spaced_review_fsrs_mvp.sql`

Após autorização humana + backup verificado: `npx supabase db push` ou SQL Editor.

## Pós-DROP

Confirmar ausência de tabelas e RPC. Código do PR remove checks anon FSRS.
Não apaga `20260728040000_spaced_review_fsrs_mvp.sql`. Não toca `historico_questoes`.

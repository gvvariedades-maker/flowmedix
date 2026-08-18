# Handoff operacional — Meu Desempenho V1 / V1.1 (zona vermelha)

Código e testes do hub estão fecháveis localmente ([relatório](DESEMPENHO_TEC_ADAPTADO_V1_RELATORIO.md) · [auditoria pré-commit](DESEMPENHO_TEC_ADAPTADO_V1_AUDITORIA_PRE_COMMIT.md)). O que segue exige humano com credenciais reais.

| Item | Estado | Quem fecha |
|------|--------|------------|
| Migration / coluna `respondida` | **COMPROVADO NESTA AUDITORIA POR SELECT DE METADADOS** (projeto `ozgouenqrofnvgrlgfwd`) — **não** reaplicar | — |
| Smoke RLS com secrets reais | **PASS** (2026-08-14) — `npm run smoke:rls` no projeto `ozgouenqrofnvgrlgfwd` (mesmo host de `.env.local` e Vercel prod): anon vê 2 concursos vendáveis; `modulos_estudo` / `historico_questoes` / `concurso_matriculas` / `stripe_webhook_events` vazios sem JWT; service_role vendáveis=2 ≥ anon | — |
| Deploy | **Não executado** até commit/PR desta remediação residual | humano |

O hub já filtra `respondida !== false` no agregador de estudo. A vitrine RPC também.

## 1. Inspeção já feita (não repetir migration)

```sql
-- Metadados (seguro)
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'historico_questoes'
  and column_name = 'respondida';

-- Agregados (sem dump pessoal)
select count(*)::int as total,
       count(*) filter (where respondida)::int as respondida_true,
       count(*) filter (where not respondida)::int as respondida_false
from public.historico_questoes;

select pg_get_functiondef(oid) like '%FILTER (WHERE hq.respondida)%' as rpc_atualizada
from pg_proc
where proname = 'get_vitrine_page'
limit 1;
```

Resultado da auditoria pré-commit (2026-08-12): coluna presente; 836/836/0; `rpc_atualizada = true`. Nenhuma escrita.

## 2. Não reaplique

Arquivo histórico: [`supabase/migrations/20260811120000_historico_questoes_respondida.sql`](../supabase/migrations/20260811120000_historico_questoes_respondida.sql).

Só reaplique se um SELECT futuro mostrar coluna ausente. O `UPDATE` de retrofit e o `DROP FUNCTION` da RPC são destrutivos em janela de produção.

## 3. Smoke RLS com secrets reais

```bash
# .env com NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY (service role para comparação)
npm run smoke:rls
```

Leia `scripts/rls-performance-smoke.ts` antes: usa o projeto do `.env` (anon + opcional service role). `SKIPPED` por falta de variável **não é PASS**.

Executado em 2026-08-14 neste workspace: **PASS** (7/7 checks) contra `ozgouenqrofnvgrlgfwd`. Companion SQL no Editor permanece opcional e não foi reexecutado.

## 4. Deploy

Ordem sugerida: smoke RLS PASS → `npm run check:ship` → `npm run build` → deploy da branch após commit/PR aprovado.

## 5. Verificação pós-deploy (5 min)

| Onde | O que esperar |
|------|---------------|
| `/desempenho` | placar com `% · acertos/respondidas`; erro ≠ `0%` positivo |
| `/desempenho?periodo=7d` | intervalo em datas civis de Brasília |
| `/desempenho/simulados` | "Últimos 12 meses"; chips removíveis |
| `/desempenho/atividade` | heatmap Brasília; reset diz que simulados permanecem |
| Hub → Cadernos | marcar assunto → wizard estrito só com a seleção |
| Vitrine | `%` não sobe por estudo reverso sem resposta (`respondida=false`) |

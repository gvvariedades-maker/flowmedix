# Scale health check

Mapeia **quão perto o AVANT está dos tetos** definidos no código (vitrine 10k, 200 questões/assunto, histórico 5k em analytics, tamanho de `conteudo_json`).

## Pré-requisito

Aplicar a migration `20260524100000_scale_health_metrics_rpc.sql` (função `avant_scale_health_metrics`, só `service_role`).

Para catálogo até **10.000** módulos: configurar **Max Rows** no Supabase — ver [`SUPABASE_MAX_ROWS.md`](./SUPABASE_MAX_ROWS.md).

```bash
npm run db:push
```

## CLI

```bash
npm run scale:health
npm run scale:health -- --json
npm run scale:health -- --probe   # GET em NEXT_PUBLIC_APP_URL/estudar/{último slug}
```

Variáveis: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. Com `--probe`: `NEXT_PUBLIC_APP_URL`.

Exit code: `0` ok, `1` warnings, `2` critical.

## API admin

`GET /api/admin/scale-health` (sessão admin) — mesmo payload JSON do `--json`.

## O que mede

| Métrica | Teto no código |
|--------|----------------|
| `modulos_estudo_count` | 10.000 (`SCALE_LIMITS.VITRINE_MODULOS`, `ACCESSIBLE_MODULOS`) — ver `docs/SUPABASE_MAX_ROWS.md` |
| `assuntos_over_200_count` | 200 (`getQuestoesByAssuntoCached`) |
| `users_historico_over_5000` | 5.000 (`lib/analytics`, SRS) |
| `json_bytes` (avg / P95 / max) | alertas em 50 KB P95, 100 KB / 200 KB max |
| `reverse_slides.not_four_slides` | schema espera 4 slides |

O **probe HTTP** é uma amostra única (último módulo por `created_at`), não substitui P95 real de produção (Vercel Analytics / logs).

## Latência do player

O modelo atual (`/estudar/[slug]` RSC + `loading.tsx`) não entra no RPC. Para P95 de rota, use monitoramento de hosting ou testes e2e repetidos após deploy.

## Baseline operacional (recomendado por release)

1. Validar Max Rows (`npm run supabase:max-rows -- --dry-run`).
2. Gerar saúde do catálogo (`npm run scale:health -- --json`).
3. Gerar probe HTTP (`npm run scale:health -- --probe --json`).
4. Salvar evidência em `docs/perf-baseline-YYYY-MM-DD.json` usando `docs/perf-baseline-template.json`.

Campos mínimos no baseline:
- data e ambiente (`dev|staging|prod`);
- resultado completo do `scale:health --json`;
- `postgrest.max_rows` atual/alvo;
- resultado do probe (`status`, `duration_ms`, `url`).

## Validação de plano de query (staging 10k)

Após aplicar migrations da vitrine (Fase 1.1/Fase 1.3), validar no SQL Editor do staging:

```sql
-- 1) Confirmar índices aplicados
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'modulos_estudo'
  AND indexname IN (
    'idx_modulos_estudo_banca_titulo_aula',
    'idx_modulos_estudo_titulo_aula_created_at',
    'idx_modulos_estudo_titulo_aula_trgm',
    'idx_modulos_estudo_modulo_nome_trgm',
    'idx_modulos_estudo_banca_trgm',
    'idx_modulos_estudo_modulo_slug_trgm'
  )
ORDER BY indexname;

-- 2) Plano da busca textual (esperado: Bitmap/Index Scan, não Seq Scan dominante)
EXPLAIN (ANALYZE, BUFFERS)
SELECT m.id
FROM public.modulos_estudo m
WHERE lower(coalesce(m.titulo_aula, '')) LIKE '%feridas%'
   OR lower(coalesce(m.modulo_nome, '')) LIKE '%feridas%'
   OR lower(coalesce(m.banca, '')) LIKE '%feridas%'
   OR lower(coalesce(m.modulo_slug, '')) LIKE '%feridas%'
LIMIT 200;

-- 3) Plano para filtro banca + assunto + ordenação
EXPLAIN (ANALYZE, BUFFERS)
SELECT m.id, m.titulo_aula, m.created_at
FROM public.modulos_estudo m
WHERE m.banca = 'IDECAN'
  AND m.titulo_aula = 'Curativos e Manejo de Feridas'
ORDER BY m.created_at DESC
LIMIT 200;
```

Checklist de aceite em staging (catálogo >= 10k):
- o plano da busca textual usa índices `trgm` na maior parte dos cenários de `q`;
- o plano banca+assunto evita varredura completa em `modulos_estudo`;
- sem regressão de p95 nas rotas `/api/vitrine` e `/api/vitrine/facets` vs baseline.

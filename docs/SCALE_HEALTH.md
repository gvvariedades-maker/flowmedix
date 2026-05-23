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

# Supabase — Max Rows (PostgREST) e escala AVANT

## O que é Max Rows

No Supabase, **Max Rows** (Dashboard → **Project Settings** → **API** → **Max Rows**) define o teto de linhas que o PostgREST devolve em **uma** requisição quando o cliente usa `.select()` com `.limit(n)` alto ou sem paginação explícita.

- Valor padrão do projeto: frequentemente **1.000**.
- Requisições que pedem mais linhas que o teto são **truncadas** (sem erro visível no client) ou falham conforme versão/config.

Documentação: [Supabase API settings](https://supabase.com/docs/guides/api/rest/api-settings).

## Tetos no código AVANT (após Fase 3 vitrine)

| Constante | Valor | Onde |
|-----------|-------|------|
| `SCALE_LIMITS.VITRINE_MODULOS` | **10.000** | `lib/scale/constants.ts` → `getModulosEstudoCached` |
| `SCALE_LIMITS.ACCESSIBLE_MODULOS` | **10.000** | `lib/concursos/entitlements.ts` → catálogo por matrícula |
| `getQuestoesByAssuntoCached` | 200 | `lib/cache.ts` |
| `getHistoricoQuestoesCached` | 1.000 | `lib/cache.ts` (vitrine usa histórico por slugs do filtro) |

## O que configurar no Supabase (produção)

Para suportar até **10.000** módulos na vitrine global e leituras `.limit(10000)`:

1. Abra o projeto no [Supabase Dashboard](https://supabase.com/dashboard).
2. **Settings** → **API** → **Max Rows**.
3. Defina **≥ 10.000** (recomendado: **10.000** ou **15.000** se houver margem).
4. Salve e aguarde propagação (geralmente imediata).

**Automático (CLI):** com Personal Access Token (`data_api_config_write`):

```bash
SUPABASE_ACCESS_TOKEN=sbp_... npm run supabase:max-rows
```

Sem isso, o catálogo cacheado pode parar em ~1.000 módulos mesmo com o código em 10k.

## Paginação que não depende só de Max Rows

O AVANT já pagina vínculos grandes no servidor:

- `concurso_modulos`: páginas de **1.000** (`CONCURSO_MODULOS_PAGE_SIZE` em `lib/concursos/entitlements.ts`).
- Vitrine UI: **12 assuntos** por página via `GET /api/vitrine` (`lib/vitrine/service.ts`), sem enviar 10k cards no RSC.

## Monitoramento

```bash
npm run scale:health
```

Alertas `CATALOG_NEAR_VITRINE_CAP` / `CATALOG_AT_VITRINE_CAP` usam `SCALE_LIMITS.VITRINE_MODULOS` (10k). Ver também `docs/SCALE_HEALTH.md`.

## Checklist deploy (10k questões)

- [ ] Max Rows ≥ 10.000 no Supabase
- [ ] `npm run scale:health` sem crítico de catálogo
- [ ] Vitrine `/estudar` carrega via `/api/vitrine` (Network: payload pequeno por página)
- [ ] Player `/estudar/[slug]` continua com navegação e dots janelados (Fases 1–2)

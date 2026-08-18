# FSRS MVP ops — 2026-07-29T19:58:19.457Z

**Modo:** `live`

## Contagens (negócio)

Sintéticos/smoke excluídos quando identificados (`syntheticExcluded=true`).

| Métrica | Valor |
|---------|-------|
| Cards (negócio) | 0 |
| Logs (negócio) | 0 |
| Cards brutos | 1 |
| Logs brutos | 2 |
| Cards sintéticos | 1 |
| Logs sintéticos | 2 |
| rating=good | 0 |
| rating=again | 0 |
| same_stem_fallback | 0 |
| inventory_missing | n/a |
| Good rate (intervalo ≥ 7d) | n/a (n=0) |
| Acerto D+7 | n/a (n=0) |
| Acerto D+14 | n/a (n=0) |
| Lapses / usuário / dia | n/a |
| Due agora | 0 |
| Carga due (ratio) | n/a |
| same_stem rate | n/a |
| inventory_missing rate | n/a |

## Critérios go/no-go (provisórios)

| Critério | Barra | Status |
|----------|-------|--------|
| Volume mínimo de logs (≥ 50 reviews elegíveis) | ≥ 50 spaced_review_logs | unknown |
| Retenção Good (intervalo ≥ 7d) | Good rate ∈ [0.70, 0.95] com n≥50 (scheduled_days ≥ 7) | unknown |
| Acerto D+7 (1ª tentativa elegível pós-due ≥ 7d) | ≥ 0.65 com n≥30 | insufficient_window |
| Acerto D+14 (1ª tentativa elegível pós-due ≥ 14d) | ≥ 0.55 com n≥20 | insufficient_window |
| Lapses / usuário / dia | < 3.0 (rating=again na janela) | unknown |
| Carga due (due agora / limite diário agregado) | ratio ≤ 1.5 (monitorar fila beta) | unknown |
| Taxa same_stem_fallback | < 40% com n≥50 | unknown |
| Taxa inventory_missing (telemetria de fila) | < 10% com n≥50 (agregar logger até view SQL) | unknown |
| Default-on global | Exige decisão humana após critérios acima — fora deste script | unknown |

## Notas

- Script **read-only**; não altera parâmetros FSRS nem liga `FSRS_MVP_ENABLED`.
- Artefato sem PII (sem e-mail, nome, CPF; sem user_id listado).
- Dados sintéticos (smoke) são identificáveis e **excluídos** das métricas de negócio.
- Acerto D+7/D+14 sem janela madura → `insufficient_window` (não é sucesso; bloqueia default-on).
- Contadores apply/skip/persist_fail/idempotent: instrumentar via logger (R3+) e agregar aqui.

## Decisão

| Escopo | Veredito |
|--------|----------|
| **Staging beta** | **GO** |
| **Default-on global** | **NO-GO** |

- FSRS MVP 100% funcional no staging beta (não globalmente em produção).
- D+7/D+14 sem janela madura (insufficient_window) ou sem amostra — bloqueia default-on.
- Volume de negócio < 50 reviews elegíveis — bloqueia default-on.
- Rollback Production: manter FSRS_MVP_ENABLED=false.

**Rollback:** `FSRS_MVP_ENABLED=false` (Preview staging e/ou Production).

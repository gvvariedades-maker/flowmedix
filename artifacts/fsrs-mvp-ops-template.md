# FSRS MVP ops — template (R5)

Gerado por:

- `npm run fsrs:ops-report` — live (credenciais Supabase)
- `npm run fsrs:ops-report -- --dry-run` — contadores zerados, exit 0, sem credenciais

Critérios numéricos abaixo são **provisórios** (PLANO §6.3 · ADR §15). Default-on global exige decisão humana.

## Contagens

| Métrica | Valor |
|---------|-------|
| Cards | (pendente execução) |
| Logs | (pendente execução) |
| rating=good | — |
| rating=again | — |
| same_stem_fallback | — |
| inventory_missing | — (telemetria de fila; n/a até agregação) |
| Good rate (intervalo ≥ 7d) | — |
| Acerto D+7 | — |
| Acerto D+14 | — |
| Lapses / usuário / dia | — |
| Due agora | — |
| Carga due (ratio) | — |

## Critérios go/no-go (provisórios)

| Critério | Barra | Status |
|----------|-------|--------|
| Volume mínimo de logs | ≥ 50 spaced_review_logs | unknown |
| Retenção Good (intervalo ≥ 7d) | Good rate ∈ [0.70, 0.95] com n≥50 (`scheduled_days ≥ 7`) | unknown |
| Acerto D+7 (1ª elegível pós-due ≥ 7d) | ≥ 0.65 com n≥30 | unknown |
| Acerto D+14 (1ª elegível pós-due ≥ 14d) | ≥ 0.55 com n≥20 | unknown |
| Lapses / usuário / dia | < 3.0 (`rating=again` na janela) | unknown |
| Carga due (due / limite diário) | ratio ≤ 1.5 (monitorar fila beta) | unknown |
| Taxa same_stem_fallback | < 40% com n≥50 | unknown |
| Taxa inventory_missing | < 10% com n≥50 (logger até view SQL) | unknown |
| Default-on global | Decisão humana após critérios | unknown |

## PII

Artefato **sem** e-mail, nome, CPF ou `user_id` listado — só contagens agregadas.

## Decisão

**Default-on global:** não recomendado até critérios passarem + revisão humana.

Não alterar rating policy / parâmetros FSRS sem novo ADR.

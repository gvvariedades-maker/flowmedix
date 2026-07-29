# FSRS MVP ops — template (R5)

Gerado por `npx tsx scripts/fsrs-mvp-ops-report.ts` quando as credenciais Supabase estão disponíveis.

## Contagens

| Métrica | Valor |
|---------|-------|
| Cards | (pendente execução) |
| Logs | (pendente execução) |
| rating=good | — |
| rating=again | — |
| same_stem_fallback | — |

## Critérios go/no-go (provisórios)

| Critério | Barra | Status |
|----------|-------|--------|
| Volume mínimo de logs | ≥ 50 | unknown |
| Good rate observacional | ∈ [0.70, 0.95] com n≥50 | unknown |
| Taxa same_stem_fallback | < 40% com n≥50 | unknown |
| Default-on global | Decisão humana após critérios | unknown |

## Decisão

**Default-on global:** não recomendado até critérios passarem + revisão humana.

Não alterar rating policy / parâmetros FSRS sem novo ADR.

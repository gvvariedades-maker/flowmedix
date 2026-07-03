# Imunização — repair ADM&TEC adolescente (cartão perdido)

**Subtópico:** Imunização  
**Modo:** Handcraft golden-v1 — repair pontual (1 slug)  
**Status:** **applied** (2026-07-02)

Runbook: [`docs/GOLDEN_HANDCRAFT_MODEL.md`](../../../docs/GOLDEN_HANDCRAFT_MODEL.md) · [`docs/HANDCRAFT_CONVERSA.md`](../../../docs/HANDCRAFT_CONVERSA.md)

## Questão documentada

| Campo | Valor |
|-------|--------|
| Slug | `adm-tec-enfermagem-imunizacao-1779563986606-5` |
| Vitrine | **Q-3687** |
| Golden | [`examples/questao-premium-admtec-imunizacao-adolescente-cartao-perdido.json`](../../../examples/questao-premium-admtec-imunizacao-adolescente-cartao-perdido.json) |
| Banca / ano | ADM&TEC 2025 |
| Comando | Regularizar esquema vacinal (cartão perdido) |
| Gabarito | **C** — reiniciar calendário da faixa etária + cartão substituto |
| Cluster | Calendário adolescente/adulto |
| Ramo L3 (audit) | `imunizacao_calendario` |
| Player | `/estudar/adm-tec-enfermagem-imunizacao-1779563986606-5` |

## Pipeline (reaplicar)

```bash
npm run audit:questao-readiness -- --file=examples/questao-premium-admtec-imunizacao-adolescente-cartao-perdido.json
npm run catalog:apply-lote -- --lote=imunizacao-admtec-adolescente-cartao-repair --dry-run
npm run catalog:apply-lote -- --lote=imunizacao-admtec-adolescente-cartao-repair --apply
```

**Não usar:** `ai:generate` · `catalog:upgrade-premium`

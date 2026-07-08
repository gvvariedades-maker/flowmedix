# Urgências — repair Instituto Access RCP pediátrica

**Subtópico:** Urgências e Emergências  
**Ramo:** `urgencias_rcp_pediatrico`  
**Status:** handcraft_ready → apply

## Questão

| Campo | Valor |
|-------|--------|
| Slug | `instituto-access-enfermagem-urgencias-e-emergencias-1777104007115-1` |
| Golden | [`examples/questao-premium-access-urgencias-rcp-pediatrica-15-2.json`](../../../examples/questao-premium-access-urgencias-rcp-pediatrica-15-2.json) |
| Banca / ano | Instituto Access 2023 |
| Gabarito | **D** — 15:2 · ~⅓ diâmetro AP · 100–120/min |
| Sub-âncora | [`pcr-pediatrica-conceito`](../../../examples/questao-premium-consulpam-urgencias-pcr-pediatrica-conceito.json) (READY) |
| Player | `/estudar/instituto-access-enfermagem-urgencias-e-emergencias-1777104007115-1` |

## Nota de cluster

O slug `ameosc-…-1780011961798-6` do relatório inicial trazia conteúdo de RCP **adulto** (V/F); esta âncora corrige o P0 do ramo.

## Pipeline

```bash
npm run audit:questao-readiness -- --file=examples/questao-premium-access-urgencias-rcp-pediatrica-15-2.json
npm run audit:anchor-review -- --lote=urgencias-access-rcp-pediatrica-repair --record-pass --skip-capture
npm run catalog:apply-lote -- --lote=urgencias-access-rcp-pediatrica-repair --apply
```

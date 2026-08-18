# Âncoras — Atenção Básica / Saúde da Família

**Modo agente na frente** (skill `avant-golden-anchor-bootstrap`).

| Campo | Valor |
|-------|-------|
| gate | `block` |
| handcraft_allowed | `false` |
| goldens_needed | 3 |
| cluster_report | `artifacts/atencao-basica-saude-da-familia-topic-cluster-report.json` |

## Fila (criar nesta ordem)

| # | Cluster | Branch | Sample slug | Arquivo sugerido |
|---|---------|--------|-------------|------------------|
| 1 | ACS — atribuições, visita e território | `—` | `adm-tec-enfermagem-atencao-basica-saude-da-familia-1778968077998-3` | `examples/questao-premium-adm-atencao-basica-saude-da-familia-acs-atribuicoes-visita-e-territorio.json` |
| 2 | Atenção Básica — conceito geral | `—` | `amauc-enfermagem-processo-de-enfermagem-1780006486032-7` | `examples/questao-premium-amauc-atencao-basica-saude-da-familia-atencao-basica-conceito-geral.json` |
| 3 | eSF — composição, carga e modalidades | `—` | `ameosc-enfermagem-atencao-basica-saude-da-familia-1778967776515-0` | `examples/questao-premium-ameosc-atencao-basica-saude-da-familia-esf-composicao-carga-e-modalidades.json` |

## Pipeline por âncora

1. Ler export do `sample_slug` (pacote-completo ou lote).
2. `avant-classify-family` → `meta.family`.
3. Copiar `examples/_TEMPLATE-golden-v1.json`.
4. `avant-golden-anchor-handcraft` → 4 slides; `[READY]` strict-v2.
5. Registrar em `GOLDEN_BY_CLUSTER` / `*-golden-anchors.json`.
6. Re-rodar `npm run audit:golden-anchor-gate -- --subtopico="..."`.

## Cluster

```bash
npm run cluster:atencao-basica
```

- 3 ramo(s) forte(s) sem golden âncora em examples/ — criar antes do g01.
- Skill: avant-golden-anchor-bootstrap · triggers: Criar âncoras: / Antes do g01:
- Depois: npm run audit:golden-anchor-gate -- --subtopico="..."

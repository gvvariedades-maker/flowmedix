# Handcraft briefing — Punção Venosa e Cuidados com Cateteres

**Modo automático** (trigger `Handcraft:`). Executar sem pedir confirmação de modo.

## Escopo

- **Subtópico inteiro** — handcraft golden-v1 A1+A2+A3
- **Primeiro lote:** `puncao-venosa-e-cuidados-com-cateteres-g01`

## Pacote (registry)

| Campo | Valor |
|-------|-------|
| pacote_prefix | `puncao-venosa-e-cuidados-com-cateteres` |
| status | applied (110/110 slugs) |
| manifest | `data/catalog-migration/puncao-venosa-e-cuidados-com-cateteres-completo/manifest.json` |
| lote_pattern | `puncao-venosa-e-cuidados-com-cateteres-g{NN}` |
| lote_size | 8 |
| anchor_glob | `examples/questao-premium-*-puncao-*.json,examples/questao-premium-admtec-puncao-venosa-cateteres.json` |
| guideline | `lib/guidelines/puncaoVenosa.ts` |
| handcraft_meta | `data/catalog-migration/puncao-venosa-e-cuidados-com-cateteres-completo/handcraft-meta.json` |

## Ramos L3 (pedagogical_branch)

  - **puncao_flebite** — Infiltração, flebite, extravasamento, hematoma, complicações locais do acesso · iv-complication-orbit · iv-differential-board · iv-complication-tap-flow · iv-label-swap-trap
    Âncoras: examples/questao-premium-avancasp-puncao-infiltracao-flebite.json
  - **puncao_dispositivo** — Calibre, jelco, scalp, dispositivo, gauge · iv-gauge-matrix · iv-device-reference-board · iv-device-tap-flow · iv-gauge-mismatch-trap
    Âncoras: examples/questao-premium-gama-puncao-scalp-jelco-calibre.json
  - **puncao_exceto** — EXCETO / INCORRETA em técnica ou conduta de punção/cateter · iv-exceto-spectrum · iv-exceto-command-board · iv-exceto-tap-flow · iv-exceto-intruder-trap
    Âncoras: examples/questao-premium-cev-urca-puncao-exceto-med-endovenosa.json
  - **puncao_tempo** — Troca de equipos, intervalos, tempo de observação, validade · iv-interval-timeline · iv-interval-board · iv-interval-tap-flow · iv-interval-swap-trap
    Âncoras: examples/questao-premium-cpcon-puncao-troca-equipos-intervalos.json
  - **puncao_periferica_antissepsia** — Técnica de punção periférica, antissepsia, ordem do procedimento · iv-puncture-rail · iv-antisepsis-board · iv-puncture-tap-flow · iv-order-invert-trap
    Âncoras: examples/questao-premium-funpar-puncao-tecnica-periferica.json
  - **puncao_ipcs_cvc** — Bundle CVC, IPCS, barreira máxima, corrente sanguínea · iv-bundle-orbit · iv-bundle-mesh-reveal · iv-bundle-tap-flow · iv-bundle-break-trap
    Âncoras: examples/questao-premium-admtec-puncao-venosa-cateteres.json
  - **puncao_generico** — Cauda sem cluster forte, protocolo misto · bridge · reference_table · cards · compare
    Âncoras: examples/questao-premium-gama-puncao-scalp-jelco-calibre.json

## Clusters

- Flebite e complicações (19 · 17,3% — puncao_flebite · g01)
- Dispositivo / calibre / jelco (12 · 10,9% — puncao_dispositivo · g02)
- EXCETO — técnica / conduta (12 · 10,9% — puncao_exceto · g03)
- Tempo / observação pós-procedimento (13 · 11,8% — puncao_tempo · g04)
- Punção venosa periférica (19 · 17,3% — puncao_periferica_antissepsia · g05)
- Prevenção de IPCS no CVC (11 · 10% — puncao_ipcs_cvc · g06)
- Cauda genérica / protocolo (24 · 21,8% — puncao_generico · g07+)

## Golden anchors

- Registry: `data/catalog-migration/puncao-venosa-e-cuidados-com-cateteres-golden-anchors.json`
- **puncao_flebite:** `examples/questao-premium-avancasp-puncao-infiltracao-flebite.json`
- **puncao_dispositivo:** `examples/questao-premium-gama-puncao-scalp-jelco-calibre.json`
- **puncao_exceto:** `examples/questao-premium-cev-urca-puncao-exceto-med-endovenosa.json`
- **puncao_tempo:** `examples/questao-premium-cpcon-puncao-troca-equipos-intervalos.json`
- **puncao_periferica_antissepsia:** `examples/questao-premium-funpar-puncao-tecnica-periferica.json`
- **puncao_ipcs_cvc:** `examples/questao-premium-admtec-puncao-venosa-cateteres.json`
- **puncao_generico:** `examples/questao-premium-gama-puncao-scalp-jelco-calibre.json`

## Pipeline (executar)

1. Ler `docs/HANDCRAFT_CONVERSA.md`, `docs/GOLDEN_HANDCRAFT_MODEL.md`, skill `avant-json-template` § L2.5+L3.
2. Ler `handcraft_meta` e 1–2 âncoras do ramo de cada slug.
3. Handcraft: `meta.content_standard: golden-v1` + `family` + `pedagogical_branch` + 4 slides planos.
4. **Proibido:** `ai:generate`, `catalog:upgrade-premium`.

```bash
npm run catalog:export-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-completo --subtopico="Punção Venosa e Cuidados com Cateteres" --limit=10000
# Handcraft → data/catalog-migration/puncao-venosa-e-cuidados-com-cateteres-g01/questions/*.json
npm run validate:goldens -- --lote=puncao-venosa-e-cuidados-com-cateteres-g01 --strict
npm run audit:questao-readiness -- --lote=puncao-venosa-e-cuidados-com-cateteres-g01 --strict-v2-pedagogy
npm run audit:slug-alignment -- --lote=puncao-venosa-e-cuidados-com-cateteres-g01 --strict
npm run audit:numeric-factcheck -- --lote=puncao-venosa-e-cuidados-com-cateteres-g01
npm run enrich:puncao-guideline-meta -- --lote=puncao-venosa-e-cuidados-com-cateteres-g01 --write
npm run catalog:patch-pedagogical-branch -- --lote=puncao-venosa-e-cuidados-com-cateteres-g01 --reconcile-branch --apply
npm run capture:questao-review -- --lote=puncao-venosa-e-cuidados-com-cateteres-g01
npm run audit:anchor-review -- --lote=puncao-venosa-e-cuidados-com-cateteres-g01 --record-pass --reviewer=<revisor>
npm run catalog:apply-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-g01 --dry-run
# apply SOMENTE se usuário pedir:
npm run catalog:apply-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-g01 --apply
```

## Critério de pronto (automático)

- `audit:questao-readiness` → `[READY]` por slug (strict-v2-pedagogy obrigatório)
- A4 (piloto `/estudar/[slug]`) — usuário

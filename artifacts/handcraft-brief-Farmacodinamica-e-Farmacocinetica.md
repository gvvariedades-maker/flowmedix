# Handcraft briefing — Farmacodinâmica e Farmacocinética

**Modo automático** (trigger `Handcraft:`). Executar sem pedir confirmação de modo.

**Status:** applied **13/13** · `production_ready` · onda nota-10 (2026-07-14)

Relatório: [`artifacts/farmacodinamica-nota10-report.md`](farmacodinamica-nota10-report.md)

## Escopo

- **Subtópico inteiro** — handcraft golden-v1 A1+A2+A3
- **Lotes:** `farmacodinamica-e-farmacocinetica-g01` (5) · `g02` (8)

## Pacote (registry)

| Campo | Valor |
|-------|-------|
| pacote_prefix | `farmacodinamica-e-farmacocinetica` |
| status | applied (13/13 slugs) |
| manifest | `data/catalog-migration/farmacodinamica-e-farmacocinetica-completo/manifest.json` |
| readme | `data/catalog-migration/farmacodinamica-e-farmacocinetica-completo/README.md` |
| lote_pattern | `farmacodinamica-e-farmacocinetica-g{NN}` |
| lote_size | 8 |
| anchor_glob | `examples/questao-premium-*-farmacodinamica-*.json,examples/questao-premium-idecan-omeprazol-ev-ulcera.json` |
| guideline | `lib/guidelines/farmacodinamica.ts` |
| A4-mínimo | `docs/PROTOCOLO_A4_MINIMO_FARMACODINAMICA.md` · `stamp:a4-minimo` 13/13 |
| handcraft_meta | `data/catalog-migration/farmacodinamica-e-farmacocinetica-g02/lote-meta.json` |

## Proibido (playbook)

- `ai:generate`
- `catalog:upgrade-premium`

## Ramos L3 (pedagogical_branch)

  - **farmaco_pk_pd_vf** — I/II/III, ADME, meia-vida, biodisponibilidade, 1ª passagem hepática · adme-journey-rail · reference_table · tap · compare
    Âncoras: examples/questao-premium-funcamp-farmacodinamica-farmacocinetica-vf.json
  - **farmaco_clinico_protocolo** — Omeprazol EV, antibiótico EV, infusão contínua, diluição, monitorização clínica/pH · infusao-ev-station-deck · farmaco-clinico-reference-board · farmaco-protocol-tap-flow · farmaco-clinico-trap
    Âncoras: examples/questao-premium-idecan-omeprazol-ev-ulcera.json
  - **farmaco_generico** — Demais — sem fit claro de cluster · genérico
    Âncoras: examples/questao-premium-funcamp-farmacodinamica-farmacocinetica-vf.json

## Clusters

- PK/PD definições — ADME, meia-vida, 1ª passagem (âncora FUNCAMP V/F)
- Clínico hospitalar — IBP EV, infusão monitorada (âncora IDECAN omeprazol)
- Insulinas e hipoglicemiantes
- Interações e efeitos adversos

## Golden anchors

- Registry: `data/catalog-migration/farmacodinamica-golden-anchors.json`
- **farmaco_pk_pd_vf:** `examples/questao-premium-funcamp-farmacodinamica-farmacocinetica-vf.json`
- **farmaco_clinico_protocolo:** `examples/questao-premium-idecan-omeprazol-ev-ulcera.json`
- **farmaco_generico:** `examples/questao-premium-funcamp-farmacodinamica-farmacocinetica-vf.json`

## Pipeline (executar)

1. Ler `docs/HANDCRAFT_CONVERSA.md`, `docs/GOLDEN_HANDCRAFT_MODEL.md`, skill `avant-json-template` § L2.5+L3.
2. Ler `handcraft_meta` e 1–2 âncoras do ramo de cada slug.
3. Handcraft: `meta.content_standard: golden-v1` + `family` + `pedagogical_branch` + 4 slides planos.
4. **Proibido:** `ai:generate`, `catalog:upgrade-premium`.

```bash
npm run catalog:export-lote -- --lote=farmacodinamica-e-farmacocinetica-completo --subtopico="Farmacodinâmica e Farmacocinética" --limit=10000
# Handcraft → data/catalog-migration/farmacodinamica-e-farmacocinetica-gNN/questions/*.json
npm run validate:goldens -- --lote=farmacodinamica-e-farmacocinetica-g01 --strict
npm run enrich:farmacodinamica-guideline-meta -- --lote=farmacodinamica-e-farmacocinetica-g01 --write
npm run stamp:a4-minimo -- --lote=farmacodinamica-e-farmacocinetica-g01
npm run audit:questao-readiness -- --lote=farmacodinamica-e-farmacocinetica-g01
npm run catalog:apply-lote -- --lote=farmacodinamica-e-farmacocinetica-g01 --dry-run
# apply só se o usuário pedir "pode aplicar"
```

## Qualidade vendável (Fase 2 — fechado)

```bash
npm run reconcile:handcraft-manifest -- --subtopico="Farmacodinâmica e Farmacocinética"
npm run audit:anchor-review -- --lote=farmacodinamica-e-farmacocinetica-g01 --record-pass --reviewer=handcraft-qc
npx playwright test e2e/visual-mold-regression.spec.ts --grep "Farmacodinâmica"
npm run audit:subtopico-quality -- --subtopico="Farmacodinâmica e Farmacocinética"
```

## Critério de pronto (automático)

- `audit:questao-readiness` → `[READY]` por slug
- A4-mínimo 13/13 · L6 g01+g02 pass · L3 Playwright 7/7

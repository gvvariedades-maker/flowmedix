# Handcraft briefing — Farmacodinâmica e Farmacocinética

**Modo automático** (trigger `Handcraft:`). Executar sem pedir confirmação de modo.

## Escopo

- **Subtópico inteiro** — handcraft golden-v1 A1+A2+A3
- **Primeiro lote:** `farmacodinamica-e-farmacocinetica-g01`

## Pacote (registry)

| Campo | Valor |
|-------|-------|
| pacote_prefix | `farmacodinamica-e-farmacocinetica` |
| status | applied (11/11 slugs) |
| manifest | `data/catalog-migration/farmacodinamica-e-farmacocinetica-completo/manifest.json` |
| lote_pattern | `farmacodinamica-e-farmacocinetica-g{NN}` |
| lote_size | 8 |
| anchor_glob | `examples/questao-premium-*-farmacodinamica-*.json,examples/questao-premium-idecan-omeprazol-ev-ulcera.json` |
| guideline | `—` |
| handcraft_meta | `data/catalog-migration/farmacodinamica-e-farmacocinetica-g02/lote-meta.json` |

## Proibido (playbook)

- `ai:generate`
- `catalog:upgrade-premium`

## Ramos L3 (pedagogical_branch)

  - **farmaco_pk_pd_vf** — I/II/III, ADME, meia-vida, biodisponibilidade, 1ª passagem hepática · adme-journey-rail · reference_table · tap · compare
    Âncoras: examples/questao-premium-funcamp-farmacodinamica-farmacocinetica-vf.json
  - **farmaco_clinico_protocolo** — Omeprazol EV, antibiótico EV, infusão contínua, diluição, monitorização clínica/pH · genérico morphological · reference_table · tap · compare
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
# Handcraft → data/catalog-migration/farmacodinamica-e-farmacocinetica-g01/questions/*.json
npm run validate:goldens -- --lote=farmacodinamica-e-farmacocinetica-g01 --strict
npm run audit:questao-readiness -- --lote=farmacodinamica-e-farmacocinetica-g01
npm run catalog:apply-lote -- --lote=farmacodinamica-e-farmacocinetica-g01 --dry-run
# apply + patch branch só se o usuário pedir
```

## Critério de pronto (automático)

- `audit:questao-readiness` → `[READY]` por slug
- A4 (piloto `/estudar/[slug]`) — usuário

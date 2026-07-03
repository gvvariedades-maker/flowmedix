# Handcraft briefing — Vias de Administração

**Modo automático** (trigger `Handcraft:`). Executar sem pedir confirmação de modo.

## Escopo

- **Subtópico inteiro** — handcraft golden-v1 A1+A2+A3

## Pacote (registry)

| Campo | Valor |
|-------|-------|
| pacote_prefix | `vias-de-administracao` |
| status | in_progress (1/251 slugs) |
| manifest | `data/catalog-migration/vias-de-administracao-completo/manifest.json` |
| lote_pattern | `vias-de-administracao-g{NN}` |
| lote_size | 8 |
| anchor_glob | `examples/questao-premium-*-vias-*.json,examples/questao-premium-consulpam-vias-absorcao-oral.json` |
| guideline | `—` |
| handcraft_meta | `data/catalog-migration/vias-de-administracao-completo/handcraft-meta.json` |

## Ramos L3 (pedagogical_branch)

  - **via_vf_absorcao** — Absorção, 1ª passagem hepática, oral/sublingual/retal/parenteral, comparativo de vias · absorption-speed-rail · reference_table · tap · route-trap
    Âncoras: examples/questao-premium-consulpam-vias-absorcao-oral.json, examples/questao-premium-vunesp-via-subcutanea.json
  - **via_tecnica_admin** — Técnica de punção, sítio anatômico, volume, ângulo, complicações · genérico morphological · reference_table · vertical · compare
    Âncoras: examples/questao-premium-cpcon-vias-im-vf.json
  - **via_generico** — Demais — indicação de via sem cluster claro · genérico
    Âncoras: examples/questao-premium-vunesp-via-subcutanea.json

## Clusters

- Absorção farmacocinética / 1ª passagem (âncora Consulpam CORRETA)
- Indicação da via (velocidade SC/IM/IV)
- Técnica de administração (IM, IV, punção)
- V/F assertivas I–III ou I–IV

## Golden anchors (vias)

- Registry: `data/catalog-migration/vias-golden-anchors.json`
- Absorção CORRETA: `examples/questao-premium-consulpam-vias-absorcao-oral.json`
- Indicação SC: `examples/questao-premium-vunesp-via-subcutanea.json`
- Técnica IM V/F: `examples/questao-premium-cpcon-vias-im-vf.json`

## Pipeline (executar)

1. Ler `docs/HANDCRAFT_CONVERSA.md`, `docs/GOLDEN_HANDCRAFT_MODEL.md`, skill `avant-json-template` § L2.5+L3.
2. Ler `handcraft_meta` e 1–2 âncoras do ramo de cada slug.
3. Handcraft: `meta.content_standard: golden-v1` + `family` + `pedagogical_branch` + 4 slides planos.
4. **Proibido:** `ai:generate`, `catalog:upgrade-premium`.

```bash
npm run catalog:export-lote -- --lote=vias-de-administracao-completo --subtopico="Vias de Administração" --limit=10000
# Handcraft → data/catalog-migration/vias-de-administracao-g01/questions/*.json
npm run validate:goldens -- --lote=vias-de-administracao-g01 --strict
npm run audit:questao-readiness -- --lote=vias-de-administracao-g01
npm run catalog:apply-lote -- --lote=vias-de-administracao-g01 --dry-run
# apply + patch branch só se o usuário pedir
```

## Critério de pronto (automático)

- `audit:questao-readiness` → `[READY]` por slug
- A4 (piloto `/estudar/[slug]`) — usuário

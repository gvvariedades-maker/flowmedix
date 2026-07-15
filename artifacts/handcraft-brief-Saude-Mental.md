# Handcraft briefing — Saúde Mental

**Modo automático** (trigger `Handcraft:`). Executar sem pedir confirmação de modo.

## Escopo

- **Subtópico inteiro** — handcraft golden-v1 A1+A2+A3
- **Primeiro lote:** `saude-mental-micro-01-goldens`

## Pacote (registry)

| Campo | Valor |
|-------|-------|
| pacote_prefix | `saude-mental` |
| status | applied (37/37 slugs) |
| manifest | `data/catalog-migration/saude-mental-completo/manifest.json` |
| lote_pattern | `saude-mental-micro-{NN}-goldens` |
| lote_size | 4 |
| anchor_glob | `examples/questao-premium-*-saude-mental*.json` |
| guideline | `lib/guidelines/saudeMental.ts` |
| handcraft_meta | `data/catalog-migration/saude-mental-micro-07-goldens/manifest.json` |

## Ramos L3 (pedagogical_branch)

Se subtópico tem BRANCH_DESIGN_MAP, ver .cursor/skills/avant-json-template/SKILL.md § L2.5+L3

## Pipeline (executar)

1. Ler `docs/HANDCRAFT_CONVERSA.md`, `docs/GOLDEN_HANDCRAFT_MODEL.md`, skill `avant-json-template` § L2.5+L3.
2. Ler `handcraft_meta` e 1–2 âncoras do ramo de cada slug.
3. Handcraft: `meta.content_standard: golden-v1` + `family` + `pedagogical_branch` + 4 slides planos.
4. **Proibido:** `ai:generate`, `catalog:upgrade-premium`.

```bash
npm run catalog:export-lote -- --lote=saude-mental-completo --subtopico="Saúde Mental" --limit=10000
# Handcraft → data/catalog-migration/saude-mental-micro-01-goldens/questions/*.json
npm run validate:goldens -- --lote=saude-mental-micro-01-goldens --strict
npm run audit:questao-readiness -- --lote=saude-mental-micro-01-goldens
npm run catalog:apply-lote -- --lote=saude-mental-micro-01-goldens --dry-run
# apply + patch branch só se o usuário pedir
```

## Critério de pronto (automático)

- `audit:questao-readiness` → `[READY]` por slug
- A4 (piloto `/estudar/[slug]`) — usuário

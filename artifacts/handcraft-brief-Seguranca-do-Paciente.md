# Handcraft briefing — Segurança do Paciente

**Modo automático** (trigger `Handcraft:`). Executar sem pedir confirmação de modo.

## Escopo

- **Subtópico inteiro** — handcraft golden-v1 A1+A2+A3
- **Primeiro lote:** `seguranca-do-paciente-g01`

## Pacote (registry)

| Campo | Valor |
|-------|-------|
| pacote_prefix | `seguranca-do-paciente` |
| status | applied (59/59 slugs) |
| manifest | `data/catalog-migration/seguranca-do-paciente-completo/manifest.json` |
| lote_pattern | `seguranca-do-paciente-g{NN}` |
| lote_size | 8 |
| anchor_glob | `examples/questao-premium-*-seguranca-paciente-*.json,examples/questao-premium-cesgranrio-seguranca-paciente-identificacao-vf.json` |
| guideline | `—` |
| handcraft_meta | `data/catalog-migration/seguranca-do-paciente-completo/handcraft-meta.json` |

## Ramos L3 (pedagogical_branch)

Se subtópico tem BRANCH_DESIGN_MAP, ver .cursor/skills/avant-json-template/SKILL.md § L2.5+L3

## Pipeline (executar)

1. Ler `docs/HANDCRAFT_CONVERSA.md`, `docs/GOLDEN_HANDCRAFT_MODEL.md`, skill `avant-json-template` § L2.5+L3.
2. Ler `handcraft_meta` e 1–2 âncoras do ramo de cada slug.
3. Handcraft: `meta.content_standard: golden-v1` + `family` + `pedagogical_branch` + 4 slides planos.
4. **Proibido:** `ai:generate`, `catalog:upgrade-premium`.

```bash
npm run catalog:export-lote -- --lote=seguranca-do-paciente-completo --subtopico="Segurança do Paciente" --limit=10000
# Handcraft → data/catalog-migration/seguranca-do-paciente-g01/questions/*.json
npm run validate:goldens -- --lote=seguranca-do-paciente-g01 --strict
npm run audit:questao-readiness -- --lote=seguranca-do-paciente-g01
npm run catalog:apply-lote -- --lote=seguranca-do-paciente-g01 --dry-run
# apply + patch branch só se o usuário pedir
```

## Critério de pronto (automático)

- `audit:questao-readiness` → `[READY]` por slug
- A4 (piloto `/estudar/[slug]`) — usuário

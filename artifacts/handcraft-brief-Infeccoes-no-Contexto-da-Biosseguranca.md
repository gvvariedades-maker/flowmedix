# Handcraft briefing — Infecções no Contexto da Biossegurança

**Modo automático** (trigger `Handcraft:`). Executar sem pedir confirmação de modo.

## Escopo

- **Subtópico inteiro** — handcraft golden-v1 A1+A2+A3
- **Primeiro lote:** `infeccoes-biosseguranca-g01`

## Pacote (registry)

| Campo | Valor |
|-------|-------|
| pacote_prefix | `infeccoes-biosseguranca` |
| status | applied (25/25 slugs) |
| manifest | `data/catalog-migration/infeccoes-biosseguranca-completo/manifest.json` |
| lote_pattern | `infeccoes-biosseguranca-g{NN}` |
| lote_size | 8 |
| anchor_glob | `examples/questao-premium-*-infeccoes-biosseguranca-*.json,examples/questao-premium-idib-umirim-itu-cateter-exceto.json` |
| guideline | `—` |
| handcraft_meta | `data/catalog-migration/infeccoes-biosseguranca-completo/handcraft-meta.json` |

## Ramos L3 (pedagogical_branch)

Se subtópico tem BRANCH_DESIGN_MAP, ver .cursor/skills/avant-json-template/SKILL.md § L2.5+L3

## Pipeline (executar)

1. Ler `docs/HANDCRAFT_CONVERSA.md`, `docs/GOLDEN_HANDCRAFT_MODEL.md`, skill `avant-json-template` § L2.5+L3.
2. Ler `handcraft_meta` e 1–2 âncoras do ramo de cada slug.
3. Handcraft: `meta.content_standard: golden-v1` + `family` + `pedagogical_branch` + 4 slides planos.
4. **Proibido:** `ai:generate`, `catalog:upgrade-premium`.

```bash
npm run catalog:export-lote -- --lote=infeccoes-biosseguranca-completo --subtopico="Infecções no Contexto da Biossegurança" --limit=10000
# Handcraft → data/catalog-migration/infeccoes-biosseguranca-g01/questions/*.json
npm run validate:goldens -- --lote=infeccoes-biosseguranca-g01 --strict
npm run audit:questao-readiness -- --lote=infeccoes-biosseguranca-g01
npm run catalog:apply-lote -- --lote=infeccoes-biosseguranca-g01 --dry-run
# apply + patch branch só se o usuário pedir
```

## Critério de pronto (automático)

- `audit:questao-readiness` → `[READY]` por slug
- A4 (piloto `/estudar/[slug]`) — usuário

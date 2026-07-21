# Handcraft briefing — Curativos e Manejo de Feridas

**Modo automático** (trigger `Handcraft:`). Executar sem pedir confirmação de modo.

## Escopo

- **Subtópico inteiro** — handcraft golden-v1 A1+A2+A3
- **Primeiro lote:** `curativos-e-manejo-de-feridas-g01`

## Pacote (registry)

| Campo | Valor |
|-------|-------|
| pacote_prefix | `curativos-e-manejo-de-feridas` |
| status | none (0/94 slugs) |
| manifest | `data/catalog-migration/curativos-e-manejo-de-feridas-completo/manifest.json` |
| lote_pattern | `curativos-e-manejo-de-feridas-g{NN}` |
| lote_size | 8 |
| anchor_glob | `examples/questao-premium-*-curativos-*.json` |
| guideline | `lib/guidelines/curativos.ts` |
| handcraft_meta | `data/catalog-migration/curativos-e-manejo-de-feridas-completo/handcraft-meta.json` |

## Ramos L3 (pedagogical_branch)

  - **curativos_cobertura_selecao** — Seleção de cobertura, exsudato, meio úmido, hidrocoloide/alginato/espuma · wound-stage-tissue-deck · dressing-match-matrix · wound-prep-tap-flow · dressing-choice-arena
    Âncoras: examples/questao-premium-cpcon-curativos-lpp-prevencao-vf.json
  - **curativos_ferida_cirurgica** — Ferida operatória, pós-op, pontos, deiscência, sutura · procedure-protocol · reference_table · wound-prep-tap-flow · compare
  - **curativos_lpp** — LPP prevenção, estágios NPUAP, Braden, úlcera por pressão · wound-stage-tissue-deck · reference_table · vertical · dressing-choice-arena
    Âncoras: examples/questao-premium-cpcon-curativos-lpp-prevencao-vf.json
  - **curativos_exceto_incorreta** — EXCETO / INCORRETA em técnica de curativo · morphological · reference_table · vertical · compare
  - **curativos_tecnica_assepsia** — Sequência asséptica, limpeza SF, técnica de curativo · morphological · reference_table · vertical · compare
  - **curativos_desbridamento** — Tipos de desbridamento autolítico/mecânico/enzimático/cirúrgico · morphological · reference_table · vertical · compare
  - **curativos_estomia** — Estomia, periestoma, bolsa coletora · morphological · reference_table · vertical · compare
  - **curativos_bandagem_imobilizacao** — Bandagem, gesso, imobilização · morphological · reference_table · vertical · compare
  - **curativos_generico** — Cauda misc. sem cluster forte único · morphological · center · vertical · compare

## Clusters

- Cobertura e seleção (23 · 24.7% — curativos_cobertura_selecao · g01)
- Ferida cirúrgica / pós-op (13 · 14.0% — curativos_ferida_cirurgica · g02)
- LPP prevenção+tratamento (9 · 9.7% — curativos_lpp · g03)
- Técnica asséptica / sequência (6 · 6.5% — curativos_tecnica_assepsia · g04)
- Desbridamento (6 · 6.5% — curativos_desbridamento · g05)
- EXCETO — conduta curativo (4 · 4.3% — curativos_exceto_incorreta · g06)
- Cauda: estomia+bandagem+dreno+termo+genérico (25 · 26.6% — sub-ramos · g07+)

## Pipeline (executar)

1. Ler `docs/HANDCRAFT_CONVERSA.md`, `docs/GOLDEN_HANDCRAFT_MODEL.md`, skill `avant-json-template` § L2.5+L3.
2. Ler `handcraft_meta` e 1–2 âncoras do ramo de cada slug.
3. Handcraft: `meta.content_standard: golden-v1` + `family` + `pedagogical_branch` + 4 slides planos.
4. **Proibido:** `ai:generate`, `catalog:upgrade-premium`.

```bash
npm run catalog:export-lote -- --lote=curativos-e-manejo-de-feridas-completo --subtopico="Curativos e Manejo de Feridas" --limit=10000
# Handcraft → data/catalog-migration/curativos-e-manejo-de-feridas-g01/questions/*.json
npm run validate:goldens -- --lote=curativos-e-manejo-de-feridas-g01 --strict
npm run audit:questao-readiness -- --lote=curativos-e-manejo-de-feridas-g01 --strict-v2-pedagogy
npm run catalog:apply-lote -- --lote=curativos-e-manejo-de-feridas-g01 --dry-run
# apply + patch branch só se o usuário pedir
```

## Critério de pronto (automático)

- `audit:questao-readiness` → `[READY]` por slug (strict-v2-pedagogy obrigatório)
- A4 (piloto `/estudar/[slug]`) — usuário

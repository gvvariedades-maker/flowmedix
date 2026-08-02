# Handcraft briefing — Noções de Anatomia

**Modo automático** (trigger `Handcraft:`). Executar sem pedir confirmação de modo.

## Escopo

- **Subtópico inteiro** — handcraft golden-v1 A1+A2+A3
- **Primeiro lote:** `nocoes-de-anatomia-g01`

## Pacote (registry)

| Campo | Valor |
|-------|-------|
| pacote_prefix | `nocoes-de-anatomia` |
| status | in_progress (0/48 slugs) |
| manifest | `data/catalog-migration/nocoes-de-anatomia-completo/manifest.json` |
| lote_pattern | `nocoes-de-anatomia-g{NN}` |
| lote_size | 8 |
| anchor_glob | `examples/questao-premium-*-anatomia-*.json` |
| guideline | `lib/guidelines/anatomiaBasica.ts` |
| handcraft_meta | `data/catalog-migration/nocoes-de-anatomia-completo/handcraft-meta.json` |

## Proibido (playbook)

- `ai:generate`
- `catalog:upgrade-premium`
- `catalog:apply-lote --apply sem 'pode aplicar'`
- `handcraft em massa sem audit:golden-anchor-gate PASS`
- `criar l3-brief-INDEX sem cluster report real (export questions/)`

## Ramos L3 (pedagogical_branch)

  - **anatomia_terminologia** — Sinônimos de posição (anterior/ventral, posterior/dorsal, superior/cranial, inferior/caudal), medial×lateral, proximal×distal · anatomia-axis-map · anatomia-pair-board · anatomia-axis-tap · anatomia-pair-trap (genérico premium até brief + volume)
    Âncoras: examples/questao-premium-fepese-anatomia-anterior-ventral.json
  - **anatomia_planos** — Planos sagital, frontal/coronal, transverso/horizontal/axial; eixos; seções · anatomia-axis-map · anatomia-pair-board · anatomia-axis-tap · anatomia-pair-trap
    Âncoras: examples/questao-premium-fepese-anatomia-anterior-ventral.json
  - **anatomia_cavidades_orgaos** — Cavidades craniana/torácica/abdominal/pélvica; quadrantes; localização de órgãos (fígado QD, baço QE, coração mediastino) · anatomia-axis-map · anatomia-pair-board · anatomia-axis-tap · anatomia-pair-trap
    Âncoras: examples/questao-premium-fepese-anatomia-anterior-ventral.json
  - **anatomia_sistemas** — Sistemas orgânicos, níveis célula→organismo, órgãos de um sistema · anatomia-axis-map · anatomia-pair-board · anatomia-axis-tap · anatomia-pair-trap
    Âncoras: examples/questao-premium-fepese-anatomia-anterior-ventral.json
  - **anatomia_generico** — Certo/errado, EXCETO e cauda sem fit nos ramos acima · genérico premium (subtópico rose / morphological)
    Âncoras: examples/questao-premium-fepese-anatomia-anterior-ventral.json

## Clusters

- Terminologia / posição anatômica (anterior-ventral, medial-lateral, proximal-distal)
- Planos e eixos (sagital, frontal/coronal, transverso)
- Cavidades e localização de órgãos (craniana, torácica, abdominal, pélvica, quadrantes)
- Sistemas e níveis de organização (CV, respiratório, digestório, urinário, nervoso, endócrino, musculoesquelético)
- Certo/errado e EXCETO — cauda longa

## Pipeline (executar)

1. Ler `docs/HANDCRAFT_CONVERSA.md`, `docs/GOLDEN_HANDCRAFT_MODEL.md`, skill `avant-json-template` § L2.5+L3.
2. Ler `handcraft_meta` e 1–2 âncoras do ramo de cada slug.
3. Handcraft: `meta.content_standard: golden-v1` + `family` + `pedagogical_branch` + 4 slides planos.
4. **Proibido:** `ai:generate`, `catalog:upgrade-premium`, `catalog:apply-lote --apply sem 'pode aplicar'`, `handcraft em massa sem audit:golden-anchor-gate PASS`, `criar l3-brief-INDEX sem cluster report real (export questions/)`.

```bash
npm run catalog:export-lote -- --lote=nocoes-de-anatomia-completo --subtopico="Noções de Anatomia" --limit=10000
# Handcraft → data/catalog-migration/nocoes-de-anatomia-g01/questions/*.json
npm run validate:goldens -- --lote=nocoes-de-anatomia-g01 --strict
npm run audit:questao-readiness -- --lote=nocoes-de-anatomia-g01 --strict-v2-pedagogy
npm run catalog:apply-lote -- --lote=nocoes-de-anatomia-g01 --dry-run
# apply + patch branch só se o usuário pedir
```

## Critério de pronto (automático)

- `audit:questao-readiness` → `[READY]` por slug (strict-v2-pedagogy obrigatório)
- A4 (piloto `/estudar/[slug]`) — usuário

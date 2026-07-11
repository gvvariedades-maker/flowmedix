# Handcraft briefing — Saúde da Mulher

**Modo automático** (trigger `Handcraft:`). Executar sem pedir confirmação de modo.

## Escopo

- **Subtópico inteiro** — handcraft golden-v1 A1+A2+A3
- **Primeiro lote:** `saude-da-mulher-g01`

## Pacote (registry)

| Campo | Valor |
|-------|-------|
| pacote_prefix | `saude-da-mulher` |
| status | in_progress (4/263 slugs) |
| manifest | `data/catalog-migration/saude-da-mulher-completo/manifest.json` |
| lote_pattern | `saude-da-mulher-g{NN}` |
| lote_size | 8 |
| anchor_glob | `examples/questao-premium-*-saude-mulher-*.json` |
| guideline | `Caderno AB 32 · INCA/MS rastreio · OMS parto` |
| handcraft_meta | `data/catalog-migration/saude-da-mulher-completo/handcraft-meta.json` |

## Proibido (playbook)

- `ai:generate`
- `catalog:upgrade-premium`

## Ramos L3 (pedagogical_branch)

  - **mulher_prenatal** — Pré-natal, gestação, captação precoce, periodicidade consultas, TTGO, ácido fólico, V/F I–III · mulher-gestation-timeline · mulher-prenatal-board · mulher-prenatal-tap-flow · mulher-prenatal-trap-arena
    Âncoras: examples/questao-premium-cpcon-saude-mulher-pre-natal-vf.json
  - **mulher_parto** — Trabalho de parto, parto humanizado, OMS, fases, expulsivo, ocitocina HPP, enema, depilação · mulher-labor-phase-deck · mulher-parto-humanizado-board · mulher-labor-tap-flow · mulher-parto-trap-arena
    Âncoras: examples/questao-premium-admtec-saude-mulher-parto-humanizado-vf.json
  - **mulher_papanicolau** — Papanicolau, rastreio colo, HPV, citologia, 25–64 trienal, fatores de risco · mulher-screening-spectrum · mulher-papanicolau-board · mulher-screening-tap-flow · mulher-screening-trap-arena
    Âncoras: examples/questao-premium-vunesp-saude-mulher-papanicolau.json
  - **mulher_mama** — Mamografia, rastreio mama, 50–69 bienal, autoexame complementar, faixa etária · mulher-mammography-spectrum · mulher-mama-board · mulher-mama-tap-flow · mulher-mama-trap-arena
    Âncoras: examples/questao-premium-vunesp-saude-mulher-mamografia.json
  - **mulher_puerperio** — Puerpério, lactação, aleitamento, amamentação, colostro · morphological · reference_table · vertical · compare (genérico)
  - **mulher_planejamento** — Planejamento familiar, contracepção, DIU, anticoncepcionais · morphological · reference_table · vertical · compare (genérico)
  - **mulher_generico** — Conceito geral, anatomia, semiologia, drift residual — sem fit nos ramos acima · morphological · reference_table · vertical · compare (genérico)

## Clusters

- Pré-natal / gestação (75 · 28,5% — mulher_prenatal · âncora CPCON pré-natal VF)
- Parto / trabalho de parto (62 · 23,6% — mulher_parto · âncora ADM&TEC parto humanizado VF)
- Rastreio câncer de colo (37 · 14,1% — mulher_papanicolau · âncora VUNESP papanicolau)
- Saúde da mama (28 · 10,6% — mulher_mama · âncora VUNESP mamografia)
- Saúde da mulher — conceito geral (13 · 4,9% — mulher_generico)
- Puerpério / lactação (9 · 3,4% — mulher_puerperio)
- Planejamento familiar (7 · 2,7% — mulher_planejamento)
- Drift taxonômico — reclassificar (21 · 8% — Classify antes de handcraft)

## Gramática golden-v1 (4 slides)

- **concept_map:** Enquadramento da prova + erro reproduzível (gestação, parto, rastreio) — sem letra gabarito
- **golden_rule:** Decore normativo — rows com marcos etários, periodicidade, condutas OMS/INCA
- **logic_flow:** Único lugar com gabarito; reveal_mode tap; V/F julgar assertivas antes de cruzar
- **danger_zone:** Pegadinha × correção por letra (compare); justificativa única por distrator

## Priorização ROI

| P | Ação | Por quê |
|---|------|---------|
| P0 | Piloto saude-da-mulher-g01 — 1 slug × 4 ramos fortes | Validar pacotes L3 bespoke no player antes de escalar |
| P0 | Classify drift (~21 slugs anatomia/semiologia) | Evita handcraft em slugs fora do subtópico |
| P1 | Handcraft g02+ mulher_prenatal (75 slugs) | Maior volume — 28,5% do catálogo |
| P1 | Lotes mulher_parto + mulher_papanicolau + mulher_mama | ~48% combinado — moldes 4/4 prontos |
| P2 | Cauda mulher_generico + puerpério + planejamento | Layouts genéricos bastam — sem molde bespoke obrigatório |

## Pipeline (executar)

1. Ler `docs/HANDCRAFT_CONVERSA.md`, `docs/GOLDEN_HANDCRAFT_MODEL.md`, skill `avant-json-template` § L2.5+L3.
2. Ler `handcraft_meta` e 1–2 âncoras do ramo de cada slug.
3. Handcraft: `meta.content_standard: golden-v1` + `family` + `pedagogical_branch` + 4 slides planos.
4. **Proibido:** `ai:generate`, `catalog:upgrade-premium`.

```bash
npm run catalog:export-lote -- --lote=saude-da-mulher-completo --subtopico="Saúde da Mulher" --limit=10000
# Handcraft → data/catalog-migration/saude-da-mulher-g01/questions/*.json
npm run validate:goldens -- --lote=saude-da-mulher-g01 --strict
npm run audit:questao-readiness -- --lote=saude-da-mulher-g01 --strict-v2-pedagogy
npm run audit:slug-alignment -- --lote=saude-da-mulher-g01 --strict
npm run catalog:patch-pedagogical-branch -- --lote=saude-da-mulher-g01 --reconcile-branch --apply
npm run test:e2e:visual-molds -- --grep="Saúde da Mulher"
npm run capture:questao-review -- --lote=saude-da-mulher-g01
npm run catalog:apply-lote -- --lote=saude-da-mulher-g01 --dry-run
# apply SOMENTE se usuário pedir:
npm run catalog:apply-lote -- --lote=saude-da-mulher-g01 --apply
```

## Critério de pronto (automático)

- `audit:questao-readiness` → `[READY]` por slug (strict-v2-pedagogy obrigatório)
- A4 (piloto `/estudar/[slug]`) — usuário

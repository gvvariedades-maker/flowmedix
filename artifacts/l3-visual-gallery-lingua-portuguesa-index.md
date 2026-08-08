# L3 Visual Gallery INDEX — Língua Portuguesa

Galeria **leve** por ramo: espelho operacional das âncoras pedagógicas.
Capturas = PNGs do **player AVANT** (`capture:questao-review`), não posters Instagram.

| Campo | Valor |
|-------|--------|
| pacote_prefix | lingua-portuguesa |
| Playbook | `data/catalog-migration/handcraft-playbooks/lingua-portuguesa.json` → `visual_gallery` |
| Brief index | `artifacts/l3-brief-lingua-portuguesa-index.md` |
| Skill | `.cursor/skills/avant-neuroslides-visual/SKILL.md` |
| Capture | `npm run capture:questao-review -- --slug=<anchor_slug>` |
| Saída PNG | `artifacts/questao-review/<anchor_slug>/` |

## Status

| status | Significado |
|--------|-------------|
| pending | Brief ok; falta JSON âncora e/ou capture |
| pilot | JSON em `anchors` + capture com layout **genérico** premium |
| ready | Bespoke wired + re-capture pós-React |

## Ramos

| branch_id | brief | JSON âncora | layouts | captures_dir | status |
|-----------|-------|-------------|---------|--------------|--------|
| pt_classes_conjuncao | playbook `classes-de-palavras.json` | `examples/questao-premium-vunesp-portugues-classes-conjuncao-causal.json` | pt-classes-function-deck · classify-board · family-table · swap-arena | `artifacts/questao-review/questao-premium-vunesp-portugues-classes-conjuncao-causal/` | **ready** |
| pt_classes_adverbio | playbook `classes-de-palavras.json` | `examples/questao-premium-educa-pb-portugues-classes-adverbio-essencialmente.json` | types-grid · mnemonic-rail · arrow-cards (MAL×MAU) · compare | `artifacts/questao-review/questao-premium-educa-pb-portugues-classes-adverbio-essencialmente/` | **ready** |
| pt_classes_preposicao | playbook `classes-de-palavras.json` | `examples/questao-premium-avancasp-portugues-classes-prep-x-artigo.json` | prep-contract-rail · prep-category-stack · family-table · adverb-compare (Artigo×Prep) | `artifacts/questao-review/questao-premium-avancasp-portugues-classes-prep-x-artigo/` | **ready** |
| pt_classes_exceto | playbook `classes-de-palavras.json` | `examples/questao-premium-avancasp-portugues-classes-exceto-adverbio.json` | grid · excepto-isolate-board · reference_table · compare | `artifacts/questao-review/questao-premium-avancasp-portugues-classes-exceto-adverbio/` | **ready** |
| pt_crase | `artifacts/l3-brief-lingua-portuguesa-pt_crase.md` | `examples/questao-premium-vunesp-portugues-crase-funil.json` (tec 3607076, gab. C) | pt-crase-funnel-deck · board · tap-flow · trap-arena | `artifacts/questao-review/questao-premium-vunesp-portugues-crase-funil/` | **ready** |
| pt_concordancia | rtifacts/l3-brief-lingua-portuguesa-pt_concordancia.md | examples/questao-premium-vunesp-portugues-concordancia-nucleo-sjrp.json | pt-subject-focus-deck · board · tap-flow · trap-arena | rtifacts/questao-review/questao-premium-vunesp-portugues-concordancia-nucleo-sjrp/ | **ready** |

### Checklist piloto pt_crase

1. [x] Handcraft âncora + `anchors[]` no playbook
2. [x] `audit:questao-readiness --strict-v2-pedagogy` → `[READY]`
3. [x] `visual_gallery.anchor_slug` preenchido
4. [x] `capture:questao-review` mobile-375
5. [x] status → **ready** (bespoke + re-capture)
6. [x] `Implementar molde: pt_crase` 4/4 wired



## Checklist piloto pt_concordancia (2026-08-08 Composer)

1. [x] Handcraft âncora + nchors[] no playbook
2. [x] Moldes 4/4 wired (alias term-matrix / LogicFocusShell)
3. [x] Composer visual: Modo V + ATELIER_PASS (gesto focus)
4. [x] capture:questao-review mobile-375
5. [x] status → **ready** + captures_dir
6. [x] Banco: gesto ocus thin → gold
7. [x] Playwright L3 «PT Concordância» 5/5
8. [ ] Implementar molde: copy «Matriz*» → núcleo (opcional polish; não bloqueia)

Report: rtifacts/composer-visual-pilot-pt_concordancia.md

## Política

- Só ramos `molde_redesign` / `molde_inedito`.
- 1 galeria por ramo.
- Proibido indexar PNG de feed externo.


## Checklist pt_classes_conjuncao (2026-08-07)

1. [x] Handcraft âncora causal + adversativa
2. [x] Moldes 4/4 Glance (arena OU · trilho · cards · tabela coordenativas)
3. [x] Revisão pedagógica — gab. C «já que» (âncora motivo; trap adversativa)
4. [x] `visual_gallery` ready + prints em `artifacts/questao-review/...`
5. [ ] `capture:questao-review` Playwright (opcional re-capture)


## Checklist pt_classes_adverbio (2026-08-08)

1. [x] Handcraft âncoras modo_intensidade + adv_x_adj
2. [x] Moldes 4/4 (faixas INDICATIVO · PFC/EGT · MAL×MAU · compare)
3. [x] Polish pedagógico — teste BEM/COMO × BOM/QUAL; steps enxutos
4. [x] Fix faixa INTENSIDADE (2 linhas) + título -MENTE
5. [x] visual_gallery ready + prints mold-review
6. [ ] capture:questao-review Playwright player (opcional)

## Checklist pt_classes_preposicao (2026-08-08)

1. [x] Handcraft âncoras prep_x_artigo + locucao_prepositiva
2. [x] Moldes 4/4 (contract-rail · category-stack · family-table · compare eixo Artigo×Prep)
3. [x] Chips danger Parece prep / errada × É artigo / certa + tip eixo prep
4. [x] `audit:questao-readiness` → `[READY]` ×2
5. [x] visual_gallery ready + prints mold-review
6. [ ] `capture:questao-review` Playwright player (opcional)

## Checklist pt_classes_exceto (2026-08-08)

1. [x] Handcraft âncora excepto_classe
2. [x] Mold isolate LogicIsolateShell wired
3. [x] audit:anchor-100 gates_pass + --require-visual
4. [x] visual_gallery ready
5. [ ] âncora 02 valor_incorreto


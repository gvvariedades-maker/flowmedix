# Coleta de Exames Laboratoriais — Índice de briefs L3 (7 ramos)

**Subtópico:** Coleta de Exames Laboratoriais · **171 slugs** · cluster 2026-08-05  
**Política:** Modo padrão Paridade Adolescente — handcraft e player usam `COLETA_GENERIC_DESIGN` (teal: morphological · reference_table · tap · compare) até `Implementar molde: coleta_<ramo>`. Briefs `molde_redesign` documentam metáfora espacial futura; **não** bloqueiam g01+.

| branch_id | count | % | forte? | L3 decision | metáfora | erro pedagógico | status |
|-----------|------:|--:|--------|-------------|----------|-----------------|--------|
| `coleta_nao_sanguinea` | 40 | 23.4% | sim | molde_redesign | Matriz amostra × fase (urina/fezes/escarro) | Confunde meio, recipiente e timing entre amostras não sanguíneas | [brief](l3-brief-coleta-de-exames-laboratoriais-coleta_nao_sanguinea.md) · ship genérico |
| `coleta_tubos_ordem` | 34 | 19.9% | sim | molde_redesign | Trilho de tubos por cor/aditivo (ordem CLSI) | Inverte ordem de coleta ou associa aditivo errado ao exame | [brief](l3-brief-coleta-de-exames-laboratoriais-coleta_tubos_ordem.md) · ship genérico |
| `coleta_tecnica_venosa` | 12 | 7.0% | sim | molde_redesign | Trilho pré-analítico venoso (garrote → punção → tubo) | Mistura punção, hemólise, transporte e descarte de resíduos | [brief](l3-brief-coleta-de-exames-laboratoriais-coleta_tecnica_venosa.md) · ship genérico |
| `coleta_hemocultura` | 11 | 6.4% | sim | molde_redesign | Anéis assépticos (antissepsia → volume → frascos) | Pula clorexidina/alcoóis ou confunde contaminação × bacteremia | [brief](l3-brief-coleta-de-exames-laboratoriais-coleta_hemocultura.md) · ship genérico |
| `coleta_jejum_preparo` | 11 | 6.4% | sim | ok_generico | Tabela de horas / preparo (reference_table) | Confunde jejum de lipídios, glicemia e exame geral | [brief](l3-brief-coleta-de-exames-laboratoriais-coleta_jejum_preparo.md) · ok_generico |
| `coleta_capilar_glicemia` | 9 | 5.3% | sim | ok_generico | Sequência capilar (massagear → lanceta → gota) | Ordem errada ou não seca antes da punção capilar | [brief](l3-brief-coleta-de-exames-laboratoriais-coleta_capilar_glicemia.md) · ok_generico |
| `coleta_generico` | 54 | 31.6% | cauda | cauda_longa | Genérico premium teal (sem bespoke) | Cauda mista — pegadinha varia por card | [brief](l3-brief-coleta-de-exames-laboratoriais-coleta_generico.md) · cauda |

**Total:** 171 slugs · **4 ramos** `molde_redesign` (ship genérico) · **2** `ok_generico` · **1** cauda

## Código e wiring atual

| Área | Arquivo |
|------|---------|
| Ramos + design map | `lib/slides/pedagogicalBranch.ts` (`COLETA_GENERIC_DESIGN`, template `teal`) |
| Classificação de ramo | `inferColetaBranch` em `pedagogicalBranch.ts` |
| Playbook | `data/catalog-migration/handcraft-playbooks/coleta-de-exames-laboratoriais.json` |
| Cluster | `artifacts/coleta-de-exames-laboratoriais-topic-cluster-report.json` |

## Ordem de handcraft sugerida

`coleta_nao_sanguinea` (g01) → `coleta_tubos_ordem` → `coleta_tecnica_venosa` → `coleta_hemocultura` → `coleta_jejum_preparo` → `coleta_capilar_glicemia` → `coleta_generico`

## Triggers

```text
Handcraft: Coleta de Exames Laboratoriais g01
Implementar molde: coleta_<branch_id>   # só com pedido explícito — React + VARIANT_MOLDS
Design visual: coleta_<branch_id>       # opcional pós-brief, avant-neuroslides-visual
```

Gate Fase 3b: brief 4/4 por ramo forte · handcraft **não** exige React wired · `audit:l3-mold-gap` após Implementar molde.

# Resolver de moldes por afinidade de conteúdo

**Status:** `lib/slides/moldAffinity.ts` · `lib/slides/pedagogicalBranch.ts` · `lib/slides/moldSlotFit.ts` · `components/slides/core/slidePresentation.ts`  
**Data:** 2026-06-27 (v2 — ramo pedagógico + fallback runtime)

## Problema

Subtópicos canônicos (41) são **buckets amplos**. Um molde L3 fixo por subtópico distorce questões de **outro ramo** (ex.: escore Z ou puberdade em Saúde do Adolescente recebendo moldes de sigilo).

## Princípio: conteúdo vence mapa

```text
1. layout_variant explícito no JSON
2. Estrutura semântica (rows → tabela; correct[] → compare)
3. meta.pedagogical_branch → BRANCH_DESIGN_MAP (quando existir)
4. meta.family + rotação por slug (FAMILY_VISUAL_PROFILE)
5. Molde bespoke do subtópico/ramo — somente se afinidade + slots > 0
6. Fallback semântico (calculateLayoutVariantFromType)
7. Runtime: se molde bespoke ficaria com 0 slots → fallback automático (família/genérico)
```

## Camadas novas (v2)

| Módulo | Função |
|--------|--------|
| `pedagogicalBranch.ts` | `inferPedagogicalBranch`, `BRANCH_DESIGN_MAP`, `getPresentationDesign` |
| `moldSlotFit.ts` | `countMoldInteractiveSlots`, `bespokeMoldHasRenderableSlots` |
| `detectMoldL3Mismatch.ts` | Gate L3 na escrita (`premiumGate`) |
| `slidePresentation.ts` | `enrichPresentationContext`, `moldFallback` |

### meta.pedagogical_branch (opcional)

```json
"meta": {
  "subtopico": "Saúde do Adolescente",
  "family": "certo_errado",
  "pedagogical_branch": "adolescente_desenvolvimento"
}
```

Se omitido, o player infere pelo enunciado + slides.

**Saúde do Adolescente**

| Ramo | Molde L3 |
|------|----------|
| `adolescente_etica_sigilo` | `adolescent-*` |
| `adolescente_antropometria` | genérico |
| `adolescente_desenvolvimento` | genérico |
| `adolescente_saude_mental` | genérico |
| `adolescente_generico` | genérico |

**CME** — `cme_preparo_limpeza` · `cme_autoclave_metodos` (tabela) · `cme_processamento_conceito` · `cme_vf_ce` · `cme_generico`

**Saúde Mental** — `mental_raps_legis` (legis/tabela) · `mental_crise_caps` (`sae-decision-tap` + `norm-reveal`) · `mental_dependencia_tabagismo` · `mental_depressao` · `mental_aps_acolhimento` · `mental_generico`

**Sondas** — `sonda_instalacao_protocolo` · `sonda_medicao_nex` (bespoke) · `sonda_generico`

Preencher em lote handcraft:

```bash
npm run catalog:patch-pedagogical-branch -- --lote=saude-adolescente-completo
```

## Regras de afinidade (`MOLD_AFFINITY_RULES`)

| Campo | Efeito |
|-------|--------|
| `homeSubtopicFragments` | Subtópico “de casa” do molde |
| `blockFamilies` | Famílias que nunca usam o molde |
| `blockPatterns` | Rejeita se o corpus bater (Z-score, puberdade, …) |
| `positivePatterns` | **Obrigatório** para moldes `adolescent-*` |
| `pedagogicalBranch` (ctx) | Se ≠ ramo do molde, rejeita (adolescente, mental SAE, sondas genérico) |

**Removido:** `adolescentEthicsMold` (auto-apply no subtópico) — causava 0/0 pilares em puberdade.

## Gate premium (escrita)

`auditPremiumQuestao` chama `detectMoldL3Mismatch`:

- `mold_l3_zero_slots` → **error** (conteúdo incompatível com molde)
- `mold_l3_affinity_rejected` → **warn** (player usa fallback)
- `pedagogical_branch_inferred` → **warn** (prefira declarar no handcraft)

## Testes

```bash
npm test -- moldAffinity pedagogicalBranch moldSlotFit slidePresentationSubtopicMold
```

Regressões:

- IBAM escore Z → `reference_table`, não `adolescent-sigilo-spectrum`
- IGEDUC puberdade → `morphological`, não `adolescent-privacy-curtain`
- Sigilo/gravidez → mantém `adolescent-*`

## Estender a outros subtópicos

1. Cluster em ramos (`GOLDEN_HANDCRAFT_MODEL.md` fase 1b)
2. Entrada em `BRANCH_DESIGN_MAP`
3. Regras em `MOLD_AFFINITY_RULES` para moldes bespoke do ramo
4. Testes em `__tests__/pedagogicalBranch.test.ts` + `slidePresentationSubtopicMold.test.ts`

## Referências

- [`PREMIUM_QUESTAO.md`](PREMIUM_QUESTAO.md) — L2 vs L3
- [`GOLDEN_HANDCRAFT_MODEL.md`](GOLDEN_HANDCRAFT_MODEL.md) — cluster por ramo
- [`VARIANT_MOLDS.md`](VARIANT_MOLDS.md) — criar molde bespoke

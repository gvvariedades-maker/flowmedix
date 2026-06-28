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
| `detectMoldL3WriteBlockers.ts` | Bloqueios L3 fase A/B na escrita |
| `patchPedagogicalMeta.ts` | Backfill `meta.family` + `meta.pedagogical_branch` |
| `slidePresentation.ts` | `enrichPresentationContext`, `moldFallback` |

### meta.pedagogical_branch (opcional)

```json
"meta": {
  "subtopico": "Saúde do Adolescente",
  "family": "certo_errado",
  "pedagogical_branch": "adolescente_desenvolvimento"
}
```

Se omitido, o player infere pelo enunciado + slides. **`meta.pedagogical_branch` da questão** é lido no player (`questionMeta` → `enrichPresentationContext`); slide pode sobrescrever.

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

**Mapeamento L3 (quantos moldes inéditos?):**

```bash
npm run audit:l3-mold-gap
```

Saída: `artifacts/l3-mold-gap-audit.json` + `artifacts/l3-mold-gap-audit.md` — matriz cluster × decisão (`ok_existente` | `ok_generico` | `ramo_novo` | `molde_inedito`).

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

`auditPremiumQuestao` chama `detectMoldL3Mismatch` + `detectMoldL3WriteBlockers`:

| Código | Severidade | Fase |
|--------|------------|------|
| `mold_l3_zero_slots` | **error** | A |
| `mold_l3_declared_branch_conflict` | **error** | A — `meta.pedagogical_branch` declarado ≠ molde que o player renderiza |
| `mold_l3_unresolved_bespoke` | **error** | B — só `content_standard: golden-v1` ou com `pedagogical_branch` declarado |
| `mold_l3_affinity_rejected` | **warn** | catálogo pré-backfill sem branch declarado |
| `mold_l3_runtime_fallback` | **warn** | idem |
| `pedagogical_branch_inferred` | **warn** | prefira declarar no handcraft |

### Rollout do gate

| Fase | Escopo do error | Quando |
|------|-----------------|--------|
| A | `mold_l3_zero_slots` + `mold_l3_declared_branch_conflict` | Imediato |
| B | `mold_l3_unresolved_bespoke` em golden-v1 / com branch declarado | Após backfill do subtópico |
| C | `mold_l3_unresolved_bespoke` em todo `isPremiumSubtopico` | Após backfill global |

## Backfill Supabase (`meta.pedagogical_branch`)

Módulo: `lib/catalogMigration/patchPedagogicalMeta.ts` · CLI: `scripts/catalog-patch-pedagogical-branch.ts`

```bash
# Dry-run por subtópico (só premium)
npm run catalog:patch-pedagogical-branch -- --from-supabase --subtopico=Farmacodin --only-premium --dry-run

# Aplicar após revisar artifacts/patch-pedagogical-branch-slugs.jsonl
npm run catalog:patch-pedagogical-branch -- --from-supabase --subtopico=Farmacodin --only-premium --apply

# Corrigir branch declarado errado (ex. Adolescente)
npm run catalog:patch-pedagogical-branch -- --from-supabase --subtopico=Adolescente --force-branch --only-premium --apply
```

Flags: `--only-golden-v1` · `--force-family` · `--force-branch` · `--no-infer-family`

Critério de aceite pós-apply: `post_mismatch` vazio ou só `mold_l3_runtime_fallback`; zero `mold_l3_zero_slots`.

Auditoria no catálogo vivo:

```bash
npm run audit:l3-mold-gap -- --from-supabase --subtopico=Adolescente
```

Saída inclui `slug_mismatch_by_subtopico` no relatório JSON/MD.

## Matriz P0–P3 (rollout por subtópico)

| Prioridade | Subtópico | Molde de casa | Ramos | Status |
|------------|-----------|---------------|-------|--------|
| P0 | Farmacodinâmica e Farmacocinética | `adme-journey-rail` | `farmaco_pk_pd_vf` · `farmaco_clinico_protocolo` · `farmaco_generico` | **branch_implemented** — backfill + gate B |
| P1 | Imunização | `pni-rules-deck` | `imunizacao_vf_intervalos` · `imunizacao_calendario` · `imunizacao_generico` | **branch_implemented** |
| P1 | Vias de Administração | `absorption-speed-rail` | `via_vf_absorcao` · `via_tecnica_admin` · `via_generico` | **branch_implemented** |
| P1 | Cálculo de Medicamentos | `dose-equivalence-rail` | `calc_dose_equivalencia` · `calc_conceito` · `calc_generico` | **branch_implemented** |
| P2 | Doenças Respiratórias Crônicas | `respiratorio-asma-dpoc-duel-deck` | `respiratorio_vf_asma_dpoc` · `respiratorio_dpoc_oxigenio` · `respiratorio_asma_crise` · `respiratorio_tecnica_inalador` · `respiratorio_generico` | **branch_implemented** — backfill + gate B |
| P2 | ISTs, Sinais Vitais, Oxigenoterapia, Curativos, Punção, Lab, Trabalho/NR32 | respectivos bespoke | 2–3 ramos/cluster | pendente |
| P3 | Assistência Perioperatória | genérico | `perioperatorio_*` em `l3MoldGapCatalog` | `branch_implemented: false` — código antes do backfill |

Subtópicos com layout **genérico** (bridge/morphological) — não exigem ramos; só backfill de `family` se golden-v1.

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

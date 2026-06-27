# Resolver de moldes por afinidade de conteúdo

**Status:** implementado em `lib/slides/moldAffinity.ts` + `components/slides/core/slidePresentation.ts`  
**Data:** 2026-06-27

## Problema

Subtópicos canônicos (41) são **buckets amplos**. O `SUBTOPIC_DESIGN_MAP` atribuía **um molde L3 fixo** a todo card do subtópico — inclusive quando o ramo pedagógico da questão era outro (ex.: escore Z em Saúde do Adolescente recebendo `adolescent-sigilo-spectrum`).

O handcraft golden-v1 (L2) estava correto; o player (L3) distorcia a experiência.

## Princípio: conteúdo vence mapa

Nova prioridade em `resolveSlidePresentation`:

```text
1. layout_variant explícito no JSON
2. Estrutura semântica (rows → tabela; correct[] → compare)
3. meta.family + rotação por slug (FAMILY_VISUAL_PROFILE)
4. Molde bespoke do subtópico — somente se passar afinidade
5. Fallback semântico (calculateLayoutVariantFromType)
```

## API

| Função | Uso |
|--------|-----|
| `isBespokeLayoutVariant(v)` | Distingue molde premium de layout genérico |
| `collectSlideTextCorpus(slide)` | Texto agregado para matching |
| `bespokeMoldHasContentAffinity(variant, slide, ctx)` | O molde combina com este slide? |
| `shouldApplySubtopicMold(variant, slide, ctx)` | Aplica regra acima + variantes genéricas sempre OK |

Contexto (`MoldAffinityContext`):

- `subtopico` — nome canônico
- `familyId` — `meta.family` (`calc`, `vf`, …)
- `slideType` — `concept_map`, `golden_rule`, …

## Regras de afinidade

Registry em `MOLD_AFFINITY_RULES`:

| Campo | Efeito |
|-------|--------|
| `homeSubtopicFragments` | Subtópico “de casa” do molde |
| `blockFamilies` | Famílias que nunca usam o molde (`calc` × moldes adolescente) |
| `blockPatterns` | Rejeita se o corpus bater (ex.: escore Z, IMC) |
| `positivePatterns` | Obrigatório **fora** do subtópico de casa |
| `adolescentEthicsMold` | No subtópico adolescente, aplica por padrão salvo `block*` |

### Saúde do Adolescente (caso piloto)

Moldes `adolescent-*`:

- **Aplicam** em questões de sigilo, gravidez, CAPS, escuta…
- **Não aplicam** quando o slide fala de escore Z, IMC, antropometria ou `family: calc`

### Demais subtópicos premium

Moldes com `homeSubtopicFragments` (Sondas, SV, PNI, ISTs, …):

- No subtópico de casa → aplica salvo `blockPatterns`
- Fora do subtópico de casa → exige `positivePatterns`

Moldes **sem** entrada no registry → pass (compatibilidade legado).

## Variedade visual (evitar monotonia)

Quando o molde bespoke **não** aplica:

- Reativa `familyPool` + `pickRotatedLayoutVariant` por slug
- Mantém `template` de cor do subtópico no `themeGenerator`
- L2 continua único por questão

## Testes

```bash
npm test -- moldAffinity
npm test -- slidePresentationSubtopicMold
npm test -- slidePresentationFamily
```

Caso de regressão: IBAM `ibam-enfermagem-nutricao-aplicada-a-enfermagem-1777102845644-0` — `golden_rule` → `reference_table`, não `adolescent-sigilo-spectrum`.

## Estender o registry

Ao criar molde bespoke novo (`VARIANT_MOLDS.md`):

1. Adicionar entrada em `MOLD_AFFINITY_RULES`
2. Definir `homeSubtopicFragments` + `positivePatterns` OU `blockPatterns`
3. Teste em `__tests__/moldAffinity.test.ts`

## Referências

- [`PREMIUM_QUESTAO.md`](PREMIUM_QUESTAO.md) — L2 vs L3
- [`VARIANT_MOLDS.md`](VARIANT_MOLDS.md) — quando criar molde bespoke
- [`lib/catalogMigration/familyLayoutProfile.ts`](../lib/catalogMigration/familyLayoutProfile.ts) — famílias pedagógicas

# Modelo Taxonomia — Classificar questões no subtópico correto

**Runbook operacional** para garantir que cada questão do catálogo AVANT (~5.180 registros) esteja no **subtópico canônico** que corresponde ao conteúdo central do enunciado — **antes** do handcraft golden-v1.

Complementa (não substitui):
- [`TAXONOMIA_CONVERSA.md`](TAXONOMIA_CONVERSA.md) — prompt `Classify: <bucket ou catálogo>`
- [`DECISAO_TRILHO_A_UNICO.md`](DECISAO_TRILHO_A_UNICO.md) — handcraft só após taxonomia estável
- [`GOLDEN_HANDCRAFT_MODEL.md`](GOLDEN_HANDCRAFT_MODEL.md) — handcraft de slides
- [`data/catalog-migration/taxonomy-registry.json`](../data/catalog-migration/taxonomy-registry.json) — buckets catch-all, tiers de confiança

---

## 1. North star

| Princípio | Regra |
|-----------|--------|
| **Prova primeiro** | Classificar pelo **conteúdo central** do enunciado, não palavra solta |
| **41 subtópicos canônicos** | Prateleira da vitrine + design (`CLAUDE.md` §9) — lista fechada salvo ADR |
| **Ramos dentro do subtópico** | Granularidade fina = cluster pedagógico (`cluster-*-topics.ts`), não novo subtópico |
| **Taxonomia ≠ handcraft** | Classificar rotula; handcraft ensina slides |
| **Revisão humana** | Apply automático só com confidence ≥ 0.90 (tier verde) |

---

## 2. Duas camadas

```text
Camada 1 — Subtópico canônico (vitrine)
  titulo_aula + meta.subtopico alinhados
  infer-subtopico / reclassify / revisão humana

Camada 2 — Ramo pedagógico (dentro do subtópico)
  cluster report → goldens âncora → handcraft
  NÃO exige novo subtópico na vitrine
```

**Criar ou excluir subtópico canônico** só quando:
- volume ≥ **10%** do catálogo **ou** ≥ **50 questões** com tema coeso sem casa nos 41;
- impacto mapeado em `themeGenerator.ts`, registry, docs;
- ADR documentada (como [`DECISAO_TRILHO_A_UNICO.md`](DECISAO_TRILHO_A_UNICO.md)).

---

## 3. Pipeline (ordem obrigatória)

### Fase 0 — Inventário

```bash
npm run audit:subtopico-inventory
npm run audit:subtopico-inventory -- --catch-all-only
npm run audit:subtopico-inventory -- --mismatches-only
```

Saída:
- `artifacts/subtopico-inventory-audit.json`
- `artifacts/subtopico-inventory-mismatches.csv` (se houver mismatches)

Métricas: contagem por `titulo_aula`, por `meta.subtopico`, labels não canônicos, catch-all buckets.

### Fase 1 — Normalizar aliases legados

```bash
npm run catalog:reclassify-subtopico -- --dry-run
npm run catalog:reclassify-subtopico -- --apply
npm run catalog:reclassify-subtopico -- --apply --sync-meta
```

Usa `LEGACY_SUBTOPICO_MAP` — rótulos de importação → canônico.

### Fase 2 — Inferência semântica (buckets catch-all primeiro)

Ordem sugerida (`taxonomy-registry.json` → `priority_infer_order`):

1. Procedimentos Diversos
2. Questões Mescladas e Outras Doenças Agudas
3. Outras Doenças… Transmissíveis
4. DCNT mescladas
5. Processo de Enfermagem
6. Segurança do Paciente

```bash
npm run catalog:infer-subtopico -- --subtopico="Procedimentos Diversos" --dry-run --limit=100
npm run catalog:infer-subtopico -- --subtopico="Procedimentos Diversos" --heuristic-only --dry-run
```

Relatório: `artifacts/catalog-infer-subtopico-<bucket-slug>.json`

### Fase 3 — Revisão por tier de confiança

| Tier | Confidence | Ação |
|------|------------|------|
| **Verde** | ≥ 0.90 | `--apply --min-confidence=0.90` |
| **Amarela** | 0.70–0.89 | Revisão humana; agente `Classify:` ou scripts `reclass-faixa-*` |
| **Vermelha** | < 0.70 ou conflito slug × sugestão | Leitura manual do enunciado |

Apply (só após revisão ou tier verde):

```bash
npm run catalog:infer-subtopico -- \
  --from-report=artifacts/catalog-infer-subtopico-procedimentos-diversos.json \
  --apply --min-confidence=0.85
```

Atualiza `meta.subtopico`, slides `meta.subtopico` e `titulo_aula` (via apply).

### Fase 4 — Validar

```bash
npm run audit:subtopico-inventory
npm run audit:subtopico-inventory -- --mismatches-only
```

Critério: `mismatch_count` → 0 (ou justificado); catch-all buckets encolhendo.

### Fase 5 — Handcraft (depois)

Só iniciar handcraft quando o subtópico estiver estável. Ver [`GOLDEN_HANDCRAFT_MODEL.md`](GOLDEN_HANDCRAFT_MODEL.md).

---

## 4. Ferramentas no repo

| Comando | Função |
|---------|--------|
| `npm run audit:subtopico-inventory` | Inventário titulo_aula × meta × canônicos |
| `npm run catalog:reclassify-subtopico` | Aliases legados → canônico |
| `npm run catalog:infer-subtopico` | Gemini/heurística por enunciado |
| `npx tsx scripts/catalog-merge-agent-infer.ts` | Mesclar inferências do agente |
| `scripts/reclass-faixa-*-inferences.ts` | Lotes revisados manualmente |

Implementação inferência: [`lib/catalogMigration/inferSubtopicoFromEnunciado.ts`](../lib/catalogMigration/inferSubtopicoFromEnunciado.ts)

Inventário: [`lib/catalogMigration/subtopicoInventory.ts`](../lib/catalogMigration/subtopicoInventory.ts)

---

## 5. Definition of Done — taxonomia fechada (subtópico ou catálogo)

- [ ] `audit:subtopico-inventory` → `mismatch_count` = 0
- [ ] 0 labels não canônicos em `titulo_aula` (salvo DCNT legado em consolidação)
- [ ] Catch-all buckets abaixo do limiar acordado ou vazios
- [ ] Amostra ≥5% revisada manualmente por bucket migrado
- [ ] `handcraft-registry` pode receber export `*-completo` confiável

---

## Resumo executivo

**Taxonomia** classifica; **handcraft** ensina. Inventário → normalizar → inferir catch-all → revisar → apply → validar → só então handcraft.

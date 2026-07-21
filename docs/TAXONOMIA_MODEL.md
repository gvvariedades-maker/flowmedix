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

Só iniciar handcraft quando o gate passar:

```bash
npm run audit:subtopico-inventory -- --subtopico="<Nome canônico>"
npm run audit:taxonomy-gate -- --subtopico="<Nome canônico>"
```

Critério: `gate=pass` ou `gate=warn` com `handcraft_allowed=true`. Ver [`GOLDEN_HANDCRAFT_MODEL.md`](GOLDEN_HANDCRAFT_MODEL.md) e §6 (catch-all).

---

## 4. Ferramentas no repo

| Comando | Função |
|---------|--------|
| `npm run audit:subtopico-inventory` | Inventário titulo_aula × meta × canônicos |
| `npm run audit:taxonomy-gate` | Gate pass \| warn \| block antes do 1º lote handcraft |
| `npm run catalog:reclassify-subtopico` | Aliases legados → canônico |
| `npm run catalog:infer-subtopico` | Gemini/heurística por enunciado |
| `npx tsx scripts/catalog-merge-agent-infer.ts` | Mesclar inferências do agente |
| `scripts/reclass-faixa-*-inferences.ts` | Lotes revisados manualmente |

Implementação inferência: [`lib/catalogMigration/inferSubtopicoFromEnunciado.ts`](../lib/catalogMigration/inferSubtopicoFromEnunciado.ts)

Inventário: [`lib/catalogMigration/subtopicoInventory.ts`](../lib/catalogMigration/subtopicoInventory.ts)

Gate: [`lib/catalogMigration/taxonomyGate.ts`](../lib/catalogMigration/taxonomyGate.ts) · `handcraft-registry.json` → `taxonomy_schema`

---

## 5. Definition of Done — taxonomia fechada (subtópico ou catálogo)

- [ ] `audit:subtopico-inventory` → `mismatch_count` = 0
- [ ] `audit:taxonomy-gate` → `gate=pass` ou `gate=warn` com `handcraft_allowed=true`
- [ ] 0 labels não canônicos em `titulo_aula` (salvo DCNT legado em consolidação)
- [ ] Catch-all: modo A ou B declarado em `handcraft-registry.json` → `taxonomy`
- [ ] Artefato `artifacts/taxonomy-closed-<pacote_prefix>.json` (ou `--write-closed`)
- [ ] Amostra ≥5% revisada manualmente por bucket migrado
- [ ] `handcraft-registry` pode receber export `*-completo` confiável

---

## 6. Política catch-all — modos A e B

Buckets catch-all (`taxonomy-registry.json` → `catch_all_buckets`) concentram questões ainda sem destino canônico. Dois modos **explícitos** no `handcraft-registry.json` → `taxonomy`:

| Modo | `catch_all_mode` | `taxonomy.status` | Quando usar | Handcraft | Antes de `--promote` |
|------|------------------|-------------------|-------------|-----------|----------------------|
| **A — Fechar primeiro** | `A` | `closed` | Pacote novo; export `*-completo` | Só após `Classify:` esvaziar/reclassificar o bucket | Bucket vazio ou justificado |
| **B — Handcraft provisório** | `B` | `catch_all_provisional` | Lote já em andamento no catch-all (ex. `dtrans-mescladas-g01/g02`) | Permitido com `gate=warn` | `infer-subtopico` / `Classify:` para destinos canônicos |

**Exemplo modo B (dtrans):** `handcraft-registry.json` → `Outras Doenças e Questões Mescladas sobre Doenças Transmissíveis` · artefato `artifacts/taxonomy-closed-dtrans-mescladas.json`.

**Exemplo modo A concluído (dtrans, 2026-07):** bucket catch-all vazio no Supabase; 16/16 slugs do manifest em destinos canônicos. Gate detecta `manifest.reclassified=true` mesmo com `total_scanned=0` no inventário por `titulo_aula`. Ver [`data/catalog-migration/dtrans-mescladas/README.md`](../data/catalog-migration/dtrans-mescladas/README.md).

### Vitrine após reclassificação (catch-all → canônico)

Quando o modo A esvazia o bucket, os slugs **permanecem** no catálogo com URL legada, mas `titulo_aula` + `meta.subtopico` apontam para subtópicos canônicos. A vitrine `/estudar` agrupa por `titulo_aula` — os cards **não** aparecem no catch-all. O handcraft local do pacote (`dtrans-mescladas-g*`) continua válido; `--promote` não exige novo `infer` se `audit:taxonomy-gate` retornar `reclassified=true`.

**Proibido:** handcraft em catch-all sem `taxonomy.status` declarado — `audit:taxonomy-gate` retorna `block`.

### Gate executável

```bash
npm run audit:taxonomy-gate -- --subtopico="Outras Doenças e Questões Mescladas sobre Doenças Transmissíveis"
npm run audit:taxonomy-gate -- --subtopico="Farmacodinâmica e Farmacocinética" --write-closed
```

| `gate` | Significado | Exit code |
|--------|-------------|-----------|
| `pass` | Inventário ok + taxonomia fechada (ou não catch-all) | 0 |
| `warn` | Inventário ok; catch-all modo B ou registry ainda `open` | 0 |
| `block` | mismatch, labels não canônicos ou catch-all sem declaração | 1 |

Saídas: `artifacts/taxonomy-gate-<pacote_prefix>.json` · opcional `--write-closed` → `artifacts/taxonomy-closed-<pacote_prefix>.json`.

---

## Resumo executivo

**Taxonomia** classifica; **handcraft** ensina. Inventário → gate → normalizar → inferir catch-all → revisar → apply → validar → handcraft.

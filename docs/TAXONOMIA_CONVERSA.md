# Taxonomia — prompt de conversa

Use em **conversa nova**:

```text
Classify: Procedimentos Diversos
```

ou catálogo inteiro (inventário + fila catch-all):

```text
Classify: catálogo inteiro
```

ou anexe este arquivo (`@docs/TAXONOMIA_CONVERSA.md`) após editar:

```text
ESCOPO: Procedimentos Diversos
```

---

## Instruções para o agente (executar sem pedir modo)

O usuário quer **classificar questões no subtópico canônico correto** — não handcraft de slides.

### Proibido nesta conversa

- `npm run catalog:upgrade-premium`
- `npm run ai:generate` (slides)
- `catalog:apply-lote` / `catalog:infer-subtopico --apply` sem o usuário pedir explicitamente
- Handcraft de `reverse_study_slides` (isso é outra conversa: `Handcraft: …`)

### Ler antes

| Arquivo | Quando |
|---------|--------|
| [`docs/TAXONOMIA_MODEL.md`](TAXONOMIA_MODEL.md) | Sempre |
| [`data/catalog-migration/taxonomy-registry.json`](../data/catalog-migration/taxonomy-registry.json) | Buckets catch-all, tiers, comandos |
| [`lib/catalogMigration/canonicalSubtopicos.ts`](../lib/catalogMigration/canonicalSubtopicos.ts) | 41 nomes exatos |
| `artifacts/subtopico-inventory-audit.json` | Se existir — baseline |

### Resolver escopo

| Mensagem do usuário | Ação |
|---------------------|------|
| `Classify: catálogo inteiro` | Rodar inventário; priorizar `priority_infer_order` do registry |
| `Classify: <subtópico canônico>` | Inventário filtrado + infer dry-run naquele bucket |
| Bucket catch-all | Inferência semântica prioritária |

Match **exato** do subtópico quando for canônico (`CLAUDE.md` §9).

### Pipeline por escopo

```bash
# 1. Baseline
npm run audit:subtopico-inventory
# opcional filtro:
npm run audit:subtopico-inventory -- --subtopico=<trecho>
npm run audit:subtopico-inventory -- --catch-all-only

# 2. Aliases legados (dry-run primeiro)
npm run catalog:reclassify-subtopico -- --dry-run

# 3. Inferência no bucket
npm run catalog:infer-subtopico -- --subtopico="<Nome Exato>" --dry-run --limit=50

# 4. apply só quando usuário pedir:
npm run catalog:infer-subtopico -- \
  --from-report=artifacts/catalog-infer-subtopico-<slug>.json \
  --apply --min-confidence=0.85
```

Usar **`npm run`** no Windows.

### Revisão humana (tier amarelo/vermelho)

Para propostas com `confidence` < 0.90 ou mudança de macro-área:

1. Ler enunciado + alternativas no export ou relatório infer.
2. Escolher subtópico canônico **literal** da lista de 41.
3. Opcional: gerar `*-inferred.json` e mesclar via `catalog-merge-agent-infer.ts` (padrão `reclass-faixa-*`).

**Não criar subtópico novo** sem volume + ADR — preferir canônico existente ou ramo cluster depois.

### Entregáveis

- Resumo do inventário (mismatch, catch-all, não canônicos)
- Relatório infer dry-run (contagens keep_current / mudanças / erros)
- Lista de slugs tier amarelo/vermelho para revisão
- Se apply pedido: contagem applied / failed

### Depois da taxonomia

Quando o bucket estiver estável → nova conversa `Handcraft: <subtópico>`.

Referência handcraft: [`HANDCRAFT_CONVERSA.md`](HANDCRAFT_CONVERSA.md)

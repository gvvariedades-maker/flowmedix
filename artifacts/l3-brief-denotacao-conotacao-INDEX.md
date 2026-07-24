# L3 — Índice · Denotação, conotação e figuras de linguagem

**Gerado:** 2026-07-23  
**pacote_prefix:** `denotacao-conotacao`  
**total_slugs:** 33  
**Ramos:** 1 (`pt_denotacao_conotacao`)

---

## Resumo de decisão

| branch_id | Slugs | % pacote | Decisão L3 | Brief | Molde React |
|-----------|------:|--------:|------------|-------|-------------|
| `pt_denotacao_conotacao` | 33 | 100% | **ok_generico** | [pt_denotacao_conotacao](l3-brief-denotacao-conotacao-pt_denotacao_conotacao.md) | — (dispensado) |

**Cluster:** `artifacts/lingua-portuguesa-topic-cluster-report.json` — card E Vocabulário · `Denotação e Conotação` (33)  
**Guideline:** `lib/guidelines/linguaPortuguesa/denotacaoConotacao.ts`  
**Playbook:** `lingua-portuguesa.json` → `pt_denotacao_conotacao` · mold `morphological · reference_table · tap · compare`

---

## Árvore de decisão (pacote)

```text
Pegadinha = texto × texto E compare/rows/tap bastam?
  SIM → ok_generico (este pacote)
```

Não há ramo forte com `molde_redesign` / `molde_inedito`. Cauda longa: N/A (um único ramo).

---

## Teste espacial 3/3 — pt_denotacao_conotacao

| # | Pergunta | Resposta |
|---|----------|----------|
| 1 | Pegadinha **não** é espacial? | **Sim** — classificação literal/figurado e nome de figura cabem em `compare` + `rows` |
| 2 | Padrão em <5 questões **e** <10%? | **Não** — 33 slugs (100% do card) |
| 3 | `compare` + `correct` já ensina sem UI bespoke? | **Sim** — distrator errado = troca literal↔figurado ou figura errada |

→ **ok_generico** confirmado (pergunta 1 e 3 sim; volume alto não exige bespoke sem erro sequencial).

---

## Mix de famílias (extraído do caderno)

| Padrão | ~count | Handcraft |
|--------|-------:|-----------|
| Texto + trecho destacado | 7 | `text_fragment` |
| Literal × figurado / conotação | 14 | `conceito` |
| Nomear figura de linguagem | 9 | `conceito` |
| Outros (sinonímia adjacente) | 3 | `conceito` |

---

## Próximo capítulo (programa IDE)

1. **Âncoras** — `audit:golden-anchor-gate` → criar `examples/questao-premium-vunesp-portugues-denotacao-literal-figurado.json` (tec 3789297)
2. **Handcraft** — `denotacao-conotacao-g01` (8 slugs) após âncora READY

---

## Evidências

- Brief ramo: `artifacts/l3-brief-denotacao-conotacao-pt_denotacao_conotacao.md`
- Mold-gap: `artifacts/l3-mold-gap-audit-denotacao-conotacao.json`
- Manifest: `data/catalog-migration/denotacao-conotacao-completo/manifest.json`

# L3 — Índice — Sinônimos, antônimos e polissemia

**Gerado:** 2026-07-23  
**pacote_prefix:** sinonimos-antonimos-e-polissemia  
**total_slugs:** 63  
**Ramos:** 1 (pt_sinonimos_polissemia)

---

## Resumo de decisão

| branch_id | Slugs | % pacote | Decisão L3 | Brief | Molde React |
|-----------|------:|--------:|------------|-------|-------------|
| pt_sinonimos_polissemia | 63 | 100% | **ok_generico** | [pt_sinonimos_polissemia](l3-brief-sinonimos-antonimos-e-polissemia-pt_sinonimos_polissemia.md) | — (dispensado) |

**Cluster:** rtifacts/lingua-portuguesa-topic-cluster-report.json — card E Vocabulário — Sinônimos e Antônimos (55) + Polissemia (6) + Homônimos e Parônimos (2)  
**Guideline:** lib/guidelines/linguaPortuguesa/sinonimosPolissemia.ts  
**Playbook:** lingua-portuguesa.json → pt_sinonimos_polissemia · mold morphological · reference_table · tap · compare

---

## Árvore de decisão (pacote)

`	ext
Pegadinha = troca de sentido no contexto E compare/rows/tap bastam?
  SIM → ok_generico (este pacote)
`

Não há ramo forte com molde_redesign / molde_inedito. Cauda longa: N/A (um único ramo).

---

## Teste espacial 3/3 — pt_sinonimos_polissemia

| # | Pergunta | Resposta |
|---|----------|----------|
| 1 | Pegadinha **não** é espacial? | **Sim** — sinonímia contextual, antonímia e polissemia cabem em compare + 
ows |
| 2 | Padrão em <5 questões **e** <10%? | **Não** — 63 slugs (100% do card) |
| 3 | compare + correct já ensina sem UI bespoke? | **Sim** — distrator = sinônimo de dicionário fora do contexto ou confusão polissemia/parônimo |

→ **ok_generico** confirmado.

---

## Mix de famílias (extraído do caderno)

| Padrão | ~count | Handcraft |
|--------|-------:|-----------|
| Texto + vocabulário no contexto | 25+ | 	ext_fragment / conceito |
| Substituir por sinônimo / equivalência | 17 | conceito |
| Polissemia (mesma forma, sentidos) | 6 | conceito |
| Parônimos / homônimos | 2 | conceito |
| Sentido / significado explícito | 20 | conceito |

---

## Próximo capítulo (programa IDE)

1. **Âncoras** — udit:golden-anchor-gate → criar examples/questao-premium-apice-portugues-sinonimos-polissemia-refletiu.json (tec 3951883)
2. **Handcraft** — sinonimos-antonimos-e-polissemia-g01 (8 slugs) após âncora READY

---

## Evidências

- Brief ramo: rtifacts/l3-brief-sinonimos-antonimos-e-polissemia-pt_sinonimos_polissemia.md
- Mold-gap: rtifacts/l3-mold-gap-audit-sinonimos-antonimos-e-polissemia.json
- Manifest: data/catalog-migration/sinonimos-antonimos-e-polissemia-completo/manifest.json

# CME — handcraft golden-v1 (fechado)

**Subtópico:** Enfermagem em Central de Material e Esterilização (CME)  
**Modo:** Handcraft golden-v1 total (1 JSON por slug)  
**Status:** 35/35 handcraft · apply g01–g05 OK (2026-06-23) · revalidado strict 2026-06-27

Runbook geral: [`docs/GOLDEN_HANDCRAFT_MODEL.md`](../../../docs/GOLDEN_HANDCRAFT_MODEL.md) · ADR: [`docs/DECISAO_TRILHO_A_UNICO.md`](../../../docs/DECISAO_TRILHO_A_UNICO.md).

**Nova conversa (outro subtópico):** envie `Handcraft: <subtópico canônico>` — ver [`docs/HANDCRAFT_CONVERSA.md`](../../../docs/HANDCRAFT_CONVERSA.md).

---

## O que este pacote fez

| Decisão | Valor |
|---------|--------|
| Slugs no catálogo | 35 (`manifest.json`) |
| Lotes de migração | `cme-g01` … `g05` (6+10+4+6+9) |
| Âncoras de estilo | 8 em `examples/questao-premium-*-cme-*.json` |
| Cluster pedagógico | `npm run cluster:cme` → `artifacts/cme-topic-cluster-report.json` |
| Guideline | `lib/guidelines/cme.ts` (Anvisa RDC 15/2012) |
| **Não usado** | `npm run ai:generate` · `npm run catalog:upgrade-premium` |

Cada questão foi reescrita no Cursor com 4 slides planos, `meta.sources`, `content_review` e `content_standard: "golden-v1"`.

---

## Lotes e artefatos

| Lote | Questões | Cluster | Links player | Relatório apply |
|------|----------|---------|--------------|-----------------|
| g01 | 6 | Preparo e limpeza | [`artifacts/cme-g01-links.html`](../../../artifacts/cme-g01-links.html) | `artifacts/catalog-migration-cme-g01-applied.json` |
| g02 | 10 | Autoclave e métodos | [`artifacts/cme-g02-links.html`](../../../artifacts/cme-g02-links.html) | `…-g02-applied.json` |
| g03 | 4 | Processamento — conceito | [`artifacts/cme-g03-links.html`](../../../artifacts/cme-g03-links.html) | `…-g03-applied.json` |
| g04 | 6 | C/E + INCORRETA | [`artifacts/cme-g04-links.html`](../../../artifacts/cme-g04-links.html) | `…-g04-applied.json` |
| g05 | 9 | Cauda longa | [`artifacts/cme-g05-links.html`](../../../artifacts/cme-g05-links.html) | `…-g05-applied.json` |

Slugs por lote: `data/catalog-migration/cme-gNN/manifest.json` · metadados: `cme-gNN/lote-meta.json`.

---

## Âncoras por ramo (estilo, não catálogo)

| Ramo | Arquivo em `examples/` |
|------|------------------------|
| Preparo / pré-secagem | `questao-premium-idecan-cme-preparo-presecagem.json` |
| Autoclave / parâmetros | `questao-premium-iacp-cme-autoclave-parametros.json` |
| Manuseio estéril | `questao-premium-avancasp-cme-manuseio-esteril.json` |
| C/E — função RT | `questao-premium-idecan-cme-rt-funcao-certo.json` |
| V/F — áreas CME | `questao-premium-idecan-cme-areas-esterilizacao-vf.json` |
| Métodos INCORRETA | `questao-premium-ameosc-cme-metodos-incorreta.json` |
| Indicador químico | `questao-premium-idecan-cme-indicador-quimico-classe1.json` |
| Função IAAS | `questao-premium-idib-cme-funcao-iaas.json` |

---

## Definition of Done (este subtópico)

- [x] 35/35 slugs com `golden-v1` em `data/catalog-migration/cme-g*/questions/`
- [x] `validate:goldens --lote=… --strict` 0 falhas em todos os lotes (2026-06-27)
- [x] `catalog:apply-lote --apply` 0 failed (g01–g05)
- [ ] Amostra humana ≥5% no player (recomendado pós-deploy)

---

## Revalidar / reaplicar

```bash
npm run validate:goldens -- --lote=cme-g01 --strict
# … g02 … g05

npm run catalog:apply-lote -- --lote=cme-g01 --dry-run
npm run catalog:apply-lote -- --lote=cme-g01 --apply
```

# Saúde Mental — handcraft golden-v1 (fechado)

**Subtópico:** Saúde Mental  
**Modo:** Handcraft golden-v1 total (1 JSON por slug)  
**Status:** 37/37 handcraft · apply micro-01…07 OK (2026-06-23) · revalidado strict 2026-06-27

Runbook geral: [`docs/GOLDEN_HANDCRAFT_MODEL.md`](../../../docs/GOLDEN_HANDCRAFT_MODEL.md) · ADR: [`docs/DECISAO_TRILHO_A_UNICO.md`](../../../docs/DECISAO_TRILHO_A_UNICO.md).

**Nova conversa (outro subtópico):** envie `Handcraft: <subtópico canônico>` — ver [`docs/HANDCRAFT_CONVERSA.md`](../../../docs/HANDCRAFT_CONVERSA.md).

---

## O que este pacote fez

| Decisão | Valor |
|---------|--------|
| Slugs no catálogo | 37 (`manifest.json`) |
| Lotes de migração | `saude-mental-micro-01-goldens` … `micro-07-goldens` (5+6+2+6+5+6+7) |
| Âncoras de estilo | 11 em `examples/questao-premium-*-saude-mental*.json` |
| Cluster pedagógico | `npm run cluster:saude-mental` → `artifacts/saude-mental-topic-cluster-report.json` |
| Guideline | `lib/guidelines/saudeMental.ts` |
| **Não usado** | `npm run ai:generate` · `npm run catalog:upgrade-premium` |

Cada questão foi reescrita no Cursor com 4 slides planos, `meta.sources`, `content_review` e `content_standard: "golden-v1"`.

---

## Lotes e artefatos

| Lote | Questões | Cluster | Relatório apply |
|------|----------|---------|-----------------|
| micro-01-goldens | 5 | RAPS / Reforma / SRT | `artifacts/catalog-migration-saude-mental-micro-01-goldens-applied.json` |
| micro-02-goldens | 6 | Tabagismo / PNCT + dependência | `…-micro-02-goldens-applied.json` |
| micro-03-goldens | 2 | Redução de danos | `…-micro-03-goldens-applied.json` |
| micro-04-goldens | 6 | Crise / agitação / CAPS | `…-micro-04-goldens-applied.json` |
| micro-05-goldens | 5 | APS / acolhimento | `…-micro-05-goldens-applied.json` |
| micro-06-goldens | 6 | Depressão / epidemiologia | `…-micro-06-goldens-applied.json` |
| micro-07-goldens | 7 | Esquizofrenia + cauda longa | `…-micro-07-goldens-applied.json` |

Slugs por lote: `data/catalog-migration/saude-mental-micro-NN-goldens/manifest.json`.

**Links player (todos os 37):** [`artifacts/saude-mental-links.html`](../../../artifacts/saude-mental-links.html)

---

## Âncoras por ramo (estilo, não catálogo)

| Ramo | Arquivo em `examples/` |
|------|------------------------|
| RAPS / Reforma | `questao-premium-fau-unicentro-saude-mental-raps.json` |
| SRT / reforma | `questao-premium-ms-sarmento-saude-mental-srt-reforma.json` |
| Técnico APS | `questao-premium-igeduc-saude-mental-tecnico-aps.json` |
| Tabagismo / PNCT | `questao-premium-fgv-saude-mental-tabagismo-pnct.json` |
| Redução de danos | `questao-premium-idecan-saude-mental-reducao-danos.json` |
| Agitação EXCETO | `questao-premium-fundatec-saude-mental-agitacao-exceto.json` |
| CAPS acolhimento | `questao-premium-ibade-saude-mental-caps-acolhimento.json` |
| Biopsicossocial APS | `questao-premium-vunesp-saude-mental-biopsicossocial.json` |
| Depressão epidemiologia | `questao-premium-vunesp-saude-mental-depressao-epidemiologia.json` |
| Risco suicida V/F | `questao-premium-fepese-saude-mental-risco-suicida-vf.json` |
| Esquizofrenia / psicofármacos | `questao-premium-instituto-aocp-saude-mental-esquizofrenia-psicofarmacos.json` |

---

## Definition of Done (este subtópico)

- [x] 37/37 slugs com `golden-v1` em `data/catalog-migration/saude-mental-micro-*-goldens/questions/`
- [x] `validate:goldens --lote=… --strict` 0 falhas em todos os lotes (2026-06-27)
- [x] `catalog:apply-lote --apply` 0 failed (micro-01…07)
- [ ] Amostra humana ≥5% no player (recomendado pós-deploy)

---

## Revalidar / reaplicar

```bash
npm run validate:goldens -- --lote=saude-mental-micro-01-goldens --strict
# … micro-02 … micro-07

npm run catalog:apply-lote -- --lote=saude-mental-micro-01-goldens --dry-run
npm run catalog:apply-lote -- --lote=saude-mental-micro-01-goldens --apply
```

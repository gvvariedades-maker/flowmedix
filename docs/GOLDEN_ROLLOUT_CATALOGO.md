# Golden Rollout — Catálogo inteiro em golden-v1 (handcraft)

Runbook do programa **"toda questão do AVANT vira golden-v1 handcraft"** (≈5.180 registros, 41 subtópicos).

> **Decisão de produto (2026-06-27):** único trilho de produção = handcraft por slug. Ver [`DECISAO_TRILHO_A_UNICO.md`](DECISAO_TRILHO_A_UNICO.md).

**Pré-requisitos de leitura:**
- [`GOLDEN_HANDCRAFT_MODEL.md`](GOLDEN_HANDCRAFT_MODEL.md) — **runbook operacional** único
- [`GOLDEN_CONTENT_STANDARD.md`](GOLDEN_CONTENT_STANDARD.md) — padrão e gates (`lintGoldenContent`)
- [`PREMIUM_QUESTAO.md`](PREMIUM_QUESTAO.md) — níveis L1/L2/L3
- [`data/catalog-migration/handcraft-registry.json`](../data/catalog-migration/handcraft-registry.json) — progresso por subtópico

---

## 0. Estado atual (baseline — 2026-06-27)

### Subtópicos handcraft fechados

| Subtópico | Slugs | Doc |
|-----------|-------|-----|
| Assistência Perioperatória (Inclui SRPA) | 68 | [`perioperatoria-completo/README.md`](../data/catalog-migration/perioperatoria-completo/README.md) |
| Doenças Respiratórias Crônicas (Asma, DPOC) | 10 | registry |
| Saúde do Adolescente | 16 | [`saude-adolescente-completo/README.md`](../data/catalog-migration/saude-adolescente-completo/README.md) |
| História da Enfermagem | 18 | [`historia-enfermagem-completo/README.md`](../data/catalog-migration/historia-enfermagem-completo/README.md) |
| Processamento de Artigos e Produtos de Saúde | 18 | registry |
| Farmacodinâmica e Farmacocinética | 13 | [`farmacodinamica-e-farmacocinetica-completo/README.md`](../data/catalog-migration/farmacodinamica-e-farmacocinetica-completo/README.md) |
| Feridas e Queimaduras | 8 | registry |
| Enfermagem do Trabalho | 14 | registry |

**Em rollout:** CME (35), Saúde Mental (37).

### Legado builder (re-handcraft pendente)

Subtópicos migrados antes da decisão via `upgradePremium*.ts` (Imunização, Curativos, Sinais Vitais, Vias, Urgências…) constam em `legacy_builder_subtopicos` no registry. **Não contam como fechados** até 100% handcraft golden-v1.

### Infra pendente

| Item | Implicação |
|------|------------|
| `lintGoldenContent` só em `content_standard: "golden-v1"` | Catálogo legado sem flag é invisível ao gate golden |
| `validate:goldens --lote --strict` | Cobre handcraft em `data/catalog-migration/` |
| `audit:golden-supabase` | ⏳ a construir — auditoria golden do DB (§3) |

---

## 1. Gate golden bloqueante

No `apply-lote` e no `validateQuestaoForWrite`, quando `content_standard === "golden-v1"`, issues do `lintGoldenContent` em modo **`--strict`** bloqueiam escrita.

Handcraft **sempre** emite `golden-v1` + passa strict antes do apply.

---

## 2. Variações do golden-v1 por família

Calibrar gates por `meta.family` antes de escalar — ver [`GOLDEN_CONTENT_STANDARD.md`](GOLDEN_CONTENT_STANDARD.md) §7b.

---

## 3. Auditoria do catálogo

### A construir: `audit:golden-supabase`

Espelhar [`scripts/audit-premium-supabase.ts`](../scripts/audit-premium-supabase.ts), rodando `lintGoldenContent` em cada registro:

- `% golden-v1 compliant` por subtópico
- registros legado (sem `content_standard` ou builder)
- top issues por código

Saída → `artifacts/golden-catalog-audit.json`.

**Matriz de progresso:** gerada pela auditoria + [`handcraft-registry.json`](../data/catalog-migration/handcraft-registry.json) — não manual.

---

## 4. Catálogo de fontes por subtópico

Handcraft exige `meta.sources[]` tier A/B. Mapear guidelines em [`lib/guidelines/`](../lib/guidelines/index.ts) como **referência** para o agente — não substituem revisão humana.

---

## 5. Revisão humana factual

| Item | Regra |
|------|-------|
| Amostragem | ≥ 5% de cada lote no player |
| Sign-off | `content_review.reviewer` = iniciais reais |
| Conflito prova × guideline | `content_review.exam_vs_current` |
| Claims numéricos | Conferidos contra fonte citada |

---

## 6. Anti-sameness em escala

Dedup de corpus entre questões do mesmo subtópico — integrar ao `audit:golden-supabase` como `sameness_ratio`.

---

## 7. Definition of Done — subtópico 100% golden

- [ ] **100%** slugs handcraft com `content_standard: "golden-v1"`
- [ ] **100%** passam `validate:goldens --strict`
- [ ] Registry: `status: applied`, `handcraft_applied === total_slugs`
- [ ] Amostra humana ≥5% aprovada
- [ ] `catalog:apply-lote --apply` 0 failed

---

## 8. Fases do programa

```
Fase 0  Infra
        ├── validate:goldens --lote --strict (✅)
        └── audit:golden-supabase (⏳)

Fase 1  Rollout handcraft por subtópico
        └── docs/GOLDEN_HANDCRAFT_MODEL.md (export → cluster → lotes gNN → apply)

Fase 2  Re-handcraft legado builder (Imunização, Sinais Vitais, Vias…)

Fase 3  Auditoria contínua + dedup corpus
```

**Ordem sugerida:** pequenos/em andamento → médios → grandes legado. Ver §9 em [`GOLDEN_HANDCRAFT_MODEL.md`](GOLDEN_HANDCRAFT_MODEL.md).

---

## 9. Comandos

| Comando | Função |
|---------|--------|
| `npm run validate:goldens -- --lote=<lote> --strict` | Lint handcraft — **obrigatório antes do apply** |
| `npm run catalog:export-lote` | Export Supabase |
| `npm run catalog:apply-lote` | Grava no DB |
| `npm run audit:premium-supabase` | Stub/molde no catálogo |
| `npm run audit:golden-supabase` | ⏳ Lint golden do catálogo |

> Rodar via **`npm run`** no Windows.

---

## Resumo executivo

Todo o catálogo converge para **handcraft golden-v1 por slug**. Builders e hybrid são **legado** a re-handcraftar. O lint strict + registry governam o progresso; revisão humana sustenta corretude clínica.

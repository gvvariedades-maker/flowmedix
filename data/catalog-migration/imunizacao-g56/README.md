# imunizacao-g56 — handcraft golden-v1

**Subtópico:** Imunização · **Prioridade:** P1 pós-calendário · **Status:** `handcraft_ready` (8/8)

> Pool P0 calendário esgotado em **g42**. Este é o primeiro lote P1 (cadeia de frio + EXCETO + V/F + conceitos). Lotes **g44–g55** foram planejados em paralelo com calendário — possível overlap de slugs; g56 não usa `imunizacao-exclude-done` (padrão g08).

## Slugs

| # | Slug | Cluster | Ramo | Tema | Gabarito |
|---|------|---------|------|------|----------|
| 1 | `cogeps-unioeste-enfermagem-imunizacao-1779572207173-0` | Cadeia de frio | `imunizacao_cadeia_frio` | Conservação — caixa térmica sol/calor | C |
| 2 | `cotec-fadenor-enfermagem-imunizacao-1777103264001-2` | Cadeia de frio* | `imunizacao_calendario` | Objetivo da imunização (prevenção) | B |
| 3 | `cotec-fadenor-enfermagem-imunizacao-1779572215875-7` | Cadeia de frio | `imunizacao_cadeia_frio` | Rede de frio × cadeia de frio | A |
| 4 | `cpcon-uepb-enfermagem-imunizacao-1779563996663-7` | Cadeia de frio | `imunizacao_cadeia_frio` | Técnica multidose — frasco | A |
| 5 | `avancasp-enfermagem-imunizacao-1779564129617-0` | EXCETO | `imunizacao_exceto` | Tipos — atenuadas exceto | D |
| 6 | `cogeps-unioeste-enfermagem-imunizacao-1779564119665-6` | EXCETO* | `imunizacao_calendario` | Sarampo — esquema + saúde | D |
| 7 | `cpcon-uepb-enfermagem-imunizacao-1779564035545-6` | V/F intervalos* | `imunizacao_cadeia_frio` | Sustentabilidade PNI I/II/III | B |
| 8 | `cebraspe-cespe-enfermagem-imunizacao-1777103230085-8` | Certo ou errado | `imunizacao_calendario` | Definição de imunidade | A (Certo) |

\*Cluster do relatório; ramo reconciliado via `catalog:patch-pedagogical-branch --reconcile-branch`.

## Validação (2026-07-03)

- `audit:questao-readiness --strict-v2-pedagogy` → 8/8 [READY]
- `validate:goldens --strict` → 8/8
- `audit:slug-alignment --strict` → 8/8
- `audit:numeric-factcheck` → 8/8

**Pendente:** `catalog:apply-lote --apply` (somente se solicitado).

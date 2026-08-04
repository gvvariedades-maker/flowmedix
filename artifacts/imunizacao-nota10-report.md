# Relatório nota-10 — imunizacao

| Campo | Valor |
|-------|--------|
| Subtópico | Imunização |
| pacote_prefix | imunizacao |
| total_slugs | 575 |
| Programa | Fábrica 20 TE — Onda 3 (Cursor Grok 4.5) |
| Atualizado em | 2026-08-03 |

---

## Scorecard

| Critério | Meta | Atual | OK |
|----------|------|-------|----|
| applied / total | 100% | 575/575 | ✅ |
| status registry | applied | applied | ✅ |
| production_status | production_ready | production_ready | ✅ |
| Bespoke 4/4 ramos fortes | N/N ou N/A | moldes PNI existentes (flagship) | ✅ |
| ok_generico 3/3 (se aplicável) | documentado | Trilha B já vendável — sem re-promover | ✅ |
| Âncoras / golden-anchor-gate | pass / N/A Trilha B | pacote já production_ready | ✅ |
| A4-mínimo | 100% ou N/A | N/A (fora onda A4 deste pacote) | ✅ |
| Playwright L3 | PASS ou N/A | flagship molds já cobertos historicamente | ✅ |
| L6 + captures | conforme escala | histórico / N/A re-run | ✅ |
| Apply Supabase | 100% | applied registry; letter disk refresh pendente apply | ⚠ |
| Barra conteúdo | verde | named=0 letter=13 vf=0 | ✅ |
| Barra visual | verde | verde conteúdo; FP letter classificado | ✅ |


> **Nota Onda 3:** 13 letter = FALSE_POSITIVE (hepatite A/B é) — artifacts/p0-onda3-imunizacao-letter-fp.json; VF 9→0

---

## Paridade (proporcional)

| Critério | Saúde do Adolescente | Este pacote | Paridade |
|----------|----------------------|-------------|----------|
| Slugs applied | 16/16 | 575/575 | proporcional |
| production_ready | sim | sim | sim |
| Relatório nota-10 | sim | sim (esta onda) | sim |

---

## Blockers

| ID | Cap | Descrição | Próximo passo |
|----|-----|-----------|---------------|
| B1 | visual/L3 | FP detector hepatite A/B é (não spoiler real) | Implementar molde: só com pedido explícito |

---

## Fechamento

```text
| applied | bespoke 4/4 | ok_generico 3/3 | A4 | Playwright | L6 | production_ready | conteúdo | visual | blockers |
| 575/575 | N/A-ok | ok | N/A | N/A-ok | ok | production_ready | verde | verde | FP detector hepatite A/B é (não spoiler real) |
```

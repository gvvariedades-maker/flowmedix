# Doenças Respiratórias Crônicas — onda nota-10 A4 + paridade Adolescente (2026-07-14)

## Resultado

| Gate | Status |
|------|--------|
| applied / production_ready | **9/9** · vendável |
| `pedagogical_branch` | **9/9** (5 ramos L2.5 no catálogo) |
| A4-mínimo | **9/9** (6 agente + **3 humano** `handcraft-qc`) |
| Apply Supabase | `respiratorio-cronico-completo` — **9/9 aplicado** |
| L6 checklist | g01 **pass** + captures PNG (âncora objetiva) |
| L3 visual | **12/12** Playwright PASS · 5 ramos · `summary.json` |
| Health / audit | **PASS** L1–L6 |

## A4 humano (3 — amostra ~33%)

| Slug | Ramo | Motivo |
|------|------|--------|
| `instituto-access-…7734-8` | `respiratorio_dpoc_oxigenio` | Venturi + SpO₂ 89% / meta 90–93% |
| `fcpc-…2717-4` | `respiratorio_dpoc_oxigenio` | SpO₂ alvo / emergência DPOC |
| `objetiva-…9311-1` | `respiratorio_vf_asma_dpoc` | Âncora L6 VF semiologia (BARROS) |

## L3 ramos (distribuição no catálogo)

| Ramo | Slugs |
|------|-------|
| `respiratorio_dpoc_oxigenio` | 5 |
| `respiratorio_tecnica_inalador` | 1 |
| `respiratorio_vf_asma_dpoc` | 1 |
| `respiratorio_asma_crise` | 1 |
| `respiratorio_generico` | 1 |

Briefs: [`l3-brief-respiratorio-cronico-INDEX.md`](l3-brief-respiratorio-cronico-INDEX.md)

## Paridade com Saúde do Adolescente

| Dimensão | Respiratório |
|----------|--------------|
| `pedagogicalBranch.ts` + inferência | sim (APS genérico, asma pediátrica/sibilos) |
| Briefs L3 INDEX 5/5 | sim |
| Todos os ramos com slug real | sim (5/5) |
| Playwright 5 ramos + summary | sim (12/12) |
| A4 humano ~20%+ | sim (3/9) |
| L6 captures + anchor pass | sim |
| Apply onda completa | sim (9/9) |
| Moldes React bespoke | sim (VF + DPOC/O₂) |

## Inferência L2.5 (desta onda)

- `igecap` → `respiratorio_generico` (asma na APS, educação terapêutica)
- `lj-assessoria` → `respiratorio_asma_crise` (asma pediátrica + sibilos)
- Apply com `--no-reconcile-branch` quando ramo declarado ≠ heurística legada

## Comandos de referência

```bash
npm run enrich:respiratorio-guideline-meta -- --lote=respiratorio-cronico-completo --write
npm run stamp:a4-minimo -- --lote=respiratorio-cronico-completo
npx playwright test e2e/visual-mold-regression.spec.ts --project=chromium --grep "Respiratório"
npm run audit:anchor-review -- --lote=respiratorio-cronico-g01 --record-pass --reviewer=agent
npm run audit:subtopico-quality -- --subtopico="Doenças Respiratórias Crônicas (Asma, DPOC)"
npm run catalog:apply-lote -- --lote=respiratorio-cronico-completo --apply --no-reconcile-branch
```

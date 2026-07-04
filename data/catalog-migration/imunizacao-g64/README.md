# imunizacao-g64 — handcraft golden-v1

**Status:** `handcraft_ready` · **8/8 [READY]** · pendente `catalog:apply-lote`

## Mix P1 (pós-calendário g42)

| # | Cluster | Slug |
|---|---------|------|
| 1–2 | Cadeia de frio | Facet multidose · Fau Rede de Frio |
| 3–4 | Genérico | Fau influenza tetravalente · Fau SCR viral |
| 5–6 | EXCETO | Fumarc SCR gestação · IBFC adiar VV |
| 7 | V/F intervalos | MS Sarmento I–V calendário |
| 8 | Certo ou errado | Cebraspe BCG faixa etária |

## Validação (2026-07-03)

```bash
npm run audit:questao-readiness -- --lote=imunizacao-g64 --strict-v2-pedagogy
npm run validate:goldens -- --strict --lote=imunizacao-g64
npm run audit:slug-alignment -- --lote=imunizacao-g64 --strict
npm run audit:numeric-factcheck -- --lote=imunizacao-g64
```

**Não executar:** `ai:generate` · `catalog:upgrade-premium` · `catalog:apply-lote --apply` (sem pedido explícito).

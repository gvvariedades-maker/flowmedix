# imunizacao-g73 — handcraft golden-v1

**Status:** `handcraft_ready` · **8/8 [READY]** · pendente `catalog:apply-lote`

## Mix P1 (pós-calendário g42)

| # | Cluster | Slug |
|---|---------|------|
| 1 | Cadeia de frio | Igeduc V/F PNI I–IV |
| 2 | Cadeia de frio | Igeduc V/F sequência V,V,F,V |
| 3 | Cadeia de frio | Igeduc desvio térmico +10 °C |
| 4 | Cadeia de frio | VUNESP caixa térmica bloqueio sarampo |
| 5 | EXCETO | Unifil Rede de Frios |
| 6 | EXCETO | Unifil volumes de vacinação |
| 7 | Eventos adversos | Fafipa EAPV |
| 8 | Certo ou errado | IDECAN FA contraindicada gestante |

## Validação (2026-07-03)

```bash
npm run audit:questao-readiness -- --lote=imunizacao-g73 --strict-v2-pedagogy
npm run validate:goldens -- --strict --lote=imunizacao-g73
npm run audit:slug-alignment -- --lote=imunizacao-g73 --strict
npm run audit:numeric-factcheck -- --lote=imunizacao-g73
```

**Não executar:** `ai:generate` · `catalog:upgrade-premium` · `catalog:apply-lote --apply` (sem pedido explícito).

# imunizacao-g75 — handcraft golden-v1

**Status:** `handcraft_ready` · **8/8 [READY]** · **8** arquivos em `questions/` · pendente `catalog:apply-lote`

## Mix P1 (pós-calendário g42)

Pool V/F intervalos esgotado no cluster report — mix efetivo: **4 cadeia frio + 2 EXCETO + 2 certo/errado**.

| Slug | Banca | Tema | Gabarito |
|------|-------|------|----------|
| `igeduc-enfermagem-imunizacao-1779563986606-8` | Igeduc | Evento temperatura acima de 8 °C | A |
| `instituto-consulplan-enfermagem-imunizacao-1779564085730-1` | Consulplan | Refrigeração — frigobar proibido | B |
| `legalle-enfermagem-imunizacao-1779572166628-2` | Legalle | Rede de serviços I–IV | E |
| `sc-treinamentos-enfermagem-imunizacao-1779564071106-2` | Sc Treinamentos | Componentes rede de frios | B |
| `unifil-enfermagem-imunizacao-1779564031957-2` | Unifil | EXCETO calendário idoso | A |
| `unifil-enfermagem-imunizacao-1779572220683-3` | Unifil | EXCETO EA pentavalente | D |
| `idecan-enfermagem-imunizacao-1778712281975-7` | IDECAN | C/E Hep B ao nascer | A |
| `igeduc-enfermagem-imunizacao-1779564048247-0` | Igeduc | C/E HPV × tríplice viral | B |

## Validação (2026-07-03)

```bash
npm run audit:questao-readiness -- --lote=imunizacao-g75 --strict-v2-pedagogy
npm run validate:goldens -- --strict --lote=imunizacao-g75
npm run audit:slug-alignment -- --lote=imunizacao-g75 --strict
npm run audit:numeric-factcheck -- --lote=imunizacao-g75
```

**Não executar:** `ai:generate` · `catalog:upgrade-premium` · `catalog:apply-lote --apply` (sem pedido explícito).

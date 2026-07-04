# imunizacao-g72 — handcraft golden-v1

**Status:** `handcraft_ready` · **8/8 [READY]** · pendente `catalog:apply-lote`

## Mix P1 (pós-calendário g42)

| Slug | Banca | Tema | Gabarito |
|------|-------|------|----------|
| `unifil-enfermagem-imunizacao-1779572220683-1` | Unifil | Rede de Frio — estrutura câmaras ± | C |
| `unifil-enfermagem-imunizacao-1779572220683-2` | Unifil | EAPV — adiar febre grave | A |
| `unifil-enfermagem-imunizacao-1779572220683-9` | Unifil | Transmissão de calor 3-1-2 | E |
| `unifil-enfermagem-imunizacao-1779572227744-2` | Unifil | Hep B limite 30 dias | B |
| `ms-sarmento-enfermagem-processo-de-enfermagem-1780008219236-5` | MS Sarmento | INCORRETA via IM dorsoglúteo | C |
| `reis-e-reis-enfermagem-imunizacao-1777103182944-2` | Reis E Reis | EXCETO calendário 2024 tetra viral | C |
| `igeduc-enfermagem-imunizacao-1779564040128-4` | Igeduc | C/E organização geladeira | B |
| `igeduc-enfermagem-imunizacao-1779564040128-5` | Igeduc | C/E VIP sítio aplicação | B |

## Validação (2026-07-03)

```bash
npm run audit:questao-readiness -- --lote=imunizacao-g72 --strict-v2-pedagogy
npm run validate:goldens -- --strict --lote=imunizacao-g72
npm run audit:slug-alignment -- --lote=imunizacao-g72 --strict
npm run audit:numeric-factcheck -- --lote=imunizacao-g72
```

**Não executar:** `ai:generate` · `catalog:upgrade-premium` · `catalog:apply-lote --apply` (sem pedido explícito).

/**
 * Protocolo A4-mínimo — História da Enfermagem (Onda 1)
 *
 * Baixo risco clínico: Nightingale, COFEN/COREN, SUS cronologia, pioneiras, leis.
 *
 * Código: [`lib/catalogMigration/historiaA4Minimo.ts`](../lib/catalogMigration/historiaA4Minimo.ts)  
 * Guideline: [`lib/guidelines/historiaEnfermagem.ts`](../lib/guidelines/historiaEnfermagem.ts)  
 * Modelo: [`PROTOCOLO_A4_MINIMO.md`](PROTOCOLO_A4_MINIMO.md)
 */

---

## Decisão

1. Claims sensíveis (anos, %, Nightingale, COFEN, SUS, leis) → whitelist.
2. Fonte tier A com `covers` (ex.: `historia-enfermagem-cofen`).
3. Agente: `agent:historia-a4-minimo-v1`.
4. Amostra humana 20% dos `medio`.

## Eixos

| Eixo | Exemplos |
|------|----------|
| nightingale | Fundadora, Crimeia, 12 de maio |
| etica | Código COFEN × COREN |
| brasil | Pré-SUS, pioneiras, escolas |
| legislacao | Lei 7.498/86, Decreto 94.406/87 |
| teorias | Peplau |

## CLI

```bash
npm run stamp:a4-minimo -- --lote=historia-enfermagem-completo
npm run enrich:historia-guideline-meta -- --lote=historia-enfermagem-completo --write
npm run audit:questao-readiness -- --file=examples/questao-premium-cpcon-historia-enfermagem-nightingale.json --strict-v2-pedagogy
```

## Expandir whitelist

1. Entry em `HISTORIA_ENFERMAGEM_COFEN`
2. Claim em `HISTORIA_CLAIM_WHITELIST`
3. Teste Jest
4. Revisão humana do claim novo

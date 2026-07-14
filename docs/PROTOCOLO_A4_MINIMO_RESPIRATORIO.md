/**
 * Protocolo A4-mínimo — Doenças Respiratórias Crônicas (Onda nota-10)
 *
 * Risco clínico médio: SpO₂ alvo, O₂ titulado, dispositivos, crise asmática.
 *
 * Código: [`lib/catalogMigration/respiratorioA4Minimo.ts`](../lib/catalogMigration/respiratorioA4Minimo.ts)  
 * Guideline: [`lib/guidelines/respiratorioCronico.ts`](../lib/guidelines/respiratorioCronico.ts)  
 * Modelo: [`PROTOCOLO_A4_MINIMO.md`](PROTOCOLO_A4_MINIMO.md)
 */

---

## Decisão

1. Claims sensíveis (SpO₂ %, FiO₂, alvo 88–92, Venturi, crise) → whitelist.
2. Fonte tier A com `covers` (`respiratorio-cronico-ms` ou PCDT MS).
3. Agente: `agent:respiratorio-a4-minimo-v1`.
4. Amostra humana 20% dos `medio`/`baixo` com O₂ ou SpO₂ prescritos.

## Eixos

| Eixo | Exemplos |
|------|----------|
| spo2 | Alvo 88–92%, pegadinha 98–100% |
| oxigenio | O₂ titulado, Venturi, FiO₂ controlada |
| asma | Reversibilidade, peak flow |
| dpoc | Obstrução persistente, hipercapnia |
| crise | Broncodilatador de resgate |
| inalador | Espaçador, corticoide inalatório |

## CLI

```bash
npm run enrich:respiratorio-guideline-meta -- --lote=respiratorio-cronico-completo --write
npm run stamp:a4-minimo -- --lote=respiratorio-cronico-completo
npx playwright test e2e/visual-mold-regression.spec.ts --project=chromium --grep "Respiratório"
npm run audit:subtopico-quality -- --subtopico="Doenças Respiratórias Crônicas (Asma, DPOC)"
```

## Expandir whitelist

1. Entry em `RESPIRATORIO_CRONICO_MS`
2. Claim em `RESPIRATORIO_CLAIM_WHITELIST`
3. Teste Jest em `respiratorioA4Minimo.test.ts`
4. Revisão humana do claim novo

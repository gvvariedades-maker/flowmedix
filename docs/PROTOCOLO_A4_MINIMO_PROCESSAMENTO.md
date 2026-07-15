# Protocolo A4-mínimo — Processamento de Artigos e Produtos de Saúde (Onda nota-10)

Código: [`lib/catalogMigration/processamentoA4Minimo.ts`](../lib/catalogMigration/processamentoA4Minimo.ts)  
Guideline: [`lib/guidelines/cme.ts`](../lib/guidelines/cme.ts)  
Modelo: [`PROTOCOLO_A4_MINIMO.md`](PROTOCOLO_A4_MINIMO.md)

## Decisão

1. Claims sensíveis (Spaulding, 121 °C/15 min, 30 dias, indicadores, fluxo áreas) → whitelist.
2. Fonte tier A `cme-anvisa-rdc15` com `covers`.
3. Agente: `agent:processamento-a4-minimo-v1`.
4. Amostra humana 20% dos `medio` (`handcraft-qc`).

## CLI

```bash
npm run stamp:a4-minimo -- --lote=processamento-completo --dry-run
npm run stamp:a4-minimo -- --lote=processamento-completo
npm run enrich:processamento-guideline-meta -- --lote=processamento-completo --write
```

## Humano sempre

- Parâmetro autoclave/validade fora da whitelist
- Divergência real `exam_vs_current`
- EXCETO com conduta numérica não coberta por RDC 15 / Spaulding

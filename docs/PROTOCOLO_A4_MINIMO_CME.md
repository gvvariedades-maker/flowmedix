# Protocolo A4-mínimo — Enfermagem em Central de Material e Esterilização (CME)

Código: [`lib/catalogMigration/cmeA4Minimo.ts`](../lib/catalogMigration/cmeA4Minimo.ts)  
Guideline: [`lib/guidelines/cme.ts`](../lib/guidelines/cme.ts)  
Modelo: [`PROTOCOLO_A4_MINIMO.md`](PROTOCOLO_A4_MINIMO.md)

## Decisão

1. Claims sensíveis (Spaulding, 121 °C/15 min, 30 dias, indicadores, fluxo áreas) → whitelist.
2. Fonte tier A `cme-anvisa-rdc15` com `covers`.
3. Agente: `agent:cme-a4-minimo-v1`.
4. Amostra humana 20% dos `medio` (`handcraft-qc`) — sem quota artificial no total do pacote.

## CLI

```bash
npm run stamp:a4-minimo -- --lote=cme-completo --dry-run
npm run stamp:a4-minimo -- --lote=cme-completo
npm run enrich:cme-guideline-meta -- --lote=cme-completo --write
```

## Humano sempre

- `family=calc` → 100%
- `exam_vs_current ≠ none` → 100%
- Parâmetro autoclave/validade fora da whitelist
- EXCETO com conduta numérica não coberta por RDC 15 / Spaulding
- Amostra hash ~20% do tier `medio`

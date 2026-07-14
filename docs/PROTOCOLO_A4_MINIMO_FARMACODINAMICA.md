# Protocolo A4-mínimo — Farmacodinâmica e Farmacocinética (Onda nota-10)

Código: [`lib/catalogMigration/farmacoA4Minimo.ts`](../lib/catalogMigration/farmacoA4Minimo.ts)  
Guideline: [`lib/guidelines/farmacodinamica.ts`](../lib/guidelines/farmacodinamica.ts)  
Modelo: [`PROTOCOLO_A4_MINIMO.md`](PROTOCOLO_A4_MINIMO.md)

## Decisão

1. Claims sensíveis (ADME, meia-vida, metabólitos ativos, infusão EV, interações BZD+opioide) → whitelist.
2. Fonte tier A `farmaco-adme-anvisa` com `covers`.
3. Agente: `agent:farmaco-a4-minimo-v1`.
4. Amostra humana 20% dos `medio`.

## CLI

```bash
npm run stamp:a4-minimo -- --lote=farmacodinamica-e-farmacocinetica-completo --dry-run
npm run stamp:a4-minimo -- --lote=farmacodinamica-e-farmacocinetica-completo
npm run enrich:farmacodinamica-guideline-meta -- --lote=farmacodinamica-e-farmacocinetica-completo --write
```

## Humano sempre

- `family=calc` com dose numérica nova sem entry
- Claim fora da whitelist (dose/intervalo inventado)
- Divergência real `exam_vs_current`
- Infusão EV com conduta numérica não coberta pela bula

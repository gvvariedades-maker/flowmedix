# Protocolo A4-mínimo — Cálculo de Administração de Medicamentos e Infusões

Código: [`lib/catalogMigration/calculoA4Minimo.ts`](../lib/catalogMigration/calculoA4Minimo.ts)  
Guideline: [`lib/guidelines/calculoMedicamentos.ts`](../lib/guidelines/calculoMedicamentos.ts)  
Modelo: [`PROTOCOLO_A4_MINIMO.md`](PROTOCOLO_A4_MINIMO.md)

## Decisão

1. Claims numéricos (20/60/3, U-100, fator gts/min, regra de três) → whitelist tier A.
2. Fonte: `calc-equivalencias-br` + COFEN.
3. Agente: `agent:calculo-a4-minimo-v1`.
4. Amostra humana: **100% calc** + divergência + ~20% **medio** (não 20% do pacote inteiro).

## CLI

```bash
npm run stamp:a4-minimo -- --lote=calculo-de-administracao-de-medicamentos-e-infusoes-g01 --dry-run
npm run enrich:calculo-guideline-meta -- --lote=calculo-de-administracao-de-medicamentos-e-infusoes-g01 --write
```

## Humano sempre

- `family=calc` com resultado numérico novo sem entry na whitelist
- Divergência real `exam_vs_current`
- Infusão ml/h ou gts/min com arredondamento ambíguo

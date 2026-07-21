/**
 * Protocolo A4-mínimo — Curativos e Manejo de Feridas (onda paridade Adolescente)
 *
 * Risco clínico médio: LPP/NPUAP, Braden, exsudato, coberturas, desbridamento.
 *
 * Código: [`lib/catalogMigration/curativosA4Minimo.ts`](../lib/catalogMigration/curativosA4Minimo.ts)  
 * Guideline: [`lib/guidelines/curativos.ts`](../lib/guidelines/curativos.ts)  
 * Modelo: [`PROTOCOLO_A4_MINIMO.md`](PROTOCOLO_A4_MINIMO.md)
 */

---

## Decisão

1. Claims sensíveis (LPP estágios, Braden %, exsudato×cobertura, desbridamento) → whitelist.
2. Fonte tier A com `covers` (`curativos-lpp-npuap`).
3. Agente: `agent:curativos-a4-minimo-v1`.
4. `family=calc` → **100% humano**.
5. Amostra humana ~20% dos `medio` com Braden ou exsudato prescritos.

## Eixos

| Eixo | Exemplos |
|------|----------|
| lpp_prevencao | Pele seca, pH, calcanhar livre, DAU |
| lpp_estagio | Estágios I–IV NPUAP |
| braden | ≤18 risco, ≤12 alto risco |
| cobertura | Hidrogel, alginato, espuma, prata, TPN |
| exsudato | Baixo/moderado/alto × cobertura |
| desbridamento | Autolítico, enzimático, instrumental |
| leito | Granulação, necrose, cicatrização |
| infeccao | Biofilme, sinais de infecção |
| tecnica | SF 0,9%, pós-op, estomia, bandagem |
| pegadinha | Massagem em proeminências, úmido vs seco |

## CLI

```bash
npm run stamp:a4-minimo -- --lote=curativos-e-manejo-de-feridas-g01 --dry-run
npm run stamp:a4-minimo -- --lote=curativos-e-manejo-de-feridas-g01
# Repetir g02…g12
npx playwright test e2e/visual-mold-regression.spec.ts --project=chromium --grep "Curativos"
npm run audit:subtopico-quality -- --subtopico="Curativos e Manejo de Feridas" --promote
```

## Humano sempre

- `family=calc`
- Claim fora da whitelist (ex.: dose de enzima sem entry)
- Divergência real `exam_vs_current`
- Danger zone fina (&lt;3 itens) ou fluxo fraco

## Expandir whitelist

1. Entry em `CURATIVOS_LPP_NPUAP` (`lib/guidelines/curativos.ts`).
2. Claim em `CURATIVOS_CLAIM_WHITELIST`.
3. Teste Jest em `curativosA4Minimo.test.ts`.
4. Revisão humana do claim novo.

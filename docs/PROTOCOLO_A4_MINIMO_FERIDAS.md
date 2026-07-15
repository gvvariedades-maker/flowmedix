/**
 * Protocolo A4-mínimo — Feridas e Queimaduras (onda paridade Adolescente)
 *
 * Risco clínico médio: SCQ %, graus, atendimento inicial, classificação microbiana.
 *
 * Código: [`lib/catalogMigration/feridasA4Minimo.ts`](../lib/catalogMigration/feridasA4Minimo.ts)  
 * Guideline: [`lib/guidelines/feridasQueimaduras.ts`](../lib/guidelines/feridasQueimaduras.ts)
 */

---

## Decisão

1. Claims sensíveis (SCQ %, graus, 6h contaminada, água corrente) → whitelist.
2. Fonte tier A MS (`feridas-queimaduras-ms`).
3. Agente: `agent:feridas-a4-minimo-v1`.
4. `family=calc` → **100% humano** (`handcraft-qc`).
5. Amostra humana ~20% dos `medio` com SCQ/grau.

## CLI

```bash
npx tsx scripts/patch-feridas-paridade-onda.ts
npm run stamp:a4-minimo -- --lote=feridas-e-queimaduras-completo
npx playwright test e2e/visual-mold-regression.spec.ts --project=chromium --grep "Feridas"
npm run audit:subtopico-quality -- --subtopico="Feridas e Queimaduras" --promote
```

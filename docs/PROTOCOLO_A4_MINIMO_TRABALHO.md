# Protocolo A4-mínimo — Enfermagem do Trabalho

Onda paridade Adolescente · pacote `enfermagem-do-trabalho` (33 slugs).

## Registry

- Config: [`lib/catalogMigration/trabalhoA4Minimo.ts`](../lib/catalogMigration/trabalhoA4Minimo.ts)
- Guideline: [`lib/guidelines/enfermagemTrabalho.ts`](../lib/guidelines/enfermagemTrabalho.ts)
- Agent: `agent:trabalho-a4-minimo-v1`

## Política humana (paridade Adolescente)

- `family=calc` → 100% handcraft-qc
- `exam_vs_current ≠ none` → 100%
- `!agentA4Eligible` ou tier `alto` → humano
- Amostra hash ~20% do tier `medio`
- **Proibido** quota artificial 20% do total do pacote

## Comandos

```bash
npm run stamp:a4-minimo -- --subtopico="Enfermagem do Trabalho" --write
npm run stamp:a4-minimo -- --subtopico="Enfermagem do Trabalho" --report
```

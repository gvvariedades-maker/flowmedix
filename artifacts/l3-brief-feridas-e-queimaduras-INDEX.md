# Feridas e Queimaduras — índice de briefs L3 (8 ramos)

**Subtópico:** Feridas e Queimaduras · **8 slugs** · onda paridade Adolescente (2026-07-14)

| Ramo | Slugs | Pacote L3 | Metáfora ↔ erro pedagógico | Implementação |
|------|-------|-----------|----------------------------|---------------|
| `feridas_grau_profundidade` | 1 | burn-depth-layer-deck + reference_table | Camadas da pele × confundir dor com gravidade | **React bespoke** |
| `feridas_scq_calculo` | 1 | burn-rule-nine-board + vertical | Mapa corporal × somar segmentos errado | **React bespoke** |
| `feridas_scq_regra9` | 1 | burn-rule-nine-board + vertical | Decore % × trocar tronco/membro | **React bespoke** |
| `feridas_grande_queimado` | 1 | burn-rule-nine-board + compare | Critério extensão × só profundidade | **React bespoke** |
| `feridas_atendimento_inicial` | 1 | morphological + burn-triage-tap-flow | Primeiros socorros × gelo/bolha rompida | **React bespoke** (logic_flow) |
| `feridas_classificacao` | 1 | morphological + reference_table | Tempo 6h × infectada | genérico premium |
| `feridas_cicatrizacao` | 1 | morphological + reference_table | Fases × ordem invertida | genérico premium |
| `feridas_curativo_tipo` | 1 | morphological + reference_table | Bioativo × oclusivo | genérico premium |

**8/8 slugs** com `pedagogical_branch` declarado.

## Código e testes

| Área | Arquivo |
|------|---------|
| Ramos + design map | `lib/slides/pedagogicalBranch.ts` |
| Moldes burn-* | `components/slides/variants/BurnDepthLayerDeckConceptMap.tsx`, `GoldenRuleBurnRuleNineBoard.tsx` |
| A4-mínimo | `lib/catalogMigration/feridasA4Minimo.ts` |
| Regressão visual | `e2e/visual-mold-regression.spec.ts` · `artifacts/visual-mold-regression/summary.json` |
| Relatório paridade | `artifacts/feridas-e-queimaduras-nota10-report.md` |

## Erros pedagógicos por ramo (resumo)

- **grau:** forçar 2º grau pela extensão; achar que 3º grau sempre dói
- **scq_calculo:** esquecer MSD 9% ou duplicar segmento
- **scq_regra9:** confundir tronco anterior/posterior
- **grande_queimado:** critério só por profundidade sem SCQ
- **atendimento:** gelo, romper bolha, untar pomada na emergência
- **classificacao:** contaminada = infectada; < 6h = contaminada
- **cicatrizacao:** trocar proliferativa com maturação
- **curativo_tipo:** confundir bioativo com curativo oclusivo passivo

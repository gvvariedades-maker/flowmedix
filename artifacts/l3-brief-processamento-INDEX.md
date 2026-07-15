# Processamento de Artigos e Produtos de Saúde — índice de briefs L3 (5 ramos)

**Subtópico:** Processamento de Artigos e Produtos de Saúde · **18 slugs** · onda nota-10 (2026-07-14)

Política: ramos CME compartilham pacote semântico premium (`morphological`, `reference_table`, `tap`, `compare`); VF e autoclave usam `reference_table` / `compare` reforçados.

| Ramo | Slugs | Pacote L3 | Brief | Implementação |
|------|-------|-----------|-------|---------------|
| `cme_processamento_conceito` | 4 | genérico premium | [conceito](l3-brief-processamento-cme_processamento_conceito.md) | genérico |
| `cme_preparo_limpeza` | 2 | genérico premium | [preparo](l3-brief-processamento-cme_preparo_limpeza.md) | genérico |
| `cme_autoclave_metodos` | 1 | reference_table | [autoclave](l3-brief-processamento-cme_autoclave_metodos.md) | genérico |
| `cme_vf_ce` | 10 | reference_table + compare | [vf_ce](l3-brief-processamento-cme_vf_ce.md) | genérico |
| `cme_generico` | 1 | genérico premium | [generico](l3-brief-processamento-cme_generico.md) | genérico |

## Metáfora ↔ erro pedagógico (síntese)

| Ramo | Metáfora visual | Erro pedagógico |
|------|-----------------|-----------------|
| `cme_processamento_conceito` | Cadeia suja→limp→estéril | Inverter criticidade Spaulding ou finalidade do estéril |
| `cme_preparo_limpeza` | Funil limpeza→embalagem | Confundir limpeza com esterilização; OPA × glutaraldeído |
| `cme_autoclave_metodos` | Painel 121 °C / 15 min | Trocar parâmetro de ciclo ou método de baixa temperatura |
| `cme_vf_ce` | Tabela assertivas I–III | Certo/errado sem julgar item a item |
| `cme_generico` | Pilares CME | Texto genérico sem ancoragem no enunciado |

## Código e testes

| Área | Arquivo |
|------|---------|
| Ramos + design map | `lib/slides/pedagogicalBranch.ts` |
| Cluster | `artifacts/processamento-topic-cluster-report.json` |
| Regressão visual | `e2e/visual-mold-regression.spec.ts` · `artifacts/visual-mold-regression/summary-processamento.json` |
| A4-mínimo | `lib/catalogMigration/processamentoA4Minimo.ts` |
| Relatório nota-10 | `artifacts/processamento-nota10-report.md` |

## Trigger

```text
Mapeamento L3: Processamento de Artigos e Produtos de Saúde
Pipeline completo: Processamento de Artigos e Produtos de Saúde
```

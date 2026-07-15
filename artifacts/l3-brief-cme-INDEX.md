# Enfermagem em Central de Material e Esterilização (CME) — índice de briefs L3 (5 ramos)

**Subtópico:** Enfermagem em Central de Material e Esterilização (CME) · **35 slugs** · onda nota-10 paridade Adolescente (2026-07-14)

Política: ramos CME compartilham pacote semântico premium (`morphological`, `reference_table`, `tap`, `compare`); VF e autoclave usam `reference_table` / `compare` reforçados.

| Ramo | Slugs | Pacote L3 | Brief | Implementação |
|------|-------|-----------|-------|---------------|
| `cme_autoclave_metodos` | 14 | reference_table | [autoclave](l3-brief-cme-cme_autoclave_metodos.md) | genérico |
| `cme_generico` | 8 | genérico premium | [generico](l3-brief-cme-cme_generico.md) | genérico |
| `cme_vf_ce` | 8 | reference_table + compare | [vf_ce](l3-brief-cme-cme_vf_ce.md) | genérico |
| `cme_preparo_limpeza` | 4 | genérico premium | [preparo](l3-brief-cme-cme_preparo_limpeza.md) | genérico |
| `cme_processamento_conceito` | 1 | genérico premium | [conceito](l3-brief-cme-cme_processamento_conceito.md) | genérico |

## Metáfora ↔ erro pedagógico (síntese)

| Ramo | Metáfora visual | Erro pedagógico |
|------|-----------------|-----------------|
| `cme_autoclave_metodos` | Painel 121 °C / 15 min | Trocar parâmetro de ciclo ou método de baixa temperatura |
| `cme_generico` | Pilares CME | Texto genérico sem ancoragem no enunciado |
| `cme_vf_ce` | Tabela assertivas I–III | Certo/errado sem julgar item a item |
| `cme_preparo_limpeza` | Funil limpeza→embalagem | Confundir limpeza com esterilização; OPA × glutaraldeído |
| `cme_processamento_conceito` | Cadeia suja→limp→estéril | Inverter criticidade Spaulding ou finalidade do estéril |

## Código e testes

| Área | Arquivo |
|------|---------|
| Ramos + design map | `lib/slides/pedagogicalBranch.ts` |
| Cluster | `artifacts/cme-topic-cluster-report.json` |
| Regressão visual | `e2e/visual-mold-regression.spec.ts` · `artifacts/visual-mold-regression/summary-cme.json` |
| A4-mínimo | `lib/catalogMigration/cmeA4Minimo.ts` |
| Relatório nota-10 | `artifacts/cme-nota10-report.md` |

## Trigger

```text
Mapeamento L3: Enfermagem em Central de Material e Esterilização (CME)
Pipeline + paridade Adolescente: Enfermagem em Central de Material e Esterilização (CME)
```

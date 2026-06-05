# Auditoria de conteúdo — Laboratório (Fase 8)

Relatório de qualidade do catálogo (`modulos_estudo`) para estudo reverso premium.

## Onde usar

1. **UI:** `/admin/laboratorio` → painel **Auditoria do catálogo (slides / Zod)** → *Atualizar auditoria*.
2. **API:** `GET /api/admin/laboratorio/catalog-audit` (admin autenticado).

### Parâmetros da API

| Query | Padrão | Descrição |
|-------|--------|-----------|
| `sampleSize` | `20` | Slugs amostrados para validação Zod + layouts premium |
| `issueLimit` | `200` | Máximo de linhas com problema no relatório |
| `maxRows` | `0` | `0` = catálogo inteiro; `>0` = varredura parcial (testes) |

## O que é verificado

| Código | Significado |
|--------|-------------|
| `missing_slides` | Sem `reverse_study_slides` / `study_slides` |
| `slide_count_not_four` | Array de slides com tamanho ≠ 4 |
| `missing_premium_type` | Falta algum dos 4 tipos: `concept_map`, `golden_rule`, `logic_flow`, `danger_zone` |
| `zod_invalid` | Falha em `QuestaoCompletaSchema` (após normalização de slides) |
| `tecconcursos_reference` | Referência bloqueada ao TecConcursos |

**Amostra (20 slugs):** validação completa + indicadores de layout premium:

- `logic_flow` com `reveal_mode: "tap"`
- `danger_zone` com `items[].correct` (layout compare)
- `golden_rule` com `rows[]` (reference_table)

## Implementação

- Lógica: [`lib/admin/catalogContentAudit.ts`](../lib/admin/catalogContentAudit.ts)
- Agregado RPC (rápido): `avant_scale_health_metrics()` → `reverse_slides.not_four_slides` ([`SCALE_HEALTH.md`](SCALE_HEALTH.md))

## Referências

- Formato JSON: [`AGENT_AVANT_TEMPLATES_E_LAYOUT.md`](AGENT_AVANT_TEMPLATES_E_LAYOUT.md)
- Validação: [`VALIDACAO_ZOD.md`](VALIDACAO_ZOD.md)

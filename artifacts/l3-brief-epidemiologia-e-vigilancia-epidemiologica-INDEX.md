# L3 Brief INDEX — Epidemiologia e Vigilância Epidemiológica

**Gerado:** 2026-08-01  
**Pacote:** `epidemiologia-e-vigilancia-epidemiologica`  
**Total slugs:** 218 · **Limiar ramo forte:** 22 (`max(5, ceil(10%))`)  
**Cluster:** `artifacts/epidemiologia-e-vigilancia-epidemiologica-topic-cluster-report.json`  
**Guideline:** `lib/guidelines/epidemiologia.ts`

## Decisão por ramo

| branch_id | count | % | Decisão L3 | Brief 4/4 | Próximo |
|-----------|------:|--:|------------|-----------|---------|
| `epi_notificacao_compulsoria` | 78 | 35.8 | **molde_inedito** | [brief](l3-brief-epidemiologia-e-vigilancia-epidemiologica-epi_notificacao_compulsoria.md) | `Implementar molde:` ou âncora + handcraft genérico premium enquanto React pendente |
| `epi_indicadores` | 36 | 16.5 | **molde_inedito** | [brief](l3-brief-epidemiologia-e-vigilancia-epidemiologica-epi_indicadores.md) | idem |
| `epi_vigilancia_acoes` | 26 | 11.9 | **molde_redesign** | [brief](l3-brief-epidemiologia-e-vigilancia-epidemiologica-epi_vigilancia_acoes.md) | layouts genéricos + metáfora dual VE×VS até React |
| `epi_ocorrencia_agravos` | 10 | 4.6 | ok_generico | — (cauda) | Handcraft genérico |
| `epi_cadeia_transmissao` | 8 | 3.7 | ok_generico | — | Handcraft genérico |
| `epi_generico` | 60 | 27.5 | ok_generico | — | Refinar cluster se volume “conceito geral” persistir |

**Drift detectado:** 13 slugs (AB/imunização/clínico) — `meta.subtopico` canônico OK (taxonomy mismatch=0); slug segment legado aceito.

## GATE Fase 0 / 3b

- [x] Export completo 218
- [x] Cluster report
- [x] Briefs 4/4 nos 3 ramos fortes
- [ ] `BRANCH_DESIGN_MAP` + `l3MoldGapCatalog` (Fase 4 — só se pedido)
- [x] Âncoras golden (`audit:golden-anchor-gate` warn/handcraft_allowed, covered=4) (`audit:golden-anchor-gate`) antes do g01
- [ ] Handcraft g01… (sem `--apply` até "pode aplicar")

## Comandos

```bash
npm run cluster:epidemiologia
npm run audit:l3-mold-gap -- --from-supabase --subtopico="Epidemiologia e Vigilância Epidemiológica"
npm run audit:golden-anchor-gate -- --subtopico="Epidemiologia e Vigilância Epidemiológica"
```

## Status onda1-epi (2026-08-03)

- [x] Taxonomia closed (registry + artifact)
- [x] BRANCH_DESIGN_MAP + inferEpiBranch (EPI_GENERIC_DESIGN lime)
- [x] 4 âncoras golden READY; gate warn / handcraft_allowed / goldens_needed=0
- [x] Briefs 4/4 ramos fortes (React só com `Implementar molde:`)
- [ ] Handcraft g01 (esta conversa)

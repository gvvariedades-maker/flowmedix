# Epi Onda 1 IDE — DNA + g01

**Subtópico:** Epidemiologia e Vigilância Epidemiológica  
**Data:** 2026-08-03 (Cursor Grok 4.5)

| Etapa | Status |
|-------|--------|
| Taxonomia | **closed** (mismatch=0, 218/218) |
| BRANCH_DESIGN_MAP | **wired** — `inferEpiBranch` + `EPI_GENERIC_DESIGN` lime |
| Âncoras | **4 READY** — gate warn / `handcraft_allowed` / `goldens_needed=0` |
| Moldes | Briefs 4/4 nos 3 ramos fortes; React **pendente** (`Implementar molde:`) |
| g01 | **8/8 READY** + preflight + dry-run `failed=0` — **sem apply** |

## Âncoras

- `examples/questao-premium-adm-epidemiologia-e-vigilancia-epidemiologica-notificacao-compulsoria-sinan-lista-naci.json`
- `examples/questao-premium-adm-epidemiologia-e-vigilancia-epidemiologica-indicadores-incidencia-prevalencia-morta.json`
- `examples/questao-premium-adm-epidemiologia-e-vigilancia-epidemiologica-vigilancia-epidemiologica-conceito-e-aco.json`
- `examples/questao-premium-adm-epidemiologia-e-vigilancia-epidemiologica-epidemiologia-conceito-geral.json`

## Registry

- `status=in_progress` · `handcraft_applied=0/218` · `taxonomy=closed` · `production_status=none`

## Próximo

1. Colar `pode aplicar` → `npm run catalog:apply-lote -- --lote=epidemiologia-e-vigilancia-epidemiologica-g01 --apply`
2. `Continuar programa: Epidemiologia e Vigilância Epidemiológica` → g02
3. (Opcional) `Implementar molde: epi_notificacao_compulsoria` / `epi_indicadores`

# Âncoras 100% — Verificação de Sinais Vitais

**Status:** completo **8/8**  
**Fechado em:** 2026-08-05  
**Pacote:** `sinais-vitais` · subtópico canônico **Verificação de Sinais Vitais**  
**Política:** A — conteúdo first; visual após fábrica / moldes compartilhados SV  

## Tabela final

| branch | path | READY | visual_bar | aprovado_humano | spoiler_livre |
|--------|------|-------|------------|-----------------|---------------|
| `vitals_pa_tecnica` | `data/catalog-migration/sinais-vitais-g01/questions/ameosc-enfermagem-verificacao-de-sinais-vitais-1778969752567-3.json` | READY | pass | sim | sim |
| `vitals_fc_faixas` | `examples/questao-premium-idecan-fc-radial-ce.json` | READY | pass | sim | sim |
| `vitals_interpretacao` | `examples/questao-premium-fepese-sv-interpretacao-valores.json` | READY | pass | sim | sim |
| `vitals_vf_faixas` | `data/catalog-migration/sinais-vitais-g36/questions/avancasp-enfermagem-verificacao-de-sinais-vitais-1778969729218-7.json` | READY | pass | sim | sim |
| `vitals_exceto_tecnica` | `examples/questao-premium-avancasp-sv-pa-incorreta-divergente.json` | READY | pass | sim | sim |
| `vitals_temperatura` | `data/catalog-migration/sinais-vitais-g39/questions/amauc-enfermagem-verificacao-de-sinais-vitais-1779344205200-1.json` | READY | pass | sim | sim |
| `vitals_fr_faixas` | `data/catalog-migration/sinais-vitais-g37/questions/adm-tec-enfermagem-verificacao-de-sinais-vitais-1779343833455-7.json` | READY | pass | sim | sim |
| `vitals_generico` | `data/catalog-migration/sinais-vitais-g48/questions/instituto-seletiva-enfermagem-verificacao-de-sinais-vitais-1779343865210-0.json` | READY | pass | sim | sim |

## Último ramo — `vitals_generico` (Glasgow)

- Gabarito **D (14)** = ocular 4 + verbal 4 + motor 6
- Ocular **3 = à voz** (não “verbal”)
- Pupilas isocóricas = dado **paralelo** (fora da soma clássica)
- Golden: cards empilhados + linhas O/V/M
- Danger: Arena Glasgow (chips Ocular/Verbal/Motor/Total)
- Logic: elim board **0 taps**
- Preview: http://localhost:3000/dev/slide-mold-review?branch=vitals_generico

## Moldes compartilhados elevados nesta onda

- `VitalsPanelConceptMap` — badges CASO / TÉCNICA / PEGADINHA / NORMAL / ALTERADO
- `LogicFlowVitalsTranslateTap` — elim board quando cues MCQ
- `GoldenRuleVitalsReferenceBoard` — cores por eixo Glasgow + lista vertical
- `DangerZoneVitalsClassifyArena` — chips Glasgow vs PA/FC/FR/Temp
- `vitalsSlideUtils` — parser anti-falso-positivo tradução / ícones Glasgow

## Declaração

**Âncoras do subtópico Verificação de Sinais Vitais: 100% — base liberada para handcraft em massa em conversa futura.**

Não iniciar `gNN` / apply / `--promote` nesta conversa (salvo pedido explícito).

## Artefatos

| Artefato | Uso |
|----------|-----|
| `data/catalog-migration/handcraft-playbooks/sinais-vitais.json` | stamps `aprovado_100` 8/8 |
| `data/catalog-migration/visual-anchors.json` | previews + visual_bar |
| `data/catalog-migration/sinais-vitais-anchor-registry.json` | índice de âncoras |
| `artifacts/sinais-vitais-ancoras-100-report.md` | DoD Fase 2 |

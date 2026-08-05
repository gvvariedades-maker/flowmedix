# Handcraft briefing — Verificação de Sinais Vitais

**Modo automático** (trigger `Handcraft:`). Executar sem pedir confirmação de modo.

## Escopo

- **Subtópico inteiro** — handcraft golden-v1 A1+A2+A3
- **Primeiro lote:** `sinais-vitais-g01`

## Pacote (registry)

| Campo | Valor |
|-------|-------|
| pacote_prefix | `sinais-vitais` |
| status | applied (354/354 slugs) |
| manifest | `data/catalog-migration/sinais-vitais-completo/manifest-handcraft.json` |
| lote_pattern | `sinais-vitais-g{NN}` |
| lote_size | 8 |
| anchor_glob | `examples/questao-premium-*-sv-*.json,examples/questao-premium-idecan-fc-radial-ce.json,examples/questao-premium-avancasp-sv-pa-incorreta-divergente.json` |
| guideline | `lib/guidelines/sinaisVitais.ts` |
| handcraft_meta | `data/catalog-migration/sinais-vitais-completo/handcraft-meta.json` |

## Proibido (playbook)

- `ai:generate`
- `catalog:upgrade-premium`

## Ramos L3 (pedagogical_branch)

  - **vitals_pa_tecnica** — Técnica de aferição PA, manguito, posição, repouso, Korotkoff, V/F cuidados pré-PA, bexiga cheia · vitals-panel · vitals-reference-board · vitals-translate-tap · vitals-classify-arena
    Âncoras: examples/questao-premium-fepese-sv-interpretacao-valores.json, data/catalog-migration/sinais-vitais-g01/questions/ameosc-enfermagem-verificacao-de-sinais-vitais-1778969752567-3.json, data/catalog-migration/sinais-vitais-g01/questions/amauc-enfermagem-verificacao-de-sinais-vitais-1779344189558-7.json, data/catalog-migration/sinais-vitais-g01/questions/amauc-enfermagem-verificacao-de-sinais-vitais-1779344196733-2.json
  - **vitals_fc_faixas** — FC 60–100 bpm, pulso radial/central, normo/taqui/bradicardia, valores combinados FC+FR+PA · vitals-panel · vitals-reference-board · vitals-translate-tap · vitals-classify-arena
    Âncoras: examples/questao-premium-idecan-fc-radial-ce.json, data/catalog-migration/sinais-vitais-g01/questions/adm-tec-enfermagem-verificacao-de-sinais-vitais-1779343833455-6.json, data/catalog-migration/sinais-vitais-g01/questions/ameosc-enfermagem-verificacao-de-sinais-vitais-1778969760552-7.json
  - **vitals_interpretacao** — Interpretação multi-SV, classificar normo/hiper/hipo, taqui/taquipneia, conduta ante alteração · vitals-panel · vitals-reference-board · vitals-translate-tap · vitals-classify-arena
    Âncoras: examples/questao-premium-fepese-sv-interpretacao-valores.json, data/catalog-migration/sinais-vitais-g01/questions/ameosc-enfermagem-verificacao-de-sinais-vitais-1778969752567-7.json
  - **vitals_vf_faixas** — V/F I–III sobre faixas FC/FR/PA/temperatura de referência · vitals-panel · vitals-reference-board · vitals-translate-tap · vitals-classify-arena
    Âncoras: examples/questao-premium-idecan-fc-radial-ce.json
  - **vitals_exceto_tecnica** — EXCETO/INCORRETA — técnica de aferição; distratores = conduta correta · vitals-panel · vitals-reference-board · vitals-translate-tap · vitals-classify-arena (compare semântico)
    Âncoras: examples/questao-premium-avancasp-sv-pa-incorreta-divergente.json
  - **vitals_generico** — FR isolada, temperatura, SpO₂, pediatria, Glasgow, certo/errado sem fit — cauda longa · vitals-panel · vitals-reference-board · vitals-translate-tap · vitals-classify-arena
    Âncoras: examples/questao-premium-fepese-sv-interpretacao-valores.json

## Clusters

- PA — técnica e interpretação (196 · 55,4% — vitals_pa_tecnica · âncoras AMEOSC/AMAUC g01)
- FC e pulso — faixas e técnica (40 · 11,3% — vitals_fc_faixas · âncora IDECAN C/E)
- Temperatura — vias e febre (33 · 9,3% — vitals_temperatura → vitals_generico até brief)
- EXCETO/INCORRETA — técnica SV (20 · 5,6% — vitals_exceto_tecnica · âncora AVANÇASP INCORRETA PA)
- FR e padrão respiratório (16 · 4,5% — vitals_fr_faixas → vitals_generico)
- SV geral / múltiplos parâmetros (14 · 4% — vitals_interpretacao · âncora FEPESE)
- Certo ou errado (10 · 2,8% — vitals_generico)
- V/F — faixas de referência I/II/III (9 · 2,5% — vitals_vf_faixas)
- SpO₂ e oximetria (5 · 1,4% — vitals_spo2 → vitals_generico)
- Faixas pediátricas por idade (5 · 1,4% — vitals_pediatrico_faixas → guideline MS/SBP)
- Glasgow / escala de coma (4 · 1,1% — vitals_generico — absorver)

## Gramática golden-v1 (4 slides)

- **concept_map:** Painel PA/FC/FR/Temp + erro ROI nomeado (sinais-vitais-pedagogy-errors.json) — sem gabarito/letra
- **golden_rule:** Faixas normativas MS/COFEN — rows com sv_kind; técnica Korotkoff/manguito (sem V/F nem gabarito)
- **logic_flow:** Único lugar com gabarito; reveal_mode tap; eliminar distratores ou julgar I–III/V
- **danger_zone:** Erro reproduzível × correção por letra (vitals-classify-arena — espelha concept_map)
- Mapa de erros ROI: `data/catalog-migration/sinais-vitais-pedagogy-errors.json`

## Priorização ROI

| P | Ação | Por quê |
|---|------|---------|
| P0 | Handcraft g01–g25 vitals_pa_tecnica (técnica PA + Korotkoff + V/F cuidados) | ~55% do corpus handcraft (196 slugs) — molde vitals-* 4/4 no repo |
| P0 | audit:slug-alignment --strict + sinaisVitaisPedagogy em todo lote | Evita reciclagem danger_mirror e concept_map com gabarito |
| P1 | Lote dedicado vitals_fc_faixas + vitals_interpretacao (54 slugs) | Segundo e terceiro clusters fortes — âncoras FEPESE + IDECAN + g01 |
| P1 | enrich:sinais-vitais-guideline-meta + audit:numeric-factcheck em slugs com bpm/irpm/mmHg/°C | Faixas numéricas = pegadinha #1 em SV |
| P2 | Ramo vitals_exceto_tecnica + lint semântico (âncora AVANÇASP piloto) | 20 slugs compare — gate vitals_exceto_semantic; paridade Imunização Agirh |
| P2 | Brief + âncora dedicada vitals_pediatrico_faixas (5 slugs) | Tabela MS/SBP por idade — não reciclar faixa adulto |
| P2 | test:e2e:visual-molds vitals + audit:subtopico-quality --promote | Fecha vendável L3–L6 |

## Golden anchors

- Registry: `data/catalog-migration/sinais-vitais-anchor-registry.json`
- **vitals_pa_tecnica:** `examples/questao-premium-fepese-sv-interpretacao-valores.json`
- **vitals_pa_tecnica:** `data/catalog-migration/sinais-vitais-g01/questions/ameosc-enfermagem-verificacao-de-sinais-vitais-1778969752567-3.json`
- **vitals_pa_tecnica:** `data/catalog-migration/sinais-vitais-g01/questions/amauc-enfermagem-verificacao-de-sinais-vitais-1779344189558-7.json`
- **vitals_pa_tecnica:** `data/catalog-migration/sinais-vitais-g01/questions/amauc-enfermagem-verificacao-de-sinais-vitais-1779344196733-2.json`
- **vitals_fc_faixas:** `examples/questao-premium-idecan-fc-radial-ce.json`
- **vitals_fc_faixas:** `data/catalog-migration/sinais-vitais-g01/questions/adm-tec-enfermagem-verificacao-de-sinais-vitais-1779343833455-6.json`
- **vitals_fc_faixas:** `data/catalog-migration/sinais-vitais-g01/questions/ameosc-enfermagem-verificacao-de-sinais-vitais-1778969760552-7.json`
- **vitals_interpretacao:** `examples/questao-premium-fepese-sv-interpretacao-valores.json`
- **vitals_interpretacao:** `data/catalog-migration/sinais-vitais-g01/questions/ameosc-enfermagem-verificacao-de-sinais-vitais-1778969752567-7.json`
- **vitals_vf_faixas:** `examples/questao-premium-idecan-fc-radial-ce.json`
- **vitals_exceto_tecnica:** `examples/questao-premium-avancasp-sv-pa-incorreta-divergente.json`
- **vitals_generico:** `examples/questao-premium-fepese-sv-interpretacao-valores.json`

## Pipeline (executar)

1. Ler `docs/HANDCRAFT_CONVERSA.md`, `docs/GOLDEN_HANDCRAFT_MODEL.md`, skill `avant-json-template` § L2.5+L3.
2. Ler `handcraft_meta` e 1–2 âncoras do ramo de cada slug.
3. Handcraft: `meta.content_standard: golden-v1` + `family` + `pedagogical_branch` + 4 slides planos.
4. **Proibido:** `ai:generate`, `catalog:upgrade-premium`.

```bash
npm run catalog:export-lote -- --lote=sinais-vitais-completo --subtopico="Verificação de Sinais Vitais" --limit=10000
# Handcraft → data/catalog-migration/sinais-vitais-g01/questions/*.json
npm run validate:goldens -- --lote=sinais-vitais-g01 --strict
npm run audit:questao-readiness -- --lote=sinais-vitais-g01 --strict-v2-pedagogy
npm run audit:slug-alignment -- --lote=sinais-vitais-g01 --strict
npm run audit:numeric-factcheck -- --lote=sinais-vitais-g01
npm run enrich:sinais-vitais-guideline-meta -- --lote=sinais-vitais-g01 --write
npm run catalog:patch-pedagogical-branch -- --lote=sinais-vitais-g01 --reconcile-branch --apply
npm run capture:questao-review -- --lote=sinais-vitais-g01
npm run audit:anchor-review -- --lote=sinais-vitais-g01 --record-pass --reviewer=<revisor>
npm run catalog:apply-lote -- --lote=sinais-vitais-g01 --dry-run
# apply SOMENTE se usuário pedir:
npm run catalog:apply-lote -- --lote=sinais-vitais-g01 --apply
npm run catalog:patch-pedagogical-branch -- --from-supabase --subtopico="Verificação de Sinais Vitais" --only-premium --reconcile-branch --apply
```

## Critério de pronto (automático)

- `audit:questao-readiness` → `[READY]` por slug (strict-v2-pedagogy obrigatório)
- A4 (piloto `/estudar/[slug]`) — usuário

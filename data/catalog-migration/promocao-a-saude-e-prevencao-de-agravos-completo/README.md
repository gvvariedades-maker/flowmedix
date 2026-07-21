# Promoção à Saúde e Prevenção de Agravos — handcraft golden-v1 (setup)

**Subtópico:** Promoção à Saúde e Prevenção de Agravos  
**Modo:** Handcraft em andamento (g01 applied)  
**Status:** `none` · **8/101** applied (g01) · **g02 ready** (8 slugs) · L3 mapeado (2026-07-20)

Runbook: [`docs/GOLDEN_HANDCRAFT_MODEL.md`](../../../docs/GOLDEN_HANDCRAFT_MODEL.md) · [`docs/HANDCRAFT_CONVERSA.md`](../../../docs/HANDCRAFT_CONVERSA.md)

## Catálogo

| Item | Valor |
|------|--------|
| Slugs exportados | **101** (`manifest.json` — 25 cross-package/taxonomy drift excluídos) |
| Lotes handcraft | `promocao-a-saude-e-prevencao-de-agravos-g{NN}` · g01 applied · g02 ready |
| Cluster | `npm run cluster:promocao` → [`artifacts/promocao-a-saude-e-prevencao-de-agravos-topic-cluster-report.json`](../../../artifacts/promocao-a-saude-e-prevencao-de-agravos-topic-cluster-report.json) |
| Playbook | [`handcraft-playbooks/promocao-a-saude-e-prevencao-de-agravos.json`](../handcraft-playbooks/promocao-a-saude-e-prevencao-de-agravos.json) |
| Guideline | `lib/guidelines/promocaoSaude.ts` |
| L3 ramo forte | `promocao_art4_composicao` → `sus-art4-orbit` + `scope-trap` (**wired**) |
| Briefs L3 | [`artifacts/l3-brief-promocao-a-saude-e-prevencao-de-agravos-INDEX.md`](../../../artifacts/l3-brief-promocao-a-saude-e-prevencao-de-agravos-INDEX.md) |
| Golden piloto | `examples/questao-premium-sus-lei-8080-cesgranrio.json` |
| **Não usar** | `ai:generate` · `catalog:upgrade-premium` |

## Drift taxonômico — segmento URL `promocao-a-saude` (2026-07-20)

**Gate atual:** `warn` · `handcraft_allowed=true` · **taxonomy `closed`** (2026-07-20)

| Métrica | Valor |
|---------|--------|
| Slugs no manifest Promoção | **101** |
| Linhas no catálogo (`titulo_aula` Promoção) | **234** |
| `meta.subtopico` vazio | **0** (corrigido) |
| Infer: saída do manifest | **0** (2 reclassificadas no DB + removidas do manifest) |
| URL `promocao-a-saude` em lotes de **outros** pacotes | 18 refs em `lote-meta` — **0** no manifest Promoção (removidos 2026-07-20) |

**Cross-package removidos do manifest** (handcraft no pacote dono; URL legada mantida): ver [`promocao-a-saude-manifest-cross-package-excluded.json`](../promocao-a-saude-manifest-cross-package-excluded.json).

**Reclassificadas (2026-07-20)** → `Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis`:
- `idecan-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1778712270872-2`
- `unifil-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563927625-2`

**Meta patch:** `idecan-enfermagem-saude-do-idoso-1778712437306-6` — `meta.subtopico` preenchido (payload incompleto no DB; handcraft/repair de conteúdo pendente).

Relatório versionado (rodar com `--write`):

```bash
npm run audit:promocao-slug-drift -- --write
```

Artefato: [`promocao-a-saude-taxonomy-drift.json`](../promocao-a-saude-taxonomy-drift.json)

### Dois tipos de drift

1. **Manifest poluído** — slug exportado pelo builder com segmento `promocao-a-saude`, mas conteúdo é de outro subtópico (Sondas, Criança, Crônicas…). Infer dry-run lista saídas em `manifest_infer_exits`. **Remover do manifest Promoção** após reclassify; handcraft no pacote destino.

2. **URL legada em pacote já handcraft** — ex.: `vunesp-enfermagem-promocao-a-saude-…` em `enfermagem-do-trabalho-g05` com `meta.subtopico` = Enfermagem do Trabalho. **Não renomear `modulo_slug`** (padrão Adolescente/Vias); só garantir `meta.subtopico` canônico.

### Overlap Imunização (removido 2026-07-20)

- `fenix-instituto-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563858390-3`
- `ieses-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563923516-4`

Artefato: [`promocao-a-saude-manifest-imunizacao-overlap-excluded.json`](../promocao-a-saude-manifest-imunizacao-overlap-excluded.json)

**Taxonomia fechada:** [`artifacts/taxonomy-closed-promocao-a-saude-e-prevencao-de-agravos.json`](../../../artifacts/taxonomy-closed-promocao-a-saude-e-prevencao-de-agravos.json)

## g01 (exportado 2026-07-20)

| Campo | Valor |
|-------|--------|
| Lote | `promocao-a-saude-e-prevencao-de-agravos-g01` |
| Cluster | Lei 8.080 Art. 4º · `promocao_art4_composicao` |
| Slugs | 8 exportados do Supabase |
| Status | `exported` — handcraft pendente |
| Meta | [`promocao-a-saude-e-prevencao-de-agravos-g01/lote-meta.json`](../promocao-a-saude-e-prevencao-de-agravos-g01/lote-meta.json) |

### Pipeline Classify (antes do handcraft)

```bash
npm run audit:subtopico-inventory -- "--subtopico=Promoção à Saúde e Prevenção de Agravos"
npm run audit:taxonomy-gate -- "--subtopico=Promoção à Saúde e Prevenção de Agravos"
npm run catalog:infer-subtopico -- "--subtopico=Promoção à Saúde e Prevenção de Agravos" --dry-run
# --apply somente com pedido explícito
```

`visual-anchors.json`: revisar `trabalho_nr15_reference` se ainda apontar slug com segmento promocao.

## Pipeline sugerido

```bash
npm run handcraft:brief -- --subtopico="Promoção à Saúde e Prevenção de Agravos"
npm run catalog:export-lote -- --lote=promocao-a-saude-e-prevencao-de-agravos-g01 --slugs=...
# handcraft: data/catalog-migration/promocao-a-saude-e-prevencao-de-agravos-g01/questions/<slug>.json
npm run audit:questao-readiness -- --lote=promocao-a-saude-e-prevencao-de-agravos-g01 --strict-v2-pedagogy
npm run validate:goldens -- --lote=promocao-a-saude-e-prevencao-de-agravos-g01 --strict
```

## Qualidade vendável (Fase 2 — após applied 100%)

```bash
npm run reconcile:handcraft-manifest -- --subtopico="Promoção à Saúde e Prevenção de Agravos"
npx playwright test e2e/visual-mold-regression.spec.ts --project=chromium --grep "Promoção"
npm run audit:subtopico-quality -- --subtopico="Promoção à Saúde e Prevenção de Agravos"
```

# Handcraft briefing — Vias de Administração

**Modo automático** (trigger `Handcraft:`). Executar sem pedir confirmação de modo.

## Escopo

- **Subtópico inteiro** — handcraft golden-v1 A1+A2+A3
- **Primeiro lote:** `vias-de-administracao-g01`

## Pacote (registry)

| Campo | Valor |
|-------|-------|
| pacote_prefix | `vias-de-administracao` |
| status | applied (208/208 slugs) |
| manifest | `data/catalog-migration/vias-de-administracao-completo/manifest.json` |
| lote_pattern | `vias-de-administracao-g{NN}` |
| lote_size | 8 |
| anchor_glob | `examples/questao-premium-*-vias-*.json,examples/questao-premium-consulpam-vias-absorcao-oral.json` |
| guideline | `lib/guidelines/viasAdministracao.ts` |
| handcraft_meta | `data/catalog-migration/vias-de-administracao-completo/handcraft-meta.json` |

## Proibido (playbook)

- `ai:generate`
- `catalog:upgrade-premium`

## Ramos L3 (pedagogical_branch)

  - **via_vf_absorcao** — Absorção, 1ª passagem hepática, oral/sublingual/retal/parenteral, comparativo de vias, indicação por velocidade · absorption-speed-rail · via-reference-board · via-vf-juggle-tap · route-trap
    Âncoras: examples/questao-premium-consulpam-vias-absorcao-oral.json, examples/questao-premium-vunesp-via-subcutanea.json, examples/questao-premium-cpcon-vias-im-vf.json
  - **via_tecnica_admin** — Técnica de punção, sítio anatômico, volume, ângulo, complicações · morphological · banner · cards · compare (genérico P1 — ok_generico; brief bespoke opcional pós-g01)
    Âncoras: examples/questao-premium-cpcon-vias-im-vf.json
  - **via_generico** — EXCETO/INCORRETA, perfis de via sem cluster, certo ou errado — cauda longa · genérico morphological · reference_table · tap · compare
    Âncoras: examples/questao-premium-cetrede-vias-injetaveis-incorreta.json, examples/questao-premium-avancasp-vias-sublingual-exceto.json

## Clusters

- Técnica de punção IM/IV (68 · 28,9% — ramo via_tecnica_admin · âncora CPCON IM V/F)
- V/F — absorção e perfil de vias (57 · 24,3% — via_vf_absorcao · âncora CPCON)
- Absorção / farmacocinética (CORRETA) (26 · 11,1% — via_vf_absorcao · âncora Consulpam)
- Perfis de via (25 · 10,6% — via_generico — cauda)
- Indicação da via (velocidade SC/IM/IV) (19 · 8,1% — via_vf_absorcao · âncora VUNESP SC)
- INCORRETA / EXCETO (18 · 7,7% — via_generico · âncora CETREDE pendente)
- Default — sem âncora temática (11 · 4,7% — absorver)
- Certo ou errado (8 · 3,4% — absorver)
- 1ª passagem hepática / biodisponibilidade (3 · 1,3% — via_vf_absorcao)

## Gramática golden-v1 (4 slides)

- **concept_map:** Enquadramento da prova + trilho de absorção ou sítio anatômico + erro ROI nomeado (vias-pedagogy-errors.json)
- **golden_rule:** Decore normativo — rows velocidade IV/IM/SC/VO, volumes, ângulos, sítios (sem V/F nem gabarito)
- **logic_flow:** Único lugar com gabarito; reveal_mode tap; eliminar distratores ou julgar I–IV
- **danger_zone:** Erro reproduzível × correção por letra (route-trap / compare — espelha concept_map)
- Mapa de erros ROI: `data/catalog-migration/vias-pedagogy-errors.json`

## Priorização ROI

| P | Ação | Por quê |
|---|------|---------|
| P0 | Handcraft g01+ via_vf_absorcao (V/F absorção + CORRETA + indicação) | ~91% do volume inferido (214 slugs) — molde bespoke 4/4 pronto |
| P0 | audit:slug-alignment --strict + viasPedagogy em todo lote | Evita reciclagem e danger_mirror vazio |
| P1 | Lote dedicado via_tecnica_admin (68 slugs punção IM/IV) | 29% cluster técnica — molde genérico até brief bespoke |
| P1 | enrich:vias-guideline-meta + audit:numeric-factcheck em slugs com dose/ângulo/volume | COFEN tier A + factcheck L2b |
| P2 | Âncora EXCETO CETREDE + handcraft INCORRETA/EXCETO (18 slugs) | compare semântico — gate vias_exceto_semantic |
| P2 | test:e2e:visual-molds Vias + audit:subtopico-quality --promote | Fecha vendável L3–L6 |

## Golden anchors

- Registry: `data/catalog-migration/vias-golden-anchors.json`
- **via_vf_absorcao:** `examples/questao-premium-consulpam-vias-absorcao-oral.json`
- **via_vf_absorcao:** `examples/questao-premium-vunesp-via-subcutanea.json`
- **via_vf_absorcao:** `examples/questao-premium-cpcon-vias-im-vf.json`
- **via_tecnica_admin:** `examples/questao-premium-cpcon-vias-im-vf.json`
- **via_generico:** `examples/questao-premium-cetrede-vias-injetaveis-incorreta.json`
- **via_generico:** `examples/questao-premium-avancasp-vias-sublingual-exceto.json`

## Pipeline (executar)

1. Ler `docs/HANDCRAFT_CONVERSA.md`, `docs/GOLDEN_HANDCRAFT_MODEL.md`, skill `avant-json-template` § L2.5+L3.
2. Ler `handcraft_meta` e 1–2 âncoras do ramo de cada slug.
3. Handcraft: `meta.content_standard: golden-v1` + `family` + `pedagogical_branch` + 4 slides planos.
4. **Proibido:** `ai:generate`, `catalog:upgrade-premium`.

```bash
npm run catalog:export-lote -- --lote=vias-de-administracao-completo --subtopico="Vias de Administração" --limit=10000
# Handcraft → data/catalog-migration/vias-de-administracao-g01/questions/*.json
npm run validate:goldens -- --lote=vias-de-administracao-g01 --strict
npm run audit:questao-readiness -- --lote=vias-de-administracao-g01 --strict-v2-pedagogy
npm run audit:slug-alignment -- --lote=vias-de-administracao-g01 --strict
npm run audit:numeric-factcheck -- --lote=vias-de-administracao-g01
npm run enrich:vias-guideline-meta -- --lote=vias-de-administracao-g01 --write
npm run catalog:patch-pedagogical-branch -- --lote=vias-de-administracao-g01 --reconcile-branch --apply
npm run capture:questao-review -- --lote=vias-de-administracao-g01
npm run audit:anchor-review -- --lote=vias-de-administracao-g01 --record-pass --reviewer=<revisor>
npm run catalog:apply-lote -- --lote=vias-de-administracao-g01 --dry-run
# apply SOMENTE se usuário pedir:
npm run catalog:apply-lote -- --lote=vias-de-administracao-g01 --apply
npm run catalog:patch-pedagogical-branch -- --from-supabase --subtopico="Vias de Administração" --only-premium --reconcile-branch --apply
```

## Critério de pronto (automático)

- `audit:questao-readiness` → `[READY]` por slug (strict-v2-pedagogy obrigatório)
- A4 (piloto `/estudar/[slug]`) — usuário

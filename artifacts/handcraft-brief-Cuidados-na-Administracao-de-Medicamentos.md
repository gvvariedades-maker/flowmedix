# Handcraft briefing — Cuidados na Administração de Medicamentos

**Modo automático** (trigger `Handcraft:`). Executar sem pedir confirmação de modo.

## Escopo

- **Subtópico inteiro** — handcraft golden-v1 A1+A2+A3
- **Primeiro lote:** `cuidados-na-administracao-de-medicamentos-g01`

## Pacote (registry)

| Campo | Valor |
|-------|-------|
| pacote_prefix | `cuidados-na-administracao-de-medicamentos` |
| status | in_progress (0/123 slugs) |
| manifest | `data/catalog-migration/cuidados-na-administracao-de-medicamentos-completo/manifest.json` |
| lote_pattern | `cuidados-na-administracao-de-medicamentos-g{NN}` |
| lote_size | 8 |
| anchor_glob | `examples/questao-premium-*-cuidados-*.json,examples/questao-premium-fepese-cuidados-administracao-medicamentos.json,examples/questao-premium-fepese-cuidados-insulina-alto-risco.json,examples/questao-premium-avancasp-cuidados-exceto-preparo-medicamentos.json` |
| guideline | `lib/guidelines/cuidadosMedicamentos.ts` |
| handcraft_meta | `data/catalog-migration/cuidados-na-administracao-de-medicamentos-completo/handcraft-meta.json` |

## Proibido (playbook)

- `ai:generate`
- `catalog:upgrade-premium`

## Ramos L3 (pedagogical_branch)

  - **cam_certos_vf_caso** — V/F I–III sobre 9 Certos em caso clínico — combinação MCQ · cam-certos-deck · cam-nine-rights-board · cam-vf-juggle-tap · cam-certos-trap-arena
    Âncoras: examples/questao-premium-fepese-cuidados-administracao-medicamentos.json
  - **cam_alto_risco** — Insulina, heparina, quimioterápico, conferência dupla — técnica e segurança alto risco · cam-high-risk-duo-deck · cam-high-risk-protocol-board · cam-alto-risco-elimination-tap · cam-high-risk-trap-arena
    Âncoras: examples/questao-premium-fepese-cuidados-insulina-alto-risco.json
  - **cam_generico** — EXCETO/INCORRETA, preparo sala, documentação, aprazamento, vigilância, default — cauda sem molde bespoke · bridge · center/reference_table · cards tap · compare semântico
    Âncoras: examples/questao-premium-avancasp-cuidados-exceto-preparo-medicamentos.json

## Clusters

- Default — sem âncora temática (28 · 22,8% — cam_generico · âncora AVANÇASP EXCETO preparo)
- Alto risco / conferência dupla (19 · 15,4% — cam_alto_risco · âncora FEPESE insulina)
- V/F — 9 certos em caso clínico (18 · 14,6% — cam_certos_vf_caso · âncora FEPESE 9 certos)
- Documentação / registro (16 · 13% — cam_generico · âncora AVANÇASP EXCETO)
- INCORRETA / EXCETO (9 · 7,3% — cam_generico · gate cam_exceto_semantic)
- Vigilância / reações adversas (7 · 5,7% — absorver em cam_generico)
- Preparo / sala de medicação (6 · 4,9% — absorver em cam_generico)
- V/F — protocolo MS / I–VI (5 · 4,1% — absorver em cam_generico)
- Horário / aprazamento (5 · 4,1% — absorver em cam_generico)
- Prescrição ilegível / dúvida (3 · 2,4% — absorver em cam_generico)
- Nove certos — listagem (2 · 1,6% — cam_certos_vf_caso)
- Certo ou errado (2 · 1,6% — cam_generico)
- Orientação ao paciente (2 · 1,6% — cam_generico)
- LASA / nomes semelhantes (1 · 0,8% — cam_generico)

## Gramática golden-v1 (4 slides)

- **concept_map:** Enquadramento da prova + erro reproduzível nomeado (9 Certos, alto risco ou preparo — não resumo COFEN)
- **golden_rule:** Decore normativo — rows 9 Certos, protocolo alto risco ou checklist preparo (sem gabarito letra)
- **logic_flow:** Único lugar com gabarito; reveal_mode tap; V/F juggle ou eliminação letra a letra
- **danger_zone:** Erro reproduzível × correção por letra (compare semântico — espelha concept_map)
- Mapa de erros ROI: `data/catalog-migration/cuidados-na-administracao-de-medicamentos-pedagogy-errors.json`

## Priorização ROI

| P | Ação | Por quê |
|---|------|---------|
| P0 | Handcraft g01 cam_alto_risco (19 slugs) | Cluster 15,4% — molde bespoke 4/4 + âncora FEPESE insulina READY |
| P0 | Handcraft g02 cam_certos_vf_caso (18 slugs) | Cluster 14,6% — molde cam-certos-* pronto |
| P0 | audit:slug-alignment --strict em todo lote | Export curado 123 slugs — evita drift e compare vazio |
| P1 | Handcraft g03+ cam_generico (default + absorvidos ~60 slugs) | Âncora EXCETO preparo define gramática genérica + gate cam_exceto_semantic |
| P1 | audit:numeric-factcheck + guideline cuidadosMedicamentos.ts | Doses/diluição EV e preparo — pegadinha #1 em slugs clínicos |
| P2 | test:e2e:visual-molds -- --grep="CAM" + audit:subtopico-quality --promote | Fecha vendável L3–L6 — regressão visual 3 ramos bespoke + genérico |

## Golden anchors

- Registry: `data/catalog-migration/cuidados-na-administracao-de-medicamentos-golden-anchors.json`
- **cam_certos_vf_caso:** `examples/questao-premium-fepese-cuidados-administracao-medicamentos.json`
- **cam_alto_risco:** `examples/questao-premium-fepese-cuidados-insulina-alto-risco.json`
- **cam_generico:** `examples/questao-premium-avancasp-cuidados-exceto-preparo-medicamentos.json`

## Pipeline (executar)

1. Ler `docs/HANDCRAFT_CONVERSA.md`, `docs/GOLDEN_HANDCRAFT_MODEL.md`, skill `avant-json-template` § L2.5+L3.
2. Ler `handcraft_meta` e 1–2 âncoras do ramo de cada slug.
3. Handcraft: `meta.content_standard: golden-v1` + `family` + `pedagogical_branch` + 4 slides planos.
4. **Proibido:** `ai:generate`, `catalog:upgrade-premium`.

```bash
npm run catalog:export-lote -- --lote=cuidados-na-administracao-de-medicamentos-completo --subtopico="Cuidados na Administração de Medicamentos" --limit=10000
# Handcraft → data/catalog-migration/cuidados-na-administracao-de-medicamentos-g01/questions/*.json
npm run validate:goldens -- --lote=cuidados-na-administracao-de-medicamentos-g01 --strict
npm run audit:questao-readiness -- --lote=cuidados-na-administracao-de-medicamentos-g01 --strict-v2-pedagogy
npm run audit:slug-alignment -- --lote=cuidados-na-administracao-de-medicamentos-g01 --strict
npm run audit:numeric-factcheck -- --lote=cuidados-na-administracao-de-medicamentos-g01
npm run catalog:patch-pedagogical-branch -- --lote=cuidados-na-administracao-de-medicamentos-g01 --reconcile-branch --apply
npm run test:e2e:visual-molds -- --grep="CAM"
npm run capture:questao-review -- --lote=cuidados-na-administracao-de-medicamentos-g01
npm run audit:anchor-review -- --lote=cuidados-na-administracao-de-medicamentos-g01 --record-pass --reviewer=<revisor>
npm run catalog:apply-lote -- --lote=cuidados-na-administracao-de-medicamentos-g01 --dry-run
# apply SOMENTE se usuário pedir:
npm run catalog:apply-lote -- --lote=cuidados-na-administracao-de-medicamentos-g01 --apply
npm run catalog:patch-pedagogical-branch -- --from-supabase --subtopico="Cuidados na Administração de Medicamentos" --only-premium --reconcile-branch --apply
```

## Critério de pronto (automático)

- `audit:questao-readiness` → `[READY]` por slug (strict-v2-pedagogy obrigatório)
- A4 (piloto `/estudar/[slug]`) — usuário

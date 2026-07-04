# Pipeline completo — handcraft + qualidade vendável (uma conversa)

Use em **conversa nova** (Agent mode) para fechar **um subtópico** de ponta a ponta:

```text
Pipeline completo: Enfermagem em Central de Material e Esterilização (CME)
```

**Programa 41 subtópicos:** [`PROGRAMA_CATALOGO_41.md`](PROGRAMA_CATALOGO_41.md) · `npm run catalog:program-status` · `npm run pipeline:brief -- --subtopico="..."`

ou anexe este arquivo (`@docs/PIPELINE_COMPLETO_CONVERSA.md`) após editar **só** a linha:

```text
SUBTÓPICO: Enfermagem em Central de Material e Esterilização (CME)
```

**Escopo:** 1 subtópico canônico = 1 pacote no registry (todos os lotes `g*` e todos os slugs). **Não** usar para os 41 subtópicos numa única conversa.

**Decisões:** handcraft único ([`DECISAO_TRILHO_A_UNICO.md`](DECISAO_TRILHO_A_UNICO.md)) + qualidade híbrida ([`DECISAO_QUALITY_HIBRIDA.md`](DECISAO_QUALITY_HIBRIDA.md)).

---

## Variantes do trigger

| Trigger | Quando |
|---------|--------|
| `Pipeline completo: <subtópico>` | Fase 1 (se precisar) + Fase 2 até `--promote` |
| `Pipeline completo: <subtópico>` + linha `Slug: …` | Reparo pontual → readiness → retomar Fase 2 |
| `Pipeline completo: <subtópico>` + `Só qualidade` | Pular Fase 1 se já `applied` |
| `Pipeline completo: <subtópico>` + `Só handcraft` | Parar em `applied`; não promover |

Pré-requisito de taxonomia: se o bucket tem drift, `Classify: <subtópico>` antes — [`TAXONOMIA_CONVERSA.md`](TAXONOMIA_CONVERSA.md).

**Pré-requisito L3 (obrigatório antes da Fase 1 handcraft):** `Mapeamento L3: <subtópico>` com **Fase 3b** (brief 4/4 por ramo forte) — [`L3_MAPEAMENTO_CONVERSA.md`](L3_MAPEAMENTO_CONVERSA.md). Cauda longa (`ok_generico`) dispensa brief. Bypass só com `--skip-l3` documentado como emergência.

---

## Instruções para o agente (executar sem pedir modo)

Resolver pacote em [`handcraft-registry.json`](../data/catalog-migration/handcraft-registry.json) (nome exato `CLAUDE.md` §9). Carregar playbook (`handcraft_playbook` ou `handcraft-playbooks/<pacote_prefix>.json`).

### Proibido

- `npm run ai:generate` / `catalog:upgrade-premium`
- `catalog:apply-lote --apply` **sem** o usuário escrever explicitamente `pode aplicar`
- Declarar **vendável** sem `audit:subtopico-quality --promote` PASS
- Segundo `--promote` rotineiro após `production_ready` (pós-venda = `audit:subtopico-health`)
- Inventar bypass L3 sem `--skip-l3` documentado como emergência

### Ler antes

| Arquivo | Fase |
|---------|------|
| [`L3_MAPEAMENTO_CONVERSA.md`](L3_MAPEAMENTO_CONVERSA.md) | 0 |
| [`PROMPT_VARIANTES_NEUROSLIDES.md`](PROMPT_VARIANTES_NEUROSLIDES.md) | 0 (Fase 3b) |
| [`HANDCRAFT_CONVERSA.md`](HANDCRAFT_CONVERSA.md) | 1 |
| [`QUALITY_VENDAVEL_CONVERSA.md`](QUALITY_VENDAVEL_CONVERSA.md) | 2 |
| [`GOLDEN_HANDCRAFT_MODEL.md`](GOLDEN_HANDCRAFT_MODEL.md) | 1 |
| [`GOLDEN_CONTENT_STANDARD.md`](GOLDEN_CONTENT_STANDARD.md) | 1 |
| [`QUALITY_LAYERS_MODEL.md`](QUALITY_LAYERS_MODEL.md) | 2 |
| [`ANCHOR_SECOND_REVIEW_PROMPT.md`](ANCHOR_SECOND_REVIEW_PROMPT.md) | 2 (L6) |
| Skill `.cursor/skills/avant-json-template/SKILL.md` § L2.5+L3 | 1 |
| [`PLAYBOOK_ESTUDO_REVERSO_PREMIUM.md`](PLAYBOOK_ESTUDO_REVERSO_PREMIUM.md) §2 (ordem v2 + contrato) | 1 |

### Ordem dos NeuroSlides (v2 — padrão desde 2026-06)

O pipeline **não muda de fases**; muda o **contrato de handcraft** e a **experiência no player**.

| Ordem | `type` | Papel |
|------:|--------|--------|
| 1 | `concept_map` | Enquadramento — **sem** gabarito/letra |
| 2 | `logic_flow` | Elaboração — eliminação A–E + gabarito (`reveal_mode: "tap"`) |
| 3 | `golden_rule` | Síntese — decore/norma — **sem** row “Gabarito letra X” |
| 4 | `danger_zone` | Pegadinhas + transferência |

**Implementação:** [`lib/reverseStudySlideOrder.ts`](../lib/reverseStudySlideOrder.ts) · player reordena por `type` (padrão v2) · `normalizeQuestaoSlideArrays` grava JSON na ordem canônica ao validar.

| Situação | O que fazer no pipeline |
|----------|-------------------------|
| **Handcraft novo** (Fase 1) | Array `reverse_study_slides` na ordem v2 + contrato §2.1 do playbook; template [`examples/_TEMPLATE-golden-v1.json`](../examples/_TEMPLATE-golden-v1.json) |
| **Pacote já `applied`** | **Não** exige re-handcraft só por ordem — player e normalizer corrigem em runtime/save |
| **Conteúdo legado** (gabarito no `golden_rule`) | Não bloqueia `[READY]` hoje; repair opcional para alinhar pedagogy v2 |
| **Fase 2 — piloto / anchor** | Revisor valida sequência **mapa → raciocínio → decore → pegadinhas** no player |
| **Fase 2 — `visual-mold-regression`** | `/dev/slide-mold-review` usa ordem do **arquivo JSON**; atualizar âncoras/baseline se slides 2↔3 divergirem |

Rollback temporário no ambiente: `NEXT_PUBLIC_REVERSE_STUDY_SLIDE_ORDER=legacy`.

---

## Fluxo (visão geral)

```text
┌─────────────────────────────────────────────────────────────┐
│ FASE 0 — Mapeamento L3 (se sem briefs ou cluster desatual.) │
│   cluster → audit:l3-mold-gap → decisão → brief 4/4 (3b)    │
│   GATE: artifacts/l3-brief-* por ramo forte                  │
└───────────────────────────┬─────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ FASE 1 — Handcraft (se handcraft_applied < total_slugs)      │
│   export → JSON por slug → readiness → validate strict      │
│   → dry-run → apply (só se usuário: "pode aplicar")         │
│   GATE: status=applied, handcraft_applied=total_slugs       │
└───────────────────────────┬─────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ FASE 2 — Qualidade vendável (Parte A)                       │
│   reconcile → preflight (cada g*) → L1+L2+L2b → L6 → L3     │
│   → audit:subtopico-quality --promote                       │
│   GATE: production_status=production_ready (VENDÁVEL)       │
└───────────────────────────┬─────────────────────────────────┘
                            ▼
                    (opcional nesta conversa)
┌─────────────────────────────────────────────────────────────┐
│ FASE 3 — Baseline contínuo (só se pedido ou já vendável)    │
│   audit:subtopico-health                                    │
└─────────────────────────────────────────────────────────────┘
```

Se o registry já mostra `status: applied` e `handcraft_applied === total_slugs`, **pular Fase 1** e ir direto à Fase 2.

Se já `production_status: production_ready`, executar só Fase 3 (`audit:subtopico-health`) ou encerrar com relatório.

---

## Fase 1 — Handcraft (detalhe)

Seguir [`HANDCRAFT_CONVERSA.md`](HANDCRAFT_CONVERSA.md). Resumo operacional:

1. `npm run handcraft:brief -- --subtopico="<nome>"` (opcional — escopo da conversa)
2. Descobrir próximo lote `gNN` ou continuar lote em aberto
3. Por slug: `pedagogical_branch` + golden-v1 + `audit:questao-readiness` → `[READY]`
4. Por lote:
   ```bash
   npm run validate:goldens -- --lote=<lote> --strict
   npm run audit:questao-readiness -- --lote=<lote>
   npm run catalog:apply-lote -- --lote=<lote> --dry-run
   # apply somente após "pode aplicar":
   npm run catalog:apply-lote -- --lote=<lote> --apply
   ```
5. Repetir até `handcraft_applied === total_slugs`

**Checkpoint Fase 1** (reportar antes de Fase 2):

| Campo | Esperado |
|-------|----------|
| `status` | `applied` |
| `handcraft_applied` / `total_slugs` | 100% |
| `production_status` | ainda `none` (normal) |

---

## Fase 2 — Qualidade vendável + `--promote` (detalhe)

Seguir Parte A de [`QUALITY_VENDAVEL_CONVERSA.md`](QUALITY_VENDAVEL_CONVERSA.md). Ordem **obrigatória**:

```bash
npm run reconcile:handcraft-manifest -- --subtopico="<nome canônico>"

# cada lote g* do pacote:
npm run catalog:preflight -- --lote=<pacote>-g01

npm run audit:handcraft-dod -- --subtopico="<nome canônico>"
npm run audit:slug-alignment -- --subtopico="<nome canônico>" --strict
npm run audit:numeric-factcheck -- --subtopico="<nome canônico>"

# cada lote g* — L6:
npm run audit:anchor-review -- --lote=<pacote>-gNN
# revisor B: anchor_second_review.status === "pass" em todos

npx playwright test e2e/visual-mold-regression.spec.ts

npm run audit:subtopico-quality -- --subtopico="<nome canônico>" --promote
```

**Sem bootstrap 14d/100 sessões** antes do promote.

**Checkpoint Fase 2** (encerramento da conversa):

| Campo | Esperado |
|-------|----------|
| `production_status` | `production_ready` |
| `can_sell` | `true` |
| `quality.continuous.enabled` | `true` |
| Artefato | `artifacts/subtopico-quality/<pacote_prefix>.json` |

Se `--promote` falhar: listar `blockers[]`; se L1+L2+L2b OK pode existir só `technical_ready_at`.

---

## Fase 3 — Baseline contínuo (opcional)

Só se o usuário pedir na mesma conversa ou pacote já estava vendável:

```bash
npm run audit:subtopico-health -- --subtopico="<nome canônico>"
```

Pós-venda em outros dias: só `audit:subtopico-health`; `--recover` após repair P0.

---

## Critérios de encerramento

Reportar **separadamente** handcraft vs vendável:

```text
| applied | technical_ready | production_ready (VENDÁVEL) | blocked | blockers |
```

Nunca confundir `applied` com vendável.

---

## Resumo executivo (copiar no chat)

```text
Pipeline completo: <Subtópico canônico>

Anexos: @docs/PIPELINE_COMPLETO_CONVERSA.md @data/catalog-migration/handcraft-registry.json

FASE 1 — Handcraft (pular se já applied 100%):
- handcraft:brief + playbook
- JSON golden-v1 por slug (ordem v2: concept_map → logic_flow → golden_rule → danger_zone)
- concept_map sem gabarito; logic_flow com eliminação + letra; golden_rule sem row de gabarito
- audit:questao-readiness [READY]
- validate:goldens --strict por lote
- catalog:apply-lote --apply SOMENTE se eu escrever "pode aplicar"
- GATE: handcraft_applied === total_slugs

FASE 2 — Qualidade vendável (pacote inteiro):
1. reconcile:handcraft-manifest
2. catalog:preflight em todos g*
3. audit:handcraft-dod + slug-alignment --strict + numeric-factcheck
4. audit:anchor-review + revisor B em cada g*
5. visual-mold-regression
6. audit:subtopico-quality -- --subtopico="..." --promote
   → production_ready = VENDÁVEL

FASE 3 (opcional): audit:subtopico-health

Proibido: ai:generate, upgrade-premium, segundo --promote rotineiro pós-venda.
```

---

## Referências rápidas

| Só handcraft | `Handcraft: <subtópico>` — [`HANDCRAFT_CONVERSA.md`](HANDCRAFT_CONVERSA.md) |
| Só qualidade | `Qualidade vendável: <subtópico>` — [`QUALITY_VENDAVEL_CONVERSA.md`](QUALITY_VENDAVEL_CONVERSA.md) |
| Prompt expandido (barra Vias + Imunização) | [`PROMPT_PIPELINE_REFERENCIA_VIAS_IMUNIZACAO.md`](PROMPT_PIPELINE_REFERENCIA_VIAS_IMUNIZACAO.md) |
| Mapeamento L3 (antes de moldes) | `Mapeamento L3: <subtópico>` — [`L3_MAPEAMENTO_CONVERSA.md`](L3_MAPEAMENTO_CONVERSA.md) |
| Ordem slides v2 | [`PLAYBOOK_ESTUDO_REVERSO_PREMIUM.md`](PLAYBOOK_ESTUDO_REVERSO_PREMIUM.md) §2 · [`lib/reverseStudySlideOrder.ts`](../lib/reverseStudySlideOrder.ts) |
| Rule Cursor | `.cursor/rules/pipeline-completo.mdc` |

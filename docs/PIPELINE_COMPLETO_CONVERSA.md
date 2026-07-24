# Pipeline completo — handcraft + qualidade vendável (uma conversa)

Use em **conversa nova** (Agent mode) para fechar **um subtópico** de ponta a ponta:

```text
Pipeline completo: Enfermagem em Central de Material e Esterilização (CME)
```

**Programa 41 subtópicos:** [`PROGRAMA_CATALOGO_41.md`](PROGRAMA_CATALOGO_41.md) · `npm run catalog:program-status` · `npm run pipeline:brief -- --subtopico="..."`

ou anexe este arquivo (`@docs/PIPELINE_COMPLETO_CONVERSA.md`) — equivalente a escrever `Pipeline completo: <subtópico>` — e edite **só** a linha:

```text
Pipeline completo: Enfermagem em Central de Material e Esterilização (CME)
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
| `Paridade Adolescente: <subtópico>` | Paridade pedagógica proporcional (L2+L3+A4 substantivo+L6) — [`PROMPT_PARIDADE_ADOLESCENTE.md`](PROMPT_PARIDADE_ADOLESCENTE.md) |
| `Pipeline + paridade Adolescente: <subtópico>` | Pipeline completo + paridade na mesma conversa |
| `Pipeline + paridade Adolescente + L3 bespoke + orquestrador: <subtópico>` | Bootstrap IDE + workers SDK — [`PROMPT_PIPELINE_PARIDADE_ORQUESTRADOR.md`](PROMPT_PIPELINE_PARIDADE_ORQUESTRADOR.md) |
| `Programa completo IDE: <subtópico>` | Capítulos no Agent até nota-10 **sem SDK** — [`PROMPT_PROGRAMA_COMPLETO_IDE.md`](PROMPT_PROGRAMA_COMPLETO_IDE.md) |
| `Pipeline completo: Língua Portuguesa — Crase (âncora Q506)` | Âncora golden-v1 Q506 + Elias M11 TE-simples; **parar antes de `--apply`** — [`PROMPT_PIPELINE_ANCORA_PT_CRASE_Q506.md`](PROMPT_PIPELINE_ANCORA_PT_CRASE_Q506.md) |

Pré-requisito de taxonomia (obrigatório antes da Fase 1):

```bash
npm run audit:subtopico-inventory -- --subtopico="<Nome canônico exato>"
npm run audit:taxonomy-gate -- --subtopico="<Nome canônico exato>"
```

Só prosseguir com `gate=pass` ou `gate=warn` + `handcraft_allowed=true`. Se `gate=block` → `Classify: <subtópico>` — [`TAXONOMIA_CONVERSA.md`](TAXONOMIA_CONVERSA.md). Catch-all (ex. `dtrans-mescladas-*`): [`TAXONOMIA_MODEL.md`](TAXONOMIA_MODEL.md) §6.

**Pré-requisito L3 (obrigatório antes da Fase 1 handcraft):** `Mapeamento L3: <subtópico>` com **Fase 3b** (brief 4/4 por ramo forte) — [`L3_MAPEAMENTO_CONVERSA.md`](L3_MAPEAMENTO_CONVERSA.md). Cauda longa (`ok_generico`) dispensa brief. Bypass só com `--skip-l3` documentado como emergência. Quick ref: [`RAMO_FORTE_QUICK_REF.md`](RAMO_FORTE_QUICK_REF.md).

**Pré-requisito âncoras (Fase 0.5 — agente na frente):** antes do `g01`, ramos `novo_ramo` precisam de golden em `examples/`.

```bash
npm run audit:golden-anchor-gate -- --subtopico="<Nome canônico exato>"
npm run anchor:brief -- --subtopico="<Nome canônico exato>"
```

Se `gate=block` → `Criar âncoras: <subtópico>` (skill [`avant-golden-anchor-bootstrap`](skills/avant-golden-anchor-bootstrap/SKILL.md)) → handcraft 1 JSON por ramo → re-rodar gate. Bypass só com `--skip-golden-anchor-gate` documentado como emergência. **Não** usar `FAMILY_GOLDEN_FILE` para fechar `novo_ramo`.

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
│ FASE 0.5 — Golden âncoras (agente na frente)                │
│   audit:golden-anchor-gate → Criar âncoras: se block        │
│   skill avant-golden-anchor-bootstrap → examples/ por ramo  │
│   GATE: gate=pass|warn + handcraft_allowed=true             │
└───────────────────────────┬─────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ FASE 1 — Handcraft (se handcraft_applied < total_slugs)      │
│   handcraft:brief → JSON/slug → readiness --strict-v2       │
│   → validate strict → preflight → dry-run → apply           │
│   (apply só se usuário: "pode aplicar")                     │
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

1. `npm run handcraft:brief -- --subtopico="<nome>"` — **obrigatório**; executar literalmente o bloco `## Pipeline (executar)` do briefing (`after_handcraft` do playbook substitui o bash genérico abaixo)
2. Descobrir próximo lote `gNN` ou continuar lote em aberto (ver HANDCRAFT § Descobrir próximo lote)
3. Por slug: `pedagogical_branch` + golden-v1 + readiness com pedagogy v2:
   ```bash
   npm run audit:questao-readiness -- --file=data/catalog-migration/<lote>/questions/<slug>.json --strict-v2-pedagogy
   ```
   Corrigir até `[READY]` antes de fechar o lote.
4. Piloto A4: 2–3 slugs em `/estudar/[slug]` antes do apply (HANDCRAFT § Piloto no player)
5. Por lote — **fallback genérico** (só se playbook sem `after_handcraft`):
   ```bash
   npm run validate:goldens -- --lote=<lote> --strict
   npm run audit:questao-readiness -- --lote=<lote> --strict-v2-pedagogy
   npm run catalog:preflight -- --lote=<lote> --strict-v2-pedagogy
   npm run catalog:apply-lote -- --lote=<lote> --dry-run
   # apply SOMENTE após o usuário escrever "pode aplicar":
   npm run catalog:apply-lote -- --lote=<lote> --apply
   ```
6. Pós-apply: atualizar `lote-meta.json` (`status: applied`), incrementar `handcraft_applied` no registry (HANDCRAFT § Pós-apply)
7. Repetir até `handcraft_applied === total_slugs`

**Checkpoint Fase 1** (reportar antes de Fase 2):

| Campo | Esperado |
|-------|----------|
| `status` | `applied` |
| `handcraft_applied` / `total_slugs` | 100% |
| `production_status` | ainda `none` (normal) |
| Readiness | `[READY]` com `--strict-v2-pedagogy` em todos os slugs |
| Piloto A4 | 2–3 slugs revisados no player por lote (recomendado) |

---

## Fase 2 — Qualidade vendável + `--promote` (detalhe)

Seguir Parte A de [`QUALITY_VENDAVEL_CONVERSA.md`](QUALITY_VENDAVEL_CONVERSA.md). Ordem **obrigatória**:

```bash
npm run reconcile:handcraft-manifest -- --subtopico="<nome canônico>"

# cada lote g* do pacote:
npm run catalog:preflight -- --lote=<pacote>-g01 --strict-v2-pedagogy

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

## Pacotes grandes (80+ slugs) — orquestrador / SDK

Não tente fechar 100–200 slugs num único chat. Use **uma unidade por run**:

```bash
npm run pipeline:next-unit -- --subtopico="<nome>"
npm run pipeline:orchestrate -- --subtopico="<nome>" --dry-run
# com CURSOR_API_KEY + @cursor/sdk:
npm run pipeline:orchestrate -- --subtopico="<nome>" --sdk --mode=handcraft --verify --max-units=1
```

Estado: `artifacts/pipeline-run-state-<pacote_prefix>.json` · doc: [`PIPELINE_ORCHESTRATOR.md`](PIPELINE_ORCHESTRATOR.md).

Handoff no chat IDE:

```text
Continuar pipeline: <Subtópico>
@artifacts/pipeline-run-state-<prefix>.json
```

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

Anexos obrigatórios:
@docs/RAMO_FORTE_QUICK_REF.md
@docs/L3_MAPEAMENTO_CONVERSA.md
@docs/PIPELINE_COMPLETO_CONVERSA.md
@data/catalog-migration/handcraft-registry.json
@.cursor/skills/brief-enfermagem/SKILL.md
@artifacts/l3-brief-FLAGSHIP-INDEX.md

FASE 1 — Handcraft (pular se já applied 100%):
- handcraft:brief obrigatório + executar after_handcraft do playbook
- JSON golden-v1 por slug (ordem v2: concept_map → logic_flow → golden_rule → danger_zone)
- concept_map sem gabarito; logic_flow com eliminação + letra; golden_rule sem row de gabarito
- audit:questao-readiness --strict-v2-pedagogy → [READY] por slug
- figures:audit --subtopico="..." → 0 missing (tirinha/charge/cartaz)
- validate:goldens --strict + catalog:preflight --strict-v2-pedagogy por lote
- piloto A4: 2–3 slugs no player antes do apply
- catalog:apply-lote --apply SOMENTE se eu escrever "pode aplicar"
- pós-apply: lote-meta + handcraft_applied no registry
- GATE: handcraft_applied === total_slugs

FASE 2 — Qualidade vendável (pacote inteiro):
1. reconcile:handcraft-manifest
2. catalog:preflight --strict-v2-pedagogy em todos g*
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
| Prompt expandido (barra Vias + Imunização + Adolescente) | [`PROMPT_PIPELINE_REFERENCIA_VIAS_IMUNIZACAO.md`](PROMPT_PIPELINE_REFERENCIA_VIAS_IMUNIZACAO.md) |
| Onda nota-10 Adolescente | [`artifacts/saude-adolescente-nota10-report.md`](../artifacts/saude-adolescente-nota10-report.md) · briefs L3 [`artifacts/l3-brief-saude-adolescente-INDEX.md`](../artifacts/l3-brief-saude-adolescente-INDEX.md) |
| Onda nota-10 Farmacodinâmica | [`artifacts/farmacodinamica-nota10-report.md`](../artifacts/farmacodinamica-nota10-report.md) · briefs L3 [`artifacts/l3-brief-farmacodinamica-e-farmacocinetica-INDEX.md`](../artifacts/l3-brief-farmacodinamica-e-farmacocinetica-INDEX.md) · README [`data/catalog-migration/farmacodinamica-e-farmacocinetica-completo/README.md`](../data/catalog-migration/farmacodinamica-e-farmacocinetica-completo/README.md) |
| Mapeamento L3 (antes de moldes) | `Mapeamento L3: <subtópico>` — [`L3_MAPEAMENTO_CONVERSA.md`](L3_MAPEAMENTO_CONVERSA.md) |
| Ordem slides v2 | [`PLAYBOOK_ESTUDO_REVERSO_PREMIUM.md`](PLAYBOOK_ESTUDO_REVERSO_PREMIUM.md) §2 · [`lib/reverseStudySlideOrder.ts`](../lib/reverseStudySlideOrder.ts) |
| Handcraft Fase 1 (detalhe) | [`HANDCRAFT_CONVERSA.md`](HANDCRAFT_CONVERSA.md) · [`docs/cursor/handcraft-conversa.mdc`](cursor/handcraft-conversa.mdc) |
| Rule Cursor | `.cursor/rules/pipeline-completo.mdc` |

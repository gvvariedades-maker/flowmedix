# Pipeline completo — handcraft + qualidade vendável (uma conversa)

Use em **conversa nova** (Agent mode) para fechar **um subtópico** de ponta a ponta:

```text
Pipeline completo: Enfermagem em Central de Material e Esterilização (CME)
```

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

Pré-requisito L3 (recomendado em subtópico novo ou sem cluster): `Mapeamento L3: <subtópico>` — [`L3_MAPEAMENTO_CONVERSA.md`](L3_MAPEAMENTO_CONVERSA.md).

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
| [`HANDCRAFT_CONVERSA.md`](HANDCRAFT_CONVERSA.md) | 1 |
| [`QUALITY_VENDAVEL_CONVERSA.md`](QUALITY_VENDAVEL_CONVERSA.md) | 2 |
| [`GOLDEN_HANDCRAFT_MODEL.md`](GOLDEN_HANDCRAFT_MODEL.md) | 1 |
| [`GOLDEN_CONTENT_STANDARD.md`](GOLDEN_CONTENT_STANDARD.md) | 1 |
| [`QUALITY_LAYERS_MODEL.md`](QUALITY_LAYERS_MODEL.md) | 2 |
| [`ANCHOR_SECOND_REVIEW_PROMPT.md`](ANCHOR_SECOND_REVIEW_PROMPT.md) | 2 (L6) |
| Skill `.cursor/skills/avant-json-template/SKILL.md` § L2.5+L3 | 1 |

---

## Fluxo (visão geral)

```text
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
- JSON golden-v1 por slug → audit:questao-readiness [READY]
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
| Mapeamento L3 (antes de moldes) | `Mapeamento L3: <subtópico>` — [`L3_MAPEAMENTO_CONVERSA.md`](L3_MAPEAMENTO_CONVERSA.md) |
| Rule Cursor | `.cursor/rules/pipeline-completo.mdc` |

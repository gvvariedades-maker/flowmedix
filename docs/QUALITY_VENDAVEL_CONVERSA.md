# Qualidade vendável — prompt de conversa

Use em **conversa nova** de uma destas formas:

```text
Qualidade vendável: Enfermagem em Central de Material e Esterilização (CME)
```

ou anexe este arquivo (`@docs/QUALITY_VENDAVEL_CONVERSA.md`) após editar **só** a linha abaixo:

```text
SUBTÓPICO: Enfermagem em Central de Material e Esterilização (CME)
```

**Decisão de produto:** 1º `--promote` = venda; monitoramento contínuo só pós-venda. Ver [`DECISAO_QUALITY_HIBRIDA.md`](DECISAO_QUALITY_HIBRIDA.md).

**Pré-requisito:** handcraft fechado (`status: applied`, `handcraft_applied === total_slugs`). Se ainda em produção, use `Handcraft: <subtópico>` — [`HANDCRAFT_CONVERSA.md`](HANDCRAFT_CONVERSA.md). Para **handcraft + qualidade + promote** numa conversa: [`PIPELINE_COMPLETO_CONVERSA.md`](PIPELINE_COMPLETO_CONVERSA.md).

---

## Instruções para o agente (não pedir confirmação — executar)

O usuário informou o subtópico. Resolver pacote em [`handcraft-registry.json`](../data/catalog-migration/handcraft-registry.json) (nome canônico `CLAUDE.md` §9).

### Proibido

- `npm run ai:generate` / `catalog:upgrade-premium`
- Segundo `audit:subtopico-quality --promote` rotineiro **após** `production_ready` (usar `audit:subtopico-health`)
- Declarar vendável sem gates L1–L6 + L5 PASS
- Inventar bypass de L3 sem `--skip-l3` documentado como emergência

### Ler antes de executar

| Arquivo | Quando |
|---------|--------|
| [`DECISAO_QUALITY_HIBRIDA.md`](DECISAO_QUALITY_HIBRIDA.md) | Sempre |
| [`QUALITY_LAYERS_MODEL.md`](QUALITY_LAYERS_MODEL.md) | Sempre |
| [`GOLDEN_HANDCRAFT_MODEL.md`](GOLDEN_HANDCRAFT_MODEL.md) §10b | Sempre |
| [`ANCHOR_SECOND_REVIEW_PROMPT.md`](ANCHOR_SECOND_REVIEW_PROMPT.md) | L6 por lote |
| [`CONTINUOUS_QUALITY_RUNBOOK.md`](CONTINUOUS_QUALITY_RUNBOOK.md) | Parte B (já vendável) |

---

## Parte A — Porta de venda (esta conversa)

Executar **nesta ordem** quando `production_status` ≠ `production_ready`:

### 1. Reconciliar manifest

```bash
npm run reconcile:handcraft-manifest -- --subtopico="<nome canônico>"
```

### 2. Preflight em todos os lotes `g*`

```bash
npm run catalog:preflight -- --lote=<pacote>-g01
# repetir para g02, g03, … até último lote aplicado
```

### 3. L1 — DoD + alignment + factcheck

```bash
npm run audit:handcraft-dod -- --subtopico="<nome canônico>"
npm run audit:slug-alignment -- --subtopico="<nome canônico>" --strict
npm run audit:numeric-factcheck -- --subtopico="<nome canônico>"
```

### 3b. L2c — Nota pedagógica (anti-spoiler)

O detector unificado roda dentro do `audit:subtopico-quality` (nada a chamar à parte). O leitor cego é opcional e entra por artefato:

```bash
npm run audit:blind-reader -- --catalog   # gera artifacts/blind-reader-gate.json
```

Gate: nenhum slug com nota `fail` (letra citada, veredito V/F abrindo o texto, polaridade invertida, `fail_leak` do leitor cego). Detalhe por slug no bloco `pedagogy` do artefato de ship. Ver [`QUALITY_LAYERS_MODEL.md`](QUALITY_LAYERS_MODEL.md) § L2c.

### 4. L6 — Segundo par de olhos na âncora

Para **cada** lote `g*`:

```bash
npm run audit:anchor-review -- --lote=<pacote>-gNN
```

Revisor B: preencher `anchor_second_review` em `lote-meta.json` conforme [`ANCHOR_SECOND_REVIEW_PROMPT.md`](ANCHOR_SECOND_REVIEW_PROMPT.md). Gate: `status === "pass"` em todos.

### 5. L3 — Regressão visual por molde

```bash
npx playwright test e2e/visual-mold-regression.spec.ts
```

Artefato esperado: `artifacts/visual-mold-regression/summary.json` (branches do pacote).

### 6. Ship — promote

```bash
npm run audit:subtopico-quality -- --subtopico="<nome canônico>" --promote
```

**Sucesso:** `production_status: production_ready` = **VENDÁVEL**; `continuous.enabled: true`.

**Falha parcial:** reportar `blockers[]` do artefato `artifacts/subtopico-quality/<pacote>.json`; se L1+L2+L2b OK, pode ter gravado `technical_ready_at` sem promover. `L2c` reprova sem tirar o `technical_ready`: é conteúdo para repair (F3), não defeito estrutural.

---

## Parte B — Baseline contínuo (se já `production_ready`)

Se o pacote **já** está vendável, pular Parte A e executar:

```bash
npm run audit:subtopico-health -- --subtopico="<nome canônico>"
```

Grava baseline em `artifacts/subtopico-health/<pacote>/` e atualiza `quality.continuous.*`.

---

## Pós-venda (outras conversas / dias)

| Ação | Comando |
|------|---------|
| Health diário | `audit:subtopico-health -- --subtopico="..."` |
| Após repair P0 | `audit:subtopico-health -- --subtopico="..." --recover` |
| Triagem reportes | [`RUNBOOK_ERROR_REPORT_TRIAGE.md`](RUNBOOK_ERROR_REPORT_TRIAGE.md) |
| Repair handcraft | JSON local → `audit:questao-readiness` → `catalog:apply-lote` |

**Proibido:** segundo `--promote` rotineiro.

---

## Critérios de encerramento da conversa

Reportar ao usuário:

| Campo | Valor esperado |
|-------|----------------|
| `production_status` | `production_ready` (Parte A) ou mantido + health PASS (Parte B) |
| `can_sell` | `true` |
| `quality.layers` | L1–L6 conforme audit |
| `quality.continuous.health_streak_days` | ≥ 1 após baseline |
| Artefatos | `subtopico-quality/<pacote>.json` e/ou `subtopico-health/<pacote>/latest.json` |

Se `blocked`: listar P0 stale, slugs em `repair_queue`, próximo passo (`--recover` após repair).

---

## Resumo executivo (copiar no chat)

```text
Qualidade vendável: <Subtópico canônico>

Parte A — Porta de venda (esta conversa):
1. reconcile:handcraft-manifest
2. catalog:preflight em todos lotes g*
3. audit:handcraft-dod + slug-alignment --strict + numeric-factcheck
4. audit:anchor-review + revisor B em cada g*
5. visual-mold-regression (branches do pacote)
6. audit:subtopico-quality -- --subtopico="..." --promote
   → production_ready = VENDÁVEL

Parte B — Baseline contínuo (se já production_ready):
7. audit:subtopico-health -- --subtopico="..."

Pós-venda (outras conversas/dias): só audit:subtopico-health; --recover após reparo.
Proibido: segundo --promote rotineiro.
```

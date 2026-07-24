# Pipeline orchestrator — multi-unidade + Cursor SDK

Orquestra handcraft / L3 / ship **uma unidade por run**, com estado no disco. Evita estouro de contexto em pacotes grandes (80–200+ slugs) e permite automação via `@cursor/sdk`.

**Não substitui** [`PIPELINE_COMPLETO_CONVERSA.md`](PIPELINE_COMPLETO_CONVERSA.md) nem [`PROMPT_PARIDADE_ADOLESCENTE_L3_BESPOKE.md`](PROMPT_PARIDADE_ADOLESCENTE_L3_BESPOKE.md): o prompt **grande** continua no bootstrap (L3 / paridade). Cada worker usa prompt **curto**.

**Programa IDE sem SDK (capítulos + handoff):** [`PROMPT_PROGRAMA_COMPLETO_IDE.md`](PROMPT_PROGRAMA_COMPLETO_IDE.md) · DoD [`PROGRAMA_COMPLETO_IDE_DOD.md`](PROGRAMA_COMPLETO_IDE_DOD.md)

**Programa unificado (paridade + L3 bespoke + SDK):** [`PROMPT_PIPELINE_PARIDADE_ORQUESTRADOR.md`](PROMPT_PIPELINE_PARIDADE_ORQUESTRADOR.md)

---

## Ideia

```text
pipeline:next-unit     → calcula next + grava run-state
pipeline:orchestrate   → imprime prompt (--dry-run) OU Agent.prompt (--sdk)
                         1 unidade → gates → atualiza run-state → STOP ou próxima (max-units)
```

| Peça | Path |
|------|------|
| Run-state schema | `lib/catalogMigration/pipelineRunState.ts` |
| Prompt worker | `lib/catalogMigration/pipelineWorkerPrompt.ts` |
| Orquestrador | `lib/catalogMigration/pipelineOrchestrator.ts` |
| Estado | `artifacts/pipeline-run-state-<pacote_prefix>.json` (+ `.md`) |

---

## Budget (anti-estouro)

| `total_slugs` | `max-units` default |
|---------------|---------------------|
| ≤20 | 4 |
| 21–80 | 2 |
| ≥81 | **1** |

Override: `--max-units=N`. Em pacote grande, **sempre 1** por invocação SDK.

---

## Tipos de unidade

| `type` | Quando |
|--------|--------|
| `bootstrap` | Pacote ausente no registry |
| `l3_map` | Falta `artifacts/l3-brief-<prefix>-INDEX.md` |
| `mold_branch` | Gap L3 com `molde_redesign` / `molde_inedito` pendente (modo `l3_bespoke` / `full`) |
| `handcraft_lote` | Lote aberto ou próximo `gNN` |
| `ship` | `applied === total` e ainda não `production_ready` |
| `done` / `blocked` | Terminal |

---

## Comandos

### 1. Próxima unidade (sem LLM)

```bash
npm run pipeline:next-unit -- --subtopico="Imunização"
npm run pipeline:next-unit -- --subtopico="Imunização" --print-prompt
npm run pipeline:next-unit -- --subtopico="Imunização" --mode=handcraft
npm run pipeline:next-unit -- --subtopico="Imunização" --unit=handcraft_lote:imunizacao-g03
```

### 2. Dry-run (prompt worker)

```bash
npm run pipeline:orchestrate -- --subtopico="Imunização" --dry-run
```

### 3. SDK (automático)

Pré-requisitos: `npm run pipeline:sdk-check` · setup: [`PIPELINE_SDK_SETUP.md`](PIPELINE_SDK_SETUP.md)

```bash
npm install @cursor/sdk --save-optional
# Dashboard Cursor → Integrations → API key → .env.local (ver docs/env.pipeline-sdk.example)
export CURSOR_API_KEY=cursor_...
# opcional:
export CURSOR_ORCHESTRATOR_MODEL=composer-2.5
```

Se `require('@cursor/sdk')` falhar com `@bufbuild/protobuf`, rode `npm install`.

```bash
# Uma unidade (recomendado em pacotes grandes)
npm run pipeline:orchestrate -- --subtopico="Imunização" --sdk --max-units=1

# Só handcraft, até 3 lotes, com verify de gates (sem apply)
npm run pipeline:orchestrate -- --subtopico="Imunização" --sdk --mode=handcraft --verify --max-units=3

# Apply após dry-run OK (cuidado — produção)
npm run pipeline:orchestrate -- --subtopico="..." --sdk --auto-apply --max-units=1
```

Exit codes:

| Code | Significado |
|-----:|-------------|
| 0 | OK / done / dry-run |
| 1 | Falha SDK, gate ou config |
| 2 | `blocked` |

---

## Prompt grande vs prompt worker

| Momento | Prompt |
|---------|--------|
| Conversa 1 — L3 / bootstrap | Prompt **completo** L3 bespoke + anexos |
| Cada `gNN` / molde / ship | Prompt **worker** gerado pelo orquestrador (~40 linhas + poucos `@`) |

Não cole o runbook inteiro em cada run SDK.

### Estudo ativo (PT / playbooks com `estudo_ativo`)

Se o playbook do pacote tiver `estudo_ativo.worker_checklist` (ex. Língua Portuguesa), o prompt de `handcraft_lote` **injeta** o checklist automaticamente — transferência classificável (`Sem crase:` / próclise…) para o quiz no player. O path do playbook vem de `handcraft_playbook` no registry (cards PT como Verbos compartilham `lingua-portuguesa.json`). Ver `lib/catalogMigration/pipelineWorkerPrompt.ts`.

Skills: TE → `professor-para-concurso`; PT → Elias / `professor-lingua-portuguesa-concurso` (ou `playbook.skills[]`).

---

## Fluxo recomendado (200 slugs)

```text
1. Chat IDE (1×): Mapeamento L3 + âncoras → INDEX briefs
2. Chat IDE ou SDK: L3 bespoke 1 ramo por run (--mode=l3_bespoke --max-units=1)
3. Loop local:
     npm run pipeline:orchestrate -- --subtopico="..." --sdk --mode=handcraft --verify --max-units=1
   (cron / while até next=ship|done; parar em exit≠0)
4. Chat IDE ou SDK: --mode=ship --max-units=1
5. Humano: A4 tier alto / calc / divergência (DECISAO_AUTO_APROVACAO_RISCO)
```

Pseudo-loop:

```bash
while true; do
  npm run pipeline:orchestrate -- --subtopico="$S" --sdk --mode=handcraft --verify --max-units=1 || break
  # se next_unit == ship|done → break (inspecionar run-state.json)
done
```

---

## Chat IDE — handoff

```text
Continuar pipeline: <Subtópico>
@artifacts/pipeline-run-state-<prefix>.json
```

O agente lê `next_unit`, executa **só** aquela unidade, roda `pipeline:next-unit`, STOP.

**Bootstrap programa completo (paridade + L3 + SDK):** [`PROMPT_PIPELINE_PARIDADE_ORQUESTRADOR.md`](PROMPT_PIPELINE_PARIDADE_ORQUESTRADOR.md)

---

## Segurança

- Default: **sem** `--auto-apply` (só dry-run no prompt worker).
- `CURSOR_API_KEY` opcional no app Next — só necessária para `--sdk`.
- `local.settingSources: []` no SDK (sem carregar settings ambientais).
- `--stop` implícito: fail → blockers no run-state → exit 1.

---

## Relação com paridade Adolescente

Para moldes React obrigatórios:

```bash
npm run pipeline:orchestrate -- --subtopico="..." --mode=l3_bespoke --sdk --max-units=1
```

Depois handcraft + ship. Relatório nota-10 continua manual/chat conforme [`PROMPT_PARIDADE_ADOLESCENTE_L3_BESPOKE.md`](PROMPT_PARIDADE_ADOLESCENTE_L3_BESPOKE.md).

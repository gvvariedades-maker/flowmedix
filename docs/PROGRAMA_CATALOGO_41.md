# Programa catálogo — 41 subtópicos (agente professor)

Runbook do **programa inteiro** para elevar ~5.180 questões ao padrão handcraft golden-v1 com alta absorção v2.

**Princípio:** `1 subtópico = 1 conversa Agent` — nunca os 41 numa única conversa.

Complementa:
- [`PIPELINE_COMPLETO_CONVERSA.md`](PIPELINE_COMPLETO_CONVERSA.md) — execução por subtópico
- [`GOLDEN_ROLLOUT_CATALOGO.md`](GOLDEN_ROLLOUT_CATALOGO.md) — programa golden-v1
- [`handcraft-registry.json`](../data/catalog-migration/handcraft-registry.json) — progresso

**Implementação:** [`lib/catalogMigration/pipelinePlaybook.ts`](../lib/catalogMigration/pipelinePlaybook.ts) · [`lib/catalogMigration/catalogProgramStatus.ts`](../lib/catalogMigration/catalogProgramStatus.ts)

---

## Diagrama

```text
PROGRAMA CATÁLOGO (41 subtópicos)
│
├── Pré-voo (1× por subtópico novo)
│     Classify → Mapeamento L3 → export → cluster → âncoras
│
├── Pipeline completo (1 conversa Agent por subtópico)
│     Fase 1 Handcraft → Fase 2 Vendável → (Fase 3 Health)
│
└── Pós-venda contínuo
      audit:subtopico-health (diário)
```

---

## Trigger recomendado (copiar na conversa)

```text
Pipeline completo: <Subtópico canônico — CLAUDE.md §9>

Anexos: @docs/PIPELINE_COMPLETO_CONVERSA.md @data/catalog-migration/handcraft-registry.json

Pré-executar (opcional):
npm run pipeline:brief -- --subtopico="<nome>"
npm run catalog:program-status
```

A rule [`.cursor/rules/pipeline-completo.mdc`](../.cursor/rules/pipeline-completo.mdc) expande persona professor + contrato v2 + `--strict-v2-pedagogy`.

---

## Comandos do programa

| Comando | Função |
|---------|--------|
| `npm run catalog:program-status` | Matriz 41 subtópicos → `artifacts/catalog-program-status.json` |
| `npm run pipeline:brief -- --subtopico="..."` | Briefing agente → `artifacts/pipeline-brief-*.md` |
| `npm run handcraft:brief -- --subtopico="..."` | Briefing só handcraft (Fase 1) |
| `npm run audit:questao-readiness -- --file=... --strict-v2-pedagogy` | Readiness com pedagogy v2 como **error** |
| `npm run catalog:preflight -- --lote=... --strict-v2-pedagogy` | Preflight lote com v2 strict |

---

## Ondas de rollout

| Onda | Subtópicos | Critério |
|------|------------|----------|
| **A** | Legado builder | `legacy_builder_subtopicos` no registry — re-handcraft obrigatório |
| **B** | Sem pacote no registry | Export + criar pacote + pipeline |
| **C** | Grandes volume | Imunização, Sinais Vitais, AB… — múltiplos `gNN` |
| **done** | `production_ready` | Health contínuo; repair pontual com `Slug:` |

Ver fila atual:

```bash
npm run catalog:program-status
```

---

## Fases por subtópico

### Fase 0 — Pré-voo

| Passo | Trigger |
|-------|---------|
| Taxonomia | `Classify: <subtópico>` |
| L3 | `Mapeamento L3: <subtópico>` |
| Export | `catalog:export-lote --subtopico="..."` |
| Cluster | `cluster:<pacote>` (se existir) |
| Âncora | 1 golden `examples/` por ramo pedagógico |

### Fase 1 — Handcraft

Ordem de escrita: `concept_map` → `logic_flow` → `golden_rule` → `danger_zone`

Gate por slug: `audit:questao-readiness --strict-v2-pedagogy` → `[READY]`

Gate por lote: `validate:goldens --strict` + `catalog:preflight --strict-v2-pedagogy`

Apply: **somente** após usuário escrever `pode aplicar`.

### Fase 2 — Vendável

[`QUALITY_VENDAVEL_CONVERSA.md`](QUALITY_VENDAVEL_CONVERSA.md) → `audit:subtopico-quality --promote`

### Fase 3 — Pós-venda

[`CONTINUOUS_QUALITY_RUNBOOK.md`](CONTINUOUS_QUALITY_RUNBOOK.md) → `audit:subtopico-health`

---

## Contrato pedagogy v2 (agente professor)

| Slide | Pergunta | Absorção |
|-------|----------|----------|
| `concept_map` | Qual o terreno? | Mapa mental |
| `logic_flow` | Como decido? | Tap = recall ativo |
| `golden_rule` | O que decoro? | Pós-raciocínio |
| `danger_zone` | Onde caio? | Contraste erro × certo |

Lints v2 (error com `--strict-v2-pedagogy`):
- `slide_layer_redundancy_golden_logic`
- `slide_layer_redundancy_concept_golden`
- `golden_rule_gabarito_spoiler`

---

## DoD catálogo 100%

- [ ] 41/41 subtópicos com `production_status: production_ready`
- [ ] 100% slugs `content_standard: golden-v1`
- [ ] Readiness `--strict-v2-pedagogy` PASS em handcraft novo
- [ ] L6 revisor B em todos os lotes promovidos

---

## Referências

| Trigger | Doc |
|---------|-----|
| `Pipeline completo:` | [`PIPELINE_COMPLETO_CONVERSA.md`](PIPELINE_COMPLETO_CONVERSA.md) |
| `Handcraft:` | [`HANDCRAFT_CONVERSA.md`](HANDCRAFT_CONVERSA.md) |
| `Qualidade vendável:` | [`QUALITY_VENDAVEL_CONVERSA.md`](QUALITY_VENDAVEL_CONVERSA.md) |
| `Classify:` | [`TAXONOMIA_CONVERSA.md`](TAXONOMIA_CONVERSA.md) |
| `Mapeamento L3:` | [`L3_MAPEAMENTO_CONVERSA.md`](L3_MAPEAMENTO_CONVERSA.md) |

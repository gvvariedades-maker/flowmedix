# Prompt — paridade Adolescente + L3 bespoke + orquestrador (programa completo)

Use em **conversa nova** (Agent mode) para fechar um subtópico com:

- **Paridade proporcional** Saúde do Adolescente (L2 + A4 + L6 + relatório nota-10)
- **L3 bespoke obrigatório** nos ramos fortes (React 4/4 — `VARIANT_MOLDS`)
- **Retenção visual** (`avant-neuroslides-visual` pós-brief)
- **Orquestrador** multi-unidade (`pipeline:next-unit` / `pipeline:orchestrate --sdk`)

> **Sem orquestrador (chat único, pacote pequeno):** [`PROMPT_PARIDADE_ADOLESCENTE_L3_BESPOKE.md`](PROMPT_PARIDADE_ADOLESCENTE_L3_BESPOKE.md)  
> **IDE capítulos até nota-10 (sem SDK):** [`PROMPT_PROGRAMA_COMPLETO_IDE.md`](PROMPT_PROGRAMA_COMPLETO_IDE.md)  
> **Só SDK / workers:** [`PIPELINE_ORCHESTRATOR.md`](PIPELINE_ORCHESTRATOR.md) · setup: [`PIPELINE_SDK_SETUP.md`](PIPELINE_SDK_SETUP.md)  
> **Pipeline base:** [`PIPELINE_COMPLETO_CONVERSA.md`](PIPELINE_COMPLETO_CONVERSA.md)

**Não** mistura polish de vitrine/dashboard — use conversa separada com `avant-ui-visual` (§ E).

---

## Como disparar

```text
Pipeline + paridade Adolescente + L3 bespoke + orquestrador: SUBTÓPICO: <Subtópico canônico>
```

Variantes:

| Trigger | Uso |
|---------|-----|
| `Pipeline + paridade Adolescente + L3 bespoke + orquestrador: <subtópico>` | Bootstrap IDE + programa SDK (este doc) |
| `Programa completo IDE: <subtópico>` | Capítulos no Agent Cursor **sem SDK** — [`PROMPT_PROGRAMA_COMPLETO_IDE.md`](PROMPT_PROGRAMA_COMPLETO_IDE.md) |
| `Continuar pipeline: <subtópico>` / `Continuar programa: <subtópico>` | Worker manual (1 unidade) — [`pipeline-orchestrator.mdc`](../.cursor/rules/pipeline-orchestrator.mdc) / [`programa-completo-ide.mdc`](../.cursor/rules/programa-completo-ide.mdc) |
| `Pipeline + paridade Adolescente + L3 bespoke: <subtópico>` | Sem orquestrador — [`PROMPT_PARIDADE_ADOLESCENTE_L3_BESPOKE.md`](PROMPT_PARIDADE_ADOLESCENTE_L3_BESPOKE.md) |

Substitua pelo nome **exato** de `CLAUDE.md` §9.

---

## O que este prompt **não** promete

| Expectativa | Realidade |
|-------------|-----------|
| Subtópico pronto em **um** chat IDE | **Não** — bootstrap IDE + N runs SDK |
| Zero ação sua | **Não** — loop terminal ou `Continuar pipeline:`; A4 humano quando ADR exige |
| UI vitrine/player shell | **Fora** — § E |

Qualidade ≈ manual **se** gates + workers respeitarem o runbook.

---

## Prompt completo (copiar no chat)

Edite **só** a linha `SUBTÓPICO:` e cole o bloco abaixo:

```text
Pipeline + paridade Adolescente + L3 bespoke + orquestrador: SUBTÓPICO: <Subtópico canônico>

MODO: Agent (bootstrap) + Cursor SDK (workers).
MODO L3: bespoke_obrigatorio_ramoforte
MODO EXECUÇÃO: multi-unidade via run-state (docs/PIPELINE_ORCHESTRATOR.md).
Objetivo de PROGRAMA: production_ready + paridade nota-10 + React 4/4 nos ramos fortes.
Objetivo DESTA conversa IDE: só bootstrap — L3 map + âncoras + 1º run-state. Depois STOP e SDK/workers.

════════════════════════════════════════
ESCOPO OBRIGATÓRIO (não pular)
════════════════════════════════════════

A) L3 + retenção visual (antes do g01)
   - Mapeamento L3 + briefs 4/4 (brief-enfermagem Modo B)
   - APÓS cada brief de ramo forte: avant-neuroslides-visual (checklist retenção 4/4)
     → gravar gesto/metáfora no brief; sem React ainda
   - audit:golden-anchor-gate → Criar âncoras se block
   - audit:l3-mold-gap → artifacts/l3-mold-gap-audit-<prefix>.*

B) React bespoke (VARIANT_MOLDS) — ramos fortes
   - Todo ramo com molde_redesign|molde_inedito: Implementar molde 4/4
     (NeuroSlide + moldAffinity + catálogo + Playwright desktop+mobile)
   - Orquestrador: type=mold_branch (1 ramo por run SDK)
   - PROIBIDO ship com molde pendente (salvo ok_generico com teste espacial 3/3 no brief)

C) Handcraft golden-v1
   - 1 lote gNN por run SDK (mode=handcraft)
   - readiness --strict-v2-pedagogy + validate + preflight
   - Apply: só --auto-apply no orchestrate OU "pode aplicar" no chat

D) Ship
   - visual-mold-regression PASS (moldes novos + âncoras)
   - L6 + --promote → production_ready
   - artifacts/<prefix>-nota10-report.md

E) UI do app (FORA do loop SDK de catálogo)
   - NÃO fazer vitrine/dashboard/player-shell neste programa de conteúdo
   - Só se eu abrir conversa: "Polish UI: <tela>" + avant-ui-visual
   - Exceção: bugs de layout_variant do molde NeuroSlide = parte de (B), não UI app

════════════════════════════════════════
ORQUESTRADOR (após bootstrap)
════════════════════════════════════════

COMEÇAR NESTA CONVERSA:
npm run pipeline:brief -- --subtopico="<Subtópico>"
npm run audit:golden-anchor-gate -- --subtopico="<Subtópico>"
npm run audit:l3-mold-gap -- --subtopico="<Subtópico>"
npm run pipeline:next-unit -- --subtopico="<Subtópico>" --mode=full --print-prompt
→ executar só next_unit se for bootstrap|l3_map
→ gravar run-state → ⛔ STOP

LOOP AUTOMÁTICO (terminal / CI — não neste chat):
# CURSOR_API_KEY em .env.local — docs/PIPELINE_SDK_SETUP.md
npm run pipeline:sdk-check
# moldes
npm run pipeline:orchestrate -- --subtopico="<Subtópico>" --sdk --mode=l3_bespoke --max-units=1
# repetir até next ≠ mold_branch
# handcraft
npm run pipeline:orchestrate -- --subtopico="<Subtópico>" --sdk --mode=handcraft --verify --max-units=1
# repetir até next=ship|done
# ship
npm run pipeline:orchestrate -- --subtopico="<Subtópico>" --sdk --mode=ship --max-units=1

Budget: ≥81 slugs → sempre --max-units=1.
Fail → blockers no run-state → parar (não pular lote).

════════════════════════════════════════
ANEXOS
════════════════════════════════════════
@docs/PROMPT_PIPELINE_PARIDADE_ORQUESTRADOR.md
@docs/PIPELINE_ORCHESTRATOR.md
@docs/PIPELINE_SDK_SETUP.md
@docs/PROMPT_PARIDADE_ADOLESCENTE_L3_BESPOKE.md
@docs/PROMPT_PARIDADE_ADOLESCENTE.md
@docs/PIPELINE_COMPLETO_CONVERSA.md
@docs/L3_MAPEAMENTO_CONVERSA.md
@docs/PROMPT_VARIANTES_NEUROSLIDES.md
@docs/VARIANT_MOLDS.md
@docs/MOLD_AFFINITY_RESOLVER.md
@docs/RAMO_FORTE_QUICK_REF.md
@docs/QUALITY_LAYERS_MODEL.md
@docs/PROTOCOLO_A4_MINIMO_ADOLESCENTE.md
@artifacts/saude-adolescente-nota10-report.md
@data/catalog-migration/handcraft-registry.json
@.cursor/skills/brief-enfermagem/SKILL.md
@.cursor/skills/avant-neuroslides-visual/SKILL.md
@.cursor/skills/avant-golden-anchor-bootstrap/SKILL.md
@.cursor/skills/avant-golden-anchor-handcraft/SKILL.md
@.cursor/skills/avant-json-template/SKILL.md
@.cursor/skills/professor-para-concurso/SKILL.md

NÃO anexar avant-ui-visual aqui (UI app = conversa separada).

════════════════════════════════════════
CONTRATO ANTI-ESTOURO
════════════════════════════════════════
- 1 unidade por conversa IDE / por Agent.prompt
- Prompt grande só no bootstrap; workers = pipeline:orchestrate --print-prompt / --sdk
- Após unidade: pipeline:next-unit → STOP

CHECKLIST PARIDADE (encerramento do programa — não desta conversa IDE):
| applied | bespoke 4/4 ramos fortes | ok_generico 3/3 | A4 100% | A4 humano | Playwright | L6+captures | apply | production_ready | paridade | blockers |
Path: artifacts/<pacote_prefix>-nota10-report.md
```

---

## Fases × orquestrador

| Fase | Conteúdo | Unidade `next_unit` | Quem executa |
|------|----------|---------------------|--------------|
| Bootstrap | brief, anchor-gate, gap, INDEX L3 | `l3_map` / `bootstrap` | Chat IDE (esta conversa) |
| 0b | React 4/4 por ramo | `mold_branch` | SDK `--mode=l3_bespoke` |
| 1 | Handcraft gNN | `handcraft_lote` | SDK `--mode=handcraft --verify` |
| 1b | A4-mínimo | (dentro do lote / ship) | Worker + [`PROTOCOLO_A4_MINIMO_ADOLESCENTE.md`](PROTOCOLO_A4_MINIMO_ADOLESCENTE.md) |
| 2 | L6, Playwright, promote | `ship` | SDK `--mode=ship` |

Run-state: `artifacts/pipeline-run-state-<pacote_prefix>.json`

---

## Fluxo recomendado

```text
Conversa 1 (IDE): Pipeline + paridade Adolescente + L3 bespoke + orquestrador: <Subtópico>
                  → bootstrap + STOP

Terminal:         pipeline:sdk-check
                  loop l3_bespoke → handcraft → ship (max-units=1)

Opcional IDE:     Continuar pipeline: <Subtópico> + @artifacts/pipeline-run-state-*.json
                  (1 unidade manual, sem SDK)
```

Pacote **≤20 slugs:** pode tentar mais unidades por run (`--max-units=4` no orchestrate).  
Pacote **≥81 slugs:** **sempre** `--max-units=1`.

---

## Referências cruzadas

| Doc | Papel |
|-----|--------|
| [`PROMPT_PROGRAMA_COMPLETO_IDE.md`](PROMPT_PROGRAMA_COMPLETO_IDE.md) | Capítulos IDE até nota-10 **sem SDK** |
| [`PROGRAMA_COMPLETO_IDE_DOD.md`](PROGRAMA_COMPLETO_IDE_DOD.md) | Aceite por capítulo + ship |
| [`PROMPT_PARIDADE_ADOLESCENTE_L3_BESPOKE.md`](PROMPT_PARIDADE_ADOLESCENTE_L3_BESPOKE.md) | Checklist paridade + L3 sem orquestrador |
| [`PIPELINE_ORCHESTRATOR.md`](PIPELINE_ORCHESTRATOR.md) | Unidades, budget, CLI |
| [`PIPELINE_SDK_SETUP.md`](PIPELINE_SDK_SETUP.md) | `CURSOR_API_KEY`, `pipeline:sdk-check` |
| [`HANDCRAFT_CONVERSA.md`](HANDCRAFT_CONVERSA.md) | Fase 1 handcraft |
| [`QUALITY_VENDAVEL_CONVERSA.md`](QUALITY_VENDAVEL_CONVERSA.md) | Fase 2 ship |

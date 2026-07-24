# Prompt — Programa completo IDE (sem SDK)

Use em **conversa nova** (Agent mode) para levar um subtópico do **zero** até **`production_ready` + nota-10** (conteúdo **e** visual), **só com o agente Cursor no IDE** — sem `pipeline:orchestrate --sdk` / `@cursor/sdk`.

> **Com SDK (loop terminal):** [`PROMPT_PIPELINE_PARIDADE_ORQUESTRADOR.md`](PROMPT_PIPELINE_PARIDADE_ORQUESTRADOR.md)  
> **Paridade + L3 numa conversa (pacote pequeno):** [`PROMPT_PARIDADE_ADOLESCENTE_L3_BESPOKE.md`](PROMPT_PARIDADE_ADOLESCENTE_L3_BESPOKE.md)  
> **DoD / aceite:** [`PROGRAMA_COMPLETO_IDE_DOD.md`](PROGRAMA_COMPLETO_IDE_DOD.md)  
> **Estado:** `npm run pipeline:next-unit` · [`PIPELINE_ORCHESTRATOR.md`](PIPELINE_ORCHESTRATOR.md) (só run-state; ignore a seção SDK)

---

## Ideia de engenharia

| Peça | Papel |
|------|--------|
| Prompt mestre | Protocolo: capítulos, STOP, handoff, proibições |
| Run-state no disco | Máquina de estados (`artifacts/pipeline-run-state-<prefix>.json`) |
| Playbook do registry | DNA: skills, ramos L3, `estudo_ativo`, âncoras |
| Gates npm | Definition of Done executável (não “parece pronto”) |
| 1 conversa = 1 capítulo (ou 1 gNN) | Anti-estouro de contexto **sem** API SDK |

**Não** misture polish de vitrine/dashboard — conversa separada com `avant-ui-visual`.

---

## Como disparar

```text
Programa completo IDE: SUBTÓPICO: <Subtópico canônico>
```

Variantes:

| Trigger | Uso |
|---------|-----|
| `Programa completo IDE: <subtópico>` | Capítulos até nota-10 (este doc) |
| `Continuar programa: <subtópico>` | Próximo capítulo — mesmo contrato + `@artifacts/pipeline-run-state-*.json` |
| `Continuar pipeline: <subtópico>` | Alias aceito (mesmo run-state) — [`pipeline-orchestrator.mdc`](../.cursor/rules/pipeline-orchestrator.mdc) |

Substitua pelo nome **exato** de `CLAUDE.md` §9 (ou card PT canônico, ex. `Verbos — tempos, modos e vozes`).

---

## O que este prompt **não** promete

| Expectativa | Realidade |
|-------------|-----------|
| Pacote grande 100% em **um** chat | **Não** — capítulos + handoff |
| Zero ação sua | **Não** — colar handoff; A4 humano quando ADR exigir; `"pode aplicar"` |
| UI vitrine/player shell | **Fora** |

Qualidade ≈ barra Adolescente/Crase **se** DNA (brief + âncora + playbook) fechar antes da fábrica de gNN.

---

## Política de tamanho (SLA de contexto)

| `total_slugs` | Cap 4 (handcraft) nesta conversa |
|---------------|----------------------------------|
| ≤16 | Pode fechar todos os gNN se gates OK (ainda grava run-state) |
| 17–40 | Até **2** gNN por conversa |
| ≥41 | **Sempre 1** gNN por conversa |

Caps 0–3 e 5–6: **um capítulo por conversa** (exceto pacote ≤16 com autorização explícita `fechar tudo nesta conversa`).

---

## Prompt completo (copiar no chat)

Edite **só** a linha `SUBTÓPICO:` e cole:

```text
Programa completo IDE: SUBTÓPICO: <Subtópico canônico>

MODO: Agent Cursor — capítulos sequenciais; SEM pipeline:orchestrate --sdk.
OBJETIVO DE PROGRAMA: applied 100% + production_ready + nota-10 (conteúdo E visual).
OBJETIVO DESTA CONVERSA: executar SOMENTE o next_unit do run-state; gates do capítulo; STOP + handoff.

════════════════════════════════════════
FONTE DE VERDADE
════════════════════════════════════════
- @data/catalog-migration/handcraft-registry.json
- Playbook em handcraft_playbook do pacote (NÃO inventar path por pacote_prefix)
- @docs/PROGRAMA_COMPLETO_IDE_DOD.md
- @artifacts/pipeline-run-state-<pacote_prefix>.json (criar/atualizar)
- Skills = playbook.skills[] quando existir; senão inferir TE vs PT pelo playbook/disciplina

════════════════════════════════════════
DNA ANTES DA FÁBRICA (inviolável)
════════════════════════════════════════
Brief 4/4 + avant-neuroslides-visual → âncora READY → só então gNN.
PROIBIDO handcraft em massa sem audit:golden-anchor-gate PASS (ou âncoras READY documentadas).

════════════════════════════════════════
CAPÍTULOS (= next_unit)
════════════════════════════════════════
0 bootstrap     — taxonomy / export / registry se necessário
1 l3_map        — cluster + briefs INDEX + neuroslides-visual pós-brief + mold-gap
2 (âncoras)     — Criar âncoras se gate block; study_ativo se playbook tiver
3 mold_branch   — React 4/4 só ramos molde_redesign|molde_inedito (1 ramo / conversa)
4 handcraft_lote — 1 gNN (ver política de tamanho); readiness+validate+preflight+dry-run
5 (A4)          — stamp A4-mínimo se pacote no registry de onda
6 ship          — L6 + Playwright + --promote + artifacts/<prefix>-nota10-report.md

COMEÇAR NESTA CONVERSA:
npm run pipeline:brief -- --subtopico="<Subtópico>"
npm run pipeline:next-unit -- --subtopico="<Subtópico>" --mode=full --print-prompt
→ executar só next_unit
→ gates do capítulo (PROGRAMA_COMPLETO_IDE_DOD.md)
→ atualizar run-state + trecho do nota10-report
→ ⛔ STOP com bloco HANDOFF (exceto ≤16 + "fechar tudo nesta conversa")

HANDOFF (obrigatório ao parar):
## Handoff
Capítulo: <type:id>
Próximo: Continuar programa: <Subtópico>
@artifacts/pipeline-run-state-<prefix>.json
Aceite que passou: <comando>
Blockers: nenhum | …

════════════════════════════════════════
ANEXOS
════════════════════════════════════════
@docs/PROMPT_PROGRAMA_COMPLETO_IDE.md
@docs/PROGRAMA_COMPLETO_IDE_DOD.md
@docs/PROMPT_PARIDADE_ADOLESCENTE_L3_BESPOKE.md
@docs/PROMPT_PARIDADE_ADOLESCENTE.md
@docs/PIPELINE_COMPLETO_CONVERSA.md
@docs/L3_MAPEAMENTO_CONVERSA.md
@docs/PROMPT_VARIANTES_NEUROSLIDES.md
@docs/VARIANT_MOLDS.md
@docs/MOLD_AFFINITY_RESOLVER.md
@docs/RAMO_FORTE_QUICK_REF.md
@docs/QUALITY_LAYERS_MODEL.md
@docs/GOLDEN_HANDCRAFT_MODEL.md
@docs/GOLDEN_CONTENT_STANDARD.md
@docs/PROTOCOLO_A4_MINIMO_ADOLESCENTE.md
@artifacts/saude-adolescente-nota10-report.md
@docs/_TEMPLATE-nota10-report.md
@data/catalog-migration/handcraft-registry.json
@.cursor/skills/avant-neuroslides-visual/SKILL.md
@.cursor/skills/avant-golden-anchor-bootstrap/SKILL.md
@.cursor/skills/avant-golden-anchor-handcraft/SKILL.md
@.cursor/skills/avant-json-template/SKILL.md

TE (enfermagem) — anexar também:
@.cursor/skills/brief-enfermagem/SKILL.md
@.cursor/skills/professor-para-concurso/SKILL.md

PT (Língua Portuguesa / cards) — anexar em VEZ dos TE:
@data/catalog-migration/handcraft-playbooks/lingua-portuguesa.json
@.cursor/skills/brief-lingua-portuguesa/SKILL.md
@.cursor/skills/professor-elias-santana-metodo/SKILL.md
@.cursor/skills/professor-lingua-portuguesa-concurso/SKILL.md

NÃO anexar avant-ui-visual. NÃO usar pipeline:orchestrate --sdk.

════════════════════════════════════════
PROIBIDO
════════════════════════════════════════
- pipeline:orchestrate --sdk / Agent.prompt via CURSOR_API_KEY neste programa
- ai:generate / catalog:upgrade-premium
- handcraft sem âncora READY / gate âncoras block
- ship com molde_inedito|molde_redesign pendente (ramo forte)
- declarar 100%/nota-10 sem production_ready + relatório DoD verde
- apply sem dry-run 100% OK e sem "pode aplicar" (exceto prompt que autorize apply explícito)
- professor-para-concurso / brief-enfermagem em pacote PT
- brief-lingua / Elias em pacote TE

════════════════════════════════════════
ENCERRAMENTO DO PROGRAMA (última conversa — ship)
════════════════════════════════════════
Tabela DoD + path artifacts/<pacote_prefix>-nota10-report.md
| applied | bespoke 4/4 | ok_generico 3/3 | A4 | Playwright | L6 | production_ready | conteúdo | visual | blockers |
```

---

## Fluxo recomendado

```text
Conversa 1: Programa completo IDE: <Subtópico>     → Cap 0–1 (bootstrap + L3)
Conversa 2: Continuar programa: <Subtópico>      → âncoras (+ moldes se houver)
Conversa 3..N: Continuar programa: …             → gNN (1 ou 2 por chat)
Conversa final: Continuar programa: …            → A4 + ship + nota10-report
```

Pacote ≤16: pode pedir `fechar tudo nesta conversa` após Cap 1+âncoras READY.

---

## Relação com outros prompts

| Quer… | Use |
|-------|-----|
| IDE capítulos, sem SDK, até nota-10 | **Este doc** |
| Bootstrap + loop terminal SDK | [`PROMPT_PIPELINE_PARIDADE_ORQUESTRADOR.md`](PROMPT_PIPELINE_PARIDADE_ORQUESTRADOR.md) |
| Só handcraft | [`HANDCRAFT_CONVERSA.md`](HANDCRAFT_CONVERSA.md) |
| Só qualidade (já applied) | [`QUALITY_VENDAVEL_CONVERSA.md`](QUALITY_VENDAVEL_CONVERSA.md) |
| Só mapeamento L3 | [`L3_MAPEAMENTO_CONVERSA.md`](L3_MAPEAMENTO_CONVERSA.md) |

---

## Referências

| Doc | Uso |
|-----|-----|
| [`PROGRAMA_COMPLETO_IDE_DOD.md`](PROGRAMA_COMPLETO_IDE_DOD.md) | Aceite por capítulo + ship |
| [`PIPELINE_ORCHESTRATOR.md`](PIPELINE_ORCHESTRATOR.md) | `next-unit` / run-state (sem SDK) |
| [`PROMPT_PARIDADE_ADOLESCENTE_L3_BESPOKE.md`](PROMPT_PARIDADE_ADOLESCENTE_L3_BESPOKE.md) | Checklist paridade / bespoke |
| Rule | [`.cursor/rules/programa-completo-ide.mdc`](../.cursor/rules/programa-completo-ide.mdc) |
| Template relatório | [`_TEMPLATE-nota10-report.md`](_TEMPLATE-nota10-report.md) |

# Prompt — Âncoras 100% premium (base do catálogo)

Use em **conversa nova** (Agent mode) para deixar **todas as âncoras de todos os ramos L3** de **um** subtópico no nível premium máximo (pedagogia golden-v1 + visual Glance OS / barra G2).

> **Fechamento só via gate:** `npm run audit:anchor-100` com `approval.status=pass`.  
> **Não** declarar “aprovado” / “100%” só no chat.

> **Política de produto (pré-venda):** priorizar a **base** (playbook + mapa + âncoras). **Não** iniciar handcraft em massa (`gNN`) nesta conversa, salvo pedido explícito.

**Relação com outros trilhos:**

| Trilho | Quando |
|--------|--------|
| [`L3_MAPEAMENTO_CONVERSA.md`](L3_MAPEAMENTO_CONVERSA.md) | Pacote novo / ramos sem brief — conversa **antes** ou Fase 0a desta |
| `Criar âncoras:` (bootstrap) | Só **criar** goldens faltantes pré-g01 — este prompt **eleva** ao 100% |
| [`PROMPT_COMPOSER_VISUAL.md`](PROMPT_COMPOSER_VISUAL.md) · banco [`composer-visual-bank.md`](../artifacts/composer-visual-bank.md) | **Orquestrador visual** na Fase 1C′ — preferido se preview abaixo do piso G2 / gallery `pending`/`thin` |
| [`NEUROSLIDES_ATELIER_KIT.md`](NEUROSLIDES_ATELIER_KIT.md) · [`PROMPT_ATELIER_VISUAL.md`](PROMPT_ATELIER_VISUAL.md) | Crítica glanceable isolada (`Crítica atelier:` / `Atelier visual:`) — Composer já inclui a crítica |
| [`PROMPT_FABRICA_VISUAL_G2.md`](PROMPT_FABRICA_VISUAL_G2.md) | Depois das âncoras aprovadas (ou se molde bloquear preview); Composer **precede** se gallery thin |
| `Handcraft:` / Pipeline | **Depois** que o subtópico tiver âncoras 100% aprovadas |

**Referência fechada:** piloto Glance OS Farmacodinâmica — `artifacts/glance-os-piloto-farmacodinamica-INDEX.md` (3/3 ramos).

**Rule Cursor:** [`.cursor/rules/ancoras-100.mdc`](../.cursor/rules/ancoras-100.mdc) · cópia [`docs/cursor/ancoras-100.mdc`](cursor/ancoras-100.mdc)

---

## Como disparar

```text
Âncoras 100%: <Subtópico canônico>
```

Ou forma longa:

```text
Âncoras 100% premium: SUBTÓPICO: <Subtópico canônico>
```

**1 subtópico = 1 conversa.** Não misturar outro pacote.

---

## Ordem de execução (obrigatória)

```text
Fase 0a  Playbook + mapa de gestos / L3 (+ cruzar banco Composer)  ★ ANTES de editar âncora
    ↓
Fase 0b  Inventário 1 âncora / ramo (tabela no chat)
    ↓
Fase 1   Por âncora: polish → audit:anchor-100
         → [se visual thin/FAIL] Composer visual: <branch>
         → preview → --require-visual → assinar → próximo
    ↓
Fase 2   Report artifacts/<pacote>-ancoras-100-report.md
```

**Começar sempre na Fase 0a.** Proibido editar JSON de âncora antes das tabelas 0a e 0b estarem no chat.

---

## Anexos recomendados

```text
@docs/PROMPT_ANCORAS_100.md
@docs/ANCHOR_CHECKLIST_100.md
@docs/GOLDEN_CONTENT_STANDARD.md
@docs/GOLDEN_HANDCRAFT_MODEL.md
@docs/NEUROSLIDES_VISUAL_BAR.md
@docs/DECISAO_NEUROSLIDES_GERACAO_2.md
@docs/PROMPT_COMPOSER_VISUAL.md
@artifacts/composer-visual-bank.md
@docs/NEUROSLIDES_ATELIER_KIT.md
@docs/PROMPT_ATELIER_VISUAL.md
@docs/L3_MAPEAMENTO_CONVERSA.md
@data/catalog-migration/handcraft-registry.json
@data/catalog-migration/visual-anchors.json
@data/catalog-migration/handcraft-playbooks/<pacote>.json
@.cursor/skills/avant-golden-anchor-bootstrap/SKILL.md
@.cursor/skills/avant-golden-anchor-handcraft/SKILL.md
@.cursor/skills/avant-json-template/SKILL.md
@.cursor/skills/avant-neuroslides-visual/SKILL.md
@.cursor/skills/professor-para-concurso/SKILL.md
@.cursor/skills/brief-enfermagem/SKILL.md
@examples/_TEMPLATE-golden-v1.json
```

Por pacote (quando existir):

```text
@artifacts/l3-brief-<pacote>-*.md
@artifacts/glance-os-<pacote>-MAPA-8-GESTOS.md
@artifacts/glance-os-piloto-*-INDEX.md
```

---

## Prompt completo (copiar no chat)

Edite **só** a linha `SUBTÓPICO:` e cole:

```text
Âncoras 100% premium: SUBTÓPICO: <Subtópico canônico CLAUDE.md §9>

Modo: Agent · 1 subtópico por conversa · âncoras first (sem handcraft em massa)
Objetivo: TODAS as âncoras de TODOS os ramos L3 em premium máximo
         (golden-v1 + Glance OS / barra G2).
Fechamento: só via `npm run audit:anchor-100` com approval.status=pass
         — NÃO declarar “aprovado” / “100%” só no chat.

Anexos:
@docs/PROMPT_ANCORAS_100.md
@docs/ANCHOR_CHECKLIST_100.md
@docs/GOLDEN_CONTENT_STANDARD.md
@docs/GOLDEN_HANDCRAFT_MODEL.md
@docs/NEUROSLIDES_VISUAL_BAR.md
@docs/DECISAO_NEUROSLIDES_GERACAO_2.md
@docs/PROMPT_COMPOSER_VISUAL.md
@artifacts/composer-visual-bank.md
@docs/NEUROSLIDES_ATELIER_KIT.md
@docs/PROMPT_ATELIER_VISUAL.md
@docs/L3_MAPEAMENTO_CONVERSA.md
@data/catalog-migration/handcraft-registry.json
@data/catalog-migration/visual-anchors.json
@data/catalog-migration/handcraft-playbooks/<pacote>.json
@.cursor/skills/avant-golden-anchor-bootstrap/SKILL.md
@.cursor/skills/avant-golden-anchor-handcraft/SKILL.md
@.cursor/skills/avant-json-template/SKILL.md
@.cursor/skills/avant-neuroslides-visual/SKILL.md
@.cursor/skills/professor-para-concurso/SKILL.md
@.cursor/skills/brief-enfermagem/SKILL.md
@examples/_TEMPLATE-golden-v1.json

Piso visual: artifacts/neuroslides-g2-demo.html
Composer: @docs/PROMPT_COMPOSER_VISUAL.md · banco @artifacts/composer-visual-bank.md
Kit ouro: @docs/NEUROSLIDES_ATELIER_KIT.md
Referência: Farmacodinâmica Glance OS 3/3 (VF + clínico + genérico)

---

POLÍTICA

FAZER:
- Fase 0a: playbook + mapa de gestos / L3 (+ cruzar gesture_id com banco Composer) ANTES de editar âncora
- Fase 0b: inventário 1 âncora por ramo (tabela no chat)
- Por âncora: polish → audit:anchor-100 → [se visual thin/FAIL] Composer visual: <branch_id>
  → preview → --require-visual → assinar → próximo ramo
- Se elevou ouro do gesto: atualizar visual_gallery + no máx. 1 path no banco (≤2 âncoras/gesto)
- Atualizar visual-anchors.json + playbook + report do pacote

NÃO FAZER:
- Handcraft em massa / gNN / apply Supabase / --promote
- ai:generate / catalog:upgrade-premium
- Commit/push sem pedido explícito
- Editar âncora antes da tabela 0a/0b
- Declarar 100% sem audit:anchor-100 com approval.status=pass
- Writer auto-assinar no mesmo turno sem --sign-agent / artefato
- Pular humano quando verdict=human_required (risco alto)
- Indexar PNG de feed / Instagram na visual_gallery ou no banco Composer
- Abrir Composer em todo ramo se preview já está no piso G2 e gallery ready (só polish leve)

---

CONTRATO DE APROVAÇÃO (obrigatório)

Writer eleva JSON → roda gates → NÃO escreve “aprovado” no chat.

Por âncora:
1. npm run audit:anchor-100 -- --file=<path>
   → gates_pass + artifacts/anchor-checklist/<slug>.json
2. Preview: /dev/slide-mold-review?branch=<branch_id>
   Se preview abaixo do piso G2 OU visual_gallery pending/thin/ausente:
     Composer visual: <branch_id>
     → ATELIER_PASS (banco → Modo V → crítica)
     → Modo A JSON e/ou Implementar molde: só se gesto novo ou ≥5 sem board
     → capture / Salvar visual_gallery se elevou
   Se só crítica pontual: Crítica atelier: (sem reabrir pipeline completo)
3. Fechar visual: npm run audit:anchor-100 -- --file=<path> --require-visual
4. Assinatura:
   - risco baixo/médio + agent_may_sign:
     npm run audit:anchor-100 -- --file=<path> --sign-agent --write-meta
   - risco alto / human_required:
     PARAR → humano: --sign-human=<Nome> --write-meta
5. Avançar ramo só com approval.status=pass (meta ou artefato)

DoD âncora = gates_pass + --require-visual + approval.status=pass
DoD subtópico = todas as âncoras pass + report artifacts/<pacote>-ancoras-100-report.md

---

ORDEM
Fase 0a (playbook + gestos + banco) → 0b (inventário)
→ Fase 1 (âncora: polish → gates → Composer se preciso → preview → assinar)
→ Fase 2 (report)

Começar: Fase 0a. Não editar âncora antes da tabela de ramos.
```

---

## Detalhe das fases (agente)

### Fase 0a — Playbook + mapa ★

1. Abrir ou criar `data/catalog-migration/handcraft-playbooks/<pacote>.json`.
2. Publicar no chat a tabela completa de `pedagogical_branches[]`:

   | id | when | gesture | mold 4/4 | anchors[] |

3. Mapa de gestos (EXCETO / TRILHO / PROTOCOLO / VF / PEGADINHA / …):
   - Se não existir: criar `artifacts/glance-os-<pacote>-MAPA-8-GESTOS.md` (ou seção no playbook).
   - Anti-gesto errado (não forçar ADME/EV se a prova não pedir).
   - Cruzar com [`NEUROSLIDES_ATELIER_KIT.md`](NEUROSLIDES_ATELIER_KIT.md) (8 gestos ouro) **e** [`artifacts/composer-visual-bank.md`](../artifacts/composer-visual-bank.md) (`gesture_id` · status gold/thin/gap).
4. Brief L3 4/4 por ramo forte se `molde_redesign` e ainda não houver brief (`brief-enfermagem` / Mapeamento L3).
5. Moldes: se Glance OS exige molde abaixo da barra, anotar gap (wrap/polish/bespoke) — na Fase 1 preferir `Composer visual:` antes de assinar visual no preview errado.
6. **GATE 0a:** playbook + gestos revisados (+ linhas do banco Composer relevantes); tabela no chat → só então Fase 0b.

Comando útil: `npm run handcraft:brief -- --subtopico="..."`.

### Fase 0b — Inventário

Para cada ramo da 0a:

| branch_id | gesto | âncora path | molde 4/4 | status | ação |

`status` ∈ `missing` | `drift_ramo` | `spoiler` | `below_bar` | `ready_pending_sign` | `approved`

- `missing` → bootstrap (`avant-golden-anchor-bootstrap`) + registrar em `visual-anchors.json`
- **Não** polish fino até a tabela 0b estar no chat

### Fase 1 — Por âncora (sequencial)

Ordem: ramos fortes → genérico/cauda.

| Passo | Ação |
|------:|------|
| A | `meta.family` + `pedagogical_branch` corretos |
| B | Polish (golden-anchor-handcraft + professor + json-template): golden-v1; ordem v2; CM/GR sem spoiler; LF com gabarito; DZ `correct` único; sources A/B; sem `template`/`layout_variant` salvo override |
| C | `npm run audit:anchor-100 -- --file=<path>` → `gates_pass` + `artifacts/anchor-checklist/<slug>.json` |
| C′ | **Composer visual** (preferido): se preview abaixo do piso G2 **ou** `visual_gallery` `pending`/`thin`/ausente → `Composer visual: <branch_id>` → `ATELIER_PASS` → Modo A e/ou `Implementar molde:` (só gesto novo / ≥5 sem board). Se gallery já `ready` e preview PASS → pular Composer. Só crítica: `Crítica atelier:` |
| D | Preview `/dev/slide-mold-review?branch=<branch_id>` · barra G2 · `--require-visual` ao fechar |
| E | Revisor B se `teach_once`/`gesture` duvidosos: `--reviewer-file=artifacts/anchor-reviewer-b-<slug>.json` |
| F | Assinatura conforme contrato (agent ou human) — avançar só com `approval.status=pass` |
| G | Atualizar `visual-anchors.json` + playbook (`ancora_100` / `visual_gallery`); se elevou ouro do gesto → no máx. 1 path no banco Composer (≤2 âncoras/gesto) |

### Fase 2 — Fechamento do subtópico

Só quando **todas** as âncoras tiverem `approval.status=pass`:

1. Tabela final | branch | path | gates | visual | approval |
2. `artifacts/<pacote_prefix>-ancoras-100-report.md`
3. Declarar no chat: “Âncoras do subtópico \<X\>: 100% via audit:anchor-100 — base liberada para handcraft em massa em **nova** conversa.”
4. **Não** iniciar `gNN` aqui (salvo “pode handcraft”)

---

## DoD

**Âncora:** playbook/gesto OK · `gates_pass` · sem spoiler CM/GR · preview ≥ piso G2 (`--require-visual`) · visual-anchors + playbook · `approval.status=pass`

**Subtópico:** todas as âncoras pass · report atualizado · próximo passo em **nova** conversa (Handcraft / Fábrica)

Contrato: [`ANCHOR_CHECKLIST_100.md`](ANCHOR_CHECKLIST_100.md)

---

## Variantes do trigger

| Trigger | Escopo |
|---------|--------|
| `Âncoras 100%: <Subtópico>` | Ciclo completo |
| `Âncoras 100%: <Subtópico>` + `Só inventário` | Parar após 0a+0b |
| `Âncoras 100%: <Subtópico>` + `Ramo: <branch_id>` | Uma âncora (ainda exige 0a/0b daquele ramo) |
| `Criar âncoras: <Subtópico>` | Só bootstrap — depois voltar a este prompt |

---

*Vigente 2026-08-08 — âncoras first + contrato audit:anchor-100 + Composer visual (Fase 1C′) + atelier como crítica.*

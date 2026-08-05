# Prompt — Âncoras 100% premium (base do catálogo)

Use em **conversa nova** (Agent mode) para deixar **todas as âncoras de todos os ramos L3** de **um** subtópico no nível premium máximo (pedagogia golden-v1 + visual Glance OS / barra G2), com **aprovação humana âncora a âncora**.

> **Política de produto (pré-venda):** priorizar a **base** (playbook + mapa + âncoras). **Não** iniciar handcraft em massa (`gNN`) nesta conversa, salvo pedido explícito.

**Relação com outros trilhos:**

| Trilho | Quando |
|--------|--------|
| [`L3_MAPEAMENTO_CONVERSA.md`](L3_MAPEAMENTO_CONVERSA.md) | Pacote novo / ramos sem brief — pode ser conversa **antes** ou Fase 0a desta |
| `Criar âncoras:` (bootstrap) | Só **criar** goldens faltantes pré-g01 — este prompt **eleva** âncoras ao 100% |
| [`PROMPT_FABRICA_VISUAL_G2.md`](PROMPT_FABRICA_VISUAL_G2.md) | Depois das âncoras aprovadas (ou em paralelo só se molde bloquear a âncora) |
| `Handcraft:` / Pipeline | **Depois** que o subtópico tiver âncoras 100% aprovadas |

**Referência fechada:** piloto Glance OS Farmacodinâmica — `artifacts/glance-os-piloto-farmacodinamica-INDEX.md` (3/3 ramos).

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

## Anexos recomendados

```text
@docs/PROMPT_ANCORAS_100.md
@docs/ANCHOR_CHECKLIST_100.md
@docs/GOLDEN_CONTENT_STANDARD.md
@docs/GOLDEN_HANDCRAFT_MODEL.md
@docs/NEUROSLIDES_VISUAL_BAR.md
@docs/DECISAO_NEUROSLIDES_GERACAO_2.md
@docs/L3_MAPEAMENTO_CONVERSA.md
@docs/PROMPT_FABRICA_VISUAL_G2.md
@data/catalog-migration/handcraft-registry.json
@data/catalog-migration/visual-anchors.json
@.cursor/skills/avant-golden-anchor-bootstrap/SKILL.md
@.cursor/skills/avant-golden-anchor-handcraft/SKILL.md
@.cursor/skills/avant-json-template/SKILL.md
@.cursor/skills/avant-neuroslides-visual/SKILL.md
@.cursor/skills/professor-para-concurso/SKILL.md
@.cursor/skills/brief-enfermagem/SKILL.md
@examples/_TEMPLATE-golden-v1.json
```

Por pacote (obrigatório quando existir):

```text
@data/catalog-migration/handcraft-playbooks/<pacote>.json
@artifacts/l3-brief-<pacote>-*.md
@artifacts/glance-os-piloto-*-INDEX.md
```

---

## Prompt completo (copiar no chat)

Edite **só** a linha `SUBTÓPICO:` e cole:

```text
Âncoras 100% premium: SUBTÓPICO: <Subtópico canônico CLAUDE.md §9>

Modo: Agent · 1 subtópico por conversa · âncoras first (sem handcraft em massa)
Objetivo: TODAS as âncoras de TODOS os ramos L3 deste pacote em nível premium máximo
         (pedagogia golden-v1 + visual Glance OS / barra G2), prontas para aprovação humana UMA A UMA.
Contexto: AVANT pré-venda — qualidade da base > velocidade de lote. NÃO escalar gNN nesta conversa.

Anexos:
@docs/PROMPT_ANCORAS_100.md
@docs/ANCHOR_CHECKLIST_100.md
@docs/GOLDEN_CONTENT_STANDARD.md
@docs/GOLDEN_HANDCRAFT_MODEL.md
@docs/NEUROSLIDES_VISUAL_BAR.md
@docs/DECISAO_NEUROSLIDES_GERACAO_2.md
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
Referência: Farmacodinâmica Glance OS 3/3 (VF + clínico + genérico)

---

POLÍTICA

FAZER:
- Fase 0a: playbook + mapa de gestos / L3 ANTES de editar âncora
- Fase 0b: inventário 1 âncora por ramo
- Elevar cada âncora a 100%; gates; preview; pedir aprovação humana ramo a ramo
- Atualizar visual-anchors.json + playbook + report do pacote

NÃO FAZER:
- Handcraft em massa / gNN / apply Supabase / --promote
- ai:generate / catalog:upgrade-premium
- Commit/push sem pedido explícito
- Editar âncora antes do playbook/mapa estarem OK
- Próximo subtópico nesta conversa
- Declarar 100% sem `audit:anchor-100` com approval.status=pass
- Writer auto-assinar no mesmo turno sem `--sign-agent` / artefato
- Pular humano quando verdict=human_required (risco alto)

---

FASE 0a — Playbook + mapa (ANTES de tocar âncora)  ★ obrigatória

1. Abrir ou criar `data/catalog-migration/handcraft-playbooks/<pacote>.json`.
2. Confirmar lista completa de `pedagogical_branches[]`:
   | id | when | gesture | mold 4/4 | anchors[] |
3. Mapa de gestos do pacote (EXCETO / TRILHO / PROTOCOLO / VF / PEGADINHA / …):
   - Se não existir: criar `artifacts/glance-os-<pacote>-MAPA-8-GESTOS.md` (ou seção no playbook).
   - Anti-gesto errado (ex.: não forçar ADME/EV se a prova não pedir).
4. Brief L3 4/4 por ramo forte se `molde_redesign` e ainda não houver `artifacts/l3-brief-<pacote>-<branch>.md`
   (skill brief-enfermagem / Mapeamento L3).
5. Moldes: se o gesto exige Glance OS e o molde atual está abaixo da barra, anotar gap
   (wrap/polish/bespoke) — preferir elevar molde do ramo antes de “aprovar” a âncora no preview errado.
6. GATE 0a: playbook + gestos revisados; tabela de ramos publicada no chat.
   Só então → Fase 0b.

Começar: ler registry + playbook + `npm run handcraft:brief -- --subtopico="..."` (se existir).

---

FASE 0b — Inventário de âncoras (ainda sem polish em massa)

Para cada ramo da Fase 0a:

| branch_id | gesto | âncora path | molde 4/4 | status | ação |

status ∈ missing | drift_ramo | spoiler | below_bar | ready_pending_human | approved

- missing → bootstrap (avant-golden-anchor-bootstrap) + registrar em visual-anchors.json
- Não editar conteúdo fino até a tabela 0b estar no chat

---

FASE 1 — Por âncora (sequencial)

Para CADA branch_id (ordem: ramos fortes → genérico/cauda):

A) family + pedagogical_branch corretos
B) Polish âncora (golden-anchor-handcraft + professor + json-template):
   - meta.content_standard: "golden-v1"
   - meta.subtopico canônico + pedagogical_branch
   - 4 slides ordem v2: concept_map → logic_flow → golden_rule → danger_zone
   - concept_map: SEM gabarito / SEM “letra X”
   - golden_rule: SEM row “Gabarito letra X”
   - logic_flow: eliminação + gabarito; fixação portátil
   - danger_zone: correct único; cobertura distratores; ≥1 transferência
   - sources A/B; exam_vs_current se necessário
   - SEM template/layout_variant salvo override
C) Gates (checklist executável — Writer ≠ assinatura):
   npm run audit:anchor-100 -- --file=<path>
   → gates_pass + artefato artifacts/anchor-checklist/<slug>.json
   (equivale READY strict-v2 + spoiler + DZ + densidade; ver docs/ANCHOR_CHECKLIST_100.md)
D) Visual:
   http://localhost:3000/dev/slide-mold-review?branch=<branch_id>
   Checklist NEUROSLIDES_VISUAL_BAR; Glance OS preferir 0 taps
   Fechar 100%: npm run audit:anchor-100 -- --file=<path> --require-visual
E) Revisor B (turno separado se teach_once/gesture duvidosos):
   --reviewer-file=artifacts/anchor-reviewer-b-<slug>.json
F) Assinatura (não declarar “aprovado” só no chat):
   - risk baixo/médio + agent_may_sign:
     npm run audit:anchor-100 -- --file=<path> --sign-agent --write-meta
   - risk alto / human_required:
     PARAR → humano: --sign-human=<Nome> --write-meta
   Avançar próximo ramo só com approval.status=pass
G) Atualizar visual-anchors + playbook

---

FASE 2 — Fechamento do subtópico

Só quando TODAS as âncoras tiverem `anchor_100_approval.status=pass` (agent ou humano):

1. Tabela final | branch | path | READY | visual_bar | aprovado_humano | spoiler_livre |
2. artifacts/<pacote_prefix>-ancoras-100-report.md (ou INDEX do pacote)
3. Declarar: “Âncoras do subtópico <X>: 100% — base liberada para handcraft em massa em conversa futura.”
4. NÃO iniciar gNN aqui (salvo “pode handcraft”)

---

DoD âncora
□ Playbook/gesto do ramo OK (Fase 0a)
□ `audit:anchor-100` gates_pass (READY + spoiler + DZ + densidade)
□ Sem spoiler letra em concept_map e golden_rule
□ Gesto = molde do ramo; preview ≥ piso G2 (`--require-visual` ao fechar)
□ visual-anchors + playbook
□ `meta.anchor_100_approval.status=pass` (ou artefato assinado)
  — agent se risco baixo/médio; humano se risco alto

DoD subtópico
□ Todas as âncoras com approval.status=pass
□ Report/INDEX atualizado
□ Próximo passo sugerido em NOVA conversa (Handcraft g01 ou Fábrica visual)

Começar: FASE 0a (playbook + mapa). Não editar âncora antes da tabela de ramos.

Contrato de aprovação: [`ANCHOR_CHECKLIST_100.md`](ANCHOR_CHECKLIST_100.md)
```

---

## Ordem mental (resumo)

```text
Playbook + mapa de gestos / L3
        ↓
Inventário 1 âncora / ramo
        ↓
Âncora a âncora → gates + preview → humano aprova
        ↓
Report 100% do subtópico
        ↓
(NOVA conversa) handcraft em massa / Fábrica
```

---

## Variantes do trigger

| Trigger | Escopo |
|---------|--------|
| `Âncoras 100%: <Subtópico>` | Ciclo completo deste doc |
| `Âncoras 100%: <Subtópico>` + `Só inventário` | Parar após Fase 0a+0b |
| `Âncoras 100%: <Subtópico>` + `Ramo: <branch_id>` | Uma âncora só |
| `Criar âncoras: <Subtópico>` | Só bootstrap faltantes (skill) — depois voltar a este prompt para elevar a 100% |

---

## Rule Cursor

[`.cursor/rules/ancoras-100.mdc`](../.cursor/rules/ancoras-100.mdc) · cópia [`docs/cursor/ancoras-100.mdc`](cursor/ancoras-100.mdc)

---

*Vigente desde 2026-08-04 — política âncoras first (pré-venda) + Fase 0a playbook/mapa.*

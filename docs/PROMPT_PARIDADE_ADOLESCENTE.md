# Prompt — paridade proporcional Saúde do Adolescente

Use em **conversa nova** (Agent mode) para levar **qualquer subtópico** ao mesmo padrão **pedagógico substantivo** de **Saúde do Adolescente**: conteúdo golden-v1 bespoke por slug **e** slides L3 alinhados ao ramo (`pedagogical_branch`), A4 substantivo, L6 + captures, ship vendável.

> **Barra canônica:** [`artifacts/saude-adolescente-nota10-report.md`](../artifacts/saude-adolescente-nota10-report.md)  
> **Adaptação pacotes grandes:** [`artifacts/vias-de-administracao-nota10-v2-report.md`](../artifacts/vias-de-administracao-nota10-v2-report.md) · [`artifacts/puncao-venosa-nota10-v2-report.md`](../artifacts/puncao-venosa-nota10-v2-report.md)

---

## Como disparar

```text
Paridade Adolescente: <Subtópico canônico>
```

ou

```text
Pipeline + paridade Adolescente: SUBTÓPICO: <Subtópico canônico>
```

**Moldes React bespoke obrigatórios nos ramos fortes** (Fase 0b — não basta genérico premium):

```text
Pipeline + paridade Adolescente + L3 bespoke: SUBTÓPICO: <Subtópico canônico>
```

→ Runbook dedicado: [`PROMPT_PARIDADE_ADOLESCENTE_L3_BESPOKE.md`](PROMPT_PARIDADE_ADOLESCENTE_L3_BESPOKE.md)

Substitua pelo nome **exato** de `CLAUDE.md` §9.

**Anexos recomendados no chat:**

```text
@docs/PROMPT_PARIDADE_ADOLESCENTE.md
@artifacts/saude-adolescente-nota10-report.md
@artifacts/l3-brief-saude-adolescente-INDEX.md
@docs/PROTOCOLO_A4_MINIMO_ADOLESCENTE.md
@docs/PIPELINE_COMPLETO_CONVERSA.md
@data/catalog-migration/handcraft-registry.json
```

---

## O que significa “igual proporcionalmente”

**Não** copiar números absolutos do Adolescente (16 slugs, 6 ramos, 13 testes Playwright).

**Sim** copiar a **política** em cada dimensão:

| Dimensão | Adolescente (referência) | Replicar no pacote alvo |
|----------|--------------------------|-------------------------|
| **L2 conteúdo** | golden-v1 bespoke; anti-reciclagem; sources A/B; `exam_vs_current` | 100% slugs |
| **L2.5 ramos** | 6 ramos; inferência coerente; 0 mismatch após reconcile | 100% ramos do mapa |
| **L3 slides** | brief 4/4 por ramo; molde por `pedagogical_branch`; Playwright PASS | 100% ramos com ≥1 slug |
| **L3 bespoke (modo +L3 bespoke)** | 2 ramos fortes com React 4/4 (ética, Z); demais ok_generico 3/3 | ramo forte → molde_redesign/inedito **ou** ok_generico 3/3 documentado |
| **A4** | 16/16 stamped; humano substantivo | 100% stamped; política abaixo |
| **L6** | g01+g02 pass + captures PNG | conforme escala |
| **Ship** | applied + `production_ready` + relatório paridade | idem |

### Escala L6 humano (obrigatória)

| Tamanho do pacote | Slugs (aprox.) | L6 humano |
|-------------------|----------------|-----------|
| **Pequeno** | ≤20 | Revisar humano **todos os lotes** `g*` (modelo Adolescente g01+g02) |
| **Médio** | 21–80 | L6 agent em todos `g*` + **1 âncora visual humana por ramo** forte |
| **Grande** | 80+ | L6 agent em todos `g*` + **1 âncora visual humana por ramo** do mapa |

### Política A4 humano (substantiva — não negociável)

Humano `handcraft-qc` + `a4_human_notes` **somente** quando:

1. `family=calc` → **100%**
2. `exam_vs_current ≠ none` → **100%**
3. `!agentA4Eligible` ou tier `alto`
4. Amostra hash **~20% do tier `medio`** (`shouldSampleForHumanReview`)

**Proibido:** quota artificial até 20% do **total** de slugs do pacote.

---

## Variantes do trigger

| Trigger | Quando |
|---------|--------|
| `Paridade Adolescente: <subtópico>` | Pacote já `applied` ou `production_ready` — fechar gaps pedagógicos + relatório |
| `Paridade Adolescente: <subtópico>` + `Só onda pedagógica` | Pular handcraft se 100% applied; executar Fases 0b + 1b + 2 + relatório |
| `Pipeline + paridade Adolescente: <subtópico>` | Pacote incompleto — pipeline completo + paridade na mesma conversa |
| **`Pipeline + paridade Adolescente + L3 bespoke + orquestrador: <subtópico>`** | Bootstrap IDE + workers SDK — [`PROMPT_PIPELINE_PARIDADE_ORQUESTRADOR.md`](PROMPT_PIPELINE_PARIDADE_ORQUESTRADOR.md) |
| **`Pipeline + paridade Adolescente + L3 bespoke: <subtópico>`** | **Fase 0b obrigatória** — React 4/4 em ramos fortes antes do ship |
| **`Pipeline + paridade Adolescente + L3 bespoke + orquestrador: <subtópico>`** | Bootstrap IDE + workers SDK — [`PROMPT_PIPELINE_PARIDADE_ORQUESTRADOR.md`](PROMPT_PIPELINE_PARIDADE_ORQUESTRADOR.md) |
| `L3 bespoke: <subtópico>` | Só implementação VARIANT_MOLDS (conversa 2 do fluxo 3-passos) |
| `Mapeamento L3: <subtópico>` (antes) | Se ainda não existem ramos/briefs/moldes — ver [`L3_MAPEAMENTO_CONVERSA.md`](L3_MAPEAMENTO_CONVERSA.md) |

---

## Prompt completo (copiar no chat)

Edite **só** a linha `SUBTÓPICO:` e cole o bloco abaixo:

```text
Paridade Adolescente: SUBTÓPICO: <Subtópico canônico>

MODO: Agent. Uma conversa = um subtópico.
Objetivo: paridade PROPORCIONAL 100% com Saúde do Adolescente
(conteúdo pedagógico alto nível + slides por ramo + A4 substantivo + L6 + ship).
NÃO encerrar sem checklist 100% verde + relatório de paridade.
NÃO perguntar se deve “deixar no padrão Adolescente” — isso já é obrigatório.

Anexos obrigatórios:
@docs/PROMPT_PARIDADE_ADOLESCENTE.md
@artifacts/saude-adolescente-nota10-report.md
@artifacts/l3-brief-saude-adolescente-INDEX.md
@docs/PROTOCOLO_A4_MINIMO_ADOLESCENTE.md
@docs/PROMPT_PIPELINE_REFERENCIA_VIAS_IMUNIZACAO.md
@docs/PIPELINE_COMPLETO_CONVERSA.md
@docs/L3_MAPEAMENTO_CONVERSA.md
@docs/GOLDEN_HANDCRAFT_MODEL.md
@docs/GOLDEN_CONTENT_STANDARD.md
@docs/QUALITY_LAYERS_MODEL.md
@docs/MOLD_AFFINITY_RESOLVER.md
@data/catalog-migration/handcraft-registry.json
@.cursor/skills/avant-json-template/SKILL.md
@.cursor/skills/avant-golden-anchor-handcraft/SKILL.md

Referência escala grande (sem fake parity):
@artifacts/vias-de-administracao-nota10-v2-report.md
@artifacts/puncao-venosa-nota10-v2-report.md

PROIBIDO:
- ai:generate / catalog:upgrade-premium
- Quota artificial “20% do total de slugs” como handcraft-qc
- Declarar “igual Adolescente” sem tabela de paridade no relatório
- Encerrar com production_ready se faltar item da checklist
- Apply sem dry-run 100% OK (depois --apply; autorizado neste prompt)

COMEÇAR:
npm run handcraft:brief -- --subtopico="<Subtópico canônico>"
Resolver pacote_prefix + total_slugs no registry.
Se handcraft_applied < total_slugs → executar Fase 1 antes das demais.
Se já production_ready → auditar gaps e fechar só o que falta.

---

CHECKLIST OBRIGATÓRIA (marcar ✅ só com evidência de comando/arquivo)

0) BRIEF
   □ npm run handcraft:brief -- --subtopico="..."
   □ pacote_prefix + playbook no registry

FASE 0 — L3 / L2.5 (slides de acordo com conteúdo)
   □ cluster do pacote (se existir)
   □ npm run audit:l3-mold-gap → artifacts/l3-mold-gap-audit.md
   □ Ramos em pedagogicalBranch.ts + inferência coerente
   □ Briefs L3 INDEX + 1 brief 4/4 por ramo (metáfora ↔ erro pedagógico)
   □ Tabela ramo × decisão L3 (molde_redesign | molde_inedito | ok_generico | cauda_longa)
   □ Modo padrão: bespoke React se erro espacial/categorial; senão genérico premium
   □ Modo +L3 bespoke: ver Fase 0b abaixo (OBRIGATÓRIO antes do ship)
   □ visual-anchors.json: 1 âncora por ramo
   □ TODOS os ramos do mapa com ≥1 slug real no manifest
   □ Playwright bloco dedicado PASS + summary.json (pacote_prefix correto)
   □ Branch audit declared vs inferred → 0 mismatch (ou exceções no relatório)

FASE 0b — Moldes bespoke L3 (OBRIGATÓRIO se trigger + L3 bespoke)
   □ Ramo forte = ≥5 slugs OU ≥10% do pacote
   □ Todo ramo forte: molde React 4/4 (VARIANT_MOLDS) OU ok_generico com teste espacial 3/3
   □ PROIBIDO ok_existente / reutilizar molde de outro subtópico sem redesign
   □ GATE: audit:l3-mold-gap → 0× ramo forte pendente molde_inedito|molde_redesign
   □ Runbook: @docs/PROMPT_PARIDADE_ADOLESCENTE_L3_BESPOKE.md

FASE 1 — Handcraft golden-v1 (conteúdo pedagógico 100%)
   □ meta.content_standard golden-v1 + pedagogical_branch em TODOS
   □ 4 slides ordem v2: concept_map → logic_flow → golden_rule → danger_zone
   □ logic_flow reveal_mode:"tap"; concept_map sem gabarito; danger_zone.correct único
   □ Por lote: audit:questao-readiness --strict-v2-pedagogy → [READY]
   □ validate:goldens --strict
   □ enrich guideline + slug-alignment --strict + numeric-factcheck PASS
   □ registry: handcraft_applied === total_slugs, status=applied

FASE 1b — A4-mínimo (política Adolescente)
   □ Pacote no a4MinimoRegistry (+ docs/PROTOCOLO_A4_MINIMO_<PACOTE>.md se novo)
   □ stamp:a4-minimo 100% STAMPED
   □ Humano handcraft-qc SOMENTE: calc 100% | divergência 100% | blockers | ~20% medio
   □ PROIBIDO padding até 20% do pacote inteiro

FASE 2 — Qualidade vendável + L6 + ship
   □ reconcile:handcraft-manifest
   □ catalog:preflight em todos g*
   □ audit:handcraft-dod + slug-alignment --strict + numeric-factcheck
   □ L6: audit:anchor-review --record-pass em cada g* + captures_dir preenchido
   □ L6 humano: conforme ESCALA (lotes inteiros OU âncoras por ramo)
   □ Player captures PNG em 100% dos slugs handcraft-qc
   □ Playwright L3 PASS
   □ catalog:apply-lote --dry-run 100% OK → --apply 100% OK (autorizado neste prompt)
   □ audit:subtopico-quality --promote → production_ready

FASE 3 — Relatório de paridade (obrigatório)
   □ artifacts/<pacote_prefix>-nota10-report.md
   □ Se onda pedagógica pós-ship: artifacts/<pacote_prefix>-nota10-v2-report.md
   □ Tabela Paridade Adolescente × <Pacote> preenchida

ENTREGA FINAL (única mensagem de fechamento)
Tabela:
| applied | A4 100% | A4 humano substantivo | ramos com slug | Playwright | L6+captures | apply | production_ready | paridade Adolescente | blockers |
Path do relatório.
Só então terminar.

SE BLOQUEADO: item da checklist + comando + próximo passo; continuar até zerar blockers.
```

---

## Fluxo recomendado

**Modo padrão (2 conversas):**

```text
Conversa 1: Mapeamento L3: <Subtópico>
Conversa 2: Pipeline + paridade Adolescente: <Subtópico>
```

**Modo + L3 bespoke (3 conversas):**

```text
Conversa 1: Mapeamento L3: <Subtópico>
Conversa 2: L3 bespoke: <Subtópico>
Conversa 3: Pipeline + paridade Adolescente + L3 bespoke: <Subtópico>
```

Para pacote já `production_ready` sem paridade pedagógica documentada:

```text
Paridade Adolescente: <Subtópico> + Só onda pedagógica
Paridade Adolescente + L3 bespoke: <Subtópico>   → fechar Fase 0b + relatório v2
```

---

## Tabela de paridade (template do relatório)

Copiar para `artifacts/<pacote_prefix>-nota10-report.md` (e `-v2-report.md` se onda pedagógica):

| Critério | Saúde do Adolescente | `<Pacote>` | Paridade |
|----------|----------------------|------------|----------|
| Slugs handcraft applied | 16/16 | ?/? | |
| `production_ready` | sim | ? | |
| Ramos L3 com ≥1 slug | 6/6 | ?/? | |
| Brief INDEX + por ramo | sim | ? | |
| visual-anchors 1/ramo | 6 | ? | |
| Playwright L3 PASS | 13/13 | ? | |
| Bespoke React 4/4 (ramos fortes) | 2/2 | ?/? | (modo +L3 bespoke) |
| ok_generico com teste 3/3 | 4 | ? | (modo +L3 bespoke) |
| A4 100% stamped | 16/16 | ? | |
| A4 humano substantivo (sem quota fake) | 3 (calc+amostra) | ? | |
| Player PNG = slugs handcraft-qc | piloto | ? | |
| L6 + captures | g01+g02 | ? | |
| Branch reconcile 0 mismatch | sim | ? | |
| Apply Supabase 100% | 16/16 | ? | |
| Relatório nota-10 | sim | ? | |

---

## Referências

| Doc | Uso |
|-----|-----|
| [`PIPELINE_COMPLETO_CONVERSA.md`](PIPELINE_COMPLETO_CONVERSA.md) | Handcraft + ship |
| [`L3_MAPEAMENTO_CONVERSA.md`](L3_MAPEAMENTO_CONVERSA.md) | Fase 0 L3 |
| [`PROTOCOLO_A4_MINIMO_ADOLESCENTE.md`](PROTOCOLO_A4_MINIMO_ADOLESCENTE.md) | Política A4 |
| [`QUALITY_LAYERS_MODEL.md`](QUALITY_LAYERS_MODEL.md) | L1–L6 |
| [`artifacts/saude-adolescente-nota10-report.md`](../artifacts/saude-adolescente-nota10-report.md) | Barra fechada |
| [`PROMPT_PARIDADE_ADOLESCENTE_L3_BESPOKE.md`](PROMPT_PARIDADE_ADOLESCENTE_L3_BESPOKE.md) | Fase 0b obrigatória |
| [`VARIANT_MOLDS.md`](VARIANT_MOLDS.md) | Implementação React |
| Rule Cursor | `.cursor/rules/paridade-adolescente.mdc` |

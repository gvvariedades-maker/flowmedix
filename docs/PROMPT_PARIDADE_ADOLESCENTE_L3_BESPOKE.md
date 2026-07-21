# Prompt — paridade Adolescente + L3 bespoke OBRIGATÓRIO (Fase 0b)

Use em **conversa nova** (Agent mode) quando **ramos fortes** do subtópico devem ter **molde React bespoke 4/4** implementado antes do ship — não basta genérico premium + Playwright.

> **Modo padrão (genérico permitido):** [`PROMPT_PARIDADE_ADOLESCENTE.md`](PROMPT_PARIDADE_ADOLESCENTE.md)  
> **Mapeamento + decisões L3:** [`L3_MAPEAMENTO_CONVERSA.md`](L3_MAPEAMENTO_CONVERSA.md) Fase 3b  
> **Engenharia de molde:** [`VARIANT_MOLDS.md`](VARIANT_MOLDS.md) · brief [`PROMPT_VARIANTES_NEUROSLIDES.md`](PROMPT_VARIANTES_NEUROSLIDES.md)

---

## Como disparar

```text
Pipeline + paridade Adolescente + L3 bespoke: SUBTÓPICO: <Subtópico canônico>
```

Variantes:

```text
Paridade Adolescente + L3 bespoke: <Subtópico canônico>
Pipeline + paridade Adolescente + L3 bespoke + orquestrador: SUBTÓPICO: <Subtópico canônico>  → bootstrap IDE + SDK workers
L3 bespoke: <Subtópico canônico>          → só Fase 0b (implementação React)
Mapeamento L3: <Subtópico canônico>        → conversa 1 (decisões + briefs 4/4)
```

> **Programa completo com orquestrador:** [`PROMPT_PIPELINE_PARIDADE_ORQUESTRADOR.md`](PROMPT_PIPELINE_PARIDADE_ORQUESTRADOR.md)

Substitua pelo nome **exato** de `CLAUDE.md` §9.

---

## Prompt completo (copiar no chat)

Edite **só** a linha `SUBTÓPICO:` e cole o bloco abaixo:

```text
Pipeline + paridade Adolescente + L3 bespoke: SUBTÓPICO: <Subtópico canônico>

MODO: Agent. Uma conversa = um subtópico.
MODO L3: bespoke_obrigatorio_ramoforte
Objetivo: paridade PROPORCIONAL 100% com Saúde do Adolescente
(conteúdo golden-v1 + L3 bespoke nos ramos fortes + A4 substantivo + L6 + ship).
NÃO encerrar sem checklist 100% verde + relatório de paridade.
NÃO perguntar se deve “deixar no padrão Adolescente” — isso já é obrigatório.
NÃO declarar paridade se Fase 0b tiver ramo forte pendente de implementação React.

Anexos obrigatórios:
@docs/PROMPT_PARIDADE_ADOLESCENTE_L3_BESPOKE.md
@docs/PROMPT_PARIDADE_ADOLESCENTE.md
@docs/L3_MAPEAMENTO_CONVERSA.md
@docs/PROMPT_VARIANTES_NEUROSLIDES.md
@docs/VARIANT_MOLDS.md
@docs/MOLD_AFFINITY_RESOLVER.md
@artifacts/saude-adolescente-nota10-report.md
@docs/PROTOCOLO_A4_MINIMO_ADOLESCENTE.md
@docs/PIPELINE_COMPLETO_CONVERSA.md
@docs/GOLDEN_HANDCRAFT_MODEL.md
@docs/GOLDEN_CONTENT_STANDARD.md
@docs/QUALITY_LAYERS_MODEL.md
@data/catalog-migration/handcraft-registry.json
@.cursor/skills/avant-json-template/SKILL.md
@.cursor/skills/avant-golden-anchor-handcraft/SKILL.md

Referência escala grande:
@artifacts/vias-de-administracao-nota10-v2-report.md
@artifacts/puncao-venosa-nota10-v2-report.md

PROIBIDO:
- ai:generate / catalog:upgrade-premium
- ok_existente / reutilizar molde de outro subtópico sem molde_redesign (ex.: SAE→Saúde Mental)
- ok_generico em ramo forte sem teste espacial 3/3 documentado (VARIANT_MOLDS §2)
- Brief com “bespoke futuro” / “condicional” no lugar de implementação
- Quota artificial “20% do total de slugs” como handcraft-qc
- Declarar paridade sem tabela no relatório (incl. coluna bespoke)
- Encerrar production_ready com molde_inedito|molde_redesign pendente
- Apply sem dry-run 100% OK (depois --apply; autorizado neste prompt)

DEFINIÇÃO — ramo forte:
≥5 slugs OU ≥10% do pacote (max(5, ceil(total×0.10))).

COMEÇAR:
npm run handcraft:brief -- --subtopico="<Subtópico canônico>"
npm run audit:l3-mold-gap -- --subtopico="<Subtópico canônico>"
Resolver pacote_prefix + tabela ramo × decisão L3 antes de handcraft/ship.

---

CHECKLIST OBRIGATÓRIA (marcar ✅ só com evidência de comando/arquivo)

0) BRIEF
   □ npm run handcraft:brief -- --subtopico="..."
   □ pacote_prefix + total_slugs no registry
   □ npm run audit:l3-mold-gap → artifacts/l3-mold-gap-audit.md

FASE 0 — L3 / L2.5 (mapeamento)
   □ cluster do pacote (se existir)
   □ Ramos em pedagogicalBranch.ts + inferência coerente
   □ Briefs L3 INDEX + 1 brief 4/4 por ramo (PROMPT_VARIANTES_NEUROSLIDES)
   □ Tabela ramo × decisão: molde_redesign | molde_inedito | ok_generico | cauda_longa
   □ visual-anchors.json: 1 âncora por ramo
   □ TODOS os ramos do mapa com ≥1 slug real no manifest
   □ Branch audit declared vs inferred → 0 mismatch

FASE 0b — Moldes bespoke L3 (OBRIGATÓRIO — gate de ship)
   □ Todo ramo forte com decisão molde_redesign | molde_inedito:
       · Brief 4/4 com 4× layout_variant nomeados (concept · golden · logic · danger)
       · VARIANT_MOLDS.md §3–§8: React + NeuroSlide + moldAffinity + catálogo §5
       · Golden âncora em examples/questao-premium-*-<pacote>*.json
       · Playwright ramo PASS (desktop + mobile-375) no bloco do pacote
   □ Ramo forte ok_generico SOMENTE se teste espacial 3/3 no brief (VARIANT_MOLDS §2):
       1. Pegadinha NÃO é espacial (só texto × texto)?
       2. Padrão em <5 questões E <10%?  (se ramo forte por volume, item 2 = NÃO)
       3. compare + correct já ensina sem UI bespoke?
   □ PROIBIDO ok_existente — tratar como molde_redesign
   □ GATE: audit:l3-mold-gap → 0× ramo forte pendente molde_inedito|molde_redesign
   □ Playwright bloco dedicado PASS + summary.json (pacote_prefix correto)

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
   □ catalog:preflight em todos lotes handcraft
   □ audit:handcraft-dod + slug-alignment --strict + numeric-factcheck
   □ L6 + captures conforme escala do pacote
   □ Player captures PNG em 100% dos slugs handcraft-qc
   □ Playwright L3 PASS (incl. ramos bespoke 4/4)
   □ catalog:apply-lote --dry-run 100% OK → --apply 100% OK (autorizado neste prompt)
   □ audit:subtopico-quality --promote → production_ready

FASE 3 — Relatório de paridade (obrigatório)
   □ artifacts/<pacote_prefix>-nota10-report.md
   □ Tabela Paridade Adolescente × <Pacote> (incl. bespoke 4/4 + ok_generico 3/3)
   □ Se onda pedagógica pós-ship: artifacts/<pacote_prefix>-nota10-v2-report.md

ENTREGA FINAL (única mensagem de fechamento)
Tabela:
| applied | bespoke 4/4 ramos fortes | ok_generico 3/3 | A4 100% | A4 humano | Playwright | L6+captures | apply | production_ready | paridade | blockers |
Path do relatório.
Só então terminar.

SE BLOQUEADO: item da checklist + comando + próximo passo; continuar até zerar blockers.
```

---

## Tabela de paridade (template — modo L3 bespoke)

| Critério | Saúde do Adolescente | `<Pacote>` | Paridade |
|----------|----------------------|------------|----------|
| Slugs handcraft applied | 16/16 | ?/? | |
| Ramos fortes (≥5 ou ≥10%) | 2 | ? | |
| **Bespoke React 4/4 (ramos fortes)** | **2/2** (ética, Z) | **?/?** | |
| ok_generico com teste 3/3 | 4 | ? | |
| molde_inedito\|redesign pendente | 0 | 0 | |
| Brief INDEX + Fase 3b por ramo | sim | ? | |
| visual-anchors 1/ramo | 6 | ? | |
| Playwright L3 PASS | 13/13 | ? | |
| A4 100% stamped | 16/16 | ? | |
| Branch reconcile 0 mismatch | sim | ? | |
| Apply Supabase 100% | 16/16 | ? | |
| Relatório nota-10 | sim | ? | |

---

## Fluxo recomendado (3 conversas)

```text
Conversa 1: Mapeamento L3: <Subtópico>              → decisões + briefs 4/4
Conversa 2: L3 bespoke: <Subtópico>                 → VARIANT_MOLDS implementação
Conversa 3: Pipeline + paridade Adolescente + L3 bespoke: <Subtópico>  → handcraft/A4/L6/ship
```

Ou **uma conversa** com o prompt completo acima se o escopo couber.

---

## Referências

| Doc | Uso |
|-----|-----|
| [`PROMPT_PARIDADE_ADOLESCENTE.md`](PROMPT_PARIDADE_ADOLESCENTE.md) | Modo padrão (genérico permitido) |
| [`L3_MAPEAMENTO_CONVERSA.md`](L3_MAPEAMENTO_CONVERSA.md) | Fase 3b + decisões L3 |
| [`VARIANT_MOLDS.md`](VARIANT_MOLDS.md) | Implementação React |
| [`PROMPT_VARIANTES_NEUROSLIDES.md`](PROMPT_VARIANTES_NEUROSLIDES.md) | Brief 4/4 |
| Rule Cursor | `.cursor/rules/paridade-adolescente.mdc` |

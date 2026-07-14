# Prompt — pipeline com barra Vias + Imunização + Adolescente

Use em **conversa nova** (Agent mode) para levar **qualquer subtópico** ao mesmo padrão de **conteúdo** e **slides** de **Vias de Administração**, **Imunização** e **Saúde do Adolescente**: handcraft golden-v1, moldes L3, gates L1–L6, `applied` + `production_ready`.

> **Nome do arquivo:** `PROMPT_PIPELINE_REFERENCIA_VIAS_IMUNIZACAO.md` (legado) — cobre os **três** pacotes flagship abaixo.

**Canônico equivalente:** [`PIPELINE_COMPLETO_CONVERSA.md`](PIPELINE_COMPLETO_CONVERSA.md) — este arquivo é o **prompt expandido** com referências explícitas aos pacotes flagship.

---

## Como disparar

```text
Pipeline completo: <Subtópico canônico>
```

Substitua pelo nome **exato** de `CLAUDE.md` §9 (ex.: `Punção Venosa e Cuidados com Cateteres`).

**Anexos recomendados no chat:**

```text
@docs/PROMPT_PIPELINE_REFERENCIA_VIAS_IMUNIZACAO.md
@docs/PIPELINE_COMPLETO_CONVERSA.md
@data/catalog-migration/handcraft-registry.json
@.cursor/skills/avant-json-template/SKILL.md
```

---

## Barra de qualidade (referência)

| Pacote | Marco | O que replicar |
|--------|-------|----------------|
| **Vias de Administração** | `production_ready`, 208 slugs | Ramos L3 (`via_vf_absorcao`, `via_tecnica_admin`, `via_generico`); moldes bespoke VF; repair mis-tags; `scripts/handcraft-vias-de-administracao-g*.ts` |
| **Imunização** | `production_ready`, g01–g83+ | Moldes PNI (calendário, cadeia frio, VF intervalos); `apply:imunizacao-ready-batch` |
| **Saúde do Adolescente** | `production_ready`, 16/16, onda nota-10 | 6 ramos L3 (`adolescente_etica_sigilo` … `adolescente_generico`); A4-mínimo onda 3 (`stamp:a4-minimo`); `ADOLESCENTE_BRANCHES` e2e; L6 checklist + captures; relatório `artifacts/saude-adolescente-nota10-report.md` |
| **Farmacodinâmica e Farmacocinética** | `production_ready`, 13/13, onda nota-10 | 3 ramos L3 (`farmaco_clinico_protocolo`, `farmaco_pk_pd_vf`, `farmaco_generico`); A4-mínimo; `lib/guidelines/farmacodinamica.ts`; L6 + Playwright 7/7; `artifacts/farmacodinamica-nota10-report.md` |
| **História da Enfermagem** | `production_ready`, 20/20, onda nota-10 | 4 ramos L3 + briefs INDEX; `inferHistoriaBranch`; Playwright 9/9; A4 4× humano; `artifacts/historia-enfermagem-nota10-report.md` |
| **Doenças Respiratórias Crônicas** | `production_ready`, 9/9, onda nota-10 | 5 ramos L3 + briefs INDEX; A4-mínimo SpO₂/Venturi; Playwright 12/12; `lib/guidelines/respiratorioCronico.ts`; `artifacts/respiratorio-cronico-nota10-report.md` |

### Qual referência usar

| Situação | Copiar de |
|----------|-----------|
| Pacote grande, escala, moldes bespoke VF/PNI | **Vias** ou **Imunização** |
| Pacote pequeno/médio, fechar A4+L6+L3 com checklist | **Saúde do Adolescente** ou **Farmacodinâmica** |
| PK/PD, ADME, infusão EV, protocolo clínico | JSONs `farmacodinamica-e-farmacocinetica-g01/g02` + `lib/guidelines/farmacodinamica.ts` |
| Ética/sigilo, VF gravidez, saúde mental, escore Z | JSONs `saude-adolescente-g01/g02` + `lib/guidelines/saudeAdolescente.ts` |

**Invariantes de conteúdo (L2):** [`GOLDEN_CONTENT_STANDARD.md`](GOLDEN_CONTENT_STANDARD.md) · skill `avant-json-template` · anti-reciclagem `danger_zone` · sem vazamento de ramo.

**Invariantes de slides (L3):** ordem v2 · `logic_flow` com `reveal_mode: "tap"` · molde por `pedagogical_branch` · regressão `e2e/visual-mold-regression.spec.ts`.

---

## Variantes do trigger

| Trigger | Quando |
|---------|--------|
| `Pipeline completo: <subtópico>` | Fase 0 (se precisar) + Fase 1 + Fase 2 até `--promote` |
| `Pipeline completo: <subtópico>` + `Só handcraft` | Parar em `applied`; não promover |
| `Pipeline completo: <subtópico>` + `Só qualidade` | Pular Fase 1 se já `applied` 100% |
| `Mapeamento L3: <subtópico>` | **Antes** do 1º lote — cluster + brief 4/4 |
| `Classify: <subtópico>` | Se bucket com drift de taxonomia |
| `Handcraft: <subtópico>` + `gNN` | Um lote por mensagem (como Vias g01–g26) |

---

## Prompt completo (copiar no chat)

Edite **só** a linha `SUBTÓPICO:` e cole o bloco abaixo:

```text
Pipeline completo: SUBTÓPICO: <Subtópico canônico>

Anexos obrigatórios:
@docs/PROMPT_PIPELINE_REFERENCIA_VIAS_IMUNIZACAO.md
@docs/PIPELINE_COMPLETO_CONVERSA.md
@docs/GOLDEN_HANDCRAFT_MODEL.md
@docs/GOLDEN_CONTENT_STANDARD.md
@docs/QUALITY_LAYERS_MODEL.md
@data/catalog-migration/handcraft-registry.json
@.cursor/skills/avant-json-template/SKILL.md

Referência de qualidade (mesmo padrão Vias + Imunização + Adolescente):
- Vias de Administração: production_ready, moldes L3 bespoke, 208 slugs handcraft
- Imunização: production_ready, moldes PNI, lotes g01+
- Saúde do Adolescente: production_ready, 16/16, A4-mínimo 16/16, L6+L3 6 ramos (onda nota-10)
- Farmacodinâmica e Farmacocinética: production_ready, 13/13, A4-mínimo 13/13, L6+L3 3 ramos (onda nota-10)
- História da Enfermagem: production_ready, 20/20, A4-mínimo 20/20, L3 3 ramos Playwright (onda nota-10)
- Template: @examples/_TEMPLATE-golden-v1.json
- Âncoras: anchor_glob do playbook do pacote no registry

Objetivo: <Subtópico canônico> com handcraft applied 100% + production_ready (vendável).

---

PRÉ-REQUISITOS (se ainda não existir):
- Classify: <subtópico> se drift de taxonomia
- Mapeamento L3: <subtópico> — Fase 3b brief 4/4 por ramo forte
- Pacote novo: fallback_novo_pacote em handcraft-registry.json + export completo

---

FASE 0 — L3
- npm run cluster:<pacote_prefix>
- audit:l3-mold-gap
- artifacts/l3-brief-<pacote>-<branch_id>.md
- Implementar moldes antes de escalar handcraft nos ramos fortes

---

FASE 1 — Handcraft golden-v1 (lotes g01, g02…; lote_size=8)
Seguir @docs/HANDCRAFT_CONVERSA.md e playbook do pacote.

Por slug:
- meta.content_standard: "golden-v1"
- meta.subtopico canônico (+ pedagogical_branch se BRANCH_DESIGN_MAP)
- 4 slides planos, ordem v2: concept_map → logic_flow → golden_rule → danger_zone
- concept_map: sem gabarito/letra
- logic_flow: eliminação + gabarito (reveal_mode: "tap")
- golden_rule: decore/norma; sem row "Gabarito letra X"
- danger_zone: items[].correct único por distrator
- Sem template/layout_variant salvo override
- meta.sources tier A/B; exam_vs_current se prova ≠ guideline

Por lote:
- catalog:export-lote (manifest)
- handcraft bespoke (modelo: scripts/handcraft-vias-de-administracao-g*.ts)
- audit:questao-readiness --strict-v2-pedagogy → [READY]
- validate:goldens --strict
- enrich/guideline + slug-alignment + numeric-factcheck + patch-pedagogical-branch (playbook)
- stamp:a4-minimo (se pacote em `a4MinimoRegistry` — ex. Adolescente onda 3, Farmacodinâmica onda 3b)
- capture:questao-review (opcional A4)

Apply Supabase:
- catalog:apply-lote --dry-run → --apply SOMENTE quando eu escrever "pode aplicar"
- Batch apply se existir (modelo: apply:vias-ready-batch, apply:imunizacao-ready-batch)

Mis-tags (meta.subtopico ≠ segmento do slug):
- **Vias:** `catalog:repair-vias-mis-tags` (slug segment → meta)
- **Adolescente:** aceitar drift de URL legada se `meta.subtopico` canônico — ver `artifacts/catalog-repair-saude-adolescente-mis-tags.json` (não renomear `modulo_slug`)

GATE Fase 1: status=applied, handcraft_applied === total_slugs

---

FASE 2 — Qualidade vendável
1. reconcile:handcraft-manifest
2. catalog:preflight em todos g*
3. audit:handcraft-dod + slug-alignment --strict + numeric-factcheck
4. audit:anchor-review + L6 pass em cada g*
5. npx playwright test e2e/visual-mold-regression.spec.ts --grep "<Pacote>" (ex. Adolescente: `Saúde do Adolescente — moldes L3`)
6. audit:subtopico-quality -- --subtopico="..." --promote

GATE Fase 2: production_status=production_ready

---

FASE 3 (opcional): audit:subtopico-health

---

PROIBIDO:
- ai:generate / catalog:upgrade-premium
- apply ou commit sem pedido explícito
- segundo --promote rotineiro após production_ready

Modo: lotes sequenciais; reportar após cada gNN; tabela final
| applied | technical_ready | production_ready | blockers |

Começar: npm run handcraft:brief -- --subtopico="<Subtópico canônico>"
```

---

## Fluxo recomendado (2 conversas para subtópico novo)

```text
Conversa 1: Mapeamento L3: <Subtópico>
Conversa 2: Pipeline completo: <Subtópico>  (+ este arquivo anexado)
```

Espelha Vias/Adolescente: L3 → g01…gNN → apply → A4 stamp (se onda) → `--promote`.

---

## Checklist — igual a Vias / Imunização / Adolescente

| Camada | Critério |
|--------|----------|
| L1 | Schema + 4 slides + handcraft-dod PASS |
| L2 | Conteúdo bespoke por slug; gates pedagogy strict |
| L2b | numeric-factcheck |
| L2.5 | slug-alignment |
| L3 | Moldes por ramo + visual-mold-regression |
| L4 | Piloto / captures (opcional operacional) |
| L5 | content health |
| L6 | anchor-review em todos os lotes |
| Ship | `audit:subtopico-quality --promote` |

**Nunca confundir** `applied` (handcraft no DB) com `production_ready` (vendável).

---

## Referências

| Doc | Uso |
|-----|-----|
| [`PIPELINE_COMPLETO_CONVERSA.md`](PIPELINE_COMPLETO_CONVERSA.md) | Runbook canônico |
| [`HANDCRAFT_CONVERSA.md`](HANDCRAFT_CONVERSA.md) | Só Fase 1 |
| [`QUALITY_VENDAVEL_CONVERSA.md`](QUALITY_VENDAVEL_CONVERSA.md) | Só Fase 2 |
| [`L3_MAPEAMENTO_CONVERSA.md`](L3_MAPEAMENTO_CONVERSA.md) | Fase 0 |
| [`PROGRAMA_CATALOGO_41.md`](PROGRAMA_CATALOGO_41.md) | 41 subtópicos |
| [`PROTOCOLO_A4_MINIMO_ADOLESCENTE.md`](PROTOCOLO_A4_MINIMO_ADOLESCENTE.md) | A4-mínimo onda 3 |
| [`PROTOCOLO_A4_MINIMO_FARMACODINAMICA.md`](PROTOCOLO_A4_MINIMO_FARMACODINAMICA.md) | A4-mínimo onda 3b |
| [`artifacts/saude-adolescente-nota10-report.md`](../artifacts/saude-adolescente-nota10-report.md) | Onda nota-10 fechada |
| [`artifacts/farmacodinamica-nota10-report.md`](../artifacts/farmacodinamica-nota10-report.md) | Onda nota-10 fechada |
| [`artifacts/historia-enfermagem-nota10-report.md`](../artifacts/historia-enfermagem-nota10-report.md) | Onda nota-10 fechada |
| [`artifacts/respiratorio-cronico-nota10-report.md`](../artifacts/respiratorio-cronico-nota10-report.md) | Onda nota-10 fechada |
| [`artifacts/l3-brief-saude-adolescente-INDEX.md`](../artifacts/l3-brief-saude-adolescente-INDEX.md) | Briefs L3 — 6 ramos documentados |
| [`artifacts/l3-brief-farmacodinamica-e-farmacocinetica-INDEX.md`](../artifacts/l3-brief-farmacodinamica-e-farmacocinetica-INDEX.md) | Briefs L3 — 3 ramos documentados |
| Rule Cursor | `.cursor/rules/pipeline-completo.mdc` |

# Prompt — pipeline âncora Crase Q506 (Língua Portuguesa)

Use em **conversa nova** (Agent mode) para **criar ou refinar** a âncora golden-v1 do ramo `pt_crase` — questão **Q506** (VUNESP ACS Pref. Osasco 2025, tec **3607076**), com método **Elias M11 TE-simples** e molde L3 **`pt-crase-funnel` 4/4**.

> **Escopo:** 1 JSON em `examples/` + validação + capture + registro no playbook. **Não** escalar lote gNN inteiro nem `catalog:apply-lote --apply` nesta conversa (salvo pedido explícito separado).

**Âncora canônica:** [`examples/questao-premium-vunesp-portugues-crase-funil.json`](../examples/questao-premium-vunesp-portugues-crase-funil.json)  
**Slug no player / capture:** `questao-premium-vunesp-portugues-crase-funil`  
**Slug no catálogo (DB):** `vunesp-osasco-crase-serra-capivara` (g01 — mesma prova, nome de slug legado)

---

## Como disparar

```text
Pipeline completo: Língua Portuguesa — Crase (âncora Q506)
```

Variantes:

| Trigger | Quando |
|---------|--------|
| `Pipeline completo: Língua Portuguesa — Crase (âncora Q506)` | Criar/refinar âncora + gates; **parar antes de `--apply`** |
| `+ Só conteúdo` | Reescrever JSON golden (Elias TE-simples); sem React |
| `+ Só capture` | `audit:questao-readiness` + `capture:questao-review` |
| `+ Registrar playbook` | Atualizar `anchors[]` / `visual_gallery` em `lingua-portuguesa.json` |

**Pré-requisito L3 (se molde ainda não existir):** `Mapeamento L3: Língua Portuguesa — pt_crase` — [`L3_MAPEAMENTO_CONVERSA.md`](L3_MAPEAMENTO_CONVERSA.md). Para Q506 o pacote `pt-crase-funnel` já está **ready** no playbook.

---

## Prompt completo (copiar no chat)

Edite só se precisar mudar o objetivo; mantenha os anexos.

```text
Pipeline completo: Língua Portuguesa — Crase (âncora Q506)

Anexos:
@docs/PROMPT_PIPELINE_ANCORA_PT_CRASE_Q506.md
@docs/PIPELINE_COMPLETO_CONVERSA.md
@docs/GOLDEN_CONTENT_STANDARD.md
@examples/_TEMPLATE-golden-v1.json
@examples/questao-premium-vunesp-portugues-crase-funil.json
@.cursor/skills/professor-elias-santana-metodo/SKILL.md
@.cursor/skills/professor-elias-santana-metodo/modules/M11-crase-enriquecido.md
@.cursor/skills/avant-golden-anchor-handcraft/SKILL.md
@.cursor/skills/brief-lingua-portuguesa/SKILL.md
@.cursor/skills/avant-json-template/SKILL.md
@data/catalog-migration/handcraft-playbooks/lingua-portuguesa.json

Objetivo: criar/refinar âncora golden-v1 Q506 (VUNESP Osasco 2025, tec 3607076)
com método Elias M11 TE-simples + molde pt-crase-funnel 4/4.
Parar antes de --apply.
```

---

## Instruções para o agente (executar sem pedir modo)

### Proibido nesta conversa

- `npm run ai:generate` / `catalog:upgrade-premium`
- `catalog:apply-lote --apply` **sem** o usuário escrever explicitamente `pode aplicar`
- `template` / `layout_variant` no JSON (molde vem de `meta.pedagogical_branch: "pt_crase"`)
- Gabarito ou letra no `concept_map` ou `golden_rule`
- Copiar texto da âncora em outras questões (anti-reciclagem)
- Criar molde React novo se `pt-crase-funnel` 4/4 já wired (só ajuste pontual em `ptCraseSlideUtils` se inferência visual falhar)

### Ler antes

| Arquivo | Uso |
|---------|-----|
| [`GOLDEN_CONTENT_STANDARD.md`](GOLDEN_CONTENT_STANDARD.md) | Gramática golden-v1 |
| [`GOLDEN_HANDCRAFT_MODEL.md`](GOLDEN_HANDCRAFT_MODEL.md) | Runbook âncora × lote |
| [`LINGUA_PORTUGUESA_GUIDELINES.md`](LINGUA_PORTUGUESA_GUIDELINES.md) § P0 Crase | Funil 3 testes + fonte tier A |
| [`LINGUA_PORTUGUESA_ELIAS_METODO.md`](LINGUA_PORTUGUESA_ELIAS_METODO.md) | Encadeamento Elias M11 |
| [`VARIANT_MOLDS.md`](VARIANT_MOLDS.md) § pt-crase-funnel | 4 layout_variants do ramo |
| `lib/guidelines/linguaPortuguesa/crase.ts` | `PT_CRASE_CONCURSOS` |
| Playbook `lingua-portuguesa.json` → `pt_crase` | `anchors`, `visual_gallery` |

### Encadeamento de skills (ordem)

1. **`professor-elias-santana-metodo`** — módulo **M11** (`M11-crase-enriquecido.md`); pergunta-teste: *Tem a + a?*
2. **`avant-golden-anchor-handcraft`** — `family: conceito` → slots; **`logic_flow` primeiro**
3. **`brief-lingua-portuguesa`** — metáfora funil (deck / tap-flow / board / trap-arena)
4. **`avant-json-template`** — JSON plano, `pedagogical_branch`, densidade
5. **`avant-neuroslides-visual`** (opcional) — polish de retenção pós-brief; sem copiar feed

Tom TE: linguagem simples, frases curtas, “corte” em vez de jargão gramatical.

---

## Questão-âncora (fonte)

| Campo | Valor |
|-------|--------|
| Caderno | Q506 / tec **3607076** |
| Banca | VUNESP |
| Prova | ACS (Pref. Osasco) 2025 |
| Comando | Assinale a alternativa em conformidade com a norma-padrão de crase |
| Gabarito | **C** — *dirigir-se **à** Serra da Capivara* |
| Família | `conceito` (eliminação A–E) |
| Ramo L3 | `pt_crase` → `pt-crase-funnel` |

**Pegadinhas da prova (funil):**

- A: à + verbo (*à estudar*)
- B: à sem a+a (*à versatilidade*)
- D: à + *todos*
- E: à singular + plural (*à ferramentas*)
- C: regência *dirigir-se a* + *a Serra* → **à**

---

## Fases desta conversa

### Fase A — JSON golden-v1

Arquivo: `examples/questao-premium-vunesp-portugues-crase-funil.json`

| Slide | Função | Regras |
|-------|--------|--------|
| `concept_map` | Funil simples (verbo → a+a → cortes) | Sem gabarito |
| `logic_flow` | Corte letra a letra | `reveal_mode: "tap"`; gabarito no fim |
| `golden_rule` | Funil de bolso | `rows`; pergunta *Tem a + a?*; sem row de letra |
| `danger_zone` | Onde o aluno cai | `items[].correct` **distinto** por distrator |

`meta` obrigatório: `content_standard: "golden-v1"`, `pedagogical_branch: "pt_crase"`, `sources[]` tier A/B, `content_review` com `guideline_snapshot` M11.

### Fase B — Gates

```bash
npm run audit:questao-readiness -- --file=examples/questao-premium-vunesp-portugues-crase-funil.json
npm run validate:goldens -- --file=examples/questao-premium-vunesp-portugues-crase-funil.json --strict
```

**GATE:** saída `[READY]`; zero erros de densidade/spoiler/drift.

### Fase C — Capture L4

```bash
npm run capture:questao-review -- --slug=questao-premium-vunesp-portugues-crase-funil --source=local --viewport=mobile-375
```

Preview dev: `/dev/questao-review?slug=questao-premium-vunesp-portugues-crase-funil&source=local`

PNGs: `artifacts/questao-review/questao-premium-vunesp-portugues-crase-funil/`

### Fase D — Playbook / galeria

Em `data/catalog-migration/handcraft-playbooks/lingua-portuguesa.json` → ramo `pt_crase`:

- `anchors[]` inclui o JSON em `examples/`
- `visual_gallery.status`: `ready` após capture
- `visual_gallery.anchor_slug`: `questao-premium-vunesp-portugues-crase-funil` (sem path)

**L6 por lote** (quando houver `gNN` usando esta âncora): `lote-meta.json` → `anchor_slug` = **só o slug** (não `examples/...json`).

```bash
npm run audit:anchor-review -- --lote=lingua-portuguesa-g02 --record-pass --reviewer=agent --skip-capture
```

### Fase E — STOP (padrão deste prompt)

- **Não** rodar `catalog:apply-lote --apply`
- Escalar catálogo = conversa separada: `Handcraft: Língua Portuguesa` ou `Pipeline completo: Língua Portuguesa` (card Crase inteiro)

---

## Moldes L3 (já existentes — não recriar)

| Slide | `layout_variant` |
|-------|------------------|
| `concept_map` | `pt-crase-funnel-deck` |
| `logic_flow` | `pt-crase-funnel-tap-flow` |
| `golden_rule` | `pt-crase-funnel-board` |
| `danger_zone` | `pt-crase-trap-arena` |

Código: `components/slides/variants/*PtCrase*`, `lib/slides/ptCraseSlideUtils.ts`, `lib/slides/pedagogicalBranch.ts` → `PT_CRASE_MOLD`.

---

## Entregáveis (checklist)

| # | Entregável | Caminho |
|---|------------|---------|
| 1 | JSON âncora golden-v1 | `examples/questao-premium-vunesp-portugues-crase-funil.json` |
| 2 | Readiness | `[READY]` no audit |
| 3 | Captures mobile (e opcional desktop) | `artifacts/questao-review/questao-premium-vunesp-portugues-crase-funil/` |
| 4 | Playbook atualizado | `handcraft-playbooks/lingua-portuguesa.json` |
| 5 | Brief L3 (se ainda não existir) | `artifacts/l3-brief-lingua-portuguesa-pt_crase.md` |

---

## Depois da âncora (outra conversa)

| Objetivo | Trigger |
|----------|---------|
| Handcraft lote Crase g01/g02… | `Handcraft: Língua Portuguesa` + lote no playbook |
| 2ª âncora (lacunas) | Ver candidata `vunesp-osasco-crase-ioga-lacunas-3840787` |
| Apply Supabase | `catalog:apply-lote -- --lote=lingua-portuguesa-gNN` + `pode aplicar` |
| Vendável (`production_ready`) | `Qualidade vendável: Língua Portuguesa` (card Crase) |

---

## Referências cruzadas

| Artefato | Link |
|----------|------|
| Pipeline genérico | [`PIPELINE_COMPLETO_CONVERSA.md`](PIPELINE_COMPLETO_CONVERSA.md) |
| Handcraft lote | [`HANDCRAFT_CONVERSA.md`](HANDCRAFT_CONVERSA.md) |
| L3 mapeamento | [`L3_MAPEAMENTO_CONVERSA.md`](L3_MAPEAMENTO_CONVERSA.md) |
| L6 âncora | [`ANCHOR_SECOND_REVIEW_PROMPT.md`](ANCHOR_SECOND_REVIEW_PROMPT.md) |
| Playbook PT | [`data/catalog-migration/handcraft-playbooks/lingua-portuguesa.json`](../data/catalog-migration/handcraft-playbooks/lingua-portuguesa.json) |
| Registry | `handcraft-registry.json` → pacote `lingua-portuguesa` |

---

## Atualização

| Data | Nota |
|------|------|
| 2026-07-19 | Doc criado — prompt âncora Q506 Elias M11 TE-simples; stop antes de apply |

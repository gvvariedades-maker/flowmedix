# BRIEF DE VARIANTES — Epidemiologia / epi_vigilancia_acoes

**Gerado:** 2026-08-01  
**Política:** `molde_redesign` (genérico lime existe; pegadinha VE×VS merece metáfora dedicada)  
**Família:** `conceito` · `vf` · `certo_errado`  
**Template:** `lime` (t09)  
**Âncora (export):** `adm-tec-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563768972-3`  
**Cluster:** Vigilância epidemiológica — conceito e ações (~26 slugs, ~12%)

---

## Cabeçalho

| Campo | Valor |
|-------|-------|
| Subtópico canônico | Epidemiologia e Vigilância Epidemiológica |
| `pacote_prefix` | epidemiologia-e-vigilancia-epidemiologica |
| `branch_id` | epi_vigilancia_acoes |
| Família | conceito / vf |
| Decisão L3 | molde_redesign |
| Âncora | I/II/III — troca de definições VE × VS; só III correta → “apenas uma” |
| Erro espacial (1 frase) | Aluno **troca os rótulos** Vigilância Epidemiológica × Vigilância Sanitária. |

**Metáfora única 4/4:** **Dual-label arena** — duas caixas (VE × VS) → tap de atribuição de assertivas → board de finalidades → trap do rótulo invertido.

---

## 0. Questão âncora

| Campo | Valor |
|-------|-------|
| Tipo | I / II / III — definições VE e VS |
| Pegadinha | I e II **invertem** VE e VS; III (vigilância nutricional/alimentos no SUS) correta |
| Gabarito | C — Apenas uma afirmativa está correta |

**Por que redesign (não só genérico sem metáfora):**

1. Erro é **categorial** — dois rótulos oficiais trocados.
2. Volume ≥ limiar (26 ≥ 22).
3. `morphological` + `compare` bastam se a metáfora dual-label for explícita no handcraft; React opcional depois.

**Teste espacial 3/3:** (1) não é só texto livre — há dois buckets oficiais; (2) ≥5 e ≥10%; (3) compare ajuda mas não mostra as duas caixas → **não** rebaixa para ok_generico.

---

## Pacote L3 (4× `layout_variant`)

| # player | `type` | `layout_variant` | Metáfora |
|---------:|--------|------------------|----------|
| 1 | `concept_map` | `epi-ve-vs-split` | Duas colunas: VE (dados/agravos) × VS (ambiente/produtos/serviços) |
| 2 | `logic_flow` | `epi-ve-vs-tap` | Tap: atribuir cada assertiva ao rótulo certo → contar corretas |
| 3 | `golden_rule` | `epi-ve-vs-board` | Finalidades oficiais lado a lado |
| 4 | `danger_zone` | `epi-ve-vs-trap` | Rótulo invertido × definição correta |

---

## Slots

### 1 · `concept_map` — `epi-ve-vs-split`

| Slot | Papel | label | Gatilhos |
|------|-------|-------|----------|
| 1 | VE | Coleta, análise, disseminação | epidemiológica, agravos, determinantes |
| 2 | VS | Ambiente, bens, serviços | sanitária, meio ambiente, produção |
| 3 | SUS | Vigilância nutricional / alimentos | nutricional, inspeção, água |
| 4 | Ação VE | Recomendar prevenção/controle | prevenção, controle, agravo |
| 5 | Pegadinha | Não inverter rótulos | troca VE/VS |

### 2 · `logic_flow` — `epi-ve-vs-tap`

| Passo | Decisão |
|-------|---------|
| 1 | A assertiva descreve dados/agravos (VE) ou ambiente/bens (VS)? |
| 2 | O rótulo do enunciado bate com a descrição? |
| 3 | Contar quantas assertivas sobrevivem |
| 4 | Gabarito pela contagem (ex.: apenas uma) |

### 3 · `golden_rule` — `epi-ve-vs-board`

| label | value |
|-------|-------|
| VE | Conhecer/detectar mudanças em determinantes → recomendar prevenção/controle de agravos |
| VS | Intervir em riscos do meio ambiente, produção/circulação de bens e serviços |
| Fonte | Lei 8.080 / Guia de Vigilância MS |

### 4 · `danger_zone` — `epi-ve-vs-trap`

| label | Erro | correct |
|-------|------|---------|
| I | Define VS com texto de VE (ou vice-versa) | Rótulo deve casar com a finalidade legal |
| II | Idem — rótulo invertido | VS ≠ VE |
| “Todas corretas” | Aceita I+II invertidas | Só a assertiva com rótulo certo vale |

---

## Contrato JSON

```text
concept_map: slots VE vs VS sem gabarito
logic_flow: classificar rótulo → contar → gabarito (tap)
golden_rule.rows: finalidades oficiais
danger_zone.correct: por distrator/assertiva
meta.pedagogical_branch: epi_vigilancia_acoes
```

## DoD / handoff

- Handcraft: `morphological` / `reference_table` / `tap` / `compare` com metáfora dual-label explícita.
- React bespoke opcional: `Implementar molde: epi_vigilancia_acoes`.

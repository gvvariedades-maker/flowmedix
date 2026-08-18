# BRIEF DE VARIANTES — Epidemiologia / epi_indicadores

**Gerado:** 2026-08-01  
**Política:** `molde_inedito`  
**Família:** `conceito` · `calc` (fórmulas) · `vf`  
**Template:** `lime` (t09)  
**Âncora (export):** `adm-tec-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563778577-6`  
**Cluster:** Indicadores — incidência, prevalência, mortalidade, letalidade (~34–36 slugs, ~16%)

---

## Cabeçalho

| Campo | Valor |
|-------|-------|
| Subtópico canônico | Epidemiologia e Vigilância Epidemiológica |
| `pacote_prefix` | epidemiologia-e-vigilancia-epidemiologica |
| `branch_id` | epi_indicadores |
| Família | conceito / calc |
| Decisão L3 | molde_inedito |
| Âncora | Óbitos / população em risco → **mortalidade** (não letalidade) |
| Erro espacial (1 frase) | Aluno troca o **denominador** (população vs casos) ou o par incidência×prevalência. |

**Metáfora única 4/4:** **Formula-rail** — numerador/denominador em trilho → tap de classificação → tabela de referência → trap do denominador invertido.

---

## 0. Questão âncora

| Campo | Valor |
|-------|-------|
| Enunciado | Medida = nº de óbitos / população em risco — qual conceito? |
| Gabarito | C — Mortalidade |
| Distratores | Incidência, Morbidade, Letalidade |

**Por que bespoke:**

1. Erro é **numérico/estrutural** — numerador e denominador definem o indicador.
2. Letalidade (óbitos/casos) vs mortalidade (óbitos/população) é pegadinha clássica TE.
3. Volume ≥ limiar (36 ≥ 22).
4. `compare` puro não mostra o **trilho da fração**.

---

## Pacote L3 (4× `layout_variant`)

| # player | `type` | `layout_variant` | Metáfora |
|---------:|--------|------------------|----------|
| 1 | `concept_map` | `epi-formula-rail` | Quatro indicadores como estações do trilho (N/D) |
| 2 | `logic_flow` | `epi-formula-tap` | Tap: ler N e D → classificar → gabarito |
| 3 | `golden_rule` | `epi-formula-board` | Tabela N × D × nome |
| 4 | `danger_zone` | `epi-formula-trap` | Denominador errado × correto |

---

## Slots

### 1 · `concept_map` — `epi-formula-rail`

| Slot | Papel | label | Gatilhos |
|------|-------|-------|----------|
| 1 | Incidência | Casos novos / pop. risco | incidência, casos novos |
| 2 | Prevalência | Casos existentes / pop. | prevalência, estoque |
| 3 | Mortalidade | Óbitos / pop. | mortalidade, população |
| 4 | Letalidade | Óbitos / casos do agravo | letalidade, entre doentes |
| 5 | Pegadinha | Não inverter D | denominador |

### 2 · `logic_flow` — `epi-formula-tap`

| Passo | Decisão |
|-------|---------|
| 1 | Qual é o numerador no enunciado? |
| 2 | Qual é o denominador (população × casos)? |
| 3 | Eliminar indicadores com outro D |
| 4 | Nomear o indicador → gabarito |

### 3 · `golden_rule` — `epi-formula-board`

| label | value |
|-------|-------|
| Incidência | casos novos / população em risco (período) |
| Prevalência | casos existentes / população |
| Mortalidade | óbitos / população exposta |
| Letalidade | óbitos / total de casos do agravo |

### 4 · `danger_zone` — `epi-formula-trap`

| label | Erro | correct |
|-------|------|---------|
| Incidência | Lê óbitos como casos novos | Incidência usa **casos novos**, não óbitos |
| Morbidade | Genérico demais | Trecho descreve **taxa de mortalidade** |
| Letalidade | Usa pop. como D | Letalidade = óbitos / **casos**, não população |

---

## Contrato JSON

```text
concept_map: numerador/denominador por indicador
logic_flow: N → D → eliminar → gabarito (tap)
golden_rule.rows: 4 fórmulas MS — sem gabarito letra
danger_zone.correct: único por distrator
meta.pedagogical_branch: epi_indicadores
```

## DoD / handoff

- Handcraft genérico com `rows` densas até React `epi-formula-rail`.
- `Implementar molde: epi_indicadores` → VARIANT_MOLDS §3.

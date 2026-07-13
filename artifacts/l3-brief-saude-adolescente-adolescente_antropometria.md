# BRIEF DE VARIANTES — Saúde do Adolescente / adolescente_antropometria

**Gerado:** 2026-07-13  
**Política:** `molde_inedito` (condicional — sub-cluster escore Z com **1 slug** no catálogo; brief formal antes de React)  
**Família:** `calc` | `conceito` (faixas Z do IMC / estatura na Caderneta)  
**Template:** `sky` (t08)  
**Âncora primária:** `ibam-enfermagem-nutricao-aplicada-a-enfermagem-1777102845644-0`  
**Âncora secundária (não usar este molde):** `amauc-enfermagem-saude-do-adolescente-1777104229064-5` — obesidade/comorbidades sem Z; manter `ADOLESCENTE_GENERIC_DESIGN` ou reclassificar `adolescente_saude_mental`  
**Cluster Z-score:** 1 slug (6,25%) · **Ramo declarado:** 2 slugs (12,5%)

---

## 0. Questão âncora

| Campo | Valor |
|-------|-------|
| Banca / ano | IBAM — Pref São Vicente 2025 |
| Tipo | Múltipla escolha — classificação por escore Z do IMC (Caderneta do Adolescente / OMS) |
| Gabarito | A — sobrepeso = Z entre +1 e +2 + orientação alimentar e atividade física |

**Erro reproduzível (1 frase):** o aluno **desloca um desvio-padrão** na tabela — rotula obesidade grave numa faixa de obesidade (+2 a +3), confunde estatura muito baixa (−1 a −2) com limiar <−3, ou troca magreza (−3 a −2) com magreza acentuada (<−3).

**Por que bespoke (não `reference_table` + `compare` genéricos):**

1. O erro é **espacial/categorial** — a banca move o intervalo **uma faixa** na reta Z; tabela estática não fixa a posição relativa.
2. Números normativos (−3 · −2 · +1 · +2 · +3) pedem **trilho monoespaçado** com estações, não só linhas de tabela.
3. O padrão se repete em provas de nutrição/AB — **potencial de escala** no catálogo (hoje 1 slug; meta ≥5 para implementar).
4. `compare` texto×texto ensina a correção, mas **não ancora** “grave = além de ±3” na memória visual.

**Teste espacial (VARIANT_MOLDS §2):**

| Pergunta | Resposta |
|----------|----------|
| Pegadinha espacial? | **Sim** — deslocamento de faixa na reta Z |
| <5 questões e <10% hoje? | **Sim** (1 slug Z) → implementação **condicional** |
| `compare` + `correct` basta? | Parcial — tabela genérica já aprovada (A4 humano); molde bespoke = polish + transferência |

**Escopo do pacote:** moldes abaixo aplicam-se **somente** quando o corpus contém `escore Z`, `IMC`, `Caderneta`, `sobrepeso`, `magreza acentuada`, `estatura muito baixa` — **não** para obesidade/comorbidades sem Z (slug amauc).

---

## 1. Metáfora do pacote

**“Reta de crescimento OMS → painel de faixas Z da Caderneta → tap classifica cada alternativa no trilho → armadilha mostra distrator na faixa errada × limiar correto.”**

Universo visual único: **eixo Z horizontal** (sky/cyan), chips monoespaçados `−3 · −2 · +1 · +2 · +3`, faixas coloridas (magreza âmbar · eutrofia neutro · sobrepeso sky · obesidade rose), sem cortina de sigilo (ramo ≠ ética).

Compartilha filosofia com `vitals_pediatrico_faixas` (faixas por parâmetro), mas o eixo é **desvio-padrão do IMC/estatura**, não FC/FR.

---

## 2. Slide 1 — `concept_map`

- **`layout_variant`:** `adolescent-growth-z-rail`
- **Metáfora visual:** trilho horizontal com 7 estações na reta Z; cada `item` do JSON acende uma estação ou bloco de contexto acima/abaixo do eixo.
- **Componente proposto:** `AdolescentGrowthZRailConceptMap.tsx`

**Wire (375px):**

```text
  CADERNETA — ESCORE Z (5–19 anos)
        −3      −2       0      +1      +2      +3
         │───────│────────│───────│───────│───────│
    [◆] Magreza acentuada    Eutrofia    [◆] Sobrepeso
         ▲                              ▲
    [card Ferramenta]              [card Conduta]
    Caderneta + curvas OMS         Orientar estilo de vida
├─────────────────────────────────────────────────────┤
│ footer: memorize +1 a +2 = sobrepeso                │
└─────────────────────────────────────────────────────┘
```

**Interação:**

| Gesto | Estado inicial | Estado final |
|-------|----------------|--------------|
| Toque na estação Z | Estação apagada (outline) | Estação preenchida + `detail` do item vinculado |
| Toque no card acima do trilho | `line-clamp-2` | Expande `detail` completo |
| Scroll horizontal | Eixo completo visível em 375px | Snap nas estações −3, −2, 0, +1, +2, +3 |

**Slots:**

| Slot | Papel | Exemplo `label` | Palavras-gatilho no `detail` |
|------|-------|-----------------|--------------------------------|
| `tool` | Ferramenta | `Ferramenta` | `caderneta`, `curvas OMS`, `gráfico` |
| `metric` | Métrica | `Escore Z` | `desvio-padrão`, `mediana`, `referência` |
| `band_overweight` | Faixa-alvo | `Sobrepeso` | `+1`, `+2`, `sobrepeso`, `orientar` |
| `action` | Conduta | `Conduta` | `alimentação`, `atividade física`, `acompanhar` |
| `band_severe_low` | Limiar grave baixo | `Magreza acentuada` | `< −3`, `muito baixa`, `grave` |
| `band_severe_high` | Limiar grave alto | `Obesidade grave` | `> +3`, `grave` |
| `pegadinha` | Alerta banca | `Pegadinha ±1 DP` | `deslocar`, `um desvio`, `faixa intermediária` |

**Ícones Lucide:** `BarChart3`, `TrendingUp`, `Apple`, `HeartPulse`, `AlertTriangle`, `Ruler`, `Scale`

**Mobile:** trilho com scroll horizontal; estações ≥44px; cards empilhados abaixo do eixo em 1 coluna.

**Reduced motion:** todas as estações e cards visíveis sem animação sequencial.

**Par com slide 4:** estações `band_severe_*` e `pegadinha` = alvos dos distratores B/C/D no trap.

**Proibido:** item “Gabarito” ou letra A–E no concept_map.

---

## 3. Slide 2 — `golden_rule`

- **`layout_variant`:** `adolescent-z-band-board`
- **Metáfora visual:** painel de referência com faixas Z em faixas horizontais empilhadas; cada `row` = uma classificação; toque destaca a faixa no mini-trilho embutido.
- **Componente proposto:** `GoldenRuleAdolescentZBandBoard.tsx`

**Wire:**

```text
  CLASSIFICAÇÃO NUTRICIONAL — ESCORE Z IMC
┌──────────────────────────────────────────┐
│ Magreza acentuada      Z < −3      [warn]│
│ Magreza                −3 ≤ Z < −2 [warn]│
│ Eutrofia               −2 ≤ Z ≤ +1 [ok]  │
│ Sobrepeso              +1 < Z ≤ +2 [hot]│◀ highlight
│ Obesidade              +2 < Z ≤ +3 [warn]│
│ Obesidade grave        Z > +3      [warn]│
│ Estatura muito baixa   Z est. < −3 [warn]│
├──────────────────────────────────────────┤
│ mini-trilho: faixa ativa sincronizada    │
└──────────────────────────────────────────┘
```

**Interação:**

| Gesto | Efeito |
|-------|--------|
| Toque na `row` | Destaca segmento correspondente no mini-trilho; `value` expande se truncado |
| `emphasis: highlight` | Borda sky na row (sobrepeso na âncora) |
| `badge: hot` | Chip “COBRADO” na faixa sobrepeso |

**Slots (`rows[]`):**

| Slot | `label` | `value` | `badge` |
|------|---------|---------|---------|
| 1 | `Magreza acentuada` | `Z < −3` | `warn` |
| 2 | `Magreza` | `−3 ≤ Z < −2` | `warn` |
| 3 | `Eutrofia` | `−2 ≤ Z ≤ +1` | `ok` |
| 4 | `Sobrepeso` | `+1 < Z ≤ +2` | `hot` + `highlight` |
| 5 | `Obesidade` | `+2 < Z ≤ +3` | `warn` |
| 6 | `Obesidade grave` | `Z > +3` | `warn` |
| 7 | `Estatura muito baixa` | `Z estatura < −3` | `warn` |

**Proibido:** row “Gabarito letra A”.

**`content`:** título ≤36c — ex. `CLASSIFICAÇÃO — ESCORE Z IMC (5–19 A)`

**`footer_rule`:** `Sobrepeso: +1 a +2 · grave/acentuado: além de ±3`

---

## 4. Slide 3 — `logic_flow`

- **`layout_variant`:** `adolescent-z-classify-tap`
- **`reveal_mode`:** `tap` (obrigatório)
- **Metáfora visual:** cada passo posiciona uma alternativa no trilho Z ou elimina por faixa errada; dots de progresso; último passo fixa a letra sem spoiler nos slides 1–2.
- **Componente proposto:** `LogicFlowAdolescentZClassifyTap.tsx`

**Wire:**

```text
  [ CLASSIFICAR Z ]    ● ○ ○ ○ ○ ○
┌─────────────────────────────────────┐
│ Comando: faixa correta na Caderneta │
│         [ Próximo ▶ ]               │
└─────────────────────────────────────┘
        … testar B no trilho (+2→+3) …
┌─────────────────────────────────────┐
│ A: +1 a +2 = sobrepeso → mantém     │
│ Marcar A.                           │
└─────────────────────────────────────┘
```

**Interação:**

| Gesto | Efeito |
|-------|--------|
| Toque “Próximo” | Revela passo seguinte |
| Passo `classify` | Parser `Letra X` + faixa → anima marcador no trilho (cor ok/erro) |
| Passo `eliminate` | Marcador vermelho na faixa errada citada |
| Passo `mark` | Chip “Gabarito” só aqui |

**Quantidade de passos:** 6–9 strings (âncora usa 7).

**Parser (`parseAdolescentZStep`):**

| Tipo | Gatilho regex |
|------|----------------|
| `context` | `/comando:/i` |
| `classify_ok` | `/conforme MS|correta|mantém/i` + letra |
| `eliminate` | `/elimina|falsa|faixa errada/i` |
| `threshold` | `/grave|acentuada|muito baixa|< −3|> \+3/i` |
| `mark` | `/marcar [A-E]/i` |
| `fixacao` | `/fixação:|em similares/i` |

**`footer_rule`:** `Calcule Z → classifique → confira limiar antes de marcar`

---

## 5. Slide 4 — `danger_zone`

- **`layout_variant`:** `adolescent-z-threshold-trap`
- **`bullet_style`:** `x_icon`
- **Metáfora visual:** cada distrator aparece como marcador na **faixa errada** do trilho; coluna `correct` puxa o marcador para a faixa MS/OMS certa.
- **Componente proposto:** `DangerZoneAdolescentZThresholdTrap.tsx`

**Wire:**

```text
  PEGADINHAS — ESCORE Z
┌─────────────────────────────────────┐
│ [B] ✗  marcador em +2→+3 "grave"    │
│      → correto: obesidade; grave >+3│
├─────────────────────────────────────┤
│ [C] ✗  −1 a −2 "muito baixa"        │
│ [D] ✗  −2 a −3 "severa"             │
├─────────────────────────────────────┤
│ [transfer] deslocar ±1 DP           │
└─────────────────────────────────────┘
```

**Interação:** toque no card → revela `correct`; mini-trilho anima shift distrator → faixa certa (reduced motion: estados finais lado a lado).

**Par com slide 1:** slots `pegadinha` e `band_severe_*` = mesmos limiares dos traps B/C/D.

**Slots (`items[]`):**

| Slot | `label` | Pegadinha (`detail`) | `correct` único |
|------|---------|----------------------|-----------------|
| B | `Letra B — obesidade grave +2 a +3` | rotula grave na faixa de obesidade | `Z +2 a +3 = obesidade; grave = Z > +3` |
| C | `Letra C — estatura muito baixa −1 a −2` | usa faixa intermediária | `muito baixa exige Z < −3` |
| D | `Letra D — magreza severa −2 a −3` | confunde magreza com acentuada | `acentuada = Z < −3` |
| transfer | `Em outra banca — deslocar ±1 DP` | prova troca limiar | `grave = além de ±3; sobrepeso = +1 a +2` |

---

## 6. Contrato de inferência

| Molde | Regex / palavras-gatilho |
|-------|--------------------------|
| `adolescent-growth-z-rail` | `inferZRailSlot`: `caderneta\|curvas oms` → `tool`; `desvio\|escore z\|score z` → `metric`; `sobrepeso\|\\+1.*\\+2` → `band_overweight`; `alimentação\|atividade` → `action`; `< −3\|< -3\|muito baixa\|acentuada` → `band_severe_low`; `> \+3\|grave` → `band_severe_high`; `deslocar\|desvio-padrão` → `pegadinha` |
| `adolescent-z-band-board` | `inferZBandRow`: parse `label` para faixa; `extractZRange(value)` → highlight no mini-trilho; `badge hot` → chip COBRADO |
| `adolescent-z-classify-tap` | `parseAdolescentZStep`: ver tabela §4; `extractLetter(text)` → `/[A-E]/` |
| `adolescent-z-threshold-trap` | `inferZTrapBand(detail)`: `/\\+2.*\\+3\|−1.*−2\|−2.*−3/`; `inferCorrectBand(correct)` → posição no trilho |

**Guards (`moldAffinity.ts`):**

- Aplicar **somente** se `pedagogical_branch === 'adolescente_antropometria'`.
- `blockFamilies`: nenhum (calc é o caso principal).
- `blockPatterns`: `escuta\|sigilo\|gravidez\|confidencial` → rejeita (não roubar ramo ética).
- `positivePatterns`: `escore\s*z\|score\s*z\|\\bz\\b.*[<>]\|imc\|caderneta\|sobrepeso\|magreza\|eutrofia\|estatura`.
- **Não** aplicar se corpus tem `anorexia\|bulimia` sem escore Z (priorizar `adolescente_saude_mental`).

**Wiring futuro:** `BRANCH_DESIGN_MAP['saude do adolescente'].adolescente_antropometria` substituir `ADOLESCENTE_GENERIC_DESIGN` · `MOLD_AFFINITY_RULES` · `themeGenerator` · `NeuroSlide.tsx` · e2e em `visual-anchors.json`.

---

## 7. Exemplo JSON mínimo

Trecho derivado da âncora IBAM (formato plano v2):

```json
{
  "meta": {
    "subtopico": "Saúde do Adolescente",
    "pedagogical_branch": "adolescente_antropometria",
    "family": "calc",
    "content_standard": "golden-v1"
  },
  "reverse_study_slides": [
    {
      "type": "concept_map",
      "items": [
        { "label": "Ferramenta", "detail": "Caderneta do Adolescente + curvas OMS para estatura e IMC.", "icon": "BarChart3" },
        { "label": "Escore Z", "detail": "Desvios-padrão em relação à mediana da população de referência.", "icon": "TrendingUp" },
        { "label": "Sobrepeso", "detail": "IMC com Z entre +1 e +2 — orientar estilo de vida.", "icon": "Apple" },
        { "label": "Conduta", "detail": "Classificar, orientar alimentação e atividade física precocemente.", "icon": "HeartPulse" }
      ],
      "footer_rule": "Z do IMC: memorize faixas — sobrepeso = +1 a +2"
    },
    {
      "type": "golden_rule",
      "content": "CLASSIFICAÇÃO — ESCORE Z IMC (5–19 A)",
      "rows": [
        { "label": "Magreza acentuada", "value": "Z < −3", "badge": "warn" },
        { "label": "Eutrofia", "value": "−2 ≤ Z ≤ +1", "badge": "ok" },
        { "label": "Sobrepeso", "value": "+1 < Z ≤ +2", "badge": "hot", "emphasis": "highlight" },
        { "label": "Obesidade grave", "value": "Z > +3", "badge": "warn" },
        { "label": "Estatura muito baixa", "value": "Z estatura < −3", "badge": "warn" }
      ],
      "footer_rule": "Grave/acentuado = além de ±3"
    },
    {
      "type": "logic_flow",
      "reveal_mode": "tap",
      "steps": [
        "Comando: alternativa correta sobre categorias de escore Z (Caderneta do Adolescente).",
        "A: sobrepeso com Z entre +1 e +2 + orientações → conforme MS/OMS → correta.",
        "B: +2 a +3 como obesidade grave → falsa (nessa faixa = obesidade; grave = Z > +3) → elimina.",
        "C: estatura muito baixa entre −1 e −2 → limiar errado → elimina.",
        "D: magreza severa entre −2 e −3 → faixa errada → elimina.",
        "Marcar A.",
        "Fixação: em similares, grave/acentuado = além de ±3."
      ]
    },
    {
      "type": "danger_zone",
      "bullet_style": "x_icon",
      "content": "PEGADINHAS — ESCORE Z",
      "items": [
        {
          "label": "Letra B — obesidade grave +2 a +3",
          "detail": "Rotula obesidade grave numa faixa que corresponde a obesidade.",
          "correct": "Z entre +2 e +3 = obesidade; obesidade grave = Z > +3."
        },
        {
          "label": "Letra C — estatura muito baixa −1 a −2",
          "detail": "Usa faixa intermediária como muito baixa.",
          "correct": "Estatura muito baixa exige Z < −3."
        },
        {
          "label": "Em outra banca — deslocar ±1 DP",
          "detail": "Prova troca limiar de grave por faixa intermediária.",
          "correct": "Grave/acentuado = além de ±3; sobrepeso = +1 a +2."
        }
      ],
      "footer_rule": "Banca desloca um desvio-padrão — feche a tabela antes de marcar"
    }
  ]
}
```

---

## 8. Anti-padrões deste pacote

| Proibido | Motivo |
|----------|--------|
| Reutilizar `adolescent-privacy-curtain` / `sigilo-spectrum` | Ramo ≠ ética; guard de afinidade |
| Gabarito nos slides 1–2 | Mata estudo reverso |
| Trilho Z em slug sem escore Z (ex. amauc comorbidades) | `mold_l3_zero_slots` / drift |
| Hardcodar faixas de uma banca no componente | Conteúdo vem do JSON |
| >7 estações visíveis sem scroll | Estoura memória de trabalho |
| Confundir Z de IMC com Z de estatura sem label | Duas métricas — chips separados |

---

## 9. Critérios de aceite (DoD)

- [ ] 4× `layout_variant` declarados: `adolescent-growth-z-rail` · `adolescent-z-band-board` · `adolescent-z-classify-tap` · `adolescent-z-threshold-trap`
- [ ] Rails/slots preenchidos com JSON do §7 (âncora IBAM)
- [ ] Preview 375px legível — trilho com scroll horizontal
- [ ] 0 hardcode de gabarito/letra no componente React
- [ ] Par concept_map `pegadinha` ↔ danger_zone `transfer` coerente
- [ ] `footer_rule` com estratégia de prova (“±1 DP”, “grave além de ±3”)
- [ ] `moldAffinity`: só `adolescente_antropometria` + corpus Z-score
- [ ] e2e `visual-mold-regression` com slug IBAM após implementação
- [ ] Golden `examples/questao-premium-ibam-saude-adolescente-escore-z.json` (opcional pré-React)

---

## 10. Handoff para engenharia

**Trigger:** `Implementar molde: adolescente_antropometria`

**Ordem sugerida:**

1. `AdolescentGrowthZRailConceptMap.tsx` + testes de `inferZRailSlot`
2. `GoldenRuleAdolescentZBandBoard.tsx`
3. `LogicFlowAdolescentZClassifyTap.tsx`
4. `DangerZoneAdolescentZThresholdTrap.tsx`
5. Atualizar `BRANCH_DESIGN_MAP` · `MOLD_AFFINITY_RULES` · `moldSlotFit` · `NeuroSlide.tsx`
6. Reclassificar `amauc-…9064-5` → `adolescente_saude_mental` (recomendado) ou manter genérico
7. Playwright + captura `capture:questao-review` no IBAM

**Gate de volume:** implementar React **somente** quando catálogo tiver **≥5 slugs** com escore Z **ou** pedido explícito de polish flagship.

**Até lá:** manter `ADOLESCENTE_GENERIC_DESIGN` (estado atual `production_ready`).

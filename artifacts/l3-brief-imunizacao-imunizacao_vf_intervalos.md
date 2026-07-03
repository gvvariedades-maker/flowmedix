# BRIEF DE VARIANTES — Imunização / imunizacao_vf_intervalos

**Gerado:** 2026-07-02  
**Política:** `molde_redesign` (moldes legados no repo — brief formal antes de escalar handcraft)  
**Família:** `vf`  
**Template:** `lime` (t09)  
**Âncora:** `examples/questao-premium-cpcon-imunizacao-intervalos-vf.json`  
**Cluster:** V/F — intervalos PNI (I/II/III/IV) · 18 slugs · 3,1% · `sample_slugs[0]`: `cpcon-uepb-enfermagem-imunizacao-1779563975447-5`

---

## 0. Questão âncora

| Campo | Valor |
|-------|-------|
| Banca / ano | CPCON UEPB — Pref Nova Palmeira 2025 |
| Tipo | V/F I–IV + combinação MCQ (“É CORRETO o que se afirma em”) |
| Gabarito | C — II, III e IV apenas |

**Erro reproduzível (1 frase):** o aluno aceita a afirmativa I como verdadeira (“4 dias antes = erro + repetir”) quando o PNI trata antecipação ≤4 dias como **dose válida** (grace period).

**Por que bespoke (não `compare` genérico):**

1. O erro é **espacial/sequencial** — julgar I→II→III→IV, montar conjunto V/F, depois eliminar letras.
2. Números normativos (4D · 30D · 8SEM · 1A) pedem **chips monoespaçados**, não parágrafo.
3. Padrão se repete em **18 questões** do catálogo (≥5).
4. `compare` texto×texto não fixa a ordem de julgamento nem o mapa I–IV alinhado ao enunciado.

---

## 1. Metáfora do pacote

**“Baralho de regras PNI → matriz V/F com chips de intervalo → juggle carta a carta até a letra → armadilhas por letra e por número.”**

Universo visual único: **cartas/chips lime+sky**, numeração monoespaçada, romanos I–IV espelhando o enunciado.

---

## 2. Slide 1 — `concept_map`

- **`layout_variant`:** `pni-rules-deck`
- **Metáfora visual:** deck de cartas PNI empilhadas em grade 2 colunas — cada carta = uma afirmativa ou núcleo de intervalo.
- **Componente:** `PniRulesDeckConceptMap.tsx`

**Wire (375px):**

```text
┌─────────────────┬─────────────────┐
│ [V/F] Afirm. I  │ [V/F] Afirm. II │
│ grace 4d        │ SCR×FA <2a      │
├─────────────────┼─────────────────┤
│ [V/F] Afirm. III│ [V/F] Afirm. IV │
│ VPC13/VPP23     │ oral×injétavel  │
├─────────────────┴─────────────────┤
│ pegadinha I · padrão CPCON        │
└───────────────────────────────────┘
```

**Interação:**

| Gesto | Estado inicial | Estado final |
|-------|----------------|--------------|
| Toque na carta | `line-clamp-3` no `detail` | Expande texto completo (`aria-expanded`) |
| — | Chip V/F inferido de “VERDADEIRA/FALSA” no detail | Badge emerald (V) ou rose (F) |

**Slots:**

| Slot | Papel | Exemplo label | Palavras-gatilho no `detail` |
|------|-------|---------------|--------------------------------|
| 1 | Afirmativa I | `Afirmativa I — grace period (4 dias)` | `grace`, `4 dias`, `FALSA`, `válida` |
| 2 | Afirmativa II | `Afirmativa II — SCR/SCRV × febre amarela` | `menor de 2`, `30 dias`, `VERDADEIRA`, `simultâneo` |
| 3 | Afirmativa III | `Afirmativa III — VPC13 e VPP23` | `8 semanas`, `VPC13`, `VPP23`, `1 ano` |
| 4 | Afirmativa IV | `Afirmativa IV — oral × injetável` | `oral`, `injetável`, `simultâneo` |
| 5 | Síntese (opcional) | `Combinação correta` | `letra C`, `II, III e IV` → categoria `gabarito` |
| 6 | Pegadinha | `Pegadinha da I` | `erro + repetir`, `grace period` |
| 7 | Padrão banca | `Padrão CPCON neste tema` | `três afirmativas literais`, `invertida` |

**Ícones Lucide:** `Clock`, `Baby`, `Shield`, `Pill`, `CheckCircle`, `AlertTriangle`, `Target`

**Mobile:** grid 1 col &lt;640px, 2 col ≥640px; alvo toque = carta inteira (≥44px altura).

**Reduced motion:** sem animação de entrada escalonada obrigatória — cards visíveis de uma vez.

**Par com slide 4:** cartas I–IV aqui = alvos das pegadinhas por letra (A inclui I falsa, E subestima II+III).

---

## 3. Slide 2 — `golden_rule`

- **`layout_variant`:** `pni-interval-matrix`
- **Metáfora visual:** matriz de julgamento V/F — cada `row` = afirmativa com badge VERDADEIRA/FALSA + chips de intervalo.
- **Componente:** `GoldenRulePniIntervalMatrix.tsx`

**Wire:**

```text
  INTERVALOS PNI — JULGAMENTO DAS AFIRMATIVAS
┌──────────────────────────────────────────┐
│ I — antecipação 4d    [FALSA]  [4D]      │
├──────────────────────────────────────────┤
│ II — SCR×FA <2a       [VERD.] [30D]     │
├──────────────────────────────────────────┤
│ III — VPC13×VPP23     [VERD.] VPC13→8SEM │
├──────────────────────────────────────────┤
│ IV — oral×injétavel   [VERD.]            │
├──────────────────────────────────────────┤
│ extra: virais 4sem · oral×oral 15d       │
├──────────────────────────────────────────┤
│ Combinação → letra C  [hot]              │
└──────────────────────────────────────────┘
```

**Interação:** scroll vertical; mini-fluxo VPC13→VPP23 renderizado quando `row` cita pneumo.

**Slots (`rows[]`):**

| Slot | `label` | `value` | `badge` / `emphasis` |
|------|---------|---------|----------------------|
| I | `I — antecipação 4 dias` | grace period válido | `warn` / `alert` → FALSA |
| II | `II — SCR/SCRV × FA <2 anos` | não simultâneo; 30d | `ok` |
| III | `III — VPC13 × VPP23` | 8sem; VPC13 1º; 1a se VPP23 1º | `ok` |
| IV | `IV — oral × injetável` | livre | `ok` |
| extra | `Virais vivos injetáveis` | 4 semanas | `info` |
| extra | `Oral × oral` | 15 dias | `warn` |
| síntese | `Combinação — gabarito` | II, III e IV → C | `hot` / `success` |

**Proibido:** row “Gabarito letra X” isolada sem contexto das afirmativas.

**`footer_rule`:** `Decore: grace 4d · FA×SCR 30d · VPC13→VPP23 8sem · oral×IM livre`

---

## 4. Slide 3 — `logic_flow`

- **`layout_variant`:** `pni-vf-juggle-tap`
- **`reveal_mode`:** `tap` (obrigatório)
- **Metáfora visual:** baralho V/F — uma carta por passo; dots de progresso; resumo final com conjunto verdadeiro.
- **Componente:** `LogicFlowPniVfJuggleTap.tsx`

**Wire:**

```text
  [ V/F PNI ]     ● ○ ○ ○ ○ ○ ○ ○ ○ ○
┌─────────────────────────────────────┐
│ Julgar I: grace period → FALSO      │
│         [ Próximo ▶ ]               │
└─────────────────────────────────────┘
        … II → III → IV …
┌─────────────────────────────────────┐
│ Conjunto: II+III+IV → Letra C       │
│ Eliminar A, B, D, E                 │
└─────────────────────────────────────┘
```

**Interação:**

| Gesto | Efeito |
|-------|--------|
| Toque “Próximo” / carta ativa | Revela passo seguinte |
| Passos `judgement` | Parser detecta `Julgar I/II/III/IV` → chip V ou ✗ |
| Passo `combine` | Monta conjunto sem I |
| Passo `locate` | Aponta letra C |
| Passos `eliminate` | Risca letras com I ou só IV |

**Quantidade de passos:** 8–12 strings (âncora usa 10).

**Parser (`parsePniVfStep`):** gatilhos `Julgar I`, `Montar conjunto`, `Localizar alternativa`, `Eliminar`, `Marcar`, `Fixação`.

---

## 5. Slide 4 — `danger_zone`

- **`layout_variant`:** `pni-trap-chips`
- **`bullet_style`:** `x_icon`
- **Metáfora visual:** armadilha por alternativa — chip de intervalo errado × correção; badge letra A–E.
- **Componente:** `DangerZonePniTrapChips.tsx`

**Wire:**

```text
  PEGADINHAS CPCON — INTERVALOS
┌─────────────────────────────────────┐
│ [A] ✗  aceita I como verdadeira     │
│      chips: [4D errado]  → correto  │
├─────────────────────────────────────┤
│ [B] ✗  mantém I, descarta II e IV   │
│ …                                   │
└─────────────────────────────────────┘
```

**Interação:** toque no card → revela coluna `correct` (compare); chips de intervalo iluminam com `inferIntervalChips`.

**Par com slide 1:** cada `items[].label` “Letra X” corresponde à eliminação no logic_flow; itens temáticos (grace, FA, oral×oral) espelham cartas do deck.

**Slots (`items[]`):**

| Slot | `label` | Pegadinha (`detail`) | `correct` único |
|------|---------|----------------------|-----------------|
| A | `Letra A — I, II, III e IV` | aceita I verdadeira | explica grace period |
| B | `Letra B — I e III apenas` | descarta II e IV | cita II e IV verdadeiras |
| D | `Letra D — I e II apenas` | exclui III e IV | cita III e IV |
| E | `Letra E — IV apenas` | fixa só oral | cita II+III+IV |
| tema | `Confundir grace period (I)` | inverte 4 dias | dose válida |
| tema | `Vacinar tudo no mesmo dia (II)` | generaliza simultaneidade | exceção FA&lt;2a |
| tema | `Generalizar IV para oral×oral` | confunde eixos | 15d oral×oral |

---

## 6. Contrato de inferência

| Molde | Regex / palavras-gatilho |
|-------|--------------------------|
| `pni-rules-deck` | `inferPniCategory`: `grace\|4 dia\|intervalo\|vpc13\|vpp23\|oral` → `intervalo`; `inferVfChip`: `verdadeira\|falsa` |
| `pni-interval-matrix` | `extractRomanFromLabel`: `^([IVX]+)\s*[—–-]`; `inferPniMatrixRowBadge`: FALSA/VERDADEIRA no value; `inferIntervalChips`: `4D`, `30D`, `8SEM`, `1A` |
| `pni-vf-juggle-tap` | `parsePniVfStep`: `/Julgar\s+([IVX]+)/i`, `/Montar conjunto/`, `/Localizar alternativa\s+([A-E])/i`, `/Eliminar\s+([A-E])/i` |
| `pni-trap-chips` | `inferPniTrapSlots` + `extractLetterFromLabel`: `Letra\s+([A-E])`; chips via `inferIntervalChips` no `detail` |

**Wiring:** `BRANCH_DESIGN_MAP` → `imunizacao_vf_intervalos` · `pedagogicalBranch.ts` · `themeGenerator` fallback subtópico Imunização.

---

## 7. Exemplo JSON mínimo

Trecho derivado da âncora CPCON (formato plano v2):

```json
{
  "meta": {
    "subtopico": "Imunização",
    "pedagogical_branch": "imunizacao_vf_intervalos",
    "family": "vf",
    "content_standard": "golden-v1"
  },
  "reverse_study_slides": [
    {
      "type": "concept_map",
      "items": [
        { "label": "Afirmativa I — grace period (4 dias)", "detail": "FALSA. Dose até 4 dias antes = válida no PNI.", "icon": "Clock" },
        { "label": "Afirmativa II — SCR × febre amarela", "detail": "VERDADEIRA. Menor de 2 anos: intervalo 30 dias.", "icon": "Baby" },
        { "label": "Afirmativa III — VPC13 e VPP23", "detail": "VERDADEIRA. 8 semanas; VPC13 primeiro.", "icon": "Shield" },
        { "label": "Afirmativa IV — oral × injetável", "detail": "VERDADEIRA. Simultâneo ou qualquer intervalo.", "icon": "Pill" }
      ],
      "footer_rule": "INTERVALOS: I=F · II–IV=V · julgue I antes da combinação"
    },
    {
      "type": "logic_flow",
      "reveal_mode": "tap",
      "steps": [
        "Julgar I: grace period → FALSO.",
        "Julgar II: SCR×FA menor 2 anos → VERDADEIRO.",
        "Julgar III: VPC13/VPP23 → VERDADEIRO.",
        "Julgar IV: oral×injetável → VERDADEIRO.",
        "Montar conjunto verdadeiro: II + III + IV.",
        "Localizar alternativa C.",
        "Eliminar A (inclui I falsa).",
        "Marcar C."
      ]
    },
    {
      "type": "golden_rule",
      "content": "INTERVALOS PNI — JULGAMENTO",
      "rows": [
        { "label": "I — antecipação 4 dias", "value": "FALSA: ≤4 dias = dose válida", "badge": "warn" },
        { "label": "II — SCR×FA <2 anos", "value": "VERDADEIRA: 30 dias", "badge": "ok" },
        { "label": "III — VPC13 × VPP23", "value": "VERDADEIRA: 8sem; VPC13 1º", "badge": "ok" },
        { "label": "IV — oral × injetável", "value": "VERDADEIRA: livre", "badge": "ok" },
        { "label": "Combinação — gabarito", "value": "II, III e IV → letra C", "emphasis": "success", "badge": "hot" }
      ]
    },
    {
      "type": "danger_zone",
      "bullet_style": "x_icon",
      "content": "PEGADINHAS — INTERVALOS I–IV",
      "items": [
        {
          "label": "Letra A — I, II, III e IV",
          "detail": "Aceita I (grace invertido).",
          "correct": "I é FALSA: ≤4 dias antes = dose válida."
        },
        {
          "label": "Letra E — IV apenas",
          "detail": "Ignora II e III verdadeiras.",
          "correct": "Gabarito exige II, III e IV — letra C."
        }
      ],
      "footer_rule": "V/F intervalos: julgue I (grace) antes de montar combinação"
    }
  ]
}
```

---

## 8. Anti-padrões deste pacote

| Proibido | Motivo |
|----------|--------|
| Gabarito letra C no `concept_map` ou `golden_rule` antes do `logic_flow` | Mata estudo reverso |
| Mesmo texto em todos os `correct` | Aluno não aprende por alternativa |
| Hardcode `?? 'C'` no React | Contrato arena — só JSON |
| Carta “gabarito” no deck antes do logic_flow | Spoiler visual |
| Confundir moldes de **calendário** (meses 0·2·3…) com **intervalos** | Drift — usar ramo `imunizacao_calendario` |
| >7 cartas visíveis sem scroll no deck | Estoura memória de trabalho |

---

## 9. Critérios de aceite (DoD)

- [x] 4× `layout_variant` nomeados e registrados em `BRANCH_DESIGN_MAP`
- [x] Componentes existem: `PniRulesDeckConceptMap`, `GoldenRulePniIntervalMatrix`, `LogicFlowPniVfJuggleTap`, `DangerZonePniTrapChips`
- [x] JSON âncora acende slots (inferência `pniSlideUtils`)
- [x] Preview 375px — grade 1col deck, matriz scroll, juggle full-width
- [x] 0 hardcode de gabarito nos componentes
- [x] Par conceito (I–IV) ↔ perigo (letras A–E + grace)
- [x] `footer_rule` com estratégia de prova em cada slide

**Status implementação:** moldes **já implementados** — este brief formaliza contrato para handcraft dos 18 slugs. Próximo passo: handcraft alinhado ao JSON âncora, não redesign React salvo gap encontrado no piloto.

**Próximo trigger:** `Handcraft: Imunização` (slugs do cluster V/F intervalos) ou `Implementar molde: imunizacao_vf_intervalos` se gap de UI no player.

---

*Referências:* [`docs/PROMPT_VARIANTES_NEUROSLIDES.md`](../docs/PROMPT_VARIANTES_NEUROSLIDES.md) · [`docs/L3_MAPEAMENTO_CONVERSA.md`](../docs/L3_MAPEAMENTO_CONVERSA.md) · [`lib/slides/pedagogicalBranch.ts`](../lib/slides/pedagogicalBranch.ts)

# BRIEF DE VARIANTES — Farmacodinâmica e Farmacocinética / farmaco_clinico_protocolo

**Gerado:** 2026-07-04  
**Política:** `molde_redesign` (pacote legado `FARMACO_CLINICO_MOLD` = layouts genéricos — brief formal antes de React)  
**Família:** `protocolo` · `conceito` (caso clínico + MCQ conduta)  
**Template:** `purple` (t13)  
**Âncora primária:** `examples/questao-premium-idecan-omeprazol-ev-ulcera.json`  
**Cluster:** Protocolo / administração clínica (EV, infusão) · 4 slugs cluster · **6 slugs** com `pedagogical_branch=farmaco_clinico_protocolo` (54,5%) · `sample_slugs[0]`: `idecan-enfermagem-farmacodinamica-e-farmacocinetica-1778712122855-6`

---

## 0. Questão âncora

| Campo | Valor |
|-------|-------|
| Banca / ano | IDECAN — SESAP RN 2025 |
| Tipo | MCQ protocolo — omeprazol endovenoso em úlcera péptica grave |
| Gabarito | B — infusão contínua com monitorização de pH gástrico e ajuste de dose |

**Erro reproduzível (1 frase):** o aluno confunde **técnica de administração EV** (diluente, tempo de infusão, via) com **efeito farmacológico** (potencialização, bólus rápido, troca de via).

**Por que bespoke (não `compare` genérico):**

1. O erro é **sequencial/espacial** — conduta correta exige ordem **preparo → diluição → via → tempo → monitorização**.
2. Distractors misturam **slots errados** (fosfato aquecido, SC, bólus) — mapa de estação fixa ensina mais que coluna texto×texto.
3. Padrão em **6 slugs** (≥ limiar `max(5, ceil(11×0,10))`) — ramo forte do subtópico.
4. `cards` + `compare` genéricos não fixam hierarquia diluente × tempo × monitor.

**Teste espacial (VARIANT_MOLDS §2):**

| Pergunta | Resposta |
|----------|----------|
| Pegadinha só textual? | Não — via/tempo/diluente são posicionáveis |
| Padrão &lt;5 slugs e &lt;10%? | Não — 6 slugs, 54,5% |
| `compare` + `correct` basta? | Não — sequência de conduta se perde |

---

## 1. Metáfora do pacote

**“Deck de estação de infusão EV → painel de referência clínica (diluente/via/tempo) → tap-flow de eliminação MCQ → armadilha de técnica errada no slot.”**

Universo visual único: **painel hospitalar purple** com trilho vertical de estações (seringa → frasco diluente → equipo → monitor), chips de alerta (`DILUENTE` · `VIA` · `TEMPO` · `MONITOR`), ícones Lucide clínicos.

**Par conceito-perigo:** estações do deck (slide 1) = eixo de erro nas pegadinhas (slide 4).

---

## 2. Slide 1 — `concept_map`

- **`layout_variant`:** `infusao-ev-station-deck`
- **Metáfora visual:** deck de 5 estações empilhadas — cada card = etapa da administração EV segura.
- **Componente proposto:** `InfusaoEvStationDeckConceptMap.tsx`

**Wire (375px):**

```text
  ESTAÇÕES — OMEPRAZOL EV
┌─────────────────────────┐
│ ① PREPARO    [Pill]     │
│ ② DILUENTE   [Flask]    │  ← toque expande detail
│ ③ VIA        [Syringe]  │
│ ④ TEMPO      [Timer]    │
│ ⑤ MONITOR    [Activity] │
└─────────────────────────┘
  footer: IBP EV = diluir + infundir + monitorar
```

**Interação:**

| Gesto | Estado inicial | Estado final |
|-------|----------------|--------------|
| Toque na estação | Label + ícone compacto | Expande `detail` (`aria-expanded`) |
| Scroll vertical | Deck completo | Snap entre estações em 375px |

**Slots (`items[]`):**

| Slot | Papel | Exemplo label | Palavras-gatilho no `detail` |
|------|-------|---------------|--------------------------------|
| 1 | Comando | `Comando da prova` | `adequada`, `administração`, `endovenos` |
| 2 | Classe | `Classe farmacológica` | `IBP`, `inibidor`, `bomba de prótons` |
| 3 | Cenário | `Cenário clínico` | `úlcera`, `UTI`, `hospitalizado` |
| 4 | Diluição | `Diluição compatível` | `soro fisiológico`, `glicose`, `fosfato` |
| 5 | Administração | `Tempo de infusão` | `infusão lenta`, `contínua`, `bólus` |
| 6 | Monitor | `Monitorização` | `pH gástrico`, `resposta clínica`, `ajuste dose` |

**Ícones Lucide:** `Target`, `Pill`, `Hospital`, `FlaskConical`, `Syringe`, `Timer`, `Activity`, `Shield`

**Par com slide 4:** cada pegadinha (A/C/D/E) ocupa estação errada no deck.

---

## 3. Slide 2 — `golden_rule`

- **`layout_variant`:** `farmaco-clinico-reference-board`
- **Metáfora visual:** painel de referência clínica — cada `row` = parâmetro de administração EV + alerta de prova.
- **Componente proposto:** `GoldenRuleFarmacoClinicoReferenceBoard.tsx`

**Wire:**

```text
  OMEPRAZOL IV — REFERÊNCIA RÁPIDA
┌──────────────────────────────────────────┐
│ Indicação   │ Úlcera grave — controle ácido│
│ Diluição    │ SF ou glicose — não fosfato  │ ⚠
│ Administração│ Infusão lenta — não bólus   │ ⚠
│ Monitor     │ pH gástrico + ajuste dose    │ ✓
│ Via SC      │ Não equivale EV             │ ⚠
│ Antiácido   │ Não potencializa IBP        │ ⚠
├──────────────────────────────────────────┤
│ Mnemônico: diluir → infundir → monitorar │
└──────────────────────────────────────────┘
```

**Slots (`rows[]`):**

| Slot | `label` | `value` | `badge` |
|------|---------|---------|---------|
| Indicação | `Indicação do caso` | úlcera péptica grave | `info` |
| Diluição | `Diluição` | SF ou glicose — não fosfato aquecido | `warn` |
| Tempo | `Administração` | infusão lenta/contínua | `warn` |
| Monitor | `Monitorização` | pH gástrico + ajuste dose | `hot` |
| Via | `Via SC` | não substitui EV | `warn` |
| Interação | `Antiácido alumínio` | não potencializa IBP | `warn` |
| Conduta | `Conduta de prova` | monitorar e titular infusão | `hot` |

**`content`:** `OMEPRAZOL IV — REFERÊNCIA RÁPIDA` (≤36c)  
**`footer_rule`:** `EV omeprazol: tempo + monitorização — desconfie de bólus, SC e diluição exótica`

---

## 4. Slide 3 — `logic_flow`

- **`layout_variant`:** `farmaco-protocol-tap-flow`
- **Metáfora visual:** roteiro vertical de eliminação — cada tap revela teste de alternativa alinhado às estações do deck.
- **Componente proposto:** `LogicFlowFarmacoProtocolTapFlow.tsx`

**Wire:**

```text
  [tap 1] Identificar: caso clínico + omeprazol EV
  [tap 2] Núcleo: diluição + via + tempo + monitor
  [tap 3] Testar A — diluente fosfato → eliminar
  [tap 4] Testar B — monitor pH → candidata
  ...
  [tap N] Confirmar B · Fixação
```

**Interação:** `reveal_mode: "tap"` obrigatório — botão “Próximo passo” ≥44px.

**Slots (`steps[]`):** strings citando letras A–E; último passo = gabarito + fixação.

**Palavras-gatilho:** `Testar A`, `Testar B`, `ERRADA`, `CORRETA`, `Eliminar`, `Marcar`.

---

## 5. Slide 4 — `danger_zone`

- **`layout_variant`:** `farmaco-clinico-trap`
- **Metáfora visual:** cards de pegadinha mapeados à estação errada do deck (diluente / via / tempo / interação).
- **Componente proposto:** `DangerZoneFarmacoClinicoTrap.tsx`

**Wire:**

```text
  PEGADINHAS — TÉCNICA EV
┌─────────────────────────────────────┐
│ [DILUENTE] Letra A — fosfato quente  │  × | correto único
│ [MONITOR]  Letra B — gabarito       │  ✓ |
│ [VIA]      Letra C — subcutânea     │  × |
│ [INTERAÇ]  Letra D — alumínio       │  × |
│ [TEMPO]    Letra E — bólus rápido   │  × |
└─────────────────────────────────────┘
```

**Slots (`items[]`):**

| Slot | `label` | Gatilho `detail` | `correct` único |
|------|---------|------------------|-----------------|
| A | `Letra A — fosfato aquecido` | diluente exótico | SF/glicose compatível |
| B | `Letra B — gabarito` | monitor pH | conduta adequada |
| C | `Letra C — subcutânea` | via impossível | EV ≠ SC |
| D | `Letra D — alumínio` | interação invertida | não potencializa |
| E | `Letra E — bólus rápido` | urgência sedutora | infusão controlada |
| + | `Transferência` | outras drogas EV | quadro via×tempo×monitor |

**`bullet_style`:** `x_icon`  
**Proibido:** repetir mesmo `correct` entre letras (gate `detectDuplicateDangerJustifications`).

---

## 6. Contrato de inferência

| Molde | Regex / palavras-gatilho |
|-------|--------------------------|
| `infusao-ev-station-deck` | `endovenos\|infusão\|diluição\|IBP\|antibiótico EV\|omeprazol\|fentanil` em `items[].detail` |
| `farmaco-clinico-reference-board` | `rows[].label` com `Diluição\|Administração\|Monitor\|Via`; `value` com `infusão\|bólus\|pH` |
| `farmaco-protocol-tap-flow` | `steps` com `Testar [A-E]\|ERRADA\|CORRETA\|Eliminar\|Marcar` |
| `farmaco-clinico-trap` | `items[].label` `Letra [A-E]`; `detail` cita diluente/via/tempo; `correct` único |

**Wiring:** `BRANCH_DESIGN_MAP` → `farmaco_clinico_protocolo` · `pedagogicalBranch.ts` · `FARMACO_CLINICO` regex.

---

## 7. Exemplo JSON mínimo

Trecho derivado da âncora IDECAN (formato plano):

```json
{
  "meta": {
    "subtopico": "Farmacodinâmica e Farmacocinética",
    "pedagogical_branch": "farmaco_clinico_protocolo",
    "family": "protocolo",
    "content_standard": "golden-v1"
  },
  "reverse_study_slides": [
    {
      "type": "concept_map",
      "items": [
        { "label": "Diluição compatível", "detail": "Soro fisiológico ou glicose — não fosfato aquecido.", "icon": "FlaskConical" },
        { "label": "Tempo de infusão", "detail": "Infusão lenta/contínua — não bólus rápido.", "icon": "Timer" },
        { "label": "Monitorização", "detail": "pH gástrico e resposta clínica — ajuste de dose possível.", "icon": "Activity" }
      ],
      "footer_rule": "IBP EV = diluir + infundir + monitorar"
    },
    {
      "type": "golden_rule",
      "content": "OMEPRAZOL IV — REFERÊNCIA RÁPIDA",
      "rows": [
        { "label": "Diluição", "value": "SF ou glicose", "badge": "warn" },
        { "label": "Administração", "value": "Infusão lenta — não bólus", "badge": "warn" },
        { "label": "Monitorização", "value": "pH gástrico + ajuste dose", "badge": "hot" }
      ]
    },
    {
      "type": "logic_flow",
      "reveal_mode": "tap",
      "steps": [
        "Testar A: fosfato aquecido — ERRADA: diluente inadequado.",
        "Testar B: monitor pH e ajuste — CORRETA.",
        "Eliminar C, D, E por via, interação ou bólus.",
        "Marcar B."
      ]
    },
    {
      "type": "danger_zone",
      "bullet_style": "x_icon",
      "content": "PEGADINHAS — OMEPRAZOL EV",
      "items": [
        {
          "label": "Letra A — fosfato aquecido",
          "detail": "Parece química avançada para ação rápida.",
          "correct": "Diluição = SF ou glicose; fosfato quente é distrator."
        },
        {
          "label": "Letra E — bólus rápido",
          "detail": "Seduz quem associa urgência com correr infusão.",
          "correct": "IBP EV exige infusão controlada; pH não estabiliza à força."
        }
      ]
    }
  ]
}
```

---

## 8. Anti-padrões deste pacote

| Proibido | Motivo |
|----------|--------|
| Gabarito no `concept_map` ou `golden_rule` | Spoiler antes do raciocínio |
| Row “Gabarito letra X” no golden | Regra handcraft golden-v1 |
| Mesmo `correct` em todas as letras | Gate duplicate danger |
| Hardcode letra B no React | Contrato farmaco-clinico-trap |
| Vocabulário IPCS/CVC sem âncora | Gate `detectSlideTopicDrift` |
| Reutilizar `adme-journey-rail` neste ramo | Drift PK/PD — ramo clínico ≠ ADME |
| >7 estações no deck sem scroll | Carga cognitiva |

---

## 9. Critérios de aceite (DoD)

- [x] 4× `layout_variant` nomeados: `infusao-ev-station-deck` · `farmaco-clinico-reference-board` · `farmaco-protocol-tap-flow` · `farmaco-clinico-trap`
- [ ] Componentes React a implementar (pacote atual = genérico `morphological · banner · cards · compare`)
- [ ] `BRANCH_DESIGN_MAP` → `farmaco_clinico_protocolo` atualizado após React
- [ ] Preview 375px — deck com scroll snap; board scroll vertical
- [ ] 0 hardcode de gabarito nos componentes
- [ ] Par deck (estações) ↔ farmaco-clinico-trap (slot errado)
- [ ] `footer_rule` com estratégia de prova em cada slide

**Status implementação:** brief **novo** — React pendente (`Implementar molde: farmaco_clinico_protocolo`).

**Próximo trigger:** `Implementar molde: farmaco_clinico_protocolo` → [`VARIANT_MOLDS.md`](../docs/VARIANT_MOLDS.md) §3.

---

*Referências:* [`docs/PROMPT_VARIANTES_NEUROSLIDES.md`](../docs/PROMPT_VARIANTES_NEUROSLIDES.md) · [`artifacts/farmacodinamica-topic-cluster-report.json`](./farmacodinamica-topic-cluster-report.json) · [`examples/questao-premium-idecan-omeprazol-ev-ulcera.json`](../examples/questao-premium-idecan-omeprazol-ev-ulcera.json)

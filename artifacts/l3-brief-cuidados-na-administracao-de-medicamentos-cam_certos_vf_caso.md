# BRIEF DE VARIANTES — Cuidados na Administração de Medicamentos / cam_certos_vf_caso

**Gerado:** 2026-07-10  
**Política:** `molde_redesign` (pacote genérico `bridge · center · cards · compare` no `SUBTOPIC_DESIGN_MAP` — brief formal antes de escalar handcraft)  
**Família:** `vf` | `conceito` (V/F I–III sobre 9 Certos em caso clínico)  
**Template:** `teal` (t10)  
**Âncora primária:** `examples/questao-premium-fepese-cuidados-administracao-medicamentos.json`  
**Cluster:** V/F — 9 certos em caso clínico · 25 slugs · 10,5% · `sample_slugs[0]`: `avancasp-enfermagem-cuidados-na-administracao-de-medicamentos-1778969258148-6`

---

## 0. Questão âncora

| Campo | Valor |
|-------|-------|
| Banca / ano | FEPESE — Pref Florianópolis 2024 |
| Tipo | V/F I–III + combinação MCQ (“É CORRETO o que se afirma em”) |
| Gabarito | B — I e II, apenas |

**Erro reproduzível (1 frase):** o aluno aceita a afirmativa III como verdadeira (“uso habitual da unidade” libera administração com prescrição ilegível ou dose duvidosa) ou monta combinação sem julgar I e II separadamente.

**Por que bespoke (não `compare` genérico):**

1. O erro é **espacial/sequencial** — julgar I→II→III sobre os **9 Certos**, montar conjunto V/F, depois eliminar letras A–E.
2. Os 9 Certos pedem **checklist numerado** (P-M-D-V-H-D-O-R-F), não parágrafo duplo.
3. Padrão em **25 questões** (≥24, ramo forte do subtópico pós-drift).
4. `compare` texto×texto não fixa a ordem de julgamento nem o mapa I–III alinhado ao enunciado nem a tabela dos 9 Certos.

---

## 1. Metáfora do pacote

**“Checklist dos 9 Certos → painel de referência numerado → juggle V/F carta a carta até a letra → armadilha por letra e pela regra da dúvida.”**

Universo visual único: **checklist teal** com chips numerados 1–9, badges V/F emerald/rose, romanos I–III espelhando o enunciado, ícone `ShieldAlert` para alto risco.

---

## 2. Slide 1 — `concept_map`

- **`layout_variant`:** `cam-certos-deck`
- **Metáfora visual:** deck de cartas dos 9 Certos + cartas I–III do enunciado em grade — cada carta = um certo ou afirmativa V/F.
- **Componente:** `CamCertosDeckConceptMap.tsx`

**Wire (375px):**

```text
  9 CERTOS — MAPA DA PROVA
┌─────────────────┬─────────────────┐
│ [V] I — Identif.│ [V] II — Alto r.│
│ 2 identificador │ conferência dup.│
├─────────────────┼─────────────────┤
│ [F] III — Dúvida│ [9] Os 9 Certos │
│ não administrar │ P·M·D·V·H·D·O·R·F│
├─────────────────┴─────────────────┤
│ Regra de ouro: na dúvida → suspender│
└───────────────────────────────────┘
```

**Interação:**

| Gesto | Estado inicial | Estado final |
|-------|----------------|--------------|
| Toque na carta | Label + ícone compacto | Expande `detail` (`aria-expanded`) |
| Chip V/F | Inferido de “VERDADEIRA/FALSA” no detail | Badge emerald (V) ou rose (F) |

**Slots (`items[]`):**

| Slot | Papel | Exemplo label | Palavras-gatilho no `detail` |
|------|-------|---------------|--------------------------------|
| 1 | Afirmativa I | `I — Identificação (V)` | `dois identificadores`, `qualquer local`, `VERDADEIRA` |
| 2 | Afirmativa II | `II — Alto risco (V)` | `conferência dupla`, `heparina`, `insulina`, `VERDADEIRA` |
| 3 | Afirmativa III | `III — Dúvida na prescrição (F)` | `ilegível`, `dose duvidosa`, `uso habitual`, `FALSA` |
| 4 | Núcleo normativo | `Os 9 Certos` | `paciente`, `medicamento`, `dose`, `via`, `horário` |
| 5 | Regra de ouro | `Regra de ouro da dúvida` | `suspender`, `comunicar`, `aguardar`, `nunca administrar` |
| 6 | Pegadinha | `Padrão banca` | `uso habitual`, `libera administração`, `dúvida` |

**Ícones Lucide:** `UserCheck`, `ShieldAlert`, `Ban`, `ListChecks`, `AlertCircle`, `Pill`, `Clock`

**Par com slide 4:** cartas I–III = alvos das pegadinhas por letra; regra da dúvida = eixo do item “uso habitual”.

---

## 3. Slide 2 — `golden_rule`

- **`layout_variant`:** `cam-nine-rights-board`
- **Metáfora visual:** painel de referência numerado 1–9 — cada `row` = um certo + observação de prova.
- **Componente:** `GoldenRuleCamNineRightsBoard.tsx`

**Wire:**

```text
  OS 9 CERTOS DA MEDICAÇÃO
┌──────────────────────────────────────────┐
│ 1. Paciente certo    │ 2 identificadores │
│ 2. Medicamento certo │ prescrição legível│
│ 3. Dose certa        │ mg, mL, UI [hot]  │
│ 4. Via certa         │ VO·IM·IV·SC [hot] │
│ 5. Horário certo     │ janela terapêutica│
│ 6. Documentação      │ registrar após    │
│ 7. Orientação        │ esclarecer paciente│
│ 8. Resposta          │ observar efeito   │
│ 9. Forma certa       │ validade·integridade│
├──────────────────────────────────────────┤
│ Alto risco           │ 2 profissionais   │
│ Regra de ouro        │ dúvida → suspender│
└──────────────────────────────────────────┘
```

**Interação:** scroll vertical; rows com `badge: hot` para dose/via/alto risco.

**Slots (`rows[]`):**

| Slot | `label` | `value` | `badge` / `emphasis` |
|------|---------|---------|----------------------|
| 1–9 | `N. <certo>` | conduta resumida | `hot` em dose, via |
| extra | `Alto risco` | conferência dupla — 2 profissionais | `alert` |
| extra | `Regra de ouro` | na dúvida: suspender, comunicar, aguardar | `warn` / `alert` |

**`content`:** mnemônico `9 CERTOS DA MEDICAÇÃO` (≤36c)

**Proibido:** row “Gabarito letra X” isolada.

**`footer_rule`:** `Mnemônico P-M-D-V-H-D-O-R-F — na dúvida, o décimo certo é não administrar`

---

## 4. Slide 3 — `logic_flow`

- **`layout_variant`:** `cam-vf-juggle-tap`
- **`reveal_mode`:** `tap` (obrigatório)
- **Metáfora visual:** baralho V/F — uma carta por passo; dots de progresso; resumo final com conjunto verdadeiro.
- **Componente:** `LogicFlowCamVfJuggleTap.tsx`

**Wire:**

```text
  [ V/F MEDICAÇÃO ]     ● ○ ○ ○ ○ ○ ○
┌─────────────────────────────────────┐
│ Julgar I: identificação → VERDADEIRA│
│         [ Próximo ▶ ]               │
└─────────────────────────────────────┘
        … II → III …
┌─────────────────────────────────────┐
│ Conjunto: I+II → Letra B            │
│ Eliminar A, C, D, E                 │
└─────────────────────────────────────┘
```

**Interação:**

| Gesto | Efeito |
|-------|--------|
| Toque “Próximo” | Revela passo seguinte |
| Passos `judgement` | Parser detecta `Julgar I/II/III` → chip V ou ✗ |
| Passo `combine` | Monta conjunto sem III |
| Passo `locate` | Aponta letra B |
| Passos `eliminate` | Risca letras com III ou combinação incompleta |

**Quantidade de passos:** 6–8 strings (âncora usa 7).

**Parser (`parseCamVfStep`):** gatilhos `Julgar I`, `Montar combinação`, `Confirmar letra`, `Eliminar`, `Fixação`.

---

## 5. Slide 4 — `danger_zone`

- **`layout_variant`:** `cam-certos-trap-arena`
- **`bullet_style`:** `x_icon`
- **Metáfora visual:** arena pegadinha × correto — badge letra A–E; chip “dúvida” / “uso habitual”.
- **Componente:** `DangerZoneCamCertosTrapArena.tsx`

**Wire:**

```text
  PEGADINHAS — 9 CERTOS
┌─────────────────────────────────────┐
│ [A] ✗  só I — ignora II alto risco  │
│      → correto: I e II verdadeiras  │
├─────────────────────────────────────┤
│ [C] ✗  II+III — III parece razoável │
│      → correto: III é falsa           │
├─────────────────────────────────────┤
│ [uso habitual] ✗ hábito ≠ prescrição  │
└─────────────────────────────────────┘
```

**Par com slide 1:** cada `items[].label` “Letra X” corresponde à eliminação no logic_flow; item “uso habitual” espelha carta III do deck.

**Slots (`items[]`):**

| Slot | `label` | Pegadinha (`detail`) | `correct` único |
|------|---------|----------------------|-----------------|
| A | `Letra A — só I` | confirma I mas ignora II | I e II verdadeiras → B |
| C | `Letra C — II e III` | III parece razoável | III falsa: suspender |
| D | `Letra D — I, II e III` | inclui III | III invalida D |
| tema | `Uso habitual da unidade` | hábito local | nunca substitui prescrição clara |
| tema | `Identificar pelo leito` | número do quarto | dois identificadores no paciente |
| tema | `Alto risco sem dupla checagem` | experiência dispensa | conferência dupla obrigatória |

---

## 6. Contrato de inferência

| Molde | Regex / palavras-gatilho |
|-------|--------------------------|
| `cam-certos-deck` | `inferCamCategory`: `identific`, `alto risco`, `dúvida\|duvida`, `ilegível` → slot; `inferVfChip`: `verdadeira\|falsa` |
| `cam-nine-rights-board` | `extractCertoNumber`: `^(\d+)\.`; `inferCamRowBadge`: `hot` em dose/via/alto risco |
| `cam-vf-juggle-tap` | `parseCamVfStep`: `/Julgar\s+(I{1,3}|IV)/i`, `/Combinar/`, `/Confirmar letra\s+([A-E])/i`, `/Eliminar/` |
| `cam-certos-trap-arena` | `extractLetterFromLabel`: `Letra\s+([A-E])`; gatilho `uso habitual`, `leito`, `dupla checagem` |

**Wiring (Fase 4 — não implementado nesta conversa):** `BRANCH_DESIGN_MAP` → `cam_certos_vf_caso` · `pedagogicalBranch.ts` · `moldAffinity.ts` · `themeGenerator.ts` substituir pacote genérico teal.

---

## 7. Exemplo JSON mínimo

```json
{
  "meta": {
    "subtopico": "Cuidados na Administração de Medicamentos",
    "pedagogical_branch": "cam_certos_vf_caso",
    "family": "vf",
    "content_standard": "golden-v1"
  },
  "reverse_study_slides": [
    {
      "type": "concept_map",
      "items": [
        { "label": "I — Identificação (V)", "detail": "Dois identificadores antes de cada dose — VERDADEIRA.", "icon": "UserCheck" },
        { "label": "II — Alto risco (V)", "detail": "Conferência dupla — VERDADEIRA.", "icon": "ShieldAlert" },
        { "label": "III — Dúvida na prescrição (F)", "detail": "Uso habitual não libera — FALSA.", "icon": "Ban" },
        { "label": "Os 9 Certos", "detail": "P·M·D·V·H·D·O·R·F", "icon": "ListChecks" }
      ],
      "footer_rule": "I e II corretas · III errada — na dúvida, comunicar"
    },
    {
      "type": "golden_rule",
      "content": "9 CERTOS DA MEDICAÇÃO",
      "rows": [
        { "label": "1. Paciente certo", "value": "2 identificadores", "badge": "ok" },
        { "label": "Alto risco", "value": "Conferência dupla", "badge": "hot", "emphasis": "alert" }
      ]
    },
    {
      "type": "logic_flow",
      "reveal_mode": "tap",
      "steps": [
        "Julgar I: identificação → VERDADEIRA.",
        "Julgar II: alto risco → VERDADEIRA.",
        "Julgar III: uso habitual com dúvida → FALSA.",
        "Combinar: I e II apenas.",
        "Confirmar letra B.",
        "Fixação: alternativa que libera administração com dúvida está sempre errada."
      ]
    },
    {
      "type": "danger_zone",
      "content": "PEGADINHAS — CUIDADOS NA ADMINISTRAÇÃO",
      "bullet_style": "x_icon",
      "items": [
        { "label": "Letra C — II e III", "detail": "III parece razoável pelo uso habitual.", "correct": "III é falsa: dúvida = suspender e comunicar." }
      ]
    }
  ]
}
```

---

## 8. Anti-padrões

- Gabarito nos slides 1–2
- `correct` repetido entre itens do `danger_zone`
- Hardcode de banca/ano no componente React
- Drift para vias de administração ou IPCS sem âncora no enunciado
- Animar cartas sem significado pedagógico

---

## 9. Definition of Done (GATE Fase 3b)

- [x] Metáfora única 4/4 (checklist 9 Certos + V/F juggle)
- [x] 4× `layout_variant`: `cam-certos-deck` · `cam-nine-rights-board` · `cam-vf-juggle-tap` · `cam-certos-trap-arena`
- [x] Contrato JSON + palavras-gatilho (§6–7)
- [x] Wire 375px por slide
- [x] 0 hardcode de gabarito no componente (conteúdo via JSON)
- [x] Par conceito-perigo documentado (I–III ↔ letras A–E / uso habitual)
- [x] `reveal_mode: "tap"` no logic_flow
- [x] `bullet_style: "x_icon"` no danger_zone

**Próximo passo:** `Implementar molde: cam_certos_vf_caso` → [`VARIANT_MOLDS.md`](../docs/VARIANT_MOLDS.md) §3

# BRIEF DE VARIANTES — Urgências e Emergências / urgencias_rcp_sbv

**Gerado:** 2026-07-06  
**Política:** `molde_redesign` (layouts legados `survival-chain` · `center` · `vertical` · `trap-reveal` no `SUBTOPIC_DESIGN_MAP` — redesign obrigatório antes de escalar handcraft)  
**Família:** `protocolo` | `vf` (I/II/III + RCP) | MCQ parâmetros  
**Template:** `rose` (t03)  
**Âncora:** `examples/questao-premium-urgencias-rcp.json`  
**Cluster:** RCP / SBV adulto (V/F ou protocolo) · **72 slugs (19,7%)** · `sample_slugs[0]`: `adm-tec-enfermagem-urgencias-e-emergencias-1777103970505-6`

---

## 0. Questão âncora

| Campo | Valor |
|-------|-------|
| Banca / ano | CPCON EBSERH 2024 (golden) · Adm&Tec Camaragibe 2024 (catálogo) |
| Tipo | V/F I–III + MCQ parâmetros RCP adulto |
| Gabarito (golden) | B — I e II, apenas (III erra: pulso a cada ciclo) |

**Erro reproduzível (1 frase):** o aluno confunde **intervalo de checagem de pulso** (a cada ~2 min, não a cada ciclo 30:2) ou troca **frequência/profundidade** (80–100 ou 4 cm vs 100–120 e 5–6 cm).

**Por que bespoke (não `compare` / `reference_table` genérico):**

1. Erro **sequencial e numérico** — cadeia reconhecimento → 192 → compressões → ventilação → DEA + parâmetros que a banca permuta.
2. Números normativos (30:2 · 100–120 · 5–6 cm · 2 min pulso) pedem **painel de parâmetros** com badges hot/warn, não parágrafo.
3. **72 questões** (≥ limiar 37) — maior ramo coeso do subtópico.
4. `trap-reveal` legado não separa slots de pegadinha (pulso · frequência · profundidade · DEA · hiperventilação).

---

## 1. Metáfora do pacote

**“Cadeia de sobrevivência em elos → painel de parâmetros RCP adulto → trilho tap-flow do SBV → arena de troca numérica/protocolo.”**

Universo visual único: **elos rose/cyan** (reconhecimento · acionamento · compressão · DEA), chips monoespaçados `30:2` · `100–120` · `5–6 cm`, ícones `HeartPulse` · `Activity` · `Zap` · `Phone`.

---

## 2. Slide 1 — `concept_map`

- **`layout_variant`:** `urgencias-survival-chain-deck`
- **Metáfora visual:** deck de elos da cadeia de sobrevivência — cada carta = fase (reconhecimento, 192, RCP, DEA, pós-choque).
- **Componente:** `UrgenciasSurvivalChainDeckConceptMap.tsx`

**Wire (375px):**

```text
┌── Reconhecer ──┬── Acionar 192 ──┐
│ [Eye] PCR      │ [Phone] SAMU    │
├── RCP imediata ┴── DEA ─────────┤
│ [HeartPulse] Compressão qualidade │
│ [Zap] Choque assim que disponível │
├───────────────────────────────────┤
│ pegadinha: pulso ≠ a cada ciclo   │
└───────────────────────────────────┘
```

**Interação:**

| Gesto | Estado inicial | Estado final |
|-------|----------------|--------------|
| Toque no elo | `line-clamp-2` no `detail` | Expande (`aria-expanded`) |
| — | Badge de fase inferida | rose=RCP · cyan=192/DEA · amber=alerta |

**Slots (`items[]`):**

| Slot | Papel | Exemplo label | Palavras-gatilho no `detail` |
|------|-------|---------------|--------------------------------|
| 1 | Reconhecimento | `PCR — inconsciência + sem respiração` | `inconsci`, `respira`, `gasps`, `pcr` |
| 2 | Acionamento | `Acionar 192 / equipe` | `192`, `samu`, `socorro`, `equipe` |
| 3 | Compressões | `Compressões de alta qualidade` | `compress`, `torác`, `100`, `120`, `5`, `6 cm` |
| 4 | Ventilação | `30:2 com 2 socorristas` | `30:2`, `ventila`, `dois socorristas` |
| 5 | DEA | `DEA o quanto antes` | `dea`, `desfibril`, `choque` |
| 6 | Pós-RCP (opcional) | `Reavaliação e transporte` | `2 min`, `pulso`, `reavali` |

**Ícones Lucide:** `Eye`, `Phone`, `HeartPulse`, `Wind`, `Zap`, `Ambulance`

**Par com slide 4:** elos RCP/DEA/pulso aqui = slots da trap-arena (`pulso_intervalo`, `frequencia`, `profundidade`, `dea_atraso`).

---

## 3. Slide 2 — `golden_rule`

- **`layout_variant`:** `urgencias-rcp-params-board`
- **Metáfora visual:** painel de parâmetros normativos — cada `row` = regra com badge ok/hot/warn.
- **Componente:** `GoldenRuleUrgenciasRcpParamsBoard.tsx` (wrapper `SoftLensBoard` profile `urgencias`)

**Wire:**

```text
  RCP ADULTO — PARÂMETROS
┌──────────────────────────────────────────┐
│ mnemônico: 30:2 · 100–120 · 5–6 cm       │
├──────────────────────────────────────────┤
│ Proporção 2 socorristas  [ok]  30:2      │
│ Frequência compressões   [hot] 100–120/min│
│ Profundidade             [hot] 5–6 cm    │
│ Verificar pulso          [warn] ~2 min   │
├──────────────────────────────────────────┤
│ extra: DEA imediato · mínima pausa       │
└──────────────────────────────────────────┘
```

**Interação:** toque na lente → destaca `row`; chips `30:2` e `100–120` em monoespaçado.

**Slots (`rows[]`):**

| Slot | `label` | `value` | `badge` / `emphasis` |
|------|---------|---------|----------------------|
| 1 | `Proporção (2 socorristas)` | 30 compressões : 2 ventilações | `ok` |
| 2 | `Frequência` | 100–120 compressões/min | `hot` |
| 3 | `Profundidade` | 5–6 cm (retorno completo) | `hot` |
| 4 | `Verificar pulso` | Após ~2 min de RCP (não a cada ciclo) | `warn` / `alert` |
| extra | `DEA` | Ligar e aplicar assim que disponível | `ok` |
| extra | `Um socorrista` | Compressões contínuas; ventilar se treinado | `info` |

**`content`:** mnemônico curto `30:2 · 100–120` (≤36 caracteres).

**Proibido:** row isolada “Gabarito letra X” sem contexto normativo.

**`footer_rule`:** `Qualidade da compressão > pausas frequentes para pulso`

---

## 4. Slide 3 — `logic_flow`

- **`layout_variant`:** `urgencias-rcp-tap-flow`
- **`reveal_mode`:** `tap` (obrigatório)
- **Metáfora visual:** trilho vertical de elos SBV — um passo por toque até a letra.
- **Componente:** `LogicFlowUrgenciasRcpTapFlow.tsx`

**Wire:**

```text
  [ SBV ADULTO ]
┌─────────────────────────────────────┐
│ 1. Segurança da cena + responsividade │
│         [ Próximo ▶ ]                 │
└─────────────────────────────────────┘
        … 30:2 · DEA …
┌─────────────────────────────────────┐
│ 6. Eliminar III (pulso/ciclo) → B   │
└─────────────────────────────────────┘
```

**Interação:** toque avança passo; elos com borda rose; passo de eliminação com badge warn.

**Passos típicos (`steps[]` strings):**

1. Garantir segurança da cena e checar responsividade/respiração (≤10 s).
2. Acionar 192 e solicitar DEA.
3. Iniciar compressões 100–120/min, profundidade 5–6 cm.
4. Com 2 socorristas: ventilar 30:2 sem hiperventilar.
5. III: “pulso a cada ciclo” → **falsa** (checar ~2 min).
6. Conjunto I+II → letra B (golden) ou eliminar alternativas numéricas erradas (MCQ).

**Quantidade:** 5–8 passos.

---

## 5. Slide 4 — `danger_zone`

- **`layout_variant`:** `urgencias-rcp-trap-arena`
- **`bullet_style`:** `x_icon`
- **Metáfora visual:** arena por slot de pegadinha — conduta errada × correção normativa.
- **Componente:** `DangerZoneUrgenciasRcpTrapArena.tsx`

**Wire:**

```text
  PEGADINHAS — RCP ADULTO
┌─────────────────────────────────────┐
│ [pulso] ✗ a cada ciclo 30:2         │
│      → correto: ~2 min de RCP       │
├─────────────────────────────────────┤
│ [freq] ✗ 80–100/min                 │
│      → correto: 100–120/min         │
├─────────────────────────────────────┤
│ [prof] ✗ 4 cm mínimo                │
│      → correto: 5–6 cm              │
└─────────────────────────────────────┘
```

**Interação:** toque no card → revela coluna `correct`; slot inferido via `inferUrgenciasRcpTrapSlot`.

**Slots (`items[]`):**

| Slot | `label` | Pegadinha (`detail`) | `correct` único |
|------|---------|----------------------|-----------------|
| 1 | `Pulso a cada ciclo` | Parar compressões todo ciclo para pulso | Verificar pulso após ~2 min de RCP contínua |
| 2 | `Frequência 80–100` | Banca troca faixa inferior | 100–120 compressões/min |
| 3 | `Profundidade 4 cm` | Subestima profundidade adulto | Pelo menos 5 cm, até 6 cm |
| 4 | `Hiperventilação` | Muitas ventilações rápidas | 30:2 — volume suficiente, sem excesso |
| 5 | `Atrasar DEA` | Esperar “terminar” ciclos manuais | DEA assim que disponível; retomar compressões |

**Par com slide 1:** slots `pulso` · `freq` · `prof` · `dea` espelham elos do survival-chain-deck.

---

## 6. Contrato de inferência

| Molde | Função / gatilhos |
|-------|-------------------|
| `urgencias-survival-chain-deck` | `inferUrgenciasSurvivalLink(title, detail)`: `reconhec`, `192`, `compress`, `ventila`, `dea`, `pulso` |
| `urgencias-rcp-params-board` | `SoftLensBoard` profile `urgencias`; badges via `emphasis: alert` + `badge: warn/hot` |
| `urgencias-rcp-tap-flow` | Passos string; highlight passo com `pulso`, `30:2`, `dea` |
| `urgencias-rcp-trap-arena` | `inferUrgenciasRcpTrapSlot(label, detail, correct)` → `pulso_intervalo` \| `frequencia` \| `profundidade` \| `dea_atraso` \| `hiperventilacao` |

**Wiring futuro:** `BRANCH_DESIGN_MAP` → `urgencias_rcp_sbv` · `pedagogicalBranch.ts` · `lib/slides/urgenciasSlideUtils.ts`

---

## 7. Exemplo JSON mínimo

```json
{
  "meta": {
    "subtopico": "Urgências e Emergências",
    "pedagogical_branch": "urgencias_rcp_sbv",
    "family": "protocolo",
    "content_standard": "golden-v1"
  },
  "reverse_study_slides": [
    {
      "type": "concept_map",
      "items": [
        { "label": "Reconhecimento PCR", "detail": "Inconsciência + ausência de respiração normal.", "icon": "Eye" },
        { "label": "Acionar 192", "detail": "SAMU e pedir DEA.", "icon": "Phone" },
        { "label": "Compressões", "detail": "100–120/min, 5–6 cm, retorno completo.", "icon": "HeartPulse" },
        { "label": "Ventilação 30:2", "detail": "Dois socorristas treinados.", "icon": "Wind" }
      ],
      "footer_rule": "RCP = compressões eficazes + DEA cedo"
    },
    {
      "type": "golden_rule",
      "content": "30:2 · 100–120",
      "rows": [
        { "label": "Proporção", "value": "30:2 (2 socorristas)", "badge": "ok" },
        { "label": "Frequência", "value": "100–120/min", "badge": "hot" },
        { "label": "Profundidade", "value": "5–6 cm", "badge": "hot" },
        { "label": "Pulso", "value": "Checar após ~2 min", "emphasis": "alert", "badge": "warn" }
      ]
    },
    {
      "type": "logic_flow",
      "reveal_mode": "tap",
      "steps": [
        "I: segurança e checagem inicial → verdadeira.",
        "II: 30:2 com dois socorristas → verdadeira.",
        "III: pulso a cada ciclo → falsa.",
        "Letra B.",
        "Fixação: pulso não interrompe cada ciclo 30:2."
      ]
    },
    {
      "type": "danger_zone",
      "bullet_style": "x_icon",
      "content": "PEGADINHAS — RCP ADULTO",
      "items": [
        {
          "label": "Pulso a cada ciclo",
          "detail": "Parar compressões entre ciclos para pulso.",
          "correct": "Verificar pulso só após ~2 minutos de RCP contínua."
        },
        {
          "label": "80–100 compressões/min",
          "detail": "Faixa abaixo do protocolo atual.",
          "correct": "100–120 compressões por minuto."
        }
      ]
    }
  ]
}
```

---

## 8. Anti-padrões

- Hardcodar gabarito “letra B” no componente React.
- Repetir o mesmo `correct` em dois `items` do danger_zone.
- Usar `survival-chain` / `trap-reveal` genéricos sem slots inferidos após rollout do ramo.
- Misturar parâmetros de RCP pediátrica (15:2) no ramo `urgencias_rcp_sbv` — usar `urgencias_rcp_pediatrico` ou genérico.

---

## 9. DoD (Definition of Done)

- [ ] 375px: todos os slots legíveis sem scroll horizontal.
- [ ] 0 hardcode de texto de prova específica nos componentes.
- [ ] 4× `layout_variant` nomeados e registrados em `themeGenerator` / `BRANCH_DESIGN_MAP`.
- [ ] Par conceito-perigo: elos slide 1 ↔ slots slide 4.
- [ ] `inferUrgenciasRcpTrapSlot` cobre ≥3 pegadinhas distintas com `correct` únicos.
- [ ] `prefers-reduced-motion`: tap-flow revela todos os passos.
- [ ] Golden âncora `questao-premium-urgencias-rcp.json` renderiza 4/4 sem fallback genérico.

---

## 10. Handoff

Próximo trigger: **`Implementar molde: urgencias_rcp_sbv`** ([`VARIANT_MOLDS.md`](../docs/VARIANT_MOLDS.md) §3) ou incluir ramo no **`Handcraft: Urgências e Emergências`** após wiring.

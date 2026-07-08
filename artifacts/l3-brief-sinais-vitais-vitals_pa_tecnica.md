# BRIEF DE VARIANTES — Verificação de Sinais Vitais / vitals_pa_tecnica

**Gerado:** 2026-07-04  
**Política:** `molde_redesign` (pacote vitals-* legado no repo — brief formal antes de re-handcraft)  
**Família:** `protocolo` | `certo_errado` (técnica de aferição)  
**Template:** `rose` (t03)  
**Âncora:** `examples/questao-premium-fepese-sv-interpretacao-valores.json` (interpretação multi-SV) · slug amostra PA: `ameosc-enfermagem-verificacao-de-sinais-vitais-1778969752567-3`  
**Cluster:** PA — técnica e interpretação · **196 slugs (55,4%)**

---

## 0. Questão âncora

| Campo | Valor |
|-------|-------|
| Banca / ano | AMEOSC — Pref Anchieta (SC) 2025 |
| Tipo | MCQ — boas práticas de aferição (idoso com tontura ortostática) |
| Gabarito | D — braço ao nível do coração + manguito adequado |

**Erro reproduzível (1 frase):** o aluno escolhe distrator de técnica errada (polegar no pulso, contar FR com paciente falando, temperatura pós-exercício) e ignora o **checklist posicional da PA** (nível do coração, manguito 80% circunferência, repouso ≥5 min).

**Por que bespoke (não `compare` genérico):**

1. Erro **espacial/categorial** — painel com slots PA · FC · FR · Temp, cada um com badge NORMAL/ALTERADO/TÉCNICA.
2. Números e regras (manguito 80%, braço no 4º EIC, Korotkoff) pedem **reference-board** com lentes, não parágrafo.
3. Ramo **196 questões** — maior cluster do subtópico (>> limiar 36).
4. `compare` texto×texto não fixa o mapa “técnica certa × pegadinha clássica” por parâmetro.

---

## 1. Metáfora do pacote

**“Monitor de leito clínico → painel de referência por parâmetro → tap traduz valor do caso → arena classifica NORMAL × ALTERADO × ERRO de técnica.”**

Universo visual único: cards claros sobre shell rose/cyber; chips monoespaçados `110×75` · `60–100` · `12–20`; ícones `HeartPulse` · `Thermometer` · `Wind` · `Activity`.

---

## 2. Slide 1 — `concept_map`

- **`layout_variant`:** `vitals-panel`
- **Metáfora visual:** painel de monitor com 4–6 slots expansíveis (PA, FC, FR, Temp, SpO₂ opcional, Técnica).
- **Componente:** `VitalsPanelConceptMap.tsx`

**Wire (375px):**

```text
┌──────── MONITOR SV ────────────────────────┐
│ [HeartPulse] PA      [NORMAL/ALTERADO]  ▼  │
│ [Activity]   FC      [badge]            ▼  │
│ [Wind]       FR      [badge]            ▼  │
│ [Thermometer] Temp   [badge]            ▼  │
├────────────────────────────────────────────┤
│ footer: técnica antes de interpretar       │
└────────────────────────────────────────────┘
```

**Interação:**

| Gesto | Estado inicial | Estado final |
|-------|----------------|--------------|
| Toque no card | `detail` truncado | Expande (`aria-expanded`) |
| Badge inferido | `inferVitalStatus` no texto | NORMAL (emerald) / ALTERADO (amber) |

**Slots (`items[]`):**

| Slot | Papel | Exemplo label | Palavras-gatilho no `detail` |
|------|-------|---------------|--------------------------------|
| 1 | PA | `Pressão arterial` | `manguito`, `braço`, `coração`, `4º EIC`, `Korotkoff` |
| 2 | FC | `Frequência cardíaca` | `pulso`, `radial`, `60 s`, `bpm`, `polegar` |
| 3 | FR | `Frequência respiratória` | `irpm`, `mpm`, `contagem`, `1 minuto`, `conversar` |
| 4 | Temp | `Temperatura` | `axilar`, `retal`, `febre`, `36`, `37,8` |
| 5 | Técnica (opcional) | `Repouso pré-aferição` | `5 minutos`, `repouso`, `sem falar` |
| 6 | Contexto | `Caso clínico` | trecho do enunciado sem gabarito |

**Ícones Lucide:** `HeartPulse`, `Activity`, `Wind`, `Thermometer`, `Timer`, `ClipboardList`

**Par com slide 4:** slots PA/FC/FR/Temp = categorias da classify-arena.

---

## 3. Slide 2 — `golden_rule`

- **`layout_variant`:** `vitals-reference-board`
- **Metáfora visual:** painel de lentes — cada `row` = parâmetro com valor medido, faixa de referência e badge NORMAL/ALTERADO/TÉCNICA/GABARITO.
- **Componente:** `GoldenRuleVitalsReferenceBoard.tsx`

**Wire:**

```text
  PA — REFERÊNCIA DE PROVA
┌──────────────────────────────────────────┐
│ mnemônico: 80% · nível coração · 5 min   │
├──────────────────────────────────────────┤
│ Manguito 80% circ.    [TÉCNICA]          │
│ Braço nível coração   [TÉCNICA]          │
│ PAS/PAD adulto        [REFERÊNCIA]       │
│ Gabarito letra D      [GABARITO]         │
└──────────────────────────────────────────┘
```

**Interação:** toque na lente → destaque; `sv_kind` via `resolveSvKindForRow` (`pa`, `fc`, `fr`, `temp`, `meta`).

**Slots (`rows[]`):**

| Slot | `label` | `value` | `emphasis` / badge |
|------|---------|---------|-------------------|
| 1 | `Manguito` | Comprimento ≈ 80% da circunferência do braço | `meta` / TÉCNICA |
| 2 | `Posição` | Braço apoiado ao nível do coração (4º EIC) | `meta` / TÉCNICA |
| 3 | `Repouso` | ≥5 min sentado, sem falar | `meta` / TÉCNICA |
| 4 | `PA caso` | Valor do enunciado ou normotensão | `success` ou `alert` |
| 5 | `Conclusão` | Letra ou conduta (slide 3 antecipa) | GABARITO |

**`content`:** mnemônico `80% · coração · 5 min` (≤36 caracteres).

**`footer_rule`:** `PA: manguito certo + braço no coração antes de julgar o número`

---

## 4. Slide 3 — `logic_flow`

- **`layout_variant`:** `vitals-translate-tap`
- **Metáfora visual:** cartões de tradução — cada tap revela um passo que liga valor/técnica → eliminação de letra.
- **Componente:** `LogicFlowVitalsTranslateTap.tsx`

**Wire:**

```text
 Passo 1/4          [tap →]
┌─────────────────────────────┐
│ Eliminar A: temp pós-exerc. │
└─────────────────────────────┘
        ↓ tap
 Passo 4: Letra D — manguito + nível coração
```

**Interação:** `reveal_mode: "tap"` obrigatório; um passo por tela; último passo cita letra.

**Slots (`steps[]`):**

| # | Conteúdo exemplo |
|---|------------------|
| 1 | Eliminar distrator de temperatura (pós-atividade física). |
| 2 | Eliminar B — polegar no pulso (técnica incorreta). |
| 3 | Eliminar C — contar FR com paciente conversando. |
| 4 | Letra D — braço ao nível do coração + manguito adequado. |
| 5 | Fixação: técnica PA antes de interpretar PAS/PAD. |

---

## 5. Slide 4 — `danger_zone`

- **`layout_variant`:** `vitals-classify-arena`
- **Metáfora visual:** arena split ERRO × CORRETO por parâmetro SV, com chip do parâmetro (PA, FC, FR, Temp).
- **Componente:** `DangerZoneVitalsClassifyArena.tsx`

**Wire:**

```text
┌─ ERRO #1 ─ PA ─────────────────────────────┐
│ Pegadinha: manguito pequeno/grande         │
│ CORRETO: 80% circunferência do braço       │
├─ ERRO #2 ─ FC ─────────────────────────────┤
│ Pegadinha: polegar no pulso                  │
│ CORRETO: indicador+médio, 60 s se preciso  │
└────────────────────────────────────────────┘
```

**Interação:** split card rose (erro) × emerald (correto); `bullet_style: "x_icon"` opcional.

**Slots (`items[]`):**

| Slot | `label` | `detail` (pegadinha) | `correct` (único) |
|------|---------|----------------------|-------------------|
| 1 | `PA — posição` | Braço pendente abaixo do coração | Apoiar ao nível do 4º EIC |
| 2 | `PA — manguito` | Manguito estreito superestima PAS | Manguito ≈ 80% da circunferência |
| 3 | `FC — palpação` | Polegar do profissional no pulso | Indicador + médio ou 60 s completos |
| 4 | `FR — contagem` | Contar com paciente falando | Observar 1 min sem avisar |

**`content`:** `PEGADINHAS — TÉCNICA DE AFERIÇÃO`

**`footer_rule`:** `Na prova: técnica errada elimina antes de discutir o número`

---

## 6. Palavras-gatilho (inferência automática)

| Molde | Gatilhos em `label` / `detail` / `value` |
|-------|------------------------------------------|
| `vitals-panel` | `pressão`, `pulso`, `frequência`, `temperatura`, `manguito`, `braço` |
| `vitals-reference-board` | `mmHg`, `bpm`, `irpm`, `°C`, `80%`, `Korotkoff`, `normotenso` |
| `vitals-translate-tap` | `eliminar`, `letra`, `certo`, `incorreto`, `afirmativa` |
| `vitals-classify-arena` | `polegar`, `conversar`, `exercício`, `manguito`, `nível do coração` |

**Wiring:** `SUBTOPIC_DESIGN_MAP` · `moldAffinity.ts` · `lib/slides/vitalsSlideUtils.ts` · `vitalsGoldenLint.ts`

---

## 7. Exemplo JSON mínimo

```json
{
  "meta": {
    "subtopico": "Verificação de Sinais Vitais",
    "pedagogical_branch": "vitals_pa_tecnica",
    "family": "protocolo",
    "content_standard": "golden-v1"
  },
  "reverse_study_slides": [
    {
      "type": "concept_map",
      "chip_label": "PA",
      "items": [
        { "label": "Pressão arterial", "detail": "Braço ao nível do coração; manguito 80% da circunferência.", "icon": "HeartPulse" },
        { "label": "Pulso / FC", "detail": "Indicador + médio; evitar polegar.", "icon": "Activity" },
        { "label": "FR", "detail": "Contar 1 min sem o paciente saber.", "icon": "Wind" },
        { "label": "Temperatura", "detail": "Axilar em repouso; não após exercício.", "icon": "Thermometer" }
      ],
      "footer_rule": "Técnica correta antes de interpretar o número"
    },
    {
      "type": "golden_rule",
      "content": "80% · coração",
      "rows": [
        { "label": "Manguito", "value": "≈ 80% da circunferência do braço" },
        { "label": "Posição", "value": "Braço ao nível do coração (4º EIC)" },
        { "label": "Repouso", "value": "≥5 min sentado, sem falar" },
        { "label": "Gabarito", "value": "Letra D — técnica de PA correta" }
      ]
    },
    {
      "type": "logic_flow",
      "reveal_mode": "tap",
      "steps": [
        "A: temperatura pós-exercício → eliminar.",
        "B: polegar no pulso → eliminar.",
        "C: FR com paciente conversando → eliminar.",
        "Letra D.",
        "Fixação: manguito + braço no coração."
      ]
    },
    {
      "type": "danger_zone",
      "bullet_style": "x_icon",
      "content": "PEGADINHAS — AFERIÇÃO",
      "items": [
        { "label": "PA — braço baixo", "detail": "Braço pendente distorce a leitura.", "correct": "Apoiar ao nível do coração." },
        { "label": "FC — polegar", "detail": "Polegar sente pulso próprio.", "correct": "Indicador + médio ou 60 s." },
        { "label": "FR — conversa", "detail": "Fala altera o ritmo.", "correct": "Contar 1 min discretamente." }
      ]
    }
  ]
}
```

---

## 8. Anti-padrões

- Gabarito literal nos slides 1–2 (sem contexto normativo).
- `correct` repetido entre itens do `danger_zone`.
- Row “Tempo” sem `sv_kind: meta` (inferência errada para temperatura).
- Hardcodar letra D ou banca no React.
- Drift para oxigenoterapia/IPC sem âncora no enunciado.

---

## 9. Definition of Done (DoD)

- [ ] Legível em **375px** — cards claros; alvos ≥44px
- [ ] **Zero hardcode** de gabarito/letra no componente
- [ ] **4× `layout_variant`:** `vitals-panel` · `vitals-reference-board` · `vitals-translate-tap` · `vitals-classify-arena`
- [ ] Par conceito-perigo: painel (slide 1) ↔ arena (slide 4) por parâmetro SV
- [ ] `vitalsSlideUtils` cobre slots do JSON âncora (`resolveSvKindForRow`, `inferSvIconName`)
- [ ] `prefers-reduced-motion`: revelação sem animação obrigatória
- [ ] Handcraft: `meta.pedagogical_branch: vitals_pa_tecnica` nos 196 slugs do ramo

---

## 10. Handoff engenharia

| Item | Status |
|------|--------|
| Componentes React | **Existem** — `molde_redesign` = validar lint golden + repair handcraft |
| Próximo trigger | `Handcraft: Verificação de Sinais Vitais` ou `Implementar molde: vitals_pa_tecnica` se ajuste visual |
| Golden âncora | `examples/questao-premium-fepese-sv-interpretacao-valores.json` |

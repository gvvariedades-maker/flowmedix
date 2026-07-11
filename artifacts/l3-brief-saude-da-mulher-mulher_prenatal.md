# BRIEF DE VARIANTES — Saúde da Mulher / mulher_prenatal

**Gerado:** 2026-07-08  
**Política:** `molde_redesign` (hoje `morphological · center · cards · list` legado — **upgrade obrigatório**)  
**Família:** `conceito` + `protocolo` (81% MCQ clínico; VF I/II/III residual)  
**Template:** `pink` (t14)  
**Volume:** 75 slugs · 28,5% do subtópico

**Âncora:** `examples/questao-premium-cpcon-saude-mulher-pre-natal-vf.json`

| Campo | Valor |
|-------|-------|
| Banca / ano | CPCON UEPB 2025 |
| Tipo | V/F I–II–III — pré-natal precoce + ácido fólico |
| Gabarito | B — I e II, apenas |

**Erro reproduzível:** aluno confunde **timing** — TTGO no 1º trimestre (errado: é 24–28 sem), **4 consultas** vs **6 mínimas**, exames do 3º tri no 1º tri, ou nega risco do tabagismo (III).

**Por que bespoke:**

1. Erro **espacial** — cruzar **trimestre × exame × periodicidade de consultas** na mesma linha gestacional.
2. **75 slugs** — maior ramo do subtópico.
3. `reference_table` plana não mostra **trimestre errado** vs **certo** na trilha.
4. Fonte normativa densa (`lib/guidelines/saudeMulher.ts` — Caderno AB 32).

---

## 1. Metáfora do pacote

**“Trilho gestacional 0→40 semanas → painel exames × trimestre → eliminar letras pelo marco errado → arena de pegadinhas de timing.”**

Universo visual: trilho horizontal **1º · 2º · 3º tri · 36+ · 41+**, chips rose no marco distrator, hot pink no marco da prova.

---

## 2. Slide 1 — `concept_map`

- **`layout_variant`:** `mulher-gestation-timeline`
- **Metáfora:** timeline vertical com marcadores de IG; cartas de conduta à direita.
- **Componente proposto:** `MulherGestationTimelineConceptMap.tsx`

**Wire (375px):**

```text
 1º TRI ─┬─ 1ª consulta + glicemia + VDRL/HIV
         │
 2º TRI ─┼─ TTGO 24–28 sem · US morfológico
         │
 3º TRI ─┼─ Repetir VDRL · hemograma · urina
         │
 36+   ─┼─ Consultas semanais
         │
 41+   ─┴─ Bem-estar fetal / indução
```

**Interação:** toque na carta expande `detail`; auto-destaca trimestre citado no enunciado.

**Slots (`items[]`):**

| Slot | Papel | label exemplo | Gatilhos |
|------|-------|---------------|----------|
| foco | Marco da prova | `Marco da questão` | `1º trimestre`, `24 semanas`, `6 consultas` |
| núcleo | Conduta gabarito | `Ácido fólico` | `pré-concepção`, `início gestação` |
| contraste | Vizinho temporal | `TTGO — quando?` | `24 e 28`, `não 1º tri` |
| contraste | Periodicidade | `Consultas` | `mensal`, `quinzenal`, `semanal` |
| alerta | Sinais | `Sinais de alerta` | `sangramento`, `PA`, `movimentos` |

**Par slide 4:** cada distrator ilumina **trimestre errado** no trilho `mulher-prenatal-trap-arena`.

---

## 3. Slide 2 — `golden_rule`

- **`layout_variant`:** `mulher-prenatal-board`
- **Metáfora:** painel com trilho de trimestres fixo + `rows[]` empilhados.
- **Componente proposto:** `GoldenRuleMulherPrenatalBoard.tsx`

**Wire:**

```text
  PRÉ-NATAL — CADERNO AB 32
┌──────────────────────────────────────┐
│ [1º][2º][3º][36+][41+]  ← trilho     │
├──────────────────────────────────────┤
│ Consultas mínimas    6+         [hot]│
│ 1º tri               mensal    [info]│
│ 28–36 sem            quinzenal [warn]│
│ 36+ sem              semanal   [hot]│
│ TTGO 75g             24–28 sem [hot]│
│ Glicemia jejum       1ª consulta[ok] │
└──────────────────────────────────────┘
```

**Interação:** toque em `row` acende slot(s) no trilho; badge `hot` no marco da questão.

---

## 4. Slide 3 — `logic_flow`

- **`layout_variant`:** `mulher-prenatal-tap-flow`
- **`reveal_mode`:** `tap`
- **Metáfora:** passos como estações no trilho gestacional; último passo revela letra.
- **Componente proposto:** `LogicFlowMulherPrenatalTapFlow.tsx`

**Passos típicos:** validar I → validar II → eliminar III → gabarito → fixação (`footer_rule`).

---

## 5. Slide 4 — `danger_zone`

- **`layout_variant`:** `mulher-prenatal-trap-arena`
- **`bullet_style`:** `x_icon`
- **Metáfora:** arena compare — pegadinha (trimestre errado) × correto no trilho.
- **Componente proposto:** `DangerZoneMulherPrenatalTrapArena.tsx`

**Pegadinhas gatilho:** `4 consultas`, `TTGO 1º trimestre`, `tabagismo irrelevante`, `puerpério 30 dias`.

---

## 6. Contrato JSON mínimo

```json
{
  "meta": { "pedagogical_branch": "mulher_prenatal", "family": "vf" },
  "reverse_study_slides": [
    { "type": "concept_map", "items": [{ "label": "1ª consulta", "detail": "o mais precoce possível — 1º trimestre" }] },
    { "type": "golden_rule", "rows": [{ "label": "TTGO", "value": "24–28 semanas", "badge": "hot" }] },
    { "type": "logic_flow", "reveal_mode": "tap", "steps": ["I verdadeira…", "Letra B."] },
    { "type": "danger_zone", "items": [{ "label": "Tabagismo irrelevante", "correct": "Aumenta riscos maternos e fetais." }] }
  ]
}
```

---

## 7. DoD §9

- [ ] Metáfora única 4/4 (trilho gestacional)
- [ ] 4× `layout_variant` nomeados
- [ ] 375px legível; toque ≥44px
- [ ] 0 hardcode de gabarito nos componentes
- [ ] Par concept ↔ danger por trimestre errado
- [ ] `prefers-reduced-motion`: revelar sem stagger

**Anti-padrões:** row “Gabarito letra X” no golden · repetir `correct` no danger · drift para IPCS/CVC.

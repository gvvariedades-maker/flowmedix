# BRIEF DE VARIANTES — Imunização / imunizacao_calendario

**Gerado:** 2026-07-02  
**Política:** `molde_redesign` (hoje genérico morphological · reference_table · vertical · compare — **upgrade obrigatório**)  
**Família:** `conceito` (MCQ idade × vacina · conduta catch-up · gestante/HPV absorvidos)  
**Template:** `lime` (t09)  
**Volume:** ~356 slugs · 62% do subtópico (137 adolescente/adulto + 135 infantil + HPV/gestante absorvidos)

**Âncoras duplas (1 pacote, 2 sub-padrões):**

| Sub-padrão | Âncora | Erro reproduzível |
|------------|--------|-------------------|
| **A — Marco idade × vacina** (lactente) | `examples/questao-premium-fundatec-meningococica-3meses.json` | Confunde **3 meses de vida** com vacinas de **2, 4 ou 6 meses** (BCG, rota, pneumo, pentavalente) |
| **B — Catch-up sem comprovação** (adolescente/adulto) | `examples/questao-premium-admtec-imunizacao-adolescente-cartao-perdido.json` | Adia vacinação por **sorologia, teste ou arquivo** em vez de aplicar calendário da idade |

---

## 0. Questão âncora (piloto A — Fundatec)

| Campo | Valor |
|-------|-------|
| Banca / ano | Fundatec — Pref Paulo Bento 2024 |
| Tipo | MCQ — “vacina no 3º mês de vida” |
| Gabarito | B — Meningocócica C (conjugada) |

**Erro reproduzível:** aluno marca BCG (nascer), rotavírus (2·4m) ou pneumo 10 (2·4·12m) porque não fixou que **só Men C tem dose aos 3 meses** no PNI lactente.

**Por que bespoke (não `compare` genérico):**

1. Erro **espacial** — cruzar **linha do tempo 0·2·3·4·6·12** × nome da vacina.
2. **553+ slugs** no ramo (`l3-mold-gap-audit`) — maior cluster do subtópico.
3. `reference_table` plana não mostra **mês errado** vs **mês certo** na mesma trilha.
4. Par visual concept (timeline) ↔ danger (calendar-mismatch) já existe parcialmente no repo.

**Status componentes:**

| Slide | `layout_variant` | React |
|-------|------------------|-------|
| concept_map | `vaccine-timeline` | ✅ `VaccineTimelineConceptMap.tsx` |
| golden_rule | `pni-calendar-board` | ✅ `GoldenRulePniCalendarBoard.tsx` |
| logic_flow | `pni-calendar-elimination-tap` | ✅ `LogicFlowPniCalendarEliminationTap.tsx` |
| danger_zone | `calendar-mismatch` | ✅ `DangerZoneCalendarMismatch.tsx` |

---

## 1. Metáfora do pacote

**“Linha do tempo vacinal PNI → painel de marcos por idade → eliminar letras pelo mês errado → trilho de calendário × pegadinha.”**

Universo visual: **trilho horizontal 0·2·3·4·6·12**, chips monoespaçados, foco lime no marco da prova, rose no mês distrator.

**Sub-padrão B (catch-up):** mesma skin; trilho de meses **oculto**; painel de **portões de conduta** (sorologia · arquivo · vacinar agora).

---

## 2. Slide 1 — `concept_map`

- **`layout_variant`:** `vaccine-timeline`
- **Metáfora visual:** timeline vertical com marcadores `0` `2M` `3M` … à esquerda; cartas expandíveis à direita.
- **Componente:** `VaccineTimelineConceptMap.tsx` (já wired em `NeuroSlide.tsx`)

**Wire (modo lactente — 375px):**

```text
 0M ─┬─ Marco da questão (3 meses)     [foco prova]
     │
 2M ─┼─ Rotavírus × Pneumo 10
     │
 3M ─┼─ Meningocócica C (1ª dose)  ◀── highlight
     │
 4M ─┼─ Pentavalente 2ª
     │
     └─ Padrão Fundatec
```

**Wire (modo catch-up):**

```text
 ◆ Comando — cartão perdido
 ◆ Regra central — calendário da idade
 ◆ Papel do técnico — registro
 ◆ Pegadinha — sorologia/arquivo
(sem marcador 3M — inferTimelineMarker retorna `•`)
```

**Interação:**

| Gesto | Efeito |
|-------|--------|
| Toque na carta | Expande `detail` (`line-clamp-3` → completo) |
| Auto | `inferTimelineMarker` destaca `3M` se texto cita “3º mês” / “marco da questão” |

**Slots (`items[]`):**

| Slot | Papel | Exemplo label | Gatilhos no `detail` |
|------|-------|---------------|----------------------|
| foco | Marco da prova | `Marco da questão` | `3º mês`, `3 meses`, `idade` |
| núcleo | Vacina gabarito | `Meningocócica C` | `3 meses`, `5 meses`, `12 meses`, esquema |
| contraste | Vizinhos | `BCG × Men C` | `ao nascer`, `não 3 meses` |
| contraste | Vizinhos | `Rotavírus × Pneumo 10` | `2 e 4`, `2, 4 e 12` |
| meta | Padrão banca | `Padrão Fundatec` | `idade exata`, `marcos PNI` |
| catch-up | Comando | `Comando` | `cartão perdido`, `sem comprovação` |
| catch-up | Regra | `Regra central` | `calendário da idade`, `não paralisar` |

**Ícones:** `Calendar`, `Syringe`, `Baby`, `Shield`, `ClipboardCheck`, `Target`, `BookOpen`, `AlertTriangle`

**Mobile:** timeline em coluna única; marcador 40×40px; carta ≥44px altura tocável.

**Reduced motion:** cartas visíveis sem stagger obrigatório.

**Par com slide 4:** cada distrator por **mês errado** (A=0, D=2·4, E=2·4·12) ilumina trilho `calendar-mismatch`.

---

## 3. Slide 2 — `golden_rule`

- **`layout_variant`:** `pni-calendar-board` (**novo**)
- **Metáfora visual:** painel de referência com **trilho de meses fixo** no topo + `rows[]` como cartões empilhados; linha `hot` pulsa no marco da questão.
- **Componente proposto:** `GoldenRulePniCalendarBoard.tsx`

**Wire:**

```text
  PNI — VACINAS COBRADAS POR IDADE
┌─────────────────────────────────────────┐
│ [0][2M][3M][4M][6M][12M]  ← trilho fixo │
├─────────────────────────────────────────┤
│ Ao nascer      BCG + Hep B        [info] │
│ 2 meses        Penta·VIP·Pneumo   [warn] │
│ 3 meses ★      Men C 1ª dose      [hot] │  ← highlight
│ Esquema Men C  3 · 5 · 12         [ok]  │
│ 4 meses        Penta 2ª …         [warn] │
├─────────────────────────────────────────┤
│ Catch-up: sem cartão → vacinar idade    │
└─────────────────────────────────────────┘
```

**Interação:**

| Gesto | Efeito |
|-------|--------|
| Toque em `row` | Expande `value`; acende slot(s) no trilho superior |
| Toque em mês do trilho | Filtra/destaca rows que citam aquele mês |
| Modo catch-up | Trilho recolhido; rows com badge `hot` em conduta PNI |

**Slots (`rows[]`):**

| Slot | `label` | `value` | `badge` |
|------|---------|---------|---------|
| 0 | `Ao nascer` | BCG + Hep B | `info` |
| 2 | `2 meses` | Penta · VIP · Pneumo · Rota 1ª | `warn` |
| 3 | `3 meses — questão` | Men C conjugada 1ª | `hot` |
| esq | `Esquema Men C` | 3 · 5 · 12 meses | `ok` |
| 4 | `4 meses` | Penta 2ª · Rota 2ª | `warn` |
| catch | `Cartão perdido` | Calendário da faixa etária | `hot` |
| catch | `Sorologia rotina` | Não exigir antes de vacinar | `warn` |

**Inferência:** `extractMonths` + `inferPniCategory` → `calendario`; `emphasis: highlight` na row do enunciado.

**`footer_rule`:** `Em prova: idade do enunciado → linha do calendário → cruzar com alternativa`

**Fallback até implementação:** `reference_table` genérico (status atual) — **não** declarar ramo fechado sem `pni-calendar-board`.

---

## 4. Slide 3 — `logic_flow`

- **`layout_variant`:** `pni-calendar-elimination-tap` (**novo**)
- **`reveal_mode`:** `tap`
- **Metáfora visual:** pipeline de decisão — fixar idade → abrir calendário → testar letra A–E com chip de mês → marcar gabarito.
- **Componente proposto:** `LogicFlowPniCalendarEliminationTap.tsx`

**Wire (modo lactente):**

```text
  [ CALENDÁRIO PNI ]     ● ○ ○ ○ ○ ○ ○ ○
┌───────────────────────────────────────┐
│ Fixar: 3º mês de vida (não 3ª dose)   │
│         [ Próximo ▶ ]                 │
├───────────────────────────────────────┤
│ Testar A (BCG): mês 0 → eliminar      │
│ Testar D (Rota): 2·4m → eliminar      │
│ …                                     │
│ Marcar B — Men C aos 3 meses          │
└───────────────────────────────────────┘
```

**Wire (modo catch-up):**

```text
│ Cenário: adolescente, cartão perdido  │
│ Eliminar A sorologia · B teste · D Ig │
│ Marcar C — reiniciar esquema + cartão │
```

**Parser proposto (`parsePniCalendarStep`):**

| `kind` | Gatilho no `step` |
|--------|-------------------|
| `anchor_age` | `Fixar`, `3º mês`, `marco etário` |
| `eliminate` | `Testar A`, `Eliminar`, `mês 0`, `2 e 4` |
| `locate` | `Marcar B`, `Localizar alternativa` |
| `catchup_eliminate` | `sorologia`, `teste de sensibilidade`, `imunoglobulina` |
| `fixation` | `Fixação`, `Fundatec`, `meses vizinhos` |

**Passos:** 7–10 strings (âncoras A: 9 passos · B: 7 passos).

**Reutilizar:** padrão de `LogicFlowPniVfJuggleTap` (dots, botões, accent lime) sem parser V/F romano.

---

## 5. Slide 4 — `danger_zone`

- **`layout_variant`:** `calendar-mismatch`
- **`bullet_style`:** `x_icon`
- **Metáfora visual:** card pegadinha com **trilho PNI 0·2·3·4·6·12** — mês errado em rose até toque; verde ao revelar `correct`.
- **Componente:** `DangerZoneCalendarMismatch.tsx` ✅

**Wire:**

```text
  PEGADINHAS — CALENDÁRIO (3 MESES)
┌─────────────────────────────────────┐
│ [A] [0][2M][3M][4M][6M][12M]        │
│     ✗ mês 3 destacado errado        │
│     → BCG = ao nascer               │
├─────────────────────────────────────┤
│ [D] trilho: 2·4 acendem no reveal   │
└─────────────────────────────────────┘
```

**Interação:** toque no card → `compareReveal`; `inferCalendarSlots` preenche `trapMonths` / `correctMonths`.

**Par com slide 1:** distrator letra A (BCG 3m) = carta “BCG × Men C” no timeline; item temático “3ª dose = 3 meses” sem rail se só texto.

**Slots catch-up (sem rail):** sorologia, teste sensibilidade, Ig — `hasRail: false` (já suportado).

**`items[].correct` únicos** — uma justificativa por letra/tema (ver âncoras).

---

## 6. Contrato de inferência

| Molde | Função | Gatilhos |
|-------|--------|----------|
| `vaccine-timeline` | `inferTimelineMarker` | `\d+\s*m[eê]s`, `ao nascer`, `marco da questão` → `3M` focus |
| `pni-calendar-board` | `highlightMonthOnRow` | `label` com `N meses`; `badge: hot`; `emphasis: highlight` |
| `pni-calendar-elimination-tap` | `parsePniCalendarStep` | `Testar [A-E]`, `Eliminar`, `Marcar [A-E]`, `cartão perdido` |
| `calendar-mismatch` | `inferCalendarSlots` | `bcg`+`3m` → trap [3] correct [0]; `rotav` → [2,4]; `meningo` → [3,5,12] |

**Modo catch-up vs lactente:** se `instruction` ou `concept_map` contém `cartão perdido|sem comprovação|catch-up` → desabilitar trilho de meses nos slides 2–4; usar rows/steps de conduta.

**Wiring alvo:** atualizar `IMUNIZACAO_CALENDARIO_MOLD` em `pedagogicalBranch.ts`:

```typescript
conceptMap: 'vaccine-timeline',
goldenRule: 'pni-calendar-board',
logicFlow: 'pni-calendar-elimination-tap',
dangerZone: 'calendar-mismatch',
```

**Affinity:** registrar em `MOLD_AFFINITY_RULES` — bloquear `imunizacao_vf_intervalos` (grace period) neste pacote.

---

## 7. Exemplo JSON mínimo (modo lactente)

```json
{
  "meta": {
    "subtopico": "Imunização",
    "pedagogical_branch": "imunizacao_calendario",
    "family": "conceito",
    "content_standard": "golden-v1"
  },
  "reverse_study_slides": [
    {
      "type": "concept_map",
      "items": [
        { "label": "Marco da questão", "detail": "3º mês = 1ª dose Men C conjugada.", "icon": "Calendar" },
        { "label": "Meningocócica C", "detail": "Esquema 3, 5 e 12 meses.", "icon": "Syringe" },
        { "label": "BCG × Men C", "detail": "BCG ao nascer — não aos 3 meses.", "icon": "Baby" }
      ],
      "footer_rule": "3 MESES = 1ª MEN C — esquema 3·5·12"
    },
    {
      "type": "golden_rule",
      "content": "PNI — LACTENTE",
      "rows": [
        { "label": "2 meses", "value": "Penta · VIP · Pneumo · Rota 1ª", "badge": "warn" },
        { "label": "3 meses — questão", "value": "Meningocócica C 1ª dose", "emphasis": "highlight", "badge": "hot" },
        { "label": "4 meses", "value": "Penta 2ª · Rota 2ª", "badge": "warn" }
      ]
    },
    {
      "type": "logic_flow",
      "reveal_mode": "tap",
      "steps": [
        "Fixar marco: 3º mês de vida.",
        "Testar A (BCG): ao nascer → eliminar.",
        "Testar D (Rotavírus): 2 e 4 meses → eliminar.",
        "Testar E (Pneumo 10): 2, 4 e 12 → eliminar.",
        "Marcar B: Meningocócica C aos 3 meses."
      ]
    },
    {
      "type": "danger_zone",
      "bullet_style": "x_icon",
      "content": "PEGADINHAS — 3 MESES",
      "items": [
        {
          "label": "Letra A — BCG aos 3 meses",
          "detail": "BCG no 3º mês — marco errado.",
          "correct": "BCG = ao nascer. Aos 3 meses: Men C (1ª dose)."
        },
        {
          "label": "Letra D — rotavírus no 3º mês",
          "detail": "Rota: 2 e 4 meses.",
          "correct": "Rotavírus = 2 e 4 meses no PNI, nunca 3."
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
| Usar pacote `pni-vf-juggle-tap` / `pni-interval-matrix` neste ramo | É ramo `imunizacao_vf_intervalos` (grace period) |
| Gabarito letra B no `concept_map` antes do `logic_flow` | Spoiler |
| Trilho de meses em questão catch-up pura | UI confunde conduta × idade |
| Hardcode “Men C” como única vacina de 3m em React | Só inferir do JSON; amanhã pode ser outro marco raro |
| `compare` genérico como destino final | Ramo 62% merece bespoke |
| Mesmo `correct` em todos os `items` | Gate L2 |

---

## 9. Critérios de aceite (DoD)

- [x] `BRANCH_DESIGN_MAP.imunizacao_calendario` aponta pacote 4/4 bespoke
- [x] `vaccine-timeline` renderiza âncora Fundatec com foco `3M`
- [x] `calendar-mismatch` acende trilho em pegadinhas A/D/E
- [x] `pni-calendar-board` implementado + teste `slidePresentationSubtopicMold`
- [x] `pni-calendar-elimination-tap` implementado + parser steps
- [ ] Piloto player: Fundatec + ADM&TEC sem fallback genérico
- [x] 375px legível; 0 hardcode de gabarito
- [x] `footer_rule` com estratégia de prova em cada slide

**Status:** pacote 4/4 implementado (2026-07-02). Próximo passo = handcraft lotes calendário + piloto player.

---

*Referências:* [`docs/PROMPT_VARIANTES_NEUROSLIDES.md`](../docs/PROMPT_VARIANTES_NEUROSLIDES.md) · [`docs/VARIANT_MOLDS.md`](../docs/VARIANT_MOLDS.md) §5 (`vaccine-timeline`, `calendar-mismatch`) · [`lib/guidelines/pniCalendario.ts`](../lib/guidelines/pniCalendario.ts)

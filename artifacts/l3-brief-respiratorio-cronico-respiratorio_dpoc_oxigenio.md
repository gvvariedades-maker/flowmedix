# BRIEF DE VARIANTES — Doenças Respiratórias Crônicas / respiratorio_dpoc_oxigenio

**Gerado:** 2026-07-04  
**Política:** `molde_redesign` (moldes legados no repo — brief formal antes de escalar handcraft repair L3)  
**Família:** `protocolo` | `vf` (quando I/II/III + O₂)  
**Template:** `cyan` (t06)  
**Âncora:** `examples/questao-premium-cpcon-dpoc-oxigenoterapia-alvo-vf.json`  
**Cluster:** O₂ titulado na DPOC (APS/emergência) · ramo agregado **6 slugs (46%)** · `sample_slugs[0]`: `instituto-access-enfermagem-processo-de-enfermagem-1780005797734-8`

---

## 0. Questão âncora

| Campo | Valor |
|-------|-------|
| Banca / ano | CPCON UEPB — Pref São Bentinho 2025 |
| Tipo | V/F I–III + combinação MCQ (“É CORRETO o que se afirma em”) |
| Gabarito | B — I e II, apenas |

**Erro reproduzível (1 frase):** o aluno aceita a afirmativa III como verdadeira (“SpO₂ 98–100% sempre no DPOC”) e ignora o risco de **hiperóxia no retentor de CO₂**.

**Por que bespoke (não `compare` genérico):**

1. O erro é **espacial/categorial** — separar trilhos **asma (reversível)** × **DPOC (retentor)** × **faixa SpO₂ 88–92%** antes de julgar alternativas.
2. Números normativos (88–92 · 98–100) pedem **painel de lentes** com badges de alerta, não parágrafo.
3. Padrão se repete em **6 questões** do bucket (≥ limiar 5) — maior ramo do subtópico.
4. `compare` texto×texto não fixa o mapa visual asma×DPOC nem a faixa de saturação alvo.

---

## 1. Metáfora do pacote

**“Duelo asma×DPOC em trilhos → painel SpO₂ com faixa 88–92% → cards de conduta O₂ titulado → arena de pegadinhas hiperóxia/dispositivo.”**

Universo visual único: **trilhos cyan/amber/sky** (asma / DPOC / monitor), chips monoespaçados `88–92%`, ícones `Wind` · `Gauge` · `Activity`.

---

## 2. Slide 1 — `concept_map`

- **`layout_variant`:** `respiratorio-asma-dpoc-duel-deck`
- **Metáfora visual:** deck em trilhos paralelos — cada carta cai em faixa Asma, DPOC, Monitor, Crise ou Educação.
- **Componente:** `RespiratorioAsmaDpocDuelDeckConceptMap.tsx`

**Wire (375px):**

```text
┌──────── Asma ────────┬──────── DPOC ────────┐
│ [Wind] Reversível    │ [Activity] Retentor  │
│ broncodilatador      │ O₂ com cautela       │
├──────── Monitor ─────┴──────── Crise ───────┤
│ [Gauge] SpO₂ titulado│ [Alert] Exacerbação  │
├─────────────────────────────────────────────┤
│ pegadinha: 98–100% cego no DPOC             │
└─────────────────────────────────────────────┘
```

**Interação:**

| Gesto | Estado inicial | Estado final |
|-------|----------------|--------------|
| Toque na carta | `line-clamp-3` no `detail` | Expande texto (`aria-expanded`) |
| — | Badge de trilho inferido (`inferRespiratorioLane`) | Cor cyan=asma · amber=dpoc · sky=monitor |

**Slots (`items[]`):**

| Slot | Papel | Exemplo label | Palavras-gatilho no `detail` |
|------|-------|---------------|--------------------------------|
| 1 | Núcleo asma | `Asma — obstrução reversível` | `asma`, `broncodilatador`, `reversível` |
| 2 | Núcleo DPOC | `DPOC — retentor de CO₂` | `dpoc`, `enfisema`, `persistente`, `hipercapnia` |
| 3 | Monitor | `SpO₂ — titular e monitorar` | `spo2`, `oximetria`, `hipoxemia`, `titulad` |
| 4 | Alvo DPOC | `Alvo 88–92% no retentor` | `88`, `92`, `alvo`, `retentor` |
| 5 | Crise (opcional) | `Exacerbação / descompensação` | `exacerba`, `descompens`, `dispneia` |
| 6 | Educação (opcional) | `Dispositivo / adesão` | `venturi`, `cateter nasal`, `adesão` |

**Ícones Lucide:** `Wind`, `Activity`, `Gauge`, `Target`, `AlertTriangle`, `Droplets`

**Par com slide 4:** trilhos asma/dpoc/monitor aqui = slots da trap-arena (`spo2_alvo`, `oxigenio`).

---

## 3. Slide 2 — `golden_rule`

- **`layout_variant`:** `respiratorio-spo2-reference-board`
- **Metáfora visual:** painel de lentes interativas — cada `row` = regra normativa com badge ok/alert/hot.
- **Componente:** `GoldenRuleRespiratorioSpo2ReferenceBoard.tsx` (wrapper `SoftLensBoard` profile `respiratorio`)

**Wire:**

```text
  O₂ NA DPOC — REFERÊNCIA
┌──────────────────────────────────────────┐
│ mnemônico: 88–92%                        │
├──────────────────────────────────────────┤
│ O₂ titulado        [ok]  Evitar FiO₂ alta │
│ Asma reversível    [ok]  Broncodilatador  │
│ SpO₂ 98–100% sempre [warn] Falso retentor │
├──────────────────────────────────────────┤
│ extra: Venturi · CN · monitor contínuo     │
└──────────────────────────────────────────┘
```

**Interação:** toque na lente → destaca `row`; chips `88–92` em monoespaçado.

**Slots (`rows[]`):**

| Slot | `label` | `value` | `badge` / `emphasis` |
|------|---------|---------|----------------------|
| 1 | `O₂ titulado` | Evitar altas FiO₂ sem monitor | `ok` |
| 2 | `Asma` | Obstrução reversível | `ok` |
| 3 | `SpO₂ 98–100% sempre` | Falso no retentor de CO₂ | `warn` / `alert` |
| 4 | `Alvo DPOC estável` | 88–92% (varia guideline) | `hot` |
| extra | `Dispositivo` | CN baixo fluxo / Venturi | `info` |

**`content`:** mnemônico curto `88–92%` (≤36 caracteres).

**Proibido:** row isolada “Gabarito letra X” sem contexto normativo.

**`footer_rule`:** `DPOC retentor: O₂ com cautela — asma: reversibilidade`

---

## 4. Slide 3 — `logic_flow`

- **`layout_variant`:** `cards` (ramo DPOC — **não** `respiratorio-vf-juggle-tap`; reservado a `respiratorio_vf_asma_dpoc`)
- **`reveal_mode`:** `tap` quando passos numerados; `auto` aceito em MCQ simples
- **Metáfora visual:** sequência de cards empilhados — uma conduta por passo até a letra.

**Wire:**

```text
  [ CONDUTA O₂ ]
┌─────────────────────────────────────┐
│ 1. Identificar retentor / exacerbação │
│         [ Próximo ▶ ]                 │
└─────────────────────────────────────┘
        … titular O₂ …
┌─────────────────────────────────────┐
│ 4. Eliminar III (hiperóxia) → B     │
└─────────────────────────────────────┘
```

**Interação:** toque avança passo; cards com borda sky/amber conforme trilho.

**Passos típicos (`steps[]` strings):**

1. Separar asma (II reversível) de DPOC (I retentor).
2. I: O₂ titulado na descompensação → verdadeira.
3. III: meta 98–100% sempre → falsa (pegadinha).
4. Conjunto I+II → letra B.
5. Fixação: monitorizar SpO₂ — alvo moderado no retentor.

**Quantidade:** 5–8 passos.

---

## 5. Slide 4 — `danger_zone`

- **`layout_variant`:** `respiratorio-spo2-trap-arena`
- **`bullet_style`:** `x_icon`
- **Metáfora visual:** arena por slot de pegadinha — painel errado × correção com trilho asma/dpoc.
- **Componente:** `DangerZoneRespiratorioSpo2TrapArena.tsx`

**Wire:**

```text
  PEGADINHAS — O₂ / SpO₂
┌─────────────────────────────────────┐
│ [spo2_alvo] ✗ 98–100% sempre        │
│      → correto: titular 88–92%      │
├─────────────────────────────────────┤
│ [oxigenio] ✗ suspender O₂ hipoxêmico│
│      → correto: titular com monitor │
└─────────────────────────────────────┘
```

**Interação:** toque no card → revela coluna `correct`; slot inferido via `inferRespiratorioTrapSlot`.

**Slots (`items[]`):**

| Slot | `label` | Pegadinha (`detail`) | `correct` único |
|------|---------|----------------------|-----------------|
| 1 | `Hiperóxia no DPOC` | III fixa 98–100% | Titular O₂ — alvo moderado no retentor |
| 2 | `DPOC = asma` | Confunde reversibilidade | Asma reversível; DPOC persistente |
| 3 | `Suspender O₂` | Interpreta I como proibição | Corrigir hipoxemia com cautela |
| 4 | `Dispositivo errado` | Alto fluxo sem titulação | CN / Venturi conforme prescrição |

**Par com slide 1:** slots `spo2_alvo` e `oxigenio` espelham cartas do duel-deck.

---

## 6. Contrato de inferência

| Molde | Função / gatilhos |
|-------|-------------------|
| `respiratorio-asma-dpoc-duel-deck` | `inferRespiratorioLane(title, detail)`: `dpoc`, `asma`, `spo2`, `crise`, `educa` |
| `respiratorio-spo2-reference-board` | `SoftLensBoard` profile `respiratorio`; badges via `emphasis: alert` + `badge: warn` |
| `cards` (logic_flow) | Passos string; sem parser bespoke — ordem manual no JSON |
| `respiratorio-spo2-trap-arena` | `inferRespiratorioTrapSlot(label, detail, correct)` → `spo2_alvo` \| `oxigenio` \| `exacerbacao` \| `dispositivo` |

**Wiring:** `BRANCH_DESIGN_MAP` → `respiratorio_dpoc_oxigenio` · `pedagogicalBranch.ts` · `lib/slides/respiratorioCronicoSlideUtils.ts`

---

## 7. Exemplo JSON mínimo

```json
{
  "meta": {
    "subtopico": "Doenças Respiratórias Crônicas (Asma, DPOC)",
    "pedagogical_branch": "respiratorio_dpoc_oxigenio",
    "family": "vf",
    "content_standard": "golden-v1"
  },
  "reverse_study_slides": [
    {
      "type": "concept_map",
      "items": [
        { "label": "DPOC", "detail": "Obstrução persistente — risco de hipercapnia.", "icon": "Wind" },
        { "label": "Asma", "detail": "Obstrução reversível — broncodilatador.", "icon": "Activity" },
        { "label": "O₂ titulado", "detail": "Corrigir hipoxemia sem hiperóxia.", "icon": "Gauge" },
        { "label": "Alvo SpO₂ DPOC", "detail": "Geralmente 88–92% no retentor.", "icon": "Target" }
      ],
      "footer_rule": "DPOC retentor: O₂ com cautela — asma: reversibilidade"
    },
    {
      "type": "golden_rule",
      "content": "88–92%",
      "rows": [
        { "label": "O₂ titulado", "value": "Evitar altas FiO₂ sem monitor", "badge": "ok" },
        { "label": "Asma", "value": "Obstrução reversível", "badge": "ok" },
        { "label": "SpO₂ 98–100% sempre", "value": "Falso no retentor", "emphasis": "alert", "badge": "warn" }
      ]
    },
    {
      "type": "logic_flow",
      "reveal_mode": "tap",
      "steps": [
        "I: O₂ titulado na DPOC com CO₂ → verdadeira.",
        "II: asma reversível → verdadeira.",
        "III: SpO₂ 98–100% sempre → falsa.",
        "Letra B.",
        "Fixação: retentor — alvo moderado e monitorizado."
      ]
    },
    {
      "type": "danger_zone",
      "bullet_style": "x_icon",
      "content": "PEGADINHAS — DPOC/ASMA",
      "items": [
        { "label": "Hiperóxia no DPOC", "detail": "III pode piorar retenção de CO₂.", "correct": "Titular O₂ — alvo moderado no retentor." },
        { "label": "DPOC = asma", "detail": "II diferencia reversibilidade.", "correct": "Asma reversível; DPOC persistente." },
        { "label": "Suspender O₂ no hipoxêmico", "detail": "I não proíbe O₂ — pede titulação.", "correct": "Corrigir hipoxemia com cautela." }
      ]
    }
  ]
}
```

---

## 8. Anti-padrões

- Usar `respiratorio-vf-juggle-tap` neste ramo (reservado a `respiratorio_vf_asma_dpoc`).
- Gabarito nos slides 1–2.
- `correct` repetido entre itens do `danger_zone`.
- Hardcodar letra B ou banca no componente React.
- Drift de tema IPCS/CVC sem âncora no enunciado.

---

## 9. Definition of Done (DoD)

- [ ] Legível em **375px** — cards claros sobre shell cyber; alvos ≥44px
- [ ] **Zero hardcode** de gabarito/letra no componente
- [ ] **4× `layout_variant`** nomeados e wired em `NeuroSlide` / layouts
- [ ] Par conceito-perigo documentado (duel-deck ↔ trap-arena)
- [ ] `inferRespiratorioLane` e `inferRespiratorioTrapSlot` cobrem todos os slots do JSON âncora
- [ ] `prefers-reduced-motion`: revelação sem animação obrigatória
- [ ] Handcraft repair: `meta.pedagogical_branch: respiratorio_dpoc_oxigenio` em slugs do ramo

---

## 10. Handoff engenharia

| Item | Status |
|------|--------|
| Componentes React | **Existem** — redesign = validar wiring + repair handcraft L3 |
| Próximo trigger | `Handcraft: Doenças Respiratórias Crônicas (Asma, DPOC)` (repair-l3) ou `Implementar molde: respiratorio_dpoc_oxigenio` se ajuste visual |
| Golden âncora em `examples/` | `questao-premium-cpcon-dpoc-oxigenoterapia-alvo-vf.json` |

# BRIEF DE VARIANTES — Verificação de Sinais Vitais / vitals_fc_faixas

**Gerado:** 2026-07-04  
**Política:** `molde_redesign` (mesmo pacote vitals-* — brief por ramo forte)  
**Família:** `certo_errado` | `protocolo` (faixas FC/FR)  
**Template:** `rose` (t03)  
**Âncora:** `examples/questao-premium-idecan-fc-radial-ce.json`  
**Cluster:** FC e pulso — faixas e técnica · **40 slugs (11,3%)**

---

## 0. Questão âncora

| Campo | Valor |
|-------|-------|
| Banca / ano | IDECAN — UFBA 2022 |
| Tipo | Certo ou Errado |
| Gabarito | Certo — pulso radial, 60 s, faixa 60–100 bpm |

**Erro reproduzível (1 frase):** o aluno confunde **site de palpação** (polegar × indicador+médio), **tempo de contagem** (15 s × 60 s) ou **faixa etária** (RN 120–160 × adulto 60–100).

**Por que bespoke:**

1. Classificação **taquicardia/bradicardia** é categorial — badge NORMAL/ALTERADO no painel.
2. Faixas numéricas (60–100 · 120–160 RN) pedem **reference-board** com chips monoespaçados.
3. **40 slugs** — acima do limiar 36 (ramo forte).
4. Mesmo pacote 4/4 do ramo PA — conteúdo muda slots FC, metáfora permanece “monitor clínico”.

---

## 1. Metáfora do pacote

**“Monitor com destaque FC → painel 60–100 bpm → tap traduz afirmativa C/E → arena separa técnica errada × faixa certa.”**

Compartilha universo visual com `vitals_pa_tecnica` (rose, cards claros, badges NORMAL/ALTERADO).

---

## 2. Slide 1 — `concept_map`

- **`layout_variant`:** `vitals-panel`
- **Metáfora visual:** painel com **slot FC em destaque** + slots secundários (pulso radial, tempo 60 s, faixa adulto/pediátrico).
- **Componente:** `VitalsPanelConceptMap.tsx`

**Wire (375px):**

```text
┌──────── FC — MONITOR ──────────────────────┐
│ [HeartPulse] Pulso radial    [NORMAL]   ▼  │
│ [Timer]      60 segundos     [TÉCNICA]  ▼  │
│ [Scale]      60–100 bpm      [REFERÊNCIA]▼ │
│ [Baby]       RN 120–160      [PEDIÁTRICO]▼ │
└────────────────────────────────────────────┘
```

**Slots (`items[]`):**

| Slot | Papel | Exemplo | Gatilhos |
|------|-------|---------|----------|
| 1 | Pulso | `Pulso radial` | `radial`, `carótida`, `polegar`, `indicador` |
| 2 | Tempo | `60 segundos` | `60 s`, `15 s`, `1 minuto`, `contagem` |
| 3 | Faixa adulto | `FC 60–100 bpm` | `60`, `100`, `taquicard`, `bradicard` |
| 4 | Faixa pediátrica (opcional) | `RN 120–160` | `recém-nascido`, `lactente`, `criança` |
| 5 | Afirmativa | Resumo sem gabarito | texto da prova |

**Par com slide 4:** pegadinhas de site/tempo/faixa = itens da arena.

---

## 3. Slide 2 — `golden_rule`

- **`layout_variant`:** `vitals-reference-board`
- **Metáfora visual:** lentes FC adulto + linha pediátrica opcional + linha técnica.
- **Componente:** `GoldenRuleVitalsReferenceBoard.tsx`

**Slots (`rows[]`):**

| `label` | `value` | badge |
|---------|---------|-------|
| `FC adulto` | 60 a 100 bpm em repouso | NORMAL |
| `Taquicardia` | >100 bpm (adulto) | ALTERADO |
| `Bradicardia` | <60 bpm (adulto) | ALTERADO |
| `Técnica` | Pulso radial · 60 s · indicador+médio | TÉCNICA |
| `Gabarito` | Certo — afirmativa da prova | GABARITO |

**`content`:** `60–100 bpm`

**`footer_rule`:** `FC: site + tempo + faixa — os três na prova`

---

## 4. Slide 3 — `logic_flow`

- **`layout_variant`:** `vitals-translate-tap`
- **Componente:** `LogicFlowVitalsTranslateTap.tsx`

**Slots (`steps[]`):**

| # | Exemplo |
|---|---------|
| 1 | Pulso radial é local padrão em prova → confere. |
| 2 | Contagem por 60 s aumenta precisão → confere. |
| 3 | Faixa 60–100 bpm para adulto em repouso → confere. |
| 4 | Gabarito: **Certo**. |
| 5 | Fixação: polegar no próprio pulso = pegadinha clássica. |

---

## 5. Slide 4 — `danger_zone`

- **`layout_variant`:** `vitals-classify-arena`
- **Componente:** `DangerZoneVitalsClassifyArena.tsx`

**Slots (`items[]`):**

| `label` | `detail` | `correct` |
|---------|----------|-----------|
| `FC — polegar` | Polegar sente o pulso do examinador | Indicador + médio no paciente |
| `FC — 15 s` | Multiplicar por 4 sem ritmo regular | 60 s quando a banca pede precisão |
| `FC — faixa RN` | Aplicar 60–100 no recém-nascido | RN: 120–160 bpm (referência pediátrica) |
| `FC — carótida rotina` | Palpar carótida como rotina de enfermagem | Radial em condição estável |

**`content`:** `PEGADINHAS — FC E PULSO`

---

## 6. Palavras-gatilho

| Molde | Gatilhos |
|-------|----------|
| `vitals-panel` | `pulso`, `radial`, `carótida`, `batimento`, `bpm` |
| `vitals-reference-board` | `60`, `100`, `taquicard`, `bradicard`, `120`, `160` |
| `vitals-translate-tap` | `certo`, `errado`, `afirmativa`, `julgue` |
| `vitals-classify-arena` | `polegar`, `15 segundos`, `recém-nascido`, `radial` |

---

## 7. Exemplo JSON mínimo

Ver `examples/questao-premium-idecan-fc-radial-ce.json` — alinhar `rows` ao lint `vitalsGoldenLint.ts` (máx. 4 rows em C/E + linha gabarito).

---

## 8. Anti-padrões

- Confundir FC com FR nos labels (`sv_kind` explícito quando ambíguo).
- Repetir mesma justificativa em todos os `correct` do danger_zone.
- Glasgow/APGAR neste ramo — rotear para `vitals_glasgow` ou cauda longa.

---

## 9. Definition of Done (DoD)

- [ ] Legível em **375px**
- [ ] **4× layout_variant** do pacote vitals (mesmos componentes do ramo PA)
- [ ] `lintVitalsGoldenContent` passa no golden âncora
- [ ] `pedagogical_branch: vitals_fc_faixas` no handcraft dos 40 slugs
- [ ] Par painel FC ↔ arena pegadinhas FC

---

## 10. Handoff engenharia

| Item | Status |
|------|--------|
| Componentes | **Existem** — compartilham pacote com `vitals_pa_tecnica` |
| Próximo trigger | `Handcraft: Verificação de Sinais Vitais` (lote g01 PA+FC primeiro) |
| Golden âncora | `examples/questao-premium-idecan-fc-radial-ce.json` |

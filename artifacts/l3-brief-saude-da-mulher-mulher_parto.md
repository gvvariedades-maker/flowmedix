# BRIEF DE VARIANTES — Saúde da Mulher / mulher_parto

**Gerado:** 2026-07-08  
**Política:** `molde_inedito`  
**Família:** `conceito` + `protocolo` (69% MCQ; VF I–IV residual)  
**Template:** `pink` (t14)  
**Volume:** 62 slugs · 23,6% do subtópico

**Âncora:** `data/catalog-migration/saude-da-mulher-completo/questions/adm-tec-enfermagem-saude-da-mulher-1777104329543-2.json`

| Campo | Valor |
|-------|-------|
| Banca / ano | Adm&Tec 2025 |
| Tipo | V/F I–IV — boas práticas no trabalho de parto |
| Gabarito | B — II e IV, apenas |

**Erro reproduzível:** aluno aceita **monitorização cardíaca fetal contínua para todas** (I falsa), **posição supina no expulsivo** (III falsa — vertical/lateral preferível), ou rejeita **métodos não farmacológicos** (II) e **clampeamento tardio 1–3 min** (IV).

**Por que bespoke:**

1. Erro **categorial** — classificar condutas em **humanização × intervenção desnecessária × neonatal imediato**.
2. **62 slugs** — segundo maior ramo.
3. Pegadinhas são **pares opostos** (supina × vertical; contínua × intermitente seletiva) — `compare` texto não fixa o mapa mental de fases.

---

## 1. Metáfora do pacote

**“Deck de fases do parto → painel Parto Humanizado (PNH) → tap-flow de validação I–IV → arena supina × vertical.”**

Universo visual: **4 fases** (latência · dilatação · expulsivo · dequitação) + ícones de direitos (acompanhante · posição · clampeamento).

---

## 2. Slide 1 — `concept_map`

- **`layout_variant`:** `mulher-labor-phase-deck`
- **Metáfora:** cartas empilháveis por fase do trabalho de parto; foco na fase citada.
- **Componente proposto:** `MulherLaborPhaseDeckConceptMap.tsx`

**Wire:**

```text
 ┌─────────┐ ┌─────────┐
 │ LATÊNCIA│ │DILATAÇÃO│
 └────┬────┘ └────┬────┘
      │    EXPULSIVO ★
      └────┬────┘
      ┌────▼────┐
      │DEQUITAÇÃO│
      └─────────┘
```

**Slots:** `Fase ativa` · `Dor não farmacológica` · `Posição materna` · `Clampeamento cordão` · `Papel do técnico`

**Par slide 4:** card “supina expulsivo” acende slot rose no deck.

---

## 3. Slide 2 — `golden_rule`

- **`layout_variant`:** `mulher-parto-humanizado-board`
- **Metáfora:** painel PNH — direitos e condutas com badges ok/warn.
- **Componente proposto:** `GoldenRuleMulherPartoHumanizadoBoard.tsx`

**Rows típicos:**

| label | value | badge |
|-------|-------|-------|
| Acompanhante | Livre escolha — trabalho de parto | ok |
| Alívio não farmacológico | Água morna · movimentação | hot |
| Posição expulsivo | Vertical/lateral — não supina fixa | warn |
| Clampeamento tardio | 1–3 min — ferro neonatal | hot |
| Monitorização FCF | Indicada — não rotina contínua universal | warn |

---

## 4. Slide 3 — `logic_flow`

- **`layout_variant`:** `mulher-labor-tap-flow`
- **`reveal_mode`:** `tap`
- **Metáfora:** esteções I→II→III→IV no trilho de fases; eliminação progressiva.

---

## 5. Slide 4 — `danger_zone`

- **`layout_variant`:** `mulher-parto-trap-arena`
- **`bullet_style`:** `x_icon`
- **Metáfora:** arena — conduta “protocolo antigo” × conduta humanizada MS.

**Pegadinhas:** supina obrigatória · CTG contínuo universal · clampeamento imediato · proibir água morna.

---

## 6. DoD §9

- [ ] Metáfora única 4/4 (fases + PNH)
- [ ] 4× `layout_variant` nomeados
- [ ] 375px; toque ≥44px; reduced motion
- [ ] 0 hardcode; `correct` único por item
- [ ] Par deck expulsivo ↔ trap supina

**Golden sugerido:** `examples/questao-premium-admtec-saude-mulher-parto-humanizado-vf.json` (criar no handcraft piloto)

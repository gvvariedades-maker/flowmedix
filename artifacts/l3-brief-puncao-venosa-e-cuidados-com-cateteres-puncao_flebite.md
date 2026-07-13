# BRIEF DE VARIANTES — Punção Venosa e Cuidados com Cateteres / puncao_flebite

**Gerado:** 2026-07-11  
**Política:** `molde_inedito` (ramo forte 19 slugs · 17.3%)  
**Família:** `conceito` (MCQ diferencial de complicações)  
**Template:** `indigo` (t01)  
**Âncora:** `examples/questao-premium-avancasp-puncao-infiltracao-flebite.json`  
**Cluster:** Flebite e complicações · `sample_slugs[0]`: `avancasp-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340254185-7`

## Pacote 4/4

| Slide | `layout_variant` | Componente proposto |
|-------|------------------|---------------------|
| concept_map | `iv-complication-orbit` | `IvComplicationOrbitConceptMap.tsx` |
| golden_rule | `iv-differential-board` | `GoldenRuleIvDifferentialBoard.tsx` |
| logic_flow | `iv-complication-tap-flow` | `LogicFlowIvComplicationTapFlow.tsx` |
| danger_zone | `iv-label-swap-trap` | `DangerZoneIvLabelSwapTrap.tsx` |

---

## 0. Questão âncora

| Campo | Valor |
|-------|-------|
| Banca / ano | AVANÇASP — Pref Pedreira 2024 |
| Tipo | MCQ — mecanismo de complicação IV |
| Gabarito | E — infiltração (líquido no subcutâneo) |

**Erro reproduzível (1 frase):** o aluno troca infiltração (extravasamento para tecido subcutâneo) por flebite (inflamação da veia) ou hematoma (sangue extravascular).

**Por que bespoke:** erro **categorial espacial** — cada complicação ocupa um “nó” diferente no mapa mental; `compare` texto×texto não fixa mecanismo × sinal.

---

## 1. Metáfora do pacote

**“Órbita de complicações IV → painel diferencial → raciocínio tap por mecanismo → armadilha de troca de rótulo.”**

Universo visual: ícones de veia/cateter, chips de mecanismo (`SUBCUTÂNEO` · `INFLAMAÇÃO` · `SANGRAMENTO`), cores semânticas rose para perigo.

---

## 2. Slide 1 — `concept_map`

- **`layout_variant`:** `iv-complication-orbit`
- **Metáfora:** órbita com nós: infiltração · flebite · hematoma · extravasamento · esclerose
- **Componente:** `IvComplicationOrbitConceptMap.tsx`

**Wire (375px):**

```text
        [INFILTRAÇÃO]
             ●
  [HEMATOMA] ●──● [FLEBITE]
             ●
      [EXTRAVASAMENTO]
  toque no nó → card: mecanismo + 1 sinal clínico
```

**Interação:** toque expande `detail`; scroll se >5 nós em 375px.

**Slots (`items[]`):**

| Slot | Papel | Gatilhos no `detail` |
|------|-------|----------------------|
| 1 | Contexto do enunciado | `subcutâneo`, `deslocamento`, `agulha` |
| 2 | Infiltração | `líquido`, `fora do vaso`, `medicamento` |
| 3 | Flebite | `inflamação`, `veia`, `dor`, `calor` |
| 4 | Hematoma | `sangue`, `extravasamento`, `punção` |
| 5 | Pegadinha-âncora | `troca`, `confunde`, `parece` |

**Proibido:** gabarito/letra no concept_map.

**Par com slide 4:** cada nó = eixo de um card de armadilha.

---

## 3. Slide 2 — `golden_rule`

- **`layout_variant`:** `iv-differential-board`
- **Metáfora:** tabela sinal × mecanismo × conduta inicial
- **Componente:** `GoldenRuleIvDifferentialBoard.tsx`

**Wire:**

```text
  COMPLICAÇÃO │ MECANISMO        │ SINAL TÍPICO
  Infiltração │ líquido SC       │ edema, dor, parada fluxo
  Flebite     │ inflamação veia  │ calor, rubor, cordão
  Hematoma    │ sangue SC        │ equimose, endurecimento
```

**Slots (`rows[]`):** 4–6 linhas com `label` + `value`; `content` = mnemônico ≤36c.  
**Proibido:** row “Gabarito letra X”.

---

## 4. Slide 3 — `logic_flow`

- **`layout_variant`:** `iv-complication-tap-flow`
- **`reveal_mode`:** `tap`
- **Componente:** `LogicFlowIvComplicationTapFlow.tsx`

**Passos típicos:** ler mecanismo do enunciado → classificar complicação → eliminar letras por perfil → localizar gabarito → **fixação portátil** (*"Em similares: infiltração = líquido no subcutâneo; flebite = inflamação da parede venosa"*).

---

## 5. Slide 4 — `danger_zone`

- **`layout_variant`:** `iv-label-swap-trap`
- **`bullet_style`:** `x_icon`
- **Componente:** `DangerZoneIvLabelSwapTrap.tsx`

**Slots:** 1 item por distrator + ≥1 transferência (*"em outra banca trocam infiltração por flebite"*).  
Cada `correct` **único** — gate `detectDuplicateDangerJustifications`.

---

## 6. Contrato de inferência

| Molde | Gatilhos |
|-------|----------|
| `iv-complication-orbit` | `infiltração\|flebite\|hematoma\|extravasamento\|esclerose` em `items[].detail` |
| `iv-differential-board` | `rows` com mecanismo + sinal |
| `iv-complication-tap-flow` | `steps` com `mecanismo`, `eliminar`, `Em similares` |
| `iv-label-swap-trap` | `items[].detail` cita complicação errada; `correct` reposiciona |

**Wiring futuro:** `BRANCH_DESIGN_MAP` → `puncao_flebite` · `pedagogicalBranch.ts`.

---

## 7. Anti-padrões

| Proibido | Motivo |
|----------|--------|
| Gabarito em concept_map / golden_rule | `golden_rule_gabarito_spoiler` / v2 |
| Vocabulário bundle/CVC sem âncora | `detectSlideTopicDrift` |
| Mesmo `correct` em 2 letras | slideContract |
| Pacote IPCS legado neste ramo | Desarmonia L3 |

---

## 8. DoD (antes de `Implementar molde:`)

- [x] 4× `layout_variant` implementados e wired em `NeuroSlide.tsx`
- [x] Preview 375px legível; alvos ≥44px
- [x] 0 hardcode de gabarito no React
- [x] `BRANCH_DESIGN_MAP` + `meta.pedagogical_branch` documentados
- [x] `e2e/visual-mold-regression` com slug âncora

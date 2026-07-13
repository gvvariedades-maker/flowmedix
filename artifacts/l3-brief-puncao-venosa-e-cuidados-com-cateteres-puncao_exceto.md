# BRIEF DE VARIANTES — Punção Venosa e Cuidados com Cateteres / puncao_exceto

**Gerado:** 2026-07-11  
**Política:** `molde_inedito` (12 slugs · 10.9%)  
**Família:** `certo_errado` (EXCETO / INCORRETA)  
**Template:** `indigo` (t01)  
**Âncora:** `examples/questao-premium-cev-urca-puncao-exceto-med-endovenosa.json`  
**Cluster:** EXCETO — técnica / conduta · `sample_slugs[0]`: `avancasp-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340270805-8`

## Pacote 4/4

| Slide | `layout_variant` | Componente proposto |
|-------|------------------|---------------------|
| concept_map | `iv-exceto-spectrum` | `IvExcetoSpectrumConceptMap.tsx` |
| golden_rule | `iv-exceto-command-board` | `GoldenRuleIvExcetoCommandBoard.tsx` |
| logic_flow | `iv-exceto-tap-flow` | `LogicFlowIvExcetoTapFlow.tsx` |
| danger_zone | `iv-exceto-intruder-trap` | `DangerZoneIvExcetoIntruderTrap.tsx` |

---

## 0. Questão âncora

| Campo | Valor |
|-------|-------|
| Comando | EXCETO — administração endovenosa |
| Gabarito | D — preferir veias *menos* proeminentes (incorreto; correto = mais proeminentes, firmes, menos tortuosas) |

**Erro reproduzível:** marcar conduta correta como exceção ou não reconhecer a intrusa disfarçada de técnica.

**Gramática EXCETO (obrigatória):** distratores = por que é **correto**; só gabarito = a exceção. Ver skills `professor-para-concurso` + `avant-golden-anchor-handcraft`.

---

## 1. Metáfora

**“Espectro 4 OK × 1 intrusa → regra do comando → varredura letra a letra → trap da conduta que parece certa.”**

---

## 2. Slide 1 — `concept_map` (`iv-exceto-spectrum`)

**Wire:**

```text
  COMANDO: EXCETO
  A ●OK   B ●OK   C ●OK   D ●?    E ●OK
  (sem revelar qual é intrusa até logic_flow)
```

**Slots:** comando, técnica punção, antissepsia, identificação, seleção de veia (pegadinha-âncora sem letra).

---

## 3. Slide 2 — `golden_rule` (`iv-exceto-command-board`)

Mnemônico do comando EXCETO + `rows` de condutas corretas típicas (antissepsia 70%, bisel para cima, cateter novo por tentativa, identificação). **Sem** row de gabarito.

---

## 4. Slide 3 — `logic_flow` (`iv-exceto-tap-flow`)

Passos: confirmar EXCETO → validar A/B/C/E como corretas → isolar intrusa D → gabarito → fixação (*"Em similares: EXCETO = quatro corretas, uma falsa disfarçada"*).

---

## 5. Slide 4 — `danger_zone` (`iv-exceto-intruder-trap`)

| Letra | Papel no danger |
|-------|-----------------|
| A–C, E | `correct` = por que a conduta é correta |
| D (gabarito) | `correct` = por que a banca marca errado (veia menos proeminente) |
| transferência | banca inverte antissepsia ou bisel |

---

## 6. Anti-padrões

- Derivar todas as letras do texto do gabarito
- Gabarito no concept_map antes do tap
- Usar molde IPCS/bundle neste ramo

---

## 7. DoD

- [x] 4× variantes · gramática EXCETO semântica validada em handcraft piloto
- [x] `e2e/visual-mold-regression` com slug EXCETO

# BRIEF DE VARIANTES — Farmacodinâmica e Farmacocinética / farmaco_pk_pd_vf

**Gerado:** 2026-07-13 (retroativo — molde já em produção)  
**Status implementação:** **concluído** (React em `NeuroSlide.tsx`, `LogicFlow.tsx`, `GoldenRule.tsx`, `DangerZone.tsx`)  
**Política:** `ok_generico` por volume (1 slug catálogo) · **bespoke mantido** como âncora golden FUNCAMP  
**Família:** `vf` (I/II/III — PK/PD, ADME, meia-vida)  
**Template:** `purple` (t13)  
**Âncora primária:** `examples/questao-premium-funcamp-farmacodinamica-farmacocinetica-vf.json`  
**Slug catálogo:** `idcap-enfermagem-cuidados-na-administracao-de-medicamentos-1778969633568-4`  
**Cluster ADME:** 2 slugs temáticos — 1 com branch VF declarado

---

## 0. Questão âncora

| Campo | Valor |
|-------|-------|
| Banca / ano | FUNCAMP — UNICAMP 2024 |
| Tipo | V/F I–II–III — definições PK/PD + pegadinha meia-vida |
| Gabarito | B — I e II verdadeiras; III falsa (meia-vida ≠ eliminar 100%) |

**Erro reproduzível (1 frase):** o aluno **troca cinética por dinâmica**, ou aceita que meia-vida = eliminar **100%** da dose (III sedutora).

**Por que bespoke (quando volume crescer):**

1. Erro **categorial** — três blocos I/II/III pedem trilho V/F com juggle tap, não `vertical` genérico.
2. Meia-vida = **50%** vs **100%** é contraste numérico fixável no board normativo.
3. Padrão clássico de prova técnica — potencial de escala se cluster ADME ≥5 slugs.

**Teste espacial (VARIANT_MOLDS §2):**

| Pergunta | Resposta |
|----------|----------|
| Pegadinha espacial? | **Sim** — trilho ADME + slot meia-vida |
| <5 questões hoje? | **Sim** (1 slug VF) → cauda longa; molde ship como âncora |
| `compare` + `correct` basta? | Parcial — juggle tap fixa ordem I→II→III |

---

## 1. Metáfora do pacote

**“Trilho ADME no corpo → painel cinética×dinâmica×meia-vida → juggle tap V/F I–II–III → armadilha meia-vida 50% vs 100%.”**

Universo visual único: **jornada ADME** (purple), estações Absorção → Distribuição → Metabolismo → Excreção, chip `t½` destacado em âmbar.

---

## 2. Slide 1 — `concept_map`

- **`layout_variant`:** `adme-journey-rail`
- **Metáfora visual:** trilho vertical/horizontal com 4 estações ADME + card meia-vida.
- **Componente:** wiring em `NeuroSlide.tsx` + `conceptMapLayout.ts`

**Slots (`items[]`):**

| Slot | Papel | Exemplo | Gatilhos |
|------|-------|---------|----------|
| PK | Farmacocinética | `Farmacocinética` | `ADME`, `absorção`, `excreção` |
| PD | Farmacodinâmica | `Farmacodinâmica` | `receptor`, `efeito`, `ação` |
| t½ | Meia-vida | `Meia-vida (t½)` | `50%`, `concentração`, `eliminar` |
| Mnemônico | Fixação | `Cinética × Dinâmica` | `corpo processa`, `fármaco age` |

**Par com slide 4:** pegadinha III = estação `t½` com valor errado (100%).

---

## 3. Slide 2 — `golden_rule`

- **`layout_variant`:** `pk-pd-reference-board`
- **Metáfora visual:** board 3 linhas — cinética · dinâmica · meia-vida com badge `warn` no limiar.

**Slots (`rows[]`):**

| `label` | `value` | `badge` |
|---------|---------|---------|
| Farmacocinética | O que o organismo faz com o fármaco (ADME) | `ok` |
| Farmacodinâmica | O que o fármaco faz no organismo | `ok` |
| Meia-vida | Queda de **50%** da concentração — não 100% | `warn` |

**`content`:** `CINÉTICA × DINÂMICA` (≤36c)

---

## 4. Slide 3 — `logic_flow`

- **`layout_variant`:** `farmaco-vf-juggle-tap`
- **Metáfora visual:** cards I / II / III com tap sequencial; último passo = combinação + letra.

**Interação:** `reveal_mode: "tap"` — cada step revela verdadeiro/falso por afirmativa.

**Gatilhos em `steps[]`:** `I:`, `II:`, `III:`, `verdadeira`, `falsa`, `letra`.

---

## 5. Slide 4 — `danger_zone`

- **`layout_variant`:** `farmaco-trap`
- **Metáfora visual:** cards de pegadinha — distrator meia-vida 100% × correto 50%.

**`bullet_style`:** `x_icon`  
**Proibido:** repetir `correct` entre letras.

---

## 6. Contrato de inferência

| Molde | Gatilhos |
|-------|----------|
| `adme-journey-rail` | `ADME`, `absorção`, `farmacocinética`, `excreção` em `items` |
| `pk-pd-reference-board` | `rows` com `Farmacocinética`, `Farmacodinâmica`, `Meia-vida` |
| `farmaco-vf-juggle-tap` | `family: vf` + corpus PK/PD; `steps` com I/II/III |
| `farmaco-trap` | `items` com meia-vida, 50%, 100%, eliminar |

**Wiring:** `BRANCH_DESIGN_MAP` → `farmaco_pk_pd_vf` · `FARMACO_VF` regex em `pedagogicalBranch.ts`.

---

## 7. DoD

- [x] 4× `layout_variant`: `adme-journey-rail` · `pk-pd-reference-board` · `farmaco-vf-juggle-tap` · `farmaco-trap`
- [x] React implementado e referenciado em `themeGenerator.ts`
- [x] Golden FUNCAMP em `examples/`
- [x] 0 hardcode de gabarito nos componentes
- [ ] Revisar `branch_mismatch` — slug ADME com `farmaco_generico` inferido vs `farmaco_pk_pd_vf` declarado

**Status:** bespoke **em produção** para âncora; escalar handcraft VF só se cluster ADME ≥5 slugs.

**Próximo passo:** `catalog:patch-pedagogical-branch` nos 2 slugs do cluster ADME; aguardar volume antes de segundo golden VF.

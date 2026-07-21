# BRIEF DE VARIANTES — Promoção à Saúde / promocao_art4_composicao

**Gerado:** 2026-07-19  
**Política:** `molde_redesign` (React **já wired** — brief formal para handcraft e E2E)  
**Família:** `legis` · `certo_errado` (quando EXCETO)  
**Template:** `emerald` (t02)  
**Âncora:** `examples/questao-premium-sus-lei-8080-cesgranrio.json`  
**Cluster (estimado):** Lei 8.080 Art. 4º — composição do SUS (~40–60% do pacote TE)

---

## 0. Questão âncora

| Campo | Valor |
|-------|-------|
| Banca / ano | Cesgranrio — Ag Uni UNEMAT 2024 |
| Tipo | MCQ — composição literal do SUS (Lei 8.080) |
| Gabarito | C — ações e serviços de saúde (esferas + direta/indireta + fundações) |

**Erro reproduzível (1 frase):** o aluno aceita alternativa que **restringe** o SUS (só hospital, só APS, exclui odonto, omite esfera ou bloco do Art. 4º).

**Por que bespoke (não `compare` genérico):**

1. O erro é **espacial/categorial** — montar os **blocos orbitais** do Art. 4º antes de julgar letras.
2. Distractors omitem **um** elemento (ações, serviços, esfera, direta/indireta, fundações) — `scope-trap` mostra o que falta.
3. Padrão dominante em concursos TE sobre SUS (Lei 8.080).
4. `compare` texto×texto não fixa a **órbita normativa** completa.

---

## 1. Metáfora do pacote

**Órbita Art. 4º — blocos normativos em anel → cards de eliminação → arena scope-trap (bloco omitido vs. gabarito completo).**

Universo visual: **emerald** (saúde pública), ícones `Building2`, `Landmark`, `Network`, `Shield`.

---

## 2. Slide 1 — `concept_map`

- **`layout_variant`:** `sus-art4-orbit`
- **Metáfora visual:** órbita com blocos do Art. 4º — cada item = peça da composição legal.
- **Componente:** `SusArt4OrbitConceptMap.tsx` (wired)

**Wire (375px):**

```text
        [ Ações + serviços ]
    [ Esferas F/E/M ]   [ Dir. + indireta ]
        [ Fundações Público ]
    pegadinha: só hospital / só APS / exclui bloco
```

**Interação:**

| Gesto | Estado inicial | Estado final |
|-------|----------------|--------------|
| Toque no bloco | label + detail resumido | destaca bloco + footer_rule contextual |

**Slots (`items[]`):**

| Slot | Papel | Exemplo label | Palavras-gatilho |
|------|-------|---------------|------------------|
| 1 | Núcleo | `Ações e serviços` | `ações`, `serviços`, `conjunto` |
| 2 | Esferas | `Federativo` | `federais`, `estaduais`, `municipais` |
| 3 | Gestão | `Direta e indireta` | `direta`, `indireta`, `autarquias` |
| 4 | Fundações | `Fundações públicas` | `fundações`, `poder público` |
| 5 | Contexto | `Não confundir com princípios` | `princípios`, `CF`, `Art. 196` |

**Par com slide 4:** blocos da órbita = slots da `scope-trap` (o que a letra errada omitiu).

---

## 3. Slide 2 — `golden_rule`

- **`layout_variant`:** `center` (ou `reference_table` com `rows[]` quando tabela normativa)
- **Metáfora:** decore portátil Art. 4º — checklist legal.

**Rows sugeridas:**

| label | value |
|-------|-------|
| Lei | Lei 8.080/1990 |
| Art. 4º | Ações + serviços de saúde |
| Esferas | Federal, estadual, municipal |
| Gestão | Direta e indireta |
| Fundações | Mantidas pelo Poder Público |

**Fonte:** `lib/guidelines/promocaoSaude.ts` · Planalto Lei 8.080.

---

## 4. Slide 3 — `logic_flow`

- **`layout_variant`:** `cards`
- **`reveal_mode`:** `tap` (obrigatório)

**Passos típicos:**

1. Identificar se a questão pede **composição** (Art. 4º) vs. princípios/direitos.
2. Listar mentalmente os 4 blocos orbitais.
3. Eliminar letras que **restringem** escopo (só hospital, só básica, exclui odonto sem base).
4. Eliminar letras que **omitam** esfera ou direta/indireta.
5. Gabarito — letra que fecha todos os blocos.
6. Em similares: banca troca um bloco por sinônimo estreito.

---

## 5. Slide 4 — `danger_zone`

- **`layout_variant`:** `scope-trap`
- **Metáfora:** trilho mostra bloco **faltando** na alternativa errada vs. gabarito completo.

**Items:** 1 card por distrator — `correct` = texto da conduta/norma certa para aquela letra (sem repetir entre cards).

---

## 6. Gate Fase 3b

- [x] Metáfora única 4/4 (órbita Art. 4º)
- [x] 4× layout_variant: `sus-art4-orbit` · `center`/`reference_table` · `cards` · `scope-trap`
- [x] Erro espacial documentado
- [x] Contrato JSON + palavras-gatilho
- [x] React wired + Jest `slidePresentationSubtopicMold`
- [ ] E2E Playwright + capturas 375px (pendente handcraft piloto)
- [x] Path: `artifacts/l3-brief-promocao-a-saude-e-prevencao-de-agravos-promocao_art4_composicao.md`

---

## 7. Handoff handcraft (Modo A)

- `meta.pedagogical_branch`: `promocao_art4_composicao`
- `meta.family`: `legis`
- `meta.subtopico`: `Promoção à Saúde e Prevenção de Agravos` (canônico em todos os slides)
- Não enviar `template` / `layout_variant` — resolver por subtópico/ramo
- Guideline enrich: `promocaoSaude.ts` (Art. 4º, princípios quando aplicável)

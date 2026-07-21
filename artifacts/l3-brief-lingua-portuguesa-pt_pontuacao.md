# BRIEF DE VARIANTES — Pontuação / pt_pontuacao

**Gerado:** 2026-07-20  
**Status implementação:** **React ready** (brief Fase 3b PASS + molde `pt-comma-rail` 4/4 wired)  
**Decisão L3:** `molde_redesign`  
**Bespoke target (pacote):** `pt-comma-rail`  
**Família:** `conceito` (MCQ — frase correta na pontuação)  
**Card vitrine:** `Pontuação`  
**Template sugerido:** `violet` (norma / D — Norma)  
**Guideline:** P1 pendente — `lib/guidelines/linguaPortuguesa/pontuacao.ts` (roadmap)  
**Âncora:** caderno `portugues-caderno-2025-2026-q201-400.pdf` — **questão 399**  
**Fonte interna:** AVANÇASP — AAE (Pref Potim)/2026 — tec id `3839712`  
**Golden:** `examples/questao-premium-avancasp-portugues-pontuacao-vocativo-rita.json`  
**Playbook:** `data/catalog-migration/handcraft-playbooks/lingua-portuguesa.json` → `pt_pontuacao`  
**Pergunta-teste Elias M08:** *O que a vírgula isola? Muda o sentido se tirar?*

---

## 0. Questão âncora

| Campo | Valor |
|-------|-------|
| Banca / ano / órgão | AVANÇASP / 2026 / Pref. Potim — AAE |
| Tipo | Conceito — "Assinale a alternativa que contém a frase correta em relação à pontuação" |
| Gabarito | **B** |
| Tec | `3839712` (metadado interno; não publicar no JSON) |

**Enunciado (fiel, sem marca Tec):**

Assinale a alternativa que contém a frase correta em relação à pontuação.

- **A)** Esta manhã eu me matriculei na faculdade? Essa, faculdade é conceituada!
- **B)** Rita, quando você irá me visitar? ✓
- **C)** Aonde! Perguntou minha, filha.
- **D)** Eu, farei um excelente trabalho.
- **E)** Olha vó Ernestina você, irá comigo na formatura.

**Erro reproduzível (1 frase):** o aluno **cola vírgula onde a fala pausa** (ou confunde sinais de diálogo), **sem** perguntar *o que a vírgula isola* — e não elimina primeiro a vírgula **proibida** entre sujeito|verbo.

**Por que precisa de moldes bespoke (não só genéricos):**

1. Erro **espacial** — cada letra errada viola um **trilho diferente** (SN cortado, diálogo, sujeito|verbo, vocativo mal isolado); `compare` genérico não obriga o gesto "achar vírgula → o que isola?".
2. Cada distrator da âncora falha em **estação diferente** (A SN · C diálogo · D S|V · E S|V + vocativo).
3. Ramo forte: **48** questões no card Pontuação (≥5 slugs; ~7,2% do pacote).
4. Barra TE: tap = **corte**; aluno sente "eu testo o isolamento sozinho" (Elias M08).

**Teste espacial 3/3:** todas **Não** → decisão **`molde_redesign`**.

---

## 1. Metáfora do pacote

> **Trilho de vírgula:** localize a vírgula → pergunte *o que isola?* → **trilho livre** sujeito|verbo **ou** isolamento (vocativo/aposto). Pausa oral ≠ norma.

Universo visual 4/4: trilho violet, chip **O QUE ISOLA?**, estações PODE / NÃO PODE (S|V).

---

## 2. Slide 1 — `concept_map`

- **`layout_variant`:** `pt-comma-rail-deck`
- **Metáfora:** deck 5 cards — terreno da prova (achar vírgula · pergunta-teste · S|V livre · vocativo · pegadinha pausa oral).
- **Slots:** Achar vírgula · Isola o quê? · Trilho S|V livre · Vocativo · Armadilha pausa oral.
- **Ícones:** `ScanSearch`, `HelpCircle`, `GitCommitHorizontal`, `Megaphone`, `AlertTriangle`
- **`footer_rule`:** `Ordem: achar vírgula → o que isola? → sujeito|verbo livre?`
- **Proibido:** gabarito / letra B.

---

## 3. Slide 2 — `golden_rule`

- **`layout_variant`:** `pt-comma-rail-board`
- **Metáfora:** painel de bolso — pergunta-chave + pode / não pode + teste rápido.
- **`content`:** `O QUE A VÍRGULA ISOLA?`
- **Rows:** Pergunta-chave · Pode (vocativo/aposto) · Não pode (S|V) · Teste rápido.
- **`footer_rule`:** `Sujeito|verbo = trilho livre. Vocativo = isola.`
- **Proibido:** row "Gabarito letra B".

---

## 4. Slide 3 — `logic_flow`

- **`layout_variant`:** `pt-comma-rail-tap-flow`
- **`reveal_mode`:** `"tap"`
- **Passos (7):** Comando → eliminar A → C → D → E → validar B → Gabarito B → "Em similares…"
- **Gesto:** cada tap = **um corte** por letra.
- **`footer_rule`:** `Cada toque = 1 corte. Não confunda pausa com norma.`

---

## 5. Slide 4 — `danger_zone`

- **`layout_variant`:** `pt-comma-trap-arena`
- **Metáfora:** arena compare — pegadinha × correção do trilho por letra errada.
- **`bullet_style`:** `"x_icon"`
- **Items:** A (SN) · C (diálogo) · D (Eu, farei) · E (vocativo+S|V) — cada `correct` único.
- **`content`:** `Cada erro = um corte do trilho`
- **`footer_rule`:** `B sobrou: Rita, = vocativo; você irá = trilho livre.`
- **Par concept_map ↔ danger_zone:** "Armadilha pausa oral" ↔ arena por letra.

---

## 6. Contrato de inferência

| Molde | Gatilhos |
|-------|----------|
| `pt-comma-rail-deck` | `isola`, `vocativo`, `sujeito`, `verbo`, `vírgula`, `pausa` |
| `pt-comma-rail-board` | `rows` + `O QUE A VÍRGULA` / `Sujeito|verbo` |
| `pt-comma-rail-tap-flow` | `reveal_mode: tap` + steps `A:`/`Gabarito`/`Em similares` |
| `pt-comma-trap-arena` | `danger_zone` + `items[].correct` únicos |

**Wiring:** `meta.pedagogical_branch`: `"pt_pontuacao"` · `meta.subtopico`: `"Pontuação"` · handoff: `docs/VARIANT_MOLDS.md` § pt-comma-rail.

---

## 7. Exemplo JSON mínimo

Ver âncora completa: `examples/questao-premium-avancasp-portugues-pontuacao-vocativo-rita.json` (golden-v1 READY 2026-07-20).

---

## 8. Anti-padrões

| Proibido | Motivo |
|----------|--------|
| Gabarito nos slides 1–2 | Estudo reverso |
| `correct` repetido | Gate anti-reciclagem |
| Hardcode "Rita" no React | Conteúdo vem do JSON |
| >7 steps / >5 concept cards | Chunking |

---

## 9. Gate Fase 3b — DoD

- [x] Metáfora única 4/4 (trilho O QUE ISOLA?)
- [x] 4× `layout_variant`: `pt-comma-rail-deck` · `pt-comma-rail-board` · `pt-comma-rail-tap-flow` · `pt-comma-trap-arena`
- [x] Erro espacial em 1 frase
- [x] Contrato JSON + gatilhos
- [x] Wire gesto inicial → final
- [x] Par concept_map ↔ danger_zone
- [x] Path: `artifacts/l3-brief-lingua-portuguesa-pt_pontuacao.md`
- [x] Barra TE: tap = decisão
- [x] Âncora golden + React wired (`visual_gallery.status: ready`)

**GATE Fase 3b (brief):** **PASS**

---

## Handoff

| Próximo passo | Trigger |
|---------------|---------|
| Escala handcraft Pontuação g01 | `Handcraft: Língua Portuguesa` + lote gNN |
| Guideline P1 | `lib/guidelines/linguaPortuguesa/pontuacao.ts` |
| Próximo brief 4/4 | `Brief PT: pt_termos_oracao` |

**Proibido neste artefato:** reimplementar React já wired.

# BRIEF DE VARIANTES — Verificação de Sinais Vitais / vitals_pediatrico_faixas

**Gerado:** 2026-07-06  
**Política:** `molde_redesign` (pacote vitals-* — brief por ramo P2)  
**Família:** `protocolo` | `conceito` (faixas por idade)  
**Template:** `rose` (t03)  
**Âncora:** `avancasp-enfermagem-verificacao-de-sinais-vitais-1779344158323-5`  
**Cluster:** Faixas pediátricas por idade · **5 slugs (1,4%) — SHORT LOTE g45**

---

## 0. Questão âncora

| Campo | Valor |
|-------|-------|
| Banca / ano | AVANÇASP — Pref Amparo 2022 |
| Tipo | Múltipla escolha |
| Gabarito | E — FC adulta 60–100 bpm, mais baixa em atletas condicionados |

**Erro reproduzível (1 frase):** o aluno aplica **faixa adulta (60–100 / 12–20)** a lactente, pré-escolar ou escolar — ou ignora **bradicardia fisiológica** do atleta.

**Por que bespoke:**

1. Tabela **MS/SBP por faixa etária** (RN, lactente, pré-escolar, escolar, adolescente) — não reciclar golden adulto.
2. Pegadinha #1: **12–20 irpm** e **60–100 bpm** em criança.
3. **5 slugs** — cluster inteiro em um lote; `reference_table` com rows estratificadas por idade.

---

## 1. Metáfora do pacote

**“Painel SV por idade → tabela MS/SBP por faixa → tap elimina faixa adulta → arena compara distrator × referência pediátrica.”**

Compartilha universo visual com `vitals_fc_faixas` / `vitals_fr_faixas` (rose, badges NORMAL/ALTERADO, chip PEDIÁTRICO).

---

## 2. Slots por slide

| Slide | Layout | Slots obrigatórios |
|-------|--------|-------------------|
| `concept_map` | `vitals-panel` | idade do enunciado · parâmetro (FC/FR) · faixa correta · pegadinha faixa adulta |
| `golden_rule` | `vitals-reference-board` | rows por faixa etária (lactente, 2 anos, escolar, adulto contraste) |
| `logic_flow` | `vitals-translate-tap` | contexto idade → testar alternativas → gabarito letra |
| `danger_zone` | `vitals-classify-arena` | cada distrator com `correct` único — sem colar gabarito |

---

## 3. Referência normativa (tier A)

| Faixa | FC (bpm) | FR (irpm) | Fonte |
|-------|----------|-----------|-------|
| Adulto repouso | 60–100 | 12–20 | MS |
| Atleta condicionado | pode <60 (fisiológica) | — | semiologia |
| Lactente | — | 30–60 (SBP) · prova IBFC 30–50 | SBP / MS caderneta |
| Pré-escolar (~2 anos) | — | 24–40 | MS/SBP |
| Escolar | 70–110 (MS) · MS COVID 75–118 | 18–25 | MS / protocolo COVID-19 |

---

## 4. Slugs do lote g45

| Slug | Foco |
|------|------|
| avancasp-…-8323-5 | FC adulta — exceção atleta (âncora) |
| ibfc-…-2809-7 | FR lactente 30–50 irpm |
| ibgp-…-3939-3 | FC escolar MS COVID 75–118 |
| quadrix-…-7847-7 | FR criança 2 anos 24–40 |
| quadrix-…-8214-2 | FR criança 2 anos 24–40 (par) |

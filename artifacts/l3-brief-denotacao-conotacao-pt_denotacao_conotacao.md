# Brief L3 — pt_denotacao_conotacao (ok_generico)

**Gerado:** 2026-07-23  
**Decisão L3:** `ok_generico`  
**Card:** Denotação, conotação e figuras de linguagem  
**Família dominante:** `text_fragment` + `conceito`  
**Âncora planejada:** tec `3789297` — VUNESP SJRP · «jaz em ruínas» (Lévi-Strauss)  
**Guideline:** `PT_DENOTACAO_CONOTACAO` · `lib/guidelines/linguaPortuguesa/denotacaoConotacao.ts`

---

## 0. Erro espacial (1 frase)

O aluno **literaliza** expressão figurada (ou marca «próprio» onde há carga emotiva) — ou troca **metáfora** por **comparação** por não ver o conectivo.

---

## 1. Metáfora única 4/4

> **Lente literal × figurado:** cada slide é um painel de duas camadas — **dicionário** (denotação) em cinza neutro · **efeito no texto** (conotação/figura) em destaque cyan.

Universo visual: **diff de sentido** (não funil, não trilho). Ícones: `BookOpen`, `Sparkles`, `Eye`, `AlertTriangle`.

---

## 2. Pacote genérico premium (4 slides — sem React bespoke)

| # | type | layout auto | Metáfora |
|---|------|-------------|----------|
| 1 | `concept_map` | `morphological` | Terreno: denotação · conotação · figuras + pegadinha literalizar |
| 2 | `logic_flow` | `vertical` + `reveal_mode: tap` | Pergunta-teste → eliminar letras → gabarito |
| 3 | `golden_rule` | `reference_table` (`rows`) | Tabela figura × marca (como/sem como; parte pelo todo…) |
| 4 | `danger_zone` | `compare` (`items[].correct`) | Cada letra errada + **Transferência** |

**Proibido:** `template` / `layout_variant` no JSON de catálogo.

---

## 3. Slots por slide

### concept_map

| label | detail (≤110c) |
|-------|----------------|
| Denotação | Sentido de dicionário — neutro, objetivo |
| Conotação | Carga emotiva/social — valor do autor |
| Pergunta-teste | Literal ou figurado? Qual figura? |
| Pegadinha | Literalizar metáfora («ruínas» ≠ prédio) |

**footer_rule:** «Sem lente dupla, a banca troca próprio por figurado.»

### logic_flow (tap)

1. Comando pede **sentido** ou **figura**?  
2. Trecho destacado: imagem real ou transferência de sentido?  
3. Eliminar letras que invertem literal/figurado ou figura errada  
4. Gabarito letra X  
5. Em similares: rode a pergunta-teste antes de marcar

### golden_rule (rows)

| label | value |
|-------|-------|
| Metáfora | Sem «como/que/tal qual» — substituição direta |
| Comparação | Com conectivo comparativo explícito |
| Metonímia | Contiguidade — parte pelo todo, autor pela obra |
| Personificação | Ação humana em não humano |
| Ironia | Contexto inverte o sentido literal |

`content` opcional: «Lente literal × figurado»

### danger_zone

- 1 item por distrator com `correct` **único** (por que aquela letra cai)  
- Último item **Transferência**: `Classifique: «frase nova»` · `correct` = `Sentido figurado: …` ou `Sentido literal: …` (não genérico)

---

## 4. Design visual (avant-neuroslides-visual — Modo V)

**Erro espacial calibrado:** painel esquerdo = dicionário; direito = efeito no enunciado. Tap no `logic_flow` = **mudar de lente**, não decorar lista.

| Lei retenção | Aplicação |
|--------------|-----------|
| Contraste emocional | danger = «quase literalizei» — rose suave, não pânico |
| Chunking | ≤4 itens concept_map; tabela golden ≤5 linhas visíveis |
| Transferência | Quiz **Literal \| Figurado** no item Transferência (`transferQuiz`) |

**Wire ASCII (concept_map):**

```text
┌─────────────────┬─────────────────┐
│  DICIONÁRIO     │  NO TEXTO       │
│  (denotação)    │  (conotação)    │
│  ruína = destroço│ jaz em ruínas = │
│                 │  foi abandonada │
└─────────────────┴─────────────────┘
```

**375px:** coluna única — dicionário acima, efeito abaixo (stack).  
**Reduced motion:** ambos painéis visíveis sem animação.

---

## 5. Teste espacial 3/3 (documentado)

| # | Resposta | Motivo |
|---|----------|--------|
| 1 | Sim | Não há funil sequencial obrigatório |
| 2 | Não | 33 slugs no card |
| 3 | Sim | `compare` + `rows` + tap resolve |

→ **ok_generico** — sem `pt-*` bespoke.

---

## 6. Estudo ativo (playbook)

- `correct` Transferência: prefixo `Sentido literal:` ou `Sentido figurado:` (+ nome da figura se MCQ de figura)  
- Exemplo: `Sentido figurado: «jaz em ruínas» = foi abandonada — não enterrada ao pé da letra.`  
- Quiz UI: **Literal | Figurado**

---

## 7. Gate Fase 3b (ok_generico)

- [x] Metáfora única 4/4 documentada  
- [x] Teste 3/3 preenchido  
- [x] neuroslides-visual aplicado (§4)  
- [x] Contrato JSON + transferência  
- [ ] Âncora READY (próximo capítulo)  
- [ ] React — **N/A**

---

## 8. Handoff

Próximo: **Criar âncoras** — `examples/questao-premium-vunesp-portugues-denotacao-literal-figurado.json`  
Depois: `denotacao-conotacao-g01` handcraft (DNA Elias + guideline `denotacaoConotacao.ts`)

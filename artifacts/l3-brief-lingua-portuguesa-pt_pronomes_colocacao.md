# BRIEF DE VARIANTES — Pronomes e colocação / pt_pronomes_colocacao

**Gerado:** 2026-07-19  
**Status implementação:** **pendente** (brief Fase 3b — sem React neste passo)  
**Decisão L3:** `molde_redesign`  
**Bespoke target (pacote):** `pt-clitic-rail`  
**Família:** `conceito` (MCQ — assinale a reescrita correta)  
**Card vitrine:** `Pronomes e colocação pronominal`  
**Template sugerido:** `sky` (morfologia / B — Morfologia)  
**Guideline:** `lib/guidelines/linguaPortuguesa/colocacaoPronominal.ts` (`pt-colocacao-pronominal`)  
**Âncora:** caderno `portugues-caderno-2025-2026.pdf` — **questão 178**  
**Fonte interna:** VUNESP — TEnf (Pref Sorocaba)/2026 · tec id `3999766`  
**Playbook:** `data/catalog-migration/handcraft-playbooks/lingua-portuguesa.json` → `pt_pronomes_colocacao`  
**Pergunta-teste Elias M09:** *Há fator de próclise (palavra atrativa)?*

---

## 0. Questão âncora

| Campo | Valor |
|-------|-------|
| Banca / ano / órgão | VUNESP / 2026 / Pref. Sorocaba — Técnico de Enfermagem |
| Tipo | Conceito — "Assinale a alternativa em que a reescrita… está em conformidade com a norma-padrão de colocação pronominal" |
| Gabarito | **A** |
| Tec | `https://www.tecconcursos.com.br/questoes/3999766` |

**Enunciado (fiel, sem marca Tec):**

Assinale a alternativa em que a reescrita de informações do texto está em conformidade com a norma-padrão de colocação pronominal.

- **A)** O tempo passa e os danos do perigoso hábito começam a **manifestar-se** na vida adulta. ✓
- **B)** **Já bebia-se** muito cedo, na adolescência, sem qualquer problematização ou julgamento dos pais e demais responsáveis.
- **C)** **Quando fala-se** no combate ao consumo abusivo de álcool, o depoimento das pessoas é fundamental.
- **D)** **Se exigem**, portanto, estratégias atualizadas e eficazes para vencer esses e outros obstáculos.
- **E)** A geração formada por pessoas nascidas a partir de 1997 **tem dedicado-se** a novos rumos para o lazer e para as celebrações.

**Erro reproduzível (1 frase):** o aluno **cola o átono** (ênclise "bonita") **sem** perguntar se há **atrativo** à esquerda do verbo — e confunde ênclise no infinitivo com ênclise após advérbio/conjunção/particípio.

**Por que precisa de moldes bespoke (não só genéricos):**

1. Erro **espacial** — o átono tem **3 estações** no trilho (próclise | ênclise | mesóclise); `compare` genérico não obriga o gesto "há atrativo? → escolha a estação".
2. Cada letra da âncora falha em **estação diferente** (atrativo *Já* / *Quando* / *Se* mal posicionado / particípio *tem dedicado-se* vs ênclise ok no infinitivo).
3. Ramo forte: **68** no card Pronomes; **31** só "Colocação Pronominal" no Tec (≥5 slugs) — playbook já marca `molde_redesign` / `pt-clitic-rail` (P0).
4. Barra TE: tap = **decisão**; aluno sente "eu pergunto sozinho" (Elias M09) e quer a próxima.

**Teste espacial 3/3** (rebaixar a `ok_generico` só se **todas** forem sim):

| # | Pergunta | Resposta |
|---|----------|----------|
| 1 | Pegadinha **não** é espacial? | **Não** — é espacial (posição do átono no trilho) |
| 2 | Padrão em <5 questões **e** <10%? | **Não** — 31 Tec + 68 no card; ≥5 |
| 3 | `compare` + `correct` já ensina sem UI bespoke? | **Parcial** — ensina o "porquê", mas não o gesto do trilho |

→ **Não** rebaixa. Decisão permanece **`molde_redesign`**.

---

## 1. Metáfora do pacote

> **Trilho clítico:** o pronome átono só "embarca" em uma de três estações — **próclise** (antes), **ênclise** (depois) ou **mesóclise** (meio, futuro) — e a **pergunta-teste** no portão é: *Há fator de próclise?*

Universo visual único nos 4 slides: **trilho / trilhos cyan-sky** (morfologia), estações PRÓ · ÊN · MESO, chip **ATRATIVE?** no portão. Sem misturar funil de crase nem arena EXCETO neste ramo (salvo comando EXCETO → `pt_exceto_incorreta` + metáfora do trilho).

---

## 2. Slide 1 — `concept_map`

- **`layout_variant`:** `pt-clitic-rail-deck`
- **Metáfora visual:** deck de 5 cards = terreno da prova (o que é colocação + 3 estações + pegadinha-âncora), **sem** letra de gabarito.
- **Wire espacial (ASCII):**

```text
┌─────────────────────────────────────┐
│  TRILHO — o que a banca testa       │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│  │Átono│ │ PRÓ │ │ ÊN  │ │MESO │   │
│  │pos. │ │antes│ │depois│ │meio │   │
│  └─────┘ └─────┘ └─────┘ └─────┘   │
│  ┌─────────────────────────────┐   │
│  │ Pegadinha: ênclise sem      │   │
│  │ perguntar se há atrativo    │   │
│  └─────────────────────────────┘   │
│  footer: "Sem pergunta = chute"    │
└─────────────────────────────────────┘
```

- **Interação:**
  - **Gesto:** tap em card revela `detail` (1 linha); cards não eliminam alternativas.
  - **Estado inicial:** 5 cards fechados (só `label` + ícone).
  - **Estado final:** todos abertos; trilho legível; **zero** "letra A".
- **Slots (`items[]`):**

| Slot | Papel | Exemplo `label` | Palavras-gatilho no `detail` |
|------|-------|-----------------|------------------------------|
| 1 | Definição | `Colocação = posição` | `átono`, `antes`, `depois`, `meio` |
| 2 | Estação 1 | `Próclise` | `atrativo`, `antes`, `não me` |
| 3 | Estação 2 | `Ênclise` | `depois`, `início`, `diga-me` |
| 4 | Estação 3 | `Mesóclise` | `futuro`, `dir-lhe-ei`, `sem atrativo` |
| 5 | Pegadinha | `Ênclise automática` | `atrativo`, `Já`, `Quando`, `chute` |

- **Ícones Lucide:** `TrainFront`, `ArrowLeft`, `ArrowRight`, `Split`, `AlertTriangle`
- **Mobile 375px:** cards em coluna (stack); máx. 5; `detail` ≤110c.
- **Reduced motion:** todos os `detail` visíveis de uma vez.
- **`footer_rule`:** `Antes de enclisar, pergunte: há atrativo?`
- **Proibido:** citar A–E; spoiler "manifestar-se é o gabarito".

---

## 3. Slide 2 — `golden_rule`

- **`layout_variant`:** `pt-clitic-rail-board`
- **Metáfora visual:** painel de bolso — pergunta-teste + 3 estações + 1 linha portátil (infinitivo / particípio).
- **Wire espacial:**

```text
┌──────────────────────────────────────┐
│  content: TRILHO: ATRATIVE? → ESTAÇÃO│
│  ┌────────┬─────────────────────────┐│
│  │Pergunta│ Há atrativo? → próclise ││
│  │Próclise│ não / que / quando / já ││
│  │Ênclise │ início OU sem atrativo  ││
│  │Mesócl. │ futuro SEM atrativo     ││ ← highlight
│  │Portátil│ infinitivo: -se ok;     ││
│  │        │ particípio: sem ênclise ││
│  └────────┴─────────────────────────┘│
│  footer: Futuro+atrativo = próclise  │
└──────────────────────────────────────┘
```

- **Interação:**
  - **Gesto:** tap opcional em row para expandir `value`; sem revelar gabarito.
  - **Inicial:** mnemônico + 4–5 rows.
  - **Final:** mesmo (referência estática — "levo isto").
- **Slots (`rows[]`):**

| `label` | `value` | `emphasis` / `badge` | Gatilhos |
|---------|---------|----------------------|----------|
| Pergunta | há atrativo à esquerda? → próclise | `highlight` / `badge: M09` | `atrativo`, `próclise` |
| Próclise | não, nunca, que, quando, já, se… | `default` | `não`, `quando`, `já` |
| Ênclise | verbo inicia OU sem atrativo | `default` | `ênclise`, `início` |
| Mesóclise | futuro do pret./pres. **sem** atrativo | `success` | `mesóclise`, `futuro` |
| Portátil | inf. *a manifestar-se* ok; *tem dedicado-se* não | `warn` | `infinitivo`, `particípio` |

- **`content` (≤36c):** `TRILHO: ATRATIVE? → ESTAÇÃO`
- **`footer_rule`:** `Futuro + atrativo = próclise (não mesóclise).`
- **Mobile:** tabela 2 colunas; labels curtos; values wrap 2 linhas máx.
- **Reduced motion:** board completo visível.
- **Proibido:** row "Gabarito letra A".

---

## 4. Slide 3 — `logic_flow`

- **`layout_variant`:** `pt-clitic-rail-tap-flow`
- **Metáfora visual:** pipeline vertical — cada tap aplica a **pergunta-teste** a **uma** letra; último tap fecha gabarito + transferência.
- **`reveal_mode`:** `"tap"`
- **Quantos passos:** **6–7** (chunking ≤7)

**Wire / interação:**

```text
Estado inicial: só step[0] visível
Tap 1 → B: "Já" atrai → bebia-se some (deveria Já se bebia)
Tap 2 → C: "Quando" atrai → fala-se some (Quando se fala)
Tap 3 → D: "Se exigem" — se apassivador mal posicionado / ordem errada
Tap 4 → E: particípio "dedicado-se" → ênclise vetada (tem-se dedicado)
Tap 5 → A: "a manifestar-se" — infinitivo sem atrativo à esquerda do átono → ênclise ok
Tap 6 → Gabarito A + "Em similares: há atrativo? → escolha a estação"
```

- **Estado inicial:** passo 1 + chip "Trilho ativo".
- **Estado final:** trilha completa com A destacado em verde; letters B/C/D/E com chip ✗ por estação.

**Slots (`steps[]` — strings; citam letras):**

| # | Papel | Exemplo de step | Gatilhos |
|---|-------|-----------------|----------|
| 1 | Eliminar B | `B: "Já bebia-se" — Já atrai → próclise (Já se bebia)` | `B:`, `Já`, `atrativo` |
| 2 | Eliminar C | `C: "Quando fala-se" — Quando atrai → próclise` | `C:`, `Quando` |
| 3 | Eliminar D | `D: "Se exigem" — ordem/posição do se falha na norma` | `D:`, `Se exigem` |
| 4 | Eliminar E | `E: "tem dedicado-se" — particípio não admite ênclise` | `E:`, `particípio`, `dedicado` |
| 5 | Validar A | `A: "a manifestar-se" — infinitivo; ênclise ok no trilho` | `A:`, `infinitivo`, `manifestar-se` |
| 6 | Gabarito | `Gabarito A — única que embarca na estação certa` | `Gabarito`, `letra A` |
| 7 | Transferência | `Em similares: há atrativo? → pró / ên / meso` | `Em similares`, `atrativo` |

- **Mobile:** um step por vez; botão "Próximo" ≥44px; progresso 1/7…7/7.
- **Reduced motion:** lista completa de steps de uma vez.
- **Proibido:** só parafrasear a option sem nomear a estação / atrativo.

---

## 5. Slide 4 — `danger_zone`

- **`layout_variant`:** `pt-clitic-trap-arena`
- **Metáfora visual:** arena compare — cada card = letra errada (esquerda ✗) × o que o trilho exige (direita ✓). Par com slide 1: mesma pegadinha "ênclise automática", agora **por letra**.
- **Wire:**

```text
content: "Ênclise automática — onde o trilho barra"
┌──────────────┬──────────────────────────┐
│ B · Já+ênc.  │ Já atrai → Já se bebia   │
│ C · Quando+ên│ Quando atrai → se fala   │
│ D · Se exigem│ Exigem-se / posição do se│
│ E · part.+ên │ Auxiliar: tem-se dedicado│
└──────────────┴──────────────────────────┘
```

- **Interação:**
  - **Gesto:** tap no card revela coluna `correct` (compare).
  - **Inicial:** só `label` + `detail` (pegadinha).
  - **Final:** `correct` visível; contraste "quase caí" → "assim acerto".
- **`bullet_style`:** `"x_icon"`
- **Slots (`items[]`):**

| `label` | `detail` (pegadinha) | `correct` (único) | Gatilhos |
|---------|----------------------|-------------------|----------|
| B | Já + ênclise parece "culto" | Advérbio atrai → próclise: **Já se bebia** | `Já`, `bebia-se` |
| C | Quando + ênclise | Conjunção atrai → **Quando se fala** | `Quando`, `fala-se` |
| D | Se exigem (ordem invertida) | Passiva com se: **Exigem-se** (ênclise no início) | `Se exigem`, `Exigem-se` |
| E | tem dedicado-se | Particípio não enclisa → **tem-se dedicado** / tem se dedicado | `dedicado-se`, `particípio` |

- **`content`:** `Trilho barra a ênclise automática`
- **`footer_rule`:** `A sobrou: infinitivo a manifestar-se. Em similares, pergunte o atrativo.`
- **Par concept_map ↔ danger_zone:** card "Ênclise automática" (slide 1) = título/arena (slide 4); cada letra instancia falha no portão ATRATIVE? ou na estação errada.
- **Proibido:** mesmo texto em dois `correct`; card genérico "sempre use o trilho" em todas as letras.

---

## 6. Contrato de inferência

Palavras-gatilho / regex sugeridos para o React mapear JSON → slots (sem hardcode de gabarito):

| Molde | Gatilhos (case-insensitive) |
|-------|------------------------------|
| `pt-clitic-rail-deck` | `colocação`, `próclise`, `ênclise`, `mesóclise`, `atrativo`, `átono` em `items[].detail` |
| `pt-clitic-rail-board` | `rows` com `Pergunta`/`Próclise`/`Ênclise`/`Mesóclise`; `content` com `TRILHO` |
| `pt-clitic-rail-tap-flow` | `reveal_mode: tap` + `steps` contendo `A:`/`B:`/`C:` + `Gabarito` + `Em similares` |
| `pt-clitic-trap-arena` | `danger_zone` + `items[].correct` + gatilhos `Já`/`Quando`/`particípio`/`atrativo` |

**Wiring futuro (não implementar agora):**

- `BRANCH_DESIGN_MAP` → `pt_pronomes_colocacao`
- `meta.pedagogical_branch`: `"pt_pronomes_colocacao"`
- `meta.subtopico`: `"Pronomes e colocação pronominal"` (card) ou titulo_aula do cluster
- Pacote visual: `pt-clitic-rail` (4 variantes acima)
- Handoff: `docs/VARIANT_MOLDS.md` §3 após aprovação deste brief

**Fallback até o React existir:** layouts genéricos premium compatíveis com os mesmos slots — `morphological` · `reference_table` · `tap` · `compare` (handcraft da âncora **não** espera o molde wired).

---

## 7. Exemplo JSON mínimo

Trecho realista que acende todos os slots (handcraft futuro; sem TecConcursos; densidade ≤110c):

```json
{
  "meta": {
    "banca": "VUNESP",
    "ano": "2026",
    "orgao": "Pref. Sorocaba",
    "prova": "TEnf (Pref Sorocaba)",
    "cargo_header": "TÉCNICO",
    "topico": "Língua Portuguesa",
    "subtopico": "Pronomes e colocação pronominal",
    "pedagogical_branch": "pt_pronomes_colocacao",
    "content_standard": "golden-v1",
    "family": "conceito"
  },
  "reverse_study_slides": [
    {
      "type": "concept_map",
      "items": [
        { "label": "Colocação = posição", "detail": "Átono antes, depois ou no meio do verbo", "icon": "TrainFront" },
        { "label": "Próclise", "detail": "Antes do verbo — atrativo à esquerda", "icon": "ArrowLeft" },
        { "label": "Ênclise", "detail": "Depois do verbo — início ou sem atrativo", "icon": "ArrowRight" },
        { "label": "Mesóclise", "detail": "Meio do verbo — futuro sem atrativo", "icon": "Split" },
        { "label": "Ênclise automática", "detail": "Enclisar sem perguntar se há atrativo", "icon": "AlertTriangle" }
      ],
      "footer_rule": "Antes de enclisar, pergunte: há atrativo?"
    },
    {
      "type": "golden_rule",
      "content": "TRILHO: ATRATIVE? → ESTAÇÃO",
      "rows": [
        { "label": "Pergunta", "value": "há atrativo? → próclise", "emphasis": "highlight", "badge": "M09" },
        { "label": "Próclise", "value": "não, que, quando, já, se…" },
        { "label": "Ênclise", "value": "início OU sem atrativo" },
        { "label": "Mesóclise", "value": "futuro SEM atrativo", "emphasis": "success" },
        { "label": "Portátil", "value": "inf. -se ok; particípio sem ênclise", "emphasis": "warn" }
      ],
      "footer_rule": "Futuro + atrativo = próclise (não mesóclise)."
    },
    {
      "type": "logic_flow",
      "reveal_mode": "tap",
      "steps": [
        "B: \"Já bebia-se\" — Já atrai → próclise (Já se bebia)",
        "C: \"Quando fala-se\" — Quando atrai → próclise",
        "D: \"Se exigem\" — posição do se falha na norma",
        "E: \"tem dedicado-se\" — particípio não admite ênclise",
        "A: \"a manifestar-se\" — infinitivo; ênclise ok no trilho",
        "Gabarito A — única que embarca na estação certa",
        "Em similares: há atrativo? → pró / ên / meso"
      ]
    },
    {
      "type": "danger_zone",
      "content": "Trilho barra a ênclise automática",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "B",
          "detail": "Já + ênclise parece culto",
          "correct": "Advérbio atrai → Já se bebia"
        },
        {
          "label": "C",
          "detail": "Quando + ênclise",
          "correct": "Conjunção atrai → Quando se fala"
        },
        {
          "label": "D",
          "detail": "Se exigem (ordem invertida)",
          "correct": "Passiva: Exigem-se (ênclise no início)"
        },
        {
          "label": "E",
          "detail": "tem dedicado-se",
          "correct": "Particípio não enclisa → tem-se dedicado"
        }
      ],
      "footer_rule": "A sobrou: infinitivo a manifestar-se."
    }
  ]
}
```

---

## 8. Anti-padrões deste pacote

| Proibido | Motivo |
|----------|--------|
| Gabarito / "letra A" no concept_map ou golden_rule | Mata o estudo reverso |
| Mesmo `correct` em B/C/D/E | Gate `detectDuplicateDangerJustifications` |
| Trilho só no golden e logic_flow "genérico" | Perde a metáfora 4/4 |
| Misturar `pt-crase-funnel` neste ramo | Crase é outro branch |
| Mesóclise como único conteúdo da âncora 178 | Fora do núcleo desta prova — usar em outros slugs (ex. Q189) |
| Hardcode "manifestar-se" / letra A no componente React | Gabarito no código; conteúdo vem do JSON |
| >7 steps ou >5 cards no concept_map | Estoura memória de trabalho |
| Inventar gabarito divergente do VUNESP A | Prova primeiro |
| Inventar âncora Elias Branca de Neve (fora do caderno) como se estivesse no Tec | Usar só como sub-âncora Gran se importada |

---

## 9. Critérios de aceite (DoD) — Gate Fase 3b

- [x] Metáfora **única** 4/4 (trilho clítico / 3 estações)
- [x] 4× `layout_variant` nomeados: `pt-clitic-rail-deck` · `pt-clitic-rail-board` · `pt-clitic-rail-tap-flow` · `pt-clitic-trap-arena`
- [x] Erro espacial em 1 frase (ênclise automática sem pergunta-teste)
- [x] Contrato JSON + palavras-gatilho por slot
- [x] Wire: gesto, estado inicial → final (cada slide)
- [x] Par concept_map ↔ danger_zone (ênclise automática → arena por letra)
- [x] DoD: 375px legível, 0 hardcode de gabarito no componente, ≤7 slots/tela
- [x] Path: `artifacts/l3-brief-lingua-portuguesa-pt_pronomes_colocacao.md`
- [x] Barra TE: tap = decisão; vontade de estudar
- [ ] Rails/slots preenchidos com JSON de exemplo **no player** (após handcraft + wire)
- [ ] Preview 375px no Playwright (após React)
- [ ] `footer_rule` com estratégia de prova (presente no brief; validar no handcraft)

**GATE Fase 3b (brief):** **PASS** — liberado para handcraft da âncora Q178 / tec `3999766` e, sob pedido explícito, `Implementar molde: pt_pronomes_colocacao`.

---

## Handoff

| Próximo passo | Trigger |
|---------------|---------|
| Handcraft golden-v1 da âncora | `Handcraft: Língua Portuguesa` — Q178 / tec 3999766 / `pt_pronomes_colocacao` |
| Molde React 4/4 | `Implementar molde: pt_pronomes_colocacao` + `@docs/VARIANT_MOLDS.md` (**não** neste brief) |
| Escala gNN Colocação | Só após âncora `[READY]` + este brief aprovado |
| Sub-âncora mesóclise (opcional) | Q189 tec `3452377` (I–II–III pró/ên/meso) ou Gran M09 III |

**Proibido neste artefato:** implementar React / variantes em `components/slides/`.

**Slug sugerido (catálogo futuro):** `vunesp-sorocaba-colocacao-alcool-reescrita-3999766`  
**JSON golden sugerido:** `examples/questao-premium-vunesp-portugues-colocacao-trilho.json`

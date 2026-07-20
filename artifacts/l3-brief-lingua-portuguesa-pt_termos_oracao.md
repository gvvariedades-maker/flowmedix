# BRIEF DE VARIANTES — Termos da oração / pt_termos_oracao

**Gerado:** 2026-07-20  
**Status implementação:** **pendente** (brief Fase 3b — sem React neste passo)  
**Decisão L3:** `molde_redesign`  
**Bespoke target (pacote):** `pt-term-matrix`  
**Família:** `conceito` (MCQ — classificação sintática de termos)  
**Card vitrine:** `Termos da oração`  
**Template sugerido:** `teal` (sintaxe / C — Sintaxe)  
**Guideline:** P1 pendente — `lib/guidelines/linguaPortuguesa/termosOracao.ts` (roadmap)  
**Âncora:** caderno `portugues-caderno-2025-2026-q201-400.pdf` — **questão 326**  
**Fonte interna:** VUNESP — Ag Adm (Pref SJRP)/2026 — tec id `3789304`  
**Golden (piloto):** `examples/questao-premium-vunesp-portugues-termos-matrix-folhetos.json` (pendente)  
**Playbook:** `data/catalog-migration/handcraft-playbooks/lingua-portuguesa.json` → `pt_termos_oracao`  
**Pergunta-teste Elias M05/M08:** *Modifica qual nome? De quê?* · *Circunstância ou complemento?*

---

## 0. Questão âncora

| Campo | Valor |
|-------|-------|
| Banca / ano / órgão | VUNESP / 2026 / Pref. São José do Rio Preto — Ag Adm |
| Tipo | Conceito — classificação de **dois** termos sublinhados em frases do texto |
| Gabarito | **E** |
| Tec | `3789304` (metadado interno; não publicar no JSON) |

**Enunciado (fiel, sem marca Tec):**

Em “No grupo que só recebeu os folhetos, essa taxa foi de 74%” e “Enquanto isso, oito anos após o início do tratamento contra o câncer:”, os termos “No grupo que só recebeu os folhetos” e “Enquanto isso” classificam-se, respectivamente, como

- **A)** complemento nominal e adjunto adverbial.
- **B)** adjunto adverbial e adjunto adnominal.
- **C)** locução conjuntiva e adjunto adverbial deslocado.
- **D)** adjunto adnominal e adjunto adverbial.
- **E)** adjunto adverbial deslocado e locução adverbial de tempo. ✓

**Erro reproduzível (1 frase):** o aluno **cola o rótulo do termo “vizinho”** (adjunto adnominal × adverbial, complemento × circunstância) **sem** aplicar a pergunta-teste em **cada** trecho destacado.

**Por que precisa de moldes bespoke (não só genéricos):**

1. Erro **categorial 2D** — a banca cobra **par** de classificações; `compare` genérico não obriga o gesto “termo 1 → eixo → termo 2 → eixo”.
2. Cada letra troca **rótulos cruzados** (A: CN+AA · B: AA+AAdj · D: AAdj+AA) — ideal para **matriz** visual.
3. Ramo forte: **31** questões no card Termos da oração (≥5 slugs; ~4,6% do pacote, mas cluster Tec separa Integrantes + Acessórios).
4. Barra TE: tap = **colocar no cargo certo**; aluno quer a próxima.

**Teste espacial 3/3:**

| # | Pergunta | Resposta |
|---|----------|----------|
| 1 | Pegadinha **não** é espacial/categorial? | **Não** — é matriz de funções |
| 2 | Padrão em <5 questões **e** <10%? | **Não** — 31 no card; ≥5 |
| 3 | `compare` + `rows` já ensina sem UI bespoke? | **Parcial** — ensina o porquê, não o gesto 2 termos |

→ **Não** rebaixa. Decisão **`molde_redesign`**.

---

## 1. Metáfora do pacote

> **Matriz de cargos:** cada termo destacado entra numa **célula** — eixo **circunstância × modificação do nome** (pergunta: *modifica verbo? modifica nome? de quê?*) — antes de cruzar com a letra.

Universo visual 4/4: grade teal, chips **T1** / **T2**, eixos ADJ.ADV · ADJ.ADN · CN · LOC.TEMPO · DESLOCADO.

---

## 2. Slide 1 — `concept_map`

- **`layout_variant`:** `pt-term-matrix-deck`
- **Metáfora visual:** deck 5 cards = mapa de cargos (sujeito/predicado/objetos · adjuntos · pergunta-teste · pegadinha par cruzado).
- **Wire espacial (ASCII):**

```text
┌─────────────────────────────────────┐
│  MATRIZ — o que a banca testa       │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌────┐  │
│  │Cargo │ │Adj.  │ │Adj.  │ │De  │  │
│  │sint. │ │adv.  │ │adn.  │ │quê?│  │
│  └──────┘ └──────┘ └──────┘ └────┘  │
│  ┌─────────────────────────────┐    │
│  │ Pegadinha: rótulo do vizinho │    │
│  └─────────────────────────────┘    │
│  footer: 1 termo = 1 pergunta-teste │
└─────────────────────────────────────┘
```

- **Interação:**
  - **Gesto:** tap em card revela `detail` (1 linha).
  - **Estado inicial:** 5 cards fechados.
  - **Estado final:** matriz legível; **zero** letra E.
- **Slots (`items[]`):**

| Slot | Papel | Exemplo `label` | Palavras-gatilho no `detail` |
|------|-------|-----------------|------------------------------|
| 1 | Definição | `Termo = função` | `sintaxe`, `cargo`, `oração` |
| 2 | Adj. adverbial | `Circunstância` | `verbo`, `quando`, `onde`, `modo` |
| 3 | Adj. adnominal | `Caracteriza nome` | `substantivo`, `adjetivo`, `modifica` |
| 4 | Pergunta CN | `De quê?` | `complemento`, `preposição`, `nome` |
| 5 | Pegadinha | `Rótulo vizinho` | `confunde`, `adnominal`, `adverbial` |

- **Ícones Lucide:** `Boxes`, `User`, `Box`, `CornerDownRight`, `AlertTriangle`
- **`footer_rule`:** `Cada termo destacado: uma pergunta-teste.`
- **Proibido:** gabarito / letra E.

---

## 3. Slide 2 — `golden_rule`

- **`layout_variant`:** `pt-term-matrix-board`
- **Metáfora visual:** painel 2×2 — pergunta-teste × rótulo portátil.
- **Wire espacial:**

```text
┌──────────────────────────────────────┐
│  content: MATRIZ: PERGUNTA → CARGO   │
│  ┌──────────────┬────────────────────┐│
│  │ Modifica verbo? │ Adj. adverbial  ││
│  │ Modifica nome?  │ Adj. adnominal  ││
│  │ De quê? + prep. │ Complemento nom.││
│  │ Tempo (enquanto)│ Loc. adv. tempo ││
│  └──────────────┴────────────────────┘│
│  footer: Deslocado = anteposto.      │
└──────────────────────────────────────┘
```

- **Slots (`rows[]`):**

| `label` | `value` | `emphasis` | Gatilhos |
|---------|---------|------------|----------|
| Verbo? | circunstância → adj. adverbial | `default` | `verbo`, `circunstância` |
| Nome? | característica → adj. adnominal | `default` | `nome`, `substantivo` |
| De quê? | prep. + nome → complemento nominal | `highlight` | `de quê`, `prep.` |
| Tempo | enquanto, quando, antes → loc. adv. | `success` | `enquanto`, `tempo` |
| Deslocado | anteposto à oração principal | `warn` | `deslocado`, `início` |

- **`content` (≤36c):** `PERGUNTA → CARGO (×2)`
- **`footer_rule`:** `Dois termos = duas células na matriz.`
- **Proibido:** row “Gabarito letra E”.

---

## 4. Slide 3 — `logic_flow`

- **`layout_variant`:** `pt-term-matrix-tap-flow`
- **`reveal_mode`:** `"tap"`
- **Metáfora visual:** pipeline — classificar **T1** → classificar **T2** → eliminar letras → gabarito.

**Wire / interação:**

```text
Tap 1 → T1 «No grupo…»: circunstância do verbo «foi» → adj. adverbial (deslocado)
Tap 2 → T2 «Enquanto isso»: tempo → locução adverbial de tempo
Tap 3 → A: CN no T1? eliminar
Tap 4 → B/D: AAdj no T1 ou T2? eliminar
Tap 5 → C: locução conjuntiva no T1? eliminar
Tap 6 → E: par E+E confere → Gabarito E
Tap 7 → Em similares: 1 termo = 1 pergunta-teste
```

- **Slots (`steps[]`):**

| # | Exemplo step | Gatilhos |
|---|--------------|----------|
| 1 | `T1: «No grupo…» — circunstância → adj. adverbial deslocado` | `T1`, `grupo`, `adverbial` |
| 2 | `T2: «Enquanto isso» — tempo → locução adverbial de tempo` | `T2`, `Enquanto`, `tempo` |
| 3 | `A: T1 não é CN — eliminar` | `A:`, `complemento` |
| 4 | `B/D: confunde adnominal × adverbial — eliminar` | `adnominal`, `adverbial` |
| 5 | `C: T1 não é locução conjuntiva — eliminar` | `C:`, `conjunção` |
| 6 | `Gabarito E — par adj. adv. deslocado + loc. tempo` | `Gabarito`, `letra E` |
| 7 | `Em similares: matriz — pergunta-teste por termo` | `Em similares`, `matriz` |

- **`footer_rule`:** `Cada toque = 1 célula ou 1 corte.`
- **Proibido:** só parafrasear options sem nomear T1/T2.

---

## 5. Slide 4 — `danger_zone`

- **`layout_variant`:** `pt-term-trap-arena`
- **Metáfora visual:** arena compare — rótulo errado (esquerda) × célula certa (direita).
- **Wire:**

```text
content: "Rótulo do vizinho — onde a matriz barra"
┌─────────────┬──────────────────────────┐
│ A CN no T1  │ T1 = circunstância (adv.) │
│ B AAdj no T2│ T2 = tempo (loc. adv.)    │
│ D AAdj no T1│ T1 anteposto, não nome   │
│ C conj. T1  │ T1 não é conjunção       │
└─────────────┴──────────────────────────┘
```

- **`bullet_style`:** `"x_icon"`
- **Slots (`items[]`):**

| `label` | `detail` | `correct` (único) |
|---------|----------|-------------------|
| A | CN em «No grupo…» parece completar ideia | T1 circunstancia verbo — adj. adverbial deslocado |
| B | «Enquanto isso» parece adjetivar «oito anos» | T2 marca tempo — locução adverbial de tempo |
| C | «No grupo…» parece conjunção | Oração circunstancial posicional, não conjuntiva |
| D | «No grupo…» modifica «taxa» | Modifica a situação do verbo, não o núcleo de «taxa» |

- **`content`:** `Matriz barra o rótulo trocado`
- **`footer_rule`:** `E sobrou: adv. deslocado + loc. tempo. Em pares, classifique T1 antes de T2.`
- **Par concept_map ↔ danger_zone:** card “Rótulo vizinho” ↔ arena por letra.

---

## 6. Contrato de inferência

| Molde | Gatilhos |
|-------|----------|
| `pt-term-matrix-deck` | `termo`, `função`, `adjunto`, `complemento`, `circunstância` |
| `pt-term-matrix-board` | `rows` + `De quê?` / `verbo?` / `nome?` |
| `pt-term-matrix-tap-flow` | `T1`/`T2` + `Gabarito` + `Em similares` |
| `pt-term-trap-arena` | `items[].correct` + `adnominal`/`adverbial`/`complemento` |

**Wiring futuro:** `meta.pedagogical_branch`: `"pt_termos_oracao"` · `meta.subtopico`: `"Termos da oração"`.

---

## 7. Exemplo JSON mínimo

Trecho alvo handcraft (âncora 326; sem TecConcursos):

```json
{
  "meta": {
    "banca": "VUNESP",
    "ano": "2026",
    "orgao": "Pref. São José do Rio Preto",
    "prova": "Ag Adm (Pref SJRP)",
    "topico": "Língua Portuguesa",
    "subtopico": "Termos da oração",
    "pedagogical_branch": "pt_termos_oracao",
    "content_standard": "golden-v1",
    "family": "conceito"
  },
  "reverse_study_slides": [
    {
      "type": "concept_map",
      "items": [
        { "label": "Termo = cargo", "detail": "Cada destacado tem uma função na oração", "icon": "Boxes" },
        { "label": "Adj. adverbial", "detail": "Circunstância do verbo — quando, onde, como", "icon": "CornerDownRight" },
        { "label": "Adj. adnominal", "detail": "Característica de um substantivo", "icon": "Box" },
        { "label": "Complemento nominal", "detail": "Completa nome com prep. — De quê?", "icon": "User" },
        { "label": "Rótulo vizinho", "detail": "Trocar adnominal × adverbial sem pergunta-teste", "icon": "AlertTriangle" }
      ],
      "footer_rule": "Um termo destacado = uma pergunta-teste."
    },
    {
      "type": "golden_rule",
      "content": "PERGUNTA → CARGO (×2)",
      "rows": [
        { "label": "Modifica verbo?", "value": "Adjunto adverbial (circunstância)", "emphasis": "default" },
        { "label": "Modifica nome?", "value": "Adjunto adnominal", "emphasis": "default" },
        { "label": "De quê? + prep.", "value": "Complemento nominal", "emphasis": "highlight" },
        { "label": "Enquanto / quando", "value": "Locução adverbial de tempo", "emphasis": "success" }
      ],
      "footer_rule": "Dois termos = duas células."
    },
    {
      "type": "logic_flow",
      "reveal_mode": "tap",
      "steps": [
        "T1 «No grupo…»: circunstância de «foi» → adj. adverbial deslocado",
        "T2 «Enquanto isso»: tempo → locução adverbial de tempo",
        "A: T1 não é complemento nominal — eliminar",
        "B/D: não confundir adnominal × adverbial — eliminar",
        "C: T1 não é locução conjuntiva — eliminar",
        "Gabarito E — par correto nas duas células",
        "Em similares: matriz — pergunta-teste por termo"
      ]
    },
    {
      "type": "danger_zone",
      "content": "Matriz barra o rótulo trocado",
      "bullet_style": "x_icon",
      "items": [
        { "label": "A", "detail": "CN em «No grupo…»", "correct": "T1 é circunstância — adj. adverbial deslocado" },
        { "label": "B", "detail": "AAdj em «Enquanto isso»", "correct": "T2 é tempo — locução adverbial" },
        { "label": "C", "detail": "Conjunção em T1", "correct": "Circunstância posicional, não conjuntiva" },
        { "label": "D", "detail": "AAdj em T1", "correct": "Não modifica núcleo de «taxa» — circunstância" }
      ],
      "footer_rule": "E sobrou: deslocado + loc. tempo."
    }
  ]
}
```

---

## 8. Anti-padrões

| Proibido | Motivo |
|----------|--------|
| Gabarito nos slides 1–2 | Estudo reverso |
| `correct` repetido entre itens | Gate anti-reciclagem |
| Texto genérico de M05 sem T1/T2 da questão | Anti-reciclagem L2 |
| Hardcode «folhetos» / «Enquanto isso» no React | Conteúdo vem do JSON |
| >7 steps / >5 concept cards | Chunking |

---

## 9. Gate Fase 3b — DoD

- [x] Metáfora única 4/4 (matriz de cargos)
- [x] 4× `layout_variant`: `pt-term-matrix-deck` · `pt-term-matrix-board` · `pt-term-matrix-tap-flow` · `pt-term-trap-arena`
- [x] Erro espacial em 1 frase (rótulo do vizinho sem pergunta-teste)
- [x] Contrato JSON + gatilhos por slot
- [x] Wire gesto inicial → final
- [x] Par concept_map ↔ danger_zone
- [x] Path: `artifacts/l3-brief-lingua-portuguesa-pt_termos_oracao.md`
- [x] Barra TE: tap = colocar no cargo
- [ ] Âncora golden no player (pendente handcraft)
- [ ] React wired (pendente `Implementar molde`)

**GATE Fase 3b (brief):** **PASS** — liberado para handcraft da âncora Q326 / tec `3789304`.

---

## Handoff

| Próximo passo | Trigger |
|---------------|---------|
| Handcraft golden-v1 âncora | `Handcraft: Língua Portuguesa` — Q326 / `pt_termos_oracao` |
| Molde React 4/4 | `Implementar molde: pt_termos_oracao` + `@docs/VARIANT_MOLDS.md` |
| Próximo brief 4/4 | `Brief PT: pt_exceto_incorreta` |

**Proibido neste artefato:** implementar React.

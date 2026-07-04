# BRIEF DE VARIANTES — Vias de Administração / via_vf_absorcao

**Gerado:** 2026-07-03  
**Política:** `molde_redesign` (moldes legados no repo — brief formal antes de escalar handcraft)  
**Família:** `conceito` | `vf` (sub-ramos dentro do mesmo pacote L3)  
**Template:** `emerald` (t02)  
**Âncora primária:** `examples/questao-premium-consulpam-vias-absorcao-oral.json`  
**Âncora secundária (indicação/velocidade):** `examples/questao-premium-vunesp-via-subcutanea.json`  
**Âncora técnica IM (ramo `via_tecnica_admin`):** `examples/questao-premium-cpcon-vias-im-vf.json` — não usar como referência de molde absorção.  
**Cluster:** Absorção / farmacocinética + V/F perfil de vias · 214 slugs inferidos · 91% · `sample_slugs[0]`: `instituto-consulpam-enfermagem-vias-de-administracao-1777178666643-0`

---

## 0. Questão âncora

| Campo | Valor |
|-------|-------|
| Banca / ano | INSTITUTO CONSULPAM — Pref Hidrolândia 2024 |
| Tipo | MCQ conceito — comando **CORRETA** sobre absorção de vias |
| Gabarito | D — absorção VO principalmente no intestino delgado |

**Erro reproduzível (1 frase):** o aluno confunde perfil de absorção entre vias (oral × sublingual × retal × parenteral) ou aceita distractors que invertem velocidade (SC lenta vs IV rápida) ou lista parenteral incompleta.

**Por que bespoke (não `compare` genérico):**

1. O erro é **espacial/sequencial** — posicionar cada via num **trilho de velocidade** (IV → IM → SC → VO) e julgar mecanismo por via.
2. Comparativos de absorção pedem **estações no trilho**, não parágrafo duplo.
3. Padrão em **214 slugs** (91% do subtópico) — ramo dominante.
4. `compare` texto×texto não fixa hierarquia IV>IM>SC nem mapa oral/sublingual/retal.

---

## 1. Metáfora do pacote

**“Trilho de velocidade de absorção → painel de referência por via → juggle V/F ou eliminação MCQ → armadilha de via errada no trilho.”**

Universo visual único: **trilho horizontal emerald** com ícones de seringa/comprimido, chips de velocidade (`IMEDIATA` · `RÁPIDA` · `LENTA` · `VARIÁVEL`), setas TGI→circulação.

---

## 2. Slide 1 — `concept_map`

- **`layout_variant`:** `absorption-speed-rail`
- **Metáfora visual:** trilho de estações — cada estação = uma via (IV, IM, SC, VO, sublingual, retal).
- **Componente:** `AbsorptionSpeedRailConceptMap.tsx`

**Wire (375px):**

```text
  TRILHO DE ABSORÇÃO
  IV ──●── IM ──●── SC ──●── VO ──●── SUB ──●── RET
       │        │        │        │         │
    imediata  rápida   lenta   variável   rápida  parcial
┌────────────────────────────────────────────────────┐
│ [card expandido da estação tocada]                   │
│ VO: início boca/estômago · pico intestino delgado   │
└────────────────────────────────────────────────────┘
```

**Interação:**

| Gesto | Estado inicial | Estado final |
|-------|----------------|--------------|
| Toque na estação | Label + ícone compacto | Expande `detail` da via (`aria-expanded`) |
| Scroll horizontal | Trilho completo visível em ≥640px | Em 375px: scroll snap entre estações |

**Slots (`items[]`):**

| Slot | Papel | Exemplo label | Palavras-gatilho no `detail` |
|------|-------|---------------|--------------------------------|
| 1 | Comando / enquadramento | `Comando da prova` | `CORRETA`, `absorção`, `via` |
| 2 | Via oral | `Via oral (VO)` | `intestino delgado`, `estômago`, `boca` |
| 3 | Via parenteral | `Via parenteral` | `IV`, `IM`, `SC`, `ID` |
| 4 | Via sublingual | `Via sublingual` | `mucosa`, `rápida`, `irritante` |
| 5 | Via retal | `Via retal` | `circulação sistêmica`, `fígado`, `parcial` |
| 6 | Pegadinha típica | `Padrão banca` | `inverte`, `lista incompleta`, `endotraqueal` |

**Ícones Lucide:** `Syringe`, `Pill`, `TrendingUp`, `TrendingDown`, `Layers`, `Target`, `AlertTriangle`

**Par com slide 4:** estações do trilho = eixo de erro nas pegadinhas (via errada, velocidade invertida).

---

## 3. Slide 2 — `golden_rule`

- **`layout_variant`:** `via-reference-board`
- **Metáfora visual:** painel de referência com abas ou lista de vias — cada `row` = via + velocidade + observação de prova.
- **Componente:** `GoldenRuleViaReferenceBoard.tsx`

**Wire:**

```text
  VIAS — VELOCIDADE E ABSORÇÃO
┌──────────────────────────────────────────┐
│ IV      │ Imediata — 100% biodisponível │
│ IM      │ Rápida — músculo vascularizado│
│ SC      │ Lenta/contínua — hipoderme    │
│ VO      │ Variável — delgado = pico     │
│ Subling │ Rápida — evita 1ª passagem    │
│ Retal   │ Parcial — evita parte hepática│
├──────────────────────────────────────────┤
│ Mnemônico: IV>IM>SC · VO=lento TGI      │
└──────────────────────────────────────────┘
```

**Slots (`rows[]`):**

| Slot | `label` | `value` | `badge` |
|------|---------|---------|---------|
| IV | `Intravenosa (IV)` | imediata | `info` |
| IM | `Intramuscular (IM)` | rápida | `ok` |
| SC | `Subcutânea (SC)` | lenta e contínua | `warn` |
| VO | `Oral (VO)` | variável; delgado | `ok` |
| SUB | `Sublingual` | rápida; sem TGI | `ok` |
| RET | `Retal` | parcial sistêmica | `info` |
| extra | `Parenteral clássica` | IV·IM·SC·ID | `hot` |

**`content`:** `VIAS — VELOCIDADE DE ABSORÇÃO` (≤36c)  
**`footer_rule`:** `Decore: IV imediata · IM>SC · VO pico no delgado · sublingual rápida`

**Proibido:** row “Gabarito letra X”.

---

## 4. Slide 3 — `logic_flow`

- **`layout_variant`:** `via-vf-juggle-tap`
- **`reveal_mode`:** `tap` (obrigatório)
- **Metáfora visual:** para V/F I–IV: cartas por afirmativa; para MCQ CORRETA: eliminação por perfil de via.
- **Componente:** `LogicFlowViaVfJuggleTap.tsx`

**Wire (MCQ absorção — âncora Consulpam):**

```text
  [ RACIOCÍNIO ]    ● ○ ○ ○ ○
┌─────────────────────────────────────┐
│ A: lista parenteral — checar rotas │
│         [ Próximo ▶ ]               │
└─────────────────────────────────────┘
        … B sublingual irritante …
        … C retal × fígado …
┌─────────────────────────────────────┐
│ D: VO delgado → CORRETA             │
└─────────────────────────────────────┘
```

**Wire (V/F IM — âncora CPCON):**

```text
  Julgar I: IM×SC absorção → FALSO
  Julgar II: marcos ósseos → VERDADEIRO
  … conjunto II+III → letra E
```

**Interação:**

| Gesto | Efeito |
|-------|--------|
| Toque “Próximo” | Revela passo seguinte |
| Passos `judgement` | Parser `Julgar I/II/III/IV` → chip V/✗ |
| Passos `eliminate` | Risca letra com perfil de via errado |
| Passo `locate` | Aponta gabarito |

**Quantidade de passos:** 5–10 strings.

---

## 5. Slide 4 — `danger_zone`

- **`layout_variant`:** `route-trap`
- **`bullet_style`:** `x_icon`
- **Metáfora visual:** pegadinha no trilho — distrator colocado na estação errada; revelação `correct` reposiciona no trilho certo.
- **Componente:** `DangerZoneRouteTrap.tsx`

**Wire:**

```text
  PEGADINHAS — PERFIL DE VIA
┌─────────────────────────────────────┐
│ [A] ✗  absorção rápida (perfil IV)  │
│      trilho: estação errada → SC    │
├─────────────────────────────────────┤
│ [B] ✓  lenta e contínua             │
│      trilho: SC correta             │
└─────────────────────────────────────┘
```

**Slots (`items[]`):**

| Slot | `label` | Pegadinha (`detail`) | `correct` único |
|------|---------|----------------------|-----------------|
| A | `Letra A` | perfil IV/IM na SC | explica SC lenta |
| B | `Letra B` | (gabarito) | justifica absorção lenta |
| C | `Letra C` | alta viscosidade | quando SC não é indicada |
| tema | `Inverter IM×SC` | IM mais lenta que SC | IM mais vascularizada |
| tema | `Lista parenteral` | endotraqueal na lista | IV·IM·SC·ID clássicas |

**Par com slide 1:** cada pegadinha referencia estação do trilho; `correct` nunca repete texto entre letras.

---

## 6. Contrato de inferência

| Molde | Regex / palavras-gatilho |
|-------|--------------------------|
| `absorption-speed-rail` | `via oral\|intravenos\|intramuscular\|subcut\|sublingual\|retal\|parenteral\|absorção` em `items[].detail` |
| `via-reference-board` | `rows[].label` contém `IV\|IM\|SC\|VO\|Oral\|Sublingual\|Retal`; `value` com `rápida\|lenta\|imediata` |
| `via-vf-juggle-tap` | `steps` com `Julgar I\|Eliminar letra\|Localizar alternativa\|CORRETA` |
| `route-trap` | `items[].label` `Letra [A-E]`; `detail` cita via ou velocidade; `correct` único por letra |

**Wiring:** `BRANCH_DESIGN_MAP` → `via_vf_absorcao` · `pedagogicalBranch.ts` · `themeGenerator` subtópico Vias.

---

## 7. Exemplo JSON mínimo

Trecho derivado da âncora Consulpam (formato plano):

```json
{
  "meta": {
    "subtopico": "Vias de Administração",
    "pedagogical_branch": "via_vf_absorcao",
    "family": "conceito",
    "content_standard": "golden-v1"
  },
  "reverse_study_slides": [
    {
      "type": "concept_map",
      "items": [
        { "label": "Via oral (VO)", "detail": "Absorção inicia boca/estômago; pico no intestino delgado.", "icon": "Pill" },
        { "label": "Via parenteral", "detail": "IV, IM, SC, ID — além do TGI.", "icon": "Syringe" },
        { "label": "Via sublingual", "detail": "Rápida; irritantes não passam pelo TGI.", "icon": "Layers" }
      ],
      "footer_rule": "Posicione cada via no trilho antes de julgar alternativas"
    },
    {
      "type": "golden_rule",
      "content": "VIAS — VELOCIDADE DE ABSORÇÃO",
      "rows": [
        { "label": "Intravenosa (IV)", "value": "Imediata", "badge": "info" },
        { "label": "Intramuscular (IM)", "value": "Rápida", "badge": "ok" },
        { "label": "Subcutânea (SC)", "value": "Lenta e contínua", "badge": "warn" },
        { "label": "Oral (VO)", "value": "Variável; delgado = pico", "badge": "ok" }
      ]
    },
    {
      "type": "logic_flow",
      "reveal_mode": "tap",
      "steps": [
        "Letra A: lista parenteral — endotraqueal não é clássica → eliminar.",
        "Letra B: sublingual para irritantes — inverte mecanismo → eliminar.",
        "Letra C: retal e fígado — confunde parcial com exclusão hepática → eliminar.",
        "Letra D: VO e intestino delgado — mecanismo correto.",
        "Gabarito: D."
      ]
    },
    {
      "type": "danger_zone",
      "bullet_style": "x_icon",
      "content": "PEGADINHAS — ABSORÇÃO POR VIA",
      "items": [
        {
          "label": "Letra A — parenterais",
          "detail": "Inclui endotraqueal na lista padrão.",
          "correct": "Parenteral clássica: IV, IM, SC e ID."
        },
        {
          "label": "Letra B — sublingual",
          "detail": "Diz que sublingual é para irritantes.",
          "correct": "Sublingual evita TGI; irritantes costumam ir por outras vias."
        }
      ]
    }
  ]
}
```

---

## 8. Anti-padrões deste pacote

| Proibido | Motivo |
|----------|--------|
| Gabarito no `concept_map` ou `golden_rule` | Spoiler antes do raciocínio |
| Mesmo `correct` em todas as letras | Gate `detectDuplicateDangerJustifications` |
| Hardcode letra B ou D no React | Contrato route-trap |
| Vocabulário IPCS/CVC sem âncora no enunciado | Gate `detectSlideTopicDrift` |
| Trilho com >7 estações sem scroll | Estoura memória de trabalho |
| Usar pacote de Imunização (PNI) neste ramo | Drift de tema |

---

## 9. Critérios de aceite (DoD)

- [x] 4× `layout_variant` nomeados: `absorption-speed-rail` · `via-reference-board` · `via-vf-juggle-tap` · `route-trap`
- [x] Componentes existem: `AbsorptionSpeedRailConceptMap`, `GoldenRuleViaReferenceBoard`, `LogicFlowViaVfJuggleTap`, `DangerZoneRouteTrap`
- [x] `BRANCH_DESIGN_MAP` → `via_vf_absorcao` com `VIA_VF_MOLD`
- [x] Preview 375px — trilho com scroll snap; board scroll vertical
- [x] 0 hardcode de gabarito nos componentes
- [x] Par trilho (estações) ↔ route-trap (via errada)
- [x] `footer_rule` com estratégia de prova em cada slide

**Status implementação:** moldes **já implementados** — brief formaliza contrato para handcraft dos ~214 slugs P0. `inferViaBranch` prioriza `via_tecnica_admin` quando V/F I–IV traz `punção|ventroglúteo|músculo` (âncora CPCON).

**E2E:** `npm run test:e2e:visual-molds -- --grep="Vias"`

**Próximo trigger:** `Handcraft: Vias de Administração` · lote `vias-de-administracao-g01`.

---

*Referências:* [`docs/PROMPT_VARIANTES_NEUROSLIDES.md`](../docs/PROMPT_VARIANTES_NEUROSLIDES.md) · [`artifacts/vias-de-administracao-topic-cluster-report.json`](./vias-de-administracao-topic-cluster-report.json) · [`data/catalog-migration/vias-golden-anchors.json`](../data/catalog-migration/vias-golden-anchors.json)

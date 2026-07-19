# BRIEF DE VARIANTES — Crase / pt_crase

**Gerado:** 2026-07-17  
**Status implementação:** **pendente** (brief Fase 3b — sem React neste passo)  
**Decisão L3:** `molde_redesign`  
**Bespoke target (pacote):** `pt-crase-funnel`  
**Família:** `conceito` (MCQ — assinale a redação correta)  
**Card vitrine:** `Crase`  
**Template sugerido:** `amber` (norma culta / D — Norma)  
**Guideline:** `lib/guidelines/linguaPortuguesa/crase.ts` (`pt-crase-concursos`)  
**Âncora:** caderno `portugues-caderno-2025-2026-q401-600.pdf` — **questão 506**  
**Fonte interna:** VUNESP — Ag (Pref Itatiba)/Trânsito/2025 · tec id `3583413`  
**Playbook:** `data/catalog-migration/handcraft-playbooks/lingua-portuguesa.json` → `pt_crase`

---

## 0. Questão âncora

| Campo | Valor |
|-------|-------|
| Banca / ano / órgão | VUNESP / 2025 / Pref. Itatiba — Trânsito |
| Tipo | Conceito — “Assinale a alternativa redigida em conformidade com a norma-padrão de emprego do acento indicativo de crase” |
| Gabarito | **C** |

**Enunciado (fiel, sem marca Tec):**

Assinale a alternativa redigida em conformidade com a norma-padrão de emprego do acento indicativo de crase.

- **A)** Os pesquisadores dedicam-se **à estudar** o comportamento dos macacos-pregos.
- **B)** Os estudos abordam **à versatilidade** das ferramentas dos macacos-pregos.
- **C)** Os arqueólogos dirigem-se **à Serra da Capivara** para estudar pinturas rupestres. ✓
- **D)** O uso de ferramentas é um comportamento comum **à todos** os macacos-pregos.
- **E)** As lascas de pedras dos humanos são comparadas **à ferramentas** de outros animais.

**Erro reproduzível (1 frase):** o aluno marca **crase automática** diante de qualquer “a” + palavra feminina (ou “parece culto”), **sem** passar pelo funil masculino → verbo → a+a.

**Por que precisa de moldes bespoke (não só genéricos):**

1. Erro **sequencial** — três testes em ordem fixa; `compare` genérico mostra texto×texto, mas **não** obriga o gesto de filtrar estágio a estágio.
2. Cada letra da âncora falha em **estágio diferente** do funil (verbo / transitivo / a+a ok / pronome / plural) — o molde deve tornar essa coluna espacial.
3. Ramo forte: **45** questões no card Crase (≥5 slugs) — playbook já marca `molde_redesign` / `pt-crase-funnel` (P0).
4. Barra TE: tap = **decisão**; aluno sente “eu filtro sozinho” e quer a próxima.

**Teste espacial 3/3** (rebaixar a `ok_generico` só se **todas** forem sim):

| # | Pergunta | Resposta |
|---|----------|----------|
| 1 | Pegadinha **não** é espacial? | **Não** — é sequencial (funil) |
| 2 | Padrão em <5 questões **e** <10%? | **Não** — 45 no card; ≥5 |
| 3 | `compare` + `correct` já ensina sem UI bespoke? | **Parcial** — ensina o “porquê”, mas não o gesto do funil |

→ **Não** rebaixa. Decisão permanece **`molde_redesign`**.

---

## 1. Metáfora do pacote

> **Funil de 3 testes:** a frase entra no topo; só passa quem sobrevive a (1) masculino? (2) verbo? (3) prep. **a** + artigo **a** feminino? — com chip portátil **ao** no bolso.

Universo visual único nos 4 slides: **funil âmbar** (norma), estágios com ✗/✓, saída inferior = **à / às** ou **sem crase**. Sem misturar arena EXCETO nem trilho de período neste ramo.

---

## 2. Slide 1 — `concept_map`

- **`layout_variant`:** `pt-crase-funnel-deck`
- **Metáfora visual:** baralho/deck de 4–5 cards = terreno da prova (o que é crase + 3 estágios do funil + pegadinha-âncora), **sem** letra de gabarito.
- **Wire espacial (ASCII):**

```text
┌─────────────────────────────────────┐
│  FUNIL — o que a banca testa        │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│  │Crase│ │ T1  │ │ T2  │ │ T3  │   │
│  │a+a  │ │masc.│ │verbo│ │a+a  │   │
│  └─────┘ └─────┘ └─────┘ └─────┘   │
│  ┌─────────────────────────────┐   │
│  │ Pegadinha: crase automática │   │
│  └─────────────────────────────┘   │
│  footer: “Sem funil = chute culto” │
└─────────────────────────────────────┘
```

- **Interação:**
  - **Gesto:** tap em card revela `detail` (1 linha); cards não eliminam alternativas.
  - **Estado inicial:** 5 cards fechados (só `label` + ícone).
  - **Estado final:** todos abertos; funil legível; **zero** “letra C”.
- **Slots (`items[]`):**

| Slot | Papel | Exemplo `label` | Palavras-gatilho no `detail` |
|------|-------|-----------------|------------------------------|
| 1 | Definição | `Crase = a + a` | `fusão`, `preposição`, `artigo`, `à` |
| 2 | Teste 1 | `Masculino?` | `masculino`, `sem crase`, `ao` |
| 3 | Teste 2 | `Verbo?` | `verbo`, `infinitivo`, `estudar`, `só prep.` |
| 4 | Teste 3 | `a + a feminino?` | `artigo`, `feminino`, `Serra`, `à` |
| 5 | Pegadinha | `Crase automática` | `automática`, `parece culto`, `funil` |

- **Ícones Lucide:** `Filter`, `XCircle`, `Ban`, `CheckCircle2`, `AlertTriangle`
- **Mobile 375px:** cards em coluna (stack); máx. 5; `detail` ≤110c.
- **Reduced motion:** todos os `detail` visíveis de uma vez.
- **`footer_rule`:** `Antes de marcar à, rode o funil.`
- **Proibido:** citar A–E; spoiler “Serra da Capivara é o gabarito”.

---

## 3. Slide 2 — `golden_rule`

- **`layout_variant`:** `pt-crase-funnel-board`
- **Metáfora visual:** painel de bolso — 3 linhas do funil + 1 linha do teste **ao** (ênfase `highlight`/`warn`).
- **Wire espacial:**

```text
┌──────────────────────────────────────┐
│  content: FUNIL A → À                │
│  ┌────────┬─────────────────────────┐│
│  │Teste 1 │ masculino → sem crase   ││
│  │Teste 2 │ verbo → sem crase       ││
│  │Teste 3 │ a + a feminino → à / às ││
│  │Portátil│ “ao” cabe? → à no fem.  ││ ← highlight
│  └────────┴─────────────────────────┘│
│  footer: Locução feminina = outra…   │
└──────────────────────────────────────┘
```

- **Interação:**
  - **Gesto:** tap opcional em row para expandir `value` (se truncado); sem revelar gabarito.
  - **Inicial:** mnemônico + 4 rows.
  - **Final:** mesmo (referência estática — “levo isto”).
- **Slots (`rows[]`):**

| `label` | `value` | `emphasis` / `badge` | Gatilhos |
|---------|---------|----------------------|----------|
| Teste 1 | antes de masculino = sem crase | `default` | `masculino`, `sem` |
| Teste 2 | antes de verbo = sem crase | `default` | `verbo`, `infinitivo` |
| Teste 3 | prep. a + artigo a = à / às | `success` | `a + a`, `à`, `às` |
| Teste ao | se “ao” couber no masc. → à no fem. | `highlight` / `badge: ao` | `ao`, `cinema`, `praia` |

- **`content` (≤36c):** `FUNIL: MASC · VERBO · A+A`
- **`footer_rule`:** `“Ao” no masculino → “à” no feminino.`
- **Mobile:** tabela 2 colunas; labels curtos; values wrap 2 linhas máx.
- **Reduced motion:** board completo visível.
- **Proibido:** row “Gabarito letra C”.

---

## 4. Slide 3 — `logic_flow`

- **`layout_variant`:** `pt-crase-funnel-tap-flow`
- **Metáfora visual:** pipeline vertical — cada tap aplica **um** estágio do funil a **uma** letra; último tap fecha gabarito + transferência.
- **`reveal_mode`:** `"tap"`
- **Quantos passos:** **6–7** (chunking ≤7)

**Wire / interação:**

```text
Estado inicial: só step[0] visível
Tap 1 → A: verbo “estudar” → some no T2
Tap 2 → B: “abordar” + à indevido → some (sem a+a)
Tap 3 → D: “todos” → some no T1 / pronome
Tap 4 → E: “à ferramentas” → some (plural / artigo)
Tap 5 → C: dirigir-se a + a Serra → passa T3; “ao” ok
Tap 6 → Gabarito C + “Em similares: funil antes do chute”
```

- **Estado inicial:** passo 1 + chip “Funil ativo”.
- **Estado final:** trilha completa com C destacado em verde; letters A/B/D/E com chip ✗ por estágio.

**Slots (`steps[]` — strings; citam letras):**

| # | Papel | Exemplo de step | Gatilhos |
|---|-------|-----------------|----------|
| 1 | Eliminar A | `A: “à estudar” — verbo no funil T2 → sem crase` | `A:`, `verbo`, `estudar` |
| 2 | Eliminar B | `B: “abordam à…” — sem prep.+artigo → crase automática` | `B:`, `automática` |
| 3 | Eliminar D | `D: “à todos” — pronome/masc. → T1 barra` | `D:`, `todos` |
| 4 | Eliminar E | `E: “à ferramentas” — plural exige às ou a sem artigo` | `E:`, `ferramentas`, `às` |
| 5 | Validar C | `C: “à Serra…” — a + a (nome c/ artigo) → passa T3` | `C:`, `Serra`, `a + a` |
| 6 | Gabarito | `Gabarito C — única que sobrevive ao funil` | `Gabarito`, `letra C` |
| 7 | Transferência | `Em similares: masculino? verbo? a+a? — aí marque à` | `Em similares`, `funil` |

- **Mobile:** um step por vez; botão “Próximo” ≥44px; progresso 1/7…7/7.
- **Reduced motion:** lista completa de steps de uma vez (sem animação de funil).
- **Proibido:** só parafrasear o texto da option sem nomear o estágio do funil.

---

## 5. Slide 4 — `danger_zone`

- **`layout_variant`:** `pt-crase-trap-arena`
- **Metáfora visual:** arena compare — cada card = letra errada (esquerda ✗) × o que o funil exige (direita ✓). Par com slide 1: mesma pegadinha “crase automática”, agora **por letra**.
- **Wire:**

```text
content: “Crase automática — onde o funil barra”
┌─────────────┬──────────────────────────┐
│ A · à+verbo │ T2: antes de verbo = a   │
│ B · à+OD    │ Sem a+a → sem crase      │
│ D · à todos │ Pronome: sem artigo a    │
│ E · à+plur. │ Plural: às ou a (sem art)│
└─────────────┴──────────────────────────┘
```

- **Interação:**
  - **Gesto:** tap no card revela coluna `correct` (compare).
  - **Inicial:** só `label` + `detail` (pegadinha).
  - **Final:** `correct` visível; contraste emocional “quase caí” → “assim acerto”.
- **`bullet_style`:** `"x_icon"`
- **Slots (`items[]`):**

| `label` | `detail` (pegadinha) | `correct` (único) | Gatilhos |
|---------|----------------------|-------------------|----------|
| A | Parece culto: à + infinitivo | Antes de verbo = só prep. **a** (T2) | `estudar`, `verbo` |
| B | à colado em OD feminino | “Abordar” não pede a+a → sem crase | `abordam`, `versatilidade` |
| D | à antes de “todos” | Pronome rejeita artigo **a** → sem crase | `todos` |
| E | à + plural solto | Plural: **às** (c/ artigo) ou **a** (sem) — nunca “à” | `ferramentas`, `às` |

- **`content`:** `Funil barra a crase automática`
- **`footer_rule`:** `C sobrou: a + a Serra (teste ao). Em EXCETO, cada letra tem motivo próprio.`
- **Par concept_map ↔ danger_zone:** card “Crase automática” (slide 1) = título/arena (slide 4); cada letra instancia um estágio T1/T2/T3 falho.
- **Proibido:** mesmo texto em dois `correct`; card genérico “sempre use o funil” em todas as letras.

---

## 6. Contrato de inferência

Palavras-gatilho / regex sugeridos para o React mapear JSON → slots (sem hardcode de gabarito):

| Molde | Gatilhos (case-insensitive) |
|-------|------------------------------|
| `pt-crase-funnel-deck` | `crase`, `fusão`, `masculino`, `verbo`, `a + a`, `automática`, `funil` em `items[].detail` |
| `pt-crase-funnel-board` | `rows` com labels `Teste 1|2|3` ou `ao`; `content` com `FUNIL` |
| `pt-crase-funnel-tap-flow` | `reveal_mode: tap` + `steps` contendo `A:`/`B:`/`C:` + `Gabarito` + `Em similares` |
| `pt-crase-trap-arena` | `danger_zone` + `items[].correct` + gatilhos `verbo`/`todos`/`ferramentas`/`automática` |

**Wiring futuro (não implementar agora):**

- `BRANCH_DESIGN_MAP` → `pt_crase`
- `meta.pedagogical_branch`: `"pt_crase"`
- `meta.subtopico`: `"Crase"`
- Pacote visual: `pt-crase-funnel` (4 variantes acima)
- Handoff: `docs/VARIANT_MOLDS.md` §3 após aprovação deste brief

**Fallback até o React existir:** layouts genéricos premium compatíveis com os mesmos slots — `morphological` · `reference_table` · `tap` · `compare` (handcraft da âncora **não** espera o molde wired).

---

## 7. Exemplo JSON mínimo

Trecho realista que acende todos os slots (handcraft futuro; sem TecConcursos; densidade ≤110c):

```json
{
  "meta": {
    "banca": "VUNESP",
    "ano": "2025",
    "orgao": "Pref. Itatiba",
    "prova": "Tec Enf / Trânsito",
    "cargo_header": "TÉCNICO",
    "topico": "Língua Portuguesa",
    "subtopico": "Crase",
    "pedagogical_branch": "pt_crase",
    "content_standard": "golden-v1",
    "family": "conceito"
  },
  "reverse_study_slides": [
    {
      "type": "concept_map",
      "items": [
        { "label": "Crase = a + a", "detail": "Fusão prep. a + artigo a → à/às", "icon": "Filter" },
        { "label": "Teste 1 — masculino", "detail": "Antes de masculino = sem crase", "icon": "XCircle" },
        { "label": "Teste 2 — verbo", "detail": "Antes de verbo = só a (ex.: estudar)", "icon": "Ban" },
        { "label": "Teste 3 — a + a", "detail": "Prep. a + artigo a feminino = à", "icon": "CheckCircle2" },
        { "label": "Crase automática", "detail": "Marcar à só porque ‘parece culto’", "icon": "AlertTriangle" }
      ],
      "footer_rule": "Antes de marcar à, rode o funil."
    },
    {
      "type": "golden_rule",
      "content": "FUNIL: MASC · VERBO · A+A",
      "rows": [
        { "label": "Teste 1", "value": "masculino → sem crase" },
        { "label": "Teste 2", "value": "verbo → sem crase" },
        { "label": "Teste 3", "value": "a + a feminino → à / às", "emphasis": "success" },
        { "label": "Teste ao", "value": "ao no masc. → à no feminino", "emphasis": "highlight", "badge": "ao" }
      ],
      "footer_rule": "“Ao” no masculino → “à” no feminino."
    },
    {
      "type": "logic_flow",
      "reveal_mode": "tap",
      "steps": [
        "A: “à estudar” — verbo no T2 → sem crase",
        "B: “abordam à…” — sem a+a → crase automática",
        "D: “à todos” — pronome → T1 barra",
        "E: “à ferramentas” — plural: às ou a, nunca à",
        "C: “à Serra…” — a + a (c/ artigo) → passa T3",
        "Gabarito C — única que sobrevive ao funil",
        "Em similares: masculino? verbo? a+a? — aí marque à"
      ]
    },
    {
      "type": "danger_zone",
      "content": "Funil barra a crase automática",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "A",
          "detail": "à + infinitivo parece culto",
          "correct": "Antes de verbo = só prep. a (T2)"
        },
        {
          "label": "B",
          "detail": "à colado em OD feminino",
          "correct": "Abordar não pede a+a → sem crase"
        },
        {
          "label": "D",
          "detail": "à antes de todos",
          "correct": "Pronome rejeita artigo a → sem crase"
        },
        {
          "label": "E",
          "detail": "à + plural solto",
          "correct": "Plural: às (c/ artigo) ou a (sem) — nunca à"
        }
      ],
      "footer_rule": "C sobrou: a + a Serra (teste ao)."
    }
  ]
}
```

---

## 8. Anti-padrões deste pacote

| Proibido | Motivo |
|----------|--------|
| Gabarito / “letra C” no concept_map ou golden_rule | Mata o estudo reverso |
| Mesmo `correct` em A/B/D/E | Gate `detectDuplicateDangerJustifications` |
| Funil só no golden e logic_flow “genérico” | Perde a metáfora 4/4 |
| Misturar `pt-exceto-arena` neste ramo | EXCETO é outro branch; metáfora do eixo pode coexistir só se comando for EXCETO |
| Locução/horas/àquela como único conteúdo da âncora 506 | Fora do núcleo desta prova — usar em outros slugs |
| Hardcode “Serra da Capivara” no componente React | Gabarito no código; conteúdo vem do JSON |
| >7 steps ou >5 cards no concept_map | Estoura memória de trabalho |
| Inventar gabarito divergente do VUNESP C | Prova primeiro |

---

## 9. Critérios de aceite (DoD) — Gate Fase 3b

- [x] Metáfora **única** 4/4 (funil de 3 testes)
- [x] 4× `layout_variant` nomeados: `pt-crase-funnel-deck` · `pt-crase-funnel-board` · `pt-crase-funnel-tap-flow` · `pt-crase-trap-arena`
- [x] Erro espacial em 1 frase (crase automática sem funil)
- [x] Contrato JSON + palavras-gatilho por slot
- [x] Wire: gesto, estado inicial → final (cada slide)
- [x] Par concept_map ↔ danger_zone (automática → arena por letra)
- [x] DoD: 375px legível, 0 hardcode de gabarito no componente, ≤7 slots/tela
- [x] Path: `artifacts/l3-brief-lingua-portuguesa-pt_crase.md`
- [x] Barra TE: tap = decisão; vontade de estudar
- [ ] Rails/slots preenchidos com JSON de exemplo **no player** (após handcraft + wire)
- [ ] Preview 375px no Playwright (após React)
- [ ] `footer_rule` com estratégia de prova (presente no brief; validar no handcraft)

**GATE Fase 3b (brief):** **PASS** — liberado para handcraft da âncora 506 e, sob pedido explícito, `Implementar molde: pt_crase`.

---

## Handoff

| Próximo passo | Trigger |
|---------------|---------|
| Handcraft golden-v1 da âncora | `Handcraft: Língua Portuguesa` — questão 506 / `pt_crase` |
| Molde React 4/4 | `Implementar molde: pt_crase` + `@docs/VARIANT_MOLDS.md` (**não** neste brief) |
| Escala gNN Crase | Só após âncora `[READY]` + este brief aprovado |

**Proibido neste artefato:** implementar React / variantes em `components/slides/`.

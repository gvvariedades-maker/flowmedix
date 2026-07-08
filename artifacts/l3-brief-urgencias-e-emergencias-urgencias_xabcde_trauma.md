# BRIEF DE VARIANTES — Urgências e Emergências / urgencias_xabcde_trauma

**Gerado:** 2026-07-08  
**Política:** `molde_implementado` (4× `layout_variant` bespoke já registrados em `pedagogicalBranch.ts` · `NeuroSlide` · `urgenciasTraumaSlideUtils.ts`)  
**Família:** `protocolo` | `vf` (imobilização I–IV) | MCQ conduta pré-hospitalar  
**Template:** `rose` (t03)  
**Âncoras:** `examples/questao-premium-ameosc-urgencias-trauma-queimadura.json` · `examples/questao-premium-selecon-urgencias-bt16-esmagamento.json` · `examples/questao-premium-ameosc-urgencias-trauma-imobilizacao-vf.json`  
**Cluster:** XABCDE / trauma pré-hospitalar · **22 slugs (6,5%)** · `sample_slugs[0]`: `ameosc-enfermagem-processo-de-enfermagem-1780002934000-5`

---

## 0. Questão âncora

| Campo | Valor |
|-------|-------|
| Banca / ano | AMEOSC 2026 (queimadura MCQ) · SELECON 2023 (BT16) · AMEOSC 2026 (imobilização V/F) |
| Tipo | MCQ conduta · código BT SAMU · V/F I–IV combinatório |
| Gabarito (golden principal) | C — água corrente + sem substância caseira na queimadura extensa |

**Erro reproduzível (1 frase):** o aluno **agrava no pré-hospitalar** — torniquete no pescoço, tração de fratura, retirada de objeto encravado — ou confunde **BT** por tema vizinho (afogamento, queimadura, pneumotórax).

**Por que bespoke (não `compare` / `reference_table` genérico):**

1. Erro **sequencial XABCDE** — hemorragia exsanguinante (X) antes de A–E; banca troca slots por tema (queimadura × fratura × BT).
2. Condutas normativas pedem **trilho XABCDE + painel de referência** com badges hot/warn, não parágrafo.
3. **22 questões** — segundo maior ramo coeso de trauma no subtópico.
4. Layouts genéricos não separam slots de pegadinha (`hemorragia` · `fratura` · `queimadura` · `corpo_estranho` · `imobilizacao`).

---

## 1. Metáfora do pacote

**“Trilho XABCDE rose → painel de referência trauma → tap-flow pré-hospitalar → arena de condutas que pioram.”**

Universo visual único: **letras X→E** com chips coloridos, badges `hot/warn/ok`, ícones `Flame` · `Shield` · `AlertTriangle` · `ListOrdered` · `FileText` (BT SAMU).

---

## 2. Slide 1 — `concept_map`

- **`layout_variant`:** `urgencias-xabcde-rail`
- **Metáfora visual:** trilho vertical XABCDE — cada carta = letra ou núcleo da questão (comando, mecanismo, BT, pegadinha).
- **Componente:** `UrgenciasXabcdeRailConceptMap.tsx`

**Wire (375px):**

```text
┌ X — Hemorragia exsanguinante ────────┐
├ A — Via aérea ─ B — Ventilação ──────┤
├ C — Circulação · D — Neurológico ────┤
├ E — Exposição ───────────────────────┤
│ [Flame] Núcleo: queimadura / BT16    │
│ [AlertTriangle] Três erros clássicos │
└──────────────────────────────────────┘
```

**Interação:**

| Gesto | Estado inicial | Estado final |
|-------|----------------|--------------|
| Toque no elo | `line-clamp-2` no `detail` | Expande (`aria-expanded`) |
| — | Badge letra inferida | X=rose · A–E=gradiente · alerta=amber |

**Slots (`items[]`):**

| Slot | Papel | Exemplo label | Palavras-gatilho no `detail` |
|------|-------|---------------|--------------------------------|
| 1 | Comando | `Comando` | `trauma`, `pré-hospitalar`, `assinale`, `julgue` |
| 2 | XABCDE | `XABCDE` | `exsanguin`, `hemorragia`, `via aérea`, `não piorar` |
| 3 | Núcleo | `Núcleo desta prova` | `queimadura`, `BT16`, `esmagamento`, `imobilização` |
| 4 | Erros | `Três erros clássicos` / `Pegadinha` | `torniquete`, `tração`, `objeto`, `gelo`, `caseir` |
| 5 | Regra | `Regra de ouro` / `Conduta-chave` | `estabilizar`, `transportar`, `rabdomiólise` |

**Ícones Lucide:** `Target`, `ListOrdered`, `Flame`, `AlertTriangle`, `Shield`, `FileText`, `HeartPulse`

**Par com slide 4:** letras X e slots trap (`hemorragia` · `fratura` · `queimadura` · `corpo_estranho`) espelham pegadinhas do danger_zone.

---

## 3. Slide 2 — `golden_rule`

- **`layout_variant`:** `urgencias-trauma-reference-board`
- **Metáfora visual:** painel de referência trauma — cada `row` = conduta normativa com badge ok/hot/warn.
- **Componente:** `GoldenRuleUrgenciasTraumaReferenceBoard.tsx` (wrapper `SoftLensBoard` profile `urgencias`)

**Wire:**

```text
  PRÉ-HOSPITALAR — NÃO PIORAR
┌──────────────────────────────────────────┐
│ Hemorragia membro      [hot] compressão  │
│ Fratura suspeita       [ok]  posição     │
│ Corpo estranho         [warn] estabilizar│
│ Queimadura             [ok]  água corrente│
│ XABCDE                 [info] X antes A–E │
│ BT16 (se aplicável)    [hot] esmagamento │
└──────────────────────────────────────────┘
```

**Interação:** toque na lente → destaca `row`; chips `XABCDE` e códigos `BT##` em monoespaçado.

**Slots (`rows[]`):**

| Slot | `label` | `value` | `badge` |
|------|---------|---------|---------|
| 1 | `Hemorragia membro` | Compressão direta; torniquete no membro se massiva | `hot` |
| 2 | `Fratura suspeita` | Imobilizar na posição encontrada — sem tração | `ok` |
| 3 | `Corpo estranho` | Estabilizar — não retirar no local | `warn` |
| 4 | `Queimadura térmica` | Água corrente · sem pasta, manteiga ou gelo | `ok` |
| 5 | `XABCDE` | X hemorragia exsanguinante antes de A–E | `info` |
| extra | `BT16` | Síndrome do esmagamento — compressão muscular | `hot` |

**`content`:** mnemônico curto `PRÉ-HOSPITALAR — NÃO PIORAR` (≤36 caracteres).

**Proibido:** row isolada “Gabarito letra X” sem contexto normativo.

**`footer_rule`:** `Água sim · caseiro não` ou `Manual · colar · prancha`

---

## 4. Slide 3 — `logic_flow`

- **`layout_variant`:** `urgencias-xabcde-tap-flow`
- **`reveal_mode`:** `tap` (obrigatório)
- **Metáfora visual:** trilho vertical XABCDE — um passo por toque até a letra.
- **Componente:** `LogicFlowUrgenciasXabcdeTapFlow.tsx`

**Wire:**

```text
  [ TRAUMA PRÉ-HOSPITALAR ]
┌─────────────────────────────────────┐
│ 1. Comando + princípio não piorar   │
│         [ Próximo ▶ ]                 │
└─────────────────────────────────────┘
        … eliminar A · B · D …
┌─────────────────────────────────────┐
│ 6. Marcar C (queimadura) / BT16     │
└─────────────────────────────────────┘
```

**Interação:** toque avança passo; elos com borda rose; passo de eliminação com badge warn.

**Passos típicos (`steps[]` strings):**

1. Ancorar comando: trauma inicial na comunidade — qual conduta correta.
2. Eliminar A — torniquete no pescoço → falso (membro, nunca pescoço).
3. Eliminar B — tração de fratura → falso (posição encontrada).
4. Eliminar D — retirar objeto abdominal → falso (estabilizar e transportar).
5. C / BT16 — conduta alinhada ao mecanismo → verdadeira.
6. Marcar gabarito + fixação (“menos é mais no pré-hospitalar”).

**Quantidade:** 5–10 passos.

---

## 5. Slide 4 — `danger_zone`

- **`layout_variant`:** `urgencias-trauma-trap-arena`
- **`bullet_style`:** `x_icon`
- **Metáfora visual:** arena por slot de pegadinha — conduta errada × correção normativa.
- **Componente:** `DangerZoneUrgenciasTraumaTrapArena.tsx`

**Wire:**

```text
  PEGADINHAS — TRAUMA PRÉ-HOSPITALAR
┌─────────────────────────────────────┐
│ [hemorragia] ✗ torniquete pescoço   │
│      → correto: compressão membro   │
├─────────────────────────────────────┤
│ [fratura] ✗ tração fêmur            │
│      → correto: imobilizar posição  │
├─────────────────────────────────────┤
│ [queimadura] ✗ gelo / manteiga      │
│      → correto: água corrente       │
└─────────────────────────────────────┘
```

**Interação:** toque no card → revela coluna `correct`; slot inferido via `inferUrgenciasTraumaTrapSlot`.

**Slots (`items[]`):**

| Slot | `label` | Pegadinha (`detail`) | `correct` único |
|------|---------|----------------------|-----------------|
| 1 | `hemorragia` | Torniquete no pescoço / carótida | Compressão direta ou torniquete no **membro** |
| 2 | `fratura` | Tração vigorosa para alinhar | Imobilizar na posição encontrada |
| 3 | `corpo_estranho` | Retirar objeto encravado no local | Estabilizar e transportar — hospital retira |
| 4 | `queimadura` | Gelo, pasta de dente, manteiga | Água corrente em temperatura ambiente |
| 5 | `imobilizacao` | Prancha antes do colar / capacete sempre sai | Manual → colar → prancha; capacete se VA pérvia |
| extra | BT errado | BT22/BT18/BT8 por tema vizinho | BT16 = esmagamento muscular por soterramento |

**Par com slide 1:** slots trap espelham elos X e núcleo do xabcde-rail.

---

## 6. Contrato de inferência

| Molde | Função / gatilhos |
|-------|-------------------|
| `urgencias-xabcde-rail` | `inferXabcdeLetter(title, detail)`: `x` · `a`–`e` · `alerta` · `geral` |
| `urgencias-trauma-reference-board` | `SoftLensBoard` profile `urgencias`; badges via `badge: hot/warn/ok` |
| `urgencias-xabcde-tap-flow` | Passos string; highlight passo com `eliminar`, `marcar`, `BT` |
| `urgencias-trauma-trap-arena` | `inferUrgenciasTraumaTrapSlot(label, detail, correct)` → `hemorragia` \| `fratura` \| `queimadura` \| `corpo_estranho` \| `imobilizacao` \| `transporte` |

**Wiring:** `BRANCH_DESIGN_MAP` → `urgencias_xabcde_trauma` · `pedagogicalBranch.ts` · `lib/slides/urgenciasTraumaSlideUtils.ts`

---

## 7. Exemplo JSON mínimo

```json
{
  "meta": {
    "subtopico": "Urgências e Emergências",
    "pedagogical_branch": "urgencias_xabcde_trauma",
    "family": "protocolo",
    "content_standard": "golden-v1"
  },
  "reverse_study_slides": [
    {
      "type": "concept_map",
      "items": [
        { "label": "XABCDE", "detail": "X = hemorragia exsanguinante antes de A–E.", "icon": "ListOrdered" },
        { "label": "Núcleo", "detail": "Queimadura: água corrente; proibir substância caseira.", "icon": "Flame" },
        { "label": "Pegadinha", "detail": "Torniquete pescoço · tração fratura · retirar objeto.", "icon": "AlertTriangle" }
      ],
      "footer_rule": "Estabilizar · não agravar · transportar"
    },
    {
      "type": "golden_rule",
      "content": "PRÉ-HOSPITALAR — NÃO PIORAR",
      "rows": [
        { "label": "Hemorragia membro", "value": "Compressão direta; torniquete no membro", "badge": "hot" },
        { "label": "Fratura", "value": "Imobilizar na posição encontrada", "badge": "ok" },
        { "label": "Queimadura", "value": "Água corrente · sem caseiro", "badge": "ok" }
      ]
    },
    {
      "type": "logic_flow",
      "reveal_mode": "tap",
      "steps": [
        "Comando: trauma pré-hospitalar — qual conduta correta.",
        "A torniquete pescoço → falso.",
        "B tração fêmur → falso.",
        "C água corrente + sem caseiro → verdadeira.",
        "Marcar C."
      ]
    },
    {
      "type": "danger_zone",
      "bullet_style": "x_icon",
      "content": "PEGADINHAS — TRAUMA PRÉ-HOSPITALAR",
      "items": [
        {
          "label": "Torniquete no pescoço",
          "detail": "Parece controle radical de sangramento.",
          "correct": "Torniquete no membro — nunca no pescoço."
        },
        {
          "label": "Tração do fêmur",
          "detail": "Alinhamento anatômico seduz.",
          "correct": "Imobilizar como encontrou; sem tração vigorosa."
        }
      ]
    }
  ]
}
```

---

## 8. Anti-padrões

- Hardcodar gabarito “letra C” no componente React.
- Repetir o mesmo `correct` em dois `items` do danger_zone.
- Usar layouts genéricos (`morphological` · `compare`) após rollout do ramo.
- Misturar cadeia RCP adulto (30:2 · DEA) no ramo XABCDE — usar `urgencias_rcp_sbv`.
- Vazar vocabulário IPCS/CME sem ancoragem no enunciado.

---

## 9. DoD (Definition of Done)

- [x] 375px: todos os slots legíveis sem scroll horizontal.
- [x] 0 hardcode de texto de prova específica nos componentes.
- [x] 4× `layout_variant` nomeados e registrados em `themeGenerator` / `BRANCH_DESIGN_MAP`.
- [x] Par conceito-perigo: letras XABCDE slide 1 ↔ slots slide 4.
- [x] `inferUrgenciasTraumaTrapSlot` cobre ≥4 pegadinhas distintas com `correct` únicos.
- [x] `prefers-reduced-motion`: tap-flow revela todos os passos.
- [ ] Golden âncoras 3/3 renderizam 4/4 sem fallback genérico (piloto handcraft g02+).

---

## 10. Handoff

Próximo trigger: **`Handcraft: Urgências e Emergências`** lote `urgencias-g02` (escalar 22 slugs com `pedagogical_branch: urgencias_xabcde_trauma`) · validar com `npm run validate:urgencias-pilot`.

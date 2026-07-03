# BRIEF DE VARIANTES — Imunização / imunizacao_cadeia_frio

**Gerado:** 2026-07-02  
**Política:** `molde_redesign` — pacote bespoke **implementado** (2026-07-02)  
**Família:** `vf` + `conceito` (V/F sala · MCQ faixa térmica · INCORRETA conservação absorvidos no mesmo pacote)  
**Template:** `lime` (t09)  
**Volume:** ~68 slugs · 12% do subtópico (cadeia de frio · conservação · SI-PNI · rede de frios)

**Âncoras duplas (1 pacote, 2 sub-padrões):**

| Sub-padrão | Âncora | Erro reproduzível |
|------------|--------|-------------------|
| **A — V/F sala de vacina** | `examples/questao-premium-ameosc-imunizacao-vf-cadeia-frio.json` | Acredita que **agitar** recupera vacina com cadeia rompida; troca V/F na sequência BCG · cadeia · pentavalente · técnico |
| **B — Faixa 2–8 °C** (temperatura positiva) | `examples/questao-premium-avancasp-imunizacao-rede-frio-temperatura.json` | Marca **0–2 °C**, **8–12 °C** ou **congelamento** em vez do decore **2 °C a 8 °C** |

---

## 0. Questão âncora (piloto A — AMEOSC)

| Campo | Valor |
|-------|-------|
| Banca / ano | AMEOSC 2026 — Pref Mondai |
| Tipo | V/F I–IV + combinação MCQ (sequência de cima para baixo) |
| Gabarito | C — V, F, V, F |
| Slug | `ameosc-enfermagem-processo-de-enfermagem-1780005791580-3` · Q-4611 |

**Erro reproduzível:** aluno marca sequência que trata **agitação** como conduta após quebra da cadeia, ou inverte BCG/pentavalente/papel do técnico.

**Por que bespoke (não `compare` genérico):**

1. Erro **sequencial** — julgar I→II→III→IV antes de combinar letras (paralelo a `imunizacao_vf_intervalos`, mas tema **rede de frio**, não grace period).
2. **68 slugs** no cluster — ramo forte (≥5 · ≥10%).
3. Sub-padrão B exige **trilho termômetro 2·8** — `reference_table` plana não mostra faixa errada vs certa no mesmo eixo.
4. Categoria `rede_frio` já existe em `inferPniCategory` / chips `2–8°C` — falta molde visual dedicado.

**Status componentes:**

| Slide | `layout_variant` | React |
|-------|------------------|-------|
| concept_map | `cold-chain-hub` | ✅ **implementado** |
| golden_rule | `pni-temperature-rail` | ✅ **implementado** |
| logic_flow | `pni-cold-chain-tap` | ✅ **implementado** |
| danger_zone | `temperature-mismatch` | ✅ **implementado** |

**Fallback atual:** `morphological` · `reference_table` · `vertical` · `compare` em `IMUNIZACAO_CADEIA_FRIO_MOLD`.

---

## 1. Metáfora do pacote

**“Hub logístico PNI → trilho termômetro 2·8 → julgar assertivas ou eliminar faixas erradas → zona térmica × conduta certa.”**

Universo visual: **ciano/teal frio** sobre skin lime Imunização; ícones `Thermometer` · `Truck` · `Snowflake`; chips monoespaçados **`2°C` `8°C`**; V/F em emerald/rose como `pni-rules-deck`.

**Sub-padrão A (V/F):** hub com **4 cartas assertivas** (I–IV) + chip V/F inferido.  
**Sub-padrão B (MCQ faixa):** hub com **zonas do termômetro** (congelamento · positiva · ambiente) — trilho dominante no slide 2–4.

**Sub-padrão absorvido (sem 3ª âncora):** INCORRETA conservação (`ameosc-…1613305-7`) → modo `exceto` no `logic_flow` + `danger_zone` semântico (mesma skin).

---

## 2. Slide 1 — `concept_map`

- **`layout_variant`:** `cold-chain-hub`
- **Metáfora visual:** painel central “Rede de Frio PNI” com 3 nós fixos (**Cadeia** = processo · **Rede** = estrutura · **Sala** = aplicação) + cartas contextuais ao redor.
- **Componente proposto:** `ColdChainHubConceptMap.tsx`

**Wire (modo V/F — AMEOSC, 375px):**

```text
        [ CADEIA DE FRIO PNI ]
    Truck ─── Geladeira ─── Syringe
┌──────────────┬──────────────┐
│ I BCG    [V] │ II Cadeia[F] │
│ intradérmica │ agitar ≠ ok  │
├──────────────┼──────────────┤
│ III Penta[V] │ IV Técnico[F]│
│ DTP+Hib+HB   │ não prescreve│
└──────────────┴──────────────┘
  Sequência: julgar antes de combinar
```

**Wire (modo faixa térmica — AVANÇASP):**

```text
  TEMPERATURA POSITIVA — MANUAL REDE DE FRIO
┌─────────────────────────────────────┐
│  ◀ congel. │████ 2 — 8 °C ████│ quente ▶ │
│     ✗      │   zona da prova    │   ✗     │
├─────────────────────────────────────┤
 ◆ Comando — “em geral, entre”
 ◆ Cadeia — processo logístico
 ◆ Pegadinha — limites 0·2 e 8·12
```

**Interação:**

| Gesto | Efeito |
|-------|--------|
| Toque na carta (modo V/F) | Expande `detail`; badge V/F de `inferPniMatrixRowBadge` |
| Toque na zona térmica | Destaca faixa 2–8; escurece distratores |
| Auto | `inferPniCategory` → `rede_frio` acende chip `2–8°C` |

**Slots (`items[]`):**

| Slot | Modo | Exemplo label | Gatilhos no `detail` |
|------|------|---------------|----------------------|
| comando | ambos | `Comando` | `temperatura positiva`, `sequência`, `V/F` |
| núcleo | V/F | `Afirmativa II — cadeia` | `agitar`, `FALSA`, `descartar` |
| núcleo | V/F | `Afirmativa I — BCG` | `intradérmica`, `VERDADEIRA` |
| contraste | V/F | `Papel do técnico` | `prescrever`, `calendário PNI` |
| foco | MCQ | `Faixa da prova` | `2 °C`, `8 °C`, `em geral` |
| meta | MCQ | `Cadeia de frio` | `processo logístico`, `potência` |
| pegadinha | MCQ | `Limites vizinhos` | `piso`, `teto`, `congelamento` |

**Ícones:** `Thermometer`, `Truck`, `Snowflake`, `Syringe`, `Shield`, `UserX`, `Target`, `AlertTriangle`

**Mobile:** grid 1 col &lt;640px; cartas ≥44px; trilho termômetro scroll horizontal se necessário.

**Par com slide 4:** distrator “agitar recupera” (item II) ↔ zona fora de 2–8 no `temperature-mismatch`.

---

## 3. Slide 2 — `golden_rule`

- **`layout_variant`:** `pni-temperature-rail`
- **Metáfora visual:** **trilho horizontal termômetro** com marcadores `0` `2` `8` `12` + `rows[]` normativos empilhados; faixa **2–8** em teal highlight.
- **Componente proposto:** `GoldenRulePniTemperatureRail.tsx`

**Wire:**

```text
  MANUAL DA REDE DE FRIO (PNI)
┌─────────────────────────────────────────┐
│ 0────2══════════8────12  ← trilho °C    │
│      [████ zona positiva ████]          │
├─────────────────────────────────────────┤
│ Positiva (geral)   2 °C a 8 °C    [hot] │
│ Câmara negativa    freezer SCR    [info]│
│ Diluentes          2–8 · 24 h     [info]│
│ Fora da faixa      não aplicar    [warn]│
│ Armazenamento      centro geladeira [ok]│
├─────────────────────────────────────────┤
│ Modo V/F: rows por assertiva I–IV       │
└─────────────────────────────────────────┘
```

**Interação:**

| Gesto | Efeito |
|-------|--------|
| Toque em `row` | Expande `value`; acende segmento no trilho se citar °C |
| Toque no segmento 2–8 | Pulsa faixa; rows com `badge: hot` |
| Modo V/F | Trilho recolhido; rows com badge `V`/`F` por assertiva |

**Slots (`rows[]`):**

| Slot | `label` | `value` | `badge` |
|------|---------|---------|---------|
| hot | `Temperatura positiva` | 2 °C a 8 °C — regra geral | `hot` |
| info | `Câmara negativa` | Freezer — liofilizados específicos | `info` |
| info | `Diluentes` | 2–8 °C · 24 h antes do uso | `info` |
| warn | `Cadeia rompida` | Não aplicar · notificar perda | `warn` |
| ok | `Armazenamento` | Parte central — não porta | `ok` |
| VF I | `BCG` | Intradérmica — braço direito | `ok` |
| VF II | `Cadeia rompida` | Agitar não recupera | `hot` |

**Inferência:** `extractTemperatureSlots(label, value)` → highlight `[2,8]`; `inferPniCategory === 'rede_frio'`.

**`footer_rule`:** `2 a 8 °C = padrão ouro · fora da faixa = perda`

**Proibido:** row “Gabarito letra X” (spoiler L2).

---

## 4. Slide 3 — `logic_flow`

- **`layout_variant`:** `pni-cold-chain-tap`
- **`reveal_mode`:** `tap`
- **Metáfora visual:** pipeline — recuperar regra → julgar assertivas **ou** eliminar faixas/letras → marcar gabarito.
- **Componente proposto:** `LogicFlowPniColdChainTap.tsx`

**Wire (modo V/F — AMEOSC):**

```text
  [ REDE DE FRIO ]     ● ○ ○ ○ ○ ○
┌───────────────────────────────────────┐
│ Comando: sequência V/F I a IV         │
│ I — BCG intradérmica → V                │
│ II — agitar recupera → F                │
│ III — pentavalente → V                  │
│ IV — técnico prescreve → F              │
│ Sequência V,F,V,F → letra C             │
└───────────────────────────────────────┘
```

**Wire (modo MCQ — AVANÇASP):**

```text
│ Comando: temperatura positiva, em geral │
│ Decore: 2 °C a 8 °C                     │
│ A — piso &lt; 2 °C → eliminar             │
│ C — teto &gt; 8 °C → eliminar             │
│ D — congelamento → eliminar             │
│ E — faixa quente → eliminar             │
│ Marcar B                                │
```

**Parser proposto (`parsePniColdChainStep`):**

| `kind` | Gatilho no `step` |
|--------|-------------------|
| `vf_judge` | `I —`, `II —`, `Afirmativa`, `→ V`, `→ F` |
| `vf_combine` | `Sequência`, `V, F, V, F` |
| `temp_anchor` | `Decore`, `2 °C`, `temperatura positiva` |
| `eliminate` | `eliminar`, `piso`, `teto`, `congelamento` |
| `locate` | `Marcar`, `Sobra B`, `letra C` |
| `exceto` | `INCORRETA`, `acima de 10`, `alternativa falsa` |

**Reutilizar:** estrutura de dots/botões de `LogicFlowPniVfJuggleTap` + `LogicFlowPniCalendarEliminationTap`; **não** reutilizar parser de intervalos (`grace`/`4D`).

**Passos:** 6–9 strings (V/F: 7 · MCQ: 7).

---

## 5. Slide 4 — `danger_zone`

- **`layout_variant`:** `temperature-mismatch`
- **`bullet_style`:** `x_icon`
- **Metáfora visual:** card pegadinha com **trilho 0·2·8·12** — zona distratora em rose até toque; teal ao revelar `correct`.
- **Componente proposto:** `DangerZoneTemperatureMismatch.tsx` (par visual de `DangerZoneCalendarMismatch.tsx`)

**Wire (modo MCQ):**

```text
  PEGADINHAS — FAIXA TÉRMICA
┌─────────────────────────────────────┐
│ [A] 0──2──8──12                     │
│     ✗ piso errado (abaixo de 2)     │
│     → piso = 2 °C                   │
├─────────────────────────────────────┤
│ [C] trilho: 8·12 acendem no reveal  │
└─────────────────────────────────────┘
```

**Wire (modo V/F):**

```text
│ [Seq A] erra BCG + cadeia           │
│ (sem rail — só texto compare)       │
│ [Transferência] geladeira/porta     │
```

**Interação:** toque → `compareReveal`; `inferTemperatureSlots(label, detail, correct)` → `trapZone` / `correctZone`.

**Inferência proposta:**

| Distrator | `trapZone` | `correctZone` |
|-----------|------------|---------------|
| piso 0–2 | `[0,2]` | `[2,8]` |
| teto 8–12 | `[8,12]` | `[2,8]` |
| congelamento | `negative` | `positive` |
| agitar recupera | — (sem rail) | conduta texto |

**Modo V/F:** `hasRail: false` quando item é sequência de letras (A/B/D) — só `compare` semântico.

**`items[].correct` únicos** — uma justificativa por letra/tema (âncoras A e B).

---

## 6. Contrato de inferência

| Molde | Função | Gatilhos |
|-------|--------|----------|
| `cold-chain-hub` | `inferPniCategory` + `inferIntervalChips` | `cadeia de frio`, `2–8°C`, `agitar`, `BCG` |
| `pni-temperature-rail` | `highlightTemperatureBand` | `2 °C`, `8 °C`, `emphasis: highlight`, `badge: hot` |
| `pni-cold-chain-tap` | `parsePniColdChainStep` | `I —`, `eliminar`, `Decore`, `Marcar B` |
| `temperature-mismatch` | `inferTemperatureSlots` | `piso`, `teto`, `congelamento`, `agitar` |

**Modo V/F vs MCQ vs EXCETO:**

```typescript
function detectColdChainMode(corpus: string): 'vf' | 'mcq_temp' | 'exceto' {
  if (/\( \)|sequência|V \(verdadeiro\)/i.test(corpus)) return 'vf';
  if (/INCORRETA|EXCETO/i.test(corpus) && /cadeia|conserva|frio/i.test(corpus)) return 'exceto';
  if (/temperatura positiva|entre:|2\s*°c.*8\s*°c/i.test(corpus)) return 'mcq_temp';
  return 'mcq_temp'; // default rede_frio MCQ
}
```

**Wiring alvo:** atualizar `IMUNIZACAO_CADEIA_FRIO_MOLD` em `pedagogicalBranch.ts`:

```typescript
conceptMap: 'cold-chain-hub',
goldenRule: 'pni-temperature-rail',
logicFlow: 'pni-cold-chain-tap',
dangerZone: 'temperature-mismatch',
```

**Affinity:** `MOLD_AFFINITY_RULES` — bloquear pacote em `imunizacao_calendario` e `imunizacao_vf_intervalos`; permitir só `imunizacao_cadeia_frio`.

**Utils:** estender `lib/slides/pniSlideUtils.ts` (`parsePniColdChainStep`, `isPniVfColdChainCorpus`, `extractTemperatureSlots`).

---

## 7. Exemplo JSON mínimo (modo faixa térmica — âncora B)

```json
{
  "meta": {
    "subtopico": "Imunização",
    "pedagogical_branch": "imunizacao_cadeia_frio",
    "family": "conceito",
    "content_standard": "golden-v1"
  },
  "reverse_study_slides": [
    {
      "type": "concept_map",
      "items": [
        { "label": "Comando", "detail": "Temperatura positiva — faixa geral PNI.", "icon": "Target" },
        { "label": "Faixa da prova", "detail": "2 °C a 8 °C — limites fechados.", "icon": "Thermometer" },
        { "label": "Pegadinha", "detail": "Não confundir com congelamento ou faixa quente.", "icon": "AlertTriangle" }
      ],
      "footer_rule": "Positiva = 2 · 8"
    },
    {
      "type": "golden_rule",
      "content": "REDE DE FRIO — PNI",
      "rows": [
        { "label": "Temperatura positiva", "value": "2 °C a 8 °C", "emphasis": "highlight", "badge": "hot" },
        { "label": "Fora da faixa", "value": "Não aplicar — notificar perda", "badge": "warn" }
      ]
    },
    {
      "type": "logic_flow",
      "reveal_mode": "tap",
      "steps": [
        "Comando: temperatura positiva, em geral.",
        "Decore: 2 °C a 8 °C.",
        "Eliminar A (piso baixo), C (teto alto), D (congelamento), E (quente).",
        "Marcar B."
      ]
    },
    {
      "type": "danger_zone",
      "bullet_style": "x_icon",
      "content": "PEGADINHAS — FAIXA",
      "items": [
        {
          "label": "Letra A — limite inferior",
          "detail": "Piso abaixo de 2 °C.",
          "correct": "Cadeia positiva começa em 2 °C."
        },
        {
          "label": "Letra C — limite superior",
          "detail": "Prolonga acima de 8 °C.",
          "correct": "Teto da geladeira PNI = 8 °C."
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
| Usar `pni-interval-matrix` / `pni-vf-juggle-tap` **sem adaptação** | Parser de **intervalos** (grace 4D) ≠ cadeia de frio |
| Usar `vaccine-timeline` / `calendar-mismatch` | É ramo `imunizacao_calendario` |
| Gabarito letra no `concept_map` ou `golden_rule` | Spoiler L2 |
| Hardcode “2 e 8” como únicos números em React | Inferir de `rows`/`steps`; exceções liofilizadas via texto |
| `compare` genérico como destino final | Ramo 12% + erro espacial térmico |
| Mesmo `correct` em todos os `items` | Gate L2 `detectDuplicateDangerJustifications` |
| Trilho termômetro em V/F puro de sequência | UI confunde julgamento assertiva × faixa °C |

---

## 9. Critérios de aceite (DoD)

- [x] `BRANCH_DESIGN_MAP.imunizacao_cadeia_frio` aponta pacote 4/4 bespoke
- [x] `cold-chain-hub` renderiza âncora AMEOSC (4 cartas V/F) e AVANÇASP (foco 2–8)
- [x] `pni-temperature-rail` acende faixa 2–8 na âncora B
- [x] `pni-cold-chain-tap` com parser dual V/F + MCQ
- [x] `temperature-mismatch` acende zona errada em distratores A/C/D/E
- [x] Teste `slidePresentationSubtopicMold` para pacote cadeia_frio
- [x] Piloto player: AMEOSC Q-4611 + AVANÇASP Q-5039 sem fallback genérico — links em [`artifacts/spot-check-imunizacao-cadeia-frio.html`](spot-check-imunizacao-cadeia-frio.html)
- [x] `npm run audit:questao-readiness` [READY] nas duas âncoras (2026-07-02)
- [x] 375px legível; `footer_rule` com estratégia em cada slide (e2e `PNI imunizacao_cadeia_frio — 375px legível` + gate `l2_footer_rule_missing`)

## 10. Comandos operacionais

```bash
npm run pilot:validate-cadeia-frio          # resolveSlidePresentation 4/4 sem fallback
npm run pilot:apply-cadeia-frio -- --apply    # examples/ → Supabase (2 âncoras)
# Piloto visual: artifacts/spot-check-imunizacao-cadeia-frio.html
```

**Status:** brief 4/4 fechado (2026-07-02). Próximo passo = implementar React (VARIANT_MOLDS §3) → handcraft lotes `imunizacao-g02` / `g07+`.

---

## 10. Handoff engenharia

| Ordem | Tarefa | Arquivo(s) |
|-------|--------|------------|
| 1 | Utils inferência | `lib/slides/pniSlideUtils.ts` |
| 2 | Concept | `components/slides/variants/ColdChainHubConceptMap.tsx` |
| 3 | Golden | `components/slides/variants/GoldenRulePniTemperatureRail.tsx` |
| 4 | Logic | `components/slides/variants/LogicFlowPniColdChainTap.tsx` |
| 5 | Danger | `components/slides/variants/DangerZoneTemperatureMismatch.tsx` |
| 6 | Wiring | `pedagogicalBranch.ts`, `moldAffinity.ts`, layout resolvers, `NeuroSlide.tsx` |
| 7 | Testes | `__tests__/lib/pniColdChainSlideUtils.test.ts`, `slidePresentationSubtopicMold.test.ts` |
| 8 | Catálogo | `docs/VARIANT_MOLDS.md` § pacote cadeia_frio |

**Repair sugerido:** `imunizacao-avancasp-rede-frio-repair` (slug B) — espelhar `imunizacao-ameosc-cadeia-frio-repair`.

---

*Referências:* [`docs/PROMPT_VARIANTES_NEUROSLIDES.md`](../docs/PROMPT_VARIANTES_NEUROSLIDES.md) · [`artifacts/l3-brief-imunizacao-imunizacao_calendario.md`](l3-brief-imunizacao-imunizacao_calendario.md) · [`lib/guidelines/pniCalendario.ts`](../lib/guidelines/pniCalendario.ts) (`cadeia-frio-2-8`) · [`data/catalog-migration/imunizacao-golden-anchors.json`](../data/catalog-migration/imunizacao-golden-anchors.json)

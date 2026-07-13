# Pacote Premium — Runbook, checklist e roadmap AVANT

> **Decisão 2026-06-27:** único trilho de produção = **handcraft golden-v1 por slug**. Runbook canônico: [`GOLDEN_HANDCRAFT_MODEL.md`](GOLDEN_HANDCRAFT_MODEL.md) · ADR: [`DECISAO_TRILHO_A_UNICO.md`](DECISAO_TRILHO_A_UNICO.md). Builder/hybrid = **legado** (re-handcraft pendente).

**Fonte principal de *como fechar* um subtópico premium** — estrutura para todas as questões; handcraft por subtópico em rollout.

| Doc | Papel |
|-----|--------|
| [`DECISAO_TRILHO_A_UNICO.md`](DECISAO_TRILHO_A_UNICO.md) | ADR — handcraft único |
| [`GOLDEN_HANDCRAFT_MODEL.md`](GOLDEN_HANDCRAFT_MODEL.md) | **Runbook operacional** handcraft por slug |
| [`HANDCRAFT_CONVERSA.md`](HANDCRAFT_CONVERSA.md) | Prompt `Handcraft: <subtópico>` |
| **Este arquivo** | Checklist histórico, moldes, matriz, legado builder |
| [`PREMIUM_QUESTAO.md`](PREMIUM_QUESTAO.md) | Definição L1/L2/L3 |
| [`GOLDEN_CONTENT_STANDARD.md`](GOLDEN_CONTENT_STANDARD.md) | Gramática golden-v1 + fontes |
| [`data/catalog-migration/handcraft-registry.json`](../data/catalog-migration/handcraft-registry.json) | Progresso por subtópico |

Regra Cursor (índice curto): [`.cursor/rules/avant-premium-pacote.mdc`](../.cursor/rules/avant-premium-pacote.mdc).  
Progresso handcraft: [`handcraft-registry.json`](../data/catalog-migration/handcraft-registry.json).  
Pacote **fechado** de referência: [`perioperatoria-completo/README.md`](../data/catalog-migration/perioperatoria-completo/README.md).

---

## Runbook handcraft (comece aqui)

**Procedimento canônico:** [`GOLDEN_HANDCRAFT_MODEL.md`](GOLDEN_HANDCRAFT_MODEL.md) §3.

### Cartão de bolso — entregas handcraft

| # | Entrega |
|---|---------|
| 1 | Export `*-completo/manifest.json` |
| 2 | Âncoras de estilo em `examples/` (1 por ramo ≥10%) |
| 3 | Handcraft JSON por slug em lotes `g01`…`gNN` |
| 4 | `validate:goldens --lote --strict` 0 falhas |
| 5 | Piloto ≥5% no player + `catalog:apply-lote --apply` |
| 6 | Registry: `status: applied`, `handcraft_applied === total_slugs` |

### Ordem obrigatória (handcraft)

```text
Fase 0   export + registry
   ↓
Fase 1b  cluster de ramos (recomendado)
   ↓
Fase 1   golden âncora por ramo (examples/)
   ↓
Fase 1c  handcraft por slug (lotes de 8)
   ↓
Fase 4   piloto player
   ↓
Fase 5   apply-lote --apply
   ↓
Fase 6   registry + auditoria
```

> **Legado (não usar em produção nova):** runbook builder Fases 2–3 abaixo — mantido para referência de moldes e subtópicos já migrados via `upgradePremium*.ts`.

---

## Runbook legado builder (referência histórica)

### Cartão de bolso — 6 entregas do pacote

| # | Entrega |
|---|---------|
| 1 | Golden em `examples/` validado (`QuestaoCompletaSchema` + revisão clínica) |
| 2 | 4 variantes bespoke + `SUBTOPIC_DESIGN_MAP` + wiring no player |
| 3 | `upgradePremium<Pacote>.ts` + router + testes Jest |
| 4 | Piloto 3–5 slugs ok no player (conteúdo + visual + tap/compare) |
| 5 | Catálogo migrado (lotes + export final com exclude vazio) |
| 6 | `audit-premium-supabase` → **0 erros** no subtópico; matriz atualizada |

### Ordem obrigatória (evita retrabalho)

```text
Fase 0   escopo (subtópico, cor, famílias, goldens planejados)
   ↓
Fase 1   golden de 1 ramo forte (V/F ou MCQ — contrato do molde)
         └── procedimento completo: [`GOLDEN_HANDCRAFT_MODEL.md`](GOLDEN_HANDCRAFT_MODEL.md) §3
   ↓
Fase 1b  mapear ramos no catálogo (cluster report — ver § Qualidade por ramos)
   ↓
Fase 2   moldes 4/4 bespoke (co-design com o golden)
   ↓
Fase 3   builder dedicado (imita gramática do golden)
   ↓
Fase 3b  infra transversal + ciclo por ramo (arena, gate semântico, repair)
   ↓
Fase 4   piloto 3–5 questões
   ↓
Fase 5   lotes de 50 até exclude vazio
   ↓
Fase 6   testes + audit + cluster (drift ≈ 0) + amostra ~5%
```

> **Nota de numeração:** as Fases **0–6** deste runbook cobrem o **pacote inteiro**. Dentro da Fase 2, o pipeline de **um componente** React está em [`VARIANT_MOLDS.md`](VARIANT_MOLDS.md) §3 (fases 0–7 só do molde). Siga a ordem **deste** runbook para rollout.

### Erro comum

**Migrar com hybrid genérico antes dos moldes** — você ganha L1 (estrutura) e talvez L2 parcial, mas o player fica em layout genérico e a auditoria acusa `molde_golden_rule_sem_rows`, `logic_flow_sem_tap`, etc. Só escale lotes **depois** do builder no contrato dos moldes (Fases 2–3).

**Declarar “Completo” só com gate estrutural** — `premiumGate` valida forma (`rows`, `correct`, `tap`), não se o slide ensina **esta** prova. Um subtópico pode ter 100% sem stub e ainda exibir vocabulário de outro tema (ex.: “bundle CVC” numa questão EXCETO). Use o **cluster report** + gate semântico + amostra no player (§ Qualidade por ramos).

### Critério “Completo” na matriz (pós-decisão handcraft)

Marcar subtópico como **Completo** só quando:

1. **100%** slugs handcraft com `meta.content_standard: "golden-v1"`.
2. **100%** passam `validate:goldens --strict`.
3. Registry: `status: applied`, `handcraft_applied === total_slugs`.
4. Amostra humana ≥5% no player aprovada.

> **Legado builder:** subtópicos Imunização/Curativos/Sinais Vitais com `premiumGate` OK **não** contam como fechados até re-handcraft. Ver `legacy_builder_subtopicos` no registry.

### Critério legado builder (referência histórica)

Válido apenas para subtópicos migrados antes de 2026-06-27:

1. **100%** passam `premiumGate` estrutural.
2. **Cluster report:** `drift_total` ≈ 0; ramos ≥10% com golden + perfil no builder.
3. Amostra humana 2–3 slugs por ramo forte.

Subtópicos legado: Imunização, Curativos, Sinais Vitais — **re-handcraft pendente**.

## Qualidade pedagógica por ramos (padrão transversal)

Aplica-se a **todo** subtópico com builder dedicado e moldes bespoke. A família (`classifyFamily`: V/F, MCQ, protocolo…) não basta: dentro de `conceito` podem existir **vários temas** (EXCETO, flebite, tempo, CVC…), cada um exigindo golden + perfil no builder.

### Fase 1b — Mapear ramos (antes de escalar)

**Conversa agente:** `Mapeamento L3: <subtópico>` — [`L3_MAPEAMENTO_CONVERSA.md`](L3_MAPEAMENTO_CONVERSA.md) (cluster + `audit:l3-mold-gap` + tabela de decisão + **Fase 3b brief 4/4**).

**Política 2026-07-02+:** ramos fortes com moldes legados → `molde_redesign` (não `ok_existente`). Cauda longa → `ok_generico` sem brief.

```bash
# Piloto do script (Punção); replicar como cluster-<pacote>-topics.ts
npx tsx scripts/cluster-puncao-topics.ts
# → artifacts/puncao-topic-cluster-report.json
```

| Saída do relatório | Ação |
|--------------------|------|
| `pedagogical_clusters` (tema × volume × %) | Planejar goldens |
| `cluster_decisions` (`novo_ramo` / `absorver` / `cauda_longa` / `coberto`) | Decidir se o recorte merece ramo próprio |
| `decision_counts` | Conferir equilíbrio entre criação, absorção e cauda longa |
| `drift_total` | Slides com vocabulário sem âncora no enunciado |
| `instruction_artifacts_total` | Enunciados com lixo de importação (`2543)`, etc.) |
| `goldens_needed` | Ramos ≥10% (ou ≥5 questões) sem golden |

### Critério objetivo: novo ramo vs absorver

O cluster não deve depender só de feeling. A decisão técnica parte de quatro sinais:

1. **Volume**: `count >= max(5, ceil(total * 0.1))`.
2. **Separabilidade semântica**: o cluster precisa ser específico, com `dominant_builder_topic_share` alto e pouca dispersão entre tópicos.
3. **Drift**: quanto mais o enunciado e os slides divergem, mais o recorte pede âncora própria.
4. **Cobertura existente**: se já existe golden + perfil ancorado, o cluster entra como `coberto`, não como novo ramo.

Leitura prática do relatório:

| `cluster_decisions[].decision` | Interpretação |
|-------------------------------|---------------|
| `novo_ramo` | Vale criar golden + perfil ancorado no builder |
| `absorver` | O recorte é útil, mas deve viver em ramo/bucket já existente |
| `cauda_longa` | Volume insuficiente para manter âncora própria |
| `coberto` | Já existe cobertura pedagógica; manter e só reparar drift |

**Regra de bolso:** **1 golden ≈ 1 ramo pedagógico forte** (não 1 por subtópico inteiro, não 1 por questão). Ramos &lt;10% → cauda longa (`L2-shallow` ou absorver em ramo vizinho).

### Fase 3b — Infra transversal (uma vez por pacote com arena/tap)

Antes de repair em massa, fechar a **plataforma** do pacote:

| Entrega | Onde | Contrato |
|---------|------|----------|
| `formatGabaritoCorrect` | `lib/catalogMigration/slideContract.ts` | `danger_zone.items[].correct` = `Gabarito letra X — {explicação}` |
| Moldes arena/compare | `components/slides/variants/*Arena*.tsx` | **Proibido** hardcode de gabarito (`?? 'B'`), `trapHint` por letra, texto fixo de um golden — ver [`VARIANT_MOLDS.md`](VARIANT_MOLDS.md) § Arena |
| Gate semântico | `lib/catalogMigration/premiumGate.ts` | `slide_topic_drift`, `danger_gabarito_letter_mismatch`, `danger_gabarito_unparseable`, `instruction_import_artifacts` (warn) |

### Ciclo por ramo (repetir até `drift_total` ≈ 0)

Para cada cluster em `goldens_needed` (prioridade: maior volume primeiro):

```text
1. Golden real do ramo (1 questão âncora da prova em examples/)
2. Perfil temático + âncora no upgradePremium<Pacote>.ts
   (inferTopic só retorna o perfil se o enunciado bater na âncora)
3. Testes Jest: fixture do cluster + premiumGateErrors() = 0
4. Repair-lote só desse cluster (+ instruction artifacts se houver)
5. Re-rodar cluster report → próximo ramo
```

**Não** escalar Fase 5 (lotes de 50) com `drift_total` alto conhecido.

### Cartão — antes de marcar “Completo”

```text
□ cluster-<pacote>-topics.ts rodado; relatório em artifacts/
□ ramos ≥10% têm golden + perfil ancorado no builder
□ moldes arena sem hardcode de golden (code review)
□ formatGabaritoCorrect em todos os builders do pacote
□ drift_total < 5% (ou justificado por ramo)
□ instruction_artifacts = 0 (ou repair feito)
□ amostra 2–3 slugs por ramo forte no player (enunciado ↔ slide 4)
□ audit-premium-supabase --warn revisado
```

### Caso de estudo — Punção Venosa

**Histórico cluster (2026-06-22):** [`artifacts/puncao-topic-cluster-report.json`](../artifacts/puncao-topic-cluster-report.json) — drift alto no legado builder; **não** usar `upgradePremiumPuncao.ts` em produção nova.

**Handcraft golden-v1 (2026-07-11):** trilho único via playbook [`puncao-venosa-e-cuidados-com-cateteres.json`](../data/catalog-migration/handcraft-playbooks/puncao-venosa-e-cuidados-com-cateteres.json).

| Métrica | Valor |
|---------|-------|
| Questões no manifest | 110 |
| Handcraft applied | **8/110** (`g01` · `puncao_flebite`) |
| Readiness g01 | 8/8 `[READY]` strict-v2 |
| L6 g01 | anchor-review pass (15/15) |
| Fontes meta | Anvisa (A) + Potter 11ª ed. (B) + COFEN 358 quando cabível |
| `production_status` | `none` |

| Ramo | Qtd cluster | Lote | Status |
|------|-------------|------|--------|
| Flebite e complicações | 19 | g01 | **8 applied** (primeiro lote P0) |
| Dispositivo / calibre | 12 | g02 | pendente |
| EXCETO — técnica | 12 | g03 | pendente |
| Tempo / intervalos | 13 | g04 | pendente |
| Punção periférica / antissepsia | 19 | g05 | pendente |
| IPCS / CVC | 11 | g06 | pendente |
| Genérico | ~24 | g07+ | pendente |

**Ordem de fechamento:** g01 ✅ → g02…g07+ → `audit:subtopico-quality --promote`.

**Âncoras golden:** `questao-premium-avancasp-puncao-infiltracao-flebite.json` (flebite) · `questao-premium-gama-puncao-scalp-jelco-calibre.json` (dispositivo) · `questao-premium-cev-urca-puncao-exceto-med-endovenosa.json` (EXCETO) · `questao-premium-admtec-puncao-venosa-cateteres.json` (IPCS).

---

## Visão em duas camadas

```text
CAMADA 1 — Conteúdo pedagógico (JSON)
  upgradePremium<Pacote>.ts / golden manual
  → items, rows, steps, detail, correct, footer_rule

CAMADA 2 — Apresentação (player)
  SUBTOPIC_DESIGN_MAP + componentes React
  → layout_variant, tema, interação (tap, compare…)
```

**Co-design:** o molde visual define o contrato de dados; o builder ou golden deve entregá-lo.

---

## Contrato de dados por slide

| Slide | Contrato mínimo | Molde Curativos (exemplo) |
|-------|-----------------|---------------------------|
| `concept_map` | `items[]` (`label`, `detail`, `icon`) | `wound-stage-tissue-deck` |
| `golden_rule` | `rows[]` (`label`, `value`) ou `content` | `dressing-match-matrix` |
| `logic_flow` | `steps[]` + `reveal_mode` quando tap | `wound-prep-tap-flow` |
| `danger_zone` | `items[]` (`label`, `detail`, **`correct`**) | `dressing-choice-arena` |

---

## Definition of Done (DoD) mensurável

### Golden pronto

- [ ] Arquivo em `examples/questao-premium-*.json`
- [ ] `QuestaoCompletaSchema.safeParse` → sucesso
- [ ] 4 slides, formato plano, `meta.subtopico` canônico
- [ ] Sem TecConcursos; ícones Lucide válidos
- [ ] Revisão clínica humana
- [ ] Passa em `premium-no-stub` (sem `PREMIUM_STUB_MARKERS`)
- [ ] **GOLDEN v1 (recomendado):** `meta.content_standard: "golden-v1"`, `family`, `sources`, `content_review` — ver [`GOLDEN_CONTENT_STANDARD.md`](GOLDEN_CONTENT_STANDARD.md)

### Molde visual pronto

- [ ] 4/4 `layout_variant` bespoke (não só `morphological` / `center` / `cards` / `list`)
- [ ] Entrada em `SUBTOPIC_DESIGN_MAP` (`themeGenerator.ts`)
- [ ] Wiring em `NeuroSlide.tsx` + listas de layout (`*Layout.ts`)
- [ ] Teste de presença (`slidePresentationSubtopicMold.test.ts` ou equivalente)
- [ ] Preview no player sem fallback genérico

### Builder de conteúdo pronto

- [ ] `lib/catalogMigration/upgradePremium<Pacote>.ts`
- [ ] Integrado em `upgradePremiumHybrid`
- [ ] Ramos V/F e múltipla escolha (quando aplicável)
- [ ] Testes Jest dedicados
- [ ] Lote piloto aplicado; ≥90% `zodValid`
- [ ] **0** marcadores stub nos slides do lote (`hasPremiumStubMarkers`)

---

## Fase 0 — Definição do pacote

Antes de codar:

- [ ] **Subtópico canônico** exato (CLAUDE.md §9) — ex.: `Infecções Sexualmente Transmissíveis (ISTs)`
- [ ] **Template de cor** (t01–t15) — ex.: Curativos `orange` (t11), Imunização `lime` (t09)
- [ ] **Famílias no catálogo** — V/F, certo/errado, múltipla escolha, protocolo… (`classifyFamily` em [`lib/catalogMigration/classifyFamily.ts`](../lib/catalogMigration/classifyFamily.ts); receitas em [`PLAYBOOK_ESTUDO_REVERSO_PREMIUM.md`](PLAYBOOK_ESTUDO_REVERSO_PREMIUM.md))
- [ ] **Golden(s) planejados** — pelo menos um por ramo forte (ex.: um V/F, um MCQ)
- [ ] Referência: pacotes **Completo** na matriz (Curativos, Imunização)

## Fase 1 — Golden (barra de qualidade)

Criar `examples/questao-premium-<banca>-<recorte>.json`:

- [ ] 4 slides em **formato plano**; `meta.subtopico` canônico em **cada** slide
- [ ] Conteúdo específico da prova (L2: zero stub)
- [ ] Slides no formato que os moldes vão exigir (L3: `rows`, `items` com `correct`, `steps` + `reveal_mode: "tap"`)
- [ ] Validar no Laboratório / `QuestaoCompletaSchema`
- [ ] Revisão clínica humana
- [ ] Recomendado: `meta.content_standard: "golden-v1"` + `sources` — [`GOLDEN_CONTENT_STANDARD.md`](GOLDEN_CONTENT_STANDARD.md)

O golden é o **contrato pedagógico** — o builder imita essa gramática em escala.

## Fase 1b — Mapear ramos pedagógicos

- [ ] Rodar `npx tsx scripts/cluster-<pacote>-topics.ts` (copiar de [`cluster-puncao-topics.ts`](../scripts/cluster-puncao-topics.ts))
- [ ] Identificar ramos ≥10% (ou ≥5 questões) sem golden em `goldens_needed`
- [ ] Planejar 1 golden + 1 perfil ancorado por ramo forte
- [ ] Registrar `drift_total` e `instruction_artifacts_total` como baseline

Ver § **Qualidade pedagógica por ramos**.

## Fase 2 — Moldes visuais (4/4 bespoke)

Para cada tipo de slide, um `layout_variant` dedicado (não só `morphological`, `center`, `cards`, `list`). Co-design: molde + contrato de dados juntos.

| Slide | Exemplo Curativos |
|-------|-------------------|
| `concept_map` | `wound-stage-tissue-deck` |
| `golden_rule` | `dressing-match-matrix` |
| `logic_flow` | `wound-prep-tap-flow` |
| `danger_zone` | `dressing-choice-arena` |

- [ ] Componentes em `components/slides/variants/`
- [ ] Entrada em `SUBTOPIC_DESIGN_MAP` ([`themeGenerator.ts`](../components/slides/core/themeGenerator.ts))
- [ ] Wiring em `NeuroSlide.tsx` + listas (`conceptMapLayout.ts`, `goldenRuleLayout.ts`, etc.)
- [ ] Teste de presença em [`__tests__/slidePresentationSubtopicMold.test.ts`](../__tests__/slidePresentationSubtopicMold.test.ts)
- [ ] Preview no player (`/estudar/<slug>`) — confirmar que **não** cai em fallback

Detalhe do pipeline de um molde: [`L3_MAPEAMENTO_CONVERSA.md`](L3_MAPEAMENTO_CONVERSA.md) Fase 3b → [`PROMPT_VARIANTES_NEUROSLIDES.md`](PROMPT_VARIANTES_NEUROSLIDES.md) (brief visual 4/4) → [`VARIANT_MOLDS.md`](VARIANT_MOLDS.md) (engenharia).

## Fase 3 — Builder de conteúdo

Criar [`lib/catalogMigration/upgradePremium<Pacote>.ts`](../lib/catalogMigration/upgradePremiumCurativos.ts) (copiar padrão de Curativos):

```typescript
export function is<Pacote>Subtopico(subtopico: string): boolean { ... }
export function canBuild<Pacote>PremiumSlides(instruction: string, family: ...): boolean { ... }
export function build<Pacote>PremiumSlidesForFamily(input, family): SlideRecord[] { ... }
```

O builder deve:

- [ ] Parsear enunciado (I/II/III, gabarito V/F, alternativas…)
- [ ] Gerar 4 slides no **contrato do molde** (L3)
- [ ] Ter ramos para V/F, MCQ, certo/errado quando existirem no catálogo
- [ ] **Nunca** emitir `PREMIUM_STUB_MARKERS` (`[IA]`, “conceito central”, etc.)

Integração:

- [ ] [`upgradePremiumDedicatedRouter.ts`](../lib/catalogMigration/upgradePremiumDedicatedRouter.ts) — `matchDedicatedPremiumBuilder()` roteia por subtópico
- [ ] [`upgradePremiumHybrid.ts`](../lib/catalogMigration/upgradePremiumHybrid.ts) — fallback genérico **só** para subtópicos sem builder

Testes: `__tests__/lib/catalogMigration/upgradePremium<Pacote>.test.ts` — famílias reais + `premiumGateErrors()` = 0 nos outputs.

## Fase 3b — Infra + ciclo por ramo

**Infra (uma vez):** `formatGabaritoCorrect` · moldes arena sem hardcode · gate semântico em `premiumGate.ts`.

**Por ramo** (repetir até `drift_total` ≈ 0):

- [ ] Golden do ramo em `examples/` + revisão clínica
- [ ] Perfil + âncora em `upgradePremium<Pacote>.ts`
- [ ] Teste com fixture real do cluster
- [ ] `repair-lote` do cluster (+ artifacts de instruction se houver)
- [ ] Re-cluster → próximo ramo

## Fase 4 — Piloto (3–5 questões)

```bash
npm run catalog:export-lote -- --lote=<pacote>-lote-01 --subtopico="<Subtópico>" --limit=5
npm run catalog:upgrade-premium -- --lote=<pacote>-lote-01 --write --force
npm run catalog:apply-lote -- --lote=<pacote>-lote-01 --apply
```

- [ ] Revisar no player: conteúdo + visual + interação (tap, compare)
- [ ] **DoD piloto:** ≥90% `zodValid`, **zero** stub nos slides gerados

`apply-lote` usa `premiumGate: true` por padrão — questões que não passam L3 **não** entram no banco (salvo `--allow-generic`).

## Fase 5 — Migração em escala

- [ ] Lotes de 50 com `--exclude-manifest` (evitar reprocessar piloto e lotes anteriores)
- [ ] Mesmo fluxo: `export-lote` → `upgrade-premium --write --force` → `apply-lote --apply`
- [ ] **Fechamento:** export com exclude de **todos** os lotes → nenhum slug restante no subtópico
- [ ] `lote-meta.json` com builder e contagem

## Fase 6 — Validar e declarar “Completo”

- [ ] `npm test -- premium-no-stub upgradePremium slidePresentationSubtopicMold`
- [ ] `npm run build`
- [ ] `npx tsx scripts/cluster-<pacote>-topics.ts` — `drift_total` ≈ 0; ramos ≥10% cobertos
- [ ] `npx tsx scripts/audit-premium-supabase.ts` — **0 erros** estruturais; revisar `--warn` se gate semântico ativo
- [ ] Amostra humana: ~5% global **+** 2–3 slugs por ramo forte (enunciado ↔ slide 4)
- [ ] Atualizar **matriz** neste arquivo (§ abaixo)
- [ ] Commit quando solicitado

Só marque **Completo** quando estrutural **e** semântico (cluster) estiverem fechados — ver § Critério “Completo”.

---

## Convenções de nomenclatura

| Artefato | Padrão |
|----------|--------|
| Golden | `questao-premium-<banca>-<subtopico>-<recorte>.json` |
| Builder | `lib/catalogMigration/upgradePremium<Pacote>.ts` |
| `layout_variant` | `<tema>-<conceito>-<formato>` (ex.: `wound-stage-tissue-deck`) |
| Lote | `data/catalog-migration/<pacote>-lote-NN/` |
| Cluster report | `artifacts/<pacote>-topic-cluster-report.json` |
| Script cluster | `scripts/cluster-<pacote>-topics.ts` (piloto: [`cluster-puncao-topics.ts`](../scripts/cluster-puncao-topics.ts)) |

---

## Matriz de prontidão (estado do repositório + catálogo)

**Auditoria Supabase** (`modulos_estudo`) — 2026-06-16.

### Resumo do catálogo

| Métrica | Qtd | % |
|---------|:---:|:---:|
| Total de questões | **5.180** | 100% |
| Com 4 NeuroSlides | **5.180** | 100% |
| Premium sem stub (`PREMIUM_STUB_MARKERS`) | **3.047** | **58,8%** |
| Com stub (hybrid genérico / transição) | **2.133** | 41,2% |
| Subtópicos distintos | **41** | — |

> **Stub** = slides com marcadores de hybrid genérico (`[IA]`, `conceito central`, `relacione o tema`, etc.).  
> Critério alinhado a `hasPremiumStubMarkers` / gate em `__tests__/premium-no-stub.test.ts`.

Legenda engenharia: ✅ · 🟡 parcial · ❌ ausente  
Moldes bespoke = variantes com componente React dedicado (não só `morphological`/`center`/`cards`/`list`).

### Por subtópico (produção)

| Subtópico | Total | Sem stub | % premium | Golden | Moldes | Builder | Prioridade |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|-----------|
| **Curativos e Manejo de Feridas** | 201 | 201 | **100%** | ✅ | ✅ 4/4 | ✅ | **Completo** |
| **Imunização** | **577** | **577** | **100%** | ✅ | ✅ 4/4 | ✅ | **Completo** |
| Coleta de Exames Laboratoriais | 244 | 243 | 99,6% | ✅ | ✅ 4/4 | ❌ | Consolidar builder |
| Epidemiologia e Vigilância Epidemiológica | 189 | 185 | 97,9% | ❌ | 🟡 | ❌ | Consolidar |
| Enfermagem em Centro Cirúrgico | 140 | 138 | 98,6% | ❌ | 🟡 | ❌ | Consolidar |
| Noções de Anatomia | 107 | 100 | 93,5% | ✅ | ❌ | ❌ | Moldes + builder |
| Saúde da Mulher | 225 | 199 | 88,4% | ❌ | ❌ | ❌ | Builder |
| Instalação e Manejo de Sondas | 191 | 167 | 87,4% | ✅ | 🟡 2/4 | ❌ | Builder |
| **Punção Venosa e Cuidados com Cateteres** | **110** | **8** | **7%** handcraft | 🟡 g01/7 ramos | ✅ 4/4 flebite | ✅ | **Handcraft g01 applied** — 8/110 |
| Oxigenoterapia e Cuidados Respiratórios | 195 | 158 | 81,0% | ✅ | 🟡 3/4 | ❌ | Builder |
| Cálculo de Administração de Medicamentos e Infusões | 124 | 88 | 71,0% | ✅ | 🟡 3/4 | ❌ | Builder |
| Cuidados na Administração de Medicamentos | 267 | 167 | 62,5% | ✅ | ❌ | ❌ | Builder |
| Infecções Sexualmente Transmissíveis (ISTs) | 215 | 127 | 59,1% | ✅ | ❌ | ❌ | Pacote novo |
| Medidas de Prevenção e Precaução de Contato | 123 | 52 | 42,3% | ❌ | 🟡 | ❌ | Builder |
| Mobilização e Posicionamento do Paciente | 119 | 40 | 33,6% | ❌ | ❌ | ❌ | Builder |
| **Verificação de Sinais Vitais** | **654** | **171** | **26,1%** | ✅ | ✅ 4/4 | ✅ | **Pacote fechado no repo** |
| Urgências e Emergências | 283 | 48 | 17,0% | ✅ | 🟡 2/4 | ❌ | **Alto impacto** |
| Processo de Enfermagem | 34 | 5 | 14,7% | ✅ | 🟡 2/4 | ❌ | Builder SAE |
| **Vias de Administração** | **256** | **15** | **5,9%** | ✅ | 🟡 2/4 | ❌ | **Alto impacto** |
| Atenção Básica / Saúde da Família | 134 | 125 | 93,3% | ✅ | ❌ | ❌ | Consolidar |
| Doenças Virais de Interesse Epidemiológico | 103 | 95 | 92,2% | ❌ | 🟡 | ❌ | — |
| Noções de Fisiologia | 121 | 116 | 95,9% | ❌ | 🟡 | ❌ | — |
| Promoção à Saúde e Prevenção de Agravos | 63 | 55 | 87,3% | ❌ | 🟡 2/4 | ❌ | — |
| Segurança do Paciente | 67 | 53 | 79,1% | ❌ | ❌ | ❌ | — |
| Doenças Parasitárias e Zoonoses | 52 | 49 | 94,2% | ❌ | 🟡 | ❌ | — |
| Saúde da Criança | 45 | 31 | 68,9% | ❌ | ❌ | ❌ | — |
| Infecções no Contexto da Biossegurança | 38 | 35 | 92,1% | ❌ | 🟡 | ❌ | — |
| Procedimentos Diversos | 36 | 31 | 86,1% | ❌ | ❌ | ❌ | — |
| Outras Questões… Crônicas Não Transmissíveis | 36 | 23 | 63,9% | ❌ | ❌ | ❌ | — |
| **Assistência Perioperatória (Inclui SRPA)** | **68** | **68** | **100%** | ✅ 6 âncoras | ✅ handcraft | ✅ | **Handcraft fechado** — [`perioperatoria-completo/README.md`](../data/catalog-migration/perioperatoria-completo/README.md) |
| Enfermagem do Trabalho | 22 | 20 | 90,9% | ❌ | ❌ | ❌ | — |
| Saúde Mental | 21 | 16 | 76,2% | ❌ | ❌ | ❌ | — |
| História da Enfermagem | 20 | 19 | 95,0% | ❌ | 🟡 | ❌ | — |
| Doenças Bacterianas e Fúngicas | 19 | 14 | 73,7% | ❌ | 🟡 | ❌ | — |
| Feridas e Queimaduras | 12 | 9 | 75,0% | ❌ | 🟡 | ❌ | — |
| Saúde do Adolescente | 11 | 11 | 100% | ❌ | ❌ | ❌ | — |
| Processamento de Artigos e Produtos de Saúde | 9 | 5 | 55,6% | ❌ | 🟡 | ❌ | — |
| Farmacodinâmica e Farmacocinética | 6 | 4 | 66,7% | ❌ | ✅ 4/4 | ❌ | Moldes purple (`adme-journey-rail`, `pk-pd-reference-board`, `farmaco-vf-juggle-tap`, `farmaco-trap`) |
| Doenças Respiratórias Crônicas (Asma, DPOC) | 2 | 2 | 100% | ❌ | 🟡 | ❌ | — |
| Outras Doenças… Transmissíveis | 1 | 1 | 100% | ❌ | ❌ | ❌ | — |
| Enfermagem em Central de Material e Esterilização (CME) | 43 | 17 | 39,5% | ❌ | 🟡 | ❌ | — |

> Atualizar esta matriz após cada pacote concluído ou nova auditoria Supabase.  
> **Imunização (2026-06-16):** pacote fechado no repo — moldes PNI 4/4, `upgradePremiumImunizacao.ts`, migração em lote (~577 slugs, 0 stub nos lotes builder); % premium da linha reflete apply concluído (re-auditar Supabase para métricas globais do catálogo).  
> **Sinais Vitais (2026-06-18):** pacote fechado no repo — moldes 4/4, `upgradePremiumSinais.ts`, hybrid integrado, migração builder (lotes 01–08 + parser-fix); `sinais-remaining-slugs.json` vazio; re-auditar Supabase para % global.  
> **Perioperatória (2026-06-23):** **68/68 golden-v1 handcraft** — lotes `perioperatoria-g01`…`g09`, apply concluído; ver [`perioperatoria-completo/README.md`](../data/catalog-migration/perioperatoria-completo/README.md) e [`GOLDEN_HANDCRAFT_MODEL.md`](GOLDEN_HANDCRAFT_MODEL.md).  
> **Punção Venosa (2026-07-11):** **8/110 handcraft** — `g01` (`puncao_flebite`), L6 pass, fontes Anvisa + Potter 11ª ed.; ver [`puncao-venosa-e-cuidados-com-cateteres-completo/README.md`](../data/catalog-migration/puncao-venosa-e-cuidados-com-cateteres-completo/README.md) e [`FONTE_NORMATIVA_AVANT.md`](FONTE_NORMATIVA_AVANT.md) §9.

---

## Roadmap priorizado

Ordem por **impacto** (volume × gap de stub), com dados de produção 2026-06-16.

### Onda 1 — Alto impacto (muitas questões, % premium baixo)

1. ~~**Verificação de Sinais Vitais**~~ — pacote fechado (ver Referência concluída)  
2. **Vias de Administração** — 256 questões, **6%** premium  
3. **Urgências e Emergências** — 283 questões, **17%** premium  

> Somam ~**1.193 questões** com stub predominante — maior retorno de builders dedicados.

### Onda 2 — Quick wins (já >80% premium; falta builder para consolidar)

5. **Punção Venosa** — **g01 applied** (8/110, `puncao_flebite`); próximo g02 dispositivo — ver § Caso Punção  
6. **Coleta de Exames Laboratoriais** — 244 questões, **99,6%** (golden + moldes 4/4)  
7. **Oxigenoterapia** — 195 questões, **81%** (completar 4º molde + builder)  

### Onda 3 — Pacotes com golden, moldes ou conteúdo a refinar

8. **ISTs** — 215 questões, 59% premium — golden `questao-premium-cpcon-ists-risco-transmissao-vf.json`  
9. **Cálculos de Medicamentos** — 124 questões, 71% premium  
10. **Processo de Enfermagem (SAE)** — 34 questões, 15% premium — golden `questao-premium-fepese-anotacao-enfermagem-sae.json`  

### Referência concluída

- **Curativos** — 201/201 (**100%** premium) — `upgradePremiumCurativos.ts` + moldes orange (`wound-stage-tissue-deck`, `dressing-match-matrix`, `wound-prep-tap-flow`, `dressing-choice-arena`)
- **Punção Venosa** — **8/110 handcraft** (`g01` flebite, L6 pass, Anvisa + Potter 11ª ed.) — playbook [`puncao-venosa-e-cuidados-com-cateteres.json`](../data/catalog-migration/handcraft-playbooks/puncao-venosa-e-cuidados-com-cateteres.json); README [`puncao-venosa-e-cuidados-com-cateteres-completo/README.md`](../data/catalog-migration/puncao-venosa-e-cuidados-com-cateteres-completo/README.md); **não** usar `upgradePremiumPuncao.ts` em lotes novos
- **Imunização** — 577/577 (**100%** premium pós-migração) — `upgradePremiumImunizacao.ts` + moldes PNI (`pni-rules-deck`, `pni-interval-matrix`, `pni-vf-juggle-tap`, `pni-trap-chips`); goldens `questao-premium-cpcon-imunizacao-intervalos-vf.json`, `questao-premium-fundatec-meningococica-3meses.json`
- **Sinais Vitais** — ~377 slugs migrados (builder) + exclude híbrido — `upgradePremiumSinais.ts` + moldes rose (`vitals-panel`, `vitals-reference-board`, `vitals-translate-tap`, `vitals-classify-arena`); goldens `questao-premium-fepese-sv-interpretacao-valores.json`, `questao-premium-idecan-fc-radial-ce.json`; spot-check `npx tsx scripts/spot-check-sinais.ts`

---

## Comandos de migração

### Handcraft (produção)

```bash
npm run catalog:export-lote -- --lote=<pacote>-g01 --slugs=slug1,slug2,...
# handcraft em data/catalog-migration/<pacote>-g01/questions/
npm run validate:goldens -- --lote=<pacote>-g01 --strict
npm run catalog:apply-lote -- --lote=<pacote>-g01 --dry-run
npm run catalog:apply-lote -- --lote=<pacote>-g01 --apply
```

Ver [`GOLDEN_HANDCRAFT_MODEL.md`](GOLDEN_HANDCRAFT_MODEL.md) §3 e §7.

### Legado builder (não usar em produção nova)

```bash
npm run catalog:export-lote -- --lote=<pacote>-lote-01 --subtopico="<Subtópico>" --limit=50
npm run catalog:upgrade-premium -- --lote=<pacote>-lote-01 --write --force
npm run catalog:apply-lote -- --lote=<pacote>-lote-01 --apply
```

Deprecado — ver [`DECISAO_TRILHO_A_UNICO.md`](DECISAO_TRILHO_A_UNICO.md).

**Apply:** `premiumGate: true` por padrão ([`premiumGate.ts`](../lib/catalogMigration/premiumGate.ts)). Use `--allow-generic` apenas em exceção documentada.

**Auditoria pós-migração:** `npx tsx scripts/audit-premium-supabase.ts` (produção) · `npx tsx scripts/audit-premium-catalog.ts` (export local).

---

## Gate anti-stub

Marcadores em `PREMIUM_STUB_MARKERS` (`upgradePremiumHybrid.ts`): placeholders `[IA]`, textos genéricos de hybrid, etc.

- Goldens em `examples/questao-premium-*.json` **devem** passar no teste.
- Conteúdo de produção premium **não** deve conter esses marcadores nos slides.
- Hybrid genérico e builder **não** são caminho de produção — re-handcraft obrigatório. Ver [`DECISAO_TRILHO_A_UNICO.md`](DECISAO_TRILHO_A_UNICO.md).

---

## Referências cruzadas

- [`PREMIUM_QUESTAO.md`](PREMIUM_QUESTAO.md) — definição canônica L1/L2/L3 (questão vs pacote)
- [`CLAUDE.md`](../CLAUDE.md) — §8 NeuroSlides, §9 subtópicos
- [`AGENT_AVANT_TEMPLATES_E_LAYOUT.md`](AGENT_AVANT_TEMPLATES_E_LAYOUT.md) — layouts e mapa visual
- [`.cursor/rules/avant-agent-json.mdc`](../.cursor/rules/avant-agent-json.mdc) — JSON de questões
- [`examples/questao-premium-cpcon-curativos-lpp-prevencao-vf.json`](../examples/questao-premium-cpcon-curativos-lpp-prevencao-vf.json) — golden de referência

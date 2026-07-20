# Mapeamento L3 — ramos + auditoria de moldes (uma conversa)

Use em **conversa nova** (Agent mode) para **diagnosticar** um subtópico antes de codar moldes ou escalar handcraft:

```text
Mapeamento L3: Infecções no Contexto da Biossegurança
```

ou anexe este arquivo (`@docs/L3_MAPEAMENTO_CONVERSA.md`) após editar **só** a linha:

```text
SUBTÓPICO: Infecções no Contexto da Biossegurança
```

**Escopo:** 1 subtópico canônico = 1 relatório de decisão L3. **Não** usar para os 41 subtópicos numa única conversa.

**Objetivo:** decidir, por **ramo pedagógico**, o pacote L3 ideal e — para **ramos fortes** — gerar o **brief 4/4** antes de handcraft ou implementação React.

> **Referência rápida (1 página):** [`RAMO_FORTE_QUICK_REF.md`](RAMO_FORTE_QUICK_REF.md) — limiar, árvore de decisão, paths, comandos, checklist.

**Política (2026-07-02+):** moldes legados no repo **não** dispensam redesign. Todo ramo forte (≥5 slugs ou ≥10% do subtópico) passa por **Fase 3b** ([`PROMPT_VARIANTES_NEUROSLIDES.md`](PROMPT_VARIANTES_NEUROSLIDES.md)). **Cauda longa** permanece `ok_generico` com justificativa.

**Posição no pipeline:**

```text
Classify (se drift) → Mapeamento L3 (Fases 0–3b) → VARIANT_MOLDS / Handcraft / Pipeline completo
```

---

## Leitura mínima (agente)

| Prioridade | Arquivo | Quando |
|------------|---------|--------|
| **Obrigatório** | Este doc (`L3_MAPEAMENTO_CONVERSA.md`) | Sempre |
| **Obrigatório** | [`RAMO_FORTE_QUICK_REF.md`](RAMO_FORTE_QUICK_REF.md) | Limiar, paths, checklist |
| **Obrigatório** | [`handcraft-registry.json`](../data/catalog-migration/handcraft-registry.json) | `pacote_prefix`, `cluster_command`, `cluster_report`, taxonomia |
| **Obrigatório** | [`lib/slides/pedagogicalBranch.ts`](../lib/slides/pedagogicalBranch.ts) | Ramos já mapeados (`BRANCH_DESIGN_MAP`) |
| Se ramo forte / `molde_inedito` | [`VARIANT_MOLDS.md`](VARIANT_MOLDS.md) §2 | Teste espacial bespoke vs genérico |
| Se ramo forte / `molde_inedito` | [`PROMPT_VARIANTES_NEUROSLIDES.md`](PROMPT_VARIANTES_NEUROSLIDES.md) §3 | Fase 3b brief 4/4 |
| Se ramo forte / `molde_inedito` | [`L3_BRIEF_TEMPLATE.md`](L3_BRIEF_TEMPLATE.md) | Brief mínimo 1 página (muitos ramos) |
| Se ramo forte / `molde_inedito` | [`artifacts/l3-brief-FLAGSHIP-INDEX.md`](../artifacts/l3-brief-FLAGSHIP-INDEX.md) | Calibração (3 briefs flagship) |
| Se ramo forte / `molde_inedito` | Skill [`.cursor/skills/brief-enfermagem/SKILL.md`](../.cursor/skills/brief-enfermagem/SKILL.md) (TE) ou [`brief-lingua-portuguesa`](../.cursor/skills/brief-lingua-portuguesa/SKILL.md) (PT) | Orquestração Modo **B** |
| Se gap L3 ambíguo | [`MOLD_AFFINITY_RESOLVER.md`](MOLD_AFFINITY_RESOLVER.md) · [`l3MoldGapCatalog.ts`](../lib/slides/l3MoldGapCatalog.ts) | Cruzamento Fase 2 |
| Critérios de volume / drift | [`PACOTE_PREMIUM_CHECKLIST.md`](PACOTE_PREMIUM_CHECKLIST.md) § Qualidade por ramos | Fase 1 |

**Alinhamento brief-enfermagem:** conversa `Mapeamento L3:` = **Modo B obrigatório** por ramo forte (`molde_redesign` / `molde_inedito`). Com **>3 ramos fortes**, usar **INDEX** (`artifacts/l3-brief-<pacote>-INDEX.md`) + um `artifacts/l3-brief-<pacote>-<branch_id>.md` por ramo — ver [Anexo A](#anexo-a--exemplo-preenchido-vias-de-administração).

---

## Variantes do trigger

| Trigger | Quando |
|---------|--------|
| `Mapeamento L3: <subtópico>` | Cluster + auditoria + relatório de decisão |
| `Mapeamento L3: <subtópico>` + `Só auditoria` | Já existe `artifacts/<pacote>-topic-cluster-report.json` — pular cluster |
| `Mapeamento L3: <subtópico>` + `Incluir wire` | Alias de Fase 3b — brief 4/4 completo por ramo forte (sem React) |
| `Mapeamento L3: <subtópico>` + `Só brief: <ramo>` | Fase 3b para **um** ramo (demais fases já feitas) |
| `Mapeamento L3: <subtópico>` + `Implementar molde: <ramo>` | Sair do diagnóstico → seguir [`VARIANT_MOLDS.md`](VARIANT_MOLDS.md) §3 para **um** ramo |

**Pré-requisito de taxonomia:** antes do mapeamento ou do 1º lote handcraft, rodar `audit:subtopico-inventory` + `audit:taxonomy-gate` no subtópico. Se `gate=block`, `Classify: <subtópico>` — [`TAXONOMIA_CONVERSA.md`](TAXONOMIA_CONVERSA.md). Catch-all: [`TAXONOMIA_MODEL.md`](TAXONOMIA_MODEL.md) §6.

---

## Instruções para o agente (executar sem pedir modo)

Resolver pacote em [`handcraft-registry.json`](../data/catalog-migration/handcraft-registry.json) (nome exato `CLAUDE.md` §9).

### Proibido nesta conversa

- `npm run ai:generate` / `catalog:upgrade-premium`
- `catalog:apply-lote --apply` (esta conversa é **diagnóstico**, não produção)
- Implementar componentes React / alterar `NeuroSlide.tsx` **sem** o usuário escrever `Implementar molde: …`
- Handcraft de todos os slugs (isso é `Handcraft:` ou `Pipeline completo:`)
- Declarar “precisa bespoke” sem volume + critério espacial documentados

### Ler antes

| Arquivo | Fase |
|---------|------|
| [`PACOTE_PREMIUM_CHECKLIST.md`](PACOTE_PREMIUM_CHECKLIST.md) § Qualidade por ramos | 1 |
| [`MOLD_AFFINITY_RESOLVER.md`](MOLD_AFFINITY_RESOLVER.md) | 1–2 |
| [`PROMPT_VARIANTES_NEUROSLIDES.md`](PROMPT_VARIANTES_NEUROSLIDES.md) §3 (versão completa) | 3b |
| [`VARIANT_MOLDS.md`](VARIANT_MOLDS.md) §2 (quando bespoke) | 3 |
| [`lib/slides/pedagogicalBranch.ts`](../lib/slides/pedagogicalBranch.ts) | 2 |
| [`lib/slides/l3MoldGapCatalog.ts`](../lib/slides/l3MoldGapCatalog.ts) | 2 |
| Skill `.cursor/skills/avant-json-template/SKILL.md` § L2.5+L3 | 3 |

---

## Fluxo (visão geral)

```text
┌─────────────────────────────────────────────────────────────┐
│ FASE 0 — Escopo e baseline                                   │
│   registry → export/manifest → contagem de slugs               │
└───────────────────────────┬─────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ FASE 1 — Cluster pedagógico (ramos × volume × drift)         │
│   cluster script ou criar cluster-<pacote>-topics.ts         │
│   → artifacts/<pacote>-topic-cluster-report.json             │
└───────────────────────────┬─────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ FASE 2 — Auditoria L3 (gap de moldes)                        │
│   audit:l3-mold-gap --from-supabase --subtopico=…            │
│   → artifacts/l3-mold-gap-audit.json + .md                   │
└───────────────────────────┬─────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ FASE 3 — Síntese e decisão                                    │
│   tabela ramo × decisão × pacote ideal × próximo passo       │
└───────────────────────────┬─────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ FASE 3b — Brief 4/4 por ramo forte (obrigatório)             │
│   PROMPT_VARIANTES_NEUROSLIDES → artifacts/l3-brief-*.md    │
└───────────────────────────┬─────────────────────────────────┘
                            ▼
              (opcional, só se usuário pedir)
┌─────────────────────────────────────────────────────────────┐
│ FASE 4 — Atualizar catálogo de regras                        │
│   l3MoldGapCatalog + BRANCH_DESIGN_MAP + cluster script      │
└─────────────────────────────────────────────────────────────┘
```

---

## Fase 0 — Escopo

```bash
npm run handcraft:brief -- --subtopico="<nome canônico>"
```

1. Confirmar nome **canônico** (`CLAUDE.md` §9).
2. Ler registry: `pacote_prefix`, `total_slugs`, `cluster_report`, scripts existentes.
3. Se não houver manifest recente:

```bash
npm run catalog:export-lote -- --lote=<pacote>-completo --subtopico="<nome exato>" --limit=10000
```

**Checkpoint Fase 0** (reportar):

| Campo | Valor |
|-------|-------|
| Subtópico canônico | … |
| `total_slugs` | … |
| Cluster script existente? | sim/não |
| `BRANCH_DESIGN_MAP` já tem ramos? | sim/não — listar |

### Ramificação — com ou sem cluster script

```text
registry.cluster_command?
│
├─ null + pacote novo (export existe, sem handcraft)
│     → criar scripts/cluster-<pacote>-topics.ts
│     → npm run cluster:<pacote>
│
├─ preenchido (ex.: cluster:vias-de-administracao)
│     → npm run cluster:<pacote>
│     → ler artifacts/<pacote>-topic-cluster-report.json
│
└─ null + status applied + taxonomy.status=closed
      → PULAR Fase 1 (cluster)
      → Fase 2: audit:l3-mold-gap --from-supabase --subtopico="…"
      → Fase 3: síntese manual por meta.pedagogical_branch nos JSONs do manifest
      → Briefs INDEX se >3 ramos (ex.: Saúde do Adolescente)
```

**Exemplos sem cluster:** Saúde do Adolescente (`applied`, `production_ready`, briefs em [`artifacts/l3-brief-saude-adolescente-INDEX.md`](../artifacts/l3-brief-saude-adolescente-INDEX.md)). DTrans mescladas (`applied`, taxonomia `closed` — ramos inferidos do manifest, não do cluster report).

---

## Fase 1 — Cluster pedagógico

**Se existir** `npm run cluster:<pacote>` (ex.: `cluster:perioperatoria`, `cluster:cme`, `cluster:bacterianas`):

```bash
npm run cluster:<pacote>
```

**Se não existir:** criar `scripts/cluster-<pacote>-topics.ts` seguindo padrão de [`scripts/cluster-perioperatoria-topics.ts`](../scripts/cluster-perioperatoria-topics.ts):

- `inferBuilderTopic` / `refinePedagogicalCluster` por enunciado + família
- Limiar canônico: `strongBranchThreshold(total)` em [`lib/catalogMigration/clusterReportContract.ts`](../lib/catalogMigration/clusterReportContract.ts) — `max(5, ceil(total × 0.10))`
- Decisão por volume: `resolveClusterDecision({ hasGolden, count, total })` → `novo_ramo` | `absorver` | `cauda_longa` | `coberto`
- `GOLDEN_BY_CLUSTER` vazio inicialmente (só mapeamento)

### Contrato do cluster report

Ler `artifacts/<pacote>-topic-cluster-report.json`. Scripts legados podem omitir campos — usar fallbacks abaixo.

| Campo | Obrigatório | Fallback quando ausente |
|-------|-------------|-------------------------|
| `generated_at`, `subtopico`, `total` | sim | — (re-rodar cluster) |
| `cluster_decisions[]` | **sim** (canônico) | Derivar de `pedagogical_clusters[]` ou agrupar `rows[]` por `pedagogical_cluster` / `pedagogical_branch` |
| `cluster_decisions[].cluster` | sim | `branch` em relatórios só por ramo (ex.: curativos) |
| `cluster_decisions[].count`, `.pct` | sim | Contar `rows` / slugs do manifest |
| `cluster_decisions[].decision` | sim | Recalcular com `resolveClusterDecision` + `strongBranchThreshold(total)` |
| `cluster_decisions[].sample_slugs` | recomendado | Primeiros slugs do cluster em `rows` |
| `cluster_decisions[].has_golden`, `.golden_file` | recomendado | `false` / `null` se ausente |
| `strong_threshold` | recomendado | `strongBranchThreshold(total)` |
| `drift_total` | recomendado | `rows.filter(r => r.slide_topic_drift).length` ou `rows.filter(r => r.drift).length` |
| `drift_total` (proxy) | se sem drift por slug | `contract_fail_total` (falha de contrato L2 — não é drift semântico puro) |
| `goldens_needed` | recomendado | `cluster_decisions.filter(c => c.decision === 'novo_ramo' && !c.has_golden).length` |
| `goldens_needed` (lista) | opcional | `goldens_needed[]` (array de nomes de cluster) em saúde mental / farmacodinâmica |
| `decision_counts` | opcional | Reduzir `cluster_decisions` por `decision` |
| `instruction_artifacts_total` | opcional | Somar `cluster_decisions[].instruction_artifacts` ou contar `rows` com artefato |
| `pedagogical_clusters` | legado | Alias de `cluster_decisions` — preferir `cluster_decisions` |
| `branch_counts` / `branch_totals` | scripts simplificados | Usar como Fase 1 quando não há `cluster_decisions` (ex.: processamento, curativos) |

**Scripts com schema reduzido** (sem `cluster_decisions` completo): `cluster-processamento-topics.ts`, `cluster-curativos-e-manejo-de-feridas-topics.ts` — tratar `branch` × `count` como cluster; aplicar limiar e decisão manualmente na tabela Fase 1.

**Limiar único (código):** todos os `cluster-*-topics.ts` devem usar [`clusterReportContract.ts`](../lib/catalogMigration/clusterReportContract.ts). Exceção documentada: saúde mental e farmacodinâmica usam score composto (volume + separabilidade) **além** do limiar — não rebaixar `novo_ramo` só por volume se `dominant_share < 0.55`.

**Critério objetivo de ramo** ([`PACOTE_PREMIUM_CHECKLIST.md`](PACOTE_PREMIUM_CHECKLIST.md)):

| Sinal | Regra |
|-------|-------|
| Volume | `count >= max(5, ceil(total * 0.10))` → candidato a ramo forte |
| Separabilidade | Tema coeso, baixa dispersão |
| Drift | Enunciado × slides divergem → precisa âncora própria |
| Cobertura | Golden + perfil existente → `coberto` |

**Checkpoint Fase 1** — tabela obrigatória:

| Cluster | Slugs | % | Decisão cluster | Ramo proposto (`branch_id`) | Golden âncora? |
|---------|-------|---|-----------------|----------------------------|----------------|

---

## Fase 2 — Auditoria L3

```bash
npm run audit:l3-mold-gap -- --from-supabase --subtopico="<trecho ou nome>"
```

**Artefatos:**

| Arquivo | Uso |
|---------|-----|
| `artifacts/l3-mold-gap-audit.json` + `.md` | Última execução (global — pode ser sobrescrita) |
| `artifacts/l3-mold-gap-audit-<pacote_prefix>.json` + `.md` | **Cópia por subtópico** quando `--subtopico` resolve o registry (gate desta conversa) |

Opcional (comparar com lotes locais handcraft):

```bash
npm run audit:l3-mold-gap -- --lote=<pacote>-completo --subtopico="<trecho>"
```

Ler `artifacts/l3-mold-gap-audit.md` e cruzar com Fase 1.

**Decisões L3** (`l3MoldGapCatalog`):

| Decisão | Significado | Ação típica |
|---------|-------------|-------------|
| `ok_generico` | Cauda longa ou erro só textual — `compare` / `reference_table` / `tap` bastam | Handcraft com layouts genéricos |
| `molde_redesign` | Ramo forte com molde legado no repo — **redesign obrigatório** | **Fase 3b** → [`VARIANT_MOLDS.md`](VARIANT_MOLDS.md) → golden âncora |
| `molde_inedito` | Ramo forte sem pacote bespoke adequado | **Fase 3b** → [`VARIANT_MOLDS.md`](VARIANT_MOLDS.md) → golden âncora |
| `ramo_novo` | Falta `pedagogical_branch` no mapa | `BRANCH_DESIGN_MAP` + backfill; se ramo forte → `molde_inedito` |

> **`ok_existente` (legado):** decisão histórica — **não usar em produção nova**. Tratar como `molde_redesign` e passar pela Fase 3b.

**Quem entra na Fase 3b:** todo ramo com `count >= max(5, ceil(total * 0.10))` e decisão `molde_redesign` ou `molde_inedito`.

**Quem fica `ok_generico`:** clusters `cauda_longa` (volume abaixo do limiar) **ou** ramo forte onde o teste espacial falha (ver abaixo).

**Teste espacial** ([`VARIANT_MOLDS.md`](VARIANT_MOLDS.md) §2) — para rebaixar ramo forte a `ok_generico`, documentar as três respostas:

1. A pegadinha **não** é espacial (só texto × texto)?
2. O padrão aparece em **&lt;5 questões** e **&lt;10%** do subtópico?
3. `compare` + `correct` já ensina sem UI bespoke?

Se **todas** forem sim → `ok_generico` (exceção rara; não confundir com cauda longa por volume).

---

## Fase 3 — Síntese (entregável final)

Reportar **neste formato**:

```text
## Mapeamento L3 — <Subtópico>

| Ramo (`pedagogical_branch`) | Slugs | % | Decisão L3 | Pacote atual | Pacote ideal | Bespoke? | Próximo passo |
|-----------------------------|-------|---|------------|--------------|--------------|----------|---------------|

### Ramos fortes — brief 4/4 (Fase 3b)
| Ramo | Decisão | Artefato | 4× `layout_variant` |
|------|---------|----------|------------------------|
| `<branch_id>` | molde_redesign \| molde_inedito | `artifacts/l3-brief-<pacote>-<branch_id>.md` | concept · golden · logic · danger |

### Ficam genéricos — cauda longa (justificativa)
- `<ramo>`: volume … · motivo …

### Ramo novo só metadados (sem React)
- `<ramo>`: registrar em BRANCH_DESIGN_MAP com pacote genérico

### Goldens âncora recomendados (1 por ramo forte)
| Ramo | Slug amostra | Arquivo `examples/` sugerido |
|------|--------------|------------------------------|

### Riscos
- drift_total: …
- slug_mismatch L3: …
- ramos <10% → cauda longa: …

### Ordem sugerida de execução
1. …
2. …
```

**Gates de encerramento** (esta conversa **não** exige handcraft nem vendável):

| Entregável | Esperado |
|------------|----------|
| `artifacts/<pacote>-topic-cluster-report.json` | existe **ou** ramificação “sem cluster” documentada |
| `artifacts/l3-mold-gap-audit-<pacote_prefix>.json` | existe (via `--subtopico=`) |
| `artifacts/l3-mold-gap-audit.json` | última execução global (opcional arquivar) |
| Tabela ramo × decisão | 100% dos clusters ≥5 slugs ou listados como cauda longa |
| Recomendação clara | quantos ramos `molde_redesign` / `molde_inedito` vs `ok_generico` (cauda longa) |
| Briefs 4/4 (Fase 3b) | 1 `artifacts/l3-brief-<pacote>-<branch_id>.md` por ramo forte **ou** INDEX + N briefs se >3 ramos |

---

## Fase 3b — Brief 4/4 por ramo forte (obrigatório)

Para **cada** ramo com decisão `molde_redesign` ou `molde_inedito`:

1. Escolher **questão âncora** — `sample_slugs[0]` do cluster ou golden em `examples/`.
2. Invocar [`PROMPT_VARIANTES_NEUROSLIDES.md`](PROMPT_VARIANTES_NEUROSLIDES.md) (**versão completa**, §3) com:
   - Subtópico canônico
   - Ramo (`pedagogical_branch` / `branch_id`)
   - Família (`vf`, `certo_errado`, `protocolo`, …)
   - Âncora (path `examples/…` ou resumo do enunciado)
   - Orquestração: skill [`.cursor/skills/brief-enfermagem/SKILL.md`](../.cursor/skills/brief-enfermagem/SKILL.md) (TE) ou [`.cursor/skills/brief-lingua-portuguesa/SKILL.md`](../.cursor/skills/brief-lingua-portuguesa/SKILL.md) (Português)
3. Salvar entregável:
   ```text
   artifacts/l3-brief-<pacote_prefix>-<branch_id>.md
   ```
   Com **>3 ramos fortes**, criar também `artifacts/l3-brief-<pacote_prefix>-INDEX.md` (links + decisão resumida por ramo).
4. **GATE Fase 3b** (por ramo):
   - [ ] Metáfora única 4/4 (§1 do brief)
   - [ ] 4× `layout_variant` nomeados (`<tema>-<conceito>-<formato>`)
   - [ ] Contrato JSON + palavras-gatilho (§6–7)
   - [ ] DoD §9 do prompt (375px, 0 hardcode, par conceito-perigo)
5. Só após GATE → `Implementar molde: <ramo>` ([`VARIANT_MOLDS.md`](VARIANT_MOLDS.md) §3) ou `Handcraft:` / `Pipeline completo:`.

**Proibido** escalar handcraft em massa de ramo forte sem `artifacts/l3-brief-*.md` aprovado.

**Cauda longa:** não exige Fase 3b — seguir direto para handcraft com pacote genérico após Fase 3.

---

## Fase 4 — Opcional (só se usuário pedir)

Atualizar código de regras (PR separado ou conversa seguinte):

1. `lib/slides/l3MoldGapCatalog.ts` — padrões + `branch_id` + decisão
2. `lib/slides/pedagogicalBranch.ts` — `BRANCH_DESIGN_MAP`
3. `lib/slides/moldAffinity.ts` — `MOLD_AFFINITY_RULES` se bespoke
4. Re-rodar `npm run audit:l3-mold-gap` e confirmar evolução das decisões

---

## Resumo executivo (copiar no chat)

```text
Mapeamento L3: <Subtópico canônico>

Anexos obrigatórios:
@docs/RAMO_FORTE_QUICK_REF.md
@docs/L3_MAPEAMENTO_CONVERSA.md
@data/catalog-migration/handcraft-registry.json
@.cursor/skills/brief-enfermagem/SKILL.md
@docs/L3_BRIEF_TEMPLATE.md
@artifacts/l3-brief-FLAGSHIP-INDEX.md

(PT: trocar skill por @.cursor/skills/brief-lingua-portuguesa/SKILL.md)

FASE 0 — Escopo:
- handcraft:brief + registry
- export-lote se necessário
- GATE: total_slugs e pacote_prefix confirmados

FASE 1 — Cluster pedagógico:
- npm run cluster:<pacote> OU criar cluster-<pacote>-topics.ts
- GATE: tabela cluster × % × decisão (novo_ramo / absorver / cauda_longa / coberto)

FASE 2 — Auditoria L3:
- npm run audit:l3-mold-gap -- --from-supabase --subtopico="..."
- GATE: artifacts/l3-mold-gap-audit-<pacote_prefix>.json existe
- cruzar com VARIANT_MOLDS §2 (espacial vs texto)

FASE 3 — Relatório de decisão:
- tabela ramo × ok_generico (cauda longa) | molde_redesign | molde_inedito | ramo_novo
- goldens âncora sugeridos (1 por ramo forte)
- ordem de execução recomendada
- ver Anexo A (Vias) como calibração

FASE 3b — Brief 4/4 (obrigatório por ramo forte):
- @docs/PROMPT_VARIANTES_NEUROSLIDES.md versão completa
- Modo B (brief-enfermagem): 1 brief/ramo; INDEX se >3 ramos fortes
- salvar artifacts/l3-brief-<pacote>-<branch_id>.md
- GATE: 4 layout_variant + contrato JSON + DoD §9

FASE 4 (opcional): atualizar l3MoldGapCatalog + BRANCH_DESIGN_MAP

Proibido nesta conversa: apply-lote, handcraft em massa, React sem "Implementar molde: …"
Próximo passo típico: ramo forte com brief → VARIANT_MOLDS; cauda longa → Handcraft: ou Pipeline completo:
```

---

## Referências rápidas

| Depois do mapeamento | Trigger |
|----------------------|---------|
| Criar moldes React | `Implementar molde: <ramo>` + [`PROMPT_VARIANTES_NEUROSLIDES.md`](PROMPT_VARIANTES_NEUROSLIDES.md) (brief) + [`VARIANT_MOLDS.md`](VARIANT_MOLDS.md) |
| Handcraft por slug | `Handcraft: <subtópico>` |
| Handcraft + vendável | `Pipeline completo: <subtópico>` |
| Taxonomia instável | `Classify: <subtópico>` |

| Rule Cursor | `.cursor/rules/l3-mapeamento.mdc` |

---

## Anexo A — Exemplo preenchido: Vias de Administração

Pacote flagship com cluster + 3 ramos L3. Fontes: [`handcraft-registry.json`](../data/catalog-migration/handcraft-registry.json) · [`vias-de-administracao-completo/handcraft-meta.json`](../data/catalog-migration/vias-de-administracao-completo/handcraft-meta.json) · cluster `npm run cluster:vias-de-administracao`.

```text
## Mapeamento L3 — Vias de Administração

| Ramo (`pedagogical_branch`) | Slugs (≈) | % | Decisão L3 | Pacote atual | Pacote ideal | Bespoke? | Próximo passo |
|-----------------------------|-----------|---|------------|--------------|--------------|----------|---------------|
| via_vf_absorcao | ~70+ | ~34% | molde_redesign | absorption-speed-rail (impl.) | idem | sim | Manter; e2e visual-molds |
| via_tecnica_admin | ~60+ | ~29% | ok_generico | morphological / cards | genérico premium | não* | Handcraft; brief P1 se quality exigir |
| via_generico | ~70+ | ~34% | ok_generico | morphological / compare | genérico premium | não | Handcraft cauda técnica |

*Brief existe (`l3-brief-vias-de-administracao-via_tecnica_admin.md`) — molde React genérico até gate de qualidade.

### Ramos fortes — brief 4/4 (Fase 3b)
| Ramo | Decisão | Artefato | 4× layout_variant |
|------|---------|----------|---------------------|
| `via_vf_absorcao` | molde_redesign | `artifacts/l3-brief-vias-de-administracao-via_vf_absorcao.md` | absorption-speed-rail · via-reference-board · via-vf-juggle-tap · route-trap |

### Ficam genéricos — cauda / volume distribuído
- `via_tecnica_admin`, `via_generico`: ≥10% mas teste espacial + pacote genérico suficiente para ship; briefs documentam slots sem React bespoke obrigatório.

### Goldens âncora (1 por ramo)
| Ramo | Slug / arquivo `examples/` |
|------|----------------------------|
| via_vf_absorcao | `examples/questao-premium-consulpam-vias-absorcao-oral.json` |
| via_tecnica_admin | `examples/questao-premium-cpcon-vias-im-vf.json` |
| via_generico | `examples/questao-premium-cetrede-vias-injetaveis-incorreta.json` |

### Riscos
- drift_total: conferir em `artifacts/vias-de-administracao-topic-cluster-report.json`
- branch_backfill: slugs sem `meta.pedagogical_branch` → patch playbook
- 208 slugs: 1 molde bespoke forte (VF absorção); demais ramos em genérico premium

### Ordem sugerida
1. Cluster report → 2. audit:l3-mold-gap --subtopico="Vias" → 3. brief VF absorção → 4. Handcraft g01…gNN por ramo
```

**Saúde do Adolescente (sem cluster):** mesmo formato de Fase 3, ramos de `pedagogicalBranch.ts` + manifest; briefs em [`artifacts/l3-brief-saude-adolescente-INDEX.md`](../artifacts/l3-brief-saude-adolescente-INDEX.md) (6 ramos, 2 bespoke + 4 genéricos).

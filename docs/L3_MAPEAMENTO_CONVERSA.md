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

**Objetivo:** decidir, por **ramo pedagógico**, se o pacote deve ser `ok_generico`, `ok_existente`, `ramo_novo` (só metadados) ou `molde_inedito` (pacote bespoke 4/4).

**Posição no pipeline:**

```text
Classify (se drift) → Mapeamento L3 (esta conversa) → VARIANT_MOLDS / Handcraft / Pipeline completo
```

---

## Variantes do trigger

| Trigger | Quando |
|---------|--------|
| `Mapeamento L3: <subtópico>` | Cluster + auditoria + relatório de decisão |
| `Mapeamento L3: <subtópico>` + `Só auditoria` | Já existe `artifacts/<pacote>-topic-cluster-report.json` — pular cluster |
| `Mapeamento L3: <subtópico>` + `Incluir wire` | Além do relatório, esboçar wire + contrato JSON por ramo `molde_inedito` (sem React) |
| `Mapeamento L3: <subtópico>` + `Implementar molde: <ramo>` | Sair do diagnóstico → seguir [`VARIANT_MOLDS.md`](VARIANT_MOLDS.md) §3 para **um** ramo |

**Pré-requisito de taxonomia:** se o bucket tem drift ou catch-all, rodar antes `Classify: <subtópico>` — [`TAXONOMIA_CONVERSA.md`](TAXONOMIA_CONVERSA.md).

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
│ FASE 3 — Síntese e decisão (entregável da conversa)           │
│   tabela ramo × decisão × pacote ideal × próximo passo       │
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

---

## Fase 1 — Cluster pedagógico

**Se existir** `npm run cluster:<pacote>` (ex.: `cluster:perioperatoria`, `cluster:cme`, `cluster:bacterianas`):

```bash
npm run cluster:<pacote>
```

**Se não existir:** criar `scripts/cluster-<pacote>-topics.ts` seguindo padrão de [`scripts/cluster-perioperatoria-topics.ts`](../scripts/cluster-perioperatoria-topics.ts):

- `inferBuilderTopic` / `refinePedagogicalCluster` por enunciado + família
- Saída: `pedagogical_clusters` (tema × count × %)
- `cluster_decisions`: `novo_ramo` | `absorver` | `cauda_longa` | `coberto`
- `drift_total`, `goldens_needed`
- `GOLDEN_BY_CLUSTER` vazio inicialmente (só mapeamento)

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

Opcional (comparar com lotes locais handcraft):

```bash
npm run audit:l3-mold-gap -- --lote=<pacote>-completo --subtopico="<trecho>"
```

Ler `artifacts/l3-mold-gap-audit.md` e cruzar com Fase 1.

**Decisões L3** (`l3MoldGapCatalog`):

| Decisão | Significado | Ação típica |
|---------|-------------|-------------|
| `ok_generico` | `compare` / `reference_table` / `tap` bastam | Handcraft com layouts genéricos |
| `ok_existente` | Pacote bespoke já no repo | Golden âncora + alinhar JSON ao contrato |
| `ramo_novo` | Falta `pedagogical_branch` no mapa | `BRANCH_DESIGN_MAP` + backfill; pode ser genérico |
| `molde_inedito` | Vale pacote bespoke 4/4 | [`VARIANT_MOLDS.md`](VARIANT_MOLDS.md) antes de escalar |

**Teste espacial** ([`VARIANT_MOLDS.md`](VARIANT_MOLDS.md) §2) — para cada `molde_inedito`, responder:

1. A pegadinha é **espacial** (trilho, matriz, checklist, espectro de letras)?
2. O padrão se repete em **≥5 questões** ou **≥10%** do ramo?
3. `compare` + `correct` já ensina sem UI bespoke?

Se 3 = sim → **rebaixar** para `ok_generico` e documentar no relatório.

---

## Fase 3 — Síntese (entregável final)

Reportar **neste formato**:

```text
## Mapeamento L3 — <Subtópico>

| Ramo (`pedagogical_branch`) | Slugs | % | Decisão L3 | Pacote atual | Pacote ideal | Bespoke? | Próximo passo |
|-----------------------------|-------|---|------------|--------------|--------------|----------|---------------|

### Candidatos a molde inédito (4/4)
- `<ramo>`: wire em 1 frase + slides propostos (concept · golden · logic · danger)

### Ficam genéricos (justificativa)
- `<ramo>`: …

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
| `artifacts/<pacote>-topic-cluster-report.json` | existe |
| `artifacts/l3-mold-gap-audit.json` | existe |
| Tabela ramo × decisão | 100% dos clusters ≥5 slugs ou listados como cauda longa |
| Recomendação clara | quantos pacotes `molde_inedito` vs `ok_generico` |

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

Anexos: @docs/L3_MAPEAMENTO_CONVERSA.md @data/catalog-migration/handcraft-registry.json

FASE 0 — Escopo:
- handcraft:brief + registry
- export-lote se necessário
- GATE: total_slugs e pacote_prefix confirmados

FASE 1 — Cluster pedagógico:
- npm run cluster:<pacote> OU criar cluster-<pacote>-topics.ts
- GATE: tabela cluster × % × decisão (novo_ramo / absorver / cauda_longa / coberto)

FASE 2 — Auditoria L3:
- npm run audit:l3-mold-gap -- --from-supabase --subtopico="..."
- GATE: cruzar com VARIANT_MOLDS §2 (espacial vs texto)

FASE 3 — Relatório de decisão:
- tabela ramo × ok_generico | ok_existente | ramo_novo | molde_inedito
- goldens âncora sugeridos (1 por ramo forte)
- ordem de execução recomendada

FASE 4 (opcional): atualizar l3MoldGapCatalog + BRANCH_DESIGN_MAP

Proibido nesta conversa: apply-lote, handcraft em massa, React sem "Implementar molde: …"
Próximo passo típico: molde_inedito → VARIANT_MOLDS; resto → Handcraft: ou Pipeline completo:
```

---

## Referências rápidas

| Depois do mapeamento | Trigger |
|----------------------|---------|
| Criar moldes React | `Implementar molde: <ramo>` + [`VARIANT_MOLDS.md`](VARIANT_MOLDS.md) |
| Handcraft por slug | `Handcraft: <subtópico>` |
| Handcraft + vendável | `Pipeline completo: <subtópico>` |
| Taxonomia instável | `Classify: <subtópico>` |

| Rule Cursor | `.cursor/rules/l3-mapeamento.mdc` |

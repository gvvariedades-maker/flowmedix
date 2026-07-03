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

**Política (2026-07-02+):** moldes legados no repo **não** dispensam redesign. Todo ramo forte (≥5 slugs ou ≥10% do subtópico) passa por **Fase 3b** ([`PROMPT_VARIANTES_NEUROSLIDES.md`](PROMPT_VARIANTES_NEUROSLIDES.md)). **Cauda longa** permanece `ok_generico` com justificativa.

**Posição no pipeline:**

```text
Classify (se drift) → Mapeamento L3 (Fases 0–3b) → VARIANT_MOLDS / Handcraft / Pipeline completo
```

---

## Variantes do trigger

| Trigger | Quando |
|---------|--------|
| `Mapeamento L3: <subtópico>` | Cluster + auditoria + relatório de decisão |
| `Mapeamento L3: <subtópico>` + `Só auditoria` | Já existe `artifacts/<pacote>-topic-cluster-report.json` — pular cluster |
| `Mapeamento L3: <subtópico>` + `Incluir wire` | Alias de Fase 3b — brief 4/4 completo por ramo forte (sem React) |
| `Mapeamento L3: <subtópico>` + `Só brief: <ramo>` | Fase 3b para **um** ramo (demais fases já feitas) |
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
| `artifacts/<pacote>-topic-cluster-report.json` | existe |
| `artifacts/l3-mold-gap-audit.json` | existe |
| Tabela ramo × decisão | 100% dos clusters ≥5 slugs ou listados como cauda longa |
| Recomendação clara | quantos ramos `molde_redesign` / `molde_inedito` vs `ok_generico` (cauda longa) |
| Briefs 4/4 (Fase 3b) | 1 arquivo `artifacts/l3-brief-<pacote>-<branch_id>.md` por ramo forte, com DoD §9 do prompt |

---

## Fase 3b — Brief 4/4 por ramo forte (obrigatório)

Para **cada** ramo com decisão `molde_redesign` ou `molde_inedito`:

1. Escolher **questão âncora** — `sample_slugs[0]` do cluster ou golden em `examples/`.
2. Invocar [`PROMPT_VARIANTES_NEUROSLIDES.md`](PROMPT_VARIANTES_NEUROSLIDES.md) (**versão completa**, §3) com:
   - Subtópico canônico
   - Ramo (`pedagogical_branch` / `branch_id`)
   - Família (`vf`, `certo_errado`, `protocolo`, …)
   - Âncora (path `examples/…` ou resumo do enunciado)
3. Salvar entregável:
   ```text
   artifacts/l3-brief-<pacote_prefix>-<branch_id>.md
   ```
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
- tabela ramo × ok_generico (cauda longa) | molde_redesign | molde_inedito | ramo_novo
- goldens âncora sugeridos (1 por ramo forte)
- ordem de execução recomendada

FASE 3b — Brief 4/4 (obrigatório por ramo forte):
- @docs/PROMPT_VARIANTES_NEUROSLIDES.md versão completa
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

# NeuroCanvas G0.3A — Autoridade editorial e materialização de decisões

Gate **G0.3A** produz uma **fila editorial** (evidência + workflow). Não resolve blockers, não altera manifests/registry e não trata Supabase live como canônico.

## Princípio

| Camada | Papel | Autoridade |
|--------|-------|------------|
| **manifest.slugs[]** + **handcraft-registry.json** | Canônico editorial | **Sim** — fonte de verdade para qual cópia “pertence” ao pacote |
| **JSON em `data/catalog-migration/*/questions/`** | Conteúdo candidato | Só vira canônico após decisão humana + apply |
| **Supabase `modulos_estudo`** | Produção operacional | **Não** — evidência de “o que está no ar”, nunca decisão editorial |
| **Fila G0.3A** (`artifacts/neurocanvas-editorial-queue.json`, gerada localmente) | Workflow / triagem | **Não** — overlay auditável; não é segundo source of truth silencioso; **não versionada** no Git (~8 MB); reproduzir com `npm run audit:neurocanvas-editorial-queue`; snapshots revisáveis no PR: `neurocanvas-editorial-review-pack.*` + `neurocanvas-editorial-queue.md` |

## Ações permitidas (fase pending)

Cada caso expõe exatamente:

1. **`choose_existing_candidate`** — humano escolhe um path candidato existente.
2. **`official_source_review`** — obrigatório para S3/gabarito; consultar prova/guideline tier A/B.
3. **`reject_all_candidates`** — nenhum candidato serve; exige handcraft novo.
4. **`defer`** — mantém na fila sem mutação.

Nenhuma ação é executada automaticamente nesta fase.

## Como materializar decisões futuras (preferência)

### Opção A — manifests/registry existentes (recomendada)

**Sem novo ledger de autoridade.**

1. Humano registra decisão em PR/commit explícito:
   - remover slug de manifests conflitantes **ou**
   - alinhar conteúdo entre lotes até hashes coincidirem **ou**
   - handcraft + novo lote com manifest único.
2. `npm run catalog:apply-lote -- --apply` publica a cópia escolhida.
3. Reexecutar `audit:neurocanvas-blockers` — slug sai de `unresolved` quando `pickDocumentedWinner` resolve.

**Prós:** zero infra nova; alinha com ADR handcraft único.  
**Contras:** decisões ficam no histórico git (manifests/JSON), não em tabela dedicada.

### Opção B — overlay `editorial-decisions.json` (workflow only)

Arquivo versionado em `data/catalog-migration/editorial-decisions.json`:

```json
{
  "decisions": [
    {
      "case_id": "nc-g03-…",
      "slug": "…",
      "action": "choose_existing_candidate",
      "chosen_path": "data/catalog-migration/…/questions/….json",
      "recorded_by": "human",
      "recorded_at": "ISO-8601",
      "source_refs": ["tier A URL ou prova"]
    }
  ]
}
```

- **Não** altera seleção canônica até manifests refletirem a decisão.
- Scripts de apply **ignoram** este arquivo até gate humano promover para manifest.

**Prós:** rastreio de lote de revisão sem tocar JSON de questão imediatamente.  
**Contras:** risco de drift se overlay não for promovido a manifest.

### Opção C — coluna/tabela Supabase (não recomendada na Fase 0)

Criar tabela `editorial_reconciliation` no projeto.

**Contras:** segundo source of truth; zona vermelha (RLS/migration); live já confunde operacional × editorial.

## Trade-offs resumidos

| Abordagem | Ship G0.3B | Risco drift | Revisão humana |
|-----------|------------|-------------|----------------|
| A manifests | Imediato | Baixo se PR único | PR + apply |
| B overlay JSON | +1 script promote | Médio | PR overlay → depois manifest |
| C Supabase | Migration | Alto | Ops + eng |

**Recomendação:** **Opção A** para decisões finais; **Opção B** opcional como diário de lote se o time quiser marcar `defer`/`in_review` sem commit de conteúdo.

## Lotes humanos sugeridos (pós-baseline G0.4)

Contagens atuais da fila (baseline G0.4 — ver [`NEUROCANVAS_G04_BASELINE.md`](NEUROCANVAS_G04_BASELINE.md)):

| Lote | Lane | ~casos | Critério de fechamento |
|------|------|-------:|------------------------|
| L1 | manifest_conflict | 6 | Manifest único por slug; hashes alinhados no tier |
| L2 | official | 18 | Fonte oficial documentada em `meta.sources` / `content_review` |
| L3 | pedagogical | S2 | NeuroSlides alinhados; `audit:questao-readiness` PASS |
| L4 | metadata | S1 | `meta.subtopico` / `family` / `branch` consistentes |
| L5 | residual | demais | Clusters grandes por `path_signature` |

> Histórico G0.3A: official ≈ 122 · unresolved = 676. A queda para 347/18 reflete o subgate de materialização G0.4 (#55), não o fechamento editorial.

Reexecutar `npm run audit:neurocanvas-editorial-queue` após cada lote para verificar redução de `unresolved` via `audit:neurocanvas-blockers` — **não** via mutação da fila G0.3A.

## Invariantes preservados

- `editorial_status` na fila permanece `pending` até fase posterior explicitamente autorizada.
- `live_status` / `operational_candidate_path` nunca alteram `editorial_status`.
- IDs estáveis: `case_id = nc-g03-{sha256(slug)[0:16]}`; `cluster_id` igual ao de `blockerAnalysis`.

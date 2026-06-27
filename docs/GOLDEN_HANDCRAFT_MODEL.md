# Modelo Golden Handcraft — Runbook único

**Runbook operacional** para elevar o catálogo AVANT (~5.180 questões) ao padrão `golden-v1` com conteúdo **específico por questão** (L2).

> **Decisão de produto (2026-06-27):** único trilho de produção = handcraft por slug. Ver [`DECISAO_TRILHO_A_UNICO.md`](DECISAO_TRILHO_A_UNICO.md).

Complementa:
- [`TAXONOMIA_MODEL.md`](TAXONOMIA_MODEL.md) — **classificar subtópico antes** do handcraft (`Classify:`)
- [`HANDCRAFT_CONVERSA.md`](HANDCRAFT_CONVERSA.md) — prompt de conversa nova (`Handcraft: <subtópico>`)
- [`GOLDEN_CONTENT_STANDARD.md`](GOLDEN_CONTENT_STANDARD.md) — gramática de slots e gates de lint
- [`GOLDEN_ROLLOUT_CATALOGO.md`](GOLDEN_ROLLOUT_CATALOGO.md) — programa catálogo inteiro
- [`.cursor/rules/avant-agent-json.mdc`](../.cursor/rules/avant-agent-json.mdc) — contrato JSON no Laboratório

**Subtópicos fechados (handcraft):**
| Subtópico | Slugs | Status |
|-----------|-------|--------|
| Assistência Perioperatória (Inclui SRPA) | 68 | **Fechado** — [`perioperatoria-completo/README.md`](../data/catalog-migration/perioperatoria-completo/README.md) |
| Doenças Respiratórias Crônicas (Asma, DPOC) | 10 | **Fechado** |
| Saúde do Adolescente | 16 | **Fechado** |
| História da Enfermagem | 18 | **Fechado** |
| Processamento de Artigos e Produtos de Saúde | 18 | **Fechado** |
| Farmacodinâmica e Farmacocinética | 5 | **Fechado** |
| Feridas e Queimaduras | 8 | **Fechado** |
| Enfermagem do Trabalho | 14 | **Fechado** |
| CME | 35 | **Fechado** — [`cme-completo/README.md`](../data/catalog-migration/cme-completo/README.md) |
| Saúde Mental | 37 | **Fechado** — [`saude-mental-completo/README.md`](../data/catalog-migration/saude-mental-completo/README.md) |

Registry: [`data/catalog-migration/handcraft-registry.json`](../data/catalog-migration/handcraft-registry.json).

---

## 1. North star

| Princípio | Regra |
|-----------|--------|
| **Cada card ensina esta prova** | Slides citam letras, termos do enunciado e alternativa correta — nunca texto reciclável entre questões |
| **Âncora por ramo** | 1 golden em `examples/` ≈ 1 **ramo pedagógico** (estilo/referência) — não substitui o JSON por slug |
| **Handcraft por slug** | Todo slug do catálogo recebe JSON próprio em `data/catalog-migration/<lote>/questions/` |
| **Sem hybrid / builder / IA em lote** | Proibido `catalog:upgrade-premium`, `ai:generate` como produção |
| **Validar antes do DB** | `npm run validate:goldens --strict` + amostra no player ≥5% antes de `catalog:apply-lote --apply` |

**Escala:** subtópicos grandes (Sinais Vitais ~654, Imunização ~577…) fecham em **múltiplos lotes** `g01`…`gNN` (8 slugs/lote), não via builder.

---

## 2. Pipeline único

```text
                    ┌─────────────────────────────────────┐
                    │  Fase 0: export + cluster (1b)      │
                    └─────────────────┬───────────────────┘
                                      │
                    ┌─────────────────▼───────────────────┐
                    │  Âncoras de estilo (1 por ramo)     │
                    │  examples/questao-premium-*.json    │
                    └─────────────────┬───────────────────┘
                                      │
                    ┌─────────────────▼───────────────────┐
                    │  Handcraft golden-v1 por slug       │
                    │  data/catalog-migration/<lote>/     │
                    └─────────────────┬───────────────────┘
                                      │
                    ┌─────────────────▼───────────────────┐
                    │  validate:goldens --lote --strict     │
                    │  → piloto player 5%                 │
                    │  → apply-lote --apply               │
                    └─────────────────────────────────────┘
```

| Usar | Não usar |
|------|----------|
| `catalog:export-lote` → handcraft → `validate:goldens --lote --strict` → `apply-lote` | `npm run ai:generate` |
| JSON em `data/catalog-migration/<lote>/questions/<slug>.json` | `catalog:upgrade-premium` (legado) |
| `lote-meta.json` + registry | Apply com saída de builder/hybrid |

---

## 3. Runbook por subtópico

Ordem **obrigatória**:

### Fase 0 — Escopo

1. Confirmar nome **canônico** do subtópico (`CLAUDE.md` §9).
2. Verificar [`handcraft-registry.json`](../data/catalog-migration/handcraft-registry.json); se ausente, criar entrada.
3. Exportar catálogo:
   ```bash
   npm run catalog:export-lote -- --lote=<pacote>-completo --subtopico="Nome Exato" --limit=10000
   ```
4. Contar slugs em `data/catalog-migration/<pacote>-completo/manifest.json`.

### Fase 1b — Cluster pedagógico (recomendado)

1. Criar ou reutilizar `scripts/cluster-<pacote>-topics.ts`.
2. Mapear `GOLDEN_BY_CLUSTER` → arquivo em `examples/`.
3. Rodar `npm run cluster:<pacote>`.
4. Ler `artifacts/<pacote>-topic-cluster-report.json`.

**Regra de bolso (ramo):** volume ≥ **10%** do subtópico **ou** ≥ **5 questões** com tema coeso → **1 golden âncora de estilo**.

### Fase 1 — Golden âncora (1 ramo)

Para cada ramo `novo_ramo` ou piloto prioritário:

1. Escolher **1 questão real** do cluster (`sample_slugs[0]`).
2. Copiar [`examples/_TEMPLATE-golden-v1.json`](../examples/_TEMPLATE-golden-v1.json).
3. Preencher seguindo §4 e [`GOLDEN_CONTENT_STANDARD.md`](GOLDEN_CONTENT_STANDARD.md).
4. Validar: `npm run validate:goldens` + `npm test -- golden-content-standard`.
5. Registrar no cluster script em `GOLDEN_BY_CLUSTER`.

### Fase 1c — Handcraft por questão

Para **cada slug** do subtópico (lotes de 8):

| Passo | Ação |
|-------|------|
| 1 | Ler export — **não** inventar enunciado |
| 2 | `meta.content_standard: "golden-v1"` + `family` + `sources[]` |
| 3 | 4 slides **planos** — sem `template` / `layout_variant` |
| 4 | `danger_zone.items[].correct` — **justificativa distinta por distrator** |
| 5 | `logic_flow`: `reveal_mode: "tap"`, steps em strings |
| 6 | `npm run validate:goldens -- --lote=<lote> --strict` |
| 7 | Salvar em `data/catalog-migration/<pacote>-gNN/questions/<slug>.json` |

### Fase 4 — Piloto player

- 2–3 slugs por lote em `/estudar/[slug]`.
- Checklist: enunciado ↔ slides; gabarito ↔ `danger_zone.correct`; sem vocabulário de outro tema.

### Fase 5 — Apply (só após piloto OK)

```bash
npm run catalog:apply-lote -- --lote=<pacote>-gNN --dry-run
npm run catalog:apply-lote -- --lote=<pacote>-gNN --apply
```

Relatório: `artifacts/catalog-migration-<lote>-applied.json`.

**Ordem por lote:**

```text
export-lote → handcraft N JSONs → validate:goldens --lote=X --strict
→ apply-lote --dry-run → amostra player → apply-lote --apply
```

**Referência:** Perioperatória — 9 lotes, 68 questões — [`perioperatoria-completo/README.md`](../data/catalog-migration/perioperatoria-completo/README.md).

---

## 4. Contrato JSON (checklist do agente)

### `meta` obrigatório (golden-v1)

```json
{
  "content_standard": "golden-v1",
  "family": "conceito",
  "content_review": {
    "reviewed_at": "YYYY-MM-DD",
    "reviewer": "iniciais",
    "guideline_snapshot": "Documento + ano",
    "exam_vs_current": "none"
  },
  "sources": [
    { "id": "...", "tier": "A", "issuer": "...", "title": "...", "year": 2020, "covers": ["..."] }
  ]
}
```

- `subtopico`: nome **exato** do mapa (repetir em cada slide `meta.subtopico`).
- **Não** enviar `template` / `layout_variant` — design automático por subtópico.
- `sources[].year`: número ≥ 1990 (validação Zod).

### Slides (formato plano)

| Slide | Obrigatório | Proibido |
|-------|-------------|----------|
| `concept_map` | ≥3 `items` com `icon` Lucide | Texto genérico "conceito central", "[IA]" |
| `golden_rule` | `content` e/ou `rows[]` com gabarito | Frase única copiada do gabarito em todas as questões |
| `logic_flow` | `reveal_mode: "tap"`, ≥3 `steps` string | Steps que copiam literalmente as alternativas |
| `danger_zone` | `content` + `items[].correct` por distrator | Mesma frase em dois `correct` |

Detalhe: [`GOLDEN_CONTENT_STANDARD.md`](GOLDEN_CONTENT_STANDARD.md) §6–7b.

---

## 5. Gates automatizados (antes de publicar)

| Gate | Comando / código | Bloqueia apply? |
|------|------------------|-----------------|
| Zod + forma | `QuestaoCompletaSchema` | Sim |
| Stub / molde | `premiumGate` em `applyLote` | Sim |
| Golden-v1 lint | `lintGoldenContent` (`validate:goldens --strict`) | Sim (modo strict) |
| Contrato L2 | `detectDuplicateDangerJustifications`, `detectSlideTopicDrift` | Warn na auditoria |
| Gabarito | `gabarito_mismatch` | Blocker manual |

---

## 6. Artefatos por subtópico

| Artefato | Caminho |
|----------|---------|
| Export catálogo | `data/catalog-migration/<pacote>-completo/questions/*.json` |
| Cluster report | `artifacts/<pacote>-topic-cluster-report.json` |
| Goldens âncora (estilo) | `examples/questao-premium-*.json` |
| Handcraft por slug | `data/catalog-migration/<pacote>-gNN/questions/<slug>.json` |
| Progresso | `data/catalog-migration/handcraft-registry.json` |
| Apply report | `artifacts/catalog-migration-<lote>-applied.json` |

---

## 7. Scripts npm

| Comando | Função |
|---------|--------|
| `npm run catalog:export-lote` | Supabase → `data/catalog-migration/{lote}/` |
| `npm run validate:goldens -- --lote=<lote> --strict` | Lint golden-v1 — **obrigatório antes do apply** |
| `npm run catalog:apply-lote` | Grava `conteudo_json` no Supabase |
| `npm test -- golden-content-standard` | Regressão dos gates |

> Rodar via **`npm run`** — evitar `npx tsx` no Windows.

---

## 8. Anti-padrões

| Erro | Correção |
|------|----------|
| Apply com hybrid/builder | Só apply com JSON handcraft golden-v1 |
| 1 golden por subtópico inteiro | 1 âncora **por ramo**; 1 JSON **por slug** |
| `danger_zone.correct` igual em todas as letras | Cada distrator com **por que é errado nesta prova** |
| Sem `sources[].year` | Ano ≥ 1990 em toda source tier A/B |
| Tentar escalar via builder | Dividir em lotes `g01`…`gNN`; handcraft slug a slug |

---

## 9. Ordem sugerida no catálogo

**Onda 1 — Fechar pequenos / em andamento:** subtópicos ≤40 slugs pendentes (CME e Saúde Mental **fechados**).

**Onda 2 — Médios (50–200):** Coleta, Oxigenoterapia, Punção, ISTs, Cálculos, CC, etc.

**Onda 3 — Grandes (re-handcraft do legado builder):** Sinais Vitais (~654), Imunização (~577), Vias (~256), Urgências (~283), Cuidados na Administração (~267).

Matriz viva: [`handcraft-registry.json`](../data/catalog-migration/handcraft-registry.json).

---

## 10. Definition of Done — subtópico fechado

- [ ] 100% dos slugs com `meta.content_standard: "golden-v1"`
- [ ] 100% passam `validate:goldens --strict` (0 falhas)
- [ ] `danger_duplicate_justifications` = 0
- [ ] `slide_topic_drift` ≈ 0
- [ ] Amostra humana ≥5% aprovada no player
- [ ] `catalog:apply-lote --apply` com relatório 0 failed
- [ ] Registry: `status: applied`, `pending_slugs: []`

---

## Resumo executivo

1. **Cluster** o catálogo em ramos pedagógicos.
2. **Âncora** golden-v1 por ramo (estilo em `examples/`).
3. **Handcraft** golden-v1 **por slug** em lotes de 8.
4. **Piloto** no player → **apply** só com strict OK.

Use este documento como **procedimento padrão** para toda questão que ainda não está em golden-v1 no AVANT.

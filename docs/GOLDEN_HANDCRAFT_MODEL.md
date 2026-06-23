# Modelo Golden Handcraft — Âncora + Escala

**Runbook operacional** para elevar o catálogo AVANT (~5.180 questões) ao padrão `golden-v1` com conteúdo **específico por questão** (L2), sem depender de hybrid genérico.

Complementa (não substitui):
- [`HANDCRAFT_CONVERSA.md`](HANDCRAFT_CONVERSA.md) — **prompt de conversa nova** (`Handcraft: <subtópico>`)
- [`GOLDEN_CONTENT_STANDARD.md`](GOLDEN_CONTENT_STANDARD.md) — gramática de slots e gates de lint
- [`GOLDEN_ROLLOUT_CATALOGO.md`](GOLDEN_ROLLOUT_CATALOGO.md) — programa catálogo inteiro + decisões de arquitetura
- [`PACOTE_PREMIUM_CHECKLIST.md`](PACOTE_PREMIUM_CHECKLIST.md) — moldes bespoke, builder, migração em lote
- [`.cursor/rules/avant-agent-json.mdc`](../.cursor/rules/avant-agent-json.mdc) — contrato JSON no Laboratório

**Pilots de referência (2026-06):**
| Subtópico | Questões (DB) | Modo | Status |
|-----------|---------------|------|--------|
| **Assistência Perioperatória (Inclui SRPA)** | 68 | **Trilho A** handcraft total | **Fechado** — ver [`perioperatoria-completo/README.md`](../data/catalog-migration/perioperatoria-completo/README.md) |
| Saúde Mental | 37 | Âncoras + micro-lotes handcraft | Em rollout — `examples/` (11 âncoras) |
| CME | 35 | Trilho A por cluster | Em rollout — `cme-g01`…`g05` |

Cluster perioperatória: `npm run cluster:perioperatoria` · 6 âncoras de estilo em `examples/questao-premium-*-perioperatoria-*.json`.

---

## 1. North star

| Princípio | Regra |
|-----------|--------|
| **Cada card ensina esta prova** | Slides citam letras, termos do enunciado e alternativa correta — nunca texto reciclável entre questões |
| **Âncora por ramo, não por subtópico inteiro** | 1 golden-v1 ≈ 1 **ramo pedagógico** (EXCETO flebite, SRPA/Aldrete, pré-op…), não 1 JSON para 500 questões |
| **Handcraft onde importa** | IA/agente redige goldens; builder **imita a gramática** da âncora para escalar (subtópicos grandes) |
| **Não aplicar hybrid cego** | `catalog:upgrade-premium` sem builder dedicado gera L1 com `concept_map` stub — **não** fecha L2 |
| **Validar antes do DB** | `npm run validate:goldens` + amostra no player ≥5% antes de `catalog:apply-lote --apply` |

> **Limite de escala:** handcraft **integral** (1 JSON por slug) só é viável para subtópicos **≤ ~70 questões**. Acima disso: âncoras handcraft + builder golden-compliant ou handcraft em lotes por ramo.

---

## 2. Os dois trilhos de produção

```text
                    ┌─────────────────────────────────────┐
                    │  Fase 0: export + cluster (1b)      │
                    └─────────────────┬───────────────────┘
                                      │
              ┌───────────────────────┴───────────────────────┐
              │                                               │
     Trilho A — Catálogo pequeno                    Trilho B — Catálogo grande
     (≤ ~70 slugs)                                 (> ~70 slugs)
              │                                               │
     Handcraft golden-v1                           Âncoras handcraft (6–12 ramos)
     para CADA slug em                            + builder dedicado que emite
     examples/ ou lote-goldens/                    golden-v1 (futuro) ou handcraft
              │                                    em lotes por cluster
              │                                               │
              └───────────────────────┬───────────────────────┘
                                      ▼
                    ┌─────────────────────────────────────┐
                    │  validate:goldens + player 5%       │
                    │  → apply-lote (premium gate)        │
                    └─────────────────────────────────────┘
```

| Trilho | Quando | Entrega |
|--------|--------|---------|
| **A — Handcraft total** | Subtópico pequeno; sem builder maduro; alto valor pedagógico | N arquivos `examples/questao-premium-*.json` ou `data/catalog-migration/<lote>-goldens/questions/*.json` |
| **B — Âncora + escala** | Imunização, Sinais Vitais, Vias… (já têm builder) | Âncoras em `examples/` + `upgradePremium<Pacote>.ts` + lotes |
| **Híbrido (piloto)** | Subtópico médio (ex.: Perioperatória 68) | Fase 1: âncoras por ramo → Fase 2: handcraft slug a slug nos ramos maiores → builder depois |

**Subtópicos já “Completo” no repo (builder):** Curativos, Imunização — **não** refazer handcraft; usar como referência de gramática.

---

## 3. Runbook por subtópico (handcraft)

Ordem **obrigatória** — igual ao [`PACOTE_PREMIUM_CHECKLIST.md`](PACOTE_PREMIUM_CHECKLIST.md), com ênfase em conteúdo L2:

### Fase 0 — Escopo

1. Confirmar nome **canônico** do subtópico (`CLAUDE.md` §9).
2. Exportar catálogo:
   ```bash
   npm run catalog:export-lote -- --lote=<pacote>-completo --subtopico="Nome Exato" --limit=200
   ```
3. Contar slugs em `data/catalog-migration/<pacote>-completo/manifest.json`.
4. Decidir trilho A ou B (§2).

### Fase 1b — Cluster pedagógico

1. Criar ou reutilizar `scripts/cluster-<pacote>-topics.ts` (copiar de [`cluster-perioperatoria-topics.ts`](../scripts/cluster-perioperatoria-topics.ts) ou [`cluster-saude-mental-topics.ts`](../scripts/cluster-saude-mental-topics.ts)).
2. Mapear `GOLDEN_BY_CLUSTER` → arquivo em `examples/`.
3. Rodar:
   ```bash
   npm run cluster:<pacote>
   # ou: npm run cluster:perioperatoria
   ```
4. Ler `artifacts/<pacote>-topic-cluster-report.json`:
   - `cluster_decisions`: `novo_ramo` → criar âncora; `coberto` → já tem golden; `cauda_longa` → absorver ou L2-shallow.
   - `stub_total` / `contract_fail_total` — baseline antes da migração.

**Regra de bolso (ramo):** volume ≥ **10%** do subtópico **ou** ≥ **5 questões** com tema semântico coeso → **1 golden âncora**.

### Fase 1 — Golden âncora (1 ramo)

Para cada ramo `novo_ramo` ou piloto prioritário:

1. Escolher **1 questão real** do cluster (`sample_slugs[0]`).
2. Copiar [`examples/_TEMPLATE-golden-v1.json`](../examples/_TEMPLATE-golden-v1.json).
3. Preencher seguindo §4 e [`GOLDEN_CONTENT_STANDARD.md`](GOLDEN_CONTENT_STANDARD.md) §5–7b.
4. Validar:
   ```bash
   npm run validate:goldens
   npm test -- golden-content-standard
   ```
5. Registrar no cluster script em `GOLDEN_BY_CLUSTER`.
6. Preview no Laboratório (`/admin/laboratorio`) — import JSON.

### Fase 1c — Handcraft por questão (trilho A ou ramo a ramo)

Para **cada slug** do ramo (ou do subtópico inteiro se pequeno):

| Passo | Ação |
|-------|------|
| 1 | Ler `data/catalog-migration/<lote>/questions/<slug>.json` — **não** inventar enunciado |
| 2 | `meta` da prova + `content_standard: "golden-v1"` + `family` (`classifyFamily`) |
| 3 | `sources[]` tier A/B — todo número normativo com `covers` |
| 4 | 4 slides **planos** — sem `template` / `layout_variant` salvo override |
| 5 | `danger_zone.items[].correct` — **uma justificativa distinta por letra errada** |
| 6 | `logic_flow`: estratégia em `steps` (strings), `reveal_mode: "tap"` — **não** copiar texto das options |
| 7 | `npm run validate:goldens -- --only=<nome-arquivo>` |
| 8 | Opcional: salvar em `data/catalog-migration/<pacote>-goldens/questions/<slug>.json` para apply |

**Nome do arquivo:** `questao-premium-<banca>-<subtopico-recorte>.json` em `examples/` (âncora) ou `<slug>.json` no lote (catálogo).

### Fase 4 — Piloto player

- 2–3 slugs por ramo forte em `/estudar/[slug]`.
- Gerar mapa: `scripts/generate-<pacote>-links.ts` → `artifacts/<pacote>-links.html`.
- Checklist humana: enunciado ↔ slides; gabarito ↔ `danger_zone.correct`; sem vocabulário de outro tema.

### Fase 5 — Apply (só após piloto OK)

```bash
# JSONs já no lote (upgrade ou cópia dos goldens)
npm run catalog:apply-lote -- --lote=<pacote>-goldens --dry-run
npm run catalog:apply-lote -- --lote=<pacote>-goldens --apply
```

**Não** usar `--apply` com saída de `catalog:upgrade-premium --force` se o subtópico não tiver builder dedicado — o hybrid passa `premiumGate` estrutural mas **falha** L2 (stubs, justificativas genéricas).

Relatório: `artifacts/catalog-migration-<lote>-applied.json`.

### Fase 3b — Trilho A: handcraft total **sem hybrid**

Para subtópicos **≤ ~70 slugs** (ex.: Perioperatória 68, CME 35), é possível fechar **100% golden-v1** sem builder e sem IA em lote:

| Usar | Não usar |
|------|----------|
| `catalog:export-lote` → handcraft no Cursor → `validate:goldens --lote --strict` → `apply-lote` | `npm run ai:generate` |
| JSON em `data/catalog-migration/<lote>/questions/<slug>.json` | `catalog:upgrade-premium` (hybrid genérico) |
| `lote-meta.json` + README do pacote | Apply com saída de builder não golden-compliant |

**Ordem por lote** (8–10 slugs por vez reduz retrabalho de validação):

```text
export-lote → handcraft N JSONs → validate:goldens --lote=X --strict
→ apply-lote --dry-run → amostra player → apply-lote --apply
```

**Caso fechado:** Perioperatória — 9 lotes (`perioperatoria-g01`…`g09`), 68 questões, apply 2026-06-23. Documentação operacional: [`data/catalog-migration/perioperatoria-completo/README.md`](../data/catalog-migration/perioperatoria-completo/README.md).

Modelo de `lote-meta.json` rico: [`data/catalog-migration/cme-g01/lote-meta.json`](../data/catalog-migration/cme-g01/lote-meta.json).

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
| `concept_map` | ≥3 `items` com `icon` Lucide; ENQUADRAMENTO + gabarito | Texto genérico "conceito central", "[IA]" |
| `golden_rule` | `content` e/ou `rows[]` com gabarito na última linha | Frase única copiada do gabarito em todas as questões |
| `logic_flow` | `reveal_mode: "tap"`, ≥3 `steps` string | Steps que são cópia literal das alternativas |
| `danger_zone` | `content` + `items[].correct` por distrator | Mesma frase em dois `correct`; letra ≠ `is_correct` |

### Famílias especiais

| `family` | `danger_zone` | `logic_flow` |
|----------|---------------|--------------|
| `vf` | Ensinar por afirmativa I–IV, não só por letra | Julgar I → II → III → combinar |
| `certo_errado` | Pegadinhas da afirmativa única | Critério → norma → C/E |
| `calc` | Passo de erro de unidade/conta | Dados → fórmula → resultado |
| `protocolo` | Ordem errada vs protocolo | Sequência oficial |

Detalhe: [`GOLDEN_CONTENT_STANDARD.md`](GOLDEN_CONTENT_STANDARD.md) §6–7b.

---

## 5. Gates automatizados (antes de publicar)

| Gate | Comando / código | Bloqueia apply? |
|------|------------------|-----------------|
| Zod + forma | `QuestaoCompletaSchema` | Sim |
| Stub / molde | `premiumGate` em `applyLote` | Sim |
| Golden-v1 lint | `lintGoldenContent` (`validate:goldens`) | Warn hoje; **error** ao fechar subtópico |
| Contrato L2 | `detectDuplicateDangerJustifications`, `detectSlideTopicDrift` | Warn na auditoria |
| Gabarito | `gabarito_mismatch` | Warn — tratar como **blocker** manual |

Códigos completos: [`GOLDEN_CONTENT_STANDARD.md`](GOLDEN_CONTENT_STANDARD.md) §7b · implementação [`lib/goldenContentStandard.ts`](../lib/goldenContentStandard.ts).

---

## 6. Artefatos por subtópico

| Artefato | Caminho |
|----------|---------|
| Export catálogo | `data/catalog-migration/<lote>-completo/questions/*.json` |
| Cluster report | `artifacts/<pacote>-topic-cluster-report.json` |
| Goldens âncora | `examples/questao-premium-*.json` |
| Goldens por slug (apply) | `data/catalog-migration/<pacote>-goldens/questions/<slug>.json` |
| Links player | `artifacts/<pacote>-links.html` |
| Apply report | `artifacts/catalog-migration-<lote>-applied.json` |

---

## 7. Scripts npm (catálogo)

| Comando | Função |
|---------|--------|
| `npm run catalog:export-lote` | Supabase → `data/catalog-migration/{lote}/` |
| `npm run cluster:perioperatoria` | Cluster perioperatória (replicar para outros pacotes) |
| `npm run validate:goldens` | Lint golden-v1 em `examples/questao-premium-*.json` |
| `npm run validate:goldens -- --lote=<lote> --strict` | Lint golden-v1 dos JSONs do lote (handcraft) — **obrigatório antes do apply** |
| `npm run catalog:apply-lote` | Grava `conteudo_json` no Supabase (`--dry-run` \| `--apply`) |
| `npm test -- golden-content-standard` | Regressão dos gates |

> Rodar via **`npm run`** — evitar `npx tsx` no Windows (cold start instável).

**Template de novo cluster:** copiar [`scripts/cluster-perioperatoria-topics.ts`](../scripts/cluster-perioperatoria-topics.ts), ajustar `inferBuilderTopic`, `refinePedagogicalCluster`, `GOLDEN_BY_CLUSTER`, registrar em `package.json` como `cluster:<pacote>`.

---

## 8. Anti-padrões (lições dos pilots)

| Erro | O que aconteceu | Correção |
|------|-----------------|----------|
| Apply com hybrid `--force` | SM: 37/37 OK estrutural, ~21 com conteúdo genérico | Só apply com JSON golden-v1 ou builder dedicado |
| 1 builder SM-4 para todo subtópico | RAPS caiu em “de-escalada” (`contenção` na alternativa) | `isCriseAnchor` só com âncora no **enunciado**; cluster antes do builder |
| 1 golden por subtópico | Punção: drift ~75% com 1 IPCS | 1 golden **por ramo** ≥10% |
| `danger_zone.correct` igual em todas as letras | Gate `danger_duplicate_justifications` | Cada distrator com **por que é errado nesta prova** |
| Sem `sources[].year` | `validate:goldens` falha | Ano ≥ 1990 em toda source tier A/B |
| Handcraft 5.180 de uma vez | Invável | Trilho B ou subtópicos pequenos primeiro |

---

## 9. Ordem sugerida no catálogo (pós-pilots)

1. ~~**Perioperatória** (68)~~ — **fechado** Trilho A handcraft ([README](../data/catalog-migration/perioperatoria-completo/README.md)).
2. **CME** (35) — Trilho A por cluster (`cme-g01`…`g05`).
3. **Saúde Mental** (37) — âncoras + micro-lotes handcraft.
4. **Processo de Enfermagem** (34) — builder SAE existe; refinar para golden-v1 ou handcraft.
5. **Segurança do Paciente** (67) — âncora CESGRANRIO; handcraft ou builder.
6. **Roadmap volume** — Vias, Urgências, Sinais Vitais: âncoras novas + builders existentes.

Matriz viva: [`PACOTE_PREMIUM_CHECKLIST.md`](PACOTE_PREMIUM_CHECKLIST.md) · programa: [`GOLDEN_ROLLOUT_CATALOGO.md`](GOLDEN_ROLLOUT_CATALOGO.md).

---

## 10. Definition of Done — handcraft fechado

Um ramo (ou subtópico pequeno) está **handcraft-fechado** quando:

- [ ] 100% dos slugs do escopo têm `meta.content_standard: "golden-v1"`
- [ ] 100% passam `npm run validate:goldens` (0 falhas)
- [ ] `danger_duplicate_justifications` = 0 no cluster pós-migração
- [ ] `slide_topic_drift` ≈ 0 (sem vocabulário de outro tema)
- [ ] Amostra humana ≥5% aprovada no player
- [ ] `catalog:apply-lote --apply` com relatório 0 failed
- [ ] Âncoras listadas em `GOLDEN_BY_CLUSTER` do cluster script

---

## 11. Referência rápida — perioperatória

**Pacote fechado (68/68):** [`data/catalog-migration/perioperatoria-completo/README.md`](../data/catalog-migration/perioperatoria-completo/README.md) · lotes `perioperatoria-g01`…`g09` · links `artifacts/perioperatoria-g*-links.html`.

### Âncoras de estilo (Fase 1)

| Ramo | Golden âncora |
|------|----------------|
| SRPA / CPD (C/E) | `questao-premium-idecan-srpa-curativo-cpd-ce.json` |
| SRPA / Aldrete | `questao-premium-idecan-perioperatoria-aldrete-srpa.json` |
| SRPA / técnico | `questao-premium-consulplan-perioperatoria-srpa-monitorizacao.json` |
| Pré-operatório | `questao-premium-avancasp-perioperatoria-pre-operatorio.json` |
| ISC classificação | `questao-premium-furb-perioperatoria-isc-classificacao.json` |
| Cirurgia segura / CDC | `questao-premium-cogeps-perioperatoria-cirurgia-segura-cdc.json` |

Saúde Mental: ver `examples/questao-premium-*saude-mental*.json` (11 âncoras) + `artifacts/saude-mental-topic-cluster-report.json`.

---

## Resumo executivo

O **modelo golden handcraft** não é “escrever 5.180 JSONs à mão de uma vez”. É:

1. **Cluster** o catálogo em ramos pedagógicos.
2. **Âncora** golden-v1 por ramo (IA + revisão + `validate:goldens`).
3. **Handcraft por slug** nos subtópicos pequenos ou **builder** que imita a âncora nos grandes.
4. **Piloto** no player → **apply** só com L2 validado.

Use este documento como **procedimento padrão** para toda questão que ainda não está em golden-v1 no AVANT.

# Golden Rollout — Catálogo inteiro em golden-v1

Runbook do programa **"toda questão do AVANT vira golden"** (≈5.180 registros, 41 subtópicos).

> **Decisão de produto:** elevar todo o catálogo ao padrão `golden-v1` — conteúdo pedagógico específico, com fonte, sem reciclagem, gabarito consistente. Mais ousado e mais seguro que o hybrid genérico.

**Pré-requisitos de leitura:**
- [`GOLDEN_HANDCRAFT_MODEL.md`](GOLDEN_HANDCRAFT_MODEL.md) — **runbook operacional** âncora + handcraft por subtópico (pilots SM + Perioperatória)
- [`GOLDEN_CONTENT_STANDARD.md`](GOLDEN_CONTENT_STANDARD.md) — o padrão e os gates (`lintGoldenContent`)
- [`PACOTE_PREMIUM_CHECKLIST.md`](PACOTE_PREMIUM_CHECKLIST.md) — runbook por subtópico (golden → builder → lote)
- [`PREMIUM_QUESTAO.md`](PREMIUM_QUESTAO.md) — níveis L1/L2/L3
- [`FONTE_NORMATIVA_AVANT.md`](FONTE_NORMATIVA_AVANT.md) — prioridade de fontes

---

## 0. Estado atual (baseline honesto — 2026-06-23)

### Subtópicos handcraft golden-v1 em produção

| Subtópico | Slugs | Modo | Doc operacional |
|-----------|-------|------|-----------------|
| Assistência Perioperatória (Inclui SRPA) | 68 | Trilho A — handcraft total, sem hybrid | [`perioperatoria-completo/README.md`](../data/catalog-migration/perioperatoria-completo/README.md) |

> Primeiro subtópico fechado 100% via `validate:goldens --lote --strict` + `catalog:apply-lote --apply` (lotes `perioperatoria-g01`…`g09`, 2026-06-23).

### Infra ainda pendente (catálogo inteiro)

| Fato verificado no código | Implicação |
|---------------------------|------------|
| `lintGoldenContent` só roda quando `meta.content_standard === "golden-v1"` | Conteúdo sem essa flag é **invisível** ao gate |
| **Nenhum builder** seta `content_standard: "golden-v1"` (`lib/catalogMigration/*`) | Gate golden é **inerte sobre conteúdo em escala** hoje |
| Golden lint é `severity: 'warn'` em `validateQuestaoForWrite` | Questão com `gabarito_mismatch` **entra no banco** (só avisa) |
| `validate:goldens` cobre apenas `examples/` (~60 arquivos) | **Não há** auditoria golden do catálogo/DB |
| Gates `error` hoje: Zod, `premiumGate` (stub/molde), TecConcursos | Corretude golden ainda não bloqueia |

**Conclusão:** o golden-v1 governa hoje os **arquivos de referência**, não o catálogo. As mudanças abaixo são o que falta para o programa ser real.

---

## 1. As duas decisões de arquitetura (gargalo nº1)

Sem estas duas, "tudo golden" não acontece tecnicamente:

### 1.1 Builders passam a emitir `golden-v1`
Cada `upgradePremium<Pacote>.ts` deve setar `meta.content_standard: "golden-v1"` + `meta.family` + `meta.content_review` + `meta.sources` (vindo de `lib/guidelines/`), e o output deve **passar `lintGoldenContent`**.

- Migração incremental: builder por builder declara-se golden-compliant.
- Registrar no builder a versão a partir da qual é golden (comentário + teste dedicado).

### 1.2 Gate golden vira bloqueante (`warn` → `error`)
No `apply-lote` e no `validateQuestaoForWrite`, quando `content_standard === "golden-v1"`, issues do `lintGoldenContent` viram **`error`** (bloqueiam escrita).

- Flag de transição: manter `warn` enquanto o subtópico está em migração; virar `error` ao fechar.
- Critério: ver DoD (§7).

---

## 2. Variações do golden-v1 por família (evitar falso-positivo em massa)

O gate foi calibrado em `vf`/`conceito`. Antes de escalar, documentar e implementar as exceções por `meta.family` (já parcialmente no lint):

| Família | Particularidade | Ajuste no gate |
|---------|-----------------|----------------|
| `vf` | Letras = combinações de I–IV | Cobertura por **afirmativa**, não por letra (já tratado) |
| `calc` | Sem distratores conceituais por letra | `danger_distractors*` não se aplica; exigir passo de cálculo + unidade |
| `text_fragment` | Caso clínico longo | Especificidade ancora no fragmento, não no comando |
| `protocolo` | Sequência ordenada | `logic_flow` = ordem oficial; sem cobertura por letra |
| `legis` | Lei + artigo | Exigir citação de norma na fonte |

> Regra: **toda nova família coberta exige calibração contra os goldens existentes** (zero falso-positivo) antes de virar `error`.

---

## 3. Auditoria do catálogo (a fonte de verdade)

Hoje `validate:goldens` só vê `examples/`. O programa precisa de auditoria **do banco**.

### A construir: `audit:golden-supabase`
Espelhar [`scripts/audit-premium-supabase.ts`](../scripts/audit-premium-supabase.ts), rodando `lintGoldenContent` em cada registro de `modulos_estudo` e reportando:

- `% golden-v1 compliant` por subtópico
- top issues por código (`gabarito_mismatch`, `specificity_semantic`, …)
- registros sem `content_standard` (ainda hybrid)

Saída → `artifacts/golden-catalog-audit.json` (regenerável; **nunca** matriz à mão).

### Matriz de prontidão gerada
A tabela de progresso por subtópico passa a ser **gerada** pela auditoria, substituindo a tabela manual de `PACOTE_PREMIUM_CHECKLIST.md` (que diverge do DB — ex.: Sinais Vitais "fechado" no doc, 26% no banco).

---

## 4. Catálogo de fontes por subtópico

A regra `numeric_claim_unsourced` **bloqueia** número sem `sources[].covers`. Em escala, isso exige cobertura de guidelines.

- Mapear, dos **41 subtópicos**, quais têm guideline verificada em [`lib/guidelines/`](../lib/guidelines/index.ts) (`GUIDELINE_TABLES`) e o registry (`subtopico_guideline_registry`).
- Documentar lacunas: subtópico sem fonte oficial **não pode** fechar golden com claims numéricos.
- Comandos existentes: `npm run audit:guideline-coverage`, `seed:guideline-registry`, `refresh:guideline-counts`.

---

## 5. Revisão humana factual (o que o lint NÃO faz)

O lint garante que **há** fonte; não que o **número/conduta está certo**. SOP obrigatório:

| Item | Regra |
|------|-------|
| Amostragem | ≥ 5% de cada lote revisado no player por humano |
| Sign-off | `content_review.reviewer` = iniciais reais (não "content-pilot" genérico) |
| Conflito prova × guideline | Registrar em `content_review.exam_vs_current` |
| Claims numéricos | 100% dos números conferidos contra a fonte citada |
| Rejeição | Erro factual → volta para builder/golden; não "ajuste no player" |

---

## 6. Anti-sameness em escala de corpus

`detectDuplicateDangerJustifications` é **por questão**. Falta dedup **entre questões** do mesmo subtópico.

### A construir: dedup de corpus
- Comparar `danger_zone.correct` e `logic_flow.steps` entre registros do mesmo subtópico (similaridade de shingles, reaproveitar `longestContiguousWordRun`).
- Reportar clusters de justificativa repetida → revisão.
- Integrar ao `audit:golden-supabase` como métrica `sameness_ratio`.

---

## 7. Definition of Done — "subtópico 100% golden"

Um subtópico está **golden-fechado** quando:

- [ ] Builder dedicado emite `content_standard: "golden-v1"` e passa `lintGoldenContent`
- [ ] **100%** dos registros no DB passam `lintGoldenContent` como `error` (via `audit:golden-supabase`)
- [ ] Fontes do subtópico mapeadas (`lib/guidelines/` + registry)
- [ ] `sameness_ratio` abaixo do limite (sem reciclagem de corpus)
- [ ] Amostra humana ≥5% aprovada no player
- [ ] Gate virado de `warn` → `error` para o subtópico
- [ ] Linha do subtópico na matriz **gerada** = 100%

---

## 8. Versionamento do padrão

O golden-v1 foi fortalecido in place (gabarito, reciclagem, especificidade, distratores, claim↔source). Política:

- Ao subir o nível do padrão, **re-lintar todo o catálogo** (`audit:golden-supabase`).
- Marcar defasados (ex.: `content_review.standard_version`) e re-migrar.
- Mudança de gate sempre acompanhada de **calibração contra `examples/`** (zero falso-positivo) — ver `__tests__/golden-content-standard.test.ts`.

---

## 9. Fases do programa

```
Fase 0  Infra de gate
        ├── builders emitem golden-v1 (§1.1)
        ├── gate warn→error com flag de transição (§1.2)
        ├── variações por família (§2)
        └── audit:golden-supabase (§3)

Fase 1  Cobertura de fontes (§4) — mapear 41 subtópicos

Fase 2  Rollout por subtópico (ordem do PACOTE_PREMIUM_CHECKLIST)
        └── por subtópico: seguir [`GOLDEN_HANDCRAFT_MODEL.md`](GOLDEN_HANDCRAFT_MODEL.md) (cluster → âncora → handcraft/builder → apply)

Fase 3  Auditoria contínua
        ├── matriz gerada (§3)
        ├── dedup de corpus (§6)
        └── re-lint em bump de padrão (§8)
```

Ordem de subtópicos por impacto: ver Roadmap em [`PACOTE_PREMIUM_CHECKLIST.md`](PACOTE_PREMIUM_CHECKLIST.md) (Vias de Administração, Urgências, Sinais Vitais primeiro).

---

## 10. Comandos

| Comando | Estado | Função |
|---------|--------|--------|
| `npm run validate:goldens` | ✅ existe | Lint dos `examples/` (referência) |
| `npm run validate:goldens -- --lote=<lote> --strict` | ✅ existe | Lint handcraft em `data/catalog-migration/<lote>/questions/` |
| `npm run audit:premium-supabase` | ✅ existe | Stub/molde no catálogo |
| `npm run audit:guideline-coverage` | ✅ existe | Cobertura de fontes |
| `npm run audit:golden-supabase` | ⏳ a construir | **Lint golden do catálogo** (§3) |
| `npm run cluster:perioperatoria` | ✅ existe | Cluster perioperatória → `artifacts/perioperatoria-topic-cluster-report.json` |
| `npm test -- golden-content-standard` | ✅ existe | Gate + calibração dos `examples/` |
| Doc [`GOLDEN_HANDCRAFT_MODEL.md`](GOLDEN_HANDCRAFT_MODEL.md) | ✅ | Runbook âncora + handcraft (todos os subtópicos pendentes) |

> **Nota de ambiente:** rodar scripts via `npm run` (usa `node_modules/.bin`). **Evitar `npx tsx`** — cold start instável no Windows (ver histórico de validação).

---

## Resumo executivo

O programa é viável e correto, mas o gargalo **não é mais documento — é a decisão de arquitetura** (§1): builder vira golden-compliant + gate golden bloqueia. Documentado isso, o resto (audit de catálogo, fontes, revisão, dedup) decorre. O lint eleva o **piso**; a revisão humana factual (§5) é o que sustenta o **teto**.

# Plano de implementação — Evidence Engine Fase 1

**Data:** 2026-07-24  
**Status:** proposto para aprovação (revisão pós-auditoria)  
**Fontes normativas:**

- [DECISAO_EVIDENCE_ENGINE.md](DECISAO_EVIDENCE_ENGINE.md) — ADR (decisões e invariantes; prevalece em conflito)
- [SPEC_EVIDENCE_ENGINE_FASE_1_EVENT_STREAM.md](SPEC_EVIDENCE_ENGINE_FASE_1_EVENT_STREAM.md) — spec operacional Fase 1

**Escopo:** instrumentação pura (event stream paralelo, sem domínio/T1/holdout/RCT)  
**Ship:** não autorizado por este documento

---

## Git status — início desta revisão

Registrado em 2026-07-24 antes de editar este arquivo:

```text
 M __tests__/components/lesson/AvantLessonPlayer.elimination.test.tsx
 M __tests__/components/lesson/AvantLessonPlayer.emptyOptions.test.tsx
 M __tests__/components/lesson/AvantLessonPlayer.error-surfaces.test.tsx
 M __tests__/components/lesson/AvantLessonPlayer.navigation.test.tsx
 M __tests__/components/lesson/AvantLessonPlayer.optimistic-dots.test.tsx
 M __tests__/components/lesson/AvantLessonPlayer.slides.test.tsx
 M app/(dashboard)/(authenticated)/cadernos/[id]/CadernoDetailClient.tsx
 M app/(dashboard)/(authenticated)/cadernos/[id]/page.tsx
 M app/(dashboard)/(authenticated)/cadernos/novo/page.tsx
 M components/dashboard/cadernos/NovoCadernoClient.tsx
 M lib/cadernos/templates.ts
?? __tests__/components/dashboard/cadernos/
?? __tests__/lib/cadernos/createNotebookWithItems.test.ts
?? __tests__/lib/cadernos/setupMode.test.ts
?? __tests__/lib/cadernos/wizardSelection.test.ts
?? artifacts/qa-wizard-desktop-step1.png
?? artifacts/qa-wizard-step2-360x800.png
?? artifacts/qa-wizard-step2-390x844.png
?? artifacts/qa-wizard-step2-430x932.png
?? docs/DECISAO_EVIDENCE_ENGINE.md
?? docs/PLANO_IMPLEMENTACAO_EVIDENCE_ENGINE_FASE_1.md
?? docs/SPEC_EVIDENCE_ENGINE_FASE_1_EVENT_STREAM.md
?? lib/cadernos/createNotebookWithItems.ts
?? lib/cadernos/setupMode.ts
?? lib/cadernos/wizardSelection.ts
```

**Nota:** alterações de cadernos, wizard QA, testes do player e docs normativos EE **não** pertencem a esta correção do plano.

---

## 1. Estado atual verificado

### 1.1 Fluxo atual da tentativa (player)

**Arquivo:** [`components/lesson/AvantLessonPlayer.tsx`](../components/lesson/AvantLessonPlayer.tsx) — **existente**

Máquina de estados: `pergunta` → `gabarito` → `estudo`.

| Etapa | Comportamento verificado |
|-------|--------------------------|
| Seleção | State `selecionada`; clique/teclado/eliminação de distrator; **sem** persistência |
| Confirmação | `handleConfirmarResposta` → `registrarTentativa` → `POST /api/registrar-tentativa` via `postWithSessionRetry` + [`fetchWithAuth`](../lib/api/fetch-with-auth.ts) |
| Gabarito | Resposta HTTP define `GabaritoTentativa`; UI mostra acerto/erro |
| Estudo reverso | CTA → `estudo`; conclusão via [`MarcarEstudoConcluidoButton`](../components/lesson/MarcarEstudoConcluidoButton.tsx) → `POST /api/concluir-estudo-reverso` |
| Preview | `mode === 'preview'`: gabarito local (`buildPreviewGabarito`); **sem** API |

Gabarito em modo `live`: servidor via [`resolveQuestionAttempt`](../lib/estudar/questionPayload.ts); cliente recebe opções sem `is_correct` (`stripQuestionAnswersForClient`).

### 1.2 INSERT / UPDATE de `historico_questoes`

**Rota:** [`app/api/registrar-tentativa/route.ts`](../app/api/registrar-tentativa/route.ts) — **existente**

| Condição | Operação | Efeitos colaterais |
|----------|----------|-------------------|
| Primeira tentativa `(user_id, modulo_slug)` | `INSERT` | Freemium gate (`assertCanAnswerQuestion`) |
| Linha existente (`isReplay = true`) | `UPDATE` `acertou`, meta, **`created_at`** | Freemium **não** revalida |
| Falha de persistência | HTTP 500 | Aluno não vê gabarito |

**Simulado:** [`app/api/simulado/responder/route.ts`](../app/api/simulado/responder/route.ts) — **existente**

- Persiste `simulado_respostas` (com `opcao_id`, `tempo_ms`, `respondida_em`).
- Sincroniza `historico_questoes`: `UPDATE` se linha existe; `INSERT` se não.
- Sync em `UPDATE` **não** altera `created_at` (diferente de `registrar-tentativa`).

### 1.3 Rotas existentes (superfícies de tentativa)

| Rota | Arquivo | Papel |
|------|---------|-------|
| `POST /api/registrar-tentativa` | [`app/api/registrar-tentativa/route.ts`](../app/api/registrar-tentativa/route.ts) | Player vitrine/caderno/plano |
| `POST /api/simulado/responder` | [`app/api/simulado/responder/route.ts`](../app/api/simulado/responder/route.ts) | Simulado livre/semanal/diagnóstico |
| `POST /api/concluir-estudo-reverso` | [`app/api/concluir-estudo-reverso/route.ts`](../app/api/concluir-estudo-reverso/route.ts) | Conclusão NeuroSlides — **fora** do event stream Fase 1 |

Não existe `POST /api/evidence/attempt-events` (spec §3.11: ingestão **dentro** das rotas de tentativa).

### 1.4 Payloads atuais

**`registrar-tentativa` (body):** `modulo_slug`, `opcao_id`, `banca?`, `topico?`, `subtopico?`

**`simulado/responder` (Zod [`SimuladoAnswerSchema`](../lib/validations.ts) L1025–1030):** `session_id`, `modulo_slug`, `opcao_id`, `tempo_ms?`

**Resposta atual (ambas):** `{ success, acertou, opcao_correta_id }` (+ progresso no simulado).

### 1.5 Campos descartados hoje

| Superfície | Campo | Destino |
|------------|-------|---------|
| `registrar-tentativa` | `opcao_id` | Só cálculo de `acertou`; **não** no histórico |
| Player | tempo, convicção, `attempt_id` | Não enviados |
| Simulado | `tempo_ms` | `simulado_respostas` apenas |
| Conclusão estudo | consumo de slides | Não gera tentativa |

### 1.6 Comportamento de replay

- **Player:** reabrir questão já respondida → nova confirmação → `UPDATE` em `historico_questoes` + novo `created_at`.
- **Event stream (spec §1.2.1):** cada confirmação humana bem-sucedida = **novo** `attempt_id` + novo `INSERT` append-only — **independente** de `isReplay`.
- **Retry técnico:** mesmo `attempt_id` → idempotência (sem segundo evento).

### 1.7 Comportamento do simulado

**Runner:** [`components/simulados/SimuladoRunnerClient.tsx`](../components/simulados/SimuladoRunnerClient.tsx) — **existente**

| Aspecto | Treino | Prova |
|---------|--------|-------|
| Re-resposta | Permitida (`UPDATE` em `simulado_respostas`) | `409` se já respondida |
| `tempo_ms` | `Date.now() - questionStartedAt` no confirmar | Idem |
| Feedback imediato | Sim (treino) | Não — gabarito no resumo |

**Derivação de contexto (spec §1.7):** [`resolveSimuladoSessionKind`](../lib/simulado/sessionKind.ts) + [`isDiagnosticoSessionFiltros`](../lib/simulado/diagnosticoConstants.ts) → `diagnostic` ou `simulation`.

### 1.8 Pontos reais de integração (Fase 1)

| Ponto | Arquivo | Momento |
|-------|---------|---------|
| Geração `attempt_id` | Player + SimuladoRunner | No clique Confirmar, **antes** do fetch |
| Ingestão server-side | Rotas de tentativa | Após persistência HQ (e SR no simulado) |
| `question_version` | Helper servidor | Hash de `conteudo_json` já carregado na rota |
| Reconciliação | Runner/job proposto | `reconcile:evidence-events` |

### 1.9–1.12

Schema `historico_questoes`, auth (`getUserAndClientFromBearer`, `createServerSupabase`), testes existentes e alterações preexistentes de cadernos — conforme inspeção original; sem mudança de fato.

---

## 2. Princípios invariantes da implementação

1. Cada confirmação humana nova gera novo `attempt_id` e novo evento.
2. Retry técnico reutiliza o `attempt_id`.
3. `UPDATE` no histórico não significa replay técnico.
4. Event stream nunca recebe `UPDATE`/`DELETE` pedagógico.
5. Falha EE nunca bloqueia o aluno após o histórico persistir.
6. Campos confiáveis são derivados no servidor.
7. Contextos futuros são rejeitados na Fase 1.
8. Nenhuma projeção pedagógica é ativada em produção.
9. Convicção não é global antes do RCT-1 (coorte técnica apenas).
10. [`lib/recommendations.ts`](../lib/recommendations.ts), Vitrine, [`lib/cache.ts`](../lib/cache.ts) e entitlements permanecem inalterados.

---

## 3. Correções menores absorvidas como requisitos

### 3.1 `attempt_id` ausente ou inválido

Métrica canônica: `evidence_attempt_id_invalid_total{route,reason}` (`missing`, `malformed`, `wrong_version`).

### 3.2 Default `conviction = unknown` e `answer_change_count = 0`

### 3.3 Campos EE com soft-skip — não quebram Zod legado nem HTTP 200

---

## 4. Mapa de artefatos

Classificação: **existente** | **proposto** | **a confirmar durante a implementação**

| Área | Caminhos principais |
|------|---------------------|
| Persistência | `supabase/migrations/<timestamp>_evidence_attempt_events.sql` (**proposto**); `evidence_ingest_outbox` (**a confirmar** — gate separado se adotado) |
| `lib/evidence/*` | **proposto** — tipos, `questionVersion`, `idempotency`, `responseTime`, `ingestAttemptEvent`, `deriveContext`, `isInternalCohort`, `metrics`, `replayProjection` |
| Rotas | `registrar-tentativa`, `simulado/responder` (**existentes**, hook EE nos Lotes 5–6) |
| Cliente | `AvantLessonPlayer`, `SimuladoRunnerClient` (**existentes**); `ConvictionSelector` (**proposto**) |
| Jobs | `scripts/reconcile-evidence-events.ts` + `npm run reconcile:evidence-events` (**propostos**) |
| Ops | `artifacts/evidence-fase1-operational-plan.md` (**proposto**) |

**Fora do mapa:** `lib/recommendations.ts`, `lib/cache.ts`, `proxy.ts`, vitrine adaptativa, domínio/T1/RCT.

---

## 5. Recuperação operacional obrigatória versus outbox opcional

### 5.1 Recuperação operacional — **obrigatória** na Fase 1

A spec (§1.10, §1.14, ADR §27) exige que tentativas com histórico persistido e stream falho sejam **mensuradas e recuperadas na medida do possível**. Isso **não** é opcional.

Mecanismo normativo aprovado (independente de outbox físico):

| Componente | Obrigatoriedade |
|------------|-----------------|
| Runner/job `reconcile:evidence-events` | **Obrigatório** antes de expandir coorte (Lote 9) |
| Métricas de gap e unresolved | **Obrigatório** — inclui `evidence_reconcile_unresolved_after_job_total` |
| Relatório de gaps (stdout/artefato) | **Obrigatório** em cada execução do runner |
| Limiar de `unresolved_after_job` | **Pré-registrado** em `artifacts/evidence-fase1-operational-plan.md` (spec §1.16) |
| Bloqueio de expansão de coorte | **Obrigatório** se limiar excedido — não avançar Lote 11 sem critério de saída §20 |

**Log volátil sozinho (`logger.warn`) nunca satisfaz** recuperação nem critério de saída da Fase 1. Logs estruturados complementam métricas; não substituem reconciliação nem contagem de unresolved.

**Sem outbox físico:** gaps que não possam ser reconstruídos com metadados recuperáveis permanecem **explicitamente unresolved**, incrementam `evidence_reconcile_unresolved_after_job_total` e entram no relatório. **Proibido** inventar `selected_alternative`, `correct`, `conviction`, tempo ou `question_version` ausentes.

**Não há recuperação perfeita:** backfill parcial (`source = reconcile_backfill`) é fidelidade limitada; **não** entra em experimentos, calibrações ou RCT futuros (ADR §15 elegibilidade).

### 5.2 Outbox físico — implementação **proposta**, não requisito ADR/spec

Tabela `evidence_ingest_outbox` + worker são **uma alternativa** para captura durável imediata pós-HQ quando insert inline falha. **Não** substitui o job de reconciliação nem as métricas obrigatórias.

| Se adotado | Se não adotado |
|------------|----------------|
| Migration de outbox em **gate separado** (não no Lote 2) | Reconciliação batch + métricas unresolved cobrem o requisito normativo |
| Worker/runner dedicado (**proposto**) | Gaps não reconstruíveis → unresolved explícito |
| `evidence_outbox_backlog_total` (**proposto**) | Sem dependência de fila durável inline |

### 5.3 Runner de reconciliação e agendamento

| Item | Status |
|------|--------|
| `scripts/reconcile-evidence-events.ts` | **proposto** |
| `npm run reconcile:evidence-events` | **proposto** (adicionar em `package.json` no Lote 9) |
| Mecanismo de agendamento (cron, CI scheduled, manual ops) | **decisão futura** — documentar no artefato operacional |
| Rollback | Desativa runner configurado **se** implantado; eventos append-only **permanecem** |

---

## 6. Migration, DDL, RLS e grants (Lote 2)

**Arquivo proposto:**

```text
supabase/migrations/<timestamp>_evidence_attempt_events.sql
```

**Zona vermelha** — revisão humana obrigatória pré-merge ([`docs/SECURITY_ENG_AVANT.md`](SECURITY_ENG_AVANT.md)).

### 6.1 Checklist de revisão humana (obrigatório)

| Item | Requisito |
|------|-----------|
| `attempt_id` | `uuid NOT NULL` |
| Unicidade | `CREATE UNIQUE INDEX ... ON (attempt_id) WHERE event_type = 'attempt'` (partial unique; spec §1.1) |
| `event_type` | `CHECK` — Fase 1: `'attempt'` (+ reservado `'transfer_inventory_missing'` se coluna genérica) |
| `conviction` | `CHECK` — `chute`, `entre_duas`, `certeza`, `unknown` |
| `context` | `CHECK` — subset Fase 1: `regular_practice`, `diagnostic`, `simulation` |
| `response_time_status` | `CHECK` — `valid`, `invalid`, `unknown` |
| `answer_change_count` | `NOT NULL DEFAULT 0`, `>= 0` |
| Timestamps | `started_at`, `answered_at`, `created_at` como `timestamptz` UTC |
| `question_version` | `text NOT NULL` — fingerprint SHA-256 64 hex (spec §1.8) |
| `source` | `text NOT NULL` — lineage: `api_registrar_tentativa`, `api_simulado_responder`, `reconcile_backfill` |
| Índices de reconciliação | `(user_id, created_at DESC)`, `(question_id, created_at DESC)`, `(user_id, question_id)`, `(session_id)` quando não nulo |
| Política de retenção | **A confirmar** na revisão humana — documentar no artefato operacional; rollback **não** apaga eventos |
| GRANTs | Service role (API + runner); authenticated via RLS para SELECT próprio |
| RLS | `auth.uid() = user_id` equivalente a `historico_questoes` |
| Escrita pedagógica | **Proibido** `UPDATE`/`DELETE` operacional na tabela de eventos |
| Rollback | Desligar flag/rotas; **não** `DELETE` eventos já gravados |

### 6.2 Migration de outbox (se adotada)

- **Proposta** — PR e revisão humana **separados** do Lote 2.
- Não bloqueia saída da Fase 1 se não adotada.

---

## 7. Dual write não bloqueante

Ordem normativa (spec §1.14):

```text
1. Validar tentativa legado (auth, entitlement, opcao_id, gabarito)
2. Persistir historico_questoes (e simulado_respostas no simulado)
3. Se EE_V1_INSTRUMENTATION && tentativa OK:
     a. Montar evento (campos confiáveis no servidor)
     b. INSERT evidence_attempt_events (idempotente por attempt_id)
     c. Falha inline → log estruturado + métrica; gap entra na reconciliação (§5)
     d. NÃO alterar status HTTP da tentativa
4. Responder HTTP 200 + gabarito (+ evidence hint opcional; conflito → skipped, não 409 EE)
```

**D5 preservado:** conflito EE → HTTP 200 + `evidence_event_conflict_total` + evento intocado. `409` do simulado (prova/sessão) permanece independente.

---

## 8. Template obrigatório por lote

Cada lote abaixo usa **exatamente** estes campos. Limites numéricos referenciam `artifacts/evidence-fase1-operational-plan.md` — **não** usar “estável” ou “aceitável” sem apontar para limiar pré-registrado.

| Campo | Conteúdo |
|-------|----------|
| Objetivo | Resultado único do lote |
| Dependências | Lotes/gates anteriores |
| Arquivos permitidos | Caminhos existentes/propostos |
| Fora do lote | Alterações proibidas |
| Mudanças planejadas | Escopo objetivo |
| Testes obrigatórios | Unidade/integração/regressão |
| Gates/comandos | Scripts reais ou marcados **propostos** |
| Critério de entrada | Condições antes de começar |
| Critério de saída | Evidências verificáveis |
| Rollback | Como desativar sem apagar evidência |
| Revisão humana | Obrigatória ou não, com motivo |

---

## 9. Sequência de entrega — Lotes 0–11

Um lote = um PR (salvo Lote 0 documental). **Nenhum PR mistura migration, rota e player.**

### Lote 0 — Baseline e isolamento

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | Congelar baseline do repo e estratégia de isolamento antes de qualquer código EE |
| **Dependências** | Aprovação humana deste plano + ADR + spec |
| **Arquivos permitidos** | Este plano; leitura de `docs/`, `package.json`, testes existentes — **sem** código EE |
| **Fora do lote** | Migration, `lib/evidence/*`, rotas, player, env, rollout |
| **Mudanças planejadas** | Registrar git status; mapa §4; gates: `npm run typecheck`, `npm test`, `npm run check:architecture` (**existentes**); listar alterações preexistentes não-EE |
| **Testes obrigatórios** | Suite baseline verde (`npm test`) |
| **Gates/comandos** | `npm run check:ship` (**existente**) como referência de barra do repo |
| **Critério de entrada** | Plano + ADR + spec aprovados para planejamento |
| **Critério de saída** | Baseline documentado; isolamento por flag `false` definido; nenhum arquivo EE criado |
| **Rollback** | N/A (sem código) |
| **Revisão humana** | **Obrigatória** — aprovação do plano |

---

### Lote 1 — Contratos puros e testes unitários

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | Contratos do evento + fingerprint/idempotência + `question_version` testáveis **sem** migration nem rotas |
| **Dependências** | Lote 0 concluído |
| **Arquivos permitidos** | `lib/evidence/types.ts`, `parseClientFields.ts`, `idempotency.ts`, `questionVersion.ts`, `responseTime.ts`, `deriveContext.ts` (stubs), `__tests__/lib/evidence/**` — **propostos** |
| **Fora do lote** | Migration, `lib/env.ts`, rotas, player, ingestão DB, rollout |
| **Mudanças planejadas** | Tipos (`event_type`, conviction enum, contexts ativos/reservados); parser tolerante campos EE; fingerprint = conjunto semântico spec §1.3.1; `attempt_id` UUID v4; derivação **conceitual** de campos confiáveis; `question_version` canonical_json + SHA-256; regras `responseTime` (monotonic, visibility, abandono sem evento) |
| **Testes obrigatórios** | Fixtures JSON: idempotência equivalente vs conflito; `question_version` estável e sensível a edição; Unicode NFC; `null`/ausente em meta; contexts reservados rejeitados no parser |
| **Gates/comandos** | `npm run typecheck`; `npm test -- __tests__/lib/evidence` |
| **Critério de entrada** | Lote 0 aprovado |
| **Critério de saída** | Testes unitários verdes; contratos congelados em código sem dependência de Supabase |
| **Rollback** | Reverter PR; zero impacto em produção |
| **Revisão humana** | Recomendada (contratos normativos) |

**Primeiro lote técnico seguro.**

---

### Lote 2 — Migration, índices, RLS e grants

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | DDL `evidence_attempt_events` conforme §6 — append-only, índices, RLS, grants |
| **Dependências** | Lote 1 aprovado e verde |
| **Arquivos permitidos** | `supabase/migrations/<timestamp>_evidence_attempt_events.sql` (**proposto**) |
| **Fora do lote** | `lib/env.ts`, rotas, player, `ingestAttemptEvent` com DB real, rollout |
| **Mudanças planejadas** | Tabela + CHECK constraints + partial UNIQUE + índices §6.1 |
| **Testes obrigatórios** | Revisão SQL manual; smoke local `supabase db` se disponível — **a confirmar** no PR |
| **Gates/comandos** | Revisão humana SQL; `npm run typecheck` (se tipos gerados — **a confirmar**) |
| **Critério de entrada** | Lote 1 verde; checklist §6.1 preenchido no PR |
| **Critério de saída** | Migration revisada; políticas RLS e grants documentados no PR |
| **Rollback** | Tabela vazia permanece; drop só com aprovação explícita; eventos nunca apagados em rollback operacional |
| **Revisão humana** | **Obrigatória** — zona vermelha |

---

### Lote 3 — Configuração e flag de instrumentação

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | `EE_V1_INSTRUMENTATION` e allowlist — default **false**; sem UI |
| **Dependências** | Lote 2 mergeado (tabela existe) |
| **Arquivos permitidos** | `lib/env.ts`, `scripts/validate-env.ts` (se necessário), testes env — **existentes** + extensão |
| **Fora do lote** | Rotas, player, ingestão ativa, convicção UI |
| **Mudanças planejadas** | `EE_V1_INSTRUMENTATION`, `EE_V1_INTERNAL_EMAILS`; validação Zod; escopo por ambiente documentado no PR |
| **Testes obrigatórios** | `npm run validate:env`; teste unitário default `false` |
| **Gates/comandos** | `npm run validate:env`; `npm run typecheck` |
| **Critério de entrada** | Lote 2 em staging/prod schema aplicável |
| **Critério de saída** | Flag desligada em todos os ambientes; nenhum comportamento EE ativo |
| **Rollback** | Remover vars ou manter `false` |
| **Revisão humana** | **Obrigatória** — zona vermelha (`lib/env.ts`) |

---

### Lote 4 — Núcleo server-side de ingestão

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | Núcleo `ingestAttemptEvent` completo — **sem** integrar rotas públicas |
| **Dependências** | Lotes 1–3 verdes |
| **Arquivos permitidos** | `lib/evidence/ingestAttemptEvent.ts`, `isInternalCohort.ts`, `metrics.ts`, `deriveContext.ts`, testes integração com DB mock ou test container — **propostos** |
| **Fora do lote** | `app/api/registrar-tentativa`, `app/api/simulado/responder`, player, simulado UI |
| **Mudanças planejadas** | Canonicalização server-side; fingerprint semântico; insert + idempotent replay + conflict (D5); soft-skip §3; **`is_internal` derivado no servidor**; **`context` derivado**; métricas incl. `evidence_attempt_id_invalid_total`; interface/hook para reconciliação futura |
| **Testes obrigatórios** | Unit + integração mock: idempotência, conflito sem overwrite, soft-skip, `is_internal` não forjável, context ignorado do body |
| **Gates/comandos** | `npm test -- __tests__/lib/evidence`; `npm run check:architecture` |
| **Critério de entrada** | Lote 3 com flag `false`; contratos Lote 1 estáveis |
| **Critério de saída** | Núcleo testado isoladamente; nenhuma rota pública chama ingestão ainda |
| **Rollback** | Flag `false`; módulo não importado pelas rotas |
| **Revisão humana** | Recomendada (lógica de conflito e soft-skip) |

---

### Lote 5 — Integração `registrar-tentativa`

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | Dual write em prática regular (`regular_practice`) preservando fluxo legado |
| **Dependências** | Lote 4 mergeado |
| **Arquivos permitidos** | `app/api/registrar-tentativa/route.ts`, `lib/validations.ts` (schema permissivo EE), `__tests__/api/registrar-tentativa*.test.ts` |
| **Fora do lote** | Simulado, player, convicção UI, migration, rollout ampliado |
| **Mudanças planejadas** | Hook pós-HQ → `ingestAttemptEvent`; replay histórico UPDATE → **novo** evento; D5; resposta opcional `evidence: { created \| skipped }` |
| **Testes obrigatórios** | Idempotência; conflito 200; replay UPDATE; HQ OK + stream falha → 200; `attempt_id` inválido → soft-skip; regressão suite existente |
| **Gates/comandos** | `npm test -- __tests__/api/registrar-tentativa`; `npm run check:architecture` |
| **Critério de entrada** | Lote 4 verde; flag ainda `false` em prod |
| **Critério de saída** | Testes API verdes com flag on **apenas em teste**; prod inalterada com flag `false` |
| **Rollback** | Flag `false`; reverter hook |
| **Revisão humana** | **Obrigatória** — zona amarela (Bugbot + Security Review) |

---

### Lote 6 — Integração `simulado/responder`

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | Dual write no simulado com `diagnostic` / `simulation` derivados no servidor |
| **Dependências** | Lote 5 mergeado |
| **Arquivos permitidos** | `app/api/simulado/responder/route.ts`, `__tests__/api/simulado-responder*.test.ts` |
| **Fora do lote** | Player, convicção UI, T1, alteração regras 409 prova |
| **Mudanças planejadas** | Hook pós-SR+HQ; `session_id` validado; ownership `session.user_id === auth.user`; treino/prova preservados; `tempo_ms` existente reaproveitado |
| **Testes obrigatórios** | 409 prova; re-resposta treino → novo evento; context derivado; regressão suite existente |
| **Gates/comandos** | `npm test -- __tests__/api/simulado-responder` |
| **Critério de entrada** | Lote 5 verde |
| **Critério de saída** | Testes simulado verdes; flag prod ainda `false` |
| **Rollback** | Flag `false`; reverter hook |
| **Revisão humana** | **Obrigatória** — zona amarela |

---

### Lote 7 — Instrumentação passiva do player e simulado

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | Metadados EE no cliente **sem** UI de convicção |
| **Dependências** | Lotes 5–6 mergeados (rotas aceitam body estendido) |
| **Arquivos permitidos** | `AvantLessonPlayer.tsx`, `SimuladoRunnerClient.tsx`, `lib/simulado/client.ts`, testes componente |
| **Fora do lote** | `ConvictionSelector`, rollout ampliado, T1 |
| **Mudanças planejadas** | `attempt_id` por confirmação humana; retry reutiliza mesmo id; `confirmandoResposta` + ref anti-duplo clique; timer monotônico; Page Visibility / background → `response_time_status` invalid/unknown; reload reseta `started_at`; abandono sem evento; `answer_change_count`; `started_at`/`answered_at` (pré-convicção: `unknown` conviction); payload EE só quando flag on |
| **Testes obrigatórios** | Componente: envio metadados; retry mesmo `attempt_id`; flag off → body legado |
| **Gates/comandos** | `npm test -- AvantLessonPlayer`; `npm test -- SimuladoRunner` |
| **Critério de entrada** | Rotas Lotes 5–6 em staging |
| **Critério de saída** | Cliente envia campos quando flag on; flag off sem regressão visual/comportamental |
| **Rollback** | Flag `false`; cliente ignora campos EE |
| **Revisão humana** | Recomendada — zona amarela |

---

### Lote 8 — Convicção e coorte autorizada

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | UI convicção **somente** coorte/flag; `answered_at` **após** escolha |
| **Dependências** | Lote 7 mergeado |
| **Arquivos permitidos** | `components/evidence/ConvictionSelector.tsx` (**proposto**), `AvantLessonPlayer.tsx`, `SimuladoRunnerClient.tsx` (coorte apenas) |
| **Fora do lote** | Ativação global; `recommendations.ts`; CTA T1; rollout além de allowlist |
| **Mudanças planejadas** | Três botões; render só allowlist; fluxo: convicção → `answered_at` → POST; `conviction=unknown` fora da coorte ou falha UI |
| **Testes obrigatórios** | Coorte vê UI; base não vê; `answered_at` posterior à convicção; servidor persiste enum correto |
| **Gates/comandos** | `npm test` escopo player/simulado |
| **Critério de entrada** | Lote 7 verde; allowlist configurada em staging |
| **Critério de saída** | Convicção restrita validada manualmente em coorte interna |
| **Rollback** | Flag `false` ou remover allowlist |
| **Revisão humana** | **Obrigatória** — UX + coorte |

---

### Lote 9 — Reconciliação e replay em teste

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | Runner de reconciliação + projeção descartável só em CI |
| **Dependências** | Lotes 5–7 (fontes HQ, SR, `attempt_id` no body) |
| **Arquivos permitidos** | `scripts/reconcile-evidence-events.ts`, `lib/evidence/replayProjection.ts`, `package.json` script, `__tests__/lib/evidence/replayProjection.test.ts`, `__tests__/scripts/reconcile-evidence-events.test.ts` — **propostos** |
| **Fora do lote** | Correção silenciosa de eventos; UPDATE/DELETE; inventar campos ausentes |
| **Mudanças planejadas** | Pareamento: `attempt_id` > secundário; gaps HQ sem evento; evento sem HQ (relatório); outbox pendente se existir; mismatch → `evidence_reconcile_outcome_mismatch_total`; `evidence_reconcile_unresolved_after_job_total`; backfill `source=reconcile_backfill` só com metadados recuperáveis; reducer determinístico em teste |
| **Testes obrigatórios** | Fixtures reconcile; unresolved quando metadados insuficientes; replay projection determinístico; sem wire em produto |
| **Gates/comandos** | `npm run reconcile:evidence-events -- --dry-run` (**proposto**); `npm test` |
| **Critério de entrada** | Ingestão ativa em staging com flag on |
| **Critério de saída** | Dry-run gera relatório; unresolved contabilizado; limiar operacional **ainda** definido no artefato §22 |
| **Rollback** | Não executar runner; desativar agendamento se configurado |
| **Revisão humana** | **Obrigatória** — lógica de backfill e não-invenção |

---

### Lote 10 — Observabilidade operacional

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | Emissão e agregação de métricas compatível com infra **real** do repo |
| **Dependências** | Lote 4+ (métricas no núcleo); Lote 9 (métricas reconcile) |
| **Arquivos permitidos** | `lib/evidence/metrics.ts`, [`lib/logger.ts`](../lib/logger.ts) (**existente**), consultas/dashboard ops — **propostos** |
| **Fora do lote** | Prometheus/fornecedor inexistente; alterar `lib/metrics.ts` de cache sem necessidade |
| **Mudanças planejadas** | Logs estruturados + contadores em `lib/evidence/metrics.ts`; agregação via logger/export ops existente; baseline pré-rollout; alertas documentados no artefato operacional |
| **Testes obrigatórios** | Unit: incremento por cenário; não regressão logger |
| **Gates/comandos** | `npm test`; revisão ops |
| **Critério de entrada** | Lista completa de métricas spec §1.12 + §3.1 implementada |
| **Critério de saída** | Todas as métricas abaixo com ponto de emissão documentado |
| **Rollback** | Desativar export; núcleo continua logando |
| **Revisão humana** | Recomendada — ops |

**Métricas obrigatórias (spec + plano):**

| Métrica | Emissão |
|---------|---------|
| `evidence_event_ingest_total{context,source,status}` | Núcleo ingestão |
| `evidence_event_idempotent_replay_total` | Idempotência |
| `evidence_event_conflict_total` | Conflito D5 |
| `evidence_attempt_id_invalid_total{route,reason}` | Soft-skip |
| `evidence_event_context_rejected_total` | Body context forjado |
| `evidence_event_question_version_failed_total` | Fingerprint falhou |
| `evidence_event_conviction_unknown_rate` | Agregação pós-rollout |
| `evidence_event_response_time_invalid_rate` | `responseTime.ts` |
| `evidence_event_ingest_latency_ms` | Latência ingestão |
| `evidence_reconcile_gap_total` | Runner Lote 9 |
| `evidence_reconcile_outcome_mismatch_total` | Runner Lote 9 |
| `evidence_reconcile_unresolved_after_job_total` | **Obrigatório** — runner Lote 9 |
| `evidence_outbox_backlog_total` | **Proposto** — só se outbox adotado |

---

### Lote 11 — Rollout interno e coorte técnica

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | Piloto restrito; declarar prontidão por nível (§21); **não** rollout global |
| **Dependências** | Lotes 9–10; `artifacts/evidence-fase1-operational-plan.md` aprovado com limiares |
| **Arquivos permitidos** | Config deploy/env por ambiente; documentação ops — **sem** código de domínio/T1 |
| **Fora do lote** | 100% base; convicção global; RCT; alterar `recommendations.ts` / vitrine |
| **Mudanças planejadas** | Sequência: equipe interna → usuários teste → pequena coorte técnica; flag on por ambiente; observação 7–14 dias; bloqueio se `unresolved_after_job` > limiar pré-registrado |
| **Testes obrigatórios** | Smoke manual coorte; `npm run check:ship` antes de declarar saída |
| **Gates/comandos** | `npm run check:ship`; checklist §20 |
| **Critério de entrada** | Runner reconcile validado; limiares aprovados no artefato operacional |
| **Critério de saída** | Critérios §20 satisfeitos; **não autorizado globalmente** |
| **Rollback** | `EE_V1_INSTRUMENTATION=false`; desativar runner se configurado; eventos preservados |
| **Revisão humana** | **Obrigatória** — go/no-go produto |

---

## 10. Ordem de PRs (sem mistura migration + rota + player)

| PR | Lote | Conteúdo |
|----|------|----------|
| 1 | 1 | Contratos puros + testes unitários |
| 2 | 2 | Migration / RLS / grants |
| 3 | 3 | Env / flag |
| 4 | 4 | Núcleo de ingestão |
| 5 | 5 | `registrar-tentativa` |
| 6 | 6 | `simulado/responder` |
| 7 | 7 | Instrumentação passiva player + simulado |
| 8 | 8 | UI convicção (coorte) |
| 9 | 9 | Reconciliação + replay em teste |
| 10 | 10 | Observabilidade operacional |
| 11 | 11 | Rollout interno / coorte técnica |

**Proibido:** combinar migration + rota + player no mesmo PR. Outbox = PR adicional separado se adotado.

---

## 11. `question_version` (fingerprint avaliativo)

Implementação em `lib/evidence/questionVersion.ts` (Lote 1; uso no núcleo Lote 4):

```text
sha256_hex(canonical_json({
  modulo_slug,
  instruction,
  options sorted by id: { id, text, is_correct },
  meta: { content_standard, family, pedagogical_branch }  // ausentes → null
}))
```

| Regra | Detalhe |
|-------|---------|
| Exclusões | Slides, figuras, `header_line`, UI meta |
| Ordenação | Chaves lexicográficas; options por `id` |
| Unicode | UTF-8 NFC |
| Cálculo | **Somente servidor** |
| Falha | `evidence_event_question_version_failed_total`; soft-skip evento; HQ OK |

**Gate humano:** alteração da função canônica exige revisão do PR + testes fixture (não improvisar no rollout).

---

## 12. Critérios de prontidão por nível

| Nível | Significa | Quando |
|-------|-----------|--------|
| Pronto para merge técnico | PR do lote passa testes/gates daquele lote | Cada PR |
| Pronto para coorte interna | Lotes 1–10 verdes; flag on staging; runner reconcile executado | Antes Lote 11 fase interna |
| Pronto para coorte técnica (convicção) | Coorte interna + Lote 8; métricas dentro dos limiares do artefato operacional | Piloto convicção |
| Não autorizado globalmente | Instrumentação/convicção para 100% da base | Até RCT-1 (ADR §18) — **permanece nesta Fase 1** |

---

## 13. Estratégia de testes (matriz consolidada)

| Cenário | Tipo | Lote |
|---------|------|------|
| Contratos / fingerprint / question_version | unit | 1 |
| Idempotência / conflito / soft-skip | unit + integração | 4 |
| Idempotência / replay UPDATE / dual-write parcial | API | 5–6 |
| Concorrência mesmo `attempt_id` | API | 5–6 |
| `attempt_id` inválido | API | 5 |
| Auth / 401/403 legado (não soft-skip) | API | 5–6 |
| RLS / ownership | integração | 4–6 |
| Campos forjados (`context`, `is_internal`) | API | 4–6 |
| Timer / visibility / background | unit | 1, 7 |
| Convicção coorte / `answered_at` ordem | component | 8 |
| Reconciliação / unresolved / sem invenção | script | 9 |
| Replay projection determinístico | unit | 9 |
| Outbox (se adotado) | integração | gate separado |
| HTTP falho após stream OK | API | 5 |
| `recommendations.test.ts` inalterado | regressão | todos |
| Não regressão player | component | 7 |

**Gates existentes:** `npm run typecheck`, `npm test`, `npm run check:architecture`, `npm run validate:env`, `npm run check:ship`.

---

## 14. Replay somente em teste

`lib/evidence/replayProjection.ts` — **proposto**; import **proibido** em `app/`, `components/` de produção. Objetivo ADR §27 item 9.

---

## 15. Rollback global

| Ação | Efeito |
|------|--------|
| `EE_V1_INSTRUMENTATION=false` | Para ingestão + UI convicção |
| Revert PR por lote | Escopo isolado conforme tabela §10 |
| Runner reconcile | Desativar agendamento **se** implantado |
| Eventos gravados | **Permanecem** |
| `historico_questoes` | Inalterado |
| Vitrine / cache / entitlements | Inalterados |

---

## 16. Revisão humana e zonas de risco

| Área | Zona | Lote |
|------|------|------|
| Migration + RLS + grants | vermelha | 2 |
| `lib/env.ts` | vermelha | 3 |
| Núcleo ingestão / conflito | amarela | 4 |
| Rotas tentativa | amarela | 5–6 |
| Player / simulado | amarela | 7–8 |
| Runner reconcile / backfill | amarela | 9 |
| Outbox/worker (se adotado) | vermelha/amarela | gate separado |

Nenhum gate humano é auto-aprovado.

---

## 17. Fora do escopo (reafirmação)

`learner_skill_state`, domínio, misconceptions, `skill_id`/`evidence_ready` funcional, T1, `measurement_pool`, RCT, FSRS, `recommendations.ts`, Vitrine adaptativa, bandit, LLM runtime, rota dedicada EE, `transfer_inventory_missing` em produção.

---

## 18. Próximo passo humano

1. Aprovar esta revisão do plano + ADR + spec.
2. Abrir **PR 1** (Lote 1 — contratos puros + testes) — **não** migration primeiro.
3. Sequência §10 até PR 11.
4. Publicar e aprovar `artifacts/evidence-fase1-operational-plan.md` com limiares (incl. `unresolved_after_job`) **antes** de expandir coorte no Lote 11.
5. Checklist §20 → declarar saída Fase 1.

**Este documento não autoriza ship em produção global.**

---

## 19. Critérios de saída da Fase 1

Declarar **somente** após Lote 11 e artefato operacional aprovado. Todos os limiares numéricos vêm do artefato — não deste plano.

| # | Critério | Verificação |
|---|----------|-------------|
| 1 | Um evento canônico por `attempt_id`; nova confirmação → novo evento mesmo com HQ UPDATE | Teste + índice único |
| 2 | Reconciliação automatizada; gaps monitorados; `evidence_reconcile_unresolved_after_job_total` dentro do limiar pré-registrado | Runner + artefato ops |
| 3 | `context` ∈ {`regular_practice`, `diagnostic`, `simulation`} | Auditoria SQL |
| 4 | `question_version` NOT NULL em todos os eventos | Constraint + testes |
| 5 | Tempo válido ou `invalid`/`unknown` | Métrica |
| 6 | Taxa `conviction=unknown` monitorada | Métrica + artefato |
| 7 | Falha EE não bloqueia player | Teste |
| 8 | `is_internal` excluído de métricas populacionais | Filtro queries |
| 9 | Replay em teste reproduz projeção sem produto | Suite Lote 9 |
| 10 | Recuperação operacional obrigatória executada — log volátil não usado como único mecanismo | Runner + relatório gaps |

---

## 20. Git status — fim desta revisão

A registrar após edição: deve coincidir com o status do § Git status — início desta revisão, **sem novos arquivos** além deste plano já untracked.

```text
(nenhuma alteração adicional esperada nesta tarefa)
```

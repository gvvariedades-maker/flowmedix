# R2 — Persistência FSRS MVP (especificação operacional)

**Data:** 2026-07-27  
**Status:** spec endurecida — **aguarda revisão independente**; R2 **não** autorizado; R3 **bloqueado**

Use em **conversa nova** (Agent mode), após autorização explícita do mantenedor:

```text
R2 persistência FSRS: migration + camada server-only (sem UI, sem rotas, sem R3)
```

Anexos obrigatórios:

```text
@docs/DECISAO_REVISAO_FSRS_MVP.md
@docs/PLANO_IMPLEMENTACAO_REVISAO_FSRS_MVP.md
@docs/R2_PERSISTENCIA_FSRS_MVP_CONVERSA.md
@lib/fsrs/README.md
@lib/fsrs/types.ts
@lib/fsrs/cardState.ts
@lib/evidence/persistenceTypes.ts
@lib/evidence/supabasePersistence.ts
```

> Os dois arquivos de `lib/evidence/**` são anexados **apenas como referência estrutural** (formato de outcomes, injeção de cliente). O R2 **não pode importar** nada de `lib/evidence/**` — inclusive helpers de hash usados pelo fingerprint (§5.5).

**ADR normativo:** [`DECISAO_REVISAO_FSRS_MVP.md`](DECISAO_REVISAO_FSRS_MVP.md) (prevalece em conflito).  
**Plano irmão:** [`PLANO_IMPLEMENTACAO_REVISAO_FSRS_MVP.md`](PLANO_IMPLEMENTACAO_REVISAO_FSRS_MVP.md).  
**Contratos R1 (mergeados):** `lib/fsrs/**` — **não alterar semântica** salvo bugfix documentado com novo ADR.  
**Ship:** R2 **não** habilita produto; **não** autoriza R3.

> **Invariante mestre do R2 (não negociável):** a persistência de uma revisão FSRS ocorre em **uma única transação PostgreSQL**, dentro de **uma única RPC** (`fsrs_persist_review`). Ou log **e** card são gravados juntos, ou **nada** é gravado. Ver [§4](#4-rpc-transacional-fsrs_persist_review) e [§6](#6-atomicidade-concorrência-e-gate-de-bypass).

---

## 0. Estado de entrada (verificado em `main`)

| Item | Estado |
|------|--------|
| R1 | **Mergeado** — PR #57, head `fa259ebb`, merge `88ad56f7`, ancestral de `origin/main` |
| Pin | **`ts-fsrs@5.4.1`** instalado (`package.json` + lock); constante `FSRS_MVP_PACKAGE_VERSION` em `lib/fsrs/defaults.ts` |
| Pacote | `lib/fsrs/`: `adapter.ts`, `cardState.ts`, `defaults.ts`, `eligibility.ts`, `rating.ts`, `reviewUnit.ts`, `types.ts`, `index.ts` |
| Serialização | `FsrsMvpSerializedCard` versionado (`schemaVersion: 1`) — pronto para jsonb, **sem** migration ainda |
| EE | Intocado; `lib/evidence/**` permanece paralelo; flags default off |
| SM-2 legado | `lib/spaced-repetition.ts` intocado neste lote |
| Banco | **Nenhuma** tabela FSRS existe ainda |

**Pré-requisito de autorização:** mensagem explícita do mantenedor (`pode iniciar R2`). Esta spec **não** substitui essa aprovação.

### 0.1 Contratos R1 que o R2 consome (não redefinir)

Fonte: `lib/fsrs/types.ts` e `lib/fsrs/cardState.ts`. O R2 **usa** estes contratos; **não** os reescreve.

| Contrato | Forma real |
|----------|------------|
| `FsrsAttemptContext` | União fechada de **8** valores (ADR §6). Apenas `cold_practice` e `scheduled_review` são elegíveis; os demais **não** chegam à persistência |
| `isReplay` | **Fora** do contrato (ADR §6.1) — sinal técnico sem semântica pedagógica; **não** é critério de elegibilidade |
| `FsrsMvpRating` | `'again' \| 'good'` — `Hard` adiado, `Easy` proibido (ADR decisões 5–7) |
| `planFsrsRating` / `mapCorrectToRating` | Derivam rating de `isCorrect`; `isCorrect` vem do **servidor** (R3, `resolveQuestionAttempt`) |
| `FsrsMvpCardState` | Estado em memória (camelCase): `due`, `stability`, `difficulty`, `elapsedDays`, `scheduledDays`, `learningSteps`, `reps`, `lapses`, `state`, `lastReview` |
| `FsrsMvpSerializedCard` | Payload persistível = `FsrsMvpCardState` + `schemaVersion: 1` + `algorithm: 'ts-fsrs'` + `algorithmVersion: '5.4.1'`; **propriedades extras desconhecidas são rejeitadas** |
| `serializeFsrsMvpCard` / `deserializeFsrsMvpCard` | Round-trip validado; `deserializeFsrsMvpCard(payload: unknown)` **lança** `FsrsMvpSerializationError` em payload inválido (não retorna resultado) |
| `resolveReviewUnitId` | `fsrs:v1:discipline=<esc>:cluster=<esc>` ou `fsrs:v1:discipline=<esc>:subtopico=<esc>`; NFC + `encodeURIComponent` |
| `FsrsMvpReviewUnitKind` | `'cluster' \| 'subtopico'` |
| `FSRS_MVP_ENABLE_FUZZ` | `false` — determinismo do MVP; testes de concorrência dependem disso |
| Coexistência SM-2 + FSRS | **Proibida** na mesma superfície (ADR §9.4) — R2 não cria superfície alguma |

---

## 1. Objetivo do R2

Entregar **persistência server-side atômica** para cards FSRS e ledger append-only de reviews, **sem** expor superfície de produto:

1. **Uma migration** Supabase: `spaced_review_cards`, `spaced_review_logs` **e** a função `fsrs_persist_review`.
2. **Uma RPC transacional** que executa todo o efeito de uma revisão em uma transação (§4).
3. **Camada TypeScript** em `lib/fsrs/` (tipos + outcomes discriminados + adapter injetável + factory Supabase) que **valida** e **canonicaliza** antes de chamar a RPC.
4. **Gate arquitetural** que impede escrita direta nas tabelas fora do caminho autorizado (§6.5).
5. **Testes** em quatro camadas: unidade TypeScript, RPC real local, concorrência real e smoke RLS (§12).
6. **Zero** alteração em rotas, player, UI, `lib/env.ts` com flag on, ou wiring de tentativa.

O R2 deixa banco e API interna prontos para o R3 chamar a persistência — **sem** chamá-la.

### 1.1 Defeitos que esta spec fecha

| # | Defeito | Correção |
|---|---------|----------|
| B1 | **Lost update** — card lido/escrito sem compare-and-swap | `revision` + CAS obrigatório (§3.1.1); outcome `revision_conflict` |
| B2 | **Card/log não atômicos** — upsert e insert em chamadas separadas; “falha após upsert, antes do log” era **débito aceito** | Transação única via RPC (§4); débito **removido**; card sem log e log sem card **proibidos** |
| B3 | Conflito de `attempt_id` incompleto — só `UNIQUE`, sem distinguir replay idêntico de payload divergente | `semantic_fingerprint` (§7): `duplicate_equivalent` vs `conflict` |
| B4 | Validação insuficiente — casts e confiança no `jsonb` | `deserializeFsrsMvpCard` obrigatório antes do write e após todo read (§10) |
| B5 | Outcomes incompletos | União discriminada de **7** outcomes com `writeStatus` (§5.4) |
| B6 | RLS divergente entre ADR, Plano e spec | Matriz única service-role-first na spec (§11.1), replicada sem divergência no Plano e referenciada pelo ADR §9.5 |
| B7 | Testes insuficientes — só mocks | Camadas A/B/C/D, com RPC real e concorrência real (§12) |
| B8 | **Falha de transporte tratada como “não gravou”** — `persistence_failed` afirmava `wrote: false` mesmo quando a resposta se perdeu **depois** do COMMIT | `writeStatus: 'none' \| 'committed' \| 'unknown'` + outcome `persistence_unknown` (§9) |
| B9 | **Broad catch** em PL/pgSQL podia criar savepoint implícito e permitir commit parcial | Proibição explícita de `EXCEPTION WHEN OTHERS` que converta erro em retorno (§4.6) |
| B10 | **Bypass da RPC** proibido apenas em prosa | Gate estático obrigatório em `scripts/check-architecture-patterns.ts` + teste próprio (§6.5) |
| B11 | Campos denormalizados (`due_at`, `last_review_at`, `scheduled_days`) enviados **em paralelo** ao estado — podiam divergir dele | Derivados do `fsrs_state_after` dentro da RPC (§8) |

---

## 2. Escopo

### 2.1 Dentro do R2

| Entrega | Descrição |
|---------|-----------|
| Migration SQL | DDL + índices + **função `fsrs_persist_review`** + RLS + grants/revokes em **um** arquivo |
| `lib/fsrs/persistenceTypes.ts` | Rows, inputs, união discriminada de outcomes (sem throw em resultado esperado) |
| `lib/fsrs/fingerprint.ts` | Canonicalização determinística + `semantic_fingerprint` (§7); **sem** importar `lib/evidence/**` |
| `lib/fsrs/persistence.ts` | Validação R1, canonicalização, mapeamento do retorno da RPC para outcomes |
| `lib/fsrs/supabasePersistence.ts` | Adapter `import 'server-only'` que chama **apenas** a RPC |
| `lib/fsrs/index.ts` | Re-export **somente** do necessário ao server (sem vazar ao client) |
| `scripts/check-architecture-patterns.ts` | **Nova regra**: escrita direta nas tabelas FSRS fora do módulo autorizado (§6.5) |
| Testes unitários | `__tests__/lib/fsrs/fsrsMvp.persistence.test.ts` |
| Teste do gate | Cobertura da nova regra arquitetural (§6.5) |
| Testes RPC + concorrência | Arquivo/script separado contra banco **local** (§12.B, §12.C) |
| Smoke RLS | `scripts/rls-performance-smoke.ts` monta casos **por tabela, hardcoded** — o R2 **deve** adicionar casos explícitos (§11.3) |
| Tipos DB | `types/database.ts` — **a confirmar** (§13.2); não editar à mão sem confirmar o padrão |

### 2.2 Fora do R2 (proibido no PR)

| Área | Motivo |
|------|--------|
| `app/**` (inclusive `app/api/**`) | R3/R4 |
| `components/**` | R4 |
| `lib/env.ts` + `FSRS_MVP_ENABLED` | R3 |
| Hook em `registrar-tentativa` / `simulado/responder` | R3 |
| Player / `questaoPlayerPayload` | R4 |
| `lib/spaced-repetition.ts` | Legado; cutover R4 |
| `lib/evidence/**` | Trilho paralelo |
| Feature flag default-on | R3+ |
| **Apply de migration em staging/produção** | Fora do PR; exige autorização separada (§14) |
| Deploy | Ops |
| Retry / recompute após `revision_conflict` | R3 |
| Seletor de questões / fila due | R4 |
| Qualquer import de `lib/fsrs` em Client Component | Bundle leak |

**Invariante de PR:** migration (R2) **≠** PR de UI (ADR §20.10; Plano §1).

---

## 3. Modelo de dados (especificação da migration)

> Esta seção é a **spec** para o autor da migration. O trabalho R2 **implementa** o SQL; este documento **não** contém o arquivo migration.

### 3.1 `spaced_review_cards`

Estado **atual** do card por `(user_id, review_unit_id)`.

| Coluna | Tipo | Obrigatório | Regras |
|--------|------|-------------|--------|
| `id` | `uuid` PK | sim | `gen_random_uuid()` default |
| `user_id` | `uuid` FK → `auth.users` | sim | `ON DELETE CASCADE` — ciclo de vida da conta (§11.4) |
| `review_unit_id` | `text` | sim | Formato R1 (`fsrs:v1:…`); ≤ 512 caracteres |
| `review_unit_kind` | `text` | sim | `cluster` \| `subtopico` |
| **`revision`** | **`bigint`** | **sim** | Contador de versão; base do CAS (§3.1.1). `CHECK (revision >= 1)`; primeira persistência grava `1` |
| `fsrs_state` | `jsonb` | sim | `FsrsMvpSerializedCard`; validado no app **e** checado defensivamente no banco (§10.4) |
| `due_at` | `timestamptz` | sim | **Derivado** de `fsrs_state.due` (§8) |
| `last_review_at` | `timestamptz` | não | **Derivado** de `fsrs_state.lastReview`; `null` enquanto nunca revisado |
| `stability` | `double precision` | sim | **Derivado** de `fsrs_state.stability` |
| `difficulty` | `double precision` | sim | **Derivado** de `fsrs_state.difficulty` |
| `reps` | `integer` | sim | **Derivado**; `>= 0` |
| `lapses` | `integer` | sim | **Derivado**; `>= 0` |
| `last_rating` | `text` | não | `again` \| `good` quando não nulo |
| `last_question_id` | `text` | não | `modulo_slug` da última aplicação |
| `last_attempt_id` | `uuid` | não | Último `attempt_id` aplicado com sucesso |
| `created_at` | `timestamptz` | sim | `now()` default |
| `updated_at` | `timestamptz` | sim | `now()` default; atualizado **dentro da RPC** |

**Constraints:**

- `UNIQUE (user_id, review_unit_id)` — sugestão `spaced_review_cards_user_unit_uidx`; **obrigatório** (base do CAS e da criação concorrente)
- `CHECK (revision >= 1)`
- `CHECK (review_unit_kind IN ('cluster','subtopico'))`
- `CHECK (reps >= 0 AND lapses >= 0)`
- `CHECK (last_rating IS NULL OR last_rating IN ('again','good'))`
- `CHECK (jsonb_typeof(fsrs_state) = 'object')`
- `CHECK (review_unit_id <> '' AND length(review_unit_id) <= 512)`
- Defensivo recomendado: `CHECK (review_unit_id LIKE 'fsrs:v1:%')`

**Índices:** `(user_id, due_at)` para a fila due do R4; `(user_id, updated_at DESC)` para ops.

### 3.1.1 Contrato de `revision` (compare-and-swap)

`revision` é o **único** mecanismo de controle de versão do card. **Não existe read-modify-write sem CAS.**

| Situação | `expected_revision` | `fsrs_state_before` | Efeito |
|----------|---------------------|---------------------|--------|
| Card **inexistente** | `null` | `null` | Cria com `revision = 1`; `resulting_revision = 1` |
| Card **existente** | **obrigatório** | **obrigatório** (estado lido e validado) | Atualiza **somente se** `expected_revision = revision` atual **e** `fsrs_state_before` for igual ao `fsrs_state` atual; `resulting_revision = expected_revision + 1` |

Divergência → outcome **`revision_conflict`**, **zero write**:

- `expected_revision` ≠ `revision` atual;
- `expected_revision = null` mas o card **já existe** (perda de corrida na criação);
- `expected_revision` não nulo mas o card **não existe**;
- `fsrs_state_before` **diferente** do `fsrs_state` atual do card (§8.3).

Em **qualquer** `revision_conflict`: não insere log, não altera card, transação encerra sem efeito.

> **Retry / recompute após `revision_conflict` pertence ao R3** e continua **fora do R2**. O R2 apenas **reporta** o conflito de forma tipada; não relê, não recalcula, não reagenda.

### 3.2 `spaced_review_logs`

Ledger **append-only** (ADR decisão 14).

| Coluna | Tipo | Obrigatório | Regras |
|--------|------|-------------|--------|
| `id` | `uuid` PK | sim | default |
| `user_id` | `uuid` FK → `auth.users` | sim | `ON DELETE CASCADE` (§11.4) |
| `review_unit_id` | `text` | sim | Não vazio; ≤ 512 |
| `review_unit_kind` | `text` | sim | `cluster` \| `subtopico` |
| `attempt_id` | `uuid` | sim | **UNIQUE global** — chave de idempotência |
| `question_id` | `text` | sim | `modulo_slug` |
| `attempt_context` | `text` | sim | `cold_practice` \| `scheduled_review` — os **únicos** contextos elegíveis dos 8 de `FsrsAttemptContext` |
| `is_correct` | `boolean` | sim | Snapshot server-side (R3) |
| `rating` | `text` | sim | `again` \| `good` |
| `reviewed_at` | `timestamptz` | sim | Instante da tentativa (injetado pelo caller) |
| `expected_revision` | `bigint` | não | `null` quando o card foi **criado** nesta revisão |
| `resulting_revision` | `bigint` | sim | `revision` do card **após** esta revisão |
| `scheduled_days` | `integer` | sim | **Derivado** de `fsrs_state_after.scheduledDays`; `>= 0` |
| `due_at_before` | `timestamptz` | não | **Derivado** do estado atual do card; `null` na criação |
| `due_at_after` | `timestamptz` | sim | **Derivado** de `fsrs_state_after.due` |
| `fsrs_state_before` | `jsonb` | não | `null` na criação |
| `fsrs_state_after` | `jsonb` | sim | `FsrsMvpSerializedCard` |
| `semantic_fingerprint` | `text` | sim | SHA-256 hex do conteúdo semântico (§7) |
| `same_stem_fallback` | `boolean` | sim | default `false` (R4 seta; R2 apenas persiste) |
| `created_at` | `timestamptz` | sim | `now()` default; **sem** `updated_at` |

**Constraints:**

- `UNIQUE (attempt_id)` — sugestão `spaced_review_logs_attempt_id_uidx`
- `CHECK (attempt_context IN ('cold_practice','scheduled_review'))`
- `CHECK (rating IN ('again','good'))`
- **Coerência rating × acerto** (ADR decisão 5): `CHECK ((rating = 'again' AND is_correct = false) OR (rating = 'good' AND is_correct = true))`
- `CHECK (resulting_revision >= 1)`
- `CHECK (expected_revision IS NULL OR expected_revision >= 1)`
- `CHECK (review_unit_id <> '' AND length(review_unit_id) <= 512)`
- `CHECK (review_unit_kind IN ('cluster','subtopico'))`
- `CHECK (scheduled_days >= 0)`
- `CHECK (jsonb_typeof(fsrs_state_after) = 'object')`
- `CHECK (fsrs_state_before IS NULL OR jsonb_typeof(fsrs_state_before) = 'object')`
- `CHECK (semantic_fingerprint ~ '^[0-9a-f]{64}$')`
- Coerência de criação: `CHECK ((expected_revision IS NULL) = (fsrs_state_before IS NULL))`
- Todos os instantes são `timestamptz` (nunca `timestamp` sem timezone)

**Índices:** `(user_id, created_at DESC)`; `(review_unit_id, created_at DESC)`; `(user_id, review_unit_id, resulting_revision DESC)`.

### 3.2.1 Append-only (obrigatório)

- A aplicação **nunca** faz `UPDATE` em `spaced_review_logs`;
- a aplicação **nunca** faz `DELETE` em `spaced_review_logs`;
- **nenhuma** policy de `UPDATE`/`DELETE` é criada — para papel algum, inclusive `service_role`;
- **nenhum** trigger de `UPDATE`/`DELETE`;
- **nenhuma** rotina de expurgo, TTL ou job de limpeza no R2;
- retenção / GDPR além da exclusão de conta é **decisão formalmente adiada** (§14). Qualquer limpeza futura exige decisão registrada + migration própria.

A única exclusão possível no R2 é a cascata de `ON DELETE CASCADE` na remoção da conta em `auth.users` — exceção de **ciclo de vida**, não mecanismo de retenção (§11.4).

### 3.3 Payload `fsrs_state` / `fsrs_state_*`

- Formato canônico: `FsrsMvpSerializedCard` (`schemaVersion: 1`, `algorithm: 'ts-fsrs'`, `algorithmVersion: '5.4.1'`).
- **Antes de qualquer write:** `deserializeFsrsMvpCard(payload)` (`lib/fsrs/cardState.ts`).
- **Depois de qualquer read:** `deserializeFsrsMvpCard` novamente — inclusive em estados devolvidos pela própria RPC (§10).
- O banco aplica verificações **defensivas** rasas (§10.4). Elas **não** são equivalentes a `deserializeFsrsMvpCard` e **não** a substituem.

> **A RPC não executa código TypeScript.** `deserializeFsrsMvpCard` **não** roda dentro do PostgreSQL.
>
> | Camada | Responsabilidade |
> |--------|------------------|
> | TypeScript (antes da RPC) | Validar `state_before` / `state_after`, canonicalizar, calcular `semantic_fingerprint` |
> | PostgreSQL (dentro da RPC) | Locks, CAS de `revision`, igualdade de `state_before`, derivação dos denormalizados, comparação de fingerprint, constraints, atomicidade |
> | TypeScript (depois da RPC) | Revalidar **todo** card/estado lido ou retornado antes de entregar ao chamador |

### 3.4 Naming da migration

```text
supabase/migrations/YYYYMMDDHHMMSS_spaced_review_fsrs_mvp.sql
```

Timestamp **posterior** à última migration em `main` no momento do PR. Arquivo único com: DDL das duas tabelas, índices, a função `fsrs_persist_review` (§4), `ENABLE ROW LEVEL SECURITY`, policies e os `REVOKE`/`GRANT` (§4.5, §11).

**Aplicação:** somente em banco **local/CI** durante o PR (§14). Nenhum apply remoto.

---

## 4. RPC transacional `fsrs_persist_review`

**Zona vermelha** — revisão humana + Security Review obrigatórias antes do merge.

Toda a persistência de uma revisão acontece em **uma** função SQL, chamada **uma** vez por revisão. A função é o **único** caminho de escrita em `spaced_review_cards` e `spaced_review_logs`.

### 4.1 Operação indivisível

Dentro de **uma** transação, nesta ordem:

0. **Validar defensivamente** o payload e **derivar** os campos denormalizados (§8) — **antes** de qualquer escrita.
1. **Adquirir proteção concorrente** (locks determinísticos — §6.2).
2. **Verificar `attempt_id`** em `spaced_review_logs`.
3. **Classificar** duplicado/conflito por `semantic_fingerprint` (§7).
4. **Verificar CAS**: `expected_revision` contra `revision` atual **e** `fsrs_state_before` contra `fsrs_state` atual (§3.1.1).
5. **Inserir o log**.
6. **Criar ou atualizar o card**.
7. **Incrementar `revision`** (`resulting_revision = expected_revision + 1`, ou `1` na criação).
8. **Confirmar tudo ou nada** — commit único; qualquer falha em qualquer passo faz rollback total.

Os passos 0–4 são **read-only**: todo outcome que não seja `created` é decidido e retornado **antes** de qualquer escrita. Isso torna estruturalmente impossível um retorno de negócio coexistir com escrita parcial.

### 4.2 Proibições explícitas

| Proibido | Motivo |
|----------|--------|
| `upsert` de card e `insert` de log em **chamadas Supabase separadas** | Não é atômico; produz card sem log ou log sem card |
| Card persistido **sem** log correspondente | Ledger deixa de refletir o estado; auditoria quebrada |
| Log persistido **sem** card criado/atualizado | Estado divergente do ledger |
| “Reconciliação posterior”, job de repair ou reprocessamento como **substituto** de atomicidade | Débito disfarçado; **revogado** |
| Proteção baseada **somente** em `UNIQUE (attempt_id)` | Não protege duas tentativas **distintas** na mesma unidade (lost update) |
| Read-modify-write do card **sem** compare-and-swap | Lost update |
| Duas RPCs (uma para card, outra para log) | Reintroduz não atomicidade |
| `EXCEPTION WHEN OTHERS` que converta erro em retorno de negócio | Savepoint implícito pode preservar escrita parcial (§4.6) |

> A frase “falha após upsert do card, antes do log — **débito aceito no MVP**” está **removida** desta especificação. Card sem log **não** é débito tolerável; é violação de invariante.

### 4.3 Parâmetros

Todos tipados; **sem** SQL dinâmico; **sem** `text` genérico onde houver tipo específico.

| Parâmetro | Tipo | Nulo? | Notas |
|-----------|------|-------|-------|
| `user_id` | `uuid` | não | **Nunca** vindo do browser; resolvido server-side |
| `attempt_id` | `uuid` | não | Chave de idempotência |
| `review_unit_id` | `text` | não | Formato R1; ≤ 512 |
| `review_unit_kind` | `text` | não | `cluster` \| `subtopico` |
| `question_id` | `text` | não | `modulo_slug` |
| `attempt_context` | `text` | não | `cold_practice` \| `scheduled_review` |
| `is_correct` | `boolean` | não | Server-side (`resolveQuestionAttempt`, R3) |
| `rating` | `text` | não | `again` \| `good`; coerente com `is_correct` |
| `reviewed_at` | `timestamptz` | não | Instante da tentativa |
| `expected_revision` | `bigint` | **sim** | `null` **apenas** quando o card não existe |
| `fsrs_state_before` | `jsonb` | **sim** | `null` **apenas** na criação |
| `fsrs_state_after` | `jsonb` | não | Já validado no TypeScript |
| `same_stem_fallback` | `boolean` | não | default `false` |
| `semantic_fingerprint` | `text` | não | SHA-256 hex (§7) |

**Deliberadamente ausentes:** `due_at_before`, `due_at_after`, `last_review_at`, `scheduled_days`, `stability`, `difficulty`, `reps`, `lapses`. Todos são **derivados** do estado serializado dentro da RPC (§8) — passá-los em paralelo criaria uma segunda fonte de verdade capaz de divergir do `fsrs_state`.

### 4.4 Retorno tipado

Resultado estruturado com discriminante `outcome`:

| `outcome` (SQL) | Significado | Escreveu? |
|-----------------|-------------|-----------|
| `created` | Log inserido + card criado/atualizado; devolve `resulting_revision` | **sim** |
| `duplicate_equivalent` | `attempt_id` já existe com **mesmo** fingerprint — replay idêntico; devolve o `resulting_revision` **do log original** | não |
| `conflict` | `attempt_id` já existe com fingerprint **diferente** | não |
| `revision_conflict` | CAS falhou (§3.1.1); devolve o `revision` atual | não |
| `invalid_state` | Validação defensiva do passo 0 reprovou o payload | não |

A camada TypeScript acrescenta **dois** outcomes que a RPC não pode produzir: `persistence_failed` e `persistence_unknown` (§9). União completa: §5.4.

### 4.5 Segurança da função

| Requisito | Regra |
|-----------|-------|
| Modo | **`SECURITY INVOKER`** |
| `search_path` | `SET search_path` fixo e seguro na definição (ex.: `pg_catalog, public`) — nunca herdado do chamador |
| `REVOKE` | `REVOKE EXECUTE ON FUNCTION fsrs_persist_review(...) FROM PUBLIC` |
| `REVOKE` | `REVOKE EXECUTE … FROM anon` |
| `REVOKE` | `REVOKE EXECUTE … FROM authenticated` |
| `GRANT` | `GRANT EXECUTE … TO service_role` — **somente** |
| Parâmetros | Todos tipados; **sem** SQL dinâmico (`EXECUTE format(...)`) |
| `user_id` | **Nenhuma** confiança em `user_id` vindo do browser |
| Chamador | **Somente** a camada server-only (`import 'server-only'` + `createServerSupabase()`) |
| Cliente | `createServerSupabase()` (`lib/supabase/server.ts`) é **service role** — exige `SUPABASE_SERVICE_ROLE_KEY` (confirmado no código atual) |

**Sobre `SECURITY DEFINER`:** não é o padrão desta spec. Se a implementação futura precisar dele, exige, no PR, os **quatro**: (a) justificativa escrita de por que `INVOKER` não basta; (b) owner controlado e explícito (não superuser genérico); (c) `search_path` fixo; (d) Security Review específica da função. Sem os quatro, manter `INVOKER`.

### 4.6 Tratamento de exceções (proibição de broad catch)

Em PL/pgSQL, um bloco `BEGIN … EXCEPTION …` cria um **savepoint implícito**: capturar a exceção desfaz apenas o que ocorreu **dentro** do bloco e permite que a transação **continue e comite** o que veio antes. Isso é exatamente o que a §4.1 existe para impedir.

Regras:

| Regra | Detalhe |
|-------|---------|
| **Proibido** `EXCEPTION WHEN OTHERS` que converta erro técnico em retorno de negócio | Mascara defeito e pode preservar escrita parcial |
| Erro SQL não tratado **deve** abortar a chamada | Rollback integral é o comportamento desejado, não uma falha do desenho |
| Outcomes esperados vêm de **fluxo e constraints**, não de captura de exceção | `duplicate_equivalent`, `conflict`, `revision_conflict` e `invalid_state` são decididos nos passos read-only 0–4 |
| Qualquer exceção capturada **após** o início das escritas deve ser **re-raised** | `RAISE` sem argumentos, preservando o erro original |
| Bloco `EXCEPTION` só é admissível se **não** preservar escrita parcial | E deve estar justificado no PR |

Consequência para o cliente: uma resposta explícita do PostgreSQL/PostgREST que demonstre erro SQL e rollback é prova de que a transação abortou — portanto mapeia para `persistence_failed` com `writeStatus: 'none'` (§9). Erro de transporte ou `{ error }` ambíguo segue a política conservadora da §9.2.1.

---

## 5. Camada TypeScript (`lib/fsrs/persistence*`)

### 5.1 `persistenceTypes.ts`

Espelhar o **padrão estrutural** de [`lib/evidence/persistenceTypes.ts`](../lib/evidence/persistenceTypes.ts) — **sem** importar nada de `lib/evidence/**`.

```typescript
// Tipos ilustrativos — implementação no PR R2

export type SpacedReviewCardRow = { /* colunas §3.1, inclui revision */ };
export type SpacedReviewLogRow = { /* colunas §3.2, inclui semantic_fingerprint */ };

/** Subconjunto elegível de FsrsAttemptContext (lib/fsrs/types.ts). */
export type FsrsPersistableContext = Extract<
  FsrsAttemptContext,
  'cold_practice' | 'scheduled_review'
>;

export type FsrsPersistReviewInput = {
  userId: string;
  attemptId: string;                       // uuid — chave de idempotência
  reviewUnitId: string;
  reviewUnitKind: FsrsMvpReviewUnitKind;
  questionId: string;                      // modulo_slug
  attemptContext: FsrsPersistableContext;
  isCorrect: boolean;
  rating: FsrsMvpRating;
  reviewedAt: Date;
  expectedRevision: number | null;         // null SOMENTE quando o card não existe
  serializedBefore: FsrsMvpSerializedCard | null;
  serializedAfter: FsrsMvpSerializedCard;
  sameStemFallback?: boolean;
};
```

**Regras:**

- Resultados **sempre** estruturados; **não** lançar exceção para duplicado, conflito, conflito de revisão, estado inválido ou falha técnica.
- Nenhum cast `as FsrsMvpCardState` / `as FsrsMvpSerializedCard` em nenhum ponto da camada.
- `revision` é `bigint` no PostgreSQL. Na fronteira JSON o valor chega como número; o R2 representa `revision` como `number` e **valida** `Number.isSafeInteger(revision) && revision >= 1` ao entrar e ao sair. Valor fora da faixa segura → `invalid_state` (não truncar silenciosamente).

### 5.2 `persistence.ts`

Factory testável `createFsrsReviewPersistence(deps)`, com `deps` abstraindo o acesso ao banco (adapter injetável).

**Algoritmo `persistReview` (ordem obrigatória):**

1. Validar `serializedAfter` com `deserializeFsrsMvpCard` → lançou? → `invalid_state`, **zero write**, RPC não chamada.
2. Se `serializedBefore` presente → validar também → lançou? → `invalid_state`.
3. Verificar coerência `rating` × `isCorrect` (ADR decisão 5) → incoerente → `invalid_state`.
4. Verificar o par `expectedRevision` / `serializedBefore`: ambos `null` (criação) **ou** ambos presentes (atualização). Misturado → `invalid_state`.
5. Verificar `expectedRevision` como inteiro seguro `>= 1` quando presente → senão `invalid_state`.
6. Canonicalizar o conjunto fechado e calcular `semantic_fingerprint` (§7).
7. Chamar **uma** vez `fsrs_persist_review`.
8. Mapear o `outcome` retornado para a união discriminada (§5.4).
9. Aplicar a política conservadora da §9.2.1: somente erro SQL com rollback confirmado ou falha comprovadamente pré-dispatch → `persistence_failed`; qualquer transporte ambíguo → `persistence_unknown`.
10. Revalidar com `deserializeFsrsMvpCard` **qualquer** estado retornado antes de devolvê-lo.

**Proibido nesta camada:**

- `.from('spaced_review_cards').insert/update/upsert/delete(...)` e `.from('spaced_review_logs').insert/update/upsert/delete(...)` — **o único caminho de escrita é a RPC** (gate em §6.5);
- `UPDATE` ou `DELETE` em logs por qualquer via;
- escrever sem validar o JSON;
- casts como substituto de validação;
- confiar no JSONB “porque veio do banco”;
- reparar estado inválido silenciosamente;
- importar `lib/evidence/**`.

### 5.3 `supabasePersistence.ts`

- `import 'server-only'` na primeira linha.
- `createSupabaseFsrsPersistence(client)` — injeção de cliente, igual em espírito ao Evidence.
- Cliente esperado: `createServerSupabase()` — **service role**.
- Superfície de escrita: **exclusivamente** `client.rpc('fsrs_persist_review', …)`. Nenhum `.from()` de escrita.
- Leituras `SELECT` (ex.: carregar o card para o R3) podem usar `.from(...).select(...)` **nesta camada server-only** — sempre revalidando com `deserializeFsrsMvpCard`.
- Exigir evidência positiva de rollback ou de pré-dispatch antes de mapear `persistence_failed`; ausência de resposta e `{ error }` ambíguo mapeiam para `persistence_unknown` (§9.2.1).

### 5.4 Outcomes do adapter (união discriminada)

```typescript
export type FsrsWriteStatus = 'none' | 'committed' | 'unknown';

export type FsrsPersistReviewResult =
  | { outcome: 'created';              writeStatus: 'committed'; attemptId: string; resultingRevision: number }
  | { outcome: 'duplicate_equivalent'; writeStatus: 'none';      attemptId: string; resultingRevision: number }
  | { outcome: 'conflict';             writeStatus: 'none';      attemptId: string }
  | { outcome: 'revision_conflict';    writeStatus: 'none';      attemptId: string; currentRevision: number }
  | { outcome: 'invalid_state';        writeStatus: 'none';      attemptId: string; reason: FsrsInvalidStateReason }
  | { outcome: 'persistence_failed';   writeStatus: 'none';      attemptId: string }
  | { outcome: 'persistence_unknown';  writeStatus: 'unknown';   attemptId: string };
```

| Outcome | `writeStatus` | `revision` devolvida | Observação |
|---------|---------------|----------------------|------------|
| `created` | `committed` | `resultingRevision` (novo valor) | Único outcome que grava |
| `duplicate_equivalent` | `none` | `resultingRevision` **do log original** — **não** o `revision` atual do card | Esta chamada não gravou; o efeito original permanece. Seguro tratar como sucesso |
| `conflict` | `none` | — | Mesmo `attempt_id`, conteúdo diferente; **nunca** altera log ou card |
| `revision_conflict` | `none` | `currentRevision` (valor real no banco) | Retry/recompute é **R3** |
| `invalid_state` | `none` | — | `reason` é código curto enumerado |
| `persistence_failed` | `none` | — | Ausência de write **comprovada** (§9) |
| `persistence_unknown` | `unknown` | — | Resultado indeterminado; **não** afirmar ausência de write (§9) |

**Exposição de dados:** nenhum outcome carrega `fsrs_state` completo. Mensagens de erro, `reason` e logs de aplicação **não** incluem o estado serializado — no máximo `attempt_id`, `review_unit_id`, `revision` e um código enumerado.

### 5.5 `fingerprint.ts`

- Módulo FSRS próprio; **proibido** importar `lib/evidence/**` (inclusive helpers de hash).
- Exporta a canonicalização e o cálculo do `semantic_fingerprint` (§7).
- Puro e determinístico: sem `Date.now()`, sem aleatoriedade, sem I/O.

### 5.6 Exports públicos

| Exportar em `index.ts` | Manter interno |
|------------------------|----------------|
| Tipos `FsrsPersistReviewInput`, `FsrsPersistReviewResult`, `FsrsWriteStatus` | Strings SQL e nome da RPC |
| `createSupabaseFsrsPersistence` | Nomes de constraint |
| — | Factory de baixo nível; nada que possa entrar em bundle de client |

Adicionar seção **R2 — persistência** em `lib/fsrs/README.md` no PR.

---

## 6. Atomicidade, concorrência e gate de bypass

### 6.1 Cenários cobertos

| Cenário | Comportamento exigido |
|---------|----------------------|
| Mesmo `attempt_id`, mesmo conteúdo (replay) | `duplicate_equivalent`; **um** log; card intocado |
| Mesmo `attempt_id`, conteúdo diferente | `conflict`; **nenhuma** escrita |
| Duas tentativas **diferentes** no **mesmo card**, mesmo `expected_revision` | Exatamente **uma** grava (`created`); a outra recebe `revision_conflict` |
| Criação **concorrente** do primeiro card na mesma unidade | Exatamente **uma** cria (`revision = 1`); a outra recebe `revision_conflict` |
| Mesmo `attempt_id` em **unidades diferentes** | `UNIQUE (attempt_id)` é global; a segunda cai em `conflict` (o fingerprint difere por `review_unit_id`) |
| `state_before` desatualizado com `revision` correta | `revision_conflict` (§8.3) |
| `attempt_id` ausente | R2 não expõe API pública; R3 rejeita antes de chamar |
| Falha em qualquer passo | Rollback total: **nenhum** log órfão, **nenhum** card órfão |

Com transação única, o estado “card gravado, log não” é **inalcançável**.

### 6.2 Desenho de lock

Dentro da transação, **antes** de qualquer leitura de decisão:

1. Lock transacional determinístico para **`attempt_id`**.
2. Lock transacional determinístico para **`user_id` × `review_unit_id`**.
3. **A ordem de aquisição é sempre a mesma** (primeiro `attempt_id`, depois a unidade) — requisito para evitar deadlock quando duas transações disputam os mesmos recursos.
4. Locks **transacionais**: liberados no commit/rollback; nenhuma liberação manual; nenhum lock de sessão.

Advisory locks derivados de um hash estável dos identificadores atendem ao desenho; qualquer mecanismo SQL equivalente comprovadamente seguro é aceitável. Uma colisão de hash pode apenas serializar transações não relacionadas por tempo adicional: as decisões continuam usando identificadores completos, constraints e CAS, portanto a colisão **não** mistura dados nem quebra a correção.

**Alternativa sem advisory lock:** permitida **somente** se a implementação demonstrar, com **teste concorrente real** (§12.C), que `UNIQUE` + row lock (`SELECT … FOR UPDATE`) + CAS preserva **exatamente** a mesma semântica — inclusive na corrida de criação do primeiro card, em que ainda não existe linha para travar. Argumento teórico não basta; o teste é o gate.

### 6.3 Sequência após os locks

1. Consultar `attempt_id` em `spaced_review_logs`.
2. Se **existe** → comparar `semantic_fingerprint`:
   - igual → `duplicate_equivalent` (encerra, sem escrita; devolve o `resulting_revision` do log original);
   - diferente → `conflict` (encerra, sem escrita).
3. Se **não existe** → validar CAS (§3.1.1): `revision` **e** igualdade de `fsrs_state_before`:
   - divergente → `revision_conflict` (encerra, sem escrita).
4. Inserir o log **e** criar/atualizar o card **na mesma transação**.
5. Commit único.

### 6.4 Ordem lógica card × log

Dentro da transação a ordem física de `INSERT` é irrelevante para a atomicidade — ambos comitam juntos. A spec fixa **log antes do card** apenas por clareza de leitura do SQL. O que **não** é admissível é qualquer desenho em que um dos dois possa persistir sem o outro.

### 6.5 Gate arquitetural contra bypass da RPC

A proibição de escrita direta **não pode viver apenas em prosa**. Conforme o loop de melhoria do repositório (anti-padrão reincidente vira gate), o R2 **deve** adicionar uma regra em [`scripts/check-architecture-patterns.ts`](../scripts/check-architecture-patterns.ts):

| Item | Regra |
|------|-------|
| Padrão proibido | `.from('spaced_review_cards')` ou `.from('spaced_review_logs')` seguido de `insert` / `update` / `upsert` / `delete` |
| Escopo | O mesmo `ARCH_CHECK_SCOPES` já existente (`app/`, `components/`, `lib/`) |
| Allowlist | **Nenhuma** — nem o módulo de persistência escreve por `.from()`; o único caminho é `client.rpc('fsrs_persist_review', …)` |
| Leitura | `.from(...).select(...)` **permitido** na camada server-only autorizada (§5.3) |
| Client Components | Nenhum import de `lib/fsrs/persistence*` em arquivo `'use client'` |
| Teste | Regra **coberta por teste próprio** — hoje não existe teste para `check-architecture-patterns.ts`; o R2 cria o primeiro. Como o script pula `__tests__/`, o teste deve exercitar a função de check com fixtures, não depender de varredura do próprio arquivo de teste |

Gate de execução: `npm run check:architecture` (já em `npm run check:ship`).

---

## 7. Idempotência e `semantic_fingerprint`

Identidade **do conteúdo** de uma revisão, usada para distinguir replay idêntico de payload divergente sob o mesmo `attempt_id`.

**Conjunto fechado** — nada além disto entra no cálculo:

| Campo | Notas |
|-------|-------|
| `user_id` | |
| `review_unit_id` | |
| `question_id` | `modulo_slug` |
| `attempt_context` | `cold_practice` \| `scheduled_review` |
| `is_correct` | |
| `rating` | |
| `reviewed_at` | Instante normalizado (UTC, precisão fixa e documentada — recomendado milissegundos) |
| `expected_revision` | O caso `null` deve ser distinguível de `0` |
| `fsrs_state_before` | `null` distinguível de objeto vazio |
| `fsrs_state_after` | |

**Deliberadamente fora:**

| Campo | Por quê |
|-------|---------|
| `attempt_id` | É a **chave** sob a qual o fingerprint é comparado; incluí-lo tornaria toda comparação trivialmente igual |
| `due_at_before` / `due_at_after` / `scheduled_days` / `last_review_at` | **Derivados** do estado serializado (§8); incluí-los duplicaria informação já coberta por `fsrs_state_*` |
| `review_unit_kind` | Derivado do `review_unit_id` (o id codifica `cluster=` ou `subtopico=`) |
| `same_stem_fallback` | Telemetria do R4; não altera a semântica de agendamento da revisão |

**Requisitos:**

- **Canonicalização determinística**: chaves ordenadas, sem espaços incidentais, `null` explicitamente representado e distinguível de ausente, números e datas em forma normalizada única.
- **SHA-256 hex** minúsculo, via `node:crypto` (**sem** helper de `lib/evidence/**`).
- Calculado **em TypeScript**, em `lib/fsrs/fingerprint.ts`, **antes** da RPC.
- Persistido no log e protegido por `CHECK (semantic_fingerprint ~ '^[0-9a-f]{64}$')`.
- Mesmo `attempt_id` + mesmo fingerprint → `duplicate_equivalent`.
- Mesmo `attempt_id` + fingerprint diferente → `conflict`.
- `conflict` **nunca** altera log ou card.

---

## 8. Campos denormalizados derivados

### 8.1 Princípio

`FsrsMvpSerializedCard` já contém tudo que os campos denormalizados representam. Aceitá-los como parâmetros paralelos criaria uma **segunda fonte de verdade** capaz de divergir do estado — exatamente o tipo de incoerência que o ledger deveria tornar impossível.

**A RPC deriva; o caller não informa.**

### 8.2 Mapa de derivação (nomes reais do R1)

| Destino | Origem | Extração conceitual |
|---------|--------|---------------------|
| `cards.due_at` | `fsrs_state_after.due` | `(fsrs_state_after ->> 'due')::timestamptz` |
| `cards.last_review_at` | `fsrs_state_after.lastReview` | `(fsrs_state_after ->> 'lastReview')::timestamptz` — JSON `null` vira SQL `NULL` |
| `cards.stability` | `fsrs_state_after.stability` | `::double precision` |
| `cards.difficulty` | `fsrs_state_after.difficulty` | `::double precision` |
| `cards.reps` | `fsrs_state_after.reps` | `::integer` |
| `cards.lapses` | `fsrs_state_after.lapses` | `::integer` |
| `logs.due_at_after` | `fsrs_state_after.due` | mesma extração |
| `logs.scheduled_days` | `fsrs_state_after.scheduledDays` | `::integer` |
| `logs.due_at_before` | `fsrs_state` **atual do card** | `NULL` na criação |
| `logs.fsrs_state_before` | Parâmetro (validado no TS **e** comparado ao card em §8.3) | — |

Os nomes acima são os campos reais de `FsrsMvpSerializedCard` (`lib/fsrs/types.ts`): `due`, `lastReview`, `stability`, `difficulty`, `elapsedDays`, `scheduledDays`, `learningSteps`, `reps`, `lapses`, `state`, mais `schemaVersion` / `algorithm` / `algorithmVersion`.

### 8.3 Coerência de `state_before`

A `revision` sozinha detecta perda de corrida, mas **não** detecta um caller que leu de outra origem ou montou o estado à mão. Por isso o CAS é **duplo**:

- `expected_revision` deve casar com `cards.revision`; **e**
- `fsrs_state_before` deve ser **igual** ao `cards.fsrs_state` atual.

A comparação usa igualdade `jsonb` do PostgreSQL, que é canônica (ordem de chaves e duplicatas normalizadas na entrada), com semântica null-safe (`IS NOT DISTINCT FROM`).

Divergência → `revision_conflict`, **zero write**.

### 8.4 Valor inválido

- Detectado no **passo 0** (read-only, antes de qualquer escrita) → `invalid_state`, transação sem efeito.
- Detectado **após** o início das escritas (situação que o desenho torna inalcançável) → `RAISE`, rollback integral, **sem** captura (§4.6).

Nunca “corrigir” ou completar valor ausente/ilegível.

---

## 9. Falha de transporte após COMMIT

### 9.1 O problema

A RPC pode **comitar** no PostgreSQL e a resposta se perder (timeout, queda de conexão, cliente abortado). Nesse caso o cliente **não sabe** se houve write. Afirmar `wrote: false` seria mentira, e levaria o chamador a duplicar ou descartar o efeito.

### 9.2 Classificação obrigatória

| Situação | Outcome | `writeStatus` |
|----------|---------|---------------|
| Estado inválido detectado **antes** de chamar a RPC | `invalid_state` | `none` — a RPC não foi chamada |
| Falha comprovadamente **anterior ao envio** (cliente não construído, erro pré-dispatch) | `persistence_failed` | `none` |
| Resposta explícita do PostgreSQL/PostgREST demonstrando erro SQL e rollback (permissão, constraint, erro SQL) | `persistence_failed` | `none` — há evidência positiva de transação abortada (§4.6) |
| `invalid_state` retornado pela RPC | `invalid_state` | `none` — decidido antes de qualquer escrita (§4.1) |
| Timeout, `AbortError`, socket reset, fetch interrompido, conexão fechada, ausência de corpo/resposta ou erro genérico sem confirmação de rollback | **`persistence_unknown`** | **`unknown`** |
| `{ error }` genérico do supabase-js sem evidência positiva de resposta SQL com rollback | **`persistence_unknown`** | **`unknown`** |
| `created` recebido | `created` | `committed` |

**Nunca** afirmar ausência de write quando o cliente não recebeu resposta.

#### 9.2.1 Política conservadora do adapter Supabase/PostgREST

A classificação é normativa e obedece à origem comprovável do resultado:

| Classe | Evidência | Resultado obrigatório |
|--------|----------|-----------------------|
| **A — validação local** | `deserializeFsrsMvpCard` ou outra validação reprova antes da chamada à RPC | `invalid_state`, `writeStatus: 'none'` |
| **B — erro SQL com rollback confirmado** | resposta PostgreSQL/PostgREST explícita demonstra erro SQL e transação abortada | `persistence_failed`, `writeStatus: 'none'` |
| **C — não enviado** | evidência positiva de que a requisição falhou antes do dispatch | `persistence_failed`, `writeStatus: 'none'` |
| **D — transporte ambíguo** | timeout, `AbortError`, socket reset, fetch interrompido, conexão fechada, ausência de corpo/resposta ou erro genérico sem confirmação de rollback | `persistence_unknown`, `writeStatus: 'unknown'` |
| **E — `{ error }` do supabase-js** | o objeto genérico, isoladamente, não prova se o banco recebeu ou comitou a chamada | `persistence_failed` somente quando código, resposta ou outra evidência positiva comprovar rollback; na dúvida, `persistence_unknown` |

**Regra central:** sem evidência positiva de rollback **ou** de que a requisição não foi enviada, o adapter deve sempre retornar `persistence_unknown` com `writeStatus: 'unknown'`. A simples presença de `{ error }` no supabase-js **não** autoriza assumir `writeStatus: 'none'`.

Para fazer essa classificação, registrar no máximo metadados técnicos mínimos e códigos de erro permitidos. **Não** registrar `fsrs_state_before`, `fsrs_state_after`, o payload semântico completo nem dados sensíveis.

### 9.3 Retry de `persistence_unknown`

Um retry após `persistence_unknown` deve reutilizar **exatamente o payload semântico original**, incluindo:

- o mesmo `attempt_id`;
- o mesmo `reviewed_at`;
- o mesmo `user_id`;
- o mesmo `review_unit_id`;
- o mesmo `question_id`;
- o mesmo `attempt_context`;
- o mesmo `is_correct`;
- o mesmo `rating`;
- o mesmo `expected_revision`;
- o mesmo `fsrs_state_before`;
- o mesmo `fsrs_state_after`;
- o mesmo `semantic_fingerprint`;
- todos os demais dados semânticos originais, sem releitura, recomputação ou substituição.

**Somente reutilizar `attempt_id` não é suficiente.** O futuro R3 deve reter o payload original completo — ou um retry token equivalente que reconstrua os mesmos bytes canônicos e o mesmo fingerprint — até obter resultado terminal diferente de `persistence_unknown`.

No retry após `persistence_unknown`, é **proibido**:

- reler o card e recalcular o payload;
- alterar `reviewed_at`;
- atualizar `expected_revision`;
- substituir `fsrs_state_before`;
- gerar novo `fsrs_state_after`;
- recalcular o fingerprint com dados diferentes;
- gerar novo `attempt_id`.

| Situação real da primeira chamada | Resultado obrigatório do retry idêntico |
|-----------------------------------|------------------------------------------|
| A RPC comitou, mas a resposta se perdeu | `duplicate_equivalent`, com o `resulting_revision` **do log original** e zero write adicional |
| A requisição não chegou ao banco | `created`, persistindo uma única transição |
| O mesmo `attempt_id` volta com qualquer campo semântico diferente | `conflict`, com zero write; card e log existentes permanecem intactos |

O `semantic_fingerprint` garante que o retry idêntico seja reconhecido como equivalente, e que um retry **alterado** seja rejeitado como `conflict` em vez de gravar duas vezes.

> **Contagem e backoff do retry pertencem ao R3.** A identidade integral do payload e sua retenção até resultado terminal já são contratos obrigatórios desta spec R2; o R3 não pode reler/recalcular após `persistence_unknown`.

---

## 10. Validação R1 e estados inválidos

### 10.1 Onde `deserializeFsrsMvpCard` é obrigatório

`deserializeFsrsMvpCard` (`lib/fsrs/cardState.ts`, contrato R1) deve rodar:

1. **Antes** de enviar `fsrs_state_after` para a RPC;
2. Sobre `fsrs_state_before` lido/recebido;
3. Sobre `fsrs_state` lido de `spaced_review_cards`;
4. Sobre **qualquer** estado retornado pela RPC;
5. **Antes** de devolver um card ao futuro R3.

A função **lança** `FsrsMvpSerializationError`; a camada de persistência captura essa exceção e a converte em `invalid_state` — **não** a propaga para o chamador.

### 10.2 Proibições

| Proibido | Porquê |
|----------|--------|
| `as FsrsMvpCardState` / `as FsrsMvpSerializedCard` (ou cast equivalente) | Cast não valida nada |
| Confiar no JSONB “porque veio do banco” | O banco garante forma, não semântica versionada |
| Reparar/normalizar estado inválido silenciosamente | Mascara corrupção; o correto é recusar |
| Persistir com `state_before` **ou** `state_after` inválido | Contamina o ledger |

### 10.3 Comportamento

| Situação | Resultado |
|----------|-----------|
| Estado inválido **antes** da RPC | `invalid_state`; **zero write** — a RPC nem é chamada |
| Estado inválido **ao ler** (card ou retorno) | `invalid_state`; nenhuma atualização derivada dele |
| Erro SQL explícito com rollback confirmado | `persistence_failed` (§9) |
| Sem resposta ou erro de transporte ambíguo | `persistence_unknown` (§9) |
| Estado válido | Segue o fluxo da RPC (§6.3) |

**Nunca** registrar o `fsrs_state` completo em logs de aplicação (`lib/logger.ts`). No máximo `attempt_id`, `review_unit_id`, `revision` e o código do motivo.

### 10.4 Validação defensiva no banco

Dentro da RPC, no passo 0, o PostgreSQL verifica de forma **rasa**:

- `jsonb_typeof(fsrs_state_after) = 'object'` (e `before`, quando não nulo);
- presença dos metadados básicos (`schemaVersion`, `algorithm`, `algorithmVersion`) com os valores suportados;
- extração segura das datas e números derivados (§8) — falha de cast → `invalid_state`;
- `revision` conforme §3.1.1;
- campos relacionais (`user_id`, `review_unit_id`, `question_id`) não vazios e dentro dos limites;
- constraints de `rating`, `attempt_context` e a coerência `rating` × `is_correct`.

> **Não** prometer equivalência: a validação SQL é uma **rede de segurança rasa** e **não** reproduz `deserializeFsrsMvpCard` (que rejeita, por exemplo, propriedades extras desconhecidas). A validação semântica autoritativa é sempre a TypeScript, dos dois lados da chamada.

---

## 11. RLS, grants e ciclo de vida

**Zona vermelha** — revisão humana + Security Review obrigatórias antes do merge.

### 11.1 Matriz única (normativa)

Replicada **sem divergência** em [`PLANO_IMPLEMENTACAO_REVISAO_FSRS_MVP.md`](PLANO_IMPLEMENTACAO_REVISAO_FSRS_MVP.md) §3.2.1. O [ADR](DECISAO_REVISAO_FSRS_MVP.md) §9.5 **aponta** para esta seção como fonte da verdade, em vez de duplicar a tabela — assim não existem duas cópias podendo divergir.

| Papel | cards SELECT | cards WRITE | logs SELECT | logs WRITE | RPC EXECUTE |
|-------|:------------:|:-----------:|:-----------:|:----------:|:-----------:|
| `anon` | não | não | não | não | não |
| `authenticated` | **somente próprias** | não | **somente próprios** | não | não |
| `service_role` | sim | `INSERT` / `UPDATE` | sim | `INSERT` | **sim** |

Não há “estratégia a escolher” no PR: é **service-role-first**.

### 11.2 Requisitos

- `SELECT` próprio no padrão **initplan** — `(select auth.uid()) = user_id` — conforme `20260604191239_rls_performance.sql`.
- **Nenhuma** policy de `INSERT`/`UPDATE`/`DELETE` para `authenticated`.
- **Nenhum** acesso para `anon`.
- **Nenhuma** policy de `UPDATE`/`DELETE` em `spaced_review_logs` para papel algum (§3.2.1).
- Toda escrita nasce da RPC chamada com service role.
- `createServerSupabase()` é **explicitamente o cliente service role** (usa `SUPABASE_SERVICE_ROLE_KEY`).
- Módulo de persistência com `import 'server-only'`.
- O segredo service role **nunca** vai ao cliente nem entra em bundle.
- **Nenhuma** chamada da RPC a partir do browser.
- **Nenhuma** policy permissiva que anule os grants (revisar `USING (true)` e policies herdadas).

### 11.3 Smoke RLS obrigatório

`scripts/rls-performance-smoke.ts` monta casos **por tabela, explicitamente** (não descobre tabelas novas sozinho). Portanto o R2 **deve** adicionar casos — não é opcional:

| Caso | Esperado |
|------|----------|
| `anon` lê `spaced_review_cards` | 0 linhas / negado |
| `anon` lê `spaced_review_logs` | 0 linhas / negado |
| `anon` escreve em qualquer das duas | negado |
| `authenticated` lê **os próprios** cards/logs | permitido (se houver fixture) |
| `authenticated` **escreve** | negado |
| Usuário A lê dados de B | 0 linhas / negado |
| `authenticated` executa `fsrs_persist_review` | negado |
| `service_role` executa `fsrs_persist_review` | permitido |
| `UPDATE` / `DELETE` em `spaced_review_logs` | não exposto a nenhum papel |

```bash
npm run smoke:rls
```

### 11.4 Ciclo de vida do usuário (`ON DELETE`)

| Item | Decisão |
|------|---------|
| FK | `user_id` referencia `auth.users` nas duas tabelas |
| Comportamento | **`ON DELETE CASCADE`**, espelhando o padrão do repositório (`historico_questoes`) |
| Escopo da exceção | Aceito **exclusivamente** como exclusão de **ciclo de vida da conta**: quando a conta deixa de existir, os dados derivados dela também deixam |
| Compatibilidade com append-only | **Não contradiz** o append-only, que é uma garantia **operacional**: a aplicação nunca faz `UPDATE`/`DELETE` em logs (§3.2.1). O cascade não é um caminho de escrita da aplicação |
| Superfície de DELETE no R2 | **Nenhuma** — o R2 não expõe exclusão de card ou log |
| Retenção / GDPR além da conta | **Decisão adiada** (§14): expurgo parcial, anonimização e TTL exigem decisão registrada + migration própria |

Esta é a **única** exclusão possível no R2, e está documentada aqui como exceção explícita — não como política de retenção.

---

## 12. Testes obrigatórios (DoD R2)

Quatro camadas. **Mocks não substituem o teste real da RPC.**

### 12.A Unitários TypeScript

Arquivo: `__tests__/lib/fsrs/fsrsMvp.persistence.test.ts`

| Caso | Assert |
|------|--------|
| Validação antes do write | `state_after` inválido → `invalid_state`, RPC **não** chamada |
| Validação após o read | estado inválido retornado → `invalid_state` |
| Propriedade extra no payload | rejeitada (contrato R1 `schemaVersion 1`) → `invalid_state` |
| Fingerprint determinístico | mesma entrada → mesmo hash; qualquer campo do conjunto fechado muda → hash muda |
| Fingerprint × `attempt_id` | trocar **só** o `attempt_id` **não** muda o fingerprint |
| Fingerprint × campos derivados | trocar `fsrs_state_after` muda o hash (cobre due/scheduledDays implicitamente) |
| Outcomes tipados | cada `outcome` da RPC mapeia para o membro correto da união, com o `writeStatus` correto |
| Adapter injetável | fake client cobre **todos** os outcomes |
| `persistence_failed` | erro SQL explícito com rollback confirmado ou falha comprovadamente pré-dispatch → `persistence_failed`, `writeStatus: 'none'` |
| `persistence_unknown` | timeout / `AbortError` / socket reset / ausência de resposta / `{ error }` ambíguo → `persistence_unknown`, `writeStatus: 'unknown'` |
| Coerência rating | `rating='good'` com `isCorrect=false` → `invalid_state` |
| Par criação/atualização | `expectedRevision` sem `serializedBefore` (e vice-versa) → `invalid_state` |
| `revision` fora da faixa segura | → `invalid_state` (sem truncar) |
| Sem cast inseguro | nenhum cast substituindo validação no módulo |

### 12.B RPC real / migration local

Contra banco **local** (Supabase local / CI), chamando a RPC de verdade:

| Caso | Assert |
|------|--------|
| `created` | log + card gravados |
| `duplicate_equivalent` | mesmo `attempt_id`, mesmo fingerprint → sem segundo log; devolve o `resulting_revision` **original** mesmo com o card já mais avançado |
| `conflict` | mesmo `attempt_id`, fingerprint diferente → zero escrita |
| `revision_conflict` | `expected_revision` desatualizado → zero escrita |
| `state_before` divergente | `revision` correta mas estado diferente → `revision_conflict`, zero escrita (§8.3) |
| Criação do primeiro card | `expected_revision = null` → `revision = 1` |
| Incremento de `revision` | segunda revisão → `revision = 2`, `resulting_revision = 2` |
| Card/log atômicos | contagens sempre coerentes |
| **Coerência `due_at`** | `cards.due_at` = `fsrs_state_after.due`; `logs.due_at_after` idem |
| **Coerência `last_review_at`** | `cards.last_review_at` = `fsrs_state_after.lastReview` (inclusive `null`) |
| **Coerência `scheduled_days`** | `logs.scheduled_days` = `fsrs_state_after.scheduledDays` |
| `due_at_before` | igual ao `due` do estado anterior; `null` na criação |
| Constraint `attempt_context` | valor fora do conjunto → rejeitado |
| Constraint `rating` | valor fora do conjunto / incoerente com `is_correct` → rejeitado |
| JSON inválido | `fsrs_state_after` não-objeto ou sem metadados → `invalid_state`, zero escrita |
| Data ilegível | `due` não convertível → `invalid_state`, zero escrita |
| Rollback sem estado parcial | falha forçada no meio → zero linhas novas nas **duas** tabelas |
| Log imutável | `UPDATE`/`DELETE` em `spaced_review_logs` não disponível a nenhum papel |

### 12.C Concorrência real

Chamadas **paralelas** reais (não simuladas):

| Caso | Assert |
|------|--------|
| Duas chamadas equivalentes, mesmo `attempt_id` | uma `created`, outra `duplicate_equivalent`; **um** log |
| Duas chamadas conflitantes, mesmo `attempt_id` | uma `created`, outra `conflict`; **um** log |
| Duas tentativas diferentes, mesmo `expected_revision` | **exatamente uma** vence (`created`); a outra `revision_conflict` |
| Race na criação do primeiro card | exatamente **um** card criado com `revision = 1` |
| Falha transacional sob concorrência | nenhum log órfão, nenhum card órfão |

Os quatro casos abaixo são **obrigatórios** e não podem ser reduzidos ao teste genérico de “mesmo `attempt_id`”:

#### Caso A — resposta perdida e commit ocorrido

1. A RPC cria card e log.
2. O harness simula a perda da resposta depois do commit.
3. O adapter retorna `persistence_unknown`, `writeStatus: 'unknown'`.
4. O retry reenvia o payload original **idêntico** (§9.3).
5. A RPC retorna `duplicate_equivalent`.
6. `resultingRevision` é a revisão registrada no log original.
7. Não ocorre segundo log nem segundo update do card.

#### Caso B — resposta perdida e requisição não chegou

1. O harness faz a primeira tentativa não chegar ao banco sem fornecer ao adapter evidência positiva de pré-dispatch; o adapter retorna `persistence_unknown`, `writeStatus: 'unknown'`.
2. O retry idêntico é enviado com o payload original.
3. A RPC retorna `created`.
4. Uma única transição é persistida.

#### Caso C — retry indevidamente recalculado

1. A primeira RPC comita card/log, mas sua resposta se perde; o adapter retorna `persistence_unknown`.
2. O retry usa o mesmo `attempt_id`.
3. O harness altera `reviewed_at`, `expected_revision`, `fsrs_state_before`, `fsrs_state_after` **ou qualquer campo do fingerprint**.
4. A RPC retorna `conflict`.
5. Não ocorre write adicional.
6. Card e log originais permanecem intactos.

#### Caso D — classificação de transporte

| Entrada simulada | Resultado obrigatório |
|------------------|-----------------------|
| Erro SQL explícito com rollback confirmado | `persistence_failed`, `writeStatus: 'none'` |
| `AbortError` sem resposta | `persistence_unknown`, `writeStatus: 'unknown'` |
| Timeout | `persistence_unknown`, `writeStatus: 'unknown'` |
| Socket reset | `persistence_unknown`, `writeStatus: 'unknown'` |
| `{ error }` ambíguo do supabase-js | `persistence_unknown`, `writeStatus: 'unknown'` |
| Validação antes da RPC | `invalid_state`, `writeStatus: 'none'`; RPC não chamada |

### 12.D Smoke RLS

Matriz completa da §11.3, incluindo o caso negativo de `authenticated` executando a RPC.

### 12.E Gate arquitetural

| Caso | Assert |
|------|--------|
| Fixture com `.from('spaced_review_cards').insert(...)` | viola a regra |
| Fixture com `.from('spaced_review_logs').update(...)` | viola a regra |
| Fixture com `.from('spaced_review_cards').select(...)` | **não** viola |
| Código real do repositório | zero violações |

### 12.F Comandos gate

```bash
npx supabase db reset # aplica do zero as migrations somente no banco local
npm test -- __tests__/lib/fsrs/
npm run typecheck
npm run check:architecture
npm run smoke:rls
```

**Sem** teste e2e de rota neste lote. **Sem** Playwright.

Os testes B e C **não** cabem no arquivo Jest de unidade: a allowlist (§13.1) é ampliada para permitir arquivo/script separado de RPC e concorrência contra banco local.

---

## 13. PR R2 — allowlist, gates e checklist

### 13.1 Allowlist de arquivos (proposta)

| Path | Ação |
|------|------|
| `supabase/migrations/<timestamp>_spaced_review_fsrs_mvp.sql` | **novo** — DDL + RPC + RLS + grants |
| `lib/fsrs/persistenceTypes.ts` | **novo** |
| `lib/fsrs/persistence.ts` | **novo** |
| `lib/fsrs/supabasePersistence.ts` | **novo** |
| `lib/fsrs/fingerprint.ts` | **novo** |
| `lib/fsrs/index.ts` | existente — modificar exports |
| `lib/fsrs/README.md` | existente — seção R2 |
| `scripts/check-architecture-patterns.ts` | existente — **nova regra** (§6.5) |
| `__tests__/lib/fsrs/fsrsMvp.persistence.test.ts` | **novo** |
| Teste do gate arquitetural (§12.E) | **novo** |
| Teste/script de RPC + concorrência local (§12.B, §12.C) | **novo** |
| `scripts/rls-performance-smoke.ts` **ou** smoke FSRS dedicado | existente / **novo** |
| `types/database.ts` | **a confirmar** — §13.2 |

Timestamp da migration **posterior** à última migration em `main` no momento do PR. Qualquer arquivo fora da allowlist exige justificativa no PR.

### 13.2 `types/database.ts` — a confirmar

Situação real do repositório:

- `types/database.ts` é **hand-curated** (declarado em `scripts/check-database-types-drift.ts`);
- `types/database.supabase.snapshot.ts` é o snapshot **gerado** via `npm run check:db-types -- --update`, que executa `npx supabase gen types typescript --linked` e portanto **exige projeto remoto linkado**.

Consequências:

1. **Preferir a geração pelo comando canônico** em vez de edição manual.
2. **Não editar `types/database.ts` à mão** sem confirmar o padrão com o mantenedor.
3. Registrar a decisão como **gate do PR**.
4. Como a geração canônica depende de projeto linkado, e o R2 **não** aplica migration remota (§14), a atualização do snapshot pode não ser possível dentro do PR — nesse caso, documentar explicitamente e **não** forjar o arquivo.
5. Se a geração produzir **diff amplo** (drift alheio ao FSRS), **separar** em revisão própria antes de incluir.

### 13.3 Fora do R2 (proibido no PR)

`app/**` · `components/**` · qualquer rota · player · `registrar-tentativa` · `simulado` · `lib/env.ts` · `lib/evidence/**` · scheduler legado (`lib/spaced-repetition.ts`) · qualquer entrega de **R3**.

### 13.4 Gates obrigatórios

| Gate | Obrigatório |
|------|-------------|
| Testes **R1** (contratos) continuam verdes | sim |
| Testes unitários R2 (§12.A) | sim |
| Testes locais da RPC (§12.B) | sim |
| Testes concorrentes (§12.C) | sim |
| Teste do gate arquitetural (§12.E) | sim |
| `npm run typecheck` | sim |
| `npm run check:architecture` | sim |
| `npm run smoke:rls` com a matriz §11.3 | sim |
| `security-audit` — **job de CI** (`.github/workflows/test.yml`), não script npm | sim |
| `supabase db reset` aplica e valida as migrations em banco **local/CI** (Supabase CLI) | sim |
| Bugbot (Cursor) | sim — zona vermelha |
| Security Review (Cursor) | sim — RLS + grants da RPC + jsonb + idempotência |
| Revisão humana **ou** exceção formal registrada de mantenedor único | sim |
| **Zero** migration remota | sim |
| **Zero** deploy | sim |
| **Zero** R3 | sim |

### 13.5 Branch, título e descrição

```text
feat/fsrs-mvp-r2-persistence
PR-R2  feat(fsrs): migration spaced_review_* + RPC transacional + persistence (sem UI)
```

```markdown
## Escopo R2
- Migration: spaced_review_cards + spaced_review_logs + fsrs_persist_review (RPC transacional)
- lib/fsrs/persistence* + fingerprint (server-only)
- Gate arquitetural contra escrita direta nas tabelas FSRS
- Testes: unidade, RPC local, concorrência real, smoke RLS

## Fora de escopo
- Rotas, UI, env flags, registrar-tentativa, R3/R4

## Atomicidade
- [ ] Card + log em transação única (RPC); nenhuma escrita fora da RPC
- [ ] revision/CAS + igualdade de state_before cobertos por teste concorrente
- [ ] Nenhum EXCEPTION WHEN OTHERS convertendo erro em retorno

## Transporte
- [ ] persistence_unknown implementado; retry retém e reenvia o payload semântico original idêntico
- [ ] mesmo attempt_id com payload divergente retorna conflict, sem write
- [ ] classificação conservadora Supabase/PostgREST testada (§9.2.1, §12.C caso D)

## RLS
- [ ] Matriz service-role-first (spec §11.1) aplicada sem divergência
- [ ] smoke:rls verde com casos novos

## Banco
- [ ] Aplicado e validado SOMENTE em banco local/CI
- [ ] Nenhuma migration remota; staging exige autorização separada
- [ ] types/database.ts: padrão confirmado (§13.2)

## Rollback
- Rollback de código NÃO apaga tabelas nem dados
- Reverter schema só por decisão explícita + migration própria
```

---

## 14. Rollback, retenção e compatibilidade

| Nível | Ação |
|-------|------|
| Pré-R3 | Tabelas vazias; sem impacto no aluno |
| Pós-R3 (futuro) | `FSRS_MVP_ENABLED=false` interrompe writes |
| Código | **Rollback de código não apaga tabelas nem dados** — reverter o PR remove a camada TypeScript, não o schema |
| Schema | **Não executar `DROP` automático** de `spaced_review_cards`, `spaced_review_logs` ou `fsrs_persist_review` depois de uso real |
| Migration remota | **Não faz parte do PR R2** — aplicar e validar somente em banco local/CI; staging/produção exigem autorização separada |
| Retenção / GDPR | **Decisão formalmente adiada** — além da cascata de exclusão de conta (§11.4), não há política de retenção no R2 |
| `DELETE` na aplicação | **R2 não oferece** — nenhuma superfície de exclusão, nenhum expurgo, nenhum TTL |
| Limpeza futura | Exige decisão registrada **e** migration própria; não entra por hotfix |
| Contratos R1 | Migration **não** altera `lib/fsrs/**` sem novo ADR |

---

## 15. Riscos e mitigação (R2)

| Risco | Mitigação |
|-------|-----------|
| **Lost update** entre revisões concorrentes | `revision` + CAS duplo (§3.1.1, §8.3) + teste concorrente (§12.C) |
| **Card sem log / log sem card** | Transação única (§4.1) + proibições (§4.2) |
| **Commit parcial por broad catch** | Proibição de `EXCEPTION WHEN OTHERS` (§4.6); outcomes decididos em passos read-only |
| Replay vs payload divergente indistinguíveis | `semantic_fingerprint` (§7) |
| **Write duplicado após timeout** | `persistence_unknown` + retenção e reenvio do payload original idêntico (§9) |
| **Denormalizado divergindo do estado** | Derivação na RPC (§8) + testes de coerência (§12.B) |
| **Bypass da RPC no código** | Gate estático + teste (§6.5) |
| Deadlock entre transações | Ordem de locks fixa (§6.2) |
| JSON não confiável em `jsonb` | `deserializeFsrsMvpCard` antes do write **e** após todo read (§10) |
| RLS permissiva demais | Matriz única (§11.1) + Security Review + smoke (§11.3) |
| RPC exposta ao browser | `REVOKE` de `PUBLIC`/`anon`/`authenticated`; `GRANT` só a `service_role` (§4.5) |
| Vazamento de estado em log de aplicação | Proibição explícita (§5.4, §10.3) |
| Bundle client com `ts-fsrs` | `server-only` + nenhum import em `'use client'` |
| Acoplamento EE | Proibido importar `lib/evidence/**`, inclusive no fingerprint |
| Diff amplo em `types/database.ts` | §13.2 — separar e revisar antes |
| PR mistura UI | Rejeitar no review |

---

## 16. Consistência entre documentos

Em divergência prevalece o ADR — exceto nos pontos operacionais abaixo, cuja fonte é esta spec.

| Tema | Fonte da verdade | Estado |
|------|------------------|--------|
| Contratos R1 (`FsrsAttemptContext`, `FsrsMvpSerializedCard`, rating, review unit) | `lib/fsrs/**` + ADR §4–§6, §9.3 | **Preservados**; esta spec consome, não redefine |
| Formato de `review_unit_id` | R1 (`lib/fsrs/reviewUnit.ts`) | `fsrs:v1:discipline=…:cluster\|subtopico=…` |
| Atomicidade card+log | Esta spec, §4 | ADR e Plano apontam para cá |
| `revision` / CAS | Esta spec, §3.1.1 e §8.3 | Refletido no schema conceitual do ADR §9.1 |
| Campos denormalizados derivados | Esta spec, §8 | Novo no R2; não contradiz o ADR |
| Idempotência / conflito | Esta spec, §7 | ADR §10 descreve os mesmos cenários; os **nomes** dos outcomes são definidos aqui |
| `writeStatus` / `persistence_unknown` | Esta spec, §9 | Novo no R2 |
| Matriz RLS | Esta spec, §11.1 | Replicada no Plano §3.2.1; ADR §9.5 **referencia** esta seção |
| `ON DELETE CASCADE` | Esta spec, §11.4 | Exceção de ciclo de vida, explicitada |
| Aplicação da migration | Esta spec, §14 | Plano §3.5 corrigido: **local/CI**, não staging |
| R3 | Bloqueado | Nenhum documento autoriza R3 |

---

## 17. O que o R3 herdará (não implementar agora)

```typescript
// Pseudocódigo — R3 apenas
const plan = planFsrsRating({ context, isCorrect });   // isCorrect vem do servidor
if (!plan.eligible) return;

const current = await persistence.loadCard({ userId, reviewUnitId }); // valida ao ler
const out = scheduler.review({
  card: current?.card ?? null,
  rating: plan.rating,
  reviewedAt,
});

const res = await persistence.persistReview({
  userId, attemptId, reviewUnitId, reviewUnitKind, questionId,
  attemptContext: plan.context,
  isCorrect,
  rating: plan.rating,
  reviewedAt,
  expectedRevision: current?.revision ?? null,
  serializedBefore: current?.serialized ?? null,
  serializedAfter: out.serialized,
});

// R3 decide o que fazer com:
//  - res.outcome === 'revision_conflict'   → retry/recompute
//  - res.outcome === 'persistence_unknown' → retry com o MESMO payload original integral
//  - res.outcome === 'conflict'            → alerta/auditoria
```

Pertence ao **R3**, não ao R2:

- política de **retry / recompute** após `revision_conflict`;
- retenção do payload original ou retry token equivalente após `persistence_unknown`;
- política de **retry** após `persistence_unknown` (contagem, backoff), sem reler/recalcular o payload;
- tratamento de `conflict` (alerta, auditoria, descarte);
- mapeamento de sinais do servidor → `FsrsAttemptContext` (ADR §6.1: **sem** `isReplay`);
- `resolveQuestionAttempt`, flags de env, resposta HTTP não bloqueante.

O R2 apenas **reporta** os outcomes de forma tipada.

---

## 18. Próximo passo exato

1. **Revisão independente desta spec.** Ela foi reconstruída sobre `main` canônico (R1 mergeado) e **aguarda revisão** antes de qualquer execução.
2. **Aprovação explícita:** `pode iniciar R2` — não é automática nem implícita pela existência desta spec.
3. Branch `feat/fsrs-mvp-r2-persistence` a partir de `main` atualizado.
4. Implementar migration + RPC + persistence + gate + testes conforme esta spec.
5. PR isolado; **não** iniciar R3 na mesma conversa.

**Não iniciar R2 sem autorização explícita do mantenedor.**

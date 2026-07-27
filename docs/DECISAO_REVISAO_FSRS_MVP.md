# Decisão — Revisão espaçada FSRS MVP (pivot de produto)

**Data:** 2026-07-27  
**Status:** R1 contratos puros — pin `ts-fsrs@5.4.1`; R2/R3 **não** autorizados (sem migration, rotas, UI ou wiring de produto neste lote)

**Escopo:** agendador FSRS mínimo, seguro e reversível, com superfície futura “Revisões de hoje”.  
**Não inclui neste MVP:** convicção, `measurement_pool`, RCT, `learner_skill_state`, T1, bandit, LLM em runtime, otimização de parâmetros FSRS, domínio por competência.

**Baseline da branch R1:** `feat/fsrs-mvp-r1-contracts` criada a partir de `7633118b` (main na época). R1 fixa **`ts-fsrs@5.4.1`** (pin exato em `package.json` / lock + constante `FSRS_MVP_PACKAGE_VERSION`). Evidence Engine permanece em main, preservado e desacoplado — fundamentação EE abaixo cita **main**.

Complementa (não substitui):

- [`DECISAO_EVIDENCE_ENGINE.md`](DECISAO_EVIDENCE_ENGINE.md) — EE V1 (instrumentação → RCT → FSRS como hipótese posterior)
- [`SPEC_EVIDENCE_ENGINE_FASE_1_EVENT_STREAM.md`](SPEC_EVIDENCE_ENGINE_FASE_1_EVENT_STREAM.md)
- [`PLANO_IMPLEMENTACAO_EVIDENCE_ENGINE_FASE_1.md`](PLANO_IMPLEMENTACAO_EVIDENCE_ENGINE_FASE_1.md)
- [`EVIDENCE_FASE5_FSRS_RCT2.md`](EVIDENCE_FASE5_FSRS_RCT2.md) — FSRS-like gated no EE (não é este MVP)
- Plano irmão: [`PLANO_IMPLEMENTACAO_REVISAO_FSRS_MVP.md`](PLANO_IMPLEMENTACAO_REVISAO_FSRS_MVP.md)

---

## 1. Contexto

O AVANT já tem revisão espaçada **heurística** e um Evidence Engine **congelável** em main. O produto precisa de retenção útil **agora**, sem esperar RCT-1/RCT-2 do EE.

### 1.1 O que existe hoje (código real)

| Fonte | Papel real | Limitação para retenção |
|-------|------------|-------------------------|
| [`lib/spaced-repetition.ts`](../lib/spaced-repetition.ts) L42–L149, L175–L258 | SM-2 **simplificado** recalculado on-the-fly a partir de `historico_questoes`; unidade = `modulo_slug` | Não é FSRS; não persiste card; mesma questão; replay muda `created_at` e distorce o “due” |
| [`app/(dashboard)/(authenticated)/plano-diario/page.tsx`](../app/(dashboard)/(authenticated)/plano-diario/page.tsx) L7–L28 | UI “Plano diário” com `LIMITE_DIARIO = 10` via `getTodayReviews` | Superfície existente; algoritmo SM-2; não separa elegibilidade pré-explicação |
| [`lib/recommendations.ts`](../lib/recommendations.ts) L238–L288, L593–L606 | Categoria `spaced_repetition` / `review_needed` por erros recentes + dias desde última tentativa | Heurística de score; não agenda due dates FSRS |
| [`historico_questoes`](../supabase/migrations-legacy/create_historico_questoes.sql) L10–L18 | `user_id`, `modulo_slug`, `topico`, `subtopico`, `banca`, `acertou`, `created_at` | Sem `attempt_id`; replay **UPDATE** (não append-only) — ver rotas abaixo |
| [`app/api/registrar-tentativa/route.ts`](../app/api/registrar-tentativa/route.ts) (local L98–L172; main + hook EE L191+) | Gabarito via `resolveQuestionAttempt`; INSERT ou UPDATE histórico | Cliente envia `banca`/`topico`/`subtopico`; **não** confiar `acertou` do client (já recalculado no server) |
| [`app/api/simulado/responder/route.ts`](../app/api/simulado/responder/route.ts) L189–L264 | Idem gabarito server-side; sync histórico | UPDATE de histórico **não** bumpa `created_at` (difere do player) |
| [`app/api/concluir-estudo-reverso/route.ts`](../app/api/concluir-estudo-reverso/route.ts) L84–L93 | Marca `estudo_reverso_concluido` e bumpa `created_at` | Conclusão de slides **não** deve alimentar FSRS MVP |
| Evidence em **main** (`lib/evidence/*`, migration `20260724180000_evidence_attempt_events.sql`) | Event stream paralelo, dual-write sob `EE_V1_INSTRUMENTATION` | Default **off** (`lib/env.ts` L496–L525 em main); FSRS EE é stub gated (`fsrsSkill.ts` L2–L15) |
| `package.json` / `package-lock.json` (branch R1) | Pin **`ts-fsrs@5.4.1`** (MIT, Node ≥20) | R1 instala **somente** este pin; não bumpa versão; adapter em `lib/fsrs/` — **sem** wiring de produto |

### 1.2 Problema de produto

1. SM-2 por **enunciado** (`modulo_slug`) confunde memorização do card com transferência.
2. Replay / marcar estudado bumpam `created_at` no player e em `concluir-estudo-reverso`, misturando sinal de revisão.
3. Evidence Engine resolve instrumentação e ciência de longo prazo, mas o FSRS do EE está **adiado** até uplift do RCT-1 (`DECISAO_EVIDENCE_ENGINE.md` invariante 12; `fsrsSkill.ts` exige `rct1UpliftConfirmed === true`).
4. Continuar o roadmap completo do EE **antes** de entregar retenção simples atrasa valor ao aluno.

---

## 2. Decisão

**Pivot:** implementar um **FSRS MVP de produto**, paralelo e independente do Evidence Engine, com scheduler comprovado (`ts-fsrs`), cards persistidos por unidade de memória, fila “Revisões de hoje”, e integração não bloqueante nas rotas de tentativa elegíveis.

| # | Decisão congelada neste ADR |
|---|------------------------------|
| 1 | Scheduler = biblioteca FSRS comprovada (`ts-fsrs`); **proibido** inventar fórmula própria |
| 2 | Sem IA/LLM/API externa no caminho de agendamento |
| 3 | Parâmetros FSRS **default** da biblioteca no MVP |
| 4 | Retenção desejada inicial configurável no **servidor**; proposta `request_retention = 0.90` |
| 5 | Rating: errado → `Again`; correto → `Good`; inelegível → **não atualiza** |
| 6 | **Não** usar `Easy` |
| 7 | **Não** derivar `Hard` por tempo de resposta no MVP |
| 8 | Unidade de memória: **cluster** quando existir **e** tiver inventário ≥ limiar; senão **subtópico** |
| 9 | Card = `user_id × review_unit_id` |
| 10 | Revisão prefere **outra** questão da unidade (não o mesmo enunciado) |
| 11 | Mesmo enunciado repetido **não** comprova transferência (pode ser fallback de inventário, nunca “domínio”) |
| 12 | Somente tentativa **antes de explicação** atualiza FSRS |
| 13 | Slides, T1 imediato, gabarito já revelado, replay técnico **não** atualizam |
| 14 | Histórico de review **append-only** (`spaced_review_logs`) |
| 15 | Idempotência por `attempt_id` |
| 16 | Vitrine livre **preservada** (sem filtro de measurement pool neste MVP) |
| 17 | Nova superfície simples: **“Revisões de hoje”** (pode reutilizar shell do Plano diário; ver §8) |
| 18 | Evidence Engine **congelado**, código **preservado**, flags **desligadas** (default) |
| 19 | Sem convicção, `measurement_pool`, RCT, `learner_skill_state` ou T1 neste MVP |

---

## 3. Alternativas rejeitadas

| Alternativa | Por que rejeitada |
|-------------|-------------------|
| Continuar só SM-2 em [`lib/spaced-repetition.ts`](../lib/spaced-repetition.ts) | Fórmula própria/simplificada; unidade = enunciado; sem card persistido; frágil a UPDATE de `created_at` |
| Implementar FSRS “na mão” | Viola decisão 1; risco de bugs de estabilidade/dificuldade; sem comunidade/validação |
| Ativar FSRS do EE (`lib/evidence/fsrsSkill.ts`) agora | Stub FSRS-*like* (não `ts-fsrs`); gated em RCT-1; unidade = `skill_id`; acopla produto a experimento científico |
| Esperar RCT-1/RCT-2 do EE antes de qualquer revisão | Atrasa retenção útil; EE ADR já separa ciência de produto legado |
| Card por `modulo_slug` | Memorize o enunciado; viola decisão 10–11 |
| Card por `skill_id` EE | Exige anotação `evidence_ready` / inventário de piloto; fora do MVP |
| Rating 4 botões (Again/Hard/Good/Easy) na UI | Complexidade UX; Easy proibido; Hard por tempo adiado |
| Confiar `acertou` / `rating` do cliente | Gabarito já é server-side (`resolveQuestionAttempt`); rating deve derivar só do acerto recalculado |
| Substituir/apagar Evidence Engine | Proibido; EE permanece para instrumentação futura |
| Ligar `EE_V1_INSTRUMENTATION` como pré-requisito do MVP | MVP não depende do stream; flags ficam off |

---

## 4. Unidade de memória (`review_unit_id`)

### 4.1 Formato versionado (R1.1)

Namespace obrigatório com **disciplina** + kind + valor escapado:

- `fsrs:v1:discipline=<nfc-escaped>:cluster=<nfc-escaped>`
- `fsrs:v1:discipline=<nfc-escaped>:subtopico=<nfc-escaped>`

Normalização determinística (trim → colapsar espaços → lowercase → Unicode **NFC**) + `encodeURIComponent` nos valores. Disciplinas distintas **nunca** compartilham o mesmo id; `cluster=` e `subtopico=` **não** colidem entre si.

Implementação: `lib/fsrs/reviewUnit.ts` (`resolveReviewUnitId`).

### 4.2 Resolução (ordem)

1. **Cluster** — somente se o caller passar `knowledgeClusterId` **e** `clusterInventoryConfirmed === true` (confirmação explícita de validade + inventário suficiente).  
   - `knowledge_cluster_id` é **input futuro/offline** — **não** é coluna do schema atual do banco.  
   - R1 **não** consulta inventário/DB; limiar N (proposta N=3) é responsabilidade do caller (R3/R4).
2. **Fallback subtópico** — se confirmação ausente/false: exigir `subtopico` válido.
3. Se disciplina vazia/inválida, ou subtópico ausente/“Geral” sem cluster confirmado → **falha explícita** (não inventar unidade).

### 4.3 O que **não** é unidade neste MVP

| Campo existente | Por que não |
|-----------------|-------------|
| `modulo_slug` | É o card/enunciado, não a memória a transferir |
| `meta.pedagogical_branch` / `meta.family` | Molde L3 / família de prova — EE ADR §6: **não** são `skill_id`; também **não** são `review_unit` FSRS MVP |
| `primary_skill_id` (EE) | Microcompetência científica; exige gate `evidence_ready`; adiado |
| Clusters NeuroCanvas / blockers editoriais (`lib/neurocanvas/editorialQueue.ts`) | Clusters de **auditoria de conteúdo**, não inventário pedagógico do aluno |

### 4.4 Inventário

- Fonte MVP (R3/R4): agrupamento por `modulos_estudo.subtopico` / `conteudo_json.meta.subtopico` +, quando existir, registro estático de clusters anotados offline.
- Piloto EE em **origin/main** (`data/evidence/pilot-pt-*.json`) tem inventário fictício / `minimum_inventory_confirmed: false` — **não** serve como inventário FSRS MVP. Docs EE permanecem em main; esta branch não copia EE.

---

## 5. Política de rating

| Resultado (`isCorrect`, derivado no **servidor** no R3) | Rating FSRS | Notas |
|----------------------|-------------|-------|
| elegível + `isCorrect === false` | `Again` | Único rating de falha |
| elegível + `isCorrect === true` | `Good` | Único rating de sucesso |
| Tentativa inelegível | — | Sem `next` state; sem log de schedule |
| `Hard` | **Não usado** | Adiado (decisão 7) |
| `Easy` | **Proibido** | Decisão 6 |

R1 expõe `mapCorrectToRating(isCorrect)` / `planFsrsRating` — **não** deriva gabarito. No R3, `isCorrect` virá de `resolveQuestionAttempt`.

Parâmetros: `request_retention = 0.90`; `enable_fuzz = false` (determinismo MVP). Env tipado só no R3.

---

## 6. Elegibilidade semântica (`FsrsAttemptContext`)

Contrato fechado em `lib/fsrs` (R1.1). **Fail-closed.**

| Contexto | Elegível? |
|----------|-----------|
| `cold_practice` | sim |
| `scheduled_review` | sim |
| `post_explanation` | não |
| `immediate_transfer` | não |
| `answer_revealed` | não |
| `technical_retry` | não |
| `invalid_question` | não |
| `unknown` | não |
| valor inválido / ausente | não |

### 6.1 O que `isReplay` **não** é

- `historico_questoes.isReplay` (ou equivalente técnico no `registrar-tentativa`) é apenas um **sinal técnico/histórico** do produto atual.
- **Não** possui semântica pedagógica suficiente para decidir FSRS.
- **Não** significa “pós-explicação”.
- **Não** participa do contrato R1 (`FsrsAttemptContext` / `isFsrsEligibleAttempt` / `planFsrsRating`).
- **R3** mapeará sinais confiáveis do servidor (etapa do player, sessão de revisão, etc.) → `FsrsAttemptContext`. Sem heurística temporal, sem inferência por convicção, sem confiança cega na origem do client.

### 6.2 Exemplos de eventos de produto (orientação futura; wiring = R3)

| Evento | Contexto esperado (R3) |
|--------|------------------------|
| Primeira prática a frio elegível | `cold_practice` |
| Item da fila “Revisões de hoje” | `scheduled_review` |
| Após NeuroSlides / gabarito revelado | `post_explanation` / `answer_revealed` |
| T1 / transferência imediata | `immediate_transfer` |
| Retry técnico / questão inválida | `technical_retry` / `invalid_question` |
| SM-2 / recommendations legado | fora do contrato — **não** escrevem cards FSRS |
| Dual-write Evidence | stream paralelo — **não** é rating FSRS MVP |

---

## 7. Seletor de questões

Quando um card está `due` (`due_at <= now`):

1. Listar inventário da `review_unit_id` com entitlement.
2. Preferir questão **≠** última `question_id` usada no card / logs recentes.
3. Preferir questão **nunca** respondida pelo usuário na unidade; senão a menos recente.
4. Se só resta o mesmo enunciado → servir com flag `same_stem_fallback: true` (telemetria); **não** declarar transferência.
5. Se inventário vazio → pular card (`inventory_missing`); não mentir fila.

Determinismo: ordenação estável por `(priority_due, review_unit_id, modulo_slug)`.

---

## 8. Fallbacks e superfícies

| Situação | Comportamento |
|----------|---------------|
| Sem cluster anotado / inventário não confirmado | `fsrs:v1:discipline=<esc>:subtopico=<esc>` |
| Inventário < N no cluster | Downgrade para subtópico **se** subtópico válido; senão unidade não resolvida |
| Falha do adapter/DB FSRS | Log + métrica; HTTP da tentativa **inalterado** (aluno vê gabarito) |
| Flag FSRS off | Zero writes; Plano diário legado (SM-2) permanece até cutover |
| Vitrine `/estudar` | Intocada: browse livre |
| Plano diário atual | Durante beta: manter SM-2 **ou** redirecionar para “Revisões de hoje” sob flag (decisão de UX no R4; default = superfície nova paralela) |

---

## 9. Schema conceitual

### 9.1 `spaced_review_cards` (estado atual do card)

| Coluna | Tipo conceitual | Notas |
|--------|-----------------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK → auth.users | RLS: próprio |
| `review_unit_id` | text | `fsrs:v1:discipline=…:cluster|subtopico=…` |
| `review_unit_kind` | enum | `cluster` \| `subtopico` |
| `fsrs_state` | jsonb | `FsrsMvpSerializedCard` versionado (abaixo) |
| `due_at` | timestamptz | Denormalizado para fila |
| `stability` / `difficulty` | numéricos opcionais | Denormalizados p/ métricas |
| `reps` / `lapses` | int | |
| `last_rating` | text nullable | `again` \| `good` |
| `last_question_id` | text nullable | `modulo_slug` |
| `last_attempt_id` | uuid nullable | Último aplicado |
| `created_at` / `updated_at` | timestamptz | |

**Unique:** `(user_id, review_unit_id)`.

### 9.2 `spaced_review_logs` (append-only)

| Coluna | Notas |
|--------|-------|
| `id` | uuid PK |
| `user_id` | |
| `review_unit_id` | |
| `attempt_id` | **unique** (idempotência) |
| `question_id` | `modulo_slug` |
| `rating` | `again` \| `good` |
| `correct` | boolean (server) |
| `scheduled_days` | intervalo resultante |
| `due_at_before` / `due_at_after` | |
| `fsrs_state_before` / `fsrs_state_after` | jsonb |
| `same_stem_fallback` | boolean |
| `created_at` | server now; **sem UPDATE/DELETE** de app |

### 9.3 Payload serializado do card (`FsrsMvpSerializedCard`, R1.1)

Schema persistível **versionado** (sem migration neste lote; R2 persiste jsonb):

| Campo | Valor / regra |
|-------|----------------|
| `schemaVersion` | `1` (desconhecido → rejeitar) |
| `algorithm` | `'ts-fsrs'` |
| `algorithmVersion` | `'5.4.1'` (constante auditável `FSRS_MVP_PACKAGE_VERSION`; **não** ler `package.json` em runtime) |
| `due` / `lastReview` | ISO-8601 com timezone explícito |
| `stability`, `difficulty`, `elapsedDays`, `scheduledDays`, `learningSteps`, `reps`, `lapses` | números finitos; não-negativos onde aplicável |
| `state` | `New` \| `Learning` \| `Review` \| `Relearning` |

Round-trip sem perda; payload parcial / NaN / Infinity / datas ou states inválidos → rejeição explícita (sem “correção” silenciosa).  
**schemaVersion 1:** propriedades extras desconhecidas são **rejeitadas** (não ignoradas). Evolução do formato exige nova `schemaVersion` ou alteração deliberadamente compatível.

### 9.4 Fora do schema MVP

- Não criar `learner_skill_state`.
- Não alterar `evidence_attempt_events` para carregar FSRS.
- Não tornar `historico_questoes` append-only neste pivot (débito conhecido; FSRS usa logs próprios).
- **Proibida** coexistência SM-2 + FSRS na **mesma** superfície futura (uma fila ativa por flag).

---

## 10. Idempotência

| Cenário | Comportamento |
|---------|---------------|
| Mesmo `attempt_id` reenviado | Sem segundo update de card; sem segundo log; sucesso idempotente |
| Novo `attempt_id` (nova confirmação humana) | Novo log + update de card **se** elegível |
| `attempt_id` ausente | Não atualiza FSRS (fail-safe); tentativa legada segue |
| Conflito de payload no mesmo `attempt_id` | Log de auditoria; card intocado |

`attempt_id`: UUID gerado no cliente no momento do Confirmar (mesmo padrão EE SPEC §1.2) **ou** gerado no servidor se o client legado não enviar — mas a chave de idempotência persistida é sempre server-side no log. Detalhe de wire no plano R3.

---

## 11. Relação com o código existente

| Componente | Relação com FSRS MVP |
|------------|----------------------|
| `lib/spaced-repetition.ts` | **Legado** até cutover; não misturar SM-2 e FSRS na mesma fila sem flag |
| `getTodayReviews` / `GET /api/analytics/reviews` | Substituídos **ou** branchados por flag para ler `spaced_review_cards.due_at` |
| `plano-diario` | Shell UI reaproveitável; copy/algoritmo migram sob flag |
| `lib/recommendations.ts` | Permanece híbrido legado; **não** é o scheduler FSRS; eventual boost `due` é pós-MVP |
| `resolveQuestionAttempt` | **Reutilizar** — única fonte de `correct` |
| `registrar-tentativa` | Hook pós-persistência histórico, **não bloqueante**, só se elegível |
| `simulado/responder` | Fora do MVP (adiado) |
| `questaoPlayerPayload` `fromPlano` | Passa a consumir fila FSRS quando flag on (L189–L191 hoje usa `getTodayReviews`) |
| Freemium (`FREEMIUM_ESTUDO_REVERSO_DAILY_LIMIT`) | Revisões due **não** devem consumir cota de “questão nova” da mesma forma que primeira exposição — regra explícita no R4 |

---

## 12. Relação com Evidence Engine

| Aspecto | Política deste pivot |
|---------|----------------------|
| Código `lib/evidence/**` | **Preservar**; não apagar; não “completar” Fases 2–6 agora |
| `EE_V1_INSTRUMENTATION` | Manter **default off**; não exigir on para FSRS MVP |
| `evidence_attempt_events` | Ledger paralelo; MVP **não** escreve rating FSRS nele |
| `fsrsSkill.ts` / `rct2.ts` | Permanecem stubs gated; **não** wiring de produto |
| `learnerSkillState.ts`, TransferCTA, ConvictionSelector | Congelados / fora do MVP |
| Convergência futura | Possível: EE `scheduled_review` eventos + cards FSRS compartilharem `attempt_id`; **fora** deste ADR |

Este pivot **não** invalida o ADR do EE: o EE continua sendo o caminho científico (RCT). O FSRS MVP é **produto de retenção** com escopo estreito, explícito e reversível.

---

## 13. Rollout

1. R1–R2 em PRs isolados (contratos → migration).
2. R3 atrás de flag server `FSRS_MVP_ENABLED` (default false).
3. R4 beta: allowlist de e-mails / coorte interna; superfície “Revisões de hoje”; limite diário (proposta: 10, alinhado ao Plano diário atual).
4. R5 métricas ≥ janela mínima antes de default-on.
5. Cutover: flag on para Pro ou % gradual; SM-2 permanece como fallback se flag off.

---

## 14. Rollback

| Nível | Ação |
|-------|------|
| Instantâneo | `FSRS_MVP_ENABLED=false` → fila volta a SM-2 / esconde superfície nova |
| Dados | Cards/logs permanecem (append-only); não precisam ser apagados |
| Schema | Migration **não** dropada em emergência; feature off basta |
| EE | Intocado |

---

## 15. Métricas (R5)

| Métrica | Definição mínima |
|---------|------------------|
| Retenção observada | Fração Good em cards com `due_at` ≥ 7d desde last review |
| Acerto D+7 / D+14 | Acerto na primeira tentativa elegível após intervalo ≥ 7/14 dias na unidade |
| Lapses / dia | Count `rating=again` |
| Carga diária | Cards due servidos / limite |
| Fallback mesmo enunciado | Taxa `same_stem_fallback` |
| Idempotência | Replays sem segundo log |
| Erros scheduler | Contagem de falhas não bloqueantes |

**Não** usar engajamento de slides como proxy de retenção.

---

## 16. Riscos

| Risco | Mitigação |
|-------|-----------|
| Inventário fino (1 questão/subtópico) → same-stem | Flag + métrica; não declarar domínio |
| Subtópico canônico vs título legado drift | Preferir `meta.subtopico`; normalização; inelegível se ambíguo |
| Dupla fila SM-2 + FSRS confunde aluno | Uma superfície ativa por flag |
| `historico_questoes` UPDATE continua distorcendo analytics | FSRS não depende de `created_at` do histórico para due |
| Acoplamento acidental ao EE | Pacote `lib/fsrs/**` isolado; proibido importar `lib/evidence/fsrsSkill` |
| Zona vermelha (RLS/migration) | Migration em PR próprio; revisão humana |

---

## 17. Critérios de sucesso

1. Card único por `(user, review_unit)`; nenhum `attempt_id` aplica duas vezes.
2. Zero updates FSRS a partir de slides / concluir-estudo / T1 / preview.
3. Gabarito e rating derivados só no servidor.
4. Falha FSRS não altera status HTTP da tentativa.
5. Vitrine livre inalterada.
6. EE intacto e flags off por default.
7. Beta: fila due estável; `same_stem_fallback` monitorado; retenção D+7 observável.

---

## 18. Decisões adiadas

- Otimização / personalização de parâmetros FSRS.
- Rating `Hard` (tempo ou UI).
- Integração FSRS ← eventos EE `scheduled_review`.
- Simulado como fonte de update.
- Card por `skill_id` / domínio EE.
- Tornar `historico_questoes` append-only.
- Bandit / LLM / measurement_pool.
- Default-on global sem métricas R5.

---

## 19. Comparação obrigatória

| Aspecto | Atual (legado) | FSRS MVP (este ADR) | Evidence Engine futuro |
|---------|----------------|---------------------|------------------------|
| Scheduler | SM-2 simplificado on-the-fly ([`spaced-repetition.ts`](../lib/spaced-repetition.ts) L48–L149) | `ts-fsrs` + cards persistidos | Intervalos fixos → FSRS-*like*/real pós RCT-1 (`fsrsSkill.ts`, Fase 5) |
| Unidade | `modulo_slug` (enunciado) | `cluster` c/ inventário → senão `subtopico` | `skill_id` (microcompetência anotada) |
| Persistência de intervalo | Recalcula do histórico | `spaced_review_cards` + logs append-only | `learner_skill_state` / schedule EE (não ativado em produto) |
| Sinal de acerto | `historico_questoes.acertou` (UPDATE em replay) | Rating Again/Good só pré-explicação + `attempt_id` | Event stream `evidence_attempt_events` + contexts |
| Transferência | Não medida (mesmo slug) | Prefere outra questão; same-stem = fallback | T1 imediato + holdout + RCT |
| UI revisão | Plano diário (SM-2) | “Revisões de hoje” | Sessões adaptativas + TransferCTA (tratamento) |
| Convicção | Ausente no fluxo legado | Ausente | ConvictionSelector (coorte/RCT) |
| Vitrine | Livre | Livre | Livre exceto `measurement_pool` em experimento |
| LLM runtime | Não no scheduler | Não | Proibido na V1 EE |
| Flags | — | `FSRS_MVP_ENABLED` | `EE_V1_INSTRUMENTATION` (default off) |
| Ciência causal | Nenhuma | Observacional (métricas R5) | RCT-1 pacote; RCT-2 FSRS |

---

## 20. Invariantes não negociáveis

1. Nenhuma mesma tentativa atualiza o card duas vezes.
2. Nenhuma atualização por slide.
3. Nenhuma atualização pós-explicação.
4. Nenhuma atualização por T1 imediato.
5. Nenhuma confiança em `correct`/`rating` vindos do cliente.
6. Nenhum LLM runtime.
7. Nenhum “domínio” baseado em um acerto.
8. Falha do scheduler não bloqueia o estudante.
9. Evento/log de review persistido nunca é sobrescrito.
10. Migration não entra no mesmo PR que UI.
11. Evidence Engine não é apagado.

---

## 21. Próximo passo

R1 (contratos puros + pin `ts-fsrs@5.4.1`) fecha em PR isolado Draft.  
**R2** (persistência) e **R3** (integração) permanecem **não autorizados**.  
Evidence Engine permanece preservado/desacoplado (docs/código em `origin/main`). Vitrine livre. Proibida coexistência SM-2 + FSRS na mesma superfície futura.

# Especificação operacional — Evidence Engine Fase 1: Event Stream

**Data:** 2026-07-24  
**Status:** proposta para aprovação — sem implementação  
**Fase:** 1 — instrumentação pura  
**Decisão-mãe:** [DECISAO_EVIDENCE_ENGINE.md](DECISAO_EVIDENCE_ENGINE.md)

## Objetivo da Fase 1

Produzir eventos confiáveis e auditáveis sobre tentativas, em paralelo ao `historico_questoes` atual, **sem** ativar domínio, recomendações adaptativas, T1, `measurement_pool` ou FSRS.

Esta spec é operacional: descreve contratos, pontos de instrumentação e gates de saída. **Não autoriza** migrations, rotas, componentes ou flags em produção até aprovação humana deste documento e do ADR.

---

## 1. Escopo

### 1.1 Event stream append-only

- Nova persistência **append-only** em paralelo a [`historico_questoes`](../supabase/migrations-legacy/create_historico_questoes.sql).
- **Não substitui** `historico_questoes` na V1 ([ADR §7](DECISAO_EVIDENCE_ENGINE.md#7-event-stream-append-only-paralelo-a-historico_questoes)).
- Recomendações ([`lib/recommendations.ts`](../lib/recommendations.ts)), vitrine, plano diário e analytics legados continuam lendo `historico_questoes` até fase posterior explicitamente aprovada.
- Eventos **nunca** sofrem `UPDATE` / `DELETE` pedagógicos. Compensação = novo evento append-only ou registro de auditoria separado (fora desta tabela).
- Tabela proposta (nome final sujeito a revisão de engenharia):

```sql
-- PROPOSTO PELA SPEC — não existe no repositório
CREATE TABLE evidence_attempt_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id text NOT NULL,           -- = modulo_slug no catálogo atual
  question_version text NOT NULL,
  selected_alternative text NOT NULL,
  correct boolean NOT NULL,
  conviction text NOT NULL,            -- chute | entre_duas | certeza | unknown
  context text NOT NULL,
  started_at timestamptz NOT NULL,
  answered_at timestamptz NOT NULL,
  response_time_ms integer,
  response_time_status text NOT NULL,  -- valid | invalid | unknown
  response_time_invalid_reason text,
  answer_change_count integer NOT NULL DEFAULT 0,
  session_id uuid,
  source text NOT NULL,
  is_internal boolean NOT NULL DEFAULT false,
  event_type text NOT NULL DEFAULT 'attempt',
  -- Campos reservados para fases posteriores; nullable na Fase 1
  primary_skill_id text,
  experiment_id uuid,
  arm_assignment_id text,
  measurement_window_assignment_id text,
  holdout_assignment_id text,
  measurement_window text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Partial unique: PostgreSQL não aceita UNIQUE ... WHERE inline em CREATE TABLE
CREATE UNIQUE INDEX evidence_attempt_events_attempt_id_attempt_uidx
  ON evidence_attempt_events (attempt_id)
  WHERE event_type = 'attempt';
```

- Índices propostos adicionais: `(user_id, created_at DESC)`, `(question_id, created_at DESC)`, `(user_id, question_id)`, `(session_id)` quando não nulo.
- RLS: políticas de SELECT/INSERT equivalentes a `historico_questoes` (`auth.uid() = user_id`) para acesso direto. Na prática, as Route Handlers atuais usam [`createServerSupabase()`](../lib/supabase/server.ts) (service role) após validar JWT — o mesmo padrão vale para a ingestão EE: **RLS protege acesso direto; a API valida Bearer e escreve com service role**. Escrita via service role também em jobs de reconciliação internos.

### 1.2 Evento canônico por `attempt_id`

- Para `event_type = 'attempt'`, existe **no máximo um** evento canônico por `attempt_id` ([ADR §8](DECISAO_EVIDENCE_ENGINE.md#8-campos-do-evento-contexts-e-idempotência)).
- `attempt_id` é gerado **no cliente** (UUID v4) no momento em que o aluno confirma a resposta, **antes** da chamada de rede, e reutilizado **somente** em retries técnicos da mesma confirmação (rede, duplo clique da mesma submissão).
- O servidor trata `attempt_id` duplicado como idempotência: retorna sucesso sem segundo insert (ver §1.3).

### 1.2.1 Invariante — replay do histórico ≠ tentativa

O comportamento atual de `historico_questoes` (UPDATE da linha em re-confirmação — [`registrar-tentativa`](../app/api/registrar-tentativa/route.ts) L98, L155–164; sync em [`simulado/responder`](../app/api/simulado/responder/route.ts) L251–257) **não** define se o event stream cria linha nova.

Invariantes congelados (Fase 1):

1. Cada confirmação humana bem-sucedida representa uma **tentativa física nova**.
2. Cada tentativa física nova gera um **novo** `attempt_id`.
3. Isso vale **mesmo quando** `historico_questoes` faz `UPDATE` da linha existente.
4. `INSERT` versus `UPDATE` em `historico_questoes` **não** determina se o evento é novo.
5. O event stream registra uma **nova linha append-only** para cada nova confirmação humana.
6. Retry técnico da **mesma** confirmação reutiliza o **mesmo** `attempt_id`.
7. Retornar posteriormente à questão e confirmar **outra** resposta gera **novo** `attempt_id`.
8. Re-resposta permitida no modo treino do simulado gera **nova** tentativa e **novo** evento.
9. Um clique duplicado / reenvio de rede **não** gera nova tentativa quando reutiliza o mesmo `attempt_id`.

| Situação | `attempt_id` | Evento |
|----------|--------------|--------|
| Primeiro envio | novo | `INSERT` no stream |
| Retry de rede | mesmo | replay idempotente |
| Duplo clique da mesma submissão | mesmo | replay idempotente |
| Reabertura e nova confirmação | novo | novo evento |
| Replay que atualiza `historico_questoes` | novo se nova ação humana | novo evento |

**Regra operacional:** o ponto de instrumentação (§3.11) emite evento após **qualquer** confirmação bem-sucedida (HTTP 200 com gabarito), independentemente de a persistência do histórico ter sido `INSERT` ou `UPDATE`. É **proibido** condicionar a emissão a `!isReplay` / “somente primeira linha do histórico”.

### 1.3 Idempotência

| Cenário | Comportamento |
|---------|---------------|
| Reenvio com mesmo `attempt_id` e payload equivalente (§1.3.1) | HTTP **200** da rota de tentativa + gabarito; stream sem linha adicional (`evidence.created: false`) |
| Reenvio com mesmo `attempt_id` e payload conflitante (§1.3.1) | HTTP **200** da rota de tentativa + gabarito (aluno **não** bloqueado); evento existente **intocado**; log de auditoria + métrica `evidence_event_conflict_total`; resposta pode incluir `evidence: { skipped: true, reason: 'conflict' }` |
| Nova confirmação humana (mesmo `question_id`, histórico em `UPDATE`) | **Novo** `attempt_id` → novo `INSERT` no stream (§1.2.1) |
| `historico_questoes` atualizado + evento falhou | Fluxo do aluno **não** reverte; job de reconciliação tenta backfill (§1.10) |
| Evento persistido + HTTP falhou antes do 200 ao cliente | Cliente retenta com o **mesmo** `attempt_id` → replay idempotente; histórico em retry vira UPDATE (já coberto por §1.2.1) |

- **Sem 2PC / transação distribuída** entre `historico_questoes` e o stream. Ordem normativa: histórico primeiro; depois tentativa de insert no stream; falha ou conflito do stream **não** reverte o histórico e **não** altera o status HTTP de sucesso da tentativa (§1.14).
- **Proibido** na Fase 1: retornar HTTP `409` (ou qualquer 4xx/5xx) na rota de tentativa **por causa** de conflito/falha de evidência após o histórico ter sido persistido. `409` de evidência só faria sentido em API dedicada — **fora** do escopo Fase 1 (§3.11).
- `409` legítimos das rotas atuais permanecem (ex.: sessão de simulado fechada, questão já respondida em modo prova) — são do domínio simulado/tentativa, não do EE.
- `transfer_inventory_missing` (**fora do escopo da Fase 1** como produto; contrato reservado no ADR §8) usará chave operacional distinta — não misturar com `attempt_id`.

#### 1.3.1 Conjunto semântico para equivalência (replay vs conflito)

Campos comparados quando já existe evento com o mesmo `attempt_id`:

| Campo | Regra |
|-------|--------|
| `selected_alternative` | deve ser idêntico |
| `correct` | deve ser idêntico (derivado no servidor) |
| `question_version` | deve ser idêntico |
| `context` | deve ser idêntico (derivado no servidor) |
| `conviction` | deve ser idêntico |
| `answer_change_count` | deve ser idêntico |
| `question_id` | deve ser idêntico |
| `user_id` | deve ser idêntico (JWT) |

Campos **fora** da comparação de conflito (podem divergir em retry sem marcar conflito): `started_at`, `answered_at`, `response_time_ms`, `response_time_status`, `response_time_invalid_reason`, `session_id`, `source`, `created_at`, `is_internal`.

### 1.4 Alternativa escolhida

- Campo canônico: `selected_alternative` (string, id da opção — ex. `A`, `B`, `Certo`).
- Mapeamento do código atual: body `opcao_id` em [`POST /api/registrar-tentativa`](../app/api/registrar-tentativa/route.ts) e [`SimuladoAnswerSchema`](../lib/validations.ts) → `selected_alternative` no evento.
- Validação server-side continua em [`resolveQuestionAttempt`](../lib/estudar/questionPayload.ts); o evento só é persistido após validação bem-sucedida.

### 1.5 Convicção

- UI (Fase 1, coorte técnica apenas — [ADR §18](DECISAO_EVIDENCE_ENGINE.md#18-experimento-controlado-rct-1--pacote-completo)): três botões antes de confirmar — **Chutei** / **Entre duas** / **Tenho certeza**.
- Enum persistido (wire, snake_case — [ADR §8](DECISAO_EVIDENCE_ENGINE.md#8-campos-do-evento-contexts-e-idempotência)): `chute` | `entre_duas` | `certeza` | `unknown`.
- Falha de rede ou instrumentação indisponível: persistir `conviction = unknown`; **nunca** bloquear confirmação da resposta ([ADR invariante](DECISAO_EVIDENCE_ENGINE.md#4-invariantes-não-negociáveis)).
- Na Fase 1, superfícies **sem** UI de convicção (maioria dos usuários) emitem `unknown` por padrão.
- Coorte técnica com UI visível: se a escolha de convicção falhar tecnicamente, ainda assim `unknown` — a UI não torna o campo “obrigatório a ponto de bloquear”.

### 1.6 Tempo de resposta

- `started_at` / `answered_at`: ISO 8601 **com offset explícito**; preferência cliente `...Z` (UTC). Servidor normaliza para `timestamptz` UTC antes de persistir; rejeita strings ambíguas sem offset → `response_time_status = unknown` (demais campos seguem).
- `started_at`: início da exposição da questão na superfície (montagem da tela / troca de item no simulado).
- `answered_at`: clique em **Confirmar** (após escolha de convicção, quando a UI estiver habilitada) — **não** o toque na alternativa.
- `response_time_ms`: `answered_at - started_at` em milissegundos; `null` quando não calculável.
- `response_time_status`: `valid` | `invalid` | `unknown`.
- `response_time_invalid_reason`: string curta quando `invalid` (ex. `negative_delta`, `exceeds_plausible_max`, `clock_skew`, `missing_started_at`, `tab_backgrounded`, `page_reload`).
- Referência existente: simulado já envia `tempo_ms` opcional via [`SimuladoAnswerSchema`](../lib/validations.ts) e persiste em `simulado_respostas.tempo_ms` ([`POST /api/simulado/responder`](../app/api/simulado/responder/route.ts)). O player **não** mede tempo hoje — `started_at` / `answered_at` no player são **campos novos de instrumentação**.
- Limites numéricos concretos (máximo plausível, tolerância de skew) ficam no **plano operacional Fase 1** (§1.16) — não inventados nesta spec ([ADR §27](DECISAO_EVIDENCE_ENGINE.md#27-critérios-objetivos-de-gono-go)).

Comportamentos de ciclo de vida (Fase 1):

| Situação | Regra |
|----------|--------|
| Reload / remount da questão | Novo `started_at`; contagem recomeça |
| Aba em background / suspensão prolongada | Marcar `response_time_status = invalid` (ou `unknown` se não detectável); motivo `tab_backgrounded` quando detectável |
| Abandono sem confirmar | **Sem** evento de tentativa |
| Múltiplas seleções de alternativa antes de confirmar | Contam em `answer_change_count`; **não** geram evento até confirmar |
| Troca de questão no simulado sem confirmar | Sem evento; novo `started_at` na próxima questão |

### 1.7 `context`

Valores canônicos congelados no ADR §8 (Fase 1 emite os aplicáveis hoje; demais reservados):

| `context` | Superfície atual / futura |
|-----------|---------------------------|
| `regular_practice` | Player vitrine / caderno / plano — [`AvantLessonPlayer`](../components/lesson/AvantLessonPlayer.tsx) modo `live` |
| `diagnostic` | Simulado diagnóstico (`filtros.tipo = diagnostico_inicial` — [`lib/simulado/diagnosticoConstants.ts`](../lib/simulado/diagnosticoConstants.ts)) |
| `simulation` | Simulado livre / semanal — [`SimuladoRunnerClient`](../components/simulados/SimuladoRunnerClient.tsx) |
| `pre_explanation` | Reservado — **não emitido** na Fase 1 (usar `regular_practice`) |
| `immediate_transfer` | **Fora do escopo Fase 1** (T1) |
| `scheduled_review` | **Fora do escopo Fase 1** |
| `measurement_holdout` | **Fora do escopo Fase 1** |

**Derivação obrigatória no servidor** (não confiar no body do cliente):

| Rota | `context` persistido |
|------|----------------------|
| `POST /api/registrar-tentativa` | `regular_practice` |
| `POST /api/simulado/responder` | `diagnostic` se `resolveSimuladoSessionKind(session.filtros) === 'diagnostico'` ([`lib/simulado/sessionKind.ts`](../lib/simulado/sessionKind.ts) + [`diagnosticoConstants.ts`](../lib/simulado/diagnosticoConstants.ts)); senão `simulation` (inclui `livre` e `weekly`) |

- Se o cliente enviar `context`, o servidor **ignora** e sobrescreve com a derivação acima.
- Contextos fora do conjunto Fase 1 (`immediate_transfer`, `scheduled_review`, `measurement_holdout`, `pre_explanation`) **nunca** são persistidos na Fase 1; tentativa explícita no body → log + métrica `evidence_event_context_rejected_total`; evento segue com o `context` derivado da rota.

### 1.8 `question_version`

- Campo **obrigatório** em todo evento `attempt` ([ADR §9](DECISAO_EVIDENCE_ENGINE.md#9-semântica-de-question_version), checklist §27).
- **Não existe** coluna ou campo tipado no catálogo atual (`modulos_estudo.conteudo_json` / [`QuestaoCompletaSchema`](../lib/validations.ts)).
- Hash **somente no servidor** a partir do `conteudo_json` já carregado na rota.

**Requisitos de serialização estável (`canonical_json`) — congelados para Fase 1:**

1. Incluir **somente**: `modulo_slug`; `question_data.instruction`; `question_data.options[]` com `{ id, text, is_correct }` ordenados por `id` ascendente; `meta.content_standard`, `meta.family`, `meta.pedagogical_branch` (ausentes → `null`).
2. **Excluir** slides (`reverse_study_slides` / `study_slides`), figuras, `header_line`, campos de UI e qualquer outro meta.
3. Objeto JSON com chaves em ordem lexicográfica em todos os níveis; strings UTF-8 NFC; sem espaços insignificantes (`JSON.stringify` canônico após ordenar chaves).
4. `question_version = sha256_hex(utf8_bytes(canonical_json))` em hex minúsculo de **64 caracteres** (formato único; sem prefixo curto). Helper único no servidor.
5. Função canônica única proposta: `lib/evidence/questionVersion.ts` (nome final na implementação) — **proibido** recalcular no cliente.

```text
question_version = sha256_hex(canonical_json({
  modulo_slug,
  instruction,
  options: [{ id, text, is_correct }],  // sorted by id
  meta_evidence_relevant: { content_standard, family, pedagogical_branch }
}))
```

- Fallback: se `conteudo_json` for ilegível / sem `options` válidas → **não** emitir evento; a tentativa do aluno no histórico já foi (ou não) persistida conforme a rota; logar `evidence_event_question_version_failed_total` e seguir §1.14 (não bloquear HTTP de sucesso do histórico se o histórico já gravou).
- Edição de enunciado, alternativas, gabarito ou metadados de evidência relevantes → nova `question_version`; tentativas antigas não validam aprendizado sob versão nova (intenção ADR; projeção de domínio **não** ativa na Fase 1).

### 1.9 Autenticação e ownership

| Camada | Mecanismo atual | Requisito Fase 1 |
|--------|-----------------|------------------|
| Route Handlers | [`getUserAndClientFromBearer`](../lib/supabase/api-request-user.ts) — JWT via `Authorization: Bearer`, sem refresh no Node | Mesmo padrão nas rotas que ingerem eventos |
| Cliente | [`fetchWithAuth`](../lib/api/fetch-with-auth.ts) → Bearer | Inalterado |
| Player | [`postWithSessionRetry`](../components/lesson/AvantLessonPlayer.tsx) — retry após `supabase.auth.getSession()` em 401 | Metadados EE no **mesmo** body da confirmação; falha de evento não desfaz tentativa |
| RLS | `auth.uid() = user_id` em `historico_questoes` | Equivalente em `evidence_attempt_events` para acesso direto; escrita API via service role após JWT (§1.1) |
| Entitlement | [`userHasModuloAccess`](../lib/concursos/entitlements.ts) antes de registrar tentativa | Evento só após mesma checagem bem-sucedida |
| E2E | Bypass em [`registrar-tentativa`](../app/api/registrar-tentativa/route.ts) quando `E2E_DASHBOARD_BYPASS` | Sem persistência de histórico hoje; se instrumentar E2E, `is_internal = true` e **excluídos** de experimentos ([ADR §18](DECISAO_EVIDENCE_ENGINE.md#18-experimento-controlado-rct-1--pacote-completo)) |

- `user_id` no evento **sempre** do JWT validado no servidor — nunca aceito do body do cliente.
- `attempt_id` **obrigatório** no body estendido de `registrar-tentativa` e `simulado/responder` quando a flag de instrumentação estiver ligada (UUID v4). Sem `attempt_id` válido com flag on → evento não inserido + métrica; histórico segue (§1.14).

### 1.10 Reconciliação

Objetivo: detectar e reparar divergência entre `historico_questoes` / `simulado_respostas` e o event stream.

| Fonte A | Fonte B | Sinal de divergência |
|---------|---------|---------------------|
| `historico_questoes` (insert/update recente) | `evidence_attempt_events` | Tentativa humana sem evento (ver pareamento) |
| `simulado_respostas` (`respondida_em` not null) | Event stream | Resposta de simulado sem evento |
| Event stream | Histórico | Evento sem linha de histórico (aceitável em backfill parcial apenas durante rollout) |
| Ambos presentes | — | `correct` / `selected_alternative` divergentes (quando histórico tiver alternativa no futuro; hoje histórico **não** guarda `opcao_id` — comparar via `simulado_respostas` ou payload de log) |

**Pareamento (ordem de preferência):**

1. `attempt_id` presente no body/log da tentativa (preferencial).
2. Secundário: `user_id` + `question_id` + `answered_at`/`created_at` em janela curta + `historico.id` / `simulado_respostas.id` quando disponível.
3. **Proibido** assumir 1:1 permanente só por `(user_id, question_id)` — §1.2.1 permite múltiplos eventos por questão.

**Backfill:**

- `source = reconcile_backfill`.
- Gera `attempt_id` novo **somente** quando a tentativa física não tem `attempt_id` recuperável; marcar claramente como backfill (não confundir com confirmação online).
- Eventos backfill **não** sofrem `UPDATE`/`DELETE`; se metadados forem insuficientes, só relatório (sem inventar `selected_alternative` / `correct`).

**Divergência de outcome (`correct` / alternativa):**

- Severidade **P1**: alerta + métrica `evidence_reconcile_outcome_mismatch_total`.
- **Proibido** corrigir silenciosamente o evento canônico existente; investigação humana / novo evento de auditoria se necessário.

- Job proposto (batch, service role): `reconcile:evidence-events`.
- Gate de saída Fase 1 ([ADR §27](DECISAO_EVIDENCE_ENGINE.md#27-critérios-objetivos-de-gono-go)): reconciliação automatizada com taxa de divergência monitorada; limiar no plano operacional (§1.16).

### 1.11 Replay somente em teste

- Pipeline de **projeção derivada** (`learner_skill_state` — ADR §12) pode consumir o event stream **apenas** em ambiente de teste / CI / ferramentas offline na Fase 1.
- **Proibido** na Fase 1: ativar projeção de domínio, misconceptions ou agendamento no produto a partir do stream.
- Testes propostos: fixtures de eventos → mesmo reducer usado em futuras fases → asserções determinísticas (sem Supabase de produção). Matriz completa: §6.

### 1.12 Observabilidade

Métricas e logs propostos ([`lib/logger.ts`](../lib/logger.ts) — sem `console.log` em `app/` / `lib/`):

| Métrica / log | Uso |
|---------------|-----|
| `evidence_event_ingest_total{context,source,status}` | Volume e erros |
| `evidence_event_idempotent_replay_total` | Reenvios absorvidos |
| `evidence_event_conflict_total` | Payload conflitante no mesmo `attempt_id` (stream intocado; HTTP da tentativa continua 200) |
| `evidence_event_context_rejected_total` | Body com context fora do escopo Fase 1 |
| `evidence_event_question_version_failed_total` | Hash/conteúdo ilegível |
| `evidence_event_conviction_unknown_rate` | Saúde da UI de convicção |
| `evidence_event_response_time_invalid_rate` | Qualidade de tempo |
| `evidence_event_ingest_latency_ms` | Latência p95 ingestão |
| `evidence_reconcile_gap_total` | Divergências histórico × stream |
| `evidence_reconcile_outcome_mismatch_total` | `correct`/alternativa divergentes |
| `evidence_reconcile_unresolved_after_job_total` | Gaps remanescentes pós-job |

- Dashboard interno (opcional Fase 1): taxa de sucesso de ingestão, top erros, amostra de eventos `is_internal`.

### 1.13 Rollout para equipe / coorte técnica

Alinhado ao [ADR §18](DECISAO_EVIDENCE_ENGINE.md#18-experimento-controlado-rct-1--pacote-completo):

| Coorte | Instrumentação | UI convicção |
|--------|----------------|--------------|
| Usuários gerais | Eventos com `conviction = unknown`, `is_internal = false` | **Sem** nova primitiva |
| Equipe interna / teste / coorte técnica | Eventos completos; `is_internal = true` | **Com** convicção (flag por e-mail ou lista) |
| Participantes de experimento futuro | Excluídos da análise até RCT-1 | Conforme braço (fora Fase 1) |

- Flag conceitual Fase 1: `EE_V1_INSTRUMENTATION` — habilita ingestão + UI de convicção restrita; **não** habilita T1, domínio nem `measurement_pool`.
- Mapeamento com ADR §26: `EE_V1_ENABLED` é o nome genérico do produto EE; na Fase 1 o nome operacional é `EE_V1_INSTRUMENTATION` (subconjunto). Fases posteriores podem promover/renomear sob o mesmo ADR — **não** ligar `EE_V1_ENABLED` global na Fase 1.
- Eventos `is_internal = true` **excluídos** de RCT e métricas populacionais.

### 1.14 Fallback não bloqueante

Invariante ADR §4 / checklist §27 item 7:

1. Falha ao persistir evento **não** impede `registrar-tentativa` / `simulado/responder` de retornar sucesso ao aluno.
2. Conflito semântico no mesmo `attempt_id` (§1.3.1) **não** impede sucesso HTTP da tentativa; evento canônico permanece; ver §1.3.
3. Falha de convicção → `unknown`; fluxo de confirmação segue.
4. Falha de cálculo de tempo → `response_time_status = unknown`; demais campos persistem se possível.
5. Ordem: persistir histórico → tentar insert no stream → responder HTTP **200** com gabarito se o histórico (ou `simulado_respostas`) teve sucesso. Se o stream gravou e a resposta HTTP falhou, o retry do cliente com o mesmo `attempt_id` é idempotente (§1.3).
6. Cliente: metadados EE no body da mesma chamada; erros/conflitos de instrumentação logados, sem modal bloqueante.

### 1.15 Rollback

| Ação | Efeito |
|------|--------|
| Desligar `EE_V1_INSTRUMENTATION` | Para nova ingestão e UI de convicção; player/simulado voltam ao fluxo legado de confirmação |
| Eventos já persistidos | **Permanecem** (append-only); não apagar |
| `historico_questoes` / `simulado_respostas` | **Inalterados** pelo rollback da flag |
| Vitrine / cache / `recommendations.ts` | Sem mudança (Fase 1 não os altera) |

### 1.16 Plano operacional pós-baseline (governança de limites)

- Artefato: `artifacts/evidence-fase1-operational-plan.md` (a criar após medir baseline — **não** inventar limiares nesta spec).
- Conteúdo mínimo: taxas máximas de gap de reconciliação, `conviction=unknown`, `response_time_invalid`, latência p95 ingestão; regra de go/no-go espelhando ADR §27.
- **Quem aprova:** revisão humana do responsável de produto/engenharia do EE (mesmo ritual de aprovação desta spec + ADR), registrada no artefato com data.
- Esta spec **não** fixa números; só exige que o artefato exista antes de declarar saída da Fase 1.

---

## 2. Fora do escopo

A Fase 1 **não implementa**:

| Item | Referência ADR |
|------|----------------|
| `learner_skill_state` e projeção no produto | §12 |
| Cálculo de domínio / transições de estado | §12–§13 |
| `misconceptions` e pipeline de publicação | §10 |
| `skill_id` / `primary_skill_id` obrigatório no catálogo / `evidence_ready` | §5–§6, §10 |
| Seletor T1 | §11 |
| Troca global do CTA pós-NeuroSlides | §3, §18 |
| `measurement_pool` / holdout / janelas D+7–D+30 | §14–§17 |
| RCT-1 e randomização populacional | §18–§22 |
| Intervalos de revisão EE e agendamento adaptativo | §13 |
| FSRS | §13, §25 (RCT-2) |
| Mudanças em [`lib/recommendations.ts`](../lib/recommendations.ts) | §3 |
| Controle algorítmico da Vitrine | §4, §28 |
| Contextual bandit | §24 |
| LLM selecionando próxima questão em runtime | §4, §24 |
| Substituição de `historico_questoes` | §7 |
| Evento `transfer_inventory_missing` em produção (reservado) | §8 |
| Migrations / DDL reais, rotas deployadas, feature flag global | §24, §29 |

---

## 3. Fluxo atual verificado

Documentação do comportamento **existente** no repositório. A Fase 1 **não altera** estes fluxos; apenas adiciona emissão paralela de eventos nos pontos indicados em §3.11.

### 3.1 Máquina de estados do player

[`AvantLessonPlayer`](../components/lesson/AvantLessonPlayer.tsx) opera em três etapas (`etapa`):

```text
pergunta → gabarito → estudo
```

- Comentário de arquivo (linhas 7–8): estados documentados no próprio componente.
- `mode`: `live` (app) ou `preview` (Laboratório / LP).

### 3.2 Seleção de alternativa

**Onde:** [`AvantLessonPlayer`](../components/lesson/AvantLessonPlayer.tsx) — state `selecionada` / `setSelecionada`.

| Interação | Implementação |
|-----------|---------------|
| Clique na opção | `onClick` → `setSelecionada(opt.id)` (aprox. linha 1539) |
| Teclado no radiogroup | `handleRadiogroupKeyDown` — dígitos 1–n ou letra da alternativa (linhas 1316–1339) |
| Setas entre opções | `handleOptionKeyDown` (linhas 1275–1297) |
| Eliminação de distrator | `toggleEliminada` — pode limpar seleção (linhas 1301–1314) |

- Gabarito **não** está no payload do cliente em modo `live`: [`stripQuestionAnswersForClient`](../lib/estudar/questionPayload.ts) remove `is_correct` antes do RSC → client.
- Nenhum registro em banco ocorre na seleção; apenas estado local React.

### 3.3 Confirmação da resposta

**Onde:** botão **Confirmar Resposta** → `handleConfirmarResposta` (linhas 886–953).

Fluxo:

1. Guard: `selecionada` definida; não `confirmandoResposta`; freemium não bloqueado.
2. `setConfirmandoResposta(true)`.
3. `registrarTentativa(selecionada)` → `POST /api/registrar-tentativa` via `postWithSessionRetry` (linhas 795–884).
4. Body enviado hoje: `modulo_slug`, `opcao_id`, `banca`, `topico`, `subtopico` (meta da questão).
5. Em sucesso: `setGabarito`, `setEtapa('gabarito')`, limpa eliminações locais.
6. Em erro: mensagem em `tentativaErro`; etapa permanece `pergunta`.

**Modo `preview`:** não chama API; `buildPreviewGabarito` local (linhas 785–793).

### 3.4 API `registrar-tentativa`

**Arquivo:** [`app/api/registrar-tentativa/route.ts`](../app/api/registrar-tentativa/route.ts)

| Etapa | Comportamento |
|-------|---------------|
| Validação | `modulo_slug` + `opcao_id` obrigatórios |
| E2E bypass | Retorna gabarito sem DB se slug E2E |
| Auth | `getUserAndClientFromBearer` → 401 |
| Entitlement | `userHasModuloAccess` → 403 |
| Freemium | `assertCanAnswerQuestion` — **somente** se não for replay |
| Replay | Se já existe linha `historico_questoes` para `(user_id, modulo_slug)` → **UPDATE** `acertou`, meta, `created_at` |
| Primeira tentativa | **INSERT** em `historico_questoes` |
| Gabarito | `resolveQuestionAttempt(conteudo_json, opcao_id)` |
| Resposta | `{ success, acertou, opcao_correta_id }` |
| Cache | `revalidateTag('historico')`, `revalidateTag('user-${userId}')` |

**Dados recebidos mas não persistidos no histórico:** `opcao_id` (usado só para calcular `acertou`; não gravado na tabela).

**Implicação EE (§1.2.1):** o flag local `isReplay` só decide INSERT vs UPDATE no histórico e se o freemium gate roda. **Não** decide se o stream recebe evento. Toda confirmação humana bem-sucedida nesta rota gera novo `attempt_id` + novo evento append-only.

### 3.5 Correção / gabarito

**Onde (UI):** etapa `gabarito` — alternativas com `showResult` estiliza acerto/erro (`opcaoEstaCorreta`, linhas 1219–1230, 1452–1475).

- Feedback textual: "Você acertou!" / "Você errou" (linhas 1787–1788).
- Gabarito veio do servidor na confirmação (`GabaritoTentativa` em [`lib/estudar/questionPayload.ts`](../lib/estudar/questionPayload.ts)).

### 3.6 Abertura do estudo reverso

| Passo | Onde |
|-------|------|
| CTA "Ativar estudo reverso" | `gabarito` → `setEtapa('estudo')`, `setSlideAtual(0)` (linhas 1798–1804) |
| Slides | `NeuroSlide` / prefetch `layers=full` ao entrar em estudo (comentário L1 ~linha 554) |
| Conclusão | [`MarcarEstudoConcluidoButton`](../components/lesson/MarcarEstudoConcluidoButton.tsx) → `marcarEstudoConcluido` → `POST /api/concluir-estudo-reverso` |
| Persistência conclusão | [`concluir-estudo-reverso`](../app/api/concluir-estudo-reverso/route.ts) atualiza `historico_questoes.estudo_reverso_concluido` (+ `created_at`) |

- Percorrer NeuroSlides **não** registra tentativa nem altera `acertou` — apenas navegação local até "Marcar estudado".
- **Não há** quiz de transferência no player ([ADR §3](DECISAO_EVIDENCE_ENGINE.md#3-relação-com-o-código-existente); `transferQuiz.ts` removido).

### 3.7 O que `historico_questoes` persiste hoje

Schema base: [`create_historico_questoes.sql`](../supabase/migrations-legacy/create_historico_questoes.sql) + coluna [`estudo_reverso_concluido`](../supabase/migrations-legacy/add_estudo_reverso_concluido.sql).

| Coluna | Preenchimento |
|--------|---------------|
| `user_id`, `modulo_slug` | Sempre |
| `acertou` | `registrar-tentativa` / sync simulado |
| `banca`, `topico`, `subtopico` | Body ou meta da questão |
| `created_at` | Insert; **atualizado** no replay de `registrar-tentativa` e ao marcar estudo concluído. Sync de `simulado/responder` em UPDATE **não** altera `created_at` (só `acertou`/meta) |
| `estudo_reverso_concluido` | `concluir-estudo-reverso` |

Tipo consumidor: [`HistoricoQuestao`](../lib/analytics.ts), [`HistoricoQuestaoCachedRow`](../lib/cache.ts).

**Limitações relevantes para o EE** ([ADR divergências](DECISAO_EVIDENCE_ENGINE.md#divergências-plano--código-atual)):

- Sem `opcao_id`, convicção, tempo, `attempt_id`, `context`.
- Replay **atualiza** a mesma linha — não append-only no histórico.
- Código usa a linha mais recente (`order created_at desc limit 1`); DB sem UNIQUE formal em `(user_id, modulo_slug)`.
- **Não confundir** com o stream: UPDATE no histórico **não** implica “mesmo evento” — ver §1.2.1.

### 3.8 Simulado diagnóstico vs prática

**Runner:** [`SimuladoRunnerClient`](../components/simulados/SimuladoRunnerClient.tsx)

| Aspecto | Diagnóstico | Simulado livre / semanal |
|---------|-------------|--------------------------|
| Identificação | `filtros.tipo = diagnostico_inicial` ([`diagnosticoConstants.ts`](../lib/simulado/diagnosticoConstants.ts)) | `sessionKind` `livre` ou `weekly` ([`sessionKind.ts`](../lib/simulado/sessionKind.ts)) |
| API resposta | [`POST /api/simulado/responder`](../app/api/simulado/responder/route.ts) | Mesma rota |
| Tempo | `tempo_ms` calculado client-side (`Date.now() - questionStartedAt`) | Idem |
| Persistência | `simulado_respostas` (+ sync `historico_questoes`) | Idem |
| Modo prova | `filtros.modo === 'prova'` — sem gabarito imediato; 2ª resposta → `409` | Treino mostra feedback; **permite re-responder** (UPDATE em `simulado_respostas`; sync histórico pode ser UPDATE) |

`simulado_respostas` guarda `opcao_id`, `opcao_correta_id`, `acertou`, `tempo_ms`, `respondida_em` ([`database.supabase.snapshot.ts`](../types/database.supabase.snapshot.ts)) — **mais rico** que `historico_questoes`, porém escopo de sessão, não stream global.

**Implicação EE (§1.2.1):** re-resposta em modo treino é tentativa física nova → novo `attempt_id` e novo evento, mesmo com UPDATE no histórico / na linha da sessão.

Criação diagnóstico: [`createDiagnosticoSimulado`](../lib/simulado/client.ts) → `/api/simulado/diagnostico`.

### 3.9 Dados recebidos mas descartados (resumo)

| Superfície | Campo | Destino atual |
|------------|-------|---------------|
| `registrar-tentativa` | `opcao_id` | Só cálculo de `acertou`; não no histórico |
| Player | tempo na questão | Não enviado — instrumentação futura (`started_at`/`answered_at`) |
| Player | convicção | Não existe UI |
| Player | `attempt_id` | Não existe |
| Simulado | `tempo_ms` | `simulado_respostas` apenas |
| Conclusão estudo reverso | consumo de slides | Não gera evento |

### 3.10 Testes existentes (referência)

| Arquivo | Cobertura |
|---------|-----------|
| [`__tests__/api/registrar-tentativa.test.ts`](../__tests__/api/registrar-tentativa.test.ts) | Auth, entitlement, gabarito, replay update vs insert |
| [`__tests__/components/lesson/AvantLessonPlayer.slides.test.tsx`](../__tests__/components/lesson/AvantLessonPlayer.slides.test.tsx) | Mock `registrar-tentativa`, fluxo estudo reverso |
| [`__tests__/components/lesson/AvantLessonPlayer.error-surfaces.test.tsx`](../__tests__/components/lesson/AvantLessonPlayer.error-surfaces.test.tsx) | Erros de tentativa / acesso |
| [`__tests__/api/simulado-responder.route.test.ts`](../__tests__/api/simulado-responder.route.test.ts) | Resposta de simulado |
| [`__tests__/lib/recommendations.test.ts`](../__tests__/lib/recommendations.test.ts) | Híbrido legado (inalterado na Fase 1) |

### 3.11 Onde o novo evento seria emitido (normativo)

**Decisão congelada (único fluxo):** ingestão **server-side dentro** de `POST /api/registrar-tentativa` e `POST /api/simulado/responder`, **após** sucesso da persistência do histórico / `simulado_respostas`.

- **Não** há rota dedicada `POST /api/evidence/attempt-events` na Fase 1.
- Cliente envia metadados EE no **mesmo body** da confirmação (`attempt_id`, `started_at`, `answered_at`, `conviction`, `answer_change_count`; `session_id` já existe no simulado).
- Servidor deriva `user_id`, `correct`, `question_version`, `context`, `event_type`, `is_internal`, `created_at`, `source`.

```mermaid
sequenceDiagram
  participant U as Aluno
  participant P as AvantLessonPlayer / SimuladoRunner
  participant H as registrar-tentativa / simulado/responder
  participant HQ as historico_questoes
  participant ES as evidence_attempt_events

  U->>P: Seleciona alternativa
  U->>P: Confirma resposta
  Note over P: novo attempt_id por confirmação humana
  P->>H: body legado + attempt_id + timestamps + conviction
  H->>HQ: insert OU update (não decide evento)
  H->>ES: append (novo attempt_id) ou idempotente (mesmo)
  Note over H,ES: Falha ES não bloqueia 200; HQ UPDATE ≠ sem evento
  H-->>P: acertou, opcao_correta_id
```

| Ponto de UI | Momento | `source` persistido (servidor) |
|-------------|---------|--------------------------------|
| [`handleConfirmarResposta`](../components/lesson/AvantLessonPlayer.tsx) | Dispara `registrar-tentativa` | `api_registrar_tentativa` |
| [`handleConfirmAnswer`](../components/simulados/SimuladoRunnerClient.tsx) | Dispara `simulado/responder` | `api_simulado_responder` |

**Obrigatório:** emitir evento em **toda** confirmação humana bem-sucedida, inclusive quando `historico_questoes` / `simulado_respostas` fizerem UPDATE (replay player ou re-resposta treino). Não amarrar emissão a INSERT do histórico.

---

## 4. Evento canônico

### 4.1 Tipos conceituais (proposta — sem arquivo TypeScript no repo)

```typescript
/** Valores de convicção — wire format ADR §8 */
type EvidenceConviction = 'chute' | 'entre_duas' | 'certeza' | 'unknown';

/** Contextos do ADR §8 — Fase 1 só persiste subset derivado no servidor */
type EvidenceAttemptContext =
  | 'diagnostic'
  | 'regular_practice'
  | 'pre_explanation'
  | 'immediate_transfer'
  | 'scheduled_review'
  | 'simulation'
  | 'measurement_holdout';

/** Contextos emitidos na Fase 1 */
type EvidenceAttemptContextPhase1 = 'diagnostic' | 'regular_practice' | 'simulation';

type EvidenceResponseTimeStatus = 'valid' | 'invalid' | 'unknown';

/** Discriminante de evento — Fase 1 só produz 'attempt' */
type EvidenceEventType = 'attempt' | 'transfer_inventory_missing';

type EvidenceAttemptEvent = {
  /** Fase 1: sempre 'attempt' ([ADR §8](DECISAO_EVIDENCE_ENGINE.md#8-campos-do-evento-contexts-e-idempotência)) */
  event_type: 'attempt';
  /** Identificador único da tentativa física — idempotência; novo a cada confirmação humana (§1.2.1) */
  attempt_id: string;
  user_id: string;
  /** No catálogo atual = modulo_slug (mapeamento 1:1 ADR) */
  question_id: string;
  question_version: string;
  selected_alternative: string;
  correct: boolean;
  conviction: EvidenceConviction;
  /** Derivado no servidor — Fase 1: EvidenceAttemptContextPhase1 */
  context: EvidenceAttemptContextPhase1;
  /** ISO 8601 com offset; preferência Z */
  started_at: string;
  /** ISO 8601 com offset — momento do Confirmar */
  answered_at: string;
  response_time_ms: number | null;
  response_time_status: EvidenceResponseTimeStatus;
  response_time_invalid_reason: string | null;
  /** Número de trocas de alternativa antes de confirmar (ADR §8; ≥ 0) */
  answer_change_count: number;
  /** Simulado: session UUID; vitrine: null na Fase 1 */
  session_id: string | null;
  /** api_registrar_tentativa | api_simulado_responder | reconcile_backfill */
  source: string;
  /** Derivado no servidor (allowlist / E2E) */
  is_internal: boolean;
  /** Server-side — momento da persistência */
  created_at: string;
};

/**
 * Campos enviados pelo cliente no body estendido de
 * registrar-tentativa / simulado/responder (flag on).
 * NÃO inclui context, user_id, correct, question_version, event_type, is_internal.
 */
type EvidenceAttemptClientFields = {
  attempt_id: string;
  started_at: string;
  answered_at: string;
  conviction: EvidenceConviction;
  answer_change_count: number;
  /** Opcional — se omitido, servidor deriva response_time_* */
  response_time_ms?: number | null;
};

/** Resposta HTTP da rota de tentativa (legado + EE) */
type EvidenceAttemptIngestResponseHint = {
  /** espelho interno; cliente pode ignorar */
  evidence?: { attempt_id: string; created: boolean } | { skipped: true; reason: string };
};
```

### 4.2 Mapeamento UI ↔ wire (`conviction`)

| UI (coorte técnica) | `conviction` persistido |
|---------------------|-------------------------|
| Chutei | `chute` |
| Entre duas | `entre_duas` |
| Tenho certeza | `certeza` |
| (indisponível / falha / base geral) | `unknown` |

### 4.3 Campos derivados no servidor

| Campo | Regra |
|-------|-------|
| `user_id` | JWT — nunca do body |
| `correct` | `resolveQuestionAttempt` — mesma fonte que `acertou` |
| `question_version` | Hash do conteúdo (§1.8) |
| `context` | Derivado da rota / `session.filtros` (§1.7) — ignora body |
| `created_at` | `now()` no insert |
| `event_type` | sempre `'attempt'` na Fase 1 |
| `is_internal` | allowlist e-mail / flag coorte / E2E — nunca do body |
| `source` | `api_registrar_tentativa` \| `api_simulado_responder` \| `reconcile_backfill` |
| `answer_change_count` | do body (inteiro ≥ 0); default `0` se ausente no rollout |
| `question_id` | `modulo_slug` validado na rota |

### 4.4 Validação proposta (Zod)

Estender [`lib/validations.ts`](../lib/validations.ts) / schemas das rotas existentes: campos EE opcionais quando flag off; obrigatórios (`attempt_id` UUID) quando `EE_V1_INSTRUMENTATION` on. Limites de string alinhados a `opcao_id` (`SimuladoAnswerSchema`).

### 4.5 Idempotência (implementação)

```text
INSERT ... 
ON CONFLICT (attempt_id) WHERE event_type = 'attempt'  -- via unique index §1.1
  DO NOTHING
  RETURNING id
```

- Se nenhuma linha retornada: buscar existente; comparar conjunto §1.3.1.
- Equivalente → HTTP **200** da rota de tentativa; `evidence: { attempt_id, created: false }`.
- Divergente → HTTP **200** da rota de tentativa + gabarito; stream **intocado**; métrica `evidence_event_conflict_total`; `evidence: { skipped: true, reason: 'conflict' }`. **Não** retornar HTTP 409 por conflito de evidência (§1.3).

### 4.6 Critérios de saída da Fase 1 (checklist operacional)

Espelho [ADR §27 — Saída da Fase 1](DECISAO_EVIDENCE_ENGINE.md#27-critérios-objetivos-de-gono-go):

| # | Critério | Verificação proposta |
|---|----------|----------------------|
| 1 | Um evento canônico por `attempt_id`; reenvios idempotentes; **nova confirmação humana → novo `attempt_id` mesmo com UPDATE no histórico** (§1.2.1) | Teste API + unique index + caso replay/`isReplay` |
| 2 | Reconciliação histórico × stream | Job `reconcile:evidence-events` |
| 3 | `context` válido (subset Fase 1) em todos os eventos | Auditoria SQL / lint |
| 4 | `question_version` presente | NOT NULL + teste ingestão |
| 5 | Tempo plausível ou marcado inválido | Métrica `response_time_invalid_rate` |
| 6 | Taxa de `conviction = unknown` monitorada | Dashboard |
| 7 | Falha de instrumentação não bloqueia player | Teste E2E / unitário de fallback |
| 8 | Eventos internos excluídos de experimento | Filtro `is_internal` |
| 9 | Replay em teste reproduz projeção derivada **sem** ativar no produto | Suite reducer offline |

Limites numéricos — aprovados no artefato §1.16 após baseline; não fixados aqui.

---

## 5. Mapa de implementação futura (não autoriza ship)

Apêndice de planejamento. **Nenhum** item abaixo está autorizado até aprovação humana desta spec + ADR.

| Área | Arquivos existentes tocados (previsto) | Artefatos novos (previsto) | Zona eng |
|------|----------------------------------------|----------------------------|----------|
| DDL / RLS | — | migration `evidence_attempt_events` + unique index + policies | **Vermelha** |
| Ingestão | [`app/api/registrar-tentativa/route.ts`](../app/api/registrar-tentativa/route.ts), [`app/api/simulado/responder/route.ts`](../app/api/simulado/responder/route.ts) | `lib/evidence/*` (version, ingest, context) | **Amarela** |
| Validação | [`lib/validations.ts`](../lib/validations.ts) | schemas EE no body | **Amarela** |
| Player | [`components/lesson/AvantLessonPlayer.tsx`](../components/lesson/AvantLessonPlayer.tsx) | UI convicção (coorte); `started_at` / `attempt_id` / `answer_change_count` | **Amarela** |
| Simulado | [`components/simulados/SimuladoRunnerClient.tsx`](../components/simulados/SimuladoRunnerClient.tsx) | mesmos metadados no body | **Amarela** |
| Env / flag | [`lib/env.ts`](../lib/env.ts) | `EE_V1_INSTRUMENTATION` | **Vermelha** (env) |
| Reconciliação | — | script `reconcile:evidence-events` | Amarela |
| Testes | testes existentes de rotas/player | novos testes §6 | Verde/amarela |
| **Não tocar** | [`lib/recommendations.ts`](../lib/recommendations.ts), vitrine/cache global, `proxy.ts` | — | — |

Handoff: Bugbot + Security Review em mudanças amarelas/vermelhas — [`docs/SECURITY_ENG_AVANT.md`](SECURITY_ENG_AVANT.md).

---

## 6. Estratégia de testes (antes de implementar)

| Requisito | Tipo de teste | Notas |
|-----------|---------------|-------|
| Idempotência mesmo `attempt_id` | API unit/integration | 200 + uma linha |
| Payload conflitante → 200 tentativa + stream intocado | API | Conjunto §1.3.1; métrica conflict; sem 409 EE |
| Replay histórico UPDATE → novo evento | API | `isReplay` true + novo `attempt_id` |
| Re-resposta treino → novo evento | API simulado | |
| Dual-write: histórico OK, stream falha | API | HTTP 200 aluno; métrica gap |
| Retry após stream OK + HTTP falho | API | mesmo `attempt_id` idempotente |
| `context` derivado; body ignorado | API | rejeição métrica se reservado |
| `is_internal` não falsificável pelo body | API | |
| `question_version` estável | unit helper | fixtures JSON |
| Fallback não bloqueia player | component + API | |
| RLS / ownership | integration (service role + JWT) | |
| Reconciliação pareamento | script/unit | `attempt_id` preferencial |
| Não-regressão `recommendations.ts` | suite existente | sem mudanças de comportamento |
| Redução offline de projeção | unit fixtures | só CI; sem produto |

---

## Documentação canônica

| Documento | Papel |
|-----------|--------|
| [DECISAO_EVIDENCE_ENGINE.md](DECISAO_EVIDENCE_ENGINE.md) | ADR — decisões e invariantes (prevalece) |
| **Este arquivo** | Spec operacional Fase 1 — event stream |
| [DECISAO_QUALITY_HIBRIDA.md](DECISAO_QUALITY_HIBRIDA.md) | Ship / health catálogo (independente do EE) |
| [DECISAO_TRILHO_A_UNICO.md](DECISAO_TRILHO_A_UNICO.md) | Conteúdo handcraft golden-v1 |

---

## Próximo passo após aprovação humana

1. Aprovar esta spec e o ADR.
2. Implementar migration `evidence_attempt_events` + unique index + RLS (revisão humana — zona vermelha eng).
3. Estender bodies de `registrar-tentativa` / `simulado/responder` + ingestão server-side com fallback não bloqueante.
4. Instrumentar coorte técnica com UI de convicção (flag `EE_V1_INSTRUMENTATION`).
5. Criar `artifacts/evidence-fase1-operational-plan.md` após baseline (§1.16).
6. Rodar checklist §4.6 + matriz §6 antes de iniciar Fase 2 (piloto PT anotado).

**Proibido** neste passo: domínio, T1, `measurement_pool`, RCT-1, alterações em `recommendations.ts`.

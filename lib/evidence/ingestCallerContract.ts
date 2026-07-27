/**
 * Contrato de campos confiáveis do caller (Lote 4 corretivo — I-6).
 *
 * O núcleo `ingestAttemptEvent` **não** lê rotas HTTP nem body bruto.
 * Lotes 5–6 devem popular `IngestAttemptEventInput` exclusivamente no servidor:
 *
 * | Campo | Origem obrigatória (Lote 5/6) | Proibido |
 * |-------|------------------------------|----------|
 * | `user_id` | JWT validado (`getUserAndClientFromBearer`) | Body / query |
 * | `user_email` | JWT / perfil autenticado | Body |
 * | `correct` | `resolveQuestionAttempt(conteudo, opcao_id)` | Body |
 * | `selected_alternative` | `opcao_id` validado na rota | Body EE |
 * | `question_id` | `modulo_slug` validado + entitlement | Body arbitrário |
 * | `conteudo_json` | Snapshot do catálogo carregado na rota | Body do cliente |
 * | `session_kind` | `resolveSimuladoSessionKind(session.filtros)` (L6) | Body / header |
 * | `session_id` | Sessão de simulado validada server-side (L6) | Body não validado |
 * | `e2e_instrumentation` | `isE2eBypassEnabled()` na rota (L5) | Body / header |
 *
 * `client_body` aceita somente campos EE (attempt_id, timestamps, conviction, …).
 * `context`, `is_internal`, `user_id`, `correct`, `question_version`, `source`
 * no body são ignorados ou não parseados para persistência.
 *
 * @see docs/SPEC_EVIDENCE_ENGINE_FASE_1_EVENT_STREAM.md §1.7, §1.9, §3.11
 */

export const EVIDENCE_INGEST_CALLER_CONTRACT_VERSION = 'fase1-lote4-i6' as const;

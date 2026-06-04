-- Smoke: migrations 20260604191239_rls_performance + 20260604191246_rls_performance_initplan_policies
-- Executar no SQL Editor (service role) após db push.
-- Cada bloco deve retornar ok = true. Qualquer false → investigar antes de produção.

-- 1) historico_questoes: sem policies legadas PT/EN; 4 owner com initplan
SELECT
  NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'historico_questoes'
      AND policyname IN (
        'Users can view their own question history',
        'Users can insert their own question history',
        'Users can update their own question history',
        'Users can delete their own question history',
        'Usuários veem seu próprio histórico',
        'Usuários gravam suas tentativas'
      )
  ) AS no_legacy_policies,
  (
    SELECT count(*)::int FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'historico_questoes'
  ) = 4 AS policy_count_is_four,
  (
    SELECT count(*)::int FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'historico_questoes'
      AND policyname LIKE 'historico_questoes_owner_%'
      AND (
        coalesce(qual, '') || coalesce(with_check, '')
      ) ~ 'select auth\.uid\(\)'
  ) = 4 AS all_use_initplan;

-- 2) concursos / concurso_modulos / modulos_estudo: uma policy SELECT consolidada
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('concursos', 'concurso_modulos', 'modulos_estudo')
  AND cmd = 'SELECT'
ORDER BY tablename;

-- Esperado: exatamente 3 linhas (nomes *_select_enrolled_or_sellable)
SELECT
  (
    SELECT count(*)::int FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('concursos', 'concurso_modulos', 'modulos_estudo')
      AND cmd = 'SELECT'
  ) = 3 AS single_select_policy_per_table;

-- 3) Índice duplicado content_hash removido
SELECT
  NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.modulos_estudo'::regclass
      AND conname = 'unique_question_content'
  ) AS duplicate_constraint_dropped,
  EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND tablename = 'modulos_estudo'
      AND indexname = 'uniq_modulos_estudo_content_hash'
  ) AS canonical_unique_index_exists;

-- 4) Índices FK da migration
SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname IN (
    'idx_error_reports_resolved_by',
    'idx_error_reports_simulado_session_id',
    'idx_simulado_respostas_modulo_id',
    'idx_simulado_sessions_template_id',
    'idx_lp_pages_template_id'
  )
ORDER BY indexname;

-- 5) Amostra anon: concursos vendáveis visíveis (simula policy pública)
-- No SQL Editor role postgres vê tudo; para testar como anon use o app ou API com anon key.
SELECT id, slug, status, price_cents
FROM public.concursos
WHERE status = 'ativo'::concurso_status
  AND price_cents IS NOT NULL
  AND price_cents > 0
LIMIT 5;

-- 6) Matrículas ativas (smoke manual: login com um destes user_id no app)
SELECT cm.user_id, c.slug AS concurso_slug, cm.status, cm.expires_at
FROM public.concurso_matriculas cm
JOIN public.concursos c ON c.id = cm.concurso_id
WHERE cm.status = 'ativo'::concurso_matricula_status
  AND (cm.expires_at IS NULL OR cm.expires_at > now())
LIMIT 10;

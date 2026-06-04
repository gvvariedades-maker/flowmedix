-- Fase 2 (segurança): revogar EXECUTE no wrapper do trigger de simulado;
-- políticas service_role explícitas em tabelas admin-only (advisors RLS).

-- Trigger wrapper: não é RPC pública; o trigger continua (owner postgres).
REVOKE EXECUTE ON FUNCTION public.on_simulado_session_finalize_refresh_analytics() FROM PUBLIC, anon, authenticated;

COMMENT ON FUNCTION public.on_simulado_session_finalize_refresh_analytics() IS
  'AFTER UPDATE trigger em simulado_sessions → refresh_simulado_session_analytics. EXECUTE revogado de anon/authenticated; não invocar via PostgREST.';

-- email_templates: RLS ligado sem policy anon — acesso só createServerSupabase() (service_role).
COMMENT ON TABLE public.email_templates IS
  'Copy de e-mails transacionais e campanhas (admin). RLS: sem SELECT/INSERT para anon/authenticated; policy service_role abaixo.';

DROP POLICY IF EXISTS "email_templates_service_all" ON public.email_templates;
CREATE POLICY "email_templates_service_all"
  ON public.email_templates FOR ALL TO service_role USING (true) WITH CHECK (true);

-- invite_links / invite_redemptions: convites Pro; APIs admin e resgate server-side.
COMMENT ON TABLE public.invite_links IS
  'Tokens de convite (admin). RLS: bloqueio anon/authenticated; policy service_role abaixo.';

DROP POLICY IF EXISTS "invite_links_service_all" ON public.invite_links;
CREATE POLICY "invite_links_service_all"
  ON public.invite_links FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE public.invite_redemptions IS
  'Auditoria de resgates. RLS: bloqueio anon/authenticated; policy service_role abaixo.';

DROP POLICY IF EXISTS "invite_redemptions_service_all" ON public.invite_redemptions;
CREATE POLICY "invite_redemptions_service_all"
  ON public.invite_redemptions FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Fase 3.1: conteúdo pago em modulos_estudo — SELECT só com matrícula ativa.

-- Metadados de vitrine/LP continuam em concursos / concurso_modulos (branch sellable).

-- Pré-requisito: leituras server-side via service role (lib/cache.ts), não anon.



DROP POLICY IF EXISTS "modulos_estudo_select_enrolled_or_sellable" ON public.modulos_estudo;



CREATE POLICY "modulos_estudo_select_enrolled_only"

  ON public.modulos_estudo FOR SELECT

  USING (

    EXISTS (

      SELECT 1

      FROM public.concurso_modulos cm

      INNER JOIN public.concurso_matriculas mat ON mat.concurso_id = cm.concurso_id

      WHERE cm.modulo_id = modulos_estudo.id

        AND mat.user_id = (select auth.uid())

        AND mat.status = 'ativo'::concurso_matricula_status

        AND (mat.expires_at IS NULL OR mat.expires_at > now())

    )

  );



COMMENT ON POLICY "modulos_estudo_select_enrolled_only" ON public.modulos_estudo IS

  'Conteudo_json e metadados do modulo so para usuario matriculado no concurso do pacote. Vitrine usa RPC/service role no servidor.';


-- AVANT - Base Remote Schema Migration
-- Initial baseline schema for Supabase local stack (pre-migration baseline)

CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

CREATE SCHEMA IF NOT EXISTS private;

CREATE SEQUENCE IF NOT EXISTS public.modulos_estudo_avant_codigo_seq;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'concurso_matricula_origem') THEN
    CREATE TYPE public.concurso_matricula_origem AS ENUM ('cadastro', 'admin', 'upgrade', 'purchase', 'stripe_pro', 'invite');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'concurso_matricula_status') THEN
    CREATE TYPE public.concurso_matricula_status AS ENUM ('ativo', 'expirado');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'concurso_modulo_origem') THEN
    CREATE TYPE public.concurso_modulo_origem AS ENUM ('publicacao', 'manual', 'regra');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'concurso_purchase_status') THEN
    CREATE TYPE public.concurso_purchase_status AS ENUM ('pending', 'paid', 'refunded');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'concurso_status') THEN
    CREATE TYPE public.concurso_status AS ENUM ('rascunho', 'ativo', 'arquivado');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'concurso_tipo') THEN
    CREATE TYPE public.concurso_tipo AS ENUM ('geral', 'edital');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public."acessos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "produto" text NOT NULL,
  "criado_em" timestamp with time zone DEFAULT now() NOT NULL,
  "stripe_checkout_session_id" text
);

CREATE TABLE IF NOT EXISTS public."concurso_matriculas" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "concurso_id" uuid NOT NULL,
  "origem" public.concurso_matricula_origem DEFAULT 'cadastro'::concurso_matricula_origem NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "expires_at" timestamp with time zone,
  "status" public.concurso_matricula_status DEFAULT 'ativo'::concurso_matricula_status NOT NULL
);

CREATE TABLE IF NOT EXISTS public."concurso_modulos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "concurso_id" uuid NOT NULL,
  "modulo_id" uuid NOT NULL,
  "origem" public.concurso_modulo_origem DEFAULT 'publicacao'::concurso_modulo_origem NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public."concurso_purchases" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "concurso_id" uuid NOT NULL,
  "status" public.concurso_purchase_status DEFAULT 'pending'::concurso_purchase_status NOT NULL,
  "gateway" text DEFAULT 'stripe'::text NOT NULL,
  "gateway_payment_id" text,
  "amount" integer NOT NULL,
  "currency" text DEFAULT 'brl'::text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "paid_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS public."concursos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "slug" text NOT NULL,
  "nome" text NOT NULL,
  "cidade" text,
  "orgao" text,
  "banca" text,
  "ano" integer,
  "cargo" text,
  "tipo" public.concurso_tipo DEFAULT 'edital'::concurso_tipo NOT NULL,
  "status" public.concurso_status DEFAULT 'rascunho'::concurso_status NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "price_cents" integer,
  "data_prova" date,
  "descricao" text,
  "destaque" text
);

CREATE TABLE IF NOT EXISTS public."historico_questoes" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "modulo_slug" text NOT NULL,
  "acertou" boolean NOT NULL,
  "banca" text,
  "topico" text,
  "subtopico" text,
  "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  "estudo_reverso_concluido" boolean DEFAULT false,
  "respondida" boolean DEFAULT true NOT NULL
);

CREATE TABLE IF NOT EXISTS public."modulos_estudo" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "modulo_nome" text NOT NULL,
  "titulo_aula" text NOT NULL,
  "modulo_slug" text NOT NULL,
  "banca" text,
  "assunto" text,
  "subtopico" text,
  "conteudo_json" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "content_hash" text,
  "avant_codigo" integer DEFAULT nextval('modulos_estudo_avant_codigo_seq'::regclass) NOT NULL,
  "cidade_id" uuid
);

CREATE TABLE IF NOT EXISTS public."study_notebook_items" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "notebook_id" uuid NOT NULL,
  "modulo_slug" text NOT NULL,
  "titulo_aula" text,
  "topico" text,
  "position" integer DEFAULT 0 NOT NULL,
  "added_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public."study_notebooks" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "source_pack_id" text
);

DO $$ BEGIN
  ALTER TABLE public."acessos" ADD CONSTRAINT "acessos_pkey" PRIMARY KEY (id);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public."acessos" ADD CONSTRAINT "acessos_stripe_session_unique" UNIQUE (stripe_checkout_session_id);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public."acessos" ADD CONSTRAINT "acessos_user_produto_unique" UNIQUE (user_id, produto);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public."concurso_matriculas" ADD CONSTRAINT "concurso_matriculas_pkey" PRIMARY KEY (id);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public."concurso_matriculas" ADD CONSTRAINT "concurso_matriculas_user_id_concurso_id_key" UNIQUE (user_id, concurso_id);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public."concurso_modulos" ADD CONSTRAINT "concurso_modulos_concurso_id_modulo_id_key" UNIQUE (concurso_id, modulo_id);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public."concurso_modulos" ADD CONSTRAINT "concurso_modulos_pkey" PRIMARY KEY (id);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public."concurso_purchases" ADD CONSTRAINT "concurso_purchases_amount_positive" CHECK (amount > 0);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public."concurso_purchases" ADD CONSTRAINT "concurso_purchases_gateway_payment_unique" UNIQUE (gateway, gateway_payment_id);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public."concurso_purchases" ADD CONSTRAINT "concurso_purchases_pkey" PRIMARY KEY (id);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public."concursos" ADD CONSTRAINT "concursos_pkey" PRIMARY KEY (id);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public."concursos" ADD CONSTRAINT "concursos_slug_key" UNIQUE (slug);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public."historico_questoes" ADD CONSTRAINT "historico_questoes_pkey" PRIMARY KEY (id);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public."modulos_estudo" ADD CONSTRAINT "modulos_estudo_modulo_slug_key" UNIQUE (modulo_slug);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public."modulos_estudo" ADD CONSTRAINT "modulos_estudo_pkey" PRIMARY KEY (id);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public."study_notebook_items" ADD CONSTRAINT "study_notebook_items_pkey" PRIMARY KEY (id);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public."study_notebooks" ADD CONSTRAINT "study_notebooks_pkey" PRIMARY KEY (id);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public."acessos" ADD CONSTRAINT "acessos_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public."concurso_matriculas" ADD CONSTRAINT "concurso_matriculas_concurso_id_fkey" FOREIGN KEY (concurso_id) REFERENCES concursos(id) ON DELETE CASCADE;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public."concurso_matriculas" ADD CONSTRAINT "concurso_matriculas_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public."concurso_modulos" ADD CONSTRAINT "concurso_modulos_concurso_id_fkey" FOREIGN KEY (concurso_id) REFERENCES concursos(id) ON DELETE CASCADE;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public."concurso_modulos" ADD CONSTRAINT "concurso_modulos_modulo_id_fkey" FOREIGN KEY (modulo_id) REFERENCES modulos_estudo(id) ON DELETE CASCADE;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public."concurso_purchases" ADD CONSTRAINT "concurso_purchases_concurso_id_fkey" FOREIGN KEY (concurso_id) REFERENCES concursos(id) ON DELETE CASCADE;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public."concurso_purchases" ADD CONSTRAINT "concurso_purchases_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public."historico_questoes" ADD CONSTRAINT "historico_questoes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public."study_notebook_items" ADD CONSTRAINT "study_notebook_items_notebook_id_fkey" FOREIGN KEY (notebook_id) REFERENCES study_notebooks(id) ON DELETE CASCADE;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public."study_notebooks" ADD CONSTRAINT "study_notebooks_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.admin_get_auth_user_id_by_email(user_email text)
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'auth', 'public'
AS $function$
  SELECT id
  FROM auth.users
  WHERE lower(trim(email)) = lower(trim(user_email))
  LIMIT 1;
$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.avant_catalog_stats()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH slides_per_modulo AS (
    SELECT
      CASE
        WHEN jsonb_array_length(COALESCE(conteudo_json->'reverse_study_slides', '[]'::jsonb)) > 0
          THEN jsonb_array_length(conteudo_json->'reverse_study_slides')
        ELSE jsonb_array_length(COALESCE(conteudo_json->'study_slides', '[]'::jsonb))
      END AS slide_count
    FROM modulos_estudo
    WHERE conteudo_json IS NOT NULL
  )
  SELECT jsonb_build_object(
    'total_questions', (SELECT count(*)::int FROM slides_per_modulo WHERE slide_count > 0),
    'total_slides', (SELECT coalesce(sum(slide_count), 0)::int FROM slides_per_modulo WHERE slide_count > 0)
  );
$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.avant_scale_health_metrics()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT jsonb_build_object(
    'generated_at', to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    'modulos_estudo_count', (SELECT count(*)::int FROM modulos_estudo),
    'historico_questoes_count', (SELECT count(*)::int FROM historico_questoes),
    'json_bytes', (
      SELECT jsonb_build_object(
        'avg', coalesce(round(avg(pg_column_size(conteudo_json)))::int, 0),
        'max', coalesce(max(pg_column_size(conteudo_json))::int, 0),
        'p95', coalesce(
          (percentile_cont(0.95) WITHIN GROUP (ORDER BY pg_column_size(conteudo_json)))::int,
          0
        ),
        'total', coalesce(sum(pg_column_size(conteudo_json))::bigint, 0)
      )
      FROM modulos_estudo
      WHERE conteudo_json IS NOT NULL
    ),
    'questions_over_100kb', (
      SELECT count(*)::int
      FROM modulos_estudo
      WHERE conteudo_json IS NOT NULL
        AND pg_column_size(conteudo_json) > 102400
    ),
    'assuntos_over_200_count', (
      SELECT count(*)::int
      FROM (
        SELECT titulo_aula
        FROM modulos_estudo
        WHERE titulo_aula IS NOT NULL AND btrim(titulo_aula) <> ''
        GROUP BY titulo_aula
        HAVING count(*) > 200
      ) AS heavy_assuntos
    ),
    'users_historico_over_5000', (
      SELECT count(*)::int
      FROM (
        SELECT user_id
        FROM historico_questoes
        GROUP BY user_id
        HAVING count(*) > 5000
      ) AS heavy_users
    ),
    'reverse_slides', (
      SELECT jsonb_build_object(
        'avg', coalesce(
          round(avg(
            jsonb_array_length(COALESCE(conteudo_json->'reverse_study_slides', '[]'::jsonb))
          ))::numeric,
          0
        ),
        'not_four_slides', (
          SELECT count(*)::int
          FROM modulos_estudo
          WHERE conteudo_json IS NOT NULL
            AND jsonb_array_length(COALESCE(conteudo_json->'reverse_study_slides', '[]'::jsonb)) <> 4
        )
      )
      FROM modulos_estudo
      WHERE conteudo_json IS NOT NULL
    )
  );
$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.expire_concurso_matriculas()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
  v_count integer;
BEGIN
  UPDATE public.concurso_matriculas
  SET status = 'expirado'
  WHERE status = 'ativo'
    AND expires_at IS NOT NULL
    AND expires_at < now();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.fulfill_concurso_purchase(purchase_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
  v_purchase public.concurso_purchases%ROWTYPE;
  v_expires_at timestamptz;
BEGIN
  SELECT *
  INTO v_purchase
  FROM public.concurso_purchases
  WHERE id = purchase_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'concurso_purchase not found: %', purchase_id
      USING ERRCODE = 'P0002';
  END IF;

  IF v_purchase.status = 'paid' THEN
    RETURN v_purchase.id;
  END IF;

  IF v_purchase.status <> 'pending' THEN
    RAISE EXCEPTION 'concurso_purchase % is not pending (status=%)', purchase_id, v_purchase.status
      USING ERRCODE = 'P0001';
  END IF;

  SELECT COALESCE(c.data_prova::timestamptz, now()) + interval '30 days'
  INTO v_expires_at
  FROM public.concursos c
  WHERE c.id = v_purchase.concurso_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'concurso not found for purchase %', purchase_id
      USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.concurso_purchases
  SET
    status = 'paid',
    paid_at = now()
  WHERE id = purchase_id;

  INSERT INTO public.concurso_matriculas (
    user_id,
    concurso_id,
    origem,
    expires_at,
    status
  )
  VALUES (
    v_purchase.user_id,
    v_purchase.concurso_id,
    'purchase',
    v_expires_at,
    'ativo'
  )
  ON CONFLICT (user_id, concurso_id) DO UPDATE
  SET
    status = CASE
      WHEN concurso_matriculas.origem = 'stripe_pro' THEN concurso_matriculas.status
      ELSE EXCLUDED.status
    END,
    origem = CASE
      WHEN concurso_matriculas.origem = 'stripe_pro' THEN 'stripe_pro'
      ELSE EXCLUDED.origem
    END,
    expires_at = CASE
      WHEN concurso_matriculas.origem = 'stripe_pro' THEN concurso_matriculas.expires_at
      ELSE EXCLUDED.expires_at
    END;

  RETURN purchase_id;
END;
$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.get_simulado_question_pool(p_user_id uuid, p_quantidade integer DEFAULT 20, p_banca text DEFAULT NULL::text, p_assunto text DEFAULT NULL::text, p_q text DEFAULT NULL::text, p_bancas text[] DEFAULT NULL::text[], p_assuntos text[] DEFAULT NULL::text[])
 RETURNS TABLE(modulo_id uuid, modulo_slug text, ordem integer)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_accessible_limit constant int := 10000;
  v_quantidade int := LEAST(GREATEST(COALESCE(p_quantidade, 20), 1), 100);
  v_q text := NULLIF(lower(btrim(coalesce(p_q, ''))), '');
  v_q_num text := regexp_replace(lower(btrim(coalesce(p_q, ''))), '^q-?', '', 'i');
BEGIN
  RETURN QUERY
  WITH active_matriculas AS (
    SELECT cm.concurso_id
    FROM public.concurso_matriculas cm
    WHERE cm.user_id = p_user_id
      AND (cm.status IS NULL OR cm.status = 'ativo')
      AND (cm.expires_at IS NULL OR cm.expires_at > now())
  ),
  edital_concurso AS (
    SELECT c.id
    FROM active_matriculas am
    INNER JOIN public.concursos c ON c.id = am.concurso_id
    WHERE c.tipo = 'edital'
    LIMIT 1
  ),
  nav_concurso_ids AS (
    SELECT am.concurso_id
    FROM active_matriculas am
    WHERE EXISTS (SELECT 1 FROM edital_concurso)
      AND am.concurso_id = (SELECT id FROM edital_concurso)
    UNION ALL
    SELECT am.concurso_id
    FROM active_matriculas am
    WHERE NOT EXISTS (SELECT 1 FROM edital_concurso)
  ),
  linked_modulos AS (
    SELECT
      m.id,
      m.modulo_slug,
      m.modulo_nome,
      m.titulo_aula,
      m.banca,
      m.avant_codigo,
      m.created_at,
      c.slug AS concurso_slug
    FROM nav_concurso_ids nci
    INNER JOIN public.concurso_modulos cm ON cm.concurso_id = nci.concurso_id
    INNER JOIN public.modulos_estudo m ON m.id = cm.modulo_id
    INNER JOIN public.concursos c ON c.id = nci.concurso_id
    WHERE c.slug <> 'campina-grande-2026'
       OR lower(coalesce(m.banca, '')) LIKE '%idecan%'
  ),
  deduped_by_id AS (
    SELECT DISTINCT ON (lm.id)
      lm.id,
      lm.modulo_slug,
      lm.modulo_nome,
      lm.titulo_aula,
      lm.banca,
      lm.avant_codigo,
      lm.created_at
    FROM linked_modulos lm
    ORDER BY lm.id, lm.created_at DESC NULLS LAST
  ),
  deduped_by_slug AS (
    SELECT DISTINCT ON (dbi.modulo_slug)
      dbi.id,
      dbi.modulo_slug,
      dbi.modulo_nome,
      dbi.titulo_aula,
      dbi.banca,
      dbi.avant_codigo,
      dbi.created_at
    FROM deduped_by_id dbi
    ORDER BY dbi.modulo_slug, dbi.created_at DESC NULLS LAST
  ),
  accessible_modulos AS (
    SELECT *
    FROM deduped_by_slug
    ORDER BY created_at DESC NULLS LAST
    LIMIT v_accessible_limit
  ),
  filtered_modulos AS (
    SELECT am.*
    FROM accessible_modulos am
    WHERE (
        (p_bancas IS NULL OR cardinality(p_bancas) = 0 OR am.banca = ANY(p_bancas))
        AND (p_banca IS NULL OR btrim(p_banca) = '' OR am.banca = btrim(p_banca))
      )
      AND (
        (p_assuntos IS NULL OR cardinality(p_assuntos) = 0 OR am.titulo_aula = ANY(p_assuntos))
        AND (p_assunto IS NULL OR btrim(p_assunto) = '' OR am.titulo_aula = btrim(p_assunto))
      )
      AND (
        v_q IS NULL
        OR lower(coalesce(am.titulo_aula, '')) LIKE '%' || v_q || '%'
        OR lower(coalesce(am.modulo_nome, '')) LIKE '%' || v_q || '%'
        OR lower(coalesce(am.banca, '')) LIKE '%' || v_q || '%'
        OR lower(coalesce(am.modulo_slug, '')) LIKE '%' || v_q || '%'
        OR (
          am.avant_codigo IS NOT NULL
          AND (
            am.avant_codigo::text = v_q_num
            OR ('q-' || am.avant_codigo::text) LIKE '%' || v_q || '%'
          )
        )
      )
  ),
  sampled AS (
    SELECT
      fm.id AS modulo_id_selected,
      fm.modulo_slug AS modulo_slug_selected,
      random() AS random_score
    FROM filtered_modulos fm
    ORDER BY random_score
    LIMIT v_quantidade
  )
  SELECT
    s.modulo_id_selected AS modulo_id,
    s.modulo_slug_selected AS modulo_slug,
    ROW_NUMBER() OVER (ORDER BY s.random_score)::integer AS ordem
  FROM sampled s;
END;
$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.get_simulado_question_pool_count(p_user_id uuid, p_banca text DEFAULT NULL::text, p_assunto text DEFAULT NULL::text, p_q text DEFAULT NULL::text, p_bancas text[] DEFAULT NULL::text[], p_assuntos text[] DEFAULT NULL::text[])
 RETURNS integer
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_accessible_limit constant int := 10000;
  v_q text := NULLIF(lower(btrim(coalesce(p_q, ''))), '');
  v_q_num text := regexp_replace(lower(btrim(coalesce(p_q, ''))), '^q-?', '', 'i');
  v_count integer := 0;
BEGIN
  WITH active_matriculas AS (
    SELECT cm.concurso_id
    FROM public.concurso_matriculas cm
    WHERE cm.user_id = p_user_id
      AND (cm.status IS NULL OR cm.status = 'ativo')
      AND (cm.expires_at IS NULL OR cm.expires_at > now())
  ),
  edital_concurso AS (
    SELECT c.id
    FROM active_matriculas am
    INNER JOIN public.concursos c ON c.id = am.concurso_id
    WHERE c.tipo = 'edital'
    LIMIT 1
  ),
  nav_concurso_ids AS (
    SELECT am.concurso_id
    FROM active_matriculas am
    WHERE EXISTS (SELECT 1 FROM edital_concurso)
      AND am.concurso_id = (SELECT id FROM edital_concurso)
    UNION ALL
    SELECT am.concurso_id
    FROM active_matriculas am
    WHERE NOT EXISTS (SELECT 1 FROM edital_concurso)
  ),
  linked_modulos AS (
    SELECT
      m.id,
      m.modulo_slug,
      m.modulo_nome,
      m.titulo_aula,
      m.banca,
      m.avant_codigo,
      m.created_at
    FROM nav_concurso_ids nci
    INNER JOIN public.concurso_modulos cm ON cm.concurso_id = nci.concurso_id
    INNER JOIN public.modulos_estudo m ON m.id = cm.modulo_id
    INNER JOIN public.concursos c ON c.id = nci.concurso_id
    WHERE c.slug <> 'campina-grande-2026'
       OR lower(coalesce(m.banca, '')) LIKE '%idecan%'
  ),
  deduped_by_id AS (
    SELECT DISTINCT ON (lm.id)
      lm.id,
      lm.modulo_slug,
      lm.modulo_nome,
      lm.titulo_aula,
      lm.banca,
      lm.avant_codigo,
      lm.created_at
    FROM linked_modulos lm
    ORDER BY lm.id, lm.created_at DESC NULLS LAST
  ),
  deduped_by_slug AS (
    SELECT DISTINCT ON (dbi.modulo_slug)
      dbi.id,
      dbi.modulo_slug,
      dbi.modulo_nome,
      dbi.titulo_aula,
      dbi.banca,
      dbi.avant_codigo,
      dbi.created_at
    FROM deduped_by_id dbi
    ORDER BY dbi.modulo_slug, dbi.created_at DESC NULLS LAST
  ),
  accessible_modulos AS (
    SELECT *
    FROM deduped_by_slug
    ORDER BY created_at DESC NULLS LAST
    LIMIT v_accessible_limit
  ),
  filtered_modulos AS (
    SELECT am.*
    FROM accessible_modulos am
    WHERE (
        (p_bancas IS NULL OR cardinality(p_bancas) = 0 OR am.banca = ANY(p_bancas))
        AND (p_banca IS NULL OR btrim(p_banca) = '' OR am.banca = btrim(p_banca))
      )
      AND (
        (p_assuntos IS NULL OR cardinality(p_assuntos) = 0 OR am.titulo_aula = ANY(p_assuntos))
        AND (p_assunto IS NULL OR btrim(p_assunto) = '' OR am.titulo_aula = btrim(p_assunto))
      )
      AND (
        v_q IS NULL
        OR lower(coalesce(am.titulo_aula, '')) LIKE '%' || v_q || '%'
        OR lower(coalesce(am.modulo_nome, '')) LIKE '%' || v_q || '%'
        OR lower(coalesce(am.banca, '')) LIKE '%' || v_q || '%'
        OR lower(coalesce(am.modulo_slug, '')) LIKE '%' || v_q || '%'
        OR (
          am.avant_codigo IS NOT NULL
          AND (
            am.avant_codigo::text = v_q_num
            OR ('q-' || am.avant_codigo::text) LIKE '%' || v_q || '%'
          )
        )
      )
  )
  SELECT COUNT(*)::integer INTO v_count
  FROM filtered_modulos;

  RETURN COALESCE(v_count, 0);
END;
$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.get_vitrine_facets(p_user_id uuid, p_banca text DEFAULT NULL::text, p_bancas text[] DEFAULT NULL::text[])
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_accessible_limit constant int := 10000;
  v_bancas jsonb;
  v_assuntos jsonb;
BEGIN
  WITH active_matriculas AS (
    SELECT cm.concurso_id
    FROM public.concurso_matriculas cm
    WHERE cm.user_id = p_user_id
      AND (cm.status IS NULL OR cm.status = 'ativo')
      AND (cm.expires_at IS NULL OR cm.expires_at > now())
  ),
  edital_concurso AS (
    SELECT c.id
    FROM active_matriculas am
    INNER JOIN public.concursos c ON c.id = am.concurso_id
    WHERE c.tipo = 'edital'
    LIMIT 1
  ),
  nav_concurso_ids AS (
    SELECT am.concurso_id
    FROM active_matriculas am
    WHERE EXISTS (SELECT 1 FROM edital_concurso)
      AND am.concurso_id = (SELECT id FROM edital_concurso)
    UNION ALL
    SELECT am.concurso_id
    FROM active_matriculas am
    WHERE NOT EXISTS (SELECT 1 FROM edital_concurso)
  ),
  linked_modulos AS (
    SELECT
      m.id,
      m.modulo_slug,
      m.titulo_aula,
      m.banca,
      m.created_at,
      c.slug AS concurso_slug
    FROM nav_concurso_ids nci
    INNER JOIN public.concurso_modulos cm ON cm.concurso_id = nci.concurso_id
    INNER JOIN public.modulos_estudo m ON m.id = cm.modulo_id
    INNER JOIN public.concursos c ON c.id = nci.concurso_id
    WHERE c.slug <> 'campina-grande-2026'
       OR lower(coalesce(m.banca, '')) LIKE '%idecan%'
  ),
  deduped_by_id AS (
    SELECT DISTINCT ON (lm.id)
      lm.id,
      lm.modulo_slug,
      lm.titulo_aula,
      lm.banca,
      lm.created_at
    FROM linked_modulos lm
    ORDER BY lm.id, lm.created_at DESC NULLS LAST
  ),
  deduped_by_slug AS (
    SELECT DISTINCT ON (dbi.modulo_slug)
      dbi.id,
      dbi.modulo_slug,
      dbi.titulo_aula,
      dbi.banca,
      dbi.created_at
    FROM deduped_by_id dbi
    ORDER BY dbi.modulo_slug, dbi.created_at DESC NULLS LAST
  ),
  accessible_modulos AS (
    SELECT
      dbs.banca,
      dbs.titulo_aula
    FROM deduped_by_slug dbs
    ORDER BY dbs.created_at DESC NULLS LAST
    LIMIT v_accessible_limit
  )
  SELECT
    coalesce(
      (
        SELECT jsonb_agg(sub.banca ORDER BY sub.banca)
        FROM (
          SELECT DISTINCT am.banca
          FROM accessible_modulos am
          WHERE am.banca IS NOT NULL
            AND btrim(am.banca) <> ''
        ) sub
      ),
      '[]'::jsonb
    ),
    coalesce(
      (
        SELECT jsonb_agg(sub.titulo_aula ORDER BY sub.titulo_aula)
        FROM (
          SELECT DISTINCT am.titulo_aula
          FROM accessible_modulos am
          WHERE am.titulo_aula IS NOT NULL
            AND btrim(am.titulo_aula) <> ''
            AND (
              (p_bancas IS NULL OR cardinality(p_bancas) = 0 OR am.banca = ANY(p_bancas))
              AND (p_banca IS NULL OR btrim(p_banca) = '' OR am.banca = btrim(p_banca))
            )
        ) sub
      ),
      '[]'::jsonb
    )
  INTO v_bancas, v_assuntos;

  RETURN jsonb_build_object(
    'bancas', v_bancas,
    'assuntos', v_assuntos
  );
END;
$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.get_vitrine_page(p_user_id uuid, p_page integer DEFAULT 1, p_banca text DEFAULT NULL::text, p_assunto text DEFAULT NULL::text, p_q text DEFAULT NULL::text, p_bancas text[] DEFAULT NULL::text[], p_assuntos text[] DEFAULT NULL::text[], p_disciplina text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_per_page constant int := 12;
  v_accessible_limit constant int := 10000;
  v_group_questions_cap constant int := 200;
  v_page int := GREATEST(COALESCE(p_page, 1), 1);
  v_q text := NULLIF(lower(btrim(coalesce(p_q, ''))), '');
  v_q_num text := regexp_replace(lower(btrim(coalesce(p_q, ''))), '^q-?', '', 'i');
  v_disciplina text := NULLIF(lower(btrim(coalesce(p_disciplina, ''))), '');
  v_total_groups int := 0;
  v_total_pages int := 1;
  v_page_clamped int;
  v_total_modulos int := 0;
  v_groups jsonb;
  v_facets jsonb;
  v_disciplinas jsonb;
BEGIN
  WITH active_matriculas AS (
    SELECT cm.concurso_id
    FROM public.concurso_matriculas cm
    WHERE cm.user_id = p_user_id
      AND (cm.status IS NULL OR cm.status = 'ativo')
      AND (cm.expires_at IS NULL OR cm.expires_at > now())
  ),
  edital_concurso AS (
    SELECT c.id
    FROM active_matriculas am
    INNER JOIN public.concursos c ON c.id = am.concurso_id
    WHERE c.tipo = 'edital'
    LIMIT 1
  ),
  nav_concurso_ids AS (
    SELECT am.concurso_id
    FROM active_matriculas am
    WHERE EXISTS (SELECT 1 FROM edital_concurso)
      AND am.concurso_id = (SELECT id FROM edital_concurso)
    UNION ALL
    SELECT am.concurso_id
    FROM active_matriculas am
    WHERE NOT EXISTS (SELECT 1 FROM edital_concurso)
  ),
  linked_modulos AS (
    SELECT
      m.id,
      m.modulo_slug,
      m.modulo_nome,
      m.titulo_aula,
      m.banca,
      m.created_at,
      m.avant_codigo,
      c.slug AS concurso_slug
    FROM nav_concurso_ids nci
    INNER JOIN public.concurso_modulos cm ON cm.concurso_id = nci.concurso_id
    INNER JOIN public.modulos_estudo m ON m.id = cm.modulo_id
    INNER JOIN public.concursos c ON c.id = nci.concurso_id
    WHERE c.slug <> 'campina-grande-2026'
       OR lower(coalesce(m.banca, '')) LIKE '%idecan%'
  ),
  deduped_by_id AS (
    SELECT DISTINCT ON (lm.id)
      lm.id,
      lm.modulo_slug,
      lm.modulo_nome,
      lm.titulo_aula,
      lm.banca,
      lm.created_at,
      lm.avant_codigo
    FROM linked_modulos lm
    ORDER BY lm.id, lm.created_at DESC NULLS LAST
  ),
  deduped_by_slug AS (
    SELECT DISTINCT ON (dbi.modulo_slug)
      dbi.id,
      dbi.modulo_slug,
      dbi.modulo_nome,
      dbi.titulo_aula,
      dbi.banca,
      dbi.created_at,
      dbi.avant_codigo
    FROM deduped_by_id dbi
    ORDER BY dbi.modulo_slug, dbi.created_at DESC NULLS LAST
  ),
  accessible_modulos AS (
    SELECT
      dbs.id,
      dbs.modulo_slug,
      dbs.modulo_nome,
      dbs.titulo_aula,
      dbs.banca,
      dbs.created_at,
      dbs.avant_codigo
    FROM deduped_by_slug dbs
    ORDER BY dbs.created_at DESC NULLS LAST
    LIMIT v_accessible_limit
  ),
  facets_json AS (
    SELECT jsonb_build_object(
      'bancas',
      coalesce(
        (
          SELECT jsonb_agg(sub.banca ORDER BY sub.banca)
          FROM (
            SELECT DISTINCT am.banca
            FROM accessible_modulos am
            WHERE am.banca IS NOT NULL
              AND btrim(am.banca) <> ''
          ) sub
        ),
        '[]'::jsonb
      ),
      'assuntos',
      coalesce(
        (
          SELECT jsonb_agg(sub.titulo_aula ORDER BY sub.titulo_aula)
          FROM (
            SELECT DISTINCT am.titulo_aula
            FROM accessible_modulos am
            WHERE am.titulo_aula IS NOT NULL
              AND btrim(am.titulo_aula) <> ''
              AND (
                (p_bancas IS NULL OR cardinality(p_bancas) = 0 OR am.banca = ANY(p_bancas))
                AND (p_banca IS NULL OR btrim(p_banca) = '' OR am.banca = btrim(p_banca))
              )
          ) sub
        ),
        '[]'::jsonb
      )
    ) AS facets
  ),
  -- Banca / assunto / q — sem disciplina (picker precisa das duas prateleiras).
  base_filtered_modulos AS (
    SELECT am.*
    FROM accessible_modulos am
    WHERE (
        (p_bancas IS NULL OR cardinality(p_bancas) = 0 OR am.banca = ANY(p_bancas))
        AND (p_banca IS NULL OR btrim(p_banca) = '' OR am.banca = btrim(p_banca))
      )
      AND (
        (p_assuntos IS NULL OR cardinality(p_assuntos) = 0 OR am.titulo_aula = ANY(p_assuntos))
        AND (p_assunto IS NULL OR btrim(p_assunto) = '' OR am.titulo_aula = btrim(p_assunto))
      )
      AND (
        v_q IS NULL
        OR lower(coalesce(am.titulo_aula, '')) LIKE '%' || v_q || '%'
        OR lower(coalesce(am.modulo_nome, '')) LIKE '%' || v_q || '%'
        OR lower(coalesce(am.banca, '')) LIKE '%' || v_q || '%'
        OR lower(coalesce(am.modulo_slug, '')) LIKE '%' || v_q || '%'
        OR (
          am.avant_codigo IS NOT NULL
          AND (
            am.avant_codigo::text = v_q_num
            OR ('q-' || am.avant_codigo::text) LIKE '%' || v_q || '%'
          )
        )
      )
  ),
  filtered_modulos AS (
    SELECT bfm.*
    FROM base_filtered_modulos bfm
    WHERE (
      v_disciplina IS NULL
      OR (
        v_disciplina = 'portugues'
        AND lower(btrim(coalesce(bfm.modulo_nome, ''))) ~ '^l[ií]ngua\s+portuguesa$'
      )
      OR (
        v_disciplina = 'enfermagem'
        AND NOT (lower(btrim(coalesce(bfm.modulo_nome, ''))) ~ '^l[ií]ngua\s+portuguesa$')
      )
    )
  ),
  historico_agg AS (
    SELECT
      hq.modulo_slug,
      COUNT(*) FILTER (WHERE hq.respondida)::int AS total_tentativas,
      COUNT(*) FILTER (WHERE hq.respondida AND hq.acertou)::int AS acertos,
      BOOL_OR(hq.estudo_reverso_concluido) AS estudo_reverso_concluido
    FROM public.historico_questoes hq
    INNER JOIN base_filtered_modulos bfm ON bfm.modulo_slug = hq.modulo_slug
    WHERE hq.user_id = p_user_id
    GROUP BY hq.modulo_slug
  ),
  -- Resumo por disciplina (shape VitrineDisciplinaSummary), antes de p_disciplina.
  disciplina_group_stats AS (
    SELECT
      coalesce(bfm.titulo_aula, 'Sem subtópico') AS group_key,
      coalesce(
        (array_agg(bfm.modulo_nome ORDER BY bfm.created_at DESC NULLS LAST, bfm.modulo_slug ASC)
          FILTER (WHERE bfm.modulo_nome IS NOT NULL))[1],
        'Geral'
      ) AS modulo_nome,
      COUNT(*)::int AS total_questoes,
      COUNT(*) FILTER (WHERE coalesce(ha.estudo_reverso_concluido, false))::int AS trabalhadas
    FROM base_filtered_modulos bfm
    LEFT JOIN historico_agg ha ON ha.modulo_slug = bfm.modulo_slug
    GROUP BY coalesce(bfm.titulo_aula, 'Sem subtópico')
  ),
  disciplina_tagged AS (
    SELECT
      dgs.*,
      CASE
        WHEN lower(btrim(coalesce(dgs.modulo_nome, ''))) ~ '^l[ií]ngua\s+portuguesa$'
          THEN 'portugues'
        ELSE 'enfermagem'
      END AS disciplina_id
    FROM disciplina_group_stats dgs
  ),
  disciplina_buckets AS (
    SELECT
      d.id,
      d.label,
      coalesce(COUNT(dt.group_key), 0)::int AS total_assuntos,
      coalesce(SUM(dt.total_questoes), 0)::int AS total_questoes,
      coalesce(SUM(dt.trabalhadas), 0)::int AS trabalhadas
    FROM (
      VALUES
        ('enfermagem'::text, 'Enfermagem'::text),
        ('portugues'::text, 'Português'::text)
    ) AS d(id, label)
    LEFT JOIN disciplina_tagged dt ON dt.disciplina_id = d.id
    GROUP BY d.id, d.label
  ),
  disciplinas_json AS (
    SELECT coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', db.id,
          'label', db.label,
          'totalAssuntos', db.total_assuntos,
          'totalQuestoes', db.total_questoes,
          'trabalhadas', db.trabalhadas,
          'progressoPct', CASE
            WHEN db.total_questoes > 0
              THEN round((db.trabalhadas::numeric / db.total_questoes::numeric) * 100)::int
            ELSE 0
          END
        )
        ORDER BY CASE db.id WHEN 'enfermagem' THEN 1 WHEN 'portugues' THEN 2 ELSE 3 END
      ),
      '[]'::jsonb
    ) AS disciplinas
    FROM disciplina_buckets db
  ),
  modulos_enriched AS (
    SELECT
      fm.id,
      fm.modulo_slug,
      fm.modulo_nome,
      coalesce(fm.titulo_aula, 'Sem subtópico') AS group_key,
      fm.titulo_aula,
      fm.banca,
      fm.created_at,
      fm.avant_codigo,
      coalesce(ha.acertos, 0) AS acertos,
      coalesce(ha.total_tentativas, 0) AS total_tentativas,
      coalesce(ha.estudo_reverso_concluido, false) AS estudo_reverso_concluido,
      CASE
        WHEN jsonb_array_length(COALESCE(m.conteudo_json->'reverse_study_slides', '[]'::jsonb)) > 0
          THEN jsonb_array_length(m.conteudo_json->'reverse_study_slides')
        ELSE jsonb_array_length(COALESCE(m.conteudo_json->'study_slides', '[]'::jsonb))
      END AS slide_count
    FROM filtered_modulos fm
    INNER JOIN public.modulos_estudo m ON m.id = fm.id
    LEFT JOIN historico_agg ha ON ha.modulo_slug = fm.modulo_slug
  ),
  group_stats AS (
    SELECT
      me.group_key AS titulo_aula,
      coalesce(
        (array_agg(me.modulo_nome ORDER BY me.created_at DESC NULLS LAST, me.modulo_slug ASC)
          FILTER (WHERE me.modulo_nome IS NOT NULL))[1],
        'Geral'
      ) AS modulo_nome,
      coalesce(
        (array_agg(me.banca ORDER BY me.created_at DESC NULLS LAST, me.modulo_slug ASC)
          FILTER (WHERE me.banca IS NOT NULL))[1],
        ''
      ) AS banca,
      SUM(me.acertos)::int AS acertos,
      SUM(me.total_tentativas - me.acertos)::int AS erros,
      SUM(me.total_tentativas)::int AS total_resolvidas,
      COUNT(*)::int AS total_questoes,
      SUM(me.slide_count) FILTER (WHERE me.slide_count > 0)::int AS total_neuro_slides,
      COUNT(*) FILTER (WHERE me.estudo_reverso_concluido)::int AS trabalhadas
    FROM modulos_enriched me
    GROUP BY me.group_key
  ),
  groups_ordered AS (
    SELECT
      gs.*,
      CASE
        WHEN gs.total_resolvidas > 0 THEN round((gs.acertos::numeric / gs.total_resolvidas::numeric) * 100)::int
        ELSE 0
      END AS percentual,
      ROW_NUMBER() OVER (
        ORDER BY (gs.total_questoes - gs.trabalhadas) DESC, gs.titulo_aula ASC
      ) AS rn,
      COUNT(*) OVER ()::int AS total_groups
    FROM group_stats gs
  ),
  groups_page AS (
    SELECT go.*
    FROM groups_ordered go
    WHERE go.rn > (v_page - 1) * v_per_page
      AND go.rn <= v_page * v_per_page
  ),
  questoes_ranked AS (
    SELECT
      me.group_key,
      me.modulo_slug,
      me.avant_codigo,
      me.created_at,
      me.estudo_reverso_concluido,
      ROW_NUMBER() OVER (
        PARTITION BY me.group_key
        ORDER BY me.created_at ASC NULLS LAST, me.avant_codigo ASC NULLS LAST, me.modulo_slug ASC
      )::int AS numero
    FROM modulos_enriched me
    WHERE me.group_key IN (SELECT gp.titulo_aula FROM groups_page gp)
  ),
  groups_json AS (
    SELECT
      gp.titulo_aula,
      gp.modulo_nome,
      gp.banca,
      gp.acertos,
      gp.erros,
      gp.total_resolvidas AS "totalResolvidas",
      gp.total_questoes AS "totalQuestoes",
      coalesce(gp.total_neuro_slides, 0) AS "totalNeuroSlides",
      gp.trabalhadas,
      gp.percentual,
      coalesce(
        (
          SELECT qr_nao.modulo_slug
          FROM questoes_ranked qr_nao
          WHERE qr_nao.group_key = gp.titulo_aula
            AND NOT qr_nao.estudo_reverso_concluido
          ORDER BY qr_nao.numero
          LIMIT 1
        ),
        (
          SELECT qr_first.modulo_slug
          FROM questoes_ranked qr_first
          WHERE qr_first.group_key = gp.titulo_aula
          ORDER BY qr_first.numero
          LIMIT 1
        ),
        ''
      ) AS "firstSlug",
      (
        SELECT coalesce(
          jsonb_agg(
            jsonb_build_object(
              'slug', qr.modulo_slug,
              'numero', qr.numero,
              'status', CASE WHEN qr.estudo_reverso_concluido THEN 'estudada' ELSE 'nao_estudada' END,
              'avant_codigo', qr.avant_codigo,
              'created_at', qr.created_at
            )
            ORDER BY qr.numero
          ),
          '[]'::jsonb
        )
        FROM questoes_ranked qr
        WHERE qr.group_key = gp.titulo_aula
          AND qr.numero <= v_group_questions_cap
      ) AS questoes,
      gp.rn
    FROM groups_page gp
  )
  SELECT
    (SELECT COUNT(*)::int FROM filtered_modulos),
    coalesce((SELECT MAX(go.total_groups) FROM groups_ordered go), 0),
    coalesce(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'titulo_aula', gj.titulo_aula,
            'modulo_nome', gj.modulo_nome,
            'banca', gj.banca,
            'acertos', gj.acertos,
            'erros', gj.erros,
            'totalResolvidas', gj."totalResolvidas",
            'totalQuestoes', gj."totalQuestoes",
            'totalNeuroSlides', gj."totalNeuroSlides",
            'trabalhadas', gj.trabalhadas,
            'percentual', gj.percentual,
            'firstSlug', gj."firstSlug",
            'questoes', gj.questoes
          )
          ORDER BY gj.rn
        )
        FROM groups_json gj
      ),
      '[]'::jsonb
    ),
    (SELECT fj.facets FROM facets_json fj),
    (SELECT dj.disciplinas FROM disciplinas_json dj)
  INTO v_total_modulos, v_total_groups, v_groups, v_facets, v_disciplinas;

  v_total_pages := GREATEST(1, CEIL(v_total_groups::numeric / v_per_page::numeric)::int);
  v_page_clamped := LEAST(v_page, v_total_pages);

  RETURN jsonb_build_object(
    'groups', v_groups,
    'pagination', jsonb_build_object(
      'page', v_page_clamped,
      'perPage', v_per_page,
      'totalGroups', v_total_groups,
      'totalPages', v_total_pages
    ),
    'totalModulosFiltrados', v_total_modulos,
    'facets', coalesce(v_facets, jsonb_build_object('bancas', '[]'::jsonb, 'assuntos', '[]'::jsonb)),
    'disciplinas', coalesce(v_disciplinas, '[]'::jsonb)
  );
END;
$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.gin_extract_query_trgm(text, internal, smallint, internal, internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gin_extract_query_trgm$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.gin_extract_value_trgm(text, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gin_extract_value_trgm$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.gin_trgm_consistent(internal, smallint, text, integer, internal, internal, internal, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gin_trgm_consistent$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.gin_trgm_triconsistent(internal, smallint, text, integer, internal, internal, internal)
 RETURNS "char"
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gin_trgm_triconsistent$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.gtrgm_compress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_compress$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.gtrgm_consistent(internal, text, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_consistent$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.gtrgm_decompress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_decompress$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.gtrgm_distance(internal, text, smallint, oid, internal)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_distance$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.gtrgm_in(cstring)
 RETURNS gtrgm
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_in$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.gtrgm_options(internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE
AS '$libdir/pg_trgm', $function$gtrgm_options$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.gtrgm_out(gtrgm)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_out$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.gtrgm_penalty(internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_penalty$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.gtrgm_picksplit(internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_picksplit$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.gtrgm_same(gtrgm, gtrgm, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_same$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.gtrgm_union(internal, internal)
 RETURNS gtrgm
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_union$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.invalidate_cache_via_webhook(table_name text, event_type text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public', 'private'
AS $function$
DECLARE
  base_url text;
  webhook_secret text;
  webhook_url text;
BEGIN
  SELECT c.base_url, c.secret
  INTO base_url, webhook_secret
  FROM private.cache_webhook_config c
  WHERE c.id = 1;

  IF base_url IS NULL OR webhook_secret IS NULL THEN
    base_url := nullif(btrim(current_setting('app.webhook_url', true)), '');
    webhook_secret := nullif(btrim(current_setting('app.webhook_secret', true)), '');
  END IF;

  IF base_url IS NULL OR webhook_secret IS NULL THEN
    RAISE WARNING
      'invalidate_cache_via_webhook skipped: configure private.cache_webhook_config or GUCs app.webhook_url / app.webhook_secret. table=%, event=%',
      table_name,
      event_type;
    RETURN;
  END IF;

  webhook_url := regexp_replace(base_url, '/+$', '') || '/api/cache/revalidate';

  PERFORM net.http_post(
    url := webhook_url,
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || webhook_secret,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'table', table_name,
      'event', event_type
    )
  );

  RAISE LOG 'Cache invalidation triggered: url=%, table=%, event=%', webhook_url, table_name, event_type;
END;
$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.modules_search_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
  -- Combina Título (Peso A - mais importante) e Tags (Peso B)
  new.search_vector :=
    setweight(to_tsvector('portuguese', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('portuguese', array_to_string(coalesce(new.tags, '{}'), ' ')), 'B');
  RETURN new;
END
$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.on_simulado_session_finalize_refresh_analytics()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'concluido' AND NEW.concluida_em IS NOT NULL
     AND (OLD.status IS DISTINCT FROM 'concluido' OR OLD.concluida_em IS DISTINCT FROM NEW.concluida_em) THEN
    PERFORM public.refresh_simulado_session_analytics(NEW.id);
  END IF;
  RETURN NEW;
END;
$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.refresh_simulado_session_analytics(p_session_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_session public.simulado_sessions%ROWTYPE;
  v_mode text;
  v_data_ref date;
BEGIN
  SELECT * INTO v_session FROM public.simulado_sessions WHERE id = p_session_id;
  IF v_session.id IS NULL THEN RETURN; END IF;
  IF v_session.status <> 'concluido' OR v_session.concluida_em IS NULL THEN RETURN; END IF;
  v_mode := CASE
    WHEN v_session.modo IN ('treino', 'prova') THEN v_session.modo
    WHEN coalesce(v_session.filtros ->> 'modo', 'treino') = 'prova' THEN 'prova'
    ELSE 'treino'
  END;
  v_data_ref := (v_session.concluida_em AT TIME ZONE 'UTC')::date;
  WITH session_rollup AS (
    SELECT
      count(*) FILTER (WHERE r.acertou IS NOT NULL)::integer AS respondidas,
      count(*) FILTER (WHERE r.acertou = true)::integer AS acertos,
      count(*) FILTER (WHERE r.acertou = false)::integer AS erros,
      coalesce(sum(r.tempo_ms) FILTER (WHERE r.acertou IS NOT NULL), 0)::integer AS tempo_total_ms
    FROM public.simulado_respostas r
    WHERE r.session_id = v_session.id AND r.user_id = v_session.user_id
  )
  UPDATE public.simulado_sessions s SET
    acertos = sr.acertos, erros = sr.erros,
    percentual_acerto = CASE WHEN sr.respondidas > 0 THEN round((sr.acertos::numeric / sr.respondidas::numeric) * 100, 2) ELSE NULL END,
    tempo_total_ms = sr.tempo_total_ms,
    tempo_medio_ms = CASE WHEN sr.respondidas > 0 THEN round(sr.tempo_total_ms::numeric / sr.respondidas::numeric)::integer ELSE NULL END
  FROM session_rollup sr WHERE s.id = v_session.id;
  DELETE FROM public.simulado_analytics_session_dims WHERE session_id = v_session.id;
  INSERT INTO public.simulado_analytics_session_dims (session_id, user_id, data_ref, modo, banca, topico, subtopico, total_questoes, acertos, erros, tempo_total_ms, updated_at)
  SELECT v_session.id, v_session.user_id, v_data_ref, v_mode,
    coalesce(meta.banca, m.banca, 'DESCONHECIDA'),
    coalesce(meta.topico, m.modulo_nome, 'Geral'),
    coalesce(meta.subtopico, m.titulo_aula, m.modulo_nome, 'Geral'),
    count(*) FILTER (WHERE r.acertou IS NOT NULL)::integer,
    count(*) FILTER (WHERE r.acertou = true)::integer,
    count(*) FILTER (WHERE r.acertou = false)::integer,
    coalesce(sum(r.tempo_ms) FILTER (WHERE r.acertou IS NOT NULL), 0)::bigint, now()
  FROM public.simulado_respostas r
  INNER JOIN public.modulos_estudo m ON m.id = r.modulo_id
  LEFT JOIN LATERAL (
    SELECT nullif(btrim(m.conteudo_json #>> '{meta,banca}'), '') AS banca,
      nullif(btrim(m.conteudo_json #>> '{meta,topico}'), '') AS topico,
      nullif(btrim(m.conteudo_json #>> '{meta,subtopico}'), '') AS subtopico
  ) meta ON true
  WHERE r.session_id = v_session.id AND r.user_id = v_session.user_id AND r.acertou IS NOT NULL
  GROUP BY 1,2,3,4,5,6,7
  ON CONFLICT (session_id, modo, banca, topico, subtopico) DO UPDATE SET
    total_questoes = EXCLUDED.total_questoes, acertos = EXCLUDED.acertos, erros = EXCLUDED.erros,
    tempo_total_ms = EXCLUDED.tempo_total_ms, updated_at = now();
  DELETE FROM public.simulado_analytics_daily WHERE user_id = v_session.user_id AND data_ref = v_data_ref AND modo = v_mode;
  INSERT INTO public.simulado_analytics_daily (user_id, data_ref, modo, banca, topico, subtopico, total_questoes, acertos, erros, tempo_total_ms, updated_at)
  SELECT d.user_id, d.data_ref, d.modo, d.banca, d.topico, d.subtopico,
    sum(d.total_questoes)::integer, sum(d.acertos)::integer, sum(d.erros)::integer, sum(d.tempo_total_ms)::bigint, now()
  FROM public.simulado_analytics_session_dims d
  WHERE d.user_id = v_session.user_id AND d.data_ref = v_data_ref AND d.modo = v_mode
  GROUP BY 1,2,3,4,5,6;
END;
$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.refresh_subtopico_guideline_counts()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE subtopico_guideline_registry r
  SET
    question_count = COALESCE(c.cnt, 0),
    updated_at = now()
  FROM (
    SELECT
      COALESCE(conteudo_json->'meta'->>'subtopico', subtopico, assunto) AS subtopico,
      COUNT(*)::int AS cnt
    FROM modulos_estudo
    GROUP BY 1
  ) c
  WHERE r.subtopico = c.subtopico;
END;
$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.set_limit(real)
 RETURNS real
 LANGUAGE c
 STRICT
AS '$libdir/pg_trgm', $function$set_limit$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.show_limit()
 RETURNS real
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$show_limit$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.show_trgm(text)
 RETURNS text[]
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$show_trgm$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.similarity(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$similarity$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.similarity_dist(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$similarity_dist$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.similarity_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$similarity_op$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.simulado_run_retention(p_retention_months integer DEFAULT 12, p_reference timestamp with time zone DEFAULT now())
 RETURNS TABLE(consolidated_sessions integer, deleted_respostas integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_cutoff timestamptz;
  v_consolidated integer := 0;
  v_deleted integer := 0;
  v_session_id uuid;
  v_batch_deleted integer;
BEGIN
  IF p_retention_months IS NULL OR p_retention_months < 1 THEN
    RAISE EXCEPTION 'p_retention_months must be >= 1';
  END IF;

  v_cutoff := p_reference - make_interval(months => p_retention_months);

  FOR v_session_id IN
    SELECT s.id
    FROM public.simulado_sessions s
    WHERE s.status = 'concluido'
      AND s.concluida_em IS NOT NULL
      AND s.concluida_em < v_cutoff
      AND EXISTS (
        SELECT 1
        FROM public.simulado_respostas r
        WHERE r.session_id = s.id
      )
    ORDER BY s.concluida_em ASC
  LOOP
    PERFORM public.refresh_simulado_session_analytics(v_session_id);
    v_consolidated := v_consolidated + 1;

    DELETE FROM public.simulado_respostas
    WHERE session_id = v_session_id;

    GET DIAGNOSTICS v_batch_deleted = ROW_COUNT;
    v_deleted := v_deleted + v_batch_deleted;
  END LOOP;

  RETURN QUERY SELECT v_consolidated, v_deleted;
END;
$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.strict_word_similarity(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.strict_word_similarity_commutator_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity_commutator_op$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.strict_word_similarity_dist_commutator_op(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity_dist_commutator_op$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.strict_word_similarity_dist_op(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity_dist_op$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.strict_word_similarity_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity_op$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.trigger_invalidate_cache_exam_contents_delete()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
  PERFORM invalidate_cache_via_webhook('exam_contents', 'DELETE');
  RETURN OLD;
END;
$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.trigger_invalidate_cache_exam_contents_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
  PERFORM invalidate_cache_via_webhook('exam_contents', 'INSERT');
  RETURN NEW;
END;
$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.trigger_invalidate_cache_exam_contents_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
  PERFORM invalidate_cache_via_webhook('exam_contents', 'UPDATE');
  RETURN NEW;
END;
$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.trigger_invalidate_cache_flowcharts_delete()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
  PERFORM invalidate_cache_via_webhook('flowcharts', 'DELETE');
  RETURN OLD;
END;
$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.trigger_invalidate_cache_flowcharts_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
  PERFORM invalidate_cache_via_webhook('flowcharts', 'INSERT');
  RETURN NEW;
END;
$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.trigger_invalidate_cache_flowcharts_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
  PERFORM invalidate_cache_via_webhook('flowcharts', 'UPDATE');
  RETURN NEW;
END;
$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.trigger_invalidate_cache_historico_delete()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
  PERFORM public.invalidate_cache_via_webhook('historico_questoes', 'DELETE');
  RETURN NULL;
END;
$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.trigger_invalidate_cache_historico_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
  PERFORM public.invalidate_cache_via_webhook('historico_questoes', 'INSERT');
  RETURN NEW;
END;
$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.trigger_invalidate_cache_historico_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
  PERFORM public.invalidate_cache_via_webhook('historico_questoes', 'UPDATE');
  RETURN NEW;
END;
$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.trigger_invalidate_cache_modulos_delete()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
  PERFORM invalidate_cache_via_webhook('modulos_estudo', 'DELETE');
  RETURN OLD;
END;
$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.trigger_invalidate_cache_modulos_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
  PERFORM invalidate_cache_via_webhook('modulos_estudo', 'INSERT');
  RETURN NEW;
END;
$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.trigger_invalidate_cache_modulos_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
  PERFORM invalidate_cache_via_webhook('modulos_estudo', 'UPDATE');
  RETURN NEW;
END;
$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.update_notebook_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
  UPDATE study_notebooks SET updated_at = now() WHERE id = NEW.notebook_id;
  RETURN NEW;
END;
$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.word_similarity(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.word_similarity_commutator_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity_commutator_op$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.word_similarity_dist_commutator_op(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity_dist_commutator_op$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.word_similarity_dist_op(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity_dist_op$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.word_similarity_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity_op$function$
;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER cache_invalidate_historico_delete AFTER DELETE ON historico_questoes FOR EACH STATEMENT EXECUTE FUNCTION trigger_invalidate_cache_historico_delete();
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER cache_invalidate_historico_insert AFTER INSERT ON historico_questoes FOR EACH ROW EXECUTE FUNCTION trigger_invalidate_cache_historico_insert();
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER cache_invalidate_historico_update AFTER UPDATE ON historico_questoes FOR EACH ROW EXECUTE FUNCTION trigger_invalidate_cache_historico_update();
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER cache_invalidate_modulos_delete AFTER DELETE ON modulos_estudo FOR EACH ROW EXECUTE FUNCTION trigger_invalidate_cache_modulos_delete();
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER cache_invalidate_modulos_insert AFTER INSERT ON modulos_estudo FOR EACH ROW EXECUTE FUNCTION trigger_invalidate_cache_modulos_insert();
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER cache_invalidate_modulos_update AFTER UPDATE ON modulos_estudo FOR EACH ROW EXECUTE FUNCTION trigger_invalidate_cache_modulos_update();
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_simulado_session_finalize_refresh_analytics AFTER UPDATE OF status, concluida_em ON simulado_sessions FOR EACH ROW EXECUTE FUNCTION on_simulado_session_finalize_refresh_analytics();
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_notebook_items_updated AFTER INSERT OR DELETE ON study_notebook_items FOR EACH ROW EXECUTE FUNCTION update_notebook_updated_at();
EXCEPTION WHEN others THEN NULL;
END $$;

ALTER TABLE public."acessos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."concurso_matriculas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."concurso_modulos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."concurso_purchases" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."concursos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."historico_questoes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."modulos_estudo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."study_notebook_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."study_notebooks" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS acessos_pkey ON public.acessos USING btree (id);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS acessos_stripe_session_unique ON public.acessos USING btree (stripe_checkout_session_id);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS acessos_user_produto_unique ON public.acessos USING btree (user_id, produto);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS concurso_matriculas_pkey ON public.concurso_matriculas USING btree (id);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS concurso_matriculas_user_id_concurso_id_key ON public.concurso_matriculas USING btree (user_id, concurso_id);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_concurso_matriculas_active ON public.concurso_matriculas USING btree (user_id, concurso_id) WHERE (status = 'ativo'::concurso_matricula_status);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_concurso_matriculas_concurso ON public.concurso_matriculas USING btree (concurso_id);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_concurso_matriculas_user ON public.concurso_matriculas USING btree (user_id);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS concurso_modulos_concurso_id_modulo_id_key ON public.concurso_modulos USING btree (concurso_id, modulo_id);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS concurso_modulos_pkey ON public.concurso_modulos USING btree (id);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_concurso_modulos_concurso ON public.concurso_modulos USING btree (concurso_id);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_concurso_modulos_modulo ON public.concurso_modulos USING btree (modulo_id);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS concurso_purchases_gateway_payment_unique ON public.concurso_purchases USING btree (gateway, gateway_payment_id);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS concurso_purchases_pkey ON public.concurso_purchases USING btree (id);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_concurso_purchases_concurso_status ON public.concurso_purchases USING btree (concurso_id, status);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_concurso_purchases_user ON public.concurso_purchases USING btree (user_id);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS concursos_pkey ON public.concursos USING btree (id);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS concursos_slug_key ON public.concursos USING btree (slug);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_concursos_slug ON public.concursos USING btree (slug);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_concursos_status ON public.concursos USING btree (status);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_concursos_tipo ON public.concursos USING btree (tipo);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS historico_questoes_pkey ON public.historico_questoes USING btree (id);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_historico_estudo_concluido ON public.historico_questoes USING btree (user_id, modulo_slug, estudo_reverso_concluido) WHERE (estudo_reverso_concluido = true);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_historico_questoes_acertou ON public.historico_questoes USING btree (acertou) WHERE (acertou = true);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_historico_questoes_created_at ON public.historico_questoes USING btree (created_at DESC);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_historico_questoes_modulo_acertou ON public.historico_questoes USING btree (modulo_slug, acertou);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_historico_questoes_modulo_slug ON public.historico_questoes USING btree (modulo_slug);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_historico_questoes_user_date ON public.historico_questoes USING btree (user_id, created_at DESC);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_historico_questoes_user_id ON public.historico_questoes USING btree (user_id);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_historico_questoes_user_modulo ON public.historico_questoes USING btree (user_id, modulo_slug);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_historico_questoes_user_respondida ON public.historico_questoes USING btree (user_id) WHERE (respondida = true);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_modulos_estudo_banca_modulo_nome ON public.modulos_estudo USING btree (banca, modulo_nome);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_modulos_estudo_banca_modulo_nome_created_at ON public.modulos_estudo USING btree (banca, modulo_nome, created_at);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_modulos_estudo_banca_titulo_aula ON public.modulos_estudo USING btree (banca, titulo_aula);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_modulos_estudo_banca_trgm ON public.modulos_estudo USING gin (lower(COALESCE(banca, ''::text)) gin_trgm_ops);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_modulos_estudo_modulo_nome_trgm ON public.modulos_estudo USING gin (lower(COALESCE(modulo_nome, ''::text)) gin_trgm_ops);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_modulos_estudo_modulo_slug_trgm ON public.modulos_estudo USING gin (lower(COALESCE(modulo_slug, ''::text)) gin_trgm_ops);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_modulos_estudo_titulo_aula_created_at ON public.modulos_estudo USING btree (titulo_aula, created_at DESC);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_modulos_estudo_titulo_aula_trgm ON public.modulos_estudo USING gin (lower(COALESCE(titulo_aula, ''::text)) gin_trgm_ops);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS modulos_estudo_modulo_slug_key ON public.modulos_estudo USING btree (modulo_slug);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS modulos_estudo_pkey ON public.modulos_estudo USING btree (id);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS uniq_modulos_estudo_avant_codigo ON public.modulos_estudo USING btree (avant_codigo);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS uniq_modulos_estudo_content_hash ON public.modulos_estudo USING btree (content_hash);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_items_notebook_pos ON public.study_notebook_items USING btree (notebook_id, "position");
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS idx_items_notebook_slug ON public.study_notebook_items USING btree (notebook_id, modulo_slug);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS study_notebook_items_pkey ON public.study_notebook_items USING btree (id);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_notebooks_user ON public.study_notebooks USING btree (user_id);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS idx_notebooks_user_source_pack ON public.study_notebooks USING btree (user_id, source_pack_id) WHERE (source_pack_id IS NOT NULL);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS study_notebooks_pkey ON public.study_notebooks USING btree (id);
EXCEPTION WHEN others THEN NULL;
END $$;


GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

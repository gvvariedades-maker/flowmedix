-- Migration: Criar Webhooks de Invalidação de Cache via SQL
-- Execute este script no SQL Editor do Supabase
-- Data: 2026-01-27
-- Objetivo: Configurar webhooks automáticos para invalidar cache quando dados são modificados

-- ============================================================================
-- PRÉ-REQUISITOS
-- ============================================================================

-- 1. Habilitar extensão pg_net (para fazer requisições HTTP)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Criar função para invalidar cache via HTTP
CREATE OR REPLACE FUNCTION invalidate_cache_via_webhook(
  table_name TEXT,
  event_type TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  webhook_url TEXT;
  webhook_secret TEXT;
BEGIN
  -- Obter URL e secret das variáveis de ambiente ou configuração
  -- Em produção, configure via Supabase Dashboard → Settings → Edge Functions → Secrets
  webhook_url := current_setting('app.webhook_url', true) 
    || '/api/cache/revalidate';
  webhook_secret := current_setting('app.webhook_secret', true);

  -- Se não configurado, usar valores padrão (desenvolvimento)
  IF webhook_url IS NULL OR webhook_url = '/api/cache/revalidate' THEN
    webhook_url := 'http://localhost:3000/api/cache/revalidate';
  END IF;

  IF webhook_secret IS NULL THEN
    webhook_secret := 'dev-secret';
  END IF;

  -- Fazer requisição HTTP para invalidar cache
  PERFORM
    net.http_post(
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

  -- Log (opcional - remover em produção se não quiser logs)
  RAISE LOG 'Cache invalidation triggered: table=%, event=%', table_name, event_type;
END;
$$;

-- ============================================================================
-- FUNÇÕES DE TRIGGER (criar todas, mesmo que tabelas não existam)
-- ============================================================================

-- Funções para modulos_estudo
CREATE OR REPLACE FUNCTION trigger_invalidate_cache_modulos_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM invalidate_cache_via_webhook('modulos_estudo', 'INSERT');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION trigger_invalidate_cache_modulos_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM invalidate_cache_via_webhook('modulos_estudo', 'UPDATE');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION trigger_invalidate_cache_modulos_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM invalidate_cache_via_webhook('modulos_estudo', 'DELETE');
  RETURN OLD;
END;
$$;

-- Funções para historico_questoes
CREATE OR REPLACE FUNCTION trigger_invalidate_cache_historico_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM invalidate_cache_via_webhook('historico_questoes', 'INSERT');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION trigger_invalidate_cache_historico_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM invalidate_cache_via_webhook('historico_questoes', 'UPDATE');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION trigger_invalidate_cache_historico_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM invalidate_cache_via_webhook('historico_questoes', 'DELETE');
  RETURN OLD;
END;
$$;

-- Funções para flowcharts
CREATE OR REPLACE FUNCTION trigger_invalidate_cache_flowcharts_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM invalidate_cache_via_webhook('flowcharts', 'INSERT');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION trigger_invalidate_cache_flowcharts_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM invalidate_cache_via_webhook('flowcharts', 'UPDATE');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION trigger_invalidate_cache_flowcharts_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM invalidate_cache_via_webhook('flowcharts', 'DELETE');
  RETURN OLD;
END;
$$;

-- Funções para exam_contents
CREATE OR REPLACE FUNCTION trigger_invalidate_cache_exam_contents_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM invalidate_cache_via_webhook('exam_contents', 'INSERT');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION trigger_invalidate_cache_exam_contents_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM invalidate_cache_via_webhook('exam_contents', 'UPDATE');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION trigger_invalidate_cache_exam_contents_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM invalidate_cache_via_webhook('exam_contents', 'DELETE');
  RETURN OLD;
END;
$$;

-- ============================================================================
-- TRIGGERS (criar apenas se tabelas existirem)
-- ============================================================================

-- Triggers para modulos_estudo
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'modulos_estudo'
  ) THEN
    DROP TRIGGER IF EXISTS cache_invalidate_modulos_insert ON modulos_estudo;
    CREATE TRIGGER cache_invalidate_modulos_insert
      AFTER INSERT ON modulos_estudo
      FOR EACH ROW
      EXECUTE FUNCTION trigger_invalidate_cache_modulos_insert();

    DROP TRIGGER IF EXISTS cache_invalidate_modulos_update ON modulos_estudo;
    CREATE TRIGGER cache_invalidate_modulos_update
      AFTER UPDATE ON modulos_estudo
      FOR EACH ROW
      EXECUTE FUNCTION trigger_invalidate_cache_modulos_update();

    DROP TRIGGER IF EXISTS cache_invalidate_modulos_delete ON modulos_estudo;
    CREATE TRIGGER cache_invalidate_modulos_delete
      AFTER DELETE ON modulos_estudo
      FOR EACH ROW
      EXECUTE FUNCTION trigger_invalidate_cache_modulos_delete();

    RAISE NOTICE 'Triggers criados para tabela modulos_estudo';
  ELSE
    RAISE NOTICE 'Tabela modulos_estudo não existe. Pulando criação de triggers.';
  END IF;
END $$;

-- Triggers para historico_questoes
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'historico_questoes'
  ) THEN
    DROP TRIGGER IF EXISTS cache_invalidate_historico_insert ON historico_questoes;
    CREATE TRIGGER cache_invalidate_historico_insert
      AFTER INSERT ON historico_questoes
      FOR EACH ROW
      EXECUTE FUNCTION trigger_invalidate_cache_historico_insert();

    DROP TRIGGER IF EXISTS cache_invalidate_historico_update ON historico_questoes;
    CREATE TRIGGER cache_invalidate_historico_update
      AFTER UPDATE ON historico_questoes
      FOR EACH ROW
      EXECUTE FUNCTION trigger_invalidate_cache_historico_update();

    DROP TRIGGER IF EXISTS cache_invalidate_historico_delete ON historico_questoes;
    CREATE TRIGGER cache_invalidate_historico_delete
      AFTER DELETE ON historico_questoes
      FOR EACH ROW
      EXECUTE FUNCTION trigger_invalidate_cache_historico_delete();

    RAISE NOTICE 'Triggers criados para tabela historico_questoes';
  ELSE
    RAISE NOTICE 'Tabela historico_questoes não existe. Pulando criação de triggers.';
  END IF;
END $$;

-- Triggers para flowcharts
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'flowcharts'
  ) THEN
    DROP TRIGGER IF EXISTS cache_invalidate_flowcharts_insert ON flowcharts;
    CREATE TRIGGER cache_invalidate_flowcharts_insert
      AFTER INSERT ON flowcharts
      FOR EACH ROW
      EXECUTE FUNCTION trigger_invalidate_cache_flowcharts_insert();

    DROP TRIGGER IF EXISTS cache_invalidate_flowcharts_update ON flowcharts;
    CREATE TRIGGER cache_invalidate_flowcharts_update
      AFTER UPDATE ON flowcharts
      FOR EACH ROW
      EXECUTE FUNCTION trigger_invalidate_cache_flowcharts_update();

    DROP TRIGGER IF EXISTS cache_invalidate_flowcharts_delete ON flowcharts;
    CREATE TRIGGER cache_invalidate_flowcharts_delete
      AFTER DELETE ON flowcharts
      FOR EACH ROW
      EXECUTE FUNCTION trigger_invalidate_cache_flowcharts_delete();

    RAISE NOTICE 'Triggers criados para tabela flowcharts';
  ELSE
    RAISE NOTICE 'Tabela flowcharts não existe. Pulando criação de triggers.';
  END IF;
END $$;

-- Triggers para exam_contents
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'exam_contents'
  ) THEN
    DROP TRIGGER IF EXISTS cache_invalidate_exam_contents_insert ON exam_contents;
    CREATE TRIGGER cache_invalidate_exam_contents_insert
      AFTER INSERT ON exam_contents
      FOR EACH ROW
      EXECUTE FUNCTION trigger_invalidate_cache_exam_contents_insert();

    DROP TRIGGER IF EXISTS cache_invalidate_exam_contents_update ON exam_contents;
    CREATE TRIGGER cache_invalidate_exam_contents_update
      AFTER UPDATE ON exam_contents
      FOR EACH ROW
      EXECUTE FUNCTION trigger_invalidate_cache_exam_contents_update();

    DROP TRIGGER IF EXISTS cache_invalidate_exam_contents_delete ON exam_contents;
    CREATE TRIGGER cache_invalidate_exam_contents_delete
      AFTER DELETE ON exam_contents
      FOR EACH ROW
      EXECUTE FUNCTION trigger_invalidate_cache_exam_contents_delete();

    RAISE NOTICE 'Triggers criados para tabela exam_contents';
  ELSE
    RAISE NOTICE 'Tabela exam_contents não existe. Pulando criação de triggers.';
  END IF;
END $$;

-- ============================================================================
-- CONFIGURAÇÃO DE VARIÁVEIS (OPCIONAL)
-- ============================================================================

-- Configurar URL do webhook (ajustar conforme seu domínio)
-- Execute estas queries separadamente após criar as funções

-- Para desenvolvimento local:
-- ALTER DATABASE postgres SET app.webhook_url = 'http://localhost:3000';

-- Para produção (substitua pela sua URL):
-- ALTER DATABASE postgres SET app.webhook_url = 'https://seu-dominio.com';

-- Configurar secret do webhook:
-- ALTER DATABASE postgres SET app.webhook_secret = 'seu-secret-aqui';

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

-- Verificar quais triggers foram criados:
-- SELECT 
--   trigger_name, 
--   event_object_table, 
--   event_manipulation,
--   action_timing
-- FROM information_schema.triggers 
-- WHERE trigger_name LIKE 'cache_invalidate%'
-- ORDER BY event_object_table, event_manipulation;

-- Verificar quais tabelas existem:
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('modulos_estudo', 'historico_questoes', 'flowcharts', 'exam_contents')
-- ORDER BY table_name;

-- Testar invalidação manualmente:
-- SELECT invalidate_cache_via_webhook('modulos_estudo', 'INSERT');

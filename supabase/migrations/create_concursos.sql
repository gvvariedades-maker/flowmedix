-- Concursos, vínculos de módulos e matrículas (fase 1 — catálogo por pacote).

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'concurso_tipo') THEN
    CREATE TYPE public.concurso_tipo AS ENUM ('geral', 'edital');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'concurso_status') THEN
    CREATE TYPE public.concurso_status AS ENUM ('rascunho', 'ativo', 'arquivado');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'concurso_modulo_origem') THEN
    CREATE TYPE public.concurso_modulo_origem AS ENUM ('publicacao', 'manual', 'regra');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'concurso_matricula_origem') THEN
    CREATE TYPE public.concurso_matricula_origem AS ENUM ('cadastro', 'admin', 'upgrade');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.concursos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  nome text NOT NULL,
  cidade text,
  orgao text,
  banca text,
  ano integer,
  cargo text,
  tipo public.concurso_tipo NOT NULL DEFAULT 'edital',
  status public.concurso_status NOT NULL DEFAULT 'rascunho',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.concurso_modulos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  concurso_id uuid NOT NULL REFERENCES public.concursos(id) ON DELETE CASCADE,
  modulo_id uuid NOT NULL REFERENCES public.modulos_estudo(id) ON DELETE CASCADE,
  origem public.concurso_modulo_origem NOT NULL DEFAULT 'publicacao',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (concurso_id, modulo_id)
);

CREATE TABLE IF NOT EXISTS public.concurso_matriculas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  concurso_id uuid NOT NULL REFERENCES public.concursos(id) ON DELETE CASCADE,
  origem public.concurso_matricula_origem NOT NULL DEFAULT 'cadastro',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, concurso_id)
);

CREATE INDEX IF NOT EXISTS idx_concursos_slug ON public.concursos(slug);
CREATE INDEX IF NOT EXISTS idx_concursos_tipo ON public.concursos(tipo);
CREATE INDEX IF NOT EXISTS idx_concursos_status ON public.concursos(status);
CREATE INDEX IF NOT EXISTS idx_concurso_modulos_concurso ON public.concurso_modulos(concurso_id);
CREATE INDEX IF NOT EXISTS idx_concurso_modulos_modulo ON public.concurso_modulos(modulo_id);
CREATE INDEX IF NOT EXISTS idx_concurso_matriculas_user ON public.concurso_matriculas(user_id);
CREATE INDEX IF NOT EXISTS idx_concurso_matriculas_concurso ON public.concurso_matriculas(concurso_id);

INSERT INTO public.concursos (slug, nome, tipo, status)
VALUES ('geral', 'Geral', 'geral', 'ativo')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.concurso_modulos (concurso_id, modulo_id, origem)
SELECT c.id, m.id, 'regra'
FROM public.concursos c
CROSS JOIN public.modulos_estudo m
WHERE c.slug = 'geral'
ON CONFLICT (concurso_id, modulo_id) DO NOTHING;

INSERT INTO public.concurso_matriculas (user_id, concurso_id, origem)
SELECT u.id, c.id, 'cadastro'
FROM auth.users u
CROSS JOIN public.concursos c
WHERE c.slug = 'geral'
ON CONFLICT (user_id, concurso_id) DO NOTHING;

ALTER TABLE public.concursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concurso_modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concurso_matriculas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read enrolled concursos" ON public.concursos;
CREATE POLICY "Users read enrolled concursos"
  ON public.concursos FOR SELECT
  USING (
    status = 'ativo'
    AND EXISTS (
      SELECT 1
      FROM public.concurso_matriculas mat
      WHERE mat.concurso_id = concursos.id
        AND mat.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users read enrolled concurso modulos" ON public.concurso_modulos;
CREATE POLICY "Users read enrolled concurso modulos"
  ON public.concurso_modulos FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.concurso_matriculas mat
      WHERE mat.concurso_id = concurso_modulos.concurso_id
        AND mat.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users read own matriculas" ON public.concurso_matriculas;
CREATE POLICY "Users read own matriculas"
  ON public.concurso_matriculas FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view modulos_estudo" ON public.modulos_estudo;

CREATE POLICY "Matriculated users view modulos_estudo"
  ON public.modulos_estudo FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.concurso_modulos cm
      INNER JOIN public.concurso_matriculas mat ON mat.concurso_id = cm.concurso_id
      WHERE cm.modulo_id = modulos_estudo.id
        AND mat.user_id = auth.uid()
    )
  );

COMMENT ON TABLE public.concursos IS 'Pacotes comerciais (Geral ou edital) para catálogo e matrícula.';
COMMENT ON TABLE public.concurso_modulos IS 'Vínculo entre concurso e linha em modulos_estudo.';
COMMENT ON TABLE public.concurso_matriculas IS 'Entitlements do usuário por concurso.';

-- Links de convite com Pro temporário (enum invite + tabelas + RLS).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'concurso_matricula_origem'
      AND e.enumlabel = 'invite'
  ) THEN
    ALTER TYPE public.concurso_matricula_origem ADD VALUE 'invite';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.invite_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  label text,
  pro_days integer NOT NULL,
  link_expires_at timestamptz NOT NULL,
  max_uses integer NOT NULL DEFAULT 1,
  use_count integer NOT NULL DEFAULT 0,
  revoked_at timestamptz,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT invite_links_pro_days_range CHECK (pro_days > 0 AND pro_days <= 365),
  CONSTRAINT invite_links_max_uses_positive CHECK (max_uses >= 1),
  CONSTRAINT invite_links_use_count_non_negative CHECK (use_count >= 0)
);

COMMENT ON TABLE public.invite_links IS 'Tokens de convite com dias de Pro e validade do link (admin).';
COMMENT ON COLUMN public.invite_links.token IS 'Token opaco na URL /convite/{token}; sem SELECT anon.';
COMMENT ON COLUMN public.invite_links.pro_days IS 'Dias de Pro ilimitado a partir do resgate.';
COMMENT ON COLUMN public.invite_links.link_expires_at IS 'Até quando o token pode ser resgatado.';
COMMENT ON COLUMN public.invite_links.use_count IS 'Resgates concluídos; incrementado no resgate.';

CREATE TABLE IF NOT EXISTS public.invite_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_link_id uuid NOT NULL REFERENCES public.invite_links(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  pro_expires_at timestamptz NOT NULL,
  CONSTRAINT invite_redemptions_link_user_unique UNIQUE (invite_link_id, user_id)
);

COMMENT ON TABLE public.invite_redemptions IS 'Auditoria: um resgate por link por usuário.';

CREATE INDEX IF NOT EXISTS idx_invite_links_token ON public.invite_links (token);

CREATE INDEX IF NOT EXISTS idx_invite_links_redeemable
  ON public.invite_links (link_expires_at)
  WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_invite_redemptions_user
  ON public.invite_redemptions (user_id);

CREATE INDEX IF NOT EXISTS idx_invite_redemptions_link
  ON public.invite_redemptions (invite_link_id);

ALTER TABLE public.invite_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_redemptions ENABLE ROW LEVEL SECURITY;

-- Sem policies: leitura/escrita apenas via service role nas APIs admin e convite.

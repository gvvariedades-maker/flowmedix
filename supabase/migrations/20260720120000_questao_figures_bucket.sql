-- Bucket público para figuras raster de enunciados (questões premium).
-- Write: service role apenas. Read: público.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'questao-figures',
  'questao-figures',
  true,
  524288,
  ARRAY['image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Leitura pública
DROP POLICY IF EXISTS "questao_figures_public_read" ON storage.objects;
CREATE POLICY "questao_figures_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'questao-figures');

-- Escrita apenas service role (sem policy para anon/authenticated = bloqueado por RLS padrão)
DROP POLICY IF EXISTS "questao_figures_service_write" ON storage.objects;
CREATE POLICY "questao_figures_service_write"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'questao-figures' AND auth.role() = 'service_role');

DROP POLICY IF EXISTS "questao_figures_service_update" ON storage.objects;
CREATE POLICY "questao_figures_service_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'questao-figures' AND auth.role() = 'service_role');

DROP POLICY IF EXISTS "questao_figures_service_delete" ON storage.objects;
CREATE POLICY "questao_figures_service_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'questao-figures' AND auth.role() = 'service_role');

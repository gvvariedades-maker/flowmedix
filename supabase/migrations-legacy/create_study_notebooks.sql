-- Cadernos de estudo do aluno
CREATE TABLE IF NOT EXISTS study_notebooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Itens de cada caderno (questões adicionadas)
CREATE TABLE IF NOT EXISTS study_notebook_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notebook_id uuid NOT NULL REFERENCES study_notebooks(id) ON DELETE CASCADE,
  modulo_slug text NOT NULL,
  titulo_aula text,
  topico text,
  position integer NOT NULL DEFAULT 0,
  added_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_notebooks_user ON study_notebooks(user_id);
CREATE INDEX IF NOT EXISTS idx_items_notebook_pos ON study_notebook_items(notebook_id, position);
CREATE UNIQUE INDEX IF NOT EXISTS idx_items_notebook_slug ON study_notebook_items(notebook_id, modulo_slug);

-- Trigger: atualiza updated_at do caderno automaticamente
CREATE OR REPLACE FUNCTION update_notebook_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO pg_catalog, public
AS $$
BEGIN
  UPDATE study_notebooks SET updated_at = now() WHERE id = NEW.notebook_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_notebook_items_updated
  AFTER INSERT OR DELETE ON study_notebook_items
  FOR EACH ROW EXECUTE FUNCTION update_notebook_updated_at();

-- RLS
ALTER TABLE study_notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_notebook_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notebooks"
  ON study_notebooks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage items of own notebooks"
  ON study_notebook_items FOR ALL
  USING (
    notebook_id IN (
      SELECT id FROM study_notebooks WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    notebook_id IN (
      SELECT id FROM study_notebooks WHERE user_id = auth.uid()
    )
  );

COMMENT ON TABLE study_notebooks IS 'Cadernos de estudo personalizados criados pelo aluno';
COMMENT ON TABLE study_notebook_items IS 'Questões (módulos) adicionadas a um caderno de estudo';

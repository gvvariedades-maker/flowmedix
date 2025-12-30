-- FlowMedix Database Schema
-- Execute este arquivo no SQL Editor do Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extended user data)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium', 'trial')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Modules table (study categories)
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  content JSONB DEFAULT '{}'::jsonb,
  interactive_data JSONB DEFAULT '{}'::jsonb,
  is_premium BOOLEAN DEFAULT false,
  icon_slug TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Flowcharts table (the interactive diagrams)
CREATE TABLE IF NOT EXISTS flowcharts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL, -- Stores React Flow structure: { nodes: Node[], edges: Edge[], viewport: Viewport }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- User progress table (tracking)
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  flowchart_id UUID REFERENCES flowcharts(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'started' CHECK (status IN ('started', 'completed')),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, flowchart_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_modules_id ON modules(id);
CREATE INDEX IF NOT EXISTS idx_flowcharts_module_id ON flowcharts(module_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_flowchart_id ON user_progress(flowchart_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flowcharts_updated_at BEFORE UPDATE ON flowcharts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE flowcharts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Modules policies (public read, admin write)
CREATE POLICY "Anyone can view modules"
  ON modules FOR SELECT
  USING (true);

-- Flowcharts policies
CREATE POLICY "Anyone can view flowcharts"
  ON flowcharts FOR SELECT
  USING (true);

-- User progress policies
CREATE POLICY "Users can view their own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Insert sample modules
INSERT INTO modules (title, description, is_premium, icon_slug) VALUES
  ('Urgência e Emergência', 'Protocolos e procedimentos de urgência e emergência', false, 'alert-circle'),
  ('Ética Profissional', 'Código de ética e conduta profissional', false, 'shield'),
  ('Farmacologia', 'Medicamentos e suas aplicações', true, 'pill'),
  ('Anatomia e Fisiologia', 'Conceitos fundamentais de anatomia e fisiologia', false, 'heart')
ON CONFLICT DO NOTHING;

-- Study plans: roteiro personalizado do aluno
-- Usa gen_random_uuid() para compatibilidade com pgcrypto
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS study_plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  raw_content text,
  created_at timestamp with time zone DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Itens do plano: quais módulos/tópicos pertencem ao plano do aluno
CREATE TABLE IF NOT EXISTS study_plan_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  study_plan_id uuid REFERENCES study_plans(id) ON DELETE CASCADE,
  module_id uuid REFERENCES modules(id),
  topic_name text,
  is_completed boolean DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_study_plans_user_id ON study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_study_plan_items_study_plan_id ON study_plan_items(study_plan_id);

-- Exames e verticalizações
CREATE TABLE IF NOT EXISTS exams (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  organ text,
  board text,
  raw_content text,
  created_at timestamp with time zone DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS exam_modules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id uuid REFERENCES exams(id) ON DELETE CASCADE,
  module_id uuid REFERENCES modules(id),
  topic_order integer NOT NULL,
  topic_name text,
  created_at timestamp with time zone DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS exam_purchases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id uuid REFERENCES exams(id),
  purchased_at timestamp with time zone DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, exam_id)
);

CREATE INDEX IF NOT EXISTS idx_exam_modules_exam_id ON exam_modules(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_modules_module_id ON exam_modules(module_id);
CREATE INDEX IF NOT EXISTS idx_exam_purchases_user_id ON exam_purchases(user_id);

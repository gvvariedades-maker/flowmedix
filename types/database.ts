import { FlowchartContent } from './flow';
import { DecisionFlowData } from './simulator';

/**
 * Tipos do banco de dados Supabase
 */

export type SubscriptionStatus = 'free' | 'premium' | 'trial';
export type ProgressStatus = 'started' | 'completed';

export interface Profile {
  id: string;
  full_name: string | null;
  subscription_status: SubscriptionStatus;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  title: string;
  description: string | null;
  content: FlowchartContent | null;
  interactive_data: DecisionFlowData | null;
  is_premium: boolean;
  icon_slug: string | null;
  created_at: string;
  updated_at: string;
}

export interface Flowchart {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  content: any; // JSONB - será tipado como FlowchartContent
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  flowchart_id: string;
  status: ProgressStatus;
  last_accessed: string;
  created_at: string;
}

export interface Exam {
  id: string;
  name: string;
  organ: string | null;
  board: string | null;
  raw_content: string | null;
  created_at: string;
}export interface ExamModule {
  id: string;
  exam_id: string;
  module_id: string | null;
  topic_order: number;
  topic_name: string | null;
  created_at: string;
}export interface ExamTopic {
  id: string;
  exam_id: string;
  topic_name: string | null;
  created_at: string;
}export interface ExamContent {
  id: string;
  exam_topic_id: string;
  flowchart_id: string;
  created_at: string;
}export interface ExamPurchase {
  id: string;
  user_id: string;
  exam_id: string;
  purchased_at: string;
}

export type ConcursoTipo = 'geral' | 'edital';
export type ConcursoStatus = 'rascunho' | 'ativo' | 'arquivado';
export type ConcursoModuloOrigem = 'publicacao' | 'manual' | 'regra';
export type ConcursoMatriculaOrigem = 'cadastro' | 'admin' | 'upgrade';

export interface Concurso {
  id: string;
  slug: string;
  nome: string;
  cidade: string | null;
  orgao: string | null;
  banca: string | null;
  ano: number | null;
  cargo: string | null;
  tipo: ConcursoTipo;
  status: ConcursoStatus;
  created_at: string;
}

export interface ConcursoModulo {
  id: string;
  concurso_id: string;
  modulo_id: string;
  origem: ConcursoModuloOrigem;
  created_at: string;
}

export interface ConcursoMatricula {
  id: string;
  user_id: string;
  concurso_id: string;
  origem: ConcursoMatriculaOrigem;
  created_at: string;
}
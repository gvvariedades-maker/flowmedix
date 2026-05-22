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
}

export interface ExamModule {
  id: string;
  exam_id: string;
  module_id: string | null;
  topic_order: number;
  topic_name: string | null;
  created_at: string;
}

export interface ExamTopic {
  id: string;
  exam_id: string;
  topic_name: string | null;
  created_at: string;
}

export interface ExamContent {
  id: string;
  exam_topic_id: string;
  flowchart_id: string;
  created_at: string;
}

export interface ExamPurchase {
  id: string;
  user_id: string;
  exam_id: string;
  purchased_at: string;
}

export type ConcursoTipo = 'geral' | 'edital';
export type ConcursoStatus = 'rascunho' | 'ativo' | 'arquivado';
export type ConcursoModuloOrigem = 'publicacao' | 'manual' | 'regra';
export type ConcursoMatriculaOrigem = 'cadastro' | 'admin' | 'upgrade' | 'purchase' | 'stripe_pro';
export type ConcursoMatriculaStatus = 'ativo' | 'expirado';
export type ConcursoPurchaseStatus = 'pending' | 'paid' | 'refunded';

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
  price_cents: number | null;
  data_prova: string | null;
  descricao: string | null;
  destaque: string | null;
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
  expires_at: string | null;
  status: ConcursoMatriculaStatus;
  created_at: string;
}

export interface ConcursoPurchase {
  id: string;
  user_id: string;
  concurso_id: string;
  status: ConcursoPurchaseStatus;
  gateway: string;
  gateway_payment_id: string | null;
  amount: number;
  currency: string;
  created_at: string;
  paid_at: string | null;
}

export type LpPageStatus = 'rascunho' | 'ativo' | 'arquivado';

export interface LpTemplate {
  id: string;
  slug: string;
  nome: string;
  default_config: Record<string, unknown>;
  created_at: string;
}

export interface LpPage {
  id: string;
  path: string;
  template_id: string;
  status: LpPageStatus;
  internal_name: string;
  config: Record<string, unknown>;
  seo: Record<string, unknown>;
  utm_campaign: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Acessos a produtos avulsos (ex.: pacote Campina Grande) após checkout Stripe. */
export interface Acesso {
  id: string;
  user_id: string;
  produto: string;
  criado_em: string;
  stripe_checkout_session_id: string | null;
}
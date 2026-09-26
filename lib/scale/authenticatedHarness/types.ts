import type { ConcurrencyTierId, EnvelopeOperation } from '@/lib/scale/workloadEnvelope';

export type SyntheticUserCredentials = {
  /** Identificador estável no pool (ex. harness-user-001). */
  pool_id: string;
  /** JWT access token para APIs Bearer. */
  access_token: string;
  /** Cookie header completo para rotas RSC (sessão SSR). */
  cookie_header?: string;
  /** Slug de questão padrão para /estudar/{slug} e GET questão. */
  default_questao_slug?: string;
  /** Sessão de simulado criada no setup (preenchido após POST sessions). */
  simulado_session_id?: string;
};

export type SyntheticUserPoolFile = {
  schema_version: 1;
  base_url: string;
  users: SyntheticUserCredentials[];
};

export type HarnessAuthMode = 'bearer' | 'cookie_session_rsc' | 'supabase_auth_refresh';

export type HarnessOperationStep = {
  operation_id: string;
  phase: 'setup' | 'measured';
  auth: HarnessAuthMode;
  method: string;
  path: string;
  request_weight: number;
  kind: 'read' | 'write';
};

export type HarnessExecutionPlan = {
  envelope_version: string;
  envelope_status: string;
  tier: ConcurrencyTierId;
  peak_concurrent_users: number;
  target_mean_rps: number;
  generator_requests_per_active_user_per_minute: number;
  pool_size: number;
  setup_steps: HarnessOperationStep[];
  measured_operations: HarnessOperationStep[];
  journey_mix: Record<string, number>;
  load_test_execution: 'forbidden' | 'not_requested';
};

export type HarnessValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

export function mapAuthToHarnessMode(op: EnvelopeOperation): HarnessAuthMode {
  if (op.id === 'auth_session_refresh') return 'supabase_auth_refresh';
  if (op.auth === 'cookie_session_rsc') return 'cookie_session_rsc';
  return 'bearer';
}

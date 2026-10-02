import type { ConcurrencyTierId, EnvelopeOperation } from '@/lib/scale/workloadEnvelope';
import type { HarnessSchedulerConfig } from '@/lib/scale/authenticatedHarness/scheduler';
import type { MaterializedHttpRequest } from '@/lib/scale/authenticatedHarness/materializeRequest';

export type SyntheticUserCredentials = {
  pool_id: string;
  access_token: string;
  cookie_header?: string;
  default_questao_slug?: string;
  default_opcao_id?: string;
  simulado_session_id?: string;
  simulado_modulo_slug?: string;
  supabase_refresh_token?: string;
};

export type SyntheticUserPoolFile = {
  schema_version: 1;
  target_environment: 'staging';
  /** Informativo; autoridade = data/scale-harness/staging-target.allowlist.json */
  allowed_hosts?: string[];
  base_url: string;
  supabase_url?: string;
  supabase_anon_key?: string;
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
  scheduler: HarnessSchedulerConfig;
  materialized_sample: MaterializedHttpRequest[];
  readiness: {
    HARNESS_VALIDATOR: string;
    HARNESS_PLANNER: string;
    HARNESS_HTTP_EXECUTOR: string;
    HARNESS_AUTHENTICATED: string;
  };
};

export function mapAuthToHarnessMode(op: EnvelopeOperation): HarnessAuthMode {
  if (op.id === 'auth_session_refresh') return 'supabase_auth_refresh';
  if (op.auth === 'cookie_session_rsc') return 'cookie_session_rsc';
  return 'bearer';
}

import type { HarnessOperationStep } from '@/lib/scale/authenticatedHarness/types';
import type { SyntheticUserCredentials, SyntheticUserPoolFile } from '@/lib/scale/authenticatedHarness/types';

const RSC_OPERATION_IDS = new Set(['rsc_estudar_slug', 'rsc_desempenho', 'rsc_cadernos']);
const SLUG_OPERATION_IDS = new Set([
  'rsc_estudar_slug',
  'api_estudar_questao',
  'api_registrar_tentativa',
  'api_simulado_questao',
  'api_simulado_responder',
]);

export class PoolValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PoolValidationError';
  }
}

export function validatePoolCardinality(
  pool: SyntheticUserPoolFile,
  peakConcurrentUsers: number,
): void {
  if (pool.users.length < peakConcurrentUsers) {
    throw new PoolValidationError(
      `pool.users.length (${pool.users.length}) < peak_concurrent_users (${peakConcurrentUsers}). Baseline exige 1 identidade sintética por VU.`,
    );
  }
}

export function validatePoolIdentityUniqueness(pool: SyntheticUserPoolFile): void {
  const poolIds = new Set<string>();
  const tokens = new Set<string>();
  for (const user of pool.users) {
    if (poolIds.has(user.pool_id)) {
      throw new PoolValidationError(`pool_id duplicado: ${user.pool_id}`);
    }
    poolIds.add(user.pool_id);
    if (tokens.has(user.access_token)) {
      throw new PoolValidationError(
        `access_token compartilhado entre usuários (baseline proíbe reutilização): ${user.pool_id}`,
      );
    }
    tokens.add(user.access_token);
  }
}

export function validateUserCredentialsForOperations(
  user: SyntheticUserCredentials,
  pool: SyntheticUserPoolFile,
  measuredOps: HarnessOperationStep[],
  options: { requireRefreshToken: boolean; simuladoSetupInHarness: boolean },
): void {
  const opIds = new Set(measuredOps.map((o) => o.operation_id));

  const needsRsc = measuredOps.some((o) => RSC_OPERATION_IDS.has(o.operation_id));
  if (needsRsc && !user.cookie_header?.trim()) {
    throw new PoolValidationError(`usuário ${user.pool_id}: cookie_header obrigatório para rotas RSC`);
  }

  const needsSlug = [...opIds].some((id) => SLUG_OPERATION_IDS.has(id));
  if (needsSlug && !user.default_questao_slug?.trim()) {
    throw new PoolValidationError(
      `usuário ${user.pool_id}: default_questao_slug obrigatório para operações de questão`,
    );
  }

  if (opIds.has('api_registrar_tentativa') && !user.default_opcao_id?.trim()) {
    throw new PoolValidationError(
      `usuário ${user.pool_id}: default_opcao_id obrigatório para POST /api/registrar-tentativa`,
    );
  }

  if (opIds.has('api_simulado_responder')) {
    if (!options.simuladoSetupInHarness && !user.simulado_session_id?.trim()) {
      throw new PoolValidationError(
        `usuário ${user.pool_id}: simulado_session_id obrigatório quando não há setup POST /api/simulado/sessions`,
      );
    }
    if (!user.default_opcao_id?.trim()) {
      throw new PoolValidationError(
        `usuário ${user.pool_id}: default_opcao_id obrigatório para POST /api/simulado/responder`,
      );
    }
    if (!user.simulado_modulo_slug?.trim() && !user.default_questao_slug?.trim()) {
      throw new PoolValidationError(
        `usuário ${user.pool_id}: simulado_modulo_slug ou default_questao_slug para responder`,
      );
    }
  }

  if (options.requireRefreshToken && opIds.has('auth_session_refresh')) {
    if (!user.supabase_refresh_token?.trim()) {
      throw new PoolValidationError(
        `usuário ${user.pool_id}: supabase_refresh_token obrigatório para auth_session_refresh`,
      );
    }
    if (!poolHasSupabaseAuthConfig(pool)) {
      throw new PoolValidationError(
        `pool: supabase_url e supabase_anon_key obrigatórios quando auth_session_refresh está no mix`,
      );
    }
  }
}

function poolHasSupabaseAuthConfig(pool: SyntheticUserPoolFile): boolean {
  return Boolean(pool.supabase_url?.trim() && pool.supabase_anon_key?.trim());
}

export function validateAllUsersForOperations(
  pool: SyntheticUserPoolFile,
  measuredOps: HarnessOperationStep[],
  setupOperationIds: string[],
): void {
  const requireRefresh = measuredOps.some((o) => o.operation_id === 'auth_session_refresh');
  const simuladoSetupInHarness = setupOperationIds.includes('api_simulado_sessions_create');
  for (const user of pool.users) {
    validateUserCredentialsForOperations(user, pool, measuredOps, {
      requireRefreshToken: requireRefresh,
      simuladoSetupInHarness,
    });
  }
}

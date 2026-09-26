/**
 * Execução de carga — gate duplo: flag de ambiente + CLI.
 * Implementação mínima para revisão do instrumento; baseline 50 CCU exige autorização separada.
 */
import type { HarnessExecutionPlan } from '@/lib/scale/authenticatedHarness/types';
import type { SyntheticUserPoolFile } from '@/lib/scale/authenticatedHarness/types';

export class HarnessExecutionForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HarnessExecutionForbiddenError';
  }
}

export function assertHarnessExecutionAllowed(options: { executeFlag: boolean }): void {
  if (!options.executeFlag) {
    throw new HarnessExecutionForbiddenError(
      'Execução de carga não solicitada. Use apenas --validate ou --plan. Para executar no futuro: --execute com SCALE_HARNESS_EXECUTE=1 e autorização de load test.',
    );
  }
  if (process.env.SCALE_HARNESS_EXECUTE !== '1') {
    throw new HarnessExecutionForbiddenError(
      'SCALE_HARNESS_EXECUTE=1 obrigatório no ambiente para qualquer execução HTTP do harness.',
    );
  }
  if (process.env.SCALE_HARNESS_LOAD_TEST_AUTHORIZED === '1') {
    return;
  }
  throw new HarnessExecutionForbiddenError(
    'LOAD_TEST_AUTHORIZATION não concedida (SCALE_HARNESS_LOAD_TEST_AUTHORIZED≠1). Envelope Owner não autorizou load test.',
  );
}

/** Placeholder: executor HTTP será expandido após revisão independente do harness. */
export async function runHarnessMeasuredWindow(
  _plan: HarnessExecutionPlan,
  _pool: SyntheticUserPoolFile,
): Promise<{ executed: false; reason: string }> {
  return {
    executed: false,
    reason: 'Executor HTTP autenticado pendente de revisão do instrumento (EWU fase harness).',
  };
}

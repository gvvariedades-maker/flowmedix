import type { LogicFlowRevealMode } from '../variants/logicFlowReveal';

/**
 * Default premium: `tap` com 3+ passos; legado curto permanece `auto`.
 * `reveal_mode` explícito no JSON sempre vence.
 */
export function resolveLogicFlowRevealMode(
  stepCount: number,
  explicit?: LogicFlowRevealMode,
): LogicFlowRevealMode {
  if (explicit === 'auto' || explicit === 'tap') return explicit;
  return stepCount >= 3 ? 'tap' : 'auto';
}

import { dangerZoneHasCompareItems } from './dangerZoneLayout';
import type { DangerZoneItemLike } from './dangerZoneLayout';
import type { LogicFlowRevealMode } from '../variants/logicFlowReveal';

/**
 * Default premium: `tap` no layout compare (itens com `correct`);
 * legado sem compare permanece `auto`. `reveal_mode` explícito no JSON vence.
 */
export function resolveDangerZoneRevealMode(
  layoutVariant: string,
  items: DangerZoneItemLike[] | undefined,
  explicit?: LogicFlowRevealMode,
): LogicFlowRevealMode {
  if (explicit === 'auto' || explicit === 'tap') return explicit;
  const isCompare =
    layoutVariant === 'compare' ||
    layoutVariant === 'trap-reveal' ||
    layoutVariant === 'calendar-mismatch' ||
    layoutVariant === 'norm-reveal' ||
    layoutVariant === 'scope-trap' ||
    layoutVariant === 'route-trap' ||
    layoutVariant === 'dose-trap' ||
    dangerZoneHasCompareItems(items);
  return isCompare ? 'tap' : 'auto';
}

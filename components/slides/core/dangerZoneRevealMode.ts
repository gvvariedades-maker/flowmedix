import { dangerZoneHasCompareItems } from './dangerZoneLayout';
import type { DangerZoneItemLike } from './dangerZoneLayout';
import type { LogicFlowRevealMode } from '../variants/logicFlowReveal';
import { dangerZoneVariantUsesTapReveal } from '../registry/dangerZoneCapabilities';

/**
 * Default premium: `tap` no layout compare (itens com `correct`);
 * legado sem compare permanece `auto`. `reveal_mode` explícito no JSON vence.
 * Variantes bespoke declaram `dangerTapReveal` no registry de capabilities.
 */
export function resolveDangerZoneRevealMode(
  layoutVariant: string,
  items: DangerZoneItemLike[] | undefined,
  explicit?: LogicFlowRevealMode,
): LogicFlowRevealMode {
  if (explicit === 'auto' || explicit === 'tap') return explicit;
  const isCompare =
    dangerZoneVariantUsesTapReveal(layoutVariant) || dangerZoneHasCompareItems(items);
  return isCompare ? 'tap' : 'auto';
}

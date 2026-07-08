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
    layoutVariant === 'temperature-mismatch' ||
    layoutVariant === 'norm-reveal' ||
    layoutVariant === 'scope-trap' ||
    layoutVariant === 'route-trap' ||
    layoutVariant === 'dose-trap' ||
    layoutVariant === 'farmaco-trap' ||
    layoutVariant === 'catheter-danger-arena' ||
    layoutVariant === 'lab-prep-trap' ||
    layoutVariant === 'lab-specimen-arena' ||
    layoutVariant === 'dressing-choice-arena' ||
    layoutVariant === 'vitals-classify-arena' ||
    layoutVariant === 'pni-trap-chips' ||
    layoutVariant === 'ist-trap-chips' ||
    layoutVariant === 'adolescent-consent-gate' ||
    layoutVariant === 'burn-trap-arena' ||
    layoutVariant === 'trabalho-pep-trap-arena' ||
    layoutVariant === 'respiratorio-spo2-trap-arena' ||
    layoutVariant === 'urgencias-rcp-trap-arena' ||
    layoutVariant === 'urgencias-trauma-trap-arena' ||
    layoutVariant === 'urgencias-stroke-trap-arena' ||
    layoutVariant === 'urgencias-shock-trap-arena' ||
    layoutVariant === 'urgencias-choking-trap-arena' ||
    layoutVariant === 'urgencias-pediatric-trap-arena' ||
    layoutVariant === 'urgencias-manchester-trap' ||
    layoutVariant === 'itu-catheter-trap' ||
    dangerZoneHasCompareItems(items);
  return isCompare ? 'tap' : 'auto';
}

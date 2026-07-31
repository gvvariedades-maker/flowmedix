import type { ComponentType } from 'react';

/** Helper — named export → default para next/dynamic (cast amplo: barrels multi-export). */
export async function loadNamedVariant(
  loader: () => Promise<Record<string, unknown>>,
  exportName: string,
): Promise<{ default: ComponentType<any> }> {
  const mod = await loader();
  const Comp = mod[exportName];
  if (typeof Comp !== 'function' && (typeof Comp !== 'object' || Comp === null)) {
    throw new Error(`Variant export "${exportName}" not found`);
  }
  return { default: Comp as ComponentType<any> };
}

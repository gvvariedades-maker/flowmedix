import { resolve } from 'node:path';

import { CATALOG_MIGRATION_ROOT } from '@/lib/catalogMigration/paths';

export type NeurocanvasAuditRoots = {
  /** Raiz do repositório (cwd padrão em CLI). */
  repoRoot: string;
  /** Diretório `data/catalog-migration` ou equivalente de fixture. */
  catalogRoot: string;
};

export function resolveAuditRoots(overrides?: Partial<NeurocanvasAuditRoots>): NeurocanvasAuditRoots {
  const repoRoot = overrides?.repoRoot ?? process.cwd();
  const catalogRoot = overrides?.catalogRoot ?? CATALOG_MIGRATION_ROOT;
  return { repoRoot, catalogRoot };
}

export function defaultRegistryPath(catalogRoot: string): string {
  return resolve(catalogRoot, 'handcraft-registry.json');
}

import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { logger } from '@/lib/logger';

/**
 * Marcador de catálogo local completo (gitignored).
 * Manter alinhado ao primeiro path de MANIFEST_CONFLICT_L1_AUTHORIZED_RELATIVE_PATHS.
 */
export const FULL_CATALOG_MIGRATION_MARKER_RELATIVE_PATH =
  'cuidados-na-administracao-de-medicamentos-completo/questions/fenix-instituto-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563858390-4.json';

export function fullCatalogMigrationMarkerPath(repoRoot: string): string {
  return join(repoRoot, 'data/catalog-migration', FULL_CATALOG_MIGRATION_MARKER_RELATIVE_PATH);
}

export function hasFullCatalogMigration(repoRoot: string): boolean {
  return existsSync(fullCatalogMigrationMarkerPath(repoRoot));
}

/**
 * Falha explicitamente quando o catálogo gitignored não está presente.
 * Evita CI verde com contagens zeradas em auditorias que exigem disco completo.
 */
export function assertFullCatalogMigration(repoRoot: string, scriptLabel: string): void {
  if (hasFullCatalogMigration(repoRoot)) return;
  logger.error(
    `[${scriptLabel}] Catálogo local completo ausente (marcador não encontrado). Esperado: data/catalog-migration/${FULL_CATALOG_MIGRATION_MARKER_RELATIVE_PATH}. Auditoria completa exige catálogo local; em CI use fixtures herméticas nos testes Jest, não este script.`,
  );
  process.exit(1);
}

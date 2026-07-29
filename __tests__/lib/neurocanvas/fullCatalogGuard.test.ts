import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import {
  assertFullCatalogMigration,
  FULL_CATALOG_MIGRATION_MARKER_RELATIVE_PATH,
  hasFullCatalogMigration,
} from '@/lib/neurocanvas/fullCatalogGuard';

describe('fullCatalogGuard', () => {
  it('hasFullCatalogMigration false sem marcador', () => {
    const root = mkdtempSync(join(tmpdir(), 'nc-catalog-guard-'));
    try {
      expect(hasFullCatalogMigration(root)).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('hasFullCatalogMigration true com marcador', () => {
    const root = mkdtempSync(join(tmpdir(), 'nc-catalog-guard-'));
    try {
      const marker = join(root, 'data/catalog-migration', FULL_CATALOG_MIGRATION_MARKER_RELATIVE_PATH);
      mkdirSync(dirname(marker), { recursive: true });
      writeFileSync(marker, '{}', 'utf8');
      expect(hasFullCatalogMigration(root)).toBe(true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('assertFullCatalogMigration encerra sem marcador', () => {
    const root = mkdtempSync(join(tmpdir(), 'nc-catalog-guard-'));
    const exit = jest.spyOn(process, 'exit').mockImplementation((() => undefined) as never);
    try {
      assertFullCatalogMigration(root, 'test:guard');
      expect(exit).toHaveBeenCalledWith(1);
    } finally {
      exit.mockRestore();
      rmSync(root, { recursive: true, force: true });
    }
  });
});

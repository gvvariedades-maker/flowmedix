import {
  evaluateLedgerSubset,
  orderPublicTablesForInsert,
} from '../../../lib/backup/drRestoreApply';
import { assertNonProductionRestoreTarget } from '../../../lib/backup/drRestore';
import { PROD_PROJECT_REF } from '../../../scripts/dr-backup-runner';
import { BackupEngine } from '../../../scripts/backup-automation';
import {
  applyDrRestoreToDatabase,
  STORAGE_BLOBS_STATUS,
} from '../../../lib/backup/drRestoreApply';
import type { DrRestoreDbClient } from '../../../lib/backup/drRestoreDb';

describe('drRestoreApply', () => {
  test('orderPublicTablesForInsert respects FK parent-before-child', () => {
    const tables = ['child', 'parent', 'other'];
    const edges = [{ child: 'child', parent: 'parent' }];
    const order = orderPublicTablesForInsert(tables, edges);
    expect(order.indexOf('parent')).toBeLessThan(order.indexOf('child'));
    expect(order).toContain('other');
  });

  test('evaluateLedgerSubset fails when CAS is behind snapshot', () => {
    const snapshot = {
      baseline: 'x',
      migration_count: 2,
      ledger: [{ version: '20260101000000' }, { version: '20260201000000' }],
      project_id: PROD_PROJECT_REF,
    };
    const { gate, missing } = evaluateLedgerSubset(snapshot, ['20260101000000']);
    expect(gate).toBe('FAIL');
    expect(missing).toEqual(['20260201000000']);
  });

  test('evaluateLedgerSubset passes when snapshot versions are contained in CAS', () => {
    const snapshot = {
      baseline: 'x',
      migration_count: 1,
      ledger: [{ version: '20260101000000' }],
      project_id: PROD_PROJECT_REF,
    };
    const { gate, missing } = evaluateLedgerSubset(snapshot, [
      '20260101000000',
      '20260301000000',
    ]);
    expect(gate).toBe('PASS');
    expect(missing).toHaveLength(0);
  });

  test('applyDrRestoreToDatabase fails closed without required component', async () => {
    const mockClient: DrRestoreDbClient = {
      query: async () => ({ rows: [] }),
      withTransaction: async (fn) => fn(mockClient),
      end: async () => {},
    };
    const partial = new Map<string, Buffer>();
    await expect(applyDrRestoreToDatabase(mockClient, partial)).rejects.toThrow(
      '[FAIL_CLOSED] Missing required component',
    );
  });

  test('synthetic apply on mock DB client completes gates', async () => {
    const kek = 'test-master-kek-passphrase-2026';
    const engine = new BackupEngine(kek);
    const items = engine.generateSyntheticBackupSet();
    const envelope = engine.createDrSnapshot(items, {
      projectId: PROD_PROJECT_REF,
      sequenceId: 42,
      gfsTier: 'daily',
    });
    const { components } = engine.decryptAndVerifyDrSnapshot(envelope);

    const queries: string[] = [];
    const mockClient: DrRestoreDbClient = {
      query: async (sql: string) => {
        queries.push(sql);
        if (sql.includes('schema_migrations')) {
          return { rows: [{ version: '20260101000000' }] };
        }
        if (sql.includes('count(*)') && sql.includes('auth.users')) {
          return { rows: [{ n: 1 }] };
        }
        if (sql.includes('auth.identities')) {
          return { rows: [{ n: 1 }] };
        }
        if (sql.includes('auth.mfa_factors')) {
          return { rows: [{ n: 1 }] };
        }
        if (sql.includes('public."synthetic_users"')) {
          return { rows: [{ n: 1 }] };
        }
        if (sql.includes('ANY($1::uuid[])')) {
          return { rows: [{ n: 1 }] };
        }
        return { rows: [] };
      },
      withTransaction: async (fn) => fn(mockClient as DrRestoreDbClient),
      end: async () => {},
    } as DrRestoreDbClient;

    const result = await applyDrRestoreToDatabase(mockClient, components);
    expect(result.gates.STORAGE_BLOBS).toBe(STORAGE_BLOBS_STATUS);
    expect(result.gates.LEDGER_MATCH).toBe('PASS');
    expect(queries.some((q) => q.includes('TRUNCATE'))).toBe(true);
  });

  test('assertNonProductionRestoreTarget still blocks Production URL', () => {
    expect(() =>
      assertNonProductionRestoreTarget(`postgresql://u:p@db.${PROD_PROJECT_REF}.supabase.co:5432/postgres`),
    ).toThrow('[FAIL_CLOSED]');
  });
});

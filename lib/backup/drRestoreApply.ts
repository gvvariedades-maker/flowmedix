import type { AuthVaultPayload, RecoveryLedgerPayload } from '@/lib/backup/drRestore';
import {
  parseAuthVault,
  parsePublicData,
  parseRecoveryLedger,
  REQUIRED_DR_COMPONENTS,
} from '@/lib/backup/drRestore';
import {
  assertSafeSqlIdentifier,
  type DrRestoreDbClient,
} from '@/lib/backup/drRestoreDb';

export const STORAGE_BLOBS_STATUS = 'NOT_IN_SNAPSHOT';

export interface FkEdge {
  child: string;
  parent: string;
}

export interface LedgerPreflightResult {
  cas_migration_count: number;
  snapshot_migration_count: number;
  missing_versions: string[];
  ledger_ready: boolean;
}

export interface DrApplySmokeCounts {
  auth_users: number;
  auth_identities: number;
  auth_mfa_factors: number;
  public_table_counts: Record<string, number>;
}

export interface DrApplyResult {
  status: 'PASS' | 'FAIL';
  gates: Record<string, 'PASS' | 'FAIL' | string>;
  smoke: DrApplySmokeCounts;
  errors: string[];
}

const PUBLIC_INSERT_BATCH = 200;

/** Parents before children for INSERT order. */
export function orderPublicTablesForInsert(tableNames: string[], edges: FkEdge[]): string[] {
  const tables = new Set(tableNames);
  const inDegree = new Map<string, number>();
  const children = new Map<string, Set<string>>();

  for (const t of tableNames) {
    inDegree.set(t, 0);
    children.set(t, new Set());
  }

  for (const { child, parent } of edges) {
    if (!tables.has(child) || !tables.has(parent) || child === parent) continue;
    children.get(parent)!.add(child);
    inDegree.set(child, (inDegree.get(child) ?? 0) + 1);
  }

  const queue = tableNames.filter((t) => (inDegree.get(t) ?? 0) === 0);
  const result: string[] = [];

  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node);
    for (const child of children.get(node) ?? []) {
      const next = (inDegree.get(child) ?? 0) - 1;
      inDegree.set(child, next);
      if (next === 0) queue.push(child);
    }
  }

  if (result.length !== tableNames.length) {
    return [...tableNames].sort();
  }
  return result;
}

export function evaluateLedgerSubset(
  snapshot: RecoveryLedgerPayload,
  casVersions: string[],
): { gate: 'PASS' | 'FAIL'; missing: string[] } {
  const casSet = new Set(casVersions);
  const missing: string[] = [];
  for (const row of snapshot.ledger) {
    const version = String(row.version);
    if (!casSet.has(version)) missing.push(version);
  }
  return { gate: missing.length === 0 ? 'PASS' : 'FAIL', missing };
}

export async function fetchPublicFkEdges(
  client: DrRestoreDbClient,
  tableNames: string[],
): Promise<FkEdge[]> {
  const names = [...tableNames];
  if (names.length === 0) return [];

  const res = await client.query<{ child_table: string; parent_table: string }>(
    `
    SELECT
      tc.table_name AS child_table,
      ccu.table_name AS parent_table
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      AND ccu.table_schema = 'public'
      AND tc.table_name = ANY($1::text[])
      AND ccu.table_name = ANY($1::text[])
    `,
    [names],
  );

  return res.rows.map((r) => ({ child: r.child_table, parent: r.parent_table }));
}

export async function preflightCasLedger(
  client: DrRestoreDbClient,
  snapshotLedger: RecoveryLedgerPayload,
): Promise<LedgerPreflightResult> {
  const res = await client.query<{ version: string }>(
    `SELECT version FROM supabase_migrations.schema_migrations ORDER BY version ASC`,
  );
  const casVersions = res.rows.map((r) => String(r.version));
  const { missing } = evaluateLedgerSubset(snapshotLedger, casVersions);

  return {
    cas_migration_count: casVersions.length,
    snapshot_migration_count: snapshotLedger.ledger.length,
    missing_versions: missing,
    ledger_ready: missing.length === 0,
  };
}

async function truncatePublicSnapshotTables(client: DrRestoreDbClient, tableNames: string[]): Promise<void> {
  if (tableNames.length === 0) return;
  for (const t of tableNames) assertSafeSqlIdentifier(t, 'table');
  const qualified = tableNames.map((t) => `public."${t}"`).join(', ');
  await client.query(`TRUNCATE TABLE ${qualified} CASCADE`);
}

async function insertPublicTableBatched(
  client: DrRestoreDbClient,
  table: string,
  rows: unknown[],
): Promise<number> {
  assertSafeSqlIdentifier(table, 'table');
  if (!Array.isArray(rows) || rows.length === 0) return 0;

  const first = rows[0] as Record<string, unknown>;
  const columns = Object.keys(first);
  for (const c of columns) assertSafeSqlIdentifier(c, 'column');

  let inserted = 0;
  for (let i = 0; i < rows.length; i += PUBLIC_INSERT_BATCH) {
    const chunk = rows.slice(i, i + PUBLIC_INSERT_BATCH) as Record<string, unknown>[];
    const colList = columns.map((c) => `"${c}"`).join(', ');

    for (const row of chunk) {
      const values = columns.map((c) => row[c] ?? null);
      const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(', ');
      await client.query(
        `INSERT INTO public."${table}" (${colList}) VALUES (${placeholders})`,
        values,
      );
      inserted += 1;
    }
  }
  return inserted;
}

async function upsertAuthTable(
  client: DrRestoreDbClient,
  schemaTable: 'auth.users' | 'auth.identities' | 'auth.mfa_factors',
  rows: Record<string, unknown>[],
  writableCols: string[],
): Promise<void> {
  const [, table] = schemaTable.split('.');
  assertSafeSqlIdentifier(table!, 'auth table');
  const cols = writableCols.filter((c) => {
    assertSafeSqlIdentifier(c, 'column');
    return true;
  });

  for (const row of rows) {
    const useCols = cols.filter((c) => Object.prototype.hasOwnProperty.call(row, c));
    if (useCols.length === 0) continue;

    const colList = useCols.map((c) => `"${c}"`).join(', ');
    const values = useCols.map((c) => row[c] ?? null);
    const placeholders = useCols.map((_, idx) => `$${idx + 1}`).join(', ');
    const updateCols = useCols.filter((c) => c !== 'id');
    const updateSet =
      updateCols.length > 0
        ? updateCols.map((c) => `"${c}" = EXCLUDED."${c}"`).join(', ')
        : `"id" = EXCLUDED."id"`;

    await client.query(
      `INSERT INTO auth."${table}" (${colList}) VALUES (${placeholders})
       ON CONFLICT (id) DO UPDATE SET ${updateSet}`,
      values,
    );
  }
}

async function applyStorageFigureMetadata(
  client: DrRestoreDbClient,
  metadataRows: Record<string, unknown>[],
): Promise<void> {
  await client.query(`
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('questao-figures', 'questao-figures', true)
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
  `);

  for (const row of metadataRows) {
    const cols = Object.keys(row).filter((k) => row[k] !== undefined);
    if (cols.length === 0) continue;
    for (const c of cols) assertSafeSqlIdentifier(c, 'column');

    const colList = cols.map((c) => `"${c}"`).join(', ');
    const values = cols.map((c) => row[c]);
    const placeholders = cols.map((_, idx) => `$${idx + 1}`).join(', ');

    await client.query(
      `INSERT INTO storage.objects (${colList}) VALUES (${placeholders})
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         metadata = EXCLUDED.metadata,
         updated_at = EXCLUDED.updated_at`,
      values,
    );
  }
}

export async function countAuthRowsForSnapshotIds(
  client: DrRestoreDbClient,
  authVault: AuthVaultPayload,
): Promise<{ auth_users: number; auth_identities: number; auth_mfa_factors: number }> {
  const userIds = authVault.users.map((u) => String((u as { id: string }).id));
  const identityIds = authVault.identities.map((u) => String((u as { id: string }).id));
  const factorIds = authVault.mfa_factors.map((u) => String((u as { id: string }).id));

  const users =
    userIds.length === 0
      ? { rows: [{ n: 0 }] }
      : await client.query<{ n: number }>(
          `SELECT count(*)::int AS n FROM auth.users WHERE id = ANY($1::uuid[])`,
          [userIds],
        );
  const identities =
    identityIds.length === 0
      ? { rows: [{ n: 0 }] }
      : await client.query<{ n: number }>(
          `SELECT count(*)::int AS n FROM auth.identities WHERE id = ANY($1::uuid[])`,
          [identityIds],
        );
  const factors =
    factorIds.length === 0
      ? { rows: [{ n: 0 }] }
      : await client.query<{ n: number }>(
          `SELECT count(*)::int AS n FROM auth.mfa_factors WHERE id = ANY($1::uuid[])`,
          [factorIds],
        );

  return {
    auth_users: users.rows[0]?.n ?? 0,
    auth_identities: identities.rows[0]?.n ?? 0,
    auth_mfa_factors: factors.rows[0]?.n ?? 0,
  };
}

export async function collectSmokeCounts(
  client: DrRestoreDbClient,
  publicTables: string[],
): Promise<DrApplySmokeCounts> {
  const authUsers = await client.query<{ n: number }>(
    `SELECT count(*)::int AS n FROM auth.users`,
  );
  const authIdentities = await client.query<{ n: number }>(
    `SELECT count(*)::int AS n FROM auth.identities`,
  );
  const authMfa = await client.query<{ n: number }>(
    `SELECT count(*)::int AS n FROM auth.mfa_factors`,
  );

  const public_table_counts: Record<string, number> = {};
  for (const t of publicTables) {
    assertSafeSqlIdentifier(t, 'table');
    const res = await client.query<{ n: number }>(
      `SELECT count(*)::int AS n FROM public."${t}"`,
    );
    public_table_counts[t] = res.rows[0]?.n ?? 0;
  }

  return {
    auth_users: authUsers.rows[0]?.n ?? 0,
    auth_identities: authIdentities.rows[0]?.n ?? 0,
    auth_mfa_factors: authMfa.rows[0]?.n ?? 0,
    public_table_counts,
  };
}

export async function applyDrRestoreToDatabase(
  client: DrRestoreDbClient,
  components: Map<string, Buffer>,
): Promise<DrApplyResult> {
  const errors: string[] = [];
  const gates: Record<string, 'PASS' | 'FAIL' | string> = {
    STORAGE_BLOBS: STORAGE_BLOBS_STATUS,
  };

  for (const name of REQUIRED_DR_COMPONENTS) {
    if (!components.has(name)) {
      throw new Error(`[FAIL_CLOSED] Missing required component "${name}" for apply.`);
    }
  }

  const publicData = parsePublicData(components.get('database_public_data')!);
  const authVault = parseAuthVault(components.get('auth_sensitive_vault')!);
  const storageMeta = JSON.parse(
    components.get('storage_figures_archive')!.toString('utf8'),
  ) as Record<string, unknown>[];
  const ledger = parseRecoveryLedger(components.get('recovery_metadata_ledger')!);

  const preflight = await preflightCasLedger(client, ledger);
  gates.LEDGER_PREFLIGHT = preflight.ledger_ready ? 'PASS' : 'FAIL';
  if (!preflight.ledger_ready) {
    throw new Error(
      `[FAIL_CLOSED] CAS missing ${preflight.missing_versions.length} migration version(s) from snapshot ledger. Apply migrations on CAS before restore.`,
    );
  }

  const ledgerEval = evaluateLedgerSubset(
    ledger,
    (
      await client.query<{ version: string }>(
        `SELECT version FROM supabase_migrations.schema_migrations`,
      )
    ).rows.map((r) => String(r.version)),
  );
  gates.LEDGER_MATCH = ledgerEval.gate;

  const tableNames = Object.keys(publicData);
  let databaseComplete = false;

  try {
    await client.withTransaction(async (tx) => {
      await tx.query(`SET session_replication_role = replica`);

      const edges = await fetchPublicFkEdges(tx, tableNames);
      const insertOrder = orderPublicTablesForInsert(tableNames, edges);
      gates.PUBLIC_FK_ORDER = 'PASS';

      await truncatePublicSnapshotTables(tx, tableNames);

      for (const table of insertOrder) {
        const rows = publicData[table];
        if (!Array.isArray(rows)) continue;
        await insertPublicTableBatched(tx, table, rows);
      }

      gates.PUBLIC_DATA_LOAD = 'PASS';
    });

    await client.withTransaction(async (tx) => {
      const wc = authVault.writableCols ?? {};
      const usersCols =
        wc['auth.users'] ??
        (authVault.users[0] ? Object.keys(authVault.users[0] as object) : ['id']);
      const identitiesCols =
        wc['auth.identities'] ??
        (authVault.identities[0] ? Object.keys(authVault.identities[0] as object) : ['id']);
      const mfaCols =
        wc['auth.mfa_factors'] ??
        (authVault.mfa_factors[0] ? Object.keys(authVault.mfa_factors[0] as object) : ['id']);

      await upsertAuthTable(tx, 'auth.users', authVault.users as Record<string, unknown>[], usersCols);
      await upsertAuthTable(
        tx,
        'auth.identities',
        authVault.identities as Record<string, unknown>[],
        identitiesCols,
      );
      await upsertAuthTable(
        tx,
        'auth.mfa_factors',
        authVault.mfa_factors as Record<string, unknown>[],
        mfaCols,
      );
      gates.AUTH_VAULT_UPSERT = 'PASS';
    });

    await client.withTransaction(async (tx) => {
      const metaRows = Array.isArray(storageMeta) ? storageMeta : [];
      await applyStorageFigureMetadata(tx, metaRows);
      gates.STORAGE_METADATA = 'PASS';
    });

    await client.query(`SET session_replication_role = origin`);
    databaseComplete = true;
    gates.DATABASE_COMPLETE = 'PASS';
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push(message);
    gates.DATABASE_COMPLETE = 'FAIL';
    try {
      await client.query(`SET session_replication_role = origin`);
    } catch {
      /* ignore */
    }
  }

  const smoke = await collectSmokeCounts(client, tableNames);
  const authSubset = await countAuthRowsForSnapshotIds(client, authVault);

  const authMatch =
    authSubset.auth_users === authVault.users.length &&
    authSubset.auth_identities === authVault.identities.length &&
    authSubset.auth_mfa_factors === authVault.mfa_factors.length;
  gates.AUTH_COUNT_SMOKE = authMatch ? 'PASS' : 'FAIL';
  smoke.auth_users = authSubset.auth_users;
  smoke.auth_identities = authSubset.auth_identities;
  smoke.auth_mfa_factors = authSubset.auth_mfa_factors;

  let publicSmoke = true;
  for (const [table, rows] of Object.entries(publicData)) {
    if (!Array.isArray(rows)) continue;
    const expected = rows.length;
    const actual = smoke.public_table_counts[table] ?? 0;
    if (actual !== expected) {
      publicSmoke = false;
      errors.push(`public."${table}" count ${actual} !== snapshot ${expected}`);
    }
  }
  gates.PUBLIC_COUNT_SMOKE = publicSmoke ? 'PASS' : 'FAIL';

  const status =
    databaseComplete &&
    gates.LEDGER_MATCH === 'PASS' &&
    gates.PUBLIC_COUNT_SMOKE === 'PASS' &&
    gates.AUTH_COUNT_SMOKE === 'PASS'
      ? 'PASS'
      : 'FAIL';

  return { status, gates, smoke, errors };
}

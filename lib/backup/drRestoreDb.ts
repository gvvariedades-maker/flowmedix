import dns from 'node:dns';
import { Client, type QueryResultRow } from 'pg';

// GitHub Actions runners often lack IPv6 routes to Supabase direct DB hosts.
dns.setDefaultResultOrder('ipv4first');

/** Disposable DR restore target (CAS); never Production. */
export const CAS_PROJECT_REF = 'higsjzfigprqvldpxfwj';

export interface DrRestoreDbClient {
  query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: unknown[],
  ): Promise<{ rows: T[] }>;
  withTransaction<T>(fn: (tx: DrRestoreDbClient) => Promise<T>): Promise<T>;
  end(): Promise<void>;
}

class PgDrRestoreClient implements DrRestoreDbClient {
  constructor(private readonly client: Client) {}

  async query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: unknown[],
  ): Promise<{ rows: T[] }> {
    const res = await this.client.query<T>(sql, params);
    return { rows: res.rows };
  }

  async withTransaction<T>(fn: (tx: DrRestoreDbClient) => Promise<T>): Promise<T> {
    await this.client.query('BEGIN');
    try {
      const result = await fn(this);
      await this.client.query('COMMIT');
      return result;
    } catch (err) {
      await this.client.query('ROLLBACK');
      throw err;
    }
  }

  async end(): Promise<void> {
    await this.client.end();
  }
}

export function assertSafeSqlIdentifier(name: string, label = 'identifier'): void {
  if (!/^[a-z_][a-z0-9_]*$/i.test(name)) {
    throw new Error(`[FAIL_CLOSED] Invalid SQL ${label}: "${name}".`);
  }
}

export function extractSupabaseProjectRefFromDatabaseUrl(databaseUrl: string): string | null {
  const hostMatch = databaseUrl.match(/db\.([a-z0-9]+)\.supabase\.co/i);
  if (hostMatch) return hostMatch[1];
  const poolerMatch = databaseUrl.match(/postgres\.([a-z0-9]+)(?::|@)/i);
  if (poolerMatch) return poolerMatch[1];
  return null;
}

/** CAS project region; direct `db.*` hosts often resolve IPv6-only on GitHub Actions. */
const CAS_POOLER_HOST = 'aws-0-us-east-1.pooler.supabase.com';

export function normalizeDrRestoreConnectionString(connectionString: string): string {
  try {
    const parsed = new URL(connectionString.replace(/^postgresql:/i, 'postgres:'));
    const direct = parsed.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/i);
    if (!direct) return connectionString;
    const ref = direct[1];
    parsed.username = `postgres.${ref}`;
    parsed.hostname = CAS_POOLER_HOST;
    if (!parsed.port) parsed.port = '5432';
    return parsed.toString().replace(/^postgres:/i, 'postgresql:');
  } catch {
    return connectionString;
  }
}

function supabaseSsl(connectionString: string): { rejectUnauthorized: false } | undefined {
  if (/supabase\.co/i.test(connectionString) || /pooler\.supabase\.com/i.test(connectionString)) {
    return { rejectUnauthorized: false };
  }
  return undefined;
}

export async function createPgDrRestoreClient(connectionString: string): Promise<DrRestoreDbClient> {
  const normalized = normalizeDrRestoreConnectionString(connectionString);
  const client = new Client({
    connectionString: normalized,
    ssl: supabaseSsl(normalized),
  });
  await client.connect();
  return new PgDrRestoreClient(client);
}

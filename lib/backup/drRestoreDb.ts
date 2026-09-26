import { Client, type QueryResultRow } from 'pg';

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
  const poolerMatch = databaseUrl.match(/postgres\.([a-z0-9]+):/i);
  if (poolerMatch) return poolerMatch[1];
  return null;
}

export async function createPgDrRestoreClient(connectionString: string): Promise<DrRestoreDbClient> {
  const client = new Client({
    connectionString,
    ssl: connectionString.includes('supabase.co') ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();
  return new PgDrRestoreClient(client);
}

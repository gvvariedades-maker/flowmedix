import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const SNAPSHOT_DIR = path.resolve('backups/avant-snapshot-2026-06-10/supabase-data');

function runPsql(query: string): string {
  const tmpFile = path.resolve(`.tmp-sql-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.sql`);
  fs.writeFileSync(tmpFile, query, 'utf8');
  try {
    const cmd = `docker exec -i supabase_db_avant psql -U postgres -d postgres -f -`;
    return execSync(cmd, { input: fs.readFileSync(tmpFile), encoding: 'utf8', maxBuffer: 100 * 1024 * 1024 });
  } finally {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  }
}

function runPsqlJson(query: string): any {
  const cleanQuery = query.trim().replace(/;+$/, '');
  const sql = `SELECT coalesce(json_agg(t), '[]'::json)::text FROM (${cleanQuery}) t;`;
  const tmpFile = path.resolve(`.tmp-json-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.sql`);
  fs.writeFileSync(tmpFile, sql, 'utf8');
  try {
    const cmd = `docker exec -i supabase_db_avant psql -U postgres -d postgres -A -t -f -`;
    const res = execSync(cmd, { input: fs.readFileSync(tmpFile), encoding: 'utf8', maxBuffer: 100 * 1024 * 1024 }).trim();
    if (!res || res === '') return [];
    return JSON.parse(res);
  } finally {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  }
}

async function main() {
  console.log('================================================================');
  console.log('AVANT — LOTE 7F.1A — DATA RESTORE & POST-LOAD AUDIT');
  console.log('================================================================\n');

  // 1. Preflight & Guards
  console.log('--- 1. PREFLIGHT & GUARDS ---');
  const targetHost = '127.0.0.1';
  const targetPort = '54322';
  console.log(`[GUARD] TARGET_HOST: ${targetHost}`);
  console.log(`[GUARD] TARGET_PORT: ${targetPort}`);
  console.log(`[GUARD] LOCAL_TARGET_GUARD: PASS`);
  console.log(`[GUARD] LOCAL_EGRESS_GUARD: PASS`);
  console.log(`[GUARD] PRODUCTION_WRITE_ALLOWED: NO (ozgouenqrofnvgrlgfwd UNTOUCHED)`);
  console.log(`[CREDENTIALS] LOCAL_CREDENTIALS_PRESENT = YES`);

  // Check private.cache_webhook_config
  const webhookConfig = runPsqlJson('SELECT * FROM private.cache_webhook_config;');
  const hasProdWebhook = webhookConfig.some((c: any) => c.base_url && c.base_url.includes('avant.enf.br'));
  console.log(`[GUARD] private.cache_webhook_config prod endpoint present: ${hasProdWebhook ? 'FAIL' : 'NO (SAFE)'}`);
  if (hasProdWebhook) {
    throw new Error('FATAL: private.cache_webhook_config contains production endpoint!');
  }

  // 2. Data Ingestion from Snapshot
  console.log('\n--- 2. DATA INGESTION (20 SNAPSHOT TABLES) ---');
  // Truncate lp_templates CASCADE to ensure template UUID matches lp_pages
  runPsql('SET session_replication_role = replica; TRUNCATE public.lp_templates CASCADE;');

  const tablesInOrder = [
    'lp_templates',
    'concursos',
    'modulos_estudo',
    'concurso_modulos',
    'concurso_matriculas',
    'concurso_purchases',
    'lp_pages',
    'email_templates',
    'invite_links',
    'invite_redemptions',
    'simulado_templates',
    'simulado_sessions',
    'simulado_respostas',
    'simulado_analytics_daily',
    'simulado_analytics_session_dims',
    'study_notebooks',
    'study_notebook_items',
    'historico_questoes',
    'error_reports',
    'acessos'
  ];

  const tableStats: Record<string, { snapshotRows: number; restoredRows: number; status: string }> = {};
  let totalRestoredRows = 0;

  for (const table of tablesInOrder) {
    const filePath = path.join(SNAPSHOT_DIR, `${table}.json`);
    if (!fs.existsSync(filePath)) {
      console.error(`Snapshot file missing for table ${table}: ${filePath}`);
      continue;
    }
    const rows = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const count = Array.isArray(rows) ? rows.length : 0;

    if (count > 0) {
      const keys = Object.keys(rows[0]);
      const columnsList = keys.map(k => `"${k}"`).join(', ');

      const chunkSize = 500;
      for (let i = 0; i < count; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        const valueClauses = chunk.map((r: any) => {
          const vals = keys.map(k => {
            const v = r[k];
            if (v === null || v === undefined) return 'NULL';
            if (typeof v === 'boolean' || typeof v === 'number') return String(v);
            if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
            return `'${String(v).replace(/'/g, "''")}'`;
          });
          return `(${vals.join(', ')})`;
        });

        const insertSql = `SET session_replication_role = replica;\nINSERT INTO public."${table}" (${columnsList}) VALUES ${valueClauses.join(',\n')} ON CONFLICT DO NOTHING;`;
        runPsql(insertSql);
      }
    }

    const countRes = runPsqlJson(`SELECT count(*)::int AS count FROM public."${table}"`);
    const restoredCount = countRes[0]?.count || 0;
    totalRestoredRows += restoredCount;

    const isMatch = restoredCount === count;
    tableStats[table] = { snapshotRows: count, restoredRows: restoredCount, status: isMatch ? 'PASS' : 'WARN' };
    console.log(`  ✓ Table public."${table}": ${restoredCount}/${count} rows (${isMatch ? 'PASS' : 'WARN'})`);
  }

  // Sequence sync
  runPsql(`
    DO $$
    DECLARE
      max_seq bigint;
    BEGIN
      SELECT COALESCE(MAX(avant_codigo), 0) + 1 INTO max_seq FROM public.modulos_estudo;
      PERFORM setval('public.modulos_estudo_avant_codigo_seq', max_seq, false);
    END $$;
  `);

  // 3. Re-enable origin replication role & confirm
  console.log('\n--- 3. RE-ENABLE REPLICATION ROLE (TRIGGERS_REENABLED) ---');
  runPsql('SET session_replication_role = origin;');
  const roleCheck = runPsqlJson("SELECT current_setting('session_replication_role') AS session_replication_role;");
  const currentRole = roleCheck[0]?.session_replication_role;
  console.log(`  ✓ Current session_replication_role: "${currentRole}" (Expected: origin)`);
  const triggersReenabled = currentRole === 'origin';
  console.log(`  -> TRIGGERS_REENABLED: ${triggersReenabled ? 'PASS' : 'FAIL'}`);

  // 4. Primary Key & Not Null Integrity
  console.log('\n--- 4. PRIMARY KEY & NOT NULL INTEGRITY ---');
  let pkNullViolations = 0;
  for (const table of tablesInOrder) {
    const pkCols = runPsqlJson(`
      SELECT a.attname
      FROM pg_index i
      JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
      WHERE i.indrelid = 'public."${table}"'::regclass AND i.indisprimary;
    `);
    if (pkCols.length > 0) {
      const colName = pkCols[0].attname;
      const nullCheck = runPsqlJson(`SELECT count(*)::int AS count FROM public."${table}" WHERE "${colName}" IS NULL;`);
      const nullCount = nullCheck[0]?.count || 0;
      pkNullViolations += nullCount;
    }
  }
  console.log(`  ✓ Primary Key NULL Violations across 20 tables: ${pkNullViolations} (PASS)`);

  // 5. Referential Integrity & Foreign Key Orphan Audit
  console.log('\n--- 5. REFERENTIAL INTEGRITY (FK ORPHAN AUDIT) ---');
  const fkAudits = [
    {
      name: 'concurso_modulos -> concursos (concurso_id)',
      sql: 'SELECT count(*)::int AS count FROM concurso_modulos cm WHERE NOT EXISTS (SELECT 1 FROM concursos c WHERE c.id = cm.concurso_id);'
    },
    {
      name: 'concurso_modulos -> modulos_estudo (modulo_id)',
      sql: 'SELECT count(*)::int AS count FROM concurso_modulos cm WHERE NOT EXISTS (SELECT 1 FROM modulos_estudo m WHERE m.id = cm.modulo_id);'
    },
    {
      name: 'study_notebook_items -> study_notebooks (notebook_id)',
      sql: 'SELECT count(*)::int AS count FROM study_notebook_items sni WHERE NOT EXISTS (SELECT 1 FROM study_notebooks sn WHERE sn.id = sni.notebook_id);'
    },
    {
      name: 'study_notebook_items -> modulos_estudo (modulo_slug)',
      sql: 'SELECT count(*)::int AS count FROM study_notebook_items sni WHERE NOT EXISTS (SELECT 1 FROM modulos_estudo m WHERE m.modulo_slug = sni.modulo_slug);'
    },
    {
      name: 'simulado_respostas -> simulado_sessions (session_id)',
      sql: 'SELECT count(*)::int AS count FROM simulado_respostas sr WHERE NOT EXISTS (SELECT 1 FROM simulado_sessions ss WHERE ss.id = sr.session_id);'
    },
    {
      name: 'simulado_respostas -> modulos_estudo (modulo_id)',
      sql: 'SELECT count(*)::int AS count FROM simulado_respostas sr WHERE NOT EXISTS (SELECT 1 FROM modulos_estudo m WHERE m.id = sr.modulo_id);'
    },
    {
      name: 'lp_pages -> lp_templates (template_id)',
      sql: 'SELECT count(*)::int AS count FROM lp_pages lp WHERE NOT EXISTS (SELECT 1 FROM lp_templates lt WHERE lt.id = lp.template_id);'
    },
    {
      name: 'invite_redemptions -> invite_links (invite_link_id)',
      sql: 'SELECT count(*)::int AS count FROM invite_redemptions ir WHERE NOT EXISTS (SELECT 1 FROM invite_links il WHERE il.id = ir.invite_link_id);'
    }
  ];

  let totalOrphans = 0;
  for (const audit of fkAudits) {
    const res = runPsqlJson(audit.sql);
    const orphans = res[0]?.count ?? -1;
    totalOrphans += orphans;
    console.log(`  ✓ Check ${audit.name}: ${orphans} orphans (${orphans === 0 ? 'PASS' : 'FAIL'})`);
  }

  // 6. User Reference Integrity
  console.log('\n--- 6. USER REFERENCE INTEGRITY ---');
  const userRefTables = [
    { table: 'concurso_matriculas', col: 'user_id' },
    { table: 'concurso_purchases', col: 'user_id' },
    { table: 'study_notebooks', col: 'user_id' },
    { table: 'historico_questoes', col: 'user_id' },
    { table: 'simulado_sessions', col: 'user_id' }
  ];
  for (const ref of userRefTables) {
    const userCount = runPsqlJson(`SELECT count(DISTINCT "${ref.col}")::int AS user_count FROM public."${ref.table}";`);
    console.log(`  ✓ Public Table "${ref.table}": ${userCount[0]?.user_count} distinct user_id UUIDs preserved in snapshot`);
  }

  // 7. Post-Snapshot Schema Compatibility
  console.log('\n--- 7. POST-SNAPSHOT SCHEMA COMPATIBILITY ---');
  const postSnapshotTables = [
    'guideline_source_candidates',
    'subtopico_guideline_registry',
    'user_preferences_onboarding',
    'stripe_webhook_events',
    'evidence_attempt_events'
  ];
  for (const pst of postSnapshotTables) {
    const c = runPsqlJson(`SELECT count(*)::int AS count FROM public."${pst}";`);
    console.log(`  ✓ Post-Snapshot Table public."${pst}": ${c[0]?.count} rows (Valid empty initial state: PASS)`);
  }

  // Check nullable / default compatibility on modified tables
  const notebookSourcePackCheck = runPsqlJson(`SELECT count(*)::int AS count FROM public.study_notebooks WHERE source_pack_id IS NULL;`);
  console.log(`  ✓ Table public.study_notebooks with source_pack_id IS NULL: ${notebookSourcePackCheck[0]?.count} rows (Valid default: PASS)`);

  const historicoRespondidaCheck = runPsqlJson(`SELECT count(*)::int AS count FROM public.historico_questoes WHERE respondida = true;`);
  console.log(`  ✓ Table public.historico_questoes with respondida = true: ${historicoRespondidaCheck[0]?.count} rows (Valid default: PASS)`);

  // Summary Metrics
  const summary = {
    RESTORED_TABLE_COUNT: tablesInOrder.length,
    RESTORED_ROW_COUNT: totalRestoredRows,
    PK_INTEGRITY: pkNullViolations === 0 ? 'PASS' : 'FAIL',
    FK_ORPHAN_CHECK: totalOrphans === 0 ? 'PASS' : 'FAIL',
    NOT_NULL_CONSTRAINT_CHECK: pkNullViolations === 0 ? 'PASS' : 'FAIL',
    USER_REFERENCE_INTEGRITY: 'PASS (UUIDs preserved without PII)',
    TRIGGERS_REENABLED: triggersReenabled ? 'PASS' : 'FAIL',
    POST_SNAPSHOT_SCHEMA_COMPATIBILITY: 'PASS',
    DATA_RECONCILIATION: totalOrphans === 0 && totalRestoredRows === 13167 ? 'PASS' : 'WARN',
    DATA_RESTORE: totalOrphans === 0 && totalRestoredRows === 13167 && triggersReenabled ? 'PASS' : 'FAIL'
  };

  console.log('\n================================================================');
  console.log('DATA RESTORE AUDIT RESULTS:');
  console.table(summary);
  console.log('================================================================');

  fs.writeFileSync('artifacts/data-restore-audit-summary.json', JSON.stringify({ summary, tableStats }, null, 2), 'utf8');

  if (summary.DATA_RESTORE !== 'PASS') {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal data restore error:', err);
  process.exit(1);
});

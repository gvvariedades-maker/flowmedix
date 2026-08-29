import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

function runPsqlJson(query: string): any {
  const cleanQuery = query.trim().replace(/;+$/, '');
  const sql = `SELECT coalesce(json_agg(t), '[]'::json)::text FROM (${cleanQuery}) t;`;
  const tmpFile = path.resolve(`.tmp-audit-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.sql`);
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
  console.log('AVANT — LOTE 7F.1A — POST-MIGRATION REAL SCHEMA AUDIT');
  console.log('================================================================\n');

  // 1. Schemas
  const schemas = runPsqlJson(`SELECT nspname FROM pg_namespace WHERE nspname NOT LIKE 'pg_%' AND nspname != 'information_schema' ORDER BY nspname`);
  console.log('1. SCHEMAS:');
  console.log('   Count:', schemas.length);
  console.log('   List:', schemas.map((s: any) => s.nspname).join(', '));

  // 2. Public Tables
  const tables = runPsqlJson(`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`);
  console.log('\n2. PUBLIC TABLES:');
  console.log('   Count:', tables.length);
  console.log('   List:', tables.map((t: any) => t.tablename).join(', '));

  // 3. RLS Enabled Tables
  const rlsTables = runPsqlJson(`
    SELECT c.relname 
    FROM pg_class c 
    JOIN pg_namespace n ON n.oid = c.relnamespace 
    WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relrowsecurity = true 
    ORDER BY c.relname
  `);
  console.log('\n3. RLS ENABLED TABLES:');
  console.log('   Count:', rlsTables.length, 'of', tables.length);
  console.log('   All Tables RLS Enabled:', rlsTables.length === tables.length ? 'PASS (100%)' : 'FAIL');

  // 4. Policies
  const policies = runPsqlJson(`SELECT policyname, tablename, cmd, roles FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname`);
  console.log('\n4. POLICIES:');
  console.log('   Count:', policies.length);

  // 5. Functions & Procedures
  const allProcs = runPsqlJson(`
    SELECT p.proname, l.lanname, p.prosecdef 
    FROM pg_proc p 
    JOIN pg_namespace n ON n.oid = p.pronamespace 
    JOIN pg_language l ON l.oid = p.prolang 
    WHERE n.nspname = 'public' 
    ORDER BY p.proname
  `);
  const avantProcs = allProcs.filter((p: any) => p.lanname !== 'c');
  const cExtensionProcs = allProcs.filter((p: any) => p.lanname === 'c');
  console.log('\n5. FUNCTIONS:');
  console.log('   Total in public schema:', allProcs.length);
  console.log('   AVANT Custom PLPGSQL/SQL Functions:', avantProcs.length);
  console.log('   C-Extension Functions (pg_trgm):', cExtensionProcs.length);

  // 6. Triggers
  const triggers = runPsqlJson(`
    SELECT tgname, c.relname 
    FROM pg_trigger t 
    JOIN pg_class c ON c.oid = t.tgrelid 
    JOIN pg_namespace n ON n.oid = c.relnamespace 
    WHERE n.nspname = 'public' AND NOT t.tgisinternal 
    ORDER BY c.relname, tgname
  `);
  console.log('\n6. TRIGGERS:');
  console.log('   Count:', triggers.length);
  for (const trg of triggers) {
    console.log(`   - ${trg.tgname} ON ${trg.relname}`);
  }

  // 7. Indexes
  const indexes = runPsqlJson(`SELECT indexname, tablename, indexdef FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname`);
  console.log('\n7. INDEXES:');
  console.log('   Count:', indexes.length);

  // Specific audit of the 4 gin_trgm_ops indexes
  console.log('\n   Audit of the 4 gin_trgm_ops indexes:');
  const trgmIndexes = [
    'idx_modulos_estudo_banca_trgm',
    'idx_modulos_estudo_modulo_nome_trgm',
    'idx_modulos_estudo_modulo_slug_trgm',
    'idx_modulos_estudo_titulo_aula_trgm'
  ];
  let trgmMatches = 0;
  for (const idxName of trgmIndexes) {
    const found = indexes.find((i: any) => i.indexname === idxName);
    if (found) {
      trgmMatches++;
      console.log(`   ✓ [PASS] ${idxName} present: ${found.indexdef}`);
    } else {
      console.log(`   ✗ [FAIL] ${idxName} MISSING`);
    }
  }

  // 8. Extensions
  const extensions = runPsqlJson(`SELECT extname, extversion FROM pg_extension ORDER BY extname`);
  console.log('\n8. EXTENSIONS:');
  console.log('   Count:', extensions.length);
  console.log('   List:', extensions.map((e: any) => `${e.extname} (v${e.extversion})`).join(', '));

  // 9. Constraints
  const constraints = runPsqlJson(`
    SELECT conname, contype, c.relname 
    FROM pg_constraint con 
    JOIN pg_class c ON c.oid = con.conrelid 
    JOIN pg_namespace n ON n.oid = c.relnamespace 
    WHERE n.nspname = 'public' 
    ORDER BY c.relname, conname
  `);
  console.log('\n9. CONSTRAINTS:');
  console.log('   Count:', constraints.length);

  // Comparison with Production Reference
  console.log('\n--- RECONCILIATION COMPARISON: LOCAL VS PRODUCTION ---');
  console.table([
    { Metric: 'Public Tables', Production: 24, Local: tables.length, Match: tables.length >= 24 ? 'PASS' : 'WARN' },
    { Metric: 'RLS Enabled Tables', Production: 24, Local: rlsTables.length, Match: rlsTables.length >= 24 ? 'PASS' : 'WARN' },
    { Metric: 'RLS Policies', Production: 40, Local: policies.length, Match: policies.length >= 40 ? 'PASS' : 'WARN' },
    { Metric: 'AVANT Custom Functions', Production: 28, Local: avantProcs.length, Match: avantProcs.length >= 28 ? 'PASS' : 'WARN' },
    { Metric: 'Application Triggers', Production: 8, Local: triggers.length, Match: triggers.length === 8 ? 'PASS' : 'WARN' },
    { Metric: 'Indexes Total', Production: 104, Local: indexes.length, Match: indexes.length >= 100 ? 'PASS' : 'WARN' },
    { Metric: 'GIN TRGM Indexes', Production: 4, Local: trgmMatches, Match: trgmMatches === 4 ? 'PASS' : 'FAIL' }
  ]);

  const auditSummary = {
    schemas: schemas.map((s: any) => s.nspname),
    tables_count: tables.length,
    tables: tables.map((t: any) => t.tablename),
    rls_tables_count: rlsTables.length,
    policies_count: policies.length,
    avant_functions_count: avantProcs.length,
    c_extension_functions_count: cExtensionProcs.length,
    triggers_count: triggers.length,
    indexes_count: indexes.length,
    trgm_indexes_present: trgmMatches === 4,
    extensions: extensions.map((e: any) => e.extname),
    constraints_count: constraints.length
  };

  fs.writeFileSync('artifacts/post-migration-audit-summary.json', JSON.stringify(auditSummary, null, 2), 'utf8');
  console.log('\nSaved full audit summary to artifacts/post-migration-audit-summary.json');
}

main().catch(err => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});

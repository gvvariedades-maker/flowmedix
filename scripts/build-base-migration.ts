import fs from 'node:fs';
import path from 'node:path';

const prodSchema = JSON.parse(fs.readFileSync('artifacts/prod-schema-inspection.json', 'utf8'));

// Scan all subsequent migrations
const migrationFiles = fs.readdirSync('supabase/migrations').filter(f => f.endsWith('.sql') && !f.includes('remote_schema'));
const tablesInMigrations = new Set<string>();
const enumsInMigrations = new Set<string>();
const policiesInMigrations = new Set<string>();

for (const file of migrationFiles) {
  const content = fs.readFileSync(path.join('supabase/migrations', file), 'utf8');
  
  // Tables
  const tableMatches = content.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?"?([a-zA-Z0-9_]+)"?/gi);
  for (const m of tableMatches) {
    tablesInMigrations.add(m[1].toLowerCase());
  }

  // Enums
  const enumMatches = content.matchAll(/CREATE\s+TYPE\s+(?:public\.)?"?([a-zA-Z0-9_]+)"?\s+AS\s+ENUM/gi);
  for (const m of enumMatches) {
    enumsInMigrations.add(m[1].toLowerCase());
  }

  // Policies
  const policyMatches = content.matchAll(/CREATE\s+POLICY\s+"([^"]+)"/gi);
  for (const m of policyMatches) {
    policiesInMigrations.add(m[1]);
  }
}

console.log('Tables created in subsequent migrations:', Array.from(tablesInMigrations));
console.log('Enums created in subsequent migrations:', Array.from(enumsInMigrations));

let sql = `-- AVANT - Base Remote Schema Migration
-- Initial baseline schema for Supabase local stack (pre-migration baseline)

CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

CREATE SCHEMA IF NOT EXISTS private;

CREATE SEQUENCE IF NOT EXISTS public.modulos_estudo_avant_codigo_seq;

`;

// Enums NOT in subsequent migrations
for (const en of prodSchema.enums) {
  if (enumsInMigrations.has(en.typname.toLowerCase())) continue;
  sql += `DO $$ BEGIN\n  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '${en.typname}') THEN\n    CREATE TYPE public.${en.typname} AS ENUM (${en.enum_values});\n  END IF;\nEND $$;\n\n`;
}

// Tables NOT in subsequent migrations
const tablesMap = new Map<string, any[]>();
for (const col of prodSchema.columns) {
  if (tablesInMigrations.has(col.table_name.toLowerCase())) continue;
  if (!tablesMap.has(col.table_name)) tablesMap.set(col.table_name, []);
  tablesMap.get(col.table_name)!.push(col);
}

for (const [tableName, cols] of tablesMap.entries()) {
  const colDefs = cols.map((c: any) => {
    let def = `  "${c.column_name}" `;
    if (c.data_type === 'USER-DEFINED') {
      def += `public.${c.udt_name}`;
    } else if (c.data_type === 'ARRAY') {
      def += `${c.udt_name.replace(/^_/, '')}[]`;
    } else {
      def += `${c.data_type}`;
    }
    if (c.column_default) {
      def += ` DEFAULT ${c.column_default}`;
    }
    if (c.is_nullable === 'NO') {
      def += ` NOT NULL`;
    }
    return def;
  });

  sql += `CREATE TABLE IF NOT EXISTS public."${tableName}" (\n${colDefs.join(',\n')}\n);\n\n`;
}

// Constraints for baseline tables only
for (const con of prodSchema.constraints) {
  if (tablesInMigrations.has(con.table_name.toLowerCase())) continue;
  if (con.contype === 'p' || con.contype === 'u' || con.contype === 'c') {
    sql += `DO $$ BEGIN\n  ALTER TABLE public."${con.table_name}" ADD CONSTRAINT "${con.conname}" ${con.def};\nEXCEPTION WHEN others THEN NULL;\nEND $$;\n\n`;
  }
}

// Foreign Keys for baseline tables only
for (const con of prodSchema.constraints) {
  if (tablesInMigrations.has(con.table_name.toLowerCase())) continue;
  if (con.contype === 'f') {
    sql += `DO $$ BEGIN\n  ALTER TABLE public."${con.table_name}" ADD CONSTRAINT "${con.conname}" ${con.def};\nEXCEPTION WHEN others THEN NULL;\nEND $$;\n\n`;
  }
}

// Base functions needed by migrations
for (const fn of prodSchema.functions) {
  sql += `DO $$ BEGIN\n  ${fn.def};\nEXCEPTION WHEN others THEN NULL;\nEND $$;\n\n`;
}

// Base triggers for baseline tables only
for (const trg of prodSchema.triggers) {
  sql += `DO $$ BEGIN\n  ${trg.def};\nEXCEPTION WHEN others THEN NULL;\nEND $$;\n\n`;
}

// RLS on baseline tables
for (const tableName of tablesMap.keys()) {
  sql += `ALTER TABLE public."${tableName}" ENABLE ROW LEVEL SECURITY;\n`;
}
sql += `\n`;

// Baseline policies
for (const pol of prodSchema.policies) {
  if (tablesInMigrations.has(pol.tablename.toLowerCase())) continue;
  if (policiesInMigrations.has(pol.policyname)) continue;

  let rolesStr = 'public';
  if (pol.roles) {
    if (Array.isArray(pol.roles)) {
      rolesStr = pol.roles.join(', ');
    } else if (typeof pol.roles === 'string') {
      rolesStr = pol.roles.replace(/^\{|\}$/g, '').split(',').map((s: string) => s.trim()).join(', ');
    }
  }
  if (!rolesStr) rolesStr = 'public';

  const forCmd = pol.cmd && pol.cmd !== 'ALL' ? `FOR ${pol.cmd}` : '';
  const toRoles = `TO ${rolesStr}`;
  const usingClause = pol.qual ? `USING (${pol.qual})` : '';
  const withCheckClause = pol.with_check ? `WITH CHECK (${pol.with_check})` : '';
  sql += `DO $$ BEGIN\n  CREATE POLICY "${pol.policyname}" ON public."${pol.tablename}" ${forCmd} ${toRoles} ${usingClause} ${withCheckClause};\nEXCEPTION WHEN others THEN NULL;\nEND $$;\n\n`;
}

// Indexes on baseline tables only
for (const idx of prodSchema.indexes) {
  if (tablesInMigrations.has(idx.tablename.toLowerCase())) continue;
  let indexSql = idx.indexdef;
  if (!indexSql.includes('IF NOT EXISTS')) {
    indexSql = indexSql.replace(/CREATE (UNIQUE )?INDEX/i, 'CREATE $1INDEX IF NOT EXISTS');
  }
  sql += `DO $$ BEGIN\n  ${indexSql};\nEXCEPTION WHEN others THEN NULL;\nEND $$;\n\n`;
}

// Grants
sql += `
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
`;

fs.writeFileSync('supabase/migrations/20260513182510_remote_schema.sql', sql, 'utf8');
console.log('Successfully wrote isolated baseline supabase/migrations/20260513182510_remote_schema.sql with size:', sql.length);

#!/usr/bin/env node
/**
 * Aplica SQL no projeto Supabase via Management API (quando MCP está read-only).
 * Uso interno — não commitar tokens.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
const projectRef =
  process.env.SUPABASE_PROJECT_REF?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/https?:\/\//, '').split('.')[0];

const sqlFile = process.argv[2];
if (!token || !projectRef || !sqlFile) {
  console.error('Requer SUPABASE_ACCESS_TOKEN, NEXT_PUBLIC_SUPABASE_URL e caminho do .sql');
  process.exit(1);
}

const query = readFileSync(resolve(sqlFile), 'utf8');

const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query }),
});

const body = await res.text();
if (!res.ok) {
  console.error(`HTTP ${res.status}: ${body}`);
  process.exit(1);
}

console.log('OK — SQL aplicado no projeto', projectRef);
if (body && body !== '[]') console.log(body);

#!/usr/bin/env tsx
/**
 * Lê o Protection Bypass for Automation do projeto flowmedix via API Vercel
 * e grava em .env.staging.local (não imprime o secret).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

const PROJECT_ID = 'prj_JQl6DT8ZO9ZS5U605ArlChAWdzXN';
const TEAM_ID = 'team_XIpT0h00cn8EPNIACpffDsff';

function readVercelToken(): string {
  const candidates = [
    join(process.env.APPDATA ?? '', 'com.vercel.cli', 'Data', 'auth.json'),
    join(homedir(), '.local', 'share', 'com.vercel.cli', 'auth.json'),
    join(homedir(), '.config', 'vercel', 'auth.json'),
  ];
  for (const file of candidates) {
    if (!existsSync(file)) continue;
    const parsed = JSON.parse(readFileSync(file, 'utf8')) as { token?: string };
    if (parsed.token?.trim()) return parsed.token.trim();
  }
  throw new Error('Token Vercel não encontrado. Rode: vercel login');
}

async function main() {
  const token = readVercelToken();
  const url = `https://api.vercel.com/v9/projects/${PROJECT_ID}?teamId=${TEAM_ID}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API Vercel ${res.status}: ${body.slice(0, 200)}`);
  }
  let project = (await res.json()) as { protectionBypass?: Record<string, unknown> };
  let secrets = Object.keys(project.protectionBypass ?? {});
  if (secrets.length === 0) {
    console.log('[sync-vercel-protection-bypass] Gerando bypass for Automation via API…');
    const patchUrl = `https://api.vercel.com/v1/projects/flowmedix/protection-bypass?teamId=${TEAM_ID}`;
    const patchRes = await fetch(patchUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        generate: { note: 'AVANT E2E staging (sync script)' },
      }),
    });
    if (!patchRes.ok) {
      const body = await patchRes.text();
      throw new Error(`Falha ao gerar bypass ${patchRes.status}: ${body.slice(0, 300)}`);
    }
    project = (await patchRes.json()) as { protectionBypass?: Record<string, unknown> };
    secrets = Object.keys(project.protectionBypass ?? {});
    if (secrets.length === 0) {
      throw new Error('API não retornou protectionBypass após generate.');
    }
  }
  const secret = secrets[0];
  const envPath = resolve(process.cwd(), '.env.staging.local');
  let content = existsSync(envPath) ? readFileSync(envPath, 'utf8') : '';
  if (/VERCEL_PROTECTION_BYPASS=/.test(content)) {
    content = content.replace(/VERCEL_PROTECTION_BYPASS=.*/m, `VERCEL_PROTECTION_BYPASS=${secret}`);
  } else {
    content += `${content.endsWith('\n') ? '' : '\n'}VERCEL_PROTECTION_BYPASS=${secret}\n`;
  }
  writeFileSync(envPath, content, 'utf8');
  console.log(`[sync-vercel-protection-bypass] OK → .env.staging.local (${secret.length} chars)`);
}

main().catch((err) => {
  console.error('[sync-vercel-protection-bypass]', err instanceof Error ? err.message : err);
  process.exit(1);
});

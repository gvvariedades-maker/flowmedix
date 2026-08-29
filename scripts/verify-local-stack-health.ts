import http from 'node:http';
import { execSync } from 'node:child_process';

interface ServiceCheck {
  name: string;
  url?: string;
  type: 'http' | 'postgres' | 'docker';
  command?: string;
  expectedStatus?: number;
  headers?: Record<string, string>;
}

const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

async function checkHttp(url: string, headers?: Record<string, string>): Promise<{ ok: boolean; status: number; body: string; latencyMs: number }> {
  const start = Date.now();
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: 'GET',
        headers: headers || {}
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          resolve({
            ok: (res.statusCode || 0) >= 200 && (res.statusCode || 0) < 400,
            status: res.statusCode || 0,
            body: body.substring(0, 300),
            latencyMs: Date.now() - start
          });
        });
      }
    );
    req.on('error', (err) => {
      resolve({ ok: false, status: 0, body: err.message, latencyMs: Date.now() - start });
    });
    req.setTimeout(3000, () => {
      req.destroy();
      resolve({ ok: false, status: 408, body: 'Timeout', latencyMs: Date.now() - start });
    });
    req.end();
  });
}

async function main() {
  console.log('================================================================');
  console.log('AVANT — LOTE 7F.1A — SUPABASE LOCAL FULL-STACK HEALTH AUDIT');
  console.log('================================================================\n');

  // 1. Docker Container Health
  console.log('--- 1. DOCKER CONTAINERS HEALTH STATUS ---');
  const dockerPsOut = execSync('docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"', { encoding: 'utf8' });
  console.log(dockerPsOut);

  const containerLines = dockerPsOut.trim().split('\n').slice(1);
  const containerSummary = containerLines.map((line) => {
    const parts = line.split(/\s{2,}/);
    const name = parts[0];
    const status = parts[2] || '';
    const isHealthy = status.includes('(healthy)') || status.startsWith('Up');
    const isRestarting = status.includes('Restarting');
    const isUnhealthy = status.includes('unhealthy');
    return { name, status, isHealthy, isRestarting, isUnhealthy };
  });

  console.log('Active Containers Breakdown:');
  for (const c of containerSummary) {
    const mark = c.isHealthy && !c.isRestarting && !c.isUnhealthy ? 'PASS' : 'FAIL';
    console.log(`  [${mark}] Container: ${c.name} -> ${c.status}`);
  }

  // 2. PostgreSQL Direct Health
  console.log('\n--- 2. POSTGRESQL LOCAL HEALTH (127.0.0.1:54322) ---');
  const pgVersion = execSync('docker exec -i supabase_db_avant psql -U postgres -d postgres -t -c "SELECT version();"', { encoding: 'utf8' }).trim();
  const pgDb = execSync('docker exec -i supabase_db_avant psql -U postgres -d postgres -t -c "SELECT current_database();"', { encoding: 'utf8' }).trim();
  const pgConn = execSync('docker exec -i supabase_db_avant psql -U postgres -d postgres -t -c "SELECT count(*) FROM pg_stat_activity;"', { encoding: 'utf8' }).trim();
  console.log(`  ✓ PostgreSQL Version: ${pgVersion}`);
  console.log(`  ✓ Current Database: ${pgDb}`);
  console.log(`  ✓ Active Connections: ${pgConn}`);
  const pgPass = pgVersion.includes('PostgreSQL 17') && pgDb === 'postgres';
  console.log(`  -> PostgreSQL Direct Status: ${pgPass ? 'PASS' : 'FAIL'}`);

  // 3. API Gateway / Kong
  console.log('\n--- 3. API GATEWAY / KONG (http://127.0.0.1:54321) ---');
  const kongCheck = await checkHttp('http://127.0.0.1:54321/rest/v1/', { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` });
  console.log(`  ✓ Kong Response Status: HTTP ${kongCheck.status} (${kongCheck.latencyMs}ms)`);
  console.log(`  ✓ Kong Route Resolution: ${kongCheck.ok ? 'PASS' : 'FAIL'}`);

  // 4. GoTrue Auth Service
  console.log('\n--- 4. GOTRUE AUTH (http://127.0.0.1:54321/auth/v1/health) ---');
  const authCheck = await checkHttp('http://127.0.0.1:54321/auth/v1/health');
  console.log(`  ✓ GoTrue Health Status: HTTP ${authCheck.status} (${authCheck.latencyMs}ms)`);
  console.log(`  ✓ GoTrue Payload: ${authCheck.body}`);
  console.log(`  ✓ GoTrue Status: ${authCheck.ok ? 'PASS' : 'FAIL'}`);

  // 5. PostgREST Service
  console.log('\n--- 5. POSTGREST (http://127.0.0.1:54321/rest/v1/) ---');
  const restCheck = await checkHttp('http://127.0.0.1:54321/rest/v1/', { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` });
  console.log(`  ✓ PostgREST OpenAPI Spec Status: HTTP ${restCheck.status} (${restCheck.latencyMs}ms)`);
  console.log(`  ✓ PostgREST Status: ${restCheck.ok ? 'PASS' : 'FAIL'}`);

  // 6. Storage API Service
  console.log('\n--- 6. STORAGE API (http://127.0.0.1:54321/storage/v1/status) ---');
  const storageCheck = await checkHttp('http://127.0.0.1:54321/storage/v1/status');
  console.log(`  ✓ Storage Health Status: HTTP ${storageCheck.status} (${storageCheck.latencyMs}ms)`);
  console.log(`  ✓ Storage Payload: ${storageCheck.body}`);
  console.log(`  ✓ Storage Status: ${storageCheck.ok ? 'PASS' : 'FAIL'}`);

  // 7. Mailpit (Inbucket) Service
  console.log('\n--- 7. MAILPIT / INBUCKET (http://127.0.0.1:54324) ---');
  const mailCheck = await checkHttp('http://127.0.0.1:54324/api/v1/info');
  console.log(`  ✓ Mailpit API Status: HTTP ${mailCheck.status} (${mailCheck.latencyMs}ms)`);
  console.log(`  ✓ Mailpit Payload: ${mailCheck.body}`);
  console.log(`  ✓ Mailpit Status: ${mailCheck.ok ? 'PASS' : 'FAIL'}`);

  // 8. Studio Status
  console.log('\n--- 8. STUDIO STATUS ---');
  const studioCheck = await checkHttp('http://127.0.0.1:54323');
  console.log(`  Studio Port (54323) Accessible: ${studioCheck.ok ? 'YES (HTTP ' + studioCheck.status + ')' : 'STOPPED (CLI standalone backend mode)'}`);

  // Summary Verdict
  const allEssentialPass =
    pgPass &&
    kongCheck.ok &&
    authCheck.ok &&
    restCheck.ok &&
    storageCheck.ok &&
    mailCheck.ok &&
    containerSummary.every((c) => c.isHealthy && !c.isRestarting && !c.isUnhealthy);

  console.log('\n================================================================');
  console.log('HEALTH AUDIT VERDICT:');
  console.log(`SUPABASE_LOCAL_STACK_BOOT = ${allEssentialPass ? 'PASS' : 'NOT_PROVEN'}`);
  console.log('================================================================');

  if (!allEssentialPass) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal health check error:', err);
  process.exit(1);
});

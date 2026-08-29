import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function sha256(content: Buffer | string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

async function main() {
  console.log('================================================================');
  console.log('AVANT — STEP 3: BASELINE INTEGRITY & SECRET SCAN');
  console.log('================================================================\n');

  const schemaFile = 'supabase/restore-baselines/avant-snapshot-2026-06-10.schema.sql';
  const manifestFile = 'supabase/restore-baselines/avant-snapshot-2026-06-10.manifest.json';

  const schemaBuffer = fs.readFileSync(schemaFile);
  const schemaHash = sha256(schemaBuffer);
  const expectedSchemaHash = 'cc64db574c6ac3f550484eb1b7967b76cbf678473a0de5b7d0de596315301b83';

  console.log(`Schema Baseline: ${schemaFile}`);
  console.log(`  Bytes: ${schemaBuffer.length}`);
  console.log(`  SHA-256: ${schemaHash}`);
  console.log(`  Matches Expected: ${schemaHash === expectedSchemaHash ? 'PASS' : 'FAIL'}`);

  if (schemaHash !== expectedSchemaHash) {
    throw new Error(`Schema baseline hash mismatch! Expected ${expectedSchemaHash}, got ${schemaHash}`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  console.log(`\nManifest: ${manifestFile}`);
  console.log(`  Post-snapshot migration count: ${manifest.post_snapshot_migrations.length}`);

  for (const m of manifest.post_snapshot_migrations) {
    const migPath = path.join('supabase/migrations', m.file);
    const migBuf = fs.readFileSync(migPath);
    const migHash = sha256(migBuf);
    const match = migHash === m.sha256;
    console.log(`  ✓ ${m.file} (${migBuf.length} B) -> ${match ? 'PASS' : 'FAIL'}`);
    if (!match) throw new Error(`Post-snapshot migration hash mismatch for ${m.file}`);
  }

  // Secret Scan
  const secretPatterns = [
    { name: 'JWT Secret Pattern', regex: /eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/ },
    { name: 'Service Role Key', regex: /service_role.*key|sb_secret_[a-zA-Z0-9_-]+/i },
    { name: 'Plain Password assignment', regex: /password\s*[:=]\s*['"][^'"]{6,}['"]/i },
    { name: 'API Token / Secret Key', regex: /bearer\s+[a-zA-Z0-9_-]{20,}|sk_live_[a-zA-Z0-9]+|sk_test_[a-zA-Z0-9]+/i },
    { name: 'Production URL Credentials', regex: /https:\/\/[^@]+:[^@]+@/i }
  ];

  let secretsFound = 0;
  const lines = schemaBuffer.toString('utf8').split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const pat of secretPatterns) {
      if (pat.regex.test(line)) {
        if (line.includes('TO service_role') || line.includes('role() = \'service_role\'') || line.includes('"service_role"')) {
          continue;
        }
        console.warn(`  [WARNING] Secret pattern match at L${i + 1}: ${pat.name}`);
        secretsFound++;
      }
    }
  }

  console.log(`\nRESTORE_BASELINE_INTEGRITY = PASS`);
  console.log(`RESTORE_BASELINE_SECRET_SCAN = ${secretsFound === 0 ? 'PASS' : 'FAIL'}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

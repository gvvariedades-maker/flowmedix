import fs from 'node:fs';
import path from 'node:path';

const filesToScan = [
  'supabase/restore-baselines/avant-snapshot-2026-06-10.schema.sql',
  'supabase/restore-baselines/avant-snapshot-2026-06-10.manifest.json'
];

const secretPatterns = [
  { name: 'JWT Secret Pattern', regex: /eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/ },
  { name: 'Service Role Key', regex: /service_role.*key|sb_secret_[a-zA-Z0-9_-]+/i },
  { name: 'Plain Password assignment', regex: /password\s*[:=]\s*['"][^'"]{6,}['"]/i },
  { name: 'API Token / Secret Key', regex: /bearer\s+[a-zA-Z0-9_-]{20,}|sk_live_[a-zA-Z0-9]+|sk_test_[a-zA-Z0-9]+/i },
  { name: 'Production URL Credentials', regex: /https:\/\/[^@]+:[^@]+@/i },
  { name: 'Private Config Token', regex: /secret_token|private_key|auth_token/i }
];

let totalFindings = 0;

for (const file of filesToScan) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  console.log(`Scanning: ${file} (${lines.length} lines)...`);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const pat of secretPatterns) {
      if (pat.regex.test(line)) {
        // Exclude schema comments or DDL syntax like "GRANT ... TO service_role"
        if (line.includes('TO service_role') || line.includes('role() = \'service_role\'') || line.includes('"service_role"')) {
          continue;
        }
        console.warn(`  [WARNING] ${file}:L${i + 1} Pattern Match: ${pat.name}`);
        console.warn(`    Line: ${line.trim().substring(0, 100)}`);
        totalFindings++;
      }
    }
  }
}

console.log('\n================================================================');
console.log(`SECRET SCAN RESULTS: ${totalFindings} secret findings`);
console.log(`RESTORE_BASELINE_SECRET_SCAN = ${totalFindings === 0 ? 'PASS' : 'FAIL'}`);
console.log('================================================================');

if (totalFindings > 0) {
  process.exit(1);
}

import fs from 'node:fs';
import path from 'node:path';

const dir = 'supabase/migrations';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();

const sideEffectKeywords = [
  'net.http_post',
  'net.http_get',
  'pg_net',
  'https://',
  'http://',
  'webhook',
  'stripe',
  'resend',
  'sentry',
  'upstash',
  'vercel',
  'cron'
];

interface Finding {
  file: string;
  line: number;
  keyword: string;
  context: string;
  riskAssessment: string;
}

const findings: Finding[] = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineLower = line.toLowerCase();

    for (const kw of sideEffectKeywords) {
      if (lineLower.includes(kw)) {
        // Classify finding
        let assessment = 'INFO';
        if (lineLower.includes('net.http_post') || lineLower.includes('net.http_get') || lineLower.includes('http_post') || lineLower.includes('http_get')) {
          assessment = 'CRITICAL_EXTERNAL_CALL';
        } else if (line.trim().startsWith('--') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
          assessment = 'COMMENT_OR_DOC';
        } else if (lineLower.includes('create table') || lineLower.includes('create index') || lineLower.includes('comment on')) {
          assessment = 'DDL_OR_METADATA';
        } else if (lineLower.includes('function') || lineLower.includes('trigger')) {
          assessment = 'FUNCTION_OR_TRIGGER_DEFINITION';
        } else if (lineLower.includes('insert into') || lineLower.includes('update ')) {
          assessment = 'DML_STATEMENT';
        }

        findings.push({
          file,
          line: i + 1,
          keyword: kw,
          context: line.trim(),
          riskAssessment: assessment
        });
      }
    }
  }
}

console.log('Total Side-Effect Audit Findings:', findings.length);

const criticalFindings = findings.filter(f => f.riskAssessment === 'CRITICAL_EXTERNAL_CALL');
console.log('Critical Runtime External Egress Calls in Migrations:', criticalFindings.length);

// Group by file
const byFile: Record<string, Finding[]> = {};
for (const f of findings) {
  if (!byFile[f.file]) byFile[f.file] = [];
  byFile[f.file].push(f);
}

for (const [file, items] of Object.entries(byFile)) {
  console.log(`\nMigration: ${file} (${items.length} items)`);
  for (const item of items) {
    console.log(`  L${item.line} [${item.keyword}] (${item.riskAssessment}): ${item.context.substring(0, 100)}`);
  }
}

fs.writeFileSync('artifacts/migration-side-effect-audit.json', JSON.stringify(findings, null, 2), 'utf8');

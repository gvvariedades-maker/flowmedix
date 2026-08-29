import fs from 'node:fs';
import path from 'node:path';

const dir = 'supabase/migrations';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
const snapshotTimestamp = '20260610181305';

const preSnapshot: string[] = [];
const postSnapshot: string[] = [];

for (const f of files) {
  const match = f.match(/^(\d+)_/);
  if (match) {
    const ts = match[1];
    if (ts <= snapshotTimestamp) {
      preSnapshot.push(f);
    } else {
      postSnapshot.push(f);
    }
  }
}

console.log('Pre-snapshot migrations count:', preSnapshot.length);
console.log('Post-snapshot migrations count:', postSnapshot.length);
console.log('\nPost-snapshot migrations list:');
postSnapshot.forEach((f, idx) => console.log(`  ${idx + 1}. ${f}`));

fs.writeFileSync(
  'artifacts/post-snapshot-migrations.json',
  JSON.stringify({ preSnapshotCount: preSnapshot.length, postSnapshotCount: postSnapshot.length, postSnapshot }, null, 2),
  'utf8'
);

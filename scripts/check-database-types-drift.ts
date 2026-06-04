/**
 * Compara types gerados pelo Supabase CLI com snapshot versionado.
 *
 * Uso local / trimestral (requer `supabase link`):
 *   npm run check:db-types              # diff vs types/database.supabase.snapshot.ts
 *   npm run check:db-types -- --update  # regenera snapshot após migration
 *
 * types/database.ts permanece hand-curated; este check cobre drift do schema remoto.
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const SNAPSHOT = join(ROOT, 'types/database.supabase.snapshot.ts');
const GENERATED = join(ROOT, 'types/.database.supabase.generated.tmp.ts');

function normalize(source: string): string {
  return source.replace(/\r\n/g, '\n').trimEnd();
}

function generateLinkedTypes(): string {
  try {
    const out = execSync('npx supabase gen types typescript --linked', {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return normalize(out);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('❌ Falha ao gerar types (supabase link necessário):', message);
    process.exit(2);
  }
}

function extractSignatures(source: string): string[] {
  const lines: string[] = [];
  let inFunctions = false;
  for (const line of source.split('\n')) {
    if (line.includes('Functions: {')) inFunctions = true;
    if (inFunctions && /^\s{6}\w/.test(line)) lines.push(line.trim());
    if (inFunctions && line.trim() === '}' && lines.length > 0) break;
  }
  const tables = [...source.matchAll(/^\s{6}(\w+): \{$/gm)].map((m) => m[1]);
  return [...tables.sort(), ...lines.sort()];
}

function main(): void {
  const update = process.argv.includes('--update');

  const fresh = generateLinkedTypes();

  if (update) {
    writeFileSync(SNAPSHOT, `${fresh}\n`, 'utf8');
    console.log(`✅ Snapshot atualizado: ${relativePath(SNAPSHOT)}`);
    return;
  }

  if (!existsSync(SNAPSHOT)) {
    console.error(
      `❌ Snapshot ausente: ${relativePath(SNAPSHOT)}`,
      '\n   Rode: npm run check:db-types -- --update',
    );
    process.exit(1);
  }

  const snapshot = normalize(readFileSync(SNAPSHOT, 'utf8'));

  if (fresh === snapshot) {
    console.log('✅ types/database.supabase.snapshot.ts alinhado ao remoto');
    return;
  }

  writeFileSync(GENERATED, `${fresh}\n`, 'utf8');

  const snapSig = extractSignatures(snapshot);
  const freshSig = extractSignatures(fresh);
  const added = freshSig.filter((s) => !snapSig.includes(s));
  const removed = snapSig.filter((s) => !freshSig.includes(s));

  console.error('❌ Drift entre schema remoto e snapshot de types\n');
  if (added.length) {
    console.error('  Adicionado no remoto:');
    for (const s of added.slice(0, 20)) console.error(`    + ${s}`);
    if (added.length > 20) console.error(`    … +${added.length - 20} itens`);
  }
  if (removed.length) {
    console.error('  Removido do remoto:');
    for (const s of removed.slice(0, 20)) console.error(`    - ${s}`);
    if (removed.length > 20) console.error(`    … -${removed.length - 20} itens`);
  }
  console.error(`\n  Diff completo: diff ${relativePath(SNAPSHOT)} ${relativePath(GENERATED)}`);
  console.error('  Atualizar snapshot: npm run check:db-types -- --update');
  process.exit(1);
}

function relativePath(abs: string): string {
  return abs.replace(/\\/g, '/').replace(`${ROOT.replace(/\\/g, '/')}/`, '');
}

main();
